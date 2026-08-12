# PR A dry run — aggregate-input alias canonicalization

Base: `origin/main` at `66f558b97b14dc87aa253920ac5e736a918a8c4c`
Branch: `fix/aggregate-alias-canonicalization`
Date: 2026-08-12

This PR carries the data-pipeline half of the fix-2 investigation. All ATD work
— the versioned cache, the refresh script, the null/Unknown runtime, and the
model weight change — is deliberately excluded and ships separately.

## The defect

`canonicalize_undated_events` resolves an undated event onto its dated twin and
returns an alias map. The updater applied that map to `ufc_fight_results.csv`
only. `ufc_fight_details.csv` and `ufc_fight_stats.csv` were left alone, so the
per-round stat rows for an aliased card survived under both event spellings and
were aggregated twice.

Fight *records* were correct, because they are built from the deduplicated
result rows. Every *rate* statistic derived from round stats was inflated.

## Inputs

Greco1899 `scrape_ufc_stats` snapshot, retrieved 2026-08-12.

| Property | Value |
|---|---|
| Archive SHA-256 | `d25ac59cbb091055418c7b985df488405fd9da0887f3140d53d245b50d730fae` |
| Events | 783 |
| Max event date | 2026-08-08 |

Two duplicated cards are present:

| Alias spelling (undated) | Canonical (dated) | Bouts |
|---|---|---:|
| `UFC Fight Night: Grasso vs. Shevchenko 2` | `Noche UFC: Grasso vs. Shevchenko 2` | 11 |
| `UFC Fight Night: Lopes vs. Silva` | `Noche UFC: Lopes vs. Silva` | 14 |

## Method

Two isolated runs over byte-identical inputs: `git archive origin/main` versus
the same tree with this branch's `update_fighters.py` and
`fight_data_integrity.py`. Neither run wrote into the repository.

## Rows canonicalized

| Input | Alias rows | Exact duplicates collapsed | Conflicts |
|---|---:|---:|---:|
| `ufc_fight_results.csv` | 25 | 25 | 0 |
| `ufc_fight_details.csv` | 25 | 25 | 0 |
| `ufc_fight_stats.csv` | 116 | 116 | 0 |

Cross-event rows must be payload-identical after whitespace/NaN normalization.
Any disagreement raises `AggregateConflictError` rather than picking a winner.
Repeated identities *within a single source event* are left alone — UFCStats
has historical cards that reuse a bout label, and collapsing those would erase
a real fight.

## What changed

50 fighters — exactly the roster of the two duplicated cards.

| Field | Fighters changed |
|---|---:|
| `asl` | 50 |
| `sapm` | 49 |
| `ctrl` | 49 |
| `atl` | 46 |
| `asa` | 36 |
| `hdpct` | 36 |
| `sdef` | 35 |
| `asp` | 31 |
| `lgpct` | 30 |
| `atp` | 27 |
| `kd` | 12 |

Record, streak, last-fight, rating, ranking and physical fields
(`wi lo ws ls lfd dsl kow sbw dcw elo crd dr p4p atd ag ht rh st w wlb`)
changed for **zero** fighters. The roster membership is identical — no fighter
added or removed.

### Artifact hashes

| Artifact | `origin/main` | This branch |
|---|---|---|
| `src/fightHistory.js` | `46bff36e…9df0a5` | `46bff36e…9df0a5` (identical) |
| `src/fightersData.js` | `4981fe60…5fa76f` | `4e15b1cc…30bf5f` |

`fightHistory.js` is byte-identical, confirming the correction is confined to
aggregate rate statistics.

### Idempotence

Two consecutive runs of the corrected updater over the same inputs produced
identical artifacts:

```
4e15b1ccbc598e73f0e62994297d2f470f52f49c2a23fc722a70b53c5330bf5f  src/fightersData.js
46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5  src/fightHistory.js
```

### Dustin Stoltzfus

The only UFC 330 card fighter on either duplicated card.

| Field | Duplicated input | Canonical input |
|---|---:|---:|
| `asl` | 3.40 | 3.28 |
| `asa` | 0.88 | 1.01 |
| `atl` | 1.90 | 2.03 |
| `atp` | 0.33 | 0.36 |
| `sapm` | 3.32 | 3.25 |
| `ctrl` | 167.45 | 172.20 |
| `hdpct` | 0.50 | 0.51 |
| `lgpct` | 0.23 | 0.24 |

## UFC 330 impact

All ten saved matchups recomputed against both datasets using unmodified
`origin/main` model code — this PR changes no JavaScript, so the aggregates are
the only variable. Deltas are percentage points for fighter A.

| Matchup | v1 Δpp | v2 Δpp |
|---|---:|---:|
| Makhachev–Garry | 0 | 0 |
| Dern–Robertson | 0 | 0 |
| **Abdul-Malik–Stoltzfus** | **−0.80894** | **−0.61716** |
| Barboza–Ribovics | 0 | 0 |
| Njokuani–Alvarez | 0 | 0 |
| Turner–Fernandes | −0.00832 | −0.00675 |
| Johnson–McConico | +0.00334 | +0.00414 |
| Luque–Gore | 0 | 0 |
| Magny–Brahimaj | 0 | 0 |
| Wells–Orolbai | −0.00048 | −0.00010 |

