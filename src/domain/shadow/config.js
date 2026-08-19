// ─── DOMAIN / SHADOW / CONFIG ────────────────────────────────────────────────
// Two SEPARATE controls, both default OFF, so shadow *capture* is decoupled from
// user-facing *promotion*:
//
//   VITE_C6_SHADOW_CAPTURE_ENABLED
//     OFF (default): behaviour and saved-entry shapes are byte-identical to
//        today (except the separately-authorized bestBet bug fix).
//     ON: C6 and the shadow policy arms are computed and FROZEN when a
//        prediction is saved. This does NOT change the displayed simulator
//        probability, the current recommendation, the betting cards, ROI
//        calculations, or any actual wager behaviour.
//
//   VITE_C6_USER_FACING_ENABLED
//     OFF (default): C6 is never user-facing.
//     ON: UNSUPPORTED in this release. We FAIL CLOSED — C6 recommendations are
//        NOT activated regardless. Promoting C6 to user-facing requires a
//        separate, reviewed change; a raw env flip must not do it.
//
// Reads import.meta.env when present (Vite / Vitest); tests use vi.stubEnv.
// Falls back to an empty env in any non-Vite context, so the default is OFF.

const readEnv = () => {
  try {
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== 'undefined' && import.meta.env) return import.meta.env;
  } catch {
    /* import.meta not available (e.g. plain CommonJS) — treat as no env */
  }
  return {};
};

const truthy = (v) => v === true || v === 'true' || v === '1';

/** Is prospective shadow capture enabled? Defaults false. */
export const isShadowCaptureEnabled = () =>
  truthy(readEnv().VITE_C6_SHADOW_CAPTURE_ENABLED);

/** Was user-facing C6 REQUESTED via env? (Requested is not the same as active.) */
export const isC6UserFacingRequested = () =>
  truthy(readEnv().VITE_C6_USER_FACING_ENABLED);

/**
 * Whether C6 is user-facing/active. HARD-CODED false in this release: promoting
 * C6 to user-facing is intentionally NOT reachable by an env flag. This is the
 * fail-closed guarantee — even VITE_C6_USER_FACING_ENABLED=true does not
 * activate C6 recommendations.
 */
export const isC6UserFacingActive = () => false;

/**
 * Human-readable status of the user-facing control, for logging/diagnostics.
 *   'OFF'                 — not requested (normal).
 *   'UNSUPPORTED_FORCED_OFF' — requested via env but refused (fail closed).
 */
export const userFacingConfigStatus = () =>
  isC6UserFacingRequested() ? 'UNSUPPORTED_FORCED_OFF' : 'OFF';

/** Snapshot of the resolved shadow configuration (stored on each shadow record). */
export const resolveShadowConfig = () => ({
  shadowCaptureEnabled: isShadowCaptureEnabled(),
  userFacingRequested: isC6UserFacingRequested(),
  userFacingActive: isC6UserFacingActive(), // always false this release
  userFacingStatus: userFacingConfigStatus(),
});
