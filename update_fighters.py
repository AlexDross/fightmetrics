"""
FightMetrics — Auto-Update Script v8.0 (FINAL SAFE)
====================================================
Updates records, aggregate fight statistics, fight history, and seeds new
UFC-only fighters when they make their debut. Rankings and rating artifacts are
not touched.

UPDATES:
  fightersData.js  — records plus tr, tb, asl, asp, asa, atl, atp and detail stats
  fightersData.js  — adds new UFC-only entries for debuting fighters
  fightHistory.js  — rebuilt from source CSVs

NEVER TOUCHES (leave for their dedicated generators):
  elo, crd                           — rating/calibration artifacts
  eloModule.js, cardioModule.js       — affect rankings/ratings
  dr, p4p                             — rankings
  tb, ht, rh, st, w, ag              — physical attributes
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

def fmt(v):
    if v is None: return 'null'
    if isinstance(v, str): return f"'{js_escape(v)}'"
    return str(v)

def js_escape(s):
    return str(s).replace("\\", "\\\\").replace("'", "\\'")

def patch_field(entry_str, key, new_val):
    return re.sub(rf"(,{key}:)([-\d.']+|null)", rf"\g<1>{fmt(new_val)}", entry_str)

def clean_wc(s):
    if not isinstance(s, str): return None
    s = s.strip()
    if not s:
        return None
    for w in ['UFC', 'Title', 'Bout', 'Interim']:
        s = re.sub(rf'\b{w}\b', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s+', ' ', s).strip()
    return s or None

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

def split_top_level_objects(array_body):
    objs = []
    depth = 0
    start = None
    in_str = False
    escape = False
    quote = None
    for i, ch in enumerate(array_body):
        if in_str:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == quote:
                in_str = False
            continue
        if ch in ("'", '"'):
            in_str = True
            quote = ch
            continue
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start is not None:
                objs.append(array_body[start:i+1])
                start = None
    return objs

def parse_js_string_field(entry_str, key):
    m = re.search(rf"{key}:\s*'((?:\\.|[^'])*)'", entry_str)
    if not m:
        return None
    return m.group(1).replace("\\'", "'").replace('\\\\', '\\')

def parse_js_number_field(entry_str, key):
    m = re.search(rf"{key}:\s*(-?\d+(?:\.\d+)?)", entry_str)
    if not m:
        return None
    num = float(m.group(1))
    return int(num) if num.is_integer() else num

def parse_js_nullable_field(entry_str, key):
    if re.search(rf"{key}:\s*null", entry_str):
        return None
    return parse_js_number_field(entry_str, key)

def load_prospect_fallbacks():
    if not os.path.exists(PROSPECT_PATH):
        return {}
    content = open(PROSPECT_PATH).read()
    m = re.search(r'export\s+const\s+_P\s*=\s*\[(.*)\]\s*;', content, re.DOTALL)
    if not m:
        return {}
    fallbacks = {}
    for entry in split_top_level_objects(m.group(1)):
        name = parse_js_string_field(entry, 'n')
        if not name:
            continue
        fallbacks[name] = {
            'w': parse_js_string_field(entry, 'w'),
            'ag': parse_js_nullable_field(entry, 'ag'),
            'ht': parse_js_nullable_field(entry, 'ht'),
            'rh': parse_js_nullable_field(entry, 'rh'),
            'st': parse_js_string_field(entry, 'st'),
            'wlb': parse_js_nullable_field(entry, 'wlb'),
        }
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

    for fighter, opponent in [(fa, fb), (fb, fa)]:
        res = 'NC' if winner is None else ('W' if fighter == winner else 'L')
        fights_by_fighter.setdefault(fighter, []).append({
            'result': res, 'date': dt, 'method': method.upper(),
            'method_d': method, 'opponent': opponent,
            'event': event, 'rn': rn, 'ti': ti, 'wc': wc,
        })

for n in fights_by_fighter:
    # fight_sort_key, not `or ''`: NaN is truthy, so `or ''` returned NaN and
    # the comparison raised TypeError. Undated fights sort last.
    fights_by_fighter[n].sort(key=lambda x: fight_sort_key(x['date']), reverse=True)

# ─── Compute record updates ────────────────────────────────────────────────────
print("Computing record stats...")
TODAY = date.today()
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
        'weight_class': clean_wc(row.get('WEIGHTCLASS', '')),
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
            'weight_class': bout_meta.get('weight_class'),
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

    weight_class = fallback.get('w')
    if not weight_class and fights:
        latest_fight = fights[0]
        weight_class = clean_wc(latest_fight.get('wc', ''))
    if not weight_class and rows:
        weight_class = rows[-1]['weight_class']

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
        f"tr:{compute_total_rounds(fights)},tb:{sum(1 for f in fights if 'title' in (f.get('wc') or '').lower() or 'title' in (f.get('event') or '').lower())},"
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
    return {
        'tr': compute_total_rounds(fights),
        'tb': sum(1 for f in fights if 'title' in (f.get('wc') or '').lower() or 'title' in (f.get('event') or '').lower()),
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
existing = {}
for m in re.finditer(r"\{n:'([^']+)'[^}]+\}", js_content):
    entry_str = m.group(0)
    name_m = re.search(r"n:'([^']+)'", entry_str)
    if name_m: existing[name_m.group(1)] = entry_str

wc_lookup = {}
for name, entry_str in existing.items():
    wc_m = re.search(r"w:'([^']*)'", entry_str)
    if wc_m: wc_lookup[name] = wc_m.group(1)

RECORD_FIELDS = ['wi','lo','ws','ls','kow','sbw','dcw','dsl']
STAT_FIELDS = ['tr', 'tb', 'asl', 'asp', 'asa', 'atl', 'atp', 'kd', 'sapm', 'sdef', 'ctrl', 'hdpct', 'lgpct']

_NEW_FIELDS = ['kd', 'sapm', 'sdef', 'ctrl', 'hdpct', 'lgpct']
for _name in list(existing):
    _entry = existing[_name]
    for _f in _NEW_FIELDS:
        if f',{_f}:' not in _entry:
            _entry = _entry[:-1] + f',{_f}:null' + '}'
    existing[_name] = _entry

new_lines = []

for name, entry_str in existing.items():
    if name in record_updates:
        u = record_updates[name]
        stat_updates = compute_stat_updates(name, fights_by_fighter.get(name, []))
        for field in RECORD_FIELDS:
            entry_str = patch_field(entry_str, field, u[field])
        for field in STAT_FIELDS:
            entry_str = patch_field(entry_str, field, stat_updates[field])
        if u['lfd']:
            entry_str = re.sub(r",lfd:'[^']*'", f",lfd:'{u['lfd']}'", entry_str)
            entry_str = re.sub(r",lfd:null",     f",lfd:'{u['lfd']}'", entry_str)
    new_lines.append(f"  {entry_str}")

new_count = 0
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
    wc = clean_wc(fights[0].get('wc', '')) if fights else None
    if wc:
        wc_lookup[name] = wc
    new_count += 1

new_js = "export const _D2 = [\n" + ",\n".join(new_lines) + "\n];\n"
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
        wc = fight['wc'] or wc_lookup.get(fighter_name, 'Unknown')
        tb = 'title' in wc.lower() or 'title' in fight['event'].lower()
        if tb and 'title' not in wc.lower():
            wc = wc + ' Title'
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
