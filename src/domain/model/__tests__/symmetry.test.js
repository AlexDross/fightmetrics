import { describe, it, expect } from 'vitest';
// See model.golden.test.js: frozen normalisation context, not the live roster.
import { loadFixture, expectWithinUlps, ulpDistance, frozenEdges } from '../../../__tests__/goldenSupport.js';

const { fighterFixtures, pairs } = loadFixture('fighters.golden.json');
const { symmetry } = loadFixture('model.golden.json');

// Stage 0 measured three DISTINCT properties. They do not hold to the same
// precision, and conflating them is how the original plan got this wrong:
//
//   within-call   pA + pB === 1        EXACT, 37/37, both bases
//   flip-sum      AB.pA + BA.pA === 1  36/37 exact; deviations <= 1.1102230246251565e-16
//   cross-slot    AB.pA === BA.pB      not exact; deviations <= 1.1102230246251565e-16
//
// The shipped code carried `console.assert(|v2.pA + v2flip.pA - 1| < 0.001)`,
// ~13 orders of magnitude looser than reality. It was removed in Stage 3;
// these tests replace it at the measured precision.
//
// ULP BUDGETS ARE PER BASIS AND MEASURED, NOT CHOSEN.
// The Stage 0 bound is ABSOLUTE (2^-53). In ULP terms that varies with
// magnitude: 1 ULP in [0.5, 1), ~4 ULP near 0.2. The live worst observed is
// v1 = 4 ULP and v2 = 2 ULP, so those are the budgets. No headroom -- a future
// change that exceeds the approved measurement is meant to fail and be
// reviewed.
const MAX_ULP = { v1: 4, v2: 2 };

// The absolute contract from Stage 0, asserted against LIVE results.
const MAX_ABS = 1.1102230246251565e-16;

const live = pairs
  .map((p) => ({ pair: `${p.a} vs ${p.b}`, fA: fighterFixtures[p.a], fB: fighterFixtures[p.b] }))
  .filter((x) => x.fA && x.fB)
  .map((x) => ({ ...x, ab: frozenEdges(x.fA, x.fB), ba: frozenEdges(x.fB, x.fA) }));

const KEYS = { v1: ['pA', 'pB'], v2: ['v2pA', 'v2pB'] };

// Everything below is computed from the LIVE results, never read out of the
// fixture. A stored-only assertion would still pass if the model changed.
function liveMeasurements(basis) {
  const [pA, pB] = KEYS[basis];
  let exactCrossSlot = 0, exactFlipSum = 0, exactWithinCall = 0;
  let maxAbsCrossSlot = 0, maxAbsFlipSum = 0, maxUlp = 0n;
  for (const { ab, ba } of live) {
    if (Object.is(ab[pA], ba[pB])) exactCrossSlot++;
    if (Object.is(ab[pA] + ba[pA], 1)) exactFlipSum++;
    if (Object.is(ab[pA] + ab[pB], 1)) exactWithinCall++;
    maxAbsCrossSlot = Math.max(maxAbsCrossSlot, Math.abs(ab[pA] - ba[pB]), Math.abs(ab[pB] - ba[pA]));
    maxAbsFlipSum = Math.max(maxAbsFlipSum, Math.abs(ab[pA] + ba[pA] - 1));
    for (const d of [
      ulpDistance(ab[pA], ba[pB]), ulpDistance(ab[pB], ba[pA]), ulpDistance(ab[pA] + ba[pA], 1),
    ]) if (d !== Infinity && d > maxUlp) maxUlp = d;
  }
  return { exactCrossSlot, exactFlipSum, exactWithinCall, maxAbsCrossSlot, maxAbsFlipSum, maxUlp };
}

const LIVE = { v1: liveMeasurements('v1'), v2: liveMeasurements('v2') };

describe('symmetry — within a single result', () => {
  it('pA + pB is EXACTLY 1 for v1, all 37 pairs', () => {
    for (const { pair, ab } of live) {
      expect(Object.is(ab.pA + ab.pB, 1), `${pair}: v1 pA+pB = ${ab.pA + ab.pB}`).toBe(true);
    }
    expect(LIVE.v1.exactWithinCall).toBe(37);
  });

  it('v2pA + v2pB is EXACTLY 1, all 37 pairs', () => {
    for (const { pair, ab } of live) {
      expect(Object.is(ab.v2pA + ab.v2pB, 1), `${pair}: v2 pA+pB = ${ab.v2pA + ab.v2pB}`).toBe(true);
    }
    expect(LIVE.v2.exactWithinCall).toBe(37);
  });
});

