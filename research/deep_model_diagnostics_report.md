# Deep model diagnostics

## Executive diagnosis

The current transparent composite contains real predictive signal, but its main bottleneck is architectural rather than a missing magic statistic. It combines correlated inputs with hand-assigned positive importance weights, adds several heuristic adjustments, and then calibrates the sum globally. That approach cannot reliably learn conditional direction, redundancy, or interactions.

The strongest tested path is a two-model architecture:

1. An independent, orientation-symmetric statistics model for fair probability and betting-edge detection.
2. A separately labeled market-plus-statistics model for maximum outright winner accuracy.

## Chronological 2025–2026 holdout

Training ends in 2023, model selection/calibration uses 2024, and the final test contains 613 fights with complete odds.

| Predictor | Accuracy | Brier | Log loss | AUC | ECE |
|---|---:|---:|---:|---:|---:|
| Transparent composite | 65.25% | 0.2210 | 0.6332 | 0.7028 | 0.0488 |
| Learned logistic | 70.15% | 0.2017 | 0.5889 | 0.7591 | 0.0752 |
| Shallow XGBoost | 69.17% | 0.1960 | 0.5745 | 0.7668 | 0.0412 |
| No-vig market | 69.49% | 0.1965 | 0.5759 | 0.7642 | 0.0424 |
| Market + learned stats | 71.13% | 0.1872 | 0.5525 | 0.7859 | 0.0418 |

Hybrid minus market log-loss difference: -0.0234; event-date bootstrap 95% interval [-0.0348, -0.0117].

XGBoost minus market log-loss difference: -0.0014; 95% interval [-0.0248, +0.0213].

The hybrid improvement is the strongest result because it asks whether the statistics add information after accounting for the market. The independent XGBoost model is approximately market-level on this holdout, not conclusively better.

## Where the current composite loses accuracy

| Segment | N | Composite acc / LL | Logistic acc / LL | XGB acc / LL | Market acc / LL | Hybrid acc / LL |
|---|---:|---:|---:|---:|---:|---:|
| All complete-odds fights | 613 | 65.3% / 0.633 | 70.1% / 0.589 | 69.2% / 0.575 | 69.5% / 0.576 | 71.1% / 0.552 |
| Either fighter ≤2 prior UFC fights | 226 | 66.8% / 0.626 | 70.4% / 0.556 | 69.5% / 0.541 | 67.7% / 0.583 | 70.4% / 0.540 |
| Either fighter ≤5 prior UFC fights | 396 | 67.2% / 0.627 | 69.9% / 0.581 | 67.4% / 0.573 | 70.5% / 0.570 | 72.0% / 0.544 |
| Both fighters >5 prior UFC fights | 217 | 61.8% / 0.645 | 70.5% / 0.604 | 72.4% / 0.577 | 67.7% / 0.586 | 69.6% / 0.569 |
| Age gap ≥6 years | 203 | 70.0% / 0.599 | 75.9% / 0.540 | 73.9% / 0.511 | 72.4% / 0.551 | 72.9% / 0.517 |
| Near pick'em market (<55%) | 68 | 55.9% / 0.680 | 60.3% / 0.657 | 64.7% / 0.679 | 50.0% / 0.697 | 55.9% / 0.663 |
| Moderate favorite (55–70%) | 304 | 56.9% / 0.680 | 63.2% / 0.649 | 61.5% / 0.645 | 62.5% / 0.661 | 64.5% / 0.645 |
| Strong favorite (≥70%) | 241 | 78.4% / 0.561 | 81.7% / 0.493 | 80.1% / 0.456 | 83.8% / 0.434 | 83.8% / 0.404 |
| Composite agrees with market | 435 | 74.5% / 0.602 | 73.8% / 0.563 | 72.4% / 0.544 | 74.5% / 0.533 | 73.3% / 0.515 |
| Composite disagrees with market | 178 | 42.7% / 0.709 | 61.2% / 0.653 | 61.2% / 0.649 | 57.3% / 0.681 | 65.7% / 0.644 |
| Learned logistic agrees with market | 477 | 68.6% / 0.619 | 75.5% / 0.563 | 73.2% / 0.546 | 75.5% / 0.535 | 75.5% / 0.519 |
| Learned logistic disagrees with market | 136 | 53.7% / 0.682 | 51.5% / 0.678 | 55.1% / 0.675 | 48.5% / 0.721 | 55.9% / 0.669 |

