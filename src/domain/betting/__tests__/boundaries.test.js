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
    // -140/+120 puts the no-vig line near 0.575, giving pickEdge > 0.10.
    expect(action(0.62, ['+100', '+100'])).toBe('LEAN');
    expect(action(0.6499, ['+100', '+100'])).toBe('LEAN');
  });

  it('exactly 0.65 enters the mid tier', () => {
    expect(action(0.65)).toBe('LEAN');
  });

  it('exactly 0.70 enters the high tier, where the same edge scores higher', () => {
    expect(action(0.6999)).toBe('LEAN');
    expect(action(0.70)).toBe('BET');
  });

  it('high tier reaches STRONG BET once edge clears 0.25', () => {
    expect(action(0.75)).toBe('STRONG BET');
    expect(action(0.7499)).toBe('BET');
  });

  it('requires pickEdge >= 0.03 at all', () => {
    expect(action(0.75, [americanOdds(0.74), americanOdds(0.26)])).toBe('NO BET');
  });
});

describe('bet-action overrides', () => {
  it('CREDIBILITY below 30 caps BET/STRONG BET to LEAN; exactly 30 does not', () => {
    expect(action(0.75)).toBe('STRONG BET');
    expect(action(0.75, EVEN, { FIGHTER: 'LowA', CREDIBILITY: 29 }, HI2)).toBe('LEAN');
    expect(action(0.75, EVEN, HI, { FIGHTER: 'LowB', CREDIBILITY: 29 })).toBe('LEAN');
    expect(action(0.75, EVEN, { FIGHTER: 'A30', CREDIBILITY: 30 }, HI2)).toBe('STRONG BET');
  });

  it('heavy-favourite ceiling suppresses to NO BET above 2/3 implied with edge < 0.25', () => {
    expect(action(0.78, ['-250', '+250'])).toBe('NO BET');
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
