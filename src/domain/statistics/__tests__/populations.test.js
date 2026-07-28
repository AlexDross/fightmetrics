import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as stats from '../index.js';
import { expectExact } from '../../../__tests__/goldenSupport.js';

// Frozen entries only. No live prop or parlay data is imported anywhere here.
const INPUT = JSON.parse(fs.readFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..', '..', '..', '__tests__', 'inputs', 'statistics.input.json'
  ),
  'utf8'
));
const ENTRIES = INPUT.entries;

// A synthetic graded ROI entry with everything the v2 population requires.
const roiEntry = (over = {}) => ({
  id: 'syn-1', fighterA: 'Alpha', fighterB: 'Bravo',
  eventName: 'SYN', eventDate: '2026-06-01',
  oddsA: '-150', oddsB: '+130', marketOdds: '-150',
  fighterAProb: 0.62, fighterBProb: 0.38,
  v2pA: 0.61, v2pB: 0.39,
  predictedWinner: 'Alpha', trackedSide: 'Alpha', trackedProb: 0.61,
  betAction: 'LEAN', unitsWagered: 1, modelUsed: 'v2',
  actualWinner: 'Alpha',
  _provenance: { captureMode: 'live' },
  ...over,
});

// WHICH functions apply the live-only restriction, verified against the source
// rather than assumed. The `_provenance.captureMode === 'live'` filter appears
// in exactly two places:
//   computeModelVsMarketByBand (basis 'v2')
//   computeCalibrationReliability (basis 'v2')
// computeV2Summary does NOT filter -- it counts every graded entry carrying
// v2pA/v2pB regardless of capture mode. That is current behaviour and is
// characterised here, not corrected.
const differs = (a, b) => {
  try { expectExact(a, b, 'x'); return false; } catch { return true; }
};

describe('reconstructed entries and the v2 chart population', () => {
  const live = roiEntry({ id: 'live', _provenance: { captureMode: 'live' } });
  const recon = roiEntry({ id: 'recon', _provenance: { captureMode: 'reconstructed' } });

  it('v2 CALIBRATION excludes reconstructed entries', () => {
    expectExact(
      stats.computeCalibrationReliability([live, recon], 'v2'),
      stats.computeCalibrationReliability([live], 'v2'),
      'v2 calibration with a reconstructed row added'
    );
    expectExact(
      stats.computeCalibrationReliability([recon], 'v2'),
      stats.computeCalibrationReliability([], 'v2'),
      'reconstructed-only v2 calibration'
    );
  });

  it('v2 MODEL-VS-MARKET excludes reconstructed entries', () => {
    expectExact(
      stats.computeModelVsMarketByBand([live, recon], 'v2'),
      stats.computeModelVsMarketByBand([live], 'v2'),
      'v2 model-vs-market with a reconstructed row added'
    );
  });

  it('live v2 entries DO participate — the exclusion is not vacuous', () => {
    expect(
      differs(stats.computeCalibrationReliability([live], 'v2'),
              stats.computeCalibrationReliability([], 'v2')),
      'a live v2 entry did not affect v2 calibration'
    ).toBe(true);
  });

  it('the v1 basis is NOT restricted to live captures', () => {
    // v1 reads frozen historical values, so reconstructed rows legitimately
    // belong to its population. Asserting the asymmetry so it stays deliberate.
    expect(
      differs(stats.computeCalibrationReliability([live, recon], 'v1'),
              stats.computeCalibrationReliability([live], 'v1')),
      'v1 calibration unexpectedly ignored a reconstructed row'
    ).toBe(true);
  });

  it('CHARACTERISATION: computeV2Summary does NOT apply the live-only filter', () => {
    // Verified against the source: the filter lives in computeModelVsMarketByBand
    // and computeCalibrationReliability only. A reconstructed row DOES move the
    // v2 summary. Recorded as current behaviour so a future change is a
    // deliberate decision rather than a silent drift.
    expect(
      differs(stats.computeV2Summary([live, recon]), stats.computeV2Summary([live])),
      'computeV2Summary began filtering reconstructed rows'
    ).toBe(true);
  });

  it('the frozen 153-entry population contains both capture modes', () => {
    const modes = new Set(ENTRIES.map((e) => e._provenance?.captureMode));
    expect(modes.has('live')).toBe(true);
    expect(modes.has('reconstructed')).toBe(true);
  });
});

