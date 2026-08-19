import { describe, it, expect } from 'vitest';
import { ROI_ENTRIES } from '../../../roiData.js';
import { UPCOMING_ENTRIES } from '../../../upcomingData.js';
import { PROP_PICKS } from '../../../propPicksData.js';
import { migrateV0ToV1 } from '../../migration/migrateV0ToV1.mjs';
import { createInMemoryRepositories, SEED_LEDGER } from '../inMemory.mjs';
import { REPOSITORY_CONTRACT, conformsToContract } from '../interfaces.mjs';
import { isRevision, isValidStakeTransport, semanticEquals } from '../types.mjs';
import { StoreSchema } from '../../schemas/entities.mjs';
import { checkInvariants } from '../../schemas/invariants.mjs';
import { computeROISummary } from '../../../domain/statistics/index.js';
import finalPreFight from '../../../__tests__/snapshots/upcoming.finalPreFight.json';

// The contract suite runs against a REAL migrated Stage 6 store, not fixtures,
// so the in-memory backing is exercised on the same positions Postgres will
// hold. Gate 6 must satisfy this identical suite.
const deps = { migratedAt: '2026-07-28T00:00:00.000Z', newId: () => '0'.repeat(8) + '-0000-7000-8000-' + '0'.repeat(12) };
const PARLAY_ENTRIES = [];

// ── the pending half of the corpus ───────────────────────────────────────────
//
// Grading, returnToPending and the revision-vector rules all need at least one
// OPEN position to act on. Between a graded card and the next save, Upcoming is
// legitimately EMPTY -- the UFC 330 handoff on 2026-08-17 left it exactly so --
// and `listPending().data[0]` was then `undefined`, which is a property of the
// current card, not of the repository contract under test.
//
// So the suite supplies its own pending row rather than assuming production has
// one, in the same spirit as the note below about hard-coded totals. It is
// built from the committed final pre-fight snapshot, so it is a real record
// shape rather than a hand-written stub, and it is re-identified onto a
// synthetic id and a far-future event so it can never collide with, or be
// mistaken for, production data.
const SYNTHETIC_PENDING = {
  ...JSON.parse(JSON.stringify(finalPreFight.entries[0])),
  // A well-formed legacy id (`\d{13}-[a-z0-9]{6}`) timestamped in the year
  // 2100, so it satisfies the schema while being unmistakably synthetic and
  // unable to collide with any real save.
  id: '4102444800000-fixt01',
  eventName: 'CONTRACT FIXTURE EVENT',
  eventDate: '2099-01-01',
  actualWinner: '',
  actualFinish: '',
};
const PENDING_ENTRIES = [...UPCOMING_ENTRIES, SYNTHETIC_PENDING];

const { store } = migrateV0ToV1(
  { roiEntries: ROI_ENTRIES, upcomingEntries: PENDING_ENTRIES, propPicks: PROP_PICKS, parlayEntries: PARLAY_ENTRIES },
  deps
);
const make = (opts) => createInMemoryRepositories(store, { now: () => '2026-08-01T00:00:00.000Z', ...opts });

// ── expected corpus cardinality ──────────────────────────────────────────────
//
// Every count below is derived from the canonical INPUT arrays, never from the
// store or from a repository under test, so the assertions stay falsifiable: a
// migration that drops, duplicates or misclassifies a row still fails them.
// Hard-coded totals made this suite fail whenever a prediction was legitimately
// saved, because saving one changes the corpus these tests read.
//
// `migrateV0ToV1` maps each legacy entry 1:1 onto a run, an assessment and a
// tracked position, and settles that position exactly when the entry carries an
// `actualWinner` — so the ROI file is the graded half and Upcoming the pending
// half. `isResolvedEntry` states that rule; the migration suite asserts the two
// files actually obey it rather than leaving it assumed here.
const isResolvedEntry = (entry) => String(entry?.actualWinner ?? '').trim() !== '';
const EXPECTED_GRADED = ROI_ENTRIES.length;
const EXPECTED_PENDING = PENDING_ENTRIES.length;
const EXPECTED_PREDICTIONS = EXPECTED_GRADED + EXPECTED_PENDING;
const EXPECTED_PROPS = PROP_PICKS.length;
const EXPECTED_PARLAYS = PARLAY_ENTRIES.length;
// The seed ledger carries one root per prediction run, prop and parlay.
const EXPECTED_SEED_ROOTS = EXPECTED_PREDICTIONS + EXPECTED_PROPS + EXPECTED_PARLAYS;
// Events are keyed by (name, date); the promotion is a pure function of the name.
const EXPECTED_EVENTS = new Set(
  [...ROI_ENTRIES, ...PENDING_ENTRIES].map((e) => `${e.eventName}|${e.eventDate}`)).size;

/** The complete dependency set a bout-result write must cover. */
const boutVector = (r, boutId) => {
  const positions = [...r.predictionRepository.listPending().data,
                     ...r.predictionRepository.listGraded({}).data]
    .filter((x) => x.boutId === boutId);
  return [
    { id: boutId, revision: r.boutRepository.get(boutId).revision },
    ...positions.map((x) => ({ id: x.trackedPositionId, revision: x.revision })),
    ...r.wagerRepository.listByBout(boutId).data.map((w) => ({ id: w.id, revision: w.revision })),
  ];
};

const runIdOfPosition = (positionId) => store.bettingAssessments.find((a) => a.id ===
  store.trackedPositions.find((t) => t.id === positionId).assessmentId).runId;

const snapshotsOfRun = (runId) => store.predictionSnapshots.filter((s) => s.runId === runId);

/**
 * A priced, graded row whose run carries BOTH a v1 and a v2 snapshot.
 *
 * The v2 snapshot is referenced by no `decisionSnapshotId` and no
 * `predictionSnapshotId` — it is reachable only through `runId`. A substantial
 * minority of the migrated corpus's snapshots are in that position, and so are
 * many of its priced graded rows. Picking a single-snapshot run instead makes
 * the pruning assertions vacuous, because the only snapshot present is also the
 * one the assessment pins.
 */
const pricedRowWithTwoSnapshots = (r) => {
  const row = r.predictionRepository.listGraded({}).data.find((x) =>
    x.trackedOddsA !== null && snapshotsOfRun(runIdOfPosition(x.trackedPositionId)).length === 2);
  if (!row) throw new Error('fixture drift: no priced graded row with two snapshots');
  return row;
};

const counts = (r) => {
  const s = r.workspaceRepository.exportStore().data;
  return {
    runs: s.predictionRuns.length, snapshots: s.predictionSnapshots.length,
    markets: s.marketSnapshots.length, assessments: s.bettingAssessments.length,
    positions: s.trackedPositions.length, wagers: s.wagers.length,
    events: s.events.length, bouts: s.bouts.length,
  };
};

