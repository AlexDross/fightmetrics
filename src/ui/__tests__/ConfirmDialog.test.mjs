// @vitest-environment jsdom
//
// M1 PR 2: ConfirmDialog replaces window.confirm / prompt / alert.
//
// Per-file DOM opt-in; .mjs so Tailwind's @source globs cannot reach it.
//
// The first half drives the real provider and dialog through a small caller
// that awaits confirm() the way App's delete buttons do. isolation.test.js
// forbids importing App.js, so the second half pins App.js's call sites in
// source, the same pattern as simulatorBoutContextGuard.test.js.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ConfirmProvider, useConfirm } from '../ConfirmDialog.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const h = React.createElement;

let container;
let root;
let results;

// Calls confirm(options) from a real button click and records the outcome.
function Caller({ options, label = 'Delete row' }) {
  const confirm = useConfirm();
  return h('button', {
    type: 'button',
    onClick: async () => { results.push(await confirm(options)); },
  }, label);
}

async function render(children) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(h(ConfirmProvider, null, children)); });
}

const dialog = () => document.querySelector('[role="alertdialog"]');
const button = (text, scope = document) =>
  [...scope.querySelectorAll('button')].find((b) => b.textContent === text);

async function click(el) {
  await act(async () => {
    el.focus?.();
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  });
}

async function key(el, keyName, opts = {}) {
  await act(async () => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, ...opts }));
  });
}

async function type(input, value) {
  // React tracks the input's value; set it through the native setter so the
  // change event is seen as a real edit.
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

const DELETE_PICK = {
  title: 'Delete this pick?',
  details: ['Renato Moicano vs. Tom Nolan', 'UFC Fight Night · 2026-10-31'],
  warning: 'This cannot be undone.',
};

beforeEach(() => { results = []; });

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  document.body.innerHTML = '';
});

describe('ConfirmDialog', () => {
  it('opens a labelled, described alertdialog with the caller’s content', async () => {
    await render(h(Caller, { options: DELETE_PICK }));
    expect(dialog()).toBeNull();

    await click(button('Delete row'));

    const d = dialog();
    expect(d).not.toBeNull();
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(d.getAttribute('aria-labelledby')).textContent).toBe('Delete this pick?');
    const body = document.getElementById(d.getAttribute('aria-describedby')).textContent;
    expect(body).toContain('Renato Moicano vs. Tom Nolan');
    expect(body).toContain('UFC Fight Night · 2026-10-31');
    expect(body).toContain('This cannot be undone.');
    expect(button('Delete', d)).toBeTruthy();
    expect(button('Cancel', d)).toBeTruthy();
  });

  it('resolves true only on Confirm', async () => {
    await render(h(Caller, { options: DELETE_PICK }));
    await click(button('Delete row'));
    await click(button('Delete', dialog()));
    expect(results).toEqual([true]);
    expect(dialog()).toBeNull();
  });

  it('resolves false on Cancel, Escape and a backdrop click', async () => {
    await render(h(Caller, { options: DELETE_PICK }));

    await click(button('Delete row'));
    await click(button('Cancel', dialog()));

    await click(button('Delete row'));
    await key(dialog(), 'Escape');

    await click(button('Delete row'));
    const backdrop = dialog().parentElement;
    await act(async () => {
      backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
    });

    expect(results).toEqual([false, false, false]);
    expect(dialog()).toBeNull();
  });

  it('a mousedown inside the panel does not cancel', async () => {
    await render(h(Caller, { options: DELETE_PICK }));
    await click(button('Delete row'));
    await act(async () => {
      dialog().querySelector('h2').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }));
    });
    expect(dialog()).not.toBeNull();
    expect(results).toEqual([]);
  });

  it('focuses Cancel on open and returns focus to the trigger on close', async () => {
    await render(h(Caller, { options: DELETE_PICK }));
    const trigger = button('Delete row');

    await click(trigger);
    expect(document.activeElement).toBe(button('Cancel', dialog()));

    await key(dialog(), 'Escape');
    expect(document.activeElement).toBe(trigger);

    await click(trigger);
    await click(button('Delete', dialog()));
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps Tab and Shift+Tab inside the dialog', async () => {
    await render(h(Caller, { options: DELETE_PICK }));
    await click(button('Delete row'));
    const d = dialog();
    const cancel = button('Cancel', d);
    const confirm = button('Delete', d);

    confirm.focus();
    await key(confirm, 'Tab');
    expect(document.activeElement).toBe(cancel);

    await key(cancel, 'Tab', { shiftKey: true });
    expect(document.activeElement).toBe(confirm);
  });

  it('a newer request resolves an open one false', async () => {
    await render(h(React.Fragment, null,
      h(Caller, { options: DELETE_PICK, label: 'First' }),
      h(Caller, { options: { title: 'Delete this parlay?' }, label: 'Second' })));

    await click(button('First'));
    await click(button('Second'));
    expect(results).toEqual([false]);
    expect(document.getElementById(dialog().getAttribute('aria-labelledby')).textContent).toBe('Delete this parlay?');

    await click(button('Delete', dialog()));
    expect(results).toEqual([false, true]);
    expect(document.querySelectorAll('[role="alertdialog"]').length).toBe(0);
  });

  it('useConfirm outside the provider fails loudly', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    let thrown;
    class Catch extends React.Component {
      constructor(props) { super(props); this.state = { failed: false }; }
      render() { return this.state.failed ? null : this.props.children; }
      componentDidCatch(error) { thrown = error; }
    }
    Catch.getDerivedStateFromError = () => ({ failed: true });
    await act(async () => { root.render(h(Catch, null, h(Caller, { options: DELETE_PICK }))); });
    expect(thrown?.message).toMatch(/inside <ConfirmProvider>/);
    spy.mockRestore();
  });
});

