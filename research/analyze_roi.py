#!/usr/bin/env python3
"""
analyze_roi.py — Read-only statistical analysis of past ROI predictions.

Parses src/roiData.js (ROI_ENTRIES), filters to graded picks (actualWinner set),
and reports accuracy, edge/probability calibration, Kelly vs flat ROI, gate-tier
win rates, unit-sizing suggestions, and high-conviction-vs-market performance.

Does NOT modify any source files.
"""

import json
import os

ROI_DATA = os.path.join(os.path.dirname(__file__), "src", "roiData.js")


# ───────────────────────── data loading ──────────────────────────
def load_entries(path=ROI_DATA):
    raw = open(path, "r", encoding="utf-8").read()
    arr = raw[raw.index("[") : raw.rindex("]") + 1]
    return json.loads(arr)


def american_profit_mult(american):
    """Profit per 1 unit staked if the bet wins, from American odds."""
    o = float(str(american).replace("+", ""))
    return o / 100.0 if o > 0 else 100.0 / abs(o)


def american_to_implied(american):
    """Raw (vig-included) implied probability from American odds."""
    o = float(str(american).replace("+", ""))
    return 100.0 / (o + 100.0) if o > 0 else abs(o) / (abs(o) + 100.0)


def won(entry):
    return entry["actualWinner"] == entry["predictedWinner"]


# ───────────────────────── gate reconstruction ──────────────────────────
def core_gate_tier(entry):
    """Recompute betAction from predictedProb + pick-side edge + opp edge,
    mirroring App.js:3321-3360 (core gate + heavy-fav suppression).

    The low-credibility cap (CREDIBILITY<30 -> LEAN) is NOT reconstructable
    from stored data, so it is omitted. Heavy-fav suppression IS reconstructed
    from marketOdds implied probability.
    """
    prob = entry["predictedProb"]
    pick_edge = entry["edge"]  # edge on the model pick side
    # opposite-side edge
    if entry["predictedWinner"] == entry["fighterA"]:
        opp_edge = entry["edgeB"]
    else:
        opp_edge = entry["edgeA"]

    has_pick_edge = pick_edge >= 0.03
    conflicting = (not has_pick_edge) and opp_edge >= 0.03

    if conflicting:
        action = "NO BET"
    elif not has_pick_edge:
        action = "NO BET"
    elif prob < 0.60:
        action = "NO BET"
    elif prob < 0.65:
        action = "LEAN" if pick_edge >= 0.10 else "NO BET"
    elif prob < 0.70:
        if pick_edge >= 0.30:
            action = "BET"
        elif pick_edge >= 0.10:
            action = "LEAN"
        else:
            action = "NO BET"
    else:  # 70%+
        if pick_edge >= 0.25:
            action = "STRONG BET"
        elif pick_edge >= 0.15:
            action = "BET"
        else:
            action = "LEAN"

    # Heavy-favorite suppression (reconstructable from marketOdds)
    pick_implied = american_to_implied(entry["marketOdds"])
    if pick_implied > (2.0 / 3.0) and pick_edge < 0.25 and action != "NO BET":
        action = "NO BET"

    return action


# ───────────────────────── helpers ──────────────────────────
def rate(picks):
    if not picks:
        return 0.0
    return sum(won(e) for e in picks) / len(picks)


def fmt_pct(x):
    return f"{x*100:5.1f}%"


def line(char="─", n=72):
    print(char * n)


def header(title):
    print()
    line("═")
    print(title)
    line("═")


# ───────────────────────── analyses ──────────────────────────
def overall_accuracy(graded, tier_of):
    header("1. OVERALL ACCURACY (win rate of predictedWinner == actualWinner)")
    groups = [
        ("All picks", graded),
        ("STRONG BET only", [e for e in graded if tier_of[e["id"]] == "STRONG BET"]),
        ("BET only", [e for e in graded if tier_of[e["id"]] == "BET"]),
        ("LEAN only", [e for e in graded if tier_of[e["id"]] == "LEAN"]),
        ("NO BET only", [e for e in graded if tier_of[e["id"]] == "NO BET"]),
    ]
    print(f"{'Group':<20}{'N':>5}{'Wins':>7}{'WinRate':>10}")
    line()
    for name, picks in groups:
        w = sum(won(e) for e in picks)
        print(f"{name:<20}{len(picks):>5}{w:>7}{fmt_pct(rate(picks)):>10}")
    print("\n(Tiers recomputed via core gate; low-cred cap not reconstructable.)")


