#!/usr/bin/env python3
"""
fight_event_dates.py — event-date normalisation for the fighter data updater.

Extracted from update_fighters.py so the logic is importable and testable:
importing update_fighters.py executes the whole updater, so its internals cannot
be unit-tested in place.

THE BUG THIS EXISTS TO PREVENT
------------------------------
`results_df['EVENT'].map(event_dates)` yields **NaN** (a float) for any event
missing from ufc_event_details.csv. NaN is *truthy* in Python, so every guard of
the form `x['date'] or ''` and `if f['date']` silently passed it through:

    >>> float('nan') or ''
    nan
    >>> sorted([float('nan'), '2026-01-01'])
    TypeError: '<' not supported between instances of 'str' and 'float'

That TypeError is what broke the Update Fighters workflow. A NaN could also
reach `date.fromisoformat()` and become a fighter's "last fight date".

Simply mapping NaN to None is NOT sufficient. Greco's feed currently carries two
undated events whose complete bout sets are identical to dated events:

    UFC Fight Night: Lopes vs. Silva          == Noche UFC: Lopes vs. Silva
    UFC Fight Night: Grasso vs. Shevchenko 2  == Noche UFC: Grasso vs. Shevchenko 2

They are the same cards under a second name. Keeping both would count 25 fights
twice in every record, streak and history. They are therefore CANONICALISED onto
the dated event and processed exactly once.

A third undated event, `UFC - Road to UFC 4.6`, matches nothing. Its date is NOT
invented: it stays undated, loudly, until an authoritative source is added.
"""


def normalize_date(value):
    """
    Coerce any date cell to `str | None`.

    Everything that is not a non-empty string — NaN, NaT, None, '' — becomes
    None, so no downstream guard has to reason about NaN's truthiness again.
    """
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    return None


def is_dated(value):
    """True only for a usable date string. The gate before `date.fromisoformat`."""
    return isinstance(value, str) and bool(value.strip())


def fight_sort_key(value):
    """
    Sort key that can never mix types.

    Undated fights sort as '' (last, under `reverse=True`) instead of raising
    `'<' not supported between instances of 'float' and 'str'`.
    """
    return value if isinstance(value, str) else ''


def canonicalize_undated_events(bouts_by_event, event_dates):
    """
    Resolve undated events onto dated ones, but only when it is provably safe.

    An undated event is canonicalised ONLY when its **complete** bout set is
    exactly equal to that of exactly one dated event. Exact set equality is the
    whole safeguard: a subset or an overlap could merge two genuinely different
    cards, so anything short of equality is left undated.

    Requiring a *unique* match matters too — if two dated events somehow shared a
    bout set, picking either would be a guess, so the event stays unresolved.

    Args:
        bouts_by_event: {event_name: frozenset(bout_labels)}
        event_dates:    {event_name: 'YYYY-MM-DD' | None}

    Returns:
        (alias_map, unresolved)
        alias_map:  {undated_event: dated_event} — the caller must DROP the
                    aliased rows, because the dated event already carries the
                    identical bouts. Dating them in place would double-count.
        unresolved: sorted list of undated events with no safe canonical form.
    """
    dated = {e for e, d in event_dates.items() if is_dated(d)}
    alias_map = {}
    unresolved = []

    for event in sorted(bouts_by_event):
        if is_dated(event_dates.get(event)):
            continue  # already dated
        bouts = bouts_by_event.get(event) or frozenset()
        if not bouts:
            unresolved.append(event)
            continue
        matches = sorted(
            d for d in dated
            if d in bouts_by_event and bouts_by_event[d] == bouts
        )
        if len(matches) == 1:
            alias_map[event] = matches[0]
        else:
            unresolved.append(event)

    return alias_map, sorted(unresolved)