describe('contract conformance', () => {
  it('the in-memory backing implements the contract exactly', () => {
    expect(conformsToContract(make())).toEqual([]);
  });

  it('the checker is not vacuous', () => {
    const impl = make();
    delete impl.propRepository.settle;
    expect(conformsToContract(impl)).toContain('propRepository.settle is not a function');

    const impl2 = make();
    impl2.propRepository.somethingExtra = () => {};
    expect(conformsToContract(impl2)).toContain('propRepository.somethingExtra is not in the contract');

    const impl3 = make();
    impl3.parlayRepository.list = (a, b) => [a, b];   // contract requires 0
    expect(conformsToContract(impl3))
      .toContain('parlayRepository.list declares 2 params, contract requires exactly 0');

    const impl4 = make();
    delete impl4.undoRepository;
    expect(conformsToContract(impl4)).toContain('missing repository: undoRepository');
  });

  it('catches a zero-argument stub replacing a multi-parameter method', () => {
    // THE regression the `<=` rule missed entirely. Under "at most", every one
    // of these passed, because Function.length is 0 for a no-arg arrow.
    for (const [repo, method, arity] of [
      ['predictionRepository', 'amendTrackedPrice', 3],
      ['predictionRepository', 'grade', 4],
      ['predictionRepository', 'returnToPending', 2],
      ['eventRepository', 'rename', 3],
      ['wagerRepository', 'settle', 3],
      ['workspaceRepository', 'importStore', 2],
      ['authRepository', 'signIn', 1],
      ['undoRepository', 'undo', 1],
    ]) {
      const impl = make();
      impl[repo][method] = () => ({ ok: true, data: {} });
      expect(conformsToContract(impl), `${repo}.${method}`)
        .toContain(`${repo}.${method} declares 0 params, contract requires exactly ${arity}`);
    }
  });

  it('a rest-parameter stub is also caught (Function.length ignores ...args)', () => {
    const impl = make();
    impl.predictionRepository.grade = (...args) => args;
    expect(conformsToContract(impl))
      .toContain('predictionRepository.grade declares 0 params, contract requires exactly 4');
  });

  it('the ledger seam widens neither the contract surface nor the Store', () => {
    const impl = make();
    expect(impl[SEED_LEDGER]).toBeTruthy();
    // Invisible to Object.keys, so the contract stays exactly ten repositories…
    expect(conformsToContract(impl)).toEqual([]);
    expect(Object.keys(impl)).toHaveLength(10);
    expect(Object.getOwnPropertyDescriptor(impl, SEED_LEDGER).enumerable).toBe(false);
    // …and it is storage-side only: no trace of it reaches the exported Store.
    const exported = impl.workspaceRepository.exportStore().data;
    expect(Object.keys(exported).sort()).toEqual([
      'bettingAssessments', 'bouts', 'events', 'marketSnapshots', 'meta',
      'parlays', 'predictionRuns', 'predictionSnapshots', 'props',
      'trackedPositions', 'wagers',
    ]);
    expect(JSON.stringify(exported).includes('removedAt')).toBe(false);
    expect(JSON.stringify(exported).includes('firstSeedVersion')).toBe(false);
    // The getter hands out copies; mutating them cannot reach the live ledger.
    const snapshot = impl[SEED_LEDGER];
    snapshot[0].removedAt = 'tampered';
    snapshot.length = 0;
    expect(impl[SEED_LEDGER]).toHaveLength(EXPECTED_SEED_ROOTS);
    expect(impl[SEED_LEDGER].every((x) => x.removedAt === null)).toBe(true);
  });

  it('exposes no seed applier — complete seed application is Gate 3', () => {
    const impl = make();
    for (const key of Object.getOwnPropertySymbols(impl)) {
      expect(String(key)).not.toMatch(/applySeed/i);
    }
  });

  it('declares every repository the plan requires', () => {
    expect(Object.keys(REPOSITORY_CONTRACT).sort()).toEqual([
      'authRepository', 'boutRepository', 'eventRepository', 'parlayRepository',
      'predictionRepository', 'propRepository', 'statisticsRepository',
      'undoRepository', 'wagerRepository', 'workspaceRepository',
    ]);
  });
});

describe('reads', () => {
  const r = make();

  it('returns the migrated corpus', () => {
    // The graded/pending expectations are only meaningful if the ROI file really
    // is the resolved half and Upcoming the unresolved half. Assert that here
    // rather than assuming it where the constants are defined.
    expect(ROI_ENTRIES.every(isResolvedEntry)).toBe(true);
    expect(PENDING_ENTRIES.some(isResolvedEntry)).toBe(false);

    expect(r.eventRepository.list().data).toHaveLength(EXPECTED_EVENTS);
    expect(r.predictionRepository.listGraded({}).data).toHaveLength(EXPECTED_GRADED);
    expect(r.predictionRepository.listPending().data).toHaveLength(EXPECTED_PENDING);
    expect(r.propRepository.list().data).toHaveLength(EXPECTED_PROPS);
    expect(r.parlayRepository.list().data).toHaveLength(EXPECTED_PARLAYS);

    // Counting alone cannot catch a drop paired with a duplicate. The run id is
    // the legacy entry id, so every canonical input must appear exactly once, on
    // the side its source file puts it.
    const runIdsOf = (rows) => rows.map((x) => runIdOfPosition(x.trackedPositionId)).sort();
    expect(runIdsOf(r.predictionRepository.listGraded({}).data))
      .toEqual(ROI_ENTRIES.map((e) => String(e.id)).sort());
    expect(runIdsOf(r.predictionRepository.listPending().data))
      .toEqual(PENDING_ENTRIES.map((e) => String(e.id)).sort());
  });

  it('emits revisions as opaque strings and stakes as decimal strings', () => {
    for (const row of r.predictionRepository.listGraded({}).data) {
      expect(isRevision(row.revision), `revision ${row.revision}`).toBe(true);
      // isValidStakeTransport, not the shape helper: shape alone accepts "0",
      // so asserting shape here would have proved nothing about validity.
      expect(isValidStakeTransport(row.stakeUnits), `stake ${row.stakeUnits}`).toBe(true);
      expect(typeof row.stakeUnits).toBe('string');
    }
  });

  it('never leaks provenance internals into a row projection', () => {
    const row = r.predictionRepository.listGraded({}).data[0];
    for (const banned of ['featureVector', 'sourceManifest', 'reconstruction',
                          'fightHistoryCutoff', 'modelCoefHash', 'legacyEntryId',
                          'notes', 'origin', 'stakeSource', 'fighterKey']) {
      expect(banned in row, `${banned} leaked`).toBe(false);
    }
  });

  it('filters graded rows by event date', () => {
    const all = r.predictionRepository.listGraded({}).data.length;
    const since = r.predictionRepository.listGraded({ since: '2026-05-23' }).data.length;
    expect(since).toBeGreaterThan(0);
    expect(since).toBeLessThan(all);
  });

  it('counts bouts per event without duplicating event data', () => {
    const rows = r.eventRepository.listWithBoutCounts().data;
    expect(rows).toHaveLength(EXPECTED_EVENTS);
    // One bout per migrated prediction: no two entries collapse onto a shared
    // bout, and no bout is counted twice across events.
    expect(rows.reduce((n, x) => n + x.boutCount, 0)).toBe(EXPECTED_PREDICTIONS);
  });
});

