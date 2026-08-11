#!/usr/bin/env python3
"""
test_update_rankings.py -- fail-closed tests for the rankings importer.

Run: python test_update_rankings.py   (stdlib unittest; bs4 only for the HTML
cases, which skip cleanly when it is absent)

Every test here asserts that a BAD source raises instead of writing a partial
or silently-wrong artifact. The generator validates before it writes, so a
raise must always leave committed files untouched.

Covered failure modes:
  * truncated / short Kaggle download
  * a division that suddenly loses most of its athletes (mass-partial scrape)
  * a backdated official snapshot (stale or cached UFC page)
  * UFC republishing different content under an existing snapshot date
  * malformed UFC HTML (missing root, missing footer, bad rank, short table)
  * out-of-domain rank values
  * history-cache corruption (bad schema, tombstone-first, non-monotonic dates)
"""
import importlib.util
import json
import shutil
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location(
    'update_rankings', ROOT / 'scripts' / 'update_rankings.py'
)
ur = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ur)

Error = ur.RankingsSourceError
FETCHED_AT = datetime(2026, 8, 5, 12, 0, tzinfo=timezone.utc)

try:
    import bs4  # noqa: F401
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False


def kaggle_rows(dates, divisions, per_division=16):
    """Synthesise well-formed Kaggle rows: champion plus numbered contenders."""
    rows = []
    for date in dates:
        for division in divisions:
            for index in range(per_division):
                rows.append({
                    'date': date,
                    'weightclass': division,
                    'fighter': f'{division} Athlete {index}',
                    'rank': str(index),
                })
    return rows


DIVS = ['Lightweight', 'Welterweight', 'Middleweight', 'Heavyweight']
DATES = ['2026-06-04', '2026-06-11', ur.HISTORY_CUTOFF]


class RankDomain(unittest.TestCase):
    def test_champion_and_contenders_accepted(self):
        for rank in [0, 1, 15]:
            self.assertEqual(ur.validated_rank(rank, 'test'), rank)

    def test_rank_16_rejected(self):
        with self.assertRaises(Error) as ctx:
            ur.validated_rank(16, 'Featherweight 2025-07-20')
        self.assertIn('outside the supported', str(ctx.exception))

    def test_negative_and_non_integer_rejected(self):
        with self.assertRaises(Error):
            ur.validated_rank(-1, 'test')
        with self.assertRaises(Error):
            ur.validated_rank('3', 'test')
        with self.assertRaises(Error):
            ur.validated_rank(True, 'test')

    def test_out_of_domain_kaggle_row_rejected(self):
        rows = kaggle_rows(DATES, DIVS)
        rows.append({
            'date': ur.HISTORY_CUTOFF, 'weightclass': 'Lightweight',
            'fighter': 'Overflow Guy', 'rank': '16',
        })
        with self.assertRaises(Error) as ctx:
            ur.kaggle_snapshots(rows, {}, [])
        self.assertIn('outside the supported', str(ctx.exception))

    def test_reviewed_quarantine_drops_only_the_listed_row(self):
        rows = kaggle_rows(DATES, DIVS)
        rows.append({
            'date': ur.HISTORY_CUTOFF, 'weightclass': 'Lightweight',
            'fighter': 'Overflow Guy', 'rank': '16',
        })
        quarantine = [{
            'date': ur.HISTORY_CUTOFF.replace('-', ''),
            'division': 'Lightweight', 'fighter': 'overflow guy', 'rank': 16,
            'reason': 'test',
        }]
        snapshots = ur.kaggle_snapshots(rows, {}, quarantine)
        self.assertNotIn(
            'overflow guy', snapshots[ur.HISTORY_CUTOFF]['Lightweight']
        )

    def test_stale_quarantine_entry_is_rejected(self):
        """A quarantine that no longer matches upstream must not rot silently."""
        quarantine = [{
            'date': '20200101', 'division': 'Lightweight',
            'fighter': 'ghost', 'rank': 16, 'reason': 'test',
        }]
        with self.assertRaises(Error) as ctx:
            ur.kaggle_snapshots(kaggle_rows(DATES, DIVS), {}, quarantine)
        self.assertIn('no longer match', str(ctx.exception))


