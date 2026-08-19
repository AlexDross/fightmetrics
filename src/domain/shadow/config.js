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
//     OFF (default), or unset, or any unrecognized value: C6 is never
//        user-facing -- the Simulator and betting gate behave exactly as
//        before.
//     ON ('true' or '1'): the Simulator displays C6's market-adjusted
//        probability (when v2 is selected and valid odds are available) and
//        the betting gate uses that exact same probability. Shadow capture
//        is a SEPARATE control -- this flag does not require it, and shadow
//        capture alone never activates this flag. See
//        src/domain/betting/decision.js for the resolver this flag gates.
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
 * Whether C6 is user-facing/active. Mirrors the requested flag exactly --
 * this is the ONE place production code should check before promoting C6 to
 * the Simulator display or the betting gate. Defaults false (unset, 'false',
 * or any unrecognized value); only 'true'/'1' activate it.
 */
export const isC6UserFacingActive = () => isC6UserFacingRequested();

/**
 * Human-readable status of the user-facing control, for logging/diagnostics.
 *   'OFF'    — not requested, or requested with an unrecognized value.
 *   'ACTIVE' — requested via a recognized truthy env value.
 */
export const userFacingConfigStatus = () =>
  isC6UserFacingActive() ? 'ACTIVE' : 'OFF';

/** Snapshot of the resolved shadow configuration (stored on each shadow record). */
export const resolveShadowConfig = () => ({
  shadowCaptureEnabled: isShadowCaptureEnabled(),
  userFacingRequested: isC6UserFacingRequested(),
  userFacingActive: isC6UserFacingActive(),
  userFacingStatus: userFacingConfigStatus(),
});
