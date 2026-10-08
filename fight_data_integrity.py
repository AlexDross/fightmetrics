"""Pure integrity gates for the Greco/UFCStats aggregate inputs.

The scheduled updater is intentionally an executable script, so importing it
runs the whole rebuild.  These transformations live here so duplicate-event
handling can be exercised against committed fixtures without touching any
generated artifact.
"""

import os
import re
from pathlib import Path

import pandas as pd


REQUIRED_AGGREGATE_CSVS = (
    'ufc_fight_results.csv',
    'ufc_event_details.csv',
    'ufc_fight_details.csv',
    'ufc_fight_stats.csv',
)


class AggregateConflictError(RuntimeError):
    """An alias and canonical event disagree for the same aggregate row."""


def load_required_csv(path, *, dtype=str):
    """Read a required updater input and fail with a useful path-specific error."""
    csv_path = Path(path)
    if not csv_path.is_file():
        raise FileNotFoundError(
            f"Required aggregate input is missing: {csv_path}. "
            "The updater cannot safely substitute partial fighter data."
        )
    try:
        return pd.read_csv(csv_path, dtype=dtype)
    except Exception as exc:
        raise RuntimeError(f"Could not read required aggregate input {csv_path}: {exc}") from exc


def _comparison_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, str):
        return value.strip()
    return value


def canonicalize_alias_rows(df, alias_map, *, identity_columns, source_name):
    """Canonicalize event aliases and collapse only cross-event duplicates.

    A repeated identity inside the *same* source event is left alone.  UFCStats
    has historical examples where the same bout label was used twice on one
    card; treating every repeated label as an alias duplicate would erase a
    real fight.  Rows are candidates for collapse only when at least two
    distinct source event names map onto the same canonical identity.

    Cross-event rows must be payload-identical after whitespace/NaN
    normalization.  Any disagreement is a hard failure instead of a guess.
    """
    required = {'EVENT', *identity_columns}
    missing = sorted(required - set(df.columns))
    if missing:
        raise KeyError(f"{source_name} is missing required columns: {', '.join(missing)}")

    if not alias_map:
        return df.copy(), {'canonicalizedRows': 0, 'collapsedRows': 0}

    out = df.copy()
    out['EVENT'] = out['EVENT'].fillna('').astype(str).str.strip()
    out['__source_event'] = out['EVENT']
    out['EVENT'] = out['EVENT'].replace(alias_map)
    keys = list(identity_columns)
    if 'EVENT' not in keys:
        keys.insert(0, 'EVENT')
    payload_columns = [
        col for col in out.columns
        if col not in keys and col != '__source_event'
    ]

    drop_indexes = []
    canonicalized_rows = int(out['__source_event'].isin(alias_map).sum())
    grouped = out.groupby(keys, dropna=False, sort=False)
    for identity, group in grouped:
        source_events = set(group['__source_event'])
        if len(source_events) < 2:
            continue

        payloads = {
            tuple(_comparison_value(row[col]) for col in payload_columns)
            for _, row in group.iterrows()
        }
        if len(payloads) != 1:
            differing = {
                col: sorted(
                    {repr(_comparison_value(value)) for value in group[col]},
                )
                for col in payload_columns
                if len({_comparison_value(value) for value in group[col]}) > 1
            }
            raise AggregateConflictError(
                f"{source_name} conflict after event canonicalization at "
                f"{identity!r}; source events={sorted(source_events)!r}; "
                f"differing payload={differing!r}"
            )

        canonical_event = group.iloc[0]['EVENT']
        preferred = group[group['__source_event'] == canonical_event]
        keep_index = preferred.index[0] if not preferred.empty else group.index[0]
        drop_indexes.extend(index for index in group.index if index != keep_index)

    out = out.drop(index=drop_indexes).drop(columns='__source_event').reset_index(drop=True)
    return out, {
        'canonicalizedRows': canonicalized_rows,
        'collapsedRows': len(drop_indexes),
    }


