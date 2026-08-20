// UFC SACRAMENTO (2026-08-22) — official bout-context provenance.
//
// The ten committed UFC Sacramento entries carried a scheduled boutContext
// (division/isTitleBout/scheduledRounds) with `provenance: null` in both
// locations buildRoiEntry stamps it: the top-level `boutContext` and the
// capture-time copy at `_provenance.boutContext`. gradingHandoffIntegrity
// test #4 catches a null `boutContext.provenance` generically; this suite is
// the narrow, exact-value guard for the Sacramento repair specifically —
// it also covers `_provenance.boutContext.provenance`, which test #4 does
// not, and it checks for the EXACT verified citation rather than merely a
// truthy placeholder.
//
// Official source verified 2026-08-19:
//   https://www.ufc.com/event/ufc-fight-night-august-22-2026
// (UFC Fight Night: Hernandez vs Rodrigues, Sacramento, CA — confirms the
// event, date, and all ten committed matchups.)
import { describe, it, expect } from 'vitest';
import { UPCOMING_ENTRIES } from '../upcomingData.js';
import { LEGACY_FIELD_MAP } from '../data/migration/legacyFieldMap.mjs';

const OFFICIAL_PROVENANCE = Object.freeze({
  sourceUrl: 'https://www.ufc.com/event/ufc-fight-night-august-22-2026',
  retrievedAt: '2026-08-19',
  authority: 'official',
});

const SACRAMENTO = UPCOMING_ENTRIES.filter(
  (e) => e.eventName === 'UFC Sacramento' && e.eventDate === '2026-08-22'
);
const key = (e) => `${e.fighterA} vs ${e.fighterB}`;

describe('UFC Sacramento bout context provenance — official values', () => {
  it('is exactly the ten committed Sacramento entries', () => {
    expect(SACRAMENTO.length).toBe(10);
  });

  it('every entry has non-null boutContext.provenance', () => {
    SACRAMENTO.forEach((e) => {
      expect(e.boutContext, key(e)).toBeDefined();
      expect(e.boutContext.provenance, key(e)).not.toBeNull();
    });
  });

  it('every entry has non-null _provenance.boutContext.provenance', () => {
    SACRAMENTO.forEach((e) => {
      expect(e._provenance.boutContext, key(e)).toBeDefined();
      expect(e._provenance.boutContext.provenance, key(e)).not.toBeNull();
    });
  });

  it('top-level and capture-time provenance are deeply equal on every entry', () => {
    SACRAMENTO.forEach((e) => {
      expect(e._provenance.boutContext.provenance, key(e)).toEqual(e.boutContext.provenance);
    });
  });

  it('every provenance object holds exactly the verified official citation, not an arbitrary placeholder', () => {
    // Exact equality, not just truthy presence -- a placeholder object like
    // {sourceUrl:'x', retrievedAt:'y', authority:'z'} would satisfy the two
    // "non-null" checks above but fail this one.
    SACRAMENTO.forEach((e) => {
      expect(e.boutContext.provenance, `${key(e)} top-level`).toEqual(OFFICIAL_PROVENANCE);
      expect(e._provenance.boutContext.provenance, `${key(e)} capture-time`).toEqual(OFFICIAL_PROVENANCE);
    });
  });

  it('non-vacuous control: a null/placeholder provenance would fail the exact-value check', () => {
    const strippedClone = structuredClone(SACRAMENTO[0]);
    strippedClone.boutContext.provenance = null;
    expect(strippedClone.boutContext.provenance).not.toEqual(OFFICIAL_PROVENANCE);

    const placeholderClone = structuredClone(SACRAMENTO[0]);
    placeholderClone.boutContext.provenance = { sourceUrl: 'x', retrievedAt: 'y', authority: 'z' };
    expect(placeholderClone.boutContext.provenance).not.toEqual(OFFICIAL_PROVENANCE);
  });

  it('did not touch division, title status, or scheduled rounds', () => {
    SACRAMENTO.forEach((e) => {
      expect(e.boutContext.division, key(e)).toBe(e.division);
      expect(typeof e.boutContext.isTitleBout, key(e)).toBe('boolean');
      expect([3, 5], key(e)).toContain(e.boutContext.scheduledRounds);
    });
  });

  it('did not touch any prediction, odds, recommendation, or C6 field (all remain finite/well-formed)', () => {
    const PROB_FIELDS = ['fighterAProb', 'fighterBProb', 'predictedProb', 'trackedProb', 'v2pA', 'v2pB'];
    SACRAMENTO.forEach((e) => {
      PROB_FIELDS.forEach((f) => {
        expect(Number.isFinite(e[f]), `${key(e)}.${f}`).toBe(true);
        expect(e[f], `${key(e)}.${f}`).toBeGreaterThan(0);
        expect(e[f], `${key(e)}.${f}`).toBeLessThan(1);
      });
      expect(typeof e.trackedSide, key(e)).toBe('string');
      expect(['LEAN', 'BET', 'STRONG BET', 'NO BET'], key(e)).toContain(e.betAction);
      // These ten rows were RE-ENTERED with user-facing C6 active (the
      // provenance repair below only touches boutContext, never the decision
      // layer). So the decision source is 'c6' and the C6 fields must be
      // present and well-formed -- this guards that the repair did not corrupt
      // them, the same role the old "no C6 fields" assertion served before C6
      // drove these rows.
      expect(e.decisionProbabilitySource, key(e)).toBe('c6');
      expect(e.c6Version, key(e)).toBe('c6_sym_zerointercept_full_20260818');
      ['c6ProbA', 'c6ProbB'].forEach((f) => {
        expect(Number.isFinite(e[f]), `${key(e)}.${f}`).toBe(true);
        expect(e[f], `${key(e)}.${f}`).toBeGreaterThan(0);
        expect(e[f], `${key(e)}.${f}`).toBeLessThan(1);
      });
      expect(e.c6ProbA + e.c6ProbB, `${key(e)} c6 probs sum to 1`).toBeCloseTo(1, 9);
    });
  });

  it('all _provenance.boutContext paths are explicitly covered by the legacy field map', () => {
    const paths = [
      '_provenance.boutContext',
      '_provenance.boutContext.division',
      '_provenance.boutContext.isTitleBout',
      '_provenance.boutContext.scheduledRounds',
      '_provenance.boutContext.provenance',
      '_provenance.boutContext.provenance.sourceUrl',
      '_provenance.boutContext.provenance.retrievedAt',
      '_provenance.boutContext.provenance.authority',
    ];
    paths.forEach((p) => {
      expect(Object.prototype.hasOwnProperty.call(LEGACY_FIELD_MAP.roiEntry, p), p).toBe(true);
    });
  });
});
