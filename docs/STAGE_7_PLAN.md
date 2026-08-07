# Stage 7 — Supabase/Postgres persistence plan

Approved SQL contract. **Any implementation deviation must update this document in
the same commit as the change.**

Base: `main` @ `89f6c45`. Backend decision: Supabase/Postgres.

---

## 0. Gates

| Gate | Content | Stops for review |
|---|---|---|
| 0 · Preflight | Docker runtime present and running; ports 54321–54324 free; Node supports the pinned CLI | ✅ |
| 1 | This document + `feat(data): add repository interfaces over the durable schema` — in-memory only | ✅ |
| 2 | `feat(data): add Postgres schema, roles, policies and RPCs` — pinned Supabase CLI as devDependency, committed `supabase/`, full local stack, all SQL/API tests. **No hosted project.** | ✅ |
| 2 · status | **PARTIAL — RPC clusters 1–4 landed.** Landed: roles, ownership transfer, ACLs, `app_private` schema, all 15 tables with composite FKs and the deferrable run↔snapshot cycle, revision/slug/settlement triggers, RLS on every table, a working authenticated path (caller resolution + zero-owner bootstrap), the `fm_read_*`/`fm_member_*` surfaces **for everything the current app renders**, SQL-side measurements, and 157 assertions green under `npm run test:db` and 14 under `npm run test:api`, including StoreSchema validation of the export and genuine two-client claim concurrency. **RPC cluster 1 (tracked-position edits)** is complete: `fm_rpc_change_tracked_corner`, `fm_rpc_amend_tracked_price`, `fm_rpc_confirm_entry` and `fm_member_undo_list`, with authorization, expected-revision conflicts, `stale_write` carrying the live server revision, undo records, settled-edit recomputation and rollback proof — 40 API assertions and 159 pgTAP. **RPC cluster 2 (bout lifecycle)** is complete: `fm_rpc_grade_bout`, `fm_rpc_return_bout_to_pending` and the deferred `fm_member_wagers_by_bout` read, with full revision-vector validation under row locks, `stale_write` carrying the real server revision, undo prior-state, mixed outcomes, and grade/return proven true inverses — 66 API assertions. **RPC cluster 3 (undo foundation)** is complete: `fm_rpc_undo` for all five implemented operations (tracked-corner change, price amendment, confirmation, grade, return-to-pending), with the table-owner `lock_undo_row`/`current_revision`/`check_undo_vector`/`remove_created_rows`/`restore_position` helpers, creator/role/workspace/TTL/single-use/consumed enforcement, undo-row-lock serialization of concurrent undos, `stale_write` naming every drifted row, atomic rollback, safe removal of forward-created market snapshots, exact prior-state round trips for every operation, no undo-of-undo, `prior_state` withheld from the read surface, and `absent_ids` validated with restoration reserved for cluster 4 — **19 API assertions, 85 API total**. `is_string_map` is now `EXECUTE`-granted to `fm_member_api` (four constraint helpers, not three), because settling a wager during grade/undo re-evaluates its `external_ids` CHECK. **RPC cluster 4 (deletion)** is complete: `fm_rpc_delete_pending_run` and `fm_rpc_clear_graded`, with the table-owner `delete_aggregate`/`check_graded_vector`/`deleted_row_exists`/`assert_ids_absent`/`restore_deleted_aggregate`/`untombstone_roots` helpers; proven-orphan pruning in the documented order (position → assessment → market → snapshots → run → stop), the run-survives-iff-a-wager-pins-its-assessment rule, unconditional root tombstoning with tombstone-as-authoritative `notFound` (no double delete), conflict-checked on the tracked position (delete) and an owner-only graded vector (clear), and the `absent_ids` restoration path in `fm_rpc_undo` that re-inserts a deleted aggregate column-complete (`to_jsonb`/`jsonb_populate_record`, immutable rows via plain `INSERT`, run↔snapshot cycle deferred) after `assert_ids_absent`, then un-tombstones — **10 API assertions, 95 API total**. Deletion is by run root only, matching the frozen contract and the in-memory reference; the stray `delete_tracked_position` RPC was withdrawn (see §5/§6). **Outstanding:** 16 of the contract's 25 mutation methods, plus the 3 deferred reads (`getAggregate`, `workspace.current`, `seedVersion` — see §5) and the non-contract `fm_rpc_seed_store`; and the 152-row stored-profit recomputation, which needs Gate 3's seed. Both float constraints remain **provisional**. | |
| 3 | `feat(data): migrate seed data into the durable schema` | ✅ |
| 4 | `feat(auth): add magic-link sign-in and read-only public state` | ✅ |
| 5 | **Hosted rollout** — Alex creates/links the project, `db push --dry-run` → `db push`, Vercel vars, invite owner, claim, approve seed | ✅ |
| 6 | `feat(data): back repositories with Postgres` — runtime rewire; dead handlers removed after proving zero call sites | ✅ |
| 7 | `feat(data): add save status, undo, and JSON export/import` | ✅ |

Every gate re-runs: full Vitest suite, browser probe, production build, JS/CSS
byte comparison, leak checks, fixture/reference integrity, and confirmation that
the 22 untracked user files are untouched.

---

## 1. Architecture

- Durable base tables live in **`app_private`**. The `public` schema contains **only functions**.
- The browser receives **no INSERT/UPDATE/DELETE privileges** on any table.
- All mutations go through narrowly granted `SECURITY DEFINER` RPCs with empty
  `search_path`, fully qualified objects, explicit workspace-role checks,
  expected-revision conflict checks, and transactional undo/seed handling.
- Public reads use explicitly scoped, sanitized `SECURITY DEFINER` read functions
  with exhaustive return shapes and a workspace slug.
- RLS stays enabled on base tables as defense in depth.
- `ON UPDATE RESTRICT` and `ON DELETE RESTRICT` everywhere except
  `workspace_members.user_id`, which cascades from `auth.users`.
- `BEFORE UPDATE` revision triggers with a storage-only `row_updated_at`,
  distinct from the durable domain `updatedAt` on Event/Bout.
- Model inference stays client-side. No `/predict` endpoint, no server-side
  inference, no recomputation of model values on database read.
- `SCHEMA_VERSION` 1 becomes durable at Stage 7's first successful write. Every
  incompatible change after that requires a version increment and a forward
  migration.

### Three non-login roles

| Role | Owns | Never owns |
|---|---|---|
| `fm_table_owner` | base tables, sequences, indexes, triggers, `app_private` helpers | any callable public API function |
| `fm_public_reader` | `public.fm_read_*` | tables |
| `fm_member_api` | `public.fm_member_*`, `public.fm_rpc_*` | tables |

RLS is **enabled, not blanket-FORCEd**: `fm_table_owner` owns the tables and owns
no callable function, so the two roles that API functions actually run as are
non-owners and are fully bound by policy.

`app_private.is_member` is `SECURITY DEFINER` owned by `fm_table_owner`, so it
bypasses RLS on `workspace_members` and the membership policies are
**non-recursive**.

**`auth.uid()` is NOT used — nothing in the schema touches the `auth` schema.**
Corrected at Gate 2, where calling it made the entire authenticated API
unusable: every `fm_` function raised `permission denied for schema auth`,
because no `fm_` role holds `USAGE` on `auth`. Granting it was both wider than
needed and impossible — `auth` is owned by `supabase_admin` and `postgres` holds
`USAGE` without `GRANT OPTION`, so the grant silently emits
`WARNING 01007 no privileges were granted for "auth"` and changes nothing.
`app_private.current_user_id()` reads the same request GUCs `auth.uid()` reads
(`request.jwt.claim.sub`, falling back to `request.jwt.claims ->> 'sub'`) and
needs no schema access at all. Referential integrity against `auth.users` needs
no grant either: Postgres runs RI checks internally and skips ACL checks, which
the membership-insert tests prove directly.

### The zero-owner bootstrap must be one table-owner operation

`workspace_members_write` requires an owner to already exist, so `fm_member_api`
can never insert the **first** owner: the claim failed with `new row violates
row-level security policy for table workspace_members`. Splitting "lock" from
"insert" cannot fix it — the insert is the part RLS refuses.

`app_private.claim_workspace_ownership(slug, user)` therefore performs the whole
bootstrap — `SELECT … FOR UPDATE`, re-check, `INSERT` — as `fm_table_owner`,
which owns `workspace_members` and so is not subject to its policies (RLS is
enabled, deliberately **not** `FORCE`d). Granted only to `fm_member_api`.

The design preserves the concurrency guarantee *because* the re-check sits inside
the same transaction as the row lock: a second claimant blocks on the lock, then
observes the owner the first one inserted and receives `claimed`.

**That guarantee is not yet tested.** The Gate 2 behavioural test is
**sequential** — claimant A completes, then claimant B is attempted — so it
proves only that *a later claimant is refused once an owner exists*. Genuine
two-session concurrency, in which one transaction blocks on the lock and exactly
one of two overlapping claimants wins, requires two connections and is
**outstanding for `test:api`**. It must not be described as concurrency-tested
until two sessions actually overlap.

### `postgres` receives no `app_private` privilege from this migration

**No schema `USAGE`, no table DML, no helper `EXECUTE`.** An earlier revision
granted all three so the pgTAP harness could build fixtures without `SET ROLE`,
on the argument that `ADMIN OPTION` already made them free. That was wrong.
`ADMIN OPTION` is a **capability the operator must deliberately exercise**; it
confers no table DML by itself. A permanent grant widens what `postgres` can do
*right now, in every session*, and collapses precisely the distinction this
contract exists to preserve. Test convenience is never a reason to hold a
production privilege.