class TruncatedKaggle(unittest.TestCase):
    def test_missing_cutoff_snapshot_rejected(self):
        rows = kaggle_rows(['2026-06-04', '2026-06-11'], DIVS)
        with self.assertRaises(Error) as ctx:
            ur.kaggle_snapshots(rows, {}, [])
        self.assertIn('required cutoff', str(ctx.exception))

    def test_non_numeric_rank_rejected(self):
        rows = kaggle_rows(DATES, DIVS)
        rows[0]['rank'] = 'C'
        with self.assertRaises(Error) as ctx:
            ur.kaggle_snapshots(rows, {}, [])
        self.assertIn('Non-numeric rank', str(ctx.exception))

    def test_conflicting_ranks_rejected(self):
        rows = kaggle_rows(DATES, DIVS)
        rows.append({
            'date': ur.HISTORY_CUTOFF, 'weightclass': 'Lightweight',
            'fighter': 'Lightweight Athlete 3', 'rank': '9',
        })
        with self.assertRaises(Error) as ctx:
            ur.kaggle_snapshots(rows, {}, [])
        self.assertIn('Conflicting', str(ctx.exception))


class DivisionCompleteness(unittest.TestCase):
    def keyed(self, rows):
        snaps = ur.kaggle_snapshots(rows, {}, [])
        return {int(d.replace('-', '')): v for d, v in snaps.items()}

    def test_full_snapshots_pass(self):
        ur.assert_snapshot_completeness(self.keyed(kaggle_rows(DATES, DIVS)))

    def test_division_losing_most_athletes_rejected(self):
        rows = [
            r for r in kaggle_rows(DATES, DIVS)
            if not (r['date'] == ur.HISTORY_CUTOFF
                    and r['weightclass'] == 'Lightweight'
                    and int(r['rank']) > 2)
        ]
        with self.assertRaises(Error) as ctx:
            ur.assert_snapshot_completeness(self.keyed(rows))
        self.assertIn('Lightweight', str(ctx.exception))

    def test_every_division_shrinking_at_once_rejected(self):
        rows = [
            r for r in kaggle_rows(DATES, DIVS)
            if not (r['date'] == ur.HISTORY_CUTOFF and int(r['rank']) > 13)
        ]
        with self.assertRaises(Error) as ctx:
            ur.assert_snapshot_completeness(self.keyed(rows))
        self.assertIn('truncated', str(ctx.exception))

    def test_small_legitimate_eras_are_not_rejected(self):
        """2013 divisions held 10-12 athletes; a retired division held 1."""
        rows = kaggle_rows(['2013-02-04', '2013-02-18'], ['Lightweight'], 11)
        rows += kaggle_rows(DATES, ['Lightweight'], 16)
        rows += [{
            'date': d, 'weightclass': "Women's Featherweight",
            'fighter': 'Lone Champion', 'rank': '0',
        } for d in ['2013-02-04', '2013-02-18', *DATES]]
        ur.assert_snapshot_completeness(self.keyed(rows))

    def test_normal_churn_of_two_athletes_allowed(self):
        rows = [
            r for r in kaggle_rows(DATES, DIVS)
            if not (r['date'] == ur.HISTORY_CUTOFF
                    and r['weightclass'] == 'Flyweight')
        ]
        rows = [
            r for r in rows
            if not (r['date'] == ur.HISTORY_CUTOFF
                    and r['weightclass'] == 'Heavyweight'
                    and int(r['rank']) > 13)
        ]
        ur.assert_snapshot_completeness(self.keyed(rows))


