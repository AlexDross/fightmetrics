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

A third undated event, `UFC - Road to UFC 4.6`, matches no other card, so it
cannot be canonicalised. Its date is not guessed either — it is supplied by the
reviewed override table below, sourced from official UFC pages. Any *other*
undated event with no override and no exact twin stays undated, loudly.
"""

from collections import Counter


# ─── Reviewed event-date overrides ────────────────────────────────────────────
# Greco's ufc_event_details.csv omits some cards entirely. Where an authoritative
# UFC source gives the date, it is recorded here — reviewed, attributed, and
# applied ONLY to events the feed leaves undated. This is never a fallback for a
# date the feed already supplies, and never a guess.
#
# UFC - Road to UFC 4.6 — Road to UFC Season 4, Semifinals — 22 August 2025,
# Shanghai. Sources:
#   https://www.ufc.com/event/road-ufc-season-4-semifinals
#   https://www.ufc.com.br/news/road-to-ufc-live-results-season-4-semifinals-shi-vs-brasil-recaps-official-scorecards-interviews-shanghai
EVENT_DATE_OVERRIDES = {
    'UFC - Road to UFC 4.6': '2025-08-22',
}


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


def apply_event_date_overrides(event_dates, overrides=None):
    """
    Fill in reviewed dates for events the feed leaves undated.

    Only ever ADDS a date where there is none — an override can never silently
    contradict a date the feed already supplies. Returns the list of events that
    an override actually resolved, so the caller can report them.
    """
    overrides = EVENT_DATE_OVERRIDES if overrides is None else overrides
    applied = []
    for event, iso in overrides.items():
        if not is_dated(event_dates.get(event)):
            event_dates[event] = iso
            applied.append(event)
    return sorted(applied)


def canonicalize_undated_events(bouts_by_event, event_dates):
    """
    Resolve undated events onto dated ones, but only when it is provably safe.

    An undated event is canonicalised ONLY when its bout MULTISET is exactly
    equal to that of exactly one dated event.

    A multiset, not a set: a set collapses duplicate bout labels, so two cards
    that differ only in how many times a label repeats would compare equal and be
    silently merged. `Counter` equality compares both membership AND
    multiplicity, which is what "complete exact equality" has to mean here.

    Requiring a *unique* match matters too — if two dated events somehow shared a
    bout multiset, picking either would be a guess, so the event stays unresolved.

    Args:
        bouts_by_event: {event_name: Counter(bout_labels)} (a set or list is
                        accepted and converted, so callers cannot get it subtly
                        wrong)
        event_dates:    {event_name: 'YYYY-MM-DD' | None}

    Returns:
        (alias_map, unresolved)
        alias_map:  {undated_event: dated_event} — the caller must DROP the
                    aliased rows, because the dated event already carries the
                    identical bouts. Dating them in place would double-count.
        unresolved: sorted list of undated events with no safe canonical form.
    """
    counts = {e: (b if isinstance(b, Counter) else Counter(b))
              for e, b in bouts_by_event.items()}
    dated = {e for e, d in event_dates.items() if is_dated(d)}
    alias_map = {}
    unresolved = []

    for event in sorted(counts):
        if is_dated(event_dates.get(event)):
            continue  # already dated
        bouts = counts[event]
        if not bouts:
            unresolved.append(event)
            continue
        matches = sorted(d for d in dated if d in counts and counts[d] == bouts)
        if len(matches) == 1:
            alias_map[event] = matches[0]
        else:
            unresolved.append(event)

    return alias_map, sorted(unresolved)