Residual `SELECT` visibility for `postgres` is **not** from this migration:
Supabase makes `postgres` an inheriting member of the platform-owned built-in
role `pg_read_all_data`, which confers `USAGE` on every schema and `SELECT` on
every table cluster-wide. It is read-only, pre-existing, outside this schema's
control, and the catalog suite names it explicitly rather than quietly dropping
the assertion. What the suite *does* assert is that `postgres` holds **no write**
on any `app_private` table and appears in **no** `app_private` ACL entry.

The pgTAP suites obtain what they need **transaction-locally**:

```sql
GRANT USAGE ON SCHEMA extensions TO fm_table_owner;   -- pgTAP lives there
GRANT fm_table_owner TO postgres WITH SET TRUE, INHERIT FALSE;
SET LOCAL ROLE fm_table_owner;
```

`ROLLBACK` at the end of each file removes both, leaving the automatic
admin-only membership row untouched. The `extensions` `USAGE` grant is
load-bearing and easy to misdiagnose: **a schema on the `search_path` is still
skipped during function lookup when the active role lacks `USAGE` on it**, so
the missing grant surfaces as `function is(text, text, unknown) does not exist`
— which reads like a resolution failure, not a privilege one. Neither grant
belongs in the production migration; no `fm_` role needs `extensions` at
runtime.

### Workspace identity

Stage 6 IDs are deterministic (`eventIdFor` derives from `promotion|date|name`),
so two workspaces migrating the same seed would produce identical UUIDs. Every
table therefore uses `PRIMARY KEY (workspace_id, id)` with **composite foreign
keys**, making cross-workspace references structurally impossible.

Slug: immutable, lowercase, constrained `text` (no `citext` extension),
`fightmetrics`.

---

## 2. Role creation and ownership transfer

Supabase's hosted `postgres` is not a true superuser, so ownership transfer needs
real membership, and each function owner needs `CREATE` on its schema. One
transaction, in this order — steps 5–7 are ordered deliberately, because
revoking membership before the ACL step would leave the migration role unable to
grant on objects it no longer co-owns.

```sql
BEGIN;

-- (0) idempotent role creation. Roles are cluster-level while `db reset`
--     rebuilds only the database, so a bare CREATE ROLE would succeed on the
--     first reset and fail on every one after.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'fm_table_owner')
    THEN CREATE ROLE fm_table_owner NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'fm_public_reader')
    THEN CREATE ROLE fm_public_reader NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'fm_member_api')
    THEN CREATE ROLE fm_member_api NOLOGIN; END IF;
END $$;

-- (1) temporary SET ROLE capability for the migration role
DO $$ BEGIN
  EXECUTE format('GRANT fm_table_owner, fm_public_reader, fm_member_api TO %I', current_user);
END $$;

-- (2) temporary CREATE for the two function owners
GRANT CREATE ON SCHEMA public TO fm_public_reader, fm_member_api;

-- (3) create schema, tables, indexes, triggers, helpers, all fm_ functions

-- (4) transfer ownership
ALTER SCHEMA app_private OWNER TO fm_table_owner;
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT c.relname, c.relkind FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind IN ('r','S') LOOP
    EXECUTE format('ALTER %s app_private.%I OWNER TO fm_table_owner',
                   CASE r.relkind WHEN 'r' THEN 'TABLE' ELSE 'SEQUENCE' END, r.relname);
  END LOOP;
  FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_proc p
             JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'app_private' LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO fm_table_owner', r.sig);
  END LOOP;
  FOR r IN SELECT p.oid::regprocedure AS sig, p.proname FROM pg_proc p
             JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_%' LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO %I', r.sig,
      CASE WHEN r.proname LIKE 'fm\_read\_%' THEN 'fm_public_reader' ELSE 'fm_member_api' END);
  END LOOP;
END $$;

-- (5) revoke CREATE immediately
REVOKE CREATE ON SCHEMA public FROM fm_public_reader, fm_member_api;

-- (6) FINAL ACLs — before the membership revoke
REVOKE EXECUTE ON FUNCTION public.fm_read_roi(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.fm_read_roi(text) TO anon, authenticated;
-- … one explicit pair per function; table GRANT/REVOKE blocks per §4 …

-- (7) drop the temporary memberships LAST. Plain REVOKE, which deletes the
--     working row. It cannot and must not touch the implicit admin-option row
--     Postgres created in step 0 — see "Catalog tests" below.
DO $$ BEGIN
  EXECUTE format('REVOKE fm_table_owner, fm_public_reader, fm_member_api FROM %I', current_user);
END $$;

COMMIT;
```

**Repeatability is proven by two consecutive clean `supabase db reset` runs**,
with the full pgTAP catalog suite after each, asserting identical owners, ACLs
and zero residual *privilege-conferring* memberships both times. Run 2 is the
load-bearing one: roles are cluster-level and survive the reset, so it is the
run that exercises the idempotent branch of step 0 and the re-grant in step 1.

### Catalog tests (pgTAP, Gate 2)

- schema owner is `fm_table_owner`
- every `app_private` table, sequence and index owned by `fm_table_owner`
- every `public.fm_read_*` owned by `fm_public_reader`; every `fm_member_*` /
  `fm_rpc_*` owned by `fm_member_api`
- **no callable public `fm_` function owned by `fm_table_owner`**
- `prosecdef = true` on every **public** `fm_` function. Corrected at Gate 2 from
  "every `fm_` function and every `app_private` helper": the pure immutable
  helpers are deliberately `INVOKER`, because they touch no table and `DEFINER`
  would add privilege without adding capability. The three helpers that DO read
  tables — `is_member`, `workspace_has_owner`, `lock_unclaimed_workspace` — are
  `DEFINER`, which is what makes the membership policies non-recursive.
- `proconfig @> ARRAY['search_path=""']` on every `fm_` function and every
  `app_private` helper. Corrected at Gate 2: Postgres stores `SET search_path =
  ''` as the literal `search_path=""`, so the plan's original
  `ARRAY['search_path=']` could never match — measured, it reported all 24
  functions as failing while every one of them pins the path correctly.
- RLS enabled on every `app_private` table
- ACLs compared with normalized **`aclexplode`** rows via `set_eq`, never
  `array_to_string(proacl)`, whose ordering is not a stable contract
- all `fm_*` roles remain `NOLOGIN`
- **no non-`fm_` role retains an IMMEDIATE-DATA-ACCESS-CONFERRING membership in
  any `fm_` role**, with exactly one documented exception per `fm_` role — see
  below.

#### The unavoidable `ADMIN OPTION` exception

Corrected at Gate 2 from "no membership at all", which is unsatisfiable and
would itself break repeatability. Measured on the local stack (PG 17.6, Supabase
`postgres` with `rolsuper = f`, i.e. the hosted condition):

| stage | admin | inherit | set |
|---|---|---|---|
| after `CREATE ROLE fm_x` by `postgres` | `t` | `f` | `f` |
| after `GRANT fm_x TO postgres` (second row) | `f` | `t` | `t` |
| after plain `REVOKE fm_x FROM postgres` | `t` | `f` | `f` (one row left) |

Postgres records an implicit `ADMIN OPTION` membership for the creating role
whenever a non-superuser creates a role. Its grantor is `supabase_admin`, so
`postgres` cannot revoke it; it is cluster-level, so it survives `db reset`. It
is load-bearing: remove it and `postgres` can no longer grant the roles to
itself, so step 1 of the second reset fails.

**`ADMIN OPTION` is not privilege-free.** It confers no *immediate* data access,
because `INHERIT = false` and `SET = false` — but it is an administrative
capability. `postgres` can use it to grant itself, or any other role, `SET` or
`INHERIT` at any time. PostgreSQL documents the automatic grant as a safeguard
against accidentally creating unreachable roles, **not** as a security boundary.

`postgres` is therefore treated as the **trusted migration/operator role**. This
control prevents automatic or immediate use of `fm_` role privileges; it does
**not** defend against a malicious trusted `postgres` operator, who can exercise
the unavoidable `ADMIN OPTION` at will. Defending against that requires
cluster-level controls outside this schema.

After each reset, for **each** `fm_*` role, assert:

| # | Assertion |
|---|---|
| 1 | exactly one permitted non-`fm_` membership row |
| 2 | its member is `postgres` |
| 3 | its grantor is `supabase_admin` (local Supabase stack) |
| 4 | `admin_option = true` |
| 5 | `inherit_option = false` |
| 6 | `set_option = false` |
| 7 | `pg_has_role('postgres', role, 'MEMBER') = true` |
| 8 | `pg_has_role('postgres', role, 'SET') = false` |
| 9 | `pg_has_role('postgres', role, 'USAGE') = false` |
| 10 | direct `SET ROLE <fm_role>` fails |
| 11 | no other non-`fm_` member rows, no temporary working rows, no all-false zombie rows |

Step 7 uses a plain `REVOKE`, which removes the temporary `INHERIT`/`SET` row
outright and leaves the automatic admin-only row the second reset needs.
`REVOKE SET OPTION FOR` / `REVOKE INHERIT OPTION FOR` are explicitly NOT used:
measured, they leave an all-false zombie row rather than deleting anything.
- `has_schema_privilege('fm_public_reader','public','CREATE')` is false; same for
  `fm_member_api`

---

## 3. Immutable helpers

```sql
app_private.jsonb_key_count(jsonb) -> int
app_private.is_string_map(jsonb) -> boolean
app_private.is_js_double_map(jsonb) -> boolean
app_private.is_finite_or_null(double precision) -> boolean
app_private.array_is_distinct(text[]) -> boolean
app_private.finish_leaders_expected(int,int,int) -> text[]
app_private.is_american_odds_or_null(int) -> boolean
app_private.is_iso_date(text) -> boolean
app_private.is_cutoff(jsonb) -> boolean
app_private.is_source_manifest(jsonb) -> boolean
app_private.decimal_from_american(int) -> double precision
app_private.parse_positive_decimal(text) -> numeric
app_private.bump_revision() -> trigger
app_private.forbid_slug_change() -> trigger
app_private.is_member(uuid, text[]) -> boolean            [DEFINER, fm_table_owner]
app_private.workspace_has_owner(uuid) -> boolean          [DEFINER, fm_table_owner]
app_private.lock_unclaimed_workspace(text) -> (uuid,text) [DEFINER, fm_table_owner]
app_private.assert_settlement_row(...) -> void
app_private.trg_assert_position() -> trigger
app_private.trg_assert_bout_dependents() -> trigger
```

