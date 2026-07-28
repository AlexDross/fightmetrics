import { describe, it, expect } from 'vitest';
import { computeMatchupEdges } from '../index.js';
import { loadFixture, expectExact, expectWithinUlps, ulpDistance } from '../../../__tests__/goldenSupport.js';

// Frozen fixture inputs ONLY. Nothing here imports the live assembled FIGHTERS
// collection -- DAYS_SINCE_LAST is derived from Date.now() at module scope, so
// a test reading live fighters would drift every day at 12:00 UTC.
const { fighterFixtures, pairs, selection } = loadFixture('fighters.golden.json');
const { modelGoldens } = loadFixture('model.golden.json');

describe('model fixtures', () => {
  it('provides the frozen fighter inputs the goldens were captured from', () => {
    expect(Object.keys(fighterFixtures).length).toBe(38);
    expect(pairs.length).toBe(37);
  });

  it('covers the selection reasons Stage 0 targeted', () => {
    const reasons = new Set(
      selection.flatMap((s) => s.reasons.map((r) => r.split('_representative')[0]))
    );
    for (const r of [
      'low_sample_lt75min',
      'seed_elo_zero_ufc_fights',
      'prospect',
      'ranked_deep_sample',
      'p4p_ranked',
      'long_layoff_gt700d',
      'deepest_sample',
      'division',
    ]) expect(reasons.has(r), `missing coverage: ${r}`).toBe(true);
  });

  it('carries the -0 values that JSON alone would lose', () => {
    // 115 across the corpus, all in the five zeroed RED features.
    const negZeroFields = new Set();
    let count = 0;
    for (const g of modelGoldens) {
      const c = g.output?.v2Contributions;
      if (!c) continue;
      for (const [k, v] of Object.entries(c)) {
        if (Object.is(v, -0)) { count++; negZeroFields.add(k); }
      }
    }
    expect(count).toBe(115);
    expect([...negZeroFields].sort()).toEqual(
      ['ko_wins', 'losses', 'sub_wins', 'title_bouts', 'wins']
    );
  });
});

// CROSS-ENGINE REPRODUCTION -- measured, not assumed.
//
// The goldens were captured in CHROME. This suite replays them in NODE. Of
// 23,820 numeric leaves across the 74 goldens, all but a handful reproduce
// bit-exactly; 17 goldens differ, and only in these eight SOS-derived fields,
// by at most 8 ULP.
//
// Root cause: getOpponentTier's current-rankings fallback evaluates
//   Math.max(0.42, 0.93 * Math.exp(-0.037 * (r.rank - 1)))
// and Math.exp is NOT required by ECMAScript to be correctly rounded. V8's
// implementation differs between the Chrome build that captured the fixtures
// and the Node build that replays them, so certain fighters' SOS lands one bit
// apart. sosA/sosB then cascade: sosDiff subtracts two near-equal values
// (~0.79 each, difference ~0.10), amplifying 1 ULP into up to 8.
//
// Verified it is the ENGINE and not a code path: computeSOS called directly on
// the fixture history always equals the replayed value and never the captured
// one, and only for specific fighters.
//
// So every other field is asserted EXACTLY, and these eight are asserted within
// a measured ULP budget. Widening the whole comparison to a decimal tolerance
// would have thrown away the exactness that genuinely holds everywhere else.
// EXACT PATHS with per-path budgets, measured. Not leaf names -- matching on a
// leaf would silently tolerate any future nested property that happened to be
// called pA, and not a padded shared constant either. These ARE the observed
// maxima; anything larger should fail and be reviewed.
const ENGINE_SENSITIVE_PATHS = new Map([
  ['sosA', 1],
  ['sosB', 1],
  ['sosDiff', 8],
  ['sosContribution', 6],
  ['composite', 3],
  ['scaledComposite', 3],
  ['pA', 2],
  ['pB', 1],
]);

