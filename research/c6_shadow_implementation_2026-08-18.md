# C6 shadow evaluation — implementation & prospective-evaluation plan (2026-08-18)

Worktree `/Users/alexdrossman/Documents/Playground/fightmetrics-c6-shadow-2026-08-18`,
branch `codex/c6-shadow-implementation-2026-08-18`, base `16a3e5ef4743c6ae7148c6cc915a33c169a805e2`.

Implements the order-safe, feature-flagged C6 shadow capture from the audit
(`fightmetrics-betting-audit-2026-08-17/research/c6_soundness_report_2026-08-18.md`,
`…/c6_shadow_integration_spec_2026-08-18.md`). C6 does **not** replace v2, is
**never user-facing** in this release, and every stored arm is **paper-only**.

---

## 1. What was built

New dependency-neutral core `src/domain/betting/marketCore.js`: the market
primitives (`parseAmericanOdds`, `stripVig`, `americanToDecimal`, `americanOdds`,
`kellyFraction`, `calcExpectedValue`, `djb2Checksum`), a **parse-once**
`buildMarketInput({oddsA, oddsB})`, and the **snapshot-aware gate**
`evaluateGateOnSnapshot(result, marketInput, fA, fB)`. It imports nothing from
other domains, so both `betting/index.js` and `shadow/*` import it without any
circular dependency. `computeMarketAnalysis` in `betting/index.js` is now a thin
wrapper: it builds one market input and delegates — existing callers/outputs
unchanged (golden + boundary suites green).

Isolated domain `src/domain/shadow/`:

| File | Responsibility |
|---|---|
| `c6.js` | Pure C6 formula + frozen coefficients. `computeC6ProbA({noVigA, v2pA})`. Never throws. |
| `config.js` | Two independent feature flags; fail-closed user-facing. |
| `snapshot.js` | One frozen manual market snapshot (parse-once via `buildMarketInput`; id from parent `fightId`). |
| `policies.js` | The four shadow arms from ONE snapshot (no raw odds); agreement AFTER the full gate; fail-closed cross-check. |
| `record.js` | Assembles the frozen shadow record; consistency is structural. |
| `index.js` | Barrel export. |

Production changes in `src/domain/betting/index.js`: the `bestBet` bug fix (§6);
the market primitives + gate moved to `marketCore.js` and re-exported (no API
change); a flag-gated `entry._c6Shadow = buildShadowRecord(...)` at the end of
`buildRoiEntry`. The shadow modules now import the gate/primitives from
`marketCore.js` (not `betting/index.js`), which **removes** the earlier
betting↔shadow import cycle.

## 2. Final C6 API and formula

```
versionId = c6_sym_zerointercept_full_20260818
C6(A) = sigmoid( 0.9233813979326579 · logit(noVigA) + 0.5482535304335658 · logit(v2pA) )   // NO intercept
C6(B) = 1 − C6(A)
```

- No intercept, no refit, no added predictors. Inputs clamped to `[1e-6, 1−1e-6]`
  before `logit`. Coefficients frozen at full precision in `C6_COEF`.
- `computeC6ProbA` returns `{available, reason, c6pA, c6pB, version}`; returns
  `available:false` (never throws) for `NON_FINITE_INPUT`, `PROB_OUT_OF_RANGE`,
  or `NON_FINITE_INTERNAL`.
- **Order safety:** with `noVigB = 1−noVigA` (exact proportional strip) and
  `v2pB = 1−v2pA` (v2 symmetric to 1 ULP), the intercept-free form gives
  `C6(A over B) = 1 − C6(B over A)` to floating-point tolerance. Verified against
  the Python reference to ≤ 1e-12 and swap-residual 0 (`c6.test.js`).

## 3. Feature-flag behaviour (exact)

Two SEPARATE controls, both default **false**:

- **`VITE_C6_SHADOW_CAPTURE_ENABLED`**
  - OFF (default): no `_c6Shadow` field is added; saved-entry shape and all
    behaviour are byte-identical to base (except the authorized `bestBet` fix).
  - ON: C6 + the four arms are computed and frozen at save time. This does **not**
    change the displayed simulator probability, the current recommendation, the
    betting cards, ROI calculations, or any wager.
