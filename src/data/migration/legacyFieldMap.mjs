// Stage 6 — exhaustive, machine-readable legacy field map.
//
// Every field path measured in roiData.js, upcomingData.js, propPicksData.js
// and the parlay runtime shape maps to exactly one of:
//   { to: 'Entity.field' }            migrated
//   { derived: '<rule>' }             dropped because it is reproducible
//   { dropped: '<reason>' }           dropped deliberately
//
// legacyFieldMap.test.js walks the REAL data recursively, collects every path,
// and asserts each is covered here — so a field cannot silently disappear, and
// this file cannot drift from the data it describes.
//
// `pattern: true` entries cover enumerated leaf sets (the 26 v1 / 16 v2 feature
// keys and the 5 source-manifest modules x 8 fields) whose members are migrated
// verbatim as a unit.

export const LEGACY_FIELD_MAP = Object.freeze({
  // ── ROI / Upcoming entries (identical shape) ────────────────────────────
  roiEntry: {
    id: { to: 'PredictionRun.id + PredictionRun.legacyEntryId (verbatim); seeds all derived UUIDv5 ids' },
    createdAt: { to: 'PredictionRun.createdAt, v1 PredictionSnapshot.capturedAt, MarketSnapshot.capturedAt, BettingAssessment.frozenAt, TrackedPosition.openedAt' },
    eventName: { to: 'Event.name' },
    eventDate: { to: 'Event.date; also PredictionRun.targetEventDateAtCapture when _provenance.targetEventDate is absent' },
    division: { to: 'Bout.division' },
    fighterA: { to: 'Bout.cornerA.displayName (canonical orientation)' },
    fighterB: { to: 'Bout.cornerB.displayName (canonical orientation)' },

    fighterAProb: { to: 'PredictionSnapshot[basis=legacy-v1-unversioned].probA' },
    fighterBProb: { to: 'PredictionSnapshot[basis=legacy-v1-unversioned].probB' },
    v2pA: { to: 'PredictionSnapshot[basis=v2].probA' },
    v2pB: { to: 'PredictionSnapshot[basis=v2].probB' },
    predictedWinner: { derived: 'v1 snapshot winnerCorner; equals the v1 argmax on every committed row' },
    predictedProb: { derived: 'max(fighterAProb, fighterBProb) on every committed row' },
    modelUsed: { to: 'PredictionRun.decisionSnapshotId (points at the v2 snapshot when present)' },

    trackedSide: { to: 'TrackedPosition.corner' },
    trackedProb: { derived: 'decision-basis snapshot prob for TrackedPosition.corner; reproduces every stored value' },

    oddsA: { to: 'MarketSnapshot.oddsA (parsed to integer; "" -> no snapshot side)' },
    oddsB: { to: 'MarketSnapshot.oddsB (parsed to integer; "" -> no snapshot side)' },
    // NOT derived. App.js edits marketOdds independently (:7890) and rewrites it
    // separately when the tracked side changes (:7868), so it can legitimately
    // disagree with oddsA/oddsB. That it matched the selected corner throughout
    // the original Stage 6 capture is a seed property, not a migration rule —
    // deriving it would silently discard a real price correction.
    marketOdds: {
      to: 'the selected corner of TrackedPosition.marketSnapshotId. Equal to the selected assessment odds => reuse that snapshot; different => a new immutable MarketSnapshot (source "legacyTrackedOverride", capturedAt null) with only the tracked corner replaced; explicitly blank => that corner is explicitly unpriced, never a fallback to oddsA/oddsB',
    },

    fairLineA: { to: 'BettingAssessment.fairLineA (integer)' },
    fairLineB: { to: 'BettingAssessment.fairLineB (integer)' },
    edgeA: { to: 'BettingAssessment.edgeA' },
    edgeB: { to: 'BettingAssessment.edgeB' },
    evA: { to: 'BettingAssessment.evA' },
    evB: { to: 'BettingAssessment.evB' },
    kellyA: { to: 'BettingAssessment.kellyA' },
    kellyB: { to: 'BettingAssessment.kellyB' },
    fairLine: { derived: 'tracked corner fairLine; verified across the committed corpus' },
    edge: { derived: 'tracked corner edge; verified across the committed corpus' },
    ev: { derived: 'tracked corner EV; verified across the committed corpus' },
    kelly: { derived: 'tracked corner Kelly; verified across the committed corpus' },

    betAction: { to: 'BettingAssessment.tier (+ tierProvenance "stored"; absent -> null + "absent")' },
    bestBet: { to: 'BettingAssessment.recommendedCorner (+ recommendedCornerProvenance; stored null kept distinct from absence)' },
    betRecommendedFighter: { derived: 'recommendedCorner + Bout corners; "" when there is no recommendation' },
    betRecommendedOdds: { derived: 'recommendedCorner + MarketSnapshot; "" when there is no recommendation' },

    unitsWagered: { to: 'TrackedPosition.stakeUnits (+ stakeSource; absent -> 1 / defaultedFlat1u)' },
    notes: { to: 'TrackedPosition.notes ("" -> null)' },

    actualWinner: { to: 'Bout.result ("" -> pending; NC -> noContest; DRAW -> draw; else resolved + corner)' },
    actualFinish: { to: 'Bout.result.method ("" -> null; "Submission" -> "SUB")' },

    projectedKO: { to: 'PredictionRun.finishProjection.koPct' },
    projectedSUB: { to: 'PredictionRun.finishProjection.subPct' },
    projectedDEC: { to: 'PredictionRun.finishProjection.decPct' },
    projectedFinish: { to: 'PredictionRun.finishProjection.leaders (split on " / "); equals the argmax set on every committed row' },

    fighterAIsProspect: { to: 'PredictionRun.cornerAIsProspectAtCapture (absent -> null, never false)' },
    fighterBIsProspect: { to: 'PredictionRun.cornerBIsProspectAtCapture (absent -> null, never false)' },
    includesProspect: { to: 'PredictionRun.includesProspectAtCapture' },

    _provenance: { to: 'PredictionSnapshot fields + PredictionRun.provenanceCompleteness' },
    '_provenance.captureMode': { to: 'PredictionSnapshot.captureMode (absent -> "unknown", never "reconstructed")' },
    '_provenance.modelVersion': { to: 'PredictionSnapshot[basis=v2].modelVersion' },
    '_provenance.modelCoefHash': { to: 'PredictionSnapshot[basis=v2].modelCoefHash' },
    '_provenance.predictionTimestamp': { to: 'PredictionSnapshot[basis=v2].capturedAt' },
    '_provenance.targetEventDate': { to: 'PredictionRun.targetEventDateAtCapture (retained: Event.date is mutable)' },
    '_provenance.reconstructionType': { to: 'PredictionSnapshot.reconstruction.type' },
    '_provenance.sourceCommit': { to: 'PredictionSnapshot.reconstruction.sourceCommit' },
    '_provenance.priorV2': { to: 'PredictionSnapshot.reconstruction.priorV2' },
    '_provenance.priorV2.v2pA': { to: 'PredictionSnapshot.reconstruction.priorV2.v2pA' },
    '_provenance.priorV2.v2pB': { to: 'PredictionSnapshot.reconstruction.priorV2.v2pB' },
    '_provenance.frozenTier': { to: 'BettingAssessment.tier (+ tierProvenance "frozenTier")' },
    '_provenance.featureVector': { to: 'PredictionSnapshot.featureVector' },
    '_provenance.featureVector.v1': { to: 'PredictionSnapshot[basis=legacy-v1-unversioned].featureVector' },
    '_provenance.featureVector.v2': { to: 'PredictionSnapshot[basis=v2].featureVector' },
    '_provenance.featureVector.v1.*': { pattern: true, to: 'PredictionSnapshot[basis=legacy-v1-unversioned].featureVector.<key> (all 26 keys verbatim)' },
    '_provenance.featureVector.v2.*': { pattern: true, to: 'PredictionSnapshot[basis=v2].featureVector.<key> (all 16 keys verbatim)' },
    // Attached to BOTH snapshots of every full live record. These describe
    // the DATA the live calculation read, not one model's coefficients, and
    // several manifest modules are explicitly feedsV2:true — so writing them
    // only onto v1 would make the v2 snapshot look unprovenanced. Deliberate
    // immutable duplication. Reconstructed rows supply neither and stay null.
    '_provenance.fightHistoryCutoff': { to: 'PredictionSnapshot.fightHistoryCutoff (both bases)' },
    '_provenance.fightHistoryCutoff.fighterA': { to: 'PredictionSnapshot.fightHistoryCutoff.cornerA (orientation-mapped, both bases)' },
    '_provenance.fightHistoryCutoff.fighterB': { to: 'PredictionSnapshot.fightHistoryCutoff.cornerB (orientation-mapped, both bases)' },
    '_provenance.sourceManifest': { to: 'PredictionSnapshot.sourceManifest (both bases)' },
    '_provenance.sourceManifest.*': { pattern: true, to: 'PredictionSnapshot.sourceManifest.<module> (5 modules x 8 fields verbatim, both bases)' },
  },

  // ── Prop picks ──────────────────────────────────────────────────────────
  propPick: {
    id: { to: 'Prop.id (verbatim)' },
    createdAt: { to: 'Prop.createdAt' },
    pickSource: { to: 'Prop.pickSource' },
    upcomingId: { to: 'Prop.target.boutId (resolved via the referenced legacy entry; null -> resolved by event+date+pair)' },
    eventName: { to: 'Event.name (via Prop.eventId)' },
    eventDate: { to: 'Event.date (via Prop.eventId)' },
    fighterA: { dropped: 'reachable through Prop.target.boutId -> Bout.cornerA' },
    fighterB: { dropped: 'reachable through Prop.target.boutId -> Bout.cornerB' },
    side: { to: 'Prop.target.corner (orientation-mapped; null = fight-level)' },
    method: { to: 'Prop.method' },
    propType: { to: 'Prop.propType' },
    label: { to: 'Prop.label' },
    odds: { to: 'Prop.odds (integer)' },
    stake: { to: 'Prop.stakeUnits' },
    result: { to: 'Prop.result' },
  },

  // ── Parlay runtime shape (persisted rows plus the BuildParlayModal
  //    constructor and readers, independent of the current row count) ─────
  parlay: {
    id: { to: 'Parlay.id (verbatim)' },
    createdAt: { to: 'Parlay.createdAt' },
    pickSource: { to: 'Parlay.pickSource' },
    eventName: { to: 'Event.name (via Parlay.eventId; "" -> null)' },
    eventDate: { to: 'Event.date (via Parlay.eventId)' },
    combinedOdds: { to: 'Parlay.combinedOdds (integer)' },
    unitsWagered: { to: 'Parlay.stakeUnits' },
    status: { dropped: 'non-authoritative; re-derived by computeParlayResult at read time (locked no-freeze decision)' },
    result: { dropped: 'non-authoritative; re-derived by computeParlayResult at read time (locked no-freeze decision)' },
    legs: { to: 'Parlay.legs' },
    'legs[].fightId': { to: 'Parlay.legs[].boutId' },
    'legs[].pickedFighter': { to: 'Parlay.legs[].pickedCorner (orientation-mapped)' },
    'legs[].v2DefaultFighter': { to: 'Parlay.legs[].modelDefaultCorner (orientation-mapped)' },
    'legs[].v2ProbAtBuild': { to: 'Parlay.legs[].modelProbAtBuild' },
    'legs[].overridden': { to: 'Parlay.legs[].overridden' },
    'legs[].fighterA': { dropped: 'duplicated from Bout.cornerA' },
    'legs[].fighterB': { dropped: 'duplicated from Bout.cornerB' },
    'legs[].eventName': { dropped: 'duplicated from Event.name' },
    'legs[].eventDate': { dropped: 'duplicated from Event.date' },
  },
});

