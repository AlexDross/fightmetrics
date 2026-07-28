# Foundation Stage 1b — Tailwind v3 → v4

Follows `baseline/stage-1a.md`. **No application logic changed.** Every `src/App.js`
edit is a class name.

---

## Migration

Ran the official `@tailwindcss/upgrade@4.3.3` and reviewed its diff rather than
accepting it. It changed 28 lines of `src/App.js`, all class names:

| Rename | Count |
|---|---|
| `focus:outline-none` → `focus:outline-hidden` | 19 |
| `rounded` → `rounded-sm` | 8 |
| `bg-gradient-to-r` → `bg-linear-to-r` | 1 |

**Two corrections to the tool's output:**

- It reintroduced floating ranges (`^4.3.3`). Repinned exactly, restoring the
  Stage 1a no-floating-versions rule.
- It migrated to the PostCSS path. Switched to `@tailwindcss/vite`, the
  recommended route for Vite. `postcss.config.js`, `tailwind.config.js`,
  `postcss` and `autoprefixer` are all removed — v4 detects sources
  automatically and autoprefixes internally via Lightning CSS.

## Preflight compatibility — three defaults restored

v4 changed several Preflight defaults. Each is restored so this stage is a
toolchain change, not a restyling. Removing any of them later is a deliberate
design decision, not cleanup.

**1. Border colour** (`src/style.css`). v4 defaults to `currentcolor`; v3 used
gray-200. Without the shim every bordered element changes colour.

**2. Button cursor** (`src/style.css`). v4 sets `cursor: default` on buttons to
match the browser default; v3 set `pointer`. Tailwind's own recommended rule,
with `:not(:disabled)` so disabled controls keep the default cursor.

**3. Placeholder colour** (`src/style.css`). v4 renders placeholders at the
current text colour with reduced opacity; v3 used gray-400. Restored as a base
rule, so any explicit placeholder utility — e.g. `placeholder-slate-700` on the
Simulator odds inputs — still wins.

**4. Date-control geometry** (`src/App.js`). v4 Preflight shrank date inputs by
exactly 2 px:

| Control | v3 | v4 | Fix |
|---|---|---|---|
| regular `py-2` date inputs | 40 px | 38 px | explicit `h-10` |
| compact `py-1.5` filters | 36 px | 34 px | `sm:h-9`, mobile 44 px preserved |

That fully accounted for the two page-height changes: ROI lost **16 px** (seven
per-entry Event Date inputs + one Since filter) and Statistics lost **2 px** (one
filter).

All five date-input sites covered:

| Line | Context | Fix |
|---|---|---|
| 2379 | `StatisticsTab` Since filter | `sm:h-9` |
| 2822 | Prop entry form Event Date | `` `${PROP_INPUT_CLS} h-10` `` |
| 8064 | `MatchupSimulator` Event Date | `h-10` |
| 10309 | `ROITab` Since filter | `sm:h-9` |
| 10712 | `ROITab` per-entry Event Date | `h-10` |

The prop case is scoped to the date usage rather than to `PROP_INPUT_CLS`
itself. That constant is shared by six inputs and only one is a date; resizing
all six would have changed controls the v4 change never touched.

## Verification

**Dimensions — all 14 match Stage 0 exactly:**

```
SAME  1440w__{explore,home,info,roi,simulator,statistics,upcoming}
SAME  375w__{explore,home,info,roi,simulator,statistics,upcoming}
matching=14  differing=0
```

ROI back to 1440×3894, Statistics back to 1440×2791.

**Goldens — unchanged:** all six canonical hashes match; join OK,
`rosterHistoryHash de0704a5`, all 2,273 fighters carry their own history.

**Build:** 0 vulnerabilities, no `.map` by default, bridge absent from `build/`,
dev server ready in ~250 ms. CSS 31.34 kB → 52.02 kB (6.31 → 9.24 kB gzipped);
v4 emits its theme as CSS custom properties.

**Visual review** — Simulator, Upcoming, ROI and Statistics inspected at 1440 w
and 375 w. All render correctly: placeholders grey, focus rings intact, badges
and pills correct, every chart present with legends, mobile bottom nav correct.

## The residual difference is OKLCH, and it is uniform

~97–99 % of pixels still differ on every screen, at a **mean channel delta of
1.15–1.47 out of 255**:

| Screen | % differing | mean Δ | max Δ |
|---|---|---|---|
| 1440w simulator | 99.79 | 1.19 | 38 |
| 1440w upcoming | 99.28 | 1.15 | 52 |
| 1440w roi | 99.34 | 1.17 | 52 |
| 1440w statistics | 97.88 | 1.32 | 240 |
| 375w simulator | 99.70 | 1.29 | 38 |
| 375w upcoming | 97.76 | 1.39 | 52 |
| 375w roi | 98.44 | 1.36 | 52 |
| 375w statistics | 96.83 | 1.47 | 224 |

