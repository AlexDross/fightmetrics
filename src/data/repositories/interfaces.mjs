// Stage 7 Gate 1 — the repository contract.
//
// This is the ONLY surface the UI is allowed to depend on. Gate 6 swaps the
// in-memory backing for Postgres without changing a single import in App.js.
//
// Every method returns a Result (see types.mjs). Mutations that touch a mutable
// row take an `expectedRevision` decimal string and may return
// { kind: 'conflict', serverRevision }.
//
// REPOSITORY_CONTRACT is data, not documentation: conformsToContract() checks an
// implementation against it, so a backing that forgets a method fails a test
// rather than throwing at runtime in the browser.

export const REPOSITORY_CONTRACT = Object.freeze({
  eventRepository: Object.freeze({
    list: 0,                 // () -> Result<Event[]>
    get: 1,                  // (id) -> Result<Event>
    listWithBoutCounts: 0,   // () -> Result<{event, boutCount}[]>
    // Card-wide: renaming an Event changes it for EVERY bout on that card,
    // unlike the legacy per-entry eventName. The UI must say so.
    rename: 3,               // (id, {name,date,promotion}, expectedRevision)
  }),

  boutRepository: Object.freeze({
    listByEvent: 1,          // (eventId) -> Result<Bout[]>
    get: 1,                  // (id) -> Result<Bout>
    listPendingResults: 0,   // () -> Result<Bout[]>
  }),

  predictionRepository: Object.freeze({
    listPending: 0,          // () -> Result<UpcomingRow[]>
    listGraded: 1,           // ({since}) -> Result<RoiRow[]>
    getAggregate: 1,         // (runId) -> Result<PredictionAggregate>
    savePrediction: 1,       // (aggregate) -> Result<{runId}>
    // Deleting a root is a LOGICAL delete (always tombstoned) plus a PHYSICAL
    // delete of whatever it provably orphans. When a wager pins the shared
    // assessment the run row survives, so the response distinguishes the two:
    //   -> Result<{removed, physicallyRemoved, retained:{run, assessment,
    //               marketSnapshots, predictionSnapshots}}>
    // A tombstoned root is notFound to every read surface either way.
    remove: 2,               // (runId, expectedRevision)
    // ── Revision VECTORS, not positional arrays ───────────────────────────
    // Every method below writes more than one row, so it takes an ID-KEYED
    // vector `{id, revision}[]` covering EVERY row the write will touch, and
    // rejects a duplicate, missing, unknown, malformed or stale entry before
    // mutating anything. Input order is irrelevant.
    //
    // grade cascades to each tracked position AND each wager on the bout, so
    // its vector is {bout} ∪ {positions on bout} ∪ {wagers on bout}. Taking a
    // bout revision alone let a concurrently-edited position be re-settled
    // against a stake the caller had never seen.
    clearGraded: 1,          // (revisions[]) -> Result<{removed, rootsTombstoned, physicallyRemoved}>
    grade: 4,                // (boutId, outcome, method, revisions[])
    returnToPending: 2,      // (boutId, revisions[])
    changeTrackedCorner: 3,  // (positionId, corner, expectedRevision)
    amendTrackedPrice: 3,    // (positionId, odds, expectedRevision)
    confirmEntry: 2,         // (positionId, expectedRevision)
    confirmAllPending: 1,    // (revisions[]) -> Result<{confirmed, touched}>
  }),

  wagerRepository: Object.freeze({
    listByBout: 1,           // (boutId) -> Result<Wager[]>
    create: 1,               // (wager) -> Result<{id}>
    updateStake: 3,          // (id, stakeUnits, expectedRevision)
    updateNotes: 3,          // (id, notes, expectedRevision)
    settle: 3,               // (id, outcome, expectedRevision)
    remove: 2,               // (id, expectedRevision)
  }),

  propRepository: Object.freeze({
    list: 0,
    create: 1,
    settle: 3,               // (id, result, expectedRevision)
    remove: 2,
  }),

  parlayRepository: Object.freeze({
    list: 0,
    create: 1,
    remove: 1,               // parlays are immutable; no revision
  }),

  // Returns the legacy-entry-shaped projection the existing domain readers
  // consume. NO ROI, calibration, tier or probability is ever computed here or
  // in SQL — src/domain/statistics remains the single implementation.
  statisticsRepository: Object.freeze({
    statisticsInput: 1,      // ({since}) -> Result<LegacyEntryShape[]>
  }),

  workspaceRepository: Object.freeze({
    current: 0,              // () -> Result<{id,slug,isPublic,schemaVersion,seedVersion,migratedAt}>
    seedVersion: 0,
    setSeedVersion: 2,       // (version, expectedRevision)
    exportStore: 0,          // members only
    importStore: 2,          // (store, {backupConfirmed})
    reset: 1,                // ({backupConfirmed})
  }),

  undoRepository: Object.freeze({
    list: 0,                 // () -> Result<UndoEntry[]>
    undo: 1,                 // (token) -> Result<{restored}>
  }),

  // AUTHENTICATION and MEMBERSHIP are separate, and both are separately
  // observable, because three distinct states need three distinct UIs:
  //   session null, role null -> signed out          ("sign in")
  //   session set,  role null -> signed-in non-member ("request access", and
  //                              MAY claim a zero-owner workspace)
  //   session set,  role set  -> member
  // A single tri-state made the middle case unreachable: a signed-in
  // non-member could not claim an unowned workspace, which is the only way a
  // fresh deployment ever acquires an owner.
  authRepository: Object.freeze({
    session: 0,              // () -> Result<{userId}|null>   presence ONLY, no role
    // Routing is by RESOLVED MEMBERSHIP, not session presence: a signed-in
    // non-member reads through the public surface like anyone else.
    whoami: 0,               // () -> Result<{role|null}>     membership ONLY
    signIn: 1,               // (email) -> Result<{sent:true}>  magic link, shouldCreateUser:false
    signOut: 0,
    claimOwnership: 0,       // () -> Result<{role:'owner'}>  session required, membership not
  }),
});

/** Verifies an implementation provides every method with the right arity. */
export function conformsToContract(impl, contract = REPOSITORY_CONTRACT) {
  const problems = [];
  for (const [repoName, methods] of Object.entries(contract)) {
    const repo = impl[repoName];
    if (!repo) { problems.push(`missing repository: ${repoName}`); continue; }
    for (const [method, arity] of Object.entries(methods)) {
      const fn = repo[method];
      if (typeof fn !== 'function') {
        problems.push(`${repoName}.${method} is not a function`);
      } else if (fn.length !== arity) {
        // EXACT, not `<=`. An at-most rule was no guard at all: Function.length
        // is 0 for `() => ok(...)`, so a zero-argument stub satisfied every
        // method in the contract, including the 3- and 4-parameter mutations.
        // Measured: replacing amendTrackedPrice with `() => ok({})` produced an
        // empty problems array.
        //
        // Exactness is only meaningful because Function.length stops counting at
        // the first defaulted or destructured parameter. Implementations
        // therefore declare ORDINARY parameters and destructure options in the
        // body — `listGraded(options)` with `const { since } = options ?? {}`,
        // never `listGraded({ since } = {})`, which reports 0.
        problems.push(`${repoName}.${method} declares ${fn.length} params, contract requires exactly ${arity}`);
      }
    }
    for (const extra of Object.keys(repo)) {
      if (!(extra in methods)) problems.push(`${repoName}.${extra} is not in the contract`);
    }
  }
  for (const extra of Object.keys(impl)) {
    if (!(extra in contract)) problems.push(`${extra} is not in the contract`);
  }
  return problems;
}
