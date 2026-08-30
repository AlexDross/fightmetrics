// ─── DOMAIN / BETTING ─────────────────────────────────────────────────────
// Foundation Stage 3. Extracted VERBATIM from src/App.js.
//
// Every line below is byte-identical to its original. Exports are declared in a
// single block at the end so no moved line had to change.
//
// Original locations in App.js (pre-extraction line numbers):
//    1001-1008  americanOdds
//    1009-1017  parseAmericanOdds
//    1018-1029  stripVig
//    1030-1035  calcExpectedValue
//    1036-1042  americanToDecimal
//    1043-1045  createPredictionId
//    3238-3245  kellyFraction
//    3268-3476  computeMarketAnalysis
//    3477-3487  djb2Checksum
//    3488-3514  buildProvenance
//    3515-3645  buildRoiEntry

import { computeFinishProbs, getProjectedFinishLabel } from '../finish';
import { MODEL_V2, computeMatchupEdges, latestFightHistoryDate } from '../model';
import { SOURCE_MANIFEST } from '../../sourceManifest';
import {
  normalizeBoutContext,
  validateBoutContext,
  isSupportedDivision,
} from '../boutContext/index.js';
// Experimental C6 shadow capture. Imported for its runtime functions only; when
// VITE_C6_SHADOW_CAPTURE_ENABLED is false these are never invoked and the saved
// entry shape is byte-identical to before. (Runtime-only cross-reference, so the
// shadow<->betting module cycle is safe.)
import { isShadowCaptureEnabled, buildShadowRecord } from '../shadow/index.js';
// Dependency-neutral market primitives + the snapshot-aware gate. Odds are parsed
// exactly once here (buildMarketInput) and the gate runs on that input; the
// public computeMarketAnalysis below is a thin wrapper preserving the old API.
import {
  americanOdds,
  parseAmericanOdds,
  stripVig,
  calcExpectedValue,
  americanToDecimal,
  kellyFraction,
  djb2Checksum,
  buildMarketInput,
  evaluateGateOnSnapshot,
} from './marketCore.js';
// Shared decision-probability resolver. The Simulator's live preview (App.js)
// and buildRoiEntry below both call this SAME function, so the previewed
// probability and the saved probability can never disagree. See decision.js
// for the v1 / v2 / C6 selection rules.
import { resolveDecisionProbability } from './decision.js';

// americanOdds, parseAmericanOdds, stripVig, calcExpectedValue, americanToDecimal,
// kellyFraction and djb2Checksum now live in ./marketCore.js (dependency-neutral)
// and are imported above + re-exported below, so every existing importer is
// unchanged.

const createPredictionId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;


// Market/edge analysis for a matchup at given American odds. Compatibility
// wrapper: parses the odds ONCE into a single market input and delegates to the
// snapshot-aware gate. Existing callers and outputs are unchanged. Returns null
// when odds are unparseable or `result` is missing (mirrors the manual-save path).
const computeMarketAnalysis = (result, oddsA, oddsB, fA, fB) => {
  const marketInput = buildMarketInput({ oddsA, oddsB });
  return evaluateGateOnSnapshot(result, marketInput, fA, fB);
};

