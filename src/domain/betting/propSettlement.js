// ─── DOMAIN / BETTING / PROP SETTLEMENT ──────────────────────────────────────
// Settles a saved prop pick against its fight's graded result, so props can be
// graded from the ROI ledger instead of by hand. Returns one of the app's prop
// result values (PROP_RESULT_OPTIONS in App.js): 'WON' | 'LOST' | 'PUSH', or
// null when the fight result cannot settle it (unknown finish, unknown method,
// unrecognised winner) -- a null means "leave PENDING and review", never a guess.
//
// A pick is { side: 'A' | 'B' | null, method } where method is one of
// 'KO/TKO' | 'Submission' | 'Decision' or a double such as
// 'KO/TKO or Submission'. side null is a fight-level prop ("Fight Goes to
// Decision"); A/B is a fighter-level one ("Fighter wins by KO/TKO").
//
// Rules, the usual sportsbook ones:
//   - NC voids every prop -> PUSH.
//   - DRAW voids fighter-level props (that fighter did not win, but no one
//     lost) -> PUSH. A draw is a decision, so a fight-level prop settles on the
//     finish as normal: "Fight Goes to Decision" WINS on a draw.

const FINISH_OF_METHOD = Object.freeze({
  'KO/TKO': 'KO/TKO',
  Submission: 'SUB',
  Decision: 'DEC',
});

const FINISHES = new Set(Object.values(FINISH_OF_METHOD));

/** 'KO/TKO or Submission' -> Set{'KO/TKO','SUB'}; null if any part is unknown. */
export function finishesOfMethod(method) {
  const parts = String(method ?? '').split(' or ').map((p) => FINISH_OF_METHOD[p.trim()]);
  return parts.length && parts.every(Boolean) ? new Set(parts) : null;
}

/**
 * @param {{ side: 'A'|'B'|null, method: string, fighterA: string, fighterB: string }} pick
 * @param {{ actualWinner: string, actualFinish: string }} fight  graded ROI entry
 * @returns {'WON'|'LOST'|'PUSH'|null}
 */
export function settlePropPick(pick, fight) {
  const winner = fight?.actualWinner;
  const finish = fight?.actualFinish;
  if (!winner) return null;
  if (winner === 'NC') return 'PUSH';

  const wanted = finishesOfMethod(pick.method);
  if (!wanted) return null;

  if (pick.side === 'A' || pick.side === 'B') {
    if (winner === 'DRAW') return 'PUSH';
    if (winner !== pick.fighterA && winner !== pick.fighterB) return null;
    const backed = pick.side === 'A' ? pick.fighterA : pick.fighterB;
    if (winner !== backed) return 'LOST';
    if (!FINISHES.has(finish)) return null;
    return wanted.has(finish) ? 'WON' : 'LOST';
  }

  if (!FINISHES.has(finish)) return null;
  return wanted.has(finish) ? 'WON' : 'LOST';
}
