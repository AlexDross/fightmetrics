// Stage 7 Gate 4 — reading the magic-link callback, as a pure function.
//
// GoTrue returns failures in the URL FRAGMENT, e.g.
//   /#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
// and successes as a fragment carrying tokens, which `detectSessionInUrl`
// consumes. Either way the fragment must not survive in the address bar: a
// success fragment contains an access AND refresh token, which would then be in
// history, in any shared link and in every screenshot.
//
// §10: "Expired link → `/` with a dismissible notice."

/** Non-secret notices. Codes, not server prose — the server text is untrusted. */
export const CALLBACK_NOTICES = Object.freeze({
  expired: 'That sign-in link has expired. Request a new one below.',
  invalid: 'That sign-in link is no longer valid. Request a new one below.',
  denied: 'Sign-in was not completed. Request a new link below.',
});

const paramsOf = (raw) => {
  const text = typeof raw === 'string' ? raw.replace(/^[#?]/, '') : '';
  return text === '' ? null : new URLSearchParams(text);
};

/**
 * Classify a callback URL.
 *
 * Returns `{ kind, notice, hadTokens }`:
 *   kind 'none'    nothing auth-related in the URL — leave it alone
 *   kind 'success' a token fragment was present; the client consumes it and the
 *                  URL must still be cleaned
 *   kind 'error'   an error fragment; `notice` is a fixed, non-secret string
 *
 * The server's `error_description` is deliberately NOT rendered. It is
 * attacker-influencable text arriving in a URL, and it says nothing a fixed
 * message cannot.
 */
export function readAuthCallback(location) {
  const hash = paramsOf(location?.hash);
  const query = paramsOf(location?.search);

  const errorCode = hash?.get('error_code') ?? query?.get('error_code') ?? null;
  const errorKind = hash?.get('error') ?? query?.get('error') ?? null;

  if (errorCode !== null || errorKind !== null) {
    const expired = /expired/i.test(errorCode ?? '') || /expired/i.test(errorKind ?? '');
    const denied = /access_denied/i.test(errorKind ?? '');
    return {
      kind: 'error',
      notice: expired
        ? CALLBACK_NOTICES.expired
        : denied ? CALLBACK_NOTICES.denied : CALLBACK_NOTICES.invalid,
      hadTokens: false,
    };
  }

  const hadTokens = Boolean(
    hash?.get('access_token') || hash?.get('refresh_token') || query?.get('code'));
  return hadTokens
    ? { kind: 'success', notice: null, hadTokens: true }
    : { kind: 'none', notice: null, hadTokens: false };
}

/**
 * Strip the auth fragment/query and return to `/`, without a navigation.
 *
 * `replaceState` rather than assigning `location.hash`: assignment leaves a
 * history entry, so Back would re-enter the callback URL and re-show the notice.
 */
export function clearAuthCallbackUrl(windowLike) {
  const history = windowLike?.history;
  if (!history || typeof history.replaceState !== 'function') return false;
  history.replaceState(null, '', '/');
  return true;
}
