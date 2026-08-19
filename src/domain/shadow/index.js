// ─── DOMAIN / SHADOW ─────────────────────────────────────────────────────────
// Isolated, experimental C6 shadow-evaluation domain. This module only freezes
// a paper-only shadow record alongside a saved prediction when
// VITE_C6_SHADOW_CAPTURE_ENABLED is true; nothing here changes the displayed
// probability, the recommendation, or the betting gate. User-facing promotion
// of C6 (VITE_C6_USER_FACING_ENABLED, decoupled from shadow capture) lives in
// src/domain/betting/decision.js and reads isC6UserFacingActive from ./config.js.

export {
  C6_VERSION,
  C6_COEF,
  C6_CLAMP_LO,
  C6_CLAMP_HI,
  computeC6ProbA,
} from './c6.js';

export {
  isShadowCaptureEnabled,
  isC6UserFacingRequested,
  isC6UserFacingActive,
  userFacingConfigStatus,
  resolveShadowConfig,
} from './config.js';

export {
  SNAPSHOT_SOURCE_MANUAL,
  SNAPSHOT_CAPTURE_SEMANTICS,
  snapshotIdFromFightId,
  buildMarketSnapshot,
} from './snapshot.js';

export { evaluateShadowArms, crossCheckSnapshotIds } from './policies.js';

export {
  SHADOW_SCHEMA_VERSION,
  SHADOW_CAPTURE_MODE,
  GATE_THRESHOLDS,
  buildShadowRecord,
} from './record.js';
