// ─── DOMAIN / SHADOW / POLICY ARMS ───────────────────────────────────────────
// Freezes four PAPER-ONLY policy arms for a saved prediction. Nothing here is a
// real wager: fields are named `paperAction` / `wouldWager` so stored data can
// never be mistaken for a bet.
//
//   V2_CURRENT   incumbent v2 probability + current gate (baseline)
//   C6_CURRENT   order-safe C6 probability + current gate (primary challenger)
//   V2_AGREEMENT v2 + current gate, then agreement filter (gate challenger)
//   C6_AGREEMENT C6 + current gate, then agreement filter (secondary diagnostic)
//
// STRUCTURAL single-snapshot invariant: this function accepts ONE frozen market
// snapshot and NO raw odds. Both the v2 and C6 gates run via evaluateGateOnSnapshot
// on that same object — odds are never re-parsed here — so a second/divergent
// snapshot cannot enter. Every gate output echoes the snapshot id it used; if any
// echo fails to match (a defensive check), the whole evaluation fails closed with
// ODDS_SNAPSHOT_MISMATCH and produces NO arms. C6_NO_LEAN is not implemented.
//
// Agreement is applied AFTER the complete gate (post credibility cap and post
// heavy-favourite suppression); it may only suppress a paper action, never change
// the probability, the selected fighter, or the pre-agreement tier. An exact
// no-vig pick'em is recorded PICKEM and suppressed to NO BET.

import { evaluateGateOnSnapshot } from '../betting/marketCore.js';
import { computeC6ProbA } from './c6.js';

const ACTIONABLE = new Set(['LEAN', 'BET', 'STRONG BET']);

const NEUTRAL_EDGES = Object.freeze(
  Object.fromEntries(
    ['striking', 'grappling', 'physical', 'form', 'experience', 'analytics'].map((k) => [
      k,
      { clamped: 0 },
    ])
  )
);

const favouriteSide = (noVigA, noVigB) => {
  if (!Number.isFinite(noVigA) || !Number.isFinite(noVigB)) return null;
  if (noVigA === noVigB) return 'PICKEM';
  return noVigA > noVigB ? 'A' : 'B';
};

/**
 * Defensive cross-check: every provided gate output must carry the expected
 * snapshot id. True by construction (both gates get the one object), but if it
 * ever fails we fail closed rather than record-and-continue.
 */
export const crossCheckSnapshotIds = (gates, expectedId) =>
  gates.every((g) => g && g.marketSnapshotId === expectedId && expectedId != null);

function armFromGate(gate, basis, fighters, favSide, applyAgreement, snapshotId) {
  const pickSide = gate.pickSide;
  const pickFighter = pickSide === 'A' ? fighters.fighterA : fighters.fighterB;
  const baseFinalAction = gate.betAction; // POST cap + POST heavy-fav suppression
  const actionable = ACTIONABLE.has(baseFinalAction);

  let agreementState;
  if (!actionable) agreementState = 'N/A';
  else if (favSide === 'PICKEM' || favSide == null) agreementState = 'PICKEM';
  else agreementState = pickSide === favSide ? 'AGREE' : 'DISAGREE';

  let paperAction = baseFinalAction;
  let wouldWager = actionable;
  if (applyAgreement && actionable && agreementState !== 'AGREE') {
    paperAction = 'NO BET';
    wouldWager = false;
  }

  return {
    probabilityBasis: basis,
    marketSnapshotId: snapshotId, // every arm records the exact snapshot it used
    pickSide,
    pickFighter,
    pickProb: gate.pickProb,
    pickEdge: gate.pickEdge,
    preSuppressionAction: gate.cappedBetAction,
    baseBetAction: gate.baseBetAction,
    heavyFavSuppressed: gate.heavyFavSuppressed,
    baseFinalAction,
    agreementState,
    paperAction,
    wouldWager,
  };
}

