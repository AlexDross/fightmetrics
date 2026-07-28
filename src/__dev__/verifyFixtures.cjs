// Foundation Stage 0 -- fixture verification. DEV ONLY.
//
//   node src/__dev__/verifyFixtures.cjs --candidate <dir> [--reference <dir>]
//   node src/__dev__/verifyFixtures.cjs --write-manifest   # refresh REFERENCE_HASHES.json
//   node src/__dev__/verifyFixtures.cjs                    # check reference self-integrity
//
// Compares the CANONICAL payload of a candidate capture against the approved
// reference. Canonical means: volatile capture metadata removed, then hashed
// with the same stableStringify/hash used in-page.
//
// Two independently captured raw files can never be byte-identical -- captureMs
// and captureIso differ by construction. Byte equality is the wrong test; equal
// canonical payload hashes is the right one.
//
// stableStringify/hash are copied VERBATIM from goldenHarness.js. Change one,
// change both. Removed together with the harness in Stage 4.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const REFERENCE_DIR = path.join(ROOT, 'baseline', 'fixtures');
const MANIFEST = path.join(ROOT, 'baseline', 'REFERENCE_HASHES.json');

const FILES = [
  'characterisation.json',
  'entries.golden.json',
  'fighters.golden.json',
  'model.golden.json',
  'roster.manifest.json',
  'statistics.golden.json',
];

// Volatile by construction -- excluded from the canonical payload everywhere.
const VOLATILE_TOP = ['captureMs', 'captureIso'];

// Fields added to the harness AFTER the approved Stage 0 reference was
// captured. Excluded so an additive improvement does not read as a regression.
// Remove an entry here once the reference is re-initialised with it present.
const POST_REFERENCE_FIELDS = {
  'roster.manifest.json': ['manifestHashVersion', 'historyHashes', 'rosterHistoryHash'],
};

function stableStringify(value) {
  if (value === undefined) return '@undefined';
  if (value === null) return 'null';
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '@NaN';
    if (value === Infinity) return '@Inf';
    if (value === -Infinity) return '@-Inf';
    if (Object.is(value, -0)) return '@-0';
    return String(value);
  }
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// Strip everything that is volatile or post-reference, so what remains is the
// part that MUST be stable across captures.
function canonicalise(name, obj) {
  const c = JSON.parse(JSON.stringify(obj));
  for (const k of VOLATILE_TOP) delete c[k];
  for (const k of POST_REFERENCE_FIELDS[name] || []) delete c[k];

  if (name === 'entries.golden.json' && Array.isArray(c.entryGoldens)) {
    // observedVolatile records the raw id/createdAt/predictionTimestamp on
    // purpose. `canonical` is the part that must not move.
    c.entryGoldens = c.entryGoldens.map((e) => ({
      pair: e.pair, modelToggle: e.modelToggle, canonical: e.canonical, error: e.error,
    }));
  }
  return c;
}

function hashesFor(dir) {
  const out = {};
  for (const f of FILES) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) { out[f] = null; continue; }
    out[f] = hash(stableStringify(canonicalise(f, JSON.parse(fs.readFileSync(p, 'utf8')))));
  }
  return out;
}

function metaFor(dir) {
  const p = path.join(dir, 'roster.manifest.json');
  if (!fs.existsSync(p)) return {};
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return {
    captureIso: j.captureIso,
    captureBase: j.captureBase,
    rosterLength: j.length,
    rosterStableHash: j.rosterStableHash,
    rosterHistoryHash: j.rosterHistoryHash || null,
    manifestHashVersion: j.manifestHashVersion || 1,
  };
}

const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
};

const refDir = arg('--reference') || REFERENCE_DIR;
const candDir = arg('--candidate');

if (argv.includes('--write-manifest')) {
  const payload = {
    note: 'Expected CANONICAL payload hashes of the approved Stage 0 reference. ' +
          'Volatile capture metadata excluded. Regenerate only when the reference itself is re-initialised.',
    generatedAt: new Date().toISOString(),
    reference: metaFor(refDir),
    volatileExcluded: VOLATILE_TOP,
    postReferenceExcluded: POST_REFERENCE_FIELDS,
    hashes: hashesFor(refDir),
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(payload, null, 2));
  console.log('wrote ' + MANIFEST);
  console.log(JSON.stringify(payload.hashes, null, 2));
  process.exit(0);
}

const refHashes = hashesFor(refDir);
const refMeta = metaFor(refDir);

// Reference self-integrity: does the committed manifest still describe the
// committed reference files?
let selfOk = true;
if (fs.existsSync(MANIFEST)) {
  const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  for (const f of FILES) {
    if (m.hashes[f] !== refHashes[f]) {
      selfOk = false;
      console.log('REFERENCE DRIFT  ' + f + '  manifest=' + m.hashes[f] + '  actual=' + refHashes[f]);
    }
  }
  console.log(selfOk
    ? 'reference self-integrity OK (matches REFERENCE_HASHES.json)'
    : 'REFERENCE FILES HAVE CHANGED SINCE THE MANIFEST WAS WRITTEN');
} else {
  console.log('no REFERENCE_HASHES.json yet -- run with --write-manifest');
}

if (!candDir) {
  console.log('\nreference: ' + refDir);
  console.log(JSON.stringify({ meta: refMeta, hashes: refHashes }, null, 2));
  process.exit(selfOk ? 0 : 1);
}

const candHashes = hashesFor(candDir);
const candMeta = metaFor(candDir);

console.log('\nreference : ' + refDir + '  (' + refMeta.captureIso + ')');
console.log('candidate : ' + candDir + '  (' + candMeta.captureIso + ')');
console.log('excluded  : ' + VOLATILE_TOP.join(', ') +
            '; entries.observedVolatile; post-reference fields ' +
            JSON.stringify(POST_REFERENCE_FIELDS) + '\n');

let bad = 0;
let missing = 0;
for (const f of FILES) {
  if (candHashes[f] === null) { missing++; console.log('ABSENT    ' + f); continue; }
  const ok = candHashes[f] === refHashes[f];
  if (!ok) bad++;
  console.log((ok ? 'MATCH     ' : 'MISMATCH  ') + f.padEnd(24) +
              ' ref=' + refHashes[f] + '  cand=' + candHashes[f]);
}

if (candMeta.rosterHistoryHash) {
  console.log('\ncandidate rosterHistoryHash (full fight history): ' + candMeta.rosterHistoryHash);
  console.log('reference predates this field; cross-check with hashFightHistory.cjs instead.');
}

const fail = bad + missing;
console.log('\n' + (fail === 0
  ? 'ALL CANONICAL HASHES MATCH'
  : bad + ' mismatch(es), ' + missing + ' absent'));
process.exit(fail === 0 && selfOk ? 0 : 1);
