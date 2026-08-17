// Deliberately a .test.mjs file. This suite VERIFIES THE COMMITTED DATA FILES,
// so it must read the real roiData.js / upcomingData.js -- the same reason
// src/data/migration/__tests__/legacyFieldMap.test.mjs reads them. The
// direct-import guard in isolation.test.js scans .test.js files, whose job is
// to stay free of date-derived live state; these arrays are static committed
// data and carry no Date.now() dependency, so there is nothing here to drift.
//
// RE-SCOPED after the UFC 330 grading handoff (2026-08-17).
//
// This guard was written while UFC 330 was the PENDING card, so it read
// UPCOMING_ENTRIES. The card has since been contested and graded, and the
// handoff moved those ten records into roiData.js -- which is the whole point
// of `migrateV0ToV1`'s rule that "ROI and Upcoming updates must be committed
// together". The guard therefore FOLLOWS THE RECORDS: same official table, same
// frozen-field set, same provenance requirement, now held against the graded
// ROI rows. Nothing was weakened to make it pass; the frozen-field comparison
// is strictly wider than before because it now also pins the ids, the staked
// units and the official provenance block.
//
// TWO VERSIONS EXIST AND BOTH ARE PRESERVED:
//   INITIAL  - upcoming.preMigration.json, the August 10/12 predictions
//              (capturedFrom ed0ebff4). Still the authoritative record of what
//              was first predicted. Never overwritten, asserted intact below.
//   FINAL    - upcoming.finalPreFight.json, the August 15 19:41-19:46Z refresh
//              the user intentionally finalised before building the UFC 330
//              props and parlay. This is the version the graded ROI records
//              must match, and it is the one this suite compares against.
import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../roiData.js';
import { UPCOMING_ENTRIES } from '../upcomingData.js';
import { normalizeBoutContext, validateBoutContext } from '../domain/boutContext/index.js';
import preMigration from './snapshots/upcoming.preMigration.json';
import finalPreFight from './snapshots/upcoming.finalPreFight.json';

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

// The ten graded records, in their committed roiData.js order. That order is a
// save-order fact about the file and is pinned separately from the official
// CARD order above, which is a fact about the event; conflating the two is what
// made the pre-handoff version of this suite look like an ordering failure.
const GRADED = ROI_ENTRIES.filter((e) => e.eventName === 'UFC 330');
const key = (e) => `${e.fighterA}|${e.fighterB}`;
const byKey = (list) => new Map(list.map((e) => [key(e), e]));
const GRADED_BY_KEY = byKey(GRADED);
const FINAL_BY_KEY = byKey(finalPreFight.entries);

// Grading is the ONLY thing allowed to differ between the final pre-fight
// snapshot and the graded ROI record.
const GRADING_FIELDS = new Set(['actualWinner', 'actualFinish']);

