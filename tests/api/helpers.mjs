// Stage 7 Gate 2 — local API harness helpers.
//
// Every assertion in this suite goes over REAL HTTP to the local PostgREST.
// Direct SQL is used ONLY to build fixtures, never as a substitute for the
// request path under test.
//
// No hosted project and no production credentials: the keys come from
// `supabase status -o json` on the local stack and are the shared dev defaults.
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';

let cachedStatus = null;

/** Local stack coordinates, read once from the CLI. */
export function status() {
  if (cachedStatus) return cachedStatus;
  const raw = execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
    encoding: 'utf8', maxBuffer: 1024 * 1024,
  });
  cachedStatus = JSON.parse(raw);
  return cachedStatus;
}

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/**
 * Mint the same shape of JWT GoTrue issues, signed with the local JWT secret.
 *
 * This is what makes the harness exercise the real authenticated path:
 * PostgREST verifies the signature, switches to the `authenticated` role and
 * publishes the claims as request GUCs — which is exactly where
 * app_private.current_user_id() reads from.
 */
export function authToken(userId) {
  const { JWT_SECRET } = status();
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss: 'supabase-demo',
    role: 'authenticated',
    aud: 'authenticated',
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  const data = `${header}.${payload}`;
  const sig = b64url(createHmac('sha256', JWT_SECRET).update(data).digest());
  return `${data}.${sig}`;
}

/**
 * Call a public RPC over HTTP. `as` is 'anon' or a user id.
 *
 * Returns { status, body } and never throws on a non-2xx: the error SHAPE is
 * part of what these tests assert.
 */
