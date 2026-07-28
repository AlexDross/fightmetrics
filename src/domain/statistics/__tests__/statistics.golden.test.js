import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as stats from '../index.js';
import { loadFixture, expectExact } from '../../../__tests__/goldenSupport.js';

// Inputs come from the FROZEN file, never from roiData.js / fightersData.js /
// prospectsData.js / the assembled FIGHTERS collection / App.js. The isolation
// guard in src/__tests__/isolation.test.js enforces that.
const INPUT = JSON.parse(fs.readFileSync(
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..', '..', '..', '__tests__', 'inputs', 'statistics.input.json'
  ),
  'utf8'
));
const GOLDEN = loadFixture('statistics.golden.json');

const prospectSet = new Set(INPUT.prospectNames);
const populations = {
  all: INPUT.entries,
  [`since_${INPUT.since}`]: INPUT.entries.filter((e) => (e.eventDate || '') >= INPUT.since),
};

// Exactly the calls the Stage 0 harness made.
const CALLS = {
  computeROISummary: (e) => stats.computeROISummary(e, prospectSet),
  computeROISummary_emptyProspectSet: (e) => stats.computeROISummary(e, new Set()),
  computeV2Summary: (e) => stats.computeV2Summary(e),
  computeCalibrationReliability_v1: (e) => stats.computeCalibrationReliability(e, 'v1'),
  computeCalibrationReliability_v2: (e) => stats.computeCalibrationReliability(e, 'v2'),
  computeRoiByMarketBand: (e) => stats.computeRoiByMarketBand(e),
  computeBetTierBreakdown: (e) => stats.computeBetTierBreakdown(e),
  computeCumulativePnl: (e) => stats.computeCumulativePnl(e),
  computeMonthlyPerformance: (e) => stats.computeMonthlyPerformance(e),
};

describe('statistics populations', () => {
  it('reproduces the two captured populations exactly', () => {
    expect(Object.keys(GOLDEN.statistics).sort()).toEqual(Object.keys(populations).sort());
    for (const [name, block] of Object.entries(GOLDEN.statistics)) {
      expect(populations[name].length, `${name} entry count`).toBe(block.entryCount);
    }
    expect(populations.all.length).toBe(153);
    expect(populations['since_2026-05-23'].length).toBe(70);
  });

  it('covers all 18 captured results with a mapped call', () => {
    let total = 0;
    for (const block of Object.values(GOLDEN.statistics)) {
      for (const r of block.results) {
        expect(CALLS[r.label], `no mapping for ${r.label}`).toBeTypeOf('function');
        expect(r.ok, `${r.label} captured an error`).toBe(true);
        total++;
      }
    }
    expect(total).toBe(18);
  });
});

// Exact comparison, no tolerance. Statistics replay is bit-exact in Node --
// unlike the model goldens nothing here routes through Math.exp, so there is no
// cross-engine allowance to make.
describe('statistics — exact golden replay', () => {
  for (const [popName, block] of Object.entries(GOLDEN.statistics)) {
    for (const result of block.results) {
      it(`${popName} / ${result.label}`, () => {
        expectExact(
          CALLS[result.label](populations[popName]),
          result.value,
          `${popName}/${result.label}`
        );
      });
    }
  }
});

describe('statistics — the frozen prospect set is load-bearing', () => {
  it('both prospect-set variants match their own captured results', () => {
    const g = GOLDEN.statistics.all.results;
    expectExact(
      stats.computeROISummary(populations.all, prospectSet),
      g.find((r) => r.label === 'computeROISummary').value,
      'with prospect set'
    );
    expectExact(
      stats.computeROISummary(populations.all, new Set()),
      g.find((r) => r.label === 'computeROISummary_emptyProspectSet').value,
      'with empty set'
    );
  });
});
