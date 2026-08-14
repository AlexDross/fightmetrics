import { describe, it, expect } from 'vitest';
import { computeMatchupEdges, DIVISION_UFC_AVERAGES } from '../index.js';
import { buildRoiEntry } from '../../betting/index.js';
import boutContextFighters from '../../../__tests__/snapshots/boutContext.fighters.json';

// FROZEN fighter inputs, never the live assembled FIGHTERS collection.
// DAYS_SINCE_LAST is derived from Date.now() at module scope, so a test reading
// live fighters passes today and fails after the next 12:00 UTC rollover. The
// snapshot was captured from the roster at the PR base commit; see
// src/__tests__/isolation.test.js for the guard that enforces this.
const EVENT_DATE = '2026-08-15';
const get = (n) => {
  const f = boutContextFighters.fighters[n];
  if (!f) throw new Error(`snapshot fighter missing: ${n}`);
  return { ...f };
};

const run = (a, b, boutContext) =>
  computeMatchupEdges(a, b, { eventDate: EVENT_DATE, boutContext });

// ── The gate that decides whether division averages can matter at all ────────
// sampleBlend uses w = min(1, TOTAL_MIN / 75) and blends toward the division
// mean with weight (1 - w). At TOTAL_MIN >= 75 the division mean contributes
// exactly nothing, so a division change is provably a no-op for that fighter.
const SATURATION_MIN = 75;

describe('bout context — division normalisation', () => {
  it('is a byte-identical no-op when no context is supplied', () => {
    const a = get('Neil Magny');
    const b = get('Ramiz Brahimaj');
    const before = computeMatchupEdges(a, b, { eventDate: EVENT_DATE });
    const after = run(a, b, null);
    expect(after.pA).toBe(before.pA);
    expect(after.v2pA).toBe(before.v2pA);
    expect(after.feats).toEqual(before.feats);
    expect(after.featsV2).toEqual(before.featsV2);
  });

  it('ordinary same-division matchup is unaffected by stating its own division', () => {
    const a = get('Neil Magny');
    const b = get('Ramiz Brahimaj');
    expect(a.WEIGHT_CLASS).toBe('Welterweight');
    expect(b.WEIGHT_CLASS).toBe('Welterweight');
    const base = run(a, b, null);
    const stated = run(a, b, { division: 'Welterweight' });
    expect(stated.pA).toBe(base.pA);
    expect(stated.v2pA).toBe(base.v2pA);
  });

  // Luque--Gore is the only tracked matchup whose two roster classes disagree.
  // Injecting the verified middleweight division moves NOTHING, and the reason
  // is specific and worth pinning: both men are past the blend saturation
  // point, so the division mean carries zero weight for either of them.
  it('Luque vs Gore is probability-identical because both samples are saturated', () => {
    const luque = get('Vicente Luque');
    const gore = get('Tresean Gore');
    expect(luque.WEIGHT_CLASS).toBe('Welterweight');
    expect(gore.WEIGHT_CLASS).toBe('Middleweight');
    expect(luque.TOTAL_MIN).toBeGreaterThanOrEqual(SATURATION_MIN);
    expect(gore.TOTAL_MIN).toBeGreaterThanOrEqual(SATURATION_MIN);

    const base = run(luque, gore, null);
    const verified = run(luque, gore, { division: 'Middleweight' });
    expect(verified.pA).toBe(base.pA);
    expect(verified.v2pA).toBe(base.v2pA);
    expect(verified.feats).toEqual(base.feats);
  });

  // Gore sits at EXACTLY the saturation boundary. This is fragile enough to
  // deserve its own assertion: one fewer round in his history and the only
  // roster-divergent bout on the card would start moving.
  it('pins the TOTAL_MIN === 75 boundary case', () => {
    const gore = get('Tresean Gore');
    expect(gore.TOTAL_MIN).toBe(75);
    expect(Math.min(1, gore.TOTAL_MIN / 75)).toBe(1);
  });

  // The mechanism is NOT dead code. A fighter below saturation genuinely moves
  // when normalised against a different division.
  it('a low-sample fighter competing outside their roster division DOES move', () => {
    const donte = get('Donte Johnson');
    const mcconico = get('Eric McConico');
    expect(donte.TOTAL_MIN).toBeLessThan(SATURATION_MIN);

    const base = run(donte, mcconico, null);
    const moved = run(donte, mcconico, { division: 'Lightweight' });

    expect(moved.v2pA).not.toBe(base.v2pA);
    expect(moved.pA).not.toBe(base.pA);
    // Real, but bounded -- this is a normalisation nudge, not a rewrite.
    expect(Math.abs(moved.v2pA - base.v2pA)).toBeGreaterThan(1e-6);
    expect(Math.abs(moved.v2pA - base.v2pA)).toBeLessThan(0.05);
  });

  it('applies the verified division to BOTH corners, not just the divergent one', () => {
    const donte = get('Donte Johnson');
    const mcconico = get('Eric McConico');
    // Both are low sample, so if only one corner were re-keyed the results
    // would differ from re-keying both.
    expect(mcconico.TOTAL_MIN).toBeLessThan(SATURATION_MIN);

    const both = run(donte, mcconico, { division: 'Lightweight' });
    const onlyA = run(
      { ...donte, WEIGHT_CLASS: 'Lightweight' },
      mcconico,
      null
    );
    expect(both.v2pA).not.toBe(onlyA.v2pA);
  });

  it('catchweight falls back to roster normalisation instead of inventing an average', () => {
    const donte = get('Donte Johnson');
    const mcconico = get('Eric McConico');
    const base = run(donte, mcconico, null);
    const catchweight = run(donte, mcconico, { division: 'Catch Weight' });
    expect(catchweight.pA).toBe(base.pA);
    expect(catchweight.v2pA).toBe(base.v2pA);
    // Guard the premise: a 'Catch Weight' bucket really does exist, so this
    // test would fail loudly if the fallback were ever removed.
    expect(DIVISION_UFC_AVERAGES['Catch Weight']).toBeDefined();
  });

  it('preserves slot symmetry with and without bout context', () => {
    const pairs = [
      ['Vicente Luque', 'Tresean Gore', { division: 'Middleweight' }],
      ['Donte Johnson', 'Eric McConico', { division: 'Lightweight' }],
      ['Neil Magny', 'Ramiz Brahimaj', null],
      ['Islam Makhachev', 'Ian Machado Garry', { division: 'Welterweight', isTitleBout: true, scheduledRounds: 5 }],
    ];
    for (const [a, b, context] of pairs) {
      const fwd = run(get(a), get(b), context);
      const rev = run(get(b), get(a), context);
      expect(Math.abs(fwd.pA + rev.pA - 1), `${a} vs ${b} v1`).toBe(0);
      expect(Math.abs(fwd.v2pA + rev.v2pA - 1), `${a} vs ${b} v2`).toBe(0);
    }
  });
});

