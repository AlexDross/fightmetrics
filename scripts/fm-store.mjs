#!/usr/bin/env node
// FightMetrics document store — owner command line.
//
//   node scripts/fm-store.mjs login <email>   magic link; session saved to ~/.config/fightmetrics
//   node scripts/fm-store.mjs whoami          session + workspace role
//   node scripts/fm-store.mjs claim           claim the (owner-less) workspace as this user
//   node scripts/fm-store.mjs status          document counts on the server vs the bundled files
//   node scripts/fm-store.mjs seed            load the bundled files into an EMPTY workspace
//   node scripts/fm-store.mjs export [--write-files] [--public]
//                                             print the server's collections as JSON, or
//                                             overwrite src/*Data.js with them (refresh the
//                                             bundled snapshot / rollback copy).
//                                             --public reads the public copy, no login.
//   node scripts/fm-store.mjs login <email> --create
//                                             first login only: also creates the account
//   node scripts/fm-store.mjs logout
//
// Reads FM_SUPABASE_URL / FM_SUPABASE_PUBLISHABLE_KEY from .env.local.
// Uses only the publishable key and the owner's own session: no service-role
// key exists anywhere in this tool, and every write is checked by RLS and
// fm_rpc_apply_documents exactly as a write from the app is.
import { createServer } from 'node:http';
import {
  SLUG, clearSession, loadPublic, openStore, readBundled, scriptClient, sessionPath, supabaseConfig, writeDataFile,
} from './lib/documentStore.mjs';
import { COLLECTIONS, seedOps } from '../src/data/documents/collections.mjs';

const CALLBACK_PORT = Number(process.env.FM_CALLBACK_PORT || 54399);
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

const die = (msg) => { console.error(msg); process.exit(1); };
const counts = (c) => COLLECTIONS.map((k) => `${k} ${c[k].length}`).join(' | ');

function requireConfig() {
  const config = supabaseConfig();
  if (!config) die('Supabase is not configured: set FM_SUPABASE_URL and FM_SUPABASE_PUBLISHABLE_KEY in .env.local');
  return config;
}

async function login(email, { create = false } = {}) {
  if (!email) die('usage: fm-store.mjs login <email>');
  const config = requireConfig();
  const client = scriptClient(config);

  // Listen BEFORE sending, so a fast click cannot beat the server.
  const code = new Promise((resolveCode, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, CALLBACK_URL);
      if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
      const c = url.searchParams.get('code');
      const err = url.searchParams.get('error_description') || url.searchParams.get('error');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(c
        ? '<p style="font-family:sans-serif">FightMetrics CLI signed in. You can close this tab.</p>'
        : `<p style="font-family:sans-serif">Sign-in failed: ${String(err ?? 'no code').replace(/</g, '&lt;')}</p>`);
      server.close();
      if (c) resolveCode(c); else reject(new Error(err ?? 'callback carried no code'));
    });
    server.on('error', reject);
    server.listen(CALLBACK_PORT, '127.0.0.1');
    setTimeout(() => { server.close(); reject(new Error('timed out after 10 minutes')); }, 600_000).unref();
  });

  const { error } = await client.auth.signInWithOtp({
    email,
    // The app never creates users; the very first owner login may (--create),
    // while sign-ups are still enabled on the project.
    options: { emailRedirectTo: CALLBACK_URL, shouldCreateUser: create },
  });
  if (error) die(`could not send the link: ${error.message}`);
  console.log(`Magic link sent to ${email}. Open it on THIS computer; waiting on ${CALLBACK_URL} ...`);

  const authCode = await code.catch((e) => die(`sign-in failed: ${e.message}`));
  const { data, error: exchangeError } = await client.auth.exchangeCodeForSession(authCode);
  if (exchangeError) die(`sign-in failed: ${exchangeError.message}`);
  console.log(`Signed in as ${data.user.email}. Session saved to ${sessionPath(config.url)}`);
  await whoami(client);
}

async function whoami(existing) {
  const config = requireConfig();
  const client = existing ?? scriptClient(config);
  if (!process.env.FM_ACCESS_TOKEN) {
    const { data } = await client.auth.getSession();
    if (!data.session) die('not signed in -- run: node scripts/fm-store.mjs login <email>');
    console.log(`session: ${data.session.user.email}`);
  }
  const { data, error } = await client.rpc('fm_member_whoami', { p_slug: SLUG });
  if (error) die(`whoami failed: ${error.message}`);
  const role = data?.[0]?.role ?? null;
  console.log(`workspace "${SLUG}": ${role ?? 'not a member'}`);
  return role;
}

async function claim() {
  const client = scriptClient(requireConfig());
  const { data, error } = await client.rpc('fm_rpc_claim_workspace_ownership', { p_slug: SLUG });
  if (error) die(`claim failed: ${error.message}`);
  console.log(`claimed "${SLUG}": ${data?.[0]?.role}`);
}

async function status() {
  const store = await openStore();
  const bundled = readBundled();
  console.log(`bundled files : ${counts(bundled)}`);
  if (store.backend !== 'supabase') return;
  try {
    console.log(`server        : ${counts(await store.load())}`);
  } catch (e) {
    console.log(`server        : ${e.message}`);
  }
}

async function seed() {
  const store = await openStore();
  if (store.backend !== 'supabase') die('seed needs Supabase configured in .env.local');
  const st = await store.repo.status();
  if (!st.ok) die(`cannot read workspace status: ${st.error.kind}`);
  // An INITIALIZED workspace is never re-seeded, even when empty: it was
  // emptied deliberately, and re-seeding would resurrect the old snapshot.
  if (st.data.initialized || st.data.count > 0) {
    die(`refusing: workspace "${SLUG}" is already initialized (${st.data.count} documents)`);
  }
  const bundled = readBundled();
  const ops = seedOps(bundled);
  // One batch: the seed lands completely or not at all.
  const result = await store.repo.apply(ops);
  if (!result.ok) die(`seed failed, nothing written: ${result.error.kind}${result.error.message ? ` ${result.error.message}` : ''}`);
  console.log(`seeded ${result.data.length} documents into "${SLUG}" (${counts(bundled)})`);
}

async function exportCmd(writeFiles, { publicCopy = false } = {}) {
  let collections;
  if (publicCopy) {
    collections = await loadPublic(requireConfig()).catch((e) => die(e.message));
  } else {
    const store = await openStore();
    if (store.backend !== 'supabase') die('export needs Supabase configured in .env.local');
    collections = await store.load();
  }
  if (!writeFiles) { process.stdout.write(`${JSON.stringify(collections, null, 2)}\n`); return; }
  for (const k of COLLECTIONS) writeDataFile(k, collections[k]);
  console.log(`wrote src/*Data.js from the server (${counts(collections)})`);
}

const [cmd, ...rest] = process.argv.slice(2);
const run = {
  login: () => login(rest.find((a) => !a.startsWith('--')), { create: rest.includes('--create') }),
  whoami: () => whoami(),
  claim,
  status,
  seed,
  export: () => exportCmd(rest.includes('--write-files'), { publicCopy: rest.includes('--public') }),
  logout: async () => { clearSession(requireConfig().url); console.log('signed out (local session removed)'); },
}[cmd];
if (!run) die('usage: fm-store.mjs login <email> | whoami | claim | status | seed | export [--write-files] | logout');
await run();
