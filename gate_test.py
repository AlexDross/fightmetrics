#!/usr/bin/env python3
"""
gate_test.py — NON-DESTRUCTIVE in-memory test of alternative bet-gate logic.

Mirrors test_new_fields.py's approach: imports the committed harness for SOS/Mom,
reads committed backtest_results_elo.json, joins market odds from ufc-master.csv,
and evaluates four gate structures (current baseline + A/B/C) purely in memory.
Writes nothing. Touches no committed file.
"""
import csv, json, math, pathlib
import backtest_combo_v2 as H

HOME   = pathlib.Path.home()
FM     = HOME / "fightmetrics"
MASTER = HOME / "Downloads" / "ufc-master.csv"
ELO    = FM / "backtest_results_elo.json"

# live-app sigmoid (App.js gate operates on THIS probability)
LIVE_A, LIVE_B = 2.0, 0.0
def live_p(comp):  return 1.0 / (1.0 + math.exp(-(LIVE_A * comp + LIVE_B)))

# ── odds helpers, replicated exactly from App.js ─────────────────────────────
def parse_american(s):
    try: n = int(str(s).split('.')[0])
    except: return None
    if n == 0: return None
    return 100/(n+100) if n > 0 else abs(n)/(abs(n)+100)

def american_to_decimal(s):
    try: n = int(str(s).split('.')[0])
    except: return None
    if n == 0: return None
    return n/100 + 1 if n > 0 else 100/abs(n) + 1

def has(v): return v not in (None, '', 'NA', 'nan', 'NaN')

# ── 1. load committed baseline fights ────────────────────────────────────────
elo    = json.loads(ELO.read_text())
fights = elo['fights']
n = len(fights)

# ── 2. recompute SOS@0.10 + Mom@0.03 adj exactly like test_new_fields.py ──────
rank_hist = H.load_rank_history(H.RANKHISTORY)
history   = H.build_history(H.CSV_PATH)
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

# ── 3. odds lookup keyed (date, fighter) from ufc-master.csv ─────────────────
odds = {}
for r in csv.DictReader(open(MASTER, encoding='utf-8')):
    d = r['date']
    if has(r.get('R_odds')): odds[(d, r['R_fighter'].strip())] = r['R_odds']
    if has(r.get('B_odds')): odds[(d, r['B_fighter'].strip())] = r['B_odds']

# ── 4. build per-fight record (live prob, model pick, edges, odds) ───────────
recs = []
for i, f in enumerate(fights):
    comp = f['composite_elo'] + adj[i]
    pA = live_p(comp)                 # red live prob
    pB = 1.0 - pA
    model_pick = f['red'] if comp >= 0 else f['blue']  # a=2,b=0 -> pA>=.5 iff comp>=0
    red_won = (f['actual'] == f['red'])
    ro = odds.get((f['date'], f['red'].strip()))
    bo = odds.get((f['date'], f['blue'].strip()))
    rec = dict(i=i, date=f['date'], red=f['red'], blue=f['blue'], actual=f['actual'],
               pA=pA, pB=pB, comp=comp, model_pick=model_pick, red_won=red_won,
               has_odds=False)
    if ro is not None and bo is not None:
        rawA, rawB = parse_american(ro), parse_american(bo)
        if rawA and rawB:
            tot = rawA + rawB
            novigA, novigB = rawA/tot, rawB/tot
            edgeA, edgeB = pA - novigA, pB - novigB
            decA, decB = american_to_decimal(ro), american_to_decimal(bo)
            rec.update(has_odds=True, edgeA=edgeA, edgeB=edgeB, decA=decA, decB=decB,
                       odds_red=ro, odds_blue=bo)
    recs.append(rec)

covered = [r for r in recs if r['has_odds']]
print(f"Fights: {n}   with odds: {len(covered)} ({len(covered)/n*100:.1f}%)")

# verify baseline reproduction (harness sigmoid pick)
def harness_p(comp): return 1.0/(1.0+math.exp(-(H.SIGMOID_A*comp+H.SIGMOID_B)))
cor_h = sum((f['red'] if (f['composite_elo']+adj[i])>=0 or harness_p(f['composite_elo']+adj[i])>=0.5
             else f['blue']) == f['actual'] for i,f in enumerate(fights))
