// Shared support for the Stage 4 golden suite.
//
// Two jobs: decode the approved fixtures losslessly, and compare floats with
// the precision the Stage 0 measurements actually justify.
//
// The fixtures are the APPROVED Stage 0 reference, moved verbatim from
// baseline/fixtures in commit 1 (all seven SHA-256 unchanged). Nothing here may
// rewrite, normalise or regenerate them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE_DIR = path.join(HERE, 'fixtures');

// ── lossless decode ─────────────────────────────────────────────────────────
// The capture harness encoded values JSON cannot represent. -0 is the one that
// actually occurs: 115 instances in model.golden.json, all in
// output.v2Contributions.{wins,losses,ko_wins,sub_wins,title_bouts} -- the five
// RED features whose v2 coefficients were zeroed, where `0 * negative === -0`.
//
// JSON.stringify(-0) emits "0" and Object.is(-0, 0) is false, so decoding this
// wrong would either break every comparison or, worse, silently pass while
// comparing 0 against -0 as if equal.
const SPECIALS = {
  '@-0': -0,
  '@NaN': NaN,
  '@Inf': Infinity,
  '@-Inf': -Infinity,
  '@undefined': undefined,
};

export function decodeSpecials(value) {
  if (typeof value === 'string' && Object.hasOwn(SPECIALS, value)) return SPECIALS[value];
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(decodeSpecials);
  const out = {};
  for (const k of Object.keys(value)) out[k] = decodeSpecials(value[k]);
  return out;
}

export function loadFixture(name) {
  return decodeSpecials(JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8')));
}

// ── exact structural comparison ─────────────────────────────────────────────
// Object.is at the leaves, so -0 !== 0, NaN === NaN, and undefined is
// distinguished from absent. Returns the first differing path, or null.
export function firstDifference(actual, expected, pathSoFar = '') {
  if (Object.is(actual, expected)) return null;

  const ta = actual === null ? 'null' : typeof actual;
  const te = expected === null ? 'null' : typeof expected;
  if (ta !== te) return { path: pathSoFar || '(root)', actual, expected, reason: 'type' };
  if (ta !== 'object') return { path: pathSoFar || '(root)', actual, expected, reason: 'value' };

  const keys = new Set([...Object.keys(actual ?? {}), ...Object.keys(expected ?? {})]);
  for (const k of [...keys].sort()) {
    const d = firstDifference(actual?.[k], expected?.[k], pathSoFar ? `${pathSoFar}.${k}` : k);
    if (d) return d;
  }
  return null;
}

export function expectExact(actual, expected, label) {
  const d = firstDifference(actual, expected);
  if (d) {
    throw new Error(
      `${label}: first difference at ${d.path} (${d.reason})\n` +
      `  actual   ${describe(d.actual)}\n  expected ${describe(d.expected)}`
    );
  }
}

function describe(v) {
  if (Object.is(v, -0)) return '-0';
  if (typeof v === 'number' && Number.isNaN(v)) return 'NaN';
  if (v === undefined) return 'undefined';
  return JSON.stringify(v);
}

// ── ULP comparison ──────────────────────────────────────────────────────────
// Stage 0 measured the real bounds. Flip-sum and cross-slot agreement hold to
// ONE unit in the last place -- 1.11e-16 at these magnitudes -- not to some
// round decimal. A 0.001 tolerance (the value the old shipped console.assert
// used) is ~13 orders of magnitude too loose, and toBeCloseTo would be looser
// still. So compare in ULP space.
const f64 = new Float64Array(1);
const bits = new BigInt64Array(f64.buffer);

function ordinal(x) {
  f64[0] = x;
  const b = bits[0];
  // Map the sign-magnitude layout onto a monotonic ordering so adjacent
  // representable doubles differ by exactly 1.
  return b < 0n ? -9223372036854775808n - b : b;
}

export function ulpDistance(a, b) {
  if (Object.is(a, b)) return 0n;
  if (Number.isNaN(a) || Number.isNaN(b)) return Infinity;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Infinity;
  const d = ordinal(a) - ordinal(b);
  return d < 0n ? -d : d;
}

export function withinUlps(a, b, maxUlps = 1) {
  const d = ulpDistance(a, b);
  return d !== Infinity && d <= BigInt(maxUlps);
}

export function expectWithinUlps(a, b, label, maxUlps = 1) {
  if (!withinUlps(a, b, maxUlps)) {
    throw new Error(
      `${label}: ${a} vs ${b} differ by ${ulpDistance(a, b)} ULP (max ${maxUlps})`
    );
  }
}
