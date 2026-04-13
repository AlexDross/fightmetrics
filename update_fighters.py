"""
FightMetrics — Full Auto-Update Script v4.0
============================================
Updates ALL dynamic fighter data from Greco1899 CSVs:

fightersData.js:  wi, lo, ws, ls, lfd, dsl, kow, sbw, dcw, tr (records)
                  asl, asp, asa, atl, atp (striking/grappling averages)
                  elo (Elo rating), crd (cardio ratio)

fightHistory.js:  adds new fight entries for existing fighters
eloModule.js:     full recompute of ELO_RATINGS from all fight history
cardioModule.js:  full recompute of CARDIO_RATIOS from per-round stats

NEVER touches: dr, p4p (rankings), tb, ht, rh, st, w, ag (physical/manual)
"""

import pandas as pd
import re
import os
import json
from datetime import datetime, date
from collections import defaultdict

SRC     = os.path.dirname(os.path.abspath(__file__))
JS_PATH = os.path.join(SRC, 'src', 'fightersData.js')
FH_PATH = os.path.join(SRC, 'src', 'fightHistory.js')
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
    """Parse 'X of Y' string, return (landed, attempted)"""
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

# Build event date map
event_dates = dict(zip(events_df['EVENT'].str.strip(), events_df['DATE'].apply(parse_date)))
results_df['EVENT'] = results_df['EVENT'].str.strip()
results_df['DATE']  = results_df['EVENT'].map(event_dates)
results_df['BOUT']  = results_df['BOUT'].str.strip() if 'BOUT' in results_df.columns else ''

# Build fight_details lookup
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

res_cols = results_df.columns.tolist()
has_round = 'ROUND' in res_cols
has_time  = 'TIME'  in res_cols

print(f"  Results: {len(results_df)} rows | Stats: {len(stats_df)} rows")

# ─── Build fight records from results CSV ─────────────────────────────────────
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

# ─── Compute per-fighter striking/grappling stats from fight_stats.csv ────────
print("Computing striking/grappling averages from fight_stats.csv...")

# Accumulators per fighter
sig_landed = defaultdict(int)
sig_att    = defaultdict(int)
td_landed  = defaultdict(int)
td_att     = defaultdict(int)
sub_att_total = defaultdict(int)
rounds_fought = defaultdict(int)

# For cardio: early (R1-2) vs late (R3+) sig strikes
early_sig = defaultdict(int)
late_sig   = defaultdict(int)
early_rounds = defaultdict(int)
late_rounds  = defaultdict(int)

stats_df['FIGHTER'] = stats_df['FIGHTER'].str.strip() if 'FIGHTER' in stats_df.columns else ''
stats_df['ROUND']   = stats_df['ROUND'].str.strip()   if 'ROUND'   in stats_df.columns else ''

for _, row in stats_df.iterrows():
    fighter = str(row.get('FIGHTER', '')).strip()
    if not fighter or fighter == 'nan': continue

    round_str = str(row.get('ROUND', '')).strip()
    try:
        round_num = int(re.search(r'\d+', round_str).group())
    except:
        round_num = 1

    sl, sa = parse_of(row.get('SIG.STR.', ''))
    tl, ta = parse_of(row.get('TD', ''))
    sub_a   = int(float(str(row.get('SUB.ATT', 0) or 0)))

    sig_landed[fighter] += sl
    sig_att[fighter]    += sa
    td_landed[fighter]  += tl
    td_att[fighter]     += ta
    sub_att_total[fighter] += sub_a
    rounds_fought[fighter] += 1

    if round_num <= 2:
        early_sig[fighter]    += sl
        early_rounds[fighter] += 1
    else:
        late_sig[fighter]    += sl
        late_rounds[fighter] += 1