// Builds the ROI card's single-model view from the entry's frozen v2
// probabilities. Older reconstructed rows carry v2pA/v2pB alongside market
// fields that were originally calculated for v1; reading those fields
// directly can therefore show a v2 pick with a recommendation for its
// opponent. Live rows saved with modelUsed === 'v2' already have genuine
// point-in-time v2 market fields, so preserve those instead of re-deriving
// them from today's fighter credibility.
const deriveFrozenV2RoiView = (entry, fighterA, fighterB) => {
  if (entry?.v2pA == null || entry?.v2pB == null) return null;

  const pickA = entry.v2pA >= entry.v2pB;
  const winner = pickA ? entry.fighterA : entry.fighterB;
  const probability = pickA ? entry.v2pA : entry.v2pB;
  const odds = pickA
    ? entry.oddsA || entry.marketOdds || ''
    : entry.oddsB || entry.marketOdds || '';

  let edge = null;
  let betAction = 'NO BET';

  if (entry.modelUsed === 'v2') {
    edge = (pickA ? entry.edgeA : entry.edgeB) ?? entry.edge ?? null;
    betAction = entry._provenance?.frozenTier ?? entry.betAction ?? 'NO BET';
  } else {
    // computeMarketAnalysis only uses domain edges for its confidence score;
    // the ROI card displays the probability/edge/tier, whose gate depends on
    // the frozen probabilities, market prices, and credibility cap. Neutral
    // domain placeholders let this reuse the production gate without
    // recomputing the historical model from post-event fighter data.
    const neutralEdges = Object.fromEntries(
      ['striking', 'grappling', 'physical', 'form', 'experience', 'analytics']
        .map((key) => [key, { clamped: 0 }])
    );
    const fallbackA = {
      FIGHTER: entry.fighterA,
      CREDIBILITY: fighterA?.CREDIBILITY ?? 100,
    };
    const fallbackB = {
      FIGHTER: entry.fighterB,
      CREDIBILITY: fighterB?.CREDIBILITY ?? 100,
    };
    const market = computeMarketAnalysis(
      { pA: entry.v2pA, pB: entry.v2pB, edges: neutralEdges },
      entry.oddsA,
      entry.oddsB,
      fallbackA,
      fallbackB
    );
    edge = market ? (pickA ? market.edgeA : market.edgeB) : null;
    betAction = market?.betAction ?? 'NO BET';
  }

  const actionable =
    betAction === 'LEAN' || betAction === 'BET' || betAction === 'STRONG BET';

  return {
    winner,
    probability,
    fairLine: americanOdds(probability),
    odds,
    edge,
    betAction,
    betFighter: actionable ? winner : '',
  };
};

// djb2Checksum (used to detect MODEL_V2 coefficient drift between saves) now
// lives in ./marketCore.js and is imported + re-exported.

// Builds the _provenance block attached to every saved ROI/Upcoming entry.
// This is the ONLY supported way to produce that block — any script that
// programmatically writes fighterAProb/v2pA/v2pB to roiData.js or
// upcomingData.js should call this rather than hand-constructing the shape,
// so a future bulk recompute can't silently skip provenance the way commit
// 9343523 (2026-07-12) did. See BASELINE_NOTES.md.
//
// predictionTimestamp/captureMode default to "derive from right now" (the
// normal live-save path) but accept overrides — used only for backfilling
// provenance onto entries whose real capture time is a known historical
// moment, not "when this function happened to run."
//
// frozenTier: forward-only, no retrofit onto historical entries. Records the
// bet-action tier the gate assigned AT THIS EXACT CALL, alongside the probs
// it was derived from -- an unambiguous prediction-time tier, unlike the
// top-level `betAction` field, whose provenance turned out to be mixed for
// older entries (verified directly: for reconstructed rows, `betAction` is
// the original v1-era capture tier, never touched by the later v2pA/v2pB
// backfill). Optional and undefined for any caller that doesn't pass it, so
// this is purely additive.
// boutContext: forward-only and OPTIONAL, exactly like frozenTier above. Records
// the scheduled division/title/round context the prediction was computed under,
// plus where that context was sourced from, so a later audit can tell a verified
// non-title three-rounder from an unverified one. Omitted entirely when the
// caller passes nothing, so historical entries and frozen fixtures are untouched.
//
// decisionProbabilitySource/c6: forward-only and OPTIONAL, same precedent.
// Records which probability (v1/v2/c6) actually drove this prediction's bet
// fields, and -- only when it was 'c6' -- the frozen C6 version/pA/pB that
// drove it, so provenance is unambiguous about C6 having driven the decision
// rather than raw v2. Omitted entirely when the caller passes nothing.
export const buildProvenance = ({ eventDate, result, fA, fB, predictionTimestamp, captureMode, frozenTier, boutContext, decisionProbabilitySource, c6 }) => {
  const todayIso = new Date().toISOString().slice(0, 10);
  const resolvedCaptureMode =
    captureMode ??
    (!eventDate ? 'unknown' : eventDate >= todayIso ? 'live' : 'reconstructed');
  return {
    predictionTimestamp: predictionTimestamp ?? new Date().toISOString(),
    targetEventDate: eventDate,
    captureMode: resolvedCaptureMode,
    modelVersion: MODEL_V2.version,
    modelCoefHash: djb2Checksum(JSON.stringify(MODEL_V2.coef)),
    ...(frozenTier !== undefined ? { frozenTier } : {}),
    ...(boutContext !== undefined ? { boutContext } : {}),
    ...(decisionProbabilitySource !== undefined ? { decisionProbabilitySource } : {}),
    ...(c6 !== undefined ? { c6 } : {}),
    featureVector: {
      v1: result.feats,
      v2: result.featsV2 ?? null,
    },
    fightHistoryCutoff: {
      fighterA: latestFightHistoryDate(fA.FIGHT_HISTORY),
      fighterB: latestFightHistoryDate(fB.FIGHT_HISTORY),
    },
    sourceManifest: SOURCE_MANIFEST.modules,
  };
};

