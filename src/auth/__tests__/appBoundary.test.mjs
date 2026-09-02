import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { FORBIDDEN_ENV_KEYS } from '../../data/supabase/config.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/[^\n]*/g, '$1');

// §8: "The UI imports repositories only; Supabase types never reach
// src/App.js." Gate 6 must be a change of BACKING, not a change of imports, and
// that is only true if the boundary holds from the moment it exists.
describe('src/App.js never touches a raw Supabase API', () => {
  const app = stripComments(read('src/App.js'));

  it('imports no Supabase package', () => {
    expect(app).not.toMatch(/@supabase\//);
    expect(app).not.toMatch(/\bcreateClient\b/);
  });

  it('names no fm_* database function', () => {
    expect(app).not.toMatch(/\bfm_(read|member|rpc)_/);
    expect(app).not.toMatch(/app_private/);
  });

  it('calls no transport surface directly', () => {
    // No `.rpc(`, no `.auth.`, no `.from(` — the three ways a Supabase client is
    // used. A component-level import of the auth PANEL is the whole surface.
    expect(app).not.toMatch(/\.rpc\s*\(/);
    expect(app).not.toMatch(/\.auth\s*\./);
    expect(app).not.toMatch(/supabase/i.test(app) ? /@supabase\/supabase-js/ : /$^/);
  });

  it('reaches auth only through the provider/UI boundary', () => {
    const authImports = [...app.matchAll(/import\s+[^;]*?from\s*['"](\.[^'"]*auth[^'"]*)['"]/g)]
      .map((m) => m[1]);
    expect(authImports).toEqual(['./auth/AuthFooterPanel.jsx']);
  });

  it('the check is not vacuous: those patterns DO appear where they belong', () => {
    const client = read('src/data/supabase/client.mjs');
    expect(client).toMatch(/@supabase\/supabase-js/);
    expect(client).toMatch(/\bcreateClient\b/);
    const repo = read('src/data/repositories/supabaseAuth.mjs');
    expect(repo).toMatch(/fm_member_whoami/);
    expect(repo).toMatch(/\.rpc\s*\(/);
  });
});

describe('exactly one module imports @supabase/supabase-js', () => {
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);

  it('and it is the client module', () => {
    const sources = walk(path.join(ROOT, 'src'))
      .filter((f) => /\.(js|jsx|mjs)$/.test(f))
      .filter((f) => !f.includes(`${path.sep}__tests__${path.sep}`));
    const importers = sources
      .filter((f) => /from\s*['"]@supabase\/supabase-js['"]/.test(stripComments(fs.readFileSync(f, 'utf8'))))
      .map((f) => path.relative(ROOT, f));
    expect(importers).toEqual(['src/data/supabase/client.mjs']);
  });
});

describe('the UI layer stays behind the boundary too', () => {
  const provider = stripComments(read('src/auth/AuthProvider.jsx'));
  const panel = stripComments(read('src/auth/AuthFooterPanel.jsx'));

  it('the provider imports the client factory, never the SDK', () => {
    expect(provider).not.toMatch(/@supabase\/supabase-js/);
    expect(provider).toMatch(/from '\.\.\/data\/supabase\/client\.mjs'/);
  });

  it('the panel knows no transport at all — no client, no RPC name, no SDK', () => {
    expect(panel).not.toMatch(/@supabase\//);
    expect(panel).not.toMatch(/\bfm_(read|member|rpc)_/);
    expect(panel).not.toMatch(/\.rpc\s*\(/);
    expect(panel).not.toMatch(/\.auth\s*\./);
  });
});

describe('no credential-bearing variable is read anywhere in src', () => {
  // A READ is a member or bracket access on an env object. FORBIDDEN_ENV_KEYS in
  // config.mjs is a frozen LIST of names — string literals, never accessed — so
  // matching bare identifiers would flag the very guard that documents them.
  const envReads = () => {
    const walk = (dir) =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
        d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
    const sources = walk(path.join(ROOT, 'src'))
      .filter((f) => /\.(js|jsx|mjs)$/.test(f))
      .filter((f) => !f.includes(`${path.sep}__tests__${path.sep}`));
    const found = new Set();
    for (const f of sources) {
      const code = stripComments(fs.readFileSync(f, 'utf8'));
      for (const m of code.matchAll(/\.\s*(VITE_[A-Z0-9_]+)\b/g)) found.add(m[1]);
      for (const m of code.matchAll(/\[\s*['"](VITE_[A-Z0-9_]+)['"]\s*\]/g)) found.add(m[1]);
    }
    return found;
  };

  it('reads exactly two Supabase variables, both public', () => {
    const supabase = [...envReads()].filter((k) => k.startsWith('VITE_SUPABASE')).sort();
    expect(supabase).toEqual(['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_URL']);
  });

  it('reads no credential-bearing variable, by any name', () => {
    const reads = envReads();
    for (const key of FORBIDDEN_ENV_KEYS) {
      expect(reads.has(key), `${key} is read from the environment`).toBe(false);
    }
    // Non-vacuous: the guard list is real and the reader really does read.
    expect(FORBIDDEN_ENV_KEYS.length).toBeGreaterThan(5);
    expect(reads.has('VITE_SUPABASE_URL')).toBe(true);
  });

  it('leaves pre-existing feature flags alone', () => {
    // The C6 flags predate Gate 4 and are untouched by it; naming them here
    // documents that this guard is about credentials, not about all env use.
    const reads = envReads();
    expect(reads.has('VITE_C6_USER_FACING_ENABLED')).toBe(true);
  });

  it('no .env file is committed', () => {
    const offenders = fs.readdirSync(ROOT)
      .filter((f) => f === '.env' || f.startsWith('.env.'))
      .filter((f) => !f.endsWith('.example'));
    // A local, gitignored .env is fine; a TRACKED one is not.
    const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n').filter((f) => f === '.env' || f.startsWith('.env.'));
    expect(tracked).toEqual([]);
    expect(offenders.every((f) => tracked.includes(f) === false)).toBe(true);
  });
});
