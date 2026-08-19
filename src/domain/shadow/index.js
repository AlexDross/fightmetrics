// ─── DOMAIN / SHADOW ─────────────────────────────────────────────────────────
// Isolated, experimental C6 shadow-evaluation domain. Nothing here changes the
// user-facing v2 probability, the current recommendation, or any wager. It only
// freezes a paper-only shadow record alongside a saved prediction when
// VITE_C6_SHADOW_CAPTURE_ENABLED is true. C6 is never user-facing in this release.

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
