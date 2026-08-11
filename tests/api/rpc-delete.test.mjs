// Stage 7 Gate 2 — RPC cluster 4: deletion, over real HTTP.
//
// fm_rpc_delete_pending_run and fm_rpc_clear_graded, plus the absent_ids
// restoration path they add to fm_rpc_undo. Two dedicated workspaces:
//   api-delete      — NO wager, so a delete physically removes the whole aggregate
//   api-delete-pin  — a wager pins the shared assessment, so the run/assessment/
//                     market survive and only the position is removed
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, scalar, catalogScalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER,
} from './helpers.mjs';

const SLUG = 'api-delete';
const WS = '11110000-0000-4000-8000-000000000007';
const RUN = '1700000000007-aaaaaa';
const BOUT = '7bb00000-0000-4000-8000-000000000001';
const POS = '77700000-0000-4000-8000-000000000001';
const MARKET = '7cc00000-0000-4000-8000-000000000001';
const ASSESSMENT = '7ff00000-0000-4000-8000-000000000001';
const SNAP = '7dd00000-0000-4000-8000-000000000001';

const PIN_SLUG = 'api-delete-pin';
const PIN_WS = '11110000-0000-4000-8000-000000000008';
const PIN_RUN = '1700000000008-aaaaaa';
const PIN_POS = '87700000-0000-4000-8000-000000000001';
const PIN_WAG = '89900000-0000-4000-8000-000000000001';
const PIN_ASSESS = '8ff00000-0000-4000-8000-000000000001';

beforeAll(() => { applyFixture(); }, 120_000);

const count = (table, ws) => Number(catalogScalar(
  `SELECT count(*) FROM app_private.${table} WHERE workspace_id='${ws}';`));

/** Every row of the WS_DELETE aggregate, for exact before/after counts. */
const aggregateCounts = (ws = WS) => ({
  runs: count('prediction_runs', ws),
  snapshots: count('prediction_snapshots', ws),
  markets: count('market_snapshots', ws),
  assessments: count('betting_assessments', ws),
  positions: count('tracked_positions', ws),
});

// A root is LIVE when it has no tombstone at all (pristine, no seed_items row) OR
// a ledger row whose removed_at is NULL. Only a set removed_at means deleted.
const tombstone = (ws, runId) => catalogScalar(
  `SELECT coalesce((SELECT s.removed_at::text FROM app_private.seed_items s
     WHERE s.workspace_id='${ws}' AND s.root_type='predictionRun'
       AND s.root_id='${runId}'), 'live');`);

const latestUndo = (op, ws = WS) => catalogScalar(
  `SELECT id FROM app_private.undo_log WHERE workspace_id='${ws}'
     ${op ? `AND op='${op}'` : ''} AND consumed_at IS NULL
    ORDER BY created_at DESC LIMIT 1;`);

const undo = (id, slug = SLUG, as = USER_MEMBER) =>
  rpc('fm_rpc_undo', { p_slug: slug, p_undo_id: id }, { as });

const posRevision = async (slug, posId) => {
  for (const fn of ['fm_member_upcoming', 'fm_member_roi']) {
    const row = ((await rpc(fn, { p_slug: slug }, { as: USER_MEMBER })).body ?? [])
      .find((r) => r.tracked_position_id === posId);
    if (row) return row.revision;
  }
  throw new Error(`position ${posId} on no member surface`);
};

const inUpcoming = async (slug, posId) =>
  ((await rpc('fm_member_upcoming', { p_slug: slug }, { as: USER_MEMBER })).body ?? [])
    .some((r) => r.tracked_position_id === posId);

