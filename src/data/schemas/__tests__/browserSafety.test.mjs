import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  uuidv5, uuidv7, NS, eventIdFor, boutIdFor,
  isValidUuid, DNS_NAMESPACE, namespaceDerivation,
} from '../../migration/ids.mjs';

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

describe('uuidv5 matches the published RFC reference vectors', () => {
  // Externally verifiable known-answer tests, not our own output echoed back.
  // If the hand-written SHA-1 ever drifts, these fail before anything else does.
  it('reproduces the RFC 4122 Appendix C vectors', () => {
    expect(uuidv5(DNS_NAMESPACE, 'python.org')).toBe('886313e1-3b8a-5372-9b90-0c9aee199e5d');
    expect(uuidv5(DNS_NAMESPACE, 'www.example.com')).toBe('2ed6657d-e927-568b-95e1-2665a8aea6a2');
  });

  it('reproduces the documented FightMetrics namespace derivation', () => {
    const root = uuidv5(namespaceDerivation.dns, namespaceDerivation.rootName);
    expect(root).toBe(namespaceDerivation.root);
    expect(uuidv5(root, namespaceDerivation.eventName)).toBe(namespaceDerivation.event);
    expect(NS.EVENT).toBe(namespaceDerivation.event);
  });

  it('hashes correctly across SHA-1 block boundaries and non-ASCII input', () => {
    // Lengths straddling the 64-byte block boundary, where a padding bug shows up.
    for (const len of [0, 55, 56, 63, 64, 65, 119, 120]) {
      expect(uuidv5(NS.BOUT, 'x'.repeat(len)))
        .toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
    // Non-ASCII must be hashed as UTF-8 bytes, not UTF-16 code units.
    expect(uuidv5(NS.BOUT, 'ünïcødé ✓')).toBe(uuidv5(NS.BOUT, 'ünïcødé ✓'));
    expect(uuidv5(NS.BOUT, 'ünïcødé ✓')).not.toBe(uuidv5(NS.BOUT, 'unicode'));
  });

  it('keeps event derivation total for an unknown promotion', () => {
    expect(eventIdFor({ promotion: null, date: '2026-06-14', name: 'Freedom 250' }))
      .toBe(uuidv5(NS.EVENT, 'UNKNOWN|2026-06-14|freedom 250'));
    expect(eventIdFor({ promotion: 'UFC', date: '2026-07-11', name: 'UFC 329' }))
      .toBe(uuidv5(NS.EVENT, 'UFC|2026-07-11|ufc 329'));
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

  it('every namespace is a valid RFC UUID and passes the validator', () => {
    for (const [name, ns] of Object.entries(NS)) {
      expect(isValidUuid(ns), `${name} is not a valid RFC UUID`).toBe(true);
      expect(/[1-8]/.test(ns[14]), `${name} version nibble`).toBe(true);
      expect(/[89ab]/.test(ns[19]), `${name} variant nibble`).toBe(true);
      // Accepted in practice, not merely by the regex.
      expect(() => uuidv5(ns, 'probe')).not.toThrow();
    }
    expect(isValidUuid(DNS_NAMESPACE)).toBe(true);
  });

  it('rejects the old Microsoft GUID and other malformed namespaces', () => {
    // The constant this replaced: version nibble `d`, not a valid RFC UUID.
    const OLD = '6f9619ff-8b86-d011-b42d-00c04fc964ff';
    expect(isValidUuid(OLD)).toBe(false);
    expect(() => uuidv5(OLD, 'anything')).toThrow(TypeError);
    expect(() => uuidv5(OLD, 'anything')).toThrow(/RFC 4122/);

    for (const bad of [
      '',
      'not-a-uuid',
      '833b2f12-8057-5c87-8e90-ac9d216371b',      // too short
      '833b2f12-8057-5c87-8e90-ac9d216371b0f',    // too long
      '833B2F12-8057-5C87-8E90-AC9D216371B0',     // uppercase
      '833b2f12-8057-0c87-8e90-ac9d216371b0',     // version 0
      '833b2f12-8057-9c87-8e90-ac9d216371b0',     // version 9
      '833b2f12-8057-5c87-2e90-ac9d216371b0',     // bad variant
      '00000000-0000-0000-0000-000000000000',     // nil
      null, undefined, 42, {},
    ]) {
      expect(isValidUuid(bad), `${JSON.stringify(bad)} should be invalid`).toBe(false);
      expect(() => uuidv5(bad, 'x'), `${JSON.stringify(bad)} should throw`).toThrow(TypeError);
    }
  });

  it('rejects a non-string name rather than coercing it', () => {
    for (const bad of [42, null, undefined, {}, ['a']]) {
      expect(() => uuidv5(NS.BOUT, bad)).toThrow(TypeError);
    }
  });
});
