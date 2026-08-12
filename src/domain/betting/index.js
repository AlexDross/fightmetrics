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

const americanOdds = (p) => {
  p = Math.max(0.001, Math.min(0.999, p));
  return p >= 0.5
    ? `-${Math.round((p / (1 - p)) * 100)}`
    : `+${Math.round(((1 - p) / p) * 100)}`;
};

// ─── VIG-STRIPPING & VALUE ENGINE ────────────────────────────────────────────

const parseAmericanOdds = (str) => {
  if (!str || str === '' || str === '+' || str === '-') return null;
  const n = parseInt(str, 10);
  if (isNaN(n) || n === 0) return null;
  // Convert American odds → raw implied probability
  if (n > 0) return 100 / (n + 100);
  return Math.abs(n) / (Math.abs(n) + 100);
};


const stripVig = (implA, implB) => {
  // Multiplicative / proportional method — most common industry standard
  const total = implA + implB;
  if (total <= 0) return { noVigA: 0.5, noVigB: 0.5, vig: 0, overround: 0 };
  return {
    noVigA: implA / total,
    noVigB: implB / total,
    vig: ((total - 1) / total) * 100, // vig as % of bet
    overround: (total - 1) * 100, // raw overround %
  };
};


const calcExpectedValue = (modelProb, decimalOdds) => {
  // EV = (prob × net_win) - ((1 - prob) × stake)
  // For $100 bet: EV = (prob × (decimalOdds - 1) × 100) - ((1 - prob) × 100)
  return modelProb * (decimalOdds - 1) * 100 - (1 - modelProb) * 100;
};


const americanToDecimal = (str) => {
  const n = parseInt(str, 10);
  if (isNaN(n) || n === 0) return null;
  if (n > 0) return n / 100 + 1;
  return 100 / Math.abs(n) + 1;
};


const createPredictionId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;


const kellyFraction = (modelProb, decimalOdds) => {
  // Kelly = (bp - q) / b where b = decimal - 1, p = prob, q = 1-p
  const b = decimalOdds - 1;
  if (b <= 0) return 0;
  const f = (b * modelProb - (1 - modelProb)) / b;
  return Math.max(0, f);
};


