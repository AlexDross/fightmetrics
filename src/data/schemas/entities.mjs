// Stage 6 — the eleven durable entities. Strict throughout: unknown keys are
// errors, `undefined` is never accepted, absence is explicit `null`.
//
// Presence rule: for the SELECTED discriminated-union variant every field that
// variant defines is present (nullable ones carrying explicit null); fields
// belonging only to other variants are absent. That is why `{status:'pending'}`
// legitimately has no `method` key while `{status:'resolved', ...}` carries
// `method: null`.
import { z } from 'zod';
import {
  americanOdds, Corner, CaptureMode, externalIds, finiteNumber, finishProjection,
  FinishMethod, integer, isoDate, isoDateTime, legacyOrUuid, ModelBasis,
  nonEmptyString, PickSource, probability, ProvenanceCompleteness, RecordOrigin,
  reviewState, settlement, stakeUnits, BetTier, uuid,
} from './primitives.mjs';

// ── Event ──────────────────────────────────────────────────────────────────
// name and date are MUTABLE metadata. Nothing joins on them; every child points
// at the opaque id. promotion is nullable because a saved event name proves only
// its own text: "Freedom 250" does not tell us which promotion ran the card.
export const EventSchema = z.strictObject({
  id: uuid(),
  promotion: nonEmptyString().nullable(),
  name: nonEmptyString(),
  date: isoDate(),
  externalIds: externalIds(),
  createdAt: isoDateTime(),
  updatedAt: isoDateTime().nullable(),
});

// ── Bout ───────────────────────────────────────────────────────────────────
// fighterId stays null until Stage 9. fighterKey is a NON-AUTHORITATIVE join
// hint (normalised display name) used only as a migration matching aid — it is
// never a uniqueness constraint, because names collide.
export const FighterRefSchema = z.strictObject({
  displayName: nonEmptyString(),
  fighterKey: nonEmptyString(),
  fighterId: uuid().nullable(),
});

export const BoutResultSchema = z.discriminatedUnion('status', [
  z.strictObject({ status: z.literal('pending') }),
  z.strictObject({
    status: z.literal('resolved'),
    outcome: z.enum(['A', 'B', 'draw', 'noContest']),
    method: FinishMethod.nullable(),
  }),
]);

export const BoutSchema = z.strictObject({
  id: uuid(),
  eventId: uuid(),
  cornerA: FighterRefSchema,
  cornerB: FighterRefSchema,
  division: nonEmptyString(),
  boardOrder: integer().nullable(),
  scheduledRounds: integer().nullable(),
  result: BoutResultSchema,
  externalIds: externalIds(),
  createdAt: isoDateTime(),
  updatedAt: isoDateTime().nullable(),
});

// ── PredictionRun ──────────────────────────────────────────────────────────
// One per legacy save. Holds what is shared across model bases: the finish
// projection, prospect-at-capture context, and the frozen target event date.
//
// decisionSnapshotId is the ONLY record of which basis drove the saved
// decision. There is deliberately no `decisionBasis` string and no
// `isDecisionBasis` flag — duplicated state that could disagree.
export const PredictionRunSchema = z.strictObject({
  id: legacyOrUuid(),
  boutId: uuid(),
  legacyEntryId: z.string().nullable(),
  createdAt: isoDateTime(),
  decisionSnapshotId: uuid(),
  targetEventDateAtCapture: isoDate(),
  finishProjection: finishProjection(),
  cornerAIsProspectAtCapture: z.boolean().nullable(),
  cornerBIsProspectAtCapture: z.boolean().nullable(),
  includesProspectAtCapture: z.boolean().nullable(),
  provenanceCompleteness: ProvenanceCompleteness,
});

// ── PredictionSnapshot ─────────────────────────────────────────────────────
// IMMUTABLE. One per model basis, so a v1 decision that later had v2
// reconstructed onto it keeps both outputs with their own capture modes — the
// exact case a single probA/probB pair could not represent.
export const ReconstructionSchema = z.strictObject({
  type: z.enum(['backfilled', 'rewritten']),
  sourceCommit: nonEmptyString(),
  priorV2: z
    .strictObject({ v2pA: probability(), v2pB: probability() })
    .nullable(),
});

const SourceManifestModuleSchema = z.strictObject({
  contentHash: nonEmptyString(),
  feedsV2: z.boolean(),
  file: nonEmptyString(),
  generatedAt: nonEmptyString(),
  generatorVersion: nonEmptyString(),
  maxObservedEventDate: nonEmptyString().nullable(),
  note: nonEmptyString().nullable(),
  verificationMethod: nonEmptyString(),
});

