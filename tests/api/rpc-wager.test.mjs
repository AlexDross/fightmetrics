// Stage 7 Gate 2 — RPC cluster 6: wagers, over real HTTP.
//
// create / updateStake / updateNotes / settle / remove, each bout-lock-bound,
// plus the undo branches they add to fm_rpc_undo. Its own workspace (api-wager),
// a full aggregate WITH a wager, so nothing else is disturbed and no test depends
// on shared WS_PUBLIC state or file order.
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, scalar, catalogScalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER,
} from './helpers.mjs';

const SLUG = 'api-wager';
const WS = '11110000-0000-4000-8000-00000000000c';
const BOUT = '1bb00000-0000-4000-8000-000000000001';
const ASSESS = '1ff00000-0000-4000-8000-000000000001';
const MARKET = '1cc00000-0000-4000-8000-000000000001';
const POS = '17700000-0000-4000-8000-000000000001';
const WAG = '19900000-0000-4000-8000-000000000001';       // the fixture wager (corner A, open, stake 2)
const NEW = '1aa00000-0000-4000-8000-000000000001';       // created by the create test

// applyFixture is parameterless; WS_PUBLIC's probability is centrally owned in
// helpers, and this file only touches its own WS_WAGER workspace.
beforeAll(() => { applyFixture(); }, 120_000);

const now = () => new Date().toISOString();
const wagerCount = () => Number(catalogScalar(
  `SELECT count(*) FROM app_private.wagers WHERE workspace_id='${WS}';`));

const wagerRow = async (id) =>
  ((await rpc('fm_member_wagers_by_bout', { p_slug: SLUG, p_bout_id: BOUT },
              { as: USER_MEMBER })).body ?? []).find((w) => w.id === id);
const wagerRev = async (id) => (await wagerRow(id)).revision;

const latestUndo = (op) => catalogScalar(
  `SELECT id FROM app_private.undo_log WHERE workspace_id='${WS}'
     ${op ? `AND op='${op}'` : ''} AND consumed_at IS NULL
    ORDER BY created_at DESC LIMIT 1;`);
const undo = (id, as = USER_MEMBER) =>
  rpc('fm_rpc_undo', { p_slug: SLUG, p_undo_id: id }, { as });

// The full bout vector grade/return demand: bout + positions + wagers on it.
async function vector() {
  const bout = (await rpc('fm_member_bouts', { p_slug: SLUG }, { as: USER_MEMBER }))
    .body.find((b) => b.id === BOUT);
  const v = [{ id: bout.id, revision: bout.revision }];
  for (const fn of ['fm_member_upcoming', 'fm_member_roi']) {
    for (const r of (await rpc(fn, { p_slug: SLUG }, { as: USER_MEMBER })).body ?? []) {
      if (r.bout_id === BOUT) v.push({ id: r.tracked_position_id, revision: r.revision });
    }
  }
  for (const w of (await rpc('fm_member_wagers_by_bout', { p_slug: SLUG, p_bout_id: BOUT },
                             { as: USER_MEMBER })).body) {
    v.push({ id: w.id, revision: w.revision });
  }
  return v;
}

const newWager = () => ({
  id: NEW, boutId: BOUT, assessmentId: ASSESS, marketSnapshotId: MARKET,
  corner: 'B', stakeUnits: 3, placedAt: now(),
  settlement: { status: 'open' }, notes: null, externalIds: {},
});

