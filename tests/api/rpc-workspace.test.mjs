// Stage 7 Gate 2 — RPC cluster 8: workspace (current, seedVersion,
// setSeedVersion, importStore, reset), over real HTTP.
//
// Its own workspace (api-ws): a full aggregate to export, reset and re-import.
// Owner-only mutations, backup-confirmed import/reset, atomic whole-store
// replacement with a no-partial-write proof, and StoreSchema round-trip.
import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSchema } from '../../src/data/schemas/entities.mjs';
import {
  rpc, applyFixture, catalogScalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER, CLAIMANT_A,
} from './helpers.mjs';

const SLUG = 'api-ws';
const WS = '11110000-0000-4000-8000-00000000000f';

beforeAll(() => { applyFixture(); }, 120_000);

const current = async (as = USER_MEMBER) =>
  ((await rpc('fm_member_workspace', { p_slug: SLUG }, { as })).body ?? [])[0];
const seedVersion = async (as = USER_MEMBER) =>
  (await rpc('fm_member_seed_version', { p_slug: SLUG }, { as })).body;
const exportStore = async (as = USER_MEMBER) =>
  (await rpc('fm_member_export_store', { p_slug: SLUG }, { as })).body;
const entityCount = () => Number(catalogScalar(`
  SELECT (SELECT count(*) FROM app_private.events WHERE workspace_id='${WS}')
       + (SELECT count(*) FROM app_private.bouts WHERE workspace_id='${WS}')
       + (SELECT count(*) FROM app_private.prediction_runs WHERE workspace_id='${WS}')
       + (SELECT count(*) FROM app_private.tracked_positions WHERE workspace_id='${WS}')
       + (SELECT count(*) FROM app_private.props WHERE workspace_id='${WS}')
       + (SELECT count(*) FROM app_private.parlays WHERE workspace_id='${WS}');`));

describe('current / seedVersion / setSeedVersion', () => {
  it('current returns workspace metadata; seedVersion starts null', async () => {
    const c = await current();
    expect(c.slug).toBe(SLUG);
    expect(c.is_public).toBe(false);
    expect(c.schema_version).toBe(1);
    expect(c.seed_version).toBeNull();
    expect(typeof c.revision).toBe('string');
    expect(await seedVersion()).toBeNull();
    // fm_member_* boundary: an AUTHENTICATED non-member sees nothing (anon can't
    // reach fm_member_* at all — that's a separate 401 grant boundary).
    const nonMember = await rpc('fm_member_workspace', { p_slug: SLUG }, { as: CLAIMANT_A });
    expect(nonMember.status).toBe(200);
    expect(nonMember.body ?? []).toEqual([]);
  });

  it('setSeedVersion is owner-only, revision-checked, and reflected in reads', async () => {
    const rev = (await current()).revision;
    const anon = await rpc('fm_rpc_set_seed_version',
      { p_slug: SLUG, p_version: 'x', p_expected_revision: rev });
    expect(anon.status).toBe(401);
    const editor = await rpc('fm_rpc_set_seed_version',
      { p_slug: SLUG, p_version: 'x', p_expected_revision: rev }, { as: USER_OUTSIDER });
    expect(editor.body.code).toBe('42501'); // owner-only, an editor is refused
    const stale = await rpc('fm_rpc_set_seed_version',
      { p_slug: SLUG, p_version: 'x', p_expected_revision: '999' }, { as: USER_MEMBER });
    expect(stale.body.code).toBe('P0001');

    const res = await rpc('fm_rpc_set_seed_version',
      { p_slug: SLUG, p_version: 'seed-v1', p_expected_revision: rev }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].seed_version).toBe('seed-v1');
    expect(await seedVersion()).toBe('seed-v1');
    expect((await current()).seed_version).toBe('seed-v1');
  });
});

