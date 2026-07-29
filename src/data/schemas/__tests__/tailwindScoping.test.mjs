import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TAILWIND_CANARY } from '../primitives.mjs';

// Tailwind v4 scans whatever the @source globs match, imported or not. If the
// schema files were ever renamed to .js/.jsx, their enum strings would become
// class-name candidates and could silently change the production CSS.
//
// This test is structural, so it runs in the normal (fast, node-environment)
// suite. The byte-for-byte CSS proof is a build-time check recorded in
// docs/DOMAIN_SCHEMA.md; this guards the precondition that makes it hold.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..', '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]
  );

describe('schema files stay outside Tailwind source scanning', () => {
  const files = walk(DATA_DIR);
  const stylesheet = fs.readFileSync(path.join(ROOT, 'src', 'style.css'), 'utf8');
  const sourceGlobs = [...stylesheet.matchAll(/@source\s+'([^']+)'/g)].map((m) => m[1]);

  it('the stylesheet scans only .js and .jsx under src', () => {
    // If this changes, the .mjs choice stops protecting anything and the
    // canary assertion below becomes the thing that catches it.
    expect(sourceGlobs).toContain('./**/*.js');
    expect(sourceGlobs).toContain('./**/*.jsx');
    expect(sourceGlobs.some((g) => g.includes('mjs'))).toBe(false);
  });

  it('every source file under src/data uses .mjs (tests excepted)', () => {
    const offenders = files
      .filter((f) => !f.includes(`${path.sep}__tests__${path.sep}`))
      .filter((f) => f.endsWith('.js') || f.endsWith('.jsx'));
    expect(
      offenders.map((f) => path.relative(ROOT, f)),
      'these would be scanned by Tailwind and could alter the production CSS'
    ).toEqual([]);
    // Non-vacuous: there really are schema/migration files to protect.
    const mjs = files.filter((f) => f.endsWith('.mjs'));
    expect(mjs.length).toBeGreaterThanOrEqual(6);
  });

  it('the canary is a real utility name that Tailwind does not currently emit', () => {
    // `static` is the point: .fixed, .block, .hidden, .flex and friends ARE
    // already in the bundle, but .static is not — so if these files were
    // scanned, the CSS would gain `.static{position:static}` and change.
    expect(TAILWIND_CANARY).toBe('static');
    const source = fs.readFileSync(path.join(HERE, '..', 'primitives.mjs'), 'utf8');
    expect(source).toContain("'static'");

    const buildDir = path.join(ROOT, 'build', 'assets');
    if (!fs.existsSync(buildDir)) return; // no build present; the structural checks above still hold
    const css = fs
      .readdirSync(buildDir)
      .filter((f) => f.endsWith('.css'))
      .map((f) => fs.readFileSync(path.join(buildDir, f), 'utf8'))
      .join('\n');
    expect(css.includes('.static{'), 'the canary leaked into the production CSS').toBe(false);
    // Prove the comparison is meaningful: sibling utilities ARE emitted.
    expect(css.includes('.fixed{')).toBe(true);
    expect(css.includes('.block{')).toBe(true);
  });
});
