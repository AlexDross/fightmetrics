"""Tests for check_data_freshness.py. stdlib unittest, no network."""

import os
import tempfile
import unittest
import zipfile
from datetime import date

import check_data_freshness as F

TODAY = date(2026, 11, 18)
FRESH_EVENT = (date(2026, 11, 14), 'UFC 334: Gane vs. Hokit')


class Evaluate(unittest.TestCase):
    def test_fresh_data_passes(self):
        self.assertEqual(F.evaluate(TODAY, date(2026, 11, 15), FRESH_EVENT, date(2026, 11, 14)), [])

    def test_stale_snapshot_fails(self):
        problems = F.evaluate(TODAY, date(2026, 11, 1), FRESH_EVENT, None)
        self.assertEqual(len(problems), 1)
        self.assertIn('stopped refreshing', problems[0])

    def test_old_newest_card_fails(self):
        problems = F.evaluate(TODAY, date(2026, 11, 15), (date(2026, 10, 31), 'X'), None)
        self.assertEqual(len(problems), 1)
        self.assertIn('Newest completed card', problems[0])

    def test_holiday_override_widens_event_limit(self):
        self.assertEqual(
            F.evaluate(TODAY, date(2026, 11, 15), (date(2026, 10, 31), 'X'), None, max_event_age=30), [])

    def test_download_behind_shipped_history_fails(self):
        problems = F.evaluate(TODAY, date(2026, 11, 15), (date(2026, 11, 7), 'X'), date(2026, 11, 14))
        self.assertTrue(any('rolled back' in p for p in problems))

    def test_no_events_fails(self):
        self.assertTrue(F.evaluate(TODAY, None, None, None))


class Readers(unittest.TestCase):
    def test_latest_completed_event_ignores_events_without_results(self):
        events = [
            {'EVENT': 'A', 'DATE': 'November 07, 2026'},
            {'EVENT': 'B ', 'DATE': 'November 14, 2026'},
            {'EVENT': 'C', 'DATE': 'November 21, 2026'},  # no results yet
            {'EVENT': 'D', 'DATE': ''},
        ]
        results = [{'EVENT': 'A'}, {'EVENT': 'B'}, {'EVENT': 'D'}]
        self.assertEqual(F.latest_completed_event(events, results), (date(2026, 11, 14), 'B'))

    def test_archive_snapshot_date_is_newest_entry(self):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, 'main.zip')
            with zipfile.ZipFile(path, 'w') as z:
                z.writestr(zipfile.ZipInfo('r/a.csv', (2026, 11, 8, 18, 0, 0)), 'x')
                z.writestr(zipfile.ZipInfo('r/b.csv', (2026, 11, 15, 18, 0, 0)), 'y')
            self.assertEqual(F.archive_snapshot_date(path), date(2026, 11, 15))

    def test_latest_history_date(self):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, 'fh.js')
            with open(path, 'w') as f:
                f.write('export const FIGHT_HISTORY = {"A": [{"dt": "2026-11-14"}, {"dt": "2025-01-01"}]};\n')
            self.assertEqual(F.latest_history_date(path), date(2026, 11, 14))


if __name__ == '__main__':
    unittest.main()
