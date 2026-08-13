#!/usr/bin/env python3
"""
test_correction5_full_run.py — the approved scope, at full-roster scale.

NON-DESTRUCTIVE. Reads two trees and writes nothing.

GATED, and skipped by default. These assertions compare the repository's
generated artifacts against a PRISTINE baseline tree, so they are meaningful
exactly once: for the correction-5 commit against origin/main @ 2dcdf8f. Every
later scheduled refresh legitimately moves both sides, which is why this suite
is not wired into the update-fighters workflow — test_correction5_identity.py
carries the invariants that must hold forever.

Run it like this:

    git worktree add /tmp/c5-base 2dcdf8f2298349d0b3a8584726465dc31bc82441
    CORRECTION5_BASELINE_TREE=/tmp/c5-base python3 test_correction5_full_run.py

Optional extras:

    CORRECTION5_EXPECT_HASHES=1     also pin the approved V2b artifact SHA-256s
    CORRECTION5_CARD_PROBE=1        also replay the ten UFC 330 matchup deltas
                                    (needs node and both trees)

Figures come from research/correction5_apostrophe_identity_dry_run.md.

stdlib unittest — no extra dependency.
"""

import hashlib
import json
import os
import re
import subprocess
import unittest
from pathlib import Path

import js_roster_parser as P

ROOT = Path(__file__).resolve().parent
BASELINE = os.environ.get('CORRECTION5_BASELINE_TREE')

# The approved scope, from the dry run's V2b variant.
EXPECTED_FIGHTERS_CHANGED = 9
EXPECTED_HISTORY_FIGHTERS_CHANGED = 265
EXPECTED_HISTORY_ENTRIES_CHANGED = 1908
EXPECTED_TRUNCATED_REPAIRS = 1849
EXPECTED_UNKNOWN_REPAIRS = 59
EXPECTED_FIGHTERS_SHA = '27b046d070869d7aba20117b971862623f67997956f18a77ad3ef0a283fdb134'
EXPECTED_HISTORY_SHA = 'f5dda9d4e6da411c0553cfc5e13184bee624faa16da1077717c58016c466be59'
BASELINE_FIGHTERS_SHA = '51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad'
BASELINE_HISTORY_SHA = '46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5'

TRUNCATED_DIVISION = 'Women' + chr(92)

# Percentage-point movement for fighter A on the ten saved UFC 330 matchups.
EXPECTED_CARD_DELTAS = {
    'Islam Makhachev vs Ian Machado Garry': (0.0, 0.0),
    'Mackenzie Dern vs Gillian Robertson': (0.0, 0.0),
    'Mansur Abdul-Malik vs Dustin Stoltzfus': (0.0, 0.0),
    'Edson Barboza vs Esteban Ribovics': (0.0, 0.0),
    'Chidi Njokuani vs Joel Alvarez': (0.0, 0.0),
    'Jalin Turner vs Kaue Fernandes': (0.00997, 0.16824),
    'Donte Johnson vs Eric McConico': (0.0, 0.0),
    'Vicente Luque vs Tresean Gore': (0.0, 0.0),
    'Neil Magny vs Ramiz Brahimaj': (0.0, 0.0),
    'Jeremiah Wells vs Myktybek Orolbai': (-0.00516, -0.00557),
}

# Baseline -> corrected, for all nine. From the approved per-fighter table.
EXPECTED_FIGHTER_DELTAS = {
    "Sean O'Malley": {'wi': (11, 12), 'ws': (1, 2), 'dcw': (4, 5), 'tr': (37, 41)},
    "Don'Tale Mayes": {'wi': (6, 4), 'ls': (2, 3), 'kow': (4, 2), 'tr': (35, 32)},
    "Casey O'Neill": {'wi': (5, 6), 'ws': (1, 2), 'kow': (2, 3), 'dcw': (1, 2), 'tr': (18, 19)},
    "Lone'er Kavanagh": {'lo': (1, 2), 'kow': (1, 0), 'dcw': (2, 3), 'tr': (9, 16)},
    "Da'Mon Blackshear": {'lo': (3, 4), 'ws': (3, 0), 'ls': (0, 1), 'tr': (19, 22)},
    "Brendan O'Reilly": {'lo': (2, 3), 'ls': (1, 2), 'tr': (7, 10), 'asl': (21.6667, 1.9)},
    "TJ O'Brien": {'lo': (1, 2), 'ls': (1, 2), 'tr': (2, 4), 'asl': (32, 3.77)},
    "Chuck O'Neil": {'lo': (0, 1), 'ls': (0, 1), 'tr': (0, 3)},
    "Tre'ston Vines": {'lo': (0, 1), 'ls': (0, 1), 'tr': (0, 1)},
}


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def load_roster(tree):
    content = (Path(tree) / 'src' / 'fightersData.js').read_text()
    return {e.name: {k: f.value for k, f in e.fields.items()}
            for e in P.parse_roster(content, '_D2').entries}


def load_history(tree):
    content = (Path(tree) / 'src' / 'fightHistory.js').read_text()
    return json.loads(re.search(r'=\s*(\{.*\});\s*$', content, re.S).group(1))


