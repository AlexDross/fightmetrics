// Stage 7 Gate 4 — the Supabase-backed authRepository.
//
// Conforms EXACTLY to REPOSITORY_CONTRACT.authRepository: five methods, arities
// 0/0/1/0/0, and no sixth enumerable key — `conformsToContract` rejects extras,
// which is what keeps the Gate 6 swap honest.
//
// This module does not import @supabase/supabase-js. It takes a client, so every
// test below runs against a fake and the real client is injected once, at the
// edge, by the provider.
import {
  ok, offline, unauthenticated, forbidden, notFound, validation, server,
  errorFromSqlState,
} from './types.mjs';

/** The workspace this deployment reads and claims. §1: immutable, lowercase. */
export const DEFAULT_WORKSPACE_SLUG = 'fightmetrics';

// Deliberately permissive but non-empty: the authoritative check is the mail
// that either arrives or does not. A stricter regex here rejects valid
// addresses and teaches nothing.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Scrub anything credential-shaped out of a message before it can reach a UI,
 * a log or a screenshot.
 *
 * A transport error can quote a request URL, an `Authorization` header or a
 * whole response body. None of that may escape, so JWTs, publishable/secret
 * keys and Postgres URLs are replaced by a marker rather than truncated —
 * truncation leaves a usable prefix.
 */
