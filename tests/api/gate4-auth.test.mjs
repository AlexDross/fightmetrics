// Stage 7 Gate 4 — the auth repository against the REAL local stack.
//
// Everything here goes over real HTTP to the local, unlinked PostgREST and
// GoTrue, through a real @supabase/supabase-js client. The unit suite proves the
// repository's logic against fakes; this proves the wiring — that
// `shouldCreateUser: false` reaches GoTrue, that `fm_member_whoami` resolves
// over PostgREST, and that the anonymous boundary is enforced by the server
// rather than by the client.
//
// No key is ever printed: coordinates come from the harness's allowlisted
// status() and are used only as arguments.
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

import { status, applyFixture, authToken, expiredAuthToken, USER_MEMBER } from './helpers.mjs';
import { createSupabaseAuthRepository } from '../../src/data/repositories/supabaseAuth.mjs';
import { createSupabaseClient } from '../../src/data/supabase/client.mjs';
import { CONFIG_STATUS } from '../../src/data/supabase/config.mjs';

const LOCATION = { origin: 'http://localhost:3001' };

/** The API origin, derived from REST_URL so no extra status field is exposed. */
const apiUrl = () => status().REST_URL.replace(/\/rest\/v1\/?$/, '');

const realClient = () => createSupabaseClient({
  status: CONFIG_STATUS.CONFIGURED,
  url: apiUrl(),
  publishableKey: status().ANON_KEY,
}, { createClient });

const repoFor = (slug, client = realClient()) =>
  createSupabaseAuthRepository({ client, slug, location: LOCATION });

beforeAll(() => { applyFixture(); }, 120_000);

describe('the real client is built from the two public values only', () => {
  it('constructs against the local stack and exposes the auth surface', () => {
    const client = realClient();
    expect(typeof client.auth.getSession).toBe('function');
    expect(typeof client.auth.signInWithOtp).toBe('function');
    expect(typeof client.rpc).toBe('function');
  });
});

describe('anonymous, over real HTTP', () => {
  it('session() is null — no session, and no role invented', async () => {
    await expect(repoFor('api-public').session()).resolves.toEqual({ ok: true, data: null });
  });

  // MEASURED against the real stack, and it is by design: the migration grants
  // `fm_member_*` to `authenticated` only (`fm_read_*` is the anon surface). So
  // an anonymous whoami is refused by Postgres before the function body runs.
  //
  // This is exactly why the provider resolves the SESSION first and only asks
  // for membership once one exists — an anonymous membership request is both
  // pointless and refused. The signed-out UI never issues it.
  it('whoami() is refused for an anonymous caller — fm_member_* is authenticated-only', async () => {
    const result = await repoFor('api-public').whoami();
    expect(result).toEqual({ ok: false, error: { kind: 'forbidden' } });
  });

  it('claimOwnership() is refused client-side and reaches no RPC', async () => {
    const result = await repoFor('api-claim').claimOwnership();
    expect(result).toEqual({ ok: false, error: { kind: 'unauthenticated' } });
  });

  it('the SERVER enforces the boundary too: anon on a member surface is forbidden', async () => {
    // Not a repository call — the point is that the refusal comes from Postgres,
    // so the client-side guard above is defence in depth, not the boundary.
    const { error } = await realClient().rpc('fm_member_roi', { p_slug: 'api-public' });
    expect(error?.code).toBe('42501');
  });
});

