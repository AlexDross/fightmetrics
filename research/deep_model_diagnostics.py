#!/usr/bin/env python3
"""Deep diagnostics for the FightMetrics winner-prediction architecture.

Uses chronological train/validation/test splits and does not modify production
source or prediction data.
"""

from __future__ import annotations

import math
from collections import defaultdict
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import binomtest
from sklearn.linear_model import LogisticRegression

import explore_prediction_upgrade as exp


ROOT = Path(__file__).resolve().parent
REPORT = ROOT / "deep_model_diagnostics_report.md"
FEATURES = exp.FEATURES
LOGISTIC_C = 0.1
XGB_PARAMS = {
    "n_estimators": 250,
    "max_depth": 2,
    "learning_rate": 0.03,
    "min_child_weight": 20,
}

FEATURE_SETS = {
    "Full 18": FEATURES,
    "Core 6": [
        "younger",
        "elo",
        "sig_str_landed",
        "sig_str_accuracy",
        "td_landed",
        "td_accuracy",
    ],
    "No career totals": [
        f
        for f in FEATURES
        if f
        not in {
            "longest_streak",
            "wins",
            "losses",
            "rounds",
            "title_bouts",
            "ko_wins",
            "sub_wins",
        }
    ],
    "No form/streak": [
        f for f in FEATURES if f not in {"win_streak", "lose_streak", "longest_streak"}
    ],
    "No physical": [f for f in FEATURES if f not in {"younger", "height", "reach"}],
    "No ELO": [f for f in FEATURES if f != "elo"],
    "No striking": [
        f for f in FEATURES if f not in {"sig_str_landed", "sig_str_accuracy"}
    ],
    "No grappling": [
        f
        for f in FEATURES
        if f not in {"td_landed", "td_accuracy", "sub_attempts", "sub_wins"}
    ],
}


def american_decimal(odds):
    odds = float(odds)
    return 1 + odds / 100 if odds > 0 else 1 + 100 / abs(odds)


def flat_profit(y, side_red, red_odds, blue_odds):
    won = bool(y) == bool(side_red)
    odds = red_odds if side_red else blue_odds
    return american_decimal(odds) - 1 if won else -1.0


def calibration_stats(y, p, bins=10):
    y = np.asarray(y, dtype=float)
    p = np.asarray(p, dtype=float)
    edges = np.linspace(0, 1, bins + 1)
    ece = 0.0
    maximum = 0.0
    rows = []
    for i in range(bins):
        mask = (p >= edges[i]) & (p < edges[i + 1] if i < bins - 1 else p <= 1)
        if not mask.any():
            continue
        predicted = float(p[mask].mean())
        actual = float(y[mask].mean())
        gap = actual - predicted
        ece += mask.mean() * abs(gap)
        maximum = max(maximum, abs(gap))
        rows.append((edges[i], edges[i + 1], int(mask.sum()), predicted, actual))
    return {"ece": ece, "max_gap": maximum, "rows": rows}


def clustered_bootstrap(frame, a, b, metric_name, iterations=5000):
    dates = frame["date"].to_numpy()
    unique_dates = np.unique(dates)
    y = frame["y"].to_numpy()
    rng = np.random.default_rng(20260625)
    values = []
    for _ in range(iterations):
        sampled = rng.choice(unique_dates, len(unique_dates), replace=True)
        idx = np.concatenate([np.flatnonzero(dates == day) for day in sampled])
        ma = exp.metrics(y[idx], np.asarray(a)[idx])[metric_name]
        mb = exp.metrics(y[idx], np.asarray(b)[idx])[metric_name]
        values.append(ma - mb)
    return np.quantile(values, [0.025, 0.975])


