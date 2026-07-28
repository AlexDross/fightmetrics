# Foundation Stage 2 — cleanup

Three narrow commits. **No application code touched**; nothing that ships to the
browser changed.

| Commit | Change |
|---|---|
| `c33cbe0` | gitignore three large regenerable backtest artifacts |
| `07bd4d2` | ignore regenerable fighter test output |
| `15d66f3` | retire the inert card-intel chain (Gate B: **retire**) |

Nothing was deleted from disk in the first two. `backtest_ledger.json`,
`backtest_results_age.json`, `backtest_results_momentum.json` and
`src/fightersData_test.js` all remain locally — they were already untracked, so
these are ignores, not deletions. `src/fightersData_test.js` is the intentional
dry-run output of `python3 patch_atd.py --out src/fightersData_test.js`
(documented at `patch_atd.py:12`), not dead weight.

`backtest_results.json` and `backtest_results_original.json` are deliberately
**not** ignored — `BASELINE_NOTES.md` treats them as the authoritative 60.71 %
record.

## Card-intel retirement

Deleted: `.github/workflows/update-card-intel.yml`, `generate_card_intel.py`,
`generate_upcoming_card.py`. From `update_fighters.py`, removed **only** the
`UPCOMING_PATH` constant, the `generate_upcoming_card()` function and its
invocation — 99 lines, 694 → 595. Nothing else in that file was touched.

**Pipeline validated end to end.** `update_fighters.py` was run in an isolated
copy of the repo (so the real data files could not be modified): exit 0, patched
2,272 fighters, rebuilt 2,694 histories, and **did not create
`src/upcomingCard.js`** anywhere in the tree. Both CI validation steps passed on
that run — the Node import check across
`fightersData`/`fightHistory`/`eloModule`/`cardioModule`, and
`scripts/verify-fighter-identity.mjs`.

No references remain in `src/`, `.github/` or any tracked non-doc file.
`update-fighters.yml` is now the only workflow. Historical mentions remain in
`CODEX_CLAUDE_HANDOFF.md` and `research/code_health_audit.md`; those are records.

## Verification

| Check | Result |
|---|---|
| Production build | exit 0, no `.map`, 0 bridge markers, 4.5 MB |
| Visual vs Stage 1b | identical=12, within-tolerance=2, fail=0 |
| Fighter/history join | OK, `rosterHistoryHash de0704a5`, all 2,273 fighters |
| Goldens | 2 match, **4 mismatch — fully explained below** |

---

## Finding 1 — the golden capture window was crossed

The four mismatching goldens (`entries`, `fighters`, `model`, `roster`) are **not
a regression**. Stage 0 predicted this precisely: `DAYS_SINCE_LAST` flips for all
2,179 fighters simultaneously at **12:00 UTC**, so a capture is only comparable
to a reference taken within the same 12:00-UTC window.

- reference captured `2026-07-28T03:28Z`
- candidate captured `2026-07-28T14:31Z`

Proven attributable rather than assumed. Across the 38 fixture fighters:

```
total differing (fighter, field) pairs : 32
fields that differ                     : DAYS_SINCE_LAST   32
distinct deltas                        : [0, 1]
PROVEN: DAYS_SINCE_LAST is the ONLY input that changed.
```

Everything designed to be date-independent still matched exactly:
`identityKeys` SAME, `stableHashes` SAME, `rosterStableHash 0f2c80cd` SAME,
`rosterHistoryHash de0704a5` SAME, plus `statistics.golden.json` and
`characterisation.json`.

### RESOLVED — the capture clock is now frozen

This was originally written with a recommendation to schedule Stage 3 shortly
after 12:00 UTC. **That advice is withdrawn.** Regression correctness must not
depend on the wall clock, and Stage 4's future frozen *unit* fixtures do not help
the Stage 3 *browser-capture* gate, which is what Stage 3 actually runs against.

`captureGoldens.cjs` now pins the browser clock in its default regression mode.
It reads `reference.captureIso` from `baseline/REFERENCE_HASHES.json` and
installs the shim via `evaluateOnNewDocument`, i.e. **before `page.goto`** —
necessary because `App.js` assembles `FIGHTERS` and `DAYS_SINCE_LAST` during
module evaluation, so patching after navigation would be too late.

Verified at **14:38 UTC**, eleven hours outside the reference window: all six
canonical hashes match, join OK, `rosterHistoryHash de0704a5`.

