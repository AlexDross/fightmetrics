"""Correction 6A — fightHistory[].wc / [].tb invariants and regressions.

Historical division and title status are bout-local facts read from the raw
WEIGHTCLASS on each ufc_fight_results.csv row. These tests hold the generated
artifact to that contract: no roster-division fallback, no event-name heuristic,
no status welded into the division string, and both corners of a bout always
carrying identical metadata.
"""

import collections
import csv
import hashlib
import json
import os
import subprocess
import unittest

import pandas as pd

from fight_weightclass import SUPPORTED_DIVISIONS, parse_weightclass

HERE = os.path.dirname(os.path.abspath(__file__))
FH_PATH = os.path.join(HERE, 'src', 'fightHistory.js')
RESULTS_CSV = os.path.join(HERE, 'ufc_fight_results.csv')
BASE_SHA = '1adfd22fe3b09b84ddd994a7057d4cc9c0275276'
# The ratified before/after totals are properties of ONE pinned feed. On a newer
# feed the same correction produces different (equally valid) counts, so those
# assertions run only when the feed is byte-identical to the reviewed snapshot.
PINNED_RESULTS_SHA256 = (
    '7f8f3b5245851397006a1da7b2f042322b3bf9456c94d849d7d47fdc57a71f7d')


def results_sha256():
    with open(RESULTS_CSV, 'rb') as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def load_history(text):
    body = text[text.index('=') + 1:].rstrip().rstrip(';')
    return json.loads(body)


def load_current():
    with open(FH_PATH, encoding='utf-8') as handle:
        return load_history(handle.read())


