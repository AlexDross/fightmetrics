// @vitest-environment jsdom
//
// Per-file DOM opt-in; .mjs so Tailwind's @source globs cannot reach it.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

import { AuthProvider } from '../AuthProvider.jsx';
import AuthFooterPanel from '../AuthFooterPanel.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const ENV_ON = {
  VITE_SUPABASE_URL: 'https://example-project.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_AAAAAAAAAAAAAAAAAAAAAA',
};
const USER = '00000000-0000-4000-8000-0000000000aa';

const fakeClient = () => ({
  auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
});

const fakeWindow = () => ({
  location: { origin: 'https://app.example', hash: '', search: '' },
  history: { replaceState: () => {} },
  addEventListener: () => {}, removeEventListener: () => {},
  document: { visibilityState: 'visible', addEventListener: () => {}, removeEventListener: () => {} },
});

function repositoryFor({ userId = null, role = null, ...rest } = {}) {
  return {
    session: async () => ({ ok: true, data: userId ? { userId } : null }),
    whoami: async () => ({ ok: true, data: { role } }),
    signIn: async () => ({ ok: true, data: { sent: true } }),
    signOut: async () => ({ ok: true, data: { signedOut: true } }),
    claimOwnership: async () => ({ ok: true, data: { role: 'owner' } }),
    ...rest,
  };
}

let container;
let root;

async function render({ env = ENV_ON, repository = repositoryFor() } = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(AuthProvider, {
      deps: {
        env,
        createClient: fakeClient,
        createRepository: () => repository,
        windowLike: fakeWindow(),
      },
    }, React.createElement(AuthFooterPanel)));
  });
  return container;
}

const text = () => container.textContent;
const q = (sel) => container.querySelector(sel);
const button = (label) => [...container.querySelectorAll('button')]
  .find((b) => b.textContent.toLowerCase().includes(label.toLowerCase()));

beforeEach(() => { container = null; root = null; });
afterEach(async () => {
  if (root) await act(async () => { root.unmount(); });
  container?.remove();
  vi.restoreAllMocks();
});

describe('there is no login wall, ever', () => {
  it('renders a bounded panel and gates no content behind it', async () => {
    await render();
    // The panel is a leaf: it renders no children of its own and cannot wrap or
    // hide the app. Everything it emits lives inside its own test-id container.
    expect(q('[data-testid="fm-auth-panel"]')).not.toBeNull();
    expect(container.children.length).toBe(1);
    expect(text()).toContain('read-only');
  });

  it('renders NOTHING when Supabase is unconfigured — production is untouched', async () => {
    await render({ env: {} });
    expect(container.innerHTML).toBe('');
    expect(q('[data-testid="fm-auth-panel"]')).toBeNull();
  });
});

