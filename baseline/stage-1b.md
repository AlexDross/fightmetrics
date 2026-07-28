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

## Browser support — decision needed

Tailwind v4 requires **Safari 16.4+, Chrome 111+, Firefox 128+** (all
approximately March 2023 onward, except Firefox at July 2024). v4 relies on
native cascade layers, `@property` and `color-mix()`; there is no v3-style
fallback build.

Practical read for FightMetrics: it is a single-user tool installed as a PWA on
a current iPhone and viewed on a current desktop browser, so the floor is very
unlikely to bite. **Confirm explicitly rather than assuming.**

One inconsistency to settle: `package.json` still declares

```json
"browserslist": { "production": [">0.2%", "not dead", "not op_mini all"] }
```

With `autoprefixer` removed and Tailwind v4 prefixing internally, **nothing reads
this field any more** — Vite does not consult browserslist unless configured to.
It is now vestigial and describes a wider support floor than v4 actually
provides. Options: delete it, or set `build.target` in `vite.config.mjs` to match
v4's floor so the JS and CSS targets agree. Deliberately not changed here —
altering `build.target` changes JS output and would need its own verification
pass. Raised as a Stage 1b follow-up.

## Pending

`baseline/screenshots-stage1b/` is **not** created yet. Establishing it means
re-initialising a protected reference, which requires explicit approval. Once
approved: keep `screenshots-stage0/`, add `screenshots-stage1b/` with its own
checksum manifest, make the verifier default to Stage 1b with an explicit
opt-in for Stage 0, and protect both directories from overwrite.

Candidate captures retained at `baseline/candidates/screens-1b-fixed`
(gitignored) so approval needs no recapture.