describe('statistics stay in JavaScript', () => {
  it('the repository returns an input projection the domain readers accept', () => {
    const rows = make().statisticsRepository.statisticsInput({}).data;
    expect(rows).toHaveLength(EXPECTED_PREDICTIONS);
    // The existing, tested domain function does the computing — not SQL, not
    // the repository.
    const summary = computeROISummary(rows, new Set());
    expect(summary).toBeTruthy();
    expect(typeof summary.total).toBe('number');
    expect(summary.total).toBeGreaterThan(0);
  });

  it('projects the legacy entry shape the readers require', () => {
    const row = make().statisticsRepository.statisticsInput({}).data[0];
    for (const field of ['id', 'fighterA', 'fighterB', 'eventName', 'eventDate',
                         'actualWinner', 'marketOdds', 'trackedSide', 'unitsWagered',
                         'predictedWinner', 'fighterAProb', 'fighterBProb',
                         'betAction', 'confirmedByUser', '_provenance']) {
      expect(field in row, `missing ${field}`).toBe(true);
    }
    expect(typeof row.unitsWagered).toBe('number');   // domain shape, not transport
  });

  it('excludes only the pending review state', () => {
    const rows = make().statisticsRepository.statisticsInput({}).data;
    expect(rows.every((x) => x.confirmedByUser === true)).toBe(true);  // all notRequired today
  });
});

describe('authentication and membership are separate', () => {
  const signedOut = () => make({ session: null, role: null });
  const nonMember = () => make({ session: { userId: 'u-1' }, role: null, ownerExists: false });
  const member = (role) => make({ session: { userId: 'u-2' }, role });

  it('state 1 — signed out: no session, no membership, no writes', () => {
    const r = signedOut();
    expect(r.authRepository.session().data).toBe(null);
    expect(r.authRepository.whoami().data.role).toBe(null);
    expect(r.propRepository.create({ id: 'x' }).error.kind).toBe('unauthenticated');
    expect(r.predictionRepository.savePrediction({ run: { id: 'x' } }).error.kind)
      .toBe('unauthenticated');
    // Public read surface is still open.
    expect(r.predictionRepository.listGraded({}).data).toHaveLength(EXPECTED_GRADED);
    expect(r.statisticsRepository.statisticsInput({}).data).toHaveLength(EXPECTED_PREDICTIONS);
    // Cannot claim: there is nobody to claim as.
    expect(r.authRepository.claimOwnership().error.kind).toBe('unauthenticated');
    // exportStore is the private store, not a read surface.
    expect(r.workspaceRepository.exportStore().error.kind).toBe('unauthenticated');
  });

  it('state 2 — signed-in non-member: session present, role null, writes forbidden', () => {
    const r = nonMember();
    expect(r.authRepository.session().data).toEqual({ userId: 'u-1' });
    expect(r.authRepository.whoami().data.role).toBe(null);
    // FORBIDDEN, not unauthenticated: the fix is access, not signing in.
    expect(r.propRepository.create({ id: 'x' }).error.kind).toBe('forbidden');
    expect(r.predictionRepository.savePrediction({ run: { id: 'x' } }).error.kind).toBe('forbidden');
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).error.kind).toBe('forbidden');
    // Routing is by membership: reads through the SAME public surface.
    expect(r.predictionRepository.listGraded({}).data).toHaveLength(EXPECTED_GRADED);
    expect(r.workspaceRepository.exportStore().error.kind).toBe('forbidden');
  });

  it('state 2 — a signed-in non-member MAY claim a zero-owner workspace', () => {
    const r = nonMember();
    const claim = r.authRepository.claimOwnership();
    expect(claim.ok, JSON.stringify(claim.error ?? {})).toBe(true);
    expect(claim.data.role).toBe('owner');
    // …exactly once. The second attempt sees an owner.
    expect(r.authRepository.claimOwnership().error.kind).toBe('forbidden');
  });

  it('the claim TRANSITIONS the same instance to owner', () => {
    const r = nonMember();
    // Before: not a member, cannot write at all.
    expect(r.authRepository.whoami().data.role).toBe(null);
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).error.kind).toBe('forbidden');
    expect(r.workspaceRepository.exportStore().error.kind).toBe('forbidden');

    expect(r.authRepository.claimOwnership().ok).toBe(true);

    // After: the SAME instance is an owner by every observable measure.
    expect(r.authRepository.whoami().data.role).toBe('owner');
    expect(r.workspaceRepository.exportStore().ok).toBe(true);
    // An editor-level write…
    expect(r.propRepository.settle(store.props[0].id, 'LOST', '1').ok).toBe(true);
    // …and an owner-only one.
    const graded = r.predictionRepository.listGraded({}).data;
    expect(r.predictionRepository.clearGraded(
      graded.map((g) => ({ id: g.trackedPositionId, revision: g.revision }))).ok).toBe(true);
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).ok).toBe(true);
  });

  it('signOut TRANSITIONS to signed out, not merely acknowledges', () => {
    const r = make();
    expect(r.authRepository.session().data).not.toBe(null);
    expect(r.authRepository.whoami().data.role).toBe('owner');

    expect(r.authRepository.signOut().ok).toBe(true);

    expect(r.authRepository.session().data).toBe(null);
    expect(r.authRepository.whoami().data.role).toBe(null);
    // Writes revert to unauthenticated, not forbidden: there is no session.
    expect(r.propRepository.create({ id: 'x' }).error.kind).toBe('unauthenticated');
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).error.kind)
      .toBe('unauthenticated');
    expect(r.workspaceRepository.exportStore().error.kind).toBe('unauthenticated');
    expect(r.authRepository.claimOwnership().error.kind).toBe('unauthenticated');
    // The public read surface is still open.
    expect(r.predictionRepository.listGraded({}).data).toHaveLength(EXPECTED_GRADED);
  });

  it('signing out after claiming drops the claimed role too', () => {
    const r = nonMember();
    expect(r.authRepository.claimOwnership().ok).toBe(true);
    expect(r.authRepository.whoami().data.role).toBe('owner');
    expect(r.authRepository.signOut().ok).toBe(true);
    expect(r.authRepository.whoami().data.role).toBe(null);
    expect(r.propRepository.create({ id: 'x' }).error.kind).toBe('unauthenticated');
  });

  it('state 2 — the claim is refused when the workspace already has an owner', () => {
    const r = make({ session: { userId: 'u-3' }, role: null, ownerExists: true });
    expect(r.authRepository.claimOwnership().error.kind).toBe('forbidden');
  });

  it('state 3 — member: session and role, gated by role', () => {
    expect(member('viewer').authRepository.session().data).toEqual({ userId: 'u-2' });
    expect(member('viewer').authRepository.whoami().data.role).toBe('viewer');
    expect(member('viewer').propRepository.create({ id: 'x' }).error.kind).toBe('forbidden');
    expect(member('viewer').predictionRepository.listGraded({}).ok).toBe(true);
    expect(member('editor').propRepository.settle(store.props[0].id, 'LOST', '1').ok).toBe(true);
    // Owner-only operations are still refused to an editor.
    expect(member('editor').predictionRepository.clearGraded([]).error.kind).toBe('forbidden');
    expect(member('editor').workspaceRepository.reset({ backupConfirmed: true }).error.kind)
      .toBe('forbidden');
    // A member already holds a role, so there is nothing to claim.
    expect(member('editor').authRepository.claimOwnership().error.kind).toBe('forbidden');
  });

  it('session and whoami report different things and never each other', () => {
    // session() must not leak a role; whoami() must not imply a session.
    expect('role' in (member('owner').authRepository.session().data ?? {})).toBe(false);
    expect('userId' in member('owner').authRepository.whoami().data).toBe(false);
    // The two null-role states are distinguishable, which was the whole defect.
    expect(signedOut().authRepository.session().data).toBe(null);
    expect(nonMember().authRepository.session().data).not.toBe(null);
    expect(signedOut().authRepository.whoami().data.role)
      .toBe(nonMember().authRepository.whoami().data.role);
  });

  it('membership is checked before the revision, so a viewer never sees a conflict', () => {
    const r = member('viewer');
    expect(r.propRepository.settle(store.props[0].id, 'WON', '999').error.kind).toBe('forbidden');
  });
});