describe('bout context — title and rounds are inert in the model', () => {
  const a = () => get('Islam Makhachev');
  const b = () => get('Ian Machado Garry');

  it('scheduled title status does not move any probability', () => {
    const base = run(a(), b(), { division: 'Welterweight' });
    const titled = run(a(), b(), {
      division: 'Welterweight',
      isTitleBout: true,
      scheduledRounds: 5,
    });
    expect(titled.pA).toBe(base.pA);
    expect(titled.v2pA).toBe(base.v2pA);
  });

  // The critical separation. TITLE_BOUTS is a CAREER count of title fights
  // already contested. isTitleBout is scheduled context for THIS bout. Folding
  // the second into the first would corrupt a historical statistic and, being
  // one-sided, fabricate an asymmetric edge out of nothing.
  it('never mutates either fighter’s historical TITLE_BOUTS', () => {
    const fA = a();
    const fB = b();
    const beforeA = fA.TITLE_BOUTS;
    const beforeB = fB.TITLE_BOUTS;
    const beforeModelA = fA.MODEL_TITLE_BOUTS;

    const r = run(fA, fB, {
      division: 'Welterweight',
      isTitleBout: true,
      scheduledRounds: 5,
    });

    expect(fA.TITLE_BOUTS).toBe(beforeA);
    expect(fB.TITLE_BOUTS).toBe(beforeB);
    expect(fA.MODEL_TITLE_BOUTS).toBe(beforeModelA);
    // And the derived features still reflect CAREER totals only.
    expect(r.feats.total_title_bout_dif).toBe(
      (fA.MODEL_TITLE_BOUTS - fB.MODEL_TITLE_BOUTS) / 1.4
    );
    expect(r.featsV2.title_bouts).toBe(fA.MODEL_TITLE_BOUTS - fB.MODEL_TITLE_BOUTS);
  });

  it('scheduled rounds do not move any probability', () => {
    const base = run(a(), b(), { division: 'Welterweight' });
    for (const scheduledRounds of [3, 5]) {
      const r = run(a(), b(), { division: 'Welterweight', scheduledRounds });
      expect(r.pA).toBe(base.pA);
      expect(r.v2pA).toBe(base.v2pA);
    }
  });
});

