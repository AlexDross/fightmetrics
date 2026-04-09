"""
FightMetrics — Fighter Data Update Script  v2.0
================================================
TARGETED UPDATE ONLY — preserves all hand-tuned values.

What this updates each Tuesday:
  - wi, lo        (win/loss record)
  - ws, ls        (win/loss streak)
  - lfd, dsl      (last fight date / days since last fight)
  - kow, sbw, dcw (win method counts)
  - tr            (total fights in DB)

What this NEVER touches:
  - asl, asp, asa, atl, atp  (stats that drive rankings)
  - elo, crd                 (rating components)
  - dr, p4p                  (rankings)
  - tb, wlb, ht, rh, st, w  (physical attributes)

Usage:
    pip install pandas
    python3 build_fighters_json.py
"""
import pandas as pd, json, re, os
from datetime import datetime, date

ROUND_DURATION = 300
OUTPUT_FILE    = "fighters.json"

# ─── Parsers ──────────────────────────────────────────────────────────────────
def parse_date(s):
    if not isinstance(s, str): return None
    try: return datetime.strptime(s.strip(), '%B %d, %Y').strftime('%Y-%m-%d')
    except: return None

def clean_wc(s):
    if not isinstance(s, str): return None
    s = s.strip()
    for w in ['UFC', 'Title', 'Bout', 'Interim']:
        s = re.sub(rf'\b{w}\b', '', s, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', s).strip()

def parse_ctrl(s):
    if not isinstance(s, str): return 0
    m = re.match(r'(\d+):(\d+)', s.strip())
    return int(m.group(1)) * 60 + int(m.group(2)) if m else 0

# ─── Load existing fightersData.js ────────────────────────────────────────────
print("Loading existing fightersData.js...")
_js_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'fightersData.js')
if not os.path.exists(_js_path):
    print("ERROR: src/fightersData.js not found!")
    exit(1)

js_content = open(_js_path).read()

# Parse all existing entries into a dict keyed by name
existing = {}
for m in re.finditer(r"\{n:'([^']+)'[^}]+\}", js_content):
    entry_str = m.group(0)
    name_m = re.search(r"n:'([^']+)'", entry_str)
    if not name_m: continue
    name = name_m.group(1)
    existing[name] = entry_str

print(f"  Found {len(existing)} fighters in existing file")

# ─── Load CSVs ────────────────────────────────────────────────────────────────
print("Loading CSVs...")
results_df = pd.read_csv('ufc_fight_results.csv', dtype=str)
events_df  = pd.read_csv('ufc_event_details.csv', dtype=str)

event_dates = dict(zip(
    events_df['EVENT'].str.strip(),
    events_df['DATE'].apply(parse_date)
))

results_df['EVENT'] = results_df['EVENT'].str.strip()
results_df['DATE']  = results_df['EVENT'].str.strip().map(event_dates)

# ─── Build fight records from CSVs ────────────────────────────────────────────
print("Parsing fight results...")

