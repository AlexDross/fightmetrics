"""Correction 6A — new-fighter seeding uses parsed bout-local metadata only.

Seeding used to derive a newcomer's division from `clean_wc(detail_lookup wc)`
(always '' — that CSV has no WEIGHTCLASS) and then from `rows[-1]`, the
last-appended per-round STATS row, which depends on row order rather than
recency. Title count came from an event-name substring heuristic.

The helpers under test are loaded from update_fighters.py by AST extraction,
because importing that module executes a full regeneration.
"""

import ast
import os
import re
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
UPDATER = os.path.join(HERE, 'update_fighters.py')

# The seeding function itself is extracted and executed, not just inspected.
# Importing update_fighters.py runs a full regeneration at module scope, so the
# smallest unit containing the real newcomer-construction path is lifted out by
# AST and given the three module globals it reads. Everything else — the JS
# literal formatting, the escaping, the error type, the weight-limit table — is
# the production implementation, so a change to any of them is exercised here.
_PRELUDE = (
    'from fight_event_dates import is_dated\n'
    'from js_roster_parser import JsParseError, format_js_literal, js_escape\n'
    'fmt = format_js_literal\n'
    # Module state built from the CSVs at import time; a newcomer with no stats
    # rows and no reviewed prospect entry is the case that matters here.
    'stats_by_fighter = {}\n'
    'prospect_fallbacks = {}\n'
    'def compute_opponent_stats(name):\n'
    '    return (None, None)\n'
)
_WANTED = ('_contested_dated', 'latest_dated_division', 'count_championship_bouts',
           'compute_total_rounds', 'round2', 'build_new_fighter_entry')
# Real production values, lifted verbatim rather than restated in the test.
_WANTED_ASSIGNMENTS = ('WEIGHT_LIMITS',)


def _load_helpers():
    with open(UPDATER, encoding='utf-8') as handle:
        tree = ast.parse(handle.read())
    wanted = {n.name: n for n in tree.body
              if isinstance(n, ast.FunctionDef) and n.name in _WANTED}
    missing = set(_WANTED) - set(wanted)
    if missing:
        raise AssertionError(f'update_fighters.py is missing {sorted(missing)}')
    assigns = [n for n in tree.body if isinstance(n, ast.Assign)
               and any(isinstance(t, ast.Name) and t.id in _WANTED_ASSIGNMENTS
                       for t in n.targets)]
    if len(assigns) != len(_WANTED_ASSIGNMENTS):
        raise AssertionError(f'update_fighters.py is missing {_WANTED_ASSIGNMENTS}')
    namespace = {}
    source = (_PRELUDE
              + '\n'.join(ast.unparse(a) for a in assigns) + '\n'
              + '\n'.join(ast.unparse(wanted[n]) for n in _WANTED))
    exec(compile(source, UPDATER, 'exec'), namespace)
    return namespace


HELPERS = _load_helpers()
latest_dated_division = HELPERS['latest_dated_division']
count_championship_bouts = HELPERS['count_championship_bouts']
build_new_fighter_entry = HELPERS['build_new_fighter_entry']
JsParseError = HELPERS['JsParseError']


def record(**over):
    base = {'wi': 3, 'lo': 1, 'ws': 2, 'ls': 0, 'kow': 1, 'sbw': 0, 'dcw': 2,
            'lfd': '2026-05-01', 'dsl': 108}
    base.update(over)
    return base


def field(entry, name):
    """Read one `name:value` field back out of the emitted JS object literal.

    The quoted alternative crosses backslash escapes on purpose. A plain
    `'[^']*'` stops at the backslash in `'Women\\'s Strawweight'` and reports
    the division as `'Women\\'` — the exact Correction 5 truncation this
    codebase already fixed once, so the test helper must not reintroduce it.
    """
    match = re.search(
        rf'[{{,]{re.escape(name)}:((?:\'(?:\\.|[^\'\\])*\')|[^,}}]*)', entry)
    assert match, f'{name!r} not found in {entry!r}'
    return match.group(1)


def fight(date, division, *, championship=False, result='W', tournament_final=False):
    return {'date': date, 'result': result, 'wc_division': division,
            'wc_championship': championship, 'wc_tournament_final': tournament_final}


