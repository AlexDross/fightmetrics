// Stage 7 Gate 4 — the ONLY module in this repository that imports
// @supabase/supabase-js.
//
// Everything above it — the auth repository, the provider, the UI, src/App.js —
// sees a plain object and the repository contract. That is the boundary §8 of
// docs/STAGE_7_PLAN.md requires, and it is what makes the Gate 6 rewire a change
// of backing rather than a change of imports.
//
// No Realtime is configured, per §10.
import { createClient } from '@supabase/supabase-js';
import { CONFIG_STATUS, readSupabaseConfig } from './config.mjs';

/**
 * Auth options fixed by §10 of the plan. All three are load-bearing:
 *
 *  persistSession    a magic link is opened in a NEW tab from a mail client; the
 *                    session must survive that and every later reload.
 *  detectSessionInUrl the callback lands as a URL fragment; without this the
 *                    user returns signed out, having just proven who they are.
 *  autoRefreshToken  the access token is short-lived; without refresh a long
 *                    session silently degrades to `unauthenticated` mid-use.
 */
export const AUTH_OPTIONS = Object.freeze({
  persistSession: true,
  detectSessionInUrl: true,
  autoRefreshToken: true,
});

/**
 * Build a client from an already-VALIDATED configuration.
 *
 * Throws on anything other than a `configured` config rather than returning a
 * half-built client: a client constructed from a partial configuration is worse
 * than no client, because every failure it produces looks like a server fault.
 *
 * `deps.createClient` exists so tests can assert the exact options passed
 * without a network stack.
 */
export function createSupabaseClient(config, deps = {}) {
  if (!config || config.status !== CONFIG_STATUS.CONFIGURED) {
    throw new Error('createSupabaseClient requires a configured Supabase configuration');
  }
  const factory = deps.createClient ?? createClient;
  return factory(config.url, config.publishableKey, {
    auth: { ...AUTH_OPTIONS },
  });
}

/**
 * The single entry point the application uses.
 *
 * Returns `{ status, client, issues }` where `client` is null for every status
 * except `configured`. In particular the DISABLED path constructs nothing and
 * therefore issues no network request of any kind — that is the property the
 * unconfigured production build depends on.
 */
export function createSupabaseClientFromEnv(env, deps = {}) {
  const config = readSupabaseConfig(env);
  if (config.status === CONFIG_STATUS.DISABLED) {
    return { status: CONFIG_STATUS.DISABLED, client: null, config };
  }
  if (config.status === CONFIG_STATUS.INVALID) {
    return { status: CONFIG_STATUS.INVALID, client: null, config, issues: config.issues };
  }
  return {
    status: CONFIG_STATUS.CONFIGURED,
    client: createSupabaseClient(config, deps),
    config,
  };
}
