// Stage 7 Gate 3 — fm_rpc_seed_store and the seed ledger, over real HTTP.
//
// Two EMPTY workspaces (api-seed, api-seed-b): the fixture creates the workspace
// row and its memberships and nothing else, so every row these tests observe was
// authored by the seed RPC itself and cannot be confused with fixture SQL.
//
// The payload is the REAL migrated harness corpus (see seedCorpus.mjs), not a
// fixture: it is `migrateV0ToV1` run over the currently bundled ROI, upcoming
// and prop data. What these tests prove is seed fidelity FOR THAT CORPUS — real
// migration output, real HTTP, real settlement — rather than a hand-built shape
// chosen to be easy to seed.
//
// It is NOT the exact corpus production will hold. The harness deliberately
// passes `parlayEntries: []` (see seedCorpus.mjs), while the production data
// carries parlays. Gate 5 must rebuild and reconcile the complete latest
// migration input, parlays included, before it seeds anything hosted; this suite
// does not stand in for that step.
//
// Corpus SIZE is mutable — bundled data grows every time a card is added or
// graded — so no cardinality is written down in this file. Every count is derived
// at run time from CORPUS, ROOT_COUNT, COMPUTED_PROFIT_ROWS and their siblings,
// and cross-checked against what Postgres actually stored. A literal here would
// silently become a lie the next time the seed data moves.
//
// The file is deliberately ORDER-DEPENDENT: seed -> determinism -> profit
// recomputation -> idempotency -> tombstones. Each block builds on the state the
// previous one left, exactly as a real seeding history would.
import { describe, it, expect, beforeAll } from 'vitest';
import {
  rpc, applyFixture, catalogScalar, scalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER, CLAIMANT_A,
  WS_SEED, WS_SEED_B,
} from './helpers.mjs';
import {
  SEED_STORE, ROOT_COUNT, CORPUS, COMPUTED_PROFIT_ROWS, UNCOMPUTABLE_ROWS,
  OPEN_ROWS, GRADED_RUN_IDS, PENDING_RUN_IDS,
} from './seedCorpus.mjs';

const SLUG = 'api-seed';
const SLUG_B = 'api-seed-b';

const SEED_V1 = 'seed-2026-07-28-a';
const SEED_V2 = 'seed-2026-07-28-b';
const SEED_V3 = 'seed-2026-07-28-c';

// Every Store collection maps to one base table; parlay_legs is nested storage.
const TABLES = {
  events: 'events', bouts: 'bouts', predictionRuns: 'prediction_runs',
  predictionSnapshots: 'prediction_snapshots', marketSnapshots: 'market_snapshots',
  bettingAssessments: 'betting_assessments', trackedPositions: 'tracked_positions',
  wagers: 'wagers', props: 'props', parlays: 'parlays', parlayLegs: 'parlay_legs',
};

beforeAll(() => { applyFixture(); }, 120_000);

const workspaceRow = async (slug, as = USER_MEMBER) =>
  ((await rpc('fm_member_workspace', { p_slug: slug }, { as })).body ?? [])[0];

const revisionOf = async (slug) => (await workspaceRow(slug)).revision;

/** Call the seed RPC, reading the current workspace revision unless one is given. */
const seed = async (slug, version, opts = {}) => {
  const { as = USER_MEMBER, store = SEED_STORE, revision } = opts;
  return rpc('fm_rpc_seed_store', {
    p_slug: slug, p_store: store, p_seed_version: version,
    p_expected_revision: revision ?? await revisionOf(slug),
  }, { as });
};

const count = (ws, table) => Number(catalogScalar(
  `SELECT count(*) FROM app_private.${table} WHERE workspace_id='${ws}';`));

const allCounts = (ws) => Object.fromEntries(
  Object.entries(TABLES).map(([k, t]) => [k, count(ws, t)]));

const ZERO_COUNTS = Object.fromEntries(Object.keys(TABLES).map((k) => [k, 0]));

const ledger = (ws) => {
  const raw = catalogScalar(`
    SELECT count(*) FILTER (WHERE removed_at IS NULL) || ' ' ||
           count(*) FILTER (WHERE removed_at IS NOT NULL)
      FROM app_private.seed_items WHERE workspace_id='${ws}';`).split(' ');
  return { live: Number(raw[0]), tombstoned: Number(raw[1]) };
};

