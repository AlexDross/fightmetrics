import { describe, it, expect } from 'vitest';
import {
  BOUT_RESULT_EXAMPLES, FINISH_PROJECTION_EXAMPLES, SETTLEMENT_EXAMPLES,
  PROP_TARGET_EXAMPLES, RECONSTRUCTION_EXAMPLES, ENTITY_EXAMPLES,
  REVIEW_STATE_EXAMPLES,
} from '../examples.mjs';
import {
  BoutResultSchema, BoutSchema, EventSchema, ENTITY_SCHEMAS, MarketSnapshotSchema,
  BettingAssessmentSchema, ParlaySchema, PredictionRunSchema, PredictionSnapshotSchema,
  PropSchema, PropTargetSchema, ReconstructionSchema, TrackedPositionSchema, WagerSchema,
} from '../entities.mjs';
import { finishProjection, reviewState, settlement } from '../primitives.mjs';

const ok = (schema, value, label) => {
  const r = schema.safeParse(value);
  expect(r.success, `${label}: ${r.success ? '' : JSON.stringify(r.error.issues[0])}`).toBe(true);
};
const rejects = (schema, value, label) => {
  expect(schema.safeParse(value).success, label).toBe(false);
};

describe('canonical examples validate', () => {
  it('every entity example parses', () => {
    const byEntity = {
      event: EventSchema, eventUnknownPromotion: EventSchema, bout: BoutSchema,
      predictionRun: PredictionRunSchema,
      predictionSnapshotV1: PredictionSnapshotSchema,
      predictionSnapshotV2Reconstructed: PredictionSnapshotSchema,
      marketSnapshot: MarketSnapshotSchema, marketSnapshotPartial: MarketSnapshotSchema,
      bettingAssessment: BettingAssessmentSchema,
      bettingAssessmentNoMarket: BettingAssessmentSchema,
      bettingAssessmentPreBettingLayer: BettingAssessmentSchema,
      trackedPositionLegacy: TrackedPositionSchema,
      trackedPositionAppCreated: TrackedPositionSchema,
      trackedPositionNoMarket: TrackedPositionSchema,
      trackedPositionPendingReview: TrackedPositionSchema,
      wager: WagerSchema, prop: PropSchema, parlay: ParlaySchema,
    };
    for (const [name, schema] of Object.entries(byEntity)) {
      ok(schema, ENTITY_EXAMPLES[name], name);
    }
    // Coverage: every example has a schema assigned.
    expect(Object.keys(ENTITY_EXAMPLES).sort()).toEqual(Object.keys(byEntity).sort());
  });

  it('covers every discriminated-union variant', () => {
    for (const [k, v] of Object.entries(BOUT_RESULT_EXAMPLES)) ok(BoutResultSchema, v, `boutResult.${k}`);
    for (const [k, v] of Object.entries(FINISH_PROJECTION_EXAMPLES)) ok(finishProjection(), v, `finish.${k}`);
    for (const [k, v] of Object.entries(SETTLEMENT_EXAMPLES)) ok(settlement(), v, `settlement.${k}`);
    for (const [k, v] of Object.entries(PROP_TARGET_EXAMPLES)) ok(PropTargetSchema, v, `propTarget.${k}`);
    for (const [k, v] of Object.entries(REVIEW_STATE_EXAMPLES)) ok(reviewState(), v, `reviewState.${k}`);
    for (const [k, v] of Object.entries(RECONSTRUCTION_EXAMPLES)) {
      if (v === null) continue;
      ok(ReconstructionSchema, v, `reconstruction.${k}`);
    }
    // Every declared status/kind literal has at least one example.
    const statuses = new Set(Object.values(BOUT_RESULT_EXAMPLES).map((v) => v.status));
    expect([...statuses].sort()).toEqual(['pending', 'resolved']);
    const outcomes = new Set(
      Object.values(BOUT_RESULT_EXAMPLES).filter((v) => v.status === 'resolved').map((v) => v.outcome)
    );
    expect([...outcomes].sort()).toEqual(['A', 'B', 'draw', 'noContest']);
    const settleOutcomes = new Set(
      Object.values(SETTLEMENT_EXAMPLES).filter((v) => v.status === 'settled').map((v) => v.outcome)
    );
    expect([...settleOutcomes].sort()).toEqual(['lost', 'push', 'void', 'won']);
    expect(new Set(Object.values(PROP_TARGET_EXAMPLES).map((v) => v.kind)).size).toBe(2);
  });
});

