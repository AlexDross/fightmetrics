import { describe, it, expect, vi } from 'vitest';
import {
  createSupabaseAuthRepository, safeRedirectTo, scrubMessage,
  mapPostgrestError, mapAuthError, mapSessionError, isPostgrestAuthCode,
  isSessionFailureCode, SESSION_FAILURE_CODES, DEFAULT_WORKSPACE_SLUG,
} from '../supabaseAuth.mjs';
import { REPOSITORY_CONTRACT } from '../interfaces.mjs';

const USER = '00000000-0000-4000-8000-0000000000aa';
const ORIGIN = { origin: 'https://fightmetrics.example' };

/**
 * A fake client with the same two surfaces the repository touches. Scripted, so
 * every state below is reached by CALLING the repository rather than by
 * constructing it in that state.
 */
function fakeClient(script = {}) {
  const calls = { rpc: [], signInWithOtp: [], signOut: 0, getSession: 0 };
  let session = script.session ?? null;
  const client = {
    calls,
    get session() { return session; },
    auth: {
      getSession: async () => {
        calls.getSession += 1;
        if (script.getSessionThrows) throw script.getSessionThrows;
        if (script.getSessionError) return { data: { session: null }, error: script.getSessionError };
        return { data: { session }, error: null };
      },
      signInWithOtp: async (args) => {
        calls.signInWithOtp.push(args);
        if (script.signInThrows) throw script.signInThrows;
        return { data: {}, error: script.signInError ?? null };
      },
      signOut: async () => {
        calls.signOut += 1;
        if (script.signOutThrows) throw script.signOutThrows;
        if (script.signOutError) return { error: script.signOutError };
        if (!script.signOutLeavesSession) session = null;
        return { error: null };
      },
    },
    rpc: async (name, args) => {
      calls.rpc.push({ name, args });
      const handler = script.rpc?.[name];
      if (typeof handler === 'function') return handler(args);
      return { data: handler ?? [], error: null };
    },
  };
  return client;
}

const signedIn = (extra = {}) => fakeClient({ session: { user: { id: USER } }, ...extra });

describe('contract conformance', () => {
  const repo = createSupabaseAuthRepository({ client: fakeClient(), location: ORIGIN });

  it('provides exactly the contract methods, with exact arities', () => {
    const contract = REPOSITORY_CONTRACT.authRepository;
    for (const [method, arity] of Object.entries(contract)) {
      expect(typeof repo[method], method).toBe('function');
      expect(repo[method].length, `${method} arity`).toBe(arity);
    }
  });

  it('widens the enumerable surface by nothing', () => {
    expect(Object.keys(repo).sort())
      .toEqual(Object.keys(REPOSITORY_CONTRACT.authRepository).sort());
  });

  it('requires a client rather than degrading silently', () => {
    expect(() => createSupabaseAuthRepository({})).toThrow(/requires a client/);
    expect(() => createSupabaseAuthRepository()).toThrow(/requires a client/);
  });
});

describe('session() reports presence only', () => {
  it('null when signed out', async () => {
    const repo = createSupabaseAuthRepository({ client: fakeClient(), location: ORIGIN });
    await expect(repo.session()).resolves.toEqual({ ok: true, data: null });
  });

  it('{userId} when signed in, and NEVER a role', async () => {
    const repo = createSupabaseAuthRepository({ client: signedIn(), location: ORIGIN });
    const result = await repo.session();
    expect(result).toEqual({ ok: true, data: { userId: USER } });
    expect(Object.keys(result.data)).toEqual(['userId']);
    expect(JSON.stringify(result)).not.toMatch(/owner|editor|viewer|role/);
  });

  it('maps a transport failure to offline', async () => {
    const client = fakeClient({ getSessionThrows: new TypeError('Failed to fetch') });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.session()).resolves.toEqual({ ok: false, error: { kind: 'offline' } });
  });
});

