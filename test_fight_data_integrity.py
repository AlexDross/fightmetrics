#!/usr/bin/env python3

import tempfile
import unittest
from pathlib import Path

import pandas as pd

from fight_data_integrity import (
    bout_division,
    AggregateConflictError,
    canonicalize_aggregate_inputs,
    canonicalize_alias_rows,
    FeedIntegrityError,
    load_required_csv,
    publish_atomically,
    validate_completed_feed,
    validate_record_dates,
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


class TestBoutDivision(unittest.TestCase):
    def test_plain_and_title_labels(self):
        self.assertEqual(bout_division('Heavyweight Bout'), 'Heavyweight')
        self.assertEqual(bout_division('Light Heavyweight Bout'), 'Light Heavyweight')
        self.assertEqual(bout_division('UFC Interim Light Heavyweight Title Bout'), 'Light Heavyweight')
        self.assertEqual(bout_division("UFC Women's Flyweight Title Bout"), "Women's Flyweight")
        self.assertEqual(bout_division('Catch Weight Bout'), 'Catch Weight')

    def test_tournament_labels_keep_their_division(self):
        self.assertEqual(bout_division('Ultimate Fighter 19 Middleweight Tournament Title Bout'), 'Middleweight')
        self.assertEqual(bout_division("Road to 3 Women's Strawweight Tournament TitleBout"), "Women's Strawweight")

    def test_no_division_is_none(self):
        for label in ('UFC 2 Tournament Title Bout', 'Superfight Championship Bout', '', None):
            self.assertIsNone(bout_division(label))


TODAY = '2026-10-08'


def feed(rounds=2, time='3:10', date='2026-10-03', outcome='W/L', drop=()):
    """One modern bout and its per-round stats; ``drop`` removes (fighter, round)."""
    results = pd.DataFrame([{
        'EVENT': 'UFC 1000', 'BOUT': 'Ann A vs. Bea B', 'OUTCOME': outcome,
        'ROUND': str(rounds), 'TIME': time, 'DATE': date,
    }])
    stats = pd.DataFrame([
        {'EVENT': 'UFC 1000', 'BOUT': 'Ann A vs. Bea B',
         'ROUND': f'Round {r}', 'FIGHTER': f}
        for r in range(1, rounds + 1) for f in ('Ann A', 'Bea B')
        if (f, r) not in drop
    ])
    return results, stats


class TestCompletedFeedGate(unittest.TestCase):
    def assertRejected(self, results, stats, needle):
        with self.assertRaises(FeedIntegrityError) as caught:
            validate_completed_feed(results, stats, TODAY)
        self.assertIn(needle, str(caught.exception))

    def test_complete_modern_bout_passes(self):
        self.assertEqual(validate_completed_feed(*feed(), TODAY),
                         {'eraBouts': 1, 'exemptBouts': 0})

    def test_fighter_with_no_round_stats_is_rejected(self):
        self.assertRejected(*feed(drop={('Bea B', 1), ('Bea B', 2)}), 'missing round stats')

    def test_missing_single_round_is_rejected(self):
        self.assertRejected(*feed(rounds=3, drop={('Ann A', 2)}), 'incomplete round stats')

    def test_result_dated_after_today_is_rejected(self):
        self.assertRejected(*feed(date='2026-10-10'), 'future completed result')

    def test_result_dated_today_is_accepted(self):
        validate_completed_feed(*feed(date=TODAY), TODAY)

    def test_round_longer_than_five_minutes_is_rejected(self):
        self.assertRejected(*feed(time='5:30'), 'invalid round duration')

    def test_unparseable_time_is_rejected(self):
        self.assertRejected(*feed(time=''), 'invalid round duration')

    def test_unknown_outcome_is_rejected(self):
        self.assertRejected(*feed(outcome='X/Y'), 'unknown outcome')

    def test_stats_without_a_result_are_rejected(self):
        results, stats = feed()
        self.assertRejected(results.iloc[0:0], stats, 'round stats without a result')

    def test_pre_era_gaps_are_exempt(self):
        results, stats = feed(date='1996-05-17', time='12:00', drop={('Ann A', 1), ('Ann A', 2)})
        self.assertEqual(validate_completed_feed(results, stats, TODAY),
                         {'eraBouts': 0, 'exemptBouts': 1})

    def test_pre_era_future_date_is_still_rejected(self):
        # Exemption covers stat coverage only; nothing escapes the date check.
        results, stats = feed(date='2027-01-01')
        self.assertRejected(results, stats, 'future completed result')

    def test_names_are_normalised_like_the_stats(self):
        results, stats = feed()
        stats['FIGHTER'] = stats['FIGHTER'].replace({'Bea B': 'Beatrice B'})
        self.assertRejected(results, stats, 'missing round stats')
        validate_completed_feed(results, stats, TODAY,
                                normalize_name=lambda n: {'Bea B': 'Beatrice B'}.get(n, n))

    def test_every_problem_is_reported_together(self):
        results, stats = feed(date='2026-10-10', time='6:00', drop={('Ann A', 1)})
        with self.assertRaises(FeedIntegrityError) as caught:
            validate_completed_feed(results, stats, TODAY)
        self.assertIn('3 integrity check', str(caught.exception))


class TestRecordDateGate(unittest.TestCase):
    def test_future_last_fight_is_rejected(self):
        with self.assertRaisesRegex(FeedIntegrityError, 'dsl=-2'):
            validate_record_dates({'N S': {'lfd': '2026-10-10', 'dsl': -2}}, TODAY)

    def test_current_records_pass(self):
        validate_record_dates({'N S': {'lfd': '2026-10-03', 'dsl': 5},
                               'Undated': {'lfd': None, 'dsl': None}}, TODAY)


class TestAtomicPublish(unittest.TestCase):
    def test_writes_every_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            a, b = Path(tmp) / 'a.js', Path(tmp) / 'b.js'
            publish_atomically({a: 'new a', b: 'new b'})
            self.assertEqual((a.read_text(), b.read_text()), ('new a', 'new b'))
            self.assertEqual(sorted(p.name for p in Path(tmp).iterdir()), ['a.js', 'b.js'])

    def test_failure_while_staging_leaves_previous_set_intact(self):
        with tempfile.TemporaryDirectory() as tmp:
            a = Path(tmp) / 'a.js'
            a.write_text('old a')
            unwritable = Path(tmp) / 'missing-dir' / 'b.js'
            with self.assertRaises(OSError):
                publish_atomically({a: 'new a', unwritable: 'new b'})
            self.assertEqual(a.read_text(), 'old a')
            self.assertEqual([p.name for p in Path(tmp).iterdir() if p.is_file()], ['a.js'])


if __name__ == '__main__':
    unittest.main()