Cause: v4 ships its default palette in **OKLCH** where v3 shipped hex —
`--color-slate-950: oklch(12.9% .042 264.695)`, 81 `oklch()` values in the
emitted CSS. Converting to sRGB lands within ~1/255 of the v3 hex.

The Statistics max (224–240) is the chart nondeterminism measured in Stage 1a,
not a v4 effect.

**No broad colour tolerance was introduced.** A tolerance loose enough to pass a
99 %-of-pixels shift would hide almost anything, which would defeat the gate at
Stage 8. The correct resolution is a new v4 visual reference — pending approval.

## Visual references — two, both committed, neither overwritable

| Reference | Directory | Role |
|---|---|---|
| **Stage 1b** (default) | `baseline/screenshots-stage1b/` | Vite + Tailwind v4. The reference for Stage 2 onward. |
| Stage 0 (`--stage0`) | `baseline/screenshots-stage0/` | CRA + Tailwind v3 Play CDN. Historical record, preserved unchanged. |

`verifyScreens.cjs` defaults to Stage 1b; `--stage0` selects the v3 record for
archaeology. Stage 0 is **not** a useful gate for v4 builds — it differs by the
uniform OKLCH shift — but it is never replaced, renamed or deleted.
`captureScreens.cjs` refuses to write into **either** directory without `--init`
on an empty directory.

Policy unchanged: exact checksums on the 12 deterministic screens, scoped pixel
tolerance for the two Statistics screenshots only. No global colour tolerance.

### The first reference capture was contaminated — cold dev server

Worth recording, because it looked like a real regression and was not.

The Stage 1b reference was first captured ~12 s after starting a **cold** Vite
dev server. Verifying a fresh candidate against it produced:

```
FAIL  1440w__explore.png       1 px
FAIL  1440w__info.png          1 px
FAIL  1440w__statistics.png    82,108 px (2.0430%)
```

Two independent candidates then produced **exactly 82,108 px and exactly 1 px
again** — bit-identical failures. That ruled out nondeterminism: a flaky render
does not repeat to the pixel. The *reference* was the outlier, captured while
Vite was still transforming modules on demand.

Recaptured against a warm server, `1440w__statistics.png` is **identical** and
Explore and Info are **identical**. Two further candidates:

| Candidate | Result |
|---|---|
| c1 | identical=13, within-tolerance=1 (375w statistics, 90 px / 0.0012 %), fail=0 |
| c2 | identical=12, within-tolerance=2, fail=0 |

**Operational rule: warm the dev server before capturing a reference.** Start it,
take a throwaway capture, then capture the reference. The measured 1440 w
Statistics variance is ~0–47 px; anything in the thousands means the capture,
not the code.

## Browser support — accepted

Tailwind v4 requires **Safari 16.4+, Chrome 111+, Firefox 128+** (all
approximately March 2023 onward, except Firefox at July 2024). v4 relies on
native cascade layers, `@property` and `color-mix()`; there is no v3-style
fallback build.

**ACCEPTED as FightMetrics' supported browser floor.** This is now the effective
application requirement, not merely a build-tool detail: the app will not render
correctly below it, and there is no fallback path short of reverting to
Tailwind v3.

The vestigial `browserslist` field has been **deleted** from `package.json`.
With `autoprefixer` removed and Tailwind v4 prefixing internally via Lightning
CSS, nothing read it — Vite does not consult browserslist unless configured to —
and it advertised a wider support floor than v4 actually provides. `build.target`
was deliberately **not** added: changing it alters JS output and would need its
own verification pass, and the CSS floor is what actually binds here.

Removing it is provably build-neutral. Both emitted assets are byte-identical
before and after, including their content-derived filenames:

```
index-CSDIG1a5.css  fd32983…7209   (unchanged)
index-DlIB8AEP.js   355c0006…ec3f  (unchanged)
```

The reference was still recaptured from the final source state rather than
reused, because screenshots come from the dev server rather than the production
build.

## Final verification

| Check | Result |
|---|---|
| Stage 1b reference self-integrity | identical=14, fail=0 |
| Stage 0 reference self-integrity (`--stage0`) | identical=14, fail=0 |
| Fresh candidate c1 vs Stage 1b | identical=13, within=1, fail=0 |
| Fresh candidate c2 vs Stage 1b | identical=12, within=2, fail=0 |
| Goldens | all six canonical hashes MATCH; join OK, `de0704a5` |
| Dimensions vs Stage 0 | 14/14 match |
| Production build | no `.map`, 0 bridge matches, 0 model-source matches, no CDN tag, 4.5 MB |
