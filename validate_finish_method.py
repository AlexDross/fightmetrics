"""
Validate the App.js Projected Finish Method formula against actual UFC outcomes.
Limitation: KD_PER_MIN is not available in this CSV, so it is set to 0 for all fights.
This likely underestimates rawKO for heavy-handed strikers.
"""

import pandas as pd
import numpy as np

CSV = '/Users/alexdrossman/Downloads/UltimateUFCDatabase/ufc-master.csv'

# ── Load & filter ─────────────────────────────────────────────────────────────
df = pd.read_csv(CSV, low_memory=False)
df['date'] = pd.to_datetime(df['date'], errors='coerce')

# Keep only valid finish buckets
valid = {'KO/TKO', 'SUB', 'U-DEC', 'S-DEC', 'M-DEC'}
df = df[df['finish'].isin(valid)].copy()

# Date filter and minimum wins filter
df = df[df['date'] >= '2019-06-22']
df = df[(df['R_wins'] >= 3) & (df['B_wins'] >= 3)]

print(f"Rows after filters: {len(df)}")

# ── Actual outcome labels ─────────────────────────────────────────────────────
def actual_bucket(finish):
    if finish == 'KO/TKO':
        return 'KO'
    elif finish == 'SUB':
        return 'SUB'
    else:
        return 'DEC'

df['actual'] = df['finish'].apply(actual_bucket)

# ── Point-in-time fighter stats (pre-fight career totals) ─────────────────────
# KO_WIN_PCT
df['R_ko_win_pct'] = np.where(df['R_wins'] > 0, df['R_win_by_KO/TKO'] / df['R_wins'], 0)
df['B_ko_win_pct'] = np.where(df['B_wins'] > 0, df['B_win_by_KO/TKO'] / df['B_wins'], 0)

# SUB_WIN_PCT
df['R_sub_win_pct'] = np.where(df['R_wins'] > 0, df['R_win_by_Submission'] / df['R_wins'], 0)
df['B_sub_win_pct'] = np.where(df['B_wins'] > 0, df['B_win_by_Submission'] / df['B_wins'], 0)

# FINISH_RATE (includes doctor stoppages)
df['R_finish_rate'] = np.where(
    df['R_wins'] > 0,
    (df['R_win_by_KO/TKO'] + df['R_win_by_Submission'] + df['R_win_by_TKO_Doctor_Stoppage']) / df['R_wins'],
    0
)
df['B_finish_rate'] = np.where(
    df['B_wins'] > 0,
    (df['B_win_by_KO/TKO'] + df['B_win_by_Submission'] + df['B_win_by_TKO_Doctor_Stoppage']) / df['B_wins'],
    0
)

# SUB_THREAT_RATE = R_avg_SUB_ATT (per 15 min, already scaled per App.js expectation)
df['R_sub_threat'] = df['R_avg_SUB_ATT'].fillna(0)
df['B_sub_threat'] = df['B_avg_SUB_ATT'].fillna(0)

# KD_PER_MIN: not in CSV — set to 0 (see limitation note at top)
df['R_kd_per_min'] = 0.0
df['B_kd_per_min'] = 0.0

# ── Apply formula variants ────────────────────────────────────────────────────
# App.js uses the App-level FINISH_RATE which is stored as a percentage (0-100).
# The CSV columns produce values in [0,1], so multiply by 100 to match.
avg_ko_win_pct  = ((df['R_ko_win_pct']  + df['B_ko_win_pct'])  / 2) * 100
avg_sub_win_pct = ((df['R_sub_win_pct'] + df['B_sub_win_pct']) / 2) * 100
avg_finish      = ((df['R_finish_rate'] + df['B_finish_rate'])  / 2) * 100
avg_kd_rate     = (df['R_kd_per_min']  + df['B_kd_per_min'])   / 2
avg_sub_threat  = (df['R_sub_threat']  + df['B_sub_threat'])    / 2

def compute_probs(sub_threat_weight, sub_win_pct_weight):
    raw_ko  = np.minimum(avg_ko_win_pct * 0.55 + avg_kd_rate * 700 + avg_finish * 0.18, 60)
    raw_sub = np.minimum(avg_sub_win_pct * sub_win_pct_weight + avg_sub_threat * sub_threat_weight + avg_finish * 0.12, 60)
    raw_dec = np.maximum(100 - raw_ko - raw_sub, 18)
    total   = raw_ko + raw_sub + raw_dec
    return raw_ko / total, raw_sub / total, raw_dec / total