- **`VITE_C6_USER_FACING_ENABLED`**
  - OFF (default): C6 is not user-facing.
  - ON: **UNSUPPORTED — fails closed.** `isC6UserFacingActive()` is hard-coded
    `false`; the env flip is refused and reported as `UNSUPPORTED_FORCED_OFF`.
    Promoting C6 to user-facing requires a separate, reviewed change.

Shadow ON + user-facing ON still keeps v2 user-facing, stores shadow data, shows
no C6 recommendation, and creates no wager (`buildRoiEntry-integration.test.js`).

## 4. Odds capture semantics (honest / manual)

There is no automated odds provider or verified sportsbook publication time. A
new prospective save therefore records the entered odds as a **manual** snapshot
frozen at the save instant:

- `source = "manual"`, `capturedAt = entry.createdAt` (the save timestamp, stored
  at both the record level and inside the `market` section), `snapshotId =
  msnap_<parent prediction id>`, both American prices, both raw implied
  probabilities, both proportional no-vig probs, both decimal odds.
- **Structural single-snapshot invariant.** The odds are parsed **exactly once**
  (`buildMarketInput`, inside the snapshot). `evaluateShadowArms` accepts **only
  the frozen snapshot — no raw odds** — and runs both the v2 and C6 gates on that
  one object via `evaluateGateOnSnapshot`, which never re-parses. Every gate
  output and every stored arm records the snapshot's id; a defensive cross-check
  fails the whole evaluation closed with `ODDS_SNAPSHOT_MISMATCH` if any id fails
  to match. `singleSnapshotConsistent` is therefore **true for every available
  evaluation by construction**, not a passive after-the-fact warning.
- **Identity from the parent prediction id.** `snapshotId = msnap_<entry.id>`, so
  two otherwise-identical saves at the same instant still differ. Production
  requires `fightId`; its absence fails the capture closed with `MISSING_FIGHT_ID`
  rather than minting a collision-prone id.
- `captureSemantics` states `capturedAt` is when FightMetrics froze the entered
  odds — **not** sportsbook publication time. No provider/opening/closing
  timestamp is invented. No stale-age limit (C6 is computed at initial save time);
  a future automated provider can add provider-level freshness rules.
- Missing/invalid prices, missing timestamp, missing fighter→odds mapping, missing
  `fightId`, or a snapshot-id mismatch ⇒ C6 `available:false` with a reason code
  (`ODDS_MISSING_OR_INVALID`, `MISSING_CAPTURED_AT`, `MISSING_FIGHTER_MAPPING`,
  `MISSING_FIGHT_ID`, `ODDS_SNAPSHOT_MISMATCH`, `V2_UNAVAILABLE`) and **no arms**.
  Old saved entries are **never** retrospectively computed.

## 5. Shadow arms (paper-only)

`V2_CURRENT`, `C6_CURRENT`, `V2_AGREEMENT`, `C6_AGREEMENT`. `C6_NO_LEAN` is not
implemented. Each arm runs the **exact** production gate (thresholds, floors,
credibility cap, heavy-favourite suppression, odds conversion, pick/tie-break all
unchanged) with its own probability. Agreement is applied **after** the complete
gate and only suppresses a paper action; it never changes the probability, the
selected fighter, or the pre-agreement tier. Exact no-vig pick'em ⇒ `PICKEM` ⇒
agreement arm suppressed to NO BET. Fields are named `paperAction` / `wouldWager`
so nothing can be mistaken for a real wager.

## 6. `bestBet` bug fix (authorized, flag-independent)

`src/domain/betting/index.js`: `bestBet` now derives from `finalBetAction`
(POST heavy-favourite suppression) instead of `cappedBetAction` (pre). A
suppressed heavy favourite now yields `betAction:'NO BET'`, `bestBet:null`, and
`betRecommendedFighter:''` / `betRecommendedOdds:''` consistently. Invariant
`bestBet !== null ⇒ betAction !== 'NO BET'` holds. Regression test
`bestBet-suppression.test.js` fails on the pre-fix line and passes after (proven).
This is the ONLY flag-OFF behaviour change and is reported separately.