describe('conflict detection', () => {
  it('rejects a stale expected revision and reports the server value', () => {
    const r = make();
    const id = store.props[0].id;
    expect(r.propRepository.settle(id, 'LOST', '1').ok).toBe(true);   // revision -> 2
    const stale = r.propRepository.settle(id, 'WON', '1');
    expect(stale.ok).toBe(false);
    expect(stale.error.kind).toBe('conflict');
    expect(stale.error.serverRevision).toBe('2');
    expect(isRevision(stale.error.serverRevision)).toBe(true);
  });

  it('accepts the fresh revision returned by the previous write', () => {
    const r = make();
    const id = store.props[0].id;
    const first = r.propRepository.settle(id, 'LOST', '1');
    expect(r.propRepository.settle(id, 'WON', first.revision).ok).toBe(true);
  });

  it('rejects a malformed revision outright', () => {
    expect(() => make().propRepository.settle(store.props[0].id, 'WON', 1)).toThrow(TypeError);
  });
});

describe('mutations preserve the frozen record', () => {
  it('amending the tracked price appends a market and leaves the assessment alone', () => {
    const r = make();
    const pos = r.predictionRepository.listGraded({}).data.find((x) => x.trackedOddsA !== null);
    const before = r.predictionRepository.getAggregate(
      store.bettingAssessments.find((a) => a.id ===
        store.trackedPositions.find((t) => t.id === pos.trackedPositionId).assessmentId).runId
    ).data;
    const res = r.predictionRepository.amendTrackedPrice(pos.trackedPositionId, -120, pos.revision);
    expect(res.ok).toBe(true);
    const after = r.predictionRepository.getAggregate(before.run.id).data;
    // The frozen assessment is untouched: same market pointer, same derived values.
    expect(after.assessment.marketSnapshotId).toBe(before.assessment.marketSnapshotId);
    expect(after.assessment.tier).toBe(before.assessment.tier);
    expect(after.assessment.edgeA).toBe(before.assessment.edgeA);
    expect(after.assessment.kellyA).toBe(before.assessment.kellyA);
    // Only the tracked position moved.
    expect(after.trackedPosition.marketSnapshotId).not.toBe(before.trackedPosition.marketSnapshotId);
  });

  it('changing the tracked corner does not repoint the market', () => {
    const r = make();
    const pos = r.predictionRepository.listGraded({}).data[0];
    const runId = store.bettingAssessments.find((a) => a.id ===
      store.trackedPositions.find((t) => t.id === pos.trackedPositionId).assessmentId).runId;
    const before = r.predictionRepository.getAggregate(runId).data.trackedPosition;
    const next = before.corner === 'A' ? 'B' : 'A';
    expect(r.predictionRepository.changeTrackedCorner(pos.trackedPositionId, next, pos.revision).ok).toBe(true);
    const after = r.predictionRepository.getAggregate(runId).data.trackedPosition;
    expect(after.corner).toBe(next);
    expect(after.marketSnapshotId).toBe(before.marketSnapshotId);
  });

  it('grading settles every dependent position and bumps each revision', () => {
    const r = make();
    const pending = r.predictionRepository.listPending().data[0];
    const res = r.predictionRepository.grade(
      pending.boutId, pending.trackedCorner, 'DEC', boutVector(r, pending.boutId));
    expect(res.ok, JSON.stringify(res.error ?? {})).toBe(true);
    expect(res.data.touched.length).toBeGreaterThan(0);
    for (const t of res.data.touched) expect(isRevision(t.revision)).toBe(true);
    const stillPending = r.predictionRepository.listPending().data
      .some((x) => x.boutId === pending.boutId);
    expect(stillPending).toBe(false);
  });

});

