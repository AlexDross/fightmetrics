// Deliberately a .test.mjs file. This suite VERIFIES THE COMMITTED DATA FILE,
// so it must read the real upcomingData.js -- the same reason
// src/data/migration/__tests__/legacyFieldMap.test.mjs reads it. The
// direct-import guard in isolation.test.js scans .test.js files, whose job is
// to stay free of date-derived live state; UPCOMING_ENTRIES is static committed
// data and carries no Date.now() dependency, so there is nothing here to drift.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { UPCOMING_ENTRIES } from '../upcomingData.js';
import { normalizeBoutContext, validateBoutContext } from '../domain/boutContext/index.js';
import preMigration from './snapshots/upcoming.preMigration.json';

// Every value below comes from the official UFC 330 weigh-in results page,
// retrieved 2026-08-14:
//   https://www.ufc.com/news/official-weigh-results-ufc-330-makhachev-vs-machado-garry
// which lists each bout's division and both championship designations, and
// states: "Main event and co-main event scheduled for five rounds each. All
// other bouts scheduled for three rounds."
const OFFICIAL = [
  ['Islam Makhachev', 'Ian Machado Garry', 'Welterweight', true, 5],
  ['Mackenzie Dern', 'Gillian Robertson', "Women's Strawweight", true, 5],
  ['Mansur Abdul-Malik', 'Dustin Stoltzfus', 'Middleweight', false, 3],
  ['Edson Barboza', 'Esteban Ribovics', 'Lightweight', false, 3],
  ['Chidi Njokuani', 'Joel Alvarez', 'Welterweight', false, 3],
  ['Jalin Turner', 'Kaue Fernandes', 'Lightweight', false, 3],
  ['Donte Johnson', 'Eric McConico', 'Middleweight', false, 3],
  ['Vicente Luque', 'Tresean Gore', 'Middleweight', false, 3],
  ['Neil Magny', 'Ramiz Brahimaj', 'Welterweight', false, 3],
  ['Jeremiah Wells', 'Myktybek Orolbai', 'Welterweight', false, 3],
];

// The ONLY pre-existing field allowed to change anywhere in this migration.
const ALLOWED_FIELD_CHANGES = new Map([
  ['Vicente Luque|Tresean Gore', { division: ['Welterweight / Middleweight', 'Middleweight'] }],
]);

const key = (e) => `${e.fighterA}|${e.fighterB}`;

