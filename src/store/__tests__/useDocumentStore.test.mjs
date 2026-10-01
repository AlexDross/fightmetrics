// @vitest-environment jsdom
//
// The document-store hook driven through React with a scriptable repository.
// These are the audit's (2026-10-01) failure probes, kept as regression tests.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const auth = { current: null };
vi.mock('../../auth/AuthProvider.jsx', () => ({ useAuth: () => auth.current }));

const { useDocumentStore, STORE_MODES } = await import('../useDocumentStore.js');
const { rowsToCollections, applyOpsLocally, emptyCollections } = await import('../../data/documents/collections.mjs');

const BUNDLED = Object.freeze({ ...emptyCollections(), roi: [{ id: 'bundled-1' }] });

/** An in-memory server behind the repository interface. */
function fakeDocuments({ initial = [], initialized = true } = {}) {
  const server = { rows: initial.map((r) => ({ ...r })), initialized };
  const repo = {
    server,
    applyBehaviour: null, // async (ops) => result, to override
    load: vi.fn(async () => {
      const rows = server.rows.map((r) => ({ ...r, revision: String(r.revision) }));
      return { ok: true, data: { ...rowsToCollections(rows), initialized: server.initialized } };
    }),
    apply: vi.fn(async (ops) => (repo.applyBehaviour ? repo.applyBehaviour(ops) : commitOnServer(server, ops))),
  };
  return repo;
}

function commitOnServer(server, ops) {
  const results = [];
  for (const op of ops) {
    const id = op.op === 'put' ? op.payload.id : op.id;
    const i = server.rows.findIndex((r) => r.collection === op.collection && r.id === id);
    if (op.op === 'delete') { if (i >= 0) server.rows.splice(i, 1); results.push({ collection: op.collection, id, deleted: true }); continue; }
    if (i >= 0) { server.rows[i] = { ...server.rows[i], payload: op.payload, revision: server.rows[i].revision + 1 }; results.push({ collection: op.collection, id, revision: String(server.rows[i].revision), deleted: false }); }
    else { server.rows.unshift({ collection: op.collection, id, payload: op.payload, revision: 1 }); results.push({ collection: op.collection, id, revision: '1', deleted: false }); }
  }
  server.initialized = true;
  return { ok: true, data: results };
}

let container; let root; let store;
function Probe() { store = useDocumentStore(BUNDLED); return null; }
async function mount(documents, { canWrite = true } = {}) {
  auth.current = { documents, readSurface: 'member', canWrite, session: { userId: 'u' }, status: 'member' };
  container = document.createElement('div');
  root = createRoot(container);
  await act(async () => { root.render(React.createElement(Probe)); });
  await act(async () => {});
}
beforeEach(() => { store = null; });
afterEach(async () => { await act(async () => root?.unmount()); container = null; });

// The same lazy dedupe the Save to Upcoming handler uses.
const saveIfNotPending = (entry) => (c) =>
  c.upcoming.some((e) => e.matchup === entry.matchup) ? [] : [{ op: 'put', collection: 'upcoming', payload: entry }];

