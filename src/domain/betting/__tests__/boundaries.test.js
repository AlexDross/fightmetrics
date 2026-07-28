import { describe, it, expect } from 'vitest';
import {
  americanOdds, parseAmericanOdds, americanToDecimal,
  stripVig, calcExpectedValue, kellyFraction, computeMarketAnalysis,
} from '../index.js';
import { loadFixture, expectWithinUlps } from '../../../__tests__/goldenSupport.js';

const { fighterFixtures, pairs } = loadFixture('fighters.golden.json');

// CHARACTERISATION of the rule AS IMPLEMENTED in computeMarketAnalysis, read
// from the source rather than assumed from the plan. The gate is on the MODEL
// PICK's probability (pickProb) and the edge on that same side (pickEdge):
//
//   conflicting signals, or pickEdge < 0.03            -> NO BET
//   pickProb <  0.60                                   -> NO BET
//   0.60 <= pickProb < 0.65   pickEdge >= 0.10 -> LEAN, else NO BET
//   0.65 <= pickProb < 0.70   pickEdge >= 0.30 -> BET
//                             pickEdge >= 0.10 -> LEAN, else NO BET
//   pickProb >= 0.70          pickEdge >= 0.25 -> STRONG BET
//                             pickEdge >= 0.15 -> BET, else LEAN
//
// then two overrides: CREDIBILITY < 30 on either fighter caps BET/STRONG BET
// to LEAN, and a market-implied pick above 2/3 with pickEdge < 0.25 is
// suppressed to NO BET.
//
// NOTE ON "NO READ": the sub-53% NO READ rule is NOT in this module. It lives
// in App.js (`const noRead = pickProbActive < 0.53`) as a DISPLAY-LAYER
// suppression of market.betAction. It is unreachable from any exported domain
// function, so it cannot be tested in this commit. Recorded in the Stage 4
// testability map instead of being faked here.

// Minimal synthetic result: only the fields computeMarketAnalysis reads.
const mkResult = (pA) => ({
  pA,
  pB: 1 - pA,
  edges: {
    striking: { clamped: pA >= 0.5 ? 1 : -1 },
    grappling: { clamped: pA >= 0.5 ? 1 : -1 },
    physical: { clamped: pA >= 0.5 ? 1 : -1 },
    form: { clamped: pA >= 0.5 ? 1 : -1 },
    experience: { clamped: pA >= 0.5 ? 1 : -1 },
    analytics: { clamped: pA >= 0.5 ? 1 : -1 },
  },
});

const HI = { FIGHTER: 'HiA', CREDIBILITY: 90 };
const HI2 = { FIGHTER: 'HiB', CREDIBILITY: 90 };
const EVEN = ['+100', '+100'];

const action = (pA, odds = EVEN, fa = HI, fb = HI2) =>
  computeMarketAnalysis(mkResult(pA), odds[0], odds[1], fa, fb)?.betAction;

// ── adjacent-double helpers ─────────────────────────────────────────────────
// Edge thresholds are reached through odds conversion, so the boundary
// probability must be DERIVED from the market's actual no-vig line rather than
// written as a decimal. `below`/`above` then step to the immediately adjacent
// representable doubles, which characterises the exact float behaviour instead
// of smearing it with a tolerance.
// SCOPE: strictly positive finite numbers only. For x > 0 the IEEE-754 bit
// pattern increases monotonically, so +/-1 on the raw bits is next-up and
// next-down. This is NOT a general nextAfter -- it is wrong across zero, where
// the sign bit flips (nextDown(+0) is -MIN_VALUE, not a bit decrement). Every
// use here is a probability or a credibility score, all > 0, and the guard
// makes a future misuse fail loudly rather than silently.
const _buf = new ArrayBuffer(8);
const _f = new Float64Array(_buf);
const _i = new BigInt64Array(_buf);
const assertPositive = (x) => {
  if (!(x > 0) || !Number.isFinite(x)) {
    throw new Error(`above/below are positive-finite helpers; got ${x}`);
  }
};
const above = (x) => { assertPositive(x); _f[0] = x; _i[0] += 1n; return _f[0]; };
const below = (x) => { assertPositive(x); _f[0] = x; _i[0] -= 1n; return _f[0]; };

