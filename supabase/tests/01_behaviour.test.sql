-- Stage 7 Gate 2 — behavioural suite.
--
-- Binds the two verified API failures and every corrected Stage 6 invariant.
-- A catalog assertion alone is insufficient: both auth failures passed every
-- structural check and still made the authenticated API unusable.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
-- Under `supabase test db` pgTAP is installed in `extensions`, not `public`, so
-- the schema is named explicitly. Transaction-local. Note this alone is NOT
-- sufficient — see the USAGE grant below, which is the load-bearing part.
SELECT pg_catalog.set_config('search_path',
  'public, ' || (SELECT n.nspname FROM pg_catalog.pg_extension e
                   JOIN pg_catalog.pg_namespace n ON n.oid = e.extnamespace
                  WHERE e.extname = 'pgtap'), true);
SELECT plan(88);

-- ── Fixture ─────────────────────────────────────────────────────────────────
-- auth.users FIRST, as postgres, before any role change: FK checks against it
-- need no grant, which is itself part of what this suite proves.
INSERT INTO auth.users (id, instance_id, aud, role, email,
                        encrypted_password, created_at, updated_at)
VALUES ('11111111-1111-4111-8111-111111111111',
        '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'claimant@example.com', '', now(), now()),
       ('22222222-2222-4222-8222-222222222222',
        '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'rival@example.com', '', now(), now());

-- ── Transaction-local privileges, taken deliberately by the operator ────────
-- pgTAP lives in `extensions`, and fm_table_owner has no USAGE on that schema.
--
-- THIS is why every assertion after the role switch failed with
-- `function is(text, text, unknown) does not exist`. It is not a search_path
-- problem: a schema on the search_path is still SKIPPED during function lookup
-- when the active role lacks USAGE on it, so the lookup reports "does not
-- exist" rather than "permission denied" and reads like a resolution failure.
-- Direct psql passed only because pgTAP resolved from a different schema there.
--
-- Transaction-local, like the membership below. It is deliberately NOT in the
-- production migration: no fm_ role needs `extensions` at runtime.
GRANT USAGE ON SCHEMA extensions TO fm_table_owner;

-- The working membership itself. postgres holds ADMIN OPTION but neither SET nor
-- INHERIT, so it must deliberately grant itself the capability before it can
-- touch app_private — exercised here rather than side-stepped by a permanent
-- production grant. ROLLBACK removes both this and the USAGE grant above.
GRANT fm_table_owner TO postgres WITH SET TRUE, INHERIT FALSE;
SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;

INSERT INTO app_private.workspaces (id, slug, is_public, schema_version, migrated_at)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001', 'fightmetrics', true, 1, now());

INSERT INTO app_private.events (workspace_id, id, promotion, name, date, created_at)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
        'eeee0000-0000-4000-8000-000000000001', 'UFC', 'Test Card', '2026-03-01', now());

INSERT INTO app_private.bouts (workspace_id, id, event_id,
  corner_a_display_name, corner_a_fighter_key,
  corner_b_display_name, corner_b_fighter_key,
  division, result_status, created_at)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
        'bbbb0000-0000-4000-8000-000000000001',
        'eeee0000-0000-4000-8000-000000000001',
        'Alpha Fighter', 'alpha-fighter', 'Beta Fighter', 'beta-fighter',
        'Lightweight', 'pending', now());

-- ── 1. The caller resolves without any auth-schema access ───────────────────
-- This is the failure: auth.uid() raised `permission denied for schema auth`
-- from every function, so the authenticated API could not be used at all.
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

-- ::text on both sides: pgTAP's polymorphic is() does not resolve for uuid
-- under the search_path pg_prove uses, though it does under a bare psql.
SELECT is(app_private.current_user_id()::text,
          '11111111-1111-4111-8111-111111111111'::text,
          'current_user_id resolves the caller from the request GUC alone');

SELECT lives_ok($$SELECT app_private.current_user_id()$$,
                'resolving the caller touches no auth object');

SET LOCAL request.jwt.claim.sub = '';
SELECT is(app_private.current_user_id()::text, NULL::text,
          'an absent claim yields NULL rather than raising');
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

-- The API roles must hold nothing on auth; only the table owner may read it,
-- and only because RI checks run as the referencing table's owner.
SELECT ok(NOT has_schema_privilege('fm_member_api', 'auth', 'USAGE'),
          'fm_member_api has no USAGE on auth');
SELECT ok(NOT has_schema_privilege('fm_public_reader', 'auth', 'USAGE'),
          'fm_public_reader has no USAGE on auth');
-- Not even the table owner needs auth access: RI checks are executed internally
-- by Postgres and skip ACL checks. The membership insert below proves it.
SELECT ok(NOT has_schema_privilege('fm_table_owner', 'auth', 'USAGE'),
          'fm_table_owner has no USAGE on auth either — no role does');
-- pg_catalog, not information_schema.role_table_grants: that view shows only
-- grants involving roles enabled for the current user and is empty here, so it
-- made this assertion vacuous.
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'auth' AND c.relkind = 'r'
              AND a.grantee <> 0
              AND pg_catalog.pg_get_userbyid(a.grantee) LIKE 'fm\_%'),
          0::bigint, 'no fm_ role holds any privilege on any auth table');
