#!/usr/bin/env python3
"""
test_new_fields.py — Stage 3: do sapm / sdef / kd / ctrl improve the baseline?

NON-DESTRUCTIVE. Writes nothing. Touches no committed file. It reads the
already-committed backtest_results_elo.json (which carries composite_elo per
fight) and recomputes the final SOS@0.10+Mom@0.03 pick accuracy in memory,
reusing backtest_combo_v2.py's own SOS/momentum/sigmoid logic via import
(so the harness math is identical — backtest_combo_v2.py is NOT modified).

The four fields are NOT in ufc-master.csv, so each fighter's value is
reconstructed POINT-IN-TIME from Greco ufc_fight_stats.csv: for every fight we
sum only that fighter's bouts STRICTLY BEFORE the fight date (no look-ahead).
Opponent pairing (for sapm/sdef) uses the (EVENT,BOUT) grouping.

Each field is blended toward a frozen mean with the same min(1,totalMin/75)
trust rule as the base composite, then added as clamp(diff/S)*W to composite_elo
before SOS/Mom + sigmoid. Baseline to beat: 59.29% (2004/3380).
"""

import csv, json, re, pathlib
from collections import defaultdict
from datetime import datetime

import backtest_combo_v2 as H   # reuse harness math; importing does not run main()

HOME        = pathlib.Path.home()
FM          = HOME / "fightmetrics"
STATS_CSV   = FM / "ufc_fight_stats.csv"
RESULTS_CSV = FM / "ufc_fight_results.csv"
EVENTS_CSV  = FM / "ufc_event_details.csv"
ELO_JSON    = FM / "backtest_results_elo.json"

# ── tiny parsers ────────────────────────────────────────────────────────────
def of_stat(s):
    m = re.match(r'\s*(\d+)\s+of\s+(\d+)', str(s) or '')
    return (int(m.group(1)), int(m.group(2))) if m else (0, 0)

def ctrl_secs(s):
    m = re.match(r'(\d+):(\d+)', str(s).strip() if s else '')
    return int(m.group(1)) * 60 + int(m.group(2)) if m else 0

def time_secs(s):
    m = re.match(r'(\d+):(\d+)', str(s).strip() if s else '')
    return int(m.group(1)) * 60 + int(m.group(2)) if m else None

def round_label(s):
    m = re.search(r'(\d+)', str(s) or '')
    return int(m.group(1)) if m else 0

def kd_int(s):
    s = str(s or '0').strip()
    try:    return int(float(s)) if s and s.lower() != 'nan' else 0
    except: return 0

def parse_event_date(s):
    for fmt in ('%B %d, %Y', '%b %d, %Y', '%Y-%m-%d'):
        try: return datetime.strptime(str(s).strip(), fmt).strftime('%Y-%m-%d')
        except: continue
    return None

