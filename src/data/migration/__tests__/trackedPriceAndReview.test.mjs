import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../../../roiData.js';
import { UPCOMING_ENTRIES } from '../../../upcomingData.js';
import { PROP_PICKS } from '../../../propPicksData.js';
import { migrateV0ToV1 } from '../migrateV0ToV1.mjs';
import { migrateAndValidate } from '../dispatcher.mjs';
import { checkInvariants } from '../../schemas/invariants.mjs';
import { StoreSchema, TrackedPositionSchema } from '../../schemas/entities.mjs';
import { ENTITY_EXAMPLES } from '../../schemas/examples.mjs';

const LEGACY = {
  roiEntries: ROI_ENTRIES, upcomingEntries: UPCOMING_ENTRIES,
  propPicks: PROP_PICKS, parlayEntries: [],
};
const deps = () => ({
  migratedAt: '2026-07-28T00:00:00.000Z',
  newId: () => '00000000-0000-7000-8000-000000000000',
});
const base = migrateV0ToV1(LEGACY, deps()).store;
const clone = () => structuredClone(base);
const codes = (s) => checkInvariants(s).map((v) => v.code);

// ── tracked scoring price ──────────────────────────────────────────────────
describe('TrackedPosition.marketSnapshotId is the scoring price', () => {
  it('links 158 positions and leaves exactly 2 null', () => {
    const linked = base.trackedPositions.filter((t) => t.marketSnapshotId !== null);
    const unlinked = base.trackedPositions.filter((t) => t.marketSnapshotId === null);
    expect(linked).toHaveLength(158);
    expect(unlinked).toHaveLength(2);
    expect(base.trackedPositions).toHaveLength(160);
  });

  it('starts equal to the assessment market but is a separate field', () => {
    const A = new Map(base.bettingAssessments.map((a) => [a.id, a]));
    for (const t of base.trackedPositions) {
      expect(t.marketSnapshotId).toBe(A.get(t.assessmentId).marketSnapshotId);
    }
    // Separate field, not an alias: repointing one must not move the other.
    const s = clone();
    const t = s.trackedPositions.find((x) => x.marketSnapshotId !== null);
    const a = s.bettingAssessments.find((x) => x.id === t.assessmentId);
    const frozen = a.marketSnapshotId;
    const replacement = {
      id: '00000000-0000-7000-8000-0000000000c1', boutId: t.boutId,
      capturedAt: '2026-06-02T00:00:00.000Z', source: 'manual', oddsA: -200, oddsB: 170,
    };
    s.marketSnapshots.push(replacement);
    t.marketSnapshotId = replacement.id;
    expect(a.marketSnapshotId).toBe(frozen);
    // The frozen assessment values are untouched by a price amendment.
    expect(a.tier).toBe(base.bettingAssessments.find((x) => x.id === a.id).tier);
    expect(a.edgeA).toBe(base.bettingAssessments.find((x) => x.id === a.id).edgeA);
  });

  it('scores settlement against the TRACKED market, not the assessment market', () => {
    // Assessment prices the corner; the tracked market does not. Reading the
    // assessment market here would wrongly accept a computed profit.
    const s = clone();
    const t = s.trackedPositions.find(
      (x) => x.settlement.status === 'settled'
        && x.settlement.financialResult.status === 'computed'
        && !['push', 'void'].includes(x.settlement.outcome)
    );
    const a = s.bettingAssessments.find((x) => x.id === t.assessmentId);
    const m = s.marketSnapshots.find((x) => x.id === a.marketSnapshotId);
    const unpriced = {
      id: '00000000-0000-7000-8000-0000000000c2', boutId: t.boutId,
      capturedAt: m.capturedAt, source: 'manual',
      oddsA: t.corner === 'A' ? null : m.oddsA,
      oddsB: t.corner === 'B' ? null : m.oddsB,
    };
    s.marketSnapshots.push(unpriced);
    t.marketSnapshotId = unpriced.id;
    expect(StoreSchema.safeParse(s).success).toBe(true);
    expect(codes(s)).toContain('FINANCIAL_SHOULD_BE_UNCOMPUTABLE');
  });

  it('rejects a tracked market from another bout', () => {
    const s = clone();
    const t = s.trackedPositions[0];
    t.marketSnapshotId = s.marketSnapshots.find((m) => m.boutId !== t.boutId).id;
    expect(codes(s)).toContain('TRACKED_MARKET_FOREIGN');
  });

  it('requires uncomputable when there is no tracked market', () => {
    const s = clone();
    const t = s.trackedPositions.find(
      (x) => x.settlement.status === 'settled'
        && x.settlement.financialResult.status === 'computed'
        && !['push', 'void'].includes(x.settlement.outcome)
    );
    t.marketSnapshotId = null;
    expect(codes(s)).toContain('FINANCIAL_SHOULD_BE_UNCOMPUTABLE');
  });

  it('the two no-market positions stay consistent as migrated', () => {
    const unlinked = base.trackedPositions.filter((t) => t.marketSnapshotId === null);
    const settled = unlinked.filter((t) => t.settlement.status === 'settled');
    const open = unlinked.filter((t) => t.settlement.status === 'open');
    expect(settled).toHaveLength(1);
    expect(open).toHaveLength(1);
    expect(settled[0].settlement.financialResult).toEqual({
      status: 'uncomputable', reason: 'missingSelectedCornerOdds',
    });
    expect(checkInvariants(base)).toEqual([]);
  });
});