class SnapshotWriting(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.original = ur.SNAPSHOT_DIR
        ur.SNAPSHOT_DIR = self.tmp
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.addCleanup(setattr, ur, 'SNAPSHOT_DIR', self.original)

    def snapshot(self, updated_at, source='media', tweak=None):
        snap = {
            'schemaVersion': 1,
            'sourceSystem': source,
            'sourceUrl': ur.UFC_RANKINGS_URL,
            'sourceUpdatedAt': updated_at,
            'fetchedAt': '2026-08-05T12:00:00Z',
            'divisions': {'Lightweight': {
                'champions': [], 'contenders': [{'displayName': 'A', 'rank': 1}],
            }},
            'poundForPound': {},
        }
        if tweak:
            tweak(snap)
        return snap

    def test_new_snapshot_is_written(self):
        _, path, changed = ur.save_snapshot(self.snapshot('2026-08-04'))
        self.assertTrue(changed)
        self.assertTrue(path.exists())

    def test_identical_refetch_is_a_no_op(self):
        ur.save_snapshot(self.snapshot('2026-08-04'))
        snap = self.snapshot('2026-08-04')
        snap['fetchedAt'] = '2026-08-06T09:00:00Z'  # only volatile field moves
        _, _, changed = ur.save_snapshot(snap)
        self.assertFalse(changed)

    def test_backdated_snapshot_rejected(self):
        ur.save_snapshot(self.snapshot('2026-08-04'))
        with self.assertRaises(Error) as ctx:
            ur.save_snapshot(self.snapshot('2026-07-28'))
        self.assertIn('older than', str(ctx.exception))

    def test_changed_content_under_existing_date_rejected(self):
        ur.save_snapshot(self.snapshot('2026-08-04'))

        def rewrite(snap):
            snap['divisions']['Lightweight']['contenders'][0]['displayName'] = 'B'
        with self.assertRaises(Error) as ctx:
            ur.save_snapshot(self.snapshot('2026-08-04', tweak=rewrite))
        self.assertIn('Refusing to overwrite', str(ctx.exception))

    def test_backdating_is_per_source(self):
        """A new Meta snapshot must not be blocked by a newer media snapshot."""
        ur.save_snapshot(self.snapshot('2026-08-04', source='media'))
        _, _, changed = ur.save_snapshot(self.snapshot('2026-08-01', source='meta'))
        self.assertTrue(changed)


class HistoryCache(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.original = ur.HISTORY_CACHE_PATH
        ur.HISTORY_CACHE_PATH = self.tmp / 'cache.json'
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.addCleanup(setattr, ur, 'HISTORY_CACHE_PATH', self.original)

    def write(self, cache):
        ur.HISTORY_CACHE_PATH.write_text(json.dumps(cache), encoding='utf-8')

    def base(self, history):
        return {
            'schemaVersion': 1,
            'historyUsedThrough': ur.HISTORY_CUTOFF,
            'snapshotDates': ['20200101'],
            'source': {},
            'history': history,
        }

    def key(self, division, fighter):
        return ur.history_key(division, fighter)

    def test_valid_cache_loads(self):
        self.write(self.base({self.key('Lightweight', 'a'): [[20200101, 3]]}))
        self.assertIn('history', ur.load_history_cache())

    def test_missing_cache_rejected(self):
        with self.assertRaises(Error) as ctx:
            ur.load_history_cache()
        self.assertIn('Missing reviewed history cache', str(ctx.exception))

    def test_wrong_schema_rejected(self):
        cache = self.base({self.key('Lightweight', 'a'): [[20200101, 3]]})
        cache['schemaVersion'] = 99
        self.write(cache)
        with self.assertRaises(Error):
            ur.load_history_cache()

    def test_cutoff_mismatch_rejected(self):
        cache = self.base({self.key('Lightweight', 'a'): [[20200101, 3]]})
        cache['historyUsedThrough'] = '2025-01-01'
        self.write(cache)
        with self.assertRaises(Error) as ctx:
            ur.load_history_cache()
        self.assertIn('does not match the reviewed cutoff', str(ctx.exception))

    def test_series_opening_with_tombstone_rejected(self):
        self.write(self.base({self.key('Lightweight', 'a'): [[20200101, None]]}))
        with self.assertRaises(Error) as ctx:
            ur.load_history_cache()
        self.assertIn('opens with a tombstone', str(ctx.exception))

    def test_non_monotonic_series_rejected(self):
        self.write(self.base({
            self.key('Lightweight', 'a'): [[20200201, 3], [20200101, 4]],
        }))
        with self.assertRaises(Error) as ctx:
            ur.load_history_cache()
        self.assertIn('not strictly increasing', str(ctx.exception))

    def test_post_cutoff_date_rejected(self):
        self.write(self.base({self.key('Lightweight', 'a'): [[20260701, 3]]}))
        with self.assertRaises(Error) as ctx:
            ur.load_history_cache()
        self.assertIn('out-of-range date', str(ctx.exception))

    def test_unknown_division_rejected(self):
        self.write(self.base({self.key('Cruiserweight', 'a'): [[20200101, 3]]}))
        with self.assertRaises(Error) as ctx:
            ur.load_history_cache()
        self.assertIn('Unknown division', str(ctx.exception))

    def test_out_of_domain_rank_in_cache_rejected(self):
        self.write(self.base({self.key('Lightweight', 'a'): [[20200101, 16]]}))
        with self.assertRaises(Error):
            ur.load_history_cache()


class RetiredDivisions(unittest.TestCase):
    def test_retired_division_is_closed_out_after_its_last_change(self):
        cache = {
            'snapshotDates': ['20190101', '20190121', '20190201'],
            'history': {
                ur.history_key("Women's Featherweight", 'champ'): [[20190101, 0]],
                ur.history_key('Lightweight', 'a'): [[20190101, 1], [20190201, 2]],
            },
        }
        closeouts = ur.retired_division_closeouts(cache)
        self.assertEqual(closeouts, {"Women's Featherweight": 20190121})

    def test_active_divisions_are_never_closed_out(self):
        cache = {
            'snapshotDates': ['20190101', '20190121'],
            'history': {ur.history_key('Lightweight', 'a'): [[20190101, 1]]},
        }
        self.assertEqual(ur.retired_division_closeouts(cache), {})

    def test_retired_division_with_no_later_date_is_reported(self):
        cache = {
            'snapshotDates': ['20190101'],
            'history': {
                ur.history_key("Women's Featherweight", 'champ'): [[20190101, 0]],
            },
        }
        with self.assertRaises(Error) as ctx:
            ur.retired_division_closeouts(cache)
        self.assertIn('no later snapshot date', str(ctx.exception))


@unittest.skipUnless(HAS_BS4, 'beautifulsoup4 not installed')
class MalformedUfcHtml(unittest.TestCase):
    def page(self, rows=15, rank_text=None, footer=True, root=True,
             divisions=None, p4p=True):
        divisions = divisions or sorted(ur.ACTIVE_DIVISIONS)
        blocks = []
        for division in divisions:
            body = ''.join(
                '<tr>'
                f'<td class="views-field-weight-class-rank">{rank_text or i}</td>'
                f'<td class="views-field-title"><a href="/athlete/a{i}">A{i}</a></td>'
                '<td class="views-field-weight-class-rank-change"></td>'
                '</tr>'
                for i in range(1, rows + 1)
            )
            blocks.append(
                '<div class="view-grouping">'
                f'<div class="view-grouping-header">{division}</div>'
                '<table><caption><h5><a href="/athlete/champ">Champ</a></h5>'
                f'</caption><tbody>{body}</tbody></table></div>'
            )
        if p4p:
            body = ''.join(
                '<tr>'
                f'<td class="views-field-weight-class-rank">{i}</td>'
                f'<td class="views-field-title"><a href="/athlete/p{i}">P{i}</a></td>'
                '</tr>'
                for i in range(1, 16)
            )
            for label in ['Men&#039;s Pound-for-Pound', "Women's Pound-for-Pound"]:
                blocks.append(
                    '<div class="view-grouping">'
                    f'<div class="view-grouping-header">{label}</div>'
                    f'<table><tbody>{body}</tbody></table></div>'
                )
        root_open = (
            '<div class="block-views-blockathlete-rankings-block-1">'
            if root else '<div class="unrelated">'
        )
        foot = (
            '<p class="list-denotions__updated" data-rankings-footer="media">'
            'Updated Aug. 4</p>' if footer else ''
        )
        return f'<html><body>{root_open}{"".join(blocks)}</div>{foot}</body></html>'

    def test_well_formed_page_parses(self):
        snap = ur.parse_ufc_snapshot(self.page(), 'media', FETCHED_AT)
        self.assertEqual(snap['sourceUpdatedAt'], '2026-08-04')
        self.assertEqual(len(snap['divisions']), len(ur.ACTIVE_DIVISIONS))

    def test_missing_root_rejected(self):
        with self.assertRaises(Error) as ctx:
            ur.parse_ufc_snapshot(self.page(root=False), 'media', FETCHED_AT)
        self.assertIn('root not found', str(ctx.exception))

    def test_missing_footer_rejected(self):
        with self.assertRaises(Error) as ctx:
            ur.parse_ufc_snapshot(self.page(footer=False), 'media', FETCHED_AT)
        self.assertIn('footer not found', str(ctx.exception))

    def test_short_division_table_rejected(self):
        with self.assertRaises(Error) as ctx:
            ur.parse_ufc_snapshot(self.page(rows=9), 'media', FETCHED_AT)
        self.assertIn('contenders, found 9', str(ctx.exception))

    def test_non_numeric_rank_cell_rejected(self):
        with self.assertRaises(Error) as ctx:
            ur.parse_ufc_snapshot(self.page(rank_text='NR'), 'media', FETCHED_AT)
        self.assertIn('Invalid media rank', str(ctx.exception))

    def test_missing_division_rejected(self):
        divisions = sorted(ur.ACTIVE_DIVISIONS)[:-1]
        with self.assertRaises(Error) as ctx:
            ur.parse_ufc_snapshot(
                self.page(divisions=divisions), 'media', FETCHED_AT
            )
        self.assertIn('division mismatch', str(ctx.exception))

    def test_unexpected_division_rejected(self):
        divisions = sorted(ur.ACTIVE_DIVISIONS) + ['Cruiserweight']
        with self.assertRaises(Error) as ctx:
            ur.parse_ufc_snapshot(
                self.page(divisions=divisions), 'media', FETCHED_AT
            )
        self.assertIn('Unexpected current UFC division', str(ctx.exception))

    def test_media_without_p4p_rejected(self):
        with self.assertRaises(Error) as ctx:
            ur.parse_ufc_snapshot(self.page(p4p=False), 'media', FETCHED_AT)
        self.assertIn('P4P', str(ctx.exception))

    def test_future_dated_page_rejected(self):
        """A footer dated after the fetch cannot be a real publication date."""
        with self.assertRaises(Error) as ctx:
            ur.parse_update_date('Updated Sep. 1', FETCHED_AT)
        self.assertIn('in the future', str(ctx.exception))

    def test_year_rollover_reads_as_the_previous_year(self):
        """Fetched in January, a December footer belongs to the prior year."""
        january = datetime(2026, 1, 5, tzinfo=timezone.utc)
        self.assertEqual(ur.parse_update_date('Updated Dec. 30', january), '2025-12-30')

    def test_unparseable_update_date_rejected(self):
        with self.assertRaises(Error) as ctx:
            ur.parse_update_date('Updated recently', FETCHED_AT)
        self.assertIn('Cannot parse', str(ctx.exception))


class GeneratedArtifact(unittest.TestCase):
    """The committed artifact must satisfy the invariants the app relies on."""

    def test_committed_output_has_no_meta_p4p_export(self):
        text = (ROOT / 'src' / 'rankingsData.js').read_text(encoding='utf-8')
        self.assertNotIn('CURRENT_META_P4P', text)
        self.assertIn('CURRENT_MEDIA_P4P', text)

    def test_committed_cache_matches_the_reviewed_cutoff(self):
        cache = json.loads(
            (ROOT / 'data' / 'rankings'
             / 'kaggle-history-through-2026-06-18.json').read_text(encoding='utf-8')
        )
        self.assertEqual(cache['historyUsedThrough'], ur.HISTORY_CUTOFF)
        cutoff = int(ur.HISTORY_CUTOFF.replace('-', ''))
        for entries in cache['history'].values():
            for date_value, _ in entries:
                self.assertLessEqual(date_value, cutoff)


if __name__ == '__main__':
    unittest.main(verbosity=2)
