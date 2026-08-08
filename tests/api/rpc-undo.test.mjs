// Stage 7 Gate 2 — RPC cluster 3: the undo foundation, over real HTTP.
//
// fm_rpc_undo for the five operations that exist today. Its own workspace, so it
// neither depends on nor disturbs any other file.
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, scalar, catalogScalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER,
} from './helpers.mjs';

const SLUG = 'api-undo';
const WS   = '11110000-0000-4000-8000-000000000006';
const BOUT = '6bb00000-0000-4000-8000-000000000001';
const POS  = '67700000-0000-4000-8000-000000000001';
const WAG  = '69900000-0000-4000-8000-000000000001';
const MARKET = '6cc00000-0000-4000-8000-000000000001';

beforeAll(() => { applyFixture(); }, 120_000);

/** Everything the five operations can change, for exact before/after equality. */
const snapshot = () => catalogScalar(`
  SELECT (SELECT b.result_status||'|'||coalesce(b.result_outcome,'-')||'|'
                 ||coalesce(b.result_method,'-') FROM app_private.bouts b
           WHERE b.id='${BOUT}')
      || '//' ||
         (SELECT t.corner||'|'||coalesce(t.market_snapshot_id::text,'-')||'|'
                 ||t.settlement_status||'|'||coalesce(t.settlement_outcome,'-')||'|'
                 ||coalesce(t.financial_status,'-')||'|'
                 ||coalesce(t.profit_units::text,'-')||'|'||t.review_status||'|'
                 ||coalesce(t.review_reason,'-')||'|'
                 ||coalesce(t.confirmed_at::text,'-')
            FROM app_private.tracked_positions t WHERE t.id='${POS}')
      || '//' ||
         (SELECT g.settlement_status||'|'||coalesce(g.settlement_outcome,'-')||'|'
                 ||coalesce(g.profit_units::text,'-')
            FROM app_private.wagers g WHERE g.id='${WAG}');`);

const revOf = (id) => catalogScalar(`
  SELECT revision FROM (
    SELECT id::text AS id, revision FROM app_private.bouts
    UNION ALL SELECT id::text, revision FROM app_private.tracked_positions
    UNION ALL SELECT id::text, revision FROM app_private.wagers) x
   WHERE x.id='${id}';`);

const markets = () => Number(catalogScalar(
  `SELECT count(*) FROM app_private.market_snapshots WHERE workspace_id='${WS}';`));

const latestUndo = (op) => catalogScalar(
  `SELECT id FROM app_private.undo_log WHERE workspace_id='${WS}'
     ${op ? `AND op='${op}'` : ''} AND consumed_at IS NULL
    ORDER BY created_at DESC LIMIT 1;`);

const undo = (id, as = USER_MEMBER) =>
  rpc('fm_rpc_undo', { p_slug: SLUG, p_undo_id: id }, { as });

async function vector() {
  const bout = (await rpc('fm_member_bouts', { p_slug: SLUG }, { as: USER_MEMBER }))
    .body.find((b) => b.id === BOUT);
  const positions = [];
  for (const fn of ['fm_member_upcoming', 'fm_member_roi']) {
    for (const r of (await rpc(fn, { p_slug: SLUG }, { as: USER_MEMBER })).body ?? []) {
      if (r.bout_id === BOUT) positions.push({ id: r.tracked_position_id, revision: r.revision });
    }
  }
  const wagers = (await rpc('fm_member_wagers_by_bout',
    { p_slug: SLUG, p_bout_id: BOUT }, { as: USER_MEMBER })).body
    .map((w) => ({ id: w.id, revision: w.revision }));
  return [{ id: bout.id, revision: bout.revision }, ...positions, ...wagers];
}
const posRevision = async () => {
  for (const fn of ['fm_member_upcoming', 'fm_member_roi']) {
    const row = ((await rpc(fn, { p_slug: SLUG }, { as: USER_MEMBER })).body ?? [])
      .find((r) => r.tracked_position_id === POS);
    if (row) return row.revision;
  }
  throw new Error('position not on any member surface');
};

