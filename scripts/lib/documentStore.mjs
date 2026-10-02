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
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, chmodSync, renameSync, openSync, closeSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import {
  COLLECTIONS, applyOpsLocally, applyResultRevisions, withExpectedRevisions,
} from '../../src/data/documents/collections.mjs';
import { createDocumentsRepository } from '../../src/data/repositories/supabaseDocuments.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Where the four bundled data files (and the file-mode journal and lock) live.
// Overridable ONLY so tests can run the file backend against a scratch copy.
const DATA_ROOT = process.env.FM_DATA_ROOT ? resolve(process.env.FM_DATA_ROOT) : ROOT;
export const SLUG = process.env.FM_WORKSPACE_SLUG || 'fightmetrics';

export const DATA_FILES = Object.freeze({
  upcoming: { path: resolve(DATA_ROOT, 'src/upcomingData.js'), decl: 'export const UPCOMING_ENTRIES = ' },
  roi: { path: resolve(DATA_ROOT, 'src/roiData.js'), decl: 'export const ROI_ENTRIES = ' },
  propPicks: { path: resolve(DATA_ROOT, 'src/propPicksData.js'), decl: 'export const PROP_PICKS = ' },
  parlays: { path: resolve(DATA_ROOT, 'src/parlayData.js'), decl: 'export const PARLAY_ENTRIES = ' },
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

const renderDataFile = (key, entries) =>
  `${splitDataFile(key).header}${DATA_FILES[key].decl}${JSON.stringify(entries, null, 2)};\n`;

export function writeDataFile(key, entries) {
  writeFileSync(DATA_FILES[key].path, renderDataFile(key, entries));
}

function stageDataFile(key, entries) {
  const tmp = `${DATA_FILES[key].path}.tmp-${process.pid}`;
  writeFileSync(tmp, renderDataFile(key, entries));
  return tmp;
}

export function readBundled() {
  return Object.fromEntries(COLLECTIONS.map((k) => [k, readDataFile(k)]));
}

// ── file-mode write protocol: lock + roll-forward journal ───────────────────
// A grade touches two files, and two renames are not one atomic step. So:
// every changed file is fully staged first; then a journal naming the staged
// files is written (itself atomically, by rename); then the renames run; then
// the journal is removed. A crash anywhere after the journal exists leaves it
// behind, and the next file-mode command finishes the renames before doing
// anything else -- the write rolls FORWARD, it is never left half-applied.
// A lock file keeps two file-mode commands from interleaving. It records its
// holder's pid, so a lock left behind by a KILLED process (whose `finally`
// never ran) is recognized as abandoned and cleared -- recovery then proceeds
// on its own instead of needing someone to delete the lock by hand.
const JOURNAL = resolve(DATA_ROOT, '.fm-store-journal.json');
const LOCK = resolve(DATA_ROOT, '.fm-store.lock');

const isAlive = (pid) => {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
};

function acquireLock() {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const fd = openSync(LOCK, 'wx');
      writeFileSync(fd, String(process.pid));
      return fd;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const holder = Number(String(existsSync(LOCK) ? readFileSync(LOCK, 'utf8') : '').trim());
      if (Number.isInteger(holder) && holder > 0 && isAlive(holder)) {
        throw new Error(`another file-mode write is in progress (pid ${holder})`);
      }
      // Abandoned (holder dead, or an unreadable/empty lock): clear and retry.
      console.error(`clearing an abandoned file-mode lock${holder ? ` (pid ${holder} is gone)` : ''}`);
      rmSync(LOCK, { force: true });
    }
  }
  throw new Error(`could not acquire ${LOCK}`);
}

function withFileLock(fn) {
  const fd = acquireLock();
  try {
    return fn();
  } finally {
    closeSync(fd);
    rmSync(LOCK, { force: true });
  }
}

function recoverJournal() {
  if (!existsSync(JOURNAL)) return;
  const { files } = JSON.parse(readFileSync(JOURNAL, 'utf8'));
  for (const { tmp, dest } of files) if (existsSync(tmp)) renameSync(tmp, dest);
  rmSync(JOURNAL);
  console.error('recovered an interrupted file-mode write (completed its pending renames)');
}

