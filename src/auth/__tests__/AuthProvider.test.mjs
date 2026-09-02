// @vitest-environment jsdom
//
// The default suite environment is `node` by design. This file opts in per-file,
// so nothing else in the suite gains a DOM. React components are constructed
// with React.createElement rather than JSX because this file is .mjs and stays
// outside Tailwind's @source globs — a test must never be able to change the
// production CSS.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { AuthProvider, useAuth, DISABLED_VALUE } from '../AuthProvider.jsx';
import { createSupabaseAuthRepository } from '../../data/repositories/supabaseAuth.mjs';
import { AUTH_STATES } from '../../data/repositories/authState.mjs';
import { CALLBACK_NOTICES } from '../../data/supabase/authCallback.mjs';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const URL_OK = 'https://example-project.supabase.co';
const KEY_OK = 'sb_publishable_AAAAAAAAAAAAAAAAAAAAAA';
const ENV_ON = { VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK };
const USER = '00000000-0000-4000-8000-0000000000aa';

/** A scriptable authRepository; every method is a spy. */
function fakeRepository(overrides = {}) {
  return {
    session: vi.fn(async () => ({ ok: true, data: null })),
    whoami: vi.fn(async () => ({ ok: true, data: { role: null } })),
    signIn: vi.fn(async () => ({ ok: true, data: { sent: true } })),
    signOut: vi.fn(async () => ({ ok: true, data: { signedOut: true } })),
    claimOwnership: vi.fn(async () => ({ ok: true, data: { role: 'owner' } })),
    ...overrides,
  };
}

/** A client stub exposing only what the provider touches. */
function fakeClient() {
  const listeners = [];
  const unsubscribe = vi.fn();
  return {
    listeners,
    unsubscribe,
    emit: (event) => listeners.forEach((fn) => fn(event, null)),
    auth: {
      onAuthStateChange: vi.fn((fn) => {
        listeners.push(fn);
        return { data: { subscription: { unsubscribe } } };
      }),
    },
  };
}

function fakeWindow(location = { origin: 'https://app.example', hash: '', search: '' }) {
  const listeners = new Map();
  const docListeners = new Map();
  return {
    location,
    history: { replaceState: vi.fn() },
    addEventListener: vi.fn((name, fn) => listeners.set(name, fn)),
    removeEventListener: vi.fn((name) => listeners.delete(name)),
    document: {
      visibilityState: 'visible',
      addEventListener: vi.fn((name, fn) => docListeners.set(name, fn)),
      removeEventListener: vi.fn((name) => docListeners.delete(name)),
    },
    fire: (name) => listeners.get(name)?.(),
    fireDoc: (name) => docListeners.get(name)?.(),
    listenerCount: () => listeners.size + docListeners.size,
  };
}

let container;
let root;
let seen;

function Probe() {
  seen = useAuth();
  return null;
}

async function mount(deps) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(AuthProvider, { deps },
      React.createElement(Probe)));
  });
}

async function unmount() {
  if (!root) return;
  await act(async () => { root.unmount(); });
  container.remove();
  root = null;
}

beforeEach(() => { seen = null; });
afterEach(async () => { await unmount(); vi.restoreAllMocks(); });

