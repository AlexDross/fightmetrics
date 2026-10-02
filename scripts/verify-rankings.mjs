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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
import {
  loadMediaSnapshotDates,
  unbackedPostCutoffDates,
  ymd,
} from './lib/rankingsSnapshots.mjs';

const CUTOFF = 20260618;
const SNAPSHOT_DIR = fileURLToPath(new URL('../data/rankings/snapshots/', import.meta.url));

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
// source-labelled official media snapshots. update_rankings.py extends history
// with EVERY committed media snapshot, so every one of their dates is allowed.
const mediaDates = loadMediaSnapshotDates(SNAPSHOT_DIR);
const newestMedia = mediaDates[mediaDates.length - 1];
assert.equal(
  ymd(RANKINGS_HISTORY_METADATA.officialUfc.mediaSnapshot), newestMedia,
  'History artifact is not built from the newest committed media snapshot'
);
assert.equal(
  ymd(RANKINGS_METADATA.officialUfc.mediaSnapshot), newestMedia,
  'Runtime artifact is not built from the newest committed media snapshot'
);
const unbacked = unbackedPostCutoffDates(DIVISION_RANK_HISTORY, CUTOFF, mediaDates);
assert.deepEqual(
  unbacked.slice(0, 10), [],
  `${unbacked.length} post-cutoff history rows from no committed media snapshot ` +
    `(known: ${mediaDates.join(', ')})`
);

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
// Checked against the newest committed media snapshot rather than hard-coded
// ranks: UFC reshuffles the tables weekly, and fixed spot checks (Salkilld #12,
// Page #14, ...) failed the first refresh that moved anyone. Every published
// slot must resolve to its own rank, under the published name and an
// ASCII-apostrophe spelling (Lone’er / Lone'er), and to nothing in a division
// where that fighter holds no slot.
const newestMediaSnapshot = JSON.parse(
  fs.readFileSync(path.join(SNAPSHOT_DIR, `${RANKINGS_METADATA.officialUfc.mediaSnapshot}-media.json`), 'utf8')
);
const asciiName = (name) => name.replace(/[\u2018\u2019\u02bc]/g, "'");
const slotsByName = new Map();
for (const [division, table] of Object.entries(newestMediaSnapshot.divisions)) {
  for (const record of [...table.champions, ...table.contenders]) {
    slotsByName.set(record.displayName, [...(slotsByName.get(record.displayName) ?? []), division]);
    for (const name of new Set([record.displayName, asciiName(record.displayName)])) {
      assert.equal(
        getCurrentRanking(name, division)?.rank, record.rank,
        `${name} should be ${division} #${record.rank}`
      );
    }
  }
}
const activeDivisions = Object.keys(newestMediaSnapshot.divisions);
for (const [name, divisions] of slotsByName) {
  const elsewhere = activeDivisions.find((division) => !divisions.includes(division));
  assert.equal(getCurrentRanking(name, elsewhere), null, `${name} must not be ranked in ${elsewhere}`);
}
for (const table of Object.values(newestMediaSnapshot.poundForPound)) {
  for (const record of table) {
    assert.ok(getCurrentP4PRanking(record.displayName), `${record.displayName} missing from P4P`);
  }
}

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
