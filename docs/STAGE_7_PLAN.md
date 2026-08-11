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
| 2 · status | **COMPLETE.** Every item this row once carried as outstanding was finished — the last two, the non-contract `fm_rpc_seed_store` and the 167-row stored-profit recomputation, landed at Gate 3 (see the Gate 3 status row). Both the profit-equality and the probability-complementarity constraints are now **final**, not provisional. *The per-cluster narrative below is retained as the HISTORICAL record of how each cluster landed and what was outstanding at the time; where it says something is outstanding, read it as "was outstanding then", and take the current status from this sentence and from the Gate 3 row.* RPC clusters 1–8 landed (all contract SQL surfaces complete). Landed: roles, ownership transfer, ACLs, `app_private` schema, all 15 tables with composite FKs and the deferrable run↔snapshot cycle, revision/slug/settlement triggers, RLS on every table, a working authenticated path (caller resolution + zero-owner bootstrap), the `fm_read_*`/`fm_member_*` surfaces **for everything the current app renders**, SQL-side measurements, and — as of cluster 7 — 159 assertions green under `npm run test:db` and 129 under `npm run test:api`, including StoreSchema validation of the export and genuine two-client claim concurrency. (The per-cluster API/pgTAP counts below are the historical measurements at each cluster's landing.) **RPC cluster 1 (tracked-position edits)** is complete: `fm_rpc_change_tracked_corner`, `fm_rpc_amend_tracked_price`, `fm_rpc_confirm_entry` and `fm_member_undo_list`, with authorization, expected-revision conflicts, `stale_write` carrying the live server revision, undo records, settled-edit recomputation and rollback proof — 40 API assertions and 159 pgTAP. **RPC cluster 2 (bout lifecycle)** is complete: `fm_rpc_grade_bout`, `fm_rpc_return_bout_to_pending` and the deferred `fm_member_wagers_by_bout` read, with full revision-vector validation under row locks, `stale_write` carrying the real server revision, undo prior-state, mixed outcomes, and grade/return proven true inverses — 66 API assertions. **RPC cluster 3 (undo foundation)** is complete: `fm_rpc_undo` for all five implemented operations (tracked-corner change, price amendment, confirmation, grade, return-to-pending), with the table-owner `lock_undo_row`/`current_revision`/`check_undo_vector`/`remove_created_rows`/`restore_position` helpers, creator/role/workspace/TTL/single-use/consumed enforcement, undo-row-lock serialization of concurrent undos, `stale_write` naming every drifted row, atomic rollback, safe removal of forward-created market snapshots, exact prior-state round trips for every operation, no undo-of-undo, `prior_state` withheld from the read surface, and `absent_ids` validated with restoration reserved for cluster 4 — **19 API assertions, 85 API total**. `is_string_map` is now `EXECUTE`-granted to `fm_member_api` (four constraint helpers, not three), because settling a wager during grade/undo re-evaluates its `external_ids` CHECK. **RPC cluster 4 (deletion)** is complete: `fm_rpc_delete_pending_run` and `fm_rpc_clear_graded`, with the table-owner `delete_aggregate`/`check_graded_vector`/`deleted_row_exists`/`assert_ids_absent`/`restore_deleted_aggregate`/`untombstone_roots` helpers; proven-orphan pruning in the documented order (position → assessment → market → snapshots → run → stop), the run-survives-iff-a-wager-pins-its-assessment rule, unconditional root tombstoning with tombstone-as-authoritative `notFound` (no double delete), conflict-checked on the tracked position (delete) and an owner-only graded vector (clear), and the `absent_ids` restoration path in `fm_rpc_undo` that re-inserts a deleted aggregate column-complete (`to_jsonb`/`jsonb_populate_record`, immutable rows via plain `INSERT`, run↔snapshot cycle deferred) after `assert_ids_absent`, then un-tombstones — **10 API assertions, 95 API total**. Deletion is by run root only, matching the frozen contract and the in-memory reference; the stray `delete_tracked_position` RPC was withdrawn (see §5/§6). **RPC cluster 5 (prediction save)** is complete: `fm_rpc_save_prediction_run` and `fm_member_prediction_aggregate`, with the table-owner `insert_prediction_aggregate` (domain-shape → columns, reconstructing the finishProjection/settlement/reviewState/reconstruction unions, cyclic pair deferred, live ledger root written as owner) and `remove_created_aggregate` helpers; owner/editor with the bout lock (it creates a dependent), and a `save_prediction_run` branch in `fm_rpc_undo` that removes exactly the created rows and the ledger row after `check_undo_vector` proves the created position is untouched. This **closes the HTTP write leg for complementarity**: `probA`/`probB` cross PostgREST as JS numbers on the way in and read back `Object.is`-identical, summing to exactly 1 — **7 API assertions, 102 API total**. **RPC cluster 6 (wagers)** is complete: `fm_rpc_create_wager`, `fm_rpc_update_stake`, `fm_rpc_update_notes`, `fm_rpc_settle_wager` and `fm_rpc_delete_wager`, with the `lock_wager` helper and five new `fm_rpc_undo` branches; every one is bout-lock-bound (reads the wager's bout, locks the dependent set, then checks the wager's expected revision), `settle` takes a forced outcome the deferred settlement trigger validates against the bout, `updateStake` refuses a settled wager and validates the decimal string inline, and undo covers create→delete, delete→re-insert and stake/notes/settle→restore — **13 API assertions, 115 API total**. **Cluster 6 follow-up (fixture isolation):** the recurring shared-fixture coupling — save and wager beforeAll blocks seeding the shared WS_PUBLIC through the parameterized `applyFixture` — was eliminated at its root: `applyFixture()` is now parameterless and WS_PUBLIC's probability is the centrally-owned `PUBLIC_PROB_A`/`PUBLIC_PROB_B` constant no caller can override; a test that needs a different explicit probability seeds its own isolated workspace via `seedComplement`, and a new `fixture-isolation.test.mjs` proves both WS_PUBLIC's caller-independence and self-contained explicit-probability selection (**+3 assertions, 118 API total across eight files**). The exact self-resetting `npm run test:api` was run end-to-end: `db:reset` exit 0, then 118/118. **RPC cluster 7 (props, parlays, rename, confirm-all)** is complete: `fm_rpc_rename_event`, `fm_rpc_confirm_all_pending`, `fm_rpc_save_prop`/`_settle_prop`/`_delete_prop`, `fm_rpc_save_parlay`/`_delete_parlay`, with the table-owner `write_ledger_root`/`tombstone_root` and `check_pending_vector` helpers and seven new `fm_rpc_undo` branches; rename is card-wide and returns `affectedBouts`; confirm-all validates a vector over every pending position under row locks; props are ledger roots (create→live, settle→revision-checked, delete→tombstone) and parlays are immutable ledger roots (create with legs under the deferred leg-count trigger, delete removes legs+parlay); none is a bout-grade dependent so none takes the bout lock; undo covers every operation (rename/confirm-all/settle→restore, create→delete, delete→re-insert) — **11 API assertions, 129 API total**. The exact self-resetting `npm run test:api` was run end-to-end again: `db:reset` exit 0, then 129/129 across nine files. **RPC cluster 8 (workspace)** is complete: `fm_member_workspace` and `fm_member_seed_version` (member reads; current carries the workspace revision), `fm_rpc_set_seed_version` (owner-only, revision-checked), `fm_rpc_import_store` and `fm_rpc_reset_workspace` (owner-only, backup-confirmed), with the table-owner `clear_workspace_entities` and `import_store_entities` helpers; import is an ATOMIC whole-store replacement — clear then insert in one transaction, so a store violating any CHECK/FK/trigger aborts with no partial write — rejects an unknown future schema version, clears seed_version, and rebuilds the ledger; both import and reset bypass RLS in the helper (to clear other users' undo and the owner-only ledger) while the owner gate is enforced in the public RPC; StoreSchema round-trip is proven by export→reset→import→export equality **for a canonical backup** (see §11: arbitrary valid `migratedAt` spellings normalize to the same instant, not the same text). **Cluster 8 corrective (envelope gate + serialization):** the first cut coalesced missing collections to `[]` and cleared BEFORE validating the envelope, so a meta-only payload (`{meta:{schemaVersion,migratedAt}}`) that fails StoreSchema returned 200 and destroyed every collection. Fixed at the root: `app_private.assert_store_envelope` now runs BEFORE any clear and enforces the complete Store envelope — exactly the eleven top-level keys (no missing, no extra); `meta` exactly `{schemaVersion, migratedAt}`; and every one of the ten collections present as a JSON array — rejecting each violation with a stable `23514` `invalidStoreEnvelope` marker while the existing store stays byte-for-byte unchanged. A **second corrective** deepened the `meta` checks to the actual MetaSchema (they had only checked JSON type): `schemaVersion` must be an integer `>= 1` within int4 range (fractional/zero/negative/oversized/non-number all rejected here, before the `::int` cast and the `workspaces_schema_version_positive` CHECK could be reached), and a non-null `migratedAt` must match the FULL grammar of `z.iso.datetime({offset:true})` — `date T HH:MM` with **optional** `:SS` and `.fraction`, then a required `Z` or `±HH:MM` — AND cast to `timestamptz` (which is the calendar-validity check; malformed, no-offset and impossible dates rejected here, before the cast could raise `22P02`/`22007`). A **third corrective** widened the shape check, which had wrongly required seconds and so rejected minute-precision spellings (`…T05:28Z`, `…T05:28+03:15`) that MetaSchema accepts. A **fourth corrective** established ONE durable timestamp contract shared by JavaScript and PostgreSQL, closing two remaining mismatches: the SQL grammar used unrestricted `\d{2}` time fields, so Zod-invalid hour 24 and second 60 passed (PostgreSQL silently normalises both — measured `…T24:00Z` → next day); and `z.iso.datetime({offset:true})` accepts offsets up to ±23:59 that `timestamptz` cannot represent (±15:59 max). `isoDateTime()` in `src/data/schemas/primitives.mjs` is now **refined** to the representable offset range while keeping Zod's calendar/clock validation, and `assert_store_envelope` carries the same bounds (hour 00–23, minute 00–59, optional second 00–59, fraction only with seconds, offset ≤ ±15:59). A **fifth corrective** closed the last calendar boundary: Zod accepts year `0000` but PostgreSQL rejects it (`date/time field value out of range` — its proleptic Gregorian calendar has no year zero), so both sides now enforce the shared year range **0001–9999**. 17 paired conformance tests assert MetaSchema and the HTTP import agree case for case — the authoritative timestamp matrix, which replaced an older redundant form-only block — and all 54 persisted timestamps across five workspaces re-validate under the refined schema. The helper is `STABLE` for that offset-anchored cast and converts every such failure to `23514` `invalidStoreEnvelope`. import and reset also take a `FOR UPDATE` lock on the workspace row so two concurrent destructive replacements serialize (see §11 for the scope). The fixture carries a wager so the round trip exercises all ten collections, the tests assert all ten (plus parlay legs and the ledger) on reset, and positive tests cover every accepted `migratedAt` form (minute/seconds/fractional, `Z`/explicit offset) asserting **instant** equivalence after export (`timestamptz` normalizes the offset, so the exported spelling differs) — **43 API assertions, 172 API total**. The exact self-resetting `npm run test:api` was run end-to-end: `db:reset` exit 0, then 172/172 across ten files. **All 25 contract mutation methods and all 40 SQL-backed contract methods are now implemented.** *(Historical, at cluster 8: the non-contract `fm_rpc_seed_store` and the stored-profit recomputation were the only things still open, and the profit-equality constraint was still provisional.)* **Both closed at Gate 3.** `fm_rpc_seed_store` has landed and all **167** stored computed rows recomputed in PostgreSQL with zero value mismatches, zero bit mismatches and deviation 0. **Nothing remains outstanding for Gate 2.** | ✅ |
| 3 | `feat(data): migrate seed data into the durable schema` | ✅ |
| 3 · status | **COMPLETE.** `fm_rpc_seed_store` and `app_private.seed_store_entities` landed: owner-only, revision-checked on the workspace row, envelope-gated by the same `assert_store_envelope` import uses, serialized by the same workspace `FOR UPDATE` lock, and **not undoable** by design. The whole migrated corpus loads in one transaction — 18 events, 178 bouts, 178 prediction runs, 273 prediction snapshots, 177 market snapshots, 178 assessments, 178 tracked positions, 4 props, **182 ledger roots** — in ~200 ms over real HTTP. Seeding is proven **deterministic** (the same store into two independent workspaces is identical column-for-column, and every persisted double is bit-identical by `float8send`), **idempotent** (re-applying the same version, and advancing the version, both insert exactly zero rows and leave the content digest unchanged), and **non-resurrecting** (after deleting one pending root and clearing all 168 graded roots, a later seed at a new version returns `roots_seeded 0`, `roots_skipped_tombstoned 169`, and inserts nothing — while all 18 events and 178 bouts survive as card history). **All 167 stored computed-profit rows were recomputed through `app_private.settlement_for` in PostgreSQL with zero value mismatches, zero bit mismatches and maximum deviation exactly 0**, so the profit-equality constraint is no longer provisional (§4, §12). One real defect was found and fixed by this gate's own tests: a bulk seed left the tables with no planner statistics and `fm_member_roi`/`fm_member_upcoming` hit the 8 s statement timeout (`57014`) on the seeded corpus; the seed now `ANALYZE`s what it loaded and both return in 26 ms / 9 ms. **197 API assertions across eleven files, 174 pgTAP across three.** | ✅ |
| 4 | `feat(auth): add magic-link sign-in and read-only public state` | **DEFERRED — not started** |
| 5 | **Hosted rollout** — Alex creates/links the project, `db push --dry-run` → `db push`, Vercel vars, invite owner, claim, approve seed | **DEFERRED — not started** |
| 6 | `feat(data): back repositories with Postgres` — runtime rewire; dead handlers removed after proving zero call sites | **DEFERRED — not started** |
| 7 | `feat(data): add save status, undo, and JSON export/import` | **DEFERRED — not started** |

