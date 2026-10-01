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

const STALE_RE = /stale_write revision=(\d+)/;

export function mapDocumentError(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  const stale = error?.code === 'P0001' ? STALE_RE.exec(message) : null;
  if (stale) return { kind: 'conflict', currentRevision: stale[1] };
  // mapPostgrestError returns a Result ({ ok:false, error }); callers here
  // want the bare RepositoryError.
  const mapped = mapPostgrestError(error);
  return mapped?.error ?? mapped;
}

/**
 * `member` selects the surface: members read fm_member_documents (with
 * revision tokens), everyone else the public fm_read_documents.
 */
export function createDocumentsRepository({ client, slug = DEFAULT_WORKSPACE_SLUG }) {
  if (!client?.rpc) throw new Error('createDocumentsRepository requires a Supabase client');

  async function load({ member }) {
    try {
      const fn = member ? 'fm_member_documents' : 'fm_read_documents';
      const { data, error } = await client.rpc(fn, { p_slug: slug });
      if (error) return { ok: false, error: mapDocumentError(error) };
      return { ok: true, data: rowsToCollections(data) };
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

  return { load, apply, slug };
}