describe('create', () => {
  it('creates a wager, and undo removes exactly it', async () => {
    expect(wagerCount()).toBe(1);
    const res = await rpc('fm_rpc_create_wager',
      { p_slug: SLUG, p_wager: newWager() }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].id).toBe(NEW);
    expect(wagerCount()).toBe(2);
    const row = await wagerRow(NEW);
    expect(row.corner).toBe('B');
    expect(row.stake_units).toBe('3');
    expect(row.settlement_status).toBe('open');

    const u = await undo(latestUndo('create_wager'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(wagerCount()).toBe(1);
    expect(await wagerRow(NEW)).toBeUndefined();
  });

  it('anon cannot execute it', async () => {
    const res = await rpc('fm_rpc_create_wager', { p_slug: SLUG, p_wager: newWager() });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('42501');
  });

  it('a viewer is refused for lacking the role', async () => {
    const res = await rpc('fm_rpc_create_wager',
      { p_slug: SLUG, p_wager: newWager() }, { as: USER_VIEWER });
    expect(res.body.code).toBe('42501');
    expect(res.body.message).toMatch(/insufficient workspace role/);
  });

  it('a wager against a non-existent assessment is rejected by the FK', async () => {
    const w = newWager();
    w.assessmentId = '1ff00000-0000-4000-8000-0000000000ff';
    const res = await rpc('fm_rpc_create_wager', { p_slug: SLUG, p_wager: w },
                          { as: USER_MEMBER });
    expect(res.body.code).toBe('23503');
    expect(wagerCount()).toBe(1);
  });
});

describe('updateStake', () => {
  it('updates an open wager and undo restores the prior stake', async () => {
    const res = await rpc('fm_rpc_update_stake',
      { p_slug: SLUG, p_wager_id: WAG, p_stake_units: '5',
        p_expected_revision: await wagerRev(WAG) }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect((await wagerRow(WAG)).stake_units).toBe('5');

    const u = await undo(latestUndo('update_stake'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect((await wagerRow(WAG)).stake_units).toBe('2');
  });

  it('a stale expected revision is a stale_write conflict', async () => {
    const res = await rpc('fm_rpc_update_stake',
      { p_slug: SLUG, p_wager_id: WAG, p_stake_units: '9', p_expected_revision: '999' },
      { as: USER_MEMBER });
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/\bstale_write\b/);
    expect((await wagerRow(WAG)).stake_units).toBe('2');
  });

  it('rejects a non-canonical or non-positive stake', async () => {
    for (const bad of ['0', '-1', 'abc', '01', '']) {
      const res = await rpc('fm_rpc_update_stake',
        { p_slug: SLUG, p_wager_id: WAG, p_stake_units: bad,
          p_expected_revision: await wagerRev(WAG) }, { as: USER_MEMBER });
      expect(res.body.code, `stake ${JSON.stringify(bad)}`).toBe('23514');
    }
    expect((await wagerRow(WAG)).stake_units).toBe('2');
  });
});

describe('updateNotes', () => {
  it('updates notes and undo restores the prior note', async () => {
    const r = await rpc('fm_rpc_update_notes',
      { p_slug: SLUG, p_wager_id: WAG, p_notes: 'changed note',
        p_expected_revision: await wagerRev(WAG) }, { as: USER_MEMBER });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect((await wagerRow(WAG)).notes).toBe('changed note');

    const u = await undo(latestUndo('update_notes'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect((await wagerRow(WAG)).notes).toBe('api bet');
  });

  it('normalizes an empty string to null, and undo restores the note', async () => {
    const r = await rpc('fm_rpc_update_notes',
      { p_slug: SLUG, p_wager_id: WAG, p_notes: '',
        p_expected_revision: await wagerRev(WAG) }, { as: USER_MEMBER });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    expect((await wagerRow(WAG)).notes).toBeNull();

    const u = await undo(latestUndo('update_notes'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect((await wagerRow(WAG)).notes).toBe('api bet');
  });
});

describe('settle (bout resolved)', () => {
  it('settles against the bout, rejects an inconsistent outcome, and undo restores', async () => {
    // Grade the bout so the wager (corner A, bout A) becomes won.
    const g = await rpc('fm_rpc_grade_bout',
      { p_slug: SLUG, p_bout_id: BOUT, p_outcome: 'A', p_method: 'DEC',
        p_revisions: await vector() }, { as: USER_MEMBER });
    expect(g.status, JSON.stringify(g.body)).toBe(200);
    expect((await wagerRow(WAG)).settlement_status).toBe('settled');
    expect((await wagerRow(WAG)).settlement_outcome).toBe('won');

    // an outcome the bout contradicts is refused by the deferred settlement trigger
    const wrong = await rpc('fm_rpc_settle_wager',
      { p_slug: SLUG, p_wager_id: WAG, p_outcome: 'lost',
        p_expected_revision: await wagerRev(WAG) }, { as: USER_MEMBER });
    expect(wrong.body.code).toBe('P0001');
    expect((await wagerRow(WAG)).settlement_outcome).toBe('won');

    // a settled wager's stake cannot be changed
    const stake = await rpc('fm_rpc_update_stake',
      { p_slug: SLUG, p_wager_id: WAG, p_stake_units: '5',
        p_expected_revision: await wagerRev(WAG) }, { as: USER_MEMBER });
    expect(stake.body.code).toBe('23514');
    expect(stake.body.message).toMatch(/settled/);

    // an explicit, consistent settle succeeds and bumps the revision
    const beforeRev = await wagerRev(WAG);
    const ok = await rpc('fm_rpc_settle_wager',
      { p_slug: SLUG, p_wager_id: WAG, p_outcome: 'won', p_expected_revision: beforeRev },
      { as: USER_MEMBER });
    expect(ok.status, JSON.stringify(ok.body)).toBe(200);
    expect(BigInt(await wagerRev(WAG))).toBe(BigInt(beforeRev) + 1n);
    expect((await wagerRow(WAG)).settlement_outcome).toBe('won');
    // undo the explicit settle: still won (restores the graded state)
    const u = await undo(latestUndo('settle_wager'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect((await wagerRow(WAG)).settlement_outcome).toBe('won');

    // restore the fixture: return the bout to pending, wager back to open
    const back = await rpc('fm_rpc_return_bout_to_pending',
      { p_slug: SLUG, p_bout_id: BOUT, p_revisions: await vector() }, { as: USER_MEMBER });
    expect(back.status, JSON.stringify(back.body)).toBe(200);
    expect((await wagerRow(WAG)).settlement_status).toBe('open');
  });
});

describe('remove', () => {
  it('removes a wager and undo re-inserts it exactly', async () => {
    const before = await wagerRow(WAG);
    const res = await rpc('fm_rpc_delete_wager',
      { p_slug: SLUG, p_wager_id: WAG, p_expected_revision: await wagerRev(WAG) },
      { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].removed).toBe(WAG);
    expect(wagerCount()).toBe(0);

    const u = await undo(latestUndo('delete_wager'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(wagerCount()).toBe(1);
    const after = await wagerRow(WAG);
    expect(after.corner).toBe(before.corner);
    expect(after.stake_units).toBe(before.stake_units);
    expect(after.notes).toBe(before.notes);
    expect(after.settlement_status).toBe('open');
  });

  it('a stale expected revision is a conflict and deletes nothing', async () => {
    const res = await rpc('fm_rpc_delete_wager',
      { p_slug: SLUG, p_wager_id: WAG, p_expected_revision: '999' }, { as: USER_MEMBER });
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/\bstale_write\b/);
    expect(wagerCount()).toBe(1);
  });

  it('an unknown wager is notFound', async () => {
    const res = await rpc('fm_rpc_delete_wager',
      { p_slug: SLUG, p_wager_id: '1aa00000-0000-4000-8000-0000000000fe',
        p_expected_revision: '1' }, { as: USER_MEMBER });
    expect(res.body.code).toBe('42704');
  });
});
