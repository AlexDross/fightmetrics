#!/usr/bin/env python3

import unittest
from pathlib import Path

import pandas as pd

from fight_data_integrity import (
    AggregateConflictError,
    canonicalize_aggregate_inputs,
    canonicalize_alias_rows,
    load_required_csv,
)


FIXTURES = Path(__file__).parent / 'tests' / 'fixtures' / 'fight-data-alias'
ALIASES = {'UFC Fight Night: Fixture': 'Noche UFC: Fixture'}


class TestAggregateAliasFixtures(unittest.TestCase):
    def test_alias_rows_collapse_across_all_three_inputs(self):
        results, details, stats, summary = canonicalize_aggregate_inputs(
            pd.read_csv(FIXTURES / 'results.csv', dtype=str),
            pd.read_csv(FIXTURES / 'details.csv', dtype=str),
            pd.read_csv(FIXTURES / 'stats.csv', dtype=str),
            ALIASES,
        )
        self.assertEqual(len(results), 1)
        self.assertEqual(len(details), 1)
        self.assertEqual(len(stats), 2)
        self.assertEqual(set(results['EVENT']), {'Noche UFC: Fixture'})
        self.assertEqual(set(details['EVENT']), {'Noche UFC: Fixture'})
        self.assertEqual(set(stats['EVENT']), {'Noche UFC: Fixture'})
        self.assertEqual(summary['results']['collapsedRows'], 1)
        self.assertEqual(summary['details']['collapsedRows'], 1)
        self.assertEqual(summary['stats']['collapsedRows'], 2)

    def test_conflicting_alias_payload_hard_fails(self):
        with self.assertRaisesRegex(AggregateConflictError, 'SIG.STR.'):
            canonicalize_alias_rows(
                pd.read_csv(FIXTURES / 'stats-conflict.csv', dtype=str),
                ALIASES,
                identity_columns=('EVENT', 'BOUT', 'ROUND', 'FIGHTER'),
                source_name='fixture stats',
            )

    def test_duplicate_label_inside_one_event_is_not_erased(self):
        rows = pd.DataFrame([
            {'EVENT': 'UFC - Ultimate Fixture', 'BOUT': 'A vs. B', 'URL': 'one'},
            {'EVENT': 'UFC - Ultimate Fixture', 'BOUT': 'A vs. B', 'URL': 'two'},
        ])
        result, summary = canonicalize_alias_rows(
            rows,
            ALIASES,
            identity_columns=('EVENT', 'BOUT'),
            source_name='fixture results',
        )
        self.assertEqual(len(result), 2)
        self.assertEqual(summary['collapsedRows'], 0)

    def test_no_alias_map_is_a_no_op(self):
        rows = pd.read_csv(FIXTURES / 'stats.csv', dtype=str).iloc[:2]
        result, summary = canonicalize_alias_rows(
            rows,
            {},
            identity_columns=('EVENT', 'BOUT', 'ROUND', 'FIGHTER'),
            source_name='fixture stats',
        )
        pd.testing.assert_frame_equal(result, rows)
        self.assertEqual(summary, {'canonicalizedRows': 0, 'collapsedRows': 0})


class TestRequiredInputs(unittest.TestCase):
    def test_missing_csv_is_a_hard_failure(self):
        with self.assertRaisesRegex(FileNotFoundError, 'Required aggregate input'):
            load_required_csv(FIXTURES / 'does-not-exist.csv')


if __name__ == '__main__':
    unittest.main()
