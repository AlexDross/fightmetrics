import { describe, it, expect } from 'vitest';
import {
  toStakeTransport, fromStakeTransport, isStakeTransport, STAKE_MAX_LENGTH,
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
    expect(isStakeTransport(s)).toBe(true);
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
      expect(isStakeTransport(s), s).toBe(false);
      expect(() => fromStakeTransport(s), s).toThrow(TypeError);
    }
    // Shape-valid but non-positive: caught by the value guard, like SQL's > 0.
    expect(isStakeTransport('0')).toBe(true);
    expect(() => fromStakeTransport('0')).toThrow(/positive/);
  });

  it('enforces the length bound against an abusive mantissa', () => {
    const abusive = `1.${'9'.repeat(40)}`;
    expect(abusive.length).toBeGreaterThan(STAKE_MAX_LENGTH);
    expect(isStakeTransport(abusive)).toBe(false);
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
