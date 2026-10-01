import { describe, expect, it } from 'vitest';
import {
  applyOpsLocally, applyResultRevisions, emptyCollections, revisionOf,
  rowsToCollections, seedOps, withExpectedRevisions,
} from '../collections.mjs';

const base = () => ({ ...emptyCollections(), roi: [{ id: 'a', n: 1 }, { id: 'b', n: 2 }] });

describe('applyOpsLocally mirrors fm_rpc_apply_documents', () => {
  it('inserts at the top by default and at the bottom on request', () => {
    const next = applyOpsLocally(base(), [
      { op: 'put', collection: 'roi', payload: { id: 'top' } },
      { op: 'put', collection: 'roi', payload: { id: 'end' }, position: 'bottom' },
    ]);
    expect(next.roi.map((e) => e.id)).toEqual(['top', 'a', 'b', 'end']);
  });

  it('an update replaces in place and keeps its position', () => {
    const next = applyOpsLocally(base(), [{ op: 'put', collection: 'roi', payload: { id: 'b', n: 9 } }]);
    expect(next.roi).toEqual([{ id: 'a', n: 1 }, { id: 'b', n: 9 }]);
  });

  it('delete removes by id; a missing id is a no-op', () => {
    const next = applyOpsLocally(base(), [
      { op: 'delete', collection: 'roi', id: 'a' },
      { op: 'delete', collection: 'roi', id: 'ghost' },
    ]);
    expect(next.roi.map((e) => e.id)).toEqual(['b']);
  });

  it('a grade moves an entry between collections in one batch', () => {
    const c = { ...emptyCollections(), upcoming: [{ id: 'u' }] };
    const next = applyOpsLocally(c, [
      { op: 'delete', collection: 'upcoming', id: 'u' },
      { op: 'put', collection: 'roi', payload: { id: 'u', actualWinner: 'X' } },
    ]);
    expect(next.upcoming).toEqual([]);
    expect(next.roi).toEqual([{ id: 'u', actualWinner: 'X' }]);
  });

  it('never mutates its input, and leaves untouched collections identical', () => {
    const c = base();
    const snapshot = JSON.stringify(c);
    const next = applyOpsLocally(c, [{ op: 'put', collection: 'roi', payload: { id: 'z' } }]);
    expect(JSON.stringify(c)).toBe(snapshot);
    expect(next.upcoming).toBe(c.upcoming);
  });

  it('rejects malformed ops', () => {
    expect(() => applyOpsLocally(base(), [{ op: 'put', collection: 'nope', payload: { id: 'x' } }])).toThrow();
    expect(() => applyOpsLocally(base(), [{ op: 'put', collection: 'roi', payload: {} }])).toThrow();
    expect(() => applyOpsLocally(base(), [{ op: 'frob', collection: 'roi', id: 'x' }])).toThrow();
  });
});

describe('revisions', () => {
  it('rowsToCollections splits rows by collection in server order', () => {
    const { collections, revisions } = rowsToCollections([
      { collection: 'roi', id: 'b', payload: { id: 'b' }, revision: '3' },
      { collection: 'roi', id: 'a', payload: { id: 'a' }, revision: '1' },
      { collection: 'upcoming', id: 'u', payload: { id: 'u' }, revision: '2' },
      { collection: 'unknown', id: 'x', payload: { id: 'x' } },
    ]);
    expect(collections.roi.map((e) => e.id)).toEqual(['b', 'a']);
    expect(collections.upcoming).toEqual([{ id: 'u' }]);
    expect(revisionOf(revisions, 'roi', 'b')).toBe('3');
  });

  it('public rows carry no revision and produce no tokens', () => {
    const { revisions } = rowsToCollections([{ collection: 'roi', id: 'a', payload: { id: 'a' } }]);
    expect(revisions).toEqual({});
  });

  it('withExpectedRevisions: known rows carry their token, new puts must create', () => {
    const revs = { 'roi:a': '4' };
    const ops = withExpectedRevisions([
      { op: 'put', collection: 'roi', payload: { id: 'a' } },
      { op: 'put', collection: 'roi', payload: { id: 'new' } },
      { op: 'delete', collection: 'roi', id: 'a' },
      { op: 'delete', collection: 'roi', id: 'unknown' },
      { op: 'put', collection: 'roi', payload: { id: 'a' }, expectedRevision: '9' },
    ], revs);
    expect(ops.map((o) => o.expectedRevision)).toEqual(['4', '0', '4', undefined, '9']);
  });

  it('applyResultRevisions folds puts and drops deletes', () => {
    const next = applyResultRevisions({ 'roi:a': '1', 'upcoming:u': '2' }, [
      { collection: 'roi', id: 'a', revision: '2', deleted: false },
      { collection: 'upcoming', id: 'u', revision: null, deleted: true },
    ]);
    expect(next).toEqual({ 'roi:a': '2' });
  });
});

describe('seedOps', () => {
  it('reproduces the bundled order when applied to an empty store', () => {
    const bundled = {
      upcoming: [{ id: 'u1' }, { id: 'u2' }],
      roi: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }],
      propPicks: [{ id: 'p1' }],
      parlays: [],
    };
    const ops = seedOps(bundled);
    expect(ops.every((o) => o.expectedRevision === '0' && o.position === 'bottom')).toBe(true);
    expect(applyOpsLocally(emptyCollections(), ops)).toEqual(bundled);
  });
});
