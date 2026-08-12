// Production-bundle guard: prove the historical rankings artifact is absent
// from EVERY emitted JS asset, not just the main chunk.
//
// Why content markers and not just identifier names: minification renames
// bindings, so grepping for `DIVISION_RANK_HISTORY` alone would pass even if
// the data shipped. Minifiers do preserve string literals, so the markers below
// are DATA. They are derived from the artifacts at run time and cannot go stale.
//
// Choosing markers that actually discriminate took one correction. Raw YYYYMMDD
// snapshot dates are NOT usable: the deprecated v1 engine still ships its own
// legacy src/rankHistory.js, which is keyed by display name but carries the
// same date literals, so every pre-2020 date is present on origin/main too.
// What IS unique to the new history artifact is its key SHAPE --
// `Division\u001fnormalised lower-case name` -- and the normalised lower-case
// fighter keys themselves, which the legacy file never contains.
//
// This is a build-output check, so it deliberately runs after `npm run build`
// rather than inside vitest.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

import { CURRENT_MEDIA_RANKINGS, CURRENT_META_RANKINGS } from '../src/rankingsData.js';
import { DIVISION_RANK_HISTORY } from '../src/rankingsHistoryData.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_DIR = path.join(ROOT, 'build');
const SEP = '\u001f';

const collect = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else out.push(full);
  }
  return out;
};

assert.ok(fs.existsSync(BUILD_DIR), 'build/ does not exist -- run `npm run build` first');
const allAssets = collect(BUILD_DIR);
const jsAssets = allAssets.filter((f) => f.endsWith('.js'));
assert.ok(jsAssets.length > 0, 'no JS assets emitted');

// ── derive history-only markers ─────────────────────────────────────────────
const currentKeys = new Set(
  [...Object.keys(CURRENT_MEDIA_RANKINGS), ...Object.keys(CURRENT_META_RANKINGS)]
    .map((key) => key.slice(key.indexOf(SEP) + 1))
);

const historyOnlyNames = [];
const compositeKeys = [];
for (const key of Object.keys(DIVISION_RANK_HISTORY)) {
  const fighterKey = key.slice(key.indexOf(SEP) + 1);
  // Normalised lower-case, and not someone the current tables already name.
  if (!currentKeys.has(fighterKey) && fighterKey.includes(' ')
      && fighterKey === fighterKey.toLowerCase()) {
    historyOnlyNames.push(fighterKey);
    compositeKeys.push(key);
  }
}

assert.ok(historyOnlyNames.length > 50, 'expected many history-only fighter keys');

// Sample deterministically across the whole set rather than taking the first N.
const sample = (arr, n) => {
  const step = Math.max(1, Math.floor(arr.length / n));
  return arr.filter((_, i) => i % step === 0).slice(0, n);
};
const nameMarkers = sample(historyOnlyNames.sort(), 40);
// The composite `Division\u001fname` key shape exists only in this artifact.
const keyMarkers = sample(compositeKeys.sort(), 40);

// ── scan every emitted JS asset ─────────────────────────────────────────────
const findings = [];
let totalRaw = 0;
let totalGzip = 0;

for (const asset of jsAssets) {
  const source = fs.readFileSync(asset, 'utf8');
  totalRaw += Buffer.byteLength(source);
  totalGzip += zlib.gzipSync(source, { level: 9 }).length;
  const relative = path.relative(ROOT, asset);

  const hitNames = nameMarkers.filter((name) => source.includes(name));
  const hitKeys = keyMarkers.filter((key) => source.includes(key));
  // Unminified identifiers are a cheap extra signal.
  const hitIdents = ['DIVISION_RANK_HISTORY', 'RANKINGS_HISTORY_METADATA']
    .filter((ident) => source.includes(ident));

  if (hitNames.length) {
    findings.push(`${relative}: ${hitNames.length}/${nameMarkers.length} history-only fighter keys present -> ${hitNames.slice(0, 5).join(', ')}`);
  }
  if (hitKeys.length) {
    findings.push(`${relative}: ${hitKeys.length}/${keyMarkers.length} composite history keys present -> ${JSON.stringify(hitKeys.slice(0, 3))}`);
  }
  if (hitIdents.length) {
    findings.push(`${relative}: historical identifier(s) present -> ${hitIdents.join(', ')}`);
  }
}

// The Kaggle cache and raw snapshots are build inputs, never shipped.
for (const asset of allAssets) {
  const name = path.basename(asset);
  if (/kaggle-history|-(media|meta)\.json$/.test(name)) {
    findings.push(`${path.relative(ROOT, asset)}: source data copied into build output`);
  }
}

if (findings.length) {
  console.error('FAIL historical rankings data found in the production build:\n');
  for (const finding of findings) console.error(`  ${finding}`);
  console.error(
    '\nThe history artifact must stay out of the runtime graph. Check that no ' +
    'runtime module imports src/rankingsHistoryData.js or ' +
    'src/domain/rankings/history.js.'
  );
  process.exit(1);
}

// Sanity check the scan itself: the CURRENT data must be present, otherwise the
// markers could be "absent" simply because nothing was searched properly.
const currentSample = [...currentKeys].sort().slice(0, 5);
const bundleText = jsAssets.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const missingCurrent = currentSample.filter((name) => !bundleText.includes(name));
assert.deepEqual(
  missingCurrent, [],
  `Scan is not meaningful: current ranking data missing from the bundle too (${missingCurrent.join(', ')})`
);

const kb = (bytes) => (bytes / 1000).toFixed(2);
console.log(
  `OK bundle: ${jsAssets.length} JS asset(s), ${kb(totalRaw)} kB raw / ` +
    `${kb(totalGzip)} kB gzip. No historical rankings data present ` +
    `(checked ${nameMarkers.length} history-only fighter keys and ` +
    `${keyMarkers.length} composite history keys); current rankings present.`
);
