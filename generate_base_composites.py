#!/usr/bin/env python3
"""
generate_base_composites.py
Recreates the missing point-in-time base-composite generator whose output is
backtest_results.json (post-2019-06-22 cutoff, 3,380 decisive fights).

The base composite is the live App.js computeMatchupEdges composite WITHOUT:
  elo_dif        (patched in downstream by backtest_elo.py)
  SOS / momentum (added at evaluation by backtest_combo_v2.py)
  agePenAdj      (display-only at original generation time; see backtest_age.py)
and with the meta-documented neutralizations:
  atd_dif = 0 (ATD 0.60 both)   cardio_dif = 0 (1.0 both)
  layoff_dif = 0 (180 each)     deep_round_dif = 0
No prospect/debut logic exists in the historical walk.

Reconstruction-by-proof: several definitional details (stat units, division-mean
construction, KO accounting, height units) are not recoverable from the meta
alone, so a DISCOVERY pass evaluates every candidate combination against the
per-fight composite values stored in backtest_results.json and locks the combo
that reproduces them. Gate: max |recon - stored| <= 1e-6 across all fights.

Contamination checks (both reported at the end):
  1. As-of-date column assertion — a fighter's cumulative win-method columns
     must reflect a fight only in LATER rows, never in the row of the fight
     itself (verifies the CSV's pre-fight column semantics we rely on).
  2. Odds-masking equivalence — composites are recomputed with R_odds/B_odds
     blanked; output must be bit-identical (proves no odds leakage).
"""

import csv
import json
import math
import pathlib
from collections import defaultdict
from itertools import product

CSV_PATH    = pathlib.Path.home() / "Downloads/UltimateUFCDatabase/ufc-master.csv"
STORED_JSON = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results.json")
OUTPUT_JSON = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results_recon.json")

CUTOFF    = "2019-06-22"
SIGMOID_A = 1.609621
SIGMOID_B = -0.18753374136521064

# ── Weights (App.js MODEL.W_NO) and derived pool weights ──────────────────────
W = {
    'win_streak_dif': 0.077696, 'avg_td_dif': 0.068343, 'sig_str_dif': 0.063872,
    'R_acc': 0.058393, 'total_round_dif': 0.056274, 'B_acc': 0.048587,
    'loss_dif': 0.04606, 'height_dif': 0.044978, 'R_tdp': 0.043259,
    'lose_streak_dif': 0.042474, 'avg_sub_att_dif': 0.04195, 'age_dif': 0.041496,
    'reach_dif': 0.03988, 'B_tdp': 0.039716, 'ko_dif': 0.039261,
    'win_dif': 0.03834, 'total_title_bout_dif': 0.036427, 'sub_dif': 0.031623,
}
ACC_W      = W['R_acc'] + W['B_acc']                       # 0.106980
TDP_W      = W['R_tdp'] + W['B_tdp']                       # 0.082975
ATD_W      = 0.04
G_POOL     = W['avg_td_dif'] + TDP_W + W['avg_sub_att_dif']
G_SCALE    = (G_POOL - ATD_W) / G_POOL
TD_OFF_W   = W['avg_td_dif'] * G_SCALE
TD_DEF_W   = TDP_W * G_SCALE
SUB_ATT_W  = W['avg_sub_att_dif'] * G_SCALE
E_POOL     = W['total_round_dif'] + W['total_title_bout_dif']
FIGHT_CT_W = E_POOL * 0.58
# deep-round weight (E_POOL * 0.42) carries a zeroed feature — omitted from sums

# ── Scales (App.js MODEL.SCALES) ──────────────────────────────────────────────
S = {
    'sig_str': 15.8, 'acc': 0.1, 'td': 1.4, 'td_pct': 0.23, 'sub_att': 0.7,
    'reach': 10.8, 'height': 9.1, 'age': 4.3, 'win_streak': 1.4,
    'lose_streak': 1.0, 'win': 4.4, 'loss': 2.7, 'ko': 2.0, 'sub': 1.4,
    'ufc_count': 8,
}

