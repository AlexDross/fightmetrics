-- Stage 7 Gate 2 — required measurements (plan §12).
--
-- These decide whether two PROVISIONAL constraints survive:
--   prediction_snapshots_prob_complementary  (prob_a + prob_b = 1, exact)
--   the exact profit equality inside assert_settlement_row (<>, no epsilon)
-- Exact equality is retained only if the measurements pass in the real stack.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT pg_catalog.set_config('search_path',
  'public, ' || (SELECT n.nspname FROM pg_catalog.pg_extension e
                   JOIN pg_catalog.pg_namespace n ON n.oid = e.extnamespace
                  WHERE e.extname = 'pgtap'), true);
SELECT plan(19);

-- Same transaction-local privileges as the behavioural suite: postgres holds no
-- EXECUTE on app_private helpers, deliberately, so it must grant itself the
-- capability. ROLLBACK removes both grants.
GRANT USAGE ON SCHEMA extensions TO fm_table_owner;
GRANT fm_table_owner TO postgres WITH SET TRUE, INHERIT FALSE;
SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;

-- ── 1. float8 probability complementarity ───────────────────────────────────
-- BOTH of the next two are SQL-ONLY DIAGNOSTICS. The path that matters is
-- browser JSON -> PostgREST -> float8 -> response -> JS, and neither touches
-- PostgREST: an in-database jsonb cast models part of the numeric conversion but
-- exercises none of the transport. They also derive pB as (1 - pA) in SQL, so
-- they test one serialized value rather than two. See the note below.
SELECT is((SELECT count(*) FROM generate_series(1, 9999) g
            CROSS JOIN LATERAL (SELECT (g / 10000.0)::double precision AS pa) s
           WHERE s.pa + (1 - s.pa)::double precision <> 1),
          0::bigint,
          'SQL-only diagnostic: pA + (1-pA) = 1 for 9,999 four-decimal values');

