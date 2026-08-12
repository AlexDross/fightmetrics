import { describe, expect, it } from 'vitest';
import { computeMatchupEdges } from '../index.js';
import { buildRoiEntry } from '../../betting/index.js';

// Synthetic fighters with identical stats, so the ONLY thing that can move a
// probability between two calls here is the age input.
const fighter = (FIGHTER, AGE) => ({
  FIGHTER,
  AGE,
  WEIGHT_CLASS: "Women's Strawweight",
  CREDIBILITY: 100,
  TOTAL_MIN: 100,
  TOTAL_ROUNDS: 20,
  DEEP_ROUNDS: 5,
  UFC_FIGHT_COUNT: 10,
  WINS: 7,
  LOSSES: 3,
  ASL: 3.5,
  ASP: 0.45,
  ASA: 0.5,
  ATL: 1.5,
  ATP: 0.4,
  ATD: 0.65,
  ELO: 1500,
  ELO_PEAK: 1520,
  CARDIO_RATIO: 1,
  FIGHT_HISTORY: [],
});

const ageAudit = (result) =>
  result.auditRows.find((row) => row.group === 'Physical' && row.label === 'Age');

describe('event-date-aware model ages', () => {
  it('recomputes age inputs across a birthday boundary', () => {
    // Mackenzie Dern was born 1993-03-24.
    const fA = fighter('Mackenzie Dern', 32);
    const fB = fighter('Gillian Robertson', 30);
    const before = computeMatchupEdges(fA, fB, { eventDate: '2026-03-23' });
    const birthday = computeMatchupEdges(fA, fB, { eventDate: '2026-03-24' });

    expect(ageAudit(before)).toMatchObject({ aValue: 32, bValue: 30 });
    expect(ageAudit(birthday)).toMatchObject({ aValue: 33, bValue: 30 });
    expect(before.featsV2.younger).toBe(-2);
    expect(birthday.featsV2.younger).toBe(-3);
    expect(birthday.v2pA).not.toBe(before.v2pA);
  });

  it('ignores the stored integer age entirely when a DOB is known', () => {
    const stale = computeMatchupEdges(
      fighter('Mackenzie Dern', 12),
      fighter('Gillian Robertson', 99),
      { eventDate: '2026-08-15' },
    );
    expect(ageAudit(stale)).toMatchObject({ aValue: 33, bValue: 31 });
  });

  it('falls back to the stored age when no event date is supplied', () => {
    const fA = fighter('Mackenzie Dern', 32);
    const fB = fighter('Gillian Robertson', 30);
    for (const ctx of [undefined, {}, { eventDate: '' }, { eventDate: 'nope' }]) {
      expect(ageAudit(computeMatchupEdges(fA, fB, ctx)), String(ctx)).toMatchObject({
        aValue: 32,
        bValue: 30,
      });
    }
  });

  it('honours the fixture-only useStoredAge override over an event date', () => {
    const pinned = computeMatchupEdges(
      fighter('Mackenzie Dern', 32),
      fighter('Gillian Robertson', 30),
      { eventDate: '2026-08-15', useStoredAge: true },
    );
    expect(ageAudit(pinned)).toMatchObject({ aValue: 32, bValue: 30 });
  });

  it('requires an explicit true for the override', () => {
    // A merged context carrying useStoredAge: undefined/false must not pin.
    for (const flag of [undefined, false, null, 0, '']) {
      const r = computeMatchupEdges(
        fighter('Mackenzie Dern', 32),
        fighter('Gillian Robertson', 30),
        { eventDate: '2026-08-15', useStoredAge: flag },
      );
      expect(ageAudit(r), String(flag)).toMatchObject({ aValue: 33, bValue: 31 });
    }
  });

  it('uses the saved bout date in buildRoiEntry', () => {
    const fA = fighter('Mackenzie Dern', 32);
    const fB = fighter('Gillian Robertson', 30);
    const direct = computeMatchupEdges(fA, fB, { eventDate: '2026-03-24' });
    const entry = buildRoiEntry({
      fA,
      fB,
      oddsA: '-200',
      oddsB: '+170',
      eventName: 'Birthday regression',
      eventDate: '2026-03-24',
    });

    expect(entry.fighterAProb).toBe(direct.pA);
    expect(entry.v2pA).toBe(direct.v2pA);
  });

  it('freezes a saved entry at fight-night age, not save-day age', () => {
    const fA = fighter('Mackenzie Dern', 32);
    const fB = fighter('Gillian Robertson', 30);
    const dayBefore = buildRoiEntry({
      fA, fB, oddsA: '-200', oddsB: '+170',
      eventName: 'E', eventDate: '2026-03-23',
    });
    const onBirthday = buildRoiEntry({
      fA, fB, oddsA: '-200', oddsB: '+170',
      eventName: 'E', eventDate: '2026-03-24',
    });
    expect(onBirthday.v2pA).not.toBe(dayBefore.v2pA);
  });
});

