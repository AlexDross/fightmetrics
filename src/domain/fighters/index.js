// ─── DOMAIN / FIGHTERS ──────────────────────────────────────────────────
// Foundation Stage 3. Extracted VERBATIM from src/App.js.
//
// Every line below is byte-identical to its original. Exports are declared in a
// single block at the end so no moved line had to change.
//
// Original locations in App.js (pre-extraction line numbers):
//     150-155   currentRankTier
//     227-245   computeMomentum
//     415-420   getFightRoundCount
//     422-426   sumFightRounds
//     428-434   sumDeepRounds
//     436-452   DIV_ELO_STATS
//     454-460   eloToRating
//     462-466   PROSPECT_TIER_CONFIG
//     468-469   blendToward
//     471-495   computeProspectSeededElo
//     497-507   computeProspectSeededCardio
//     509-546   getProspectTrustProfile
//     548-551   activeProspects
//     553-841   FIGHTERS

import { _D2 } from '../../fightersData';
import { getActiveProspects } from '../../prospectsData';
import { ELO_RATINGS } from '../../eloModule';
import { CARDIO_RATIOS } from '../../cardioModule';
import { FIGHT_HISTORY } from '../../fightHistory';
import { UFC_RANKINGS, getOpponentTier, DIVISION_UFC_AVERAGES, clampNum, sortHistoryDesc, getResultStreak, isDecisionMethod, isKoMethod, isSubMethod } from '../model';
import {
  getCurrentP4PRanking,
  resolveCurrentRanking,
} from '../rankings/current.js';
import { resolveFighterAge } from '../age/index.js';

const currentRankTier = (rankObj) => {
  if (!rankObj) return 0.12;
  const rank = rankObj.rank;
  if (rank === 'C' || rank === 0) return 1.0;
  return Math.max(0.42, 0.93 * Math.exp(-0.037 * (rank - 1)));
};

// ─── MOMENTUM SCORE ──────────────────────────────────────────────────────────
// Captures recent form: wins vs tough opponents and losses vs weak ones matter most
const computeMomentum = (fh) => {
  if (!fh || fh.length === 0) return 0;
  const DECAY = 0.68;
  let num = 0,
    den = 0;
  fh.slice(0, 5).forEach((fight, i) => {
    const w = Math.pow(DECAY, i);
    const tier = getOpponentTier(fight.op, fight);
    if (fight.re === 'W') {
      num += w * (0.4 + 1.6 * tier); // win vs champ = +2, vs unranked = +0.6
    } else if (fight.re === 'L') {
      num += w * -(0.3 + 1.7 * (1 - tier)); // loss vs unranked = -1.7, vs champ = -0.3
    }
    den += w;
  });
  return den > 0 ? Math.max(-2, Math.min(2, (num / den) * 2)) : 0;
};

const getFightRoundCount = (fight) => {
  const rn = Number(fight?.rn);
  if (Number.isFinite(rn) && rn > 0) return rn;
  if (isDecisionMethod(fight?.me || '')) return fight?.tb ? 5 : 3;
  return null;
};

const sumFightRounds = (history) =>
  (history || []).reduce((sum, fight) => {
    const rounds = getFightRoundCount(fight);
    return sum + (rounds ?? 0);
  }, 0);

// Count fights that reached round 3 or later.
// Explicit round number wins. If round is missing, infer only from decisions.
const sumDeepRounds = (history) =>
  (history || []).reduce((sum, fight) => {
    const rounds = getFightRoundCount(fight);
    return sum + ((rounds ?? 0) >= 3 ? 1 : 0);
  }, 0);

// ─── FIGHTERS MAPPING (v5) ────────────────────────────────────────────────────
// Replace the entire `const FIGHTERS = _D.map((d) => { ... });` block with this.
// Uses compact field names from fightersData.js (_D2 array).

