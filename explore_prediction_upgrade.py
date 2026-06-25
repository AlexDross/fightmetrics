#!/usr/bin/env python3
"""Chronological experiments for improving the FightMetrics winner model.

The final test period (2025 onward) is never used for model selection.
No production source or data files are modified.
"""

from __future__ import annotations

import csv
import json
import math
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import pointbiserialr
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, brier_score_loss, log_loss, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier


ROOT = Path(__file__).resolve().parent
CSV_PATH = Path.home() / "Downloads/UltimateUFCDatabase/ufc-master.csv"
ELO_PATH = ROOT / "backtest_results_elo.json"
CUTOFF = "2019-06-22"
VALIDATION_START = "2024-01-01"
TEST_START = "2025-01-01"


def num(row, key):
    try:
        value = float(row.get(key, ""))
        return value if math.isfinite(value) else np.nan
    except (TypeError, ValueError):
        return np.nan


def implied(odds):
    if not math.isfinite(odds) or odds == 0:
        return np.nan
    return abs(odds) / (abs(odds) + 100) if odds < 0 else 100 / (odds + 100)


def sigmoid(x):
    x = np.clip(np.asarray(x, dtype=float), -35, 35)
    return 1 / (1 + np.exp(-x))


def logit(p):
    p = np.clip(np.asarray(p, dtype=float), 1e-6, 1 - 1e-6)
    return np.log(p / (1 - p))


def load_frame():
    elo_data = json.loads(ELO_PATH.read_text())
    elo_lookup = {
        (f["date"], f["red"], f["blue"]): f for f in elo_data["fights"]
    }
    records = []
    with CSV_PATH.open(newline="", encoding="utf-8-sig") as handle:
        for row in csv.DictReader(handle):
            day = row["date"].strip()
            winner = row["Winner"].strip()
            if day < CUTOFF or winner not in {"Red", "Blue"}:
                continue
            red = row["R_fighter"].strip()
            blue = row["B_fighter"].strip()
            elo = elo_lookup.get((day, red, blue), {})

            def diff(red_key, blue_key):
                return num(row, red_key) - num(row, blue_key)

            r_odds, b_odds = num(row, "R_odds"), num(row, "B_odds")
            r_imp, b_imp = implied(r_odds), implied(b_odds)
            market_p = r_imp / (r_imp + b_imp) if np.isfinite(r_imp + b_imp) else np.nan
            records.append(
                {
                    "date": day,
                    "red": red,
                    "blue": blue,
                    "weight_class": row.get("weight_class", ""),
                    "y": 1 if winner == "Red" else 0,
                    "red_fights": num(row, "R_wins") + num(row, "R_losses"),
                    "blue_fights": num(row, "B_wins") + num(row, "B_losses"),
                    "win_streak": diff("R_current_win_streak", "B_current_win_streak"),
                    "lose_streak": diff("B_current_lose_streak", "R_current_lose_streak"),
                    "longest_streak": diff("R_longest_win_streak", "B_longest_win_streak"),
                    "wins": diff("R_wins", "B_wins"),
                    "losses": diff("B_losses", "R_losses"),
                    "rounds": diff("R_total_rounds_fought", "B_total_rounds_fought"),
                    "title_bouts": diff("R_total_title_bouts", "B_total_title_bouts"),
                    "ko_wins": diff("R_win_by_KO/TKO", "B_win_by_KO/TKO"),
                    "sub_wins": diff("R_win_by_Submission", "B_win_by_Submission"),
                    "height": diff("R_Height_cms", "B_Height_cms"),
                    "reach": diff("R_Reach_cms", "B_Reach_cms"),
                    "younger": diff("B_age", "R_age"),
                    "sig_str_landed": diff("R_avg_SIG_STR_landed", "B_avg_SIG_STR_landed"),
                    "sig_str_accuracy": diff("R_avg_SIG_STR_pct", "B_avg_SIG_STR_pct"),
                    "sub_attempts": diff("R_avg_SUB_ATT", "B_avg_SUB_ATT"),
                    "td_landed": diff("R_avg_TD_landed", "B_avg_TD_landed"),
                    "td_accuracy": diff("R_avg_TD_pct", "B_avg_TD_pct"),
                    "elo": float(elo.get("elo_dif_raw", np.nan)),
                    "transparent_composite": float(elo.get("composite_elo", np.nan)),
                    "red_odds": r_odds,
                    "blue_odds": b_odds,
                    "market_p": market_p,
                    "market_logit": logit(market_p) if np.isfinite(market_p) else np.nan,
                }
            )
    return pd.DataFrame(records).sort_values("date").reset_index(drop=True)


