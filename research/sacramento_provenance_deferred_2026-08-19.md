# Deferred: UFC Sacramento upcoming-card provenance repair — 2026-08-19

Branch `codex/c6-shadow-integration-2026-08-19`. Integration base `origin/main`
`2264ca1cf42c773453d6c5e4cfc3ec7e88fe7cba`; UFC 330 repair merged from
`origin/fix/ufc330-grading-handoff` `ff8884abfaad9f80d6e5c131b4ef086c3bbb0933`
(merge commit `e2d077af98e74681c818150648ce327f52a8e4f7`); C6 cherry-pick
`8816b521bf03d3588584121896f74a6b0c7a8462`.

## Decision

The user **explicitly deferred** repairing the UFC Sacramento upcoming card until
after the C6 project is finished. This integration therefore **preserves the
Sacramento card exactly as it is on `origin/main`** — no Sacramento entry was
repaired, removed, regenerated, or otherwise altered, and the failing integrity
tests that flag it were **not** weakened or deleted.

## Preserved data

`src/upcomingData.js` retains the current live card: **10 UFC Sacramento
(2026-08-22) upcoming bouts**, byte-identical to `origin/main` @ `2264ca1`.

## Two known defects (in the Sacramento data, not in C6)

Both were re-introduced when the upcoming card was rolled forward to Sacramento on
the un-repaired code (the same defect class the UFC 330 repair fixed for UFC 330):

1. **Missing `boutContext.provenance`** — all 10 Sacramento entries have
   `boutContext.provenance: null` (no official weigh-in citation).
2. **Accidental `_provenance.boutContext` graft** — all 10 Sacramento entries
   carry a `_provenance.boutContext` object that was never part of the schema.

## The exact two failing tests (authorized to remain)

1. `src/data/__tests__/gradingHandoffIntegrity.test.mjs`
   → `grading handoff integrity — ROI and Upcoming > 4. no record loses its
   official bout-context provenance` (fires on defect #1).
2. `src/data/migration/__tests__/legacyFieldMap.test.mjs`
   → `legacy field map is exhaustive > covers every field path in roiData.js and
   upcomingData.js` (fires on defect #2 — the `_provenance.boutContext.*`
   paths are unmapped legacy paths).

These are the **only** two failures in the full suite on this branch. No other
failure is present, and no C6 test fails.

## C6 does not depend on or touch these fields

The C6 shadow layer reads only `v2pA`/`v2pB`, the parsed American odds, and the
proportional no-vig probabilities, via one frozen market snapshot. It never
reads, writes, or depends on `boutContext.provenance` or `_provenance.boutContext`,
and it does not modify any saved `upcomingData.js`/`roiData.js` row (shadow
capture is OFF by default and only appends an additive `_c6Shadow` field to newly
saved predictions when explicitly enabled). Repairing the Sacramento data later
cannot affect C6 behaviour.

## Required future repair (do NOT fabricate provenance)

1. Regenerate/repair the Sacramento card through the **corrected, source-backed**
   refresh/grading-handoff workflow (the one that restored official provenance for
   UFC 330).
2. Populate each Sacramento bout's `boutContext.provenance` with **legitimate**
   official values (authority/sourceUrl/retrievedAt from the actual UFC source).
   **Do not fabricate** citations.
3. Remove the accidental `_provenance.boutContext` graft from the Sacramento
   entries.
4. Confirm the **full Vitest suite is completely green** (0 failures) afterward.

Until then, the correct description of this branch is:
**"C6 ready with two explicitly deferred Sacramento data-integrity failures."**
