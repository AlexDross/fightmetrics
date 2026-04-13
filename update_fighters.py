"""
FightMetrics — Auto-Update Script v6.0
=======================================
Updates ALL dynamic fighter data from Greco1899 CSVs.

UPDATES:
  fightersData.js  — records (wi/lo/ws/ls/lfd/dsl/kow/sbw/dcw/tr)
                     striking/grappling averages (asl/asp/asa/atl/atp/crd)
                     elo (incremental update from CUTOFF_DATE)
  fightHistory.js  — adds new fight entries for existing fighters
  eloModule.js     — incremental Elo update (exact same formula as Colab)
  cardioModule.js  — full recompute of CARDIO_RATIOS

NEVER TOUCHES: dr, p4p, tb, ht, rh, st, w, ag (rankings + physical)
"""

import pandas as pd
import re, os, json
from datetime import datetime, date
from collections import defaultdict

SRC         = os.path.dirname(os.path.abspath(__file__))
JS_PATH     = os.path.join(SRC, 'src', 'fightersData.js')
FH_PATH     = os.path.join(SRC, 'src', 'fightHistory.js')
ELO_PATH    = os.path.join(SRC, 'src', 'eloModule.js')
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
    return re.sub(rf"(,{key}:)([-\d.']+|null)", rf"\g<1>{fmt(new_val)}", entry_str)

# ─── Load CSVs ────────────────────────────────────────────────────────────────
print("Loading CSVs...")
results_df = pd.read_csv('ufc_fight_results.csv', dtype=str)
events_df  = pd.read_csv('ufc_event_details.csv', dtype=str)
stats_df   = pd.read_csv('ufc_fight_stats.csv',   dtype=str)

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
        ti = str(row.get('TIME','5:00')).strip() or '5:00'
        wc = str(row.get('WEIGHTCLASS','') or row.get('WEIGHT CLASS','') or '').strip()
        detail_lookup[key] = {'rn': rn, 'ti': ti, 'wc': wc}

res_cols  = results_df.columns.tolist()
has_round = 'ROUND' in res_cols
has_time  = 'TIME'  in res_cols
print(f"  Results: {len(results_df)} rows | Stats: {len(stats_df)} rows")

# ─── Build fight records ───────────────────────────────────────────────────────
print("Building fight records...")
fights_by_fighter = {}

for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT',''))
    if fa is None: continue
    outcome = str(row.get('OUTCOME','')).strip()
    winner  = fa if outcome == 'W/L' else (fb if outcome == 'L/W' else None)
    method  = str(row.get('METHOD','')).strip()
    event   = str(row.get('EVENT','')).strip()
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

# ─── Record updates ────────────────────────────────────────────────────────────
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
    sbw = sum(1 for f in fights if f['result']=='W' and 'SUB'  in f['method'])
    dcw = sum(1 for f in fights if f['result']=='W' and 'DEC'  in f['method'])
    record_updates[name] = dict(wi=wi, lo=lo, ws=ws, ls=ls, tr=wi+lo,
                                lfd=lfd, dsl=dsl, kow=kow, sbw=sbw, dcw=dcw)

# ─── Per-fighter striking/grappling stats ──────────────────────────────────────
print("Computing striking/grappling averages...")
sig_landed = defaultdict(int); sig_att    = defaultdict(int)
td_landed  = defaultdict(int); td_att     = defaultdict(int)
sub_att_t  = defaultdict(int); rounds_f   = defaultdict(int)
early_sig  = defaultdict(int); late_sig   = defaultdict(int)
early_rds  = defaultdict(int); late_rds   = defaultdict(int)

stats_df['FIGHTER'] = stats_df['FIGHTER'].str.strip() if 'FIGHTER' in stats_df.columns else ''
stats_df['ROUND']   = stats_df['ROUND'].str.strip()   if 'ROUND'   in stats_df.columns else ''