**Gates 4–7 are explicitly DEFERRED.** Work stops at Gate 3. No authentication has
been started, no hosted project exists or is linked, no repository is backed by
Postgres, and no runtime behaviour has changed — the production bundle is
byte-identical to the approved baseline (§12). Resuming requires explicit
approval; nothing in this commit presumes it.

Every gate re-runs: full Vitest suite, browser probe, production build, JS/CSS
byte comparison, leak checks, fixture/reference integrity, and confirmation that
the 22 untracked user files are untouched.

### Pre-Gate-3 synchronization with `main`

`main` was deliberately left un-merged for the whole of Gate 2 so the RPC clusters
could be reviewed against a fixed base. It is merged **once**, here, before Gate 3
begins — as its own reviewable commit, with no Gate 3 work in it.

Merged `origin/main` (8 commits, not the 5 known earlier: three more landed while
cluster 8 was under review, and the stale local `main` ref hid them). Their
messages are generic and misleading — several say "Hello"/"Goodbye" or
`fmt.Println` in a repo with no Go — but the *content* is real: live ROI and
upcoming refreshes, the first parlay entry, and the CI fix.

**Only one file was touched by both sides** — `docs/DOMAIN_SCHEMA.md` — and it
auto-merged cleanly because the edits are in different sections: `main`
de-hardcoded row counts in the legacy field-map table, Stage 7 added "The durable
timestamp contract". Both survive in full.

