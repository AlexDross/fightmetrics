import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../../../roiData.js';
import { UPCOMING_ENTRIES } from '../../../upcomingData.js';
import { PROP_PICKS } from '../../../propPicksData.js';
import { migrateV0ToV1 } from '../migrateV0ToV1.mjs';
import { migrateAndValidate } from '../dispatcher.mjs';
import { checkInvariants } from '../../schemas/invariants.mjs';
import { StoreSchema, MarketSnapshotSchema } from '../../schemas/entities.mjs';
import { marketIdFor, trackedMarketIdFor } from '../ids.mjs';

// The legacy `marketOdds` field is an INDEPENDENT source value, not a
// derivation of oddsA/oddsB. App.js edits it alone (:7890) and rewrites it when
// the tracked side changes (:7868). It happens to equal the selected corner on
// all 160 current rows, which is a property of today's seed and NOT a migration
// rule — deriving it would discard any real price correction.
const LEGACY = {
  roiEntries: ROI_ENTRIES, upcomingEntries: UPCOMING_ENTRIES,
  propPicks: PROP_PICKS, parlayEntries: [],
};
const deps = () => ({
  migratedAt: '2026-07-28T00:00:00.000Z',
  newId: () => '00000000-0000-7000-8000-000000000000',
});

const RUN_ID = '1790000000123-ovride';

/** A settled row with an independently edited tracked price. */
const syntheticRow = (over = {}) => {
  const src = ROI_ENTRIES.find((e) => e.actualWinner === e.fighterA && e.oddsA && e.oddsB);
  return {
    ...src,
    id: RUN_ID,
    createdAt: '2026-12-01T00:00:00.000Z',
    eventName: 'UFC 998',
    eventDate: '2026-12-06',
    oddsA: '-150',
    oddsB: '+130',
    trackedSide: src.fighterA,
    actualWinner: src.fighterA,
    marketOdds: '-120',
    unitsWagered: 1,
    ...over,
  };
};

const run = (over) => migrateV0ToV1({ ...LEGACY, roiEntries: [...ROI_ENTRIES, syntheticRow(over)] }, deps());

const parts = (out) => {
  const prun = out.store.predictionRuns.find((r) => r.legacyEntryId === RUN_ID);
  const assessment = out.store.bettingAssessments.find((a) => a.runId === prun.id);
  const tracked = out.store.trackedPositions.find((t) => t.assessmentId === assessment.id);
  const byId = new Map(out.store.marketSnapshots.map((m) => [m.id, m]));
  return {
    prun, assessment, tracked,
    assessmentMarket: assessment.marketSnapshotId ? byId.get(assessment.marketSnapshotId) : null,
    trackedMarket: tracked.marketSnapshotId ? byId.get(tracked.marketSnapshotId) : null,
  };
};