describe('membership resolves over real PostgREST for a real session', () => {
  it('an owner resolves as owner; a non-member on the same workspace does not', async () => {
    const token = authToken(USER_MEMBER);
    const authed = createClient(apiUrl(), status().ANON_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const asMember = await repoFor('api-private', authed).whoami();
    expect(asMember).toEqual({ ok: true, data: { role: 'owner' } });

    // Same workspace, no identity: refused at the grant, per the note above.
    const asAnon = await repoFor('api-private').whoami();
    expect(asAnon).toEqual({ ok: false, error: { kind: 'forbidden' } });
  });

  it('a signed-in NON-member resolves to role null — the middle row of §10', async () => {
    const { USER_OUTSIDER } = await import('./helpers.mjs');
    const authed = createClient(apiUrl(), status().ANON_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${authToken(USER_OUTSIDER)}` } },
    });
    // api-public has exactly one member (USER_MEMBER as owner), so the outsider
    // is authenticated and role-less: signed in, not a member.
    await expect(repoFor('api-public', authed).whoami())
      .resolves.toEqual({ ok: true, data: { role: null } });
  });

  it('an unknown slug is notFound, distinguishable from "no role"', async () => {
    const authed = createClient(apiUrl(), status().ANON_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${authToken(USER_MEMBER)}` } },
    });
    await expect(repoFor('no-such-workspace-slug', authed).whoami())
      .resolves.toEqual({ ok: false, error: { kind: 'notFound' } });
  });

  it('a viewer resolves as viewer — membership is a role, not a boolean', async () => {
    const { USER_VIEWER } = await import('./helpers.mjs');
    const authed = createClient(apiUrl(), status().ANON_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${authToken(USER_VIEWER)}` } },
    });
    await expect(repoFor('api-private', authed).whoami())
      .resolves.toEqual({ ok: true, data: { role: 'viewer' } });
  });
});

describe('an EXPIRED credential resolves to unauthenticated, over real HTTP', () => {
  // The regression this locks down: PostgREST answers an expired JWT with
  // `code: 'PGRST303'` and **no HTTP status on the SDK error object**, so a
  // status-only mapping fell through to a generic `server` error and the UI was
  // told the server was broken rather than that the session had ended.
  //
  // The token is minted locally from the local secret and is never printed,
  // asserted against, or written to a snapshot — only its EFFECT is asserted.
  const expiredClient = () => createClient(apiUrl(), status().ANON_KEY, {
    auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${expiredAuthToken(USER_MEMBER)}` } },
  });

  it('whoami() with an expired JWT is unauthenticated, not a server error', async () => {
    const result = await repoFor('api-private', expiredClient()).whoami();
    expect(result).toEqual({ ok: false, error: { kind: 'unauthenticated' } });
  });

  it('the same identity with a VALID token still resolves as owner', async () => {
    // Non-vacuous: it is the EXPIRY that changes the outcome, not the fixture.
    const valid = createClient(apiUrl(), status().ANON_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${authToken(USER_MEMBER)}` } },
    });
    await expect(repoFor('api-private', valid).whoami())
      .resolves.toEqual({ ok: true, data: { role: 'owner' } });
  });

  it('claimOwnership() with an expired JWT is unauthenticated too', async () => {
    const result = await repoFor('api-claim', expiredClient()).claimOwnership();
    expect(result.ok).toBe(false);
    expect(result.error.kind).toBe('unauthenticated');
  });

  it('no part of the token reaches the mapped error', async () => {
    const result = await repoFor('api-private', expiredClient()).whoami();
    const blob = JSON.stringify(result);
    expect(blob).not.toContain('eyJ');
    expect(blob).not.toContain('Bearer');
    // The mapped error is a bare kind — no code, no message, nothing to leak.
    expect(Object.keys(result.error)).toEqual(['kind']);
  });
});

describe('magic link against real GoTrue', () => {
  it('shouldCreateUser:false is honoured by the SERVER for an unknown address', async () => {
    // The address is deliberately absent from auth.users. Real GoTrue refuses to
    // create it, which is what proves the flag crossed the wire — and the
    // repository reports it as a validation outcome, not a server fault.
    const result = await repoFor('api-public').signIn('nobody-gate4@example.test');
    expect(result.ok).toBe(false);
    expect(result.error.kind).toBe('validation');
    expect(result.error.issues[0].field).toBe('email');
    expect(JSON.stringify(result)).not.toContain('eyJ');
  });

  it('an invalid address never reaches the network', async () => {
    const result = await repoFor('api-public').signIn('not-an-email');
    expect(result.error).toEqual({
      kind: 'validation', issues: [{ field: 'email', code: 'invalidEmail' }],
    });
  });
});

describe('nothing credential-bearing escapes a real error', () => {
  it('a real PostgREST refusal carries no token, key or database URL', async () => {
    const { error } = await realClient().rpc('fm_member_export_store', { p_slug: 'api-private' });
    const blob = JSON.stringify(error ?? {});
    expect(blob).not.toContain('eyJ');
    expect(blob).not.toContain('sb_secret');
    expect(blob).not.toContain('postgresql://');
  });
});