**The real conflict was semantic, not textual, and is worth stating plainly.**
`main` changed no SQL and no API test, so the schema, the fingerprint and the
whole `test:api` suite were unaffected. What it did change is the **size of the
migrated corpus**, and `contract.test.mjs` hard-codes corpus counts. Fourteen
assertions failed — every one a count, none a logic error:

| Quantity | Gate 1 | post-sync | derivation |
|---|---|---|---|
| ROI entries (graded) | 153 | **168** | refreshed `roiData.js` |
| Upcoming entries (open) | 7 | **10** | refreshed `upcomingData.js` |
| events | 16 | **18** | two new cards |
| prediction runs / positions | 160 | **178** | 168 + 10 ✓ |
| seed-ledger roots | 164 | **182** | 178 + 4 props + 0 parlays ✓ |
| prediction snapshots | 237 | **273** | |
| computed-profit rows | 152 | **167** | |

The counts were re-derived from the merged data and cross-checked for internal
consistency (168 + 10 = 178; 178 + 4 + 0 = 182) before any test was edited, so
this is a re-measured baseline rather than a test bent to fit output. The
assertions remain exact equalities. `parlayData.js` now holds one real parlay, but
the contract suite still migrates with `parlayEntries: []`, so migrated parlays
stay 0 — a harness choice, not data loss; the production entry is preserved.

The 167-row stored-profit recomputation and `fm_rpc_seed_store` were **not**
started in this sync commit — deliberately, so the merge stayed reviewable on its
own. **Both were subsequently delivered at Gate 3** and are no longer pending:
the RPC is live and all 167 rows recomputed in PostgreSQL with deviation 0 (§7,
§12).

### The Update Fighters hotfix landing (also pre-Gate-3)

After the sync, `main` gained the Update Fighters hotfix (PR #9, squash-merged as
`c29071d`) and the first successful run of that workflow, which committed
regenerated data as `791c69f`. Both were merged into this branch before Gate 3.

The workflow had been failing on a `TypeError: '<' not supported between
instances of 'float' and 'str'` — pandas `.map()` yields NaN for events missing
from `ufc_event_details.csv`, and **NaN is truthy in Python**, so every
`x['date'] or ''` guard passed it through into a sort. Two further blockers were
found behind it: a fighter-identity assertion that had been unreachable since the
Vite refactor, and the entry golden pinning `_provenance.sourceManifest`, which
changes on every data refresh by construction.

**Migration counts are UNCHANGED by that landing**, and this is the load-bearing
point for Stage 7: the workflow regenerates `fightersData.js`, `fightHistory.js`,
`eloModule.js` and `sourceManifest.js` only. It never touches `roiData.js` or
`upcomingData.js`, which are the sole inputs to `migrateV0ToV1`. Re-measured on
the merged tree:

| quantity | value |
|---|---|
| events / bouts | 18 / 178 |
| predictionRuns · snapshots · marketSnapshots | 178 · 273 · 177 |
| bettingAssessments · trackedPositions | 178 · 178 |
| settled (graded) / open | 168 / 10 |
| computed-profit rows | 167 |
| props / parlays | 4 / 0 |
| **seed-ledger roots** | **182** (178 + 4 + 0) |

Generated-data totals **did** move, and are recorded for reference rather than
asserted by Stage 7: roster `_D2` 2,291 · fighter histories 2,737 · Elo ratings
2,729 · 17,644 history entries. The history count rose by one because
`UFC - Road to UFC 4.6` is now dated (2025-08-22, from a reviewed override) and
its fighters gained real histories.

The catalog fingerprint is **unchanged at 850 / `1dff5590…`** — the landing
touches no SQL — and `test:db` (159) and `test:api` (172) are likewise unmoved.
Only the offline Vitest total rose, 426 → **428**, from the two new golden tests
that split manifest-stamping from entry/model behaviour.

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

**That guarantee is tested, with two genuinely overlapping sessions.**
*(Historically it was not: the pgTAP behavioural test is **sequential** —
claimant A completes, then claimant B is attempted — so on its own it proves only
that a later claimant is refused once an owner exists, and the note here used to
say concurrency was outstanding.)* The `test:api` suite closed that gap and is
the current state: two clients claim the same zero-owner workspace with **both
requests in flight** (`Promise.all`), one transaction blocks on the row lock, and
**exactly one succeeds** — exactly one owner row survives and the loser receives
the documented stable failure, HTTP 401/403 with `code = 42501` and
`already claimed`. The claim path may therefore be described as
concurrency-tested.

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

Profit equality is exact (`<>`, no epsilon) because recomputing all 167 stored
computed rows in JS reproduced them bit-for-bit, deviation `0`. **Gate 3 re-ran
this in real Postgres and the comparison is now FINAL, not provisional.** The
recomputation goes through `app_private.settlement_for` — the same function
grading uses in production, not a reimplementation written to agree — over the
167 rows of the seeded corpus (100 won, 64 lost, 2 void, 1 push):