// The no-vig probability of side A for a given American pair, straight from the
// production functions -- not re-derived in the test.
const noVigA = (oddsA, oddsB) =>
  stripVig(parseAmericanOdds(oddsA), parseAmericanOdds(oddsB)).noVigA;

// The SMALLEST representable pA whose production-computed edge satisfies the
// `>= edge` gate for this market.
//
// `base + edge` is not it: the subtraction the production code performs
// (pA - noVigA) need not round back to exactly `edge`, which is the same
// characteristic that makes 0.60 against an even market yield
// 0.09999999999999998. So step to the true boundary rather than assume it.
function edgeBoundary(odds, edge) {
  const base = noVigA(odds[0], odds[1]);
  const passes = (p) => p - base >= edge;
  let p = base + edge;
  if (passes(p)) { while (passes(below(p))) p = below(p); }
  else { while (!passes(p)) p = above(p); }
  return p;
}

// The probability tier a given pA lands in, per the production rule.
const tierOf = (p) => (p < 0.60 ? 'floor' : p < 0.65 ? 'low' : p < 0.70 ? 'mid' : 'high');

describe('odds conversion', () => {
  it('parseAmericanOdds converts both signs and rejects junk', () => {
    expect(parseAmericanOdds('+100')).toBe(0.5);
    expect(parseAmericanOdds('-100')).toBe(0.5);
    expect(parseAmericanOdds('-200')).toBe(200 / 300);
    expect(parseAmericanOdds('+200')).toBe(100 / 300);
    for (const junk of ['', '+', '-', 'abc', '0', null, undefined]) {
      expect(parseAmericanOdds(junk)).toBeNull();
    }
  });

  it('americanOdds pivots at 0.5 and clamps extremes', () => {
    expect(americanOdds(0.5)).toBe('-100');
    expect(americanOdds(0.6)).toBe('-150');
    expect(americanOdds(0.4)).toBe('+150');
    expect(americanOdds(0)).toBe(americanOdds(0.001));
    expect(americanOdds(1)).toBe(americanOdds(0.999));
  });

  it('americanToDecimal agrees with parseAmericanOdds', () => {
    for (const o of ['+150', '-150', '+100', '-250']) {
      expectWithinUlps(1 / americanToDecimal(o), parseAmericanOdds(o), `implied prob for ${o}`, 4);
    }
  });
});

describe('stripVig / EV / Kelly', () => {
  it('stripVig normalises to 1 and reports overround', () => {
    const { noVigA, noVigB, overround } = stripVig(0.55, 0.55);
    expect(noVigA).toBe(0.5);
    expect(noVigB).toBe(0.5);
    expectWithinUlps(overround, 10, 'overround', 4096);
  });

  it('stripVig degenerates safely at zero total', () => {
    expect(stripVig(0, 0)).toEqual({ noVigA: 0.5, noVigB: 0.5, vig: 0, overround: 0 });
  });

  it('EV is exactly zero at the break-even probability', () => {
    expect(calcExpectedValue(0.5, 2)).toBe(0);
    expectWithinUlps(calcExpectedValue(0.6, 2), 20, 'EV at p=0.6', 4096);
    expectWithinUlps(calcExpectedValue(0.4, 2), -20, 'EV at p=0.4', 4096);
  });

  it('Kelly is exactly zero at break-even and floors at zero below it', () => {
    expect(kellyFraction(0.5, 2)).toBe(0);
    expect(kellyFraction(0.49, 2)).toBe(0);
    expectWithinUlps(kellyFraction(0.6, 2), 0.2, 'Kelly at p=0.6', 4096);
    expect(kellyFraction(0.6, 1)).toBe(0);
  });
});

