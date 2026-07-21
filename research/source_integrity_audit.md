# Source Integrity Audit — Indirect Leakage Check, 54-Fight V2 Window

## ⚠ 2026-07-20 addendum — the "clean" verdict below is RETIRED for current data

**This audit's clean verdict was correct for the snapshot it examined and is
no longer correct today.** It is superseded, not retracted — the finding
below stands as a record of the 2026-07-13 data state; it does not describe
`main`/this branch's current state.

**What changed:** the audit's clean verdict rested entirely on one fact —
`FIGHT_HISTORY`'s maximum `dt` capped at 2026-05-16, seven days before the
window's first event, so no window fight's own result could reach
`modern_form` or any fallback record feature. Two auto-updates since
(`2026-07-16`, `2026-07-20`) moved that cap forward. Directly verified against
the current committed `src/fightHistory.js`, scanning every `dt` field: the
new maximum is **2026-07-18**.

**This is no longer a max-date statistic — it's a per-fight, per-fighter
direct hit.** For every one of the 8 fights that flip pick-vs-outcome under a
live recompute today (see the frozen-scoring audit this addendum accompanies),
`FIGHT_HISTORY` now contains an explicit entry for that exact bout, on both
fighters, with the correct result already recorded:

| Fight | Fighter A's `FIGHT_HISTORY` entry | Fighter B's `FIGHT_HISTORY` entry |
|---|---|---|
| Kai Asakura vs. Cameron Smotherman (2026-05-30) | `{dt:"2026-05-30", op:"Cameron Smotherman", re:"W"}` | `{dt:"2026-05-30", op:"Kai Asakura", re:"L"}` |
| Sergei Pavlovich vs. Tallison Teixeira (2026-05-30) | `{dt:"2026-05-30", op:"Tallison Teixeira", re:"W"}` | `{dt:"2026-05-30", op:"Sergei Pavlovich", re:"L"}` |
| Brandon Royval vs. Lone'er Kavanagh (2026-07-11) | `{dt:"2026-07-11", op:"Lone'er Kavanagh", re:"W"}` | `{dt:"2026-07-11", op:"Brandon Royval", re:"L"}` |
| Ryan Gandra vs. Zachary Reese (2026-07-11) | `{dt:"2026-07-11", op:"Zachary Reese", re:"W"}` | `{dt:"2026-07-11", op:"Ryan Gandra", re:"L"}` |

`modern_form` (the one non-zero-coefficient `MODEL_V2` feature this audit's
§1 traced to `FIGHT_HISTORY`) reads directly from these per-fighter arrays.
Re-running `computeMatchupEdges` on any of these matchups today does not
approximately drift toward the answer — it reads each fighter's own,
already-recorded win or loss on the exact target bout. This is the
mechanism, confirmed at the individual-fight level, not inferred from a
date range.

**One open question, flagged rather than resolved:** the raw CSVs this
audit's §2/§3 traced `fightersData.js` aggregates and `eloModule.js` to
(`ufc_event_details.csv`, `ufc_fight_results.csv`) are still, as of this
addendum, capped at 2026-05-16 in this repo checkout — checked directly,
zero rows on or after 2026-05-23. So whatever regenerates `FIGHT_HISTORY`
past that cap is evidently not the same committed-CSV pipeline this audit
traced for the other two sources; that generator is not identified here.
This doesn't soften the finding above (`FIGHT_HISTORY` is sufficient on its
own, and is the source this audit already named as the one feeding a
non-zero v2 feature) — it means a full re-audit of `fightersData.js`/
`eloModule.js`'s own currency is separately still open, not that they're
independently confirmed clean or dirty.

**Practical consequence:** any Statistics-tab computation that calls
`computeMatchupEdges` against current fighter data to grade a historical
pick is reading post-outcome information for that pick, for any fight dated
on or before 2026-07-18. The fix applied alongside this addendum moves those
computations to read each entry's own frozen, stored `v2pA`/`v2pB` instead of
recomputing — see the frozen-scoring change this addendum was written for.

---

**Date:** 2026-07-13
**Type:** Read-only. No source file was modified, including the untouchable set
(`W_OD`, `PLATT_NO`, `PLATT_OD`, `SCALES`, `eloModule.js`, `cardioModule.js`,
`backtest_combo_v2.py`) or any other file.

Follow-up to `research/v2_calibration_audit.md` and `research/v2_recalibration_test.md`,
both of which already confirmed no target bout appears directly in either fighter's
`FIGHT_HISTORY` (no direct outcome leakage). This closes the remaining question:
could any *other* active v2 input source contain information dated on or after a
target bout's event date, indirectly leaking signal into that entry?

