#!/usr/bin/env python3
"""feed_validation: every rejection rule, the reviewed exceptions, and the
upstream-correction policy, on small synthetic feeds.

Updater-level proof (same cases through update_fighters.py, artifacts left
untouched) is in test_updater_gates.py. stdlib unittest + pandas.
"""

import copy
import json
import tempfile
import unittest
from pathlib import Path

import pandas as pd

import feed_validation as fv

TODAY = '2026-10-08'
ID1, ID2, ID3 = 'aaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbb', 'cccccccccccccccc'


def url(fid):
    return f'http://ufcstats.com/fight-details/{fid}'


def stat_row(event, bout, rnd, fighter, **over):
    row = {
        'EVENT': event, 'BOUT': bout, 'ROUND': f'Round {rnd}', 'FIGHTER': fighter,
        'KD': '0.0', 'SIG.STR.': '10 of 20', 'SIG.STR. %': '50%', 'TOTAL STR.': '12 of 24',
        'TD': '1 of 2', 'TD %': '50%', 'SUB.ATT': '0.0', 'REV.': '0.0', 'CTRL': '1:00',
        'HEAD': '6 of 14', 'BODY': '2 of 3', 'LEG': '2 of 3',
        'DISTANCE': '7 of 15', 'CLINCH': '2 of 3', 'GROUND': '1 of 2',
    }
    row.update(over)
    return row


def fight(fid=ID1, event='UFC 1000', bout='Ann A vs. Bea B', date='2026-10-03',
          rounds=3, time='3:10', outcome='W/L'):
    return {'EVENT': event, 'BOUT': bout, 'OUTCOME': outcome, 'WEIGHTCLASS': 'Flyweight Bout',
            'METHOD': 'KO/TKO', 'ROUND': str(rounds), 'TIME': time,
            'TIME FORMAT': '3 Rnd (5-5-5)', 'URL': url(fid), 'DATE': date}


def stats_for(f, skip=(), over=None):
    over = over or {}
    a, b = f['BOUT'].split(' vs. ')
    return [stat_row(f['EVENT'], f['BOUT'], r, name, **over.get((name, r), {}))
            for r in range(1, int(f['ROUND']) + 1) for name in (a, b)
            if (name, r) not in skip]


def frames(fights, stats):
    return pd.DataFrame(fights), pd.DataFrame(stats)


def validate(results, stats, exceptions=None):
    return fv.validate_completed_feed(results, stats, TODAY,
                                      exceptions=exceptions or fv.no_exceptions())