CONST_MEANS = {'asl': 3.5, 'asp': 0.44, 'atl': 1.0, 'atp': 0.35, 'asa': 0.25}
RATE_KEYS = ('asl', 'asp', 'atl', 'atp', 'asa')


def clamp(v, lo=-2.0, hi=2.0):
    return max(lo, min(hi, v))


def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))


def fnum(x, default=0.0):
    """CSV cell -> float; '' / NaN / garbage -> default (mirrors App.js `?? 0`)."""
    try:
        v = float(x)
    except (TypeError, ValueError):
        return default
    return v if v == v else default


def sample_blend(stat, mean, total_min):
    w = min(1.0, total_min / 75.0)
    return w * stat + (1.0 - w) * mean


def form_decay(lose_streak):
    return max(0.8, 1.0 - min(lose_streak, 3.0) * 0.07)


# ── Per-side raw stat extraction under a unit variant ─────────────────────────
def side_stats(row, prefix, variant):
    """Returns dict of raw rate stats + counters for one corner ('R' or 'B')."""
    g = lambda col, d=0.0: fnum(row.get(f'{prefix}_{col}'), d)
    rounds    = g('total_rounds_fought')
    total_min = rounds * 5.0
    wins      = g('wins')
    losses    = g('losses')
    n_fights  = wins + losses
    asl = g('avg_SIG_STR_landed')
    atl = g('avg_TD_landed')
    asa = g('avg_SUB_ATT')
    if variant['units'] == 'per_min':
        avg_min = (total_min / n_fights) if n_fights > 0 else 15.0
        if avg_min <= 0:
            avg_min = 15.0
        asl, atl, asa = asl / avg_min, atl / avg_min, asa / avg_min
    ko = g('win_by_KO/TKO')
    if variant['ko_doc']:
        ko += g('win_by_TKO_Doctor_Stoppage')
    hr_div = 1.0 if variant['hr_units'] == 'cms' else 2.54
    return {
        'asl': asl, 'asp': g('avg_SIG_STR_pct'), 'atl': atl,
        'atp': g('avg_TD_pct'), 'asa': asa,
        'total_min': total_min, 'wins': wins, 'losses': losses,
        'n_fights': n_fights, 'ko': ko, 'sub': g('win_by_Submission'),
        'win_streak': g('current_win_streak'), 'lose_streak': g('current_lose_streak'),
        'height': g('Height_cms') / hr_div, 'reach': g('Reach_cms') / hr_div,
        'age': fnum(row.get(f'{prefix}_age'), 30.0),
    }


# ── Division-mean providers ───────────────────────────────────────────────────
def build_csv_means(rows, variant, per_division):
    """Whole-CSV means of the (variant-transformed) rate stats. NaN rows skipped."""
    sums = defaultdict(lambda: defaultdict(float))
    counts = defaultdict(lambda: defaultdict(int))
    for row in rows:
        key = row['weight_class'] if per_division else '__ALL__'
        for prefix in ('R', 'B'):
            st = side_stats(row, prefix, variant)
            for k in RATE_KEYS:
                raw = row.get(f'{prefix}_{_COL[k]}')
                if raw is None or raw == '' or fnum(raw, float('nan')) != fnum(raw, float('nan')):
                    pass
                if raw not in (None, ''):
                    sums[key][k] += st[k]
                    counts[key][k] += 1
    means = {}
    for key, kv in sums.items():
        means[key] = {k: (kv[k] / counts[key][k]) if counts[key][k] else CONST_MEANS[k]
                      for k in RATE_KEYS}
    return means


_COL = {'asl': 'avg_SIG_STR_landed', 'asp': 'avg_SIG_STR_pct',
        'atl': 'avg_TD_landed', 'atp': 'avg_TD_pct', 'asa': 'avg_SUB_ATT'}


