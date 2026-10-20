#!/usr/bin/env node
// Grade pending Upcoming-tab entries into ROI, from the command line.
//
// Mirrors handleGradeUpcoming/createGradedEntry in App.js: the entry is
// carried across unchanged except for actualWinner/actualFinish, put at the
// top of ROI, and removed from Upcoming -- all in ONE atomic batch, so a grade
// can never strand an entry in both tabs or neither.
//
// Writes to the document store: Supabase when .env.local configures it
// (signed in via `node scripts/fm-store.mjs login`), else the bundled
// src/upcomingData.js + src/roiData.js. --files forces the bundled files.
//
//   node scripts/grade_upcoming.mjs pending [--all] [--files]
//   node scripts/grade_upcoming.mjs apply <results.json> [--dry-run] [--files] [--no-closing]
//   node scripts/grade_upcoming.mjs props [--dry-run] [--files]
//
// apply also settles every PENDING prop pick on a fight it grades, in the same
// batch (src/domain/betting/propSettlement.js). props settles PENDING props on
// fights that are already in ROI -- the catch-up for props left behind.
// A prop the result cannot settle (unknown finish, unknown method) stays
// PENDING and is listed for review.
//
// apply also records each fight's CLOSING ODDS (fightodds.io, Pinnacle first;
// see src/domain/betting/closing.js) on the graded entry as `closing`, for the
// v3 experiment's closing-line-value test. A fetch failure or an unmatched
// fight only warns: the grade still applies, without `closing` for that fight.
// --no-closing skips the fetch.
//
// results.json: [{ "id": "...", "actualWinner": "Exact Fighter Name",
//                  "actualFinish": "KO/TKO" | "SUB" | "DEC" | "" }]
// actualWinner may also be "DRAW" or "NC".

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openStore } from './lib/documentStore.mjs';
import { fetchClosingLines } from './lib/closingOdds.mjs';
import { buildClosingRecord, closingLineValue } from '../src/domain/betting/closing.js';
import { settlePropPick } from '../src/domain/betting/propSettlement.js';

const FINISHES = new Set(['KO/TKO', 'SUB', 'DEC', '']);

const store = await openStore();
const COLLECTIONS = await store.load().catch((e) => { console.error(e.message); process.exit(1); });
const load = (key) => COLLECTIONS[key];

const todayStr = () => new Date().toISOString().slice(0, 10);

function pending({ all }) {
  const today = todayStr();
  const entries = load('upcoming').filter(
    (e) => !e.actualWinner && (all || (e.eventDate && e.eventDate < today))
  );
  process.stdout.write(
    `${JSON.stringify(
      entries.map((e) => ({
        id: e.id,
        eventName: e.eventName,
        eventDate: e.eventDate,
        fighterA: e.fighterA,
        fighterB: e.fighterB,
        division: e.division,
        betAction: e.betAction,
        trackedSide: e.trackedSide,
        predictedWinner: e.predictedWinner,
        predictedProb: e.predictedProb,
        projectedFinish: e.projectedFinish,
        unitsWagered: e.unitsWagered,
        marketOdds: e.marketOdds,
      })),
      null,
      2
    )}\n`
  );
}

// Attach `closing` to graded entries, one aggregator lookup per event.
async function attachClosing(graded) {
  const byEvent = new Map();
  for (const e of graded) {
    const k = `${e.eventName}|${e.eventDate}`;
    if (!byEvent.has(k)) byEvent.set(k, []);
    byEvent.get(k).push(e);
  }
  const capturedAt = new Date().toISOString();
  const out = new Map();
  for (const entries of byEvent.values()) {
    const { eventName, eventDate } = entries[0];
    try {
      const { event, lines, unmatched } = await fetchClosingLines(eventName, eventDate, entries);
      if (!event) { console.warn(`closing odds: no fightodds.io or bestfightodds.com event matches "${eventName}" (${eventDate}) -- none recorded`); continue; }
      for (const [id, line] of lines) out.set(id, buildClosingRecord({ ...line, capturedAt }));
      for (const id of unmatched) {
        const e = entries.find((x) => x.id === id);
        console.warn(`closing odds: no line matched for ${e.fighterA} vs ${e.fighterB} -- none recorded`);
      }
    } catch (err) {
      console.warn(`closing odds: fetch failed for "${eventName}" (${err.message}) -- none recorded`);
    }
  }
  return graded.map((e) => (out.has(e.id) ? { ...e, closing: out.get(e.id) } : e));
}

// A prop belongs to the fight it was saved from (upcomingId; grading keeps the
// id), else to the same event and pairing in either corner order.
const samePair = (p, e) =>
  p.eventName === e.eventName &&
  ((p.fighterA === e.fighterA && p.fighterB === e.fighterB) ||
    (p.fighterA === e.fighterB && p.fighterB === e.fighterA));

// Settle PENDING props against graded fights: { settled: [{ pick, fight,
// result }], unsettled: [{ pick, fight }] }. A prop whose fight is not among
// `fights` is neither.
function settleProps(fights) {
  const settled = [];
  const unsettled = [];
  for (const pick of load('propPicks').filter((p) => p.result === 'PENDING')) {
    const fight = fights.find((e) => e.id === pick.upcomingId) ?? fights.find((e) => samePair(pick, e));
    if (!fight) continue;
    // The pick's side refers to ITS fighterA/B, so settle in its own corner order.
    const result = settlePropPick(pick, fight);
    if (result) settled.push({ pick, fight, result });
    else unsettled.push({ pick, fight });
  }
  return { settled, unsettled };
}

const propOps = (settled) =>
  settled.map(({ pick, result }) => ({ op: 'put', collection: 'propPicks', payload: { ...pick, result } }));

