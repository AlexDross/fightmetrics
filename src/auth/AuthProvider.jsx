// Stage 7 Gate 4 — the auth/membership provider.
//
// It owns exactly two facts — is there a session, and what membership does it
// resolve to — and nothing else. It does NOT read, own or write any App
// collection: Upcoming, ROI, Props, Parlays and every handler around them stay
// exactly as they are until Gate 6. That boundary is deliberate; see the
// "Gate 4 / Gate 6 boundary" note in docs/STAGE_7_PLAN.md §10.
//
// No Supabase type crosses this file's exports. src/App.js sees a context value
// of plain data and functions.
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';

import { CONFIG_STATUS, describeConfigIssues } from '../data/supabase/config.mjs';
import { createSupabaseClientFromEnv } from '../data/supabase/client.mjs';
import { readAuthCallback, clearAuthCallbackUrl } from '../data/supabase/authCallback.mjs';
import { createSupabaseAuthRepository } from '../data/repositories/supabaseAuth.mjs';
import { AUTH_STATES, resolveAuthState } from '../data/repositories/authState.mjs';

const AuthContext = createContext(null);

/** The value seen when no provider is mounted: disabled, never a crash. */
const DISABLED_VALUE = Object.freeze({
  status: AUTH_STATES.DISABLED,
  configStatus: CONFIG_STATUS.DISABLED,
  configDiagnostic: null,
  session: null,
  role: null,
  readSurface: 'public',
  canWrite: false,
  claimEligible: false,
  notice: null,
  error: null,
  pending: false,
  linkSentTo: null,
  signIn: async () => ({ ok: false, error: { kind: 'unauthenticated' } }),
  signOut: async () => ({ ok: false, error: { kind: 'unauthenticated' } }),
  claimOwnership: async () => ({ ok: false, error: { kind: 'unauthenticated' } }),
  dismissNotice: () => {},
  refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext) ?? DISABLED_VALUE;

/**
 * `deps` exists so tests drive the whole lifecycle deterministically:
 *   deps.env               env object (defaults to import.meta.env)
 *   deps.createRepository  (client) -> authRepository
 *   deps.createClient      injected into createSupabaseClientFromEnv
 *   deps.windowLike        window (listeners, history, location)
 */
export function AuthProvider({ children, deps }) {
  const env = deps?.env ?? (typeof import.meta === 'undefined' ? {} : import.meta.env);
  const windowLike = deps?.windowLike ?? (typeof window === 'undefined' ? null : window);

  // Built ONCE. A client rebuilt on re-render would lose its session listener
  // and re-run detectSessionInUrl against an already-consumed fragment.
  const [boot] = useState(() => {
    try {
      return createSupabaseClientFromEnv(env, { createClient: deps?.createClient });
    } catch (error) {
      return { status: CONFIG_STATUS.INVALID, client: null, issues: [{ key: 'client', code: 'constructionFailed' }], thrown: error };
    }
  });

  const repository = useMemo(() => {
    if (boot.status !== CONFIG_STATUS.CONFIGURED || !boot.client) return null;
    const make = deps?.createRepository ?? ((client) => createSupabaseAuthRepository({ client }));
    return make(boot.client);
  }, [boot, deps]);

  const enabled = repository !== null;

  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [resolved, setResolved] = useState(!enabled);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [linkSentTo, setLinkSentTo] = useState(null);

  // Monotonic sequence: a slow resolve that finishes AFTER a newer one must be
  // discarded. Without this, an in-flight whoami started before sign-out lands
  // afterwards and re-grants a role the user no longer has — the UI then looks
  // authorised while the session is gone.
  const seqRef = useRef(0);
  const mountedRef = useRef(true);

  const applyIfCurrent = useCallback((seq, apply) => {
    if (!mountedRef.current || seq !== seqRef.current) return;
    apply();
  }, []);

  /**
   * Resolve both axes together, in order: session first, then membership, and
   * membership is only asked for when a session exists — an anonymous whoami is
   * a wasted request whose answer is always `{role:null}`.
   */
  const resolveBoth = useCallback(async () => {
    if (!repository) return;
    const seq = ++seqRef.current;
    const sessionResult = await repository.session();
    if (!sessionResult.ok) {
      // TWO different failures, deliberately handled differently.
      //
      // `unauthenticated` is a real answer: the stored credential is gone,
      // unusable or expired. It must clear session AND role together, so the
      // derived state becomes signedOut with canWrite false and a public read
      // surface. Leaving a resolved member in place here is the bug that keeps a
      // UI looking authorised after its session has already ended.
      //
      // `offline` / `server` are NOT answers — they are the absence of one. A
      // flaky network is not a sign-out, so the last known identity is
      // deliberately RETAINED and only the error is surfaced. Writes are
      // confirmed-only (§9) and the server re-checks every one of them, so a
      // stale-optimistic identity cannot authorise anything on its own.
      applyIfCurrent(seq, () => {
        if (sessionResult.error?.kind === 'unauthenticated') {
          setSession(null);
          setRole(null);
        }
        setError(sessionResult.error);
        setResolved(true);
      });
      return;
    }
    const nextSession = sessionResult.data;
    if (nextSession === null) {
      applyIfCurrent(seq, () => {
        setSession(null); setRole(null); setError(null); setResolved(true);
      });
      return;
    }
    const whoamiResult = await repository.whoami();
    applyIfCurrent(seq, () => {
      setSession(nextSession);
      setRole(whoamiResult.ok ? (whoamiResult.data?.role ?? null) : null);
      setError(whoamiResult.ok ? null : whoamiResult.error);
      setResolved(true);
    });
  }, [repository, applyIfCurrent]);

  // Boot: read the callback, clean the URL, then resolve.
  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) { setResolved(true); return undefined; }

    const callback = readAuthCallback(windowLike?.location ?? null);
    if (callback.kind === 'error') setNotice(callback.notice);
    if (callback.kind !== 'none') clearAuthCallbackUrl(windowLike);

    resolveBoth();
    return () => { mountedRef.current = false; };
  }, [enabled, windowLike, resolveBoth]);

  // onAuthStateChange: sign-in refetches membership, sign-out clears BOTH.
  useEffect(() => {
    if (!repository || !boot.client?.auth?.onAuthStateChange) return undefined;
    const { data } = boot.client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        seqRef.current += 1;             // invalidate anything in flight
        setSession(null);
        setRole(null);
        setError(null);
        setLinkSentTo(null);
        setResolved(true);
        return;
      }
      resolveBoth();
    });
    return () => { data?.subscription?.unsubscribe?.(); };
  }, [repository, boot, resolveBoth]);

  // Refetch on focus and on visibility, per §10. A session can expire, be
  // refreshed in another tab, or have membership granted while this tab sat
  // idle; without this the tab keeps showing a state that stopped being true.
  useEffect(() => {
    if (!repository || !windowLike?.addEventListener) return undefined;
    const onFocus = () => { resolveBoth(); };
    const onVisibility = () => {
      const doc = windowLike.document;
      if (!doc || doc.visibilityState === 'visible') resolveBoth();
    };
    windowLike.addEventListener('focus', onFocus);
    windowLike.document?.addEventListener?.('visibilitychange', onVisibility);
    return () => {
      windowLike.removeEventListener('focus', onFocus);
      windowLike.document?.removeEventListener?.('visibilitychange', onVisibility);
    };
  }, [repository, windowLike, resolveBoth]);

  const signIn = useCallback(async (email) => {
    if (!repository) return { ok: false, error: { kind: 'unauthenticated' } };
    setPending(true); setError(null); setLinkSentTo(null);
    const result = await repository.signIn(email);
    if (!mountedRef.current) return result;
    setPending(false);
    if (result.ok) setLinkSentTo(typeof email === 'string' ? email.trim() : null);
    else setError(result.error);
    return result;
  }, [repository]);

  const signOut = useCallback(async () => {
    if (!repository) return { ok: false, error: { kind: 'unauthenticated' } };
    setPending(true); setError(null);
    const result = await repository.signOut();
    if (!mountedRef.current) return result;
    setPending(false);
    if (result.ok) {
      // Clear BOTH axes here as well as on the SIGNED_OUT event: a provider that
      // waited only for the event would keep rendering a member UI in the window
      // between the successful call and the listener firing.
      seqRef.current += 1;
      setSession(null); setRole(null); setLinkSentTo(null);
    } else {
      setError(result.error);
    }
    return result;
  }, [repository]);

  const claimOwnership = useCallback(async () => {
    if (!repository) return { ok: false, error: { kind: 'unauthenticated' } };
    setPending(true); setError(null);
    const result = await repository.claimOwnership();
    if (!mountedRef.current) return result;
    setPending(false);
    if (result.ok) await resolveBoth();
    else setError(result.error);
    return result;
  }, [repository, resolveBoth]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const state = useMemo(() => resolveAuthState({ session, role }), [session, role]);

  const value = useMemo(() => ({
    status: !enabled
      ? AUTH_STATES.DISABLED
      : !resolved ? AUTH_STATES.LOADING : state.state,
    configStatus: boot.status,
    configDiagnostic: boot.status === CONFIG_STATUS.INVALID
      ? describeConfigIssues(boot.issues) : null,
    session: state.signedIn ? { userId: state.userId } : null,
    role: state.role,
    readSurface: state.readSurface,
    canWrite: state.canWrite,
    claimEligible: enabled && resolved && state.claimEligible,
    notice, error, pending, linkSentTo,
    signIn, signOut, claimOwnership, dismissNotice,
    refresh: resolveBoth,
  }), [enabled, resolved, state, boot, notice, error, pending, linkSentTo,
       signIn, signOut, claimOwnership, dismissNotice, resolveBoth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, DISABLED_VALUE };