describe('configuration absent — the provider is inert', () => {
  it('reports disabled, builds no client and calls no repository method', async () => {
    const createClient = vi.fn();
    const createRepository = vi.fn();
    await mount({ env: {}, createClient, createRepository, windowLike: fakeWindow() });
    expect(seen.status).toBe(AUTH_STATES.DISABLED);
    expect(seen.configStatus).toBe('disabled');
    expect(seen.session).toBeNull();
    expect(seen.role).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
    expect(createRepository).not.toHaveBeenCalled();
  });

  it('makes no network request at all', async () => {
    const fetchSpy = vi.fn();
    const original = globalThis.fetch;
    globalThis.fetch = fetchSpy;
    try {
      await mount({ env: {}, windowLike: fakeWindow() });
      await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally { globalThis.fetch = original; }
  });

  it('its operations resolve to unauthenticated rather than throwing', async () => {
    await mount({ env: {}, windowLike: fakeWindow() });
    await expect(seen.signIn('a@example.com')).resolves.toEqual({ ok: false, error: { kind: 'unauthenticated' } });
    await expect(seen.signOut()).resolves.toEqual({ ok: false, error: { kind: 'unauthenticated' } });
    await expect(seen.claimOwnership()).resolves.toEqual({ ok: false, error: { kind: 'unauthenticated' } });
  });

  it('an invalid configuration is reported with a value-free diagnostic', async () => {
    await mount({
      env: { VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_TOPSECRET' },
      windowLike: fakeWindow(),
    });
    expect(seen.configStatus).toBe('invalid');
    expect(seen.configDiagnostic).toContain('secretKeySupplied');
    expect(seen.configDiagnostic).not.toContain('TOPSECRET');
    expect(seen.status).toBe(AUTH_STATES.DISABLED);
  });

  it('the no-provider default is disabled, never a crash', () => {
    expect(DISABLED_VALUE.status).toBe(AUTH_STATES.DISABLED);
    expect(Object.isFrozen(DISABLED_VALUE)).toBe(true);
  });
});

describe('initial resolution', () => {
  const configured = (repository, windowLike = fakeWindow()) => ({
    env: ENV_ON,
    createClient: () => fakeClient(),
    createRepository: () => repository,
    windowLike,
  });

  it('resolves to signed out', async () => {
    const repo = fakeRepository();
    await mount(configured(repo));
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);
    expect(repo.session).toHaveBeenCalledTimes(1);
    // No membership request is made without a session: the answer is knowable.
    expect(repo.whoami).not.toHaveBeenCalled();
  });

  it('resolves to signed-in non-member', async () => {
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      whoami: vi.fn(async () => ({ ok: true, data: { role: null } })),
    });
    await mount(configured(repo));
    expect(seen.status).toBe(AUTH_STATES.SIGNED_IN_NON_MEMBER);
    expect(seen.session).toEqual({ userId: USER });
    expect(seen.role).toBeNull();
    expect(seen.readSurface).toBe('public');
    expect(seen.claimEligible).toBe(true);
    expect(seen.canWrite).toBe(false);
  });

  it.each(['owner', 'editor', 'viewer'])('resolves to member (%s)', async (role) => {
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      whoami: vi.fn(async () => ({ ok: true, data: { role } })),
    });
    await mount(configured(repo));
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.role).toBe(role);
    expect(seen.readSurface).toBe('member');
    expect(seen.claimEligible).toBe(false);
    expect(seen.canWrite).toBe(role !== 'viewer');
  });

  it('a whoami failure leaves the session but no membership', async () => {
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      whoami: vi.fn(async () => ({ ok: false, error: { kind: 'offline' } })),
    });
    await mount(configured(repo));
    expect(seen.status).toBe(AUTH_STATES.SIGNED_IN_NON_MEMBER);
    expect(seen.role).toBeNull();
    expect(seen.error).toEqual({ kind: 'offline' });
  });
});

describe('onAuthStateChange drives both axes', () => {
  it('subscribes once and unsubscribes on unmount', async () => {
    const client = fakeClient();
    const repo = fakeRepository();
    await mount({ env: ENV_ON, createClient: () => client, createRepository: () => repo, windowLike: fakeWindow() });
    expect(client.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
    expect(client.unsubscribe).not.toHaveBeenCalled();
    await unmount();
    expect(client.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('SIGNED_IN refetches membership', async () => {
    const client = fakeClient();
    let role = null;
    let userId = null;
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: userId ? { userId } : null })),
      whoami: vi.fn(async () => ({ ok: true, data: { role } })),
    });
    await mount({ env: ENV_ON, createClient: () => client, createRepository: () => repo, windowLike: fakeWindow() });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);

    userId = USER; role = 'editor';
    await act(async () => { client.emit('SIGNED_IN'); });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.role).toBe('editor');
  });

  it('SIGNED_OUT clears session AND membership', async () => {
    const client = fakeClient();
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      whoami: vi.fn(async () => ({ ok: true, data: { role: 'owner' } })),
    });
    await mount({ env: ENV_ON, createClient: () => client, createRepository: () => repo, windowLike: fakeWindow() });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    await act(async () => { client.emit('SIGNED_OUT'); });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);
    expect(seen.session).toBeNull();
    expect(seen.role).toBeNull();
    expect(seen.canWrite).toBe(false);
    expect(seen.readSurface).toBe('public');
  });
});

