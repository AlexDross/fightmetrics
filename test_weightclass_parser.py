"""Correction 6A — fight_weightclass parser contract.

Guards the rules that make historical division/title status source-backed:
every observed label is reviewed, nothing outside the reviewed taxonomy is
accepted, and the traps that break naive implementations stay covered.
"""

import csv
import os
import unittest

import pandas as pd

from fight_weightclass import (
    REVIEWED_NO_TOKEN_LABELS,
    SUPPORTED_DIVISIONS,
    WeightclassParseError,
    parse_weightclass,
)

HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURES = os.path.join(HERE, 'tests', 'fixtures', 'weightclass')
LABELS_TSV = os.path.join(FIXTURES, 'labels_120.tsv')
SYNTHETIC_TSV = os.path.join(FIXTURES, 'synthetic.tsv')
RESULTS_CSV = os.path.join(HERE, 'ufc_fight_results.csv')


def _rows(path):
    with open(path, newline='', encoding='utf-8') as handle:
        return list(csv.DictReader(handle, delimiter='\t'))


class ReviewedLabelFixture(unittest.TestCase):
    """The 120 observed labels, every field asserted."""

    @classmethod
    def setUpClass(cls):
        cls.rows = _rows(LABELS_TSV)

    def test_fixture_covers_exactly_120_labels(self):
        self.assertEqual(len(self.rows), 120)
        self.assertEqual(len({r['raw'] for r in self.rows}), 120)

    def test_every_reviewed_label_parses_to_its_reviewed_values(self):
        for row in self.rows:
            with self.subTest(label=row['raw']):
                parsed = parse_weightclass(row['raw'])
                self.assertEqual(parsed['division'], row['division'])
                self.assertEqual(parsed['championship'], row['championship'] == 'true')
                self.assertEqual(parsed['interim'], row['interim'] == 'true')
                self.assertEqual(parsed['tournament_final'], row['tournament_final'] == 'true')
                self.assertEqual(parsed['category'], row['category'])

    def test_no_label_resolves_outside_the_supported_divisions(self):
        for row in self.rows:
            self.assertIn(parse_weightclass(row['raw'])['division'], SUPPORTED_DIVISIONS)

    def test_no_division_string_carries_title_or_interim(self):
        # `wc` is a division. Status lives in tb/interim, never in the string.
        for row in self.rows:
            division = parse_weightclass(row['raw'])['division']
            for banned in ('title', 'interim', 'bout', 'ufc'):
                self.assertNotIn(banned, division.lower(), f'{division!r} leaks {banned!r}')

    def test_unknown_is_never_emitted(self):
        for row in self.rows:
            self.assertNotEqual(parse_weightclass(row['raw'])['division'], 'Unknown')

    def test_fixture_matches_the_pinned_feed_in_both_directions(self):
        observed = set(
            pd.read_csv(RESULTS_CSV)['WEIGHTCLASS'].fillna('').astype(str).str.strip())
        observed.discard('')
        reviewed = {r['raw'] for r in self.rows}
        self.assertEqual(observed - reviewed, set(), 'feed has labels the fixture lacks')
        self.assertEqual(reviewed - observed, set(), 'fixture has labels the feed lacks')

    def test_ratified_totals(self):
        self.assertEqual(sum(int(r['raw_rows']) for r in self.rows), 8847)
        self.assertEqual(sum(int(r['canonical_bouts']) for r in self.rows), 8822)
        champ = [r for r in self.rows if r['championship'] == 'true']
        self.assertEqual(sum(int(r['raw_rows']) for r in champ), 398)
        self.assertEqual(sum(int(r['canonical_bouts']) for r in champ), 397)
        tourn = [r for r in self.rows if r['tournament_final'] == 'true']
        self.assertEqual(sum(int(r['raw_rows']) for r in tourn), 85)

    def test_reviewed_no_token_map_is_exactly_the_ratified_fifteen_rows(self):
        self.assertEqual(len(REVIEWED_NO_TOKEN_LABELS), 11)
        rows = {r['raw']: int(r['raw_rows']) for r in self.rows}
        self.assertEqual(sum(rows[label] for label in REVIEWED_NO_TOKEN_LABELS), 15)
        for label, division in REVIEWED_NO_TOKEN_LABELS.items():
            self.assertEqual(division, 'Open Weight')