// Per-division ELO normalization (min/max per division → 0–100 rating)
const DIV_ELO_STATS = (() => {
  const stats = {};
  for (const d of _D2) {
    if (!d.w) continue;
    const elo = ELO_RATINGS[d.n]?.elo ?? d.elo;
    if (!elo) continue;
    if (!stats[d.w]) stats[d.w] = { min: Infinity, max: -Infinity };
    if (elo < stats[d.w].min) stats[d.w].min = elo;
    if (elo > stats[d.w].max) stats[d.w].max = elo;
  }
  return stats;
})();

const eloToRating = (elo, weightClass) => {
  const s = DIV_ELO_STATS[weightClass];
  if (!s || s.max === s.min) return 50;
  return Math.round(
    Math.max(0, Math.min(100, ((elo - s.min) / (s.max - s.min)) * 100))
  );
};

const PROSPECT_TIER_CONFIG = {
  tier1: { rateBase: 0.8, recordBase: 0.58, eloBase: 0.46, cardioBase: 0.62 },
  tier2: { rateBase: 0.62, recordBase: 0.42, eloBase: 0.32, cardioBase: 0.48 },
  tier3: { rateBase: 0.46, recordBase: 0.28, eloBase: 0.18, cardioBase: 0.36 },
};

const blendToward = (value, baseline, trust) =>
  baseline + (value - baseline) * clampNum(trust, 0, 1);

const computeProspectSeededElo = (d) => {
  if (d.elo != null && d.elo !== 1520) return d.elo;
  const wins = d.wi ?? 0;
  const losses = d.lo ?? 0;
  const finishWins = (d.kow ?? 0) + (d.sbw ?? 0);
  const finishRate = wins > 0 ? finishWins / wins : 0;
  const tierBonus =
    d._p_tier === 'tier1' ? 50 : d._p_tier === 'tier2' ? 25 : 0;
  const undefeatedLast5 = losses === 0 && wins >= 5 ? 30 : 0;

  const tierCap =
    d._p_tier === 'tier1' ? 1520 :
    d._p_tier === 'tier2' ? 1490 :
    1450;
  const shortNoticePenalty = d._p_source === 'short_notice' ? 30 : 0;
  return clampNum(
    1400 +
      (wins - losses) * 8 +
      Math.min(40, finishRate * 50) +
      tierBonus +
      undefeatedLast5,
    1370,
    tierCap - shortNoticePenalty
  );
};

const computeProspectSeededCardio = (d) => {
  if (d.crd != null) return d.crd;
  const totalRounds = d.tr ?? 0;
  const wins = d.wi ?? 0;
  const decisionRate = wins > 0 ? (d.dcw ?? 0) / wins : 0;
  return clampNum(
    0.85 + Math.min(0.3, totalRounds * 0.006) + decisionRate * 0.2,
    0.5,
    1.5
  );
};

const getProspectTrustProfile = (d, totalRounds) => {
  const cfg = PROSPECT_TIER_CONFIG[d._p_tier] ?? PROSPECT_TIER_CONFIG.tier3;
  const statsFights = d._p_fights_with_stats ?? 0;
  const sampleTrust =
    statsFights <= 0 ? 0.12 : Math.min(1, 0.24 + statsFights * 0.11);
  const roundsTrust = Math.min(1, (totalRounds ?? 0) / 30);

  const rateTrust = clampNum(cfg.rateBase * sampleTrust, 0.08, 0.88);
  const recordTrust = clampNum(
    cfg.recordBase * (0.35 + roundsTrust * 0.65),
    0.1,
    0.72
  );
  const eloTrust = clampNum(
    cfg.eloBase * (0.3 + sampleTrust * 0.7),
    0.08,
    0.58
  );
  const cardioTrust = clampNum(
    cfg.cardioBase * (0.35 + Math.max(sampleTrust, roundsTrust) * 0.65),
    0.12,
    0.78
  );
  const credibilityTrust = clampNum(
    Math.min(rateTrust, recordTrust) * 0.95,
    0.08,
    0.72
  );

  return {
    statsFights,
    rateTrust,
    recordTrust,
    eloTrust,
    cardioTrust,
    credibilityTrust,
  };
};