// ── review state: exhaustive legacy mapping ────────────────────────────────
describe('reviewState legacy mapping is exhaustive and strict', () => {
  const withFields = (over) => {
    const src = ROI_ENTRIES[0];
    const entry = { ...src, id: '1790000000099-revsta' };
    for (const [k, v] of Object.entries(over)) {
      if (v === '<absent>') delete entry[k];
      else entry[k] = v;
    }
    return migrateV0ToV1({ ...LEGACY, roiEntries: [...ROI_ENTRIES, entry] }, deps());
  };
  const stateOf = (out) => {
    const run = out.store.predictionRuns.find((r) => r.legacyEntryId === '1790000000099-revsta');
    const a = out.store.bettingAssessments.find((x) => x.runId === run.id);
    return out.store.trackedPositions.find((t) => t.assessmentId === a.id).reviewState;
  };

  const ACCEPTED = [
    ['neither field', { autoGenerated: '<absent>', confirmedByUser: '<absent>' }, { status: 'notRequired' }],
    ['autoGenerated:false, no confirmedByUser', { autoGenerated: false, confirmedByUser: '<absent>' }, { status: 'notRequired' }],
    ['autoGenerated:true, confirmedByUser:false', { autoGenerated: true, confirmedByUser: false }, { status: 'pending', reason: 'autoGenerated' }],
    ['autoGenerated:true, confirmedByUser:true', { autoGenerated: true, confirmedByUser: true }, { status: 'confirmed', reason: 'autoGenerated', confirmedAt: null }],
  ];

  for (const [label, over, expected] of ACCEPTED) {
    it(`accepts ${label}`, () => {
      const out = withFields(over);
      expect(out.errors).toEqual([]);
      expect(stateOf(out)).toEqual(expected);
    });
  }

  const REJECTED = [
    ['confirmedByUser:true with autoGenerated absent', { autoGenerated: '<absent>', confirmedByUser: true }],
    ['confirmedByUser:false with autoGenerated absent', { autoGenerated: '<absent>', confirmedByUser: false }],
    ['confirmedByUser:true with autoGenerated:false', { autoGenerated: false, confirmedByUser: true }],
    ['confirmedByUser:false with autoGenerated:false', { autoGenerated: false, confirmedByUser: false }],
    ['autoGenerated:true without confirmedByUser', { autoGenerated: true, confirmedByUser: '<absent>' }],
    ['autoGenerated:true with null confirmedByUser', { autoGenerated: true, confirmedByUser: null }],
    ['autoGenerated:true with string confirmedByUser', { autoGenerated: true, confirmedByUser: 'yes' }],
    ['non-boolean autoGenerated', { autoGenerated: 'yes', confirmedByUser: '<absent>' }],
  ];

  for (const [label, over] of REJECTED) {
    it(`aborts on ${label}`, () => {
      const out = withFields(over);
      expect(out.errors.length, `${label} should abort`).toBeGreaterThan(0);
      expect(out.errors.some((e) => e.includes('1790000000099-revsta'))).toBe(true);
      // And it must abort the whole migration, not merely warn.
      expect(() =>
        migrateAndValidate({ ...LEGACY, roiEntries: [ROI_ENTRIES[0], { ...ROI_ENTRIES[0], id: '1790000000099-revsta', ...Object.fromEntries(Object.entries(over).filter(([, v]) => v !== '<absent>')) }] }, deps())
      ).toThrow();
    });
  }

  it('migrates all 160 seed rows to notRequired', () => {
    const counts = new Map();
    for (const t of base.trackedPositions) {
      counts.set(t.reviewState.status, (counts.get(t.reviewState.status) ?? 0) + 1);
    }
    expect(Object.fromEntries(counts)).toEqual({ notRequired: 160 });
    // Confirms the premise: neither UI field appears in any seed row.
    const all = [...ROI_ENTRIES, ...UPCOMING_ENTRIES];
    expect(all.filter((e) => 'autoGenerated' in e)).toHaveLength(0);
    expect(all.filter((e) => 'confirmedByUser' in e)).toHaveLength(0);
  });
});

