"""
FightMetrics — Auto-Update Script v3.0
=======================================
Updates BOTH src/fightersData.js AND src/fightHistory.js from Greco1899 CSVs.

fightersData.js updates: wi, lo, ws, ls, lfd, dsl, kow, sbw, dcw, tr
fightHistory.js updates:  adds new fight entries for existing fighters
"""

import pandas as pd
import re
import os
import json
from datetime import datetime, date

SRC = os.path.dirname(os.path.abspath(__file__))
JS_PATH = os.path.join(SRC, 'src', 'fightersData.js')
FH_PATH = os.path.join(SRC, 'src', 'fightHistory.js')

# ─── Helpers ──────────────────────────────────────────────────────────────────
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

def patch_field(entry_str, key, new_val):
    # Comma prefix prevents 'lo:' matching inside 'elo:'
    return re.sub(rf"(,{key}:)([-\d.']+|null)", rf"\g<1>{fmt(new_val)}", entry_str)

# ─── Load CSVs ────────────────────────────────────────────────────────────────
print("Loading CSVs...")
results_df = pd.read_csv('ufc_fight_results.csv', dtype=str)
events_df  = pd.read_csv('ufc_event_details.csv',  dtype=str)

# Try to load fight_details for round/time/weightclass
try:
    details_df = pd.read_csv('ufc_fight_details.csv', dtype=str)
    details_df['EVENT'] = details_df['EVENT'].str.strip()
    details_df['BOUT']  = details_df['BOUT'].str.strip()
    has_details = True
    print("  fight_details.csv loaded")
except Exception as e:
    has_details = False
    print(f"  fight_details.csv not available: {e}")

# Build event date map
event_dates = dict(zip(events_df['EVENT'].str.strip(), events_df['DATE'].apply(parse_date)))
results_df['EVENT'] = results_df['EVENT'].str.strip()
results_df['DATE']  = results_df['EVENT'].map(event_dates)
results_df['BOUT']  = results_df['BOUT'].str.strip() if 'BOUT' in results_df.columns else results_df.get('BOUT', '')

# Build detail lookup: (bout, event) -> {rn, ti, wc, tb}
detail_lookup = {}
if has_details:
    cols = details_df.columns.tolist()
    print(f"  fight_details columns: {cols}")
    for _, row in details_df.iterrows():
        bout  = str(row.get('BOUT', '')).strip()
        event = str(row.get('EVENT', '')).strip()
        rn_raw = str(row.get('ROUND', '0')).strip()
        try: rn = int(float(rn_raw))
        except: rn = 0
        ti = str(row.get('TIME', '5:00')).strip() or '5:00'
        # Try various possible weightclass column names
        wc = (str(row.get('WEIGHTCLASS', '') or row.get('WEIGHT CLASS', '') or '').strip())
        detail_lookup[(bout, event)] = {'rn': rn, 'ti': ti, 'wc': wc}

# Check if fight_results has ROUND/TIME columns
res_cols = results_df.columns.tolist()
print(f"  fight_results columns: {res_cols}")
has_round = 'ROUND' in res_cols
has_time  = 'TIME'  in res_cols

# ─── Build fight history from CSVs ───────────────────────────────────────────
print("Parsing fight results...")
fights_by_fighter = {}  # name -> list of fight dicts

for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT', ''))
    if fa is None: continue

    outcome = str(row.get('OUTCOME', '')).strip()
    winner  = fa if outcome == 'W/L' else (fb if outcome == 'L/W' else None)
    method  = str(row.get('METHOD', '')).strip()
    event   = str(row.get('EVENT',  '')).strip()
    dt      = row['DATE']

    # Get round/time from results CSV or detail lookup
    bout_key = (str(row.get('BOUT', '')).strip(), event)
    detail   = detail_lookup.get(bout_key, {})

    if has_round:
        try: rn = int(float(str(row.get('ROUND', '0')).strip()))
        except: rn = detail.get('rn', 0)
    else:
        rn = detail.get('rn', 0)

    if has_time:
        ti = str(row.get('TIME', '5:00')).strip() or '5:00'
    else:
        ti = detail.get('ti', '5:00')

    wc = detail.get('wc', '')

    for fighter, opponent in [(fa, fb), (fb, fa)]:
        res = 'NC' if winner is None else ('W' if fighter == winner else 'L')
        fights_by_fighter.setdefault(fighter, []).append({
            'result':   res,
            'date':     dt,
            'method':   method.upper(),   # uppercase for fightersData matching
            'method_d': method,           # display case for fightHistory
            'opponent': opponent,
            'event':    event,
            'rn':       rn,
            'ti':       ti,
            'wc':       wc,
        })

for n in fights_by_fighter:
    fights_by_fighter[n].sort(key=lambda x: x['date'] or '', reverse=True)

# ─── Compute fightersData.js updates ─────────────────────────────────────────
print("Computing fightersData.js stats...")
TODAY = date.today()
updates = {}
for name, fights in fights_by_fighter.items():
    wi = sum(1 for f in fights if f['result'] == 'W')
    lo = sum(1 for f in fights if f['result'] == 'L')
    ws, ls = compute_streak(fights)
    dated = [f for f in fights if f['result'] in ('W','L','NC') and f['date']]
    lfd = dated[0]['date'] if dated else None
    dsl = (TODAY - date.fromisoformat(lfd)).days if lfd else None
    kow = sum(1 for f in fights if f['result']=='W' and any(x in f['method'] for x in ['KO','TKO']))
    sbw = sum(1 for f in fights if f['result']=='W' and 'SUB' in f['method'])
    dcw = sum(1 for f in fights if f['result']=='W' and 'DEC' in f['method'])
    updates[name] = dict(wi=wi, lo=lo, ws=ws, ls=ls, tr=wi+lo,
                         lfd=lfd, dsl=dsl, kow=kow, sbw=sbw, dcw=dcw)