describe('ConfirmDialog typed confirmation (Clear All step 2)', () => {
  const FINAL = {
    title: 'Final confirmation',
    details: ['Permanently delete all 196 entries.'],
    warning: 'This is NOT recoverable.',
    requireText: '196',
    requireTextLabel: 'Type 196 to permanently delete all 196 entries',
    confirmLabel: 'Delete everything',
  };

  it('focuses a labelled field and keeps Confirm disabled until the text matches', async () => {
    await render(h(Caller, { options: FINAL }));
    await click(button('Delete row'));
    const d = dialog();
    const input = d.querySelector('input');
    const go = button('Delete everything', d);

    expect(document.activeElement).toBe(input);
    expect(d.querySelector(`label[for="${input.id}"]`).textContent).toBe('Type 196 to permanently delete all 196 entries');
    expect(go.disabled).toBe(true);

    await type(input, '19');
    expect(go.disabled).toBe(true);
    await type(input, '197');
    expect(go.disabled).toBe(true);
    await type(input, ' 196 ');
    expect(go.disabled).toBe(false);

    await click(go);
    expect(results).toEqual([true]);
  });

  it('Enter submits only when the text matches', async () => {
    await render(h(Caller, { options: FINAL }));
    await click(button('Delete row'));
    const input = dialog().querySelector('input');

    await type(input, '19');
    await key(input, 'Enter');
    expect(results).toEqual([]);
    expect(dialog()).not.toBeNull();

    await type(input, '196');
    await key(input, 'Enter');
    expect(results).toEqual([true]);
    expect(dialog()).toBeNull();
  });

  it('a disabled Confirm cannot be clicked through', async () => {
    await render(h(Caller, { options: FINAL }));
    await click(button('Delete row'));
    await click(button('Delete everything', dialog()));
    expect(results).toEqual([]);
    expect(dialog()).not.toBeNull();
  });

  it('each dialog starts with an empty field', async () => {
    await render(h(Caller, { options: FINAL }));
    await click(button('Delete row'));
    await type(dialog().querySelector('input'), '196');
    await key(dialog(), 'Escape');

    await click(button('Delete row'));
    expect(dialog().querySelector('input').value).toBe('');
    expect(button('Delete everything', dialog()).disabled).toBe(true);
  });
});

describe('App wiring (source)', () => {
  const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const app = readFileSync(path.join(SRC, 'App.js'), 'utf8');
  const index = readFileSync(path.join(SRC, 'index.js'), 'utf8');

  const componentBody = (name) => {
    const start = app.search(new RegExp(`^function ${name}\\(`, 'm'));
    expect(start, name).toBeGreaterThan(-1);
    const next = app.slice(start + 1).search(/^(function |const [A-Z]\w* = )/m);
    return app.slice(start, next === -1 ? undefined : start + 1 + next);
  };

  it('no native dialogs remain in App.js', () => {
    expect(app).not.toMatch(/window\.(confirm|prompt|alert)\b/);
    expect(app).not.toMatch(/(^|[^.\w])(confirm|prompt|alert)\(\s*`/m);
  });

  it('mounts ConfirmProvider around App in index.js', () => {
    expect(index).toMatch(/<ConfirmProvider>\s*<App \/>\s*<\/ConfirmProvider>/);
  });

  it('every destructive site awaits the in-app confirm in a component that has it', () => {
    const sites = {
      PendingPropsSection: ['Delete this prop pick?'],
      PropBetsPanel: ['Delete this graded prop?'],
      ParlaysPanel: ['Delete this parlay?'],
      FightDayCheck: ['Clear the fight-day record for this fight?'],
      UpcomingEventTab: ['Delete this pick?'],
      ROITab: ['Delete this graded pick?', 'Clear ALL'],
    };
    let awaited = 0;
    for (const [name, titles] of Object.entries(sites)) {
      const body = componentBody(name);
      expect(body, `${name} reads the hook`).toContain('const confirm = useConfirm();');
      for (const title of titles) expect(body, `${name}: ${title}`).toContain(title);
      awaited += (body.match(/await confirm\(/g) ?? []).length;
    }
    // 7 former window.confirm sites; Clear All has two steps.
    expect(awaited).toBe(8);
    expect((app.match(/await confirm\(/g) ?? []).length).toBe(8);
  });

  it('Clear All keeps two steps and only clears after a matching typed count', () => {
    const roi = componentBody('ROITab');
    const start = roi.indexOf('Clear ALL');
    const block = roi.slice(roi.lastIndexOf('onClick={async () => {', start), roi.indexOf('onClearEntries();', start) + 20);
    const step1 = block.indexOf('const step1 = await confirm(');
    const step2 = block.indexOf('const step2 = await confirm(');
    expect(step1).toBeGreaterThan(-1);
    expect(step2).toBeGreaterThan(step1);
    expect(block.indexOf('if (!step1) return;')).toBeGreaterThan(step1);
    expect(block.indexOf('if (!step1) return;')).toBeLessThan(step2);
    expect(block).toContain('requireText: String(count)');
    expect(block.indexOf('if (!step2) return;')).toBeLessThan(block.indexOf('onClearEntries();'));
    expect(block).toContain('This is NOT recoverable.');
  });
});

describe('text-size floor', () => {
  it('no 9px or 10px text classes remain in src', () => {
    const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    const offenders = [];
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!['__tests__', 'node_modules'].includes(e.name)) walk(p); }
        else if (/\.(js|jsx)$/.test(e.name)) {
          const src = readFileSync(p, 'utf8');
          if (/text-\[(?:[0-9]|10)(?:\.\d+)?px\]/.test(src)) offenders.push(path.relative(SRC, p));
        }
      }
    };
    walk(SRC);
    expect(offenders).toEqual([]);
  });
});
