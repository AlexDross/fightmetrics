// ─── AGE ─────────────────────────────────────────────────────────────────────
// Date of birth is the durable age source. The integer AGE values in
// fightersData.js are snapshots from whenever the scrape last ran, so they go
// stale the moment a fighter has a birthday -- at the time this module was
// added, 1,799 of the 1,973 fighters with a known DOB were carrying a stale
// stored age. Those integers are kept ONLY as a fallback for the fighters whose
// birth date is not in the source data.
//
// Everything here is pure date-only (YYYY-MM-DD) arithmetic on year/month/day
// components. No Date objects are used for the age calculation itself, so the
// result never depends on the host time zone, on DST, or on what hour of the
// day the code runs. Date.UTC appears only inside parseDateOnly, and only to
// reject impossible calendar dates (2026-02-29, 2026-04-31) -- constructing it
// in UTC keeps that validation time-zone independent too.

import { FIGHTER_BIRTHDATES } from '../../fighterBirthdates.js';

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Returns {year, month, day} for a valid YYYY-MM-DD string, else null.
// Anything non-conforming -- undefined, '', 'Aug 15 2026', '2026-8-15',
// '2026-13-01', a Date, a number -- is rejected rather than coerced, because a
// silently coerced date would produce a confidently wrong age.
const parseDateOnly = (value) => {
  const match = DATE_ONLY_RE.exec(value ?? '');
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  // Round-trip through Date.UTC to reject impossible days. This also catches
  // the two-digit-year trap: Date.UTC(1, 0, 1) maps year 1 to 1901, so
  // '0001-01-01' fails the year comparison and is rejected.
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
};

// Today in the VIEWER's local calendar. Used for "how old is this fighter
// right now" on the assembled roster. Local rather than UTC is deliberate: the
// roster's age column should turn over when the user's own calendar day does.
const currentLocalDate = (now = new Date()) => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Completed years between two date-only values. Returns null if either date is
// unusable or if the birth date is after the as-of date (a negative age is
// always bad data, never a real fighter).
//
// Feb 29 birthdays count the birthday as reached on Mar 1 in non-leap years:
// (2000-02-29, 2025-02-28) -> 24, (2000-02-29, 2025-03-01) -> 25.
const calculateAgeOnDate = (birthDate, asOfDate) => {
  const birth = parseDateOnly(birthDate);
  const asOf = parseDateOnly(asOfDate);
  if (!birth || !asOf) return null;

  let age = asOf.year - birth.year;
  if (
    asOf.month < birth.month ||
    (asOf.month === birth.month && asOf.day < birth.day)
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
};

// An explicit DOB on the fighter object wins over the generated map, so a
// caller can supply a birth date the artifact does not have yet.
const getFighterBirthDate = (fighter) =>
  fighter?.DOB ?? FIGHTER_BIRTHDATES[fighter?.FIGHTER] ?? null;

// The single age entry point.
//   1. DOB (object field, else the generated map) evaluated at asOfDate.
//   2. asOfDate that is missing or unparseable falls back to today -- callers
//      that want "now" can simply omit it.
//   3. The stored integer AGE, only when no usable DOB exists.
//   4. null when the fighter has neither. Callers MUST treat null as unknown
//      and neutralise, never substitute a default age.
const resolveFighterAge = (fighter, asOfDate) => {
  const resolvedDate = parseDateOnly(asOfDate) ? asOfDate : currentLocalDate();
  const calculatedAge = calculateAgeOnDate(
    getFighterBirthDate(fighter),
    resolvedDate,
  );
  if (calculatedAge != null) return calculatedAge;

  return Number.isFinite(fighter?.AGE) ? fighter.AGE : null;
};

export {
  parseDateOnly,
  currentLocalDate,
  calculateAgeOnDate,
  getFighterBirthDate,
  resolveFighterAge,
};
