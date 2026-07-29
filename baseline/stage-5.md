# Foundation Stage 5 — URL routing and browser navigation

The active screen moves out of App state and into the URL. FightMetrics now
behaves like a normal web app: deep links work, refresh keeps you where you
were, Back and Forward do what they should, and tabs are real links.

Base: merged `main` at `a22b606`. One commit on `foundation/stage-5`.

## Route architecture

`src/app/routes.jsx` is the single source of truth. It is plain data plus total
functions — no React, no router imports — so the mapping is testable without a
DOM or a render.

| view id | path |
|---|---|
| `home` | `/` |
| `simulator` | `/simulator` |
| `upcoming` | `/upcoming` |
| `roi` | `/roi` |
| `statistics` | `/statistics` |
| `explore` | `/explore` |
| `info` | `/info` |

Exports: `ROUTES`, `VIEWS`, `PATHS`, `HOME_VIEW`, `HOME_PATH`,
`canonicalPathname`, `pathForView`, `viewForPathname`, `isKnownPathname`.
`ROUTES` is frozen. Nothing in `App.js` hard-codes a path string.

The view IDs are the same string literals the old `useState('home')` used, so
every `view === 'roi'` comparison in the render tree kept working unchanged.

### Where things sit

```
index.js   <BrowserRouter>  <App />  </BrowserRouter>
```

App is inside the router but **outside any `<Route>`**. Navigation therefore
re-renders App and never remounts it, which is what preserves App-level
Upcoming / ROI / Props / Parlay state across tab changes. Mounting App inside a
`<Route element>` would discard all of it on every click.

Inside App:

```js
const { pathname } = useLocation();
const view = viewForPathname(pathname);   // null when unknown
```

All hooks run unconditionally before any branch, so there is no conditional-hook
hazard and no early return.

### Unknown paths

`viewForPathname` returns `null` rather than falling back to `'home'`. That
distinction is what lets App tell "render Home" apart from "this URL is wrong":

```jsx
{view === null && <Navigate to={HOME_PATH} replace />}
```

`replace`, so a mistyped URL leaves no history entry to land on again. Rendered
as an element after Header/BottomNav so the chrome stays on screen through the
redirect instead of flashing an empty page.

### Trailing slashes

Chosen behaviour: **strip them**. `/roi/`, `/roi//` and `/roi` are one
destination. Treating `/roi/` as unknown and bouncing to Home would throw away
where the user was going. Root survives stripping, and slash-only paths (`//`,
`///`) collapse to `/`.

Case is **not** normalised — `/ROI` is unknown and redirects. URL paths are
case-sensitive by spec, and accepting variants would give one screen several
addresses.

### Links, not handlers

Converted to `NavLink` / `Link`: desktop Header tabs, mobile BottomNav primary
destinations, mobile More destinations, and the Home "Build a Matchup" and
"Full Track Record" CTAs. These are real anchors, so middle-click, cmd-click,
"copy link address" and screen-reader link semantics all work, and NavLink adds
`aria-current="page"` on the active tab for free.

Active styling still tests `view === id` rather than NavLink's `isActive`
callback, keeping one definition of "active" instead of two that could drift.

`Save and Open Upcoming` uses `navigate(pathForView('upcoming'))` — a push, so
Back returns to the Simulator. It is a side effect of saving, not a link the
user clicked, so it stays programmatic.

The More sheet closes on `useEffect` keyed to `pathname`, which covers taps,
Back and Forward with one rule, plus an explicit `onClick` close for the one
case a route change cannot catch: tapping the destination you are already on.
The sheet's open/closed state stays local — it is presentation, not a
destination, and a history entry for it would make Back close a menu instead of
going back a page.

## Manual browser verification

Same 34-check script run against **both** the Vite dev server and
`vite preview`. **34/34 passed on each.**

| Check | Result |
|---|---|
| Direct load of all 7 URLs, correct screen + active tab | 7/7 |
| Refresh holds the screen | 7/7 |
| Clicking a tab changes the address bar | pass |
| `/` → `/simulator` → `/upcoming` → Back → `/simulator` → Forward → `/upcoming` | pass |
| Back twice reaches `/` | pass |
| Home CTAs navigate and are real `<a href>` | 2/2 |
| Unknown URL lands on `/` | pass |
| Back from that redirect returns to the previous real page, not the bad URL | pass |
| Save and Open Upcoming reaches `/upcoming` with the entry visible | pass |
| Mobile primary tab navigation | pass |
| More opens, navigates, and closes on select | pass |
| More closes when the route changes via Back | pass |

### State preservation, with a control

Saved a matchup through the Simulator, then navigated `/roi` → `/statistics` →
`/explore` → `/info` → `/` → `/upcoming`. The entry was still there (3 → 3
occurrences), and survived Back/Forward as well.