/**
 * ACTIVE App.js UI state that was absent from the original Stage 6 seed.
 *
 * CORRECTION: an earlier revision filed `confirmedByUser` under
 * "reader-only phantoms" on the strength of its absence from that seed and no
 * assignment in src/domain. That was wrong — it only looked at the
 * data and the domain modules. App.js WRITES it (":7389" Confirm All, ":7688"
 * Confirm Pick) and READS `autoGenerated` (":7384", ":7388", ":7654", ":7686").
 * Together they are a real feature: auto-generated ROI entries awaiting review.
 *
 * Both are now modelled by TrackedPosition.reviewState, a discriminated union,
 * rather than two independent nullable booleans that would admit the
 * meaningless "confirmed but not auto-generated" combination.
 */
export const UI_STATE_FIELDS = Object.freeze({
  autoGenerated: {
    to: 'TrackedPosition.reviewState (status pending|confirmed implies the entry was auto-generated)',
    note: 'read at App.js:7384, :7388, :7654, :7686; absent from the original Stage 6 seed capture',
  },
  confirmedByUser: {
    to: 'TrackedPosition.reviewState (false -> pending, true -> confirmed)',
    note: 'written at App.js:7389 and :7688; read 6x in src/domain/statistics as a population filter; absent from the original Stage 6 seed capture',
  },
});