describe('bet-action probability boundaries — both sides and the exact value', () => {
  it('below the 0.60 hard floor is NO BET', () => {
    expect(action(0.5999)).toBe('NO BET');
  });

  // CHARACTERISATION of a floating-point boundary interaction, verified rather
  // than assumed. At pA = 0.60 against an even market the no-vig line is 0.5,
  // so pickEdge computes as 0.60 - 0.5 = 0.09999999999999998 -- which is NOT
  // >= 0.10. The probability floor is cleared, but the low-conviction tier's
  // edge requirement is not, so the result is NO BET.
  //
  // This is real current behaviour and is exactly the kind of thing a decimal
  // tolerance would have hidden.
  it('exactly 0.60 clears the probability floor but not the 0.10 edge gate', () => {
    expect(0.60 - 0.5 >= 0.10).toBe(false);
    expect(action(0.60)).toBe('NO BET');
  });

  it('0.60 to just under 0.65 reaches LEAN once edge genuinely clears 0.10', () => {
    // Even market, so the no-vig line is 0.5 and edge = pA - 0.5.
    expect(action(0.62)).toBe('LEAN');
    expect(action(0.6499)).toBe('LEAN');
  });

  it('exactly 0.65 enters the mid tier', () => {
    expect(action(0.65)).toBe('LEAN');
  });

  it('exactly 0.70 enters the high tier, where the same edge scores higher', () => {
    expect(action(0.6999)).toBe('LEAN');
    expect(action(0.70)).toBe('BET');
  });

  // Each transition needs a market where the EDGE gate is comfortably satisfied
  // on both adjacent sides, so the only thing changing across the boundary is
  // the probability tier. An even market fails that: at 0.60 the edge is
  // 0.09999999999999998 and at 0.65 it is 0.15, so both sides of each boundary
  // give the same answer for edge reasons and the threshold is not bound.
  it('0.60 floor: below is NO BET, at and above are LEAN', () => {
    const odds = ['+150', '-170'];              // no-vig A ~ 0.3885
    const base = noVigA(odds[0], odds[1]);
    expect(0.60 - base).toBeGreaterThan(0.10);  // edge clears the low-tier gate
    expect(below(0.60) - base).toBeGreaterThan(0.10);
    expect(action(below(0.60), odds)).toBe('NO BET');   // floor, not edge
    expect(action(0.60, odds)).toBe('LEAN');
    expect(action(above(0.60), odds)).toBe('LEAN');
  });

  it('0.65 low-to-mid: below is LEAN, at and above are BET', () => {
    const odds = ['+200', '-250'];              // no-vig A ~ 0.3182
    const base = noVigA(odds[0], odds[1]);
    expect(0.65 - base).toBeGreaterThan(0.30);  // edge clears the mid-tier BET gate
    expect(below(0.65) - base).toBeGreaterThan(0.30);
    expect(action(below(0.65), odds)).toBe('LEAN');     // low tier caps at LEAN
    expect(action(0.65, odds)).toBe('BET');             // mid tier, edge >= 0.30
    expect(action(above(0.65), odds)).toBe('BET');
  });

  it('0.70 mid-to-high: below is LEAN, at and above are BET', () => {
    // Even market: edge is 0.20 throughout, which is < 0.30 (so mid tier caps
    // at LEAN) but >= 0.15 (so the high tier reaches BET).
    expect(action(below(0.70))).toBe('LEAN');
    expect(action(0.70)).toBe('BET');
    expect(action(above(0.70))).toBe('BET');
  });
});

