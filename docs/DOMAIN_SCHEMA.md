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
3. **The historical track record is preserved exactly.** Every committed ROI
   and Upcoming row becomes a TrackedPosition — including `NO BET` rows and
   rows with no tier at all. `computeROISummary` already counts them; dropping
   any would silently rewrite the record.
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

### Three independent prices

| Field | Meaning |
|---|---|
| `BettingAssessment.marketSnapshotId` | the prediction-time market that produced the **frozen** tier / edge / EV / Kelly / fair lines |
| `TrackedPosition.marketSnapshotId` | the price the tracked result is **scored** at |
| `Wager.marketSnapshotId` | the price actually **taken** |

They start equal and diverge. This is what lets the ROI tab correct a bad odds
entry without rewriting history: an amendment appends a **new immutable**
`MarketSnapshot` (copy the current one, replace only the selected corner) and
repoints **only** `TrackedPosition.marketSnapshotId`. The assessment and its
original market are never touched, and tier/edge/EV/Kelly/fair lines are never
recomputed. The superseded snapshot is retained for history and undo.

Changing the tracked corner updates `TrackedPosition.corner` alone; the
displayed price re-derives from the corresponding corner of the position's
existing market.

**Legacy `marketOdds` is a source field, not a derivation.** App.js edits it
independently (`:7890`) and rewrites it separately when the tracked side changes
(`:7868`), so it can legitimately disagree with `oddsA`/`oddsB`. It equals the
selected corner on every row in the original Stage 6 capture — but that is a
characterisation of that seed, not a rule. Deriving it would silently discard a
real correction, so migration parses it separately and reconciles:

| legacy `marketOdds` | result |
|---|---|
| key absent | reuse the assessment market |
| equals the selected assessment corner | reuse the assessment market |
| differs | **new** snapshot: copy both corners, replace only the tracked corner |
| explicitly blank | that corner is **explicitly unpriced** — never falls back to `oddsA`/`oddsB` |
| both corners end null | no snapshot; `marketSnapshotId` is `null` |

The override snapshot uses the deterministic id
`uuidv5(NS.MARKET, "${runId}|tracked-market")` and `source:
'legacyTrackedOverride'`. Settlement is scored at the tracked price, so
historical profit is never computed at a discarded one.

**`source` and `capturedAt` are bound biconditionally:**

```
source = 'legacyTrackedOverride'  ⟺  capturedAt IS NULL
source = 'manual'                 ⟺  capturedAt IS NOT NULL
```

| `source` | `capturedAt` | |
|---|---|---|
| `manual` | timestamp | ✅ |
| `manual` | `null` | ❌ |
| `legacyTrackedOverride` | `null` | ✅ |
| `legacyTrackedOverride` | timestamp | ❌ |

Only the first direction was enforced initially, which let an override carry a
real timestamp — a contradiction, because the sole thing that source asserts is
that no edit time was ever recorded. A one-way rule made the label
unfalsifiable. The schema now asserts both directions as separate checks, so a
future third source inherits the timestamp requirement rather than the
exemption.

**Stage 7 Postgres must carry the same bidirectional constraint**, not just the
nullable column:

```sql
ALTER TABLE market_snapshots ADD CONSTRAINT market_snapshot_capture_provenance
  CHECK ((source = 'legacyTrackedOverride') = (captured_at IS NULL));
```

Client-side Zod cannot protect a database with a public API, so this belongs in
the schema itself alongside the other JSONB and range CHECKs.

### Review state

`TrackedPosition.reviewState` is a discriminated union:

```
{ status: 'notRequired' }
{ status: 'pending',   reason: 'autoGenerated' }
{ status: 'confirmed', reason: 'autoGenerated', confirmedAt: ISODateTime | null }
```

