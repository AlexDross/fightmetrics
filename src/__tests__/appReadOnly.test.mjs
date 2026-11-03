// @vitest-environment jsdom
//
// M1 PR 3: read-only Upcoming and ROI for everyone who cannot write.
//
// Per-file DOM opt-in; .mjs so Tailwind's @source globs cannot reach it.
//
// THE ONE SANCTIONED App.js IMPORTER (see isolation.test.js and section 8 of
// docs/handoffs/M1_CODEX_REVIEW_HANDOFF.md). The screens under test exist only
// inside App.js, so this file renders the real App -- after removing both
// reasons tests may not import it:
//   1. the clock is pinned (vi.setSystemTime) BEFORE App.js is imported, so
//      everything App derives from "now" is fixed;
//   2. every live data module App.js reads directly is mocked with frozen
//      fixtures: the four document snapshots and the assembled FIGHTERS
//      collection (golden fighters).
//
// What is NOT faked: AuthProvider, resolveAuthState, the documents repository,
// useDocumentStore and its mode machine, and App itself. Only the Supabase
// client's network boundary is replaced -- `rpc` is answered by an in-memory
// server, and global fetch throws -- so every mode below (live non-writer,
// loading, unseeded, offline, owner, local) is reached through the same code
// path production uses, and canWrite is whatever that path derives.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AuthProvider } from '../auth/AuthProvider.jsx';
import { ConfirmProvider } from '../ui/ConfirmDialog.jsx';

// Its own folder: fixtures/ and inputs/ hold hash-pinned, approved captures.
const FIX = JSON.parse(readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'readOnlyViews', 'collections.json'), 'utf8'));

// vi.mock factories are hoisted above everything else in this file, so each
// one loads its own frozen data rather than closing over FIX.
const loadBundled = async () => {
  const fs = await import('node:fs');
  const p = await import('node:path');
  const u = await import('node:url');
  const file = p.join(p.dirname(u.fileURLToPath(import.meta.url)), 'readOnlyViews', 'collections.json');
  return JSON.parse(fs.readFileSync(file, 'utf8')).bundled;
};
vi.mock('../upcomingData', async () => ({ UPCOMING_ENTRIES: (await loadBundled()).upcoming }));
vi.mock('../roiData', async () => ({ ROI_ENTRIES: (await loadBundled()).roi }));
vi.mock('../propPicksData', async () => ({ PROP_PICKS: (await loadBundled()).propPicks }));
vi.mock('../parlayData', async () => ({ PARLAY_ENTRIES: (await loadBundled()).parlays }));
vi.mock('../domain/fighters', async () => {
  const { loadFixture, decodeSpecials } = await import('./goldenSupport.js');
  const { fighterFixtures } = loadFixture('fighters.golden.json');
  return { FIGHTERS: Object.values(fighterFixtures).map(decodeSpecials) };
});

// Pin the clock, THEN import App. Only Date is faked: React and the store's
// promise chains keep real timers.
vi.useFakeTimers({ toFake: ['Date'] });
vi.setSystemTime(new Date('2026-10-28T12:00:00.000Z'));
const { default: App } = await import('../App.js');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const h = React.createElement;

// ─── the fake network boundary ───────────────────────────────────────────────

const ENV_ON = {
  VITE_SUPABASE_URL: 'https://example-project.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_AAAAAAAAAAAAAAAAAAAAAA',
};
const COLLECTIONS = ['upcoming', 'roi', 'propPicks', 'parlays'];