# Compute averages
stat_updates = {}
for fighter in set(list(sig_landed.keys()) + list(td_landed.keys())):
    rds = rounds_fought.get(fighter, 0)
    if rds == 0: continue
    minutes = rds * 5.0

    sl = sig_landed.get(fighter, 0)
    sa = sig_att.get(fighter, 0)
    tl = td_landed.get(fighter, 0)
    ta = td_att.get(fighter, 0)
    sub_a = sub_att_total.get(fighter, 0)

    asl = round(sl / minutes, 4) if minutes > 0 else None          # sig strikes per min
    asp = round(sl / sa, 4) if sa > 0 else None                    # sig strike accuracy
    asa = round(sub_a / (rds / 3), 4) if rds > 0 else None        # sub att per 15 min
    atl = round(tl / minutes * 15, 4) if minutes > 0 else None    # td per 15 min
    atp = round(tl / ta, 4) if ta > 0 else None                    # td accuracy

    # Cardio ratio: late-round sig per round / early-round sig per round
    e_rds = early_rounds.get(fighter, 0)
    l_rds = late_rounds.get(fighter, 0)
    e_spr = early_sig.get(fighter, 0) / e_rds if e_rds > 0 else 0
    l_spr = late_sig.get(fighter, 0) / l_rds  if l_rds > 0 else 0

    if e_spr > 0 and l_rds > 0:
        crd = round(l_spr / e_spr, 4)
        crd = max(0.5, min(2.0, crd))   # clamp to [0.5, 2.0] like original
    elif l_rds == 0 and e_rds > 0:
        crd = 0.5  # never went to late rounds
    else:
        crd = 1.0  # insufficient data

    stat_updates[fighter] = dict(asl=asl, asp=asp, asa=asa, atl=atl, atp=atp, crd=crd)

print(f"  Computed stats for {len(stat_updates)} fighters")

# ─── Compute Elo ratings ──────────────────────────────────────────────────────
print("Computing Elo ratings from full fight history...")

DEFAULT_ELO = 1500.0
elo_ratings = defaultdict(lambda: DEFAULT_ELO)
elo_peak    = defaultdict(lambda: DEFAULT_ELO)
elo_n       = defaultdict(int)

def expected_elo(a, b):
    return 1.0 / (1.0 + 10.0 ** ((b - a) / 400.0))

def k_factor(method_upper, n_fights):
    k = 20.0
    if n_fights < 5: k *= 1.8   # early career inflation
    elif n_fights < 10: k *= 1.3
    if any(x in method_upper for x in ['KO', 'TKO']): k *= 1.4
    elif 'SUB' in method_upper: k *= 1.25
    return k

# Sort all fights chronologically
all_fights = []
for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT', ''))
    if fa is None: continue
    outcome = str(row.get('OUTCOME', '')).strip()
    if outcome not in ('W/L', 'L/W'): continue  # skip NC/draws for Elo
    winner = fa if outcome == 'W/L' else fb
    loser  = fb if outcome == 'W/L' else fa
    method = str(row.get('METHOD', '')).strip().upper()
    dt     = row['DATE']
    if not dt: continue
    all_fights.append({'date': dt, 'winner': winner, 'loser': loser, 'method': method})

all_fights.sort(key=lambda x: x['date'])

for fight in all_fights:
    w, l = fight['winner'], fight['loser']
    method = fight['method']
    w_elo = elo_ratings[w]
    l_elo = elo_ratings[l]
    exp_w = expected_elo(w_elo, l_elo)
    k_w = k_factor(method, elo_n[w])
    k_l = k_factor(method, elo_n[l])
    delta_w = k_w * (1.0 - exp_w)
    delta_l = k_l * (0.0 - (1.0 - exp_w))
    elo_ratings[w] = round(w_elo + delta_w, 1)
    elo_ratings[l] = round(l_elo + delta_l, 1)
    elo_n[w] += 1
    elo_n[l] += 1
    if elo_ratings[w] > elo_peak[w]: elo_peak[w] = elo_ratings[w]
    if elo_ratings[l] > elo_peak[l]: elo_peak[l] = elo_ratings[l]

print(f"  Computed Elo for {len(elo_ratings)} fighters ({len(all_fights)} fights processed)")

# ─── Load fightersData.js ──────────────────────────────────────────────────────
print("\nPatching fightersData.js...")
if not os.path.exists(JS_PATH):
    print(f"ERROR: {JS_PATH} not found!"); exit(1)

js_content = open(JS_PATH).read()
existing = {}
for m in re.finditer(r"\{n:'([^']+)'[^}]+\}", js_content):
    entry_str = m.group(0)
    name_m = re.search(r"n:'([^']+)'", entry_str)
    if name_m: existing[name_m.group(1)] = entry_str

print(f"  Found {len(existing)} fighters in fightersData.js")

