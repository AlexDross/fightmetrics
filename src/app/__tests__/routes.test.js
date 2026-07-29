import { describe, it, expect } from 'vitest';
import {
  ROUTES, VIEWS, PATHS, HOME_VIEW, HOME_PATH,
  canonicalPathname, pathForView, viewForPathname, isKnownPathname,
} from '../routes.jsx';

// The registry is plain data plus total functions, so this runs with no DOM,
// no router and no render. It pins the mapping itself; whether App wires it up
// correctly is covered by the manual browser verification in baseline/stage-5.md.

// Written out literally rather than derived from ROUTES. Deriving the
// expectation from the thing under test would make this pass for any seven
// routes, including wrong ones.
const EXPECTED = [
  ['home', '/'],
  ['simulator', '/simulator'],
  ['upcoming', '/upcoming'],
  ['roi', '/roi'],
  ['statistics', '/statistics'],
  ['explore', '/explore'],
  ['info', '/info'],
];

describe('route registry', () => {
  it('contains exactly the seven supported destinations', () => {
    expect(ROUTES.length).toBe(7);
    expect(ROUTES.map((r) => [r.view, r.path])).toEqual(EXPECTED);
  });

  it('exposes VIEWS and PATHS consistent with ROUTES', () => {
    expect(VIEWS).toEqual(EXPECTED.map(([v]) => v));
    expect(PATHS).toEqual(EXPECTED.map(([, p]) => p));
  });

  it('has unique view IDs and unique paths', () => {
    expect(new Set(VIEWS).size).toBe(VIEWS.length);
    expect(new Set(PATHS).size).toBe(PATHS.length);
  });

  it('is frozen, so a caller cannot mutate the registry at runtime', () => {
    expect(Object.isFrozen(ROUTES)).toBe(true);
    expect(() => { ROUTES.push({ view: 'x', path: '/x' }); }).toThrow();
  });

  it('does NOT define the destinations Stage 5 excluded', () => {
    // Guards the scope restriction: no fighter/event/matchup detail routes and
    // no /model-lab. If one is added deliberately, this line is the reminder to
    // update the plan too.
    for (const p of ['/model-lab', '/fighter', '/event', '/matchup']) {
      expect(PATHS).not.toContain(p);
    }
  });
});

describe('pathForView', () => {
  it('maps every view to its path', () => {
    for (const [view, path] of EXPECTED) expect(pathForView(view)).toBe(path);
  });

  it('falls back to home for unknown or malformed views', () => {
    for (const bad of ['nope', '', 'HOME', 'Home', null, undefined, 0, {}]) {
      expect(pathForView(bad)).toBe(HOME_PATH);
    }
  });

  it('does not resolve inherited Object properties as views', () => {
    // A Map lookup, not a plain object, so 'toString'/'constructor' are misses
    // rather than accidental hits.
    for (const key of ['toString', 'constructor', '__proto__', 'hasOwnProperty']) {
      expect(pathForView(key)).toBe(HOME_PATH);
    }
  });
});

describe('viewForPathname', () => {
  it('maps every path to its view', () => {
    for (const [view, path] of EXPECTED) expect(viewForPathname(path)).toBe(view);
  });

  it('resolves root to the home view', () => {
    expect(viewForPathname('/')).toBe(HOME_VIEW);
    expect(HOME_VIEW).toBe('home');
    expect(HOME_PATH).toBe('/');
  });

  it('returns null for unknown paths so App can redirect rather than guess', () => {
    for (const bad of [
      '/nope', '/model-lab', '/fighter/khabib', '/simulator/extra',
      '/roi/2026', '/home', '/index.html', '/api/thing',
    ]) {
      expect(viewForPathname(bad), bad).toBe(null);
      expect(isKnownPathname(bad), bad).toBe(false);
    }
  });

  it('is case-sensitive, matching URL semantics', () => {
    // Deliberate: accepting /ROI would give one screen several addresses.
    for (const bad of ['/ROI', '/Simulator', '/INFO']) {
      expect(viewForPathname(bad), bad).toBe(null);
    }
  });

  it('treats a missing leading slash as unknown', () => {
    expect(viewForPathname('simulator')).toBe(null);
  });
});

describe('trailing slashes', () => {
  // Chosen behaviour: strip them. A user who types /roi/ meant /roi, and
  // bouncing them to Home instead would discard where they were going.
  it('accepts a single trailing slash on every non-root path', () => {
    for (const [view, path] of EXPECTED) {
      if (path === HOME_PATH) continue;
      expect(viewForPathname(`${path}/`)).toBe(view);
    }
  });

  it('accepts repeated trailing slashes', () => {
    expect(viewForPathname('/roi//')).toBe('roi');
    expect(viewForPathname('/roi///')).toBe('roi');
  });

  it('collapses slash-only paths to root rather than producing an empty path', () => {
    for (const p of ['/', '//', '///']) expect(viewForPathname(p)).toBe(HOME_VIEW);
  });

  it('canonicalPathname is explicit about what it produces', () => {
    expect(canonicalPathname('/roi/')).toBe('/roi');
    expect(canonicalPathname('/roi')).toBe('/roi');
    expect(canonicalPathname('/')).toBe('/');
    expect(canonicalPathname('//')).toBe('/');
    expect(canonicalPathname('')).toBe('/');
    expect(canonicalPathname(undefined)).toBe('/');
    expect(canonicalPathname(null)).toBe('/');
    // Only TRAILING slashes are touched; interior structure is left alone so
    // '/a/b' stays a genuine miss instead of being flattened into a hit.
    expect(canonicalPathname('/simulator/extra')).toBe('/simulator/extra');
  });

  it('is idempotent', () => {
    for (const p of ['/roi/', '/roi', '/', '//', '/simulator/extra']) {
      expect(canonicalPathname(canonicalPathname(p))).toBe(canonicalPathname(p));
    }
  });
});

describe('round trips', () => {
  it('view -> path -> view returns the original view', () => {
    for (const view of VIEWS) expect(viewForPathname(pathForView(view))).toBe(view);
  });

  it('path -> view -> path returns the original path', () => {
    for (const path of PATHS) expect(pathForView(viewForPathname(path))).toBe(path);
  });

  it('survives the trailing-slash form too', () => {
    for (const path of PATHS) {
      expect(pathForView(viewForPathname(`${path}/`))).toBe(path);
    }
  });
});
