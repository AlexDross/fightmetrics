"""Completed-fight feed validation and the fight ledger.

Two questions are answered here, before update_fighters.py computes or writes
anything:

1. Is this feed internally valid?  (validate_completed_feed)
   Every completed fight has a stable identity, a date that is not in the
   future, a legal outcome/round/clock, and -- unless a reviewed exception says
   otherwise -- exactly one well-formed stat row per fighter per round.

2. Is this feed a legitimate successor of the last one we published?
   (build_ledger / check_ledger_transition)
   A fight that disappears, or whose event, date, fighters or outcome change,
   is accepted only with a reviewed correction bound to the exact old and new
   content and to the upstream revision. Statistical corrections are reported,
   and a bulk of them requires review.

Pure functions over DataFrames/dicts so every rule is testable on fixtures.
"""

import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

# ─── Field vocabulary ─────────────────────────────────────────────────────────

COMPLETED_OUTCOMES = frozenset({'W/L', 'L/W', 'D/D', 'NC/NC'})
MAX_ROUNDS = 5
MAX_ROUND_SECS = 300

# Rounds were open-ended until UFC 21 (16 July 1999) introduced five-minute
# rounds; the feed's 48 longer "rounds" all predate it (latest: 7 May 1999).
# This is a documented rule regime, not a data exception: from this date every
# clock must be within five minutes.
FIVE_MINUTE_ROUNDS_FROM = '1999-07-16'

# Scheduled formats as ufcstats writes them: "3 Rnd (5-5-5)", "1 Rnd + OT
# (12-3)", "1 Rnd + 2OT (15-3-3)" -- the parenthesis lists every scheduled
# period in minutes, overtime included. Every one of the 20 formats in the feed
# at 1ccacc5 parses, and no fight ends after its last scheduled period or runs
# past the length of the period it ended in. "No Time Limit" (31 early fights,
# all ending in round 1) is one unbounded period. Anything else is refused as
# unsupported rather than guessed.
_TIME_FORMAT = re.compile(r'(\d+) Rnd(?: \+ (\d*)OT)? \((\d+(?:-\d+)*)\)')
NO_TIME_LIMIT = 'No Time Limit'

# The only CTRL values controlTimeUnavailable may excuse: the feed's marker
# for "not recorded". A malformed clock such as '3:99' is never "missing".
CTRL_UNAVAILABLE_VALUES = frozenset({'--', ''})

STAT_OF_FIELDS = ('SIG.STR.', 'TOTAL STR.', 'TD', 'HEAD', 'BODY', 'LEG',
                  'DISTANCE', 'CLINCH', 'GROUND')
STAT_COUNT_FIELDS = ('KD', 'SUB.ATT', 'REV.')

# Exactly what each ledger hash covers. Changing either tuple changes every
# hash, which the transition check would report as a bulk statistical change --
# so a change here must ship with a bulk review entry.
DETAIL_HASH_FIELDS = ('METHOD', 'ROUND', 'TIME', 'TIME FORMAT', 'WEIGHTCLASS')
STATS_HASH_FIELDS = ('ROUND', 'FIGHTER', 'KD', 'SIG.STR.', 'SIG.STR. %',
                     'TOTAL STR.', 'TD', 'TD %', 'SUB.ATT', 'REV.', 'CTRL',
                     'HEAD', 'BODY', 'LEG', 'DISTANCE', 'CLINCH', 'GROUND')
# Ledger row layout. The first five are protected: changing any of them, or
# removing the fight, needs a reviewed correction. `bout` is the label as the
# feed wrote it; `fighters` is the effective identity the updater files the
# fight under (name_aliases.json applied), so an alias that reassigns a fight
# to another fighter is a protected change even though the feed did not move.
LEDGER_COLUMNS = ('event', 'date', 'bout', 'fighters', 'outcome', 'detail', 'stats')
PROTECTED_COLUMNS = LEDGER_COLUMNS[:5]

# A refresh that changes more than this many existing fights' statistics is a
# bulk alarm and needs a bulk review. It is NOT a safety threshold: smaller
# statistical changes are accepted only because they are reported, never
# because they are small.
BULK_STAT_CHANGE_ALARM = 25

