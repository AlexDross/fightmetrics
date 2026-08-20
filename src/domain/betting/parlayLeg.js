// ─── DOMAIN / BETTING / PARLAY LEG ───────────────────────────────────────────
// Single pure builder for one parlay leg's saved fields, extracted from
// BuildParlayPanel's handleConfirm so the exact saved output is unit
// testable without rendering React.
//
// A leg carries TWO independent probability provenances that must never be
// conflated:
//   - the promoted decision source (C6 for a C6-driven entry, v2 otherwise):
//     defaultFighter / probabilityAtBuild / decisionProbabilitySource /
//     decisionProbabilityVersion. `overridden` is relative to THIS default.
//   - raw v2, always (legacy, unchanged semantics regardless of source):
//     v2DefaultFighter / v2ProbAtBuild.
// C6's default fighter can be the opposite of v2's own favourite, so
// v2ProbAtBuild must be derived by comparing pickedFighter directly against
// v2DefaultFighter -- never by reusing `overridden`, which answers a
// different question (did the user diverge from the PROMOTED default, not
// from v2's default).

/**
 * @param {{
 *   fightId, fighterA, fighterB, eventName, eventDate,
 *   pickedFighter: string,
 *   v2DefaultFighter: string,
 *   v2WinProb: number,           // raw v2's probability for v2DefaultFighter
 *   overridden: boolean,         // pickedFighter !== defaultFighter (promoted source)
 *   decisionProbabilitySource: ('v2'|'c6'),
 *   decisionProbabilityVersion: (string|null),
 *   defaultFighter: string,      // the promoted source's own default fighter
 *   probabilityAtBuild: number,  // the promoted source's probability for defaultFighter
 * }} pick
 */
export function buildParlayLeg(pick) {
  const {
    fightId, fighterA, fighterB, eventName, eventDate,
    pickedFighter, v2DefaultFighter, v2WinProb, overridden,
    decisionProbabilitySource, decisionProbabilityVersion,
    defaultFighter, probabilityAtBuild,
  } = pick;

  return {
    fightId,
    fighterA,
    fighterB,
    eventName,
    eventDate,
    pickedFighter,
    // Legacy fields, unchanged semantics -- ALWAYS raw v2, even for a
    // C6-driven leg, so they must never be read as "the decision".
    v2DefaultFighter,
    // Raw v2's probability for the fighter ACTUALLY PICKED. Compared
    // directly against v2DefaultFighter (not `overridden`, which tracks
    // divergence from the promoted/source-neutral default and can disagree
    // with v2's own default when C6 picked the opposite fighter). Well-
    // defined since pA+pB=1 for a two-way fight.
    v2ProbAtBuild: pickedFighter === v2DefaultFighter ? v2WinProb : 1 - v2WinProb,
    overridden,
    // Source-neutral, additive: which probability actually drove the
    // DEFAULT this leg started from, and its frozen version when it was C6.
    // Present for every leg (never omitted); 'v2' here is not C6 metadata.
    decisionProbabilitySource,
    decisionProbabilityVersion,
    defaultFighter,
    // The promoted source's probability for the fighter ACTUALLY PICKED.
    // `overridden` is the correct basis here (unlike v2ProbAtBuild above)
    // because it is defined relative to this same defaultFighter.
    probabilityAtBuild: overridden ? 1 - probabilityAtBuild : probabilityAtBuild,
  };
}