## Scope

Audited every input that actually reaches `computeLogisticProb` (the 16 `MODEL_V2`
features): `modern_form` (via `FIGHT_HISTORY`), `wins`/`losses`/`rounds`/
`title_bouts`/`ko_wins`/`sub_wins` (via `fightersData.js` aggregates, with
`FIGHT_HISTORY` fallback), `height`/`reach` (static), `younger`/age (excluded from
the outcome-leakage question — see note below), `sig_str_landed`/`sig_str_accuracy`/
`sub_attempts`/`td_landed`/`td_accuracy` (via `fightersData.js` ASL/ASP/ASA/ATL/ATP),
and `elo` (via `eloModule.js`). Also checked prospect/division-average blending
(`blendToward`, `DIVISION_UFC_AVERAGES`).

**Excluded, with the demonstration required before excluding:** `cardioModule.js`
and `rankHistory.js`. `MODEL_V2.features` (`App.js:1630`) is the complete, exhaustive
list of what `computeLogisticProb` consumes: `["modern_form","wins","losses","rounds",
"title_bouts","ko_wins","sub_wins","height","reach","younger","sig_str_landed",
"sig_str_accuracy","sub_attempts","td_landed","td_accuracy","elo"]`. Neither `cardio`
nor any rank/tier term appears in that list, checked programmatically. `CARDIO_RATIO`
feeds only v1's composite (`cardio_dif`) and `RANK_TIER`/`SOS` feed only v1's debut-
adjustment and `sosDiff`/`qualMomDiff` terms — none of these reach v2. No path exists;
excluded as instructed.

**Kept separate per instruction:** the `Date.now()` recency-anchoring issue
(`daysSinceLast_live_audit.md`) is a *staleness* problem (a feature computed relative
to the wrong reference date) and is not re-litigated or relabeled as leakage here.
Everything below concerns whether source data *contains information about outcomes
that hadn't happened yet* at each target bout's date — a different question. Age
(`younger`) is likewise a slowly-drifting attribute like `daysSinceLast`, not an
outcome-leakage vector, and is excluded from the leakage checks below for the same
reason.

## Per-source findings

### 1. `FIGHT_HISTORY` → `modern_form` (and the `wins`/`losses`/`ko_wins`/`sub_wins`/
`title_bouts` fallback path, all zero-coefficient in current `MODEL_V2` — see note)

- **Generator:** not directly identified as a single named script in this repo listing,
  but its content is keyed to the same Greco pull as `ufc_event_details.csv` (see
  below) — confirmed by matching cutoff dates.
- **Artifact generation time (git):** `src/fightHistory.js` last committed
  2026-07-12 (`d2c56b9`, the Kai Kamaka/tr-semantics patch), before that
  2026-07-10 (Zach Reese name-fix) and 2026-07-09 (auto-update).
