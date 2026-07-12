#!/usr/bin/env python3
"""
backtest_form_separation.py
Tests three variants of moving win_dif / loss_dif out of the form domain.

Live formScore (App.js:1754-1758):
  formScore = clamp(win_streak_dif)*W.win_streak_dif
            + clamp(lose_streak_dif)*W.lose_streak_dif
            + clamp(win_dif)*W.win_dif            ← career-record proxies
            + clamp(loss_dif)*W.loss_dif           ← career-record proxies

  win_dif  = (wins_r  - wins_b)  / S.win_dif   [S=4.4,  W=0.03834]
  loss_dif = (losses_b - losses_r) / S.loss_dif [S=2.7,  W=0.04606]  ← reversed

Variants tested (all on top of ELO-active baseline, composite_elo):
  V1 — Remove entirely : weights → 0     (composite -= win_c + loss_c)
  V2 — Relocate, same weight: no change to composite (mathematically identical
       to baseline; confirmed for completeness)
  V3 — Relocate, half weight: weights × 0.5 (composite -= 0.5*(win_c + loss_c))

Starting point: backtest_results_elo.json (1974/3380 = 58.40%)
"""

import json
import math
import pathlib

LEDGER_JSON = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_ledger.json")
ELO_JSON    = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results_elo.json")

SIGMOID_A = 1.609621
SIGMOID_B = -0.18753374136521064

# Scales and weights from App.js MODEL
S_WIN  = 4.4
S_LOSS = 2.7
W_WIN  = 0.03834
W_LOSS = 0.04606


def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))


def clamp(v, lo=-2.0, hi=2.0):
    return max(lo, min(hi, v))


