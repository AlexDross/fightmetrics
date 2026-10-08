"""
fighter_profiles.py — physical profile data for update_fighters.py.

Source: Greco1899's ufc_fighter_tott.csv ("tale of the tape"), one row per
ufcstats fighter page: FIGHTER, HEIGHT, WEIGHT, REACH, STANCE, DOB, URL.

Two jobs:
  1. Seed a debuting fighter's age, height, reach and stance (prospectsData.js
     still wins where it has a value).
  2. Backfill the same fields, plus takedown defense, on existing roster rows
     WHERE THEY ARE EMPTY. A stored value is never overwritten: curated data
     and the hand-entered roster both outrank the scrape.

Identity is by name only, and ufcstats has distinct fighters who share one
(two Bruno Silvas, two Jean Silvas, ...). A name that appears more than once
is AMBIGUOUS and contributes nothing -- guessing would put one man's birth date
and reach on another, which is worse than leaving the field empty.

Pure functions, stdlib only, no module-scope I/O, so test_fighter_profiles.py
can exercise everything without the Greco CSVs.
"""

import csv
import json
import re
from datetime import date, datetime

# Fields the backfill may fill. Every one of them is filled ONLY when the
# stored value is missing, null or ''. update_fighters.py's integrity gate
# enforces the same rule on the written roster.
PROFILE_FILL_FIELDS = ('ag', 'ht', 'rh', 'st', 'atd')

_HEIGHT_RE = re.compile(r"^\s*(\d+)'\s*(\d+)\"\s*$")
_INCHES_RE = re.compile(r'^\s*(\d+(?:\.\d+)?)"\s*$')
_WEIGHT_RE = re.compile(r'^\s*(\d+(?:\.\d+)?)\s*lbs\.?\s*$')
_STANCES = {'Orthodox', 'Southpaw', 'Switch', 'Open Stance', 'Sideways'}


def parse_height(value):
    """`6' 1"` -> 73.0. '--', '' and None -> None."""
    m = _HEIGHT_RE.match(str(value or ''))
    if not m:
        return None
    return float(int(m.group(1)) * 12 + int(m.group(2)))


def parse_reach(value):
    """`76"` -> 76.0. '--', '' and None -> None."""
    m = _INCHES_RE.match(str(value or ''))
    return float(m.group(1)) if m else None


def parse_weight(value):
    """`205 lbs.` -> 205. '--' -> None."""
    m = _WEIGHT_RE.match(str(value or ''))
    return int(float(m.group(1))) if m else None


def parse_stance(value):
    s = str(value or '').strip()
    return s if s in _STANCES else None


def parse_dob(value):
    """`Jan 22, 2001` -> '2001-01-22'. Anything else -> None."""
    s = str(value or '').strip()
    try:
        return datetime.strptime(s, '%b %d, %Y').date().isoformat()
    except ValueError:
        return None


def age_on(dob_iso, today):
    if not dob_iso:
        return None
    b = date.fromisoformat(dob_iso)
    return today.year - b.year - ((today.month, today.day) < (b.month, b.day))


def load_tott_profiles(rows, aliases):
    """Map canonical fighter name -> profile dict, dropping ambiguous names.

    rows: iterable of dicts with the tott CSV columns.
    aliases: name_aliases.json (Greco spelling -> canonical roster name).
    Returns (profiles, ambiguous) where ambiguous is the sorted list of
    canonical names that appeared on more than one row.
    """
    seen = {}
    counts = {}
    for row in rows:
        raw = str(row.get('FIGHTER') or '').strip()
        if not raw:
            continue
        name = aliases.get(raw, raw)
        counts[name] = counts.get(name, 0) + 1
        seen[name] = {
            'dob': parse_dob(row.get('DOB')),
            'ht': parse_height(row.get('HEIGHT')),
            'rh': parse_reach(row.get('REACH')),
            'st': parse_stance(row.get('STANCE')),
            'wlb': parse_weight(row.get('WEIGHT')),
            'url': str(row.get('URL') or '').strip() or None,
        }
    ambiguous = sorted(n for n, c in counts.items() if c > 1)
    profiles = {n: p for n, p in seen.items() if counts[n] == 1}
    return profiles, ambiguous


def read_tott_csv(path, aliases):
    with open(path, newline='', encoding='utf-8') as f:
        return load_tott_profiles(csv.DictReader(f), aliases)


def td_defense(opp_td_landed, opp_td_attempted):
    """Share of opponents' takedown attempts stopped; None with no attempts.

    Same construction as sdef (strike defense): 1 - landed / attempted over
    the opponent's per-round rows.
    """
    if not opp_td_attempted:
        return None
    return round(1 - opp_td_landed / opp_td_attempted + 1e-9, 2)


def is_empty(value):
    return value is None or value == ''


def profile_values(profile, atd, today):
    """The candidate value for each fillable field (None = nothing to offer)."""
    profile = profile or {}
    return {
        'ag': age_on(profile.get('dob'), today),
        'ht': profile.get('ht'),
        'rh': profile.get('rh'),
        'st': profile.get('st'),
        'atd': atd,
    }


def fill_updates(current, profile, atd, today):
    """Values to write onto a roster row: only for fields that are empty now.

    current: field name -> stored Python value, for the fields the row has
    (a field the row lacks entirely counts as empty).
    Returns field name -> new Python value; never contains a field whose stored
    value is non-empty, and never contains a None.
    """
    out = {}
    for field, value in profile_values(profile, atd, today).items():
        if value is None:
            continue
        if is_empty(current.get(field)):
            out[field] = value
    return out


def profiles_artifact(profiles, names):
    """The committed fighter_profiles.json: roster names only, sorted keys.

    Deterministic so a re-run over the same CSV is byte-identical.
    """
    body = {
        n: {k: profiles[n][k] for k in ('dob', 'ht', 'rh', 'st', 'wlb', 'url')}
        for n in sorted(set(names)) if n in profiles
    }
    return json.dumps(body, indent=2, sort_keys=True, ensure_ascii=False) + '\n'
