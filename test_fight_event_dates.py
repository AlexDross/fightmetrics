#!/usr/bin/env python3
"""
test_fight_event_dates.py — binding tests for undated-event handling.

Run: python test_fight_event_dates.py   (stdlib unittest; no extra dependency)

These exist because the Update Fighters workflow died with

    TypeError: '<' not supported between instances of 'float' and 'str'

when Greco's feed grew events that have no row in ufc_event_details.csv. Every
test below fails against the pre-fix code.
"""
import unittest
from datetime import date

from fight_event_dates import (
    canonicalize_undated_events, fight_sort_key, is_dated, normalize_date,
)

NAN = float('nan')

# The real shape of the failure: two undated events that are the Noche UFC cards
# under a second name, plus one genuinely unknown card.
LOPES = frozenset({'Diego Lopes vs. Jean Silva', 'Joel Alvarez vs. Drakkar Klose'})
GRASSO = frozenset({'Alexa Grasso vs. Valentina Shevchenko', 'Raul Rosas Jr. vs. Vince Morales'})
ROAD = frozenset({'Someone A vs. Someone B', 'Someone C vs. Someone D'})

BOUTS_BY_EVENT = {
    'Noche UFC: Lopes vs. Silva': LOPES,
    'UFC Fight Night: Lopes vs. Silva': LOPES,
    'Noche UFC: Grasso vs. Shevchenko 2': GRASSO,
    'UFC Fight Night: Grasso vs. Shevchenko 2': GRASSO,
    'UFC - Road to UFC 4.6': ROAD,
}
EVENT_DATES = {
    'Noche UFC: Lopes vs. Silva': '2025-09-13',
    'Noche UFC: Grasso vs. Shevchenko 2': '2024-09-14',
    # the three undated ones are absent / None on purpose
    'UFC Fight Night: Lopes vs. Silva': None,
}


class TestAliasCanonicalization(unittest.TestCase):
    """The two alias cards must not duplicate fight histories."""

    def test_alias_cards_resolve_to_their_dated_originals(self):
        alias, unresolved = canonicalize_undated_events(BOUTS_BY_EVENT, EVENT_DATES)
        self.assertEqual(alias, {
            'UFC Fight Night: Lopes vs. Silva': 'Noche UFC: Lopes vs. Silva',
            'UFC Fight Night: Grasso vs. Shevchenko 2': 'Noche UFC: Grasso vs. Shevchenko 2',
        })
        self.assertEqual(unresolved, ['UFC - Road to UFC 4.6'])

    def test_dropping_aliases_counts_each_fight_exactly_once(self):
        """The regression that matters: 25 fights counted twice."""
        alias, _ = canonicalize_undated_events(BOUTS_BY_EVENT, EVENT_DATES)
        rows = [(ev, bout) for ev, bouts in BOUTS_BY_EVENT.items() for bout in bouts]
        kept = [r for r in rows if r[0] not in alias]
        # Every bout of the aliased cards survives exactly once, via the dated event.
        for bout in LOPES | GRASSO:
            self.assertEqual(
                sum(1 for _, b in kept if b == bout), 1,
                f'{bout!r} should appear exactly once after canonicalisation',
            )

    def test_a_partial_bout_overlap_is_never_canonicalized(self):
        """Only EXACT set equality is safe; a subset must stay undated."""
        bouts = dict(BOUTS_BY_EVENT)
        bouts['UFC Fight Night: Lopes vs. Silva'] = frozenset(list(LOPES)[:1])  # subset
        alias, unresolved = canonicalize_undated_events(bouts, EVENT_DATES)
        self.assertNotIn('UFC Fight Night: Lopes vs. Silva', alias)
        self.assertIn('UFC Fight Night: Lopes vs. Silva', unresolved)

    def test_an_ambiguous_match_is_never_canonicalized(self):
        """Two dated events sharing a bout set is a guess, not a resolution."""
        bouts = dict(BOUTS_BY_EVENT); bouts['Another Dated Card'] = LOPES
        dates = dict(EVENT_DATES); dates['Another Dated Card'] = '2025-01-01'
        alias, unresolved = canonicalize_undated_events(bouts, dates)
        self.assertNotIn('UFC Fight Night: Lopes vs. Silva', alias)
        self.assertIn('UFC Fight Night: Lopes vs. Silva', unresolved)


