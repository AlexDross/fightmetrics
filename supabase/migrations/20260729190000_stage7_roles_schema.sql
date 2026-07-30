-- Stage 7 Gate 2 — roles, schema, immutable helpers, tables, RLS, ownership.
--
-- ONE FILE ON PURPOSE. Plan §2 specifies the role/ownership sequence as a single
-- transaction, and the Supabase CLI wraps each migration file in one. Role
-- creation and membership grants are transactional in Postgres (pg_authid and
-- pg_auth_members are ordinary catalogs), so a failure anywhere below rolls back
-- the temporary memberships too, and no residual grant can survive a failed run.
--
-- Order is exactly plan §2 steps 0-7. Steps 5-7 are ordered deliberately:
-- revoking membership before the ACL step would leave the migration role unable
-- to grant on objects it no longer co-owns.

-- ── (0) idempotent role creation ────────────────────────────────────────────
-- Roles are CLUSTER-level while `db reset` rebuilds only the database, so a bare
-- CREATE ROLE succeeds on the first reset and fails on every one after.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'fm_table_owner')
    THEN CREATE ROLE fm_table_owner NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'fm_public_reader')
    THEN CREATE ROLE fm_public_reader NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'fm_member_api')
    THEN CREATE ROLE fm_member_api NOLOGIN; END IF;
END $$;

-- ── (1) temporary SET ROLE capability for the migration role ────────────────
-- Needed because ALTER ... OWNER TO requires the ability to SET ROLE to the new
-- owner. Removed again at step 7.
DO $$ BEGIN
  EXECUTE format('GRANT fm_table_owner, fm_public_reader, fm_member_api TO %I', current_user);
END $$;

-- ── (2) temporary CREATE for the two function owners ────────────────────────
GRANT CREATE ON SCHEMA public TO fm_public_reader, fm_member_api;

-- ── (3) schema, helpers, tables ─────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS app_private;

-- Immutable helpers. Postgres forbids subqueries in CHECK, so these are
-- required, not stylistic: `SELECT count(*) FROM jsonb_object_keys(...)` is
-- illegal inline. Every one is IMMUTABLE with an empty search_path.

CREATE FUNCTION app_private.jsonb_key_count(j jsonb) RETURNS int
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
  SELECT count(*)::int FROM pg_catalog.jsonb_object_keys(j)
$$;

CREATE FUNCTION app_private.is_string_map(j jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
  SELECT pg_catalog.jsonb_typeof(j) = 'object'
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.jsonb_each(j) AS e(k, v)
                      WHERE pg_catalog.jsonb_typeof(e.v) <> 'string')
$$;

-- Postgres treats NaN = NaN as TRUE, so `v <> 'NaN'` is the correct rejection.
CREATE FUNCTION app_private.is_finite_or_null(v double precision) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = '' AS $$
  SELECT v IS NULL OR (v <> 'NaN'::double precision
                   AND v <> 'Infinity'::double precision
                   AND v <> '-Infinity'::double precision)
$$;