describe('whoami() reports membership only', () => {
  const withRole = (role) => signedIn({ rpc: { fm_member_whoami: [{ workspace_id: 'w', role }] } });

  it.each(['owner', 'editor', 'viewer'])('resolves %s', async (role) => {
    const repo = createSupabaseAuthRepository({ client: withRole(role), location: ORIGIN });
    await expect(repo.whoami()).resolves.toEqual({ ok: true, data: { role } });
  });

  it('resolves null for a signed-in non-member', async () => {
    const repo = createSupabaseAuthRepository({ client: withRole(null), location: ORIGIN });
    await expect(repo.whoami()).resolves.toEqual({ ok: true, data: { role: null } });
  });

  // Shape only: `whoami` returns membership and asks for no session. What the
  // real server does with an ANONYMOUS caller is a grant question, answered in
  // tests/api/gate4-auth.test.mjs — `fm_member_*` is authenticated-only, so an
  // anonymous whoami is forbidden there. This asserts the repository never
  // invents a user, whatever the row says.
  it('never fabricates a session — the payload is a role, never a user', async () => {
    const client = fakeClient({ rpc: { fm_member_whoami: [{ workspace_id: 'w', role: null }] } });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    const result = await repo.whoami();
    expect(Object.keys(result.data)).toEqual(['role']);
    expect(JSON.stringify(result)).not.toContain('userId');
    expect(client.calls.getSession).toBe(0);
  });

  it('calls the approved RPC with the workspace slug', async () => {
    const client = withRole('owner');
    await createSupabaseAuthRepository({ client, location: ORIGIN }).whoami();
    expect(client.calls.rpc).toEqual([
      { name: 'fm_member_whoami', args: { p_slug: DEFAULT_WORKSPACE_SLUG } },
    ]);
  });

  it('an unknown slug is notFound, distinguishable from "no role"', async () => {
    const client = fakeClient({ rpc: { fm_member_whoami: [] } });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.whoami()).resolves.toEqual({ ok: false, error: { kind: 'notFound' } });
  });

  it('maps 42501 to forbidden', async () => {
    const client = fakeClient({
      rpc: { fm_member_whoami: () => ({ data: null, error: { code: '42501', message: 'permission denied' } }) },
    });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.whoami()).resolves.toEqual({ ok: false, error: { kind: 'forbidden' } });
  });
});

describe('signIn(email) — magic link, invitation only', () => {
  it('passes shouldCreateUser:false and a redirect derived from the live origin', async () => {
    const client = fakeClient();
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.signIn('someone@example.com')).resolves.toEqual({ ok: true, data: { sent: true } });
    expect(client.calls.signInWithOtp).toEqual([{
      email: 'someone@example.com',
      options: { shouldCreateUser: false, emailRedirectTo: 'https://fightmetrics.example/' },
    }]);
  });

  it('never fabricates a production or preview redirect', async () => {
    const client = fakeClient();
    const repo = createSupabaseAuthRepository({ client, location: { origin: 'http://localhost:3001' } });
    await repo.signIn('someone@example.com');
    expect(client.calls.signInWithOtp[0].options.emailRedirectTo).toBe('http://localhost:3001/');
  });

  it.each(['', '   ', 'nope', 'a@b', 'a b@example.com', null, 42])(
    'rejects %p as a validation error before any network call', async (email) => {
      const client = fakeClient();
      const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
      const result = await repo.signIn(email);
      expect(result.ok).toBe(false);
      expect(result.error.kind).toBe('validation');
      expect(client.calls.signInWithOtp).toEqual([]);
    });

  it('refuses an unsafe origin rather than sending a link somewhere else', async () => {
    const client = fakeClient();
    for (const location of [{ origin: 'null' }, { origin: 'file://' }, {}]) {
      const repo = createSupabaseAuthRepository({ client, location });
      const result = await repo.signIn('someone@example.com');
      expect(result.error).toEqual({ kind: 'validation', issues: [{ field: 'redirect', code: 'unsafeOrigin' }] });
    }
    expect(client.calls.signInWithOtp).toEqual([]);
  });

  it('reports an uninvited address as validation, not a server fault', async () => {
    const client = fakeClient({ signInError: { status: 400, message: 'Signups not allowed for otp' } });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    const result = await repo.signIn('stranger@example.com');
    expect(result.error).toEqual({ kind: 'validation', issues: [{ field: 'email', code: 'notInvited' }] });
  });

  it('maps a network failure to offline', async () => {
    const client = fakeClient({ signInThrows: new TypeError('Failed to fetch') });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.signIn('a@example.com')).resolves.toEqual({ ok: false, error: { kind: 'offline' } });
  });
});

