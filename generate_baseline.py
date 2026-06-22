#!/usr/bin/env python3
"""
generate_baseline.py
─────────────────────────────────────────────────────────────────────────────
Faithful, reproducible point-in-time BASE-composite generator for the UFC model.

This SUPERSEDES the lost original generator behind backtest_results.json. Per
BASELINE_NOTES.md §4/§6 it does NOT chase the old 61.1% number: it locks a clean,
App.js-faithful definition and an explicitly-specified (frozen) low-sample blend
target, then accepts whatever accuracy the fixed harness produces as the new
authoritative baseline. The generator is committed alongside its output.

WHAT THE BASE COMPOSITE IS  (App.js computeMatchupEdges, neutralized terms removed)
  striking + grappling + physical + form + experience
  with elo_dif / layoff_dif / cardio_dif / atd_dif / deep_round_dif = 0
  (elo patched downstream by backtest_elo.py; SOS/Mom added by backtest_combo_v2.py)

LOW-SAMPLE BLEND (App.js, authoritative)
  sampleBlend(stat, divMean, totalMin) = w*stat + (1-w)*divMean,  w = min(1, totalMin/75)
  divMean := frozen CONST_MEANS  (App.js per-call fallback constants; NOT the
  runtime-computed, roster-dependent, non-point-in-time DIVISION_UFC_AVERAGES).

SELF-VERIFICATION (runs FIRST; hard gate)
  Reproduce the >=75-column-minute subset of the ORIGINAL stored composites
  bit-exactly (max|diff| <= 1e-6). If it fails, STOP — do not emit a baseline
  from a broken generator. The original is snapshotted to backtest_results_original.json
  (immutable anchor) so this check stays runnable after the output is overwritten.

CUTOFF
  Every scored row is hard-asserted date >= 2019-06-22; exclusions are logged.

SIGMOID CONTEXT
  The harness (backtest_elo.py / backtest_combo_v2.py) applies the OLD sigmoid
  a=1.609621, b=-0.18753374136521064. The LIVE app uses the symmetric a=2.0, b=0.
  The reported baseline number is therefore produced under the harness's old
  sigmoid; near the decision threshold the two can pick different fighters.
"""

import csv
import json
import math
import pathlib
import shutil
from collections import defaultdict

CSV_PATH      = pathlib.Path.home() / "Downloads/UltimateUFCDatabase/ufc-master.csv"
STORED_JSON   = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results.json")
ORIGINAL_JSON = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results_original.json")
OUTPUT_JSON   = pathlib.Path("/Users/alexdrossman/fightmetrics/backtest_results.json")

CUTOFF = "2019-06-22"

# Harness sigmoid (backtest_elo.py + backtest_combo_v2.py). The base composite is
# sigmoid-independent for ACCURACY upstream only through pick threshold; the file
# stores pA under this sigmoid to mirror the historical schema.
SIGMOID_A = 1.609621
SIGMOID_B = -0.18753374136521064
# Live App.js sigmoid — documented for context only, NOT applied here.
LIVE_SIGMOID_A = 2.0
LIVE_SIGMOID_B = 0.0

# ── Frozen low-sample blend targets — BASELINE_NOTES §4, App.js fallback consts ──
CONST_MEANS = {'asl': 3.5, 'asp': 0.44, 'atl': 1.0, 'atp': 0.35, 'asa': 0.25}

# ── LOCKED definition (recoverable core; confirmed by self-verification) ─────────
#   units='per_fight'  : post-cutoff CSV columns are already per-minute — consume as-is
#   hr_units='inches'  : Height_cms / Reach_cms divided by 2.54
#   ko_doc             : resolved by self-verification at runtime
LOCKED = {'units': 'per_fight', 'hr_units': 'inches', 'ko_doc': None}

# ── Weights (App.js MODEL.W_NO) and derived pool weights ─────────────────────────
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
G_SCALE    = (G_POOL - ATD_W) / G_POOL                     # 0.793043
TD_OFF_W   = W['avg_td_dif'] * G_SCALE
TD_DEF_W   = TDP_W * G_SCALE
SUB_ATT_W  = W['avg_sub_att_dif'] * G_SCALE
E_POOL     = W['total_round_dif'] + W['total_title_bout_dif']
FIGHT_CT_W = E_POOL * 0.58
# deep-round weight (E_POOL * 0.42) carries a zeroed feature — omitted.

