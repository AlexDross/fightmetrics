import { describe, it, expect } from 'vitest';
import { computeMarketAnalysis } from '../index.js';

// Regression for the heavy-favourite bestBet/betAction inconsistency.
//
// BEFORE the 2026-08-18 fix, `bestBet` was derived from `cappedBetAction`
// (PRE heavy-favourite suppression) while `betAction` was `finalBetAction`
// (POST suppression). A suppressed heavy favourite therefore emitted
// betAction 'NO BET' while bestBet still named the pick — which propagated into
// betRecommendedFighter/betRecommendedOdds. This test FAILS against that buggy
// code (bestBet would be 'A') and passes after the fix.

const neutralEdges = Object.fromEntries(
  ['striking', 'grappling', 'physical', 'form', 'experience', 'analytics'].map((k) => [
    k,
    { clamped: 0 },
  ])
);
const fa = { FIGHTER: 'Alice', CREDIBILITY: 100 };
const fb = { FIGHTER: 'Bob', CREDIBILITY: 100 };
const mkResult = (pA) => ({ pA, pB: 1 - pA, edges: neutralEdges });

describe('bestBet tracks the POST heavy-favourite-suppression action', () => {
  it('a suppressed heavy favourite: betAction NO BET AND bestBet null', () => {
    // Alice no-vig ~0.714 (heavy favourite), v2 0.82 -> actionable LEAN before the
    // heavy-favourite ceiling, which then suppresses to NO BET (edge < 0.25).
    const m = computeMarketAnalysis(mkResult(0.82), '-250', '+250', fa, fb);
    expect(m.pickSide).toBe('A');
    expect(m.heavyFavSuppressed).toBe(true);
    expect(m.cappedBetAction).not.toBe('NO BET'); // actionable before suppression
    expect(m.betAction).toBe('NO BET'); // suppressed
    expect(m.bestBet).toBeNull(); // <-- the fix: no pick is named on a NO BET
  });

  it('invariant: bestBet !== null  =>  betAction !== "NO BET" across a sweep', () => {
    const oddsPairs = [
      ['-110', '-110'],
      ['-150', '+130'],
      ['-250', '+250'],
      ['-350', '+275'],
      ['+120', '-140'],
      ['-600', '+425'],
    ];
    for (const [oa, ob] of oddsPairs) {
      for (let pA = 0.05; pA < 0.96; pA += 0.05) {
        const m = computeMarketAnalysis(mkResult(pA), oa, ob, fa, fb);
        if (!m) continue;
        if (m.bestBet !== null) {
          expect(m.betAction, `pA=${pA.toFixed(2)} odds=${oa}/${ob}`).not.toBe('NO BET');
        }
      }
    }
  });

  it('a non-suppressed actionable pick still names bestBet', () => {
    // Alice modest favourite, clear edge, no heavy-fav ceiling.
    const m = computeMarketAnalysis(mkResult(0.67), '-130', '+120', fa, fb);
    expect(['LEAN', 'BET', 'STRONG BET']).toContain(m.betAction);
    expect(m.bestBet).toBe('A');
    expect(m.heavyFavSuppressed).toBe(false);
  });
});