/** An in-memory workspace behind fm_* RPCs. `state`: ready | unseeded | loading | offline. */
function fakeServer(state, collections = FIX.live) {
  const server = {
    state,
    calls: [],
    generation: 1,
    initialized: state === 'ready',
    rows: state === 'ready'
      ? COLLECTIONS.flatMap((c) => collections[c].map((payload) => ({ collection: c, id: payload.id, payload, revision: 1 })))
      : [],
  };
  const answer = (fn, args) => {
    if (fn === 'fm_read_document_status') {
      return { data: [{ initialized: server.initialized, document_count: server.rows.length, generation: server.generation }], error: null };
    }
    if (fn === 'fm_read_documents' || fn === 'fm_member_documents') {
      const member = fn === 'fm_member_documents';
      return {
        data: server.rows.map((r) => ({ collection: r.collection, id: r.id, payload: r.payload, ...(member ? { revision: r.revision } : {}) })),
        error: null,
      };
    }
    if (fn === 'fm_rpc_apply_documents') {
      const results = [];
      for (const op of args.p_ops) {
        const id = op.op === 'put' ? op.payload.id : op.id;
        const i = server.rows.findIndex((r) => r.collection === op.collection && r.id === id);
        if (op.op === 'delete') {
          if (i >= 0) server.rows.splice(i, 1);
          results.push({ collection: op.collection, id, deleted: true });
        } else if (i >= 0) {
          server.rows[i] = { ...server.rows[i], payload: op.payload, revision: server.rows[i].revision + 1 };
          results.push({ collection: op.collection, id, revision: String(server.rows[i].revision), deleted: false });
        } else {
          server.rows.unshift({ collection: op.collection, id, payload: op.payload, revision: 1 });
          results.push({ collection: op.collection, id, revision: '1', deleted: false });
        }
      }
      server.generation += 1;
      server.initialized = true;
      return { data: results, error: null };
    }
    return { data: null, error: { code: 'PGRST202', message: `unknown rpc ${fn}` } };
  };
  server.rpc = (fn, args) => {
    server.calls.push(fn);
    const settle = () => {
      if (server.state === 'offline') return Promise.reject(new TypeError('Failed to fetch'));
      if (server.state === 'loading') return new Promise(() => {}); // never answers
      return Promise.resolve(answer(fn, args));
    };
    return {
      // Paged reads: the whole table fits in one page here.
      range: () => settle(),
      then: (ok, fail) => settle().then(ok, fail),
    };
  };
  return server;
}

function fakeAuthRepository({ userId = null, role = null } = {}) {
  return {
    session: async () => ({ ok: true, data: userId ? { userId } : null }),
    whoami: async () => ({ ok: true, data: { role } }),
    signIn: async () => ({ ok: true, data: { sent: true } }),
    signOut: async () => ({ ok: true, data: { signedOut: true } }),
    claimOwnership: async () => ({ ok: false, error: { kind: 'forbidden' } }),
  };
}

const fakeWindow = () => ({
  location: { origin: 'https://fightmetrics.test', hash: '', search: '' },
  history: { replaceState: () => {} },
  addEventListener: () => {}, removeEventListener: () => {},
  document: { visibilityState: 'visible', addEventListener: () => {}, removeEventListener: () => {} },
});

/** deps for the REAL AuthProvider; only the client and the auth repo are fakes. */
function depsFor({ server, user = null, role = null, configured = true }) {
  return {
    env: configured ? ENV_ON : {},
    windowLike: fakeWindow(),
    createClient: () => ({
      auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
      rpc: (fn, args) => server.rpc(fn, args),
    }),
    createRepository: () => fakeAuthRepository({ userId: user, role }),
  };
}

// ─── rendering ────────────────────────────────────────────────────────────────

let container;
let root;
let fetchSpy;

async function flush(rounds = 12) {
  for (let i = 0; i < rounds; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => { await Promise.resolve(); });
  }
}

async function renderApp(pathname, deps) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(h(MemoryRouter, { initialEntries: [pathname] },
      h(AuthProvider, { deps }, h(ConfirmProvider, null, h(App)))));
  });
  await flush();
}

const main = () => container.querySelector('main');
const text = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
const buttons = (scope = main()) => [...scope.querySelectorAll('button')];

async function click(el) {
  await act(async () => { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); });
  await flush(4);
}

async function openSubTab(label) {
  const tab = buttons().find((b) => b.getAttribute('role') === 'tab' && text(b) === label);
  expect(tab, `sub-tab ${label}`).toBeTruthy();
  await click(tab);
}

