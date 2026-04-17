// prospectsData.js
// ─── UFC PRE-DEBUT PROSPECTS ─────────────────────────────────────────────────
// UFC-signed fighters who have NOT yet made their Octagon debut.
// Stats are sourced from their pre-UFC pro fights (DWCS, LFA, Cage Warriors,
// KSW, Rizin, PFL, Bellator, regional promotions, etc.) with competition-level
// scaling applied to approximate UFC-level performance.
//
// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA: Each entry mirrors _D2's compact keys exactly so it can be fed
// through the same FIGHTERS mapping in App.js. Prospect-specific fields are
// prefixed with `_p` to avoid collisions and to make them easy to strip
// during migration.
//
//   Identity + record (match _D2):
//     n   — fighter name (must match how they'll appear on UFC.com/Greco1899
//           once they debut so migration is clean)
//     w   — weight class (full string: 'Lightweight', "Women's Flyweight", ...)
//     ag  — age
//     ht  — height (inches)
//     rh  — reach (inches)
//     st  — stance ('Orthodox' | 'Southpaw' | 'Switch')
//     wi  — wins (pro, pre-UFC)
//     lo  — losses (pro, pre-UFC)
//     ws  — current win streak
//     ls  — current loss streak
//     tr  — total rounds fought (pro)
//     tb  — title bouts (set 0 for most prospects)
//     kow — KO/TKO wins
//     sbw — submission wins
//     dcw — decision wins
//     asl — sig strikes landed per min (already comp-adjusted, see below)
//     asp — sig strike accuracy (0–1, already comp-adjusted)
//     asa — sub attempts per 15 min (already comp-adjusted)
//     atl — takedowns landed per 15 (already comp-adjusted)
//     atp — takedown accuracy (0–1, already comp-adjusted)
//     elo — seeded ELO (see seeding formula below; used by App.js as fallback
//           when ELO_RATINGS has no entry, which will be true for prospects)
//     crd — seeded cardio ratio (used as fallback when CARDIO_RATIOS is empty)
//     lfd — last fight date (ISO 'YYYY-MM-DD') — their last REGIONAL fight
//     dsl — days since last fight (compute at entry time; will auto-age in UI)
//     dr  — division rank (null for prospects — they have no UFC rank)
//     p4p — pound-for-pound rank (null)
//     wlb — weight limit in lbs (155, 170, 125, etc.)
//
//   Prospect-only metadata (ignored by FIGHTERS transform but used for
//   display, data-quality flags, and migration logic):
//     _p_source    — 'dwcs' | 'tuf' | 'regional' | 'short_notice' | 'free_agent'
//     _p_tier      — 'tier1' (DWCS/PFL/Bellator, per-fight stats)
//                  | 'tier2' (LFA/CW/KSW/Rizin, partial stats)
//                  | 'tier3' (regional only, divisional-mean defaults used)
//     _p_signed    — UFC signing date (ISO)
//     _p_debut     — scheduled debut date (ISO) or null
//     _p_opponent  — scheduled debut opponent name or null
//     _p_fights_with_stats — how many pro fights contributed real stat data
//     _p_notes     — free-text scouting notes
//     _p_archived  — true once they've debuted (soft delete flag)
//
// ─────────────────────────────────────────────────────────────────────────────
// COMPETITION-LEVEL SCALING (applied BEFORE storing in asl/atl/asp/atp/asa):
//   Offensive (asl, atl, asp, atp):
//     DWCS           × 0.95
//     PFL / Bellator × 0.90
//     LFA / CW / KSW / Rizin × 0.82
//     Regional       × 0.72
//   Defensive inverse (asa — opponent sub attempts face higher at UFC level):
//     DWCS × 1.02 · PFL/Bellator × 1.05 · LFA-tier × 1.10 · Regional × 1.18
//
// ELO SEEDING (clamped to [1370, 1520]):
//   elo = 1400
//       + (wi - lo) * 8
//       + min(40, finish_rate * 50)   // finish_rate = (kow + sbw) / wi
//       + {tier1: +50, tier2: +25, tier3: 0}
//       + {undefeated_last_5: +30, else: 0}
//
// CARDIO SEEDING (fallback; actual crd in _D2 is a ratio, ours approximates):
//   crd = 0.85
//       + min(0.30, tr * 0.006)        // rounds-fought experience boost
//       + (decision_rate * 0.20)       // goes the distance = proven cardio
//   Clamped to [0.5, 1.5] to match CARDIO_RATIOS observed range.
// ─────────────────────────────────────────────────────────────────────────────