## Feature-group ablation across yearly holdouts

Every listed feature set is refit using only fights before each test year. The table is weighted across 2022–2026 holdouts.

| Feature set | Accuracy | Brier | Log loss | AUC |
|---|---:|---:|---:|---:|
| Full 18 | 66.53% | 0.2136 | 0.6156 | 0.7210 |
| No form/streak | 66.81% | 0.2136 | 0.6158 | 0.7231 |
| No career totals | 66.29% | 0.2140 | 0.6167 | 0.7202 |
| Core 6 | 65.69% | 0.2142 | 0.6174 | 0.7236 |
| No ELO | 66.25% | 0.2153 | 0.6194 | 0.7168 |
| No physical | 65.78% | 0.2172 | 0.6236 | 0.7111 |
| No grappling | 66.06% | 0.2186 | 0.6269 | 0.7049 |
| No striking | 63.18% | 0.2232 | 0.6366 | 0.6837 |

## XGBoost permutation importance on the untouched test

Positive values show how much log loss worsens when a feature is randomly destroyed. Near-zero or negative values are not earning their complexity.

| Feature | Mean log-loss damage | 5–95% range |
|---|---:|---:|
| sig_str_accuracy | +0.0407 | [+0.0307, +0.0509] |
| younger | +0.0239 | [+0.0150, +0.0334] |
| sig_str_landed | +0.0234 | [+0.0152, +0.0341] |
| td_landed | +0.0184 | [+0.0097, +0.0263] |
| elo | +0.0061 | [-0.0016, +0.0129] |
| win_streak | +0.0045 | [-0.0020, +0.0092] |
| sub_attempts | +0.0029 | [-0.0003, +0.0063] |
| title_bouts | +0.0020 | [-0.0015, +0.0054] |
| td_accuracy | +0.0019 | [+0.0008, +0.0032] |
| height | +0.0017 | [-0.0004, +0.0035] |
| sub_wins | +0.0011 | [+0.0004, +0.0019] |
| reach | +0.0010 | [-0.0006, +0.0029] |
| rounds | +0.0003 | [-0.0000, +0.0006] |
| losses | +0.0001 | [+0.0000, +0.0002] |
| ko_wins | +0.0000 | [-0.0000, +0.0001] |
| wins | +0.0000 | [-0.0001, +0.0001] |
| lose_streak | -0.0000 | [-0.0001, +0.0001] |
| longest_streak | -0.0001 | [-0.0002, +0.0001] |

## Direct disagreements with the market

| Independent model | Disagreements | Model correct | Market correct | Model win rate | Binomial p |
|---|---:|---:|---:|---:|---:|
| composite | 178 | 76 | 102 | 42.7% | 0.0606 |
| logistic | 136 | 70 | 66 | 51.5% | 0.7971 |
| xgb | 142 | 70 | 72 | 49.3% | 0.9332 |

## Betting-edge diagnostic on the final holdout

Flat 1u bets use the dataset's stored fight odds. These odds are not verified closing prices, so this is a diagnostic rather than a deployable betting proof.

