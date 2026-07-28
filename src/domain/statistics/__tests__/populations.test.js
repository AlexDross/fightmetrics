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
  const prop = {
    id: 'p1', side: 'Alpha', method: 'KO/TKO', fighterA: 'Alpha', fighterB: 'Bravo',
    eventName: 'SYN', eventDate: '2026-06-01', odds: '+150', units: 1, result: 'win',
  };
  const pendingProp = { ...prop, id: 'p2', result: '' };

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
    stats.computePropSummary([prop, pendingProp]);
    stats.computePropTypeBreakdown([prop, pendingProp]);
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
    const withPending = stats.computePropSummary([prop, pendingProp]);
    expect(withPending.graded).toBe(gradedOnly.graded);
    expectExact(withPending.netUnits, gradedOnly.netUnits, 'prop netUnits');
  });

  it('prop type breakdown also ignores pending picks', () => {
    const gradedOnly = stats.computePropTypeBreakdown([prop]);
    const withPending = stats.computePropTypeBreakdown([prop, pendingProp]);
    expectExact(withPending, gradedOnly, 'prop type breakdown');
  });

  it('parlay aggregates exclude pending and needs-review results', () => {
    const roi = [roiEntry({ id: 'r1', actualWinner: 'Alpha' })];
    const settled = { id: 'pl1', odds: '+300', units: 1, legs: [{ entryId: 'r1', side: 'Alpha' }] };
    // A leg whose entry is not in ROI cannot be resolved -> pending/needs review.
    const unresolved = { id: 'pl2', odds: '+300', units: 1, legs: [{ entryId: 'missing', side: 'Alpha' }] };

    const settledOnly = stats.computeParlaySummary([settled], roi);
    const withUnresolved = stats.computeParlaySummary([settled, unresolved], roi);
    expect(withUnresolved.graded).toBe(settledOnly.graded);
    expectExact(withUnresolved.netUnits, settledOnly.netUnits, 'parlay netUnits');
  });

  it('adding parlay records cannot change any ROI statistic', () => {
    const before = stats.computeROISummary(ENTRIES, new Set());
    stats.computeParlaySummary(
      [{ id: 'pl', odds: '+200', units: 1, legs: [] }],
      ENTRIES
    );
    expectExact(stats.computeROISummary(ENTRIES, new Set()), before, 'ROI summary after parlay activity');
  });

  it('computeParlayResult reads ROI entries without mutating them', () => {
    const roi = [roiEntry({ id: 'r1' })];
    const snapshot = structuredClone(roi);
    stats.computeParlayResult({ id: 'pl', odds: '+300', units: 1, legs: [{ entryId: 'r1', side: 'Alpha' }] }, roi);
    expectExact(roi, snapshot, 'ROI entries after computeParlayResult');
  });
});