describe('deletion removes the COMPLETE aggregate, and only proven orphans', () => {
  it('remove() deletes position, assessment, markets, snapshots and run', () => {
    const r = make();
    const before = counts(r);
    const row = r.predictionRepository.listGraded({}).data[0];
    const runId = runIdOfPosition(row.trackedPositionId);
    const agg = r.predictionRepository.getAggregate(runId).data;
    const marketIds = new Set([agg.assessment.marketSnapshotId,
                               agg.trackedPosition.marketSnapshotId].filter(Boolean));

    const res = r.predictionRepository.remove(runId, row.revision);
    expect(res.ok).toBe(true);
    expect(res.data.physicallyRemoved).toBe(true);
    expect(res.data.retained).toEqual({
      run: false, assessment: false, marketSnapshots: 0, predictionSnapshots: 0,
    });

    const after = counts(r);
    expect(after.positions).toBe(before.positions - 1);
    expect(after.assessments).toBe(before.assessments - 1);
    expect(after.runs).toBe(before.runs - 1);
    expect(after.snapshots).toBe(before.snapshots - agg.snapshots.length);
    expect(after.markets).toBe(before.markets - marketIds.size);
    // Events and Bouts are shared card history and ALWAYS remain.
    expect(after.events).toBe(before.events);
    expect(after.bouts).toBe(before.bouts);
    expect(r.predictionRepository.getAggregate(runId).error.kind).toBe('notFound');
  });

  it('clearGraded deletes every graded aggregate whole, leaving nothing orphaned', () => {
    const r = make();
    const before = counts(r);
    const graded = r.predictionRepository.listGraded({}).data;
    const res = r.predictionRepository.clearGraded(
      graded.map((g) => ({ id: g.trackedPositionId, revision: g.revision })));
    expect(res.ok, JSON.stringify(res.error ?? {})).toBe(true);
    expect(res.data.removed).toBe(EXPECTED_GRADED);
    expect(res.data.rootsTombstoned).toBe(EXPECTED_GRADED);
    expect(res.data.physicallyRemoved).toBe(EXPECTED_GRADED);

    const after = counts(r);
    // THE regression: the old implementation dropped 153 positions and left
    // every assessment, run, snapshot and market behind.
    expect(after.positions).toBe(before.positions - EXPECTED_GRADED);
    expect(after.assessments).toBe(before.assessments - EXPECTED_GRADED);
    expect(after.runs).toBe(before.runs - EXPECTED_GRADED);
    expect(after.snapshots).toBeLessThan(before.snapshots);
    expect(after.markets).toBeLessThan(before.markets);
    expect(after.events).toBe(before.events);
    expect(after.bouts).toBe(before.bouts);
    // Every pending position and its aggregate survives intact.
    expect(r.predictionRepository.listPending().data).toHaveLength(EXPECTED_PENDING);
    for (const p of r.predictionRepository.listPending().data) {
      expect(r.predictionRepository.getAggregate(runIdOfPosition(p.trackedPositionId)).ok).toBe(true);
    }
  });

  it('a shared assessment and market survive because a WAGER still references them', () => {
    const r = make();
    const row = pricedRowWithTwoSnapshots(r);
    const runId = runIdOfPosition(row.trackedPositionId);
    const agg = r.predictionRepository.getAggregate(runId).data;
    expect(agg.snapshots).toHaveLength(2);
    const v2 = agg.snapshots.find((s) => s.basis === 'v2');
    // Nothing but the run's own runId column points at the v2 snapshot.
    expect(store.predictionRuns.some((x) => x.decisionSnapshotId === v2.id)).toBe(false);
    expect(store.bettingAssessments.some((x) => x.predictionSnapshotId === v2.id)).toBe(false);
    // A wager on the same bout, pointing at the same assessment and market.
    r.wagerRepository.create({
      id: '11111111-2222-4333-8444-555555555555',
      boutId: agg.trackedPosition.boutId,
      assessmentId: agg.assessment.id,
      marketSnapshotId: agg.trackedPosition.marketSnapshotId,
      corner: agg.trackedPosition.corner, stakeUnits: 1,
      placedAt: '2026-08-01T00:00:00.000Z',
      settlement: { status: 'open' }, notes: null, externalIds: {},
    });
    const before = counts(r);
    const res = r.predictionRepository.remove(runId, row.revision);
    expect(res.ok).toBe(true);
    const after = counts(r);
    expect(after.positions).toBe(before.positions - 1);
    // Proven-orphan check accounts for wager references: neither is an orphan.
    expect(after.assessments).toBe(before.assessments);
    expect(after.markets).toBe(before.markets);
    // …and the run row therefore also survives, because its assessment does.
    expect(after.runs).toBe(before.runs);
    expect(r.wagerRepository.listByBout(agg.trackedPosition.boutId).data).toHaveLength(1);

    // The response says so explicitly rather than reporting a bare "removed".
    expect(res.data.physicallyRemoved).toBe(false);
    expect(res.data.retained).toEqual({
      run: true, assessment: true, marketSnapshots: 1, predictionSnapshots: 2,
    });

    // BOTH snapshots survive, because the run row survives and they are its
    // children. Pruning by "does another run need it?" deleted the v2 here
    // while leaving the run alive — and neither StoreSchema nor checkInvariants
    // could see it, because a snapshot is only ever a child.
    const exportedNow = r.workspaceRepository.exportStore().data;
    expect(exportedNow.predictionSnapshots.filter((s) => s.runId === runId)).toHaveLength(2);
    expect(exportedNow.predictionSnapshots.some((s) => s.id === v2.id)).toBe(true);
    const survivingRun = exportedNow.predictionRuns.find((x) => x.id === runId);
    expect(survivingRun).toBeTruthy();
    expect(exportedNow.predictionSnapshots.some((s) => s.id === survivingRun.decisionSnapshotId))
      .toBe(true);

    // THE ambiguity: the root is LOGICALLY deleted regardless, and the
    // tombstone is authoritative.
    expect(r[SEED_LEDGER].find((x) => x.rootId === runId).removedAt)
      .toBe('2026-08-01T00:00:00.000Z');
    // getAggregate must NOT return a malformed success with no trackedPosition.
    const agg2 = r.predictionRepository.getAggregate(runId);
    expect(agg2.ok).toBe(false);
    expect(agg2.error.kind).toBe('notFound');
    expect(agg2.data).toBe(undefined);
    // Invisible to every read surface, and not re-deletable.
    expect(r.predictionRepository.listGraded({}).data
      .some((x) => x.trackedPositionId === row.trackedPositionId)).toBe(false);
    expect(r.predictionRepository.remove(runId, row.revision).error.kind).toBe('notFound');
    // The retained rows are still a coherent Store: export stays valid.
    const exported = r.workspaceRepository.exportStore().data;
    expect(StoreSchema.safeParse(exported).success).toBe(true);
    expect(checkInvariants(exported)).toEqual([]);
  });

  it('no live root ever yields an aggregate with a missing required part', () => {
    const r = make();
    // Exhaustive over the whole corpus, before and after a shared-wager delete.
    const allRunIds = store.predictionRuns.map((x) => x.id);
    const check = () => {
      for (const runId of allRunIds) {
        const res = r.predictionRepository.getAggregate(runId);
        if (!res.ok) continue;
        expect(res.data.run, runId).toBeTruthy();
        expect(res.data.assessment, runId).toBeTruthy();
        expect(res.data.trackedPosition, runId).toBeTruthy();
        expect(res.data.snapshots.length, runId).toBeGreaterThan(0);
      }
    };
    check();
    const row = pricedRowWithTwoSnapshots(r);
    const runId = runIdOfPosition(row.trackedPositionId);
    const agg = r.predictionRepository.getAggregate(runId).data;
    r.wagerRepository.create({
      id: '22222222-3333-4444-8555-666666666666', boutId: agg.trackedPosition.boutId,
      assessmentId: agg.assessment.id, marketSnapshotId: agg.trackedPosition.marketSnapshotId,
      corner: agg.trackedPosition.corner, stakeUnits: 1,
      placedAt: '2026-08-01T00:00:00.000Z',
      settlement: { status: 'open' }, notes: null, externalIds: {},
    });
    r.predictionRepository.remove(runId, row.revision);
    check();
  });

  it('the orphan check is not vacuous: without the wager, the whole chain goes', () => {
    // Same run as the shared-wager case, so the two tests differ in exactly one
    // fact: whether a wager pins the assessment.
    const r = make();
    const row = pricedRowWithTwoSnapshots(r);
    const runId = runIdOfPosition(row.trackedPositionId);
    const before = counts(r);
    const res = r.predictionRepository.remove(runId, row.revision);
    expect(res.ok).toBe(true);
    expect(res.data.physicallyRemoved).toBe(true);
    expect(res.data.retained).toEqual({
      run: false, assessment: false, marketSnapshots: 0, predictionSnapshots: 0,
    });
    const after = counts(r);
    expect(after.assessments).toBe(before.assessments - 1);
    expect(after.markets).toBeLessThan(before.markets);
    expect(after.runs).toBe(before.runs - 1);
    // BOTH snapshots go this time — nothing live is left to require them.
    expect(after.snapshots).toBe(before.snapshots - 2);
    const exported = r.workspaceRepository.exportStore().data;
    expect(exported.predictionSnapshots.filter((s) => s.runId === runId)).toHaveLength(0);
    expect(StoreSchema.safeParse(exported).success).toBe(true);
    expect(checkInvariants(exported)).toEqual([]);
  });

  it('a run row is never deleted while any snapshot still carries its runId', () => {
    // The structural guard behind step 5. Deleting the run while a snapshot
    // still pointed at it would dangle the FK that ON DELETE RESTRICT protects.
    const r = make();
    for (const row of r.predictionRepository.listGraded({}).data.slice(0, 40)) {
      r.predictionRepository.remove(runIdOfPosition(row.trackedPositionId), row.revision);
    }
    const s = r.workspaceRepository.exportStore().data;
    const liveRunIds = new Set(s.predictionRuns.map((x) => x.id));
    const dangling = s.predictionSnapshots.filter((x) => !liveRunIds.has(x.runId));
    expect(dangling).toEqual([]);
    expect(StoreSchema.safeParse(s).success).toBe(true);
    expect(checkInvariants(s)).toEqual([]);
  });

  it('a deleted root is tombstoned in the seed ledger; Events and Bouts never are', () => {
    const r = make();
    const row = r.predictionRepository.listGraded({}).data[0];
    const runId = runIdOfPosition(row.trackedPositionId);
    expect(r[SEED_LEDGER].find((x) => x.rootId === runId).removedAt).toBe(null);
    r.predictionRepository.remove(runId, row.revision);
    const entry = r[SEED_LEDGER].find((x) => x.rootId === runId);
    expect(entry.removedAt).toBe('2026-08-01T00:00:00.000Z');
    expect(r[SEED_LEDGER].every((x) => ['predictionRun', 'prop', 'parlay'].includes(x.rootType)))
      .toBe(true);
  });

  it('the ledger records every seeded root and tombstones exactly what is deleted', () => {
    const r = make();
    expect(r[SEED_LEDGER]).toHaveLength(EXPECTED_SEED_ROOTS);   // runs + props + parlays
    const row = r.predictionRepository.listGraded({}).data[0];
    const runId = runIdOfPosition(row.trackedPositionId);
    r.predictionRepository.remove(runId, row.revision);
    r.propRepository.remove(store.props[0].id, '1');

    const tombstoned = r[SEED_LEDGER].filter((x) => x.removedAt !== null);
    expect(tombstoned.map((x) => x.rootId).sort())
      .toEqual([runId, store.props[0].id].sort());
    expect(r[SEED_LEDGER]).toHaveLength(EXPECTED_SEED_ROOTS);   // tombstoned, not forgotten
    // Whether a later seed may re-insert a tombstoned root is Gate 3's
    // behaviour to build and prove; Gate 1 only guarantees the tombstone exists.
  });

  it('reset clears the ledger and the seed version', () => {
    const r = make();
    const row = r.predictionRepository.listGraded({}).data[0];
    r.predictionRepository.remove(runIdOfPosition(row.trackedPositionId), row.revision);
    expect(r.workspaceRepository.setSeedVersion('seed-1', '1').ok).toBe(true);
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).ok).toBe(true);
    expect(r[SEED_LEDGER]).toHaveLength(0);
    expect(r.workspaceRepository.seedVersion().data).toBe(null);
  });
});

