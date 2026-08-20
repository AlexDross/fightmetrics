import { describe, it, expect, afterEach, vi } from 'vitest';
import { loadFixture, frozenRoiEntry } from '../../../__tests__/goldenSupport.js';
import { createGradedEntry, addPendingEntry } from '../../workflow/index.js';
import { resolveFrozenDecisionView } from '../../betting/decision.js';
import { americanOdds } from '../../betting/marketCore.js';

const { fighterFixtures } = loadFixture('fighters.golden.json');
const names = Object.keys(fighterFixtures);
const fA = fighterFixtures[names[0]];
const fB = fighterFixtures[names[1]];

const ARGS = {
  fA,
  fB,
  oddsA: '-150',
  oddsB: '+130',
  eventName: 'SHADOW TEST EVENT',
  eventDate: '2026-09-01',
  modelToggle: 'v2',
  unitsWagered: 1,
};

// This exact pair/odds combination is a REAL production case (not a hand-
// built fixture) where v1 and raw v2 both favour fighter A but C6 -- pulled
// toward the market -- flips the pick to fighter B. It exercises the ROI/
// Upcoming/parlay "frozen decision view" correction: a naive display that
// fell back to v1's or raw v2's own pick would show fighter A under a C6
// badge, which is exactly the bug this regression guards against.
const FLIP_ARGS = {
  fA,
  fB,
  oddsA: '+150',
  oddsB: '-180',
  eventName: 'FLIP TEST EVENT',
  eventDate: '2026-09-01',
  modelToggle: 'v2',
  unitsWagered: 1,
};

// strip volatile + shadow fields so two builds are comparable
const VOLATILE = ['id', 'createdAt'];
const stripForCompare = (e) => {
  const c = structuredClone(e);
  for (const k of VOLATILE) delete c[k];
  delete c._c6Shadow;
  if (c._provenance) {
    delete c._provenance.predictionTimestamp;
    delete c._provenance.captureMode;
  }
  return c;
};

afterEach(() => vi.unstubAllEnvs());

describe('buildRoiEntry + shadow capture flag', () => {
  it('flag OFF (default): no _c6Shadow field is added; entry shape unchanged', () => {
    const e = frozenRoiEntry(ARGS);
    expect(Object.prototype.hasOwnProperty.call(e, '_c6Shadow')).toBe(false);
    // the normal v2 fields are all present
    expect(e).toHaveProperty('v2pA');
    expect(e).toHaveProperty('betAction');
    expect(e).toHaveProperty('trackedSide');
  });

  it('flag ON: records _c6Shadow with all arms and does NOT change any v2/current field', () => {
    const off = frozenRoiEntry(ARGS);
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    const on = frozenRoiEntry(ARGS);

    // shadow present with the four arms
    expect(on._c6Shadow).toBeDefined();
    expect(on._c6Shadow.captureMode).toBe('live-shadow');
    expect(Object.keys(on._c6Shadow.arms).sort()).toEqual([
      'C6_AGREEMENT',
      'C6_CURRENT',
      'V2_AGREEMENT',
      'V2_CURRENT',
    ]);

    // EVERYTHING else (all user-facing / current v2 fields) is byte-identical
    expect(stripForCompare(on)).toEqual(stripForCompare(off));
    // capturedAt equals the entry's own createdAt (one shared instant)
    expect(on._c6Shadow.capturedAt).toBe(on.createdAt);
  });

  it('user-facing flag ON promotes C6 to the tracked decision, matching the shadow record', () => {
    const off = frozenRoiEntry(ARGS);
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    const on = frozenRoiEntry(ARGS);

    // Raw v1/v2 probabilities never change -- only which one drives the
    // tracked/decision fields does.
    for (const f of ['fighterAProb', 'fighterBProb', 'predictedWinner', 'predictedProb', 'v2pA', 'v2pB']) {
      expect(on[f]).toEqual(off[f]);
    }

    expect(on.decisionProbabilitySource).toBe('c6');
    expect(off.decisionProbabilitySource).toBe('v2');
    expect(on.c6Version).toBeTruthy();
    expect(on.c6ProbA + on.c6ProbB).toBeCloseTo(1, 12);
    expect(on.trackedProb).toBe(Math.max(on.c6ProbA, on.c6ProbB));
    expect(on._provenance.decisionProbabilitySource).toBe('c6');
    expect(on._provenance.c6.pA).toBe(on.c6ProbA);

    expect(on._c6Shadow.featureFlags.userFacingActive).toBe(true);
    // The independently-evaluated shadow C6 arm agrees with the user-facing
    // one because both consume the same v2pA/noVigA inputs.
    expect(on.c6ProbA).toBeCloseTo(on._c6Shadow.c6.pA, 12);
  });

  it('shadow capture ON alone (user-facing OFF) leaves the tracked decision on v2', () => {
    const off = frozenRoiEntry(ARGS);
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    const on = frozenRoiEntry(ARGS);
    for (const f of ['trackedSide', 'trackedProb', 'betAction', 'bestBet', 'predictedWinner', 'v2pA', 'v2pB']) {
      expect(on[f]).toEqual(off[f]);
    }
    expect(on.decisionProbabilitySource).toBe('v2');
    // Ordinary v2 (no C6 request): C6-specific fields are OMITTED entirely,
    // not present-as-null -- see the schema comment on buildRoiEntry.
    expect(Object.prototype.hasOwnProperty.call(on, 'c6ProbA')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(on, 'c6ProbB')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(on, 'c6Version')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(on, 'decisionUnavailableReason')).toBe(false);
    expect(on._provenance.c6).toBeUndefined();
    expect(on._c6Shadow.featureFlags.userFacingActive).toBe(false);
  });

  it('lifecycle: save -> pending -> grade preserves the frozen shadow record byte-for-byte', () => {
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    const saved = frozenRoiEntry(ARGS);
    const shadowBefore = structuredClone(saved._c6Shadow);

    // add to pending (upcoming)
    const pending = addPendingEntry([], saved);
    expect(pending[0]._c6Shadow).toEqual(shadowBefore);

    // export round-trip (JSON.stringify used by the code-export path)
    const exported = JSON.parse(JSON.stringify(pending[0]));
    expect(exported._c6Shadow).toEqual(shadowBefore);

    // grade: only actualWinner is added; the frozen shadow record is untouched
    const graded = createGradedEntry(exported, saved.fighterA);
    expect(graded.actualWinner).toBe(saved.fighterA);
    expect(graded._c6Shadow).toEqual(shadowBefore);
    // grading did not alter frozen probabilities/coefficients/actions
    expect(graded._c6Shadow.c6.pA).toBe(shadowBefore.c6.pA);
    expect(graded._c6Shadow.arms).toEqual(shadowBefore.arms);
  });

  it('is deterministic: two ON builds have identical shadow content (modulo the shared id/timestamp)', () => {
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    const a = frozenRoiEntry(ARGS);
    const b = frozenRoiEntry(ARGS);
    const norm = (s) => {
      const c = structuredClone(s);
      // everything below depends on the volatile entry id + save clock
      c.capturedAt = '<T>';
      c.createdAt = '<T>';
      c.fightId = '<ID>';
      c.market.snapshotId = '<SNAP>';
      c.market.capturedAt = '<T>';
      for (const k of Object.keys(c.arms)) c.arms[k].marketSnapshotId = '<SNAP>';
      return c;
    };
    expect(norm(a._c6Shadow)).toEqual(norm(b._c6Shadow));
  });
});