class SeededDivision(unittest.TestCase):

    def test_ordinary_newcomer_takes_the_latest_dated_division(self):
        fights = [fight('2026-05-01', 'Lightweight'), fight('2025-01-01', 'Featherweight')]
        self.assertEqual(latest_dated_division(fights), 'Lightweight')

    def test_womens_division_is_preserved_verbatim(self):
        self.assertEqual(
            latest_dated_division([fight('2026-05-01', "Women's Strawweight")]),
            "Women's Strawweight")

    def test_title_bout_seeds_the_division_not_a_title_string(self):
        division = latest_dated_division(
            [fight('2026-05-01', 'Bantamweight', championship=True)])
        self.assertEqual(division, 'Bantamweight')
        self.assertNotIn('title', division.lower())

    def test_tournament_final_seeds_its_division_and_no_championship(self):
        fights = [fight('2026-05-01', 'Flyweight', tournament_final=True)]
        self.assertEqual(latest_dated_division(fights), 'Flyweight')
        self.assertEqual(count_championship_bouts(fights), 0)

    def test_catchweight_newcomer(self):
        self.assertEqual(
            latest_dated_division([fight('2026-05-01', 'Catch Weight')]),
            'Catch Weight')

    def test_missing_stats_rows_are_irrelevant(self):
        # The retired path read rows[-1] of the STATS frame. Division now comes
        # only from the fight records, so a fighter with zero stats rows seeds.
        self.assertEqual(latest_dated_division([fight('2026-05-01', 'Welterweight')]),
                         'Welterweight')

    def test_result_is_independent_of_input_order(self):
        newest = fight('2026-05-01', 'Middleweight')
        older = fight('2019-01-01', 'Welterweight')
        # The updater sorts descending before calling this; the newest-first
        # contract is what makes the answer deterministic.
        self.assertEqual(latest_dated_division([newest, older]), 'Middleweight')
        self.assertEqual(latest_dated_division([newest, older, older]), 'Middleweight')

    def test_undated_and_uncontested_bouts_are_skipped(self):
        fights = [fight(None, 'Heavyweight'),
                  fight('2026-05-01', 'Bantamweight', result='D'),
                  fight('2026-01-01', 'Flyweight')]
        self.assertEqual(latest_dated_division(fights), 'Flyweight')

    def test_no_dated_contested_bout_returns_none_so_the_caller_fails_closed(self):
        self.assertIsNone(latest_dated_division([]))
        self.assertIsNone(latest_dated_division([fight(None, 'Heavyweight')]))
        self.assertIsNone(latest_dated_division([fight('2026-05-01', None)]))


class SeededTitleCount(unittest.TestCase):

    def test_counts_only_parsed_championships(self):
        fights = [fight('2026-05-01', 'Bantamweight', championship=True),
                  fight('2025-05-01', 'Bantamweight'),
                  fight('2024-05-01', 'Bantamweight', tournament_final=True)]
        self.assertEqual(count_championship_bouts(fights), 1)

    def test_no_event_name_heuristic(self):
        # An event whose NAME contains 'title' contributes nothing.
        fights = [fight('1999-01-08', 'Middleweight')]
        fights[0]['event'] = 'UFC 18: The Road to the Heavyweight Title'
        self.assertEqual(count_championship_bouts(fights), 0)

    def test_undated_and_uncontested_championships_are_excluded(self):
        fights = [fight(None, 'Heavyweight', championship=True),
                  fight('2026-05-01', 'Heavyweight', championship=True, result='D')]
        self.assertEqual(count_championship_bouts(fights), 0)

    def test_interim_and_superfight_count_as_championships(self):
        fights = [fight('2020-01-01', 'Heavyweight', championship=True),
                  fight('1996-01-01', 'Open Weight', championship=True)]
        self.assertEqual(count_championship_bouts(fights), 2)