def canonicalize_aggregate_inputs(results_df, details_df, stats_df, alias_map):
    """Apply one event identity policy to all updater aggregate inputs."""
    results, result_summary = canonicalize_alias_rows(
        results_df,
        alias_map,
        identity_columns=('EVENT', 'BOUT'),
        source_name='ufc_fight_results.csv',
    )
    details, detail_summary = canonicalize_alias_rows(
        details_df,
        alias_map,
        identity_columns=('EVENT', 'BOUT'),
        source_name='ufc_fight_details.csv',
    )
    stats, stats_summary = canonicalize_alias_rows(
        stats_df,
        alias_map,
        identity_columns=('EVENT', 'BOUT', 'ROUND', 'FIGHTER'),
        source_name='ufc_fight_stats.csv',
    )
    return results, details, stats, {
        'results': result_summary,
        'details': detail_summary,
        'stats': stats_summary,
    }


# Divisions a bout's WEIGHTCLASS can name, longest first so "Light Heavyweight"
# and "Women's Flyweight" win over the "Heavyweight"/"Flyweight" inside them.
BOUT_DIVISIONS = tuple(sorted((
    'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight', 'Welterweight',
    'Middleweight', 'Light Heavyweight', 'Heavyweight', 'Super Heavyweight',
    "Women's Strawweight", "Women's Flyweight", "Women's Bantamweight",
    "Women's Featherweight", 'Catch Weight', 'Open Weight',
), key=len, reverse=True))


def bout_division(weightclass):
    """The division a single bout was fought at, from ufc_fight_results.csv.

    "UFC Light Heavyweight Title Bout" -> "Light Heavyweight",
    "Ultimate Fighter 19 Middleweight Tournament" -> "Middleweight".
    None when the label names no division ("UFC 2 Tournament",
    "Superfight Championship"); the caller keeps its own fallback then.
    Title words are never part of the result, so a caller deriving title
    status from this label sees exactly what it saw from a division name.
    """
    text = ' '.join(str(weightclass or '').split()).lower()
    for division in BOUT_DIVISIONS:
        if division.lower() in text:
            return division
    return None


# ─── Completed-feed gates ─────────────────────────────────────────────────────
# A refresh that loses rows is not a smaller refresh, it is a wrong one: the
# updater turns a fighter's missing round stats into null rates, and his
# opponents' missing rows into understated absorbed/defence totals, and exits 0.
# These gates run on the canonicalised inputs BEFORE any artifact is written.

# Unified-rules era. Every bout from here on has five-minute rounds and complete
# round-by-round stats for both fighters in the feed. The 21 bouts with no round
# stats and the 48 rounds longer than 5:00 are all 1994-99 cards, so earlier
# events are exempt from the per-round checks rather than allowlisted one by one.
STATS_ERA_START = '2001-01-01'
MAX_ROUND_SECS = 300
MAX_ROUNDS = 5
COMPLETED_OUTCOMES = frozenset({'W/L', 'L/W', 'D/D', 'NC/NC'})
_MAX_LISTED = 25


class FeedIntegrityError(RuntimeError):
    """The completed-fight feed is incomplete, inconsistent or from the future."""


