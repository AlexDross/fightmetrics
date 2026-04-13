"""
FightMetrics — Auto-Update Script v5.0
=======================================
Updates from Greco1899 CSVs after each UFC event.

UPDATES:
  fightersData.js  — wi, lo, ws, ls, lfd, dsl, kow, sbw, dcw, tr (records)
                     asl, asp, asa, atl, atp (striking/grappling averages)
                     crd (cardio ratio)
  fightHistory.js  — adds new fight entries for existing fighters
  cardioModule.js  — recomputes CARDIO_RATIOS from all per-round stats

NEVER TOUCHES (these break rankings if changed):
  elo in fightersData.js  — hand-tuned via Colab pipeline
  eloModule.js            — hand-tuned via Colab pipeline
  dr, p4p                 — division/P4P rankings
  tb, ht, rh, st, w, ag  — physical attributes
"""

import pandas as pd
import re
import os
import json
from datetime import datetime, date
from collections import defaultdict

SRC         = os.path.dirname(os.path.abspath(__file__))
JS_PATH     = os.path.join(SRC, 'src', 'fightersData.js')
FH_PATH     = os.path.join(SRC, 'src', 'fightHistory.js')
CARDIO_PATH = os.path.join(SRC, 'src', 'cardioModule.js')

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

def parse_of(s):
    if not isinstance(s, str): return 0, 0
    s = s.strip()
    if s in ('---', '', 'nan'): return 0, 0
    m = re.match(r'(\d+)\s+of\s+(\d+)', s)
    if m: return int(m.group(1)), int(m.group(2))
    return 0, 0

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
stats_df   = pd.read_csv('ufc_fight_stats.csv',    dtype=str)

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
        rn_raw = str(row.get('ROUND', '0')).strip()
        try: rn = int(float(rn_raw))
        except: rn = 0
        ti = str(row.get('TIME', '5:00')).strip() or '5:00'
        wc = str(row.get('WEIGHTCLASS', '') or row.get('WEIGHT CLASS', '') or '').strip()
        detail_lookup[key] = {'rn': rn, 'ti': ti, 'wc': wc}

res_cols  = results_df.columns.tolist()
has_round = 'ROUND' in res_cols
has_time  = 'TIME'  in res_cols
print(f"  Results: {len(results_df)} rows | Stats: {len(stats_df)} rows")

# ─── Build fight records ───────────────────────────────────────────────────────
print("Building fight records...")
fights_by_fighter = {}

for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT', ''))
    if fa is None: continue
    outcome = str(row.get('OUTCOME', '')).strip()
    winner  = fa if outcome == 'W/L' else (fb if outcome == 'L/W' else None)
    method  = str(row.get('METHOD', '')).strip()
    event   = str(row.get('EVENT', '')).strip()
    dt      = row['DATE']
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
            'method_d': method, 'opponent': opponent, 'event': event,
            'rn': rn, 'ti': ti, 'wc': wc,
        })

for n in fights_by_fighter:
    fights_by_fighter[n].sort(key=lambda x: x['date'] or '', reverse=True)

# ─── Compute record updates ────────────────────────────────────────────────────
print("Computing record stats...")
TODAY = date.today()
record_updates = {}
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
    record_updates[name] = dict(wi=wi, lo=lo, ws=ws, ls=ls, tr=wi+lo,
                                lfd=lfd, dsl=dsl, kow=kow, sbw=sbw, dcw=dcw)

# ─── Compute per-fighter striking/grappling stats ──────────────────────────────
print("Computing striking/grappling averages from fight_stats.csv...")

sig_landed    = defaultdict(int)
sig_att       = defaultdict(int)
td_landed     = defaultdict(int)
td_att        = defaultdict(int)
sub_att_total = defaultdict(int)
rounds_fought = defaultdict(int)
early_sig     = defaultdict(int)
late_sig      = defaultdict(int)
early_rounds  = defaultdict(int)
late_rounds   = defaultdict(int)

stats_df['FIGHTER'] = stats_df['FIGHTER'].str.strip() if 'FIGHTER' in stats_df.columns else ''
stats_df['ROUND']   = stats_df['ROUND'].str.strip()   if 'ROUND'   in stats_df.columns else ''