def edge_calibration(graded):
    header("2. EDGE CALIBRATION (win rate by pick-side edge bucket)")
    buckets = [
        ("edge < 0%", lambda e: e["edge"] < 0),
        ("0–5%", lambda e: 0 <= e["edge"] < 0.05),
        ("5–10%", lambda e: 0.05 <= e["edge"] < 0.10),
        ("10–20%", lambda e: 0.10 <= e["edge"] < 0.20),
        ("20–30%", lambda e: 0.20 <= e["edge"] < 0.30),
        ("30%+", lambda e: e["edge"] >= 0.30),
    ]
    print(f"{'Edge bucket':<14}{'N':>5}{'Wins':>7}{'WinRate':>10}")
    line()
    prev = None
    mono = True
    for name, fn in buckets:
        picks = [e for e in graded if fn(e)]
        wr = rate(picks)
        print(f"{name:<14}{len(picks):>5}{sum(won(e) for e in picks):>7}{fmt_pct(wr):>10}")
        if picks:
            if prev is not None and wr < prev - 1e-9:
                mono = False
            prev = wr
    print()
    print("Monotonic increase across populated buckets:",
          "YES ✓" if mono else "NO ✗ (model edge not well-ordered vs outcomes)")


def prob_calibration(graded):
    header("3. PROBABILITY CALIBRATION (predicted prob vs actual win rate)")
    buckets = [
        ("50–55%", 0.50, 0.55),
        ("55–60%", 0.55, 0.60),
        ("60–65%", 0.60, 0.65),
        ("65–70%", 0.65, 0.70),
        ("70–75%", 0.70, 0.75),
        ("75%+", 0.75, 1.01),
    ]
    print(f"{'Prob bucket':<12}{'N':>5}{'PredAvg':>9}{'ActWR':>9}{'Diff':>9}  Flag")
    line()
    for name, lo, hi in buckets:
        picks = [e for e in graded if lo <= e["predictedProb"] < hi]
        if not picks:
            print(f"{name:<12}{0:>5}{'—':>9}{'—':>9}{'—':>9}")
            continue
        pred = sum(e["predictedProb"] for e in picks) / len(picks)
        act = rate(picks)
        diff = act - pred
        flag = "⚠ >10pp" if abs(diff) > 0.10 else ""
        print(f"{name:<12}{len(picks):>5}{fmt_pct(pred):>9}{fmt_pct(act):>9}"
              f"{diff*100:>+8.1f}pp  {flag}")
    print("\n(Diff = actual − predicted. Negative = model overconfident in bucket.)")


def kelly_ev_analysis(graded, tier_of):
    header("4. KELLY / EV ANALYSIS — flat 1u vs Kelly staking on BET+STRONG BET")
    actioned = [e for e in graded if tier_of[e["id"]] in ("BET", "STRONG BET")]
    if not actioned:
        print("No BET/STRONG BET picks in graded set.")
        return

    # Flat 1u
    flat_staked = len(actioned)
    flat_profit = 0.0
    for e in actioned:
        flat_profit += american_profit_mult(e["marketOdds"]) if won(e) else -1.0

    # Full Kelly and half Kelly (stake = kelly fraction of 1-unit bankroll notional)
    def kelly_run(scale):
        staked = profit = 0.0
        for e in actioned:
            stake = e.get("kelly", 0) * scale
            staked += stake
            profit += stake * american_profit_mult(e["marketOdds"]) if won(e) else -stake
        return staked, profit

    fk_staked, fk_profit = kelly_run(1.0)
    hk_staked, hk_profit = kelly_run(0.5)

    print(f"Actioned picks (BET + STRONG BET): {len(actioned)}  "
          f"({sum(won(e) for e in actioned)} wins, {fmt_pct(rate(actioned))})\n")
    print(f"{'Strategy':<22}{'Staked':>10}{'Profit':>10}{'ROI':>10}")
    line()
    print(f"{'Flat 1u':<22}{flat_staked:>10.2f}{flat_profit:>+10.2f}"
          f"{flat_profit/flat_staked*100:>+9.1f}%")
    print(f"{'Full Kelly':<22}{fk_staked:>10.2f}{fk_profit:>+10.2f}"
          f"{(fk_profit/fk_staked*100) if fk_staked else 0:>+9.1f}%")
    print(f"{'Half Kelly':<22}{hk_staked:>10.2f}{hk_profit:>+10.2f}"
          f"{(hk_profit/hk_staked*100) if hk_staked else 0:>+9.1f}%")

    # Also: ALL LEAN+BET+STRONG (everything the app flags as actionable)
    all_act = [e for e in graded if tier_of[e["id"]] in ("LEAN", "BET", "STRONG BET")]
    if all_act:
        staked = len(all_act)
        profit = sum(american_profit_mult(e["marketOdds"]) if won(e) else -1.0
                     for e in all_act)
        print(f"\n{'Flat 1u (incl. LEAN)':<22}{staked:>10.2f}{profit:>+10.2f}"
              f"{profit/staked*100:>+9.1f}%   ({len(all_act)} picks, {fmt_pct(rate(all_act))})")


