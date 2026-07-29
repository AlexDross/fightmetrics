// Stage 6 — one canonical, schema-valid example per discriminated-union variant.
//
// These are the reference shapes: what a valid record looks like, including
// which keys are PRESENT-BUT-NULL and which are ABSENT because they belong to a
// different variant. examples.test.js validates every one of them and asserts
// that the variant coverage is complete, so a new variant cannot be added
// without an example.
const E = '00000000-0000-7000-8000-000000000001'; // event
const B = '00000000-0000-7000-8000-000000000002'; // bout
const R = '1780000000000-abc123';                 // run (legacy id shape)
const S1 = '00000000-0000-7000-8000-000000000003'; // v1 snapshot
const S2 = '00000000-0000-7000-8000-000000000004'; // v2 snapshot
const M = '00000000-0000-7000-8000-000000000005'; // market
const A = '00000000-0000-7000-8000-000000000006'; // assessment
const T = '00000000-0000-7000-8000-000000000007'; // tracked position
const W = '00000000-0000-7000-8000-000000000008'; // wager
const TS = '2026-06-01T12:00:00.000Z';

export const BOUT_RESULT_EXAMPLES = Object.freeze({
  // No `outcome`/`method` keys at all — they belong to the other variant.
  pending: { status: 'pending' },
  resolvedCornerA: { status: 'resolved', outcome: 'A', method: 'KO/TKO' },
  resolvedCornerB: { status: 'resolved', outcome: 'B', method: 'DEC' },
  // A real record: DRAW that still has a resolved method.
  draw: { status: 'resolved', outcome: 'draw', method: 'DEC' },
  // Both legacy no-contests recorded no method.
  noContest: { status: 'resolved', outcome: 'noContest', method: null },
});

export const FINISH_PROJECTION_EXAMPLES = Object.freeze({
  absent: { status: 'absent' },
  singleLeader: { status: 'computed', koPct: 57, subPct: 15, decPct: 28, leaders: ['KO/TKO'] },
  // "KO/TKO / DEC" in legacy form — a genuine tie.
  tiedLeaders: { status: 'computed', koPct: 42, subPct: 16, decPct: 42, leaders: ['KO/TKO', 'DEC'] },
  threeWayTie: { status: 'computed', koPct: 33, subPct: 33, decPct: 33, leaders: ['KO/TKO', 'SUB', 'DEC'] },
  sum99: { status: 'computed', koPct: 33, subPct: 33, decPct: 33, leaders: ['KO/TKO', 'SUB', 'DEC'] },
  sum101: { status: 'computed', koPct: 34, subPct: 34, decPct: 33, leaders: ['KO/TKO', 'SUB'] },
});

export const SETTLEMENT_EXAMPLES = Object.freeze({
  open: { status: 'open' },
  wonComputed: {
    status: 'settled', outcome: 'won',
    financialResult: { status: 'computed', profitUnits: 1.5 },
    settledAt: TS,
  },
  lostComputed: {
    status: 'settled', outcome: 'lost',
    financialResult: { status: 'computed', profitUnits: -1 },
    settledAt: TS,
  },
  // DRAW -> push, always a computed zero, priced or not.
  pushZero: {
    status: 'settled', outcome: 'push',
    financialResult: { status: 'computed', profitUnits: 0 },
    settledAt: TS,
  },
  // No contest -> void, likewise zero.
  voidZero: {
    status: 'settled', outcome: 'void',
    financialResult: { status: 'computed', profitUnits: 0 },
    settledAt: TS,
  },
  // Known sporting outcome, unknown price: the state that made financialResult
  // a separate union rather than a nullable profit number.
  wonUncomputable: {
    status: 'settled', outcome: 'won',
    financialResult: { status: 'uncomputable', reason: 'missingSelectedCornerOdds' },
    settledAt: TS,
  },
  // Legacy-migrated: settlement time genuinely unknown.
  legacySettledAtNull: {
    status: 'settled', outcome: 'won',
    financialResult: { status: 'computed', profitUnits: 0.91 },
    settledAt: null,
  },
});

export const PROP_TARGET_EXAMPLES = Object.freeze({
  boutCorner: { kind: 'bout', boutId: B, corner: 'A' },
  boutFightLevel: { kind: 'bout', boutId: B, corner: null },
  eventLevel: { kind: 'event', eventId: E },
});

export const RECONSTRUCTION_EXAMPLES = Object.freeze({
  none: null,
  backfilledWithPrior: {
    type: 'backfilled', sourceCommit: '93435237a98012ae09eea71c5cc05205ec2ba9d3',
    priorV2: { v2pA: 0.44, v2pB: 0.56 },
  },
  rewrittenNoPrior: {
    type: 'rewritten', sourceCommit: '93435237a98012ae09eea71c5cc05205ec2ba9d3',
    priorV2: null,
  },
});

