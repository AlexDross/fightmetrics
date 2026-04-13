"""
FightMetrics — src/fightersData.js Auto-Update Script
======================================================
Reads Greco1899 CSVs and patches src/fightersData.js with:
  - wi, lo        (win/loss record)
  - ws, ls        (win/loss streak)
  - lfd, dsl      (last fight date / days since last)
  - kow, sbw, dcw (win method counts)
  - tr            (total fights)

NEVER touches:
  - asl, asp, asa, atl, atp  (per-round stats)
  - elo, crd                 (rating components)
  - dr, p4p                  (rankings)
  - tb, ht, rh, st, w        (physical attributes)
"""

import pandas as pd
import re
import os
from datetime import datetime, date

JS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'fightersData.js')

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
    # IMPORTANT: use comma prefix to prevent partial matches
    # e.g. 'lo:' would wrongly match inside 'elo:' without the comma
    return re.sub(rf"(,{key}:)([-\d.']+|null)", rf"\g<1>{fmt(new_val)}", entry_str)

# Load fightersData.js
print(f"Loading {JS_PATH}...")
if not os.path.exists(JS_PATH):
    print(f"ERROR: {JS_PATH} not found!")
    exit(1)

js_content = open(JS_PATH).read()
existing = {}
for m in re.finditer(r"\{n:'([^']+)'[^}]+\}", js_content):
    entry_str = m.group(0)
    name_m = re.search(r"n:'([^']+)'", entry_str)
    if name_m: existing[name_m.group(1)] = entry_str

print(f"  Found {len(existing)} fighters")

# Load CSVs
print("Loading CSVs...")
results_df = pd.read_csv('ufc_fight_results.csv', dtype=str)
events_df  = pd.read_csv('ufc_event_details.csv',  dtype=str)

event_dates = dict(zip(events_df['EVENT'].str.strip(), events_df['DATE'].apply(parse_date)))
results_df['EVENT'] = results_df['EVENT'].str.strip()
results_df['DATE']  = results_df['EVENT'].map(event_dates)

# Build fight history
print("Parsing fight results...")
fights_by_fighter = {}
for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT', ''))
    if fa is None: continue
    outcome = str(row.get('OUTCOME', '')).strip()
    winner = fa if outcome == 'W/L' else (fb if outcome == 'L/W' else None)
    method = str(row.get('METHOD', '')).strip().upper()
    for fighter in [fa, fb]:
        res = 'NC' if winner is None else ('W' if fighter == winner else 'L')
        fights_by_fighter.setdefault(fighter, []).append({'result': res, 'date': row['DATE'], 'method': method})

for n in fights_by_fighter:
    fights_by_fighter[n].sort(key=lambda x: x['date'] or '', reverse=True)

# Compute updates
print("Computing updated stats...")
TODAY = date.today()
updates = {}
for name, fights in fights_by_fighter.items():
    wi = sum(1 for f in fights if f['result'] == 'W')
    lo = sum(1 for f in fights if f['result'] == 'L')
    ws, ls = compute_streak(fights)
    dated = [f for f in fights if f['result'] in ('W', 'L', 'NC') and f['date']]
    lfd = dated[0]['date'] if dated else None
    dsl = (TODAY - date.fromisoformat(lfd)).days if lfd else None
    kow = sum(1 for f in fights if f['result'] == 'W' and any(x in f['method'] for x in ['KO', 'TKO']))
    sbw = sum(1 for f in fights if f['result'] == 'W' and 'SUB' in f['method'])
    dcw = sum(1 for f in fights if f['result'] == 'W' and 'DEC' in f['method'])
    updates[name] = dict(wi=wi, lo=lo, ws=ws, ls=ls, tr=wi+lo, lfd=lfd, dsl=dsl, kow=kow, sbw=sbw, dcw=dcw)

# Patch entries — only update fighters already in the file, never add new ones
# (new fighters need manual review to get physical stats, elo, rankings etc.)
print("Patching fightersData.js...")
FIELDS = ['wi', 'lo', 'ws', 'ls', 'tr', 'kow', 'sbw', 'dcw', 'dsl']
updated_count = 0
new_lines = []

for name, entry_str in existing.items():
    if name in updates:
        u = updates[name]
        for field in FIELDS:
            entry_str = patch_field(entry_str, field, u[field])
        if u['lfd']:
            entry_str = re.sub(r",lfd:'[^']*'", f",lfd:'{u['lfd']}'", entry_str)
            entry_str = re.sub(r",lfd:null",     f",lfd:'{u['lfd']}'", entry_str)
        updated_count += 1
    new_lines.append(f"  {entry_str}")

print(f"  Updated {updated_count} fighters (no new fighters added automatically)")

new_js = "export const _D2 = [\n" + ",\n".join(new_lines) + "\n];\n"
with open(JS_PATH, 'w') as f:
    f.write(new_js)

print(f"\n✅  Done — src/fightersData.js saved ({len(new_lines)} total fighters)")

checks = ['Renato Moicano', 'Islam Makhachev', 'Jon Jones', 'Khamzat Chimaev', 'Alex Pereira']
print("\nSanity check:")
for name in checks:
    if name in updates:
        u = updates[name]
        print(f"  {name:25s} | {u['wi']}-{u['lo']} | ws:{u['ws']} ls:{u['ls']} | lfd:{u['lfd']}")