-- No PERMANENT grant exists for the operator. The membership this file takes is
-- transaction-local and disappears with the ROLLBACK.
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND CASE WHEN a.grantee = 0 THEN true
                       ELSE pg_catalog.pg_get_userbyid(a.grantee) NOT LIKE 'fm\_%' END),
          0::bigint, 'no non-fm_ grantee holds a permanent app_private table grant');
-- Write is what this schema controls. Residual READ comes from the platform's
-- pg_read_all_data grant on the operator role, not from anything here.
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND (has_table_privilege('postgres', c.oid, 'INSERT')
                OR has_table_privilege('postgres', c.oid, 'UPDATE')
                OR has_table_privilege('postgres', c.oid, 'DELETE'))),
          0::bigint, 'postgres holds no permanent write on any app_private table');

-- ── 2. The first owner can actually be created ──────────────────────────────
-- This is the second failure: `new row violates row-level security policy for
-- table workspace_members`, because the write policy required an owner to
-- already exist and so no first owner could ever be inserted.
SELECT is((SELECT count(*) FROM app_private.workspace_members), 0::bigint,
          'the workspace starts with zero owners');

-- RPCs are exercised as `authenticated`, the role PostgREST actually uses, not
-- as postgres. Calling them as the operator would prove nothing about the
-- privilege boundary the browser hits.
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SELECT lives_ok(
  $$SELECT public.fm_rpc_claim_workspace_ownership('fightmetrics')$$,
  'the zero-owner claim succeeds for an authenticated caller');

SELECT is((SELECT role FROM public.fm_member_whoami('fightmetrics')),
          'owner', 'whoami reports the resolved membership');

SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;
SELECT is((SELECT role FROM app_private.workspace_members
            WHERE user_id = '11111111-1111-4111-8111-111111111111'),
          'owner', 'the claimant is now the owner');

-- SEQUENTIAL, not concurrent. This proves a LATER claimant is refused once an
-- owner exists. It does NOT prove two overlapping transactions serialize — that
-- needs two sessions and is explicitly outstanding for test:api.
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SELECT throws_ok($$SELECT public.fm_rpc_claim_workspace_ownership('fightmetrics')$$,
                 '42501', NULL, 'a later claimant is refused once an owner exists');
SELECT is((SELECT role FROM public.fm_member_whoami('fightmetrics')), NULL,
          'the refused claimant resolves to no membership');

-- An unknown slug stays distinguishable from a claimed one.
SELECT throws_ok($$SELECT public.fm_rpc_claim_workspace_ownership('nope')$$,
                 '42704', NULL, 'an unknown slug raises 42704, not 42501');

SET LOCAL request.jwt.claim.sub = '';
SELECT throws_ok($$SELECT public.fm_rpc_claim_workspace_ownership('fightmetrics')$$,
                 '42501', NULL, 'an unauthenticated claim is refused');
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

-- anon must not reach the mutation at all.
SET LOCAL ROLE anon;
SET LOCAL search_path = public, extensions;
SELECT throws_ok($$SELECT public.fm_rpc_claim_workspace_ownership('fightmetrics')$$,
                 '42501', NULL, 'anon cannot execute the claim RPC');

SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;
SELECT is((SELECT count(*) FROM app_private.workspace_members WHERE role = 'owner'),
          1::bigint, 'still exactly one owner after every refused claim');

-- ── 3. Corrected Stage 6 invariants — positive and negative each ────────────

-- bouts: distinct corners (Stage 6 BOUT_SAME_CORNERS, which compares displayName)
SELECT throws_ok($$
  INSERT INTO app_private.bouts (workspace_id, id, event_id,
    corner_a_display_name, corner_a_fighter_key,
    corner_b_display_name, corner_b_fighter_key, division, result_status, created_at)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'bbbb0000-0000-4000-8000-0000000000ff',
          'eeee0000-0000-4000-8000-000000000001',
          'Same Guy', 'same-guy', 'Same Guy', 'same-guy-2', 'LW', 'pending', now())$$,
  '23514', NULL, 'a bout naming the same fighter in both corners is rejected');

-- market_snapshots: at least one priced corner
SELECT lives_ok($$
  INSERT INTO app_private.market_snapshots (workspace_id, id, bout_id, captured_at, source, odds_a, odds_b)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'cccc0000-0000-4000-8000-000000000001',
          'bbbb0000-0000-4000-8000-000000000001', now(), 'manual', -150, NULL)$$,
  'a market snapshot with one priced corner is accepted');

SELECT throws_ok($$
  INSERT INTO app_private.market_snapshots (workspace_id, id, bout_id, captured_at, source, odds_a, odds_b)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'cccc0000-0000-4000-8000-0000000000ff',
          'bbbb0000-0000-4000-8000-000000000001', now(), 'manual', NULL, NULL)$$,
  '23514', NULL, 'a market snapshot with neither corner priced is rejected');

