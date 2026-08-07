-- Stage 7 Gate 2 — catalog suite (plan §2).
--
-- Run after EVERY `supabase db reset`. Run 2 is the load-bearing one: roles are
-- cluster-level and survive the reset, so it exercises the idempotent branch of
-- step 0 and the re-grant in step 1.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(52);

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

-- pg_catalog, NOT information_schema.role_table_grants. That view only exposes
-- grants involving roles ENABLED for the current user, so under this connection
-- it returns zero rows for app_private and every assertion built on it passed
-- vacuously while fm_member_api in fact held SELECT/INSERT/DELETE on 15 tables
-- and UPDATE on 9.
--
-- "No UPDATE grant" is also literally false as stated: an owner inherently has
-- UPDATE, so fm_table_owner always appears. The real rule is that no NON-OWNER
-- grantee — fm_member_api above all — may update an immutable table.
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND c.relname IN ('prediction_runs','prediction_snapshots',
                                'market_snapshots','betting_assessments',
                                'parlays','parlay_legs')
              AND a.privilege_type = 'UPDATE'
              AND a.grantee <> c.relowner),
          0::bigint, 'no non-owner grantee has UPDATE on any immutable table');

-- ── Client roles reach no table directly ────────────────────────────────────
-- NO non-fm_ role holds any app_private table privilege — postgres included.
-- A permanent grant to postgres would be immediate DML, not a capability it has
-- to deliberately exercise, and would collapse the distinction this contract
-- preserves. The pgTAP suites take a transaction-local membership instead.
-- grantee = 0 is PUBLIC, for which pg_get_userbyid raises; a CASE keeps the
-- PUBLIC case a violation without evaluating the lookup.
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND CASE WHEN a.grantee = 0 THEN true
                       ELSE pg_catalog.pg_get_userbyid(a.grantee) NOT LIKE 'fm\_%' END),
          0::bigint, 'no non-fm_ grantee holds any privilege on any app_private table');

-- POSITIVE CONTROLS. Without these the two assertions above would pass just as
-- happily against an ACL query that sees nothing at all — which is exactly how
-- the information_schema version failed silently.
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND a.privilege_type = 'SELECT'
              AND pg_catalog.pg_get_userbyid(a.grantee) = 'fm_member_api'),
          15::bigint, 'control: fm_member_api has SELECT on exactly 15 tables');

SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND a.privilege_type = 'SELECT'
              AND pg_catalog.pg_get_userbyid(a.grantee) = 'fm_public_reader'),
          15::bigint, 'control: fm_public_reader has SELECT on exactly 15 tables');

SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
             CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) a
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND a.privilege_type = 'UPDATE'
              AND pg_catalog.pg_get_userbyid(a.grantee) = 'fm_member_api'),
          9::bigint, 'control: fm_member_api has UPDATE on exactly the 9 mutable tables');

SELECT ok(NOT has_schema_privilege('anon', 'app_private', 'USAGE'),
          'anon has no USAGE on app_private');
SELECT ok(NOT has_schema_privilege('authenticated', 'app_private', 'USAGE'),
          'authenticated has no USAGE on app_private');
SELECT is((SELECT count(*) FROM pg_catalog.pg_namespace n,
                  LATERAL pg_catalog.aclexplode(n.nspacl) a
            WHERE n.nspname = 'app_private'
              AND pg_catalog.pg_get_userbyid(a.grantee) NOT LIKE 'fm\_%'),
          0::bigint, 'app_private schema ACL names only fm_ roles');

SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
                  LATERAL pg_catalog.aclexplode(p.proacl) a
            WHERE n.nspname = 'app_private'
              AND pg_catalog.pg_get_userbyid(a.grantee) = 'postgres'),
          0::bigint, 'postgres holds EXECUTE on no app_private helper');

