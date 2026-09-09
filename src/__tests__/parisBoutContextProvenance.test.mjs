// UFC FIGHT NIGHT PARIS (2026-09-05) — GRADED bout-context provenance.
//
// These nine records live in roiData.js. They were saved as pending predictions
// without an official bout-context citation (boutContext.provenance null in
// both locations), then graded into ROI once the card was scored. This suite
// asserts the retrospective provenance repair survived that handoff intact.
//
// As a retrospective repair the official UFC Paris event page was retrieved on
// 2026-08-31 (before the event) and recorded as the authoritative bout-context
// source in the top-level `boutContext`. The capture-time copy
// `_provenance.boutContext` (see legacyFieldMap.mjs) stays `null` — it is the
// immutable record of what was actually saved, and must not be back-filled.
//
// Official source (retrieved 2026-08-31):
//   https://www.ufc.com/event/ufc-fight-night-september-05-2026
// The page directly confirms the event, date, these matchups and each bout's
// weight class. It does NOT print scheduled-round counts; those are PRESERVED
// EXISTING DATA (unchanged from the saved prediction), asserted here only to
// prove the repair left them untouched — not sourced from the page.
//
// TEN predictions were saved for this card; only NINE are graded here. The
// tenth, 1788113567606-rzyj6e (Nathaniel Wood vs Mairon Santos), was CANCELED:
// Santos withdrew ill and Pavel Andrusca replaced him, so the predicted pairing
// never took place. It carries no result and no ROI record by design — see
// src/data/__tests__/gradingHandoffIntegrity.test.mjs, which owns that case.
import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../roiData.js';

const OFFICIAL_PROVENANCE = Object.freeze({
  sourceUrl: 'https://www.ufc.com/event/ufc-fight-night-september-05-2026',
  retrievedAt: '2026-08-31',
  authority: 'official',
});

// id -> [fighterA, fighterB, division, isTitleBout, scheduledRounds].
// Division/title from the official card; scheduledRounds is preserved data.
// The canceled Wood vs Santos id is deliberately absent.
const EXPECTED = Object.freeze({
  '1788113894317-eyd93n': ['Fares Ziam', 'Axel Sola', 'Lightweight', false, 3],
  '1788113867291-ddu65l': ['Michael Page', 'Nursulton Ruziboev', 'Middleweight', false, 3],
  '1788113824839-en4kku': ['Daniil Donchenko', 'Punahele Soriano', 'Welterweight', false, 3],
  '1788113750264-ecu5sq': ['Morgan Charriere', 'Felipe Lima', 'Featherweight', false, 3],
  '1788113726505-npbiqu': ['Losene Keita', 'Muhammad Naimov', 'Featherweight', false, 3],
  '1788113692721-sn1x0a': ['Mario Pinto', 'Ryan Spann', 'Heavyweight', false, 3],
  '1788113652337-w1rpf3': ['Kurtis Campbell', 'Trevor Peek', 'Featherweight', false, 3],
  '1788113604226-q10tyu': ['Oumar Sy', 'Modestas Bukauskas', 'Light Heavyweight', false, 3],
  '1788113526622-bh9bbh': ['Nora Cornolle', 'Klaudia Sygula', "Women's Bantamweight", false, 3],
});

const PARIS = ROI_ENTRIES.filter(
  (e) => e.eventName === 'UFC Fight Night Paris' && e.eventDate === '2026-09-05'
);
const byId = new Map(PARIS.map((e) => [String(e.id), e]));

describe('UFC Fight Night Paris graded bout-context provenance — official, split by location', () => {
  it('is exactly the nine graded ROI Paris IDs, dated 2026-09-05', () => {
    expect(PARIS.length).toBe(9);
    expect([...byId.keys()].sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it('the canceled Wood vs Santos prediction is not among them', () => {
    expect(byId.has('1788113567606-rzyj6e')).toBe(false);
  });

  it('top-level boutContext.provenance is exactly the official UFC Paris citation', () => {
    for (const id of Object.keys(EXPECTED)) {
      expect(byId.get(id), id).toBeDefined();
      expect(byId.get(id).boutContext.provenance, `${id} top-level`).toEqual(OFFICIAL_PROVENANCE);
    }
  });

  it('capture-time _provenance.boutContext.provenance remains null (retrospective repair)', () => {
    for (const id of Object.keys(EXPECTED)) {
      expect(byId.get(id)._provenance.boutContext.provenance, `${id} capture-time`).toBeNull();
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
      expect(e.boutContext.division, `${id} vs top-level division`).toBe(e.division);
    }
  });

  it('grading preserved the citation: every one of the nine is a settled record', () => {
    // The provenance above must have survived the Upcoming -> ROI handoff, so
    // assert these really are the graded copies and not a pending leftover.
    for (const id of Object.keys(EXPECTED)) {
      const e = byId.get(id);
      expect(e.actualWinner, `${id} actualWinner`).toBeTruthy();
      expect([e.fighterA, e.fighterB], `${id} winner is one of the two corners`)
        .toContain(e.actualWinner);
    }
  });

  it('non-vacuous: a null or placeholder top-level provenance would fail the exact check', () => {
    const clone = structuredClone(PARIS[0]);
    clone.boutContext.provenance = null;
    expect(clone.boutContext.provenance).not.toEqual(OFFICIAL_PROVENANCE);
    clone.boutContext.provenance = { sourceUrl: 'x', retrievedAt: 'y', authority: 'z' };
    expect(clone.boutContext.provenance).not.toEqual(OFFICIAL_PROVENANCE);
  });
});
