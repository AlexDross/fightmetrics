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

  it('user-facing activates on a recognized truthy env value', () => {
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    expect(isC6UserFacingRequested()).toBe(true);
    expect(isC6UserFacingActive()).toBe(true);
    expect(userFacingConfigStatus()).toBe('ACTIVE');
  });

  it('user-facing activates on "1" but not on an unrecognized value', () => {
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', '1');
    expect(isC6UserFacingActive()).toBe(true);
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'yes');
    expect(isC6UserFacingActive()).toBe(false);
    expect(userFacingConfigStatus()).toBe('OFF');
  });

  it('shadow capture ON alone does not activate user-facing C6', () => {
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    const cfg = resolveShadowConfig();
    expect(cfg.shadowCaptureEnabled).toBe(true);
    expect(cfg.userFacingRequested).toBe(false);
    expect(cfg.userFacingActive).toBe(false);
    expect(cfg.userFacingStatus).toBe('OFF');
  });

  it('user-facing ON works without shadow capture enabled', () => {
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    const cfg = resolveShadowConfig();
    expect(cfg.shadowCaptureEnabled).toBe(false);
    expect(cfg.userFacingActive).toBe(true);
  });

  it('both flags ON together work independently', () => {
    vi.stubEnv('VITE_C6_SHADOW_CAPTURE_ENABLED', 'true');
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    const cfg = resolveShadowConfig();
    expect(cfg.shadowCaptureEnabled).toBe(true);
    expect(cfg.userFacingRequested).toBe(true);
    expect(cfg.userFacingActive).toBe(true);
    expect(cfg.userFacingStatus).toBe('ACTIVE');
  });
});