## 7. Where shadow records persist

`buildShadowRecord` runs **once** inside `buildRoiEntry` (save time) and attaches
`entry._c6Shadow`. From there it rides the existing lifecycle untouched:

```
Simulator save → buildRoiEntry (freeze _c6Shadow)
  → handleSaveToUpcoming → addPendingEntry (spread; preserved)
  → code export  JSON.stringify(entries) (preserved)
  → grading  createGradedEntry = {...entry, actualWinner} (appends outcome only)
  → ROI/history entry (same frozen object)
```

Loading/rendering/exporting/grading never recompute it. Grading appends
`actualWinner` only. Entries without `_c6Shadow` remain valid. Flag OFF adds no
empty object. Verified byte-for-byte through save→pending→export→grade
(`buildRoiEntry-integration.test.js`).

## 8. Prospective evaluation plan — PRE-REGISTERED (frozen now, before any data)

Two SEPARATE decisions. These thresholds are fixed **now**, before any
prospective outcome is viewed, and **must not be loosened after outcomes are
seen**. Accuracy, a winning streak, or raw win rate alone can **never** trigger
promotion. No closing-line value (closing odds are not captured).

### 8a. Probability review checkpoint
The **first formal probability review occurs only after BOTH**:
- **≥ 250** eligible resolved prospective fights, **and**
- **≥ 20** distinct UFC events.

Use every eligible resolved fight with a valid frozen v2 probability, C6
probability, and shared market snapshot. At the checkpoint report: paired Brier
difference (C6 − v2), paired log-loss difference (C6 − v2), the same differences
vs the no-vig market, calibration intercept and slope, event-clustered 95%
uncertainty intervals, and event-by-event + cumulative results.

This is a **review checkpoint, not automatic promotion.** If evidence is
inconclusive, shadow capture continues with no production change. C6 cannot be
**considered** for probability-layer promotion unless ALL hold:
- C6 paired Brier and log-loss **point estimates are better than v2**;
- the event-clustered **95% intervals show no material degradation vs v2**;
- C6 is **not materially worse than the no-vig market**;
- calibration **slope ∈ [0.8, 1.2]** and **intercept ∈ [−0.05, +0.05]**;
- promotion still requires a **separate reviewed implementation** — no automatic
  user-facing change ever occurs.

### 8b. Betting-policy review and promotion
Historical C6_CURRENT produced only **~27 actions over 2,281 OOF fights (~1.2%)**,
so **reaching a meaningful betting sample may take years**; probability quality
becomes assessable well before betting profitability.

The first **descriptive** betting-policy review may occur after **≥ 30 C6_CURRENT
paper actions across ≥ 15 distinct events**. That review is **descriptive only
and cannot promote C6.**

Do **not** consider changing the official betting policy until ALL hold:
- **≥ 100** C6_CURRENT frozen paper actions **across ≥ 30 distinct events**;
- the probability-layer criteria (8a) have **already passed**;
- the **event-clustered 95% ROI interval has a lower bound above zero**;
- drawdown and losing-streak behaviour have been reported and **accepted in a
  separate reviewed decision**.

These criteria are intentionally conservative and must not be loosened after
outcomes are viewed. Report metrics per event and cumulatively with
event-clustered intervals.

## 9. Schema / future-infrastructure limitation

The live App persistence path (`upcomingData.js` / `roiData.js` + `buildRoiEntry`
+ `domain/workflow`) carries `_c6Shadow` transparently — it is an ordinary
additive field on the entry object. The repository contains a separate
**normalized-schema / Supabase (Stage 7)** groundwork that is **not** the current
live persistence path; its strict validators would currently **drop or reject** an
unknown `_c6Shadow` field. This implementation deliberately does **not** launch a
backend rollout or schema migration for C6. **Future requirement:** when the
normalized schema becomes the live path, add a backward-compatible column/JSON
field for the shadow record (or a dedicated `c6_shadow` table keyed by entry id)
before enabling capture there. No change to that layer is made now.

Note: the Stage 7 data-layer test suites and the UFC-330 migration snapshot test
fail at the **base commit itself** (stored-data vs fixture drift), independent of
this change — see the verification report.