/**
 * A content digest over EVERY column of EVERY entity table in a workspace.
 *
 * `workspace_id`, `revision` and `row_updated_at` are excluded: they are
 * workspace STORAGE, not Store content, and two workspaces seeded independently
 * legitimately differ in `row_updated_at`. Everything else — including the
 * normalized settlement, review and finish unions — is inside the digest.
 */
const digest = (ws) => catalogScalar(`
  SELECT md5(string_agg(d, E'\\n' ORDER BY d)) FROM (
    ${Object.values(TABLES).map((t) => `
    SELECT '${t} ' || (to_jsonb(x) - 'workspace_id' - 'revision' - 'row_updated_at')::text AS d
      FROM app_private.${t} x WHERE x.workspace_id='${ws}'`).join('\n    UNION ALL')}
  ) s;`);

describe('authorization, revision and envelope gates', () => {
  it('anon cannot reach the seed RPC at all', async () => {
    const res = await rpc('fm_rpc_seed_store', {
      p_slug: SLUG, p_store: SEED_STORE, p_seed_version: SEED_V1,
      p_expected_revision: '1',
    });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('42501');
    expect(allCounts(WS_SEED)).toEqual(ZERO_COUNTS);
  });

  it('seeding is owner-only: an editor and a viewer are both refused', async () => {
    const rev = await revisionOf(SLUG);
    for (const as of [USER_OUTSIDER, USER_VIEWER, CLAIMANT_A]) {
      const res = await seed(SLUG, SEED_V1, { as, revision: rev });
      expect(res.body.code, `as ${as}`).toBe('42501');
    }
    expect(allCounts(WS_SEED)).toEqual(ZERO_COUNTS);
  });

  it('a stale workspace revision is refused before anything is written', async () => {
    const res = await seed(SLUG, SEED_V1, { revision: '999' });
    expect(res.body.code).toBe('P0001');
    expect(res.body.message).toMatch(/\bstale_write\b/);
    expect(allCounts(WS_SEED)).toEqual(ZERO_COUNTS);
  });

  it('an empty seed version is refused: the ledger stamp must be real', async () => {
    for (const v of ['', null]) {
      const res = await seed(SLUG, v);
      expect(res.body.code, JSON.stringify(res.body)).toBe('23514');
      expect(res.body.message).toMatch(/seedVersion/);
    }
    expect(allCounts(WS_SEED)).toEqual(ZERO_COUNTS);
  });

  it('the SAME envelope gate import uses rejects a malformed store', async () => {
    const cases = [
      ['meta only', { meta: SEED_STORE.meta }],
      ['a missing collection', { ...SEED_STORE, wagers: undefined }],
      ['an extra top-level key', { ...SEED_STORE, extra: [] }],
      ['a collection that is not an array', { ...SEED_STORE, props: {} }],
      ['a fractional schemaVersion', { ...SEED_STORE, meta: { ...SEED_STORE.meta, schemaVersion: 1.5 } }],
      ['a migratedAt without an offset', { ...SEED_STORE, meta: { ...SEED_STORE.meta, migratedAt: '2026-07-28T00:00:00' } }],
    ];
    for (const [label, store] of cases) {
      const res = await seed(SLUG, SEED_V1, { store });
      expect(res.body.code, `${label}: ${JSON.stringify(res.body)}`).toBe('23514');
      expect(res.body.message, label).toMatch(/invalidStoreEnvelope/);
    }
    expect(allCounts(WS_SEED)).toEqual(ZERO_COUNTS);
  });

  it('an unknown future schema version is refused', async () => {
    const res = await seed(SLUG, SEED_V1, {
      store: { ...SEED_STORE, meta: { ...SEED_STORE.meta, schemaVersion: 99 } } });
    expect(res.body.code).toBe('23514');
    expect(res.body.message).toMatch(/unknownFutureVersion/);
    expect(allCounts(WS_SEED)).toEqual(ZERO_COUNTS);
  });
});