def _bout_fighters(bout):
    parts = re.split(r'\s+vs\.?\s+', str(bout).strip(), maxsplit=1)
    return (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else None


def _round_number(label):
    match = re.search(r'(\d+)', str(label))
    return int(match.group(1)) if match else 0


def _clock_secs(value):
    match = re.fullmatch(r'(\d+):(\d{2})', str(value).strip())
    return int(match.group(1)) * 60 + int(match.group(2)) if match else None


def validate_completed_feed(results_df, stats_df, today, *, era_start=STATS_ERA_START,
                            normalize_name=None):
    """Reject a feed that cannot produce correct fighter statistics.

    results_df must already carry the resolved ISO ``DATE`` per row (None for
    an undated event); both frames must already be alias-canonicalised, so a
    Noche/Fight Night double listing is one bout here. ``today`` is an ISO date.

    ``normalize_name`` is applied to the two names in each BOUT label, so it
    must be whatever was already applied to stats_df['FIGHTER'].

    Every failure is collected and raised together, so one run names the whole
    damage instead of the first symptom. Returns a coverage summary on success.
    """
    today = str(today)
    problems = []

    def note(kind, detail):
        problems.append(f'{kind}: {detail}')

    stats = stats_df.copy()
    for col in ('EVENT', 'BOUT', 'FIGHTER'):
        stats[col] = stats[col].fillna('').astype(str).str.strip()
    rounds_seen = {}
    for event, bout, fighter, label in zip(
        stats['EVENT'], stats['BOUT'], stats['FIGHTER'], stats['ROUND'],
    ):
        rounds_seen.setdefault((event, bout), {}).setdefault(fighter, set()).add(
            _round_number(label))

    era_bouts = 0
    exempt_bouts = 0
    result_keys = set()
    for event, bout, outcome, end_round, clock, event_date in zip(
        results_df['EVENT'].fillna('').astype(str).str.strip(),
        results_df['BOUT'].fillna('').astype(str).str.strip(),
        results_df['OUTCOME'].fillna('').astype(str).str.strip(),
        results_df['ROUND'],
        results_df['TIME'],
        results_df['DATE'],
    ):
        key = (event, bout)
        result_keys.add(key)
        dated = isinstance(event_date, str) and bool(event_date)
        if dated and event_date > today:
            note('future completed result',
                 f'{bout!r} at {event!r} is dated {event_date}, after {today}')
        if not dated or event_date < era_start:
            exempt_bouts += 1
            continue
        era_bouts += 1
        where = f'{bout!r} at {event!r} ({event_date})'
        if outcome not in COMPLETED_OUTCOMES:
            note('unknown outcome', f'{where}: {outcome!r}')
        try:
            last_round = int(float(str(end_round).strip()))
        except ValueError:
            last_round = 0
        if not 1 <= last_round <= MAX_ROUNDS:
            note('invalid round', f'{where}: ROUND={end_round!r}')
            continue
        secs = _clock_secs(clock)
        if secs is None or not 0 < secs <= MAX_ROUND_SECS:
            note('invalid round duration', f'{where}: TIME={clock!r}')
        fighters = _bout_fighters(bout)
        if fighters is None:
            note('unparseable bout', where)
            continue
        if normalize_name is not None:
            fighters = tuple(normalize_name(name) for name in fighters)
        seen = rounds_seen.get(key, {})
        expected_rounds = set(range(1, last_round + 1))
        for fighter in fighters:
            got = seen.get(fighter)
            if not got:
                note('missing round stats', f'{where}: no rows for {fighter!r}')
            elif got != expected_rounds:
                note('incomplete round stats',
                     f'{where}: {fighter!r} has rounds {sorted(got)}, '
                     f'expected 1-{last_round}')
        strangers = sorted(set(seen) - set(fighters))
        if strangers:
            note('stats for a fighter not in the bout', f'{where}: {strangers}')

    # A stat row whose result row is gone means the result was lost, not that
    # the fight never happened. Era is unknown without the result row, so this
    # check is unconditional; the feed has no such rows today.
    orphans = sorted(set(rounds_seen) - result_keys)
    for event, bout in orphans:
        note('round stats without a result', f'{bout!r} at {event!r}')

    if problems:
        shown = '\n  '.join(problems[:_MAX_LISTED])
        more = len(problems) - _MAX_LISTED
        raise FeedIntegrityError(
            f'Completed-fight feed failed {len(problems)} integrity check(s); '
            f'no artifact was written.\n  {shown}'
            + (f'\n  ... and {more} more' if more > 0 else '')
        )
    return {'eraBouts': era_bouts, 'exemptBouts': exempt_bouts}


def validate_record_dates(record_updates, today):
    """No fighter may come out of a refresh with a fight after ``today``."""
    today = str(today)
    bad = sorted(
        f"{name}: lfd={rec.get('lfd')} dsl={rec.get('dsl')}"
        for name, rec in record_updates.items()
        if (rec.get('lfd') and rec['lfd'] > today)
        or (rec.get('dsl') is not None and rec['dsl'] < 0)
    )
    if bad:
        raise FeedIntegrityError(
            f'{len(bad)} fighter record(s) end after {today}; no artifact was '
            'written.\n  ' + '\n  '.join(bad[:_MAX_LISTED]))


def publish_atomically(outputs):
    """Write every artifact or none of them.

    ``outputs`` maps path -> text. Each file is staged next to its target and
    only renamed into place once ALL of them are staged, so a failure while
    staging leaves the previous good artifact set untouched. os.replace is
    atomic per file; the window between renames is a few syscalls rather than
    the minutes of computation that used to sit between two writes.
    """
    staged = []
    try:
        for path, text in outputs.items():
            tmp = f'{path}.staged'
            with open(tmp, 'w', encoding='utf-8') as handle:
                handle.write(text)
            staged.append((tmp, path))
    except BaseException:
        for tmp, _ in staged:
            Path(tmp).unlink(missing_ok=True)
        raise
    for tmp, path in staged:
        os.replace(tmp, path)
