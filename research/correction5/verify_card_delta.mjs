// Correction 5 evidence tooling — read-only.
//
// Recomputes the ten saved UFC 330 matchups under two data trees and prints the
// per-matchup probability delta in percentage points. Writes nothing.
//
//   node research/correction5/verify_card_delta.mjs <baseline-tree> <corrected-tree>
//
// A "tree" is any directory holding a checkout's src/. Model code is imported
// from the CORRECTED tree in both passes, so the only thing that varies is the
// generated data. DAYS_SINCE_LAST derives from Date.now() at module scope, so
// both passes must run on the same day — which is why this is one process.
//
// The src/ modules use extension-less relative imports (Vite resolves them in
// the app and in Vitest). Plain Node does not, so a resolver hook is registered
// below. Nothing is evaluated but the project's own ES modules.

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        try { return await next(specifier, context); }
        catch (err) {
          for (const suffix of ['.js', '.jsx', '/index.js', '/index.jsx']) {
            try { return await next(specifier + suffix, context); } catch {}
          }
          throw err;
        }
      }
    `),
  import.meta.url,
);

const [baselineRoot, correctedRoot] = process.argv.slice(2).map((p) => path.resolve(p));
if (!baselineRoot || !correctedRoot) {
  console.error('usage: verify_card_delta.mjs <baseline-tree> <corrected-tree>');
  process.exit(2);
}

const probe = async (root) => {
  const load = (p) => import(pathToFileURL(path.join(root, p)).href);
  const { FIGHTERS } = await load('src/domain/fighters/index.js');
  const { computeMatchupEdges } = await load('src/domain/model/index.js');
  const { UPCOMING_ENTRIES } = await load('src/upcomingData.js');
  const out = {};
  for (const e of UPCOMING_ENTRIES) {
    if (e.eventName !== 'UFC 330') continue;
    const fA = FIGHTERS.find((f) => f.FIGHTER === e.fighterA);
    const fB = FIGHTERS.find((f) => f.FIGHTER === e.fighterB);
    if (!fA || !fB) throw new Error(`missing fighter for ${e.fighterA} vs ${e.fighterB}`);
    const r = computeMatchupEdges(fA, fB, { eventDate: e.eventDate });
    out[`${e.fighterA} vs ${e.fighterB}`] = { pA: r.pA, v2pA: r.v2pA };
  }
  return out;
};

// Each tree is loaded in its own child realm so the two rosters cannot share a
// module cache: same specifier, different file URL, so Node keys them apart.
const before = await probe(baselineRoot);
const after = await probe(correctedRoot);

const rows = Object.keys(before).map((k) => ({
  matchup: k,
  v1DeltaPP: (after[k].pA - before[k].pA) * 100,
  v2DeltaPP: (after[k].v2pA - before[k].v2pA) * 100,
}));
console.log(JSON.stringify({ before, after, rows }, null, 1));
