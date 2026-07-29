# FightMetrics durable domain schema — v1

Stage 6. Defines the permanent data structure before Stage 7 adds persistence.
Backend-agnostic: the shape works unchanged on IndexedDB or Supabase/Postgres.

**Nothing here is imported by `App.js`. No runtime behaviour changed.**

- Schemas: `src/data/schemas/*.mjs` (Zod 4.4.3, strict)
- Migration: `src/data/migration/*.mjs` (pure, injected clock and ID provider)
- Field map: `src/data/migration/legacyFieldMap.mjs`
- Examples: `src/data/schemas/examples.mjs`

## Design commitments

1. **A prediction is not a bet.** The model output, the market price, the
   assessment combining them, and the position being tracked are four separate
   records.
2. **Snapshots are immutable.** Grading writes `Bout.result` and
   `TrackedPosition.settlement`. It can never reach a PredictionSnapshot or
   MarketSnapshot, because no write path exposes them.
3. **The historical track record is preserved exactly.** All 160 legacy rows
   become TrackedPositions — including all 114 `NO BET` rows and the 10 with no
   tier at all. `computeROISummary` already counts them; dropping any would
   silently rewrite the record.
4. **Absence is explicit.** `null`, never `undefined`. Nothing is invented to
   fill a gap.

## Entities

| Entity | Mutability | Purpose |
|---|---|---|
| `Event` | name/date mutable | A card. Nothing joins on its label. |
| `Bout` | `result` mutable | A fight. Owns canonical corner orientation. |
| `PredictionRun` | immutable | One legacy save: finish projection, prospect context, which snapshot decided. |
| `PredictionSnapshot` | **immutable** | One model basis' output. Many per bout. |
| `MarketSnapshot` | **immutable** | Market facts only: odds, source, time. |
| `BettingAssessment` | **immutable** | prediction × market: fair lines, edge, EV, Kelly, tier, recommendation. |
| `TrackedPosition` | settlement/stake/notes mutable | The historical record. Every legacy row is one. |
| `Wager` | settlement/notes mutable | A genuinely placed bet. **Zero migrated.** |
| `Prop` | `result` mutable | Fight- or event-level prop. |
| `Parlay` | immutable | Multi-leg bet. Status/result derived, never stored. |

```
Event 1 ──< Bout
              ├──< PredictionRun ──decisionSnapshotId──┐
              │        └──< PredictionSnapshot  ◄──────┘  (must belong to this run)
              ├──< MarketSnapshot
              ├──< BettingAssessment ── predictionSnapshotId + marketSnapshotId|null
              │         ├──< TrackedPosition
              │         └──< Wager
              ├──< Prop   target = {kind:'bout',boutId,corner} | {kind:'event',eventId}
              └──< ParlayLeg ──> Parlay
```

### Why these splits

**`BettingAssessment` is separate from `MarketSnapshot`** because fair line,
edge, EV and Kelly are not market facts — they combine a market with a model,
and one market can be assessed against several prediction snapshots. Both
corners' values are retained; the app reads both.

**`TrackedPosition` is separate from `BettingAssessment`** because the side
FightMetrics follows is a position, not a calculation. `trackedSide` maps here
and nowhere else.

**`Wager` is separate from `TrackedPosition`** because a real bet may
intentionally differ from the model-tracked side. They are siblings under an
assessment and are *not* required to agree on corner.

**One `PredictionSnapshot` per model basis.** 43 legacy rows carry a v2
probability that was reconstructed *after* a v1 decision — so capture mode
differs per basis within a single row. A single `probA`/`probB` pair could not
represent that. `fighterAProb`/`fighterBProb` are never overwritten by
`v2pA`/`v2pB`.

The decision basis is recorded **once**, as `PredictionRun.decisionSnapshotId`.
There is no `decisionBasis` string and no `isDecisionBasis` flag to disagree
with it.

## Optional values

- Every field the **selected** union variant defines is present; nullable ones
  carry explicit `null`. Fields belonging only to *other* variants are absent.
  So `{status:'pending'}` has no `method` key, while
  `{status:'resolved', outcome:'noContest', method:null}` carries an explicit null.