def load_base():
    """origin/main's fightHistory.js, or None when the blob is unavailable."""
    try:
        out = subprocess.run(['git', 'show', f'{BASE_SHA}:src/fightHistory.js'],
                             cwd=HERE, capture_output=True, text=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    return load_history(out.stdout)


def bout_key(fighter, entry):
    """Identity of a single BOUT, stable across its two corners.

    `re` is normalised because it is corner-relative (W on one side, L on the
    other) while NC is shared. Method and time stay in the key: Kazushi
    Sakuraba met Marcus Silveira TWICE at UFC Ultimate Japan (bracket opener,
    overturned to a No Contest, then the final), and those are two distinct
    bouts that must not collapse.
    """
    return (entry['dt'], entry['ev'], tuple(sorted([fighter, entry['op']])),
            entry['me'], entry['ti'], 'NC' if entry['re'] == 'NC' else 'DECIDED')


def pair_key(fighter, entry):
    """Coarser key used only for counting AFFECTED bouts."""
    return (entry['dt'], entry['ev'], tuple(sorted([fighter, entry['op']])))


class Shape(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.history = load_current()

    def test_ratified_row_and_fighter_counts(self):
        self.assertEqual(len(self.history), 2737)
        self.assertEqual(sum(len(v) for v in self.history.values()), 17644)

    def test_every_division_is_supported_and_never_unknown(self):
        seen = collections.Counter()
        for entries in self.history.values():
            for entry in entries:
                seen[entry['wc']] += 1
        self.assertEqual(seen['Unknown'], 0, 'Unknown must not survive 6A')
        for division in seen:
            self.assertIn(division, SUPPORTED_DIVISIONS, f'unsupported wc {division!r}')

    def test_division_string_never_carries_status(self):
        # The old code appended ' Title' and produced values like 'Unknown Title'.
        for entries in self.history.values():
            for entry in entries:
                lowered = entry['wc'].lower()
                for banned in ('title', 'interim', 'bout'):
                    self.assertNotIn(banned, lowered)

    def test_tb_is_strictly_boolean(self):
        for entries in self.history.values():
            for entry in entries:
                self.assertIsInstance(entry['tb'], bool)

    def test_reviewed_open_weight_corner_count(self):
        # D2: 15 canonical pre-weight-class bouts -> 30 corners.
        reviewed = {
            'UFC 2 Tournament Title Bout', 'UFC 3 Tournament Title Bout',
            'UFC 4 Tournament Title Bout', 'UFC 5 Tournament Title Bout',
            'UFC 6 Tournament Title Bout', 'UFC 7 Tournament Title Bout',
            'UFC 8 Tournament Title Bout', 'UFC 10 Tournament Title Bout',
            "Ultimate Ultimate '95 Tournament Title Bout",
            "Ultimate Ultimate '96 Tournament Title Bout",
            'UFC Superfight Championship Bout',
        }
        frame = pd.read_csv(RESULTS_CSV)
        labels = frame['WEIGHTCLASS'].fillna('').astype(str).str.strip()
        self.assertEqual(int(labels.isin(reviewed).sum()) * 2, 30)


class BothCornersAgree(unittest.TestCase):
    """The invariant main violated on 2,861 of 8,822 bouts."""

    @classmethod
    def setUpClass(cls):
        cls.history = load_current()

    def test_zero_asymmetric_bouts(self):
        grouped = collections.defaultdict(set)
        for fighter, entries in self.history.items():
            for entry in entries:
                grouped[bout_key(fighter, entry)].add((entry['wc'], entry['tb']))
        asymmetric = {k: v for k, v in grouped.items() if len(v) > 1}
        self.assertEqual(asymmetric, {}, f'{len(asymmetric)} asymmetric bouts')

    def test_both_corners_present_for_every_bout(self):
        counts = collections.Counter()
        for fighter, entries in self.history.items():
            for entry in entries:
                counts[bout_key(fighter, entry)] += 1
        self.assertEqual(len(counts), 8822)
        self.assertEqual({n for n in counts.values()}, {2})


class NoHeuristics(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.history = load_current()

    def test_no_event_name_title_heuristic(self):
        # 'UFC 18: The Road to the Heavyweight Title' has 7 bouts / 14 corners.
        # The old rule flagged all 14; only Miletich-Patino is a real title bout.
        event = 'UFC 18: The Road to the Heavyweight Title'
        rows = [(f, e) for f, entries in self.history.items()
                for e in entries if e['ev'] == event]
        self.assertEqual(len(rows), 14)
        titled = [(f, e) for f, e in rows if e['tb']]
        self.assertEqual(len(titled), 2, 'only the genuine championship remains')
        self.assertEqual({f for f, _ in titled}, {'Pat Miletich', 'Jorge Patino'})
        for fighter, entry in rows:
            if fighter not in ('Pat Miletich', 'Jorge Patino'):
                self.assertFalse(entry['tb'], f'{fighter}: event-name false positive')

    def test_title_status_is_not_sticky(self):
        # A championship must not leak forward onto later non-title bouts.
        for name in ('Islam Makhachev', 'Alexander Volkanovski', "Sean O'Malley"):
            entries = self.history[name]
            self.assertTrue(any(e['tb'] for e in entries), f'{name} has no title bout')
            self.assertTrue(any(not e['tb'] for e in entries),
                            f'{name}: every bout flagged as a title bout')

    def test_division_is_bout_local_not_roster_wide(self):
        # A fighter who moved divisions must show more than one division.
        for name in ('Islam Makhachev', 'Max Holloway', 'Rafael Dos Anjos'):
            divisions = {e['wc'] for e in self.history[name]}
            self.assertGreater(len(divisions), 1,
                               f'{name}: single division implies a roster fallback')

    def test_every_row_matches_a_parse_of_its_source_label(self):
        frame = pd.read_csv(RESULTS_CSV)
        expected = collections.defaultdict(set)
        for _, row in frame.iterrows():
            bout = str(row.get('BOUT', ''))
            if ' vs. ' not in bout:
                continue
            parsed = parse_weightclass(row['WEIGHTCLASS'])
            key = (str(row['EVENT']).strip(), bout.strip())
            expected[key].add((parsed['division'], parsed['championship']))
        checked = 0
        for fighter, entries in self.history.items():
            for entry in entries:
                bout = f"{fighter} vs. {entry['op']}"
                for key in ((entry['ev'], bout), (entry['ev'], f"{entry['op']} vs. {fighter}")):
                    if key in expected:
                        self.assertIn((entry['wc'], entry['tb']), expected[key])
                        checked += 1
                        break
        self.assertGreater(checked, 17000)


class RatifiedRegressions(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.history = load_current()

    def _find(self, fighter, opponent, date):
        for entry in self.history[fighter]:
            if entry['op'] == opponent and entry['dt'] == date:
                return entry
        self.fail(f'no bout {fighter} vs {opponent} on {date}')

    def test_luque_gastelum_ufc_327_is_middleweight_on_both_corners(self):
        luque = self._find('Vicente Luque', 'Kelvin Gastelum', '2026-04-11')
        gastelum = self._find('Kelvin Gastelum', 'Vicente Luque', '2026-04-11')
        self.assertEqual(luque['wc'], 'Middleweight')
        self.assertEqual(gastelum['wc'], 'Middleweight')
        self.assertFalse(luque['tb'])
        self.assertFalse(gastelum['tb'])

    def test_gamrot_dos_anjos_ufc_299_agrees_on_one_division(self):
        gamrot = self._find('Mateusz Gamrot', 'Rafael Dos Anjos', '2024-03-09')
        rda = self._find('Rafael Dos Anjos', 'Mateusz Gamrot', '2024-03-09')
        self.assertEqual(gamrot['wc'], rda['wc'])
        self.assertEqual(gamrot['tb'], rda['tb'])

    def test_omalley_championship_bouts(self):
        titled = [e for e in self.history["Sean O'Malley"] if e['tb']]
        self.assertEqual(len(titled), 4)
        for entry in titled:
            self.assertEqual(entry['wc'], 'Bantamweight')

    def test_championship_followed_by_a_later_non_title_bout(self):
        entries = sorted(self.history['Vicente Luque'], key=lambda e: e['dt'])
        self.assertTrue(all(not e['tb'] for e in entries))
        # A multi-time champion who later fought non-title bouts: title status
        # must attach to the BOUT, never persist forward onto the fighter.
        for name in ('Anderson Silva', 'Jose Aldo', 'Georges St-Pierre'):
            entries = sorted(self.history[name], key=lambda e: e['dt'])
            first_title = next(i for i, e in enumerate(entries) if e['tb'])
            later = entries[first_title + 1:]
            self.assertTrue(any(not e['tb'] for e in later),
                            f'{name}: no later non-title bout after a championship')

    def test_sakuraba_silveira_two_distinct_bouts_survive(self):
        rows = [e for e in self.history['Kazushi Sakuraba'] if e['op'] == 'Marcus Silveira']
        self.assertEqual(len(rows), 2)
        self.assertEqual({e['wc'] for e in rows}, {'Heavyweight'})
        self.assertEqual({e['re'] for e in rows}, {'W', 'NC'})


class DeltaAgainstBase(unittest.TestCase):
    """Ratified before/after totals, when the base blob is reachable."""

    @classmethod
    def setUpClass(cls):
        cls.base = load_base()
        cls.current = load_current()

    def setUp(self):
        if self.base is None:
            self.skipTest(f'base blob {BASE_SHA[:12]} unavailable')
        if results_sha256() != PINNED_RESULTS_SHA256:
            self.skipTest('ufc_fight_results.csv is not the pinned snapshot; '
                          'ratified before/after totals apply only to it')

    def test_ratified_transition_counts(self):
        wc_changed = tb_changed = both = 0
        unknown_before = 0
        tb_true_false = tb_false_true = 0
        fighters, bouts, transitions = set(), set(), collections.Counter()
        for name, before_entries in self.base.items():
            after_entries = self.current[name]
            self.assertEqual(len(before_entries), len(after_entries), name)
            for before, after in zip(before_entries, after_entries):
                if before['wc'] == 'Unknown':
                    unknown_before += 1
                wc_moved = before['wc'] != after['wc']
                tb_moved = before['tb'] != after['tb']
                if wc_moved:
                    wc_changed += 1
                    transitions[(before['wc'], after['wc'])] += 1
                if tb_moved:
                    tb_changed += 1
                    if before['tb']:
                        tb_true_false += 1
                    else:
                        tb_false_true += 1
                if wc_moved and tb_moved:
                    both += 1
                if wc_moved or tb_moved:
                    fighters.add(name)
                    bouts.add(pair_key(name, after))
        self.assertEqual(wc_changed, 4508)
        self.assertEqual(tb_changed, 804)
        self.assertEqual(both, 287)
        self.assertEqual(len(fighters), 1433)
        self.assertEqual(len(bouts), 3686)
        self.assertEqual(len(transitions), 68)
        self.assertEqual(unknown_before, 1483)
        self.assertEqual(tb_true_false, 12)
        self.assertEqual(tb_false_true, 792)

    def test_base_had_2861_asymmetric_bouts_and_current_has_none(self):
        def asymmetric(history):
            grouped = collections.defaultdict(set)
            for fighter, entries in history.items():
                for entry in entries:
                    grouped[bout_key(fighter, entry)].add((entry['wc'], entry['tb']))
            return sum(1 for v in grouped.values() if len(v) > 1)
        self.assertEqual(asymmetric(self.base), 2861)
        self.assertEqual(asymmetric(self.current), 0)

    def test_championship_corner_count(self):
        before = sum(1 for e in self.base.values() for x in e if x['tb'])
        after = sum(1 for e in self.current.values() for x in e if x['tb'])
        self.assertEqual(before, 14)
        self.assertEqual(after, 794)


if __name__ == '__main__':
    unittest.main(verbosity=2)
