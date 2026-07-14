# Code Health Audit — Read-Only

**Date:** 2026-07-13
**Type:** Report-only. No file was modified, deleted, or refactored. The untouchable
set (`W_OD`, `PLATT_NO`, `PLATT_OD`, `SCALES`, `eloModule.js`, `cardioModule.js`,
`backtest_combo_v2.py`) was read for reference only; nothing below proposes changing
any of their internal values — only whether they are correctly wired in or out of
the live path. Every recommendation is a recommendation for Alex to approve
separately, never an action taken.

**Method:** live model code in `src/App.js` traced end-to-end (composite → sigmoid →
v2 logistic → market/edge/kelly → ROI/Upcoming save); all call sites grepped
including Python generators, GitHub Actions workflows, and cross-file imports; the
four settled prior reports (`v2_calibration_audit.md`, `v2_recalibration_test.md`,
`daysSinceLast_live_audit.md`, `source_integrity_audit.md`) referenced and their
conclusions checked against current code rather than re-derived.

---

## Top-line summary

| Bucket | Findings |
|---|---|
| 1 — Dead code | 4 |
| 2 — Redundant / conflicting logic | 1 defect (+1 known-risk **verified clean**) |
| 3 — Stale / zombie artifacts | 5 |
| 4 — Active accuracy risk | 2 live risks (+2 checked, **not** a risk) |

**Highest-priority items in bucket 4 for Alex to look at first:**

1. **Dual `fightersData.js` generators run on two live cron schedules (4.1).** `update-data.yml` (Tuesdays) runs `build_fighters_json.py` and commits *only* `fightersData.js` + `fighters.json`; `update-fighters.yml` (Mon/Thu) runs `update_fighters.py` + `regen_elo.py` and commits `fightersData.js` **together with** `fightHistory.js`/`eloModule.js`/`cardioModule.js`. The Tuesday job can push a `fightersData.js` whose aggregates are out of sync with the ELO and fight-history files that both models also read. This is the single most consequential live risk found — it touches every prediction, both v1 and v2.
2. **`daysSinceLast` `Date.now()` staleness feeding v2 `modern_form` (4.2).** Already fully analyzed and settled in `daysSinceLast_live_audit.md` (LIVE BUG, BOUNDED); confirmed still present and unchanged in current code. Prioritized because it feeds a threshold-sensitive feature (`modern_form`, coef 0.175, 420-day cliff) and bakes into every save-to-ROI/Upcoming at save time.
3. Lower down but worth a glance: the **`computeFinishProbs` triple-count (4.3) was checked and is NOT a prediction risk** — confirmed display/analytics-only, never enters the win-probability composite. Listed so it is not re-opened.

---

## Bucket 1 — Dead code

| # | File:line | What it is today | Confidence | Recommendation |
|---|---|---|---|---|
| 1.1 | `src/modelModule.js` (whole file, 229 lines) | A standalone older copy of the v1 `computeMatchupEdges` (with the odds path + `W_OD` + Platt calibration that the live model has since dropped). Has **no `export`/`module.exports`** and is imported by nothing — `grep "modelModule"` across `src/`, `index.js`, `*.mjs` returns zero hits. Only Python research scripts read it as *text*. Superseded by the inline `computeMatchupEdges` in `App.js`. | CONFIRMED | Safe to remove. Note it also holds a **different weight vintage** than the live model (see 2-note below) — leaving it in the tree invites someone treating it as authoritative. |
| 1.2 | `src/App.js:1767,1768,1778,1780,1790,1794` | Feature differentials `kd_dif`, `control_time_dif`, `total_round_dif`, `total_title_bout_dif`, `peak_elo_dif`, `rank_tier_dif` are computed into `feats` but **never added to any composite score** — `grep "feats.<name>"` returns no consumer for any of them. `peak_elo_dif`/`rank_tier_dif` are documented as intentionally-excluded at `App.js:1881`; the other four are undocumented dead computations. Their `SCALES` divisors (`kd_dif`, `control_time_dif`, `peak_elo_dif`, `ufc_fight_count_dif` is used, `rank_tier_dif`, `atd_dif` is used) become correspondingly unused. | CONFIRMED | Safe to remove the dead `feats` lines (this does not touch any `SCALES` *value*, only stops dividing by it). No effect on output — they never reach the composite. Alex's call whether to keep for future use. |
| 1.3 | `src/cardIntel.js` (whole file) | Exports `CARD_INTEL = {}` (empty, "Auto-generated — do not edit"). Imported by nothing — `grep "cardIntel\|CARD_INTEL"` across `src/` returns only the file itself. | CONFIRMED | Safe to remove, together with its dead generator chain (see 3.4/3.5). |
| 1.4 | `src/App.js:1581,1588,1618` | `W_OD: null`, commented-out `PLATT_OD`, and `SCALES.odds_edge` are remnants of the removed v1 odds path — live `computeMatchupEdges(fA, fB)` takes no odds argument, so none of these reach the probability. Already labelled "INACTIVE … retained for reference." | CONFIRMED | No action required; already documented as inactive. Flagged only so the reference-only status is on the record. `SCALES` value untouched per instructions. |

