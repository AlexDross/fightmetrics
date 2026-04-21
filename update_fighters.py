"""
FightMetrics — Auto-Update Script v8.0 (FINAL SAFE)
====================================================
Updates record fields, fight history, and seeds new UFC-only fighters when they
make their debut. Nothing that affects rankings is touched.

UPDATES:
  fightersData.js  — wi, lo, ws, ls, lfd, dsl, kow, sbw, dcw
  fightersData.js  — adds new UFC-only entries for debuting fighters
  fightHistory.js  — rebuilt from source CSVs

NEVER TOUCHES (leave for Colab pipeline):
  elo, crd, asl, asp, asa, atl, atp  — affect rankings/ratings
  eloModule.js, cardioModule.js       — affect rankings/ratings
  dr, p4p                             — rankings
  tb, ht, rh, st, w, ag              — physical attributes
"""

import pandas as pd
import re, os, json
from datetime import datetime, date, timedelta

SRC     = os.path.dirname(os.path.abspath(__file__))
JS_PATH = os.path.join(SRC, 'src', 'fightersData.js')
FH_PATH = os.path.join(SRC, 'src', 'fightHistory.js')
PROSPECT_PATH = os.path.join(SRC, 'src', 'prospectsData.js')

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
    if isinstance(v, str): return f"'{v}'"
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
results_df = pd.read_csv('ufc_fight_results.csv', dtype=str)
events_df  = pd.read_csv('ufc_event_details.csv', dtype=str)

try:
    details_df = pd.read_csv('ufc_fight_details.csv', dtype=str)
    details_df['EVENT'] = details_df['EVENT'].str.strip()
    details_df['BOUT']  = details_df['BOUT'].str.strip()
    has_details = True
except:
    has_details = False

try:
    stats_df = pd.read_csv('ufc_fight_stats.csv', dtype=str)
    stats_df['EVENT'] = stats_df['EVENT'].str.strip()
    stats_df['BOUT'] = stats_df['BOUT'].str.strip()
    stats_df['FIGHTER'] = stats_df['FIGHTER'].str.strip()
    has_stats = True
except:
    stats_df = None
    has_stats = False

prospect_fallbacks = load_prospect_fallbacks()

event_dates = dict(zip(events_df['EVENT'].str.strip(), events_df['DATE'].apply(parse_date)))
results_df['EVENT'] = results_df['EVENT'].str.strip()
results_df['DATE']  = results_df['EVENT'].map(event_dates)
results_df['BOUT']  = results_df['BOUT'].str.strip() if 'BOUT' in results_df.columns else ''

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
    fights_by_fighter[n].sort(key=lambda x: x['date'] or '', reverse=True)

# ─── Compute record updates ────────────────────────────────────────────────────
print("Computing record stats...")
TODAY = date.today()
record_updates = {}
for name, fights in fights_by_fighter.items():
    wi  = sum(1 for f in fights if f['result'] == 'W')
    lo  = sum(1 for f in fights if f['result'] == 'L')
    ws, ls = compute_streak(fights)
    dated = [f for f in fights if f['result'] in ('W','L','NC') and f['date']]
    lfd = dated[0]['date'] if dated else None
    dsl = (TODAY - date.fromisoformat(lfd)).days if lfd else None
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
            'weight_class': bout_meta.get('weight_class'),
        })

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

def build_new_fighter_entry(name, record, fights):
    rows = stats_by_fighter.get(name, [])
    fallback = prospect_fallbacks.get(name, {})
    total_duration = sum(r['round_secs'] for r in rows)
    total_sig_landed = sum(r['sig_landed'] for r in rows)
    total_sig_attempted = sum(r['sig_attempted'] for r in rows)
    total_td_landed = sum(r['td_landed'] for r in rows)
    total_td_attempted = sum(r['td_attempted'] for r in rows)
    total_sub_att = sum(r['sub_att'] for r in rows)

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
        f"elo:null,crd:1.0,"
        f"lfd:{fmt(record['lfd'])},dsl:{fmt(record['dsl'])},"
        f"dr:null,p4p:null,wlb:{fmt(fallback.get('wlb') or WEIGHT_LIMITS.get(weight_class))}"
        "}"
    )
    return entry

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
new_lines = []

for name, entry_str in existing.items():
    if name in record_updates:
        u = record_updates[name]
        for field in RECORD_FIELDS:
            entry_str = patch_field(entry_str, field, u[field])
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
        fight_dt = fight.get('date', '')
        if not fight_dt or fight['result'] not in ('W', 'L', 'NC'):
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
        entries.sort(key=lambda x: x['dt'], reverse=True)
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
