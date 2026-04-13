"""
FightMetrics — fighters_v5.json Auto-Update Script
===================================================
Reads Greco1899 CSVs and patches fighters_v5.json with:
  - wins, losses
  - win_streak, lose_streak
  - last_fight_date, days_since_last
  - ko_wins, sub_wins, dec_wins

NEVER touches:
  - avg_sig_str_landed, avg_sig_str_pct, avg_sub_att, avg_td_landed, avg_td_pct
  - elo, cardio_ratio
  - div_rank, p4p_rank
  - height_cms, reach_cms, weight_lbs, age, stance
"""

import pandas as pd
import json
import re
import os
from datetime import datetime, date

# ─── Config ───────────────────────────────────────────────────────────────────
JSON_FILE = "fighters_v5.json"

# ─── Helpers ──────────────────────────────────────────────────────────────────
def parse_date(s):
    if not isinstance(s, str):
        return None
    try:
        return datetime.strptime(s.strip(), '%B %d, %Y').strftime('%Y-%m-%d')
    except:
        return None

def split_bout(bout):
    parts = re.split(r'\s+vs\.?\s+', str(bout).strip(), maxsplit=1)
    return (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else (None, None)

def compute_streak(fights):
    ws = ls = 0
    for f in fights:
        r = f['result']
        if ws == 0 and ls == 0:
            if r == 'W':   ws = 1
            elif r == 'L': ls = 1
        elif ws > 0:
            if r == 'W':   ws += 1
            else:           break
        elif ls > 0:
            if r == 'L':   ls += 1
            else:           break
    return ws, ls

# ─── Load existing fighters_v5.json ──────────────────────────────────────────
print(f"Loading {JSON_FILE}...")
if not os.path.exists(JSON_FILE):
    print(f"ERROR: {JSON_FILE} not found!")
    exit(1)

with open(JSON_FILE, 'r') as f:
    fighters = json.load(f)

# Build lookup by name
fighter_map = {f['name']: f for f in fighters}
print(f"  Loaded {len(fighters)} fighters")

# ─── Load Greco1899 CSVs ──────────────────────────────────────────────────────
print("Loading CSVs...")
results_df = pd.read_csv('ufc_fight_results.csv', dtype=str)
events_df  = pd.read_csv('ufc_event_details.csv',  dtype=str)

event_dates = dict(zip(
    events_df['EVENT'].str.strip(),
    events_df['DATE'].apply(parse_date)
))

results_df['EVENT'] = results_df['EVENT'].str.strip()
results_df['DATE']  = results_df['EVENT'].map(event_dates)

# ─── Build fight history per fighter ─────────────────────────────────────────
print("Parsing fight results...")
fights_by_fighter = {}

for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT', ''))
    if fa is None:
        continue

    outcome = str(row.get('OUTCOME', '')).strip()
    if   outcome == 'W/L': winner = fa
    elif outcome == 'L/W': winner = fb
    else:                  winner = None

    method = str(row.get('METHOD', '')).strip().upper()

    for fighter, opponent in [(fa, fb), (fb, fa)]:
        if winner is None:       res = 'NC'
        elif fighter == winner:  res = 'W'
        else:                    res = 'L'
        fights_by_fighter.setdefault(fighter, []).append({
            'result': res,
            'date':   row['DATE'],
            'method': method,
        })

for name in fights_by_fighter:
    fights_by_fighter[name].sort(key=lambda x: x['date'] or '', reverse=True)

# ─── Compute updates ──────────────────────────────────────────────────────────
print("Computing updated stats...")
TODAY = date.today()
updates = {}

for name, fights in fights_by_fighter.items():
    wins   = sum(1 for f in fights if f['result'] == 'W')
    losses = sum(1 for f in fights if f['result'] == 'L')
    ws, ls = compute_streak(fights)

    dated = [f for f in fights if f['result'] in ('W', 'L', 'NC') and f['date']]
    lfd   = dated[0]['date'] if dated else None
    dsl   = (TODAY - date.fromisoformat(lfd)).days if lfd else None

    ko_wins  = sum(1 for f in fights if f['result'] == 'W' and any(x in f['method'] for x in ['KO', 'TKO']))
    sub_wins = sum(1 for f in fights if f['result'] == 'W' and 'SUB' in f['method'])
    dec_wins = sum(1 for f in fights if f['result'] == 'W' and 'DEC' in f['method'])

    updates[name] = {
        'wins':             wins,
        'losses':           losses,
        'win_streak':       ws,
        'lose_streak':      ls,
        'last_fight_date':  lfd,
        'days_since_last':  dsl,
        'ko_wins':          ko_wins,
        'sub_wins':         sub_wins,
        'dec_wins':         dec_wins,
    }

# ─── Patch existing fighters ──────────────────────────────────────────────────
print("Patching fighters_v5.json...")

FIELDS_TO_UPDATE = [
    'wins', 'losses', 'win_streak', 'lose_streak',
    'last_fight_date', 'days_since_last',
    'ko_wins', 'sub_wins', 'dec_wins',
]

updated_count = 0
added_count   = 0

for fighter in fighters:
    name = fighter['name']
    if name in updates:
        u = updates[name]
        for field in FIELDS_TO_UPDATE:
            fighter[field] = u[field]
        updated_count += 1

# Add new fighters who appear in CSVs but not in JSON
for name, u in updates.items():
    if name not in fighter_map:
        total = u['wins'] + u['losses']
        if total < 2:  # skip one-fight wonders
            continue
        fighters.append({
            'name':              name,
            'weight_class':      None,
            'last_fight_date':   u['last_fight_date'],
            'days_since_last':   u['days_since_last'],
            'elo':               None,
            'cardio_ratio':      None,
            'wins':              u['wins'],
            'losses':            u['losses'],
            'win_streak':        u['win_streak'],
            'lose_streak':       u['lose_streak'],
            'longest_win_streak': u['win_streak'],
            'total_rounds':      None,
            'title_bouts':       0,
            'ko_wins':           u['ko_wins'],
            'sub_wins':          u['sub_wins'],
            'dec_wins':          u['dec_wins'],
            'avg_sig_str_landed': None,
            'avg_sig_str_pct':   None,
            'avg_sub_att':       None,
            'avg_td_landed':     None,
            'avg_td_pct':        None,
            'height_cms':        None,
            'reach_cms':         None,
            'weight_lbs':        None,
            'age':               None,
            'stance':            None,
            'div_rank':          None,
            'p4p_rank':          None,
        })
        added_count += 1

print(f"  Updated {updated_count} fighters, added {added_count} new fighters")

# ─── Write output ─────────────────────────────────────────────────────────────
with open(JSON_FILE, 'w') as f:
    json.dump(fighters, f, indent=2)

print(f"\n✅  Done — {JSON_FILE} saved ({len(fighters)} total fighters)")

# Sanity check
checks = ['Islam Makhachev', 'Jon Jones', 'Renato Moicano', 'Khamzat Chimaev', 'Alex Pereira']
print("\nSanity check:")
for name in checks:
    if name in updates:
        u = updates[name]
        print(f"  {name:25s} | {u['wins']}-{u['losses']} | ws:{u['win_streak']} ls:{u['lose_streak']} | lfd:{u['last_fight_date']}")