Postgres forbids subqueries in `CHECK`, so `SELECT count(*) FROM
jsonb_object_keys(...)` is illegal inline — the immutable helper is required, not
optional. `make_date` is `IMMUTABLE` and raises on impossible dates, which is why
`is_iso_date` can honestly be `IMMUTABLE`.

Key definitions:

```sql
-- Postgres treats NaN = NaN as TRUE, so `v <> 'NaN'` is the correct rejection.
CREATE FUNCTION app_private.is_finite_or_null(v double precision) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = '' AS $$
  SELECT v IS NULL OR (v <> 'NaN'::double precision
                   AND v <> 'Infinity'::double precision
                   AND v <> '-Infinity'::double precision)
$$;

-- Canonical argmax set: binds order, membership, distinctness and cardinality.
-- `dec_pct`, not `dec`: DEC is a SQL keyword (synonym for DECIMAL) and will not
-- parse as a bare parameter name. Corrected at Gate 2 — the original signature
-- failed with `syntax error at or near "int"`.
CREATE FUNCTION app_private.finish_leaders_expected(ko int, sub int, dec_pct int) RETURNS text[]
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
  SELECT ARRAY(SELECT label FROM (VALUES ('KO/TKO',ko,1),('SUB',sub,2),('DEC',dec_pct,3))
               AS t(label,pct,ord) WHERE pct = GREATEST(ko,sub,dec_pct) ORDER BY ord)
$$;

-- Range and underflow protection. NOT full JSON-number canonicalization:
-- 0.1000000000000000055511151231257827 and 0.1 both pass and parse to the same
-- double. Canonical form is enforced by the repository adapter, which round-trips
-- through String()/Number() and rejects anything failing Object.is.
CREATE FUNCTION app_private.is_js_double_map(j jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
  SELECT jsonb_typeof(j) = 'object'
     AND NOT EXISTS (
       SELECT 1 FROM jsonb_each(j) AS e(k, v)
       WHERE jsonb_typeof(e.v) <> 'number'
          OR (e.v #>> '{}') ~ '^-0(\.0+)?([eE][+-]?[0-9]+)?$'
          OR ((e.v #>> '{}')::numeric <> 0
              AND (abs((e.v #>> '{}')::numeric) < 5e-324::numeric
                OR abs((e.v #>> '{}')::numeric) > 1.7976931348623157e308::numeric)))
$$;

-- 32-char bound is MEASURED: over a 699,826-value seeded corpus the longest
-- String(finite positive double) was 24 chars (0.0000057692833136856875).
-- MAX_VALUE is 23, MIN_VALUE is 6. NO per-component caps: a {1,20} fractional
-- cap rejected 12,823 of those values (1.8%), including the 24-char maximum.
CREATE FUNCTION app_private.parse_positive_decimal(t text) RETURNS numeric
LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
DECLARE v numeric;
BEGIN
  IF length(t) > 32 THEN RAISE EXCEPTION 'stake string too long'; END IF;
  IF t !~ '^(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?$' THEN
    RAISE EXCEPTION 'not a canonical positive decimal: %', t; END IF;
  v := t::numeric;
  IF v <= 0 THEN RAISE EXCEPTION 'value must be > 0: %', t; END IF;
  RETURN v;
END $$;
```

`source_manifest` validation requires each module to carry exactly its eight
fields, with nonempty strings including for `note` and `maxObservedEventDate`
when they are present rather than null.

---

## 4. Tables

Full DDL is applied at Gate 2. Shape summary:

`workspaces` · `workspace_members` · `events` · `bouts` · `prediction_runs` ·
`prediction_snapshots` · `market_snapshots` · `betting_assessments` ·
`tracked_positions` · `wagers` · `props` · `parlays` · `parlay_legs` ·
`seed_items` · `undo_log`

**Frequently-updated unions are normalized into columns**, not JSONB, so
Postgres validates timestamps natively — an immutable JSONB timestamp CHECK is
unachievable because `text::timestamptz` is STABLE. Export reconstructs the exact
Stage 6 union. JSONB survives only for genuinely open bags: `external_ids`,
`feature_vector`, `source_manifest`, `fight_history_cutoff`.

Immutable tables — `prediction_runs`, `prediction_snapshots`, `market_snapshots`,
`betting_assessments`, `parlays`, `parlay_legs` — receive **no UPDATE grant and
no UPDATE policy**, denied twice.

### Relationship enforcement — composite FKs carrying the discriminator

Separate single-column FKs cannot stop a snapshot naming one run while carrying
another run's bout. The discriminating column goes **inside** the referenced key.

| Referencing | References | Prevents |
|---|---|---|
| `prediction_snapshots (ws, run_id, bout_id)` | `prediction_runs (ws, id, bout_id)` | snapshot bout ≠ run bout |
| `prediction_runs (ws, decision_snapshot_id, id, bout_id)` | `prediction_snapshots (ws, id, run_id, bout_id)` | decision snapshot from another run/bout |
| `betting_assessments (ws, prediction_snapshot_id, run_id, bout_id)` | `prediction_snapshots (ws, id, run_id, bout_id)` | assessment mixing run/snapshot/bout |
| `betting_assessments (ws, market_snapshot_id, bout_id)` | `market_snapshots (ws, id, bout_id)` | market from another bout |
| `tracked_positions`/`wagers (ws, assessment_id, bout_id)` | `betting_assessments (ws, id, bout_id)` | assessment from another bout |
| `tracked_positions`/`wagers (ws, market_snapshot_id, bout_id)` | `market_snapshots (ws, id, bout_id)` | price from another bout |
| `props (ws, target_bout_id, event_id)` | `bouts (ws, id, event_id)` | prop event ≠ bout event |

Nullable composite FKs use default `MATCH SIMPLE`, so a NULL id skips the check —
the desired nullable-FK behaviour.

### The run ↔ snapshot cycle

`prediction_runs.decision_snapshot_id → prediction_snapshots` and
`prediction_snapshots.run_id → prediction_runs` form a genuine cycle, so under
`ON DELETE RESTRICT` neither can be deleted first. **Only** the constraints
closing that cycle (plus the two assessment FKs that participate) are
`DEFERRABLE INITIALLY IMMEDIATE`; unrelated FKs stay non-deferrable.

```sql
SET CONSTRAINTS app_private.run_decision_snapshot_fk,
                app_private.prediction_snapshots_run_fk,
                app_private.betting_assessments_run_fk,
                app_private.betting_assessments_snapshot_fk DEFERRED;
-- delete position → assessment → markets → snapshots → run
-- constraints re-checked at COMMIT; a surviving reference aborts
```

`SET CONSTRAINTS` is transaction-local, so deferral never leaks.

**The cyclic pair is `ON DELETE NO ACTION`, not `RESTRICT`.** Corrected at Gate 2.
`RESTRICT` is checked **immediately even when the constraint is declared
`DEFERRABLE`** — that is exactly what distinguishes it from `NO ACTION` — so a
deferrable `RESTRICT` is a contradiction and the deletion ordering above could
never have worked. Measured, after `SET CONSTRAINTS … DEFERRED`:

```
ERROR: update or delete on table "prediction_snapshots" violates foreign key
constraint "run_decision_snapshot_fk" on table "prediction_runs"
```

`RESTRICT` remains the default for every FK in the schema. The exception is
exactly two constraints — `prediction_snapshots_run_fk` and
`run_decision_snapshot_fk`, the genuinely cyclic pair — which are
`ON UPDATE RESTRICT ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE`.

The two assessment FKs are **no longer deferrable**. Assessments are not part of
the cycle: they are inserted after their run and snapshot and deleted before
them, so immediate `RESTRICT` is sufficient, and declaring them deferrable
advertised a capability that was never needed or tested.

The catalog suite asserts that exactly those two FKs are deferrable, exactly
those two use `NO ACTION`, no FK is `INITIALLY DEFERRED`, every other FK is an
immediate `RESTRICT`, and exactly the two `auth.users` references cascade. The
behavioural suite proves an isolated cycle deletes in the documented order when
deferred, and that a genuinely surviving reference still aborts (`23503`) when
the constraints are forced immediate.

### Numeric output fidelity: `extra_float_digits = 3`

PostgREST returns `float8` using `extra_float_digits`, and at the default `0`
Postgres emits a shortened representation rather than the round-trip-exact one.
Measured on one stored probability:

| | bits |
|---|---|
| stored `pB` | `3fdd3c07fb4c98e4` |
| over HTTP, `extra_float_digits = 0` | `3fdd3c07fb4c98e3` |
| over HTTP, `extra_float_digits = 3` | `3fdd3c07fb4c98e4` |

One ULP, silently, on **every numeric leaf that crosses the API** — which would
break the export round-trip and the complementarity contract without any error.
The migration therefore sets it on the database, so a fresh connection inherits
it:

```sql
DO $$ BEGIN
  EXECUTE format('ALTER DATABASE %I SET extra_float_digits = 3', current_database());
END $$;
```

The identifier is quoted through `format(%I)` rather than hard-coded. The catalog
suite asserts the database setting, and it is part of the reset-to-reset
fingerprint.

### Settlement contract (deferred constraint triggers)

