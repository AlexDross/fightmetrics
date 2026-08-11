// Stage 7 Gate 2 — RPC cluster 8: workspace (current, seedVersion,
// setSeedVersion, importStore, reset), over real HTTP.
//
// Its own workspace (api-ws): a full aggregate to export, reset and re-import.
// Owner-only mutations, backup-confirmed import/reset, atomic whole-store
// replacement with a no-partial-write proof, and StoreSchema round-trip.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
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
const tableCount = (t) => Number(catalogScalar(
  `SELECT count(*) FROM app_private.${t} WHERE workspace_id='${WS}';`));
// Every Store collection maps to its base table; parlay_legs and the seed_items
// ledger are storage the reset must also clear.
const STORE_TABLES = ['events', 'bouts', 'prediction_runs', 'prediction_snapshots',
  'market_snapshots', 'betting_assessments', 'tracked_positions', 'wagers',
  'props', 'parlays'];
const ALL_SECTIONS = ['events', 'bouts', 'predictionRuns', 'predictionSnapshots',
  'marketSnapshots', 'bettingAssessments', 'trackedPositions', 'wagers',
  'props', 'parlays'];

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

describe('import envelope validation (destructive-bypass fix)', () => {
  let S0;
  // Captured while the workspace is fully populated, BEFORE any reset/import.
  beforeAll(async () => { S0 = await exportStore(); });

  // Each rejected payload must be refused with a stable 23514 marker BEFORE the
  // destructive clear, leaving the exported store EXACTLY unchanged. The first
  // case is the exact bypass Codex reproduced: a meta-only payload that failed
  // StoreSchema but cleared every collection and returned 200.
  const withMeta = (s, meta) => ({ ...s, meta });
  const rejected = {
    'meta-only payload (the reported bypass)': { meta: { schemaVersion: 1, migratedAt: null } },
    'a missing collection': (s) => { const c = { ...s }; delete c.wagers; return c; },
    'an extra top-level key': (s) => ({ ...s, surprise: [] }),
    'a collection of the wrong type': (s) => ({ ...s, props: {} }),
    'meta missing schemaVersion': (s) => ({ ...s, meta: { migratedAt: null } }),
    'meta with an extra key': (s) => ({ ...s, meta: { ...s.meta, extra: 1 } }),
    'a non-object store': [],
    // schemaVersion must be an integer >= 1 within int4 range (MetaSchema).
    'a fractional schemaVersion': (s) => withMeta(s, { ...s.meta, schemaVersion: 1.5 }),
    'a zero schemaVersion': (s) => withMeta(s, { ...s.meta, schemaVersion: 0 }),
    'a negative schemaVersion': (s) => withMeta(s, { ...s.meta, schemaVersion: -1 }),
    'an oversized schemaVersion': (s) => withMeta(s, { ...s.meta, schemaVersion: 2147483648 }),
    'a string schemaVersion': (s) => withMeta(s, { ...s.meta, schemaVersion: 'x' }),
    // migratedAt must be null or an ISO-8601 datetime WITH offset that casts.
    'a malformed migratedAt': (s) => withMeta(s, { ...s.meta, migratedAt: 'not-a-date' }),
    'an impossible migratedAt': (s) => withMeta(s, { ...s.meta, migratedAt: '2026-13-45T00:00:00Z' }),
    'a no-offset migratedAt': (s) => withMeta(s, { ...s.meta, migratedAt: '2026-08-08T05:28:39' }),
  };

  for (const [label, make] of Object.entries(rejected)) {
    it(`rejects ${label} and leaves the store unchanged`, async () => {
      const before = JSON.stringify(await exportStore());
      const payload = typeof make === 'function' ? make(S0) : make;
      const res = await rpc('fm_rpc_import_store',
        { p_slug: SLUG, p_store: payload, p_backup_confirmed: true }, { as: USER_MEMBER });
      expect(res.status, JSON.stringify(res.body)).not.toBe(200);
      expect(res.body.code).toBe('23514');
      expect(res.body.message).toMatch(/invalidStoreEnvelope/);
      // Nothing was cleared: the exported store is byte-for-byte identical.
      expect(JSON.stringify(await exportStore())).toBe(before);
    });
  }
});