# proper harness pick
cor_h = 0
for i,f in enumerate(fights):
    c=f['composite_elo']+adj[i]
    pick=f['red'] if harness_p(c)>=0.5 else f['blue']
    cor_h += (pick==f['actual'])
print(f"Harness-sigmoid baseline reproduced: {cor_h}/{n} = {cor_h/n*100:.2f}%  (expect 59.29%)")
cor_live = sum(r['model_pick']==r['actual'] for r in recs)
print(f"Live-sigmoid model pick accuracy:    {cor_live}/{n} = {cor_live/n*100:.2f}%")

# ── helpers for backed-side resolution ───────────────────────────────────────
def backed_won(r, side):       # side 'A'(red) or 'B'(blue)
    return r['red_won'] if side=='A' else (not r['red_won'])
def backed_dec(r, side):       return r['decA'] if side=='A' else r['decB']
def backed_prob(r, side):      return r['pA'] if side=='A' else r['pB']

# ── gate definitions: return (action, backed_side) or ('NO BET', None) ───────
def gate_current(r):
    pickSide = 'A' if r['pA']>=0.5 else 'B'
    pickEdge = r['edgeA'] if pickSide=='A' else r['edgeB']
    oppEdge  = r['edgeB'] if pickSide=='A' else r['edgeA']
    pickProb = r['pA'] if pickSide=='A' else r['pB']
    hasPickEdge = pickEdge >= 0.03
    conflicting = (not hasPickEdge) and oppEdge >= 0.03
    if conflicting or not hasPickEdge: return 'NO BET', None
    if pickProb < 0.60: return 'NO BET', None
    if pickProb < 0.65: return ('LEAN' if pickEdge>=0.10 else 'NO BET'), pickSide
    if pickProb < 0.70:
        if pickEdge>=0.30: return 'BET', pickSide
        if pickEdge>=0.10: return 'LEAN', pickSide
        return 'NO BET', None
    if pickEdge>=0.25: return 'STRONG BET', pickSide
    if pickEdge>=0.15: return 'BET', pickSide
    return 'LEAN', pickSide

def gate_C(r):  # current but prob floor 0.55
    pickSide = 'A' if r['pA']>=0.5 else 'B'
    pickEdge = r['edgeA'] if pickSide=='A' else r['edgeB']
    oppEdge  = r['edgeB'] if pickSide=='A' else r['edgeA']
    pickProb = r['pA'] if pickSide=='A' else r['pB']
    hasPickEdge = pickEdge >= 0.03
    conflicting = (not hasPickEdge) and oppEdge >= 0.03
    if conflicting or not hasPickEdge: return 'NO BET', None
    if pickProb < 0.55: return 'NO BET', None
    if pickProb < 0.65: return ('LEAN' if pickEdge>=0.10 else 'NO BET'), pickSide
    if pickProb < 0.70:
        if pickEdge>=0.30: return 'BET', pickSide
        if pickEdge>=0.10: return 'LEAN', pickSide
        return 'NO BET', None
    if pickEdge>=0.25: return 'STRONG BET', pickSide
    if pickEdge>=0.15: return 'BET', pickSide
    return 'LEAN', pickSide

def gate_A(r):  # edge-primary, lower prob floor
    valueSide = 'A' if r['edgeA'] > r['edgeB'] else 'B'
    bestEdge  = max(r['edgeA'], r['edgeB'])
    dec = backed_dec(r, valueSide); p = backed_prob(r, valueSide)
    ev = p*dec - 1.0
    if bestEdge < 0.08 or ev <= 0: return 'NO BET', None
    if bestEdge < 0.12:  return 'LEAN', valueSide
    if bestEdge < 0.175: return 'BET',  valueSide
    if bestEdge >= 0.20: return 'CAUTION', valueSide   # flagged, graded as LEAN
    return 'BET', valueSide                            # [0.175,0.20) gap -> BET