```
rows=167  value_mismatches=0  bit_mismatches=0  max_deviation=0  union_mismatches=0
```

`union_mismatches` covers `settlement_status`, `settlement_outcome` and
`financial_status`, so the whole settlement union agrees, not merely the number;
`bit_mismatches` compares `encode(float8send(…),'hex')`, so agreement is at the
IEEE-754 byte level and not at a shared text rendering. No bound had to be
measured and no comparison was changed. The one settled-but-unpriced row remains
`uncomputable` with a NULL profit rather than a silent zero.

`CHECK (prob_a + prob_b = 1)` is likewise **final**. *(Historically it was
retained provisionally on the strength of all 237 stored pairs satisfying it,
pending a real transport test.)* Cluster 5 closed the HTTP **write** leg and so
completed the round trip: `fm_rpc_save_prediction_run` accepts `probA`/`probB` as
JS numbers over PostgREST, stores them, and `fm_member_prediction_aggregate`
reads both back `Object.is`-identical and summing to exactly 1 — the full browser
JSON → PostgREST → `float8` → response → JS path, with no fixture SQL on the
write side, and a one-ULP perturbation rejected by the `CHECK`. Nothing about
complementarity is outstanding.

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
| 4 | `eventRepository.rename` | SQL | ✅ `fm_rpc_rename_event` — cluster 7; card-wide, returns `affectedBouts`, only name/date/promotion move, undo restores |
| 5 | `boutRepository.listByEvent` | SQL | `fm_read_bouts` / `fm_member_bouts` |
| 6 | `boutRepository.get` | client | filter of the bout surfaces |
| 7 | `boutRepository.listPendingResults` | client | filter `result_status='pending'` on either bout surface |
| 8 | `predictionRepository.listPending` | SQL | `fm_read_upcoming` / `fm_member_upcoming` |
| 9 | `predictionRepository.listGraded` | SQL | `fm_read_roi` / `fm_member_roi` |
| 10 | `predictionRepository.getAggregate` | SQL | ✅ `fm_member_prediction_aggregate` — cluster 5; returns `{run,snapshots,assessment,trackedPosition}` in domain shape, or `null` when tombstoned/incomplete |
| 11 | `predictionRepository.savePrediction` | SQL | ✅ `fm_rpc_save_prediction_run` — cluster 5; authors the whole aggregate from the domain shape, closes the HTTP write leg for complementarity, undo removes it |
| 12 | `predictionRepository.remove` | SQL | ✅ `fm_rpc_delete_pending_run` — cluster 4; conflict-checked on the tracked position, prunes proven orphans, tombstones the root, undo-restores via `absent_ids` |
| 13 | `predictionRepository.clearGraded` | SQL | ✅ `fm_rpc_clear_graded` — cluster 4; owner-only, vector over every graded position, one undo entry restores the whole clear |
| 14 | `predictionRepository.grade` | SQL | ✅ `fm_rpc_grade_bout` |
| 15 | `predictionRepository.returnToPending` | SQL | ✅ `fm_rpc_return_bout_to_pending` |
| 16 | `predictionRepository.changeTrackedCorner` | SQL | ✅ `fm_rpc_change_tracked_corner` |
| 17 | `predictionRepository.amendTrackedPrice` | SQL | ✅ `fm_rpc_amend_tracked_price` |
| 18 | `predictionRepository.confirmEntry` | SQL | ✅ `fm_rpc_confirm_entry` |
| 19 | `predictionRepository.confirmAllPending` | SQL | ✅ `fm_rpc_confirm_all_pending` — cluster 7; vector over every pending position, undo restores each review state |
| 20 | `wagerRepository.listByBout` | SQL | ✅ `fm_member_wagers_by_bout` |
| 21 | `wagerRepository.create` | SQL | ✅ `fm_rpc_create_wager` — cluster 6; bout-lock-bound (it creates a dependent), undo deletes it |
| 22 | `wagerRepository.updateStake` | SQL | ✅ `fm_rpc_update_stake` — cluster 6; open wagers only, decimal-string validated |
| 23 | `wagerRepository.updateNotes` | SQL | ✅ `fm_rpc_update_notes` — cluster 6; empty string → null |
| 24 | `wagerRepository.settle` | SQL | ✅ `fm_rpc_settle_wager` — cluster 6; forced outcome, settlement trigger enforces bout consistency |
| 25 | `wagerRepository.remove` | SQL | ✅ `fm_rpc_delete_wager` — cluster 6; undo re-inserts the captured row |
| 26 | `propRepository.list` | SQL | `fm_read_props` / `fm_member_props` |
| 27 | `propRepository.create` | SQL | ✅ `fm_rpc_save_prop` — cluster 7; live ledger root, undo deletes it |
| 28 | `propRepository.settle` | SQL | ✅ `fm_rpc_settle_prop` — cluster 7; revision-checked, undo restores the result |
| 29 | `propRepository.remove` | SQL | ✅ `fm_rpc_delete_prop` — cluster 7; tombstones the root, undo re-inserts |
| 30 | `parlayRepository.list` | SQL | `fm_read_parlays` / `fm_member_parlays` |
| 31 | `parlayRepository.create` | SQL | ✅ `fm_rpc_save_parlay` — cluster 7; parlay + legs atomically (deferred leg-count trigger), undo removes both |
| 32 | `parlayRepository.remove` | SQL | ✅ `fm_rpc_delete_parlay` — cluster 7; immutable (no revision), tombstones the root, undo re-inserts parlay + legs |
| 33 | `statisticsRepository.statisticsInput` | SQL | `fm_read_statistics_input` / `fm_member_statistics_input` |
| 34 | `workspaceRepository.current` | SQL | ✅ `fm_member_workspace` — cluster 8; member read carrying revision for setSeedVersion |
| 35 | `workspaceRepository.seedVersion` | SQL | ✅ `fm_member_seed_version` — cluster 8; member read of the storage-only seed version |
| 36 | `workspaceRepository.setSeedVersion` | SQL | ✅ `fm_rpc_set_seed_version` — cluster 8, owner-only, revision-checked; pairs with `fm_rpc_seed_store` at Gate 3 |
| 37 | `workspaceRepository.exportStore` | SQL | ✅ `fm_member_export_store`, validated against the real `StoreSchema` |
| 38 | `workspaceRepository.importStore` | SQL | ✅ `fm_rpc_import_store` — cluster 8; owner-only, backup-confirmed, atomic clear+insert in one transaction, no partial write |
| 39 | `workspaceRepository.reset` | SQL | ✅ `fm_rpc_reset_workspace` — cluster 8; owner-only, backup-confirmed |
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
| Implemented, SQL-backed contract methods | **40** |
| Planned read surfaces | **0** |
| Planned mutation methods | **0** |
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
| 5 | **Prediction save** | ✅ `save_prediction_run`, `getAggregate`. Closes the HTTP write leg for complementarity — probabilities now cross PostgREST as JS numbers on the way IN, are stored and read back Object.is-identical, summing to exactly 1. Takes the bout lock: it creates a dependent. Creates run+snapshots+(optional)market+assessment+position referencing an EXISTING event/bout (per the frozen reference, which does not author events or bouts); undo removes exactly what it created and its ledger row. |
| 6 | **Wagers** | ✅ `create`, `updateStake`, `updateNotes`, `settle`, `remove`. All bout-lock-bound (each reads the wager's bout, locks the whole dependent set in canonical order, then checks the wager's expected revision). `settle` takes a forced outcome and relies on the deferred settlement trigger to reject any outcome the bout result and selected corner contradict; `updateStake` refuses a settled wager and validates the decimal string inline; undo covers all five (create→delete, delete→re-insert, the rest→restore). |
| 7 | **Props, parlays, rename** | ✅ `confirm_all_pending`, prop mutations (`save`/`settle`/`delete`), parlay mutations (`save`/`delete`), `rename_event`. Props/parlays are ledger roots (owner-only seed_items written via table-owner helpers); none is a bout-grade dependent so none takes the bout lock; parlays are immutable (no revision); undo covers rename→restore, confirm-all→restore, prop create→delete / settle→restore / delete→re-insert, parlay create→delete / delete→re-insert. |
| 8 | **Workspace** | ✅ `current`, `seedVersion`, `setSeedVersion`, `import_store`, `reset_workspace`. seed_version/revisions/ledger are workspace STORAGE, never Store content; current/seedVersion are member reads, the three mutations are owner-only; import/reset are backup-confirmed (not undoable), take a `FOR UPDATE` workspace-row lock, and do their bulk clear+insert through table-owner helpers; import validates the complete Store ENVELOPE (`assert_store_envelope`) BEFORE any clear — exact top-level keys, `meta` shape, every collection a JSON array — then performs an atomic whole-store replacement (no partial write) and clears seed_version. |

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

