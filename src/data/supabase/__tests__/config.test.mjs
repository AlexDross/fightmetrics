import { describe, it, expect } from 'vitest';
import {
  readSupabaseConfig, validateSupabaseUrl, classifyPublishableKey, jwtRole,
  describeConfigIssues, SUPABASE_ENV_KEYS, FORBIDDEN_ENV_KEYS, CONFIG_STATUS,
} from '../config.mjs';

// A JWT is three base64url segments; only the middle one is read. These are
// built here rather than pasted, so no real token is committed.
const jwt = (claims) => {
  const seg = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${seg({ alg: 'HS256', typ: 'JWT' })}.${seg(claims)}.c2lnbmF0dXJl`;
};
const ANON_JWT = jwt({ iss: 'supabase', role: 'anon' });
const SERVICE_JWT = jwt({ iss: 'supabase', role: 'service_role' });

const URL_OK = 'https://example-project.supabase.co';
const KEY_OK = 'sb_publishable_AAAAAAAAAAAAAAAAAAAAAA';

describe('the accepted configuration surface', () => {
  it('reads exactly two variables and no more', () => {
    expect([...SUPABASE_ENV_KEYS]).toEqual([
      'VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY',
    ]);
  });

  it('ignores every other variable, including ones that carry secrets', () => {
    const env = { VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK };
    for (const key of FORBIDDEN_ENV_KEYS) env[key] = 'super-secret-value';
    const config = readSupabaseConfig(env);
    expect(config.status).toBe(CONFIG_STATUS.CONFIGURED);
    // The returned configuration carries the two public values and nothing else.
    expect(Object.keys(config).sort())
      .toEqual(['keyForm', 'publishableKey', 'status', 'url']);
    expect(JSON.stringify(config)).not.toContain('super-secret-value');
  });
});

describe('both variables absent — disabled mode', () => {
  it('is disabled, not invalid', () => {
    for (const env of [{}, undefined, { VITE_SUPABASE_URL: '', VITE_SUPABASE_PUBLISHABLE_KEY: '  ' }]) {
      expect(readSupabaseConfig(env).status).toBe(CONFIG_STATUS.DISABLED);
    }
  });

  it('carries no issues, because nothing is wrong', () => {
    expect(readSupabaseConfig({}).issues).toBeUndefined();
  });
});

describe('both variables valid', () => {
  it('accepts a publishable key', () => {
    const c = readSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK });
    expect(c).toEqual({
      status: 'configured', url: URL_OK, publishableKey: KEY_OK, keyForm: 'publishableKey',
    });
  });

  it('accepts a legacy anon JWT, which is what the local stack mints', () => {
    const c = readSupabaseConfig({ VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_PUBLISHABLE_KEY: ANON_JWT });
    expect(c.status).toBe('configured');
    expect(c.keyForm).toBe('anonJwt');
  });

  it('normalises a trailing slash so one project has one configuration', () => {
    const c = readSupabaseConfig({ VITE_SUPABASE_URL: `${URL_OK}/`, VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK });
    expect(c.url).toBe(URL_OK);
  });
});

describe('partial configuration is rejected, never half-applied', () => {
  it('URL without key is invalid', () => {
    const c = readSupabaseConfig({ VITE_SUPABASE_URL: URL_OK });
    expect(c.status).toBe(CONFIG_STATUS.INVALID);
    expect(c.issues).toEqual([{ key: 'VITE_SUPABASE_PUBLISHABLE_KEY', code: 'missing' }]);
  });

  it('key without URL is invalid', () => {
    const c = readSupabaseConfig({ VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK });
    expect(c.status).toBe(CONFIG_STATUS.INVALID);
    expect(c.issues).toEqual([{ key: 'VITE_SUPABASE_URL', code: 'missing' }]);
  });

  it('a blank half is the same as a missing half', () => {
    const c = readSupabaseConfig({ VITE_SUPABASE_URL: '   ', VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK });
    expect(c.status).toBe(CONFIG_STATUS.INVALID);
  });
});

describe('malformed URLs are rejected with a reason', () => {
  const cases = [
    ['not-a-url', 'malformedUrl'],
    ['ftp://example.com', 'unsupportedProtocol'],
    ['postgresql://user:pw@db.example.com:5432/postgres', 'unsupportedProtocol'],
    ['https://user:password@example.supabase.co', 'credentialsInUrl'],
    ['https://example.supabase.co?apikey=abc', 'urlHasQueryOrFragment'],
    ['https://example.supabase.co#token', 'urlHasQueryOrFragment'],
  ];
  it.each(cases)('%s -> %s', (url, code) => {
    expect(validateSupabaseUrl(url)).toEqual({ ok: false, code });
    const c = readSupabaseConfig({ VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK });
    expect(c.status).toBe(CONFIG_STATUS.INVALID);
    expect(c.issues).toContainEqual({ key: 'VITE_SUPABASE_URL', code });
  });
});

describe('server-only material pasted into the publishable slot is refused', () => {
  const cases = [
    ['sb_secret_ZZZZZZZZZZZZ', 'secretKeySupplied'],
    // Deliberately NOT shaped like a real Supabase personal access token.
    // `sbp_` + 40 hex characters IS the real PAT format, and an invented value in
    // that shape is indistinguishable from a leaked one to a secret scanner —
    // GitHub push protection blocked this file over exactly that. The rejection
    // under test keys on the `sbp_` prefix alone, so the suffix carries no
    // weight; keep it obviously synthetic.
    ['sbp_EXAMPLE_NOT_A_REAL_TOKEN', 'accessTokenSupplied'],
    ['postgresql://postgres:pw@db.example.com:5432/postgres', 'databaseUrlSupplied'],
    [SERVICE_JWT, 'serviceRoleKeySupplied'],
    [jwt({ role: 'postgres' }), 'unexpectedJwtRole'],
    ['just-some-string', 'unrecognisedKeyFormat'],
  ];
  it.each(cases)('%s is rejected as %s', (key, code) => {
    expect(classifyPublishableKey(key)).toEqual({ ok: false, code });
  });

  it('a service-role key never yields a configured state', () => {
    const c = readSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: SERVICE_JWT });
    expect(c.status).toBe(CONFIG_STATUS.INVALID);
    expect(c.issues).toEqual([
      { key: 'VITE_SUPABASE_PUBLISHABLE_KEY', code: 'serviceRoleKeySupplied' },
    ]);
  });

  it('a bare `sb_publishable_` prefix is not a key', () => {
    // The prefix test that this replaces accepted every one of these.
    for (const key of [
      'sb_publishable_',            // empty suffix
      'sb_publishable_ ',           // whitespace-only suffix (trimmed to empty)
      'sb_publishable_\t\t',        // whitespace-only suffix, tabs
      'sb_publishable_....',        // punctuation-only suffix
      'sb_publishable_abc.def',     // invalid punctuation inside a suffix
      'sb_publishable_abc def',     // internal whitespace
      'sb_publishable_abc/def',     // not URL-safe
      'sb_publishable_abc+def',     // not URL-safe
      'sb_publishable_ключ',        // Unicode suffix
      'sb_publishable_café',        // Unicode suffix
      'sb_publishable_🔑',           // Unicode suffix
    ]) {
      expect(classifyPublishableKey(key), key)
        .toEqual({ ok: false, code: 'malformedPublishableKey' });
    }
  });

  it('accepts the URL-safe ASCII alphabet, at any length', () => {
    // No length is pinned: it is not a documented contract.
    for (const key of [
      'sb_publishable_a',
      'sb_publishable_A1',
      'sb_publishable_abc-DEF_123',
      `sb_publishable_${'x'.repeat(200)}`,
    ]) {
      expect(classifyPublishableKey(key), key).toEqual({
        ok: true, value: key, form: 'publishableKey',
      });
    }
  });

  it('a malformed publishable key never yields a configured state', () => {
    const c = readSupabaseConfig({
      VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_',
    });
    expect(c.status).toBe(CONFIG_STATUS.INVALID);
    expect(c.issues).toEqual([
      { key: 'VITE_SUPABASE_PUBLISHABLE_KEY', code: 'malformedPublishableKey' },
    ]);
  });

  it('still rejects every server-only form after the tightening', () => {
    // Regression guard: narrowing the accept path must not widen the reject one.
    expect(classifyPublishableKey('sb_secret_ZZZZ').code).toBe('secretKeySupplied');
    expect(classifyPublishableKey('sbp_EXAMPLE_NOT_A_REAL_TOKEN').code).toBe('accessTokenSupplied');
    expect(classifyPublishableKey('postgresql://u:p@h/db').code).toBe('databaseUrlSupplied');
    expect(classifyPublishableKey(SERVICE_JWT).code).toBe('serviceRoleKeySupplied');
    expect(classifyPublishableKey(jwt({ role: 'postgres' })).code).toBe('unexpectedJwtRole');
    expect(classifyPublishableKey('just-some-string').code).toBe('unrecognisedKeyFormat');
  });

  it('reads the role claim without trusting the signature', () => {
    expect(jwtRole(ANON_JWT)).toBe('anon');
    expect(jwtRole(SERVICE_JWT)).toBe('service_role');
    expect(jwtRole('a.b')).toBeNull();
    expect(jwtRole('not.a.jwt')).toBeNull();
    expect(jwtRole(null)).toBeNull();
  });
});

describe('diagnostics never leak a value', () => {
  it('names the key and the reason only', () => {
    const c = readSupabaseConfig({
      VITE_SUPABASE_URL: 'https://user:hunter2@example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_TOPSECRETVALUE',
    });
    const text = describeConfigIssues(c.issues);
    expect(text).toBe(
      'VITE_SUPABASE_URL: credentialsInUrl; VITE_SUPABASE_PUBLISHABLE_KEY: secretKeySupplied');
    expect(text).not.toContain('hunter2');
    expect(text).not.toContain('TOPSECRET');
    expect(JSON.stringify(c)).not.toContain('hunter2');
    expect(JSON.stringify(c)).not.toContain('TOPSECRET');
  });
});
