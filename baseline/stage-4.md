# Foundation Stage 4 — enforced test suite, harness removed

The Stage 0 golden reference stops being a manual browser-capture gate and
becomes a Vitest suite that runs in ~2 s. The browser bridge is gone.

| Commit | Content |
|---|---|
| `5777f68` | Vitest harness, fixtures moved, domain goldens |
| `f68e999` | tightened golden contracts |
| `471e484` | exact probability-tier boundaries |
| `42e0c97` | workflow transition extraction |
| `6fe73e1` | workflow + statistics characterisation; dev harness removed |
| *(this)* | non-vacuous prop and parlay population tests |

**156 tests across 12 files, ~1.4 s.**

## Protected fixtures — unchanged, now enforced in-suite

Moved `baseline/fixtures/` → `src/__tests__/fixtures/` by `git mv` in `5777f68`;
all seven landed as pure renames. `fixtureIntegrity.test.js` hashes the bytes on
every run and also asserts the directory holds *exactly* these seven files.

```
characterisation.json     388ca4f3b74e499342caa7dd05a8bb90da3c03c4a600085c9ac13f2f65fe3921
entries.golden.json       827c1ffd67b9d5ea1eee5a54947b317f57350031d74779fb87db58d79567fbca
fightHistory.hashes.json  7115625d8e979b5f394a303501e3bfb708bf3115d324306c507369a13dac7514
fighters.golden.json      9de29d14dafee0694bc747bbd003a106120c27756c4688858c5ec69882816c2c
model.golden.json         1a007e2e91305d297088f6153c209f50a45ad816ab196763c6db3041da14894a
roster.manifest.json      ba9aeb0a184aa976a966bcc3b03ab5ee2c446d17999ed64136766304bd2d7519
statistics.golden.json    04cb4256e1effa624d13dce2681c959d327f12d79554e47c68c181e28d265100
```

## Statistics input — separate, frozen, corroborated

`src/__tests__/inputs/statistics.input.json` — deliberately **not** beside the
seven approved goldens, which `fixtureIntegrity.test.js` requires to stay exactly
seven.

```
raw bytes           abc4f2b6d3e6f366bcf0e91670fd2a66d11a664bfb710305c78201451018208c
canonical entries   7a95e185983c88334ac6bf52fba663b659233e55f96c21481a38b15db625cb00
source commit       42e0c97
roiData blob        6a6bb3f53ab1
fightersData blob   464a017bbf0b
prospectsData blob  000b8b79e351
```

153 entries, 70 in the `since_2026-05-23` window, prospect list
`["Darya Zheleznyakova"]`.

**Derivation and corroboration.** The prospect name is `getActiveProspects()`
minus names already in `_D2` — the same derivation App uses to set
`IS_PROSPECT`, which is what the Stage 0 harness passed as `prospectNameSet`.
It is independently confirmed by the `prospect` selection reason in
`fighters.golden.json`. Before the input file was written, the generator
verified that these inputs reproduce **all 18** approved statistics results
exactly; it was written to refuse otherwise. `statistics.golden.json` is
untouched.

## What is tested

| File | Covers |
|---|---|
| `model/__tests__/model.golden.test.js` | 74 golden replays, per-path cross-engine budgets, 115 `-0` values |
| `model/__tests__/symmetry.test.js` | live-measured within-call / flip-sum / cross-slot |
| `betting/__tests__/boundaries.test.js` | odds, vig, EV, Kelly, every tier and edge boundary, overrides |
| `betting/__tests__/entries.golden.test.js` | 32 `buildRoiEntry` replays, `buildProvenance` |
| `finish/__tests__/finish.golden.test.js` | shape invariants, label vocabulary |
| `statistics/__tests__/statistics.golden.test.js` | all 18 results, exact, both populations |
| `statistics/__tests__/populations.test.js` | reconstructed exclusion, prop/parlay isolation, exclusion controls |
| `workflow/__tests__/workflow.test.js` | visibility, dedup, grading, removal, NO READ |
| `__tests__/lifecycle.test.js` | save → Upcoming → Grade → ROI, freeze-at-save |
| `__tests__/isolation.test.js` | direct-import guard, decoder and ULP self-tests |
| `__tests__/fixtureIntegrity.test.js` | seven approved fixture byte hashes |
| `__tests__/inputIntegrity.test.js` | statistics input byte + canonical hashes |

## Exclusion tests must be non-vacuous

The first revision of `populations.test.js` used invented prop and parlay
shapes: `result: 'win'` where production matches `'WON'`, `units` where it reads
`stake`, and legs keyed `entryId`/`side` where `computeParlayResult` reads
`fightId`/`pickedFighter`. Every aggregate came back zero, every parlay resolved
`PENDING`, and each "the excluded record changed nothing" assertion was
comparing 0 to 0. The tests passed while proving nothing.

Corrected to the real schema and restructured so every exclusion is preceded by
a **control** that proves the included record participates:

