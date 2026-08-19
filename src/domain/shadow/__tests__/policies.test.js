import { describe, it, expect } from 'vitest';
import { evaluateShadowArms, crossCheckSnapshotIds } from '../policies.js';
import { buildMarketSnapshot } from '../snapshot.js';

const fighters = (a = 'Alice', b = 'Bob', cred = 100) => ({
  fA: { FIGHTER: a, CREDIBILITY: cred },
  fB: { FIGHTER: b, CREDIBILITY: cred },
});

const snap = (oddsA, oddsB, fightId = 'fid-1') =>
  buildMarketSnapshot({
    oddsA,
    oddsB,
    capturedAt: '2026-09-01T12:00:00.000Z',
    fighterA: 'Alice',
    fighterB: 'Bob',
    fightId,
  });

// NOTE: evaluateShadowArms takes ONLY the snapshot (no raw odds).
const run = ({ oddsA, oddsB, v2pA, fightId, ...f }) => {
  const { fA, fB } = f.fA ? f : fighters();
  return evaluateShadowArms({ v2pA, v2pB: 1 - v2pA, fA, fB, snapshot: snap(oddsA, oddsB, fightId) });
};

describe('shadow policy arms', () => {
  it('produces all four arms from one snapshot; every arm records that snapshot id', () => {
    const s = snap('-130', '+120');
    const r = evaluateShadowArms({ v2pA: 0.67, v2pB: 0.33, ...fighters(), snapshot: s });
    expect(r.available).toBe(true);
    expect(Object.keys(r.arms).sort()).toEqual([
      'C6_AGREEMENT',
      'C6_CURRENT',
      'V2_AGREEMENT',
      'V2_CURRENT',
    ]);
    for (const k of Object.keys(r.arms)) {
      expect(r.arms[k].marketSnapshotId).toBe(s.snapshotId);
    }
    expect(r.singleSnapshotConsistent).toBe(true);
    expect(r.marketSnapshotId).toBe(s.snapshotId);
  });

  it('both gate evaluations carry the same snapshot id (one snapshot object)', () => {
    const s = snap('-130', '+120');
    const r = evaluateShadowArms({ v2pA: 0.67, v2pB: 0.33, ...fighters(), snapshot: s });
    expect(r.v2Gate.marketSnapshotId).toBe(s.snapshotId);
    expect(r.c6Gate.marketSnapshotId).toBe(s.snapshotId);
    expect(r.v2Gate.noVigA).toBe(r.c6Gate.noVigA);
    expect(r.v2Gate.noVigA).toBe(s.noVigA);
  });

  it('AGREEMENT retains an actionable AGREE pick and does not change its tier', () => {
    const r = run({ oddsA: '-130', oddsB: '+120', v2pA: 0.67 });
    const cur = r.arms.V2_CURRENT;
    const agr = r.arms.V2_AGREEMENT;
    expect(cur.baseFinalAction).toBe('LEAN');
    expect(cur.pickFighter).toBe('Alice');
    expect(agr.agreementState).toBe('AGREE');
    expect(agr.paperAction).toBe('LEAN');
    expect(agr.wouldWager).toBe(true);
    expect(agr.pickProb).toBe(cur.pickProb);
    expect(agr.pickFighter).toBe(cur.pickFighter);
    expect(agr.baseFinalAction).toBe(cur.baseFinalAction);
  });

  it('AGREEMENT suppresses an actionable DISAGREE pick to NO BET (paper only)', () => {
    const r = run({ oddsA: '+120', oddsB: '-130', v2pA: 0.66 });
    const cur = r.arms.V2_CURRENT;
    const agr = r.arms.V2_AGREEMENT;
    expect(cur.pickFighter).toBe('Alice');
    expect(['LEAN', 'BET', 'STRONG BET']).toContain(cur.baseFinalAction);
    expect(cur.wouldWager).toBe(true);
    expect(agr.agreementState).toBe('DISAGREE');
    expect(agr.paperAction).toBe('NO BET');
    expect(agr.wouldWager).toBe(false);
    expect(agr.pickProb).toBe(cur.pickProb);
    expect(agr.pickFighter).toBe(cur.pickFighter);
    expect(agr.baseFinalAction).toBe(cur.baseFinalAction);
  });

  it("exact pick'em is recorded PICKEM and the agreement arm is suppressed", () => {
    const r = run({ oddsA: '-110', oddsB: '-110', v2pA: 0.66 });
    expect(r.marketFavouriteSide).toBe('PICKEM');
    expect(r.arms.V2_CURRENT.agreementState).toBe('PICKEM');
    expect(r.arms.V2_AGREEMENT.paperAction).toBe('NO BET');
    expect(r.arms.V2_AGREEMENT.wouldWager).toBe(false);
    expect(r.arms.V2_CURRENT.wouldWager).toBe(true);
  });

  it('agreement is applied AFTER the full gate: a heavy-fav-suppressed pick stays NO BET', () => {
    const r = run({ oddsA: '-250', oddsB: '+250', v2pA: 0.82 });
    const cur = r.arms.V2_CURRENT;
    expect(cur.heavyFavSuppressed).toBe(true);
    expect(cur.preSuppressionAction).not.toBe('NO BET');
    expect(cur.baseFinalAction).toBe('NO BET');
    expect(cur.agreementState).toBe('N/A');
    expect(r.arms.V2_AGREEMENT.paperAction).toBe('NO BET');
    expect(r.arms.V2_AGREEMENT.wouldWager).toBe(false);
  });

  it('swapping fighters and their odds keeps the recommended FIGHTER identical', () => {
    const forward = evaluateShadowArms({
      v2pA: 0.67,
      v2pB: 0.33,
      fA: { FIGHTER: 'Alice', CREDIBILITY: 100 },
      fB: { FIGHTER: 'Bob', CREDIBILITY: 100 },
      snapshot: snap('-130', '+120', 'fwd'),
    });
    const reversed = evaluateShadowArms({
      v2pA: 0.33,
      v2pB: 0.67,
      fA: { FIGHTER: 'Bob', CREDIBILITY: 100 },
      fB: { FIGHTER: 'Alice', CREDIBILITY: 100 },
      snapshot: buildMarketSnapshot({
        oddsA: '+120',
        oddsB: '-130',
        capturedAt: '2026-09-01T12:00:00.000Z',
        fighterA: 'Bob',
        fighterB: 'Alice',
        fightId: 'rev',
      }),
    });
    expect(forward.arms.C6_CURRENT.pickFighter).toBe(reversed.arms.C6_CURRENT.pickFighter);
    expect(forward.arms.C6_CURRENT.pickProb).toBeCloseTo(reversed.arms.C6_CURRENT.pickProb, 12);
    expect(forward.arms.C6_CURRENT.baseFinalAction).toBe(reversed.arms.C6_CURRENT.baseFinalAction);
  });

  it('fails closed on an invalid snapshot: no arms, C6 unavailable with a reason', () => {
    const bad = snap('nonsense', '+120');
    const r = evaluateShadowArms({ v2pA: 0.6, v2pB: 0.4, ...fighters(), snapshot: bad });
    expect(r.available).toBe(false);
    expect(r.unavailableReason).toBe('ODDS_MISSING_OR_INVALID');
    expect(r.arms).toEqual({});
    expect(r.singleSnapshotConsistent).toBe(false);
  });

  it('missing v2 → V2_UNAVAILABLE, no gates and no arms (v2 gate needs v2pA)', () => {
    const s = snap('-130', '+120');
    const r = evaluateShadowArms({ v2pA: null, v2pB: null, ...fighters(), snapshot: s });
    expect(r.available).toBe(false);
    expect(r.unavailableReason).toBe('V2_UNAVAILABLE');
    expect(r.arms).toEqual({});
    expect(r.singleSnapshotConsistent).toBe(false);
  });

  it('crossCheckSnapshotIds rejects a mismatched/injected gate', () => {
    expect(crossCheckSnapshotIds([{ marketSnapshotId: 'X' }, { marketSnapshotId: 'X' }], 'X')).toBe(true);
    expect(crossCheckSnapshotIds([{ marketSnapshotId: 'X' }, { marketSnapshotId: 'Y' }], 'X')).toBe(false);
    expect(crossCheckSnapshotIds([{ marketSnapshotId: null }], null)).toBe(false);
  });
});
