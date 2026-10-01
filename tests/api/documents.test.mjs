// Document store (20260930120000) over real PostgREST.
//
// Own workspaces, own users' memberships: nothing here touches the shared
// fixture workspaces the normalized-schema suites depend on.
import { beforeAll, describe, expect, it } from 'vitest';
import {
  applyFixture, rpc, sql, scalar,
  USER_MEMBER, USER_OUTSIDER, USER_VIEWER,
} from './helpers.mjs';

const WS_DOCS = '11110000-0000-4000-8000-0000000000d1';
const WS_DOCS_PRIVATE = '11110000-0000-4000-8000-0000000000d2';
const PUB = 'api-docs';
const PRIV = 'api-docs-private';

const apply = (slug, ops, as = USER_MEMBER) => rpc('fm_rpc_apply_documents', { p_slug: slug, p_ops: ops }, { as });
const memberDocs = (slug, as = USER_MEMBER) => rpc('fm_member_documents', { p_slug: slug }, { as });
const ids = (rows, collection) => rows.filter((r) => r.collection === collection).map((r) => r.id);

beforeAll(() => {
  applyFixture();
  sql(`
BEGIN;
GRANT fm_table_owner TO postgres WITH SET TRUE, INHERIT FALSE;
SET LOCAL ROLE fm_table_owner;
DELETE FROM app_private.documents WHERE workspace_id IN ('${WS_DOCS}', '${WS_DOCS_PRIVATE}');
DELETE FROM app_private.workspace_members WHERE workspace_id IN ('${WS_DOCS}', '${WS_DOCS_PRIVATE}');
INSERT INTO app_private.workspaces (id, slug, is_public) VALUES
  ('${WS_DOCS}', '${PUB}', true), ('${WS_DOCS_PRIVATE}', '${PRIV}', false)
ON CONFLICT DO NOTHING;
INSERT INTO app_private.workspace_members (workspace_id, user_id, role) VALUES
  ('${WS_DOCS}', '${USER_MEMBER}', 'owner'),
  ('${WS_DOCS}', '${USER_VIEWER}', 'viewer'),
  ('${WS_DOCS_PRIVATE}', '${USER_MEMBER}', 'owner');
RESET ROLE;
REVOKE fm_table_owner FROM postgres;
COMMIT;
`);
});