describe('strictness: unknown keys and undefined', () => {
  it('rejects unknown keys on every entity schema', () => {
    const samples = {
      events: ENTITY_EXAMPLES.event, bouts: ENTITY_EXAMPLES.bout,
      predictionRuns: ENTITY_EXAMPLES.predictionRun,
      predictionSnapshots: ENTITY_EXAMPLES.predictionSnapshotV1,
      marketSnapshots: ENTITY_EXAMPLES.marketSnapshot,
      bettingAssessments: ENTITY_EXAMPLES.bettingAssessment,
      trackedPositions: ENTITY_EXAMPLES.trackedPositionLegacy,
      wagers: ENTITY_EXAMPLES.wager, props: ENTITY_EXAMPLES.prop, parlays: ENTITY_EXAMPLES.parlay,
    };
    for (const [name, schema] of Object.entries(ENTITY_SCHEMAS)) {
      rejects(schema, { ...samples[name], marketOdds: '-150' }, `${name} accepted a legacy key`);
      rejects(schema, { ...samples[name], somethingNew: 1 }, `${name} accepted an unknown key`);
    }
  });

  it('rejects explicit undefined recursively', () => {
    rejects(EventSchema, { ...ENTITY_EXAMPLES.event, updatedAt: undefined }, 'top-level undefined');
    rejects(BoutSchema, {
      ...ENTITY_EXAMPLES.bout,
      cornerA: { ...ENTITY_EXAMPLES.bout.cornerA, fighterId: undefined },
    }, 'nested undefined');
    rejects(PredictionSnapshotSchema, {
      ...ENTITY_EXAMPLES.predictionSnapshotV2Reconstructed,
      reconstruction: { ...RECONSTRUCTION_EXAMPLES.backfilledWithPrior, priorV2: undefined },
    }, 'deeply nested undefined');
    rejects(TrackedPositionSchema, {
      ...ENTITY_EXAMPLES.trackedPositionLegacy,
      settlement: { status: 'settled', outcome: 'won', financialResult: undefined, settledAt: null },
    }, 'undefined inside a union variant');
  });

  it('rejects sparse arrays and undefined array members', () => {
    const sparse = [];
    sparse[2] = ENTITY_EXAMPLES.parlay.legs[0];
    rejects(ParlaySchema, { ...ENTITY_EXAMPLES.parlay, legs: sparse }, 'sparse array');
    rejects(ParlaySchema, { ...ENTITY_EXAMPLES.parlay, legs: [undefined] }, 'undefined member');
    rejects(finishProjection(), {
      ...FINISH_PROJECTION_EXAMPLES.singleLeader, leaders: [undefined],
    }, 'undefined leader');
  });

  it('rejects NaN, Infinity and negative zero in persisted numbers', () => {
    for (const bad of [NaN, Infinity, -Infinity, -0]) {
      rejects(PredictionSnapshotSchema, {
        ...ENTITY_EXAMPLES.predictionSnapshotV1, probA: bad,
      }, `probA accepted ${Object.is(bad, -0) ? '-0' : String(bad)}`);
      rejects(BettingAssessmentSchema, {
        ...ENTITY_EXAMPLES.bettingAssessment, edgeA: bad,
      }, `edgeA accepted ${Object.is(bad, -0) ? '-0' : String(bad)}`);
    }
    // -0 specifically: JSON.stringify writes "0", so persisting it silently
    // changes on round-trip. +0 must still be accepted.
    ok(BettingAssessmentSchema, { ...ENTITY_EXAMPLES.bettingAssessment, kellyB: 0 }, 'positive zero');
    rejects(BettingAssessmentSchema, { ...ENTITY_EXAMPLES.bettingAssessment, kellyB: -0 }, 'negative zero');
  });

  it('a variant may not carry another variant\'s keys', () => {
    rejects(BoutResultSchema, { status: 'pending', outcome: 'A' }, 'pending with outcome');
    rejects(finishProjection(), { status: 'absent', koPct: 50 }, 'absent with percentages');
    rejects(settlement(), { status: 'open', settledAt: null }, 'open with settledAt');
  });
});

