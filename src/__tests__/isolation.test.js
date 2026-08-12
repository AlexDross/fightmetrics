import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFixture, decodeSpecials, firstDifference, ulpDistance, withinUlps } from './goldenSupport.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..');

function testFiles(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'fixtures') testFiles(p, acc); }
    else if (e.name.endsWith('.test.js')) acc.push(p);
  }
  return acc;
}

// WHAT THIS GUARANTEES, PRECISELY.
//
// FIGHTERS is assembled at module scope from Date.now() (DAYS_SINCE_LAST), so a
// test reaching the live collection would pass today and fail after the next
// 12:00 UTC rollover -- the Stage 2 failure. These checks prevent that.
//
// What is actually true:
//   - fighter MATCHUP INPUTS are frozen: every model, finish and betting test
//     feeds objects from fighters.golden.json, never live fighter data;
//   - no test imports the assembled FIGHTERS collection, App.js, or a live
//     data module.
//
// What is NOT claimed. The production model module itself imports _D2 (for
// DIVISION_UFC_AVERAGES) and getHistoricalTier (for getOpponentTier), so those
// remain real production dependencies reached THROUGH the real module. The
// suite is therefore not hermetic with respect to committed data files; it is
// isolated from the date-derived assembled collection, which is the property
// that actually matters here. Changing those dependencies is not a Stage 4 job.
//
// Scope of the scanner: it inspects DIRECT imports in test files. It does not
// walk transitive dependencies -- a direct-import guard, not a sandbox.
describe('test isolation (direct-import guard)', () => {
  const files = testFiles(SRC);

  it('finds the test files it is guarding', () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
  });

  it('no test imports the assembled FIGHTERS collection or App.js', () => {
    const offenders = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      const imports = [...src.matchAll(/^import[\s\S]*?from\s*'([^']+)';/gm)];
      for (const [stmt, spec] of imports) {
        if (/domain\/fighters/.test(spec)) offenders.push(`${path.relative(SRC, f)} imports ${spec}`);
        if (/\bApp(\.js)?$/.test(spec)) offenders.push(`${path.relative(SRC, f)} imports ${spec}`);
        if (/\bFIGHTERS\b/.test(stmt) && !/fighterFixtures/.test(stmt)) {
          offenders.push(`${path.relative(SRC, f)} imports a FIGHTERS binding`);
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('no test reads live ROI_ENTRIES or other live data modules', () => {
    const live = ['roiData', 'upcomingData', 'propPicksData', 'parlayData', 'fightersData', 'fightHistory', 'eloModule', 'cardioModule', 'prospectsData', 'rankHistory', 'rankingsData', 'rankingsHistoryData'];
    const offenders = [];
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const [, spec] of src.matchAll(/^import[\s\S]*?from\s*'([^']+)';/gm)) {
        if (live.some((m) => spec.endsWith(`/${m}`) || spec.endsWith(`/${m}.js`))) {
          offenders.push(`${path.relative(SRC, f)} imports ${spec}`);
        }
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});

describe('goldenSupport — the decoder itself', () => {
  it('restores every special value exactly', () => {
    const decoded = decodeSpecials({
      negZero: '@-0', nan: '@NaN', inf: '@Inf', negInf: '@-Inf', undef: '@undefined',
      nested: [{ z: '@-0' }], plain: 0, str: 'hello',
    });
    expect(Object.is(decoded.negZero, -0)).toBe(true);
    expect(Object.is(decoded.negZero, 0)).toBe(false);   // the trap
    expect(Number.isNaN(decoded.nan)).toBe(true);
    expect(decoded.inf).toBe(Infinity);
    expect(decoded.negInf).toBe(-Infinity);
    expect(decoded.undef).toBeUndefined();
    expect('undef' in decoded).toBe(true);               // present, not absent
    expect(Object.is(decoded.nested[0].z, -0)).toBe(true);
    expect(Object.is(decoded.plain, 0)).toBe(true);
    expect(decoded.str).toBe('hello');
  });

  it('firstDifference distinguishes -0 from 0 and NaN from NaN', () => {
    expect(firstDifference({ a: -0 }, { a: 0 })).toMatchObject({ path: 'a' });
    expect(firstDifference({ a: NaN }, { a: NaN })).toBeNull();
    expect(firstDifference({ a: 1 }, { a: 1 })).toBeNull();
  });

  it('firstDifference distinguishes a present undefined from an absent property', () => {
    // An earlier version read both sides through `?.[k]`, saw undefined on each
    // and called them equal. Ownership is now compared before value.
    expect(firstDifference({ a: undefined }, {})).toMatchObject({ path: 'a', reason: 'ownership' });
    expect(firstDifference({}, { a: undefined })).toMatchObject({ path: 'a', reason: 'ownership' });
    expect(firstDifference({ a: undefined }, { a: undefined })).toBeNull();
  });

  it('firstDifference compares array length and sparse slots', () => {
    expect(firstDifference([1, 2], [1, 2])).toBeNull();
    expect(firstDifference([1, 2], [1])).toMatchObject({ reason: 'length' });
    // a hole is not the same as an index explicitly holding undefined
    const sparse = [1, , 3];            // eslint-disable-line no-sparse-arrays
    const dense = [1, undefined, 3];
    expect(firstDifference(sparse, dense)).toMatchObject({ path: '[1]', reason: 'sparse-slot' });
    expect(firstDifference(sparse, sparse)).toBeNull();
    expect(firstDifference([1], { 0: 1 })).toMatchObject({ reason: 'array-vs-object' });
  });

  it('ULP helper measures adjacency, not decimals', () => {
    // Build a genuinely adjacent double from the bit pattern. Adding a small
    // decimal is NOT the same thing -- Number.EPSILON near 0.1 spans ~2 ULP,
    // which is exactly the sort of imprecision this helper exists to avoid.
    const buf = new ArrayBuffer(8);
    const f = new Float64Array(buf);
    const i = new BigInt64Array(buf);
    const nextUp = (x) => { f[0] = x; i[0] += 1n; return f[0]; };

    const x = 0.1;
    expect(ulpDistance(x, x)).toBe(0n);
    expect(ulpDistance(x, nextUp(x))).toBe(1n);
    expect(withinUlps(x, nextUp(x), 1)).toBe(true);
    expect(withinUlps(x, nextUp(nextUp(x)), 1)).toBe(false);
    expect(withinUlps(x, nextUp(nextUp(x)), 2)).toBe(true);

    // decimals apart are nowhere near adjacent
    expect(withinUlps(0.1, 0.2, 1)).toBe(false);

    // Non-finites: IDENTICAL ones compare equal, because Object.is(NaN, NaN)
    // is true and that is the semantics golden replay needs -- a produced NaN
    // must match a captured NaN. DIFFERENT non-finites are never within any
    // bound, since ULP distance is undefined across them.
    expect(withinUlps(NaN, NaN, 1)).toBe(true);
    expect(withinUlps(Infinity, Infinity, 1)).toBe(true);
    expect(withinUlps(NaN, 1, 1)).toBe(false);
    expect(withinUlps(Infinity, -Infinity, 1)).toBe(false);
    expect(withinUlps(Infinity, Number.MAX_VALUE, 1)).toBe(false);

    // -0 and 0 sit at the same ordinal, so ULP distance is 0 -- but they are
    // NOT Object.is-equal, which is why exact comparison uses firstDifference
    // and not this helper.
    expect(ulpDistance(-0, 0)).toBe(0n);
    expect(firstDifference(-0, 0)).not.toBeNull();
  });
});

describe('approved fixtures are present and intact', () => {
  it('all seven fixture files load', () => {
    for (const f of [
      'characterisation.json', 'entries.golden.json', 'fightHistory.hashes.json',
      'fighters.golden.json', 'model.golden.json', 'roster.manifest.json',
      'statistics.golden.json',
    ]) expect(loadFixture(f), f).toBeTruthy();
  });

  it('all share the single Stage 0 capture instant', () => {
    const iso = '2026-07-28T03:28:01.945Z';
    for (const f of ['characterisation.json', 'entries.golden.json', 'fighters.golden.json',
      'model.golden.json', 'roster.manifest.json', 'statistics.golden.json']) {
      expect(loadFixture(f).captureIso, f).toBe(iso);
    }
  });

  it('the roster manifest still reports the approved hashes', () => {
    const r = loadFixture('roster.manifest.json');
    expect(r.length).toBe(2273);
    expect(r.rosterStableHash).toBe('0f2c80cd');
    expect(r.duplicateNameCount).toBe(0);
  });
});
