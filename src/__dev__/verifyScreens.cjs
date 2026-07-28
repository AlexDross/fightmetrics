// Foundation Stage 0 -- visual baseline integrity. DEV ONLY.
//
//   node src/__dev__/verifyScreens.cjs                      # reference self-check
//   node src/__dev__/verifyScreens.cjs --candidate <dir>    # compare a later capture
//   node src/__dev__/verifyScreens.cjs --write              # (re)write the manifest
//
// The Stage 0 screenshots are COMMITTED at baseline/screenshots-stage0/ and
// checksummed here. An ignored directory that later captures overwrite is not a
// durable baseline, so candidates are written elsewhere and compared to this.
//
// Identical checksums mean pixel-identical. DIFFERING checksums are expected in
// Stage 1b (Tailwind v4 changes rendering) and must be triaged visually -- this
// tool tells you WHICH screens moved, not whether the move is acceptable.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const REF_DIR = path.join(ROOT, 'baseline', 'screenshots-stage0');
const MANIFEST = path.join(ROOT, 'baseline', 'screenshots-stage0.sha256.json');

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

function shotsIn(dir) {
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()) {
    const p = path.join(dir, f);
    out[f] = { sha256: sha(p), bytes: fs.statSync(p).size };
  }
  return out;
}

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };

if (argv.includes('--write')) {
  const shots = shotsIn(REF_DIR);
  const payload = {
    note: 'SHA-256 of each committed Stage 0 screenshot. Stage 1a expects visual ' +
          'parity (checksums should match). Stage 1b expects differences, which must ' +
          'be triaged individually against Tailwind v4 breaking changes.',
    generatedAt: new Date().toISOString(),
    directory: 'baseline/screenshots-stage0',
    count: Object.keys(shots).length,
    totalBytes: Object.values(shots).reduce((a, s) => a + s.bytes, 0),
    shots,
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(payload, null, 2));
  console.log('wrote ' + MANIFEST + '  (' + payload.count + ' shots, ' +
              (payload.totalBytes / 1048576).toFixed(1) + 'MB)');
  process.exit(0);
}

if (!fs.existsSync(MANIFEST)) {
  console.error('no manifest at ' + MANIFEST + ' -- run with --write');
  process.exit(2);
}
const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const candDir = arg('--candidate');
const actual = shotsIn(candDir || REF_DIR);

console.log((candDir ? 'candidate: ' + candDir : 'reference self-check: ' + REF_DIR) + '\n');

let same = 0, diff = 0, absent = 0;
for (const name of Object.keys(m.shots)) {
  const a = actual[name];
  if (!a) { absent++; console.log('ABSENT    ' + name); continue; }
  if (a.sha256 === m.shots[name].sha256) { same++; console.log('IDENTICAL ' + name); }
  else { diff++; console.log('DIFFERS   ' + name + '  (' + m.shots[name].bytes + ' -> ' + a.bytes + ' bytes)'); }
}
const extra = Object.keys(actual).filter((n) => !(n in m.shots));
extra.forEach((n) => console.log('NEW       ' + n));

console.log('\nidentical=' + same + '  differs=' + diff + '  absent=' + absent + '  new=' + extra.length);
process.exit(diff + absent === 0 ? 0 : 1);
