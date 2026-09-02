// Stage 7 Gate 4 — the sign-in affordance, in the Info footer. §10: unobtrusive,
// and NO login wall.
//
// When Supabase is not configured this renders NOTHING. That is the whole
// contract for the current production build: no panel, no badge, no request, no
// visible change of any kind. Every other state is additive and lives at the
// bottom of the Info tab, so navigation and layout everywhere else are untouched.
import React, { useState } from 'react';

import { AUTH_STATES } from '../data/repositories/authState.mjs';
import { CONFIG_STATUS } from '../data/supabase/config.mjs';
import { useAuth } from './AuthProvider.jsx';

const CARD = 'bg-slate-900 border border-slate-800 rounded-xl p-5';
const LABEL = 'text-secondary text-xs leading-relaxed';

/** Error kind -> a sentence a person can act on. Never the raw server text. */
function errorText(error) {
  if (!error) return null;
  switch (error.kind) {
    case 'offline': return 'Could not reach the server. Check your connection and try again.';
    case 'unauthenticated': return 'You are signed out. Request a new sign-in link.';
    case 'forbidden': return 'This workspace already has an owner, so it cannot be claimed.';
    case 'notFound': return 'This workspace is not available.';
    case 'validation': {
      const code = error.issues?.[0]?.code;
      if (code === 'invalidEmail') return 'Enter a valid email address.';
      if (code === 'notInvited') return 'That address cannot sign in. Sign-up is invitation-only.';
      if (code === 'rateLimited') return 'Too many attempts. Wait a minute and try again.';
      if (code === 'unsafeOrigin') return 'Sign-in is unavailable from this address.';
      return 'That request was rejected. Check the address and try again.';
    }
    default: return 'Something went wrong. Try again in a moment.';
  }
}

function ReadOnlyBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
      <span aria-hidden="true">•</span>{children}
    </span>
  );
}

function SignInForm() {
  const { signIn, pending, linkSentTo, error } = useAuth();
  const [email, setEmail] = useState('');
  const message = errorText(error);

  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(e) => { e.preventDefault(); signIn(email); }}
    >
      <label htmlFor="fm-auth-email" className="sr-only">Email address</label>
      <input
        id="fm-auth-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-describedby="fm-auth-status"
        className="w-full sm:w-64 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Email me a sign-in link'}
      </button>
      <p id="fm-auth-status" role="status" aria-live="polite" className={LABEL}>
        {message
          ? message
          : linkSentTo
            ? `Check ${linkSentTo} for a sign-in link. It expires shortly.`
            : ''}
      </p>
    </form>
  );
}

function ClaimOwnership() {
  const { claimOwnership, pending } = useAuth();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => claimOwnership()}
      className="mt-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? 'Claiming…' : 'Claim ownership of this workspace'}
    </button>
  );
}

export default function AuthFooterPanel() {
  const {
    status, configStatus, configDiagnostic, role,
    claimEligible, notice, dismissNotice, signOut, pending, error,
  } = useAuth();

  // Not configured: render nothing at all. The production build is unchanged.
  if (configStatus === CONFIG_STATUS.DISABLED) return null;

  return (
    <div data-testid="fm-auth-panel">
      <h2 className="text-white font-black text-xl mb-1">Account</h2>
      <p className="text-secondary text-sm mb-4">
        FightMetrics is public and read-only. Signing in is only needed to manage
        this workspace.
      </p>

      {notice && (
        <div role="alert" className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-amber-700/60 bg-amber-950/40 px-4 py-3">
          <p className="text-amber-200 text-xs leading-relaxed">{notice}</p>
          <button
            type="button"
            onClick={dismissNotice}
            aria-label="Dismiss notice"
            className="shrink-0 rounded-md border border-amber-700/60 px-2 py-0.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-900/40"
          >
            Dismiss
          </button>
        </div>
      )}

      {configStatus === CONFIG_STATUS.INVALID ? (
        <div className={CARD}>
          <p className={LABEL}>
            Sign-in is unavailable: the Supabase configuration is incomplete.
            Everything on this site continues to work read-only.
          </p>
          {configDiagnostic && (
            <p className="mt-2 font-mono text-[11px] text-slate-400">{configDiagnostic}</p>
          )}
        </div>
      ) : (
        <div className={CARD}>
          {status === AUTH_STATES.LOADING && (
            <p className={LABEL} role="status" aria-live="polite">Checking your session…</p>
          )}

          {status === AUTH_STATES.SIGNED_OUT && (
            <>
              <ReadOnlyBadge>Viewing read-only</ReadOnlyBadge>
              <p className={`${LABEL} mt-2`}>
                Everything here is visible without an account. Sign-in is by
                invitation only — no account is created for an unknown address.
              </p>
              <SignInForm />
            </>
          )}

          {status === AUTH_STATES.SIGNED_IN_NON_MEMBER && (
            <>
              <ReadOnlyBadge>Signed in · no workspace access</ReadOnlyBadge>
              <p className={`${LABEL} mt-2`}>
                You are signed in, but you are not a member of this workspace, so
                you are reading exactly what a signed-out visitor reads.
              </p>
              {claimEligible && (
                <>
                  <p className={`${LABEL} mt-2`}>
                    If this workspace has no owner yet, you can take ownership.
                  </p>
                  <ClaimOwnership />
                </>
              )}
              {error && <p className={`${LABEL} mt-2`} role="status">{errorText(error)}</p>}
              <SignOutButton pending={pending} signOut={signOut} />
            </>
          )}

          {status === AUTH_STATES.MEMBER && (
            <>
              <ReadOnlyBadge>{`Signed in · ${role}`}</ReadOnlyBadge>
              <p className={`${LABEL} mt-2`}>
                Membership resolved as <span className="text-slate-200 font-semibold">{role}</span>.
                Saving to the database is not enabled yet, so edits you make here
                still live only in this browser.
              </p>
              <SignOutButton pending={pending} signOut={signOut} />
            </>
          )}

          {/* The user UUID is deliberately NOT rendered. It is a stable internal
              identifier that tells the signed-in person nothing they do not
              already know, and printing even a prefix puts it in screenshots and
              support threads for no benefit. Asserted by the UI tests. */}
        </div>
      )}
    </div>
  );
}

function SignOutButton({ pending, signOut }) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => signOut()}
      className="mt-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