def fit_models(frame):
    train = frame[frame["date"] < "2024-01-01"].copy()
    calibration = frame[
        (frame["date"] >= "2024-01-01") & (frame["date"] < "2025-01-01")
    ].copy()
    test = frame[frame["date"] >= "2025-01-01"].copy()
    train_cal = pd.concat([train, calibration], ignore_index=True)

    logistic = exp.fit_logistic(train_cal, FEATURES, LOGISTIC_C)
    p_logistic = exp.symmetric_predict(logistic, test, FEATURES)

    xgb_pre = exp.fit_xgb(train, FEATURES, XGB_PARAMS)
    p_xgb_cal = exp.symmetric_xgb_predict(xgb_pre, calibration, FEATURES)
    xgb_calibrator = exp.fit_platt(calibration["y"].to_numpy(), p_xgb_cal)
    xgb_final = exp.fit_xgb(train_cal, FEATURES, XGB_PARAMS)
    p_xgb = exp.platt_predict(
        xgb_calibrator, exp.symmetric_xgb_predict(xgb_final, test, FEATURES)
    )

    p_composite = exp.sigmoid(2 * test["transparent_composite"].to_numpy())

    calibration_market = calibration[calibration["market_p"].notna()].copy()
    logistic_pre = exp.fit_logistic(train, FEATURES, LOGISTIC_C)
    p_log_cal = exp.symmetric_predict(logistic_pre, calibration_market, FEATURES)
    hybrid_x = np.column_stack(
        [exp.logit(calibration_market["market_p"]), exp.logit(p_log_cal)]
    )
    hybrid = LogisticRegression(C=1.0, fit_intercept=False, solver="lbfgs")
    hybrid.fit(
        np.vstack([hybrid_x, -hybrid_x]),
        np.concatenate(
            [calibration_market["y"], 1 - calibration_market["y"]]
        ),
    )

    market_mask = test["market_p"].notna().to_numpy()
    test_market = test.loc[market_mask].copy()
    p_market = test_market["market_p"].to_numpy()
    p_hybrid = hybrid.predict_proba(
        np.column_stack([exp.logit(p_market), exp.logit(p_logistic[market_mask])])
    )[:, 1]

    return {
        "train": train,
        "calibration": calibration,
        "test": test,
        "test_market": test_market,
        "logistic_model": logistic,
        "xgb_model": xgb_final,
        "xgb_calibrator": xgb_calibrator,
        "hybrid_model": hybrid,
        "p_composite": p_composite,
        "p_logistic": p_logistic,
        "p_xgb": p_xgb,
        "p_market": p_market,
        "p_hybrid": p_hybrid,
        "market_mask": market_mask,
    }


def feature_ablation(frame):
    yearly = []
    for year in [2022, 2023, 2024, 2025, 2026]:
        train = frame[frame["date"] < f"{year}-01-01"]
        test = frame[
            (frame["date"] >= f"{year}-01-01")
            & (frame["date"] < f"{year + 1}-01-01")
        ]
        for name, features in FEATURE_SETS.items():
            model = exp.fit_logistic(train, features, LOGISTIC_C)
            p = exp.symmetric_predict(model, test, features)
            result = exp.metrics(test["y"], p)
            yearly.append(
                {
                    "year": year,
                    "set": name,
                    "n": len(test),
                    **result,
                }
            )
    df = pd.DataFrame(yearly)
    summary = []
    for name, group in df.groupby("set"):
        weights = group["n"].to_numpy()
        summary.append(
            {
                "set": name,
                "accuracy": np.average(group["accuracy"], weights=weights),
                "brier": np.average(group["brier"], weights=weights),
                "log_loss": np.average(group["log_loss"], weights=weights),
                "auc": np.average(group["auc"], weights=weights),
            }
        )
    return df, pd.DataFrame(summary).sort_values("log_loss")


def permutation_importance(models, repeats=100):
    test = models["test"]
    base_p = models["p_xgb"]
    base_loss = exp.metrics(test["y"], base_p)["log_loss"]
    rng = np.random.default_rng(20260625)
    rows = []
    for feature in FEATURES:
        deltas = []
        for _ in range(repeats):
            shuffled = test.copy()
            shuffled[feature] = rng.permutation(shuffled[feature].to_numpy())
            raw = exp.symmetric_xgb_predict(models["xgb_model"], shuffled, FEATURES)
            p = exp.platt_predict(models["xgb_calibrator"], raw)
            deltas.append(exp.metrics(test["y"], p)["log_loss"] - base_loss)
        rows.append(
            {
                "feature": feature,
                "delta": float(np.mean(deltas)),
                "low": float(np.quantile(deltas, 0.05)),
                "high": float(np.quantile(deltas, 0.95)),
            }
        )
    return sorted(rows, key=lambda row: row["delta"], reverse=True)