def split_bout(bout):
    parts = re.split(r'\s+vs\.?\s+', str(bout).strip(), maxsplit=1)
    return (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else (None, None)

fights_by_fighter = {}
for _, row in results_df.iterrows():
    fa, fb = split_bout(row.get('BOUT', ''))
    if fa is None: continue
    outcome = str(row.get('OUTCOME', '')).strip()
    if   outcome == 'W/L': winner = fa
    elif outcome == 'L/W': winner = fb
    else:                  winner = None
    method = str(row.get('METHOD', '')).strip().upper()

    for fighter, opponent in [(fa, fb), (fb, fa)]:
        if winner is None:        res = 'NC'
        elif fighter == winner:   res = 'W'
        else:                     res = 'L'
        fights_by_fighter.setdefault(fighter, []).append({
            'result': res,
            'date':   row['DATE'],
            'method': method,
        })

for n in fights_by_fighter:
    fights_by_fighter[n].sort(key=lambda x: x['date'] or '', reverse=True)

# ─── Compute updated fields per fighter ───────────────────────────────────────
print("Computing updated fields...")

TODAY = date.today()

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

updates = {}
for name, fights in fights_by_fighter.items():
    wi  = sum(1 for f in fights if f['result'] == 'W')
    lo  = sum(1 for f in fights if f['result'] == 'L')
    tr  = sum(1 for f in fights if f['result'] in ('W', 'L'))
    ws, ls = compute_streak(fights)

    dated = [f for f in fights if f['result'] in ('W', 'L', 'NC') and f['date']]
    lfd = dated[0]['date'] if dated else None
    dsl = (TODAY - date.fromisoformat(lfd)).days if lfd else None

    kow = sum(1 for f in fights if f['result'] == 'W' and any(x in f['method'] for x in ['KO', 'TKO']))
    sbw = sum(1 for f in fights if f['result'] == 'W' and 'SUB' in f['method'])
    dcw = sum(1 for f in fights if f['result'] == 'W' and 'DEC' in f['method'])

    updates[name] = {
        'wi': wi, 'lo': lo, 'ws': ws, 'ls': ls,
        'tr': tr, 'lfd': lfd, 'dsl': dsl,
        'kow': kow, 'sbw': sbw, 'dcw': dcw,
    }

# ─── Patch existing entries ────────────────────────────────────────────────────
print("Patching fightersData.js entries...")

def fmt(v):
    if v is None: return 'null'
    if isinstance(v, str): return f"'{v}'"
    return str(v)

def patch_field(entry_str, key, new_val):
    """Replace a specific field value in an entry string."""
    pattern = rf"({key}:)([-\d.']+|null)"
    replacement = rf"\g<1>{fmt(new_val)}"
    result = re.sub(pattern, replacement, entry_str)
    return result

FIELDS_TO_UPDATE = ['wi', 'lo', 'ws', 'ls', 'tr', 'kow', 'sbw', 'dcw', 'dsl']

updated_count = 0
new_js_lines = []

for name, entry_str in existing.items():
    if name in updates:
        u = updates[name]
        for field in FIELDS_TO_UPDATE:
            entry_str = patch_field(entry_str, field, u[field])
        # Handle lfd separately (string value)
        if u['lfd']:
            entry_str = re.sub(r"lfd:'[^']*'", f"lfd:'{u['lfd']}'", entry_str)
            entry_str = re.sub(r"lfd:null", f"lfd:'{u['lfd']}'", entry_str)
        updated_count += 1
    new_js_lines.append(f"  {entry_str}")

print(f"  Updated {updated_count} fighters")

# Add new fighters from CSV who aren't in existing file yet
new_count = 0
for name, u in updates.items():
    if name not in existing:
        # Skip fighters with very few fights
        if u['wi'] + u['lo'] < 2: continue
        entry = (
            f"{{n:'{name.replace(chr(39), chr(92)+chr(39))}',w:null,ag:null,ht:null,rh:null,"
            f"st:'Orthodox',wi:{u['wi']},lo:{u['lo']},ws:{u['ws']},ls:{u['ls']},"
            f"tr:{u['tr']},tb:0,kow:{u['kow']},sbw:{u['sbw']},dcw:{u['dcw']},"
            f"asl:null,asp:null,asa:null,atl:null,atp:null,elo:null,crd:0,"
            f"lfd:{fmt(u['lfd'])},dsl:{fmt(u['dsl'])},dr:null,p4p:null,wlb:null}}"
        )
        new_js_lines.append(f"  {entry}")
        new_count += 1

print(f"  Added {new_count} new fighters")

# ─── Write updated fightersData.js ────────────────────────────────────────────
new_js = "export const _D2 = [\n" + ",\n".join(new_js_lines) + "\n];\n"

with open(_js_path, 'w') as f:
    f.write(new_js)

print(f"\n✅  Done! fightersData.js updated — {len(new_js_lines)} total fighters")

# Sanity check
checks = ['Khamzat Chimaev', 'Islam Makhachev', 'Jon Jones', 'Renato Moicano', 'Chris Duncan']
for name in checks:
    if name in updates:
        u = updates[name]
        print(f"  {name:25s} | {u['wi']}-{u['lo']} | ws:{u['ws']} ls:{u['ls']} | lfd:{u['lfd']}")
