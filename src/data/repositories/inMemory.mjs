// Stage 7 Gate 1 — in-memory repository backing.
//
// Backed by a real Stage 6 durable Store, so the contract tests exercise the
// actual migrated data rather than hand-written fixtures. This is the offline
// tier that keeps `npm test` fast and Supabase-free; Gate 6 adds a Postgres
// backing that must satisfy the identical contract.
//
// It deliberately models the parts of the Postgres contract that are easy to
// get wrong later: opaque string revisions, whole-dependency-set revision
// vectors, authentication distinguished from membership, the documented
// aggregate deletion order with proven-orphan checks, the seed ledger with its
// root tombstones, and stake values crossing the boundary as decimal strings.
import {
  ok, err, conflict, forbidden, notFound, unauthenticated, validation,
  assertRevision, isRevision, toStakeTransport, fromStakeTransport,
} from './types.mjs';
import { StoreSchema } from '../schemas/entities.mjs';
import { checkInvariants } from '../schemas/invariants.mjs';
import { uuidv5, NS } from '../migration/ids.mjs';

const clone = (v) => structuredClone(v);

/**
 * Test-only seams. Symbol-keyed on purpose: `conformsToContract` enumerates
 * string keys, so these cannot silently widen the repository surface the UI is
 * allowed to depend on. The seed ledger is `seed_items` from the plan; Gate 3
 * replaces APPLY_SEED with the real seeding RPC.
 */
export const SEED_LEDGER = Symbol('fm.seedLedger');
export const APPLY_SEED = Symbol('fm.applySeed');

/** Root types the ledger tracks. Events and Bouts are NEVER tombstoned. */
const ROOT_TYPES = Object.freeze(['predictionRun', 'prop', 'parlay']);

/**
 * @param {object} store   a validated Stage 6 Store
 * @param {object} opts
 *   session      {userId} | null   — authentication only
 *   role         'owner'|'editor'|'viewer'|null — membership only
 *   ownerExists  boolean           — does the workspace already have an owner
 *   now          () => ISO string
 */
