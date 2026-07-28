# Foundation Stage 0 — Baseline

**Capture base:** `foundation/stage-0` = `origin/main` @ `fa3e54e` + rebased ROI
event-summary `9dd3a60`
**Fixture captureIso:** `2026-07-28T03:28:01.945Z`
**Roster stable hash:** `0f2c80cd` (2,273 fighters)
**Fight-history aggregate hash:** `1e52ca0c` (2,718 fighters, 17,568 bouts)

> **Correction.** An earlier revision of this file recorded
> `2026-07-28T03:27:32.259Z`. That was the *first* of the two determinism runs;
> the second run overwrote `baseline/fixtures/` (its location at the time), so the committed reference is
> the second capture. The scripts now refuse to write into the reference
> directory precisely so this cannot recur (§10). Commit `9d77f63` carries the
> same stale timestamp in its message and was left unamended to preserve the
> SHA already reported; this file is authoritative.

Everything here is the reference Stages 1a, 1b and 3 are measured against.

---

## 1. Reproduce this baseline

```bash
# deps (NOTE: NODE_ENV=production in the shell makes npm SKIP devDependencies,
# which silently removes react-scripts — see §6)
unset NODE_ENV && npm install --include=dev

# dev server
BROWSER=none PORT=3001 npx react-scripts start

# isolated puppeteer (deliberately NOT added to package.json)
mkdir -p /tmp/pptr && cd /tmp/pptr && npm init -y && npm i puppeteer-core

# capture a CANDIDATE (never the reference -- see §10)
NODE_PATH=/tmp/pptr/node_modules node src/__dev__/captureGoldens.cjs http://localhost:3001
NODE_PATH=/tmp/pptr/node_modules node src/__dev__/captureScreens.cjs http://localhost:3001

# verify the candidate against the approved reference
node src/__dev__/verifyFixtures.cjs --candidate baseline/candidates/<stamp>
node src/__dev__/verifyScreens.cjs  --candidate baseline/candidates/<stamp>-screens

# source-derived integrity, independent of any capture
node src/__dev__/hashFightHistory.cjs
```

Both capture scripts are headless and reproducible. Do **not** capture through
devtools by hand — see §6.

---

## 2. Build and bundle

| Metric | Value |
|---|---|
| `react-scripts build` wall time | **40 s** (cold, `node_modules/.cache` cleared) |
| JS chunks emitted | **1** (no code splitting) |
| `main.*.js` raw | **4,554.7 KB** |
| `main.*.js` gzipped | **886.5 KB** |
| `build/` total | **18 MB** (includes source maps) |
| CSS emitted | **none** — Tailwind is 100 % CDN, nothing compiled |
| `cdn.tailwindcss.com` in `build/index.html` | **present** (removed in Stage 1a) |

CRA's own output: *"The bundle size is significantly larger than recommended."*

**Stage 1a target:** a CSS file must exist and the CDN tag must be gone.
**Stage 8 target:** more than one JS chunk.

## 3. Production build excludes the dev harness — from executable JavaScript

Verified two ways against `npx serve -s build`:

| Check | Result |
|---|---|
| `grep __FM_GOLDEN_INTERNALS__ build/static/js/*.js` | **0 matches** |
| `grep fmGoldens\|goldenHarness build/static/js/*.js` | **0 matches** |
| `typeof window.__FM_GOLDEN_INTERNALS__` at runtime | **`undefined`** |
| `typeof window.__fmGoldens` at runtime | **`undefined`** |
| App renders | yes |

> **Correction (Stage 1a).** "Excludes the dev harness" was too strong as
> originally written here. It is true of **executable JavaScript** — the guard
> works, nothing runs, `window.__FM_GOLDEN_INTERNALS__` is `undefined`. It was
> **not** true of the deployment as a whole: CRA emitted a public source map,
> and Stage 1a's first Vite build did too. That map carried `sourcesContent` for
> 445 modules including the **complete 471,657-character `src/App.js`** — the
> `MODEL` object, the v2 logistic coefficients, every betting and statistics
> function, and the bridge itself. Verified by reading the map, not inferred.
>
> Stage 1a turns production source maps **off by default** (`FM_SOURCEMAP=true`
> to opt in). After that change `grep -r __FM_GOLDEN_INTERNALS__ build/` returns
> **zero matches anywhere in the output**, and `build/` drops from 17 MB to
> 4.5 MB. See `baseline/stage-1a.md`.

## 4. Fixtures

`src/__tests__/fixtures/` — all six share one `captureIso`.
(Moved there from `baseline/fixtures/` in Stage 4 commit `5777f68` via `git mv`,
all seven byte-identical; hashes now enforced by `fixtureIntegrity.test.js`.)

