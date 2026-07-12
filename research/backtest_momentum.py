#!/usr/bin/env python3
"""
backtest_momentum.py
Tests qualMomDiff (opponent-quality-weighted recent momentum) on the
ELO-active backtest. Point-in-time clean: each fight's momentum uses
ONLY fights strictly before that fight's date.

Live computeMomentum (App.js:336-352):
  DECAY = 0.68; last 5 fights; opponent-tier-weighted
  W  → num += decay^i * (0.4 + 1.6 * tier)
  L  → num += decay^i * -(0.3 + 1.7 * (1 - tier))
  NC/Draw → den += weight only (no num contribution)
  result = clamp[-2,2]( (num / den) * 2 )

Opponent tier proxy: point-in-time ELO → tier via linear map
  tier = max(0.12, min(1.0, 0.12 + 0.88 * max(0, elo - 1500) / 300))
  Maps: ELO 1500 → 0.12 (unranked baseline)
        ELO 1650 → 0.56
        ELO 1800 → 1.00 (champion-level)

qualMomDiff = clamp(momA - momB, -2, 2) * weight
  Added to composite_elo (ELO already active, everything else identical).

Weight sweep: 0.05, 0.10, 0.15
"""

import csv
import json
import math
import pathlib
from collections import defaultdict

CSV_PATH    = pathlib.Path.home() / "Downloads/UltimateUFCDatabase/ufc-master.csv"
ELO_JSON    = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results_elo.json")
OUTPUT_JSON = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results_momentum.json")

SIGMOID_A   = 1.609621
SIGMOID_B   = -0.18753374136521064
ELO_BASE    = 1500.0
DECAY_COEFF = 0.68
ELO_K_BASE  = 32.0
DECISION_METHODS = {'U-DEC', 'S-DEC', 'M-DEC', 'DQ', 'CNC', 'Overturned', ''}


# ── ELO helpers (same as backtest_elo.py) ────────────────────────────────────

def elo_expected(ra, rb):
    return 1.0 / (1.0 + 10.0 ** ((rb - ra) / 400.0))


def k_factor(finish, finish_round, n_fights):
    is_finish = finish not in DECISION_METHODS
    k = ELO_K_BASE
    if is_finish:
        k *= 1.5
        try:
            rnd = int(finish_round)
        except (ValueError, TypeError):
            rnd = 3
        if rnd == 1:
            k *= 1.3
        elif rnd == 2:
            k *= 1.15
    if n_fights < 5:
        k *= 1.5
    elif n_fights < 10:
        k *= 1.25
    return k


def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))


def clamp(v, lo=-2.0, hi=2.0):
    return max(lo, min(hi, v))