- **All 25 of the contract's mutation methods are implemented** (clusters 1–8):
  the cluster-1–7 set plus the three workspace methods `setSeedVersion`,
  `importStore`, `reset`.
- **0 contract mutation methods remain.** All 40 SQL-backed contract methods
  (18 reads + 22 mutations) exist; the 6 client-only methods need no SQL.
- **Outside the repository contract** there is one further RPC,
  `fm_rpc_seed_store` (landed at Gate 3), which no contract method maps to — it
  exists to populate a workspace, not to serve the repository. It must not be
  counted against the 46. The catalog suite's documented-function-set assertion
  names it explicitly, so it cannot appear or disappear unnoticed.

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
| `fm_rpc_seed_store` ✅ | owner | 11 entity tables + `seed_items` + `seed_version` | ✗ | creates **182** roots |
| `fm_rpc_save_prediction_run` ✅ | owner/editor | run+snapshots+market+assessment+position (event/bout must pre-exist) | ✓ delete | ✗ |
| `fm_rpc_grade_bout` | owner/editor | bout result + every settlement on it | ✓ vector | ✗ |
| `fm_rpc_return_bout_to_pending` | owner/editor | inverse of grade | ✓ vector | ✗ |
| `fm_rpc_change_tracked_corner` | owner/editor | `corner` only | ✓ | ✗ |
| `fm_rpc_amend_tracked_price` | owner/editor | new market + repoint position | ✓ | ✗ |
| `fm_rpc_create_wager` ✅ | owner/editor | one wager (bout-lock-bound) | ✓ delete | ✗ |
| `fm_rpc_update_stake` / `_notes` ✅ | owner/editor | one column (bout-lock-bound) | ✓ | ✗ |
| `fm_rpc_settle_wager` ✅ | owner/editor | one wager's settlement (bout-lock-bound) | ✓ | ✗ |
| `fm_rpc_delete_wager` ✅ | owner/editor | one wager (bout-lock-bound) | ✓ re-INSERT | ✗ |
| `fm_rpc_confirm_entry` | owner/editor | review → confirmed + timestamp | ✓ | ✗ |
| `fm_rpc_confirm_all_pending` ✅ | owner/editor | all pending positions | ✓ vector | ✗ |
| `fm_rpc_rename_event` ✅ | owner/editor | event name/date/promotion (card-wide) | ✓ | ✗ |
| `fm_rpc_delete_pending_run` ✅ | owner/editor | aggregate + proven orphans | ✓ re-INSERT | root |
| `fm_rpc_clear_graded` ✅ | owner | all graded aggregates | ✓ re-INSERT | all cleared roots |
| `fm_rpc_save_prop` / `_settle_prop` / `_delete_prop` ✅ | owner/editor | prop | ✓ | root on delete |
| `fm_rpc_save_parlay` / `_delete_parlay` ✅ | owner/editor | parlay + legs | ✓ | root on delete |
| `fm_rpc_set_seed_version` ✅ | owner | `seed_version` only | ✗ | ✗ |
| `fm_rpc_import_store` ✅ | owner | delete-all + insert-all + ledger reset | ✗ backup | reset |
| `fm_rpc_reset_workspace` ✅ | owner | entities + ledger + `seed_version := NULL` | ✗ backup | cleared |
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
a phantom the grade never saw and never settled. `fm_rpc_save_prediction_run`
(cluster 5) was the first such RPC; **cluster 6 makes every wager mutation
bout-lock-bound** — create, updateStake, updateNotes, settle and remove each read
the wager's bout, take `lock_bout_dependents` in the canonical order, then check
the wager's own expected revision.

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

**182 logical roots: 178 prediction runs + 4 props + 0 parlays** (measured after
the pre-Gate-3 sync of `origin/main`, which refreshed the live ROI/upcoming
data). The Gate-1 figure was 164 = 160 + 4 + 0; the corpus grew by two cards,
and every count below is the post-sync measurement.

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
- a tombstoned root is never re-inserted by any later seed — **delivered at
  Gate 3**, and it had to reach descendants: applying a seed means inserting
  Events, Bouts, market snapshots, assessments and tracked positions, not merely
  roots. Gate 1 guaranteed only that the tombstone exists and is authoritative
  for reads.
- `fm_rpc_reset_workspace` clears entities, ledger and `seed_version`
- correcting a seeded record goes through `fm_rpc_import_store`, never a silent
  seed overwrite

`ON CONFLICT DO NOTHING` alone is insufficient: after clearing ROI the IDs no
longer conflict, so a stale seed would re-insert them.

### `fm_rpc_seed_store` as built (Gate 3)

`public.fm_rpc_seed_store(p_slug, p_store, p_seed_version, p_expected_revision)`
is the ONE non-contract RPC (§5) — it populates a workspace, it does not serve
the repository, and it is **not** counted against the contract's 46. It is
owner-only, revision-checked on the workspace row it writes, gated by the same
`app_private.assert_store_envelope` import uses, and serialized by the same
`FOR UPDATE` workspace lock, so two simultaneous seeds cannot both read an empty
ledger and both insert. It writes **no undo record**: a seed is an operator
action over storage, not a user edit of Store content, and re-running it is the
documented way to converge.