-- Range and underflow protection. NOT full JSON-number canonicalization:
-- 0.1000000000000000055511151231257827 and 0.1 both pass and parse to the same
-- double. Canonical form is enforced by the repository adapter, which round-trips
-- through String()/Number() and rejects anything failing Object.is.
CREATE FUNCTION app_private.is_js_double_map(j jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
  SELECT pg_catalog.jsonb_typeof(j) = 'object'
     AND NOT EXISTS (
       SELECT 1 FROM pg_catalog.jsonb_each(j) AS e(k, v)
       WHERE pg_catalog.jsonb_typeof(e.v) <> 'number'
          OR (e.v #>> '{}') ~ '^-0(\.0+)?([eE][+-]?[0-9]+)?$'
          OR ((e.v #>> '{}')::numeric <> 0
              AND (abs((e.v #>> '{}')::numeric) < 5e-324::numeric
                OR abs((e.v #>> '{}')::numeric) > 1.7976931348623157e308::numeric)))
$$;

CREATE FUNCTION app_private.array_is_distinct(a text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
  SELECT pg_catalog.cardinality(a)
       = (SELECT count(DISTINCT x) FROM pg_catalog.unnest(a) AS t(x))
$$;

-- Canonical argmax set: binds order, membership, distinctness and cardinality
-- in one value, so `leaders = expected` is the entire contract.
-- `dec` from the plan is a SQL keyword (synonym for DECIMAL) and will not parse
-- as a bare parameter name; renamed to dec_pct. Deviation recorded in §3.
CREATE FUNCTION app_private.finish_leaders_expected(ko int, sub int, dec_pct int) RETURNS text[]
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
  SELECT ARRAY(SELECT label FROM (VALUES ('KO/TKO',ko,1),('SUB',sub,2),('DEC',dec_pct,3))
               AS t(label,pct,ord) WHERE pct = GREATEST(ko,sub,dec_pct) ORDER BY ord)
$$;

-- Observed legacy range is -1600..900 for market odds and -472..472 for fair
-- lines, with nothing inside (-100, 100) and no zeros.
CREATE FUNCTION app_private.is_american_odds_or_null(v int) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = '' AS $$
  SELECT v IS NULL OR abs(v) >= 100
$$;

-- make_date is IMMUTABLE and raises on impossible dates, which is why this can
-- honestly be IMMUTABLE. A shape-only regex would accept 2026-02-30.
CREATE FUNCTION app_private.is_iso_date(t text) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
DECLARE d date;
BEGIN
  IF t !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RETURN false; END IF;
  d := pg_catalog.make_date(substr(t,1,4)::int, substr(t,6,2)::int, substr(t,9,2)::int);
  RETURN true;
EXCEPTION WHEN others THEN RETURN false;
END $$;

CREATE FUNCTION app_private.is_cutoff(j jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = '' AS $$
  SELECT j IS NULL OR (
    pg_catalog.jsonb_typeof(j) = 'object'
    AND app_private.jsonb_key_count(j) = 2
    AND j ? 'cornerA' AND j ? 'cornerB'
    AND (pg_catalog.jsonb_typeof(j->'cornerA') = 'null'
         OR app_private.is_iso_date(j->>'cornerA'))
    AND (pg_catalog.jsonb_typeof(j->'cornerB') = 'null'
         OR app_private.is_iso_date(j->>'cornerB')))
$$;

-- Each module carries exactly its eight fields, with nonempty strings including
-- for `note` and `maxObservedEventDate` when present rather than null.
CREATE FUNCTION app_private.is_source_manifest(j jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE SET search_path = '' AS $$
  SELECT j IS NULL OR (
    pg_catalog.jsonb_typeof(j) = 'object'
    AND NOT EXISTS (
      SELECT 1 FROM pg_catalog.jsonb_each(j) AS m(k, v)
      WHERE pg_catalog.jsonb_typeof(m.v) <> 'object'
         OR app_private.jsonb_key_count(m.v) <> 8
         OR NOT (m.v ? 'contentHash' AND m.v ? 'feedsV2' AND m.v ? 'file'
             AND m.v ? 'generatedAt' AND m.v ? 'generatorVersion'
             AND m.v ? 'maxObservedEventDate' AND m.v ? 'note'
             AND m.v ? 'verificationMethod')
         OR pg_catalog.jsonb_typeof(m.v->'feedsV2') <> 'boolean'
         OR pg_catalog.jsonb_typeof(m.v->'contentHash') <> 'string'
         OR length(m.v->>'contentHash') = 0
         OR pg_catalog.jsonb_typeof(m.v->'file') <> 'string'
         OR length(m.v->>'file') = 0
         OR pg_catalog.jsonb_typeof(m.v->'generatedAt') <> 'string'
         OR length(m.v->>'generatedAt') = 0
         OR pg_catalog.jsonb_typeof(m.v->'generatorVersion') <> 'string'
         OR length(m.v->>'generatorVersion') = 0
         OR pg_catalog.jsonb_typeof(m.v->'verificationMethod') <> 'string'
         OR length(m.v->>'verificationMethod') = 0
         OR (pg_catalog.jsonb_typeof(m.v->'note') <> 'null'
             AND (pg_catalog.jsonb_typeof(m.v->'note') <> 'string'
                  OR length(m.v->>'note') = 0))
         OR (pg_catalog.jsonb_typeof(m.v->'maxObservedEventDate') <> 'null'
             AND (pg_catalog.jsonb_typeof(m.v->'maxObservedEventDate') <> 'string'
                  OR length(m.v->>'maxObservedEventDate') = 0))))
$$;

CREATE FUNCTION app_private.decimal_from_american(odds int) RETURNS double precision
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SET search_path = '' AS $$
  SELECT CASE WHEN odds > 0 THEN 1 + odds::double precision / 100
              ELSE 1 + 100 / abs(odds)::double precision END
$$;

-- 32-char bound is MEASURED: over a 699,826-value seeded corpus the longest
-- String(finite positive double) was 24 chars (0.0000057692833136856875).
-- NO per-component caps: a {1,20} fractional cap rejected 12,823 of those
-- values (1.8%), including the 24-char maximum.
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

-- ── Tables ──────────────────────────────────────────────────────────────────
-- Stage 6 IDs are deterministic (eventIdFor derives from promotion|date|name),
-- so two workspaces migrating the same seed produce identical UUIDs. Every table
-- therefore uses PRIMARY KEY (workspace_id, id) with COMPOSITE foreign keys,
-- making cross-workspace references structurally impossible.
--
-- Frequently-updated unions are normalized into COLUMNS, not JSONB, so Postgres
-- validates timestamps natively — an immutable JSONB timestamp CHECK is
-- unachievable because text::timestamptz is STABLE. JSONB survives only for
-- genuinely open bags: external_ids, feature_vector, source_manifest,
-- fight_history_cutoff.

CREATE TABLE app_private.workspaces (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL UNIQUE,
  is_public      boolean NOT NULL DEFAULT true,
  schema_version int NOT NULL DEFAULT 1,
  seed_version   text,
  migrated_at    timestamptz,
  revision       bigint NOT NULL DEFAULT 1,
  row_updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workspaces_slug_shape CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  CONSTRAINT workspaces_schema_version_positive CHECK (schema_version >= 1)
);

CREATE TABLE app_private.workspace_members (
  workspace_id uuid NOT NULL REFERENCES app_private.workspaces(id)
                 ON UPDATE RESTRICT ON DELETE RESTRICT,
  -- The ONLY cascade in the schema: a deleted auth user takes its membership.
  user_id      uuid NOT NULL REFERENCES auth.users(id)
                 ON UPDATE RESTRICT ON DELETE CASCADE,
  role         text NOT NULL CHECK (role IN ('owner','editor','viewer')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE app_private.events (
  workspace_id uuid NOT NULL REFERENCES app_private.workspaces(id)
                 ON UPDATE RESTRICT ON DELETE RESTRICT,
  id           uuid NOT NULL,
  promotion    text CHECK (promotion IS NULL OR length(promotion) > 0),
  name         text NOT NULL CHECK (length(name) > 0),
  date         date NOT NULL,
  external_ids jsonb NOT NULL DEFAULT '{}'::jsonb
                 CHECK (app_private.is_string_map(external_ids)),
  created_at   timestamptz NOT NULL,
  updated_at   timestamptz,
  revision       bigint NOT NULL DEFAULT 1,
  row_updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, id)
);

CREATE TABLE app_private.bouts (
  workspace_id uuid NOT NULL,
  id           uuid NOT NULL,
  event_id     uuid NOT NULL,
  corner_a_display_name text NOT NULL CHECK (length(corner_a_display_name) > 0),
  corner_a_fighter_key  text NOT NULL CHECK (length(corner_a_fighter_key) > 0),
  corner_a_fighter_id   uuid,
  corner_b_display_name text NOT NULL CHECK (length(corner_b_display_name) > 0),
  corner_b_fighter_key  text NOT NULL CHECK (length(corner_b_fighter_key) > 0),
  corner_b_fighter_id   uuid,
  division      text NOT NULL CHECK (length(division) > 0),
  board_order   int,
  scheduled_rounds int,
  -- BoutResult union, normalized. `method` exists only in the resolved variant.
  result_status  text NOT NULL CHECK (result_status IN ('pending','resolved')),
  result_outcome text CHECK (result_outcome IN ('A','B','draw','noContest')),
  result_method  text CHECK (result_method IN ('KO/TKO','SUB','DEC')),
  external_ids jsonb NOT NULL DEFAULT '{}'::jsonb
                 CHECK (app_private.is_string_map(external_ids)),
  created_at   timestamptz NOT NULL,
  updated_at   timestamptz,
  revision       bigint NOT NULL DEFAULT 1,
  row_updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, id),
  CONSTRAINT bouts_event_fk FOREIGN KEY (workspace_id, event_id)
    REFERENCES app_private.events(workspace_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT bouts_result_union CHECK (
    (result_status = 'pending'  AND result_outcome IS NULL AND result_method IS NULL)
 OR (result_status = 'resolved' AND result_outcome IS NOT NULL)),
  -- Mirrors the Stage 6 BOUT_SAME_CORNERS invariant, which compares displayName.
  CONSTRAINT bouts_distinct_corners CHECK (
    corner_a_display_name <> corner_b_display_name),
  -- Referenced by the composite FK from props.
  UNIQUE (workspace_id, id, event_id)
);

CREATE TABLE app_private.prediction_runs (
  workspace_id uuid NOT NULL,
  -- text, not uuid: legacy ids are carried verbatim (`${ms}-${base36}`).
  id           text NOT NULL,
  bout_id      uuid NOT NULL,
  legacy_entry_id text,
  created_at   timestamptz NOT NULL,
  decision_snapshot_id uuid NOT NULL,
  target_event_date_at_capture date NOT NULL,
  finish_status text NOT NULL CHECK (finish_status IN ('absent','computed')),
  finish_ko_pct  int CHECK (finish_ko_pct  BETWEEN 0 AND 100),
  finish_sub_pct int CHECK (finish_sub_pct BETWEEN 0 AND 100),
  finish_dec_pct int CHECK (finish_dec_pct BETWEEN 0 AND 100),
  finish_leaders text[],
  corner_a_is_prospect_at_capture boolean,
  corner_b_is_prospect_at_capture boolean,
  includes_prospect_at_capture    boolean,
  provenance_completeness text NOT NULL
    CHECK (provenance_completeness IN ('full','partial','none')),
  PRIMARY KEY (workspace_id, id),
  CONSTRAINT prediction_runs_id_shape CHECK (
    id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 OR id ~ '^[0-9]{13}-[a-z0-9]{6}$'),
  CONSTRAINT prediction_runs_bout_fk FOREIGN KEY (workspace_id, bout_id)
    REFERENCES app_private.bouts(workspace_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  -- Measured over all 160 legacy rows: percentages sum to 99, 100 or 101, and
  -- leaders reproduces the legacy projectedFinish on 160/160 as the argmax set.
  CONSTRAINT prediction_runs_finish_union CHECK (
    (finish_status = 'absent'
      AND finish_ko_pct IS NULL AND finish_sub_pct IS NULL
      AND finish_dec_pct IS NULL AND finish_leaders IS NULL)
 OR (finish_status = 'computed'
      AND finish_ko_pct IS NOT NULL AND finish_sub_pct IS NOT NULL
      AND finish_dec_pct IS NOT NULL AND finish_leaders IS NOT NULL
      AND finish_ko_pct + finish_sub_pct + finish_dec_pct BETWEEN 99 AND 101
      AND finish_leaders
          = app_private.finish_leaders_expected(finish_ko_pct, finish_sub_pct, finish_dec_pct))),
  -- includesProspect is the exact OR ONLY when BOTH corner flags are known.
  -- With either flag NULL the value is unverified and anything is allowed:
  -- `a OR b` is NULL when one side is NULL and the other is false, so the
  -- unguarded IS NOT DISTINCT FROM silently forced includes_prospect to NULL in
  -- exactly the case the legacy data cannot speak to.
  CONSTRAINT prediction_runs_prospect_or CHECK (
    corner_a_is_prospect_at_capture IS NULL
 OR corner_b_is_prospect_at_capture IS NULL
 OR includes_prospect_at_capture IS NOT DISTINCT FROM
      (corner_a_is_prospect_at_capture OR corner_b_is_prospect_at_capture)),
  UNIQUE (workspace_id, id, bout_id)
);

CREATE TABLE app_private.prediction_snapshots (
  workspace_id uuid NOT NULL,
  id           uuid NOT NULL,
  run_id       text NOT NULL,
  bout_id      uuid NOT NULL,
  basis        text NOT NULL CHECK (basis IN ('legacy-v1-unversioned','v2')),
  model_version   text CHECK (model_version IS NULL OR length(model_version) > 0),
  model_coef_hash text CHECK (model_coef_hash IS NULL OR length(model_coef_hash) > 0),
  prob_a       double precision NOT NULL CHECK (prob_a >= 0 AND prob_a <= 1),
  prob_b       double precision NOT NULL CHECK (prob_b >= 0 AND prob_b <= 1),
  winner_corner text NOT NULL CHECK (winner_corner IN ('A','B')),
  captured_at  timestamptz NOT NULL,
  capture_mode text NOT NULL CHECK (capture_mode IN ('live','reconstructed','unknown')),
  reconstruction_type text CHECK (reconstruction_type IN ('backfilled','rewritten')),
  reconstruction_source_commit text,
  reconstruction_prior_v2_p_a double precision,
  reconstruction_prior_v2_p_b double precision,
  feature_vector jsonb CHECK (feature_vector IS NULL
                              OR app_private.is_js_double_map(feature_vector)),
  fight_history_cutoff jsonb CHECK (app_private.is_cutoff(fight_history_cutoff)),
  source_manifest jsonb CHECK (app_private.is_source_manifest(source_manifest)),
  PRIMARY KEY (workspace_id, id),
  -- Provisional per plan §4: all 237 stored pairs satisfy this exactly. Gate 2
  -- tests the full browser -> PostgREST -> float8 -> response -> JS path before
  -- it is accepted as final.
  CONSTRAINT prediction_snapshots_prob_complementary CHECK (prob_a + prob_b = 1),
  CONSTRAINT prediction_snapshots_winner_is_argmax CHECK (
    winner_corner = CASE WHEN prob_a >= prob_b THEN 'A' ELSE 'B' END),
  CONSTRAINT prediction_snapshots_reconstruction_union CHECK (
    (reconstruction_type IS NULL
      AND reconstruction_source_commit IS NULL
      AND reconstruction_prior_v2_p_a IS NULL
      AND reconstruction_prior_v2_p_b IS NULL)
 OR (reconstruction_type IS NOT NULL
      AND reconstruction_source_commit IS NOT NULL
      AND length(reconstruction_source_commit) > 0
      -- priorV2 is a nullable PAIR: both present or both absent.
      AND (reconstruction_prior_v2_p_a IS NULL)
        = (reconstruction_prior_v2_p_b IS NULL))),
  -- priorV2 values are PROBABILITIES: bounded, not merely finite. `finite` alone
  -- admitted 42 and -3.
  CONSTRAINT prediction_snapshots_prior_probability CHECK (
    (reconstruction_prior_v2_p_a IS NULL
      OR (reconstruction_prior_v2_p_a >= 0 AND reconstruction_prior_v2_p_a <= 1))
    AND (reconstruction_prior_v2_p_b IS NULL
      OR (reconstruction_prior_v2_p_b >= 0 AND reconstruction_prior_v2_p_b <= 1))),
  -- BICONDITIONAL. A 'reconstructed' capture_mode with no reconstruction record,
  -- or reconstruction fields on a 'live' snapshot, were both accepted before.
  CONSTRAINT prediction_snapshots_capture_mode_biconditional CHECK (
    (capture_mode = 'reconstructed') = (reconstruction_type IS NOT NULL)),
  -- Composite FK carrying the discriminator: a snapshot cannot name one run
  -- while carrying another run's bout.
  CONSTRAINT prediction_snapshots_run_fk
    FOREIGN KEY (workspace_id, run_id, bout_id)
    REFERENCES app_private.prediction_runs(workspace_id, id, bout_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE,
  UNIQUE (workspace_id, id, run_id, bout_id),
  UNIQUE (workspace_id, run_id, basis)
);

-- Closes the run <-> snapshot cycle. DEFERRABLE so a delete can order itself.
ALTER TABLE app_private.prediction_runs
  ADD CONSTRAINT run_decision_snapshot_fk
  FOREIGN KEY (workspace_id, decision_snapshot_id, id, bout_id)
  REFERENCES app_private.prediction_snapshots(workspace_id, id, run_id, bout_id)
  ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

CREATE TABLE app_private.market_snapshots (
  workspace_id uuid NOT NULL,
  id           uuid NOT NULL,
  bout_id      uuid NOT NULL,
  -- Null ONLY for legacyTrackedOverride: the legacy row records the corrected
  -- price but never when it was edited, so any timestamp would be invented.
  captured_at  timestamptz,
  source       text NOT NULL CHECK (source IN ('manual','legacyTrackedOverride')),
  odds_a       int CHECK (app_private.is_american_odds_or_null(odds_a)),
  odds_b       int CHECK (app_private.is_american_odds_or_null(odds_b)),
  PRIMARY KEY (workspace_id, id),
  -- BICONDITIONAL, both directions asserted. A one-way rule made the source
  -- label unfalsifiable.
  CONSTRAINT market_snapshots_captured_at_biconditional CHECK (
    (captured_at IS NULL) = (source = 'legacyTrackedOverride')),
  -- A snapshot with neither corner priced records no market fact at all.
  CONSTRAINT market_snapshots_at_least_one_price CHECK (
    odds_a IS NOT NULL OR odds_b IS NOT NULL),
  CONSTRAINT market_snapshots_bout_fk FOREIGN KEY (workspace_id, bout_id)
    REFERENCES app_private.bouts(workspace_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  UNIQUE (workspace_id, id, bout_id)
);

CREATE TABLE app_private.betting_assessments (
  workspace_id uuid NOT NULL,
  id           uuid NOT NULL,
  bout_id      uuid NOT NULL,
  run_id       text NOT NULL,
  prediction_snapshot_id uuid NOT NULL,
  market_snapshot_id     uuid,
  frozen_at    timestamptz NOT NULL,
  fair_line_a  int CHECK (app_private.is_american_odds_or_null(fair_line_a)),
  fair_line_b  int CHECK (app_private.is_american_odds_or_null(fair_line_b)),
  edge_a  double precision CHECK (app_private.is_finite_or_null(edge_a)),
  edge_b  double precision CHECK (app_private.is_finite_or_null(edge_b)),
  ev_a    double precision CHECK (app_private.is_finite_or_null(ev_a)),
  ev_b    double precision CHECK (app_private.is_finite_or_null(ev_b)),
  kelly_a double precision CHECK (app_private.is_finite_or_null(kelly_a)),
  kelly_b double precision CHECK (app_private.is_finite_or_null(kelly_b)),
  tier    text CHECK (tier IN ('NO BET','LEAN','BET','STRONG BET')),
  recommended_corner text CHECK (recommended_corner IN ('A','B')),
  tier_provenance text NOT NULL
    CHECK (tier_provenance IN ('stored','frozenTier','absent')),
  recommended_corner_provenance text NOT NULL
    CHECK (recommended_corner_provenance IN ('stored','absentInLegacy')),
  PRIMARY KEY (workspace_id, id),
  CONSTRAINT betting_assessments_run_fk
    FOREIGN KEY (workspace_id, run_id, bout_id)
    REFERENCES app_private.prediction_runs(workspace_id, id, bout_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT betting_assessments_snapshot_fk
    FOREIGN KEY (workspace_id, prediction_snapshot_id, run_id, bout_id)
    REFERENCES app_private.prediction_snapshots(workspace_id, id, run_id, bout_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT betting_assessments_market_fk
    FOREIGN KEY (workspace_id, market_snapshot_id, bout_id)
    REFERENCES app_private.market_snapshots(workspace_id, id, bout_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  -- Fair line, edge, EV and Kelly are all model x MARKET derivations. With no
  -- market there is nothing to derive them from, so a value here would be
  -- fabricated. Previously any number was accepted alongside a NULL market.
  CONSTRAINT betting_assessments_market_derived_null CHECK (
    market_snapshot_id IS NOT NULL
 OR (fair_line_a IS NULL AND fair_line_b IS NULL
     AND edge_a IS NULL AND edge_b IS NULL
     AND ev_a IS NULL AND ev_b IS NULL
     AND kelly_a IS NULL AND kelly_b IS NULL)),
  UNIQUE (workspace_id, id, bout_id)
);

CREATE TABLE app_private.tracked_positions (
  workspace_id uuid NOT NULL,
  id           uuid NOT NULL,
  bout_id      uuid NOT NULL,
  assessment_id uuid NOT NULL,
  -- The price this position is SCORED at, independent of the assessment's
  -- prediction-time market. Amending it appends a NEW snapshot and repoints
  -- only this column, so the frozen assessment is never rewritten.
  market_snapshot_id uuid,
  origin  text NOT NULL CHECK (origin IN ('legacyMigration','appCreated')),
  corner  text NOT NULL CHECK (corner IN ('A','B')),
  stake_units numeric NOT NULL CHECK (stake_units > 0),
  stake_source text NOT NULL CHECK (stake_source IN ('explicit','defaultedFlat1u')),
  opened_at   timestamptz NOT NULL,
  settlement_status  text NOT NULL CHECK (settlement_status IN ('open','settled')),
  settlement_outcome text CHECK (settlement_outcome IN ('won','lost','push','void')),
  financial_status   text CHECK (financial_status IN ('computed','uncomputable')),
  financial_reason   text CHECK (financial_reason IN ('missingSelectedCornerOdds')),
  profit_units double precision CHECK (app_private.is_finite_or_null(profit_units)),
  settled_at   timestamptz,
  review_status text NOT NULL
    CHECK (review_status IN ('notRequired','pending','confirmed')),
  review_reason text CHECK (review_reason IN ('autoGenerated')),
  confirmed_at  timestamptz,
  notes text,
  revision       bigint NOT NULL DEFAULT 1,
  row_updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, id),
  CONSTRAINT tracked_positions_assessment_fk
    FOREIGN KEY (workspace_id, assessment_id, bout_id)
    REFERENCES app_private.betting_assessments(workspace_id, id, bout_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT tracked_positions_market_fk
    FOREIGN KEY (workspace_id, market_snapshot_id, bout_id)
    REFERENCES app_private.market_snapshots(workspace_id, id, bout_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT tracked_positions_settlement_union CHECK (
    (settlement_status = 'open'
      AND settlement_outcome IS NULL AND financial_status IS NULL
      AND financial_reason IS NULL AND profit_units IS NULL AND settled_at IS NULL)
 OR (settlement_status = 'settled'
      AND settlement_outcome IS NOT NULL AND financial_status IS NOT NULL
      AND ((financial_status = 'computed'
            AND profit_units IS NOT NULL AND financial_reason IS NULL)
        OR (financial_status = 'uncomputable'
            AND profit_units IS NULL AND financial_reason IS NOT NULL)))),
  CONSTRAINT tracked_positions_review_union CHECK (
    (review_status = 'notRequired' AND review_reason IS NULL AND confirmed_at IS NULL)
 OR (review_status = 'pending'     AND review_reason = 'autoGenerated'
                                   AND confirmed_at IS NULL)
 OR (review_status = 'confirmed'   AND review_reason = 'autoGenerated')),
  -- A null settlement/confirmation time is a legacy-only concession: those rows
  -- never recorded one. Anything the app does itself must supply a real time.
  CONSTRAINT tracked_positions_appcreated_settled_at CHECK (
    NOT (settlement_status = 'settled' AND settled_at IS NULL
         AND origin <> 'legacyMigration')),
  CONSTRAINT tracked_positions_appcreated_confirmed_at CHECK (
    NOT (review_status = 'confirmed' AND confirmed_at IS NULL
         AND origin <> 'legacyMigration'))
);

CREATE TABLE app_private.wagers (
  workspace_id uuid NOT NULL,
  id           uuid NOT NULL,
  bout_id      uuid NOT NULL,
  assessment_id uuid NOT NULL,
  market_snapshot_id uuid,
  corner  text NOT NULL CHECK (corner IN ('A','B')),
  stake_units numeric NOT NULL CHECK (stake_units > 0),
  placed_at   timestamptz NOT NULL,
  settlement_status  text NOT NULL CHECK (settlement_status IN ('open','settled')),
  settlement_outcome text CHECK (settlement_outcome IN ('won','lost','push','void')),
  financial_status   text CHECK (financial_status IN ('computed','uncomputable')),
  financial_reason   text CHECK (financial_reason IN ('missingSelectedCornerOdds')),
  profit_units double precision CHECK (app_private.is_finite_or_null(profit_units)),
  settled_at   timestamptz,
  notes text,
  external_ids jsonb NOT NULL DEFAULT '{}'::jsonb
                 CHECK (app_private.is_string_map(external_ids)),
  revision       bigint NOT NULL DEFAULT 1,
  row_updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, id),
  CONSTRAINT wagers_assessment_fk
    FOREIGN KEY (workspace_id, assessment_id, bout_id)
    REFERENCES app_private.betting_assessments(workspace_id, id, bout_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT wagers_market_fk
    FOREIGN KEY (workspace_id, market_snapshot_id, bout_id)
    REFERENCES app_private.market_snapshots(workspace_id, id, bout_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT wagers_settlement_union CHECK (
    (settlement_status = 'open'
      AND settlement_outcome IS NULL AND financial_status IS NULL
      AND financial_reason IS NULL AND profit_units IS NULL AND settled_at IS NULL)
 OR (settlement_status = 'settled'
      AND settlement_outcome IS NOT NULL AND financial_status IS NOT NULL
      AND ((financial_status = 'computed'
            AND profit_units IS NOT NULL AND financial_reason IS NULL)
        OR (financial_status = 'uncomputable'
            AND profit_units IS NULL AND financial_reason IS NOT NULL)))),
  -- Wagers have NO legacy-null concession. Migration creates zero of them, so
  -- every wager is app-created and must carry a real settlement time. Only
  -- tracked_positions may omit it, and only for origin 'legacyMigration'.
  CONSTRAINT wagers_settled_at_required CHECK (
    settlement_status <> 'settled' OR settled_at IS NOT NULL)
);

CREATE TABLE app_private.props (
  workspace_id uuid NOT NULL,
  id           text NOT NULL,
  event_id     uuid NOT NULL,
  target_kind  text NOT NULL CHECK (target_kind IN ('bout','event')),
  target_bout_id  uuid,
  target_corner   text CHECK (target_corner IN ('A','B')),
  target_event_id uuid,
  method    text NOT NULL CHECK (length(method) > 0),
  prop_type text NOT NULL CHECK (length(prop_type) > 0),
  label     text NOT NULL CHECK (length(label) > 0),
  odds        int NOT NULL CHECK (abs(odds) >= 100),
  stake_units numeric NOT NULL CHECK (stake_units > 0),
  result      text NOT NULL CHECK (result IN ('PENDING','WON','LOST','PUSH')),
  pick_source text NOT NULL CHECK (pick_source IN ('human','model')),
  created_at  timestamptz NOT NULL,
  revision       bigint NOT NULL DEFAULT 1,
  row_updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, id),
  CONSTRAINT props_id_shape CHECK (
    id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 OR id ~ '^[0-9]{13}-[a-z0-9]{6}$'),
  CONSTRAINT props_event_fk FOREIGN KEY (workspace_id, event_id)
    REFERENCES app_private.events(workspace_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT props_target_union CHECK (
    (target_kind = 'bout'  AND target_bout_id IS NOT NULL AND target_event_id IS NULL)
 OR (target_kind = 'event' AND target_event_id IS NOT NULL
     AND target_bout_id IS NULL AND target_corner IS NULL)),
  -- The prop's event must be the bout's event, enforced structurally.
  CONSTRAINT props_target_bout_fk FOREIGN KEY (workspace_id, target_bout_id, event_id)
    REFERENCES app_private.bouts(workspace_id, id, event_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT props_target_event_matches CHECK (
    target_event_id IS NULL OR target_event_id = event_id)
);

CREATE TABLE app_private.parlays (
  workspace_id uuid NOT NULL,
  id           text NOT NULL,
  event_id     uuid,
  combined_odds int NOT NULL CHECK (abs(combined_odds) >= 100),
  stake_units  numeric NOT NULL CHECK (stake_units > 0),
  pick_source  text NOT NULL CHECK (pick_source IN ('human','model')),
  created_at   timestamptz NOT NULL,
  PRIMARY KEY (workspace_id, id),
  CONSTRAINT parlays_id_shape CHECK (
    id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 OR id ~ '^[0-9]{13}-[a-z0-9]{6}$'),
  CONSTRAINT parlays_event_fk FOREIGN KEY (workspace_id, event_id)
    REFERENCES app_private.events(workspace_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE TABLE app_private.parlay_legs (
  workspace_id uuid NOT NULL,
  parlay_id    text NOT NULL,
  leg_index    int  NOT NULL CHECK (leg_index >= 0),
  bout_id      uuid NOT NULL,
  picked_corner text NOT NULL CHECK (picked_corner IN ('A','B')),
  model_default_corner text CHECK (model_default_corner IN ('A','B')),
  model_prob_at_build double precision
    CHECK (model_prob_at_build IS NULL
           OR (model_prob_at_build >= 0 AND model_prob_at_build <= 1)),
  overridden boolean NOT NULL,
  PRIMARY KEY (workspace_id, parlay_id, leg_index),
  CONSTRAINT parlay_legs_parlay_fk FOREIGN KEY (workspace_id, parlay_id)
    REFERENCES app_private.parlays(workspace_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT parlay_legs_bout_fk FOREIGN KEY (workspace_id, bout_id)
    REFERENCES app_private.bouts(workspace_id, id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  -- A parlay cannot stake the same bout twice: the legs would not be
  -- independent and the combined odds would be meaningless.
  CONSTRAINT parlay_legs_bout_unique UNIQUE (workspace_id, parlay_id, bout_id)
);

-- Seed ledger. Events and Bouts are NEVER tombstoned: they are shared card
-- structure. 4 bouts are already referenced by both a prop and a prediction run.
CREATE TABLE app_private.seed_items (
  workspace_id uuid NOT NULL REFERENCES app_private.workspaces(id)
                 ON UPDATE RESTRICT ON DELETE RESTRICT,
  root_type    text NOT NULL CHECK (root_type IN ('predictionRun','prop','parlay')),
  root_id      text NOT NULL,
  first_seed_version text,
  removed_at   timestamptz,
  PRIMARY KEY (workspace_id, root_type, root_id)
);

CREATE TABLE app_private.undo_log (
  workspace_id uuid NOT NULL REFERENCES app_private.workspaces(id)
                 ON UPDATE RESTRICT ON DELETE RESTRICT,
  id           uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id)
                 ON UPDATE RESTRICT ON DELETE CASCADE,
  op           text NOT NULL CHECK (length(op) > 0),
  prior_state     jsonb NOT NULL,
  revision_vector jsonb NOT NULL,
  absent_ids      jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  consumed_at  timestamptz,
  PRIMARY KEY (workspace_id, id)
);

CREATE INDEX bouts_event_idx            ON app_private.bouts (workspace_id, event_id);
CREATE INDEX prediction_runs_bout_idx   ON app_private.prediction_runs (workspace_id, bout_id);
CREATE INDEX prediction_snapshots_run_idx ON app_private.prediction_snapshots (workspace_id, run_id);
CREATE INDEX betting_assessments_run_idx  ON app_private.betting_assessments (workspace_id, run_id);
CREATE INDEX tracked_positions_bout_idx ON app_private.tracked_positions (workspace_id, bout_id);
CREATE INDEX tracked_positions_assessment_idx ON app_private.tracked_positions (workspace_id, assessment_id);
CREATE INDEX wagers_bout_idx            ON app_private.wagers (workspace_id, bout_id);
CREATE INDEX undo_log_expiry_idx        ON app_private.undo_log (workspace_id, expires_at);

-- ── DEFINER helpers ─────────────────────────────────────────────────────────
-- is_member is SECURITY DEFINER owned by fm_table_owner, so it bypasses RLS on
-- workspace_members and the membership policies are NON-RECURSIVE. auth.uid()
-- resolves inside DEFINER functions because PostgREST sets request.jwt.claims
-- as a per-request GUC.
-- Resolves the caller WITHOUT touching the auth schema.
--
-- Calling auth.uid() from these functions failed with `permission denied for
-- schema auth`: neither fm_member_api nor fm_table_owner holds USAGE on auth,
-- so the entire authenticated API was unusable. Granting USAGE on auth to the
-- API roles would be far wider than needed — auth.uid() only reads a GUC. This
-- reimplements exactly what auth.uid() does, from the request GUCs alone, so no
-- role needs auth access in order to identify the caller.
CREATE FUNCTION app_private.current_user_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT nullif(
    coalesce(
      nullif(pg_catalog.current_setting('request.jwt.claim.sub', true), ''),
      nullif(pg_catalog.current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ), '')::uuid
$$;

CREATE FUNCTION app_private.is_member(p_workspace uuid, p_roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM app_private.workspace_members m
                  WHERE m.workspace_id = p_workspace
                    AND m.user_id = app_private.current_user_id()
                    AND m.role = ANY (p_roles))
$$;

CREATE FUNCTION app_private.workspace_has_owner(p_workspace uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM app_private.workspace_members m
                  WHERE m.workspace_id = p_workspace AND m.role = 'owner')
$$;

-- fm_member_api's own SELECT ... FOR UPDATE on workspaces is filtered by the
-- member policy and finds nothing before membership exists. This narrow
-- table-owner helper resolves it. It discloses ONLY whether a slug exists and is
-- unclaimed — never the contents of a private workspace. The FOR UPDATE row lock
-- serializes concurrent claims: the second blocks, then observes 'claimed'.
CREATE FUNCTION app_private.lock_unclaimed_workspace(p_slug text)
RETURNS TABLE (workspace_id uuid, status text)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid;
BEGIN
  SELECT w.id INTO v_id FROM app_private.workspaces w
   WHERE w.slug = p_slug FOR UPDATE;
  IF v_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, 'unknown'::text; RETURN;
  END IF;
  IF app_private.workspace_has_owner(v_id) THEN
    RETURN QUERY SELECT v_id, 'claimed'::text; RETURN;
  END IF;
  RETURN QUERY SELECT v_id, 'unclaimed'::text;
END $$;

-- The whole bootstrap — lock, re-check, insert — in ONE table-owner helper.
--
-- Splitting it was unworkable: workspace_members_write requires an owner to
-- already exist, so fm_member_api could never insert the FIRST owner and the
-- claim failed with `new row violates row-level security policy for table
-- workspace_members`. This runs as fm_table_owner, which owns the table and is
-- therefore not subject to its policies (RLS is enabled, deliberately not
-- FORCEd), so the bootstrap insert succeeds while every other path stays bound.
--
-- Concurrency is preserved BECAUSE the re-check happens inside the same
-- transaction as the FOR UPDATE row lock taken on the workspace: a second
-- claimant blocks on the lock, and once it proceeds it observes the owner the
-- first one inserted and gets 'claimed'. Exactly one claimant wins.
CREATE FUNCTION app_private.claim_workspace_ownership(p_slug text, p_user uuid)
RETURNS TABLE (workspace_id uuid, status text)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid;
BEGIN
  SELECT w.id INTO v_id FROM app_private.workspaces w
   WHERE w.slug = p_slug FOR UPDATE;
  IF v_id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, 'unknown'::text; RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM app_private.workspace_members m
              WHERE m.workspace_id = v_id AND m.role = 'owner') THEN
    RETURN QUERY SELECT v_id, 'claimed'::text; RETURN;
  END IF;
  INSERT INTO app_private.workspace_members (workspace_id, user_id, role)
       VALUES (v_id, p_user, 'owner');
  RETURN QUERY SELECT v_id, 'claimed_now'::text;
END $$;

-- ── Triggers ────────────────────────────────────────────────────────────────
-- row_updated_at is STORAGE-only, distinct from the durable domain updatedAt on
-- Event and Bout, which the application owns.
CREATE FUNCTION app_private.bump_revision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  NEW.revision := OLD.revision + 1;
  NEW.row_updated_at := pg_catalog.now();
  RETURN NEW;
END $$;

CREATE FUNCTION app_private.forbid_slug_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'workspace slug is immutable';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER workspaces_bump BEFORE UPDATE ON app_private.workspaces
  FOR EACH ROW EXECUTE FUNCTION app_private.bump_revision();
CREATE TRIGGER workspaces_slug_immutable BEFORE UPDATE ON app_private.workspaces
  FOR EACH ROW EXECUTE FUNCTION app_private.forbid_slug_change();
CREATE TRIGGER events_bump BEFORE UPDATE ON app_private.events
  FOR EACH ROW EXECUTE FUNCTION app_private.bump_revision();
CREATE TRIGGER bouts_bump BEFORE UPDATE ON app_private.bouts
  FOR EACH ROW EXECUTE FUNCTION app_private.bump_revision();
CREATE TRIGGER tracked_positions_bump BEFORE UPDATE ON app_private.tracked_positions
  FOR EACH ROW EXECUTE FUNCTION app_private.bump_revision();
CREATE TRIGGER wagers_bump BEFORE UPDATE ON app_private.wagers
  FOR EACH ROW EXECUTE FUNCTION app_private.bump_revision();
CREATE TRIGGER props_bump BEFORE UPDATE ON app_private.props
  FOR EACH ROW EXECUTE FUNCTION app_private.bump_revision();

-- ── Settlement contract ─────────────────────────────────────────────────────
-- Enforced for both tracked positions and wagers, each against ITS OWN
-- market_snapshot_id.
--
-- Profit equality is EXACT (<>, no epsilon) because recomputing all 152 stored
-- computed rows in JS reproduced them bit-for-bit, deviation 0. Gate 2 re-runs
-- this in real Postgres; if any row deviates, the smallest sufficient bound is
-- measured there and only this comparison changes.
CREATE FUNCTION app_private.assert_settlement_row(
  p_label text, p_workspace uuid, p_bout uuid, p_corner text,
  p_market uuid, p_stake numeric,
  p_status text, p_outcome text, p_financial text, p_profit double precision)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_result_status text; v_result_outcome text;
  v_odds int; v_expected_outcome text; v_expected_profit double precision;
BEGIN
  SELECT b.result_status, b.result_outcome INTO v_result_status, v_result_outcome
    FROM app_private.bouts b
   WHERE b.workspace_id = p_workspace AND b.id = p_bout;

  -- bout pending <=> dependent row open
  IF (v_result_status = 'pending') <> (p_status = 'open') THEN
    RAISE EXCEPTION '% settlement disagrees with bout result status (bout %, row %)',
      p_label, v_result_status, p_status;
  END IF;
  IF p_status = 'open' THEN RETURN; END IF;

  v_expected_outcome := CASE v_result_outcome
    WHEN 'draw' THEN 'push' WHEN 'noContest' THEN 'void'
    WHEN p_corner THEN 'won' ELSE 'lost' END;
  IF p_outcome <> v_expected_outcome THEN
    RAISE EXCEPTION '% outcome % but bout % against corner % implies %',
      p_label, p_outcome, v_result_outcome, p_corner, v_expected_outcome;
  END IF;

  -- push/void => computed profit exactly 0
  IF p_outcome IN ('push','void') THEN
    IF p_financial <> 'computed' OR p_profit <> 0 THEN
      RAISE EXCEPTION '% % must be computed with profit exactly 0', p_label, p_outcome;
    END IF;
    RETURN;
  END IF;

  SELECT CASE WHEN p_corner = 'A' THEN m.odds_a ELSE m.odds_b END INTO v_odds
    FROM app_private.market_snapshots m
   WHERE m.workspace_id = p_workspace AND m.id = p_market;

  -- selected corner priced => computed; unpriced => uncomputable
  IF v_odds IS NULL THEN
    IF p_financial <> 'uncomputable' THEN
      RAISE EXCEPTION '% selected corner % is unpriced but claims %',
        p_label, p_corner, p_financial;
    END IF;
    RETURN;
  END IF;
  IF p_financial <> 'computed' THEN
    RAISE EXCEPTION '% selected corner % is priced but claims %',
      p_label, p_corner, p_financial;
  END IF;

  v_expected_profit := CASE WHEN p_outcome = 'won'
    THEN p_stake::double precision * (app_private.decimal_from_american(v_odds) - 1)
    ELSE -p_stake::double precision END;
  IF p_profit <> v_expected_profit THEN
    RAISE EXCEPTION '% profit % <> expected %', p_label, p_profit, v_expected_profit;
  END IF;
END $$;

CREATE FUNCTION app_private.trg_assert_position() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM app_private.assert_settlement_row(
    TG_TABLE_NAME, NEW.workspace_id, NEW.bout_id, NEW.corner,
    NEW.market_snapshot_id, NEW.stake_units,
    NEW.settlement_status, NEW.settlement_outcome,
    NEW.financial_status, NEW.profit_units);
  RETURN NULL;
END $$;

-- Deferred so a grade can write the bout and its dependents in any order within
-- the transaction and still be checked as a whole at COMMIT.
CREATE CONSTRAINT TRIGGER tracked_positions_settlement
  AFTER INSERT OR UPDATE ON app_private.tracked_positions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_assert_position();
CREATE CONSTRAINT TRIGGER wagers_settlement
  AFTER INSERT OR UPDATE ON app_private.wagers
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_assert_position();

-- Grading a bout changes the expected settlement of EVERY dependent row, so the
-- bout trigger re-checks them all rather than trusting the writer to touch them.
CREATE FUNCTION app_private.trg_assert_bout_dependents() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE r record;
BEGIN
  FOR r IN SELECT t.bout_id, t.corner, t.market_snapshot_id, t.stake_units,
                  t.settlement_status, t.settlement_outcome,
                  t.financial_status, t.profit_units
             FROM app_private.tracked_positions t
            WHERE t.workspace_id = NEW.workspace_id AND t.bout_id = NEW.id LOOP
    PERFORM app_private.assert_settlement_row('tracked_positions',
      NEW.workspace_id, r.bout_id, r.corner, r.market_snapshot_id, r.stake_units,
      r.settlement_status, r.settlement_outcome, r.financial_status, r.profit_units);
  END LOOP;
  FOR r IN SELECT w.bout_id, w.corner, w.market_snapshot_id, w.stake_units,
                  w.settlement_status, w.settlement_outcome,
                  w.financial_status, w.profit_units
             FROM app_private.wagers w
            WHERE w.workspace_id = NEW.workspace_id AND w.bout_id = NEW.id LOOP
    PERFORM app_private.assert_settlement_row('wagers',
      NEW.workspace_id, r.bout_id, r.corner, r.market_snapshot_id, r.stake_units,
      r.settlement_status, r.settlement_outcome, r.financial_status, r.profit_units);
  END LOOP;
  RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER bouts_dependents_settlement
  AFTER INSERT OR UPDATE ON app_private.bouts
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_assert_bout_dependents();

-- ParlaySchema requires legs.min(1). A plain CHECK cannot express it — the legs
-- live in another table — and a non-deferred trigger would make a parlay
-- impossible to insert at all, since the parent must exist before its legs.
-- DEFERRED means parlay + legs land atomically and the count is asserted at
-- COMMIT, which is exactly the Stage 6 rule.
CREATE FUNCTION app_private.trg_assert_parlay_has_legs() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM app_private.parlay_legs l
                  WHERE l.workspace_id = NEW.workspace_id
                    AND l.parlay_id = NEW.id) THEN
    RAISE EXCEPTION 'parlay % has no legs', NEW.id;
  END IF;
  RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER parlays_have_legs
  AFTER INSERT OR UPDATE ON app_private.parlays
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_assert_parlay_has_legs();

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Enabled, NOT blanket-FORCEd: fm_table_owner owns the tables and owns no
-- callable function, so the two roles API functions actually run as are
-- non-owners and are fully bound by policy.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['workspaces','workspace_members','events','bouts',
    'prediction_runs','prediction_snapshots','market_snapshots',
    'betting_assessments','tracked_positions','wagers','props','parlays',
    'parlay_legs','seed_items','undo_log']
  LOOP
    EXECUTE format('ALTER TABLE app_private.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

CREATE POLICY workspaces_read ON app_private.workspaces FOR SELECT
  USING (is_public OR app_private.is_member(id, ARRAY['owner','editor','viewer']));
CREATE POLICY workspaces_write ON app_private.workspaces FOR UPDATE
  USING (app_private.is_member(id, ARRAY['owner']))
  WITH CHECK (app_private.is_member(id, ARRAY['owner']));

CREATE POLICY workspace_members_read ON app_private.workspace_members FOR SELECT
  USING (app_private.is_member(workspace_id, ARRAY['owner','editor','viewer']));
CREATE POLICY workspace_members_write ON app_private.workspace_members FOR ALL
  USING (app_private.is_member(workspace_id, ARRAY['owner']))
  WITH CHECK (app_private.is_member(workspace_id, ARRAY['owner']));

-- Child tables: readable when the workspace is public or the caller is a member;
-- writable by owner/editor. Immutable tables get INSERT + DELETE but NO UPDATE
-- policy — denied twice, here and by the absent UPDATE grant.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['events','bouts','prediction_runs',
    'prediction_snapshots','market_snapshots','betting_assessments',
    'tracked_positions','wagers','props','parlays','parlay_legs']
  LOOP
    EXECUTE format($f$
      CREATE POLICY %1$s_read ON app_private.%1$I FOR SELECT
        USING (EXISTS (SELECT 1 FROM app_private.workspaces w
                        WHERE w.id = %1$I.workspace_id
                          AND (w.is_public
                               OR app_private.is_member(w.id, ARRAY['owner','editor','viewer']))))
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY %1$s_insert ON app_private.%1$I FOR INSERT
        WITH CHECK (app_private.is_member(workspace_id, ARRAY['owner','editor']))
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY %1$s_delete ON app_private.%1$I FOR DELETE
        USING (app_private.is_member(workspace_id, ARRAY['owner','editor']))
    $f$, t);
  END LOOP;

  -- UPDATE only for the mutable tables.
  FOREACH t IN ARRAY ARRAY['events','bouts','tracked_positions','wagers','props']
  LOOP
    EXECUTE format($f$
      CREATE POLICY %1$s_update ON app_private.%1$I FOR UPDATE
        USING (app_private.is_member(workspace_id, ARRAY['owner','editor']))
        WITH CHECK (app_private.is_member(workspace_id, ARRAY['owner','editor']))
    $f$, t);
  END LOOP;
END $$;

CREATE POLICY seed_items_all ON app_private.seed_items FOR ALL
  USING (app_private.is_member(workspace_id, ARRAY['owner']))
  WITH CHECK (app_private.is_member(workspace_id, ARRAY['owner']));

CREATE POLICY undo_log_own ON app_private.undo_log FOR ALL
  USING (user_id = app_private.current_user_id()
         AND app_private.is_member(workspace_id, ARRAY['owner','editor']))
  WITH CHECK (user_id = app_private.current_user_id()
         AND app_private.is_member(workspace_id, ARRAY['owner','editor']));

-- ── Public API functions ────────────────────────────────────────────────────
-- Return columns are ENUMERATED, never SELECT *, so an added base column cannot
-- leak. An fm_public_reader-owned function can only ever see public workspaces,
-- so fm_read_* returns nothing for a private workspace even to a member. That is
-- its documented contract; members use fm_member_*.

CREATE FUNCTION public.fm_read_events(p_slug text)
RETURNS TABLE (id uuid, name text, date date, promotion text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT e.id, e.name, e.date, e.promotion
    FROM app_private.events e
    JOIN app_private.workspaces w ON w.id = e.workspace_id
   WHERE w.slug = p_slug AND w.is_public
   ORDER BY e.date DESC, e.name
$$;

CREATE FUNCTION public.fm_read_bouts(p_slug text)
RETURNS TABLE (id uuid, event_id uuid, division text,
               corner_a_name text, corner_b_name text,
               result_status text, result_outcome text, result_method text,
               board_order int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT b.id, b.event_id, b.division,
         b.corner_a_display_name, b.corner_b_display_name,
         b.result_status, b.result_outcome, b.result_method, b.board_order
    FROM app_private.bouts b
    JOIN app_private.workspaces w ON w.id = b.workspace_id
   WHERE w.slug = p_slug AND w.is_public
   ORDER BY b.board_order NULLS LAST, b.id
$$;

-- Routing is by RESOLVED MEMBERSHIP, not session presence. A signed-in
-- non-member gets role NULL and reads through the public fallback.
CREATE FUNCTION public.fm_member_whoami(p_slug text)
RETURNS TABLE (workspace_id uuid, role text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT w.id,
         (SELECT m.role FROM app_private.workspace_members m
           WHERE m.workspace_id = w.id
             AND m.user_id = app_private.current_user_id())
    FROM app_private.workspaces w
   WHERE w.slug = p_slug
$$;

CREATE FUNCTION public.fm_rpc_claim_workspace_ownership(p_slug text)
RETURNS TABLE (workspace_id uuid, role text)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_id uuid; v_status text; v_uid uuid;
BEGIN
  v_uid := app_private.current_user_id();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;
  -- Lock, re-check and insert happen atomically inside the table-owner helper.
  SELECT c.workspace_id, c.status INTO v_id, v_status
    FROM app_private.claim_workspace_ownership(p_slug, v_uid) c;
  -- An unknown slug is distinguishable from a claimed one.
  IF v_status = 'unknown' THEN
    RAISE EXCEPTION 'unknown workspace slug' USING ERRCODE = '42704';
  END IF;
  IF v_status = 'claimed' THEN
    RAISE EXCEPTION 'workspace already claimed' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT v_id, 'owner'::text;
END $$;

-- Position projection, shared by the roi/upcoming surfaces. An app_private
-- helper, never granted to a client role: the public functions select from it
-- and enumerate their own columns, so an added column here cannot leak.
CREATE FUNCTION app_private.position_rows(p_workspace uuid)
RETURNS TABLE (
  tracked_position_id uuid, bout_id uuid, event_id uuid, event_name text,
  event_date date, division text, corner_a_name text, corner_b_name text,
  tracked_corner text, stake_units text, prob_a double precision,
  prob_b double precision, winner_corner text, tier text,
  recommended_corner text, fair_line_a int, fair_line_b int,
  edge_a double precision, edge_b double precision, ev_a double precision,
  ev_b double precision, kelly_a double precision, kelly_b double precision,
  tracked_odds_a int, tracked_odds_b int, result_status text,
  result_outcome text, result_method text, settlement_status text,
  settlement_outcome text, financial_status text, financial_reason text,
  profit_units double precision, settled_at timestamptz, review_status text,
  finish_status text, finish_ko_pct int, finish_sub_pct int, finish_dec_pct int,
  finish_leaders text[], revision text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT t.id, t.bout_id, e.id, e.name, e.date, b.division,
         b.corner_a_display_name, b.corner_b_display_name,
         t.corner, t.stake_units::text, s.prob_a, s.prob_b, s.winner_corner,
         a.tier, a.recommended_corner, a.fair_line_a, a.fair_line_b,
         a.edge_a, a.edge_b, a.ev_a, a.ev_b, a.kelly_a, a.kelly_b,
         m.odds_a, m.odds_b,
         b.result_status, b.result_outcome, b.result_method,
         t.settlement_status, t.settlement_outcome, t.financial_status,
         t.financial_reason, t.profit_units, t.settled_at, t.review_status,
         r.finish_status, r.finish_ko_pct, r.finish_sub_pct, r.finish_dec_pct,
         r.finish_leaders, t.revision::text
    FROM app_private.tracked_positions t
    JOIN app_private.betting_assessments a
      ON a.workspace_id = t.workspace_id AND a.id = t.assessment_id
    JOIN app_private.prediction_runs r
      ON r.workspace_id = a.workspace_id AND r.id = a.run_id
    JOIN app_private.prediction_snapshots s
      ON s.workspace_id = r.workspace_id AND s.id = r.decision_snapshot_id
    JOIN app_private.bouts b
      ON b.workspace_id = t.workspace_id AND b.id = t.bout_id
    JOIN app_private.events e
      ON e.workspace_id = b.workspace_id AND e.id = b.event_id
    LEFT JOIN app_private.market_snapshots m
      ON m.workspace_id = t.workspace_id AND m.id = t.market_snapshot_id
   WHERE t.workspace_id = p_workspace
$$;

-- Public read surfaces. Every one is filtered to public workspaces, so an
-- fm_public_reader-owned function returns nothing for a private workspace even
-- to a member. That is its documented contract; members use fm_member_*.
CREATE FUNCTION public.fm_read_roi(p_slug text)
RETURNS TABLE (
  tracked_position_id uuid, bout_id uuid, event_id uuid, event_name text,
  event_date date, division text, corner_a_name text, corner_b_name text,
  tracked_corner text, stake_units text, prob_a double precision,
  prob_b double precision, winner_corner text, tier text,
  recommended_corner text, fair_line_a int, fair_line_b int,
  edge_a double precision, edge_b double precision, ev_a double precision,
  ev_b double precision, kelly_a double precision, kelly_b double precision,
  tracked_odds_a int, tracked_odds_b int, result_status text,
  result_outcome text, result_method text, settlement_status text,
  settlement_outcome text, financial_status text, financial_reason text,
  profit_units double precision, settled_at timestamptz, review_status text,
  finish_status text, finish_ko_pct int, finish_sub_pct int, finish_dec_pct int,
  finish_leaders text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.tracked_position_id, p.bout_id, p.event_id, p.event_name, p.event_date,
         p.division, p.corner_a_name, p.corner_b_name, p.tracked_corner,
         p.stake_units, p.prob_a, p.prob_b, p.winner_corner, p.tier,
         p.recommended_corner, p.fair_line_a, p.fair_line_b, p.edge_a, p.edge_b,
         p.ev_a, p.ev_b, p.kelly_a, p.kelly_b, p.tracked_odds_a, p.tracked_odds_b,
         p.result_status, p.result_outcome, p.result_method, p.settlement_status,
         p.settlement_outcome, p.financial_status, p.financial_reason,
         p.profit_units, p.settled_at, p.review_status, p.finish_status,
         p.finish_ko_pct, p.finish_sub_pct, p.finish_dec_pct, p.finish_leaders
    FROM app_private.workspaces w
    CROSS JOIN LATERAL app_private.position_rows(w.id) p
   WHERE w.slug = p_slug AND w.is_public AND p.settlement_status = 'settled'
$$;

CREATE FUNCTION public.fm_read_upcoming(p_slug text)
RETURNS TABLE (
  tracked_position_id uuid, bout_id uuid, event_id uuid, event_name text,
  event_date date, division text, corner_a_name text, corner_b_name text,
  tracked_corner text, stake_units text, prob_a double precision,
  prob_b double precision, winner_corner text, tier text,
  recommended_corner text, fair_line_a int, fair_line_b int,
  edge_a double precision, edge_b double precision, ev_a double precision,
  ev_b double precision, kelly_a double precision, kelly_b double precision,
  tracked_odds_a int, tracked_odds_b int, result_status text,
  review_status text, finish_status text, finish_ko_pct int,
  finish_sub_pct int, finish_dec_pct int, finish_leaders text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.tracked_position_id, p.bout_id, p.event_id, p.event_name, p.event_date,
         p.division, p.corner_a_name, p.corner_b_name, p.tracked_corner,
         p.stake_units, p.prob_a, p.prob_b, p.winner_corner, p.tier,
         p.recommended_corner, p.fair_line_a, p.fair_line_b, p.edge_a, p.edge_b,
         p.ev_a, p.ev_b, p.kelly_a, p.kelly_b, p.tracked_odds_a, p.tracked_odds_b,
         p.result_status, p.review_status, p.finish_status, p.finish_ko_pct,
         p.finish_sub_pct, p.finish_dec_pct, p.finish_leaders
    FROM app_private.workspaces w
    CROSS JOIN LATERAL app_private.position_rows(w.id) p
   WHERE w.slug = p_slug AND w.is_public AND p.settlement_status = 'open'
$$;

CREATE FUNCTION public.fm_read_props(p_slug text)
RETURNS TABLE (id text, event_id uuid, target_kind text, target_bout_id uuid,
               target_corner text, method text, prop_type text, label text,
               odds int, stake_units text, result text, pick_source text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT pr.id, pr.event_id, pr.target_kind, pr.target_bout_id, pr.target_corner,
         pr.method, pr.prop_type, pr.label, pr.odds, pr.stake_units::text,
         pr.result, pr.pick_source
    FROM app_private.props pr
    JOIN app_private.workspaces w ON w.id = pr.workspace_id
   WHERE w.slug = p_slug AND w.is_public
   ORDER BY pr.created_at, pr.id
$$;

CREATE FUNCTION public.fm_read_parlays(p_slug text)
RETURNS TABLE (id text, event_id uuid, combined_odds int, stake_units text,
               pick_source text, leg_index int, bout_id uuid,
               picked_corner text, model_default_corner text,
               model_prob_at_build double precision, overridden boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT pa.id, pa.event_id, pa.combined_odds, pa.stake_units::text,
         pa.pick_source, l.leg_index, l.bout_id, l.picked_corner,
         l.model_default_corner, l.model_prob_at_build, l.overridden
    FROM app_private.parlays pa
    JOIN app_private.workspaces w ON w.id = pa.workspace_id
    JOIN app_private.parlay_legs l
      ON l.workspace_id = pa.workspace_id AND l.parlay_id = pa.id
   WHERE w.slug = p_slug AND w.is_public
   ORDER BY pa.created_at, pa.id, l.leg_index
$$;

-- The legacy-entry shape src/domain/statistics already consumes. ASSEMBLED,
-- never computed: no ROI, calibration, tier, probability or settlement value is
-- derived here. src/domain/statistics stays the single implementation.
CREATE FUNCTION public.fm_read_statistics_input(p_slug text)
RETURNS TABLE (id text, fighter_a text, fighter_b text, event_name text,
               event_date date, actual_winner text, market_odds text,
               tracked_side text, units_wagered text, predicted_winner text,
               fighter_a_prob double precision, fighter_b_prob double precision,
               v2_p_a double precision, v2_p_b double precision,
               bet_action text, includes_prospect boolean,
               fighter_a_is_prospect boolean, fighter_b_is_prospect boolean,
               confirmed_by_user boolean, capture_mode text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT coalesce(r.legacy_entry_id, r.id),
         b.corner_a_display_name, b.corner_b_display_name, e.name, e.date,
         CASE WHEN b.result_status <> 'resolved' THEN ''
              WHEN b.result_outcome = 'draw' THEN 'DRAW'
              WHEN b.result_outcome = 'noContest' THEN 'NC'
              WHEN b.result_outcome = 'A' THEN b.corner_a_display_name
              ELSE b.corner_b_display_name END,
         CASE WHEN m.id IS NULL THEN ''
              ELSE coalesce((CASE WHEN t.corner = 'A' THEN m.odds_a
                                  ELSE m.odds_b END)::text, '') END,
         CASE WHEN t.corner = 'A' THEN b.corner_a_display_name
              ELSE b.corner_b_display_name END,
         t.stake_units::text,
         CASE WHEN v1.winner_corner = 'A' THEN b.corner_a_display_name
              ELSE b.corner_b_display_name END,
         v1.prob_a, v1.prob_b, v2.prob_a, v2.prob_b,
         a.tier, r.includes_prospect_at_capture,
         r.corner_a_is_prospect_at_capture, r.corner_b_is_prospect_at_capture,
         -- Statistics exclude ONLY the pending review state.
         (t.review_status <> 'pending'),
         coalesce(v2.capture_mode, v1.capture_mode)
    FROM app_private.tracked_positions t
    JOIN app_private.workspaces w ON w.id = t.workspace_id
    JOIN app_private.betting_assessments a
      ON a.workspace_id = t.workspace_id AND a.id = t.assessment_id
    JOIN app_private.prediction_runs r
      ON r.workspace_id = a.workspace_id AND r.id = a.run_id
    JOIN app_private.bouts b
      ON b.workspace_id = t.workspace_id AND b.id = t.bout_id
    JOIN app_private.events e
      ON e.workspace_id = b.workspace_id AND e.id = b.event_id
    JOIN app_private.prediction_snapshots v1
      ON v1.workspace_id = r.workspace_id AND v1.run_id = r.id
     AND v1.basis = 'legacy-v1-unversioned'
    LEFT JOIN app_private.prediction_snapshots v2
      ON v2.workspace_id = r.workspace_id AND v2.run_id = r.id AND v2.basis = 'v2'
    LEFT JOIN app_private.market_snapshots m
      ON m.workspace_id = t.workspace_id AND m.id = t.market_snapshot_id
   WHERE w.slug = p_slug AND w.is_public
$$;

-- Member surfaces: the same fields PLUS revision tokens and editable fields,
-- and not restricted to public workspaces.
CREATE FUNCTION public.fm_member_roi(p_slug text)
RETURNS TABLE (
  tracked_position_id uuid, bout_id uuid, event_id uuid, event_name text,
  event_date date, division text, corner_a_name text, corner_b_name text,
  tracked_corner text, stake_units text, prob_a double precision,
  prob_b double precision, winner_corner text, tier text,
  recommended_corner text, fair_line_a int, fair_line_b int,
  edge_a double precision, edge_b double precision, ev_a double precision,
  ev_b double precision, kelly_a double precision, kelly_b double precision,
  tracked_odds_a int, tracked_odds_b int, result_status text,
  result_outcome text, result_method text, settlement_status text,
  settlement_outcome text, financial_status text, financial_reason text,
  profit_units double precision, settled_at timestamptz, review_status text,
  finish_status text, finish_ko_pct int, finish_sub_pct int, finish_dec_pct int,
  finish_leaders text[], revision text, notes text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.tracked_position_id, p.bout_id, p.event_id, p.event_name, p.event_date,
         p.division, p.corner_a_name, p.corner_b_name, p.tracked_corner,
         p.stake_units, p.prob_a, p.prob_b, p.winner_corner, p.tier,
         p.recommended_corner, p.fair_line_a, p.fair_line_b, p.edge_a, p.edge_b,
         p.ev_a, p.ev_b, p.kelly_a, p.kelly_b, p.tracked_odds_a, p.tracked_odds_b,
         p.result_status, p.result_outcome, p.result_method, p.settlement_status,
         p.settlement_outcome, p.financial_status, p.financial_reason,
         p.profit_units, p.settled_at, p.review_status, p.finish_status,
         p.finish_ko_pct, p.finish_sub_pct, p.finish_dec_pct, p.finish_leaders,
         p.revision, t.notes
    FROM app_private.workspaces w
    CROSS JOIN LATERAL app_private.position_rows(w.id) p
    JOIN app_private.tracked_positions t
      ON t.workspace_id = w.id AND t.id = p.tracked_position_id
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
     AND p.settlement_status = 'settled'
$$;

CREATE FUNCTION public.fm_member_events(p_slug text)
RETURNS TABLE (id uuid, name text, date date, promotion text,
               bout_count bigint, revision text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT e.id, e.name, e.date, e.promotion,
         (SELECT count(*) FROM app_private.bouts b
           WHERE b.workspace_id = e.workspace_id AND b.event_id = e.id),
         e.revision::text
    FROM app_private.events e
    JOIN app_private.workspaces w ON w.id = e.workspace_id
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
   ORDER BY e.date DESC, e.name
$$;

CREATE FUNCTION public.fm_member_bouts(p_slug text)
RETURNS TABLE (id uuid, event_id uuid, division text, corner_a_name text,
               corner_b_name text, result_status text, result_outcome text,
               result_method text, board_order int, revision text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT b.id, b.event_id, b.division, b.corner_a_display_name,
         b.corner_b_display_name, b.result_status, b.result_outcome,
         b.result_method, b.board_order, b.revision::text
    FROM app_private.bouts b
    JOIN app_private.workspaces w ON w.id = b.workspace_id
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
   ORDER BY b.board_order NULLS LAST, b.id
$$;

-- A private workspace must not lose normal app functionality, so every public
-- read surface has a member equivalent. Without these, Upcoming, Props, Parlays
-- and Statistics simply vanish once is_public is turned off.
CREATE FUNCTION public.fm_member_upcoming(p_slug text)
RETURNS TABLE (
  tracked_position_id uuid, bout_id uuid, event_id uuid, event_name text,
  event_date date, division text, corner_a_name text, corner_b_name text,
  tracked_corner text, stake_units text, prob_a double precision,
  prob_b double precision, winner_corner text, tier text,
  recommended_corner text, fair_line_a int, fair_line_b int,
  edge_a double precision, edge_b double precision, ev_a double precision,
  ev_b double precision, kelly_a double precision, kelly_b double precision,
  tracked_odds_a int, tracked_odds_b int, result_status text,
  review_status text, finish_status text, finish_ko_pct int,
  finish_sub_pct int, finish_dec_pct int, finish_leaders text[],
  revision text, notes text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p.tracked_position_id, p.bout_id, p.event_id, p.event_name, p.event_date,
         p.division, p.corner_a_name, p.corner_b_name, p.tracked_corner,
         p.stake_units, p.prob_a, p.prob_b, p.winner_corner, p.tier,
         p.recommended_corner, p.fair_line_a, p.fair_line_b, p.edge_a, p.edge_b,
         p.ev_a, p.ev_b, p.kelly_a, p.kelly_b, p.tracked_odds_a, p.tracked_odds_b,
         p.result_status, p.review_status, p.finish_status, p.finish_ko_pct,
         p.finish_sub_pct, p.finish_dec_pct, p.finish_leaders, p.revision, t.notes
    FROM app_private.workspaces w
    CROSS JOIN LATERAL app_private.position_rows(w.id) p
    JOIN app_private.tracked_positions t
      ON t.workspace_id = w.id AND t.id = p.tracked_position_id
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
     AND p.settlement_status = 'open'
$$;

CREATE FUNCTION public.fm_member_props(p_slug text)
RETURNS TABLE (id text, event_id uuid, target_kind text, target_bout_id uuid,
               target_corner text, method text, prop_type text, label text,
               odds int, stake_units text, result text, pick_source text,
               revision text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT pr.id, pr.event_id, pr.target_kind, pr.target_bout_id, pr.target_corner,
         pr.method, pr.prop_type, pr.label, pr.odds, pr.stake_units::text,
         pr.result, pr.pick_source, pr.revision::text
    FROM app_private.props pr
    JOIN app_private.workspaces w ON w.id = pr.workspace_id
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
   ORDER BY pr.created_at, pr.id
$$;

-- Parlays are immutable, so there is no revision token to expose.
CREATE FUNCTION public.fm_member_parlays(p_slug text)
RETURNS TABLE (id text, event_id uuid, combined_odds int, stake_units text,
               pick_source text, leg_index int, bout_id uuid,
               picked_corner text, model_default_corner text,
               model_prob_at_build double precision, overridden boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT pa.id, pa.event_id, pa.combined_odds, pa.stake_units::text,
         pa.pick_source, l.leg_index, l.bout_id, l.picked_corner,
         l.model_default_corner, l.model_prob_at_build, l.overridden
    FROM app_private.parlays pa
    JOIN app_private.workspaces w ON w.id = pa.workspace_id
    JOIN app_private.parlay_legs l
      ON l.workspace_id = pa.workspace_id AND l.parlay_id = pa.id
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
   ORDER BY pa.created_at, pa.id, l.leg_index
$$;

-- Same assembled legacy-entry shape as the public surface, membership-gated.
-- Still computes nothing: src/domain/statistics remains the implementation.
CREATE FUNCTION public.fm_member_statistics_input(p_slug text)
RETURNS TABLE (id text, fighter_a text, fighter_b text, event_name text,
               event_date date, actual_winner text, market_odds text,
               tracked_side text, units_wagered text, predicted_winner text,
               fighter_a_prob double precision, fighter_b_prob double precision,
               v2_p_a double precision, v2_p_b double precision,
               bet_action text, includes_prospect boolean,
               fighter_a_is_prospect boolean, fighter_b_is_prospect boolean,
               confirmed_by_user boolean, capture_mode text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT coalesce(r.legacy_entry_id, r.id),
         b.corner_a_display_name, b.corner_b_display_name, e.name, e.date,
         CASE WHEN b.result_status <> 'resolved' THEN ''
              WHEN b.result_outcome = 'draw' THEN 'DRAW'
              WHEN b.result_outcome = 'noContest' THEN 'NC'
              WHEN b.result_outcome = 'A' THEN b.corner_a_display_name
              ELSE b.corner_b_display_name END,
         CASE WHEN m.id IS NULL THEN ''
              ELSE coalesce((CASE WHEN t.corner = 'A' THEN m.odds_a
                                  ELSE m.odds_b END)::text, '') END,
         CASE WHEN t.corner = 'A' THEN b.corner_a_display_name
              ELSE b.corner_b_display_name END,
         t.stake_units::text,
         CASE WHEN v1.winner_corner = 'A' THEN b.corner_a_display_name
              ELSE b.corner_b_display_name END,
         v1.prob_a, v1.prob_b, v2.prob_a, v2.prob_b,
         a.tier, r.includes_prospect_at_capture,
         r.corner_a_is_prospect_at_capture, r.corner_b_is_prospect_at_capture,
         (t.review_status <> 'pending'),
         coalesce(v2.capture_mode, v1.capture_mode)
    FROM app_private.tracked_positions t
    JOIN app_private.workspaces w ON w.id = t.workspace_id
    JOIN app_private.betting_assessments a
      ON a.workspace_id = t.workspace_id AND a.id = t.assessment_id
    JOIN app_private.prediction_runs r
      ON r.workspace_id = a.workspace_id AND r.id = a.run_id
    JOIN app_private.bouts b
      ON b.workspace_id = t.workspace_id AND b.id = t.bout_id
    JOIN app_private.events e
      ON e.workspace_id = b.workspace_id AND e.id = b.event_id
    JOIN app_private.prediction_snapshots v1
      ON v1.workspace_id = r.workspace_id AND v1.run_id = r.id
     AND v1.basis = 'legacy-v1-unversioned'
    LEFT JOIN app_private.prediction_snapshots v2
      ON v2.workspace_id = r.workspace_id AND v2.run_id = r.id AND v2.basis = 'v2'
    LEFT JOIN app_private.market_snapshots m
      ON m.workspace_id = t.workspace_id AND m.id = t.market_snapshot_id
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
$$;

-- Members only: the complete Stage 6 store, export only. Store.meta is
-- reconstructed from workspaces.schema_version and migrated_at; workspace_id,
-- revision, row_updated_at, seed_items, undo_log and workspace_members are
-- excluded.
CREATE FUNCTION public.fm_member_export_store(p_slug text)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT jsonb_build_object(
    'meta', jsonb_build_object('schemaVersion', w.schema_version,
                               'migratedAt', w.migrated_at),
    'events', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', e.id, 'promotion', e.promotion, 'name', e.name,
        'date', e.date, 'externalIds', e.external_ids,
        'createdAt', e.created_at, 'updatedAt', e.updated_at) ORDER BY e.id)
      FROM app_private.events e WHERE e.workspace_id = w.id), '[]'::jsonb),
    'bouts', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', b.id, 'eventId', b.event_id,
        'cornerA', jsonb_build_object('displayName', b.corner_a_display_name,
          'fighterKey', b.corner_a_fighter_key, 'fighterId', b.corner_a_fighter_id),
        'cornerB', jsonb_build_object('displayName', b.corner_b_display_name,
          'fighterKey', b.corner_b_fighter_key, 'fighterId', b.corner_b_fighter_id),
        'division', b.division, 'boardOrder', b.board_order,
        'scheduledRounds', b.scheduled_rounds,
        'result', CASE WHEN b.result_status = 'pending'
                       THEN jsonb_build_object('status', 'pending')
                       ELSE jsonb_build_object('status', 'resolved',
                              'outcome', b.result_outcome,
                              'method', b.result_method) END,
        'externalIds', b.external_ids, 'createdAt', b.created_at,
        'updatedAt', b.updated_at) ORDER BY b.id)
      FROM app_private.bouts b WHERE b.workspace_id = w.id), '[]'::jsonb),
    'predictionRuns', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', r.id, 'boutId', r.bout_id, 'legacyEntryId', r.legacy_entry_id,
        'createdAt', r.created_at, 'decisionSnapshotId', r.decision_snapshot_id,
        'targetEventDateAtCapture', r.target_event_date_at_capture,
        'finishProjection', CASE WHEN r.finish_status = 'absent'
          THEN jsonb_build_object('status','absent')
          ELSE jsonb_build_object('status','computed','koPct',r.finish_ko_pct,
                 'subPct',r.finish_sub_pct,'decPct',r.finish_dec_pct,
                 'leaders',to_jsonb(r.finish_leaders)) END,
        'cornerAIsProspectAtCapture', r.corner_a_is_prospect_at_capture,
        'cornerBIsProspectAtCapture', r.corner_b_is_prospect_at_capture,
        'includesProspectAtCapture', r.includes_prospect_at_capture,
        'provenanceCompleteness', r.provenance_completeness) ORDER BY r.id)
      FROM app_private.prediction_runs r WHERE r.workspace_id = w.id), '[]'::jsonb),
    'marketSnapshots', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', m.id, 'boutId', m.bout_id, 'capturedAt', m.captured_at,
        'source', m.source, 'oddsA', m.odds_a, 'oddsB', m.odds_b) ORDER BY m.id)
      FROM app_private.market_snapshots m WHERE m.workspace_id = w.id), '[]'::jsonb),
    'wagers', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', g.id, 'boutId', g.bout_id, 'assessmentId', g.assessment_id,
        'marketSnapshotId', g.market_snapshot_id, 'corner', g.corner,
        'stakeUnits', g.stake_units, 'placedAt', g.placed_at,
        'settlement', CASE WHEN g.settlement_status = 'open'
          THEN jsonb_build_object('status','open')
          ELSE jsonb_build_object('status','settled','outcome',g.settlement_outcome,
                 'financialResult', CASE WHEN g.financial_status = 'computed'
                   THEN jsonb_build_object('status','computed','profitUnits',g.profit_units)
                   ELSE jsonb_build_object('status','uncomputable','reason',g.financial_reason) END,
                 'settledAt', g.settled_at) END,
        'notes', g.notes, 'externalIds', g.external_ids) ORDER BY g.id)
      FROM app_private.wagers g WHERE g.workspace_id = w.id), '[]'::jsonb),
    'predictionSnapshots', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', s.id, 'runId', s.run_id, 'boutId', s.bout_id, 'basis', s.basis,
        'modelVersion', s.model_version, 'modelCoefHash', s.model_coef_hash,
        'probA', s.prob_a, 'probB', s.prob_b, 'winnerCorner', s.winner_corner,
        'capturedAt', s.captured_at, 'captureMode', s.capture_mode,
        'reconstruction', CASE WHEN s.reconstruction_type IS NULL THEN 'null'::jsonb
          ELSE jsonb_build_object('type', s.reconstruction_type,
                 'sourceCommit', s.reconstruction_source_commit,
                 'priorV2', CASE WHEN s.reconstruction_prior_v2_p_a IS NULL
                   THEN 'null'::jsonb
                   ELSE jsonb_build_object('v2pA', s.reconstruction_prior_v2_p_a,
                                           'v2pB', s.reconstruction_prior_v2_p_b) END) END,
        'featureVector', coalesce(s.feature_vector, 'null'::jsonb),
        'fightHistoryCutoff', coalesce(s.fight_history_cutoff, 'null'::jsonb),
        'sourceManifest', coalesce(s.source_manifest, 'null'::jsonb)) ORDER BY s.id)
      FROM app_private.prediction_snapshots s WHERE s.workspace_id = w.id), '[]'::jsonb),
    'bettingAssessments', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', a.id, 'boutId', a.bout_id, 'runId', a.run_id,
        'predictionSnapshotId', a.prediction_snapshot_id,
        'marketSnapshotId', a.market_snapshot_id, 'frozenAt', a.frozen_at,
        'fairLineA', a.fair_line_a, 'fairLineB', a.fair_line_b,
        'edgeA', a.edge_a, 'edgeB', a.edge_b, 'evA', a.ev_a, 'evB', a.ev_b,
        'kellyA', a.kelly_a, 'kellyB', a.kelly_b, 'tier', a.tier,
        'recommendedCorner', a.recommended_corner,
        'tierProvenance', a.tier_provenance,
        'recommendedCornerProvenance', a.recommended_corner_provenance) ORDER BY a.id)
      FROM app_private.betting_assessments a WHERE a.workspace_id = w.id), '[]'::jsonb),
    'trackedPositions', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'boutId', t.bout_id, 'assessmentId', t.assessment_id,
        'marketSnapshotId', t.market_snapshot_id, 'origin', t.origin,
        'corner', t.corner, 'stakeUnits', t.stake_units,
        'stakeSource', t.stake_source, 'openedAt', t.opened_at,
        'settlement', CASE WHEN t.settlement_status = 'open'
          THEN jsonb_build_object('status','open')
          ELSE jsonb_build_object('status','settled','outcome',t.settlement_outcome,
                 'financialResult', CASE WHEN t.financial_status = 'computed'
                   THEN jsonb_build_object('status','computed','profitUnits',t.profit_units)
                   ELSE jsonb_build_object('status','uncomputable','reason',t.financial_reason) END,
                 'settledAt', t.settled_at) END,
        'reviewState', CASE t.review_status
          WHEN 'notRequired' THEN jsonb_build_object('status','notRequired')
          WHEN 'pending' THEN jsonb_build_object('status','pending','reason',t.review_reason)
          ELSE jsonb_build_object('status','confirmed','reason',t.review_reason,
                                  'confirmedAt', t.confirmed_at) END,
        'notes', t.notes) ORDER BY t.id)
      FROM app_private.tracked_positions t WHERE t.workspace_id = w.id), '[]'::jsonb),
    'props', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', pr.id, 'eventId', pr.event_id,
        'target', CASE WHEN pr.target_kind = 'bout'
          THEN jsonb_build_object('kind','bout','boutId',pr.target_bout_id,
                                  'corner', pr.target_corner)
          ELSE jsonb_build_object('kind','event','eventId',pr.target_event_id) END,
        'method', pr.method, 'propType', pr.prop_type, 'label', pr.label,
        'odds', pr.odds, 'stakeUnits', pr.stake_units, 'result', pr.result,
        'pickSource', pr.pick_source, 'createdAt', pr.created_at) ORDER BY pr.id)
      FROM app_private.props pr WHERE pr.workspace_id = w.id), '[]'::jsonb),
    'parlays', coalesce((SELECT jsonb_agg(jsonb_build_object(
        'id', pa.id, 'eventId', pa.event_id, 'combinedOdds', pa.combined_odds,
        'stakeUnits', pa.stake_units, 'pickSource', pa.pick_source,
        'createdAt', pa.created_at,
        'legs', (SELECT jsonb_agg(jsonb_build_object(
            'boutId', l.bout_id, 'pickedCorner', l.picked_corner,
            'modelDefaultCorner', l.model_default_corner,
            'modelProbAtBuild', l.model_prob_at_build,
            'overridden', l.overridden) ORDER BY l.leg_index)
          FROM app_private.parlay_legs l
         WHERE l.workspace_id = pa.workspace_id AND l.parlay_id = pa.id)) ORDER BY pa.id)
      FROM app_private.parlays pa WHERE pa.workspace_id = w.id), '[]'::jsonb))
    FROM app_private.workspaces w
   WHERE w.slug = p_slug
     AND app_private.is_member(w.id, ARRAY['owner','editor','viewer'])
$$;

-- ── (4) transfer ownership ──────────────────────────────────────────────────
ALTER SCHEMA app_private OWNER TO fm_table_owner;
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT c.relname, c.relkind FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind IN ('r','S') LOOP
    EXECUTE format('ALTER %s app_private.%I OWNER TO fm_table_owner',
                   CASE r.relkind WHEN 'r' THEN 'TABLE' ELSE 'SEQUENCE' END, r.relname);
  END LOOP;
  FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'app_private' LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO fm_table_owner', r.sig);
  END LOOP;
  FOR r IN SELECT p.oid::regprocedure AS sig, p.proname FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_%' LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO %I', r.sig,
      CASE WHEN r.proname LIKE 'fm\_read\_%' THEN 'fm_public_reader' ELSE 'fm_member_api' END);
  END LOOP;
END $$;

-- ── (5) revoke CREATE immediately ───────────────────────────────────────────
REVOKE CREATE ON SCHEMA public FROM fm_public_reader, fm_member_api;

-- ── (6) FINAL ACLs — before the membership revoke ───────────────────────────
-- The browser receives NO INSERT/UPDATE/DELETE on any table, and no SELECT
-- either: every read goes through a DEFINER function.
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT  USAGE ON SCHEMA app_private TO fm_public_reader, fm_member_api;
DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT c.relname FROM pg_catalog.pg_class c
             JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'app_private' AND c.relkind = 'r' LOOP
    EXECUTE format('REVOKE ALL ON app_private.%I FROM PUBLIC, anon, authenticated', t);
    EXECUTE format('GRANT SELECT ON app_private.%I TO fm_public_reader, fm_member_api', t);
  END LOOP;
  -- Mutable tables only: immutable ones are denied UPDATE twice — no grant here
  -- and no UPDATE policy above.
  FOREACH t IN ARRAY ARRAY['workspaces','workspace_members','events','bouts',
                           'tracked_positions','wagers','props','seed_items','undo_log'] LOOP
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON app_private.%I TO fm_member_api', t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['prediction_runs','prediction_snapshots','market_snapshots',
                           'betting_assessments','parlays','parlay_legs'] LOOP
    EXECUTE format('GRANT INSERT, DELETE ON app_private.%I TO fm_member_api', t);
  END LOOP;
END $$;

-- An explicit REVOKE/GRANT pair per public function, driven by the naming
-- contract so a newly added function cannot be forgotten and silently inherit
-- PUBLIC EXECUTE. The audience rule is the plan's:
--   fm_read_*   -> anon + authenticated   (public surfaces)
--   fm_member_* -> authenticated          (membership resolved inside)
--   fm_rpc_*    -> authenticated          (mutations; EXECUTE revoked from anon)
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT p.oid::regprocedure AS sig, p.proname FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname LIKE 'fm\_%' LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    IF r.proname LIKE 'fm\_read\_%' THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated', r.sig);
    ELSE
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.sig);
    END IF;
  END LOOP;
END $$;

-- app_private helpers are never callable by clients.
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_catalog.pg_proc p
             JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'app_private' LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION app_private.lock_unclaimed_workspace(text) TO fm_member_api;
GRANT EXECUTE ON FUNCTION app_private.claim_workspace_ownership(text, uuid) TO fm_member_api;
GRANT EXECUTE ON FUNCTION app_private.is_member(uuid, text[])
  TO fm_member_api, fm_public_reader;
GRANT EXECUTE ON FUNCTION app_private.workspace_has_owner(uuid) TO fm_member_api;
GRANT EXECUTE ON FUNCTION app_private.current_user_id()
  TO fm_member_api, fm_public_reader;
GRANT EXECUTE ON FUNCTION app_private.position_rows(uuid)
  TO fm_member_api, fm_public_reader;

-- NO role is granted anything on the auth schema — not even fm_table_owner.
--
-- The `permission denied for schema auth` failure came from auth.uid(), which
-- app_private.current_user_id() now replaces by reading the request GUCs
-- directly. Referential integrity against auth.users needs no grant either:
-- Postgres executes RI checks internally and skips ACL checks, which the
-- membership-insert tests exercise directly.
--
-- Attempting the grant anyway is not merely unnecessary but impossible here:
-- auth is owned by supabase_admin and `postgres` holds USAGE without GRANT
-- OPTION, so `GRANT USAGE ON SCHEMA auth TO fm_table_owner` silently emits
-- WARNING 01007 "no privileges were granted for auth" and changes nothing.

-- `postgres` receives NO permanent privilege on app_private: no schema USAGE,
-- no table DML, no helper EXECUTE.
--
-- An earlier revision granted them so the pgTAP harness could build fixtures
-- without SET ROLE, arguing that ADMIN OPTION made the grants free. That was
-- wrong. ADMIN OPTION is a CAPABILITY the operator must deliberately exercise —
-- it confers no table DML by itself. Granting DML permanently widens what
-- postgres can do RIGHT NOW, in every session, and collapses exactly the
-- distinction this contract exists to preserve. Test convenience is not a
-- reason to hold a production privilege: the suites take a transaction-local
-- membership instead, which vanishes on ROLLBACK.

-- ── (7) drop the temporary memberships LAST ─────────────────────────────────
-- Plain REVOKE: it deletes the temporary INHERIT/SET row outright. It cannot
-- touch the automatic ADMIN OPTION row Postgres created in step 0, whose grantor
-- is supabase_admin and which the SECOND reset needs in order to re-grant.
-- REVOKE SET/INHERIT OPTION FOR is deliberately NOT used: measured, it leaves an
-- all-false zombie row instead of deleting anything.
DO $$ BEGIN
  EXECUTE format('REVOKE fm_table_owner, fm_public_reader, fm_member_api FROM %I', current_user);
END $$;
