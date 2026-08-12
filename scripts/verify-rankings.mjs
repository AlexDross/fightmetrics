// Contract checks against BOTH live generated rankings artifacts.
//
// This is a verification script, so it is one of the few places allowed to
// import the history artifact. Runtime code must not.
//
// Kept out of the vitest suite on purpose: src/__tests__/isolation.test.js
// forbids tests importing live data modules, because live data drifts on a
// schedule and would rewrite goldens. This runs in CI and in the rankings
// workflow instead.
import assert from 'node:assert/strict';

import {
  CURRENT_MEDIA_P4P,
  CURRENT_MEDIA_RANKINGS,
  CURRENT_META_RANKINGS,
  RANKINGS_METADATA,
} from '../src/rankingsData.js';
import * as currentModule from '../src/rankingsData.js';
import {
  DIVISION_RANK_HISTORY,
  RANKINGS_HISTORY_METADATA,
} from '../src/rankingsHistoryData.js';
import { _D2 } from '../src/fightersData.js';
import {
  getCurrentP4PRanking,
  getCurrentRanking,
  isChampionRecord,
  listCurrentRankingAmbiguities,
  resolveCurrentRanking,
} from '../src/domain/rankings/current.js';
import { getHistoricalRank } from '../src/domain/rankings/history.js';

const CUTOFF = 20260618;

// ── artifact shape ──────────────────────────────────────────────────────────
assert.equal(RANKINGS_METADATA.schemaVersion, 4);
assert.equal(RANKINGS_METADATA.primarySource, 'media');
assert.equal(Object.keys(CURRENT_MEDIA_RANKINGS).length, 176);
assert.equal(Object.keys(CURRENT_META_RANKINGS).length, 176);
assert.equal(Object.keys(CURRENT_MEDIA_P4P).length, 30);

assert.equal(RANKINGS_HISTORY_METADATA.schemaVersion, 4);
assert.ok(Object.keys(DIVISION_RANK_HISTORY).length > 700);
assert.ok(RANKINGS_HISTORY_METADATA.history.explicitUnrankedTombstones > 900);
assert.equal(RANKINGS_HISTORY_METADATA.kaggle.historyUsedThrough, '2026-06-18');

// The runtime artifact must carry NO history: that is what keeps ~190 kB out
// of every browser bundle.
for (const symbol of ['DIVISION_RANK_HISTORY', 'RANKINGS_HISTORY_METADATA']) {
  assert.ok(
    !(symbol in currentModule),
    `${symbol} must not be exported from the runtime artifact src/rankingsData.js.`
  );
}
assert.ok(
  !('history' in RANKINGS_METADATA),
  'RANKINGS_METADATA must not carry history statistics in the runtime artifact.'
);

// No permanently-empty exports: UFC publishes no Meta P4P board.
assert.ok(
  !('CURRENT_META_P4P' in currentModule),
  'CURRENT_META_P4P must not be exported while UFC publishes no Meta P4P table.'
);

// ── history integrity ───────────────────────────────────────────────────────
let tombstones = 0;
for (const [key, entries] of Object.entries(DIVISION_RANK_HISTORY)) {
  assert.ok(entries.length > 0, `empty series ${key}`);
  assert.notEqual(entries[0][1], null, `series opens with a tombstone: ${key}`);
  let previous = 0;
  for (const [date, rank] of entries) {
    assert.ok(date > previous, `non-monotonic date in ${key} at ${date}`);
    previous = date;
    if (rank === null) { tombstones += 1; continue; }
    assert.ok(
      Number.isInteger(rank) && rank >= 0 && rank <= 15,
      `rank ${rank} outside 0..15 in ${key} at ${date}`
    );
  }
}
assert.equal(tombstones, RANKINGS_HISTORY_METADATA.history.explicitUnrankedTombstones);

// Retired divisions must not leave anyone ranked forever.
for (const division of RANKINGS_HISTORY_METADATA.history.retiredDivisions) {
  for (const [key, entries] of Object.entries(DIVISION_RANK_HISTORY)) {
    if (!key.startsWith(`${division}\u001f`)) continue;
    assert.equal(
      entries[entries.length - 1][1], null,
      `retired division ${division} left ${key} ranked`
    );
  }
}

