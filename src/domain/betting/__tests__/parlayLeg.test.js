import { describe, it, expect } from 'vitest';
import { loadFixture, frozenEdges } from '../../../__tests__/goldenSupport.js';
import { resolveDecisionProbability } from '../decision.js';
import { buildParlayLeg } from '../parlayLeg.js';

const { fighterFixtures } = loadFixture('fighters.golden.json');
const names = Object.keys(fighterFixtures);
const fA = fighterFixtures[names[0]]; // " Jun Yong Park"
const fB = fighterFixtures[names[1]]; // "AJ Cunningham"

// Same real production flip scenario used elsewhere in this suite: at
// +150/-180, raw v1 and raw v2 both favour fighter A (Park, ~66.3% under v2)
// but C6 -- pulled toward the market -- flips the pick to fighter B
// (Cunningham, ~51.7%). This is exactly the case that exposed the bug:
// v2ProbAtBuild was derived from `overridden` (relative to the C6/promoted
// default), not from comparing pickedFighter against v2DefaultFighter, so an
// un-overridden C6 leg stored PARK's raw-v2 probability under CUNNINGHAM's
// pickedFighter.
const result = frozenEdges(fA, fB);
const decision = resolveDecisionProbability({
  modelToggle: 'v2',
  v1pA: result.pA,
  v1pB: result.pB,
  v2pA: result.v2pA,
  v2pB: result.v2pB,
  oddsA: '+150',
  oddsB: '-180',
  c6UserFacingEnabled: true,
});

describe('buildParlayLeg — C6 flip scenario (real production data)', () => {
  it('sanity: raw v2 favours fighter A (Park); C6 favours fighter B (Cunningham)', () => {
    expect(result.v2pA).toBeGreaterThan(0.5);
    expect(decision.source).toBe('c6');
    expect(decision.pA).toBeLessThan(0.5);
    expect(decision.pB).toBeGreaterThan(0.5);
  });

  const basePick = {
    fightId: 'flip-1',
    fighterA: fA.FIGHTER,
    fighterB: fB.FIGHTER,
    eventName: 'FLIP TEST EVENT',
    eventDate: '2026-09-01',
    v2DefaultFighter: fA.FIGHTER, // raw v2's own favourite: Park
    v2WinProb: result.v2pA,
    decisionProbabilitySource: decision.source, // 'c6'
    decisionProbabilityVersion: decision.c6Version,
    defaultFighter: fB.FIGHTER, // C6's/promoted default: Cunningham
    probabilityAtBuild: decision.pB, // C6's probability for Cunningham
  };

  it('Case 1 — accept the C6 default (Cunningham)', () => {
    const leg = buildParlayLeg({ ...basePick, pickedFighter: fB.FIGHTER, overridden: false });

    expect(leg.pickedFighter).toBe(fB.FIGHTER);
    expect(leg.defaultFighter).toBe(fB.FIGHTER);
    expect(leg.decisionProbabilitySource).toBe('c6');
    expect(leg.overridden).toBe(false);
    expect(leg.probabilityAtBuild).toBeCloseTo(decision.pB, 12);

    expect(leg.v2DefaultFighter).toBe(fA.FIGHTER);
    // v2ProbAtBuild must be raw v2's probability for the PICKED fighter
    // (Cunningham), i.e. 1 - v2's favourite (Park) probability.
    expect(leg.v2ProbAtBuild).toBeCloseTo(1 - result.v2pA, 12);
    // It must NOT be Park's raw-v2 favourite probability (the pre-fix bug).
    expect(leg.v2ProbAtBuild).not.toBeCloseTo(result.v2pA, 6);
  });

  it('Case 2 — user overrides back to the raw-v2 favourite (Park)', () => {
    const leg = buildParlayLeg({ ...basePick, pickedFighter: fA.FIGHTER, overridden: true });

    expect(leg.pickedFighter).toBe(fA.FIGHTER);
    expect(leg.defaultFighter).toBe(fB.FIGHTER); // still records C6's own default
    expect(leg.decisionProbabilitySource).toBe('c6');
    expect(leg.overridden).toBe(true);
    // probabilityAtBuild is C6's probability for the PICKED fighter (Park).
    expect(leg.probabilityAtBuild).toBeCloseTo(decision.pA, 12);
    expect(leg.probabilityAtBuild).toBeCloseTo(1 - decision.pB, 12);

    expect(leg.v2DefaultFighter).toBe(fA.FIGHTER);
    // Picked fighter equals v2's own favourite -- no inversion should occur.
    expect(leg.v2ProbAtBuild).toBeCloseTo(result.v2pA, 12);
  });

  it('probabilityAtBuild and v2ProbAtBuild both describe pickedFighter, under their own source', () => {
    const accepted = buildParlayLeg({ ...basePick, pickedFighter: fB.FIGHTER, overridden: false });
    const overridden = buildParlayLeg({ ...basePick, pickedFighter: fA.FIGHTER, overridden: true });
    // Complementary pairs within each field, each independently valid.
    expect(accepted.probabilityAtBuild + overridden.probabilityAtBuild).toBeCloseTo(1, 12);
    expect(accepted.v2ProbAtBuild + overridden.v2ProbAtBuild).toBeCloseTo(1, 12);
  });
});

describe('buildParlayLeg — non-C6 v2 entry (existing behaviour unchanged)', () => {
  const v2Pick = {
    fightId: 'v2-1',
    fighterA: 'Fighter X',
    fighterB: 'Fighter Y',
    eventName: 'V2 EVENT',
    eventDate: '2026-01-01',
    v2DefaultFighter: 'Fighter X',
    v2WinProb: 0.7,
    decisionProbabilitySource: 'v2',
    decisionProbabilityVersion: null,
    defaultFighter: 'Fighter X',
    probabilityAtBuild: 0.7,
  };

  it('accepting the v2 default: v2ProbAtBuild and probabilityAtBuild are identical, unchanged', () => {
    const leg = buildParlayLeg({ ...v2Pick, pickedFighter: 'Fighter X', overridden: false });
    expect(leg.v2ProbAtBuild).toBe(0.7);
    expect(leg.probabilityAtBuild).toBe(0.7);
    expect(leg.decisionProbabilitySource).toBe('v2');
    expect(leg.decisionProbabilityVersion).toBeNull();
  });

  it('overriding to the other fighter: both fields invert together (same source, same fighter)', () => {
    const leg = buildParlayLeg({ ...v2Pick, pickedFighter: 'Fighter Y', overridden: true });
    expect(leg.v2ProbAtBuild).toBeCloseTo(0.3, 12);
    expect(leg.probabilityAtBuild).toBeCloseTo(0.3, 12);
  });
});
