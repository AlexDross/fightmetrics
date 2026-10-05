import { describe, it, expect } from 'vitest';
import { computeModelScoreboard } from '../scoreboard.js';

const e = (over) => ({
  fighterA: 'A', fighterB: 'B', eventDate: '2026-09-01', oddsA: '-150', oddsB: '+130',
  v2pA: 0.7, v2pB: 0.3, actualWinner: 'A', _provenance: { captureMode: 'live' }, ...over,
});

describe('computeModelScoreboard', () => {
  it('scores every model on the same live, decisive, priced fights', () => {
    const sb = computeModelScoreboard([
      e({}),
      e({ actualWinner: 'B', eventDate: '2026-09-08' }),
      e({ _provenance: { captureMode: 'reconstructed' } }),  // excluded
      e({ actualWinner: 'NC' }),                             // excluded
      e({ oddsA: '' }),                                      // excluded
      e({ v2pA: null, v2pB: null }),                         // excluded
    ]);
    expect(sb.fights).toBe(2);
    for (const r of sb.rows) expect(r.fights).toBe(2);
    const v2 = sb.rows.find((r) => r.model === 'v2');
    expect(v2.accuracy).toBe(50);
    expect(v2.brier).toBeCloseTo(((0.7 - 1) ** 2 + 0.7 ** 2) / 2, 12);
    // A at -150: win +0.6667, loss -1 -> -0.1667u over 2 fights
    expect(v2.units).toBeCloseTo(100 / 150 - 1, 12);
    expect(sb.from).toBe('2026-09-01');
    expect(sb.to).toBe('2026-09-08');
  });

  it('uses stored C6 when present and derives it otherwise, counting the derived ones', () => {
    const sb = computeModelScoreboard([e({ c6ProbA: 0.2 }), e({ eventDate: '2026-09-02' })]);
    expect(sb.c6Derived).toBe(1);
    const c6 = sb.rows.find((r) => r.model === 'C6');
    expect(c6.fights).toBe(2);
    expect(c6.accuracy).toBe(50); // stored 0.2 picks B (lost), derived picks A (won)
  });

  it('last-N keeps the most recent fights', () => {
    const sb = computeModelScoreboard(
      [e({ eventDate: '2026-01-01' }), e({ eventDate: '2026-03-01' }), e({ eventDate: '2026-02-01' })],
      { last: 2 }
    );
    expect(sb.fights).toBe(2);
    expect(sb.from).toBe('2026-02-01');
  });
});