describe('export → reset → import: atomicity and round-trip', () => {
  let S0;
  beforeAll(async () => { S0 = await exportStore(); });

  it('the exported store is a valid Stage 6 Store with all ten sections non-empty', () => {
    expect(StoreSchema.safeParse(S0).success).toBe(true);
    for (const k of ALL_SECTIONS) {
      expect(S0[k].length, `${k} empty`).toBeGreaterThan(0);
    }
    // The fixture must exercise wager import specifically.
    expect(S0.wagers.length).toBeGreaterThan(0);
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

  it('reset clears all ten collections, parlay legs, ledger and seed_version', async () => {
    const res = await rpc('fm_rpc_reset_workspace',
      { p_slug: SLUG, p_backup_confirmed: true }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    // Every Store base table is empty…
    for (const t of STORE_TABLES) expect(tableCount(t), `${t} not cleared`).toBe(0);
    // …plus parlay legs and the seed_items ledger (storage the reset must clear).
    expect(tableCount('parlay_legs')).toBe(0);
    expect(tableCount('seed_items')).toBe(0);
    expect(await seedVersion()).toBeNull();
    const c = await current();
    expect(c.slug).toBe(SLUG); // identity preserved
    // …and every export collection reads back empty.
    const empty = await exportStore();
    for (const k of ALL_SECTIONS) expect(empty[k], `${k} not empty`).toEqual([]);
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
    // The wager specifically survived the import round trip.
    expect(reexport.wagers.length).toBe(S0.wagers.length);
    expect(reexport.wagers[0]).toEqual(S0.wagers[0]);
    expect(tableCount('wagers')).toBe(S0.wagers.length);
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

describe('import/reset serialize on the workspace row', () => {
  let S0;
  beforeAll(async () => { S0 = await exportStore(); });

  // Two owners fire destructive replacements at the same workspace with both
  // requests in flight. The FOR UPDATE lock on the workspace row serializes them:
  // one runs its whole clear+insert to COMMIT before the other begins, so neither
  // observes the other's half-applied state. Without the lock the interleaved
  // clear/insert would deadlock or hit duplicate-key / FK errors mid-flight.
  it('two concurrent imports of the same store both succeed and leave it intact', async () => {
    const [a, b] = await Promise.all([
      rpc('fm_rpc_import_store', { p_slug: SLUG, p_store: S0, p_backup_confirmed: true }, { as: USER_MEMBER }),
      rpc('fm_rpc_import_store', { p_slug: SLUG, p_store: S0, p_backup_confirmed: true }, { as: USER_MEMBER }),
    ]);
    expect(a.status, JSON.stringify(a.body)).toBe(200);
    expect(b.status, JSON.stringify(b.body)).toBe(200);
    // Serialized, not interleaved: the final store is exactly S0, StoreSchema-valid.
    const reexport = await exportStore();
    expect(StoreSchema.safeParse(reexport).success).toBe(true);
    expect(JSON.stringify(reexport)).toBe(JSON.stringify(S0));
  });

  it('a concurrent import and reset serialize to one consistent outcome', async () => {
    const [imp, rst] = await Promise.all([
      rpc('fm_rpc_import_store', { p_slug: SLUG, p_store: S0, p_backup_confirmed: true }, { as: USER_MEMBER }),
      rpc('fm_rpc_reset_workspace', { p_slug: SLUG, p_backup_confirmed: true }, { as: USER_MEMBER }),
    ]);
    expect(imp.status, JSON.stringify(imp.body)).toBe(200);
    expect(rst.status, JSON.stringify(rst.body)).toBe(200);
    // Whichever committed last wins wholesale — the store is either exactly S0 or
    // exactly empty, never a mixture; StoreSchema holds either way.
    const reexport = await exportStore();
    expect(StoreSchema.safeParse(reexport).success).toBe(true);
    const isS0 = JSON.stringify(reexport) === JSON.stringify(S0);
    const isEmpty = ALL_SECTIONS.every((k) => reexport[k].length === 0);
    expect(isS0 || isEmpty).toBe(true);
    // Restore S0 so the file leaves the fixture as it found it.
    if (isEmpty) {
      await rpc('fm_rpc_import_store', { p_slug: SLUG, p_store: S0, p_backup_confirmed: true }, { as: USER_MEMBER });
    }
  });
});

// THE DURABLE TIMESTAMP CONTRACT. MetaSchema (via the refined isoDateTime) and
// the SQL envelope gate must accept EXACTLY the same set of timestamps. Two
// mismatches existed: the SQL regex used unrestricted \d{2} time fields, so
// Zod-invalid hour 24 / second 60 passed (PostgreSQL silently normalizes both);
// and z.iso.datetime({offset:true}) alone accepts offsets up to ±23:59 that
// PostgreSQL's timestamptz cannot represent (±15:59 max). Each case below is
// asserted on BOTH sides, so the two can never drift apart again.
describe('MetaSchema and the HTTP import agree on migratedAt (paired conformance)', () => {
  let S0;
  beforeAll(async () => { S0 = await exportStore(); });
  afterAll(async () => {
    await rpc('fm_rpc_import_store', { p_slug: SLUG, p_store: S0, p_backup_confirmed: true }, { as: USER_MEMBER });
  });

  const store = (iso) => ({ ...S0, meta: { ...S0.meta, migratedAt: iso } });
  const accepted = [
    ['minute precision, Z', '2026-08-08T05:28Z'],
    ['minute precision, explicit offset', '2026-08-08T05:28+03:15'],
    ['seconds, Z', '2026-08-08T05:28:39Z'],
    ['fractional seconds', '2026-08-08T05:28:39.900566Z'],
    ['seconds, explicit offset', '2026-08-08T05:28:39+03:15'],
    ['23:59 clock', '2026-08-08T23:59:59.999Z'],
    ['offset +15:59 (PostgreSQL max)', '2026-08-08T05:28+15:59'],
    ['offset -15:59 (PostgreSQL min)', '2026-08-08T05:28-15:59'],
    ['year 0001 (PostgreSQL min)', '0001-01-01T00:00Z'],
    ['year 9999 (PostgreSQL max)', '9999-12-31T23:59:59Z'],
  ];
  const refused = [
    ['hour 24', '2026-08-08T24:00Z'],
    ['second 60', '2026-08-08T23:59:60Z'],
    ['offset +16:00 (beyond timestamptz)', '2026-08-08T05:28+16:00'],
    ['offset +23:59 (beyond timestamptz)', '2026-08-08T05:28+23:59'],
    ['offset -16:00 (beyond timestamptz)', '2026-08-08T05:28-16:00'],
    // PostgreSQL's proleptic Gregorian calendar has no year zero (1 BC -> 1 AD).
    ['year 0000 (no year zero in PostgreSQL)', '0000-01-01T00:00Z'],
    ['impossible calendar date', '2026-13-45T00:00:00Z'],
  ];

  for (const [label, iso] of accepted) {
    it(`both ACCEPT ${label}: ${iso}`, async () => {
      expect(StoreSchema.safeParse(store(iso)).success, 'MetaSchema rejected it').toBe(true);
      const res = await rpc('fm_rpc_import_store',
        { p_slug: SLUG, p_store: store(iso), p_backup_confirmed: true }, { as: USER_MEMBER });
      expect(res.status, JSON.stringify(res.body)).toBe(200);
      // Stored as timestamptz: the same INSTANT, normalized to UTC text.
      const reexport = await exportStore();
      expect(new Date(reexport.meta.migratedAt).getTime()).toBe(new Date(iso).getTime());
      // …and the rest of the store round-trips untouched.
      for (const k of ALL_SECTIONS) {
        expect(JSON.stringify(reexport[k]), `${k} changed`).toBe(JSON.stringify(S0[k]));
      }
    });
  }

  for (const [label, iso] of refused) {
    it(`both REJECT ${label}: ${iso}`, async () => {
      expect(StoreSchema.safeParse(store(iso)).success, 'MetaSchema accepted it').toBe(false);
      const before = JSON.stringify(await exportStore());
      const res = await rpc('fm_rpc_import_store',
        { p_slug: SLUG, p_store: store(iso), p_backup_confirmed: true }, { as: USER_MEMBER });
      expect(res.status, JSON.stringify(res.body)).not.toBe(200);
      expect(res.body.code).toBe('23514');
      expect(res.body.message).toMatch(/invalidStoreEnvelope/);
      // Rejected before the clear: the store is untouched.
      expect(JSON.stringify(await exportStore())).toBe(before);
    });
  }
});
