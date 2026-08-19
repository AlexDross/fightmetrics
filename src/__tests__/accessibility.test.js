import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../App.js', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../style.css', import.meta.url), 'utf8');

const luminance = (hex) => {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => parseInt(value, 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

const contrastRatio = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const cssToken = (name) => {
  const match = cssSource.match(new RegExp(`${name}:\\s*(#[a-f\\d]{6})`, 'i'));
  if (!match) throw new Error(`Missing CSS token ${name}`);
  return match[1];
};

describe('semantic text contrast', () => {
  it('defines primary, secondary and muted foregrounds that pass on every app surface', () => {
    const foregrounds = [
      cssToken('--fm-text-primary'),
      cssToken('--fm-text-secondary'),
      cssToken('--fm-text-muted'),
    ];
    const surfaces = ['#020617', '#0f172a', '#1e293b'];

    for (const foreground of foregrounds) {
      for (const surface of surfaces) {
        expect(contrastRatio(foreground, surface), `${foreground} on ${surface}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('does not use the known-failing slate-500/slate-600 text utilities', () => {
    expect(appSource).not.toMatch(/text-slate-(500|600)/);
    expect(appSource).toContain('text-primary');
    expect(appSource).toContain('text-secondary');
    expect(appSource).toContain('text-muted');
  });
});

describe('keyboard focus and targets', () => {
  it('keeps a global keyboard-only focus indicator and removes suppressed outlines', () => {
    expect(cssSource).toContain(':focus-visible');
    expect(cssSource).toContain('outline: 3px solid var(--fm-focus-ring)');
    expect(appSource).not.toContain('focus:outline-hidden');
    expect(appSource).not.toContain('focus:outline-none');
  });

  it('keeps the remaining small controls at least 24px and mobile controls at 44px', () => {
    expect(cssSource).toContain('min-block-size: 24px');
    expect(appSource).toContain('w-6 h-6 items-center justify-center');
    expect(appSource).toContain('min-w-[44px] min-h-[44px]');
    expect(appSource).toContain('min-h-6 accent-red-500');
  });
});

describe('programmatic control names', () => {
  it('associates the screen-level filters and populated Simulator controls', () => {
    for (const id of [
      'statistics-since',
      'roi-since',
      'explore-division',
      'explore-min-minutes',
      'simulator-event-name',
      'simulator-event-date',
      'simulator-units',
      'simulator-bout-division',
      'simulator-title-status',
      'simulator-rounds',
    ]) {
      expect(appSource).toContain(`htmlFor="${id}"`);
      expect(appSource).toContain(`id="${id}"`);
    }
  });

  it('gives repeated fight controls contextual accessible names', () => {
    expect(appSource).toContain('Actual winner for ${entry.fighterA} versus ${entry.fighterB}');
    expect(appSource).toContain('Units staked on ${entry.fighterA} versus ${entry.fighterB}');
    expect(appSource).toContain('Odds for the model pick in ${entry.fighterA} versus ${entry.fighterB}');
    expect(appSource).toContain('Select ${entry.fighterA} versus ${entry.fighterB} for parlay');
    expect(appSource).not.toContain("'Select for parlay'");
  });

  it('does not rely on the Simulator moneyline placeholders for their names', () => {
    expect(appSource).toContain('htmlFor={`simulator-odds-${color}`}');
    expect(appSource).toContain('aria-label={`Moneyline odds for ${f.FIGHTER}`}');
  });
});

describe('charts, tables and disclosures', () => {
  it('turns every chart into a named noninteractive graphic with a data table', () => {
    expect(appSource.match(/accessibilityLayer=\{false\}/g)).toHaveLength(7);
    expect(appSource.match(/role="img"/g)).toHaveLength(7);
    expect(appSource.match(/<AccessibleChartDataTable/g)).toHaveLength(7);

    for (const caption of [
      'Cumulative P and L by Event data',
      'ROI by Market Band data',
      'Pick Win Rate versus Market-Implied Probability data',
      'Calibration Reliability data',
      'Win Rate by Bet Tier data',
      'ROI by Bet Tier data',
      'Four Factors versus Division Average data',
    ]) {
      expect(appSource).toContain(caption);
    }
  });

  it('exposes sort direction and disclosure state through native controls', () => {
    expect(appSource).toContain("aria-sort={sort.col === key ? (sort.dir === 'desc' ? 'descending' : 'ascending') : 'none'}");
    expect(appSource).not.toMatch(/<th[^>]*onClick=/);
    expect(appSource).toContain('aria-expanded={open}');
    expect(appSource).toContain('aria-controls={`roi-event-${group._i}`}');
    expect(appSource).toContain('aria-expanded={showFull}');
  });
});

