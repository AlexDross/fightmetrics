"""
name_splits.py -- separate distinct fighters who share one ufcstats name.

Every Greco1899 input is keyed by the fighter's NAME (the BOUT label
"A vs. B", and the FIGHTER column of the per-round stats). ufcstats has
different men under the same name, so without this their fights fold into one
profile: the roster's "Bruno Silva" (flyweight) carried 11 middleweight fights
of the other Bruno Silva -- record, finishes, minutes, form and Elo all wrong.

name_splits.json lists, per shared name, the exact bouts that belong to the
OTHER fighter, keyed by event + opponent. Those bouts are rewritten to the
split-off name in every input frame before anything is computed, so records,
stats, history and Elo all see two fighters. Weight class is deliberately not
the key: the per-round stats and fight details carry none, and fighters move.

Every listed bout must match in the results feed, or the run fails: a split
that silently stops matching would quietly re-merge the two.

Pure functions, stdlib only (frames are duck-typed pandas DataFrames).
"""

import json
import os

SPLITS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'name_splits.json')


class NameSplitError(RuntimeError):
    pass


def load_name_splits(path=SPLITS_PATH):
    """Return {(event, frozenset({name, opponent})): (name, split_name)}."""
    if not os.path.exists(path):
        return {}
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    index = {}
    for split in data.get('splits', []):
        name, new = split['name'].strip(), split['as'].strip()
        if not name or not new or name == new:
            raise NameSplitError(f'bad split entry: {split!r}')
        for bout in split['bouts']:
            key = (bout['event'].strip(), frozenset((name, bout['opponent'].strip())))
            if key in index:
                raise NameSplitError(f'duplicate split bout: {key!r}')
            index[key] = (name, new)
    return index


def _bout_names(bout):
    if not isinstance(bout, str) or ' vs. ' not in bout:
        return None
    a, b = bout.split(' vs. ', 1)
    return a.strip(), b.strip()


def split_bout_label(event, bout, index):
    """Rewrite one BOUT label. Returns (label, (old, new) | None)."""
    names = _bout_names(bout)
    if names is None or not isinstance(event, str):
        return bout, None
    hit = index.get((event.strip(), frozenset(names)))
    if hit is None:
        return bout, None
    old, new = hit
    a, b = names
    return f"{new if a == old else a} vs. {new if b == old else b}", hit


def apply_name_splits(df, index, *, fighter_column=None):
    """Rewrite BOUT (and the fighter column, if given) in place.

    Returns the set of index keys that matched, so the caller can require
    every split bout to be found.
    """
    matched = set()
    if not index or df is None or 'BOUT' not in df.columns:
        return matched
    for i in df.index:
        event, bout = df.at[i, 'EVENT'], df.at[i, 'BOUT']
        label, hit = split_bout_label(event, bout, index)
        if hit is None:
            continue
        matched.add((event.strip(), frozenset(_bout_names(bout))))
        df.at[i, 'BOUT'] = label
        if fighter_column and isinstance(df.at[i, fighter_column], str) \
                and df.at[i, fighter_column].strip() == hit[0]:
            df.at[i, fighter_column] = hit[1]
    return matched


def require_all_matched(index, matched, source):
    missing = sorted((ev, sorted(names)) for (ev, names) in set(index) - set(matched))
    if missing:
        raise NameSplitError(
            f'{len(missing)} name-split bout(s) not found in {source}: {missing}. '
            'Fix name_splits.json (event or opponent spelling) -- an unmatched '
            'split silently re-merges two fighters.')
