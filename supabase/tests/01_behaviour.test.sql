-- Stage 7 Gate 2 — behavioural suite.
--
-- Binds the two verified API failures and every corrected Stage 6 invariant.
-- A catalog assertion alone is insufficient: both auth failures passed every
-- structural check and still made the authenticated API unusable.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(35);

-- ── Fixture ─────────────────────────────────────────────────────────────────
INSERT INTO auth.users (id, instance_id, aud, role, email,
                        encrypted_password, created_at, updated_at)
VALUES ('11111111-1111-4111-8111-111111111111',
        '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'claimant@example.com', '', now(), now()),
       ('22222222-2222-4222-8222-222222222222',
        '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'rival@example.com', '', now(), now());

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

SELECT is(app_private.current_user_id(),
          '11111111-1111-4111-8111-111111111111'::uuid,
          'current_user_id resolves the caller from the request GUC alone');

SELECT lives_ok($$SELECT app_private.current_user_id()$$,
                'resolving the caller touches no auth object');

SET LOCAL request.jwt.claim.sub = '';
SELECT is(app_private.current_user_id(), NULL,
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
SELECT is((SELECT count(*) FROM information_schema.role_table_grants
            WHERE table_schema = 'auth' AND grantee LIKE 'fm\_%'),
          0::bigint, 'no fm_ role holds any privilege on any auth table');
SELECT is((SELECT count(*) FROM information_schema.role_table_grants
            WHERE table_schema = 'app_private' AND grantee NOT LIKE 'fm\_%'
              AND grantee <> 'postgres'),
          0::bigint,
          'the only non-fm_ role with app_private table privileges is postgres');

-- ── 2. The first owner can actually be created ──────────────────────────────
-- This is the second failure: `new row violates row-level security policy for
-- table workspace_members`, because the write policy required an owner to
-- already exist and so no first owner could ever be inserted.
SELECT is((SELECT count(*) FROM app_private.workspace_members), 0::bigint,
          'the workspace starts with zero owners');

SELECT lives_ok(
  $$SELECT public.fm_rpc_claim_workspace_ownership('fightmetrics')$$,
  'the zero-owner claim succeeds');

SELECT is((SELECT role FROM app_private.workspace_members
            WHERE user_id = '11111111-1111-4111-8111-111111111111'),
          'owner', 'the claimant is now the owner');

SELECT is((SELECT role FROM public.fm_member_whoami('fightmetrics')),
          'owner', 'whoami reports the resolved membership');

-- Exactly one claimant wins. The second sees the owner the first inserted.
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
SELECT throws_ok($$SELECT public.fm_rpc_claim_workspace_ownership('fightmetrics')$$,
                 '42501', NULL, 'a second claimant is refused: exactly one wins');
SELECT is((SELECT count(*) FROM app_private.workspace_members WHERE role = 'owner'),
          1::bigint, 'still exactly one owner after the losing claim');
SELECT is((SELECT role FROM public.fm_member_whoami('fightmetrics')), NULL,
          'the losing claimant resolves to no membership');

-- An unknown slug stays distinguishable from a claimed one.
SELECT throws_ok($$SELECT public.fm_rpc_claim_workspace_ownership('nope')$$,
                 '42704', NULL, 'an unknown slug raises 42704, not 42501');

SET LOCAL request.jwt.claim.sub = '';
SELECT throws_ok($$SELECT public.fm_rpc_claim_workspace_ownership('fightmetrics')$$,
                 '42501', NULL, 'an unauthenticated claim is refused');
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

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

SELECT * FROM finish();
ROLLBACK;
