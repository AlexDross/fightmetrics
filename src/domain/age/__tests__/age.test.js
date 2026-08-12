import { describe, expect, it } from 'vitest';
import {
  calculateAgeOnDate,
  currentLocalDate,
  getFighterBirthDate,
  parseDateOnly,
  resolveFighterAge,
} from '../index.js';

// These assertions pin FIXED (birthDate, asOfDate) pairs, so nothing here
// drifts with the calendar -- unlike the assembled roster, which this module is
// deliberately kept independent of.

describe('parseDateOnly', () => {
  it('accepts a well-formed date-only string', () => {
    expect(parseDateOnly('2026-08-15')).toEqual({ year: 2026, month: 8, day: 15 });
    expect(parseDateOnly('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it('rejects impossible calendar dates', () => {
    expect(parseDateOnly('2026-02-29')).toBeNull(); // 2026 is not a leap year
    expect(parseDateOnly('2026-04-31')).toBeNull();
    expect(parseDateOnly('2026-13-01')).toBeNull();
    expect(parseDateOnly('2026-00-10')).toBeNull();
  });

  it('rejects the Date.UTC two-digit-year trap', () => {
    // Date.UTC(1, 0, 1) silently maps year 1 to 1901. Without the round-trip
    // check this would parse as a valid date nearly two millennia off.
    expect(parseDateOnly('0001-01-01')).toBeNull();
    expect(parseDateOnly('0099-06-15')).toBeNull();
  });

  it('rejects anything that is not exactly YYYY-MM-DD', () => {
    for (const bad of [
      '2026-8-15', '26-08-15', '2026/08/15', 'Aug 15 2026', '2026-08-15T00:00:00Z',
      '', ' ', null, undefined, 20260815, new Date('2026-08-15'), {},
    ]) {
      expect(parseDateOnly(bad), String(bad)).toBeNull();
    }
  });
});

describe('calculateAgeOnDate', () => {
  it('increments on the birthday, not before it', () => {
    expect(calculateAgeOnDate('1993-03-24', '2026-03-23')).toBe(32);
    expect(calculateAgeOnDate('1993-03-24', '2026-03-24')).toBe(33);
    expect(calculateAgeOnDate('1993-03-24', '2026-03-25')).toBe(33);
  });

  it('handles month and year boundaries', () => {
    expect(calculateAgeOnDate('1990-01-01', '2025-12-31')).toBe(35);
    expect(calculateAgeOnDate('1990-01-01', '2026-01-01')).toBe(36);
    expect(calculateAgeOnDate('1990-12-31', '2026-01-01')).toBe(35);
  });

  it('treats a Feb 29 birthday as reached on Mar 1 in a non-leap year', () => {
    expect(calculateAgeOnDate('2000-02-29', '2025-02-28')).toBe(24);
    expect(calculateAgeOnDate('2000-02-29', '2025-03-01')).toBe(25);
    // ...and exactly on the day in a leap year.
    expect(calculateAgeOnDate('2000-02-29', '2024-02-29')).toBe(24);
  });

  it('is independent of host time zone', () => {
    // Pure Y/M/D arithmetic: no Date is constructed for the calculation, so a
    // date that would straddle midnight under UTC-vs-local parsing cannot move.
    expect(calculateAgeOnDate('1993-01-01', '2026-01-01')).toBe(33);
    expect(calculateAgeOnDate('1993-12-31', '2026-12-31')).toBe(33);
  });

  it('computes forward for a future event date', () => {
    expect(calculateAgeOnDate('1993-03-24', '2030-03-23')).toBe(36);
    expect(calculateAgeOnDate('1993-03-24', '2030-03-24')).toBe(37);
  });

  it('returns null for unusable input rather than a wrong number', () => {
    expect(calculateAgeOnDate('not-a-date', '2026-08-15')).toBeNull();
    expect(calculateAgeOnDate('1993-03-24', 'not-a-date')).toBeNull();
    expect(calculateAgeOnDate(undefined, '2026-08-15')).toBeNull();
    // Birth date after the as-of date is bad data, never a real fighter.
    expect(calculateAgeOnDate('2030-01-01', '2026-08-15')).toBeNull();
  });

  it('allows a zeroth birthday but not a negative age', () => {
    expect(calculateAgeOnDate('2026-08-12', '2026-08-12')).toBe(0);
    expect(calculateAgeOnDate('2026-08-13', '2026-08-12')).toBeNull();
  });
});

describe('currentLocalDate', () => {
  it('formats an injected clock as zero-padded YYYY-MM-DD', () => {
    expect(currentLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(currentLocalDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('produces something parseDateOnly accepts', () => {
    expect(parseDateOnly(currentLocalDate())).not.toBeNull();
  });
});

describe('getFighterBirthDate', () => {
  it('reads the generated map by canonical roster name', () => {
    expect(getFighterBirthDate({ FIGHTER: 'Mackenzie Dern' })).toBe('1993-03-24');
  });

  it('prefers an explicit DOB on the object over the map', () => {
    expect(
      getFighterBirthDate({ FIGHTER: 'Mackenzie Dern', DOB: '2000-01-01' }),
    ).toBe('2000-01-01');
  });

  it('returns null when the fighter is not in the map', () => {
    expect(getFighterBirthDate({ FIGHTER: 'Not A Real Fighter' })).toBeNull();
    expect(getFighterBirthDate(undefined)).toBeNull();
  });
});

describe('resolveFighterAge', () => {
  it('derives age from DOB at the given date', () => {
    expect(resolveFighterAge({ FIGHTER: 'Mackenzie Dern', AGE: 32 }, '2026-08-15')).toBe(33);
  });

  it('prefers DOB over a stale stored age', () => {
    // The stored integer is deliberately wrong here; DOB must win.
    expect(resolveFighterAge({ FIGHTER: 'Mackenzie Dern', AGE: 21 }, '2026-08-15')).toBe(33);
  });

  it('resolves an aliased source name to the canonical roster name', () => {
    // name_aliases.json maps "Ian Garry" -> "Ian Machado Garry"; the generator
    // applies it, so the app can look up the canonical name it actually holds.
    expect(getFighterBirthDate({ FIGHTER: 'Ian Machado Garry' })).toBe('1997-11-17');
    expect(resolveFighterAge({ FIGHTER: 'Ian Machado Garry' }, '2026-08-15')).toBe(28);
  });

  it('falls back to the stored age only when no birth date exists', () => {
    expect(resolveFighterAge({ FIGHTER: 'Not A Real Fighter', AGE: 29 }, '2026-08-15')).toBe(29);
  });

  it('returns null when neither a birth date nor a usable stored age exists', () => {
    expect(resolveFighterAge({ FIGHTER: 'Not A Real Fighter' }, '2026-08-15')).toBeNull();
    expect(resolveFighterAge({ FIGHTER: 'Not A Real Fighter', AGE: null }, '2026-08-15')).toBeNull();
    expect(resolveFighterAge({ FIGHTER: 'Not A Real Fighter', AGE: NaN }, '2026-08-15')).toBeNull();
    expect(resolveFighterAge({ FIGHTER: 'Not A Real Fighter', AGE: '31' }, '2026-08-15')).toBeNull();
  });

  it('falls back to today when the as-of date is missing or unusable', () => {
    const today = resolveFighterAge({ FIGHTER: 'Mackenzie Dern' });
    expect(resolveFighterAge({ FIGHTER: 'Mackenzie Dern' }, undefined)).toBe(today);
    expect(resolveFighterAge({ FIGHTER: 'Mackenzie Dern' }, 'garbage')).toBe(today);
    expect(resolveFighterAge({ FIGHTER: 'Mackenzie Dern' }, '2026-02-29')).toBe(today);
  });

  it('resolves every UFC 330 fighter from DOB at the card date', () => {
    // Source-coverage check for the card the correction was validated against:
    // all 20 must come from a birth date, none from a stored-age fallback.
    const expected = {
      'Islam Makhachev': 34,
      'Ian Machado Garry': 28,
      'Mackenzie Dern': 33,
      'Gillian Robertson': 31,
      'Mansur Abdul-Malik': 28,
      'Dustin Stoltzfus': 34,
      'Edson Barboza': 40,
      'Esteban Ribovics': 30,
      'Chidi Njokuani': 37,
      'Joel Alvarez': 33,
      'Jalin Turner': 31,
      'Kaue Fernandes': 31,
      'Donte Johnson': 27,
      'Eric McConico': 36,
      'Vicente Luque': 34,
      'Tresean Gore': 32,
      'Neil Magny': 39,
      'Ramiz Brahimaj': 33,
      'Jeremiah Wells': 39,
      'Myktybek Orolbai': 28,
    };

    for (const [name, age] of Object.entries(expected)) {
      // No AGE field at all, so a pass can only come from the DOB path.
      expect(getFighterBirthDate({ FIGHTER: name }), name).not.toBeNull();
      expect(resolveFighterAge({ FIGHTER: name }, '2026-08-15'), name).toBe(age);
    }
  });
});