describe('UFC 330 bout context — official values', () => {
  it('tracks exactly the ten expected matchups, in order', () => {
    expect(UPCOMING_ENTRIES.length).toBe(10);
    expect(UPCOMING_ENTRIES.map((e) => `${e.fighterA} vs ${e.fighterB}`)).toEqual(
      OFFICIAL.map(([a, b]) => `${a} vs ${b}`)
    );
  });

  it('carries the official division, title status and round count on all ten', () => {
    OFFICIAL.forEach(([a, b, division, isTitleBout, scheduledRounds], i) => {
      const e = UPCOMING_ENTRIES[i];
      expect(e.fighterA, `slot ${i} A`).toBe(a);
      expect(e.fighterB, `slot ${i} B`).toBe(b);
      expect(e.boutContext, `${a} vs ${b} boutContext`).toBeDefined();
      expect(e.boutContext.division, `${a} vs ${b} division`).toBe(division);
      expect(e.boutContext.isTitleBout, `${a} vs ${b} title`).toBe(isTitleBout);
      expect(e.boutContext.scheduledRounds, `${a} vs ${b} rounds`).toBe(scheduledRounds);
    });
  });

  it('records official provenance on every entry', () => {
    UPCOMING_ENTRIES.forEach((e) => {
      expect(e.boutContext.provenance.authority).toBe('official');
      expect(e.boutContext.provenance.retrievedAt).toBe('2026-08-14');
      expect(e.boutContext.provenance.sourceUrl).toMatch(/^https:\/\/www\.ufc\.com\//);
    });
  });

  it('has exactly two title bouts', () => {
    const titles = UPCOMING_ENTRIES.filter((e) => e.boutContext.isTitleBout === true);
    expect(titles.length).toBe(2);
    expect(titles.map((e) => e.fighterA)).toEqual(['Islam Makhachev', 'Mackenzie Dern']);
  });

  it('has exactly two five-round bouts and eight three-round bouts', () => {
    const five = UPCOMING_ENTRIES.filter((e) => e.boutContext.scheduledRounds === 5);
    const three = UPCOMING_ENTRIES.filter((e) => e.boutContext.scheduledRounds === 3);
    expect(five.length).toBe(2);
    expect(three.length).toBe(8);
    expect(five.length + three.length).toBe(UPCOMING_ENTRIES.length);
  });

  it('every stored context is internally consistent', () => {
    UPCOMING_ENTRIES.forEach((e) => {
      const r = validateBoutContext(e.boutContext);
      expect(r.valid, `${key(e)}: ${r.errors.join('; ')}`).toBe(true);
      expect(r.warnings, `${key(e)}`).toEqual([]);
    });
  });

  it('stores nothing that normalisation would reject', () => {
    UPCOMING_ENTRIES.forEach((e) => {
      expect(normalizeBoutContext(e.boutContext)).toEqual(e.boutContext);
    });
  });

  it('does not leave any entry with unknown context', () => {
    UPCOMING_ENTRIES.forEach((e) => {
      expect(e.boutContext.division, key(e)).not.toBeNull();
      expect(e.boutContext.isTitleBout, key(e)).not.toBeNull();
      expect(e.boutContext.scheduledRounds, key(e)).not.toBeNull();
    });
  });
});

describe('UFC 330 migration — frozen fields did not move', () => {
  it('captured the pre-migration snapshot from the PR base commit', () => {
    expect(preMigration.capturedFrom).toBe('ed0ebff43662120fc109c49f25385ac31d335174');
    expect(preMigration.entries.length).toBe(10);
  });

  // The heart of the migration guarantee: every field that existed before is
  // value-identical after, except the one declared correction. Compared by
  // JSON round-trip so nested provenance and feature vectors are covered too.
  it('every pre-existing field is value-identical except the declared correction', () => {
    preMigration.entries.forEach((before, i) => {
      const after = UPCOMING_ENTRIES[i];
      const allowed = ALLOWED_FIELD_CHANGES.get(key(before)) ?? {};
      expect(key(after)).toBe(key(before));

      for (const field of Object.keys(before)) {
        const b = JSON.stringify(before[field]);
        const a = JSON.stringify(after[field]);
        if (allowed[field]) {
          expect(before[field], `${key(before)}.${field} pre`).toBe(allowed[field][0]);
          expect(after[field], `${key(before)}.${field} post`).toBe(allowed[field][1]);
        } else {
          expect(a, `${key(before)}.${field} must not change`).toBe(b);
        }
      }
    });
  });

  it('adds boutContext and nothing else to the entry shape', () => {
    preMigration.entries.forEach((before, i) => {
      const added = Object.keys(UPCOMING_ENTRIES[i]).filter(
        (k) => !Object.prototype.hasOwnProperty.call(before, k)
      );
      expect(added, key(before)).toEqual(['boutContext']);
    });
  });

  it('no saved probability, odds or market value moved', () => {
    const MONEY = [
      'fighterAProb', 'fighterBProb', 'predictedProb', 'trackedProb',
      'v2pA', 'v2pB', 'oddsA', 'oddsB', 'marketOdds',
      'edge', 'edgeA', 'edgeB', 'ev', 'evA', 'evB',
      'kelly', 'kellyA', 'kellyB', 'fairLine', 'fairLineA', 'fairLineB',
      'projectedKO', 'projectedSUB', 'projectedDEC', 'projectedFinish',
      'predictedWinner', 'trackedSide', 'betAction', 'bestBet',
    ];
    preMigration.entries.forEach((before, i) => {
      const after = UPCOMING_ENTRIES[i];
      MONEY.forEach((f) => {
        expect(after[f], `${key(before)}.${f}`).toBe(before[f]);
      });
    });
  });

  it('leaves provenance feature vectors and manifests untouched', () => {
    preMigration.entries.forEach((before, i) => {
      expect(JSON.stringify(UPCOMING_ENTRIES[i]._provenance)).toBe(
        JSON.stringify(before._provenance)
      );
    });
  });

  it('changes exactly one pre-existing field across the whole file', () => {
    let changes = 0;
    preMigration.entries.forEach((before, i) => {
      const after = UPCOMING_ENTRIES[i];
      Object.keys(before).forEach((f) => {
        if (JSON.stringify(before[f]) !== JSON.stringify(after[f])) changes++;
      });
    });
    expect(changes).toBe(1);
  });

  it('the one change is the Luque–Gore division correction', () => {
    const before = preMigration.entries.find((e) => e.fighterA === 'Vicente Luque');
    const after = UPCOMING_ENTRIES.find((e) => e.fighterA === 'Vicente Luque');
    expect(before.division).toBe('Welterweight / Middleweight');
    expect(after.division).toBe('Middleweight');
  });
});

describe('UFC 330 migration — the data file is generator-stable', () => {
  // Guards against a hand-edit drifting the file away from what the migration
  // script produces. Same check CI can run via `node scripts/migrate-bout-context.mjs --check`.
  it('round-trips through the canonical serializer byte-for-byte', () => {
    const source = readFileSync(new URL('../upcomingData.js', import.meta.url), 'utf8');
    const prefix = 'export const UPCOMING_ENTRIES = ';
    expect(source.startsWith(prefix)).toBe(true);
    const parsed = JSON.parse(source.slice(prefix.length).replace(/;\s*$/, ''));
    expect(`${prefix}${JSON.stringify(parsed, null, 2)};\n`).toBe(source);
  });
});
