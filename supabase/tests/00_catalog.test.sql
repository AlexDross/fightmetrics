-- Stage 7 Gate 2 — catalog suite (plan §2).
--
-- Run after EVERY `supabase db reset`. Run 2 is the load-bearing one: roles are
-- cluster-level and survive the reset, so it exercises the idempotent branch of
-- step 0 and the re-grant in step 1.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(32);

-- ── Ownership ───────────────────────────────────────────────────────────────
SELECT is(pg_catalog.pg_get_userbyid(nspowner), 'fm_table_owner',
          'app_private is owned by fm_table_owner')
  FROM pg_catalog.pg_namespace WHERE nspname = 'app_private';

SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind IN ('r','S')
              AND pg_catalog.pg_get_userbyid(c.relowner) <> 'fm_table_owner'),
          0::bigint, 'every app_private table and sequence is owned by fm_table_owner');

SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind = 'i'
              AND pg_catalog.pg_get_userbyid(c.relowner) <> 'fm_table_owner'),
          0::bigint, 'every app_private index is owned by fm_table_owner');

SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_read\_%'
              AND pg_catalog.pg_get_userbyid(p.proowner) <> 'fm_public_reader'),
          0::bigint, 'every public.fm_read_* is owned by fm_public_reader');

SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public'
              AND (p.proname LIKE 'fm\_member\_%' OR p.proname LIKE 'fm\_rpc\_%')
              AND pg_catalog.pg_get_userbyid(p.proowner) <> 'fm_member_api'),
          0::bigint, 'every public.fm_member_*/fm_rpc_* is owned by fm_member_api');

-- The load-bearing separation: the role that owns the tables owns no callable
-- API function, so the roles API functions run as are non-owners bound by RLS.
SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_%'
              AND pg_catalog.pg_get_userbyid(p.proowner) = 'fm_table_owner'),
          0::bigint, 'no callable public fm_ function is owned by fm_table_owner');

-- ── SECURITY DEFINER and search_path ────────────────────────────────────────
-- Only the PUBLIC surface must be DEFINER. The pure immutable helpers are
-- deliberately INVOKER: they touch no table, so DEFINER would add privilege
-- without adding capability.
SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_%'
              AND NOT p.prosecdef),
          0::bigint, 'every public fm_ function is SECURITY DEFINER');

-- Postgres stores `SET search_path = ''` as the literal `search_path=""`, NOT
-- `search_path=`. The plan's original assertion could never match; corrected
-- here and in §2.
SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE (n.nspname = 'app_private'
                OR (n.nspname = 'public' AND p.proname LIKE 'fm\_%'))
              AND NOT (coalesce(p.proconfig, '{}') @> ARRAY['search_path=""'])),
          0::bigint, 'every fm_ function and app_private helper pins search_path to empty');

SELECT ok((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'app_private') >= 18,
          'the documented app_private helper set is present');

-- ── RLS ─────────────────────────────────────────────────────────────────────
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND NOT c.relrowsecurity),
          0::bigint, 'RLS is enabled on every app_private table');

SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'),
          15::bigint, 'all 15 tables are present');

-- Immutable tables are denied UPDATE twice: no policy here, no grant below.
SELECT is((SELECT count(*) FROM pg_catalog.pg_policies
            WHERE schemaname = 'app_private'
              AND tablename IN ('prediction_runs','prediction_snapshots',
                                'market_snapshots','betting_assessments',
                                'parlays','parlay_legs')
              AND cmd = 'UPDATE'),
          0::bigint, 'no UPDATE policy exists on any immutable table');

SELECT is((SELECT count(*) FROM information_schema.role_table_grants
            WHERE table_schema = 'app_private'
              AND table_name IN ('prediction_runs','prediction_snapshots',
                                 'market_snapshots','betting_assessments',
                                 'parlays','parlay_legs')
              AND privilege_type = 'UPDATE'),
          0::bigint, 'no UPDATE grant exists on any immutable table');

-- ── Client roles reach no table directly ────────────────────────────────────
SELECT is((SELECT count(*) FROM information_schema.role_table_grants
            WHERE table_schema = 'app_private' AND grantee IN ('anon','authenticated')),
          0::bigint, 'anon and authenticated hold no privilege on any app_private table');

SELECT ok(NOT has_schema_privilege('anon', 'app_private', 'USAGE'),
          'anon has no USAGE on app_private');
SELECT ok(NOT has_schema_privilege('authenticated', 'app_private', 'USAGE'),
          'authenticated has no USAGE on app_private');

-- ── Function ACLs, compared as normalized aclexplode rows ───────────────────
-- Never array_to_string(proacl): its ordering is not a stable contract.
SELECT set_eq(
  $$SELECT pg_catalog.pg_get_userbyid((a).grantee), (a).privilege_type
      FROM (SELECT pg_catalog.aclexplode(p.proacl) a
              FROM pg_catalog.pg_proc p
              JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname='public' AND p.proname='fm_read_events') s
     WHERE pg_catalog.pg_get_userbyid((a).grantee) <> 'fm_public_reader'$$,
  $$VALUES ('anon','EXECUTE'), ('authenticated','EXECUTE')$$,
  'fm_read_events is executable by exactly anon and authenticated');

