#!/usr/bin/env python3
"""
test_fighter_profiles.py — tale-of-the-tape parsing and the fill-only-empty rule.

Writes nothing and reads no Greco CSV: fighter_profiles is pure, and the rows
below are copied from ufc_fighter_tott.csv as csv.DictReader yields them.

stdlib unittest — no extra dependency.
"""

import unittest
from datetime import date

import fighter_profiles as FP
import js_roster_parser as P

TODAY = date(2026, 10, 8)


def row(fighter, height='--', weight='--', reach='--', stance='', dob='--', url=''):
    return {'FIGHTER': fighter, 'HEIGHT': height, 'WEIGHT': weight,
            'REACH': reach, 'STANCE': stance, 'DOB': dob, 'URL': url}


SHAHBAZYAN = row('Leon Shahbazyan', '6\' 4"', '170 lbs.', '74"', 'Orthodox', 'Nov 18, 1995')
FRYE = row('Allen Frye Jr.', weight='265 lbs.', dob='Apr 15, 1998')


class Parsing(unittest.TestCase):
    def test_height_reach_weight(self):
        self.assertEqual(FP.parse_height('6\' 4"'), 76.0)
        self.assertEqual(FP.parse_height('5\' 10"'), 70.0)
        self.assertEqual(FP.parse_reach('74"'), 74.0)
        self.assertEqual(FP.parse_weight('170 lbs.'), 170)

    def test_missing_markers_are_none(self):
        for v in ('--', '', None, 'nan'):
            self.assertIsNone(FP.parse_height(v))
            self.assertIsNone(FP.parse_reach(v))
            self.assertIsNone(FP.parse_weight(v))
            self.assertIsNone(FP.parse_dob(v))
            self.assertIsNone(FP.parse_stance(v))

    def test_dob_and_age(self):
        self.assertEqual(FP.parse_dob('Nov 18, 1995'), '1995-11-18')
        self.assertEqual(FP.age_on('1995-11-18', TODAY), 30)   # birthday not reached
        self.assertEqual(FP.age_on('1995-10-08', TODAY), 31)   # birthday today

    def test_unknown_stance_is_dropped(self):
        self.assertEqual(FP.parse_stance('Southpaw'), 'Southpaw')
        self.assertIsNone(FP.parse_stance('nan'))


class AmbiguousNames(unittest.TestCase):
    def test_a_shared_name_contributes_nothing(self):
        rows = [row('Bruno Silva', '6\' 0"', dob='Jul 13, 1989'),
                row('Bruno Silva', '5\' 4"', dob='Mar 16, 1990'),
                SHAHBAZYAN]
        profiles, ambiguous = FP.load_tott_profiles(rows, {})
        self.assertNotIn('Bruno Silva', profiles)
        self.assertEqual(ambiguous, ['Bruno Silva'])
        self.assertIn('Leon Shahbazyan', profiles)

    def test_aliases_land_on_the_canonical_name(self):
        profiles, _ = FP.load_tott_profiles([row('Zach Reese', dob='Jan 01, 1994')],
                                            {'Zach Reese': 'Zachary Reese'})
        self.assertEqual(profiles['Zachary Reese']['dob'], '1994-01-01')

    def test_an_alias_collapsing_two_rows_is_ambiguous(self):
        rows = [row('Kai Kamaka'), row('Kai Kamaka III')]
        _, ambiguous = FP.load_tott_profiles(rows, {'Kai Kamaka': 'Kai Kamaka III'})
        self.assertEqual(ambiguous, ['Kai Kamaka III'])


class FillOnlyEmpty(unittest.TestCase):
    def setUp(self):
        self.profiles, _ = FP.load_tott_profiles([SHAHBAZYAN, FRYE], {})

    def test_fills_every_empty_field(self):
        current = {'ag': None, 'ht': None, 'rh': None, 'st': ''}  # atd key absent
        fills = FP.fill_updates(current, self.profiles['Leon Shahbazyan'], 0.5, TODAY)
        self.assertEqual(fills, {'ag': 30, 'ht': 76.0, 'rh': 74.0, 'st': 'Orthodox', 'atd': 0.5})

    def test_never_overwrites_a_stored_value(self):
        current = {'ag': 29, 'ht': 75.0, 'rh': 0.0, 'st': 'Southpaw', 'atd': 0.0}
        fills = FP.fill_updates(current, self.profiles['Leon Shahbazyan'], 0.9, TODAY)
        # 0 / 0.0 are stored values, not gaps.
        self.assertEqual(fills, {})

    def test_source_gaps_stay_gaps(self):
        current = {'ag': None, 'ht': None, 'rh': None, 'st': '', 'atd': None}
        fills = FP.fill_updates(current, self.profiles['Allen Frye Jr.'], None, TODAY)
        self.assertEqual(fills, {'ag': 28})
        self.assertNotIn(None, fills.values())

    def test_no_profile_still_offers_atd(self):
        self.assertEqual(FP.fill_updates({'atd': None}, None, 0.75, TODAY), {'atd': 0.75})

    def test_fill_fields_are_the_declared_set(self):
        current = dict.fromkeys(FP.PROFILE_FILL_FIELDS)
        fills = FP.fill_updates(current, self.profiles['Leon Shahbazyan'], 0.5, TODAY)
        self.assertEqual(set(fills), set(FP.PROFILE_FILL_FIELDS))

    def test_round_trip_through_the_roster_grammar(self):
        """The updater's exact splice: append absent keys as null, then patch."""
        entry = "{n:'Leon Shahbazyan',w:'Welterweight',ag:null,ht:null,rh:null,st:'',wi:0,lo:1}"
        current = {k: f.value for k, f in P.parse_object_fields(entry).items()}
        fills = FP.fill_updates(current, self.profiles['Leon Shahbazyan'], 0.5, TODAY)
        for field in fills:
            if field not in current:
                entry = P.append_object_field(entry, field, 'null')
        entry = P.patch_object_fields(entry, {k: P.format_js_literal(v) for k, v in fills.items()})
        out = P.parse_object_fields(entry)
        self.assertEqual(out['ht'].value, 76.0)
        self.assertEqual(out['st'].value, 'Orthodox')
        self.assertEqual(out['atd'].value, 0.5)
        self.assertEqual(out['wi'].raw, '0')
        self.assertEqual(list(out)[-1], 'atd')


class TakedownDefense(unittest.TestCase):
    def test_matches_the_sdef_construction(self):
        self.assertEqual(FP.td_defense(1, 4), 0.75)
        self.assertEqual(FP.td_defense(0, 3), 1.0)

    def test_no_attempts_is_unknown_not_perfect(self):
        self.assertIsNone(FP.td_defense(0, 0))


class Artifact(unittest.TestCase):
    def test_roster_only_and_deterministic(self):
        profiles, _ = FP.load_tott_profiles([SHAHBAZYAN, FRYE, row('Retired Guy')], {})
        a = FP.profiles_artifact(profiles, ['Leon Shahbazyan', 'Allen Frye Jr.', 'Not In Tott'])
        b = FP.profiles_artifact(profiles, ['Allen Frye Jr.', 'Leon Shahbazyan'])
        self.assertEqual(a, b)
        self.assertNotIn('Retired Guy', a)
        self.assertNotIn('Not In Tott', a)
        self.assertLess(a.index('Allen Frye Jr.'), a.index('Leon Shahbazyan'))


if __name__ == '__main__':
    unittest.main()
