#!/usr/bin/env node
// Compute prediction entries from one checkout's src/, with the clock pinned.
//
//   node scripts/integrity/replay_predictions.mjs <checkout-root> <YYYY-MM-DD>
//
// Prints one JSON document: every PENDING Upcoming entry rebuilt through
// buildRoiEntry (the function the app's "Save to Upcoming" calls), plus a fixed
// panel of same-division pairs, each with its full entry. replay_pinned_feed.py
// runs it against the baseline and the candidate checkout and compares.
//
// Reads only; writes nothing. Date, Date.now and Math.random are pinned so the
// entry ids and provenance timestamps are reproducible. C6 is on, as in
// production (see scripts/enter_upcoming.mjs).
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const [root, today] = process.argv.slice(2);
if (!root || !/^\d{4}-\d{2}-\d{2}$/.test(today ?? '')) {
  console.error('usage: replay_predictions.mjs <checkout-root> <YYYY-MM-DD>');
  process.exit(2);
}

const FIXED = Date.parse(`${today}T12:00:00.000Z`);
const RealDate = Date;
globalThis.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [FIXED])); }
  static now() { return FIXED; }
};
let seed = 1;
Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

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
      export async function load(url, ctx, next) {
        const res = await next(url, ctx);
        if (url.includes('/domain/shadow/config.js') && res.source) {
          return { ...res, source: res.source.toString().replaceAll('import.meta.env', 'process.env') };
        }
        return res;
      }
    `),
  import.meta.url
);
process.env.VITE_C6_USER_FACING_ENABLED = 'true';

const src = (p) => pathToFileURL(resolve(root, 'src', p)).href;
const { FIGHTERS } = await import(src('domain/fighters/index.js'));
const { buildRoiEntry } = await import(src('domain/betting/index.js'));
const { UPCOMING_ENTRIES } = await import(src('upcomingData.js'));

const byName = new Map(FIGHTERS.map((f) => [f.FIGHTER, f]));
const out = { today, pending: [], panel: [], fighters: {} };

for (const e of UPCOMING_ENTRIES.filter((u) => !u.actualWinner)) {
  const fA = byName.get(e.fighterA);
  const fB = byName.get(e.fighterB);
  if (!fA || !fB) {
    out.pending.push({ key: `${e.eventName}|${e.fighterA}|${e.fighterB}`, missing: true });
    continue;
  }
  const { provenance, ...boutContext } = e.boutContext ?? {};
  out.pending.push({
    key: `${e.eventName}|${e.fighterA}|${e.fighterB}`,
    entry: buildRoiEntry({
      fA, fB, oddsA: e.oddsA, oddsB: e.oddsB, eventName: e.eventName, eventDate: e.eventDate,
      modelToggle: 'v2', unitsWagered: e.unitsWagered ?? 1,
      boutContext: e.boutContext ? { ...boutContext, provenance } : null,
    }),
  });
}

// Panel: the first 8 fighters (by name) of each roster division, every pair.
const divisions = new Map();
for (const f of [...FIGHTERS].sort((a, b) => a.FIGHTER.localeCompare(b.FIGHTER))) {
  if (!f.WEIGHT_CLASS) continue;
  if (!divisions.has(f.WEIGHT_CLASS)) divisions.set(f.WEIGHT_CLASS, []);
  if (divisions.get(f.WEIGHT_CLASS).length < 8) divisions.get(f.WEIGHT_CLASS).push(f);
}
for (const [division, members] of [...divisions].sort()) {
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      out.panel.push({
        key: `${division}|${members[i].FIGHTER}|${members[j].FIGHTER}`,
        entry: buildRoiEntry({
          fA: members[i], fB: members[j], oddsA: '-110', oddsB: '-110',
          eventName: 'Replay panel', eventDate: today, modelToggle: 'v2', unitsWagered: 1,
          boutContext: null,
        }),
      });
    }
  }
}

// Every model-facing fighter field, so a difference is located, not just seen.
for (const f of FIGHTERS) out.fighters[f.FIGHTER] = f;

process.stdout.write(JSON.stringify(out));
