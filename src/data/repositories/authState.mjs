// Stage 7 Gate 4 — the two axes of §10, as pure functions.
//
// Authentication and membership are SEPARATE and separately observable. The
// plan is explicit about why: collapsing them into one tri-state made the middle
// row — signed in, no membership — unreachable, and that row is the only path by
// which a fresh deployment ever acquires an owner.
//
//   session | role  | state                | writes          | ownership claim
//   --------+-------+----------------------+-----------------+-----------------
//   null    | null  | signedOut            | unauthenticated | unauthenticated
//   set     | null  | signedInNonMember    | forbidden       | allowed if zero-owner
//   set     | set   | member               | by role         | forbidden
//
// Routing is by RESOLVED MEMBERSHIP, not session presence: a signed-in
// non-member reads through the public surface exactly like an anonymous
// visitor, because an `fm_public_reader`-owned function is all their resolved
// role entitles them to.

/** The three roles `fm_member_whoami` can resolve. Anything else is not a member. */
export const MEMBER_ROLES = Object.freeze(['owner', 'editor', 'viewer']);

/** Roles that may write once Gate 6 wires mutations. Viewers never can. */
export const WRITER_ROLES = Object.freeze(['owner', 'editor']);

export const AUTH_STATES = Object.freeze({
  DISABLED: 'disabled',
  LOADING: 'loading',
  SIGNED_OUT: 'signedOut',
  SIGNED_IN_NON_MEMBER: 'signedInNonMember',
  MEMBER: 'member',
});

export const READ_SURFACES = Object.freeze({ PUBLIC: 'public', MEMBER: 'member' });

export const isMemberRole = (role) => MEMBER_ROLES.includes(role);

/** Public vs member READ routing — by resolved membership, never by session. */
export const readSurfaceForRole = (role) =>
  (isMemberRole(role) ? READ_SURFACES.MEMBER : READ_SURFACES.PUBLIC);

/**
 * Resolve the observable state from the two independent inputs.
 *
 * `session` is `{ userId }` or null — presence only, never a role.
 * `role` is a resolved membership string or null — never implies a session.
 *
 * A role WITHOUT a session is not a member: membership is resolved per session,
 * so that combination can only be stale state mid-transition, and treating it as
 * membership is exactly the bug that leaves a UI looking authorised after sign
 * out.
 */
export function resolveAuthState(input) {
  const session = input?.session ?? null;
  const role = input?.role ?? null;
  const signedIn = session !== null && typeof session.userId === 'string' && session.userId !== '';
  const member = signedIn && isMemberRole(role);
  const effectiveRole = member ? role : null;
  return Object.freeze({
    state: !signedIn
      ? AUTH_STATES.SIGNED_OUT
      : member ? AUTH_STATES.MEMBER : AUTH_STATES.SIGNED_IN_NON_MEMBER,
    signedIn,
    userId: signedIn ? session.userId : null,
    role: effectiveRole,
    readSurface: readSurfaceForRole(effectiveRole),
    canWrite: member && WRITER_ROLES.includes(effectiveRole),
    // Only a signed-in NON-member can claim: an existing member is refused by
    // the RPC, and a signed-out visitor has no identity to grant ownership to.
    claimEligible: signedIn && !member,
  });
}

/** The `unauthenticated` / `forbidden` a write would receive in this state. */
export function writeOutcomeFor(state) {
  if (!state?.signedIn) return 'unauthenticated';
  if (!state.canWrite) return 'forbidden';
  return 'allowed';
}
