import { describe, it, expect } from 'vitest';
import {
  toStakeTransport, fromStakeTransport, matchesStakeShape, isValidStakeTransport,
  STAKE_MAX_LENGTH, PG_BIGINT_MAX,
  isRevision, assertRevision, semanticEquals, errorFromSqlState,
  ok, conflict, forbidden, notFound, offline, unauthenticated, ERROR_KINDS,
} from '../types.mjs';

// Seeded so the corpus is identical on every run and in CI.
function* corpus() {
  let seed = 0x2f6e2b1;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const buf = new DataView(new ArrayBuffer(8));
  for (const n of [
    1, 2, 0.5, 0.25, 0.1, 1 / 3, 2 / 3, 0.1 + 0.2,
    Number.MIN_VALUE, Number.EPSILON, Number.MAX_VALUE,
    Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 2,
    1e-300, 1e300, 1.5e-10, 123456789.123456789, 1e21 - 1, 1e-6,
    2.2250738585072014e-308,
  ]) yield n;
  for (let i = 0; i < 60000; i++) {
    buf.setUint32(0, (rnd() * 4294967296) >>> 0);
    buf.setUint32(4, (rnd() * 4294967296) >>> 0);
    const n = Math.abs(buf.getFloat64(0));
    if (Number.isFinite(n) && n > 0) yield n;
  }
  for (let i = 0; i < 40000; i++) {
    const n = rnd() * Math.pow(10, Math.floor(rnd() * 30) - 9);
    if (Number.isFinite(n) && n > 0) yield n;
  }
}

describe('stake transport', () => {
  it('round-trips the seeded corpus with Object.is at the numeric leaf', () => {
    let checked = 0;
    let longest = 0;
    for (const n of corpus()) {
      const s = toStakeTransport(n);
      expect(Object.is(fromStakeTransport(s), n), `round-trip failed for ${s}`).toBe(true);
      if (s.length > longest) longest = s.length;
      checked++;
    }
    // Non-vacuous: the corpus is large and really exercises the bound.
    expect(checked).toBeGreaterThan(90000);
    // Measured maximum is 24; the 32-char bound must never actually bite.
    expect(longest).toBe(24);
    expect(longest).toBeLessThanOrEqual(STAKE_MAX_LENGTH);
  });

  it('accepts the exact value that justified the 32-character bound', () => {
    // A {1,20} fractional cap rejected this and 12,822 others; there are no
    // per-component caps for exactly that reason.
    const s = '0.0000057692833136856875';
    expect(s.length).toBe(24);
    expect(s.split('.')[1].length).toBe(22);
    expect(matchesStakeShape(s)).toBe(true);
    expect(isValidStakeTransport(s)).toBe(true);
    expect(Object.is(fromStakeTransport(s), Number(s))).toBe(true);
  });

  it('preserves MIN_VALUE and MAX_VALUE, which need exponent notation', () => {
    expect(toStakeTransport(Number.MIN_VALUE)).toBe('5e-324');
    expect(toStakeTransport(Number.MAX_VALUE)).toBe('1.7976931348623157e+308');
    expect(Object.is(fromStakeTransport('5e-324'), Number.MIN_VALUE)).toBe(true);
    expect(Object.is(fromStakeTransport('1.7976931348623157e+308'), Number.MAX_VALUE)).toBe(true);
  });

  it('rejects everything Stage 6 rejects, before any cast', () => {
    for (const bad of [-0, 0, -1, NaN, Infinity, -Infinity]) {
      expect(() => toStakeTransport(bad), String(bad)).toThrow(TypeError);
    }
    expect(() => toStakeTransport(-0)).toThrow(/negative zero/);
    for (const bad of ['x', -1, null, undefined, {}, [], true]) {
      expect(() => toStakeTransport(bad)).toThrow(TypeError);
    }
  });

  it('rejects malformed transport strings', () => {
    for (const s of ['-0', '-1', '-0.0', 'NaN', 'Infinity', '-Infinity', '',
                     '.5', '5.', '0x10', '1e', '+1', '01', '1,5', ' 1', '1 ']) {
      expect(matchesStakeShape(s), s).toBe(false);
      expect(isValidStakeTransport(s), s).toBe(false);
      expect(() => fromStakeTransport(s), s).toThrow(TypeError);
    }
  });

  it('the shape helper is NOT a validity check, and says so in its name', () => {
    // "0" matches the SQL regex and is still not a legal stake: SQL enforces
    // `> 0` separately. The old `isStakeTransport` returned true here while
    // reading as an assertion of validity, and the contract suite used it as
    // proof that every migrated stake was valid.
    expect(matchesStakeShape('0')).toBe(true);
    expect(isValidStakeTransport('0')).toBe(false);
    expect(() => fromStakeTransport('0')).toThrow(/positive/);
    // …and for '0.0', '0.00', which the regex also admits.
    for (const z of ['0', '0.0', '0.000', '0e0', '0.0e-5']) {
      expect(matchesStakeShape(z), z).toBe(true);
      expect(isValidStakeTransport(z), z).toBe(false);
    }
  });

  it('shape and validity agree on everything except the zeroes', () => {
    let disagreements = 0;
    for (const n of corpus()) {
      const s = toStakeTransport(n);
      expect(matchesStakeShape(s)).toBe(true);
      if (matchesStakeShape(s) !== isValidStakeTransport(s)) disagreements++;
    }
    expect(disagreements).toBe(0);
  });

  it('enforces the length bound against an abusive mantissa', () => {
    const abusive = `1.${'9'.repeat(40)}`;
    expect(abusive.length).toBeGreaterThan(STAKE_MAX_LENGTH);
    expect(matchesStakeShape(abusive)).toBe(false);
    expect(isValidStakeTransport(abusive)).toBe(false);
    expect(() => fromStakeTransport(abusive)).toThrow(/too long/);
  });
});