**Correction to 1.2 (post-manifest-implementation, added during the 2026-07-14 cleanup pass, commit `ef7155e` and preceding):** the six differentials flagged above as dead were accurate as of this audit's original writing, but a later manifest task (`5f35d64`, "Add snapshot-integrity manifest to saved predictions") added a new consumer — the entire v1 `feats` object, including all six, is now serialized into every saved prediction's `_provenance.featureVector.v1` at `App.js:2676`. This was caught during re-verification immediately before the cleanup task would have deleted them (per the task's "STOP if a prior confirmation no longer holds" instruction), so they were **not removed**. They are retained intentionally as part of the saved-prediction provenance record, not as live model inputs — 1.2's "never added to any composite score" claim still holds, but its implicit "and therefore has no consumer" framing does not. `grep "feats\.<name>"` (per-key) missed this because the consumer reads the whole `feats` object, not individual keys — a methodology gap worth remembering for future dead-code sweeps of objects that get serialized wholesale.

---

## Bucket 2 — Redundant / conflicting logic

| # | Location | What it does today | Confidence | Recommendation |
|---|---|---|---|---|
| 2.1 | `.github/workflows/update-data.yml` (→ `build_fighters_json.py`) **vs** `.github/workflows/update-fighters.yml` (→ `update_fighters.py`) | **Two different scheduled workflows patch the same `src/fightersData.js` with different generators.** Both write the overlapping fields `wi, lo, ws, ls, dsl, lfd, kow, sbw, dcw` (`build_fighters_json.py:189` / `update_fighters.py:8`). `update-data.yml` (cron Tue, older — dated Apr 25) commits *only* `fightersData.js`+`fighters.json`; `update-fighters.yml` (cron Mon+Thu, newer — Jun 30) commits `fightersData.js`+`fightHistory.js`+`eloModule.js`+`cardioModule.js` as a set. | CONFIRMED (both are scheduled and enabled) | Needs Alex's decision on which generator is authoritative. `update-fighters.yml` is the newer, complete pipeline; `update-data.yml` looks like a superseded leftover. Its accuracy impact is escalated to **4.1**. |
| 2.2 | `computeMarketAnalysis` (`App.js:2309`), call sites `2551`, `2757`, `4055` | **Known BASELINE_NOTES risk — VERIFIED CLEAN, no defect.** There is exactly **one** implementation of betAction/edge/kelly. All three call sites (buildRoiEntry, ROI re-grade, Simulator `market` useMemo) build an `activeResult` with the model-toggle applied (`modelToggle==='v2' ? v2pA : pA`) *before* calling the shared function — no divergent copy, no v1/v2 mismatch between Simulator display and `buildRoiEntry`. v1 and v2 probabilities are stored side-by-side (`fighterAProb`/`v2pA`); the active model is selected by toggle, never blended or averaged. | CONFIRMED | No action. Reported as a positive verification of the prior-flagged risk (the "divergent betAction copies" concern is not present in current code). |

*Note (spans 1.1/2.1):* `modelModule.js` (dead) carries the fully audited "W_NO_v5" weights (`win_dif`, `ko_dif`, `total_round_dif`, `sig_str_dif`, `avg_sub_att_dif`, `total_title_bout_dif` all zeroed). The **live** `App.js` `MODEL.W_NO` keeps all of those **non-zero** (`win_dif: 0.03834`, `ko_dif: 0.039261`, etc.). The coefficient-zeroing research recorded in `modelModule.js`'s header never reached the live composite. This is not a live conflict (the file is dead), but it is a latent trap — flagged so Alex knows the two weight sets disagree and can decide whether the live `W_NO` was meant to adopt the v5 zeroing.

---

## Bucket 3 — Stale / zombie artifacts

| # | File:line | What it says vs. reality | Confidence | Recommendation |
|---|---|---|---|---|
| 3.1 | `src/App.js:1622`, `:1628`, `:2158` | Comments call MODEL_V2 "parallel, verification-only", "This model is NOT live; it only logs for now", and "parallel run … does NOT affect returned pA/pB". **All three are false now.** v2 is live: `v2.pA` is returned (`:2296`), selected as the active model by default (`buildRoiEntry` `modelToggle='v2'`, `:2541/2548`), drives `trackedProb`/betAction, and `MODEL_VERSION` (`:1553`) reads "…· Logistic v2.0". | CONFIRMED (flagged in a prior report; still unfixed) | Reconcile the comments to state v2 is the live default model. Documentation-only fix; no logic change. |
| 3.2 | `src/App.js:1630` | `MODEL_V2.version: "logistic_v1_20260625"` still points at the original artifact, but the live `coef` no longer matches it: 5 coefficients zeroed (2026-07-07), `win_streak`/`lose_streak` replaced by `modern_form` (not in the artifact at all, 2026-07-08), `scales.elo` corrected (2026-07-09). `model_artifact.json` is still the `20260625` vintage. | CONFIRMED | Reconcile the version label (or note it is a hand-modified descendant). The manifest's `modelCoefHash` (`:2674`) already captures the true coef, so drift is detectable — this is a label-accuracy issue, not a silent one. Needs Alex's decision on the authoritative version string. |
| 3.3 | `src/eloModule.js:2` | Header: "Computed from 8,547 UFC fights (full history through Jul 2026)". The underlying `regen_elo.py` reads only the two Greco CSVs, whose content caps at **2026-05-16**. Already flagged in `source_integrity_audit.md` as a misleading provenance comment. | CONFIRMED (still present) | Should be reconciled to reflect the real data cap (per the prior audit's recommendation). Not a leakage issue — the ELO values themselves were verified clean; only the comment overstates coverage. `eloModule.js` internals untouched per instructions. |
| 3.4 | `generate_upcoming_card.py:30` (writes `src/upcomingCard.js`); `update_fighters.py:26` (also writes `src/upcomingCard.js`) | Both generators write `src/upcomingCard.js` — a file that **does not exist in the repo and is imported by nothing.** The live app imports `UPCOMING_ENTRIES` from `src/upcomingData.js` (`App.js:36`), which is hand-maintained via the in-app "Copy Updated upcomingData.js" export button (`App.js:2695–2712`). | SUSPECTED (no evidence the `upcomingCard.js` output is consumed or manually promoted; possible Alex uses it out-of-band) | Needs Alex's confirmation: is the Python upcoming-card pipeline still intended, or superseded by the in-app export? If superseded, `generate_upcoming_card.py` (33 KB) and the `upcomingCard.js` write in `update_fighters.py` are dead. |
| 3.5 | `src/cardIntel.js` + `generate_card_intel.py` + `.github/workflows/update-card-intel.yml` | Entire card-intel subsystem is inert. `generate_card_intel.py` reads `upcomingCard.js` (the orphan from 3.4) and writes `cardIntel.js` (the empty, unimported stub from 1.3). The workflow (`update-card-intel.yml`, daily cron) **runs no generator at all** — its only step is `curl` to the Vercel deploy hook, so it redeploys the site daily while regenerating nothing. | CONFIRMED | Recommend retiring the card-intel chain (stub + generator + workflow) as a unit, pending Alex's confirmation it is abandoned. The daily redeploy in particular does nothing useful. |

---

## Bucket 4 — Active accuracy risk

| # | Location | What it does today | Confidence | Recommendation |
|---|---|---|---|---|
| 4.1 | `update-data.yml` / `build_fighters_json.py` vs `update-fighters.yml` (see 2.1) | The Tuesday workflow regenerates and commits `src/fightersData.js` **without** regenerating `src/fightHistory.js` or `src/eloModule.js`. Because v1's composite and v2's features both read `fightersData.js` aggregates (ASL/ATL/ASP/…) **and** ELO (`eloModule.js`) **and** `FIGHT_HISTORY`-derived `modern_form`, a partial refresh can leave the statistical aggregates a few days newer than the ELO/history files — an internally inconsistent snapshot feeding live predictions. | CONFIRMED redundancy; SUSPECTED impact (depends on whether the Tuesday job still runs to completion and how far the two generators diverge on shared fields) | Highest-priority item. Needs Alex's decision: retire `update-data.yml`, or make it regenerate the full file set atomically like `update-fighters.yml`. To confirm impact, check recent auto-update commits for a `fightersData.js`-only change with no matching `eloModule.js`/`fightHistory.js` update. |
| 4.2 | `src/App.js:795–802` → `:1785` (v1 `layoff_dif`) and `:2159–2160` → `computeModernForm` `:353` (v2 `modern_form`, coef 0.175, 420-day cliff) | `daysSinceLast` is anchored to `Date.now()`, not the fight's event date. Correct for live "predict a future fight" use; becomes staleness when a prediction is saved well before the event or reconstructed after it. **Fully analyzed and settled** in `daysSinceLast_live_audit.md` (LIVE BUG, BOUNDED); confirmed present and unchanged in current code. No *other* recency/layoff computation exists beyond the sites that report enumerated (re-checked: no new duplicate). | CONFIRMED (per settled report) | Not re-litigated here. Referenced as still-live; any fix is per that report's scope, pending Alex. Included in bucket 4 because it is the largest-coefficient live-path staleness vector. |
| 4.3 | `src/App.js:4003–4004` (`computeFinishProbs`) | `avgFinish` is added into **both** `rawKO` and `rawSub` (the previously-flagged "triple-count"). **Checked: this feeds only the display `projectedFinish` label** (`:2651`, `:5389`) and the projected-vs-actual finish accuracy tally (`:7284`). It is **never called inside `computeMatchupEdges`** and does not touch the win-probability composite. | CONFIRMED **not** a prediction risk | No action needed on prediction accuracy. Left as a display/analytics quirk (bucket 3 in spirit) — reported here explicitly so the "triple-count" concern is closed, not re-opened. If the projected-finish accuracy stat matters to Alex, the double-use of `avgFinish` biases that *label*, not any pick or probability. |
| 4.4 | Live Simulator / Upcoming path (v2 inputs) | Cross-check of the `source_integrity_audit.md` question ("does the same leakage class exist in the live path for fights predicted right now?"): for a genuinely **future** fight, every v2 input (aggregates, ELO, `FIGHT_HISTORY`) is pre-fight by construction — the target bout has not occurred, so there is no outcome to leak. The leakage concern in the prior audit was specific to **reconstructing past fights**, where the fighter's own history already contains the target bout. No new leakage vector in the live forward-prediction path. | CONFIRMED (reasoned from the settled audit) | No action. Reported to answer the task's explicit cross-check: the leakage risk does **not** extend to live forward predictions; the exposure is reconstruction-only and the staleness vector (4.2) is the live-path concern. |

---

## Items checked and explicitly cleared (so they are not re-opened)

- **betAction/edge/kelly single source of truth** — verified one implementation, consistently v2-toggled across all three call sites (2.2).
- **v1/v2 blending** — none; stored side-by-side, toggle-selected, never averaged (2.2).
- **Projected-finish triple-count in the composite** — not in the composite; display-only (4.3).
- **v2 null-defaults** — the `age??30`/`height??69`/`reach??70` fixes (BASELINE_NOTES 2026-07-07) are present in `featsV2`/`featsV2flip` (`App.js:2169–2171`, `2192–2194`); no other outcome-biasing `?? 0` default was found in the v2 feature vector (the remaining `?? 0` fields — `wins`/`losses`/`ko_wins`/`sub_wins`/`title_bouts` — are all zero-coefficient, so their default cannot reach the output).
- **Live-path outcome leakage** — none for forward predictions (4.4).

## Verification

`git status` after this audit shows **no modified tracked files** — the only change is the
new untracked report `research/code_health_audit.md`. All other listed untracked files
(backtest scripts, JSON artifacts, `src/fightersData_test.js`, etc.) pre-existed this
audit and were not created or altered by it.

*Note on untracked local artifacts (informational, not a code-health defect):*
`src/fightersData_test.js` (558 KB) is referenced only by `patch_atd.py`, not imported by
any live source — a stale local test copy. It is untracked, so it will not be committed;
mentioned only for completeness.