def bucket_key(prob):
    p_pct = prob * 100
    lo = int(p_pct // 5) * 5
    return max(50, min(lo, 90))


def score_variant(elo_fights, ledger_lookup, win_w_scale, loss_w_scale):
    """
    Remove or scale win_dif / loss_dif contribution from composite_elo.
      win_w_scale  = 0 → remove, 0.5 → half, 1.0 → keep (no-op)
      loss_w_scale = same

    win_contrib  already in composite = clamp((r_wins-b_wins)/4.4) * 0.03834
    loss_contrib already in composite = clamp((b_losses-r_losses)/2.7) * 0.04606

    Adjustment = (new_weight - current_weight) * clamp_value
               = (scale-1) * original_contrib
    So: composite_new = composite_elo + (scale-1)*(win_c + loss_c)
    """
    results = []
    unmatched = 0

    for f in elo_fights:
        key = (f['date'], f['red'], f['blue'])
        if key in ledger_lookup:
            wins_r, losses_r, wins_b, losses_b = ledger_lookup[key]
        else:
            wins_r = losses_r = wins_b = losses_b = 0
            unmatched += 1

        win_c  = clamp((wins_r  - wins_b)  / S_WIN)  * W_WIN
        loss_c = clamp((losses_b - losses_r) / S_LOSS) * W_LOSS

        # (scale-1): e.g. 0→ removes contrib (0-1=-1 → subtract all)
        adj = (win_w_scale  - 1.0) * win_c + \
              (loss_w_scale - 1.0) * loss_c

        composite_new = f['composite_elo'] + adj
        pA_new        = sigmoid(SIGMOID_A * composite_new + SIGMOID_B)
        pick_new      = f['red'] if pA_new >= 0.5 else f['blue']
        prob_new      = pA_new if pA_new >= 0.5 else 1.0 - pA_new
        correct_new   = (pick_new == f['actual'])

        results.append({
            'correct_elo':  f['correct_elo'],
            'pick_elo':     f['pick_elo'],
            'pick_prob_elo': f['pick_prob_elo'],
            'pick':         pick_new,
            'prob':         prob_new,
            'correct':      correct_new,
            'actual':       f['actual'],
        })

    return results, unmatched


def bucket_table(results, prob_key='prob', correct_key='correct'):
    buckets = {lo: {'n': 0, 'hits': 0, 'prob_sum': 0.0} for lo in range(50, 95, 5)}
    for r in results:
        p  = r[prob_key]
        lo = bucket_key(p)
        buckets[lo]['n']        += 1
        buckets[lo]['hits']     += int(r[correct_key])
        buckets[lo]['prob_sum'] += p
    return buckets


def print_comparison(label_new, results_new, label_base, results_base):
    bt_new  = bucket_table(results_new)
    bt_base = bucket_table(results_base, prob_key='pick_prob_elo', correct_key='correct_elo')

    total_new  = sum(b['n'] for b in bt_new.values())
    total_base = sum(b['n'] for b in bt_base.values())
    print(f"  (totals → {label_new}: {total_new}, {label_base}: {total_base})")

    hdr = (f"{'Bucket':>8}  {'N':>5}  {'Hits':>5}  {'Actual%':>8}  "
           f"{'AvgProb%':>9}  {'Delta':>7}  │  "
           f"{'ELO-N':>5}  {'ELO%':>7}  {'ELO-Δ':>7}")
    print(f"\n  {hdr}")
    print(f"  {'─' * len(hdr)}")

    for lo in sorted(bt_new):
        bn = bt_new[lo]
        bb = bt_base[lo]
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


def flip_stats(results_new, results_base):
    """Returns (total_flipped, fixed, broken, net)."""
    flipped = fixed = broken = 0
    for n, b in zip(results_new, results_base):
        if n['pick'] != b['pick_elo']:
            flipped += 1
            if n['correct'] and not b['correct_elo']:
                fixed += 1
            elif not n['correct'] and b['correct_elo']:
                broken += 1
    return flipped, fixed, broken, fixed - broken


def report(label, results_new, results_base, elo_acc):
    total   = len(results_new)
    correct = sum(1 for r in results_new if r['correct'])
    acc     = correct / total
    delta   = (acc - elo_acc) * 100
    flipped, fixed, broken, net = flip_stats(results_new, results_base)

    print(f"\n{'='*62}")
    print(f"VARIANT: {label}")
    print(f"  ELO baseline        : {round(elo_acc*total)}/{total} = {elo_acc*100:.2f}%")
    print(f"  This variant        : {correct}/{total} = {acc*100:.2f}%")
    print(f"  Delta vs ELO        : {delta:+.2f} pp")
    print(f"  Picks changed       : {flipped}  "
          f"(fixed={fixed}, broken={broken}, net={net:+d})")
    print(f"{'='*62}")
    print_comparison(label, results_new, "ELO-base", results_base)


def main():
    # ── Build ledger lookup ──────────────────────────────────────────────────────
    print("Building ledger lookup …")
    ledger = json.loads(LEDGER_JSON.read_text())
    ledger_lookup = {}
    for entry in ledger['fights']:
        key = (entry['date'], entry['red_fighter'], entry['blue_fighter'])
        r = entry['red']
        b = entry['blue']
        ledger_lookup[key] = (r['wins'], r['losses'], b['wins'], b['losses'])
    print(f"  Ledger entries: {len(ledger_lookup)}")

    # ── Load ELO backtest ────────────────────────────────────────────────────────
    print("Loading ELO backtest …")
    elo_data   = json.loads(ELO_JSON.read_text())
    elo_fights = elo_data['fights']
    elo_acc    = elo_data['meta']['accuracy_elo']
    total      = len(elo_fights)
    print(f"  Fights: {total}  |  ELO accuracy: {elo_acc*100:.2f}%")

    # ── Win / loss contribution stats (diagnostic) ───────────────────────────────
    print("\nDiagnostic: win_dif / loss_dif contribution distribution …")
    win_contribs  = []
    loss_contribs = []
    nonzero_win = nonzero_loss = 0
    for f in elo_fights:
        key = (f['date'], f['red'], f['blue'])
        if key in ledger_lookup:
            wins_r, losses_r, wins_b, losses_b = ledger_lookup[key]
        else:
            wins_r = losses_r = wins_b = losses_b = 0
        wc = clamp((wins_r  - wins_b)  / S_WIN)  * W_WIN
        lc = clamp((losses_b - losses_r) / S_LOSS) * W_LOSS
        win_contribs.append(wc)
        loss_contribs.append(lc)
        if abs(wc) > 1e-6:
            nonzero_win += 1
        if abs(lc) > 1e-6:
            nonzero_loss += 1

    avg_abs_win  = sum(abs(x) for x in win_contribs)  / total
    avg_abs_loss = sum(abs(x) for x in loss_contribs) / total
    max_abs_win  = max(abs(x) for x in win_contribs)
    max_abs_loss = max(abs(x) for x in loss_contribs)
    print(f"  win_dif  — nonzero: {nonzero_win}, avg|contrib|={avg_abs_win:.5f}, max|contrib|={max_abs_win:.5f}")
    print(f"  loss_dif — nonzero: {nonzero_loss}, avg|contrib|={avg_abs_loss:.5f}, max|contrib|={max_abs_loss:.5f}")

    # ── V1: Remove entirely (weight → 0) ────────────────────────────────────────
    v1, um1 = score_variant(elo_fights, ledger_lookup, win_w_scale=0.0, loss_w_scale=0.0)
    report("V1 — Remove win_dif + loss_dif entirely", v1, elo_fights, elo_acc)

    # ── V2: Relocate at same weight (no-op — confirmed) ─────────────────────────
    v2, um2 = score_variant(elo_fights, ledger_lookup, win_w_scale=1.0, loss_w_scale=1.0)
    total_v2  = len(v2)
    correct_v2 = sum(1 for r in v2 if r['correct'])
    print(f"\n{'='*62}")
    print(f"VARIANT: V2 — Relocate at same weight (math no-op)")
    print(f"  Relocating win_dif/loss_dif to experience domain with identical")
    print(f"  weights doesn't change the flat weighted sum → composite unchanged.")
    print(f"  Confirmed: {correct_v2}/{total_v2} = {correct_v2/total_v2*100:.2f}% (should equal ELO baseline 58.40%)")
    print(f"{'='*62}")

    # ── V3: Relocate at half weight (weight × 0.5) ──────────────────────────────
    v3, um3 = score_variant(elo_fights, ledger_lookup, win_w_scale=0.5, loss_w_scale=0.5)
    report("V3 — Relocate at half weight (weight × 0.5)", v3, elo_fights, elo_acc)

    # ── Summary table ────────────────────────────────────────────────────────────
    def acc(results):
        return sum(1 for r in results if r['correct']) / len(results)

    print(f"\n{'─'*62}")
    print("SUMMARY")
    print(f"  {'Variant':<40}  {'Accuracy':>9}  {'Δ vs ELO':>9}")
    print(f"  {'─'*40}  {'─'*9}  {'─'*9}")
    print(f"  {'ELO baseline (56.95%→58.40%)':<40}  {elo_acc*100:9.2f}%  {'—':>9}")
    for label, results in [
        ("V1 — Remove entirely",          v1),
        ("V2 — Relocate, same weight",    v2),
        ("V3 — Relocate, half weight",    v3),
    ]:
        a = acc(results)
        d = (a - elo_acc) * 100
        print(f"  {label:<40}  {a*100:9.2f}%  {d:+8.2f}pp")


if __name__ == '__main__':
    main()
