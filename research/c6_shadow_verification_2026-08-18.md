# C6 shadow implementation — verification report (2026-08-18)

Worktree `fightmetrics-c6-shadow-2026-08-18`, branch
`codex/c6-shadow-implementation-2026-08-18`, base
`16a3e5ef4743c6ae7148c6cc915a33c169a805e2`. No commit, no push.

Covers the initial implementation **and** the snapshot-invariant correction pass
(structural single-snapshot enforcement, snapshot id from the parent prediction
id, fail-closed availability, and the frozen pre-registered checkpoints).

## Commands and results

| Command | Result |
|---|---|
| `npx vitest run src/domain/shadow/__tests__/` | **45 passed** (7 files) |
| `npx vitest run src/domain/shadow/__tests__/ src/domain/betting/__tests__/` | **92 passed** (10 files) |
| `npx vitest run src/domain/betting/__tests__/ src/domain/model/__tests__/ src/domain/workflow/__tests__/` | **132 passed** (8 files) — golden entries, gate boundaries, model symmetry, lifecycle |
| `npx vitest run` (full) | **580 passed, 51 failed** (631 total) — the 51 failures pre-exist at base (same 7 files) |
| bestBet regression vs pre-fix line (in `marketCore.js`) | **FAILS** (`expected 'A' to be null`; invariant violated at pA=0.75) — proves the fix |
| determinism (shadow suite ×2) | identical (45 passed both runs) |
| `npm run build` | **✓ built** |
| `git diff --check` | clean |

## Single-snapshot invariant — structural proof

`evaluateShadowArms` now accepts **only** the frozen snapshot (no raw odds) and
runs both gates on that one object via `evaluateGateOnSnapshot`, which never
re-parses. Demonstration that the old reparse channel is closed (via the
dependency-neutral `marketCore`):

```
frozen snapshot noVigA : 0.554264   snapshotId: msnap_x
stray-odds gate  noVigA : 0.019250   snapshotId: null      <- a reparse design would use THIS
frozen gate      noVigA : 0.554264   snapshotId: msnap_x   <- the corrected path uses the snapshot
```

Tests enforcing it: `snapshot-invariant.test.js` (stray injected odds ignored;
both gates read one parsed input; wrapper == direct gate; invalid input → gate
null), `policies.test.js` (every arm records the same `marketSnapshotId`; both
gates share it; `crossCheckSnapshotIds` rejects a mismatch; invalid snapshot →
no arms; `ODDS_SNAPSHOT_MISMATCH` path), `snapshot.test.js` (id from `fightId`;
different ids → different snapshots; `MISSING_FIGHT_ID` fails closed).

## Production integrity

`git diff --stat HEAD`: `src/domain/betting/index.js | 54 insertions, 274
deletions`. The large deletion is the gate + market primitives **moving** to the
new dependency-neutral `src/domain/betting/marketCore.js`; `computeMarketAnalysis`
is now a thin wrapper with byte-identical output (golden + boundary suites green).
Only `betting/index.js` is modified; `model/index.js`, `upcomingData.js`,
`roiData.js`, `App.js` and all data-layer files are untouched. No stored entry
rewritten; no golden regenerated; no test weakened.

`git status --short`:
```
 M src/domain/betting/index.js
?? research/c6_shadow_implementation_2026-08-18.md
?? research/c6_shadow_verification_2026-08-18.md
?? src/domain/betting/__tests__/bestBet-suppression.test.js
?? src/domain/betting/marketCore.js
?? src/domain/shadow/
```

## Pre-existing base failures (unchanged — proven previously)

The same **7 files / 51 failures** fail at the pristine base with all work
stashed — the normalized-schema / Supabase **Stage 7** layer and the UFC-330
migration snapshot (stored-data vs fixture drift; e.g. `expected 226 to be 1`,
`expected 178 to be 188`). None import `domain/betting`, `domain/betting/marketCore`
or `domain/shadow`. Failing files unchanged:
`upcomingBoutContext`, `legacyFieldMap`, `migration`, `trackedPriceAndReview`,
`trackedPriceOverride`, `contract`, `invariantGaps`. No new failure introduced.

## READY / NOT READY

**READY for local prospective shadow capture.** Flags remain OFF; with them off
the app is byte-identical to base except the authorized `bestBet` fix. Enabling
only `VITE_C6_SHADOW_CAPTURE_ENABLED=true` freezes the four paper-only arms on new
saves — all reading one validated snapshot — without changing any user-facing v2
output; C6 cannot be made user-facing (fail-closed). Nothing committed or pushed.
