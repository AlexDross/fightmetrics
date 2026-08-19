import { describe, it, expect } from 'vitest';
import {
  buildMarketSnapshot,
  snapshotIdFromFightId,
  SNAPSHOT_SOURCE_MANUAL,
} from '../snapshot.js';

const base = {
  fighterA: 'Alice',
  fighterB: 'Bob',
  capturedAt: '2026-09-01T12:00:00.000Z',
  fightId: '1786823202677-ahytyi',
};

describe('market snapshot', () => {
  it('parses proportional no-vig once; noVigA + noVigB === 1', () => {
    const even = buildMarketSnapshot({ ...base, oddsA: '-110', oddsB: '-110' });
    expect(even.valid).toBe(true);
    expect(even.noVigA).toBeCloseTo(0.5, 12);
    expect(even.noVigB).toBeCloseTo(0.5, 12);

    const fav = buildMarketSnapshot({ ...base, oddsA: '-150', oddsB: '+130' });
    const rawA = 150 / 250;
    const rawB = 100 / 230;
    expect(fav.rawImpliedA).toBeCloseTo(rawA, 15);
    expect(fav.rawImpliedB).toBeCloseTo(rawB, 15);
    expect(fav.noVigA).toBeCloseTo(rawA / (rawA + rawB), 15);
    expect(fav.noVigA + fav.noVigB).toBeCloseTo(1, 15);
    // the snapshot is a valid market input (carries decimals for the gate)
    expect(fav.decimalA).toBeCloseTo(100 / 150 + 1, 12); // -150 -> 100/150 + 1
    expect(fav.decimalB).toBeCloseTo(130 / 100 + 1, 12); // +130 -> 130/100 + 1
  });

  it('records honest manual-capture semantics with capturedAt', () => {
    const s = buildMarketSnapshot({ ...base, oddsA: '-150', oddsB: '+130' });
    expect(s.source).toBe(SNAPSHOT_SOURCE_MANUAL);
    expect(s.capturedAt).toBe(base.capturedAt);
    expect(s.captureSemantics).toMatch(/not proof of when the sportsbook/i);
  });

  it('derives the snapshot id from the parent prediction (fight) id', () => {
    const s = buildMarketSnapshot({ ...base, oddsA: '-150', oddsB: '+130' });
    expect(s.snapshotId).toBe(`msnap_${base.fightId}`);
    expect(s.snapshotId).toBe(snapshotIdFromFightId(base.fightId));
  });

  it('same fight id + same inputs → identical snapshot id', () => {
    const a = buildMarketSnapshot({ ...base, oddsA: '-150', oddsB: '+130' });
    const b = buildMarketSnapshot({ ...base, oddsA: '-150', oddsB: '+130' });
    expect(a.snapshotId).toBe(b.snapshotId);
  });

  it('different fight ids with identical fighters/odds/timestamp → different ids', () => {
    const a = buildMarketSnapshot({ ...base, oddsA: '-150', oddsB: '+130', fightId: 'id-AAA' });
    const b = buildMarketSnapshot({ ...base, oddsA: '-150', oddsB: '+130', fightId: 'id-BBB' });
    expect(a.snapshotId).not.toBe(b.snapshotId);
  });

  it('fails closed (never throws) on missing fight id, odds, timestamp or mapping', () => {
    expect(
      buildMarketSnapshot({ ...base, oddsA: '-150', oddsB: '+130', fightId: undefined }).reason
    ).toBe('MISSING_FIGHT_ID');
    expect(buildMarketSnapshot({ ...base, oddsA: '', oddsB: '+130' })).toMatchObject({
      valid: false,
      reason: 'ODDS_MISSING_OR_INVALID',
    });
    expect(buildMarketSnapshot({ ...base, oddsA: 'abc', oddsB: '+130' }).reason).toBe(
      'ODDS_MISSING_OR_INVALID'
    );
    expect(
      buildMarketSnapshot({
        oddsA: '-150',
        oddsB: '+130',
        fighterA: 'Alice',
        fighterB: 'Bob',
        fightId: 'x',
      }).reason
    ).toBe('MISSING_CAPTURED_AT');
    expect(
      buildMarketSnapshot({ ...base, fighterA: null, oddsA: '-150', oddsB: '+130' }).reason
    ).toBe('MISSING_FIGHTER_MAPPING');
  });
});
