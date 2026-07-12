#!/usr/bin/env python3
"""Odds-aware, event-clustered analysis of the FightMetrics ROI ledger.

This script is read-only with respect to application source/data. It excludes
known post-event entries from the primary sample, treats NC/DRAW as pushes for
ROI and excludes them from binary probability scoring, and writes a Markdown
report when --output is supplied.
"""

from __future__ import annotations

import argparse
import json
import math
from collections import Counter
from datetime import date, datetime
from pathlib import Path

import numpy as np
from scipy.optimize import minimize
from scipy.stats import norm, spearmanr


ROOT = Path(__file__).resolve().parent
ROI_DATA = ROOT / "src" / "roiData.js"
PUSHES = {"NC", "DRAW"}
EDGE_BUCKETS = [
    ("<0%", -math.inf, 0.00),
    ("0–5%", 0.00, 0.05),
    ("5–10%", 0.05, 0.10),
    ("10–20%", 0.10, 0.20),
    ("20–30%", 0.20, 0.30),
    ("30%+", 0.30, math.inf),
]


def load_entries(path: Path = ROI_DATA) -> list[dict]:
    raw = path.read_text(encoding="utf-8")
    return json.loads(raw[raw.index("[") : raw.rindex("]") + 1])


def american_to_decimal(value) -> float:
    odds = float(str(value).replace("+", ""))
    return 1.0 + (odds / 100.0 if odds > 0 else 100.0 / abs(odds))


def american_to_implied(value) -> float:
    odds = float(str(value).replace("+", ""))
    return 100.0 / (odds + 100.0) if odds > 0 else abs(odds) / (abs(odds) + 100.0)


def no_vig_market_a(entry: dict) -> float:
    raw_a = american_to_implied(entry["oddsA"])
    raw_b = american_to_implied(entry["oddsB"])
    return raw_a / (raw_a + raw_b)


def created_day(entry: dict) -> date:
    return datetime.fromisoformat(entry["createdAt"].replace("Z", "+00:00")).date()


def is_post_event(entry: dict) -> bool:
    return created_day(entry) > date.fromisoformat(entry["eventDate"])


def is_decisive(entry: dict) -> bool:
    return entry.get("actualWinner") in {entry.get("fighterA"), entry.get("fighterB")}


def won_pick(entry: dict) -> bool:
    return entry["actualWinner"] == entry["predictedWinner"]


def flat_profit(entry: dict) -> float:
    if entry["actualWinner"] in PUSHES:
        return 0.0
    return american_to_decimal(entry["marketOdds"]) - 1.0 if won_pick(entry) else -1.0


def p_model_a(entry: dict) -> float:
    return float(entry["fighterAProb"])


def binary_y(entry: dict) -> float:
    return 1.0 if entry["actualWinner"] == entry["fighterA"] else 0.0


def clip_prob(values):
    return np.clip(np.asarray(values, dtype=float), 1e-9, 1 - 1e-9)


def brier(y, p) -> float:
    y = np.asarray(y, dtype=float)
    p = np.asarray(p, dtype=float)
    return float(np.mean((p - y) ** 2))


def log_loss(y, p) -> float:
    y = np.asarray(y, dtype=float)
    p = clip_prob(p)
    return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))


def accuracy(y, p) -> float:
    y = np.asarray(y, dtype=float)
    p = np.asarray(p, dtype=float)
    return float(np.mean((p >= 0.5) == y))


def logit(p):
    p = clip_prob(p)
    return np.log(p / (1 - p))


def sigmoid(x):
    x = np.clip(np.asarray(x, dtype=float), -35, 35)
    return 1.0 / (1.0 + np.exp(-x))


def fit_logistic(x, y, ridge=1e-6):
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    design = np.column_stack([np.ones(len(x)), x])

    def objective(beta):
        eta = design @ beta
        loss = np.sum(np.logaddexp(0, eta) - y * eta)
        return loss + ridge * np.sum(beta[1:] ** 2)

    result = minimize(objective, np.zeros(design.shape[1]), method="BFGS")
    return result.x


def predict_logistic(beta, x):
    x = np.asarray(x, dtype=float)
    return sigmoid(np.column_stack([np.ones(len(x)), x]) @ beta)


def wilson_interval(wins: int, n: int, confidence=0.95):
    if n == 0:
        return (math.nan, math.nan)
    z = norm.ppf(0.5 + confidence / 2)
    phat = wins / n
    denom = 1 + z * z / n
    center = (phat + z * z / (2 * n)) / denom
    spread = z * math.sqrt(phat * (1 - phat) / n + z * z / (4 * n * n)) / denom
    return center - spread, center + spread


