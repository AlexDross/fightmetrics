# Bet-gate backtest and recommendation — 2026-10-02

> **Superseded (2026-10-03).** This first-pass recommendation (bet every C6 pick
> with EV ≥ 2%) was replaced by the v3 underdog gate: BET only when C6 picks the
> market underdog, LEAN on paper otherwise, frozen as a paper experiment. See
> `src/domain/betting/gateV3.js` and `underdogs.py` / `robustness.py` here. The
> numbers below are exploratory: v2's coefficients overlap the history and the
> rule was chosen after looking at these results.

**Verdict:** replace the current C6 bet ladder with one rule: **bet C6's pick, flat 1u, when EV ≥ 2% and the price is between −400 and +200.** On out-of-sample history it returned +13% ROI on 330 bets. On the 110 fights you captured live it returned +7.4% on 39 bets. That live result is encouraging, but it doesn't prove an edge yet. Ship the rule with a kill switch.

Reproduce: `node export_live.mjs > live_holdout.csv && python3 backtest.py > results.json && python3 followup.py`

## Data

| Set | Rows | What it is | Trust |
|---|---|---|---|
| History | 2,488 eligible (2,281 scored out-of-fold, 2020-01 → 2026-03) | Point-in-time v2 + one odds snapshot per fight (August audit replay, 0 leakage violations in the features) | Medium. v2's *coefficients* were fit on overlapping years, so the history flatters v2. Odds timing is unspecified. |
| Live holdout | 110 live-captured graded fights (2026-05-23 → 09-26) | Your real saved picks, production C6, stored prices | High, but small. No overlap with history. |
| Live + reconstructed | 152 | Adds 42 after-the-fact reconstructions | Secondary only. |

C6 was refit each year on prior years only (zero-intercept, the same form as production). Out-of-fold Brier score (lower is better): C6 0.2075, market 0.2100, v2 0.2234. **Live Brier: C6 0.2041, market 0.2041.** Live, C6 is exactly as calibrated as the market and no better.

## Correction to my earlier review

- The −39% on LEAN bets was mostly the **old raw-v2 gate**: 13 of the 16 LEANs were v2-era. Under C6, the current gate barely fires. It made 5 bets in 110 live fights (−0.04u). Historically it made 29 bets in six years (+29% ROI). The problem with the current C6 gate is **volume**, not losses.
- I suggested letting the gate bet either side. The data says no for now. Bets on C6's *underdog* added +11.6% ROI historically, but they doubled the drawdown, and they lost live (2-4, −0.46u).

## What the backtest shows

**Price cap is the most stable lever.** Betting at EV ≥ 4% on either side:

| Longest price allowed | Bets | ROI | Max drawdown |
|---|---|---|---|
| +100 | 193 | +13.1% | 5.4u |
| **+200** | 353 | **+14.2%** | 10.2u |
| +400 | 442 | +9.8% | 19.9u |
| none | 465 | +8.6% | 22.4u |

Every walk-forward fold independently chose the +200 cap. A cap on heavy favorites (−250 / −400) changed almost nothing.

**Betting only C6's pick beats betting either side on risk.** At EV ≥ 4%, pick-side made 217 bets at +14.2% with a 5.2u max drawdown. Either-side made 465 bets at +8.6% with a 22.4u drawdown.

**Honest estimate (walk-forward):** for each year 2022–2026, I tuned the rule on prior years only and then bet the next year. That returned **+8.5% ROI on 569 bets**, with a 90% range of +3% to +14% and a 99.5% bootstrap probability of being positive. This is the number to believe for history, not the best row in the grid.

**Bigger EV does not mean better bets.** ROI on the pick-side bets, by EV band:

| EV band | History | Live |
|---|---|---|
| 0–4% | +7.9% (312) | +36.6% (11) |
| 4–8% | +11.9% (133) | +35.7% (11) |
| 8–12% | +6.5% (43) | −4.7% (13) |
| 12%+ | +31.7% (35) | −12.6% (10) |

C6 puts 92% weight on the market's logit plus 55% on v2's. The total is more than 1, so large disagreements with the market get exaggerated. **Don't tier stakes by EV, and don't use Kelly.** Quarter-Kelly lost money live on every candidate (for example, rule A went from +1.6u flat to −1.8u Kelly).

**Where the money comes from.** Pick-side bets (EV ≥ 4% rule) where C6's pick is the market *underdog*: history +44.7% (33 bets), live +31% (8 bets). Bets where C6 agrees with the market favorite: history +8.4%, live −1.7% (26 bets). The model earns its keep when it backs a slight underdog it rates as the better fighter.

## Recommended rule

| | Current (C6) | Recommended |
|---|---|---|
| Side | C6 pick | C6 pick (unchanged) |
| Trigger | 60–70% bands, edge ≥ 10–25pp, heavy-fav ceiling | **EV = p × decimal − 1 ≥ 2%** |
| Price window | heavy favorites effectively barred | **−400 to +200** |
| Tiers | LEAN / BET / STRONG BET | **one tier: BET** |
| Stake | 1u default | **1u flat** |
| Volume | ~0.05 bets per fight | ~3 bets per card (live) |

| Results | Bets | W–L | Units | ROI | 90% range |
|---|---|---|---|---|---|
| History, out-of-fold | 330 | 232–98 | +43.6 | +13.2% | +6% … +20% |
| Live holdout | 39 | 26–13 | +2.9 | +7.4% | −6% … +25% (81% positive) |
| Current gate, live | 5 | 3–2 | −0.04 | −0.9% | — |

Caveat on the rule: the 2% threshold sits between the two pick-side settings I tested in advance (0% from the walk-forward, 4% from candidate C), and I picked it after seeing results. Everything from 0% to 4% performs similarly. The 2% buffer is there because your odds are captured days before the fight.

## Risks to keep in view

1. **Edge is decaying in history.** Rule ROI by year: 2022 +27%, 2023 +19%, 2024 +13%, 2025 +5%, 2026 (partial) +10%. This is consistent with v2's in-sample advantage on older years, a sharper market, or both. Expect single digits.
2. **Live calibration is no better than the market's.** The profit live comes from a handful of disagreement bets.
3. **Price timing.** The EV is computed at capture-time odds. A line that moves against you can erase a 2% edge.

## Implementation plan

1. **Gate.** In `src/domain/betting/marketCore.js`, add an EV-rule path used only when the decision source is C6. Leave the raw v1/v2 ladder untouched. Keep the existing invariants (`bestBet !== null ⇒ betAction !== 'NO BET'`). Put the thresholds in one frozen constants object.
2. **Versioning.** Stamp each new entry with a `gateVersion` (e.g. `c6_ev2_pick_v1`) so Statistics can separate old-gate from new-gate results. Never regrade old entries.
3. **"Bet at or better" price.** On every BET card, show the worst odds that still clear the rule: decimal ≥ 1.02 / p, also capped by the price window. On fight day you can check one number against the book.
4. **Statistics headline.** Make "Recommended bets: ROI, W–L, units, since gate change" the first number. Show it next to "every C6 pick" and "every market favorite" baselines. Move "all picks flat" lower on the page.
5. **Tests.** Add boundary tests for EV = 2% ± ε, for +200 and −400 at the edges, and for a market-underdog pick inside the window. Update the golden fixtures deliberately.
6. **Kill switch.** Turn the rule off if it falls **below −10% after 40 bets or below −5% after 80**. At about 3 bets per card, 80 bets is roughly 6 months. Review at the same points whether to let the rule bet C6's underdog (paper-track it until then).
