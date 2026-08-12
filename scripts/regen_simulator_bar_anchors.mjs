// Regenerates V1_BAR_ANCHOR and V2_BAR_ANCHOR, the two constants that scale
// the Simulator's unified contribution-panel bars (App.js, search
// "V1_BAR_ANCHOR"). This repo has been burned twice by unreproducible magic
// numbers with no committed generator (BASELINE_NOTES.md: the original
// base-composite generator and the 61.1% baseline are both gone) -- this
// script exists so that never happens a third time.
//
// PORTED FROM scripts/regen_simulator_bar_anchors.js (CommonJS + Babel).
// That version loaded App.js by transpiling it with @babel/core and
// babel-preset-react-app, then scraping module-local bindings out of an
// appended __internals export. Neither package is installed any more -- they
// went with the create-react-app -> Vite migration -- so it throws
// MODULE_NOT_FOUND before computing anything, and did so before this change
// too. The computation below is identical; only the loading strategy differs.
// computeMatchupEdges and FIGHTERS are now imported straight from the domain
// modules they were extracted into, so only SIMULATOR_DOMAIN_MAP still has to
// be read out of App.js -- and it is a plain data literal, so it is sliced by
// brace matching rather than transpiled.
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
// materially moving p99 itself).
//
// v1's contribution value is edge.weighted (mkEdge, = clamp(raw) * domain
// weight) -- already computed for every domain by computeMatchupEdges. v2's is
// the domain-summed per-feature contribution from computeLogisticProb's
// `contributions` field, grouped via SIMULATOR_DOMAIN_MAP (App.js) -- the same
// object the UI uses, read live from source here, not duplicated.
//
// These are DISPLAY SCALING constants only. They do not enter any probability,
// edge, EV, Kelly or saved entry -- a stale anchor makes bars over- or
// under-fill, nothing more.
//
// Run from repo root: node scripts/regen_simulator_bar_anchors.mjs

import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_JS_PATH = path.join(ROOT, 'src', 'App.js');

// src/ uses Vite's extensionless import style ("from '../../fightersData'"),
// which plain Node ESM does not resolve. Rather than rewrite those imports --
// they are not this script's business -- retry a failed specifier with '.js'
// and '/index.js', which is exactly what Vite does. Registered before the
// dynamic imports below so it covers the whole dependency graph.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(spec, ctx, next) {
        try { return await next(spec, ctx); }
        catch (err) {
          for (const ext of ['.js', '/index.js']) {
            try { return await next(spec + ext, ctx); } catch {}
          }
          throw err;
        }
      }
    `),
  import.meta.url,
);

const { FIGHTERS } = await import('../src/domain/fighters/index.js');
const { computeMatchupEdges } = await import('../src/domain/model/index.js');

// SIMULATOR_DOMAIN_MAP is a pure object literal in App.js. Slice it out by
// brace matching so this script keeps reading the SAME grouping the UI renders,
// instead of a copy that could drift away from it.
function readDomainMap() {
  const src = fs.readFileSync(APP_JS_PATH, 'utf8');
  const decl = src.indexOf('const SIMULATOR_DOMAIN_MAP = {');
  if (decl < 0) {
    throw new Error(
      'Could not find SIMULATOR_DOMAIN_MAP in src/App.js -- it was renamed or removed.',
    );
  }
  const open = src.indexOf('{', decl);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return (0, eval)(`(${src.slice(open, i + 1)})`);
    }
  }
  throw new Error('Unbalanced braces while extracting SIMULATOR_DOMAIN_MAP.');
}

const SIMULATOR_DOMAIN_MAP = readDomainMap();
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

const realConsoleLog = console.log;
console.log = () => {}; // computeMatchupEdges logs a [MODEL_V2] line per call
for (const [, fighters] of byDivision) {
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      nPairsTotal++;
      if (
        (fighters[i].CREDIBILITY ?? 0) < CRED_FLOOR ||
        (fighters[j].CREDIBILITY ?? 0) < CRED_FLOOR
      ) continue;
      nPairsFiltered++;

      // No eventDate: anchors describe the CURRENT roster, and FIGHTERS[].AGE
      // is already DOB-derived as of app load. Pinning a bout date here would
      // scale the panel to one arbitrary card.
      const res = computeMatchupEdges(fighters[i], fighters[j]);

      for (const k of DOMAIN_KEYS) v1Pooled.push(Math.abs(res.edges[k].weighted));

      if (res.v2Contributions) {
        for (const k of DOMAIN_KEYS) {
          const domainContribution = SIMULATOR_DOMAIN_MAP[k].v2.reduce(
            (s, feat) => s + (res.v2Contributions[feat] ?? 0),
            0,
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

console.log(`Pairs (all divisions, same-division only): ${nPairsTotal}`);
console.log(`Pairs after CREDIBILITY >= ${CRED_FLOOR} filter (both fighters): ${nPairsFiltered}`);
console.log(`Pooled v1 |edge.weighted| observations: ${v1Pooled.length}`);
console.log(`Pooled v2 |domain contribution| observations: ${v2Pooled.length}`);
console.log('');
console.log(`V1_BAR_ANCHOR (pooled p99, credibility-filtered) = ${v1Anchor}`);
console.log(`V2_BAR_ANCHOR (pooled p99, credibility-filtered) = ${v2Anchor}`);
console.log('');
console.log('Paste these two values into App.js as V1_BAR_ANCHOR / V2_BAR_ANCHOR if they drift from the committed constants.');
