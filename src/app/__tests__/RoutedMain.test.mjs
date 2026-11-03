// @vitest-environment jsdom
//
// M1 PR 1: the per-view error boundary.
//
// Per-file DOM opt-in; .mjs so Tailwind's @source globs cannot reach it.
//
// isolation.test.js forbids tests from importing App.js, so the integration
// half renders RoutedMain inside a real MemoryRouter with a harness shaped like
// App's render: the view is derived from the URL through the real route
// registry, the nav is a sibling of <main> built from the real ROUTES, and the
// screens are chosen by view exactly as App chooses them. The source-level
// half then pins App.js to that same shape (nav outside, every screen inside).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryRouter, NavLink, useLocation } from 'react-router-dom';

import RoutedMain from '../RoutedMain.jsx';
import { ROUTES, pathForView, viewForPathname } from '../routes.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const h = React.createElement;

function Broken() {
  throw new Error('malformed fighter row');
}

function Screen({ view }) {
  return h('h1', null, `${view} screen`);
}

// Mirrors App: nav outside <main>, view from the URL, one screen per view.
function Harness({ failing, onReload }) {
  const { pathname } = useLocation();
  const view = viewForPathname(pathname);
  return h(React.Fragment, null,
    h('nav', { 'aria-label': 'Primary' },
      ROUTES.map((r) => h(NavLink, { key: r.view, to: r.path, end: true }, r.view))),
    h(RoutedMain, { view, onReload },
      failing.has(view) ? h(Broken) : h(Screen, { view })));
}

let container;
let root;
let consoleError;

async function render(path, { failing = new Set(['statistics']), onReload = vi.fn() } = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(h(MemoryRouter, { initialEntries: [path] }, h(Harness, { failing, onReload })));
  });
  return { onReload };
}

async function clickNav(view) {
  const link = [...container.querySelectorAll('nav a')].find((a) => a.textContent === view);
  await act(async () => {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  });
}

const alert = () => container.querySelector('[role="alert"]');
const mainText = () => container.querySelector('main').textContent;

beforeEach(() => {
  // React reports caught render errors through console.error; keep the run quiet
  // but still assert that the failure was reported.
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  consoleError.mockRestore();
});

describe('RoutedMain error boundary', () => {
  it('shows the fallback in place of a screen that throws while rendering', async () => {
    await render(pathForView('statistics'));

    expect(alert()).not.toBeNull();
    expect(alert().textContent).toContain('This screen couldn’t load');
    expect(container.querySelector('main#main-content')).not.toBeNull();
    expect(container.querySelector('main').contains(alert())).toBe(true);
    expect(mainText()).not.toContain('statistics screen');
    expect(consoleError).toHaveBeenCalled();
  });

  it('keeps navigation rendered and usable while a screen is failed', async () => {
    await render(pathForView('statistics'));

    const links = [...container.querySelectorAll('nav[aria-label="Primary"] a')];
    expect(links.map((a) => a.textContent)).toEqual(ROUTES.map((r) => r.view));
    expect(container.querySelector('nav').closest('main')).toBeNull();
  });

  it('restores working content when navigating to another view', async () => {
    await render(pathForView('statistics'));
    expect(alert()).not.toBeNull();

    await clickNav('roi');

    expect(alert()).toBeNull();
    expect(mainText()).toBe('roi screen');
  });

  it('resets per view: a failure persists only while its cause does', async () => {
    const failing = new Set(['statistics']);
    await render(pathForView('statistics'), { failing });

    await clickNav('home');
    expect(mainText()).toBe('home screen');

    // Back to the failed view with the cause still present: fails again.
    await clickNav('statistics');
    expect(alert()).not.toBeNull();

    // Cause fixed (e.g. data corrected); leaving and returning renders it.
    failing.delete('statistics');
    await clickNav('home');
    await clickNav('statistics');
    expect(alert()).toBeNull();
    expect(mainText()).toBe('statistics screen');
  });

  it('a working screen is not wrapped in any extra markup', async () => {
    await render(pathForView('home'));
    expect(alert()).toBeNull();
    expect(container.querySelector('main').innerHTML).toBe('<h1>home screen</h1>');
  });

  it('Reload calls the reload handler', async () => {
    const { onReload } = await render(pathForView('statistics'));
    const button = [...alert().querySelectorAll('button')].find((b) => b.textContent === 'Reload');

    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    });

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('Reload defaults to reloading the page', async () => {
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { ...original, reload } });
    try {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
      await act(async () => {
        root.render(h(MemoryRouter, { initialEntries: ['/statistics'] },
          h(RoutedMain, { view: 'statistics' }, h(Broken))));
      });
      await act(async () => {
        alert().querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
      });
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: original });
    }
  });
});

describe('App.js wiring (source)', () => {
  const app = readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'App.js'), 'utf8');
  const start = app.indexOf('<RoutedMain view={view}>');
  const end = app.indexOf('</RoutedMain>');
  const inside = app.slice(start, end);
  const before = app.slice(app.lastIndexOf('return (', start), start);

  it('renders the routed content through RoutedMain, keyed by the URL-derived view', () => {
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(app).not.toMatch(/<main[\s>]/);
  });

  it('keeps Header, BottomNav and SaveStatus outside the boundary', () => {
    expect(before).toContain('<Header view={view} />');
    expect(before).toContain('<BottomNav view={view} />');
    expect(before).toContain('<SaveStatus store={store} />');
    expect(inside).not.toMatch(/<(Header|BottomNav|SaveStatus)\b/);
  });

  it('puts every routed screen inside the boundary', () => {
    for (const screen of ['HomeTab', 'MatchupSimulator', 'UpcomingEventTab', 'ExploreTab', 'ROITab', 'StatisticsTab', 'InfoTab']) {
      expect(inside, screen).toContain(`<${screen}`);
    }
    for (const { view } of ROUTES) {
      expect(inside, view).toContain(`view === '${view}'`);
    }
  });
});