class TaxonomyTraps(unittest.TestCase):
    """The cases that break the obvious implementations."""

    def test_ordinary_division(self):
        p = parse_weightclass('Middleweight Bout')
        self.assertEqual(p['division'], 'Middleweight')
        self.assertFalse(p['championship'])

    def test_ufc_championship(self):
        p = parse_weightclass('UFC Light Heavyweight Title Bout')
        self.assertEqual(p['division'], 'Light Heavyweight')
        self.assertTrue(p['championship'])
        self.assertFalse(p['interim'])

    def test_interim_championship_keeps_interim(self):
        # clean_wc used to strip the bare word 'Interim' and erase this.
        p = parse_weightclass('UFC Interim Heavyweight Title Bout')
        self.assertEqual(p['division'], 'Heavyweight')
        self.assertTrue(p['championship'])
        self.assertTrue(p['interim'])

    def test_superfight_championship_has_no_title_token(self):
        label = 'UFC Superfight Championship Bout'
        self.assertNotIn('title', label.lower())  # the trap, made explicit
        p = parse_weightclass(label)
        self.assertTrue(p['championship'])
        self.assertEqual(p['division'], 'Open Weight')

    def test_tuf_tournament_final_is_not_a_championship(self):
        p = parse_weightclass('Ultimate Fighter 33 Welterweight Tournament Title Bout')
        self.assertEqual(p['division'], 'Welterweight')
        self.assertFalse(p['championship'])
        self.assertTrue(p['tournament_final'])

    def test_road_to_ufc_concatenated_titlebout_spelling(self):
        p = parse_weightclass("Road to UFC 3 Women's Strawweight Tournament TitleBout")
        self.assertEqual(p['division'], "Women's Strawweight")
        self.assertFalse(p['championship'])
        self.assertTrue(p['tournament_final'])

    def test_early_ufc_bracket_final_is_not_a_championship(self):
        p = parse_weightclass('UFC 8 Tournament Title Bout')
        self.assertEqual(p['division'], 'Open Weight')
        self.assertFalse(p['championship'])
        self.assertTrue(p['tournament_final'])

    def test_catchweight_open_weight_super_heavyweight(self):
        for label, division in (('Catch Weight Bout', 'Catch Weight'),
                                ('Open Weight Bout', 'Open Weight'),
                                ('Super Heavyweight Bout', 'Super Heavyweight')):
            p = parse_weightclass(label)
            self.assertEqual(p['division'], division)
            self.assertFalse(p['championship'])

    def test_containment_is_not_a_second_token(self):
        for label, division in (('Light Heavyweight Bout', 'Light Heavyweight'),
                                ('Super Heavyweight Bout', 'Super Heavyweight'),
                                ("Women's Flyweight Bout", "Women's Flyweight"),
                                ("Women's Strawweight Bout", "Women's Strawweight")):
            self.assertEqual(parse_weightclass(label)['division'], division)


class FailClosed(unittest.TestCase):

    def test_missing_label(self):
        for value in (None, 0, [], {}):
            with self.assertRaises(WeightclassParseError):
                parse_weightclass(value)

    def test_blank_label(self):
        for value in ('', '   ', '\t\n'):
            with self.assertRaises(WeightclassParseError):
                parse_weightclass(value)

    def test_unreviewed_label_with_a_recognised_token_is_the_gates_job(self):
        # LAYERING, made explicit. The parser answers "what does this label
        # mean?", so a well-formed unfamiliar label parses. Deciding that the
        # label may be USED is the closed-label gate's job, which rejects it
        # (see test_correction6_history.ClosedLabelGate). Asserting a raise
        # here would push feed-membership policy into per-row parsing.
        parsed = parse_weightclass('BMF Welterweight Title Bout')
        self.assertEqual(parsed['division'], 'Welterweight')

    def test_unknown_division(self):
        with self.assertRaises(WeightclassParseError):
            parse_weightclass('Cruiserweight Bout')

    def test_two_independent_division_tokens(self):
        with self.assertRaises(WeightclassParseError):
            parse_weightclass('Welterweight Lightweight Bout')

    def test_no_token_and_not_in_reviewed_map(self):
        with self.assertRaises(WeightclassParseError):
            parse_weightclass('UFC 99 Tournament Title Bout')

    def test_championship_and_tournament_final_are_mutually_exclusive(self):
        for row in _rows(LABELS_TSV):
            p = parse_weightclass(row['raw'])
            self.assertFalse(p['championship'] and p['tournament_final'], row['raw'])


class SyntheticFixture(unittest.TestCase):
    """Drive every synthetic.tsv case from the fixture itself."""

    def test_synthetic_cases(self):
        for row in _rows(SYNTHETIC_TSV):
            with self.subTest(case=row['case']):
                if row['expect'] == 'raise':
                    with self.assertRaises(WeightclassParseError):
                        parse_weightclass(row['raw'])
                elif row['expect'] == 'gate':
                    # Parses cleanly; closed-world membership is gate-enforced.
                    parse_weightclass(row['raw'])
                else:
                    division, champ, interim, tourn = row['expect'].split('|')
                    p = parse_weightclass(row['raw'])
                    self.assertEqual(p['division'], division)
                    self.assertEqual(p['championship'], champ == 'true')
                    self.assertEqual(p['interim'], interim == 'true')
                    self.assertEqual(p['tournament_final'], tourn == 'true')


if __name__ == '__main__':
    unittest.main(verbosity=2)