-- WRITE is the privilege this schema controls and the one an earlier revision
-- wrongly granted. It must be unreachable without a deliberate re-grant.
--
-- Read is NOT asserted false here: Supabase makes `postgres` an INHERITING
-- member of the built-in `pg_read_all_data`, which confers USAGE on every schema
-- and SELECT on every table cluster-wide. That is a pre-existing platform grant
-- on the operator role, read-only, outside this migration's control, and not
-- something the schema may revoke. The fingerprint records it rather than
-- pretending otherwise.
SELECT is((SELECT count(*) FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind = 'r'
              AND (has_table_privilege('postgres', c.oid, 'INSERT')
                OR has_table_privilege('postgres', c.oid, 'UPDATE')
                OR has_table_privilege('postgres', c.oid, 'DELETE'))),
          0::bigint, 'postgres cannot immediately write to any app_private table');

SELECT ok(pg_catalog.pg_has_role('postgres', 'pg_read_all_data', 'USAGE'),
          'the residual read access is pg_read_all_data, a platform grant');

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

-- ── The audience rule holds for EVERY public function, not just a sample ────
SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_read\_%'
              AND NOT (has_function_privilege('anon', p.oid, 'EXECUTE')
                   AND has_function_privilege('authenticated', p.oid, 'EXECUTE'))),
          0::bigint, 'every fm_read_* is executable by anon AND authenticated');

-- The load-bearing half: a mutation or member surface must NEVER be reachable
-- by anon. A loop-driven grant makes forgetting one impossible, but only this
-- asserts it.
SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public'
              AND (p.proname LIKE 'fm\_member\_%' OR p.proname LIKE 'fm\_rpc\_%')
              AND has_function_privilege('anon', p.oid, 'EXECUTE')),
          0::bigint, 'no fm_member_* or fm_rpc_* is executable by anon');

SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public'
              AND (p.proname LIKE 'fm\_member\_%' OR p.proname LIKE 'fm\_rpc\_%')
              AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')),
          0::bigint, 'every fm_member_*/fm_rpc_* is executable by authenticated');

-- No public fm_ function may retain the default PUBLIC EXECUTE.
SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
                  LATERAL pg_catalog.aclexplode(p.proacl) a
            WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_%'
              AND a.grantee = 0),
          0::bigint, 'no public fm_ function retains PUBLIC EXECUTE');

SELECT set_eq(
  $$SELECT p.proname FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_%'$$,
  $$VALUES ('fm_read_events'),('fm_read_bouts'),('fm_read_roi'),
           ('fm_read_upcoming'),('fm_read_props'),('fm_read_parlays'),
           ('fm_read_statistics_input'),('fm_member_whoami'),('fm_member_roi'),
           ('fm_member_upcoming'),('fm_member_events'),('fm_member_bouts'),
           ('fm_member_props'),('fm_member_parlays'),
           ('fm_member_statistics_input'),('fm_member_export_store'),
           ('fm_member_undo_list'),
           ('fm_rpc_claim_workspace_ownership'),
           ('fm_rpc_change_tracked_corner'),('fm_rpc_amend_tracked_price'),
           ('fm_rpc_confirm_entry'),('fm_rpc_grade_bout'),
           ('fm_rpc_return_bout_to_pending'),('fm_member_wagers_by_bout'),
           ('fm_rpc_undo')$$,
  'the public API surface is exactly the documented function set');

-- ── Constraint helpers reachable by the writing role ────────────────────────
-- A CHECK constraint's function is executed as the role PERFORMING THE WRITE,
-- not as the table owner. Blanket-revoking app_private therefore broke every
-- mutation with `42501 permission denied for function is_finite_or_null` — from
-- the CHECK, not from RLS. Exactly the helpers reachable from a constraint on a
-- table fm_member_api writes are granted to it, and to nothing else.
SELECT set_eq(
  $$SELECT p.proname FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'app_private'
       AND has_function_privilege('fm_member_api', p.oid, 'EXECUTE')
       AND p.proname IN ('is_finite_or_null','is_american_odds_or_null',
                         'decimal_from_american','is_string_map',
                         'is_js_double_map','is_cutoff','is_source_manifest',
                         'finish_leaders_expected','array_is_distinct',
                         'jsonb_key_count','parse_positive_decimal')$$,
  $$VALUES ('is_finite_or_null'),('is_american_odds_or_null'),
           ('decimal_from_american'),('is_string_map')$$,
  'fm_member_api holds EXECUTE on exactly the constraint helpers it needs');