describe('the initial seed', () => {
  it('loads the whole migrated corpus in one transaction', async () => {
    const res = await seed(SLUG, SEED_V1);
    expect(res.status, JSON.stringify(res.body).slice(0, 400)).toBe(200);
    const out = res.body[0];
    expect(out.seed_version).toBe(SEED_V1);
    // ROOT_COUNT is derived: one root per prediction run, prop and parlay.
    expect(out.roots_seeded).toBe(ROOT_COUNT);
    expect(out.roots_skipped_live).toBe(0);
    expect(out.roots_skipped_tombstoned).toBe(0);
    expect(out.rows_inserted).toEqual(CORPUS);
    expect(allCounts(WS_SEED)).toEqual(CORPUS);
  });

  it('writes one live ledger row per root, stamped with the seed version', () => {
    expect(ledger(WS_SEED)).toEqual({ live: ROOT_COUNT, tombstoned: 0 });
    expect(catalogScalar(`
      SELECT count(*) FROM app_private.seed_items
       WHERE workspace_id='${WS_SEED}' AND first_seed_version='${SEED_V1}';`))
      .toBe(String(ROOT_COUNT));
    // Root types are exactly the three the ledger recognises, in the derived split.
    expect(catalogScalar(`
      SELECT string_agg(root_type || '=' || n, ',' ORDER BY root_type) FROM (
        SELECT root_type, count(*) AS n FROM app_private.seed_items
         WHERE workspace_id='${WS_SEED}' GROUP BY root_type) s;`))
      .toBe(`predictionRun=${SEED_STORE.predictionRuns.length},prop=${SEED_STORE.props.length}`);
  });

  it('a virgin workspace adopts the store meta; seed_version is recorded', async () => {
    const w = await workspaceRow(SLUG);
    expect(w.seed_version).toBe(SEED_V1);
    expect(w.schema_version).toBe(SEED_STORE.meta.schemaVersion);
    expect(new Date(w.migrated_at).getTime())
      .toBe(new Date(SEED_STORE.meta.migratedAt).getTime());
  });

  it('the seeded corpus is readable through the member surfaces', async () => {
    // This is also the regression guard for the seed's ANALYZE. Without planner
    // statistics BOTH of these returned HTTP 500 / 57014 "canceling statement
    // due to statement timeout" on the freshly seeded corpus — a 200 here is
    // load-bearing, not incidental.
    const roi = await rpc('fm_member_roi', { p_slug: SLUG }, { as: USER_MEMBER });
    const upcoming = await rpc('fm_member_upcoming', { p_slug: SLUG }, { as: USER_MEMBER });
    expect(roi.status, JSON.stringify(roi.body)).toBe(200);
    expect(upcoming.status, JSON.stringify(upcoming.body)).toBe(200);
    expect(roi.body.length).toBe(COMPUTED_PROFIT_ROWS.length + UNCOMPUTABLE_ROWS.length);
    expect(upcoming.body.length).toBe(OPEN_ROWS.length);
    const events = (await rpc('fm_member_events', { p_slug: SLUG }, { as: USER_MEMBER })).body;
    expect(events.length).toBe(CORPUS.events);
  });
});

describe('seeding is deterministic', () => {
  it('the same store seeded into an independent workspace is byte-identical', async () => {
    const res = await seed(SLUG_B, SEED_V1);
    expect(res.status, JSON.stringify(res.body).slice(0, 400)).toBe(200);
    expect(res.body[0].roots_seeded).toBe(ROOT_COUNT);
    expect(allCounts(WS_SEED_B)).toEqual(CORPUS);
    // Stage 6 ids are derived, so the two workspaces must agree on every column
    // of every row — not merely on row counts.
    expect(digest(WS_SEED_B)).toBe(digest(WS_SEED));
  });

  it('every persisted double is bit-identical across the two workspaces', () => {
    // The digest above goes through jsonb; this compares the RAW IEEE-754 bytes,
    // so a one-ULP divergence cannot hide behind a shared text rendering.
    const drift = (table, cols) => catalogScalar(`
      SELECT count(*) FROM app_private.${table} a
        JOIN app_private.${table} b ON b.id = a.id AND b.workspace_id='${WS_SEED_B}'
       WHERE a.workspace_id='${WS_SEED}' AND (${cols.map((c) =>
        `encode(pg_catalog.float8send(a.${c}),'hex') IS DISTINCT FROM ` +
        `encode(pg_catalog.float8send(b.${c}),'hex')`).join(' OR ')});`);
    expect(drift('prediction_snapshots', ['prob_a', 'prob_b'])).toBe('0');
    expect(drift('tracked_positions', ['profit_units'])).toBe('0');
    expect(drift('betting_assessments',
      ['edge_a', 'edge_b', 'ev_a', 'ev_b', 'kelly_a', 'kelly_b'])).toBe('0');
  });
});