-- The run <-> snapshot cycle: neither side can be inserted first under
-- ON DELETE/UPDATE RESTRICT, so the cycle constraints are deferred.
SET CONSTRAINTS app_private.run_decision_snapshot_fk,
                app_private.prediction_snapshots_run_fk DEFERRED;

SELECT lives_ok($$
  INSERT INTO app_private.prediction_runs (workspace_id, id, bout_id, created_at,
    decision_snapshot_id, target_event_date_at_capture, finish_status,
    provenance_completeness, corner_a_is_prospect_at_capture,
    corner_b_is_prospect_at_capture, includes_prospect_at_capture)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000000-aaaaaa',
          'bbbb0000-0000-4000-8000-000000000001', now(),
          'dddd0000-0000-4000-8000-000000000001', '2026-03-01', 'absent', 'full',
          true, false, true)$$,
  'a run whose includes_prospect equals the OR of two known flags is accepted');

SELECT lives_ok($$
  INSERT INTO app_private.prediction_snapshots (workspace_id, id, run_id, bout_id,
    basis, prob_a, prob_b, winner_corner, captured_at, capture_mode)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'dddd0000-0000-4000-8000-000000000001', '1700000000000-aaaaaa',
          'bbbb0000-0000-4000-8000-000000000001',
          'legacy-v1-unversioned', 0.6, 0.4, 'A', now(), 'live')$$,
  'a live snapshot with no reconstruction fields is accepted');

-- prospect OR: unverified when EITHER flag is NULL, exact when both are known
SELECT lives_ok($$
  INSERT INTO app_private.prediction_runs (workspace_id, id, bout_id, created_at,
    decision_snapshot_id, target_event_date_at_capture, finish_status,
    provenance_completeness, corner_a_is_prospect_at_capture,
    corner_b_is_prospect_at_capture, includes_prospect_at_capture)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000001-aaaaaa',
          'bbbb0000-0000-4000-8000-000000000001', now(),
          'dddd0000-0000-4000-8000-000000000001', '2026-03-01', 'absent', 'full',
          NULL, false, true)$$,
  'with one corner flag NULL, includes_prospect is unverified and any value passes');

SELECT throws_ok($$
  INSERT INTO app_private.prediction_runs (workspace_id, id, bout_id, created_at,
    decision_snapshot_id, target_event_date_at_capture, finish_status,
    provenance_completeness, corner_a_is_prospect_at_capture,
    corner_b_is_prospect_at_capture, includes_prospect_at_capture)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000002-aaaaaa',
          'bbbb0000-0000-4000-8000-000000000001', now(),
          'dddd0000-0000-4000-8000-000000000001', '2026-03-01', 'absent', 'full',
          true, false, false)$$,
  '23514', NULL, 'with BOTH flags known, a wrong includes_prospect is rejected');

-- capture_mode <-> reconstruction, biconditional, both directions
SELECT throws_ok($$
  INSERT INTO app_private.prediction_snapshots (workspace_id, id, run_id, bout_id,
    basis, prob_a, prob_b, winner_corner, captured_at, capture_mode)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'dddd0000-0000-4000-8000-0000000000f1', '1700000000000-aaaaaa',
          'bbbb0000-0000-4000-8000-000000000001',
          'v2', 0.6, 0.4, 'A', now(), 'reconstructed')$$,
  '23514', NULL, 'capture_mode reconstructed with no reconstruction record is rejected');

SELECT throws_ok($$
  INSERT INTO app_private.prediction_snapshots (workspace_id, id, run_id, bout_id,
    basis, prob_a, prob_b, winner_corner, captured_at, capture_mode,
    reconstruction_type, reconstruction_source_commit)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'dddd0000-0000-4000-8000-0000000000f2', '1700000000000-aaaaaa',
          'bbbb0000-0000-4000-8000-000000000001',
          'v2', 0.6, 0.4, 'A', now(), 'live', 'backfilled', 'abc123')$$,
  '23514', NULL, 'a live snapshot carrying reconstruction fields is rejected');

-- priorV2 must be a PROBABILITY, not merely finite
SELECT throws_ok($$
  INSERT INTO app_private.prediction_snapshots (workspace_id, id, run_id, bout_id,
    basis, prob_a, prob_b, winner_corner, captured_at, capture_mode,
    reconstruction_type, reconstruction_source_commit,
    reconstruction_prior_v2_p_a, reconstruction_prior_v2_p_b)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'dddd0000-0000-4000-8000-0000000000f3', '1700000000000-aaaaaa',
          'bbbb0000-0000-4000-8000-000000000001',
          'v2', 0.6, 0.4, 'A', now(), 'reconstructed', 'backfilled', 'abc123',
          42, 0.5)$$,
  '23514', NULL, 'a priorV2 probability of 42 is rejected though it is finite');