function commitFiles(staged) {
  const files = staged.map(([k, tmp]) => ({ tmp, dest: DATA_FILES[k].path }));
  writeFileSync(`${JOURNAL}.tmp`, JSON.stringify({ files }));
  renameSync(`${JOURNAL}.tmp`, JOURNAL);
  files.forEach(({ tmp, dest }, i) => {
    renameSync(tmp, dest);
    // Test hook: die between renames, exactly like a crash would.
    if (i === 0 && process.env.FM_TEST_KILL_AFTER_FIRST_RENAME === '1') process.kill(process.pid, 'SIGKILL');
  });
  rmSync(JOURNAL);
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

/**
 * Read the PUBLIC copy -- no session needed (the snapshot workflow uses it).
 * Complete or it throws: never a silently truncated export.
 */
export async function loadPublic(config) {
  const client = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await createDocumentsRepository({ client, slug: SLUG }).load({ member: false });
  if (!result.ok) throw new Error(`public read failed: ${describe(result.error)}`);
  if (!result.data.initialized) throw new Error(`workspace "${SLUG}" has never been seeded`);
  return result.data.collections;
}

// Session lives OUTSIDE the repository, readable only by this user.
export function sessionPath(url) {
  const host = new URL(url).host.replace(/[^a-z0-9.-]/gi, '_');
  return join(homedir(), '.config', 'fightmetrics', `session-${host}.json`);
}

function fileStorage(path) {
  const read = () => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {});
  // Atomic replace: a crash or a concurrent refresh can never leave a
  // half-written session file behind.
  const write = (obj) => {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const tmp = `${path}.tmp-${process.pid}`;
    writeFileSync(tmp, JSON.stringify(obj), { mode: 0o600 });
    chmodSync(tmp, 0o600);
    renameSync(tmp, path);
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
  error?.code === 'incompleteRead'
    ? 'could not read every document -- not signed in as a member (node scripts/fm-store.mjs whoami), or the data kept changing'
    : error?.kind === 'conflict'
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
      async load() { return withFileLock(() => { recoverJournal(); return readBundled(); }); },
      async apply(ops) {
        return withFileLock(() => {
          recoverJournal();
          const before = readBundled();
          const after = applyOpsLocally(before, ops);
          const changed = COLLECTIONS.filter((k) => after[k] !== before[k]);
          commitFiles(changed.map((k) => [k, stageDataFile(k, after[k])]));
          return after;
        });
      },
    };
  }

  const client = scriptClient(config);
  const repo = createDocumentsRepository({ client, slug: SLUG });
  let revisions = {};
  let loaded = null;

  async function load() {
    // A stored session is refreshed here if it expired.
    if (!process.env.FM_ACCESS_TOKEN) await client.auth.getSession();
    const result = await repo.load({ member: true });
    if (!result.ok) throw new Error(`load failed: ${describe(result.error)}`);
    if (!result.data.initialized) {
      throw new Error(`workspace "${SLUG}" has never been seeded (node scripts/fm-store.mjs seed)`);
    }
    revisions = result.data.revisions;
    loaded = result.data.collections;
    return loaded;
  }

  async function apply(ops) {
    if (!loaded) await load();
    const result = await repo.apply(withExpectedRevisions(ops, revisions));
    if (!result.ok) {
      const outcome = ['conflict', 'unauthenticated', 'forbidden', 'validation'].includes(result.error?.kind)
        ? 'write refused'
        : 'write outcome UNKNOWN (it may have landed) -- run `node scripts/fm-store.mjs status` / re-list before retrying';
      throw new Error(`${outcome}: ${describe(result.error)}`);
    }
    // Fold the new revisions in, so a second apply through this same store
    // carries current tokens instead of stale ones.
    revisions = applyResultRevisions(revisions, result.data);
    loaded = applyOpsLocally(loaded, ops);
    return { collections: loaded, results: result.data };
  }

  return {
    backend: 'supabase',
    describeTarget: `Supabase ${new URL(config.url).host} workspace "${SLUG}"`,
    load,
    apply,
    client,
    repo,
  };
}
