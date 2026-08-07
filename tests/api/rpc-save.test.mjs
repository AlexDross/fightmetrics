// Stage 7 Gate 2 — RPC cluster 5: prediction save, over real HTTP.
//
// fm_rpc_save_prediction_run authors a whole aggregate from the domain Store
// shape; fm_member_prediction_aggregate reads it back; fm_rpc_undo removes it.
// This is the leg that finally writes probabilities over HTTP (as JS numbers),
// closing the complementarity contract's write side.
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, scalar, catalogScalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER,
} from './helpers.mjs';

const SLUG = 'api-save';
const WS = '11110000-0000-4000-8000-000000000009';
const BOUT = '9bb00000-0000-4000-8000-000000000001';
const RUN = '1700000000009-svaaaa';
const SNAP = '9dd00000-0000-4000-8000-0000000000a1';
const MARKET = '9cc00000-0000-4000-8000-0000000000a1';
const ASSESS = '9ff00000-0000-4000-8000-0000000000a1';
const POS = '99700000-0000-4000-8000-0000000000a1';

// The same non-trivial probability the export/complementarity tests use, whose
// float8 pair sums to exactly 1. This time it crosses PostgREST on the way IN.
const probA = 0.5432109876543210;
const probB = 1 - probA;

// The applyFixture probability argument seeds WS_PUBLIC's snapshot, which
// api.test.mjs's complementarity test reads back; pass the canonical pair so the
// shared fixture is identical no matter which file's beforeAll runs first.
beforeAll(() => { applyFixture({ probA, probB }); }, 120_000);

const now = () => new Date().toISOString();

/** A complete, valid domain-shaped aggregate against the pending save bout. */
const aggregate = () => ({
  run: {
    id: RUN, boutId: BOUT, legacyEntryId: null, createdAt: now(),
    decisionSnapshotId: SNAP, targetEventDateAtCapture: '2026-04-09',
    finishProjection: { status: 'absent' },
    cornerAIsProspectAtCapture: false, cornerBIsProspectAtCapture: false,
    includesProspectAtCapture: false, provenanceCompleteness: 'full',
  },
  snapshots: [{
    id: SNAP, runId: RUN, boutId: BOUT, basis: 'legacy-v1-unversioned',
    modelVersion: null, modelCoefHash: null, probA, probB, winnerCorner: 'A',
    capturedAt: now(), captureMode: 'live', reconstruction: null,
    featureVector: null, fightHistoryCutoff: null, sourceManifest: null,
  }],
  marketSnapshot: {
    id: MARKET, boutId: BOUT, capturedAt: now(), source: 'manual',
    oddsA: -150, oddsB: 130,
  },
  assessment: {
    id: ASSESS, boutId: BOUT, runId: RUN, predictionSnapshotId: SNAP,
    marketSnapshotId: MARKET, frozenAt: now(),
    fairLineA: null, fairLineB: null, edgeA: null, edgeB: null,
    evA: null, evB: null, kellyA: null, kellyB: null, tier: null,
    recommendedCorner: null, tierProvenance: 'stored',
    recommendedCornerProvenance: 'stored',
  },
  trackedPosition: {
    id: POS, boutId: BOUT, assessmentId: ASSESS, marketSnapshotId: MARKET,
    origin: 'appCreated', corner: 'A', stakeUnits: 1, stakeSource: 'explicit',
    openedAt: now(), settlement: { status: 'open' },
    reviewState: { status: 'notRequired' }, notes: null,
  },
});

const aggregateCounts = () => ({
  runs: Number(catalogScalar(`SELECT count(*) FROM app_private.prediction_runs WHERE workspace_id='${WS}';`)),
  snapshots: Number(catalogScalar(`SELECT count(*) FROM app_private.prediction_snapshots WHERE workspace_id='${WS}';`)),
  markets: Number(catalogScalar(`SELECT count(*) FROM app_private.market_snapshots WHERE workspace_id='${WS}';`)),
  assessments: Number(catalogScalar(`SELECT count(*) FROM app_private.betting_assessments WHERE workspace_id='${WS}';`)),
  positions: Number(catalogScalar(`SELECT count(*) FROM app_private.tracked_positions WHERE workspace_id='${WS}';`)),
});