describe('delete_pending_run — full physical removal (no wager)', () => {
  it('removes the whole aggregate, tombstones the root, and undo restores it',
    async () => {
      const before = aggregateCounts();
      expect(before).toEqual({ runs: 1, snapshots: 1, markets: 1, assessments: 1, positions: 1 });
      expect(tombstone(WS, RUN)).toBe('live');

      const res = await rpc('fm_rpc_delete_pending_run',
        { p_slug: SLUG, p_run_id: RUN, p_expected_revision: await posRevision(SLUG, POS) },
        { as: USER_MEMBER });
      expect(res.status, JSON.stringify(res.body)).toBe(200);
      expect(res.body[0].removed).toBe(RUN);
      expect(res.body[0].physically_removed).toBe(true);
      expect(res.body[0].retained).toEqual({
        run: false, assessment: false, marketSnapshots: 0, predictionSnapshots: 0 });

      // every row gone, root tombstoned, position off the read surface
      expect(aggregateCounts()).toEqual({
        runs: 0, snapshots: 0, markets: 0, assessments: 0, positions: 0 });
      expect(tombstone(WS, RUN)).not.toBe('live');
      expect(await inUpcoming(SLUG, POS)).toBe(false);

      // a tombstoned root is notFound — cannot be deleted twice
      const twice = await rpc('fm_rpc_delete_pending_run',
        { p_slug: SLUG, p_run_id: RUN, p_expected_revision: '1' }, { as: USER_MEMBER });
      expect(twice.body.code).toBe('42704');

      // undo re-inserts the whole aggregate and clears the tombstone
      const u = await undo(latestUndo('delete_pending_run'));
      expect(u.status, JSON.stringify(u.body)).toBe(200);
      expect(u.body[0].restored.map((x) => x.table).sort()).toEqual(
        ['betting_assessments', 'market_snapshots', 'prediction_runs',
         'prediction_snapshots', 'tracked_positions']);
      expect(aggregateCounts()).toEqual(before);
      expect(tombstone(WS, RUN)).toBe('live');
      expect(await inUpcoming(SLUG, POS)).toBe(true);
      // the immutable snapshot came back with its exact probabilities intact
      expect(catalogScalar(
        `SELECT prob_a::text||'|'||prob_b::text FROM app_private.prediction_snapshots
          WHERE id='${SNAP}';`)).toBe('0.5|0.5');
    });
});

describe('delete_pending_run — retained run (a wager pins the assessment)', () => {
  it('removes only the position; run, assessment and market survive', async () => {
    const before = aggregateCounts(PIN_WS);
    expect(before.positions).toBe(1);
    expect(count('wagers', PIN_WS)).toBe(1);

    const res = await rpc('fm_rpc_delete_pending_run',
      { p_slug: PIN_SLUG, p_run_id: PIN_RUN, p_expected_revision: await posRevision(PIN_SLUG, PIN_POS) },
      { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].physically_removed).toBe(false);
    expect(res.body[0].retained).toEqual({
      run: true, assessment: true, marketSnapshots: 1, predictionSnapshots: 1 });

    // position gone, everything the wager pins survives, wager untouched
    expect(count('tracked_positions', PIN_WS)).toBe(0);
    expect(count('betting_assessments', PIN_WS)).toBe(1);
    expect(count('market_snapshots', PIN_WS)).toBe(1);
    expect(count('prediction_runs', PIN_WS)).toBe(1);
    expect(count('wagers', PIN_WS)).toBe(1);
    expect(tombstone(PIN_WS, PIN_RUN)).not.toBe('live');

    // undo restores only the position and clears the tombstone
    const u = await undo(latestUndo('delete_pending_run', PIN_WS), PIN_SLUG);
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(u.body[0].restored.map((x) => x.table)).toEqual(['tracked_positions']);
    expect(count('tracked_positions', PIN_WS)).toBe(1);
    expect(tombstone(PIN_WS, PIN_RUN)).toBe('live');
    expect(await inUpcoming(PIN_SLUG, PIN_POS)).toBe(true);
  });
});

