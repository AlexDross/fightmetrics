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
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime

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


def _sha256_file(path):
    with open(path, 'rb') as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def results_sha256():
    return _sha256_file(RESULTS_CSV)


# ── exact source reconstruction ──────────────────────────────────────────────
# Mirrors update_fighters.py's own pipeline (alias normalisation, event-date
# overrides, undated-event canonicalisation, aggregate canonicalisation, sort)
# so every emitted history corner can be joined to THE result row it came from.
# Nothing here re-implements semantics: the parse comes from fight_weightclass.

def build_source_corners():
    """{fighter: [ {url, division, championship, dt, op}, ... ]} in history order."""
    import pandas as pd
    from collections import Counter
    from fight_event_dates import (apply_event_date_overrides,
                                   canonicalize_undated_events, fight_sort_key,
                                   is_dated, normalize_date)
    from fight_data_integrity import (canonicalize_aggregate_inputs,
                                      load_required_csv)

    aliases = json.load(open(os.path.join(HERE, 'name_aliases.json')))
    norm = lambda n: aliases.get(n.strip(), n.strip())

    results = load_required_csv(os.path.join(HERE, 'ufc_fight_results.csv'))
    events = load_required_csv(os.path.join(HERE, 'ufc_event_details.csv'))
    details = load_required_csv(os.path.join(HERE, 'ufc_fight_details.csv'))
    stats = load_required_csv(os.path.join(HERE, 'ufc_fight_stats.csv'))
    for frame in (details, stats):
        frame['EVENT'] = frame['EVENT'].str.strip()
        frame['BOUT'] = frame['BOUT'].str.strip()

    def parse_event_date(value):
        if not isinstance(value, str):
            return None
        try:
            return datetime.strptime(value.strip(), '%B %d, %Y').strftime('%Y-%m-%d')
        except ValueError:
            return None

    event_dates = dict(zip(events['EVENT'].str.strip(),
                           events['DATE'].apply(parse_event_date)))
    results['EVENT'] = results['EVENT'].str.strip()
    results['BOUT'] = results['BOUT'].str.strip()
    apply_event_date_overrides(event_dates)
    bouts_by_event = {ev: Counter(g['BOUT'].dropna().astype(str))
                      for ev, g in results.groupby('EVENT')}
    alias_map, _ = canonicalize_undated_events(bouts_by_event, event_dates)
    results, details, stats, _ = canonicalize_aggregate_inputs(
        results, details, stats, alias_map)
    results['DATE'] = results['EVENT'].map(event_dates).map(normalize_date)

    by_fighter = {}
    for _, row in results.iterrows():
        bout = str(row.get('BOUT', ''))
        parts = re.split(r'\s+vs\.?\s+', bout.strip(), maxsplit=1)
        if len(parts) != 2:
            continue
        a, b = norm(parts[0]), norm(parts[1])
        outcome = str(row.get('OUTCOME', '')).strip()
        winner = a if outcome == 'W/L' else (b if outcome == 'L/W' else None)
        parsed = parse_weightclass(row['WEIGHTCLASS'])
        for fighter, opponent in ((a, b), (b, a)):
            result = 'NC' if winner is None else ('W' if fighter == winner else 'L')
            by_fighter.setdefault(fighter, []).append({
                'date': row['DATE'], 'result': result, 'op': opponent,
                'url': str(row.get('URL', '')).strip(),
                'division': parsed['division'],
                'championship': parsed['championship'],
            })
    for name in by_fighter:
        by_fighter[name].sort(key=lambda f: fight_sort_key(f['date']), reverse=True)
        by_fighter[name] = [f for f in by_fighter[name]
                            if is_dated(f['date']) and f['result'] in ('W', 'L', 'NC')]
    return by_fighter


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


# NOTE: an earlier revision counted affected bouts with a coarse
# (date, event, {fighters}) key and reported 3,686. That key cannot separate
# Sakuraba vs Silveira's two bouts on one card, so it undercounted by one. The
# canonical bout identity is the result URL, and the corrected figure is 3,687.


def require_pinned_snapshot(case):
    """Skip a SNAPSHOT-SPECIFIC assertion unless the feed is the pinned one.

    Totals like 17,644 rows or 4,508 changed rows are properties of ONE feed. A
    later feed with new bouts produces different, equally valid numbers, so a
    scheduled refresh must not fail on them. Dynamic invariants below are NOT
    gated -- they must hold on every feed.
    """
    if results_sha256() != PINNED_RESULTS_SHA256:
        case.skipTest('feed is not the pinned snapshot; totals apply only to it')