function reportProps({ settled, unsettled }) {
  for (const { pick, fight, result } of settled) {
    console.log(`PROP ${result.padEnd(4)}  ${pick.eventName}  ${pick.label} (${pick.odds}) -> ${fight.actualWinner} (${fight.actualFinish || '?'})`);
  }
  for (const { pick, fight } of unsettled) {
    console.warn(`PROP ????  ${pick.eventName}  ${pick.label} -> ${fight.actualWinner} (${fight.actualFinish || '?'}): cannot settle, left PENDING -- grade it in the app`);
  }
}

async function props({ dryRun }) {
  const outcome = settleProps(load('roi'));
  reportProps(outcome);
  const pendingLeft = load('propPicks').filter((p) => p.result === 'PENDING').length - outcome.settled.length;
  console.log(`\n${outcome.settled.length} prop(s) settled | ${pendingLeft} still PENDING`);
  if (!outcome.settled.length) return;
  if (dryRun) { console.log('\n--dry-run: nothing written'); return; }
  await store.apply(propOps(outcome.settled)).catch((e) => { console.error(`\n${e.message}`); process.exit(1); });
  console.log(`\nSaved to ${store.describeTarget}`);
}

async function apply(resultsPath, { dryRun, closing }) {
  const results = JSON.parse(readFileSync(resolve(process.cwd(), resultsPath), 'utf8'));
  if (!Array.isArray(results)) throw new Error('results file must be a JSON array');

  const upcoming = load('upcoming');
  const roi = load('roi');
  const byId = new Map(upcoming.map((e) => [e.id, e]));
  const roiIds = new Set(roi.map((e) => e.id));

  // Validate the whole batch before touching either file -- a half-applied
  // grade would strand entries in neither tab.
  const graded = [];
  const errors = [];
  for (const r of results) {
    const entry = byId.get(r?.id);
    if (!entry) { errors.push(`id ${r?.id}: not a pending Upcoming entry`); continue; }
    if (roiIds.has(r.id)) { errors.push(`id ${r.id}: already graded in ROI_ENTRIES`); continue; }
    const winner = r.actualWinner;
    const valid = [entry.fighterA, entry.fighterB, 'DRAW', 'NC'];
    if (!valid.includes(winner)) {
      errors.push(`id ${r.id}: actualWinner ${JSON.stringify(winner)} is not one of ${valid.join(' / ')}`);
      continue;
    }
    const finish = r.actualFinish ?? '';
    if (!FINISHES.has(finish)) {
      errors.push(`id ${r.id}: actualFinish ${JSON.stringify(finish)} not in KO/TKO, SUB, DEC, ""`);
      continue;
    }
    graded.push({ ...entry, actualWinner: winner, actualFinish: finish });
  }

  if (errors.length) {
    console.error(`Refusing to write -- ${errors.length} problem(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  if (closing) graded.splice(0, graded.length, ...(await attachClosing(graded)));

  const gradedIds = new Set(graded.map((e) => e.id));
  const nextUpcoming = upcoming.filter((e) => !gradedIds.has(e.id));
  const nextRoi = [...graded, ...roi]; // newest first, same as handleGradeUpcoming
  // Reverse so successive top-inserts leave graded[0] first, matching nextRoi.
  const ops = [...graded].reverse().flatMap((e) => [
    { op: 'delete', collection: 'upcoming', id: e.id },
    { op: 'put', collection: 'roi', payload: e },
  ]);
  const propOutcome = settleProps(graded);
  ops.push(...propOps(propOutcome.settled));

  for (const e of graded) {
    const side = e.trackedSide || e.predictedWinner;
    const hit = e.actualWinner === side ? 'HIT ' : e.actualWinner === 'DRAW' || e.actualWinner === 'NC' ? 'PUSH' : 'MISS';
    const sideAB = side === e.fighterA ? 'A' : side === e.fighterB ? 'B' : null;
    const clv = closingLineValue(e, sideAB, e.marketOdds);
    const close = e.closing
      ? `  close ${e.closing.oddsA}/${e.closing.oddsB} (${e.closing.source}), CLV ${clv == null ? '?' : `${clv >= 0 ? '+' : ''}${(clv * 100).toFixed(1)}%`}`
      : '  no closing line';
    console.log(`${hit}  ${e.eventName}  ${e.fighterA} vs ${e.fighterB} -> ${e.actualWinner} (${e.actualFinish || '?'})  [pick: ${side}, ${e.betAction}]${close}`);
  }
  reportProps(propOutcome);
  console.log(`\n${graded.length} graded | upcoming ${upcoming.length} -> ${nextUpcoming.length} | roi ${roi.length} -> ${nextRoi.length} | ${propOutcome.settled.length} prop(s) settled`);

  if (dryRun) { console.log('\n--dry-run: nothing written'); return; }
  await store.apply(ops).catch((e) => { console.error(`\n${e.message}`); process.exit(1); });
  console.log(`\nSaved to ${store.describeTarget}`);
}

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith('--')));
const args = rest.filter((a) => !a.startsWith('--'));

if (cmd === 'pending') pending({ all: flags.has('--all') });
else if (cmd === 'apply') {
  if (!args[0]) { console.error('usage: grade_upcoming.mjs apply <results.json> [--dry-run] [--no-closing]'); process.exit(1); }
  await apply(args[0], { dryRun: flags.has('--dry-run'), closing: !flags.has('--no-closing') });
} else if (cmd === 'props') await props({ dryRun: flags.has('--dry-run') });
else {
  console.error('usage: grade_upcoming.mjs pending [--all] | apply <results.json> [--dry-run] | props [--dry-run]');
  process.exit(1);
}
