import { describe, expect, it } from 'vitest';
import { createDocumentsRepository, mapDocumentError } from '../supabaseDocuments.mjs';

describe('mapDocumentError returns a bare RepositoryError', () => {
  it('stale_write -> conflict with the live revision', () => {
    expect(mapDocumentError({ code: 'P0001', message: 'stale_write revision=7' }))
      .toEqual({ kind: 'conflict', currentRevision: '7' });
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

describe('createDocumentsRepository', () => {
  const client = (reply) => ({ rpc: async (fn, args) => reply(fn, args) });

  it('load routes to the member or public surface', async () => {
    const calls = [];
    const repo = createDocumentsRepository({ client: client((fn) => { calls.push(fn); return { data: [], error: null }; }) });
    await repo.load({ member: false });
    await repo.load({ member: true });
    expect(calls).toEqual(['fm_read_documents', 'fm_member_documents']);
  });

  it('apply surfaces a forbidden write as kind forbidden', async () => {
    const repo = createDocumentsRepository({ client: client(() => ({ data: null, error: { code: '42501', message: 'x' } })) });
    const r = await repo.apply([{ op: 'delete', collection: 'roi', id: 'a' }]);
    expect(r).toEqual({ ok: false, error: { kind: 'forbidden' } });
  });

  it('apply with no ops makes no request', async () => {
    let called = false;
    const repo = createDocumentsRepository({ client: client(() => { called = true; return {}; }) });
    expect(await repo.apply([])).toEqual({ ok: true, data: [] });
    expect(called).toBe(false);
  });
});