describe('export → reset → import: atomicity and round-trip', () => {
  let S0;
  beforeAll(async () => { S0 = await exportStore(); });

  it('the exported store is a valid Stage 6 Store with non-empty sections', () => {
    expect(StoreSchema.safeParse(S0).success).toBe(true);
    for (const k of ['events', 'bouts', 'predictionRuns', 'predictionSnapshots',
                     'marketSnapshots', 'bettingAssessments', 'trackedPositions',
                     'props', 'parlays']) {
      expect(S0[k].length, `${k} empty`).toBeGreaterThan(0);
    }
  });

  it('reset requires a confirmed backup and is owner-only', async () => {
    const noConfirm = await rpc('fm_rpc_reset_workspace',
      { p_slug: SLUG, p_backup_confirmed: false }, { as: USER_MEMBER });
    expect(noConfirm.body.code).toBe('23514');
    expect(noConfirm.body.message).toMatch(/backupConfirmed/);
    const editor = await rpc('fm_rpc_reset_workspace',
      { p_slug: SLUG, p_backup_confirmed: true }, { as: USER_OUTSIDER });
    expect(editor.body.code).toBe('42501');
    expect(entityCount()).toBeGreaterThan(0); // nothing was cleared
  });

  it('reset clears entities and seed_version but keeps the workspace row', async () => {
    const res = await rpc('fm_rpc_reset_workspace',
      { p_slug: SLUG, p_backup_confirmed: true }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(entityCount()).toBe(0);
    expect(await seedVersion()).toBeNull();
    const c = await current();
    expect(c.slug).toBe(SLUG); // identity preserved
    const empty = await exportStore();
    for (const k of ['events', 'bouts', 'predictionRuns', 'trackedPositions',
                     'props', 'parlays']) {
      expect(empty[k]).toEqual([]);
    }
  });

  it('import requires a confirmed backup and rejects a future schema version', async () => {
    const noConfirm = await rpc('fm_rpc_import_store',
      { p_slug: SLUG, p_store: S0, p_backup_confirmed: false }, { as: USER_MEMBER });
    expect(noConfirm.body.code).toBe('23514');
    const future = { ...S0, meta: { ...S0.meta, schemaVersion: S0.meta.schemaVersion + 1 } };
    const res = await rpc('fm_rpc_import_store',
      { p_slug: SLUG, p_store: future, p_backup_confirmed: true }, { as: USER_MEMBER });
    expect(res.body.code).toBe('23514');
    expect(res.body.message).toMatch(/unknownFutureVersion/);
    expect(entityCount()).toBe(0); // still empty from the reset; nothing imported
  });

  it('import restores the whole store and round-trips exactly', async () => {
    const res = await rpc('fm_rpc_import_store',
      { p_slug: SLUG, p_store: S0, p_backup_confirmed: true }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const reexport = await exportStore();
    expect(StoreSchema.safeParse(reexport).success).toBe(true);
    // Exact whole-store round trip: what was exported is what comes back.
    expect(JSON.stringify(reexport)).toBe(JSON.stringify(S0));
    expect(await seedVersion()).toBeNull(); // imported content is not a seed product
  });

  it('an import that violates a constraint aborts atomically — no partial write', async () => {
    // Break complementarity on one snapshot: prob_a + prob_b <> 1 must be
    // refused by the CHECK, and the whole import must roll back.
    const broken = JSON.parse(JSON.stringify(S0));
    broken.predictionSnapshots[0].probA = 0.5;
    broken.predictionSnapshots[0].probB = 0.6;
    broken.predictionSnapshots[0].winnerCorner = 'B';
    const res = await rpc('fm_rpc_import_store',
      { p_slug: SLUG, p_store: broken, p_backup_confirmed: true }, { as: USER_MEMBER });
    expect(res.status).not.toBe(200);
    expect(res.body.code).toBe('23514'); // prob_complementary CHECK
    // The prior successful import survives untouched — no partial application.
    expect(JSON.stringify(await exportStore())).toBe(JSON.stringify(S0));
  });

  it('import is owner-only', async () => {
    const editor = await rpc('fm_rpc_import_store',
      { p_slug: SLUG, p_store: S0, p_backup_confirmed: true }, { as: USER_OUTSIDER });
    expect(editor.body.code).toBe('42501');
    const anon = await rpc('fm_rpc_import_store',
      { p_slug: SLUG, p_store: S0, p_backup_confirmed: true });
    expect(anon.status).toBe(401);
  });
});