// ROI event groups start collapsed except the most recent: open them all so
// every entry's fields are rendered.
async function expandAllRoiEvents() {
  for (;;) {
    const closed = buttons().find((b) => b.getAttribute('aria-expanded') === 'false');
    if (!closed) return;
    // eslint-disable-next-line no-await-in-loop
    await click(closed);
  }
}

// Every label a write action carries in Upcoming / ROI / Props / Parlays /
// fight-day check. "Clear" is also the label of the ROI date filter's reset,
// which is a view control and is exempted by position below.
const WRITE_LABELS = new Set([
  'Delete', 'Clear All', 'Confirm All', 'Confirm Pick',
  '+ Prop', 'Cancel Prop', '+ Log a manual prop', 'Cancel manual prop',
  'Build Parlay', 'Fight-day check', 'Clear', 'Re-check', 'Record bet', 'Record skip',
]);

/** Writable form fields and write buttons on screen, minus the date filter. */
function writeControls() {
  const since = container.querySelector('#roi-since');
  const viewControl = (el) => Boolean(since && since.parentElement.contains(el));
  const fields = [...main().querySelectorAll('input, select, textarea')].filter((el) => !viewControl(el));
  const actions = buttons().filter((b) => WRITE_LABELS.has(text(b)) && !viewControl(b));
  return [...fields.map((el) => `${el.tagName.toLowerCase()}#${el.id || el.getAttribute('aria-label')}`),
    ...actions.map((b) => `button "${text(b)}"`)];
}

const cardOrder = () => [...main().querySelectorAll('h3')].map(text);
const statusText = () => text([...container.querySelectorAll('[role="status"], [aria-live]')]
  .find((el) => /snapshot|refresh/i.test(el.textContent)));

beforeEach(() => {
  // React logs act() noise for the never-settling loading read; keep errors visible otherwise.
  fetchSpy = vi.fn(() => Promise.reject(new Error('network is disabled in this test')));
  globalThis.fetch = fetchSpy;
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
});

afterEach(async () => {
  expect(fetchSpy).not.toHaveBeenCalled();
  await act(async () => root.unmount());
  container.remove();
  document.body.innerHTML = '';
});

// ─── expectations shared by every non-writing state ──────────────────────────

const expectedOrder = (set) => set.upcoming.map((e) => `${e.fighterA} vs. ${e.fighterB}`);

async function expectReadOnlyUpcoming(set) {
  // Fights
  expect(cardOrder(), 'Upcoming order is unchanged').toEqual(expectedOrder(set));
  expect(writeControls(), 'Upcoming Fights write controls').toEqual([]);
  const body = text(main());
  // Values that used to sit inside controls are still on screen.
  const winnerRows = [...main().querySelectorAll('dt')].filter((dt) => text(dt) === 'Actual Winner');
  expect(winnerRows.length).toBe(set.upcoming.length);
  winnerRows.forEach((dt) => expect(text(dt.nextElementSibling)).toBe('Pending'));
  const units = [...main().querySelectorAll('dt')].find((dt) => text(dt) === 'Units Staked');
  expect(text(units?.nextElementSibling), 'legacy card keeps its units').toBe('2');
  expect(body).toContain('Placed 1.5u on Luana Santos at -239');
  expect(body).toContain('EV +');

  // Props
  await openSubTab('Props');
  expect(writeControls(), 'Upcoming Props write controls').toEqual([]);
  const pending = set.propPicks.find((p) => p.result === 'PENDING');
  expect(text(main())).toContain(pending.label);
  expect(text(main())).toContain(`${pending.fighterA} vs. ${pending.fighterB}`);
  expect(text(main())).toContain('Pending');

  // Parlays
  await openSubTab('Parlays');
  expect(writeControls(), 'Upcoming Parlays write controls').toEqual([]);
  expect(text(main())).toContain('UFC Fight Night: Moicano vs. Nolan');
  expect(text(main())).toContain('+262');
}