describe('signed out, configured', () => {
  it('states read-only accurately, and offers sign-in rather than demanding it', async () => {
    await render();
    expect(text()).toContain('Viewing read-only');
    expect(text()).toContain('invitation only');
    expect(button('Email me a sign-in link')).toBeTruthy();
  });

  it('the email control is labelled and keyboard reachable', async () => {
    await render();
    const input = q('#fm-auth-email');
    expect(input).not.toBeNull();
    expect(input.type).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
    // A real <label for>, and a native <button type=submit> — both tabbable and
    // operable by keyboard without any custom handler.
    const label = container.querySelector('label[for="fm-auth-email"]');
    expect(label).not.toBeNull();
    expect(label.textContent).toBe('Email address');
    expect(button('Email me a sign-in link').type).toBe('submit');
    expect(input.getAttribute('aria-describedby')).toBe('fm-auth-status');
    expect(q('#fm-auth-status').getAttribute('role')).toBe('status');
  });

  it('submitting shows "link sent" against the address used', async () => {
    await render();
    const input = q('#fm-auth-email');
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'someone@example.com');
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    await act(async () => {
      q('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(text()).toContain('Check someone@example.com for a sign-in link');
  });

  it('an invalid address is reported without a network call', async () => {
    const signIn = vi.fn(async () => ({
      ok: false, error: { kind: 'validation', issues: [{ field: 'email', code: 'invalidEmail' }] },
    }));
    await render({ repository: repositoryFor({ signIn }) });
    await act(async () => {
      q('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(text()).toContain('Enter a valid email address.');
  });

  it('an uninvited address is phrased without confirming whether it exists', async () => {
    const signIn = async () => ({
      ok: false, error: { kind: 'validation', issues: [{ field: 'email', code: 'notInvited' }] },
    });
    await render({ repository: repositoryFor({ signIn }) });
    await act(async () => {
      q('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(text()).toContain('invitation-only');
  });

  it('a transport failure is retryable, not fatal', async () => {
    const signIn = async () => ({ ok: false, error: { kind: 'offline' } });
    await render({ repository: repositoryFor({ signIn }) });
    await act(async () => {
      q('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(text()).toContain('Could not reach the server');
    expect(button('Email me a sign-in link')).toBeTruthy();
  });
});

describe('signed-in non-member is never presented as a member', () => {
  it('says signed in AND no access, and offers the claim as an explicit action', async () => {
    await render({ repository: repositoryFor({ userId: USER, role: null }) });
    expect(text()).toContain('Signed in · no workspace access');
    expect(text()).toContain('not a member of this workspace');
    expect(text()).toContain('reading exactly what a signed-out visitor reads');
    expect(text()).not.toContain('Membership resolved as');
    const claim = button('Claim ownership');
    expect(claim).toBeTruthy();
    expect(claim.type).toBe('button');
  });

  it('an already-claimed workspace is reported safely', async () => {
    const claimOwnership = async () => ({ ok: false, error: { kind: 'forbidden' } });
    await render({ repository: repositoryFor({ userId: USER, role: null, claimOwnership }) });
    await act(async () => { button('Claim ownership').click(); });
    expect(text()).toContain('already has an owner');
    expect(text()).toContain('Signed in · no workspace access');
  });
});

describe('member', () => {
  it.each(['owner', 'editor', 'viewer'])('shows the resolved %s role', async (role) => {
    await render({ repository: repositoryFor({ userId: USER, role }) });
    expect(text()).toContain(`Signed in · ${role}`);
    expect(text()).toContain('Membership resolved as');
    expect(button('Claim ownership')).toBeUndefined();
  });

  it('does NOT claim that edits are durable before Gate 6', async () => {
    await render({ repository: repositoryFor({ userId: USER, role: 'owner' }) });
    expect(text()).toContain('Saving to the database is not enabled yet');
    expect(text()).toContain('still live only in this browser');
  });

  it('signing out returns the panel to the signed-out state', async () => {
    await render({ repository: repositoryFor({ userId: USER, role: 'owner' }) });
    expect(text()).toContain('Signed in · owner');
    await act(async () => { button('Sign out').click(); });
    expect(text()).toContain('Viewing read-only');
    expect(text()).not.toContain('Signed in · owner');
    expect(q('#fm-auth-email')).not.toBeNull();
  });

  it('a failed sign-out does not leave the UI looking signed out', async () => {
    const signOut = async () => ({ ok: false, error: { kind: 'offline' } });
    await render({ repository: repositoryFor({ userId: USER, role: 'owner', signOut }) });
    await act(async () => { button('Sign out').click(); });
    expect(text()).toContain('Signed in · owner');
  });
});

describe('the user UUID is never rendered', () => {
  // It is a stable internal identifier that tells the signed-in person nothing
  // they do not already know, and even a prefix ends up in screenshots and
  // support threads. Both the full id and its first-8 prefix are asserted absent.
  const PREFIX = USER.slice(0, 8);

  it.each(['owner', 'editor', 'viewer'])('not for a member (%s)', async (role) => {
    await render({ repository: repositoryFor({ userId: USER, role }) });
    expect(text()).not.toContain(USER);
    expect(text()).not.toContain(PREFIX);
    expect(container.innerHTML).not.toContain(USER);
    expect(container.innerHTML).not.toContain(PREFIX);
    // Non-vacuous: the panel really did render the signed-in member state.
    expect(text()).toContain(`Signed in · ${role}`);
  });

  it('not for a signed-in non-member either', async () => {
    await render({ repository: repositoryFor({ userId: USER, role: null }) });
    expect(text()).not.toContain(USER);
    expect(text()).not.toContain(PREFIX);
    expect(container.innerHTML).not.toContain(PREFIX);
    expect(text()).toContain('Signed in · no workspace access');
  });

  it('the word "session" no longer labels an identifier', async () => {
    await render({ repository: repositoryFor({ userId: USER, role: 'owner' }) });
    expect(text()).not.toMatch(/session\s+[0-9a-f]{4}/i);
  });
});

describe('invalid configuration', () => {
  it('explains itself, keeps the site usable, and prints no value', async () => {
    await render({
      env: { VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_TOPSECRET' },
    });
    expect(text()).toContain('Sign-in is unavailable');
    expect(text()).toContain('continues to work read-only');
    expect(text()).toContain('secretKeySupplied');
    expect(text()).not.toContain('TOPSECRET');
    expect(q('#fm-auth-email')).toBeNull();
  });
});

describe('mobile smoke at 375px', () => {
  it('renders every control with no fixed width that could overflow', async () => {
    // jsdom does not lay out, so this asserts the STRUCTURAL property that makes
    // 375px work: the input is w-full until the sm: breakpoint, and the row is
    // column-first. The rendered-pixel check is the real-browser smoke test.
    await render();
    const form = q('form');
    expect(form.className).toContain('flex-col');
    expect(form.className).toContain('sm:flex-row');
    expect(q('#fm-auth-email').className).toContain('w-full');
    expect(q('#fm-auth-email').className).toContain('sm:w-64');
  });
});
