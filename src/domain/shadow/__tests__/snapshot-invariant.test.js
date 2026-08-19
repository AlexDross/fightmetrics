import { describe, it, expect } from 'vitest';
import { evaluateShadowArms } from '../policies.js';
import { buildMarketSnapshot } from '../snapshot.js';
import { buildMarketInput, evaluateGateOnSnapshot } from '../../betting/marketCore.js';

// Structural single-snapshot invariant:
//   * odds are parsed once (into the snapshot),
//   * both gates run on that ONE snapshot object,
//   * evaluateShadowArms takes NO raw odds, so a second/injected odds source
//     cannot silently drive a recommendation.

const fighters = { fA: { FIGHTER: 'Alice', CREDIBILITY: 100 }, fB: { FIGHTER: 'Bob', CREDIBILITY: 100 } };
const mkSnap = (oddsA, oddsB, fightId = 'fid') =>
  buildMarketSnapshot({
    oddsA,
    oddsB,
    capturedAt: '2026-09-01T12:00:00.000Z',
    fighterA: 'Alice',
    fighterB: 'Bob',
    fightId,
  });

describe('single-snapshot structural invariant', () => {
  it('gates run from the snapshot only — stray injected odds are ignored', () => {
    // The snapshot is built from -130/+120. A caller that also passes a WILDLY
    // different odds pair must NOT be able to move the gate: under the corrected
    // API evaluateShadowArms consumes only the snapshot. (Under the previous
    // implementation the stray oddsA/oddsB were re-parsed and drove the gate, so
    // this assertion would fail — it is the regression guard.)
    const snapshot = mkSnap('-130', '+120');
    const r = evaluateShadowArms({
      v2pA: 0.67,
      v2pB: 0.33,
      ...fighters,
      snapshot,
      // stray, contradictory odds — must be ignored entirely
      oddsA: '+5000',
      oddsB: '-100000',
    });
    expect(r.available).toBe(true);
    // the gate's market matches the FROZEN snapshot, not the stray odds
    expect(r.v2Gate.noVigA).toBe(snapshot.noVigA);
    expect(r.c6Gate.noVigA).toBe(snapshot.noVigA);
    for (const k of Object.keys(r.arms)) {
      expect(r.arms[k].marketSnapshotId).toBe(snapshot.snapshotId);
    }
  });

  it('a valid record needs exactly ONE parsed market input feeding both gates', () => {
    // Prove both gates read the identical parsed values by object-value identity.
    const snapshot = mkSnap('-200', '+170');
    const r = evaluateShadowArms({ v2pA: 0.72, v2pB: 0.28, ...fighters, snapshot });
    expect(r.v2Gate.rawA).toBe(snapshot.rawImpliedA);
    expect(r.c6Gate.rawA).toBe(snapshot.rawImpliedA);
    expect(r.v2Gate.noVigB).toBe(snapshot.noVigB);
    expect(r.c6Gate.noVigB).toBe(snapshot.noVigB);
  });

  it('the compatibility wrapper path (buildMarketInput + gate) equals direct gate use', () => {
    // computeMarketAnalysis == evaluateGateOnSnapshot(result, buildMarketInput(...)).
    const result = { pA: 0.66, pB: 0.34, edges: Object.fromEntries(
      ['striking','grappling','physical','form','experience','analytics'].map((k)=>[k,{clamped:0}])) };
    const mi = buildMarketInput({ oddsA: '-150', oddsB: '+130' });
    const gate = evaluateGateOnSnapshot(result, mi, fighters.fA, fighters.fB);
    expect(gate).not.toBeNull();
    expect(gate.marketSnapshotId).toBeNull(); // live wrapper carries no snapshot id
    expect(gate.noVigA).toBeCloseTo(mi.noVigA, 15);
  });

  it('an invalid market input makes the gate return null (fail closed)', () => {
    const result = { pA: 0.66, pB: 0.34, edges: {} };
    const mi = buildMarketInput({ oddsA: 'nope', oddsB: '+130' });
    expect(mi.valid).toBe(false);
    expect(evaluateGateOnSnapshot(result, mi, fighters.fA, fighters.fB)).toBeNull();
  });
});
