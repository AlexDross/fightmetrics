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

Every input must also have exactly the reviewed header
(`feed_validation.INPUT_SCHEMA`, column order included). A new, missing or
reordered column fails the run before anything is computed: a column the
updater would read but the ledger does not cover (for example a `WEIGHTCLASS`
added to `ufc_fight_details.csv`) could otherwise change generated history
while every ledger row stayed the same. Accepting a new column is a reviewed
code change to `INPUT_SCHEMA`, and to `build_ledger` if the updater reads it.

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
| Round | 1 to 5, and not after the last period of the scheduled `TIME FORMAT` |
| Clock | `M:SS` with seconds 00–59; within the scheduled length of the period it ended in; at most 5:00 from UFC 21 (1999-07-16) on |
| Format | `N Rnd (m-m-…)` or `N Rnd + [k]OT (m-…)` listing every period, or `No Time Limit` (one unbounded period); anything else is refused as unsupported |
| Identity | the two corners differ after `name_aliases.json` |
| Round stats | exactly one row per fighter per round 1..ROUND, no strangers |
| Stat cells | `N of M` with N ≤ M; KD/SUB.ATT/REV. whole numbers |
| Stat sums | HEAD+BODY+LEG = DISTANCE+CLINCH+GROUND = SIG landed; SIG ≤ TOTAL |
| Control time | `M:SS`, never longer than the round (or its scheduled period) |
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
| `statsUnavailable` | 21 | round coverage, only while every stat row is an empty placeholder; a row with any content is validated in full |
| `duplicateStatRows` | 2 | repeated (round, fighter) rows, only on a shared rematch label and never more copies than fights sharing it |
| `controlTimeUnavailable` | 181 | a CTRL of exactly `--` or blank; a malformed clock is still invalid |
| `sameCardRematch` | 2 | one EVENT+BOUT label shared by the two fights |

Ids no longer needed are reported on each run for removal.

## 3. The fight ledger and upstream corrections

`source_ledger.json` holds one row per published fight, keyed by fight id:

| Column | Content | Change policy |
|---|---|---|
| `event` | event name | **protected** |
| `date` | ISO event date | **protected** |
| `bout` | `Fighter A vs. Fighter B` as the feed wrote it | **protected** |
| `fighters` | the same with `name_aliases.json` applied: the identities history and records are filed under | **protected** |
| `outcome` | `W/L`, `L/W`, `D/D`, `NC/NC` | **protected** |
| `detail` | SHA-256 of METHOD, ROUND, TIME, TIME FORMAT, WEIGHTCLASS | reported |
| `stats` | SHA-256 of the fight's round rows, sorted, over ROUND, FIGHTER, KD, SIG.STR., SIG.STR. %, TOTAL STR., TD, TD %, SUB.ATT, REV., CTRL, HEAD, BODY, LEG, DISTANCE, CLINCH, GROUND | reported |

Each refresh compares the new feed with the committed ledger fight by fight:

* **A fight that disappears** is refused, even when the total number of fights
  grows.
* **A change to a protected column** is refused. That includes an edit to
  `name_aliases.json` that files an existing fight under another identity,
  or merges two fighters into one, even though the feed itself did not move.
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
        "old": {"event": "...", "date": "...", "bout": "...", "fighters": "...", "outcome": "L/W"},
        "new": {"event": "...", "date": "...", "bout": "...", "fighters": "...", "outcome": "W/L"},
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
* **Reruns.** When the published ledger is already at the same revision and
  already holds a correction's `new` state (or no longer holds a removed
  fight), the correction is reported as already applied, so re-running a
  reviewed refresh succeeds. A correction at that revision for a fight in any
  other state still fails.
* **Statistic and detail changes** (the two hashes) are detected
  independently of protected changes: a fight whose outcome and statistics
  both moved is in both lists, and counts toward the bulk alarm. They are
  accepted and printed
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
5. If a replacement fails, or an exception (including an interrupt) arrives
   after a replacement completed, every target whose replacement was
   attempted is restored, and a target that did not exist before is deleted.
   The error says whether the rollback completed. A restore that succeeds
   consumes its `.rollback` copy (the original is back in the target); only a
   target whose restore failed keeps its `.rollback`. So after an incomplete
   rollback, a target without a `.rollback` may be an original, not a new file.