export async function rpc(name, args = {}, { as = 'anon' } = {}) {
  const { REST_URL, ANON_KEY } = status();
  const token = as === 'anon' ? ANON_KEY : authToken(as);
  const res = await fetch(`${REST_URL}/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  let body = null;
  if (text) { try { body = JSON.parse(text); } catch { body = text; } }
  return { status: res.status, body };
}

/** Apply SQL to the local database container. FIXTURES ONLY. */
export function sql(script) {
  return execFileSync(
    'docker',
    ['exec', '-i', 'supabase_db_fightmetrics', 'psql', '-U', 'postgres',
     '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-q', '-f', '-'],
    { input: script, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }
  );
}

export const USER_MEMBER = 'aa000000-0000-4000-8000-000000000001';
export const USER_OUTSIDER = 'aa000000-0000-4000-8000-000000000002';
export const USER_VIEWER  = 'aa000000-0000-4000-8000-000000000003';
export const CLAIMANT_A = 'aa000000-0000-4000-8000-00000000000a';
export const CLAIMANT_B = 'aa000000-0000-4000-8000-00000000000b';

export const WS_PUBLIC = '11110000-0000-4000-8000-000000000001';
export const WS_PRIVATE = '11110000-0000-4000-8000-000000000002';
export const WS_CLAIM = '11110000-0000-4000-8000-000000000003';
// A DEDICATED aggregate for the RPC cluster, with NO wager, so settlement tests
// transition every dependent row and never mutate the shared API fixture.
// Cross-file contamination is impossible because nothing else references it.
export const WS_RPC = '11110000-0000-4000-8000-000000000004';
// Cluster 2's own aggregate. It KEEPS its wager, because a bout-lifecycle write
// must transition every dependent row — the wager is the point.
export const WS_BOUT = '11110000-0000-4000-8000-000000000005';
// Cluster 3's own aggregate, with a wager so grade/return undo has a full
// dependent set to restore.
export const WS_UNDO = '11110000-0000-4000-8000-000000000006';
// Cluster 4's aggregates. WS_DELETE has NO wager, so deleting its root
// physically removes the whole aggregate. WS_DELETE_PIN keeps a wager pinning the
// shared assessment, so its run/assessment/market survive and only the position
// goes — the two halves of the logical-vs-physical delete.
export const WS_DELETE = '11110000-0000-4000-8000-000000000007';
export const WS_DELETE_PIN = '11110000-0000-4000-8000-000000000008';
// Cluster 5's workspace: an event and a pending bout but NO aggregate, so
// fm_rpc_save_prediction_run authors the first one over real HTTP.
export const WS_SAVE = '11110000-0000-4000-8000-000000000009';

const workspace = (id, slug, isPublic) => `
INSERT INTO app_private.workspaces (id, slug, is_public, schema_version, migrated_at)
VALUES ('${id}', '${slug}', ${isPublic}, 1, now())
ON CONFLICT DO NOTHING;`;

// One complete aggregate per workspace, so member reads return real rows and no
// export section is vacuously empty.
const aggregate = (wsId, n, probA, probB, withWager = true) => `
INSERT INTO app_private.events (workspace_id, id, promotion, name, date, created_at)
VALUES ('${wsId}', '${n}ee00000-0000-4000-8000-000000000001', 'UFC',
        'API Card ${n}', '2026-04-0${n}', now())
ON CONFLICT DO NOTHING;
INSERT INTO app_private.bouts (workspace_id, id, event_id,
  corner_a_display_name, corner_a_fighter_key,
  corner_b_display_name, corner_b_fighter_key, division, result_status, created_at)
VALUES ('${wsId}', '${n}bb00000-0000-4000-8000-000000000001',
        '${n}ee00000-0000-4000-8000-000000000001',
        'Api Alpha ${n}', 'api-alpha-${n}', 'Api Beta ${n}', 'api-beta-${n}',
        'Lightweight', 'pending', now())
ON CONFLICT DO NOTHING;
INSERT INTO app_private.prediction_runs (workspace_id, id, bout_id, created_at,
  decision_snapshot_id, target_event_date_at_capture, finish_status,
  provenance_completeness, corner_a_is_prospect_at_capture,
  corner_b_is_prospect_at_capture, includes_prospect_at_capture)
VALUES ('${wsId}', '170000000000${n}-aaaaaa', '${n}bb00000-0000-4000-8000-000000000001',
        now(), '${n}dd00000-0000-4000-8000-000000000001', '2026-04-0${n}', 'absent',
        'full', false, false, false)
ON CONFLICT DO NOTHING;
INSERT INTO app_private.prediction_snapshots (workspace_id, id, run_id, bout_id,
  basis, prob_a, prob_b, winner_corner, captured_at, capture_mode)
VALUES ('${wsId}', '${n}dd00000-0000-4000-8000-000000000001',
        '170000000000${n}-aaaaaa', '${n}bb00000-0000-4000-8000-000000000001',
        'legacy-v1-unversioned', ${probA}, ${probB},
        '${probA >= probB ? 'A' : 'B'}', now(), 'live')
ON CONFLICT DO NOTHING;
INSERT INTO app_private.market_snapshots (workspace_id, id, bout_id, captured_at,
  source, odds_a, odds_b)
VALUES ('${wsId}', '${n}cc00000-0000-4000-8000-000000000001',
        '${n}bb00000-0000-4000-8000-000000000001', now(), 'manual', -150, 130)
ON CONFLICT DO NOTHING;
INSERT INTO app_private.betting_assessments (workspace_id, id, bout_id, run_id,
  prediction_snapshot_id, market_snapshot_id, frozen_at, tier_provenance,
  recommended_corner_provenance)
VALUES ('${wsId}', '${n}ff00000-0000-4000-8000-000000000001',
        '${n}bb00000-0000-4000-8000-000000000001', '170000000000${n}-aaaaaa',
        '${n}dd00000-0000-4000-8000-000000000001',
        '${n}cc00000-0000-4000-8000-000000000001', now(), 'stored', 'stored')
ON CONFLICT DO NOTHING;
INSERT INTO app_private.tracked_positions (workspace_id, id, bout_id, assessment_id,
  market_snapshot_id, origin, corner, stake_units, stake_source, opened_at,
  settlement_status, review_status)
VALUES ('${wsId}', '${n}7700000-0000-4000-8000-000000000001',
        '${n}bb00000-0000-4000-8000-000000000001',
        '${n}ff00000-0000-4000-8000-000000000001',
        '${n}cc00000-0000-4000-8000-000000000001', 'appCreated', 'A', 1,
        'explicit', now(), 'open', 'notRequired')
ON CONFLICT DO NOTHING;
${withWager ? `INSERT INTO app_private.wagers (workspace_id, id, bout_id, assessment_id,
  market_snapshot_id, corner, stake_units, placed_at, settlement_status, notes)
VALUES ('${wsId}', '${n}9900000-0000-4000-8000-000000000001',
        '${n}bb00000-0000-4000-8000-000000000001',
        '${n}ff00000-0000-4000-8000-000000000001',
        '${n}cc00000-0000-4000-8000-000000000001', 'A', 2, now(), 'open', 'api bet')
ON CONFLICT DO NOTHING;` : '-- no wager: this aggregate is for settlement tests'}
INSERT INTO app_private.props (workspace_id, id, event_id, target_kind,
  target_bout_id, target_corner, method, prop_type, label, odds, stake_units,
  result, pick_source, created_at)
VALUES ('${wsId}', '170000000010${n}-cccccc', '${n}ee00000-0000-4000-8000-000000000001',
        'bout', '${n}bb00000-0000-4000-8000-000000000001', 'A', 'KO/TKO',
        'method', 'Api Alpha by KO', 300, 1, 'PENDING', 'model', now())
ON CONFLICT DO NOTHING;
INSERT INTO app_private.parlays (workspace_id, id, event_id, combined_odds,
  stake_units, pick_source, created_at)
VALUES ('${wsId}', '170000000020${n}-bbbbbb', '${n}ee00000-0000-4000-8000-000000000001',
        250, 1, 'human', now())
ON CONFLICT DO NOTHING;
INSERT INTO app_private.parlay_legs (workspace_id, parlay_id, leg_index, bout_id,
  picked_corner, overridden)
VALUES ('${wsId}', '170000000020${n}-bbbbbb', 0,
        '${n}bb00000-0000-4000-8000-000000000001', 'A', false)
ON CONFLICT DO NOTHING;`;

// Just an event and a pending bout — no aggregate. Cluster 5's save RPC creates
// the aggregate against this bout.
const eventAndBout = (wsId, n) => `
INSERT INTO app_private.events (workspace_id, id, promotion, name, date, created_at)
VALUES ('${wsId}', '${n}ee00000-0000-4000-8000-000000000001', 'UFC',
        'API Card ${n}', '2026-04-0${n}', now())
ON CONFLICT DO NOTHING;
INSERT INTO app_private.bouts (workspace_id, id, event_id,
  corner_a_display_name, corner_a_fighter_key,
  corner_b_display_name, corner_b_fighter_key, division, result_status, created_at)
VALUES ('${wsId}', '${n}bb00000-0000-4000-8000-000000000001',
        '${n}ee00000-0000-4000-8000-000000000001',
        'Api Alpha ${n}', 'api-alpha-${n}', 'Api Beta ${n}', 'api-beta-${n}',
        'Lightweight', 'pending', now())
ON CONFLICT DO NOTHING;`;

const IDS = `'${WS_PUBLIC}','${WS_PRIVATE}','${WS_CLAIM}','${WS_RPC}','${WS_BOUT}','${WS_UNDO}','${WS_DELETE}','${WS_DELETE_PIN}','${WS_SAVE}'`;

/**
 * Deterministic fixture, applied to a CLEAN database.
 *
 * `npm run test:api` runs `db:reset` first, so every run starts from the
 * migration alone and these rows are known to match the current schema. The
 * `ON CONFLICT DO NOTHING` clauses are defensive only — they are NOT the
 * isolation mechanism and must not be relied on as one.
 *
 * postgres holds no app_private privilege, so this takes the same
 * transaction-local membership the pgTAP suites use — and REVOKEs it before
 * COMMIT, so the catalog contract still holds afterwards. The suite asserts that.
 *
 * probA/probB are generated in JavaScript by the caller.
 */
export function applyFixture({ probA, probB }) {
  sql(`
BEGIN;
GRANT fm_table_owner TO postgres WITH SET TRUE, INHERIT FALSE;
SET LOCAL ROLE fm_table_owner;
-- Insert-side cycle checks CAN be deferred; ON DELETE RESTRICT cannot.
-- Only the cyclic pair is deferrable now; the assessment FKs are ordinary
-- immediate RESTRICT and naming them here raises "is not deferrable".
SET CONSTRAINTS app_private.run_decision_snapshot_fk,
                app_private.prediction_snapshots_run_fk DEFERRED;

RESET ROLE;
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
                        created_at, updated_at)
VALUES ('${USER_MEMBER}', '00000000-0000-0000-0000-000000000000', 'authenticated',
        'authenticated', 'member@example.test', '', now(), now()),
       ('${USER_OUTSIDER}', '00000000-0000-0000-0000-000000000000', 'authenticated',
        'authenticated', 'outsider@example.test', '', now(), now()),
       ('${CLAIMANT_A}', '00000000-0000-0000-0000-000000000000', 'authenticated',
        'authenticated', 'claim-a@example.test', '', now(), now()),
       ('${CLAIMANT_B}', '00000000-0000-0000-0000-000000000000', 'authenticated',
        'authenticated', 'claim-b@example.test', '', now(), now()),
       ('${USER_VIEWER}', '00000000-0000-0000-0000-000000000000', 'authenticated',
        'authenticated', 'viewer@example.test', '', now(), now())
ON CONFLICT (id) DO NOTHING;
SET LOCAL ROLE fm_table_owner;

${workspace(WS_PUBLIC, 'api-public', true)}
${workspace(WS_PRIVATE, 'api-private', false)}
${workspace(WS_CLAIM, 'api-claim', true)}
${workspace(WS_RPC, 'api-rpc', false)}
${workspace(WS_BOUT, 'api-bout', false)}
${workspace(WS_UNDO, 'api-undo', false)}
${workspace(WS_DELETE, 'api-delete', false)}
${workspace(WS_DELETE_PIN, 'api-delete-pin', false)}
${workspace(WS_SAVE, 'api-save', false)}

INSERT INTO app_private.workspace_members (workspace_id, user_id, role)
VALUES ('${WS_PUBLIC}', '${USER_MEMBER}', 'owner'),
       ('${WS_PRIVATE}', '${USER_MEMBER}', 'owner')
ON CONFLICT DO NOTHING;
-- A VIEWER, so authorization tests have a real read-only member rather than
-- only proving the non-member case.
INSERT INTO app_private.workspace_members (workspace_id, user_id, role)
VALUES ('${WS_PRIVATE}', '${USER_VIEWER}', 'viewer'),
       ('${WS_RPC}', '${USER_MEMBER}', 'owner'),
       ('${WS_RPC}', '${USER_VIEWER}', 'viewer'),
       ('${WS_BOUT}', '${USER_MEMBER}', 'owner'),
       ('${WS_BOUT}', '${USER_VIEWER}', 'viewer'),
       ('${WS_UNDO}', '${USER_MEMBER}', 'owner'),
       ('${WS_UNDO}', '${USER_VIEWER}', 'viewer'),
       ('${WS_UNDO}', '${USER_OUTSIDER}', 'editor'),
       ('${WS_DELETE}', '${USER_MEMBER}', 'owner'),
       ('${WS_DELETE}', '${USER_OUTSIDER}', 'editor'),
       ('${WS_DELETE}', '${USER_VIEWER}', 'viewer'),
       ('${WS_DELETE_PIN}', '${USER_MEMBER}', 'owner'),
       ('${WS_DELETE_PIN}', '${USER_VIEWER}', 'viewer'),
       ('${WS_SAVE}', '${USER_MEMBER}', 'owner'),
       ('${WS_SAVE}', '${USER_OUTSIDER}', 'editor'),
       ('${WS_SAVE}', '${USER_VIEWER}', 'viewer')
ON CONFLICT DO NOTHING;
-- api-claim is deliberately left with ZERO owners for the concurrency test.

${aggregate(WS_PUBLIC, 2, probA, probB)}
${aggregate(WS_PRIVATE, 3, 0.5, 0.5)}
${aggregate(WS_RPC, 4, 0.5, 0.5, false)}
${aggregate(WS_BOUT, 5, 0.5, 0.5)}
${aggregate(WS_UNDO, 6, 0.5, 0.5)}
${aggregate(WS_DELETE, 7, 0.5, 0.5, false)}
${aggregate(WS_DELETE_PIN, 8, 0.5, 0.5)}
${eventAndBout(WS_SAVE, 9)}

-- The RPC cluster's own position starts review-pending. confirmed_at is NULLed
-- explicitly: leaving it populated violates tracked_positions_review_union, and
-- doing this on the SHARED position is exactly how the two files contaminated
-- each other.
UPDATE app_private.tracked_positions
   SET review_status = 'pending', review_reason = 'autoGenerated',
       confirmed_at = NULL
 WHERE workspace_id = '${WS_RPC}';

RESET ROLE;
REVOKE fm_table_owner FROM postgres;
COMMIT;
`);
}

/** Reset only the claim workspace, so the concurrency test starts owner-less. */
export function resetClaimWorkspace() {
  sql(`
BEGIN;
GRANT fm_table_owner TO postgres WITH SET TRUE, INHERIT FALSE;
SET LOCAL ROLE fm_table_owner;
DELETE FROM app_private.workspace_members WHERE workspace_id = '${WS_CLAIM}';
RESET ROLE;
REVOKE fm_table_owner FROM postgres;
COMMIT;
`);
}

/**
 * Catalog-only scalar. Runs as plain `postgres` and grants NOTHING, so it can
 * measure the membership contract without contaminating it — `scalar()` below
 * takes an fm_table_owner membership and would report its own grant.
 */
export function catalogScalar(query) {
  return sql(`\\pset tuples_only on
\\pset format unaligned
${query}`).trim().split('\n').filter(Boolean)[0];
}

/** Read a value back through SQL — used only to CROSS-CHECK an HTTP result. */
export function scalar(query) {
  return sql(`
BEGIN;
GRANT fm_table_owner TO postgres WITH SET TRUE, INHERIT FALSE;
SET LOCAL ROLE fm_table_owner;
\\pset tuples_only on
\\pset format unaligned
${query}
RESET ROLE;
REVOKE fm_table_owner FROM postgres;
COMMIT;
`).trim().split('\n').filter((l) => l && !/^(BEGIN|COMMIT|GRANT|REVOKE|SET|RESET)/.test(l))[0];
}