describe('delete_pending_run — authorization and conflict', () => {
  it('a stale expected_revision aborts with stale_write and deletes nothing', async () => {
    const before = aggregateCounts();
    const res = await rpc('fm_rpc_delete_pending_run',
      { p_slug: SLUG, p_run_id: RUN, p_expected_revision: '999' }, { as: USER_MEMBER });
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/\bstale_write\b/);
    expect(aggregateCounts()).toEqual(before);
    expect(tombstone(WS, RUN)).toBe('live');
  });

  it('an unknown run is notFound', async () => {
    const res = await rpc('fm_rpc_delete_pending_run',
      { p_slug: SLUG, p_run_id: '1700000000099-zzzzzz', p_expected_revision: '1' },
      { as: USER_MEMBER });
    expect(res.body.code).toBe('42704');
  });

  it('anon cannot execute it', async () => {
    const res = await rpc('fm_rpc_delete_pending_run',
      { p_slug: SLUG, p_run_id: RUN, p_expected_revision: '1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('42501');
  });

  it('a viewer is refused for lacking the role', async () => {
    const res = await rpc('fm_rpc_delete_pending_run',
      { p_slug: SLUG, p_run_id: RUN, p_expected_revision: '1' }, { as: USER_VIEWER });
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/insufficient workspace role/);
  });

  it('an editor MAY delete and undo — owner/editor, not owner-only', async () => {
    const before = aggregateCounts();
    const res = await rpc('fm_rpc_delete_pending_run',
      { p_slug: SLUG, p_run_id: RUN, p_expected_revision: await posRevision(SLUG, POS) },
      { as: USER_OUTSIDER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(aggregateCounts().positions).toBe(0);
    // the creator (the editor) undoes their own deletion
    const u = await undo(latestUndo('delete_pending_run'), SLUG, USER_OUTSIDER);
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(aggregateCounts()).toEqual(before);
  });
});

describe('undo of a deletion detects a reappeared row', () => {
  it('refuses to re-insert when an absent id is live again', async () => {
    const before = aggregateCounts();
    await rpc('fm_rpc_delete_pending_run',
      { p_slug: SLUG, p_run_id: RUN, p_expected_revision: await posRevision(SLUG, POS) },
      { as: USER_MEMBER });
    const token = latestUndo('delete_pending_run');

    // someone re-creates the market snapshot (id in absent_ids) before the undo
    // runs. Its only FK is to the surviving bout, so the reappearance is genuine.
    scalar(`INSERT INTO app_private.market_snapshots
       (workspace_id, id, bout_id, captured_at, source, odds_a, odds_b)
       VALUES ('${WS}','${MARKET}','${BOUT}', now(), 'manual', -150, 130);`);

    const res = await undo(token);
    expect(res.body.code).toBe('55000');
    expect(res.body.message).toMatch(/undoRowReappeared/);
    // token survives for a genuine retry; the reappeared row is still the only one
    expect(catalogScalar(
      `SELECT coalesce(consumed_at::text,'unconsumed') FROM app_private.undo_log
        WHERE id='${token}';`)).toBe('unconsumed');

    // clean the reappeared row, then the undo succeeds and fully restores
    scalar(`DELETE FROM app_private.market_snapshots
             WHERE workspace_id='${WS}' AND id='${MARKET}';`);
    const u = await undo(token);
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(aggregateCounts()).toEqual(before);
  });
});

describe('clear_graded', () => {
  const gradedVector = async () => {
    const rows = (await rpc('fm_member_roi', { p_slug: SLUG }, { as: USER_MEMBER })).body ?? [];
    return rows.map((r) => ({ id: r.tracked_position_id, revision: r.revision }));
  };
  // Grade WS_DELETE's bout so its (only) position becomes settled/graded.
  const gradeVector = async () => {
    const bout = (await rpc('fm_member_bouts', { p_slug: SLUG }, { as: USER_MEMBER }))
      .body.find((b) => b.id === BOUT);
    const v = [{ id: bout.id, revision: bout.revision }];
    for (const fn of ['fm_member_upcoming', 'fm_member_roi']) {
      for (const r of (await rpc(fn, { p_slug: SLUG }, { as: USER_MEMBER })).body ?? []) {
        if (r.bout_id === BOUT) v.push({ id: r.tracked_position_id, revision: r.revision });
      }
    }
    return v;
  };

  it('is owner-only: an editor is refused', async () => {
    const res = await rpc('fm_rpc_clear_graded',
      { p_slug: SLUG, p_revisions: [] }, { as: USER_OUTSIDER });
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/insufficient workspace role/);
  });

  it('clears every graded aggregate under a validated vector, and undo restores', async () => {
    // grade the bout so the position is settled
    const g = await rpc('fm_rpc_grade_bout',
      { p_slug: SLUG, p_bout_id: BOUT, p_outcome: 'A', p_method: 'DEC',
        p_revisions: await gradeVector() }, { as: USER_MEMBER });
    expect(g.status, JSON.stringify(g.body)).toBe(200);
    const before = aggregateCounts();
    expect(before.positions).toBe(1);

    // a stale vector is refused before anything is deleted
    const stale = await rpc('fm_rpc_clear_graded',
      { p_slug: SLUG, p_revisions: [{ id: POS, revision: '999' }] }, { as: USER_MEMBER });
    expect(stale.body.code).toBe('P0001');
    expect(stale.body.message).toMatch(/\bstale_write\b/);
    expect(aggregateCounts()).toEqual(before);

    const res = await rpc('fm_rpc_clear_graded',
      { p_slug: SLUG, p_revisions: await gradedVector() }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0]).toEqual({ removed: 1, roots_tombstoned: 1, physically_removed: 1 });
    expect(aggregateCounts()).toEqual({
      runs: 0, snapshots: 0, markets: 0, assessments: 0, positions: 0 });
    expect(tombstone(WS, RUN)).not.toBe('live');

    // undo restores the whole cleared aggregate and clears the tombstone
    const u = await undo(latestUndo('clear_graded'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(aggregateCounts()).toEqual(before);
    expect(tombstone(WS, RUN)).toBe('live');
    // the restored position is graded again, exactly as before the clear
    expect(catalogScalar(
      `SELECT settlement_status||'|'||coalesce(settlement_outcome,'-')
         FROM app_private.tracked_positions WHERE id='${POS}';`)).toBe('settled|won');
  });
});
