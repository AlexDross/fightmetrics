// Document store — the transport half.
//
// Plain functions over an already-built Supabase client. Nothing Supabase-typed
// leaves this module: callers get collections, revision maps and
// RepositoryError-shaped failures, the same error vocabulary as supabaseAuth.
import { mapPostgrestError } from './supabaseAuth.mjs';
import { DEFAULT_WORKSPACE_SLUG } from './supabaseAuth.mjs';
import { rowsToCollections } from '../documents/collections.mjs';

// The RPC's own cap. "Clear ROI" is one batch so it stays atomic.
export const MAX_OPS_PER_BATCH = 1000;

// PostgREST caps every response at `max_rows` (1000 on hosted Supabase) and
// TRUNCATES SILENTLY beyond it. Reads therefore page, below that cap, and are
// checked against the server's own count before anything is trusted.
export const READ_PAGE_SIZE = 500;
const MAX_LOAD_ATTEMPTS = 3;

const STALE_RE = /stale_write revision=(\d+)/;

export function mapDocumentError(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  const stale = error?.code === 'P0001' ? STALE_RE.exec(message) : null;
  if (stale) return { kind: 'conflict', currentRevision: stale[1] };
  // A "must be new" insert that lost a race to the same id: the row exists
  // now, which is a conflict to re-read, not a malformed request.
  if (error?.code === '23505') return { kind: 'conflict', currentRevision: null };
  // mapPostgrestError returns a Result ({ ok:false, error }); callers here
  // want the bare RepositoryError.
  const mapped = mapPostgrestError(error);
  return mapped?.error ?? mapped;
}

/**
 * `member` selects the surface: members read fm_member_documents (with
 * revision tokens), everyone else the public fm_read_documents.
 */
export function createDocumentsRepository({ client, slug = DEFAULT_WORKSPACE_SLUG, pageSize = READ_PAGE_SIZE }) {
  if (!client?.rpc) throw new Error('createDocumentsRepository requires a Supabase client');

  /** `{ initialized, count }` for the workspace, as this caller may see it. */
  async function status() {
    try {
      const { data, error } = await client.rpc('fm_read_document_status', { p_slug: slug });
      if (error) return { ok: false, error: mapDocumentError(error) };
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return { ok: false, error: { kind: 'notFound' } };
      return { ok: true, data: { initialized: Boolean(row.initialized), count: Number(row.document_count) } };
    } catch (error) {
      return { ok: false, error: mapDocumentError(error) };
    }
  }

  async function readAllPages(fn) {
    const rows = [];
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await client.rpc(fn, { p_slug: slug }).range(from, from + pageSize - 1);
      if (error) return { ok: false, error: mapDocumentError(error) };
      rows.push(...(data ?? []));
      if (!data || data.length < pageSize) return { ok: true, data: rows };
    }
  }

  /**
   * A COMPLETE read or a failure -- never a silently partial one. The rows
   * must equal the server's document count taken before and after them; a
   * write landing in between makes them disagree, and the read is retried.
   */
  async function load({ member }) {
    try {
      const fn = member ? 'fm_member_documents' : 'fm_read_documents';
      for (let attempt = 1; attempt <= MAX_LOAD_ATTEMPTS; attempt += 1) {
        const before = await status();
        if (!before.ok) return before;
        const read = await readAllPages(fn);
        if (!read.ok) return read;
        const after = await status();
        if (!after.ok) return after;
        if (read.data.length === before.data.count && before.data.count === after.data.count) {
          return { ok: true, data: { ...rowsToCollections(read.data), initialized: after.data.initialized } };
        }
      }
      return {
        ok: false,
        error: { kind: 'server', code: 'incompleteRead', message: 'the document count did not match the rows read' },
      };
    } catch (error) {
      return { ok: false, error: mapDocumentError(error) };
    }
  }

  /** One atomic batch. Callers wanting atomicity must stay within the cap. */
  async function apply(ops) {
    if (!Array.isArray(ops) || ops.length === 0) return { ok: true, data: [] };
    if (ops.length > MAX_OPS_PER_BATCH) {
      return { ok: false, error: { kind: 'validation', message: `at most ${MAX_OPS_PER_BATCH} ops per batch` } };
    }
    try {
      const { data, error } = await client.rpc('fm_rpc_apply_documents', { p_slug: slug, p_ops: ops });
      if (error) return { ok: false, error: mapDocumentError(error) };
      return { ok: true, data: data ?? [] };
    } catch (error) {
      return { ok: false, error: mapDocumentError(error) };
    }
  }

  return { load, apply, status, slug };
}