describe('missing ages are neutral, never age 30', () => {
  const unknown = () => fighter('No DOB Or Stored Age', null);
  const known = (age) => fighter('Mackenzie Dern', age);

  it('zeroes the v1 and v2 age differentials when either age is unknown', () => {
    const result = computeMatchupEdges(unknown(), known(32), {
      eventDate: '2026-08-15',
    });

    expect(ageAudit(result)).toMatchObject({
      aValue: 'Unknown',
      bValue: 33,
      diff: 0,
    });
    expect(result.featsV2.younger).toBe(0);
    expect(result.feats.age_dif).toBe(0);
  });

  it('is neutral in both slot orders and when BOTH ages are unknown', () => {
    const ab = computeMatchupEdges(unknown(), known(32), { eventDate: '2026-08-15' });
    const ba = computeMatchupEdges(known(32), unknown(), { eventDate: '2026-08-15' });
    const neither = computeMatchupEdges(unknown(), unknown(), { eventDate: '2026-08-15' });

    for (const r of [ab, ba, neither]) {
      expect(r.featsV2.younger).toBe(0);
      expect(r.feats.age_dif).toBe(0);
      expect(ageAudit(r).diff).toBe(0);
    }
    // Slot order must not manufacture a difference either.
    expect(ab.v2pA).toBe(ba.v2pB);
    expect(ageAudit(neither)).toMatchObject({ aValue: 'Unknown', bValue: 'Unknown' });
  });

  it('does not invent an advantage the way an age-30 default did', () => {
    // Under the old `?? 30` behaviour a 39-year-old facing an unknown-age
    // opponent scored as if the opponent were 30 -- a fabricated 9-year edge
    // against him. Now the differential is identical whatever his real age is.
    const vs39 = computeMatchupEdges(unknown(), known(39), { eventDate: '2026-08-15' });
    const vs22 = computeMatchupEdges(unknown(), known(22), { eventDate: '2026-08-15' });
    expect(vs39.featsV2.younger).toBe(0);
    expect(vs22.featsV2.younger).toBe(0);
    expect(vs39.feats.age_dif).toBe(0);
    expect(vs22.feats.age_dif).toBe(0);
  });

  it('still applies the individually-supported decay penalty to the known fighter', () => {
    // Neutralising the DIFFERENTIAL does not mean ignoring what we do know:
    // Edson Barboza (born 1986-01-21) is 40 on this date and carries his own
    // age-decay penalty regardless of whether the opponent's age is known.
    const oldKnown = fighter('Edson Barboza', null);
    const young = fighter('Donte Johnson', null); // born 1999-05-25 -> 27
    const result = computeMatchupEdges(oldKnown, young, { eventDate: '2026-08-15' });

    expect(ageAudit(result)).toMatchObject({ aValue: 40, bValue: 27 });

    // Same veteran, opponent's age now genuinely unknown: differential goes to
    // zero, but his own decay penalty must NOT disappear with it.
    const vsUnknown = computeMatchupEdges(oldKnown, unknown(), {
      eventDate: '2026-08-15',
    });
    expect(vsUnknown.featsV2.younger).toBe(0);
    expect(vsUnknown.agePenaltyA).toBeGreaterThan(0);
    expect(vsUnknown.agePenaltyA).toBe(result.agePenaltyA);
  });
});
