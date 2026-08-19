// ─── DOMAIN / SHADOW / C6 ────────────────────────────────────────────────────
// Order-safe, market-adjusted betting-layer forecast (EXPERIMENTAL, shadow-only).
//
// This is NOT the simulator's probability. It never replaces v2. It exists only
// to be frozen alongside a saved prediction for prospective paper evaluation.
//
// Formulation (frozen; do NOT refit, do NOT add predictors, do NOT add an
// intercept). The soundness audit
// (research/c6_soundness_report_2026-08-18.md, c6_symmetry_audit_2026-08-18.json)
// showed the original intercept-bearing C6 changed the SELECTED fighter on
// 380/2,281 rows and the RECOMMENDED fighter on 71 rows merely when the two
// arbitrary simulator slots were swapped. Removing the intercept makes the
// forecast swap-symmetric to machine precision with no loss of Brier/log-loss.
//
//   versionId = c6_sym_zerointercept_full_20260818
//   C6(A) = sigmoid( wMarket · logit(noVigA) + wV2 · logit(v2pA) )     // NO intercept
//   C6(B) = 1 − C6(A)
//
// Because production supplies noVigB = 1 − noVigA (exact, proportional strip) and
// v2pB = 1 − v2pA (v2 is complement-symmetric to 1 ULP —
// src/domain/model/__tests__/symmetry.test.js), the missing intercept makes
//   C6(A over B) = 1 − C6(B over A)
// hold to floating-point tolerance. See c6.test.js.

export const C6_VERSION = 'c6_sym_zerointercept_full_20260818';

// Full-precision frozen coefficients (do not round, do not edit).
export const C6_COEF = Object.freeze({
  w0: 0, // NO intercept — this is the whole point of the order-safe form
  wMarket: 0.9233813979326579, // multiplies logit(noVigA)
  wV2: 0.5482535304335658, // multiplies logit(v2pA)
});

// Identical clamp to the Python reference fitter (evaluate_challengers_v4.py).
export const C6_CLAMP_LO = 1e-6;
export const C6_CLAMP_HI = 1 - 1e-6;

const clampProb = (p) => Math.max(C6_CLAMP_LO, Math.min(C6_CLAMP_HI, p));

const logit = (p) => {
  const c = clampProb(p);
  return Math.log(c) - Math.log1p(-c);
};

// Numerically stable logistic (mirrors the reference `sigmoid`).
const sigmoid = (z) => {
  if (z >= 0) return 1 / (1 + Math.exp(-z));
  const e = Math.exp(z);
  return e / (1 + e);
};

/**
 * Pure C6 probability. Small, side-effect-free API.
 *
 * @param {{noVigA:number, v2pA:number}} inputs  no-vig market prob and v2 prob
 *        of the SAME fighter (slot A), from one shared market snapshot.
 * @returns {{available:boolean, reason:(string|null), c6pA:(number|null),
 *            c6pB:(number|null), version:string}}
 *
 * Returns `available:false` (never throws) for ordinary missing/invalid inputs,
 * so a caller can record "C6 unavailable" rather than crash a save.
 */
export function computeC6ProbA({ noVigA, v2pA } = {}) {
  const unavailable = (reason) => ({
    available: false,
    reason,
    c6pA: null,
    c6pB: null,
    version: C6_VERSION,
  });

  if (!Number.isFinite(noVigA) || !Number.isFinite(v2pA)) {
    return unavailable('NON_FINITE_INPUT');
  }
  // Probabilities must be in (0,1) after nothing — a raw prob outside [0,1] is a
  // data defect, not something to clamp silently into a bet.
  if (noVigA <= 0 || noVigA >= 1 || v2pA <= 0 || v2pA >= 1) {
    return unavailable('PROB_OUT_OF_RANGE');
  }

  const z = C6_COEF.w0 + C6_COEF.wMarket * logit(noVigA) + C6_COEF.wV2 * logit(v2pA);
  if (!Number.isFinite(z)) return unavailable('NON_FINITE_INTERNAL');

  const c6pA = sigmoid(z);
  if (!Number.isFinite(c6pA) || c6pA <= 0 || c6pA >= 1) {
    return unavailable('NON_FINITE_INTERNAL');
  }
  return { available: true, reason: null, c6pA, c6pB: 1 - c6pA, version: C6_VERSION };
}

// Exposed for tests/reference parity only. Not part of the production call path.
export const _internal = { clampProb, logit, sigmoid };