// Kaggle-era rows must not have leaked past the reviewed cutoff except through
// source-labelled official media snapshots.
const officialDates = new Set([
  Number(RANKINGS_HISTORY_METADATA.officialUfc.mediaSnapshot.replaceAll('-', '')),
]);
for (const [key, entries] of Object.entries(DIVISION_RANK_HISTORY)) {
  for (const [date] of entries) {
    assert.ok(
      date <= CUTOFF || officialDates.has(date),
      `${key} has post-cutoff date ${date} from no known media snapshot`
    );
  }
}

// ── point-in-time behaviour ─────────────────────────────────────────────────
assert.equal(
  getHistoricalRank('TJ Grant', '2026-08-01', 'Lightweight'),
  null,
  'A departed fighter must not retain the last known rank forever.'
);
assert.equal(
  getHistoricalRank('Amanda Ribas', '2022-07-18', "Women's Strawweight")?.rank,
  10
);
assert.equal(
  getHistoricalRank('Amanda Nunes', '2026-08-01', "Women's Featherweight"),
  null,
  'A retired division must not leave its last champion ranked forever.'
);

// ── current rankings ────────────────────────────────────────────────────────
assert.equal(getCurrentRanking('Quillan Salkilld', 'Lightweight')?.rank, 12);
assert.equal(getCurrentRanking('Jan Blachowicz', 'Light Heavyweight')?.rank, 9);
assert.equal(getCurrentRanking('Michael Page', 'Welterweight')?.rank, 14);
assert.equal(getCurrentRanking('Michael Page', 'Lightweight'), null);
assert.equal(getCurrentRanking("Lone'er Kavanagh", 'Flyweight')?.rank, 6);
assert.ok(getCurrentP4PRanking('Islam Makhachev'));

const ambiguities = listCurrentRankingAmbiguities();
assert.deepEqual(
  ambiguities, [],
  `Ambiguous current rankings need review: ${JSON.stringify(ambiguities)}`
);

// ── roster join coverage ────────────────────────────────────────────────────
// Every official slot must be reachable from the roster exactly once, either
// in its own division or as an explicit cross-division badge.
const rosterByKey = new Map();
for (const fighter of _D2) {
  const resolved = resolveCurrentRanking(fighter.n, fighter.w);
  if (!resolved) continue;
  const key = `${resolved.division}\u001f${resolved.rank}`;
  rosterByKey.set(key, [...(rosterByKey.get(key) ?? []), fighter.n]);
}

const slots = Object.values(CURRENT_MEDIA_RANKINGS);
const unmatched = [];
const crossDivision = [];
for (const slot of slots) {
  const holders = rosterByKey.get(`${slot.division}\u001f${slot.rank}`) ?? [];
  if (holders.length === 0) unmatched.push(`${slot.division} #${slot.rank} ${slot.displayName}`);
}
for (const fighter of _D2) {
  const resolved = resolveCurrentRanking(fighter.n, fighter.w);
  if (resolved?.crossDivision) {
    crossDivision.push(`${fighter.n}: roster ${fighter.w} -> ${resolved.division} #${resolved.rank} (${resolved.divisionLabel})`);
  }
}

assert.equal(
  unmatched.length, 0,
  `Official ranking slots with no roster match:\n  ${unmatched.join('\n  ')}`
);

const champions = slots.filter(isChampionRecord).length;
assert.equal(champions, 11, 'Expected one champion per active division');

console.log(
  `OK rankings: Kaggle v${RANKINGS_HISTORY_METADATA.kaggle.version} through ` +
    `${RANKINGS_HISTORY_METADATA.kaggle.historyUsedThrough}, ` +
    `${slots.length} media slots (all joined), ${champions} champions | ` +
    `history (not bundled): ` +
    `${RANKINGS_HISTORY_METADATA.history.transitions} transitions, ` +
    `${tombstones} tombstones`
);
console.log(`Cross-division badges (${crossDivision.length}):`);
for (const line of crossDivision) console.log(`  ${line}`);