def gate_B(r):  # current structure, but allow opposite-side value (cap LEAN)
    action, side = gate_current(r)
    if action != 'NO BET':
        return action, side                # model-pick branch unchanged
    # only reach here on NO BET; allow opposite/value side as capped LEAN
    valueSide = 'A' if r['edgeA'] > r['edgeB'] else 'B'
    bestEdge  = max(r['edgeA'], r['edgeB'])
    pickSide  = 'A' if r['pA']>=0.5 else 'B'
    if valueSide != pickSide and bestEdge >= 0.10:
        return 'LEAN', valueSide
    return 'NO BET', None

GATES = {'CURRENT': gate_current, 'A (edge-primary)': gate_A,
         'B (opp-value)': gate_B, 'C (floor 0.55)': gate_C}
BET_ACTIONS = {'LEAN','BET','STRONG BET','CAUTION'}

# ── full-sample model log-loss (gate-independent) ────────────────────────────
def logloss(probs_y):
    s=0.0
    for p,y in probs_y:
        p=min(max(p,1e-15),1-1e-15)
        s += -(y*math.log(p)+(1-y)*math.log(1-p))
    return s/len(probs_y)
ll_live    = logloss([(r['pA'], 1 if r['red_won'] else 0) for r in recs])
ll_harness = logloss([(harness_p(f['composite_elo']+adj[i]), 1 if fights[i]['actual']==fights[i]['red'] else 0)
                      for i,f in enumerate(fights)])
print(f"\nModel log-loss on ALL {n} fights (gate-independent — model calibration):")
print(f"  live sigmoid (a=2.0): {ll_live:.4f}    harness sigmoid (a=1.61): {ll_harness:.4f}")

# ── evaluate each gate on covered subset ─────────────────────────────────────
print(f"\n{'='*78}\nGATE COMPARISON  (recommendation metrics on {len(covered)} fights with odds)\n{'='*78}")
hdr = f"{'gate':<18}{'#rec':>6}{'%field':>8}{'acc':>8}{'flatROI':>9}{'recLL':>8}  tiers"
print(hdr); print('-'*len(hdr))
summary={}
for name, gate in GATES.items():
    rec_rows=[]; tiers={}
    for r in covered:
        action, side = gate(r)
        if action in BET_ACTIONS:
            rec_rows.append((r, side, action))
            tiers[action]=tiers.get(action,0)+1
    nrec=len(rec_rows)
    if nrec:
        acc = sum(backed_won(r,s) for r,s,a in rec_rows)/nrec
        profit = sum((backed_dec(r,s)-1) if backed_won(r,s) else -1 for r,s,a in rec_rows)
        roi = profit/nrec*100
        rll = logloss([(backed_prob(r,s), 1 if backed_won(r,s) else 0) for r,s,a in rec_rows])
    else:
        acc=roi=rll=float('nan')
    tierstr=' '.join(f"{k}:{v}" for k,v in sorted(tiers.items()))
    print(f"{name:<18}{nrec:>6}{nrec/len(covered)*100:>7.1f}%{acc*100:>7.1f}%{roi:>+8.1f}%{rll:>8.3f}  {tierstr}")
    summary[name]=dict(nrec=nrec, acc=acc, roi=roi, profit=profit if nrec else 0, rll=rll, tiers=tiers)

# tier-level ROI breakdown for each gate
print(f"\n{'='*78}\nPER-TIER breakdown (action / #bets / acc / flatROI)\n{'='*78}")
for name, gate in GATES.items():
    print(f"\n{name}:")
    bytier={}
    for r in covered:
        action, side = gate(r)
        if action in BET_ACTIONS:
            bytier.setdefault(action, []).append((r,side))
    for action in ['LEAN','BET','STRONG BET','CAUTION']:
        rows=bytier.get(action)
        if not rows: continue
        acc=sum(backed_won(r,s) for r,s in rows)/len(rows)
        profit=sum((backed_dec(r,s)-1) if backed_won(r,s) else -1 for r,s in rows)
        print(f"   {action:<11} n={len(rows):>4}  acc={acc*100:>5.1f}%  ROI={profit/len(rows)*100:>+6.1f}%  units={profit:>+7.2f}")