describe('bet-action EDGE boundaries — derived from the market, adjacent doubles', () => {
  // The 0.03 minimum edge never by itself produces a bet -- every tier needs at
  // least 0.10 (0.15 in the high tier). Its observable effect is on
  // hasPickEdge, which zeroes edgeScore in betConfidence and selects the
  // "no positive edge" reason. That is what gets asserted.
  it('minimum edge 0.03: betConfidence and reason flip at the boundary', () => {
    const odds = ['-120', '+100'];
    const at = edgeBoundary(odds, 0.03);
    const m = (p) => computeMarketAnalysis(mkResult(p), odds[0], odds[1], HI, HI2);

    expect(m(below(at)).betConfidence).toBeLessThan(m(at).betConfidence);
    expect(m(below(at)).noBetReason).toMatch(/No positive edge/i);
    expect(m(at).noBetReason).not.toMatch(/No positive edge/i);
    expect(m(above(at)).betConfidence).toBeGreaterThanOrEqual(m(at).betConfidence);
  });

  it('low tier edge 0.10: below is NO BET, at and above are LEAN', () => {
    const odds = ['-120', '+100'];
    const at = edgeBoundary(odds, 0.10);
    expect(tierOf(at)).toBe('low');
    expect(action(below(at), odds)).toBe('NO BET');
    expect(action(at, odds)).toBe('LEAN');
    expect(action(above(at), odds)).toBe('LEAN');
  });

  it('mid tier edge 0.10: below is NO BET, at and above are LEAN', () => {
    const odds = ['-155', '+135'];
    const at = edgeBoundary(odds, 0.10);
    expect(tierOf(at)).toBe('mid');
    expect(action(below(at), odds)).toBe('NO BET');
    expect(action(at, odds)).toBe('LEAN');
    expect(action(above(at), odds)).toBe('LEAN');
  });

  it('mid tier edge 0.30: below is LEAN, at and above are BET', () => {
    const odds = ['+160', '-190'];         // no-vig A ~ 0.37, so +0.30 lands mid
    const at = edgeBoundary(odds, 0.30);
    expect(tierOf(at)).toBe('mid');
    expect(action(below(at), odds)).toBe('LEAN');
    expect(action(at, odds)).toBe('BET');
    expect(action(above(at), odds)).toBe('BET');
  });

  it('high tier edge 0.15: below is LEAN, at and above are BET', () => {
    const odds = ['-160', '+140'];
    const at = edgeBoundary(odds, 0.15);
    expect(tierOf(at)).toBe('high');
    expect(action(below(at), odds)).toBe('LEAN');
    expect(action(at, odds)).toBe('BET');
    expect(action(above(at), odds)).toBe('BET');
  });

  it('high tier edge 0.25: below is BET, at and above are STRONG BET', () => {
    // Market implied must stay <= 2/3 or the heavy-favourite ceiling fires.
    const odds = ['-180', '+155'];
    expect(parseAmericanOdds(odds[0])).toBeLessThanOrEqual(2 / 3);
    const at = edgeBoundary(odds, 0.25);
    expect(tierOf(at)).toBe('high');
    expect(action(below(at), odds)).toBe('BET');
    expect(action(at, odds)).toBe('STRONG BET');
    expect(action(above(at), odds)).toBe('STRONG BET');
  });

  it('edgeBoundary really is the boundary — one step below fails the gate', () => {
    for (const [odds, edge] of [[['-120', '+100'], 0.10], [['-160', '+140'], 0.15]]) {
      const base = noVigA(odds[0], odds[1]);
      const at = edgeBoundary(odds, edge);
      expect(at - base).toBeGreaterThanOrEqual(edge);
      expect(below(at) - base).toBeLessThan(edge);
    }
  });
});