A negative control runs in the same pass: a full page **reload** does discard it
(3 → 0). Without that, "the entry is still there" would also be true if the
assertion were reading static seed data.

## Automated results

**182 tests, 13 files** — 161 existing, all still green, plus 21 new route tests
covering the seven mappings, uniqueness, both round-trip directions, root, the
excluded-scope paths, unknown paths, case sensitivity, trailing slashes and
idempotence. The expected mapping is written out literally rather than derived
from `ROUTES`, so the test cannot pass for any seven routes including wrong ones.

| Check | Result |
|---|---|
| Vitest | 182 passed, 13 files |
| Production build | exit 0, 4.5 MB, 7 files in `build/` |
| Source maps / bridge markers / fixture markers in `build/` | 0 across all |
| Tailwind CDN | 0 |
| `git diff --check` | clean |
| `hashFightHistory.cjs` | FIGHT HISTORY UNCHANGED |
| Seven approved fixtures + two inputs | byte-identical |
| Stage 0 and Stage 1b reference self-integrity | identical=14, fail=0 each |
| Protected reference files changed in git | 0 |
| Untracked user files | 22, untouched |

## Visual results

Warm capture, then compared against the protected Stage 1b reference. Two clean
runs:

| Run | Result |
|---|---|
| run 1 | 12 identical, statistics 26 px (1440w) / 146 px (375w) |
| run 2 | 13 identical, statistics 59 px (375w) |

Only the statistics tab differs, in its long-known noise band. Measured in the
same session for comparison: the **parent commit `a22b606` shows 193 px** on
that same screen, and two back-to-back captures of the *same* build differ from
each other by 199 px. The screen is not deterministic; nothing here is.

### Two findings the screenshots caught

**1. The capture harness silently stopped navigating.** `captureScreens.cjs`
found tabs with `document.querySelectorAll('button')` matched by text. Once the
tabs became anchors it matched nothing, captured Home 14 times, and reported a
size mismatch on 12 of 14 screens. The selector is now `a, button`, and — more
importantly — a miss now **aborts the run** instead of writing a
plausible-looking baseline. It is still a click, not a `page.goto`, so it drives
the same in-app navigation the references were captured through.

**2. A real 1px regression in the Home CTAs, found and fixed.** After the
button → anchor conversion the CTA labels rendered 1px high: 640 changed pixels
at 1440w, 1896 at 375w, confined to the glyphs.

Cause, measured rather than guessed. The two CTAs are flex siblings with
`align-items: stretch`; the bordered one is 2px taller, so both stretch to 46px,
leaving a 22px content box around a 20px line box. A `<button>` centres its
anonymous content block in that space; a block `<a>` does not.

```
text y   button 993.000   block anchor 992.000
```

Fixed with `flex items-center justify-center` (which also replaces the
horizontal centring a button gives by default). Text y is 993.000 again and both
Home screens now match the reference **exactly**. Verified the parent commit
reproduces the reference bit-for-bit in the same session, ruling out environment
drift before attributing the diff.

No other converted control needed anything — they all already used flex, where
`text-align` and anonymous-block centring have no effect.

## Deviations and limitations

- **`react-router-dom@7.18.2` carries a high-severity advisory.**
  `GHSA-qwww-vcr4-c8h2`, "RSC Mode CSRF Bypass Allows Action Execution Before
  400 Response", affects `react-router` 7.12.0–8.2.0. The parent commit had
  **0 vulnerabilities**; this dependency introduces 2. The advisory is specific
  to **RSC mode**, which this app does not use — it is a client-only SPA with
  `BrowserRouter`, no server components, no data-router actions, no loaders. The
  pin was specified exactly, and `npm audit fix --force` would downgrade to
  7.11.0, a breaking change that contradicts it. Flagged for a decision rather
  than silently accepted or silently downgraded. Note that neither workflow runs
  `npm audit`, so CI will not fail on it today.
- `captureScreens.cjs` was modified. It is a dev tool, not application code, and
  the change was forced by the nav conversion.
- Scope held: no fighter/event/matchup routes, no query-string state, no
  `/model-lab`, no component splitting or lazy loading, no changes to model,
  betting, statistics, workflow, data, coefficients, styling or screen content.
- `vercel.json` unchanged. Its existing rewrite already sends everything except
  assets to `/index.html`, and all seven paths plus an unknown path returned 200
  on both the dev server and `vite preview`.
- The route tests cover the registry, not the wiring. That App consumes it
  correctly is covered by the 34-check browser pass, which is manual in the
  sense that it is not part of `npm test` — there is no jsdom/RTL setup in this
  project and Stage 5 did not add one.
- The statistics screen remains visually non-deterministic and is still compared
  under tolerance rather than exactly.
