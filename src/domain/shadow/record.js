// ─── DOMAIN / SHADOW / FROZEN RECORD ─────────────────────────────────────────
// Assembles the single frozen shadow record attached to a saved prediction when
// VITE_C6_SHADOW_CAPTURE_ENABLED is true. Created ONCE at save time; loading,
// rendering, exporting and grading must never recompute it (grading may only
// append outcome fields on the parent entry, never touch this record).
//
// C6 and both gates consume ONE frozen market snapshot by construction (odds are
// parsed once in the snapshot; the gates run on that object). `evaluateShadowArms`
// fails closed on an invalid or id-mismatched snapshot, so the recorded
// `singleSnapshotConsistent` is true for every available evaluation — it is a
// structural guarantee, not a passive after-the-fact warning.

import { djb2Checksum } from '../betting/marketCore.js';
import { MODEL_V2 } from '../model/index.js';
import { buildMarketSnapshot } from './snapshot.js';
import { evaluateShadowArms } from './policies.js';
import { C6_VERSION, C6_COEF } from './c6.js';
import { resolveShadowConfig } from './config.js';

export const SHADOW_SCHEMA_VERSION = 'c6-shadow-1';
export const SHADOW_CAPTURE_MODE = 'live-shadow';

// Frozen copy of the current production gate thresholds — provenance only; the
// actual gating uses the live gate (computeMarketAnalysis), never these numbers.
export const GATE_THRESHOLDS = Object.freeze({
  version: 'gate_v2_20260709',
  hardFloor: 0.6,
  lean6065MinEdge: 0.1,
  bet6570MinEdge: 0.3,
  lean6570MinEdge: 0.1,
  strong70MinEdge: 0.25,
  bet70MinEdge: 0.15,
  minPickEdge: 0.03,
  heavyFavRawImplied: 2 / 3,
  heavyFavMinEdge: 0.25,
  lowCredThreshold: 30,
});

/**
 * Build the frozen shadow record. Never throws for ordinary missing data — it
 * records `c6Available:false` with a reason instead.
 *
 * @param {{
 *   fA:object, fB:object, oddsA:string, oddsB:string,
 *   eventName:string, eventDate:string,
 *   fightId?:string, eventId?:string,
 *   v2pA:(number|null), v2pB:(number|null),
 *   capturedAt:string,           // === parent entry.createdAt (save instant)
 *   createdAt?:string            // record creation stamp (defaults to capturedAt)
 * }} args
 * @returns {object} the frozen shadow record
 */
export function buildShadowRecord({
  fA,
  fB,
  oddsA,
  oddsB,
  eventName,
  eventDate,
  fightId,
  eventId,
  v2pA,
  v2pB,
  capturedAt,
  createdAt,
} = {}) {
  const fighterA = fA?.FIGHTER ?? null;
  const fighterB = fB?.FIGHTER ?? null;

  // ONE frozen snapshot — odds parsed exactly once here; identity from fightId.
  const snapshot = buildMarketSnapshot({
    oddsA,
    oddsB,
    capturedAt,
    fighterA,
    fighterB,
    fightId,
  });

  // Both gates run on this one snapshot (no raw odds are passed). The evaluator
  // fails closed on an invalid or id-mismatched snapshot, so consistency is a
  // structural property, not an after-the-fact check.
  const shadow = evaluateShadowArms({ v2pA, v2pB, fA, fB, snapshot });
  const singleSnapshotConsistent = shadow.singleSnapshotConsistent;

  const config = resolveShadowConfig();

  return {
    schemaVersion: SHADOW_SCHEMA_VERSION,
    captureMode: SHADOW_CAPTURE_MODE,
    capturedAt: capturedAt ?? null,
    createdAt: createdAt ?? capturedAt ?? null,

    // fight / event identity + displayed order
    fightId: fightId ?? null,
    eventId: eventId ?? null,
    eventName: eventName ?? null,
    eventDate: eventDate ?? null,
    fighterA,
    fighterB,
    displayedOrder: ['A', 'B'], // as entered in the Simulator; slots are arbitrary
    canonicalCorner: null, // FightMetrics stores no verified red/blue corner today

    // v2 layer (independent, unchanged)
    v2: {
      pA: Number.isFinite(v2pA) ? v2pA : null,
      pB: Number.isFinite(v2pB) ? v2pB : null,
      version: MODEL_V2.version,
      coefHash: djb2Checksum(JSON.stringify(MODEL_V2.coef)),
    },

    // C6 layer (experimental, order-safe, never user-facing this release)
    c6: {
      version: C6_VERSION,
      coefficients: { w0: C6_COEF.w0, wMarket: C6_COEF.wMarket, wV2: C6_COEF.wV2 },
      pA: shadow.c6.c6pA,
      pB: shadow.c6.c6pB,
      available: shadow.available,
      unavailableReason: shadow.unavailableReason,
    },

    // one shared market snapshot (manual capture semantics)
    market: {
      source: snapshot.source,
      captureSemantics: snapshot.captureSemantics,
      snapshotId: snapshot.snapshotId,
      capturedAt: snapshot.capturedAt, // also stored inside the market section
      valid: snapshot.valid,
      invalidReason: snapshot.reason,
      oddsA: snapshot.oddsA,
      oddsB: snapshot.oddsB,
      rawImpliedA: snapshot.rawImpliedA,
      rawImpliedB: snapshot.rawImpliedB,
      noVigA: snapshot.noVigA,
      noVigB: snapshot.noVigB,
      favouriteSide: shadow.marketFavouriteSide,
    },

    // gate provenance + credibility inputs (gating itself used the live gate)
    gate: {
      thresholds: GATE_THRESHOLDS,
      credibilityA: Number.isFinite(fA?.CREDIBILITY) ? fA.CREDIBILITY : null,
      credibilityB: Number.isFinite(fB?.CREDIBILITY) ? fB.CREDIBILITY : null,
      lowCredCapV2: shadow.v2Gate?.lowCredCap ?? null,
      lowCredCapC6: shadow.c6Gate?.lowCredCap ?? null,
    },

    // frozen policy arms (paper-only)
    arms: shadow.arms,

    // provenance
    singleSnapshotConsistent,
    featureFlags: config,
    engineNote:
      'C6 is an experimental market-adjusted betting-layer forecast. It does not ' +
      'replace the v2 simulator probability and is never user-facing in this release.',
  };
}