describe('every stored computed-profit row recomputes exactly in PostgreSQL', () => {
  // The recomputation runs through app_private.settlement_for — the SAME
  // function grading uses in production — not a reimplementation written to
  // agree with the stored value.
  const recomputation = () => scalar(`
    SELECT total || ' ' || mismatches || ' ' || bit_mismatches || ' '
        || max_dev || ' ' || union_mismatches
      FROM (
        SELECT count(*) AS total,
               count(*) FILTER (WHERE t.profit_units IS DISTINCT FROM s.profit_units) AS mismatches,
               count(*) FILTER (WHERE encode(pg_catalog.float8send(t.profit_units),'hex')
                                   IS DISTINCT FROM
                                      encode(pg_catalog.float8send(s.profit_units),'hex')) AS bit_mismatches,
               coalesce(max(abs(t.profit_units - s.profit_units)), 0) AS max_dev,
               count(*) FILTER (WHERE t.settlement_status IS DISTINCT FROM s.settlement_status
                                   OR t.settlement_outcome IS DISTINCT FROM s.settlement_outcome
                                   OR t.financial_status  IS DISTINCT FROM s.financial_status) AS union_mismatches
          FROM app_private.tracked_positions t
          CROSS JOIN LATERAL app_private.settlement_for(
            t.workspace_id, t.bout_id, t.corner, t.market_snapshot_id, t.stake_units) s
         WHERE t.workspace_id='${WS_SEED}' AND t.financial_status='computed'
      ) q;`);

  it('the derived computed-row count is what Postgres actually stored', () => {
    // The expectation is the corpus itself, not a transcribed number: the point
    // of the assertion is that JavaScript and Postgres agree on the cardinality,
    // whatever the current bundled data happens to make it.
    expect(COMPUTED_PROFIT_ROWS.length).toBeGreaterThan(0);
    expect(catalogScalar(`
      SELECT count(*) FROM app_private.tracked_positions
       WHERE workspace_id='${WS_SEED}' AND financial_status='computed';`))
      .toBe(String(COMPUTED_PROFIT_ROWS.length));
  });

  it('every one agrees with Postgres EXACTLY — zero deviation, zero ULPs', () => {
    const [total, mismatches, bitMismatches, maxDev, unionMismatches] =
      recomputation().split(' ');
    // Recompute the WHOLE stored set, never a subset: if the corpus grew and the
    // recomputation silently covered fewer rows, the four zeros below would be
    // vacuous. This is the guard that keeps them meaningful.
    expect(Number(total)).toBe(COMPUTED_PROFIT_ROWS.length);
    expect(mismatches).toBe('0');
    expect(bitMismatches).toBe('0');
    expect(Number(maxDev)).toBe(0);
    expect(unionMismatches).toBe('0');
  });

  it('the comparison is not vacuous: it resolves a ONE-ULP difference', () => {
    // Without this the block above would pass just as happily against a
    // comparison that never fires. Two things are shown: that float8 equality
    // separates adjacent doubles at all, and that the corpus actually contains
    // values living on that boundary.
    expect(catalogScalar(
      `SELECT ('0.6666666666666665'::float8 = '0.6666666666666666'::float8)::int;`))
      .toBe('0');

    // The documented trap: the production expression is
    // stake * ((1 + 100/|odds|) - 1), and for 1u at -150 that is
    // 0.6666666666666665 — NOT the 0.6666666666666666 that 100/150 displays as.
    // The subtraction after the addition loses the last bit. Recomputing the
    // seeded corpus with the naive form therefore DISAGREES on real stored rows,
    // which is exactly the sensitivity the whole-corpus agreement above claims.
    const naiveMismatches = Number(catalogScalar(`
      SELECT count(*) FROM app_private.tracked_positions t
        JOIN app_private.market_snapshots m
          ON m.workspace_id = t.workspace_id AND m.id = t.market_snapshot_id
       WHERE t.workspace_id='${WS_SEED}' AND t.financial_status='computed'
         AND t.settlement_outcome='won'
         AND (CASE WHEN t.corner='A' THEN m.odds_a ELSE m.odds_b END) < 0
         AND t.profit_units IS DISTINCT FROM t.stake_units::double precision
             * (100.0 / abs(CASE WHEN t.corner='A' THEN m.odds_a ELSE m.odds_b END));`));
    expect(naiveMismatches).toBeGreaterThan(0);
  });

  it('the settled-but-unpriced row is uncomputable, not silently zero', () => {
    expect(catalogScalar(`
      SELECT count(*) FROM app_private.tracked_positions
       WHERE workspace_id='${WS_SEED}' AND settlement_status='settled'
         AND financial_status='uncomputable' AND profit_units IS NULL;`))
      .toBe(String(UNCOMPUTABLE_ROWS.length));
  });
});