It replaces the App.js pair `autoGenerated` / `confirmedByUser`. Two independent
booleans admit four combinations, one of which — confirmed but not
auto-generated — is meaningless; the union makes it unrepresentable. Statistics
exclude **only** `pending`. `confirmedAt: null` is permitted only for
`origin: 'legacyMigration'`, the same concession already made for
`settlement.settledAt`.

> **Correction.** An earlier revision of this document called `confirmedByUser`
> a "reader-only phantom, written 0/160 times". That was wrong: it looked only
> at the seed data and `src/domain`. `App.js` **writes** it at `:7389` (Confirm
> All) and `:7688` (Confirm Pick), and **reads** `autoGenerated` at `:7384`,
> `:7388`, `:7654`, `:7686`. They are active UI state that happens to be absent
> from every current seed row.

Legacy mapping is exhaustive and strict — ambiguous combinations **abort**
rather than being guessed, because a guess would silently move entries in or
out of the statistics population:

| `autoGenerated` | `confirmedByUser` | result |
|---|---|---|
| absent | absent | `notRequired` |
| `false` | absent | `notRequired` |
| `true` | `false` | `pending` |
| `true` | `true` | `confirmed`, `confirmedAt: null` |
| absent or `false` | present | **abort** |
| `true` | absent / non-boolean | **abort** |
| non-boolean | any | **abort** |

**One `PredictionSnapshot` per model basis.** Some legacy rows carry a v2
probability reconstructed *after* a v1 decision — so capture mode
differs per basis within a single row. A single `probA`/`probB` pair could not
represent that. `fighterAProb`/`fighterBProb` are never overwritten by
`v2pA`/`v2pB`.

The decision basis is recorded **once**, as `PredictionRun.decisionSnapshotId`.
There is no `decisionBasis` string and no `isDecisionBasis` flag to disagree
with it.

**Source provenance is attached to both snapshots of a full live record.**
`featureVector` is genuinely per-model and stays split by basis. But
`sourceManifest` and `fightHistoryCutoff` describe the *data* the live
calculation read, and several manifest modules are explicitly `feedsV2: true` —
so writing them only onto v1 made the v2 snapshot look unprovenanced when the
legacy record had supplied it. Both are copied to both bases for every full
live record: deliberate immutable duplication, not contradictory state.
Reconstructed records supply neither and keep `null` on both.

## Validation

Two layers, both required, both run by `migrateAndValidate`:

1. **Structural** — `StoreSchema.safeParse`. One record at a time.
2. **Relational** — `checkInvariants`. Foreign keys, denormalised-index
   consistency, decision-snapshot ownership, financial computability.

Zod alone is not sufficient and the two are not interchangeable: a
`PredictionRun` pointing at a nonexistent `Bout` parses perfectly. An earlier
version of `migrateAndValidate` ran only the structural pass and returned
success on exactly that input.

There is deliberately **no** v0 input schema. The six legacy generations differ
too much for one permissive schema to assert anything useful, and the
migration's own `errors` array already reports unparseable odds, unresolvable
props and same-key corners.

### Dates are calendar-validated

`z.iso.date()` and `z.iso.datetime({ offset: true })`, not regexes. A shape-only
pattern accepts `2026-13-45` and `2026-02-30` — which is precisely the
malformed-date behaviour already characterised as a defect elsewhere in this app
(`isUpcomingVisible` silently normalises `2026-13-45` to Feb 2027). Real leap
days such as `2024-02-29` are accepted; `2023-02-29` is not.

### The durable timestamp contract (JavaScript ⟷ PostgreSQL)

Stage 7 persists every timestamp as PostgreSQL `timestamptz`, so `isoDateTime()`
must accept **exactly** what the database can store — no wider, no narrower.
Bare `z.iso.datetime({ offset: true })` is wider in two directions (it accepts
offsets beyond ±15:59, and year `0000`), and the SQL side was wider in another
(unbounded `\d{2}` clock fields let hour 24 and second 60 through). All three
gaps are closed and pinned by paired conformance tests that assert the JS schema
and the HTTP import agree case for case.

