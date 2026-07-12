# Prediction algorithm upgrade experiment

Chronological design:
- Training: 2019-06-22 through 2023-12-16 (2239 fights)
- Model selection/calibration: 2024-01-13 through 2024-12-14 (513 fights)
- Untouched final test: 2025-01-11 through 2026-03-28 (628 fights)
- Complete-odds comparison subset: 613 fights (15 final-test rows lacked usable odds).
- Fighter-slot symmetry is enforced by training on each matchup in both orientations.
- No production code or source data was changed.

Selected logistic C: 0.1. Selected XGBoost parameters: `{'n_estimators': 250, 'max_depth': 2, 'learning_rate': 0.03, 'min_child_weight': 20}`.

## Untouched 2025–2026 test results

All predictors below are scored on the same complete-odds subset.

| Predictor | Accuracy | Brier | Log loss | ROC AUC |
|---|---:|---:|---:|---:|
| Transparent composite + ELO | 65.25% | 0.2210 | 0.6332 | 0.7028 |
| Learned logistic (no odds) | 70.15% | 0.2017 | 0.5889 | 0.7591 |
| Shallow XGBoost (no odds) | 69.17% | 0.1960 | 0.5745 | 0.7668 |
| No-vig market | 69.49% | 0.1965 | 0.5759 | 0.7642 |
| Market + learned stats | 71.13% | 0.1872 | 0.5525 | 0.7859 |

No-odds models on the full untouched test set:

| Predictor | Accuracy | Brier | Log loss | ROC AUC |
|---|---:|---:|---:|---:|
| Transparent composite + ELO | 64.97% | 0.2217 | 0.6345 | 0.6986 |
| Learned logistic (no odds) | 69.75% | 0.2031 | 0.5918 | 0.7533 |
| Shallow XGBoost (no odds) | 68.79% | 0.1977 | 0.5783 | 0.7614 |

Best no-odds model by test log loss: **Shallow XGBoost (no odds)**. Its log-loss difference versus the transparent composite is -0.0587; event-date bootstrap 95% interval [-0.0769, -0.0404].

## Strongest individual test-period correlations

| Signal (positive favors Red) | Point-biserial r | p-value | N |
|---|---:|---:|---:|
| market_logit | +0.458 | 0.0000 | 613 |
| sig_str_accuracy | +0.355 | 0.0000 | 628 |
| transparent_composite | +0.335 | 0.0000 | 628 |
| younger | +0.304 | 0.0000 | 628 |
| losses | +0.267 | 0.0000 | 628 |
| sig_str_landed | +0.253 | 0.0000 | 628 |
| td_accuracy | +0.235 | 0.0000 | 628 |
| rounds | -0.225 | 0.0000 | 628 |
| lose_streak | +0.200 | 0.0000 | 628 |
| td_landed | +0.200 | 0.0000 | 628 |
| win_streak | +0.163 | 0.0000 | 628 |
| elo | +0.153 | 0.0001 | 628 |

## Learned no-odds logistic weights

Coefficients are standardized and signed; unlike feature importance, they directly encode direction and magnitude.

| Feature | Standardized coefficient |
|---|---:|
| younger | +0.274 |
| elo | +0.246 |
| sig_str_landed | +0.243 |
| td_landed | +0.224 |
| wins | -0.203 |
| sig_str_accuracy | +0.193 |
| win_streak | +0.167 |
| sub_attempts | +0.155 |
| losses | -0.153 |
| rounds | +0.105 |
| longest_streak | +0.096 |
| title_bouts | +0.096 |
| sub_wins | -0.090 |
| reach | +0.073 |
| ko_wins | -0.065 |
| height | +0.060 |
| td_accuracy | +0.049 |
| lose_streak | +0.008 |

## Interpretation

- Hybrid coefficient on market logit: +0.845.
- Hybrid coefficient on learned-stat-model logit: +0.697.
- A positive stats coefficient means the learned model adds information after the market; a coefficient near zero means the market subsumes it.
- The transparent model's biggest structural limitation is using unsigned importance-derived weights in a manually assembled linear score. A fitted regularized logistic model is the cleanest transparent replacement.
- XGBoost should only replace the linear model if its advantage survives the untouched test and repeated rolling-origin tests; otherwise its flexibility is mostly an overfitting invitation wearing a clever hat.

## Rolling calendar-year robustness

The same selected structures were replayed with each prior calendar year used for calibration and the following year held out. Because the configuration was selected using 2024, the earlier rows are robustness checks rather than pristine model-selection evidence.

| Test year | N | Composite acc / LL | Logistic acc / LL | XGB acc / LL | Market acc / LL | Hybrid acc / LL |
|---|---:|---:|---:|---:|---:|---:|
| 2022 | 487 | 60.2% / 0.658 | 63.0% / 0.641 | 66.3% / 0.623 | 68.4% / 0.602 | 68.2% / 0.595 |
| 2023 | 416 | 62.3% / 0.651 | 67.1% / 0.614 | 66.8% / 0.600 | 70.0% / 0.586 | 72.4% / 0.569 |
| 2024 | 383 | 61.6% / 0.651 | 67.9% / 0.612 | 65.0% / 0.622 | 70.2% / 0.589 | 72.6% / 0.577 |
| 2025 | 499 | 64.9% / 0.637 | 69.1% / 0.594 | 67.5% / 0.586 | 67.9% / 0.589 | 69.9% / 0.564 |
| 2026 | 114 | 66.7% / 0.618 | 75.4% / 0.552 | 77.2% / 0.505 | 76.3% / 0.520 | 78.1% / 0.501 |

The learned logistic model beats the transparent composite in every yearly holdout shown. The hybrid beats or closely tracks the market every year, which is the strongest evidence here that the statistical features contain useful information not fully reflected in the line.

## Implementation audit

- `src/App.js` defines and calls its own `computeMatchupEdges` implementation.
- `src/modelModule.js` is not imported by `App.js` or `index.js`.
- Therefore, the June 23 weight-ablation commits made only in `src/modelModule.js` do not change live app predictions. This duplicate dead model should be removed or made the single imported source of truth before any further tuning.

## Recommended architecture

1. Make a fitted, orientation-symmetric regularized logistic model the no-odds probability engine, exporting its imputation values, scales, and signed coefficients.
2. Keep the market outside that engine for value detection. Optionally display a separate market-blended forecast for pure winner prediction.
3. Preserve ELO and the strongest stable differentials; remove or shrink features whose learned coefficient is unstable across temporal folds.
4. Train with rolling-origin folds and optimize Brier/log loss, not accuracy alone.
5. Save model version, feature snapshot, component scores, and timestamp with every pick.