export const ENTITY_EXAMPLES = Object.freeze({
  event: {
    id: E, promotion: 'UFC', name: 'UFC 329', date: '2026-07-11',
    externalIds: {}, createdAt: TS, updatedAt: null,
  },
  eventUnknownPromotion: {
    id: E, promotion: null, name: 'Freedom 250', date: '2026-06-14',
    externalIds: {}, createdAt: TS, updatedAt: null,
  },
  bout: {
    id: B, eventId: E,
    cornerA: { displayName: 'Alex Pereira', fighterKey: 'alex pereira', fighterId: null },
    cornerB: { displayName: 'Ciryl Gane', fighterKey: 'ciryl gane', fighterId: null },
    division: 'Light Heavyweight / Heavyweight',
    boardOrder: null, scheduledRounds: null,
    result: BOUT_RESULT_EXAMPLES.resolvedCornerB,
    externalIds: {}, createdAt: TS, updatedAt: null,
  },
  predictionRun: {
    id: R, boutId: B, legacyEntryId: R, createdAt: TS,
    decisionSnapshotId: S1,
    targetEventDateAtCapture: '2026-07-11',
    finishProjection: FINISH_PROJECTION_EXAMPLES.singleLeader,
    cornerAIsProspectAtCapture: false,
    cornerBIsProspectAtCapture: null,
    includesProspectAtCapture: false,
    provenanceCompleteness: 'partial',
  },
  predictionSnapshotV1: {
    id: S1, runId: R, boutId: B, basis: 'legacy-v1-unversioned',
    modelVersion: null, modelCoefHash: null,
    probA: 0.6537390566640813, probB: 0.3462609433359187, winnerCorner: 'A',
    capturedAt: TS, captureMode: 'unknown', reconstruction: null,
    featureVector: null, fightHistoryCutoff: null, sourceManifest: null,
  },
  predictionSnapshotV2Reconstructed: {
    id: S2, runId: R, boutId: B, basis: 'v2',
    modelVersion: 'logistic_v2.0_20260709', modelCoefHash: '256f866e',
    probA: 0.4432, probB: 0.5568, winnerCorner: 'B',
    capturedAt: TS, captureMode: 'reconstructed',
    reconstruction: RECONSTRUCTION_EXAMPLES.backfilledWithPrior,
    featureVector: { elo: 1.07, younger: -1 },
    fightHistoryCutoff: { cornerA: '2025-10-04', cornerB: null },
    sourceManifest: null,
  },
  marketSnapshot: {
    id: M, boutId: B, capturedAt: TS, source: 'manual', oddsA: -150, oddsB: 130,
  },
  // A partial market: one corner priced, the other not. This is why
  // computability follows the selected corner rather than snapshot existence.
  marketSnapshotPartial: {
    id: M, boutId: B, capturedAt: TS, source: 'manual', oddsA: -150, oddsB: null,
  },
  bettingAssessment: {
    id: A, boutId: B, runId: R, predictionSnapshotId: S1, marketSnapshotId: M, frozenAt: TS,
    fairLineA: -189, fairLineB: 189,
    edgeA: 0.0523, edgeB: -0.0523, evA: 12.4, evB: -8.1, kellyA: 0.061, kellyB: 0,
    tier: 'LEAN', recommendedCorner: 'A',
    tierProvenance: 'stored', recommendedCornerProvenance: 'stored',
  },
  // No market at all: every derived value must be null.
  bettingAssessmentNoMarket: {
    id: A, boutId: B, runId: R, predictionSnapshotId: S1, marketSnapshotId: null, frozenAt: TS,
    fairLineA: null, fairLineB: null, edgeA: null, edgeB: null,
    evA: null, evB: null, kellyA: null, kellyB: null,
    tier: 'NO BET', recommendedCorner: null,
    tierProvenance: 'stored', recommendedCornerProvenance: 'stored',
  },
  // The 10 oldest rows: no tier and no bestBet key at all.
  bettingAssessmentPreBettingLayer: {
    id: A, boutId: B, runId: R, predictionSnapshotId: S1, marketSnapshotId: M, frozenAt: TS,
    fairLineA: -189, fairLineB: 189, edgeA: 0.05, edgeB: -0.05,
    evA: 12.4, evB: -8.1, kellyA: 0.06, kellyB: 0,
    tier: null, recommendedCorner: null,
    tierProvenance: 'absent', recommendedCornerProvenance: 'absentInLegacy',
  },
  trackedPositionLegacy: {
    id: T, boutId: B, assessmentId: A, origin: 'legacyMigration',
    corner: 'A', stakeUnits: 1, stakeSource: 'defaultedFlat1u', openedAt: TS,
    settlement: SETTLEMENT_EXAMPLES.legacySettledAtNull, notes: null,
  },
  trackedPositionAppCreated: {
    id: T, boutId: B, assessmentId: A, origin: 'appCreated',
    corner: 'B', stakeUnits: 2, stakeSource: 'explicit', openedAt: TS,
    settlement: SETTLEMENT_EXAMPLES.wonComputed, notes: 'closed early',
  },
  // Migration produces none of these; defined so Stage 7/11 needs no change.
  wager: {
    id: W, boutId: B, assessmentId: A, marketSnapshotId: M,
    corner: 'B', stakeUnits: 0.5, placedAt: TS,
    settlement: SETTLEMENT_EXAMPLES.lostComputed,
    notes: null, externalIds: {},
  },
  prop: {
    id: '1785010791678-xy52xd', eventId: E,
    target: PROP_TARGET_EXAMPLES.boutCorner,
    method: 'Submission', propType: 'Method of Victory',
    label: 'Valter Walker wins by Submission',
    odds: 145, stakeUnits: 1, result: 'WON', pickSource: 'human', createdAt: TS,
  },
  parlay: {
    id: '1785010791678-aa11bb', eventId: E, combinedOdds: 300, stakeUnits: 1,
    pickSource: 'human', createdAt: TS,
    legs: [
      { boutId: B, pickedCorner: 'A', modelDefaultCorner: 'A', modelProbAtBuild: 0.61, overridden: false },
    ],
  },
});
