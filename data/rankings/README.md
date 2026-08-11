# Rankings data

FightMetrics uses two rankings sources, kept strictly apart:

- **Historical baseline** — the CC0 Kaggle `jerzyszocik/ufc-rankings-history`
  dataset, frozen into the reviewed cache
  `kaggle-history-through-2026-06-18.json`.
- **Current tables** — the official UFC rankings page, captured as
  source-labelled `media` and `meta` snapshots under `snapshots/`.

## Scope: what rankings are and are not used for

Rankings feed **fighter-profile and UI metadata only**.

- `CURRENT_MEDIA_RANKINGS` / `CURRENT_MEDIA_P4P` drive rank badges.
- `DIVISION_RANK_HISTORY` is a **data/research artifact with no runtime model
  consumer**. It is generated, validated and shipped so future analysis can use
  it, but nothing in `src/domain/model` or `src/domain/betting` may import it.

v1 is deprecated and frozen: it keeps its own legacy ranking path so its
arithmetic stays byte-exact until v1 is retired. The frozen 16-feature
`MODEL_V2` reads no ranking of any kind. `src/domain/rankings/__tests__/
boundary.test.js` enforces both rules by scanning source.

A historical rank must never be gated on a bout's recorded weight class: the
`wc` field in `fightHistory.js` is the **history owner's roster division**, not
the bout's division (the same bout disagrees across the two fighters' records
~30% of the time), so using it silently rewrites elite opponents to "unranked".

## June 2026 source boundary

UFC began publishing traditional media and Meta rankings together after June 22,
2026. From the Kaggle snapshot dated June 25, the four-column CSV contains the
union of both tables with no source column, producing multiple ranks for the
same fighter, division and date. The two systems cannot be separated losslessly.

The importer therefore:

1. uses Kaggle divisional snapshots **through 2026-06-18** only;
2. rejects conflicting pre-cutoff rows rather than silently choosing a rank;
3. stores independent `media` and `meta` snapshots scraped from UFC.com; and
4. extends the historical series **only** with source-labelled `media`
   snapshots, preserving continuity with the pre-transition history.

Pound-for-pound rankings are stored separately and never enter divisional
history. UFC publishes no Meta P4P board, so no Meta P4P export exists.

## The history cache

`kaggle-history-through-2026-06-18.json` is the reviewed, committed baseline in
transition form (`[[YYYYMMDD, rank], ...]`, `null` = explicit unranked
tombstone). Committing it means:

- regeneration is **offline and byte-for-byte deterministic**;
- the build does not fail when the upstream Kaggle dataset goes stale or
  disappears — post-cutoff rows are discarded anyway, so their age is
  irrelevant;
- the reviewed data cannot drift underneath the app without a visible diff.

`quarantinedRows` records reviewed upstream anomalies that are dropped on
import. Each is matched exactly; a quarantine that no longer matches any
upstream row fails the build rather than rotting silently.

## Validation

Every source path fails closed — the generator validates before it writes, so a
rejected input leaves committed files untouched:

| Check | Behaviour |
| --- | --- |
| Rank domain | champion `0`, contenders `1..15`; anything else rejected |
| Division completeness | a division losing ≥4 athletes, more than halving, or every division shrinking at once is rejected as a partial scrape |
| Snapshot ordering | a fetched snapshot older than the newest committed one for that source is rejected |
| Snapshot immutability | different content under an existing date is rejected for manual review, never overwritten |
| Retired divisions | closed out with tombstones on the first date they were not published, so nobody stays ranked forever |
| Cache integrity | schema, cutoff, monotonic dates, no leading tombstone, rank domain |
| UFC HTML | missing root/footer, short tables, bad ranks, unexpected divisions all rejected |

Ties (two athletes sharing a contender number) occur upstream and are
legitimate, so rank *uniqueness* is deliberately not asserted.

## Commands

```bash
npm run rankings:regen    # offline: rebuild from committed cache + snapshots
npm run rankings:update   # fetch UFC.com, then regenerate
npm run rankings:verify   # contract checks against the generated artifact
npm run rankings:test     # fail-closed validation tests
python3 scripts/update_rankings.py --refresh-kaggle   # rebuild the cache
```