`app_private.assert_settlement_row` enforces, for both tracked positions and
wagers, each against **its own** `market_snapshot_id`:

- bout pending ⟺ dependent row open
- resolved `A`/`B` ⟹ settled as won/lost **by the selected corner**
- `draw` ⟹ push · `noContest` ⟹ void
- push/void ⟹ computed profit exactly `0`
- selected corner priced ⟹ `computed`; unpriced ⟹ `uncomputable`
- computed profit equals `stake × (decimal − 1)` on a win, `−stake` on a loss

A deferred trigger on `bouts` re-checks **every** dependent position and wager
after grading or return-to-pending.

Profit equality is exact (`<>`, no epsilon) because recomputing all 152 stored
computed rows in JS reproduced them bit-for-bit, deviation `0`. **Gate 2 re-runs
this in real Postgres; if any row deviates, the smallest sufficient bound is
measured there and only that comparison changes.**

Likewise `CHECK (prob_a + prob_b = 1)` is retained **provisionally** — all 237
stored pairs satisfy it exactly. Gate 2 tests the full path (browser JSON →
PostgREST → `float8` → response → JS) before it is accepted as final.

---

## 5. Read surfaces

| Surface | Owner | Audience | Contains |
|---|---|---|---|
| `fm_read_*` | `fm_public_reader` | anon + anyone | **public workspaces only** — sanitized projections |
| `fm_member_*` | `fm_member_api` | members | same fields **plus `revision` tokens and editable fields** |
| `fm_member_export_store` | `fm_member_api` | members | the complete Stage 6 store, export only |

An `fm_public_reader`-owned function can only ever see public workspaces, so
`fm_read_*` returns nothing for a private workspace **even to a member**. That is
its documented contract. Members use `fm_member_*`.

**Routing is by resolved membership, not session presence.** The repository calls
`public.fm_member_whoami(p_slug)` once per session; signed-in **non-members read
through the public fallback**, exactly like anonymous visitors.

Public surfaces expose: events `id,name,date,promotion`; bouts
`id,event_id,division,corner_a_name,corner_b_name,result_*,board_order`;
roi/upcoming `tracked_position_id,bout_id,event_id,event_name,event_date,
division,corner names,tracked_corner,stake_units::text,prob_a,prob_b,
winner_corner,tier,recommended_corner,fair_line_*,edge_*,ev_*,kelly_*,
tracked_odds_*,result_*,settlement fields,review_status,finish_*`; plus props and
parlays.

**Excluded from every public surface:** `feature_vector`, `source_manifest`,
`reconstruction*`, `fight_history_cutoff`, `model_coef_hash`, `legacy_entry_id`,
`notes`, `fighter_key`, `fighter_id`, `external_ids`, `origin`, `stake_source`,
`row_updated_at`, `revision`, `workspace_members`, `seed_items`, `undo_log`.
Finish projections, fair lines, edge, EV and Kelly **are** public — the app
already displays them.

Return columns are enumerated, never `SELECT *`, so an added base column cannot
leak. Each public function's returned key set is asserted to equal its documented
list exactly.

### REPOSITORY_CONTRACT → implementation: EXHAUSTIVE audit

All **46** methods of `REPOSITORY_CONTRACT`, every one classified. An earlier
partial version listed only the non-mutation methods and silently omitted
`eventRepository.rename`, `wagerRepository.create/settle/remove` and
`workspaceRepository.setSeedVersion`; this table exists so no contract method can
disappear again.

Legend — **SQL**: implemented and tested · **RPC**: planned server mutation ·
**client**: satisfied client-side from an existing surface, no SQL of its own ·
**contract**: needs a contract change before it can be implemented.

| # | Contract method | Class | Implementation / plan |
|---|---|---|---|
| 1 | `eventRepository.list` | SQL | `fm_read_events` / `fm_member_events` |
| 2 | `eventRepository.get` | client | filter of the list surfaces |
| 3 | `eventRepository.listWithBoutCounts` | SQL | public: `fm_read_events` + `fm_read_bouts`; members: `fm_member_events.bout_count` |
| 4 | `eventRepository.rename` | RPC | **`fm_rpc_rename_event`** — cluster 6. Card-wide; must return `affectedBouts` for the required UI warning |
| 5 | `boutRepository.listByEvent` | SQL | `fm_read_bouts` / `fm_member_bouts` |
| 6 | `boutRepository.get` | client | filter of the bout surfaces |
| 7 | `boutRepository.listPendingResults` | client | filter `result_status='pending'` on either bout surface |
| 8 | `predictionRepository.listPending` | SQL | `fm_read_upcoming` / `fm_member_upcoming` |
| 9 | `predictionRepository.listGraded` | SQL | `fm_read_roi` / `fm_member_roi` |
| 10 | `predictionRepository.getAggregate` | RPC | **`fm_member_prediction_aggregate`** — cluster 4, with `save_prediction_run` |
| 11 | `predictionRepository.savePrediction` | RPC | **`fm_rpc_save_prediction_run`** — cluster 4. Also closes the HTTP write leg for complementarity |
| 12 | `predictionRepository.remove` | SQL | ✅ `fm_rpc_delete_pending_run` — cluster 4; conflict-checked on the tracked position, prunes proven orphans, tombstones the root, undo-restores via `absent_ids` |
| 13 | `predictionRepository.clearGraded` | SQL | ✅ `fm_rpc_clear_graded` — cluster 4; owner-only, vector over every graded position, one undo entry restores the whole clear |
| 14 | `predictionRepository.grade` | SQL | ✅ `fm_rpc_grade_bout` |
| 15 | `predictionRepository.returnToPending` | SQL | ✅ `fm_rpc_return_bout_to_pending` |
| 16 | `predictionRepository.changeTrackedCorner` | SQL | ✅ `fm_rpc_change_tracked_corner` |
| 17 | `predictionRepository.amendTrackedPrice` | SQL | ✅ `fm_rpc_amend_tracked_price` |
| 18 | `predictionRepository.confirmEntry` | SQL | ✅ `fm_rpc_confirm_entry` |
| 19 | `predictionRepository.confirmAllPending` | RPC | **`fm_rpc_confirm_all_pending`** — cluster 5; vector over every pending position |
| 20 | `wagerRepository.listByBout` | SQL | ✅ `fm_member_wagers_by_bout` |
| 21 | `wagerRepository.create` | RPC | **`fm_rpc_create_wager`** — cluster 5. **Must take the bout lock**: it creates a dependent of a bout that may be grading |
| 22 | `wagerRepository.updateStake` | RPC | **`fm_rpc_update_stake`** — cluster 5 |
| 23 | `wagerRepository.updateNotes` | RPC | **`fm_rpc_update_notes`** — cluster 5 |
| 24 | `wagerRepository.settle` | RPC | **`fm_rpc_settle_wager`** — cluster 5; must respect the settlement contract |
| 25 | `wagerRepository.remove` | RPC | **`fm_rpc_delete_wager`** — cluster 5 |
| 26 | `propRepository.list` | SQL | `fm_read_props` / `fm_member_props` |
| 27 | `propRepository.create` | RPC | **`fm_rpc_save_prop`** — cluster 6 |
| 28 | `propRepository.settle` | RPC | **`fm_rpc_settle_prop`** — cluster 6 |
| 29 | `propRepository.remove` | RPC | **`fm_rpc_delete_prop`** — cluster 6; tombstones the root |
| 30 | `parlayRepository.list` | SQL | `fm_read_parlays` / `fm_member_parlays` |
| 31 | `parlayRepository.create` | RPC | **`fm_rpc_save_parlay`** — cluster 6; parlay + legs atomically |
| 32 | `parlayRepository.remove` | RPC | **`fm_rpc_delete_parlay`** — cluster 6; tombstones the root |
| 33 | `statisticsRepository.statisticsInput` | SQL | `fm_read_statistics_input` / `fm_member_statistics_input` |
| 34 | `workspaceRepository.current` | RPC | **`fm_member_workspace`** — cluster 7 |
| 35 | `workspaceRepository.seedVersion` | RPC | **`fm_member_seed_version`** — cluster 7 |
| 36 | `workspaceRepository.setSeedVersion` | RPC | **`fm_rpc_set_seed_version`** — cluster 7, owner-only; pairs with `fm_rpc_seed_store` at Gate 3 |
| 37 | `workspaceRepository.exportStore` | SQL | ✅ `fm_member_export_store`, validated against the real `StoreSchema` |
| 38 | `workspaceRepository.importStore` | RPC | **`fm_rpc_import_store`** — cluster 7; backup-confirmed, one transaction |
| 39 | `workspaceRepository.reset` | RPC | **`fm_rpc_reset_workspace`** — cluster 7; backup-confirmed |
| 40 | `undoRepository.list` | SQL | ✅ `fm_member_undo_list` (`prior_state` deliberately withheld — server-only restore data) |
| 41 | `undoRepository.undo` | SQL | ✅ `fm_rpc_undo` — cluster 3, extended in cluster 4; consumes `revision_vector`, `created_ids` and (cluster 4) `absent_ids`, re-inserting deleted aggregates |
| 42 | `authRepository.session` | client | Supabase session; no SQL surface |
| 43 | `authRepository.whoami` | SQL | ✅ `fm_member_whoami` |
| 44 | `authRepository.signIn` | client | Supabase magic link — Gate 4 |
| 45 | `authRepository.signOut` | client | Supabase session — Gate 4 |
| 46 | `authRepository.claimOwnership` | SQL | ✅ `fm_rpc_claim_workspace_ownership` |

**Totals — these are the authoritative numbers, and they sum to 46:**

| Class | Count |
|---|---|
| Implemented, SQL-backed contract methods | **21** |
| Planned read surfaces (`getAggregate`, `workspace.current`, `seedVersion`) | **3** |
| Planned mutation methods | **16** |
| Client-only (no SQL surface of their own) | **6** |
| **Total contract methods** | **46** |