describe('odds are integers, not presentation strings', () => {
  it('rejects strings and out-of-range values', () => {
    for (const bad of ['+145', '-150', '', 0, 99, -99, 1.5]) {
      rejects(MarketSnapshotSchema, { ...ENTITY_EXAMPLES.marketSnapshot, oddsA: bad }, `oddsA ${JSON.stringify(bad)}`);
    }
    ok(MarketSnapshotSchema, { ...ENTITY_EXAMPLES.marketSnapshot, oddsA: 100 }, '+100');
    ok(MarketSnapshotSchema, { ...ENTITY_EXAMPLES.marketSnapshot, oddsA: -1600 }, '-1600');
    ok(MarketSnapshotSchema, { ...ENTITY_EXAMPLES.marketSnapshot, oddsB: null }, 'partial market');
  });
});

describe('finishProjection invariants', () => {
  const base = FINISH_PROJECTION_EXAMPLES.singleLeader;
  it('accepts sums of 99, 100 and 101 only', () => {
    ok(finishProjection(), { status: 'computed', koPct: 33, subPct: 33, decPct: 33, leaders: ['KO/TKO', 'SUB', 'DEC'] }, '99');
    ok(finishProjection(), { status: 'computed', koPct: 34, subPct: 33, decPct: 33, leaders: ['KO/TKO'] }, '100');
    ok(finishProjection(), { status: 'computed', koPct: 34, subPct: 34, decPct: 33, leaders: ['KO/TKO', 'SUB'] }, '101');
    rejects(finishProjection(), { status: 'computed', koPct: 30, subPct: 33, decPct: 33, leaders: ['SUB', 'DEC'] }, '96');
    rejects(finishProjection(), { status: 'computed', koPct: 40, subPct: 34, decPct: 33, leaders: ['KO/TKO'] }, '107');
  });

  it('requires leaders to be exactly the argmax set, in canonical order', () => {
    rejects(finishProjection(), { ...base, leaders: ['DEC'] }, 'wrong leader');
    rejects(finishProjection(), { ...base, leaders: ['KO/TKO', 'DEC'] }, 'extra leader');
    rejects(finishProjection(), { status: 'computed', koPct: 42, subPct: 16, decPct: 42, leaders: ['DEC', 'KO/TKO'] }, 'wrong order');
    rejects(finishProjection(), { status: 'computed', koPct: 42, subPct: 16, decPct: 42, leaders: ['KO/TKO'] }, 'missing tied leader');
    ok(finishProjection(), { status: 'computed', koPct: 42, subPct: 16, decPct: 42, leaders: ['KO/TKO', 'DEC'] }, 'canonical tie');
  });

  it('rejects duplicate leaders and out-of-range lengths', () => {
    rejects(finishProjection(), { ...base, leaders: ['KO/TKO', 'KO/TKO'] }, 'duplicates');
    rejects(finishProjection(), { ...base, leaders: [] }, 'empty');
  });
});

describe('settlement rules', () => {
  it('settledAt may be null only for legacy-migrated tracked positions', () => {
    ok(TrackedPositionSchema, ENTITY_EXAMPLES.trackedPositionLegacy, 'legacy null settledAt');
    rejects(TrackedPositionSchema, {
      ...ENTITY_EXAMPLES.trackedPositionAppCreated,
      settlement: SETTLEMENT_EXAMPLES.legacySettledAtNull,
    }, 'appCreated must supply settledAt');
  });

  it('keeps a known sporting outcome with an unknown price', () => {
    ok(settlement(), SETTLEMENT_EXAMPLES.wonUncomputable, 'won + uncomputable');
  });
});

describe('wager independence', () => {
  it('a wager corner may differ from the tracked position corner', () => {
    // Both reference the same assessment and disagree on side — legal by design.
    expect(ENTITY_EXAMPLES.wager.assessmentId).toBe(ENTITY_EXAMPLES.trackedPositionLegacy.assessmentId);
    expect(ENTITY_EXAMPLES.wager.corner).not.toBe(ENTITY_EXAMPLES.trackedPositionLegacy.corner);
    ok(WagerSchema, ENTITY_EXAMPLES.wager, 'wager');
    ok(TrackedPositionSchema, ENTITY_EXAMPLES.trackedPositionLegacy, 'tracked');
  });
});