// Assembles a complete ROI entry object with the exact shape consumed by the ROI
// tab. Used by the manual savePrediction path ("Save to Upcoming" / "Save and
// Open Upcoming" in the Simulator).

// modelContext is OPTIONAL. The entry's own eventDate is merged into it before
// forwarding, so a saved prediction freezes the ages the fighters will be ON
// FIGHT NIGHT rather than the ages they happened to be on the day it was saved.
// Application callers pass no modelContext at all and get exactly that; only
// the frozen characterisation tests supply one, and theirs still wins (it sets
// useStoredAge) so the approved fixtures keep replaying their captured ages.
// See the comment on computeMatchupEdges.
const buildRoiEntry = ({ fA, fB, oddsA, oddsB, eventName, eventDate, modelToggle = 'v2', unitsWagered = 1, modelContext, boutContext }) => {
  // Correction 3/4: the scheduled context of this bout, normalised once here so
  // the model call, the stored entry and the display all read the same object.
  // null means UNKNOWN and stays unknown -- it is never coerced to non-title or
  // to three rounds.
  //
  // FAIL CLOSED, and validate the RAW value before normalising it. normalize-
  // BoutContext coerces anything malformed to null, so validating afterwards
  // would silently accept `isTitleBout: 'yes'` as "unknown" and persist a
  // different fact than the caller supplied. Validating first means a bad value
  // is rejected rather than quietly rewritten.
  //
  // This guard is independent of the UI. The Simulator also disables its save
  // buttons on invalid context, but a non-UI caller must not be able to persist
  // a contradictory bout, so the rule lives here too.
  //
  // Errors block; WARNINGS DO NOT. A catchweight bout is real and must be
  // saveable -- it just cannot select a division average.
  const rawBoutContext = boutContext ?? modelContext?.boutContext;
  const boutContextValidation = validateBoutContext(rawBoutContext);
  if (!boutContextValidation.valid) {
    throw new TypeError(
      `buildRoiEntry: invalid boutContext — ${boutContextValidation.errors.join('; ')}`
    );
  }
  const normalizedBoutContext = normalizeBoutContext(rawBoutContext);
  const result = computeMatchupEdges(fA, fB, {
    ...(modelContext ?? {}),
    eventDate: eventDate || modelContext?.eventDate,
    boutContext: normalizedBoutContext,
  });
  // Resolve which probability actually drives every bet-decision field below,
  // via the SAME shared resolver the Simulator's live preview calls (see
  // ./decision.js). Mirrors the Simulator's own market useMemo by
  // construction, not by convention -- the two code paths cannot drift.
  // The raw per-model probabilities are still stored separately and
  // unchanged (fighterAProb/fighterBProb = v1, v2pA/v2pB = v2) so the
  // v1-vs-v2 accuracy snapshots stay intact; modelUsed records which base
  // model (v1/v2) was selected, and decisionProbabilitySource (below) records
  // which probability -- v1, v2, or C6 -- actually drove the bet fields.
  const decision = resolveDecisionProbability({
    modelToggle,
    v1pA: result.pA,
    v1pB: result.pB,
    v2pA: result.v2pA,
    v2pB: result.v2pB,
    oddsA,
    oddsB,
  });
  const activePA = decision.pA;
  const activePB = decision.pB;
  const activeResult = { ...result, pA: activePA, pB: activePB };
  // C6 and the betting gate consume the ONE market snapshot the resolver
  // already parsed -- odds are never re-parsed here.
  const market = evaluateGateOnSnapshot(activeResult, decision.market, fA, fB);

  // predictedWinner/predictedProb stay on the v1 snapshot (consumed by the v1
  // accuracy stats and the "v2 differs" comparisons). trackedSide is the active
  // model's pick — the side actually being tracked/bet.
  const predictedWinner = result.pA >= result.pB ? fA.FIGHTER : fB.FIGHTER;
  const trackedSide = activePA >= activePB ? fA.FIGHTER : fB.FIGHTER;
  const trackedProb = trackedSide === fA.FIGHTER ? activePA : activePB;
  const trackedOdds =
    trackedSide === fA.FIGHTER
      ? oddsA || ''
      : trackedSide === fB.FIGHTER
      ? oddsB || ''
      : '';
  const trackedEdge =
    trackedSide === fA.FIGHTER
      ? market?.edgeA ?? null
      : trackedSide === fB.FIGHTER
      ? market?.edgeB ?? null
      : null;
  const trackedEV =
    trackedSide === fA.FIGHTER
      ? market?.evA ?? null
      : trackedSide === fB.FIGHTER
      ? market?.evB ?? null
      : null;
  const trackedKelly =
    trackedSide === fA.FIGHTER
      ? market?.kellyA ?? null
      : trackedSide === fB.FIGHTER
      ? market?.kellyB ?? null
      : null;
  const trackedFairLine =
    trackedSide === fA.FIGHTER
      ? market?.fairLineA ?? null
      : trackedSide === fB.FIGHTER
      ? market?.fairLineB ?? null
      : null;
  const betRecommendedFighter =
    market?.bestBet === 'A'
      ? fA.FIGHTER
      : market?.bestBet === 'B'
      ? fB.FIGHTER
      : '';

  const betRecommendedOdds =
    market?.bestBet === 'A'
      ? oddsA || ''
      : market?.bestBet === 'B'
      ? oddsB || ''
      : '';

  const entry = {
    id: createPredictionId(),
    createdAt: new Date().toISOString(),
    eventName,
    eventDate,
    fighterA: fA.FIGHTER,
    fighterB: fB.FIGHTER,
    fighterAIsProspect: !!fA.IS_PROSPECT,
    fighterBIsProspect: !!fB.IS_PROSPECT,
    includesProspect: !!fA.IS_PROSPECT || !!fB.IS_PROSPECT,
    // Legacy display string. A verified canonical bout division is the truth and
    // wins outright; without one this keeps the previous roster-derived
    // behaviour, including the "A / B" concatenation that signals the two
    // corners' stored classes disagree. That concatenation is a display artifact
    // of stale roster data, never a statement about where the bout is contested.
    division: isSupportedDivision(normalizedBoutContext?.division)
      ? normalizedBoutContext.division
      : fA.WEIGHT_CLASS === fB.WEIGHT_CLASS
      ? fA.WEIGHT_CLASS
      : `${fA.WEIGHT_CLASS} / ${fB.WEIGHT_CLASS}`,
    // Scheduled bout context. Null fields mean unverified, not "no".
    //
    // Emitted ONLY when there is context to carry, matching the frozenTier
    // precedent above. An absent key is the single "legacy or unknown" signal
    // every consumer checks, and it keeps entries saved without context
    // byte-identical to what this function produced before Correction 3/4.
    ...(normalizedBoutContext !== null ? { boutContext: normalizedBoutContext } : {}),
    fighterAProb: result.pA,
    fighterBProb: result.pB,
    predictedWinner,
    predictedProb: predictedWinner === fA.FIGHTER ? result.pA : result.pB,
    modelUsed: modelToggle,
    // Authoritative decision-probability source: 'v1' | 'v2' | 'c6'. modelUsed
    // above stays the SELECTED base model (unchanged, for compatibility with
    // every existing consumer); this field says which probability actually
    // drove trackedSide/trackedProb/edge/ev/kelly/fairLine/betAction/bestBet
    // below -- 'c6' only when user-facing C6 was active, available, and used.
    // Always present (like v2pA/v2pB) so a consumer never has to special-case
    // its absence; 'v1'/'v2' here is not C6 metadata and is never misleading.
    decisionProbabilitySource: decision.source,
    // decisionUnavailableReason/c6ProbA/c6ProbB/c6Version are OMITTED (not
    // present-as-null) on an ordinary v1/v2/flag-off save -- they are
    // C6-specific facts, and adding null C6 metadata to every save (the vast
    // majority, with the flag off) is unnecessary schema/golden-fixture churn.
    // decisionUnavailableReason is present only when C6 was explicitly
    // requested and could not be used; c6ProbA/c6ProbB/c6Version are present
    // only when C6 actually drove the decision. Never recomputed downstream --
    // loading/export/grading only ever read these, they must not call C6 again.
    ...(decision.unavailableReason != null ? { decisionUnavailableReason: decision.unavailableReason } : {}),
    ...(decision.source === 'c6'
      ? { c6ProbA: decision.c6ProbA, c6ProbB: decision.c6ProbB, c6Version: decision.c6Version }
      : {}),
    trackedSide,
    trackedProb,
    // Units actually staked on trackedSide at save time. Defaults to 1
    // (matches every pre-existing entry, which was always flat 1u).
    unitsWagered,
    betAction: market?.betAction ?? 'NO BET',
    bestBet: market?.bestBet ?? null,
    betRecommendedFighter,
    betRecommendedOdds,
    marketOdds: trackedOdds,
    edge: trackedEdge,
    edgeA: market?.edgeA ?? null,
    edgeB: market?.edgeB ?? null,
    ev: trackedEV,
    evA: market?.evA ?? null,
    evB: market?.evB ?? null,
    kelly: trackedKelly,
    kellyA: market?.kellyA ?? null,
    kellyB: market?.kellyB ?? null,
    fairLine: trackedFairLine,
    fairLineA: market?.fairLineA ?? null,
    fairLineB: market?.fairLineB ?? null,
    oddsA,
    oddsB,
    v2pA: result.v2pA ?? null,
    v2pB: result.v2pB ?? null,
    ...(() => {
      const { ko, sub, dec } = computeFinishProbs(fA, fB);
      return {
        projectedKO: ko,
        projectedSUB: sub,
        projectedDEC: dec,
        projectedFinish: getProjectedFinishLabel({ ko, sub, dec }),
      };
    })(),
    actualWinner: '',
    actualFinish: '',
    notes: '',
    // Additive metadata only — does not affect any field above. Lets future
    // analysis answer "is this prediction authentically point-in-time or
    // reconstructed" and "what fed it" without a manual forensic audit (see
    // research/source_integrity_audit.md and research/daysSinceLast_live_audit.md,
    // which this schema exists to make unnecessary going forward).
    _provenance: buildProvenance({
      eventDate,
      result,
      fA,
      fB,
      frozenTier: market?.betAction ?? 'NO BET',
      boutContext: normalizedBoutContext ?? undefined,
      decisionProbabilitySource: decision.source,
      c6: decision.source === 'c6' ? { version: decision.c6Version, pA: decision.c6ProbA, pB: decision.c6ProbB } : undefined,
    }),
  };

  // Experimental C6 shadow capture (feature-flagged, OFF by default). Attached
  // ONCE here at save time and never recomputed downstream. When the flag is off
  // no field is added, so the saved entry shape is unchanged. capturedAt reuses
  // entry.createdAt so the frozen odds snapshot and the entry share one instant.
  if (isShadowCaptureEnabled()) {
    entry._c6Shadow = buildShadowRecord({
      fA,
      fB,
      oddsA,
      oddsB,
      eventName,
      eventDate,
      fightId: entry.id,
      v2pA: result.v2pA ?? null,
      v2pB: result.v2pB ?? null,
      capturedAt: entry.createdAt,
      createdAt: entry.createdAt,
    });
  }

  return entry;
};

// NO READ: when the ACTIVE model's pick probability is below 53%, the fight is
// treated as a coin-flip and any bet read is suppressed. Distinct from NO BET,
// which means conviction exists but the market offers no value.
//
// Extracted from App.js in Stage 4 so the rule is callable production code
// rather than an inline expression inside a render path. The threshold is
// unchanged: strictly less than 0.53.
const isNoReadProbability = (probability) => probability < 0.53;

export {
  isNoReadProbability,
  americanOdds,
  parseAmericanOdds,
  stripVig,
  calcExpectedValue,
  americanToDecimal,
  createPredictionId,
  kellyFraction,
  computeMarketAnalysis,
  deriveFrozenV2RoiView,
  djb2Checksum,
  buildRoiEntry,
  evaluateGateOnSnapshot,
};
export {
  resolveDecisionProbability,
  resolveFrozenDecisionView,
  resolveFrozenPerformanceView,
  DECISION_SOURCE_V1,
  DECISION_SOURCE_V2,
  DECISION_SOURCE_C6,
  DECISION_LABEL_V1,
  DECISION_LABEL_V2,
  DECISION_LABEL_C6,
} from './decision.js';
export { buildParlayLeg } from './parlayLeg.js';
