// ─── DOMAIN / BETTING / MARKET CORE ──────────────────────────────────────────
// Dependency-neutral market primitives + a SNAPSHOT-AWARE gate. This module
// imports nothing from other domains, so both the regular betting entry point
// (`./index.js`) and the shadow modules (`../shadow/*`) can import it WITHOUT
// creating a circular dependency.
//
// The odds are parsed EXACTLY ONCE, into a single validated market input
// (`buildMarketInput`). The gate (`evaluateGateOnSnapshot`) operates on that
// already-parsed input and never re-parses. The public
// `computeMarketAnalysis(result, oddsA, oddsB, fA, fB)` in ./index.js is now a
// thin wrapper that builds one market input and delegates here, so every
// existing caller and output is unchanged while the shadow layer can feed the
// SAME frozen snapshot to both the v2 and C6 gates.

export const americanOdds = (p) => {
  p = Math.max(0.001, Math.min(0.999, p));
  return p >= 0.5
    ? `-${Math.round((p / (1 - p)) * 100)}`
    : `+${Math.round(((1 - p) / p) * 100)}`;
};

export const parseAmericanOdds = (str) => {
  if (!str || str === '' || str === '+' || str === '-') return null;
  const n = parseInt(str, 10);
  if (isNaN(n) || n === 0) return null;
  // Convert American odds → raw implied probability
  if (n > 0) return 100 / (n + 100);
  return Math.abs(n) / (Math.abs(n) + 100);
};

export const stripVig = (implA, implB) => {
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

export const calcExpectedValue = (modelProb, decimalOdds) =>
  modelProb * (decimalOdds - 1) * 100 - (1 - modelProb) * 100;

export const americanToDecimal = (str) => {
  const n = parseInt(str, 10);
  if (isNaN(n) || n === 0) return null;
  if (n > 0) return n / 100 + 1;
  return 100 / Math.abs(n) + 1;
};

export const kellyFraction = (modelProb, decimalOdds) => {
  const b = decimalOdds - 1;
  if (b <= 0) return 0;
  const f = (b * modelProb - (1 - modelProb)) / b;
  return Math.max(0, f);
};

// Lightweight, synchronous, non-cryptographic checksum (djb2).
export const djb2Checksum = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
};

/**
 * Parse a pair of American odds EXACTLY ONCE into a validated market input.
 * This is the single place odds are parsed for both the live gate and the
 * shadow snapshot. Optional `snapshotId`/`source`/`capturedAt` identify a frozen
 * shadow snapshot; the live gate omits them.
 *
 * @returns {{valid:boolean, reason:(string|null), oddsA, oddsB,
 *            rawImpliedA, rawImpliedB, noVigA, noVigB, vig, overround,
 *            decimalA, decimalB, snapshotId, source, capturedAt}}
 */
export const buildMarketInput = ({ oddsA, oddsB, snapshotId, source, capturedAt } = {}) => {
  const rawImpliedA = parseAmericanOdds(oddsA);
  const rawImpliedB = parseAmericanOdds(oddsB);
  const decimalA = americanToDecimal(oddsA);
  const decimalB = americanToDecimal(oddsB);
  const idFields = {
    snapshotId: snapshotId ?? null,
    source: source ?? null,
    capturedAt: capturedAt ?? null,
    oddsA: oddsA ?? null,
    oddsB: oddsB ?? null,
  };
  if (rawImpliedA == null || rawImpliedB == null) {
    return {
      valid: false,
      reason: 'ODDS_MISSING_OR_INVALID',
      rawImpliedA: null,
      rawImpliedB: null,
      noVigA: null,
      noVigB: null,
      vig: null,
      overround: null,
      decimalA: null,
      decimalB: null,
      ...idFields,
    };
  }
  const { noVigA, noVigB, vig, overround } = stripVig(rawImpliedA, rawImpliedB);
  return {
    valid: true,
    reason: null,
    rawImpliedA,
    rawImpliedB,
    noVigA,
    noVigB,
    vig,
    overround,
    decimalA,
    decimalB,
    ...idFields,
  };
};

