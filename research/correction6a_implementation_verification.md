# Correction 6A — implementation verification

Historical bout division (`fightHistory[].wc`) and title status (`fightHistory[].tb`)
are now read from the raw `WEIGHTCLASS` on each `ufc_fight_results.csv` row.

## Base and source pins

| Item | Value |
|---|---|
| Base `origin/main` | `1adfd22fe3b09b84ddd994a7057d4cc9c0275276` |
| Branch | `fix/correction-6a-history-provenance` |
| Greco commit | `18ba20924fa439d0659e9b259759a07574cc8a07` |
| Greco archive sha256 | `f77576ee6d70334540fb501a62d6f937b9a34f4544c9bb1f81b05018f0155f8c` |
| Retrieved | `2026-08-14T19:48:13Z` |
| Max event date | `2026-08-08` |
| `FIGHTMETRICS_ASOF` | `2026-08-13` (the artifact's own `dsl` baseline) |

**Authoritative source pin is the Greco commit plus the four individual CSV
hashes.** The GitHub-generated ZIP is re-compressed server-side, so its byte
hash is not a stable content identifier and is not relied on.

| CSV | sha256 |
|---|---|
| `ufc_event_details.csv` | `d20783b15ea5c6c4971d093e6c9f5f185390a666cbc742d0afc26d6dc714d077` |
| `ufc_fight_details.csv` | `34fe5ab97eaac498dbd03ac78a74fb2492b9bd359dbe3e67fd4f4c9b59eae2a5` |
| `ufc_fight_results.csv` | `7f8f3b5245851397006a1da7b2f042322b3bf9456c94d849d7d47fdc57a71f7d` |
| `ufc_fight_stats.csv` | `b41f554bb0c9fcbe5bd7988f972ee798741e4fb08d6d1d7a3c07a9310557286e` |

**Correction:** an earlier report described the approved `ufc_fight_results.csv`
hash as truncated. It is not — the approved value is the full 64-character hash
above, and the feed matches it exactly.

## Root cause

`ufc_fight_details.csv` is exactly `EVENT,BOUT,URL`. `detail_lookup` read a
`WEIGHTCLASS` that does not exist there, so every one of the 8,847 bouts carried
`wc:''`. Three consequences followed:

1. the history rebuild fell back to `wc_lookup[fighter]` — the fighter's
   **current roster division** — stamping it across their whole career;
2. title status degraded to `'title' in event_name`, which flagged all seven
   bouts of *UFC 18: The Road to the Heavyweight Title*;
3. `' Title'` was appended to the division string, producing values such as
   `'Unknown Title'`.

Because each corner was stamped with its own fighter's roster division, the two
copies of a bout disagreed on **2,861 of 8,822 bouts**.

## Source-of-truth rules

| Field | Rule |
|---|---|
| `fightHistory[].wc` | Canonical division parsed from the bout's own raw `WEIGHTCLASS`. Never a roster division. Never contains `Title`/`Interim`/`Bout`. One of the 12 canonical divisions, or `Catch Weight` / `Open Weight` / `Super Heavyweight`. |
| `fightHistory[].tb` | `true` for UFC undisputed championships, UFC interim championships, and the five legacy `UFC Superfight Championship Bout` rows. `false` for TUF finals, Road to UFC finals, early UFC bracket finals, and every ordinary/catchweight/open-weight bout. |
| `fightersData.w`, `.wlb`, `.tb` | **Untouched in this PR.** |

The raw row is read *inside the result loop* and parsed **once**, then shared by
both corners. There is deliberately no `(EVENT, BOUT)` join: that key is
non-unique — Kazushi Sakuraba met Marcus Silveira twice at UFC Ultimate Japan
(bracket opener overturned to a No Contest, then the final) — and a join would
collapse the two bouts.

## Parser taxonomy (120 reviewed labels, pinned feed)

| Category | Labels | Raw rows | Championship |
|---|---:|---:|:--:|
| ORDINARY | 12 | 8,180 | no |
| UFC_TITLE | 12 | 363 | **yes** |
| INTERIM_TITLE | 8 | 30 | **yes** |
| SUPERFIGHT_CHAMPIONSHIP | 1 | 5 | **yes** |
| TOURNAMENT_FINAL | 84 | 85 | no |
| CATCHWEIGHT | 1 | 82 | no |
| OPENWEIGHT | 1 | 101 | no |
| SUPER_HEAVYWEIGHT | 1 | 1 | no |
| **Total** | **120** | **8,847** | **398 raw / 397 canonical** |

Traps covered explicitly: `UFC Superfight Championship Bout` contains **no**
`Title` token; the three `TitleBout` (no space) spellings are normalised before
any word-boundary test; `Heavyweight` inside `Light Heavyweight` /
`Super Heavyweight` is collapsed by containment, not by match order.

Eleven labels carry no division token at all (15 raw rows, 15 canonical bouts,
**30 history corners**) and resolve through an explicit reviewed map to
`Open Weight`. All predate UFC 12, the first card with weight-class title
fights; UFC history records Ultimate Ultimate '96 as the last event contested
without weight classes — <https://www.ufc.com/news/fast-facts-our-20th-anniversary>
(accessed 2026-08-14).

### R10 — one bout URL, one set of bout metadata

The result URL is canonical bout identity: 8,847 rows resolve to 8,822 distinct
URLs, and the 25 duplicate groups are exactly the event aliases (a card listed
under two names). `validate_bout_metadata` — **one implementation shared by
`update_fighters.py` and `scripts/gate_closed_labels.py`**, so they cannot drift
— fails closed when a row has a blank/missing URL, when a label does not parse,
or when rows sharing a URL disagree on
`(division, championship, interim, tournament_final)`.

It runs on the **raw** feed, before canonicalisation: `canonicalize_aggregate_inputs`
collapses the alias duplicates, so validating afterwards would inspect 8,822
rows that are unique by construction and never exercise the conflict check.

Pinned feed: **8,847 rows → 8,822 bouts, 25 duplicate-URL groups, 25 repeat
rows, 0 conflicts.**

### New-fighter seeding

Seeding no longer touches legacy metadata paths. `clean_wc` is retired
outright. A newcomer's division follows one documented precedence: reviewed
prospect fallback → parsed division of the **latest dated contested bout** →
**fail closed**. Because `fights` is sorted descending before this runs, the
result is recency-based and never depends on row order; the retired paths were
`clean_wc(detail_lookup wc)` (always `''`) and `rows[-1]['weight_class']`, the
last-appended per-round stats row. A seeded `tb` is counted from parsed
championship facts, replacing the event-name heuristic. Existing roster `w`,
`wlb` and `tb` remain untouched — reconciliation is 6B.

The pinned run seeds **0** fighters, and `src/fightersData.js` stays
byte-identical.

## Fail-closed behaviour

The parser raises `WeightclassParseError` on a missing, blank, malformed or
unreviewed-no-token label, on any label carrying two independent division
tokens, and on anything resolving outside the supported divisions. `Unknown` is
an internal error state only and is **never emitted** — the pinned feed resolves
0 of 17,644 corners to it.

Closed-world membership is enforced one layer up, by
`scripts/gate_closed_labels.py`, which runs against the downloaded feed **before
the updater writes anything**. A label is usable because a human reviewed it into
`tests/fixtures/weightclass/labels_120.tsv`, never because it merely contains a
recognised division token: `BMF Welterweight Title Bout` parses cleanly and the
gate still rejects it. The gate fails in both directions — a novel label and a
reviewed label that has vanished from the feed both abort.

## `FIGHTMETRICS_ASOF`

Generation now **requires** `FIGHTMETRICS_ASOF`, exact `YYYY-MM-DD`, a real
canonical calendar date. `dsl` is (as-of − last-fight date), so an unpinned clock
rewrites ~2,198 roster records on every run and buries a correction's real diff.
Shape is checked before parsing because `date.fromisoformat` also accepts basic
forms such as `20260813`. Scheduled CI runs pin it to the UTC run date, which is
what `date.today()` resolved to before; the difference is that the value is
explicit, logged and reproducible.

## Generated artifacts

| File | sha256 | Status |
|---|---|---|
| `src/fightersData.js` | `27b046d070869d7aba20117b971862623f67997956f18a77ad3ef0a283fdb134` | **byte-identical to origin/main** |
| `src/fightHistory.js` | `420eafc4418bb747793d51a438a02b39525d03985e8b0f0139384c06ea9c0449` | corrected |
| `src/upcomingData.js` | `5ba9d1cc00d86ca01548d9c738c2495f3ca5901a5734a4c166ad01c52561cce9` | protected, unchanged |
| `src/sourceManifest.js` | regenerated (tracks the new `fightHistory` hash) | |

No other generated artifact changes: `eloModule.js`, `cardioModule.js`,
`fighterBirthdates.js`, `rankHistory.js`, `rankingsData.js`,
`rankingsHistoryData.js`, `roiData.js`, `parlayData.js`, `propPicksData.js`,
`prospectsData.js` are all untouched.

### Disclosure: `src/sourceManifest.js` carries pre-existing drift

`src/sourceManifest.js` is regenerated by `generate_source_manifest.py`. Its diff
is larger than 6A alone, and the split was measured rather than assumed:

| Comparison | Changed lines | Meaning |
|---|---:|---|
| main's committed manifest → regenerated on a **pristine** main tree | **32** | pre-existing drift: main's committed manifest already disagrees with its own artifacts |
| pristine-main regeneration → this branch's regeneration | **4** (1 substantive + `manifestGeneratedAt`) | the actual 6A effect |

The single substantive 6A line is the `fightHistory` content hash,
`f5dda9d4…be59` → `420eafc4…c449`. The other 32 lines — stale `contentHash`
values for `fightHistory` and `fightersDataAggregates`, per-file
`generatorVersion` commit SHAs, `generatedAt` dates, and the `verificationMethod`
wording — change identically if you regenerate on unmodified `origin/main`:

```
git worktree add --detach <dir> 1adfd22fe3b09b84ddd994a7057d4cc9c0275276
cp ufc_event_details.csv <dir>/            # gitignored; the script aborts without it
cd <dir> && python3 generate_source_manifest.py && git diff src/sourceManifest.js
```

The generated file is committed as the generator actually produces it rather than
hand-edited to hide the drift; a hand-trimmed manifest would be one no generator
would ever emit, and the next CI run would reintroduce the difference anyway.

## Ratified data gates — all reproduced

| Gate | Expected | Observed |
|---|---:|---:|
| History rows | 17,644 | 17,644 |
| Unique bouts | 8,822 | 8,822 |
| Fighters | 2,737 | 2,737 |
| Rows whose `wc` changes | 4,508 | 4,508 |
| Rows whose `tb` changes | 804 | 804 |
| Rows changing both | 287 | 287 |
| Affected fighters | 1,433 | 1,433 |
| Affected canonical bouts (by result URL) | **3,687** | 3,687 |
| Distinct `wc` transitions | 68 | 68 |
| `Unknown` before → after | 1,483 → 0 | 1,483 → 0 |
| `tb` true → false | 12 | 12 |
| `tb` false → true | 792 | 792 |
| Asymmetric bouts before → after | 2,861 → 0 | 2,861 → 0 |
| Championship corners before → after | 14 → 794 | 14 → 794 |
| Reviewed Open Weight corners | 30 | 30 |

Largest transitions: `Welterweight→Lightweight` 340 · `Unknown→Heavyweight` 306
· `Unknown→Middleweight` 251 · `Lightweight→Featherweight` 249 ·
`Welterweight→Middleweight` 247 · `Unknown→Open Weight` 232.

Ledger rows by classification: non-title 4,141 · championship 794 ·
tournament final 90.

## Known examples

- **Vicente Luque vs Kelvin Gastelum, UFC 327 (2026-04-11)** — raw label
  `Middleweight Bout`. Luque's corner moves `Welterweight → Middleweight`;
  Gastelum's was already `Middleweight`. Both now `Middleweight`, both
  `tb=false`. This bout was one of the 2,861 asymmetric pairs.
- **Mateusz Gamrot vs Rafael Dos Anjos, UFC 299** — previously `Lightweight` on
  one corner and `Welterweight` on the other; now one agreed division.
- **UFC 18: The Road to the Heavyweight Title** — 7 bouts / 14 corners, all
  flagged by the old event-name rule. 12 corners corrected to `tb=false`; the
  2 remaining are Pat Miletich vs Jorge Patino, a genuine
  `UFC Welterweight Title Bout`. This is why the change total is 804 and not 806.
- **Sakuraba vs Silveira, UFC Ultimate Japan** — both bouts survive as separate
  rows with correct, independent metadata.

## Idempotence

Two consecutive runs with the same feed and `FIGHTMETRICS_ASOF=2026-08-13`
produce byte-identical `src/fightHistory.js` and `src/fightersData.js`
(`diff` reports no change).

## Model impact — exact zero

Measured with the ratified fixed-clock harness: impact ASOF `2026-08-13`,
`DAYS_SINCE_LAST` pinned to date-only (ASOF − `LAST_FIGHT_DATE`), explicit
`eventDate` passed on every call, real UFC 330 entries and contexts, both slot
orders. Verified byte-identical under two deliberately different fake wall
clocks (2026-08-14T12:00:00Z and 2027-03-09T23:45:00Z) and two timezones (UTC
and America/New_York).

| Output class | n | Deep equality vs origin/main |
|---|---:|---|
| Broad same-division matchups | 32,627 | **exactly equal** |
| Class-A direct sweep | 1,705 | **exactly equal** |
| UFC 330 bouts, both slot orders | 10 | **exactly equal** |

0 changed matchups, 0 changed probabilities, 0 pick flips. This is expected:
`fightHistory[].wc` has exactly one consumer (`src/App.js`, a display string),
and `tb` feeds only `total_title_bout_dif` (computed but never summed into the
v1 composite) and `featsV2.title_bouts` (v2 coefficient `0`). Roster `tb` is
unchanged in this PR, so `Math.max(history, d.tb)` still returns the stored
value.

## Test and build results

| Suite | Result |
|---|---|
| `test_weightclass_parser.py` | 25 passed |
| `test_asof_pin.py` | 6 passed |
| `test_correction6_history.py` | 19 passed |
| `test_correction5_identity.py` | 26 passed |
| `test_fight_event_dates.py` | 21 passed |
| `test_fight_data_integrity.py` | 5 passed |
| `test_source_manifest_scope.py` | 9 passed |
| `test_js_roster_parser.py` | 35 passed |
| `scripts/gate_closed_labels.py` | pass (120 labels, 8,847 rows) |
| Targeted golden / isolation / integrity | 4 files, 39 passed |
| **Full Vitest** | **32 files, 581 passed** |
| Production build | ✓ built |

No Stage-0 golden fixture was regenerated; all seven plus both snapshots are
byte-identical to origin/main. No file under `src/domain/` changed, so no model
source or arithmetic changed.

### One necessary test amendment

`test_correction5_identity.py::test_identity_and_division_come_from_the_same_parse`
asserted that the updater source contains `entry.fields.get('w')` — the roster
**division** read. Correction 6A deletes that read, because the only thing that
consumed it was the discarded history fallback; satisfying the old assertion
would mean keeping the defect's machinery alive as dead code. The assertion was
narrowed (and renamed) to keep both literal anti-regex guards, and now also
asserts via the AST that `wc_lookup` is not a live name. The invariant Correction
5 actually protects — no field-specific quoted pattern may reappear — is
unchanged and still enforced structurally by
`test_the_updater_has_no_quoted_field_regex`.

## Dry-run ledger

`research/correction6a_history_ledger.tsv` — every changed history record, with
fighter, opponent, date, event, raw source label, before/after `wc` and `tb`,
parser category, classification, and the bout's `ufcstats.com` result URL.

| Property | Value |
|---|---|
| Rows | 5,025 (4,508 `wc` + 804 `tb` − 287 both) |
| Affected canonical bouts | **3,687 distinct result URLs** |
| sha256 | `813da5f0cb30ce5da1fac7b81c3fbb5cb50818211fb3f12ada53014fc310ff4e` |
| Bytes | 1,007,135 |
| Unjoinable rows | 0 |
| Distinct source URLs | 3,687 |

**Withdrawn:** an earlier revision of this document reported **3,686** affected
bouts. That figure came from a coarse `(date, event, {fighters})` key, which
cannot separate Kazushi Sakuraba's two distinct bouts against Marcus Silveira on
the same card. Canonical bout identity is the **result URL**, and the corrected
count is **3,687**. Every other ratified count is unchanged.

Provenance is row-local: the ledger mirrors the updater's own pipeline (alias
normalisation, event canonicalisation, sort order) so each history entry carries
**its own** source row. A coarse `(fighter, opponent, date, event)` join would
report 2 duplicate keys and 3 unjoined rows — precisely the `(EVENT, BOUT)`
non-uniqueness and alias-normalisation traps the implementation avoids.

## Explicitly deferred

Not in this PR: **Class-A** alias repair · **Class-B** duplicate-identity removal
· **6B** career roster-`tb` reconciliation · **6C** current-division policy,
`wsrc` provenance and division overrides · `wlb` semantics · **Correction 2B**
TD-defence · any UFC 330 re-save. `src/upcomingData.js` is byte-identical and was
never opened for writing.
