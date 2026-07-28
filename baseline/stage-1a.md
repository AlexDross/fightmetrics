# Foundation Stage 1a — CRA → Vite, Tailwind v3 compiled

Reference: `baseline/metrics.md` (Stage 0). **No application logic changed.**
The only `src/` edits are the two mechanical dev-guard swaps and one CSS import.

Tailwind stays on **v3**. The v3→v4 upgrade is Stage 1b, deliberately separate,
so any visual difference is attributable to one migration or the other.

---

## Results

| | Stage 0 (CRA + CDN) | Stage 1a (Vite + compiled) | |
|---|---|---|---|
| `build` wall time | 40 s | **9 s** | 4.4× faster |
| dev server ready | ~90 s | **207 ms** | ~430× faster |
| JS raw | 4,554.7 kB | 4,612.3 kB | +1.3 % |
| JS gzipped | 886.5 kB | 901.9 kB | +1.7 % |
| **CSS emitted** | **none** | **31.3 kB / 6.3 kB gz** | was generated in-browser |
| `build/` total | 18 MB | **4.5 MB** | source maps now off |
| npm packages | ~930 | **171** | |
| vulnerabilities | 5 (4 high) | **0** | all were CRA transitives |
| `cdn.tailwindcss.com` | present | **removed** | |

The JS grew ~15 kB gzipped — Rollup output differs slightly from webpack. That is
paid back many times over by no longer shipping the Tailwind Play CDN (~120 kB)
and no longer running its JIT compiler on every page load before first paint.

## Verification

**Model integrity — all six canonical hashes match, join intact:**

```
MATCH  characterisation / entries / fighters / model / roster / statistics
OK     all 2273 fighters carry their own history (2179 non-empty)
OK     rosterHistoryHash  cand=de0704a5  expected=de0704a5
ALL CANONICAL HASHES MATCH — including the fighter/history join
```

**Visual — 12 of 14 pixel-identical, 2 within measured tolerance, 0 failures:**

```
IDENTICAL  explore, home, info, roi, simulator, upcoming  (both widths)
WITHIN     1440w__statistics.png  39 px (0.001%)  of 1440x2791
WITHIN     375w__statistics.png   60 px (0.0008%) of 750x9826
identical=12  within-tolerance=2  fail=0
```

**Production build:** `grep -r __FM_GOLDEN_INTERNALS__ build/` returns **zero
matches anywhere in the output** under the new `import.meta.env.DEV` guard;
`const MODEL = {` appears nowhere in `build/`; CDN tag absent from
`build/index.html`.

## Source maps are off by default (production hardening)

The first Stage 1a build — like every CRA build before it — emitted a public
`index-*.js.map` of **12.9 MB** carrying `sourcesContent` for 445 modules,
including the **complete 471,657-character `src/App.js`**: the `MODEL` object,
the v2 logistic coefficients, every betting and statistics function, and the dev
bridge. Read out of the map directly, not inferred.

So the earlier claim that the bridge was "absent from the production build" held
only for **executable JavaScript**. The guard did work — nothing ran, and
`window.__FM_GOLDEN_INTERNALS__` was `undefined` at runtime — but the source
shipped alongside it, and fightmetrics.app has been serving the entire model
implementation to anyone who opened devtools.

`build.sourcemap` is now `process.env.FM_SOURCEMAP === 'true'`, i.e. **off**.

| | with maps | default (no maps) |
|---|---|---|
| `build/` total | 17 MB | **4.5 MB** |
| `.map` emitted | 12.9 MB | **none** |
| bridge anywhere in `build/` | present in map | **0 matches** |
| model source in `build/` | complete | **not present** |

Opt in for a debugging build with `FM_SOURCEMAP=true npm run build` — verified to
still emit the map. The variable is deliberately **not** `VITE_*` prefixed, which
would embed its value in the client bundle.

## The Statistics tab is not deterministically renderable

Discovered here, not assumed. Six consecutive captures of the **same** Vite build
at 1440 w differed from the first by **26, 24, 24, 0, 47** pixels, page height
constant at 2791. The charts do not settle to a fixed frame.