-- betting_assessments: no market => no market-derived value
SELECT throws_ok($$
  INSERT INTO app_private.betting_assessments (workspace_id, id, bout_id, run_id,
    prediction_snapshot_id, market_snapshot_id, frozen_at, edge_a,
    tier_provenance, recommended_corner_provenance)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'ffff0000-0000-4000-8000-0000000000f1',
          'bbbb0000-0000-4000-8000-000000000001', '1700000000000-aaaaaa',
          'dddd0000-0000-4000-8000-000000000001', NULL, now(), 0.12,
          'stored', 'stored')$$,
  '23514', NULL, 'an edge with no market snapshot is rejected as fabricated');

SELECT lives_ok($$
  INSERT INTO app_private.betting_assessments (workspace_id, id, bout_id, run_id,
    prediction_snapshot_id, market_snapshot_id, frozen_at,
    tier_provenance, recommended_corner_provenance)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          'ffff0000-0000-4000-8000-000000000001',
          'bbbb0000-0000-4000-8000-000000000001', '1700000000000-aaaaaa',
          'dddd0000-0000-4000-8000-000000000001',
          'cccc0000-0000-4000-8000-000000000001', now(), 'stored', 'stored')$$,
  'an assessment with a market is accepted');

-- wagers have NO legacy-null concession on settled_at
SELECT throws_ok($$
  INSERT INTO app_private.wagers (workspace_id, id, bout_id, assessment_id,
    market_snapshot_id, corner, stake_units, placed_at,
    settlement_status, settlement_outcome, financial_status, profit_units, settled_at)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          '99990000-0000-4000-8000-0000000000f1',
          'bbbb0000-0000-4000-8000-000000000001',
          'ffff0000-0000-4000-8000-000000000001',
          'cccc0000-0000-4000-8000-000000000001', 'A', 1, now(),
          'settled', 'won', 'computed', 0.6667, NULL)$$,
  '23514', NULL, 'a settled wager with no settled_at is rejected');

-- parlay legs: no repeated bout
SELECT lives_ok($$
  INSERT INTO app_private.parlays (workspace_id, id, event_id, combined_odds,
    stake_units, pick_source, created_at)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000011-bbbbbb',
          'eeee0000-0000-4000-8000-000000000001', 250, 1, 'human', now());
  INSERT INTO app_private.parlay_legs (workspace_id, parlay_id, leg_index, bout_id,
    picked_corner, overridden)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000011-bbbbbb', 0,
          'bbbb0000-0000-4000-8000-000000000001', 'A', false)$$,
  'a parlay inserted atomically with its legs is accepted');

SELECT throws_ok($$
  INSERT INTO app_private.parlay_legs (workspace_id, parlay_id, leg_index, bout_id,
    picked_corner, overridden)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000011-bbbbbb', 1,
          'bbbb0000-0000-4000-8000-000000000001', 'B', false)$$,
  '23505', NULL, 'a parlay repeating the same bout is rejected');

-- A leg-less parlay is only detectable at COMMIT, so it needs its own
-- subtransaction: the deferred trigger fires when the savepoint is released.
SELECT throws_ok($q$
  DO $x$ BEGIN
    INSERT INTO app_private.parlays (workspace_id, id, event_id, combined_odds,
      stake_units, pick_source, created_at)
    VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000010-bbbbbb',
            'eeee0000-0000-4000-8000-000000000001', 250, 1, 'human', now());
    SET CONSTRAINTS app_private.parlays_have_legs IMMEDIATE;
  END $x$
$q$, 'P0001', NULL, 'a parlay with no legs is rejected when its constraint fires');

-- ── Settlement contract, exercised against real rows ────────────────────────
SELECT throws_ok($q$
  DO $x$ BEGIN
    INSERT INTO app_private.tracked_positions (workspace_id, id, bout_id,
      assessment_id, market_snapshot_id, origin, corner, stake_units, stake_source,
      opened_at, settlement_status, settlement_outcome, financial_status,
      profit_units, settled_at, review_status)
    VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
            '77770000-0000-4000-8000-0000000000f1',
            'bbbb0000-0000-4000-8000-000000000001',
            'ffff0000-0000-4000-8000-000000000001',
            'cccc0000-0000-4000-8000-000000000001', 'appCreated', 'A', 1, 'explicit',
            now(), 'settled', 'won', 'computed', 999, now(), 'notRequired');
    SET CONSTRAINTS app_private.tracked_positions_settlement IMMEDIATE;
  END $x$
$q$, 'P0001', NULL, 'a settled position on a PENDING bout is rejected');

SELECT lives_ok($$
  INSERT INTO app_private.tracked_positions (workspace_id, id, bout_id,
    assessment_id, market_snapshot_id, origin, corner, stake_units, stake_source,
    opened_at, settlement_status, review_status)
  VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
          '77770000-0000-4000-8000-000000000001',
          'bbbb0000-0000-4000-8000-000000000001',
          'ffff0000-0000-4000-8000-000000000001',
          'cccc0000-0000-4000-8000-000000000001', 'appCreated', 'A', 1, 'explicit',
          now(), 'open', 'notRequired')$$,
  'an OPEN position on a pending bout is accepted');