# ── Scales (App.js MODEL.SCALES) ─────────────────────────────────────────────────
S = {
    'sig_str': 15.8, 'acc': 0.1, 'td': 1.4, 'td_pct': 0.23, 'sub_att': 0.7,
    'reach': 10.8, 'height': 9.1, 'age': 4.3, 'win_streak': 1.4,
    'lose_streak': 1.0, 'win': 4.4, 'loss': 2.7, 'ko': 2.0, 'sub': 1.4,
    'ufc_count': 8,
}


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


def side_stats(row, prefix, ko_doc):
    """Raw point-in-time pre-fight stats for one corner ('R'/'B') under LOCKED units."""
    g = lambda col, d=0.0: fnum(row.get(f'{prefix}_{col}'), d)
    rounds    = g('total_rounds_fought')
    total_min = rounds * 5.0
    wins      = g('wins')
    losses    = g('losses')
    n_fights  = wins + losses
    # units == 'per_fight' (locked): post-cutoff columns already per-minute, consume as-is.
    asl = g('avg_SIG_STR_landed')
    atl = g('avg_TD_landed')
    asa = g('avg_SUB_ATT')
    ko = g('win_by_KO/TKO')
    if ko_doc:
        ko += g('win_by_TKO_Doctor_Stoppage')
    hr_div = 2.54  # hr_units == 'inches' (locked)
    return {
        'asl': asl, 'asp': g('avg_SIG_STR_pct'), 'atl': atl,
        'atp': g('avg_TD_pct'), 'asa': asa,
        'total_min': total_min, 'wins': wins, 'losses': losses,
        'n_fights': n_fights, 'ko': ko, 'sub': g('win_by_Submission'),
        'win_streak': g('current_win_streak'), 'lose_streak': g('current_lose_streak'),
        'height': g('Height_cms') / hr_div, 'reach': g('Reach_cms') / hr_div,
        'age': fnum(row.get(f'{prefix}_age'), 30.0),
    }


def compute_composite(row, ko_doc):
    """Base composite with frozen CONST_MEANS as the sampleBlend target."""
    A = side_stats(row, 'R', ko_doc)
    B = side_stats(row, 'B', ko_doc)
    mean = CONST_MEANS

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
    # atd_dif = 0 (constant 0.60 both sides) — weight carved from grappling pool.
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
    # deep_round_dif = 0 · elo_dif = 0 · layoff_dif = 0 · cardio_dif = 0
    return striking + grappling + physical + form + experience


# ── Data loading ──────────────────────────────────────────────────────────────
def load_rows():
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        rows = [r for r in csv.DictReader(f)]
    rows.sort(key=lambda r: r['date'])
    return rows


def both_ge_75min(row):
    rr = fnum(row.get('R_total_rounds_fought'))
    br = fnum(row.get('B_total_rounds_fought'))
    return (rr * 5.0) >= 75.0 and (br * 5.0) >= 75.0


# ── Self-verification — reproduce >=75-min subset of ORIGINAL composites ─────────
def self_verify(scored, stored_by_key):
    """Lock ko_doc by reproducing the >=75-min subset bit-exactly. Returns ko_doc or None."""
    subset = [r for r in scored if both_ge_75min(r)]
    print(f"  >=75-min subset (both fighters >=15 rounds): {len(subset)} fights")
    best = None
    for ko_doc in (False, True):
        diffs = []
        for r in subset:
            key = (r['date'], r['R_fighter'].strip(), r['B_fighter'].strip())
            f = stored_by_key.get(key)
            if not f:
                continue
            diffs.append(abs(compute_composite(r, ko_doc) - f['composite']))
        mx = max(diffs) if diffs else float('inf')
        n = len(diffs)
        print(f"    ko_doc={str(ko_doc):5}  matched={n:4d}  max|diff|={mx:.3e}")
        if mx <= 1e-6 and (best is None or n > best[1]):
            best = (ko_doc, n, mx)
    if best is None:
        return None, subset
    return best[0], subset


