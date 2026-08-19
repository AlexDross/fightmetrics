// GRADING HANDOFF INTEGRITY — a fast, direct guard on the committed data files.
//
// Grading is a HANDOFF: a saved prediction moves from upcomingData.js to
// roiData.js, keeping its identity, and both halves must land in the same
// commit (see src/data/migration/migrateV0ToV1.mjs). On 2026-08-15/17 only the
// ROI half landed. The consequences surfaced as 51 failures spread across seven
// unrelated-looking suites — a wall of downstream UUID collisions and
// relational errors that named neither the offending bout nor the file.
//
// This suite exists so that failure mode is reported in one line, at its cause.
// It reads the data files directly, runs in milliseconds, and every assertion
// names the offending legacy id and matchup.
import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../../roiData.js';
import { UPCOMING_ENTRIES } from '../../upcomingData.js';
import { PROP_PICKS } from '../../propPicksData.js';
import { PARLAY_ENTRIES } from '../../parlayData.js';
import finalPreFight from '../../__tests__/snapshots/upcoming.finalPreFight.json';

const id = (e) => String(e?.id ?? '');
const matchup = (e) => `${e.fighterA} vs ${e.fighterB}`;
const label = (e) => `${id(e)} (${matchup(e)}, ${e.eventName} ${e.eventDate})`;
// A bout's real-world identity, independent of whichever id a save assigned it.
const boutKey = (e) =>
  `${e.eventDate}|${[String(e.fighterA).trim(), String(e.fighterB).trim()].sort().join(' vs ')}`;

describe('grading handoff integrity — ROI and Upcoming', () => {
  it('1. no legacy id appears in both roiData.js and upcomingData.js', () => {
    const roiById = new Map(ROI_ENTRIES.map((e) => [id(e), e]));
    const offenders = UPCOMING_ENTRIES.filter((e) => roiById.has(id(e))).map(
      (e) => `${label(e)} — also graded in roiData.js as ${matchup(roiById.get(id(e)))}`
    );
    expect(offenders, 'a graded record was left in Upcoming; commit both halves of the handoff').toEqual([]);
  });

  it('2. no bout appears in both files, even under different ids', () => {
    // The id-collision check above is blind to a re-save that also re-issues
    // the id — which is exactly what happened here: the refresh minted new
    // 1786823… ids, so for two days the same ten bouts sat in both files
    // *without* colliding. Identity is the event date plus the fighter pair.
    const roiByBout = new Map(ROI_ENTRIES.map((e) => [boutKey(e), e]));
    const offenders = UPCOMING_ENTRIES.filter((e) => roiByBout.has(boutKey(e))).map((e) => {
      const g = roiByBout.get(boutKey(e));
      return `${matchup(e)} on ${e.eventDate} is pending as ${id(e)} and graded as ${id(g)}`;
    });
    expect(offenders, 'the same bout is both pending and graded').toEqual([]);
  });

  it('3. the handoff preserved every record id', () => {
    // The final pre-fight version and its graded record are the same saved
    // prediction; grading must not mint a new identity, or every reference
    // held by a prop or a parlay leg silently detaches.
    const gradedIds = new Set(ROI_ENTRIES.map(id));
    const offenders = finalPreFight.entries
      .filter((e) => !gradedIds.has(id(e)))
      .map((e) => `${label(e)} — final pre-fight id is absent from roiData.js`);
    expect(offenders, 'grading changed a record id').toEqual([]);
  });

  it('4. no record loses its official bout-context provenance', () => {
    // A refresh nulled `boutContext.provenance` on all ten records, discarding
    // the official UFC weigh-in citation. Any record that carries a
    // boutContext must carry its source with it.
    const offenders = [];
    for (const [file, list] of [['roiData.js', ROI_ENTRIES], ['upcomingData.js', UPCOMING_ENTRIES]]) {
      for (const e of list) {
        if (!e.boutContext) continue;
        const p = e.boutContext.provenance;
        if (!p || !p.authority || !p.sourceUrl || !p.retrievedAt) {
          offenders.push(`${file}: ${label(e)} — boutContext.provenance is ${JSON.stringify(p)}`);
        }
      }
    }
    expect(offenders, 'official bout-context provenance was lost').toEqual([]);
  });

  it('5. every graded record still matches its final pre-fight snapshot', () => {
    // Immutable pre-fight fields only; grading outcomes are excluded by design
    // and are asserted separately in upcomingBoutContext.test.mjs.
    const GRADING = new Set(['actualWinner', 'actualFinish']);
    const roiById = new Map(ROI_ENTRIES.map((e) => [id(e), e]));
    const offenders = [];
    for (const before of finalPreFight.entries) {
      const after = roiById.get(id(before));
      if (!after) { offenders.push(`${label(before)} — missing from roiData.js`); continue; }
      for (const f of Object.keys(before)) {
        if (GRADING.has(f)) continue;
        const b = JSON.stringify(before[f]);
        const a = JSON.stringify(after[f]);
        if (a !== b) offenders.push(`${label(before)} — ${f}: ${b} → ${a}`);
      }
    }
    expect(offenders, 'a graded record drifted from its final pre-fight snapshot').toEqual([]);
  });

  it('6. every prop and parlay reference resolves to exactly one record', () => {
    // The reason ids must survive the handoff, stated as data: a dangling
    // upcomingId or fightId is how a graded card silently loses its wagers.
    const byId = new Map([...ROI_ENTRIES, ...UPCOMING_ENTRIES].map((e) => [id(e), e]));
    const offenders = [];
    for (const p of PROP_PICKS) {
      if (p.upcomingId && !byId.has(String(p.upcomingId))) {
        offenders.push(`prop ${p.id} → missing prediction ${p.upcomingId}`);
      }
    }
    for (const parlay of PARLAY_ENTRIES) {
      for (const leg of parlay.legs ?? []) {
        if (leg.fightId && !byId.has(String(leg.fightId))) {
          offenders.push(`parlay ${parlay.id} leg → missing prediction ${leg.fightId}`);
        }
      }
    }
    expect(offenders, 'a prop or parlay reference is dangling').toEqual([]);
  });

  it('is not vacuous — it catches a reintroduced handoff break', () => {
    // Proves the checks above would actually fire, so a future refactor cannot
    // quietly turn them into assertions over empty arrays.
    const graded = ROI_ENTRIES[0];
    const reintroduced = [{ ...graded }];
    const roiById = new Map(ROI_ENTRIES.map((e) => [id(e), e]));
    expect(reintroduced.filter((e) => roiById.has(id(e)))).toHaveLength(1);

    const reIssued = [{ ...graded, id: '4102444800000-reissu' }];
    const roiByBout = new Map(ROI_ENTRIES.map((e) => [boutKey(e), e]));
    expect(reIssued.filter((e) => roiByBout.has(boutKey(e)))).toHaveLength(1);

    const stripped = { ...graded, boutContext: { ...graded.boutContext, provenance: null } };
    expect(Boolean(stripped.boutContext.provenance)).toBe(false);
  });
});