describe('each operation returns to its EXACT prior state', () => {
  it('change_tracked_corner', async () => {
    const before = snapshot();
    const res = await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await posRevision() }, { as: USER_MEMBER });
    expect(res.status).toBe(200);
    expect(snapshot()).not.toBe(before);

    const u = await undo(latestUndo('change_tracked_corner'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(u.body[0].op).toBe('change_tracked_corner');
    // Exact, apart from the revision — which is audit metadata and MUST move.
    expect(snapshot()).toBe(before);
  });

  it('amend_tracked_price, and the appended snapshot is removed', async () => {
    const before = snapshot();
    const marketsBefore = markets();
    const res = await rpc('fm_rpc_amend_tracked_price',
      { p_slug: SLUG, p_position_id: POS, p_odds: -220,
        p_expected_revision: await posRevision() }, { as: USER_MEMBER });
    expect(res.status).toBe(200);
    expect(markets()).toBe(marketsBefore + 1);

    const u = await undo(latestUndo('amend_tracked_price'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(snapshot()).toBe(before);
    // created_ids removed only after the pointer moved off it
    expect(markets()).toBe(marketsBefore);
    expect(catalogScalar(
      `SELECT coalesce(market_snapshot_id::text,'-') FROM app_private.tracked_positions
        WHERE id='${POS}';`)).toBe(MARKET);
  });

  it('confirm_entry restores review status, reason and timestamp', async () => {
    scalar(`UPDATE app_private.tracked_positions
               SET review_status='pending', review_reason='autoGenerated',
                   confirmed_at=NULL WHERE id='${POS}';`);
    const before = snapshot();
    const res = await rpc('fm_rpc_confirm_entry',
      { p_slug: SLUG, p_position_id: POS, p_expected_revision: await posRevision() },
      { as: USER_MEMBER });
    expect(res.status).toBe(200);

    const u = await undo(latestUndo('confirm_entry'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(snapshot()).toBe(before);
    // the reason is part of the union — restoring 'pending' without it would
    // violate tracked_positions_review_union
    expect(catalogScalar(
      `SELECT review_reason FROM app_private.tracked_positions WHERE id='${POS}';`))
      .toBe('autoGenerated');
    scalar(`UPDATE app_private.tracked_positions
               SET review_status='notRequired', review_reason=NULL,
                   confirmed_at=NULL WHERE id='${POS}';`);
  });

  it('grade_bout restores the bout AND every dependent', async () => {
    const before = snapshot();
    const res = await rpc('fm_rpc_grade_bout',
      { p_slug: SLUG, p_bout_id: BOUT, p_outcome: 'A', p_method: 'DEC',
        p_revisions: await vector() }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(snapshot()).not.toBe(before);

    const u = await undo(latestUndo('grade_bout'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(snapshot()).toBe(before);
    // the restored vector names bout, position and wager
    expect(u.body[0].restored.map((x) => x.table).sort())
      .toEqual(['bouts', 'tracked_positions', 'wagers']);
  });

  it('return_bout_to_pending restores the graded state', async () => {
    await rpc('fm_rpc_grade_bout',
      { p_slug: SLUG, p_bout_id: BOUT, p_outcome: 'A', p_method: 'DEC',
        p_revisions: await vector() }, { as: USER_MEMBER });
    const graded = snapshot();

    const back = await rpc('fm_rpc_return_bout_to_pending',
      { p_slug: SLUG, p_bout_id: BOUT, p_revisions: await vector() },
      { as: USER_MEMBER });
    expect(back.status, JSON.stringify(back.body)).toBe(200);

    const u = await undo(latestUndo('return_bout_to_pending'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(snapshot()).toBe(graded);

    // leave the fixture pending again
    await rpc('fm_rpc_return_bout_to_pending',
      { p_slug: SLUG, p_bout_id: BOUT, p_revisions: await vector() },
      { as: USER_MEMBER });
  });
});

describe('authorization and scope', () => {
  let token;
  beforeAll(async () => {
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await posRevision() }, { as: USER_MEMBER });
    token = latestUndo('change_tracked_corner');
  });

  it('anon cannot execute fm_rpc_undo', async () => {
    const res = await rpc('fm_rpc_undo', { p_slug: SLUG, p_undo_id: token });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('42501');
  });

  it('a viewer is refused for lacking the role', async () => {
    const res = await undo(token, USER_VIEWER);
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/insufficient workspace role/);
  });

  it('an EDITOR who did not create it is refused — creator-scoped', async () => {
    // USER_OUTSIDER is a genuine editor here, so this isolates creator scope
    // from role: the role check passes and the creator check is what refuses.
    const res = await undo(token, USER_OUTSIDER);
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/undoNotCreator/);
  });

  it('a token from another workspace is not found', async () => {
    const res = await rpc('fm_rpc_undo',
      { p_slug: 'api-bout', p_undo_id: token }, { as: USER_MEMBER });
    expect(res.body.code).toBe('42704');
  });

  it('an expired token is refused and stays unconsumed', async () => {
    scalar(`UPDATE app_private.undo_log SET expires_at = now() - interval '1 minute'
             WHERE id='${token}';`);
    const res = await undo(token);
    expect(res.body.code).toBe('55000');
    expect(res.body.message).toMatch(/undoExpired/);
    expect(catalogScalar(
      `SELECT coalesce(consumed_at::text,'unconsumed') FROM app_private.undo_log
        WHERE id='${token}';`)).toBe('unconsumed');
    scalar(`UPDATE app_private.undo_log SET expires_at = now() + interval '15 minutes'
             WHERE id='${token}';`);
  });

  it('single use: the second attempt is refused', async () => {
    const first = await undo(token);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    expect(catalogScalar(
      `SELECT coalesce(consumed_at::text,'unconsumed') FROM app_private.undo_log
        WHERE id='${token}';`)).not.toBe('unconsumed');

    const second = await undo(token);
    expect(second.body.code).toBe('55000');
    expect(second.body.message).toMatch(/undoAlreadyConsumed/);
  });

  it('undo does NOT create another undo entry', async () => {
    const before = Number(catalogScalar(
      `SELECT count(*) FROM app_private.undo_log WHERE workspace_id='${WS}';`));
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await posRevision() }, { as: USER_MEMBER });
    const t = latestUndo('change_tracked_corner');
    await undo(t);
    // exactly ONE new row — the operation's. The undo added none.
    expect(Number(catalogScalar(
      `SELECT count(*) FROM app_private.undo_log WHERE workspace_id='${WS}';`)))
      .toBe(before + 1);
  });
});

describe('conflict detection', () => {
  it('a single stale row aborts with stale_write and the real revision', async () => {
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await posRevision() }, { as: USER_MEMBER });
    const token = latestUndo('change_tracked_corner');

    // drift: someone edits the position after the operation
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'A',
        p_expected_revision: await posRevision() }, { as: USER_MEMBER });

    const before = snapshot();
    const res = await undo(token);
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/\bstale_write\b/);
    expect(res.body.message).toMatch(new RegExp(`revision=${revOf(POS)}\\b`));
    // atomic abort: nothing restored, token still usable
    expect(snapshot()).toBe(before);
    expect(catalogScalar(
      `SELECT coalesce(consumed_at::text,'unconsumed') FROM app_private.undo_log
        WHERE id='${token}';`)).toBe('unconsumed');
  });

  it('a MULTI-row stale vector names every drifted row', async () => {
    await rpc('fm_rpc_grade_bout',
      { p_slug: SLUG, p_bout_id: BOUT, p_outcome: 'A', p_method: 'DEC',
        p_revisions: await vector() }, { as: USER_MEMBER });
    const token = latestUndo('grade_bout');

    // move BOTH the bout and its dependents
    await rpc('fm_rpc_return_bout_to_pending',
      { p_slug: SLUG, p_bout_id: BOUT, p_revisions: await vector() },
      { as: USER_MEMBER });

    const res = await undo(token);
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/\bstale_write\b/);
    // the stale list names all three, not merely the first
    for (const id of [BOUT, POS, WAG]) {
      expect(res.body.message, id).toContain(id);
    }
  });

  it('an unsafe created_ids row is refused rather than orphaning a reference',
    async () => {
      await rpc('fm_rpc_amend_tracked_price',
        { p_slug: SLUG, p_position_id: POS, p_odds: -260,
          p_expected_revision: await posRevision() }, { as: USER_MEMBER });
      const token = latestUndo('amend_tracked_price');
      const created = catalogScalar(
        `SELECT created_ids -> 0 ->> 'id' FROM app_private.undo_log WHERE id='${token}';`);

      // a wager now points at the appended snapshot, so removing it would
      // orphan a live reference
      scalar(`UPDATE app_private.wagers SET market_snapshot_id='${created}'
               WHERE id='${WAG}';`);

      const res = await undo(token);
      expect(res.body.code).toBe('55000');
      expect(res.body.message).toMatch(/undoUnsafeCreatedRow/);
      // rollback: the snapshot survives and the token is unconsumed
      expect(Number(catalogScalar(
        `SELECT count(*) FROM app_private.market_snapshots WHERE id='${created}';`)))
        .toBe(1);
      expect(catalogScalar(
        `SELECT coalesce(consumed_at::text,'unconsumed') FROM app_private.undo_log
          WHERE id='${token}';`)).toBe('unconsumed');

      scalar(`UPDATE app_private.wagers SET market_snapshot_id='${MARKET}'
               WHERE id='${WAG}';`);
    });

  it('two concurrent undos of the same token: exactly one succeeds', async () => {
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await posRevision() }, { as: USER_MEMBER });
    const token = latestUndo('change_tracked_corner');
    const posBefore = revOf(POS);

    const [a, b] = await Promise.all([undo(token), undo(token)]);
    const ok = [a, b].filter((r) => r.status === 200);
    expect(ok.length, `${a.status}/${b.status}`).toBe(1);
    const loser = [a, b].find((r) => r.status !== 200);
    // the undo row lock serialises them; the loser sees it already consumed
    expect(loser.body.code).toBe('55000');
    expect(loser.body.message).toMatch(/undoAlreadyConsumed/);
    // restored exactly ONCE
    expect(BigInt(revOf(POS))).toBe(BigInt(posBefore) + 1n);
  });
});