describe('useDocumentStore', () => {
  it('an initialized-but-empty workspace renders empty, not the bundled snapshot', async () => {
    await mount(fakeDocuments({ initial: [], initialized: true }));
    expect(store.mode).toBe(STORE_MODES.LIVE);
    expect(store.collections.roi).toEqual([]);
  });

  it('a never-populated workspace shows the bundled snapshot read-only', async () => {
    await mount(fakeDocuments({ initial: [], initialized: false }));
    expect(store.mode).toBe(STORE_MODES.UNSEEDED);
    expect(store.collections.roi).toEqual(BUNDLED.roi);
  });

  it('two saves of the same matchup before the first returns persist ONE entry', async () => {
    const docs = fakeDocuments({ initial: [{ collection: 'roi', id: 'r', payload: { id: 'r' }, revision: 1 }] });
    let release;
    docs.applyBehaviour = (ops) => new Promise((resolve) => { release = () => resolve(commitOnServer(docs.server, ops)); });
    await mount(docs);
    let a; let b;
    await act(async () => {
      a = store.commit(saveIfNotPending({ id: 'p1', matchup: 'X|Y' }));
      b = store.commit(saveIfNotPending({ id: 'p2', matchup: 'X|Y' }));
    });
    await act(async () => { await Promise.resolve(); release(); docs.applyBehaviour = null; });
    await act(async () => { await a; await b; });
    expect(docs.apply).toHaveBeenCalledTimes(1);
    expect(store.collections.upcoming.map((e) => e.id)).toEqual(['p1']);
    expect(docs.server.rows.filter((r) => r.collection === 'upcoming')).toHaveLength(1);
  });

  it('a save whose response is lost reconciles before any retry, so it cannot duplicate', async () => {
    const docs = fakeDocuments({ initial: [{ collection: 'roi', id: 'r', payload: { id: 'r' }, revision: 1 }] });
    // The server COMMITS, but the client sees a network failure.
    docs.applyBehaviour = async (ops) => { commitOnServer(docs.server, ops); return { ok: false, error: { kind: 'offline' } }; };
    await mount(docs);
    let first;
    await act(async () => { first = await store.commit(saveIfNotPending({ id: 'p1', matchup: 'X|Y' })); });
    expect(first).toBe(false);
    // The reconcile re-read shows what actually landed.
    expect(store.collections.upcoming.map((e) => e.id)).toEqual(['p1']);
    docs.applyBehaviour = null;
    // The user retries: the dedupe now sees p1, so nothing new is written.
    await act(async () => { await store.commit(saveIfNotPending({ id: 'p2', matchup: 'X|Y' })); });
    expect(docs.server.rows.filter((r) => r.collection === 'upcoming')).toHaveLength(1);
  });

  it('while the server stays unreachable, further writes are refused until reconciled', async () => {
    const docs = fakeDocuments({ initial: [{ collection: 'roi', id: 'r', payload: { id: 'r' }, revision: 1 }] });
    await mount(docs);
    docs.applyBehaviour = async () => ({ ok: false, error: { kind: 'offline' } });
    docs.load.mockImplementation(async () => ({ ok: false, error: { kind: 'offline' } }));
    await act(async () => { await store.commit([{ op: 'put', collection: 'roi', payload: { id: 'n1' } }]); });
    const callsBefore = docs.apply.mock.calls.length;
    let ok;
    await act(async () => { ok = await store.commit([{ op: 'put', collection: 'roi', payload: { id: 'n2' } }]); });
    expect(ok).toBe(false);
    expect(docs.apply.mock.calls.length).toBe(callsBefore);
    expect(store.refreshFailed).toBe(true);
  });

  it('a conflict re-reads the server state', async () => {
    const docs = fakeDocuments({ initial: [{ collection: 'roi', id: 'r', payload: { id: 'r', n: 1 }, revision: 1 }] });
    await mount(docs);
    docs.server.rows[0] = { ...docs.server.rows[0], payload: { id: 'r', n: 2 }, revision: 2 };
    docs.applyBehaviour = async () => ({ ok: false, error: { kind: 'conflict', currentRevision: '2' } });
    await act(async () => { await store.commit([{ op: 'put', collection: 'roi', payload: { id: 'r', n: 9 } }]); });
    expect(store.collections.roi[0].n).toBe(2);
    expect(store.saveState.status).toBe('failed');
  });

  it('a rejected (forbidden) write changes nothing and does not block later writes', async () => {
    const docs = fakeDocuments({ initial: [{ collection: 'roi', id: 'r', payload: { id: 'r' }, revision: 1 }] });
    await mount(docs);
    docs.applyBehaviour = async () => ({ ok: false, error: { kind: 'forbidden' } });
    await act(async () => { await store.commit([{ op: 'delete', collection: 'roi', id: 'r' }]); });
    expect(store.collections.roi).toHaveLength(1);
    docs.applyBehaviour = null;
    let ok;
    await act(async () => { ok = await store.commit([{ op: 'delete', collection: 'roi', id: 'r' }]); });
    expect(ok).toBe(true);
    expect(store.collections.roi).toHaveLength(0);
  });

  it('applyOpsLocally sanity: the fake server and the local mirror agree', () => {
    const c = applyOpsLocally(emptyCollections(), [{ op: 'put', collection: 'roi', payload: { id: 'a' } }]);
    expect(c.roi).toEqual([{ id: 'a' }]);
  });
});
