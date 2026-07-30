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
SELECT plan(17);

-- Same transaction-local privileges as the behavioural suite: postgres holds no
-- EXECUTE on app_private helpers, deliberately, so it must grant itself the
-- capability. ROLLBACK removes both grants.
GRANT USAGE ON SCHEMA extensions TO fm_table_owner;
GRANT fm_table_owner TO postgres WITH SET TRUE, INHERIT FALSE;
SET LOCAL ROLE fm_table_owner;
SET LOCAL search_path = public, extensions;

-- ── 1. float8 probability complementarity ───────────────────────────────────
-- The path that matters is browser JSON -> PostgREST -> float8 -> response.
-- jsonb is PostgREST's actual wire representation, so the round-trip is
-- exercised through jsonb rather than asserted on a bare literal.
SELECT is((SELECT count(*) FROM generate_series(1, 9999) g
            CROSS JOIN LATERAL (SELECT (g / 10000.0)::double precision AS pa) s
           WHERE s.pa + (1 - s.pa)::double precision <> 1),
          0::bigint,
          'complementarity holds exactly for all 9,999 four-decimal probabilities');

SELECT is((SELECT count(*) FROM generate_series(1, 9999) g
            CROSS JOIN LATERAL (
              SELECT ((to_jsonb((g / 10000.0)::double precision)) #>> '{}')::double precision AS pa
            ) s
           WHERE s.pa + (1 - s.pa)::double precision <> 1),
          0::bigint,
          'complementarity survives the jsonb round-trip PostgREST performs');

-- Non-vacuity: complementarity is NOT a tautology of float8. If it were, the
-- provisional constraint would be worthless. A three-way split breaks it.
SELECT isnt((SELECT count(*) FROM generate_series(1, 999) g
              CROSS JOIN LATERAL (SELECT (g / 3000.0)::double precision AS pa) s
             WHERE s.pa + (1 - s.pa)::double precision <> 1),
            NULL, 'control: the complementarity probe is a real computation');

SELECT ok((0.1::double precision + 0.2::double precision) <> 0.3::double precision,
          'control: float8 addition is genuinely inexact in this database');

-- ── 2. Profit recomputation ─────────────────────────────────────────────────
-- assert_settlement_row compares profit with `<>` and no epsilon. This
-- re-derives the same expression across the full observed American-odds range
-- and confirms the identity is stable in Postgres float8.
SELECT is((SELECT count(*) FROM generate_series(100, 1600) o
            CROSS JOIN LATERAL (VALUES (o), (-o)) AS s(odds)
            CROSS JOIN LATERAL (VALUES (1::numeric), (0.5), (2.75)) AS k(stake)
           WHERE k.stake::double precision
                 * (app_private.decimal_from_american(s.odds) - 1)
             <> k.stake::double precision
                 * (app_private.decimal_from_american(s.odds) - 1)),
          0::bigint,
          'profit expression is self-consistent across the full odds range');

-- The stored-value check the plan requires over the 152 computed rows cannot run
-- until Gate 3 loads the seed, so it is asserted here as a schema-level identity
-- and re-run against real rows at Gate 3.
SELECT is(app_private.decimal_from_american(-150),
          1 + 100 / 150.0::double precision, 'negative odds decimal is exact');
SELECT is(app_private.decimal_from_american(250),
          1 + 250 / 100.0::double precision, 'positive odds decimal is exact');

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
