import { describe, it, expect, vi } from 'vitest';
import { createSupabaseClient, createSupabaseClientFromEnv, AUTH_OPTIONS } from '../client.mjs';
import { CONFIG_STATUS } from '../config.mjs';

const URL_OK = 'https://example-project.supabase.co';
const KEY_OK = 'sb_publishable_AAAAAAAAAAAAAAAAAAAAAA';
const GOOD_ENV = { VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK };

describe('client construction', () => {
  it('passes the URL, the publishable key and the three required auth options', () => {
    const createClient = vi.fn(() => ({ marker: 'client' }));
    const { status, client } = createSupabaseClientFromEnv(GOOD_ENV, { createClient });
    expect(status).toBe(CONFIG_STATUS.CONFIGURED);
    expect(client).toEqual({ marker: 'client' });
    expect(createClient).toHaveBeenCalledTimes(1);
    const [url, key, options] = createClient.mock.calls[0];
    expect(url).toBe(URL_OK);
    expect(key).toBe(KEY_OK);
    expect(options.auth).toEqual({
      persistSession: true, detectSessionInUrl: true, autoRefreshToken: true,
    });
  });

  it('pins all three auth options as true — the plan requires each', () => {
    expect(AUTH_OPTIONS).toEqual({
      persistSession: true, detectSessionInUrl: true, autoRefreshToken: true,
    });
    expect(Object.isFrozen(AUTH_OPTIONS)).toBe(true);
  });

  it('configures no Realtime — Stage 7 explicitly excludes it', () => {
    const createClient = vi.fn(() => ({}));
    createSupabaseClientFromEnv(GOOD_ENV, { createClient });
    const [, , options] = createClient.mock.calls[0];
    expect(options.realtime).toBeUndefined();
    expect(Object.keys(options)).toEqual(['auth']);
  });
});

describe('absence of configuration is an explicit disabled mode', () => {
  it('constructs NO client and makes NO call when both variables are absent', () => {
    const createClient = vi.fn(() => ({}));
    const result = createSupabaseClientFromEnv({}, { createClient });
    expect(result.status).toBe(CONFIG_STATUS.DISABLED);
    expect(result.client).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('issues no network request in disabled mode', async () => {
    const fetchSpy = vi.fn();
    const original = globalThis.fetch;
    globalThis.fetch = fetchSpy;
    try {
      const result = createSupabaseClientFromEnv({});
      expect(result.client).toBeNull();
      // Nothing is scheduled either: flush the microtask queue and a macrotask.
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = original;
    }
  });
});

describe('partial or malformed configuration never yields a half-built client', () => {
  it.each([
    ['url only', { VITE_SUPABASE_URL: URL_OK }],
    ['key only', { VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK }],
    ['malformed url', { VITE_SUPABASE_URL: 'nope', VITE_SUPABASE_PUBLISHABLE_KEY: KEY_OK }],
    ['secret key', { VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_XXXX' }],
  ])('%s -> invalid, no client, factory never called', (_label, env) => {
    const createClient = vi.fn(() => ({}));
    const result = createSupabaseClientFromEnv(env, { createClient });
    expect(result.status).toBe(CONFIG_STATUS.INVALID);
    expect(result.client).toBeNull();
    expect(result.issues.length).toBeGreaterThan(0);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('refuses to build directly from a non-configured configuration', () => {
    expect(() => createSupabaseClient({ status: 'disabled' })).toThrow(/requires a configured/);
    expect(() => createSupabaseClient(null)).toThrow(/requires a configured/);
    expect(() => createSupabaseClient({ status: 'invalid', issues: [] })).toThrow(/requires a configured/);
  });
});
