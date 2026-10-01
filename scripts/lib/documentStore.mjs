// Document store access for command-line tools (/enter-card, /grade-card,
// fm-store). Two backends behind one interface:
//
//   supabase  when .env.local (or the environment) sets FM_SUPABASE_URL and
//             FM_SUPABASE_PUBLISHABLE_KEY. These are deliberately NOT the
//             VITE_ names: Vite exposes only VITE_* to the app, so putting
//             production values here never points `npm run dev` at production.
//             (The VITE_ names are still accepted as a fallback.) Reads the member surface and
//             writes through fm_rpc_apply_documents as the signed-in owner
//             (session from `node scripts/fm-store.mjs login`).
//   files     the bundled src/*Data.js snapshot -- the pre-Supabase behaviour.
//             Forced with --files or FM_STORE=files.
//
// Both return the same collections and accept the same ops, and both apply
// ops with collections.mjs semantics, so a script cannot tell them apart
// except by where the change lands.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import {
  COLLECTIONS, applyOpsLocally, rowsToCollections, withExpectedRevisions,
} from '../../src/data/documents/collections.mjs';
import { mapDocumentError } from '../../src/data/repositories/supabaseDocuments.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SLUG = process.env.FM_WORKSPACE_SLUG || 'fightmetrics';

export const DATA_FILES = Object.freeze({
  upcoming: { path: resolve(ROOT, 'src/upcomingData.js'), decl: 'export const UPCOMING_ENTRIES = ' },
  roi: { path: resolve(ROOT, 'src/roiData.js'), decl: 'export const ROI_ENTRIES = ' },
  propPicks: { path: resolve(ROOT, 'src/propPicksData.js'), decl: 'export const PROP_PICKS = ' },
  parlays: { path: resolve(ROOT, 'src/parlayData.js'), decl: 'export const PARLAY_ENTRIES = ' },
});

// ── bundled files ───────────────────────────────────────────────────────────
// The four data files are `<decl><JSON>;\n`, optionally preceded by a comment
// header (prop/parlay files carry one). The header is preserved on write.
function splitDataFile(key) {
  const { path, decl } = DATA_FILES[key];
  const raw = readFileSync(path, 'utf8');
  const at = raw.indexOf(decl);
  if (at < 0) throw new Error(`${path}: expected ${decl.trim()}`);
  return { header: raw.slice(0, at), body: raw.slice(at + decl.length).replace(/;\s*$/, '') };
}

export function readDataFile(key) {
  return JSON.parse(splitDataFile(key).body);
}

export function writeDataFile(key, entries) {
  const { path, decl } = DATA_FILES[key];
  const { header } = splitDataFile(key);
  writeFileSync(path, `${header}${decl}${JSON.stringify(entries, null, 2)};\n`);
}

export function readBundled() {
  return Object.fromEntries(COLLECTIONS.map((k) => [k, readDataFile(k)]));
}

// ── configuration ───────────────────────────────────────────────────────────
function readEnvLocal() {
  const out = {};
  const p = resolve(ROOT, '.env.local');
  if (!existsSync(p)) return out;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

export function supabaseConfig() {
  const file = readEnvLocal();
  const pick = (name) => process.env[`FM_${name}`] || file[`FM_${name}`]
    || process.env[`VITE_${name}`] || file[`VITE_${name}`];
  const url = pick('SUPABASE_URL');
  const key = pick('SUPABASE_PUBLISHABLE_KEY');
  return url && key ? { url, key } : null;
}

/** Read the PUBLIC copy -- no session needed (the snapshot workflow uses it). */
export async function loadPublic(config) {
  const client = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.rpc('fm_read_documents', { p_slug: SLUG });
  if (error) throw new Error(`public read failed: ${describe(mapDocumentError(error))}`);
  if (!data.length) throw new Error(`workspace "${SLUG}" has no public documents`);
  return rowsToCollections(data).collections;
}

// Session lives OUTSIDE the repository, readable only by this user.
export function sessionPath(url) {
  const host = new URL(url).host.replace(/[^a-z0-9.-]/gi, '_');
  return join(homedir(), '.config', 'fightmetrics', `session-${host}.json`);
}

function fileStorage(path) {
  const read = () => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {});
  const write = (obj) => {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    writeFileSync(path, JSON.stringify(obj), { mode: 0o600 });
    chmodSync(path, 0o600);
  };
  return {
    getItem: (k) => read()[k] ?? null,
    setItem: (k, v) => write({ ...read(), [k]: v }),
    removeItem: (k) => { const o = read(); delete o[k]; write(o); },
  };
}