describe('seeding is idempotent', () => {
  it('re-applying the SAME version inserts nothing and changes nothing', async () => {
    const before = digest(WS_SEED);
    const res = await seed(SLUG, SEED_V1);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].roots_seeded).toBe(0);
    expect(res.body[0].roots_skipped_live).toBe(ROOT_COUNT);
    expect(res.body[0].roots_skipped_tombstoned).toBe(0);
    expect(res.body[0].rows_inserted).toEqual(ZERO_COUNTS);
    expect(allCounts(WS_SEED)).toEqual(CORPUS);
    expect(digest(WS_SEED)).toBe(before);
  });

  it('advancing the version re-seeds nothing and keeps the original stamps', async () => {
    const before = digest(WS_SEED);
    const res = await seed(SLUG, SEED_V2);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].roots_seeded).toBe(0);
    expect(res.body[0].roots_skipped_live).toBe(ROOT_COUNT);
    expect(res.body[0].rows_inserted).toEqual(ZERO_COUNTS);
    expect(digest(WS_SEED)).toBe(before);
    // seed_version advances — first_seed_version does NOT: it records the
    // version that INTRODUCED each root, which is history, not current state.
    expect((await workspaceRow(SLUG)).seed_version).toBe(SEED_V2);
    expect(catalogScalar(`
      SELECT count(*) FROM app_private.seed_items
       WHERE workspace_id='${WS_SEED}' AND first_seed_version='${SEED_V1}';`))
      .toBe(String(ROOT_COUNT));
  });

  it('a later seed never overwrites an edited seeded record', async () => {
    const event = (await rpc('fm_member_events', { p_slug: SLUG }, { as: USER_MEMBER }))
      .body.sort((a, b) => a.id.localeCompare(b.id))[0];
    const renamed = await rpc('fm_rpc_rename_event', {
      p_slug: SLUG, p_event_id: event.id, p_patch: { name: 'Renamed By The User' },
      p_expected_revision: event.revision }, { as: USER_MEMBER });
    expect(renamed.status, JSON.stringify(renamed.body)).toBe(200);

    const res = await seed(SLUG, SEED_V3);
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].rows_inserted.events).toBe(0);
    // Correcting a seeded record goes through import, never a silent seed
    // overwrite — so the user's rename survives the re-seed intact.
    expect(catalogScalar(`
      SELECT name FROM app_private.events
       WHERE workspace_id='${WS_SEED}' AND id='${event.id}';`))
      .toBe('Renamed By The User');
  });
});

