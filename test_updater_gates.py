#!/usr/bin/env python3
"""update_fighters.py end to end: every gate refuses through the real updater.

Each test copies the updater, its modules, the committed roster/history and a
small feed (tests/fixtures/updater_feed: the two most recent cards of the
pinned Greco revision) into a temporary directory, publishes a first
generation there with --bootstrap-ledger, then feeds the updater a corrupted
or changed next feed. A rejected feed must exit non-zero and leave every
published artifact byte-for-byte as it was; an accepted one must publish.

Publication failures are injected through artifact_publish._replace at every
replacement position, including a first run where the ledger and generation
record did not exist yet.

NON-DESTRUCTIVE: nothing in the repository is written. Needs pandas, like the
updater itself.
"""

import csv
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import feed_validation as fv

ROOT = Path(__file__).resolve().parent
FEED = ROOT / 'tests' / 'fixtures' / 'updater_feed'
TODAY = '2026-10-08'
REV_A = 'a' * 40
REV_B = 'b' * 40

COPY_FILES = [p.name for p in ROOT.glob('*.py') if not p.name.startswith('test_')] + [
    'name_aliases.json', 'feed_exceptions.json',
    'src/fightersData.js', 'src/prospectsData.js', 'src/fightHistory.js',
    'fighter_profiles.json',
]
PUBLISHED = ('src/fightersData.js', 'src/fightHistory.js', 'fighter_profiles.json',
             'source_ledger.json', 'artifact_generation.json')

# Fixture fights (ufcstats fight-details ids).
SILVA_WANG = '3f804eec9183e597'       # 5 rounds, W/L
FIGUEIREDO_TALBOTT = '514366f770553cc9'  # round 1 KO, L/W

INJECT = r'''
import os, runpy, sys
sys.path.insert(0, os.getcwd())
import artifact_publish
fail_at, calls = int(os.environ['FM_FAIL_AT']), [0]
def failing_replace(src, dst):
    calls[0] += 1
    if calls[0] == fail_at:
        raise OSError('injected replacement failure')
    os.replace(src, dst)
artifact_publish._replace = failing_replace
sys.argv = ['update_fighters.py'] + sys.argv[1:]
runpy.run_path('update_fighters.py', run_name='__main__')
'''


def read_csv(path):
    with open(path, newline='', encoding='utf-8') as f:
        rows = list(csv.reader(f))
    return rows[0], rows[1:]


def write_csv(path, header, rows):
    buf = io.StringIO()
    csv.writer(buf, lineterminator='\n').writerows([header] + rows)
    Path(path).write_text(buf.getvalue(), encoding='utf-8')


class Workspace:
    def __init__(self, path):
        self.path = Path(path)

    def csv(self, name):
        return read_csv(self.path / name)

    def edit(self, name, fn):
        header, rows = self.csv(name)
        write_csv(self.path / name, header, fn(header, rows))

    def pin(self, revision):
        subprocess.run([sys.executable, 'record_source_snapshot.py', '--revision', revision,
                        '--committed-at', '2026-10-04T18:06:20+00:00'],
                       cwd=self.path, check=True, capture_output=True)

    def run(self, *args, fail_at=None):
        env = dict(os.environ, FM_TODAY=TODAY)
        if fail_at is None:
            cmd = [sys.executable, 'update_fighters.py', *args]
        else:
            env['FM_FAIL_AT'] = str(fail_at)
            cmd = [sys.executable, '-c', INJECT, *args]
        return subprocess.run(cmd, cwd=self.path, env=env, capture_output=True, text=True)

    def published(self):
        return {rel: (self.path / rel).read_bytes() if (self.path / rel).exists() else None
                for rel in PUBLISHED}

    def leftovers(self):
        return sorted(str(p.relative_to(self.path)) for p in self.path.rglob('*')
                      if p.suffix in ('.staged', '.rollback'))

    def ledger(self):
        return json.loads((self.path / 'source_ledger.json').read_text())

    def corrections(self, corrections=(), bulk=()):
        (self.path / 'upstream_corrections.json').write_text(json.dumps(
            {'corrections': list(corrections), 'bulkStatReviews': list(bulk)}))