-- FLUSH the queued deferred events while the state is still internally
-- consistent (bout pending, position open). Without this, the INSERT's
-- NEW.status = 'open' event stays queued and is forced later — after grading —
-- where it correctly reports `settlement disagrees with bout result status`.
-- That is the trigger doing its job on a stale event, not a schema defect, so
-- the fixture lifecycle is what has to change, never the production trigger.
SET CONSTRAINTS app_private.tracked_positions_settlement,
                app_private.bouts_dependents_settlement IMMEDIATE;
SET CONSTRAINTS app_private.tracked_positions_settlement,
                app_private.bouts_dependents_settlement DEFERRED;

-- ── Private Upcoming, with the position actually still open ─────────────────
-- The later private-workspace block runs after grading, when the only position
-- has settled — so its fm_member_upcoming assertion is satisfied by an empty
-- set either way. This one runs HERE, while the bout is pending and the position
-- is open, so it proves a member really can reach Upcoming data in a private
-- workspace rather than proving nothing.
UPDATE app_private.workspaces SET is_public = false WHERE slug = 'fightmetrics';

SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

SELECT is((SELECT count(*) FROM public.fm_read_upcoming('fightmetrics')), 0::bigint,
          'private + open position: fm_read_upcoming returns zero');
SELECT is((SELECT count(*) FROM public.fm_member_upcoming('fightmetrics')), 1::bigint,
          'private + open position: the owner sees exactly one upcoming row');
SELECT is((SELECT tracked_position_id FROM public.fm_member_upcoming('fightmetrics')),
          '77770000-0000-4000-8000-000000000001'::uuid,
          'private: the upcoming row is the expected position');
SELECT isnt((SELECT revision FROM public.fm_member_upcoming('fightmetrics')), NULL,
            'private: the upcoming row carries a non-null revision');

SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SELECT is((SELECT count(*) FROM public.fm_member_upcoming('fightmetrics')), 0::bigint,
          'private: a signed-in non-member sees no upcoming rows');
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;
UPDATE app_private.workspaces SET is_public = true WHERE slug = 'fightmetrics';

-- ── Settlement: correct profit accepted, perturbed profit rejected ──────────
-- SET CONSTRAINTS ... IMMEDIATE is essential. The triggers are DEFERRED and this
-- file never commits, so a plain lives_ok around the UPDATE proves nothing — it
-- passed even with a profit one ULP off. Forcing the check is what makes the
-- assertion real, and BOTH sides are forced so the position and the bout are
-- validated together in their final state.
--
-- The expected profit is 0.6666666666666665 (3fe5555555555554), which is what
-- Node produces for the expression production actually evaluates:
--   1 * ((1 + 100/150) - 1)
-- `100/150` alone conventionally displays as 0.6666666666666666, but that is a
-- DIFFERENT double: the subtraction after the addition loses the last bit. The
-- conventional value is rejected — see the one-ULP test below.
SELECT lives_ok($q$
  DO $x$ BEGIN
    UPDATE app_private.tracked_positions
       SET settlement_status = 'settled', settlement_outcome = 'won',
           financial_status = 'computed', profit_units = 0.6666666666666665,
           settled_at = now()
     WHERE id = '77770000-0000-4000-8000-000000000001';
    UPDATE app_private.bouts
       SET result_status = 'resolved', result_outcome = 'A', result_method = 'DEC'
     WHERE id = 'bbbb0000-0000-4000-8000-000000000001';
    SET CONSTRAINTS app_private.tracked_positions_settlement,
                    app_private.bouts_dependents_settlement IMMEDIATE;
  END $x$
$q$, 'a settled position carrying the V8-computed profit is accepted');

-- One ULP is enough to be rejected: the comparison really is exact.
SELECT throws_ok($q$
  DO $x$ BEGIN
    UPDATE app_private.tracked_positions SET profit_units = 0.6666666666666666
     WHERE id = '77770000-0000-4000-8000-000000000001';
    SET CONSTRAINTS app_private.tracked_positions_settlement IMMEDIATE;
  END $x$
$q$, 'P0001', NULL, 'a profit ONE ULP off is rejected — the check is exact');

SELECT throws_ok($q$
  DO $x$ BEGIN
    UPDATE app_private.tracked_positions SET profit_units = 0.9
     WHERE id = '77770000-0000-4000-8000-000000000001';
    SET CONSTRAINTS app_private.tracked_positions_settlement IMMEDIATE;
  END $x$
$q$, 'P0001', NULL, 'a PERTURBED stored profit is rejected by the settlement check');

-- ── A complete fixture for the export: one row of every entity type ─────────
INSERT INTO app_private.wagers (workspace_id, id, bout_id, assessment_id,
  market_snapshot_id, corner, stake_units, placed_at, settlement_status,
  settlement_outcome, financial_status, profit_units, settled_at, notes)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
        '99990000-0000-4000-8000-000000000001',
        'bbbb0000-0000-4000-8000-000000000001',
        'ffff0000-0000-4000-8000-000000000001',
        -- 2 * ((1 + 100/150) - 1) = 1.333333333333333 = 3ff5555555555554 in Node.
        -- 1.3333333333333333 is a different double and is rejected.
        'cccc0000-0000-4000-8000-000000000001', 'A', 2, now(),
        'settled', 'won', 'computed', 1.333333333333333, now(), 'a real bet');

