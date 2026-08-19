import { describe, it, expect } from 'vitest';
import {
  buildShadowRecord,
  SHADOW_SCHEMA_VERSION,
  SHADOW_CAPTURE_MODE,
} from '../record.js';
import { C6_VERSION, C6_COEF } from '../c6.js';

const args = (over = {}) => ({
  fA: { FIGHTER: 'Alice', CREDIBILITY: 80 },
  fB: { FIGHTER: 'Bob', CREDIBILITY: 75 },
  oddsA: '-130',
  oddsB: '+120',
  eventName: 'TEST CARD',
  eventDate: '2026-09-01',
  fightId: '1786823202677-ahytyi',
  v2pA: 0.67,
  v2pB: 0.33,
  capturedAt: '2026-09-01T12:00:00.000Z',
  ...over,
});

describe('frozen shadow record', () => {
  it('carries the required identity/provenance fields', () => {
    const r = buildShadowRecord(args());
    expect(r.schemaVersion).toBe(SHADOW_SCHEMA_VERSION);
    expect(r.captureMode).toBe(SHADOW_CAPTURE_MODE);
    expect(r.captureMode).toBe('live-shadow');
    expect(r.capturedAt).toBe('2026-09-01T12:00:00.000Z');
    expect(r.fighterA).toBe('Alice');
    expect(r.fighterB).toBe('Bob');
    expect(r.displayedOrder).toEqual(['A', 'B']);
    expect(r.canonicalCorner).toBeNull();
    expect(r.eventName).toBe('TEST CARD');
  });

  it('stores C6 version + full-precision coefficients + probabilities', () => {
    const r = buildShadowRecord(args());
    expect(r.c6.version).toBe(C6_VERSION);
    expect(r.c6.coefficients).toEqual({ w0: 0, wMarket: C6_COEF.wMarket, wV2: C6_COEF.wV2 });
    expect(r.c6.available).toBe(true);
    expect(r.c6.pA).toBeGreaterThan(0);
    expect(r.c6.pA).toBeLessThan(1);
    expect(r.c6.pB).toBeCloseTo(1 - r.c6.pA, 15);
  });

  it('stores v2 provenance and does not alter v2 probabilities', () => {
    const r = buildShadowRecord(args());
    expect(r.v2.pA).toBe(0.67);
    expect(r.v2.pB).toBe(0.33);
    expect(r.v2.version).toMatch(/logistic_v2/);
    expect(typeof r.v2.coefHash).toBe('string');
  });

  it('records the shared manual snapshot (id from fightId, capturedAt inside market) and structural consistency', () => {
    const r = buildShadowRecord(args());
    expect(r.market.source).toBe('manual');
    expect(r.market.snapshotId).toBe('msnap_1786823202677-ahytyi');
    expect(r.market.capturedAt).toBe('2026-09-01T12:00:00.000Z');
    expect(r.market.noVigA + r.market.noVigB).toBeCloseTo(1, 15);
    expect(r.singleSnapshotConsistent).toBe(true);
  });

  it('includes the four frozen paper-only arms; each records the same snapshot id', () => {
    const r = buildShadowRecord(args());
    expect(Object.keys(r.arms).sort()).toEqual([
      'C6_AGREEMENT',
      'C6_CURRENT',
      'V2_AGREEMENT',
      'V2_CURRENT',
    ]);
    for (const k of Object.keys(r.arms)) {
      expect(r.arms[k]).toHaveProperty('paperAction');
      expect(typeof r.arms[k].wouldWager).toBe('boolean');
      expect(r.arms[k].marketSnapshotId).toBe(r.market.snapshotId);
    }
  });

  it('records feature-flag state (capture only; C6 never user-facing)', () => {
    const r = buildShadowRecord(args());
    expect(r.featureFlags.userFacingActive).toBe(false);
  });

  it('is deterministic for identical inputs', () => {
    expect(buildShadowRecord(args())).toEqual(buildShadowRecord(args()));
  });

  it('marks C6 unavailable (never throws) when odds are invalid; still records v2 probabilities', () => {
    const r = buildShadowRecord(args({ oddsA: '', oddsB: '+120' }));
    expect(r.c6.available).toBe(false);
    expect(r.c6.unavailableReason).toBe('ODDS_MISSING_OR_INVALID');
    expect(r.market.valid).toBe(false);
    // With no valid prices there is no gate for EITHER arm, so no arms are frozen,
    // but the v2 probabilities themselves are still captured on the record.
    expect(r.v2.pA).toBe(0.67);
    expect(r.arms.V2_CURRENT).toBeUndefined();
    expect(r.arms.C6_CURRENT).toBeUndefined();
  });

  it('marks C6 unavailable when v2 is missing', () => {
    const r = buildShadowRecord(args({ v2pA: null, v2pB: null }));
    expect(r.c6.available).toBe(false);
    expect(r.c6.unavailableReason).toBe('V2_UNAVAILABLE');
  });

  it('fails closed with an identity reason when the parent fightId is missing', () => {
    const r = buildShadowRecord(args({ fightId: undefined }));
    expect(r.market.valid).toBe(false);
    expect(r.market.invalidReason).toBe('MISSING_FIGHT_ID');
    expect(r.c6.available).toBe(false);
    expect(r.c6.unavailableReason).toBe('MISSING_FIGHT_ID');
    expect(r.arms).toEqual({});
  });
});