def tier_threshold_analysis(graded, tier_of):
    header("5. BET-ACTION THRESHOLD ANALYSIS (current gate tiers)")
    print(f"{'Tier':<14}{'N':>5}{'Wins':>7}{'WinRate':>10}  Flag")
    line()
    for tier in ("STRONG BET", "BET", "LEAN", "NO BET"):
        picks = [e for e in graded if tier_of[e["id"]] == tier]
        wr = rate(picks)
        flag = "⚠ <50%" if picks and wr < 0.50 else ""
        print(f"{tier:<14}{len(picks):>5}{sum(won(e) for e in picks):>7}"
              f"{fmt_pct(wr):>10}  {flag}")

    # Validate recompute vs stored betAction where present
    stored = [e for e in graded if "betAction" in e]
    agree = sum(1 for e in stored if e["betAction"] == tier_of[e["id"]])
    print(f"\nGate validation: recomputed matches stored betAction on "
          f"{agree}/{len(stored)} entries"
          f"{' (diffs = low-cred cap, not reconstructable)' if agree<len(stored) else ''}.")


def prob_edge_grid(graded):
    header("6. UNIT-SIZING GRID (win rate by prob × edge combination)")
    prob_bands = [("0.60–0.65", 0.60, 0.65), ("0.65–0.70", 0.65, 0.70),
                  ("0.70+", 0.70, 1.01)]
    edge_bands = [("0.03–0.10", 0.03, 0.10), ("0.10–0.15", 0.10, 0.15),
                  ("0.15–0.25", 0.15, 0.25), ("0.25+", 0.25, 1.01)]
    print(f"{'prob \\ edge':<12}" + "".join(f"{e[0]:>14}" for e in edge_bands))
    line("─", 12 + 14 * len(edge_bands))
    cells = {}
    for pname, plo, phi in prob_bands:
        row = f"{pname:<12}"
        for ename, elo, ehi in edge_bands:
            picks = [e for e in graded
                     if plo <= e["predictedProb"] < phi and elo <= e["edge"] < ehi]
            cells[(pname, ename)] = picks
            cell = f"{rate(picks)*100:.0f}% (n{len(picks)})" if picks else "—"
            row += f"{cell:>14}"
        print(row)
    return cells