# ─── Patch fightersData.js ────────────────────────────────────────────────────
print("Patching fightersData.js...")
if not os.path.exists(JS_PATH):
    print(f"ERROR: {JS_PATH} not found!"); exit(1)

js_content = open(JS_PATH).read()
existing = {}
for m in re.finditer(r"\{n:'([^']+)'[^}]+\}", js_content):
    entry_str = m.group(0)
    name_m = re.search(r"n:'([^']+)'", entry_str)
    if name_m: existing[name_m.group(1)] = entry_str

print(f"  Found {len(existing)} fighters in fightersData.js")

FIELDS = ['wi','lo','ws','ls','tr','kow','sbw','dcw','dsl']
updated_fd = 0
new_lines = []

for name, entry_str in existing.items():
    if name in updates:
        u = updates[name]
        for field in FIELDS:
            entry_str = patch_field(entry_str, field, u[field])
        if u['lfd']:
            entry_str = re.sub(r",lfd:'[^']*'", f",lfd:'{u['lfd']}'", entry_str)
            entry_str = re.sub(r",lfd:null",     f",lfd:'{u['lfd']}'", entry_str)
        updated_fd += 1
    new_lines.append(f"  {entry_str}")

new_js = "export const _D2 = [\n" + ",\n".join(new_lines) + "\n];\n"
with open(JS_PATH, 'w') as f:
    f.write(new_js)
print(f"  Updated {updated_fd} fighters")

# ─── Patch fightHistory.js ────────────────────────────────────────────────────
print("\nPatching fightHistory.js...")
if not os.path.exists(FH_PATH):
    print(f"ERROR: {FH_PATH} not found!"); exit(1)

fh_content = open(FH_PATH).read()
json_m = re.search(r'export\s+const\s+FIGHT_HISTORY\s*=\s*(\{.+\})\s*;?\s*$', fh_content, re.DOTALL)
if not json_m:
    print("ERROR: could not parse fightHistory.js"); exit(1)

fight_history = json.loads(json_m.group(1))

# Build a lookup of fighter weight class from fightersData for fallback
wc_lookup = {}
for name, entry_str in existing.items():
    wc_m = re.search(r"w:'([^']*)'", entry_str)
    if wc_m: wc_lookup[name] = wc_m.group(1)

updated_fh = 0
added_fights = 0

for fighter_name, history in fight_history.items():
    if fighter_name not in fights_by_fighter:
        continue

    # Most recent date already in history
    latest_dt = max((f.get('dt','1900-01-01') for f in history), default='1900-01-01')

    # Find new fights from CSV
    new_entries = []
    for fight in fights_by_fighter[fighter_name]:
        fight_dt = fight.get('date','')
        if not fight_dt or fight_dt <= latest_dt:
            continue
        if fight['result'] not in ('W','L','NC'):
            continue

        # Determine weight class
        wc = fight['wc']
        if not wc:
            wc = wc_lookup.get(fighter_name, 'Unknown')

        # Detect title bout
        tb = ('title' in wc.lower() or 'championship' in wc.lower()
              or 'title' in fight['event'].lower())
        if tb and 'title' not in wc.lower():
            wc = wc + ' Title'  # append if not already there

        new_entries.append({
            'dt': fight_dt,
            'op': fight['opponent'],
            're': fight['result'],
            'me': fight['method_d'],
            'rn': fight['rn'] if fight['rn'] > 0 else 3,
            'ti': fight['ti'] if fight['ti'] else '5:00',
            'wc': wc,
            'tb': tb,
            'ev': fight['event'],
        })

    if new_entries:
        # Sort newest first and prepend to history
        new_entries.sort(key=lambda x: x['dt'], reverse=True)
        fight_history[fighter_name] = new_entries + history
        updated_fh += 1
        added_fights += len(new_entries)

fight_history_json = json.dumps(fight_history, indent=2, ensure_ascii=False)
new_fh = f"export const FIGHT_HISTORY = {fight_history_json};\n"
with open(FH_PATH, 'w') as f:
    f.write(new_fh)

print(f"  Updated {updated_fh} fighters, added {added_fights} new fight entries")

# ─── Sanity check ─────────────────────────────────────────────────────────────
print(f"\n✅  Done")
checks = ['Renato Moicano','Islam Makhachev','Jon Jones','Khamzat Chimaev','Alex Pereira']
print("\nSanity check (fightersData):")
for name in checks:
    if name in updates:
        u = updates[name]
        print(f"  {name:25s} | {u['wi']}-{u['lo']} | ws:{u['ws']} ls:{u['ls']} | lfd:{u['lfd']}")

print("\nSanity check (fightHistory):")
for name in checks:
    if name in fight_history:
        latest = fight_history[name][0]
        print(f"  {name:25s} | latest: {latest['dt']} vs {latest['op']} ({latest['re']})")
