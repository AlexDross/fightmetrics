// Proves computeLogisticProb's contribution-capturing implementation
// (App.js, search "[MODEL-ADJACENT]") produces bit-identical pA/pB to a
// plain-reduce implementation, over every real same-division fighter pair.
// This is the durable version of a proof that was previously only run in a
// throwaway session -- committed here so the claim in App.js's comment
// ("proven across 280,552 real pairs, 0 mismatches") is something anyone
// can rerun, not something to take on faith.
//
// Run from repo root: node scripts/verify_v2_contribution_bitproof.js

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
  MODEL_V2: typeof MODEL_V2 !== 'undefined' ? MODEL_V2 : undefined,
};
`;
const code = transpile(appended, APP_JS_PATH);

const realConsoleLog = console.log;
const realConsoleAssert = console.assert;
console.log = () => {};
console.assert = () => {};

const appModule = new Module(APP_JS_PATH, module);
appModule.filename = APP_JS_PATH;
appModule.paths = Module._nodeModulePaths(SRC_DIR);
appModule._compile(code, APP_JS_PATH);

console.log = realConsoleLog;
console.assert = realConsoleAssert;

const { computeMatchupEdges, FIGHTERS, MODEL_V2 } = appModule.exports.__internals;
if (!computeMatchupEdges || !FIGHTERS || !MODEL_V2) {
  throw new Error('Could not extract computeMatchupEdges/FIGHTERS/MODEL_V2 from src/App.js.');
}

// The OLD implementation, kept only here as the comparison baseline --
// deliberately NOT the live App.js code, so this script keeps proving
// something even after the live code has long since moved on.
function oldComputeLogisticProb(featsV2) {
  const logit = MODEL_V2.features.reduce(
    (sum, k) => sum + (featsV2[k] / MODEL_V2.scales[k]) * MODEL_V2.coef[k],
    0
  );
  const pA = 1 / (1 + Math.exp(-logit));
  return { pA, pB: 1 - pA };
}

const byDivision = new Map();
for (const f of FIGHTERS) {
  if (!f.WEIGHT_CLASS) continue;
  if (!byDivision.has(f.WEIGHT_CLASS)) byDivision.set(f.WEIGHT_CLASS, []);
  byDivision.get(f.WEIGHT_CLASS).push(f);
}

let nChecked = 0;
let nExactMatch = 0;
const mismatches = [];

console.log = () => {}; // computeMatchupEdges logs a [MODEL_V2] line per call
for (const [, fighters] of byDivision.entries()) {
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const res = computeMatchupEdges(fighters[i], fighters[j]);
      if (res.featsV2 == null) continue;
      const oldRes = oldComputeLogisticProb(res.featsV2);
      nChecked++;
      // Object.is is exact bit equality, not epsilon-tolerance.
      if (Object.is(oldRes.pA, res.v2pA) && Object.is(oldRes.pB, res.v2pB)) {
        nExactMatch++;
      } else if (mismatches.length < 5) {
        mismatches.push({
          fighters: `${fighters[i].FIGHTER} vs ${fighters[j].FIGHTER}`,
          oldPA: oldRes.pA,
          newPA: res.v2pA,
        });
      }
    }
  }
}
console.log = realConsoleLog;

console.log(`Pairs checked: ${nChecked}`);
console.log(`Exact matches: ${nExactMatch}`);
console.log(`Mismatches: ${nChecked - nExactMatch}`);
if (mismatches.length) console.log(JSON.stringify(mismatches, null, 2));
