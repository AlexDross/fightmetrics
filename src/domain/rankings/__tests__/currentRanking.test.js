// Current-ranking resolution for profile/UI badges, against injected records
// so the suite never reads the live generated artifact.
import { describe, expect, it } from 'vitest';
import {
  buildKeysByName,
  isChampionRecord,
  rankingHistoryKey,
  resolveCurrentRankingFrom,
} from '../lookup.js';

const record = (division, rank, extra = {}) => ({
  division,
  rank,
  status: rank === 0 ? 'champion' : 'contender',
  source: 'media',
  ...extra,
});

const records = {
  [rankingHistoryKey('Welterweight', 'strict guy')]: record('Welterweight', 5),
  [rankingHistoryKey('Welterweight', 'the champ')]: record('Welterweight', 0),
  // Roster says Light Heavyweight; UFC ranks him at Heavyweight.
  [rankingHistoryKey('Heavyweight', 'moved up')]: record('Heavyweight', 11),
  // Holds two current rankings -- ambiguous.
  [rankingHistoryKey('Middleweight', 'two belts')]: record('Middleweight', 2),
  [rankingHistoryKey('Light Heavyweight', 'two belts')]: record('Light Heavyweight', 4),
  [rankingHistoryKey("Women's Strawweight", 'women champ')]: record("Women's Strawweight", 1),
};
const keysByName = buildKeysByName(records);
const aliases = { 'michael venom page': 'michael page' };

const resolve = (fighterName, rosterDivision) =>
  resolveCurrentRankingFrom({ records, keysByName, aliases, fighterName, rosterDivision });

describe('resolveCurrentRankingFrom', () => {
  it('prefers an exact fighter + division match', () => {
    const hit = resolve('Strict Guy', 'Welterweight');
    expect(hit.rank).toBe(5);
    expect(hit.division).toBe('Welterweight');
    expect(hit.crossDivision).toBe(false);
  });

  it('marks champions', () => {
    expect(isChampionRecord(resolve('The Champ', 'Welterweight'))).toBe(true);
    expect(isChampionRecord(resolve('Strict Guy', 'Welterweight'))).toBe(false);
    expect(isChampionRecord(null)).toBe(false);
  });

  it('recovers a fighter whose ranked division differs from the roster', () => {
    const hit = resolve('Moved Up', 'Light Heavyweight');
    expect(hit.rank).toBe(11);
    // The rank keeps its OWN division -- never relabelled into the roster's.
    expect(hit.division).toBe('Heavyweight');
    expect(hit.crossDivision).toBe(true);
    expect(hit.divisionLabel).toBe('HW');
  });

  it('returns null for an unranked fighter', () => {
    expect(resolve('Nobody At All', 'Welterweight')).toBeNull();
  });

  it('rejects ambiguity instead of guessing', () => {
    expect(resolve('Two Belts', 'Welterweight')).toBeNull();
    // Even from one of its own divisions the exact match still wins...
    expect(resolve('Two Belts', 'Middleweight').rank).toBe(2);
    // ...but an unrelated roster division must not pick one arbitrarily.
    expect(resolve('Two Belts', 'Heavyweight')).toBeNull();
  });

  it('applies aliases and Unicode normalisation', () => {
    const aliased = resolveCurrentRankingFrom({
      records: { [rankingHistoryKey('Welterweight', 'michael page')]: record('Welterweight', 14) },
      keysByName: buildKeysByName({
        [rankingHistoryKey('Welterweight', 'michael page')]: record('Welterweight', 14),
      }),
      aliases,
      fighterName: 'Michael “Venom” Page',
      rosterDivision: 'Welterweight',
    });
    expect(aliased.rank).toBe(14);
  });

  it('resolves an unusable roster division only when unambiguous', () => {
    // "Women\" is truncated: sex is known, division is not.
    expect(resolve('Women Champ', 'Women\\').rank).toBe(1);
    expect(resolve('Two Belts', 'Women\\')).toBeNull();
  });

  it('ignores a blank or missing fighter name', () => {
    expect(resolve('', 'Welterweight')).toBeNull();
    expect(resolve(null, 'Welterweight')).toBeNull();
  });
});
