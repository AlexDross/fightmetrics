"""
DrossPom — Fighter Data Transform Script  v1.1
===============================================
Reads the 6 CSVs from Greco1899/scrape_ufc_stats and outputs fighters.json.
Auto-computes ELO ratings and fetches UFC rankings.

Usage:
    pip install pandas requests
    python3 build_fighters_json.py

Place this file in the same folder as the CSVs. Output: fighters.json
"""
import pandas as pd, json, re, os
from datetime import datetime, date

ROLLING_FIGHTS  = 5
MIN_UFC_FIGHTS  = 2
ROUND_DURATION  = 300
OUTPUT_FILE     = "fighters.json"

# ─── Parsers ──────────────────────────────────────────────────────────────────
def parse_of(s):
    if not isinstance(s, str): return (0,0)
    m = re.match(r'(\d+)\s+of\s+(\d+)', s.strip())
    return (int(m.group(1)), int(m.group(2))) if m else (0,0)

def parse_ctrl(s):
    if not isinstance(s, str): return 0
    m = re.match(r'(\d+):(\d+)', s.strip())
    return int(m.group(1))*60+int(m.group(2)) if m else 0

def parse_height(s):
    if not isinstance(s,str) or s.strip()=='--': return None
    m = re.match(r"(\d+)'\s*(\d+)\"", s.strip())
    return int(m.group(1))*12+int(m.group(2)) if m else None

def parse_reach(s):
    if not isinstance(s,str) or s.strip()=='--': return None
    m = re.match(r'([\d.]+)"', s.strip())
    return float(m.group(1)) if m else None

def parse_weight(s):
    if not isinstance(s,str): return None
    m = re.match(r'(\d+)\s*lbs', s.strip())
    return int(m.group(1)) if m else None

def parse_dob(s):
    if not isinstance(s,str) or not s.strip(): return None
    try: return datetime.strptime(s.strip(),'%b %d, %Y').strftime('%Y-%m-%d')
    except: return None

def calc_age(dob_str):
    if not dob_str: return None
    try:
        dob = datetime.strptime(dob_str,'%Y-%m-%d').date()
        t = date.today()
        return t.year-dob.year-((t.month,t.day)<(dob.month,dob.day))
    except: return None

def parse_date(s):
    if not isinstance(s,str): return None
    try: return datetime.strptime(s.strip(),'%B %d, %Y').strftime('%Y-%m-%d')
    except: return None

def clean_wc(s):
    if not isinstance(s,str): return None
    s = s.strip()
    s = re.sub(r'\bUFC\b',     '', s, flags=re.IGNORECASE)
    s = re.sub(r'\bTitle\b',   '', s, flags=re.IGNORECASE)
    s = re.sub(r'\bBout\b',    '', s, flags=re.IGNORECASE)
    s = re.sub(r'\bInterim\b', '', s, flags=re.IGNORECASE)
    return re.sub(r'\s+',' ',s).strip()

def safe_div(a,b,default=0.0): return a/b if b else default
def nan_int(v):
    try: return int(float(v)) if pd.notna(v) else 0
    except: return 0

# ─── Fetch UFC Rankings ───────────────────────────────────────────────────────
print("Fetching UFC rankings...")
ufc_div_rankings = {}   # name -> division rank
ufc_p4p_rankings = {}   # name -> p4p rank
try:
    import requests
    r = requests.get(
        'https://www.ufc.com/rankings',
        headers={'User-Agent': 'Mozilla/5.0'},
        timeout=15
    )
    html = r.text

    # Find all ranking blocks — each has a division title followed by a table
    blocks = re.split(r'<div[^>]+class="[^"]*view-grouping[^"]*"[^>]*>', html)
    p4p_rank = 1
    in_p4p = False

    for block in blocks:
        title_m = re.search(r'<div[^>]+class="[^"]*view-grouping-header[^"]*"[^>]*>\s*<h4[^>]*>([^<]+)</h4>', block)
        if not title_m:
            # fallback: look for any h4
            title_m = re.search(r'<h4[^>]*>([^<]+)</h4>', block)
        if not title_m:
            continue
        div_title = title_m.group(1).strip()
        is_p4p = 'pound' in div_title.lower()

        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', block, re.DOTALL)
        rank = 1
        for row in rows:
            name_m = re.search(r'class="[^"]*athlete-name[^"]*"[^>]*>\s*<a[^>]*>([^<]+)</a>', row)
            if not name_m:
                name_m = re.search(r'athlete-name[^>]*>([^<]+)<', row)
            if not name_m:
                continue
            name = name_m.group(1).strip()
            if is_p4p:
                ufc_p4p_rankings[name] = rank
            else:
                ufc_div_rankings[name] = rank
            rank += 1

    print(f"  Division rankings: {len(ufc_div_rankings)} fighters")
    print(f"  P4P rankings: {len(ufc_p4p_rankings)} fighters")
