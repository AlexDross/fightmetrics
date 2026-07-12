#!/usr/bin/env python3
"""
backtest_combo.py
Tests SOS + rankings-momentum combinations, and finds where SOS peaks.
Re-uses all logic from backtest_rankings.py verbatim.
Baseline: ELO-active, 1974/3380 = 58.40%.
"""

import csv, json, math, pathlib
from bisect import bisect_right
from collections import defaultdict

RANKINGS_CSV = pathlib.Path.home() / "Downloads/UFC_rankings_history.csv"
CSV_PATH     = pathlib.Path.home() / "Downloads/UltimateUFCDatabase/ufc-master.csv"
ELO_JSON     = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results_elo.json")

SIGMOID_A     = 1.609621
SIGMOID_B     = -0.18753374136521064
ELO_BASE      = 1500.0
DECAY         = 0.68
UNRANKED_TIER = 0.12
DECISION_METHODS = {'U-DEC','S-DEC','M-DEC','DQ','CNC','Overturned',''}
P4P_WCS = {"Pound-for-Pound","Men's Pound-for-Pound","Women's Pound-for-Pound",
            "Men's Pound-for-Pound Top Rank","Women's Pound-for-Pound Top Rank",
            "Men's Pound-for-PoundTop Rank","Women's Pound-for-PoundTop Rank"}

# ── Helpers ───────────────────────────────────────────────────────────────────

def rank_to_tier(rank):
    if rank == 0: return 1.0
    return max(0.42, 0.93 * math.exp(-0.037 * (rank - 1)))