export const PredictionSnapshotSchema = z.strictObject({
  id: uuid(),
  runId: legacyOrUuid(),
  boutId: uuid(),
  basis: ModelBasis,
  modelVersion: nonEmptyString().nullable(),
  modelCoefHash: nonEmptyString().nullable(),
  probA: probability(),
  probB: probability(),
  winnerCorner: Corner,
  capturedAt: isoDateTime(),
  captureMode: CaptureMode,
  reconstruction: ReconstructionSchema.nullable(),
  featureVector: z.record(z.string(), finiteNumber()).nullable(),
  fightHistoryCutoff: z
    .strictObject({ cornerA: isoDate().nullable(), cornerB: isoDate().nullable() })
    .nullable(),
  sourceManifest: z.record(z.string(), SourceManifestModuleSchema).nullable(),
});

// ── MarketSnapshot ─────────────────────────────────────────────────────────
// IMMUTABLE, market FACTS ONLY. No fair line, edge, EV, Kelly or tier: those
// combine a market with a model and live on BettingAssessment, because one
// market can be assessed against several prediction snapshots.
//
// Implied and no-vig probabilities are deterministic from these odds and are
// deliberately NOT persisted — storing them null-until-computed would add
// states without adding information.
//
// A snapshot may hold odds for one corner and not the other; that is why
// financial computability is decided by the SELECTED corner's odds rather than
// by whether a snapshot exists.
export const MarketSnapshotSchema = z.strictObject({
  id: uuid(),
  boutId: uuid(),
  capturedAt: isoDateTime(),
  source: z.enum(['manual']),
  oddsA: americanOdds().nullable(),
  oddsB: americanOdds().nullable(),
});

// ── BettingAssessment ──────────────────────────────────────────────────────
// IMMUTABLE = prediction x market. BOTH corners are retained for every derived
// value because the application reads both.
//
// No trackedCorner here: which side FightMetrics chose to follow is not a
// model/market calculation, it is a position. It lives on TrackedPosition.
// No basis here either — it is deref(predictionSnapshotId).basis.
export const BettingAssessmentSchema = z.strictObject({
  id: uuid(),
  boutId: uuid(),
  runId: legacyOrUuid(),
  predictionSnapshotId: uuid(),
  marketSnapshotId: uuid().nullable(),
  frozenAt: isoDateTime(),
  fairLineA: americanOdds().nullable(),
  fairLineB: americanOdds().nullable(),
  edgeA: finiteNumber().nullable(),
  edgeB: finiteNumber().nullable(),
  evA: finiteNumber().nullable(),
  evB: finiteNumber().nullable(),
  kellyA: finiteNumber().nullable(),
  kellyB: finiteNumber().nullable(),
  tier: BetTier.nullable(),
  recommendedCorner: Corner.nullable(),
  // Keeps a real "no recommendation" (109 legacy rows with bestBet null)
  // distinct from historical absence (10 rows predating the betting layer).
  tierProvenance: z.enum(['stored', 'frozenTier', 'absent']),
  recommendedCornerProvenance: z.enum(['stored', 'absentInLegacy']),
});

// ── TrackedPosition ────────────────────────────────────────────────────────
// The historical / model-performance record. EVERY legacy row becomes one of
// these, including all 114 NO BET rows and the 10 with no tier at all —
// computeROISummary already counts them, so dropping them would silently
// rewrite the track record.
//
// origin records that legacy data cannot prove cash was placed. It is not a
// wager; see WagerSchema.
export const TrackedPositionSchema = z
  .strictObject({
    id: uuid(),
    boutId: uuid(),
    assessmentId: uuid(),
    // The price this position is SCORED at. Independent of both
    // BettingAssessment.marketSnapshotId (the prediction-time market that
    // produced the frozen tier/edge/EV/Kelly) and Wager.marketSnapshotId (the
    // price actually taken). They may start equal and diverge.
    //
    // This is what makes an ROI odds correction possible without touching the
    // assessment: amending the tracked price appends a NEW immutable
    // MarketSnapshot and repoints only this field. The assessment and its
    // original market stay frozen, so the historical analysis that justified
    // the position is never rewritten.
    marketSnapshotId: uuid().nullable(),
    origin: RecordOrigin,
    corner: Corner,
    stakeUnits: stakeUnits(),
    stakeSource: z.enum(['explicit', 'defaultedFlat1u']),
    openedAt: isoDateTime(),
    settlement: settlement(),
    reviewState: reviewState(),
    notes: z.string().nullable(),
  })
  .check((ctx) => {
    const v = ctx.value;
    if (!v) return;
    // A null settlement time is a legacy-only concession: those 153 rows never
    // recorded one. Anything the app settles itself must supply a real time.
    if (
      v.settlement?.status === 'settled' &&
      v.settlement.settledAt === null &&
      v.origin !== 'legacyMigration'
    ) {
      ctx.issues.push({
        code: 'custom',
        input: v,
        message: 'settledAt may only be null for origin "legacyMigration"',
      });
    }
    // Same concession, same reason: the legacy UI recorded that an entry was
    // confirmed but never when. A confirmation the app performs must be timed.
    if (
      v.reviewState?.status === 'confirmed' &&
      v.reviewState.confirmedAt === null &&
      v.origin !== 'legacyMigration'
    ) {
      ctx.issues.push({
        code: 'custom',
        input: v,
        message: 'reviewState.confirmedAt may only be null for origin "legacyMigration"',
      });
    }
  });