| File | Size | Contents |
|---|---|---|
| `roster.manifest.json` | 237 KB | 2,273 identity keys in order, per-fighter stable hashes, duplicate-name map, date-derived fields recorded separately |
| `fighters.golden.json` | 254 KB | 38 frozen fighter objects + selection reasons + 37 pairs |
| `model.golden.json` | 1,231 KB | 74 `computeMatchupEdges` outputs (both slot orders) + 37 symmetry measurements |
| `entries.golden.json` | 294 KB | 32 `buildRoiEntry` outputs (16 pairs × v1/v2), canonicalised |
| `statistics.golden.json` | 18 KB | 9 statistics functions × 2 entry sets (all=153, since_2026-05-23=70) |
| `characterisation.json` | 1 KB | current-behaviour records — **not** desired invariants |

**Determinism.** Two independently captured files can *never* be byte-identical
— `captureMs` and `captureIso` differ by construction. Byte equality is the
wrong test. The correct statement:

> Across two independent headless captures, the **canonical,
> volatility-excluded payload hashes were identical for all six files.**

Canonical means: `captureMs` and `captureIso` removed, `entryGoldens[].observedVolatile`
removed (it records the raw `id` / `createdAt` / `predictionTimestamp` on
purpose), then hashed with the same `stableStringify`/`hash` used in-page.
`verifyFixtures.cjs` implements exactly this; `baseline/REFERENCE_HASHES.json`
records the expected values.

**Coverage:** low-sample (<75 min), seed-Elo (0 UFC fights), prospect,
ranked-deep, P4P, long-layoff (>700 d), deepest-sample, 12 of 13 divisions,
historical rematch, both slot orders of every pair.

---

## 5. Model findings from the capture

### 5.1 Volatility is narrower than assumed, but not calendar-aligned

Only **one** live date-derived field: `DAYS_SINCE_LAST` (`App.js:822`).

`computeLayoffPenalty` (`App.js:519`) — which uses `Date.now()` at `:526` with a
**continuous** sigmoid — **is dead code. It has no callers.** `LAYOFF_PENALTY` is
hardcoded to `0` at `App.js:1004` and is uniformly `0` across all 2,273 fighters.
So no continuously-varying input reaches the model.

`dt` values are date-only strings parsed as UTC midnight, so every fighter shares
one fractional offset and **all 2,179 fighters with a `DAYS_SINCE_LAST` flip
simultaneously at 12:00 UTC daily.**

> **Replay window: 12:00 UTC → 12:00 UTC.** Not the local calendar day. A capture
> at 23:00 EDT stays comparable until 08:00 EDT the next morning. Stage 3
> commit 5 must diff inside one such window, or use the frozen fixtures.

### 5.2 Negative zero — would have broken Stage 4

`computeMatchupEdges` emits **115 negative-zero values** across 58 of 74 goldens,
all in `output.v2Contributions.{wins, losses, ko_wins, sub_wins, title_bouts}` —
exactly the five RED features whose v2 coefficients were zeroed. `0 × negative`
is `-0`.

`JSON.stringify(-0)` produces `"0"`, and `Object.is(-0, 0)` is `false`. A naively
written fixture would have failed exact-equality replay on 115 values per capture
for no real reason. Fixtures therefore encode specials as tagged strings
(`"@-0"`, `"@NaN"`, `"@Inf"`, `"@-Inf"`, `"@undefined"`).

Verified: 115 `"@-0"` sentinels on disk, 115 negative zeros recovered on decode.
No `NaN` or `Infinity` anywhere in the current output.

**Stage 4 must decode before comparing.** `decodeSpecials` is exported from the
harness for this.

### 5.3 Symmetry — three distinct properties, all far tighter than the source assert

`App.js:4377` asserts `|v2.pA + v2flip.pA − 1| < 0.001`. Measured across 37 pairs:

| Property | v1 | v2 | Max deviation |
|---|---|---|---|
| within-call `pA + pB === 1` | **37/37 exact** | **37/37 exact** | 0 |
| flip-sum `AB.pA + BA.pA === 1` | 36/37 exact | 36/37 exact | 1.11e-16 (1 ULP) |
| cross-slot `AB.pA === BA.pB` | 17/37 exact | 21/37 exact | 1.11e-16 (1 ULP) |

The shipped assertion is ~13 orders of magnitude looser than actual behaviour; a
real symmetry regression would have to be enormous to trip it.

**Stage 4 assertion design:**
- within-call sum → assert **exactly**
- flip-sum → assert within **1 ULP** (not 0.001)
- cross-slot → assert within **1 ULP**; it is *not* exact and must not be asserted as such

The earlier plan's `AB.pA === 1 − BA.pB` was wrong and is dropped.

### 5.4 Duplicate names: zero in the live roster

