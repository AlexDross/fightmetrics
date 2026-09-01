// Stage 7 — the REAL migrated corpus, built exactly as the contract suite
// builds it.
//
// This is not a fixture. It is the same `migrateV0ToV1` output the in-memory
// repositories are tested against, run over the CURRENTLY BUNDLED ROI, upcoming
// and prop data, so `fm_rpc_seed_store` is proven on real migration output — for
// THIS harness corpus, which is not identical to the production one (see the
// parlay note below).
//
// Because those inputs are live — every graded card and every new event moves
// them — this module deliberately publishes no fixed sizes. Callers must assert
// against the exported derivations (`CORPUS`, `ROOT_COUNT`,
// `COMPUTED_PROFIT_ROWS`, …), never against a transcribed number. A count
// written down in a test is correct only until the next data refresh, and the
// suite has already been broken once that way.
//
// `parlayEntries: []` matches the contract suite: parlays live in parlayData.js
// but are deliberately withheld from the migration harness, so `SEED_STORE.parlays`
// is empty by construction. **That is a test-harness choice, not deletion of
// production data** — the entries in parlayData.js are untouched — and it is why
// `ROOT_COUNT` reduces to the prediction-run and prop roots alone. It is also why
// the hosted rollout cannot seed from this corpus: Gate 5 must rebuild and
// reconcile the complete migration input, parlays included, first.
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
