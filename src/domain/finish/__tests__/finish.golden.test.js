import { describe, it, expect } from 'vitest';
import { computeFinishProbs, getProjectedFinishLabel } from '../index.js';
import { loadFixture } from '../../../__tests__/goldenSupport.js';

const { fighterFixtures, pairs } = loadFixture('fighters.golden.json');
const { entryGoldens } = loadFixture('entries.golden.json');

// CHARACTERISATION ONLY. The projected-finish formula is known to be broken --
// it triple-counts KOs, is opponent-blind, uses an underived x700 constant, and
// outputs ~60% KO against a ~32% base rate. BASELINE_NOTES records that fixing
// it requires the validation instrument and is a separate project.
//
// These tests exist so that the brokenness cannot change accidentally. They
// assert the CURRENT behaviour, not desired behaviour.

describe('computeFinishProbs — shape and invariants', () => {
  it('returns ko/sub/dec that sum to ~100 for every fixture pair', () => {
    let n = 0;
    for (const p of pairs) {
      const fA = fighterFixtures[p.a];
      const fB = fighterFixtures[p.b];
      if (!fA || !fB) continue;
      const r = computeFinishProbs(fA, fB);
      for (const k of ['ko', 'sub', 'dec']) {
        expect(typeof r[k], `${p.a} vs ${p.b}: ${k}`).toBe('number');
        expect(Number.isFinite(r[k])).toBe(true);
        expect(r[k]).toBeGreaterThanOrEqual(0);
      }
      expect(Math.abs(r.ko + r.sub + r.dec - 100)).toBeLessThanOrEqual(1);
      n++;
    }
    expect(n).toBe(37);
  });

  it('is deterministic for fixed inputs', () => {
    const p = pairs[0];
    const fA = fighterFixtures[p.a];
    const fB = fighterFixtures[p.b];
    expect(computeFinishProbs(fA, fB)).toEqual(computeFinishProbs(fA, fB));
  });
});

describe('getProjectedFinishLabel', () => {
  // The KO label is the string 'KO/TKO', not 'KO'. Verified against the source
  // rather than assumed -- the plan's shorthand would have been wrong.
  it('names the single leader', () => {
    expect(getProjectedFinishLabel({ ko: 50, sub: 30, dec: 20 })).toBe('KO/TKO');
    expect(getProjectedFinishLabel({ ko: 20, sub: 50, dec: 30 })).toBe('SUB');
    expect(getProjectedFinishLabel({ ko: 20, sub: 30, dec: 50 })).toBe('DEC');
  });

  it('joins co-leaders on an exact tie, in KO/SUB/DEC order', () => {
    expect(getProjectedFinishLabel({ ko: 40, sub: 40, dec: 20 })).toBe('KO/TKO / SUB');
    expect(getProjectedFinishLabel({ ko: 33, sub: 33, dec: 33 })).toBe('KO/TKO / SUB / DEC');
    expect(getProjectedFinishLabel({ ko: 20, sub: 40, dec: 40 })).toBe('SUB / DEC');
  });
});

describe('projected finish inside saved entries', () => {
  it('every captured entry carries a finish projection and a label', () => {
    for (const g of entryGoldens) {
      expect(typeof g.canonical.projectedKO).toBe('number');
      expect(typeof g.canonical.projectedSUB).toBe('number');
      expect(typeof g.canonical.projectedDEC).toBe('number');
      expect(typeof g.canonical.projectedFinish).toBe('string');
      expect(g.canonical.projectedFinish.length).toBeGreaterThan(0);
    }
  });

  it('the entry label agrees with the label function applied to its own probs', () => {
    for (const g of entryGoldens) {
      const c = g.canonical;
      expect(
        getProjectedFinishLabel({ ko: c.projectedKO, sub: c.projectedSUB, dec: c.projectedDEC }),
        `${g.pair} [${g.modelToggle}]`
      ).toBe(c.projectedFinish);
    }
  });
});