export function clearSession(url) {
  const p = sessionPath(url);
  if (existsSync(p)) rmSync(p);
}

/**
 * A Supabase client for scripts. FM_ACCESS_TOKEN (tests, CI) bypasses the
 * stored session entirely.
 */
export function scriptClient(config) {
  const token = process.env.FM_ACCESS_TOKEN;
  return createClient(config.url, config.key, {
    auth: {
      flowType: 'pkce',
      persistSession: !token,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: token ? undefined : fileStorage(sessionPath(config.url)),
    },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
}

// ── the store ───────────────────────────────────────────────────────────────
const describe = (error) =>
  error?.kind === 'conflict'
    ? 'changed since it was read (stale revision) -- re-run'
    : error?.kind === 'unauthenticated'
      ? 'not signed in -- run: node scripts/fm-store.mjs login <email>'
      : error?.kind === 'forbidden'
        ? 'not signed in, or not an owner/editor -- run: node scripts/fm-store.mjs whoami'
        : `${error?.kind ?? 'error'}${error?.message ? `: ${error.message}` : ''}`;

/**
 * `argv` is scanned for --files. Returns
 *   { backend, describeTarget, load() -> collections, apply(ops) }
 */
export async function openStore({ argv = process.argv } = {}) {
  const forceFiles = argv.includes('--files') || process.env.FM_STORE === 'files';
  const config = forceFiles ? null : supabaseConfig();

  if (!config) {
    return {
      backend: 'files',
      describeTarget: 'src/*Data.js (bundled files)',
      async load() { return readBundled(); },
      async apply(ops) {
        const before = readBundled();
        const after = applyOpsLocally(before, ops);
        for (const k of COLLECTIONS) if (after[k] !== before[k]) writeDataFile(k, after[k]);
        return after;
      },
    };
  }

  const client = scriptClient(config);
  let revisions = {};
  let loaded = null;

  async function load() {
    // A stored session is refreshed here if it expired.
    if (!process.env.FM_ACCESS_TOKEN) await client.auth.getSession();
    const { data, error } = await client.rpc('fm_member_documents', { p_slug: SLUG });
    if (error) throw new Error(`load failed: ${describe(mapDocumentError(error))}`);
    const result = rowsToCollections(data);
    revisions = result.revisions;
    loaded = result.collections;
    if (!data.length) {
      throw new Error(
        `no documents visible in workspace "${SLUG}" -- either it is not seeded ` +
        '(node scripts/fm-store.mjs seed) or you are not signed in as a member ' +
        '(node scripts/fm-store.mjs login <email>)'
      );
    }
    return loaded;
  }

  async function apply(ops) {
    if (!loaded) await load();
    const { data, error } = await client.rpc('fm_rpc_apply_documents', {
      p_slug: SLUG, p_ops: withExpectedRevisions(ops, revisions),
    });
    if (error) throw new Error(`write refused: ${describe(mapDocumentError(error))}`);
    loaded = applyOpsLocally(loaded, ops);
    return { collections: loaded, results: data };
  }

  return {
    backend: 'supabase',
    describeTarget: `Supabase ${new URL(config.url).host} workspace "${SLUG}"`,
    load,
    apply,
    client,
  };
}
