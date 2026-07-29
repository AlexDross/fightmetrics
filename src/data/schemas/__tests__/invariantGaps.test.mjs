import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../../../roiData.js';
import { UPCOMING_ENTRIES } from '../../../upcomingData.js';
import { PROP_PICKS } from '../../../propPicksData.js';
import { migrateV0ToV1 } from '../../migration/migrateV0ToV1.mjs';
import { migrateAndValidate } from '../../migration/dispatcher.mjs';
import { checkInvariants } from '../invariants.mjs';
import { EventSchema, StoreSchema } from '../entities.mjs';
import { ENTITY_EXAMPLES } from '../examples.mjs';

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
const codes = (store) => checkInvariants(store).map((v) => v.code);

// ── calendar validation ────────────────────────────────────────────────────
describe('dates are calendar-validated, not shape-matched', () => {
  const withDate = (date) => EventSchema.safeParse({ ...ENTITY_EXAMPLES.event, date }).success;
  const withTime = (createdAt) => EventSchema.safeParse({ ...ENTITY_EXAMPLES.event, createdAt }).success;

  it('rejects impossible calendar dates', () => {
    // A shape-only regex accepted every one of these. The app already has a
    // characterised defect where '2026-13-45' silently normalises to Feb 2027;
    // the durable schema must not institutionalise it.
    for (const d of ['2026-13-45', '2026-02-30', '2026-00-10', '2026-01-32', '2026-04-31', '2023-02-29']) {
      expect(withDate(d), `${d} must be rejected`).toBe(false);
    }
  });

  it('accepts real dates including leap days', () => {
    for (const d of ['2024-02-29', '2026-01-01', '2026-12-31', '2026-07-11']) {
      expect(withDate(d), `${d} must be accepted`).toBe(true);
    }
  });

  it('rejects impossible datetime components', () => {
    for (const t of [
      '2026-13-01T00:00:00.000Z', '2026-02-30T00:00:00.000Z',
      '2026-01-01T25:00:00.000Z', '2026-01-01T00:61:00.000Z', '2026-01-01T00:00:61.000Z',
      '2026-01-01T00:00:00.000', '2026-01-01 00:00:00Z', 'not-a-time',
    ]) {
      expect(withTime(t), `${t} must be rejected`).toBe(false);
    }
  });

  it('preserves the timestamp forms the legacy data actually uses', () => {
    for (const t of [
      '2026-07-21T01:09:07.089Z', '2026-01-01T00:00:00Z',
      '2026-01-01T00:00:00.000000Z', '2026-01-01T00:00:00+02:00', '2026-01-01T00:00:00-05:00',
    ]) {
      expect(withTime(t), `${t} must be accepted`).toBe(true);
    }
    // Every migrated timestamp still validates.
    expect(StoreSchema.safeParse(base).success).toBe(true);
  });
});

// ── migrateAndValidate enforces relational rules ───────────────────────────
describe('migrateAndValidate enforces cross-entity invariants', () => {
  it('the clean migration passes both structural and relational validation', () => {
    expect(() => migrateAndValidate(LEGACY, deps())).not.toThrow();
  });

  // Zod parses one record at a time, so each of these is structurally valid.
  const rejects = (mutate, expectedCode) => {
    const s = clone();
    mutate(s);
    expect(StoreSchema.safeParse(s).success, 'precondition: structurally valid').toBe(true);
    expect(codes(s)).toContain(expectedCode);
    const payload = { ...s, meta: { schemaVersion: 1, migratedAt: '2026-07-28T00:00:00.000Z' } };
    expect(() => migrateAndValidate(payload, deps())).toThrow(/relational validation/);
  };

  it('rejects a missing foreign key', () => {
    rejects((s) => { s.predictionRuns[0].boutId = '00000000-0000-7000-8000-ffffffffffff'; }, 'FK_MISSING');
  });

  it('rejects a denormalised id mismatch', () => {
    rejects((s) => {
      const other = s.bouts.find((b) => b.id !== s.trackedPositions[0].boutId);
      s.trackedPositions[0].boutId = other.id;
    }, 'DENORM_MISMATCH');
  });

  it('rejects an invalid decision-snapshot relationship', () => {
    rejects((s) => {
      const foreign = s.predictionSnapshots.find((x) => x.runId !== s.predictionRuns[0].id);
      s.predictionRuns[0].decisionSnapshotId = foreign.id;
    }, 'DECISION_SNAPSHOT_FOREIGN');
  });

  it('reports the offending codes and contexts in the error', () => {
    const s = clone();
    s.predictionRuns[0].boutId = '00000000-0000-7000-8000-ffffffffffff';
    const payload = { ...s, meta: { schemaVersion: 1, migratedAt: '2026-07-28T00:00:00.000Z' } };
    let message = '';
    try { migrateAndValidate(payload, deps()); } catch (e) { message = e.message; }
    expect(message).toMatch(/FK_MISSING/);
    expect(message).toMatch(/\[.+\]/); // context included
  });
});