**A seed is not an import.** Import is a destructive whole-store *replacement*
that clears first. A seed is *additive* and must stay safe to re-run against a
workspace the user has since edited, so the ledger — never table membership —
decides eligibility, in one `NOT EXISTS`:

| ledger row for the root | seed does |
|---|---|
| none | inserts the root **and its descendant closure** |
| live | skips entirely (counted as `roots_skipped_live`) |
| tombstoned | skips entirely (counted as `roots_skipped_tombstoned`) — never resurrected |

The descendant closure is resolved from the store itself: assessments by
`runId`, tracked positions and wagers by `assessmentId`, prediction snapshots by
`runId`, and market snapshots by whichever of those references them. A market
snapshot shared with an already-seeded root simply conflicts and is skipped; one
referenced **only** by a tombstoned root is never reached at all. Events and
bouts are the §7 exception — shared card structure, never tombstoned — so they
are always offered with `ON CONFLICT DO NOTHING`, which is also what stops a seed
overwriting a user's rename.

The ledger insert deliberately carries **no** `ON CONFLICT DO NOTHING`:
eligibility is *defined* as "absent from the ledger", so a conflict there would
be a bug in the filter and must fail loudly rather than be absorbed.
`first_seed_version` records the version that **introduced** each root and is
never rewritten by a later seed; `workspaces.seed_version` advances every time.
A **virgin** workspace (empty ledger) adopts the store's `meta`, because that
seed is what makes it a migrated store; every later seed leaves `meta` alone,
since meta is Store content and a seed never silently overwrites Store content.

**The seed ANALYZEs what it loaded, and that is load-bearing.** A bulk load
leaves every seeded table with no planner statistics, and the defaults are
catastrophic for the lateral joins in `app_private.position_rows`. Measured on
the real corpus: on a freshly seeded workspace **both `fm_member_roi` and
`fm_member_upcoming` returned HTTP 500 with `57014` "canceling statement due to
statement timeout"** at the 8 s limit, and returned in **26 ms and 9 ms** once
statistics existed. A seed that leaves the app's primary read surface timing out
is not finished, so the `ANALYZE` belongs to the seed rather than to an operator
runbook step. It is skipped when nothing was inserted, so an idempotent re-seed
stays free. The 200-status assertion on those two reads in `rpc-seed.test.mjs` is
the regression guard.

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
migrated corpus, **95 of 273 snapshots are referenced by no
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

**Envelope gate before the clear.** `fm_rpc_import_store` calls
`app_private.assert_store_envelope(p_store)` BEFORE `clear_workspace_entities`.
It enforces the complete Store envelope server-side — the eleven top-level keys
exactly (no missing, no extra); `meta` exactly `{schemaVersion, migratedAt}` with
`schemaVersion` an **integer `>= 1` within int4 range** and `migratedAt` **null or
an ISO-8601 datetime WITH offset** matching the shared durable timestamp contract
— `date T HH:MM` with **bounded** fields (hour 00–23, minute 00–59), `:SS`
(00–59) and `.fraction` **optional** (a fraction only where seconds exist), then
a required `Z` or `±HH:MM` **within ±15:59**, and a year in **0001–9999** — whose `timestamptz` cast succeeds
(that cast is the calendar-validity check); and every one of the ten collections
present as a JSON array — rejecting any violation with `23514`
`invalidStoreEnvelope`. The bounds are explicit because unrestricted `\d{2}`
fields let through hour 24 and second 60, which Zod rejects but PostgreSQL
silently normalises, and because `z.iso.datetime({offset:true})` alone accepts
offsets (±16:00 … ±23:59) and year `0000`, neither of which `timestamptz` can
represent — `isoDateTime()` is refined to the same ranges so the two sides accept
exactly one set of timestamps (see DOMAIN_SCHEMA.md, "The durable timestamp contract"). This
closes a destructive bypass (the first cut coalesced missing collections to `[]`,
so `{meta:{…}}` alone cleared the workspace and returned `200`) and the follow-on
MetaSchema gaps where a fractional/zero/negative/oversized `schemaVersion` or a
malformed/no-offset/impossible `migratedAt` reached the later `::int`/
`::timestamptz` casts (surfacing as `22P02`/`22007` or a column CHECK) instead of
the promised pre-clear `23514`. `assert_store_envelope` is `STABLE` because it
anchors `migratedAt` with a `::timestamptz` cast. Deep per-row validation stays
with the JS adapter (Gate 6) and the DB's own CHECK/FK/triggers on insert; this
gate refuses a structurally or MetaSchema-invalid envelope before it can be
destructive.

**Round-trip fidelity.** The byte-for-byte `export → reset → import → export`
equality proven in the tests holds for a **canonical backup** — the output of
`fm_member_export_store`, which is the only store the app ever asks a user to keep
and re-import. It does **not** claim that every StoreSchema-valid spelling
survives verbatim: `migratedAt` is a `timestamptz`, so an arbitrary valid offset
or precision (`…T05:28+03:15`, minute precision, a non-UTC offset) is accepted and
normalized to the same **instant**, exported as the canonical `…+00:00`
microsecond form. Equality is therefore of the *instant*, not the *text*, for
non-canonical inputs; a canonical backup is already in that normalized form and so
round-trips identically. Stated plainly: **after PostgreSQL storage every
timestamp reads back as canonical UTC text, preserving the instant but not
necessarily the original spelling** — `2026-08-08T05:28:39+03:15` is exported as
`2026-08-08T02:13:39+00:00`. Compare instants (`Date.getTime()`), not strings,
for any timestamp that did not come straight from `fm_member_export_store`.