export function createInMemoryRepositories(store, opts = {}) {
  const db = clone(store);
  const now = opts.now ?? (() => new Date().toISOString());

  // ── Authentication and membership are SEPARATE axes ───────────────────────
  // Conflating them made "signed out" and "signed in but not a member"
  // indistinguishable, which in turn made it impossible for the second state to
  // claim ownership of a zero-owner workspace — the one thing it must be able
  // to do. Three states are now representable:
  //
  //   session null, role null     signed out
  //   session set,  role null     signed-in non-member (public read, no writes,
  //                               MAY claim a zero-owner workspace)
  //   session set,  role set      member: owner | editor | viewer
  const role = opts.role === undefined ? 'owner' : opts.role;
  const session = opts.session === undefined
    ? (role === null ? null : { userId: 'in-memory-user' })
    : opts.session;
  let ownerExists = opts.ownerExists === undefined ? role !== null : opts.ownerExists;

  // Revisions are storage-only and never part of the Stage 6 Store, exactly as
  // in Postgres. They live beside it, keyed by `${table}:${id}`.
  const revisions = new Map();
  const revKey = (table, id) => `${table}:${id}`;
  const revOf = (table, id) => revisions.get(revKey(table, id)) ?? '1';
  const bump = (table, id) => {
    const next = String(BigInt(revOf(table, id)) + 1n);
    revisions.set(revKey(table, id), next);
    return next;
  };

  // ── Seed ledger (`seed_items`) ────────────────────────────────────────────
  // Ledger MEMBERSHIP is the seeding test, not table membership: after ROI is
  // cleared the IDs no longer conflict, so ON CONFLICT DO NOTHING alone would
  // let a stale seed resurrect deleted roots.
  const ledger = new Map();  // `${rootType}:${rootId}` -> {rootType,rootId,firstSeedVersion,removedAt}
  const ledgerKey = (rootType, rootId) => `${rootType}:${rootId}`;
  const rootsOf = (s) => [
    ...s.predictionRuns.map((r) => ['predictionRun', r.id]),
    ...s.props.map((p) => ['prop', p.id]),
    ...s.parlays.map((p) => ['parlay', p.id]),
  ];
  const seedLedgerFrom = (s, seedVersion) => {
    ledger.clear();
    for (const [rootType, rootId] of rootsOf(s)) {
      ledger.set(ledgerKey(rootType, rootId), {
        rootType, rootId, firstSeedVersion: seedVersion ?? null, removedAt: null,
      });
    }
  };
  const tombstone = (rootType, rootId) => {
    const key = ledgerKey(rootType, rootId);
    const row = ledger.get(key);
    if (row) row.removedAt = now();
    else ledger.set(key, { rootType, rootId, firstSeedVersion: null, removedAt: now() });
  };
  seedLedgerFrom(db, db.meta.seedVersion ?? null);

  const canWrite = () => role === 'owner' || role === 'editor';
  const canRead = () => role === 'owner' || role === 'editor' || role === 'viewer';

  /**
   * Membership gate. Authentication is checked FIRST and reported distinctly:
   * a signed-out visitor gets `unauthenticated` (sign in), a signed-in
   * non-member gets `forbidden` (ask for access) — different UI, different fix.
   */
  const requireMember = (requireOwner = false) => {
    if (session === null) return unauthenticated();
    if (role === null) return forbidden();
    if (requireOwner ? role !== 'owner' : !canWrite()) return forbidden();
    return null;
  };

  /** Gate a write on session, then membership, then expected revision. */
  const guardWrite = (table, id, expectedRevision, requireOwner = false) => {
    const m = requireMember(requireOwner);
    if (m) return m;
    if (expectedRevision !== undefined) {
      assertRevision(expectedRevision);
      const current = revOf(table, id);
      if (current !== expectedRevision) return conflict(current);
    }
    return null;
  };

  const byId = (rows, id) => rows.find((r) => r.id === id) ?? null;

  // ── Revision vectors ──────────────────────────────────────────────────────
  /**
   * A bulk or cascading write is atomic, so it takes an ID-KEYED vector
   * covering every row it will touch, and every entry is checked BEFORE
   * anything mutates.
   *
   * Positional arrays were unsound twice over: the caller had to guess the
   * server's ordering, and a short or empty array silently skipped the check
   * for every unlisted row. `clearGraded([])` deleted 153 positions without
   * validating a single revision.
   *
   * @param {{table:string,id:string}[]} required every row the write will touch
   * @param {{id:string,revision:string}[]} provided the caller's vector
   * @returns {null|object} null to proceed, otherwise the Result to return
   */
  const checkRevisionVector = (required, provided) => {
    if (!Array.isArray(provided)) {
      return validation([{ field: 'revisions', code: 'revisionVectorRequired' }]);
    }
    const seen = new Map();
    for (const entry of provided) {
      if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string') {
        return validation([{ field: 'revisions', code: 'malformedRevisionEntry' }]);
      }
      if (!isRevision(entry.revision)) {
        return validation([{ field: 'revisions', code: 'malformedRevision', id: entry.id }]);
      }
      if (seen.has(entry.id)) {
        return validation([{ field: 'revisions', code: 'duplicateRevisionEntry', id: entry.id }]);
      }
      seen.set(entry.id, entry.revision);
    }
    const requiredIds = new Set(required.map((r) => r.id));
    const missing = [...requiredIds].filter((id) => !seen.has(id));
    if (missing.length) {
      return validation(missing.map((id) => ({ field: 'revisions', code: 'missingRevisionEntry', id })));
    }
    const unknown = [...seen.keys()].filter((id) => !requiredIds.has(id));
    if (unknown.length) {
      return validation(unknown.map((id) => ({ field: 'revisions', code: 'unknownRevisionEntry', id })));
    }
    // Ordering of `provided` is irrelevant: lookup is by id, never by index.
    const stale = [];
    for (const { table, id } of required) {
      const current = revOf(table, id);
      if (seen.get(id) !== current) stale.push({ id, serverRevision: current });
    }
    if (stale.length) return conflict(stale[0].serverRevision, stale);
    return null;
  };

  /** Everything a bout-result write touches: the bout and ALL its dependents. */
  const dependentsOfBout = (boutId) => [
    { table: 'bouts', id: boutId },
    ...db.trackedPositions.filter((t) => t.boutId === boutId)
      .map((t) => ({ table: 'tracked_positions', id: t.id })),
    ...db.wagers.filter((w) => w.boutId === boutId)
      .map((w) => ({ table: 'wagers', id: w.id })),
  ];

  // ── Deletion ──────────────────────────────────────────────────────────────
  /**
   * The documented order: position -> assessment -> market snapshots ->
   * prediction snapshots -> run -> STOP.
   *
   * Every step past the position is a PROVEN-ORPHAN check by counted reference,
   * including wager references — wagers carry both assessmentId and
   * marketSnapshotId, so a shared assessment or market survives the delete.
   * Events and Bouts are shared card history and always remain: 4 bouts are
   * already referenced by both a prop and a prediction run.
   */
  const deleteAggregate = (runId) => {
    const assessment = db.bettingAssessments.find((a) => a.runId === runId) ?? null;
    const positions = assessment
      ? db.trackedPositions.filter((t) => t.assessmentId === assessment.id) : [];

    const marketCandidates = new Set();
    for (const t of positions) if (t.marketSnapshotId) marketCandidates.add(t.marketSnapshotId);
    if (assessment?.marketSnapshotId) marketCandidates.add(assessment.marketSnapshotId);

    // 1. tracked positions
    const posIds = new Set(positions.map((t) => t.id));
    db.trackedPositions = db.trackedPositions.filter((t) => !posIds.has(t.id));

    // 2. assessment — only if no position AND no wager still references it
    if (assessment
        && !db.trackedPositions.some((t) => t.assessmentId === assessment.id)
        && !db.wagers.some((w) => w.assessmentId === assessment.id)) {
      db.bettingAssessments = db.bettingAssessments.filter((a) => a.id !== assessment.id);
    }

    // 3. market snapshots — only those nothing surviving points at
    for (const mid of marketCandidates) {
      if (db.bettingAssessments.some((a) => a.marketSnapshotId === mid)) continue;
      if (db.trackedPositions.some((t) => t.marketSnapshotId === mid)) continue;
      if (db.wagers.some((w) => w.marketSnapshotId === mid)) continue;
      db.marketSnapshots = db.marketSnapshots.filter((m) => m.id !== mid);
    }

    // 4. prediction snapshots — only those no surviving assessment or run needs
    for (const sid of db.predictionSnapshots.filter((s) => s.runId === runId).map((s) => s.id)) {
      if (db.bettingAssessments.some((a) => a.predictionSnapshotId === sid)) continue;
      if (db.predictionRuns.some((r) => r.id !== runId && r.decisionSnapshotId === sid)) continue;
      db.predictionSnapshots = db.predictionSnapshots.filter((s) => s.id !== sid);
    }

    // 5. run — only if nothing surviving points at it; then tombstone the root
    let rootRemoved = false;
    if (!db.predictionSnapshots.some((s) => s.runId === runId)
        && !db.bettingAssessments.some((a) => a.runId === runId)) {
      db.predictionRuns = db.predictionRuns.filter((r) => r.id !== runId);
      tombstone('predictionRun', runId);
      rootRemoved = true;
    }
    // 6. STOP. Events and Bouts always remain.
    return { positions: posIds.size, rootRemoved };
  };

  // ── projections ───────────────────────────────────────────────────────────
  // Stake crosses the boundary as a decimal string, mirroring stake_units::text.
  const positionRow = (t) => {
    const a = byId(db.bettingAssessments, t.assessmentId);
    const run = db.predictionRuns.find((r) => r.id === a.runId);
    const snap = byId(db.predictionSnapshots, run.decisionSnapshotId);
    const bout = byId(db.bouts, t.boutId);
    const event = byId(db.events, bout.eventId);
    const market = t.marketSnapshotId ? byId(db.marketSnapshots, t.marketSnapshotId) : null;
    return {
      trackedPositionId: t.id,
      boutId: bout.id,
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date,
      division: bout.division,
      cornerAName: bout.cornerA.displayName,
      cornerBName: bout.cornerB.displayName,
      trackedCorner: t.corner,
      stakeUnits: toStakeTransport(t.stakeUnits),
      probA: snap.probA,
      probB: snap.probB,
      winnerCorner: snap.winnerCorner,
      tier: a.tier,
      recommendedCorner: a.recommendedCorner,
      fairLineA: a.fairLineA, fairLineB: a.fairLineB,
      edgeA: a.edgeA, edgeB: a.edgeB,
      evA: a.evA, evB: a.evB,
      kellyA: a.kellyA, kellyB: a.kellyB,
      trackedOddsA: market ? market.oddsA : null,
      trackedOddsB: market ? market.oddsB : null,
      resultStatus: bout.result.status,
      resultOutcome: bout.result.status === 'resolved' ? bout.result.outcome : null,
      resultMethod: bout.result.status === 'resolved' ? bout.result.method : null,
      settlement: clone(t.settlement),
      reviewState: clone(t.reviewState),
      finishProjection: clone(run.finishProjection),
      revision: revOf('tracked_positions', t.id),
    };
  };

  /**
   * The legacy-entry shape src/domain/statistics already consumes. Assembled
   * here, never computed: no ROI, tier, calibration or probability is derived.
   */
  const statisticsRow = (t) => {
    const a = byId(db.bettingAssessments, t.assessmentId);
    const run = db.predictionRuns.find((r) => r.id === a.runId);
    const bout = byId(db.bouts, t.boutId);
    const event = byId(db.events, bout.eventId);
    const market = t.marketSnapshotId ? byId(db.marketSnapshots, t.marketSnapshotId) : null;
    const snaps = db.predictionSnapshots.filter((s) => s.runId === run.id);
    const v1 = snaps.find((s) => s.basis === 'legacy-v1-unversioned');
    const v2 = snaps.find((s) => s.basis === 'v2') ?? null;
    const cornerName = (c) => (c === 'A' ? bout.cornerA.displayName : bout.cornerB.displayName);
    const selectedOdds = market ? (t.corner === 'A' ? market.oddsA : market.oddsB) : null;
    const outcome = bout.result.status === 'resolved' ? bout.result.outcome : null;
    return {
      id: run.legacyEntryId ?? run.id,
      fighterA: bout.cornerA.displayName,
      fighterB: bout.cornerB.displayName,
      eventName: event.name,
      eventDate: event.date,
      actualWinner: outcome === null ? ''
        : outcome === 'draw' ? 'DRAW'
        : outcome === 'noContest' ? 'NC'
        : cornerName(outcome),
      marketOdds: selectedOdds === null ? '' : String(selectedOdds),
      trackedSide: cornerName(t.corner),
      unitsWagered: t.stakeUnits,
      predictedWinner: cornerName(v1.winnerCorner),
      fighterAProb: v1.probA,
      fighterBProb: v1.probB,
      ...(v2 ? { v2pA: v2.probA, v2pB: v2.probB } : {}),
      betAction: a.tier,
      includesProspect: run.includesProspectAtCapture,
      fighterAIsProspect: run.cornerAIsProspectAtCapture,
      fighterBIsProspect: run.cornerBIsProspectAtCapture,
      // Statistics exclude ONLY the pending review state.
      confirmedByUser: t.reviewState.status === 'pending' ? false : true,
      _provenance: { captureMode: (v2 ?? v1).captureMode },
    };
  };

  // The workspace is public-read, so reads are open to signed-out visitors,
  // signed-in non-members and members alike. MEMBERSHIP GATES WRITES, and
  // exportStore, which is the whole private store rather than a read surface.

  // ── repositories ──────────────────────────────────────────────────────────
  // Every method below declares EXACTLY the contract's parameter count with
  // ordinary parameters; options are destructured in the body. conformsToContract
  // compares Function.length with `===`, so a stub cannot shed parameters.
  const eventRepository = {
    list: () => ok(db.events.map(clone)),
    get: (id) => { const e = byId(db.events, id); return e ? ok(clone(e), revOf('events', id)) : notFound(); },
    listWithBoutCounts: () => ok(db.events.map((e) => ({
      event: clone(e),
      boutCount: db.bouts.filter((b) => b.eventId === e.id).length,
    }))),
    rename: (id, patch, expectedRevision) => {
      const g = guardWrite('events', id, expectedRevision);
      if (g) return g;
      const e = byId(db.events, id);
      if (!e) return notFound();
      if (patch.name !== undefined && !patch.name) return validation([{ field: 'name' }]);
      Object.assign(e, patch);
      return ok({ id, affectedBouts: db.bouts.filter((b) => b.eventId === id).length },
                bump('events', id));
    },
  };

  const boutRepository = {
    listByEvent: (eventId) => ok(db.bouts.filter((b) => b.eventId === eventId).map(clone)),
    get: (id) => { const b = byId(db.bouts, id); return b ? ok(clone(b), revOf('bouts', id)) : notFound(); },
    listPendingResults: () => ok(db.bouts.filter((b) => b.result.status === 'pending').map(clone)),
  };

  const positionsFor = (settled) =>
    db.trackedPositions.filter((t) => (t.settlement.status === 'settled') === settled);

  const predictionRepository = {
    listPending: () => ok(positionsFor(false).map(positionRow)),
    listGraded: (options) => {
      const { since } = options ?? {};
      return ok(positionsFor(true).map(positionRow).filter((r) => !since || r.eventDate >= since));
    },
    getAggregate: (runId) => {
      const run = db.predictionRuns.find((r) => r.id === runId);
      if (!run) return notFound();
      const a = db.bettingAssessments.find((x) => x.runId === runId);
      return ok({
        run: clone(run),
        snapshots: db.predictionSnapshots.filter((s) => s.runId === runId).map(clone),
        assessment: clone(a),
        trackedPosition: clone(db.trackedPositions.find((t) => t.assessmentId === a.id)),
      });
    },
    savePrediction: (aggregate) => {
      const m = requireMember();
      if (m) return m;
      if (!aggregate?.run?.id) return validation([{ field: 'run.id' }]);
      db.predictionRuns.push(clone(aggregate.run));
      (aggregate.snapshots ?? []).forEach((s) => db.predictionSnapshots.push(clone(s)));
      if (aggregate.marketSnapshot) db.marketSnapshots.push(clone(aggregate.marketSnapshot));
      db.bettingAssessments.push(clone(aggregate.assessment));
      db.trackedPositions.push(clone(aggregate.trackedPosition));
      ledger.set(ledgerKey('predictionRun', aggregate.run.id), {
        rootType: 'predictionRun', rootId: aggregate.run.id,
        firstSeedVersion: null, removedAt: null,
      });
      return ok({ runId: aggregate.run.id });
    },
    remove: (runId, expectedRevision) => {
      const a = db.bettingAssessments.find((x) => x.runId === runId);
      if (!a) return notFound();
      const t = db.trackedPositions.find((x) => x.assessmentId === a.id);
      const g = guardWrite('tracked_positions', t.id, expectedRevision);
      if (g) return g;
      const { rootRemoved } = deleteAggregate(runId);
      return ok({ removed: runId, rootRemoved });
    },
    clearGraded: (revisions) => {
      const m = requireMember(true);
      if (m) return m;
      const graded = positionsFor(true);
      const v = checkRevisionVector(
        graded.map((t) => ({ table: 'tracked_positions', id: t.id })), revisions);
      if (v) return v;
      // ---- nothing above this line has mutated anything ----
      const runIds = [...new Set(graded.map(
        (t) => byId(db.bettingAssessments, t.assessmentId).runId))];
      let rootsRemoved = 0;
      for (const runId of runIds) if (deleteAggregate(runId).rootRemoved) rootsRemoved += 1;
      return ok({ removed: graded.length, rootsRemoved });
    },
    grade: (boutId, outcome, method, revisions) => {
      const m = requireMember();
      if (m) return m;
      const bout = byId(db.bouts, boutId);
      if (!bout) return notFound();
      if (!['A', 'B', 'draw', 'noContest'].includes(outcome)) {
        return validation([{ field: 'outcome' }]);
      }
      const v = checkRevisionVector(dependentsOfBout(boutId), revisions);
      if (v) return v;
      // ---- nothing above this line has mutated anything ----
      const stamp = now();
      bout.result = { status: 'resolved', outcome, method: method ?? null };
      const touched = [{ table: 'bouts', id: boutId, revision: bump('bouts', boutId) }];
      for (const t of db.trackedPositions.filter((x) => x.boutId === boutId)) {
        t.settlement = settleAgainst(t, bout, db, stamp);
        touched.push({ table: 'tracked_positions', id: t.id, revision: bump('tracked_positions', t.id) });
      }
      for (const w of db.wagers.filter((x) => x.boutId === boutId)) {
        w.settlement = settleAgainst(w, bout, db, stamp);
        touched.push({ table: 'wagers', id: w.id, revision: bump('wagers', w.id) });
      }
      return ok({ boutId, touched }, revOf('bouts', boutId));
    },
    returnToPending: (boutId, revisions) => {
      const m = requireMember();
      if (m) return m;
      const bout = byId(db.bouts, boutId);
      if (!bout) return notFound();
      const v = checkRevisionVector(dependentsOfBout(boutId), revisions);
      if (v) return v;
      // ---- nothing above this line has mutated anything ----
      bout.result = { status: 'pending' };
      const touched = [{ table: 'bouts', id: boutId, revision: bump('bouts', boutId) }];
      for (const t of db.trackedPositions.filter((x) => x.boutId === boutId)) {
        t.settlement = { status: 'open' };
        touched.push({ table: 'tracked_positions', id: t.id, revision: bump('tracked_positions', t.id) });
      }
      for (const w of db.wagers.filter((x) => x.boutId === boutId)) {
        w.settlement = { status: 'open' };
        touched.push({ table: 'wagers', id: w.id, revision: bump('wagers', w.id) });
      }
      return ok({ boutId, touched }, revOf('bouts', boutId));
    },
    changeTrackedCorner: (positionId, corner, expectedRevision) => {
      const g = guardWrite('tracked_positions', positionId, expectedRevision);
      if (g) return g;
      const t = byId(db.trackedPositions, positionId);
      if (!t) return notFound();
      if (corner !== 'A' && corner !== 'B') return validation([{ field: 'corner' }]);
      t.corner = corner;   // price re-derives from the SAME tracked market
      return ok({ id: positionId, corner }, bump('tracked_positions', positionId));
    },
    amendTrackedPrice: (positionId, odds, expectedRevision) => {
      const g = guardWrite('tracked_positions', positionId, expectedRevision);
      if (g) return g;
      const t = byId(db.trackedPositions, positionId);
      if (!t) return notFound();
      if (!Number.isInteger(odds) || Math.abs(odds) < 100) return validation([{ field: 'odds' }]);
      const current = t.marketSnapshotId ? byId(db.marketSnapshots, t.marketSnapshotId) : null;
      // Append a NEW immutable snapshot; the assessment and its market are
      // never touched and nothing frozen is recomputed. The id is a real UUIDv5
      // so an exported store still satisfies StoreSchema on re-import.
      const next = {
        id: uuidv5(NS.MARKET, `${positionId}|amend|${db.marketSnapshots.length}`),
        boutId: t.boutId,
        capturedAt: now(),
        source: 'manual',
        oddsA: t.corner === 'A' ? odds : current?.oddsA ?? null,
        oddsB: t.corner === 'B' ? odds : current?.oddsB ?? null,
      };
      db.marketSnapshots.push(next);
      t.marketSnapshotId = next.id;
      return ok({ id: positionId, marketSnapshotId: next.id },
                bump('tracked_positions', positionId));
    },
    confirmEntry: (positionId, expectedRevision) => {
      const g = guardWrite('tracked_positions', positionId, expectedRevision);
      if (g) return g;
      const t = byId(db.trackedPositions, positionId);
      if (!t) return notFound();
      if (t.reviewState.status !== 'pending') return validation([{ field: 'reviewState' }]);
      t.reviewState = { status: 'confirmed', reason: 'autoGenerated', confirmedAt: now() };
      return ok({ id: positionId }, bump('tracked_positions', positionId));
    },
    confirmAllPending: (revisions) => {
      const m = requireMember();
      if (m) return m;
      const pending = db.trackedPositions.filter((t) => t.reviewState.status === 'pending');
      const v = checkRevisionVector(
        pending.map((t) => ({ table: 'tracked_positions', id: t.id })), revisions);
      if (v) return v;
      // ---- nothing above this line has mutated anything ----
      const stamp = now();
      const touched = pending.map((t) => {
        t.reviewState = { status: 'confirmed', reason: 'autoGenerated', confirmedAt: stamp };
        return { table: 'tracked_positions', id: t.id, revision: bump('tracked_positions', t.id) };
      });
      return ok({ confirmed: touched.length, touched });
    },
  };

  const wagerRepository = {
    // Carries `revision` for the same reason positionRow does: a caller cannot
    // assemble the revision vector `grade` demands without one per dependent.
    listByBout: (boutId) => ok(db.wagers.filter((w) => w.boutId === boutId)
      .map((w) => ({ ...clone(w), revision: revOf('wagers', w.id) }))),
    create: (w) => {
      const m = requireMember();
      if (m) return m;
      db.wagers.push(clone(w));
      return ok({ id: w.id });
    },
    updateStake: (id, stakeUnits, expectedRevision) => {
      const g = guardWrite('wagers', id, expectedRevision);
      if (g) return g;
      const w = byId(db.wagers, id);
      if (!w) return notFound();
      if (w.settlement.status === 'settled') return validation([{ field: 'stakeUnits', reason: 'settled' }]);
      try { w.stakeUnits = fromStakeTransport(toStakeTransport(stakeUnits)); }
      catch (e) { return validation([{ field: 'stakeUnits', message: e.message }]); }
      return ok({ id }, bump('wagers', id));
    },
    updateNotes: (id, notes, expectedRevision) => {
      const g = guardWrite('wagers', id, expectedRevision);
      if (g) return g;
      const w = byId(db.wagers, id);
      if (!w) return notFound();
      w.notes = notes === '' ? null : notes;
      return ok({ id }, bump('wagers', id));
    },
    settle: (id, outcome, expectedRevision) => {
      const g = guardWrite('wagers', id, expectedRevision);
      if (g) return g;
      const w = byId(db.wagers, id);
      if (!w) return notFound();
      const bout = byId(db.bouts, w.boutId);
      w.settlement = settleAgainst(w, bout, db, now(), outcome);
      return ok({ id }, bump('wagers', id));
    },
    remove: (id, expectedRevision) => {
      const g = guardWrite('wagers', id, expectedRevision);
      if (g) return g;
      if (!byId(db.wagers, id)) return notFound();
      db.wagers = db.wagers.filter((w) => w.id !== id);
      return ok({ removed: id });
    },
  };

  const propRepository = {
    list: () => ok(db.props.map(clone)),
    create: (p) => {
      const m = requireMember();
      if (m) return m;
      db.props.push(clone(p));
      ledger.set(ledgerKey('prop', p.id),
                 { rootType: 'prop', rootId: p.id, firstSeedVersion: null, removedAt: null });
      return ok({ id: p.id });
    },
    settle: (id, result, expectedRevision) => {
      const g = guardWrite('props', id, expectedRevision);
      if (g) return g;
      const p = byId(db.props, id);
      if (!p) return notFound();
      if (!['PENDING', 'WON', 'LOST', 'PUSH'].includes(result)) return validation([{ field: 'result' }]);
      p.result = result;
      return ok({ id }, bump('props', id));
    },
    remove: (id, expectedRevision) => {
      const g = guardWrite('props', id, expectedRevision);
      if (g) return g;
      if (!byId(db.props, id)) return notFound();
      db.props = db.props.filter((p) => p.id !== id);
      tombstone('prop', id);   // the bout it referenced always remains
      return ok({ removed: id });
    },
  };

  const parlayRepository = {
    list: () => ok(db.parlays.map(clone)),
    create: (p) => {
      const m = requireMember();
      if (m) return m;
      db.parlays.push(clone(p));
      ledger.set(ledgerKey('parlay', p.id),
                 { rootType: 'parlay', rootId: p.id, firstSeedVersion: null, removedAt: null });
      return ok({ id: p.id });
    },
    remove: (id) => {
      const m = requireMember();
      if (m) return m;
      if (!byId(db.parlays, id)) return notFound();
      db.parlays = db.parlays.filter((p) => p.id !== id);
      tombstone('parlay', id);
      return ok({ removed: id });
    },
  };

  const statisticsRepository = {
    statisticsInput: (options) => {
      const { since } = options ?? {};
      return ok(db.trackedPositions.map(statisticsRow).filter((r) => !since || r.eventDate >= since));
    },
  };

  const workspaceRepository = {
    current: () => ok({
      id: 'in-memory', slug: 'fightmetrics', isPublic: true,
      schemaVersion: db.meta.schemaVersion, seedVersion: db.meta.seedVersion ?? null,
      migratedAt: db.meta.migratedAt,
    }, revOf('workspaces', 'in-memory')),
    seedVersion: () => ok(db.meta.seedVersion ?? null),
    setSeedVersion: (version, expectedRevision) => {
      const g = guardWrite('workspaces', 'in-memory', expectedRevision, true);
      if (g) return g;
      db.meta.seedVersion = version;
      return ok({ seedVersion: version }, bump('workspaces', 'in-memory'));
    },
    exportStore: () => {
      if (session === null) return unauthenticated();
      if (!canRead()) return forbidden();
      return ok(clone(db));
    },
    /**
     * ATOMIC. The incoming store is fully validated — schema AND referential
     * invariants — before a single byte of the live store changes, and the
     * replacement is a whole-object swap rather than a merge.
     *
     * Object.assign was wrong in three ways at once: unknown top-level keys
     * were copied in verbatim, collections absent from the incoming store kept
     * their old rows (160 stale trackedPositions survived an import that
     * declared none), and a store that failed validation halfway had already
     * been partially applied.
     */
    importStore: (incoming, options) => {
      const { backupConfirmed } = options ?? {};
      const m = requireMember(true);
      if (m) return m;
      // A transaction cannot prove the user kept a file; the client must confirm.
      if (!backupConfirmed) return validation([{ field: 'backupConfirmed' }]);
      if (incoming === null || typeof incoming !== 'object' || Array.isArray(incoming)) {
        return validation([{ field: 'store', code: 'notAnObject' }]);
      }
      if (typeof incoming.meta?.schemaVersion === 'number'
          && incoming.meta.schemaVersion > db.meta.schemaVersion) {
        return err({ kind: 'validation', issues: [{ code: 'unknownFutureVersion' }] });
      }
      const parsed = StoreSchema.safeParse(incoming);
      if (!parsed.success) {
        return err({
          kind: 'validation',
          issues: parsed.error.issues.slice(0, 20).map((i) => ({
            code: i.code, path: i.path.join('.'), message: i.message,
          })),
        });
      }
      const problems = checkInvariants(parsed.data);
      if (problems.length) {
        return err({
          kind: 'validation',
          issues: problems.slice(0, 20).map((p) => ({ code: 'invariant', message: String(p) })),
        });
      }
      // ---- validation complete; only now is the live store touched ----
      const next = clone(parsed.data);
      for (const key of Object.keys(db)) delete db[key];
      Object.assign(db, next);
      revisions.clear();
      seedLedgerFrom(db, db.meta.seedVersion ?? null);
      return ok({ imported: true });
    },
    reset: (options) => {
      const { backupConfirmed } = options ?? {};
      const m = requireMember(true);
      if (m) return m;
      if (!backupConfirmed) return validation([{ field: 'backupConfirmed' }]);
      for (const k of Object.keys(db)) if (k !== 'meta') db[k] = [];
      db.meta.seedVersion = null;
      // reset clears entities, ledger AND seed_version: a reset workspace is
      // re-seedable from scratch, so nothing may stay tombstoned.
      ledger.clear();
      revisions.clear();
      return ok({ reset: true });
    },
  };

  const undoRepository = {
    list: () => ok([]),
    undo: (token) => (token === undefined ? validation([{ field: 'token' }]) : notFound()),
  };

  const authRepository = {
    // Session presence ONLY. Never reports a role.
    session: () => ok(session === null ? null : { userId: session.userId }),
    // Resolved membership ONLY. Routing is by membership, not session presence:
    // a signed-in non-member reads through the public surface like anyone else.
    whoami: () => ok({ role }),
    signIn: (email) => (typeof email === 'string' && email.includes('@')
      ? ok({ sent: true }) : validation([{ field: 'email' }])),
    signOut: () => ok({ signedOut: true }),
    // Requires a session but NOT membership — that is the entire point: the
    // first signed-in user claims a zero-owner workspace. Once an owner exists
    // the claim is refused.
    claimOwnership: () => {
      if (session === null) return unauthenticated();
      if (ownerExists) return forbidden();
      ownerExists = true;
      return ok({ role: 'owner' });
    },
  };

  const repositories = {
    eventRepository, boutRepository, predictionRepository, wagerRepository,
    propRepository, parlayRepository, statisticsRepository, workspaceRepository,
    undoRepository, authRepository,
  };

  // Symbol-keyed: invisible to Object.keys, so the contract surface is unchanged.
  Object.defineProperty(repositories, SEED_LEDGER, {
    enumerable: false,
    get: () => [...ledger.values()].map((r) => ({ ...r })),
  });
  Object.defineProperty(repositories, APPLY_SEED, {
    enumerable: false,
    value: (seedStore, seedVersion) => {
      // Ledger MEMBERSHIP is the test, not table membership — and a tombstoned
      // root is never re-inserted by any later seed.
      let inserted = 0, skipped = 0;
      for (const [rootType, rootId] of rootsOf(seedStore)) {
        if (!ROOT_TYPES.includes(rootType)) continue;
        if (ledger.has(ledgerKey(rootType, rootId))) { skipped += 1; continue; }
        if (rootType === 'predictionRun') {
          const run = seedStore.predictionRuns.find((r) => r.id === rootId);
          db.predictionRuns.push(clone(run));
          for (const s of seedStore.predictionSnapshots.filter((x) => x.runId === rootId)) {
            db.predictionSnapshots.push(clone(s));
          }
        } else if (rootType === 'prop') {
          db.props.push(clone(seedStore.props.find((p) => p.id === rootId)));
        } else {
          db.parlays.push(clone(seedStore.parlays.find((p) => p.id === rootId)));
        }
        ledger.set(ledgerKey(rootType, rootId),
                   { rootType, rootId, firstSeedVersion: seedVersion ?? null, removedAt: null });
        inserted += 1;
      }
      db.meta.seedVersion = seedVersion ?? db.meta.seedVersion;
      return { inserted, skipped };
    },
  });

  return repositories;
}

