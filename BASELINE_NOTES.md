# Baseline Notes — Base-Composite Reconstruction (2026-06-11)

Status notes from the attempt to recreate the missing generator behind
`backtest_results.json`. Read this before any weight-refitting, sigmoid
recalibration, or model-fitting work that depends on the backtest pipeline.

## 1. The original generator is gone and unrecoverable

The script that produced `backtest_results.json` (3,380 point-in-time fights,
post-2019-06-22 cutoff, from `ufc-master.csv`) no longer exists. It is not in
the repo, not in the Trash, not in shell history, and not anywhere on disk
(searched 2026-06-11). It ran locally on 2026-06-07 ~23:03 against the data
snapshot preserved in `/tmp/fm_data.json` (extracted 22:33 the same night) and
was deleted or never saved. **The script that produced the validated 61.1%
baseline no longer exists.**

## 2. What IS reproducible — the verified core

The reconstruction (`generate_base_composites.py`) reproduces the stored
composites **bit-exactly (≤1e-6) for every fight where both fighters have
≥75 minutes of recorded history** — 1,004 of 3,380 fights, with zero
exceptions in either direction. This verifies, character-for-character:

- all 21 `W_NO` weights and the derived pool weights
  (grappling carve-out scale 0.793043, experience split 0.58/0.42,
  summed R+B accuracy and TD-defense weights),
- every `SCALES` constant, the ±2 clamps, all reversed-sign conventions,
- heights/reaches in inches (cms ÷ 2.54), point-in-time age,
- the neutralized features (atd / cardio / layoff / deep-rounds / elo = 0
  in the base composite; ELO is patched downstream by `backtest_elo.py`),
- the cutoff and decisive-fight filters (3,380 scored, 8 excluded),
- the sigmoid mapping (stored `pA` values reproduce from stored composites).

Also verified: the CSV's pre-fight career columns are genuinely pre-fight
(no current-career leakage in the raw stats), and the base composite contains
no age-decay term and no odds input.

## 3. What is NOT reproducible — the low-sample blend rule

All 2,375 non-matching fights involve at least one fighter under 75
column-minutes. The original's sampleBlend treatment for those fighters
(trust weight and/or blend target) could not be identified. 50+ candidate
mechanisms were falsified by per-fight diff against the stored composites:
constant / per-division / global / rolling CSV means under every zero- and
NaN-handling variant, live fightersData division means (from the exact
`/tmp/fm_data.json` vintage), the fighter's own live stats, opponent-targeted
and zero-targeted blends, dif-shrinking, alternative trust functions
(n-fights, walk-accumulated actual minutes, max/fallback combinations),
per-fighter ffill/bfill repair, decay-placement variants, and
fallback-constant permutation bugs.

Decisive negative evidence: the implied per-fight blend weights span
0.19–1.06 with no functional relationship to minutes or fight count —
values **above 1.0** (impossible for any convex blend toward a fixed target)
and solved "division averages" containing ATL = 0.0 (impossible for any
average of positive values). The original consumed an untraced per-fighter
quantity that was never cleanly specified anywhere.

## 4. Consequence for future work — re-baseline, do not chase 61.1%

Any weight-refitting MUST begin by re-baselining: regenerate the base
composites with a clean, App.js-faithful low-sample rule
(`sampleBlend(stat, divisionMean, totalMin)` with trust `min(1, totalMin/75)`,
explicitly specified division means), run the full chain
(base → ELO patch → SOS@0.10 + Mom@0.03 → symmetric sigmoid), and accept the
resulting accuracy as the new validated baseline. **Do NOT attempt to
reproduce the 61.1% number.** It may come in lower; the new figure is the
honest, reproducible one going forward. The stored `backtest_results.json` /
`backtest_results_elo.json` remain valid as the *record* of the old baseline
but cannot be regenerated.

## 5. Critical data gotcha — the units switch at the cutoff

The `ufc-master.csv` avg-stat columns (`R_/B_avg_SIG_STR_landed`,
`avg_TD_landed`, `avg_SUB_ATT`) **switch units at the 2019-06-22 cutoff**:
per-fight career totals before (~30–80), per-minute career rates after
(~3–6). This is why the cutoff exists. Any reconstruction, refit, or new
feature that consumes these columns across the boundary without handling the
switch is silently corrupted. Related gotchas: `total_rounds_fought` is `'0'`
for some non-debutants (e.g., Tecia Torres 2020-12-12 with 8 wins), and at
least one fighter name carries a leading space (`" Jun Yong Park"`).

## 6. Lesson

The generator that produces any validated baseline must be committed to the
repo alongside its output. A baseline whose generator lives outside version
control is one `rm` away from being a number nobody can ever check again —
which is exactly what happened here.