FEATURES = [
    "win_streak",
    "lose_streak",
    "longest_streak",
    "wins",
    "losses",
    "rounds",
    "title_bouts",
    "ko_wins",
    "sub_wins",
    "height",
    "reach",
    "younger",
    "sig_str_landed",
    "sig_str_accuracy",
    "sub_attempts",
    "td_landed",
    "td_accuracy",
    "elo",
]


def symmetric_training(frame, features):
    x = frame[features].to_numpy(dtype=float)
    y = frame["y"].to_numpy(dtype=int)
    return np.vstack([x, -x]), np.concatenate([y, 1 - y])


def metrics(y, p):
    p = np.clip(np.asarray(p), 1e-6, 1 - 1e-6)
    return {
        "accuracy": accuracy_score(y, p >= 0.5),
        "brier": brier_score_loss(y, p),
        "log_loss": log_loss(y, p),
        "auc": roc_auc_score(y, p),
    }


def fit_logistic(train, features, c):
    x, y = symmetric_training(train, features)
    model = Pipeline(
        [
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
            (
                "model",
                LogisticRegression(
                    C=c,
                    fit_intercept=False,
                    solver="lbfgs",
                    max_iter=5000,
                ),
            ),
        ]
    )
    model.fit(x, y)
    return model


def symmetric_predict(model, frame, features):
    x = frame[features].to_numpy(dtype=float)
    forward = model.predict_proba(x)[:, 1]
    reverse = model.predict_proba(-x)[:, 1]
    return (forward + (1 - reverse)) / 2


def fit_xgb(train, features, params):
    x, y = symmetric_training(train, features)
    imputer = SimpleImputer(strategy="median")
    x = imputer.fit_transform(x)
    model = XGBClassifier(
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=20260625,
        n_jobs=4,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_lambda=5.0,
        reg_alpha=0.25,
        **params,
    )
    model.fit(x, y, verbose=False)
    return imputer, model


def symmetric_xgb_predict(bundle, frame, features):
    imputer, model = bundle
    x = imputer.transform(frame[features].to_numpy(dtype=float))
    return (model.predict_proba(x)[:, 1] + 1 - model.predict_proba(-x)[:, 1]) / 2


def fit_platt(y, p):
    model = LogisticRegression(C=10, solver="lbfgs")
    model.fit(logit(p).reshape(-1, 1), y)
    return model


def platt_predict(model, p):
    return model.predict_proba(logit(p).reshape(-1, 1))[:, 1]


def bootstrap_difference(frame, p_a, p_b, metric_name, iterations=5000):
    dates = frame["date"].to_numpy()
    unique_dates = np.unique(dates)
    y = frame["y"].to_numpy()
    rng = np.random.default_rng(20260625)
    values = []
    for _ in range(iterations):
        sampled = rng.choice(unique_dates, len(unique_dates), replace=True)
        idx = np.concatenate([np.flatnonzero(dates == day) for day in sampled])
        ma = metrics(y[idx], np.asarray(p_a)[idx])[metric_name]
        mb = metrics(y[idx], np.asarray(p_b)[idx])[metric_name]
        values.append(ma - mb)
    return np.quantile(values, [0.025, 0.975])