| Control | Asserted value |
|---|---|
| graded prop (`+150`, 1 unit, `WON`) | `graded 1`, `wins 1`, `staked 1`, `netUnits 1.5` |
| prop type breakdown | one bucket, `Method of Victory`, `count 1`, `netUnits 1.5` |
| settled parlay (`+300`, 1 unit) | `GRADED`/`WIN`, `graded 1`, `wins 1`, `staked 1`, `netUnits 3` |

Both excluded states are now genuinely reached rather than assumed: a leg with
no matching ROI id returns `PENDING`/`null`, and a leg resolved against an entry
whose `actualWinner` is `DRAW` returns `GRADED`/`NEEDS_REVIEW` with
`resolvedLegs === totalLegs`. Adding both to the settled-only aggregate leaves
it exactly unchanged — which also pins that `NEEDS_REVIEW` never falls into the
`LOSS` bucket by omission (it would have cut `netUnits` from 3 to 2).

The prop-isolation and parlay-isolation tests now assert their own summaries are
nonzero before concluding that ROI statistics were untouched.

## Behaviour characterised, not corrected

**Cross-event rematch collision.** `pendingMatchupKey` is the sorted fighter
pair with no event component, so a genuine rematch at a later card is silently
rejected while the first bout is still pending. Pinned by test and labelled as
current defective behaviour. Event-aware identity belongs to Stage 6.

**`computeV2Summary` does not apply the live-only filter.** Verified against the
source: `_provenance.captureMode === 'live'` appears only in
`computeModelVsMarketByBand` and `computeCalibrationReliability`. A reconstructed
row *does* move the v2 summary. Recorded so a future change is deliberate.

**Out-of-range dates normalise rather than failing open.** `'2026-13-45'` passes
the regex and `new Date(2026, 12, 45)` rolls forward to 14 Feb 2027 instead of
producing `NaN`, so the fail-open branch never fires for that input.

**Grading replaces rather than adds.** `buildRoiEntry` already stamps
`actualWinner: ''`, so `createGradedEntry` changes exactly one existing field and
adds no new key.

**Freeze-at-save** is asserted only for *stored* entries. A newly generated
prediction is expected to change when inputs change; a contrast test asserts
that too, so the invariant cannot be misread as "the model never responds to
new data."

## Harness removal

Removed from source: the `goldenHarness.js` dynamic import in `src/index.js` and
the entire `window.__FM_GOLDEN_INTERNALS__` bridge block from `src/App.js`.
`src/` now contains zero live references to either.

**Deleted (6):** `goldenHarness.js`, `captureGoldens.cjs`, `verifyFixtures.cjs`,
`fixtureReceiver.cjs`, `captureFightersArray.cjs`, `extractVerbatim.cjs`

**Retained (4):** `captureScreens.cjs`, `verifyScreens.cjs`, `diffScreens.cjs`
— through Stage 8 visual sign-off — and `hashFightHistory.cjs` as the long-term
keeper. Both protected screenshot references, their manifests, and
`baseline/REFERENCE_HASHES.json` are retained as historical metadata.

The Stage 3 disposition table said to remove all screenshot tooling in Stage 4.
That was wrong and `baseline/stage-3.md` now records what actually happened.

## Final verification

| Check | Result |
|---|---|
| Vitest | 156 passed, 12 files, **~1.4 s** |
| Production build | exit 0, 4.5 MB, 7 files in `build/` |
| No source maps / bridge markers in `build/` | 0 / 0 |
| No test code or fixture data bundled | 0 / 0 |
| No Tailwind CDN | 0 |
| `git diff --check` | clean |
| `hashFightHistory.cjs` | FIGHT HISTORY UNCHANGED, aggregate `1e52ca0c` |
| Stage 1b reference self-integrity | identical=14, fail=0 |
| Stage 0 reference self-integrity | identical=14, fail=0 |
| Warm candidate vs Stage 1b | identical=12, within-tolerance=2, fail=0 |
| Protected fixtures/screenshots | not regenerated |
| User files | 22 untouched |

## Known limitations

- Model goldens replay to **8 ULP** on eight SOS-derived paths, not bit-exactly,
  because they were captured in Chrome and replay in Node and `Math.exp` is not
  correctly rounded. Per-path budgets are measured and pinned.
- The suite is **not hermetic**: `src/domain/model` still imports `_D2` and
  `getHistoricalTier`. It is isolated from the date-derived assembled `FIGHTERS`
  collection, which is the property that matters. The import scanner is a
  direct-import guard, not a sandbox.
- Visual verification still requires a running dev server, headless Chrome and a
  warm-up capture. That stays until Stage 8.
- The projected-finish formula remains structurally broken and is characterised
  only.
- The bundle greps confirm no bridge, test or fixture content ships, but they
  cannot prove the *formula* is unreadable — minification mangles the internal
  identifiers while the result-object keys (`sosContribution`,
  `scaledComposite`, `agePenAdj`) necessarily survive because the UI reads them
  by name. Treat these as obfuscation checks, not secrecy guarantees.