const latestUndo = (op) => catalogScalar(
  `SELECT id FROM app_private.undo_log WHERE workspace_id='${WS}'
     ${op ? `AND op='${op}'` : ''} AND consumed_at IS NULL
    ORDER BY created_at DESC LIMIT 1;`);

const undo = (id, as = USER_MEMBER) =>
  rpc('fm_rpc_undo', { p_slug: SLUG, p_undo_id: id }, { as });

const inUpcoming = async (posId, as = USER_MEMBER) =>
  ((await rpc('fm_member_upcoming', { p_slug: SLUG }, { as })).body ?? [])
    .some((r) => r.tracked_position_id === posId);

// 'live' = a ledger row with no tombstone; 'tombstoned' = removed_at set;
// 'absent' = no ledger row at all (what undo of a save leaves behind).
const ledger = (runId) => catalogScalar(
  `SELECT coalesce((SELECT CASE WHEN s.removed_at IS NULL THEN 'live'
                               ELSE 'tombstoned' END
     FROM app_private.seed_items s
     WHERE s.workspace_id='${WS}' AND s.root_type='predictionRun'
       AND s.root_id='${runId}'), 'absent');`);

describe('save_prediction_run — create, read back, undo', () => {
  it('creates the aggregate and getAggregate returns it in domain shape', async () => {
    expect(aggregateCounts()).toEqual({ runs: 0, snapshots: 0, markets: 0, assessments: 0, positions: 0 });

    const res = await rpc('fm_rpc_save_prediction_run',
      { p_slug: SLUG, p_aggregate: aggregate() }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].run_id).toBe(RUN);

    expect(aggregateCounts()).toEqual({ runs: 1, snapshots: 1, markets: 1, assessments: 1, positions: 1 });
    expect(ledger(RUN)).toBe('live');
    expect(await inUpcoming(POS)).toBe(true);

    const agg = (await rpc('fm_member_prediction_aggregate',
      { p_slug: SLUG, p_run_id: RUN }, { as: USER_MEMBER })).body;
    expect(agg.run.id).toBe(RUN);
    expect(agg.run.boutId).toBe(BOUT);
    expect(agg.snapshots).toHaveLength(1);
    expect(agg.assessment.id).toBe(ASSESS);
    expect(agg.trackedPosition.id).toBe(POS);
    expect(agg.trackedPosition.settlement).toEqual({ status: 'open' });
    expect(agg.trackedPosition.reviewState).toEqual({ status: 'notRequired' });

    // COMPLEMENTARITY, written and read over HTTP: pA and pB are JS numbers,
    // Object.is-identical to what went in, summing to exactly 1.
    expect(Object.is(agg.snapshots[0].probA, probA)).toBe(true);
    expect(Object.is(agg.snapshots[0].probB, probB)).toBe(true);
    expect(agg.snapshots[0].probA + agg.snapshots[0].probB).toBe(1);

    // undo removes the whole created aggregate and its ledger row
    const u = await undo(latestUndo('save_prediction_run'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(u.body[0].restored.map((x) => x.table).sort()).toEqual(
      ['betting_assessments', 'market_snapshots', 'prediction_runs',
       'prediction_snapshots', 'tracked_positions']);
    expect(aggregateCounts()).toEqual({ runs: 0, snapshots: 0, markets: 0, assessments: 0, positions: 0 });
    expect(ledger(RUN)).toBe('absent');
    expect(await inUpcoming(POS)).toBe(false);
    // getAggregate is notFound (SQL null) once removed
    expect((await rpc('fm_member_prediction_aggregate',
      { p_slug: SLUG, p_run_id: RUN }, { as: USER_MEMBER })).body).toBeNull();
  });
});

describe('save_prediction_run — undo conflict when the created row moved', () => {
  it('a later edit of the created position makes undo a stale_write', async () => {
    const save = await rpc('fm_rpc_save_prediction_run',
      { p_slug: SLUG, p_aggregate: aggregate() }, { as: USER_MEMBER });
    expect(save.status, JSON.stringify(save.body)).toBe(200);
    const token = latestUndo('save_prediction_run');

    // edit the created position: its revision moves off what the undo recorded
    const rev = ((await rpc('fm_member_upcoming', { p_slug: SLUG }, { as: USER_MEMBER }))
      .body).find((r) => r.tracked_position_id === POS).revision;
    const edit = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B', p_expected_revision: rev },
      { as: USER_MEMBER });
    expect(edit.status, JSON.stringify(edit.body)).toBe(200);

    const u = await undo(token);
    expect(u.body.code).toBe('P0001');
    expect(u.body.message).toMatch(/\bstale_write\b/);
    // atomic abort: the aggregate is still present and the token unconsumed
    expect(aggregateCounts().positions).toBe(1);
    expect(catalogScalar(
      `SELECT coalesce(consumed_at::text,'unconsumed') FROM app_private.undo_log
        WHERE id='${token}';`)).toBe('unconsumed');

    // Clean up with a direct fixture wipe: once the position was edited its
    // revision has moved, so the save-undo is permanently (and correctly) a
    // conflict and can no longer restore the empty state. The cyclic pair is
    // deferred so run and snapshot can both go.
    scalar(`SET CONSTRAINTS app_private.run_decision_snapshot_fk,
                            app_private.prediction_snapshots_run_fk DEFERRED;
            DELETE FROM app_private.tracked_positions WHERE workspace_id='${WS}';
            DELETE FROM app_private.betting_assessments WHERE workspace_id='${WS}';
            DELETE FROM app_private.market_snapshots WHERE workspace_id='${WS}';
            DELETE FROM app_private.prediction_snapshots WHERE workspace_id='${WS}';
            DELETE FROM app_private.prediction_runs WHERE workspace_id='${WS}';
            DELETE FROM app_private.seed_items WHERE workspace_id='${WS}';`);
    expect(aggregateCounts().positions).toBe(0);
  });
});