| Form | Accepted | Why |
|---|---|---|
| `…T05:28Z`, `…T05:28:39Z`, `…T05:28:39.900566Z` | ✅ | minute, second and fractional precision |
| `…T23:59:59.999Z` | ✅ | the 23:59 clock is legal |
| `…T05:28+15:59` / `-15:59` | ✅ | the widest offset `timestamptz` represents |
| `0001-01-01T00:00Z`, `9999-12-31T23:59:59Z` | ✅ | the year range `timestamptz` represents |
| `…T24:00Z` | ❌ | hour must be 00–23. Zod rejects it; **PostgreSQL would silently normalise** it to the next day, so the SQL grammar carries the bound explicitly |
| `…T23:59:60Z` | ❌ | second must be 00–59 (no leap second). Same silent-normalisation hazard |
| `…T05:28+16:00`, `+23:59` | ❌ | beyond `timestamptz`'s range — the cast raises `time zone displacement out of range`, so `isoDateTime()` is **refined** to reject them up front |
| `0000-01-01T00:00Z` | ❌ | there is **no year zero** in PostgreSQL's proleptic Gregorian calendar (1 BC → 1 AD); the cast raises `date/time field value out of range`, while Zod alone accepts it — so `isoDateTime()` is refined to the shared range 0001–9999 |
| `2026-13-45T00:00:00Z` | ❌ | impossible calendar date |
| `…T05:28:39` (no offset) | ❌ | the offset is required |

**Storage normalises to UTC text while preserving the instant.** `timestamptz`
stores an instant, not the spelling it arrived in: `2026-08-08T05:28:39+03:15`
is read back as `2026-08-08T02:13:39+00:00`. The two are the same moment and
compare equal as instants (`Date.getTime()`), but they are **not** the same
string. Round-trip equality of *text* therefore holds only for values already in
the canonical UTC form — which is what `fm_member_export_store` always emits, and
so what every backup a user keeps and re-imports contains. Compare instants, not
strings, whenever a timestamp may not have come straight from an export.

### Financial computability is per-record-type

It depends on the selected corner's odds in the **relevant** market, which is
not the same market for both position types:

| Record | Market consulted |
|---|---|
| `TrackedPosition` | **`position.marketSnapshotId`** — the price it is scored at |
| `Wager` | `wager.marketSnapshotId` — the price actually taken |

Each record is scored against its own price. Reading the assessment market for
either would validate the wrong line: an assessment that priced the corner
would excuse a position or wager whose own market never did.

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

Stored as **integers**, never presentation strings. In the original Stage 6
audit, every non-blank legacy value parsed cleanly; observed range was
−1600…900 (fair lines −472…472), with nothing inside (−100, 100) and no zeros.
The `+` is added by the UI.

## finishProjection

```
{ status: 'absent' }
{ status: 'computed', koPct, subPct, decPct, leaders: [...] }
```

- Sum ∈ **[99, 101]**. The original Stage 6 audit observed all three totals —
  independent roundings of values totalling 100.
- `leaders` is **exactly** the argmax set, canonical order KO/TKO → SUB → DEC,
  1–3 entries, no duplicates. Reproduces every committed legacy
  `projectedFinish` string, including `"KO/TKO / DEC"` and `"SUB / DEC"`.

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

`settledAt` is `null` for every migrated settled position. Legacy data never
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
attaching real fighter IDs does not change any ID.

The ID layer is **browser-safe**: no Node builtins anywhere in `src/data`.
SHA-1 is implemented in-file and randomness comes from Web Crypto
(`globalThis.crypto.getRandomValues`). `npm run probe:browser` performs a real
Vite/Rollup browser build of the data-layer entry points and is bound as a test
— a source-text check alone would not have caught the original `node:crypto`
import, which failed the browser bundle outright.

### Namespace derivation