-- Forced, so the wager fixture cannot pass vacuously the way the position one
-- did: its trigger is deferred too, and this file never commits.
SELECT lives_ok($$SET CONSTRAINTS app_private.wagers_settlement IMMEDIATE$$,
                'the settled 2u wager satisfies the settlement contract');
SET CONSTRAINTS app_private.wagers_settlement DEFERRED;

INSERT INTO app_private.props (workspace_id, id, event_id, target_kind,
  target_bout_id, target_corner, method, prop_type, label, odds, stake_units,
  result, pick_source, created_at)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000020-cccccc',
        'eeee0000-0000-4000-8000-000000000001', 'bout',
        'bbbb0000-0000-4000-8000-000000000001', 'A', 'KO/TKO', 'method',
        'Alpha by KO', 300, 1, 'PENDING', 'model', now());

-- ── Read surfaces: audience and the public/private contract ─────────────────
-- The claimant (user 1) is the owner; user 2 is a signed-in non-member.
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

SELECT is((SELECT count(*) FROM public.fm_read_events('fightmetrics')), 1::bigint,
          'fm_read_events returns the public card');
SELECT is((SELECT count(*) FROM public.fm_read_bouts('fightmetrics')), 1::bigint,
          'fm_read_bouts returns the public bout');
-- The bout was graded above, so the position has moved from Upcoming to ROI.
SELECT is((SELECT count(*) FROM public.fm_read_upcoming('fightmetrics')), 0::bigint,
          'fm_read_upcoming is empty once the position has settled');
SELECT is((SELECT count(*) FROM public.fm_read_roi('fightmetrics')), 1::bigint,
          'fm_read_roi returns the settled position');
SELECT is((SELECT count(*) FROM public.fm_read_statistics_input('fightmetrics')),
          1::bigint, 'fm_read_statistics_input projects the legacy entry shape');

-- anon reaches the public surfaces and nothing else.
SET LOCAL ROLE anon;
SET LOCAL search_path = public, extensions;
SELECT is((SELECT count(*) FROM public.fm_read_events('fightmetrics')), 1::bigint,
          'anon can read the public event surface');
SELECT throws_ok($$SELECT * FROM public.fm_member_roi('fightmetrics')$$,
                 '42501', NULL, 'anon cannot execute a member surface');
SELECT throws_ok($$SELECT public.fm_member_export_store('fightmetrics')$$,
                 '42501', NULL, 'anon cannot export the store');

-- A signed-in NON-member gets the public surface and no member data.
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SELECT is((SELECT count(*) FROM public.fm_read_events('fightmetrics')), 1::bigint,
          'a signed-in non-member still reads through the public fallback');
SELECT is((SELECT count(*) FROM public.fm_member_events('fightmetrics')), 0::bigint,
          'a signed-in non-member gets nothing from a member surface');
SELECT is(public.fm_member_export_store('fightmetrics'), NULL::jsonb,
          'a signed-in non-member cannot export the store');

-- The member gets revision tokens the public surface never exposes.
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
SELECT is((SELECT count(*) FROM public.fm_member_events('fightmetrics')), 1::bigint,
          'the owner sees the member event surface');
SELECT isnt((SELECT revision FROM public.fm_member_events('fightmetrics')), NULL,
            'the member surface carries a revision token');
-- EXACT top-level key set. `? 'meta'` passed happily while five required
-- sections were missing entirely.
SELECT set_eq(
  $$SELECT jsonb_object_keys(public.fm_member_export_store('fightmetrics'))$$,
  $$VALUES ('meta'),('events'),('bouts'),('predictionRuns'),
           ('predictionSnapshots'),('marketSnapshots'),('bettingAssessments'),
           ('trackedPositions'),('wagers'),('props'),('parlays')$$,
  'the export top-level key set is exactly StoreSchema''s eleven sections');

SELECT is((SELECT count(*) FROM jsonb_object_keys(
             public.fm_member_export_store('fightmetrics'))), 11::bigint,
          'the export has exactly eleven sections, no extras');

-- Every entity type has at least one row, so no section is vacuously empty.
SELECT is((SELECT count(*) FROM (
             SELECT k, jsonb_array_length(
               public.fm_member_export_store('fightmetrics') -> k) AS n
               FROM unnest(ARRAY['events','bouts','predictionRuns',
                 'predictionSnapshots','marketSnapshots','bettingAssessments',
                 'trackedPositions','wagers','props','parlays']) k) c
           WHERE c.n < 1),
          0::bigint, 'every entity section of the export is non-empty');

-- Representative fields, including the nested parlay legs.
SELECT is(public.fm_member_export_store('fightmetrics') #>> '{meta,schemaVersion}',
          '1', 'export meta.schemaVersion is reconstructed from the workspace');
SELECT is(public.fm_member_export_store('fightmetrics') #>> '{bouts,0,cornerA,displayName}',
          'Alpha Fighter', 'export bouts carry the nested cornerA object');