async function expectReadOnlyRoi(set) {
  // All Events
  expect(text(main())).toContain('Tracked Fights');
  await expandAllRoiEvents();
  expect(writeControls(), 'ROI All Events write controls').toEqual([]);
  const fields = (label) => [...main().querySelectorAll('dt')].filter((dt) => text(dt) === label).map((dt) => text(dt.nextElementSibling));
  expect(fields('Event Name').sort()).toEqual(set.roi.map((e) => e.eventName).sort());
  expect(fields('Event Date').sort()).toEqual(set.roi.map((e) => e.eventDate).sort());
  expect(fields('Actual Winner').sort()).toEqual(set.roi.map((e) => e.actualWinner).sort());
  expect(fields('Pick').length).toBe(set.roi.length);
  expect(fields('Odds').every((v) => v !== '')).toBe(true);
  // The date filter is a view control and stays usable.
  expect(container.querySelector('#roi-since')).not.toBeNull();

  // Most Recent Event
  await openSubTab('Most Recent Event');
  await expandAllRoiEvents();
  expect(writeControls(), 'ROI Most Recent write controls').toEqual([]);
  expect(text(main())).toContain('UFC 333');

  // Prop Bets
  await openSubTab('Prop Bets');
  expect(writeControls(), 'ROI Prop Bets write controls').toEqual([]);
  const graded = set.propPicks.find((p) => p.result !== 'PENDING');
  expect(text(main())).toContain(graded.label);
  expect(text(main())).toContain(graded.result === 'WON' ? 'Won' : 'Lost');

  // Parlays
  await openSubTab('Parlays');
  expect(writeControls(), 'ROI Parlays write controls').toEqual([]);
  expect(text(main())).toContain('UFC 333');
}

// ─── the non-writing states ───────────────────────────────────────────────────

const NON_WRITERS = [
  {
    name: 'live, signed out',
    deps: () => depsFor({ server: fakeServer('ready') }),
    set: FIX.live,
    status: '',
  },
  {
    name: 'live, signed-in viewer (member surface, no write role)',
    deps: () => depsFor({ server: fakeServer('ready'), user: 'user-viewer', role: 'viewer' }),
    set: FIX.live,
    status: '',
  },
  {
    name: 'live, signed in without membership',
    deps: () => depsFor({ server: fakeServer('ready'), user: 'user-none', role: null }),
    set: FIX.live,
    status: '',
  },
  {
    name: 'loading (first read never answers)',
    deps: () => depsFor({ server: fakeServer('loading') }),
    set: FIX.bundled,
    status: '',
  },
  {
    name: 'unseeded workspace',
    deps: () => depsFor({ server: fakeServer('unseeded') }),
    set: FIX.bundled,
    status: 'Database not set up yet',
  },
  {
    name: 'offline (read fails)',
    deps: () => depsFor({ server: fakeServer('offline') }),
    set: FIX.bundled,
    status: 'Offline',
  },
];

describe.each(NON_WRITERS)('read-only for non-writers: $name', ({ deps, set, status }) => {
  it('Upcoming (Fights, Props, Parlays) shows values and no write controls', async () => {
    await renderApp('/upcoming', deps());
    // The state was really reached: server data vs the bundled fallback.
    const liveOnly = `${FIX.live.upcoming.at(-1).fighterA} vs. ${FIX.live.upcoming.at(-1).fighterB}`;
    expect(cardOrder().includes(liveOnly)).toBe(set === FIX.live);
    if (status) expect(statusText()).toContain(status);
    await expectReadOnlyUpcoming(set);
  });

  it('ROI (All Events, Most Recent, Prop Bets, Parlays) shows values and no write controls', async () => {
    await renderApp('/roi', deps());
    if (status) expect(statusText()).toContain(status);
    await expectReadOnlyRoi(set);
  });
});

// ─── writers keep everything ──────────────────────────────────────────────────

