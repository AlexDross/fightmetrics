# Betting quality analysis

Generated from `/Users/alexdrossman/fightmetrics/src/roiData.js` on 2026-06-25.

## Executive result

The stored model probabilities do not beat the no-vig market probabilities on proper scoring rules, and larger model-vs-market disagreement does not show reliable incremental predictive value. The evidence supports keeping the betting gate conservative, but it does **not** justify declaring edge permanently inverted or building new unit tiers from this ledger.

## Data audit

- Ledger: 116 resolved rows, including 113 decisive results.
- Primary sample: 106 rows / 103 decisive fights after excluding 10 predictions saved after their event date.
- Same-day timestamps: 50 rows. The ledger stores an event date, not fight start time, so these cannot be independently proven pre-fight.
- Pushes in the primary sample: 3 (NC/DRAW). They count as zero profit and are excluded from Brier/log-loss calculations.
- Unique fights: 116; no duplicate fight rows.
- Closing odds are not stored. `oddsA`, `oddsB`, and `marketOdds` are entry-time prices, so closing-line value cannot be calculated.
- The current `modelModule.js` weights were revised on 2026-06-23. Every graded prediction in this ledger predates that revision, so this is not a test of the current model version.

## Proper scoring rules

| Probability source | N | Accuracy | Brier (lower better) | Log loss (lower better) |
|---|---:|---:|---:|---:|
| Stored model | 103 | 59.2% | 0.2472 | 0.6895 |
| No-vig market | 103 | 65.0% | 0.2293 | 0.6504 |

Model minus market Brier: +0.0178; event-clustered 95% bootstrap interval [-0.0116, +0.0490]. Positive favors the market.

Sensitivity including the 10 known post-event rows: model Brier 0.2486, market Brier 0.2327.

## ROI and profit by stored pick-side edge

| Edge | Bets | Decisive W-L | Win rate (95% Wilson) | Profit (u) | ROI (event-bootstrap 95%) |
|---|---:|---:|---:|---:|---:|
| <0% | 50 | 35-14 | 71.4% [57.6%, 82.2%] | -1.64 | -3.3% [-20.9%, +15.7%] |
| 0–5% | 12 | 4-8 | 33.3% [13.8%, 60.9%] | -5.39 | -44.9% [-86.0%, +9.7%] |
| 5–10% | 9 | 5-3 | 62.5% [30.6%, 86.3%] | +1.45 | +16.1% [-36.4%, +59.2%] |
| 10–20% | 16 | 11-4 | 73.3% [48.0%, 89.1%] | +8.78 | +54.9% [+25.5%, +95.6%] |
| 20–30% | 15 | 5-10 | 33.3% [15.2%, 58.3%] | -1.80 | -12.0% [-81.4%, +73.1%] |
| 30%+ | 4 | 1-3 | 25.0% [4.6%, 69.9%] | -0.80 | -20.0% [-100.0%, +220.0%] |

Broad betting views (flat 1u on the model pick at the stored price):

| Rule | N | Profit | ROI (event-bootstrap 95%) |
|---|---:|---:|---:|
| Every model pick | 106 | +0.61u | +0.6% [-11.9%, +13.9%] |
| Edge ≥3pp | 48 | +5.19u | +10.8% [-22.3%, +40.8%] |
| Edge >25pp | 12 | -3.50u | -29.2% [-81.5%, +33.0%] |
| Edge <0 | 50 | -1.64u | -3.3% [-20.9%, +15.7%] |

## Probability calibration

| Stored pick probability | N | Mean prediction | Actual win rate (95% Wilson) |
|---|---:|---:|---:|
| 50–55% | 22 | 52.3% | 63.6% [43.0%, 80.3%] |
| 55–60% | 34 | 57.5% | 55.9% [39.5%, 71.1%] |
| 60–65% | 21 | 62.3% | 47.6% [28.3%, 67.6%] |
| 65–70% | 19 | 67.1% | 78.9% [56.7%, 91.5%] |
| 70–75% | 5 | 72.7% | 40.0% [11.8%, 76.9%] |
| 75%+ | 2 | 79.0% | 50.0% [9.5%, 90.5%] |

The intervals are wide and overlap heavily. In particular, the apparently strong 65–70% bucket is not precise enough to support a special staking rule.

## Calibration after controlling for the market

A logistic model was fit as `outcome ~ market logit + model-minus-market probability`. The disagreement coefficient is expressed per 10 percentage points of additional model probability toward Fighter A.

- Disagreement coefficient: -0.027
- Event-clustered 95% bootstrap interval: [-0.524, +0.335]
- Spearman correlation between model-minus-market probability and the market residual: +0.173 (p=0.080)

A positive, stable disagreement coefficient would indicate that the model adds information beyond the market. This sample does not provide that evidence.

## Event-held-out diagnostic

Leave-one-event-out calibration was used to avoid fitting and scoring on the same event. This is a diagnostic, not a pristine historical backtest.

| Held-out predictor | Brier | Log loss |
|---|---:|---:|
| Raw stored model | 0.2472 | 0.6895 |
| Recalibrated market | 0.2369 | 0.6681 |
| Market + model disagreement | 0.2429 | 0.6814 |

## Later-event pseudo-holdout

The final four event dates (2026-05-23, 2026-06-06, 2026-06-14, 2026-06-20) contain 32 decisive fights. This cutoff was chosen after the data existed, so treat it as a sensitivity check rather than untouched test data.

- Stored model: Brier 0.2388, log loss 0.6751, accuracy 62.5%.
- No-vig market: Brier 0.2093, log loss 0.6103, accuracy 68.8%.
- Flat model-pick ROI: -2.3% on 33 rows.
- Edge ≥3pp ROI: -1.6% on 14 rows.
- Edge >25pp ROI: -27.5% on 4 rows.

## Recommendations

1. Do not loosen the gate or introduce larger units from this ledger.
2. Do not create a special 65–70% staking band; its uncertainty is too large.
3. Version every saved prediction with a model version/hash. The current ledger cannot isolate which historical model produced each probability.
4. Store timestamped opening and closing odds for both fighters. Without closing prices, CLV—the cleanest early signal that a betting model finds value—is unknowable.
5. Freeze the current model and gate before collecting new results. Evaluate the next predictions prospectively, without changing thresholds, and use event-clustered confidence intervals.
6. Revisit sizing only after at least 30 genuinely actioned bets; 100 is safer for calibration and bucket comparisons.

Bottom line: the historical edge variable is not validated as a sizing signal. The market remains the stronger probability baseline in this sample, and the current model still needs its own fresh prospective test.
