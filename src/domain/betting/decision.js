// ─── DOMAIN / BETTING / DECISION RESOLVER ────────────────────────────────────
// Single shared resolver for "which probability drives the Simulator display
// and the betting gate": raw v1, raw v2, or C6 (v2 blended with the no-vig
// market, promoted to user-facing when VITE_C6_USER_FACING_ENABLED is on).
//
// The Simulator's live preview and buildRoiEntry's save path both call this
// SAME pure function with the same inputs, so the previewed probability and
// the saved probability can never disagree about which number was used or
// why. Callers must feed the returned `market` snapshot straight into
// evaluateGateOnSnapshot rather than re-parsing oddsA/oddsB -- C6 and the
// betting gate consume one shared no-vig snapshot, never two.
//
// Flow (intentional, one-directional): v2 probability + no-vig market
// probability -> C6 probability -> existing betting gate. The gate's own
// output is never fed back into C6.

import { buildMarketInput, americanOdds } from './marketCore.js';
import { computeC6ProbA } from '../shadow/c6.js';
import { isC6UserFacingActive } from '../shadow/config.js';

export const DECISION_SOURCE_V1 = 'v1';
export const DECISION_SOURCE_V2 = 'v2';
export const DECISION_SOURCE_C6 = 'c6';

export const DECISION_LABEL_V1 = 'Model estimate (v1)';
export const DECISION_LABEL_V2 = 'Model estimate (v2)';
export const DECISION_LABEL_C6 = 'Market-adjusted estimate (C6)';

const buildResult = (source, pA, pB, label, market, overrides = {}) => ({
  source,
  pA,
  pB,
  label,
  c6Requested: false,
  c6Available: false,
  c6Version: null,
  c6ProbA: null,
  c6ProbB: null,
  unavailableReason: null,
  bettingSuppressed: false,
  bettingSuppressedReason: null,
  market,
  ...overrides,
});

/**
 * Resolve the probability that drives the Simulator display AND the betting
 * gate, from one pure, side-effect-free call. Never throws.
 *
 * @param {{
 *   modelToggle: ('v1'|'v2'),
 *   v1pA:number, v1pB:number,
 *   v2pA:(number|null|undefined), v2pB:(number|null|undefined),
 *   oddsA:string, oddsB:string,
 *   c6UserFacingEnabled?:boolean   // defaults to the resolved env flag
 * }} args
 * @returns {{
 *   source:('v1'|'v2'|'c6'), pA:number, pB:number, label:string,
 *   c6Requested:boolean, c6Available:boolean, c6Version:(string|null),
 *   c6ProbA:(number|null), c6ProbB:(number|null),
 *   unavailableReason:(string|null),
 *   bettingSuppressed:boolean, bettingSuppressedReason:(string|null),
 *   market:object   // buildMarketInput output -- the ONE snapshot for the gate
 * }}
 */
export function resolveDecisionProbability({
  modelToggle,
  v1pA,
  v1pB,
  v2pA,
  v2pB,
  oddsA,
  oddsB,
  c6UserFacingEnabled = isC6UserFacingActive(),
} = {}) {
  const market = buildMarketInput({ oddsA, oddsB });

  // v1 explicitly selected: C6 never applies, regardless of the flag. Bypass
  // entirely so switching back to v2 restores the rules below unchanged.
  if (modelToggle !== 'v2') {
    return buildResult(DECISION_SOURCE_V1, v1pA, v1pB, DECISION_LABEL_V1, market);
  }

  const hasV2 = Number.isFinite(v2pA) && Number.isFinite(v2pB);
  if (!hasV2) {
    // v2 selected but unavailable -- fall back to v1 exactly as the
    // pre-C6 Simulator already did when result.v2pA/v2pB are null.
    return buildResult(DECISION_SOURCE_V1, v1pA, v1pB, DECISION_LABEL_V1, market, {
      c6Requested: c6UserFacingEnabled,
      unavailableReason: c6UserFacingEnabled ? 'V2_UNAVAILABLE' : null,
    });
  }

  if (!c6UserFacingEnabled) {
    return buildResult(DECISION_SOURCE_V2, v2pA, v2pB, DECISION_LABEL_V2, market);
  }

  // Flag ON, v2 selected, v2 available. C6 additionally needs valid odds.
  if (!market.valid) {
    return buildResult(DECISION_SOURCE_V2, v2pA, v2pB, DECISION_LABEL_V2, market, {
      c6Requested: true,
      unavailableReason: market.reason,
    });
  }

  const c6 = computeC6ProbA({ noVigA: market.noVigA, v2pA });
  if (!c6.available) {
    // Valid odds, but C6 itself failed internally (structurally near-
    // unreachable given a valid market + a valid model probability, but
    // handled explicitly rather than assumed away). Fail safe to the v2
    // display, and mark the snapshot invalid so the gate produces NO
    // recommendation at all -- silently running the betting decision on raw
    // v2 while showing a v2 label would misrepresent it as a normal v2 call
    // rather than a suppressed C6 failure.
    return buildResult(DECISION_SOURCE_V2, v2pA, v2pB, DECISION_LABEL_V2, {
      ...market,
      valid: false,
      reason: c6.reason,
    }, {
      c6Requested: true,
      c6Version: c6.version,
      unavailableReason: c6.reason,
      bettingSuppressed: true,
      bettingSuppressedReason: c6.reason,
    });
  }

  return buildResult(DECISION_SOURCE_C6, c6.c6pA, c6.c6pB, DECISION_LABEL_C6, market, {
    c6Requested: true,
    c6Available: true,
    c6Version: c6.version,
    c6ProbA: c6.c6pA,
    c6ProbB: c6.c6pB,
  });
}