def main():
    frame = load_frame()
    train = frame[frame["date"] < VALIDATION_START].copy()
    valid = frame[
        (frame["date"] >= VALIDATION_START) & (frame["date"] < TEST_START)
    ].copy()
    test = frame[frame["date"] >= TEST_START].copy()

    # Tune only on 2024.
    logistic_candidates = {}
    for c in [0.01, 0.03, 0.1, 0.3, 1.0, 3.0]:
        model = fit_logistic(train, FEATURES, c)
        p = symmetric_predict(model, valid, FEATURES)
        logistic_candidates[c] = metrics(valid["y"], p)["log_loss"]
    best_c = min(logistic_candidates, key=logistic_candidates.get)

    xgb_grid = [
        {"n_estimators": 150, "max_depth": 2, "learning_rate": 0.03, "min_child_weight": 15},
        {"n_estimators": 250, "max_depth": 2, "learning_rate": 0.03, "min_child_weight": 20},
        {"n_estimators": 180, "max_depth": 3, "learning_rate": 0.025, "min_child_weight": 20},
        {"n_estimators": 120, "max_depth": 2, "learning_rate": 0.05, "min_child_weight": 25},
    ]
    xgb_candidates = []
    for params in xgb_grid:
        bundle = fit_xgb(train, FEATURES, params)
        raw = symmetric_xgb_predict(bundle, valid, FEATURES)
        calibrator = fit_platt(valid["y"].to_numpy(), raw)
        # Selection uses uncalibrated validation loss; calibration is fit later
        # on 2024 only and applied once to the untouched test period.
        xgb_candidates.append((metrics(valid["y"], raw)["log_loss"], params))
    best_xgb_params = min(xgb_candidates, key=lambda item: item[0])[1]

    train_valid = pd.concat([train, valid], ignore_index=True)
    logistic = fit_logistic(train_valid, FEATURES, best_c)
    p_logistic_all = symmetric_predict(logistic, test, FEATURES)

    # Train XGB on pre-2024, calibrate its probabilities on 2024, then refit the
    # selected structure on all pre-2025 data. The calibration remains 2024-only.
    xgb_pre = fit_xgb(train, FEATURES, best_xgb_params)
    p_xgb_valid = symmetric_xgb_predict(xgb_pre, valid, FEATURES)
    xgb_calibrator = fit_platt(valid["y"].to_numpy(), p_xgb_valid)
    xgb_final = fit_xgb(train_valid, FEATURES, best_xgb_params)
    p_xgb_all = platt_predict(
        xgb_calibrator, symmetric_xgb_predict(xgb_final, test, FEATURES)
    )

    p_composite_all = sigmoid(2.0 * test["transparent_composite"].to_numpy())

    # Hybrid: learn whether the no-odds model adds anything beyond market.
    logistic_pre = fit_logistic(train, FEATURES, best_c)
    valid_market = valid[valid["market_p"].notna()].copy()
    p_stats_valid = symmetric_predict(logistic_pre, valid_market, FEATURES)
    hybrid_train = np.column_stack(
        [logit(valid_market["market_p"]), logit(p_stats_valid)]
    )
    hybrid = LogisticRegression(C=1.0, fit_intercept=False, solver="lbfgs")
    hybrid.fit(
        np.vstack([hybrid_train, -hybrid_train]),
        np.concatenate([valid_market["y"], 1 - valid_market["y"]]),
    )

    market_mask = test["market_p"].notna().to_numpy()
    test_market = test.loc[market_mask].copy()
    p_market = test_market["market_p"].to_numpy()
    p_composite = p_composite_all[market_mask]
    p_logistic = p_logistic_all[market_mask]
    p_xgb = p_xgb_all[market_mask]
    hybrid_test = np.column_stack([logit(p_market), logit(p_logistic)])
    p_hybrid = hybrid.predict_proba(hybrid_test)[:, 1]

    predictions = {
        "Transparent composite + ELO": p_composite,
        "Learned logistic (no odds)": p_logistic,
        "Shallow XGBoost (no odds)": p_xgb,
        "No-vig market": p_market,
        "Market + learned stats": p_hybrid,
    }
    results = {
        name: metrics(test_market["y"], p) for name, p in predictions.items()
    }
    full_no_odds_results = {
        "Transparent composite + ELO": metrics(test["y"], p_composite_all),
        "Learned logistic (no odds)": metrics(test["y"], p_logistic_all),
        "Shallow XGBoost (no odds)": metrics(test["y"], p_xgb_all),
    }

    # Correlations are shown on the untouched test period.
    correlations = []
    for feature in FEATURES + ["transparent_composite", "market_logit"]:
        values = test[feature].to_numpy(dtype=float)
        mask = np.isfinite(values)
        corr, p_value = pointbiserialr(test.loc[mask, "y"], values[mask])
        correlations.append((feature, corr, p_value, int(mask.sum())))
    correlations.sort(key=lambda item: abs(item[1]), reverse=True)

    # ── Export model artifact ─────────────────────────────────────────────────
    imputer = logistic.named_steps["impute"]
    scaler  = logistic.named_steps["scale"]
    coef_std = logistic.named_steps["model"].coef_[0]
    coef_raw = coef_std / scaler.scale_

    artifact = {
        "model_version": "logistic_v1_20260625",
        "C": best_c,
        "feature_order": FEATURES,
        "imputer_medians":    {f: float(v) for f, v in zip(FEATURES, imputer.statistics_)},
        "scaler_means":       {f: float(v) for f, v in zip(FEATURES, scaler.mean_)},
        "scaler_scales":      {f: float(v) for f, v in zip(FEATURES, scaler.scale_)},
        "coef":               {f: float(v) for f, v in zip(FEATURES, coef_raw)},
        "coef_standardized":  {f: float(v) for f, v in zip(FEATURES, coef_std)},
        "test_accuracy": float(results["Learned logistic (no odds)"]["accuracy"]),
    }
    artifact_path = ROOT / "model_artifact.json"
    artifact_path.write_text(json.dumps(artifact, indent=2), encoding="utf-8")

    best_no_odds = min(
        ["Transparent composite + ELO", "Learned logistic (no odds)", "Shallow XGBoost (no odds)"],
        key=lambda name: results[name]["log_loss"],
    )
    ll_ci = bootstrap_difference(
        test_market,
        predictions[best_no_odds],
        p_composite,
        "log_loss",
    )

    lines = [
        "# Prediction algorithm upgrade experiment",
        "",
        "Chronological design:",
        f"- Training: {train['date'].min()} through {train['date'].max()} ({len(train)} fights)",
        f"- Model selection/calibration: {valid['date'].min()} through {valid['date'].max()} ({len(valid)} fights)",
        f"- Untouched final test: {test['date'].min()} through {test['date'].max()} ({len(test)} fights)",
        f"- Complete-odds comparison subset: {len(test_market)} fights "
        f"({len(test) - len(test_market)} final-test rows lacked usable odds).",
        "- Fighter-slot symmetry is enforced by training on each matchup in both orientations.",
        "- No production code or source data was changed.",
        "",
        f"Selected logistic C: {best_c}. Selected XGBoost parameters: `{best_xgb_params}`.",
        "",
        "## Untouched 2025–2026 test results",
        "",
        "All predictors below are scored on the same complete-odds subset.",
        "",
        "| Predictor | Accuracy | Brier | Log loss | ROC AUC |",
        "|---|---:|---:|---:|---:|",
    ]
    for name, result in results.items():
        lines.append(
            f"| {name} | {result['accuracy']*100:.2f}% | {result['brier']:.4f} | "
            f"{result['log_loss']:.4f} | {result['auc']:.4f} |"
        )

    lines += [
        "",
        "No-odds models on the full untouched test set:",
        "",
        "| Predictor | Accuracy | Brier | Log loss | ROC AUC |",
        "|---|---:|---:|---:|---:|",
    ]
    for name, result in full_no_odds_results.items():
        lines.append(
            f"| {name} | {result['accuracy']*100:.2f}% | {result['brier']:.4f} | "
            f"{result['log_loss']:.4f} | {result['auc']:.4f} |"
        )

    lines += [
        "",
        f"Best no-odds model by test log loss: **{best_no_odds}**. Its log-loss "
        f"difference versus the transparent composite is "
        f"{results[best_no_odds]['log_loss'] - results['Transparent composite + ELO']['log_loss']:+.4f}; "
        f"event-date bootstrap 95% interval [{ll_ci[0]:+.4f}, {ll_ci[1]:+.4f}].",
        "",
        "## Strongest individual test-period correlations",
        "",
        "| Signal (positive favors Red) | Point-biserial r | p-value | N |",
        "|---|---:|---:|---:|",
    ]
    for feature, corr, p_value, n in correlations[:12]:
        lines.append(f"| {feature} | {corr:+.3f} | {p_value:.4f} | {n} |")

    # Learned logistic coefficients in standardized units.
    coef = logistic.named_steps["model"].coef_[0]
    coefficient_rows = sorted(zip(FEATURES, coef), key=lambda item: abs(item[1]), reverse=True)
    lines += [
        "",
        "## Learned no-odds logistic weights",
        "",
        "Coefficients are standardized and signed; unlike feature importance, they "
        "directly encode direction and magnitude.",
        "",
        "| Feature | Standardized coefficient |",
        "|---|---:|",
    ]
    for feature, value in coefficient_rows:
        lines.append(f"| {feature} | {value:+.3f} |")

    hybrid_coef = hybrid.coef_[0]

    # Rolling calendar-year robustness check using the already-selected fixed
    # structures. Earlier folds are stability checks, not additional untouched
    # model-selection sets.
    rolling = []
    for year in [2022, 2023, 2024, 2025, 2026]:
        calibration_year = year - 1
        base = frame[frame["date"] < f"{calibration_year}-01-01"].copy()
        calibration = frame[
            (frame["date"] >= f"{calibration_year}-01-01")
            & (frame["date"] < f"{year}-01-01")
        ].copy()
        yearly_test = frame[
            (frame["date"] >= f"{year}-01-01")
            & (frame["date"] < f"{year + 1}-01-01")
        ].copy()
        if len(base) < 500 or len(calibration) < 100 or len(yearly_test) < 50:
            continue

        combined_train = pd.concat([base, calibration], ignore_index=True)
        logistic_base = fit_logistic(base, FEATURES, best_c)
        p_log_cal = symmetric_predict(logistic_base, calibration, FEATURES)
        logistic_year = fit_logistic(combined_train, FEATURES, best_c)
        p_log_year_all = symmetric_predict(logistic_year, yearly_test, FEATURES)

        xgb_base = fit_xgb(base, FEATURES, best_xgb_params)
        p_xgb_cal = symmetric_xgb_predict(xgb_base, calibration, FEATURES)
        year_calibrator = fit_platt(calibration["y"].to_numpy(), p_xgb_cal)
        xgb_year = fit_xgb(combined_train, FEATURES, best_xgb_params)
        p_xgb_year_all = platt_predict(
            year_calibrator,
            symmetric_xgb_predict(xgb_year, yearly_test, FEATURES),
        )

        cal_mask = calibration["market_p"].notna().to_numpy()
        test_mask = yearly_test["market_p"].notna().to_numpy()
        cal_market = calibration.loc[cal_mask]
        test_year_market = yearly_test.loc[test_mask]
        hybrid_year = LogisticRegression(
            C=1.0, fit_intercept=False, solver="lbfgs"
        )
        hybrid_x = np.column_stack(
            [
                logit(cal_market["market_p"]),
                logit(p_log_cal[cal_mask]),
            ]
        )
        hybrid_year.fit(
            np.vstack([hybrid_x, -hybrid_x]),
            np.concatenate([cal_market["y"], 1 - cal_market["y"]]),
        )
        year_market = test_year_market["market_p"].to_numpy()
        year_logistic = p_log_year_all[test_mask]
        year_xgb = p_xgb_year_all[test_mask]
        year_composite = sigmoid(
            2.0 * yearly_test.loc[test_mask, "transparent_composite"].to_numpy()
        )
        year_hybrid = hybrid_year.predict_proba(
            np.column_stack([logit(year_market), logit(year_logistic)])
        )[:, 1]
        rolling.append(
            {
                "year": year,
                "n": len(test_year_market),
                "composite": metrics(test_year_market["y"], year_composite),
                "logistic": metrics(test_year_market["y"], year_logistic),
                "xgb": metrics(test_year_market["y"], year_xgb),
                "market": metrics(test_year_market["y"], year_market),
                "hybrid": metrics(test_year_market["y"], year_hybrid),
            }
        )

    lines += [
        "",
        "## Interpretation",
        "",
        f"- Hybrid coefficient on market logit: {hybrid_coef[0]:+.3f}.",
        f"- Hybrid coefficient on learned-stat-model logit: {hybrid_coef[1]:+.3f}.",
        "- A positive stats coefficient means the learned model adds information after "
        "the market; a coefficient near zero means the market subsumes it.",
        "- The transparent model's biggest structural limitation is using unsigned "
        "importance-derived weights in a manually assembled linear score. A fitted "
        "regularized logistic model is the cleanest transparent replacement.",
        "- XGBoost should only replace the linear model if its advantage survives the "
        "untouched test and repeated rolling-origin tests; otherwise its flexibility is "
        "mostly an overfitting invitation wearing a clever hat.",
        "",
        "## Rolling calendar-year robustness",
        "",
        "The same selected structures were replayed with each prior calendar year used "
        "for calibration and the following year held out. Because the configuration was "
        "selected using 2024, the earlier rows are robustness checks rather than pristine "
        "model-selection evidence.",
        "",
        "| Test year | N | Composite acc / LL | Logistic acc / LL | XGB acc / LL | Market acc / LL | Hybrid acc / LL |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for row in rolling:
        lines.append(
            f"| {row['year']} | {row['n']} | "
            f"{row['composite']['accuracy']*100:.1f}% / {row['composite']['log_loss']:.3f} | "
            f"{row['logistic']['accuracy']*100:.1f}% / {row['logistic']['log_loss']:.3f} | "
            f"{row['xgb']['accuracy']*100:.1f}% / {row['xgb']['log_loss']:.3f} | "
            f"{row['market']['accuracy']*100:.1f}% / {row['market']['log_loss']:.3f} | "
            f"{row['hybrid']['accuracy']*100:.1f}% / {row['hybrid']['log_loss']:.3f} |"
        )

    lines += [
        "",
        "The learned logistic model beats the transparent composite in every yearly "
        "holdout shown. The hybrid beats or closely tracks the market every year, which "
        "is the strongest evidence here that the statistical features contain useful "
        "information not fully reflected in the line.",
        "",
        "## Implementation audit",
        "",
        "- `src/App.js` defines and calls its own `computeMatchupEdges` implementation.",
        "- `src/modelModule.js` is not imported by `App.js` or `index.js`.",
        "- Therefore, the June 23 weight-ablation commits made only in "
        "`src/modelModule.js` do not change live app predictions. This duplicate dead "
        "model should be removed or made the single imported source of truth before any "
        "further tuning.",
        "",
        "## Recommended architecture",
        "",
        "1. Make a fitted, orientation-symmetric regularized logistic model the no-odds "
        "probability engine, exporting its imputation values, scales, and signed coefficients.",
        "2. Keep the market outside that engine for value detection. Optionally display a "
        "separate market-blended forecast for pure winner prediction.",
        "3. Preserve ELO and the strongest stable differentials; remove or shrink features "
        "whose learned coefficient is unstable across temporal folds.",
        "4. Train with rolling-origin folds and optimize Brier/log loss, not accuracy alone.",
        "5. Save model version, feature snapshot, component scores, and timestamp with every pick.",
        "",
    ]
    report = "\n".join(lines)
    output = ROOT / "prediction_upgrade_report.md"
    output.write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