RECORD_FIELDS = ['wi','lo','ws','ls','tr','kow','sbw','dcw','dsl']
STAT_FIELDS   = ['asl','asp','asa','atl','atp']

wc_lookup = {}
for name, entry_str in existing.items():
    wc_m = re.search(r"w:'([^']*)'", entry_str)
    if wc_m: wc_lookup[name] = wc_m.group(1)

updated_fd = 0
new_lines = []

for name, entry_str in existing.items():
    # Patch record fields
    if name in record_updates:
        u = record_updates[name]
        for field in RECORD_FIELDS:
            entry_str = patch_field(entry_str, field, u[field])
        if u['lfd']:
            entry_str = re.sub(r",lfd:'[^']*'", f",lfd:'{u['lfd']}'", entry_str)
            entry_str = re.sub(r",lfd:null",     f",lfd:'{u['lfd']}'", entry_str)

    # Patch striking/grappling stats
    if name in stat_updates:
        s = stat_updates[name]
        for field in STAT_FIELDS:
            val = s.get(field)
            if val is not None:
                entry_str = patch_field(entry_str, field, round(val, 4))
        # Patch crd
        crd = s.get('crd')
        if crd is not None:
            entry_str = patch_field(entry_str, 'crd', round(crd, 4))

    # Patch Elo
    if name in elo_ratings and elo_n[name] > 0:
        entry_str = patch_field(entry_str, 'elo', elo_ratings[name])

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

# ─── Update eloModule.js ──────────────────────────────────────────────────────
print("\nUpdating eloModule.js...")
elo_data = {}
for name in elo_ratings:
    if elo_n[name] < 2: continue  # skip fighters with only 1 fight
    elo_data[name] = {
        'elo':  elo_ratings[name],
        'peak': elo_peak[name],
        'n':    elo_n[name]
    }

elo_comment = (
    f"// ─── ELO RATINGS ─────────────────────────────────────────────────────\n"
    f"// Auto-computed from {len(all_fights)} UFC fights through {TODAY}\n"
    f"// K-factor weighted by finish method; early-fighter K inflated\n"
    f"// Format: {{ fighterName: {{ elo, peak, n }} }}\n"
)
elo_js_data = json.dumps(elo_data, separators=(',', ':'), ensure_ascii=False)
elo_js = f"{elo_comment}export const ELO_RATINGS = {elo_js_data};\n"
with open(ELO_PATH, 'w') as f:
    f.write(elo_js)
print(f"  Wrote {len(elo_data)} fighters to eloModule.js")

# ─── Update cardioModule.js ───────────────────────────────────────────────────
print("\nUpdating cardioModule.js...")
cardio_data = {}
for name, s in stat_updates.items():
    crd = s.get('crd')
    if crd is not None:
        cardio_data[name] = crd

cardio_comment = (
    f"// ─── DATA-DERIVED CARDIO RATIOS ─────────────────────────────────────\n"
    f"// Auto-computed from {len(stats_df)} round-level stats rows\n"
    f"// Ratio = late-round (R3+) sig strikes per round ÷ early-round (R1-2)\n"
    f"// > 1.0 = gets stronger late · < 1.0 = fades · baseline ≈ 1.0\n"
)
cardio_js_data = json.dumps(cardio_data, separators=(',', ':'), ensure_ascii=False)
cardio_js = f"{cardio_comment}export const CARDIO_RATIOS = {cardio_js_data};\n"
with open(CARDIO_PATH, 'w') as f:
    f.write(cardio_js)
print(f"  Wrote {len(cardio_data)} fighters to cardioModule.js")

# ─── Sanity check ─────────────────────────────────────────────────────────────
print(f"\n✅  Full update complete — {TODAY}")
checks = ['Renato Moicano','Islam Makhachev','Jon Jones','Khamzat Chimaev','Alex Pereira']
print("\nSanity check:")
for name in checks:
    rec = record_updates.get(name, {})
    st  = stat_updates.get(name, {})
    elo_val = elo_ratings.get(name, 'n/a')
    print(f"  {name:25s} | {rec.get('wi','?')}-{rec.get('lo','?')} "
          f"| elo:{elo_val} "
          f"| asl:{st.get('asl','?')} asp:{st.get('asp','?')} "
          f"| crd:{st.get('crd','?')} "
          f"| lfd:{rec.get('lfd','?')}")