describe('symmetry — flipped call, correctly mapped slots', () => {
  // In the flipped call BA, slot A holds the ORIGINAL fighter B, so the correct
  // mapping is AB.pA <-> BA.pB and AB.pB <-> BA.pA. The plan's earlier
  // `AB.pA === 1 - BA.pB` was wrong and fails on every non-50/50 matchup.
  for (const basis of ['v1', 'v2']) {
    const [pA, pB] = KEYS[basis];
    const budget = MAX_ULP[basis];

    it(`AB.${pA} equals BA.${pB} within ${budget} ULP (${basis})`, () => {
      for (const { pair, ab, ba } of live) {
        expectWithinUlps(ab[pA], ba[pB], `${pair}: ${basis} AB.${pA} vs BA.${pB}`, budget);
      }
    });

    it(`AB.${pB} equals BA.${pA} within ${budget} ULP (${basis})`, () => {
      for (const { pair, ab, ba } of live) {
        expectWithinUlps(ab[pB], ba[pA], `${pair}: ${basis} AB.${pB} vs BA.${pA}`, budget);
      }
    });

    it(`flip-sum AB.${pA} + BA.${pA} equals 1 within ${budget} ULP (${basis})`, () => {
      for (const { pair, ab, ba } of live) {
        expectWithinUlps(ab[pA] + ba[pA], 1, `${pair}: ${basis} flip-sum`, budget);
      }
    });
  }

  it('live worst ULP distance matches the measured budget exactly, per basis', () => {
    // Not "<=" against a padded number: these ARE the observed maxima. If the
    // model or engine drifts in either direction this fails and gets reviewed.
    expect(LIVE.v1.maxUlp).toBe(BigInt(MAX_ULP.v1));
    expect(LIVE.v2.maxUlp).toBe(BigInt(MAX_ULP.v2));
  });
});

describe('symmetry — live measurements against the Stage 0 characterisation', () => {
  // These compare CURRENT behaviour with the approved capture. Previously they
  // only inspected the stored fixture, so they would have passed even if live
  // symmetry had changed completely.
  it('live absolute deviations honour the approved bound', () => {
    for (const basis of ['v1', 'v2']) {
      expect(LIVE[basis].maxAbsCrossSlot, `${basis} cross-slot`).toBeLessThanOrEqual(MAX_ABS);
      expect(LIVE[basis].maxAbsFlipSum, `${basis} flip-sum`).toBeLessThanOrEqual(MAX_ABS);
    }
  });

  it('the captured measurements also honour that bound', () => {
    for (const s of symmetry.filter((x) => !x.error)) {
      for (const basis of ['v1', 'v2']) {
        expect(s[basis].abs_delta_sum).toBeLessThanOrEqual(MAX_ABS);
        expect(s[basis].abs_delta_crossSlot).toBeLessThanOrEqual(MAX_ABS);
      }
    }
  });

  it('live exact-hit counts match the capture, except one known cross-engine case', () => {
    const captured = (basis, key) => symmetry.filter((x) => !x.error && x[basis][key]).length;

    // Identical across engines.
    expect(LIVE.v1.exactWithinCall).toBe(captured('v1', 'exact_withinCall_AB_pA_plus_pB_eq_1'));
    expect(LIVE.v2.exactWithinCall).toBe(captured('v2', 'exact_withinCall_AB_pA_plus_pB_eq_1'));
    expect(LIVE.v1.exactFlipSum).toBe(captured('v1', 'exact_flipSum_eq_1'));
    expect(LIVE.v2.exactFlipSum).toBe(captured('v2', 'exact_flipSum_eq_1'));
    expect(LIVE.v2.exactCrossSlot).toBe(captured('v2', 'exact_crossSlot_ABpA_eq_BApB'));

    // v1 cross-slot is 18 live in Node against 17 captured in Chrome. The extra
    // hit comes from the same Math.exp difference documented in
    // model.golden.test.js: one pair lands bit-equal in Node but not in Chrome.
    // Pinned exactly so a drift of any other size fails.
    expect(captured('v1', 'exact_crossSlot_ABpA_eq_BApB')).toBe(17);
    expect(LIVE.v1.exactCrossSlot).toBe(18);
  });

  it('the capture covers all 37 pairs without errors', () => {
    expect(symmetry.filter((s) => !s.error).length).toBe(37);
    expect(live.length).toBe(37);
  });
});