class Shape(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.history = load_current()

    def test_ratified_row_and_fighter_counts(self):
        require_pinned_snapshot(self)
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

    def test_every_emitted_bout_has_exactly_two_corners(self):
        """Dynamic invariant: holds on ANY feed, including new bouts.

        Deliberately not pinned to 8,822 -- a legitimate new bout using an
        already-reviewed label must be able to pass this.
        """
        counts = collections.Counter()
        for fighter, entries in self.history.items():
            for entry in entries:
                counts[bout_key(fighter, entry)] += 1
        self.assertGreater(len(counts), 0)
        wrong = {k: n for k, n in counts.items() if n != 2}
        self.assertEqual(wrong, {}, f'{len(wrong)} bouts without exactly two corners')
        self.assertEqual(sum(counts.values()),
                         sum(len(v) for v in self.history.values()))

    def test_pinned_snapshot_bout_count(self):
        require_pinned_snapshot(self)
        counts = {bout_key(f, e) for f, es in self.history.items() for e in es}
        self.assertEqual(len(counts), 8822)


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

    def test_every_corner_joins_its_source_row_and_matches_exactly(self):
        """EXACT coverage: every emitted corner joins its own result row.

        Applies name_aliases.json and the same event canonicalisation the
        updater uses, then compares position-by-position in history order. No
        unmatched corner is tolerated and no sampling threshold is used.
        """
        source = build_source_corners()
        self.assertEqual(set(source), set(self.history),
                         'fighter sets differ between source and artifact')
        checked = 0
        for name, entries in self.history.items():
            rows = source[name]
            self.assertEqual(len(rows), len(entries), f'{name}: corner count differs')
            for entry, row in zip(entries, rows):
                self.assertEqual(entry['dt'], row['date'], name)
                self.assertEqual(entry['op'], row['op'], name)
                self.assertEqual(entry['wc'], row['division'],
                                 f"{name} {entry['dt']}: wc != parsed source division")
                self.assertEqual(entry['tb'], row['championship'],
                                 f"{name} {entry['dt']}: tb != parsed championship")
                self.assertTrue(row['url'], f'{name}: source row has no URL')
                checked += 1
        self.assertEqual(checked, sum(len(v) for v in self.history.values()))


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
        source = build_source_corners()
        source_urls = {n: [r['url'] for r in rows] for n, rows in source.items()}
        for name, before_entries in self.base.items():
            after_entries = self.current[name]
            self.assertEqual(len(before_entries), len(after_entries), name)
            for index, (before, after) in enumerate(zip(before_entries, after_entries)):
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
                    bouts.add(source_urls[name][index])
        self.assertEqual(wc_changed, 4508)
        self.assertEqual(tb_changed, 804)
        self.assertEqual(both, 287)
        self.assertEqual(len(fighters), 1433)
        # 3,687 distinct result URLs, not 3,686: the coarse pair key collapsed
        # Sakuraba vs Silveira's two distinct bouts on the same card.
        self.assertEqual(len(bouts), 3687)
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



# ── TWO DISTINCT POPULATIONS, deliberately not conflated ────────────────────
#
# A. PRE-EVENT ROSTER (below). The 20 fighters in the 10 matchups saved to
#    src/upcomingData.js before UFC 330 was contested. The pinned feed
#    (Greco 18ba2092) PREDATES the event, so it contains no UFC 330 rows at
#    all. What these deltas measure is the correction applied to those
#    fighters' EARLIER careers: 59 wc and 7 tb changes. Nothing here inspects a
#    UFC 330 bout, and this must never be described as "UFC 330's bouts
#    verified".
#
# B. THE CONTESTED EVENT. UFC 330: Makhachev vs. Machado Garry was 12 official
#    bouts / 24 fighters — the 10 saved matchups plus Charles Johnson vs.
#    Eduardo Chapolin (Catch Weight) and Rafael Tobias vs. Lucas Fernando
#    (Light Heavyweight). Those rows exist only in the LATER feed, so they are
#    covered by a captured fixture in Ufc330ContestedEventFixture below rather
#    than by these deltas.
PRE_EVENT_ROSTER_DELTAS = {
    'Islam Makhachev': (17, 6), 'Ian Machado Garry': (0, 0),
    'Mackenzie Dern': (0, 1), 'Gillian Robertson': (13, 0),
    'Mansur Abdul-Malik': (0, 0), 'Dustin Stoltzfus': (0, 0),
    'Edson Barboza': (8, 0), 'Esteban Ribovics': (0, 0),
    'Chidi Njokuani': (5, 0), 'Joel Alvarez': (9, 0),
    'Jalin Turner': (2, 0), 'Kaue Fernandes': (0, 0),
    'Donte Johnson': (0, 0), 'Eric McConico': (1, 0),
    'Vicente Luque': (1, 0), 'Tresean Gore': (0, 0),
    'Neil Magny': (0, 0), 'Ramiz Brahimaj': (0, 0),
    'Jeremiah Wells': (0, 0), 'Myktybek Orolbai': (3, 0),
}

UFC330_FIXTURE = os.path.join(HERE, 'tests', 'fixtures', 'weightclass',
                              'ufc330_bouts.tsv')


def load_ufc330_fixture():
    """The 12 contested UFC 330 bout rows, captured from the later feed.

    Read from a committed fixture rather than fetched, so CI covers the real
    event without depending on a mutable upstream repository. Provenance (source
    commit and all four CSV hashes) is recorded in the fixture header.
    """
    with open(UFC330_FIXTURE, encoding='utf-8') as handle:
        lines = [ln for ln in handle if not ln.startswith('#')]
    return list(csv.DictReader(lines, delimiter='\t'))


class Ufc330ContestedEventFixture(unittest.TestCase):
    """Population B: all 12 contested bouts / 24 fighters of the real event.

    Feed-independent by construction — it asserts the PARSER against captured
    source rows, so it runs on the pinned feed, on a newer feed, and offline.
    """

    @classmethod
    def setUpClass(cls):
        cls.rows = load_ufc330_fixture()

    def test_fixture_covers_twelve_bouts_and_twenty_four_fighters(self):
        self.assertEqual(len(self.rows), 12)
        fighters = set()
        for row in self.rows:
            parts = re.split(r'\s+vs\.?\s+', row['bout'].strip(), maxsplit=1)
            self.assertEqual(len(parts), 2, row['bout'])
            fighters.update(p.strip() for p in parts)
        self.assertEqual(len(fighters), 24)

    def test_every_bout_url_is_distinct(self):
        urls = [r['url'] for r in self.rows]
        self.assertEqual(len(set(urls)), 12)
        self.assertTrue(all(u.startswith('http') for u in urls))

    def test_parser_reproduces_every_captured_bout_record(self):
        """The whole point: each raw label parses to the recorded metadata."""
        for row in self.rows:
            with self.subTest(bout=row['bout']):
                parsed = parse_weightclass(row['raw_weightclass'])
                self.assertEqual(parsed['division'], row['division'])
                self.assertEqual(parsed['championship'],
                                 row['championship'] == 'True')
                self.assertEqual(parsed['interim'], row['interim'] == 'True')
                self.assertEqual(parsed['tournament_final'],
                                 row['tournament_final'] == 'True')
                self.assertIn(parsed['division'], SUPPORTED_DIVISIONS)
                self.assertNotIn('title', parsed['division'].lower())

    def test_the_two_title_bouts_are_the_only_championships(self):
        champs = {r['bout'] for r in self.rows if r['championship'] == 'True'}
        self.assertEqual(champs, {
            'Islam Makhachev vs. Ian Machado Garry',
            "Mackenzie Dern vs. Gillian Robertson"})
        self.assertFalse(any(r['interim'] == 'True' for r in self.rows))

    def test_the_two_bouts_outside_the_pre_event_roster_are_covered(self):
        """Exactly the gap the 20-fighter population cannot reach."""
        bouts = {r['bout']: r for r in self.rows}
        extra = bouts['Charles Johnson vs. Eduardo Chapolin']
        self.assertEqual(extra['division'], 'Catch Weight')
        self.assertEqual(extra['championship'], 'False')
        extra = bouts['Rafael Tobias vs. Lucas Fernando']
        self.assertEqual(extra['division'], 'Light Heavyweight')
        self.assertEqual(extra['championship'], 'False')

    def test_no_fighter_in_the_fixture_is_missing_from_the_pre_event_roster_by_accident(self):
        """Documents the 20 vs 24 relationship instead of leaving it implicit."""
        fighters = set()
        for row in self.rows:
            fighters.update(p.strip() for p in
                            re.split(r'\s+vs\.?\s+', row['bout'].strip(), maxsplit=1))
        extra = fighters - set(PRE_EVENT_ROSTER_DELTAS)
        self.assertEqual(extra, {'Charles Johnson', 'Eduardo Chapolin',
                                 'Rafael Tobias', 'Lucas Fernando'})


class Ufc330PreEventRosterCoverage(unittest.TestCase):
    """Population A: pre-event historical wc/tb deltas for the 20-fighter roster.

    These are corrections to fights the 20 fighters had BEFORE UFC 330. The
    pinned feed has no UFC 330 rows; see Ufc330ContestedEventFixture for the
    contested event itself.
    """

    @classmethod
    def setUpClass(cls):
        cls.base = load_base()
        cls.current = load_current()

    def setUp(self):
        if self.base is None:
            self.skipTest('base blob unavailable')
        require_pinned_snapshot(self)

    def test_all_twenty_pre_event_roster_fighters_are_present(self):
        self.assertEqual(len(PRE_EVENT_ROSTER_DELTAS), 20)
        for name in PRE_EVENT_ROSTER_DELTAS:
            self.assertIn(name, self.current, f'{name} missing from fightHistory')

    def test_per_fighter_pre_event_wc_and_tb_deltas(self):
        """Corrections to bouts these 20 fighters had BEFORE UFC 330."""
        total_wc = total_tb = 0
        for name, (want_wc, want_tb) in sorted(PRE_EVENT_ROSTER_DELTAS.items()):
            before, after = self.base[name], self.current[name]
            self.assertEqual(len(before), len(after), name)
            wc = sum(1 for x, y in zip(before, after) if x['wc'] != y['wc'])
            tb = sum(1 for x, y in zip(before, after) if x['tb'] != y['tb'])
            with self.subTest(fighter=name):
                self.assertEqual(wc, want_wc, f'{name}: wc delta')
                self.assertEqual(tb, want_tb, f'{name}: tb delta')
            total_wc += wc
            total_tb += tb
        self.assertEqual(total_wc, 59)
        self.assertEqual(total_tb, 7)

    def test_pinned_feed_contains_no_ufc_330_rows(self):
        """Makes the two-population split explicit instead of implied.

        If a future pin includes the event, this fails and forces the deltas
        above to be re-ratified rather than silently changing meaning.
        """
        with open(RESULTS_CSV, encoding='utf-8', errors='replace') as handle:
            self.assertNotIn('UFC 330', handle.read())

    def test_luque_gastelum_pre_event_both_corners_middleweight(self):
        """Luque's UFC 327 bout — a pre-event correction, not a UFC 330 bout."""
        for a, b in (('Vicente Luque', 'Kelvin Gastelum'),
                     ('Kelvin Gastelum', 'Vicente Luque')):
            entry = next(e for e in self.current[a]
                         if e['op'] == b and e['dt'] == '2026-04-11')
            self.assertEqual(entry['wc'], 'Middleweight')
            self.assertFalse(entry['tb'])


class DeterministicRegeneration(unittest.TestCase):
    """Two full runs at a fixed ASOF must be byte-identical.

    The regeneration happens in a THROWAWAY WORKSPACE, never in the checkout.
    This test used to run `update_fighters.py` with `cwd=HERE`, which rewrote
    the repository's own tracked `src/fightersData.js` and `src/fightHistory.js`
    at a hardcoded 2026-08-13 as-of date. In the scheduled workflow that step
    sits between the real current-clock generation and
    `git add src/fightersData.js … && git commit && git push`, so a run whose
    feed happened to match the pin published 2,198 `dsl` values rolled back to a
    stale clock — measured, not hypothesised.

    `cwd=` alone could never have fixed it: `update_fighters.py` resolves every
    path from `os.path.dirname(os.path.abspath(__file__))`, so it writes beside
    its own source file regardless of the working directory. The updater and its
    imports are therefore COPIED into the temporary tree, and the assertions
    read only paths under that tree.
    """

    # Everything update_fighters.py touches, resolved relative to SRC.
    WORKSPACE_MODULES = (
        'update_fighters.py', 'fight_event_dates.py', 'fight_data_integrity.py',
        'fight_weightclass.py', 'js_roster_parser.py',
    )
    WORKSPACE_DATA = ('name_aliases.json',)
    WORKSPACE_SRC = ('fightersData.js', 'fightHistory.js', 'prospectsData.js')
    WORKSPACE_FEED = ('ufc_fight_results.csv', 'ufc_event_details.csv',
                      'ufc_fight_details.csv', 'ufc_fight_stats.csv')
    ARTIFACTS = ('fightHistory.js', 'fightersData.js')

    def _materialise(self, root, feed_dir=None):
        """Copy a complete, self-contained updater workspace into `root`.

        `feed_dir` overrides where the four CSVs come from, so the same
        machinery drives both the pinned-feed and the alternate-feed proofs.
        """
        os.makedirs(os.path.join(root, 'src'), exist_ok=True)
        for name in self.WORKSPACE_MODULES + self.WORKSPACE_DATA:
            shutil.copy2(os.path.join(HERE, name), os.path.join(root, name))
        for name in self.WORKSPACE_SRC:
            shutil.copy2(os.path.join(HERE, 'src', name),
                         os.path.join(root, 'src', name))
        for name in self.WORKSPACE_FEED:
            shutil.copy2(os.path.join(feed_dir or HERE, name),
                         os.path.join(root, name))

    def _regenerate_twice(self, root, asof):
        """Run the updater twice in `root`; return the two artifact digest pairs."""
        env = dict(os.environ, FIGHTMETRICS_ASOF=asof)
        digests = []
        for run in (1, 2):
            proc = subprocess.run([sys.executable, 'update_fighters.py'],
                                  cwd=root, env=env, capture_output=True,
                                  text=True)
            self.assertEqual(proc.returncode, 0,
                             f'run {run} failed:\n{proc.stderr[-2000:]}')
            digests.append(tuple(_sha256_file(os.path.join(root, 'src', name))
                                 for name in self.ARTIFACTS))
        return digests

    def _require_feed(self):
        for name in self.WORKSPACE_FEED:
            if not os.path.exists(os.path.join(HERE, name)):
                self.skipTest(f'{name} (gitignored) not present')

    # ── DYNAMIC invariant: runs on ANY feed, never snapshot-gated ────────────
    def test_two_runs_produce_identical_artifacts(self):
        """Idempotence is a property of the generator, not of one snapshot.

        Deliberately NOT wrapped in require_pinned_snapshot: gating execution on
        the pinned feed is what made this gate vanish from the scheduled
        workflow the moment upstream refreshed. Only the snapshot-specific
        expected hashes below may skip.
        """
        self._require_feed()
        with tempfile.TemporaryDirectory(prefix='fm-idem-') as root:
            self._materialise(root)
            first, second = self._regenerate_twice(root, '2026-08-13')
            self.assertEqual(first, second, 'regeneration is not idempotent')

    def test_expected_artifact_hashes_on_the_pinned_feed(self):
        """SNAPSHOT-SPECIFIC: exact bytes, valid only for the pinned feed."""
        self._require_feed()
        require_pinned_snapshot(self)
        with tempfile.TemporaryDirectory(prefix='fm-pin-') as root:
            self._materialise(root)
            first, _ = self._regenerate_twice(root, '2026-08-13')
        self.assertEqual(first[0],
                         '420eafc4418bb747793d51a438a02b39525d03985e8b0f0139384c06ea9c0449')
        self.assertEqual(first[1],
                         '27b046d070869d7aba20117b971862623f67997956f18a77ad3ef0a283fdb134')

    def test_regeneration_does_not_touch_the_checkout(self):
        """The guard that makes the above safe to run in CI.

        Hashes every tracked artifact before and after a full two-run
        regeneration. If a future edit reintroduces `cwd=HERE`, this fails here
        instead of in a bot commit that rolls production data backwards.
        """
        self._require_feed()
        watched = {name: os.path.join(HERE, 'src', name)
                   for name in ('fightHistory.js', 'fightersData.js',
                                'upcomingData.js')}
        before = {n: _sha256_file(p) for n, p in watched.items()}
        with tempfile.TemporaryDirectory(prefix='fm-iso-') as root:
            self._materialise(root)
            self._regenerate_twice(root, '2026-08-13')
        after = {n: _sha256_file(p) for n, p in watched.items()}
        self.assertEqual(before, after,
                         'regeneration wrote into the checkout; the updater must '
                         'run only inside its temporary workspace')


if __name__ == '__main__':
    unittest.main(verbosity=2)
