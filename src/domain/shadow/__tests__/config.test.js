import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  isShadowCaptureEnabled,
  isC6UserFacingRequested,
  isC6UserFacingActive,
  userFacingConfigStatus,
  resolveShadowConfig,
} from '../config.js';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('shadow config flags', () => {
  it('both controls default OFF when unset', () => {
    expect(isShadowCaptureEnabled()).toBe(false);
    expect(isC6UserFacingRequested()).toBe(false);
    expect(isC6UserFacingActive()).toBe(false);
    expect(userFacingConfigStatus()).toBe('OFF');
  });

  it('shadow capture turns on only for explicit truthy env', () => {
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    expect(isShadowCaptureEnabled()).toBe(true);
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', '1');
    expect(isShadowCaptureEnabled()).toBe(true);
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'false');
    expect(isShadowCaptureEnabled()).toBe(false);
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'yes'); // not a recognised truthy
    expect(isShadowCaptureEnabled()).toBe(false);
  });

  it('FAILS CLOSED: user-facing is never active even when the env requests it', () => {
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    expect(isC6UserFacingRequested()).toBe(true);
    expect(isC6UserFacingActive()).toBe(false); // refused
    expect(userFacingConfigStatus()).toBe('UNSUPPORTED_FORCED_OFF');
  });

  it('shadow capture ON + user-facing requested still does not activate C6', () => {
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    const cfg = resolveShadowConfig();
    expect(cfg.shadowCaptureEnabled).toBe(true);
    expect(cfg.userFacingRequested).toBe(true);
    expect(cfg.userFacingActive).toBe(false);
    expect(cfg.userFacingStatus).toBe('UNSUPPORTED_FORCED_OFF');
  });
});