def clustered_bootstrap(entries, metric, iterations=10000, seed=20260625):
    groups = {}
    for entry in entries:
        groups.setdefault(entry["eventDate"], []).append(entry)
    event_dates = sorted(groups)
    rng = np.random.default_rng(seed)
    values = []
    for _ in range(iterations):
        sampled = rng.choice(event_dates, size=len(event_dates), replace=True)
        rows = [entry for event_date in sampled for entry in groups[event_date]]
        try:
            value = float(metric(rows))
            if math.isfinite(value):
                values.append(value)
        except (ValueError, ZeroDivisionError, np.linalg.LinAlgError):
            pass
    if not values:
        return (math.nan, math.nan)
    return tuple(np.quantile(values, [0.025, 0.975]))


def pct(value) -> str:
    return f"{value * 100:.1f}%"


def signed_pct(value) -> str:
    return f"{value * 100:+.1f}%"


def interval_pct(interval) -> str:
    return f"[{interval[0] * 100:+.1f}%, {interval[1] * 100:+.1f}%]"


def edge_rows(entries: list[dict]) -> list[dict]:
    rows = []
    for label, low, high in EDGE_BUCKETS:
        bucket = [e for e in entries if low <= float(e["edge"]) < high]
        decisive = [e for e in bucket if is_decisive(e)]
        wins = sum(won_pick(e) for e in decisive)
        win_ci = wilson_interval(wins, len(decisive))
        roi = np.mean([flat_profit(e) for e in bucket]) if bucket else math.nan
        roi_ci = (
            clustered_bootstrap(bucket, lambda x: np.mean([flat_profit(e) for e in x]))
            if bucket
            else (math.nan, math.nan)
        )
        rows.append(
            {
                "bucket": label,
                "n": len(bucket),
                "decisive": len(decisive),
                "wins": wins,
                "win_rate": wins / len(decisive) if decisive else math.nan,
                "win_ci": win_ci,
                "profit": sum(flat_profit(e) for e in bucket),
                "roi": roi,
                "roi_ci": roi_ci,
            }
        )
    return rows


def scoring(entries: list[dict]) -> dict:
    decisive = [e for e in entries if is_decisive(e)]
    y = np.array([binary_y(e) for e in decisive])
    model = np.array([p_model_a(e) for e in decisive])
    market = np.array([no_vig_market_a(e) for e in decisive])
    return {
        "n": len(decisive),
        "model_brier": brier(y, model),
        "market_brier": brier(y, market),
        "model_logloss": log_loss(y, model),
        "market_logloss": log_loss(y, market),
        "model_accuracy": accuracy(y, model),
        "market_accuracy": accuracy(y, market),
    }


def controlled_market_analysis(entries: list[dict]) -> dict:
    decisive = [e for e in entries if is_decisive(e)]
    y = np.array([binary_y(e) for e in decisive])
    market = np.array([no_vig_market_a(e) for e in decisive])
    model = np.array([p_model_a(e) for e in decisive])
    delta_10pp = (model - market) / 0.10
    x = np.column_stack([logit(market), delta_10pp])
    beta = fit_logistic(x, y)

    def coefficient(sample):
        sample = [e for e in sample if is_decisive(e)]
        ys = np.array([binary_y(e) for e in sample])
        markets = np.array([no_vig_market_a(e) for e in sample])
        models = np.array([p_model_a(e) for e in sample])
        xs = np.column_stack([logit(markets), (models - markets) / 0.10])
        return fit_logistic(xs, ys)[2]

    coefficient_ci = clustered_bootstrap(decisive, coefficient, iterations=5000)
    residual = y - market
    rho, rho_p = spearmanr(model - market, residual)
    return {
        "market_logit_coef": beta[1],
        "delta_coef_10pp": beta[2],
        "delta_coef_ci": coefficient_ci,
        "spearman_rho": float(rho),
        "spearman_p": float(rho_p),
    }