# ── build point-in-time per-fighter Greco history ────────────────────────────
def build_greco_history():
    event_date = {}
    with open(EVENTS_CSV, newline='', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            d = parse_event_date(r.get('DATE', ''))
            if r.get('EVENT'): event_date[r['EVENT'].strip()] = d

    res_lookup = {}
    with open(RESULTS_CSV, newline='', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            ev, bt = str(r.get('EVENT','')).strip(), str(r.get('BOUT','')).strip()
            try: er = int(float(str(r.get('ROUND','0')).strip()))
            except: er = 0
            res_lookup[(ev, bt)] = (er, time_secs(r.get('TIME','')))

    bouts = defaultdict(lambda: defaultdict(lambda: {
        'sig_l':0,'sig_a':0,'kd':0,'ctrl':0,'dur':0}))
    with open(STATS_CSV, newline='', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            fighter = str(r.get('FIGHTER','')).strip()
            if not fighter: continue
            ev, bt = str(r.get('EVENT','')).strip(), str(r.get('BOUT','')).strip()
            rn = round_label(r.get('ROUND',''))
            if rn <= 0: continue
            er, tsec = res_lookup.get((ev, bt), (0, None))
            dur = tsec if (er and rn == er and tsec) else 300
            sl, sa = of_stat(r.get('SIG.STR.',''))
            agg = bouts[(ev, bt)][fighter]
            agg['sig_l'] += sl; agg['sig_a'] += sa
            agg['kd']    += kd_int(r.get('KD'))
            agg['ctrl']  += ctrl_secs(r.get('CTRL'))
            agg['dur']   += dur

    hist = defaultdict(list)
    for (ev, bt), per_f in bouts.items():
        d = event_date.get(ev)
        if not d: continue
        names = list(per_f.keys())
        for name in names:
            opp = [n for n in names if n != name]
            o = per_f[opp[0]] if opp else {'sig_l':0,'sig_a':0}
            s = per_f[name]
            hist[name].append((d, {
                'kd': s['kd'], 'ctrl': s['ctrl'], 'dur': s['dur'],
                'opp_sig_l': o['sig_l'], 'opp_sig_a': o['sig_a'],
            }))
    for name in hist:
        hist[name].sort(key=lambda x: x[0])
    return hist

def point_in_time(hist, fighter, fight_date):
    rows = [a for (d, a) in hist.get(fighter, []) if d < fight_date]
    if not rows:
        return None, 0.0
    dur = sum(a['dur'] for a in rows)
    if dur <= 0:
        return None, 0.0
    total_min = dur / 60.0
    opp_l = sum(a['opp_sig_l'] for a in rows)
    opp_a = sum(a['opp_sig_a'] for a in rows)
    return ({
        'kd':   sum(a['kd'] for a in rows) / total_min,         # knockdowns/min
        'ctrl': sum(a['ctrl'] for a in rows) / dur,             # control fraction
        'sapm': opp_l / total_min,                              # strikes absorbed/min
        'sdef': (1 - opp_l / opp_a) if opp_a > 0 else None,     # striking defense
    }, total_min)

# ── field configs ─────────────────────────────────────────────────────────────
FIELDS = {
    'kd':   {'mean': 0.08, 'S': 0.05,  'higher_better': True},
    'ctrl': {'mean': 0.08, 'S': 0.15,  'higher_better': True},
    'sapm': {'mean': 3.5,  'S': 15.8,  'higher_better': False},
    'sdef': {'mean': 0.55, 'S': 0.10,  'higher_better': True},
}

def sample_blend(stat, mean, total_min):
    if stat is None: stat = mean
    w = min(1.0, total_min / 75.0)
    return w * stat + (1.0 - w) * mean

def main():
    print("Loading harness SOS/momentum (rebuild ELO history + rankHistory) …")
    rank_hist = H.load_rank_history(H.RANKHISTORY)
    history   = H.build_history(H.CSV_PATH)

    elo = json.loads(ELO_JSON.read_text())
    fights = elo['fights']
    elo_acc = elo['meta']['accuracy_elo']
    n = len(fights)

    # Precompute SOS/Mom deltas per fight (field-independent — exactly combo_v2).
    print("Pre-computing SOS@0.10 + Mom@0.03 deltas …")
    adj = []
    for f in fights:
        fd = f['date']
        sr, _ = H.sos_signal(f['red'],  fd, history, rank_hist)
        sb, _ = H.sos_signal(f['blue'], fd, history, rank_hist)
        sos = (sr if sr is not None else H.UNRANKED_TIER) - \
              (sb if sb is not None else H.UNRANKED_TIER)
        mr, _ = H.momentum_ranked(f['red'],  fd, history, rank_hist)
        mb, _ = H.momentum_ranked(f['blue'], fd, history, rank_hist)
        adj.append(H.clamp(sos) * 0.10 + H.clamp(mr - mb) * 0.03)

    print("Building point-in-time Greco history …")
    ghist = build_greco_history()
    print(f"  fighters with Greco stats: {len(ghist)}")
    pit = []
    cov = 0
    for f in fights:
        va, tma = point_in_time(ghist, f['red'],  f['date'])
        vb, tmb = point_in_time(ghist, f['blue'], f['date'])
        pit.append(((va, tma), (vb, tmb)))
        if va and vb: cov += 1
    print(f"  fights with BOTH fighters having prior Greco data: "
          f"{cov}/{n} ({cov/n*100:.1f}%)")

    def accuracy(field_names, weight):
        cfgs = {fn: FIELDS[fn] for fn in field_names}
        correct = 0
        for i, f in enumerate(fights):
            (va, tma), (vb, tmb) = pit[i]
            contrib = 0.0
            for fn, c in cfgs.items():
                a = sample_blend(va[fn] if va else None, c['mean'], tma)
                b = sample_blend(vb[fn] if vb else None, c['mean'], tmb)
                d = (a - b) if c['higher_better'] else (b - a)
                contrib += H.clamp(d / c['S']) * weight
            comp = f['composite_elo'] + contrib + adj[i]
            pA = H.sigmoid(H.SIGMOID_A * comp + H.SIGMOID_B)
            pick = f['red'] if pA >= 0.5 else f['blue']
            correct += (pick == f['actual'])
        return correct / n * 100, correct

    acc0, cor0 = accuracy([], 0.0)
    print(f"\nBaseline (no field) reproduced: {cor0}/{n} = {acc0:.2f}%   (expect 59.29%)")

    print(f"\n{'field':>6} {'weight':>7} {'accuracy':>9} {'correct':>8} {'Δ':>9}")
    print('  ' + '─'*45)
    results = {}
    for fn in ['kd', 'ctrl', 'sapm', 'sdef']:
        for w in (0.02, 0.04, 0.06, 0.10):
            acc, cor = accuracy([fn], w)
            d = acc - acc0
            flag = ' ✓' if d > 0 else ('  ' if abs(d) < 1e-9 else ' ✗')
            print(f"  {fn:>6} {w:>7.2f} {acc:>8.2f}% {cor:>8d} {d:>+8.2f}pp{flag}")
            results.setdefault(fn, []).append((w, acc, d))

    best = [fn for fn, rows in results.items() if max(r[2] for r in rows) > 0]
    if best:
        for w in (0.02, 0.04):
            acc, cor = accuracy(best, w)
            print(f"\n  Combined {best} @ {w}: {acc:.2f}% ({cor}/{n})  Δ={acc-acc0:+.2f}pp")
    else:
        print("\n  No field improves the baseline at any tested weight.")

if __name__ == '__main__':
    main()