The `FIGHTERS` array contains **no duplicate `FIGHTER` keys** across 2,273
entries. The "17 ambiguous name cases" are a `fightersData.js` ↔ `fighters.json`
(Python roster) reconciliation issue, **not** an in-app collision. The
last-wins hazard at `App.js:9329` is real but currently unexercised.

**Risk-register item 4 downgraded** — still guarded, no longer expected to fire.

### 5.5 Rematch dedup — recorded as current behaviour, not blessed

`App.js:9418-9420` keys Upcoming dedup on `[fighterA, fighterB].sort().join('|')`
with **no event component**, so a rematch at a different event collides. The
backtest dedup at `App.js:1060` *does* include `fight.ev`. Two patterns, one
file. Recorded in `characterisation.json` and explicitly labelled
`isDesiredInvariant: false`. Event-aware identity belongs to Stage 6.

---

## 6. Environment traps found the hard way

**`NODE_ENV=production` is set in the shell.** `npm config get omit` returns
`dev`, so any `npm install` silently drops devDependencies — and `react-scripts`
is the *only* devDependency. This removed it mid-session and broke the dev
server with a misleading `html-webpack-plugin/lib/loader.js` error. Always
`unset NODE_ENV` or pass `--include=dev`.

**`package-lock.json` is gitignored** (`.gitignore:6`) while `react-scripts` is
pinned to `"latest"`. Installs are not reproducible across machines or time.
Worth reconsidering before Stage 1a changes the toolchain.

**Do not capture fixtures through devtools.** `computeMatchupEdges` runs a
per-call `console.log` (`App.js:4357`) and `console.assert` (`App.js:4377`). A
capture makes ~180 model calls; with CDP attached every record is serialised over
the protocol and the renderer wedges for minutes. `captureGoldens.cjs` silences
console for the capture only (harness-local; no App.js change). Both lines are
deleted in Stage 3.

---

## 7. Visual baseline

`baseline/screenshots-stage0/` — 14 full-page PNGs, 7 tabs × {375 w @2x,
1440 w @1x}, 4.9 MB total, plus `manifest.json`. **Committed**, with SHA-256 per
file in `baseline/screenshots-stage0.sha256.json`.

**Storage decision, revised.** These were originally gitignored on the theory
that a regenerable artifact does not belong in history. That was wrong for a
*reference*: an ignored directory that later captures overwrite is not durable,
and the same failure mode produced the timestamp error corrected at the top of
this file. They are now committed.

No WebP or PNG optimiser is available on this machine (`cwebp`, `pngquant`,
`optipng`, `oxipng` all absent; `sips` cannot emit WebP), so they are committed
lossless at 4.9 MB. That is a deliberate one-time cost for a durable pixel
reference. They can be dropped once Stage 1b is signed off, since by then the
Tailwind v4 comparison they exist for is complete.

Candidate screenshots go to `baseline/candidates/` (gitignored) and are compared
with `verifyScreens.cjs`. Stage 1a expects checksum equality; **Stage 1b expects
differences**, which must be triaged individually against Tailwind v4 breaking
changes rather than treated as pass/fail.

---

## 8. Stage 0 files (all removed together in Stage 4)

| Path | Purpose |
|---|---|
| `src/__dev__/goldenHarness.js` | in-page capture; `window.__fmGoldens` |
| `src/__dev__/captureGoldens.cjs` | headless fixture capture (reproducible) |
| `src/__dev__/captureScreens.cjs` | headless visual baseline (reproducible) |
| `src/__dev__/verifyFixtures.cjs` | canonical-hash compare candidate vs reference; reference self-integrity |
| `src/__dev__/verifyScreens.cjs` | SHA-256 compare of the visual baseline |
| `src/__dev__/hashFightHistory.cjs` | full fight-history hashes from source; **keep after Stage 4 if useful** |
| `src/__dev__/fixtureReceiver.cjs` | superseded by `captureGoldens.cjs`; retained for manual use |
| `src/App.js` (tail) | dev-guarded bridge, 27 lines, `process.env.NODE_ENV` |
| `src/index.js` | dev-guarded dynamic import |

Stage 1a mechanically swaps both guards to `import.meta.env.DEV`.

---

## 9. Stage 1a requirements

**Dependency hygiene is now part of Stage 1a's definition of done.**

`package-lock.json` is currently gitignored (`.gitignore:6`) *and* `react-scripts`
is declared as `"latest"`. Together these mean the toolchain is not pinned and
installs are not reproducible across machines or across time — which is
indefensible for a stage whose entire purpose is proving a toolchain swap
changed nothing. Stage 1a must:

1. Remove `package-lock.json` from `.gitignore` and **commit a fresh lockfile**.
2. Replace every floating version with an exact pin — `"latest"` on
   `react-scripts` first, and audit the `||` ranges on `vite`, `@types/node`,
   and `stylus` while there.