The shim freezes `Date.now()` and zero-argument `new Date()` only. Twelve
properties probed, all passing: `new Date(iso)`, `new Date(ms)`,
`new Date(y,m,d)`, `Date.parse`, `Date.UTC`, `instanceof Date` for both
construction forms, prototype methods, `Date()` without `new` returning a string,
and date arithmetic.

`--live-time` opts into a genuine wall-clock capture (needed when re-initialising
a reference); it will not match committed fixtures outside their window. The mode
and effective timestamp are logged on every run.

**Operational rule:** capture-based golden comparison is now time-independent. If
one mismatches, it is the code — check the clock line in the log only to confirm
the run was in frozen mode.

## Finding 2 — Tailwind v4 scans Python files (Stage 1b defect)

Stage 2's CSS shrank from **52,469 → 51,886 bytes** despite touching no bundled
code. Two hypotheses were tested rather than assumed:

- *`.gitignore` affects v4 source detection?* **No.** Ignoring
  `src/fightersData_test.js` changed the CSS by zero bytes and zero classes.
- *v4 scans `.py` files?* **Yes.** A probe file `zz_probe.py` containing
  `x = "mt-77 pb-83 text-fuchsia-700"` caused `.mt-77`, `.pb-83` and
  `.text-fuchsia-700` to be emitted into the production stylesheet (+187 bytes).

So the reduction is real and benign: deleting two Python scripts and 99 lines of
a third removed spurious class-like strings that Tailwind had been compiling into
production CSS.

**But it exposes a Stage 1b regression I missed.** Tailwind v3 was configured
with explicit scoping:

```js
content: ['./index.html', './src/**/*.{js,jsx}']
```

v4 replaced that with automatic detection over the whole project root. With ~40
Python scripts, markdown, and assorted JSON at the root, the v4 stylesheet
contains junk classes from files that are not part of the application. The
Stage 1b note that "no safelist is needed" was correct about *missing* classes
but silent about *extra* ones.

### RESOLVED — source detection is now scoped

Fixed in its own commit rather than deferred to Stage 8. `src/style.css`:

```css
@import 'tailwindcss' source(none);
@source '../index.html';
@source './**/*.js';
@source './**/*.jsx';
```

Two things to know if you touch this:

- **Paths resolve relative to the stylesheet**, `src/style.css` — so the root
  page is `../index.html` and the app sources are `./**`. `./index.html` and
  `./src/**` would resolve from the wrong directory and silently match nothing.
- **A brace group breaks the build.** `'./**/*.{js,jsx}'` fails with
  `Invalid declaration: js,jsx` on tailwindcss 4.3.3 — the group collides with
  CSS block syntax. It fails *even inside a comment*, so the literal form is not
  written anywhere in the file.

**Binding probes.** With a throwaway `zz_scope_probe.py` at the repo root
containing `x = "mt-77 pb-83 text-fuchsia-700"`:

| Probe | Result |
|---|---|
| root `.py` classes must be absent | `.mt-77`, `.pb-83`, `.text-fuchsia-700` — all absent, PASS |
| real app classes must survive | `.bg-slate-800`, `.text-slate-200`, `.rounded-lg`, `.bg-linear-to-r`, `.focus\:outline-hidden:focus`, `.min-h-\[44px\]` — all present, PASS |

**CSS: 51,886 → 51,516 bytes (−370).** A block-level diff shows exactly nine
spurious rules removed and one narrowed, with nothing added:

```
.static  .top-10  .top-15  .isolate  .contents  .shrink
.bg-gradient-to-r            .focus\:outline-none:focus
.ring,.ring-1  ->  .ring-1
```

All eight utilities verified **unused** in `src/` and `index.html`. Provenance is
instructive: `.bg-gradient-to-r` and `.focus:outline-none` came from
`baseline/stage-1b.md` — the document describing those exact v3→v4 renames was
injecting the removed classes back into production CSS — and `.top-15` from
`research/fighter_image_sourcing.md`. The rest (`static`, `contents`, `isolate`,
`shrink`) are ordinary English words in prose that Tailwind's heuristic scanner
read as utilities.

**Rendered pixels unchanged**, as they must be for unused utilities:
identical=12, within-tolerance=2, fail=0, and all 14 dimensions agree across
Stage 0, Stage 1b and the candidate. Neither screenshot reference was
regenerated.