# Use current (w=8, swp=0.75) as primary for downstream calibration/confusion sections
p_ko_cur, p_sub_cur, p_dec_cur = compute_probs(8, 0.75)
df['p_ko']  = p_ko_cur
df['p_sub'] = p_sub_cur
df['p_dec'] = p_dec_cur

# ── One-hot actual ────────────────────────────────────────────────────────────
df['y_ko']  = (df['actual'] == 'KO').astype(float)
df['y_sub'] = (df['actual'] == 'SUB').astype(float)
df['y_dec'] = (df['actual'] == 'DEC').astype(float)

# ── 1. Multiclass Brier Score ─────────────────────────────────────────────────
def brier_multi(y_ko, y_sub, y_dec, p_ko, p_sub, p_dec):
    return np.mean(
        (p_ko - y_ko)**2 + (p_sub - y_sub)**2 + (p_dec - y_dec)**2
    )

base_ko  = df['y_ko'].mean()
base_sub = df['y_sub'].mean()
base_dec = df['y_dec'].mean()
brier_base = brier_multi(df['y_ko'], df['y_sub'], df['y_dec'],
                         np.full(len(df), base_ko),
                         np.full(len(df), base_sub),
                         np.full(len(df), base_dec))

sub_threat_weights  = [4, 3, 2]
sub_win_pct_weights = [0.75, 0.50, 0.40]

# ── 1. Grid sweep ─────────────────────────────────────────────────────────────
print("\n── 1. Grid Sweep: Brier Score ────────────────────────────────────")
header = f"  {'':18}" + "".join(f"  swp={w:<4}" for w in sub_win_pct_weights)
print(header)
results = {}
for stw in sub_threat_weights:
    row = f"  sub_threat_w={stw}  "
    for swp in sub_win_pct_weights:
        p_ko, p_sub, p_dec = compute_probs(stw, swp)
        b = brier_multi(df['y_ko'], df['y_sub'], df['y_dec'], p_ko, p_sub, p_dec)
        results[(stw, swp)] = (b, p_sub.mean())
        row += f"  {b:.4f}  "
    print(row)

print(f"\n  Base-rate: {brier_base:.4f}")

print("\n── 1b. Grid Sweep: SUB diff (pred − actual {:.3f}) ─────────────".format(base_sub))
print(header)
for stw in sub_threat_weights:
    row = f"  sub_threat_w={stw}  "
    for swp in sub_win_pct_weights:
        _, sub_pred = results[(stw, swp)]
        diff = sub_pred - base_sub
        row += f"  {diff:+.3f}   "
    print(row)

# Best combination by Brier
best_key = min(results, key=lambda k: results[k][0])
best_brier, best_sub_pred = results[best_key]
best_stw, best_swp = best_key
print(f"\n  Best: sub_threat_w={best_stw}, sub_win_pct_w={best_swp}  →  Brier={best_brier:.4f}  (vs base-rate {brier_base:.4f}, Δ={best_brier-brier_base:+.4f})")

# ── 2. Per-class calibration for best combination ─────────────────────────────
p_ko_b, p_sub_b, p_dec_b = compute_probs(best_stw, best_swp)
print(f"\n── 2. Per-class Calibration — best combo (stw={best_stw}, swp={best_swp}) ──")
print(f"  {'Class':<8}  {'Pred mean':>10}  {'Actual rate':>12}  {'Diff':>8}")
for cls, p_arr, ycol in [('KO', p_ko_b, 'y_ko'), ('SUB', p_sub_b, 'y_sub'), ('DEC', p_dec_b, 'y_dec')]:
    pred = p_arr.mean()
    act  = df[ycol].mean()
    print(f"  {cls:<8}  {pred:>10.3f}  {act:>12.3f}  {pred-act:>+8.3f}")

# Also show current formula calibration for comparison
print(f"\n── 2b. Per-class Calibration — current (stw=8, swp=0.75) ────────")
print(f"  {'Class':<8}  {'Pred mean':>10}  {'Actual rate':>12}  {'Diff':>8}")
for cls, pcol, ycol in [('KO', 'p_ko', 'y_ko'), ('SUB', 'p_sub', 'y_sub'), ('DEC', 'p_dec', 'y_dec')]:
    pred = df[pcol].mean()
    act  = df[ycol].mean()
    print(f"  {cls:<8}  {pred:>10.3f}  {act:>12.3f}  {pred-act:>+8.3f}")