SELECT is((SELECT count(*) FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'app_private'
              AND p.proname IN ('is_finite_or_null','is_american_odds_or_null',
                                'decimal_from_american','is_string_map')
              AND (has_function_privilege('fm_public_reader', p.oid, 'EXECUTE')
                OR has_function_privilege('anon', p.oid, 'EXECUTE')
                OR has_function_privilege('authenticated', p.oid, 'EXECUTE'))),
          0::bigint,
          'those helpers are unreachable by fm_public_reader, anon and authenticated');

-- ── The deferred-NO-ACTION exception ────────────────────────────────────────
-- RESTRICT is the default everywhere. Exactly two FKs — the genuinely cyclic
-- run <-> decision-snapshot pair — are the exception, because RESTRICT is always
-- checked immediately and therefore cannot participate in a deferred delete.
SELECT set_eq(
  $$SELECT con.conname FROM pg_catalog.pg_constraint con
      JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
     WHERE n.nspname = 'app_private' AND con.contype = 'f' AND con.condeferrable$$,
  $$VALUES ('prediction_snapshots_run_fk'),('run_decision_snapshot_fk')$$,
  'exactly the two cyclic FKs are deferrable');

SELECT set_eq(
  $$SELECT con.conname FROM pg_catalog.pg_constraint con
      JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
     WHERE n.nspname = 'app_private' AND con.contype = 'f' AND con.confdeltype = 'a'$$,
  $$VALUES ('prediction_snapshots_run_fk'),('run_decision_snapshot_fk')$$,
  'exactly the two cyclic FKs use NO ACTION on delete');

-- Every other FK stays an immediate RESTRICT, including the assessment ones,
-- which are NOT cyclic and no longer claim deferrability they never needed.
SELECT is((SELECT count(*) FROM pg_catalog.pg_constraint con
             JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
             JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
            WHERE n.nspname = 'app_private' AND con.contype = 'f'
              AND con.conname NOT IN ('prediction_snapshots_run_fk',
                                      'run_decision_snapshot_fk')
              AND (con.condeferrable OR con.confdeltype <> 'r')
              -- The ONLY cascades in the schema are the two references to
              -- auth.users: a deleted auth user takes its membership and its
              -- undo entries with it, by design.
              AND con.conname NOT IN ('workspace_members_user_id_fkey',
                                      'undo_log_user_id_fkey')),
          0::bigint, 'every non-cyclic FK is an immediate RESTRICT');

SELECT set_eq(
  $$SELECT con.conname FROM pg_catalog.pg_constraint con
      JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
     WHERE n.nspname = 'app_private' AND con.contype = 'f' AND con.confdeltype = 'c'$$,
  $$VALUES ('workspace_members_user_id_fkey'),('undo_log_user_id_fkey')$$,
  'exactly the two auth.users references cascade');

SELECT is((SELECT count(*) FROM pg_catalog.pg_constraint con
             JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
             JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
            WHERE n.nspname = 'app_private' AND con.contype = 'f'
              AND con.condeferred),
          0::bigint, 'no FK is INITIALLY DEFERRED — deferral is opt-in per write');

-- ── Numeric output fidelity ─────────────────────────────────────────────────
-- Asserted from the database default, which a fresh connection inherits.
SELECT is((SELECT setconfig FROM pg_catalog.pg_db_role_setting s
             JOIN pg_catalog.pg_database d ON d.oid = s.setdatabase
            WHERE d.datname = current_database() AND s.setrole = 0)
            @> ARRAY['extra_float_digits=3'],
          true, 'the database pins extra_float_digits = 3');

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