class SeedingBehaviour(unittest.TestCase):
    """Runs the REAL newcomer-construction path and reads the emitted entry.

    The AST guards below prove the seeding function calls the right helpers.
    These prove the values it actually emits are correct, which is what a
    reviewer and the roster both depend on. Without this, the pinned feed seeds
    zero newcomers and the whole path ships unexercised.
    """

    def test_non_title_newcomer_emits_division_and_zero_title_bouts(self):
        entry = build_new_fighter_entry(
            'Test Newcomer', record(),
            [fight('2026-05-01', 'Lightweight'), fight('2025-02-01', 'Lightweight')])
        self.assertEqual(field(entry, 'w'), "'Lightweight'")
        self.assertEqual(field(entry, 'tb'), '0')

    def test_championship_newcomer_counts_only_championships(self):
        entry = build_new_fighter_entry(
            'Champ Newcomer', record(),
            [fight('2026-05-01', 'Bantamweight', championship=True),
             fight('2025-05-01', 'Bantamweight'),
             fight('2024-05-01', 'Bantamweight', tournament_final=True)])
        self.assertEqual(field(entry, 'w'), "'Bantamweight'")
        self.assertEqual(field(entry, 'tb'), '1')

    def test_division_change_seeds_the_latest_division(self):
        entry = build_new_fighter_entry(
            'Mover', record(),
            [fight('2026-05-01', 'Middleweight'), fight('2024-05-01', 'Welterweight')])
        self.assertEqual(field(entry, 'w'), "'Middleweight'")

    def test_event_name_containing_title_contributes_nothing(self):
        """The exact retired heuristic, held behaviourally."""
        bout = fight('1999-01-08', 'Middleweight')
        bout['event'] = 'UFC 18: The Road to the Heavyweight Title'
        entry = build_new_fighter_entry('Heuristic Bait', record(), [bout])
        self.assertEqual(field(entry, 'tb'), '0')
        self.assertEqual(field(entry, 'w'), "'Middleweight'")

    def test_womens_division_survives_escaping(self):
        entry = build_new_fighter_entry(
            'Apostrophe Case', record(), [fight('2026-05-01', "Women's Strawweight")])
        self.assertEqual(field(entry, 'w'), "'Women\\'s Strawweight'")

    def test_emitted_division_never_carries_status_text(self):
        entry = build_new_fighter_entry(
            'Title Fighter', record(),
            [fight('2026-05-01', 'Heavyweight', championship=True)])
        self.assertEqual(field(entry, 'w'), "'Heavyweight'")
        self.assertEqual(field(entry, 'tb'), '1')

    def test_input_order_does_not_change_the_emitted_entry(self):
        newest = fight('2026-05-01', 'Middleweight', championship=True)
        older = fight('2019-01-01', 'Welterweight')
        oldest = fight('2015-01-01', 'Lightweight')
        canonical = build_new_fighter_entry('Ordered', record(),
                                            [newest, older, oldest])
        # `fights` arrives sorted descending; a trailing duplicate of an older
        # bout must not displace the newest one.
        self.assertEqual(
            build_new_fighter_entry('Ordered', record(), [newest, older, oldest, older]),
            canonical)
        self.assertEqual(field(canonical, 'w'), "'Middleweight'")

    def test_missing_data_fails_closed(self):
        for label, fights in (
                ('no fights at all', []),
                ('only undated bouts', [fight(None, 'Heavyweight')]),
                ('dated bout with no parsed division', [fight('2026-05-01', None)]),
                ('only uncontested bouts',
                 [fight('2026-05-01', 'Heavyweight', result='D')])):
            with self.subTest(case=label):
                with self.assertRaises(JsParseError):
                    build_new_fighter_entry('Unseedable', record(), fights)