brier_formula = brier_multi(df['y_ko'], df['y_sub'], df['y_dec'], df['p_ko'], df['p_sub'], df['p_dec'])

# ── 3. Confusion matrix (predicted bucket = argmax) ──────────────────────────
df['pred'] = df[['p_ko', 'p_sub', 'p_dec']].idxmax(axis=1).map(
    {'p_ko': 'KO', 'p_sub': 'SUB', 'p_dec': 'DEC'}
)

print("\n── 3. Confusion Matrix (predicted → actual) ──────────────────────")
cm = pd.crosstab(df['pred'], df['actual'], rownames=['Predicted'], colnames=['Actual'])
print(cm.to_string())

# ── 4. By weight class: predicted vs actual KO rate (current only) ───────────
print("\n── 4. KO Rate by Weight Class — current (stw=8, swp=0.75) ───────")
wc = df.groupby('weight_class').agg(
    n=('actual', 'count'),
    actual_ko=('y_ko', 'mean'),
    pred_ko=('p_ko', 'mean'),
).sort_values('actual_ko', ascending=False)
wc['diff'] = wc['pred_ko'] - wc['actual_ko']
print(wc[['n', 'actual_ko', 'pred_ko', 'diff']].to_string(float_format='{:.3f}'.format))

# ── 4b. Weight class breakdown: best vs current ───────────────────────────────
df['p_ko_best']  = p_ko_b
df['p_sub_best'] = p_sub_b

wc2 = df.groupby('weight_class').agg(
    n=('actual', 'count'),
    actual_ko=('y_ko', 'mean'),
    actual_sub=('y_sub', 'mean'),
    cur_ko=('p_ko', 'mean'),
    cur_sub=('p_sub', 'mean'),
    best_ko=('p_ko_best', 'mean'),
    best_sub=('p_sub_best', 'mean'),
).sort_values('actual_ko', ascending=False)

wc2['ko_diff_cur']  = wc2['cur_ko']  - wc2['actual_ko']
wc2['ko_diff_best'] = wc2['best_ko'] - wc2['actual_ko']
wc2['sub_diff_cur']  = wc2['cur_sub']  - wc2['actual_sub']
wc2['sub_diff_best'] = wc2['best_sub'] - wc2['actual_sub']

fmt = '{:.3f}'.format
print(f"\n── 4b. Weight Class Breakdown — best (stw=4, swp=0.40) vs current ──")
print(f"  {'Weight Class':<24}  {'n':>4}  {'act KO':>7}  {'cur KO':>7}  {'Δcur':>6}  {'best KO':>8}  {'Δbest':>6}  {'act SUB':>8}  {'cur SUB':>8}  {'Δcur':>6}  {'best SUB':>9}  {'Δbest':>6}")
for wc_name, row in wc2.iterrows():
    print(
        f"  {wc_name:<24}  {int(row['n']):>4}  "
        f"{row['actual_ko']:>7.3f}  {row['cur_ko']:>7.3f}  {row['ko_diff_cur']:>+6.3f}  "
        f"{row['best_ko']:>8.3f}  {row['ko_diff_best']:>+6.3f}  "
        f"{row['actual_sub']:>8.3f}  {row['cur_sub']:>8.3f}  {row['sub_diff_cur']:>+6.3f}  "
        f"{row['best_sub']:>9.3f}  {row['sub_diff_best']:>+6.3f}"
    )

# ── 5. Summary ────────────────────────────────────────────────────────────────
print("\n── 5. Summary ────────────────────────────────────────────────────")
print(f"  n = {len(df)} fights")
print(f"  Actual rates  — KO: {base_ko:.1%}  SUB: {base_sub:.1%}  DEC: {base_dec:.1%}")
print(f"  Predicted avg — KO: {df['p_ko'].mean():.1%}  SUB: {df['p_sub'].mean():.1%}  DEC: {df['p_dec'].mean():.1%}")
print(f"  KD_PER_MIN set to 0 for all fights (not in CSV) — KO scores are underestimated")
if brier_formula >= brier_base:
    print("  ⚠ Base-rate predictor beats the formula. The formula adds no predictive value over priors.")
else:
    print(f"  ✓ Formula improves on base-rate by {brier_base - brier_formula:.4f} Brier points.")