except Exception as e:
    print(f"  Warning: Could not fetch UFC rankings ({e}) — will use existing values")

# ─── Load CSVs ────────────────────────────────────────────────────────────────
print("Loading CSVs...")
stats_df   = pd.read_csv('ufc_fight_stats.csv',   dtype=str)
results_df = pd.read_csv('ufc_fight_results.csv', dtype=str)
events_df  = pd.read_csv('ufc_event_details.csv', dtype=str)
tott_df    = pd.read_csv('ufc_fighter_tott.csv',  dtype=str)

event_dates = dict(zip(events_df['EVENT'].str.strip(), events_df['DATE'].apply(parse_date)))

tott_lookup = {}
for _,r in tott_df.iterrows():
    st = r.get('STANCE','')
    tott_lookup[r['FIGHTER']] = {
        'height_in':  parse_height(r.get('HEIGHT')),
        'weight_lbs': parse_weight(r.get('WEIGHT')),
        'reach_in':   parse_reach(r.get('REACH')),
        'stance':     st if isinstance(st,str) and st.strip() not in ('','--') else None,
        'dob':        parse_dob(r.get('DOB')),
    }

# ─── Parse fight results ──────────────────────────────────────────────────────
print("Parsing results...")
results_df['EVENT'] = results_df['EVENT'].str.strip()
results_df['DATE']  = results_df['EVENT'].str.strip().map(event_dates)

def split_bout(bout):
    parts = re.split(r'\s+vs\.?\s+', str(bout).strip(), maxsplit=1)
    return (parts[0].strip(), parts[1].strip()) if len(parts)==2 else (None,None)

fights_by_fighter = {}
for _,row in results_df.iterrows():
    fa,fb = split_bout(row.get('BOUT',''))
    if fa is None: continue
    outcome = str(row.get('OUTCOME','')).strip()
    if   outcome=='W/L': winner=fa
    elif outcome=='L/W': winner=fb
    else:                winner=None
    wc = clean_wc(row.get('WEIGHTCLASS',''))
    for fighter,opponent in [(fa,fb),(fb,fa)]:
        if winner is None:         res='NC'
        elif fighter==winner:      res='W'
        else:                      res='L'
        fights_by_fighter.setdefault(fighter,[]).append({
            'fighter':fighter,'opponent':opponent,'event':row['EVENT'],'date':row['DATE'],
            'weight_class':wc,'method':str(row.get('METHOD','')).strip(),
            'result':res,'end_round':row.get('ROUND'),'fight_time':str(row.get('TIME','')).strip(),
        })

for n in fights_by_fighter:
    fights_by_fighter[n].sort(key=lambda x: x['date'] or '', reverse=True)

# ─── Parse per-round stats ────────────────────────────────────────────────────
print("Parsing per-round stats...")

def parse_stat_row(row):
    sl,sa = parse_of(row.get('SIG.STR.'))
    tl,ta = parse_of(row.get('TD'))
    tot_l,_ = parse_of(row.get('TOTAL STR.'))
    return {
        'kd':               nan_int(row.get('KD')),
        'sig_str_landed':   sl, 'sig_str_attempted': sa,
        'td_landed':        tl, 'td_attempted':      ta,
        'sub_att':          nan_int(row.get('SUB.ATT')),
        'ctrl_sec':         parse_ctrl(row.get('CTRL')),
        'total_str_landed': tot_l,
    }

stats_lookup = {}
for _,row in stats_df.iterrows():
    key = (str(row.get('EVENT','')).strip(), str(row.get('BOUT','')).strip(), str(row.get('ROUND','')).strip())
    fighter = str(row.get('FIGHTER','')).strip()
    stats_lookup.setdefault(key,{})[fighter] = parse_stat_row(row)