describe('the exported Store is always exactly a Stage 6 Store', () => {
  const assertValidStore = (r, label) => {
    const res = r.workspaceRepository.exportStore();
    expect(res.ok, label).toBe(true);
    const parsed = StoreSchema.safeParse(res.data);
    expect(parsed.success,
      `${label}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 2))}`)
      .toBe(true);
    expect(checkInvariants(res.data), label).toEqual([]);
    // Storage metadata must never appear in Store content.
    expect('seedVersion' in res.data.meta, `${label}: seedVersion leaked into meta`).toBe(false);
    expect(Object.keys(res.data.meta).sort(), label).toEqual(['migratedAt', 'schemaVersion']);
    return res.data;
  };

  it('baseline', () => assertValidStore(make(), 'baseline'));

  it('after setSeedVersion — seed version is storage, not Store', () => {
    const r = make();
    expect(r.workspaceRepository.setSeedVersion('seed-1', '1').ok).toBe(true);
    // THE regression: this used to write into db.meta, and MetaSchema is
    // strict, so every later export failed with unrecognized_keys at `meta`.
    assertValidStore(r, 'after setSeedVersion');
    // …and it is still readable, from storage.
    expect(r.workspaceRepository.seedVersion().data).toBe('seed-1');
    expect(r.workspaceRepository.current().data.seedVersion).toBe('seed-1');
  });

  it('after reset', () => {
    const r = make();
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).ok).toBe(true);
    const s = assertValidStore(r, 'after reset');
    expect(s.trackedPositions).toHaveLength(0);
    expect(s.events).toHaveLength(0);
  });

  it('after import', () => {
    const r = make();
    expect(r.workspaceRepository.importStore(
      make().workspaceRepository.exportStore().data, { backupConfirmed: true }).ok).toBe(true);
    assertValidStore(r, 'after import');
  });

  it('after every retained mutation, in sequence', () => {
    const r = make();
    const pos = r.predictionRepository.listGraded({}).data.find((x) => x.trackedOddsA !== null);
    expect(r.predictionRepository.amendTrackedPrice(pos.trackedPositionId, -130, pos.revision).ok)
      .toBe(true);
    assertValidStore(r, 'after amendTrackedPrice');

    const p2 = r.predictionRepository.listGraded({}).data[1];
    expect(r.predictionRepository.changeTrackedCorner(
      p2.trackedPositionId, p2.trackedCorner === 'A' ? 'B' : 'A', p2.revision).ok).toBe(true);
    assertValidStore(r, 'after changeTrackedCorner');

    const ev = r.eventRepository.list().data[0];
    expect(r.eventRepository.rename(ev.id, { name: 'Renamed Card' }, '1').ok).toBe(true);
    assertValidStore(r, 'after rename');

    const pending = r.predictionRepository.listPending().data[0];
    expect(r.predictionRepository.grade(
      pending.boutId, pending.trackedCorner, 'DEC', boutVector(r, pending.boutId)).ok).toBe(true);
    assertValidStore(r, 'after grade');
    expect(r.predictionRepository.returnToPending(
      pending.boutId, boutVector(r, pending.boutId)).ok).toBe(true);
    assertValidStore(r, 'after returnToPending');

    expect(r.propRepository.settle(store.props[1].id, 'WON', '1').ok).toBe(true);
    assertValidStore(r, 'after prop settle');
    expect(r.propRepository.remove(store.props[1].id, '2').ok).toBe(true);
    assertValidStore(r, 'after prop remove');

    const row = r.predictionRepository.listGraded({}).data[3];
    expect(r.predictionRepository.remove(runIdOfPosition(row.trackedPositionId), row.revision).ok)
      .toBe(true);
    assertValidStore(r, 'after remove');

    expect(r.workspaceRepository.setSeedVersion('seed-9', '1').ok).toBe(true);
    const final = assertValidStore(r, 'after setSeedVersion');
    // The final store re-imports into a fresh repository unchanged.
    const fresh = make();
    expect(fresh.workspaceRepository.importStore(final, { backupConfirmed: true }).ok).toBe(true);
    expect(semanticEquals(fresh.workspaceRepository.exportStore().data, final)).toBe(true);
  });
});

describe('export and import safety', () => {
  it('exports a store that semantically round-trips through JSON', () => {
    const exported = make().workspaceRepository.exportStore().data;
    const rt = JSON.parse(JSON.stringify(exported));
    expect(semanticEquals(exported, rt)).toBe(true);
  });

  it('refuses a destructive import without confirmed backup', () => {
    const r = make();
    expect(r.workspaceRepository.importStore({ meta: { schemaVersion: 1 } }, {}).error.kind)
      .toBe('validation');
    expect(r.workspaceRepository.reset({}).error.kind).toBe('validation');
  });

  it('rejects an unknown future schema version', () => {
    const r = make();
    const res = r.workspaceRepository.importStore(
      { meta: { schemaVersion: 99 } }, { backupConfirmed: true });
    expect(res.ok).toBe(false);
    expect(res.error.issues[0].code).toBe('unknownFutureVersion');
  });

  it('reset clears entities and the seed version', () => {
    const r = make();
    expect(r.workspaceRepository.reset({ backupConfirmed: true }).ok).toBe(true);
    expect(r.predictionRepository.listGraded({}).data).toHaveLength(0);
    expect(r.workspaceRepository.seedVersion().data).toBe(null);
  });
});

describe('isolation', () => {
  it('each instance owns its data; mutations never touch the source store', () => {
    const a = make();
    const b = make();
    a.workspaceRepository.reset({ backupConfirmed: true });
    expect(b.predictionRepository.listGraded({}).data).toHaveLength(EXPECTED_GRADED);
    expect(store.trackedPositions).toHaveLength(EXPECTED_PREDICTIONS);
  });
});