describe('signOut() is a real transition', () => {
  it('clears the session and reports the transition', async () => {
    const client = signedIn();
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    expect((await repo.session()).data).toEqual({ userId: USER });
    await expect(repo.signOut()).resolves.toEqual({ ok: true, data: { signedOut: true } });
    await expect(repo.session()).resolves.toEqual({ ok: true, data: null });
  });

  it('a surviving session is NOT reported as a completed sign-out', async () => {
    const client = signedIn({ signOutLeavesSession: true });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    const result = await repo.signOut();
    expect(result.ok).toBe(false);
    expect(result.error.kind).toBe('server');
    expect(result.error.code).toBe('signOutIncomplete');
  });

  it('a failed sign-out is an error, not a success', async () => {
    const client = signedIn({ signOutError: { status: 500, message: 'boom' } });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    const result = await repo.signOut();
    expect(result.ok).toBe(false);
  });
});

describe('claimOwnership() is explicit and session-bound', () => {
  const claimOk = { fm_rpc_claim_workspace_ownership: [{ workspace_id: 'w', role: 'owner' }] };

  it('is unauthenticated without a session, and calls no RPC', async () => {
    const client = fakeClient({ rpc: claimOk });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.claimOwnership()).resolves.toEqual({ ok: false, error: { kind: 'unauthenticated' } });
    expect(client.calls.rpc).toEqual([]);
  });

  it('resolves the caller as owner on success', async () => {
    const client = signedIn({ rpc: claimOk });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.claimOwnership()).resolves.toEqual({ ok: true, data: { role: 'owner' } });
    expect(client.calls.rpc).toEqual([
      { name: 'fm_rpc_claim_workspace_ownership', args: { p_slug: DEFAULT_WORKSPACE_SLUG } },
    ]);
  });

  it('an already-claimed workspace is forbidden', async () => {
    const client = signedIn({
      rpc: { fm_rpc_claim_workspace_ownership: () => ({ data: null, error: { code: '42501', message: 'workspace already claimed' } }) },
    });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.claimOwnership()).resolves.toEqual({ ok: false, error: { kind: 'forbidden' } });
  });

  it('an unknown slug is notFound', async () => {
    const client = signedIn({
      rpc: { fm_rpc_claim_workspace_ownership: () => ({ data: null, error: { code: '42704', message: 'unknown workspace slug' } }) },
    });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.claimOwnership()).resolves.toEqual({ ok: false, error: { kind: 'notFound' } });
  });

  it('is never automatic: nothing claims without the method being called', async () => {
    const rpc = vi.fn(async () => ({ data: [], error: null }));
    const client = signedIn();
    client.rpc = rpc;
    createSupabaseAuthRepository({ client, location: ORIGIN });
    await new Promise((r) => setTimeout(r, 0));
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe('no token, key or raw response escapes through an error', () => {
  const JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.c2lnbmF0dXJlX3ZhbHVl';
  const SECRET = 'sb_secret_TOPSECRETVALUE';
  const DBURL = 'postgresql://postgres:hunter2@db.example.com:5432/postgres';

  it('scrubs credentials out of any message', () => {
    const text = scrubMessage(`failed with ${JWT} and ${SECRET} and ${DBURL} and sbp_EXAMPLE_NOT_A_REAL_TOKEN`);
    expect(text).not.toContain(JWT);
    expect(text).not.toContain('TOPSECRET');
    expect(text).not.toContain('hunter2');
    expect(text).not.toContain('sbp_EXAMPLE_NOT_A_REAL_TOKEN');
    expect(text).toContain('[redacted-jwt]');
    expect(text).toContain('[redacted-key]');
    expect(text).toContain('[redacted-database-url]');
  });

  it('never attaches the raw error object', async () => {
    const raw = {
      status: 500,
      message: `Bearer ${JWT} rejected by ${DBURL}`,
      response: { headers: { Authorization: `Bearer ${JWT}` } },
      apikey: SECRET,
    };
    const client = signedIn({ rpc: { fm_member_whoami: () => ({ data: null, error: raw }) } });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    const result = await repo.whoami();
    const blob = JSON.stringify(result);
    expect(blob).not.toContain(JWT);
    expect(blob).not.toContain('TOPSECRET');
    expect(blob).not.toContain('hunter2');
    expect(blob).not.toContain('Authorization');
    expect(Object.keys(result.error).sort()).toEqual(['code', 'kind', 'message']);
  });

  it('scrubs sign-in failures too', async () => {
    const client = fakeClient({ signInError: { status: 500, message: `apikey=${SECRET}` } });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    const result = await repo.signIn('a@example.com');
    expect(JSON.stringify(result)).not.toContain('TOPSECRET');
  });
});

describe('PostgREST JWT codes are unauthenticated, not server errors', () => {
  // These arrive on `code` with NO http status attached to the SDK error, so
  // they must be classified before the SQLSTATE and status branches. Measured:
  // an expired JWT returns PGRST303 with `status` undefined, which previously
  // fell through to a generic server error.
  it.each(['PGRST301', 'PGRST302', 'PGRST303'])('%s maps to unauthenticated', (code) => {
    expect(isPostgrestAuthCode(code)).toBe(true);
    expect(mapPostgrestError({ code, message: 'JWSError JWSInvalidSignature' }))
      .toEqual({ ok: false, error: { kind: 'unauthenticated' } });
    // …with no status at all, which is the case that used to fail.
    expect(mapPostgrestError({ code }))
      .toEqual({ ok: false, error: { kind: 'unauthenticated' } });
  });

  it('PGRST300 stays a SERVER error — it is a server misconfiguration', () => {
    expect(isPostgrestAuthCode('PGRST300')).toBe(false);
    const result = mapPostgrestError({ code: 'PGRST300', message: 'no jwt secret' });
    expect(result.ok).toBe(false);
    expect(result.error.kind).toBe('server');
    expect(result.error.code).toBe('PGRST300');
  });

  it('the auth codes win over a misleading status', () => {
    expect(mapPostgrestError({ code: 'PGRST301', status: 500 }).error.kind)
      .toBe('unauthenticated');
  });

  it('an expired JWT through whoami() reports unauthenticated', async () => {
    const client = signedIn({
      rpc: { fm_member_whoami: () => ({ data: null, error: { code: 'PGRST303', message: 'JWT expired' } }) },
    });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.whoami()).resolves.toEqual({ ok: false, error: { kind: 'unauthenticated' } });
  });
});

describe('session resolution classifies its OWN failures', () => {
  // The sign-in mapping treats 400 as "that email was rejected". Reusing it for
  // session resolution produced a validation error on an email nobody typed.
  it.each([
    ['a missing refresh token', { status: 400, message: 'Invalid Refresh Token: Refresh Token Not Found' }],
    ['an expired session', { status: 400, message: 'session_expired' }],
    ['a bad JWT', { status: 401, message: 'bad_jwt' }],
    ['a bare 400', { status: 400, message: 'something' }],
    ['a PostgREST auth code', { code: 'PGRST301' }],
    ['an invalid claim', { message: 'invalid claim: missing sub' }],
  ])('%s resolves to unauthenticated', (_label, error) => {
    expect(mapSessionError(error)).toEqual({ ok: false, error: { kind: 'unauthenticated' } });
  });

  it('never produces an email validation error', () => {
    const result = mapSessionError({ status: 400, message: 'Invalid Refresh Token' });
    expect(result.error.kind).not.toBe('validation');
    expect(JSON.stringify(result)).not.toContain('email');
  });

  it('a transport fault stays offline and a 500 stays server', () => {
    expect(mapSessionError(new TypeError('Failed to fetch')).error.kind).toBe('offline');
    expect(mapSessionError({ status: 500, message: 'upstream boom' }).error.kind).toBe('server');
  });

  // The defect this locks down: a bare `jwt` substring in the credential match
  // swallowed "JWT secret missing" and "JWT signing service unavailable", so two
  // SERVER faults cleared a valid member state and sent the user round a
  // sign-in loop that no credential could ever complete.
  describe('a server fault that merely MENTIONS a token stays a server fault', () => {
    it.each([
      ['PGRST300 with the secret missing', { code: 'PGRST300', message: 'JWT secret missing' }],
      ['a 500 with the secret missing', { status: 500, message: 'JWT secret missing' }],
      ['a 500 with the signer down', { status: 500, message: 'JWT signing service unavailable' }],
      ['a 502 gateway failure', { status: 502, message: 'bad gateway' }],
      ['a 503 naming JWT verification', { status: 503, message: 'JWT verification backend down' }],
    ])('%s -> server', (_label, error) => {
      expect(mapSessionError(error).error.kind).toBe('server');
    });

    it('PGRST300 is a deployment fault, never a credential one', () => {
      const result = mapSessionError({ code: 'PGRST300', message: 'JWT secret missing' });
      expect(result.error.kind).toBe('server');
      expect(result.error.code).toBe('PGRST300');
      // …and the same code through the PostgREST mapping agrees.
      expect(mapPostgrestError({ code: 'PGRST300', message: 'JWT secret missing' }).error.kind)
        .toBe('server');
    });

    it('a credential NOUN alone never decides — for any noun', () => {
      // Two bugs came from bare nouns: first `jwt`, then `refresh token`. This
      // pins the rule itself rather than the two instances of it.
      for (const noun of ['jwt', 'token', 'refresh token', 'refresh_token', 'session', 'access token']) {
        expect(mapSessionError({ message: noun }).error.kind, noun).toBe('server');
      }
      // …while the same nouns WITH an adjacent condition do decide.
      for (const phrase of ['jwt expired', 'token is invalid', 'refresh token not found',
                            'refresh_token_revoked', 'session expired', 'access token malformed']) {
        expect(mapSessionError({ message: phrase }).error.kind, phrase).toBe('unauthenticated');
      }
    });
  });

  // The second bare-noun defect: `refresh[_ ]?token` on its own turned every
  // refresh-token INFRASTRUCTURE fault into a forced sign-out.
  describe('a refresh-token outage is an outage, not an expired credential', () => {
    it.each([
      ['the service is down', { message: 'Refresh token service unavailable' }],
      ['the service is misconfigured', { message: 'Refresh token configuration missing' }],
      ['its database timed out', { message: 'Refresh token database timeout' }],
      ['a backend dependency failed', { code: 'refresh_token_backend_error', message: 'temporary dependency failure' }],
    ])('%s -> server', (_label, error) => {
      expect(mapSessionError(error).error.kind).toBe('server');
    });

    it('"configuration missing" does not borrow the word "missing"', () => {
      // Adjacency is the load-bearing part: the message contains a credential
      // noun AND the word "missing", but the condition attaches to the
      // configuration, not to the token.
      expect(mapSessionError({ message: 'Refresh token configuration missing' }).error.kind)
        .toBe('server');
      expect(mapSessionError({ message: 'Refresh token missing' }).error.kind)
        .toBe('unauthenticated');
    });

    it('an unknown refresh-token code is not an allowlisted one', () => {
      expect(isSessionFailureCode('refresh_token_backend_error')).toBe(false);
      expect(isSessionFailureCode('refresh_token_not_found')).toBe(true);
      expect(isSessionFailureCode('REFRESH_TOKEN_ALREADY_USED')).toBe(true);
      expect(isSessionFailureCode(null)).toBe(false);
    });

    it('the allowlist reads `code` only, never the message', () => {
      // A server fault whose CODE is not allowlisted stays a server fault even
      // though its message mentions the credential system.
      expect(mapSessionError({ code: 'refresh_token_backend_error', message: 'refresh token subsystem degraded' }).error.kind)
        .toBe('server');
    });

    it('documented limit: prose that literally contains a failure phrase still matches', () => {
      // Accepted, and stated rather than hidden. A message like
      // "internal handler for refresh_token_not_found crashed" contains a real
      // noun+condition pair, and no regex can tell that it is being QUOTED
      // rather than reported. Distinguishing the two needs a code, which is
      // exactly why the code allowlist is checked first and why servers should
      // send one. The failure mode is a spurious sign-out, not a spurious
      // authorisation, so it is safe in the direction that matters.
      expect(mapSessionError({ message: 'internal handler for refresh_token_not_found crashed' }).error.kind)
        .toBe('unauthenticated');
    });
  });

  describe('the explicit PostgREST credential codes still win', () => {
    it.each(['PGRST301', 'PGRST302', 'PGRST303'])('%s -> unauthenticated', (code) => {
      expect(mapSessionError({ code }).error.kind).toBe('unauthenticated');
    });

    it('…even carrying a misleading 5xx status', () => {
      for (const code of ['PGRST301', 'PGRST302', 'PGRST303']) {
        expect(mapSessionError({ code, status: 500 }).error.kind, code)
          .toBe('unauthenticated');
      }
    });
  });

  describe('the two channels are literally separate', () => {
    // The defect: the heuristic used to run against `code + message`, which
    // undid the exactness of the allowlist — an unknown infrastructure code that
    // merely CONTAINED a known one was substring-classified as a credential
    // failure and signed a valid member out.
    it.each([
      'invalid_token_backend_error',
      'session_not_found_in_cache_backend',
      'refresh_token_not_found_in_database',
      'refresh_token_revoked_by_cache_sweeper',
      'bad_jwt_verifier_pool_exhausted',
    ])('unknown infrastructure code %s -> server', (code) => {
      expect(isSessionFailureCode(code)).toBe(false);
      expect(mapSessionError({ code }).error.kind).toBe('server');
    });

    it('an unknown code stays server even beside a neutral message', () => {
      expect(mapSessionError({
        code: 'refresh_token_not_found_in_database',
        message: 'primary replica unreachable',
      }).error.kind).toBe('server');
    });

    it('the heuristic reads `message` only — the code cannot feed it', () => {
      // Same string in each position. As a MESSAGE it is a credential
      // assertion; as a CODE it is an unknown identifier and nothing more.
      expect(mapSessionError({ message: 'refresh token not found' }).error.kind)
        .toBe('unauthenticated');
      expect(mapSessionError({ code: 'refresh_token_not_found_in_database' }).error.kind)
        .toBe('server');
    });

    it('EVERY allowlisted code maps to unauthenticated', () => {
      // Derived from the exported list, so this coverage cannot go stale if the
      // allowlist changes.
      expect(SESSION_FAILURE_CODES.length).toBeGreaterThan(0);
      for (const code of SESSION_FAILURE_CODES) {
        expect(isSessionFailureCode(code), code).toBe(true);
        expect(mapSessionError({ code }).error.kind, code).toBe('unauthenticated');
      }
    });
  });

  describe('precise credential signals still resolve to unauthenticated', () => {
    it.each([
      ['the observed expired-JWT signal', { code: 'PGRST303', message: 'JWT expired' }],
      ['an expired JWT with no code at all', { message: 'JWT expired' }],
      ['a missing refresh token', { status: 400, message: 'Invalid Refresh Token: Refresh Token Not Found' }],
      ['GoTrue refresh_token_not_found', { code: 'refresh_token_not_found' }],
      ['a refresh token already spent', { code: 'refresh_token_already_used' }],
      ['a revoked refresh token', { code: 'refresh_token_revoked' }],
      ['a reused refresh token, in prose', { message: 'refresh token reused' }],
      ['a revoked refresh token, in prose', { message: 'refresh token revoked' }],
      ['an expired refresh token, in prose', { message: 'expired refresh token' }],
      ['an invalid refresh token', { message: 'Invalid Refresh Token' }],
      ['a session that expired', { message: 'session_expired' }],
      ['a session that is gone, by code', { code: 'session_not_found' }],
      ['a session that is gone, in prose', { message: 'session not found' }],
      ['an unusable token', { status: 401, message: 'bad_jwt' }],
      ['claims that failed validation', { message: 'invalid claim: missing sub' }],
      ['a malformed token', { message: 'malformed token' }],
    ])('%s -> unauthenticated', (_label, error) => {
      expect(mapSessionError(error).error.kind).toBe('unauthenticated');
    });

    it('400 / 401 / 403 remain intentional credential outcomes', () => {
      expect(mapSessionError({ status: 400, message: 'something' }).error.kind).toBe('unauthenticated');
      expect(mapSessionError({ status: 401, message: 'nope' }).error.kind).toBe('unauthenticated');
      expect(mapSessionError({ status: 403, message: 'nope' }).error.kind).toBe('unauthenticated');
    });
  });

  it('session() surfaces an expired credential as unauthenticated', async () => {
    const client = fakeClient({
      getSessionError: { status: 400, message: 'Invalid Refresh Token: Refresh Token Not Found' },
    });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    await expect(repo.session()).resolves.toEqual({ ok: false, error: { kind: 'unauthenticated' } });
  });

  it('signIn() KEEPS its email treatment for a relevant 400', async () => {
    // The two paths are now separate, and the sign-in one is unchanged.
    const client = fakeClient({ signInError: { status: 400, message: 'Unable to validate email address' } });
    const repo = createSupabaseAuthRepository({ client, location: ORIGIN });
    const result = await repo.signIn('a@example.com');
    expect(result.error).toEqual({ kind: 'validation', issues: [{ field: 'email', code: 'rejected' }] });
    expect(mapAuthError({ status: 400, message: 'x' }).error.kind).toBe('validation');
  });
});

describe('error mapping', () => {
  it('maps SQLSTATEs before HTTP status', () => {
    expect(mapPostgrestError({ code: '42501', status: 500 }).error.kind).toBe('forbidden');
    expect(mapPostgrestError({ code: '23514', message: 'x' }).error.kind).toBe('validation');
    expect(mapPostgrestError({ code: '42704' }).error.kind).toBe('notFound');
  });

  it('a missing JWT is unauthenticated, not forbidden', () => {
    expect(mapPostgrestError({ status: 401, message: 'JWT expired' }).error.kind).toBe('unauthenticated');
  });

  it('network failures are offline on both surfaces', () => {
    const boom = new TypeError('Failed to fetch');
    expect(mapPostgrestError(boom).error.kind).toBe('offline');
    expect(mapAuthError(boom).error.kind).toBe('offline');
  });

  it('rate limiting is a validation outcome the UI can phrase', () => {
    expect(mapAuthError({ status: 429, message: 'rate limit exceeded' }).error.issues[0].code)
      .toBe('rateLimited');
  });
});

describe('safeRedirectTo', () => {
  it('always lands on /', () => {
    expect(safeRedirectTo({ origin: 'https://x.example' })).toBe('https://x.example/');
    expect(safeRedirectTo({ origin: 'http://localhost:3001' })).toBe('http://localhost:3001/');
  });

  it('refuses anything that is not a plain http(s) origin', () => {
    for (const origin of ['null', '', 'file://', 'javascript:alert(1)', 'https://u:p@x.example']) {
      expect(safeRedirectTo({ origin })).toBeNull();
    }
    expect(safeRedirectTo(null)).toBeNull();
  });
});