- `undefined` is rejected recursively. Arrays are dense and contain no holes.
- `NaN`, `Infinity` and `-0` are rejected. `-0` matters: `JSON.stringify`
  writes `0`, so persisting it changes silently on round-trip.
- **No generic `"" → null` canonicalizer.** Empty-string meaning is
  field-specific; a blanket transform would convert an invalid required name
  into `null` instead of failing. Legacy migration uses field-aware transforms
  (`notes ""→null`, odds `""→null`, `actualWinner ""→pending`, required names
  `""→` validation failure). New v1 writes get no coercion at all.

## Odds

Stored as **integers**, never presentation strings. All 952 non-blank legacy
values parse cleanly; observed range −1600…900 (fair lines −472…472), nothing
inside (−100, 100), no zeros. The `+` is added by the UI.

## finishProjection

```
{ status: 'absent' }
{ status: 'computed', koPct, subPct, decPct, leaders: [...] }
```

- Sum ∈ **[99, 101]**. Measured: 99×16, 100×126, 101×18 — three independent
  roundings of values totalling 100.
- `leaders` is **exactly** the argmax set, canonical order KO/TKO → SUB → DEC,
  1–3 entries, no duplicates. Reproduces the legacy `projectedFinish` string on
  160/160, including `"KO/TKO / DEC"` and `"SUB / DEC"`.

## Results and settlement

```
BoutResult  = {status:'pending'}
            | {status:'resolved', outcome:'A'|'B'|'draw'|'noContest', method: FinishMethod|null}

settlement  = {status:'open'}
            | {status:'settled', outcome:'won'|'lost'|'push'|'void',
               financialResult: {status:'computed', profitUnits}
                              | {status:'uncomputable', reason:'missingSelectedCornerOdds'},
               settledAt: ISO|null}
```

The sporting outcome and the financial result are separate so a known result
survives an unknown price. One real record needs it: a DRAW with
`actualFinish: "DEC"` — the method is preserved, not flattened away.

**Computability follows the selected corner's odds**, not whether a market
snapshot exists — a partial market can price one corner and not the other.
Push and void are always a computed `0`.

`settledAt` is `null` for all 153 migrated settled positions. Legacy data never
recorded one, and substituting the migration clock would turn the moment of data
conversion into a false historical event. Only `origin: 'legacyMigration'`
records may use `null`; anything the app settles must supply a real timestamp.

## Identity

| Entity | Migrated | New |
|---|---|---|
| Event | `uuidv5(NS_EVENT, promotion\|date\|normalizedName)` | UUIDv7 |
| Bout | `uuidv5(NS_BOUT, eventId\|sortedFighterKeys)` | UUIDv7 |
| PredictionRun | legacy id verbatim | UUIDv7 |
| PredictionSnapshot | `uuidv5(NS_SNAPSHOT, runId\|basis)` | UUIDv7 |
| MarketSnapshot | `uuidv5(NS_MARKET, runId\|market)` | UUIDv7 |
| BettingAssessment | `uuidv5(NS_ASSESSMENT, runId\|assessment)` | UUIDv7 |
| TrackedPosition | `uuidv5(NS_TRACKED, runId\|tracked-position)` | UUIDv7 |
| Prop / Parlay | legacy id verbatim | UUIDv7 |

IDs are minted **once**. Later editing `Event.name`, `Event.promotion` or
attaching real fighter IDs does not change any ID. Because `eventId` is inside
the bout derivation, a **cross-event rematch produces a different Bout ID** —
the structural fix for the known collision.

`fighterKey` (NFC + trim + collapse + lowercase) is a **non-authoritative**
migration matching hint, never a uniqueness constraint. `fighterId` stays `null`
until Stage 9.

### Canonical corner orientation

Bout IDs use an unordered pair, but probabilities and results are corner-based.
The **first deterministic legacy occurrence** fixes the orientation — first in a
stable sort by `createdAt` then `id`, never Map or array iteration order. Every
later row for the same bout is remapped into that orientation before anything is
stored. Migration output is therefore independent of input ordering, which is
asserted by reversing the inputs and comparing.

## Timestamps

Every value comes from legacy data or the injected clock. Nothing invented.