# ── Generation ──────────────────────────────────────────────────────────────────
def generate(rows, ko_doc):
    excluded_cutoff = 0
    excluded_nondecisive = 0
    out = []
    for r in rows:
        if r['date'] < CUTOFF:
            excluded_cutoff += 1
            continue
        if r['Winner'].strip() not in ('Red', 'Blue'):
            excluded_nondecisive += 1
            continue
        # Hard assertion: no pre-cutoff row may ever be scored.
        assert r['date'] >= CUTOFF, f"PRE-CUTOFF ROW LEAKED INTO SCORING: {r['date']}"
        comp = compute_composite(r, ko_doc)
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
    return out, excluded_cutoff, excluded_nondecisive


def main():
    print("Loading ufc-master.csv …")
    rows = load_rows()
    scored = [r for r in rows if r['date'] >= CUTOFF and r['Winner'].strip() in ('Red', 'Blue')]
    print(f"  Total rows: {len(rows)}  ·  post-cutoff decisive: {len(scored)}")

    # Self-verification uses the immutable ORIGINAL anchor if present, else the
    # current stored file (true original on first run, before we overwrite it).
    anchor = ORIGINAL_JSON if ORIGINAL_JSON.exists() else STORED_JSON
    print(f"\nLoading self-verification anchor: {anchor.name} …")
    stored = json.loads(anchor.read_text())
    stored_by_key = {(f['date'], f['red'], f['blue']): f for f in stored['fights']}
    print(f"  Anchor fights: {len(stored_by_key)}")

    print("\nSELF-VERIFICATION — reproduce >=75-min subset of original composites (<=1e-6):")
    ko_doc, subset = self_verify(scored, stored_by_key)
    if ko_doc is None:
        print("\n*** SELF-VERIFICATION FAILED — no ko_doc reproduces the >=75-min core. ***")
        print("*** STOP. Not emitting a baseline from a broken generator. ***")
        return 1
    LOCKED['ko_doc'] = ko_doc
    print(f"\n  ✓ SELF-VERIFICATION PASSED — locked definition: {LOCKED}")

    # Snapshot the immutable original anchor once, before overwriting the output.
    if not ORIGINAL_JSON.exists():
        shutil.copyfile(STORED_JSON, ORIGINAL_JSON)
        print(f"  Snapshotted original → {ORIGINAL_JSON.name} (immutable self-verify anchor)")

    print("\nGenerating full baseline with locked definition + frozen CONST_MEANS …")
    fights, exc_cutoff, exc_nondec = generate(rows, ko_doc)
    print(f"  Scored fights written     : {len(fights)}")
    print(f"  Excluded (date < {CUTOFF}): {exc_cutoff}")
    print(f"  Excluded (non-decisive)   : {exc_nondec}")

    correct = sum(1 for f in fights if f['correct'])
    acc = correct / len(fights) if fights else 0.0
    print(f"\n  Base accuracy (no ELO/SOS/Mom, harness sigmoid): "
          f"{correct}/{len(fights)} = {acc*100:.2f}%")

    OUTPUT_JSON.write_text(json.dumps({
        'meta': {
            'generated_by': 'generate_baseline.py',
            'supersedes': 'lost original generator (see BASELINE_NOTES.md)',
            'cutoff': CUTOFF,
            'locked_definition': LOCKED,
            'blend_target': 'frozen CONST_MEANS (App.js fallback consts)',
            'const_means': CONST_MEANS,
            'self_verify_subset_ge75min': len(subset),
            'excluded_pre_cutoff': exc_cutoff,
            'excluded_non_decisive': exc_nondec,
            'total_scored': len(fights),
            'correct_base': correct,
            'accuracy_base': round(acc, 6),
            'harness_sigmoid': {'a': SIGMOID_A, 'b': SIGMOID_B,
                                'note': 'backtest_elo.py + backtest_combo_v2.py apply THIS sigmoid'},
            'live_app_sigmoid': {'a': LIVE_SIGMOID_A, 'b': LIVE_SIGMOID_B,
                                 'note': 'App.js live uses symmetric a=2.0,b=0 — NOT applied in this chain'},
        },
        'fights': fights,
    }, indent=2))
    print(f"\nSaved → {OUTPUT_JSON}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