describe('signOut() through the provider', () => {
  it('clears both axes without waiting for the listener', async () => {
    const client = fakeClient();          // deliberately emits nothing
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      whoami: vi.fn(async () => ({ ok: true, data: { role: 'owner' } })),
    });
    await mount({ env: ENV_ON, createClient: () => client, createRepository: () => repo, windowLike: fakeWindow() });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    await act(async () => { await seen.signOut(); });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);
    expect(seen.session).toBeNull();
    expect(seen.role).toBeNull();
  });

  it('a FAILED sign-out leaves the member state intact and surfaces the error', async () => {
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      whoami: vi.fn(async () => ({ ok: true, data: { role: 'owner' } })),
      signOut: vi.fn(async () => ({ ok: false, error: { kind: 'offline' } })),
    });
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => repo, windowLike: fakeWindow() });
    await act(async () => { await seen.signOut(); });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.error).toEqual({ kind: 'offline' });
  });
});

describe('claimOwnership() through the provider', () => {
  it('re-resolves membership so a successful claim shows as owner', async () => {
    let role = null;
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      whoami: vi.fn(async () => ({ ok: true, data: { role } })),
      claimOwnership: vi.fn(async () => { role = 'owner'; return { ok: true, data: { role: 'owner' } }; }),
    });
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => repo, windowLike: fakeWindow() });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_IN_NON_MEMBER);

    await act(async () => { await seen.claimOwnership(); });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.role).toBe('owner');
  });

  it('an already-claimed workspace surfaces forbidden and changes nothing', async () => {
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      claimOwnership: vi.fn(async () => ({ ok: false, error: { kind: 'forbidden' } })),
    });
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => repo, windowLike: fakeWindow() });
    await act(async () => { await seen.claimOwnership(); });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_IN_NON_MEMBER);
    expect(seen.error).toEqual({ kind: 'forbidden' });
  });
});

describe('refetch on focus and visibility', () => {
  it('registers and removes both listeners', async () => {
    const w = fakeWindow();
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => fakeRepository(), windowLike: w });
    expect(w.listenerCount()).toBe(2);
    await unmount();
    expect(w.listenerCount()).toBe(0);
  });

  it('a focus event re-resolves', async () => {
    const w = fakeWindow();
    const repo = fakeRepository();
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => repo, windowLike: w });
    expect(repo.session).toHaveBeenCalledTimes(1);
    await act(async () => { w.fire('focus'); });
    expect(repo.session).toHaveBeenCalledTimes(2);
  });

  it('becoming visible re-resolves; going hidden does not', async () => {
    const w = fakeWindow();
    const repo = fakeRepository();
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => repo, windowLike: w });
    w.document.visibilityState = 'hidden';
    await act(async () => { w.fireDoc('visibilitychange'); });
    expect(repo.session).toHaveBeenCalledTimes(1);
    w.document.visibilityState = 'visible';
    await act(async () => { w.fireDoc('visibilitychange'); });
    expect(repo.session).toHaveBeenCalledTimes(2);
  });
});