describe('revision transport', () => {
  it('is an opaque decimal string, never a JS number', () => {
    expect(isRevision('1')).toBe(true);
    expect(isRevision('9007199254740993')).toBe(true);
    expect(isRevision(1)).toBe(false);
    expect(isRevision('01')).toBe(false);
    expect(isRevision('-1')).toBe(false);
    expect(isRevision('')).toBe(false);
    expect(() => assertRevision(1)).toThrow(TypeError);
  });

  it('survives a value that JSON would silently corrupt as a number', () => {
    // The reason revisions are strings at all.
    expect(JSON.parse('{"r":9007199254740993}').r).toBe(9007199254740992);
    const asString = JSON.parse('{"r":"9007199254740993"}').r;
    expect(asString).toBe('9007199254740993');
    expect(isRevision(asString)).toBe(true);
  });

  it('enforces the signed bigint range Postgres will enforce on cast', () => {
    // A 19-digit regex alone is not the bigint range. These are all 19 digits.
    expect(PG_BIGINT_MAX).toBe(9223372036854775807n);
    expect(isRevision('9223372036854775807')).toBe(true);    // exactly max
    expect(isRevision('9223372036854775808')).toBe(false);   // max + 1
    expect(isRevision('9999999999999999999')).toBe(false);   // the old false accept
    expect(() => assertRevision('9223372036854775808')).toThrow(/bigint range/);
    expect(() => assertRevision('9223372036854775807')).not.toThrow();
    // A 20-digit value was already refused by the digit bound; it still is.
    expect(isRevision('10000000000000000000')).toBe(false);
  });

  it('the range guard is not vacuous — it is the numeric bound doing the work', () => {
    // Both of these satisfy /^(0|[1-9][0-9]{0,18})$/ exactly; only the BigInt
    // comparison separates them.
    const shape = /^(0|[1-9][0-9]{0,18})$/;
    for (const v of ['9223372036854775807', '9223372036854775808', '9999999999999999999']) {
      expect(shape.test(v), v).toBe(true);
    }
    expect(['9223372036854775807', '9223372036854775808', '9999999999999999999']
      .map(isRevision)).toEqual([true, false, false]);
  });
});