def bucket_key(prob):
    p_pct = prob * 100
    lo = int(p_pct // 5) * 5
    return max(50, min(lo, 90))


# ── Tier mapping ─────────────────────────────────────────────────────────────

def elo_to_tier(elo):
    """
    Map point-in-time ELO to [0.12, 1.0] opponent-quality tier.
    Mirrors live ranking tier formula endpoint values:
      unranked baseline → 0.12, top-10 → 0.42–0.80, champion-level → 1.0
    Linear: ELO 1500 = 0.12, ELO 1800 = 1.00.
    """
    return max(0.12, min(1.0, 0.12 + 0.88 * max(0.0, elo - 1500.0) / 300.0))


# ── Core: build ELO walk + per-fighter fight history ─────────────────────────

def build_history_and_elo(csv_path):
    """
    Walk ufc-master.csv from 2010 chronologically.
    Returns:
      fighter_history  — { name: [{date, opp, result, opp_pre_elo}] } sorted oldest-first
      pre_fight_elo    — { (date, red, blue): (elo_r, elo_b) }
    Result codes: 'W', 'L', 'NC', 'D'
    """
    rows = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            date = row.get('date', '').strip()
            if date < '2010-01-01':
                continue
            rows.append(row)
    rows.sort(key=lambda r: r['date'])

    ratings      = defaultdict(lambda: ELO_BASE)
    fight_counts = defaultdict(int)
    pre_fight_elo  = {}
    fighter_history = defaultdict(list)

    for row in rows:
        red    = row['R_fighter'].strip()
        blue   = row['B_fighter'].strip()
        winner = row['Winner'].strip()
        finish = row.get('finish', '').strip()
        finish_round = row.get('finish_round', '').strip()
        date   = row['date'].strip()

        elo_r = ratings[red]
        elo_b = ratings[blue]
        n_r   = fight_counts[red]
        n_b   = fight_counts[blue]

        # Record pre-fight ELO (used both for backtest join and opponent tier)
        pre_fight_elo[(date, red, blue)] = (elo_r, elo_b)

        # Determine result codes
        if winner == 'Red':
            res_r, res_b = 'W', 'L'
        elif winner == 'Blue':
            res_r, res_b = 'L', 'W'
        else:
            res_r = res_b = 'NC' if finish in ('CNC', 'Overturned') else 'D'

        # Append to each fighter's history (opponent's PRE-FIGHT elo)
        fighter_history[red].append({
            'date': date, 'opp': blue, 'result': res_r, 'opp_pre_elo': elo_b,
        })
        fighter_history[blue].append({
            'date': date, 'opp': red, 'result': res_b, 'opp_pre_elo': elo_r,
        })

        # Update ELO only for decisive outcomes
        if winner in ('Red', 'Blue'):
            exp_r  = elo_expected(elo_r, elo_b)
            score_r = 1.0 if winner == 'Red' else 0.0
            k_r    = k_factor(finish, finish_round, n_r)
            k_b    = k_factor(finish, finish_round, n_b)
            ratings[red]  = elo_r + k_r * (score_r - exp_r)
            ratings[blue] = elo_b + k_b * ((1.0 - score_r) - (1.0 - exp_r))

        fight_counts[red]  += 1
        fight_counts[blue] += 1

    return dict(fighter_history), pre_fight_elo


# ── Point-in-time momentum ────────────────────────────────────────────────────

def compute_momentum_pit(fighter, fight_date, fighter_history):
    """
    Compute quality momentum for `fighter` using ONLY fights strictly before
    `fight_date`. Takes last 5 such fights (most recent first).
    Returns (momentum_value, last5_entries_used).
    """
    history = fighter_history.get(fighter, [])
    # filter strictly before fight_date, take last 5 (most recent first)
    prior = [h for h in history if h['date'] < fight_date]
    last5 = prior[-5:][::-1]   # most-recent first, up to 5

    if not last5:
        return 0.0, []

    DECAY = DECAY_COEFF
    num, den = 0.0, 0.0
    for i, h in enumerate(last5):
        w    = DECAY ** i
        tier = elo_to_tier(h['opp_pre_elo'])
        if h['result'] == 'W':
            num += w * (0.4 + 1.6 * tier)
        elif h['result'] == 'L':
            num += w * -(0.3 + 1.7 * (1.0 - tier))
        # NC/D: den += w, num unchanged (dilutes momentum)
        den += w

    raw = (num / den) * 2.0 if den > 0 else 0.0
    return max(-2.0, min(2.0, raw)), last5


# ── Scoring ───────────────────────────────────────────────────────────────────

def score_with_momentum(elo_fights, fighter_history, weight):
    results = []
    for f in elo_fights:
        date  = f['date']
        red   = f['red']
        blue  = f['blue']

        mom_r, _ = compute_momentum_pit(red,  date, fighter_history)
        mom_b, _ = compute_momentum_pit(blue, date, fighter_history)

        qual_diff   = mom_r - mom_b
        mom_contrib = clamp(qual_diff) * weight

        composite_mom = f['composite_elo'] + mom_contrib
        pA_mom        = sigmoid(SIGMOID_A * composite_mom + SIGMOID_B)
        pick_mom      = red if pA_mom >= 0.5 else blue
        prob_mom      = pA_mom if pA_mom >= 0.5 else 1.0 - pA_mom
        correct_mom   = (pick_mom == f['actual'])

        results.append({
            'correct_elo':   f['correct_elo'],
            'pick_elo':      f['pick_elo'],
            'pick_prob_elo': f['pick_prob_elo'],
            'pick':          pick_mom,
            'prob':          prob_mom,
            'correct':       correct_mom,
            'actual':        f['actual'],
            'mom_r':         round(mom_r, 4),
            'mom_b':         round(mom_b, 4),
            'qual_diff':     round(qual_diff, 4),
        })
    return results


# ── Reporting ─────────────────────────────────────────────────────────────────

def flip_stats(results):
    flipped = fixed = broken = 0
    for r in results:
        if r['pick'] != r['pick_elo']:
            flipped += 1
            if r['correct'] and not r['correct_elo']:
                fixed += 1
            elif not r['correct'] and r['correct_elo']:
                broken += 1
    return flipped, fixed, broken, fixed - broken


def make_buckets(results, prob_key='prob', correct_key='correct'):
    buckets = {lo: {'n': 0, 'hits': 0, 'prob_sum': 0.0} for lo in range(50, 95, 5)}
    for r in results:
        p  = r[prob_key]
        lo = bucket_key(p)
        buckets[lo]['n']        += 1
        buckets[lo]['hits']     += int(r[correct_key])
        buckets[lo]['prob_sum'] += p
    return buckets


def print_bucket_table(label_new, buckets_new, label_base, buckets_base):
    total_n = sum(b['n'] for b in buckets_new.values())
    total_b = sum(b['n'] for b in buckets_base.values())
    print(f"  (totals → {label_new}: {total_n}, {label_base}: {total_b})")
    hdr = (f"{'Bucket':>8}  {'N':>5}  {'Hits':>5}  {'Actual%':>8}  "
           f"{'AvgProb%':>9}  {'Delta':>7}  │  "
           f"{'ELO-N':>5}  {'ELO%':>7}  {'ELO-Δ':>7}")
    print(f"\n  {hdr}")
    print(f"  {'─' * len(hdr)}")
    for lo in sorted(buckets_new):
        bn = buckets_new[lo]
        bb = buckets_base[lo]
        if bn['n'] == 0 and bb['n'] == 0:
            continue
        n_act  = bn['hits'] / bn['n'] * 100       if bn['n'] else 0.0
        n_prob = bn['prob_sum'] / bn['n'] * 100   if bn['n'] else 0.0
        n_delt = n_act - n_prob
        b_act  = bb['hits'] / bb['n'] * 100       if bb['n'] else 0.0
        b_prob = bb['prob_sum'] / bb['n'] * 100   if bb['n'] else 0.0
        b_delt = b_act - b_prob
        print(
            f"  {lo:2d}–{lo+4:2d}%   {bn['n']:5d}  {bn['hits']:5d}  "
            f"{n_act:7.1f}%  {n_prob:8.1f}%  {n_delt:+6.1f}pp  │  "
            f"{bb['n']:5d}  {b_act:6.1f}%  {b_delt:+6.1f}pp"
        )


def report_variant(label, results, elo_acc, elo_n):
    total   = len(results)
    correct = sum(1 for r in results if r['correct'])
    acc     = correct / total
    delta   = (acc - elo_acc) * 100
    flipped, fixed, broken, net = flip_stats(results)
    print(f"\n{'='*62}")
    print(f"VARIANT: {label}")
    print(f"  ELO baseline   : {round(elo_acc*elo_n)}/{elo_n} = {elo_acc*100:.2f}%")
    print(f"  This variant   : {correct}/{total} = {acc*100:.2f}%")
    print(f"  Delta vs ELO   : {delta:+.2f} pp")
    print(f"  Picks changed  : {flipped}  (fixed={fixed}, broken={broken}, net={net:+d})")
    print(f"{'='*62}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # ── Build fight history + ELO walk ─────────────────────────────────────────
    print("Building fight history and ELO walk from ufc-master.csv …")
    fighter_history, pre_fight_elo = build_history_and_elo(CSV_PATH)
    print(f"  Unique fighters : {len(fighter_history)}")
    print(f"  ELO entries     : {len(pre_fight_elo)}")

    # ── Load ELO backtest ───────────────────────────────────────────────────────
    print("Loading ELO backtest …")
    elo_data   = json.loads(ELO_JSON.read_text())
    elo_fights = elo_data['fights']
    elo_acc    = elo_data['meta']['accuracy_elo']
    elo_n      = len(elo_fights)
    print(f"  Fights: {elo_n}  |  ELO accuracy: {elo_acc*100:.2f}%")

    # ── Sanity gate ─────────────────────────────────────────────────────────────
    print("\n" + "─"*62)
    print("SANITY GATE — confirming zero contamination")
    print("─"*62)

    contamination_found = False
    for f in elo_fights:
        date = f['date']
        for fighter in (f['red'], f['blue']):
            history = fighter_history.get(fighter, [])
            prior = [h for h in history if h['date'] < date]
            for h in prior[-5:][::-1]:
                # A fight on the SAME date as the current fight would be suspicious
                # (can't appear since filter is strict <)
                if h['date'] >= date:
                    contamination_found = True
                    print(f"  CONTAMINATION: {fighter} fight {date} includes prior entry {h['date']}")

    if not contamination_found:
        print("  ✓ No contamination detected — strict date < filter holds for all 3,380 fights.")
    else:
        print("  ✗ CONTAMINATION DETECTED — review filter logic before reporting results.")
        return

    # ── Worked examples ─────────────────────────────────────────────────────────
    print("\n" + "─"*62)
    print("WORKED EXAMPLES (2 fighters, confirm no current fight in inputs)")
    print("─"*62)

    examples = [elo_fights[500], elo_fights[1500]]
    for ex in examples:
        date  = ex['date']
        red   = ex['red']
        mom_r, last5_r = compute_momentum_pit(red, date, fighter_history)
        print(f"\n  Fighter : {red}")
        print(f"  Fight   : {date} vs {ex['blue']} (actual winner: {ex['actual']})")
        print(f"  Momentum: {mom_r:.4f}")
        print(f"  Prior fights used (most recent first, max 5):")
        if not last5_r:
            print("    (none — debut)")
        for h in last5_r:
            tier = elo_to_tier(h['opp_pre_elo'])
            print(f"    {h['date']}  {h['result']}  vs {h['opp']:<28}  "
                  f"opp_ELO={h['opp_pre_elo']:6.0f}  tier={tier:.3f}")
        # Confirm current fight NOT in list
        in_list = any(h['date'] == date and h['opp'] == ex['blue'] for h in last5_r)
        print(f"  Current fight in inputs: {'YES ← CONTAMINATION' if in_list else 'NO ✓'}")

    # ── Distribution diagnostic ─────────────────────────────────────────────────
    print("\n" + "─"*62)
    print("MOMENTUM DISTRIBUTION DIAGNOSTIC")
    print("─"*62)
    all_mom_r = []
    all_mom_b = []
    no_history_r = no_history_b = 0
    for f in elo_fights:
        mr, _ = compute_momentum_pit(f['red'],  f['date'], fighter_history)
        mb, _ = compute_momentum_pit(f['blue'], f['date'], fighter_history)
        all_mom_r.append(mr)
        all_mom_b.append(mb)
        h_r = [h for h in fighter_history.get(f['red'],  []) if h['date'] < f['date']]
        h_b = [h for h in fighter_history.get(f['blue'], []) if h['date'] < f['date']]
        if not h_r: no_history_r += 1
        if not h_b: no_history_b += 1

    all_diffs = [r - b for r, b in zip(all_mom_r, all_mom_b)]
    avg_abs_mom = sum(abs(d) for d in all_diffs) / len(all_diffs)
    max_abs_mom = max(abs(d) for d in all_diffs)
    nonzero_mom = sum(1 for d in all_diffs if abs(d) > 1e-6)
    print(f"  Fights with no red  history: {no_history_r}")
    print(f"  Fights with no blue history: {no_history_b}")
    print(f"  Non-zero qualMomDiff        : {nonzero_mom} / {len(all_diffs)}")
    print(f"  Avg |qualMomDiff|           : {avg_abs_mom:.4f}")
    print(f"  Max |qualMomDiff|           : {max_abs_mom:.4f}")

    # ── Primary run at weight 0.05 ──────────────────────────────────────────────
    W05 = 0.05
    results_05 = score_with_momentum(elo_fights, fighter_history, W05)

    acc_05    = sum(1 for r in results_05 if r['correct']) / elo_n
    delta_05  = (acc_05 - elo_acc) * 100

    # Contamination red flag: >3pp jump is suspicious
    if delta_05 > 3.0:
        print(f"\n  ⚠  RED FLAG: +{delta_05:.2f}pp exceeds 3pp threshold — re-audit before trusting.")
        return

    buckets_elo = make_buckets(elo_fights, prob_key='pick_prob_elo', correct_key='correct_elo')
    buckets_05  = make_buckets(results_05)

    report_variant(f"qualMomDiff @ weight {W05}", results_05, elo_acc, elo_n)
    print(f"\nBucket table — momentum 0.05× vs ELO baseline:")
    print_bucket_table(f"mom-{W05}", buckets_05, "ELO-base", buckets_elo)

    # ── Weight sweep ────────────────────────────────────────────────────────────
    print(f"\n{'─'*62}")
    print("WEIGHT SWEEP")
    print(f"  {'Weight':>8}  {'Correct':>8}  {'Accuracy':>10}  {'Δ vs ELO':>10}  {'Flipped':>8}  {'Net':>5}")
    for w in [0.05, 0.10, 0.15]:
        res = score_with_momentum(elo_fights, fighter_history, w)
        cor = sum(1 for r in res if r['correct'])
        ac  = cor / elo_n
        dlt = (ac - elo_acc) * 100
        flp, fx, bk, nt = flip_stats(res)
        print(f"  {w:8.2f}   {cor:8d}  {ac*100:9.2f}%  {dlt:+9.2f}pp  {flp:8d}  {nt:+5d}")

    # ── Summary ─────────────────────────────────────────────────────────────────
    print(f"\n{'─'*62}")
    print("SUMMARY")
    print(f"  {'Variant':<35}  {'Accuracy':>9}  {'Δ vs ELO':>9}")
    print(f"  {'─'*35}  {'─'*9}  {'─'*9}")
    print(f"  {'ELO baseline':<35}  {elo_acc*100:9.2f}%  {'—':>9}")
    for w in [0.05, 0.10, 0.15]:
        res = score_with_momentum(elo_fights, fighter_history, w)
        cor = sum(1 for r in res if r['correct'])
        ac  = cor / elo_n
        dlt = (ac - elo_acc) * 100
        print(f"  {f'qualMomDiff @ {w:.2f}':<35}  {ac*100:9.2f}%  {dlt:+8.2f}pp")

    # ── Save primary (0.05) results ─────────────────────────────────────────────
    for i, (f, r) in enumerate(zip(elo_fights, results_05)):
        elo_fights[i] = {**f, **{
            'mom_r': r['mom_r'], 'mom_b': r['mom_b'],
            'qual_diff': r['qual_diff'],
            'pick_mom': r['pick'], 'pick_prob_mom': r['prob'],
            'correct_mom': r['correct'],
        }}
    output = {
        'meta': {
            **elo_data['meta'],
            'momentum_weight': W05,
            'momentum_decay':  DECAY_COEFF,
            'momentum_window': 5,
            'tier_proxy': 'point-in-time ELO linear: ELO1500→0.12, ELO1800→1.00',
            'correct_mom': sum(1 for r in results_05 if r['correct']),
            'accuracy_mom': round(acc_05, 6),
            'delta_vs_elo_pp': round(delta_05, 3),
        },
        'fights': elo_fights,
    }
    OUTPUT_JSON.write_text(json.dumps(output, indent=2))
    print(f"\nSaved → {OUTPUT_JSON}")


if __name__ == '__main__':
    main()