describe('UFC 330 bout context — official values', () => {
  it('the graded set is exactly the ten official matchups', () => {
    expect(GRADED.length).toBe(10);
    expect([...GRADED_BY_KEY.keys()].sort()).toEqual(
      OFFICIAL.map(([a, b]) => `${a}|${b}`).sort()
    );
  });

  it('carries the official division, title status and round count on all ten', () => {
    OFFICIAL.forEach(([a, b, division, isTitleBout, scheduledRounds]) => {
      const e = GRADED_BY_KEY.get(`${a}|${b}`);
      expect(e, `${a} vs ${b} missing from ROI`).toBeDefined();
      expect(e.boutContext, `${a} vs ${b} boutContext`).toBeDefined();
      expect(e.boutContext.division, `${a} vs ${b} division`).toBe(division);
      expect(e.boutContext.isTitleBout, `${a} vs ${b} title`).toBe(isTitleBout);
      expect(e.boutContext.scheduledRounds, `${a} vs ${b} rounds`).toBe(scheduledRounds);
    });
  });

  it('records official provenance on every entry', () => {
    GRADED.forEach((e) => {
      expect(e.boutContext.provenance, `${key(e)} provenance`).not.toBeNull();
      expect(e.boutContext.provenance.authority).toBe('official');
      expect(e.boutContext.provenance.retrievedAt).toBe('2026-08-14');
      expect(e.boutContext.provenance.sourceUrl).toMatch(/^https:\/\/www\.ufc\.com\//);
    });
  });

  it('has exactly two title bouts', () => {
    const titles = GRADED.filter((e) => e.boutContext.isTitleBout === true);
    expect(titles.length).toBe(2);
    expect(titles.map((e) => e.fighterA).sort()).toEqual(['Islam Makhachev', 'Mackenzie Dern']);
  });

  it('has exactly two five-round bouts and eight three-round bouts', () => {
    const five = GRADED.filter((e) => e.boutContext.scheduledRounds === 5);
    const three = GRADED.filter((e) => e.boutContext.scheduledRounds === 3);
    expect(five.length).toBe(2);
    expect(three.length).toBe(8);
    expect(five.length + three.length).toBe(GRADED.length);
  });

  it('every stored context is internally consistent', () => {
    GRADED.forEach((e) => {
      const r = validateBoutContext(e.boutContext);
      expect(r.valid, `${key(e)}: ${r.errors.join('; ')}`).toBe(true);
      expect(r.warnings, `${key(e)}`).toEqual([]);
    });
  });

  it('stores nothing that normalisation would reject', () => {
    GRADED.forEach((e) => {
      expect(normalizeBoutContext(e.boutContext)).toEqual(e.boutContext);
    });
  });

  it('does not leave any entry with unknown context', () => {
    GRADED.forEach((e) => {
      expect(e.boutContext.division, key(e)).not.toBeNull();
      expect(e.boutContext.isTitleBout, key(e)).not.toBeNull();
      expect(e.boutContext.scheduledRounds, key(e)).not.toBeNull();
    });
  });
});

describe('UFC 330 — the INITIAL prediction version is preserved', () => {
  // The August 15 refresh is the FINAL version, but the initial one remains a
  // first-class historical record. If a future change ever rewrites it, this
  // fails rather than letting the audit trail collapse to a single version.
  it('the August 10/12 snapshot still exists, unchanged', () => {
    expect(preMigration.capturedFrom).toBe('ed0ebff43662120fc109c49f25385ac31d335174');
    expect(preMigration.entries.length).toBe(10);
    expect(preMigration.entries.every((e) => /^17865(4|7)|^17863/.test(String(e.id)))).toBe(true);
  });

  it('is a genuinely different version from the final one', () => {
    const initialIds = preMigration.entries.map((e) => e.id).sort();
    const finalIds = finalPreFight.entries.map((e) => e.id).sort();
    expect(initialIds).not.toEqual(finalIds);
    expect(initialIds.some((id) => finalIds.includes(id))).toBe(false);
  });

  it('covers the same ten matchups under both versions', () => {
    expect(preMigration.entries.map(key).sort()).toEqual(
      finalPreFight.entries.map(key).sort()
    );
  });
});

describe('UFC 330 — frozen fields did not move (final pre-fight → graded ROI)', () => {
  it('the final pre-fight snapshot is the August 15 refresh', () => {
    expect(finalPreFight.version).toBe('final-pre-fight');
    expect(finalPreFight.entries.length).toBe(10);
    expect(finalPreFight.provenance.refreshCommit.sha).toBe('65f32e1');
    expect(finalPreFight.provenance.gradingCommit.sha).toBe('3a67be6');
  });

  it('keeps the newer 1786823… ids, which the props and parlay reference', () => {
    finalPreFight.entries.forEach((e) => {
      expect(String(e.id)).toMatch(/^178682[23]/);
      expect(GRADED_BY_KEY.get(key(e)).id, `${key(e)} id`).toBe(e.id);
    });
  });

  // The heart of the guarantee: every field in the final pre-fight version is
  // value-identical in the graded record, except the grading outcomes.
  // Compared by JSON round-trip so nested provenance and feature vectors are
  // covered too.
  it('every pre-fight field is value-identical in the graded record', () => {
    expect(FINAL_BY_KEY.size).toBe(10);
    FINAL_BY_KEY.forEach((before, k) => {
      const after = GRADED_BY_KEY.get(k);
      expect(after, `${k} missing from ROI`).toBeDefined();
      for (const field of Object.keys(before)) {
        if (GRADING_FIELDS.has(field)) continue;
        expect(JSON.stringify(after[field]), `${k}.${field} must not change`)
          .toBe(JSON.stringify(before[field]));
      }
    });
  });

  it('adds no field to the graded shape beyond the snapshot', () => {
    FINAL_BY_KEY.forEach((before, k) => {
      const added = Object.keys(GRADED_BY_KEY.get(k)).filter(
        (f) => !Object.prototype.hasOwnProperty.call(before, f)
      );
      expect(added, `${k} gained fields`).toEqual([]);
    });
  });

  it('no saved probability, odds or market value moved', () => {
    const MONEY = ['fighterAProb', 'fighterBProb', 'predictedProb', 'trackedProb',
      'v2pA', 'v2pB', 'oddsA', 'oddsB', 'marketOdds', 'edge', 'edgeA', 'edgeB',
      'ev', 'evA', 'evB', 'kelly', 'kellyA', 'kellyB', 'fairLine', 'fairLineA',
      'fairLineB', 'betRecommendedOdds', 'betRecommendedFighter', 'betAction',
      'predictedWinner', 'trackedSide', 'bestBet'];
    FINAL_BY_KEY.forEach((before, k) => {
      const after = GRADED_BY_KEY.get(k);
      MONEY.forEach((f) => {
        expect(JSON.stringify(after[f]), `${k}.${f}`).toBe(JSON.stringify(before[f]));
      });
    });
  });

  it('leaves provenance, feature vectors and manifests untouched', () => {
    FINAL_BY_KEY.forEach((before, k) => {
      expect(JSON.stringify(GRADED_BY_KEY.get(k)._provenance), `${k}._provenance`)
        .toBe(JSON.stringify(before._provenance));
    });
  });

  it('carries no duplicated _provenance.boutContext graft', () => {
    // Present on 0 of the 168 non-UFC-330 ROI records; it was an accidental
    // by-product of the refresh, never part of the schema.
    GRADED.forEach((e) => {
      expect(e._provenance.boutContext, `${key(e)}`).toBeUndefined();
    });
    finalPreFight.entries.forEach((e) => {
      expect(e._provenance.boutContext, `snapshot ${key(e)}`).toBeUndefined();
    });
  });

  it('stores the user-ratified unitsWagered of 1 on all ten', () => {
    // Explicit user decision of 2026-08-17, including both NO BET records
    // (Neil Magny vs Ramiz Brahimaj; Jeremiah Wells vs Myktybek Orolbai),
    // whose pre-handoff Upcoming copies held 0.5 and 2. Ratified, not inferred.
    GRADED.forEach((e) => expect(e.unitsWagered, key(e)).toBe(1));
    finalPreFight.entries.forEach((e) => expect(e.unitsWagered, key(e)).toBe(1));
  });
});

describe('UFC 330 — grading outcomes, asserted separately from frozen fields', () => {
  it('every graded record carries an actual winner', () => {
    GRADED.forEach((e) => {
      expect(String(e.actualWinner ?? '').trim(), key(e)).not.toBe('');
      expect([e.fighterA, e.fighterB], `${key(e)} winner is a participant`)
        .toContain(e.actualWinner);
    });
  });

  it('the final pre-fight snapshot holds no grading outcome', () => {
    finalPreFight.entries.forEach((e) => {
      expect(e.actualWinner, key(e)).toBe('');
      expect(e.actualFinish, key(e)).toBe('');
    });
  });

  it('the handoff is complete: nothing UFC 330 is still pending', () => {
    expect(UPCOMING_ENTRIES.filter((e) => e.eventName === 'UFC 330')).toEqual([]);
  });
});