class RollingMeans:
    """As-of-date per-division means: rows strictly before the current date."""
    def __init__(self, variant, per_division=True):
        self.variant = variant
        self.per_division = per_division
        self.sums = defaultdict(lambda: defaultdict(float))
        self.counts = defaultdict(lambda: defaultdict(int))

    def key(self, row):
        return row['weight_class'] if self.per_division else '__ALL__'

    def get(self, row):
        key = self.key(row)
        return {k: (self.sums[key][k] / self.counts[key][k])
                   if self.counts[key][k] else CONST_MEANS[k]
                for k in RATE_KEYS}

    def add(self, row):
        key = self.key(row)
        for prefix in ('R', 'B'):
            st = side_stats(row, prefix, self.variant)
            for k in RATE_KEYS:
                if row.get(f'{prefix}_{_COL[k]}') not in (None, ''):
                    self.sums[key][k] += st[k]
                    self.counts[key][k] += 1


# ── The composite ─────────────────────────────────────────────────────────────
def compute_composite(row, variant, mean_provider):
    A = side_stats(row, 'R', variant)
    B = side_stats(row, 'B', variant)
    mean = mean_provider(row)

    fdA, fdB = form_decay(A['lose_streak']), form_decay(B['lose_streak'])
    aslA = sample_blend(A['asl'], mean['asl'], A['total_min']) * fdA
    aslB = sample_blend(B['asl'], mean['asl'], B['total_min']) * fdB
    aspA = sample_blend(A['asp'], mean['asp'], A['total_min']) * (0.6 + 0.4 * fdA)
    aspB = sample_blend(B['asp'], mean['asp'], B['total_min']) * (0.6 + 0.4 * fdB)
    atlA = sample_blend(A['atl'], mean['atl'], A['total_min'])
    atlB = sample_blend(B['atl'], mean['atl'], B['total_min'])
    atpA = sample_blend(A['atp'], mean['atp'], A['total_min'])
    atpB = sample_blend(B['atp'], mean['atp'], B['total_min'])
    asaA = sample_blend(A['asa'], mean['asa'], A['total_min'])
    asaB = sample_blend(B['asa'], mean['asa'], B['total_min'])

    striking = (clamp((aslA - aslB) / S['sig_str']) * W['sig_str_dif'] +
                clamp((aspA - aspB) / S['acc']) * ACC_W)
    grappling = (clamp((atlA - atlB) / S['td']) * TD_OFF_W +
                 clamp((atpA - atpB) / S['td_pct']) * TD_DEF_W +
                 clamp((asaA - asaB) / S['sub_att']) * SUB_ATT_W)
    # atd_dif = 0 (constant 0.60 both sides)
    physical = (clamp((A['reach'] - B['reach']) / S['reach']) * W['reach_dif'] +
                clamp((A['height'] - B['height']) / S['height']) * W['height_dif'] +
                clamp((B['age'] - A['age']) / S['age']) * W['age_dif'])
    form = (clamp((A['win_streak'] - B['win_streak']) / S['win_streak']) * W['win_streak_dif'] +
            clamp((B['lose_streak'] - A['lose_streak']) / S['lose_streak']) * W['lose_streak_dif'] +
            clamp((A['wins'] - B['wins']) / S['win']) * W['win_dif'] +
            clamp((B['losses'] - A['losses']) / S['loss']) * W['loss_dif'])
    experience = (clamp((A['n_fights'] - B['n_fights']) / S['ufc_count']) * FIGHT_CT_W +
                  clamp((A['ko'] - B['ko']) / S['ko']) * W['ko_dif'] +
                  clamp((A['sub'] - B['sub']) / S['sub']) * W['sub_dif'])
    # deep_round_dif = 0 · analytics: elo_dif = 0, layoff_dif = 0, cardio_dif = 0
    return striking + grappling + physical + form + experience


# ── Data loading ──────────────────────────────────────────────────────────────
def load_rows():
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        rows = [r for r in csv.DictReader(f)]
    rows.sort(key=lambda r: r['date'])
    return rows


def scored_subset(rows):
    return [r for r in rows
            if r['date'] >= CUTOFF and r['Winner'].strip() in ('Red', 'Blue')]