// Market/edge analysis for a matchup at given American odds. Returns null when
// odds are unparseable (mirrors the manual-save path where no odds → null market).
// Single source of truth shared by MatchupSimulator's market useMemo and the
// manual savePrediction path.
const computeMarketAnalysis = (result, oddsA, oddsB, fA, fB) => {
  const rawA = parseAmericanOdds(oddsA);
  const rawB = parseAmericanOdds(oddsB);
  if (!rawA || !rawB || !result) return null;

  const { noVigA, noVigB, vig, overround } = stripVig(rawA, rawB);
  const decA = americanToDecimal(oddsA);
  const decB = americanToDecimal(oddsB);

  const edgeA = result.pA - noVigA;
  const edgeB = result.pB - noVigB;
  const evA = decA ? calcExpectedValue(result.pA, decA) : 0;
  const evB = decB ? calcExpectedValue(result.pB, decB) : 0;
  const kellyA = decA ? kellyFraction(result.pA, decA) : 0;
  const kellyB = decB ? kellyFraction(result.pB, decB) : 0;

  // Break-even % at market odds
  const breakEvenA = rawA;
  const breakEvenB = rawB;

  // Fair value line based on model probability
  const fairLineA = americanOdds(result.pA);
  const fairLineB = americanOdds(result.pB);

  // Domain alignment: how many of the 6 real model domains favor the same fighter
  const modelFavorsA = result.pA >= 0.5;
  const domainKeys = [
    'striking',
    'grappling',
    'physical',
    'form',
    'experience',
    'analytics',
  ];
  const alignedDomains = domainKeys.filter((k) => {
    const e = result.edges[k];
    return modelFavorsA ? e.clamped > 0 : e.clamped < 0;
  }).length;

  // ── Step 1: Who does the model pick? (always the >50% fighter)
  const pickSide = result.pA >= 0.5 ? 'A' : 'B';
  const pickEdge = pickSide === 'A' ? edgeA : edgeB;
  const oppEdge  = pickSide === 'A' ? edgeB : edgeA;

  // ── Step 2: Classify signals
  // CONFLICTING: model picks A but market underprices B.
  // Betting the 'value' here means betting against your own model pick.
  const hasPickEdge = pickEdge >= 0.03;
  const conflictingSignals = !hasPickEdge && oppEdge >= 0.03;

  // ── Step 3: Confidence — only meaningful when signals align
  const avgCred = (fA.CREDIBILITY + fB.CREDIBILITY) / 200;
  const edgeScore = hasPickEdge ? Math.min(40, pickEdge * 280) : 0;
  const credScore = avgCred * 30;
  const alignScore = alignedDomains * 5;
  const betConfidence = Math.round(Math.max(0, edgeScore + credScore + alignScore));

  // ── Step 4: Conviction gate + bet action ─────────────────────────────────
  const pickProb = pickSide === 'A' ? result.pA : result.pB;
  const lowConviction  = pickProb < 0.60;  // below hard floor — no bet zone
  const midConviction  = pickProb < 0.65;  // low conviction tier

  const betAction = (() => {
    if (conflictingSignals) return 'NO BET';
    if (!hasPickEdge) return 'NO BET';

    // Hard floor — model unproven below 60%
    if (pickProb < 0.60) return 'NO BET';

    // Low conviction tier (60-64%) — cap at LEAN regardless of edge
    if (pickProb < 0.65) {
      if (pickEdge >= 0.10) return 'LEAN';
      return 'NO BET';
    }

    // Mid conviction tier (65-69%)
    if (pickProb < 0.70) {
      if (pickEdge >= 0.30) return 'BET';
      if (pickEdge >= 0.10) return 'LEAN';
      return 'NO BET';
    }

    // High conviction tier (70%+)
    if (pickEdge >= 0.25) return 'STRONG BET';
    if (pickEdge >= 0.15) return 'BET';
    return 'LEAN';
  })();

  const lowCredCap = (fA.CREDIBILITY ?? 0) < 30 || (fB.CREDIBILITY ?? 0) < 30;
  const cappedBetAction =
    lowCredCap && (betAction === 'STRONG BET' || betAction === 'BET')
      ? 'LEAN'
      : betAction;

  // Heavy-favourite ceiling: if market implies >66.7% (odds shorter than -200),
  // require edge >25pp or suppress to NO BET.
  const pickRawOdds = pickSide === 'A' ? rawA : rawB;
  const heavyFavSuppressed =
    pickRawOdds > (2 / 3) &&
    pickEdge < 0.25 &&
    cappedBetAction !== 'NO BET';
  const finalBetAction = heavyFavSuppressed ? 'NO BET' : cappedBetAction;

  // ── Step 5: No-bet / lean reason for UI display ───────────────────────────
  const noBetReason = (() => {
    if (conflictingSignals) {
      const oppFighter  = pickSide === 'A' ? fB.FIGHTER : fA.FIGHTER;
      const pickFighter = pickSide === 'A' ? fA.FIGHTER : fB.FIGHTER;
      return `Market underprices ${oppFighter} (+${(oppEdge * 100).toFixed(1)}pp edge) but model picks ${pickFighter} — conflicting signals`;
    }
    if (!hasPickEdge) return `No positive edge on model pick at current lines`;
    if (lowConviction) return `Model pick is ${(pickProb * 100).toFixed(1)}% — below the 60% floor required for any bet recommendation.`;
    if (heavyFavSuppressed) {
      const pickFighter = pickSide === 'A' ? fA.FIGHTER : fB.FIGHTER;
      return `${pickFighter} priced at ${Math.round(pickRawOdds * 100)}% implied — heavy-favourite ceiling requires edge >25pp (current: ${(pickEdge * 100).toFixed(1)}pp)`;
    }
    return `Edge below minimum threshold`;
  })();

  // betSide alias so downstream UI keeps working
  const betSide = pickSide;

  const gradeEdge = (edge) => {
    const abs = Math.abs(edge);
    if (abs >= 0.12)
      return {
        label: 'STRONG VALUE',
        color: 'text-emerald-400',
        bg: 'bg-emerald-900/30 border-emerald-700',
      };
    if (abs >= 0.06)
      return {
        label: 'VALUE',
        color: 'text-emerald-400',
        bg: 'bg-emerald-900/20 border-emerald-800',
      };
    if (abs >= 0.03)
      return {
        label: 'LEAN',
        color: 'text-yellow-400',
        bg: 'bg-yellow-900/20 border-yellow-800',
      };
    return {
      label: 'NO EDGE',
      color: 'text-slate-500',
      bg: 'bg-slate-800/40 border-slate-700',
    };
  };

  return {
    rawA,
    rawB,
    noVigA,
    noVigB,
    vig,
    overround,
    edgeA,
    edgeB,
    evA,
    evB,
    kellyA,
    kellyB,
    breakEvenA,
    breakEvenB,
    fairLineA,
    fairLineB,
    betConfidence,
    betAction: finalBetAction,
    betSide,
    alignedDomains,
    gradeA:
      edgeA > 0.02
        ? gradeEdge(edgeA)
        : {
            label: edgeA < -0.05 ? 'FADE' : 'NO EDGE',
            color: edgeA < -0.05 ? 'text-red-400' : 'text-slate-500',
            bg:
              edgeA < -0.05
                ? 'bg-red-900/20 border-red-800'
                : 'bg-slate-800/40 border-slate-700',
          },
    gradeB:
      edgeB > 0.02
        ? gradeEdge(edgeB)
        : {
            label: edgeB < -0.05 ? 'FADE' : 'NO EDGE',
            color: edgeB < -0.05 ? 'text-red-400' : 'text-slate-500',
            bg:
              edgeB < -0.05
                ? 'bg-red-900/20 border-red-800'
                : 'bg-slate-800/40 border-slate-700',
          },
    // bestBet fires only when model pick and market value align
    bestBet: cappedBetAction !== 'NO BET' ? pickSide : null,
    pickSide,
    pickProb,
    lowConviction,
    midConviction,
    pickEdge,
    oppEdge,
    hasPickEdge,
    conflictingSignals,
    noBetReason,
    lowCredCap,
  };
};

