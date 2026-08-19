import { describe, it, expect, afterEach, vi } from 'vitest';
import { loadFixture, frozenRoiEntry } from '../../../__tests__/goldenSupport.js';
import { createGradedEntry, addPendingEntry } from '../../workflow/index.js';

const { fighterFixtures } = loadFixture('fighters.golden.json');
const names = Object.keys(fighterFixtures);
const fA = fighterFixtures[names[0]];
const fB = fighterFixtures[names[1]];

const ARGS = {
  fA,
  fB,
  oddsA: '-150',
  oddsB: '+130',
  eventName: 'SHADOW TEST EVENT',
  eventDate: '2026-09-01',
  modelToggle: 'v2',
  unitsWagered: 1,
};

// strip volatile + shadow fields so two builds are comparable
const VOLATILE = ['id', 'createdAt'];
const stripForCompare = (e) => {
  const c = structuredClone(e);
  for (const k of VOLATILE) delete c[k];
  delete c._c6Shadow;
  if (c._provenance) {
    delete c._provenance.predictionTimestamp;
    delete c._provenance.captureMode;
  }
  return c;
};

afterEach(() => vi.unstubAllEnvs());

describe('buildRoiEntry + shadow capture flag', () => {
  it('flag OFF (default): no _c6Shadow field is added; entry shape unchanged', () => {
    const e = frozenRoiEntry(ARGS);
    expect(Object.prototype.hasOwnProperty.call(e, '_c6Shadow')).toBe(false);
    // the normal v2 fields are all present
    expect(e).toHaveProperty('v2pA');
    expect(e).toHaveProperty('betAction');
    expect(e).toHaveProperty('trackedSide');
  });

  it('flag ON: records _c6Shadow with all arms and does NOT change any v2/current field', () => {
    const off = frozenRoiEntry(ARGS);
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    const on = frozenRoiEntry(ARGS);

    // shadow present with the four arms
    expect(on._c6Shadow).toBeDefined();
    expect(on._c6Shadow.captureMode).toBe('live-shadow');
    expect(Object.keys(on._c6Shadow.arms).sort()).toEqual([
      'C6_AGREEMENT',
      'C6_CURRENT',
      'V2_AGREEMENT',
      'V2_CURRENT',
    ]);

    // EVERYTHING else (all user-facing / current v2 fields) is byte-identical
    expect(stripForCompare(on)).toEqual(stripForCompare(off));
    // capturedAt equals the entry's own createdAt (one shared instant)
    expect(on._c6Shadow.capturedAt).toBe(on.createdAt);
  });

  it('flag ON does not make C6 user-facing: displayed pick/tier stay v2', () => {
    const off = frozenRoiEntry(ARGS);
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true'); // requested, must be refused
    const on = frozenRoiEntry(ARGS);
    // user-facing money fields are still the v2 ones (unchanged from flag OFF)
    for (const f of ['trackedSide', 'betAction', 'bestBet', 'predictedWinner', 'v2pA', 'v2pB']) {
      expect(on[f]).toEqual(off[f]);
    }
    expect(on._c6Shadow.featureFlags.userFacingActive).toBe(false);
  });

  it('lifecycle: save -> pending -> grade preserves the frozen shadow record byte-for-byte', () => {
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    const saved = frozenRoiEntry(ARGS);
    const shadowBefore = structuredClone(saved._c6Shadow);

    // add to pending (upcoming)
    const pending = addPendingEntry([], saved);
    expect(pending[0]._c6Shadow).toEqual(shadowBefore);

    // export round-trip (JSON.stringify used by the code-export path)
    const exported = JSON.parse(JSON.stringify(pending[0]));
    expect(exported._c6Shadow).toEqual(shadowBefore);

    // grade: only actualWinner is added; the frozen shadow record is untouched
    const graded = createGradedEntry(exported, saved.fighterA);
    expect(graded.actualWinner).toBe(saved.fighterA);
    expect(graded._c6Shadow).toEqual(shadowBefore);
    // grading did not alter frozen probabilities/coefficients/actions
    expect(graded._c6Shadow.c6.pA).toBe(shadowBefore.c6.pA);
    expect(graded._c6Shadow.arms).toEqual(shadowBefore.arms);
  });

  it('is deterministic: two ON builds have identical shadow content (modulo the shared id/timestamp)', () => {
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    const a = frozenRoiEntry(ARGS);
    const b = frozenRoiEntry(ARGS);
    const norm = (s) => {
      const c = structuredClone(s);
      // everything below depends on the volatile entry id + save clock
      c.capturedAt = '<T>';
      c.createdAt = '<T>';
      c.fightId = '<ID>';
      c.market.snapshotId = '<SNAP>';
      c.market.capturedAt = '<T>';
      for (const k of Object.keys(c.arms)) c.arms[k].marketSnapshotId = '<SNAP>';
      return c;
    };
    expect(norm(a._c6Shadow)).toEqual(norm(b._c6Shadow));
  });
});