describe('bout context — preview and saved entry agree', () => {
  it('buildRoiEntry reproduces the previewed probability under the same context', () => {
    const fA = get('Donte Johnson');
    const fB = get('Eric McConico');
    const boutContext = {
      division: 'Middleweight',
      isTitleBout: false,
      scheduledRounds: 3,
    };

    // What the Simulator renders.
    const preview = computeMatchupEdges(fA, fB, {
      eventDate: EVENT_DATE,
      boutContext,
    });
    // What the save button stores.
    const entry = buildRoiEntry({
      fA,
      fB,
      oddsA: '-225',
      oddsB: '+185',
      eventName: 'UFC 330',
      eventDate: EVENT_DATE,
      boutContext,
    });

    expect(entry.fighterAProb).toBe(preview.pA);
    expect(entry.v2pA).toBe(preview.v2pA);
    expect(entry.boutContext.division).toBe('Middleweight');
    expect(entry.boutContext.isTitleBout).toBe(false);
    expect(entry.boutContext.scheduledRounds).toBe(3);
  });

  it('a verified division wins the display string over roster concatenation', () => {
    const entry = buildRoiEntry({
      fA: get('Vicente Luque'),
      fB: get('Tresean Gore'),
      oddsA: '+130',
      oddsB: '-155',
      eventName: 'UFC 330',
      eventDate: EVENT_DATE,
      boutContext: { division: 'Middleweight', isTitleBout: false, scheduledRounds: 3 },
    });
    expect(entry.division).toBe('Middleweight');
  });

  it('without context the legacy roster-derived display string is preserved', () => {
    const entry = buildRoiEntry({
      fA: get('Vicente Luque'),
      fB: get('Tresean Gore'),
      oddsA: '+130',
      oddsB: '-155',
      eventName: 'UFC 330',
      eventDate: EVENT_DATE,
    });
    expect(entry.division).toBe('Welterweight / Middleweight');
    // Absent key is the single "legacy or unknown" signal.
    expect('boutContext' in entry).toBe(false);
  });

  it('carries bout context into provenance only when it exists', () => {
    const withCtx = buildRoiEntry({
      fA: get('Neil Magny'),
      fB: get('Ramiz Brahimaj'),
      oddsA: '+105',
      oddsB: '-125',
      eventName: 'UFC 330',
      eventDate: EVENT_DATE,
      boutContext: { division: 'Welterweight', isTitleBout: false, scheduledRounds: 3 },
    });
    const withoutCtx = buildRoiEntry({
      fA: get('Neil Magny'),
      fB: get('Ramiz Brahimaj'),
      oddsA: '+105',
      oddsB: '-125',
      eventName: 'UFC 330',
      eventDate: EVENT_DATE,
    });
    expect(withCtx._provenance.boutContext.division).toBe('Welterweight');
    expect('boutContext' in withoutCtx._provenance).toBe(false);
  });

  it('an unknown context is stored as unknown, not as non-title three rounds', () => {
    const entry = buildRoiEntry({
      fA: get('Neil Magny'),
      fB: get('Ramiz Brahimaj'),
      oddsA: '+105',
      oddsB: '-125',
      eventName: 'UFC 330',
      eventDate: EVENT_DATE,
      boutContext: { division: 'Welterweight' },
    });
    expect(entry.boutContext.division).toBe('Welterweight');
    expect(entry.boutContext.isTitleBout).toBeNull();
    expect(entry.boutContext.scheduledRounds).toBeNull();
  });
});

