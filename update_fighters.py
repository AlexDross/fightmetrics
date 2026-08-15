"""
FightMetrics — Auto-Update Script v8.0 (FINAL SAFE)
====================================================
Updates records, aggregate fight statistics, fight history, and seeds new
UFC-only fighters when they make their debut. Rankings and rating artifacts are
not touched.

UPDATES:
  fightersData.js  — records plus tr, asl, asp, asa, atl, atp and detail stats
  fightersData.js  — adds new UFC-only entries for debuting fighters
  fightHistory.js  — rebuilt from source CSVs

NEVER TOUCHES (leave for their dedicated generators):
  elo, crd                           — rating/calibration artifacts
  eloModule.js, cardioModule.js       — affect rankings/ratings
  dr, p4p                             — rankings
  tb, ht, rh, st, w, ag              — physical attributes and title provenance

Every quoted field in the generated modules is read through js_roster_parser,
which is the one grammar for these files. Identity and division were previously
matched by two separate `[^']` patterns that both truncated at the backslash of
an escaped apostrophe, so apostrophe-named fighters silently stopped receiving
updates and "Women's ..." divisions shipped as the literal string "Women\\".
"""

import pandas as pd
import re, os, json
from datetime import datetime, date, timedelta

from collections import Counter

from fight_event_dates import (
    apply_event_date_overrides, canonicalize_undated_events, fight_sort_key,
    is_dated, normalize_date,
)
from fight_data_integrity import canonicalize_aggregate_inputs, load_required_csv
# CORRECTION 6A. One strict parser owns historical division/title semantics.
# ufc_fight_details.csv is EVENT,BOUT,URL, so detail_lookup never carried a
# WEIGHTCLASS; history fell back to the fighter's CURRENT roster division and
# title status collapsed to an event-name heuristic. The raw bout-local label
# on each ufc_fight_results.csv row is the only authoritative source.
from fight_weightclass import parse_weightclass, validate_bout_metadata
# ONE grammar reads every quoted field in the generated modules. Identity and
# division used to be matched by two separate `[^']` patterns, and both stopped
# at the backslash of an escaped apostrophe: `n:'Sean O\'Malley'` decoded to
# "Sean O\" and `w:'Women\'s Flyweight'` to "Women\". See js_roster_parser.
from js_roster_parser import (
    JsParseError, append_object_field, format_js_literal, js_escape,
    parse_object_fields, parse_prospect_fallbacks, parse_roster,
    patch_object_fields,
)

SRC          = os.path.dirname(os.path.abspath(__file__))
JS_PATH      = os.path.join(SRC, 'src', 'fightersData.js')
FH_PATH      = os.path.join(SRC, 'src', 'fightHistory.js')
PROSPECT_PATH = os.path.join(SRC, 'src', 'prospectsData.js')
NAME_ALIASES_PATH = os.path.join(SRC, 'name_aliases.json')

# Greco1899's source CSVs spell some fighters differently than our authoritative
# roster (src/fightersData.js) — e.g. "Zach Reese" vs "Zachary Reese". Without
# normalization, a raw CSV name becomes its own dict key/lookup miss on every
# rebuild, silently breaking fight-history lookups and record-field sync for
# that fighter (even after a one-off manual fix, since the next scheduled CI
# run re-downloads the same Greco spelling and reintroduces it). Add an entry
# here — keyed by the raw/Greco spelling, valued with the canonical
# fightersData.js name — whenever this pattern recurs.
try:
    with open(NAME_ALIASES_PATH) as _f:
        NAME_ALIASES = json.load(_f)
except FileNotFoundError:
    NAME_ALIASES = {}

def normalize_name(name):
    if not isinstance(name, str):
        return name
    name = name.strip()
    return NAME_ALIASES.get(name, name)

WEIGHT_LIMITS = {
    'Flyweight': 125,
    'Bantamweight': 135,
    'Featherweight': 145,
    'Lightweight': 155,
    'Welterweight': 170,
    'Middleweight': 185,
    'Light Heavyweight': 205,
    'Heavyweight': 265,
    "Women's Strawweight": 115,
    "Women's Flyweight": 125,
    "Women's Bantamweight": 135,
    "Women's Featherweight": 145,
}

ASOF_ENV = 'FIGHTMETRICS_ASOF'
_ASOF_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')


def resolve_asof():
    """The generation as-of date. REQUIRED, exact YYYY-MM-DD, real calendar day.

    `dsl` is (as-of - last fight date), so an unpinned clock rewrites ~2,198
    roster records on every run and buries a correction's real diff in churn.
    Requiring the date makes each regeneration reproducible and lets a review
    assert an exact changed-field set.

    date.fromisoformat alone is not enough: it accepts basic-ISO forms such as
    '20260813', so the shape is checked first, then the value must round-trip.
    """
    raw = os.environ.get(ASOF_ENV)
    if not raw:
        raise SystemExit(
            f'{ASOF_ENV} is required (exact YYYY-MM-DD). Refusing to generate '
            f'against an unpinned clock.')
    if not _ASOF_RE.match(raw):
        raise SystemExit(f'{ASOF_ENV} must be exactly YYYY-MM-DD, got {raw!r}')
    try:
        parsed = date.fromisoformat(raw)
    except ValueError as exc:
        raise SystemExit(f'{ASOF_ENV}={raw!r} is not a real calendar date: {exc}')
    if parsed.isoformat() != raw:
        raise SystemExit(f'{ASOF_ENV}={raw!r} is not canonical')
    return parsed