- **Maximum source-event date actually present in the data:** checked directly —
  scanned every `dt` field across the entire `FIGHT_HISTORY` object (all fighters,
  all fights). **Maximum `dt` = 2026-05-16** (Arnold Allen's fight that day). **Zero
  entries anywhere in the dataset have `dt ≥ 2026-05-23`** (the window's start date).
- **Per-entry check:** since the data contains *no* entries on or after the window's
  first event date at all, no target bout, and no *other* bout in the window
  (regardless of which of the 54 fights or which fighter), can possibly be reflected
  in `FIGHT_HISTORY`. This is stronger than a per-entry check needed to be — the
  absence is total, not marginal.
- **Verdict: clean**, for all 54 entries.

**Note on `wins`/`losses`/`ko_wins`/`sub_wins`/`title_bouts`:** these features fall
back to `FIGHT_HISTORY`-derived counts when history exists (`App.js:765-789`), so
they inherit the same May-16 cutoff and are equally clean. They are also
independently zero-coefficient in the current `MODEL_V2.coef` (all five zeroed by
the 2026-07-07 RED-feature fix), so even a hypothetical contamination here would not
reach v2's output — but the underlying data is clean regardless of that mitigant.

### 2. `fightersData.js` aggregates → `sig_str_landed`, `sig_str_accuracy`, `sub_attempts`,
`td_landed`, `td_accuracy` (via static `ASL`/`ASP`/`ASA`/`ATL`/`ATP`), and `rounds`
(via static `TR`, which `App.js:768-769` prioritizes over any `FIGHT_HISTORY`-derived
value — `d.tr ?? (...)`)

These are the highest-weight non-zero features in `MODEL_V2` besides `elo`/`younger`
(`sig_str_landed` 0.243, `td_landed` 0.224, `sig_str_accuracy` 0.193, `sub_attempts`
0.155, `rounds` 0.105, `td_accuracy` 0.049) — this is the most consequential source
in the audit.

- **Generator:** `update_fighters.py`, which reads `ufc_fight_results.csv`,
  `ufc_event_details.csv`, and `ufc_fight_stats.csv` (`update_fighters.py:217-229`),
  joins fight rows to event dates via `events_df` (`update_fighters.py:240-242`), and
  computes `asl = total_sig_landed / (total_duration/60)` etc. as **whole-career
  aggregates**, not per-date-filtered values (`update_fighters.py:423,471`).
- **Artifact generation time:** `src/fightersData.js` last committed 2026-07-12
  (same Kai Kamaka/tr-semantics patch — a targeted field-semantics fix, not
  necessarily a full re-pull; see caveat below), before that 2026-07-09 (auto-update)
  and 2026-07-08 (fill missing values).
- **Maximum source-event date in the underlying data:** checked directly.
  `ufc_event_details.csv` (file mtime 2026-06-22) — parsed every `DATE` column
  value; **maximum event date = 2026-05-16** (same event, "UFC Fight Night: Allen
  vs. Costa"). **Zero rows with a date ≥ 2026-05-23.** `ufc_fight_results.csv`,
  `ufc_fight_details.csv`, `ufc_fight_stats.csv` (file mtimes 2026-06-29) have no
  independent date column — dates are joined via event name — but case-insensitive
  search across all three for every window event name (UFC Macau, UFC Vegas 118,
  Freedom 250, UFC Vegas 119, UFC Fight Night Baku, UFC 329) returned **zero
  matches** in all three files. Cross-checked by fighter name instead of event name:
  searched the `BOUT`/`EVENT` fields for Song Yadong, Conor McGregor, Max Holloway,
  and Kai Asakura directly — each fighter's most recent listed event in
  `ufc_fight_results.csv` is a **pre-window** event (e.g. McGregor's latest listed
  fight is UFC 264 in 2021; his actual 2026-07-11 UFC 329 bout vs. Holloway does not
  appear anywhere in the file). Consistent across all four spot-checked fighters.
- **Per-entry check:** as with `FIGHT_HISTORY`, the underlying data contains no
  rows for the window period at all — this rules out contamination for every one of
  the 54 entries, not just a sampled subset.
- **Verdict: clean**, for all 54 entries.

**Caveat, stated but not counted as a leakage finding:** because none of these
static aggregate fields have been refreshed with window-period data, they are also
*stale in the other direction* — for any fighter who fought inside the window itself,
their ASL/ASP/ATL/ATP/TR used in the prediction do not reflect that fighter's most
recent (pre-target) form update from Greco either; they're frozen at whatever their
last pre-2026-05-16 fight left them at. This is an incompleteness/staleness
observation, not outcome leakage (it can only make the reconstruction *less*
informed about recent-but-still-prior events, never leak future/target information)
— flagged for completeness, not folded into the leakage verdict.

### 3. `eloModule.js` → `elo` feature (coefficient 0.246, second-highest in `MODEL_V2`)

This source required the most care, because its own generation-timestamp pattern
looks the most suspicious at first glance — exactly the case the task warned about.

- **Generator:** `regen_elo.py`, whose own docstring states plainly: *"Reads:
  ufc_fight_results.csv (fight outcomes), ufc_event_details.csv (event dates)"*
  (`regen_elo.py:6-7`) — **the identical two CSVs already verified above to cap at
  2026-05-16 with zero window-event rows.** No other data source (no live API, no
  separate incremental file) is read.
- **Artifact generation time:** `src/eloModule.js` last committed 2026-07-12 (Kai
  Kamaka patch), before that **2026-07-02** ("Auto-update fighter data") and
  2026-06-22 (the commit that introduced `regen_elo.py` itself, replacing a prior
  manual/Colab process). **The 2026-07-02 timestamp postdates four of the six
  window events** (Macau, Vegas 118, Freedom 250, Vegas 119 had all already
  happened by July 2) — on generation-timestamp evidence alone, this would look
  like a plausible leakage vector.
- **This is the exact trap the task instructed against inferring from timestamps
  alone.** The file's own header comment reinforces the false impression: *"Computed
  from 8,547 UFC fights (full history through Jul 2026)"* (`src/eloModule.js:2`) —
  this comment is **misleading relative to the actual underlying data**. Verified
  directly: since `regen_elo.py` only ever reads `ufc_fight_results.csv`/
  `ufc_event_details.csv`, and those files' actual *content* (not their file mtime,
  not the script's run date) caps at 2026-05-16 with zero window rows (established
  above), the July 2 run date reflects *when the script was executed*, not what data
  it had available — it ran against the same May-16-capped snapshot. Running a
  regeneration script later than an event happened does not, by itself, mean that
  event's result is in the output; the source files determine that, and they don't
  contain it.
- **Maximum source-event date in the underlying data:** 2026-05-16 (identical to
  source #2, since it's the identical file pair).
- **Per-entry check:** clean for all 54 entries, same reasoning — the source data
  simply doesn't extend into the window period, for any fighter, in any of the 54
  bouts.
- **Verdict: clean**, for all 54 entries — **but flag the misleading in-file header
  comment as a documentation/provenance-clarity issue worth fixing separately** (not
  a leakage issue, a trust-in-your-own-comments issue).

### 4. Prospect/division-average blending (`blendToward`, `DIVISION_UFC_AVERAGES`)

- **Generator/inputs:** `DIVISION_UFC_AVERAGES` (`App.js:597-638`) is itself computed
  from `_D2` (`fightersData.js`) — the same source as #2, so it inherits the
  identical May-16 cutoff; no independent contamination vector.
- **Applicability check:** blending only activates when `isProspect` is true
  (`App.js:808-822`). Checked all 109 distinct fighter-sides across the 54-fight
  window against `getActiveProspects()` (`prospectsData.js`): **zero matches.** No
  fighter in this window is flagged as an active prospect, so this blending path is
  never invoked for any of the 54 entries.
- **Verdict: clean by non-applicability** — not a live path for this window at all.

## Conclusion

**Target-outcome-clean across all active v2 sources.**

| Source | Underlying data max event date | Window start | Contamination possible? |
|---|---|---|---|
| `FIGHT_HISTORY` (`modern_form`, record fallbacks) | 2026-05-16 | 2026-05-23 | No — zero entries in window period, any fighter |
| `fightersData.js` aggregates (ASL/ASP/ATL/ATP/ASA/TR) | 2026-05-16 (same CSVs) | 2026-05-23 | No — zero rows in window period, any fighter |
| `eloModule.js` (via `regen_elo.py`) | 2026-05-16 (same CSVs) | 2026-05-23 | No — despite a misleading "through Jul 2026" header comment and a July 2 run date |
| Prospect/division-average blending | inherits #2 | — | Not applicable — 0/109 window fighters are flagged prospects |
| `cardioModule.js`, `rankHistory.js` | — | — | Excluded — no path into `computeLogisticProb`'s 16 features (verified against `MODEL_V2.features`) |

Every active v2 input source that could theoretically leak target-or-later
information traces to the same two Greco CSVs, whose actual content — verified by
direct parsing, not by trusting file mtimes, commit dates, or in-file comments — caps
at 2026-05-16, seven days before the window's first event. This rules out
contamination for all 54 entries at once; no fight-by-fight exclusion is needed on
leakage grounds.

## Proposed wording correction for the two prior reports (not applied — description only)

Since this audit came back clean, both `v2_calibration_audit.md` and
`v2_recalibration_test.md` should describe the 54 rows more precisely. Proposed
wording, for Alex to apply if agreed (I have not edited either file):

> The 54 rows are **target-outcome-clean**: no active `MODEL_V2` input (fight
> history, fighter statistical aggregates, or ELO) contains information about the
> target bout or about any other bout on or after the target bout's date — verified
> directly against the underlying Greco source data, which caps at 2026-05-16, prior
> to the window's first event. However, the 54 rows are **reconstructed, not
> authentically point-in-time**: their features were regenerated from that single
> frozen post-cutoff snapshot at reconstruction time, rather than captured live the
> day before each respective event. This means the reported calibration and
> recalibration results describe how well-calibrated *this frozen reconstruction* is,
> not how well-calibrated live, freshly-captured pre-event predictions would have
> been — a distinction that matters for the separately-documented `Date.now()`
> recency-staleness issue (`daysSinceLast_live_audit.md`), but does not indicate any
> outcome leakage into the reported numbers.

This replaces any looser phrasing in the prior two reports that could be read as
leaving open whether indirect leakage (beyond the already-checked direct
FIGHT_HISTORY inclusion) was possible — it wasn't, on this evidence.