The three sub-0.01pp movers contain no affected fighter; they shift only
because `DIVISION_UFC_AVERAGES` is derived from the whole roster at module
load, so any aggregate correction moves division means fractionally.

`src/upcomingData.js` is untouched. Saved UFC 330 entries stay frozen until the
remaining corrections land.

## Provenance corrections

`generate_source_manifest.py` conflated two different questions under one field.
`sourceInputs` now records **data lineage** — the files whose contents can
actually appear in the artifact — and `generatorRequiredInputs` separately
records what the generating script refuses to start without.

| Module | `sourceInputs` (lineage) | `generatorRequiredInputs` |
|---|---|---|
| `fightHistory` | results, event details, fight details | all four |
| `fightersDataAggregates` | all four | all four |
| `elo` | results, event details | results, event details |

`fightHistory.js` never reads `ufc_fight_stats.csv` — its entries come from the
result rows, the event dates, and `detail_lookup` (round, time, weight class).
Listing all four as its sources overstated its lineage; `update_fighters.py`
requires all four to *execute*, which is a different claim.

### maxObservedEventDate could silently become null

`max_event_date_in_csv` returned `None` for a missing file, and every
Greco-backed module's `maxObservedEventDate` flowed from it. That is how the
merged manifest came to assert `null`: **`update-rankings.yml` regenerates the
whole manifest but downloads no fight data**, and `ufc_event_details.csv` is not
tracked in the repository. Every weekly rankings run that changed a rankings
artifact rewrote three unrelated modules' provenance to `null`.

The shipped manifest on `origin/main` still shows the damage:

```
fightHistory             maxObservedEventDate=None
fightersDataAggregates   maxObservedEventDate=None
elo                      maxObservedEventDate=None
```

**Downloading the Greco feed in the rankings workflow is not a fix.** That job
rebuilds only `rankingsData.js` and `rankingsHistoryData.js`. If it recomputed
the date from a freshly downloaded feed, it would pair an *unchanged*
`fightHistory` / `fightersData` / `elo` contentHash with a *newer* coverage
claim — asserting data those artifacts do not contain. Replacing a false `null`
with a false newer date is not an improvement.

Generation is therefore module-scoped:

| Scope | Regenerates | Greco inputs |
|---|---|---|
| `--scope full` | every module | required, fails closed |
| `--scope rankings` | the two rankings modules | none read |

A rankings-scoped run copies every other module object through verbatim,
preserving the last value a full run actually verified. `update-rankings.yml`
now calls `--scope rankings` and downloads nothing; the Greco download added in
the first revision of this PR has been removed.

Verified locally, with no Greco CSVs on disk:

```
$ python3 generate_source_manifest.py --scope rankings   # exit 0
$ python3 generate_source_manifest.py --scope full       # exit 1
FATAL: required aggregate input is missing: ufc_event_details.csv. Refusing to
emit maxObservedEventDate: null for a provenance claim that cannot be verified.
```

`test_source_manifest_scope.py` pins the behaviour with 9 tests: a
rankings-scoped run succeeds against an empty input directory; every
non-rankings module object is byte-identical before and after; full scope still
fails closed for each of the four inputs in turn; a feed dated a year in the
future cannot advance the preserved dates during a rankings run; and a scoped
run refuses outright when the existing manifest has no verified Greco modules
to preserve.

The last of those was mutation-checked. Letting `--scope rankings` fall through
to full generation makes it fail with exactly the regression signature:

```
AssertionError: '2027-08-13' != '2026-08-08'   (fightHistory)
AssertionError: '2027-08-13' != '2026-08-08'   (fightersDataAggregates)
AssertionError: '2027-08-13' != '2026-08-08'   (elo)
```

`update_fighters.py` also now loads its four inputs through `load_required_csv`
instead of `try/except: has_stats = False`, which previously let a missing or
unreadable stats file silently produce a roster with no rate statistics.

The module docstring claimed the script never touches `asl asp asa atl atp`.
It has computed and written all five for some time. Corrected.

## Tests and build

Run from a clean checkout of this branch (`npm ci --include=dev`):

| Suite | Result |
|---|---|
| `python3 test_fight_data_integrity.py` | 5/5 pass |
| `python3 test_source_manifest_scope.py` | 9/9 pass |
| `python3 test_fight_event_dates.py` | 21/21 pass |
| `npx vitest run` | 493/493 pass, 28 files |
| `npm run build` | pass |

`test_fight_data_integrity.py` runs against committed fixtures in
`tests/fixtures/fight-data-alias/`: an exact duplicated alias card, a
conflicting alias/canonical pair that must hard-fail, a normal card with no
aliases, and same-event repeated identities that must survive.

`test_new_fields.py` is not included above. It imports `backtest_combo_v2`,
which is not in the repository, so it fails on any clean checkout. That is
pre-existing and is being reported separately rather than silently excluded.

## Not in this PR

- Versioned ATD cache, refresh script, and `atd_source.py`
- `atd:null` on newly seeded fighters
- Null/Unknown ATD runtime and the drop-not-redistribute model change
- ATD provenance module in the manifest
- The apostrophe identity bug in the roster parser at `update_fighters.py`,
  which freezes record and aggregate updates for nine fighters including Sean
  O'Malley. Tracked as correction 5 with its own dry run; deliberately not
  fixed here because it produces a broad, unrelated data diff.
