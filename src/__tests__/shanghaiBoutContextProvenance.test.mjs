// UFC FIGHT NIGHT SHANGHAI (2026-08-29) — bout-context provenance, split by
// authority location (top-level vs capture-time).
//
// These seven bouts were saved on 2026-08-25 WITHOUT an official bout-context
// citation, then graded into roiData.js on 2026-08-29. The Upcoming→ROI handoff
// was completed later; as part of that repair the official UFC event page was
// retrieved on 2026-08-30 and recorded as the authoritative bout-context source.
//
// Provenance lives in two places (see legacyFieldMap.mjs):
//   • top-level `boutContext`            — the authoritative record; this is
//     where a LATER, retrospective provenance repair belongs.
//   • `_provenance.boutContext`          — the immutable CAPTURE-TIME copy of
//     what was actually saved on 2026-08-25. No citation existed then, so it
//     stays `null`. Back-dating the 2026-08-30 retrieval into it would falsify
//     the capture-time audit record.
//
// Official source (retrieved 2026-08-30):
//   https://www.ufc.com/event/ufc-fight-night-august-29-2026
// The page directly confirms the event, the date, the seven matchups and each
// bout's weight class. It does NOT print scheduled-round counts; those values
// are PRESERVED EXISTING DATA (unchanged from the saved prediction), asserted
// here only to prove the repair left them untouched — not sourced from the page.
import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../roiData.js';
import { UPCOMING_ENTRIES } from '../upcomingData.js';

const OFFICIAL_PROVENANCE = Object.freeze({
  sourceUrl: 'https://www.ufc.com/event/ufc-fight-night-august-29-2026',
  retrievedAt: '2026-08-30',
  authority: 'official',
});

// id -> [fighterA, fighterB, division, isTitleBout, scheduledRounds].
// Division/title come from the official card; scheduledRounds is preserved
// existing data (the page does not state round counts).
const EXPECTED = Object.freeze({
  '1787667170132-98mcer': ['Umar Nurmagomedov', 'Song Yadong', 'Bantamweight', false, 5],
  '1787667134251-th9rxt': ['Yan Xiaonan', 'Denise Gomes', "Women's Strawweight", false, 3],
  '1787667091537-zp1qoi': ['Aoriqileng', 'Kai Asakura', 'Bantamweight', false, 3],
  '1787667001038-dqfphx': ['Alex Perez', 'Sumudaerji', 'Flyweight', false, 3],
  '1787666883764-9cj36y': ['Rei Tsuruya', 'Kevin Borjas', 'Flyweight', false, 3],
  '1787666847181-pd2xm6': ['Jack Jenkins', 'Sean Woodson', 'Featherweight', false, 3],
  '1787666819170-tlx6d2': ['Xiong Jingnan', 'Julia Polastri', "Women's Strawweight", false, 3],
});

const SHANGHAI = ROI_ENTRIES.filter(
  (e) => e.eventName === 'UFC Fight Night Shanghai' && e.eventDate === '2026-08-29'
);
const byId = new Map(SHANGHAI.map((e) => [String(e.id), e]));

describe('UFC Fight Night Shanghai bout-context provenance — official, split by location', () => {
  it('is exactly the seven expected graded Shanghai IDs', () => {
    expect(SHANGHAI.length).toBe(7);
    expect([...byId.keys()].sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it('the handoff is complete: nothing Shanghai is still pending in Upcoming', () => {
    expect(UPCOMING_ENTRIES.filter((e) => e.eventName === 'UFC Fight Night Shanghai')).toEqual([]);
  });

  it('top-level boutContext.provenance is exactly the official UFC citation', () => {
    for (const id of Object.keys(EXPECTED)) {
      const e = byId.get(id);
      expect(e, id).toBeDefined();
      expect(e.boutContext.provenance, `${id} top-level`).toEqual(OFFICIAL_PROVENANCE);
    }
  });

  it('capture-time _provenance.boutContext.provenance remains null (citation established retrospectively)', () => {
    for (const id of Object.keys(EXPECTED)) {
      const e = byId.get(id);
      // The saved 2026-08-25 record carried no citation; the 2026-08-30
      // retrieval must not be back-dated into the capture-time audit copy.
      expect(e._provenance.boutContext.provenance, `${id} capture-time`).toBeNull();
    }
  });

  it('division, title status and scheduled rounds are unchanged preserved data (both locations)', () => {
    for (const [id, [fa, fb, division, isTitleBout, scheduledRounds]] of Object.entries(EXPECTED)) {
      const e = byId.get(id);
      expect([e.fighterA, e.fighterB], id).toEqual([fa, fb]);
      for (const bc of [e.boutContext, e._provenance.boutContext]) {
        expect(bc.division, `${id} division`).toBe(division);
        expect(bc.isTitleBout, `${id} isTitleBout`).toBe(isTitleBout);
        expect(bc.scheduledRounds, `${id} scheduledRounds`).toBe(scheduledRounds);
      }
      // top-level display division stays consistent with boutContext.
      expect(e.boutContext.division, `${id} vs top-level division`).toBe(e.division);
    }
  });

  it('non-vacuous: a null or placeholder top-level provenance would fail the exact check', () => {
    const clone = structuredClone(SHANGHAI[0]);
    clone.boutContext.provenance = null;
    expect(clone.boutContext.provenance).not.toEqual(OFFICIAL_PROVENANCE);
    clone.boutContext.provenance = { sourceUrl: 'x', retrievedAt: 'y', authority: 'z' };
    expect(clone.boutContext.provenance).not.toEqual(OFFICIAL_PROVENANCE);
  });
});