function controlCounts() {
  const count = (label) => buttons().filter((b) => text(b) === label).length;
  return {
    Delete: count('Delete'),
    '+ Prop': count('+ Prop'),
    'Fight-day check': count('Fight-day check'),
    Clear: count('Clear'),
    selects: main().querySelectorAll('select').length,
    inputs: main().querySelectorAll('input').length,
  };
}

describe('writers keep every control', () => {
  it('live owner: all Upcoming and ROI controls render, and grading writes through the server', async () => {
    const server = fakeServer('ready');
    await renderApp('/upcoming', depsFor({ server, user: 'user-owner', role: 'owner' }));
    expect(server.calls).toContain('fm_member_documents');
    expect(cardOrder()).toEqual(expectedOrder(FIX.live));
    const n = FIX.live.upcoming.length;
    const c = controlCounts();
    expect(c.Delete).toBe(n);
    expect(c['+ Prop']).toBe(n);
    expect(c['Fight-day check']).toBe(1); // Moicano: BET, nothing recorded
    expect(c.Clear).toBe(1); // Yana Santos: recorded fight-day bet
    expect(c.selects).toBe(n); // actual winner
    expect(main().querySelectorAll('input[type="checkbox"]').length).toBe(n); // parlay legs
    expect(main().querySelector('input[type="number"]')).not.toBeNull(); // legacy units
    await openSubTab('Props');
    expect(buttons().some((b) => text(b) === '+ Log a manual prop')).toBe(true);
    expect(main().querySelectorAll('select').length).toBe(1);
    await openSubTab('Parlays');
    expect(buttons().filter((b) => text(b) === 'Delete').length).toBe(1);

    // Grade the main event: delete from upcoming + put into roi, via the server.
    await openSubTab('Upcoming Fights');
    const [first] = FIX.live.upcoming;
    const select = container.querySelector(`#upcoming-winner-${CSS.escape(first.id)}`);
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, first.fighterB);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await flush();
    expect(server.calls).toContain('fm_rpc_apply_documents');
    expect(server.rows.some((r) => r.collection === 'upcoming' && r.id === first.id)).toBe(false);
    expect(server.rows.find((r) => r.collection === 'roi' && r.id === first.id)?.payload.actualWinner).toBe(first.fighterB);
    expect(cardOrder()).toEqual(expectedOrder(FIX.live).slice(1));
  });

  it('live owner: ROI keeps Clear All, Confirm All/Pick, Delete and the editable fields', async () => {
    await renderApp('/roi', depsFor({ server: fakeServer('ready'), user: 'user-owner', role: 'owner' }));
    await expandAllRoiEvents();
    const labels = buttons().map(text);
    expect(labels).toContain('Clear All');
    expect(labels).toContain('Confirm All');
    expect(labels).toContain('Confirm Pick');
    expect(labels.filter((l) => l === 'Delete').length).toBe(FIX.live.roi.length);
    for (const e of FIX.live.roi) {
      expect(container.querySelector(`#roi-event-name-${CSS.escape(e.id)}`)).not.toBeNull();
      expect(container.querySelector(`#roi-winner-${CSS.escape(e.id)}`)?.value).toBe(e.actualWinner);
    }
    await openSubTab('Prop Bets');
    expect(main().querySelectorAll('select').length).toBe(1);
    await openSubTab('Parlays');
    expect(buttons().filter((b) => text(b) === 'Delete').length).toBe(1);
  });

  it('local mode (no Supabase configured): controls render and grading works with no request', async () => {
    const server = fakeServer('ready');
    await renderApp('/upcoming', depsFor({ server, configured: false }));
    expect(server.calls).toEqual([]);
    expect(cardOrder()).toEqual(expectedOrder(FIX.bundled));
    expect(controlCounts().Delete).toBe(FIX.bundled.upcoming.length);

    const [first] = FIX.bundled.upcoming;
    const select = container.querySelector(`#upcoming-winner-${CSS.escape(first.id)}`);
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, first.fighterA);
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await flush();
    expect(cardOrder()).toEqual(expectedOrder(FIX.bundled).slice(1));
    expect(server.calls).toEqual([]);
  });
});