describe('save_prediction_run — authorization and validation', () => {
  it('anon cannot execute it', async () => {
    const res = await rpc('fm_rpc_save_prediction_run',
      { p_slug: SLUG, p_aggregate: aggregate() });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('42501');
  });

  it('a viewer is refused for lacking the role', async () => {
    const res = await rpc('fm_rpc_save_prediction_run',
      { p_slug: SLUG, p_aggregate: aggregate() }, { as: USER_VIEWER });
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/insufficient workspace role/);
  });

  it('an editor MAY save, and undo restores the empty state', async () => {
    const res = await rpc('fm_rpc_save_prediction_run',
      { p_slug: SLUG, p_aggregate: aggregate() }, { as: USER_OUTSIDER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(aggregateCounts().positions).toBe(1);
    await undo(latestUndo('save_prediction_run'), USER_OUTSIDER);
    expect(aggregateCounts().positions).toBe(0);
  });

  it('a missing run.id is a validation error, and nothing is created', async () => {
    const agg = aggregate();
    delete agg.run.id;
    const res = await rpc('fm_rpc_save_prediction_run',
      { p_slug: SLUG, p_aggregate: agg }, { as: USER_MEMBER });
    expect(res.body.code).toBe('23514');
    expect(aggregateCounts()).toEqual({ runs: 0, snapshots: 0, markets: 0, assessments: 0, positions: 0 });
  });

  it('a run against a non-existent bout is rejected by the FK, atomically', async () => {
    const agg = aggregate();
    agg.run.boutId = '9bb00000-0000-4000-8000-0000000000ff'; // no such bout
    agg.snapshots[0].boutId = agg.run.boutId;
    agg.marketSnapshot.boutId = agg.run.boutId;
    agg.assessment.boutId = agg.run.boutId;
    agg.trackedPosition.boutId = agg.run.boutId;
    const res = await rpc('fm_rpc_save_prediction_run',
      { p_slug: SLUG, p_aggregate: agg }, { as: USER_MEMBER });
    expect(res.body.code).toBe('23503');
    expect(aggregateCounts()).toEqual({ runs: 0, snapshots: 0, markets: 0, assessments: 0, positions: 0 });
  });
});