describe('document store', () => {
  it('the migration pre-creates an empty public fightmetrics workspace', () => {
    expect(scalar(`SELECT is_public FROM app_private.workspaces WHERE slug = 'fightmetrics';`)).toBe('t');
  });

  it('owner inserts at top by default and at bottom on request', async () => {
    const a = await apply(PUB, [
      { op: 'put', collection: 'roi', payload: { id: 'r1', n: 1 } },
      { op: 'put', collection: 'roi', payload: { id: 'r2', n: 2 } },
      { op: 'put', collection: 'roi', payload: { id: 'r0', n: 0 }, position: 'bottom' },
    ]);
    expect(a.status).toBe(200);
    expect(a.body.map((r) => r.revision)).toEqual(['1', '1', '1']);
    const read = await memberDocs(PUB);
    expect(ids(read.body, 'roi')).toEqual(['r2', 'r1', 'r0']);
  });

  it('anon reads public documents without revision tokens, and nothing private', async () => {
    await apply(PRIV, [{ op: 'put', collection: 'upcoming', payload: { id: 'secret' } }]);
    const pub = await rpc('fm_read_documents', { p_slug: PUB });
    expect(pub.status).toBe(200);
    expect(ids(pub.body, 'roi')).toEqual(['r2', 'r1', 'r0']);
    expect(Object.keys(pub.body[0]).sort()).toEqual(['collection', 'id', 'payload']);
    const priv = await rpc('fm_read_documents', { p_slug: PRIV });
    expect(priv.body).toEqual([]);
    const outsider = await memberDocs(PRIV, USER_OUTSIDER);
    expect(outsider.body).toEqual([]);
  });

  it('anon, outsiders and viewers cannot write', async () => {
    const op = [{ op: 'put', collection: 'roi', payload: { id: 'nope' } }];
    expect((await rpc('fm_rpc_apply_documents', { p_slug: PUB, p_ops: op })).status).not.toBe(200);
    expect((await apply(PUB, op, USER_OUTSIDER)).body.code).toBe('42501');
    expect((await apply(PUB, op, USER_VIEWER)).body.code).toBe('42501');
    expect(ids((await memberDocs(PUB)).body, 'roi')).not.toContain('nope');
  });

  it('expectedRevision guards updates and reports the live revision', async () => {
    const ok = await apply(PUB, [{ op: 'put', collection: 'roi', payload: { id: 'r1', n: 11 }, expectedRevision: '1' }]);
    expect(ok.body[0].revision).toBe('2');
    const stale = await apply(PUB, [{ op: 'put', collection: 'roi', payload: { id: 'r1', n: 99 }, expectedRevision: '1' }]);
    expect(stale.body.code).toBe('P0001');
    expect(stale.body.message).toBe('stale_write revision=2');
    const mustBeNew = await apply(PUB, [{ op: 'put', collection: 'roi', payload: { id: 'r1' }, expectedRevision: '0' }]);
    expect(mustBeNew.body.message).toBe('stale_write revision=2');
    const row = (await memberDocs(PUB)).body.find((r) => r.id === 'r1');
    expect(row.payload.n).toBe(11);
    // An update keeps its place in the order.
    expect(ids((await memberDocs(PUB)).body, 'roi')).toEqual(['r2', 'r1', 'r0']);
  });

  it('a batch is atomic: a failing later op rolls back the earlier ones', async () => {
    await apply(PUB, [{ op: 'put', collection: 'upcoming', payload: { id: 'u1' } }]);
    const bad = await apply(PUB, [
      { op: 'delete', collection: 'upcoming', id: 'u1' },
      { op: 'put', collection: 'roi', payload: { id: 'r2' }, expectedRevision: '7' },
    ]);
    expect(bad.status).not.toBe(200);
    expect(ids((await memberDocs(PUB)).body, 'upcoming')).toEqual(['u1']);
    // The real grade: delete from upcoming and put into roi, together.
    const grade = await apply(PUB, [
      { op: 'delete', collection: 'upcoming', id: 'u1', expectedRevision: '1' },
      { op: 'put', collection: 'roi', payload: { id: 'u1', actualWinner: 'X' }, expectedRevision: '0' },
    ]);
    expect(grade.status).toBe(200);
    const after = (await memberDocs(PUB)).body;
    expect(ids(after, 'upcoming')).toEqual([]);
    expect(ids(after, 'roi')[0]).toBe('u1');
  });

  it('rejects malformed ops, including a non-string id', async () => {
    expect((await apply(PUB, [])).body.code).toBe('22023');
    expect((await apply(PUB, [{ op: 'put', collection: 'nope', payload: { id: 'x' } }])).body.code).toBe('22023');
    expect((await apply(PUB, [{ op: 'put', collection: 'roi', payload: { n: 1 } }])).body.code).toBe('22023');
    expect((await apply(PUB, [{ op: 'frob', collection: 'roi', id: 'x' }])).body.code).toBe('22023');
    expect((await apply(PUB, [{ op: 'put', collection: 'propPicks', payload: { id: 1730000000000 } }])).body.code).toBe('22023');
    expect((await apply(PUB, [{ op: 'put', collection: 'roi', payload: [1] }])).body.code).toBe('22023');
  });

  it('deleting a missing row is a no-op unless a revision is expected', async () => {
    expect((await apply(PUB, [{ op: 'delete', collection: 'roi', id: 'ghost' }])).status).toBe(200);
    expect((await apply(PUB, [{ op: 'delete', collection: 'roi', id: 'ghost', expectedRevision: '1' }])).body.message)
      .toBe('stale_write revision=0');
  });

  it('preserves key order and the exact payload text', async () => {
    const payload = { id: 'order', zeta: 1, alpha: { y: 2, b: 3 }, mid: [3, 1, 2] };
    await apply(PUB, [{ op: 'put', collection: 'roi', payload }]);
    const row = (await rpc('fm_read_documents', { p_slug: PUB })).body.find((r) => r.id === 'order');
    expect(JSON.stringify(row.payload)).toBe(JSON.stringify(payload));
  });

  it('round-trips doubles bit-exactly', async () => {
    const p = 0.5432109876543210;
    const q = 1 - p;
    await apply(PUB, [{ op: 'put', collection: 'roi', payload: { id: 'fp', a: p, b: q, c: 0.1 + 0.2 } }]);
    const row = (await rpc('fm_read_documents', { p_slug: PUB })).body.find((r) => r.id === 'fp');
    expect(Object.is(row.payload.a, p)).toBe(true);
    expect(Object.is(row.payload.b, q)).toBe(true);
    expect(Object.is(row.payload.c, 0.1 + 0.2)).toBe(true);
  });
});
