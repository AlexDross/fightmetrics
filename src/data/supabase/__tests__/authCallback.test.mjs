import { describe, it, expect, vi } from 'vitest';
import { readAuthCallback, clearAuthCallbackUrl, CALLBACK_NOTICES } from '../authCallback.mjs';

describe('classifying the magic-link callback', () => {
  it('says nothing for an ordinary URL', () => {
    expect(readAuthCallback({ hash: '', search: '' }))
      .toEqual({ kind: 'none', notice: null, hadTokens: false });
    expect(readAuthCallback(null).kind).toBe('none');
  });

  it('recognises an expired link', () => {
    const r = readAuthCallback({
      hash: '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
      search: '',
    });
    expect(r.kind).toBe('error');
    expect(r.notice).toBe(CALLBACK_NOTICES.expired);
  });

  it('recognises a denied link that is not expired', () => {
    const r = readAuthCallback({ hash: '#error=access_denied&error_code=bad_oauth_state', search: '' });
    expect(r.kind).toBe('error');
    expect(r.notice).toBe(CALLBACK_NOTICES.denied);
  });

  it('falls back to a generic invalid notice', () => {
    const r = readAuthCallback({ hash: '#error_code=validation_failed', search: '' });
    expect(r.kind).toBe('error');
    expect(r.notice).toBe(CALLBACK_NOTICES.invalid);
  });

  it('reads an error from the query string too', () => {
    expect(readAuthCallback({ hash: '', search: '?error_code=otp_expired' }).notice)
      .toBe(CALLBACK_NOTICES.expired);
  });

  it('NEVER renders the server-supplied description', () => {
    const r = readAuthCallback({
      hash: '#error=access_denied&error_code=otp_expired&error_description=' +
            encodeURIComponent('<img src=x onerror=alert(1)> visit http://evil.example'),
      search: '',
    });
    expect(r.notice).toBe(CALLBACK_NOTICES.expired);
    expect(r.notice).not.toContain('evil.example');
    expect(r.notice).not.toContain('<img');
  });

  it('detects a token fragment as a success that still needs cleaning', () => {
    const r = readAuthCallback({
      hash: '#access_token=aaa.bbb.ccc&refresh_token=rrr&token_type=bearer', search: '',
    });
    expect(r).toEqual({ kind: 'success', notice: null, hadTokens: true });
  });

  it('detects the PKCE code parameter as a success', () => {
    expect(readAuthCallback({ hash: '', search: '?code=abc123' }).kind).toBe('success');
  });
});

describe('cleaning the URL', () => {
  it('replaces history with / rather than pushing, so Back cannot re-enter it', () => {
    const replaceState = vi.fn();
    expect(clearAuthCallbackUrl({ history: { replaceState } })).toBe(true);
    expect(replaceState).toHaveBeenCalledWith(null, '', '/');
  });

  it('is a no-op without a usable history', () => {
    expect(clearAuthCallbackUrl(null)).toBe(false);
    expect(clearAuthCallbackUrl({})).toBe(false);
    expect(clearAuthCallbackUrl({ history: {} })).toBe(false);
  });
});
