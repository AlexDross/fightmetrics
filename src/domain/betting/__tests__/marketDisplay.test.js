import { describe, it, expect } from 'vitest';
import { upcomingMarketDisplay, lastName } from '../marketDisplay.js';

// UFC Fight Night 2026-11-07: v2 picks Walker, C6 picks Cortes Acosta. The card
// used to print a bare "-230" / "EV -7.9%" under a "Johnny Walker" headline.
const walker = {
  fighterA: 'Johnny Walker',
  fighterB: 'Waldo Cortes Acosta',
  oddsA: '+180',
  oddsB: '-230',
  trackedSide: 'Waldo Cortes Acosta',
  gateEV: -0.07871137655496863,
  gateVersion: 'c6_dog_v3_book',
};

describe('upcomingMarketDisplay', () => {
  it('names both prices, so a disagreeing headline cannot borrow the other line', () => {
    const d = upcomingMarketDisplay(walker, { isV3: true, predictedWinner: 'Waldo Cortes Acosta', pickEdge: -0.019 });
    expect(d.sides).toEqual([
      { fighter: 'Johnny Walker', odds: '+180' },
      { fighter: 'Waldo Cortes Acosta', odds: '-230' },
    ]);
  });

  it('labels v3 EV with the tracked side', () => {
    const d = upcomingMarketDisplay(walker, { isV3: true, predictedWinner: 'Waldo Cortes Acosta', pickEdge: null });
    expect(d.valueLine).toBe('EV -7.9% on Cortes Acosta');
  });

  it('labels a legacy edge with the pick', () => {
    const d = upcomingMarketDisplay(
      { ...walker, gateVersion: undefined, gateEV: undefined },
      { isV3: false, predictedWinner: 'Johnny Walker', pickEdge: 0.0191 },
    );
    expect(d.valueLine).toBe('+1.9% edge on Walker');
  });

  it('keeps missing odds visible as empty and says when there is no edge', () => {
    const d = upcomingMarketDisplay({ fighterA: 'A B', fighterB: 'C D' }, { isV3: false, predictedWinner: 'A B', pickEdge: null });
    expect(d.sides.map((s) => s.odds)).toEqual(['', '']);
    expect(d.valueLine).toBe('No saved market edge');
  });

  it('lastName keeps multi-word surnames and single names', () => {
    expect(lastName('Waldo Cortes Acosta')).toBe('Cortes Acosta');
    expect(lastName('Shara')).toBe('Shara');
  });
});