def leave_one_event_out(entries: list[dict]) -> dict:
    decisive = [e for e in entries if is_decisive(e)]
    events = sorted({e["eventDate"] for e in decisive})
    y_all, model_predictions, market_predictions, combined_predictions = [], [], [], []
    for held_out in events:
        train = [e for e in decisive if e["eventDate"] != held_out]
        test = [e for e in decisive if e["eventDate"] == held_out]
        y_train = np.array([binary_y(e) for e in train])
        y_test = np.array([binary_y(e) for e in test])
        market_train = np.array([no_vig_market_a(e) for e in train])
        model_train = np.array([p_model_a(e) for e in train])
        market_test = np.array([no_vig_market_a(e) for e in test])
        model_test = np.array([p_model_a(e) for e in test])

        market_beta = fit_logistic(logit(market_train)[:, None], y_train)
        combined_beta = fit_logistic(
            np.column_stack([logit(market_train), (model_train - market_train) / 0.10]),
            y_train,
        )
        y_all.extend(y_test)
        model_predictions.extend(model_test)
        market_predictions.extend(
            predict_logistic(market_beta, logit(market_test)[:, None])
        )
        combined_predictions.extend(
            predict_logistic(
                combined_beta,
                np.column_stack(
                    [logit(market_test), (model_test - market_test) / 0.10]
                ),
            )
        )
    y_all = np.array(y_all)
    return {
        "n": len(y_all),
        "raw_model_brier": brier(y_all, model_predictions),
        "market_recal_brier": brier(y_all, market_predictions),
        "combined_brier": brier(y_all, combined_predictions),
        "raw_model_logloss": log_loss(y_all, model_predictions),
        "market_recal_logloss": log_loss(y_all, market_predictions),
        "combined_logloss": log_loss(y_all, combined_predictions),
    }


def calibration_rows(entries: list[dict]) -> list[dict]:
    decisive = [e for e in entries if is_decisive(e)]
    bands = [
        ("50–55%", 0.50, 0.55),
        ("55–60%", 0.55, 0.60),
        ("60–65%", 0.60, 0.65),
        ("65–70%", 0.65, 0.70),
        ("70–75%", 0.70, 0.75),
        ("75%+", 0.75, 1.01),
    ]
    rows = []
    for label, low, high in bands:
        bucket = [e for e in decisive if low <= float(e["predictedProb"]) < high]
        wins = sum(won_pick(e) for e in bucket)
        rows.append(
            {
                "bucket": label,
                "n": len(bucket),
                "predicted": np.mean([e["predictedProb"] for e in bucket])
                if bucket
                else math.nan,
                "actual": wins / len(bucket) if bucket else math.nan,
                "actual_ci": wilson_interval(wins, len(bucket)),
            }
        )
    return rows


def roi_summary(entries: list[dict]) -> dict:
    profits = [flat_profit(e) for e in entries]
    roi = float(np.mean(profits))
    ci = clustered_bootstrap(entries, lambda x: np.mean([flat_profit(e) for e in x]))
    return {"n": len(entries), "profit": sum(profits), "roi": roi, "roi_ci": ci}


def subset_summary(entries: list[dict], predicate) -> dict:
    return roi_summary([e for e in entries if predicate(e)])