The CRA→Vite difference (39 px @1440 w, 60 px @375 w) sits inside that band, and
the control is decisive: `1440w__roi.png` — a 1440×3894 screen — is **0 pixels**
different across the migration.

So checksum equality is the wrong instrument for this one screen.
`verifyScreens.cjs --pixel` now applies a measured rule, **scoped to exactly two
files**:

```js
PIXEL_TOLERANCE_SCREENS = { '1440w__statistics.png', '375w__statistics.png' }
```

- Every **other** screen must be checksum-identical. It is still measured when
  `--pixel` is on, but only as diagnostics — it fails regardless.
- For the two tolerated screens: **dimensions must match exactly** (any change is
  a layout regression), and the **unrounded** differing-pixel ratio must be
  ≤ 0.01 %. The ratio is compared before formatting, so a value just over
  tolerance cannot round down into compliance.
- An **unexpected** screenshot not in the reference manifest is a failure, not a
  note — it means the capture set drifted from the reference set.

**Negative-tested.** In one run: `1440w__roi.png` altered by **30 px (0.0005 %)**
FAILED, while `375w__statistics.png` at **62 px (0.0008 %)** passed. A *smaller*
difference failing and a *larger* one passing is the scoping working — a blanket
tolerance would have absorbed both. An injected extra screenshot also failed.
Exit 1.

A genuine styling regression — a Tailwind v4 default border-colour change, say —
moves thousands of pixels or changes page height, and still fails. Stage 1b must
use `--pixel` and triage every screen that exceeds tolerance.

## Dependency hygiene (Stage 0 §9 requirement, now done)

- `package-lock.json` **removed from `.gitignore` and committed**.
- Every version **exactly pinned**; no `^`, `~` or `||` ranges remain.
- `react-scripts: "latest"` gone.
- Runtime deps pinned to the versions that were *already installed*
  (`react`/`react-dom` 19.2.6, `recharts` 3.8.1, `lucide-react` 0.577.0) so the
  toolchain swap did not smuggle in a library upgrade. Newer versions exist;
  upgrading them is a separate, deliberate change.
- Removed as verified-unused (zero `.scss`/`.sass`/`.less`/`.styl`/`.sss` files,
  no references anywhere in `src/` or configs): `@tailwindcss/vite`,
  `@types/node`, `jiti`, `less`, `lightningcss`, `react-is`, `sass`,
  `sass-embedded`, `stylus`, `sugarss`, `terser`, `tsx`, `yaml`.
- Install command is `npm ci`, or `npm install --include=dev` —
  **`NODE_ENV=production` is exported on this machine**, so a bare `npm install`
  omits devDependencies.

## Notes for later stages

- **JSX lives in `.js` files** (1,068 `className` sites in `App.js`). esbuild only
  treats `.jsx` as JSX, so `vite.config.mjs` widens both the react plugin
  (`include`) and esbuild itself (`loader: 'jsx'`, `include: /src\/.*\.jsx?$/`).
  The second is required because `vite:build-html` hands the HTML entry straight
  to esbuild, bypassing the plugin filter. Files were **not** renamed to `.jsx`:
  the baseline records, risk register and commit history all cite `App.js` line
  numbers. Rename in Stage 8 if desired, when those files move anyway.
- **`content` scan is safe.** All 136 interpolated `className` template literals
  insert *complete* class strings, never fragments like `` `bg-${c}-500` ``, so
  every class is statically present. No safelist needed. Re-check this in Stage 8
  when components are split out.
- `build.outDir` stays `build` (not Vite's `dist`) so existing Vercel settings and
  `.gitignore` keep working; `vercel.json` now pins it explicitly and adds the SPA
  rewrite that Stage 5 routing will need.
- Source maps stay on, matching the Stage 0 baseline, so the size comparison is
  like for like.
- `postcss.config.js` and `tailwind.config.js` are deleted in Stage 1b (v4 uses
  `@tailwindcss/vite` and automatic source detection).
- `npm test` no longer exists; Stage 4 adds Vitest.
