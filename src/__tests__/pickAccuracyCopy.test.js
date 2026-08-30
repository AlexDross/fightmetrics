import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Terminology guard for the Pick Accuracy / official-performance copy.
// Accuracy is an unweighted count ratio, so no Pick Accuracy surface may claim
// "stake-weighted"; and now that C6 decisions can drive the metric, no headline
// copy may claim raw-"v2 frozen scoring". ROI copy MAY still say stake-weighted.
const APP = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'App.js'),
  'utf8'
);

// Every JSX line mentioning the "Pick Accuracy" metric's caption text.
const accuracyCaptionLines = APP.split('\n').filter((l) =>
  l.includes('Frozen tracked-decision accuracy')
);

describe('Pick Accuracy copy is accurate', () => {
  it('has the reworded accuracy caption on every banner (3 surfaces)', () => {
    // Statistics headline, Home track record, ROI banner.
    expect(accuracyCaptionLines.length).toBeGreaterThanOrEqual(3);
  });

  it('no Pick Accuracy caption claims "stake-weighted"', () => {
    for (const line of accuracyCaptionLines) {
      expect(line).not.toContain('stake-weighted');
    }
  });

  it('the accuracy caption says "decisive fights", not "graded fights"', () => {
    for (const line of accuracyCaptionLines) {
      expect(line).toContain('decisive fights');
      expect(line).not.toContain('graded fights');
    }
  });

  it('the false "graded fights (stake-weighted)" caption is gone entirely', () => {
    expect(APP).not.toContain('graded fights (stake-weighted)');
  });

  it('no longer claims raw-"v2 frozen scoring" (C6 decisions can be included)', () => {
    expect(APP).not.toContain('v2 frozen scoring');
  });

  it('headline/chart copy no longer claims a raw-"v2-scored population"', () => {
    expect(APP).not.toContain('v2-scored population');
    expect(APP).not.toContain('v2-scored fights in window');
  });

  it('ROI copy may still say stake-weighted (its denominator is units risked)', () => {
    expect(APP).toContain('(stake-weighted)');
  });
});

describe('ROI card labels are model-neutral', () => {
  // The ROI fight card can now grade a C6 decision, so its pick/odds labels must
  // not hard-code "v2". Covers the form labels and the mobile metadata string.
  it('no user-facing "v2 Pick" or "v2 Odds" label remains', () => {
    expect(APP).not.toContain('v2 Pick');
    expect(APP).not.toContain('v2 Odds');
    expect(APP).not.toContain('V2 Pick');
    expect(APP).not.toContain('V2 Odds');
  });

  it('uses model-neutral "Pick" and "Odds" labels and a neutral metadata "Pick:"', () => {
    expect(APP).toContain('· Pick: ');
    expect(APP).toMatch(/>\s*Pick\s*<\/label>/);
    expect(APP).toMatch(/>\s*Odds\s*<\/label>/);
  });
});

describe('malformed C6 in the ROI card never falls back to raw-v2 display', () => {
  it('withholds v2Data for a malformed C6 record (no raw-v2 winner/prob/odds/rec)', () => {
    // The v2Data source is gated off for a malformed C6 record, so none of the
    // raw-v2 winner/probability/odds/bet-recommendation can be shown.
    expect(APP).toContain('inV2Mode && !isC6Decision && !malformedC6');
  });

  it('renders a neutral unavailable frozen-decision state instead', () => {
    expect(APP).toContain('decisionUnavailable');
    expect(APP).toContain('Frozen decision unavailable');
  });
});