SELECT is(public.fm_member_export_store('fightmetrics') #>> '{trackedPositions,0,settlement,status}',
          'settled', 'export tracked positions carry the settlement union');
SELECT is(public.fm_member_export_store('fightmetrics') #>> '{parlays,0,legs,0,pickedCorner}',
          'A', 'export parlays carry their nested legs');
SELECT is(jsonb_array_length(
            public.fm_member_export_store('fightmetrics') #> '{parlays,0,legs}'),
          1, 'the parlay exports exactly its one leg');
SELECT is(public.fm_member_export_store('fightmetrics') #>> '{props,0,target,kind}',
          'bout', 'export props carry the discriminated target union');

-- Excluded fields never appear in a public projection.
SELECT is((SELECT count(*) FROM information_schema.columns
            WHERE table_schema = 'public'
              AND column_name IN ('feature_vector','source_manifest',
                    'fight_history_cutoff','model_coef_hash','legacy_entry_id',
                    'notes','fighter_key','external_ids','origin','stake_source',
                    'row_updated_at','revision')
              AND table_name IN ('fm_read_roi','fm_read_upcoming','fm_read_events',
                                 'fm_read_bouts','fm_read_props','fm_read_parlays')),
          0::bigint, 'no excluded field appears in any fm_read_* return shape');

-- THE fm_read_* contract: a private workspace yields nothing even to its owner.
SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;
UPDATE app_private.workspaces SET is_public = false WHERE slug = 'fightmetrics';
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
-- EVERY public surface goes dark…
SELECT is((SELECT count(*) FROM public.fm_read_events('fightmetrics'))
        + (SELECT count(*) FROM public.fm_read_bouts('fightmetrics'))
        + (SELECT count(*) FROM public.fm_read_roi('fightmetrics'))
        + (SELECT count(*) FROM public.fm_read_upcoming('fightmetrics'))
        + (SELECT count(*) FROM public.fm_read_props('fightmetrics'))
        + (SELECT count(*) FROM public.fm_read_parlays('fightmetrics'))
        + (SELECT count(*) FROM public.fm_read_statistics_input('fightmetrics')),
          0::bigint, 'every fm_read_* returns zero rows for a private workspace');

-- …and every member equivalent keeps working, so a private workspace loses no
-- app functionality. Before this commit there were no member equivalents for
-- Upcoming, Props, Parlays or Statistics, so those four tabs went blank.
SELECT is((SELECT count(*) FROM public.fm_member_events('fightmetrics')), 1::bigint,
          'private: fm_member_events still serves the member');
SELECT is((SELECT count(*) FROM public.fm_member_bouts('fightmetrics')), 1::bigint,
          'private: fm_member_bouts still serves the member');
SELECT is((SELECT count(*) FROM public.fm_member_roi('fightmetrics')), 1::bigint,
          'private: fm_member_roi returns the settled position');
SELECT is((SELECT count(*) FROM public.fm_member_props('fightmetrics')), 1::bigint,
          'private: fm_member_props returns the prop');
SELECT is((SELECT count(*) FROM public.fm_member_parlays('fightmetrics')), 1::bigint,
          'private: fm_member_parlays returns the parlay leg');
SELECT is((SELECT count(*) FROM public.fm_member_statistics_input('fightmetrics')),
          1::bigint, 'private: fm_member_statistics_input returns the entry');
SELECT ok((public.fm_member_export_store('fightmetrics') -> 'wagers') <> '[]'::jsonb,
          'private: the export still carries wager data');
SELECT isnt((SELECT revision FROM public.fm_member_props('fightmetrics')), NULL,
            'private: the member prop surface carries a revision token');

-- A signed-in NON-member gets nothing from any of them, private or not.
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SELECT is((SELECT count(*) FROM public.fm_member_props('fightmetrics'))
        + (SELECT count(*) FROM public.fm_member_parlays('fightmetrics'))
        + (SELECT count(*) FROM public.fm_member_upcoming('fightmetrics'))
        + (SELECT count(*) FROM public.fm_member_statistics_input('fightmetrics')),
          0::bigint, 'private: a signed-in non-member gets nothing from members surfaces');
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

-- anon cannot execute the new member surfaces at all.
SET LOCAL ROLE anon;
SET LOCAL search_path = public, extensions;
SELECT throws_ok($$SELECT * FROM public.fm_member_props('fightmetrics')$$,
                 '42501', NULL, 'anon cannot execute fm_member_props');
SELECT throws_ok($$SELECT * FROM public.fm_member_statistics_input('fightmetrics')$$,
                 '42501', NULL, 'anon cannot execute fm_member_statistics_input');

SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;
UPDATE app_private.workspaces SET is_public = true WHERE slug = 'fightmetrics';

-- ── The run <-> snapshot cycle can actually be deleted ──────────────────────
-- This is what NO ACTION buys. Under the previous deferrable RESTRICT the very
-- same sequence failed, because RESTRICT is checked immediately regardless of
-- SET CONSTRAINTS — neither side of the cycle could go first.
SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;

-- An isolated cycle with nothing else referencing it.
SET CONSTRAINTS app_private.run_decision_snapshot_fk,
                app_private.prediction_snapshots_run_fk DEFERRED;
INSERT INTO app_private.prediction_runs (workspace_id, id, bout_id, created_at,
  decision_snapshot_id, target_event_date_at_capture, finish_status,
  provenance_completeness, corner_a_is_prospect_at_capture,
  corner_b_is_prospect_at_capture, includes_prospect_at_capture)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001', '1700000000099-aaaaaa',
        'bbbb0000-0000-4000-8000-000000000001', now(),
        'dd990000-0000-4000-8000-000000000001', '2026-03-01', 'absent', 'full',
        false, false, false);
