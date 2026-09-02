// Stage 7 Gate 4 — Supabase configuration, validated before any client exists.
//
// ONLY two variables are accepted, both public by design and both safe to ship
// in a browser bundle:
//
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY
//
// Nothing else is read. A database password, JWT secret, service-role/secret
// key, personal access token or Postgres URL has no name here to be read from,
// and the key classifier below actively REJECTS them if one is pasted into the
// publishable slot — the common misconfiguration, and the one that would ship a
// server credential to every visitor.
//
// Configuration is ALL-OR-NONE. Half a configuration is not a degraded mode, it
// is a mistake: a URL with no key produces a client that fails every request
// with an opaque 401, which reads as "the server is broken" rather than "you
// forgot a variable". So one-of-two is `invalid`, never `configured`.
//
// .mjs, like the rest of src/data — see src/data/schemas/__tests__/tailwindScoping.test.mjs.

/** The complete set of variables this application reads. Frozen and exhaustive. */
export const SUPABASE_ENV_KEYS = Object.freeze([
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
]);

/**
 * Names that must NEVER be read from the environment by client code. Not a
 * blocklist the loader consults — it reads only the two keys above — but an
 * asserted list, so a test can prove none of them is referenced.
 */
export const FORBIDDEN_ENV_KEYS = Object.freeze([
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'VITE_SUPABASE_SECRET_KEY',
  'VITE_SUPABASE_JWT_SECRET',
  'VITE_SUPABASE_DB_URL',
  'VITE_SUPABASE_DB_PASSWORD',
  'VITE_SUPABASE_ACCESS_TOKEN',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_JWT_SECRET',
  'SUPABASE_DB_URL',
  'SUPABASE_ACCESS_TOKEN',
  'DATABASE_URL',
]);

export const CONFIG_STATUS = Object.freeze({
  DISABLED: 'disabled',
  CONFIGURED: 'configured',
  INVALID: 'invalid',
});

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

/**
 * URL validation. Deliberately strict, because every rejection here is a
 * misconfiguration that would otherwise surface as a runtime network failure:
 *
 *  - must parse at all;
 *  - http/https only (no `postgres:`, which is how a connection string gets
 *    pasted into the wrong variable);
 *  - no userinfo — `https://user:pass@host` embeds a credential in something we
 *    are about to hand to a browser;
 *  - no query or fragment, which would be silently dropped by the client and
 *    make the configured value differ from the effective one.
 */
export function validateSupabaseUrl(raw) {
  if (!isNonEmptyString(raw)) return { ok: false, code: 'missing' };
  const value = raw.trim();
  let url;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, code: 'malformedUrl' };
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, code: 'unsupportedProtocol' };
  }
  if (url.username !== '' || url.password !== '') {
    return { ok: false, code: 'credentialsInUrl' };
  }
  if (url.search !== '' || url.hash !== '') {
    return { ok: false, code: 'urlHasQueryOrFragment' };
  }
  // Trailing slash normalised away so two spellings of the same project produce
  // one configuration.
  return { ok: true, value: value.replace(/\/+$/, '') };
}

const base64UrlDecode = (segment) => {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  // eslint-disable-next-line no-undef -- atob is a browser and Node 18+ global
  return atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
};

/** The `role` claim of a JWT, or null when the token is not a readable JWT. */
export function jwtRole(token) {
  const parts = typeof token === 'string' ? token.split('.') : [];
  if (parts.length !== 3) return null;
  try {
    const claims = JSON.parse(base64UrlDecode(parts[1]));
    return typeof claims?.role === 'string' ? claims.role : null;
  } catch {
    return null;
  }
}

/**
 * Classify the publishable key, accepting only the two public forms and
 * rejecting server-only material by shape.
 *
 * Accepted:
 *   `sb_publishable_<suffix>` — the current public key format
 *   a JWT whose `role` claim is `anon` — the legacy anon key, still what the
 *   local stack mints
 *
 * Rejected, each with a distinct code so the diagnostic can say WHICH kind of
 * secret was pasted without ever echoing the value:
 *   `sb_secret_…`   secret key
 *   `sbp_…`         Supabase personal access token
 *   `postgres(ql)://…` a database connection string
 *   a JWT with role `service_role` — the single most dangerous paste
 *   a `sb_publishable_` PREFIX with no valid suffix — see below
 */

