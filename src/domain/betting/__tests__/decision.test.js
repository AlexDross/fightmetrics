import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  resolveDecisionProbability,
  resolveFrozenDecisionView,
  resolveFrozenPerformanceView,
  DECISION_SOURCE_V1,
  DECISION_SOURCE_V2,
  DECISION_SOURCE_C6,
  DECISION_LABEL_V1,
  DECISION_LABEL_V2,
  DECISION_LABEL_C6,
} from '../decision.js';
import { computeC6ProbA, C6_VERSION } from '../../shadow/c6.js';
import { americanOdds } from '../marketCore.js';

afterEach(() => vi.unstubAllEnvs());

const V2_A = 0.62;
const V2_B = 1 - V2_A;
const V1_A = 0.55;
const V1_B = 1 - V1_A;

const baseArgs = (overrides = {}) => ({
  modelToggle: 'v2',
  v1pA: V1_A,
  v1pB: V1_B,
  v2pA: V2_A,
  v2pB: V2_B,
  oddsA: '-150',
  oddsB: '+130',
  ...overrides,
});

describe('resolveDecisionProbability — config gating', () => {
  it('flag OFF returns byte-equivalent v2 behaviour (v2 selected, valid odds)', () => {
    const r = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: false }));
    expect(r.source).toBe(DECISION_SOURCE_V2);
    expect(r.pA).toBe(V2_A);
    expect(r.pB).toBe(V2_B);
    expect(r.label).toBe(DECISION_LABEL_V2);
    expect(r.c6Requested).toBe(false);
    expect(r.c6Available).toBe(false);
    expect(r.c6ProbA).toBeNull();
    expect(r.c6ProbB).toBeNull();
    expect(r.bettingSuppressed).toBe(false);
  });

  it('reads the resolved env flag by default when c6UserFacingEnabled is not passed', () => {
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    const r = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: undefined }));
    expect(r.source).toBe(DECISION_SOURCE_C6);
  });

  it('explicit v1 selection bypasses C6 even when the flag is on', () => {
    const r = resolveDecisionProbability(baseArgs({ modelToggle: 'v1', c6UserFacingEnabled: true }));
    expect(r.source).toBe(DECISION_SOURCE_V1);
    expect(r.pA).toBe(V1_A);
    expect(r.pB).toBe(V1_B);
    expect(r.label).toBe(DECISION_LABEL_V1);
    expect(r.c6Requested).toBe(false);
  });
});