function compareGolden(actual, expected, label) {
  const walk = (a, e, p) => {
    if (typeof a === 'number' && typeof e === 'number' && !Object.is(a, e)) {
      if (ENGINE_SENSITIVE_PATHS.has(p)) {
        expectWithinUlps(a, e, `${label}: ${p}`, ENGINE_SENSITIVE_PATHS.get(p));
        return;
      }
    }
    if (a && e && typeof a === 'object' && typeof e === 'object') {
      for (const k of new Set([...Object.keys(a), ...Object.keys(e)])) {
        walk(a[k], e[k], p ? `${p}.${k}` : k);
      }
      return;
    }
    if (!Object.is(a, e)) {
      throw new Error(`${label}: ${p || '(root)'} — actual ${a}, expected ${e}`);
    }
  };
  walk(actual, expected, '');
}

// Each whitelisted path must still be REACHED and must still hit its budget --
// otherwise a stale entry could sit here forever granting silent tolerance.
function measurePathMaxima() {
  const max = new Map();
  const walk = (a, e, p) => {
    if (typeof a === 'number' && typeof e === 'number') {
      if (!Object.is(a, e)) {
        const d = ulpDistance(a, e);
        if (d !== Infinity && d > (max.get(p) ?? 0n)) max.set(p, d);
      }
      return;
    }
    if (a && e && typeof a === 'object' && typeof e === 'object') {
      for (const k of new Set([...Object.keys(a), ...Object.keys(e)])) {
        walk(a[k], e[k], p ? `${p}.${k}` : k);
      }
    }
  };
  for (const g of modelGoldens) {
    const fA = fighterFixtures[g.slotA];
    const fB = fighterFixtures[g.slotB];
    if (fA && fB) walk(computeMatchupEdges(fA, fB), g.output, '');
  }
  return max;
}

describe('computeMatchupEdges — golden replay', () => {
  it('reproduces all 74 captured outputs, both slot orders', () => {
    expect(modelGoldens.length).toBe(74);
    for (const g of modelGoldens) {
      expect(g.error, `${g.pair} ${g.order} captured an error`).toBeUndefined();
      const fA = fighterFixtures[g.slotA];
      const fB = fighterFixtures[g.slotB];
      expect(fA, `missing fixture ${g.slotA}`).toBeDefined();
      expect(fB, `missing fixture ${g.slotB}`).toBeDefined();
      compareGolden(computeMatchupEdges(fA, fB), g.output, `${g.pair} [${g.order}]`);
    }
  });

  it('reproduces the majority of goldens bit-exactly', () => {
    let exact = 0;
    for (const g of modelGoldens) {
      const fA = fighterFixtures[g.slotA];
      const fB = fighterFixtures[g.slotB];
      if (!fA || !fB) continue;
      try { expectExact(computeMatchupEdges(fA, fB), g.output, g.pair); exact++; } catch { /* engine-sensitive */ }
    }
    // Characterisation: 57 of 74 are bit-exact in Node. If this number moves,
    // either the model changed or the engine did -- both worth knowing.
    expect(exact).toBe(57);
  });

  it('is deterministic for a fixed input — same call twice, exactly equal', () => {
    const g = modelGoldens[0];
    const a = computeMatchupEdges(fighterFixtures[g.slotA], fighterFixtures[g.slotB]);
    const b = computeMatchupEdges(fighterFixtures[g.slotA], fighterFixtures[g.slotB]);
    expectExact(a, b, 'repeat call');
  });

  it('every whitelisted path is still reached and still hits its exact budget', () => {
    const measured = measurePathMaxima();
    // No stale entries: each whitelisted path must actually differ somewhere.
    for (const [p, budget] of ENGINE_SENSITIVE_PATHS) {
      expect(measured.has(p), `whitelisted path never differs: ${p} — remove it`).toBe(true);
      expect(measured.get(p), `${p} budget drifted`).toBe(BigInt(budget));
    }
    // And nothing outside the whitelist may differ at all.
    const unexpected = [...measured.keys()].filter((p) => !ENGINE_SENSITIVE_PATHS.has(p));
    expect(unexpected, `paths differ but are not whitelisted: ${unexpected.join(', ')}`).toEqual([]);
  });

  it('exercises both slot orders of every pair', () => {
    expect(modelGoldens.filter((g) => g.order === 'AB').length).toBe(37);
    expect(modelGoldens.filter((g) => g.order === 'BA').length).toBe(37);
  });
});