Every namespace is a valid RFC 4122/9562 UUID, and `uuidv5` **validates its
namespace argument** rather than accepting arbitrary 16 bytes — without that, a
malformed namespace silently produces plausible-looking IDs forever.

`NS.EVENT` is derived transparently from the standard DNS namespace:

```
root  = uuidv5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'fightmetrics.app')
      = 1c187bfd-7f44-55ea-a824-7a3e3a544118
EVENT = uuidv5(root, 'Event')
      = 833b2f12-8057-5c87-8e90-ac9d216371b0
```

A test recomputes that chain, and the SHA-1 implementation is pinned against the
published RFC 4122 reference vectors (`v5(DNS, 'python.org')` →
`886313e1-3b8a-5372-9b90-0c9aee199e5d`) rather than against our own output.

This replaced `6f9619ff-8b86-d011-b42d-00c04fc964ff`, the widely-copied
Microsoft-style GUID whose version nibble is `d` — not a valid UUID at all, and
now rejected by the validator. Correcting it changed Event IDs and the Bout IDs
derived from them. That was deliberate and free: no Stage 6 ID had been
persisted, pushed or read by the application. The other five namespaces were
already well-formed v4 UUIDs and are unchanged.

> The `uuid` package was evaluated as an alternative and not adopted: SHA-1
> in-file keeps the module dependency-free, and uuid@13.0.0 carried a moderate
> advisory in v3/v5/v6 itself (14.0.1 was clean).

Because `eventId` is inside the bout derivation, a **cross-event rematch
produces a different Bout ID** — the structural fix for the known collision.

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
| `targetEventDateAtCapture` | `_provenance.targetEventDate` when present, otherwise `eventDate`; equal wherever both exist |

## Versioning

**`SCHEMA_VERSION` stays at 1 through this correction — deliberately, and only
once.** Adding `TrackedPosition.marketSnapshotId` and `reviewState` is
incompatible with the shape defined at `dd81462`, so under normal rules it would
demand version 2 plus a forward migration. It does not here because **no durable
Store has ever been persisted**: there is no database, no export in circulation,
and the data layer still has zero runtime consumers (`src/App.js` imports
nothing from `src/data`). There is no v1 payload anywhere for a v1→v2 migration
to operate on.

**This concession expires the moment Stage 7 writes the first row.** From then
on every incompatible change increments `SCHEMA_VERSION` and ships an ordered
forward migration, per the contract below.

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

The legacy data files are active application state and change when an event is
saved or graded, so migration tests do not pin a weekly row total. They assert
the following source-to-store equations on every run:

| Entity | Required result |
|---|---|
| Events | one per unique event identity |
| Bouts | one per event + unordered fighter pair |
| PredictionRuns | one per ROI or Upcoming row |
| PredictionSnapshots | one v1 per row, plus one v2 wherever v2 output is stored |
| MarketSnapshots | one prediction-time market when priced, plus any independent tracked-price override |
| BettingAssessments | one per ROI or Upcoming row |
| TrackedPositions | one per ROI or Upcoming row; settlement status follows the source result |
| **Wagers** | **0** — legacy data cannot prove cash placement |
| Props | one per resolvable prop entry |
| Parlays | one per parlay entry, preserving every leg |

Decision basis and capture mode are compared to the corresponding source fields
rather than to a fixed count. **No provenance-less row is ever marked
reconstructed**; it becomes `unknown` with
`provenanceCompleteness: 'none'`.

ROI and Upcoming IDs must be unique and disjoint. A grading handoff that leaves
the same ID in both files aborts with a source-specific error; the two files
must be updated in the same commit.

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
- `Bout.division` stays free text, including 23 catchweight `"X / Y"` strings.
- Parlay coverage combines persisted entries with a complete runtime exemplar,
  so it remains binding whether the current event has zero or several parlays.
- Cross-event rematch handling and `computeV2Summary`'s missing live-only filter
  are **accommodated** by this schema but deliberately **not fixed** here.
