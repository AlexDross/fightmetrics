# Handoff: Milestone 1 — "Public-ready and fail-safe"

**Roles.** Claude is the developer: it writes the code, tests and PR. Codex is the reviewer: it reviews each PR against this brief, and it does not push commits to the branch. Alex approves and merges.

**Status at handoff (2026-10-28).** No app code has been changed yet. The only output so far is the review page `research/modernization_review.html` (untracked; published at https://claude.ai/artifact/DdiNpQvEhEVAcmWhLjH2YT). PR #56 (`feat/sportsbook-gate-v3-book`) is already merged. M1 work starts on a fresh branch cut from `origin/main`: `feat/m1-public-ready`.

---

## 1. Why this milestone

The modernization review found four problems that every signed-out visitor hits, and that are cheap to fix without touching the model, the document store's semantics or the database:

| # | Problem (observed on fightmetrics.app, signed out) | Evidence |
|---|---|---|
| 01 | Owner-only write controls render for everyone: Clear All, Delete, + Prop, "Actual winner" selects, and a fully editable ROI ledger (66 inputs for 13 fights on `/roi`). Writes are refused only at commit time. | `src/store/useDocumentStore.js:204` ("Sign in (Info tab) to save changes") |
| 02 | Internal model/gate IDs show up in user-facing copy. Home leads with "V3 bet record (C6 underdog gate, sportsbook prices) … No fights saved under c6_dog_v3_book yet." Other screens say "V2 opinion", "C6 agrees" and "pre-v3 gate". The header subtitle reads "Fight Prediction Engine · 2331 fighters · v7" and wraps at 800 px. | `V3RecordPanel` / `V3_PANEL_TITLE` (App.js ~1288), Header (App.js:3258), Upcoming/ROI card markup |
| 03 | `src/` has no error boundary, so one render throw blanks the whole app, nav included. | `grep -rn ErrorBoundary src` → none |
| 04 | Seven `window.confirm` calls (App.js:1845, 1928, 2054, 2394, 3028, 8351, 8690). Tiny text: `text-[9px]` ×3, `text-[10px]` ×23. | grep |

## 2. Scope

### In scope
1. **Write gating.**
   - Expose `canWrite` from `useDocumentStore` (it already computes it) through a small React context or prop.
   - When it is false, Upcoming, ROI, Props, Parlays and the Upcoming fight-day check render **read-only**: values shown as text, with no inputs, selects or Delete/Clear/+Prop/+Parlay/Build Parlay buttons.
   - The owner (`canWrite === true`) sees exactly today's UI.
   - Local mode (no Supabase configured, `npm run dev`) counts as `canWrite === true` and must keep working.
2. **Plain-language copy.**
   - Add `src/ui/labels.js` mapping gate/model identifiers to display strings.
   - Update rendered copy on the Home, Upcoming, ROI and Statistics section headers and on the app Header.
   - Version strings ("DrossPom Composite v1.0 · Logistic v2.0", "v7") move to the Info tab.
   - The empty V3 record becomes one muted line, not the lead card.
3. **Error boundary.** One boundary around `<main>` in `App`, keyed by `view` so navigating resets it. The fallback says what happened, offers Reload, and leaves Header/BottomNav working.
4. **ConfirmDialog + text floor.**
   - Add `src/ui/ConfirmDialog.jsx` (accessible: `role="alertdialog"`, focus trap, Esc cancels, focus returns to the trigger).
   - Replace all 7 `window.confirm` calls. The two-step Clear All flow (App.js:8351) keeps two steps.
   - Raise `text-[9px]` and `text-[10px]` to at least 11px.

### Out of scope (reject if present in the diff)
- Layout redesign: the FightRow mockup and the Simulator reorder belong to Milestone 3.
- Splitting `App.js` into route modules, `React.lazy`, and bundle work (Milestone 2).
- Any change to `src/domain/**` logic, `MODEL`/`MODEL_V2`, gate math or stored payload shapes.
- Changes to `useDocumentStore` write/replay semantics. Only *exposing* `canWrite` is allowed.
- Supabase migrations, RPCs or `supabase/` files. Data files (`src/*Data.js`, `fightHistory.js`, etc.).
- Renaming gate IDs in stored data. Labels are display-only.

## 3. Hard constraints (from the repo and the owner)

- `src/App.js` and `src/index.js` contain JSX in `.js` files. Do not rename them; baselines and docs reference App.js line numbers.
- Tests under `src/data/**` use `.test.mjs` on purpose (see the comment on Tailwind `@source` in `vite.config.mjs`). New tests that mention utility-like strings must not change production CSS.
- Do not touch `eloModule.js` or `cardioModule.js`.
- Do not modify production data. Never run `supabase db reset --linked`. The local Supabase stack must be started with `npm run db:start` (minimal `-x` service set); the full stack runs out of memory on the 2 GB Docker VM.
- Source maps stay off by default.
- Upcoming order stays main event on top, opener at the bottom.

## 4. Acceptance criteria (Codex checks each one)

- [ ] **Signed-out read-only.** Automated tests (jsdom, `// @vitest-environment jsdom`) render `/upcoming` (all three sub-tabs) and `/roi` (all sub-tabs) in each non-writing store state:
  - `live` with `canWrite === false` (signed out, or a signed-in non-writer)
  - `loading`
  - `unseeded`
  - `offline`

  In every one of these states the rendered output contains zero `input`, `select` or `textarea` elements. It also contains no write action: Delete, Clear All, + Prop, + Parlay, Build Parlay, Grade / actual-winner selection, and the Upcoming fight-day check (record, edit and clear actions).
- [ ] **Owner unchanged.** With `canWrite === true` the same screens render every control they render today. Covered by a test. `npm run test:api` passes (local Supabase).
- [ ] **Local mode works.** `npm run dev` with no `VITE_SUPABASE_*` lets you save from the Simulator to Upcoming and grade a fight.
- [ ] **No internal IDs in copy.** A test renders Home, Upcoming and ROI with fixture data and asserts that the rendered text does not match `/c6_|v3_book|pre-v3|gate/i`. Version strings appear on Info only.
- [ ] **Error boundary.** A test renders `App` with a route component that throws and asserts that the fallback shows, that Header nav links are present, and that navigating to another view renders it.
- [ ] **Confirmations.** `grep -c "window.confirm" src/App.js` → 0. A ConfirmDialog test covers confirm, cancel, Esc, and focus return.
- [ ] **Text floor.** `grep -E "text-\[(9|10)px\]" -r src --include=*.js --include=*.jsx` → no matches.
- [ ] **Nothing else regressed.** `npm test` (currently 70 files / 1,157 tests) and `npm run build` pass. The CI workflow is green on the PR. `npm run rankings:bundle-check` passes.
- [ ] **Diff stays in scope.** No files under `src/domain/`, `supabase/`, data modules, or the `useDocumentStore` write path change, beyond exposing `canWrite`.

## 5. Delivery plan (Claude)

These are small PRs so each review stays focused.

**Targeting.** An independent PR targets `main`. A PR that depends on a predecessor that hasn't merged yet targets that predecessor's branch, and is retargeted to `main` once the predecessor merges.

Each PR implements one scope item from section 2 and closes the acceptance boxes named here:

1. `feat(ui): error boundary around routes` (scope item 3) closes **Error boundary**.
2. `feat(ui): ConfirmDialog, replace window.confirm, text-size floor` (scope item 4) closes **Confirmations** and **Text floor**.
3. `feat(ui): read-only views for non-writers` (scope item 1) closes **Signed-out read-only**, **Owner unchanged** and **Local mode works**.
4. `feat(ui): plain-language labels; versions move to Info` (scope item 2) closes **No internal IDs in copy**.

Every PR must also satisfy **Nothing else regressed** and **Diff stays in scope**.

Each PR description names the acceptance boxes it closes by their bold names in section 4, not by number. It also includes the test command output and before/after screenshots (desktop 1280 px and mobile 375 px) of the screens it touches.

## 6. How Codex should review

**Setup**
```bash
git fetch origin && git checkout <pr-branch>
npm ci
npm test
npm run build
```
For `test:api`, run `npm run db:start` first, then `npm run test:api`.

**Focus, in priority order**
1. **Correctness of gating.**
   - Is every write affordance gated?
   - Search the diff and `App.js` for `onDelete`, `onGrade`, `onUpdateEntry`, `onAddPropPick`, `onAddParlay`, `onClearEntries` and `BufferedTextInput`/`UnitsStakedInput` usages that still render for non-writers.
   - Check the `loading`, `unseeded` and `offline` store modes too. They are read-only, so controls should be hidden there as well.
2. **No semantic drift.**
   - Read-only rendering must show the same values the editable fields showed (odds, units, actual winner, execution record).
   - Watch for formatting differences, such as `+115` vs `115`, or a missing push/void result.
3. **Store untouched.** `useDocumentStore.js` diff limited to exposing values. No change to `commit`, `runCommit`, `replayPending` or the mode transitions.
4. **Accessibility.**
   - The ConfirmDialog traps focus and restores it to the trigger.
   - The error fallback is announced (`role="alert"`).
   - Read-only values keep their labels: a visible label, or `aria-label` on a definition list.
5. **Copy.**
   - Labels are plain and consistent across screens.
   - Gate IDs remain unchanged in data, tests and fixtures.
   - Statistics may keep one technical detail line on the Info tab.
6. **Scope.** Flag anything listed in "Out of scope".

**Output format.** One comment per PR:
- **Verdict:** approve / request changes.
- **Findings:** severity (blocker / should-fix / nit), `file:line`, what breaks, and a concrete failure scenario.
- **Acceptance boxes:** which ones this PR satisfies, and which you verified by running rather than reading.

Do not push commits to the PR branch. Claude applies the fixes, and Alex merges once the review is approved and CI is green.

## 7. Context pointers

- The review and its rationale: `research/modernization_review.html`
- Persistence design: `docs/DOCUMENT_STORE_ROLLOUT.md`, `docs/STAGE_7_PLAN.md` ("Document store pivot — 2026-09-30")
- Route registry: `src/app/routes.jsx`
- Auth and read surfaces: `src/auth/AuthProvider.jsx`; `auth.canWrite`, `auth.readSurface`
- Existing jsdom test examples: `src/auth/__tests__/AuthProvider.test.mjs`, `src/__tests__/accessibility.test.js`
- Older running log (model work, not this milestone): `CODEX_CLAUDE_HANDOFF.md`