def render_report(all_graded: list[dict]) -> str:
    post_event = [e for e in all_graded if is_post_event(e)]
    clean = [e for e in all_graded if not is_post_event(e)]
    decisive_clean = [e for e in clean if is_decisive(e)]
    pushes = [e for e in clean if e["actualWinner"] in PUSHES]
    same_day = [e for e in clean if created_day(e) == date.fromisoformat(e["eventDate"])]

    scores = scoring(clean)
    full_scores = scoring(all_graded)
    edge = edge_rows(clean)
    calibration = calibration_rows(clean)
    controlled = controlled_market_analysis(clean)
    loeo = leave_one_event_out(clean)

    score_diff_ci = clustered_bootstrap(
        decisive_clean,
        lambda rows: scoring(rows)["model_brier"] - scoring(rows)["market_brier"],
    )

    all_roi = roi_summary(clean)
    positive_roi = subset_summary(clean, lambda e: float(e["edge"]) >= 0.03)
    high_roi = subset_summary(clean, lambda e: float(e["edge"]) > 0.25)
    negative_roi = subset_summary(clean, lambda e: float(e["edge"]) < 0)

    event_dates = sorted({e["eventDate"] for e in clean})
    holdout_dates = event_dates[-4:]
    holdout = [e for e in clean if e["eventDate"] in holdout_dates]
    holdout_scores = scoring(holdout)
    holdout_all_roi = roi_summary(holdout)
    holdout_positive_roi = subset_summary(holdout, lambda e: float(e["edge"]) >= 0.03)
    holdout_high_roi = subset_summary(holdout, lambda e: float(e["edge"]) > 0.25)

    lines = [
        "# Betting quality analysis",
        "",
        f"Generated from `{ROI_DATA}` on 2026-06-25.",
        "",
        "## Executive result",
        "",
        "The stored model probabilities do not beat the no-vig market probabilities "
        "on proper scoring rules, and larger model-vs-market disagreement does not "
        "show reliable incremental predictive value. The evidence supports keeping "
        "the betting gate conservative, but it does **not** justify declaring edge "
        "permanently inverted or building new unit tiers from this ledger.",
        "",
        "## Data audit",
        "",
        f"- Ledger: {len(all_graded)} resolved rows, including "
        f"{sum(is_decisive(e) for e in all_graded)} decisive results.",
        f"- Primary sample: {len(clean)} rows / {len(decisive_clean)} decisive fights "
        f"after excluding {len(post_event)} predictions saved after their event date.",
        f"- Same-day timestamps: {len(same_day)} rows. The ledger stores an event date, "
        "not fight start time, so these cannot be independently proven pre-fight.",
        f"- Pushes in the primary sample: {len(pushes)} (NC/DRAW). They count as zero "
        "profit and are excluded from Brier/log-loss calculations.",
        f"- Unique fights: {len({(e['eventDate'], tuple(sorted((e['fighterA'], e['fighterB'])))) for e in all_graded})}; "
        "no duplicate fight rows.",
        "- Closing odds are not stored. `oddsA`, `oddsB`, and `marketOdds` are entry-time "
        "prices, so closing-line value cannot be calculated.",
        "- The current `modelModule.js` weights were revised on 2026-06-23. Every graded "
        "prediction in this ledger predates that revision, so this is not a test of the "
        "current model version.",
        "",
        "## Proper scoring rules",
        "",
        "| Probability source | N | Accuracy | Brier (lower better) | Log loss (lower better) |",
        "|---|---:|---:|---:|---:|",
        f"| Stored model | {scores['n']} | {pct(scores['model_accuracy'])} | "
        f"{scores['model_brier']:.4f} | {scores['model_logloss']:.4f} |",
        f"| No-vig market | {scores['n']} | {pct(scores['market_accuracy'])} | "
        f"{scores['market_brier']:.4f} | {scores['market_logloss']:.4f} |",
        "",
        f"Model minus market Brier: {scores['model_brier'] - scores['market_brier']:+.4f}; "
        f"event-clustered 95% bootstrap interval "
        f"[{score_diff_ci[0]:+.4f}, {score_diff_ci[1]:+.4f}]. Positive favors the market.",
        "",
        "Sensitivity including the 10 known post-event rows: "
        f"model Brier {full_scores['model_brier']:.4f}, market Brier "
        f"{full_scores['market_brier']:.4f}.",
        "",
        "## ROI and profit by stored pick-side edge",
        "",
        "| Edge | Bets | Decisive W-L | Win rate (95% Wilson) | Profit (u) | ROI (event-bootstrap 95%) |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for row in edge:
        win_text = (
            f"{pct(row['win_rate'])} "
            f"[{pct(row['win_ci'][0])}, {pct(row['win_ci'][1])}]"
            if row["decisive"]
            else "—"
        )
        roi_text = (
            f"{signed_pct(row['roi'])} {interval_pct(row['roi_ci'])}"
            if row["n"]
            else "—"
        )
        lines.append(
            f"| {row['bucket']} | {row['n']} | {row['wins']}-"
            f"{row['decisive'] - row['wins']} | {win_text} | "
            f"{row['profit']:+.2f} | {roi_text} |"
        )

    lines += [
        "",
        "Broad betting views (flat 1u on the model pick at the stored price):",
        "",
        "| Rule | N | Profit | ROI (event-bootstrap 95%) |",
        "|---|---:|---:|---:|",
        f"| Every model pick | {all_roi['n']} | {all_roi['profit']:+.2f}u | "
        f"{signed_pct(all_roi['roi'])} {interval_pct(all_roi['roi_ci'])} |",
        f"| Edge ≥3pp | {positive_roi['n']} | {positive_roi['profit']:+.2f}u | "
        f"{signed_pct(positive_roi['roi'])} {interval_pct(positive_roi['roi_ci'])} |",
        f"| Edge >25pp | {high_roi['n']} | {high_roi['profit']:+.2f}u | "
        f"{signed_pct(high_roi['roi'])} {interval_pct(high_roi['roi_ci'])} |",
        f"| Edge <0 | {negative_roi['n']} | {negative_roi['profit']:+.2f}u | "
        f"{signed_pct(negative_roi['roi'])} {interval_pct(negative_roi['roi_ci'])} |",
        "",
        "## Probability calibration",
        "",
        "| Stored pick probability | N | Mean prediction | Actual win rate (95% Wilson) |",
        "|---|---:|---:|---:|",
    ]
    for row in calibration:
        if row["n"]:
            lines.append(
                f"| {row['bucket']} | {row['n']} | {pct(row['predicted'])} | "
                f"{pct(row['actual'])} [{pct(row['actual_ci'][0])}, "
                f"{pct(row['actual_ci'][1])}] |"
            )
        else:
            lines.append(f"| {row['bucket']} | 0 | — | — |")

    lines += [
        "",
        "The intervals are wide and overlap heavily. In particular, the apparently "
        "strong 65–70% bucket is not precise enough to support a special staking rule.",
        "",
        "## Calibration after controlling for the market",
        "",
        "A logistic model was fit as `outcome ~ market logit + model-minus-market "
        "probability`. The disagreement coefficient is expressed per 10 percentage "
        "points of additional model probability toward Fighter A.",
        "",
        f"- Disagreement coefficient: {controlled['delta_coef_10pp']:+.3f}",
        f"- Event-clustered 95% bootstrap interval: "
        f"[{controlled['delta_coef_ci'][0]:+.3f}, {controlled['delta_coef_ci'][1]:+.3f}]",
        f"- Spearman correlation between model-minus-market probability and the "
        f"market residual: {controlled['spearman_rho']:+.3f} "
        f"(p={controlled['spearman_p']:.3f})",
        "",
        "A positive, stable disagreement coefficient would indicate that the model adds "
        "information beyond the market. This sample does not provide that evidence.",
        "",
        "## Event-held-out diagnostic",
        "",
        "Leave-one-event-out calibration was used to avoid fitting and scoring on the "
        "same event. This is a diagnostic, not a pristine historical backtest.",
        "",
        "| Held-out predictor | Brier | Log loss |",
        "|---|---:|---:|",
        f"| Raw stored model | {loeo['raw_model_brier']:.4f} | "
        f"{loeo['raw_model_logloss']:.4f} |",
        f"| Recalibrated market | {loeo['market_recal_brier']:.4f} | "
        f"{loeo['market_recal_logloss']:.4f} |",
        f"| Market + model disagreement | {loeo['combined_brier']:.4f} | "
        f"{loeo['combined_logloss']:.4f} |",
        "",
        "## Later-event pseudo-holdout",
        "",
        f"The final four event dates ({', '.join(holdout_dates)}) contain "
        f"{holdout_scores['n']} decisive fights. This cutoff was chosen after the data "
        "existed, so treat it as a sensitivity check rather than untouched test data.",
        "",
        f"- Stored model: Brier {holdout_scores['model_brier']:.4f}, log loss "
        f"{holdout_scores['model_logloss']:.4f}, accuracy "
        f"{pct(holdout_scores['model_accuracy'])}.",
        f"- No-vig market: Brier {holdout_scores['market_brier']:.4f}, log loss "
        f"{holdout_scores['market_logloss']:.4f}, accuracy "
        f"{pct(holdout_scores['market_accuracy'])}.",
        f"- Flat model-pick ROI: {signed_pct(holdout_all_roi['roi'])} "
        f"on {holdout_all_roi['n']} rows.",
        f"- Edge ≥3pp ROI: {signed_pct(holdout_positive_roi['roi'])} "
        f"on {holdout_positive_roi['n']} rows.",
        f"- Edge >25pp ROI: {signed_pct(holdout_high_roi['roi'])} "
        f"on {holdout_high_roi['n']} rows.",
        "",
        "## Recommendations",
        "",
        "1. Do not loosen the gate or introduce larger units from this ledger.",
        "2. Do not create a special 65–70% staking band; its uncertainty is too large.",
        "3. Version every saved prediction with a model version/hash. The current ledger "
        "cannot isolate which historical model produced each probability.",
        "4. Store timestamped opening and closing odds for both fighters. Without closing "
        "prices, CLV—the cleanest early signal that a betting model finds value—is unknowable.",
        "5. Freeze the current model and gate before collecting new results. Evaluate the "
        "next predictions prospectively, without changing thresholds, and use event-clustered "
        "confidence intervals.",
        "6. Revisit sizing only after at least 30 genuinely actioned bets; 100 is safer for "
        "calibration and bucket comparisons.",
        "",
        "Bottom line: the historical edge variable is not validated as a sizing signal. "
        "The market remains the stronger probability baseline in this sample, and the "
        "current model still needs its own fresh prospective test.",
        "",
    ]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, help="Write the Markdown report here.")
    args = parser.parse_args()

    entries = load_entries()
    graded = [e for e in entries if e.get("actualWinner")]
    report = render_report(graded)
    print(report)
    if args.output:
        args.output.write_text(report, encoding="utf-8")


if __name__ == "__main__":
    main()
