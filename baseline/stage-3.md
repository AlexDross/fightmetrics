# Foundation Stage 3 — mechanical domain extraction

Four extraction commits plus three cleanup commits. **No application logic
changed.** Extracted declarations were initially byte-identical to their
originals; the only later edit inside a moved range removed one trailing
whitespace-only line. Exports are declared in trailing blocks so no declaration
had to be rewritten for module access.

`src/App.js` **11,034 → 8,146 lines**. 3,234 lines now live in five domain
modules.

| Commit | Content |
|---|---|
| `a7aa921` | model — 19 decls, 1,286 lines |
| `a14ea68` | finish + betting — 13 decls, 464 lines |
| `7372887` | statistics — 32 decls, 794 lines |
| `29533f5` | repair comments stranded by range extraction |
| `53eda57` | rehome the market-analysis comment |
| `f9c26cc` | FIGHTERS — 14 decls, 441 lines |
| *(this)* | whitespace, App.js import boundary, comparison hardening |

## Module dependency graph — acyclic

```
App        → fighters, model, betting, statistics, finish
fighters   → model + data modules
betting    → finish, model
statistics → betting
model      → data modules only
finish     → nothing
```

`model` does **not** import `fighters`. Exactly one assembled collection exists
(`src/domain/fighters/index.js`), and `App.js` is its only consumer — importing
**only `FIGHTERS`**, nothing else.

`sortHistoryDesc` is now an ESM import from `model`, which has no path back to
`fighters`, so it is fully initialised before `FIGHTERS` evaluates. The hoisting
`App.js` previously relied on — calling it at line 755 from a declaration at
3491 — is no longer load-bearing.

The declared graph matches the source. `App.js` imports no binding it does not
consume; correctness does not depend on bundler tree-shaking.

## The complete FIGHTERS comparison

`fighters.golden.json` covers only ~38 fighters, so the extraction was gated on
the whole collection.

**The decisive artifact is `stableStringify(encodeSpecials(FIGHTERS))` over the
complete ordered array, with SHA-256 taken over that string.** An earlier version
of this check hashed a summary of djb2 per-fighter hashes; that was wrong — djb2
is a non-cryptographic 32-bit hash and an inner collision could have hidden a
real difference. The per-fighter and per-field hashes are retained, but only for
locating a mismatch, never as the gate.

Captured from the exact parent `29533f5` in a git worktree and from the
post-extraction tree, under the identical frozen reference clock:

| | parent `29533f5` | post-extraction |
|---|---|---|
| fighters | 2,273 | 2,273 |
| canonical bytes | 6,732,785 | 6,732,785 |
| SHA-256 | `301d7980…aebe6` | `301d7980…aebe6` |

`cmp` reports the two 6.7 MB serialisations byte-identical; diagnostics show
0 of 2,273 fighters differing. Artifacts stay in `/tmp` and are never committed.

## What eye inspection caught that tooling would have shipped

- **`App.js:709`** — `const momentumScore = Math.max(` sits at column 0 but is
  *inside* the `FIGHTERS` `.map()` callback, merely misindented. A
  next-declaration heuristic reads it as top-level and truncates `FIGHTERS` at
  708 instead of 841.
- **Brace-less arrow bodies** — `sumFightRounds`, `sumDeepRounds` and
  `blendToward` continue onto following lines; balance-based end detection closed
  each one line early.
- **The truncation hid a real dependency** — `getFightRoundCount` is called on
  line 424, inside the part being cut off, so it never entered the closure.

## Tooling limits, recorded

`extractVerbatim.cjs` scans tokens, not an AST. It cannot distinguish
`fA.FIGHT_HISTORY` from a free `FIGHT_HISTORY` binding — which produced two
unused imports, now removed. It strips `.prop` and `?.prop` before scanning and
prints a review warning, but object-literal keys can still masquerade as
references.

The asymmetry is deliberate: a **missing** import is a runtime `ReferenceError`
(this is how `SOURCE_MANIFEST` was caught, by the entry goldens, before it could
break every freeze-at-save provenance stamp), while a **spurious** one is only
clutter. So the scan stays generous and its output is reviewed by hand, never
trusted.

Ranges may now open with comments, so a declaration's explanatory block travels
with it. That fixes at source the stranding repaired after the fact in `29533f5`
and `53eda57`.

## `src/__dev__` inventory — 10 files

Correcting an earlier undercount of five. No deletions here; Stage 4 must decide
against this list explicitly.

| File | Purpose | Stage 4 disposition |
|---|---|---|
| `goldenHarness.js` | in-page capture, `window.__fmGoldens` | remove with the App.js bridge |
| `captureGoldens.cjs` | headless fixture capture, frozen clock | remove |
| `captureScreens.cjs` | headless visual capture | remove |
| `captureFightersArray.cjs` | complete assembled-array comparison | remove — Stage 3 only |
| `extractVerbatim.cjs` | verbatim range extractor | remove — Stage 3 only |
| `verifyFixtures.cjs` | canonical-hash + join verification | remove |
| `verifyScreens.cjs` | visual comparison, scoped tolerance | remove |
| `diffScreens.cjs` | pixel-diff diagnostics | remove |
| `fixtureReceiver.cjs` | superseded by `captureGoldens.cjs` | remove |
| `hashFightHistory.cjs` | full fight-history hashes **from source** | **KEEP** — needs no browser, no bridge, no capture; it protects the join independently and keeps working after the harness is gone |

## Verification

| Check | Result |
|---|---|
| `git diff --check` | clean |
| complete canonical FIGHTERS | byte-identical, SHA-256 `301d7980…aebe6`, 6,732,785 bytes both sides |
| six canonical fixture hashes | MATCH |
| `rosterStableHash` | `0f2c80cd` |
| `rosterHistoryHash` | `de0704a5` |
| fighter/history joins | 2,273 / 2,273 |
| production build | exit 0, no `.map`, 0 bridge markers, 0 readable model source, no CDN, 4.5 MB |
| screenshots (warm) | identical=12, within-tolerance=2, fail=0 |
| dimensions | 14/14 agree with Stage 0 and Stage 1b |
| protected fixture, screenshot, and checksum references | unchanged; `baseline/stage-3.md` is the only baseline addition |

A first screenshot run failed `375w__roi.png` at 146 px because the warm-up pass
had been interrupted, leaving the capture effectively cold. Re-run warm, ROI is
identical. Same cold-server artifact recorded in `stage-1b.md`; the warm-up rule
keeps earning its place.