const activeProspects = (() => {
  const existingFighterNames = new Set(_D2.map((fighter) => fighter.n));
  return getActiveProspects().filter((prospect) => !existingFighterNames.has(prospect.n));
})();

const FIGHTERS = [..._D2, ...activeProspects].map((d) => {
  const isProspect = d._p_source !== undefined;
  const eloRec = ELO_RATINGS[d.n] ?? null;
  const fightHistory = sortHistoryDesc(FIGHT_HISTORY[d.n] ?? []);
  // ── v1 ranking inputs (FROZEN) ────────────────────────────────────────────
  // RANK_TIER/OQI_SCALE feed feats.rank_tier_dif in the deprecated v1 engine.
  // They deliberately keep reading the legacy UFC_RANKINGS table and the stale
  // embedded `dr` fallback: repointing them would move v1 arithmetic, which is
  // out of scope here. This debt goes when v1 is retired.
  const legacyRank = UFC_RANKINGS[d.n] ?? null;
  const legacyFallbackRank =
    d.dr != null ? { division: d.w, rank: Math.round(d.dr) } : null;
  const mergedLegacyRank = legacyRank ?? legacyFallbackRank;

  // ── current official rankings (UI/profile only) ───────────────────────────
  // Source-backed, division-aware, and never fed to any model. resolveCurrent-
  // Ranking recovers athletes whose ranked division has moved ahead of the
  // roster's weight class and flags them with crossDivision for the badge.
  const currentRank = resolveCurrentRanking(d.n, d.w);
  const currentP4P = getCurrentP4PRanking(d.n);

  const divisionAvg = DIVISION_UFC_AVERAGES[d.w] ?? {
    asl: 3.5,
    asp: 0.44,
    asa: 0.25,
    atl: 1.0,
    atp: 0.35,
    crd: 1.0,
    elo: 1450,
  };
  const seededProspectElo = isProspect
    ? computeProspectSeededElo(d)
    : d.elo ?? 1500;
  const seededProspectCardio = isProspect
    ? computeProspectSeededCardio(d)
    : d.crd ?? 1.0;
  const liveEloBase = eloRec?.elo ?? seededProspectElo;
  const peakEloBase = eloRec?.peak ?? liveEloBase;
  const rawCardio = CARDIO_RATIOS[d.n];
  const cardioBase = (rawCardio !== undefined && rawCardio !== 0.5)
    ? rawCardio
    : seededProspectCardio;
  const rankTier = currentRankTier(mergedLegacyRank);
  const historyWins = fightHistory.filter((fight) => fight.re === 'W');
  const historyLosses = fightHistory.filter((fight) => fight.re === 'L');
  const rawWins = fightHistory.length > 0 ? historyWins.length : d.wi ?? 0;
  const rawLosses = fightHistory.length > 0 ? historyLosses.length : d.lo ?? 0;
  const totalFights = rawWins + rawLosses;
  const rawTotalRounds =
    d.tr ?? (fightHistory.length > 0 ? sumFightRounds(fightHistory) : 0);
  const rawDeepRounds =
    fightHistory.length > 0
      ? sumDeepRounds(fightHistory)
      : Math.min(d.dcw ?? 0, Math.round((rawTotalRounds ?? 0) / 6));
  const rawKoWins =
    fightHistory.length > 0
      ? historyWins.filter((fight) => isKoMethod(fight.me || '')).length
      : d.kow ?? 0;
  const rawSubWins =
    fightHistory.length > 0
      ? historyWins.filter((fight) => isSubMethod(fight.me || '')).length
      : d.sbw ?? 0;
  const rawDecWins =
    fightHistory.length > 0
      ? historyWins.filter((fight) => isDecisionMethod(fight.me || '')).length
      : d.dcw ?? 0;
  const rawTitleBouts = Math.max(
    fightHistory.length > 0 ? fightHistory.filter((fight) => fight.tb).length : 0,
    d.tb ?? 0,
  );
  const winStreak =
    fightHistory.length > 0 ? getResultStreak(fightHistory, 'W') : d.ws ?? 0;
  const loseStreak =
    fightHistory.length > 0 ? getResultStreak(fightHistory, 'L') : d.ls ?? 0;
  const lastFightDate = fightHistory[0]?.dt ?? d.lfd;
  const daysSinceLast = fightHistory[0]?.dt
    ? Math.max(
        0,
        Math.round(
          (Date.now() - new Date(fightHistory[0].dt).getTime()) / 86400000
        )
      )
    : d.dsl;
  const rawUfcFightCount =
    fightHistory.length > 0 ? totalFights : eloRec?.n ?? totalFights;
  const prospectTrust = isProspect
    ? getProspectTrustProfile(d, rawTotalRounds)
    : null;
  const modelAsl = isProspect
    ? blendToward(d.asl ?? divisionAvg.asl, divisionAvg.asl, prospectTrust.rateTrust)
    : d.asl;
  const modelAsp = isProspect
    ? blendToward(d.asp ?? divisionAvg.asp, divisionAvg.asp, prospectTrust.rateTrust)
    : d.asp;
  const modelAsa = isProspect
    ? blendToward(d.asa ?? divisionAvg.asa, divisionAvg.asa, prospectTrust.rateTrust)
    : d.asa;
  const modelAtl = isProspect
    ? blendToward(d.atl ?? divisionAvg.atl, divisionAvg.atl, prospectTrust.rateTrust)
    : d.atl;
  const modelAtp = isProspect
    ? blendToward(d.atp ?? divisionAvg.atp, divisionAvg.atp, prospectTrust.rateTrust)
    : d.atp;
  const modelElo = isProspect
    ? blendToward(liveEloBase, divisionAvg.elo, prospectTrust.eloTrust)
    : liveEloBase;
  const modelPeakElo = isProspect
    ? blendToward(peakEloBase, divisionAvg.elo, prospectTrust.eloTrust)
    : peakEloBase;
  const modelCardioRatio = isProspect
    ? blendToward(cardioBase, divisionAvg.crd, prospectTrust.cardioTrust)
    : cardioBase;
  const modelWins = isProspect ? rawWins * prospectTrust.recordTrust : rawWins;
  const modelLosses = isProspect
    ? rawLosses * prospectTrust.recordTrust
    : rawLosses;
  const modelTotalRounds = isProspect
    ? rawTotalRounds * prospectTrust.recordTrust
    : rawTotalRounds;
  const modelDeepRounds = isProspect
    ? rawDeepRounds * prospectTrust.recordTrust
    : rawDeepRounds;
  const modelKoWins = isProspect
    ? rawKoWins * prospectTrust.recordTrust
    : rawKoWins;
  const modelSubWins = isProspect
    ? rawSubWins * prospectTrust.recordTrust
    : rawSubWins;
  const modelDecWins = isProspect
    ? rawDecWins * prospectTrust.recordTrust
    : rawDecWins;
  const modelTitleBouts = isProspect
    ? rawTitleBouts * prospectTrust.recordTrust
    : rawTitleBouts;
  const modelUfcWins = isProspect ? 0 : rawWins;
  const modelUfcLosses = isProspect ? 0 : rawLosses;
  const modelUfcWinStreak = isProspect ? 0 : winStreak;
  const modelUfcLoseStreak = isProspect ? 0 : loseStreak;
  const modelUfcFightCount = isProspect ? 0 : rawUfcFightCount;

  const rating = eloToRating(modelElo, d.w);
  const baseCred = Math.min(100, Math.round((rawTotalRounds / 60) * 100));
  const cred = isProspect
    ? Math.max(8, Math.round(baseCred * prospectTrust.credibilityTrust))
    : baseCred;
  const winPct =
    totalFights > 0 ? Math.round((rawWins / totalFights) * 100) : 0;
  // Finish rate
  const finishRate =
    rawWins > 0
      ? Math.round((((rawKoWins ?? 0) + (rawSubWins ?? 0)) / rawWins) * 100)
      : 0;
  const totalMin = Math.round(rawTotalRounds * 5);
  const kdPerMin =
    totalMin > 0 ? parseFloat(((rawKoWins ?? 0) / totalMin).toFixed(4)) : 0;
  const controlPct = Math.min(
    100,
    parseFloat(
      (
        (modelAtl ?? 0) * ((modelAtp ?? 0.35) + 0.15) * 10 +
        (modelAsa ?? 0) * 3
      ).toFixed(1)
    )
  );
  const eloStrength = Math.max(0, Math.min(1, (modelElo - 1400) / 450));
  const oqiProxy = parseFloat(
    (0.65 * rankTier + 0.35 * eloStrength).toFixed(3)
  );
const momentumScore = Math.max(
  -2,
  Math.min(2, ((winStreak ?? 0) - (loseStreak ?? 0)) / 4)
);

  const qualityMomentum = computeMomentum(fightHistory);

  return {
    FIGHTER: d.n,
    WEIGHT_CLASS: d.w,
    // Recomputed from date of birth on every app load. d.ag is the scrape-time
    // integer snapshot and is kept only as a fallback for the fighters with no
    // known birth date; null means genuinely unknown, and every consumer must
    // treat it as unknown rather than substituting a default age.
    AGE: resolveFighterAge({ FIGHTER: d.n, AGE: d.ag }),
    HEIGHT_IN: d.ht,
    REACH_IN: d.rh,
    STANCE: d.st,
    WINS: rawWins,
    LOSSES: rawLosses,
    WIN_STREAK: winStreak,
    LOSE_STREAK: loseStreak,
    TOTAL_ROUNDS: rawTotalRounds,
    DEEP_ROUNDS: rawDeepRounds,
    TITLE_BOUTS: rawTitleBouts,
    KO_WINS: rawKoWins,
    SUB_WINS: rawSubWins,
    DEC_WINS: rawDecWins,
    ASL: modelAsl,
    ASP: modelAsp,
    ASA: modelAsa,
    ATL: modelAtl,
    ATP: modelAtp,
    ATD: d.atd ?? 0.60,
    ATD_PCT: parseFloat(((d.atd ?? 0.60) * 100).toFixed(1)),
    ELO: modelElo,
    ELO_PEAK: modelPeakElo,
    UFC_FIGHT_COUNT: modelUfcFightCount,
    RANK_TIER: rankTier,
    CARDIO_RATIO: modelCardioRatio,
    LAST_FIGHT_DATE: lastFightDate,
    DAYS_SINCE_LAST: daysSinceLast,
    DIV_RANK: currentRank?.rank ?? null,
    P4P_RANK: currentP4P?.rank ?? null,
    WEIGHT_LBS: d.wlb,
    // Derived display fields
    ADJUSTED_RATING: rating, // 0–100, ELO-based, normalized per division
    CREDIBILITY: cred,
    WIN_PCT: winPct,
    FINISH_RATE: finishRate,
    RECORD: `${rawWins}-${rawLosses}`,
    RAW_ASL: d.asl ?? null,
    RAW_ASP: d.asp ?? null,
    RAW_ASA: d.asa ?? null,
    RAW_ATL: d.atl ?? null,
    RAW_ATP: d.atp ?? null,
    RAW_ELO: liveEloBase,
    RAW_CARDIO_RATIO: cardioBase,
    MODEL_WINS: modelWins,
    MODEL_LOSSES: modelLosses,
    MODEL_UFC_WINS: modelUfcWins,
    MODEL_UFC_LOSSES: modelUfcLosses,
    MODEL_UFC_WIN_STREAK: modelUfcWinStreak,
    MODEL_UFC_LOSE_STREAK: modelUfcLoseStreak,
    MODEL_TOTAL_ROUNDS: modelTotalRounds,
    MODEL_DEEP_ROUNDS: modelDeepRounds,
    MODEL_TITLE_BOUTS: modelTitleBouts,
    MODEL_KO_WINS: modelKoWins,
    MODEL_SUB_WINS: modelSubWins,
    MODEL_DEC_WINS: modelDecWins,
    MODEL_UFC_FIGHT_COUNT: modelUfcFightCount,
    PROSPECT_CONFIDENCE: isProspect ? prospectTrust.credibilityTrust : 1,
    // Legacy aliases (keep for UI components that reference old names)
    // Effective strike output: strikes landed per min × accuracy.
    // True net margin (landed minus absorbed) requires absorbed data not available
    // at the per-fighter aggregate level, so this is the best available proxy.
    NET_STRIKE_MARGIN:
      modelAsl != null
        ? parseFloat((modelAsl * (modelAsp ?? 0.45)).toFixed(2))
        : null,
    SIG_STR_ACC: modelAsp != null ? modelAsp * 100 : null,
    TDE: modelAtl,
    TD_ACC: modelAtp != null ? modelAtp * 100 : null,
    KD_PER_MIN: kdPerMin,
    OQI: oqiProxy,
    MOMENTUM: momentumScore,
    QUALITY_MOMENTUM: qualityMomentum,
    FINISH_QUALITY: finishRate / 100,
    FIGHT_HISTORY: fightHistory,

    // ── Legacy fields for UI compatibility (v5 equivalents) ──
    CARDIO_DECAY: modelCardioRatio,
    TOTAL_EFFICIENCY:
      modelAsl != null
        ? Math.max(0, parseFloat((modelAsl * (modelAsp ?? 0.45)).toFixed(2)))
        : 0,
    QUALITY_ADJUSTMENT: 0,
    LAYOFF_PENALTY: 0,
    EXPERIENCE_FACTOR: 1.0,
    OQI_SCALE: rankTier,
    TOTAL_MIN: totalMin,
    UFC_RANK: currentRank,
    SUB_THREAT_RATE: modelAsa ?? 0,
    KO_WIN_PCT:
      rawWins > 0
        ? parseFloat((((rawKoWins ?? 0) / rawWins) * 100).toFixed(1))
        : 0,
    SUB_WIN_PCT:
      rawWins > 0
        ? parseFloat((((rawSubWins ?? 0) / rawWins) * 100).toFixed(1))
        : 0,
    CONTROL_TIME_PCT: controlPct,
    RECENT_STR_OUTPUT: modelAsl ?? null,
    RECENT_STR_ACC: modelAsp != null ? modelAsp * 100 : null,
    RECENT_TD_RATE: modelAtl ?? null,
    RECENT_CTRL_PCT: controlPct,
    IS_LIGHT: false,
    ASD: modelAsl != null ? modelAsl * (1 - (modelAsp ?? 0.45)) : 0,
    FACTOR_DAMAGE:
      modelAsl != null
        ? parseFloat((modelAsl * (modelAsp ?? 0.45) * 0.4).toFixed(1))
        : 0,
    FACTOR_POSITION:
      modelAtp != null ? parseFloat((modelAtp * 30).toFixed(1)) : 0,
    FACTOR_FINISH: parseFloat((finishRate * 0.2).toFixed(1)),
    FACTOR_CARDIO: parseFloat((modelCardioRatio * 10).toFixed(1)),
    // ── Prospect fields (undefined for UFC veterans) ──
    IS_PROSPECT: isProspect,
    PROSPECT_TIER: isProspect ? d._p_tier : null,
    PROSPECT_SOURCE: isProspect ? d._p_source : null,
    PROSPECT_SIGNED: isProspect ? d._p_signed : null,
    PROSPECT_DEBUT: isProspect ? d._p_debut : null,
    PROSPECT_OPPONENT: isProspect ? d._p_opponent : null,
    PROSPECT_NOTES: isProspect ? d._p_notes : null,
    PROSPECT_STATS_FIGHTS: isProspect ? d._p_fights_with_stats ?? 0 : null,
  };
});

export {
  currentRankTier,
  computeMomentum,
  getFightRoundCount,
  sumFightRounds,
  sumDeepRounds,
  DIV_ELO_STATS,
  eloToRating,
  PROSPECT_TIER_CONFIG,
  blendToward,
  computeProspectSeededElo,
  computeProspectSeededCardio,
  getProspectTrustProfile,
  activeProspects,
  FIGHTERS,
};