const gradeEdge = (edge) => {
  const abs = Math.abs(edge);
  if (abs >= 0.12)
    return { label: 'STRONG VALUE', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-700' };
  if (abs >= 0.06)
    return { label: 'VALUE', color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800' };
  if (abs >= 0.03)
    return { label: 'LEAN', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800' };
  return { label: 'NO EDGE', color: 'text-slate-500', bg: 'bg-slate-800/40 border-slate-700' };
};

/**
 * The production gate, operating on an ALREADY-PARSED market input. Byte-for-byte
 * identical logic and output to the previous inline `computeMarketAnalysis`
 * body, plus an additive `marketSnapshotId` echoing the input's identity (null
 * for the live wrapper) so the shadow layer can prove both gates used one
 * snapshot. Returns null only when the market input is invalid or `result` is
 * missing (same guard as before).
 */
export const evaluateGateOnSnapshot = (result, mkt, fA, fB) => {
  if (!mkt || !mkt.valid || !result) return null;

  const rawA = mkt.rawImpliedA;
  const rawB = mkt.rawImpliedB;
  const { noVigA, noVigB, vig, overround, decimalA: decA, decimalB: decB } = mkt;

  const edgeA = result.pA - noVigA;
  const edgeB = result.pB - noVigB;
  const evA = decA ? calcExpectedValue(result.pA, decA) : 0;
  const evB = decB ? calcExpectedValue(result.pB, decB) : 0;
  const kellyA = decA ? kellyFraction(result.pA, decA) : 0;
  const kellyB = decB ? kellyFraction(result.pB, decB) : 0;

  const breakEvenA = rawA;
  const breakEvenB = rawB;
  const fairLineA = americanOdds(result.pA);
  const fairLineB = americanOdds(result.pB);

  const modelFavorsA = result.pA >= 0.5;
  const domainKeys = ['striking', 'grappling', 'physical', 'form', 'experience', 'analytics'];
  const alignedDomains = domainKeys.filter((k) => {
    const e = result.edges[k];
    return modelFavorsA ? e.clamped > 0 : e.clamped < 0;
  }).length;

  const pickSide = result.pA >= 0.5 ? 'A' : 'B';
  const pickEdge = pickSide === 'A' ? edgeA : edgeB;
  const oppEdge = pickSide === 'A' ? edgeB : edgeA;

  const hasPickEdge = pickEdge >= 0.03;
  const conflictingSignals = !hasPickEdge && oppEdge >= 0.03;

  const avgCred = (fA.CREDIBILITY + fB.CREDIBILITY) / 200;
  const edgeScore = hasPickEdge ? Math.min(40, pickEdge * 280) : 0;
  const credScore = avgCred * 30;
  const alignScore = alignedDomains * 5;
  const betConfidence = Math.round(Math.max(0, edgeScore + credScore + alignScore));

  const pickProb = pickSide === 'A' ? result.pA : result.pB;
  const lowConviction = pickProb < 0.6;
  const midConviction = pickProb < 0.65;

  const betAction = (() => {
    if (conflictingSignals) return 'NO BET';
    if (!hasPickEdge) return 'NO BET';
    if (pickProb < 0.6) return 'NO BET';
    if (pickProb < 0.65) {
      if (pickEdge >= 0.1) return 'LEAN';
      return 'NO BET';
    }
    if (pickProb < 0.7) {
      if (pickEdge >= 0.3) return 'BET';
      if (pickEdge >= 0.1) return 'LEAN';
      return 'NO BET';
    }
    if (pickEdge >= 0.25) return 'STRONG BET';
    if (pickEdge >= 0.15) return 'BET';
    return 'LEAN';
  })();

  const lowCredCap = (fA.CREDIBILITY ?? 0) < 30 || (fB.CREDIBILITY ?? 0) < 30;
  const cappedBetAction =
    lowCredCap && (betAction === 'STRONG BET' || betAction === 'BET') ? 'LEAN' : betAction;

  const pickRawOdds = pickSide === 'A' ? rawA : rawB;
  const heavyFavSuppressed =
    pickRawOdds > 2 / 3 && pickEdge < 0.25 && cappedBetAction !== 'NO BET';
  const finalBetAction = heavyFavSuppressed ? 'NO BET' : cappedBetAction;

  const noBetReason = (() => {
    if (conflictingSignals) {
      const oppFighter = pickSide === 'A' ? fB.FIGHTER : fA.FIGHTER;
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

  const betSide = pickSide;

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
    // Additive gate-state fields (do NOT affect betAction/betSide/existing
    // consumers). Exposed so the C6 shadow arm can reuse the EXACT production
    // gate and record the pre-/post-suppression tiers without duplicating logic.
    baseBetAction: betAction,
    cappedBetAction,
    heavyFavSuppressed,
    // Identity of the market snapshot this gate ran on (null for the live
    // wrapper). Lets the shadow layer PROVE both gates used one snapshot.
    marketSnapshotId: mkt.snapshotId ?? null,
    betSide,
    alignedDomains,
    gradeA:
      edgeA > 0.02
        ? gradeEdge(edgeA)
        : {
            label: edgeA < -0.05 ? 'FADE' : 'NO EDGE',
            color: edgeA < -0.05 ? 'text-red-400' : 'text-slate-500',
            bg: edgeA < -0.05 ? 'bg-red-900/20 border-red-800' : 'bg-slate-800/40 border-slate-700',
          },
    gradeB:
      edgeB > 0.02
        ? gradeEdge(edgeB)
        : {
            label: edgeB < -0.05 ? 'FADE' : 'NO EDGE',
            color: edgeB < -0.05 ? 'text-red-400' : 'text-slate-500',
            bg: edgeB < -0.05 ? 'bg-red-900/20 border-red-800' : 'bg-slate-800/40 border-slate-700',
          },
    // bestBet fires only when the model pick survives the FULL gate, including
    // heavy-favourite suppression (2026-08-18 fix: POST suppression, not pre).
    // Invariant: bestBet !== null => betAction !== 'NO BET'.
    bestBet: finalBetAction !== 'NO BET' ? pickSide : null,
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