// ── Wager ──────────────────────────────────────────────────────────────────
// A genuinely PLACED straight bet. Migration creates ZERO of these: legacy data
// cannot prove placement. Defined now so Stage 7/11 needs no schema change.
//
// Deliberately independent of TrackedPosition: a real bet may be on the other
// side from the model-tracked corner, and forcing them to agree would make that
// unrepresentable.
export const WagerSchema = z.strictObject({
  id: uuid(),
  boutId: uuid(),
  assessmentId: uuid(),
  marketSnapshotId: uuid().nullable(),
  corner: Corner,
  stakeUnits: stakeUnits(),
  placedAt: isoDateTime(),
  settlement: settlement(),
  notes: z.string().nullable(),
  externalIds: externalIds(),
});

// ── Prop ───────────────────────────────────────────────────────────────────
// corner null = a genuinely fight-level prop ("goes the distance"). Useful even
// though all four legacy props name a corner.
export const PropTargetSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('bout'), boutId: uuid(), corner: Corner.nullable() }),
  z.strictObject({ kind: z.literal('event'), eventId: uuid() }),
]);

export const PropSchema = z.strictObject({
  id: legacyOrUuid(),
  eventId: uuid(),
  target: PropTargetSchema,
  method: nonEmptyString(),
  propType: nonEmptyString(),
  label: nonEmptyString(),
  odds: americanOdds(),
  stakeUnits: stakeUnits(),
  result: z.enum(['PENDING', 'WON', 'LOST', 'PUSH']),
  pickSource: PickSource,
  createdAt: isoDateTime(),
});

// ── Parlay ─────────────────────────────────────────────────────────────────
// status/result are NOT stored: they are re-derived from bout results at read
// time, per the locked no-freeze decision in src/parlayData.js.
export const ParlayLegSchema = z.strictObject({
  boutId: uuid(),
  pickedCorner: Corner,
  modelDefaultCorner: Corner.nullable(),
  modelProbAtBuild: probability().nullable(),
  overridden: z.boolean(),
});

export const ParlaySchema = z.strictObject({
  id: legacyOrUuid(),
  eventId: uuid().nullable(),
  combinedOdds: americanOdds(),
  stakeUnits: stakeUnits(),
  pickSource: PickSource,
  createdAt: isoDateTime(),
  legs: z.array(ParlayLegSchema).min(1),
});

// ── Store ──────────────────────────────────────────────────────────────────
export const SCHEMA_VERSION = 1;

export const MetaSchema = z.strictObject({
  schemaVersion: integer().min(1),
  migratedAt: isoDateTime().nullable(),
});

export const StoreSchema = z.strictObject({
  meta: MetaSchema,
  events: z.array(EventSchema),
  bouts: z.array(BoutSchema),
  predictionRuns: z.array(PredictionRunSchema),
  predictionSnapshots: z.array(PredictionSnapshotSchema),
  marketSnapshots: z.array(MarketSnapshotSchema),
  bettingAssessments: z.array(BettingAssessmentSchema),
  trackedPositions: z.array(TrackedPositionSchema),
  wagers: z.array(WagerSchema),
  props: z.array(PropSchema),
  parlays: z.array(ParlaySchema),
});

export const ENTITY_SCHEMAS = Object.freeze({
  events: EventSchema,
  bouts: BoutSchema,
  predictionRuns: PredictionRunSchema,
  predictionSnapshots: PredictionSnapshotSchema,
  marketSnapshots: MarketSnapshotSchema,
  bettingAssessments: BettingAssessmentSchema,
  trackedPositions: TrackedPositionSchema,
  wagers: WagerSchema,
  props: PropSchema,
  parlays: ParlaySchema,
});
