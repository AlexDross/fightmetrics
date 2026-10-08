# Fighter-feed integrity: gates, corrections and publication

The scheduled refresh (`.github/workflows/update-fighters.yml`) rebuilds
`src/fightersData.js`, `src/fightHistory.js` and `fighter_profiles.json` from the
Greco1899/scrape_ufc_stats CSVs. This page says what it refuses, how a human
approves an upstream correction, and what the publication step does and does
not guarantee.

## 1. Pinned inputs

`record_source_snapshot.py` writes `source_snapshot.json`: the full upstream
commit SHA and the SHA-256, size and record count of each of the five CSVs.
`update_fighters.py` refuses to run when any CSV on disk differs from the
pinned hash, so every artifact can name the revision it was built from. Record
counts are informational only; section 3 decides whether fights were lost.

To rebuild from a specific upstream revision (for example the one a correction
was reviewed against), run the workflow by hand with the `greco_revision` input.

## 2. Completed-feed validation (`feed_validation.validate_completed_feed`)

Runs on the canonicalised, dated inputs before anything is computed. Every
completed fight must have:

| Check | Rule |
|---|---|
| Identity | a `fight-details/<16 hex>` URL; no id used twice |
| Date | resolved (directly, by reviewed override, or by alias); not after today |
| Outcome | one of `W/L`, `L/W`, `D/D`, `NC/NC` |
| Round | 1 to 5 |
| Clock | `M:SS` with seconds 00–59; at most 5:00 from UFC 21 (1999-07-16) on |
| Round stats | exactly one row per fighter per round 1..ROUND, no strangers |
| Stat cells | `N of M` with N ≤ M; KD/SUB.ATT/REV. whole numbers |
| Stat sums | HEAD+BODY+LEG = DISTANCE+CLINCH+GROUND = SIG landed; SIG ≤ TOTAL |
| Control time | `M:SS`, never longer than the round |
| Labels | no EVENT+BOUT label shared by two fights |
| Orphans | no round stats without a completed result |

`python update_fighters.py --audit-feed` prints every problem grouped by kind,
with all fight ids, and writes nothing.

### Reviewed historical exceptions (`feed_exceptions.json`)

Exceptions are fight-scoped: each category lists exact fight ids, carries a
reason and a `dateRange`, and waives only its own check for only those fights.
An exception used outside its date range is refused. As reviewed against
revision `1ccacc5` all of them are pre-2000 records:

| Category | Fights | Waives |
|---|---|---|
| `statsUnavailable` | 21 | coverage and cell checks (placeholder `--` rows only) |
| `duplicateStatRows` | 2 | repeated (round, fighter) rows |
| `controlTimeUnavailable` | 181 | CTRL recorded as `--` or blank |
| `sameCardRematch` | 2 | one EVENT+BOUT label shared by the two fights |

Ids no longer needed are reported on each run for removal.

## 3. The fight ledger and upstream corrections

`source_ledger.json` holds one row per published fight, keyed by fight id:

| Column | Content | Change policy |
|---|---|---|
| `event` | event name | **protected** |
| `date` | ISO event date | **protected** |
| `bout` | `Fighter A vs. Fighter B` (aliases applied) | **protected** |
| `outcome` | `W/L`, `L/W`, `D/D`, `NC/NC` | **protected** |
| `detail` | SHA-256 of METHOD, ROUND, TIME, TIME FORMAT, WEIGHTCLASS | reported |
| `stats` | SHA-256 of the fight's round rows, sorted, over ROUND, FIGHTER, KD, SIG.STR., SIG.STR. %, TOTAL STR., TD, TD %, SUB.ATT, REV., CTRL, HEAD, BODY, LEG, DISTANCE, CLINCH, GROUND | reported |

Each refresh compares the new feed with the committed ledger fight by fight:

* **A fight that disappears** is refused, even when the total number of fights
  grows.
* **A change to a protected column** is refused.
* Either is accepted only by an entry in `upstream_corrections.json` that names
  the fight id, the change (`removed` or `modified`), the exact upstream
  revision, and the exact old and new protected values:

  ```json
  {
    "corrections": [
      {
        "fightId": "514366f770553cc9",
        "change": "modified",
        "upstreamRevision": "<full 40-character Greco commit>",
        "old": {"event": "...", "date": "...", "bout": "...", "outcome": "L/W"},
        "new": {"event": "...", "date": "...", "bout": "...", "outcome": "W/L"},
        "reviewedBy": "...",
        "evidence": "link to the ufcstats page or commission record"
      }
    ],
    "bulkStatReviews": []
  }
  ```

  An entry is used only at its revision and only for exactly the change it
  describes. A correction at the current revision that matches nothing is
  itself an error, so an entry cannot be stretched to cover a different or
  later change. `"new": null` is used for `removed`.
* **Statistic and detail changes** (the two hashes) are accepted and printed
  as `statistics changed upstream: <id>` in the run log; the ledger diff in the
  bot commit is the durable record. ufcstats does correct round statistics
  after events and the app should take those corrections.
* **More than 25 changed fights in one refresh** is a bulk alarm: the run fails
  unless `bulkStatReviews` lists exactly those fight ids for that revision.
  The threshold is only an alarm; smaller sets are accepted because they are
  reported, not because they are small.

Neither file is ever written by the workflow. When the run fails on a change,
review it, add the entry by hand in a PR, then re-run the workflow with
`greco_revision` set to the reviewed revision.

## 4. Publication and recovery

`artifact_publish.publish_artifacts` publishes the updater's outputs as a set:

1. Every output is computed and validated first.
2. Each is written in full to `<file>.staged`.
3. Each existing target is copied to `<file>.rollback`.
4. Targets are replaced one at a time (`os.replace`, atomic per file), with
   `artifact_generation.json` last.
5. If a replacement fails, every replaced target is restored, and a target
   that did not exist before is deleted. The error says whether the rollback
   completed.

This is not a filesystem transaction. A process kill or power loss between two
replacements, or during the rollback, can leave files from two generations on
disk. That state is detected, not prevented:
`artifact_generation.json` records the SHA-256 of every other output, and
`scripts/verify_artifact_set.py` fails on any file that does not match it, on
any manifest `contentHash` mismatch, on any disagreement about the upstream
revision between the snapshot, ledger, generation record and manifest, and on
leftover `.staged`/`.rollback` files. It runs:

* in the refresh workflow after the manifest is regenerated (working tree);
* in the refresh workflow's commit step with `--index`, against what will be
  committed. A regenerated artifact missing from the `git add` list leaves its
  stale copy in the index, which no longer matches the staged hashes;
* in CI on every PR and push to main, on the committed files.

A hand edit to a generated artifact therefore fails CI until the generators are
re-run.