// ── previously missing invariants ──────────────────────────────────────────
describe('relationship invariants that were previously unchecked', () => {
  it('an assessment may not price against another bout\'s market', () => {
    const s = clone();
    const a = s.bettingAssessments[0];
    const foreign = s.marketSnapshots.find((m) => m.boutId !== a.boutId);
    a.marketSnapshotId = foreign.id;
    expect(codes(s)).toContain('ASSESSMENT_MARKET_FOREIGN');
  });

  it('a bout-targeted prop must belong to its target bout\'s event', () => {
    const s = clone();
    const p = s.props[0];
    p.eventId = s.events.find((e) => e.id !== p.eventId).id;
    expect(codes(s)).toContain('PROP_EVENT_MISMATCH');
  });

  it('an event-targeted prop must target the event it belongs to', () => {
    const s = clone();
    const p = s.props[0];
    const other = s.events.find((e) => e.id !== p.eventId);
    p.target = { kind: 'event', eventId: other.id };
    expect(StoreSchema.safeParse(s).success).toBe(true);
    expect(codes(s)).toContain('PROP_EVENT_MISMATCH');
  });

  it('a reconstructed snapshot must carry reconstruction details', () => {
    const s = clone();
    const rec = s.predictionSnapshots.find((x) => x.captureMode === 'reconstructed');
    rec.reconstruction = null;
    expect(StoreSchema.safeParse(s).success).toBe(true);
    expect(codes(s)).toContain('RECONSTRUCTION_MISSING');
  });

  it('a non-reconstructed snapshot may not carry them', () => {
    const s = clone();
    const live = s.predictionSnapshots.find((x) => x.captureMode === 'live');
    live.reconstruction = { type: 'backfilled', sourceCommit: 'deadbeef', priorV2: null };
    expect(codes(s)).toContain('RECONSTRUCTION_UNEXPECTED');
  });

  it('rejects an incorrect includesProspectAtCapture boolean', () => {
    const s = clone();
    const run = s.predictionRuns.find(
      (r) => r.cornerAIsProspectAtCapture !== null && r.cornerBIsProspectAtCapture !== null
    );
    run.includesProspectAtCapture = !(run.cornerAIsProspectAtCapture || run.cornerBIsProspectAtCapture);
    expect(codes(s)).toContain('PROSPECT_FLAG_MISMATCH');
  });

  it('rejects a NULL includesProspectAtCapture when both corner flags are known', () => {
    // Previously gated on `includesProspectAtCapture !== null`, so
    // (true, false, null) passed with zero violations — but with both corners
    // known the derived value is fully determined, so null is not an unknown.
    const s = clone();
    const run = s.predictionRuns.find(
      (r) => r.cornerAIsProspectAtCapture !== null && r.cornerBIsProspectAtCapture !== null
    );
    run.cornerAIsProspectAtCapture = true;
    run.cornerBIsProspectAtCapture = false;
    run.includesProspectAtCapture = null;
    expect(StoreSchema.safeParse(s).success, 'precondition: structurally valid').toBe(true);
    const violation = checkInvariants(s).find((v) => v.code === 'PROSPECT_FLAG_MISMATCH');
    expect(violation).toBeTruthy();
    expect(violation.message).toMatch(/null although both corner flags are known/);
  });

  it('accepts only the exact logical OR', () => {
    const s = clone();
    const run = s.predictionRuns.find(
      (r) => r.cornerAIsProspectAtCapture !== null && r.cornerBIsProspectAtCapture !== null
    );
    for (const [a, b] of [[false, false], [true, false], [false, true], [true, true]]) {
      run.cornerAIsProspectAtCapture = a;
      run.cornerBIsProspectAtCapture = b;
      run.includesProspectAtCapture = a || b;
      expect(codes(s), `${a}/${b} correct OR`).not.toContain('PROSPECT_FLAG_MISMATCH');
      run.includesProspectAtCapture = !(a || b);
      expect(codes(s), `${a}/${b} inverted`).toContain('PROSPECT_FLAG_MISMATCH');
      run.includesProspectAtCapture = null;
      expect(codes(s), `${a}/${b} null`).toContain('PROSPECT_FLAG_MISMATCH');
    }
  });

  it('leaves the derived value unverified when a corner flag is unknown', () => {
    const s = clone();
    const run = s.predictionRuns.find(
      (r) => r.cornerAIsProspectAtCapture !== null && r.cornerBIsProspectAtCapture !== null
    );
    run.cornerAIsProspectAtCapture = null;
    // With one corner unknown the OR genuinely cannot be checked, so any value
    // is tolerated — including null.
    for (const v of [true, false, null]) {
      run.includesProspectAtCapture = v;
      expect(codes(s), `unknown corner with ${v}`).not.toContain('PROSPECT_FLAG_MISMATCH');
    }
  });

  it('the decision snapshot must share the run\'s bout as well as its run', () => {
    const s = clone();
    const run = s.predictionRuns[0];
    const snap = s.predictionSnapshots.find((x) => x.id === run.decisionSnapshotId);
    // Same runId, different boutId: caught only by the bout check.
    snap.boutId = s.bouts.find((b) => b.id !== run.boutId).id;
    expect(codes(s)).toContain('DECISION_SNAPSHOT_FOREIGN_BOUT');
  });
});