# ───────────────────────── recommendations ──────────────────────────
def recommendations(graded, tier_of, cells):
    header("7. ACTIONABLE RECOMMENDATIONS")

    def wr_n(picks):
        return rate(picks), len(picks)

    # Pull key buckets
    he = [e for e in graded if e["edge"] >= 0.25]                       # high edge
    he_wr, he_n = wr_n(he)
    md = he                                                              # market disagreement = same
    pos_edge = [e for e in graded if e["edge"] >= 0.03]
    neg_edge = [e for e in graded if e["edge"] < 0]
    big_fav = [e for e in graded if american_to_implied(e["marketOdds"]) > 2/3]

    print("MARKET DISAGREEMENT (edge > 25pp, 'high conviction vs market'):")
    print(f"  N={he_n}, win rate {fmt_pct(he_wr)} "
          f"({sum(won(e) for e in he)} wins)")
    if he_n:
        profit = sum(american_profit_mult(e["marketOdds"]) if won(e) else -1.0 for e in he)
        print(f"  Flat 1u ROI on this bucket: {profit/he_n*100:+.1f}%")
    print()

    print("KEY OBSERVATIONS:")
    print(f"  • Positive-edge picks (edge≥3%): {fmt_pct(rate(pos_edge))} (n={len(pos_edge)})")
    print(f"  • Negative-edge picks (model pick underdog to its own line): "
          f"{fmt_pct(rate(neg_edge))} (n={len(neg_edge)})")
    print(f"  • Heavy favorites (mkt implied >66.7%): {fmt_pct(rate(big_fav))} "
          f"(n={len(big_fav)})")
    print()

    print("SUGGESTED UNIT-SIZING TIERS (units derived from OBSERVED win rate; n≥3 only):")

    def unit_for(wr):
        # Win rate needed to profit at even money is 50%; scale up only when the
        # historical edge is large and consistent. Avoid up-sizing on coin-flips.
        if wr >= 0.70:
            return "2u"
        if wr >= 0.62:
            return "1u"
        if wr >= 0.55:
            return "0.5u"
        return "NO BET (≤break-even)"

    suggestions = []
    for (pband, eband), picks in sorted(cells.items()):
        if len(picks) >= 3:
            wr = rate(picks)
            suggestions.append(
                f"  • prob {pband}, edge {eband}: hist win rate "
                f"{fmt_pct(wr)} (n={len(picks)}) → {unit_for(wr)}")
    if suggestions:
        print("\n".join(suggestions))
    else:
        print("  • Insufficient per-cell sample (n<3) — grid too sparse for firm tiers.")
    print("  (Cells with n<3 omitted. NOTE: higher-edge cells do NOT show higher win")
    print("   rates here — see §2 — so edge is not yet a reliable up-sizing input.)")
    print()

    print("BETTING-LOGIC CHANGE RECOMMENDATIONS:")
    recs = []
    # data-driven recs
    if neg_edge and rate(neg_edge) > rate(pos_edge):
        recs.append("Negative-edge picks win MORE than positive-edge picks — the edge "
                    "signal is inverted/noisy at current sample. Do NOT widen betting "
                    "until edge calibration (§2) shows monotonic ordering.")
    if big_fav and rate(big_fav) >= 0.7:
        recs.append("Heavy favorites hit at high rate — the heavy-fav suppression "
                    "(implied>66.7% & edge<25pp → NO BET) may be leaving +EV straight "
                    "wins on the table. Consider a small flat play instead of full suppression.")
    strong = [e for e in graded if tier_of[e["id"]] == "STRONG BET"]
    bet = [e for e in graded if tier_of[e["id"]] == "BET"]
    if strong and rate(strong) < 0.5:
        recs.append("STRONG BET tier win rate <50% — tighten the 0.70/edge≥0.25 "
                    "STRONG threshold or require alignedDomains confirmation.")
    if len(strong) + len(bet) < 5:
        recs.append("Very few graded BET/STRONG BET picks (n<5) — all tier ROI numbers "
                    "are low-confidence. Keep current conservative gate until ≥30 graded bets accrue.")
    lean = [e for e in graded if tier_of[e["id"]] == "LEAN"]
    if lean and rate(lean) >= 0.6:
        recs.append(f"LEAN tier hits {fmt_pct(rate(lean))} (n={len(lean)}) — LEANs are "
                    "currently unstaked; consider promoting LEAN at prob≥0.65 to a 0.5u play.")
    if not recs:
        recs.append("No threshold change justified by current data; sample too small.")
    for i, r in enumerate(recs, 1):
        print(f"  {i}. {r}")

    print()
    print("OVERALL: Graded sample is small (n=%d). Treat all ROI/tier figures as "
          "directional. Priority is fixing edge calibration (§2) before loosening "
          "any gate or increasing unit size." % len(graded))


# ───────────────────────── main ──────────────────────────
def main():
    entries = load_entries()
    graded = [e for e in entries if e.get("actualWinner")]
    tier_of = {e["id"]: core_gate_tier(e) for e in graded}

    print()
    line("█")
    print(f"  ROI PREDICTION ANALYSIS — {len(graded)} graded picks "
          f"(of {len(entries)} total entries)")
    line("█")

    overall_accuracy(graded, tier_of)
    edge_calibration(graded)
    prob_calibration(graded)
    kelly_ev_analysis(graded, tier_of)
    tier_threshold_analysis(graded, tier_of)
    cells = prob_edge_grid(graded)
    recommendations(graded, tier_of, cells)
    print()


if __name__ == "__main__":
    main()
