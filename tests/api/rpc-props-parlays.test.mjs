// Stage 7 Gate 2 — RPC cluster 7: props, parlays, event rename, confirm-all.
//
// fm_rpc_rename_event, fm_rpc_confirm_all_pending, fm_rpc_save_prop /
// _settle_prop / _delete_prop, fm_rpc_save_parlay / _delete_parlay, plus their
// fm_rpc_undo branches. Its own workspace (api-prop): a full aggregate whose
// position starts review-PENDING, plus the fixture prop and parlay.
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, catalogScalar, USER_MEMBER, USER_OUTSIDER, USER_VIEWER,
} from './helpers.mjs';

const SLUG = 'api-prop';
const WS = '11110000-0000-4000-8000-00000000000e';
const EVENT = 'aee00000-0000-4000-8000-000000000001';
const BOUT = 'abb00000-0000-4000-8000-000000000001';
const POS = 'a7700000-0000-4000-8000-000000000001';
const PROP = '1700000000110-cccccc';
const PARLAY = '1700000000120-bbbbbb';
const NEW_PROP = '1700000000119-newpr0';
const NEW_PARLAY = '1700000000129-newpar';

beforeAll(() => { applyFixture(); }, 120_000);

const now = () => new Date().toISOString();
const rowCount = (table, extra = '') => Number(catalogScalar(
  `SELECT count(*) FROM app_private.${table} WHERE workspace_id='${WS}' ${extra};`));
const tombstone = (type, id) => catalogScalar(
  `SELECT coalesce((SELECT CASE WHEN s.removed_at IS NULL THEN 'live' ELSE 'tombstoned' END
     FROM app_private.seed_items s WHERE s.workspace_id='${WS}'
       AND s.root_type='${type}' AND s.root_id='${id}'), 'absent');`);

const eventRow = async () =>
  ((await rpc('fm_member_events', { p_slug: SLUG }, { as: USER_MEMBER })).body ?? [])
    .find((e) => e.id === EVENT);
const propRow = async (id) =>
  ((await rpc('fm_member_props', { p_slug: SLUG }, { as: USER_MEMBER })).body ?? [])
    .find((p) => p.id === id);
const posRevision = async (id) => {
  for (const fn of ['fm_member_upcoming', 'fm_member_roi']) {
    const r = ((await rpc(fn, { p_slug: SLUG }, { as: USER_MEMBER })).body ?? [])
      .find((x) => x.tracked_position_id === id);
    if (r) return r.revision;
  }
  throw new Error('position not on a member surface');
};

const latestUndo = (op) => catalogScalar(
  `SELECT id FROM app_private.undo_log WHERE workspace_id='${WS}'
     ${op ? `AND op='${op}'` : ''} AND consumed_at IS NULL
    ORDER BY created_at DESC LIMIT 1;`);
const undo = (id, as = USER_MEMBER) =>
  rpc('fm_rpc_undo', { p_slug: SLUG, p_undo_id: id }, { as });

