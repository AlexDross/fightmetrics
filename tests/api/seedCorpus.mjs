// Stage 7 Gate 3 — the REAL migrated corpus, built exactly as the contract
// suite builds it.
//
// This is not a fixture. It is the same `migrateV0ToV1` output the in-memory
// repositories are tested against, so `fm_rpc_seed_store` is proven on the
// corpus Postgres will actually hold — 18 events, 178 prediction runs, 273
// prediction snapshots, 182 roots and 167 stored computed-profit rows.
//
// `parlayEntries: []` matches the contract suite: the production parlay lives in
// parlayData.js but the migrated corpus carries none, so migrated parlays are 0.
// That is a harness choice, stated here so the 182 = 178 + 4 + 0 derivation is
// legible rather than looking like data loss.
import { ROI_ENTRIES } from '../../src/roiData.js';
import { UPCOMING_ENTRIES } from '../../src/upcomingData.js';
import { PROP_PICKS } from '../../src/propPicksData.js';
import { migrateV0ToV1 } from '../../src/data/migration/migrateV0ToV1.mjs';

// Fixed deps, so the corpus is byte-identical on every run and in every
// workspace — determinism starts here, not in SQL.
const deps = {
  migratedAt: '2026-07-28T00:00:00.000Z',
  newId: () => '0'.repeat(8) + '-0000-7000-8000-' + '0'.repeat(12),
};

export const { store: SEED_STORE } = migrateV0ToV1(
  { roiEntries: ROI_ENTRIES, upcomingEntries: UPCOMING_ENTRIES,
    propPicks: PROP_PICKS, parlayEntries: [] },
  deps
);

/** Every root the ledger must carry: prediction runs + props + parlays. */
export const ROOT_COUNT =
  SEED_STORE.predictionRuns.length + SEED_STORE.props.length + SEED_STORE.parlays.length;

/** Per-collection row counts, derived from the corpus rather than hard-coded. */
export const CORPUS = {
  events: SEED_STORE.events.length,
  bouts: SEED_STORE.bouts.length,
  predictionRuns: SEED_STORE.predictionRuns.length,
  predictionSnapshots: SEED_STORE.predictionSnapshots.length,
  marketSnapshots: SEED_STORE.marketSnapshots.length,
  bettingAssessments: SEED_STORE.bettingAssessments.length,
  trackedPositions: SEED_STORE.trackedPositions.length,
  wagers: SEED_STORE.wagers.length,
  props: SEED_STORE.props.length,
  parlays: SEED_STORE.parlays.length,
  parlayLegs: SEED_STORE.parlays.reduce((n, p) => n + p.legs.length, 0),
};

const settled = (t) => t.settlement?.status === 'settled';

/** Stored rows whose financial result is `computed` — the profit corpus. */
export const COMPUTED_PROFIT_ROWS = SEED_STORE.trackedPositions.filter(
  (t) => settled(t) && t.settlement.financialResult?.status === 'computed');

/** Settled but unpriced on the selected corner — proven separately, not skipped. */
export const UNCOMPUTABLE_ROWS = SEED_STORE.trackedPositions.filter(
  (t) => settled(t) && t.settlement.financialResult?.status === 'uncomputable');

export const OPEN_ROWS = SEED_STORE.trackedPositions.filter(
  (t) => t.settlement?.status === 'open');

/** Run roots that carry a SETTLED position — exactly what clearGraded tombstones. */
export const GRADED_RUN_IDS = [...new Set(
  SEED_STORE.trackedPositions.filter(settled).map((t) =>
    SEED_STORE.bettingAssessments.find((a) => a.id === t.assessmentId).runId))];

/** Run roots whose position is still OPEN — the pending side of the corpus. */
export const PENDING_RUN_IDS = [...new Set(
  OPEN_ROWS.map((t) =>
    SEED_STORE.bettingAssessments.find((a) => a.id === t.assessmentId).runId))];
