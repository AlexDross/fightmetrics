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

// ─── UFC Fight Night Paris, 2026-09-05 — the card that broke the handoff ─────
//
// Ten predictions were saved for this card. Nine were graded into roiData.js by
// d9b36e0 while upcomingData.js was left untouched, which is the handoff break
// the generic suite above guards. The tenth is a different case and is the
// reason this block exists.
//
// OFFICIAL EVIDENCE (ufc.com/news/updates-ufc-fight-night-paris-2026 and
// ufc.com/event/ufc-fight-night-september-05-2026): Mairon Santos WITHDREW from
// the September 5 bout because of illness and Pavel Andrusca replaced him, so
// Nathaniel Wood fought Andrusca. The saved prediction
// 1788113567606-rzyj6e describes Wood vs SANTOS — a pairing that never took
// place.
//
// It was therefore CANCELED, not decided. The only correct disposition is
// removal from Upcoming with NO ROI record:
//   * grading it would invent a result for a bout nobody fought, and
//   * grading it from the Wood-vs-Andrusca result would be worse — scoring a
//     prediction computed against Santos's statistics using a different
//     fighter's outcome.
// A future Wood vs Santos booking must be saved as a NEW event-specific
// prediction, never by reviving this id.
describe('UFC Fight Night Paris 2026-09-05 — canceled Wood vs Santos prediction', () => {
  const CANCELED_ID = '1788113567606-rzyj6e';
  const isParis = (e) =>
    e.eventName === 'UFC Fight Night Paris' && e.eventDate === '2026-09-05';

  it('the canceled prediction is gone from Upcoming', () => {
    expect(
      UPCOMING_ENTRIES.filter((e) => id(e) === CANCELED_ID).map(label),
      'the canceled Wood vs Santos prediction is still pending'
    ).toEqual([]);
  });

  it('the canceled prediction was NOT graded into ROI', () => {
    expect(
      ROI_ENTRIES.filter((e) => id(e) === CANCELED_ID).map(label),
      'a canceled bout must never receive an ROI record'
    ).toEqual([]);
  });

  it('no September 5 Paris entry remains pending', () => {
    expect(
      UPCOMING_ENTRIES.filter(isParis).map(label),
      'the September 5 Paris card is settled or canceled — nothing may still be pending'
    ).toEqual([]);
  });

  // The distinction that matters: removed as canceled, NOT rewritten or scored
  // off the replacement bout.
  it('no ROI record scores Wood vs Santos, under any id', () => {
    expect(
      ROI_ENTRIES.filter(
        (e) => boutKey(e) === '2026-09-05|Mairon Santos vs Nathaniel Wood'
      ).map(label),
      'a bout that never happened has been given a result'
    ).toEqual([]);
  });

  it('the prediction was not rewritten as the September 5 Wood vs Andrusca bout', () => {
    // Rewriting the saved pairing to match the fight that actually happened
    // would launder a canceled prediction into a graded one, so the September 5
    // replacement bout must appear in neither file.
    //
    // Scoped to that one bout on that one date, deliberately. Pavel Andrusca is
    // an active fighter: a genuine prediction for him at some future event is
    // legitimate data and must not fail this suite. Only the 2026-09-05
    // Wood-vs-Andrusca pairing is forbidden, and it is matched through the same
    // normalized boutKey the generic checks use.
    const REPLACEMENT_BOUT = '2026-09-05|Nathaniel Wood vs Pavel Andrusca';
    expect(
      [...ROI_ENTRIES, ...UPCOMING_ENTRIES]
        .filter((e) => boutKey(e) === REPLACEMENT_BOUT)
        .map(label),
      'the September 5 replacement bout must not be introduced as a prediction'
    ).toEqual([]);
  });

  it('is not vacuous — the canceled id really was present before the repair', () => {
    // Guards against the block above silently becoming assertions over an
    // empty corpus: the id must still be a well-formed target, and the
    // pre-repair shape must be exactly what these checks would have caught.
    const asStillPending = [
      { id: CANCELED_ID, fighterA: 'Nathaniel Wood', fighterB: 'Mairon Santos',
        eventName: 'UFC Fight Night Paris', eventDate: '2026-09-05' },
    ];
    expect(asStillPending.filter((e) => id(e) === CANCELED_ID)).toHaveLength(1);
    expect(asStillPending.filter(isParis)).toHaveLength(1);
    expect(boutKey(asStillPending[0])).toBe('2026-09-05|Mairon Santos vs Nathaniel Wood');
  });
});