ROUND_LABELS = ['Round 1','Round 2','Round 3','Round 4','Round 5']

def round_label(s):
    m = re.match(r'Round\s+(\d+)',str(s).strip(),re.IGNORECASE)
    if m:
        n=int(m.group(1))
        if n==1: return 'r1'
        if n==2: return 'r2'
        return 'r3plus'
    return None

def fight_dur_sec(end_round, fight_time):
    try: er=int(float(str(end_round)))
    except: er=1
    return (er-1)*ROUND_DURATION + parse_ctrl(fight_time)

# ─── Build profiles ───────────────────────────────────────────────────────────
print("Building fighter profiles...")
profiles = []

for name, fight_list in fights_by_fighter.items():
    scored = [f for f in fight_list if f['result'] in ('W','L')]
    if len(scored) < MIN_UFC_FIGHTS: continue

    wins   = sum(1 for f in fight_list if f['result']=='W')
    losses = sum(1 for f in fight_list if f['result']=='L')
    ncs    = sum(1 for f in fight_list if f['result']=='NC')
    wc     = fight_list[0]['weight_class'] if fight_list else None
    tott   = tott_lookup.get(name,{})

    # true_lfd from raw results — not filtered by stats availability
    all_fights_sorted = sorted(
        [f for f in fight_list if f['result'] in ('W','L','NC')],
        key=lambda x: x['date'] or '', reverse=True
    )
    true_lfd = all_fights_sorted[0]['date'] if all_fights_sorted else None

    fight_history = []
    for fight in scored:
        event,opponent = fight['event'],fight['opponent']
        bout_opts = [f"{name} vs. {opponent}", f"{opponent} vs. {name}"]
        round_lists = {'r1':[],'r2':[],'r3plus':[]}
        for bout_str in bout_opts:
            for rnd_str in ROUND_LABELS:
                key=(event,bout_str,rnd_str)
                if key in stats_lookup and name in stats_lookup[key]:
                    s=stats_lookup[key][name]
                    lbl=round_label(rnd_str)
                    if lbl: round_lists[lbl].append(s)
        all_rounds = round_lists['r1']+round_lists['r2']+round_lists['r3plus']
        if not all_rounds: continue
        total = {k:sum(s.get(k,0) for s in all_rounds) for k in all_rounds[0]}
        dur_sec = fight_dur_sec(fight['end_round'],fight['fight_time'])
        fight_history.append({
            'event':event,'date':fight['date'],'opponent':opponent,
            'result':fight['result'],'method':fight['method'],
            'end_round':fight['end_round'],'fight_time':fight['fight_time'],
            'duration_sec':dur_sec,'totals':total,
            'round_sums': {lbl:{k:sum(s.get(k,0) for s in lst) for k in (lst[0] if lst else {})} for lbl,lst in round_lists.items() if lst},
            'round_counts': {lbl:len(lst) for lbl,lst in round_lists.items() if lst},
        })

    if not fight_history: continue
    recent = fight_history[:ROLLING_FIGHTS]

    def rpm(key):
        return safe_div(sum(f['totals'].get(key,0) for f in recent),
                        sum(max(f['duration_sec']/60.0,0.5) for f in recent))
    def racc(lk,ak):
        return safe_div(sum(f['totals'].get(lk,0) for f in recent),
                        sum(f['totals'].get(ak,0) for f in recent))
    def rctrl():
        return safe_div(sum(f['totals'].get('ctrl_sec',0) for f in recent),
                        sum(f['duration_sec'] for f in recent))
    def rnd_pm(lbl,key):
        tv=sum(f['round_sums'].get(lbl,{}).get(key,0) for f in recent if lbl in f['round_sums'])
        tr=sum(f['round_counts'].get(lbl,0) for f in recent if lbl in f['round_counts'])
        return safe_div(tv,tr*5.0) if tr else None
    def rnd_acc(lbl,lk,ak):
        l=sum(f['round_sums'].get(lbl,{}).get(lk,0) for f in recent if lbl in f['round_sums'])
        a=sum(f['round_sums'].get(lbl,{}).get(ak,0) for f in recent if lbl in f['round_sums'])
        return safe_div(l,a) if a else None
    def rnd_ctrl(lbl):
        c=sum(f['round_sums'].get(lbl,{}).get('ctrl_sec',0) for f in recent if lbl in f['round_sums'])
        n=sum(f['round_counts'].get(lbl,0) for f in recent if lbl in f['round_counts'])
        return safe_div(c,n*ROUND_DURATION) if n else None

    r1_pm = rnd_pm('r1','sig_str_landed')
    r3_pm = rnd_pm('r3plus','sig_str_landed')
    cardio = safe_div(r3_pm,r1_pm,1.0) if r1_pm and r3_pm else None

    ko_wins  = sum(1 for f in fight_history if f['result']=='W' and any(x in f['method'] for x in ['KO','TKO']))
    sub_wins = sum(1 for f in fight_history if f['result']=='W' and 'SUB' in f['method'].upper())
    total_scored = len(fight_history)

    profiles.append({
        'name':name,'weight_class':wc,
        'record':f"{wins}-{losses}"+(f"-{ncs}NC" if ncs else ""),
        'wins':wins,'losses':losses,
        'true_lfd':true_lfd,
        'age':calc_age(tott.get('dob')),'dob':tott.get('dob'),
        'height_in':tott.get('height_in'),'weight_lbs':tott.get('weight_lbs'),
        'reach_in':tott.get('reach_in'),'stance':tott.get('stance'),
        'fights_in_db':total_scored,
        'stats':{
            'sig_str_per_min':    round(rpm('sig_str_landed'),3),
            'sig_str_abs_per_min':0.0,
            'sig_str_acc':        round(racc('sig_str_landed','sig_str_attempted'),3),
            'td_per_15':          round(rpm('td_landed')*15,3),
            'td_acc':             round(racc('td_landed','td_attempted'),3),
            'ctrl_pct':           round(rctrl(),3),
            'kd_per_min':         round(rpm('kd'),4),
            'sub_att_per_min':    round(rpm('sub_att'),4),
            'finish_rate':        round(safe_div(ko_wins+sub_wins,wins) if wins else 0,3),
            'ko_rate':            round(safe_div(ko_wins,wins) if wins else 0,3),
            'sub_rate':           round(safe_div(sub_wins,wins) if wins else 0,3),
            'win_pct':            round(safe_div(wins,total_scored),3),
        },
        'round_stats':{
            'r1':    {'sig_str_per_min':r1_pm,   'sig_str_acc':rnd_acc('r1','sig_str_landed','sig_str_attempted'),    'td_per_15':(rnd_pm('r1','td_landed') or 0)*15,    'ctrl_pct':rnd_ctrl('r1'),    'kd_per_min':rnd_pm('r1','kd')},
            'r2':    {'sig_str_per_min':rnd_pm('r2','sig_str_landed'), 'sig_str_acc':rnd_acc('r2','sig_str_landed','sig_str_attempted'), 'td_per_15':(rnd_pm('r2','td_landed') or 0)*15, 'ctrl_pct':rnd_ctrl('r2'), 'kd_per_min':rnd_pm('r2','kd')},
            'r3plus':{'sig_str_per_min':r3_pm,   'sig_str_acc':rnd_acc('r3plus','sig_str_landed','sig_str_attempted'),'td_per_15':(rnd_pm('r3plus','td_landed') or 0)*15,'ctrl_pct':rnd_ctrl('r3plus'),'kd_per_min':rnd_pm('r3plus','kd')},
        },
        'cardio_ratio':round(cardio,3) if cardio else None,
        'fight_history':[{
            'event':f['event'],'date':f['date'],'opponent':f['opponent'],
            'result':f['result'],'method':f['method'],
            'end_round':f['end_round'],'time':f['fight_time'],
            'kd':f['totals'].get('kd',0),
            'sig_str_landed':f['totals'].get('sig_str_landed',0),
            'sig_str_attempted':f['totals'].get('sig_str_attempted',0),
            'td_landed':f['totals'].get('td_landed',0),
            'td_attempted':f['totals'].get('td_attempted',0),
            'ctrl_sec':f['totals'].get('ctrl_sec',0),
            'sub_att':f['totals'].get('sub_att',0),
            'duration_sec':f['duration_sec'],
        } for f in fight_history],
        '_fh_raw':fight_history,
    })

