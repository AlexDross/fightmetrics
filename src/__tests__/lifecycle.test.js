import { describe, it, expect } from 'vitest';
// Frozen normalisation context -- see goldenSupport.frozenRoiEntry.
import {
  addPendingEntry, filterVisibleUpcoming, createGradedEntry, removePendingEntry,
} from '../domain/workflow/index.js';
import * as stats from '../domain/statistics/index.js';
import { loadFixture, expectExact, firstDifference, frozenRoiEntry } from './goldenSupport.js';

const { fighterFixtures } = loadFixture('fighters.golden.json');
const names = Object.keys(fighterFixtures);

// Composes the REAL production functions end to end -- no duplicated logic and
// no App.js import. This is the save -> Upcoming -> Grade -> ROI path the
// application performs, exercised through the same implementations.
const mkEntry = (fA, fB) => frozenRoiEntry({
  fA, fB, oddsA: '-150', oddsB: '+130',
  eventName: 'LIFECYCLE EVENT', eventDate: '2026-08-01',
  modelToggle: 'v2', unitsWagered: 1,
});

describe('save → Upcoming → Grade → ROI lifecycle', () => {
  it('carries the entry through every transition with its id and frozen fields intact', () => {
    const fA = fighterFixtures[names[0]];
    const fB = fighterFixtures[names[1]];

    // 1. build
    const built = mkEntry(fA, fB);
    expect(built.id).toBeTruthy();
    const snapshot = structuredClone(built);

    // 2. save to pending
    const pending = addPendingEntry([], built);
    expect(pending.map((e) => e.id)).toEqual([built.id]);

    // 3. visible while ungraded and in-window
    const visible = filterVisibleUpcoming(pending, [], '2026-08-02');
    expect(visible.map((e) => e.id)).toEqual([built.id]);

    // 4. grade
    const graded = createGradedEntry(visible[0], fA.FIGHTER);
    expect(graded.id).toBe(built.id);
    expect(graded.actualWinner).toBe(fA.FIGHTER);

    // 5. remove from pending
    const afterRemoval = removePendingEntry(pending, built.id);
    expect(afterRemoval).toEqual([]);

    // 5b. and once it is in ROI, the graded-id filter keeps it out for good
    expect(filterVisibleUpcoming(pending, [graded], '2026-08-02')).toEqual([]);

    // 6. every field carried from the build survives untouched, except
    // actualWinner. buildRoiEntry already stamps actualWinner: '' at save time,
    // so grading REPLACES that field rather than adding a new one -- verified
    // rather than assumed.
    expect(Object.hasOwn(snapshot, 'actualWinner')).toBe(true);
    expect(snapshot.actualWinner).toBe('');
    for (const k of Object.keys(snapshot)) {
      if (k === 'actualWinner') continue;
      expectExact(graded[k], snapshot[k], `field ${k} after grading`);
    }
    // No NEW keys at all: grading changes exactly one existing field.
    expect(Object.keys(graded).filter((k) => !Object.hasOwn(snapshot, k))).toEqual([]);
    expect(Object.keys(graded).sort()).toEqual(Object.keys(snapshot).sort());

    // 7. the graded entry is consumable by the real statistics functions
    const summary = stats.computeROISummary([graded], new Set());
    expect(summary).toBeTruthy();
  });
});

describe('freeze-at-save: a STORED entry is immune to later fighter-data change', () => {
  // The invariant applies only AFTER an entry has been built and stored. A
  // newly generated prediction is of course expected to change when inputs
  // change -- that is the model working.
  it('mutating current fighter data leaves the stored entry and its statistics identical', () => {
    const fA = structuredClone(fighterFixtures[names[0]]);
    const fB = structuredClone(fighterFixtures[names[1]]);

    const stored = mkEntry(fA, fB);
    const storedSnapshot = structuredClone(stored);
    const gradedBefore = createGradedEntry(stored, fA.FIGHTER);
    const statsBefore = {
      roi: stats.computeROISummary([gradedBefore], new Set()),
      v2: stats.computeV2Summary([gradedBefore]),
      band: stats.computeRoiByMarketBand([gradedBefore]),
      tier: stats.computeBetTierBreakdown([gradedBefore]),
      pnl: stats.computeCumulativePnl([gradedBefore]),
      monthly: stats.computeMonthlyPerformance([gradedBefore]),
      calV1: stats.computeCalibrationReliability([gradedBefore], 'v1'),
      calV2: stats.computeCalibrationReliability([gradedBefore], 'v2'),
    };

    // Now change the CURRENT fighter objects in every way that feeds the model.
    fA.ELO = (fA.ELO ?? 1500) + 250;
    fA.RAW_ELO = (fA.RAW_ELO ?? 1500) + 250;
    fA.SIG_STR_ACC = (fA.SIG_STR_ACC ?? 0.4) + 0.2;
    fA.DAYS_SINCE_LAST = (fA.DAYS_SINCE_LAST ?? 100) + 400;
    fA.FIGHT_HISTORY = [
      { dt: '2026-07-01', op: 'Someone New', re: 'W', me: 'KO/TKO', rn: 1, ti: '1:00', wc: 'Welterweight', tb: false, ev: 'Fabricated' },
      ...(fA.FIGHT_HISTORY ?? []),
    ];
    fB.ELO = (fB.ELO ?? 1500) - 150;
    fB.CREDIBILITY = 5;

    // Re-read, re-grade and re-aggregate the STORED entry.
    const gradedAfter = createGradedEntry(storedSnapshot, fA.FIGHTER);
    expectExact(gradedAfter, gradedBefore, 'graded stored entry after fighter mutation');

    const statsAfter = {
      roi: stats.computeROISummary([gradedAfter], new Set()),
      v2: stats.computeV2Summary([gradedAfter]),
      band: stats.computeRoiByMarketBand([gradedAfter]),
      tier: stats.computeBetTierBreakdown([gradedAfter]),
      pnl: stats.computeCumulativePnl([gradedAfter]),
      monthly: stats.computeMonthlyPerformance([gradedAfter]),
      calV1: stats.computeCalibrationReliability([gradedAfter], 'v1'),
      calV2: stats.computeCalibrationReliability([gradedAfter], 'v2'),
    };
    for (const k of Object.keys(statsBefore)) {
      expectExact(statsAfter[k], statsBefore[k], `statistics.${k} after fighter mutation`);
    }
  });

  it('a NEWLY built entry does change when inputs change — the contrast case', () => {
    const fA = structuredClone(fighterFixtures[names[0]]);
    const fB = structuredClone(fighterFixtures[names[1]]);
    const before = mkEntry(fA, fB);
    fA.ELO = (fA.ELO ?? 1500) + 400;
    fA.RAW_ELO = (fA.RAW_ELO ?? 1500) + 400;
    const after = mkEntry(fA, fB);
    // Not a bug: this is the model responding to new inputs. Freeze-at-save is
    // about STORED entries, not about generation.
    expect(firstDifference(after.fighterAProb, before.fighterAProb)).not.toBeNull();
  });
});