def segment_rows(models):
    test = models["test_market"].copy()
    mask = models["market_mask"]
    test["composite_p"] = models["p_composite"][mask]
    test["logistic_p"] = models["p_logistic"][mask]
    test["xgb_p"] = models["p_xgb"][mask]
    test["hybrid_p"] = models["p_hybrid"]
    test["market_fav_p"] = np.maximum(test["market_p"], 1 - test["market_p"])
    test["min_fights"] = np.minimum(test["red_fights"], test["blue_fights"])
    test["age_gap"] = np.abs(test["younger"])
    test["market_agree_composite"] = (
        (test["market_p"] >= 0.5) == (test["composite_p"] >= 0.5)
    )
    test["market_agree_logistic"] = (
        (test["market_p"] >= 0.5) == (test["logistic_p"] >= 0.5)
    )

    definitions = [
        ("All complete-odds fights", np.ones(len(test), dtype=bool)),
        ("Either fighter ≤2 prior UFC fights", test["min_fights"] <= 2),
        ("Either fighter ≤5 prior UFC fights", test["min_fights"] <= 5),
        ("Both fighters >5 prior UFC fights", test["min_fights"] > 5),
        ("Age gap ≥6 years", test["age_gap"] >= 6),
        ("Near pick'em market (<55%)", test["market_fav_p"] < 0.55),
        ("Moderate favorite (55–70%)", (test["market_fav_p"] >= 0.55) & (test["market_fav_p"] < 0.70)),
        ("Strong favorite (≥70%)", test["market_fav_p"] >= 0.70),
        ("Composite agrees with market", test["market_agree_composite"]),
        ("Composite disagrees with market", ~test["market_agree_composite"]),
        ("Learned logistic agrees with market", test["market_agree_logistic"]),
        ("Learned logistic disagrees with market", ~test["market_agree_logistic"]),
    ]
    rows = []
    for label, segment in definitions:
        frame = test.loc[segment]
        if len(frame) == 0:
            continue
        row = {"segment": label, "n": len(frame)}
        for name in ["composite", "logistic", "xgb", "market", "hybrid"]:
            p = frame[f"{name}_p"].to_numpy()
            m = exp.metrics(frame["y"], p)
            row[f"{name}_accuracy"] = m["accuracy"]
            row[f"{name}_log_loss"] = m["log_loss"]
        rows.append(row)
    return test, rows


def disagreement_stats(test):
    rows = []
    for name in ["composite", "logistic", "xgb"]:
        model_pick = test[f"{name}_p"] >= 0.5
        market_pick = test["market_p"] >= 0.5
        disagree = model_pick != market_pick
        subset = test.loc[disagree]
        model_wins = int((model_pick[disagree] == subset["y"].astype(bool)).sum())
        market_wins = len(subset) - model_wins
        p_value = (
            binomtest(model_wins, len(subset), 0.5).pvalue if len(subset) else math.nan
        )
        rows.append(
            {
                "model": name,
                "n": len(subset),
                "model_wins": model_wins,
                "market_wins": market_wins,
                "model_rate": model_wins / len(subset) if len(subset) else math.nan,
                "p": p_value,
            }
        )
    return rows