/** Legacy combinations that abort rather than being guessed. */
export const REVIEW_STATE_LEGACY_RULES = Object.freeze([
  { when: 'neither field present', result: "{ status: 'notRequired' }" },
  { when: 'autoGenerated:false, confirmedByUser absent', result: "{ status: 'notRequired' }" },
  { when: 'autoGenerated:true, confirmedByUser:false', result: "{ status: 'pending', reason: 'autoGenerated' }" },
  { when: 'autoGenerated:true, confirmedByUser:true', result: "{ status: 'confirmed', reason: 'autoGenerated', confirmedAt: null }" },
  { when: 'confirmedByUser present unless autoGenerated===true', result: 'ABORT' },
  { when: 'autoGenerated:true without a boolean confirmedByUser', result: 'ABORT' },
  { when: 'autoGenerated present but not a boolean', result: 'ABORT' },
]);

/** v1 fields with no direct legacy source, and where their value comes from. */
export const GENERATED_FIELD_SOURCES = Object.freeze({
  'Event.promotion': 'derived: /^UFC\\b/ -> "UFC"; otherwise null + a migration-manifest entry (including "Freedom 250")',
  'Event.externalIds': 'canonical default {}',
  'Event.updatedAt': 'null — no legacy source; never invented',
  'Event.createdAt': 'earliest createdAt among the event\'s legacy rows',
  'Bout.externalIds': 'canonical default {}',
  'Bout.updatedAt': 'null — no legacy source',
  'Bout.createdAt': 'earliest createdAt among the bout\'s legacy rows',
  'Bout.boardOrder': 'null — not recorded in legacy data',
  'Bout.scheduledRounds': 'null — not recorded in legacy data',
  'Bout.cornerA.fighterKey': 'derived: NFC + trim + collapse whitespace + lowercase of displayName (non-authoritative join hint)',
  'Bout.cornerB.fighterKey': 'derived: NFC + trim + collapse whitespace + lowercase of displayName (non-authoritative join hint)',
  'Bout.cornerA.fighterId': 'null until Stage 9 identity work',
  'Bout.cornerB.fighterId': 'null until Stage 9 identity work',
  'PredictionRun.provenanceCompleteness': 'derived per row: none (no _provenance) / partial / full (has featureVector)',
  'PredictionSnapshot.captureMode': 'legacy _provenance.captureMode, else "unknown" — never assumed "reconstructed"',
  'PredictionSnapshot[basis=legacy-v1-unversioned].capturedAt': 'legacy createdAt (no separate v1 timestamp exists in any generation)',
  'PredictionSnapshot.basis': 'derived: "legacy-v1-unversioned" for the original output, "v2" when v2pA/v2pB exist',
  'PredictionSnapshot.sourceManifest': 'legacy _provenance.sourceManifest, copied to BOTH bases of every full live record; null elsewhere',
  'PredictionSnapshot.fightHistoryCutoff': 'legacy _provenance.fightHistoryCutoff, orientation-mapped and copied to BOTH bases of every full live record; null elsewhere',
  'MarketSnapshot.source': '"manual" for the assessment market; "legacyTrackedOverride" for a snapshot reconstructed from a divergent legacy marketOdds',
  'MarketSnapshot.capturedAt': 'legacy createdAt for the assessment market (the odds belong to the original save, not a later v2 reconstruction); NULL for a legacyTrackedOverride, because the legacy row records the corrected price but never when it was edited',
  'BettingAssessment.tierProvenance': 'derived: stored / frozenTier / absent',
  'BettingAssessment.recommendedCornerProvenance': 'derived: stored / absentInLegacy',
  'TrackedPosition.marketSnapshotId': 'reconciled from the legacy marketOdds field: the assessment market when it agrees or is absent, otherwise a distinct legacyTrackedOverride snapshot',
  'TrackedPosition.reviewState': 'derived from the legacy UI fields autoGenerated/confirmedByUser; rows carrying neither become { status: "notRequired" }',
  'TrackedPosition.origin': 'constant "legacyMigration" — legacy data cannot prove cash placement',
  'TrackedPosition.stakeSource': 'derived per row: explicit / defaultedFlat1u',
  'TrackedPosition.settlement.settledAt': 'null for every settled legacy position — the real settlement time is unknown and migratedAt must not be substituted',
  'TrackedPosition.settlement.financialResult': 'computed from the SELECTED corner odds; push/void are always computed 0; uncomputable when that corner has no price',
  'meta.schemaVersion': 'constant 1',
  'meta.migratedAt': 'injected deps.migratedAt (the only place the migration clock appears)',
});