/**
 * Reconstructs the frozen decision view (winner / probability / fair line)
 * for an ALREADY-SAVED entry, from its own frozen fields -- never recomputes
 * C6 and never re-derives from raw v1/v2. The single place every C6-aware
 * consumer (ROI cards, Upcoming cards, the parlay builder) should read this
 * from, so none of them can independently drift on what "the C6 decision"
 * means for a saved entry.
 *
 * Returns null for any entry that was NOT C6-driven (flag off, v1 selected,
 * or ordinary v2) -- callers keep their existing v1/v2 display logic in that
 * case, exactly as before this helper existed.
 *
 * @param {object} entry a saved ROI/Upcoming entry (buildRoiEntry's output)
 * @returns {{
 *   source:'c6', version:(string|null), winner:string, probability:number,
 *   fairLine:string, side:('A'|'B'|null)
 * }|null}
 */
export function resolveFrozenDecisionView(entry) {
  if (!entry || entry.decisionProbabilitySource !== DECISION_SOURCE_C6) return null;
  if (entry.trackedSide == null || entry.trackedProb == null) return null;
  const side =
    entry.trackedSide === entry.fighterA ? 'A' : entry.trackedSide === entry.fighterB ? 'B' : null;
  return {
    source: DECISION_SOURCE_C6,
    version: entry.c6Version ?? null,
    winner: entry.trackedSide,
    probability: entry.trackedProb,
    fairLine: americanOdds(entry.trackedProb),
    side,
  };
}

const PERFORMANCE_PUSH_RESULTS = new Set(['NC', 'DRAW']);

/**
 * resolveFrozenPerformanceView(entry)
 *
 * The single authoritative answer to "which frozen prediction do OFFICIAL
 * performance metrics grade for this saved entry, at what captured price?".
 * Official accuracy, ROI, per-event/per-fight profit, and every headline chart
 * consume this so a C6-driven entry can never be shown Correct on its card
 * while being counted as a raw-v2 miss in a headline (or vice versa).
 *
 * PURE and FROZEN. It reads ONLY fields already stored on the entry and never
 * calls a live model (no computeMatchupEdges, no computeC6ProbA, no
 * resolveDecisionProbability). Raw v2pA/v2pB are read but never mutated — they
 * remain the internal benchmark for raw-v2 diagnostic surfaces.
 *
 * Selection rules:
 *   1. C6-driven entry (decisionProbabilitySource === 'c6'): grade the frozen
 *      C6 decision that was actually displayed and tracked, resolved through
 *      resolveFrozenDecisionView (trackedSide / trackedProb), priced at the
 *      entry's captured tracked odds (marketOdds). This is the primary
 *      user-facing prediction whenever C6 drove the save.
 *   2. Otherwise (ordinary v2, or pre-C6 history): grade the frozen raw-v2
 *      argmax(v2pA, v2pB) at that side's own captured oddsA/oddsB (marketOdds
 *      fallback) — existing historical behavior, unchanged. Pre-C6 rows are
 *      never retroactively converted to C6.
 *
 * Fail-safe for a malformed C6-labelled record (source === 'c6' but trackedSide
 * / trackedProb missing, or trackedSide matches neither fighter): returns
 * `{ source:'c6', malformed:true, pickedFighter:null, ... }`. Such a record is
 * NEVER silently regraded on raw v2 (that would grade a different fighter than
 * the one shown) and NEVER recomputed from current data — callers must exclude
 * it from accuracy and ROI. See decision.test.js for the exercised policy.
 *
 * @param {object} entry a saved ROI/Upcoming entry (buildRoiEntry output)
 * @returns {{
 *   source:('c6'|'v2'), malformed:boolean, pickedFighter:(string|null),
 *   probability:(number|null), odds:(string|number|null), stake:number,
 *   decisive:boolean, push:boolean
 * }|null} null for a non-C6 entry carrying no frozen v2 fields (not gradeable).
 */
export function resolveFrozenPerformanceView(entry) {
  if (!entry) return null;
  const push = PERFORMANCE_PUSH_RESULTS.has(entry.actualWinner);
  const decisive =
    entry.actualWinner === entry.fighterA || entry.actualWinner === entry.fighterB;
  const stake = entry.unitsWagered != null ? entry.unitsWagered : 1;

  if (entry.decisionProbabilitySource === DECISION_SOURCE_C6) {
    const view = resolveFrozenDecisionView(entry);
    if (!view || view.side == null) {
      // Labelled C6 but the authoritative decision fields are missing/broken.
      // Fail explicitly rather than grading raw v2 (a different fighter) or
      // recomputing — surfaced as malformed so callers drop it from metrics.
      return {
        source: DECISION_SOURCE_C6,
        malformed: true,
        pickedFighter: null,
        probability: null,
        odds: null,
        stake,
        decisive,
        push,
      };
    }
    return {
      source: DECISION_SOURCE_C6,
      malformed: false,
      pickedFighter: view.winner,
      probability: view.probability,
      // Captured tracked odds for the decision actually shown. For every real
      // C6 entry this equals that side's own oddsA/oddsB, so it reconciles
      // exactly with the ROI card's per-fight profit.
      odds: entry.marketOdds ?? null,
      stake,
      decisive,
      push,
    };
  }

  if (entry.v2pA == null || entry.v2pB == null) return null;
  const pickA = entry.v2pA >= entry.v2pB;
  const pickedFighter = pickA ? entry.fighterA : entry.fighterB;
  const odds = pickA
    ? entry.oddsA || entry.marketOdds || null
    : entry.oddsB || entry.marketOdds || null;
  return {
    source: DECISION_SOURCE_V2,
    malformed: false,
    pickedFighter,
    probability: pickA ? entry.v2pA : entry.v2pB,
    odds,
    stake,
    decisive,
    push,
  };
}