describe('an expired session on refresh really signs the user out', () => {
  it('a member whose next session() is unauthenticated becomes signedOut atomically', async () => {
    const w = fakeWindow();
    let sessionResult = { ok: true, data: { userId: USER } };
    const repo = fakeRepository({
      session: vi.fn(async () => sessionResult),
      whoami: vi.fn(async () => ({ ok: true, data: { role: 'owner' } })),
    });
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => repo, windowLike: w });

    // Start from a fully resolved member.
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.role).toBe('owner');
    expect(seen.canWrite).toBe(true);
    expect(seen.readSurface).toBe('member');

    // The stored credential expires while the tab sits idle.
    sessionResult = { ok: false, error: { kind: 'unauthenticated' } };

    // The ordinary refresh-on-focus path — not a sign-out call.
    await act(async () => { w.fire('focus'); });

    expect(seen.session).toBeNull();
    expect(seen.role).toBeNull();
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);
    expect(seen.canWrite).toBe(false);
    expect(seen.readSurface).toBe('public');
  });

  it('the visibility path clears it too', async () => {
    const w = fakeWindow();
    let sessionResult = { ok: true, data: { userId: USER } };
    const repo = fakeRepository({
      session: vi.fn(async () => sessionResult),
      whoami: vi.fn(async () => ({ ok: true, data: { role: 'editor' } })),
    });
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => repo, windowLike: w });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    sessionResult = { ok: false, error: { kind: 'unauthenticated' } };
    await act(async () => { w.fireDoc('visibilitychange'); });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);
    expect(seen.role).toBeNull();
    expect(seen.canWrite).toBe(false);
  });

  it('a TRANSIENT failure deliberately keeps the last known identity', async () => {
    // Documented distinction: `offline`/`server` are the absence of an answer,
    // not an answer. A flaky network is not a sign-out, so the identity is
    // retained and only the error surfaces. Writes stay confirmed-only and the
    // server re-checks each one, so a stale identity authorises nothing.
    const w = fakeWindow();
    let sessionResult = { ok: true, data: { userId: USER } };
    const repo = fakeRepository({
      session: vi.fn(async () => sessionResult),
      whoami: vi.fn(async () => ({ ok: true, data: { role: 'owner' } })),
    });
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => repo, windowLike: w });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    for (const error of [{ kind: 'offline' }, { kind: 'server', code: '500', message: 'x' }]) {
      sessionResult = { ok: false, error };
      await act(async () => { w.fire('focus'); });
      expect(seen.status, error.kind).toBe(AUTH_STATES.MEMBER);
      expect(seen.role, error.kind).toBe('owner');
      expect(seen.error, error.kind).toEqual(error);
    }

    // …and recovers cleanly when the network comes back.
    sessionResult = { ok: true, data: { userId: USER } };
    await act(async () => { w.fire('focus'); });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.error).toBeNull();
  });
});

