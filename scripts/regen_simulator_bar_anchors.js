// Regenerates V1_BAR_ANCHOR and V2_BAR_ANCHOR, the two constants that scale
// the Simulator's unified contribution-panel bars (App.js, search
// "V1_BAR_ANCHOR"). This repo has been burned twice by unreproducible magic
// numbers with no committed generator (BASELINE_NOTES.md: the original
// base-composite generator and the 61.1% baseline are both gone) -- this
// script exists so that never happens a third time.
//
// What an anchor is: each of the panel's 6 domain bars maps a raw
// contribution value to a 5-95% fill via
//   bar% = 50 + sign(value) * min(1, |value| / anchor) * 45
// The anchor is the 99th percentile of |contribution|, POOLED across all 6
// domains (not per-domain -- pooling preserves the fact that some domains
// structurally carry more weight than others), computed over every
// same-division real fighter pair, restricted to pairs where BOTH fighters
// have CREDIBILITY >= 50 (excludes low-sample/debut pairs, which were
// found to dominate the unrestricted max/p99 in 5 of 6 domains without
// materially moving p99 itself -- see the credibility-filter check this
// script also prints).
//
// v1's contribution value is edge.weighted (App.js mkEdge, = clamp(raw) *
// domain weight) -- already computed for every domain by
// computeMatchupEdges. v2's is the domain-summed per-feature contribution
// from computeLogisticProb's `contributions` field, grouped via
// SIMULATOR_DOMAIN_MAP (App.js) -- the same object the UI uses, imported
// live from source here, not duplicated.
//
// Run from repo root: node scripts/regen_simulator_bar_anchors.js
// Requires no dependencies beyond what's already in node_modules
// (@babel/core, babel-preset-react-app -- both devDependencies of this
// project's own build).

const fs = require('fs');
const path = require('path');
const Module = require('module');

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';

const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(REPO_ROOT, 'src');
const APP_JS_PATH = path.join(SRC_DIR, 'App.js');
const babel = require(path.join(REPO_ROOT, 'node_modules/@babel/core'));
const presetReactApp = path.join(REPO_ROOT, 'node_modules/babel-preset-react-app');

function transpile(source, filename) {
  return babel.transform(source, {
    filename,
    presets: [presetReactApp],
    babelrc: false,
    configFile: false,
  }).code;
}

// Nested requires from the transpiled App.js (fightersData.js etc) need the
// same JSX/ESM transpile.
const origJsExt = Module._extensions['.js'];
Module._extensions['.js'] = function (mod, filename) {
  if (filename.startsWith(SRC_DIR) && filename !== APP_JS_PATH) {
    const src = fs.readFileSync(filename, 'utf8');
    mod._compile(transpile(src, filename), filename);
  } else {
    origJsExt(mod, filename);
  }
};

const appSrc = fs.readFileSync(APP_JS_PATH, 'utf8');
const rewritten = appSrc.replace(/from '\.\//g, `from '${SRC_DIR}/`);
const appended =
  rewritten +
  `
module.exports.__internals = {
  computeMatchupEdges: typeof computeMatchupEdges !== 'undefined' ? computeMatchupEdges : undefined,
  FIGHTERS: typeof FIGHTERS !== 'undefined' ? FIGHTERS : undefined,
  SIMULATOR_DOMAIN_MAP: typeof SIMULATOR_DOMAIN_MAP !== 'undefined' ? SIMULATOR_DOMAIN_MAP : undefined,
};
`;
const code = transpile(appended, APP_JS_PATH);

const realConsoleLog = console.log;
const realConsoleAssert = console.assert;
console.log = () => {}; // silence computeMatchupEdges' per-call debug log
console.assert = () => {};

const appModule = new Module(APP_JS_PATH, module);
appModule.filename = APP_JS_PATH;
appModule.paths = Module._nodeModulePaths(SRC_DIR);
appModule._compile(code, APP_JS_PATH);

console.log = realConsoleLog;
console.assert = realConsoleAssert;

const { computeMatchupEdges, FIGHTERS, SIMULATOR_DOMAIN_MAP } = appModule.exports.__internals;
if (!computeMatchupEdges || !FIGHTERS || !SIMULATOR_DOMAIN_MAP) {
  throw new Error(
    'Could not extract computeMatchupEdges/FIGHTERS/SIMULATOR_DOMAIN_MAP from src/App.js -- ' +
      'one of these was renamed or removed. Update the __internals export list above to match.'
  );
}

const DOMAIN_KEYS = Object.keys(SIMULATOR_DOMAIN_MAP);
const CRED_FLOOR = 50;

const byDivision = new Map();
for (const f of FIGHTERS) {
  if (!f.WEIGHT_CLASS) continue;
  if (!byDivision.has(f.WEIGHT_CLASS)) byDivision.set(f.WEIGHT_CLASS, []);
  byDivision.get(f.WEIGHT_CLASS).push(f);
}

const v1Pooled = [];
const v2Pooled = [];
let nPairsTotal = 0;
let nPairsFiltered = 0;

console.log = () => {}; // computeMatchupEdges logs a [MODEL_V2] line per call
for (const [, fighters] of byDivision.entries()) {
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      nPairsTotal++;
      if ((fighters[i].CREDIBILITY ?? 0) < CRED_FLOOR || (fighters[j].CREDIBILITY ?? 0) < CRED_FLOOR) continue;
      nPairsFiltered++;

      const res = computeMatchupEdges(fighters[i], fighters[j]);

      for (const k of DOMAIN_KEYS) {
        v1Pooled.push(Math.abs(res.edges[k].weighted));
      }

      if (res.v2Contributions) {
        for (const k of DOMAIN_KEYS) {
          const domainV2Features = SIMULATOR_DOMAIN_MAP[k].v2;
          const domainContribution = domainV2Features.reduce(
            (s, feat) => s + (res.v2Contributions[feat] ?? 0),
            0
          );
          v2Pooled.push(Math.abs(domainContribution));
        }
      }
    }
  }
}

console.log = realConsoleLog;

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
}

const v1Anchor = percentile(v1Pooled, 0.99);
const v2Anchor = percentile(v2Pooled, 0.99);

realConsoleLog(`Pairs (all divisions, same-division only): ${nPairsTotal}`);
realConsoleLog(`Pairs after CREDIBILITY >= ${CRED_FLOOR} filter (both fighters): ${nPairsFiltered}`);
realConsoleLog(`Pooled v1 |edge.weighted| observations: ${v1Pooled.length}`);
realConsoleLog(`Pooled v2 |domain contribution| observations: ${v2Pooled.length}`);
realConsoleLog('');
realConsoleLog(`V1_BAR_ANCHOR (pooled p99, credibility-filtered) = ${v1Anchor}`);
realConsoleLog(`V2_BAR_ANCHOR (pooled p99, credibility-filtered) = ${v2Anchor}`);
realConsoleLog('');
realConsoleLog('Paste these two values into App.js as V1_BAR_ANCHOR / V2_BAR_ANCHOR if they drift from the committed constants.');