describe('tombstoned roots are never resurrected', () => {
  const tombstonedCount = () => ledger(WS_SEED).tombstoned;

  it('deleting a pending run root tombstones it and removes its aggregate', async () => {
    const row = (await rpc('fm_member_upcoming', { p_slug: SLUG }, { as: USER_MEMBER }))
      .body.sort((a, b) => a.tracked_position_id.localeCompare(b.tracked_position_id))[0];
    const runId = catalogScalar(`
      SELECT a.run_id FROM app_private.betting_assessments a
        JOIN app_private.tracked_positions t
          ON t.workspace_id=a.workspace_id AND t.assessment_id=a.id
       WHERE t.workspace_id='${WS_SEED}' AND t.id='${row.tracked_position_id}';`);
    const res = await rpc('fm_rpc_delete_pending_run', {
      p_slug: SLUG, p_run_id: runId, p_expected_revision: row.revision },
      { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].physically_removed).toBe(true);
    expect(catalogScalar(`
      SELECT removed_at IS NOT NULL FROM app_private.seed_items
       WHERE workspace_id='${WS_SEED}' AND root_type='predictionRun'
         AND root_id='${runId}';`)).toBe('t');
    expect(count(WS_SEED, 'prediction_runs')).toBe(CORPUS.predictionRuns - 1);
  });

  it('clearing ROI tombstones every graded root', async () => {
    const vector = ((await rpc('fm_member_roi', { p_slug: SLUG }, { as: USER_MEMBER })).body ?? [])
      .map((r) => ({ id: r.tracked_position_id, revision: r.revision }));
    expect(vector.length).toBe(GRADED_RUN_IDS.length);
    const res = await rpc('fm_rpc_clear_graded',
      { p_slug: SLUG, p_revisions: vector }, { as: USER_MEMBER });
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    expect(res.body[0].removed).toBe(GRADED_RUN_IDS.length);
    expect(res.body[0].roots_tombstoned).toBe(GRADED_RUN_IDS.length);
    // No wager pins any assessment in the migrated corpus, so every graded
    // aggregate is a proven orphan and goes physically as well as logically.
    expect(res.body[0].physically_removed).toBe(GRADED_RUN_IDS.length);
    expect(tombstonedCount()).toBe(GRADED_RUN_IDS.length + 1);
  });

  it('ADVANCING the seed version brings nothing back', async () => {
    const survivingRuns = PENDING_RUN_IDS.length - 1;
    const before = allCounts(WS_SEED);
    expect(before.predictionRuns).toBe(survivingRuns);
    expect(before.trackedPositions).toBe(survivingRuns);

    const res = await seed(SLUG, 'seed-2026-07-28-d');
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const out = res.body[0];
    expect(out.roots_seeded).toBe(0);
    expect(out.roots_skipped_tombstoned).toBe(GRADED_RUN_IDS.length + 1);
    expect(out.roots_skipped_live).toBe(ROOT_COUNT - GRADED_RUN_IDS.length - 1);
    // Not one row of any kind returns — this is the assertion `ON CONFLICT DO
    // NOTHING` alone could never make true, because the deleted ids no longer
    // conflict with anything.
    expect(out.rows_inserted).toEqual(ZERO_COUNTS);
    expect(allCounts(WS_SEED)).toEqual(before);
  });

  it('the tombstoned roots stay absent from every read surface', async () => {
    expect((await rpc('fm_member_roi', { p_slug: SLUG }, { as: USER_MEMBER })).body)
      .toEqual([]);
    expect((await rpc('fm_member_upcoming', { p_slug: SLUG }, { as: USER_MEMBER })).body.length)
      .toBe(PENDING_RUN_IDS.length - 1);
    expect(catalogScalar(`
      SELECT count(*) FROM app_private.prediction_runs r
        JOIN app_private.seed_items s
          ON s.workspace_id=r.workspace_id AND s.root_type='predictionRun'
         AND s.root_id=r.id
       WHERE r.workspace_id='${WS_SEED}' AND s.removed_at IS NOT NULL;`)).toBe('0');
  });

  it('events and bouts survive: shared card structure is never tombstoned', () => {
    // Every root that referenced these cards is gone, yet the card history
    // remains — the documented §7 exception, and the reason a seed may always
    // re-offer events and bouts without resurrecting anything.
    expect(count(WS_SEED, 'events')).toBe(CORPUS.events);
    expect(count(WS_SEED, 'bouts')).toBe(CORPUS.bouts);
    expect(catalogScalar(`
      SELECT count(*) FROM app_private.seed_items
       WHERE workspace_id='${WS_SEED}'
         AND root_type NOT IN ('predictionRun','prop','parlay');`)).toBe('0');
  });

  it('a workspace that never deleted anything is untouched by all of this', () => {
    // api-seed-b is the control: same store, same version, no deletions. If the
    // tombstone logic were workspace-blind, this would have moved.
    expect(allCounts(WS_SEED_B)).toEqual(CORPUS);
    expect(ledger(WS_SEED_B)).toEqual({ live: ROOT_COUNT, tombstoned: 0 });
  });
});