SELECT set_eq(
  $$SELECT pg_catalog.pg_get_userbyid((a).grantee), (a).privilege_type
      FROM (SELECT pg_catalog.aclexplode(p.proacl) a
              FROM pg_catalog.pg_proc p
              JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname='public' AND p.proname='fm_rpc_claim_workspace_ownership') s
     WHERE pg_catalog.pg_get_userbyid((a).grantee) <> 'fm_member_api'$$,
  $$VALUES ('authenticated','EXECUTE')$$,
  'the claim RPC is executable by authenticated only — EXECUTE revoked from anon');

SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
                  LATERAL pg_catalog.aclexplode(p.proacl) a
            WHERE n.nspname = 'app_private'
              AND pg_catalog.pg_get_userbyid(a.grantee) IN ('anon','authenticated','public')),
          0::bigint, 'no app_private helper is callable by a client role');

-- ── Role attributes ─────────────────────────────────────────────────────────
SELECT is((SELECT count(*) FROM pg_catalog.pg_roles
            WHERE rolname LIKE 'fm\_%' AND rolcanlogin),
          0::bigint, 'all fm_ roles remain NOLOGIN');

SELECT is((SELECT count(*) FROM pg_catalog.pg_roles WHERE rolname LIKE 'fm\_%'),
          3::bigint, 'exactly three fm_ roles exist');

SELECT ok(NOT has_schema_privilege('fm_public_reader', 'public', 'CREATE'),
          'fm_public_reader has no CREATE on public');
SELECT ok(NOT has_schema_privilege('fm_member_api', 'public', 'CREATE'),
          'fm_member_api has no CREATE on public');

-- ── The membership contract (plan §2, corrected) ────────────────────────────
-- postgres is the TRUSTED migration/operator role. These assertions prevent
-- automatic or immediate use of fm_ role privileges. They do NOT defend against
-- a malicious trusted postgres operator, who can exercise the unavoidable
-- ADMIN OPTION to grant itself SET/INHERIT at any time.
SELECT is((SELECT count(*) FROM pg_catalog.pg_auth_members am
             JOIN pg_catalog.pg_roles r ON r.oid = am.roleid
             JOIN pg_catalog.pg_roles m ON m.oid = am.member
            WHERE r.rolname LIKE 'fm\_%' AND m.rolname NOT LIKE 'fm\_%'),
          3::bigint, 'exactly one permitted non-fm_ membership row per fm_ role');

SELECT is((SELECT count(*) FROM pg_catalog.pg_auth_members am
             JOIN pg_catalog.pg_roles r ON r.oid = am.roleid
             JOIN pg_catalog.pg_roles m ON m.oid = am.member
             JOIN pg_catalog.pg_roles g ON g.oid = am.grantor
            WHERE r.rolname LIKE 'fm\_%' AND m.rolname NOT LIKE 'fm\_%'
              AND m.rolname = 'postgres' AND g.rolname = 'supabase_admin'
              AND am.admin_option AND NOT am.inherit_option AND NOT am.set_option),
          3::bigint,
          'each is postgres, granted by supabase_admin, admin-only: inherit=false set=false');

-- No temporary working rows and no all-false zombie rows survive.
SELECT is((SELECT count(*) FROM pg_catalog.pg_auth_members am
             JOIN pg_catalog.pg_roles r ON r.oid = am.roleid
            WHERE r.rolname LIKE 'fm\_%'
              AND (am.inherit_option OR am.set_option)),
          0::bigint, 'no membership row confers INHERIT or SET on any fm_ role');

SELECT is((SELECT count(*) FROM pg_catalog.pg_auth_members am
             JOIN pg_catalog.pg_roles r ON r.oid = am.roleid
            WHERE r.rolname LIKE 'fm\_%'
              AND NOT am.admin_option AND NOT am.inherit_option AND NOT am.set_option),
          0::bigint, 'no all-false zombie membership row survives');

SELECT ok(pg_catalog.pg_has_role('postgres', 'fm_table_owner', 'MEMBER'),
          'postgres IS a member of fm_table_owner (needed to re-grant on reset 2)');
SELECT ok(NOT pg_catalog.pg_has_role('postgres', 'fm_table_owner', 'SET'),
          'postgres cannot SET ROLE to fm_table_owner');
SELECT ok(NOT pg_catalog.pg_has_role('postgres', 'fm_table_owner', 'USAGE'),
          'postgres does not inherit fm_table_owner privileges');
SELECT ok(NOT pg_catalog.pg_has_role('postgres', 'fm_public_reader', 'USAGE')
          AND NOT pg_catalog.pg_has_role('postgres', 'fm_member_api', 'USAGE'),
          'postgres inherits neither function-owner role');

SELECT throws_ok('SET ROLE fm_table_owner', '42501',
                 NULL, 'direct SET ROLE fm_table_owner fails');

SELECT * FROM finish();
ROLLBACK;