def betting_edges(test, predictions):
    rows = []
    complete = test[
        test["red_odds"].notna()
        & test["blue_odds"].notna()
        & test["market_p"].notna()
    ].copy()
    for model_name, p_all in predictions.items():
        p = np.asarray(p_all)[complete.index - test.index.min()]
        model_red = p >= 0.5
        pick_p = np.where(model_red, p, 1 - p)
        market_pick_p = np.where(
            model_red, complete["market_p"], 1 - complete["market_p"]
        )
        edges = pick_p - market_pick_p
        for threshold in [0.00, 0.02, 0.05, 0.10, 0.15]:
            chosen = edges >= threshold
            chosen_frame = complete.loc[chosen].copy()
            profits = [
                flat_profit(
                    y,
                    red,
                    red_odds,
                    blue_odds,
                )
                for y, red, red_odds, blue_odds in zip(
                    complete.loc[chosen, "y"],
                    model_red[chosen],
                    complete.loc[chosen, "red_odds"],
                    complete.loc[chosen, "blue_odds"],
                )
            ]
            chosen_frame["profit"] = profits
            rng = np.random.default_rng(20260625 + int(threshold * 1000))
            event_dates = chosen_frame["date"].unique()
            bootstrap_roi = []
            if len(chosen_frame):
                event_stats = (
                    chosen_frame.groupby("date")["profit"]
                    .agg(["sum", "count"])
                    .reindex(event_dates)
                )
                event_sums = event_stats["sum"].to_numpy()
                event_counts = event_stats["count"].to_numpy()
                for _ in range(3000):
                    sampled_idx = rng.integers(
                        0, len(event_dates), size=len(event_dates)
                    )
                    bootstrap_roi.append(
                        float(
                            event_sums[sampled_idx].sum()
                            / event_counts[sampled_idx].sum()
                        )
                    )
            yearly_roi = {}
            for year in [2025, 2026]:
                year_profit = chosen_frame.loc[
                    chosen_frame["date"].str.startswith(str(year)), "profit"
                ]
                yearly_roi[year] = (
                    float(year_profit.mean()) if len(year_profit) else math.nan
                )
            rows.append(
                {
                    "model": model_name,
                    "threshold": threshold,
                    "n": len(profits),
                    "profit": sum(profits),
                    "roi": np.mean(profits) if profits else math.nan,
                    "roi_low": (
                        float(np.quantile(bootstrap_roi, 0.025))
                        if bootstrap_roi
                        else math.nan
                    ),
                    "roi_high": (
                        float(np.quantile(bootstrap_roi, 0.975))
                        if bootstrap_roi
                        else math.nan
                    ),
                    "roi_2025": yearly_roi[2025],
                    "roi_2026": yearly_roi[2026],
                }
            )
    return rows