/**
 * FULL match, not a prefix test.
 *
 * A `startsWith('sb_publishable_')` check accepted the bare prefix, a prefix
 * followed by whitespace, and a prefix followed by punctuation or non-ASCII
 * text — none of which is a key, and each of which would be handed to the SDK
 * to fail later as an opaque 401. The suffix must exist and must be URL-safe
 * ASCII, which is the alphabet Supabase actually issues.
 *
 * The LENGTH is deliberately not pinned: it is not a documented contract and a
 * future issuer change would reject every valid key for no security gain.
 */
const PUBLISHABLE_KEY_RE = /^sb_publishable_[A-Za-z0-9_-]+$/;

export function classifyPublishableKey(raw) {
  if (!isNonEmptyString(raw)) return { ok: false, code: 'missing' };
  const value = raw.trim();
  if (/^postgres(ql)?:\/\//i.test(value)) return { ok: false, code: 'databaseUrlSupplied' };
  if (value.startsWith('sb_secret_')) return { ok: false, code: 'secretKeySupplied' };
  if (value.startsWith('sbp_')) return { ok: false, code: 'accessTokenSupplied' };
  if (value.startsWith('sb_publishable_')) {
    return PUBLISHABLE_KEY_RE.test(value)
      ? { ok: true, value, form: 'publishableKey' }
      : { ok: false, code: 'malformedPublishableKey' };
  }
  const role = jwtRole(value);
  if (role === 'anon') return { ok: true, value, form: 'anonJwt' };
  if (role === 'service_role') return { ok: false, code: 'serviceRoleKeySupplied' };
  if (role !== null) return { ok: false, code: 'unexpectedJwtRole' };
  return { ok: false, code: 'unrecognisedKeyFormat' };
}

/**
 * Read and validate configuration from an env-like object.
 *
 * Returns exactly one of:
 *   { status:'disabled' }                        — neither variable set
 *   { status:'configured', url, publishableKey, keyForm }
 *   { status:'invalid', issues:[{ key, code }] } — partial or malformed
 *
 * `issues` carries KEY NAMES and REASON CODES only. No value is ever included,
 * so the diagnostic is safe to render, log and screenshot.
 */
export function readSupabaseConfig(env) {
  const source = env ?? {};
  const rawUrl = source.VITE_SUPABASE_URL;
  const rawKey = source.VITE_SUPABASE_PUBLISHABLE_KEY;

  const urlPresent = isNonEmptyString(rawUrl);
  const keyPresent = isNonEmptyString(rawKey);

  if (!urlPresent && !keyPresent) return { status: CONFIG_STATUS.DISABLED };

  const issues = [];
  if (!urlPresent) issues.push({ key: 'VITE_SUPABASE_URL', code: 'missing' });
  if (!keyPresent) issues.push({ key: 'VITE_SUPABASE_PUBLISHABLE_KEY', code: 'missing' });
  if (issues.length > 0) return { status: CONFIG_STATUS.INVALID, issues };

  const url = validateSupabaseUrl(rawUrl);
  const key = classifyPublishableKey(rawKey);
  if (!url.ok) issues.push({ key: 'VITE_SUPABASE_URL', code: url.code });
  if (!key.ok) issues.push({ key: 'VITE_SUPABASE_PUBLISHABLE_KEY', code: key.code });
  if (issues.length > 0) return { status: CONFIG_STATUS.INVALID, issues };

  return {
    status: CONFIG_STATUS.CONFIGURED,
    url: url.value,
    publishableKey: key.value,
    keyForm: key.form,
  };
}

/** Human-readable, value-free diagnostic for an `invalid` configuration. */
export function describeConfigIssues(issues) {
  return (issues ?? []).map(({ key, code }) => `${key}: ${code}`).join('; ');
}