describe('resolveDecisionProbability — C6 activation', () => {
  it('flag ON + valid odds returns the exact frozen C6 reference value', () => {
    const r = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: true }));
    expect(r.source).toBe(DECISION_SOURCE_C6);
    expect(r.label).toBe(DECISION_LABEL_C6);
    expect(r.c6Version).toBe(C6_VERSION);

    const reference = computeC6ProbA({ noVigA: r.market.noVigA, v2pA: V2_A });
    expect(reference.available).toBe(true);
    expect(r.pA).toBe(reference.c6pA);
    expect(r.pB).toBe(reference.c6pB);
    expect(r.c6ProbA).toBe(reference.c6pA);
    expect(r.c6ProbB).toBe(reference.c6pB);
  });

  it('C6 pA + pB equals 1 within floating-point tolerance', () => {
    const r = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: true }));
    expect(r.pA + r.pB).toBeCloseTo(1, 15);
  });

  it('swapping fighters/odds complements the probability and preserves the selected fighter', () => {
    const r1 = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: true }));
    const r2 = resolveDecisionProbability(
      baseArgs({
        c6UserFacingEnabled: true,
        v1pA: V1_B,
        v1pB: V1_A,
        v2pA: V2_B,
        v2pB: V2_A,
        oddsA: '+130',
        oddsB: '-150',
      })
    );
    // Swapping both slots' inputs swaps the C6 result symmetrically (order-safe).
    expect(r2.pA).toBeCloseTo(r1.pB, 12);
    expect(r2.pB).toBeCloseTo(r1.pA, 12);
    // Each call still picks out fighter-A's own side consistently -- the
    // "favoured" side flips with the inputs, not silently pinned to A.
    expect(r1.pA > r1.pB).toBe(true);
    expect(r2.pA > r2.pB).toBe(false);
  });

  it('missing odds falls back to labelled v2 display, C6 not shown', () => {
    const r = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: true, oddsA: '', oddsB: '' }));
    expect(r.source).toBe(DECISION_SOURCE_V2);
    expect(r.label).toBe(DECISION_LABEL_V2);
    expect(r.pA).toBe(V2_A);
    expect(r.c6Requested).toBe(true);
    expect(r.c6Available).toBe(false);
    expect(r.unavailableReason).toBe('ODDS_MISSING_OR_INVALID');
    expect(r.market.valid).toBe(false);
  });

  it('invalid odds fails safely to v2, never throws', () => {
    expect(() =>
      resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: true, oddsA: 'garbage', oddsB: '+130' }))
    ).not.toThrow();
    const r = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: true, oddsA: 'garbage', oddsB: '+130' }));
    expect(r.source).toBe(DECISION_SOURCE_V2);
    expect(r.market.valid).toBe(false);
  });

  it('non-finite v2 probability input fails safely (falls back to v1, flags C6 unavailable)', () => {
    const r = resolveDecisionProbability(
      baseArgs({ c6UserFacingEnabled: true, v2pA: NaN, v2pB: NaN })
    );
    expect(r.source).toBe(DECISION_SOURCE_V1);
    expect(r.c6Requested).toBe(true);
    expect(r.unavailableReason).toBe('V2_UNAVAILABLE');
  });

  it('out-of-range v2 probability with valid odds suppresses betting rather than silently using v2', () => {
    const r = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: true, v2pA: 1, v2pB: 0 }));
    expect(r.source).toBe(DECISION_SOURCE_V2); // display falls back to v2...
    expect(r.pA).toBe(1);
    expect(r.bettingSuppressed).toBe(true); // ...but betting is not silently run on it
    expect(r.bettingSuppressedReason).toBeTruthy();
    expect(r.market.valid).toBe(false); // gate sees an invalidated snapshot -> no bet
  });

  it('shares one market snapshot for both C6 and the gate (no second odds parse)', () => {
    const r = resolveDecisionProbability(baseArgs({ c6UserFacingEnabled: true }));
    expect(r.market.valid).toBe(true);
    expect(r.market.noVigA + r.market.noVigB).toBeCloseTo(1, 12);
  });
});

// resolveFrozenDecisionView reconstructs the frozen decision view (winner /
// probability / fair line) for an ALREADY-SAVED entry, from its own frozen
// fields -- the single place ROI, Upcoming, and the parlay builder must all
// read from so none of them can independently reintroduce a v1/raw-v2
// display bug under a C6 badge.
describe('resolveFrozenDecisionView', () => {
  const baseEntry = (overrides = {}) => ({
    fighterA: 'Fighter A',
    fighterB: 'Fighter B',
    predictedWinner: 'Fighter A', // v1's own pick -- must never leak into the view
    predictedProb: 0.55,
    v2pA: 0.58,
    v2pB: 0.42, // raw v2's own pick (A) -- must never leak into the view either
    decisionProbabilitySource: 'c6',
    trackedSide: 'Fighter B', // C6 flipped the pick to B
    trackedProb: 0.53,
    c6Version: 'c6_sym_zerointercept_full_20260818',
    ...overrides,
  });

  it('returns the frozen C6 winner/probability/fair line, never v1 or raw v2', () => {
    const entry = baseEntry();
    const view = resolveFrozenDecisionView(entry);
    expect(view).not.toBeNull();
    expect(view.source).toBe(DECISION_SOURCE_C6);
    expect(view.version).toBe(entry.c6Version);
    expect(view.winner).toBe('Fighter B');
    expect(view.winner).not.toBe(entry.predictedWinner); // not v1's fighter
    expect(view.winner).not.toBe('Fighter A'); // not raw v2's own argmax fighter
    expect(view.probability).toBe(0.53);
    expect(view.probability).not.toBe(entry.predictedProb);
    expect(view.fairLine).toBe(americanOdds(0.53));
    expect(view.side).toBe('B');
  });

  it('returns null for an ordinary v2 entry (flag off or C6 not requested)', () => {
    const entry = baseEntry({ decisionProbabilitySource: 'v2' });
    expect(resolveFrozenDecisionView(entry)).toBeNull();
  });

  it('returns null for an explicit v1 entry', () => {
    const entry = baseEntry({ decisionProbabilitySource: 'v1', trackedSide: 'Fighter A', trackedProb: 0.55 });
    expect(resolveFrozenDecisionView(entry)).toBeNull();
  });

  it('returns null for a historical entry with no decisionProbabilitySource at all', () => {
    const entry = baseEntry();
    delete entry.decisionProbabilitySource;
    expect(resolveFrozenDecisionView(entry)).toBeNull();
  });

  it('fails safe (null) rather than throwing on a malformed C6-labelled entry', () => {
    expect(resolveFrozenDecisionView(null)).toBeNull();
    expect(resolveFrozenDecisionView(undefined)).toBeNull();
    expect(resolveFrozenDecisionView(baseEntry({ trackedSide: null }))).toBeNull();
    expect(resolveFrozenDecisionView(baseEntry({ trackedProb: null }))).toBeNull();
  });

  it('resolves the correct side when C6 favours fighter A instead', () => {
    const entry = baseEntry({ trackedSide: 'Fighter A', trackedProb: 0.61 });
    const view = resolveFrozenDecisionView(entry);
    expect(view.winner).toBe('Fighter A');
    expect(view.side).toBe('A');
    expect(view.probability).toBe(0.61);
  });
});