describe('an independently edited marketOdds is preserved', () => {
  const out = run();
  const { assessment, tracked, assessmentMarket, trackedMarket } = parts(out);

  it('migrates without error and validates', () => {
    expect(out.errors).toEqual([]);
    expect(StoreSchema.safeParse(out.store).success).toBe(true);
    expect(checkInvariants(out.store)).toEqual([]);
  });

  it('creates two DISTINCT market snapshots', () => {
    expect(assessment.marketSnapshotId).not.toBe(tracked.marketSnapshotId);
    expect(assessment.marketSnapshotId).toBe(marketIdFor({ runId: RUN_ID }));
    expect(tracked.marketSnapshotId).toBe(trackedMarketIdFor({ runId: RUN_ID }));
  });

  it('leaves the assessment market at the ORIGINAL -150 / +130', () => {
    expect(assessmentMarket.oddsA).toBe(-150);
    expect(assessmentMarket.oddsB).toBe(130);
    expect(assessmentMarket.source).toBe('manual');
    expect(assessmentMarket.capturedAt).toBe('2026-12-01T00:00:00.000Z');
  });

  it('builds the tracked market as -120 / +130 — only the tracked corner replaced', () => {
    expect(trackedMarket.oddsA).toBe(-120);
    expect(trackedMarket.oddsB).toBe(130);
    expect(tracked.corner).toBe('A');
  });

  it('does not invent an edit timestamp for the override', () => {
    // The legacy row records the resulting price and nothing else; createdAt is
    // the ORIGINAL save, not the correction.
    expect(trackedMarket.capturedAt).toBe(null);
    expect(trackedMarket.source).toBe('legacyTrackedOverride');
    // And a null capturedAt is legal ONLY for that source.
    expect(MarketSnapshotSchema.safeParse({ ...trackedMarket, source: 'manual' }).success).toBe(false);
    expect(MarketSnapshotSchema.safeParse(trackedMarket).success).toBe(true);
  });

  it('leaves every frozen assessment value untouched', () => {
    const src = syntheticRow();
    for (const [field, legacy] of [
      ['tier', src.betAction], ['edgeA', src.edgeA], ['edgeB', src.edgeB],
      ['evA', src.evA], ['evB', src.evB], ['kellyA', src.kellyA], ['kellyB', src.kellyB],
    ]) {
      expect(assessment[field], `${field} must not be recomputed`).toBe(legacy ?? assessment[field]);
    }
    // Fair lines come from the assessment market, not the tracked one.
    expect(assessment.fairLineA).toBe(Number(src.fairLineA));
    expect(assessment.fairLineB).toBe(Number(src.fairLineB));
  });

  it('computes settlement profit at the TRACKED -120, not the assessment -150', () => {
    expect(tracked.settlement.status).toBe('settled');
    expect(tracked.settlement.outcome).toBe('won');
    // -120 => decimal 1.8333..., profit on 1 unit = 100/120
    const expected = 1 * ((1 + 100 / 120) - 1);
    expect(tracked.settlement.financialResult.status).toBe('computed');
    expect(tracked.settlement.financialResult.profitUnits).toBeCloseTo(expected, 12);
    // Explicitly NOT the assessment price.
    const atAssessmentPrice = 1 * ((1 + 100 / 150) - 1);
    expect(tracked.settlement.financialResult.profitUnits).not.toBeCloseTo(atAssessmentPrice, 12);
  });
});