// ── wager market resolution ────────────────────────────────────────────────
describe('wagers are validated against their OWN market', () => {
  const settledWager = (over = {}) => ({
    id: '00000000-0000-7000-8000-0000000000bb',
    boutId: over.boutId, assessmentId: over.assessmentId, marketSnapshotId: over.marketSnapshotId,
    corner: over.corner, stakeUnits: 1, placedAt: '2026-06-01T12:00:00.000Z',
    settlement: {
      status: 'settled', outcome: 'won',
      financialResult: over.financialResult,
      settledAt: '2026-06-02T12:00:00.000Z',
    },
    notes: null, externalIds: {},
  });

  const setup = () => {
    const s = clone();
    const t = s.trackedPositions.find(
      (x) => x.settlement.status === 'settled'
        && x.settlement.financialResult.status === 'computed'
        && !['push', 'void'].includes(x.settlement.outcome)
    );
    const a = s.bettingAssessments.find((x) => x.id === t.assessmentId);
    const m = s.marketSnapshots.find((x) => x.id === a.marketSnapshotId);
    return { s, t, a, m };
  };

  it('rejects a computed profit when the WAGER\'s market leaves its corner unpriced', () => {
    // The assessment prices the corner; the wager's own later market does not.
    // Reading the assessment market here would wrongly accept this.
    const { s, t, a, m } = setup();
    const m2 = {
      id: '00000000-0000-7000-8000-0000000000aa', boutId: a.boutId,
      capturedAt: m.capturedAt, source: 'manual',
      oddsA: t.corner === 'A' ? null : m.oddsA,
      oddsB: t.corner === 'B' ? null : m.oddsB,
    };
    s.marketSnapshots.push(m2);
    s.wagers.push(settledWager({
      boutId: a.boutId, assessmentId: a.id, marketSnapshotId: m2.id, corner: t.corner,
      financialResult: { status: 'computed', profitUnits: 1.5 },
    }));
    expect(StoreSchema.safeParse(s).success).toBe(true);
    expect(codes(s)).toContain('FINANCIAL_SHOULD_BE_UNCOMPUTABLE');
  });

  it('accepts a computed profit when the wager\'s market prices its corner even if the assessment\'s does not', () => {
    const s = clone();
    const noMarket = s.bettingAssessments.find((x) => x.marketSnapshotId === null);
    const t = s.trackedPositions.find((x) => x.assessmentId === noMarket.id);
    const m2 = {
      id: '00000000-0000-7000-8000-0000000000ac', boutId: noMarket.boutId,
      capturedAt: '2026-06-01T12:00:00.000Z', source: 'manual',
      oddsA: t.corner === 'A' ? -150 : null,
      oddsB: t.corner === 'B' ? -150 : null,
    };
    s.marketSnapshots.push(m2);
    s.bouts.find((b) => b.id === noMarket.boutId).result =
      { status: 'resolved', outcome: t.corner, method: 'DEC' };
    // The tracked position stays uncomputable (its assessment has no market)…
    s.wagers.push(settledWager({
      boutId: noMarket.boutId, assessmentId: noMarket.id, marketSnapshotId: m2.id, corner: t.corner,
      financialResult: { status: 'computed', profitUnits: 0.67 },
    }));
    // …while the wager is computable from its own price.
    expect(codes(s)).not.toContain('FINANCIAL_SHOULD_BE_UNCOMPUTABLE');
    expect(codes(s)).not.toContain('FINANCIAL_SHOULD_BE_COMPUTED');
  });

  it('rejects a wager market belonging to a foreign bout', () => {
    const { s, a, t } = setup();
    const foreign = s.marketSnapshots.find((m) => m.boutId !== a.boutId);
    s.wagers.push(settledWager({
      boutId: a.boutId, assessmentId: a.id, marketSnapshotId: foreign.id, corner: t.corner,
      financialResult: { status: 'computed', profitUnits: 1 },
    }));
    expect(codes(s)).toContain('WAGER_MARKET_FOREIGN');
  });

  it('requires uncomputable when the wager has no market at all', () => {
    const { s, a, t } = setup();
    s.wagers.push(settledWager({
      boutId: a.boutId, assessmentId: a.id, marketSnapshotId: null, corner: t.corner,
      financialResult: { status: 'computed', profitUnits: 1 },
    }));
    expect(codes(s)).toContain('FINANCIAL_SHOULD_BE_UNCOMPUTABLE');

    const s2 = clone();
    const a2 = s2.bettingAssessments.find((x) => x.id === a.id);
    s2.wagers.push(settledWager({
      boutId: a2.boutId, assessmentId: a2.id, marketSnapshotId: null, corner: t.corner,
      financialResult: { status: 'uncomputable', reason: 'missingSelectedCornerOdds' },
    }));
    expect(codes(s2)).not.toContain('FINANCIAL_SHOULD_BE_UNCOMPUTABLE');
  });

  it('still allows a wager corner to differ from the tracked corner', () => {
    const { s, a, t, m } = setup();
    const other = t.corner === 'A' ? 'B' : 'A';
    const otherOdds = other === 'A' ? m.oddsA : m.oddsB;
    if (otherOdds === null) return;
    s.wagers.push(settledWager({
      boutId: a.boutId, assessmentId: a.id, marketSnapshotId: m.id, corner: other,
      financialResult: { status: 'computed', profitUnits: -1 },
    }));
    expect(codes(s)).not.toContain('DENORM_MISMATCH');
    expect(codes(s)).not.toContain('WAGER_MARKET_FOREIGN');
  });
});