print(f"  Built {len(profiles)} profiles.")

# ─── Absorption pass ──────────────────────────────────────────────────────────
print("Computing absorption stats...")
plookup = {p['name']:p for p in profiles}

for p in profiles:
    absorbed=[]
    for fh in p['_fh_raw'][:ROLLING_FIGHTS]:
        opp=plookup.get(fh['opponent'])
        if not opp: continue
        match=next((f for f in opp['_fh_raw'] if f['opponent']==p['name'] and f['event']==fh['event']),None)
        if not match: continue
        dur_min=max(fh['duration_sec']/60.0,0.5)
        absorbed.append(safe_div(match['totals'].get('sig_str_landed',0),dur_min))
    if absorbed:
        p['stats']['sig_str_abs_per_min']=round(sum(absorbed)/len(absorbed),3)

for p in profiles: del p['_fh_raw']

# ─── ELO Computation ──────────────────────────────────────────────────────────
print("Computing ELO ratings...")

BASE_ELO    = 1500
K_BASE      = 32
K_EARLY     = 48    # inflated K for first 5 UFC fights
K_FINISH    = 1.4   # multiplier for KO/TKO/Sub
K_EARLY_RND = 1.2   # additional multiplier for R1/R2 finish

def get_k(n_fights, method, end_round):
    k = K_EARLY if n_fights <= 5 else K_BASE
    method_up = str(method).upper()
    if any(x in method_up for x in ['KO','TKO','SUB']):
        k *= K_FINISH
        try:
            if int(float(str(end_round))) <= 2:
                k *= K_EARLY_RND
        except: pass
    return k

