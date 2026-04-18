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

  // ─── Mandel Nallo vs Jai Herbert (Lightweight, Main Card) ──────────────────
  {
    n: 'Mandel Nallo',
    w: 'Lightweight',
    ag: 36, ht: 72.0, rh: 75.0, st: 'Orthodox',
    wi: 14, lo: 3, ws: 5, ls: 0,
    tr: 25, tb: 0,
    kow: 8, sbw: 6, dcw: 0,
    asl: 7.46,
    asp: 0.54,
    asa: 0.2,
    atl: 0.61,
    atp: 0.32,
    elo: 1520,
    crd: 1.0,
    lfd: '2025-09-02',
    dsl: 228,
    dr: null,
    p4p: null,
    wlb: 155,
    _p_source: 'dwcs',
    _p_tier: 'tier1',
    _p_signed: '2025-09-02',
    _p_debut: '2026-04-18',
    _p_opponent: 'Jai Herbert',
    _p_fights_with_stats: 1,
    _p_notes: 'Tristar Gym, BJJ/JJJ black belt, 5-fight 1st-round finish streak, Bellator veteran',
    _p_archived: false,
  },

  // ─── Marcio Barbosa vs Dennis Buzukja (Featherweight, Main Card) ──────────
  {
    n: 'Marcio Barbosa',
    w: 'Featherweight',
    ag: 28, ht: 66.0, rh: 70.5, st: 'Orthodox',
    wi: 17, lo: 2, ws: 4, ls: 0,
    tr: 28, tb: 0,
    kow: 10, sbw: 4, dcw: 3,
    asl: 4.79,
    asp: 0.42,
    asa: 0.3,
    atl: 0.83,
    atp: 0.31,
    elo: 1520,
    crd: 1.053,
    lfd: '2025-08-26',
    dsl: 235,
    dr: null,
    p4p: null,
    wlb: 145,
    _p_source: 'dwcs',
    _p_tier: 'tier1',
    _p_signed: '2025-08-26',
    _p_debut: '2026-04-18',
    _p_opponent: 'Dennis Buzukja',
    _p_fights_with_stats: 1,
    _p_notes: 'Brazilian "Ticotô", last 4 fights 1st-round stoppages, Luta Livre brown belt, -490 favorite',
    _p_archived: false,
  },

  // ─── Julien Leblanc vs Robert Valentin (Middleweight, Prelims) ────────────
  {
    n: 'Julien Leblanc',
    w: 'Middleweight',
    ag: 34, ht: 74.0, rh: 74.5, st: 'Southpaw',
    wi: 10, lo: 2, ws: 5, ls: 0,
    tr: 18, tb: 0,
    kow: 4, sbw: 4, dcw: 2,
    asl: 5.34,
    asp: 0.47,
    asa: 0.24,
    atl: 1.0,
    atp: 0.33,
    elo: 1520,
    crd: 0.998,
    lfd: '2025-11-21',
    dsl: 148,
    dr: null,
    p4p: null,
    wlb: 185,
    _p_source: 'regional',
    _p_tier: 'tier3',
    _p_signed: '2026-02-26',
    _p_debut: '2026-04-18',
    _p_opponent: 'Robert Valentin',
    _p_fights_with_stats: 0,
    _p_notes: 'Gatineau QC, Patenaude MA + Kill Cliff FC, Samourai MMA MW champ over Darian Weeks, both losses by decision',
    _p_archived: false,
  },

  // ─── Gokhan Saricam vs Tanner Boser (Heavyweight, Prelims) ────────────────
  {
    n: 'Gokhan Saricam',
    w: 'Heavyweight',
    ag: 35, ht: 75.0, rh: 76.0, st: 'Orthodox',
    wi: 11, lo: 2, ws: 3, ls: 0,
    tr: 18, tb: 0,
    kow: 8, sbw: 1, dcw: 2,
    asl: 4.5,
    asp: 0.46,
    asa: 0.09,
    atl: 0.57,
    atp: 0.31,
    elo: 1520,
    crd: 0.994,
    lfd: '2025-10-15',
    dsl: 185,
    dr: null,
    p4p: null,
    wlb: 265,
    _p_source: 'free_agent',
    _p_tier: 'tier1',
    _p_signed: '2026-03-01',
    _p_debut: '2026-04-18',
    _p_opponent: 'Tanner Boser',
    _p_fights_with_stats: 7,
    _p_notes: 'Turkish-Belgian heavyweight, former amateur boxer (28-1), Bellator 5-2, -155 favorite',
    _p_archived: false,
  },

  // ─── Darya Zheleznyakova vs Melissa Croden (Women's BW, Prelims) ──────────
  {
    n: 'Darya Zheleznyakova',
    w: 'Women\'s Bantamweight',
    ag: 30, ht: 69.0, rh: 68.0, st: 'Orthodox',
    wi: 10, lo: 2, ws: 3, ls: 0,
    tr: 22, tb: 0,
    kow: 5, sbw: 2, dcw: 3,
    asl: 4.1,
    asp: 0.46,
    asa: 0.2,
    atl: 0.91,
    atp: 0.35,
    elo: 1520,
    crd: 1.042,
    lfd: '2025-06-21',
    dsl: 301,
    dr: null,
    p4p: null,
    wlb: 135,
    _p_source: 'regional',
    _p_tier: 'tier3',
    _p_signed: '2026-01-15',
    _p_debut: '2026-04-18',
    _p_opponent: 'Melissa Croden',
    _p_fights_with_stats: 0,
    _p_notes: 'Russian, "Iron Lady", slight underdog vs Croden (+110)',
    _p_archived: false,
  },

  // ─── Mark Vologdin vs John Castaneda (Bantamweight, Prelims) ──────────────
  {
    n: 'Mark Vologdin',
    w: 'Bantamweight',
    ag: 25, ht: 65.0, rh: 64.0, st: 'Orthodox',
    wi: 12, lo: 4, ws: 0, ls: 1,
    tr: 24, tb: 0,
    kow: 6, sbw: 4, dcw: 2,
    asl: 4.36,
    asp: 0.41,
    asa: 0.31,
    atl: 0.74,
    atp: 0.3,
    elo: 1520,
    crd: 1.027,
    lfd: '2025-10-21',
    dsl: 179,
    dr: null,
    p4p: null,
    wlb: 135,
    _p_source: 'dwcs',
    _p_tier: 'tier1',
    _p_signed: '2025-10-21',
    _p_debut: '2026-04-18',
    _p_opponent: 'John Castaneda',
    _p_fights_with_stats: 1,
    _p_notes: 'Russian, Allstars Stockholm, AFN BW champion, Kyokushin karate European/World junior champ. Fighting on his 26th birthday.',
    _p_archived: false,
  },

  // ─── Jamie Siraj vs John Yannis (Bantamweight, Prelims) ───────────────────
  {
    n: 'Jamie Siraj',
    w: 'Bantamweight',
    ag: 31, ht: 68.0, rh: 70.5, st: 'Orthodox',
    wi: 14, lo: 3, ws: 2, ls: 0,
    tr: 30, tb: 0,
    kow: 4, sbw: 7, dcw: 3,
    asl: 4.44,
    asp: 0.43,
    asa: 0.3,
    atl: 1.0,
    atp: 0.32,
    elo: 1520,
    crd: 0.9,
    lfd: '2026-02-19',
    dsl: 58,
    dr: null,
    p4p: null,
    wlb: 135,
    _p_source: 'short_notice',
    _p_tier: 'tier3',
    _p_signed: '2026-04-10',
    _p_debut: '2026-04-18',
    _p_opponent: 'John Yannis',
    _p_fights_with_stats: 0,
    _p_notes: 'Canadian "The Gremlin", Diaz Combat Sports. 3-year medical layoff 2020-2023 (brain infection/coma/sepsis). 4-0 since return but cardio untested at 15min pace. Cardio+ELO seeded conservatively.',
    _p_archived: false,
  },

];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const getActiveProspects = () => _P.filter((p) => !p._p_archived);