An earlier revision of this table reported 14 / 22 / 6 plus "4 extra read
surfaces". That was wrong twice over: it undercounted the implemented methods,
and it treated the public/member variants as if they were additional contract
entries. **The `fm_read_*` and `fm_member_*` pairs are implementation surfaces
for a single contract method, not separate methods.** `eventRepository.list` is
one contract method served by two functions; it is counted once.

### Cluster order

Revised so undo is **built with** the operations it must invert rather than
after all of them:

| # | Cluster | Contents |
|---|---|---|
| 3 | **Undo foundation** | `fm_rpc_undo` covering every operation already implemented — tracked-corner change, price amendment, confirmation, grade, return-to-pending. Consumes and validates the existing `revision_vector`, `created_ids` and `prior_state`; enforces TTL, creator and workspace scope, single use, conflict detection and atomic rollback. |
| 4 | **Deletion** | ✅ `delete_pending_run`, `clear_graded`, and the `absent_ids` restoration path added to undo here, where the first rows are actually deleted. **Reconciled at cluster 4:** deletion is by RUN ROOT only, per the frozen `REPOSITORY_CONTRACT` (`predictionRepository.remove` and `clearGraded`) and the in-memory reference (`deleteAggregate(runId)`). There is no `delete_tracked_position` — a position is 1:1 with its aggregate root and has no independent delete in the contract, so the earlier §6 line for it was withdrawn (see §6). §5 already fixes `fm_rpc_seed_store` as the *only* non-contract RPC. |
| 5 | **Prediction save** | `save_prediction_run`, `getAggregate`. Closes the HTTP write leg for complementarity. Takes the bout lock: it creates dependents. |
| 6 | **Wagers** | `create`, `updateStake`, `updateNotes`, `settle`, `remove`. Bout-lock-bound. |
| 7 | **Props, parlays, rename** | `confirm_all_pending`, prop and parlay mutations, `rename_event`. |
| 8 | **Workspace** | `current`, `seedVersion`, `setSeedVersion`, `import_store`, `reset_workspace`. |

**Every cluster from 4 onward extends `fm_rpc_undo` and its tests in the same
commit.** Undo is never left as a trailing obligation. The reason was concrete:
`revision_vector`, `created_ids` and `absent_ids` had been written but never
consumed, so the undo contract was unproven — and building destructive
operations on top of undo records never shown sufficient would mean discovering
any inadequacy after the hardest code depends on it. **Cluster 3 consumed
`revision_vector` and `created_ids`; cluster 4 consumed `absent_ids`**, so the
undo contract is now proven for both the in-place operations and deletion. A
deleted aggregate is re-inserted from `prior_state` (captured column-complete via
`to_jsonb`, restored via `jsonb_populate_record`, immutable rows with plain
`INSERT` never `ON CONFLICT DO UPDATE`, the run↔snapshot cycle deferred), after
`assert_ids_absent` proves every removed id is still gone; the root is
un-tombstoned. A populated `absent_ids` on any op that is *not* a deletion still
raises `0A000` `undoUnsupportedRestore`.

### Mutation progress, stated exactly

- **9 of the contract's 25 mutation methods are implemented**:
  `grade`, `returnToPending`, `changeTrackedCorner`, `amendTrackedPrice`,
  `confirmEntry`, `claimOwnership`, `undo`, `remove`, `clearGraded`.
- **16 contract mutation methods remain.**
- **Outside the repository contract** there is one further planned RPC,
  `fm_rpc_seed_store` (Gate 3), which no contract method maps to — it exists to
  populate a workspace, not to serve the repository. It must not be counted
  against the 46.

The loose phrase "6 of ~20 RPCs" is withdrawn: it conflated contract methods
with SQL functions and had no stable denominator.

No method is classified `contract` — nothing in the contract is currently
unimplementable as written.

### Statistics stay in JavaScript

`fm_read_statistics_input` returns a **sanitized projection shaped like the legacy
entry** — the contract the existing domain readers already consume. **No ROI,
calibration, tier, probability, settlement or frozen value is ever computed in
SQL.** `src/domain/statistics` remains the single implementation, so the existing
tests keep their meaning.

---

## 6. RPCs

Every mutation: `SECURITY DEFINER`, empty `search_path`, fully qualified,
explicit role check, `p_expected_revision`, `EXECUTE` revoked from `anon`,
returns `revision text`.

| RPC | Auth | Transaction scope | Undo | Tombstone |
|---|---|---|---|---|
| `fm_rpc_seed_store` | owner | 13 tables + `seed_items` + `seed_version` | ✗ | creates 164 roots |
| `fm_rpc_save_prediction_run` | owner/editor | event+bout+run+snapshots+market+assessment+position | ✓ delete | ✗ |
| `fm_rpc_grade_bout` | owner/editor | bout result + every settlement on it | ✓ vector | ✗ |
| `fm_rpc_return_bout_to_pending` | owner/editor | inverse of grade | ✓ vector | ✗ |
| `fm_rpc_change_tracked_corner` | owner/editor | `corner` only | ✓ | ✗ |
| `fm_rpc_amend_tracked_price` | owner/editor | new market + repoint position | ✓ | ✗ |
| `fm_rpc_update_stake` / `_notes` | owner/editor | one column | ✓ | ✗ |
| `fm_rpc_confirm_entry` | owner/editor | review → confirmed + timestamp | ✓ | ✗ |
| `fm_rpc_confirm_all_pending` | owner/editor | all pending positions | ✓ vector | ✗ |
| `fm_rpc_delete_pending_run` ✅ | owner/editor | aggregate + proven orphans | ✓ re-INSERT | root |
| `fm_rpc_clear_graded` ✅ | owner | all graded aggregates | ✓ re-INSERT | all cleared roots |
| `fm_rpc_save_prop` / `_settle_prop` / `_delete_prop` | owner/editor | prop | ✓ | root on delete |
| `fm_rpc_save_parlay` / `_delete_parlay` | owner/editor | parlay + legs | ✓ | root on delete |
| `fm_rpc_import_store` | owner | delete-all + insert-all + ledger reset | ✗ backup | reset |
| `fm_rpc_reset_workspace` | owner | entities + ledger + `seed_version := NULL` | ✗ backup | cleared |
| `fm_rpc_undo` | owner/editor | inverse of one entry | single-use | restores |
| `fm_rpc_claim_workspace_ownership` | authenticated | membership insert under row lock | ✗ | ✗ |

### Zero-owner claim

`fm_member_api`'s own `SELECT … FOR UPDATE` on `workspaces` is filtered by the
member policy and finds nothing before membership exists. A narrow table-owner
helper resolves it:

```sql
app_private.lock_unclaimed_workspace(p_slug)
  RETURNS TABLE (workspace_id uuid, status text)   -- 'unknown' | 'claimed' | 'unclaimed'
```

DEFINER-owned by `fm_table_owner` so it bypasses RLS, granted only to
`fm_member_api`. It discloses **only** whether a slug exists and is unclaimed —
never the contents of a private workspace. The `FOR UPDATE` row lock serializes
concurrent claims: the second blocks, then observes `claimed` and raises `42501`.
An unknown slug raises `42704`, distinguishable.

### Conflict detection

`revision bigint` bumped by a `BEFORE UPDATE` trigger, **exposed and accepted as
decimal strings everywhere** — `JSON.parse('{"r":9007199254740993}')` yields
`9007199254740992`, silent corruption. Repository types use opaque
`revision: string` including `conflict.serverRevision`; the UI never does
arithmetic on it.

### Undo

`undo_log(workspace_id, id, user_id, op, prior_state, revision_vector,
absent_ids, created_ids, created_at, expires_at, consumed_at)` — single-use, 15-minute TTL,
creator-only, workspace-scoped. **Server-side, so it survives refresh.**

**Bout-lifecycle vectors.** `fm_rpc_grade_bout` and
`fm_rpc_return_bout_to_pending` take an ID-keyed vector covering the bout **and**
every tracked position **and** every wager on it. The whole vector is validated
before anything mutates, in a fixed order so the error is deterministic:
structural problems (`revisionVectorRequired`, `malformedRevisionEntry`,
`duplicateRevisionEntry`, `missingRevisionEntry`, `unknownRevisionEntry`) raise
`23514`; malformed or out-of-range values raise `22P02`; only a genuinely stale
entry raises `stale_write` with the row's real revision. Ordering is irrelevant.
Both return the complete `touched` vector. `app_private.apply_bout_result`
writes each row **once**, carrying its final settlement, so no obsolete deferred
event is ever queued — the same discipline cluster 1 established.

**Locks precede the comparison.** `app_private.lock_bout_dependents` takes row
locks on the bout, then each tracked position by id, then each wager by id,
BEFORE the vector is compared, and holds them through settlement and undo
creation. Without this the check was a time-of-check/time-of-use race: it read
revisions, held nothing, and `apply_bout_result` then wrote rows whose revisions
could already have moved — a concurrent cluster-1 edit landing in that window was
silently overwritten by a grade that never validated it.

Each row is locked individually in sorted order, because `ORDER BY … FOR UPDATE`
locks in **scan** order rather than sort order, which is not enough to stop two
concurrent graders deadlocking.

**Any future RPC that CREATES a dependent of a bout — a tracked position, a
wager, anything a grade would have to settle — must take this same bout lock
first**, or it can insert into a bout that is concurrently being graded and leave
a phantom the grade never saw and never settled. `wagerRepository.create` is the
first such RPC.

An UPDATE cannot reference its own target alias inside its `FROM` clause:
`settlement_for(…, t.corner, …)` fails with `42P10 invalid reference to
FROM-clause entry for table "t"`. The row's columns are read into a record first.

