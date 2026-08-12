import React, { useEffect, useState, useMemo } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
// Stage 5: URL <-> screen mapping. The registry is the only place the seven
// paths are written down; nothing in this file hard-codes a path string.
import { pathForView, viewForPathname, HOME_PATH } from './app/routes.jsx';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ComposedChart,
  Line,
  LineChart,
  Cell,
} from 'recharts';
import {
  BarChart2,
  Swords,
  User,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Search,
  Shield,
  Zap,
  Target,
  Wind,
  Filter,
  Info,
  Ruler,
  Trophy,
  Calendar,
  AlertTriangle,
  ClipboardList,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { ROI_ENTRIES } from './roiData';
import { UPCOMING_ENTRIES } from './upcomingData';
import { SOURCE_MANIFEST } from './sourceManifest';
// Physically separate from ROI_ENTRIES/UPCOMING_ENTRIES -- see propPicksData.js
// header comment. Never merged with model-related arrays or computations.
import { PROP_PICKS } from './propPicksData';
// Physically separate from ROI_ENTRIES/UPCOMING_ENTRIES/PROP_PICKS -- see
// parlayData.js header comment. Never merged with model-related arrays or
// computations.
import { PARLAY_ENTRIES } from './parlayData';

// Foundation Stage 3: the pure model engine now lives in src/domain/model.
// Extracted verbatim; see that file's header for original App.js line numbers.
import {
  getOpponentTier,
  computeModernForm,
  computeSOS,
  DIVISION_UFC_AVERAGES,
  clampNum,
  sortHistoryDesc,
  getResultStreak,
  isDecisionMethod,
  isKoMethod,
  isSubMethod,
  getDebutProspectAdjustment,
  ageDecayPenalty,
  recentForm,
  MODEL,
  MODEL_V2,
  computeLogisticProb,
  computeMatchupEdges,
  latestFightHistoryDate,
} from './domain/model';

// Foundation Stage 3: extracted verbatim -- see src/domain/finish/index.js
import {
  computeFinishProbs,
  getProjectedFinishLabel,
} from './domain/finish';

// Foundation Stage 3: extracted verbatim -- see src/domain/betting/index.js
import {
  americanOdds,
  parseAmericanOdds,
  stripVig,
  calcExpectedValue,
  americanToDecimal,
  createPredictionId,
  kellyFraction,
  computeMarketAnalysis,
  djb2Checksum,
  buildProvenance,
  buildRoiEntry,
  isNoReadProbability,
} from './domain/betting';
// Foundation Stage 4: Upcoming -> ROI transitions extracted verbatim.
import {
  filterVisibleUpcoming,
  addPendingEntry,
  createGradedEntry,
  removePendingEntry,
} from './domain/workflow';

// Foundation Stage 3: extracted verbatim -- see src/domain/statistics/index.js
import {
  isPushResult,
  isResolvedWinner,
  calcTrackedProfit,
  ROI_ANALYTICS_LOW_N,
  ROI_MARKET_BANDS,
  ROI_V2_PROB_BUCKETS,
  bandOf,
  computeRoiByMarketBand,
  roiV2GradedPopulation,
  computeModelVsMarketByBand,
  computeCalibrationReliability,
  filterRoiEntriesForStats,
  ROI_BET_TIERS,
  computeBetTierBreakdown,
  filterStakedGraded,
  computeCumulativePnl,
  computeMonthlyPerformance,
  computeV2FrozenRows,
  computeV2WindowComposition,
  computeV2Summary,
  computeRoiByMarketBandV2,
  computeCumulativePnlV2,
  computeMonthlyPerformanceV2,
  isDoubleChance,
  buildPropLabel,
  propTypeOf,
  computePropSummary,
  computePropTypeBreakdown,
  propPickProfit,
  computeParlayResult,
  computeParlaySummary,
  computeROISummary,
} from './domain/statistics';

// Foundation Stage 3: extracted verbatim -- see src/domain/fighters/index.js
import { FIGHTERS } from './domain/fighters';

// Age is DOB-derived. FIGHTERS[].AGE is already resolved as of app load, so
// roster/scout views read it directly. The Simulator additionally re-resolves
// against the entered event date, so its displayed age, decay penalty and
// veteran flag agree with the probability the model produced for that date.
import { resolveFighterAge } from './domain/age/index.js';

// Age as of the Simulator's event date, falling back to the load-time roster
// age when no date has been entered. null means genuinely unknown.
const simulatorAge = (f, eventDate) =>
  f ? resolveFighterAge(f, eventDate) : null;

// Unknown age must never render as a number -- "0.0" reads as a real fighter
// who is zero years old rather than as missing data.
const fmtAge = (age, dec = 0) =>
  Number.isFinite(age) ? age.toFixed(dec) : '—';
import { isChampionRecord } from './domain/rankings/current.js';


const ufcRankLabel = (r) => {
  if (!r) return null;
  if (isChampionRecord(r)) return r.crossDivision ? `C ${r.divisionLabel}` : 'C';
  // A rank earned in another division is shown WITH that division, never
  // relabelled into the roster's (e.g. "#11 HW").
  return r.crossDivision ? `#${r.rank} ${r.divisionLabel}` : `#${r.rank}`;
};


// ─── FIGHT DURATION HELPER ───────────────────────────────────────────────────
const parseFightMinutes = (rn, ti) => {
  if (!rn || !ti) return null;
  const parts = String(ti).split(':');
  if (parts.length !== 2) return null;
  const lastRoundSecs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  return ((parseInt(rn, 10) - 1) * 300 + lastRoundSecs) / 60;
};

// ─── RECENCY-WEIGHTED STATS FROM FIGHT HISTORY ───────────────────────────────
// Weights recent fights exponentially more than old ones (half-life ~2 fights)
const computeRecencyStats = (fh) => {
  if (!fh || fh.length === 0) return {};
  const DECAY = 0.7;
  let slW = 0,
    slDen = 0,
    accNum = 0,
    accDen = 0,
    tdW = 0,
    ctW = 0,
    totW = 0;
  fh.forEach((fight, i) => {
    const w = Math.pow(DECAY, i);
    const dur = parseFightMinutes(fight.rn, fight.ti);
    if (!dur || dur <= 0) return;
    slW += w * (fight.sl / dur);
    slDen += w;
    if (fight.sa > 0) {
      accNum += w * (fight.sl / fight.sa);
      accDen += w;
    }
    tdW += w * ((fight.tl / dur) * 15);
    ctW += w * ((fight.ct / (dur * 60)) * 100);
    totW += w;
  });
  return {
    recentSLPerMin: slDen > 0 ? slW / slDen : null,
    recentAcc: accDen > 0 ? (accNum / accDen) * 100 : null,
    recentTDPer15: totW > 0 ? tdW / totW : null,
    recentCtPct: totW > 0 ? ctW / totW : null,
  };
};

// ─── FINISH QUALITY SCORE ────────────────────────────────────────────────────
// Early KOs vs good opponents score far higher than late decisions
const computeFinishQuality = (fh) => {
  if (!fh || fh.length === 0) return 0;
  const DECAY = 0.72;
  let num = 0,
    den = 0;
  fh.forEach((fight, i) => {
    if (fight.re !== 'W') return;
    const w = Math.pow(DECAY, i);
    const tier = getOpponentTier(fight.op, fight);
    const rn = parseInt(fight.rn, 10) || 5;
    let q = 0;
    const m = fight.me || '';
    if (m === 'KO' || m === 'TKO' || m === 'TKO-Dr') {
      q = rn === 1 ? 2.0 : rn === 2 ? 1.5 : rn === 3 ? 1.1 : 0.65;
    } else if (m === 'Sub') {
      q = rn <= 2 ? 1.6 : 1.0;
    } else if (m.startsWith('Dec')) {
      q = 0.25;
    }
    num += w * q * (0.4 + 0.6 * tier);
    den += w;
  });
  return den > 0 ? num / den : 0;
};


// ─── MODERN FORM (MODEL_V2 only) ─────────────────────────────────────────────
// Exp-weighted last-8 win rate (λ=0.8) with finish-loss and layoff penalties.
// Replaces raw win/lose-streak counts in the v2 feature vector. Source: modern-era
// (2018+) statistical analysis, 7,365 fighter-fight rows. Validated 2026-07-08 on
// the 42-fight OOS set: v2 64.3% -> 66.7%, v1 unaffected (see BASELINE_NOTES.md).
const EVENT_DATES = {
  // 2024
  'UFC 285: Jones vs. Gane': '2023-03',
  'UFC 291: Poirier vs. Gaethje 2': '2023-07',
  'UFC 293: Adesanya vs. Strickla': '2023-09',
  'UFC 294: Makhachev vs. Volkano': '2023-10',
  'UFC 295: Prochazka vs. Pereira': '2023-11',
  'UFC 296: Edwards vs. Covington': '2023-12',
  'UFC 297: Strickland vs. Du Ple': '2024-01',
  'UFC 298: Volkanovski vs. Topur': '2024-02',
  'UFC 300: Pereira vs. Hill': '2024-04',
  'UFC 301: Pantoja vs. Erceg': '2024-05',
  'UFC 302: Makhachev vs. Poirier': '2024-06',
  'UFC 303: Pereira vs. Prochazka': '2024-06',
  'UFC 304: Edwards vs. Muhammad ': '2024-07',
  'UFC 305: Du Plessis vs. Adesan': '2024-08',
  'UFC 306: Riyadh Season Noche U': '2024-09',
  'UFC 307: Pereira vs. Rountree ': '2024-10',
  'UFC 308: Topuria vs. Holloway': '2024-10',
  'UFC 309: Jones vs. Miocic': '2024-11',
  'UFC 310: Pantoja vs. Asakura': '2024-12',
  // 2025
  'UFC 311: Makhachev vs. Moicano': '2025-01',
  'UFC 312: Du Plessis vs. Strick': '2025-02',
  'UFC 313: Pereira vs. Ankalaev': '2025-03',
  'UFC 314: Volkanovski vs. Lopes': '2025-04',
  'UFC 315: Muhammad vs. Della Ma': '2025-05',
  'UFC 317: Topuria vs. Oliveira': '2025-07',
  'UFC 318: Holloway vs. Poirier ': '2025-08',
  'UFC 319: Du Plessis vs. Chimae': '2025-09',
  'UFC 320: Ankalaev vs. Pereira ': '2025-10',
  'UFC 321: Aspinall vs. Gane': '2025-11',
  'UFC 322: Della Maddalena vs. M': '2025-12',
  // 2026
  'UFC 323: Dvalishvili vs. Yan 2': '2026-01',
  'UFC 324: Gaethje vs. Pimblett': '2026-02',
  'UFC 325: Volkanovski vs. Lopes': '2026-03',
  'UFC 326: Holloway vs. Oliveira': '2026-03',
  // Fight Nights — 2023
  'FN:Holloway vs. The Korean Zom': '2023-04',
  'FN:Ankalaev vs. Walker 2': '2023-06',
  'FN:Santos vs. Hill': '2023-08',
  'FN:Aspinall vs. Tybura': '2023-09',
  // Fight Nights — 2024
  'FN:Hernandez vs. Pereira': '2024-02',
  'FN:Dolidze vs. Hernandez': '2024-04',
  'FN:Cejudo vs. Song': '2024-05',
  'FN:Holm vs. Bueno Silva': '2024-06',
  'FN:Emmett vs. Murphy': '2024-06',
  'FN:Moreno vs. Albazi': '2024-07',
  'FN:Moicano vs. Saint Denis': '2024-07',
  'FN:Cannonier vs. Rodrigues': '2024-07',
  'FN:Cannonier vs. Imavov': '2024-08',
  'FN:Kara-France vs. Albazi': '2024-08',
  'FN:Whittaker vs. Aliskerov': '2024-09',
  'FN:Burns vs. Brady': '2024-09',
  'FN:Lemos vs. Jandiroba': '2024-09',
  'FN:Sandhagen vs. Nurmagomedov': '2024-10',
  'FN:Blachowicz vs. Rakic': '2024-10',
  'FN:Namajunas vs. Cortez': '2024-10',
  'FN:Blanchfield vs. Fiorot': '2024-10',
  'FN:Cannonier vs. Borralho': '2024-11',
  'FN:Hermansson vs. Pyfer': '2024-11',
  'FN:Kape vs. Almabayev': '2024-11',
  'FN:Tybura vs. Spivac 2': '2024-11',
  'FN:Magny vs. Prates': '2024-12',
  'FN:Dern vs. Ribas 2': '2024-12',
  'FN:Sandhagen vs. Figueiredo': '2024-12',
  'FN:Blanchfield vs. Barber': '2024-12',
  // Fight Nights — 2025
  'FN:Royval vs. Taira': '2025-01',
  'FN:Burns vs. Morales': '2025-01',
  'FN:Perez vs. Taira': '2025-01',
  'FN:Strickland vs. Imavov': '2025-02',
  'FN:Barboza vs. Murphy': '2025-02',
  'FN:Vettori vs. Dolidze 2': '2025-02',
  'FN:Usman vs. Buckley': '2025-03',
  'FN:Whittaker vs. De Ridder': '2025-03',
  'FN:Hermansson vs. Strickland': '2025-03',
  'FN:Taira vs. Park': '2025-04',
  'FN:Moreno vs. Erceg': '2025-04',
  'FN:Lewis vs. Teixeira': '2025-05',
  'FN:Lopes vs. Silva': '2025-05',
  'FN:Edwards vs. Brady': '2025-05',
  'FN:Hill vs. Rountree Jr.': '2025-06',
  'FN:Machado Garry vs. Prates': '2025-06',
  'FN:Walker vs. Zhang': '2025-06',
  'FN:Oliveira vs. Gamrot': '2025-07',
  'FN:Royval vs. Kape': '2025-07',
  'FN:Tsarukyan vs. Hooker': '2025-07',
  'FN:Garcia vs. Onama': '2025-08',
  'FN:Moreno vs. Kavanagh': '2025-08',
  'FN:De Ridder vs. Allen': '2025-09',
  'FN:Emmett vs. Vallejos': '2025-09',
  'FN:Bautista vs. Oliveira': '2025-10',
  'FN:Imavov vs. Borralho': '2025-10',
  'FN:Covington vs. Buckley': '2025-11',
  'FN:Ulberg vs. Reyes': '2025-11',
  'FN:Bonfim vs. Brown': '2025-12',
  'FN:Sandhagen vs. Song': '2025-12',
  'FN:Yan vs. Figueiredo': '2025-12',
  // Fight Nights — 2026
  'FN:Strickland vs. Hernandez': '2026-01',
  'FN:Adesanya vs. Imavov': '2026-02',
  'FN:Whittaker vs. Gastelum': '2026-02',
  'FN:Moreno vs. Kavanagh 2': '2026-02',
  'FN:Evloev vs. Murphy': '2026-03',
};

const computeLayoffPenalty = (fh) => {
  if (!fh || fh.length === 0) return 0;
  const lastEvent = fh[0].ev;
  const dateStr = fh[0].dt || EVENT_DATES[lastEvent];
  if (!dateStr) return 0;
  const lastFight = new Date(dateStr + '-01');
  const monthsOut =
    (Date.now() - lastFight.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (monthsOut < 9) return 0;
  // Continuous sigmoid curve: smoothly ramps from 0 to 0.20
  return Math.min(0.2, 0.2 / (1 + Math.exp(-0.18 * (monthsOut - 15))));
};

// ─── EXPERIENCE FACTOR ───────────────────────────────────────────────────────
const experienceFactor = (fightHistory) => {
  const n = (fightHistory || []).length;
  if (n <= 1) return 0.74;
  if (n === 2) return 0.81;
  if (n === 3) return 0.87;
  if (n === 4) return 0.92;
  if (n === 5) return 0.95;
  if (n <= 7) return 0.98;
  return 1.0;
};

// ─── OPPONENT QUALITY ADJUSTMENT ─────────────────────────────────────────────
const computeQualityAdjustment = (fightHistory) => {
  if (!fightHistory || fightHistory.length === 0) return 0;
  const DECAY = 0.76;
  const WIN_SCALE = 14;
  const LOSS_SCALE = 16;
  const BASELINE = 0.42;
  let winNum = 0,
    winDen = 0,
    lossNum = 0,
    lossDen = 0;
  fightHistory.forEach((fight, i) => {
    const w = Math.pow(DECAY, i);
    const tier = getOpponentTier(fight.op, fight);
    if (fight.re === 'W') {
      winNum += w * tier;
      winDen += w;
    } else if (fight.re === 'L') {
      lossNum += w * tier;
      lossDen += w;
    }
  });
  const winQuality = winDen > 0 ? winNum / winDen : BASELINE;
  const winBoost = WIN_SCALE * Math.max(0, winQuality - BASELINE);
  const lossResist = lossDen > 0 ? lossNum / lossDen : 1;
  const lossPenalty = lossDen > 0 ? LOSS_SCALE * (1 - lossResist) : 0;
  return Math.max(-18, Math.min(12, winBoost - lossPenalty));
};













// ─── IN-APP BACKTEST ─────────────────────────────────────────────────────────
// Tests the matchup engine against known fight history outcomes.
// Note: still uses current career stats, so this is an upper-bound estimate.
// Fixes 1-3 above progressively improve this number toward true accuracy.
//
// AGE is the one input that IS point-in-time here: passing the bout's own date
// ages both fighters back to how old they actually were that night, instead of
// scoring a 2015 fight with 2026 ages. Everything else (ELO, form, career
// stats) is still current, so this remains a diagnostic number and not a
// validated accuracy figure -- the mix is now less wrong, not correct.
const computeBacktestAccuracy = () => {
  let correct = 0,
    total = 0,
    details = [];
  const seen = new Set();
  FIGHTERS.forEach((fighter) => {
    (fighter.FIGHT_HISTORY || []).forEach((fight) => {
      if (fight.re !== 'W' && fight.re !== 'L') return; // skip NC/Draw
      const opponent = FIGHTERS.find((f) => f.FIGHTER === fight.op);
      if (!opponent) return; // opponent not in our dataset
      // Deduplicate: each bout is stored under both fighters; only count once
      const key = [fighter.FIGHTER, fight.op].sort().join('|||') + '|||' + (fight.ev ?? '');
      if (seen.has(key)) return;
      seen.add(key);
      // fighter is always fA; if re=W we expect pA > 0.5
      const result = computeMatchupEdges(fighter, opponent, {
        eventDate: fight.dt,
      });
      const predictedWin = result.pA > 0.5;
      const actualWin = fight.re === 'W';
      const correct_ = predictedWin === actualWin;
      if (correct_) correct++;
      total++;
      details.push({
        fighter: fighter.FIGHTER,
        opponent: fight.op,
        event: fight.ev,
        actual: fight.re,
        pA: result.pA,
        correct: correct_,
      });
    });
  });
  return {
    accuracy: total > 0 ? (correct / total) * 100 : 0,
    correct,
    total,
    details,
  };
};
const WEIGHT_CLASSES = [
  'All Divisions',
  'Pound-for-Pound',
  'Heavyweight',
  'Light Heavyweight',
  'Middleweight',
  'Welterweight',
  'Lightweight',
  'Featherweight',
  'Bantamweight',
  'Flyweight',
  "Women's Featherweight",
  "Women's Bantamweight",
  "Women's Flyweight",
  "Women's Strawweight",
];
const DIV_SHORT = {
  Heavyweight: 'HW',
  'Light Heavyweight': 'LHW',
  Middleweight: 'MW',
  Welterweight: 'WW',
  Lightweight: 'LW',
  Featherweight: 'FW',
  Bantamweight: 'BW',
  Flyweight: 'FLY',
  "Women's Featherweight": 'W.FW',
  "Women's Bantamweight": 'W.BW',
  "Women's Flyweight": 'W.FLY',
  "Women's Strawweight": 'W.SW',
};
const TABLE_COLS = [
  {
    key: 'ADJUSTED_RATING',
    short: 'RTG',
    group: 'Rating',
    signed: false,
    dec: 1,
    tip: 'Master rating: base efficiency × experience factor ± opponent quality adjustment',
  },
  {
    key: 'CREDIBILITY',
    short: 'CRED%',
    group: 'Rating',
    signed: false,
    dec: 1,
    tip: 'Sample size confidence — based on total minutes vs 75-min shrinkage constant',
  },
  {
    key: 'NET_STRIKE_MARGIN',
    short: 'NSM',
    group: 'Rating',
    signed: true,
    dec: 2,
    tip: 'Adj. strikes landed minus absorbed per min (opp-normalized)',
  },
  {
    key: 'OQI',
    short: 'OQI',
    group: 'Rating',
    signed: false,
    dec: 2,
    tip: 'Opponent Quality Index — strength of schedule',
  },
  {
    key: 'SIG_STR_ACC',
    short: 'STR%',
    group: 'Striking',
    signed: false,
    dec: 1,
    tip: 'Significant strike accuracy %',
  },
  {
    key: 'FACTOR_DAMAGE',
    short: 'DMG',
    group: 'Striking',
    signed: false,
    dec: 1,
    tip: '40% of EFF — striking dominance',
  },
  {
    key: 'TDE',
    short: 'TDE',
    group: 'Grappling',
    signed: false,
    dec: 2,
    tip: 'Opp-adjusted takedowns per 15 min',
  },
  {
    key: 'TD_ACC',
    short: 'TD%',
    group: 'Grappling',
    signed: false,
    dec: 1,
    tip: 'Takedown accuracy % (offensive)',
  },
  {
    key: 'FACTOR_POSITION',
    short: 'POS',
    group: 'Grappling',
    signed: false,
    dec: 1,
    tip: '30% of EFF — cage & mat control',
  },
  {
    key: 'FINISH_RATE',
    short: 'FIN%',
    group: 'Finishing',
    signed: false,
    dec: 1,
    tip: '% of wins by KO or submission',
  },
  {
    key: 'FACTOR_FINISH',
    short: 'FIN',
    group: 'Finishing',
    signed: false,
    dec: 1,
    tip: '20% of EFF — finishing ability',
  },
  {
    key: 'CARDIO_DECAY',
    short: 'CRDY',
    group: 'Durability',
    signed: false,
    dec: 2,
    tip: 'Late-round output ratio (R3+ vs R1). >1.0 = stronger late',
  },
  {
    key: 'FACTOR_CARDIO',
    short: 'CRD',
    group: 'Durability',
    signed: false,
    dec: 1,
    tip: '10% of EFF — sustained output & durability',
  },
];

const logistic = (x) => 1 / (1 + Math.exp(-x));
const fmt = (v, dec = 2, signed = false) => {
  if (v == null || isNaN(v)) return '—';
  const s = Math.abs(v).toFixed(dec);
  return signed ? (v >= 0 ? `+${s}` : `-${s}`) : s;
};
const rankColor = (rank, total) => {
  const p = rank / total;
  if (p <= 0.05) return 'text-emerald-400 font-semibold';
  if (p <= 0.15) return 'text-emerald-500';
  if (p <= 0.4) return 'text-slate-200';
  if (p <= 0.7) return 'text-slate-400';
  return 'text-red-400';
};
const credColor = (c) =>
  c >= 80
    ? 'text-emerald-400'
    : c >= 60
    ? 'text-yellow-400'
    : c >= 40
    ? 'text-orange-400'
    : 'text-red-400';
const decayColor = (v) =>
  v == null
    ? 'text-slate-600'
    : v >= 1.2
    ? 'text-emerald-400'
    : v >= 0.95
    ? 'text-slate-200'
    : 'text-red-400';
function makeBandTick(data) {
  return function BandTick({ x, y, payload }) {
    const row = data[payload?.index];
    const lowN = row?.lowN;
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={14} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={600}>
          {payload.value}
        </text>
        <text dy={28} textAnchor="middle" fill={lowN ? '#fbbf24' : '#64748b'} fontSize={10}>
          {row ? `n=${row.n}${lowN ? '*' : ''}` : ''}
        </text>
      </g>
    );
  };
}

const roiChartTooltipStyle = {
  contentStyle: {
    background: '#1e293b',
    border: '1px solid #475569',
    borderRadius: 8,
    fontSize: 12,
  },
  itemStyle: { color: '#cbd5e1' },
  labelStyle: { color: '#e2e8f0', fontWeight: 600 },
};

function RoiByMarketBandChart({ data, modelLabel = 'v1', windowComposition }) {
  const anySamples = data.some((d) => d.n > 0);
  const compositionText = windowComposition
    ? windowComposition.reconN > 0
      ? `${windowComposition.n} v2-scored fights in window (${windowComposition.liveN} live-captured, ${windowComposition.reconN} reconstructed)`
      : `${windowComposition.n} v2-scored fights in window (all live-captured)`
    : '';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-bold text-sm mb-1">ROI by Market Band</h3>
      <p className="text-slate-500 text-xs mb-3">
        {modelLabel === 'v2'
          ? `Stake-weighted ROI on V2's FROZEN pick (the probability stored at prediction/reconstruction time, at that pick's own price), grouped by that pick's raw market-implied probability. Same v2-scored population as the headline -- ${compositionText}. Dashed line = breakeven (0% ROI).`
          : "Flat 1u ROI on the actually-staked side, grouped by that side's raw market-implied probability. Dashed line = breakeven (0% ROI)."}
      </p>
      {!anySamples ? (
        <p className="text-slate-600 text-sm py-8 text-center">
          No staked, graded picks yet in the current filter window.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="band" interval={0} tick={makeBandTick(data)} height={40} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Breakeven', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              {...roiChartTooltipStyle}
              formatter={(v, name, item) =>
                v == null ? ['—', 'ROI'] : [`${v.toFixed(1)}%`, `ROI (n=${item.payload.n}${item.payload.lowN ? ', low sample' : ''})`]
              }
            />
            <Bar dataKey="roi" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.roi == null ? '#334155' : d.roi >= 0 ? '#34d399' : '#f87171'}
                  fillOpacity={d.lowN ? 0.45 : 0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      <p className="text-slate-600 text-[10px] mt-2">
        * n &lt; {ROI_ANALYTICS_LOW_N} — low sample, shown at reduced opacity. Interpret with caution.
      </p>
    </div>
  );
}

function ModelVsMarketBracketChart({ data, modelLabel = 'v2' }) {
  const totalN = data.reduce((s, d) => s + d.n, 0);
  const anySamples = totalN > 0;
  const ML = modelLabel.toUpperCase();
  // Same restriction and reasoning as CalibrationReliabilityChart: this
  // chart's v2 basis reads the same frozen v2pA/v2pB population, so it is
  // restricted to genuinely live-captured picks for the same reason.
  const isRestrictedV2 = modelLabel === 'v2';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-bold text-sm mb-1">{ML} Pick Win Rate vs. Market-Implied %</h3>
      <p className="text-slate-500 text-xs mb-3">
        {ML}'s picked side, grouped by that side's raw market-implied probability band.
        Market % is de-vigged (stripVig).
        {isRestrictedV2 && ' A win rate scored against picks made after the outcome was known is not a fair test — restricted to live-captured v2 picks only.'}
      </p>
      {isRestrictedV2 && (
        <p className="text-slate-600 text-xs mb-3">
          {totalN} live v2 {totalN === 1 ? 'prediction' : 'predictions'} available in the current filter window.
        </p>
      )}
      {!anySamples ? (
        <p className="text-slate-600 text-sm py-8 text-center">
          {isRestrictedV2
            ? 'No live-captured v2 predictions in the current filter window — most saved picks were computed after the event and cannot be used for a fair win-rate comparison.'
            : 'No decisive graded picks with frozen v1/v2 fields yet in the current filter window.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="band" interval={0} tick={makeBandTick(data)} height={40} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              {...roiChartTooltipStyle}
              formatter={(v, name) => (v == null ? ['—', name] : [`${v.toFixed(1)}%`, name])}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="actualWinRate" name="Actual Win %" fill="#f87171" radius={[3, 3, 0, 0]} />
            <Bar dataKey="marketImplied" name="Market Implied % (de-vig)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <p className="text-slate-600 text-[10px] mt-2">
        * n &lt; {ROI_ANALYTICS_LOW_N} — low sample (see x-axis labels). Interpret with caution.
      </p>
    </div>
  );
}

function CalibrationReliabilityChart({ data, modelLabel = 'v2', compact = false }) {
  const totalN = data.reduce((s, d) => s + d.n, 0);
  const anySamples = totalN > 0;
  const ML = modelLabel.toUpperCase();
  // v2's basis here is restricted to genuinely live predictions (see
  // computeCalibrationReliability) -- most saved v2 picks were computed
  // after their event, which a reliability curve can't honestly use. v1 has
  // no such restriction, so it gets the original, unqualified message.
  const isRestrictedV2 = modelLabel === 'v2';
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl ${compact ? 'p-3' : 'p-4'}`}>
      <h3 className="text-white font-bold text-sm mb-1">Calibration Reliability</h3>
      <p className="text-slate-500 text-xs mb-3">
        {ML}'s confidence on its picked side, bucketed, vs. actual win rate.
        Dashed line = mean predicted probability per bucket (perfect calibration reference).
        {isRestrictedV2 && ' Calibration requires predictions made before the outcome was known — restricted to live-captured v2 picks only.'}
      </p>
      {isRestrictedV2 && (
        <p className="text-slate-600 text-xs mb-3">
          {totalN} live v2 {totalN === 1 ? 'prediction' : 'predictions'} available in the current filter window.
        </p>
      )}
      {!anySamples ? (
        <p className="text-slate-600 text-sm py-8 text-center">
          {isRestrictedV2
            ? 'No live-captured v2 predictions in the current filter window — most saved picks were computed after the event and can’t be used for calibration.'
            : 'No decisive graded picks with frozen v1/v2 fields yet in the current filter window.'}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={compact ? 190 : 240}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bucket" interval={0} tick={makeBandTick(data)} height={40} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              {...roiChartTooltipStyle}
              formatter={(v, name) => (v == null ? ['—', name] : [`${v.toFixed(1)}%`, name])}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            <Bar dataKey="actualWinRate" name="Actual Win %" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.actualWinRate == null
                      ? '#334155'
                      : d.actualWinRate >= d.predictedMean
                      ? '#34d399'
                      : '#f87171'
                  }
                  fillOpacity={d.lowN ? 0.45 : 0.9}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="predictedMean"
              name="Predicted Mean (perfect calibration ref)"
              stroke="#e2e8f0"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 3, fill: '#e2e8f0' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      <p className="text-slate-600 text-[10px] mt-2">
        * n &lt; {ROI_ANALYTICS_LOW_N} — low sample (see x-axis labels). Green = actual ≥ predicted (not overconfident); red = actual &lt; predicted (overconfident).
      </p>
    </div>
  );
}

// Same tier colors already used by ROITab's own betTier() label styling
// (STRONG BET emerald-300, BET emerald-400, LEAN yellow-400, NO BET slate-500)
// -- not a new color convention, just the existing one in hex for recharts.
const BET_TIER_COLORS = {
  'STRONG BET': '#6ee7b7',
  'BET': '#34d399',
  'LEAN': '#facc15',
  'NO BET': '#64748b',
};

function BetTierWinRateChart({ data }) {
  const anySamples = data.some((d) => d.n > 0);
  const emptyTiers = data.filter((d) => d.n === 0).map((d) => d.tier);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-bold text-sm mb-1">Win Rate by Bet Tier</h3>
      <p className="text-slate-500 text-xs mb-3">
        V2's picked-side win rate, grouped by the tier STORED on each entry
        (including the declined NO BET pool) -- not re-gated against current
        data. For live-captured picks this is a genuine prediction-time tier;
        for reconstructed picks it's the original v1-era capture tier, carried
        over unchanged.
        {emptyTiers.length > 0 && ` No graded picks in ${emptyTiers.join('/')} this window.`}
      </p>
      {!anySamples ? (
        <p className="text-slate-600 text-sm py-8 text-center">
          No decisive graded picks with resolvable fighters yet in the current filter window.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="tier" interval={0} tick={makeBandTick(data)} height={40} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              {...roiChartTooltipStyle}
              formatter={(v, name, item) =>
                v == null ? ['—', 'Win Rate'] : [`${v.toFixed(1)}%`, `Win Rate (n=${item.payload.n}${item.payload.lowN ? ', low sample' : ''})`]
              }
            />
            <Bar dataKey="winRate" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={BET_TIER_COLORS[d.tier]} fillOpacity={d.lowN ? 0.45 : 0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      <p className="text-slate-600 text-[10px] mt-2">
        * n &lt; {ROI_ANALYTICS_LOW_N} — low sample, shown at reduced opacity. Interpret with caution.
      </p>
    </div>
  );
}

function BetTierRoiChart({ data }) {
  const anySamples = data.some((d) => d.n > 0);
  const emptyTiers = data.filter((d) => d.n === 0).map((d) => d.tier);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-bold text-sm mb-1">ROI by Bet Tier</h3>
      <p className="text-slate-500 text-xs mb-3">
        Stake-weighted ROI on V2's frozen picked side (at that side's own
        stored price), grouped by the tier STORED on each entry at capture/
        reconstruction time -- not re-gated against current data. Dashed line
        = breakeven (0% ROI).
        {emptyTiers.length > 0 && ` No graded picks in ${emptyTiers.join('/')} this window.`}
      </p>
      {!anySamples ? (
        <p className="text-slate-600 text-sm py-8 text-center">
          No decisive graded picks with resolvable fighters yet in the current filter window.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="tier" interval={0} tick={makeBandTick(data)} height={40} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Breakeven', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              {...roiChartTooltipStyle}
              formatter={(v, name, item) =>
                v == null ? ['—', 'ROI'] : [`${v.toFixed(1)}%`, `ROI (n=${item.payload.n}${item.payload.lowN ? ', low sample' : ''})`]
              }
            />
            <Bar dataKey="roi" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.roi == null ? '#334155' : d.roi >= 0 ? '#34d399' : '#f87171'}
                  fillOpacity={d.lowN ? 0.45 : 0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      <p className="text-slate-600 text-[10px] mt-2">
        * n &lt; {ROI_ANALYTICS_LOW_N} — low sample, shown at reduced opacity. Interpret with caution.
      </p>
    </div>
  );
}

function CumulativePnlChart({ data, modelLabel = 'v1', windowComposition }) {
  const compositionText = windowComposition
    ? windowComposition.reconN > 0
      ? `${windowComposition.n} v2-scored fights in window (${windowComposition.liveN} live-captured, ${windowComposition.reconN} reconstructed)`
      : `${windowComposition.n} v2-scored fights in window (all live-captured)`
    : '';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-bold text-sm mb-1">Cumulative P&amp;L by Event</h3>
      <p className="text-slate-500 text-xs mb-3">
        {modelLabel === 'v2'
          ? `Running net units on V2's FROZEN pick (stake-weighted, at that pick's own stored price), one point per event in chronological order. Same v2-scored population as the headline -- ${compositionText}.`
          : 'Running net units on the actually-staked side, one point per event in chronological order.'}
      </p>
      {data.length === 0 ? (
        <p className="text-slate-600 text-sm py-8 text-center">
          No staked, graded picks yet in the current filter window.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 24, left: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="eventName"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${v.toFixed(1)}u`}
              axisLine={false}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
            <Tooltip
              {...roiChartTooltipStyle}
              formatter={(v, name, item) => [`${v >= 0 ? '+' : ''}${v.toFixed(2)}u`, `Cumulative (n=${item.payload.n} this event)`]}
              labelFormatter={(label, items) => `${label} · ${items?.[0]?.payload?.eventDate || ''}`}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Cumulative Units"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function MonthlyPerformanceTable({ data, large = false, modelLabel = 'v1', windowComposition }) {
  const cellPad = large ? 'py-3 pr-6' : 'py-2 pr-4';
  const lastCellPad = large ? 'py-3' : 'py-2';
  const compositionText = windowComposition
    ? windowComposition.reconN > 0
      ? `${windowComposition.n} v2-scored fights in window (${windowComposition.liveN} live-captured, ${windowComposition.reconN} reconstructed)`
      : `${windowComposition.n} v2-scored fights in window (all live-captured)`
    : '';
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl ${large ? 'p-6' : 'p-4'}`}>
      <h3 className={`text-white font-bold ${large ? 'text-base mb-1' : 'text-sm mb-3'}`}>Monthly Performance</h3>
      {large && (
        <p className="text-slate-500 text-xs mb-4">
          {modelLabel === 'v2'
            ? `Bets, win rate, and net profit on V2's FROZEN pick (stake-weighted), grouped by calendar month. Same v2-scored population as the headline -- ${compositionText}.`
            : 'Bets, win rate, and net profit for the currently selected model, grouped by calendar month.'}
        </p>
      )}
      {data.length === 0 ? (
        <p className="text-slate-600 text-sm py-8 text-center">
          No staked, graded picks yet in the current filter window.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full ${large ? 'text-base' : 'text-sm'}`}>
            <thead>
              <tr className={`text-slate-500 uppercase tracking-wider border-b border-slate-800 ${large ? 'text-sm' : 'text-xs'}`}>
                <th className={`text-left ${cellPad} font-semibold`}>Month</th>
                <th className={`text-right ${cellPad} font-semibold`}>Bets</th>
                <th className={`text-right ${cellPad} font-semibold`}>Win Rate</th>
                <th className={`text-right ${cellPad} font-semibold`}>Staked</th>
                <th className={`text-right ${cellPad} font-semibold`}>Net Units</th>
                <th className={`text-right ${lastCellPad} font-semibold`}>ROI</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.month} className="border-b border-slate-800/60 last:border-0">
                  <td className={`${cellPad} text-slate-300`}>{row.month}</td>
                  <td className={`${cellPad} text-right text-slate-300`}>{row.n}</td>
                  <td className={`${cellPad} text-right text-slate-300`}>
                    {row.winRate == null ? '—' : `${row.winRate.toFixed(1)}%`}
                  </td>
                  <td className={`${cellPad} text-right text-slate-300`}>{row.staked.toFixed(2)}u</td>
                  <td className={`${cellPad} text-right font-semibold ${row.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {row.netUnits >= 0 ? '+' : ''}{row.netUnits.toFixed(2)}u
                  </td>
                  <td className={`${lastCellPad} text-right font-semibold ${row.roi == null ? 'text-slate-600' : row.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {row.roi == null ? '—' : `${row.roi >= 0 ? '+' : ''}${row.roi.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── STATISTICS TAB ─────────────────────────────────────────────────────────
// Read-only analytics view. Charts here are unchanged from the ROI-tab build:
// same population logic (filterRoiEntriesForStats mirrors displayedEntries),
// same n<8 low-n convention, same de-vig/raw conventions -- this component
// only relocates rendering, it does not recompute anything differently.
function StatisticsTab({ entries, prospectNameSet, filterSince, setFilterSince, propPicks, parlayEntries }) {
  const statsEntries = useMemo(
    () => filterRoiEntriesForStats(entries, prospectNameSet, filterSince),
    [entries, prospectNameSet, filterSince]
  );

  // Earliest eventDate with a stored v2 score, independent of the current
  // Since filter -- derived from data (not hardcoded) so it stays correct if
  // older fights ever get v2-backfilled. Both hero cards are gated to
  // v2-scored fights (see computeV2Summary), so dragging Since to or before
  // this date can't change either number -- there's no v2 data back there.
  const v2ScoredFloorDate = useMemo(() => {
    const prospectFree = filterRoiEntriesForStats(entries, prospectNameSet, '');
    const scored = prospectFree.filter((e) => e.v2pA != null && e.v2pB != null && e.eventDate);
    if (scored.length === 0) return null;
    return scored.reduce((min, e) => (e.eventDate < min ? e.eventDate : min), scored[0].eventDate);
  }, [entries, prospectNameSet]);

  // v2's genuinely prospective subset -- captureMode==='live' means the
  // prediction was saved before its event happened, so its frozen v2pA/v2pB
  // was never touched by the fight's own outcome. This is the population for
  // "Live-tracked performance," the one number that's an actual track record.
  const liveOnlyEntries = useMemo(
    () => statsEntries.filter((e) => e._provenance?.captureMode === 'live'),
    [statsEntries]
  );

  // v1/v2 toggle -- same UI pattern and default ('v2') as ROITab's own
  // modelView. Both bases are always computed (cheap, memoized), matching
  // ROITab's own "compute both, display one" approach; the toggle only
  // controls which is rendered.
  const [modelView, setModelView] = useState('v2');

  const roiByBandDataV1 = useMemo(() => computeRoiByMarketBand(statsEntries), [statsEntries]);
  const roiByBandDataV2 = useMemo(() => computeRoiByMarketBandV2(statsEntries), [statsEntries]);
  const modelVsMarketDataV1 = useMemo(() => computeModelVsMarketByBand(statsEntries, 'v1'), [statsEntries]);
  const modelVsMarketDataV2 = useMemo(() => computeModelVsMarketByBand(statsEntries, 'v2'), [statsEntries]);
  const calibrationDataV1 = useMemo(() => computeCalibrationReliability(statsEntries, 'v1'), [statsEntries]);
  const calibrationDataV2 = useMemo(() => computeCalibrationReliability(statsEntries, 'v2'), [statsEntries]);
  const betTierData = useMemo(() => computeBetTierBreakdown(statsEntries), [statsEntries]);
  const v2WindowComposition = useMemo(() => computeV2WindowComposition(statsEntries), [statsEntries]);
  const summaryV1 = useMemo(() => computeROISummary(statsEntries, new Set()), [statsEntries]);
  // Single v2 hero (2026-07-21): `summaryV2All`, frozen scoring across every
  // graded fight in the filtered window (20 live-captured + reconstructed),
  // is the one number rendered -- it moves with the SINCE filter and
  // reconciles with the monthly table, since both read the same population.
  // `summaryV2Live` (the live-captured-only subset) is kept computed but no
  // longer rendered -- restore the two-number split by re-adding it to the
  // Pick Accuracy/ROI cards if the live-vs-reconstructed distinction is
  // needed again.
  const summaryV2Live = useMemo(() => computeV2Summary(liveOnlyEntries), [liveOnlyEntries]);
  const summaryV2All = useMemo(() => computeV2Summary(statsEntries), [statsEntries]);
  const cumulativeDataV1 = useMemo(() => computeCumulativePnl(statsEntries), [statsEntries]);
  const cumulativeDataV2 = useMemo(() => computeCumulativePnlV2(statsEntries), [statsEntries]);
  const monthlyDataV1 = useMemo(() => computeMonthlyPerformance(statsEntries), [statsEntries]);
  const monthlyDataV2 = useMemo(() => computeMonthlyPerformanceV2(statsEntries), [statsEntries]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white font-black text-xl mb-1">Statistics</h2>
          <p className="text-slate-400 text-sm">
            Live calibration and ROI analysis of FightMetrics' models, computed
            from graded ROI entries.
          </p>
        </div>
        {/* v1 display hidden 2026-07-21 per single-model view (v2 only) --
            restore by re-enabling this toggle block. modelView stays 'v2' by
            default with setModelView never called, so every modelView==='v1'
            branch below is intact but unreachable. */}
      </div>

      {entries.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Since</span>
            <input
              type="date"
              value={filterSince}
              onChange={e => setFilterSince(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 min-h-[44px] sm:min-h-0 sm:h-9 focus:outline-hidden focus:border-red-500"
            />
            {filterSince && (
              <button
                onClick={() => setFilterSince('')}
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-slate-500 hover:text-slate-300 text-xs underline"
              >
                Clear
              </button>
            )}
            {filterSince && (
              <span className="text-slate-600 text-xs">
                {statsEntries.length} fights
              </span>
            )}
          </div>
          {v2ScoredFloorDate && (!filterSince || filterSince <= v2ScoredFloorDate) && (
            <span className="text-slate-600 text-xs">
              Earliest v2-scored fight: {v2ScoredFloorDate}. Dates before this don't change the stats — v2 hadn't scored fights yet.
            </span>
          )}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
          <BarChart2 size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No saved predictions yet.</p>
          <p className="text-xs mt-1">
            Save predictions from the Simulator and grade them in the ROI tab
            to populate these charts.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-stretch">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Tracked Fights</p>
              <p className="font-black text-2xl mt-2 text-white">{summaryV1.total}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Graded Picks</p>
              <p className="font-black text-2xl mt-2 text-blue-400">{summaryV1.graded}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Pick Accuracy</p>
              {modelView === 'v2' ? (
                <>
                  <p className={`font-black text-2xl mt-2 ${summaryV2All.accuracy >= 60 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {summaryV2All.accuracy.toFixed(1)}%
                  </p>
                  <p className="text-slate-600 text-[10px] mt-1">
                    v2 frozen scoring across {summaryV2All.graded} graded fights (stake-weighted). Frozen at each pick's capture — no lookahead.
                  </p>
                </>
              ) : (
                <p className={`font-black text-2xl mt-2 ${summaryV1.accuracy >= 60 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {summaryV1.accuracy.toFixed(1)}%
                </p>
              )}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">ROI</p>
              {modelView === 'v2' ? (
                <>
                  <p className={`font-black text-2xl mt-2 ${summaryV2All.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {summaryV2All.roi >= 0 ? '+' : ''}{summaryV2All.roi.toFixed(1)}%
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    {summaryV2All.profit >= 0 ? '+' : ''}{summaryV2All.profit.toFixed(2)}u on {summaryV2All.bets} bets (stake-weighted)
                  </p>
                </>
              ) : (
                <>
                  <p className={`font-black text-2xl mt-2 ${summaryV1.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {summaryV1.roi >= 0 ? '+' : ''}{summaryV1.roi.toFixed(1)}%
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    {summaryV1.profit >= 0 ? '+' : ''}{summaryV1.profit.toFixed(2)}u on {summaryV1.bets} bets
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mb-6">
            <MonthlyPerformanceTable
              data={modelView === 'v2' ? monthlyDataV2 : monthlyDataV1}
              large
              modelLabel={modelView === 'v2' ? 'v2' : 'v1'}
              windowComposition={v2WindowComposition}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <CumulativePnlChart data={modelView === 'v2' ? cumulativeDataV2 : cumulativeDataV1} modelLabel={modelView === 'v2' ? 'v2' : 'v1'} windowComposition={v2WindowComposition} />
            <RoiByMarketBandChart data={modelView === 'v2' ? roiByBandDataV2 : roiByBandDataV1} modelLabel={modelView === 'v2' ? 'v2' : 'v1'} windowComposition={v2WindowComposition} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <ModelVsMarketBracketChart data={modelView === 'v2' ? modelVsMarketDataV2 : modelVsMarketDataV1} modelLabel={modelView === 'v2' ? 'v2' : 'v1'} />
            <CalibrationReliabilityChart data={modelView === 'v2' ? calibrationDataV2 : calibrationDataV1} modelLabel={modelView === 'v2' ? 'v2' : 'v1'} compact />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BetTierWinRateChart data={betTierData} />
            <BetTierRoiChart data={betTierData} />
          </div>
        </>
      )}

      <PropStatsSection picks={propPicks} />
      <ParlayStatsSection parlayEntries={parlayEntries} roiEntries={entries} />
    </div>
  );
}

// ─── PROP BETS — Alex's manual, discretionary method-of-victory picks ──────
// HARD ISOLATION: everything below this line operates ONLY on PROP_PICKS-
// shaped objects, imported ONLY from the standalone src/propPicksData.js.
// Nothing here reads ROI_ENTRIES, UPCOMING_ENTRIES, FIGHTERS-derived model
// output, v2DataMap, computeMatchupEdges, or any betAction/edge/Kelly value.
// Reuses only pure, source-agnostic math utilities that already exist
// (americanToDecimal for payout math) -- no new odds/EV logic invented.
const PROP_METHOD_SINGLE = ['KO/TKO', 'Submission', 'Decision'];
const PROP_METHOD_DOUBLE = ['KO/TKO or Submission', 'KO/TKO or Decision', 'Submission or Decision'];
const PROP_METHOD_OPTIONS = [...PROP_METHOD_SINGLE, ...PROP_METHOD_DOUBLE];

// Export-string builders -- one definition each, called from both
// UpcomingEventTab and ROITab so every sub-tab that displays a data type also
// has a "Copy Updated ...File.js" button, without duplicating the
// serialization logic in two places. Status/result on each parlay stays
// as-stored (not frozen at export time) -- re-derived live via
// computeParlayResult whenever the pasted-over file is reloaded, per the
// locked no-freeze decision.
const buildPropsExportedCode = (propPicks) =>
  `export const PROP_PICKS = ${JSON.stringify(propPicks, null, 2)};\n`;
const buildParlayExportedCode = (parlayEntries) =>
  `export const PARLAY_ENTRIES = ${JSON.stringify(parlayEntries, null, 2)};\n`;

const PROP_RESULT_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
  { value: 'PUSH', label: 'Push/Void' },
];

const PROP_INPUT_CLS =
  'w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500';
const PROP_LABEL_CLS =
  'text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5';

// Prop entry form, reused from two entry points in the Upcoming tab:
//   mode="fromFight" -- opened from a specific fight card's "+ Prop" button.
//     fighterA/fighterB/eventName/eventDate/upcomingId are FIXED (passed in,
//     read-only) -- this is the primary path, importing straight from the
//     card that was clicked.
//   mode="manual"    -- opened from the Props section's "+ Log a manual prop"
//     link, for fights not tracked in Upcoming. Owns its own event/fighter
//     fields via FighterSearch; upcomingId is always null.
// Writes ONLY through onAdd into the isolated PROP_PICKS state -- never
// touches upcomingEntries or roiEntries.
function PropEntryForm({
  mode,
  fighterA: fixedFighterA,
  fighterB: fixedFighterB,
  eventName: fixedEventName,
  eventDate: fixedEventDate,
  upcomingId,
  allFighters,
  onAdd,
  onCancel,
}) {
  const isManual = mode === 'manual';
  const [manualEventName, setManualEventName] = useState('');
  const [manualEventDate, setManualEventDate] = useState('');
  const [manualFighterA, setManualFighterA] = useState(null);
  const [manualFighterB, setManualFighterB] = useState(null);
  const [side, setSide] = useState('A');
  const [method, setMethod] = useState(PROP_METHOD_SINGLE[0]);
  const [odds, setOdds] = useState('');
  const [stake, setStake] = useState('');

  const fighterA = isManual ? (manualFighterA?.FIGHTER || '') : (fixedFighterA || '');
  const fighterB = isManual ? (manualFighterB?.FIGHTER || '') : (fixedFighterB || '');
  const eventName = isManual ? manualEventName.trim() : (fixedEventName || '');
  const eventDate = isManual ? manualEventDate : (fixedEventDate || '');

  const resolvedSide = side === 'fight' ? null : side;
  const sideFighterName = resolvedSide === 'A' ? fighterA : resolvedSide === 'B' ? fighterB : '';
  const sideValid = resolvedSide == null || Boolean(sideFighterName);
  const canSubmit = Boolean(method) && Boolean(eventName) && Boolean(odds.trim()) && sideValid;

  const previewLabel = sideValid
    ? buildPropLabel({ side: resolvedSide, method, fighterA, fighterB })
    : '';

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      id: createPredictionId(),
      createdAt: new Date().toISOString(),
      pickSource: 'human',
      upcomingId: isManual ? null : (upcomingId ?? null),
      eventName,
      eventDate,
      fighterA,
      fighterB,
      side: resolvedSide,
      method,
      odds: odds.trim(),
      stake: stake.trim() ? Number(stake) : 1,
      result: 'PENDING',
      label: buildPropLabel({ side: resolvedSide, method, fighterA, fighterB }),
      propType: propTypeOf({ side: resolvedSide, method }),
    });
  };

  const sideButtons = [
    { id: 'A', label: fighterA || 'Fighter A', disabled: !fighterA },
    { id: 'B', label: fighterB || 'Fighter B', disabled: !fighterB },
    { id: 'fight', label: 'Fight-level', disabled: false },
  ];

  return (
    <div>
      {isManual ? (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={PROP_LABEL_CLS}>Event Name</label>
            <input
              type="text"
              value={manualEventName}
              onChange={(e) => setManualEventName(e.target.value)}
              placeholder="UFC 329"
              className={PROP_INPUT_CLS}
            />
          </div>
          <div>
            <label className={PROP_LABEL_CLS}>Event Date</label>
            <input
              type="date"
              value={manualEventDate}
              onChange={(e) => setManualEventDate(e.target.value)}
              className={`${PROP_INPUT_CLS} h-10`}
            />
          </div>
          <div>
            <label className={PROP_LABEL_CLS}>Fighter A</label>
            <FighterSearch
              allFighters={allFighters}
              value={manualFighterA}
              onChange={setManualFighterA}
              placeholder="Search fighter…"
            />
          </div>
          <div>
            <label className={PROP_LABEL_CLS}>Fighter B (optional)</label>
            <FighterSearch
              allFighters={allFighters}
              value={manualFighterB}
              onChange={setManualFighterB}
              placeholder="Search fighter…"
              accent="blue"
            />
          </div>
        </div>
      ) : (
        <p className="text-sm mb-4">
          <span className="text-white font-semibold">{fighterA} vs. {fighterB}</span>
          <span className="text-slate-500"> · {eventName}{eventDate ? ` · ${eventDate}` : ''}</span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={PROP_LABEL_CLS}>Prop Subject</label>
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            {sideButtons.map(({ id, label, disabled }) => (
              <button
                key={id}
                disabled={disabled}
                onClick={() => setSide(id)}
                title={label}
                className={`flex-1 min-w-0 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors truncate ${
                  side === id
                    ? 'bg-red-600 text-white'
                    : disabled
                    ? 'text-slate-700 cursor-not-allowed'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={PROP_LABEL_CLS}>Method (required)</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={`${PROP_INPUT_CLS} cursor-pointer`}
          >
            <optgroup label="Single method">
              {PROP_METHOD_SINGLE.map((m) => <option key={m} value={m}>{m}</option>)}
            </optgroup>
            <optgroup label="Double chance (any two)">
              {PROP_METHOD_DOUBLE.map((m) => <option key={m} value={m}>{m}</option>)}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={PROP_LABEL_CLS}>Odds</label>
          <input
            type="text"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            placeholder="+250"
            className={PROP_INPUT_CLS}
          />
        </div>
        <div>
          <label className={PROP_LABEL_CLS}>Stake (u)</label>
          <input
            type="number"
            step="0.1"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            placeholder="1"
            className={PROP_INPUT_CLS}
          />
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/60 rounded-lg px-3 py-2 mb-4">
        <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold mr-2">This bet</span>
        <span className="text-slate-200 text-sm font-semibold">{previewLabel || '—'}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            canSubmit ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          Log Prop
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Props section within the Upcoming tab: lists PENDING props (result ===
// 'PENDING') -- the props analogue of the fight cards above it. Setting a
// result via the select moves the prop out of this list; since PROP_PICKS is
// a single array filtered by result (not two arrays like upcoming/roi), that
// happens automatically as soon as the parent's state updates -- no explicit
// migration call needed here. Manual props (no parent fight card) get their
// own entry point via the header link, since nesting under a card isn't
// possible for them.
function PendingPropsSection({ picks, onGrade, onDelete, manualOpen, onToggleManual, allFighters, onAddManual }) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-slate-500" />
          <h3 className="text-white font-black text-base">Props</h3>
          <span className="text-slate-600 text-xs hidden sm:inline">pending method-of-victory picks</span>
        </div>
        <button
          onClick={onToggleManual}
          className="hidden sm:inline text-xs font-semibold text-slate-400 hover:text-white underline decoration-dotted underline-offset-2"
        >
          {manualOpen ? 'Cancel manual prop' : '+ Log a manual prop'}
        </button>
      </div>

      {manualOpen && (
        <div className="hidden sm:block bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
          <PropEntryForm mode="manual" allFighters={allFighters} onAdd={onAddManual} onCancel={onToggleManual} />
        </div>
      )}

      {picks.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-600">
          <p className="text-sm">No pending props.</p>
          <p className="text-xs mt-1">
            Click <span className="text-slate-400 font-semibold">+ Prop</span> on a fight card above, or log one manually.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {picks.map((pick) => {
            const label = pick.label || buildPropLabel(pick);
            const matchup = pick.fighterB ? `${pick.fighterA} vs. ${pick.fighterB}` : (pick.fighterA || '—');
            const stake = Number(pick.stake) || 1;
            return (
              <div key={pick.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {matchup} · {pick.eventName}{pick.eventDate ? ` · ${pick.eventDate}` : ''}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">{pick.odds} · {stake}u</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <select
                    value={pick.result}
                    onChange={(e) => onGrade(pick.id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-red-500 cursor-pointer"
                  >
                    {PROP_RESULT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button
                    onClick={() => {
                      const meta = [matchup, pick.eventName, pick.eventDate].filter(Boolean).join(' · ');
                      if (window.confirm(`Delete this prop pick?\n\n${label}\n${meta}\n\nThis cannot be undone unless you've already run "Copy Updated propPicksData.js".`)) {
                        onDelete(pick.id);
                      }
                    }}
                    className="text-slate-600 hover:text-red-400 text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Prop Bets sub-tab of the ROI tab. Table of the isolated PROP_PICKS with
// inline grading + delete. Reads ONLY PROP_PICKS -- no model data, no v1/v2.
function PropBetsPanel({ picks, onGrade, onDelete }) {
  if (picks.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
        <ClipboardList size={36} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">No graded prop bets yet.</p>
        <p className="text-xs mt-1">
          Log and grade props from the <span className="text-slate-400 font-semibold">Upcoming</span> tab — they land here once resolved.
        </p>
      </div>
    );
  }
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
              <th className="text-left font-semibold px-4 py-3">Prop</th>
              <th className="text-left font-semibold px-4 py-3">Matchup</th>
              <th className="text-left font-semibold px-4 py-3">Result</th>
              <th className="text-left font-semibold px-4 py-3">Bet</th>
              <th className="text-right font-semibold px-4 py-3">P&amp;L</th>
              <th className="text-left font-semibold px-4 py-3">Event</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {picks.map((pick) => {
              const label = pick.label || buildPropLabel(pick);
              const matchup = pick.fighterB
                ? `${pick.fighterA} vs. ${pick.fighterB}`
                : (pick.fighterA || '—');
              const stake = Number(pick.stake) || 1;
              const profit = propPickProfit(pick);
              const graded = pick.result !== 'PENDING';
              return (
                <tr key={pick.id} className="border-b border-slate-800/60 last:border-0">
                  <td className="px-4 py-3 text-slate-200 font-semibold">{label}</td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{matchup}</td>
                  <td className="px-4 py-3">
                    <select
                      value={pick.result}
                      onChange={(e) => onGrade(pick.id, e.target.value)}
                      className="hidden sm:inline-block bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-hidden focus:border-red-500 cursor-pointer"
                    >
                      {PROP_RESULT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{pick.odds} · {stake}u</td>
                  <td className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                    !graded ? 'text-slate-600' : profit > 0 ? 'text-emerald-400' : profit < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {!graded ? '—' : pick.result === 'PUSH' ? 'Push' : `${profit > 0 ? '+' : ''}${profit.toFixed(2)}u`}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {pick.eventName}{pick.eventDate ? ` · ${pick.eventDate}` : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        const meta = [matchup, pick.eventName, pick.eventDate].filter(Boolean).join(' · ');
                        if (window.confirm(`Delete this graded prop?\n\n${label}\n${meta}\n\nThis cannot be undone unless you've already run "Copy Updated propPicksData.js".`)) {
                          onDelete(pick.id);
                        }
                      }}
                      className="hidden sm:inline text-slate-600 hover:text-red-400 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Parlays sub-tab of the ROI tab. Sibling to PropBetsPanel. Reads
// parlayEntries and a READ-ONLY roiEntries (passed through only so
// computeParlayResult can look up each leg's actual winner) -- never calls
// computeV2Summary/computeV2FrozenRows/filterRoiEntriesForStats/
// computeROISummary, never mutates roiEntries. Grading is derived live on
// every render via computeParlayResult; nothing here freezes a result onto
// the entry (that happens only at export time, a later commit).
const PARLAY_STATUS_BADGE_CLS = {
  PENDING: 'bg-slate-800 text-slate-400 border-slate-700',
  WIN: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
  LOSS: 'bg-red-900/30 text-red-400 border-red-800',
  NEEDS_REVIEW: 'bg-amber-900/30 text-amber-400 border-amber-800',
};

// showSummary: the Graded/Win Rate/Net Units/ROI banner is a performance-
// tracking aggregate (computeParlaySummary), not a bet-management view --
// it belongs on Statistics (ParlayStatsSection, mirroring PropStatsSection),
// not on Upcoming's Parlays sub-tab where the same component renders the
// pending-bet list. Default true so ROI's Parlays sub-tab (still an
// aggregate/performance view) is unaffected; Upcoming passes false.
function ParlaysPanel({ parlayEntries, roiEntries, onDelete, showSummary = true }) {
  const summary = useMemo(
    () => computeParlaySummary(parlayEntries, roiEntries),
    [parlayEntries, roiEntries]
  );

  if (parlayEntries.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
        <ClipboardList size={36} className="mx-auto mb-3 opacity-20" />
        <p className="text-sm">No parlays yet.</p>
        <p className="text-xs mt-1">
          Select 2+ fights in the <span className="text-slate-400 font-semibold">Upcoming</span> tab and click Build Parlay.
        </p>
      </div>
    );
  }

  return (
    <div>
      {showSummary && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 items-stretch">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Graded Parlays</p>
              <p className="font-black text-2xl mt-2 text-white">{summary.graded}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Win Rate</p>
              <p className="font-black text-2xl mt-2 text-blue-400">
                {summary.graded ? `${summary.winRate.toFixed(1)}%` : '—'}
              </p>
              <p className="text-slate-600 text-xs mt-1">{summary.wins}W of {summary.graded} graded</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Net Units</p>
              <p className={`font-black text-2xl mt-2 ${summary.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.netUnits >= 0 ? '+' : ''}{summary.netUnits.toFixed(2)}u
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">ROI</p>
              <p className={`font-black text-2xl mt-2 ${summary.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.staked > 0 ? `${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-xs mb-4">
            Win rate, net units, and ROI count only graded WIN/LOSS parlays — pending and needs-review parlays are excluded.
          </p>
        </>
      )}

      <div className="space-y-3">
        {parlayEntries.map((parlay) => {
          const derived = computeParlayResult(parlay, roiEntries);
          const legResultByFightId = new Map(derived.legResults.map((l) => [l.fightId, l]));
          const stake = Number(parlay.unitsWagered) || 1;
          let profit = null;
          if (derived.result === 'WIN') {
            const dec = americanToDecimal(parlay.combinedOdds);
            profit = dec ? stake * (dec - 1) : null;
          } else if (derived.result === 'LOSS') {
            profit = -stake;
          }
          const badgeLabel = derived.status === 'PENDING' ? 'PENDING' : derived.result;
          return (
            <div key={parlay.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-white font-bold text-sm">{parlay.eventName}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {parlay.combinedOdds} · {stake}u · {derived.resolvedLegs}/{derived.totalLegs} legs resolved
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      PARLAY_STATUS_BADGE_CLS[badgeLabel] || PARLAY_STATUS_BADGE_CLS.PENDING
                    }`}
                  >
                    {badgeLabel === 'NEEDS_REVIEW' ? 'Needs Review' : badgeLabel}
                  </span>
                  {onDelete && (
                    <button
                      onClick={() => {
                        const legCount = parlay.legs.length;
                        if (window.confirm(`Delete this parlay?\n\n${parlay.eventName} · ${legCount} leg${legCount === 1 ? '' : 's'} · ${parlay.combinedOdds}\n\nThis cannot be undone unless you've already run "Copy Updated parlayData.js".`)) {
                          onDelete(parlay.id);
                        }
                      }}
                      className="hidden sm:inline text-slate-600 hover:text-red-400 text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                {parlay.legs.map((leg) => {
                  const legResult = legResultByFightId.get(leg.fightId);
                  const legStatus = !legResult?.resolved
                    ? 'pending'
                    : legResult.pushed
                    ? 'push'
                    : legResult.correct
                    ? 'correct'
                    : 'incorrect';
                  const legStatusCls =
                    legStatus === 'correct'
                      ? 'text-emerald-400 font-semibold'
                      : legStatus === 'incorrect'
                      ? 'text-red-400 font-semibold'
                      : legStatus === 'push'
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-600';
                  const legStatusLabel =
                    legStatus === 'correct'
                      ? 'Won'
                      : legStatus === 'incorrect'
                      ? 'Lost'
                      : legStatus === 'push'
                      ? 'NC/Draw'
                      : 'Pending';
                  return (
                    <div
                      key={leg.fightId}
                      className="flex items-center justify-between text-xs bg-slate-800/40 rounded-lg px-3 py-2"
                    >
                      <span className="text-slate-300">
                        {leg.pickedFighter}
                        <span className="text-slate-600"> ({leg.fighterA} vs. {leg.fighterB})</span>
                      </span>
                      <span className={legStatusCls}>{legStatusLabel}</span>
                    </div>
                  );
                })}
              </div>

              <p
                className={`text-right font-bold text-sm ${
                  profit == null ? 'text-slate-600' : profit > 0 ? 'text-emerald-400' : profit < 0 ? 'text-red-400' : 'text-slate-400'
                }`}
              >
                {profit == null ? '—' : `${profit > 0 ? '+' : ''}${profit.toFixed(2)}u`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Prop statistics -- a visually + computationally DISTINCT section on the
// Statistics tab. Reads ONLY PROP_PICKS; never blended into model charts and
// never affected by the v1/v2 model toggle. n<8 low-sample flag matches the
// ROI_ANALYTICS_LOW_N convention used by every other chart on this tab.
function PropStatsSection({ picks }) {
  const summary = useMemo(() => computePropSummary(picks), [picks]);
  const breakdown = useMemo(() => computePropTypeBreakdown(picks), [picks]);
  const hasLowSample = breakdown.some((b) => b.decisive > 0 && b.decisive < ROI_ANALYTICS_LOW_N);

  return (
    <div className="mt-10 pt-8 border-t border-slate-800">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={18} className="text-slate-400" />
        <h3 className="text-white font-black text-lg">Prop Bets</h3>
      </div>
      <p className="text-slate-500 text-sm mb-5">
        Manual method-of-victory picks — separate from the model, and unaffected by the v1/v2 toggle above.
      </p>

      {picks.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
          <p className="text-sm">No prop bets logged yet.</p>
          <p className="text-xs mt-1">Add one from the Upcoming tab.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-stretch">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Graded Props</p>
              <p className="font-black text-2xl mt-2 text-white">{summary.total}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Win Rate</p>
              <p className="font-black text-2xl mt-2 text-blue-400">
                {summary.graded ? `${summary.winRate.toFixed(1)}%` : '—'}
              </p>
              <p className="text-slate-600 text-xs mt-1">{summary.wins}W of {summary.graded} graded</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Net Units</p>
              <p className={`font-black text-2xl mt-2 ${summary.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.netUnits >= 0 ? '+' : ''}{summary.netUnits.toFixed(2)}u
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">ROI</p>
              <p className={`font-black text-2xl mt-2 ${summary.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.staked > 0 ? `${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">By Prop Type</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="text-left font-semibold px-4 py-3">Type</th>
                    <th className="text-right font-semibold px-4 py-3">Count</th>
                    <th className="text-right font-semibold px-4 py-3">Win Rate</th>
                    <th className="text-right font-semibold px-4 py-3">Staked</th>
                    <th className="text-right font-semibold px-4 py-3">Net Units</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b) => {
                    const lowN = b.decisive > 0 && b.decisive < ROI_ANALYTICS_LOW_N;
                    return (
                      <tr key={b.type} className="border-b border-slate-800/60 last:border-0">
                        <td className="px-4 py-3 text-slate-200 font-semibold">{b.type}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{b.count}</td>
                        <td className={`px-4 py-3 text-right ${lowN ? 'text-slate-500' : 'text-slate-300'}`}>
                          {b.decisive ? `${b.winRate.toFixed(1)}%${lowN ? ' *' : ''}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">{b.staked.toFixed(2)}u</td>
                        <td className={`px-4 py-3 text-right font-bold ${b.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {b.netUnits >= 0 ? '+' : ''}{b.netUnits.toFixed(2)}u
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {hasLowSample && (
            <p className="text-slate-600 text-xs mt-2">
              * n &lt; {ROI_ANALYTICS_LOW_N} graded — low sample, interpret with caution.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Parlay statistics -- a visually + computationally DISTINCT section on the
// Statistics tab, mirroring PropStatsSection immediately above it. Reads
// ONLY parlayEntries + a READ-ONLY roiEntries (passed through solely so
// computeParlaySummary/computeParlayResult can look up each leg's actual
// winner) -- never blended into model charts, never calls
// computeV2Summary/computeV2FrozenRows/filterRoiEntriesForStats/
// computeROISummary, and never affected by the v1/v2 model toggle. Same as
// PropStatsSection, this ignores the Since filter entirely -- StatisticsTab
// passes PropStatsSection the raw unfiltered propPicks (not gated by
// filterSince), so ParlayStatsSection is fed the raw unfiltered `entries`
// (roiEntries) too, not the Since-filtered `statsEntries`, for the same
// all-time-performance framing.
function ParlayStatsSection({ parlayEntries, roiEntries }) {
  const summary = useMemo(
    () => computeParlaySummary(parlayEntries, roiEntries),
    [parlayEntries, roiEntries]
  );

  return (
    <div className="mt-10 pt-8 border-t border-slate-800">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={18} className="text-slate-400" />
        <h3 className="text-white font-black text-lg">Parlays</h3>
      </div>
      <p className="text-slate-500 text-sm mb-5">
        Manual multi-fight parlay bets — separate from the model, and unaffected by the v1/v2 toggle above.
      </p>

      {parlayEntries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
          <p className="text-sm">No parlays logged yet.</p>
          <p className="text-xs mt-1">Build one from the Upcoming tab.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2 items-stretch">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Graded Parlays</p>
              <p className="font-black text-2xl mt-2 text-white">{summary.graded}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Win Rate</p>
              <p className="font-black text-2xl mt-2 text-blue-400">
                {summary.graded ? `${summary.winRate.toFixed(1)}%` : '—'}
              </p>
              <p className="text-slate-600 text-xs mt-1">{summary.wins}W of {summary.graded} graded</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Net Units</p>
              <p className={`font-black text-2xl mt-2 ${summary.netUnits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.netUnits >= 0 ? '+' : ''}{summary.netUnits.toFixed(2)}u
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
              <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">ROI</p>
              <p className={`font-black text-2xl mt-2 ${summary.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.staked > 0 ? `${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%` : '—'}
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-xs">
            Win rate, net units, and ROI count only graded WIN/LOSS parlays — pending and needs-review parlays are excluded.
          </p>
        </>
      )}
    </div>
  );
}

// Single source of truth for ROI summary math.
// Called once in App() via useMemo; result passed as prop to HomeTab and ROITab.
const fmtHeight = (i) => (i ? `${Math.floor(i / 12)}' ${i % 12}"` : '—');
const fmtReach = (r) => (r ? `${r}"` : '—');
const fmtCtrl = (s) => {
  if (!s) return '0:00';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const stanceColor = (s) =>
  s === 'Southpaw'
    ? 'text-blue-400'
    : s === 'Switch'
    ? 'text-purple-400'
    : 'text-slate-300';

const methodColor = (m) => {
  if (!m) return 'text-slate-400';
  if (m === 'KO' || m === 'TKO-Dr') return 'text-red-400';
  if (m === 'Sub') return 'text-purple-400';
  if (m.startsWith('Dec')) return 'text-blue-400';
  return 'text-slate-400';
};
export const MODEL_VERSION = 'DrossPom Composite v1.0 · Logistic v2.0';

// Local edit buffer (separate from the committed value) so a controlled
// number input can hold an in-progress "2." without React snapping it back
// to "2" on every keystroke -- only well-formed numbers get committed up.
function UnitsStakedInput({ value, onCommit }) {
  const [raw, setRaw] = useState(String(value));
  return (
    <input
      type="number"
      step="0.1"
      min="0"
      value={raw}
      onChange={(e) => {
        const next = e.target.value;
        setRaw(next);
        const n = Number(next);
        if (next !== '' && !Number.isNaN(n)) onCommit(n);
      }}
      onBlur={() => setRaw(String(value))}
      className="w-20 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-red-500"
    />
  );
}

// Build Parlay modal -- sibling to PropEntryForm, not a shared refactor.
// legInputs are the ALREADY-computed per-fight values from
// UpcomingEventTab's modelPickByEntryId (v2DefaultFighter/v2WinProb) --
// this component never calls computeMatchupEdges itself, so a pre-filled
// leg can never drift from what modelPickByEntryId already resolved.
// pickedFighter defaults to v2DefaultFighter; the override buttons below
// mirror PropEntryForm's side-select pattern (App.js:2746-2764).
function BuildParlayPanel({ legInputs, onConfirm, onCancel }) {
  const [picks, setPicks] = useState(() =>
    legInputs.map((l) => ({ ...l, pickedFighter: l.v2DefaultFighter, overridden: false }))
  );
  const [combinedOdds, setCombinedOdds] = useState('');
  const [stake, setStake] = useState(1);

  const setPick = (fightId, fighter) => {
    setPicks((prev) =>
      prev.map((p) =>
        p.fightId === fightId
          ? { ...p, pickedFighter: fighter, overridden: fighter !== p.v2DefaultFighter }
          : p
      )
    );
  };

  const canSubmit = combinedOdds.trim().length > 0;

  const handleConfirm = () => {
    if (!canSubmit) return;
    const legs = picks.map((p) => ({
      fightId: p.fightId,
      fighterA: p.fighterA,
      fighterB: p.fighterB,
      eventName: p.eventName,
      eventDate: p.eventDate,
      pickedFighter: p.pickedFighter,
      v2DefaultFighter: p.v2DefaultFighter,
      // v2's probability for the PICKED (post-override) side -- not always
      // v2's own favorite's prob. Well-defined since pA+pB=1 for a two-way
      // fight: the non-favored side's prob is just 1 - the favorite's.
      v2ProbAtBuild: p.overridden ? 1 - p.v2WinProb : p.v2WinProb,
      overridden: p.overridden,
    }));
    onConfirm({
      id: createPredictionId(),
      createdAt: new Date().toISOString(),
      pickSource: 'human',
      eventName: legs[0]?.eventName || '',
      eventDate: legs[0]?.eventDate || '',
      legs,
      combinedOdds: combinedOdds.trim(),
      unitsWagered: stake,
      status: 'PENDING',
      result: null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <h3 className="text-white font-black text-lg mb-4">Build Parlay</h3>

        <div className="space-y-3 mb-4">
          {picks.map((p) => (
            <div key={p.fightId} className="bg-slate-800/40 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-2">{p.fighterA} vs. {p.fighterB}</p>
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                {[p.fighterA, p.fighterB].map((fighter) => (
                  <button
                    key={fighter}
                    onClick={() => setPick(p.fightId, fighter)}
                    className={`flex-1 min-w-0 px-2 py-1.5 rounded-md text-xs font-semibold transition-colors truncate ${
                      p.pickedFighter === fighter
                        ? 'bg-red-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fighter}
                  </button>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-violet-400 bg-violet-900/30 border border-violet-700/40 px-1.5 py-0.5 rounded-sm uppercase">
                  v2
                </span>
                <span>
                  {p.v2DefaultFighter} · {((p.v2WinProb ?? 0) * 100).toFixed(1)}%
                  {p.overridden ? ' · overridden' : ''}
                </span>
              </p>
              {/* v1 disagreement note removed 2026-07-22 per v2-only betting
                  flow -- restore by re-adding:
                  {p.hasV1 && p.v1Winner && p.v1Winner !== p.v2DefaultFighter && (
                    <p className="text-slate-600 text-xs mt-1">v1 favors {p.v1Winner}.</p>
                  )}
                  hasV1/v1Winner stay computed in modelPickByEntryId -- only
                  this rendered note is gone. */}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={PROP_LABEL_CLS}>Combined Odds</label>
            <input
              type="text"
              value={combinedOdds}
              onChange={(e) => setCombinedOdds(e.target.value)}
              placeholder="+615"
              className={PROP_INPUT_CLS}
            />
          </div>
          <div>
            <label className={PROP_LABEL_CLS}>Stake (u)</label>
            <UnitsStakedInput value={stake} onCommit={setStake} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              canSubmit ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Confirm Parlay
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function UpcomingEventTab({
  entries,
  onGrade,
  onDelete,
  onUpdateEntry,
  modelToggle,
  setModelToggle,
  allFighters,
  propPicks,
  onAddPropPick,
  onGradePropPick,
  onDeletePropPick,
  onAddParlay,
  parlayEntries,
  roiEntries,
  onDeleteParlay,
}) {
  const fighterMap = useMemo(() => {
    const m = new Map();
    (allFighters ?? []).forEach((f) => m.set(f.FIGHTER, f));
    return m;
  }, [allFighters]);
  const exportedCode = `export const UPCOMING_ENTRIES = ${JSON.stringify(entries, null, 2)};\n`;
  // Same builders ROITab uses for its own Props/Parlays export buttons --
  // one serialization each, reused here for the Upcoming-side access point.
  const propsExportedCode = buildPropsExportedCode(propPicks);
  const parlayExportedCode = buildParlayExportedCode(parlayEntries ?? []);

  // Single-array design (see PROP_PICKS) means "pending" is just a filtered
  // view -- grading a prop (setting result) removes it from this list on the
  // next render with no explicit migration call, mirroring but simplifying
  // the fight lifecycle's Upcoming->ROI array move.
  const pendingProps = useMemo(() => propPicks.filter((p) => p.result === 'PENDING'), [propPicks]);
  // Only one prop form open at a time: null, a fight entry id, or 'manual'.
  const [propFormFor, setPropFormFor] = useState(null);

  // Three sub-tabs mirroring ROITab's subTab pattern (App.js ROITab's
  // subTab state + tab-button UI is the template): 'fights' (existing cards +
  // Build Parlay), 'props' (PendingPropsSection, relocated -- same component,
  // same picks, just moved under a sub-tab instead of always-visible), and
  // 'parlays' (pending parlays only). A parlay's sub-tab placement is a pure
  // derived-status filter, not a migration -- the SAME parlayEntries array
  // also feeds ROI's Parlays sub-tab, filtered to GRADED there. No entry ever
  // moves; only which sub-tab renders it changes, exactly like props' single
  // PROP_PICKS array filtered by result.
  const [subTab, setSubTab] = useState('fights');
  const pendingParlays = useMemo(
    () => (parlayEntries ?? []).filter((p) => computeParlayResult(p, roiEntries ?? []).status === 'PENDING'),
    [parlayEntries, roiEntries]
  );

  // Per-entry model computation, hoisted out of the card render loop so the
  // Build Parlay modal can read the SAME already-computed values the card
  // shows -- never a second computeMatchupEdges call.
  //
  // FROZEN (2026-07-22 fix): primary path reads the entry's OWN stored
  // v2pA/v2pB/fighterAProb/fighterBProb/betAction/edgeA/edgeB -- the values
  // buildRoiEntry computed and saved at save time -- never recomputed against
  // current fighter data. A saved pick can no longer drift when the pipeline
  // refreshes fighter stats. computeMatchupEdges is called ONLY as a legacy
  // fallback for entries saved before v2pA/v2pB existed (entry.v2pA == null),
  // so old exported upcomingData.js snapshots don't render blank. No
  // hard-coded hit count is recorded here: the earlier "0 of 146" note was
  // already stale, and a number baked into a comment goes wrong silently. The
  // fallback passes the entry's own eventDate, so a recomputed legacy pick
  // uses fight-night ages -- what buildRoiEntry would have frozen at save
  // time. Card-displayed predictedWinner/winProb
  // still follow modelToggle (v1/v2), exactly as before; v2Winner/v2WinProb
  // below are v2's OWN argmax pick (off the same stored/fallback v2pA/v2pB),
  // independent of modelToggle, since a parlay leg's frozen "v2 default"
  // must mean v2 specifically, not whichever model is toggled. v1Winner is
  // v1's own frozen pick (entry.fighterAProb/fighterBProb), read the same way
  // in both branches -- the Build Parlay "v1 favors X" disagreement note
  // depends on this staying populated.
  const modelPickByEntryId = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => {
      const fA = fighterMap.get(entry.fighterA);
      const fB = fighterMap.get(entry.fighterB);
      let pA, pB, hasV2, betAction, betFighter, edgeA, edgeB, v2pAOut, v2pBOut, hasV1, v1pAOut, v1pBOut;
      if (entry.v2pA == null && fA && fB) {
        // Legacy fallback only -- see FROZEN comment above.
        const res = computeMatchupEdges(fA, fB, {
          eventDate: entry.eventDate,
        });
        hasV2 = res.v2pA != null;
        v2pAOut = res.v2pA;
        v2pBOut = res.v2pB;
        hasV1 = true;
        v1pAOut = res.pA;
        v1pBOut = res.pB;
        pA = modelToggle === 'v2' && res.v2pA != null ? res.v2pA : res.pA;
        pB = modelToggle === 'v2' && res.v2pB != null ? res.v2pB : res.pB;
        const m = computeMarketAnalysis({ ...res, pA, pB }, entry.oddsA, entry.oddsB, fA, fB);
        betAction = m?.betAction ?? 'NO BET';
        betFighter = m?.bestBet === 'A' ? entry.fighterA : m?.bestBet === 'B' ? entry.fighterB : null;
        edgeA = m?.edgeA ?? null;
        edgeB = m?.edgeB ?? null;
      } else {
        // Primary: frozen values stored on the entry at save time.
        hasV2 = entry.v2pA != null;
        v2pAOut = entry.v2pA;
        v2pBOut = entry.v2pB;
        hasV1 = entry.fighterAProb != null && entry.fighterBProb != null;
        v1pAOut = entry.fighterAProb;
        v1pBOut = entry.fighterBProb;
        pA = modelToggle === 'v2' && entry.v2pA != null ? entry.v2pA : entry.fighterAProb;
        pB = modelToggle === 'v2' && entry.v2pB != null ? entry.v2pB : entry.fighterBProb;
        betAction = entry.betAction;
        betFighter = entry.betRecommendedFighter || null;
        edgeA = entry.edgeA;
        edgeB = entry.edgeB;
      }
      const predictedWinner = pA >= pB ? entry.fighterA : entry.fighterB;
      const winProb = Math.max(pA, pB);
      const tier = betTier(betAction);
      const pickEdge = pA >= pB ? edgeA : edgeB;
      const fairLine = americanOdds(winProb);
      const actionable = betAction === 'LEAN' || betAction === 'BET' || betAction === 'STRONG BET';
      const effectiveMarketOdds = pA >= pB ? (entry.oddsA || '') : (entry.oddsB || '');
      const v2Winner = hasV2 ? (v2pAOut >= v2pBOut ? entry.fighterA : entry.fighterB) : predictedWinner;
      const v2WinProb = hasV2 ? Math.max(v2pAOut, v2pBOut) : winProb;
      const v1Winner = hasV1 ? (v1pAOut >= v1pBOut ? entry.fighterA : entry.fighterB) : null;
      map.set(entry.id, {
        pA, pB, hasV2, betAction, betFighter, edgeA, edgeB,
        predictedWinner, winProb, tier, pickEdge, fairLine, actionable, effectiveMarketOdds,
        v2Winner, v2WinProb, hasV1, v1Winner,
      });
    });
    return map;
  }, [entries, fighterMap, modelToggle]);

  // Parlay leg selection -- Set of entry ids. Single-event enforcement is
  // derived (not separate state): once any entry is selected, its eventName
  // is the lock, computed fresh from the current selection + entries so it
  // can never go stale.
  const [selectedLegIds, setSelectedLegIds] = useState(() => new Set());
  const [showBuildParlay, setShowBuildParlay] = useState(false);
  const lockedEventName = useMemo(() => {
    if (selectedLegIds.size === 0) return null;
    const firstId = selectedLegIds.values().next().value;
    return entries.find((e) => e.id === firstId)?.eventName ?? null;
  }, [selectedLegIds, entries]);
  const toggleLeg = (entryId) => {
    setSelectedLegIds((prev) => {
      const next = new Set(prev);
      if (next.has(entryId)) next.delete(entryId);
      else next.add(entryId);
      return next;
    });
  };
  const clearLegSelection = () => setSelectedLegIds(new Set());
  const selectedLegInputs = useMemo(
    () =>
      entries
        .filter((e) => selectedLegIds.has(e.id))
        .map((entry) => {
          const mp = modelPickByEntryId.get(entry.id);
          return {
            fightId: entry.id,
            fighterA: entry.fighterA,
            fighterB: entry.fighterB,
            eventName: entry.eventName,
            eventDate: entry.eventDate,
            v2DefaultFighter: mp?.v2Winner,
            v2WinProb: mp?.v2WinProb,
            hasV1: mp?.hasV1,
            v1Winner: mp?.v1Winner,
          };
        }),
    [entries, selectedLegIds, modelPickByEntryId]
  );
  const handleConfirmParlay = (parlay) => {
    onAddParlay(parlay);
    clearLegSelection();
    setShowBuildParlay(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-black text-xl mb-1">Upcoming</h2>
          <p className="text-slate-400 text-sm">
            Save matchups from the Simulator to track pending picks.
          </p>
        </div>
        {subTab === 'fights' && (
          <div className="hidden sm:flex items-center gap-2">
            {/* Ungated on entries.length -- an empty array is still a valid,
                meaningful export (a fully-graded/cleared card), and hiding the
                button once the last entry leaves made a clean upcomingData.js
                impossible to produce. */}
            <button
              onClick={() => navigator.clipboard.writeText(exportedCode)}
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
            >
              Copy Updated upcomingData.js
            </button>
            {/* v1 toggle hidden 2026-07-22 per single-model view (v2 only) --
                restore by re-adding the ['v1','v2'] button block that used to
                sit here (called setModelToggle(v)). modelToggle is App-level
                state (App.js ~9041), still passed down as a prop and still
                useState('v2') by default -- left wired-but-uncalled here
                rather than unwound, so restoring is just re-adding the
                buttons. modelPickByEntryId's pA/pB selection and the "v2"
                badge below are now permanently on the v2 branch. */}
          </div>
        )}
        {subTab === 'props' && (
          <button
            onClick={() => navigator.clipboard.writeText(propsExportedCode)}
            className="hidden sm:inline-block px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
          >
            Copy Updated propPicksData.js
          </button>
        )}
        {subTab === 'parlays' && (
          <button
            onClick={() => navigator.clipboard.writeText(parlayExportedCode)}
            className="hidden sm:inline-block px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
          >
            Copy Updated parlayData.js
          </button>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-1 bg-slate-800 rounded-lg p-1 mb-4 w-fit">
        {[
          { id: 'fights', label: 'Upcoming Fights' },
          { id: 'props', label: 'Props' },
          { id: 'parlays', label: 'Parlays' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              subTab === id
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === 'fights' && selectedLegIds.size > 0 && (
        <div className="hidden sm:flex items-center justify-between bg-slate-900 border border-red-800/60 rounded-xl px-4 py-3 mb-4">
          <p className="text-slate-400 text-sm">
            {selectedLegIds.size} leg{selectedLegIds.size === 1 ? '' : 's'} selected
            {lockedEventName ? ` · ${lockedEventName}` : ''}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={clearLegSelection}
              className="text-slate-500 hover:text-white text-xs font-semibold"
            >
              Clear
            </button>
            {selectedLegIds.size >= 2 && (
              <button
                onClick={() => setShowBuildParlay(true)}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
              >
                Build Parlay
              </button>
            )}
          </div>
        </div>
      )}

      {subTab === 'fights' && (entries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
          <Zap size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No upcoming picks saved.</p>
          <p className="text-xs mt-1">
            Run a matchup in the Simulator and click <span className="text-slate-400 font-semibold">Save to Upcoming</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const mp = modelPickByEntryId.get(entry.id);
            const {
              hasV2, betAction, betFighter, predictedWinner, winProb,
              tier, pickEdge, fairLine, actionable, effectiveMarketOdds,
            } = mp;
            const isSelected = selectedLegIds.has(entry.id);
            const isOtherEvent = lockedEventName != null && entry.eventName !== lockedEventName;

            return (
              <div key={entry.id} className={`bg-slate-900 border ${tier.border} rounded-xl p-5`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isOtherEvent && !isSelected}
                      onChange={() => toggleLeg(entry.id)}
                      title={isOtherEvent && !isSelected ? `Parlay locked to ${lockedEventName}` : 'Select for parlay'}
                      className="hidden sm:block mt-1.5 w-4 h-4 accent-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-black text-lg">
                          {entry.fighterA} vs. {entry.fighterB}
                        </h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-800 text-slate-400 border-slate-700">
                          Pending
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">
                        {entry.division}
                        {entry.eventName ? ` · ${entry.eventName}` : ''}
                        {entry.eventDate ? ` · ${entry.eventDate}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPropFormFor((id) => (id === entry.id ? null : entry.id))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        propFormFor === entry.id
                          ? 'border-red-600 text-red-400'
                          : 'border-slate-700 text-slate-500 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      {propFormFor === entry.id ? 'Cancel Prop' : '+ Prop'}
                    </button>
                    <button
                      onClick={() => {
                        const label = `${entry.fighterA} vs. ${entry.fighterB}`;
                        const meta = [entry.eventName, entry.eventDate].filter(Boolean).join(' · ');
                        if (window.confirm(`Delete this pick?\n\n${label}${meta ? `\n${meta}` : ''}\n\nThis cannot be undone unless you've already run "Copy Updated upcomingData.js".`)) {
                          onDelete(entry.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Model Pick */}
                <div className="bg-slate-800/40 rounded-lg p-4 mb-3 flex items-baseline justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider">
                        Model Pick
                      </p>
                      {hasV2 && modelToggle === 'v2' && (
                        <span className="text-[10px] font-bold text-violet-400 bg-violet-900/30 border border-violet-700/40 px-1.5 py-0.5 rounded-sm uppercase">
                          v2
                        </span>
                      )}
                    </div>
                    <p className="text-white font-black text-xl mt-1">{predictedWinner}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-black text-lg">
                      {(winProb * 100).toFixed(1)}%
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      win prob{fairLine ? ` · ${fairLine}` : ''}
                    </p>
                  </div>
                </div>

                {/* Bet Rec + Market Odds */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Bet Rec</p>
                    {actionable ? (
                      <>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                              betAction === 'STRONG BET'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : betAction === 'BET'
                                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                            }`}
                          >
                            {betAction}
                          </span>
                        </div>
                        <p className="text-white font-bold text-sm mt-3">{betFighter || 'No bet side'}</p>
                      </>
                    ) : (
                      <p className="text-slate-600 font-bold text-sm mt-2">—</p>
                    )}
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Market odds</p>
                    <p className="text-white font-bold text-sm mt-1">
                      {effectiveMarketOdds || '—'}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {pickEdge != null
                        ? `${pickEdge > 0 ? '+' : ''}${(pickEdge * 100).toFixed(1)}% edge`
                        : 'No saved market edge'}
                    </p>
                  </div>
                </div>

                {/* Actual Winner + Units Staked */}
                <div className="hidden sm:flex border-t border-slate-800 pt-3 items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Actual Winner
                    </span>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) onGrade(entry.id, e.target.value);
                      }}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-red-500 cursor-pointer"
                    >
                      <option value="">Pending…</option>
                      <option value={entry.fighterA}>{entry.fighterA}</option>
                      <option value={entry.fighterB}>{entry.fighterB}</option>
                      <option value="NC">NC</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      Units Staked
                    </span>
                    <UnitsStakedInput
                      value={entry.unitsWagered != null ? entry.unitsWagered : 1}
                      onCommit={(n) => onUpdateEntry(entry.id, { unitsWagered: n })}
                    />
                  </div>
                </div>

                {propFormFor === entry.id && (
                  <div className="hidden sm:block border-t border-slate-800 mt-3 pt-3">
                    <PropEntryForm
                      mode="fromFight"
                      fighterA={entry.fighterA}
                      fighterB={entry.fighterB}
                      eventName={entry.eventName}
                      eventDate={entry.eventDate}
                      upcomingId={entry.id}
                      allFighters={allFighters}
                      onAdd={(pick) => { onAddPropPick(pick); setPropFormFor(null); }}
                      onCancel={() => setPropFormFor(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {subTab === 'props' && (
        <PendingPropsSection
          picks={pendingProps}
          onGrade={onGradePropPick}
          onDelete={onDeletePropPick}
          manualOpen={propFormFor === 'manual'}
          onToggleManual={() => setPropFormFor((f) => (f === 'manual' ? null : 'manual'))}
          allFighters={allFighters}
          onAddManual={(pick) => { onAddPropPick(pick); setPropFormFor(null); }}
        />
      )}

      {subTab === 'parlays' && (
        <ParlaysPanel
          parlayEntries={pendingParlays}
          roiEntries={roiEntries ?? []}
          onDelete={onDeleteParlay}
          showSummary={false}
        />
      )}

      {showBuildParlay && (
        <div className="hidden sm:block">
        <BuildParlayPanel
          legInputs={selectedLegInputs}
          onConfirm={handleConfirmParlay}
          onCancel={() => setShowBuildParlay(false)}
        />
        </div>
      )}
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
// Tabs are real <a> elements (NavLink) rather than buttons, so middle-click,
// cmd-click, "copy link address" and screen-reader link semantics all work.
// NavLink also stamps aria-current="page" on the active tab for free.
//
// The active-styling test stays `view === id` rather than NavLink's own
// isActive callback: `view` is already derived from the same pathname by the
// route registry, and reusing it keeps one definition of "active" instead of
// two that could drift.
function Header({ view }) {
  const tabs = [
    { id: 'home', label: 'Home', Icon: Trophy },
    { id: 'simulator', label: 'Simulator', Icon: Swords },
    { id: 'upcoming', label: 'Upcoming', Icon: Zap },
    { id: 'roi', label: 'ROI', Icon: Calendar },
    { id: 'statistics', label: 'Statistics', Icon: BarChart2 },
    { id: 'explore', label: 'Explore', Icon: Search },
    { id: 'info', label: 'Info', Icon: Info },
  ];
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/40">
          <span className="text-white font-black text-xs tracking-tight">
            UFC
          </span>
        </div>
        <div>
          <h1 className="text-white font-black text-base tracking-tight leading-none">
            FightMetrics
          </h1>
          <p className="hidden sm:block text-slate-500 text-xs mt-0.5">
            Fight Prediction Engine · {FIGHTERS.length} fighters · v7
          </p>
        </div>
      </div>
      <nav className="hidden sm:flex gap-1 overflow-x-auto min-w-0">
        {tabs.map(({ id, label, Icon }) => (
          <NavLink
            key={id}
            to={pathForView(id)}
            end
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === id
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

// True below Tailwind's sm breakpoint (640px). Used to gate BottomNav's
// mount entirely -- CSS-only "sm:hidden" would still leave the fixed-
// position bar (and its backdrop/sheet) sitting in the desktop DOM, just
// invisible, which is exactly what App.js:9312's render is trying to avoid.
//
// 639.98px, not 639px: Tailwind's `sm:` prefix (used by the header nav's
// `hidden sm:flex`) is `min-width: 640px`, so this boundary must stay in
// sync with that value. A plain `max-width: 639px` would leave a
// fractional-viewport gap (639.01-639.99px, reachable via browser zoom)
// where sm:flex doesn't apply (hiding the header nav) AND max-width:639
// doesn't match (never mounting the bottom bar) -- no navigation at all.
// Both the initial state and the listener read the same matchMedia query
// so there's no separate boundary computation to drift out of sync.
function useBelowSm() {
  const query = '(max-width: 639.98px)';
  const [belowSm, setBelowSm] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setBelowSm(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return belowSm;
}

// Bottom tab bar, mobile only -- mounted only when useBelowSm() is true (see
// above); the header nav owns navigation above sm, this owns it below sm.
// 5 slots for 7 destinations: the 4 most-used tabs get their own slot, the
// remaining 3 (ROI, Explore, Info) live behind "More", a slide-up sheet.
//
// Destinations are NavLinks (real URLs, since Stage 5). The sheet's open/closed
// state is still plain local useState -- it is presentation, not a destination,
// so it deliberately does NOT go in the URL: a "More sheet open" history entry
// would make Back close a menu instead of going back a page.
const BOTTOM_NAV_PRIMARY = [
  { id: 'home', label: 'Home', Icon: Trophy },
  { id: 'simulator', label: 'Simulator', Icon: Swords },
  { id: 'upcoming', label: 'Card', Icon: Zap },
  { id: 'statistics', label: 'Stats', Icon: BarChart2 },
];
const BOTTOM_NAV_MORE = [
  { id: 'roi', label: 'ROI', Icon: Calendar },
  { id: 'explore', label: 'Explore', Icon: Search },
  { id: 'info', label: 'Info', Icon: Info },
];
function BottomNav({ view }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = BOTTOM_NAV_MORE.some((t) => t.id === view);
  const { pathname } = useLocation();

  // Close on ANY route change, not just on click. Tapping a destination is the
  // common case, but Back/Forward can also change the route while the sheet is
  // open (open More, tap ROI, press Back) -- keying off pathname covers both
  // with one rule instead of relying on every future call site to remember.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {moreOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMoreOpen(false)}
        />
      )}
      {moreOpen && (
        <div className="sm:hidden fixed inset-x-0 bottom-16 z-50 bg-slate-900 border-t border-x border-slate-800 rounded-t-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">
              More
            </span>
            <button
              onClick={() => setMoreOpen(false)}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          {BOTTOM_NAV_MORE.map(({ id, label, Icon }) => (
            <NavLink
              key={id}
              to={pathForView(id)}
              end
              // The pathname effect above handles every case except one: tapping
              // the destination you are ALREADY on produces no route change, so
              // the sheet would stay open. Closing here as well covers it.
              onClick={() => setMoreOpen(false)}
              className={`w-full flex items-center gap-3 px-4 min-h-[44px] py-3 text-sm font-medium transition-colors ${
                view === id ? 'text-red-400' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      )}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900 border-t border-slate-800 flex pb-[env(safe-area-inset-bottom)]"
        style={{ height: 'calc(64px + env(safe-area-inset-bottom))' }}
      >
        {BOTTOM_NAV_PRIMARY.map(({ id, label, Icon }) => (
          <NavLink
            key={id}
            to={pathForView(id)}
            end
            className={`flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
              view === id ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          className={`flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
            moreOpen || moreActive ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MoreHorizontal size={20} />
          More
        </button>
      </nav>
    </>
  );
}

function Filters({ wc, setWC, minMin, setMinMin, count }) {
  return (
    <div className="bg-slate-900/80 border-b border-slate-800 px-5 py-3">
      <div className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <Filter size={11} /> Division
          </label>
          <select
            value={wc}
            onChange={(e) => setWC(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 min-h-[44px] sm:min-h-0 focus:outline-hidden focus:border-red-500 cursor-pointer min-w-40"
          >
            {WEIGHT_CLASSES.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-48">
          <div className="flex items-center justify-between">
            <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Min Minutes Fought
            </label>
            <span className="text-red-400 text-xs font-mono font-bold">
              {minMin}m
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minMin}
            onChange={(e) => setMinMin(+e.target.value)}
            className="w-full accent-red-500"
          />
          <p className="text-slate-600 text-xs">
            Filter out fighters with very few fight minutes
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Prospects
          </label>
          <div className="text-sm text-slate-300">
            Pre-debut signees always shown
          </div>
          <p className="text-slate-600 text-xs">Flagged <span className="text-amber-400 font-bold">PRE-UFC</span> in tables</p>
        </div>

        <div className="ml-auto flex flex-col items-end justify-end pb-1">
          <span className="text-white font-black text-xl">{count}</span>
          <span className="text-slate-500 text-xs">fighters shown</span>
        </div>
      </div>
    </div>
  );
}

function CredBadge({ cred }) {
  const color =
    cred >= 80
      ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
      : cred >= 60
      ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
      : cred >= 40
      ? 'bg-orange-900/40 text-orange-400 border-orange-800'
      : 'bg-red-900/40 text-red-400 border-red-800';
  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}
    >
      {cred.toFixed(0)}%
    </span>
  );
}

function FormDots({ form }) {
  if (!form || !form.length)
    return <span className="text-slate-600 text-xs">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {form.map((r, i) => (
        <span
          key={i}
          className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-black ${
            r === 'W'
              ? 'bg-emerald-500 text-white'
              : r === 'L'
              ? 'bg-red-500 text-white'
              : 'bg-slate-600 text-slate-300'
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

// ─── DATA TABLE ───────────────────────────────────────────────────────────────
function DataTable({ fighters }) {
  const [sort, setSort] = useState({ col: 'ADJUSTED_RATING', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const PER = 50;

  const ranks = useMemo(() => {
    const r = {};
    TABLE_COLS.forEach(({ key }) => {
      const sorted = [...fighters].sort(
        (a, b) => (b[key] ?? -999) - (a[key] ?? -999)
      );
      const m = {};
      sorted.forEach((f, i) => {
        m[f.FIGHTER] = i + 1;
      });
      r[key] = m;
    });
    return r;
  }, [fighters]);

  const displayed = useMemo(() => {
    let d = fighters;
    if (search.trim()) {
      const q = search.toLowerCase();
      d = d.filter((f) => f.FIGHTER.toLowerCase().includes(q));
    }
    return [...d].sort((a, b) =>
      sort.dir === 'desc'
        ? (b[sort.col] ?? -999) - (a[sort.col] ?? -999)
        : (a[sort.col] ?? -999) - (b[sort.col] ?? -999)
    );
  }, [fighters, search, sort]);

  const totalPages = Math.max(1, Math.ceil(displayed.length / PER));
  const safePage = Math.min(page, totalPages);
  const pageData = displayed.slice((safePage - 1) * PER, safePage * PER);
  const handleSort = (col) => {
    setSort((s) =>
      s.col === col
        ? { col, dir: s.dir === 'desc' ? 'asc' : 'desc' }
        : { col, dir: 'desc' }
    );
    setPage(1);
  };
  const SortIcon = ({ col }) =>
    sort.col !== col ? (
      <ChevronUp size={11} className="text-slate-700" />
    ) : sort.dir === 'desc' ? (
      <ChevronDown size={11} className="text-red-400" />
    ) : (
      <ChevronUp size={11} className="text-red-400" />
    );

  const [showKey, setShowKey] = useState(false);
  const COL_KEY = [
    {
      short: 'RTG',
      name: 'Master Rating',
      color: 'text-red-400',
      desc: 'The primary ranking stat. Base efficiency adjusted for opponent quality (wins vs elite boost it, losses to unranked tank it) and scaled by experience. Replaces raw EFF.',
    },
    {
      short: 'CRED%',
      name: 'Credibility %',
      color: 'text-yellow-400',
      desc: 'How much to trust the EFF. Low fight count = lower credibility = EFF pulled toward division average.',
    },
    {
      short: 'NSM',
      name: 'Net Strike Margin',
      color: 'text-orange-400',
      desc: 'Significant strikes landed minus absorbed per minute. Positive = outstrikes opponents. The #1 win predictor.',
    },
    {
      short: 'STR%',
      name: 'Strike Accuracy %',
      color: 'text-yellow-300',
      desc: 'Percentage of significant strike attempts that land. Higher accuracy = more efficient offense.',
    },
    {
      short: 'TDE',
      name: 'Takedown Efficiency',
      color: 'text-blue-400',
      desc: 'Takedowns landed per 15 minutes, weighted by accuracy. Measures offensive wrestling output.',
    },
    {
      short: 'TD%',
      name: 'Takedown Defense %',
      color: 'text-cyan-400',
      desc: 'Percentage of opponent takedown attempts successfully defended. More predictive than TDE.',
    },
    {
      short: 'FIN%',
      name: 'Finish Rate %',
      color: 'text-pink-400',
      desc: 'Percentage of wins that ended by KO/TKO or submission. High = fight-ending power.',
    },
    {
      short: 'CRDY',
      name: 'Cardio Index',
      color: 'text-emerald-400',
      desc: 'Output in rounds 3–5 divided by rounds 1–2. Above 1.0 = gets stronger late. Below = fades.',
    },
    {
      short: 'OQI',
      name: 'Opponent Quality Index',
      color: 'text-slate-300',
      desc: 'Average strength of opposition faced. Higher = fought tougher competition.',
    },
    {
      short: 'DMG',
      name: 'Damage Factor',
      color: 'text-red-300',
      desc: 'Composite of strikes landed, knockdowns, and finish rate. Overall damage-dealing ability.',
    },
    {
      short: 'POS',
      name: 'Position Factor',
      color: 'text-indigo-400',
      desc: 'Ground control time plus submission attempts per 15 min. Grappling dominance score.',
    },
    {
      short: 'FIN',
      name: 'Finish Factor',
      color: 'text-orange-300',
      desc: 'Composite finish ability combining KO%, sub%, and knockdown rate into one number.',
    },
    {
      short: 'CRD',
      name: 'Credibility Score (raw)',
      color: 'text-slate-400',
      desc: 'Raw sample size score before being converted to a percentage. Higher = more fights logged.',
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
        <div className="flex items-start gap-3">
          <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-slate-400 text-xs leading-relaxed">
              <span className="text-white font-semibold">
                Bayesian Credibility Model
              </span>{' '}
              — EFF is shrunk toward the division mean based on sample size.{' '}
              <span className="text-yellow-400 font-semibold">CRED%</span> = how
              much to trust the rating.{' '}
              <span className="text-emerald-400 font-semibold">CRDY</span> =
              late-round output ratio. Click any column header to sort.{' '}
              <span className="text-orange-400">Age 35+</span> = age decay risk.
            </p>
          </div>
          <button
            onClick={() => setShowKey((k) => !k)}
            className={`inline-flex items-center justify-center min-h-[44px] sm:min-h-0 shrink-0 text-xs px-3 py-1 rounded-lg border font-semibold transition-all ${
              showKey
                ? 'bg-red-600 border-red-700 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {showKey ? 'Hide Key' : '📖 Column Key'}
          </button>
        </div>
        {showKey && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-x-8 gap-y-3">
            {COL_KEY.map(({ short, name, color, desc }) => (
              <div key={short} className="flex gap-3 items-start">
                <span
                  className={`font-black text-xs font-mono w-12 shrink-0 mt-0.5 ${color}`}
                >
                  {short}
                </span>
                <div>
                  <p className="text-white text-xs font-semibold">{name}</p>
                  <p className="text-slate-500 text-xs leading-relaxed mt-0.5">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-2.5 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search fighter…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-64 min-h-[44px] sm:min-h-0 focus:outline-hidden focus:border-red-500"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span>
            <span className="text-slate-200 font-mono">{displayed.length}</span>{' '}
            results
          </span>
          <div className="flex gap-1">
            {[
              ['«', 1],
              ['‹', safePage - 1],
              ['›', safePage + 1],
              ['»', totalPages],
            ].map(([lbl, tgt], i) => (
              <button
                key={i}
                onClick={() => setPage(Math.max(1, Math.min(totalPages, tgt)))}
                disabled={
                  ((lbl === '«' || lbl === '‹') && safePage === 1) ||
                  ((lbl === '›' || lbl === '»') && safePage === totalPages)
                }
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 px-2.5 py-1 bg-slate-800 rounded-sm disabled:opacity-30 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {lbl}
              </button>
            ))}
            <span className="px-2 py-1 text-slate-500">
              {safePage}/{totalPages}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: '64vh' }}>
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-800">
              <tr className="border-b border-slate-700">
                <th colSpan={5} className="px-3 py-1" />
                {(() => {
                  const groups = [];
                  TABLE_COLS.forEach(({ group }) => {
                    if (
                      groups.length &&
                      groups[groups.length - 1].label === group
                    ) {
                      groups[groups.length - 1].span++;
                    } else {
                      groups.push({ label: group, span: 1 });
                    }
                  });
                  return groups.map(({ label, span }) => (
                    <th
                      key={label}
                      colSpan={span}
                      className="px-3 py-1 text-center text-slate-500 text-xs font-semibold uppercase tracking-wider border-l border-slate-700"
                    >
                      {label}
                    </th>
                  ));
                })()}
              </tr>
              <tr>
                <th className="text-left px-3 py-3 text-slate-300 font-semibold sticky left-0 bg-slate-800 min-w-44">
                  Fighter
                </th>
                <th className="px-2 py-2 text-slate-500">DIV</th>
                <th className="px-2 py-2 text-slate-500">REC</th>
                <th className="px-2 py-2 text-slate-500">AGE</th>
                <th className="px-3 py-2 text-slate-500 whitespace-nowrap">
                  FORM
                </th>
                {TABLE_COLS.map(({ key, short, tip, group }, i) => {
                  const isGroupStart =
                    i === 0 || TABLE_COLS[i - 1].group !== group;
                  return (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      title={tip}
                      className={`px-3 py-2 text-right cursor-pointer hover:text-red-400 transition-colors select-none font-medium whitespace-nowrap ${
                        sort.col === key ? 'text-red-400' : 'text-slate-400'
                      } ${isGroupStart ? 'border-l border-slate-700' : ''}`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono text-xs">{short}</span>
                        <SortIcon col={key} />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageData.map((f) => {
                const form = recentForm(f.FIGHT_HISTORY);
                return (
                  <tr
                    key={f.FIGHTER}
                    className="border-t border-slate-800/40 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-semibold text-slate-100 sticky left-0 bg-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 font-mono text-xs w-5 shrink-0">
                          {ranks['ADJUSTED_RATING'][f.FIGHTER]}
                        </span>
                        {f.UFC_RANK && (
                          <span
                            className={`text-xs font-black font-mono px-1.5 py-0.5 rounded border ${
                              isChampionRecord(f.UFC_RANK)
                                ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {ufcRankLabel(f.UFC_RANK)}
                          </span>
                        )}
                        {f.IS_PROSPECT && (
                          <span
                            className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded-sm border bg-amber-900/40 text-amber-400 border-amber-800"
                            title="Pre-debut UFC signee — stats from pre-UFC pro fights"
                          >
                            PRE-UFC
                          </span>
                        )}
                        {f.FIGHTER}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-slate-500 text-center text-xs whitespace-nowrap">
                      {DIV_SHORT[f.WEIGHT_CLASS] || f.WEIGHT_CLASS}
                    </td>
                    <td className="px-2 py-2.5 text-slate-500 font-mono text-xs">
                      {f.RECORD}
                    </td>
                    <td
                      className={`px-2 py-2.5 font-mono text-xs text-center ${
                        f.AGE && f.AGE >= 35 && f.IS_LIGHT
                          ? 'text-orange-400'
                          : f.AGE >= 35
                          ? 'text-yellow-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {f.AGE || '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <FormDots form={form} />
                    </td>
                    {TABLE_COLS.map(({ key, signed, dec }) => {
                      const rank = ranks[key][f.FIGHTER];
                      const val = f[key];
                      const isPct = [
                        'SIG_STR_ACC',
                        'TD_ACC',
                        'FINISH_RATE',
                        'WIN_PCT',
                        'CONTROL_TIME_PCT',
                        'CREDIBILITY',
                      ].includes(key);
                      const display =
                        val != null
                          ? `${fmt(val, dec, signed)}${isPct ? '%' : ''}`
                          : key === 'CARDIO_DECAY'
                          ? '—'
                          : '—';
                      const extra =
                        key === 'CREDIBILITY'
                          ? credColor(val)
                          : key === 'CARDIO_DECAY'
                          ? decayColor(val)
                          : '';
                      return (
                        <td
                          key={key}
                          className={`px-3 py-2.5 text-right font-mono ${rankColor(
                            rank,
                            fighters.length
                          )} ${extra}`}
                        >
                          {display}{' '}
                          <span className="text-slate-600 font-normal">
                            ({rank})
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-slate-600 px-1 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Top 5%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
          Middle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          Bottom 30%
        </span>
        <span className="text-orange-400 flex items-center gap-1">
          35+ = age decay risk
        </span>
        <span className="ml-auto">
          Click headers to sort · format: value (rank)
        </span>
      </div>
    </div>
  );
}

// ─── FIGHTER SEARCH ───────────────────────────────────────────────────────────
function FighterSearch({
  allFighters,
  value,
  onChange,
  placeholder,
  accent = 'red',
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const opts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allFighters
      .filter((f) => f.FIGHTER.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, allFighters]);
  const bdr =
    accent === 'blue'
      ? 'border-blue-700 focus:border-blue-400'
      : 'border-slate-700 focus:border-red-500';
  return (
    <div className="relative">
      <Search
        size={13}
        className="absolute left-3 top-2.5 text-slate-500 z-10"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value ? value.FIGHTER : search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={`bg-slate-800 border ${bdr} text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-full min-h-[44px] sm:min-h-0 focus:outline-hidden transition-colors`}
      />
      {open && opts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl z-30 shadow-2xl overflow-hidden">
          {opts.map((f) => (
            <button
              key={f.FIGHTER}
              onClick={() => {
                onChange(f);
                setSearch('');
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-700 text-sm flex justify-between items-center transition-colors gap-3"
            >
              <span className="text-slate-200 font-medium flex items-center gap-2">
                {f.IS_PROSPECT && (
                  <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded-sm border bg-amber-900/40 text-amber-400 border-amber-800">
                    PRE-UFC
                  </span>
                )}
                {f.FIGHTER}
              </span>
              <span className="text-slate-500 text-xs flex items-center gap-2">
                <span>{DIV_SHORT[f.WEIGHT_CLASS]}</span>
                <span className="text-red-400 font-bold">
                  {(f.ADJUSTED_RATING ?? 0).toFixed(1)}
                </span>
                <span>{f.RECORD}</span>
                {f.AGE && (
                  <span
                    className={
                      f.AGE >= 35 && f.IS_LIGHT ? 'text-orange-400' : ''
                    }
                  >
                    {f.AGE}y
                  </span>
                )}
                <FormDots form={recentForm(f.FIGHT_HISTORY)} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FIGHT HISTORY CARD ───────────────────────────────────────────────────────
function FightCard({ fight, index }) {
  const cardBg =
    fight.re === 'W'
      ? 'bg-emerald-950/20 border-emerald-900/40'
      : fight.re === 'L'
      ? 'bg-red-950/20 border-red-900/40'
      : 'bg-slate-800/30 border-slate-700/40';
  const badgeBg =
    fight.re === 'W'
      ? 'bg-emerald-500'
      : fight.re === 'L'
      ? 'bg-red-500'
      : 'bg-slate-500';

  return (
    <div className={`border rounded-xl p-4 ${cardBg}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${badgeBg}`}
          >
            {fight.re}
          </span>
          <div className="min-w-0">
            <p className="text-slate-100 font-bold text-sm truncate">
              vs. {fight.op}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {fight.dt} · {fight.wc}
              {fight.tb ? ' · Title Bout' : ''}
            </p>
            <p className="text-slate-400 text-xs mt-1">{fight.ev}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-xs font-bold ${methodColor(fight.me || '')}`}>
            {fight.me || 'Result'}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            {fight.rn ? `R${fight.rn}` : '—'}
            {fight.ti ? ` · ${fight.ti}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

// Authoritative domain mapping for the Simulator's unified contribution
// panel. Maps each of the 6 scoring domains to its v1 inputs (referenced by
// the exact {group, label} pairs used in computeMatchupEdges' auditRows,
// App.js:3617-3841) and its v2 inputs (MODEL_V2.features keys). Every one
// of MODEL_V2's 16 features appears in exactly one domain below --
// Striking 2, Grappling 3, Physical 3, Form 3, Experience 4, Analytics 1 =
// 16, verified by summing the v2 arrays.
//
// v1-only features with no v2 analog at all (not zeroed -- absent as a
// feature key): atd_dif (Grappling, "TD Defense %"), layoff_dif and
// cardio_dif (Analytics, "Days Since Last Fight" / "Cardio Ratio" --
// layoff information resurfaces inside v2's modern_form instead, App.js
// computeModernForm).
//
// Global is v1-only in full: agePenAdj, the SOS term, and the Quality
// Momentum term feed v1's composite directly (App.js:3850-3860) but belong
// to none of the 6 domains and have no auditRow at all -- referenced here
// by the result-object field names Step 1 added, not by {group, label}.
// v2 has no equivalent for any of the three; the Global group is genuinely
// empty under v2, not merely small.
const SIMULATOR_DOMAIN_MAP = {
  striking: {
    label: 'Striking',
    icon: '⚔️',
    v1: [
      { group: 'Striking', label: 'Sig Strikes Landed / Min' },
      { group: 'Striking', label: 'Strike Accuracy' },
    ],
    v2: ['sig_str_landed', 'sig_str_accuracy'],
  },
  grappling: {
    label: 'Grappling',
    icon: '🤼',
    v1: [
      { group: 'Grappling', label: 'Takedowns / 15 Min' },
      { group: 'Grappling', label: 'Takedown Accuracy' },
      { group: 'Grappling', label: 'Sub Attempts / 15 Min' },
      { group: 'Grappling', label: 'TD Defense %' },
    ],
    v2: ['td_landed', 'td_accuracy', 'sub_attempts'],
  },
  physical: {
    label: 'Physical',
    icon: '📏',
    v1: [
      { group: 'Physical', label: 'Reach' },
      { group: 'Physical', label: 'Height' },
      { group: 'Physical', label: 'Age' },
    ],
    v2: ['reach', 'height', 'younger'],
  },
  form: {
    label: 'Form',
    icon: '📈',
    v1: [
      { group: 'Form', label: 'Win Streak' },
      { group: 'Form', label: 'Loss Streak' },
      { group: 'Form', label: 'UFC Wins' },
      { group: 'Form', label: 'UFC Losses' },
    ],
    v2: ['modern_form', 'wins', 'losses'],
  },
  experience: {
    label: 'Experience',
    icon: '🎖️',
    // "Finishing" is the auditRows' own group tag for these two (App.js:
    // 3786-3807) but their weight (ko_dif/sub_dif) feeds expScore, i.e. the
    // Experience domain -- not a separate domain of its own.
    v1: [
      { group: 'Experience', label: 'UFC Fight Count' },
      { group: 'Experience', label: 'Fights Reaching R3+' },
      { group: 'Finishing', label: 'KO Wins' },
      { group: 'Finishing', label: 'Submission Wins' },
    ],
    v2: ['rounds', 'title_bouts', 'ko_wins', 'sub_wins'],
  },
  analytics: {
    label: 'Analytics',
    icon: '📊',
    v1: [
      { group: 'Analytics', label: 'ELO' },
      { group: 'Analytics', label: 'Days Since Last Fight' },
      { group: 'Analytics', label: 'Cardio Ratio' },
    ],
    v2: ['elo'],
  },
};

// Human-readable readings for the 16 raw MODEL_V2.features identifiers
// (the exact set referenced by SIMULATOR_DOMAIN_MAP's v2 arrays above).
// v1's per-feature labels never need this -- they already come out of
// auditRows as plain language (e.g. "Sig Strikes Landed / Min"). v2's
// come out of result.v2Contributions keyed by the raw feature name, which
// buildSimulatorDomainRows used to surface verbatim.
const V2_FEATURE_LABELS = {
  sig_str_landed: 'Significant strikes landed per minute',
  sig_str_accuracy: 'Significant strike accuracy',
  td_landed: 'Takedowns landed per 15 min',
  td_accuracy: 'Takedown accuracy',
  sub_attempts: 'Submission attempts per 15 min',
  reach: 'Reach',
  height: 'Height',
  younger: 'Age (younger-fighter advantage)',
  modern_form: 'Recent form (last 8 fights, weighted)',
  wins: 'Total wins',
  losses: 'Total losses',
  rounds: 'Total rounds fought',
  title_bouts: 'Title-fight experience',
  ko_wins: 'KO/TKO wins',
  sub_wins: 'Submission wins',
  elo: 'ELO rating',
};

// Not part of the 6-domain loop above -- rendered as its own, always-last
// group. resultFields reference the Step-1-added scalar fields on
// computeMatchupEdges' return object, not auditRows.
const SIMULATOR_GLOBAL_GROUP = {
  label: 'Global',
  icon: '🌐',
  v1ResultFields: [
    { field: 'agePenAdj', label: 'Age-Decay Adjustment' },
    { field: 'sosContribution', label: 'Strength of Schedule' },
    { field: 'qualMomContribution', label: 'Quality Momentum' },
  ],
  v2: [],
};

// Anchors for the contribution panel's bar fill (simulatorBarPct below).
// Each is the 99th percentile of |contribution|, pooled across all 6
// domains (not per-domain -- pooling preserves the fact that some domains
// carry structurally more weight than others), over every same-division
// real fighter pair with both fighters at CREDIBILITY >= 50. v1's
// contribution is edge.weighted; v2's is a domain's summed per-feature
// logit contribution (SIMULATOR_DOMAIN_MAP).
//
// DISPLAY SCALING ONLY. Neither value enters a probability, edge, EV, Kelly
// figure or saved entry -- a stale anchor makes bars over- or under-fill and
// nothing else.
//
// V2 re-measured 2026-08-12 for the DOB-derived age change. Moving ages off
// the stale scrape-time integers widens real age differentials across the
// roster, which lifts the physical domain's contribution tail: measured on one
// roster both ways, the pooled p99 is 0.6663193144595225 with stored ages and
// 0.8031716417910447 with DOB ages (+20.5%). Left unchanged, every v2 physical
// bar in that band would have pinned at 95% fill.
//
// V1 is deliberately NOT touched. Measured both ways on that same roster its
// anchor is bit-identical (0.0000% attributable to this change) -- v1's age
// term is too small relative to the pooled p99 to move it. The ~0.6% gap
// between the constant below and a fresh v1 measurement is ordinary roster
// drift that predates this change, so correcting it belongs to a data-refresh
// commit, not this one.
//
// Regenerate with: node scripts/regen_simulator_bar_anchors.mjs
// If the printed values drift from these constants, paste the new ones in.
const V1_BAR_ANCHOR = 0.05926015365523809;
const V2_BAR_ANCHOR = 0.8031716417910447;

// One bar-fill formula, used for every domain, both models. `value` is
// signed (positive favors fighter A); magnitude is scaled against the
// model's own anchor and clamped to [5, 95] so no domain can ever render
// fully saturated or fully empty. Deliberately NOT anchored to per-domain
// max/p99 -- see V1_BAR_ANCHOR/V2_BAR_ANCHOR comment above.
const simulatorBarPct = (value, anchor) => {
  const frac = anchor > 0 ? Math.min(1, Math.abs(value) / anchor) : 0;
  return 50 + Math.sign(value) * frac * 45;
};

const TAPE = [
  { key: 'ADJUSTED_RATING', label: 'Master Rating', hb: true, dec: 1 },
  {
    key: 'CREDIBILITY',
    label: 'Sample Confidence',
    hb: true,
    dec: 1,
    pct: true,
  },
  {
    key: 'NET_STRIKE_MARGIN',
    label: 'Net Strike Margin',
    hb: true,
    dec: 2,
    signed: true,
  },
  {
    key: 'SIG_STR_ACC',
    label: 'Strike Accuracy %',
    hb: true,
    dec: 1,
    pct: true,
  },
  { key: 'TDE', label: 'Takedowns / 15 min', hb: true, dec: 2 },
  {
    key: 'TD_ACC',
    label: 'Takedown Accuracy %',
    hb: true,
    dec: 1,
    pct: true,
  },
  {
    key: 'ATD_PCT',
    label: 'TD Defense %',
    hb: true,
    dec: 1,
    pct: true,
  },
  {
    key: 'CONTROL_TIME_PCT',
    label: 'Control Time %',
    hb: true,
    dec: 1,
    pct: true,
  },
  { key: 'FINISH_RATE', label: 'Finish Rate %', hb: true, dec: 1, pct: true },
  { key: 'KD_PER_MIN', label: 'KO Wins / min', hb: true, dec: 4 },
  { key: 'CARDIO_DECAY', label: 'Cardio (R3/R1)', hb: true, dec: 2 },
  { key: 'OQI', label: 'Opp. Quality Index', hb: true, dec: 2 },
  { key: 'FACTOR_DAMAGE', label: 'Damage Factor', hb: true, dec: 1 },
  { key: 'FACTOR_POSITION', label: 'Position Factor', hb: true, dec: 1 },
  { key: 'FACTOR_FINISH', label: 'Finish Factor', hb: true, dec: 1 },
];

const fmtT = (f, { key, dec, signed, pct }) => {
  const v = f[key];
  if (v == null) return '—';
  const s = Math.abs(v).toFixed(dec) + (pct ? '%' : '');
  return signed ? (v >= 0 ? `+${s}` : `-${s}`) : s;
};

// Hoisted to module scope so its identity is stable across MatchupSimulator
// renders — defining it inline remounted the subtree (and reset FighterSearch
// state) on every keystroke in the odds/event inputs.
const FighterPanel = ({ f, setF, color, ph, allFighters, fA, fB, eventDate }) => {
  const [showFull, setShowFull] = useState(false);
  const tc = color === 'blue' ? 'text-blue-400' : 'text-red-400';
  const bc =
    color === 'blue'
      ? 'border-blue-800 bg-blue-950/20'
      : 'border-red-800 bg-red-950/20';
  // Bout-date age, so the displayed age and the decay penalty shown on this
  // card are the same ones the model used for the probability alongside it. A
  // fighter who turns 35 between today and the event must not read as
  // penalty-free here while the model is already penalising him.
  const panelAge = simulatorAge(f, eventDate);
  const pen = f ? ageDecayPenalty(f, panelAge) : 0;
  const adjTE = f ? f.TOTAL_EFFICIENCY * (1 - pen) : null;
  const form = f ? recentForm(f.FIGHT_HISTORY) : [];
  return (
    <div>
      <FighterSearch
        allFighters={allFighters}
        value={f}
        onChange={setF}
        placeholder={ph}
        accent={color}
      />
      {f && (
        <div className={`mt-2 border ${bc} rounded-xl p-4`}>
          {/* Compact summary: always visible, replaces the old header tier
              (weight class / Fighter A-B label / record) below -- that tier
              is dropped from the full-profile disclosure since it would be
              a word-for-word repeat of this block once expanded. */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-xs font-bold ${tc}`}>
                {color === 'blue' ? 'Fighter A' : 'Fighter B'}
              </p>
              <p className="text-white font-black text-base leading-snug">
                {f.FIGHTER}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {f.WEIGHT_CLASS} · {f.RECORD}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFull((o) => !o)}
              aria-expanded={showFull}
              aria-label={`${showFull ? 'Hide' : 'Show'} full profile for ${f.FIGHTER}`}
              className="shrink-0 text-slate-500 hover:text-slate-300 text-xs font-semibold"
            >
              {showFull ? 'Full Profile ▲' : 'Full Profile ▾'}
            </button>
          </div>
          {/* Primary stats: RTG, Reach, Age -- always visible alongside the
              header so a collapsed card still previews the profile. The
              divider sits on top only, so nothing dangles below when the
              full-profile disclosure is closed. */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/50">
            {[
              ['RTG', f.ADJUSTED_RATING.toFixed(1)],
              ['Reach', fmtReach(f.REACH_IN)],
              [
                'Age',
                Number.isFinite(panelAge)
                  ? (panelAge >= 35 ? `${panelAge} ⚠️` : String(panelAge))
                  : '—',
              ],
            ].map(([k, v]) => (
              <div key={k} className="text-center">
                <p className="text-slate-500 text-xs">{k}</p>
                <p className={`font-black text-base mt-0.5 ${tc}`}>{v}</p>
              </div>
            ))}
          </div>
          {showFull && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
          {/* Secondary stats: Rank, Height, Stance */}
          <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-slate-700/50">
            {[
              ['Rank', ufcRankLabel(f.UFC_RANK) ?? 'NR'],
              ['Height', fmtHeight(f.HEIGHT_IN)],
              ['Stance', f.STANCE || '—'],
            ].map(([k, v]) => (
              <div key={k} className="text-center">
                <p className="text-slate-500 text-xs">{k}</p>
                <p className="text-slate-300 font-semibold text-xs mt-0.5 truncate">{v}</p>
              </div>
            ))}
          </div>
          {/* Tertiary: dot-separated inline analytics */}
          <p className="text-xs mb-3">
            <span className="text-slate-500">Base </span>
            <span className={`font-semibold ${tc}`}>{(f.TOTAL_EFFICIENCY ?? 0).toFixed(1)}</span>
            <span className="text-slate-600"> · </span>
            <span className="text-slate-500">Qual </span>
            <span className={`font-semibold ${tc}`}>
              {(f.QUALITY_ADJUSTMENT ?? 0) >= 0 ? '+' : ''}
              {(f.QUALITY_ADJUSTMENT ?? 0).toFixed(1)}
            </span>
            <span className="text-slate-600"> · </span>
            <span className="text-slate-500">Adj RTG </span>
            <span className={`font-semibold ${tc}`}>
              {pen > 0
                ? `${(adjTE ?? 0).toFixed(1)} (-${(pen * 100).toFixed(0)}%)`
                : (adjTE ?? 0).toFixed(1)}
            </span>
            <span className="text-slate-600"> · </span>
            <span className="text-slate-500">Cred </span>
            <span className={`font-semibold ${tc}`}>{(f.CREDIBILITY ?? 0).toFixed(0)}%</span>
          </p>
          {form.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-slate-600 text-xs">Form</span>
              {form.map((r, i) => (
                <span
                  key={i}
                  className={`text-xs font-black px-1.5 py-0.5 rounded ${
                    r === 'W'
                      ? 'bg-emerald-900/50 text-emerald-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          )}
          {f.FIGHT_HISTORY?.length > 0 && (
            <div className="mb-3">
              <p className="text-slate-600 text-[10px] uppercase tracking-wider mb-1.5">Recent</p>
              {f.FIGHT_HISTORY.slice(0, 5).map((fight, i) => (
                <div key={i} className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[10px] font-black px-1 py-0.5 rounded leading-none shrink-0 ${
                      fight.re === 'W'
                        ? 'bg-emerald-900/50 text-emerald-400'
                        : fight.re === 'L'
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {fight.re}
                  </span>
                  <span className="text-xs text-slate-300 font-medium truncate">{fight.op}</span>
                  {fight.me && (
                    <span className="text-[10px] text-slate-500 shrink-0">{fight.me}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            {TAPE.slice(0, 7).map((stat) => {
              const va = fA ? fA[stat.key] : null;
              const vb = fB ? fB[stat.key] : null;
              const v = f[stat.key];
              const isBetter =
                stat.hb &&
                va != null &&
                vb != null &&
                (color === 'blue' ? va > vb : vb > va);
              return (
                <div
                  key={stat.key}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-slate-600 text-xs truncate">
                    {stat.label}
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold shrink-0 ${
                      isBetter ? tc : 'text-slate-400'
                    }`}
                  >
                    {fmtT(f, stat)}
                  </span>
                </div>
              );
            })}
          </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

// Display-only decode of v2's modern_form (App.js:369-388) into plain
// language -- last-8 W-L record plus the two penalty flags, sorted most
// recent first exactly as computeModernForm does. Does not compute or
// alter modern_form's actual score; reads the same FIGHT_HISTORY/
// DAYS_SINCE_LAST inputs purely to describe it.
const describeModernForm = (fighter) => {
  const fh = fighter?.FIGHT_HISTORY || [];
  const sorted = [...fh].sort((a, b) => (a.dt < b.dt ? 1 : -1));
  const last8 = sorted.slice(0, 8);
  let w = 0, l = 0;
  last8.forEach((f) => {
    if (f.re === 'W') w++;
    else if (f.re === 'L') l++;
  });
  const mostRecent = sorted[0];
  const finishLoss =
    mostRecent &&
    mostRecent.re === 'L' &&
    (isKoMethod(mostRecent.me || '') || isSubMethod(mostRecent.me || ''));
  const layoff = (fighter?.DAYS_SINCE_LAST ?? 180) > 420;
  const qualifiers = [];
  if (finishLoss) qualifiers.push('last loss by finish');
  if (layoff) qualifiers.push('>420d layoff');
  return `${w}-${l} last 8${qualifiers.length ? ' · ' + qualifiers.join(', ') : ''}`;
};

// Headline stat(s) per domain, per displayed model -- must be a real driver
// of that domain's score in the model being shown (see SIMULATOR_DOMAIN_MAP
// comment for which raw inputs actually feed which model). Order matters:
// the larger-weighted stat is listed first.
const getSimulatorHeadlineStats = (domainKey, modelToggle, fA, fB, eventDate) => {
  const v2 = modelToggle === 'v2';
  // Same bout-date ages the model scored with. Formatting for a KNOWN age is
  // unchanged (one decimal, as captured); only the unknown case moves, from a
  // fabricated "0.0" to an explicit em dash.
  const ageA = fmtAge(simulatorAge(fA, eventDate), 1);
  const ageB = fmtAge(simulatorAge(fB, eventDate), 1);
  switch (domainKey) {
    case 'striking':
      return v2
        ? [
            { label: 'Sig Str Landed/min', a: (fA.ASL ?? 0).toFixed(2), b: (fB.ASL ?? 0).toFixed(2) },
            { label: 'Strike Acc %', a: `${((fA.ASP ?? 0) * 100).toFixed(1)}%`, b: `${((fB.ASP ?? 0) * 100).toFixed(1)}%` },
          ]
        : [
            { label: 'Strike Acc %', a: `${((fA.ASP ?? 0) * 100).toFixed(1)}%`, b: `${((fB.ASP ?? 0) * 100).toFixed(1)}%` },
            { label: 'Sig Str Landed/min', a: (fA.ASL ?? 0).toFixed(2), b: (fB.ASL ?? 0).toFixed(2) },
          ];
    case 'grappling':
      return v2
        ? [
            { label: 'TD Landed/15m', a: (fA.ATL ?? 0).toFixed(2), b: (fB.ATL ?? 0).toFixed(2) },
            { label: 'Sub Att/15m', a: (fA.ASA ?? 0).toFixed(2), b: (fB.ASA ?? 0).toFixed(2) },
          ]
        : [
            { label: 'TD Acc %', a: `${((fA.ATP ?? 0) * 100).toFixed(1)}%`, b: `${((fB.ATP ?? 0) * 100).toFixed(1)}%` },
            { label: 'TD Landed/15m', a: (fA.ATL ?? 0).toFixed(2), b: (fB.ATL ?? 0).toFixed(2) },
          ];
    case 'physical':
      return v2
        ? [{ label: 'Age', a: ageA, b: ageB }]
        : [
            { label: 'Height', a: fmtHeight(fA.HEIGHT_IN), b: fmtHeight(fB.HEIGHT_IN) },
            { label: 'Reach', a: fmtReach(fA.REACH_IN), b: fmtReach(fB.REACH_IN) },
            { label: 'Age', a: ageA, b: ageB },
          ];
    case 'form':
      return v2
        ? [{ label: 'Modern Form', a: describeModernForm(fA), b: describeModernForm(fB) }]
        : [{ label: 'Win Streak', a: `${fA.MODEL_UFC_WIN_STREAK ?? 0}`, b: `${fB.MODEL_UFC_WIN_STREAK ?? 0}` }];
    case 'experience':
      return v2
        ? [{ label: 'Total Rounds', a: `${fA.TOTAL_ROUNDS ?? 0}`, b: `${fB.TOTAL_ROUNDS ?? 0}` }]
        : [{ label: 'UFC Fight Count', a: `${fA.UFC_FIGHT_COUNT ?? 0}`, b: `${fB.UFC_FIGHT_COUNT ?? 0}` }];
    case 'analytics':
      return [{ label: 'ELO', a: `${(fA.ELO ?? 0).toFixed(0)}`, b: `${(fB.ELO ?? 0).toFixed(0)}` }];
    default:
      return [];
  }
};

// Near-empty copy for domains/groups a model assigns little or no weight to
// -- shown, not hidden, per the spec's "show, don't hide" requirement.
const SIMULATOR_NEAR_EMPTY_COPY = {
  experience_v2:
    'v2 assigns almost no weight here — total rounds carries a small signal; UFC fight count, title bouts, KO wins, and submission wins are all excluded.',
  global_v2:
    'v1 adds strength-of-schedule and an extra age-decay term outside these six domains; v2 has no equivalent — nothing to show.',
};

// Builds one row per domain (+ Global) for the currently displayed model.
// v1: sums auditRow.contribution (App.js:3571) for each domain's mapped
// {group,label} pairs, plus the three Global result fields from Step 1.
// v2: sums result.v2Contributions (App.js computeLogisticProb) for each
// domain's mapped MODEL_V2 feature keys; Global is always empty (no v2
// analog for any of its three v1-only terms).
const buildSimulatorDomainRows = (result, modelToggle) => {
  if (!result) return [];
  const auditByKey = new Map();
  (result.auditRows ?? []).forEach((row) => auditByKey.set(`${row.group}::${row.label}`, row));

  const domainRows = Object.entries(SIMULATOR_DOMAIN_MAP).map(([key, domain]) => {
    let features;
    if (modelToggle === 'v1') {
      features = domain.v1
        .map((ref) => {
          const row = auditByKey.get(`${ref.group}::${ref.label}`);
          if (!row) return null;
          const rawA = row.aLabel ? row.aLabel : null;
          const rawB = row.bLabel ? row.bLabel : null;
          return {
            label: row.label,
            aValue: row.aValue,
            bValue: row.bValue,
            aRawLabel: rawA,
            bRawLabel: rawB,
            contribution: row.contribution,
          };
        })
        .filter(Boolean);
    } else {
      features = domain.v2.map((featKey) => ({
        label: V2_FEATURE_LABELS[featKey] ?? featKey,
        contribution: result.v2Contributions?.[featKey] ?? 0,
        featsV2Value: result.featsV2?.[featKey] ?? null,
      }));
    }
    const totalContribution = features.reduce((s, f) => s + (f.contribution ?? 0), 0);
    return { key, label: domain.label, icon: domain.icon, features, totalContribution };
  });

  const globalFeatures =
    modelToggle === 'v1'
      ? SIMULATOR_GLOBAL_GROUP.v1ResultFields.map((ref) => ({
          label: ref.label,
          contribution: result[ref.field] ?? 0,
        }))
      : [];
  const globalTotal = globalFeatures.reduce((s, f) => s + (f.contribution ?? 0), 0);
  domainRows.push({
    key: 'global',
    label: SIMULATOR_GLOBAL_GROUP.label,
    icon: SIMULATOR_GLOBAL_GROUP.icon,
    features: globalFeatures,
    totalContribution: globalTotal,
    isGlobal: true,
  });

  return domainRows;
};

// The unified contribution panel. Replaces Key Advantages, Domain
// Breakdown, and Model Input Comparison (see MatchupSimulator, Step 6):
// one section, branching on modelToggle, showing the reasoning for
// whichever model's probability is actually displayed above it -- fixing
// the disconnect where the old three sections (always v1-derived) argued
// the opposite model's pick from the headline number.
//
// Built and exported standalone so it can be rendered in isolation before
// being wired into MatchupSimulator's render tree.
function SimulatorContributionPanel({ fA, fB, result, modelToggle, eventDate }) {
  const [expanded, setExpanded] = useState(() => new Set());
  // Separate from `expanded`: a domain must already be expanded before its
  // technical toggle is reachable, and collapsing the domain again (see
  // isOpen && hasFeatures below) hides the raw coefficients along with it --
  // no need to also clear technicalOpen on collapse.
  const [technicalOpen, setTechnicalOpen] = useState(() => new Set());
  if (!fA || !fB || !result) return null;

  const rows = buildSimulatorDomainRows(result, modelToggle);
  const anchor = modelToggle === 'v2' ? V2_BAR_ANCHOR : V1_BAR_ANCHOR;

  const toggleExpanded = (key) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleTechnical = (key) => {
    setTechnicalOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
          Contribution Breakdown
        </p>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          {modelToggle === 'v2' ? 'v2 logistic' : 'v1 composite'}
        </span>
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const isOpen = expanded.has(row.key);
          const favA = row.totalContribution > 0;
          const pctA = simulatorBarPct(row.totalContribution, anchor);
          const nearEmptyKey = `${row.key}_${modelToggle}`;
          const nearEmptyCopy = SIMULATOR_NEAR_EMPTY_COPY[nearEmptyKey];
          const headlineStats = row.isGlobal ? [] : getSimulatorHeadlineStats(row.key, modelToggle, fA, fB, eventDate);
          const hasFeatures = row.features.length > 0;
          // Global-under-v2 is the only row that's ever truly inert (0
          // features -- SIMULATOR_GLOBAL_GROUP.v2 is deliberately empty, see
          // its own comment above). Rendering it as a div instead of a
          // button drops the implied clickability (default button cursor)
          // that a no-op onClick left behind, rather than distinguishing it
          // with new visual language for a case that only ever fires once.
          const RowWrapper = hasFeatures ? 'button' : 'div';
          const isTechnicalOpen = technicalOpen.has(row.key);
          return (
            <div key={row.key} className="bg-slate-800/40 rounded-xl overflow-hidden">
              <RowWrapper
                {...(hasFeatures ? { onClick: () => toggleExpanded(row.key) } : {})}
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-sm font-bold text-white">
                    {row.icon} {row.label}
                  </span>
                  {hasFeatures && (
                    <span className="text-slate-500 text-xs shrink-0">
                      {isOpen ? 'Hide ▲' : 'Details ▼'}
                    </span>
                  )}
                </div>
                {nearEmptyCopy ? (
                  <p className="text-slate-500 text-xs leading-snug">{nearEmptyCopy}</p>
                ) : (
                  <>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex mb-2">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${pctA}%` }}
                      />
                      <div className="h-full bg-red-500 flex-1" />
                    </div>
                    {headlineStats.length > 0 && (
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                        {headlineStats.map((stat) => (
                          <p key={stat.label} className="text-slate-500 text-xs">
                            {stat.label}:{' '}
                            <span className={favA ? 'text-blue-400' : 'text-slate-400'}>{stat.a}</span>
                            {' / '}
                            <span className={!favA ? 'text-red-400' : 'text-slate-400'}>{stat.b}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </RowWrapper>
              {isOpen && hasFeatures && (
                <div className="border-t border-slate-700/50 px-4 pb-3 pt-2 space-y-1.5">
                  {row.features.map((f) => {
                    const rawA = f.aRawLabel ? fA[f.aRawLabel] : null;
                    const rawB = f.bRawLabel ? fB[f.bRawLabel] : null;
                    const adjustedDiffersA =
                      typeof rawA === 'number' && typeof f.aValue === 'number' && Math.abs(rawA - f.aValue) > 1e-9;
                    const adjustedDiffersB =
                      typeof rawB === 'number' && typeof f.bValue === 'number' && Math.abs(rawB - f.bValue) > 1e-9;
                    return (
                      <div key={f.label} className="flex items-center justify-between text-xs gap-2">
                        <span className="text-slate-500 flex-1">{f.label}</span>
                        {modelToggle === 'v1' ? (
                          <span className="text-slate-400 font-mono">
                            {typeof f.aValue === 'number' ? f.aValue.toFixed(2) : f.aValue}
                            {adjustedDiffersA && typeof rawA === 'number' && (
                              <span className="text-slate-600"> (raw {rawA.toFixed(2)})</span>
                            )}
                            {' / '}
                            {typeof f.bValue === 'number' ? f.bValue.toFixed(2) : f.bValue}
                            {adjustedDiffersB && typeof rawB === 'number' && (
                              <span className="text-slate-600"> (raw {rawB.toFixed(2)})</span>
                            )}
                          </span>
                        ) : (
                          // v2 features are trained on a single signed A-minus-B
                          // diff (App.js featsV2, e.g. reach: fA.REACH_IN -
                          // fB.REACH_IN) -- there's no separate per-fighter pair
                          // to show the way v1's auditRows carry one. featsV2Value
                          // was already computed by buildSimulatorDomainRows and
                          // left unrendered; this surfaces it as the v2 analog of
                          // v1's raw stat comparison, distinct from the model's
                          // internal contribution coefficient shown below.
                          <span className="text-slate-400 font-mono">
                            {typeof f.featsV2Value === 'number'
                              ? `${f.featsV2Value > 0 ? '+' : ''}${f.featsV2Value.toFixed(2)} (A−B)`
                              : '—'}
                          </span>
                        )}
                        {isTechnicalOpen && (
                          <span
                            className={`font-mono font-bold ${
                              f.contribution > 0
                                ? 'text-blue-400'
                                : f.contribution < 0
                                ? 'text-red-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {f.contribution > 0 ? '+' : ''}
                            {f.contribution.toFixed(4)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={() => toggleTechnical(row.key)}
                    className="text-slate-600 hover:text-slate-400 text-[11px] pt-1 transition-colors"
                  >
                    {isTechnicalOpen ? 'Hide technical details' : 'Show technical details'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchupSimulator({ allFighters, onSaveToUpcoming, onSaveToUpcomingAndOpen }) {
  const [fA, setFA] = useState(null);
  const [fB, setFB] = useState(null);
  const [oddsA, setOddsA] = useState('');
  const [oddsB, setOddsB] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [unitsWagered, setUnitsWagered] = useState('');
  const [saveFeedback, setSaveFeedback] = useState('');
  const [modelToggle, setModelToggle] = useState('v2');

  const result = useMemo(() => {
    if (!fA || !fB) return null;
    // Always use W_NO (pure stats model). Backtesting on 13,870 fights showed
    // that W_OD is worse than W_NO when the market disagrees with the model
    // (52% vs 48% accuracy on flipped picks) — exactly the scenario where you
    // are looking for value. Feeding market odds into the probability also makes
    // value analysis circular (comparing model vs market when model IS the market).
    // eventDate drives DOB-derived ages for both fighters. It is '' until the
    // user picks a date, and an unparseable date falls back to each fighter's
    // load-time (today's) age, so an untouched Simulator behaves as before.
    return computeMatchupEdges(fA, fB, { eventDate });
  }, [fA, fB, eventDate]);

  // Active probabilities for whichever model version is toggled on — shared by
  // the market analysis below and by the display sections further down so the
  // MODEL PICK / VALUE SIGNAL / BET REC boxes never disagree with each other.
  const activePA = modelToggle === 'v2' && result?.v2pA != null ? result.v2pA : result?.pA;
  const activePB = modelToggle === 'v2' && result?.v2pB != null ? result.v2pB : result?.pB;

  const market = useMemo(() => {
    if (!result) return null;
    const activeResult = { ...result, pA: activePA, pB: activePB };
    return computeMarketAnalysis(activeResult, oddsA, oddsB, fA, fB);
  }, [oddsA, oddsB, result, fA, fB, activePA, activePB]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="hidden sm:block mb-6">
        <h2 className="text-white font-black text-xl mb-1">
          Matchup Simulator
        </h2>
        <p className="text-slate-400 text-sm">
          Multi-factor model · moneyline value detection · Kelly sizing
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <FighterPanel
          f={fA}
          setF={setFA}
          color="blue"
          ph="Search Fighter A…"
          allFighters={allFighters}
          fA={fA}
          fB={fB}
          eventDate={eventDate}
        />
        <FighterPanel
          f={fB}
          setF={setFB}
          color="red"
          ph="Search Fighter B…"
          allFighters={allFighters}
          fA={fA}
          fB={fB}
          eventDate={eventDate}
        />
      </div>

      {result && fA && fB ? (
        <div className="space-y-4">
          {/* ── MARKET ODDS INPUT ── */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-white text-xs font-black uppercase tracking-widest mb-1">
              Enter Market Lines
            </p>
            <p className="text-slate-500 text-xs mb-4">
              Input current sportsbook moneyline odds to unlock value analysis
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { f: fA, val: oddsA, set: setOddsA, color: 'blue', ph: '-150' },
                { f: fB, val: oddsB, set: setOddsB, color: 'red', ph: '+130' },
              ].map(({ f, val, set, color, ph }) => (
                <div key={color}>
                  <label
                    className={`text-xs font-bold mb-1.5 block ${
                      color === 'blue' ? 'text-blue-400' : 'text-red-400'
                    }`}
                  >
                    {f.FIGHTER}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^0-9+-]/g, '');
                        if (v.length > 0 && v[0] !== '+' && v[0] !== '-')
                          v = '';
                        if (v.length > 5) v = v.slice(0, 5);
                        set(v);
                      }}
                      placeholder={ph}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white font-black text-xl text-center placeholder-slate-700 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                    />
                    {parseAmericanOdds(val) != null && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                        {(parseAmericanOdds(val) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {oddsA && oddsB && !market && (
              <p className="text-orange-400 text-xs mt-3 text-center">
                Enter valid American odds for both fighters (e.g. -200 and +170)
              </p>
            )}
          </div>

          {/* ── SECTION 1: THE VERDICT HERO ── */}
          {(() => {
            const pctA = (activePA * 100).toFixed(1);
            const pctB = (activePB * 100).toFixed(1);
            const favA = activePA > activePB;
            const winner = favA ? fA : fB;
            const winnerPct = favA ? pctA : pctB;
            // Low-sample de-emphasis: same underlying signal as the existing
            // "Low Credibility" Matchup Context pill (App.js CREDIBILITY < 30
            // check), applied here to the headline number's own visual
            // certainty instead of a separate pill only. Does not change
            // activePA/pctA/pctB themselves -- purely a style branch. Carried
            // over unchanged from the pre-recompose hero.
            const avgCredibility = ((fA.CREDIBILITY ?? 100) + (fB.CREDIBILITY ?? 100)) / 2;
            const lowSample = avgCredibility < 50;
            const minTracked = Math.min(fA.TOTAL_MIN ?? 0, fB.TOTAL_MIN ?? 0);
            // Toggle-aware: reuses buildSimulatorDomainRows (the same source
            // the Contribution Breakdown panel renders) instead of always
            // reading result.edges, which is v1-only. See sim/recompose commit
            // "make verdict reasoning line toggle-aware" for the full history.
            const topDomains = buildSimulatorDomainRows(result, modelToggle)
              .filter((r) => !r.isGlobal)
              .filter((r) => (favA ? r.totalContribution > 0 : r.totalContribution < 0))
              .sort((a, b) => Math.abs(b.totalContribution) - Math.abs(a.totalContribution))
              .slice(0, 2);
            const reasoningLine =
              topDomains.length >= 2
                ? `${winner.FIGHTER.split(' ').pop()} wins on ${topDomains[0].label.toLowerCase()} and ${topDomains[1].label.toLowerCase()}`
                : topDomains.length === 1
                ? `${winner.FIGHTER.split(' ').pop()} wins on ${topDomains[0].label.toLowerCase()}`
                : `${winner.FIGHTER.split(' ').pop()} has the overall edge`;
            // Confidence derives from the DISPLAYED model's own probability
            // spread (activePA/activePB, already toggle-aware), not the raw
            // ELO gap (result.diff -- its own comment calls it legacy) which
            // was decoupled from whatever probability was actually on screen.
            // Display-derived only: reads activePA, writes nothing back.
            // Thresholds match the app's existing NO READ/LEAN precedent
            // (App.js: market.pickProb < 0.53 => NO READ; v2 bet-rec bands
            // at 0.60/0.65/0.70) rather than inventing new numbers. Carried
            // over unchanged; only its presentation (badge instead of a
            // second grid tile) changed.
            const spread = Math.abs(activePA - 0.5) * 2;
            const confidenceLabel =
              spread >= 0.30 ? 'Clear edge' : spread >= 0.06 ? 'Moderate' : 'Coin flip';
            const confidenceBadgeCls =
              spread >= 0.30
                ? 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40'
                : spread >= 0.06
                ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40'
                : 'text-slate-300 bg-slate-800/40 border-slate-700/40';
            // Model Disagreement: moved in from the old Matchup Context Flags
            // list (was one of nine generic pills) -- this is specifically
            // about how the two models the toggle switches between disagree,
            // so it belongs where the toggle lives. Condition unchanged: only
            // flags when v2's pick clears the app's own existing NO READ
            // boundary (App.js: market.pickProb < 0.53 => NO READ) -- a
            // 49.8/50.2 split is noise, not a real disagreement.
            let disagreement = null;
            if (result.v2pA != null) {
              const v1FavorsA = result.pA > 0.5;
              const v2FavorsA = result.v2pA > 0.5;
              const v2PickProb = Math.max(result.v2pA, result.v2pB);
              if (v1FavorsA !== v2FavorsA && v2PickProb >= 0.53) {
                disagreement = {
                  v1Favors: (v1FavorsA ? fA : fB).FIGHTER.split(' ').pop(),
                  v2Favors: (v2FavorsA ? fA : fB).FIGHTER.split(' ').pop(),
                };
              }
            }
            return (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                      Win Probability
                    </p>
                    <p className="text-slate-600 text-xs font-mono">{MODEL_VERSION}</p>
                  </div>
                  {result.v2pA != null && (
                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                      <button
                        onClick={() => setModelToggle('v1')}
                        className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                          modelToggle === 'v1' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        v1
                      </button>
                      <button
                        onClick={() => setModelToggle('v2')}
                        className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                          modelToggle === 'v2' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        v2
                      </button>
                    </div>
                  )}
                </div>

                {/* One clear statement -- replaces the old Model Favorite tile
                    outright (it said nothing this doesn't already say). Full
                    name, no width constraint, wraps instead of truncating. */}
                <p className={lowSample ? 'text-slate-200 font-bold text-xl leading-snug mb-1.5' : 'text-white font-black text-xl leading-snug mb-1.5'}>
                  <span className={favA ? 'text-blue-400' : 'text-red-400'}>{winner.FIGHTER}</span>
                  {' favored, '}{winnerPct}%
                </p>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border mb-3 ${confidenceBadgeCls}`}>
                  {confidenceLabel}
                </span>

                {/* Split bar: names stacked above/below (A upper-left, B
                    lower-right) instead of fixed-width w-28 truncate side
                    labels -- guarantees no truncation regardless of name
                    length on either side. */}
                <p className="text-blue-400 font-bold text-sm mb-1">{fA.FIGHTER}</p>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500 rounded-l-full transition-all"
                    style={{ width: `${activePA * 100}%` }}
                  />
                  <div className="h-full bg-red-500 flex-1 rounded-r-full" />
                </div>
                <p className="text-red-400 font-bold text-sm text-right mt-1 mb-2">{fB.FIGHTER}</p>
                <div className="flex justify-between px-1 mb-2">
                  <span className={lowSample ? 'text-slate-300 font-semibold text-2xl' : 'text-white font-black text-2xl'}>
                    {pctA}%
                  </span>
                  <span className={lowSample ? 'text-slate-300 font-semibold text-2xl' : 'text-white font-black text-2xl'}>
                    {pctB}%
                  </span>
                </div>
                {lowSample && (
                  <p className="text-amber-500 text-xs text-center mb-1">
                    low sample — {minTracked} min tracked
                  </p>
                )}

                {/* Reasoning promoted from a tiny italic caption -- it's the
                    one piece here that's genuinely new information (why),
                    so it earns more visual weight than the redundant tiles
                    it replaces did. */}
                <p className="text-slate-300 text-sm text-center mb-1">
                  {reasoningLine}
                </p>

                {disagreement && (
                  <p className="text-amber-400 text-xs text-center bg-amber-950/20 border border-amber-800/40 rounded-lg px-3 py-2 mt-3">
                    ⚠ Model Disagreement — v1 favors {disagreement.v1Favors}, v2 favors {disagreement.v2Favors}
                  </p>
                )}
              </div>
            );
          })()}

          <p className="sm:hidden text-slate-600 text-xs text-center">
            Saving is available on desktop.
          </p>

          <div className="hidden sm:block bg-slate-900 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-white text-xs font-black uppercase tracking-widest">
                  Save to Upcoming
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Save this matchup to grade the pick later against the real
                  result.
                </p>
              </div>
              {saveFeedback && (
                <span className="text-emerald-400 text-xs font-semibold">
                  {saveFeedback}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="UFC 325"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full h-10 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Units Staked
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={unitsWagered}
                  onChange={(e) => setUnitsWagered(e.target.value)}
                  placeholder="1"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500"
                />
              </div>
            </div>
            {(() => {
              const savePick = activePA >= activePB ? fA.FIGHTER : fB.FIGHTER;
              const saveProb = Math.max(activePA, activePB);
              return (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-800/40 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Model pick</p>
                <p className="text-white font-bold text-sm mt-1">
                  {savePick}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {(saveProb * 100).toFixed(1)}% win prob
                </p>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Bet recommendation</p>
                {market &&
                (market.betAction === 'LEAN' ||
                  market.betAction === 'BET' ||
                  market.betAction === 'STRONG BET') ? (
                  <>
                    <p className="font-bold text-sm mt-1 text-emerald-400">
                      {market.betAction}
                    </p>
                    {market.bestBet && (
                      <p className="text-slate-400 text-xs mt-0.5">
                        {market.bestBet === 'A' ? fA.FIGHTER : fB.FIGHTER}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-bold text-sm mt-1 text-slate-600">—</p>
                )}
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Saved with market</p>
                <p className="text-white font-bold text-sm mt-1">
                  {market ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
              );
            })()}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => {
                  if (!fA || !fB) return;
                  const entry = buildRoiEntry({
                    fA, fB, oddsA, oddsB,
                    eventName: eventName.trim(),
                    eventDate,
                    modelToggle,
                    unitsWagered: unitsWagered.trim() ? Number(unitsWagered) : 1,
                  });
                  onSaveToUpcoming?.(entry);
                  setSaveFeedback('Saved to Upcoming.');
                }}
                className="px-4 py-2 rounded-lg border border-blue-700 text-blue-300 text-sm font-semibold hover:text-white hover:border-blue-500 transition-colors"
              >
                Save to Upcoming
              </button>
              <button
                onClick={() => {
                  if (!fA || !fB) return;
                  const entry = buildRoiEntry({
                    fA, fB, oddsA, oddsB,
                    eventName: eventName.trim(),
                    eventDate,
                    modelToggle,
                    unitsWagered: unitsWagered.trim() ? Number(unitsWagered) : 1,
                  });
                  onSaveToUpcomingAndOpen?.(entry);
                  setSaveFeedback('Saved to Upcoming.');
                }}
                className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                Save and Open Upcoming
              </button>
            </div>
          </div>


          {/* ── MATCHUP CONTEXT FLAGS ── */}
          {(() => {
            if (!fA || !fB || !result) return null;
            const flags = [];
            if (result.debutMatchup)
              flags.push({ label: 'Debut / Prospect', color: 'text-amber-400 bg-amber-900/20 border-amber-800/40' });
            if ((fA.TOTAL_ROUNDS ?? fA.tr ?? 0) < 5 || (fB.TOTAL_ROUNDS ?? fB.tr ?? 0) < 5)
              flags.push({ label: 'Sparse Data', color: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/40' });
            if ((fA.CREDIBILITY ?? 100) < 30 || (fB.CREDIBILITY ?? 100) < 30)
              flags.push({ label: 'Low Credibility', color: 'text-orange-400 bg-orange-900/20 border-orange-800/40' });
            if (fA.WEIGHT_CLASS !== fB.WEIGHT_CLASS)
              flags.push({ label: 'Cross-Division', color: 'text-purple-400 bg-purple-900/20 border-purple-800/40' });
            if (fA.WEIGHT_CLASS?.startsWith("Women's") || fB.WEIGHT_CLASS?.startsWith("Women's"))
              flags.push({ label: "Women's Division", color: 'text-pink-400 bg-pink-900/20 border-pink-800/40' });
            if (result.southpawMismatch)
              flags.push({ label: 'Southpaw vs Orthodox', color: 'text-cyan-400 bg-cyan-900/20 border-cyan-800/40' });
            // Bout-date ages, matching the model. An unknown age stays below
            // the threshold rather than defaulting into it.
            if ((simulatorAge(fA, eventDate) ?? 0) >= 38 || (simulatorAge(fB, eventDate) ?? 0) >= 38)
              flags.push({ label: 'Veteran Age (38+)', color: 'text-red-400 bg-red-900/20 border-red-800/40' });
            if ((result.loseStreakA ?? 0) >= 3 || (result.loseStreakB ?? 0) >= 3)
              flags.push({ label: 'Active Loss Streak', color: 'text-red-400 bg-red-900/20 border-red-800/40' });
            if (Math.abs(result.qualMomDiff ?? 0) > 0.5)
              flags.push({ label: `Form Edge: ${(result.qualMomDiff ?? 0) > 0 ? fA.FIGHTER.split(' ').pop() : fB.FIGHTER.split(' ').pop()}`, color: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40' });
            // Model Disagreement moved to the verdict hero above -- not
            // computed here anymore.
            if (flags.length === 0) return null;
            return (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">
                  Matchup Context
                </p>
                <div className="flex flex-wrap gap-2">
                  {flags.map(({ label, color }) => (
                    <span key={label} className={`text-xs font-semibold px-2 py-1 rounded-full border ${color}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── CONTRIBUTION BREAKDOWN (replaces Key Advantages, Domain Breakdown, Model Input Comparison) ── */}
          <SimulatorContributionPanel fA={fA} fB={fB} result={result} modelToggle={modelToggle} eventDate={eventDate} />

          {/* ── BETTING ANALYSIS (only when odds entered) ── */}
          {market && (
            <div className="space-y-4">
              {/* BET RECOMMENDATION BANNER */}
              {(() => {
                const pickFighter  = market.pickSide === 'A' ? fA : fB;
                const pickOdds     = market.pickSide === 'A' ? oddsA : oddsB;
                const pickEV       = market.pickSide === 'A' ? market.evA : market.evB;
                const pickKelly    = market.pickSide === 'A' ? market.kellyA : market.kellyB;
                const pickBreakEven = market.pickSide === 'A' ? market.breakEvenA : market.breakEvenB;
                const pickFairLine = market.pickSide === 'A' ? market.fairLineA : market.fairLineB;

                // NO READ: when the ACTIVE model's pick probability is < 53%,
                // the fight is a coin-flip and we suppress any bet read. This is
                // distinct from NO BET (we have conviction but no market value).
                // Uses market.pickProb, which already reflects the v1/v2 toggle.
                const pickProbActive = market.pickProb ?? Math.max(activePA, activePB);
                const noRead = isNoReadProbability(pickProbActive);
                const displayAction = noRead ? 'NO READ' : market.betAction;

                const isBet = !noRead && (market.betAction === 'STRONG BET' || market.betAction === 'BET');
                const isLean = !noRead && market.betAction === 'LEAN';
                const isNoBet = !noRead && market.betAction === 'NO BET';
                const actionable = isBet || isLean;
                const showBetRec = actionable || noRead;

                const actionStyles = {
                  'STRONG BET': { bg: 'bg-emerald-950/40 border-emerald-600', badge: 'bg-emerald-500 text-emerald-950', text: 'text-emerald-400' },
                  'BET':        { bg: 'bg-emerald-950/20 border-emerald-800', badge: 'bg-emerald-700 text-emerald-100', text: 'text-emerald-400' },
                  'LEAN':       { bg: 'bg-yellow-950/20 border-yellow-800',   badge: 'bg-yellow-700 text-yellow-100',   text: 'text-yellow-400' },
                  'NO BET':     { bg: 'bg-slate-800/40 border-slate-700',     badge: 'bg-slate-600 text-slate-200',     text: 'text-slate-400'  },
                  // NO READ: muted gray, deliberately dimmer than NO BET.
                  'NO READ':    { bg: 'bg-slate-900/40 border-slate-800',     badge: 'bg-slate-700 text-slate-400',     text: 'text-slate-500'  },
                };
                const s = actionStyles[displayAction] ?? actionStyles['NO BET'];

                return (
                  <div className="space-y-3">

                    {/* ── ROW 1: Signal summary (Bet Rec column only when actionable) ── */}
                    <div className={`grid ${showBetRec ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>

                      {/* Model Pick — always shown */}
                      <div className={`border rounded-xl p-4 ${market.lowConviction ? 'bg-orange-950/10 border-orange-900' : 'bg-slate-900 border-slate-700'}`}>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Model Pick</p>
                        <p className="text-white font-black text-base leading-tight">{pickFighter.FIGHTER}</p>
                        <p className={`text-xs mt-1 ${market.lowConviction ? 'text-orange-400' : 'text-slate-400'}`}>
                          {market.pickSide === 'A' ? (activePA * 100).toFixed(1) : (activePB * 100).toFixed(1)}% win prob
                          {market.lowConviction ? ' ⚠ low conviction' : market.midConviction ? ' · moderate' : ''}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">Fair line: {pickFairLine}</p>
                      </div>

                      {/* Value Signal — where market edge is */}
                      <div className={`border rounded-xl p-4 ${
                        market.conflictingSignals
                          ? 'bg-orange-950/20 border-orange-800'
                          : market.hasPickEdge
                          ? 'bg-emerald-950/20 border-emerald-800'
                          : 'bg-slate-800/40 border-slate-700'
                      }`}>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Value Signal</p>
                        {market.conflictingSignals ? (
                          <>
                            <p className="text-orange-400 font-black text-sm">⚠ Conflicting</p>
                            <p className="text-slate-400 text-xs mt-1">
                              Edge on {market.pickSide === 'A' ? fB.FIGHTER : fA.FIGHTER}{' '}
                              (+{(market.oppEdge * 100).toFixed(1)}pp)
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">Opposite of model pick</p>
                          </>
                        ) : market.hasPickEdge ? (
                          <>
                            <p className="text-emerald-400 font-black text-sm">✓ Aligned</p>
                            <p className="text-slate-400 text-xs mt-1">
                              +{(market.pickEdge * 100).toFixed(1)}pp edge on pick
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">Pick and value agree</p>
                          </>
                        ) : (
                          <>
                            <p className="text-slate-400 font-black text-sm">No Edge</p>
                            <p className="text-slate-500 text-xs mt-1">Market fairly priced</p>
                          </>
                        )}
                      </div>

                      {/* Bet Recommendation — actionable (LEAN/BET/STRONG BET) or NO READ */}
                      {showBetRec && (
                        <div className={`border rounded-xl p-4 ${s.bg}`}>
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Bet Rec</p>
                          <span className={`inline-block text-xs font-black px-2 py-0.5 rounded-full mb-2 ${s.badge}`}>
                            {displayAction}
                          </span>
                          {noRead ? (
                            <p className="text-slate-500 text-xs leading-snug">Pick under 53% — coin-flip, insufficient confidence to read</p>
                          ) : (
                          <>
                          <p className={`font-black text-sm ${s.text}`}>{pickFighter.FIGHTER}</p>
                          <p className="text-white font-bold text-sm">{pickOdds}</p>
                          {isLean && market.lowCredCap && (
                            <p className="text-amber-500 text-xs mt-1.5 leading-snug">Capped from BET — low sample size (CRED &lt; 30%)</p>
                          )}
                          </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── ROW 2: Full bet details (only when actionable, never on NO READ) ── */}
                    {!isNoBet && !noRead && (
                      <div className={`border rounded-xl p-5 ${s.bg}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-baseline gap-3">
                            <span className={`font-black text-2xl ${s.text}`}>{pickFighter.FIGHTER}</span>
                            <span className="text-white font-black text-xl">{pickOdds}</span>
                          </div>
                          <span className={`text-xs font-black px-3 py-1 rounded-full ${s.badge}`}>
                            {market.betAction}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-slate-900/60 rounded-lg p-3">
                            <p className="text-slate-500 text-xs mb-1">Edge vs market</p>
                            <p className={`font-black text-xl ${s.text}`}>
                              +{(market.pickEdge * 100).toFixed(1)}pp
                            </p>
                            <p className="text-slate-600 text-xs mt-0.5">
                              Model sees {(market.pickEdge * 100).toFixed(1)}pp more than no-vig line
                            </p>
                          </div>
                          <div className="bg-slate-900/60 rounded-lg p-3">
                            <p className="text-slate-500 text-xs mb-1">EV per $100</p>
                            <p className={`font-black text-xl ${Number(pickEV ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {Number(pickEV ?? 0) > 0 ? '+' : ''}${Number(pickEV ?? 0).toFixed(2)}
                            </p>
                            <p className="text-slate-600 text-xs mt-0.5">Expected return on $100 flat bet</p>
                          </div>
                          <div className="bg-slate-900/60 rounded-lg p-3">
                            <p className="text-slate-500 text-xs mb-1">Break-even %</p>
                            <p className="text-white font-black text-xl">
                              {((pickBreakEven || 0) * 100).toFixed(1)}%
                            </p>
                            <p className="text-slate-600 text-xs mt-0.5">Win rate needed to break even</p>
                          </div>
                          <div className="bg-slate-900/60 rounded-lg p-3">
                            <p className="text-slate-500 text-xs mb-1">Kelly fraction</p>
                            <p className="text-white font-black text-xl">
                              {((pickKelly || 0) * 100).toFixed(1)}%
                            </p>
                            <p className="text-slate-600 text-xs mt-0.5">Suggested bankroll size (full Kelly)</p>
                          </div>
                        </div>
                        {/* Confidence bar */}
                        <div className="pt-3 border-t border-slate-700/40">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-slate-500 text-xs">Model confidence</span>
                            <span className={`text-xs font-bold ${market.betConfidence >= 65 ? 'text-emerald-400' : market.betConfidence >= 40 ? 'text-yellow-400' : 'text-slate-500'}`}>
                              {market.betConfidence}/100
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${market.betConfidence >= 65 ? 'bg-emerald-500' : market.betConfidence >= 40 ? 'bg-yellow-500' : 'bg-slate-600'}`}
                              style={{ width: `${market.betConfidence ?? 0}%` }}
                            />
                          </div>
                          <p className="text-slate-600 text-xs mt-1.5">
                            {market.alignedDomains}/6 model domains align · avg credibility {((fA.CREDIBILITY + fB.CREDIBILITY) / 2).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()}

              {/* ── V2 BET RECOMMENDATION (only when modelToggle is v2) ── */}
              {result?.v2pA != null && modelToggle === 'v2' && (() => {
                const v2pA = result.v2pA;
                const v2pB = result.v2pB;
                const { noVigA, noVigB, rawA, rawB } = market;
                const edgeA = v2pA - noVigA;
                const edgeB = v2pB - noVigB;
                const pickSide = v2pA >= 0.5 ? 'A' : 'B';
                const pickEdge = pickSide === 'A' ? edgeA : edgeB;
                const oppEdge  = pickSide === 'A' ? edgeB : edgeA;
                const pickProb = pickSide === 'A' ? v2pA : v2pB;
                const pickRawOdds = pickSide === 'A' ? rawA : rawB;
                const hasPickEdge = pickEdge >= 0.03;
                const conflictingSignals = !hasPickEdge && oppEdge >= 0.03;
                let action = 'NO BET';
                if (!conflictingSignals && hasPickEdge) {
                  if (pickProb >= 0.70) {
                    if (pickEdge >= 0.25) action = 'STRONG BET';
                    else if (pickEdge >= 0.15) action = 'BET';
                    else action = 'LEAN';
                  } else if (pickProb >= 0.65) {
                    if (pickEdge >= 0.30) action = 'BET';
                    else if (pickEdge >= 0.10) action = 'LEAN';
                  } else if (pickProb >= 0.60) {
                    if (pickEdge >= 0.10) action = 'LEAN';
                  }
                }
                const lowCredCap = (fA.CREDIBILITY ?? 0) < 30 || (fB.CREDIBILITY ?? 0) < 30;
                if (lowCredCap && (action === 'STRONG BET' || action === 'BET')) action = 'LEAN';
                if (pickRawOdds > 2 / 3 && pickEdge < 0.25 && action !== 'NO BET') action = 'NO BET';
                const v2Fighter = action !== 'NO BET' ? (pickSide === 'A' ? fA.FIGHTER : fB.FIGHTER) : null;
                const v1Action = market.betAction;
                const v1Fighter = market.bestBet === 'A' ? fA.FIGHTER : market.bestBet === 'B' ? fB.FIGHTER : null;
                const disagrees = action !== v1Action || v2Fighter !== v1Fighter;
                const badgeStyle =
                  action === 'STRONG BET' ? 'bg-emerald-500 text-emerald-950' :
                  action === 'BET'        ? 'bg-emerald-700 text-emerald-100' :
                  action === 'LEAN'       ? 'bg-yellow-700 text-yellow-100'   :
                                            'bg-slate-600 text-slate-200';
                return (
                  <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${disagrees ? 'border-amber-700/50 bg-amber-950/10' : 'border-slate-700 bg-slate-800/40'}`}>
                    <span className="text-slate-500 text-xs shrink-0">v2 Logistic:</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${badgeStyle}`}>{action}</span>
                    {v2Fighter && (
                      <span className={`text-xs font-semibold ${disagrees ? 'text-amber-400' : 'text-slate-300'}`}>
                        {v2Fighter}
                      </span>
                    )}
                    {disagrees && <span className="text-amber-500 text-xs ml-auto">⚠ differs from v1</span>}
                  </div>
                );
              })()}

              {/* VIG + SIDE-BY-SIDE CARDS */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Market Analysis
                  </p>
                  <span className="text-xs text-slate-500 font-mono">
                    Vig {(market.vig ?? 0).toFixed(1)}% · Overround{' '}
                    {(market.overround ?? 0).toFixed(1)}%
                  </span>
                </div>

                {/* Probability comparison bar */}
                <div className="bg-slate-800/40 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-slate-500 text-xs">Market (no-vig)</p>
                      <p className="text-white font-mono font-bold text-sm mt-1">
                        {((market.noVigA ?? 0) * 100).toFixed(1)}% /{' '}
                        {((market.noVigB ?? 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Model says</p>
                      <p className="text-white font-mono font-bold text-sm mt-1">
                        {(activePA * 100).toFixed(1)}% /{' '}
                        {(activePB * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Model edge</p>
                      <p className="text-white font-mono font-bold text-sm mt-1">
                        <span
                          className={
                            market.edgeA > 0.02
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }
                        >
                          {market.edgeA > 0 ? '+' : ''}
                          {((market.edgeA ?? 0) * 100).toFixed(1)}%
                        </span>
                        {' / '}
                        <span
                          className={
                            market.edgeB > 0.02
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }
                        >
                          {market.edgeB > 0 ? '+' : ''}
                          {((market.edgeB ?? 0) * 100).toFixed(1)}%
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      f: fA,
                      edge: market.edgeA,
                      ev: market.evA,
                      kelly: market.kellyA,
                      grade: market.gradeA,
                      odds: oddsA,
                      color: 'blue',
                      noVig: market.noVigA,
                      modelP: activePA,
                      breakEven: market.breakEvenA,
                      fairLine: market.fairLineA,
                    },
                    {
                      f: fB,
                      edge: market.edgeB,
                      ev: market.evB,
                      kelly: market.kellyB,
                      grade: market.gradeB,
                      odds: oddsB,
                      color: 'red',
                      noVig: market.noVigB,
                      modelP: activePB,
                      breakEven: market.breakEvenB,
                      fairLine: market.fairLineB,
                    },
                  ].map(
                    ({
                      f,
                      edge,
                      ev,
                      kelly,
                      grade,
                      odds,
                      color,
                      noVig,
                      modelP,
                      breakEven,
                      fairLine,
                    }) => {
                      const isBest =
                        (market.bestBet === 'A' && f === fA) ||
                        (market.bestBet === 'B' && f === fB);
                      return (
                        <div
                          key={f.FIGHTER}
                          className={`border rounded-xl p-4 ${grade.bg} ${
                            color === 'blue' ? 'border-l-4 border-l-blue-600' : 'border-l-4 border-l-red-600'
                          } ${
                            isBest
                              ? color === 'blue'
                                ? 'ring-1 ring-blue-500/30'
                                : 'ring-1 ring-red-500/30'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p
                              className={`font-bold text-base ${
                                color === 'blue'
                                  ? 'text-blue-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {f.FIGHTER}
                            </p>
                            <span
                              className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                                grade.label === 'STRONG VALUE' || grade.label === 'VALUE'
                                  ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50'
                                  : grade.label === 'LEAN'
                                  ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50'
                                  : grade.label === 'FADE'
                                  ? 'bg-red-900/40 text-red-400 border-red-700/50'
                                  : 'bg-slate-700 text-slate-400 border-slate-600'
                              }`}
                            >
                              {grade.label}
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            {[
                              [
                                'Market line',
                                <span className="text-white font-black text-base">
                                  {odds}
                                </span>,
                              ],
                              [
                                'Fair value line',
                                <span className="text-slate-300 font-mono">
                                  {fairLine}
                                </span>,
                              ],
                              [
                                'No-vig implied',
                                <span className="text-slate-300 font-mono">
                                  {((noVig ?? 0) * 100).toFixed(1)}%
                                </span>,
                              ],
                              [
                                'Model probability',
                                <span className="text-white font-mono font-bold">
                                  {((modelP ?? 0) * 100).toFixed(1)}%
                                </span>,
                              ],
                              [
                                'Break-even',
                                <span className="text-slate-300 font-mono">
                                  {((breakEven ?? 0) * 100).toFixed(1)}%
                                </span>,
                              ],
                            ].map(([label, val]) => (
                              <div
                                key={label}
                                className="flex justify-between items-baseline"
                              >
                                <span className="text-slate-500">{label}</span>
                                {val}
                              </div>
                            ))}
                            <div className="border-t border-slate-700/50 pt-2 mt-2" />
                            {[
                              [
                                'Edge (model − market)',
                                <span
                                  className={`font-black ${
                                    (edge ?? 0) > 0.03
                                      ? 'text-xl text-emerald-400'
                                      : (edge ?? 0) < -0.03
                                      ? 'text-xl text-red-400'
                                      : 'text-sm text-slate-400'
                                  }`}
                                >
                                  {(edge ?? 0) > 0 ? '+' : ''}
                                  {((edge ?? 0) * 100).toFixed(1)}%
                                </span>,
                              ],
                              [
                                'EV per $100',
                                <span
                                  className={`font-bold ${
                                    (ev ?? 0) > 0
                                      ? 'text-emerald-400'
                                      : 'text-red-400'
                                  }`}
                                >
                                  {(ev ?? 0) > 0 ? '+' : ''}$
                                  {(ev ?? 0).toFixed(2)}
                                </span>,
                              ],
                              [
                                '¼ Kelly size',
                                <span
                                  className={`font-mono ${
                                    (kelly ?? 0) > 0
                                      ? 'text-emerald-400'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {(kelly ?? 0) > 0
                                    ? `${((kelly ?? 0) * 25).toFixed(1)}%`
                                    : '—'}
                                </span>,
                              ],
                            ].map(([label, val]) => (
                              <div
                                key={label}
                                className="flex justify-between items-baseline"
                              >
                                <span className="text-slate-500">{label}</span>
                                {val}
                              </div>
                            ))}
                          </div>
                          {isBest && (
                            <div className="mt-3 pt-2 border-t border-emerald-800/30">
                              <p className="text-emerald-400 text-xs font-bold text-center">
                                ★ BEST VALUE PLAY
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}

          {!market && oddsA === '' && oddsB === '' && result && (
            <p className="text-slate-600 text-xs text-center italic py-2">
              Enter sportsbook lines above to unlock value detection and bet
              sizing
            </p>
          )}

          {/* ── SECTION 8: FINISH PROBABILITY ── */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            {(() => {
              const { ko, sub, dec } = computeFinishProbs(fA, fB);
              const dominant = ko > sub && ko > dec ? 'KO/TKO' : sub > dec ? 'SUB' : 'DEC';

              const badge =
                ko > 45
                  ? { label: 'KO/TKO LIKELY', cls: 'bg-red-950/60 text-red-400 border border-red-800/50' }
                  : sub > 30
                  ? { label: 'SUBMISSION THREAT', cls: 'bg-violet-950/60 text-violet-400 border border-violet-800/50' }
                  : { label: 'LIKELY DECISION', cls: 'bg-slate-800 text-slate-400 border border-slate-700' };

              const koDriver    = (fA.KO_WIN_PCT ?? 0) >= (fB.KO_WIN_PCT ?? 0) ? fA : fB;
              const subDriver   = (fA.SUB_WIN_PCT ?? 0) >= (fB.SUB_WIN_PCT ?? 0) ? fA : fB;
              const koDriverName  = koDriver.FIGHTER.split(' ').pop();
              const subDriverName = subDriver.FIGHTER.split(' ').pop();
              const hasKdThreat = (fA.KD_PER_MIN ?? 0) > 0.01 || (fB.KD_PER_MIN ?? 0) > 0.01;
              const neitherFinisher = Math.max(fA.FINISH_RATE ?? 0, fB.FINISH_RATE ?? 0) < 50;

              const methods = [
                {
                  key: 'KO/TKO',
                  label: 'KO / TKO',
                  pct: ko,
                  color: 'bg-red-500',
                  tc: 'text-red-400',
                  driver: hasKdThreat
                    ? `Driven by ${koDriverName}'s KD rate`
                    : `Driven by ${koDriverName}'s KO%`,
                },
                {
                  key: 'SUB',
                  label: 'Submission',
                  pct: sub,
                  color: 'bg-violet-500',
                  tc: 'text-violet-400',
                  driver: `Driven by ${subDriverName}'s sub threat`,
                },
                {
                  key: 'DEC',
                  label: 'Decision',
                  pct: dec,
                  color: 'bg-slate-600',
                  tc: 'text-slate-300',
                  driver: neitherFinisher
                    ? 'Neither fighter a dominant finisher'
                    : 'Low finish threat overall',
                },
              ];

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                      Projected Finish Method
                    </p>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex h-8 rounded-full overflow-hidden mb-4">
                    {methods.map(({ key, label, pct, color }) =>
                      pct > 0 ? (
                        <div
                          key={key}
                          className={`${color} flex items-center justify-center`}
                          style={{ width: `${pct}%` }}
                        >
                          {pct > 15 && (
                            <span className="text-white text-xs font-black">{pct}%</span>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    {methods.map(({ key, label, pct, tc, driver }) => {
                      const isDominant = key === dominant;
                      return (
                        <div key={key} className="bg-slate-800/40 rounded-xl p-3">
                          <p className={`font-black ${isDominant ? 'text-2xl' : 'text-lg'} ${tc}`}>
                            {pct}%
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5 font-semibold">{label}</p>
                          <p className="text-slate-500 text-[10px] mt-1 leading-tight">{driver}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-slate-400 text-xs uppercase tracking-widest">Projected Finish · </span>
                    <span className="text-white font-bold text-sm">{getProjectedFinishLabel({ ko, sub, dec })}</span>
                  </div>
                </>
              );
            })()}
          </div>

        </div>
      ) : (
        <div className="text-center py-16 text-slate-600">
          <Swords size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">
            Search two fighters to generate the matchup simulation
          </p>
        </div>
      )}
    </div>
  );
}

// ─── SCOUT PROFILE ────────────────────────────────────────────────────────────
function ScoutProfile({ allFighters }) {
  const [fighter, setFighter] = useState(null);
  const [scoutTab, setScoutTab] = useState('overview');

  const factorCards = useMemo(() => {
    if (!fighter) return null;
    const div = allFighters.filter(
      (f) => f.WEIGHT_CLASS === fighter.WEIGHT_CLASS
    );
    const avg = (k) => div.reduce((s, f) => s + (f[k] ?? 0), 0) / div.length;
    const pct = (k) => {
      const fv = fighter[k] ?? 0;
      return Math.round(
        (div.filter((f) => (f[k] ?? 0) < fv).length / Math.max(div.length, 1)) *
          100
      );
    };
    return [
      {
        key: 'FACTOR_DAMAGE',
        score: pct('FACTOR_DAMAGE'),
        raw: fighter.FACTOR_DAMAGE ?? 0,
        avgRaw: avg('FACTOR_DAMAGE'),
      },
      {
        key: 'FACTOR_POSITION',
        score: pct('FACTOR_POSITION'),
        raw: fighter.FACTOR_POSITION ?? 0,
        avgRaw: avg('FACTOR_POSITION'),
      },
      {
        key: 'FACTOR_FINISH',
        score: pct('FACTOR_FINISH'),
        raw: fighter.FACTOR_FINISH ?? 0,
        avgRaw: avg('FACTOR_FINISH'),
      },
      {
        key: 'FACTOR_CARDIO',
        score: pct('FACTOR_CARDIO'),
        raw: fighter.FACTOR_CARDIO ?? 0,
        avgRaw: avg('FACTOR_CARDIO'),
      },
    ];
  }, [fighter, allFighters]);

  const radarData = useMemo(() => {
    if (!factorCards) return [];
    const labels = {
      FACTOR_DAMAGE: 'Damage',
      FACTOR_POSITION: 'Position',
      FACTOR_FINISH: 'Finish',
      FACTOR_CARDIO: 'Cardio',
    };
    return factorCards.map((item) => ({
      factor: labels[item.key],
      fighter: item.score,
      avg: 50,
    }));
  }, [factorCards]);

  const divRank = useMemo(() => {
    if (!fighter) return null;
    const div = [
      ...allFighters.filter((f) => f.WEIGHT_CLASS === fighter.WEIGHT_CLASS),
    ].sort((a, b) => b.ADJUSTED_RATING - a.ADJUSTED_RATING); // ← change here
    return {
      rank: div.findIndex((f) => f.FIGHTER === fighter.FIGHTER) + 1,
      total: div.length,
    };
  }, [fighter, allFighters]);

  const pen = fighter ? ageDecayPenalty(fighter) : 0;
  const fh = fighter?.FIGHT_HISTORY || [];

  const divPercentiles = useMemo(() => {
    if (!fighter) return null;
    const div = allFighters.filter(
      (f) => f.WEIGHT_CLASS === fighter.WEIGHT_CLASS
    );
    const pct = (k) => {
      const fv = fighter[k] ?? 0;
      return Math.round(
        (div.filter((f) => (f[k] ?? 0) < fv).length / div.length) * 100
      );
    };
    return {
      EFF: pct('ADJUSTED_RATING'),
      NSM: pct('NET_STRIKE_MARGIN'),
      STR: pct('SIG_STR_ACC'),
      TDE: pct('TDE'),
      CTRL: pct('CONTROL_TIME_PCT'),
      FINISH: pct('FINISH_RATE'),
      CARDIO: pct('CARDIO_DECAY'),
      OQI: pct('OQI'),
    };
  }, [fighter, allFighters]);

  const archetype = useMemo(() => {
    if (!fighter) return null;
    const nsm = fighter.NET_STRIKE_MARGIN ?? 0,
      tde = fighter.TDE ?? 0,
      ctrl = fighter.CONTROL_TIME_PCT ?? 0,
      sub = fighter.SUB_THREAT_RATE ?? 0,
      kd = fighter.KD_PER_MIN ?? 0,
      finish = fighter.FINISH_RATE ?? 0,
      cardio = fighter.CARDIO_DECAY ?? 0,
      acc = fighter.SIG_STR_ACC ?? 0;
    if (kd > 0.02 && finish > 60)
      return {
        label: 'Knockout Artist',
        desc: 'Elite finishing power — stops fights standing with a high knockdown rate and finish percentage.',
        color: 'text-red-400',
        bg: 'bg-red-900/20 border-red-800',
      };
    if (sub > 1.5 && finish > 50)
      return {
        label: 'Submission Hunter',
        desc: 'Dangerous on the mat — consistently threatens with submissions and finishes fights via choke or lock.',
        color: 'text-purple-400',
        bg: 'bg-purple-900/20 border-purple-800',
      };
    if (tde > 3 && ctrl > 30)
      return {
        label: 'Pressure Wrestler',
        desc: 'Dominant grappler who controls where fights happen and wears opponents down with relentless top pressure.',
        color: 'text-blue-400',
        bg: 'bg-blue-900/20 border-blue-800',
      };
    if (nsm > 1.5 && acc > 50)
      return {
        label: 'Surgical Striker',
        desc: 'Precise and efficient on the feet — lands significantly more than absorbed with above-average accuracy.',
        color: 'text-orange-400',
        bg: 'bg-orange-900/20 border-orange-800',
      };
    if (cardio > 1.1 && nsm > 0.5)
      return {
        label: 'Volume Fighter',
        desc: 'Gets stronger as fights go on — output increases in the late rounds and consistently outworks opponents.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-900/20 border-emerald-800',
      };
    if (nsm < -0.5 && finish > 55)
      return {
        label: 'Brawler',
        desc: 'Willing to trade and absorb damage to land their own shots — high finish rate despite taking hits.',
        color: 'text-yellow-400',
        bg: 'bg-yellow-900/20 border-yellow-800',
      };
    if (tde > 2 && nsm > 0)
      return {
        label: 'Complete Fighter',
        desc: 'Well-rounded across striking and grappling with no exploitable weakness — dangerous everywhere.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-900/20 border-cyan-800',
      };
    return {
      label: 'Defensive Technician',
      desc: 'Disciplined fighter who avoids damage, controls pace, and wins through efficiency over aggression.',
      color: 'text-slate-300',
      bg: 'bg-slate-800/60 border-slate-700',
    };
  }, [fighter]);

  const FACTORS = [
    {
      key: 'FACTOR_DAMAGE',
      label: 'Damage',
      Icon: Zap,
      textC: 'text-red-400',
      bgC: 'bg-red-500',
    },
    {
      key: 'FACTOR_POSITION',
      label: 'Position',
      Icon: Shield,
      textC: 'text-blue-400',
      bgC: 'bg-blue-500',
    },
    {
      key: 'FACTOR_FINISH',
      label: 'Finish',
      Icon: Target,
      textC: 'text-orange-400',
      bgC: 'bg-orange-500',
    },
    {
      key: 'FACTOR_CARDIO',
      label: 'Cardio',
      Icon: Wind,
      textC: 'text-emerald-400',
      bgC: 'bg-emerald-500',
    },
  ];

  const STAT_GROUPS = [
    {
      title: 'Striking',
      stats: [
        { key: 'ASL', label: 'Adj. Strikes Landed/min', dec: 3 },
        { key: 'ASD', label: 'Adj. Strikes Absorbed/min', dec: 3 },
        {
          key: 'NET_STRIKE_MARGIN',
          label: 'Net Strike Margin',
          dec: 2,
          signed: true,
        },
        { key: 'SIG_STR_ACC', label: 'Strike Accuracy', dec: 1, pct: true },
        { key: 'KD_PER_MIN', label: 'KO Wins/min', dec: 4 },
      ],
    },
    {
      title: 'Grappling',
      stats: [
        { key: 'TDE', label: 'Takedowns/15 min', dec: 2 },
        { key: 'TD_ACC', label: 'Takedown Accuracy', dec: 1, pct: true },
        { key: 'CONTROL_TIME_PCT', label: 'Control Time', dec: 1, pct: true },
        { key: 'SUB_THREAT_RATE', label: 'Sub Attempts/15 min', dec: 2 },
        { key: 'FINISH_RATE', label: 'Finish Rate', dec: 1, pct: true },
        { key: 'KO_WIN_PCT', label: 'KO/TKO Win %', dec: 1, pct: true },
        { key: 'SUB_WIN_PCT', label: 'Sub Win %', dec: 1, pct: true },
      ],
    },
    {
      title: 'Quality & Durability',
      stats: [
        { key: 'OQI', label: 'Opponent Quality Index', dec: 3 },
        { key: 'WIN_PCT', label: 'Win Percentage', dec: 1, pct: true },
        { key: 'CARDIO_DECAY', label: 'Late-Round Output (R3/R1)', dec: 2 },
        { key: 'CREDIBILITY', label: 'Sample Confidence', dec: 1, pct: true },
        { key: 'TOTAL_MIN', label: 'Total Minutes Fought', dec: 0 },
      ],
    },
  ];

  // Performance trend from fight history
  const perfTrendData = useMemo(() => {
    if (!fh.length) return [];
    return [...fh]
      .slice(0, 8)
      .reverse()
      .map((f, i) => ({
        fight: `F${i + 1}`,
        score: f.re === 'W' ? 1 : f.re === 'L' ? 0 : 0.5,
        result: f.re,
        opponent: f.op,
      }));
  }, [fh]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
        <User size={18} className="text-red-500" />
        Advanced Scout — Deep Dive
      </h2>
      <div className="max-w-sm mb-6">
        <FighterSearch
          allFighters={allFighters}
          value={fighter}
          onChange={(f) => {
            setFighter(f);
            setScoutTab('overview');
          }}
          placeholder="Search any active fighter…"
        />
      </div>

      {fighter ? (
        <div className="space-y-5">
          {/* Hero */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-3xl font-black text-white">
                  {fighter.FIGHTER}
                </h3>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-slate-400 text-sm">
                    {fighter.WEIGHT_CLASS}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300 font-mono font-bold">
                    {fighter.RECORD}
                  </span>
                  {divRank && (
                    <span className="bg-red-900/40 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-900">
                      #{divRank.rank}/{divRank.total} DrossPom
                    </span>
                  )}
                  {fighter.IS_PROSPECT && (
                    <span
                      className="bg-amber-900/40 text-amber-400 text-xs font-black px-2 py-0.5 rounded-full border border-amber-800"
                      title="Pre-debut UFC signee — stats from pre-UFC pro fights"
                    >
                      PRE-UFC
                    </span>
                  )}
                  {fighter.UFC_RANK && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        isChampionRecord(fighter.UFC_RANK)
                          ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {ufcRankLabel(fighter.UFC_RANK)} UFC Official
                    </span>
                  )}
                  {fighter.QUALITY_ADJUSTMENT != null &&
                    fighter.QUALITY_ADJUSTMENT !== 0 && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          fighter.QUALITY_ADJUSTMENT > 0
                            ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                            : 'bg-red-900/40 text-red-400 border-red-900'
                        }`}
                      >
                        {fighter.QUALITY_ADJUSTMENT > 0 ? '+' : ''}
                        {(fighter.QUALITY_ADJUSTMENT ?? 0).toFixed(1)} quality
                        adj.
                      </span>
                    )}
                  <CredBadge cred={fighter.CREDIBILITY} />
                  {fighter.AGE && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        pen > 0
                          ? 'bg-orange-900/40 text-orange-400 border-orange-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      Age {fighter.AGE}
                      {pen > 0 ? ' ⚠️' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  {fighter.HEIGHT_IN && (
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <Ruler size={12} />
                      {fmtHeight(fighter.HEIGHT_IN)}
                    </span>
                  )}
                  {fighter.REACH_IN && (
                    <span className="text-slate-400 text-sm">
                      Reach {fmtReach(fighter.REACH_IN)}
                    </span>
                  )}
                  {fighter.STANCE && (
                    <span
                      className={`text-sm font-semibold ${stanceColor(
                        fighter.STANCE
                      )}`}
                    >
                      {fighter.STANCE}
                    </span>
                  )}
                </div>
                {fh.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-500 text-xs">Recent form:</span>
                    <FormDots form={recentForm(fh)} />
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-6xl font-black text-red-500">
                  {(fighter.ADJUSTED_RATING ?? 0).toFixed(1)}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Master Rating</p>
                {pen > 0 && (
                  <p className="text-orange-400 text-xs mt-1">
                    Base EFF age-adj:{' '}
                    {((fighter.TOTAL_EFFICIENCY ?? 0) * (1 - pen)).toFixed(1)}
                  </p>
                )}
                <p className="text-slate-500 text-xs mt-1">
                  Base EFF{' '}
                  <span className="text-white font-bold">
                    {(fighter.TOTAL_EFFICIENCY ?? 0).toFixed(1)}
                  </span>{' '}
                  · Win%{' '}
                  <span className="text-white font-bold">
                    {(fighter.WIN_PCT ?? 0).toFixed(1)}%
                  </span>{' '}
                  · OQI{' '}
                  <span className="text-white font-bold">
                    {(fighter.OQI ?? 0).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {FACTORS.map(({ key, label, Icon, textC, bgC }) => {
                const factorCard = factorCards?.find((f) => f.key === key);
                const score = factorCard?.score ?? 0;
                const raw = factorCard?.raw ?? 0;
                const avgRaw = factorCard?.avgRaw ?? 0;
                return (
                  <div key={key} className="bg-slate-800 rounded-xl p-3">
                    <div
                      className={`flex items-center gap-1.5 mb-1.5 ${textC}`}
                    >
                      <Icon size={13} />
                      <span className="text-xs font-semibold">{label}</span>
                    </div>
                    <p className="text-3xl font-black text-white">{score}</p>
                    <p className="text-slate-600 text-xs mt-0.5">
                      raw {raw.toFixed(1)} · avg {avgRaw.toFixed(1)}
                    </p>
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${bgC} rounded-full`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'fights', label: `Recent Fights (${fh.length})` },
              { id: 'stats', label: 'Full Stats' },
              { id: 'betting', label: 'Betting Profile' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setScoutTab(id)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  scoutTab === id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {scoutTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Four Factors vs Division Avg
                  </p>
                  <p className="text-slate-600 text-xs mb-3">
                    {fighter.WEIGHT_CLASS}
                  </p>
                  <ResponsiveContainer width="100%" height={230}>
                    <RadarChart
                      data={radarData}
                      margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                    >
                      <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="factor"
                        tick={{
                          fill: '#94a3b8',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name={fighter.FIGHTER}
                        dataKey="fighter"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.2}
                        strokeWidth={2.5}
                      />
                      <Radar
                        name="Div Avg"
                        dataKey="avg"
                        stroke="#475569"
                        fill="#475569"
                        fillOpacity={0.08}
                        strokeWidth={1.5}
                        strokeDasharray="5 3"
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: 8,
                          fontSize: 11,
                        }}
                        itemStyle={{ color: '#cbd5e1' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-red-500 inline-block rounded-sm" />
                      {fighter.FIGHTER}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-slate-500 inline-block rounded-sm" />
                      Div. Avg
                    </span>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                    Grappling Floor
                  </p>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Takedown Output',
                        sub: 'TDs per 15 min',
                        val: fighter.TDE,
                        max: 8,
                        dec: 2,
                        color: 'from-blue-600 to-blue-400',
                      },
                      {
                        label: 'TD Accuracy',
                        sub: '% of shots landed',
                        val: fighter.TD_ACC,
                        max: 100,
                        dec: 1,
                        color: 'from-indigo-600 to-indigo-400',
                        suf: '%',
                      },
                      {
                        label: 'Ground Control',
                        sub: '% fight time dominant',
                        val: fighter.CONTROL_TIME_PCT,
                        max: 100,
                        dec: 1,
                        color: 'from-emerald-600 to-emerald-400',
                        suf: '%',
                      },
                      {
                        label: 'Sub Threat',
                        sub: 'Attempts per 15 min',
                        val: fighter.SUB_THREAT_RATE,
                        max: 4,
                        dec: 2,
                        color: 'from-purple-600 to-purple-400',
                      },
                    ].map(({ label, sub, val, max, dec, color, suf = '' }) => {
                      const hasValue = Number.isFinite(val);
                      const displayVal = hasValue ? val : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between items-end mb-1.5">
                            <div>
                              <p className="text-slate-200 font-semibold text-sm">
                                {label}
                              </p>
                              <p className="text-slate-500 text-xs">{sub}</p>
                            </div>
                            <p className="text-xl font-black text-white">
                              {hasValue ? displayVal.toFixed(dec) : 'N/A'}
                              {hasValue ? suf : ''}
                            </p>
                          </div>
                          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-linear-to-r ${color} rounded-full`}
                              style={{
                                width: `${Math.min((displayVal / max) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {archetype && (
                <div
                  className={`border rounded-xl p-5 ${archetype.bg} flex items-start gap-4`}
                >
                  <div className="flex-1">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      Fighter Archetype
                    </p>
                    <p className={`font-black text-xl ${archetype.color}`}>
                      {archetype.label}
                    </p>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                      {archetype.desc}
                    </p>
                  </div>
                </div>
              )}

              {divPercentiles && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
                    Division Percentile Rankings · {fighter.WEIGHT_CLASS}
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      {
                        label: 'Overall Efficiency',
                        pct: divPercentiles.EFF,
                        color: 'bg-red-500',
                      },
                      {
                        label: 'Net Strike Margin',
                        pct: divPercentiles.NSM,
                        color: 'bg-orange-500',
                      },
                      {
                        label: 'Strike Accuracy',
                        pct: divPercentiles.STR,
                        color: 'bg-yellow-500',
                      },
                      {
                        label: 'TD Efficiency',
                        pct: divPercentiles.TDE,
                        color: 'bg-blue-500',
                      },
                      {
                        label: 'Ground Control',
                        pct: divPercentiles.CTRL,
                        color: 'bg-indigo-500',
                      },
                      {
                        label: 'Finish Rate',
                        pct: divPercentiles.FINISH,
                        color: 'bg-pink-500',
                      },
                      {
                        label: 'Cardio (Late Rounds)',
                        pct: divPercentiles.CARDIO,
                        color: 'bg-emerald-500',
                      },
                      {
                        label: 'Opp. Quality Index',
                        pct: divPercentiles.OQI,
                        color: 'bg-slate-400',
                      },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400 text-xs">
                            {label}
                          </span>
                          <span
                            className={`text-xs font-black ${
                              pct >= 80
                                ? 'text-emerald-400'
                                : pct >= 60
                                ? 'text-yellow-400'
                                : pct >= 40
                                ? 'text-slate-300'
                                : 'text-red-400'
                            }`}
                          >
                            {pct}th
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECENT FIGHTS TAB */}
          {scoutTab === 'fights' && (
            <div className="space-y-3">
              {fh.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <Trophy size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">
                    No recent fights found for this fighter.
                  </p>
                  <p className="text-xs mt-1">
                    This usually means the fighter name in `fightHistory.js`
                    does not exactly match the fighter name in
                    `fightersData.js`.
                  </p>
                </div>
              ) : (
                <>
                  {/* Recent fight timeline */}
                  {perfTrendData.length >= 2 && (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        Recent Results (Most Recent → Oldest)
                      </p>
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {fh.slice(0, 8).map((fight, i) => {
                          const resultTone =
                            fight.re === 'W'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : fight.re === 'L'
                              ? 'bg-red-500/15 border-red-500/30 text-red-300'
                              : 'bg-slate-700/40 border-slate-600 text-slate-300';
                          const badgeTone =
                            fight.re === 'W'
                              ? 'bg-emerald-500 text-emerald-950'
                              : fight.re === 'L'
                              ? 'bg-red-500 text-red-950'
                              : 'bg-slate-500 text-slate-950';
                          const method = (fight.me || 'Method N/A')
                            .replace('Decision - ', '')
                            .replace('KO/TKO', 'KO/TKO');

                          return (
                            <div
                              key={`${fight.op}-${fight.dt}-${i}`}
                              className={`min-w-[180px] rounded-xl border px-4 py-3 ${resultTone}`}
                            >
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <span
                                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${badgeTone}`}
                                >
                                  {fight.re ?? '-'}
                                </span>
                                <span className="text-[11px] uppercase tracking-wider text-slate-500">
                                  F{i + 1}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-white truncate">
                                {fight.op}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {method}
                                {fight.rn ? ` · R${fight.rn}` : ''}
                                {fight.ti ? ` · ${fight.ti}` : ''}
                              </p>
                              <p className="mt-2 text-[11px] text-slate-500 line-clamp-2">
                                {fight.ev}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {fh.map((fight, i) => (
                    <FightCard key={i} fight={fight} index={i} />
                  ))}
                </>
              )}
            </div>
          )}

          {/* BETTING PROFILE TAB */}
          {scoutTab === 'betting' && divPercentiles && archetype && (
            <div className="space-y-4">
              {/* Archetype + Win Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`border rounded-xl p-5 ${archetype.bg}`}>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                    Style Archetype
                  </p>
                  <p className={`font-black text-xl ${archetype.color}`}>
                    {archetype.label}
                  </p>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    {archetype.desc}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Projected Finish Method
                  </p>
                  {(() => {
                    const rawKO = Math.min(
                      (fighter.KO_WIN_PCT ?? 0) * 0.6 +
                        (fighter.KD_PER_MIN ?? 0) * 700 +
                        (fighter.FINISH_RATE ?? 0) * 0.15,
                      60
                    );
                    const rawSub = Math.min(
                      (fighter.SUB_WIN_PCT ?? 0) * 0.8 +
                        (fighter.SUB_THREAT_RATE ?? 0) * 8 +
                        (fighter.FINISH_RATE ?? 0) * 0.1,
                      60
                    );
                    const rawDec = Math.max(100 - rawKO - rawSub, 18);
                    const tot = rawKO + rawSub + rawDec;
                    const ko = ((rawKO / tot) * 100).toFixed(0),
                      sub = ((rawSub / tot) * 100).toFixed(0),
                      dec = ((rawDec / tot) * 100).toFixed(0);

                    return (
                      <div className="space-y-2.5">
                        {[
                          {
                            label: 'KO / TKO',
                            pct: ko,
                            color: 'bg-red-500',
                            tc: 'text-red-400',
                            icon: '🥊',
                          },
                          {
                            label: 'Submission',
                            pct: sub,
                            color: 'bg-purple-500',
                            tc: 'text-purple-400',
                            icon: '🦾',
                          },
                          {
                            label: 'Decision',
                            pct: dec,
                            color: 'bg-slate-500',
                            tc: 'text-slate-300',
                            icon: '📋',
                          },
                        ].map(({ label, pct, color, tc, icon }) => (
                          <div key={label}>
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-400 text-xs">
                                {icon} {label}
                              </span>
                              <span className={`text-xs font-black ${tc}`}>
                                {pct}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${color} rounded-full`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Betting Angles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    ✅ Bet On When...
                  </p>
                  <ul className="space-y-2">
                    {[
                      divPercentiles.NSM >= 65 &&
                        'Faces a striker — outlands opponents at a high rate',
                      divPercentiles.CTRL >= 70 &&
                        'Opponent has weak takedown defense — controls position easily',
                      divPercentiles.CARDIO >= 70 &&
                        'Fight expected to go late — gets stronger in rounds 3–5',
                      divPercentiles.FINISH >= 70 &&
                        'Priced as underdog — finishes at an elite rate',
                      divPercentiles.OQI >= 70 &&
                        'Faces lower-quality opposition — battle-tested vs top comp',
                      divPercentiles.STR >= 65 &&
                        'Against volume strikers — accuracy wins over output',
                    ]
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((tip, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-xs text-slate-400"
                        >
                          <span className="text-emerald-500 shrink-0 mt-0.5">
                            •
                          </span>
                          {tip}
                        </li>
                      ))}
                    {[
                      divPercentiles.NSM,
                      divPercentiles.CTRL,
                      divPercentiles.CARDIO,
                    ].every((p) => p < 65) && (
                      <li className="text-xs text-slate-500 italic">
                        No strong statistical edge identified — proceed with
                        caution
                      </li>
                    )}
                  </ul>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    ⚠️ Fade When...
                  </p>
                  <ul className="space-y-2">
                    {[
                      pen > 0 &&
                        `Age-adjusted EFF drops to ${(
                          fighter.TOTAL_EFFICIENCY *
                          (1 - pen)
                        ).toFixed(1)} — decline risk is real`,
                      divPercentiles.NSM < 40 &&
                        'Gets out-struck consistently — negative strike margin',
                      divPercentiles.FINISH < 35 &&
                        'Priced as a big favorite — rarely finishes, relies on decisions',
                      divPercentiles.CTRL < 35 &&
                        "Faces elite wrestlers — can't prevent takedowns or control",
                      divPercentiles.CARDIO < 35 &&
                        'Fights expected to go deep — output fades in late rounds',
                      divPercentiles.OQI < 35 &&
                        'Steps up in competition — limited reps vs top-level fighters',
                    ]
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((tip, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-xs text-slate-400"
                        >
                          <span className="text-red-500 shrink-0 mt-0.5">
                            •
                          </span>
                          {tip}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Full Percentile Reference */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
                  Full Division Percentile Reference · {fighter.WEIGHT_CLASS}
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    {
                      label: 'Overall Efficiency',
                      pct: divPercentiles.EFF,
                      color: 'bg-red-500',
                    },
                    {
                      label: 'Net Strike Margin',
                      pct: divPercentiles.NSM,
                      color: 'bg-orange-500',
                    },
                    {
                      label: 'Strike Accuracy',
                      pct: divPercentiles.STR,
                      color: 'bg-yellow-500',
                    },
                    {
                      label: 'TD Efficiency',
                      pct: divPercentiles.TDE,
                      color: 'bg-blue-500',
                    },
                    {
                      label: 'Ground Control',
                      pct: divPercentiles.CTRL,
                      color: 'bg-indigo-500',
                    },
                    {
                      label: 'Finish Rate',
                      pct: divPercentiles.FINISH,
                      color: 'bg-pink-500',
                    },
                    {
                      label: 'Cardio (Late Rounds)',
                      pct: divPercentiles.CARDIO,
                      color: 'bg-emerald-500',
                    },
                    {
                      label: 'Opp. Quality Index',
                      pct: divPercentiles.OQI,
                      color: 'bg-slate-400',
                    },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400 text-xs">{label}</span>
                        <span
                          className={`text-xs font-black ${
                            pct >= 80
                              ? 'text-emerald-400'
                              : pct >= 60
                              ? 'text-yellow-400'
                              : pct >= 40
                              ? 'text-slate-300'
                              : 'text-red-400'
                          }`}
                        >
                          {pct}th percentile
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FULL STATS TAB */}
          {scoutTab === 'stats' && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                Full Statistical Breakdown
              </p>
              <div className="grid grid-cols-3 gap-6">
                {STAT_GROUPS.map(({ title, stats }) => (
                  <div key={title}>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 pb-1.5 border-b border-slate-800">
                      {title}
                    </p>
                    <div className="space-y-2">
                      {stats.map(({ key, label, dec, signed, pct }) => {
                        const v = fighter[key];
                        const display =
                          v != null
                            ? `${signed && v >= 0 ? '+' : ''}${v.toFixed(dec)}${
                                pct ? '%' : ''
                              }`
                            : key === 'CARDIO_DECAY'
                            ? '—'
                            : '—';
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="text-slate-500 text-xs">
                              {label}
                            </span>
                            <span
                              className={`font-mono text-xs font-semibold ${
                                signed
                                  ? v > 0
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                  : key === 'CREDIBILITY'
                                  ? credColor(v)
                                  : key === 'CARDIO_DECAY'
                                  ? decayColor(v)
                                  : 'text-slate-200'
                              }`}
                            >
                              {display}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-600">
          <User size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">
            Search for an active fighter to view their full analytics profile
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Stage 5: the active screen lives in the URL, not in App state. `view` is
  // derived from location.pathname on every render via the route registry, so
  // there is exactly one source of truth and Back/Forward/refresh/deep links
  // all work without any extra synchronisation.
  //
  // App is rendered by index.js INSIDE BrowserRouter but OUTSIDE any <Route>,
  // so navigating re-renders it and never remounts it. Every piece of state
  // below (upcomingEntries, roiEntries, propPicks, parlayEntries, filters,
  // toggles) therefore survives tab changes exactly as it did when `view` was
  // local state.
  //
  // viewForPathname returns null for an unrecognised path rather than falling
  // back to 'home', which is what lets the render below tell "show Home" apart
  // from "this URL is wrong" -- see the <Navigate replace> at the end.
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const view = viewForPathname(pathname);
  const belowSm = useBelowSm();
  const [filterSince, setFilterSince] = useState('2026-05-23');
  const [modelToggle, setModelToggle] = useState('v2');
  // Local calendar date (YYYY-MM-DD), NOT UTC. toISOString() returns UTC, which
  // in timezones behind UTC rolls over to "tomorrow" during evening events and
  // wrongly filtered out the current day's still-live entries (e.g. a card on
  // 2026-07-11 vanished once UTC hit 2026-07-12). Comparison stays `>=` so
  // today's entries are included.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  // Excludes anything already graded in ROI_ENTRIES (the raw file import, not
  // derived roiEntries state -- this runs before that state exists) so a
  // stale upcomingData.js export can't resurrect a graded fight as a ghost
  // pending entry on reload. Matches by id, which buildRoiEntry/
  // handleGradeUpcoming stamp once and carry unchanged from Upcoming into
  // ROI. Composes with isUpcomingVisible rather than replacing it -- both
  // conditions must hold.
  const [upcomingEntries, setUpcomingEntries] = useState(() =>
    filterVisibleUpcoming(UPCOMING_ENTRIES, ROI_ENTRIES, today)
  );
  const [roiEntries, setRoiEntries] = useState(() => {
    const fightersByName = Object.fromEntries(FIGHTERS.map((f) => [f.FIGHTER, f]));
    return ROI_ENTRIES.map((entry) => {
      if (entry.projectedFinish !== undefined) return entry;
      const fA = fightersByName[entry.fighterA];
      const fB = fightersByName[entry.fighterB];
      if (!fA || !fB) return entry;
      const probs = computeFinishProbs(fA, fB);
      return {
        ...entry,
        projectedKO: probs.ko,
        projectedSUB: probs.sub,
        projectedDEC: probs.dec,
        projectedFinish: getProjectedFinishLabel(probs),
        actualFinish: entry.actualFinish ?? '',
      };
    });
  });

  const fightersWithProspectsFiltered = useMemo(() => FIGHTERS, []);

  const prospectNameSet = useMemo(
    () =>
      new Set(
        fightersWithProspectsFiltered
          .filter((f) => f.IS_PROSPECT)
          .map((f) => f.FIGHTER)
      ),
    [fightersWithProspectsFiltered]
  );

  const roiSummary = useMemo(
    () => computeROISummary(roiEntries, prospectNameSet),
    [roiEntries, prospectNameSet]
  );

  const handleSavePrediction = (entry) => {
    setRoiEntries((prev) => [entry, ...prev]);
  };

  const handleUpdateROIEntry = (id, patch) => {
    setRoiEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
    );
  };

  const handleDeleteROIEntry = (id) => {
    setRoiEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleClearROI = () => {
    setRoiEntries([]);
  };

  // Isolated Props state -- entirely separate from roiEntries/upcomingEntries,
  // never read by or merged into any model-related computation.
  const [propPicks, setPropPicks] = useState(PROP_PICKS);

  const handleAddPropPick = (pick) => {
    setPropPicks((prev) => [pick, ...prev]);
  };

  const handleGradePropPick = (id, result) => {
    setPropPicks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, result } : p))
    );
  };

  const handleDeletePropPick = (id) => {
    setPropPicks((prev) => prev.filter((p) => p.id !== id));
  };

  // Isolated Parlay state -- entirely separate from roiEntries/upcomingEntries/
  // propPicks, never read by or merged into any model-related computation.
  // Grading (added in a later commit) will read roiEntries read-only to
  // resolve each leg's actual winner; it will never write parlay data back
  // into roiEntries/upcomingEntries.
  const [parlayEntries, setParlayEntries] = useState(PARLAY_ENTRIES);

  const handleAddParlay = (parlay) => {
    setParlayEntries((prev) => [parlay, ...prev]);
  };

  const handleUpdateParlay = (id, patch) => {
    setParlayEntries((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const handleDeleteParlay = (id) => {
    setParlayEntries((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveToUpcoming = (entry) => {
    setUpcomingEntries((prev) => addPendingEntry(prev, entry));
  };

  const handleSaveToUpcomingAndOpen = (entry) => {
    handleSaveToUpcoming(entry);
    // Programmatic navigation (this is a side effect of saving, not a link the
    // user clicked). Pushes, so Back returns to the Simulator.
    navigate(pathForView('upcoming'));
  };

  const handleGradeUpcoming = (id, actualWinner) => {
    const entry = upcomingEntries.find((e) => e.id === id);
    if (!entry) return;
    setRoiEntries((prev) => [createGradedEntry(entry, actualWinner), ...prev]);
    setUpcomingEntries((prev) => removePendingEntry(prev, id));
  };

  const handleDeleteUpcoming = (id) => {
    setUpcomingEntries((prev) => removePendingEntry(prev, id));
  };

  const handleUpdateUpcomingEntry = (id, patch) => {
    setUpcomingEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
    );
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-[calc(64px+env(safe-area-inset-bottom))] sm:pb-0"
    >
      <Header view={view} />
      {belowSm && <BottomNav view={view} />}
      {/*
        Unknown path: replace rather than push, so a mistyped URL does not leave
        a dead entry in history that Back would land on again. Rendered as an
        element (not an effect) so it is declarative and runs after the chrome
        above has already mounted -- Header and BottomNav stay on screen through
        the redirect instead of flashing an empty page.
      */}
      {view === null && <Navigate to={HOME_PATH} replace />}
      {view === 'home' && (
        <HomeTab summary={roiSummary} entries={roiEntries} allFighters={fightersWithProspectsFiltered} filterSince={filterSince} />
      )}
      {view === 'simulator' && (
        <MatchupSimulator
          allFighters={fightersWithProspectsFiltered}
          onSaveToUpcoming={handleSaveToUpcoming}
          onSaveToUpcomingAndOpen={handleSaveToUpcomingAndOpen}
        />
      )}
      {view === 'upcoming' && (
        <UpcomingEventTab
          entries={upcomingEntries}
          onGrade={handleGradeUpcoming}
          onDelete={handleDeleteUpcoming}
          onUpdateEntry={handleUpdateUpcomingEntry}
          modelToggle={modelToggle}
          setModelToggle={setModelToggle}
          allFighters={fightersWithProspectsFiltered}
          propPicks={propPicks}
          onAddPropPick={handleAddPropPick}
          onGradePropPick={handleGradePropPick}
          onDeletePropPick={handleDeletePropPick}
          onAddParlay={handleAddParlay}
          parlayEntries={parlayEntries}
          roiEntries={roiEntries}
          onDeleteParlay={handleDeleteParlay}
        />
      )}
      {view === 'explore' && <ExploreTab allFighters={fightersWithProspectsFiltered} />}
      {view === 'roi' && (
        <ROITab
          entries={roiEntries}
          summary={roiSummary}
          prospectNameSet={prospectNameSet}
          onUpdateEntry={handleUpdateROIEntry}
          onDeleteEntry={handleDeleteROIEntry}
          onClearEntries={handleClearROI}
          allFighters={fightersWithProspectsFiltered}
          filterSince={filterSince}
          setFilterSince={setFilterSince}
          propPicks={propPicks}
          onGradePropPick={handleGradePropPick}
          onDeletePropPick={handleDeletePropPick}
          parlayEntries={parlayEntries}
          onDeleteParlay={handleDeleteParlay}
        />
      )}
      {view === 'statistics' && (
        <StatisticsTab
          entries={roiEntries}
          prospectNameSet={prospectNameSet}
          filterSince={filterSince}
          setFilterSince={setFilterSince}
          propPicks={propPicks}
          parlayEntries={parlayEntries}
        />
      )}
      {view === 'info' && <InfoTab />}
    </div>
  );
}

const betTier = (action) => {
  if (action === 'STRONG BET')
    return { label: 'STRONG BET', cls: 'text-emerald-300 font-bold', border: 'border-emerald-600/60' };
  if (action === 'BET')
    return { label: 'BET', cls: 'text-emerald-400', border: 'border-emerald-700/50' };
  if (action === 'LEAN')
    return { label: 'LEAN', cls: 'text-yellow-400', border: 'border-yellow-700/50' };
  return { label: '', cls: 'text-slate-500', border: 'border-slate-800' };
};

function HomeTab({ summary, entries, allFighters, filterSince }) {
  const fighterMap = useMemo(() => {
    const m = new Map();
    (allFighters ?? []).forEach((f) => m.set(f.FIGHTER, f));
    return m;
  }, [allFighters]);

  const sortedNonProspect = useMemo(
    () =>
      [...entries]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter((e) => !e.includesProspect),
    [entries]
  );

  const gradedPicks = useMemo(
    () =>
      sortedNonProspect
        .filter(
          (e) =>
            e.actualWinner === e.fighterA || e.actualWinner === e.fighterB
        )
        .slice(0, 5),
    [sortedNonProspect]
  );

  const upcomingPicks = useMemo(
    () =>
      sortedNonProspect
        .filter((e) => !e.actualWinner || e.actualWinner === '')
        .slice(0, 3),
    [sortedNonProspect]
  );

  // LIVE recompute -- correct here, unlike the graded path below: these fights
  // haven't happened, so there's no outcome for current fighter data to leak.
  // Scoped to upcomingPicks only (the 3 entries actually rendered), not the
  // full ledger -- no reason to live-recompute historical/graded entries that
  // are no longer looked up against this map.
  const v2PickMap = useMemo(() => {
    const map = new Map();
    upcomingPicks.forEach((entry) => {
      const fA = fighterMap.get(entry.fighterA);
      const fB = fighterMap.get(entry.fighterB);
      if (!fA || !fB) return;
      // Upcoming fights: the entry's own eventDate ages both fighters forward
      // to fight night rather than scoring them at today's age.
      const res = computeMatchupEdges(fA, fB, {
        eventDate: entry.eventDate,
      });
      map.set(entry.id, {
        winner: res.v2pA >= res.v2pB ? entry.fighterA : entry.fighterB,
        prob: Math.max(res.v2pA, res.v2pB),
      });
    });
    return map;
  }, [upcomingPicks, fighterMap]);

  // FROZEN -- graded/historical entries read their own stored v2pA/v2pB,
  // never computeMatchupEdges. Same reasoning as the Statistics tab fix:
  // current fighter data now runs past every graded fight's own date, so a
  // live recompute reads each fight's own outcome as an input.
  const gradedV2Frozen = (e) => {
    if (e.v2pA == null || e.v2pB == null) return null;
    return {
      winner: e.v2pA >= e.v2pB ? e.fighterA : e.fighterB,
      prob: Math.max(e.v2pA, e.v2pB),
    };
  };

  const may23Entries = useMemo(
    () => sortedNonProspect.filter((e) => (e.eventDate || '') >= (filterSince || '2026-05-23')),
    [sortedNonProspect, filterSince]
  );

  const may23Graded = useMemo(
    () => may23Entries.filter((e) => e.actualWinner === e.fighterA || e.actualWinner === e.fighterB),
    [may23Entries]
  );

  // v1 is already frozen (predictedWinner is stored at save time, never
  // recomputed) -- left byte-identical to before.
  const v1Acc = useMemo(() => {
    if (may23Graded.length === 0) return null;
    const v1Correct = may23Graded.filter((e) => e.predictedWinner === e.actualWinner).length;
    return (v1Correct / may23Graded.length) * 100;
  }, [may23Graded]);

  // Single v2 hero (2026-07-21): `summaryV2All`, reusing the same
  // computeV2Summary the Statistics tab uses, is the one number rendered --
  // frozen scoring across every graded fight in the filtered window. Moves
  // with the SINCE filter and reconciles with Statistics' monthly table.
  // `summaryV2Live` (live-captured-only subset) is kept computed but no
  // longer rendered on Home either -- restore the split if needed later.
  const may23LiveEntries = useMemo(
    () => may23Entries.filter((e) => e._provenance?.captureMode === 'live'),
    [may23Entries]
  );
  const summaryV2Live = useMemo(() => computeV2Summary(may23LiveEntries), [may23LiveEntries]);
  const summaryV2All = useMemo(() => computeV2Summary(may23Entries), [may23Entries]);

  const getOutcome = (e) => {
    if (!e.actualWinner || e.actualWinner === '') return 'pending';
    if (isPushResult(e.actualWinner)) return 'push';
    if (e.actualWinner === e.fighterA || e.actualWinner === e.fighterB) {
      const frozen = gradedV2Frozen(e);
      const effectiveWinner = frozen ? frozen.winner : e.predictedWinner;
      return effectiveWinner === e.actualWinner ? 'correct' : 'incorrect';
    }
    return 'pending';
  };


  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Identity */}
      <div className="mb-8">
        <h2 className="text-white font-black text-3xl tracking-tight mb-1">
          FightMetrics
        </h2>
        <p className="text-slate-400 text-base">
          UFC fight prediction engine — {MODEL_VERSION}
        </p>
      </div>

      {/* Track record tiles */}
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
        Model Track Record
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">
            Pick Accuracy
          </p>
          {summaryV2All.graded > 0 ? (
            <>
              <p className={`font-black text-3xl ${summaryV2All.accuracy >= 60 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {summaryV2All.accuracy.toFixed(1)}%
              </p>
              <p className="text-slate-500 text-xs mt-1">
                v2 frozen scoring across {summaryV2All.graded} graded fights · {filterSince ? `since ${filterSince}` : 'all time'}
              </p>
              {/* v1 display hidden 2026-07-21 per single-model view -- restore
                  by re-adding: {v1Acc != null && <p>v1: {v1Acc.toFixed(1)}%</p>} */}
            </>
          ) : (
            <p className="text-slate-600 text-sm mt-1">No graded picks</p>
          )}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">
            ROI
          </p>
          <p className={`font-black text-3xl ${summaryV2All.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {summaryV2All.roi >= 0 ? '+' : ''}{summaryV2All.roi.toFixed(1)}%
          </p>
          <p className="text-slate-600 text-xs mt-1">
            {summaryV2All.profit >= 0 ? '+' : ''}{summaryV2All.profit.toFixed(2)}u on {summaryV2All.bets} bets (stake-weighted)
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">
            Tracked Fights
          </p>
          <p className="font-black text-3xl text-white">{may23Entries.length}</p>
          <p className="text-slate-600 text-xs mt-1">{filterSince ? `since ${filterSince}` : 'all time'}</p>
        </div>
      </div>

      {/* Recent graded results */}
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
        Recent Results
      </p>
      <div className="space-y-2 mb-6">
        {gradedPicks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-6 text-center">
            <p className="text-slate-600 text-sm">
              No graded picks yet — results appear here after fights are scored.
            </p>
          </div>
        ) : (
          gradedPicks.map((e) => {
            const outcome = getOutcome(e);
            const tier = betTier(e.betAction ?? 'NO BET');
            const frozenV2 = gradedV2Frozen(e);
            const accentBorder =
              outcome === 'correct' ? 'border-l-emerald-600' :
              outcome === 'incorrect' ? 'border-l-red-700' :
              'border-l-slate-700';
            return (
              <div
                key={e.id}
                className={`bg-slate-900 border ${tier.border} border-l-4 ${accentBorder} rounded-xl px-5 py-4`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {e.fighterA} vs {e.fighterB}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {e.eventName}
                      {e.division ? ` · ${e.division}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {outcome === 'correct' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/40 text-emerald-400 text-xs font-bold">
                        ✓ CORRECT
                      </span>
                    )}
                    {outcome === 'incorrect' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-900/40 text-red-400 text-xs font-bold">
                        ✗ INCORRECT
                      </span>
                    )}
                    {outcome === 'push' && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold">
                        — NC/DRAW
                      </span>
                    )}
                  </div>
                </div>
                {frozenV2 ? (
                  <p className="text-xs mt-1">
                    <span className="text-violet-400 font-bold text-[10px] mr-1.5">v2</span>
                    <span className="text-sm font-semibold text-white">
                      {frozenV2.winner}
                    </span>
                    <span className="text-slate-500 text-xs ml-1.5">{(frozenV2.prob * 100).toFixed(1)}%</span>
                    {tier.label && <span className={`${tier.cls} ml-1.5`}>{tier.label}</span>}
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 mt-1">
                    No frozen v2 prediction recorded
                    {tier.label && (
                      <>{' · '}<span className={tier.cls}>{tier.label}</span></>
                    )}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Upcoming picks — secondary, muted */}
      {upcomingPicks.length > 0 && (
        <div className="mb-8">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
            Upcoming Picks
          </p>
          <div className="space-y-1">
            {upcomingPicks.map((e) => {
              const tier = betTier(e.betAction ?? 'NO BET');
              const v2Pick = v2PickMap.get(e.id);
              const v2Differs = v2Pick && v2Pick.winner !== e.predictedWinner;
              return (
                <div
                  key={e.id}
                  className={`px-4 py-3 bg-slate-900/60 border ${tier.border} border-l-4 border-l-slate-700 rounded-lg flex items-center justify-between gap-4`}
                >
                  <div className="min-w-0">
                    <p className="text-slate-300 text-xs font-semibold truncate">
                      {e.fighterA} vs {e.fighterB}
                    </p>
                    {v2Pick && (
                      <p className="text-xs mt-0.5 flex items-center gap-2">
                        <span className="inline-block text-[9px] font-black bg-violet-900/40 border border-violet-700/40 text-violet-400 px-1.5 py-0.5 rounded-full">v2</span>
                        <span className={`text-sm font-bold ${v2Differs ? 'text-amber-400' : 'text-slate-300'}`}>
                          {v2Pick.winner}
                        </span>
                        <span className="text-slate-500 text-xs">{(v2Pick.prob * 100).toFixed(1)}%</span>
                        {tier.label && <span className={tier.cls}>{tier.label}</span>}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {e.eventName ? `${e.eventName} · ` : ''}was: {e.predictedWinner} {(e.predictedProb * 100).toFixed(1)}%
                      {!v2Pick && tier.label && (
                        <>{' · '}<span className={tier.cls}>{tier.label}</span></>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-slate-600 text-xs font-semibold">
                    PENDING
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTAs */}
      {/*
        Real links, so they can be opened in a new tab and are announced as
        links. `flex items-center justify-center` replaces the UA button
        behaviour these relied on and is required for pixel parity, not taste:

          horizontally - a <button> centres its label by default, a block <a>
                         left-aligns it;
          vertically   - these two CTAs are flex siblings with `align-items:
                         stretch`, and the bordered one is 2px taller, so both
                         stretch to 46px. That leaves a 22px content box around
                         a 20px line box. A <button> centres its anonymous
                         content block in that space; a block <a> does not, so
                         the label rendered exactly 1px high.

        Measured, not guessed: text y was 993 as a button and 992 as a plain
        block anchor, which the screenshot diff caught as 640 changed pixels
        confined to the glyphs. With flex centring it is 993 again and the
        Home screens match the Stage 1b reference exactly.

        Every other control converted in this commit already used flex, which
        is why only these two needed anything.
      */}
      <div className="flex gap-3">
        <Link
          to={pathForView('simulator')}
          className="flex-1 py-3 flex items-center justify-center rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-900/30"
        >
          Build a Matchup →
        </Link>
        <Link
          to={pathForView('roi')}
          className="flex-1 py-3 flex items-center justify-center rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:text-white hover:border-slate-500 transition-colors"
        >
          Full Track Record →
        </Link>
      </div>
    </div>
  );
}

function ExploreTab({ allFighters }) {
  const [exploreTab, setExploreTab] = useState('table');
  const [wc, setWC] = useState('All Divisions');
  const [minMin, setMinMin] = useState(0);

  const filtered = useMemo(
    () =>
      FIGHTERS.filter(
        (f) =>
          (wc === 'All Divisions' ||
            wc === 'Pound-for-Pound' ||
            f.WEIGHT_CLASS === wc) &&
          (f.TOTAL_ROUNDS ?? 0) >= minMin
      ),
    [wc, minMin]
  );

  return (
    <div>
      <div className="bg-slate-900/80 border-b border-slate-800 px-5 py-2 flex gap-1">
        {[
          { id: 'table', label: 'Database' },
          { id: 'scout', label: 'Scout' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setExploreTab(id)}
            className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              exploreTab === id
                ? 'bg-slate-700 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {exploreTab === 'table' && (
        <Filters
          wc={wc}
          setWC={setWC}
          minMin={minMin}
          setMinMin={setMinMin}
          count={filtered.length}
        />
      )}
      {exploreTab === 'table' && <DataTable fighters={filtered} />}
      {exploreTab === 'scout' && <ScoutProfile allFighters={allFighters} />}
    </div>
  );
}

function ROITab({
  entries,
  summary,
  prospectNameSet,
  onUpdateEntry,
  onDeleteEntry,
  onClearEntries,
  allFighters,
  filterSince,
  setFilterSince,
  propPicks,
  onGradePropPick,
  onDeletePropPick,
  parlayEntries,
  onDeleteParlay,
}) {
  const exportedCode = `export const ROI_ENTRIES = ${JSON.stringify(
    entries,
    null,
    2
  )};\n`;
  // Mirrors exportedCode above, but serializes the live propPicks state (the
  // same state onGradePropPick/onAddPropPick mutate) rather than roiEntries --
  // props stay isolated from ROI_ENTRIES even in the export path.
  const propsExportedCode = buildPropsExportedCode(propPicks);
  // Same pattern for parlays -- serializes the FULL live parlayEntries state
  // (pending + graded, unfiltered), matching parlayData.js's shape exactly.
  const parlayExportedCode = buildParlayExportedCode(parlayEntries);
  const evaluatedEntries = useMemo(
    () =>
      entries.map((entry) => {
        const resolvedIncludesProspect =
          entry.includesProspect != null
            ? entry.includesProspect
            : entry.fighterAIsProspect != null
            ? entry.fighterAIsProspect
            : entry.fighterBIsProspect != null
            ? entry.fighterBIsProspect
            : prospectNameSet.has(entry.fighterA) ||
              prospectNameSet.has(entry.fighterB);

        return {
          ...entry,
          includesProspect: resolvedIncludesProspect,
          displayWinner: entry.predictedWinner,
          displayProb: entry.predictedProb ?? 0,
          displayTrackedProb:
            entry.trackedProb ??
            (entry.trackedSide === entry.fighterA
              ? entry.fighterAProb
              : entry.fighterBProb),
          displayEdge:
            entry.trackedSide === entry.fighterA
              ? entry.edgeA ?? entry.edge
              : entry.edgeB ?? entry.edge,
          displayBetAction: entry.betAction ?? 'NO BET',
          displayBetFighter:
            entry.betRecommendedFighter ??
            (entry.bestBet === 'A'
              ? entry.fighterA
              : entry.bestBet === 'B'
              ? entry.fighterB
              : ''),
          displayBetOdds: entry.betRecommendedOdds ?? '',
        };
      }),
    [entries, prospectNameSet]
  );

  const displayedEntries = useMemo(() => {
    let entries = evaluatedEntries.filter((e) => !e.includesProspect);
    if (filterSince) {
      entries = entries.filter((e) => (e.eventDate || '') >= filterSince);
    }
    return entries;
  }, [evaluatedEntries, filterSince]);

  // Top-of-tab stats banner -- same population and same two summary
  // functions StatisticsTab's headline cards use (filterRoiEntriesForStats ->
  // computeROISummary for Tracked Fights/Graded Picks, computeV2Summary for
  // Pick Accuracy/ROI), called on the SAME raw `entries` + `filterSince`
  // StatisticsTab receives. No parallel scoring math -- this is the same
  // call, just made from ROITab too, so the two tabs can never drift.
  const roiStatsEntries = useMemo(
    () => filterRoiEntriesForStats(entries, prospectNameSet, filterSince),
    [entries, prospectNameSet, filterSince]
  );
  const roiBannerV1 = useMemo(() => computeROISummary(roiStatsEntries, new Set()), [roiStatsEntries]);
  const roiBannerV2 = useMemo(() => computeV2Summary(roiStatsEntries), [roiStatsEntries]);

  const [modelView, setModelView] = useState('v2');
  // Sub-tabs replace the former "Most Recent Event / All Results" toggle:
  //   'all'    -> collapsible per-event groups (former "All Results")
  //   'recent' -> most-recent-graded-event only (former "Most Recent Event")
  //   'props'  -> the isolated Prop Bets table (PROP_PICKS; no model data)
  //   'parlays' -> the isolated Parlays panel (parlayEntries; reads roiEntries
  //     read-only via computeParlayResult, but is otherwise physically
  //     separate from every model/Statistics computation, same as 'props')
  // The two model sub-tabs behave exactly as the old toggle did; 'props' and
  // 'parlays' are physically separate panels that never call
  // computeV2Summary/computeV2FrozenRows/filterRoiEntriesForStats/
  // computeROISummary.
  const [subTab, setSubTab] = useState('all');
  const isProps = subTab === 'props';
  const isParlays = subTab === 'parlays';
  const resultsView = subTab === 'recent' ? 'recent' : 'all';
  const latestGradedEventName = useMemo(() => {
    const graded = displayedEntries.filter((e) => isResolvedWinner(e.actualWinner, e));
    if (!graded.length) return null;
    return graded.reduce((latest, e) =>
      !latest || (e.eventDate || '') > (latest.eventDate || '') ? e : latest
    , null)?.eventName ?? null;
  }, [displayedEntries]);
  const visibleEntries = useMemo(() => {
    if (resultsView !== 'recent' || !latestGradedEventName) return displayedEntries;
    return displayedEntries.filter((e) => e.eventName === latestGradedEventName);
  }, [displayedEntries, resultsView, latestGradedEventName]);

  // Group the (already Since- and resultsView-filtered) visibleEntries by event,
  // most recent first. Pure container/grouping over the SAME entries -- the
  // per-fight cards inside each group are rendered unchanged.
  const eventGroups = useMemo(() => {
    const byKey = new Map();
    const order = [];
    visibleEntries.forEach((entry) => {
      const eventName = entry.eventName || 'Untitled Event';
      const eventDate = entry.eventDate || '';
      const key = `${eventName}||${eventDate}`;
      if (!byKey.has(key)) {
        byKey.set(key, { key, eventName, eventDate, entries: [] });
        order.push(key);
      }
      byKey.get(key).entries.push(entry);
    });
    return order
      .map((key, i) => ({ ...byKey.get(key), _i: i }))
      .sort((a, b) => {
        // dated events newest-first; undated events sink to the bottom;
        // ties broken by first-appearance order (stable).
        if (a.eventDate && b.eventDate) {
          if (a.eventDate !== b.eventDate) return a.eventDate < b.eventDate ? 1 : -1;
          return a._i - b._i;
        }
        if (a.eventDate) return -1;
        if (b.eventDate) return 1;
        return a._i - b._i;
      });
  }, [visibleEntries]);

  // Per-event ROI for the accordion headers -- same computeV2Summary call as
  // the top banner and StatisticsTab, just scoped to one event's entries
  // instead of the whole Since-filtered window. Fights only: group.entries
  // comes from visibleEntries, which is never mixed with propPicks/
  // parlayEntries. bets===0 (no v2-scored, gradable entries in this event)
  // is the "—" case, not 0.0%/+0.00u -- an event can have zero v2-scored
  // entries (see v2ScoredFloorDate in StatisticsTab) without being empty.
  const eventV2Summaries = useMemo(() => {
    const map = new Map();
    eventGroups.forEach((group) => {
      map.set(group.key, computeV2Summary(group.entries));
    });
    return map;
  }, [eventGroups]);

  // Collapsible groups: default = most-recent event expanded, others collapsed.
  // `expandedEvents` is null until the user first toggles; after that it's an
  // explicit Set of open event keys (seeded from the default).
  const [expandedEvents, setExpandedEvents] = useState(null);
  const defaultOpenKey = eventGroups.length ? eventGroups[0].key : null;
  const isEventOpen = (key) =>
    expandedEvents ? expandedEvents.has(key) : key === defaultOpenKey;
  const toggleEvent = (key) => {
    setExpandedEvents((prev) => {
      const base = prev ?? new Set(defaultOpenKey ? [defaultOpenKey] : []);
      const next = new Set(base);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const fighterMap = useMemo(() => {
    const m = new Map();
    (allFighters ?? []).forEach((f) => m.set(f.FIGHTER, f));
    return m;
  }, [allFighters]);

  // FROZEN (2026-07-22 fix): primary path reads the entry's OWN stored
  // v2pA/v2pB/betAction/edgeA/edgeB/betRecommendedFighter -- the values
  // buildRoiEntry computed and saved at save time -- instead of recomputing
  // via computeMatchupEdges + re-running the bet-tier gate against CURRENT
  // odds/fighter credibility. This is the ROI tab's per-entry "v2 mode"
  // display, which drives effectiveTrackedSide/effectiveProfit and the
  // Correct/Incorrect badge below (~line 10060) for GRADED, historical
  // fights -- before this fix, a graded fight's win/loss label could flip
  // retroactively if fighter data changed after the fight. Reading the
  // frozen pick makes that label permanent, as it should be.
  //
  // v2BetAction/v2Edge/v2BetFighter inherit the same mixed-provenance
  // caveat already documented on computeBetTierBreakdown (~App.js:1533):
  // entry.betAction/edgeA/edgeB reflect whichever model was ACTIVE at save
  // time (v1 or v2, per that save's modelToggle), not necessarily a v2-
  // specific gate decision on reconstructed/pre-modelUsed rows. That's an
  // accepted, already-documented characteristic of frozen data elsewhere in
  // this file -- not a new gap introduced here.
  //
  // computeMatchupEdges is called ONLY as a legacy fallback for entries
  // saved before v2pA/v2pB existed (entry.v2pA == null). The "0 of 146 current
  // entries hit that path" note was already wrong -- a large share of the
  // entries in roiData.js have no stored v2pA and DO take it. No replacement
  // count is recorded, because a number baked into a comment cannot be kept
  // honest; the guarantee that matters is structural and unchanged -- an entry
  // WITH a stored v2pA is never recomputed.
  //
  // The fallback now passes the entry's own eventDate, so a reconstructed
  // legacy pick uses fight-night ages instead of today's.
  const v2DataMap = useMemo(() => {
    const map = new Map();
    evaluatedEntries
      .filter((e) => !e.includesProspect)
      .forEach((entry) => {
        const needsV2 = modelView === 'v2';
        if (!needsV2) return;

        if (entry.v2pA == null) {
          // Legacy fallback only -- see FROZEN comment above.
          const fA = fighterMap.get(entry.fighterA);
          const fB = fighterMap.get(entry.fighterB);
          if (!fA || !fB) return;

          // Legacy fallback for pre-v2pA entries -- see the FROZEN comment
          // above. Passing eventDate reconstructs the pick with fight-night
          // ages, which is what buildRoiEntry would have frozen at save time.
          const res = computeMatchupEdges(fA, fB, {
            eventDate: entry.eventDate,
          });
          const v2pA = res.v2pA;
          const v2pB = res.v2pB;
          const v2Winner = v2pA >= v2pB ? entry.fighterA : entry.fighterB;
          const v2WinProb = Math.max(v2pA, v2pB);
          const v2FairLine = americanOdds(v2pA >= v2pB ? v2pA : v2pB);

          const rawA = parseAmericanOdds(entry.oddsA);
          const rawB = parseAmericanOdds(entry.oddsB);
          let v2Edge = null;
          let v2BetAction = 'NO BET';
          let v2BetFighter = '';

          if (rawA && rawB) {
            const { noVigA, noVigB } = stripVig(rawA, rawB);
            const edgeA = v2pA - noVigA;
            const edgeB = v2pB - noVigB;
            const pickSide = v2pA >= 0.5 ? 'A' : 'B';
            const pickEdge = pickSide === 'A' ? edgeA : edgeB;
            const oppEdge = pickSide === 'A' ? edgeB : edgeA;
            const pickProb = pickSide === 'A' ? v2pA : v2pB;
            const pickRawOdds = pickSide === 'A' ? rawA : rawB;
            v2Edge = pickEdge;

            const hasPickEdge = pickEdge >= 0.03;
            const conflictingSignals = !hasPickEdge && oppEdge >= 0.03;
            let action = 'NO BET';
            if (!conflictingSignals && hasPickEdge) {
              if (pickProb >= 0.70) {
                if (pickEdge >= 0.25) action = 'STRONG BET';
                else if (pickEdge >= 0.15) action = 'BET';
                else action = 'LEAN';
              } else if (pickProb >= 0.65) {
                if (pickEdge >= 0.30) action = 'BET';
                else if (pickEdge >= 0.10) action = 'LEAN';
              } else if (pickProb >= 0.60) {
                if (pickEdge >= 0.10) action = 'LEAN';
              }
            }
            const lowCredCap =
              (fA.CREDIBILITY ?? 0) < 30 || (fB.CREDIBILITY ?? 0) < 30;
            if (lowCredCap && (action === 'STRONG BET' || action === 'BET'))
              action = 'LEAN';
            if (pickRawOdds > 2 / 3 && pickEdge < 0.25 && action !== 'NO BET')
              action = 'NO BET';

            v2BetAction = action;
            v2BetFighter =
              action !== 'NO BET'
                ? pickSide === 'A'
                  ? entry.fighterA
                  : entry.fighterB
                : '';
          }

          map.set(entry.id, {
            v2Winner,
            v2WinProb,
            v2FairLine,
            v2Edge,
            v2BetAction,
            v2BetFighter,
          });
          return;
        }

        // Primary: frozen values stored on the entry at save time.
        const v2pA = entry.v2pA;
        const v2pB = entry.v2pB;
        const v2Winner = v2pA >= v2pB ? entry.fighterA : entry.fighterB;
        const v2WinProb = Math.max(v2pA, v2pB);
        const v2FairLine = americanOdds(v2WinProb);
        const v2Edge = (v2pA >= v2pB ? entry.edgeA : entry.edgeB) ?? null;
        const v2BetAction = entry.betAction ?? 'NO BET';
        const v2BetFighter = entry.betRecommendedFighter || '';

        map.set(entry.id, {
          v2Winner,
          v2WinProb,
          v2FairLine,
          v2Edge,
          v2BetAction,
          v2BetFighter,
        });
      });
    return map;
  }, [evaluatedEntries, modelView, fighterMap]);

  const finishStats = useMemo(() => {
    const graded = displayedEntries.filter((e) => e.actualFinish && e.actualFinish !== '');
    const correct = graded.filter((e) => {
      if (!e.projectedFinish) return false;
      if (e.projectedFinish.includes(' / ')) {
        return e.projectedFinish.split(' / ').includes(e.actualFinish);
      }
      return e.actualFinish === e.projectedFinish;
    });
    return {
      graded: graded.length,
      correct: correct.length,
      accuracy: graded.length > 0 ? (correct.length / graded.length) * 100 : 0,
    };
  }, [displayedEntries]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white font-black text-xl mb-1">ROI</h2>
          <p className="text-slate-400 text-sm">
            Save simulator picks, grade them after the event, and track
            profit plus pick accuracy.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {!isProps && !isParlays && (
            <>
            {/* Ungated on entries.length -- an empty array is still a valid,
                meaningful export (a fully-cleared ROI history), and hiding
                the button once the last entry left made a clean roiData.js
                impossible to produce. Confirm All / Clear All stay gated
                below -- both are meaningless with zero entries. */}
            <button
              onClick={() => navigator.clipboard.writeText(exportedCode)}
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
            >
              Copy Updated roiData.js
            </button>

            {entries.length > 0 && (
              <>
              {displayedEntries.some((e) => e.autoGenerated && e.confirmedByUser === false) && (
                <button
                  onClick={() =>
                    displayedEntries
                      .filter((e) => e.autoGenerated && e.confirmedByUser === false)
                      .forEach((e) => onUpdateEntry(e.id, { confirmedByUser: true }))
                  }
                  className="px-3 py-2 rounded-lg border border-blue-700 text-blue-300 text-xs font-semibold hover:text-white hover:border-blue-500 transition-colors"
                >
                  Confirm All
                </button>
              )}

              {/* v1 toggle hidden 2026-07-22 per single-model view (v2 only) --
                  restore by re-adding the ['v1','v2'] button block that used to
                  sit here (called setModelView(view)). modelView stays 'v2' by
                  default with setModelView never called, so every
                  modelView==='v1' branch below (inV2Mode ternary, eff* derivations)
                  is intact but unreachable. */}

              <button
                onClick={() => {
                  const count = entries.length;
                  const step1 = window.confirm(
                    `Clear ALL ${count} ROI ${count === 1 ? 'entry' : 'entries'}?\n\nThis permanently deletes your entire graded bet history — every tracked pick, all P&L, everything.\n\nThis is NOT recoverable unless you've already run "Copy Updated roiData.js" and saved the result somewhere.\n\nClick OK to continue to the final confirmation.`
                  );
                  if (!step1) return;
                  const typed = window.prompt(
                    `Type ${count} to permanently delete all ${count} ${count === 1 ? 'entry' : 'entries'}:`
                  );
                  if (typed === null) return;
                  if (typed.trim() !== String(count)) {
                    window.alert("That didn't match — nothing was deleted.");
                    return;
                  }
                  onClearEntries();
                }}
                className="px-3 py-2 rounded-lg border border-slate-700 text-slate-400 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
              >
                Clear All
              </button>
              </>
            )}
            </>
          )}
          {isProps && (
            <button
              onClick={() => navigator.clipboard.writeText(propsExportedCode)}
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
            >
              Copy Updated propPicksData.js
            </button>
          )}
          {isParlays && (
            <button
              onClick={() => navigator.clipboard.writeText(parlayExportedCode)}
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
            >
              Copy Updated parlayData.js
            </button>
          )}
        </div>
      </div>

      {entries.length > 0 && !isProps && !isParlays && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Since</span>
          <input
            type="date"
            value={filterSince}
            onChange={e => setFilterSince(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 min-h-[44px] sm:min-h-0 sm:h-9 focus:outline-hidden focus:border-red-500"
          />
          {filterSince && (
            <button
              onClick={() => setFilterSince('')}
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-slate-500 hover:text-slate-300 text-xs underline"
            >
              Clear
            </button>
          )}
          {filterSince && (
            <span className="text-slate-600 text-xs">
              {displayedEntries.length} fights
            </span>
          )}
        </div>
      )}

      {/* Same four cards, same classes, as StatisticsTab's headline banner --
          fights-only (props/parlays hidden here exactly like the Since
          filter above), so it's hidden on those two sub-tabs rather than
          showing numbers that don't describe what's on screen. */}
      {entries.length > 0 && !isProps && !isParlays && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-stretch">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Tracked Fights</p>
            <p className="font-black text-2xl mt-2 text-white">{roiBannerV1.total}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Graded Picks</p>
            <p className="font-black text-2xl mt-2 text-blue-400">{roiBannerV1.graded}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Pick Accuracy</p>
            <p className={`font-black text-2xl mt-2 ${roiBannerV2.accuracy >= 60 ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {roiBannerV2.accuracy.toFixed(1)}%
            </p>
            <p className="text-slate-600 text-[10px] mt-1">
              v2 frozen scoring across {roiBannerV2.graded} graded fights (stake-weighted). Frozen at each pick's capture — no lookahead.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">ROI</p>
            <p className={`font-black text-2xl mt-2 ${roiBannerV2.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {roiBannerV2.roi >= 0 ? '+' : ''}{roiBannerV2.roi.toFixed(1)}%
            </p>
            <p className="text-slate-600 text-xs mt-1">
              {roiBannerV2.profit >= 0 ? '+' : ''}{roiBannerV2.profit.toFixed(2)}u on {roiBannerV2.bets} bets (stake-weighted)
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center flex-wrap gap-1 bg-slate-800 rounded-lg p-1 mb-4 w-fit">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'recent', label: 'Most Recent Event' },
          { id: 'props', label: 'Prop Bets' },
          { id: 'parlays', label: 'Parlays' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              subTab === id
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isProps ? (
        <PropBetsPanel
          picks={propPicks.filter((p) => p.result !== 'PENDING')}
          onGrade={onGradePropPick}
          onDelete={onDeletePropPick}
        />
      ) : isParlays ? (
        <ParlaysPanel
          parlayEntries={parlayEntries.filter((p) => computeParlayResult(p, entries).status === 'GRADED')}
          roiEntries={entries}
          onDelete={onDeleteParlay}
        />
      ) : entries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
          <Calendar size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No saved predictions yet.</p>
          <p className="text-xs mt-1">
            Build a matchup in the Simulator and use Save Prediction to send it
            here.
          </p>
        </div>
      ) : visibleEntries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
          <p className="text-sm">No graded results yet to show as "Most Recent Event".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventGroups.map((group) => {
            const open = isEventOpen(group.key);
            const eventSummary = eventV2Summaries.get(group.key);
            const eventHasV2Bets = Boolean(eventSummary && eventSummary.bets > 0);
            return (
              <div
                key={group.key}
                className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleEvent(group.key)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {open ? (
                      <ChevronDown size={18} className="text-slate-500 shrink-0" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-500 shrink-0" />
                    )}
                    <div>
                      <p className="text-white font-bold text-base">{group.eventName}</p>
                      {group.eventDate && (
                        <p className="text-slate-500 text-xs mt-0.5">{group.eventDate}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {eventHasV2Bets ? (
                      <span className={`text-xs font-bold ${eventSummary.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {eventSummary.profit >= 0 ? '+' : ''}{eventSummary.profit.toFixed(2)}u
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs font-semibold">—</span>
                    )}
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      {group.entries.length} {group.entries.length === 1 ? 'fight' : 'fights'}
                    </span>
                  </div>
                </button>
                {open && (
                  <div className="space-y-4 px-4 pb-4">
                    {group.entries.map((entry) => {
            const graded = isResolvedWinner(entry.actualWinner, entry);
            const decisive =
              entry.actualWinner === entry.fighterA ||
              entry.actualWinner === entry.fighterB;
            const profit = calcTrackedProfit(entry);
            const trackedProb = entry.displayTrackedProb;
            const trackedEdge = entry.displayEdge;
            const inV2Mode = modelView === 'v2';
            const v2Data = inV2Mode ? (v2DataMap.get(entry.id) ?? null) : null;
            const v2pick = (inV2Mode && v2Data) ? v2Data.v2Winner : entry.trackedSide;
            const effectiveTrackedSide = inV2Mode ? v2pick : entry.trackedSide;
            const effectiveOdds = inV2Mode
              ? (v2pick === entry.fighterA ? (entry.oddsA || entry.marketOdds) : (entry.oddsB || entry.marketOdds))
              : entry.marketOdds;
            const v2FlippedTracked = inV2Mode && v2pick !== entry.trackedSide;
            const effectiveProfit = (() => {
              if (!isResolvedWinner(entry.actualWinner, entry)) return null;
              if (isPushResult(entry.actualWinner)) return 0;
              const dec = americanToDecimal(effectiveOdds);
              if (!dec) return null;
              // Same unitsWagered-aware stake as calcTrackedProfit -- the amount
              // actually risked on this entry doesn't change with the view mode,
              // only which side's odds are used to price the payout.
              const stake = entry.unitsWagered != null ? entry.unitsWagered : 1;
              return entry.actualWinner === effectiveTrackedSide ? stake * (dec - 1) : -stake;
            })();
            const effectiveWinnerForBadge = (inV2Mode && v2Data) ? v2Data.v2Winner : entry.displayWinner;
            const correct = decisive && entry.actualWinner === effectiveTrackedSide;
            const effWinner = (inV2Mode && v2Data) ? v2Data.v2Winner : entry.displayWinner;
            const effProb = (inV2Mode && v2Data) ? v2Data.v2WinProb : (entry.displayProb ?? 0);
            const effFairLine = (inV2Mode && v2Data) ? v2Data.v2FairLine : americanOdds(entry.displayProb ?? 0);
            const effEdge = (inV2Mode && v2Data && v2Data.v2Edge != null) ? v2Data.v2Edge : trackedEdge;
            const effBetAction = (inV2Mode && v2Data) ? v2Data.v2BetAction : entry.displayBetAction;
            const effBetFighter = (inV2Mode && v2Data) ? v2Data.v2BetFighter : entry.displayBetFighter;
            const actionableBetEff = effBetAction === 'LEAN' || effBetAction === 'BET' || effBetAction === 'STRONG BET';

            return (
              <div
                key={entry.id}
                className={`bg-slate-900 border ${betTier(entry.displayBetAction).border} rounded-xl p-5`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-black text-lg">
                        {entry.fighterA} vs. {entry.fighterB}
                      </h3>
                      {entry.includesProspect && (
                        <span
                          title="Includes a debuting prospect — prediction confidence reduced based on tier and record quality"
                          className="inline-flex items-center gap-1 rounded-full border border-amber-700/70 bg-amber-900/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-300"
                        >
                          <AlertTriangle size={12} />
                          Debut Hazard
                        </span>
                      )}
                      {entry.autoGenerated && entry.confirmedByUser === false && (
                        <span className="inline-flex items-center rounded-full border border-blue-700/70 bg-blue-900/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-300">
                          Auto · Pending Review
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          !graded
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : correct
                            ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                            : isPushResult(entry.actualWinner)
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-red-900/40 text-red-400 border-red-800'
                        }`}
                      >
                        {!graded
                          ? 'Pending'
                          : isPushResult(entry.actualWinner)
                          ? 'Push'
                          : correct
                          ? 'Correct'
                          : 'Miss'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      {entry.division}
                      {entry.eventName ? ` · ${entry.eventName}` : ''}
                      {entry.eventDate ? ` · ${entry.eventDate}` : ''}
                    </p>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    {entry.autoGenerated && entry.confirmedByUser === false && (
                      <button
                        onClick={() => onUpdateEntry(entry.id, { confirmedByUser: true })}
                        className="px-3 py-1.5 rounded-lg border border-blue-700 text-blue-300 text-xs font-semibold hover:text-white hover:border-blue-500 transition-colors"
                      >
                        Confirm Pick
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const label = `${entry.fighterA} vs. ${entry.fighterB}`;
                        const meta = [entry.eventName, entry.eventDate].filter(Boolean).join(' · ');
                        const result = entry.actualWinner && entry.actualWinner !== '' ? `Result: ${entry.actualWinner}` : 'Result: Pending';
                        if (window.confirm(`Delete this graded pick?\n\n${label}${meta ? `\n${meta}` : ''}\n${result}\n\nThis cannot be undone unless you've already run "Copy Updated roiData.js".`)) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Model pick — v1 or v2 single-model view */}
                {inV2Mode ? (
                  <div className="bg-slate-800/40 rounded-lg p-4 mb-3 flex items-baseline justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-500 text-xs uppercase tracking-wider">
                          Model Pick
                        </p>
                        <span className="text-[10px] font-bold text-violet-400 bg-violet-900/30 border border-violet-700/40 px-1.5 py-0.5 rounded-sm uppercase">
                          v2
                        </span>
                      </div>
                      <p className="text-white font-black text-xl mt-1">
                        {effWinner}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-black text-lg">
                        {(effProb * 100).toFixed(1)}%
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        win prob · {effFairLine}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/40 rounded-lg p-4 mb-3 flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wider">
                        Model Pick
                      </p>
                      <p className="text-white font-black text-xl mt-1">
                        {entry.displayWinner}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-black text-lg">
                        {((entry.displayProb ?? 0) * 100).toFixed(1)}%
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        win prob · {americanOdds(entry.displayProb ?? 0)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">
                      Bet Rec
                    </p>
                    {actionableBetEff ? (
                      <>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                              effBetAction === 'STRONG BET'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : effBetAction === 'BET'
                                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                            }`}
                          >
                            {effBetAction}
                          </span>
                        </div>
                        <p className="text-white font-bold text-sm mt-3">
                          {effBetFighter || 'No bet side'}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-600 font-bold text-sm mt-2">—</p>
                    )}
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Market odds</p>
                    <p className="text-white font-bold text-sm mt-1">
                      {effectiveOdds || '—'}
                      {v2FlippedTracked && (
                        <span className="text-amber-400 text-xs ml-1">(v2 flip)</span>
                      )}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {effEdge != null
                        ? `${effEdge > 0 ? '+' : ''}${(
                            effEdge * 100
                          ).toFixed(1)}% edge`
                        : 'No saved market edge'}
                    </p>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3">
                      <p className="text-slate-500 text-xs">Units</p>
                    <p
                      className={`font-bold text-sm mt-1 ${
                        effectiveProfit == null
                          ? 'text-slate-300'
                          : effectiveProfit >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {effectiveProfit == null
                        ? 'Pending'
                        : `${effectiveProfit >= 0 ? '+' : ''}${effectiveProfit.toFixed(2)}u`}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {entry.actualWinner === 'NC'
                        ? 'No Contest'
                        : entry.actualWinner === 'DRAW'
                        ? 'Draw'
                        : entry.actualWinner || 'Awaiting result'}
                    </p>
                    {entry.includesProspect && graded && (
                      <p className="text-amber-600 text-xs mt-0.5 font-semibold">Excl. stats</p>
                    )}
                  </div>
                </div>

                <p className="sm:hidden text-slate-500 text-xs">
                  {entry.eventName || '—'}
                  {entry.eventDate ? ` · ${entry.eventDate}` : ''}
                  {' · Tracked: '}{entry.trackedSide || '—'}
                  {' · Market: '}{entry.marketOdds || '—'}
                  {' · Winner: '}{entry.actualWinner || 'Pending'}
                </p>

                <div className="hidden sm:grid grid-cols-5 gap-3">
                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={entry.eventName || ''}
                      onChange={(e) =>
                        onUpdateEntry(entry.id, { eventName: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={entry.eventDate || ''}
                      onChange={(e) =>
                        onUpdateEntry(entry.id, { eventDate: e.target.value })
                      }
                      className="w-full h-10 bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Tracked Side
                    </label>
                    <select
                      value={entry.trackedSide}
                      onChange={(e) =>
                        onUpdateEntry(entry.id, {
                          trackedSide: e.target.value,
                          marketOdds:
                            e.target.value === entry.fighterA
                              ? entry.oddsA || ''
                              : entry.oddsB || '',
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500"
                    >
                      <option value={entry.fighterA}>{entry.fighterA}</option>
                      <option value={entry.fighterB}>{entry.fighterB}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Market Odds
                    </label>
                    <input
                      type="text"
                      value={entry.marketOdds || ''}
                      onChange={(e) =>
                        onUpdateEntry(entry.id, {
                          marketOdds: e.target.value.replace(/[^0-9+-]/g, ''),
                        })
                      }
                      placeholder="-150"
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                      Actual Winner
                    </label>
                    <select
                      value={entry.actualWinner || ''}
                      onChange={(e) =>
                        onUpdateEntry(entry.id, {
                          actualWinner: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:border-red-500"
                    >
                      <option value="">Pending</option>
                      <option value={entry.fighterA}>{entry.fighterA}</option>
                      <option value={entry.fighterB}>{entry.fighterB}</option>
                      <option value="NC">No Contest</option>
                      <option value="DRAW">Draw</option>
                    </select>
                  </div>
                </div>

              </div>
            );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function InfoTab() {
  const stats = [
    {
      term: 'RTG',
      full: '0–90 Fighter Rating',
      formula:
        "Normalized ELO within each weight class. 100 = division's highest-rated fighter. 50 = division average. Updates every Monday and Thursday after fight results are processed.",
      color: 'text-red-400',
    },
    {
      term: 'ELO',
      full: 'ELO Rating',
      formula:
        'Elo-based skill rating updated after every UFC fight. Base: 1500. K-factor scales by finish type (KO/Sub ×1.5), round (R1 ×1.3), and experience (<5 fights ×1.5). Elite fighters typically range 1700–1900.',
      color: 'text-orange-400',
    },
    {
      term: 'OQI',
      full: 'Overall Quality Index',
      formula:
        "Composite of efficiency, credibility, and output metrics — the primary ranking stat, analogous to KenPom's overall rating.",
      color: 'text-yellow-400',
    },
    {
      term: 'EFF',
      full: 'Efficiency Rating',
      formula:
        'EFF = (Strike Accuracy × NSM) + (TD% × TDE) + (Control Time per 15min × 0.5). Each component is normalized to the division mean, then weighted and summed. Scaled 0–100 per division.',
      color: 'text-green-400',
    },
    {
      term: 'CRED%',
      full: 'Credibility Percentage',
      formula:
        'Bayesian confidence weight. Shrinks EFF toward the division mean based on sample size. More fights = higher credibility = EFF closer to raw value.',
      color: 'text-cyan-400',
    },
    {
      term: 'QM',
      full: 'Quality Momentum',
      formula:
        'Opponent-quality-adjusted win/loss momentum. Rewards beating highly-rated opponents and penalizes losing to lower-rated ones.',
      color: 'text-blue-400',
    },
    {
      term: 'NSM',
      full: 'Net Strike Margin',
      formula:
        'Significant strikes landed minus significant strikes absorbed per minute. Positive = net striker, negative = net absorber.',
      color: 'text-indigo-400',
    },
    {
      term: 'TDE',
      full: 'Takedown Efficiency',
      formula:
        'Takedowns landed per 15 minutes, weighted by takedown accuracy. Measures offensive wrestling output.',
      color: 'text-purple-400',
    },
    {
      term: 'TD%',
      full: 'Takedown Defense %',
      formula:
        'Percentage of opponent takedown attempts successfully defended. Higher is better — this proved more predictive than TDE.',
      color: 'text-pink-400',
    },
    {
      term: 'CRDY',
      full: 'Cardio / Late-Round Ratio',
      formula:
        "Compares a fighter's output in rounds 3–5 vs rounds 1–2. Values above 1.0 indicate fighters who finish stronger.",
      color: 'text-rose-400',
    },
    {
      term: 'FIN%',
      full: 'Finish Rate',
      formula:
        'Percentage of wins by KO/TKO or submission. High values indicate fight-ending power rather than decision-reliance.',
      color: 'text-red-300',
    },
    {
      term: 'DMG',
      full: 'Damage Output Index',
      formula:
        'Combines significant strikes landed, knockdowns, and finish rate into a single damage-dealing composite score.',
      color: 'text-orange-300',
    },
    {
      term: 'POS',
      full: 'Positional Control',
      formula:
        'Ground control time per 15 minutes plus submission attempts. Measures grappling dominance beyond just takedowns.',
      color: 'text-slate-300',
    },
  ];
  const backtest = useMemo(() => computeBacktestAccuracy(), []);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 space-y-10">

      {/* Section 1 — How FightMetrics Works */}
      <div>
        <h2 className="text-white font-black text-xl mb-0.5">How FightMetrics Works</h2>
        <p className="text-slate-500 text-xs mb-5 font-mono">DrossPom Composite v1.0 · Learned Logistic v2.0 (parallel)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Prediction Engine */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🧠</span>
              <h3 className="text-white font-bold text-sm">Prediction Engine</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Two models run in parallel. <span className="text-slate-200">v1 (DrossPom Composite)</span> is a domain-engineered linear composite — weighted sum of 6 domains (Striking, Grappling, Physical, Form, Experience, Analytics) through a sigmoid function. <span className="text-slate-200">v2 (Logistic)</span> is a learned logistic regression trained on 7,177 historical UFC fights using 17 features including ELO, streaks, and striking efficiency. Win probabilities are Platt-calibrated.
            </p>
          </div>
          {/* Card 2 — Key Predictors */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">📊</span>
              <h3 className="text-white font-bold text-sm">Key Predictors</h3>
            </div>
            <ul className="space-y-1.5">
              <li className="text-slate-400 text-xs leading-relaxed flex gap-2"><span>⚔️</span><span>Striking output is the strongest single predictor across all divisions</span></li>
              <li className="text-slate-400 text-xs leading-relaxed flex gap-2"><span>🛡️</span><span>Takedown defense outperforms takedown offense as a win signal</span></li>
              <li className="text-slate-400 text-xs leading-relaxed flex gap-2"><span>📈</span><span>ELO accounts for opponent quality — a win over a top-ranked fighter carries more weight</span></li>
              <li className="text-slate-400 text-xs leading-relaxed flex gap-2"><span>📉</span><span>Age penalizes fighters 35+ with a linear decay; 38+ triggers a matchup flag</span></li>
              <li className="text-slate-400 text-xs leading-relaxed flex gap-2"><span>📏</span><span>Physical traits (reach, size) matter more in heavier divisions</span></li>
            </ul>
          </div>
          {/* Card 3 — Projected Finish Method */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🥊</span>
              <h3 className="text-white font-bold text-sm">Projected Finish Method</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              A separate calibrated model predicts KO/TKO, Submission, or Decision probability for each matchup. Validated against 1,516 historical fights post-2019. Calibration: KO ±0.9pp, SUB ±0.6pp vs actual UFC rates. Inputs: KO win %, KD rate, sub threat rate, finish rate.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2 — Rating & ELO Explained */}
      <div>
        <h2 className="text-white font-black text-xl mb-1">Rating &amp; ELO Explained</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🏅</span>
              <h3 className="text-white font-bold text-sm">0–100 Fighter Rating</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Normalized ELO score within each weight class. <span className="text-slate-200">100 = division’s highest-rated fighter.</span> 50 = division average. Updates every Monday and Thursday after fight results are processed. Not the same as UFC rankings — based entirely on performance data.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">📡</span>
              <h3 className="text-white font-bold text-sm">ELO Rating</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Elo-based skill rating updated after every UFC fight. <span className="text-slate-200">Base: 1500.</span> K-factor scales by finish type (KO/Sub ×1.5), round (R1 ×1.3), and experience (&lt;5 fights ×1.5). Elite fighters typically range 1700–1900. Quality Momentum (QM) adjusts for recent opponent strength.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 — Stat Glossary */}
      <div>
        <h2 className="text-white font-black text-xl mb-1">Stat Glossary</h2>
        <p className="text-slate-400 text-sm mb-4">
          Every metric in FightMetrics explained — what it measures, how it was derived, and why it matters.
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-800">
            {stats.map(({ term, full, formula, color }) => (
              <div key={term} className="grid grid-cols-[9rem_1fr] gap-4 px-5 py-3 hover:bg-slate-800/40 transition-colors">
                <div>
                  <span className={`font-black text-sm font-mono ${color}`}>{term}</span>
                  <p className="text-slate-300 text-xs font-semibold mt-0.5 leading-tight">{full}</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed self-center">{formula}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4 — Data & Limitations */}
      <div>
        <h2 className="text-white font-black text-xl mb-1">Data &amp; Limitations</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <ul className="space-y-3">
            <li className="flex gap-3 text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-500 shrink-0 mt-0.5">▸</span>
              <span>Stats sourced from ufcstats.com via automated pipeline — updates Mon/Thu after fight cards. Diagnostic accuracy ({backtest.correct}/{backtest.total} fights): <span className="text-red-400 font-bold">{backtest.accuracy.toFixed(1)}%</span> <span className="text-slate-500">(ceiling estimate using current career stats, not point-in-time snapshots)</span></span>
            </li>
            <li className="flex gap-3 text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-500 shrink-0 mt-0.5">▸</span>
              <span>Point-in-time pre-fight stats used for all predictions — no look-ahead bias</span>
            </li>
            <li className="flex gap-3 text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-500 shrink-0 mt-0.5">▸</span>
              <span>Low sample fighters (&lt;75 min fight time) are blended toward division averages — flagged as low credibility</span>
            </li>
            <li className="flex gap-3 text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-500 shrink-0 mt-0.5">▸</span>
              <span>Cross-division matchups (e.g. LHW vs HW) are noted but physical domain weights are not adjusted</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}