describe('through the REAL mapping, a server fault does not sign a member out', () => {
  // End to end: a real authRepository over a fake client, so mapSessionError
  // does the classifying. A server whose JWT secret is missing must leave the
  // member exactly where they are — clearing them would start a sign-in loop
  // that no credential can complete.
  const mountWithRealRepo = async (w, getError) => {
    let error = null;
    const client = {
      auth: {
        getSession: async () => (error
          ? { data: { session: null }, error }
          : { data: { session: { user: { id: USER } } }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      rpc: async () => ({ data: [{ workspace_id: 'w', role: 'owner' }], error: null }),
    };
    await mount({
      env: ENV_ON,
      createClient: () => client,
      createRepository: (c) => createSupabaseAuthRepository({
        client: c, location: { origin: 'https://app.example' },
      }),
      windowLike: w,
    });
    error = getError;
    return w;
  };

  it('PGRST300 "JWT secret missing" leaves the member signed in', async () => {
    const w = fakeWindow();
    await mountWithRealRepo(w, { code: 'PGRST300', message: 'JWT secret missing' });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    await act(async () => { w.fire('focus'); });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.role).toBe('owner');
    expect(seen.error?.kind).toBe('server');
  });

  it('a 500 naming the signing service also leaves them signed in', async () => {
    const w = fakeWindow();
    await mountWithRealRepo(w, { status: 500, message: 'JWT signing service unavailable' });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    await act(async () => { w.fire('focus'); });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.role).toBe('owner');
    expect(seen.error?.kind).toBe('server');
  });

  it('a refresh-token OUTAGE leaves the member signed in', async () => {
    // The second bare-noun defect, at the level the user actually feels it: the
    // refresh-token service being down is not the same as their session ending.
    const w = fakeWindow();
    await mountWithRealRepo(w, { message: 'Refresh token service unavailable' });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    await act(async () => { w.fire('focus'); });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);
    expect(seen.role).toBe('owner');
    expect(seen.error?.kind).toBe('server');
  });

  it('but a genuinely expired credential DOES sign them out', async () => {
    // The contrast that makes the two tests above meaningful rather than a
    // blanket "never sign out on a session error".
    const w = fakeWindow();
    await mountWithRealRepo(w, { code: 'PGRST303', message: 'JWT expired' });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    await act(async () => { w.fire('focus'); });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);
    expect(seen.session).toBeNull();
    expect(seen.role).toBeNull();
    expect(seen.canWrite).toBe(false);
    expect(seen.readSurface).toBe('public');
  });

  it('and so does a genuinely missing refresh token', async () => {
    const w = fakeWindow();
    await mountWithRealRepo(w, { code: 'refresh_token_not_found' });
    expect(seen.status).toBe(AUTH_STATES.MEMBER);

    await act(async () => { w.fire('focus'); });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);
    expect(seen.role).toBeNull();
    expect(seen.canWrite).toBe(false);
  });
});

describe('a stale async result never overwrites newer state', () => {
  it('a slow whoami that lands after sign-out does not re-grant the role', async () => {
    const client = fakeClient();
    let releaseWhoami;
    const whoamiGate = new Promise((resolve) => { releaseWhoami = resolve; });
    const repo = fakeRepository({
      session: vi.fn(async () => ({ ok: true, data: { userId: USER } })),
      whoami: vi.fn(async () => { await whoamiGate; return { ok: true, data: { role: 'owner' } }; }),
    });

    await mount({ env: ENV_ON, createClient: () => client, createRepository: () => repo, windowLike: fakeWindow() });
    // The first resolve is still parked inside whoami.
    expect(seen.role).toBeNull();

    await act(async () => { client.emit('SIGNED_OUT'); });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);

    // Now let the stale membership request finish. It must be discarded.
    await act(async () => { releaseWhoami(); await whoamiGate; await Promise.resolve(); });
    expect(seen.status).toBe(AUTH_STATES.SIGNED_OUT);
    expect(seen.role).toBeNull();
    expect(seen.session).toBeNull();
  });
});

describe('the expired/invalid callback', () => {
  it('shows a dismissible notice and cleans the URL back to /', async () => {
    const w = fakeWindow({
      origin: 'https://app.example',
      hash: '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
      search: '',
    });
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => fakeRepository(), windowLike: w });
    expect(seen.notice).toBe(CALLBACK_NOTICES.expired);
    expect(w.history.replaceState).toHaveBeenCalledWith(null, '', '/');

    await act(async () => { seen.dismissNotice(); });
    expect(seen.notice).toBeNull();
  });

  it('cleans a SUCCESS fragment too, so tokens do not stay in the address bar', async () => {
    const w = fakeWindow({
      origin: 'https://app.example',
      hash: '#access_token=aaa.bbb.ccc&refresh_token=rrr', search: '',
    });
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => fakeRepository(), windowLike: w });
    expect(w.history.replaceState).toHaveBeenCalledWith(null, '', '/');
    expect(seen.notice).toBeNull();
  });

  it('leaves an ordinary URL alone', async () => {
    const w = fakeWindow();
    await mount({ env: ENV_ON, createClient: () => fakeClient(), createRepository: () => fakeRepository(), windowLike: w });
    expect(w.history.replaceState).not.toHaveBeenCalled();
    expect(seen.notice).toBeNull();
  });
});
