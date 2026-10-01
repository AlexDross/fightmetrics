// Document store — the pure half.
//
// The app's four collections, and the one function that applies a batch of
// document ops to them. The same ops go to fm_rpc_apply_documents, so this is
// the local mirror of the server semantics:
//
//   put    replaces an existing object IN PLACE (an update keeps its position),
//          otherwise inserts at the top (default) or bottom;
//   delete removes by id; deleting a missing id is a no-op.
//
// No I/O, no clock. Unconfigured builds run on this alone, so local-only
// editing behaves exactly as it did before persistence existed.

export const COLLECTIONS = Object.freeze(['upcoming', 'roi', 'propPicks', 'parlays']);

const revKey = (collection, id) => `${collection}:${id}`;

export function emptyCollections() {
  return { upcoming: [], roi: [], propPicks: [], parlays: [] };
}

/** Rows from fm_read_documents / fm_member_documents -> collections + revisions. */
export function rowsToCollections(rows) {
  const collections = emptyCollections();
  const revisions = {};
  for (const row of rows ?? []) {
    if (!COLLECTIONS.includes(row.collection)) continue;
    collections[row.collection].push(row.payload);
    if (row.revision != null) revisions[revKey(row.collection, row.id)] = String(row.revision);
  }
  return { collections, revisions };
}

export function revisionOf(revisions, collection, id) {
  return revisions?.[revKey(collection, String(id))] ?? null;
}

/** Fold fm_rpc_apply_documents result rows into the revision map. */
export function applyResultRevisions(revisions, results) {
  const next = { ...revisions };
  for (const r of results ?? []) {
    const key = revKey(r.collection, r.id);
    if (r.deleted) delete next[key];
    else next[key] = String(r.revision);
  }
  return next;
}

function assertOp(op) {
  if (!op || !COLLECTIONS.includes(op.collection)) {
    throw new Error(`document op has unknown collection ${JSON.stringify(op?.collection)}`);
  }
  if (op.op === 'put') {
    if (!op.payload || typeof op.payload !== 'object' || op.payload.id == null) {
      throw new Error('put requires a payload with an id');
    }
  } else if (op.op === 'delete') {
    if (op.id == null) throw new Error('delete requires an id');
  } else {
    throw new Error(`unknown document op ${JSON.stringify(op.op)}`);
  }
}

/** Apply ops to collections, returning NEW arrays only for collections touched. */
export function applyOpsLocally(collections, ops) {
  const next = { ...collections };
  for (const op of ops) {
    assertOp(op);
    const list = next[op.collection] ?? [];
    if (op.op === 'delete') {
      next[op.collection] = list.filter((x) => String(x.id) !== String(op.id));
      continue;
    }
    const id = String(op.payload.id);
    const idx = list.findIndex((x) => String(x.id) === id);
    if (idx >= 0) {
      const copy = list.slice();
      copy[idx] = op.payload;
      next[op.collection] = copy;
    } else {
      next[op.collection] = op.position === 'bottom' ? [...list, op.payload] : [op.payload, ...list];
    }
  }
  return next;
}

/** Attach current revision tokens so the server rejects a stale write. */
export function withExpectedRevisions(ops, revisions) {
  return ops.map((op) => {
    if (op.expectedRevision !== undefined) return op;
    const id = op.op === 'put' ? op.payload.id : op.id;
    const rev = revisionOf(revisions, op.collection, id);
    // Unknown locally: a put must create (0); a delete stays unconditional.
    if (rev === null) return op.op === 'put' ? { ...op, expectedRevision: '0' } : op;
    return { ...op, expectedRevision: rev };
  });
}

/**
 * The whole bundled dataset as seed ops, bottom-appended in display order so
 * the stored order equals the bundled order.
 */
export function seedOps(collections) {
  const ops = [];
  for (const collection of COLLECTIONS) {
    for (const payload of collections[collection] ?? []) {
      ops.push({ op: 'put', collection, payload, position: 'bottom', expectedRevision: '0' });
    }
  }
  return ops;
}
