import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_DIVISIONS,
  isSupportedDivision,
  validateBoutContext,
  normalizeBoutContext,
  resolveNormalizationDivisions,
  isCompetingOutsideRosterDivision,
  fightersOutsideRosterDivision,
  describeTitleStatus,
  describeScheduledRounds,
  describeBoutContextSuffix,
  missingBoutContextFields,
  hasUnknownBoutContext,
} from '../index.js';

const ctx = (over = {}) => ({
  division: null,
  isTitleBout: null,
  scheduledRounds: null,
  ...over,
});

describe('supported divisions', () => {
  it('lists the twelve canonical UFC divisions', () => {
    expect(SUPPORTED_DIVISIONS.length).toBe(12);
    expect(isSupportedDivision('Middleweight')).toBe(true);
    expect(isSupportedDivision("Women's Strawweight")).toBe(true);
  });

  // Catchweight is the ABSENCE of a division. fightersData.js carries a
  // 'Catch Weight' roster value, so DIVISION_UFC_AVERAGES has a bucket for it --
  // an average over an arbitrary mixture of body types. Treating it as
  // supported would silently normalise a bout against that meaningless number.
  it('excludes catchweight so it can never select an invented average', () => {
    expect(isSupportedDivision('Catch Weight')).toBe(false);
    expect(isSupportedDivision('Catchweight (130 lb)')).toBe(false);
    expect(SUPPORTED_DIVISIONS).not.toContain('Catch Weight');
  });

  it('rejects non-strings and unknown labels', () => {
    [null, undefined, 42, {}, [], '', 'Cruiserweight'].forEach((v) =>
      expect(isSupportedDivision(v)).toBe(false)
    );
  });
});

