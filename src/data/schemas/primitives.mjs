// Stage 6 — shared primitives for the durable domain schema.
//
// .mjs ON PURPOSE. src/style.css declares `@source './**/*.js'` and
// `'./**/*.jsx'`, so Tailwind scans those extensions whether or not the file is
// imported anywhere. Enum strings in this directory are class-name candidates:
// TAILWIND_CANARY below is the proof. `.static` is NOT currently emitted in the
// production stylesheet while `.fixed`, `.block`, `.hidden`, `.flex` and others
// are, so if these files were ever scanned the CSS would gain a `.static` rule
// and change byte-for-byte. Neither @source glob matches .mjs, so it does not.
// See src/data/schemas/__tests__/tailwindScoping.test.js.
export const TAILWIND_CANARY = 'static';

import { z } from 'zod';

// ── numbers ────────────────────────────────────────────────────────────────
// Zod 4 already rejects NaN and Infinity for z.number(). It does NOT reject -0,
// which JSON.stringify writes as "0" and JSON.parse reads back as +0 — a silent
// round-trip change. Every persisted number therefore goes through this check.
const rejectNegativeZero = (schema) =>
  schema.check((ctx) => {
    if (Object.is(ctx.value, -0)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: 'negative zero is not permitted in persisted data (JSON round-trips it to +0)',
      });
    }
  });

export const finiteNumber = () => rejectNegativeZero(z.number());
export const integer = () => rejectNegativeZero(z.number().int());

/** Model probability. Bounded, finite, never -0. */
export const probability = () => rejectNegativeZero(z.number().min(0).max(1));

/** Stake in units. Must be > 0 — a zero-unit position is not a position. */
export const stakeUnits = () => rejectNegativeZero(z.number().positive());

// ── strings ────────────────────────────────────────────────────────────────
export const nonEmptyString = () => z.string().min(1);

/**
 * Calendar date, local, YYYY-MM-DD.
 *
 * z.iso.date(), NOT a regex. A shape-only pattern accepts '2026-13-45' and
 * '2026-02-30', which is exactly the malformed-date behaviour already
 * characterised as a defect elsewhere in this app (isUpcomingVisible silently
 * normalises '2026-13-45' to Feb 2027). The durable schema must not
 * institutionalise it: real calendar validation rejects impossible months and
 * days while still accepting genuine leap days such as 2024-02-29.
 *
 * Still a string, never a Date object: these are day-precision facts, and
 * converting through Date() reintroduces the UTC rollover bug the app already
 * fixed once.
 */
export const isoDate = () => z.iso.date();

/**
 * The maximum UTC offset PostgreSQL's `timestamptz` can represent, in minutes.
 * Beyond ±15:59 the cast fails with `time zone displacement out of range`.
 */
const MAX_PG_OFFSET_MINUTES = 15 * 60 + 59;

/**
 * ISO-8601 timestamp with a required offset (Z or ±HH:MM).
 *
 * `offset: true` permits both the Z form every legacy record uses and explicit
 * numeric offsets, while calendar/clock components are genuinely validated —
 * impossible months, days, hours, minutes and seconds are rejected rather than
 * pattern-matched. Fractional seconds are preserved.
 *
 * THE DURABLE TIMESTAMP CONTRACT. Stage 7 persists these in PostgreSQL as
 * `timestamptz`, so the schema must not accept a value the database cannot
 * store. Two narrowings are applied on top of Zod, each measured against a real
 * PostgreSQL cast:
 *
 *   - OFFSET. Bare `z.iso.datetime({offset:true})` accepts any ±HH:MM up to
 *     ±23:59, but PostgreSQL rejects anything beyond ±15:59 with `time zone
 *     displacement out of range` — measured, `+16:00` and `+23:59` both fail.
 *   - YEAR. Zod accepts year `0000`; PostgreSQL rejects it with `date/time field
 *     value out of range`, because its proleptic Gregorian calendar has no year
 *     zero (it runs 1 BC → 1 AD). `0001` and `9999` both cast, so the shared
 *     range is 0001–9999.
 *
 * Zod's own calendar/clock validation — which correctly rejects hour 24 and
 * second 60, both of which PostgreSQL would silently normalize — is retained
 * unchanged. The result is exactly one set of acceptable timestamps on both
 * sides; the paired conformance tests in tests/api/rpc-workspace.test.mjs assert
 * that agreement case for case.
 *
 * Every persisted timestamp is unaffected: exports emit canonical UTC text
 * (normally `+00:00`), whose offset is 0 and whose year is in range.
 */
export const isoDateTime = () =>
  z.iso.datetime({ offset: true })
    .refine(
      (s) => {
        const m = /([+-])(\d{2}):(\d{2})$/.exec(s);
        if (!m) return true; // the Z form: offset 0
        const minutes = Number(m[2]) * 60 + Number(m[3]);
        return minutes <= MAX_PG_OFFSET_MINUTES;
      },
      { message: 'UTC offset must be within ±15:59 (PostgreSQL timestamptz range)' }
    )
    .refine((s) => !s.startsWith('0000-'), {
      message: 'year must be between 0001 and 9999 (PostgreSQL timestamptz range)',
    });

/** UUID (v5 for migrated records, v7 for new ones). Accepts either. */
export const uuid = () =>
  z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    'expected a lowercase UUID'
  );

/** Legacy IDs are carried verbatim for PredictionRun / Prop / Parlay, so those
 *  id fields accept either a UUID or the legacy `${ms}-${base36}` shape. */
