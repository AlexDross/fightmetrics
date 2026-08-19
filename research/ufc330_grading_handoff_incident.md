# UFC 330 grading handoff — incident record and repair

/ Repair branch: `fix/ufc330-grading-handoff`, based on `e0e227c`.

## What broke

`npx vitest run` on `e0e227c`: **51 failed / 530 passed** across 7 files.
`1adfd22` (the last commit before the card was saved) is **581/581 green**, so
every failure was introduced by the five commits below.

| Commit | Files | Effect |
|---|---|---|
| `65f32e1` | `upcomingData.js` +1282/−552 | Final pre-fight re-save of all 10 UFC 330 records |
| `7351eb1` | `propPicksData.js` +51 | 3 UFC 330 props |
| `c6a9246` | `parlayData.js` +68 | 1 UFC 330 parlay (5 legs) |
| `3a67be6` | `roiData.js` +2410 | **ROI half of the grading handoff** |
| `e0e227c` | `propPicksData.js` 3/3 | `result: PENDING → LOST` |

`3a67be6` added the graded records but never removed their Upcoming
counterparts, so the same ten bouts existed in both files. `migrateV0ToV1`
aborts on that (`ROI and Upcoming updates must be committed together`), and the
abort cascaded into 51 failures that named neither the bout nor the file.

Two further defects rode along in `65f32e1`:

- **official provenance nulled** — `boutContext.provenance` went from the UFC
  weigh-in citation (`authority: "official"`, `retrievedAt: "2026-08-14"`) to
  `null` on all 10 records;
- **duplicate graft** — a copy of the context was added at
  `_provenance.boutContext`, a field absent from all 168 other ROI records.

## Version policy

Two legitimate versions exist and **both are preserved**:

| | INITIAL | FINAL |
|---|---|---|
| When | 2026-08-10 / 08-12 | 2026-08-15 19:41–19:46 UTC |
| Ids | `1786547…` / `1786372…` | `1786823…` / `1786822…` |
| Snapshot | `src/__tests__/snapshots/upcoming.preMigration.json` | `src/__tests__/snapshots/upcoming.finalPreFight.json` |
| Status | preserved unchanged; first-class historical record | **authoritative**; what the graded ROI records must match |

The FINAL version is authoritative by explicit user decision (2026-08-17): the
August 15 refresh was intentional, and it is the version the UFC 330 props and
parlay were built against. The INITIAL snapshot is **not** relabelled or
overwritten — `upcomingBoutContext.test.mjs` asserts it still exists intact and
that the two versions share no ids.

## What the repair did

1. Kept the `1786823…` ids — referenced by 3 prop `upcomingId` values and 5
   parlay `fightId` values, all verified before editing.
2. Left every August 15 prediction value untouched: probabilities, v2
   probabilities, odds, market values, edge/EV/Kelly/fair-line, picks, tracked
   side, frozen tier, projections, model version/hash, feature vectors,
   timestamps. Nothing recomputed.
3. `unitsWagered: 1` on all ten — **user-ratified**, including the two NO BET
   records (Magny–Brahimaj, Wells–Orolbai) whose Upcoming copies held `0.5` and
   `2`. Recorded as a decision, not an inferred default.
4. Restored `boutContext.provenance` verbatim from `1adfd22`. Never refetched.
5. Removed the `_provenance.boutContext` graft.
6. Removed the 10 graded entries from `upcomingData.js`, completing the handoff.
7. `propPicksData.js` and `parlayData.js` untouched.

Field-by-field ledger: `research/ufc330_grading_repair_ledger.tsv` (1,820 rows;
categories: unchanged August 15 prediction / restored official provenance /
preserved grading / user-ratified units / Upcoming removal / graft removal — no
field sourced as recomputed or inferred).

## The writer that allowed it

Not a single bug — three properties combined:

1. **`createPredictionId()`** (`src/domain/betting/index.js:76`) mints
   `Date.now()-random` and is called from the *create* path
   (`src/App.js:1409`, `src/App.js:2171`, `src/domain/betting/index.js:464`).
   Re-saving an already-saved matchup therefore mints a **new identity** instead
   of amending the existing record. That is how ten records were re-issued.

2. **`filterVisibleUpcoming`** (`src/domain/workflow/index.js:48`) hides
   Upcoming rows whose id is already graded. This is why nothing looked wrong:
   the UI masked the ghost entries while the committed file still held them.
   Its own comment records the assumption the refresh violated — that the id
   "is carried unchanged from Upcoming into ROI".

3. **No file-level atomicity.** Nothing requires `roiData.js` and
   `upcomingData.js` to be written in the same commit; the migration validator
   only notices afterwards, in CI.

### Policy (agreed)

A rule blocking edits after `eventDate` would **not** have prevented this — the
refresh ran on event day, hours before the first bout. The correct policy is:

- initial and final pre-fight captures are separate explicit versions;
- a saved version is immutable;
- an intentional refresh creates an auditable amendment/version;
- grading atomically moves the selected final version from Upcoming to ROI
  **without minting a new id**.

### Implemented here

`src/data/__tests__/gradingHandoffIntegrity.test.mjs` — a fast, direct guard on
the committed files that runs in normal CI and names the offending id and
matchup. It rejects: an id in both files; the same bout in both files under
*different* ids; a handoff that changed an id; loss of official bout-context
provenance; drift between a graded record and its final pre-fight snapshot; and
a dangling prop/parlay reference. Verified against unrepaired `e0e227c`: checks
1, 2, 4 and 5 all fire, listing every affected bout by name.

### Deferred (not attempted here)

Changing the app's save/grade flow so a re-save amends in place and grading
performs an atomic two-file handoff. That is a UI-behaviour change requiring
interaction testing, outside a data repair. The CI guard above closes the
detection gap in the meantime.