for _, row in stats_df.iterrows():
    fighter = str(row.get('FIGHTER','')).strip()
    if not fighter or fighter == 'nan': continue
    round_str = str(row.get('ROUND','')).strip()
    try: rn = int(re.search(r'\d+', round_str).group())
    except: rn = 1
    sl, sa = parse_of(row.get('SIG.STR.',''))
    tl, ta = parse_of(row.get('TD',''))
    try: sub_a = int(float(str(row.get('SUB.ATT',0) or 0)))
    except: sub_a = 0
    sig_landed[fighter] += sl; sig_att[fighter] += sa
    td_landed[fighter]  += tl; td_att[fighter]  += ta
    sub_att_t[fighter]  += sub_a; rounds_f[fighter] += 1
    if rn <= 2: early_sig[fighter] += sl; early_rds[fighter] += 1
    else:        late_sig[fighter]  += sl; late_rds[fighter]  += 1

stat_updates = {}
cardio_data  = {}
for fighter in set(list(sig_landed.keys()) + list(td_landed.keys())):
    rds = rounds_f.get(fighter, 0)
    if rds == 0: continue
    minutes = rds * 5.0
    sl = sig_landed[fighter]; sa = sig_att[fighter]
    tl = td_landed[fighter];  ta = td_att[fighter]
    sub_a = sub_att_t[fighter]
    asl = round(sl/minutes, 4)       if minutes > 0 else None
    asp = round(sl/sa, 4)            if sa > 0      else None
    asa = round(sub_a/(rds/3), 4)    if rds > 0     else None
    atl = round(tl/minutes*15, 4)    if minutes > 0 else None
    atp = round(tl/ta, 4)            if ta > 0      else None
    e_rds = early_rds[fighter]; l_rds = late_rds[fighter]
    e_spr = early_sig[fighter]/e_rds if e_rds > 0 else 0
    l_spr = late_sig[fighter]/l_rds  if l_rds > 0 else 0
    if e_spr > 0 and l_rds > 0:
        crd = round(max(0.5, min(2.0, l_spr/e_spr)), 4)
    elif l_rds == 0 and e_rds > 0: crd = 0.5
    else: crd = 1.0
    stat_updates[fighter] = dict(asl=asl, asp=asp, asa=asa, atl=atl, atp=atp, crd=crd)
    cardio_data[fighter]  = crd

print(f"  Computed stats for {len(stat_updates)} fighters")

# ─── Incremental Elo update ────────────────────────────────────────────────────
print("\nRunning incremental Elo update...")

# Read existing eloModule.js — get cutoff date and current ratings
elo_content = open(ELO_PATH).read()
cutoff_m = re.search(r'CUTOFF_DATE:\s*(\d{4}-\d{2}-\d{2})', elo_content)
cutoff_date = cutoff_m.group(1) if cutoff_m else '2026-03-31'
print(f"  Elo cutoff date: {cutoff_date}")

json_m = re.search(r'export\s+const\s+ELO_RATINGS\s*=\s*(\{.+\});?\s*$', elo_content, re.DOTALL)
elo_ratings = json.loads(json_m.group(1))
print(f"  Loaded {len(elo_ratings)} existing Elo ratings")

# Exact formula from build_drosspom_model.ipynb
K_BASE = 32
def k_factor(method_upper):
    if 'KO' in method_upper or 'TKO' in method_upper: return K_BASE * 1.4
    if 'SUB' in method_upper: return K_BASE * 1.3
    return K_BASE

def expected_score(own_elo, opp_elo):
    return 1.0 / (1.0 + 10.0 ** ((opp_elo - own_elo) / 400.0))

# Collect fights AFTER cutoff date, sorted chronologically
new_fights = []
for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT',''))
    if fa is None: continue
    outcome = str(row.get('OUTCOME','')).strip()
    if outcome not in ('W/L','L/W'): continue
    dt = row['DATE']
    if not dt or dt <= cutoff_date: continue
    winner = fa if outcome == 'W/L' else fb
    loser  = fb if outcome == 'W/L' else fa
    method = str(row.get('METHOD','')).strip().upper()
    new_fights.append({'date': dt, 'winner': winner, 'loser': loser, 'method': method})