# Each category waives exactly one documented condition, and only while that
# condition is what the feed shows. Anything else about the fight is still
# checked; see validate_completed_feed.
EXCEPTION_CATEGORIES = (
    'statsUnavailable',        # every stat row is an empty placeholder (no round,
                               # fighter or values); coverage is not required
    'duplicateStatRows',       # a (round, fighter) repeats no more often than the
                               # number of fights sharing the label (rematch)
    'controlTimeUnavailable',  # CTRL is exactly '--' or blank
    'sameCardRematch',         # one EVENT+BOUT label shared by the listed fights
)

_MAX_LISTED = 25
_FIGHT_ID = re.compile(r'fight-details/([0-9a-f]{16})/?$')
_CLOCK = re.compile(r'(\d{1,2}):([0-5]\d)')
_OF = re.compile(r'(\d+) of (\d+)')
_COUNT = re.compile(r'\d+(?:\.0)?')


# The exact header of every feed input, in order. The updater refuses any
# other shape: a column it would consume but the ledger does not cover (for
# example a WEIGHTCLASS added to ufc_fight_details.csv, which the history
# builder would read) could otherwise change generated data while every
# ledger row stayed the same. A new upstream column means a reviewed change
# here and, if the updater reads it, in build_ledger.
INPUT_SCHEMA = {
    'ufc_fight_results.csv': ('EVENT', 'BOUT', 'OUTCOME', 'WEIGHTCLASS', 'METHOD', 'ROUND',
                              'TIME', 'TIME FORMAT', 'REFEREE', 'DETAILS', 'URL'),
    'ufc_event_details.csv': ('EVENT', 'URL', 'DATE', 'LOCATION'),
    'ufc_fight_details.csv': ('EVENT', 'BOUT', 'URL'),
    'ufc_fight_stats.csv': ('EVENT', 'BOUT', 'ROUND', 'FIGHTER', 'KD', 'SIG.STR.', 'SIG.STR. %',
                            'TOTAL STR.', 'TD', 'TD %', 'SUB.ATT', 'REV.', 'CTRL', 'HEAD',
                            'BODY', 'LEG', 'DISTANCE', 'CLINCH', 'GROUND'),
    'ufc_fighter_tott.csv': ('FIGHTER', 'HEIGHT', 'WEIGHT', 'REACH', 'STANCE', 'DOB', 'URL'),
}


def check_input_schema(source_dir):
    """Raise unless every feed input has exactly the reviewed header."""
    import csv
    problems = []
    for name, expected in INPUT_SCHEMA.items():
        with open(Path(source_dir) / name, newline='', encoding='utf-8') as handle:
            header = tuple(next(csv.reader(handle), []))
        if header != expected:
            extra = [c for c in header if c not in expected]
            missing = [c for c in expected if c not in header]
            problems.append(f'{name}: header {list(header)} is not the reviewed schema'
                            + (f'; unexpected {extra}' if extra else '')
                            + (f'; missing {missing}' if missing else '')
                            + ('; same columns, different order' if not extra and not missing else ''))
    _raise_if(problems, 'Feed input schema changed (review feed_validation.INPUT_SCHEMA)')


class FeedIntegrityError(RuntimeError):
    """The completed-fight feed is invalid or an unreviewed change to it."""


def _raise_if(problems, headline):
    if not problems:
        return
    shown = '\n  '.join(problems[:_MAX_LISTED])
    more = len(problems) - _MAX_LISTED
    raise FeedIntegrityError(
        f'{headline}: {len(problems)} problem(s); no artifact was written.\n  {shown}'
        + (f'\n  ... and {more} more' if more > 0 else ''))


def _text(value):
    if value is None or (isinstance(value, float) and value != value):
        return ''
    return str(value).strip()


def fight_id(url):
    """The 16-hex id ufcstats assigns a fight; distinct even for same-card rematches."""
    match = _FIGHT_ID.search(_text(url))
    return match.group(1) if match else None


def clock_secs(value):
    """Strict M:SS -> seconds; None for anything else ('3:99', '5', '--')."""
    match = _CLOCK.fullmatch(_text(value))
    return int(match.group(1)) * 60 + int(match.group(2)) if match else None