def sigmoid(x):   return 1.0 / (1.0 + math.exp(-x))
def clamp(v, lo=-2., hi=2.): return max(lo, min(hi, v))
def bucket_key(p): return max(50, min(int((p*100)//5)*5, 90))

# ── Rankings index ────────────────────────────────────────────────────────────

def load_rankings(path):
    index = defaultdict(list)
    with open(path) as f:
        for row in csv.DictReader(f):
            wc = row['weightclass'].strip()
            if wc in P4P_WCS: continue
            try: rank = int(row['rank'])
            except ValueError: continue
            index[(row['fighter'].strip(), wc)].append((row['date'].strip(), rank))
    for k in index: index[k].sort()
    return index

def get_tier_pit(fighter, wc, fight_date, idx):
    entries = idx.get((fighter, wc), [])
    if not entries: return UNRANKED_TIER
    dates = [e[0] for e in entries]
    pos = bisect_right(dates, fight_date) - 1
    while pos >= 0 and entries[pos][0] >= fight_date: pos -= 1
    if pos < 0: return UNRANKED_TIER
    return rank_to_tier(entries[pos][1])

# ── ELO walk + fight history ──────────────────────────────────────────────────

def elo_k(finish, fr, n):
    k = 32.0
    if finish not in DECISION_METHODS:
        k *= 1.5
        try: rnd = int(fr)
        except: rnd = 3
        if rnd == 1: k *= 1.3
        elif rnd == 2: k *= 1.15
    if n < 5: k *= 1.5
    elif n < 10: k *= 1.25
    return k

def elo_exp(ra, rb): return 1.0/(1.0+10.0**((rb-ra)/400.0))

def build_history(csv_path):
    rows = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            if row.get('date','').strip() >= '2010-01-01': rows.append(row)
    rows.sort(key=lambda r: r['date'])
    ratings = defaultdict(lambda: ELO_BASE)
    fight_counts = defaultdict(int)
    history = defaultdict(list)
    for row in rows:
        red, blue = row['R_fighter'].strip(), row['B_fighter'].strip()
        winner = row['Winner'].strip()
        finish, fr = row.get('finish','').strip(), row.get('finish_round','').strip()
        date = row['date'].strip()
        er, eb = ratings[red], ratings[blue]
        nr, nb = fight_counts[red], fight_counts[blue]
        if winner=='Red':    rr,rb2='W','L'
        elif winner=='Blue': rr,rb2='L','W'
        else:                rr=rb2='NC' if finish in ('CNC','Overturned') else 'D'
        history[red].append( {'date':date,'opp':blue, 'result':rr,  'opp_elo':eb})
        history[blue].append({'date':date,'opp':red,  'result':rb2, 'opp_elo':er})
        if winner in ('Red','Blue'):
            exp_r = elo_exp(er, eb); s = 1.0 if winner=='Red' else 0.0
            ratings[red]  = er + elo_k(finish,fr,nr)*(s-exp_r)
            ratings[blue] = eb + elo_k(finish,fr,nb)*((1-s)-(1-exp_r))
        fight_counts[red]+=1; fight_counts[blue]+=1
    return dict(history)

# ── Signal computations ───────────────────────────────────────────────────────

def momentum_ranked(fighter, fight_date, history, wc, idx):
    prior = [h for h in history.get(fighter,[]) if h['date'] < fight_date]
    last5 = prior[-5:][::-1]
    if not last5: return 0.0
    num=den=0.0
    for i,h in enumerate(last5):
        w = DECAY**i
        tier = get_tier_pit(h['opp'], wc, h['date'], idx)
        if h['result']=='W':   num += w*(0.4+1.6*tier)
        elif h['result']=='L': num += w*(-(0.3+1.7*(1.0-tier)))
        den += w
    return max(-2., min(2., (num/den)*2.)) if den>0 else 0.

def sos(fighter, fight_date, history, wc, idx, window=5):
    prior = [h for h in history.get(fighter,[]) if h['date'] < fight_date]
    last_n = prior[-window:]
    if not last_n: return None
    return sum(get_tier_pit(h['opp'], wc, h['date'], idx) for h in last_n)/len(last_n)

def sos_diff(f, history, idx):
    wc = f['weight_class']
    sr = sos(f['red'],  f['date'], history, wc, idx) or UNRANKED_TIER
    sb = sos(f['blue'], f['date'], history, wc, idx) or UNRANKED_TIER
    return sr - sb

def mom_diff(f, history, idx):
    wc = f['weight_class']
    return (momentum_ranked(f['red'],  f['date'], history, wc, idx) -
            momentum_ranked(f['blue'], f['date'], history, wc, idx))

# ── Backtest engine ───────────────────────────────────────────────────────────

def run(elo_fights, adj_fn):
    out=[]
    for f in elo_fights:
        comp  = f['composite_elo'] + adj_fn(f)
        pA    = sigmoid(SIGMOID_A*comp + SIGMOID_B)
        pick  = f['red'] if pA>=0.5 else f['blue']
        prob  = pA if pA>=0.5 else 1.-pA
        out.append({'correct':pick==f['actual'], 'prob':prob,
                    'correct_elo':f['correct_elo'], 'pick_elo':f['pick_elo'],
                    'pick_prob_elo':f['pick_prob_elo'], 'actual':f['actual'],
                    'pick':pick})
    return out

def stats(results, elo_acc, elo_n):
    total   = len(results)
    correct = sum(1 for r in results if r['correct'])
    acc     = correct/total
    delta   = (acc-elo_acc)*100
    flipped = sum(1 for r in results if r['pick']!=r['pick_elo'])
    fixed   = sum(1 for r in results if r['pick']!=r['pick_elo'] and  r['correct'] and not r['correct_elo'])
    broken  = sum(1 for r in results if r['pick']!=r['pick_elo'] and not r['correct'] and r['correct_elo'])
    return acc, correct, delta, flipped, fixed, broken, fixed-broken

def make_buckets(results, pk='prob', ck='correct'):
    b={lo:{'n':0,'hits':0,'ps':0.} for lo in range(50,95,5)}
    for r in results:
        lo=bucket_key(r[pk])
        b[lo]['n']+=1; b[lo]['hits']+=int(r[ck]); b[lo]['ps']+=r[pk]
    return b

def print_table(label_new, bn, label_base, bb):
    tn=sum(x['n'] for x in bn.values()); tb=sum(x['n'] for x in bb.values())
    print(f"  (totals → {label_new}: {tn}, {label_base}: {tb})")
    hdr=(f"{'Bucket':>8}  {'N':>5}  {'Hits':>5}  {'Actual%':>8}  "
         f"{'AvgProb%':>9}  {'Delta':>7}  │  "
         f"{'ELO-N':>5}  {'ELO%':>7}  {'ELO-Δ':>7}")
    print(f"\n  {hdr}")
    print(f"  {'─'*len(hdr)}")
    for lo in sorted(bn):
        n,b2=bn[lo],bb[lo]
        if n['n']==0 and b2['n']==0: continue
        na=n['hits']/n['n']*100 if n['n'] else 0
        np=n['ps']/n['n']*100   if n['n'] else 0
        ba=b2['hits']/b2['n']*100 if b2['n'] else 0
        bp=b2['ps']/b2['n']*100   if b2['n'] else 0
        print(f"  {lo:2d}–{lo+4:2d}%   {n['n']:5d}  {n['hits']:5d}  "
              f"{na:7.1f}%  {np:8.1f}%  {na-np:+6.1f}pp  │  "
              f"{b2['n']:5d}  {ba:6.1f}%  {ba-bp:+6.1f}pp")

def report(label, results, elo_acc, elo_n, bkt_elo):
    acc,cor,delta,fl,fx,bk,net=stats(results,elo_acc,elo_n)
    print(f"\n{'='*64}")
    print(f"VARIANT: {label}")
    print(f"  ELO baseline : {round(elo_acc*elo_n)}/{elo_n} = {elo_acc*100:.2f}%")
    print(f"  This variant : {cor}/{elo_n} = {acc*100:.2f}%")
    print(f"  Delta        : {delta:+.2f} pp")
    print(f"  Picks changed: {fl}  (fixed={fx}, broken={bk}, net={net:+d})")
    print(f"{'='*64}")
    print_table(label, make_buckets(results), "ELO-base", bkt_elo)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("Loading…")
    idx     = load_rankings(RANKINGS_CSV)
    history = build_history(CSV_PATH)
    elo_data   = json.loads(ELO_JSON.read_text())
    elo_fights = elo_data['fights']
    elo_acc    = elo_data['meta']['accuracy_elo']
    elo_n      = len(elo_fights)
    bkt_elo    = make_buckets(elo_fights, pk='pick_prob_elo', ck='correct_elo')
    print(f"Ready. ELO baseline: {elo_acc*100:.2f}%  ({elo_n} fights)\n")

    # Pre-compute diffs once (expensive inside loops)
    print("Pre-computing SOS and momentum diffs for all fights…")
    sos_d = [sos_diff(f, history, idx) for f in elo_fights]
    mom_d = [mom_diff(f, history, idx) for f in elo_fights]
    print("Done.\n")

    # ── SECTION 1: named configurations ──────────────────────────────────────
    configs = [
        ("SOS @ 0.10",               lambda i,f: clamp(sos_d[i])*0.10),
        ("SOS @ 0.10 + Mom @ 0.03",  lambda i,f: clamp(sos_d[i])*0.10 + clamp(mom_d[i])*0.03),
        ("SOS @ 0.05 + Mom @ 0.03",  lambda i,f: clamp(sos_d[i])*0.05 + clamp(mom_d[i])*0.03),
    ]

    for label, adj_i in configs:
        res = run(elo_fights, lambda f, fn=adj_i: fn(elo_fights.index(f), f))
        # index() is O(n²) — use enumerate instead
        results = []
        for i, f in enumerate(elo_fights):
            adj   = adj_i(i, f)
            comp  = f['composite_elo'] + adj
            pA    = sigmoid(SIGMOID_A*comp + SIGMOID_B)
            pick  = f['red'] if pA>=0.5 else f['blue']
            prob  = pA if pA>=0.5 else 1.-pA
            results.append({'correct':pick==f['actual'],'prob':prob,
                            'correct_elo':f['correct_elo'],'pick_elo':f['pick_elo'],
                            'pick_prob_elo':f['pick_prob_elo'],'actual':f['actual'],
                            'pick':pick})
        report(label, results, elo_acc, elo_n, bkt_elo)

    # ── SECTION 2: SOS sweep 0.10 → 0.25 ────────────────────────────────────
    print(f"\n{'='*64}")
    print("SOS EXTENDED SWEEP — finding where gain peaks")
    print(f"{'='*64}")
    print(f"  {'Weight':>8}  {'Correct':>8}  {'Accuracy':>10}  {'Δ vs ELO':>10}  "
          f"{'Flipped':>8}  {'Net':>5}")

    prev_acc = None
    peak_w   = None
    peak_acc = elo_acc
    for w_str, w in [('0.10',0.10),('0.13',0.13),('0.15',0.15),
                     ('0.18',0.18),('0.20',0.20),('0.25',0.25)]:
        results = []
        for i, f in enumerate(elo_fights):
            adj  = clamp(sos_d[i])*w
            comp = f['composite_elo']+adj
            pA   = sigmoid(SIGMOID_A*comp+SIGMOID_B)
            pick = f['red'] if pA>=0.5 else f['blue']
            prob = pA if pA>=0.5 else 1.-pA
            results.append({'correct':pick==f['actual'],'prob':prob,
                            'correct_elo':f['correct_elo'],'pick_elo':f['pick_elo'],
                            'pick_prob_elo':f['pick_prob_elo'],'actual':f['actual'],
                            'pick':pick})
        acc,cor,delta,fl,fx,bk,net=stats(results,elo_acc,elo_n)
        arrow = ""
        if prev_acc is not None:
            arrow = "↑" if acc>prev_acc else ("↓" if acc<prev_acc else "=")
        if acc > peak_acc:
            peak_acc = acc
            peak_w   = w
        print(f"  {w_str:>8}   {cor:8d}  {acc*100:9.2f}%  {delta:+9.2f}pp  {fl:8d}  {net:+5d}  {arrow}")
        prev_acc = acc

    print(f"\n  Peak SOS weight: {peak_w}  ({peak_acc*100:.2f}%)")

    # Full bucket table for peak SOS
    results_peak = []
    for i, f in enumerate(elo_fights):
        adj  = clamp(sos_d[i])*peak_w
        comp = f['composite_elo']+adj
        pA   = sigmoid(SIGMOID_A*comp+SIGMOID_B)
        pick = f['red'] if pA>=0.5 else f['blue']
        prob = pA if pA>=0.5 else 1.-pA
        results_peak.append({'correct':pick==f['actual'],'prob':prob,
                        'correct_elo':f['correct_elo'],'pick_elo':f['pick_elo'],
                        'pick_prob_elo':f['pick_prob_elo'],'actual':f['actual'],
                        'pick':pick})
    report(f"SOS @ {peak_w} (peak)", results_peak, elo_acc, elo_n, bkt_elo)

    # ── SECTION 3: Best combo at peak SOS + Mom 0.03 ─────────────────────────
    print(f"\n{'='*64}")
    print(f"BEST COMBO: SOS @ {peak_w} + Mom @ 0.03")
    print(f"{'='*64}")
    results_best = []
    for i, f in enumerate(elo_fights):
        adj  = clamp(sos_d[i])*peak_w + clamp(mom_d[i])*0.03
        comp = f['composite_elo']+adj
        pA   = sigmoid(SIGMOID_A*comp+SIGMOID_B)
        pick = f['red'] if pA>=0.5 else f['blue']
        prob = pA if pA>=0.5 else 1.-pA
        results_best.append({'correct':pick==f['actual'],'prob':prob,
                        'correct_elo':f['correct_elo'],'pick_elo':f['pick_elo'],
                        'pick_prob_elo':f['pick_prob_elo'],'actual':f['actual'],
                        'pick':pick})
    report(f"SOS @ {peak_w} + Mom @ 0.03", results_best, elo_acc, elo_n, bkt_elo)

    # ── FINAL SUMMARY ─────────────────────────────────────────────────────────
    print(f"\n{'─'*64}")
    print("FINAL SUMMARY — all variants vs 58.40% ELO baseline")
    print(f"  {'Variant':<38}  {'Accuracy':>9}  {'Δ vs ELO':>9}  {'Net flips':>10}")
    print(f"  {'─'*38}  {'─'*9}  {'─'*9}  {'─'*10}")
    print(f"  {'ELO baseline':<38}  {elo_acc*100:9.2f}%  {'—':>9}  {'—':>10}")

    all_variants = [
        ("SOS @ 0.10",              [clamp(sos_d[i])*0.10 for i in range(elo_n)]),
        ("SOS @ 0.10 + Mom @ 0.03", [clamp(sos_d[i])*0.10+clamp(mom_d[i])*0.03 for i in range(elo_n)]),
        ("SOS @ 0.05 + Mom @ 0.03", [clamp(sos_d[i])*0.05+clamp(mom_d[i])*0.03 for i in range(elo_n)]),
        (f"SOS @ {peak_w} (peak)",  [clamp(sos_d[i])*peak_w for i in range(elo_n)]),
        (f"SOS @ {peak_w} + Mom @ 0.03", [clamp(sos_d[i])*peak_w+clamp(mom_d[i])*0.03 for i in range(elo_n)]),
    ]
    for label, adjs in all_variants:
        results2 = []
        for i, f in enumerate(elo_fights):
            comp = f['composite_elo']+adjs[i]
            pA   = sigmoid(SIGMOID_A*comp+SIGMOID_B)
            pick = f['red'] if pA>=0.5 else f['blue']
            prob = pA if pA>=0.5 else 1.-pA
            results2.append({'correct':pick==f['actual'],'correct_elo':f['correct_elo'],
                             'pick_elo':f['pick_elo'],'pick':pick})
        acc2,cor2,delta2,fl2,fx2,bk2,net2=stats(results2,elo_acc,elo_n)
        print(f"  {label:<38}  {acc2*100:9.2f}%  {delta2:+8.2f}pp  {net2:+10d}")


if __name__ == '__main__':
    main()