def main():
    frame = exp.load_frame()
    models = fit_models(frame)
    ablation_yearly, ablation_summary = feature_ablation(frame)
    permutation = permutation_importance(models)
    segmented_test, segments = segment_rows(models)
    disagreements = disagreement_stats(segmented_test)

    edge_rows = betting_edges(
        models["test"],
        {
            "Learned logistic": models["p_logistic"],
            "Shallow XGBoost": models["p_xgb"],
        },
    )

    market_test = models["test_market"]
    mask = models["market_mask"]
    comparison = {
        "Transparent composite": models["p_composite"][mask],
        "Learned logistic": models["p_logistic"][mask],
        "Shallow XGBoost": models["p_xgb"][mask],
        "No-vig market": models["p_market"],
        "Market + learned stats": models["p_hybrid"],
    }
    result_rows = {
        name: exp.metrics(market_test["y"], p) for name, p in comparison.items()
    }
    hybrid_market_ci = clustered_bootstrap(
        market_test,
        models["p_hybrid"],
        models["p_market"],
        "log_loss",
    )
    xgb_market_ci = clustered_bootstrap(
        market_test,
        models["p_xgb"][mask],
        models["p_market"],
        "log_loss",
    )
    calibration = {
        name: calibration_stats(market_test["y"], p)
        for name, p in comparison.items()
    }

    lines = [
        "# Deep model diagnostics",
        "",
        "## Executive diagnosis",
        "",
        "The current transparent composite contains real predictive signal, but its "
        "main bottleneck is architectural rather than a missing magic statistic. It "
        "combines correlated inputs with hand-assigned positive importance weights, "
        "adds several heuristic adjustments, and then calibrates the sum globally. "
        "That approach cannot reliably learn conditional direction, redundancy, or "
        "interactions.",
        "",
        "The strongest tested path is a two-model architecture:",
        "",
        "1. An independent, orientation-symmetric statistics model for fair probability "
        "and betting-edge detection.",
        "2. A separately labeled market-plus-statistics model for maximum outright winner "
        "accuracy.",
        "",
        "## Chronological 2025–2026 holdout",
        "",
        f"Training ends in 2023, model selection/calibration uses 2024, and the final "
        f"test contains {len(market_test)} fights with complete odds.",
        "",
        "| Predictor | Accuracy | Brier | Log loss | AUC | ECE |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for name, result in result_rows.items():
        lines.append(
            f"| {name} | {result['accuracy']*100:.2f}% | {result['brier']:.4f} | "
            f"{result['log_loss']:.4f} | {result['auc']:.4f} | "
            f"{calibration[name]['ece']:.4f} |"
        )

    lines += [
        "",
        f"Hybrid minus market log-loss difference: "
        f"{result_rows['Market + learned stats']['log_loss'] - result_rows['No-vig market']['log_loss']:+.4f}; "
        f"event-date bootstrap 95% interval [{hybrid_market_ci[0]:+.4f}, "
        f"{hybrid_market_ci[1]:+.4f}].",
        "",
        f"XGBoost minus market log-loss difference: "
        f"{result_rows['Shallow XGBoost']['log_loss'] - result_rows['No-vig market']['log_loss']:+.4f}; "
        f"95% interval [{xgb_market_ci[0]:+.4f}, {xgb_market_ci[1]:+.4f}].",
        "",
        "The hybrid improvement is the strongest result because it asks whether the "
        "statistics add information after accounting for the market. The independent "
        "XGBoost model is approximately market-level on this holdout, not conclusively "
        "better.",
        "",
        "## Where the current composite loses accuracy",
        "",
        "| Segment | N | Composite acc / LL | Logistic acc / LL | XGB acc / LL | Market acc / LL | Hybrid acc / LL |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for row in segments:
        lines.append(
            f"| {row['segment']} | {row['n']} | "
            f"{row['composite_accuracy']*100:.1f}% / {row['composite_log_loss']:.3f} | "
            f"{row['logistic_accuracy']*100:.1f}% / {row['logistic_log_loss']:.3f} | "
            f"{row['xgb_accuracy']*100:.1f}% / {row['xgb_log_loss']:.3f} | "
            f"{row['market_accuracy']*100:.1f}% / {row['market_log_loss']:.3f} | "
            f"{row['hybrid_accuracy']*100:.1f}% / {row['hybrid_log_loss']:.3f} |"
        )

    lines += [
        "",
        "## Feature-group ablation across yearly holdouts",
        "",
        "Every listed feature set is refit using only fights before each test year. "
        "The table is weighted across 2022–2026 holdouts.",
        "",
        "| Feature set | Accuracy | Brier | Log loss | AUC |",
        "|---|---:|---:|---:|---:|",
    ]
    for _, row in ablation_summary.iterrows():
        lines.append(
            f"| {row['set']} | {row['accuracy']*100:.2f}% | {row['brier']:.4f} | "
            f"{row['log_loss']:.4f} | {row['auc']:.4f} |"
        )

    lines += [
        "",
        "## XGBoost permutation importance on the untouched test",
        "",
        "Positive values show how much log loss worsens when a feature is randomly "
        "destroyed. Near-zero or negative values are not earning their complexity.",
        "",
        "| Feature | Mean log-loss damage | 5–95% range |",
        "|---|---:|---:|",
    ]
    for row in permutation:
        lines.append(
            f"| {row['feature']} | {row['delta']:+.4f} | "
            f"[{row['low']:+.4f}, {row['high']:+.4f}] |"
        )

    lines += [
        "",
        "## Direct disagreements with the market",
        "",
        "| Independent model | Disagreements | Model correct | Market correct | Model win rate | Binomial p |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for row in disagreements:
        lines.append(
            f"| {row['model']} | {row['n']} | {row['model_wins']} | "
            f"{row['market_wins']} | {row['model_rate']*100:.1f}% | "
            f"{row['p']:.4f} |"
        )

    lines += [
        "",
        "## Betting-edge diagnostic on the final holdout",
        "",
        "Flat 1u bets use the dataset's stored fight odds. These odds are not verified "
        "closing prices, so this is a diagnostic rather than a deployable betting proof.",
        "",
        "| Independent model | Minimum no-vig edge | Bets | Profit | ROI (95% event bootstrap) | 2025 ROI | 2026 ROI |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for row in edge_rows:
        lines.append(
            f"| {row['model']} | {row['threshold']*100:.0f}pp | {row['n']} | "
            f"{row['profit']:+.2f}u | "
            f"{row['roi']*100:+.1f}% [{row['roi_low']*100:+.1f}%, "
            f"{row['roi_high']*100:+.1f}%] | "
            f"{row['roi_2025']*100:+.1f}% | {row['roi_2026']*100:+.1f}% |"
        )

    lines += [
        "",
        "## Concrete sources of train-serve skew",
        "",
        "1. **Dead duplicate model:** `App.js` owns the live model. The newer weight "
        "ablations in `modelModule.js` are not imported and therefore do nothing.",
        "2. **Importance is being used as a coefficient:** XGBoost feature importance "
        "does not provide a signed linear effect. The live composite manually assumes "
        "direction and additivity.",
        "3. **Correlated career evidence is counted repeatedly:** wins, losses, rounds, "
        "KO wins, title bouts, streaks, ELO, and schedule quality overlap heavily.",
        "4. **Heuristics were optimized separately:** age decay, form decay, SOS, "
        "momentum, cardio, layoff, and small-sample blending were not jointly fit.",
        "5. **Percentage reliability is crude:** takedown and striking accuracy are "
        "blended by total rounds rather than their actual attempt counts.",
        "6. **Missing physical data becomes zero:** height/reach subtraction uses "
        "`?? 0`, creating artificial maximum disadvantages.",
        "7. **Division averages drift with the current roster:** prediction output can "
        "change when roster data changes even if both selected fighters are unchanged.",
        "8. **Cross-division simulations are unsupported by training:** the historical "
        "training set is organized by recorded fight weight class, while the app permits "
        "fighters from different divisions without a weight adjustment.",
        "9. **Historical prediction rows lack model/version and feature snapshots:** "
        "post-hoc evaluation cannot always reconstruct the exact serving state cleanly.",
        "",
        "## Recommended production architecture",
        "",
        "### A. Independent fair-probability model",
        "",
        "- Start with the regularized logistic model because it is transparent, stable "
        "across years, and materially better than the hand-built composite.",
        "- Keep shallow XGBoost as a challenger. Promote it only after repeated frozen "
        "prospective tests establish a stable Brier/log-loss advantage.",
        "- Enforce fighter-slot symmetry by construction.",
        "- Fit coefficients jointly with rolling-origin validation.",
        "",
        "### B. Outright winner forecast",
        "",
        "- Blend market logit and independent-model logit using coefficients learned on "
        "a trailing calibration period.",
        "- Label this forecast clearly as market-informed. Do not use it to calculate "
        "betting edge.",
        "",
        "### C. Data and feature repairs",
        "",
        "- Replace missing pairwise values with division priors and missingness flags.",
        "- Use attempt-count Bayesian shrinkage for percentages.",
        "- Remove raw KO and submission win counts unless they add stable incremental "
        "value after ELO, rate stats, and fight volume.",
        "- Add actual control-time differential after a clean point-in-time validation.",
        "- Freeze division priors by training version.",
        "- Reject or separately model cross-weight-class matchups.",
        "",
        "### D. Evaluation discipline",
        "",
        "- Freeze each production version before an event.",
        "- Save model hash, feature vector, data timestamp, probability, and market line.",
        "- Store opening and closing consensus prices for CLV.",
        "- Judge probability quality primarily by log loss, Brier score, calibration, "
        "and CLV—not only winner accuracy.",
        "",
        "## Brutally honest bottom line",
        "",
        "The existing algorithm is not bad; it captures enough signal to beat a naive "
        "baseline. But its current design is too hand-tuned and internally redundant to "
        "be a credible market-beating probability engine. The data already shows that a "
        "small jointly fitted model is substantially better.",
        "",
        "The realistic near-term target is:",
        "",
        "- Match the market with an independent no-odds model.",
        "- Beat the market on probability quality with a clearly separated hybrid.",
        "- Prove betting value through prospective CLV and frozen out-of-sample bets.",
        "",
        "You have evidence for the first two. You do not yet have evidence for the third.",
        "",
    ]

    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