new_fights.sort(key=lambda x: x['date'])
print(f"  Found {len(new_fights)} new fights after {cutoff_date}")

DEFAULT_ELO = 1500.0
for fight in new_fights:
    w, l = fight['winner'], fight['loser']
    method = fight['method']
    w_rec = elo_ratings.get(w, {'elo': DEFAULT_ELO, 'peak': DEFAULT_ELO, 'n': 0})
    l_rec = elo_ratings.get(l, {'elo': DEFAULT_ELO, 'peak': DEFAULT_ELO, 'n': 0})
    w_elo = w_rec['elo']; l_elo = l_rec['elo']
    k   = k_factor(method)
    exp = expected_score(w_elo, l_elo)
    new_w = round(w_elo + k * (1.0 - exp), 1)
    new_l = round(l_elo + k * (0.0 - (1.0 - exp)), 1)
    elo_ratings[w] = {'elo': new_w, 'peak': max(w_rec.get('peak', new_w), new_w), 'n': w_rec['n'] + 1}
    elo_ratings[l] = {'elo': new_l, 'peak': l_rec.get('peak', new_l), 'n': l_rec['n'] + 1}

print(f"  Applied {len(new_fights)} Elo updates")

# Write updated eloModule.js with new cutoff date
new_cutoff = str(TODAY)
elo_header = (
    f"// ─── ELO RATINGS ────────────────────────────────────────────────────────\n"
    f"// CUTOFF_DATE: {new_cutoff}\n"
    f"// Computed from 8,435+ UFC fights (UFC 2 through {new_cutoff})\n"
    f"// K-factor: KO/TKO×1.4 · Sub×1.3 · Decision×1.0 · K_BASE=32\n"
    f"// Format: {{ fighterName: {{ elo, peak, n }} }}\n"
    f"// elo = current rating · peak = highest ever · n = UFC fights processed\n"
)
elo_js_data = json.dumps(elo_ratings, separators=(',',':'), ensure_ascii=False)
with open(ELO_PATH, 'w') as f:
    f.write(f"{elo_header}export const ELO_RATINGS = {elo_js_data};\n")
print(f"  Wrote {len(elo_ratings)} fighters to eloModule.js (cutoff → {new_cutoff})")

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

RECORD_FIELDS = ['wi','lo','ws','ls','tr','kow','sbw','dcw','dsl']
STAT_FIELDS   = ['asl','asp','asa','atl','atp','crd']
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
        for field in STAT_FIELDS:
            val = stat_updates[name].get(field)
            if val is not None:
                entry_str = patch_field(entry_str, field, round(val, 4))
    # Patch elo from incremental update
    if name in elo_ratings:
        entry_str = patch_field(entry_str, 'elo', elo_ratings[name]['elo'])
    new_lines.append(f"  {entry_str}")

new_js = "export const _D2 = [\n" + ",\n".join(new_lines) + "\n];\n"
with open(JS_PATH, 'w') as f:
    f.write(new_js)
print(f"  Patched {len(new_lines)} fighters")

# ─── Patch fightHistory.js ────────────────────────────────────────────────────
print("\nPatching fightHistory.js...")
fh_content = open(FH_PATH).read()
json_m2 = re.search(r'export\s+const\s+FIGHT_HISTORY\s*=\s*(\{.+\})\s*;?\s*$', fh_content, re.DOTALL)
fight_history = json.loads(json_m2.group(1))
updated_fh = 0; added_fights = 0

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
        updated_fh += 1; added_fights += len(new_entries)

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
    e = elo_ratings.get(name, {})
    print(f"  {name:25s} | {r.get('wi','?')}-{r.get('lo','?')} "
          f"| elo:{e.get('elo','?')} "
          f"| asl:{s.get('asl','?')} crd:{s.get('crd','?')} "
          f"| lfd:{r.get('lfd','?')}")