def parse_date(s):
    if not isinstance(s, str): return None
    try: return datetime.strptime(s.strip(), '%B %d, %Y').strftime('%Y-%m-%d')
    except: return None

def split_bout(bout):
    parts = re.split(r'\s+vs\.?\s+', str(bout).strip(), maxsplit=1)
    return (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else (None, None)

def compute_streak(fights):
    ws = ls = 0
    for f in fights:
        r = f['result']
        if ws == 0 and ls == 0:
            if r == 'W': ws = 1
            elif r == 'L': ls = 1
        elif ws > 0:
            if r == 'W': ws += 1
            else: break
        elif ls > 0:
            if r == 'L': ls += 1
            else: break
    return ws, ls

# The writer and the reader are one pair: fmt/js_escape emit what
# js_roster_parser decodes, so a change to either side is caught by the
# seeding round-trip test rather than by a fighter silently disappearing.
fmt = format_js_literal

# CORRECTION 6A retired `clean_wc`. It stripped the bare words UFC/Title/Bout/
# Interim anywhere in a label, which destroyed interim status
# ('UFC Interim Heavyweight Title Bout' -> 'Heavyweight') and mangled tournament
# labels ('UFC 17 Middleweight Tournament Title Bout' -> '17 Middleweight
# Tournament'). Every division/title decision now goes through
# fight_weightclass.parse_weightclass.

def parse_of_stat(s):
    if not isinstance(s, str):
        return (0, 0)
    m = re.match(r'\s*(\d+)\s+of\s+(\d+)\s*', s)
    if not m:
        return (0, 0)
    return (int(m.group(1)), int(m.group(2)))

def parse_ctrl(s):
    if not isinstance(s, str):
        return 0
    m = re.match(r'(\d+):(\d+)', s.strip())
    return int(m.group(1)) * 60 + int(m.group(2)) if m else 0

def parse_round_label(s):
    if not isinstance(s, str):
        return 0
    m = re.search(r'(\d+)', s)
    return int(m.group(1)) if m else 0

def parse_time_secs(s):
    if not isinstance(s, str):
        return None
    m = re.match(r'(\d+):(\d+)', s.strip())
    if not m:
        return None
    return int(m.group(1)) * 60 + int(m.group(2))

def parse_int_like(v, default=0):
    try:
        return int(float(str(v).strip()))
    except:
        return default

def load_prospect_fallbacks():
    """Read src/prospectsData.js through the same fail-closed path as the roster.

    OPTIONAL ONLY IN THE SENSE OF TRUE FILE ABSENCE. src/prospectsData.js is
    tracked, so every checkout and every CI run has it; a stripped tree that
    genuinely lacks the file simply seeds debuting fighters without
    physical-attribute fallbacks, which is the long-standing behaviour.

    A file that EXISTS but does not parse is a hard failure. There is no
    `except JsParseError` here on purpose: converting a malformed prospect file
    into an empty dict — or skipping an object with no decodable identity, or
    letting a duplicate name overwrite another — is precisely the silent
    data loss this correction removes, and the prospect file is the half of the
    read path that just widened from 4 visible entries to 12.
    """
    if not os.path.exists(PROSPECT_PATH):
        print(f"  ⚠️  {PROSPECT_PATH} not found — seeding without prospect fallbacks")
        return {}
    fallbacks = parse_prospect_fallbacks(open(PROSPECT_PATH).read())
    print(f"  Parsed {len(fallbacks)} prospect fallback entries")
    return fallbacks

# ─── Load CSVs ────────────────────────────────────────────────────────────────
print("Loading CSVs...")
results_df = load_required_csv(os.path.join(SRC, 'ufc_fight_results.csv'))
events_df  = load_required_csv(os.path.join(SRC, 'ufc_event_details.csv'))
details_df = load_required_csv(os.path.join(SRC, 'ufc_fight_details.csv'))
stats_df   = load_required_csv(os.path.join(SRC, 'ufc_fight_stats.csv'))
has_details = True
has_stats = True

details_df['EVENT'] = details_df['EVENT'].str.strip()
details_df['BOUT']  = details_df['BOUT'].str.strip()
stats_df['EVENT'] = stats_df['EVENT'].str.strip()
stats_df['BOUT'] = stats_df['BOUT'].str.strip()
stats_df['FIGHTER'] = stats_df['FIGHTER'].str.strip().map(normalize_name)

prospect_fallbacks = load_prospect_fallbacks()

event_dates = dict(zip(events_df['EVENT'].str.strip(), events_df['DATE'].apply(parse_date)))
results_df['EVENT'] = results_df['EVENT'].str.strip()
results_df['BOUT']  = results_df['BOUT'].str.strip() if 'BOUT' in results_df.columns else ''

# CORRECTION 6A / R10 — fail closed on the RAW feed, before canonicalisation and
# before any artifact is written. Every result row must carry a URL (the
# canonical bout identity: 8,847 rows resolve to 8,822 URLs, and the 25
# duplicate groups are exactly the event aliases), every label must parse, and
# rows sharing a URL may repeat only if their parsed (division, championship,
# interim, tournament_final) tuples agree. Deliberately BEFORE
# canonicalize_aggregate_inputs: that step collapses the alias duplicates, so
# running afterwards would validate 8,822 rows that are unique by construction
# and never exercise the conflict check at all. One shared implementation with
# scripts/gate_closed_labels.py.
_bout_meta_summary = validate_bout_metadata(
    zip(results_df.get('URL', pd.Series(dtype=object)), results_df['WEIGHTCLASS']))
print(f"  Bout-metadata gate: {_bout_meta_summary['url_count']} bouts from "
      f"{_bout_meta_summary['row_count']} raw rows; "
      f"{_bout_meta_summary['duplicate_groups']} duplicate-URL groups "
      f"({_bout_meta_summary['duplicate_rows']} repeat rows), "
      f"{_bout_meta_summary['conflicts']} conflicts")

# ─── Undated events ───────────────────────────────────────────────────────────
# Some events in ufc_fight_results.csv have no row in ufc_event_details.csv, so
# .map() would leave NaN — a float that is TRUTHY, which is how it slipped past
# every `or ''` / `if date` guard and crashed the sort with
# "'<' not supported between instances of 'float' and 'str'".
#
# Two of them are the same cards under a second name (Greco lists the Noche UFC
# cards a second time as "UFC Fight Night: ..."), so they are canonicalised onto
# the dated event and their duplicate rows dropped — dating them in place would
# count those fights twice in every record, streak and history.
# Reviewed, attributed dates for cards the feed omits entirely (see
# fight_event_dates.EVENT_DATE_OVERRIDES). Applied BEFORE canonicalisation so an
# overridden card is simply dated, never aliased onto another event.
for _ev in apply_event_date_overrides(event_dates):
    print(f"  ✔ applied reviewed date override for {_ev!r} → {event_dates[_ev]}")

# Counter, not frozenset: a set collapses duplicate bout labels, so multiplicity
# would be ignored and two different cards could compare equal.
_bouts_by_event = {
    ev: Counter(grp['BOUT'].dropna().astype(str))
    for ev, grp in results_df.groupby('EVENT')
}
_alias_map, _unresolved_undated = canonicalize_undated_events(_bouts_by_event, event_dates)

if _alias_map:
    for _alias, _canon in sorted(_alias_map.items()):
        print(f"  ↪ canonicalised undated event {_alias!r} → {_canon!r} "
              f"(identical {sum(_bouts_by_event[_alias].values())}-bout card)")

# One alias policy must govern every aggregate input.  Canonicalising only the
# result rows leaves duplicate per-round stats behind, inflating ASL/ASP/ASA/
# ATL/ATP and every downstream detail aggregate.  Exact cross-event duplicates
# collapse; any payload disagreement is a hard failure.
results_df, details_df, stats_df, _canonical_summary = canonicalize_aggregate_inputs(
    results_df, details_df, stats_df, _alias_map,
)
for _source, _summary in _canonical_summary.items():
    if _summary['canonicalizedRows'] or _summary['collapsedRows']:
        print(
            f"  {_source}: canonicalised {_summary['canonicalizedRows']} alias rows; "
            f"collapsed {_summary['collapsedRows']} exact duplicates"
        )

# Never fabricate a date. An event with no safe canonical form stays undated and
# says so loudly; its fights still count toward records, but can never become a
# fighter's last-fight date.
for _ev in _unresolved_undated:
    print(f"  ⚠️  WARNING: event {_ev!r} has NO mapped date and no matching dated "
          f"card ({sum(_bouts_by_event.get(_ev, Counter()).values())} bouts). Its fights are kept "
          f"as UNDATED — they cannot set a last-fight date or appear in "
          f"fightHistory. Add an authoritative date source to resolve this.")

# Normalise to `str | None` BEFORE any fight record is built, so NaN can never
# reach a sort key or date.fromisoformat().
results_df['DATE'] = results_df['EVENT'].map(event_dates).map(normalize_date)

detail_lookup = {}
if has_details:
    for _, row in details_df.iterrows():
        key = (str(row.get('BOUT','')).strip(), str(row.get('EVENT','')).strip())
        try: rn = int(float(str(row.get('ROUND','0')).strip()))
        except: rn = 0
        ti  = str(row.get('TIME','5:00')).strip() or '5:00'
        wc  = str(row.get('WEIGHTCLASS','') or row.get('WEIGHT CLASS','') or '').strip()
        detail_lookup[key] = {'rn': rn, 'ti': ti, 'wc': wc}

res_cols  = results_df.columns.tolist()
has_round = 'ROUND' in res_cols
has_time  = 'TIME'  in res_cols
print(f"  Results: {len(results_df)} rows")


# ─── Build fight records ───────────────────────────────────────────────────────
print("Building fight records...")
fights_by_fighter = {}

for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT',''))
    if fa is None: continue
    fa, fb = normalize_name(fa), normalize_name(fb)
    outcome  = str(row.get('OUTCOME','')).strip()
    winner   = fa if outcome == 'W/L' else (fb if outcome == 'L/W' else None)
    method   = str(row.get('METHOD','')).strip()
    event    = str(row.get('EVENT','')).strip()
    dt       = row['DATE']
    bout_key = (str(row.get('BOUT','')).strip(), event)
    detail   = detail_lookup.get(bout_key, {})
    rn = detail.get('rn', 0)
    ti = detail.get('ti', '5:00')
    wc = detail.get('wc', '')
    if has_round:
        try: rn = int(float(str(row.get('ROUND','0')).strip()))
        except: pass
    if has_time:
        ti = str(row.get('TIME','5:00')).strip() or '5:00'

    # CORRECTION 6A. The bout's division and title status come off THIS result
    # row and are parsed ONCE, then shared by both corners. That is what makes
    # the two copies of a bout structurally identical rather than merely
    # usually equal — main disagreed with itself on 2,861 of 8,822 bouts because
    # each corner was stamped with its own fighter's roster division.
    #
    # Deliberately NOT a (EVENT, BOUT) join: that key is non-unique. Kazushi
    # Sakuraba vs Marcus Silveira appears twice at UFC Ultimate Japan (the
    # bracket opener, overturned to a No Contest, and the final), and a join
    # would collapse them and misattribute one bout's metadata to the other.
    _wc_meta = parse_weightclass(row.get('WEIGHTCLASS'))

    for fighter, opponent in [(fa, fb), (fb, fa)]:
        res = 'NC' if winner is None else ('W' if fighter == winner else 'L')
        fights_by_fighter.setdefault(fighter, []).append({
            'result': res, 'date': dt, 'method': method.upper(),
            'method_d': method, 'opponent': opponent,
            'event': event, 'rn': rn, 'ti': ti, 'wc': wc,
            'wc_division': _wc_meta['division'],
            'wc_championship': _wc_meta['championship'],
            'wc_interim': _wc_meta['interim'],
            'wc_tournament_final': _wc_meta['tournament_final'],
            'wc_category': _wc_meta['category'],
            'wc_raw': _wc_meta['raw'],
        })

for n in fights_by_fighter:
    # fight_sort_key, not `or ''`: NaN is truthy, so `or ''` returned NaN and
    # the comparison raised TypeError. Undated fights sort last.
    fights_by_fighter[n].sort(key=lambda x: fight_sort_key(x['date']), reverse=True)

# ─── Compute record updates ────────────────────────────────────────────────────
print("Computing record stats...")
TODAY = resolve_asof()
record_updates = {}
for name, fights in fights_by_fighter.items():
    wi  = sum(1 for f in fights if f['result'] == 'W')
    lo  = sum(1 for f in fights if f['result'] == 'L')
    ws, ls = compute_streak(fights)
    # is_dated(), not truthiness: an undated fight must never become a
    # fighter's last-fight date, and NaN must never reach date.fromisoformat.
    dated = [f for f in fights if f['result'] in ('W','L','NC') and is_dated(f['date'])]
    lfd = dated[0]['date'] if dated else None
    dsl = (TODAY - date.fromisoformat(lfd)).days if is_dated(lfd) else None
    kow = sum(1 for f in fights if f['result']=='W' and any(x in f['method'] for x in ['KO','TKO']))
    sbw = sum(1 for f in fights if f['result']=='W' and 'SUB' in f['method'])
    dcw = sum(1 for f in fights if f['result']=='W' and 'DEC' in f['method'])
    record_updates[name] = dict(wi=wi, lo=lo, ws=ws, ls=ls,
                                lfd=lfd, dsl=dsl, kow=kow, sbw=sbw, dcw=dcw)

result_lookup = {}
for _, row in results_df.iterrows():
    event = str(row.get('EVENT', '')).strip()
    bout = str(row.get('BOUT', '')).strip()
    try:
        end_round = int(float(str(row.get('ROUND', '0')).strip()))
    except:
        end_round = 0
    time_secs = parse_time_secs(row.get('TIME', ''))
    result_lookup[(event, bout)] = {
        'end_round': end_round,
        'time_secs': time_secs,
    }

stats_by_fighter = {}
if has_stats:
    for _, row in stats_df.iterrows():
        fighter = str(row.get('FIGHTER', '')).strip()
        if not fighter:
            continue
        event = str(row.get('EVENT', '')).strip()
        bout = str(row.get('BOUT', '')).strip()
        round_num = parse_round_label(row.get('ROUND', ''))
        if round_num <= 0:
            continue
        bout_meta = result_lookup.get((event, bout), {})
        end_round = bout_meta.get('end_round') or 0
        time_secs = bout_meta.get('time_secs')
        round_secs = time_secs if end_round and round_num == end_round and time_secs else 300
        sig_landed, sig_attempted = parse_of_stat(row.get('SIG.STR.', ''))
        td_landed, td_attempted = parse_of_stat(row.get('TD', ''))
        head_landed, _ = parse_of_stat(row.get('HEAD', ''))
        body_landed, _ = parse_of_stat(row.get('BODY', ''))
        leg_landed, _  = parse_of_stat(row.get('LEG', ''))
        _kd = str(row.get('KD', '0') or '0').strip()
        stats_by_fighter.setdefault(fighter, []).append({
            'event': event,
            'bout': bout,
            'round_num': round_num,
            'round_secs': round_secs,
            'sig_landed': sig_landed,
            'sig_attempted': sig_attempted,
            'td_landed': td_landed,
            'td_attempted': td_attempted,
            'sub_att': parse_int_like(row.get('SUB.ATT', '0')),
            'ctrl_sec': parse_ctrl(row.get('CTRL', '0:00')),
            'kd': int(float(_kd)) if _kd and _kd.lower() != 'nan' else 0,
            'head_landed': head_landed,
            'body_landed': body_landed,
            'leg_landed': leg_landed,
        })

stats_by_bout = {}
if has_stats:
    for _fighter_name, _rows in stats_by_fighter.items():
        for _r in _rows:
            _key = (_r['event'], _r['bout'], _r['round_num'])
            stats_by_bout.setdefault(_key, []).append((_fighter_name, _r))

def compute_total_rounds(fights):
    total = 0
    for fight in fights:
        if not fight.get('date'):
            continue
        rn = fight.get('rn') or 0
        if rn > 0:
            total += rn
    return total

def _contested_dated(fights):
    """Bouts that reach fightHistory: dated, and W/L/NC (a draw stores as NC)."""
    return [f for f in fights
            if is_dated(f.get('date')) and f['result'] in ('W', 'L', 'NC')]


def latest_dated_division(fights):
    """Parsed bout-local division of the fighter's most recent contested bout.

    `fights` arrives sorted by fight_sort_key descending, so this is recency —
    not row order, not the last-appended stats row. Returns None when the
    fighter has no dated contested bout, which the caller treats as fatal.
    """
    for fight in _contested_dated(fights):
        division = fight.get('wc_division')
        if division:
            return division
    return None


def count_championship_bouts(fights):
    """UFC championship appearances among contested, dated bouts.

    Parsed facts only: undisputed, interim and legacy Superfight championships.
    TUF / Road to UFC / early-bracket finals are tournament finals, not
    championships. This replaces the event-name substring heuristic, which
    matched one card in the entire feed. Existing roster `tb` values are NOT
    touched by this — full reconciliation is Correction 6B.
    """
    return sum(1 for f in _contested_dated(fights) if f.get('wc_championship'))


def round2(v):
    return round(v + 1e-9, 2)

def compute_opponent_stats(name):
    rows = stats_by_fighter.get(name, [])
    total_duration = sum(r['round_secs'] for r in rows)
    opp_sig_landed = 0
    opp_sig_attempted = 0
    for r in rows:
        key = (r['event'], r['bout'], r['round_num'])
        for opp_name, opp_row in stats_by_bout.get(key, []):
            if opp_name != name:
                opp_sig_landed += opp_row['sig_landed']
                opp_sig_attempted += opp_row['sig_attempted']
    sapm = round2(opp_sig_landed / (total_duration / 60)) if total_duration > 0 else None
    sdef = round2(1 - opp_sig_landed / opp_sig_attempted) if opp_sig_attempted > 0 else None
    return sapm, sdef

def build_new_fighter_entry(name, record, fights):
    rows = stats_by_fighter.get(name, [])
    fallback = prospect_fallbacks.get(name, {})
    total_duration = sum(r['round_secs'] for r in rows)
    total_sig_landed = sum(r['sig_landed'] for r in rows)
    total_sig_attempted = sum(r['sig_attempted'] for r in rows)
    total_td_landed = sum(r['td_landed'] for r in rows)
    total_td_attempted = sum(r['td_attempted'] for r in rows)
    total_sub_att = sum(r['sub_att'] for r in rows)
    total_ctrl = sum(r['ctrl_sec'] for r in rows)
    total_kd = sum(r['kd'] for r in rows)
    total_head_landed = sum(r['head_landed'] for r in rows)
    total_leg_landed = sum(r['leg_landed'] for r in rows)
    n_fights_stats = len(set((r['event'], r['bout']) for r in rows))

    # CORRECTION 6A. A newcomer's seeded division is derived deterministically
    # from bout-local metadata, in one documented precedence:
    #   1. the reviewed prospect fallback in src/prospectsData.js, when present
    #   2. the parsed division of the fighter's LATEST DATED contested bout
    #   3. fail closed
    # `fights` is sorted by fight_sort_key descending before this runs, so (2)
    # is the latest bout and never depends on row order. The retired paths were
    # clean_wc(detail_lookup wc) — always '' — and rows[-1]['weight_class'],
    # the last-appended per-round STATS row, which is ordering-dependent and
    # unrelated to recency.
    weight_class = fallback.get('w')
    if not weight_class:
        weight_class = latest_dated_division(fights)
    if not weight_class:
        raise JsParseError(
            f'{name!r}: cannot seed a division — no prospect fallback and no '
            f'dated contested bout with a parsed division')

    asl = round2(total_sig_landed / (total_duration / 60)) if total_duration > 0 else None
    asp = round2(total_sig_landed / total_sig_attempted) if total_sig_attempted > 0 else None
    asa = round2((total_sub_att / total_duration) * 900) if total_duration > 0 else None
    atl = round2((total_td_landed / total_duration) * 900) if total_duration > 0 else None
    atp = round2(total_td_landed / total_td_attempted) if total_td_attempted > 0 else None
    sapm_val, sdef_val = compute_opponent_stats(name)
    kd_val = total_kd if rows else None
    ctrl_val = round2(total_ctrl / n_fights_stats) if n_fights_stats > 0 else None
    hdpct_val = round2(total_head_landed / total_sig_landed) if total_sig_landed > 0 else None
    lgpct_val = round2(total_leg_landed / total_sig_landed) if total_sig_landed > 0 else None

    entry = (
        "{"
        f"n:'{js_escape(name)}',"
        f"w:{fmt(weight_class)},"
        f"ag:{fmt(fallback.get('ag'))},"
        f"ht:{fmt(fallback.get('ht'))},"
        f"rh:{fmt(fallback.get('rh'))},"
        f"st:{fmt(fallback.get('st') or '')},"
        f"wi:{record['wi']},lo:{record['lo']},ws:{record['ws']},ls:{record['ls']},"
        f"tr:{compute_total_rounds(fights)},tb:{count_championship_bouts(fights)},"
        f"kow:{record['kow']},sbw:{record['sbw']},dcw:{record['dcw']},"
        f"asl:{fmt(asl)},asp:{fmt(asp)},asa:{fmt(asa)},atl:{fmt(atl)},atp:{fmt(atp)},"
        f"kd:{fmt(kd_val)},sapm:{fmt(sapm_val)},sdef:{fmt(sdef_val)},ctrl:{fmt(ctrl_val)},hdpct:{fmt(hdpct_val)},lgpct:{fmt(lgpct_val)},"
        f"elo:null,crd:1.0,"
        f"lfd:{fmt(record['lfd'])},dsl:{fmt(record['dsl'])},"
        f"dr:null,p4p:null,wlb:{fmt(fallback.get('wlb') or WEIGHT_LIMITS.get(weight_class))}"
        "}"
    )
    return entry

def compute_stat_updates(name, fights):
    rows = stats_by_fighter.get(name, [])
    total_duration = sum(r['round_secs'] for r in rows)
    total_sig_landed = sum(r['sig_landed'] for r in rows)
    total_sig_attempted = sum(r['sig_attempted'] for r in rows)
    total_td_landed = sum(r['td_landed'] for r in rows)
    total_td_attempted = sum(r['td_attempted'] for r in rows)
    total_sub_att = sum(r['sub_att'] for r in rows)
    total_ctrl = sum(r['ctrl_sec'] for r in rows)
    total_kd = sum(r['kd'] for r in rows)
    total_head_landed = sum(r['head_landed'] for r in rows)
    total_leg_landed = sum(r['leg_landed'] for r in rows)
    n_fights_stats = len(set((r['event'], r['bout']) for r in rows))
    sapm, sdef = compute_opponent_stats(name)
    # No 'tb' here, deliberately. ufc_fight_details.csv is EVENT,BOUT,URL, so
    # detail_lookup reads no WEIGHTCLASS and every fight record carries wc:''.
    # A recomputed title-bout count therefore collapses to an event-NAME
    # heuristic that matches one card in the entire 8,847-bout feed
    # ("UFC 18: The Road to the Heavyweight Title"), which would have rewritten
    # Sean O'Malley's stored tb:4 to 0 the moment the identity parser was
    # repaired. Declining to recompute is the honest behaviour while no
    # bout-level source is wired in. Deriving tb from the raw WEIGHTCLASS
    # column of ufc_fight_results.csv — the only authoritative source for
    # historical division and title provenance — is CORRECTION 6, not this one.
    return {
        'tr': compute_total_rounds(fights),
        'asl': round2(total_sig_landed / (total_duration / 60)) if total_duration > 0 else None,
        'asp': round2(total_sig_landed / total_sig_attempted) if total_sig_attempted > 0 else None,
        'asa': round2((total_sub_att / total_duration) * 900) if total_duration > 0 else None,
        'atl': round2((total_td_landed / total_duration) * 900) if total_duration > 0 else None,
        'atp': round2(total_td_landed / total_td_attempted) if total_td_attempted > 0 else None,
        'kd': total_kd if rows else None,
        'sapm': sapm,
        'sdef': sdef,
        'ctrl': round2(total_ctrl / n_fights_stats) if n_fights_stats > 0 else None,
        'hdpct': round2(total_head_landed / total_sig_landed) if total_sig_landed > 0 else None,
        'lgpct': round2(total_leg_landed / total_sig_landed) if total_sig_landed > 0 else None,
    }

# ─── Patch fightersData.js ────────────────────────────────────────────────────
print("\nPatching fightersData.js...")
js_content = open(JS_PATH).read()

# One parse, one grammar. `existing` is keyed by the DECODED identity, so
# "Sean O'Malley" now joins the CSV-derived record_updates key instead of
# sitting under the truncated "Sean O\" and never being updated again.
roster = parse_roster(js_content, '_D2')
existing = {entry.name: entry.raw for entry in roster.entries}
if len(existing) != roster.object_count:
    raise JsParseError(
        f'{roster.object_count} roster objects collapsed into {len(existing)} identities')
pristine_entries = {entry.name: entry for entry in roster.entries}
print(f"  Parsed {roster.object_count} roster entries")

# CORRECTION 6A removed `wc_lookup`. It existed only to answer "what division
# was this historical bout at?" with the fighter's CURRENT roster division,
# which is the defect this correction repairs. fightHistory now reads the raw
# bout-local WEIGHTCLASS instead, so nothing consumes a roster-division lookup
# and keeping one would invite the fallback back in.

RECORD_FIELDS = ['wi','lo','ws','ls','kow','sbw','dcw','dsl']
# 'tb' is NOT here. See the comment in compute_stat_updates: with wc:'' on every
# fight record a recomputed tb is an event-name heuristic, and repairing the
# identity parser without this removal would have overwritten Sean O'Malley's
# stored tb:4 with 0. Authoritative title provenance is correction 6.
STAT_FIELDS = ['tr', 'asl', 'asp', 'asa', 'atl', 'atp', 'kd', 'sapm', 'sdef', 'ctrl', 'hdpct', 'lgpct']
# Fields whose stored value this updater must never rewrite, enforced below
# regardless of what STAT_FIELDS happens to contain.
PRESERVED_FIELDS = ('tb',)
assert not (set(STAT_FIELDS) & set(PRESERVED_FIELDS)), \
    'a preserved field must not also be recomputed'

_NEW_FIELDS = ['kd', 'sapm', 'sdef', 'ctrl', 'hdpct', 'lgpct']
for _name in list(existing):
    _entry = existing[_name]
    _present = parse_object_fields(_entry)
    for _f in _NEW_FIELDS:
        if _f not in _present:
            _entry = append_object_field(_entry, _f, 'null')
    existing[_name] = _entry

# Every field the updater is allowed to move. Anything outside this set must
# come out of the run byte-identical to what went in.
PATCHED_FIELDS = frozenset(RECORD_FIELDS) | frozenset(STAT_FIELDS) | frozenset(_NEW_FIELDS) | {'lfd'}

new_lines = []

for name, entry_str in existing.items():
    if name in record_updates:
        u = record_updates[name]
        stat_updates = compute_stat_updates(name, fights_by_fighter.get(name, []))
        updates = {field: fmt(u[field]) for field in RECORD_FIELDS}
        updates.update({field: fmt(stat_updates[field]) for field in STAT_FIELDS})
        if u['lfd']:
            updates['lfd'] = fmt(u['lfd'])
        # Targeted splice by field offset — the raw entry string is preserved
        # and only the named fields are replaced. The roster is never
        # deserialised and re-serialised.
        entry_str = patch_object_fields(entry_str, updates)
        existing[name] = entry_str
    new_lines.append(f"  {entry_str}")

new_count = 0
seeded_names = []
for name, record in sorted(record_updates.items()):
    if name in existing:
        continue
    fights = fights_by_fighter.get(name, [])
    has_ufc_appearance = any(f.get('date') for f in fights)
    ufc_result_fights = sum(1 for f in fights if f['result'] in ('W', 'L'))
    is_known_prospect = name in prospect_fallbacks and has_ufc_appearance
    recent_cutoff = (TODAY - timedelta(days=180)).isoformat()
    is_recent_newcomer = (
        has_ufc_appearance and
        ufc_result_fights <= 1 and
        record.get('lfd') is not None and
        record['lfd'] >= recent_cutoff
    )
    if not (is_known_prospect or is_recent_newcomer):
        continue
    entry_str = build_new_fighter_entry(name, record, fights)
    new_lines.append(f"  {entry_str}")
    seeded_names.append(name)
    new_count += 1

new_js = "export const _D2 = [\n" + ",\n".join(new_lines) + "\n];\n"

# ─── Pre-write integrity gate ─────────────────────────────────────────────────
# The defect this correction repairs was silent: a fighter stopped being seen by
# the parser and simply never changed again. These assertions make the same
# class of failure loud, and they run BEFORE the roster is written, so a bad
# parse aborts instead of shipping.
for _name, _patched in existing.items():
    _before = pristine_entries[_name].fields
    _after = parse_object_fields(_patched)
    _expected_keys = list(_before) + [f for f in _NEW_FIELDS if f not in _before]
    if list(_after) != _expected_keys:
        raise JsParseError(
            f'{_name!r}: field set changed from {list(_before)} to {list(_after)}')
    for _key, _field in _before.items():
        if _key in PATCHED_FIELDS:
            continue
        if _after[_key].raw != _field.raw:
            raise JsParseError(
                f'{_name!r}: untouched field {_key} moved '
                f'{_field.raw} -> {_after[_key].raw}')
    for _key in PRESERVED_FIELDS:
        if _key in _before and _after[_key].raw != _before[_key].raw:
            raise JsParseError(
                f'{_name!r}: preserved field {_key} moved '
                f'{_before[_key].raw} -> {_after[_key].raw}')

_written = parse_roster(new_js, '_D2')
_expected_names = list(pristine_entries) + seeded_names
if _written.names != _expected_names:
    _lost = sorted(set(_expected_names) - set(_written.names))
    _gained = sorted(set(_written.names) - set(_expected_names))
    raise JsParseError(
        f'roster identity set changed: lost {_lost}, unexpectedly added {_gained}')
print(f"  Identity gate: {len(pristine_entries)} existing identities preserved, "
      f"{len(seeded_names)} seeded")

with open(JS_PATH, 'w') as f:
    f.write(new_js)
print(f"  Patched {len(new_lines)} fighters")
print(f"  Added {new_count} new UFC fighters")

# ─── Rebuild fightHistory.js from source CSVs ─────────────────────────────────
print("\nRebuilding fightHistory.js from source CSVs...")
rebuilt_history = {}

for fighter_name, fights in fights_by_fighter.items():
    entries = []
    for fight in fights:
        fight_dt = fight.get('date')
        # Undated fights are excluded from fightHistory rather than emitted
        # with a NaN 'dt' that would poison the sort below and the JSON.
        if not is_dated(fight_dt) or fight['result'] not in ('W', 'L', 'NC'):
            continue
        # CORRECTION 6A. Bout-specific division, parsed from the raw result row.
        #
        # GONE, deliberately:
        #   wc_lookup fallback   — stamped the fighter's CURRENT roster division
        #                          onto their whole career (4,508 rows wrong,
        #                          1,483 of them shipped as the string 'Unknown')
        #   event-name heuristic — 'title' in event name flagged all 7 bouts of
        #                          "UFC 18: The Road to the Heavyweight Title";
        #                          6 were not title fights
        #   ' Title' suffix      — welded status onto the division string and
        #                          produced values like 'Unknown Title'
        #
        # `wc` is a division and nothing else; `tb` is a UFC championship
        # (undisputed, interim, or legacy Superfight) and nothing else. Title
        # status is per-bout, so it cannot leak forward onto later fights.
        wc = fight['wc_division']
        tb = bool(fight['wc_championship'])
        entries.append({
            'dt': fight_dt,
            'op': fight['opponent'],
            're': fight['result'],
            'me': fight['method_d'],
            # Preserve unknown round data instead of fabricating a round 3 finish.
            'rn': fight['rn'] if fight['rn'] > 0 else None,
            'ti': fight['ti'] or '5:00',
            'wc': wc,
            'tb': tb,
            'ev': fight['event'],
        })
    if entries:
        entries.sort(key=lambda x: fight_sort_key(x['dt']), reverse=True)
        rebuilt_history[fighter_name] = entries

fh_json = json.dumps(rebuilt_history, indent=2, ensure_ascii=False)
with open(FH_PATH, 'w') as f:
    f.write(f"export const FIGHT_HISTORY = {fh_json};\n")
print(f"  Rebuilt {len(rebuilt_history)} fighter histories")

# ─── Sanity check ─────────────────────────────────────────────────────────────
print(f"\n✅  Done — {TODAY}")
checks = ['Renato Moicano','Islam Makhachev','Jon Jones','Khamzat Chimaev','Alex Pereira']
print("\nSanity check:")
for name in checks:
    r = record_updates.get(name, {})
    print(f"  {name:25s} | {r.get('wi','?')}-{r.get('lo','?')} "
          f"| ws:{r.get('ws','?')} ls:{r.get('ls','?')} | lfd:{r.get('lfd','?')}")
