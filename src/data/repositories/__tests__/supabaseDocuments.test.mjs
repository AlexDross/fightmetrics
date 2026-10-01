import { describe, expect, it } from 'vitest';
import { createDocumentsRepository, mapDocumentError } from '../supabaseDocuments.mjs';

describe('mapDocumentError returns a bare RepositoryError', () => {
  it('stale_write -> conflict with the live revision', () => {
    expect(mapDocumentError({ code: 'P0001', message: 'stale_write revision=7' }))
      .toEqual({ kind: 'conflict', currentRevision: '7' });
  });
  it('a lost same-id insert race (23505) is a conflict to re-read, not validation', () => {
    expect(mapDocumentError({ code: '23505', message: 'duplicate key' }).kind).toBe('conflict');
  });
  it.each([
    [{ code: '42501', message: 'insufficient workspace role' }, 'forbidden'],
    [{ code: 'PGRST301', message: 'JWT expired' }, 'unauthenticated'],
    [new TypeError('Failed to fetch'), 'offline'],
  ])('%o -> %s', (input, kind) => {
    const e = mapDocumentError(input);
    expect(e.kind).toBe(kind);
    expect(e).not.toHaveProperty('ok');
  });
});

/**
 * A fake PostgREST: rows, a server-side row cap that TRUNCATES silently like
 * real PostgREST, and a status row. `mutate(callIndex, set)` lets a test change
 * the data between calls to simulate a concurrent write.
 */
function fakeServer({ rows, initialized = true, maxRows = 1000, mutate } = {}) {
  const calls = [];
  let data = rows;
  const rpc = (fn) => {
    calls.push(fn);
    mutate?.(calls.length, (next) => { data = next; });
    if (fn === 'fm_read_document_status') {
      return Promise.resolve({ data: [{ initialized, document_count: data.length }], error: null });
    }
    return {
      range(from, to) {
        const page = data.slice(from, Math.min(to + 1, from + maxRows));
        return Promise.resolve({ data: page, error: null });
      },
    };
  };
  return { client: { rpc }, calls };
}

const doc = (i, collection = 'roi') => ({ collection, id: `d${i}`, payload: { id: `d${i}` }, revision: '1' });

describe('createDocumentsRepository.load', () => {
  it('routes to the member or public surface', async () => {
    const { client, calls } = fakeServer({ rows: [doc(1)] });
    const repo = createDocumentsRepository({ client });
    await repo.load({ member: false });
    await repo.load({ member: true });
    expect(calls.filter((c) => c !== 'fm_read_document_status')).toEqual(['fm_read_documents', 'fm_member_documents']);
  });

  it('pages past the server row cap instead of truncating', async () => {
    // 1003 rows, a 1000-row cap, Upcoming sorted LAST -- the audit's
    // reproduction, where a single read silently lost both Upcoming rows.
    const rows = [...Array.from({ length: 1001 }, (_, i) => doc(i, 'roi')), doc('u1', 'upcoming'), doc('u2', 'upcoming')];
    const { client } = fakeServer({ rows, maxRows: 1000 });
    const r = await createDocumentsRepository({ client, pageSize: 500 }).load({ member: true });
    expect(r.ok).toBe(true);
    expect(r.data.collections.roi).toHaveLength(1001);
    expect(r.data.collections.upcoming.map((e) => e.id)).toEqual(['du1', 'du2']);
  });

  it('refuses an incomplete read rather than returning it', async () => {
    // The cap is below the page size, so every page comes back short.
    const rows = Array.from({ length: 30 }, (_, i) => doc(i));
    const { client } = fakeServer({ rows, maxRows: 10 });
    const r = await createDocumentsRepository({ client, pageSize: 20 }).load({ member: true });
    expect(r.ok).toBe(false);
    expect(r.error.code).toBe('incompleteRead');
  });

  it('retries when a write lands mid-read, and returns the settled state', async () => {
    let once = false;
    const { client } = fakeServer({
      rows: [doc(1)],
      mutate: (n, set) => { if (n === 2 && !once) { once = true; set([doc(1), doc(2)]); } },
    });
    const r = await createDocumentsRepository({ client }).load({ member: true });
    expect(r.ok).toBe(true);
    expect(r.data.collections.roi).toHaveLength(2);
  });

  it('reports initialized separately from emptiness', async () => {
    const empty = await createDocumentsRepository({ client: fakeServer({ rows: [], initialized: true }).client }).load({ member: false });
    expect(empty.data.initialized).toBe(true);
    expect(empty.data.collections.roi).toEqual([]);
    const unseeded = await createDocumentsRepository({ client: fakeServer({ rows: [], initialized: false }).client }).load({ member: false });
    expect(unseeded.data.initialized).toBe(false);
  });
});

describe('createDocumentsRepository.apply', () => {
  const client = (reply) => ({ rpc: async (fn, args) => reply(fn, args) });

  it('surfaces a forbidden write as kind forbidden', async () => {
    const repo = createDocumentsRepository({ client: client(() => ({ data: null, error: { code: '42501', message: 'x' } })) });
    expect(await repo.apply([{ op: 'delete', collection: 'roi', id: 'a' }]))
      .toEqual({ ok: false, error: { kind: 'forbidden' } });
  });

  it('makes no request for an empty batch', async () => {
    let called = false;
    const repo = createDocumentsRepository({ client: client(() => { called = true; return {}; }) });
    expect(await repo.apply([])).toEqual({ ok: true, data: [] });
    expect(called).toBe(false);
  });
});