for _, row in stats_df.iterrows():
    fighter = str(row.get('FIGHTER', '')).strip()
    if not fighter or fighter == 'nan': continue
    round_str = str(row.get('ROUND', '')).strip()
    try: round_num = int(re.search(r'\d+', round_str).group())
    except: round_num = 1

    sl, sa = parse_of(row.get('SIG.STR.', ''))
    tl, ta = parse_of(row.get('TD', ''))
    try: sub_a = int(float(str(row.get('SUB.ATT', 0) or 0)))
    except: sub_a = 0

    sig_landed[fighter]    += sl
    sig_att[fighter]       += sa
    td_landed[fighter]     += tl
    td_att[fighter]        += ta
    sub_att_total[fighter] += sub_a
    rounds_fought[fighter] += 1

    if round_num <= 2:
        early_sig[fighter]    += sl
        early_rounds[fighter] += 1
    else:
        late_sig[fighter]    += sl
        late_rounds[fighter] += 1

stat_updates = {}
cardio_data  = {}

for fighter in set(list(sig_landed.keys()) + list(td_landed.keys())):
    rds = rounds_fought.get(fighter, 0)
    if rds == 0: continue
    minutes = rds * 5.0
    sl = sig_landed.get(fighter, 0)
    sa = sig_att.get(fighter, 0)
    tl = td_landed.get(fighter, 0)
    ta = td_att.get(fighter, 0)
    sub_a = sub_att_total.get(fighter, 0)

    asl = round(sl / minutes, 4)         if minutes > 0 else None
    asp = round(sl / sa, 4)              if sa > 0     else None
    asa = round(sub_a / (rds / 3), 4)   if rds > 0    else None
    atl = round(tl / minutes * 15, 4)   if minutes > 0 else None
    atp = round(tl / ta, 4)             if ta > 0     else None

    e_rds = early_rounds.get(fighter, 0)
    l_rds = late_rounds.get(fighter, 0)
    e_spr = early_sig.get(fighter, 0) / e_rds if e_rds > 0 else 0
    l_spr = late_sig.get(fighter, 0)  / l_rds if l_rds > 0 else 0

    if e_spr > 0 and l_rds > 0:
        crd = round(max(0.5, min(2.0, l_spr / e_spr)), 4)
    elif l_rds == 0 and e_rds > 0:
        crd = 0.5
    else:
        crd = 1.0

    stat_updates[fighter] = dict(asl=asl, asp=asp, asa=asa, atl=atl, atp=atp, crd=crd)
    cardio_data[fighter]  = crd

print(f"  Computed stats for {len(stat_updates)} fighters")

# ─── Patch fightersData.js ────────────────────────────────────────────────────
print("\nPatching fightersData.js...")
if not os.path.exists(JS_PATH):
    print(f"ERROR: {JS_PATH} not found!"); exit(1)

js_content = open(JS_PATH).read()
existing = {}
for m in re.finditer(r"\{n:'([^']+)'[^}]+\}", js_content):
    entry_str = m.group(0)
    name_m = re.search(r"n:'([^']+)'", entry_str)
    if name_m: existing[name_m.group(1)] = entry_str

print(f"  Found {len(existing)} fighters")

RECORD_FIELDS = ['wi','lo','ws','ls','tr','kow','sbw','dcw','dsl']
STAT_FIELDS   = ['asl','asp','asa','atl','atp','crd']

wc_lookup = {}
for name, entry_str in existing.items():
    wc_m = re.search(r"w:'([^']*)'", entry_str)
    if wc_m: wc_lookup[name] = wc_m.group(1)

new_lines = []
for name, entry_str in existing.items():
    if name in record_updates:
        u = record_updates[name]
        for field in RECORD_FIELDS:
            entry_str = patch_field(entry_str, field, u[field])
        if u['lfd']:
            entry_str = re.sub(r",lfd:'[^']*'", f",lfd:'{u['lfd']}'", entry_str)
            entry_str = re.sub(r",lfd:null",     f",lfd:'{u['lfd']}'", entry_str)
    if name in stat_updates:
        s = stat_updates[name]
        for field in STAT_FIELDS:
            val = s.get(field)
            if val is not None:
                entry_str = patch_field(entry_str, field, round(val, 4))
    # NOTE: elo is intentionally NOT updated here (breaks rankings)
    new_lines.append(f"  {entry_str}")

