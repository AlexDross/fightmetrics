-- Deterministic catalog fingerprint, compared byte-for-byte between the two
-- consecutive `supabase db reset` runs. Every projection is explicitly ORDERed,
-- because catalog scan order is not a stable contract.
\pset pager off
\pset footer off

\echo == OWNERS: schema, tables, sequences, indexes ==
SELECT n.nspname, c.relkind, c.relname, pg_catalog.pg_get_userbyid(c.relowner) AS owner
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'app_private'
 ORDER BY c.relkind, c.relname;

\echo == OWNERS: functions ==
SELECT n.nspname, p.proname, pg_catalog.pg_get_function_identity_arguments(p.oid) AS args,
       pg_catalog.pg_get_userbyid(p.proowner) AS owner, p.prosecdef, p.proconfig
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'app_private' OR (n.nspname = 'public' AND p.proname LIKE 'fm\_%')
 ORDER BY n.nspname, p.proname, args;

\echo == ACLS: functions, normalized via aclexplode ==
SELECT n.nspname, p.proname, pg_catalog.pg_get_userbyid((a).grantee) AS grantee,
       (a).privilege_type
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
       LATERAL pg_catalog.aclexplode(p.proacl) a
 WHERE n.nspname = 'app_private' OR (n.nspname = 'public' AND p.proname LIKE 'fm\_%')
 ORDER BY 1, 2, 3, 4;

\echo == ACLS: tables, normalized via aclexplode ==
SELECT c.relname, pg_catalog.pg_get_userbyid((a).grantee) AS grantee, (a).privilege_type
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace,
       LATERAL pg_catalog.aclexplode(c.relacl) a
 WHERE n.nspname = 'app_private' AND c.relkind = 'r'
 ORDER BY 1, 2, 3;

\echo == POLICIES ==
SELECT tablename, policyname, cmd, permissive, roles::text, qual, with_check
  FROM pg_catalog.pg_policies WHERE schemaname = 'app_private'
 ORDER BY tablename, policyname;

\echo == RLS FLAGS ==
SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
  FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'app_private' AND c.relkind = 'r' ORDER BY 1;

\echo == CONSTRAINTS ==
SELECT rel.relname, con.conname, con.contype, con.condeferrable, con.condeferred,
       pg_catalog.pg_get_constraintdef(con.oid) AS def
  FROM pg_catalog.pg_constraint con
  JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
 WHERE n.nspname = 'app_private'
 ORDER BY rel.relname, con.conname;

\echo == TRIGGERS ==
SELECT rel.relname, tg.tgname, tg.tgdeferrable, tg.tginitdeferred,
       pg_catalog.pg_get_triggerdef(tg.oid) AS def
  FROM pg_catalog.pg_trigger tg
  JOIN pg_catalog.pg_class rel ON rel.oid = tg.tgrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = rel.relnamespace
 WHERE n.nspname = 'app_private' AND NOT tg.tgisinternal
 ORDER BY rel.relname, tg.tgname;

\echo == ROLE ATTRIBUTES ==
SELECT rolname, rolcanlogin, rolinherit, rolsuper, rolcreaterole, rolcreatedb
  FROM pg_catalog.pg_roles WHERE rolname LIKE 'fm\_%' ORDER BY 1;

\echo == MEMBERSHIPS IN fm_ ROLES ==
SELECT r.rolname AS fm_role, m.rolname AS member, g.rolname AS grantor,
       am.admin_option, am.inherit_option, am.set_option
  FROM pg_catalog.pg_auth_members am
  JOIN pg_catalog.pg_roles r ON r.oid = am.roleid
  JOIN pg_catalog.pg_roles m ON m.oid = am.member
  JOIN pg_catalog.pg_roles g ON g.oid = am.grantor
 WHERE r.rolname LIKE 'fm\_%' ORDER BY 1, 2, 3;

\echo == SCHEMA PRIVILEGES ==
SELECT rolname,
       has_schema_privilege(rolname, 'public', 'CREATE')     AS public_create,
       has_schema_privilege(rolname, 'app_private', 'USAGE') AS app_private_usage
  FROM pg_catalog.pg_roles
 WHERE rolname IN ('fm_table_owner','fm_public_reader','fm_member_api',
                   'anon','authenticated','postgres')
 ORDER BY 1;
