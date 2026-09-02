import { describe, it, expect } from 'vitest';
import {
  resolveAuthState, readSurfaceForRole, isMemberRole, writeOutcomeFor,
  MEMBER_ROLES, AUTH_STATES,
} from '../authState.mjs';

const SESSION = { userId: '00000000-0000-4000-8000-000000000001' };

describe('the three states of §10 are each independently reachable', () => {
  it('signed out: no session, no role', () => {
    const s = resolveAuthState({ session: null, role: null });
    expect(s.state).toBe(AUTH_STATES.SIGNED_OUT);
    expect(s.signedIn).toBe(false);
    expect(s.role).toBeNull();
    expect(writeOutcomeFor(s)).toBe('unauthenticated');
    expect(s.claimEligible).toBe(false);
  });

  it('signed-in non-member: session, no role — the row that lets a deployment get an owner', () => {
    const s = resolveAuthState({ session: SESSION, role: null });
    expect(s.state).toBe(AUTH_STATES.SIGNED_IN_NON_MEMBER);
    expect(s.signedIn).toBe(true);
    expect(s.role).toBeNull();
    expect(writeOutcomeFor(s)).toBe('forbidden');
    expect(s.claimEligible).toBe(true);
  });

  it.each(MEMBER_ROLES)('member: session and a resolved %s role', (role) => {
    const s = resolveAuthState({ session: SESSION, role });
    expect(s.state).toBe(AUTH_STATES.MEMBER);
    expect(s.role).toBe(role);
    expect(s.claimEligible).toBe(false);
  });

  it('a viewer is a member but never a writer', () => {
    expect(writeOutcomeFor(resolveAuthState({ session: SESSION, role: 'viewer' }))).toBe('forbidden');
    expect(writeOutcomeFor(resolveAuthState({ session: SESSION, role: 'editor' }))).toBe('allowed');
    expect(writeOutcomeFor(resolveAuthState({ session: SESSION, role: 'owner' }))).toBe('allowed');
  });
});

describe('membership never leaks across the session boundary', () => {
  it('a role WITHOUT a session is not membership — it is stale state', () => {
    const s = resolveAuthState({ session: null, role: 'owner' });
    expect(s.state).toBe(AUTH_STATES.SIGNED_OUT);
    expect(s.role).toBeNull();
    expect(s.canWrite).toBe(false);
    expect(s.readSurface).toBe('public');
  });

  it('an unknown role string is not a member', () => {
    for (const role of ['admin', 'superuser', '', 'OWNER', null, undefined]) {
      expect(isMemberRole(role)).toBe(false);
      expect(resolveAuthState({ session: SESSION, role }).state)
        .toBe(AUTH_STATES.SIGNED_IN_NON_MEMBER);
    }
  });

  it('an empty user id is not a session', () => {
    expect(resolveAuthState({ session: { userId: '' }, role: 'owner' }).signedIn).toBe(false);
  });
});

describe('read routing is by RESOLVED MEMBERSHIP, not session presence', () => {
  it('anonymous and signed-in non-member route identically', () => {
    expect(resolveAuthState({ session: null, role: null }).readSurface).toBe('public');
    expect(resolveAuthState({ session: SESSION, role: null }).readSurface).toBe('public');
  });

  it.each(MEMBER_ROLES)('%s routes to the member surface', (role) => {
    expect(resolveAuthState({ session: SESSION, role }).readSurface).toBe('member');
  });

  it('the routing function agrees with the resolved state', () => {
    expect(readSurfaceForRole(null)).toBe('public');
    expect(readSurfaceForRole('nonsense')).toBe('public');
    expect(readSurfaceForRole('viewer')).toBe('member');
  });
});

describe('the resolved state is frozen', () => {
  it('cannot be mutated into a different authorisation', () => {
    const s = resolveAuthState({ session: SESSION, role: null });
    expect(Object.isFrozen(s)).toBe(true);
    expect(() => { 'use strict'; s.role = 'owner'; }).toThrow();
  });
});