export const legacyOrUuid = () =>
  z.union([uuid(), z.string().regex(/^\d{13}-[a-z0-9]{6}$/, 'expected a legacy id')]);

// ── odds ───────────────────────────────────────────────────────────────────
// Stored as INTEGERS, not presentation strings. All 952 non-blank legacy odds
// values parse cleanly; the observed range is -1600..900 for market odds and
// -472..472 for fair lines, with nothing inside (-100, 100) and no zeros.
// The leading "+" is added by the UI, never persisted.
export const americanOdds = () =>
  rejectNegativeZero(z.number().int()).check((ctx) => {
    if (Math.abs(ctx.value) < 100) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: 'american odds must satisfy |odds| >= 100',
      });
    }
  });

// ── enums ──────────────────────────────────────────────────────────────────
export const Corner = z.enum(['A', 'B']);
export const FinishMethod = z.enum(['KO/TKO', 'SUB', 'DEC']);
export const ModelBasis = z.enum(['legacy-v1-unversioned', 'v2']);
export const CaptureMode = z.enum(['live', 'reconstructed', 'unknown']);
export const ProvenanceCompleteness = z.enum(['full', 'partial', 'none']);
export const BetTier = z.enum(['NO BET', 'LEAN', 'BET', 'STRONG BET']);
export const PickSource = z.enum(['human', 'model']);
export const RecordOrigin = z.enum(['legacyMigration', 'appCreated']);

/** Canonical ordering for finishProjection.leaders. */
export const FINISH_METHOD_ORDER = Object.freeze(['KO/TKO', 'SUB', 'DEC']);

// ── shared value objects ───────────────────────────────────────────────────
export const externalIds = () => z.record(z.string(), z.string());

/**
 * Settlement, shared by TrackedPosition and Wager.
 *
 * `settledAt` is nullable INSIDE the settled variant because 153 migrated
 * legacy positions have no recorded settlement time. Substituting the
 * migration clock there would turn the moment of data conversion into a false
 * historical event. Who may use null is constrained per entity: legacy-migrated
 * records may, application-created ones may not.
 *
 * financialResult is separate from the sporting outcome so a known result can
 * survive an unknown price — `outcome: 'won'` with an uncomputable profit is a
 * real and representable state.
 */
export const financialResult = () =>
  z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('computed'), profitUnits: finiteNumber() }),
    z.strictObject({
      status: z.literal('uncomputable'),
      reason: z.literal('missingSelectedCornerOdds'),
    }),
  ]);

export const settlement = () =>
  z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('open') }),
    z.strictObject({
      status: z.literal('settled'),
      outcome: z.enum(['won', 'lost', 'push', 'void']),
      financialResult: financialResult(),
      settledAt: isoDateTime().nullable(),
    }),
  ]);

/**
 * Review state for a tracked position.
 *
 * Replaces the two independent booleans the UI uses today (`autoGenerated` and
 * `confirmedByUser`). Two nullable booleans admit four combinations, of which
 * only three are meaningful and one — confirmed-but-not-auto-generated — is
 * nonsense. A discriminated union makes the invalid states unrepresentable.
 *
 * `confirmedAt: null` records a historical confirmation whose time was never
 * captured. TrackedPositionSchema restricts that to origin 'legacyMigration',
 * exactly as it already does for settlement.settledAt.
 *
 * Statistics exclude ONLY `status: 'pending'`. 'notRequired' is the normal
 * state for a manual Simulator save and must keep counting.
 */
export const reviewState = () =>
  z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('notRequired') }),
    z.strictObject({ status: z.literal('pending'), reason: z.literal('autoGenerated') }),
    z.strictObject({
      status: z.literal('confirmed'),
      reason: z.literal('autoGenerated'),
      confirmedAt: isoDateTime().nullable(),
    }),
  ]);

/**
 * finishProjection.
 *
 * Measured over all 160 legacy rows: the three percentages sum to 99, 100 or
 * 101 (never wider — 16/126/18), and `leaders` reproduces the legacy
 * projectedFinish string on 160/160 when taken as the exact argmax set.
 */
export const finishProjection = () =>
  z
    .discriminatedUnion('status', [
      z.strictObject({ status: z.literal('absent') }),
      z.strictObject({
        status: z.literal('computed'),
        koPct: integer().min(0).max(100),
        subPct: integer().min(0).max(100),
        decPct: integer().min(0).max(100),
        leaders: z.array(FinishMethod).min(1).max(3),
      }),
    ])
    .check((ctx) => {
      const v = ctx.value;
      if (!v || v.status !== 'computed') return;
      const sum = v.koPct + v.subPct + v.decPct;
      if (sum < 99 || sum > 101) {
        ctx.issues.push({
          code: 'custom',
          input: v,
          message: `finish percentages must sum to 99..101 (got ${sum})`,
        });
      }
      const byMethod = { 'KO/TKO': v.koPct, SUB: v.subPct, DEC: v.decPct };
      const max = Math.max(v.koPct, v.subPct, v.decPct);
      const expected = FINISH_METHOD_ORDER.filter((m) => byMethod[m] === max);
      if (new Set(v.leaders).size !== v.leaders.length) {
        ctx.issues.push({ code: 'custom', input: v, message: 'leaders must not contain duplicates' });
      }
      if (v.leaders.join('|') !== expected.join('|')) {
        ctx.issues.push({
          code: 'custom',
          input: v,
          message: `leaders must be exactly the max-percentage methods in canonical order (expected ${expected.join(', ')})`,
        });
      }
    });