/**
 * Settlement, scored against the record's OWN market — the same rule the
 * Postgres constraint trigger enforces at Gate 2.
 */
function settleAgainst(row, bout, db, stamp, forcedOutcome) {
  if (!bout || bout.result.status !== 'resolved') return { status: 'open' };
  const outcome = forcedOutcome ?? (
    bout.result.outcome === 'draw' ? 'push'
      : bout.result.outcome === 'noContest' ? 'void'
      : bout.result.outcome === row.corner ? 'won' : 'lost'
  );
  const settledAt = row.origin === 'legacyMigration' ? null : stamp;
  if (outcome === 'push' || outcome === 'void') {
    return { status: 'settled', outcome,
             financialResult: { status: 'computed', profitUnits: 0 }, settledAt };
  }
  const market = row.marketSnapshotId
    ? db.marketSnapshots.find((m) => m.id === row.marketSnapshotId) : null;
  const odds = market ? (row.corner === 'A' ? market.oddsA : market.oddsB) : null;
  if (odds === null) {
    return { status: 'settled', outcome,
             financialResult: { status: 'uncomputable', reason: 'missingSelectedCornerOdds' },
             settledAt };
  }
  const dec = odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
  const profitUnits = outcome === 'won' ? row.stakeUnits * (dec - 1) : -row.stakeUnits;
  return { status: 'settled', outcome,
           financialResult: { status: 'computed', profitUnits }, settledAt };
}
