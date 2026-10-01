---
name: grade-card
description: Look up real fight results online and grade the pending entries in the Upcoming tab into ROI. Use when the user says grade the card, grade upcoming, settle the picks, or asks to fill in results for an event that already happened.
---

# Grade the upcoming card

Research the real outcome of every pending fight in the Upcoming tab and move it
into ROI with `actualWinner` / `actualFinish` filled in — the same move the
Upcoming tab's winner dropdown makes (`handleGradeUpcoming` in `src/App.js`).

## 1. Check where the data lives

Picks live in the **Supabase document store** (fightmetrics.app reads them live),
not in git. `scripts/grade_upcoming.mjs` reads and writes the store whenever
`.env.local` sets `FM_SUPABASE_URL` + `FM_SUPABASE_PUBLISHABLE_KEY`, as the
signed-in owner. Confirm the session first:

```bash
node scripts/fm-store.mjs whoami
```

- **`workspace "fightmetrics": owner`** — continue.
- **`not signed in`** — run `node scripts/fm-store.mjs login <the user's email>`
  in the background and ask the user to click the magic link **on this
  computer** (it redirects to `http://localhost:54399/callback`). The session is
  saved under `~/.config/fightmetrics/` and refreshes itself afterwards.
- **No Supabase configured** — the scripts fall back to the bundled
  `src/upcomingData.js` / `src/roiData.js` (the pre-database workflow). Say so;
  that only changes the local snapshot, not the live site.

Every write carries the revision it read, so if the card was changed elsewhere
(the app, another session) between reading and writing, the write is refused
with "stale revision" — just re-run.

## 2. Read what is pending

```bash
node scripts/grade_upcoming.mjs pending
```

Prints the entries whose `eventDate` is in the past and whose `actualWinner` is
still empty. Add `--all` to include events that have not happened yet (only
useful to inspect — never grade a fight that has not occurred). If nothing is
pending, say so and stop.

The script is tracked in the repo (`scripts/grade_upcoming.mjs`). If it is
ever missing, say so rather than hand-editing data — never edit the database or
the data files by hand.

Sanity-check the pending set against what the user asked for *before* spending
research calls. If they named an event and it is not in the list, resolve that
mismatch first (see step 1); do not silently grade whatever else happens to be
pending. Not every bout on a card is tracked, so a 13-fight event may legitimately
show fewer pending entries.

## 3. Research the results

Group by `eventName` and look the event up **once**, not once per fight.

Use two independent sources and require them to agree:

1. **Wikipedia's event page** — the full card with method and round. Find it with
   `WebSearch`; the title is usually the real event name (`UFC Fight Night: Silva
   vs. Delgado`), not the promotional one (`Noche UFC`).
2. **The UFC.com recaps** — main card and prelims are separate articles
   (`.../news/<event>-results-...` and `.../news/<event>-prelims-results`).

`ufcstats.com` is HTTP-only and `WebFetch` upgrades to HTTPS, so it fails with
`ECONNREFUSED`. Do not spend a call on it; the pair above is the working default.

For each pending fight record:

- **winner** — must be the exact `fighterA` or `fighterB` string from the entry,
  or `DRAW` / `NC`. Sites spell names differently (accents, nicknames, "Machado
  Garry" vs "Garry", "Thomas Gantt" vs "Tommy Gantt", "Rong Zhu" vs "Rongzhu");
  map back to the entry's spelling yourself, and never rewrite the entry's names
  to match a source.
- **method** — normalize to `KO/TKO`, `SUB`, or `DEC`. A technical submission is
  `SUB`. DQ or anything that does not map cleanly: use `""` and note it.

Rules:

- Never guess. If two sources disagree, the fight was cancelled or scratched, or
  the card is not clearly finished, leave that entry pending and report why.
- A fight pulled from the card is not a grade — it should be deleted in the app,
  not graded. Flag it and let the user decide.

## 4. Show the user before writing

Present one table: fight → result (winner + method) → whether the tracked side
hit → source URL. Call out anything you could not resolve. Wait for the go-ahead
unless the user already said to apply without asking.

## 5. Apply

Write the confirmed results to a JSON file in the scratchpad directory:

```json
[{ "id": "1789266615965-s7a9ls", "actualWinner": "Jean Silva", "actualFinish": "SUB" }]
```

Then dry-run and apply:

```bash
node scripts/grade_upcoming.mjs apply <results.json> --dry-run
node scripts/grade_upcoming.mjs apply <results.json>
```

The script validates every id, name, and method against the pending entries and
refuses to write anything if one is wrong. The whole card is then applied as
**one atomic batch** — every graded fight is deleted from Upcoming and put at the
top of ROI together, so a failure leaves nothing half-applied. Each entry is
carried across untouched apart from the two result fields.

The change is live on fightmetrics.app as soon as the script reports `Saved to
Supabase …` — there is nothing to commit, push or deploy. Verify by loading the
ROI tab. If the user wants the bundled snapshot in git refreshed too (it is the
offline fallback and rollback copy), `node scripts/fm-store.mjs export
--write-files` rewrites `src/*Data.js` from the server byte-for-byte; commit that
only if asked.

Finish by reporting the record for the card (hits/misses on tracked sides, and
separately on entries with `betAction` other than `NO BET`).

Note that grading through the app's winner dropdown sets `actualWinner` but not
`actualFinish`, so much of the older ROI history has a blank finish; this script
always sets both. Do not backfill the old ones unless asked.