| Independent model | Minimum no-vig edge | Bets | Profit | ROI (95% event bootstrap) | 2025 ROI | 2026 ROI |
|---|---:|---:|---:|---:|---:|---:|
| Learned logistic | 0pp | 308 | +65.11u | +21.1% [+10.4%, +31.7%] | +23.2% | +13.2% |
| Learned logistic | 2pp | 273 | +59.76u | +21.9% [+9.7%, +33.0%] | +24.0% | +13.6% |
| Learned logistic | 5pp | 217 | +51.11u | +23.6% [+9.5%, +37.8%] | +28.4% | +5.1% |
| Learned logistic | 10pp | 164 | +50.95u | +31.1% [+14.1%, +48.1%] | +34.5% | +14.3% |
| Learned logistic | 15pp | 119 | +52.49u | +44.1% [+20.2%, +67.0%] | +50.6% | +12.1% |
| Shallow XGBoost | 0pp | 367 | +63.08u | +17.2% [+8.7%, +25.6%] | +16.7% | +19.6% |
| Shallow XGBoost | 2pp | 335 | +63.92u | +19.1% [+10.3%, +28.1%] | +18.8% | +20.5% |
| Shallow XGBoost | 5pp | 291 | +53.20u | +18.3% [+7.5%, +29.6%] | +17.7% | +21.0% |
| Shallow XGBoost | 10pp | 227 | +56.04u | +24.7% [+12.1%, +37.3%] | +25.8% | +19.4% |
| Shallow XGBoost | 15pp | 159 | +54.19u | +34.1% [+17.6%, +50.5%] | +35.7% | +22.7% |

## Concrete sources of train-serve skew

1. **Dead duplicate model:** `App.js` owns the live model. The newer weight ablations in `modelModule.js` are not imported and therefore do nothing.
2. **Importance is being used as a coefficient:** XGBoost feature importance does not provide a signed linear effect. The live composite manually assumes direction and additivity.
3. **Correlated career evidence is counted repeatedly:** wins, losses, rounds, KO wins, title bouts, streaks, ELO, and schedule quality overlap heavily.
4. **Heuristics were optimized separately:** age decay, form decay, SOS, momentum, cardio, layoff, and small-sample blending were not jointly fit.
5. **Percentage reliability is crude:** takedown and striking accuracy are blended by total rounds rather than their actual attempt counts.
6. **Missing physical data becomes zero:** height/reach subtraction uses `?? 0`, creating artificial maximum disadvantages.
7. **Division averages drift with the current roster:** prediction output can change when roster data changes even if both selected fighters are unchanged.
8. **Cross-division simulations are unsupported by training:** the historical training set is organized by recorded fight weight class, while the app permits fighters from different divisions without a weight adjustment.
9. **Historical prediction rows lack model/version and feature snapshots:** post-hoc evaluation cannot always reconstruct the exact serving state cleanly.

## Recommended production architecture

### A. Independent fair-probability model

- Start with the regularized logistic model because it is transparent, stable across years, and materially better than the hand-built composite.
- Keep shallow XGBoost as a challenger. Promote it only after repeated frozen prospective tests establish a stable Brier/log-loss advantage.
- Enforce fighter-slot symmetry by construction.
- Fit coefficients jointly with rolling-origin validation.

### B. Outright winner forecast

- Blend market logit and independent-model logit using coefficients learned on a trailing calibration period.
- Label this forecast clearly as market-informed. Do not use it to calculate betting edge.

### C. Data and feature repairs

- Replace missing pairwise values with division priors and missingness flags.
- Use attempt-count Bayesian shrinkage for percentages.
- Remove raw KO and submission win counts unless they add stable incremental value after ELO, rate stats, and fight volume.
- Add actual control-time differential after a clean point-in-time validation.
- Freeze division priors by training version.
- Reject or separately model cross-weight-class matchups.

### D. Evaluation discipline

- Freeze each production version before an event.
- Save model hash, feature vector, data timestamp, probability, and market line.
- Store opening and closing consensus prices for CLV.
- Judge probability quality primarily by log loss, Brier score, calibration, and CLV—not only winner accuracy.

## Brutally honest bottom line

The existing algorithm is not bad; it captures enough signal to beat a naive baseline. But its current design is too hand-tuned and internally redundant to be a credible market-beating probability engine. The data already shows that a small jointly fitted model is substantially better.

The realistic near-term target is:

- Match the market with an independent no-odds model.
- Beat the market on probability quality with a clearly separated hybrid.
- Prove betting value through prospective CLV and frozen out-of-sample bets.

You have evidence for the first two. You do not yet have evidence for the third.