SELECT is((SELECT count(*) FROM generate_series(1, 9999) g
            CROSS JOIN LATERAL (
              SELECT ((to_jsonb((g / 10000.0)::double precision)) #>> '{}')::double precision AS pa
            ) s
           WHERE s.pa + (1 - s.pa)::double precision <> 1),
          0::bigint,
          'SQL-only diagnostic: the same holds after a jsonb cast in-database');

-- THE ABOVE ARE NOT THE REQUIRED MEASUREMENT. Both derive pB as (1 - pA) inside
-- Postgres, so they test one serialized value, not two. The real question is
-- whether TWO independently serialized browser doubles still sum to exactly 1
-- after the browser -> PostgREST -> float8 -> response -> JS round trip. That
-- needs the outstanding test:api harness; until then the constraint stays
-- PROVISIONAL. What follows is the strongest check available in SQL alone:
-- both sides arrive as independently parsed text, as they would over the wire.
SELECT is((SELECT count(*) FROM (VALUES
             ('0.5','0.5'),('0.6','0.4'),('0.55','0.45'),('0.3333','0.6667'),
             ('0.1','0.9'),('0.01','0.99'),('0.123456789','0.876543211'))
             AS c(a, b)
           WHERE c.a::text::double precision + c.b::text::double precision <> 1),
          0::bigint,
          'two INDEPENDENTLY parsed text doubles still sum to exactly 1');

SELECT ok((0.1::double precision + 0.2::double precision) <> 0.3::double precision,
          'control: float8 addition is genuinely inexact in this database');

-- The constraint BINDS: a non-complementary pair is rejected by the database,
-- not merely by arithmetic in a test.
SELECT throws_ok($$
  INSERT INTO app_private.prediction_snapshots (workspace_id, id, run_id, bout_id,
    basis, prob_a, prob_b, winner_corner, captured_at, capture_mode)
  VALUES ('00000000-0000-4000-8000-00000000000f',
          'dddd0000-0000-4000-8000-00000000000f', 'x',
          'bbbb0000-0000-4000-8000-00000000000f',
          'v2', 0.6, 0.41, 'A', now(), 'live')$$,
  '23514', NULL, 'the complementarity CHECK rejects a perturbed pair');

-- ── 2. Profit recomputation ─────────────────────────────────────────────────
-- An earlier revision compared `stake * expr` with `stake * expr` — the same
-- expression on both sides — which cannot detect drift of any kind. These
-- compare the database's decimal conversion against INDEPENDENTLY computed
-- constants, worked out from the IEEE-754 definition rather than by calling the
-- function under test.
-- Compared as BIT PATTERNS via float8send. pgTAP's is() renders float8 through
-- the session's extra_float_digits, so a genuine mismatch can print as two
-- identical-looking strings — measured: 1.66666666666667 vs 1.66666666666667.
-- Hex is exact and unambiguous.
-- The expected bit patterns come from NODE, computing the same expression the
-- repository uses (`o > 0 ? 1 + o/100 : 1 + 100/Math.abs(o)`) and dumping
-- Buffer.writeDoubleBE. They are cross-language constants, not a restatement of
-- the SQL. Postgres and V8 agree bit-for-bit on all four.
--
-- This caught a real error in an earlier revision of this test: the "obvious"
-- decimal literal 1.6666666666666667 is 3ffaaaaaaaaaaaab, one ULP away from
-- what BOTH engines actually compute (3ffaaaaaaaaaaaaa). The database was right
-- and the hand-written constant was wrong.
SELECT is(encode(pg_catalog.float8send(app_private.decimal_from_american(-150)), 'hex'),
          '3ffaaaaaaaaaaaaa', 'decimal_from_american(-150) matches V8 bit-for-bit');
SELECT is(encode(pg_catalog.float8send(app_private.decimal_from_american(250)), 'hex'),
          '400c000000000000', 'decimal_from_american(+250) matches V8 bit-for-bit');
SELECT is(encode(pg_catalog.float8send(app_private.decimal_from_american(-110)), 'hex'),
          '3ffe8ba2e8ba2e8c', 'decimal_from_american(-110) matches V8 bit-for-bit');
SELECT is(encode(pg_catalog.float8send(app_private.decimal_from_american(100)), 'hex'),
          '4000000000000000', 'decimal_from_american(+100) matches V8 bit-for-bit');

-- The settlement contract's accept/reject behaviour against a REAL stored row —
-- correct profit accepted, perturbed profit rejected — needs a settled fixture
-- and lives in 01_behaviour.test.sql.
--
-- NOTE: the plan's recomputation across the 152 stored computed rows needs
-- Gate 3's seed and is NOT done here, so the exact `<>` comparison remains
-- PROVISIONAL.

-- ── 3. Negative-zero probe ──────────────────────────────────────────────────
-- IEEE-754 -0.0 is 0x8000000000000000. JSON.stringify writes it as "0" and
-- JSON.parse reads +0, so a persisted -0 is a silent round-trip change.
-- `(-0.0)::double precision` is constant-folded to +0 by the parser (measured:
-- it sends 0000000000000000), so the literal must arrive as text to survive.
SELECT is(encode(pg_catalog.float8send('-0'::text::double precision), 'hex'),
          '8000000000000000', 'control: the -0 probe recognises a real -0');
SELECT isnt(encode(pg_catalog.float8send((0.0)::double precision), 'hex'),
            '8000000000000000', 'control: +0 is distinguishable from -0');

-- Every persisted double column, across every app_private table.
SELECT is((SELECT count(*) FROM (
             SELECT s.prob_a AS v FROM app_private.prediction_snapshots s
             UNION ALL SELECT s.prob_b FROM app_private.prediction_snapshots s
             UNION ALL SELECT s.reconstruction_prior_v2_p_a FROM app_private.prediction_snapshots s
             UNION ALL SELECT s.reconstruction_prior_v2_p_b FROM app_private.prediction_snapshots s
             UNION ALL SELECT a.edge_a FROM app_private.betting_assessments a
             UNION ALL SELECT a.edge_b FROM app_private.betting_assessments a
             UNION ALL SELECT a.ev_a FROM app_private.betting_assessments a
             UNION ALL SELECT a.ev_b FROM app_private.betting_assessments a
             UNION ALL SELECT a.kelly_a FROM app_private.betting_assessments a
             UNION ALL SELECT a.kelly_b FROM app_private.betting_assessments a
             UNION ALL SELECT t.profit_units FROM app_private.tracked_positions t
             UNION ALL SELECT g.profit_units FROM app_private.wagers g
             UNION ALL SELECT l.model_prob_at_build FROM app_private.parlay_legs l) d
           WHERE d.v IS NOT NULL
             AND encode(pg_catalog.float8send(d.v), 'hex') = '8000000000000000'),
          0::bigint, 'no persisted double column holds a negative zero');

-- MEASURED FINDING: the -0 branch of is_js_double_map is UNREACHABLE.
--
-- jsonb numbers are `numeric`, and Postgres numeric has no negative zero, so
-- the parser normalises -0.0 to 0.0 before any CHECK runs:
--   ('{"x": -0.0}'::jsonb -> 'x') #>> '{}'  =>  '0.0'
--   '{"x": -0.0}'::jsonb::text             =>  '{"x": 0.0}'
-- The regex therefore never sees a leading minus and cannot fire. The real
-- defence against persisting -0 is the repository adapter, which rejects
-- Object.is(n, -0) before the value is serialised. The SQL branch is retained
-- as belt-and-braces but must not be counted as protection.
SELECT is(('{"x": -0.0}'::jsonb -> 'x') #>> '{}', '0.0',
          'jsonb normalises -0 to 0, so the SQL -0 guard cannot fire');
SELECT ok(app_private.is_js_double_map('{"x": -0.0}'::jsonb),
          'consequently a jsonb -0 is ACCEPTED — documented, not a regression');

-- ── 4. Stake corpus through parse_positive_decimal ──────────────────────────
-- The 32-char bound is measured, not guessed: over a 699,826-value seeded
-- corpus the longest String(finite positive double) was 24 characters. That
-- exact value, and the boundary cases around it, go through the SQL parser.
SELECT lives_ok(
  $$SELECT app_private.parse_positive_decimal('0.0000057692833136856875')$$,
  'the measured 24-char corpus maximum parses');

SELECT is((SELECT count(*) FROM (VALUES
             ('1'),('2'),('0.5'),('0.25'),('1.5'),('0.1'),
             ('5e-324'),('1.7976931348623157e+308'),
             ('0.0000057692833136856875'),('9007199254740993'),
             ('0.30000000000000004')) AS c(s)
           WHERE app_private.parse_positive_decimal(c.s) IS NULL),
          0::bigint, 'every representative corpus value parses');

-- Rejection cannot be counted in a set-returning query — the first RAISE aborts
-- the statement — so it is asserted one value at a time by throws_ok, which is
-- what actually proves it.
SELECT throws_ok($$SELECT app_private.parse_positive_decimal('0')$$,
                 NULL, NULL, 'stake "0" is rejected: value must be > 0');
SELECT throws_ok($$SELECT app_private.parse_positive_decimal('-1')$$,
                 NULL, NULL, 'a negative stake is rejected');
SELECT throws_ok(
  format($$SELECT app_private.parse_positive_decimal(%L)$$, '1.' || repeat('9', 40)),
  NULL, NULL, 'a stake over 32 characters is rejected');

SELECT * FROM finish();
ROLLBACK;