export const _P = [

  // ─── EXAMPLE 1: DWCS alumnus with tier1 stat data ─────────────────────────
  {
    n: 'Example DWCS Prospect',
    w: 'Lightweight',
    ag: 26, ht: 70.0, rh: 72.0, st: 'Orthodox',
    wi: 10, lo: 1, ws: 8, ls: 0,
    tr: 28, tb: 0,
    kow: 4, sbw: 3, dcw: 3,
    asl: 4.5,   // 4.74 raw × 0.95 DWCS
    asp: 0.47,
    asa: 1.2,
    atl: 2.1,
    atp: 0.43,
    elo: 1487,  // 1400 + 72 + 35 (finish rate 0.7 * 50 capped) + 50 tier1 − rounded
    crd: 1.05,
    lfd: '2025-08-30',
    dsl: 230,
    dr: null,
    p4p: null,
    wlb: 155,
    _p_source: 'dwcs',
    _p_tier: 'tier1',
    _p_signed: '2025-09-15',
    _p_debut: null,
    _p_opponent: null,
    _p_fights_with_stats: 6,
    _p_notes: 'DWCS S8 contract winner, wrestling base, 1st-round finishes',
    _p_archived: false,
  },

  // ─── EXAMPLE 2: LFA champion, tier2 stat data ─────────────────────────────
  {
    n: 'Example LFA Prospect',
    w: 'Welterweight',
    ag: 28, ht: 72.0, rh: 74.0, st: 'Southpaw',
    wi: 13, lo: 2, ws: 5, ls: 0,
    tr: 38, tb: 0,
    kow: 7, sbw: 2, dcw: 4,
    asl: 3.8,   // ~4.63 raw × 0.82 LFA
    asp: 0.42,
    asa: 0.8,
    atl: 1.4,
    atp: 0.38,
    elo: 1479,  // 1400 + 88 + min(40, 0.69*50) + 25 tier2 → 1479
    crd: 1.12,
    lfd: '2025-10-11',
    dsl: 188,
    dr: null,
    p4p: null,
    wlb: 170,
    _p_source: 'regional',
    _p_tier: 'tier2',
    _p_signed: '2025-11-02',
    _p_debut: null,
    _p_opponent: null,
    _p_fights_with_stats: 9,
    _p_notes: 'LFA WW champion, southpaw power puncher',
    _p_archived: false,
  },

  // ─── EXAMPLE 3: Short-notice signee with tier3 (divisional-default) stats ─
  {
    n: 'Example Regional Prospect',
    w: 'Bantamweight',
    ag: 25, ht: 66.0, rh: 68.0, st: 'Orthodox',
    wi: 8, lo: 1, ws: 6, ls: 0,
    tr: 22, tb: 0,
    kow: 2, sbw: 3, dcw: 3,
    asl: 4.1,   // divisional BW mean
    asp: 0.44,
    asa: 1.0,
    atl: 1.9,
    atp: 0.35,
    elo: 1456,  // 1400 + 56 + min(40, 0.625*50=31) + 0 tier3 → 1487, held slightly conservative
    crd: 0.98,
    lfd: '2025-12-15',
    dsl: 123,
    dr: null,
    p4p: null,
    wlb: 135,
    _p_source: 'short_notice',
    _p_tier: 'tier3',
    _p_signed: '2026-01-20',
    _p_debut: null,
    _p_opponent: null,
    _p_fights_with_stats: 0,
    _p_notes: 'Short-notice signing, divisional defaults used for rate stats',
    _p_archived: false,
  },

];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const getActiveProspects = () => _P.filter((p) => !p._p_archived);
