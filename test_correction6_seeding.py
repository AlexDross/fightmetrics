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
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
UPDATER = os.path.join(HERE, 'update_fighters.py')

_PRELUDE = (
    'from fight_event_dates import is_dated\n'
)
_WANTED = ('_contested_dated', 'latest_dated_division', 'count_championship_bouts')


def _load_helpers():
    with open(UPDATER, encoding='utf-8') as handle:
        tree = ast.parse(handle.read())
    wanted = {n.name: n for n in tree.body
              if isinstance(n, ast.FunctionDef) and n.name in _WANTED}
    missing = set(_WANTED) - set(wanted)
    if missing:
        raise AssertionError(f'update_fighters.py is missing {sorted(missing)}')
    namespace = {}
    source = _PRELUDE + '\n'.join(ast.unparse(wanted[n]) for n in _WANTED)
    exec(compile(source, UPDATER, 'exec'), namespace)
    return namespace


HELPERS = _load_helpers()
latest_dated_division = HELPERS['latest_dated_division']
count_championship_bouts = HELPERS['count_championship_bouts']


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

    def test_seeding_uses_the_deterministic_helpers(self):
        self.assertIn('latest_dated_division(fights)', self.source)
        self.assertIn('count_championship_bouts(fights)', self.source)


if __name__ == '__main__':
    unittest.main(verbosity=2)