def set_cell(header, rows, fid, column, value):
    url_col, col = header.index('URL'), header.index(column)
    for row in rows:
        if row[url_col].rstrip('/').endswith(fid):
            row[col] = value
    return rows


class UpdaterGates(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        template = Path(cls._tmp.name) / 'template'
        for rel in COPY_FILES:
            (template / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / rel, template / rel)
        for src in FEED.glob('*.csv'):
            shutil.copy2(src, template / src.name)
        ws = Workspace(template)
        ws.corrections()
        ws.pin(REV_A)
        first = ws.run('--bootstrap-ledger')
        assert first.returncode == 0, first.stdout + first.stderr
        cls.template = template
        cls.counter = 0

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def workspace(self):
        type(self).counter += 1
        path = Path(self._tmp.name) / f'ws{self.counter}'
        shutil.copytree(self.template, path)
        return Workspace(path)

    # ── helpers ──────────────────────────────────────────────────────────────
    def assertRefused(self, ws, needle, *args, pin=REV_B):
        if pin:
            ws.pin(pin)
        before = ws.published()
        result = ws.run(*args)
        output = result.stdout + result.stderr
        self.assertNotEqual(result.returncode, 0, output[-2000:])
        self.assertIn(needle, output)
        self.assertEqual(ws.published(), before, 'a refused feed changed published artifacts')
        self.assertEqual(ws.leftovers(), [])
        return output

    def assertAccepted(self, ws, *args):
        ws.pin(REV_B)
        result = ws.run(*args)
        output = result.stdout + result.stderr
        self.assertEqual(result.returncode, 0, output[-3000:])
        self.assertEqual(ws.leftovers(), [])
        generation = json.loads((ws.path / 'artifact_generation.json').read_text())
        self.assertEqual(generation['sourceRevision'], REV_B)
        self.assertEqual(ws.ledger()['revision'], REV_B)
        return output

    def outcome_change(self, ws):
        ws.edit('ufc_fight_results.csv',
                lambda h, r: set_cell(h, r, FIGUEIREDO_TALBOTT, 'OUTCOME', 'W/L'))
        old = self.protected(ws, FIGUEIREDO_TALBOTT)
        return old, dict(old, outcome='W/L')

    @staticmethod
    def protected(ws, fid):
        ledger = ws.ledger()
        columns = ledger['columns'][:len(fv.PROTECTED_COLUMNS)]
        assert tuple(columns) == fv.PROTECTED_COLUMNS
        return dict(zip(columns, ledger['fights'][fid]))

    @staticmethod
    def modified(fid, old, new, revision=REV_B):
        return {'fightId': fid, 'change': 'modified', 'upstreamRevision': revision,
                'old': old, 'new': new}

    def aliases(self, ws, extra):
        path = ws.path / 'name_aliases.json'
        path.write_text(json.dumps({**json.loads(path.read_text()), **extra}, indent=2))

    def exceptions(self, ws, category, fids, span=('2026-01-01', '2026-12-31')):
        path = ws.path / 'feed_exceptions.json'
        data = json.loads(path.read_text())
        data['exceptions'][category] = {'reason': 'test', 'dateRange': list(span), 'fightIds': fids}
        path.write_text(json.dumps(data))

    # ── refusals ─────────────────────────────────────────────────────────────
    def test_duplicate_stat_row(self):
        ws = self.workspace()
        ws.edit('ufc_fight_stats.csv', lambda h, r: r + [list(r[0])])
        self.assertRefused(ws, 'duplicate')

    def test_impossible_clock(self):
        ws = self.workspace()
        ws.edit('ufc_fight_results.csv',
                lambda h, r: set_cell(h, r, FIGUEIREDO_TALBOTT, 'TIME', '3:99'))
        self.assertRefused(ws, '3:99')

    def test_undated_event_without_stats(self):
        ws = self.workspace()

        def add(h, rows):
            ghost = list(rows[0])
            ghost[h.index('EVENT')] = 'UFC Fight Night: Nobody vs. Nowhere'
            ghost[h.index('BOUT')] = 'Nobody One vs. Nobody Two'
            ghost[h.index('URL')] = 'http://ufcstats.com/fight-details/0123456789abcdef'
            return rows + [ghost]
        ws.edit('ufc_fight_results.csv', add)
        output = self.assertRefused(ws, '0123456789abcdef')
        self.assertIn('undated', output)

    def test_landed_more_than_attempted(self):
        ws = self.workspace()

        def corrupt(h, rows):
            rows[0][h.index('SIG.STR.')] = '999 of 1'
            return rows
        ws.edit('ufc_fight_stats.csv', corrupt)
        self.assertRefused(ws, '999 of 1')

    def test_disappearing_fight_while_the_row_count_grows(self):
        ws = self.workspace()
        header, rows = ws.csv('ufc_fight_results.csv')
        url, bout = header.index('URL'), header.index('BOUT')
        gone = next(r for r in rows if r[url].endswith(FIGUEIREDO_TALBOTT))
        kept = [r for r in rows if r is not gone]
        new_fights = []
        for i, (a, b) in enumerate([('New Fighter A', 'New Fighter B'),
                                    ('New Fighter C', 'New Fighter D')]):
            row = list(gone)
            row[bout] = f'{a} vs. {b}'
            row[url] = f'http://ufcstats.com/fight-details/feedfacecafe000{i}'
            new_fights.append((row, a, b))
        write_csv(ws.path / 'ufc_fight_results.csv', header, kept + [r for r, _, _ in new_fights])
        self.assertGreater(len(kept) + 2, len(rows))

        s_header, s_rows = ws.csv('ufc_fight_stats.csv')
        sb, sf = s_header.index('BOUT'), s_header.index('FIGHTER')
        template = [r for r in s_rows if r[sb] == gone[bout]]
        s_rows = [r for r in s_rows if r[sb] != gone[bout]]
        for row, a, b in new_fights:
            for t in template:
                n = list(t)
                n[sb] = row[bout]
                n[sf] = a if t[sf] == template[0][sf] else b
                s_rows.append(n)
        write_csv(ws.path / 'ufc_fight_stats.csv', s_header, s_rows)
        self.assertRefused(ws, f'fight removed without a reviewed correction: {FIGUEIREDO_TALBOTT}')

    def test_unreviewed_outcome_change(self):
        ws = self.workspace()
        self.outcome_change(ws)
        self.assertRefused(ws, 'protected fields changed without a reviewed correction')

    def test_correction_bound_to_another_revision(self):
        ws = self.workspace()
        old, new = self.outcome_change(ws)
        ws.corrections([{'fightId': FIGUEIREDO_TALBOTT, 'change': 'modified',
                         'upstreamRevision': REV_A, 'old': old, 'new': new}])
        self.assertRefused(ws, 'protected fields changed without a reviewed correction')

    def test_correction_describing_different_content(self):
        ws = self.workspace()
        old, new = self.outcome_change(ws)
        ws.corrections([{'fightId': FIGUEIREDO_TALBOTT, 'change': 'modified',
                         'upstreamRevision': REV_B, 'old': old, 'new': dict(new, outcome='D/D')}])
        self.assertRefused(ws, 'does not match the actual change')

    def test_allowlisted_fight_does_not_authorise_a_further_change(self):
        ws = self.workspace()
        old, new = self.outcome_change(ws)
        ws.corrections([{'fightId': FIGUEIREDO_TALBOTT, 'change': 'modified',
                         'upstreamRevision': REV_B, 'old': old, 'new': new}])
        # Same fight, now also moved to another card (another event and date).
        other = 'UFC Fight Night: Rosas Jr. vs. Barcelos'
        ws.edit('ufc_fight_results.csv',
                lambda h, r: set_cell(h, r, FIGUEIREDO_TALBOTT, 'EVENT', other))

        def move_stats(h, rows):
            for row in rows:
                if row[h.index('BOUT')] == 'Deiveson Figueiredo vs. Payton Talbott':
                    row[h.index('EVENT')] = other
            return rows
        ws.edit('ufc_fight_stats.csv', move_stats)
        output = self.assertRefused(ws, 'does not match the actual change')
        self.assertIn(f'protected fields changed without a reviewed correction: {FIGUEIREDO_TALBOTT}', output)

    def test_bulk_statistic_changes_need_an_exact_review(self):
        ws = self.workspace()
        changed = self.bump_every_fight(ws)
        self.assertGreater(len(changed), 25)
        self.assertRefused(ws, 'bulk review listing exactly these ids')
        ws.corrections(bulk=[{'upstreamRevision': REV_B, 'fightIds': sorted(changed)[:-1]}])
        self.assertRefused(ws, 'bulk review listing exactly these ids')

    def test_missing_ledger_without_bootstrap(self):
        ws = self.workspace()
        (ws.path / 'source_ledger.json').unlink()
        self.assertRefused(ws, 'source_ledger.json is missing')

    def test_inputs_not_matching_the_pinned_snapshot(self):
        ws = self.workspace()
        ws.pin(REV_B)
        ws.edit('ufc_fight_results.csv',
                lambda h, r: set_cell(h, r, SILVA_WANG, 'REFEREE', 'Someone Else'))
        self.assertRefused(ws, 'is not the input pinned', pin=None)

    # ── Codex finding 1: effective fighter identity ─────────────────────────
    def test_alias_reassigning_a_fighter_needs_review(self):
        ws = self.workspace()
        self.aliases(ws, {'Deiveson Figueiredo': 'Audit Replacement'})
        output = self.assertRefused(ws, 'protected fields changed without a reviewed correction')
        self.assertIn("'Audit Replacement vs. Payton Talbott'", output)

    def test_approved_alias_rename_is_published(self):
        ws = self.workspace()
        old = self.protected(ws, FIGUEIREDO_TALBOTT)
        self.aliases(ws, {'Deiveson Figueiredo': 'Deiveson Alcantara Figueiredo'})
        ws.corrections([self.modified(FIGUEIREDO_TALBOTT, old, dict(
            old, fighters='Deiveson Alcantara Figueiredo vs. Payton Talbott'))])
        self.assertAccepted(ws)
        self.assertEqual(ws.ledger()['fights'][FIGUEIREDO_TALBOTT][3],
                         'Deiveson Alcantara Figueiredo vs. Payton Talbott')
        history = (ws.path / 'src/fightHistory.js').read_text()
        self.assertIn('Deiveson Alcantara Figueiredo', history)

    def test_alias_collapsing_both_corners_is_refused(self):
        ws = self.workspace()
        self.aliases(ws, {'Payton Talbott': 'Deiveson Figueiredo'})
        self.assertRefused(ws, 'same fighter on both sides')

    def test_alias_merging_two_fighters_across_fights_needs_review(self):
        ws = self.workspace()
        self.aliases(ws, {'Payton Talbott': 'Natalia Silva'})   # two people, one identity
        output = self.assertRefused(ws, 'protected fields changed without a reviewed correction')
        self.assertIn(FIGUEIREDO_TALBOTT, output)

    # ── Codex finding 2: repeatable corrections, independent reporting ──────
    def test_approved_correction_reruns_at_the_same_revision(self):
        ws = self.workspace()
        old, new = self.outcome_change(ws)
        ws.corrections([self.modified(FIGUEIREDO_TALBOTT, old, new)])
        self.assertAccepted(ws)
        first = ws.published()
        output = self.assertAccepted(ws)
        self.assertIn(f'correction already applied at this revision (rerun): {FIGUEIREDO_TALBOTT}',
                      output)
        self.assertEqual(ws.published(), first)

    def test_approved_removal_reruns_at_the_same_revision(self):
        ws = self.workspace()
        old = self.protected(ws, FIGUEIREDO_TALBOTT)
        bout = 'Deiveson Figueiredo vs. Payton Talbott'
        ws.edit('ufc_fight_results.csv',
                lambda h, r: [x for x in r if not x[h.index('URL')].endswith(FIGUEIREDO_TALBOTT)])
        ws.edit('ufc_fight_details.csv',
                lambda h, r: [x for x in r if not x[h.index('URL')].endswith(FIGUEIREDO_TALBOTT)])
        ws.edit('ufc_fight_stats.csv', lambda h, r: [x for x in r if x[h.index('BOUT')] != bout])
        ws.corrections([{'fightId': FIGUEIREDO_TALBOTT, 'change': 'removed',
                         'upstreamRevision': REV_B, 'old': old, 'new': None}])
        self.assertAccepted(ws)
        self.assertNotIn(FIGUEIREDO_TALBOTT, ws.ledger()['fights'])
        first = ws.published()
        self.assertAccepted(ws)
        self.assertEqual(ws.published(), first)

    def test_simultaneous_outcome_and_statistic_change_reports_both(self):
        ws = self.workspace()
        old, new = self.outcome_change(ws)
        self.bump_every_fight(ws, only={FIGUEIREDO_TALBOTT})
        ws.corrections([self.modified(FIGUEIREDO_TALBOTT, old, new)])
        output = self.assertAccepted(ws)
        self.assertIn(f'reviewed correction applied: {FIGUEIREDO_TALBOTT}', output)
        self.assertIn(f'statistics changed upstream: {FIGUEIREDO_TALBOTT}', output)

    # ── Codex finding 3: exceptions cover only the documented condition ─────
    def test_stats_unavailable_does_not_excuse_real_rows(self):
        ws = self.workspace()
        self.exceptions(ws, 'statsUnavailable', [FIGUEIREDO_TALBOTT])

        def corrupt(h, rows):
            for row in rows:
                if row[h.index('BOUT')] == 'Deiveson Figueiredo vs. Payton Talbott':
                    row[h.index('SIG.STR.')] = '999 of 1'
                    break
            return rows
        ws.edit('ufc_fight_stats.csv', corrupt)
        self.assertRefused(ws, "'999 of 1' lands more than attempted")

    def test_control_time_exception_does_not_excuse_a_malformed_clock(self):
        ws = self.workspace()
        self.exceptions(ws, 'controlTimeUnavailable', [FIGUEIREDO_TALBOTT])

        def corrupt(h, rows):
            for row in rows:
                if row[h.index('BOUT')] == 'Deiveson Figueiredo vs. Payton Talbott':
                    row[h.index('CTRL')] = '3:99'
                    break
            return rows
        ws.edit('ufc_fight_stats.csv', corrupt)
        self.assertRefused(ws, "CTRL='3:99'")

    # ── Codex finding 4: no consumed column outside the ledger ──────────────
    def test_unreviewed_details_column_is_refused(self):
        ws = self.workspace()

        def add_weightclass(h, rows):
            h.append('WEIGHTCLASS')
            for row in rows:
                row.append('Heavyweight Title Bout' if row[h.index('URL')].endswith(FIGUEIREDO_TALBOTT)
                           else '')
            return rows
        ws.edit('ufc_fight_details.csv', add_weightclass)
        self.assertRefused(ws, "ufc_fight_details.csv: header ['EVENT', 'BOUT', 'URL', 'WEIGHTCLASS']")

    def test_reordered_results_columns_are_refused(self):
        ws = self.workspace()
        header, rows = ws.csv('ufc_fight_results.csv')
        order = list(reversed(range(len(header))))
        write_csv(ws.path / 'ufc_fight_results.csv', [header[i] for i in order],
                  [[r[i] for i in order] for r in rows])
        self.assertRefused(ws, 'same columns, different order')

    # ── Codex finding 7: scheduled format ───────────────────────────────────
    def test_ending_round_after_the_scheduled_format(self):
        ws = self.workspace()
        ws.edit('ufc_fight_results.csv',
                lambda h, r: set_cell(h, r, SILVA_WANG, 'TIME FORMAT', '3 Rnd (5-5-5)'))
        self.assertRefused(ws, 'round after the scheduled format')

    # ── accepted changes ─────────────────────────────────────────────────────
    def test_unchanged_feed_at_a_new_revision_republishes_identical_data(self):
        ws = self.workspace()
        before = ws.published()
        self.assertAccepted(ws)
        after = ws.published()
        for rel in ('src/fightersData.js', 'src/fightHistory.js', 'fighter_profiles.json'):
            self.assertEqual(after[rel], before[rel], rel)
        self.assertEqual(after['source_ledger.json'].replace(REV_B.encode(), REV_A.encode()),
                         before['source_ledger.json'])

    def test_reviewed_outcome_correction_is_published(self):
        ws = self.workspace()
        old, new = self.outcome_change(ws)
        ws.corrections([{'fightId': FIGUEIREDO_TALBOTT, 'change': 'modified',
                         'upstreamRevision': REV_B, 'old': old, 'new': new}])
        before = ws.published()
        self.assertAccepted(ws)
        self.assertEqual(self.protected(ws, FIGUEIREDO_TALBOTT)['outcome'], 'W/L')
        self.assertNotEqual(ws.published()['src/fightersData.js'], before['src/fightersData.js'])

    def test_small_statistic_correction_is_reported_and_published(self):
        ws = self.workspace()
        self.assertEqual(self.bump_every_fight(ws, only={SILVA_WANG}), {SILVA_WANG})
        output = self.assertAccepted(ws)
        self.assertIn(f'statistics changed upstream: {SILVA_WANG}', output)

    def test_bulk_statistic_changes_with_an_exact_review(self):
        ws = self.workspace()
        changed = self.bump_every_fight(ws)
        ws.corrections(bulk=[{'upstreamRevision': REV_B, 'fightIds': sorted(changed)}])
        self.assertAccepted(ws)

    # ── publication failures through the updater ─────────────────────────────
    def test_replacement_failure_at_every_position_keeps_the_previous_generation(self):
        for position in range(1, len(PUBLISHED) + 1):
            with self.subTest(position=position):
                ws = self.workspace()
                old, new = self.outcome_change(ws)
                ws.corrections([{'fightId': FIGUEIREDO_TALBOTT, 'change': 'modified',
                                 'upstreamRevision': REV_B, 'old': old, 'new': new}])
                ws.pin(REV_B)
                before = ws.published()
                result = ws.run(fail_at=position)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('previous artifacts restored', result.stderr)
                self.assertEqual(ws.published(), before)
                self.assertEqual(ws.leftovers(), [])

    def test_first_run_failure_removes_artifacts_that_did_not_exist(self):
        for position in range(1, len(PUBLISHED) + 1):
            with self.subTest(position=position):
                ws = self.workspace()
                (ws.path / 'source_ledger.json').unlink()
                (ws.path / 'artifact_generation.json').unlink()
                before = ws.published()
                result = ws.run('--bootstrap-ledger', fail_at=position)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(ws.published(), before)
                self.assertIsNone(ws.published()['source_ledger.json'])
                self.assertEqual(ws.leftovers(), [])

    # ── stat edits ───────────────────────────────────────────────────────────
    def bump_every_fight(self, ws, only=None):
        """KD +1 on the first stat row of each fight (or of the fights in ``only``).

        Stays a valid count, so the only effect is a changed statistics hash.
        Returns the ids of the fights whose statistics changed.
        """
        r_header, r_rows = ws.csv('ufc_fight_results.csv')
        bout_to_fid = {r[r_header.index('BOUT')]: r[r_header.index('URL')].rstrip('/').rsplit('/', 1)[1]
                       for r in r_rows}
        header, rows = ws.csv('ufc_fight_stats.csv')
        b, kd = header.index('BOUT'), header.index('KD')
        changed = set()
        for row in rows:
            fid = bout_to_fid[row[b]]
            if fid not in changed and (only is None or fid in only):
                changed.add(fid)
                row[kd] = str(int(float(row[kd])) + 1)
        write_csv(ws.path / 'ufc_fight_stats.csv', header, rows)
        return changed

if __name__ == '__main__':
    unittest.main(verbosity=2)