describe('non-vacuity', () => {
  it('the conflict check is what refuses — with matching revisions it succeeds',
    async () => {
      // Same shape as the stale test, minus the drift. If the vector check were
      // inert, the stale tests above would pass for the wrong reason.
      await rpc('fm_rpc_change_tracked_corner',
        { p_slug: SLUG, p_position_id: POS, p_corner: 'A',
          p_expected_revision: await posRevision() }, { as: USER_MEMBER });
      const token = latestUndo('change_tracked_corner');
      const res = await undo(token);
      expect(res.status, JSON.stringify(res.body)).toBe(200);
    });

  it('absent_ids is validated, and a populated one is refused for now', async () => {
    await rpc('fm_rpc_change_tracked_corner',
      { p_slug: SLUG, p_position_id: POS, p_corner: 'B',
        p_expected_revision: await posRevision() }, { as: USER_MEMBER });
    const token = latestUndo('change_tracked_corner');
    expect(catalogScalar(
      `SELECT absent_ids::text FROM app_private.undo_log WHERE id='${token}';`))
      .toBe('[]');

    scalar(`UPDATE app_private.undo_log
               SET absent_ids='[{"table":"tracked_positions","id":"x"}]'::jsonb
             WHERE id='${token}';`);
    const res = await undo(token);
    // deleted-row restoration belongs to the deletion cluster; until then a
    // populated absent_ids must REFUSE rather than silently ignore the rows.
    expect(res.body.code).toBe('0A000');
    expect(res.body.message).toMatch(/undoUnsupportedRestore/);
    scalar(`UPDATE app_private.undo_log SET absent_ids='[]'::jsonb
             WHERE id='${token}';`);
    await undo(token);
  });

  it('prior_state is still not on the read surface', async () => {
    const list = await rpc('fm_member_undo_list', { p_slug: SLUG }, { as: USER_MEMBER });
    expect(list.status).toBe(200);
    for (const row of list.body) expect('prior_state' in row).toBe(false);
  });
});
