// ─── DOMAIN / SHADOW / MARKET SNAPSHOT ───────────────────────────────────────
// Honest, manual odds-capture semantics + ONE validated frozen snapshot.
//
// FightMetrics has no automated odds provider and no verified sportsbook
// publication timestamp, so a snapshot only asserts: "these are the American
// prices the user entered, frozen at the instant this prediction was saved."
//   source     = "manual"
//   capturedAt = the prediction-save timestamp (NOT sportsbook publication time)
//
// The odds are parsed EXACTLY ONCE here, via the dependency-neutral
// buildMarketInput (../betting/marketCore.js). The resulting object is a
// superset of a market input, so the snapshot-aware gate consumes it directly —
// the v2 and C6 shadow gates therefore run on the SAME object with no re-parse.
//
// Snapshot identity is derived from the PARENT prediction id (fightId), so two
// otherwise-identical saves are still distinct. Production must supply fightId;
// its absence fails the capture closed (MISSING_FIGHT_ID) rather than minting a
// collision-prone id.

import { buildMarketInput } from '../betting/marketCore.js';

export const SNAPSHOT_SOURCE_MANUAL = 'manual';
export const SNAPSHOT_CAPTURE_SEMANTICS =
  'capturedAt is when FightMetrics received/froze the manually entered odds; ' +
  'it is not proof of when the sportsbook originally published them.';

/** Deterministic snapshot id from the parent prediction/fight id. */
export const snapshotIdFromFightId = (fightId) => `msnap_${fightId}`;

/**
 * Build a frozen market snapshot. Never throws. Returns valid:false with a
 * reason for ordinary missing/invalid data. On success the returned object is a
 * VALID MARKET INPUT (valid, rawImpliedA/B, noVigA/B, vig, overround,
 * decimalA/B) plus identity (snapshotId, source, capturedAt) — ready to feed
 * straight into evaluateGateOnSnapshot with no further parsing.
 */
export function buildMarketSnapshot({ oddsA, oddsB, capturedAt, fighterA, fighterB, fightId } = {}) {
  const idBase = {
    source: SNAPSHOT_SOURCE_MANUAL,
    captureSemantics: SNAPSHOT_CAPTURE_SEMANTICS,
    capturedAt: capturedAt ?? null,
    snapshotId: null,
    fightId: fightId ?? null,
    oddsA: oddsA ?? null,
    oddsB: oddsB ?? null,
    fighterA: fighterA ?? null,
    fighterB: fighterB ?? null,
    rawImpliedA: null,
    rawImpliedB: null,
    noVigA: null,
    noVigB: null,
    vig: null,
    overround: null,
    decimalA: null,
    decimalB: null,
  };

  if (!fightId) return { ...idBase, valid: false, reason: 'MISSING_FIGHT_ID' };
  if (!capturedAt) return { ...idBase, valid: false, reason: 'MISSING_CAPTURED_AT' };
  if (fighterA == null || fighterB == null) {
    return { ...idBase, valid: false, reason: 'MISSING_FIGHTER_MAPPING' };
  }

  const snapshotId = snapshotIdFromFightId(fightId);
  // SINGLE parse of the odds for the whole shadow evaluation.
  const mi = buildMarketInput({
    oddsA,
    oddsB,
    snapshotId,
    source: SNAPSHOT_SOURCE_MANUAL,
    capturedAt,
  });
  if (!mi.valid) {
    return { ...idBase, snapshotId, valid: false, reason: 'ODDS_MISSING_OR_INVALID' };
  }

  return {
    valid: true,
    reason: null,
    ...mi, // valid, rawImpliedA/B, noVigA/B, vig, overround, decimalA/B, snapshotId, source, capturedAt, oddsA, oddsB
    captureSemantics: SNAPSHOT_CAPTURE_SEMANTICS,
    fightId,
    fighterA,
    fighterB,
  };
}
