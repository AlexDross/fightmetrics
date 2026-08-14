import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CSI_DESCRIPTION,
  MASTER_RATING_DESCRIPTION,
  V2_OPPONENT_QUALITY_DESCRIPTION,
} from '../uiTerminology.js';

const appSource = readFileSync(new URL('../App.js', import.meta.url), 'utf8');

describe('v2 user-facing terminology', () => {
  it('pins the Competitive Standing Index definition', () => {
    expect(CSI_DESCRIPTION).toContain('65%');
    expect(CSI_DESCRIPTION).toContain('35%');
    expect(CSI_DESCRIPTION).toContain('current ranking tier');
    expect(CSI_DESCRIPTION).toContain('Elo strength');
    expect(CSI_DESCRIPTION).toContain('0–1');
    expect(CSI_DESCRIPTION).toContain('not an average of past opponents');
    expect(CSI_DESCRIPTION).toContain('historical strength-of-schedule score');
    expect(CSI_DESCRIPTION).toContain('does not directly affect v2 predictions');
  });

  it('pins v2 opponent-quality and historical Elo behavior', () => {
    expect(V2_OPPONENT_QUALITY_DESCRIPTION).toContain(
      'does not include a direct strength-of-schedule feature'
    );
    expect(V2_OPPONENT_QUALITY_DESCRIPTION).toContain(
      'opponent’s rating when each fight occurred'
    );
    expect(V2_OPPONENT_QUALITY_DESCRIPTION).toContain(
      'does not change retroactively'
    );
  });

  it('pins the current Master Rating definition', () => {
    expect(MASTER_RATING_DESCRIPTION).toContain('current Elo');
    expect(MASTER_RATING_DESCRIPTION).toContain('0–100');
    expect(MASTER_RATING_DESCRIPTION).toContain('weight class');
    expect(MASTER_RATING_DESCRIPTION).toContain(
      'does not add a direct opponent-quality or schedule adjustment'
    );
  });

  it('keeps stale OQI names and schedule claims out of UI copy', () => {
    expect(appSource).not.toContain("short: 'OQI'");
    expect(appSource).not.toContain('Opponent Quality Index');
    expect(appSource).not.toContain('Overall Quality Index');
    expect(appSource).not.toContain('Average strength of opposition faced');
    expect(appSource).not.toContain('Quality Momentum (QM) adjusts');
    expect(appSource).not.toContain('win over a top-ranked fighter carries more weight');
  });

  it('marks named schedule metrics as v1-only in shared UI copy', () => {
    expect(appSource).toContain('Strength of Schedule (v1 only)');
    expect(appSource).toContain('Quality Momentum (v1 only)');
  });
});