describe('revision vectors cover the whole dependency set', () => {
  const pendingBout = (r) => r.predictionRepository.listPending().data[0];

  it('grade requires an entry for the bout AND every dependent', () => {
    const r = make();
    const p = pendingBout(r);
    const full = boutVector(r, p.boutId);
    expect(full.length).toBeGreaterThan(1);   // bout + at least one position

    // A bare bout revision — the old signature — is now rejected outright.
    const boutOnly = r.predictionRepository.grade(p.boutId, 'A', 'DEC', [full[0]]);
    expect(boutOnly.ok).toBe(false);
    expect(boutOnly.error.kind).toBe('validation');
    expect(boutOnly.error.issues[0].code).toBe('missingRevisionEntry');
  });

  it('one stale DEPENDENT revision aborts with zero mutation', () => {
    const r = make();
    const p = pendingBout(r);
    const vector = boutVector(r, p.boutId);
    const dependent = vector.find((e) => e.id !== p.boutId);
    expect(dependent).toBeTruthy();

    const before = JSON.stringify(r.workspaceRepository.exportStore().data);
    const res = r.predictionRepository.grade(p.boutId, 'A', 'DEC',
      vector.map((e) => (e.id === dependent.id ? { ...e, revision: '999' } : e)));

    expect(res.ok).toBe(false);
    expect(res.error.kind).toBe('conflict');
    expect(res.error.stale).toEqual([{ id: dependent.id, serverRevision: dependent.revision }]);
    expect(isRevision(res.error.serverRevision)).toBe(true);
    // ZERO mutation: the bout is still pending and nothing settled.
    expect(JSON.stringify(r.workspaceRepository.exportStore().data)).toBe(before);
    expect(r.boutRepository.get(p.boutId).data.result.status).toBe('pending');
    expect(r.boutRepository.get(p.boutId).revision).toBe(vector[0].revision);
  });

  it('a stale BOUT revision aborts the same way', () => {
    const r = make();
    const p = pendingBout(r);
    const vector = boutVector(r, p.boutId);
    const before = JSON.stringify(r.workspaceRepository.exportStore().data);
    const res = r.predictionRepository.grade(p.boutId, 'A', 'DEC',
      vector.map((e) => (e.id === p.boutId ? { ...e, revision: '999' } : e)));
    expect(res.error.kind).toBe('conflict');
    expect(JSON.stringify(r.workspaceRepository.exportStore().data)).toBe(before);
  });

  it('grade returns the complete touched vector, one entry per row written', () => {
    const r = make();
    const p = pendingBout(r);
    const vector = boutVector(r, p.boutId);
    const res = r.predictionRepository.grade(p.boutId, p.trackedCorner, 'DEC', vector);
    expect(res.ok).toBe(true);
    expect(res.data.touched.map((t) => t.id).sort()).toEqual(vector.map((e) => e.id).sort());
    for (const t of res.data.touched) {
      expect(isRevision(t.revision)).toBe(true);
      expect(BigInt(t.revision)).toBe(
        BigInt(vector.find((e) => e.id === t.id).revision) + 1n);
    }
    // The bout's own new revision is also the Result revision.
    expect(res.revision).toBe(res.data.touched.find((t) => t.id === p.boutId).revision);
  });

  it('grade covers WAGERS on the bout, not just tracked positions', () => {
    const r = make();
    const p = pendingBout(r);
    const agg = r.predictionRepository.getAggregate(runIdOfPosition(p.trackedPositionId)).data;
    r.wagerRepository.create({
      id: '99999999-8888-4777-8666-555555555555',
      boutId: p.boutId, assessmentId: agg.assessment.id,
      marketSnapshotId: agg.trackedPosition.marketSnapshotId,
      corner: 'A', stakeUnits: 2, placedAt: '2026-08-01T00:00:00.000Z',
      settlement: { status: 'open' }, notes: null, externalIds: {},
    });
    // The vector taken BEFORE the wager existed is now incomplete.
    const stalePlan = [{ id: p.boutId, revision: r.boutRepository.get(p.boutId).revision },
                       { id: p.trackedPositionId, revision: p.revision }];
    const res = r.predictionRepository.grade(p.boutId, 'A', 'DEC', stalePlan);
    expect(res.error.kind).toBe('validation');
    expect(res.error.issues[0].code).toBe('missingRevisionEntry');

    const okRes = r.predictionRepository.grade(p.boutId, 'A', 'DEC', boutVector(r, p.boutId));
    expect(okRes.ok, JSON.stringify(okRes.error ?? {})).toBe(true);
    expect(okRes.data.touched.some((t) => t.table === 'wagers')).toBe(true);
    expect(r.wagerRepository.listByBout(p.boutId).data[0].settlement.status).toBe('settled');
  });

  it('rejects duplicate, unknown and malformed entries before mutating', () => {
    const r = make();
    const p = pendingBout(r);
    const vector = boutVector(r, p.boutId);
    const before = JSON.stringify(r.workspaceRepository.exportStore().data);

    const dup = r.predictionRepository.grade(p.boutId, 'A', 'DEC', [...vector, vector[0]]);
    expect(dup.error.issues[0].code).toBe('duplicateRevisionEntry');

    const unknown = r.predictionRepository.grade(p.boutId, 'A', 'DEC',
      [...vector, { id: 'not-a-row', revision: '1' }]);
    expect(unknown.error.issues[0].code).toBe('unknownRevisionEntry');

    const malformed = r.predictionRepository.grade(p.boutId, 'A', 'DEC',
      vector.map((e, i) => (i === 0 ? { ...e, revision: 1 } : e)));
    expect(malformed.error.issues[0].code).toBe('malformedRevision');

    const notAnArray = r.predictionRepository.grade(p.boutId, 'A', 'DEC', undefined);
    expect(notAnArray.error.issues[0].code).toBe('revisionVectorRequired');

    expect(JSON.stringify(r.workspaceRepository.exportStore().data)).toBe(before);
  });

  it('input ordering does not matter', () => {
    const a = make(); const b = make();
    const p = pendingBout(a);
    const forward = boutVector(a, p.boutId);
    const reversed = [...boutVector(b, p.boutId)].reverse();
    const ra = a.predictionRepository.grade(p.boutId, 'A', 'DEC', forward);
    const rb = b.predictionRepository.grade(p.boutId, 'A', 'DEC', reversed);
    expect(ra.ok).toBe(true);
    expect(rb.ok).toBe(true);
    expect(semanticEquals(a.workspaceRepository.exportStore().data,
                          b.workspaceRepository.exportStore().data)).toBe(true);
  });

  it('returnToPending takes the same vector and reopens every dependent', () => {
    const r = make();
    const p = pendingBout(r);
    expect(r.predictionRepository.grade(p.boutId, 'A', 'DEC', boutVector(r, p.boutId)).ok).toBe(true);
    // A bare bout revision is refused here too.
    expect(r.predictionRepository.returnToPending(p.boutId,
      [{ id: p.boutId, revision: r.boutRepository.get(p.boutId).revision }])
      .error.issues[0].code).toBe('missingRevisionEntry');
    const res = r.predictionRepository.returnToPending(p.boutId, boutVector(r, p.boutId));
    expect(res.ok, JSON.stringify(res.error ?? {})).toBe(true);
    expect(r.boutRepository.get(p.boutId).data.result.status).toBe('pending');
    expect(r.predictionRepository.listPending().data.some((x) => x.boutId === p.boutId)).toBe(true);
  });

  it('clearGraded refuses an empty vector — the exact bug that deleted every graded row', () => {
    const r = make();
    const before = counts(r);
    const res = r.predictionRepository.clearGraded([]);
    expect(res.ok).toBe(false);
    expect(res.error.kind).toBe('validation');
    // One missing-entry issue per graded row it refused to touch.
    expect(res.error.issues).toHaveLength(EXPECTED_GRADED);
    expect(res.error.issues[0].code).toBe('missingRevisionEntry');
    expect(counts(r)).toEqual(before);
  });

  it('clearGraded aborts on one stale entry, deleting nothing', () => {
    const r = make();
    const before = JSON.stringify(r.workspaceRepository.exportStore().data);
    const graded = r.predictionRepository.listGraded({}).data;
    const res = r.predictionRepository.clearGraded(
      graded.map((g, i) => ({ id: g.trackedPositionId, revision: i === 77 ? '999' : g.revision })));
    expect(res.error.kind).toBe('conflict');
    expect(res.error.stale[0].id).toBe(graded[77].trackedPositionId);
    expect(JSON.stringify(r.workspaceRepository.exportStore().data)).toBe(before);
  });

  it('clearGraded rejects an entry for a row it will not touch', () => {
    const r = make();
    const graded = r.predictionRepository.listGraded({}).data;
    const pending = r.predictionRepository.listPending().data[0];
    const res = r.predictionRepository.clearGraded([
      ...graded.map((g) => ({ id: g.trackedPositionId, revision: g.revision })),
      { id: pending.trackedPositionId, revision: pending.revision },
    ]);
    expect(res.error.issues[0].code).toBe('unknownRevisionEntry');
    expect(res.error.issues[0].id).toBe(pending.trackedPositionId);
  });

  it('confirmAllPending takes an ID-keyed vector and is order-independent', () => {
    const r = make();
    // Nothing is review-pending in the migrated corpus, so create the state.
    const target = r.predictionRepository.listPending().data[0];
    const exported = r.workspaceRepository.exportStore().data;
    exported.trackedPositions.find((t) => t.id === target.trackedPositionId)
      .reviewState = { status: 'pending', reason: 'autoGenerated' };
    expect(r.workspaceRepository.importStore(exported, { backupConfirmed: true }).ok).toBe(true);

    const positionId = target.trackedPositionId;
    expect(r.predictionRepository.confirmAllPending([]).error.issues[0].code)
      .toBe('missingRevisionEntry');
    expect(r.predictionRepository.confirmAllPending([{ id: positionId, revision: '999' }])
      .error.kind).toBe('conflict');
    const res = r.predictionRepository.confirmAllPending([{ id: positionId, revision: '1' }]);
    expect(res.ok, JSON.stringify(res.error ?? {})).toBe(true);
    expect(res.data.confirmed).toBe(1);
    expect(res.data.touched[0].id).toBe(positionId);
  });
});