class SeedingSourceContract(unittest.TestCase):
    """Guards against the retired paths reappearing."""

    def setUp(self):
        with open(UPDATER, encoding='utf-8') as handle:
            self.source = handle.read()
        self.tree = ast.parse(self.source)

    def test_clean_wc_is_gone(self):
        names = {n.name for n in ast.walk(self.tree) if isinstance(n, ast.FunctionDef)}
        self.assertNotIn('clean_wc', names)
        called = {n.func.id for n in ast.walk(self.tree)
                  if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)}
        self.assertNotIn('clean_wc', called)

    def test_no_negative_index_into_stats_rows(self):
        offenders = [ast.unparse(n) for n in ast.walk(self.tree)
                     if isinstance(n, ast.Subscript)
                     and isinstance(n.slice, ast.UnaryOp)
                     and isinstance(n.slice.op, ast.USub)
                     and 'rows' in ast.unparse(n)]
        self.assertEqual(offenders, [], 'row-order-dependent seeding is back')

    # ── AST, SCOPED TO THE SEEDING FUNCTION ─────────────────────────────────
    # The retired assertion was `assertIn('count_championship_bouts(fights)',
    # source)`. The line `def count_championship_bouts(fights):` contains that
    # substring, so the check passed on its own definition and proved nothing
    # about the call site: reverting the tb field to the event-name heuristic
    # left the whole suite green. These read the AST of
    # build_new_fighter_entry itself.

    def _seeding_fn(self):
        for node in self.tree.body:
            if (isinstance(node, ast.FunctionDef)
                    and node.name == 'build_new_fighter_entry'):
                return node
        self.fail('update_fighters.py has no build_new_fighter_entry')

    @staticmethod
    def _interpolations(fn):
        """{emitted field name: interpolated expression} for every f-string part.

        The entry is built as one f-string per field, so the Constant directly
        preceding a FormattedValue is that field's `name:` label. This is what
        ties an assertion to the field actually emitted rather than to any
        mention of a helper elsewhere in the function.
        """
        found = {}
        for joined in [n for n in ast.walk(fn) if isinstance(n, ast.JoinedStr)]:
            label = None
            for part in joined.values:
                if isinstance(part, ast.Constant) and isinstance(part.value, str):
                    match = re.search(r'([A-Za-z_][A-Za-z0-9_]*):\s*$', part.value)
                    label = match.group(1) if match else None
                elif isinstance(part, ast.FormattedValue) and label:
                    found[label] = part.value
                    label = None
        return found

    def test_division_path_calls_latest_dated_division(self):
        fn = self._seeding_fn()
        calls = [n for n in ast.walk(fn) if isinstance(n, ast.Call)
                 and isinstance(n.func, ast.Name)
                 and n.func.id == 'latest_dated_division']
        self.assertTrue(calls, 'build_new_fighter_entry never calls '
                               'latest_dated_division')
        # …and its result is what lands in `weight_class`.
        assigned = [a for a in ast.walk(fn) if isinstance(a, ast.Assign)
                    and any(isinstance(t, ast.Name) and t.id == 'weight_class'
                            for t in a.targets)
                    and isinstance(a.value, ast.Call)
                    and isinstance(a.value.func, ast.Name)
                    and a.value.func.id == 'latest_dated_division']
        self.assertTrue(assigned, 'latest_dated_division is called but its result '
                                  'is not assigned to weight_class')
        # …and `weight_class` is what the emitted `w:` field interpolates.
        w_expr = self._interpolations(fn).get('w')
        self.assertIsNotNone(w_expr, "no `w:` field is emitted")
        self.assertIn('weight_class', ast.unparse(w_expr))

    def test_tb_field_interpolates_count_championship_bouts(self):
        fn = self._seeding_fn()
        tb_expr = self._interpolations(fn).get('tb')
        self.assertIsNotNone(tb_expr, "no `tb:` field is emitted")
        self.assertTrue(
            isinstance(tb_expr, ast.Call) and isinstance(tb_expr.func, ast.Name)
            and tb_expr.func.id == 'count_championship_bouts',
            f'tb is emitted as {ast.unparse(tb_expr)!r}; it must be a direct '
            f'count_championship_bouts(...) call, not a recomputed heuristic')

    def test_seeding_has_no_event_name_title_heuristic(self):
        """The specific retired defect: `'title' in <event>.lower()`."""
        fn = self._seeding_fn()
        for cmp_node in [n for n in ast.walk(fn) if isinstance(n, ast.Compare)]:
            rendered = ast.unparse(cmp_node)
            self.assertNotIn("'title'", rendered.lower().replace('"', "'"),
                             f'event-name title heuristic is back: {rendered}')


if __name__ == '__main__':
    unittest.main(verbosity=2)