3. Use `npm ci` (or `npm install --include=dev`) in every documented command.
   **This machine has `NODE_ENV=production` exported**, so a bare `npm install`
   omits devDependencies and silently deletes `react-scripts` — see §6.

**Acceptance nuance.** Stage 1a makes a compiled CSS file appear where there is
currently none, so "no visual change" cannot be asserted as output equality. It
must be the screenshot checksum comparison (§7), and the goldens (§4) carry the
model-integrity half.

---

## 10. Reference protection

The approved reference is `src/__tests__/fixtures/` (Stage 4 relocation) +
`baseline/screenshots-stage0/`. Both capture scripts **refuse** to write there:

- default destination is a timestamped directory under `baseline/candidates/`
  (gitignored);
- writing to the reference requires `--init` **and** an empty reference
  directory; otherwise the script exits `2` with an explanation.

| Manifest | Covers |
|---|---|
| `baseline/REFERENCE_HASHES.json` | canonical payload hash of each of the 6 fixtures, plus what was excluded |
| `src/__tests__/fixtures/fightHistory.hashes.json` | per-fighter hash of the **complete** `FIGHT_HISTORY`, derived from `src/fightHistory.js` |
| `baseline/screenshots-stage0.sha256.json` | SHA-256 of each committed screenshot |

`verifyFixtures.cjs` run with no `--candidate` performs a **self-integrity
check**: it recomputes the reference hashes and compares them to the committed
manifest, so tampering with the reference itself is detectable.

### The fighter/history join is a REQUIRED check

**Expected `rosterHistoryHash`: `de0704a5`** (2,273 roster names, 2,179 with history).

Source integrity proves `src/fightHistory.js` is unchanged. It does **not** prove
the assembled `FIGHTERS` collection still attaches each history to the *right*
fighter — precisely what Stage 3's extraction can break by changing module
evaluation order or the `d.n` join at `App.js:758`.

So `verifyFixtures.cjs` now **requires** every candidate to provide
`historyHashes` and `rosterHistoryHash` and to match the expectation. A missing
field is a **failure**, not a skip.

The expectation is **derived, not adopted.** `hashFightHistory.cjs` computes it
in Node from committed inputs only — `identityKeys` (roster order, `= d.n`),
`src/fightHistory.js`, and `sortHistoryDesc` copied verbatim from `App.js:3491`:

```
expectedAttachedHashes[i]  = hash(stableStringify(sortHistoryDesc(FIGHT_HISTORY[identityKeys[i]] ?? [])))
expectedRosterHistoryHash  = hash(stableStringify(expectedAttachedHashes))
```

The Node derivation independently reproduced the browser's `de0704a5`, so the
two agree without either being taken on trust.

**Negative-tested — both cases pass all six canonical hashes and are still caught:**

| Tamper | Result |
|---|---|
| Swap Islam Makhachev ↔ Jon Jones histories, then recompute `rosterHistoryHash` so the aggregate is internally consistent | `FAIL 2 fighter(s) carry the WRONG fight history`, both named with got/want; exit 1 |
| Delete `historyHashes` / `rosterHistoryHash` (simulates a pre-v2 capture) | `FAIL candidate does not provide…`; exit 1 |

The first is the important one: **all six canonical file hashes still MATCHED**
while the join was wrong. Without this check the mis-join was invisible.

### Why fight-history hashing is split in two

`roster.manifest.json`'s `stableHashes` summarise `FIGHT_HISTORY` as
`{length, first, last}` — which cannot detect a change to a **middle** bout.
Two changes address this:

1. `hashFightHistory.cjs` hashes every fighter's complete history straight from
   `src/fightHistory.js`. It needs no browser and no capture, so it protects the
   existing goldens **without recapturing them** — 2,718 fighters, 17,568 bouts,
   aggregate `1e52ca0c`.
2. `buildRosterManifest` now also emits `historyHashes` and `rosterHistoryHash`
   (`manifestHashVersion: 2`). This is **additive**: `stableHashes` keeps its v1
   meaning so the approved reference stays directly comparable to candidates.
   `verifyFixtures.cjs` excludes the new fields from the **file-level** canonical
   hash via `POST_REFERENCE_FIELDS`, because the reference predates them — but
   they are **not** unchecked. `checkJoin()` enforces them mandatorily against
   the derived expectation above. Remove the exclusion whenever the reference is
   next re-initialised.

**Stage 3 gate.** The fighter-data extraction (Stage 3 commit 5, `FIGHTERS`
construction) is not complete until a fresh candidate reports
`rosterHistoryHash = de0704a5` and `all 2273 fighters carry their own history`.