describe('import is atomic and fully validated', () => {
  const exportOf = () => make().workspaceRepository.exportStore().data;

  it('a valid whole store replaces the previous one completely', () => {
    const r = make();
    const incoming = exportOf();
    incoming.trackedPositions = incoming.trackedPositions.slice(0, 3);
    incoming.wagers = [];
    const res = r.workspaceRepository.importStore(incoming, { backupConfirmed: true });
    expect(res.ok, JSON.stringify(res.error ?? {})).toBe(true);
    // REPLACE, not merge: every position outside the sliced three is gone, not retained.
    expect(counts(r).positions).toBe(3);
  });

  it('an unknown top-level key is rejected, never copied in', () => {
    const r = make();
    const before = counts(r);
    const incoming = { ...exportOf(), bogusKey: [1, 2, 3] };
    const res = r.workspaceRepository.importStore(incoming, { backupConfirmed: true });
    expect(res.ok).toBe(false);
    expect(res.error.kind).toBe('validation');
    expect('bogusKey' in r.workspaceRepository.exportStore().data).toBe(false);
    expect(counts(r)).toEqual(before);
  });

  it('a store that fails schema validation leaves the original untouched', () => {
    const r = make();
    const before = JSON.stringify(r.workspaceRepository.exportStore().data);
    const incoming = exportOf();
    incoming.trackedPositions[0].stakeUnits = -5;   // stakeUnits must be > 0
    const res = r.workspaceRepository.importStore(incoming, { backupConfirmed: true });
    expect(res.ok).toBe(false);
    expect(res.error.kind).toBe('validation');
    expect(JSON.stringify(r.workspaceRepository.exportStore().data)).toBe(before);
  });

  it('a store that breaks referential invariants is rejected atomically', () => {
    const r = make();
    const before = JSON.stringify(r.workspaceRepository.exportStore().data);
    const incoming = exportOf();
    // Schema-valid in isolation, but the positions now point at nothing.
    incoming.bettingAssessments = [];
    const res = r.workspaceRepository.importStore(incoming, { backupConfirmed: true });
    expect(res.ok).toBe(false);
    expect(res.error.issues.some((i) => i.code === 'invariant')).toBe(true);
    expect(JSON.stringify(r.workspaceRepository.exportStore().data)).toBe(before);
  });

  it('a partial store — missing whole collections — is rejected', () => {
    const r = make();
    const before = JSON.stringify(r.workspaceRepository.exportStore().data);
    const { trackedPositions, ...partial } = exportOf();
    expect(trackedPositions).toBeTruthy();
    const res = r.workspaceRepository.importStore(partial, { backupConfirmed: true });
    expect(res.ok).toBe(false);
    expect(res.error.kind).toBe('validation');
    // The old code kept the previously loaded positions and called the import a success.
    expect(JSON.stringify(r.workspaceRepository.exportStore().data)).toBe(before);
  });

  it('non-objects and arrays are rejected', () => {
    const r = make();
    for (const bad of [null, [], 'store', 42]) {
      expect(r.workspaceRepository.importStore(bad, { backupConfirmed: true }).ok, String(bad))
        .toBe(false);
    }
    expect(counts(r).positions).toBe(EXPECTED_PREDICTIONS);
  });

  it('a full export re-imports cleanly, even after an amended price', () => {
    const r = make();
    const pos = r.predictionRepository.listGraded({}).data.find((x) => x.trackedOddsA !== null);
    expect(r.predictionRepository.amendTrackedPrice(pos.trackedPositionId, -125, pos.revision).ok)
      .toBe(true);
    const exported = r.workspaceRepository.exportStore().data;
    const res = r.workspaceRepository.importStore(exported, { backupConfirmed: true });
    expect(res.ok, JSON.stringify(res.error ?? {})).toBe(true);
    expect(counts(r).positions).toBe(EXPECTED_PREDICTIONS);
  });

  it('import rebuilds the seed ledger from the incoming store', () => {
    const r = make();
    const row = r.predictionRepository.listGraded({}).data[0];
    r.predictionRepository.remove(runIdOfPosition(row.trackedPositionId), row.revision);
    expect(r[SEED_LEDGER].filter((x) => x.removedAt !== null)).toHaveLength(1);
    expect(r.workspaceRepository.importStore(exportOf(), { backupConfirmed: true }).ok).toBe(true);
    expect(r[SEED_LEDGER]).toHaveLength(EXPECTED_SEED_ROOTS);
    expect(r[SEED_LEDGER].every((x) => x.removedAt === null)).toBe(true);
  });
});