**Serialization.** import and reset take `SELECT … FROM workspaces WHERE id = :ws
FOR UPDATE` before the destructive replacement, so two concurrent
import/reset/import calls on the same workspace serialize — one runs its whole
clear+insert to COMMIT before the other begins, and neither observes a
half-applied state (proven by a two-client `Promise.all` test). This lock does
**not** serialize import/reset against the per-entity mutations (grade, wager and
prop/parlay ops), which lock at row granularity: a concurrent grade blocks
import's `DELETE` on the rows it holds, but full import-vs-mutation isolation
would require every mutation to also take the workspace lock — a broader protocol
deliberately deferred, since import/reset are rare owner-initiated, backup-gated
operations. That scope limit is stated rather than claimed away.

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
  **The write leg is now CLOSED (cluster 5).** `fm_rpc_save_prediction_run`
  accepts `probA`/`probB` as JS numbers over PostgREST, stores them, and
  `fm_member_prediction_aggregate` reads them back `Object.is`-identical and
  summing to exactly 1 — the full browser→PostgREST→`float8`→response→JS path,
  no fixture SQL on the write side. The `prob_complementary` CHECK is therefore
  now validated over real HTTP writes and is **final** for the transport path.
  The stored-profit recomputation that once kept the profit-equality constraint
  provisional was completed at Gate 3 over all **167** rows, so **both**
  constraints are now final.
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
  invocations each perform their own reset and each pass in full (**197/197 as of
  Gate 3**, across eleven files: export, routing/concurrency, cluster 1–2 RPCs,
  the cluster-3 undo suite, the cluster-4 deletion suite, the cluster-5
  prediction-save suite, the cluster-6 wager suite, the fixture-isolation suite,
  the cluster-7 props/parlays suite, the cluster-8 workspace suite and the
  Gate-3 seed suite). Gate 3's two workspaces (`api-seed`, `api-seed-b`) are
  created EMPTY by the fixture — no aggregate, no event, no bout — so every row
  those tests observe was authored by `fm_rpc_seed_store` itself and cannot be
  confused with fixture SQL. The probability of the shared WS_PUBLIC snapshot is
  centrally owned (`PUBLIC_PROB_A`/`PUBLIC_PROB_B`), not a fixture argument, so no
  file — in any order — can create or overwrite it; the fixture-isolation suite
  proves the decoupling and that a test can still select its own explicit
  probability in an isolated workspace.

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
| API-level repository tests vs local URL/key | `npm run test:api` — **197 assertions across eleven files, real HTTP, self-resetting** |
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

**Cluster 5** adds `fm_rpc_save_prediction_run`, `fm_member_prediction_aggregate`,
the two save helpers (`insert_prediction_aggregate`, `remove_created_aggregate`)
and their grants, growing it again:

| run | lines | SHA-256 |
|---|---|---|
| clean reset 1 | 778 | `1b2a379b…56cb` |
| clean reset 2 | 778 | `1b2a379b…56cb` |

**Cluster 6** adds `fm_rpc_create_wager`, `fm_rpc_update_stake`,
`fm_rpc_update_notes`, `fm_rpc_settle_wager`, `fm_rpc_delete_wager`, the
`lock_wager` helper and their grants, growing it again:

| run | lines | SHA-256 |
|---|---|---|
| clean reset 1 | 796 | `e161d525…e560` |
| clean reset 2 | 796 | `e161d525…e560` |

**Cluster 7** adds `fm_rpc_rename_event`, `fm_rpc_confirm_all_pending`,
`fm_rpc_save_prop`/`_settle_prop`/`_delete_prop`,
`fm_rpc_save_parlay`/`_delete_parlay`, the `write_ledger_root`/`tombstone_root`/
`check_pending_vector` helpers and their grants, growing it again:

| run | lines | SHA-256 |
|---|---|---|
| clean reset 1 | 826 | `c7e772bd…f84` |
| clean reset 2 | 826 | `c7e772bd…f84` |

**Cluster 8** adds `fm_member_workspace`, `fm_member_seed_version`,
`fm_rpc_set_seed_version`, `fm_rpc_import_store`, `fm_rpc_reset_workspace`, the
`clear_workspace_entities`/`import_store_entities` helpers and their grants,
growing it again:

| run | lines | SHA-256 |
|---|---|---|
| clean reset 1 | 847 | `5e50a7b8…6874` |
| clean reset 2 | 847 | `5e50a7b8…6874` |

The **cluster-8 corrective** adds `app_private.assert_store_envelope` and its grant
(the workspace-row `FOR UPDATE` locks are behavioural and do not change the
catalog), moving it to:

| run | lines | SHA-256 |
|---|---|---|
| clean reset 1 | 850 | `1dff5590…ed6a` |
| clean reset 2 | 850 | `1dff5590…ed6a` |

Byte-identical across both resets (`diff` empty), and both resets exited 0;
`test:db` 159 PASS after each.

**Gate 3** adds `public.fm_rpc_seed_store`, the table-owner
`app_private.seed_store_entities` helper and their grants, moving it once more:

| run | lines | SHA-256 |
|---|---|---|
| clean reset 1 | 856 | `60b49740…79cd` |
| clean reset 2 | 856 | `60b49740…79cd` |

Byte-identical across both resets (`diff` empty), both resets exited 0, and
`test:db` reported **174 PASS** after each.

Canonical value for the current (Gate 3) schema:

```
lines  856
sha256 60b497405f1fdb2eb24797f22e5bdd801423947621f98537348d3d443e1e79cd
```

The previous canonical value, `850` / `1dff559049c32956297559c5c63e2ee94f97f17bcb3bde68e26914d030e6ed6a`,
is the cluster-8-corrected schema and is retained above only as history.

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
`NODE_ENV` unset reproduces the approved hashes exactly, because Vite sets
production mode itself. The prohibition is only against **forcing**
`NODE_ENV=development`, which selects React's development build and inflates the
JS by roughly 350 KB — not a real change, but it does break byte comparison.
An earlier revision of this note wrongly claimed ambient
`NODE_ENV=production` was required.

### The approved bundle baseline (re-established at the pre-Gate-3 sync)

Every Stage 7 gate through cluster 8 asserted **byte identity** against the Gate-1
bundle, which was correct while Stage 7 was runtime-inert: it adds SQL, tests and
docs only, so the bundle could not move.

The pre-Gate-3 sync of `origin/main` changed that, legitimately. `src/roiData.js`,
`src/upcomingData.js` and `src/parlayData.js` are **bundled runtime data**, and
main refreshed them with live results (two new cards). The JS bundle therefore
*must* change, and continuing to claim the old hash would be false:

The **Update Fighters hotfix** (PR #9) then landed on main and its first
successful run committed regenerated `fightersData.js`, `fightHistory.js`,
`eloModule.js` and `sourceManifest.js`, moving the bundle once more. Both steps
are recorded so the provenance of each move is clear:

| | Gate 1 → cluster 8 | after main sync | **after Update Fighters** |
|---|---|---|---|
| JS filename | `index-BF9fYd6Y.js` | `index-B1hd45kI.js` | **`index-BNNY8Yhh.js`** |
| JS bytes | 4,648,208 | 4,768,408 | **4,785,292** (+16,884) |
| JS SHA-256 | `bc0fc915…e834` | `76a8ed98…0977` | **`259400aa…86ae`** |
| CSS SHA-256 | `4f72dadb…99cb` | `4f72dadb…99cb` | `4f72dadb…99cb` (**unchanged throughout**) |

```
js   4785292  259400aa11a0881a3c065198f00f43a0eac3bdf1adcbf8acc0840dd9810486ae
css    51993  4f72dadb556c0ea47a480c772cdb8f32b6d7212a14a7d6be020c27ad7cb299cb
```

**Gate 3 reproduces this baseline byte for byte** — same filenames
(`index-BNNY8Yhh.js`), same sizes, same digests — which is the evidence that the
gate is runtime-inert: it adds SQL, tests and docs only. The leak check re-run
against that bundle is still zero for `service_role`, `JWT_SECRET`,
`supabase_admin`, a Postgres URL, `app_private`, `fm_rpc_*`, `fm_member_*`,
`prior_state`, and now also `seed_store_entities` and `seed_items`.

The CSS is unchanged because no style changed — which is itself the evidence that
the JS delta is data, not behaviour. The **leak check** re-run against the new
bundle confirms it: zero occurrences of `service_role`, `JWT_SECRET`,
`supabase_admin`, a Postgres URL or an access token, and zero occurrences of
`app_private`, `fm_rpc_*`, `fm_member_*` or `prior_state` — Stage 7's server-only
surface is still entirely absent from the client. **This is the baseline later
gates compare against**; the Gate-1 hash is retained above only as history.

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
seed resurrection (clear ROI → advance `seed_version` → nothing returns) — **✅
delivered at Gate 3**, at both tiers: on the full corpus over HTTP in
`rpc-seed.test.mjs` and on a real slice at the SQL tier in
`01_behaviour.test.sql` ·
**the four shared bouts**, deleting each root and asserting the bout, its event
and the sibling root all survive with only the deleted root tombstoned · claim
concurrency (simultaneous claimants, exactly one wins) · unknown slug
distinguishable from claimed · authenticated non-member still reads a public
workspace through the public fallback · `anon` receives `permission denied` on
every `app_private` table · neither client role can `SET ROLE`.

### Gate 2 measurements

- browser → PostgREST → `float8` probability complementarity
- Postgres profit recomputation across all 167 computed rows
- negative-zero probe via `encode(pg_catalog.float8send(v),'hex') =
  '8000000000000000'`, over every persisted double column and a jsonb `-0`
  round-trip
- the full seeded stake corpus through `parse_positive_decimal` itself

Exact equality is retained only if the first two pass in the real stack;
otherwise the smallest sufficient bound is measured there. **Both passed** —
complementarity over the full PostgREST round trip at cluster 5, profit over all
167 rows at Gate 3 — so exact equality is retained for both and no bound was ever
measured.

### Gate 2 measurement results

Run in `supabase/tests/02_measurements.test.sql` (17 assertions).

**Both constraints are now FINAL.** This subsection records what the *SQL-tier*
measurements could and could not establish on their own; the constraints were
carried as provisional here because nothing in this file exercises the real
browser → PostgREST → `float8` → response → JavaScript path. Both were closed
later — complementarity by cluster 5's HTTP write leg, profit by Gate 3's
167-row recomputation.

- Complementarity: the in-database checks derive `pB` as `(1 - pA)` in SQL, so
  they test one serialized value, not two. They are labelled **SQL-only
  diagnostics**. The strongest available SQL check — two *independently parsed*
  text doubles summing to exactly 1 — passes for every pair tried, and the
  `CHECK` is proven to bind by rejecting a perturbed pair. *(Historically the
  real two-value round trip was outstanding here.)* **Closed at cluster 5**: the
  full PostgREST write→read round trip is proven in `test:api`, both values
  `Object.is`-identical and summing to exactly 1 (§11).
- Profit: the exact `<>` comparison binds, proven against a real stored row —
  the correct value is accepted and a value **one ULP off is rejected**.
  *(Historically the corpus-wide recomputation was waiting on Gate 3's seed.)*
  **Closed at Gate 3** — all 167 rows recomputed through
  `app_private.settlement_for` with zero value mismatches, zero bit mismatches
  and deviation 0; see "Gate 3 measurement results" below.

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

### Gate 3 measurement results

Run in `tests/api/rpc-seed.test.mjs` (25 assertions) against the real migrated
corpus loaded over HTTP by `fm_rpc_seed_store`, and in
`supabase/tests/01_behaviour.test.sql` (15 assertions) at the SQL tier.

**One HTTP seed call, measured.** 200 OK in ~200 ms:

```
roots_seeded 182   roots_skipped_live 0   roots_skipped_tombstoned 0
rows_inserted  events 18, bouts 178, predictionRuns 178, predictionSnapshots 273,
               marketSnapshots 177, bettingAssessments 178, trackedPositions 178,
               wagers 0, props 4, parlays 0, parlayLegs 0
ledger        182 rows, live 182, tombstoned 0   (predictionRun 178, prop 4)
```

**Profit — the constraint is now FINAL.** All 167 stored computed rows recomputed
through `app_private.settlement_for`:

```
rows=167  value_mismatches=0  bit_mismatches=0  max_deviation=0  union_mismatches=0
```

Outcome split `won=100, lost=64, void=2, push=1`. The comparison is shown to be
non-vacuous two ways: `'0.6666666666666665'::float8 = '0.6666666666666666'::float8`
is false, and recomputing the same rows with the naive `stake × (100/|odds|)` form
— the documented trap, which differs from the production
`stake × ((1 + 100/|odds|) − 1)` in the last bit — disagrees with real stored
values. Zero mismatches under a comparison that provably separates adjacent
doubles is what makes exact `<>` defensible.

**Determinism.** The same store seeded into two independent workspaces produces
an identical content digest over every column of every entity table
(`workspace_id`, `revision` and `row_updated_at` excluded as storage), and every
persisted double — snapshot `prob_a`/`prob_b`, position `profit_units`,
assessment `edge`/`ev`/`kelly` — is bit-identical by `float8send` hex. Stage 6
ids are derived, so this is agreement on values, not merely on counts.

**Idempotency.** Re-applying the same version, and then advancing the version,
each return `roots_seeded 0`, `roots_skipped_live 182`, every `rows_inserted`
count `0`, and an unchanged digest. `first_seed_version` stays at the version
that introduced each root while `workspaces.seed_version` advances. A user's
`fm_rpc_rename_event` on a seeded event survives every later seed.

**Non-resurrection.** After deleting one pending run root and clearing all 168
graded roots (168 removed, 168 tombstoned, 168 physically removed — no wager
pins any assessment in this corpus), a seed at a new version reports:

```
roots_seeded 0   roots_skipped_live 13   roots_skipped_tombstoned 169
rows_inserted    every collection 0
```

Nothing returns — not the run rows, not their prediction snapshots, not their
positions — which is precisely the assertion `ON CONFLICT DO NOTHING` alone could
never make true, because the deleted ids no longer conflict with anything. All 18
events and 178 bouts survive as card history, and the control workspace that
never deleted anything is untouched.

**The bulk-load statistics defect** (found by this gate's own tests, fixed inside
the seed) is recorded in §7: `fm_member_roi` and `fm_member_upcoming` both hit
the 8 s statement timeout on a freshly seeded workspace and return in 26 ms and
9 ms once the seed's `ANALYZE` has run.

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