describe('props and parlays are isolated from model/ROI statistics', () => {
  // Production schema, verified against computePropSummary / propTypeOf:
  //   result is the uppercase enum WON | LOST | PUSH | PENDING
  //   stake (not `units`) is the wager field
  //   side 'A'|'B' + a method without ' or ' => propType 'Method of Victory'
  // An earlier revision of this file used `result: 'win'` and `units`, which
  // matched no branch at all -- every aggregate came back zero and every
  // exclusion assertion compared 0 to 0. The control assertions below exist to
  // make that failure mode impossible to reintroduce silently.
  const prop = {
    id: 'p1', side: 'A', method: 'KO/TKO', fighterA: 'Alpha', fighterB: 'Bravo',
    eventName: 'SYN', eventDate: '2026-06-01', odds: '+150', stake: 1, result: 'WON',
  };
  const pendingProp = { ...prop, id: 'p2', result: 'PENDING' };

  it('adding prop records cannot change any ROI or model statistic', () => {
    const base = {
      roi: stats.computeROISummary(ENTRIES, new Set()),
      v2: stats.computeV2Summary(ENTRIES),
      band: stats.computeRoiByMarketBand(ENTRIES),
      tier: stats.computeBetTierBreakdown(ENTRIES),
      pnl: stats.computeCumulativePnl(ENTRIES),
      monthly: stats.computeMonthlyPerformance(ENTRIES),
    };
    // Props live in a separate array entirely -- there is no call shape that
    // lets them reach these functions. Recomputing proves the populations are
    // physically separate rather than merely tagged.
    //
    // The prop call must do real work, otherwise "ROI is unchanged" is trivially
    // true because nothing happened. Assert the prop side is nonzero FIRST.
    const propSummary = stats.computePropSummary([prop, pendingProp]);
    const propBreakdown = stats.computePropTypeBreakdown([prop, pendingProp]);
    expect(propSummary.graded).toBe(1);
    expect(propSummary.wins).toBe(1);
    expectExact(propSummary.netUnits, 1.5, 'control prop netUnits');
    expect(propBreakdown).toHaveLength(1);
    expect(propBreakdown[0].count).toBe(1);

    for (const k of Object.keys(base)) {
      expectExact(
        { roi: stats.computeROISummary(ENTRIES, new Set()), v2: stats.computeV2Summary(ENTRIES),
          band: stats.computeRoiByMarketBand(ENTRIES), tier: stats.computeBetTierBreakdown(ENTRIES),
          pnl: stats.computeCumulativePnl(ENTRIES), monthly: stats.computeMonthlyPerformance(ENTRIES) }[k],
        base[k],
        `ROI statistic ${k} after prop activity`
      );
    }
  });

  it('pending props are excluded from graded prop aggregates', () => {
    const gradedOnly = stats.computePropSummary([prop]);

    // CONTROL: the graded pick genuinely participates. +150 -> decimal 2.5, so
    // a 1-unit winner returns 1.5 units of profit. If any of these regress to
    // 0 the exclusion assertion below stops meaning anything.
    expect(gradedOnly.graded).toBe(1);
    expect(gradedOnly.wins).toBe(1);
    expect(gradedOnly.staked).toBe(1);
    expectExact(gradedOnly.netUnits, 1.5, 'control prop netUnits');
    expectExact(gradedOnly.winRate, 100, 'control prop winRate');

    // EXCLUSION: adding the pending pick moves none of them.
    const withPending = stats.computePropSummary([prop, pendingProp]);
    expect(withPending.graded).toBe(gradedOnly.graded);
    expect(withPending.total).toBe(gradedOnly.total);
    expect(withPending.wins).toBe(gradedOnly.wins);
    expect(withPending.staked).toBe(gradedOnly.staked);
    expectExact(withPending.netUnits, gradedOnly.netUnits, 'prop netUnits');
    expectExact(withPending.winRate, gradedOnly.winRate, 'prop winRate');
    expectExact(withPending.roi, gradedOnly.roi, 'prop roi');
  });

  it('prop type breakdown also ignores pending picks', () => {
    const gradedOnly = stats.computePropTypeBreakdown([prop]);

    // CONTROL: exactly one real graded bucket, correctly typed and non-empty.
    // side 'A' + a method with no ' or ' resolves to 'Method of Victory'.
    expect(gradedOnly).toHaveLength(1);
    expect(gradedOnly[0].type).toBe('Method of Victory');
    expect(gradedOnly[0].count).toBe(1);
    expect(gradedOnly[0].decisive).toBe(1);
    expect(gradedOnly[0].wins).toBe(1);
    expect(gradedOnly[0].staked).toBe(1);
    expectExact(gradedOnly[0].netUnits, 1.5, 'control breakdown netUnits');

    // EXCLUSION: the pending pick adds no bucket and moves no bucket.
    const withPending = stats.computePropTypeBreakdown([prop, pendingProp]);
    expectExact(withPending, gradedOnly, 'prop type breakdown');
  });

  // Production parlay schema, verified against computeParlayResult /
  // computeParlaySummary: legs carry `fightId` + `pickedFighter` (matched
  // against roiEntry.id and roiEntry.actualWinner), the stake field is
  // `unitsWagered`, and the price field is `combinedOdds`. An earlier revision
  // used entryId/side/units/odds -- none of which any branch reads -- so every
  // parlay resolved PENDING and every aggregate was 0.
  const parlay = (over = {}) => ({
    id: 'pl1', combinedOdds: '+300', unitsWagered: 1,
    legs: [{ fightId: 'r1', pickedFighter: 'Alpha' }],
    ...over,
  });

  // r1 -> a clean Alpha win. r2 -> a DRAW, which isResolvedWinner treats as
  // resolved and isPushResult flags as a push, producing GRADED/NEEDS_REVIEW.
  const parlayRoi = () => [
    roiEntry({ id: 'r1', actualWinner: 'Alpha' }),
    roiEntry({ id: 'r2', actualWinner: 'DRAW' }),
  ];

  it('CONTROL: a settled parlay grades as a real WIN and moves the aggregate', () => {
    const roi = parlayRoi();
    const derived = stats.computeParlayResult(parlay(), roi);
    expect(derived.status).toBe('GRADED');
    expect(derived.result).toBe('WIN');
    expect(derived.resolvedLegs).toBe(1);
    expect(derived.totalLegs).toBe(1);

    // +300 -> decimal 4.0, so a 1-unit winner returns 3 units of profit.
    const summary = stats.computeParlaySummary([parlay()], roi);
    expect(summary.graded).toBe(1);
    expect(summary.wins).toBe(1);
    expect(summary.staked).toBe(1);
    expectExact(summary.netUnits, 3, 'control parlay netUnits');
    expectExact(summary.winRate, 100, 'control parlay winRate');
  });

  it('a leg with no matching ROI entry is genuinely PENDING', () => {
    const derived = stats.computeParlayResult(
      parlay({ id: 'pl-pending', legs: [{ fightId: 'missing', pickedFighter: 'Alpha' }] }),
      parlayRoi()
    );
    expect(derived.status).toBe('PENDING');
    expect(derived.result).toBe(null);
    expect(derived.resolvedLegs).toBe(0);
    expect(derived.totalLegs).toBe(1);
  });

  it('a leg resolved against a DRAW is genuinely GRADED/NEEDS_REVIEW', () => {
    const derived = stats.computeParlayResult(
      parlay({ id: 'pl-review', legs: [{ fightId: 'r2', pickedFighter: 'Alpha' }] }),
      parlayRoi()
    );
    expect(derived.status).toBe('GRADED');
    expect(derived.result).toBe('NEEDS_REVIEW');
    // Fully resolved -- NEEDS_REVIEW is a push outcome, not an unresolved one.
    expect(derived.resolvedLegs).toBe(1);
    expect(derived.legResults[0].pushed).toBe(true);
  });

  it('parlay aggregates exclude pending and needs-review results', () => {
    const roi = parlayRoi();
    const settled = parlay();
    const pending = parlay({ id: 'pl2', legs: [{ fightId: 'missing', pickedFighter: 'Alpha' }] });
    const needsReview = parlay({ id: 'pl3', legs: [{ fightId: 'r2', pickedFighter: 'Alpha' }] });

    // CONTROL: the settled parlay alone produces a nonzero aggregate.
    const settledOnly = stats.computeParlaySummary([settled], roi);
    expect(settledOnly.graded).toBe(1);
    expect(settledOnly.wins).toBe(1);
    expect(settledOnly.staked).toBe(1);
    expectExact(settledOnly.netUnits, 3, 'control parlay netUnits');

    // EXCLUSION: adding BOTH excluded states leaves it exactly unchanged.
    // NEEDS_REVIEW in particular must not fall into the LOSS bucket -- if it
    // did, netUnits would drop to 2.
    const withExcluded = stats.computeParlaySummary([settled, pending, needsReview], roi);
    expectExact(withExcluded, settledOnly, 'parlay summary with pending + needs-review added');
  });

  it('adding parlay records cannot change any ROI statistic', () => {
    const before = stats.computeROISummary(ENTRIES, new Set());

    // The parlay call must produce a real, nonzero summary, otherwise "ROI is
    // unchanged" holds for the uninteresting reason that nothing was graded.
    const roi = parlayRoi();
    const summary = stats.computeParlaySummary([parlay()], roi);
    expect(summary.graded).toBe(1);
    expectExact(summary.netUnits, 3, 'parlay netUnits during ROI isolation check');

    expectExact(stats.computeROISummary(ENTRIES, new Set()), before, 'ROI summary after parlay activity');
  });

  it('computeParlayResult reads ROI entries without mutating them', () => {
    const roi = parlayRoi();
    const snapshot = structuredClone(roi);

    // CONTROL: a valid settled parlay that actually resolves. Mutation-freedom
    // is only meaningful if the function reached the ROI entries at all.
    const derived = stats.computeParlayResult(parlay(), roi);
    expect(derived.status).toBe('GRADED');
    expect(derived.result).toBe('WIN');

    expectExact(roi, snapshot, 'ROI entries after computeParlayResult');
  });
});