/**
 * Evaluate all four shadow arms from ONE frozen snapshot (no raw odds).
 *
 * @param {{v2pA:number, v2pB:number, fA:object, fB:object, snapshot:object}} ctx
 * @returns {{available:boolean, unavailableReason:(string|null),
 *            marketSnapshotId:(string|null), singleSnapshotConsistent:boolean,
 *            marketFavouriteSide, c6, v2Gate, c6Gate, arms}}
 * Never throws. Fails closed (no arms) on an invalid or mismatched snapshot.
 */
export function evaluateShadowArms({ v2pA, v2pB, fA, fB, snapshot } = {}) {
  const fighters = { fighterA: fA?.FIGHTER, fighterB: fB?.FIGHTER };
  const empty = (reason) => ({
    available: false,
    unavailableReason: reason,
    marketSnapshotId: snapshot?.snapshotId ?? null,
    singleSnapshotConsistent: false,
    marketFavouriteSide: null,
    c6: { available: false, reason, c6pA: null, c6pB: null },
    v2Gate: null,
    c6Gate: null,
    arms: {},
  });

  // Fail closed: no valid frozen snapshot → no shadow gate action at all.
  if (!snapshot || !snapshot.valid) return empty(snapshot?.reason ?? 'SNAPSHOT_INVALID');

  const snapshotId = snapshot.snapshotId;
  const favSide = favouriteSide(snapshot.noVigA, snapshot.noVigB);

  const v2Available = Number.isFinite(v2pA) && Number.isFinite(v2pB);
  // Both gates run on the SAME snapshot object — odds are never re-parsed here.
  const v2Gate = v2Available
    ? evaluateGateOnSnapshot({ pA: v2pA, pB: v2pB, edges: NEUTRAL_EDGES }, snapshot, fA, fB)
    : null;

  let c6 = { available: false, reason: null, c6pA: null, c6pB: null };
  let c6Gate = null;
  if (!v2Available) {
    c6 = { available: false, reason: 'V2_UNAVAILABLE', c6pA: null, c6pB: null };
  } else {
    c6 = computeC6ProbA({ noVigA: snapshot.noVigA, v2pA });
    if (c6.available) {
      c6Gate = evaluateGateOnSnapshot(
        { pA: c6.c6pA, pB: c6.c6pB, edges: NEUTRAL_EDGES },
        snapshot,
        fA,
        fB
      );
    }
  }

  // Defensive structural check: any gate that WAS produced must carry this
  // snapshot's id. A mismatch (an injected/divergent snapshot) fails closed. A
  // legitimate absence of gates (e.g. v2 unavailable) is not a mismatch and keeps
  // its own reason below.
  const producedGates = [v2Gate, c6Gate].filter(Boolean);
  if (producedGates.length > 0 && !crossCheckSnapshotIds(producedGates, snapshotId)) {
    return empty('ODDS_SNAPSHOT_MISMATCH');
  }

  const arms = {};
  if (v2Gate) {
    arms.V2_CURRENT = armFromGate(v2Gate, 'v2', fighters, favSide, false, snapshotId);
    arms.V2_AGREEMENT = armFromGate(v2Gate, 'v2', fighters, favSide, true, snapshotId);
  }
  if (c6Gate) {
    arms.C6_CURRENT = armFromGate(c6Gate, 'c6', fighters, favSide, false, snapshotId);
    arms.C6_AGREEMENT = armFromGate(c6Gate, 'c6', fighters, favSide, true, snapshotId);
  }

  return {
    available: c6.available,
    unavailableReason: c6.available ? null : c6.reason,
    marketSnapshotId: snapshotId,
    // true only when gates actually ran on this snapshot and matched its id
    singleSnapshotConsistent: producedGates.length > 0,
    marketFavouriteSide: favSide,
    c6,
    v2Gate,
    c6Gate,
    arms,
  };
}

export const _internal = { favouriteSide, armFromGate, ACTIONABLE, NEUTRAL_EDGES };