describe('rename_event (card-wide)', () => {
  it('renames, reports affectedBouts, and undo restores', async () => {
    const before = await eventRow();
    expect(before.name).toBe('Prop Card');
    const res = await rpc('fm_rpc_rename_event',
      { p_slug: SLUG, p_event_id: EVENT, p_patch: { name: 'Renamed Card', promotion: 'PFL' },
        p_expected_revision: before.revision }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].affected_bouts).toBe(1);
    const after = await eventRow();
    expect(after.name).toBe('Renamed Card');
    expect(after.promotion).toBe('PFL');
    expect(after.date).toBe(before.date); // untouched patch key preserved

    const u = await undo(latestUndo('rename_event'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    const restored = await eventRow();
    expect(restored.name).toBe('Prop Card');
    expect(restored.promotion).toBe('UFC');
  });

  it('rejects an empty name and a stale revision; refuses anon and viewer', async () => {
    const rev = (await eventRow()).revision;
    const empty = await rpc('fm_rpc_rename_event',
      { p_slug: SLUG, p_event_id: EVENT, p_patch: { name: '' }, p_expected_revision: rev },
      { as: USER_MEMBER });
    expect(empty.body.code).toBe('23514');

    const stale = await rpc('fm_rpc_rename_event',
      { p_slug: SLUG, p_event_id: EVENT, p_patch: { name: 'X' }, p_expected_revision: '999' },
      { as: USER_MEMBER });
    expect(stale.body.code).toBe('P0001');
    expect(stale.body.message).toMatch(/\bstale_write\b/);

    const anon = await rpc('fm_rpc_rename_event',
      { p_slug: SLUG, p_event_id: EVENT, p_patch: { name: 'X' }, p_expected_revision: rev });
    expect(anon.status).toBe(401);
    const viewer = await rpc('fm_rpc_rename_event',
      { p_slug: SLUG, p_event_id: EVENT, p_patch: { name: 'X' }, p_expected_revision: rev },
      { as: USER_VIEWER });
    expect(viewer.body.code).toBe('42501');
    expect((await eventRow()).name).toBe('Prop Card');
  });
});

describe('confirm_all_pending', () => {
  it('confirms every pending position under a vector, and undo restores', async () => {
    expect(rowCount('tracked_positions', "AND review_status='pending'")).toBe(1);
    const vector = [{ id: POS, revision: await posRevision(POS) }];

    const stale = await rpc('fm_rpc_confirm_all_pending',
      { p_slug: SLUG, p_revisions: [{ id: POS, revision: '999' }] }, { as: USER_MEMBER });
    expect(stale.body.code).toBe('P0001');

    const res = await rpc('fm_rpc_confirm_all_pending',
      { p_slug: SLUG, p_revisions: vector }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].confirmed).toBe(1);
    expect(rowCount('tracked_positions', "AND review_status='confirmed'")).toBe(1);

    const u = await undo(latestUndo('confirm_all_pending'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(rowCount('tracked_positions', "AND review_status='pending'")).toBe(1);
    expect(catalogScalar(
      `SELECT review_reason FROM app_private.tracked_positions WHERE id='${POS}';`))
      .toBe('autoGenerated');
  });

  it('a viewer is refused', async () => {
    const res = await rpc('fm_rpc_confirm_all_pending',
      { p_slug: SLUG, p_revisions: [] }, { as: USER_VIEWER });
    expect(res.body.code).toBe('42501');
  });
});

describe('props: create / settle / remove', () => {
  const newProp = () => ({
    id: NEW_PROP, eventId: EVENT, target: { kind: 'bout', boutId: BOUT, corner: 'B' },
    method: 'DEC', propType: 'method', label: 'Prop Beta by decision', odds: -120,
    stakeUnits: 2, result: 'PENDING', pickSource: 'human', createdAt: now(),
  });

  it('create, then undo removes it and its ledger row', async () => {
    const before = rowCount('props');
    const res = await rpc('fm_rpc_save_prop', { p_slug: SLUG, p_prop: newProp() },
                          { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].id).toBe(NEW_PROP);
    expect(rowCount('props')).toBe(before + 1);
    expect(tombstone('prop', NEW_PROP)).toBe('live');

    const u = await undo(latestUndo('save_prop'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(rowCount('props')).toBe(before);
    expect(tombstone('prop', NEW_PROP)).toBe('absent');
  });

  it('settle updates the result; invalid result rejected; undo restores', async () => {
    const bad = await rpc('fm_rpc_settle_prop',
      { p_slug: SLUG, p_prop_id: PROP, p_result: 'MAYBE',
        p_expected_revision: (await propRow(PROP)).revision }, { as: USER_MEMBER });
    expect(bad.body.code).toBe('23514');

    const res = await rpc('fm_rpc_settle_prop',
      { p_slug: SLUG, p_prop_id: PROP, p_result: 'WON',
        p_expected_revision: (await propRow(PROP)).revision }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect((await propRow(PROP)).result).toBe('WON');

    const u = await undo(latestUndo('settle_prop'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect((await propRow(PROP)).result).toBe('PENDING');
  });

  it('remove tombstones and undo re-inserts; stale revision refused', async () => {
    const stale = await rpc('fm_rpc_delete_prop',
      { p_slug: SLUG, p_prop_id: PROP, p_expected_revision: '999' }, { as: USER_MEMBER });
    expect(stale.body.code).toBe('P0001');

    const before = await propRow(PROP);
    const res = await rpc('fm_rpc_delete_prop',
      { p_slug: SLUG, p_prop_id: PROP, p_expected_revision: before.revision },
      { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(await propRow(PROP)).toBeUndefined();
    expect(tombstone('prop', PROP)).toBe('tombstoned');

    const u = await undo(latestUndo('delete_prop'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    const after = await propRow(PROP);
    expect(after.result).toBe(before.result);
    expect(after.label).toBe(before.label);
    expect(tombstone('prop', PROP)).toBe('live');
  });
});

describe('parlays: create / remove', () => {
  const newParlay = () => ({
    id: NEW_PARLAY, eventId: EVENT, combinedOdds: 400, stakeUnits: 1,
    pickSource: 'human', createdAt: now(),
    legs: [{ boutId: BOUT, pickedCorner: 'B', modelDefaultCorner: null,
             modelProbAtBuild: null, overridden: false }],
  });

  it('create with a leg, then undo removes parlay and leg', async () => {
    const before = rowCount('parlays');
    const res = await rpc('fm_rpc_save_parlay', { p_slug: SLUG, p_parlay: newParlay() },
                          { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(rowCount('parlays')).toBe(before + 1);
    expect(rowCount('parlay_legs', `AND parlay_id='${NEW_PARLAY}'`)).toBe(1);
    expect(tombstone('parlay', NEW_PARLAY)).toBe('live');

    const u = await undo(latestUndo('save_parlay'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(rowCount('parlays')).toBe(before);
    expect(rowCount('parlay_legs', `AND parlay_id='${NEW_PARLAY}'`)).toBe(0);
    expect(tombstone('parlay', NEW_PARLAY)).toBe('absent');
  });

  it('a parlay with no legs is refused by the deferred trigger', async () => {
    const p = newParlay(); p.legs = [];
    const res = await rpc('fm_rpc_save_parlay', { p_slug: SLUG, p_parlay: p },
                          { as: USER_MEMBER });
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/has no legs/);
    expect(rowCount('parlays', `AND id='${NEW_PARLAY}'`)).toBe(0);
  });

  it('remove tombstones parlay + legs, and undo re-inserts both', async () => {
    const legsBefore = rowCount('parlay_legs', `AND parlay_id='${PARLAY}'`);
    expect(legsBefore).toBe(1);
    const res = await rpc('fm_rpc_delete_parlay', { p_slug: SLUG, p_parlay_id: PARLAY },
                          { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(rowCount('parlays', `AND id='${PARLAY}'`)).toBe(0);
    expect(rowCount('parlay_legs', `AND parlay_id='${PARLAY}'`)).toBe(0);
    expect(tombstone('parlay', PARLAY)).toBe('tombstoned');

    const u = await undo(latestUndo('delete_parlay'));
    expect(u.status, JSON.stringify(u.body)).toBe(200);
    expect(rowCount('parlays', `AND id='${PARLAY}'`)).toBe(1);
    expect(rowCount('parlay_legs', `AND parlay_id='${PARLAY}'`)).toBe(1);
    expect(tombstone('parlay', PARLAY)).toBe('live');
  });

  it('anon and viewer are refused', async () => {
    const anon = await rpc('fm_rpc_delete_parlay', { p_slug: SLUG, p_parlay_id: PARLAY });
    expect(anon.status).toBe(401);
    const viewer = await rpc('fm_rpc_delete_parlay',
      { p_slug: SLUG, p_parlay_id: PARLAY }, { as: USER_VIEWER });
    expect(viewer.body.code).toBe('42501');
  });
});