`revision_vector` stores the post-operation revision for **every surviving
mutable row touched**; `absent_ids` lists every row the operation **deleted**;
`created_ids` lists every row it **created**.

`created_ids` was added at Gate 2. `absent_ids` is defined as forward-deleted
rows, which an undo re-inserts after asserting they are still absent — so an
appended market snapshot cannot live there: it would tell undo to re-insert a
row that already exists. `fm_rpc_amend_tracked_price` appends a snapshot, so the
forward-created case needed its own representation. Undo removes `created_ids`
and re-inserts `absent_ids`.

**Constraint helpers must be executable by the WRITING role.** A CHECK
constraint's function runs as the role performing the write, not as the table
owner, so blanket-revoking `app_private` from everything broke every mutation
with `42501 permission denied for function is_finite_or_null` — from the CHECK,
not from RLS or the role gate. `fm_member_api` is granted `EXECUTE` on exactly
the helpers reachable from a constraint on a table it writes
(`is_finite_or_null`, `is_american_odds_or_null`, `decimal_from_american`,
`is_string_map`) and on nothing else; the catalog suite asserts both the exact
set and that `fm_public_reader`, `anon` and `authenticated` cannot reach them.
`is_string_map` was added at cluster 3: `wagers.external_ids` (and the
events/bouts `external_ids`) carry an `is_string_map` CHECK that is re-evaluated
as `fm_member_api` whenever grade or undo settles a wager, so without the grant
the settlement UPDATE failed `42501 permission denied for function
is_string_map`.

**Settlement is scored at the tracked price**, so a corner or price edit on a
settled position recomputes outcome and financial result **atomically** with the
edit — otherwise the row instantly violates its own settlement invariant.
Measured: amending -150 to -120 left profit `0.6666666666666665` where the
contract required `0.8333333333333335`, and the deferred trigger correctly
refused it. The assessment and its frozen market are never touched. The
recompute is a no-op when the settlement already matches, so an edit bumps the
revision exactly once. Undo verifies the
whole vector, asserts deleted IDs are still absent, and checks shared
dependencies remain compatible. Any drift → conflict. Deleted immutable rows are
restored with plain `INSERT` — **never** `ON CONFLICT DO UPDATE`, which would
mutate an immutable row. Not offered for `import_store` or `reset_workspace`,
which rely on the mandatory backup.

---

## 7. Seed ledger and pruning

164 logical roots: 160 prediction runs + 4 props + 0 parlays.

```sql
seed_items(workspace_id, root_type, root_id, first_seed_version, removed_at)
  root_type IN ('predictionRun','prop','parlay')
```

**Events and Bouts are never tombstoned** — they are shared card structure. This
is not hypothetical: 4 bouts are already referenced by both a prop and a
prediction run, and all 16 events carry multiple bouts.

Rules, all in one transaction with the inserts *and* the `seed_version` write:

- `seed_version IS NULL` → initial seed, ledger row per root
- stale version → insert only roots **absent from the ledger**; ledger
  membership is the test, not table membership
- any delete/clear stamps `removed_at`, whether or not the row was physically
  removed
- a tombstoned root is never re-inserted by any later seed — **Gate 3**, since
  applying a seed means inserting Events, Bouts, market snapshots, assessments
  and tracked positions, not merely roots. Gate 1 guarantees only that the
  tombstone exists and is authoritative for reads.
- `fm_rpc_reset_workspace` clears entities, ledger and `seed_version`
- correcting a seeded record goes through `fm_rpc_import_store`, never a silent
  seed overwrite

`ON CONFLICT DO NOTHING` alone is insufficient: after clearing ROI the IDs no
longer conflict, so a stale seed would re-insert them.

### Pruning

Deletes remove **only proven orphans**, checked by counted reference:

```sql
DELETE FROM app_private.betting_assessments a
WHERE a.workspace_id = v_ws AND a.id = v_assessment_id
  AND NOT EXISTS (SELECT 1 FROM app_private.tracked_positions t
                  WHERE t.workspace_id = v_ws AND t.assessment_id = a.id)
  AND NOT EXISTS (SELECT 1 FROM app_private.wagers g
                  WHERE g.workspace_id = v_ws AND g.assessment_id = a.id);
```

Order: position → assessment → market snapshots → prediction snapshots → run →
**stop**. Events and Bouts always remain as legitimate card history.
`ON DELETE RESTRICT` makes a mistake an error rather than a silent cascade.

**Decide the run's fate before pruning its snapshots.** Prediction snapshots hang
off the run by `run_id`, so if the run row survives — which happens exactly when
a wager pinned its assessment through step 2 — then **none** of its snapshots are
orphans, whatever else does or does not point at them. Testing a snapshot only
against *other* runs' `decision_snapshot_id` is not enough: measured on the
migrated corpus, **77 of 237 snapshots are referenced by no
`decision_snapshot_id` and no `prediction_snapshot_id`** and are reachable only
through `run_id`. On run `1779253814932-7igxlf` that rule deleted the `v2`
snapshot while leaving the run alive, and **both `StoreSchema` and
`checkInvariants` still passed** — a snapshot is only ever a child, so nothing
dangles. It is silent loss of immutable model output that the statistics
projection reads by basis.

The run row is additionally never deleted while any snapshot still carries its
`run_id`; that clause is the structural guard `ON DELETE RESTRICT` enforces.

### Logical versus physical deletion

Deleting a root is a **logical** delete of the root plus a **physical** delete of
whatever it provably orphans. The two come apart whenever a wager pins a shared
assessment, so:

- the root is **always** tombstoned in `seed_items`, whether or not its row went
- the tombstone is **authoritative**: a tombstoned root is `notFound` to every
  read surface, is absent from every list, and cannot be deleted twice
- the RPC reports both facts — `physically_removed` plus a `retained` breakdown
  of run, assessment, market snapshots and prediction snapshots

Tombstoning only on physical removal was the worst of the available outcomes:
the delete reported success, the ledger stayed active, and `get_aggregate` kept
returning a row with a null tracked position — a malformed aggregate the readers
would have dereferenced. An aggregate now requires a run, an assessment **and** a
tracked position, or it is `notFound`.

### Storage state is not Store content

`seed_version`, row revisions and the `seed_items` ledger are **workspace
storage**, never fields of the durable Store. `MetaSchema` is strict, so writing
`seedVersion` into `meta` made every subsequent export fail `StoreSchema` with
`unrecognized_keys` — the store could no longer be re-imported by its own
repository. Export must always yield exactly a Stage 6 Store: `meta` carries
`schemaVersion` and `migratedAt` and nothing else.

---

## 8. Repository layer

The UI imports repositories only; Supabase types never reach `src/App.js`.

```
Result<T> = { ok: true, data: T, revision?: string }
          | { ok: false, error: RepositoryError }

RepositoryError =
  | { kind: 'offline' }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden' }
  | { kind: 'conflict', serverRevision: string, stale?: {id,serverRevision}[] }
  | { kind: 'validation', issues: unknown[] }
  | { kind: 'notFound' }
  | { kind: 'server', code: string, message: string }
```

Error mapping: `42501` → `forbidden`; `23505/23503/23514` → `validation`;
network → `offline`; missing JWT → `unauthenticated`.