@unittest.skipUnless(BASELINE, 'set CORRECTION5_BASELINE_TREE to a pristine checkout')
class FullRunScope(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_roster = load_roster(BASELINE)
        cls.new_roster = load_roster(ROOT)
        cls.base_history = load_history(BASELINE)
        cls.new_history = load_history(ROOT)

    def test_baseline_tree_is_the_approved_one(self):
        self.assertEqual(sha256(Path(BASELINE) / 'src' / 'fightersData.js'),
                         BASELINE_FIGHTERS_SHA)
        self.assertEqual(sha256(Path(BASELINE) / 'src' / 'fightHistory.js'),
                         BASELINE_HISTORY_SHA)

    def test_exactly_nine_roster_entries_change(self):
        """15."""
        self.assertEqual(set(self.base_roster), set(self.new_roster))
        self.assertEqual(list(self.base_roster), list(self.new_roster))
        changed = sorted(n for n in self.base_roster
                         if self.base_roster[n] != self.new_roster[n])
        self.assertEqual(len(changed), EXPECTED_FIGHTERS_CHANGED, changed)
        self.assertEqual(changed, sorted(EXPECTED_FIGHTER_DELTAS))

    def test_each_fighter_delta_matches_the_approved_report(self):
        for name, deltas in EXPECTED_FIGHTER_DELTAS.items():
            for field, (before, after) in deltas.items():
                with self.subTest(fighter=name, field=field):
                    self.assertEqual(self.base_roster[name][field], before)
                    self.assertEqual(self.new_roster[name][field], after)

    def test_no_stored_title_bout_count_moves(self):
        """The 4 -> 0 regression guard, across the whole roster."""
        moved = {n: (self.base_roster[n]['tb'], self.new_roster[n]['tb'])
                 for n in self.base_roster
                 if self.base_roster[n].get('tb') != self.new_roster[n].get('tb')}
        self.assertEqual(moved, {})
        self.assertEqual(self.new_roster["Sean O'Malley"]['tb'], 4)

    def test_history_changes_265_fighters_and_1908_entries(self):
        """16."""
        changed_fighters = [n for n in self.base_history
                            if self.base_history[n] != self.new_history[n]]
        self.assertEqual(len(changed_fighters), EXPECTED_HISTORY_FIGHTERS_CHANGED)
        changed_entries = sum(
            1 for n in changed_fighters
            for a, b in zip(self.base_history[n], self.new_history[n]) if a != b)
        self.assertEqual(changed_entries, EXPECTED_HISTORY_ENTRIES_CHANGED)

    def test_wc_is_the_only_changed_history_field(self):
        """17."""
        fields = set()
        categories = {'truncated': 0, 'unknown': 0, 'other': 0}
        for name in self.base_history:
            for a, b in zip(self.base_history[name], self.new_history[name]):
                if a == b:
                    continue
                for key in set(a) | set(b):
                    if a.get(key) != b.get(key):
                        fields.add(key)
                if a['wc'] == TRUNCATED_DIVISION:
                    categories['truncated'] += 1
                elif a['wc'] == 'Unknown':
                    categories['unknown'] += 1
                else:
                    categories['other'] += 1
        self.assertEqual(fields, {'wc'})
        self.assertEqual(categories['truncated'], EXPECTED_TRUNCATED_REPAIRS)
        self.assertEqual(categories['unknown'], EXPECTED_UNKNOWN_REPAIRS)
        self.assertEqual(categories['other'], 0)

    def test_history_keys_and_bout_counts_are_unchanged(self):
        """18."""
        self.assertEqual(list(self.base_history), list(self.new_history))
        mismatched = {n for n in self.base_history
                      if len(self.base_history[n]) != len(self.new_history[n])}
        self.assertEqual(mismatched, set())

    def test_no_truncated_division_survives(self):
        """19."""
        before = sum(1 for n in self.base_history for e in self.base_history[n]
                     if e['wc'] == TRUNCATED_DIVISION)
        after = sum(1 for n in self.new_history for e in self.new_history[n]
                    if e['wc'] == TRUNCATED_DIVISION)
        self.assertEqual(before, EXPECTED_TRUNCATED_REPAIRS)
        self.assertEqual(after, 0)


@unittest.skipUnless(os.environ.get('CORRECTION5_EXPECT_HASHES'),
                     'set CORRECTION5_EXPECT_HASHES=1 to pin the approved artifacts')
class ApprovedArtifactHashes(unittest.TestCase):
    """21. Only reproducible against the recorded feed and date context."""

    def test_fighters_data_hash(self):
        self.assertEqual(sha256(ROOT / 'src' / 'fightersData.js'), EXPECTED_FIGHTERS_SHA)

    def test_fight_history_hash(self):
        self.assertEqual(sha256(ROOT / 'src' / 'fightHistory.js'), EXPECTED_HISTORY_SHA)


@unittest.skipUnless(BASELINE and os.environ.get('CORRECTION5_CARD_PROBE'),
                     'set CORRECTION5_CARD_PROBE=1 (with a baseline tree) to replay '
                     'the UFC 330 matchups')
class CardDeltas(unittest.TestCase):
    """20. Every saved UFC 330 matchup moves by the approved amount."""

    def test_ten_matchup_deltas(self):
        probe = ROOT / 'research' / 'correction5' / 'verify_card_delta.mjs'
        out = subprocess.run(
            ['node', str(probe), BASELINE, str(ROOT)],
            capture_output=True, text=True, check=True).stdout
        rows = json.loads(out)['rows']
        self.assertEqual(len(rows), len(EXPECTED_CARD_DELTAS))
        for row in rows:
            with self.subTest(matchup=row['matchup']):
                v1, v2 = EXPECTED_CARD_DELTAS[row['matchup']]
                self.assertAlmostEqual(row['v1DeltaPP'], v1, places=5)
                self.assertAlmostEqual(row['v2DeltaPP'], v2, places=5)


if __name__ == '__main__':
    unittest.main(verbosity=2)