describe('bout context — invalid context cannot be persisted (fail closed)', () => {
  const base = () => ({
    fA: get('Islam Makhachev'),
    fB: get('Ian Machado Garry'),
    oddsA: '-350',
    oddsB: '+275',
    eventName: 'UFC 330',
    eventDate: EVENT_DATE,
  });

  // The blocker case: a championship bout is scheduled for five rounds. Storing
  // "title bout, three rounds" would persist a fact that cannot be true.
  it('refuses a title bout scheduled for three rounds', () => {
    expect(() =>
      buildRoiEntry({
        ...base(),
        boutContext: { division: 'Welterweight', isTitleBout: true, scheduledRounds: 3 },
      })
    ).toThrow(TypeError);

    expect(() =>
      buildRoiEntry({
        ...base(),
        boutContext: { division: 'Welterweight', isTitleBout: true, scheduledRounds: 3 },
      })
    ).toThrow(
      'buildRoiEntry: invalid boutContext — contradictory context: isTitleBout is true but scheduledRounds is 3'
    );
  });

  it('refuses malformed field types instead of normalising them away', () => {
    const cases = [
      { division: 'Welterweight', isTitleBout: 'yes' },
      { division: 'Welterweight', scheduledRounds: '5' },
      { division: 'Welterweight', scheduledRounds: 3.5 },
      { division: 'Welterweight', scheduledRounds: 0 },
      { division: 'Welterweight', scheduledRounds: -3 },
      { division: 17 },
      'not an object',
    ];
    for (const boutContext of cases) {
      expect(
        () => buildRoiEntry({ ...base(), boutContext }),
        `should reject ${JSON.stringify(boutContext)}`
      ).toThrow(TypeError);
    }
  });

  // Rejection must happen on the RAW value. normalizeBoutContext coerces
  // anything malformed to null, so validating after normalisation would
  // silently accept `isTitleBout: 'yes'` as "unknown" and persist a different
  // fact than the caller supplied.
  it('rejects rather than silently rewriting a malformed value to unknown', () => {
    let thrown = null;
    try {
      buildRoiEntry({ ...base(), boutContext: { isTitleBout: 'yes' } });
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(TypeError);
    expect(thrown.message).toMatch(/isTitleBout must be a boolean or null/);
  });

  it('applies the same guard when the context arrives via modelContext', () => {
    expect(() =>
      buildRoiEntry({
        ...base(),
        modelContext: {
          boutContext: { division: 'Welterweight', isTitleBout: true, scheduledRounds: 3 },
        },
      })
    ).toThrow(TypeError);
  });

  it('accepts absent and null context', () => {
    expect(() => buildRoiEntry({ ...base() })).not.toThrow();
    expect(() => buildRoiEntry({ ...base(), boutContext: null })).not.toThrow();
    expect(() => buildRoiEntry({ ...base(), boutContext: {} })).not.toThrow();
  });

  it('accepts a five-round NON-title bout', () => {
    const entry = buildRoiEntry({
      ...base(),
      boutContext: { division: 'Welterweight', isTitleBout: false, scheduledRounds: 5 },
    });
    expect(entry.boutContext.isTitleBout).toBe(false);
    expect(entry.boutContext.scheduledRounds).toBe(5);
  });

  it('accepts a title bout scheduled for five rounds', () => {
    const entry = buildRoiEntry({
      ...base(),
      boutContext: { division: 'Welterweight', isTitleBout: true, scheduledRounds: 5 },
    });
    expect(entry.boutContext.isTitleBout).toBe(true);
    expect(entry.boutContext.scheduledRounds).toBe(5);
  });

  // Warnings describe reality rather than contradiction, so they must not block.
  it('persists a warning-only context (catchweight) without throwing', () => {
    const entry = buildRoiEntry({
      ...base(),
      boutContext: { division: 'Catch Weight', isTitleBout: false, scheduledRounds: 3 },
    });
    expect(entry.boutContext.division).toBe('Catch Weight');
    // Non-canonical, so normalisation still falls back to roster divisions.
    expect(entry.division).toBe('Welterweight');
  });

  it('persists a warning-only context (unconventional round count)', () => {
    const entry = buildRoiEntry({
      ...base(),
      boutContext: { division: 'Welterweight', isTitleBout: false, scheduledRounds: 4 },
    });
    expect(entry.boutContext.scheduledRounds).toBe(4);
  });

  it('does not partially persist when it refuses', () => {
    // The throw happens before any model call or entry assembly, so there is no
    // half-built entry to leak.
    expect(() =>
      buildRoiEntry({
        ...base(),
        boutContext: { division: 'Welterweight', isTitleBout: true, scheduledRounds: 3 },
      })
    ).toThrow();
  });
});
