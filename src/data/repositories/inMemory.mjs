// Stage 7 Gate 1 — in-memory repository backing.
//
// Backed by a real Stage 6 durable Store, so the contract tests exercise the
// actual migrated data rather than hand-written fixtures. This is the offline
// tier that keeps `npm test` fast and Supabase-free; Gate 6 adds a Postgres
// backing that must satisfy the identical contract.
//
// It deliberately models the parts of the Postgres contract that are easy to
// get wrong later: opaque string revisions, expected-revision conflicts,
// role gating, and stake values crossing the boundary as decimal strings.
import {
  ok, err, conflict, forbidden, notFound, unauthenticated, validation,
  assertRevision, toStakeTransport, fromStakeTransport,
} from './types.mjs';

const clone = (v) => structuredClone(v);

/**
 * @param {object} store   a validated Stage 6 Store
 * @param {object} opts    { role: 'owner'|'editor'|'viewer'|null, now: () => ISO string }
 */
export function createInMemoryRepositories(store, opts = {}) {
  const db = clone(store);
  const role = opts.role === undefined ? 'owner' : opts.role;
  const now = opts.now ?? (() => new Date().toISOString());

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

  const canWrite = () => role === 'owner' || role === 'editor';
  const canRead = () => role === 'owner' || role === 'editor' || role === 'viewer';

  /** Gate a write on session + role + expected revision, in that order. */
  const guardWrite = (table, id, expectedRevision, requireOwner = false) => {
    if (role === null) return unauthenticated();
    if (requireOwner ? role !== 'owner' : !canWrite()) return forbidden();
    if (expectedRevision !== undefined) {
      assertRevision(expectedRevision);
      const current = revOf(table, id);
      if (current !== expectedRevision) return conflict(current);
    }
    return null;
  };

  const byId = (rows, id) => rows.find((r) => r.id === id) ?? null;

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

  const readGuard = () => (canRead() || role === null ? null : forbidden());

  // ── repositories ──────────────────────────────────────────────────────────
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
    listPending: () => readGuard() ?? ok(positionsFor(false).map(positionRow)),
    listGraded: ({ since } = {}) => readGuard() ?? ok(
      positionsFor(true).map(positionRow)
        .filter((r) => !since || r.eventDate >= since)
    ),
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
      if (role === null) return unauthenticated();
      if (!canWrite()) return forbidden();
      if (!aggregate?.run?.id) return validation([{ field: 'run.id' }]);
      db.predictionRuns.push(clone(aggregate.run));
      (aggregate.snapshots ?? []).forEach((s) => db.predictionSnapshots.push(clone(s)));
      if (aggregate.marketSnapshot) db.marketSnapshots.push(clone(aggregate.marketSnapshot));
      db.bettingAssessments.push(clone(aggregate.assessment));
      db.trackedPositions.push(clone(aggregate.trackedPosition));
      return ok({ runId: aggregate.run.id });
    },
    remove: (runId, expectedRevision) => {
      const a = db.bettingAssessments.find((x) => x.runId === runId);
      if (!a) return notFound();
      const t = db.trackedPositions.find((x) => x.assessmentId === a.id);
      const g = guardWrite('tracked_positions', t.id, expectedRevision);
      if (g) return g;
      // Prune only proven orphans; Events and Bouts always remain.
      db.trackedPositions = db.trackedPositions.filter((x) => x.id !== t.id);
      db.bettingAssessments = db.bettingAssessments.filter((x) => x.id !== a.id);
      db.predictionSnapshots = db.predictionSnapshots.filter((s) => s.runId !== runId);
      db.predictionRuns = db.predictionRuns.filter((r) => r.id !== runId);
      return ok({ removed: runId });
    },
    clearGraded: (expectedRevisions) => {
      if (role === null) return unauthenticated();
      if (role !== 'owner') return forbidden();
      const graded = positionsFor(true);
      for (const [i, t] of graded.entries()) {
        const current = revOf('tracked_positions', t.id);
        if (expectedRevisions?.[i] !== undefined && expectedRevisions[i] !== current) {
          return conflict(current);
        }
      }
      const ids = new Set(graded.map((t) => t.id));
      db.trackedPositions = db.trackedPositions.filter((t) => !ids.has(t.id));
      return ok({ removed: ids.size });
    },
    grade: (boutId, outcome, method, expectedRevision) => {
      const g = guardWrite('bouts', boutId, expectedRevision);
      if (g) return g;
      const bout = byId(db.bouts, boutId);
      if (!bout) return notFound();
      bout.result = { status: 'resolved', outcome, method: method ?? null };
      const touched = [];
      for (const t of db.trackedPositions.filter((x) => x.boutId === boutId)) {
        t.settlement = settleAgainst(t, bout, db, now());
        touched.push({ id: t.id, revision: bump('tracked_positions', t.id) });
      }
      return ok({ boutId, touched }, bump('bouts', boutId));
    },
    returnToPending: (boutId, expectedRevision) => {
      const g = guardWrite('bouts', boutId, expectedRevision);
      if (g) return g;
      const bout = byId(db.bouts, boutId);
      if (!bout) return notFound();
      bout.result = { status: 'pending' };
      const touched = [];
      for (const t of db.trackedPositions.filter((x) => x.boutId === boutId)) {
        t.settlement = { status: 'open' };
        touched.push({ id: t.id, revision: bump('tracked_positions', t.id) });
      }
      return ok({ boutId, touched }, bump('bouts', boutId));
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
      // never touched and nothing frozen is recomputed.
      const next = {
        id: `${positionId}-amend-${db.marketSnapshots.length}`,
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
    confirmAllPending: (expectedRevisions) => {
      if (role === null) return unauthenticated();
      if (!canWrite()) return forbidden();
      const pending = db.trackedPositions.filter((t) => t.reviewState.status === 'pending');
      for (const [i, t] of pending.entries()) {
        const current = revOf('tracked_positions', t.id);
        if (expectedRevisions?.[i] !== undefined && expectedRevisions[i] !== current) {
          return conflict(current);
        }
      }
      const stamp = now();
      const touched = pending.map((t) => {
        t.reviewState = { status: 'confirmed', reason: 'autoGenerated', confirmedAt: stamp };
        return { id: t.id, revision: bump('tracked_positions', t.id) };
      });
      return ok({ confirmed: touched.length, touched });
    },
  };

  const wagerRepository = {
    listByBout: (boutId) => ok(db.wagers.filter((w) => w.boutId === boutId).map(clone)),
    create: (w) => {
      if (role === null) return unauthenticated();
      if (!canWrite()) return forbidden();
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
      if (role === null) return unauthenticated();
      if (!canWrite()) return forbidden();
      db.props.push(clone(p));
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
      return ok({ removed: id });
    },
  };

  const parlayRepository = {
    list: () => ok(db.parlays.map(clone)),
    create: (p) => {
      if (role === null) return unauthenticated();
      if (!canWrite()) return forbidden();
      db.parlays.push(clone(p));
      return ok({ id: p.id });
    },
    remove: (id) => {
      if (role === null) return unauthenticated();
      if (!canWrite()) return forbidden();
      if (!byId(db.parlays, id)) return notFound();
      db.parlays = db.parlays.filter((p) => p.id !== id);
      return ok({ removed: id });
    },
  };

  const statisticsRepository = {
    statisticsInput: ({ since } = {}) => readGuard() ?? ok(
      db.trackedPositions.map(statisticsRow).filter((r) => !since || r.eventDate >= since)
    ),
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
    exportStore: () => (canRead() ? ok(clone(db)) : forbidden()),
    importStore: (incoming, { backupConfirmed } = {}) => {
      if (role === null) return unauthenticated();
      if (role !== 'owner') return forbidden();
      // A transaction cannot prove the user kept a file; the client must confirm.
      if (!backupConfirmed) return validation([{ field: 'backupConfirmed' }]);
      if (incoming?.meta?.schemaVersion > db.meta.schemaVersion) {
        return err({ kind: 'validation', issues: [{ code: 'unknownFutureVersion' }] });
      }
      Object.assign(db, clone(incoming));
      return ok({ imported: true });
    },
    reset: ({ backupConfirmed } = {}) => {
      if (role === null) return unauthenticated();
      if (role !== 'owner') return forbidden();
      if (!backupConfirmed) return validation([{ field: 'backupConfirmed' }]);
      for (const k of Object.keys(db)) if (k !== 'meta') db[k] = [];
      db.meta.seedVersion = null;
      return ok({ reset: true });
    },
  };

  const undoRepository = {
    list: () => ok([]),
    undo: () => notFound(),   // real undo log arrives at Gate 7
  };

  const authRepository = {
    session: () => ok(role === null ? null : { role }),
    whoami: () => ok({ role }),
    signIn: () => ok({ sent: true }),
    signOut: () => ok({ signedOut: true }),
    claimOwnership: () => (role === null ? unauthenticated() : ok({ role: 'owner' })),
  };

  return {
    eventRepository, boutRepository, predictionRepository, wagerRepository,
    propRepository, parlayRepository, statisticsRepository, workspaceRepository,
    undoRepository, authRepository,
  };
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
