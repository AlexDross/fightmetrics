"""
FightMetrics — Auto-Update Script v8.0 (FINAL SAFE)
====================================================
Only updates record fields and fight history.
Nothing that affects rankings is touched.

UPDATES:
  fightersData.js  — wi, lo, ws, ls, lfd, dsl, kow, sbw, dcw, tr
  fightHistory.js  — adds new fight entries for existing fighters

NEVER TOUCHES (leave for Colab pipeline):
  elo, crd, asl, asp, asa, atl, atp  — affect rankings/ratings
  eloModule.js, cardioModule.js       — affect rankings/ratings
  dr, p4p                             — rankings
  tb, ht, rh, st, w, ag              — physical attributes
"""

import pandas as pd
import re, os, json
from datetime import datetime, date

SRC     = os.path.dirname(os.path.abspath(__file__))
JS_PATH = os.path.join(SRC, 'src', 'fightersData.js')
FH_PATH = os.path.join(SRC, 'src', 'fightHistory.js')

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
    return re.sub(rf"(,{key}:)([-\d.']+|null)", rf"\g<1>{fmt(new_val)}", entry_str)

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

new_js = "export const _D2 = [\n" + ",\n".join(new_lines) + "\n];\n"
with open(JS_PATH, 'w') as f:
    f.write(new_js)
print(f"  Patched {len(new_lines)} fighters")

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