describe('reviewState schema rules', () => {
  it('permits a null confirmedAt only for legacy-migrated positions', () => {
    const legacyConfirmed = {
      ...ENTITY_EXAMPLES.trackedPositionLegacy,
      reviewState: { status: 'confirmed', reason: 'autoGenerated', confirmedAt: null },
    };
    expect(TrackedPositionSchema.safeParse(legacyConfirmed).success).toBe(true);
    const appConfirmed = {
      ...ENTITY_EXAMPLES.trackedPositionAppCreated,
      reviewState: { status: 'confirmed', reason: 'autoGenerated', confirmedAt: null },
    };
    expect(TrackedPositionSchema.safeParse(appConfirmed).success).toBe(false);
  });

  it('rejects cross-variant keys and bad reasons', () => {
    const bad = (rs) => TrackedPositionSchema.safeParse({
      ...ENTITY_EXAMPLES.trackedPositionLegacy, reviewState: rs,
    }).success;
    expect(bad({ status: 'notRequired', reason: 'autoGenerated' })).toBe(false);
    expect(bad({ status: 'pending' })).toBe(false);
    expect(bad({ status: 'pending', reason: 'manual' })).toBe(false);
    expect(bad({ status: 'confirmed', reason: 'autoGenerated' })).toBe(false);
    expect(bad({ status: 'confirmed', reason: 'autoGenerated', confirmedAt: 'nope' })).toBe(false);
    expect(bad({ status: 'unknown' })).toBe(false);
    expect(bad(undefined)).toBe(false);
  });

  it('statistics would exclude only the pending state', () => {
    // The rule the Stage 7 read models must implement: notRequired counts.
    const excluded = (rs) => rs.status === 'pending';
    expect(excluded({ status: 'notRequired' })).toBe(false);
    expect(excluded({ status: 'confirmed', reason: 'autoGenerated', confirmedAt: null })).toBe(false);
    expect(excluded({ status: 'pending', reason: 'autoGenerated' })).toBe(true);
    expect(base.trackedPositions.filter((t) => excluded(t.reviewState))).toHaveLength(0);
  });
});

describe('the follow-up preserves everything else', () => {
  it('keeps entity totals and validation clean', () => {
    const out = migrateAndValidate(LEGACY, deps());
    expect(out.errors).toEqual([]);
    expect(Object.fromEntries(
      Object.entries(out.store).filter(([k]) => k !== 'meta').map(([k, v]) => [k, v.length])
    )).toEqual({
      events: 16, bouts: 160, predictionRuns: 160, predictionSnapshots: 237,
      marketSnapshots: 158, bettingAssessments: 160, trackedPositions: 160,
      wagers: 0, props: 4, parlays: 0,
    });
  });

  it('leaves probabilities, assessments and settlements untouched', () => {
    const settled = base.trackedPositions.filter((t) => t.settlement.status === 'settled');
    expect(settled).toHaveLength(153);
    expect(base.trackedPositions.filter((t) => t.settlement.status === 'open')).toHaveLength(7);
    const outcomes = new Map();
    for (const t of settled) outcomes.set(t.settlement.outcome, (outcomes.get(t.settlement.outcome) ?? 0) + 1);
    expect(Object.fromEntries(outcomes)).toEqual({ won: 89, lost: 61, push: 1, void: 2 });
    const fin = new Map();
    for (const t of settled) fin.set(t.settlement.financialResult.status, (fin.get(t.settlement.financialResult.status) ?? 0) + 1);
    expect(Object.fromEntries(fin)).toEqual({ computed: 152, uncomputable: 1 });
  });

  it('stays deterministic', () => {
    expect(JSON.stringify(migrateV0ToV1(LEGACY, deps()).store))
      .toBe(JSON.stringify(migrateV0ToV1(LEGACY, deps()).store));
  });
});