describe('result and error mapping', () => {
  it('covers every declared error kind', () => {
    const built = [offline(), unauthenticated(), forbidden(), conflict('7'),
                   { ok: false, error: { kind: 'validation', issues: [] } },
                   notFound(), { ok: false, error: { kind: 'server', code: 'x', message: '' } }];
    expect(built.map((r) => r.error.kind).sort()).toEqual([...ERROR_KINDS].sort());
  });

  it('maps SQLSTATEs to the contracted kinds', () => {
    expect(errorFromSqlState('42501').error.kind).toBe('forbidden');
    expect(errorFromSqlState('42704').error.kind).toBe('notFound');
    expect(errorFromSqlState('23505').error.kind).toBe('validation');
    expect(errorFromSqlState('23503').error.kind).toBe('validation');
    expect(errorFromSqlState('23514').error.kind).toBe('validation');
    expect(errorFromSqlState('XX000', 'boom').error.kind).toBe('server');
    const c = errorFromSqlState('P0001', 'stale_write revision=42');
    expect(c.error.kind).toBe('conflict');
    expect(c.error.serverRevision).toBe('42');
  });

  it('P0001 is a conflict ONLY with the stale_write marker AND a valid revision', () => {
    // P0001 is Postgres's generic RAISE EXCEPTION. Every one of these is a real
    // message the Stage 7 RPCs raise, and none of them is a stale write. The
    // old mapping turned all of them into conflicts carrying a FABRICATED
    // revision of "0" — a revision that had never existed, which told the UI to
    // re-apply against a value the server would reject again.
    for (const message of [
      'workspace already claimed',
      'bout is still pending',
      'cannot settle an open wager',
      'seed version mismatch',
      '',
    ]) {
      const r = errorFromSqlState('P0001', message);
      expect(r.error.kind, message).toBe('server');
      expect(r.error.code, message).toBe('P0001');
      expect('serverRevision' in r.error, message).toBe(false);
    }
    // Marker but no revision -> still not a conflict; a revision is never invented.
    expect(errorFromSqlState('P0001', 'stale_write').error.kind).toBe('server');
    expect(errorFromSqlState('P0001', 'stale_write on tracked_positions').error.kind).toBe('server');
    // Marker with an OUT-OF-RANGE revision -> not a conflict either.
    expect(errorFromSqlState('P0001', 'stale_write revision=9999999999999999999').error.kind)
      .toBe('server');
    // A revision without the marker -> not a conflict.
    expect(errorFromSqlState('P0001', 'row revision=42 was fine').error.kind).toBe('server');
  });

  it('the conflict path still works for genuine stale writes', () => {
    for (const [message, expected] of [
      ['stale_write revision=42', '42'],
      ['stale_write: revision: 7', '7'],
      ['fm: stale_write on wagers, revision=9007199254740993', '9007199254740993'],
      ['stale_write revision=9223372036854775807', '9223372036854775807'],
    ]) {
      const r = errorFromSqlState('P0001', message);
      expect(r.error.kind, message).toBe('conflict');
      expect(r.error.serverRevision, message).toBe(expected);
      expect(isRevision(r.error.serverRevision), message).toBe(true);
    }
  });

  it('conflict always carries a string revision', () => {
    expect(conflict(42).error.serverRevision).toBe('42');
    expect(typeof conflict('9007199254740993').error.serverRevision).toBe('string');
  });

  it('ok omits revision unless one is supplied', () => {
    expect('revision' in ok({ a: 1 })).toBe(false);
    expect(ok({ a: 1 }, '3').revision).toBe('3');
  });
});

describe('semanticEquals', () => {
  it('applies Object.is only at numeric leaves', () => {
    expect(semanticEquals({ a: 0 }, { a: -0 })).toBe(false);
    expect(semanticEquals({ a: NaN }, { a: NaN })).toBe(true);
    expect(semanticEquals({ a: 1 }, { a: 1 })).toBe(true);
    // Object.is on two distinct objects is false; the comparator must not be that.
    expect(Object.is({ a: 1 }, { a: 1 })).toBe(false);
    expect(semanticEquals({ a: 1 }, { a: 1 })).toBe(true);
  });

  it('compares structure, key sets and array order', () => {
    expect(semanticEquals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(semanticEquals({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(semanticEquals([1, 2], [2, 1])).toBe(false);
    expect(semanticEquals([1, [2, { c: 3 }]], [1, [2, { c: 3 }]])).toBe(true);
    expect(semanticEquals([1], { 0: 1 })).toBe(false);
    expect(semanticEquals(null, {})).toBe(false);
  });
});