def round_number(label):
    match = re.fullmatch(r'Round (\d+)', _text(label))
    return int(match.group(1)) if match else None


def scheduled_periods(time_format):
    """Scheduled period lengths in seconds; [None] for No Time Limit; None if unsupported."""
    text = _text(time_format)
    if text == NO_TIME_LIMIT:
        return [None]
    match = _TIME_FORMAT.fullmatch(text)
    if not match:
        return None
    overtime = 0 if match.group(2) is None else int(match.group(2) or 1)
    periods = [int(minutes) * 60 for minutes in match.group(3).split('-')]
    return periods if len(periods) == int(match.group(1)) + overtime else None


def _is_placeholder(row):
    """A stat row carrying nothing but its EVENT and BOUT."""
    return all(not value for key, value in row.items() if key not in ('EVENT', 'BOUT'))


def split_bout(bout):
    parts = re.split(r'\s+vs\.?\s+', _text(bout), maxsplit=1)
    return (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else None


# ─── Reviewed exceptions ──────────────────────────────────────────────────────

def load_exceptions(path):
    """{category: {fight id: (first date, last date)}} from the reviewed file.

    Each category carries the date range it was reviewed for; an exception is
    honoured only while the fight's date stays inside it, so a listed id cannot
    excuse a fight the feed later re-dates into the modern era.
    """
    data = json.loads(Path(path).read_text(encoding='utf-8'))
    out = {}
    for category in EXCEPTION_CATEGORIES:
        entry = data.get('exceptions', {}).get(category, {'fightIds': [], 'dateRange': None})
        ids = entry.get('fightIds', [])
        bad = [i for i in ids if not re.fullmatch(r'[0-9a-f]{16}', i)]
        if bad:
            raise FeedIntegrityError(f'feed_exceptions.json {category}: invalid ids {bad[:5]}')
        if ids and not (isinstance(entry.get('dateRange'), list) and len(entry['dateRange']) == 2):
            raise FeedIntegrityError(f'feed_exceptions.json {category}: dateRange is required')
        span = tuple(entry['dateRange']) if ids else None
        out[category] = {fid: span for fid in ids}
    unknown = set(data.get('exceptions', {})) - set(EXCEPTION_CATEGORIES)
    if unknown:
        raise FeedIntegrityError(f'feed_exceptions.json: unknown categories {sorted(unknown)}')
    return out


def no_exceptions():
    return {category: {} for category in EXCEPTION_CATEGORIES}


# ─── Feed validation ──────────────────────────────────────────────────────────

def _stat_rows_by_bout(stats_df):
    rows = defaultdict(list)
    columns = ['EVENT', 'BOUT', 'ROUND', 'FIGHTER', 'CTRL',
               *STAT_OF_FIELDS, *STAT_COUNT_FIELDS]
    present = [c for c in columns if c in stats_df.columns]
    for record in stats_df[present].itertuples(index=False, name=None):
        row = dict(zip(present, (_text(v) for v in record)))
        rows[(row['EVENT'], row['BOUT'])].append(row)
    return rows


def _check_stat_cells(row, where, round_secs, ctrl_exempt, note):
    """ctrl_exempt is a callable: asked only when CTRL is a missing-value marker."""
    landed = {}
    for field in STAT_OF_FIELDS:
        match = _OF.fullmatch(row.get(field, ''))
        if not match:
            note('invalid statistic', f'{where}: {field}={row.get(field)!r}')
            continue
        hit, tried = int(match.group(1)), int(match.group(2))
        if hit > tried:
            note('invalid statistic', f'{where}: {field}={row[field]!r} lands more than attempted')
        landed[field] = hit
    for field in STAT_COUNT_FIELDS:
        if not _COUNT.fullmatch(row.get(field, '')):
            note('invalid statistic', f'{where}: {field}={row.get(field)!r}')
    if len(landed) == len(STAT_OF_FIELDS):
        sig = landed['SIG.STR.']
        if landed['HEAD'] + landed['BODY'] + landed['LEG'] != sig:
            note('inconsistent statistic', f'{where}: HEAD+BODY+LEG != SIG.STR. landed')
        if landed['DISTANCE'] + landed['CLINCH'] + landed['GROUND'] != sig:
            note('inconsistent statistic', f'{where}: DISTANCE+CLINCH+GROUND != SIG.STR. landed')
        if sig > landed['TOTAL STR.']:
            note('inconsistent statistic', f'{where}: SIG.STR. landed exceeds TOTAL STR.')
    ctrl = clock_secs(row.get('CTRL'))
    if ctrl is None:
        if not (row.get('CTRL', '') in CTRL_UNAVAILABLE_VALUES and ctrl_exempt()):
            note('invalid control time', f'{where}: CTRL={row.get("CTRL")!r}')
    elif round_secs is not None and ctrl > round_secs:
        note('invalid control time', f'{where}: CTRL={row["CTRL"]!r} exceeds the {round_secs}s round')


def validate_completed_feed(results_df, stats_df, today, *, exceptions,
                            normalize_name=None, raise_errors=True):
    """Reject a feed that cannot produce correct fighter statistics.

    results_df must carry the resolved ISO ``DATE`` (None when undated) and
    ``URL``; both frames must already be alias-canonicalised. ``normalize_name``
    must be whatever was applied to stats_df['FIGHTER']. Every rule applies to
    every fight; the only relaxations are the five-minute-round rule regime and
    fight-level reviewed exceptions. Returns a summary on success.

    raise_errors=False is the read-only audit mode (update_fighters.py
    --audit-feed): problems are returned as (kind, fight id, detail) instead of
    raised. It never writes or proposes an exception.
    """
    today = str(today)
    normalize = normalize_name or (lambda name: name)
    problems = []
    used = {category: set() for category in EXCEPTION_CATEGORIES}
    current = {'fid': None}

    def note(kind, detail):
        problems.append((kind, current['fid'], detail))

    def exempt(category, fid, event_date):
        span = exceptions[category].get(fid, False)
        if span is False:
            return False
        if not (span[0] <= event_date <= span[1]):
            note('exception outside its reviewed range',
                 f'{fid} is listed under {category} for {span[0]}..{span[1]} but is dated {event_date}')
            return False
        used[category].add(fid)
        return True

    stat_rows = _stat_rows_by_bout(stats_df)
    shared_labels = Counter(zip(results_df['EVENT'].map(_text), results_df['BOUT'].map(_text)))
    ids_by_label = defaultdict(list)
    seen_ids = Counter()
    fights = 0

    for event, bout, outcome, end_round, clock, time_format, event_date, url in zip(
        results_df['EVENT'].map(_text), results_df['BOUT'].map(_text),
        results_df['OUTCOME'].map(_text), results_df['ROUND'], results_df['TIME'],
        results_df['TIME FORMAT'], results_df['DATE'], results_df['URL'],
    ):
        fights += 1
        where = f'{bout!r} at {event!r}'
        fid = fight_id(url)
        current['fid'] = fid
        if fid is None:
            note('missing fight identity', f'{where}: URL={_text(url)!r}')
            continue
        seen_ids[fid] += 1
        ids_by_label[(event, bout)].append(fid)
        where = f'{where} [{fid}]'

        if not (isinstance(event_date, str) and event_date):
            note('undated event', f'{where}: no date after reviewed overrides and aliasing')
            continue
        where = f'{where} ({event_date})'
        if event_date > today:
            note('future completed result', f'{where} is after {today}')
        if outcome not in COMPLETED_OUTCOMES:
            note('unknown outcome', f'{where}: {outcome!r}')
        try:
            last_round = int(_text(end_round))
        except ValueError:
            last_round = 0
        if not 1 <= last_round <= MAX_ROUNDS:
            note('invalid round', f'{where}: ROUND={_text(end_round)!r}')
            continue
        final_secs = clock_secs(clock)
        five_minute = event_date >= FIVE_MINUTE_ROUNDS_FROM
        if final_secs is None or final_secs <= 0 or (five_minute and final_secs > MAX_ROUND_SECS):
            note('invalid round duration', f'{where}: TIME={_text(clock)!r}')
        periods = scheduled_periods(time_format)
        if periods is None:
            note('unsupported time format',
                 f'{where}: TIME FORMAT={_text(time_format)!r}; supported: "N Rnd (m-m-...)", '
                 f'"N Rnd + [k]OT (m-...)" listing every period, or {NO_TIME_LIMIT!r}. '
                 'Add a source-backed rule to feed_validation.scheduled_periods before accepting it.')
            periods = []
        elif last_round > len(periods):
            note('round after the scheduled format',
                 f'{where}: ended in round {last_round} of a {_text(time_format)!r} fight')
        elif final_secs is not None and periods[last_round - 1] is not None \
                and final_secs > periods[last_round - 1]:
            note('invalid round duration',
                 f'{where}: TIME={_text(clock)!r} exceeds the {periods[last_round - 1]}s '
                 f'period {last_round} of {_text(time_format)!r}')

        def period_secs(number):
            if number == last_round:
                return final_secs
            if number <= len(periods) and periods[number - 1] is not None:
                return periods[number - 1]
            return MAX_ROUND_SECS if five_minute else None

        pair = split_bout(bout)
        if pair is None:
            note('unparseable bout', where)
            continue
        fighters = tuple(normalize(name) for name in pair)
        if fighters[0] == fighters[1]:
            note('same fighter on both sides',
                 f'{where}: both corners resolve to {fighters[0]!r} after name_aliases.json')
            continue
        rows = stat_rows.get((event, bout), [])
        # statsUnavailable covers exactly one condition: the feed has nothing
        # but empty placeholder rows for the fight. A row with any content is
        # real data and is validated like any other.
        if rows and all(_is_placeholder(row) for row in rows) \
                and exempt('statsUnavailable', fid, event_date):
            continue
        if not rows and exempt('statsUnavailable', fid, event_date):
            continue
        per_fighter = defaultdict(Counter)
        for row in rows:
            number = round_number(row['ROUND'])
            if number is None:
                note('invalid stat round', f'{where}: ROUND={row["ROUND"]!r}')
                continue
            per_fighter[row['FIGHTER']][number] += 1
            if row['FIGHTER'] in fighters:
                _check_stat_cells(row, f'{where} {row["FIGHTER"]!r} round {number}',
                                  period_secs(number),
                                  lambda: exempt('controlTimeUnavailable', fid, event_date), note)
        expected = set(range(1, last_round + 1))
        for fighter in fighters:
            got = per_fighter.get(fighter)
            if not got:
                note('missing round stats', f'{where}: no rows for {fighter!r}')
                continue
            if set(got) != expected:
                note('incomplete round stats',
                     f'{where}: {fighter!r} has rounds {sorted(got)}, expected 1-{last_round}')
            repeated = sorted(n for n, count in got.items() if count > 1)
            if repeated:
                # Tolerated only where the label is shared by a reviewed
                # same-card rematch, and never more copies than fights share it.
                sharing = shared_labels.get((event, bout), 1)
                excess = sorted(n for n in repeated if got[n] > sharing)
                if excess or sharing < 2 or not exempt('duplicateStatRows', fid, event_date):
                    note('duplicate stat rows', f'{where}: {fighter!r} rounds {repeated}'
                         + (f' (more copies than the {sharing} fights sharing the label)'
                            if excess and sharing > 1 else ''))
        strangers = sorted(set(per_fighter) - set(fighters))
        if strangers:
            note('stats for a fighter not in the bout', f'{where}: {strangers}')

    current['fid'] = None
    dates_by_id = dict(zip(results_df['URL'].map(fight_id), results_df['DATE']))
    for fid, count in seen_ids.items():
        if count > 1:
            note('duplicate fight identity', f'{fid} appears {count} times after canonicalisation')
    for (event, bout), ids in ids_by_label.items():
        if len(ids) > 1:
            if not all(isinstance(dates_by_id.get(i), str)
                       and exempt('sameCardRematch', i, dates_by_id[i]) for i in ids):
                note('ambiguous bout label',
                     f'{bout!r} at {event!r} names {len(ids)} fights {sorted(ids)}; '
                     'round stats cannot be attributed')
    for event, bout in sorted(set(stat_rows) - set(ids_by_label)):
        note('round stats without a result', f'{bout!r} at {event!r}')

    if raise_errors:
        _raise_if([f'{kind}: {detail}' for kind, _, detail in problems],
                  'Completed-fight feed failed validation')
    unused = {c: sorted(set(exceptions[c]) - used[c]) for c in EXCEPTION_CATEGORIES}
    return {
        'problems': problems,
        'fights': fights,
        'exceptionsUsed': {c: len(used[c]) for c in EXCEPTION_CATEGORIES},
        'exceptionsUnused': {c: ids for c, ids in unused.items() if ids},
    }


def validate_record_dates(record_updates, today):
    """No fighter may come out of a refresh with a fight after ``today``."""
    today = str(today)
    bad = sorted(
        f"{name}: lfd={rec.get('lfd')} dsl={rec.get('dsl')}"
        for name, rec in record_updates.items()
        if (rec.get('lfd') and rec['lfd'] > today)
        or (rec.get('dsl') is not None and rec['dsl'] < 0)
    )
    _raise_if(bad, f'Fighter records end after {today}')


# ─── Fight ledger ─────────────────────────────────────────────────────────────

def _digest(parts):
    return hashlib.sha256('\x1f'.join(parts).encode('utf-8')).hexdigest()[:16]


def effective_fighters(bout, normalize_name=None):
    """The identity the updater files a fight under: both corners after aliasing."""
    pair = split_bout(bout)
    if pair is None:
        return None
    normalize = normalize_name or (lambda name: name)
    return ' vs. '.join(normalize(name) for name in pair)


def build_ledger(results_df, stats_df, normalize_name=None):
    """{fight id: [event, date, bout, fighters, outcome, detail hash, stats hash]}.

    ``fighters`` is the bout with name_aliases.json applied (normalize_name),
    i.e. the identities the generated history and records use. detail hash
    covers DETAIL_HASH_FIELDS of the result row; stats hash covers
    STATS_HASH_FIELDS of every stat row filed under the fight's EVENT+BOUT,
    sorted. Values are the stripped feed strings (FIGHTER after the updater's
    name aliasing), so the hashes describe exactly what the updater consumed.
    The updater refuses any input column it does not account for here or in
    INPUT_SCHEMA, so a consumed value cannot change outside the ledger.
    """
    stat_lines = defaultdict(list)
    columns = ['EVENT', 'BOUT', *STATS_HASH_FIELDS]
    for record in stats_df.reindex(columns=columns).itertuples(index=False, name=None):
        values = [_text(v) for v in record]
        stat_lines[(values[0], values[1])].append('\x1e'.join(values[2:]))
    ledger = {}
    detail_columns = results_df.reindex(columns=list(DETAIL_HASH_FIELDS))
    for (event, bout, outcome, event_date, url), details in zip(
        zip(results_df['EVENT'].map(_text), results_df['BOUT'].map(_text),
            results_df['OUTCOME'].map(_text), results_df['DATE'], results_df['URL']),
        detail_columns.itertuples(index=False, name=None),
    ):
        fid = fight_id(url)
        ledger[fid] = [
            event, event_date if isinstance(event_date, str) else None, bout,
            effective_fighters(bout, normalize_name), outcome,
            _digest([_text(v) for v in details]),
            _digest(sorted(stat_lines.get((event, bout), []))),
        ]
    return ledger


def load_corrections(path):
    data = json.loads(Path(path).read_text(encoding='utf-8'))
    return data.get('corrections', []), data.get('bulkStatReviews', [])


def _protected(row):
    return dict(zip(PROTECTED_COLUMNS, row[:len(PROTECTED_COLUMNS)])) if row is not None else None


def check_ledger_transition(previous, current, revision, corrections, bulk_reviews,
                            previous_revision=None):
    """Accept current as the successor of previous, or raise.

    Removed fights and protected-field changes each need a correction for this
    exact upstream revision whose ``old``/``new`` equal the before/after
    protected content. Protected and statistic (detail/stats hash) changes are
    detected independently: a fight can be in both lists, and its statistic
    change counts toward the bulk alarm whether or not its protected change
    was approved. More than BULK_STAT_CHANGE_ALARM statistic changes need a
    bulk review listing exactly those fight ids.

    A correction for this revision that matches no change is an error, so an
    approval cannot be stretched to cover something it did not describe --
    with one exception that keeps reruns safe: when the previous ledger was
    already published at this same revision and already holds the
    correction's ``new`` state (or, for a removal, no longer holds the fight),
    the correction is recorded as already applied. Nothing is approved by that;
    the fight simply has no change left. Returns the change report.
    """
    removed = sorted(set(previous) - set(current))
    added = sorted(set(current) - set(previous))
    protected_changes, stat_changes = [], []
    n = len(PROTECTED_COLUMNS)
    for fid in sorted(set(previous) & set(current)):
        before, after = previous[fid], current[fid]
        if list(before[:n]) != list(after[:n]):
            protected_changes.append(fid)
        if list(before[n:]) != list(after[n:]):
            stat_changes.append(fid)

    applicable = [c for c in corrections if c.get('upstreamRevision') == revision]
    problems, matched, already_applied = [], set(), []

    def find(fid, change, old, new):
        for index, c in enumerate(applicable):
            if (c.get('fightId') == fid and c.get('change') == change
                    and c.get('old') == old and c.get('new') == new):
                return index
        return None

    for fid in removed:
        old = _protected(previous[fid])
        index = find(fid, 'removed', old, None)
        if index is None:
            problems.append(f'fight removed without a reviewed correction: {fid} {old}')
        else:
            matched.add(index)
    for fid in protected_changes:
        old, new = _protected(previous[fid]), _protected(current[fid])
        index = find(fid, 'modified', old, new)
        if index is None:
            changed = {k: [old[k], new[k]] for k in PROTECTED_COLUMNS if old[k] != new[k]}
            problems.append(f'protected fields changed without a reviewed correction: {fid} {changed}')
        else:
            matched.add(index)
    for index, c in enumerate(applicable):
        if index in matched:
            continue
        fid = c.get('fightId')
        rerun = previous_revision == revision and (
            (c.get('change') == 'modified' and fid in previous and fid in current
             and _protected(previous[fid]) == c.get('new') == _protected(current[fid]))
            or (c.get('change') == 'removed' and c.get('new') is None
                and fid not in previous and fid not in current))
        if rerun:
            already_applied.append(fid)
        else:
            problems.append(
                f"correction for {fid} ({c.get('change')}) at this revision "
                'does not match the actual change; nothing it does not describe is approved')

    if len(stat_changes) > BULK_STAT_CHANGE_ALARM:
        reviewed = [b for b in bulk_reviews
                    if b.get('upstreamRevision') == revision
                    and sorted(b.get('fightIds', [])) == stat_changes]
        if not reviewed:
            problems.append(
                f'{len(stat_changes)} existing fights changed statistics (alarm above '
                f'{BULK_STAT_CHANGE_ALARM}); a bulk review listing exactly these ids is required')

    _raise_if(problems, 'Upstream feed changed without review')
    previous_max = max((row[1] for row in previous.values() if row[1]), default=None)
    return {
        'added': len(added),
        'backfilledBeforePreviousMax': sorted(
            fid for fid in added if previous_max and current[fid][1] and current[fid][1] < previous_max),
        'removed': removed,
        'protectedChanges': protected_changes,
        'statChanges': stat_changes,
        'correctionsAlreadyApplied': sorted(already_applied),
    }


def serialize_ledger(revision, ledger):
    """Valid JSON, one fight per line, no timestamps.

    The git diff of this file IS the durable change report: every fight whose
    protected fields or content hashes moved shows as its own changed line.
    An unchanged feed rewrites it byte-for-byte.
    """
    lines = [f'    {json.dumps(fid)}: {json.dumps(ledger[fid], ensure_ascii=False)}'
             for fid in sorted(ledger)]
    return ('{\n'
            f'  "revision": {json.dumps(revision)},\n'
            f'  "columns": {json.dumps(list(LEDGER_COLUMNS))},\n'
            '  "fights": {\n' + ',\n'.join(lines) + '\n  }\n}\n')


def load_ledger(path):
    data = json.loads(Path(path).read_text(encoding='utf-8'))
    if data.get('columns') != list(LEDGER_COLUMNS):
        raise FeedIntegrityError(f'{path}: unexpected ledger columns {data.get("columns")}')
    return data