`P0001` is Postgres's **generic** `RAISE EXCEPTION` and the RPCs use it for
several unrelated conditions ("workspace already claimed", "bout is still
pending"). It maps to `conflict` **only** when the message carries the stable
marker `stale_write` **and** a `revision=<digits>` value inside signed-bigint
range. Every other `P0001` is a `server` error, and a revision is never
synthesised — defaulting to `"0"` told the UI to re-apply against a revision
that had never existed. **Every stale-write `RAISE` in the SQL must therefore
include the literal `stale_write` token and the current revision.**

Repositories: `eventRepository`, `boutRepository`, `predictionRepository`,
`wagerRepository`, `propRepository`, `parlayRepository`, `statisticsRepository`,
`workspaceRepository`, `undoRepository`, `authRepository`.

### Revision vectors

A single-row write takes `p_expected_revision`. Any write that touches more than
one row takes an **ID-keyed vector** `{id, revision}[]` covering **every** row it
will write, validated in full before the first mutation:

| RPC | Vector must cover |
| --- | --- |
| `fm_rpc_grade_bout` | the bout, every tracked position on it, every wager on it |
| `fm_rpc_return_bout_to_pending` | identical set |
| `fm_rpc_clear_graded` | every graded tracked position |
| `fm_rpc_confirm_all_pending` | every review-pending tracked position |

Duplicate, missing, unknown, malformed and out-of-range entries are `validation`
errors; stale entries are a `conflict` carrying the full `stale` list. Input
order is irrelevant because lookup is by id. Positional arrays are forbidden:
they required the caller to guess the server's ordering, and a short or empty
array silently skipped the check for every unlisted row.

The success payload is the complete `touched` vector — `{table, id, revision}`
per row written, including the bout itself — so the client can refresh its whole
optimistic set from one response.

`revision` is a decimal string bounded by the **signed bigint maximum**
`9223372036854775807`, not merely 19 digits: `9999999999999999999` is 19 digits
and would fail the Postgres cast.

### Contract conformance

`conformsToContract()` compares `Function.length` with `===`, not `<=`. An
at-most rule is not a guard: `Function.length` is 0 for `() => …`, so a
zero-argument stub satisfied every method including the 4-parameter mutations.
Exactness is only workable because `Function.length` stops at the first
defaulted or destructured parameter, so implementations declare **ordinary**
parameters and destructure options in the body.

### Stake validation

`matchesStakeShape()` mirrors the SQL regex and is **shape only** — it accepts
`"0"`, which SQL separately rejects with `> 0`. `isValidStakeTransport()` /
`fromStakeTransport()` are the validity checks. A shape check must never be used
as proof that a value is a legal stake.

### Numeric transport

Never rely on PostgREST defaults. Every read and RPC emits `revision::text` and
`stake_units::text`; writes accept validated decimal strings. The JS adapter
throws unless `Number.isFinite(n) && n > 0 && !Object.is(n, -0)`, then returns
`String(n)`; reads return `Number(s)`. Verified `Object.is` round-trip over a
699,826-value seeded corpus: **0 failures**.

---

## 9. UI states

`idle · loading · saving · saved · offline · failed(retry) · conflict · read-only`

Reads optimistic; **writes confirmed-only** — "Saved" appears strictly after the
RPC returns. **Retry** re-sends the identical write (network fault).
**Conflict** re-reads server state and asks the user to re-apply — the
phone-graded-while-desktop-open case. Signed-out visitors see a read-only badge,
never an error or a login wall. Undo surfaces for 15 minutes and survives
refresh.

Event renames are **card-wide** after normalization and require explicit UI
wording: "Applies to all N bouts on this card."

---

## 10. Authentication

**Authentication and membership are separate, separately observable axes.**
`session()` reports presence only and never a role; `whoami()` reports resolved
membership only and never implies a session. Three states, three UIs:

| session | role | State | Writes | Ownership claim |
| --- | --- | --- | --- | --- |
| `null` | `null` | signed out | `unauthenticated` | `unauthenticated` |
| set | `null` | signed-in non-member | `forbidden` | **allowed** if zero-owner |
| set | set | member | by role | `forbidden` |

Collapsing these into one tri-state made the middle row unreachable, and with it
the only path by which a fresh deployment ever acquires an owner. The distinction
is also what separates "sign in" from "request access" in the UI.

**Both are transitions, not reports.** `claimOwnership()` grants the caller the
owner role in the same operation that takes ownership, and `signOut()` clears the
session and the resolved membership with it. Returning `{role:'owner'}` while
leaving membership unresolved, or `{signedOut:true}` while leaving the session in
place, are successes that change nothing — in the second case the caller stayed
fully authorised after signing out. Every state row above must be reachable by
calling the API, not only by constructing a repository in that state.

`authRepository` + provider exposing `{ session, status, signIn(email), signOut() }`.
Magic-link/OTP with `shouldCreateUser: false`; **open signup disabled at project
level** — the client flag is UX, not the security boundary. `persistSession`,
`detectSessionInUrl`, `autoRefreshToken` all true. Unobtrusive sign-in link in
the Info footer, **no login wall**. `onAuthStateChange` refetches on
sign-in/sign-out; `visibilitychange` + `focus` drive refetch-on-focus; each
successful write refreshes affected queries. Expired link → `/` with a
dismissible notice. Redirects: `localhost:3001`, Vercel preview wildcard,
production. **No Realtime in Stage 7** — refetch-on-focus plus post-write refresh
is sufficient and simpler.

---

## 11. Export / import / reset

Strictly sequenced, because a database transaction cannot prove a user kept a file:

1. Client fetches the store, validates against Stage 6, writes the file, and
   **waits for the download to resolve**.
2. User **explicitly confirms** they have the backup.
3. Only then may `fm_rpc_import_store` / `fm_rpc_reset_workspace` run.

Import shows a per-table count diff, rejects unknown future versions, and is one
transaction — no partial import. `Store.meta` reconstructs from
`workspaces.schema_version` and `workspaces.migrated_at`. Export excludes
`workspace_id`, `revision`, `row_updated_at`, `seed_items`, `undo_log`,
`workspace_members`.

### `test:api` results (local PostgREST)

Real HTTP with anon and authenticated JWT contexts; the JWT is minted HS256
against the local `JWT_SECRET`, so PostgREST verifies it, switches role and
publishes the claims as the GUCs `app_private.current_user_id()` reads. Direct
SQL is used only to build fixtures, never as a substitute for the request path.

- **Export**: `fm_member_export_store` **parses against the real JavaScript
  `StoreSchema`**, with every mismatch reported by JSON path. The schema is not
  weakened to make it pass. Every entity section is non-empty and the parlay
  exports its nested leg.
- **Probabilities**: `pA` and `pB` are both computed in JavaScript,
  independently **of SQL** — the database derives neither. `pB` is deliberately
  `1 - pA`, which is what the domain means by complementary; the point is that
  the PAIR is serialized together, stored, and read back over HTTP as JS numbers — `Object.is` bit-identical on
  both, summing to exactly 1. A one-ULP perturbation is rejected by the `CHECK`.
  **Still PROVISIONAL**: the write leg goes in via fixture SQL, because no
  save-prediction RPC exists yet. Only an HTTP write closes this.
- **Concurrency**: two clients claim the same zero-owner workspace with both
  requests in flight (`Promise.all`). Exactly one succeeds, exactly one owner row
  survives, and the loser gets the documented stable error — HTTP **401/403**
  with `code = 42501` and `already claimed`.
- **Routing**: anon public read; signed-in non-member reads the public fallback
  and gets zero rows plus `role: null` from member surfaces; a member reads a
  private workspace across all six member surfaces while the public ones return
  nothing; anon is denied every member function.
- **anon denial is HTTP 401**, not 404 as first assumed, with
  `code = 42501` and `permission denied for function …`. Both status and
  SQLSTATE are asserted.
- **`npm run test:api` resets the local database first** (`db:reset && vitest`),
  so every run starts from the migration alone and the fixture rows are known to
  match the current schema. `ON CONFLICT DO NOTHING` remains as defensive
  idempotency but is **not** the isolation mechanism. Two consecutive
  invocations each perform their own reset and each pass in full (95/95 as of
  cluster 4, across five files: export, routing/concurrency, cluster 1–2 RPCs,
  the cluster-3 undo suite and the cluster-4 deletion suite).

The membership assertion uses a **catalog-only** scalar that grants nothing, so
it cannot measure its own contamination — the fixture helper takes an
`fm_table_owner` membership and revokes it before COMMIT.

**`fm_member_export_store` is now VALIDATED**, not merely shape-asserted: the
`test:api` suite parses the HTTP response with the real JavaScript `StoreSchema`
and reports any mismatch by JSON path. The pgTAP suite continues to assert the
exact top-level key set, the eleven-section count, a non-empty array per entity
and representative nested fields.

Round-trip is verified by a **recursive semantic comparator using `Object.is`
only at numeric leaves** — `Object.is` on two objects compares identity and would
prove nothing. The current store has 3,799 numeric leaves and 0 negative zeros.

---

## 12. Testing

| Tier | Runs where |
|---|---|
| Repository contract vs in-memory fake | every `npm test`, offline |
| SQL + RLS + RPC via **local Supabase** | `npm run test:db`, CI service job |
| API-level repository tests vs local URL/key | `npm run test:api` — **95 assertions, real HTTP, self-resetting** |
| Manual acceptance (phone/desktop, hard refresh) | pre-merge checklist |

```
supabase/config.toml            committed, CLI version pinned
supabase/migrations/<ts>_*.sql  timestamped, forward-only
supabase/tests/*.test.sql       pgTAP, auto-discovered by `supabase test db`
scripts/db/catalog_snapshot.sql reset-to-reset fingerprint (NOT a TAP test)
```

**Running the suite.** `npm run test:db` is the committed command and passes.
The earlier "cannot connect" note is withdrawn — it was transient, before the
`pg_prove` image had been pulled.

`catalog_snapshot.sql` lives in `scripts/db/`, **not** `supabase/tests/`.
Everything under `supabase/tests/` is auto-discovered as a TAP test, and a
fingerprint utility emits no plan, so it failed the run with
`No subtests run · Parse errors: No plan found in TAP output · Result: FAIL`.

### The canonical fingerprint

`scripts/db/fingerprint.sh` is **the** fingerprint command. Anything not produced
by it is not a fingerprint. It pins:

- **stdout only** — stderr is discarded, so a `NOTICE` can never enter the digest
- psql `--no-psqlrc --quiet --pset=pager=off --pset=footer=off --pset=null='<NULL>'`,
  so no terminal or locale setting can shift the bytes
- the stream is digested **exactly as psql emits it**, including its trailing
  newline; nothing is trimmed or re-wrapped
- **"lines" means `wc -l`** — the count of newline characters, so the trailing
  blank line counts
- the **SHA-256 is authoritative**; the line count is a human sanity check

**The 663-vs-664 discrepancy is reconciled, and it was not formatting noise to be
waved away.** The 664 came from an ad-hoc `psql -f … | wc -l` using *default*
psql settings (aligned output with a footer); the canonical invocation yields
663. Verified in the same session, same database, same schema. Two separate
questions were confounded and both are now answered:

| run | lines | SHA-256 |
|---|---|---|
| with API fixture rows present | 663 | `d6a0e7b5…3e33` |
| clean reset 1 | 663 | `d6a0e7b5…3e33` |
| clean reset 2 | 663 | `d6a0e7b5…3e33` |

Identical across all three, so the fingerprint is confirmed **catalog-only and
data-independent** as well as invocation-stable. `test:db` reported 157 PASS
after each reset; `diff` between the two reset runs is empty.

The `663` / `d6a0e7b5…` value above is the **pre-cluster-3** schema. Each RPC
cluster that adds functions, grants or ACL entries legitimately moves the
fingerprint; what must stay true is byte-for-byte stability across two clean
resets of the *same* schema. **Cluster 3** adds `fm_rpc_undo`, the five undo
helpers (`current_revision`, `check_undo_vector`, `remove_created_rows`,
`restore_position`, `lock_undo_row`) and their `fm_member_api` grants plus the
`is_string_map` grant, growing the catalog fingerprint to:

| run | lines | SHA-256 |
|---|---|---|
| clean reset 1 | 742 | `cfde8a14…0117` |
| clean reset 2 | 742 | `cfde8a14…0117` |

**Cluster 4** adds `fm_rpc_delete_pending_run`, `fm_rpc_clear_graded`, the six
deletion helpers (`delete_aggregate`, `check_graded_vector`, `deleted_row_exists`,
`assert_ids_absent`, `restore_deleted_aggregate`, `untombstone_roots`) and their
`fm_member_api` grants, growing the fingerprint again:

| run | lines | SHA-256 |
|---|---|---|
| clean reset 1 | 766 | `1b0af954…bf78` |
| clean reset 2 | 766 | `1b0af954…bf78` |

Byte-identical across both resets (`diff` empty), `test:db` 159 PASS after each.

Canonical value for the current (cluster-4) schema:

```
lines  766
sha256 1b0af954c19b4bfb0b94ca3a841425df4796b661a378f7a53105bcc336ccbf78
```

Codex independently reported 663 lines with SHA-256
`a4d432277cc76582443b909ad90089d32a1de4ccb7322ea0474dac2d86c5390a`. The line
counts agree; the digests differ **because the byte streams differ** — a
different psql invocation, not a different schema. That is precisely why the
command is now pinned, and why only digests produced by `fingerprint.sh` may be
compared with each other.

**Repeatability is compared, not asserted.** `catalog_snapshot.sql` emits an
explicitly ORDERed fingerprint of owners, function ACLs, table ACLs, policies,
RLS flags, constraints (including `condeferrable`/`condeferred`), triggers, role
attributes, `fm_` memberships and schema privileges. Catalog scan order is not a
stable contract, hence the ordering. The two runs are diffed byte-for-byte.

Scripts: `db:start`, `db:stop`, `db:reset`, `test:db`; `test:api` lands with its
Vitest config. CI adds a **separate** job using `supabase/setup-cli@v1` with a
pinned `version:`; the existing Vitest/build job is unchanged and stays fast.
**CI never depends on a hosted project or committed credentials.**

**Install with `npm ci --include=dev`.** This is the durable rule wherever
`NODE_ENV=production` may be present — CI images and this workstation both set
it — because npm then silently omits devDependencies, removing `vite`, `vitest`
and `@tailwindcss/vite`. Hit while pinning the CLI: the install pruned the
toolchain and the suite failed to start with `Cannot find package 'vite'`.

The **build** needs no ambient `NODE_ENV`. Measured: `npm run build` with
`NODE_ENV` unset reproduces the approved hashes exactly
(`bc0fc915…`, 4,648,208 bytes; CSS `4f72dadb…`), because Vite sets production
mode itself. The prohibition is only against **forcing**
`NODE_ENV=development`, which selects React's development build and inflates the
JS to 5,005,192 bytes — not a real change, but it does break byte comparison.
An earlier revision of this note wrongly claimed ambient
`NODE_ENV=production` was required.

### Required rejection tests

Snapshot naming run X with bout Y · run's `decision_snapshot_id` pointing at
another run's snapshot · assessment combining run/snapshot/market from different
bouts · position or wager using an assessment or market from another bout · bout
prop disagreeing with `prop.event_id` · `prob_a+prob_b <> 1` · `winner_corner` ≠
argmax · NaN/±Infinity in every nullable double · fair line `|n| < 100` ·
`external_ids` with a non-string value · non-reconstructed snapshot carrying
reconstruction fields · `legacyTrackedOverride` + timestamp and `manual` + null
(all four pairings) · finish leaders not equal to argmax, duplicated, empty, or
unknown label · settled position whose selected corner is unpriced but claims
`computed` · settled position on a pending bout · decisive result settled against
the wrong corner · draw settling as anything but push · prospect-OR mismatch ·
`appCreated` with null `settled_at`/`confirmed_at` · stake strings that are
negative, zero, malformed or over 32 characters.

### Required behavioural tests

Deletion-cycle (succeeds orphaned, fails when still referenced, unrelated FK
still immediate) · undo revision-vector conflict · undo expiry and single-use ·
seed resurrection (clear ROI → advance `seed_version` → nothing returns) ·
**the four shared bouts**, deleting each root and asserting the bout, its event
and the sibling root all survive with only the deleted root tombstoned · claim
concurrency (simultaneous claimants, exactly one wins) · unknown slug
distinguishable from claimed · authenticated non-member still reads a public
workspace through the public fallback · `anon` receives `permission denied` on
every `app_private` table · neither client role can `SET ROLE`.

### Gate 2 measurements

- browser → PostgREST → `float8` probability complementarity
- Postgres profit recomputation across all 152 computed rows
- negative-zero probe via `encode(pg_catalog.float8send(v),'hex') =
  '8000000000000000'`, over every persisted double column and a jsonb `-0`
  round-trip
- the full seeded stake corpus through `parse_positive_decimal` itself

Exact equality is retained only if the first two pass in the real stack;
otherwise the smallest sufficient bound is measured there.

### Gate 2 measurement results

Run in `supabase/tests/02_measurements.test.sql` (17 assertions).

**Both constraints remain PROVISIONAL.** Nothing measured so far exercises the
real browser → PostgREST → `float8` → response → JavaScript path.

- Complementarity: the in-database checks derive `pB` as `(1 - pA)` in SQL, so
  they test one serialized value, not two. They are labelled **SQL-only
  diagnostics**. The strongest available SQL check — two *independently parsed*
  text doubles summing to exactly 1 — passes for every pair tried, and the
  `CHECK` is proven to bind by rejecting a perturbed pair. Real two-value
  round-trip is outstanding with `test:api`.
- Profit: the exact `<>` comparison binds, proven against a real stored row —
  the correct value is accepted and a value **one ULP off is rejected**. The
  recomputation over the 152 stored computed rows needs Gate 3's seed.

**Postgres and V8 agree bit-for-bit** on `decimal_from_american` for `-150`,
`+250`, `-110` and `+100`, compared as `float8send` hex against constants dumped
from Node. This caught a real error: the intuitive literal `1.6666666666666667`
is `3ffaaaaaaaaaaaab`, one ULP from what **both** engines compute
(`3ffaaaaaaaaaaaaa`). The database was right; the hand-written constant was wrong.

A second trap, worth stating because it invalidated an earlier test: the
production profit expression is `stake * ((1 + 100/|odds|) - 1)`, and for 1u at
-150 that is `0.6666666666666665`, **not** the `0.6666666666666666` that
`100/150` displays as. The subtraction after the addition loses the last bit.

Both settlement fixtures now force `SET CONSTRAINTS … IMMEDIATE`. Without it a
`lives_ok` around a deferred-trigger write proves nothing, because the test
transaction never commits — measured: it passed with a profit one ULP off. The
fixture also flushes the queued open-position event *before* grading, since
forcing a stale `status='open'` event after the bout resolves makes the trigger
correctly complain about a state the test itself created.

**The `-0` guard in `is_js_double_map` is UNREACHABLE.** jsonb numbers are
`numeric`, and Postgres `numeric` has no negative zero, so the parser normalises
`-0.0` to `0.0` before any CHECK runs:

```
('{"x": -0.0}'::jsonb -> 'x') #>> '{}'   =>  '0.0'
'{"x": -0.0}'::jsonb::text               =>  '{"x": 0.0}'
```

The regex never sees a leading minus and cannot fire. The **only** real defence
against persisting `-0` is the repository adapter, which rejects
`Object.is(n, -0)` before serialising. The SQL branch is retained as
belt-and-braces but must not be counted as protection, and the measurement suite
asserts the accepting behaviour so the gap stays visible rather than looking
like a regression later.

Related parser note: `(-0.0)::double precision` is constant-folded to `+0`
(measured — it sends `0000000000000000`), so a `-0` test literal must arrive as
text. Every persisted double column is probed with
`encode(float8send(v),'hex') = '8000000000000000'`; zero negative zeros.

The stake corpus is exercised through `parse_positive_decimal` itself, including
the measured 24-character maximum `0.0000057692833136856875`, `5e-324`,
`1.7976931348623157e+308`, and rejection of `0`, negatives and an over-length
mantissa.

---

## 13. Production rollout (Gate 5)

No database password, service-role key or access token ever enters the bundle or
the repository.

| # | Step | Who |
|---|---|---|
| 1 | Create hosted project; **disable open signup** | Alex |
| 2 | `supabase login`; `supabase link --project-ref <ref>` | Alex |
| 3 | `supabase db push --dry-run` — review output | Alex runs, Claude reviews |
| 4 | `supabase db push` (committed migrations only) | Alex |
| 5 | **Never** `db reset --linked`; never `--include-seed` on production | — |
| 6 | Vercel `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (preview + production) | Alex |
| 7 | Site URL + redirect URLs | Alex |
| 8 | Verify empty workspace; invite owner; sign in; call ownership claim | Alex |
| 9 | Seed via the reviewed transactional RPC, after explicit approval | Alex triggers |
| 10 | Deploy runtime rewire; phone + desktop acceptance | both |

---

## 14. Rollback

The seed JS files and clipboard export buttons remain through Stage 7, so `main`
is always independently runnable. Gate 1 is pure addition; Gate 2 touches no
runtime; Gate 6 is the reversible-risk commit — reverting it restores the
in-memory repositories and the app runs from seed files again, with Supabase data
untouched and recoverable via export. A failed repository migration is restored
by importing the pre-replacement backup export.

---

## 15. Standing decisions

Immutable lowercase slug `fightmetrics` · `viewer` role retained · 15-minute undo
TTL · full Store export members-only · `stake_units numeric` with a tested
transport adapter · card-wide event-edit warning · `notes` retained · deletes
prune only proven orphans · Events/Bouts left as card history · dead handlers
(`handleSavePrediction`, `handleUpdateParlay`) removed only during the Gate 6
runtime rewire, after proving zero call sites.