describe('reconciliation rules', () => {
  it('reuses one snapshot when marketOdds equals the selected corner', () => {
    const { assessment, tracked } = parts(run({ marketOdds: '-150' }));
    expect(tracked.marketSnapshotId).toBe(assessment.marketSnapshotId);
    expect(tracked.marketSnapshotId).toBe(marketIdFor({ runId: RUN_ID }));
  });

  it('reuses the assessment market when marketOdds is absent', () => {
    const row = syntheticRow();
    delete row.marketOdds;
    const out = migrateV0ToV1({ ...LEGACY, roiEntries: [...ROI_ENTRIES, row] }, deps());
    const { assessment, tracked } = parts(out);
    expect(out.errors).toEqual([]);
    expect(tracked.marketSnapshotId).toBe(assessment.marketSnapshotId);
  });

  it('treats explicitly blank marketOdds as an unpriced tracked corner', () => {
    // Must NOT silently fall back to oddsA.
    const out = run({ marketOdds: '' });
    const { assessment, tracked, trackedMarket } = parts(out);
    expect(out.errors).toEqual([]);
    expect(tracked.marketSnapshotId).not.toBe(assessment.marketSnapshotId);
    expect(trackedMarket.oddsA).toBe(null);
    expect(trackedMarket.oddsB).toBe(130);
    expect(tracked.settlement.financialResult).toEqual({
      status: 'uncomputable', reason: 'missingSelectedCornerOdds',
    });
    expect(checkInvariants(out.store)).toEqual([]);
  });

  it('uses a null marketSnapshotId rather than an empty snapshot', () => {
    const out = run({ oddsA: '', oddsB: '', marketOdds: '' });
    const { assessment, tracked } = parts(out);
    expect(assessment.marketSnapshotId).toBe(null);
    expect(tracked.marketSnapshotId).toBe(null);
    expect(out.store.marketSnapshots.some((m) => m.oddsA === null && m.oddsB === null)).toBe(false);
    expect(checkInvariants(out.store)).toEqual([]);
  });

  it('aborts on an invalid marketOdds rather than guessing', () => {
    for (const bad of ['abc', '-99', '0', '12.5']) {
      const out = run({ marketOdds: bad });
      expect(out.errors.some((e) => e.includes(`${RUN_ID}.marketOdds`)), bad).toBe(true);
      expect(() =>
        migrateAndValidate({ ...LEGACY, roiEntries: [...ROI_ENTRIES, syntheticRow({ marketOdds: bad })] }, deps())
      ).toThrow();
    }
  });

  it('places the override on the correct corner under canonical orientation', () => {
    // Same bout, corners swapped, tracking fighterB with an override.
    const first = syntheticRow();
    const swapped = {
      ...first,
      id: '1790000000124-swapov',
      createdAt: '2026-12-02T00:00:00.000Z',
      fighterA: first.fighterB,
      fighterB: first.fighterA,
      oddsA: '+130',
      oddsB: '-150',
      fighterAProb: first.fighterBProb,
      fighterBProb: first.fighterAProb,
      trackedSide: first.fighterA,   // still the SAME human, now in legacy slot B
      marketOdds: '-120',
    };
    delete swapped.v2pA; delete swapped.v2pB;
    const out = migrateV0ToV1(
      { ...LEGACY, roiEntries: [...ROI_ENTRIES, first, swapped] }, deps()
    );
    expect(out.errors).toEqual([]);
    const prun = out.store.predictionRuns.find((r) => r.legacyEntryId === '1790000000124-swapov');
    const bout = out.store.bouts.find((b) => b.id === prun.boutId);
    const a = out.store.bettingAssessments.find((x) => x.runId === prun.id);
    const t = out.store.trackedPositions.find((x) => x.assessmentId === a.id);
    const tm = out.store.marketSnapshots.find((m) => m.id === t.marketSnapshotId);
    // Canonical corner A is the first occurrence's fighterA.
    expect(bout.cornerA.displayName).toBe(first.fighterA);
    expect(t.corner).toBe('A');
    // The override landed on canonical A, not on legacy slot B.
    expect(tm.oddsA).toBe(-120);
    expect(tm.oddsB).toBe(130);
    expect(checkInvariants(out.store)).toEqual([]);
  });

  it('reports FK_MISSING when the tracked market snapshot is removed', () => {
    const out = run();
    const s = structuredClone(out.store);
    const t = s.trackedPositions.find((x) => x.marketSnapshotId === trackedMarketIdFor({ runId: RUN_ID }));
    s.marketSnapshots = s.marketSnapshots.filter((m) => m.id !== t.marketSnapshotId);
    expect(checkInvariants(s).map((v) => v.code)).toContain('FK_MISSING');
  });
});

describe('the current production seed is unaffected', () => {
  const { store, manifest } = migrateV0ToV1(LEGACY, deps());

  it('still produces 158 market snapshots and no override snapshots', () => {
    expect(manifest.counts.marketSnapshots).toBe(158);
    expect(store.marketSnapshots.every((m) => m.source === 'manual')).toBe(true);
    expect(store.marketSnapshots.every((m) => m.capturedAt !== null)).toBe(true);
  });

  it('still links 158 positions and leaves 2 null', () => {
    expect(store.trackedPositions.filter((t) => t.marketSnapshotId !== null)).toHaveLength(158);
    expect(store.trackedPositions.filter((t) => t.marketSnapshotId === null)).toHaveLength(2);
  });

  it('every tracked position still points at its assessment market', () => {
    // True only because marketOdds equals the selected corner on all 160 rows
    // today — a characterisation, which is exactly why the migration checks it
    // instead of assuming it.
    const A = new Map(store.bettingAssessments.map((a) => [a.id, a]));
    for (const t of store.trackedPositions) {
      expect(t.marketSnapshotId).toBe(A.get(t.assessmentId).marketSnapshotId);
    }
  });
});