export function scrubMessage(message) {
  if (typeof message !== 'string') return '';
  return message
    .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[redacted-jwt]')
    .replace(/sb_(secret|publishable)_[A-Za-z0-9_-]+/g, '[redacted-key]')
    .replace(/sbp_[A-Za-z0-9]+/g, '[redacted-token]')
    .replace(/postgres(ql)?:\/\/[^\s"']+/gi, '[redacted-database-url]')
    .slice(0, 300);
}

const isNetworkFailure = (error) => {
  if (!error) return false;
  const name = typeof error.name === 'string' ? error.name : '';
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  return name === 'TypeError'
    || name === 'AbortError'
    || message.includes('failed to fetch')
    || message.includes('networkerror')
    || message.includes('network request failed')
    || message.includes('fetch failed');
};

/**
 * PostgREST's own JWT error codes — its `PGRST3xx` family, which is NOT a
 * SQLSTATE and does not always arrive with an HTTP status attached to the SDK
 * error object. PostgREST's documented meanings:
 *
 *   PGRST301  the provided JWT could not be decoded, or is invalid
 *   PGRST302  the request carries no bearer authentication while anonymous
 *             access is disabled
 *   PGRST303  JWT claims validation or parsing failed — the EXPIRED JWT observed
 *             against the local stack lands here
 *
 * Measured: an expired-JWT probe returns `code: 'PGRST303'` with `status`
 * undefined, so a status-only branch never fired and the caller received a
 * generic `server` error. A session that has merely expired must read as
 * `unauthenticated` — that is the difference between "sign in again" and "the
 * server is broken".
 *
 * PGRST300 is deliberately NOT in this list: it means the SERVER'S JWT SECRET IS
 * MISSING. That is a deployment fault, not a credential fault. Mapping it to
 * `unauthenticated` would clear a valid member state and send the user round a
 * sign-in loop that cannot possibly succeed, because no credential they present
 * can fix a server with no secret configured.
 */
const POSTGREST_AUTH_CODES = Object.freeze(['PGRST301', 'PGRST302', 'PGRST303']);

export const isPostgrestAuthCode = (code) => POSTGREST_AUTH_CODES.includes(code);

/** PostgREST: the server's JWT secret is missing. A deployment fault. */
export const POSTGREST_JWT_SECRET_MISSING = 'PGRST300';

/**
 * GoTrue's own error CODES for a credential that is missing, spent or expired.
 *
 * **EXACT match, against `code` ONLY.** A code is a contract; a message is prose
 * that changes between releases. This list is therefore the sole authority for
 * code-based classification, and it is closed: an unknown code gains NO
 * credential semantics, ever. In particular there is no substring matching on
 * codes, so `refresh_token_not_found_in_database`,
 * `session_not_found_in_cache_backend` and `invalid_token_backend_error` are all
 * unknown infrastructure codes and stay `server` — they are outages named after
 * the subsystem they broke, not statements about the user's credential.
 *
 * Adding a code here requires evidence that GoTrue actually emits it as a
 * credential failure, plus a focused test. `SESSION_FAILURE_CODES` is exported
 * so the suite asserts every member maps to `unauthenticated`, which keeps that
 * coverage complete automatically if the list ever changes.
 */
export const SESSION_FAILURE_CODES = Object.freeze([
  'refresh_token_not_found',
  'refresh_token_already_used',
  'refresh_token_revoked',
  'session_not_found',
  'session_expired',
  'bad_jwt',
  'no_authorization',
  'user_not_found',
]);

export const isSessionFailureCode = (code) =>
  typeof code === 'string' && SESSION_FAILURE_CODES.includes(code.trim().toLowerCase());

/**
 * Free-form message matching, for servers that send prose instead of a code.
 *
 * **Applied to the scrubbed MESSAGE ONLY — never to the code.** An earlier
 * version tested `code + message` together, which quietly undid the exactness of
 * the allowlist above: `refresh_token_not_found_in_database` contains
 * `refresh_token_not_found`, so an unknown infrastructure code was
 * substring-classified as a credential failure and signed a valid member out.
 * The two channels are now literally separate — exact code, or heuristic
 * message, never a blend of the two.
 *
 * **A credential NOUN alone is never enough.** Two bugs came from exactly that:
 * a bare `jwt` alternative swallowed `JWT secret missing` and `JWT signing
 * service unavailable`, and a bare `refresh[_ ]?token` alternative then
 * swallowed `Refresh token service unavailable`, `Refresh token configuration
 * missing` and `Refresh token database timeout`. Every one of those is an
 * INFRASTRUCTURE outage around the credential system, and signing a valid member
 * out over one starts a loop they cannot escape.
 *
 * So a match requires a credential noun AND a failure condition **adjacent to
 * each other**, in either order, separated only by whitespace, `_`, `-` or a
 * copula/article. Adjacency is the load-bearing part: "refresh token
 * configuration missing" contains both a noun and the word "missing", yet the
 * condition attaches to the *configuration*, not to the token — so it must not
 * match, and it does not.
 *
 * Two of the entries below are NOT noun+condition pairs but complete standalone
 * phrases (`missing sub`, `not authenticated`). They are listed explicitly
 * rather than pretended to fit the pattern.
 */
const CREDENTIAL_NOUN =
  '(?:refresh[_\\s-]?token|access[_\\s-]?token|id[_\\s-]?token|session|jwt|token|claim)';

const FAILURE_CONDITION =
  '(?:missing|not[_\\s-]found|notfound|invalid|malformed|expired|revoked|rejected'
  + '|reused|already[_\\s-]used|bad|undecodable|unparsable|unusable)';

/** At least one separator, optionally carrying a copula or article. */
const LINK = '(?:[_\\s-]+(?:is|was|were|been|has|have|had|the|a|an|this|your)){0,2}[_\\s-]+';

const CREDENTIAL_FAILURE_RE = new RegExp([
  `${FAILURE_CONDITION}${LINK}${CREDENTIAL_NOUN}`,   // "invalid refresh token", "bad_jwt"
  `${CREDENTIAL_NOUN}${LINK}${FAILURE_CONDITION}`,   // "refresh token not found", "jwt expired"
  'missing[_\\s-]sub',                               // a complete phrase, not a pair
  'not[_\\s-]?authenticated',                        // a complete phrase, not a pair
].join('|'), 'i');

/**
 * PostgREST error -> RepositoryError.
 *
 * Order matters. The PGRST auth codes are checked FIRST, before SQLSTATE and
 * before HTTP status, because they carry neither: they are a third, independent
 * channel. Then SQLSTATE, because the RPCs raise stable codes (42501 forbidden,
 * 42704 unknown slug, 23514 check violation). Only when there is no SQLSTATE
 * does the HTTP status decide, and 401 there means "no usable JWT" —
 * `unauthenticated`, not `forbidden`.
 *
 * The raw error object is never propagated: only a scrubbed code and message.
 */
export function mapPostgrestError(error) {
  if (isNetworkFailure(error)) return offline();
  const code = typeof error?.code === 'string' ? error.code : null;
  const message = scrubMessage(error?.message);
  if (isPostgrestAuthCode(code)) return unauthenticated();
  if (code && /^[0-9A-Z]{5}$/.test(code)) return errorFromSqlState(code, message);
  const status = Number(error?.status ?? error?.statusCode ?? NaN);
  if (status === 401) return unauthenticated();
  if (status === 403) return forbidden();
  if (status === 404) return notFound();
  return server(code ?? 'unknown', message);
}

/**
 * GoTrue error -> RepositoryError, for SESSION RESOLUTION specifically.
 *
 * `mapAuthError` below is written for the SIGN-IN path, where a 400 means "that
 * email was rejected" and belongs in the email field. Reusing it here was wrong:
 * a missing, malformed or expired refresh token also returns 400, and reporting
 * that as a *validation error on an email address nobody typed* is nonsense the
 * UI cannot act on.
 *
 * So session failures are classified on their own terms. Anything that says the
 * stored credential is absent, unusable or expired resolves to
 * `unauthenticated`, which the provider treats as a real transition to signed
 * out. Everything else — a 500, a gateway fault — stays `server`, and a
 * transport fault stays `offline`; the provider deliberately KEEPS the last
 * known identity for those, because a flaky network is not a sign-out.
 */
export function mapSessionError(error) {
  if (isNetworkFailure(error)) return offline();
  const message = scrubMessage(error?.message);
  const status = Number(error?.status ?? NaN);
  const code = typeof error?.code === 'string' ? error.code : 'sessionError';

  // 1. The explicit PostgREST credential codes win outright, even over a
  //    misleading status, because they are the most specific thing available.
  if (isPostgrestAuthCode(code)) return unauthenticated();

  // 2. PGRST300 is the server's own misconfiguration and is checked BEFORE any
  //    message matching, so no phrasing of it can be mistaken for a credential
  //    problem.
  if (code === POSTGREST_JWT_SECRET_MISSING) return server(code, message);

  // 3. A 5xx is a server failure by definition. This runs before the message
  //    match on purpose: "JWT signing service unavailable" at 500 is an outage,
  //    not an expired session, and the user must not be signed out over it.
  if (Number.isFinite(status) && status >= 500) return server(code, message);

  // 4a. An exact GoTrue credential-failure CODE. Reads `code` ONLY, and matches
  //     it whole: an unknown code never acquires credential meaning by
  //     containing a known one as a substring.
  if (isSessionFailureCode(code)) return unauthenticated();

  // 4b. Otherwise the free-form MESSAGE ONLY — deliberately not `code + message`,
  //     which blended the two channels and let
  //     `refresh_token_not_found_in_database` match through the code half. The
  //     message must pair a credential noun with an ADJACENT failure condition;
  //     a noun alone is never enough, because "refresh token service
  //     unavailable" and "JWT signing service unavailable" are outages, not
  //     expired sessions.
  if (CREDENTIAL_FAILURE_RE.test(message)) return unauthenticated();

  // 5. Status-based credential failures. A 400 during SESSION RESOLUTION is a
  //    credential problem, not an email one — that distinction is the whole
  //    reason this function exists separately from `mapAuthError`.
  if (status === 400 || status === 401 || status === 403) return unauthenticated();

  return server(code, message);
}

/**
 * GoTrue error -> RepositoryError, for the SIGN-IN path.
 *
 * `shouldCreateUser: false` means an unknown address comes back as a 400
 * "Signups not allowed for otp". That is NOT a server fault and must not be
 * reported as one: it is a validation outcome the UI states plainly, without
 * confirming whether the address exists.
 */
export function mapAuthError(error) {
  if (isNetworkFailure(error)) return offline();
  const message = scrubMessage(error?.message);
  const status = Number(error?.status ?? NaN);
  const code = typeof error?.code === 'string' ? error.code : 'authError';
  if (/signups not allowed|user not found|signup is disabled/i.test(message)) {
    return validation([{ field: 'email', code: 'notInvited' }]);
  }
  if (/rate limit|too many requests/i.test(message) || status === 429) {
    return validation([{ field: 'email', code: 'rateLimited' }]);
  }
  if (status === 401) return unauthenticated();
  if (status === 403) return forbidden();
  if (status === 400) return validation([{ field: 'email', code: 'rejected' }]);
  return server(code, message);
}

/**
 * Safe redirect target, derived from where the application is ACTUALLY running.
 *
 * Never fabricated. A hard-coded production or preview URL here would send a
 * developer's magic link to production, and a value taken from anywhere but the
 * live origin is an open-redirect waiting to happen. http/https only, no
 * userinfo, and always back to `/` — §10's "expired link → `/`" needs a stable
 * landing path, not wherever the user happened to be.
 */
export function safeRedirectTo(location) {
  const origin = typeof location?.origin === 'string' ? location.origin : '';
  if (origin === '' || origin === 'null') return null;
  let url;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.username !== '' || url.password !== '') return null;
  return `${url.origin}/`;
}

const rowsOf = (data) => (Array.isArray(data) ? data : data == null ? [] : [data]);

/**
 * Build the Gate 4 authRepository.
 *
 * `options.client`   a Supabase client (or any object with the same two surfaces)
 * `options.slug`     workspace slug, defaults to `fightmetrics`
 * `options.location` where redirects are derived from; defaults to window.location
 */
export function createSupabaseAuthRepository(options) {
  const client = options?.client;
  if (!client) throw new Error('createSupabaseAuthRepository requires a client');
  const slug = options?.slug ?? DEFAULT_WORKSPACE_SLUG;
  const locationOf = () => options?.location
    ?? (typeof window === 'undefined' ? null : window.location);

  /** Session PRESENCE only. Never reports, infers or invents a role. */
  const readSession = async () => {
    let result;
    try {
      result = await client.auth.getSession();
    } catch (error) {
      return isNetworkFailure(error) ? offline() : mapSessionError(error);
    }
    if (result?.error) return mapSessionError(result.error);
    const session = result?.data?.session ?? null;
    const userId = session?.user?.id ?? null;
    return ok(typeof userId === 'string' && userId !== '' ? { userId } : null);
  };

  const authRepository = {
    session: () => readSession(),

    // Resolved membership ONLY. Never implies a session: an anonymous caller
    // reaches this function too and legitimately resolves to `{ role: null }`.
    whoami: async () => {
      let result;
      try {
        result = await client.rpc('fm_member_whoami', { p_slug: slug });
      } catch (error) {
        return isNetworkFailure(error) ? offline() : server('whoamiError', scrubMessage(error?.message));
      }
      if (result?.error) return mapPostgrestError(result.error);
      const rows = rowsOf(result?.data);
      // No row at all means the SLUG is unknown — distinguishable from a known
      // workspace on which this caller happens to hold no role.
      if (rows.length === 0) return notFound();
      const role = rows[0]?.role ?? null;
      return ok({ role: typeof role === 'string' && role !== '' ? role : null });
    },

    // Magic link / OTP. `shouldCreateUser: false` is UX, NOT the security
    // boundary: open signup must also be disabled at the hosted project level,
    // which is a Gate 5 prerequisite (§13). Both are required; neither suffices.
    signIn: async (email) => {
      if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
        return validation([{ field: 'email', code: 'invalidEmail' }]);
      }
      const emailRedirectTo = safeRedirectTo(locationOf());
      if (emailRedirectTo === null) {
        return validation([{ field: 'redirect', code: 'unsafeOrigin' }]);
      }
      let result;
      try {
        result = await client.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: false, emailRedirectTo },
        });
      } catch (error) {
        return isNetworkFailure(error) ? offline() : server('signInError', scrubMessage(error?.message));
      }
      if (result?.error) return mapAuthError(result.error);
      return ok({ sent: true });
    },

    // A TRANSITION, not an acknowledgement. `{signedOut:true}` while a session
    // survives is a success that changes nothing — the caller stays fully
    // authorised — so the session is RE-READ and a surviving session is
    // reported as a failure rather than a completed sign-out.
    signOut: async () => {
      let result;
      try {
        result = await client.auth.signOut();
      } catch (error) {
        return isNetworkFailure(error) ? offline() : server('signOutError', scrubMessage(error?.message));
      }
      if (result?.error) return mapAuthError(result.error);
      const after = await readSession();
      if (!after.ok) return after;
      if (after.data !== null) return server('signOutIncomplete', 'session survived sign out');
      return ok({ signedOut: true });
    },

    // EXPLICIT and never automatic. Requires a session but NOT membership —
    // that is the entire point: the first signed-in user claims a zero-owner
    // workspace, and the RPC grants the owner role atomically with taking it.
    claimOwnership: async () => {
      const current = await readSession();
      if (!current.ok) return current;
      if (current.data === null) return unauthenticated();
      let result;
      try {
        result = await client.rpc('fm_rpc_claim_workspace_ownership', { p_slug: slug });
      } catch (error) {
        return isNetworkFailure(error) ? offline() : server('claimError', scrubMessage(error?.message));
      }
      // 42501 here is "already claimed" — the session was proven above, so it
      // cannot be the RPC's authentication branch. 42704 is an unknown slug.
      if (result?.error) return mapPostgrestError(result.error);
      const rows = rowsOf(result?.data);
      if (rows.length === 0) return server('claimEmpty', 'claim returned no row');
      return ok({ role: 'owner' });
    },
  };

  return authRepository;
}