INSERT INTO app_private.prediction_snapshots (workspace_id, id, run_id, bout_id,
  basis, prob_a, prob_b, winner_corner, captured_at, capture_mode)
VALUES ('aaaaaaaa-0000-4000-8000-000000000001',
        'dd990000-0000-4000-8000-000000000001', '1700000000099-aaaaaa',
        'bbbb0000-0000-4000-8000-000000000001', 'v2', 0.7, 0.3, 'A', now(), 'live');

SAVEPOINT cycle_delete;
SELECT lives_ok($$
  DELETE FROM app_private.prediction_snapshots
   WHERE id = 'dd990000-0000-4000-8000-000000000001';
  DELETE FROM app_private.prediction_runs WHERE id = '1700000000099-aaaaaa'$$,
  'an isolated run/snapshot cycle deletes in the documented order when deferred');
ROLLBACK TO SAVEPOINT cycle_delete;

-- A genuinely surviving reference still fails when the constraints are forced
-- immediate, so the deferral is a window, not a hole.
SAVEPOINT cycle_surviving;
SELECT throws_ok($q$
  DO $x$ BEGIN
    DELETE FROM app_private.prediction_snapshots
     WHERE id = 'dd990000-0000-4000-8000-000000000001';
    -- the run is deliberately NOT deleted, so its decision_snapshot_id dangles
    SET CONSTRAINTS app_private.run_decision_snapshot_fk,
                    app_private.prediction_snapshots_run_fk IMMEDIATE;
  END $x$
$q$, '23503', NULL, 'a surviving reference still aborts when forced immediate');
ROLLBACK TO SAVEPOINT cycle_surviving;

-- ── The ACL negatives BIND ──────────────────────────────────────────────────
-- Both checks previously ran against information_schema.role_table_grants,
-- which is empty under this connection, so they were satisfied by an absent
-- result set rather than by an absent grant. These probes introduce the exact
-- violation each one is supposed to catch and confirm it is caught, then roll
-- back and confirm the check passes again. fm_table_owner owns the tables, so it
-- can issue and revoke the probe grants itself.
SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;

SAVEPOINT acl_probe_immutable;
GRANT UPDATE ON app_private.prediction_runs TO fm_member_api;
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND c.relname IN ('prediction_runs','prediction_snapshots',
                                'market_snapshots','betting_assessments',
                                'parlays','parlay_legs')
              AND a.privilege_type = 'UPDATE'
              AND a.grantee <> c.relowner),
          1::bigint,
          'probe: granting UPDATE on an immutable table to fm_member_api is SEEN');
ROLLBACK TO SAVEPOINT acl_probe_immutable;

SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND c.relname IN ('prediction_runs','prediction_snapshots',
                                'market_snapshots','betting_assessments',
                                'parlays','parlay_legs')
              AND a.privilege_type = 'UPDATE'
              AND a.grantee <> c.relowner),
          0::bigint, 'probe rolled back: the immutable assertion passes again');

SAVEPOINT acl_probe_nonfm;
GRANT SELECT ON app_private.events TO postgres;
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND CASE WHEN a.grantee = 0 THEN true
                       ELSE pg_catalog.pg_get_userbyid(a.grantee) NOT LIKE 'fm\_%' END),
          1::bigint, 'probe: granting a table privilege to postgres is SEEN');
ROLLBACK TO SAVEPOINT acl_probe_nonfm;

SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND CASE WHEN a.grantee = 0 THEN true
                       ELSE pg_catalog.pg_get_userbyid(a.grantee) NOT LIKE 'fm\_%' END),
          0::bigint, 'probe rolled back: the non-fm_ assertion passes again');

-- Back to the operator, and confirm the working membership was a real grant
-- rather than an inherited one — i.e. the contract genuinely required a
-- deliberate act to get here.
RESET ROLE;
SET LOCAL search_path = public, extensions;
SELECT is((SELECT count(*) FROM pg_catalog.pg_auth_members am
             JOIN pg_catalog.pg_roles r ON r.oid = am.roleid
             JOIN pg_catalog.pg_roles m ON m.oid = am.member
            WHERE r.rolname = 'fm_table_owner' AND m.rolname = 'postgres'
              AND am.set_option),
          1::bigint,
          'the working membership exists only because this transaction granted it');

SELECT * FROM finish();
-- ROLLBACK discards the working membership; the automatic admin-only row that
-- the next reset needs is untouched, which the catalog suite re-verifies.
ROLLBACK;
