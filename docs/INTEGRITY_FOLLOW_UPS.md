# Fighter-data integrity: findings deferred past Step 1

Step 1 (feed gates, provenance, publication; see `FEED_INTEGRITY.md`) does not
change any prediction payload. Each finding below would, so each is scheduled
for a later, separately reviewed step of the integrity repair plan, with its own
impact report (baseline commit, Greco revision and manifest hashes; v1, v2 and
C6 deltas; pick flips) computed side by side. Saved predictions are never
recomputed.

Recorded 2026-10-09 from the independent reviews of PR #49, measured on the
pinned feed `Greco1899/scrape_ufc_stats@1ccacc5cd4f642bd2deb8b278405a0205791bfa3`.

| # | Finding | Severity | Scheduled |
|---|---|---|---|
| 1 | Same-card rematch aggregation | should-fix | Step 7, with a Step 4 check |
| 2 | Incomplete identity migration on an approved rename | should-fix | Step 3 |
| 3 | Tale-of-the-tape values have no per-fighter review | tracked | Step 3 |
| 4 | Historical leakage is not ruled out | tracked | Step 2 |

## 1. Same-card rematch aggregation

`update_fighters.py` keys the result lookup (`result_lookup`) and the
round-stat join (`stats_by_bout`, used by `compute_opponent_stats`) by
EVENT+BOUT instead of by fight id. Two fights with one label on one card
collide. On the pinned feed that is the 1997 Sakuraba vs. Silveira rematch
(UFC Ultimate Japan, two distinct fight ids):

* both results get the durations `[111, 111]`; the fights lasted 224 and 111
  seconds;
* Sakuraba's opponent statistics count Silveira's 5 landed significant strikes
  as 10.

The fight-history entries themselves are not affected; the defect is in the
aggregates built from those two lookups. Step 1 only validates the duplicated
rows (`feed_exceptions.json`, `duplicateStatRows` and `sameCardRematch`).

**Fix:** key both lookups by fight id. Step 7 rebuilds durations from
per-fight round and time, so it carries the fix, with a same-label rematch
fixture test and both fighters in the impact report.

## 2. Incomplete identity migration

An approved rename (in the updater fixture, Figueiredo to "Audit Replacement")
now passes the Step 1 authorization gate, but the run leaves both names in the
roster and moves history to the new name. The gate authorizes the change; it
does not migrate the identity.

**Fix (Step 3):** an approved rename yields exactly one roster identity, with
its curated fields carried over, history, records and Elo under that one name,
and the old name kept only as an alias. Test: the approved rename leaves one
roster row.

## 3. Tale-of-the-tape review gap

`ufc_fighter_tott.csv` (DOB, height, reach, stance) is hash-pinned in
`source_snapshot.json` but sits outside the fight ledger, so an upstream change
to one fighter is not reviewed individually. A DOB change flows into
`fighter_profiles.json`, then `src/fighterBirthdates.js`, then age, then the v2
`younger` feature. Height and reach only fill empty fields.

**Fix (Step 3):** the refresh report lists per-fighter profile changes and
disagreements, and corrections go through a reviewed `profile_corrections.json`.

## 4. Historical leakage

The Step 1 replay (`research/integrity_step1/`) shows unchanged outputs and
predictions for one pinned feed and one baseline. It is not a leakage
guarantee for model training, backtests or future refreshes.

**Fix (Step 2):** point-in-time capture safeguards and the `live` /
`reconstructed` / `unknown` capture status.
