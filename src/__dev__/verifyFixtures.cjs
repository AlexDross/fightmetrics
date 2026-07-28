// Foundation Stage 0 -- fixture integrity check. DEV ONLY.
//   node src/__dev__/verifyFixtures.cjs
// Recomputes hashes over the committed fixtures so a browser-side capture can
// be compared without transferring megabytes. stableStringify/hash are copied
// VERBATIM from goldenHarness.js -- if you change one, change both.
// Removed together with the harness in Stage 4.
const fs = require('fs');
const path = require('path');

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

const DIR = path.join(__dirname, '..', '..', 'baseline', 'fixtures');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));

const roster = read('roster.manifest.json');
const model = read('model.golden.json');
const entries = read('entries.golden.json');
const stats = read('statistics.golden.json');

const out = {
  modelGoldensHash: hash(stableStringify(model.modelGoldens)),
  symmetryHash: hash(stableStringify(model.symmetry)),
  statisticsHash: hash(stableStringify(stats.statistics)),
  rosterStableHash: roster.rosterStableHash,
  identityKeysHash: hash(stableStringify(roster.identityKeys)),
  entriesCanonicalHash: hash(stableStringify(
    entries.entryGoldens.map((e) => ({ pair: e.pair, modelToggle: e.modelToggle, canonical: e.canonical }))
  )),
};

console.log(JSON.stringify(out, null, 2));

const expected = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : null;
if (expected) {
  let bad = 0;
  for (const k of Object.keys(out)) {
    const ok = out[k] === expected[k];
    if (!ok) bad++;
    console.log((ok ? 'MATCH   ' : 'MISMATCH') + '  ' + k + '  disk=' + out[k] + '  browser=' + expected[k]);
  }
  console.log(bad === 0 ? '\nALL HASHES MATCH' : '\n' + bad + ' MISMATCH(ES)');
  process.exit(bad === 0 ? 0 : 1);
}