// resolveFrozenPerformanceView is the single authoritative "which frozen
// prediction do OFFICIAL performance metrics grade, at what price" resolver.
// It must grade the C6 tracked decision for a C6 entry (never raw v2), grade
// raw-v2 argmax for a non-C6 entry, fail safe on a malformed C6 record, and
// never recompute from live data. It is pure/frozen.
describe('resolveFrozenPerformanceView', () => {
  const c6Entry = (overrides = {}) => ({
    fighterA: 'Aoriqileng',
    fighterB: 'Kai Asakura',
    decisionProbabilitySource: 'c6',
    trackedSide: 'Kai Asakura', // C6's user-facing decision
    trackedProb: 0.7432072258238467,
    c6Version: 'c6_sym_zerointercept_full_20260818',
    // raw v2 favours the OTHER fighter (Aoriqileng) -- internal benchmark only
    v2pA: 0.5638694679787072,
    v2pB: 0.4361305320212928,
    oddsA: '+350',
    oddsB: '-450',
    marketOdds: '-450',
    unitsWagered: 1,
    actualWinner: 'Kai Asakura',
    ...overrides,
  });

  it('grades the C6 tracked decision, never the raw-v2 argmax, for a C6 entry', () => {
    const view = resolveFrozenPerformanceView(c6Entry());
    expect(view.source).toBe(DECISION_SOURCE_C6);
    expect(view.malformed).toBe(false);
    expect(view.pickedFighter).toBe('Kai Asakura'); // C6's side
    expect(view.pickedFighter).not.toBe('Aoriqileng'); // NOT raw v2's argmax
    expect(view.probability).toBe(0.7432072258238467);
    expect(view.odds).toBe('-450'); // captured tracked odds (marketOdds)
    expect(view.decisive).toBe(true);
    expect(view.push).toBe(false);
    expect(view.stake).toBe(1);
  });

  it('does NOT mutate the raw v2pA/v2pB benchmark fields', () => {
    const entry = c6Entry();
    const before = { v2pA: entry.v2pA, v2pB: entry.v2pB };
    resolveFrozenPerformanceView(entry);
    expect(entry.v2pA).toBe(before.v2pA);
    expect(entry.v2pB).toBe(before.v2pB);
  });

  it('grades the frozen raw-v2 argmax (existing behavior) for a non-C6 entry', () => {
    const entry = c6Entry({ decisionProbabilitySource: 'v2' });
    const view = resolveFrozenPerformanceView(entry);
    expect(view.source).toBe(DECISION_SOURCE_V2);
    expect(view.pickedFighter).toBe('Aoriqileng'); // v2pA >= v2pB -> fighterA
    expect(view.odds).toBe('+350'); // fighterA's own captured odds
    expect(view.probability).toBe(entry.v2pA);
  });

  it('grades raw v2 for a historical entry with no decisionProbabilitySource', () => {
    const entry = c6Entry();
    delete entry.decisionProbabilitySource;
    const view = resolveFrozenPerformanceView(entry);
    expect(view.source).toBe(DECISION_SOURCE_V2);
    expect(view.pickedFighter).toBe('Aoriqileng');
  });

  it('returns null (not gradeable) for a non-C6 entry missing frozen v2 fields', () => {
    expect(resolveFrozenPerformanceView(c6Entry({ decisionProbabilitySource: 'v2', v2pA: null, v2pB: null }))).toBeNull();
  });

  it('fails safe & explicit on a malformed C6 record — never silently grades raw v2, never recomputes', () => {
    // Labelled c6 but the authoritative decision fields are missing/broken. The
    // record still carries v2pA/v2pB (raw-v2 argmax would be Aoriqileng), so
    // this proves NONE of the raw-v2 values leak: no winner, probability, or odds.
    const missingSide = resolveFrozenPerformanceView(c6Entry({ trackedSide: null }));
    expect(missingSide.source).toBe(DECISION_SOURCE_C6);
    expect(missingSide.malformed).toBe(true);
    expect(missingSide.pickedFighter).toBeNull(); // NOT regraded onto raw v2's Aoriqileng
    expect(missingSide.probability).toBeNull(); // no raw-v2 probability leak
    expect(missingSide.odds).toBeNull(); // no raw-v2 odds leak

    const missingProb = resolveFrozenPerformanceView(c6Entry({ trackedProb: null }));
    expect(missingProb.malformed).toBe(true);
    expect(missingProb.pickedFighter).toBeNull();
    expect(missingProb.probability).toBeNull();
    expect(missingProb.odds).toBeNull();

    // trackedSide that matches neither fighter -> unresolvable side, malformed.
    const badSide = resolveFrozenPerformanceView(c6Entry({ trackedSide: 'Someone Else' }));
    expect(badSide.malformed).toBe(true);
    expect(badSide.pickedFighter).toBeNull();
    expect(badSide.probability).toBeNull();
    expect(badSide.odds).toBeNull();
  });

  it('marks pushes/NCs as resolved-but-not-decisive', () => {
    const nc = resolveFrozenPerformanceView(c6Entry({ actualWinner: 'NC' }));
    expect(nc.push).toBe(true);
    expect(nc.decisive).toBe(false);
    const draw = resolveFrozenPerformanceView(c6Entry({ actualWinner: 'DRAW' }));
    expect(draw.push).toBe(true);
    expect(draw.decisive).toBe(false);
  });

  it('carries the entry stake (unitsWagered), defaulting to 1', () => {
    expect(resolveFrozenPerformanceView(c6Entry({ unitsWagered: 2.5 })).stake).toBe(2.5);
    const noStake = c6Entry();
    delete noStake.unitsWagered;
    expect(resolveFrozenPerformanceView(noStake).stake).toBe(1);
  });

  it('C6 uses the captured marketOdds even when it differs from side oddsA/oddsB', () => {
    // One authoritative odds rule for C6: the captured marketOdds -- NOT the
    // tracked side's own oddsA/oddsB. Force them apart so any future drift back
    // to side-odds selection would fail here (and re-open a card/headline gap).
    const drift = resolveFrozenPerformanceView(
      c6Entry({
        trackedSide: 'Kai Asakura', // fighterB
        oddsB: '-450', // side-specific price for the tracked fighter
        marketOdds: '-410', // captured tracked price actually used -- differs
      })
    );
    expect(drift.pickedFighter).toBe('Kai Asakura');
    expect(drift.odds).toBe('-410'); // marketOdds, not oddsB
    expect(drift.odds).not.toBe('-450');
  });
});
