"""Tests for name_splits.py -- distinct fighters who share one ufcstats name."""

import json
import os
import tempfile
import unittest

import pandas as pd

from name_splits import (
    NameSplitError, apply_name_splits, load_name_splits, require_all_matched,
    split_bout_label,
)

MW = 'Bruno Silva (Middleweight)'


def write_splits(data):
    fd, path = tempfile.mkstemp(suffix='.json')
    with os.fdopen(fd, 'w') as f:
        json.dump(data, f)
    return path


SPLITS = {'splits': [{'name': 'Bruno Silva', 'as': MW, 'bouts': [
    {'event': 'UFC 294: Makhachev vs. Volkanovski 2', 'opponent': 'Shara Magomedov'},
    {'event': 'UFC 315: Muhammad vs. Della Maddalena', 'opponent': 'Marc-Andre Barriault'},
]}]}


class NameSplitTests(unittest.TestCase):
    def setUp(self):
        self.path = write_splits(SPLITS)
        self.index = load_name_splits(self.path)

    def tearDown(self):
        os.unlink(self.path)

    def test_rewrites_either_corner(self):
        label, hit = split_bout_label(
            'UFC 294: Makhachev vs. Volkanovski 2 ', 'Shara Magomedov vs. Bruno Silva', self.index)
        self.assertEqual(label, f'Shara Magomedov vs. {MW}')
        self.assertEqual(hit, ('Bruno Silva', MW))
        label, _ = split_bout_label(
            'UFC 315: Muhammad vs. Della Maddalena', 'Bruno Silva vs. Marc-Andre Barriault', self.index)
        self.assertEqual(label, f'{MW} vs. Marc-Andre Barriault')

    def test_other_bouts_of_the_same_name_untouched(self):
        label, hit = split_bout_label(
            'UFC 316: Dvalishvili vs. O\'Malley 2', 'Bruno Silva vs. Joshua Van', self.index)
        self.assertEqual(label, 'Bruno Silva vs. Joshua Van')
        self.assertIsNone(hit)

    def test_frames_and_fighter_column(self):
        results = pd.DataFrame({
            'EVENT': ['UFC 294: Makhachev vs. Volkanovski 2', 'UFC 316: X'],
            'BOUT': ['Shara Magomedov vs. Bruno Silva', 'Bruno Silva vs. Joshua Van'],
        })
        stats = pd.DataFrame({
            'EVENT': ['UFC 294: Makhachev vs. Volkanovski 2'] * 2 + ['UFC 316: X'],
            'BOUT': ['Shara Magomedov vs. Bruno Silva'] * 2 + ['Bruno Silva vs. Joshua Van'],
            'FIGHTER': ['Shara Magomedov', 'Bruno Silva', 'Bruno Silva'],
        })
        hits = apply_name_splits(results, self.index)
        apply_name_splits(stats, self.index, fighter_column='FIGHTER')
        self.assertEqual(len(hits), 1)
        self.assertEqual(results['BOUT'].tolist(),
                         [f'Shara Magomedov vs. {MW}', 'Bruno Silva vs. Joshua Van'])
        self.assertEqual(stats['FIGHTER'].tolist(), ['Shara Magomedov', MW, 'Bruno Silva'])

    def test_unmatched_split_fails_loudly(self):
        results = pd.DataFrame({
            'EVENT': ['UFC 294: Makhachev vs. Volkanovski 2'],
            'BOUT': ['Shara Magomedov vs. Bruno Silva'],
        })
        hits = apply_name_splits(results, self.index)
        with self.assertRaises(NameSplitError):
            require_all_matched(self.index, hits, 'results')

    def test_duplicate_bout_rejected(self):
        bad = {'splits': [{'name': 'A', 'as': 'A (2)', 'bouts': [
            {'event': 'E', 'opponent': 'B'}, {'event': 'E', 'opponent': 'B'}]}]}
        path = write_splits(bad)
        try:
            with self.assertRaises(NameSplitError):
                load_name_splits(path)
        finally:
            os.unlink(path)

    def test_committed_file_loads(self):
        index = load_name_splits()
        self.assertTrue(any(new == MW for _, new in index.values()))


if __name__ == '__main__':
    unittest.main()
