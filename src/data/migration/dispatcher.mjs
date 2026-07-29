// Stage 6 — migration dispatcher.
//
// Division of responsibility:
//   each migration accepts EXACTLY its declared source version and asserts it;
//   the DISPATCHER is the idempotent part — running it on already-current data
//   is a no-op. A v0->v1 function does not have to accept its own v1 output.
import { migrateV0ToV1 } from './migrateV0ToV1.mjs';
import { SCHEMA_VERSION, StoreSchema } from '../schemas/entities.mjs';

export const CURRENT_VERSION = SCHEMA_VERSION;

/** Ordered, forward-only. No `down`: rollback is restore-from-export. */
export const MIGRATIONS = Object.freeze([
  Object.freeze({ from: 0, to: 1, up: migrateV0ToV1 }),
]);

/** An unversioned legacy payload is version 0 by definition. */
export const versionOf = (payload) => payload?.meta?.schemaVersion ?? 0;

export class UnknownFutureVersionError extends Error {
  constructor(found, supported) {
    super(
      `store schema version ${found} is newer than this build supports (${supported}). ` +
      'Opened read-only: reads and export are available, writes and migrations are blocked.'
    );
    this.name = 'UnknownFutureVersionError';
    this.found = found;
    this.supported = supported;
    this.readOnly = true;
  }
}

/**
 * @param {object} payload  legacy bundle (v0) or an already-migrated store
 * @param {object} deps     { migratedAt, newId }
 * @returns {{ store, manifest, errors, applied: string[], alreadyCurrent: boolean }}
 */
export function migrateToCurrent(payload, deps) {
  const found = versionOf(payload);

  if (found > CURRENT_VERSION) {
    // Never best-effort. A newer build may have written fields this one would
    // drop on the next write.
    throw new UnknownFutureVersionError(found, CURRENT_VERSION);
  }

  if (found === CURRENT_VERSION) {
    // Idempotent no-op. This is the ONLY place that tolerates current data.
    return {
      store: payload,
      manifest: { migratedAt: payload?.meta?.migratedAt ?? null, unresolved: [], defaulted: [], generated: [], droppedFields: [], counts: {} },
      errors: [],
      applied: [],
      alreadyCurrent: true,
    };
  }

  let current = payload;
  let version = found;
  const applied = [];
  let manifest = null;
  let errors = [];

  for (const m of MIGRATIONS) {
    if (m.from !== version) continue;
    const out = m.up(current, deps);
    current = out.store;
    manifest = out.manifest;
    errors = errors.concat(out.errors);
    version = m.to;
    applied.push(`${m.from}->${m.to}`);
  }

  if (version !== CURRENT_VERSION) {
    throw new Error(`no migration path from version ${found} to ${CURRENT_VERSION}`);
  }

  return { store: current, manifest, errors, applied, alreadyCurrent: false };
}

/** Validate before and after; a failure aborts rather than half-writing. */
export function migrateAndValidate(payload, deps) {
  const result = migrateToCurrent(payload, deps);
  if (result.errors.length) {
    throw new Error(`migration aborted with ${result.errors.length} error(s):\n  ${result.errors.join('\n  ')}`);
  }
  const parsed = StoreSchema.safeParse(result.store);
  if (!parsed.success) {
    throw new Error(`migrated store failed validation: ${JSON.stringify(parsed.error.issues.slice(0, 5), null, 2)}`);
  }
  return result;
}
