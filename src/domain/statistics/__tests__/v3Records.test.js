import { describe, it, expect } from 'vitest';
import { computeV3Records } from '../v3Records.js';

const base = (over) => ({
  fighterA: 'Alpha',
  fighterB: 'Bravo',
  gateVersion: 'c6_dog_v3',
  _provenance: { captureMode: 'live' },
  trackedSide: 'Alpha',
  betRecommendedFighter: 'Alpha',
  betRecommendedOdds: '+110',
  marketOdds: '+110',
  c6ProbA: 0.55,
  c6ProbB: 0.45,
  actualWinner: 'Alpha',
  ...over,
});

describe('computeV3Records', () => {
  it('keeps strategy, paper, actual and baseline separate', () => {
    const rec = computeV3Records([
      base({ betAction: 'BET', execution: { status: 'placed', fighter: 'Alpha', acceptedOdds: '+100', stakeUnits: 2 } }),
      base({ betAction: 'BET', actualWinner: 'Bravo' }),
      base({ betAction: 'LEAN', betRecommendedOdds: '-200', marketOdds: '-200' }),
      base({ betAction: 'NO BET', betRecommendedFighter: '', betRecommendedOdds: '', marketOdds: '-150', actualWinner: 'Bravo' }),
    ]);
    // strategy: +1.10 then -1 at the SAVED price, 1u each
    expect(rec.strategy).toMatchObject({ bets: 2, wins: 1, losses: 1, staked: 2 });
    expect(rec.strategy.units).toBeCloseTo(0.1, 10);
    // actual: only the recorded bet, at its accepted price and real stake
    expect(rec.actual).toMatchObject({ bets: 1, wins: 1, staked: 2 });
    expect(rec.actual.units).toBeCloseTo(2, 10);
    // paper: the LEAN at -200, 1u
    expect(rec.paper.units).toBeCloseTo(0.5, 10);
    // baseline: every C6 pick at 1u (4 fights, NO BET included)
    expect(rec.baseline.bets).toBe(4);
    expect(rec.strategy.meanProb).toBeCloseTo(55, 10);
  });

  it('counts only live captures stamped with the frozen gate version', () => {
    const rec = computeV3Records([
      base({ betAction: 'BET' }),
      base({ betAction: 'BET', _provenance: { captureMode: 'reconstructed' } }),
      base({ betAction: 'BET', gateVersion: undefined }),
      base({ betAction: 'BET', gateVersion: 'c6_dog_v4' }),
    ]);
    expect(rec.experimentEntries).toBe(1);
    expect(rec.strategy.bets).toBe(1);
  });

  it('pushes return the stake; pending and skipped are counted, never settled', () => {
    const rec = computeV3Records([
      base({ betAction: 'BET', actualWinner: 'NC' }),
      base({ betAction: 'BET', actualWinner: '' }),
      base({ betAction: 'LEAN', actualWinner: '' }),
      base({ betAction: 'BET', actualWinner: '', execution: { status: 'skipped', skipReason: 'LINE_MOVED' } }),
    ]);
    expect(rec.strategy).toMatchObject({ bets: 0, pushes: 1, staked: 0, roi: null });
    expect(rec.pending).toEqual({ bet: 2, lean: 1 });
    expect(rec.skipped).toBe(1);
    expect(rec.actual.bets).toBe(0);
  });

  it('empty input', () => {
    expect(computeV3Records([]).experimentEntries).toBe(0);
    expect(computeV3Records(undefined).strategy.bets).toBe(0);
  });
});
