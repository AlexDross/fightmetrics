#!/usr/bin/env python3
"""record_source_snapshot.py pins the upstream feed and refuses a shrinking one.

NON-DESTRUCTIVE: every test works in a temporary directory and never touches
the committed source_snapshot.json. stdlib unittest -- no extra dependency.
"""

import json
import tempfile
import unittest
from pathlib import Path

import record_source_snapshot as rss

REVISION = 'a' * 40


def write_feed(directory, extra_stat_rows=0):
    directory = Path(directory)
    for name in rss.SNAPSHOT_FILES:
        (directory / name).write_text('EVENT,BOUT\nE,"A vs. B"\n', encoding='utf-8')
    with open(directory / 'ufc_fight_stats.csv', 'a', encoding='utf-8') as f:
        for i in range(extra_stat_rows):
            f.write(f'E,"multi\nline {i}"\n')


def run(directory, *extra):
    return rss.main([
        '--source-dir', str(directory), '--revision', REVISION,
        '--committed-at', '2026-10-04T18:06:20+00:00',
        '--out', str(Path(directory) / 'source_snapshot.json'), *extra,
    ])


class SourceSnapshot(unittest.TestCase):
    def test_records_revision_hashes_and_csv_records(self):
        with tempfile.TemporaryDirectory() as tmp:
            write_feed(tmp, extra_stat_rows=2)
            self.assertEqual(run(tmp), 0)
            snap = json.loads((Path(tmp) / 'source_snapshot.json').read_text())
            self.assertEqual(snap['revision'], REVISION)
            self.assertEqual(sorted(snap['files']), sorted(rss.SNAPSHOT_FILES))
            # Quoted multi-line fields are one record each, not two lines.
            self.assertEqual(snap['files']['ufc_fight_stats.csv']['records'], 3)
            self.assertEqual(snap['files']['ufc_fight_results.csv']['sha256'],
                             rss.sha256_of(Path(tmp) / 'ufc_fight_results.csv'))

    def test_unchanged_feed_rewrites_byte_identically(self):
        with tempfile.TemporaryDirectory() as tmp:
            write_feed(tmp)
            run(tmp)
            first = (Path(tmp) / 'source_snapshot.json').read_bytes()
            run(tmp)
            self.assertEqual((Path(tmp) / 'source_snapshot.json').read_bytes(), first)

    def test_shrinking_feed_fails_and_keeps_the_previous_snapshot(self):
        with tempfile.TemporaryDirectory() as tmp:
            write_feed(tmp, extra_stat_rows=3)
            run(tmp)
            before = (Path(tmp) / 'source_snapshot.json').read_bytes()
            write_feed(tmp, extra_stat_rows=1)
            self.assertEqual(run(tmp), 1)
            self.assertEqual((Path(tmp) / 'source_snapshot.json').read_bytes(), before)

    def test_reviewed_shrink_is_accepted_explicitly(self):
        with tempfile.TemporaryDirectory() as tmp:
            write_feed(tmp, extra_stat_rows=3)
            run(tmp)
            write_feed(tmp, extra_stat_rows=1)
            self.assertEqual(run(tmp, '--allow-shrink', 'upstream dedup reviewed'), 0)

    def test_missing_input_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            write_feed(tmp)
            (Path(tmp) / 'ufc_fighter_tott.csv').unlink()
            self.assertEqual(run(tmp), 1)
            self.assertFalse((Path(tmp) / 'source_snapshot.json').exists())

    def test_abbreviated_revision_is_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            write_feed(tmp)
            with self.assertRaises(rss.SnapshotError):
                rss.build_snapshot(tmp, 'abc1234', 'x')


if __name__ == '__main__':
    unittest.main(verbosity=2)
