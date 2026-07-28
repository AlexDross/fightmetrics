// Foundation Stage 0 -- full fight-history integrity hashes. DEV ONLY.
//
//   node src/__dev__/hashFightHistory.cjs            # verify against committed
//   node src/__dev__/hashFightHistory.cjs --write    # (re)write the manifest
//
// WHY THIS EXISTS
// The roster manifest summarises each fighter's FIGHT_HISTORY as
// {length, first, last}, which cannot detect a change to a MIDDLE bout. This
// script hashes every fighter's COMPLETE history, without storing the history,
// so any edit anywhere in the record changes a hash.
//
// It reads src/fightHistory.js DIRECTLY. It does not depend on a browser, on
// the dev bridge, or on any capture generation -- so it protects the goldens
// without requiring them to be recaptured, and it keeps working after the
// Stage 4 harness removal if you choose to keep it.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src', 'fightHistory.js');
const OUT = path.join(ROOT, 'baseline', 'fixtures', 'fightHistory.hashes.json');

// Same stableStringify/hash as goldenHarness.js.
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

// Verbatim from App.js:3491. The app attaches
//   sortHistoryDesc(FIGHT_HISTORY[d.n] ?? [])
// so the ATTACHED value is the sorted one. Copy the sort rather than assuming
// the source file is already ordered.
function sortHistoryDesc(history) {
  return [...(history || [])].sort((a, b) => {
    const aTime = a && a.dt ? new Date(a.dt).getTime() : 0;
    const bTime = b && b.dt ? new Date(b.dt).getTime() : 0;
    return bTime - aTime;
  });
}

// src/fightHistory.js is `export const FIGHT_HISTORY = { ...JSON... };`.
// The package has no "type": "module", so Node would treat the .js as CJS and
// choke on the export. Parse the literal instead of importing it.
function loadFightHistory() {
  const text = fs.readFileSync(SRC, 'utf8');
  const eq = text.indexOf('=');
  if (eq < 0) throw new Error('unexpected shape: no assignment in ' + SRC);
  let body = text.slice(eq + 1).trim();
  if (body.endsWith(';')) body = body.slice(0, -1);
  return JSON.parse(body);
}

const fh = loadFightHistory();
const names = Object.keys(fh).sort();

const perFighter = {};
let bouts = 0;
for (const n of names) {
  const h = fh[n] || [];
  bouts += h.length;
  perFighter[n] = { n: h.length, h: hash(stableStringify(h)) };
}

// --- EXPECTED ATTACHED-HISTORY HASHES (the join proof) ----------------------
// Source integrity alone does not prove that the assembled FIGHTERS collection
// still attaches each history to the RIGHT fighter -- exactly the failure mode
// Stage 3's extraction could introduce. Derive what the in-browser
// `historyHashes` array MUST be, from committed inputs only:
//
//   identityKeys  <- baseline/fixtures/roster.manifest.json (roster order, = d.n)
//   FIGHT_HISTORY <- src/fightHistory.js
//   sortHistoryDesc, stableStringify, hash <- copied verbatim from the app
//
// A mis-join moves the hash at that fighter's index, so rosterHistoryHash moves.
const ROSTER = path.join(ROOT, 'baseline', 'fixtures', 'roster.manifest.json');
let expectedAttachedHashes = null;
let expectedRosterHistoryHash = null;
let rosterIdentityCount = null;
let rosterNamesWithHistory = null;

if (fs.existsSync(ROSTER)) {
  const keys = JSON.parse(fs.readFileSync(ROSTER, 'utf8')).identityKeys || [];
  rosterIdentityCount = keys.length;
  rosterNamesWithHistory = keys.filter((n) => fh[n] && fh[n].length).length;
  expectedAttachedHashes = keys.map((n) => hash(stableStringify(sortHistoryDesc(fh[n] || []))));
  expectedRosterHistoryHash = hash(stableStringify(expectedAttachedHashes));
}

const payload = {
  note: 'Per-fighter hash over the COMPLETE FIGHT_HISTORY value. Detects changes ' +
        'to any bout, including middle records, which the roster manifest summary cannot. ' +
        'Derived directly from src/fightHistory.js; independent of any capture.',
  source: 'src/fightHistory.js',
  sourceBytes: fs.statSync(SRC).size,
  fighters: names.length,
  bouts,
  aggregateHash: hash(stableStringify(names.map((n) => perFighter[n].h))),

  joinNote: 'expectedRosterHistoryHash is what the in-browser roster manifest ' +
            'historyHashes/rosterHistoryHash MUST equal. Independently derived here from ' +
            'identityKeys + src/fightHistory.js + sortHistoryDesc -- NOT adopted from a ' +
            'browser capture. verifyFixtures.cjs REQUIRES every candidate to provide and ' +
            'match it. This is the guard against Stage 3 attaching a history to the wrong fighter.',
  rosterIdentityCount,
  rosterNamesWithHistory,
  expectedRosterHistoryHash,
  expectedAttachedHashes,

  perFighter,
};

if (process.argv.includes('--write')) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log('wrote ' + OUT);
  console.log('fighters=' + payload.fighters + ' bouts=' + payload.bouts +
              ' aggregate=' + payload.aggregateHash);
  console.log('expectedRosterHistoryHash=' + payload.expectedRosterHistoryHash +
              ' over ' + payload.rosterIdentityCount + ' roster names (' +
              payload.rosterNamesWithHistory + ' with history)');
  process.exit(0);
}

if (!fs.existsSync(OUT)) {
  console.error('no committed manifest at ' + OUT + ' -- run with --write');
  process.exit(2);
}

const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const added = names.filter((n) => !(n in prev.perFighter));
const removed = Object.keys(prev.perFighter).filter((n) => !(n in perFighter));
const changed = names.filter(
  (n) => n in prev.perFighter && prev.perFighter[n].h !== perFighter[n].h
);

console.log('fighters  : ' + prev.fighters + ' -> ' + payload.fighters);
console.log('bouts     : ' + prev.bouts + ' -> ' + payload.bouts);
console.log('aggregate : ' + prev.aggregateHash + ' -> ' + payload.aggregateHash);
console.log('added     : ' + added.length + (added.length ? ' e.g. ' + added.slice(0, 3).join(', ') : ''));
console.log('removed   : ' + removed.length + (removed.length ? ' e.g. ' + removed.slice(0, 3).join(', ') : ''));
console.log('changed   : ' + changed.length + (changed.length ? ' e.g. ' + changed.slice(0, 3).join(', ') : ''));

const ok = payload.aggregateHash === prev.aggregateHash;
console.log('\n' + (ok ? 'FIGHT HISTORY UNCHANGED' : 'FIGHT HISTORY HAS CHANGED'));
process.exit(ok ? 0 : 1);