class TestUniqueUndatedEventSurvives(unittest.TestCase):
    """A unique undated event must not crash — and must not be invented a date."""

    def test_road_to_ufc_stays_undated_and_is_reported(self):
        alias, unresolved = canonicalize_undated_events(BOUTS_BY_EVENT, EVENT_DATES)
        self.assertNotIn('UFC - Road to UFC 4.6', alias)
        self.assertIn('UFC - Road to UFC 4.6', unresolved)

    def test_sorting_a_mixed_dated_and_undated_history_does_not_raise(self):
        """The exact crash: float vs str in the sort key."""
        fights = [
            {'date': '2025-09-13'}, {'date': NAN},
            {'date': None}, {'date': '2024-09-14'},
        ]
        with self.assertRaises(TypeError):          # pre-fix behaviour, pinned
            sorted(fights, key=lambda x: x['date'] or '', reverse=True)
        ordered = sorted(fights, key=lambda x: fight_sort_key(x['date']), reverse=True)
        self.assertEqual([f['date'] for f in ordered][:2], ['2025-09-13', '2024-09-14'])


class TestUndatedCannotBecomeLastFightDate(unittest.TestCase):
    def test_undated_fight_is_excluded_from_last_fight_date(self):
        # Newest-first, with an undated fight sitting at the head.
        fights = [{'result': 'W', 'date': NAN}, {'result': 'W', 'date': '2025-09-13'}]
        dated = [f for f in fights if f['result'] in ('W', 'L', 'NC') and is_dated(f['date'])]
        lfd = dated[0]['date'] if dated else None
        self.assertEqual(lfd, '2025-09-13')
        self.assertIsInstance(date.fromisoformat(lfd), date)

    def test_a_fighter_with_only_undated_fights_has_no_last_fight_date(self):
        fights = [{'result': 'W', 'date': NAN}, {'result': 'L', 'date': None}]
        dated = [f for f in fights if f['result'] in ('W', 'L', 'NC') and is_dated(f['date'])]
        lfd = dated[0]['date'] if dated else None
        self.assertIsNone(lfd)
        # ...and the days-since-last guard must not attempt to parse it.
        self.assertFalse(is_dated(lfd))

    def test_truthiness_alone_would_have_admitted_nan(self):
        """Why `if f['date']` was not enough."""
        self.assertTrue(bool(NAN))          # NaN is truthy — the whole bug
        self.assertFalse(is_dated(NAN))     # the fix


class TestNanCannotReachSortingOrDateParsing(unittest.TestCase):
    def test_normalize_date_collapses_every_missing_form_to_none(self):
        for missing in (NAN, None, '', '   '):
            self.assertIsNone(normalize_date(missing), f'{missing!r} should normalise to None')
        self.assertEqual(normalize_date('2025-09-13'), '2025-09-13')
        self.assertEqual(normalize_date('  2025-09-13  '), '2025-09-13')

    def test_fight_sort_key_is_always_a_string(self):
        for value in (NAN, None, '', 123, 4.5):
            self.assertIsInstance(fight_sort_key(value), str)
        self.assertEqual(fight_sort_key('2025-09-13'), '2025-09-13')

    def test_date_fromisoformat_is_never_reached_with_a_nan(self):
        with self.assertRaises(TypeError):          # what used to happen
            date.fromisoformat(NAN)
        self.assertFalse(is_dated(NAN))             # so the guard refuses first

    def test_fight_history_entries_exclude_undated_fights(self):
        fights = [
            {'date': '2025-09-13', 'result': 'W'},
            {'date': NAN, 'result': 'W'},
            {'date': None, 'result': 'L'},
        ]
        entries = [{'dt': f['date']} for f in fights
                   if is_dated(f['date']) and f['result'] in ('W', 'L', 'NC')]
        self.assertEqual(entries, [{'dt': '2025-09-13'}])
        entries.sort(key=lambda x: fight_sort_key(x['dt']), reverse=True)  # must not raise


if __name__ == '__main__':
    unittest.main(verbosity=2)
