import { describe, it, expect } from 'vitest';
import { computeC6ProbA, C6_VERSION, C6_COEF, C6_CLAMP_LO, C6_CLAMP_HI } from '../c6.js';

// Reference values computed by the frozen Python fitter's formula with the
// full-precision shadow coefficients (w1=0.9233813979326579, w2=0.5482535304335658).
// See research/c6_symmetry_audit_2026-08-18.py in the audit worktree.
const REFERENCE = [
  [0.55, 0.62, 0.61151671153164355],
  [0.3, 0.7, 0.4212010178244389],
  [0.5, 0.5, 0.5],
  [0.92, 0.18, 0.8059451685057282],
  [0.4335, 0.5657, 0.4744811134226216],
];

describe('C6 formula', () => {
  it('exposes the exact frozen version and coefficients', () => {
    expect(C6_VERSION).toBe('c6_sym_zerointercept_full_20260818');
    expect(C6_COEF.w0).toBe(0);
    expect(C6_COEF.wMarket).toBe(0.9233813979326579);
    expect(C6_COEF.wV2).toBe(0.5482535304335658);
    expect(C6_CLAMP_LO).toBe(1e-6);
    expect(C6_CLAMP_HI).toBe(1 - 1e-6);
  });

  it('matches the Python reference to <= 1e-12 (full-precision parity)', () => {
    for (const [nv, v2, expected] of REFERENCE) {
      const r = computeC6ProbA({ noVigA: nv, v2pA: v2 });
      expect(r.available).toBe(true);
      expect(Math.abs(r.c6pA - expected)).toBeLessThanOrEqual(1e-12);
      expect(r.c6pB).toBeCloseTo(1 - r.c6pA, 15);
    }
  });

  it('is fighter-swap complement symmetric to floating-point tolerance', () => {
    // With exact complement inputs (noVigB=1-noVigA, v2pB=1-v2pA) the intercept-free
    // form gives C6(A over B) = 1 - C6(B over A).
    const cases = [
      [0.55, 0.62],
      [0.3, 0.7],
      [0.5, 0.5],
      [0.92, 0.18],
      [0.62, 0.41],
    ];
    for (const [nv, v2] of cases) {
      const fwd = computeC6ProbA({ noVigA: nv, v2pA: v2 }).c6pA;
      const rev = computeC6ProbA({ noVigA: 1 - nv, v2pA: 1 - v2 }).c6pA;
      expect(Math.abs(fwd + rev - 1)).toBeLessThanOrEqual(1e-12);
    }
  });

  it('produces probabilities strictly within (0,1) for extreme inputs', () => {
    for (const [nv, v2] of [[0.999999, 0.999999], [1e-6, 1e-6], [0.9999, 0.0001]]) {
      const r = computeC6ProbA({ noVigA: nv, v2pA: v2 });
      expect(r.available).toBe(true);
      expect(r.c6pA).toBeGreaterThan(0);
      expect(r.c6pA).toBeLessThan(1);
      expect(Number.isFinite(r.c6pA)).toBe(true);
    }
  });

  it('returns unavailable (never throws) for non-finite or out-of-range inputs', () => {
    expect(computeC6ProbA({ noVigA: NaN, v2pA: 0.6 })).toMatchObject({
      available: false,
      reason: 'NON_FINITE_INPUT',
      c6pA: null,
    });
    expect(computeC6ProbA({ noVigA: 0.6, v2pA: Infinity }).reason).toBe('NON_FINITE_INPUT');
    expect(computeC6ProbA({ noVigA: 0, v2pA: 0.6 }).reason).toBe('PROB_OUT_OF_RANGE');
    expect(computeC6ProbA({ noVigA: 0.6, v2pA: 1 }).reason).toBe('PROB_OUT_OF_RANGE');
    expect(computeC6ProbA({}).available).toBe(false);
    expect(computeC6ProbA().available).toBe(false); // no args, still no throw
  });

  it('is deterministic for identical inputs', () => {
    const a = computeC6ProbA({ noVigA: 0.57, v2pA: 0.63 });
    const b = computeC6ProbA({ noVigA: 0.57, v2pA: 0.63 });
    expect(a).toEqual(b);
  });
});