# ── Contamination check 1: as-of-date column semantics ────────────────────────
def check_as_of_date(rows):
    """A KO/sub win at fight N must NOT be in the fighter's columns at fight N;
    it must be reflected at fight N+1. Counts violations across all fighters."""
    appearances = defaultdict(list)   # name -> [(date, ko_count, sub_count, won_by)]
    for r in rows:
        finish = (r.get('finish') or '').strip()
        for prefix in ('R', 'B'):
            name = r[f'{prefix}_fighter'].strip()
            won = (r['Winner'].strip() == ('Red' if prefix == 'R' else 'Blue'))
            ko_now = fnum(r.get(f'{prefix}_win_by_KO/TKO')) + \
                     fnum(r.get(f'{prefix}_win_by_TKO_Doctor_Stoppage'))
            sub_now = fnum(r.get(f'{prefix}_win_by_Submission'))
            appearances[name].append((r['date'], ko_now, sub_now, won, finish))
    violations = checked = 0
    for name, seq in appearances.items():
        seq.sort(key=lambda t: t[0])
        for (d1, ko1, sub1, won1, fin1), (d2, ko2, sub2, _w2, _f2) in zip(seq, seq[1:]):
            if not won1:
                continue
            checked += 1
            if fin1 in ('KO/TKO', 'TKO - Doctor\'s Stoppage') and not (ko2 >= ko1 + 1):
                violations += 1
            elif fin1 == 'SUB' and not (sub2 >= sub1 + 1):
                violations += 1
            # the row of the fight itself must not already include it:
            if fin1 in ('KO/TKO',) and ko1 > 0 and ko2 == ko1 and fin1 == 'KO/TKO':
                pass  # covered above
    return checked, violations


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("Loading ufc-master.csv …")
    rows = load_rows()
    scored = scored_subset(rows)
    print(f"  Total rows: {len(rows)}  ·  post-cutoff decisive: {len(scored)}")

    print("Loading stored backtest_results.json …")
    stored = json.loads(STORED_JSON.read_text())
    stored_by_key = {(f['date'], f['red'], f['blue']): f for f in stored['fights']}
    print(f"  Stored fights: {len(stored_by_key)}")

    # ── DISCOVERY: evaluate candidate definitions against stored composites ──
    variants = []
    for units, mean_mode, ko_doc, hr_units in product(
            ('per_fight', 'per_min'),
            ('const', 'csv_div', 'csv_global', 'rolling_div'),
            (False, True),
            ('inches', 'cms')):
        variants.append({'units': units, 'mean_mode': mean_mode,
                         'ko_doc': ko_doc, 'hr_units': hr_units})

    print(f"\nDISCOVERY over {len(variants)} candidate definitions …")
    results = []
    for v in variants:
        if v['mean_mode'] == 'const':
            provider = lambda row, _v=v: CONST_MEANS
        elif v['mean_mode'] in ('csv_div', 'csv_global'):
            means = build_csv_means(rows, v, per_division=(v['mean_mode'] == 'csv_div'))
            provider = lambda row, _m=means, _v=v: _m.get(
                row['weight_class'] if _v['mean_mode'] == 'csv_div' else '__ALL__',
                CONST_MEANS)
        else:  # rolling_div — needs the date walk
            provider = None

        diffs = []
        if provider is not None:
            for r in scored:
                key = (r['date'], r['R_fighter'].strip(), r['B_fighter'].strip())
                f = stored_by_key.get(key)
                if not f:
                    continue
                diffs.append(abs(compute_composite(r, v, provider) - f['composite']))
        else:
            rolling = RollingMeans(v, per_division=True)
            i, n = 0, len(rows)
            while i < n:
                j = i
                while j < n and rows[j]['date'] == rows[i]['date']:
                    j += 1
                for r in rows[i:j]:
                    if r['date'] >= CUTOFF and r['Winner'].strip() in ('Red', 'Blue'):
                        key = (r['date'], r['R_fighter'].strip(), r['B_fighter'].strip())
                        f = stored_by_key.get(key)
                        if f:
                            diffs.append(abs(
                                compute_composite(r, v, rolling.get) - f['composite']))
                for r in rows[i:j]:
                    rolling.add(r)
                i = j
        mx = max(diffs) if diffs else float('inf')
        mean_d = sum(diffs) / len(diffs) if diffs else float('inf')
        results.append((mx, mean_d, len(diffs), v))

    results.sort(key=lambda t: t[0])
    print(f"\n  {'max|diff|':>12}  {'mean|diff|':>12}  {'n':>5}   variant")
    for mx, mean_d, n, v in results[:6]:
        print(f"  {mx:12.6g}  {mean_d:12.6g}  {n:5d}   {v}")

    best_mx, best_mean, best_n, best_v = results[0]
    if best_mx > 1e-6:
        print(f"\n*** NO CANDIDATE REPRODUCES STORED COMPOSITES (best max|diff| = {best_mx:.6g}) ***")
        print("*** STOP — definitional mismatch; see top candidates above. ***")
        return

    print(f"\n  LOCKED definition: {best_v}  (max|diff| = {best_mx:.2e} over {best_n} fights)")

    # ── Contamination check 1 ────────────────────────────────────────────────
    checked, violations = check_as_of_date(rows)
    print(f"\nContamination check 1 — as-of-date column semantics:")
    print(f"  win→next-row increments checked: {checked} · violations: {violations}")

    # ── Generate full output with the locked definition ──────────────────────
    def make_provider(v, rows):
        if v['mean_mode'] == 'const':
            return lambda row: CONST_MEANS, None
        if v['mean_mode'] in ('csv_div', 'csv_global'):
            means = build_csv_means(rows, v, per_division=(v['mean_mode'] == 'csv_div'))
            return (lambda row: means.get(
                row['weight_class'] if v['mean_mode'] == 'csv_div' else '__ALL__',
                CONST_MEANS)), None
        rolling = RollingMeans(v, per_division=True)
        return rolling.get, rolling

    def generate(rows_in, v):
        provider, rolling = make_provider(v, rows_in)
        out = []
        i, n = 0, len(rows_in)
        while i < n:
            j = i
            while j < n and rows_in[j]['date'] == rows_in[i]['date']:
                j += 1
            for r in rows_in[i:j]:
                if r['date'] >= CUTOFF and r['Winner'].strip() in ('Red', 'Blue'):
                    comp = compute_composite(r, v, provider)
                    pA = sigmoid(SIGMOID_A * comp + SIGMOID_B)
                    red, blue = r['R_fighter'].strip(), r['B_fighter'].strip()
                    pick = red if pA >= 0.5 else blue
                    actual = red if r['Winner'].strip() == 'Red' else blue
                    out.append({
                        'date': r['date'], 'red': red, 'blue': blue,
                        'weight_class': r['weight_class'],
                        'pick': pick,
                        'pick_prob': round(pA if pA >= 0.5 else 1 - pA, 6),
                        'pA': round(pA, 6),
                        'actual': actual, 'correct': pick == actual,
                        'composite': round(comp, 6),
                    })
            if rolling is not None:
                for r in rows_in[i:j]:
                    rolling.add(r)
            i = j
        return out

    fights = generate(rows, best_v)

    # ── Contamination check 2: odds-masking equivalence ──────────────────────
    masked = [dict(r, **{'R_odds': '', 'B_odds': '', 'R_ev': '', 'B_ev': ''}) for r in rows]
    fights_masked = generate(masked, best_v)
    odds_identical = fights == fights_masked
    print(f"\nContamination check 2 — odds-masking equivalence: "
          f"{'IDENTICAL ✓' if odds_identical else '*** OUTPUT CHANGED — ODDS LEAKAGE ***'}")

    correct = sum(1 for f in fights if f['correct'])
    print(f"\nBase accuracy: {correct}/{len(fights)} = {correct/len(fights)*100:.2f}%"
          f"   (stored meta target: 1925/3380 = 56.95%)")

    OUTPUT_JSON.write_text(json.dumps({
        'meta': {
            **stored['meta'],
            'regenerated_by': 'generate_base_composites.py',
            'locked_definition': best_v,
            'per_fight_max_abs_diff_vs_stored': best_mx,
            'as_of_date_checks': checked,
            'as_of_date_violations': violations,
            'odds_masking_identical': odds_identical,
            'correct': correct,
            'accuracy': round(correct / len(fights), 6),
            'total_scored': len(fights),
        },
        'fights': fights,
    }, indent=2))
    print(f"Saved → {OUTPUT_JSON}")


if __name__ == '__main__':
    main()
