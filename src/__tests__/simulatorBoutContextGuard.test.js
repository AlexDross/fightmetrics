import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// STRUCTURAL guard, and deliberately so.
//
// isolation.test.js forbids any test from importing App.js, so the Simulator's
// save paths cannot be exercised through a component render here. This suite
// therefore asserts the guard exists IN THE SOURCE, using the same read-the-file
// technique isolation.test.js uses on itself.
//
// It is a backstop, not the enforcement point. The real enforcement is
// buildRoiEntry, which throws on invalid context regardless of caller and is
// covered behaviourally in domain/model/__tests__/bout-context.test.js. What
// this file protects is the second half of the fail-closed rule: that the UI
// never invokes buildRoiEntry while the context is invalid, so a user never
// meets a raw exception.
const APP = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'App.js'),
  'utf8'
);

// The two Simulator save handlers, identified by the callback each one fires.
const SAVE_HANDLERS = ['onSaveToUpcoming?.(entry)', 'onSaveToUpcomingAndOpen?.(entry)'];

/** Source of the <button> element containing a given callback invocation. */
function buttonSourceContaining(needle) {
  const at = APP.indexOf(needle);
  expect(at, `save handler not found: ${needle}`).toBeGreaterThan(-1);
  const start = APP.lastIndexOf('<button', at);
  const end = APP.indexOf('</button>', at);
  expect(start, `no opening <button> before ${needle}`).toBeGreaterThan(-1);
  expect(end, `no closing </button> after ${needle}`).toBeGreaterThan(at);
  return APP.slice(start, end);
}

describe('Simulator save paths fail closed on invalid bout context', () => {
  it('finds both save handlers', () => {
    SAVE_HANDLERS.forEach((h) => expect(APP).toContain(h));
  });

  it('disables both save buttons when the bout context is invalid', () => {
    SAVE_HANDLERS.forEach((h) => {
      expect(
        buttonSourceContaining(h),
        `${h} button is missing its disabled binding`
      ).toContain('disabled={!boutContextIssues.valid}');
    });
  });

  // A disabled attribute is a UI affordance, not an enforcement point: it can be
  // bypassed by a programmatic click or a devtools edit. Each handler re-checks.
  it('re-checks validity inside both click handlers', () => {
    SAVE_HANDLERS.forEach((h) => {
      expect(
        buttonSourceContaining(h),
        `${h} handler is missing its explicit guard`
      ).toContain('if (!boutContextIssues.valid) return;');
    });
  });

  it('guards before calling buildRoiEntry, not after', () => {
    SAVE_HANDLERS.forEach((h) => {
      const src = buttonSourceContaining(h);
      const guardAt = src.indexOf('if (!boutContextIssues.valid) return;');
      const buildAt = src.indexOf('buildRoiEntry(');
      expect(guardAt, `${h}: guard missing`).toBeGreaterThan(-1);
      expect(buildAt, `${h}: buildRoiEntry call missing`).toBeGreaterThan(-1);
      expect(guardAt, `${h}: guard must precede buildRoiEntry`).toBeLessThan(buildAt);
    });
  });

  it('derives validity from validateBoutContext rather than an ad-hoc check', () => {
    expect(APP).toMatch(/boutContextIssues\s*=\s*useMemo\(\s*\(\)\s*=>\s*validateBoutContext\(boutContext\)/);
  });

  it('passes the same boutContext to the live preview and to both save paths', () => {
    // One object, used by the model call and by both buildRoiEntry calls, so a
    // saved prediction cannot have been computed under different context than
    // the one previewed.
    expect(APP).toContain('computeMatchupEdges(fA, fB, { eventDate, boutContext })');
    SAVE_HANDLERS.forEach((h) => {
      expect(buttonSourceContaining(h)).toMatch(/boutContext,/);
    });
  });
});

describe('Simulator and entry display use the shared three-state helpers', () => {
  it('renders the entry suffix through the domain helper, not inline logic', () => {
    const suffix = APP.slice(
      APP.indexOf('const entryContextSuffix'),
      APP.indexOf('const DIV_SHORT')
    );
    expect(suffix).toContain('describeBoutContextSuffix(');
    // The old two-state logic must be gone: emitting a label only when
    // isTitleBout is true hides a verified non-title bout.
    expect(suffix).not.toContain('ctx.isTitleBout === true');
    expect(suffix).not.toContain('ctx.scheduledRounds != null');
  });

  it('distinguishes fully-unknown from partially-known context', () => {
    expect(APP).toContain('missingBoutContextFields(boutContext)');
    expect(APP).toContain("label: 'Unknown bout context'");
    expect(APP).toMatch(/Incomplete bout context: \$\{missingContext\.join\(', '\)\} unknown/);
  });
});