def elo_expected(ra, rb):
    return 1 / (1 + 10 ** ((rb - ra) / 400))

# Build deduplicated chronological bout list
all_bouts = []
seen_bouts = set()
for name, fight_list in fights_by_fighter.items():
    for f in fight_list:
        if f['result'] == 'W' and f['date']:
            key = (f['date'], tuple(sorted([name, f['opponent']])))
            if key not in seen_bouts:
                seen_bouts.add(key)
                all_bouts.append({
                    'date':      f['date'],
                    'winner':    name,
                    'loser':     f['opponent'],
                    'method':    f['method'],
                    'end_round': f['end_round'],
                })

all_bouts = [b for b in all_bouts if b['date'] and b['date'] >= '2001-01-01']
all_bouts.sort(key=lambda x: x['date'])

elo_ratings = {}
elo_peak    = {}
elo_n       = {}

for b in all_bouts:
    w, l = b['winner'], b['loser']
    elo_ratings.setdefault(w, BASE_ELO)
    elo_ratings.setdefault(l, BASE_ELO)
    elo_peak.setdefault(w, BASE_ELO)
    elo_peak.setdefault(l, BASE_ELO)
    elo_n[w] = elo_n.get(w, 0) + 1
    elo_n[l] = elo_n.get(l, 0) + 1

    ra, rb = elo_ratings[w], elo_ratings[l]
    ea = elo_expected(ra, rb)
    k  = get_k(elo_n[w], b['method'], b['end_round'])

    elo_ratings[w] = round(ra + k * (1 - ea))
    elo_ratings[l] = round(rb + k * (0 - (1 - ea)))
    elo_peak[w]    = max(elo_peak[w], elo_ratings[w])
    elo_peak[l]    = max(elo_peak[l], elo_ratings[l])

# Inject ELO into profiles
for p in profiles:
    p['elo'] = elo_ratings.get(p['name'])

print(f"  ELO computed for {len(elo_ratings)} fighters.")

# ─── Output ───────────────────────────────────────────────────────────────────
profiles.sort(key=lambda p: p['name'])

def rf(obj,d=4):
    if isinstance(obj,float): return round(obj,d)
    if isinstance(obj,dict):  return {k:rf(v,d) for k,v in obj.items()}
    if isinstance(obj,list):  return [rf(v,d) for v in obj]
    return obj

out = rf(profiles)
with open(OUTPUT_FILE,'w') as f: json.dump(out,f,indent=2)

print(f"\n✅  Done! {OUTPUT_FILE} — {len(out)} fighters.")

# Sanity check
checks = ['Israel Adesanya','Jon Jones','Islam Makhachev','Alex Pereira','Dricus Du Plessis']
for name in checks:
    p=next((x for x in out if x['name']==name),None)
    if p:
        print(f"  {p['name']:25s} | {(p['weight_class'] or '?'):22s} | {p['record']:8s} | elo={p.get('elo','?')} | cardio={str(p['cardio_ratio']):5s} | sig/min={p['stats']['sig_str_per_min']}")

