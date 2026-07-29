// Stage 7 Gate 1 — repository result, error and transport types.
//
// The UI depends on THIS module and the repository interfaces, never on
// @supabase/supabase-js. Swapping the in-memory backing for Postgres at Gate 6
// must not change a single import in src/App.js.
//
// .mjs, like the rest of src/data: Tailwind's @source globs match .js/.jsx under
// src/ whether or not a file is imported, and enum strings here are class-name
// candidates. See src/data/schemas/__tests__/tailwindScoping.test.mjs.

// ── Result ──────────────────────────────────────────────────────────────────
export const ok = (data, revision = null) =>
  revision === null ? { ok: true, data } : { ok: true, data, revision };

export const err = (error) => ({ ok: false, error });

/** Error kinds, exhaustive. The UI switches on `kind` and must handle each. */
export const ERROR_KINDS = Object.freeze([
  'offline',          // no network / fetch failed
  'unauthenticated',  // no session; a write was attempted signed out
  'forbidden',        // authenticated but not an owner/editor of this workspace
  'conflict',         // expected revision did not match — someone else wrote
  'validation',       // payload rejected before or by the storage boundary
  'notFound',         // id resolves to nothing in this workspace
  'server',           // anything else, carrying the raw code for diagnosis
]);

export const offline = () => err({ kind: 'offline' });
export const unauthenticated = () => err({ kind: 'unauthenticated' });
export const forbidden = () => err({ kind: 'forbidden' });
export const notFound = () => err({ kind: 'notFound' });
export const validation = (issues) => err({ kind: 'validation', issues });
export const server = (code, message) => err({ kind: 'server', code, message });

/**
 * Conflict carries the server's current revision so the UI can re-read and
 * offer "re-apply". serverRevision is an opaque STRING — see below.
 */
export const conflict = (serverRevision) =>
  err({ kind: 'conflict', serverRevision: String(serverRevision) });

/**
 * Postgres SQLSTATE -> RepositoryError kind. Gate 6 uses this for the real
 * client; Gate 1 pins the mapping so both backings agree.
 */
export const errorFromSqlState = (code, message = '') => {
  switch (code) {
    case '42501': return forbidden();
    case 'P0001': return conflict(extractServerRevision(message));
    case '42704': return notFound();
    case '23505':
    case '23503':
    case '23514': return validation([{ code, message }]);
    default: return server(code ?? 'unknown', message);
  }
};

const extractServerRevision = (message) => {
  const m = /revision[=: ]+(\d+)/i.exec(message ?? '');
  return m ? m[1] : '0';
};

// ── Revision transport ──────────────────────────────────────────────────────
// A Postgres bigint cannot survive JSON as a JS number:
//   JSON.parse('{"r":9007199254740993}').r === 9007199254740992
// so revisions are decimal STRINGS end to end. The UI never does arithmetic on
// them; they are compared for equality and passed back verbatim.
const REVISION_RE = /^(0|[1-9][0-9]{0,18})$/;

export const isRevision = (v) => typeof v === 'string' && REVISION_RE.test(v);

export const assertRevision = (v) => {
  if (!isRevision(v)) {
    throw new TypeError(`revision must be a decimal string of at most 19 digits, got ${JSON.stringify(v)}`);
  }
  return v;
};

// ── Stake transport ─────────────────────────────────────────────────────────
// numeric in Postgres, decimal string on the wire, JS number in the domain.
//
// The accepting pattern deliberately has NO per-component caps. A {1,20}
// fractional cap rejected 12,823 of a 699,826-value seeded corpus (1.8%),
// including the very value that justified the length bound:
//   0.0000057692833136856875   <- 24 chars, 22 fractional digits
// The 32-character total bound is what prevents an abusive mantissa or exponent.
// Measured maxima: longest String(finite positive double) = 24,
// Number.MAX_VALUE = 23 ("1.7976931348623157e+308"), Number.MIN_VALUE = 6 ("5e-324").
export const STAKE_MAX_LENGTH = 32;
const STAKE_RE = /^(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?$/;

/** JS number -> canonical decimal string. Rejects everything Stage 6 rejects. */
export const toStakeTransport = (n) => {
  if (typeof n !== 'number') throw new TypeError(`stake must be a number, got ${typeof n}`);
  if (Object.is(n, -0)) throw new TypeError('stake must not be negative zero');
  if (!Number.isFinite(n)) throw new TypeError(`stake must be finite, got ${n}`);
  if (n <= 0) throw new TypeError(`stake must be > 0, got ${n}`);
  // String() emits the shortest representation that round-trips exactly, which
  // is why fromStakeTransport(toStakeTransport(n)) is Object.is-equal to n.
  const s = String(n);
  if (s.length > STAKE_MAX_LENGTH) throw new TypeError(`stake string too long: ${s.length}`);
  if (!STAKE_RE.test(s)) throw new TypeError(`stake is not a canonical positive decimal: ${s}`);
  return s;
};

/** Decimal string -> JS number, validated on the way in. */
export const fromStakeTransport = (s) => {
  if (typeof s !== 'string') throw new TypeError(`stake transport must be a string, got ${typeof s}`);
  if (s.length > STAKE_MAX_LENGTH) throw new TypeError(`stake string too long: ${s.length}`);
  if (!STAKE_RE.test(s)) throw new TypeError(`stake is not a canonical positive decimal: ${s}`);
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) throw new TypeError(`stake did not parse to a positive finite number: ${s}`);
  return n;
};

/** Shape check only — used by the contract tests, mirrors the SQL regex. */
export const isStakeTransport = (s) =>
  typeof s === 'string' && s.length <= STAKE_MAX_LENGTH && STAKE_RE.test(s);

// ── Semantic equality ───────────────────────────────────────────────────────
/**
 * Recursive semantic comparison with Object.is ONLY at numeric leaves.
 *
 * Object.is on two objects compares identity, so "deep Object.is equality" is
 * not a thing — this walks the structure and applies Object.is at the leaves,
 * which is what distinguishes 0 from -0 and NaN from NaN.
 */
export const semanticEquals = (a, b) => {
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return Object.is(a, b);
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => semanticEquals(v, b[i]));
  }
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length || ka.some((k, i) => k !== kb[i])) return false;
  return ka.every((k) => semanticEquals(a[k], b[k]));
};
