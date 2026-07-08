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

## §7 — New Authoritative Baseline (June 2026)

**Established:** June 22, 2026  
**Generator:** `generate_baseline.py` (committed alongside this file)  
**Self-verification:** Reproduces the ≥75-min recoverable core bit-exactly (max|diff| = 4.995e-7 ≤ 1e-6 tolerance). Locked definition: `{units: per_fight, hr_units: inches, ko_doc: False}`.

### Baseline numbers (full chain)

| Stage | Correct / 3380 | Accuracy | Δ |
|---|---|---|---|
| Base composite (no ELO/SOS/Mom) | 1954 | 57.81% | — |
| + point-in-time ELO | 2001 | 59.20% | +1.39pp |
| + SOS@0.10 + Mom@0.03 | 2004 | **59.29%** | +0.09pp |

**59.29% is the new authoritative baseline.** The old documented 61.1% is not reproducible — it came from a lost generator with an unrecoverable low-sample blend rule and is no longer referenced for validation purposes.

### Key implementation choices (locked)

- **Division means:** frozen CONST_MEANS `{asl:3.5, asp:0.44, atl:1.0, atp:0.35, asa:0.25}` — not current-roster means. Reproducible and point-in-time-safe.
- **Low-sample blend:** `w = min(1.0, totalMin / 75)` — App.js-faithful, explicitly specified.
- **ATD:** neutralized (both fighters blend to 0.60 → differential = 0). Reflects real data state.
- **Cutoff:** hard-asserted `date >= 2019-06-22` on every scored row. 3,789 pre-cutoff rows excluded.
- **Contamination:** 0 violations across 46,202 tier lookups.

### Sigmoid note

The harness (`backtest_elo.py` + `backtest_combo_v2.py`) uses the old sigmoid `a=1.609621, b=−0.18753`. The live app uses symmetric `a=2.0, b=0`. The baseline number is produced under the harness sigmoid. These are not directly comparable — the live model's actual performance on the same fights would differ slightly near the decision threshold.

---

## §8 — Stage 3 New-Field Test (June 2026)

**Instrument:** `test_new_fields.py` (committed)  
**Method:** Non-destructive in-memory test. Each field reconstructed point-in-time from Greco `ufc_fight_stats.csv` (strictly prior bouts only), blended with `min(1, totalMin/75)`, added as `clamp(diff/S)·W` to `composite_elo` before SOS/Mom + harness sigmoid. No committed file touched.  
**Coverage:** 2,644/3,380 fights (78.2%) had prior Greco data for both fighters.

### Results

| Field | Signal | Best Δ | Verdict |
|---|---|---|---|
| `ctrl` (control time/fight) | Positive at all 4 weights | +0.38pp | Candidate for composite — validate separately |
| `sapm` (strikes absorbed/min) | Monotonic, negligible | +0.12pp | Stored-only |
| `sdef` (striking defense %) | Sign-flips across weights | +0.36pp (unstable) | Stored-only — noise |
| `kd` (knockdowns landed) | Sign-flips across weights | +0.15pp (unstable) | Stored-only — noise |

Combined (all four fields): +0.30pp @ W=0.04 — worse than `ctrl` alone, because `kd` and `sdef` inject noise that partially cancels `ctrl`'s contribution.

### Interpretation

`ctrl` is the only field with a genuine signal — positive at every tested weight is the meaningful indicator, not the magnitude. +0.38pp = 13 fights on 3,380, modest but consistent. Not yet promoted to composite — requires walk-forward validation under the live sigmoid (`a=2.0`) with a principled weight derived from data rather than a grid search.

`sapm` and `sdef` are directionally correct (lower absorption and higher defense should help) but the signal is too weak to survive backtest scrutiny at this sample size. They remain stored in `fightersData.js` for analytics and will be re-tested after the feature set is expanded further.

`kd` behavior suggests the current scale/normalization needs refinement before it carries predictive weight. Real knockdowns (vs the previous KO-wins-per-minute proxy) are stored correctly — the feature just doesn't yet have a validated path into the composite.

### What this unlocks

The re-baseline instrument now exists. Future model changes — feature additions, weight adjustments, sigmoid tuning — can be validated against the 59.29% baseline using `generate_baseline.py` + the unmodified chain. This is the foundation all future model improvement work builds on.

---

# Change Log

## 2026-07-07 — v2 logistic: zero 5 inverted features, fix null defaults, add NO READ threshold

**Changes made (`src/App.js`):**
- **Fix A** — zeroed 5 RED coefficients in `MODEL_V2.coef`: `wins` (−0.203→0), `losses` (−0.153→0), `ko_wins` (−0.065→0), `sub_wins` (−0.090→0), `title_bouts` (0.096→0). These are cumulative-record features with inverted outcome correlations — the same class of signal v1 already zeroed (`win_dif`) after backtest audit.
- **Fix B** — corrected null-default bug in the v2 feature vector (`featsV2` and `featsV2flip`): age `?? 0 → ?? 30`, height `?? 0 → ?? 69`, reach `?? 0 → ?? 70` (division-average defaults). Zero produced nonsensical differentials (e.g. a fabricated 26-year age gap) for fighters with incomplete profiles.
- **Fix C** — added a "NO READ" threshold to the Simulator bet-recommendation banner: when the active model's pick probability is < 0.53, the bet rec displays a muted-gray "NO READ" instead of any recommendation (distinct from "NO BET"). Presentational only — does not change model picks/probabilities.

**Validation** — 42-fight out-of-sample set (`roiData.js` graded fights, `eventDate ≥ 2026-05-23`, excluding UFC Vegas 117 boundary card; `fightersData.js` ends May 16 → zero leakage confirmed, v2 drift = 0). Measured by executing live `computeMatchupEdges` per fight (not `backtest_combo_v2.py`, which tests the ELO/SOS/Momentum composite and is blind to `MODEL_V2`).

| Model | Before | After |
|---|---|---|
| **v1 accuracy** | 24/42 = **57.1%** | 24/42 = **57.1%** (unchanged, as expected — v1 does not use `MODEL_V2`) |
| **v2 accuracy** | 25/42 = **59.5%** | 27/42 = **64.3%** (+2 picks, +4.8pp) |
| v1↔v2 disagreements | 13 (v2 right 7) | 9 (v2 right 6) |

Decision gate (v2 improved AND v1 unchanged) passed → committed.