class FeedRejections(unittest.TestCase):
    def assertRejected(self, results, stats, needle, exceptions=None):
        with self.assertRaises(fv.FeedIntegrityError) as caught:
            validate(results, stats, exceptions)
        self.assertIn(needle, str(caught.exception))

    def test_complete_feed_passes(self):
        f = fight()
        self.assertEqual(validate(*frames([f], stats_for(f)))['fights'], 1)

    # ── the four cases Codex found the first validator accepted ──
    def test_duplicate_fighter_round_row(self):
        f = fight()
        self.assertRejected(*frames([f], stats_for(f) + [stat_row(f['EVENT'], f['BOUT'], 1, 'Ann A')]),
                            'duplicate stat rows')

    def test_clock_with_impossible_seconds(self):
        f = fight(time='3:99')
        self.assertRejected(*frames([f], stats_for(f)), 'invalid round duration')

    def test_undated_bout_with_missing_stats(self):
        f = fight(date=None)
        self.assertRejected(*frames([f], []), 'undated event')

    def test_statistic_landing_more_than_attempted(self):
        f = fight()
        self.assertRejected(*frames([f], stats_for(f, over={('Ann A', 2): {'SIG.STR.': '999 of 1'}})),
                            'lands more than attempted')

    # ── the rest of revision 2's rules ──
    def test_clock_formats(self):
        for clock in ('0:00', '5:01', '5', '3:5', '--', ''):
            with self.subTest(clock=clock):
                f = fight(time=clock)
                self.assertRejected(*frames([f], stats_for(f)), 'invalid round duration')

    def test_pre_ufc21_rounds_may_exceed_five_minutes(self):
        f = fight(date='1996-05-17', rounds=1, time='12:00')
        validate(*frames([f], stats_for(f)))

    def test_long_round_after_ufc21_is_rejected(self):
        f = fight(date='1999-07-16', rounds=1, time='5:30')
        self.assertRejected(*frames([f], stats_for(f)), 'invalid round duration')

    def test_future_result(self):
        f = fight(date='2026-10-10')
        self.assertRejected(*frames([f], stats_for(f)), 'future completed result')

    def test_result_dated_today_is_accepted(self):
        f = fight(date=TODAY)
        validate(*frames([f], stats_for(f)))

    def test_unknown_outcome(self):
        f = fight(outcome='X/Y')
        self.assertRejected(*frames([f], stats_for(f)), 'unknown outcome')

    def test_round_out_of_range(self):
        f = fight()
        f['ROUND'] = '6'
        self.assertRejected(*frames([f], []), 'invalid round')

    def test_missing_fight_identity(self):
        f = fight()
        f['URL'] = 'http://ufcstats.com/event-details/zzz'
        self.assertRejected(*frames([f], stats_for(f)), 'missing fight identity')

    def test_duplicate_fight_identity(self):
        f, g = fight(), fight(event='UFC 1001')
        self.assertRejected(*frames([f, g], stats_for(f) + stats_for(g)), 'duplicate fight identity')

    def test_ambiguous_label_for_two_fights(self):
        f, g = fight(ID1), fight(ID2)
        self.assertRejected(*frames([f, g], stats_for(f)), 'ambiguous bout label')

    def test_missing_fighter_and_missing_round(self):
        f = fight()
        self.assertRejected(*frames([f], stats_for(f, skip={('Bea B', r) for r in (1, 2, 3)})),
                            'missing round stats')
        self.assertRejected(*frames([f], stats_for(f, skip={('Ann A', 2)})), 'incomplete round stats')

    def test_extra_round_and_stranger(self):
        f = fight(rounds=2)
        extra = [stat_row(f['EVENT'], f['BOUT'], 3, 'Ann A')]
        self.assertRejected(*frames([f], stats_for(f) + extra), 'incomplete round stats')
        stranger = [stat_row(f['EVENT'], f['BOUT'], 1, 'Cat C')]
        self.assertRejected(*frames([f], stats_for(f) + stranger), 'not in the bout')

    def test_malformed_and_inconsistent_statistics(self):
        f = fight()
        cases = {
            ('Ann A', 1): ({'TD': 'one of two'}, 'invalid statistic'),
            ('Ann A', 2): ({'KD': '-1'}, 'invalid statistic'),
            ('Bea B', 1): ({'HEAD': '7 of 14'}, 'HEAD+BODY+LEG'),
            ('Bea B', 2): ({'GROUND': '2 of 2'}, 'DISTANCE+CLINCH+GROUND'),
            ('Bea B', 3): ({'TOTAL STR.': '9 of 24'}, 'exceeds TOTAL STR.'),
        }
        for key, (override, needle) in cases.items():
            with self.subTest(key=key):
                self.assertRejected(*frames([f], stats_for(f, over={key: override})), needle)

    def test_control_time(self):
        f = fight(rounds=2, time='2:00')
        self.assertRejected(*frames([f], stats_for(f, over={('Ann A', 1): {'CTRL': '--'}})),
                            'invalid control time')
        self.assertRejected(*frames([f], stats_for(f, over={('Ann A', 2): {'CTRL': '2:30'}})),
                            'exceeds the 120s round')
        self.assertRejected(*frames([f], stats_for(f, over={('Ann A', 1): {'CTRL': '5:01'}})),
                            'exceeds the 300s round')

    def test_orphan_stats(self):
        f, ghost = fight(), fight(fid=ID2, bout='Cat C vs. Dee D')
        self.assertRejected(*frames([f], stats_for(f) + stats_for(ghost)),
                            'round stats without a result')

    def test_problems_are_reported_together(self):
        f = fight(date='2026-10-10', time='3:99')
        with self.assertRaises(fv.FeedIntegrityError) as caught:
            validate(*frames([f], stats_for(f, skip={('Ann A', 1)})))
        self.assertIn('3 problem(s)', str(caught.exception))

    def test_audit_mode_returns_instead_of_raising(self):
        f = fight(time='3:99')
        out = fv.validate_completed_feed(*frames([f], stats_for(f)), TODAY,
                                         exceptions=fv.no_exceptions(), raise_errors=False)
        self.assertEqual([(k, fid) for k, fid, _ in out['problems']],
                         [('invalid round duration', ID1)])