| Field | Source |
|---|---|
| `PredictionRun.createdAt` | legacy `createdAt` |
| v1 `capturedAt` | legacy `createdAt` (no separate v1 timestamp exists) |
| v2 `capturedAt` | `_provenance.predictionTimestamp` |
| `MarketSnapshot.capturedAt` | legacy `createdAt` — the odds belong to the original save, not a later reconstruction |
| `BettingAssessment.frozenAt` | legacy `createdAt` |
| `TrackedPosition.openedAt` | legacy `createdAt` |
| `Event`/`Bout.createdAt` | earliest related legacy `createdAt` |
| `updatedAt` | `null` everywhere |
| `settledAt` | `null` for all migrated settled positions |
| `targetEventDateAtCapture` | `_provenance.targetEventDate` (77 rows) else `eventDate` (83); equal wherever both exist |

## Versioning

- Initial version `1`; an unversioned legacy payload is `0`.
- Each migration accepts **exactly** its declared source version. `v0→v1` never
  has to accept its own output.
- The **dispatcher** is the idempotent part: on already-current data it is a no-op.
- Migrations are pure — `{ migratedAt, newId }` injected, so repeated runs are
  byte-identical and `migratedAt` never makes tests nondeterministic.
- Forward-only. Rollback is restore-from-export.
- An unknown future version **blocks writes and migrations** and offers a
  read-only/export recovery path (`UnknownFutureVersionError.readOnly`).

## Migration result

| Entity | Count |
|---|---|
| Events | 16 |
| Bouts | 160 |
| PredictionRuns | 160 |
| PredictionSnapshots | **237** (160 v1 + 77 v2) |
| MarketSnapshots | 158 (160 − 2 with no odds) |
| BettingAssessments | 160 |
| TrackedPositions | 160 — **153 settled, 7 open** |
| **Wagers** | **0** |
| Props | 4 |
| Parlays | 0 |

Decision basis: 126 `legacy-v1-unversioned`, 34 `v2`.
Capture mode: 160 `unknown`, 43 `reconstructed`, 34 `live`.
**No provenance-less row is ever marked reconstructed** — the reconstructed set
is exactly the 43 that say so; the 83 without `_provenance` become `unknown`
with `provenanceCompleteness: 'none'`.

## Tailwind CSS safety

`src/style.css` declares `@source './**/*.js'` and `'./**/*.jsx'`, which match
files under `src/` **whether or not anything imports them**. Schema enum strings
are class-name candidates.

Everything under `src/data` — including its tests — uses `.mjs`, which neither
glob matches. `vite.config.mjs` adds `src/**/__tests__/**/*.test.mjs` to the
Vitest include so those tests still run.

This is verified, not assumed. `TAILWIND_CANARY = 'static'` exists precisely
because `.fixed`, `.block`, `.hidden` and `.flex` **are** already emitted while
`.static` is **not**.

> During implementation the canary fired for real: the scoping test was
> initially written as `.test.js`, and merely containing the literal `'static'`
> added `.static{position:static}` to the bundle and grew the CSS by 24 bytes
> (51,993 → 52,017). Renaming the data tests to `.mjs` restored the stylesheet
> to `4f72dadb556c0ea47a480c772cdb8f32b6d7212a14a7d6be020c27ad7cb299cb`,
> byte-identical to the pre-Stage-6 baseline. The hazard applies to test files,
> not just source files.

## Known limitations

- **`Freedom 250` has `promotion: null`.** The saved name proves only that it
  lacks a UFC prefix, not which promotion ran the card. Recorded in the
  migration manifest as unresolved.
- **`confirmedByUser` is not introduced.** Read 6× in `src/domain/statistics`
  but written 0/160 times. Recorded as a reader-only phantom so Stage 8 can
  implement or remove it deliberately.
- `Bout.division` stays free text, including 23 catchweight `"X / Y"` strings.
- Parlay coverage is derived from the constructor and readers, since
  `PARLAY_ENTRIES` is empty.
- Cross-event rematch handling and `computeV2Summary`'s missing live-only filter
  are **accommodated** by this schema but deliberately **not fixed** here.