describe('bet-action overrides', () => {
  it('CREDIBILITY below 30 caps BET/STRONG BET to LEAN; exactly 30 does not', () => {
    expect(action(0.75)).toBe('STRONG BET');
    expect(action(0.75, EVEN, { FIGHTER: 'LowA', CREDIBILITY: 29 }, HI2)).toBe('LEAN');
    expect(action(0.75, EVEN, HI, { FIGHTER: 'LowB', CREDIBILITY: 29 })).toBe('LEAN');
    expect(action(0.75, EVEN, { FIGHTER: 'A30', CREDIBILITY: 30 }, HI2)).toBe('STRONG BET');
  });

  it('credibility threshold 30: adjacent doubles either side', () => {
    expect(action(0.75, EVEN, { FIGHTER: 'x', CREDIBILITY: below(30) }, HI2)).toBe('LEAN');
    expect(action(0.75, EVEN, { FIGHTER: 'x', CREDIBILITY: 30 }, HI2)).toBe('STRONG BET');
    expect(action(0.75, EVEN, { FIGHTER: 'x', CREDIBILITY: above(30) }, HI2)).toBe('STRONG BET');
  });

  it('the credibility cap only downgrades BET/STRONG BET, never LEAN or NO BET', () => {
    const low = { FIGHTER: 'low', CREDIBILITY: 10 };
    expect(action(0.62, EVEN, low, HI2)).toBe('LEAN');      // already LEAN
    expect(action(0.55, EVEN, low, HI2)).toBe('NO BET');    // already NO BET
  });

  it('heavy-favourite ceiling suppresses to NO BET above 2/3 implied with edge < 0.25', () => {
    expect(action(0.78, ['-250', '+250'])).toBe('NO BET');
  });

  it('heavy-favourite threshold: strictly ABOVE 2/3 implied, adjacent doubles', () => {
    // The guard is `pickRawOdds > 2/3`, so exactly 2/3 does NOT suppress.
    // -200 implies exactly 2/3.
    expect(parseAmericanOdds('-200')).toBe(2 / 3);
    // At exactly 2/3 with a sub-0.25 edge the action survives...
    expect(action(0.72, ['-200', '+170'])).not.toBe('NO BET');
    // ...and just above 2/3 it is suppressed.
    expect(action(0.72, ['-201', '+170'])).toBe('NO BET');
    expect(parseAmericanOdds('-201')).toBeGreaterThan(2 / 3);
  });

  it('heavy-favourite accompanying edge 0.25: at and above survives, below is suppressed', () => {
    const odds = ['-250', '+200'];
    expect(parseAmericanOdds(odds[0])).toBeGreaterThan(2 / 3);
    // edgeBoundary, not base + 0.25 -- the same reason established above.
    const at = edgeBoundary(odds, 0.25);
    expect(action(below(at), odds)).toBe('NO BET');
    expect(action(at, odds)).not.toBe('NO BET');
    expect(action(above(at), odds)).not.toBe('NO BET');
  });

  it('conflicting signals force NO BET even at a large opposite edge', () => {
    // Model picks A (pA > 0.5) but the market underprices B by >= 0.03, and A
    // itself has no edge -- betting the "value" would mean betting against the
    // model's own pick.
    const odds = ['-400', '+320'];              // no-vig A ~ 0.79
    const m = computeMarketAnalysis(mkResult(0.72), odds[0], odds[1], HI, HI2);
    expect(m.edgeA).toBeLessThan(0.03);         // pick has no edge
    expect(m.edgeB).toBeGreaterThanOrEqual(0.03); // opposite side does
    expect(m.betAction).toBe('NO BET');
    expect(m.noBetReason).toMatch(/conflicting signals/i);
  });
});

describe('market analysis — nulls, fair lines, edges', () => {
  it('returns null when the market or result is unusable', () => {
    expect(computeMarketAnalysis(mkResult(0.7), '', '+100', HI, HI2)).toBeNull();
    expect(computeMarketAnalysis(mkResult(0.7), '+100', '', HI, HI2)).toBeNull();
    expect(computeMarketAnalysis(null, '+100', '+100', HI, HI2)).toBeNull();
  });

  it('fair lines are americanOdds of the model probabilities', () => {
    const m = computeMarketAnalysis(mkResult(0.7), '+100', '+100', HI, HI2);
    expect(m.fairLineA).toBe(americanOdds(0.7));
    expect(m.fairLineB).toBe(americanOdds(0.3));
  });

  it('edge is model probability minus no-vig implied probability', () => {
    const m = computeMarketAnalysis(mkResult(0.7), '+100', '+100', HI, HI2);
    expectWithinUlps(m.edgeA, 0.7 - 0.5, 'edgeA at an even market', 4);
    expectWithinUlps(m.edgeB, 0.3 - 0.5, 'edgeB at an even market', 4);
  });
});

describe('market analysis over frozen fixture fighters', () => {
  it('produces a betAction from the known vocabulary for all 37 pairs', () => {
    const allowed = new Set(['NO BET', 'LEAN', 'BET', 'STRONG BET']);
    let n = 0;
    for (const p of pairs) {
      const fA = fighterFixtures[p.a];
      const fB = fighterFixtures[p.b];
      if (!fA || !fB) continue;
      const m = computeMarketAnalysis(mkResult(0.66), '-150', '+130', fA, fB);
      expect(allowed.has(m.betAction), `${p.a} vs ${p.b}: ${m.betAction}`).toBe(true);
      n++;
    }
    expect(n).toBe(37);
  });
});