# ─── Export fightersData.js (short-key format for React app) ──────────────────
print("\nConverting to fightersData.js format...")

import re as _re
from datetime import date as _date

# Load existing fightersData.js to preserve title bouts (tb) only
# ELO, dr, p4p are now computed automatically
_old_tb = {}
_old_dr = {}
_old_p4p = {}
_js_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'fightersData.js')
if os.path.exists(_js_path):
    _js = open(_js_path).read()
    for _m in _re.finditer(r"\{n:'([^']+)'[^}]+\}", _js):
        _s = _m.group(0)
        _nm = _re.search(r"n:'([^']+)'", _s).group(1)
        def _gv(key, s=_s):
            m = _re.search(rf"{key}:([-\d.]+|null)", s)
            if not m or m.group(1) == 'null': return None
            return float(m.group(1))
        _old_tb[_nm]  = int(_gv('tb') or 0)
        _old_dr[_nm]  = _gv('dr')
        _old_p4p[_nm] = _gv('p4p')
    print(f"  Loaded title bouts for {len(_old_tb)} fighters from existing fightersData.js")
else:
    print("  No existing fightersData.js found")

TODAY = _date.today()

def _streak(fight_history):
    ws = ls = 0
    for fh in fight_history:
        r = fh.get('result')
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

def _fmt(v):
    if v is None: return 'null'
    if isinstance(v, str): return "'" + v.replace("'", "\\'") + "'"
    if isinstance(v, float):
        return str(int(v)) if v == int(v) and abs(v) < 1e9 else str(v)
    return str(v)

js_lines = []
for p in sorted(out, key=lambda x: x['name']):
    nm  = p['name']
    fh  = p.get('fight_history', [])

    lfd = p.get('true_lfd') or (fh[0]['date'] if fh else None)
    dsl = (TODAY - _date.fromisoformat(lfd)).days if lfd else None

    ws, ls = _streak(fh)

    kow = sum(1 for f in fh if f['result']=='W' and any(x in f.get('method','').upper() for x in ['KO','TKO']))
    sbw = sum(1 for f in fh if f['result']=='W' and 'SUB' in f.get('method','').upper())
    dcw = sum(1 for f in fh if f['result']=='W' and 'DEC' in f.get('method','').upper())

    st  = p.get('stats', {})

    # Rankings: use freshly scraped values, fall back to existing
    dr  = ufc_div_rankings.get(nm) or _old_dr.get(nm)
    p4p = ufc_p4p_rankings.get(nm) or _old_p4p.get(nm)

# ELO: prefer existing calibrated value, fall back to computed for new fighters
    elo = p.get('elo')

    entry = {
        'n':   nm,
        'w':   p.get('weight_class'),
        'ag':  p.get('age'),
        'ht':  p.get('height_in'),
        'rh':  p.get('reach_in'),
        'st':  p.get('stance', 'Orthodox'),
        'wi':  p.get('wins', 0),
        'lo':  p.get('losses', 0),
        'ws':  ws,
        'ls':  ls,
        'tr':  p.get('fights_in_db', 0),
        'tb':  _old_tb.get(nm, 0),
        'kow': kow,
        'sbw': sbw,
        'dcw': dcw,
        'asl': round(st.get('sig_str_per_min', 0), 4),
        'asp': round(st.get('sig_str_acc', 0), 4),
        'asa': round(st.get('sig_str_abs_per_min', 0), 4),
        'atl': round(st.get('td_per_15', 0), 4),
        'atp': round(st.get('td_acc', 0), 4),
        'elo': elo,
        'crd': round(p.get('cardio_ratio') or 0, 4),
        'lfd': lfd,
        'dsl': dsl,
        'dr':  dr,
        'p4p': p4p,
        'wlb': p.get('weight_lbs'),
    }
    inner = ','.join(f"{k}:{_fmt(v)}" for k, v in entry.items())
    js_lines.append(f"  {{{inner}}}")

js_out = "export const _D2 = [\n" + ",\n".join(js_lines) + "\n];\n"

_out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'fightersData.js')
with open(_out_path, 'w') as _f:
    _f.write(js_out)
print(f"✅  fightersData.js written — {len(js_lines)} fighters → {_out_path}")