new_js = "export const _D2 = [\n" + ",\n".join(new_lines) + "\n];\n"
with open(JS_PATH, 'w') as f:
    f.write(new_js)
print(f"  Patched {len(new_lines)} fighters")

# ─── Patch fightHistory.js ────────────────────────────────────────────────────
print("\nPatching fightHistory.js...")
fh_content = open(FH_PATH).read()
json_m = re.search(r'export\s+const\s+FIGHT_HISTORY\s*=\s*(\{.+\})\s*;?\s*$', fh_content, re.DOTALL)
fight_history = json.loads(json_m.group(1))
updated_fh = 0
added_fights = 0

for fighter_name, history in fight_history.items():
    if fighter_name not in fights_by_fighter: continue
    latest_dt = max((f.get('dt','1900-01-01') for f in history), default='1900-01-01')
    new_entries = []
    for fight in fights_by_fighter[fighter_name]:
        fight_dt = fight.get('date','')
        if not fight_dt or fight_dt <= latest_dt: continue
        if fight['result'] not in ('W','L','NC'): continue
        wc = fight['wc'] or wc_lookup.get(fighter_name, 'Unknown')
        tb = 'title' in wc.lower() or 'title' in fight['event'].lower()
        if tb and 'title' not in wc.lower(): wc = wc + ' Title'
        new_entries.append({
            'dt': fight_dt, 'op': fight['opponent'], 're': fight['result'],
            'me': fight['method_d'], 'rn': fight['rn'] if fight['rn'] > 0 else 3,
            'ti': fight['ti'] or '5:00', 'wc': wc, 'tb': tb, 'ev': fight['event'],
        })
    if new_entries:
        new_entries.sort(key=lambda x: x['dt'], reverse=True)
        fight_history[fighter_name] = new_entries + history
        updated_fh += 1
        added_fights += len(new_entries)

fh_json = json.dumps(fight_history, indent=2, ensure_ascii=False)
with open(FH_PATH, 'w') as f:
    f.write(f"export const FIGHT_HISTORY = {fh_json};\n")
print(f"  Updated {updated_fh} fighters, added {added_fights} new fight entries")

# ─── Update cardioModule.js ───────────────────────────────────────────────────
print("\nUpdating cardioModule.js...")
cardio_comment = (
    f"// ─── DATA-DERIVED CARDIO RATIOS ─────────────────────────────────────\n"
    f"// Computed from {len(stats_df)} round-level stats rows from ufc_fight_stats.csv\n"
    f"// Ratio = late-round (R3+) sig strikes per round ÷ early-round (R1-2) per round\n"
    f"// > 1.0 = gets stronger late · < 1.0 = fades · baseline ≈ 1.0\n"
    f"// Covers {len(cardio_data)} fighters with both early and late-round UFC stats\n"
)
cardio_js_data = json.dumps(cardio_data, separators=(',',':'), ensure_ascii=False)
with open(CARDIO_PATH, 'w') as f:
    f.write(f"{cardio_comment}export const CARDIO_RATIOS = {cardio_js_data};\n")
print(f"  Wrote {len(cardio_data)} fighters to cardioModule.js")

# ─── Sanity check ─────────────────────────────────────────────────────────────
print(f"\n✅  Done — {TODAY}")
checks = ['Renato Moicano','Islam Makhachev','Jon Jones','Khamzat Chimaev','Alex Pereira']
print("\nSanity check:")
for name in checks:
    r = record_updates.get(name, {})
    s = stat_updates.get(name, {})
    print(f"  {name:25s} | {r.get('wi','?')}-{r.get('lo','?')} "
          f"| asl:{s.get('asl','?')} crd:{s.get('crd','?')} | lfd:{r.get('lfd','?')}")