// Lightweight, synchronous, non-cryptographic checksum (djb2) — used only to
// detect drift in MODEL_V2's coefficients between saves, not for security.

const djb2Checksum = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
};

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
export const buildProvenance = ({ eventDate, result, fA, fB, predictionTimestamp, captureMode, frozenTier }) => {
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
const buildRoiEntry = ({ fA, fB, oddsA, oddsB, eventName, eventDate, modelToggle = 'v2', unitsWagered = 1, modelContext }) => {
  const result = computeMatchupEdges(fA, fB, {
    ...(modelContext ?? {}),
    eventDate: eventDate || modelContext?.eventDate,
  });
  // Use whichever model the user had active at save time (v1 or v2) for every
  // bet-decision field, mirroring the Simulator's own market useMemo. The raw
  // per-model probabilities are still stored separately and unchanged
  // (fighterAProb/fighterBProb = v1, v2pA/v2pB = v2) so the v1-vs-v2 accuracy
  // snapshots stay intact; modelUsed records which model drove the bet fields.
  const activePA = modelToggle === 'v2' && result.v2pA != null ? result.v2pA : result.pA;
  const activePB = modelToggle === 'v2' && result.v2pB != null ? result.v2pB : result.pB;
  const activeResult = { ...result, pA: activePA, pB: activePB };
  const market = computeMarketAnalysis(activeResult, oddsA, oddsB, fA, fB);

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

  return {
    id: createPredictionId(),
    createdAt: new Date().toISOString(),
    eventName,
    eventDate,
    fighterA: fA.FIGHTER,
    fighterB: fB.FIGHTER,
    fighterAIsProspect: !!fA.IS_PROSPECT,
    fighterBIsProspect: !!fB.IS_PROSPECT,
    includesProspect: !!fA.IS_PROSPECT || !!fB.IS_PROSPECT,
    division:
      fA.WEIGHT_CLASS === fB.WEIGHT_CLASS
        ? fA.WEIGHT_CLASS
        : `${fA.WEIGHT_CLASS} / ${fB.WEIGHT_CLASS}`,
    fighterAProb: result.pA,
    fighterBProb: result.pB,
    predictedWinner,
    predictedProb: predictedWinner === fA.FIGHTER ? result.pA : result.pB,
    modelUsed: modelToggle,
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
    _provenance: buildProvenance({ eventDate, result, fA, fB, frozenTier: market?.betAction ?? 'NO BET' }),
  };
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
  djb2Checksum,
  buildRoiEntry,
};
