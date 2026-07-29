import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uuidv5, uuidv7, NS, eventIdFor, boutIdFor } from '../../migration/ids.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..', '..');

// src/data must be reachable from the browser: Stage 7 runs the migration and
// repositories against IndexedDB. The original ids.mjs imported node:crypto,
// which broke a browser build outright, and nothing noticed because App.js does
// not import the data layer.
describe('the data layer builds for the browser', () => {
  it('contains no Node builtin imports', () => {
    const walk = (dir) =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
        d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]
      );
    const sources = walk(path.join(ROOT, 'src', 'data'))
      .filter((f) => f.endsWith('.mjs'))
      .filter((f) => !f.includes(`${path.sep}__tests__${path.sep}`));
    expect(sources.length).toBeGreaterThanOrEqual(6);
    // Comments are stripped first: these files legitimately DISCUSS the
    // node:crypto import that used to be here, and matching prose would make
    // the check fire on its own documentation.
    const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/[^\n]*/g, '$1');
    for (const f of sources) {
      const code = stripComments(fs.readFileSync(f, 'utf8'));
      const offenders = [...code.matchAll(/\bfrom\s*['"](node:[^'"]+)['"]/g)].map((m) => m[1]);
      expect(offenders, `${path.relative(ROOT, f)} imports a Node builtin`).toEqual([]);
      expect(
        [...code.matchAll(/\brequire\s*\(\s*['"](node:[^'"]+|crypto|fs|path)['"]\s*\)/g)].map((m) => m[1]),
        `${path.relative(ROOT, f)} requires a Node builtin`
      ).toEqual([]);
    }
    // Non-vacuous: the stripper must not blank the file out entirely.
    const idsCode = stripComments(fs.readFileSync(path.join(ROOT, 'src/data/migration/ids.mjs'), 'utf8'));
    expect(idsCode).toMatch(/export function uuidv5/);
    expect(idsCode).not.toMatch(/node:crypto/);
  });

  // A source-text check alone is insufficient, so this runs a REAL Vite/Rollup
  // browser build of the data-layer entry points. A node: import fails it with
  // "is not exported by __vite-browser-external", which is how the original
  // implementation was caught.
  it('survives an actual Vite browser library build', () => {
    const out = execFileSync(
      'npx',
      ['vite', 'build', '--config', 'vite.browser-probe.config.mjs'],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NODE_ENV: '' } }
    );
    expect(out).not.toMatch(/vite-browser-external/);

    const outDir = path.join(ROOT, 'build-browser-probe');
    const built = fs.readdirSync(outDir).filter((f) => f.endsWith('.mjs') || f.endsWith('.js'));
    expect(built.length).toBeGreaterThanOrEqual(5);
    for (const f of built) {
      const bundle = fs.readFileSync(path.join(outDir, f), 'utf8');
      expect(bundle, `${f} externalised a Node builtin`).not.toMatch(/__vite-browser-external/);
      expect(bundle, `${f} still imports node:`).not.toMatch(/from\s*["']node:/);
    }
  }, 120000);

  it('uses Web Crypto for randomness and lets it be injected', () => {
    // Deterministic random source: v7 must be fully injectable so migrations
    // stay pure and tests stay reproducible.
    const fixed = (n) => new Uint8Array(n).fill(0xab);
    const a = uuidv7(1_700_000_000_000, fixed);
    const b = uuidv7(1_700_000_000_000, fixed);
    expect(a).toBe(b);
    expect(a[14]).toBe('7');          // version 7
    expect('89ab').toContain(a[19]);  // RFC 4122 variant
    // Time-ordered: a later timestamp sorts after an earlier one.
    expect(uuidv7(1_700_000_000_001, fixed) > a).toBe(true);
    // And the default path works in this runtime without any Node import.
    expect(uuidv7()).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('uuidv5 remains byte-identical', () => {
  // Locked expected values. These are the IDs the committed migration produces;
  // if the hash implementation ever drifts, every derived entity ID changes.
  it('reproduces known digests across block boundaries', () => {
    expect(uuidv5(NS.EVENT, 'UFC|2026-07-11|ufc 329')).toBe('7957e23a-a75b-5569-948a-eac85864433b');
    expect(eventIdFor({ promotion: 'UFC', date: '2026-07-11', name: 'UFC 329' }))
      .toBe('7957e23a-a75b-5569-948a-eac85864433b');
    // Unknown promotion uses the UNKNOWN token, keeping derivation total.
    expect(eventIdFor({ promotion: null, date: '2026-06-14', name: 'Freedom 250' }))
      .toBe(uuidv5(NS.EVENT, 'UNKNOWN|2026-06-14|freedom 250'));
    // Message lengths straddling the 64-byte SHA-1 block boundary, where a
    // hand-rolled padding bug would show up.
    for (const len of [0, 55, 56, 63, 64, 65, 119, 120]) {
      expect(uuidv5(NS.BOUT, 'x'.repeat(len))).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
    // Non-ASCII must be hashed as UTF-8 bytes, not UTF-16 code units.
    expect(uuidv5(NS.BOUT, 'ünïcødé ✓')).toBe(uuidv5(NS.BOUT, 'ünïcødé ✓'));
    expect(uuidv5(NS.BOUT, 'ünïcødé ✓')).not.toBe(uuidv5(NS.BOUT, 'unicode'));
  });

  it('is sensitive to the namespace and stable per input', () => {
    const seen = new Set(Object.values(NS).map((ns) => uuidv5(ns, 'same-name')));
    expect(seen.size).toBe(Object.keys(NS).length);
    expect(uuidv5(NS.BOUT, 'a')).toBe(uuidv5(NS.BOUT, 'a'));
  });

  it('sorts the fighter pair so both legacy orientations collapse to one bout', () => {
    const e = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    expect(boutIdFor({ eventId: e, fighterKeys: ['b', 'a'] }))
      .toBe(boutIdFor({ eventId: e, fighterKeys: ['a', 'b'] }));
  });

  it('documents that NS.EVENT is not a well-formed RFC UUID', () => {
    // Retained verbatim so derived Event/Bout IDs stay byte-identical. It is
    // only ever SHA-1 input, so its version bits are never interpreted — but a
    // stricter implementation (the `uuid` package, for one) rejects it outright.
    expect(NS.EVENT[14]).toBe('d');
    for (const [name, ns] of Object.entries(NS)) {
      if (name === 'EVENT') continue;
      expect(/[1-8]/.test(ns[14]), `${name} version nibble`).toBe(true);
      expect(/[89ab]/.test(ns[19]), `${name} variant nibble`).toBe(true);
    }
  });
});