6. **Before step 2, a publish refuses to start** while any `<file>.staged` or `<file>.rollback`
   exists beside one of its targets, and writes nothing. After an interrupted
   publish those files can be the only copy of the previous generation: a
   retry would otherwise copy an already-replaced target over its
   `.rollback` and lose the original.

This is not a filesystem transaction. A process kill or power loss between two
replacements, or during the rollback, can leave files from two generations on
disk. That state is detected, not prevented:
`artifact_generation.json` records the SHA-256 of every other output, and
`scripts/verify_artifact_set.py` first checks a fixed contract defined in the
script itself, not in the documents it checks:

* `artifact_generation.json`, `source_snapshot.json`, `source_ledger.json` and
  the `SOURCE_MANIFEST` export must each be a JSON object; `null`, a number, a
  string or a list is a failure, as is a nested table of the wrong type;
* the four updater outputs, each with a 64-hex SHA-256 (an empty, `null` or
  malformed digest fails, and the file is still read);
* the eight manifest modules, each with its file and a 64-hex `contentHash`;
* the snapshot's five pinned inputs;
* for the three Greco-backed modules, the reviewed input set
  (`MODULE_INPUTS`): `sourceInputs` and `sourceSnapshot.inputSha256` must both
  be exactly that set, so shortening the two together still fails;
* `repository` (the Greco repository), `revision` (a full commit SHA) and
  `revisionCommittedAt` (an ISO-8601 time with offset) in the snapshot and in
  every module snapshot, validated before they are compared, so a field
  missing everywhere is not "equal".

Every required file is read whatever its metadata says. The verifier then
fails on any file that does not match its recorded hash, on any module input
hash that is not the snapshot's, on any manifest `contentHash` mismatch, on any
disagreement about the upstream revision between the snapshot, ledger,
generation record and manifest, and on leftover `.staged`/`.rollback` files.
It runs:

* in the refresh workflow after the manifest is regenerated (working tree);
* in the refresh workflow's commit step with `--index`, against what will be
  committed. A regenerated artifact missing from the `git add` list leaves its
  stale copy in the index, which no longer matches the staged hashes;
* in CI on every PR and push to main, on the committed files.

A hand edit to a generated artifact therefore fails CI until the generators are
re-run.

### Recovering from an interrupted publish

The scheduled workflow runs on a fresh runner, so leftovers only survive a
local run (or a runner kept alive by hand). Recover when `update_fighters.py`
stops with `an earlier publish was interrupted` or `ROLLBACK INCOMPLETE`, or
the verifier reports a `leftover from an interrupted publish`.

The files on disk cannot tell you what the original state was. A target
without a `.rollback` may have been restored already (a successful restore
consumes its backup), may never have been backed up (an interruption while
backups were being made), or may have been created by the publish. So do not
move a `.rollback` back, and do not delete a target, by hand. Recover the whole
set from a known-good commit instead:

1. **Choose the commit.** It must hold a complete, consistent artifact set,
   normally the commit the interrupted run started from (`HEAD`, if nothing was
   committed since). The tool refuses any commit that does not pass
   `scripts/verify_artifact_set.py` on its own tree.
2. **Run** `python scripts/recover_artifact_set.py --commit <commit>`. It:
   * saves the current state under `.publish-recovery/<time>-<commit>/`
     (git-ignored): a copy of every set file in the working tree, the staged
     copy of every set file whose index entry differs from the commit, and
     every `.staged`/`.rollback` leftover, which is moved there;
   * restores the complete artifact and provenance set
     (`verify_artifact_set.ARTIFACT_SET`: `artifact_generation.json`,
     `source_snapshot.json`, `src/sourceManifest.js`, the four updater outputs
     and every manifest module file) from that commit into **both the working
     tree and the index** (`git restore --source=<commit> --staged --worktree`).
     `git checkout -- <files>` is not enough, because it restores from the
     index, which can hold staged changes;
   * re-runs the verifier on the working tree and on the index, and exits 0
     only when both are consistent.

   It never deletes a file. A file the interrupted publish created is replaced
   by the commit's copy, and its new content is kept under `worktree/`.
3. **Re-run the updater.** The saved directory can be deleted once you no
   longer need it.
