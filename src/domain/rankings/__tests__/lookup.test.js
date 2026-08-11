import { describe, expect, it } from 'vitest';
import {
  baseRankingNameKey,
  buildKeysByName,
  divisionAbbreviation,
  findRankState,
  lookupHistoricalRank,
  normalizeRankingDivision,
  parseRankingDate,
  rankingHistoryKey,
} from '../lookup.js';

const aliases = {
  'michael venom page': 'michael page',
};

const history = {
  [rankingHistoryKey('Lightweight', 'test fighter')]: [
    [20200101, 3],
    [20200201, null],
    [20200301, 10],
  ],
  [rankingHistoryKey("Women's Strawweight", 'dual division')]: [[20200101, 5]],
  [rankingHistoryKey("Women's Flyweight", 'dual division')]: [[20200101, 8]],
  [rankingHistoryKey('Welterweight', 'michael page')]: [[20200101, 12]],
  [rankingHistoryKey('Featherweight', 'champ')]: [[20200101, 0]],
};
const keysByName = buildKeysByName(history);

const lookup = (fighterName, division, eventDate) =>
  lookupHistoricalRank({ history, keysByName, aliases, fighterName, division, eventDate });

describe('rankings lookup', () => {
  it('normalizes accents, UFC apostrophes, and special letters', () => {
    expect(baseRankingNameKey('Jiří Procházka')).toBe('jiri prochazka');
    expect(baseRankingNameKey('Jan Błachowicz')).toBe('jan blachowicz');
    expect(baseRankingNameKey('Lone’er Kavanagh')).toBe('loneer kavanagh');
    expect(baseRankingNameKey('José Aldó')).toBe('jose aldo');
    expect(baseRankingNameKey(null)).toBe('');
  });

  it('normalizes title divisions without guessing catchweights', () => {
    expect(normalizeRankingDivision('Light Heavyweight Title')).toBe('Light Heavyweight');
    expect(normalizeRankingDivision('Middleweight Title Bout')).toBe('Middleweight');
    expect(normalizeRankingDivision('Catch Weight')).toBeNull();
    expect(normalizeRankingDivision('Unknown')).toBeNull();
    expect(normalizeRankingDivision('Women\\')).toBeNull();
    expect(normalizeRankingDivision(undefined)).toBeNull();
  });

  it('parses ranking dates and rejects unusable ones', () => {
    expect(parseRankingDate('2020-01-15')).toBe(20200115);
    expect(parseRankingDate(20200115)).toBe(20200115);
    expect(parseRankingDate('2020-01')).toBe(20200101);
    expect(parseRankingDate('nonsense')).toBeNull();
  });

  it('never reads a snapshot published after the requested date', () => {
    const entries = [[20200101, 5], [20200601, 2]];
    expect(findRankState(entries, '2020-03-01')).toEqual({ asOf: 20200101, rank: 5 });
    // The 2020-06 snapshot must be invisible on 2020-05-31.
    expect(findRankState(entries, '2020-05-31')?.rank).toBe(5);
    expect(findRankState(entries, '2019-12-31')).toBeNull();
  });

  it('uses explicit unranked tombstones and supports re-entry', () => {
    expect(lookup('Test Fighter', 'Lightweight', '2020-01-15')?.rank).toBe(3);
    expect(lookup('Test Fighter', 'Lightweight', '2020-02-15')).toBeNull();
    expect(lookup('Test Fighter', 'Lightweight', '2020-03-15')?.rank).toBe(10);
  });

  it('does not collapse simultaneous rankings across divisions', () => {
    expect(lookup('Dual Division', "Women's Strawweight", '2020-01-15')?.rank).toBe(5);
    expect(lookup('Dual Division', "Women's Flyweight", '2020-01-15')?.rank).toBe(8);
    // Sex is known but division is not: ambiguous, so refuse rather than guess.
    expect(lookup('Dual Division', 'Women\\', '2020-01-15')).toBeNull();
  });

  it('does not borrow a ranking from the wrong known division', () => {
    expect(lookup('Michael Page', 'Lightweight', '2020-01-15')).toBeNull();
  });

  it('recovers an unknown division only when exactly one ranking exists', () => {
    expect(lookup('Michael Page', 'Unknown', '2020-01-15')?.division).toBe('Welterweight');
  });

  it('applies source-name aliases', () => {
    expect(lookup('Michael Venom Page', 'Welterweight', '2020-01-15')?.rank).toBe(12);
  });

  it('represents champions as rank 0', () => {
    expect(lookup('Champ', 'Featherweight', '2020-01-15')?.rank).toBe(0);
  });

  it('abbreviates divisions for the cross-division badge', () => {
    expect(divisionAbbreviation('Heavyweight')).toBe('HW');
    expect(divisionAbbreviation('Light Heavyweight')).toBe('LHW');
    expect(divisionAbbreviation("Women's Strawweight")).toBe('W-SW');
  });
});