class ReviewedExceptions(unittest.TestCase):
    def exceptions(self, category, fids, span=('1994-01-01', '1999-12-31')):
        out = fv.no_exceptions()
        out[category] = {fid: span for fid in fids}
        return out

    def test_stats_unavailable_is_fight_scoped(self):
        f = fight(ID1, date='1996-05-17', rounds=1, time='2:00')
        g = fight(ID2, bout='Cat C vs. Dee D', date='1996-05-17', rounds=1, time='2:00')
        ex = self.exceptions('statsUnavailable', [ID1])
        validate(*frames([f], []), ex)
        with self.assertRaises(fv.FeedIntegrityError):
            validate(*frames([f, g], []), ex)  # g is not listed

    def test_exception_waives_only_its_own_check(self):
        f = fight(ID1, date='1996-05-17', rounds=1, time='2:00')
        ex = self.exceptions('controlTimeUnavailable', [ID1])
        validate(*frames([f], stats_for(f, over={('Ann A', 1): {'CTRL': '--'}})), ex)
        with self.assertRaises(fv.FeedIntegrityError) as caught:
            validate(*frames([f], stats_for(f, over={('Ann A', 1): {'CTRL': '--', 'TD': '5 of 1'}})), ex)
        self.assertIn('lands more than attempted', str(caught.exception))

    def test_exception_outside_reviewed_dates_is_refused(self):
        f = fight(ID1, date='2026-10-03')
        ex = self.exceptions('statsUnavailable', [ID1])
        with self.assertRaises(fv.FeedIntegrityError) as caught:
            validate(*frames([f], []), ex)
        self.assertIn('outside its reviewed range', str(caught.exception))

    def test_same_card_rematch_needs_both_ids_listed(self):
        f = fight(ID1, date='1997-12-21', rounds=1, time='3:00')
        g = fight(ID2, date='1997-12-21', rounds=1, time='3:00')
        rows = stats_for(f) + stats_for(g)
        both = self.exceptions('sameCardRematch', [ID1, ID2])
        both['duplicateStatRows'] = {ID1: ('1994-01-01', '1999-12-31'), ID2: ('1994-01-01', '1999-12-31')}
        validate(*frames([f, g], rows), both)
        one = copy.deepcopy(both)
        del one['sameCardRematch'][ID2]
        with self.assertRaises(fv.FeedIntegrityError):
            validate(*frames([f, g], rows), one)

    def test_committed_exceptions_file_loads_and_is_pre_2000(self):
        ex = fv.load_exceptions(Path(__file__).parent / 'feed_exceptions.json')
        self.assertEqual({c: len(v) for c, v in ex.items()},
                         {'statsUnavailable': 21, 'duplicateStatRows': 2,
                          'controlTimeUnavailable': 181, 'sameCardRematch': 2})
        for category, ids in ex.items():
            for span in ids.values():
                self.assertLess(span[1], '2000-01-01', category)

    def test_exceptions_require_a_date_range(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'ex.json'
            path.write_text(json.dumps({'exceptions': {'statsUnavailable': {'fightIds': [ID1]}}}))
            with self.assertRaises(fv.FeedIntegrityError):
                fv.load_exceptions(path)


class LedgerTransitions(unittest.TestCase):
    REV = 'f' * 40

    def ledgers(self):
        a, b = fight(ID1), fight(ID2, bout='Cat C vs. Dee D', event='UFC 999', date='2026-09-01')
        prev = fv.build_ledger(*frames([a, b], stats_for(a) + stats_for(b)))
        return a, b, prev

    def check(self, prev, cur, corrections=(), bulk=()):
        return fv.check_ledger_transition(prev, cur, self.REV, list(corrections), list(bulk))

    def correction(self, prev, cur, fid, change):
        return {'upstreamRevision': self.REV, 'fightId': fid, 'change': change,
                'old': dict(zip(fv.PROTECTED_COLUMNS, prev[fid][:4])),
                'new': dict(zip(fv.PROTECTED_COLUMNS, cur[fid][:4])) if change == 'modified' else None,
                'reason': 'test', 'reviewedBy': 'test', 'reviewedAt': '2026-10-08'}

    def test_unchanged_feed(self):
        a, b, prev = self.ledgers()
        report = self.check(prev, copy.deepcopy(prev))
        self.assertEqual((report['added'], report['removed'], report['statChanges']), (0, [], []))

    def test_disappearing_fight_fails_even_when_count_grows(self):
        a, b, prev = self.ledgers()
        c, d = fight(ID3, event='UFC 1001'), fight('dddddddddddddddd', event='UFC 1002')
        cur = fv.build_ledger(*frames([a, c, d], stats_for(a) + stats_for(c) + stats_for(d)))
        self.assertGreater(len(cur), len(prev))
        with self.assertRaises(fv.FeedIntegrityError) as caught:
            self.check(prev, cur)
        self.assertIn('fight removed without a reviewed correction', str(caught.exception))

    def test_reviewed_removal_is_accepted_once_and_only_for_its_revision(self):
        a, b, prev = self.ledgers()
        cur = fv.build_ledger(*frames([a], stats_for(a)))
        fix = self.correction(prev, cur, ID2, 'removed')
        self.assertEqual(self.check(prev, cur, [fix])['removed'], [ID2])
        wrong_rev = dict(fix, upstreamRevision='e' * 40)
        with self.assertRaises(fv.FeedIntegrityError):
            self.check(prev, cur, [wrong_rev])

    def test_protected_changes_need_exact_old_and_new(self):
        for field, value in (('OUTCOME', 'L/W'), ('DATE', '2026-10-02'),
                             ('EVENT', 'UFC 1000b'), ('BOUT', 'Ann A vs. Bee B')):
            with self.subTest(field=field):
                a, b, prev = self.ledgers()
                changed = dict(a, **{field: value})
                rows = stats_for(changed) + stats_for(b)
                cur = fv.build_ledger(*frames([changed, b], rows))
                with self.assertRaises(fv.FeedIntegrityError) as caught:
                    self.check(prev, cur)
                self.assertIn('protected fields changed', str(caught.exception))
                fix = self.correction(prev, cur, ID1, 'modified')
                self.check(prev, cur, [fix])
                stale = copy.deepcopy(fix)
                stale['new']['outcome'] = 'D/D'
                with self.assertRaises(fv.FeedIntegrityError):
                    self.check(prev, cur, [stale])

    def test_correction_that_matches_nothing_fails(self):
        a, b, prev = self.ledgers()
        bogus = {'upstreamRevision': self.REV, 'fightId': ID1, 'change': 'removed',
                 'old': dict(zip(fv.PROTECTED_COLUMNS, prev[ID1][:4])), 'new': None}
        with self.assertRaises(fv.FeedIntegrityError) as caught:
            self.check(prev, copy.deepcopy(prev), [bogus])
        self.assertIn('does not match the actual change', str(caught.exception))

    def test_stat_corrections_are_reported_not_blocked(self):
        a, b, prev = self.ledgers()
        rows = stats_for(a, over={('Ann A', 1): {'KD': '1.0'}}) + stats_for(b)
        cur = fv.build_ledger(*frames([a, b], rows))
        self.assertEqual(self.check(prev, cur)['statChanges'], [ID1])

    def test_detail_hash_covers_method_round_time_format_weightclass(self):
        a, b, prev = self.ledgers()
        for field, value in (('METHOD', 'Submission'), ('TIME', '3:11'),
                             ('TIME FORMAT', '5 Rnd'), ('WEIGHTCLASS', 'Bantamweight Bout')):
            with self.subTest(field=field):
                cur = fv.build_ledger(*frames([dict(a, **{field: value}), b], stats_for(a) + stats_for(b)))
                self.assertEqual(self.check(prev, cur)['statChanges'], [ID1])

    def test_bulk_alarm_requires_an_exact_bulk_review(self):
        fights = [fight(f'{i:016x}', event=f'E{i}') for i in range(fv.BULK_STAT_CHANGE_ALARM + 1)]
        prev = fv.build_ledger(*frames(fights, [r for f in fights for r in stats_for(f)]))
        bumped = [r for f in fights for r in stats_for(f, over={('Ann A', 1): {'KD': '1.0'}})]
        cur = fv.build_ledger(*frames(fights, bumped))
        with self.assertRaises(fv.FeedIntegrityError) as caught:
            self.check(prev, cur)
        self.assertIn('bulk review', str(caught.exception))
        ids = sorted(cur)
        self.check(prev, cur, bulk=[{'upstreamRevision': self.REV, 'fightIds': ids}])
        with self.assertRaises(fv.FeedIntegrityError):
            self.check(prev, cur, bulk=[{'upstreamRevision': self.REV, 'fightIds': ids[:-1]}])

    def test_ledger_serialization_round_trips_and_is_stable(self):
        a, b, prev = self.ledgers()
        text = fv.serialize_ledger(self.REV, prev)
        self.assertEqual(json.loads(text)['fights'], prev)
        self.assertEqual(fv.serialize_ledger(self.REV, json.loads(text)['fights']), text)


if __name__ == '__main__':
    unittest.main(verbosity=1)