describe('validateBoutContext', () => {
  it('treats absent context as valid and unknown', () => {
    const r = validateBoutContext(null);
    expect(r.valid).toBe(true);
    expect(r.isUnknown).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('accepts a verified non-title three-round bout', () => {
    const r = validateBoutContext(
      ctx({ division: 'Welterweight', isTitleBout: false, scheduledRounds: 3 })
    );
    expect(r.valid).toBe(true);
    expect(r.isUnknown).toBe(false);
    expect(r.warnings).toEqual([]);
  });

  // The case the old architecture could not express at all.
  it('accepts a five-round NON-title bout without warning', () => {
    const r = validateBoutContext(
      ctx({ division: 'Lightweight', isTitleBout: false, scheduledRounds: 5 })
    );
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it('flags a title bout scheduled for three rounds as contradictory', () => {
    const r = validateBoutContext(
      ctx({ division: 'Middleweight', isTitleBout: true, scheduledRounds: 3 })
    );
    expect(r.valid).toBe(false);
    expect(r.errors.join(' ')).toMatch(/contradictory/i);
  });

  it('warns but does not error on a catchweight division', () => {
    const r = validateBoutContext(ctx({ division: 'Catch Weight' }));
    expect(r.valid).toBe(true);
    expect(r.warnings.join(' ')).toMatch(/not a canonical division/i);
  });

  it('rejects malformed types without throwing', () => {
    expect(validateBoutContext(ctx({ isTitleBout: 'yes' })).valid).toBe(false);
    expect(validateBoutContext(ctx({ scheduledRounds: 3.5 })).valid).toBe(false);
    expect(validateBoutContext(ctx({ scheduledRounds: -1 })).valid).toBe(false);
    expect(validateBoutContext(ctx({ scheduledRounds: 0 })).valid).toBe(false);
    expect(validateBoutContext('nope').valid).toBe(false);
  });

  it('warns on an unconventional but structurally valid round count', () => {
    const r = validateBoutContext(ctx({ scheduledRounds: 4 }));
    expect(r.valid).toBe(true);
    expect(r.warnings.join(' ')).toMatch(/not a conventional/i);
  });
});

describe('normalizeBoutContext — unknown stays unknown', () => {
  // The single most important rule in Correction 4.
  it('never coerces a missing title flag into false', () => {
    expect(normalizeBoutContext({ division: 'Welterweight' }).isTitleBout).toBeNull();
  });

  it('never coerces missing rounds into 3', () => {
    expect(normalizeBoutContext({ division: 'Welterweight' }).scheduledRounds).toBeNull();
  });

  it('collapses a fully empty context to null', () => {
    expect(normalizeBoutContext({})).toBeNull();
    expect(normalizeBoutContext(null)).toBeNull();
    expect(normalizeBoutContext(undefined)).toBeNull();
    expect(normalizeBoutContext(ctx())).toBeNull();
  });

  it('drops malformed values to null rather than guessing', () => {
    const n = normalizeBoutContext({
      division: 17,
      isTitleBout: 'true',
      scheduledRounds: '5',
      provenance: 'nope',
    });
    expect(n).toBeNull();
  });

  it('preserves a well-formed context including provenance', () => {
    const n = normalizeBoutContext({
      division: 'Middleweight',
      isTitleBout: false,
      scheduledRounds: 3,
      provenance: {
        sourceUrl: 'https://www.ufc.com/x',
        retrievedAt: '2026-08-14',
        authority: 'official',
      },
    });
    expect(n).toEqual({
      division: 'Middleweight',
      isTitleBout: false,
      scheduledRounds: 3,
      provenance: {
        sourceUrl: 'https://www.ufc.com/x',
        retrievedAt: '2026-08-14',
        authority: 'official',
      },
    });
  });

  it('rejects an unrecognised provenance authority', () => {
    const n = normalizeBoutContext({
      division: 'Middleweight',
      provenance: { authority: 'vibes', sourceUrl: 'https://x.test' },
    });
    expect(n.provenance.authority).toBeNull();
    expect(n.provenance.sourceUrl).toBe('https://x.test');
  });
});

describe('resolveNormalizationDivisions', () => {
  const fA = { WEIGHT_CLASS: 'Welterweight' };
  const fB = { WEIGHT_CLASS: 'Middleweight' };

  it('applies a verified division to BOTH corners', () => {
    const r = resolveNormalizationDivisions(ctx({ division: 'Middleweight' }), fA, fB);
    expect(r).toEqual({
      divisionA: 'Middleweight',
      divisionB: 'Middleweight',
      source: 'bout',
    });
  });

  it('falls back to each fighter’s own roster class when context is absent', () => {
    const r = resolveNormalizationDivisions(null, fA, fB);
    expect(r).toEqual({
      divisionA: 'Welterweight',
      divisionB: 'Middleweight',
      source: 'roster-unknown',
    });
  });

  it('falls back to roster for catchweight and says so', () => {
    const r = resolveNormalizationDivisions(ctx({ division: 'Catch Weight' }), fA, fB);
    expect(r.divisionA).toBe('Welterweight');
    expect(r.divisionB).toBe('Middleweight');
    expect(r.source).toBe('roster-unsupported');
  });
});

describe('competing outside roster division', () => {
  const luque = { FIGHTER: 'Vicente Luque', WEIGHT_CLASS: 'Welterweight' };
  const gore = { FIGHTER: 'Tresean Gore', WEIGHT_CLASS: 'Middleweight' };

  it('names only the fighter whose roster class disagrees with the bout', () => {
    const out = fightersOutsideRosterDivision(ctx({ division: 'Middleweight' }), luque, gore);
    expect(out.map((f) => f.FIGHTER)).toEqual(['Vicente Luque']);
  });

  it('names nobody when the bout division matches both', () => {
    const a = { FIGHTER: 'A', WEIGHT_CLASS: 'Lightweight' };
    const b = { FIGHTER: 'B', WEIGHT_CLASS: 'Lightweight' };
    expect(fightersOutsideRosterDivision(ctx({ division: 'Lightweight' }), a, b)).toEqual([]);
  });

  it('asserts nothing when the bout division is unverified', () => {
    expect(isCompetingOutsideRosterDivision(null, luque)).toBe(false);
    expect(fightersOutsideRosterDivision(null, luque, gore)).toEqual([]);
  });
});

describe('display helpers render three states, not two', () => {
  // A verified non-title bout must READ as non-title. If the label were emitted
  // only when isTitleBout is true, "we checked and it is not a title fight"
  // would look identical to "we never checked" -- the exact ambiguity
  // Correction 4 exists to remove.
  it('distinguishes title, non-title and unknown', () => {
    expect(describeTitleStatus(ctx({ isTitleBout: true }))).toBe('Title bout');
    expect(describeTitleStatus(ctx({ isTitleBout: false }))).toBe('Non-title');
    expect(describeTitleStatus(ctx())).toBe('Title status unknown');
    expect(describeTitleStatus(null)).toBe('Title status unknown');
  });

  it('distinguishes a round count from unknown rounds', () => {
    expect(describeScheduledRounds(ctx({ scheduledRounds: 3 }))).toBe('3 rounds');
    expect(describeScheduledRounds(ctx({ scheduledRounds: 5 }))).toBe('5 rounds');
    expect(describeScheduledRounds(ctx())).toBe('Rounds unknown');
    expect(describeScheduledRounds(null)).toBe('Rounds unknown');
  });

  it('never renders unknown as the negative state', () => {
    expect(describeTitleStatus(ctx())).not.toBe('Non-title');
    expect(describeScheduledRounds(ctx())).not.toBe('3 rounds');
  });

  it('detects legacy/unknown context', () => {
    expect(hasUnknownBoutContext(undefined)).toBe(true);
    expect(hasUnknownBoutContext(ctx())).toBe(true);
    expect(hasUnknownBoutContext(ctx({ division: 'Welterweight' }))).toBe(false);
  });
});

describe('missingBoutContextFields — partial context stays visible', () => {
  it('reports all three when context is entirely absent', () => {
    expect(missingBoutContextFields(null)).toEqual([
      'division', 'title status', 'scheduled rounds',
    ]);
    expect(missingBoutContextFields(ctx())).toEqual([
      'division', 'title status', 'scheduled rounds',
    ]);
  });

  // The case that must not read as complete.
  it('does NOT treat a known division alone as complete', () => {
    expect(missingBoutContextFields(ctx({ division: 'Welterweight' }))).toEqual([
      'title status', 'scheduled rounds',
    ]);
  });

  it('reports a missing division when title and rounds are known', () => {
    expect(
      missingBoutContextFields(ctx({ isTitleBout: true, scheduledRounds: 5 }))
    ).toEqual(['division']);
  });

  it('reports nothing when all three are verified', () => {
    expect(
      missingBoutContextFields(
        ctx({ division: 'Middleweight', isTitleBout: false, scheduledRounds: 3 })
      )
    ).toEqual([]);
  });

  it('treats a verified non-title three-rounder as complete', () => {
    const complete = ctx({
      division: 'Welterweight',
      isTitleBout: false,
      scheduledRounds: 3,
    });
    expect(missingBoutContextFields(complete)).toEqual([]);
    expect(hasUnknownBoutContext(complete)).toBe(false);
  });
});

describe('describeBoutContextSuffix — every stored state is interpretable', () => {
  // A verified non-title three-rounder must SAY so. Under the old two-state
  // suffix it rendered as "· 3 rounds", indistinguishable from a bout whose
  // title status was never checked.
  it('renders a verified non-title three-round bout explicitly', () => {
    expect(
      describeBoutContextSuffix(
        ctx({ division: 'Middleweight', isTitleBout: false, scheduledRounds: 3 })
      )
    ).toBe(' · Non-title · 3 rounds');
  });

  it('renders a title bout scheduled for five rounds', () => {
    expect(
      describeBoutContextSuffix(
        ctx({ division: 'Welterweight', isTitleBout: true, scheduledRounds: 5 })
      )
    ).toBe(' · Title bout · 5 rounds');
  });

  it('renders a five-round non-title bout distinctly from a title bout', () => {
    const nonTitle = describeBoutContextSuffix(
      ctx({ division: 'Lightweight', isTitleBout: false, scheduledRounds: 5 })
    );
    expect(nonTitle).toBe(' · Non-title · 5 rounds');
    expect(nonTitle).not.toBe(
      describeBoutContextSuffix(ctx({ division: 'Lightweight', isTitleBout: true, scheduledRounds: 5 }))
    );
  });

  it('says so when division is known but title and rounds are not', () => {
    expect(describeBoutContextSuffix(ctx({ division: 'Welterweight' }))).toBe(
      ' · Title status unknown · Rounds unknown'
    );
  });

  it('says so when title is known but division is not', () => {
    expect(
      describeBoutContextSuffix(ctx({ isTitleBout: true, scheduledRounds: 5 }))
    ).toBe(' · Title bout · 5 rounds');
    expect(describeBoutContextSuffix(ctx({ isTitleBout: false }))).toBe(
      ' · Non-title · Rounds unknown'
    );
  });

  // A legacy row predates the schema entirely; that is different from a row we
  // looked at and could not verify, so it renders nothing rather than a wall of
  // "unknown".
  it('renders nothing for a legacy entry with no context at all', () => {
    expect(describeBoutContextSuffix(null)).toBe('');
    expect(describeBoutContextSuffix(undefined)).toBe('');
  });

  it('never renders unknown as false or as three rounds', () => {
    const partial = describeBoutContextSuffix(ctx({ division: 'Welterweight' }));
    expect(partial).not.toContain('Non-title');
    expect(partial).not.toContain('3 rounds');
  });
});