describe('C6 flips the pick relative to v1 and raw v2 (real production case)', () => {
  it('confirms the flip actually happens for this fixture pair/odds combination', () => {
    const off = frozenRoiEntry(FLIP_ARGS);
    // Sanity: with the flag off, both v1 and raw v2 favour fighter A.
    expect(off.predictedWinner).toBe(off.fighterA);
    expect(off.v2pA).toBeGreaterThan(0.5);
  });

  it('a C6-driven entry\'s trackedSide/trackedProb are the flipped C6 decision, not v1 or raw v2', () => {
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    const entry = frozenRoiEntry(FLIP_ARGS);

    expect(entry.decisionProbabilitySource).toBe('c6');
    // v1's own pick (preserved unchanged) and raw v2's own pick (preserved
    // unchanged) both still favour fighter A...
    expect(entry.predictedWinner).toBe(entry.fighterA);
    expect(entry.v2pA).toBeGreaterThan(0.5);
    // ...but the actual tracked/decision fields flipped to fighter B.
    expect(entry.trackedSide).toBe(entry.fighterB);
    // trackedProb is the WINNING side's own probability (>= 0.5 by
    // construction), so it doesn't read as "flipped" on its own -- what
    // proves the flip is that it's fighter B's C6 probability, a different
    // number from fighter A's raw v2 probability.
    expect(entry.trackedProb).toBeGreaterThanOrEqual(0.5);
    expect(entry.trackedProb).not.toBeCloseTo(entry.v2pA, 6);
    expect(entry.trackedProb).toBeCloseTo(1 - entry.c6ProbA, 12);
    expect(entry.betRecommendedFighter === '' || entry.betRecommendedFighter === entry.fighterB).toBe(true);
  });

  it('ROI/Upcoming/parlay frozen-decision view: uses the flipped C6 fighter, never v1/raw-v2\'s fighter A', () => {
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    const entry = frozenRoiEntry(FLIP_ARGS);

    const view = resolveFrozenDecisionView(entry);
    expect(view).not.toBeNull();

    // This IS the exact ROI-card fix: displayed winner/probability/fair line
    // must be the frozen C6 decision, not entry.predictedWinner/predictedProb
    // (the v1 snapshot) and not fighter A (raw v2's/v1's own favourite).
    expect(view.winner).toBe(entry.trackedSide);
    expect(view.winner).toBe(entry.fighterB);
    expect(view.winner).not.toBe(entry.predictedWinner);
    expect(view.winner).not.toBe(entry.fighterA);
    expect(view.probability).toBe(entry.trackedProb);
    expect(view.probability).not.toBe(entry.predictedProb);
    expect(view.fairLine).toBe(americanOdds(entry.trackedProb));

    // Grading/profit must key off the SAME flipped side -- exercised directly
    // since App.js's effectiveTrackedSide reads entry.trackedSide once v2Data
    // is withheld for a C6 entry (see UpcomingEventTab/ROITab).
    expect(entry.trackedSide).toBe(view.winner);

    // This is also exactly what the parlay builder's leg default must use:
    // defaultFighter = view.winner (C6), never mp.v2Winner (raw v2's own
    // argmax pick, which is fighter A here -- the wrong default this
    // correction pass exists to prevent).
    const parlayDefaultFighter = view ? view.winner : entry.fighterA /* raw v2 fallback, not exercised here */;
    expect(parlayDefaultFighter).toBe(entry.fighterB);
    expect(parlayDefaultFighter).not.toBe(entry.fighterA);
  });

  it('flag OFF: the same fixture pair/odds never produces a frozen decision view (no C6 badge, no flip)', () => {
    const entry = frozenRoiEntry(FLIP_ARGS);
    expect(entry.decisionProbabilitySource).toBe('v2');
    expect(resolveFrozenDecisionView(entry)).toBeNull();
  });
});
