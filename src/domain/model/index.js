// ─── DOMAIN / MODEL ──────────────────────────────────────────────────────────
// Foundation Stage 3, commit 1. Extracted VERBATIM from src/App.js.
//
// Every line below is byte-identical to its original. Nothing was renamed,
// reordered within a declaration, or rewritten; exports are declared in a single
// block at the end of the file so no moved line had to change.
//
// This is the pure prediction engine: it takes fighter inputs and returns
// prediction outputs. computeBacktestAccuracy is deliberately NOT here -- it
// traverses the whole FIGHTERS collection and is application-level analytics,
// not part of the model.
//
// Original locations in App.js (pre-extraction line numbers):
//      63-252   UFC_RANKINGS
//     253-266   getOpponentTier
//     375-399   computeModernForm
//     400-409   computeSOS
//     620-662   DIVISION_UFC_AVERAGES
//     669-669   clampNum
//    3491-3498  sortHistoryDesc
//    3499-3507  getResultStreak
//    3508-3518  isDecisionMethod
//    3519-3550  isKoMethod
//    3551-3583  isSubMethod
//    3605-3677  getDebutProspectAdjustment
//    3678-3690  ageDecayPenalty
//    3698-3711  recentForm
//    3714-3785  MODEL
//    3786-3817  MODEL_V2
//    3818-3838  computeLogisticProb
//    3839-4494  computeMatchupEdges
//    4715-4743  latestFightHistoryDate

import { _D2 } from '../../fightersData';
import { getHistoricalTier } from '../../rankHistory';

const UFC_RANKINGS = {
  // Bantamweight
  'Petr Yan': { division: 'Bantamweight', rank: 'C' },
  'Merab Dvalishvili': { division: 'Bantamweight', rank: 1 },
  'Umar Nurmagomedov': { division: 'Bantamweight', rank: 2 },
  "Sean O'Malley": { division: 'Bantamweight', rank: 3 },
  'Cory Sandhagen': { division: 'Bantamweight', rank: 4 },
  'Song Yadong': { division: 'Bantamweight', rank: 5 },
  'Aiemann Zahabi': { division: 'Bantamweight', rank: 6 },
  'Deiveson Figueiredo': { division: 'Bantamweight', rank: 7 },
  'Mario Bautista': { division: 'Bantamweight', rank: 8 },
  'David Martinez': { division: 'Bantamweight', rank: 9 },
  'Marlon Vera': { division: 'Bantamweight', rank: 10 },
  'Payton Talbott': { division: 'Bantamweight', rank: 11 },
  'Vinicius Oliveira': { division: 'Bantamweight', rank: 12 },
  'Raul Rosas Jr.': { division: 'Bantamweight', rank: 13 },
  'Montel Jackson': { division: 'Bantamweight', rank: 14 },
  'Farid Basharat': { division: 'Bantamweight', rank: 15 },
  // Featherweight
  'Alexander Volkanovski': { division: 'Featherweight', rank: 'C' },
  'Movsar Evloev': { division: 'Featherweight', rank: 1 },
  'Diego Lopes': { division: 'Featherweight', rank: 2 },
  'Lerone Murphy': { division: 'Featherweight', rank: 3 },
  'Yair Rodriguez': { division: 'Featherweight', rank: 4 },
  'Aljamain Sterling': { division: 'Featherweight', rank: 5 },
  'Jean Silva': { division: 'Featherweight', rank: 6 },
  'Youssef Zalal': { division: 'Featherweight', rank: 7 },
  'Arnold Allen': { division: 'Featherweight', rank: 8 },
  'Steve Garcia': { division: 'Featherweight', rank: 9 },
  'Brian Ortega': { division: 'Featherweight', rank: 10 },
  'Josh Emmett': { division: 'Featherweight', rank: 11 },
  'Melquizael Costa': { division: 'Featherweight', rank: 12 },
  'Patricio Pitbull': { division: 'Featherweight', rank: 13 },
  'Kevin Vallejos': { division: 'Featherweight', rank: 14 },
  'David Onama': { division: 'Featherweight', rank: 15 },
  // Flyweight
  'Joshua Van': { division: 'Flyweight', rank: 'C' },
  'Alexandre Pantoja': { division: 'Flyweight', rank: 1 },
  'Manel Kape': { division: 'Flyweight', rank: 2 },
  'Tatsuro Taira': { division: 'Flyweight', rank: 3 },
  'Brandon Royval': { division: 'Flyweight', rank: 4 },
  'Kyoji Horiguchi': { division: 'Flyweight', rank: 5 },
  "Lone'er Kavanagh": { division: 'Flyweight', rank: 6 },
  'Asu Almabayev': { division: 'Flyweight', rank: 7 },
  'Amir Albazi': { division: 'Flyweight', rank: 8 },
  'Brandon Moreno': { division: 'Flyweight', rank: 9 },
  'Alex Perez': { division: 'Flyweight', rank: 10 },
  'Tim Elliott': { division: 'Flyweight', rank: 11 },
  'Steve Erceg': { division: 'Flyweight', rank: 12 },
  'Tagir Ulanbekov': { division: 'Flyweight', rank: 13 },
  'Charles Johnson': { division: 'Flyweight', rank: 14 },
  'Bruno Silva': { division: 'Flyweight', rank: 15 },
  // Heavyweight
  'Tom Aspinall': { division: 'Heavyweight', rank: 'C' },
  'Ciryl Gane': { division: 'Heavyweight', rank: 1 },
  'Alexander Volkov': { division: 'Heavyweight', rank: 2 },
  'Sergei Pavlovich': { division: 'Heavyweight', rank: 3 },
  'Curtis Blaydes': { division: 'Heavyweight', rank: 4 },
  'Waldo Cortes Acosta': { division: 'Heavyweight', rank: 5 },
  'Serghei Spivac': { division: 'Heavyweight', rank: 6 },
  'Rizvan Kuniev': { division: 'Heavyweight', rank: 7 },
  'Marcin Tybura': { division: 'Heavyweight', rank: 8 },
  'Derrick Lewis': { division: 'Heavyweight', rank: 9 },
  'Ante Delija': { division: 'Heavyweight', rank: 10 },
  'Tallison Teixeira': { division: 'Heavyweight', rank: 11 },
  'Mick Parkin': { division: 'Heavyweight', rank: 12 },
  'Shamil Gaziev': { division: 'Heavyweight', rank: 13 },
  'Valter Walker': { division: 'Heavyweight', rank: 14 },
  'Tai Tuivasa': { division: 'Heavyweight', rank: 15 },
  // Light Heavyweight
  'Alex Pereira': { division: 'Light Heavyweight', rank: 'C' },
  'Magomed Ankalaev': { division: 'Light Heavyweight', rank: 1 },
  'Jiří Procházka': { division: 'Light Heavyweight', rank: 2 },
  'Carlos Ulberg': { division: 'Light Heavyweight', rank: 3 },
  'Khalil Rountree Jr.': { division: 'Light Heavyweight', rank: 4 },
  'Jan Błachowicz': { division: 'Light Heavyweight', rank: 5 },
  'Azamat Murzakanov': { division: 'Light Heavyweight', rank: 6 },
  'Jamahal Hill': { division: 'Light Heavyweight', rank: 7 },
  'Bogdan Guskov': { division: 'Light Heavyweight', rank: 8 },
  'Volkan Oezdemir': { division: 'Light Heavyweight', rank: 9 },
  'Dominick Reyes': { division: 'Light Heavyweight', rank: 10 },
  'Aleksandar Rakić': { division: 'Light Heavyweight', rank: 11 },
  'Johnny Walker': { division: 'Light Heavyweight', rank: 12 },
  'Nikita Krylov': { division: 'Light Heavyweight', rank: 13 },
  'Dustin Jacoby': { division: 'Light Heavyweight', rank: 14 },
  'Zhang Mingyang': { division: 'Light Heavyweight', rank: 15 },
  // Lightweight
  'Ilia Topuria': { division: 'Lightweight', rank: 'C' },
  'Justin Gaethje': { division: 'Lightweight', rank: 1 },
  'Arman Tsarukyan': { division: 'Lightweight', rank: 2 },
  'Charles Oliveira': { division: 'Lightweight', rank: 3 },
  'Max Holloway': { division: 'Lightweight', rank: 4 },
  'Benoît Saint Denis': { division: 'Lightweight', rank: 5 },
  'Paddy Pimblett': { division: 'Lightweight', rank: 6 },
  'Dan Hooker': { division: 'Lightweight', rank: 7 },
  'Mateusz Gamrot': { division: 'Lightweight', rank: 8 },
  'Mauricio Ruffy': { division: 'Lightweight', rank: 9 },
  'Rafael Fiziev': { division: 'Lightweight', rank: 10 },
  'Renato Moicano': { division: 'Lightweight', rank: 11 },
  'Beneil Dariush': { division: 'Lightweight', rank: 12 },
  'Michael Chandler': { division: 'Lightweight', rank: 13 },
  'Manuel Torres': { division: 'Lightweight', rank: 14 },
  'Farès Ziam': { division: 'Lightweight', rank: 15 },
  // Middleweight
  'Khamzat Chimaev': { division: 'Middleweight', rank: 'C' },
  'Dricus Du Plessis': { division: 'Middleweight', rank: 1 },
  'Nassourdine Imavov': { division: 'Middleweight', rank: 2 },
  'Sean Strickland': { division: 'Middleweight', rank: 3 },
  'Israel Adesanya': { division: 'Middleweight', rank: 4 },
  'Caio Borralho': { division: 'Middleweight', rank: 5 },
  'Brendan Allen': { division: 'Middleweight', rank: 6 },
  'Anthony Hernandez': { division: 'Middleweight', rank: 7 },
  'Reinier de Ridder': { division: 'Middleweight', rank: 8 },
  'Robert Whittaker': { division: 'Middleweight', rank: 9 },
  'Jared Cannonier': { division: 'Middleweight', rank: 10 },
  'Roman Dolidze': { division: 'Middleweight', rank: 11 },
  'Gregory Rodrigues': { division: 'Middleweight', rank: 12 },
  'Paulo Costa': { division: 'Middleweight', rank: 13 },
  'Joe Pyfer': { division: 'Middleweight', rank: 14 },
  'Brunno Ferreira': { division: 'Middleweight', rank: 15 },
  // Welterweight
  'Islam Makhachev': { division: 'Welterweight', rank: 'C' },
  'Jack Della Maddalena': { division: 'Welterweight', rank: 1 },
  'Ian Machado Garry': { division: 'Welterweight', rank: 1 },
  'Michael Morales': { division: 'Welterweight', rank: 3 },
  'Belal Muhammad': { division: 'Welterweight', rank: 4 },
  'Carlos Prates': { division: 'Welterweight', rank: 5 },
  'Sean Brady': { division: 'Welterweight', rank: 6 },
  'Kamaru Usman': { division: 'Welterweight', rank: 7 },
  'Leon Edwards': { division: 'Welterweight', rank: 8 },
  'Joaquin Buckley': { division: 'Welterweight', rank: 9 },
  'Gabriel Bonfim': { division: 'Welterweight', rank: 10 },
  'Gilbert Burns': { division: 'Welterweight', rank: 11 },
  'Uroš Medić': { division: 'Welterweight', rank: 12 },
  'Michael Page': { division: 'Welterweight', rank: 13 },
  'Colby Covington': { division: 'Welterweight', rank: 14 },
  'Daniel Rodriguez': { division: 'Welterweight', rank: 15 },
  // Women's Bantamweight
  'Kayla Harrison': { division: "Women's Bantamweight", rank: 'C' },
  'Julianna Peña': { division: "Women's Bantamweight", rank: 1 },
  'Raquel Pennington': { division: "Women's Bantamweight", rank: 2 },
  'Norma Dumont': { division: "Women's Bantamweight", rank: 3 },
  'Ketlen Vieira': { division: "Women's Bantamweight", rank: 4 },
  'Yana Santos': { division: "Women's Bantamweight", rank: 5 },
  'Irene Aldana': { division: "Women's Bantamweight", rank: 6 },
  'Ailin Perez': { division: "Women's Bantamweight", rank: 7 },
  'Karol Rosa': { division: "Women's Bantamweight", rank: 8 },
  'Macy Chiasson': { division: "Women's Bantamweight", rank: 9 },
  'Jacqueline Cavalcanti': { division: "Women's Bantamweight", rank: 10 },
  'Joselyne Edwards': { division: "Women's Bantamweight", rank: 11 },
  'Mayra Bueno Silva': { division: "Women's Bantamweight", rank: 12 },
  'Nora Cornolle': { division: "Women's Bantamweight", rank: 13 },
  'Miesha Tate': { division: "Women's Bantamweight", rank: 14 },
  'Luana Santos': { division: "Women's Bantamweight", rank: 15 },
  // Women's Flyweight
  'Valentina Shevchenko': { division: "Women's Flyweight", rank: 'C' },
  'Natalia Silva': { division: "Women's Flyweight", rank: 1 },
  'Manon Fiorot': { division: "Women's Flyweight", rank: 2 },
  'Erin Blanchfield': { division: "Women's Flyweight", rank: 3 },
  'Alexa Grasso': { division: "Women's Flyweight", rank: 4 },
  'Maycee Barber': { division: "Women's Flyweight", rank: 5 },
  'Rose Namajunas': { division: "Women's Flyweight", rank: 6 },
  'Jasmine Jasudavicius': { division: "Women's Flyweight", rank: 7 },
  'Tracy Cortez': { division: "Women's Flyweight", rank: 8 },
  'Miranda Maverick': { division: "Women's Flyweight", rank: 9 },
  'Karine Silva': { division: "Women's Flyweight", rank: 10 },
  'Wang Cong': { division: "Women's Flyweight", rank: 11 },
  "Casey O'Neill": { division: "Women's Flyweight", rank: 12 },
  'Eduarda Moura': { division: "Women's Flyweight", rank: 13 },
  'Gabriella Fernandes': { division: "Women's Flyweight", rank: 14 },
  'JJ Aldrich': { division: "Women's Flyweight", rank: 15 },
  // Women's Strawweight
  'Mackenzie Dern': { division: "Women's Strawweight", rank: 'C' },
  'Zhang Weili': { division: "Women's Strawweight", rank: 1 },
  'Tatiana Suarez': { division: "Women's Strawweight", rank: 2 },
  'Virna Jandiroba': { division: "Women's Strawweight", rank: 3 },
  'Yan Xiaonan': { division: "Women's Strawweight", rank: 4 },
  'Amanda Lemos': { division: "Women's Strawweight", rank: 5 },
  'Loopy Godinez': { division: "Women's Strawweight", rank: 6 },
  'Tabatha Ricci': { division: "Women's Strawweight", rank: 7 },
  'Gillian Robertson': { division: "Women's Strawweight", rank: 8 },
  'Jéssica Andrade': { division: "Women's Strawweight", rank: 9 },
  'Amanda Ribas': { division: "Women's Strawweight", rank: 10 },
  'Fatima Kline': { division: "Women's Strawweight", rank: 11 },
  'Denise Gomes': { division: "Women's Strawweight", rank: 12 },
  'Alexia Thainara': { division: "Women's Strawweight", rank: 13 },
  'Angela Hill': { division: "Women's Strawweight", rank: 14 },
  Mizuki: { division: "Women's Strawweight", rank: 15 },
};


const getOpponentTier = (opponentName, fightEntry) => {
  if (fightEntry && fightEntry.ot != null) return fightEntry.ot;
  // Use point-in-time rankings for completed fights so opponent quality
  // reflects what the opponent was at the time, not what they are today.
  if (fightEntry?.dt) {
    return getHistoricalTier(opponentName, fightEntry.dt);
  }
  // Fall back to current rankings for upcoming fights or undated entries.
  const r = UFC_RANKINGS[opponentName];
  if (!r) return 0.12;
  if (r.rank === 'C') return 1.0;
  return Math.max(0.42, 0.93 * Math.exp(-0.037 * (r.rank - 1)));
};


const computeModernForm = (fh, daysSinceLast) => {
  const s = [...(fh || [])].sort((a, b) => (a.dt < b.dt ? 1 : -1)); // most recent first
  let num = 0,
    den = 0;
  s.slice(0, 8).forEach((f, i) => {
    const w = Math.pow(0.8, i);
    if (f.re === 'W') {
      num += w;
      den += w;
    } else if (f.re === 'L') {
      den += w; // win_i = 0; NC excluded from the window
    }
  });
  const wr = den > 0 ? num / den : 0.5;
  const mr = s[0];
  const lastLossByFinish =
    mr && mr.re === 'L' && (isKoMethod(mr.me || '') || isSubMethod(mr.me || '')) ? 1 : 0;
  const layoff = (daysSinceLast ?? 180) > 420 ? 1 : 0;
  return Math.max(-0.2, Math.min(0.85, 0.8 * wr - 0.05 * lastLossByFinish - 0.065 * layoff));
};

// ─── STRENGTH OF SCHEDULE ────────────────────────────────────────────────────
// Mean opponent tier over the last 5 fights via point-in-time getOpponentTier.
// Returns 0.12 (unranked floor) when history is absent — backtest-validated at
// SOS@0.10 + Mom@0.03 = +0.89 pp over ELO baseline (name-only YYYYMMDD tiers).

const computeSOS = (fh) => {
  if (!fh || fh.length === 0) return 0.12;
  const last5 = fh.slice(0, 5);
  const tiers = last5.map((fight) => getOpponentTier(fight.op, fight));
  return tiers.reduce((a, b) => a + b, 0) / tiers.length;
};

// ─── LAYOFF PENALTY ──────────────────────────────────────────────────────────
// Requires 'dt' field (YYYY-MM) on each fight history entry — add this to your data!
// Example: { ev: 'UFC 309', op: 'Stipe Miocic', re: 'W', dt: '2024-11', ... }

const DIVISION_UFC_AVERAGES = (() => {
  const stats = {};
  for (const d of _D2) {
    if (!d.w) continue;
    if (!stats[d.w]) {
      stats[d.w] = {
        count: 0,
        asl: 0,
        asp: 0,
        asa: 0,
        atl: 0,
        atp: 0,
        crd: 0,
        elo: 0,
      };
    }
    const bucket = stats[d.w];
    bucket.count += 1;
    bucket.asl += d.asl ?? 0;
    bucket.asp += d.asp ?? 0;
    bucket.asa += d.asa ?? 0;
    bucket.atl += d.atl ?? 0;
    bucket.atp += d.atp ?? 0;
    bucket.crd += d.crd ?? 1.0;
    bucket.elo += d.elo ?? 1500;
  }

  return Object.fromEntries(
    Object.entries(stats).map(([weightClass, bucket]) => [
      weightClass,
      {
        asl: bucket.asl / bucket.count,
        asp: bucket.asp / bucket.count,
        asa: bucket.asa / bucket.count,
        atl: bucket.atl / bucket.count,
        atp: bucket.atp / bucket.count,
        crd: bucket.crd / bucket.count,
        elo: bucket.elo / bucket.count,
      },
    ])
  );
})();


const clampNum = (value, min, max) => Math.max(min, Math.min(max, value));

function sortHistoryDesc(history) {
  return [...(history || [])].sort((a, b) => {
    const aTime = a?.dt ? new Date(a.dt).getTime() : 0;
    const bTime = b?.dt ? new Date(b.dt).getTime() : 0;
    return bTime - aTime;
  });
}


function getResultStreak(history, target) {
  let streak = 0;
  for (const fight of history || []) {
    if (fight.re !== target) break;
    streak += 1;
  }
  return streak;
}


function isDecisionMethod(method = '') {
  const m = String(method).toLowerCase().trim();
  return (
    m.startsWith('dec') ||
    m === 'u-dec' ||
    m === 's-dec' ||
    m === 'm-dec' ||
    m.includes('decision')
  );
}


function isKoMethod(method = '') {
  const m = String(method).toLowerCase().trim();

  if (!m) return false;
  if (isSubMethod(m) || isDecisionMethod(m)) return false;

  return (
    m === 'ko' ||
    m === 'tko' ||
    m === 'tko-dr' ||
    m.includes('ko/tko') ||
    m.includes(' tko') ||
    m.startsWith('tko') ||
    m === 'doctor stoppage' ||
    m === 'corner stoppage' ||
    m.includes('doctor stoppage') ||
    m.includes('corner stoppage') ||
    m.includes('retirement') ||
    m.includes('punch') ||
    m.includes('punches') ||
    m.includes('elbow') ||
    m.includes('elbows') ||
    m.includes('knee') ||
    m.includes('knees') ||
    m.includes('kick') ||
    m.includes('head kick') ||
    m.includes('body kick') ||
    m.includes('leg kick') ||
    m.includes('spinning back fist')
  );
}


function isSubMethod(method = '') {
  const m = String(method).toLowerCase().trim();

  if (!m) return false;
  if (isDecisionMethod(m)) return false;

  return (
    m === 'sub' ||
    m.includes('submission') ||
    m.includes('choke') ||
    m.includes('rear naked choke') ||
    m.includes('guillotine') ||
    m.includes('triangle') ||
    m.includes('arm triangle') ||
    m.includes('anaconda') ||
    m.includes('darce') ||
    m.includes('brabo') ||
    m.includes('bulldog choke') ||
    m.includes('von flue') ||
    m.includes('north-south choke') ||
    m.includes('armbar') ||
    m.includes('kimura') ||
    m.includes('americana') ||
    m.includes('omoplata') ||
    m.includes('kneebar') ||
    m.includes('heel hook') ||
    m.includes('toe hold') ||
    m.includes('calf slicer') ||
    m.includes('twister') ||
    m.includes('lock')
  );
}


const getDebutProspectAdjustment = (fighter, opponent) => {
  const isDebutProspect =
    !!fighter?.IS_PROSPECT && (fighter?.MODEL_UFC_FIGHT_COUNT ?? fighter?.UFC_FIGHT_COUNT ?? 0) <= 0;
  if (!isDebutProspect) {
    return {
      isDebutProspect: false,
      severeVeteranSpot: false,
      translationRisk: 0,
      resumeTrust: 1,
      finishTrust: 1,
      analyticsTrust: 1,
      ageTrust: 1,
      qualityPenalty: 0,
      directPenalty: 0,
    };
  }

  const tierBase =
    fighter.PROSPECT_TIER === 'tier1' ? 0.35 :
    fighter.PROSPECT_TIER === 'tier2' ? 0.28 :
    0.13;
  const winPctBonus  = (fighter.WIN_PCT     ?? 0) / 100 * 0.10;
  const finishBonus  = (fighter.FINISH_RATE ?? 0) / 100 * 0.10;
  const winsBonus    = Math.min(fighter.WINS ?? 0, 15) / 15 * 0.07;
  const sourceBonus  =
    fighter.PROSPECT_SOURCE === 'dwcs' ? 0.08 :
    fighter.PROSPECT_SOURCE === 'tuf'  ? 0.04 :
    0;
  const sampleTrust = fighter.PROSPECT_CONFIDENCE ?? 0.30;
  const prospectConfidence = clampNum(
    tierBase + (winPctBonus + finishBonus + winsBonus + sourceBonus) * sampleTrust,
    0.08,
    0.72
  );
  const opponentFightCount =
    opponent?.MODEL_UFC_FIGHT_COUNT ?? opponent?.UFC_FIGHT_COUNT ?? 0;
  const opponentDeepRounds =
    opponent?.MODEL_DEEP_ROUNDS ?? opponent?.DEEP_ROUNDS ?? 0;
  const opponentCredibility = clampNum(
    (opponent?.CREDIBILITY ?? 50) / 100,
    0,
    1
  );

  const translationRisk = clampNum(
    (1 - prospectConfidence) * 0.42 +
      clampNum(opponentFightCount / 15, 0, 1) * 0.38 +
      clampNum(opponentDeepRounds / 12, 0, 1) * 0.12 +
      opponentCredibility * 0.08,
    0,
    0.95
  );

  const severeVeteranSpot =
    opponentFightCount >= 8 || (opponentFightCount >= 5 && opponentDeepRounds >= 5);

  return {
    isDebutProspect: true,
    severeVeteranSpot,
    translationRisk,
    resumeTrust: clampNum(1 - translationRisk * 0.72, 0.18, 1),
    finishTrust: clampNum(1 - translationRisk * 0.78, 0.14, 1),
    analyticsTrust: clampNum(1 - translationRisk * 0.56, 0.32, 1),
    ageTrust: clampNum(1 - translationRisk * 0.62, 0.24, 1),
    qualityPenalty: parseFloat(
      (0.2 + translationRisk * (severeVeteranSpot ? 1.1 : 0.75)).toFixed(2)
    ),
    directPenalty: parseFloat(
      (translationRisk * (severeVeteranSpot ? 0.52 : 0.3)).toFixed(3)
    ),
  };
};


const ageDecayPenalty = (f) => {
  const age = f.AGE;
  if (!age || age < 35) return 0;
  // Heavier divisions lose athleticism faster — scale by weight class
  const divMultiplier = (() => {
    const wc = f.WEIGHT_CLASS || '';
    if (wc === 'Heavyweight' || wc === 'Light Heavyweight') return 1.4;
    if (wc === 'Middleweight' || wc === 'Welterweight') return 1.1;
    return 1.0; // lighter divisions
  })();
  const base = age >= 40 ? 0.12 : age >= 38 ? 0.08 : age >= 36 ? 0.05 : 0.02;
  return Math.min(0.18, base * divMultiplier);
};

const recentForm = (fh) => {
  if (!fh || !fh.length) return [];
  return fh.slice(0, 5).map((f) => f.re);
};

// ─── MODEL WEIGHTS ────────────────────────────────────────────────────────────
// DrossPom Composite v1.0 — domain-engineered linear scoring model.
// Feature weights are informed by XGBoost importance rankings trained on
// 7,177 UFC fights (2010–2026) but the live app runs a transparent composite,
// not an exported XGBoost booster.
//
// NOTE: The in-app backtest uses current career stats, not point-in-time
// pre-fight snapshots. Results are diagnostic only — not validated accuracy.


const MODEL = {
  // Feature weights (normalized, sum to 1)
  W_NO: {
    win_streak_dif: 0.077696,
    avg_td_dif: 0.068343,
    sig_str_dif: 0.063872,
    R_avg_SIG_STR_pct: 0.058393,
    total_round_dif: 0.056274,
    elo_dif: 0.055311,
    B_avg_SIG_STR_pct: 0.048587,
    loss_dif: 0.04606,
    height_dif: 0.044978,
    cardio_dif: 0.044775,
    R_avg_TD_pct: 0.043259,
    lose_streak_dif: 0.042474,
    avg_sub_att_dif: 0.04195,
    age_dif: 0.041496,
    layoff_dif: 0.041283,
    reach_dif: 0.03988,
    B_avg_TD_pct: 0.039716,
    ko_dif: 0.039261,
    win_dif: 0.03834,
    total_title_bout_dif: 0.036427,
    sub_dif: 0.031623,
  },
  // Sigmoid probability mapping: p = [sigmoid(a·c+b) + sigmoid(a·c−b)] / 2
  // Recalibrated on stored backtest composite/outcome pairs (3,380 fights):
  // slope steepened (the prior 1.6096 was underconfident, monotonic) and the
  // red-corner intercept dropped to 0 (slot assignment is arbitrary live).
  // Validated ~0.004 full / walk-forward ~0.007 log-loss improvement.
  SIGMOID_MAP: { a: 2.0, b: 0 },
  // Normalization scales (1 std of each differential feature)
  // Used to put all features on the same scale before weighting
  SCALES: {
    sig_str_dif: 15.8,
    avg_sig_str_pct_dif: 0.1,
    avg_td_dif: 1.4,
    avg_td_pct_dif: 0.23,
    avg_sub_att_dif: 0.7,
    control_time_dif: 18,
    reach_dif: 10.8,
    height_dif: 9.1,
    age_dif: 4.3,
    win_streak_dif: 1.4,
    lose_streak_dif: 1.0,
    win_dif: 4.4,
    loss_dif: 2.7,
    total_round_dif: 17.0,
    total_title_bout_dif: 1.4,
    ko_dif: 2.0,
    sub_dif: 1.4,
    elo_dif: 49.6,
    layoff_dif: 200,
    cardio_dif: 0.24,
    peak_elo_dif: 55,
    ufc_fight_count_dif: 8,
    rank_tier_dif: 0.25,
    atd_dif: 0.15,
    kd_dif: 0.025,
  },
};

// ─── MODEL_V2: learned logistic (live default model) ──────────────────────────
// Coefficients originally standardized from model_artifact.json (logistic_v1_
// 20260625), then modified in-place — see the coef block below for the 2026-07-07
// through 2026-07-09 changes. Imputer medians and scaler means are all 0 (symmetric
// training), so the only transform needed is: scaled = rawDiff / scale, then dot
// with standardized coef.
// NOTE: the artifact's 18th feature `longest_streak` is omitted — it is not stored
// in fightersData.js — so this 17-feature port differs from the artifact's 70.15%
// test accuracy. This is the LIVE DEFAULT model (MODEL_VERSION "· Logistic v2.0"):
// its output feeds v2pA/v2pB, the active-model toggle, and the bet layer.

const MODEL_V2 = {
  version: "logistic_v2.0_20260709",
  features: ["modern_form","wins","losses","rounds","title_bouts","ko_wins","sub_wins","height","reach","younger","sig_str_landed","sig_str_accuracy","sub_attempts","td_landed","td_accuracy","elo"],
  scales: {
    modern_form: 0.343, wins: 5.105, losses: 3.721,
    rounds: 23.105, title_bouts: 1.749, ko_wins: 2.446, sub_wins: 2.101,
    height: 6.257, reach: 8.941, younger: 5.256, sig_str_landed: 2.137,
    sig_str_accuracy: 0.128, sub_attempts: 1.036, td_landed: 1.974,
    td_accuracy: 0.312, elo: 1.072
  },
  coef: {
    // RED features zeroed 2026-07-07: wins/losses/ko_wins/sub_wins/title_bouts
    // had inverted outcome correlations (same issue that caused v1 to zero
    // win_dif); out-of-sample (42 graded fights) confirmed removing them helps.
    // win_streak/lose_streak replaced 2026-07-08 with modern_form (exp-weighted
    // last-8 win rate + finish-loss/layoff penalties) — 42-fight OOS confirmed
    // v2 64.3% -> 66.7% with zero regressions; see BASELINE_NOTES.md.
    younger: 0.274, elo: 0.246, sig_str_landed: 0.243, td_landed: 0.224,
    wins: 0, sig_str_accuracy: 0.193, modern_form: 0.175,
    sub_attempts: 0.155, losses: 0, rounds: 0.105,
    title_bouts: 0, sub_wins: 0, reach: 0.073,
    ko_wins: 0, height: 0.060, td_accuracy: 0.049
  }
};

// [MODEL-ADJACENT] contributions is additive only -- captures each term
// before summing instead of discarding it. Same array, same left-to-right
// iteration order a .reduce() over MODEL_V2.features would walk, so
// floating-point rounding is identical at every step and logit/pA/pB are
// bit-identical to the prior reduce-only implementation. Proven across
// 280,552 real same-division pairs (0 mismatches) -- rerun with
// node scripts/verify_v2_contribution_bitproof.js. SCALES is read-only here.

const computeLogisticProb = (featsV2) => {
  const contributions = {};
  let logit = 0;
  for (const k of MODEL_V2.features) {
    const c = (featsV2[k] / MODEL_V2.scales[k]) * MODEL_V2.coef[k];
    contributions[k] = c;
    logit += c;
  }
  const pA = 1 / (1 + Math.exp(-logit));
  return { pA, pB: 1 - pA, contributions };
};

// ─── PREDICTION ENGINE ────────────────────────────────────────────────────────
// DrossPom Composite v1.0 — transparent linear scoring model.
// Computes win probability for fA vs fB using domain-engineered feature
// differentials. Weights are informed by XGBoost importance rankings but this
// is a composite model, not a live XGBoost booster.
//
// Probability = sigmoid(a * composite + b)
// Odds do NOT affect win probability. They are used only in the betting layer.


// modelContext is an OPTIONAL third argument. It exists so characterisation
// tests can pin the normalisation context that would otherwise drift every time
// the roster is refreshed -- DIVISION_UFC_AVERAGES is derived from the whole
// _D2 roster at module load, so a single fighter's stats moving shifts every
// division mean and therefore every golden.
//
// Production NEVER passes it. Every application call site remains two-argument
// and keeps reading the live roster averages, which is the intended behaviour:
// the app must adapt when new fighter data arrives. Only the frozen tests inject
// a context, so they compare the model under fixed conditions.
//
// Scope is deliberately limited to divisionAverages. Coefficients, rankings,
// SOS behaviour and clocks are NOT injectable here.
const computeMatchupEdges = (fA, fB, modelContext) => {
  const S = MODEL.SCALES;
  const debutAdjA = getDebutProspectAdjustment(fA, fB);
  const debutAdjB = getDebutProspectAdjustment(fB, fA);
  const agePenA = ageDecayPenalty(fA);
  const agePenB = ageDecayPenalty(fB);

  // Discount striking stats for fighters on losing streaks so high-volume
  // output in losses does not overstate current offensive strength.
  const formDecay = (ls) => Math.max(0.8, 1 - Math.min(ls ?? 0, 3) * 0.07);
  const loseStreakA = fA.MODEL_UFC_LOSE_STREAK ?? fA.LOSE_STREAK ?? 0;
  const loseStreakB = fB.MODEL_UFC_LOSE_STREAK ?? fB.LOSE_STREAK ?? 0;
  const winStreakA = fA.MODEL_UFC_WIN_STREAK ?? fA.WIN_STREAK ?? 0;
  const winStreakB = fB.MODEL_UFC_WIN_STREAK ?? fB.WIN_STREAK ?? 0;
  // Omitted context => live roster averages, byte-identical to the previous
  // behaviour. This is the only place divisionAverages is read.
  const divisionAverages = modelContext?.divisionAverages ?? DIVISION_UFC_AVERAGES;
  const divA = divisionAverages[fA.WEIGHT_CLASS] ?? {};
  const divB = divisionAverages[fB.WEIGHT_CLASS] ?? {};
  const totalMinA = fA.TOTAL_MIN ?? 0;
  const totalMinB = fB.TOTAL_MIN ?? 0;
  // Blend a fighter's observed stat toward the division mean when sample is small
  const sampleBlend = (stat, divMean, totalMin) => {
    const w = Math.min(1.0, totalMin / 75);
    return w * stat + (1 - w) * divMean;
  };
  const aslA =
    sampleBlend(fA.ASL ?? 0, divA.asl ?? 3.5, totalMinA) *
    formDecay(loseStreakA) *
    (debutAdjA.isDebutProspect ? debutAdjA.analyticsTrust : 1);
  const aslB =
    sampleBlend(fB.ASL ?? 0, divB.asl ?? 3.5, totalMinB) *
    formDecay(loseStreakB) *
    (debutAdjB.isDebutProspect ? debutAdjB.analyticsTrust : 1);
  const aspA =
    sampleBlend(fA.ASP ?? 0, divA.asp ?? 0.44, totalMinA) *
    (0.6 + 0.4 * formDecay(loseStreakA)) *
    (debutAdjA.isDebutProspect ? (0.82 + debutAdjA.analyticsTrust * 0.18) : 1);
  const aspB =
    sampleBlend(fB.ASP ?? 0, divB.asp ?? 0.44, totalMinB) *
    (0.6 + 0.4 * formDecay(loseStreakB)) *
    (debutAdjB.isDebutProspect ? (0.82 + debutAdjB.analyticsTrust * 0.18) : 1);
  const atlA = sampleBlend(fA.ATL ?? 0, divA.atl ?? 1.0, totalMinA);
  const atlB = sampleBlend(fB.ATL ?? 0, divB.atl ?? 1.0, totalMinB);
  const atpA = sampleBlend(fA.ATP ?? 0, divA.atp ?? 0.35, totalMinA);
  const atpB = sampleBlend(fB.ATP ?? 0, divB.atp ?? 0.35, totalMinB);
  const atdA = sampleBlend(fA.ATD ?? 0.60, 0.60, totalMinA);
  const atdB = sampleBlend(fB.ATD ?? 0.60, 0.60, totalMinB);
  const asaA = sampleBlend(fA.ASA ?? 0, divA.asa ?? 0.25, totalMinA);
  const asaB = sampleBlend(fB.ASA ?? 0, divB.asa ?? 0.25, totalMinB);
  const winsA = fA.MODEL_UFC_WINS ?? fA.WINS ?? 0;
  const winsB = fB.MODEL_UFC_WINS ?? fB.WINS ?? 0;
  const lossesA = fA.MODEL_UFC_LOSSES ?? fA.LOSSES ?? 0;
  const lossesB = fB.MODEL_UFC_LOSSES ?? fB.LOSSES ?? 0;
  const roundsA = fA.MODEL_TOTAL_ROUNDS ?? fA.TOTAL_ROUNDS ?? 0;
  const roundsB = fB.MODEL_TOTAL_ROUNDS ?? fB.TOTAL_ROUNDS ?? 0;
  const deepRoundsA = fA.MODEL_DEEP_ROUNDS ?? fA.DEEP_ROUNDS ?? 0;
  const deepRoundsB = fB.MODEL_DEEP_ROUNDS ?? fB.DEEP_ROUNDS ?? 0;
  const titleBoutsA = fA.MODEL_TITLE_BOUTS ?? fA.TITLE_BOUTS ?? 0;
  const titleBoutsB = fB.MODEL_TITLE_BOUTS ?? fB.TITLE_BOUTS ?? 0;
  const koWinsA = fA.MODEL_KO_WINS ?? fA.KO_WINS ?? 0;
  const koWinsB = fB.MODEL_KO_WINS ?? fB.KO_WINS ?? 0;
  const subWinsA = fA.MODEL_SUB_WINS ?? fA.SUB_WINS ?? 0;
  const subWinsB = fB.MODEL_SUB_WINS ?? fB.SUB_WINS ?? 0;
  const ufcFightCountA = fA.MODEL_UFC_FIGHT_COUNT ?? fA.UFC_FIGHT_COUNT ?? 0;
  const ufcFightCountB = fB.MODEL_UFC_FIGHT_COUNT ?? fB.UFC_FIGHT_COUNT ?? 0;
  const neutralLosses = debutAdjA.isDebutProspect || debutAdjB.isDebutProspect;
  const effectiveLossesA = neutralLosses ? 0 : lossesA;
  const effectiveLossesB = neutralLosses ? 0 : lossesB;
  const effectiveKoWinsA = koWinsA * debutAdjA.finishTrust;
  const effectiveKoWinsB = koWinsB * debutAdjB.finishTrust;
  const effectiveSubWinsA = subWinsA * debutAdjA.finishTrust;
  const effectiveSubWinsB = subWinsB * debutAdjB.finishTrust;
  const effectiveEloA =
    1500 + ((fA.ELO ?? 1500) - 1500) * debutAdjA.analyticsTrust;
  const effectiveEloB =
    1500 + ((fB.ELO ?? 1500) - 1500) * debutAdjB.analyticsTrust;
  const effectiveCardioA =
    1 + ((fA.CARDIO_RATIO ?? 1) - 1) * debutAdjA.analyticsTrust;
  const effectiveCardioB =
    1 + ((fB.CARDIO_RATIO ?? 1) - 1) * debutAdjB.analyticsTrust;
  const effectiveQualMomA =
    (fA.QUALITY_MOMENTUM ?? 0) - debutAdjA.qualityPenalty;
  const effectiveQualMomB =
    (fB.QUALITY_MOMENTUM ?? 0) - debutAdjB.qualityPenalty;
  let ageDiff =
    ((fB.AGE ?? 30) - (fA.AGE ?? 30)) / S.age_dif;
  if (debutAdjA.isDebutProspect && ageDiff > 0) ageDiff *= debutAdjA.ageTrust;
  if (debutAdjB.isDebutProspect && ageDiff < 0) ageDiff *= debutAdjB.ageTrust;

  // ── Compute each raw differential ──────────────────────────────────────────
  const feats = {
    sig_str_dif: (aslA - aslB) / S.sig_str_dif,
    avg_sig_str_pct_dif: (aspA - aspB) / S.avg_sig_str_pct_dif,
    avg_td_dif: (atlA - atlB) / S.avg_td_dif,
    avg_td_pct_dif: (atpA - atpB) / S.avg_td_pct_dif,
    atd_dif: (atdA - atdB) / S.atd_dif,
    avg_sub_att_dif: (asaA - asaB) / S.avg_sub_att_dif,
    kd_dif: ((fA.KD_PER_MIN ?? 0) - (fB.KD_PER_MIN ?? 0)) / S.kd_dif,
    control_time_dif:
      ((fA.CONTROL_TIME_PCT ?? 0) - (fB.CONTROL_TIME_PCT ?? 0)) /
      S.control_time_dif,
    reach_dif: ((fA.REACH_IN ?? 0) - (fB.REACH_IN ?? 0)) / S.reach_dif,
    height_dif: ((fA.HEIGHT_IN ?? 0) - (fB.HEIGHT_IN ?? 0)) / S.height_dif,
    age_dif: ageDiff, // reversed: younger is better, capped in debut-vs-veteran spots
    win_streak_dif: (winStreakA - winStreakB) / S.win_streak_dif,
    lose_streak_dif: (loseStreakB - loseStreakA) / S.lose_streak_dif, // reversed
    win_dif: (winsA - winsB) / S.win_dif,
    loss_dif: (effectiveLossesB - effectiveLossesA) / S.loss_dif, // reversed; debutants do not get free credit for 0 UFC losses
    total_round_dif: (roundsA - roundsB) / S.total_round_dif,
    deep_round_dif: (deepRoundsA - deepRoundsB) / S.total_round_dif,
    total_title_bout_dif:
      (titleBoutsA - titleBoutsB) / S.total_title_bout_dif,
    ko_dif: (effectiveKoWinsA - effectiveKoWinsB) / S.ko_dif,
    sub_dif: (effectiveSubWinsA - effectiveSubWinsB) / S.sub_dif,
    elo_dif: (effectiveEloA - effectiveEloB) / S.elo_dif,
    layoff_dif:
      ((fB.DAYS_SINCE_LAST ?? 180) - (fA.DAYS_SINCE_LAST ?? 180)) /
      S.layoff_dif, // reversed
    cardio_dif:
      (effectiveCardioA - effectiveCardioB) / S.cardio_dif,
    peak_elo_dif:
      ((fA.ELO_PEAK ?? fA.ELO ?? 1500) - (fB.ELO_PEAK ?? fB.ELO ?? 1500)) /
      S.peak_elo_dif,
    ufc_fight_count_dif: (ufcFightCountA - ufcFightCountB) / S.ufc_fight_count_dif,
    rank_tier_dif:
      ((fA.RANK_TIER ?? 0.12) - (fB.RANK_TIER ?? 0.12)) / S.rank_tier_dif,
  };

  // ── Map features to the weight keys used in training ──────────────────────
  // NOTE: The model trained on R_avg_SIG_STR_pct and B_avg_SIG_STR_pct as
  // separate absolute features. Here we combine them into one differential and
  // use their summed weight.
  const W = MODEL.W_NO;
  // Sum (not average): the model trained R and B accuracy as *separate* features,
  // each contributing their own weight. Collapsing into one differential means
  // the combined weight must be the total — halving it cuts the signal by 50%.
  const accCombinedW = W.R_avg_SIG_STR_pct + W.B_avg_SIG_STR_pct;
  const tdCombinedW = W.R_avg_TD_pct + W.B_avg_TD_pct;
  // Grappling: atd_dif is a small rule-based addition (disclosed); its weight
  // is carved from the pool so total grappling weight stays constant.
  const ATD_DEF_W = 0.04;
  const grapplingWeightPool = W.avg_td_dif + tdCombinedW + W.avg_sub_att_dif;
  const grapplingScale = (grapplingWeightPool - ATD_DEF_W) / grapplingWeightPool;
  const tdOffenseWeight = W.avg_td_dif * grapplingScale;
  const tdDefenseWeight = tdCombinedW * grapplingScale;
  const subThreatWeight = W.avg_sub_att_dif * grapplingScale;
  // Experience: split total_round_dif weight between UFC fight count and deep rounds
  const experienceWeightPool = W.total_round_dif + W.total_title_bout_dif;
  const fightCountWeight = experienceWeightPool * 0.58;
  const deepRoundsWeight = experienceWeightPool * 0.42;

  const clamp = (v) => Math.max(-2, Math.min(2, v));
  const auditRow = ({
    group,
    label,
    aLabel,
    bLabel,
    aValue,
    bValue,
    diff,
    scale,
    weight,
    higherBetter = true,
  }) => ({
    group,
    label,
    aLabel,
    bLabel,
    aValue,
    bValue,
    diff,
    scale,
    weight,
    higherBetter,
    clamped: clamp(diff),
    contribution: clamp(diff) * weight,
  });

  // ── Group into display edges ───────────────────────────────────────────────
  const strikingScore =
    clamp(feats.sig_str_dif) * W.sig_str_dif +
    clamp(feats.avg_sig_str_pct_dif) * accCombinedW;

  const grapplingScore =
    clamp(feats.avg_td_dif) * tdOffenseWeight +
    clamp(feats.avg_td_pct_dif) * tdDefenseWeight +
    clamp(feats.avg_sub_att_dif) * subThreatWeight +
    clamp(feats.atd_dif) * ATD_DEF_W;

  const physicalScore =
    clamp(feats.reach_dif) * W.reach_dif +
    clamp(feats.height_dif) * W.height_dif +
    clamp(feats.age_dif) * W.age_dif;

  const formScore =
    clamp(feats.win_streak_dif) * W.win_streak_dif +
    clamp(feats.lose_streak_dif) * W.lose_streak_dif +
    clamp(feats.win_dif) * W.win_dif +
    clamp(feats.loss_dif) * W.loss_dif;

  const expScore =
    clamp(feats.ufc_fight_count_dif) * fightCountWeight +
    clamp(feats.deep_round_dif) * deepRoundsWeight +
    clamp(feats.ko_dif) * W.ko_dif +
    clamp(feats.sub_dif) * W.sub_dif;

  const analyticsScore =
    clamp(feats.elo_dif) * W.elo_dif +
    clamp(feats.layoff_dif) * W.layoff_dif +
    clamp(feats.cardio_dif) * W.cardio_dif;

  // NOTE: peak_elo_dif and rank_tier_dif are computed in feats but NOT added to
  // the composite. ufc_fight_count_dif is folded into the experience bucket as a
  // proxy for total rounds (better handles early-finisher inflation).

  // Context variables retained for UI warnings/display:
  const QUALITY_MOM_W = 0.055; // kept for display weight reference only
  const qualMomDiff = effectiveQualMomA - effectiveQualMomB;

  const sosA = computeSOS(fA.FIGHT_HISTORY || []);
  const sosB = computeSOS(fB.FIGHT_HISTORY || []);
  const sosDiff = sosA - sosB;
  const lossStreakPenaltyA = loseStreakA >= 2 ? Math.min((loseStreakA - 1) * 0.04, 0.10) : 0;
  const lossStreakPenaltyB = loseStreakB >= 2 ? Math.min((loseStreakB - 1) * 0.04, 0.10) : 0;
  const southpawMismatch =
    (fA.STANCE === 'Southpaw' && fB.STANCE === 'Orthodox') ||
    (fA.STANCE === 'Orthodox' && fB.STANCE === 'Southpaw');
  const debutMatchup = debutAdjA.isDebutProspect || debutAdjB.isDebutProspect;
  const agePenaltyA = agePenA;
  const agePenaltyB = agePenB;

  const auditRows = [
    auditRow({
      group: 'Striking',
      label: 'Sig Strikes Landed / Min',
      aLabel: 'ASL',
      bLabel: 'ASL',
      aValue: aslA,
      bValue: aslB,
      diff: feats.sig_str_dif,
      scale: S.sig_str_dif,
      weight: W.sig_str_dif,
    }),
    auditRow({
      group: 'Striking',
      label: 'Strike Accuracy',
      aLabel: 'ASP',
      bLabel: 'ASP',
      aValue: aspA,
      bValue: aspB,
      diff: feats.avg_sig_str_pct_dif,
      scale: S.avg_sig_str_pct_dif,
      weight: accCombinedW,
    }),
    auditRow({
      group: 'Grappling',
      label: 'Takedowns / 15 Min',
      aLabel: 'ATL',
      bLabel: 'ATL',
      aValue: fA.ATL ?? 0,
      bValue: fB.ATL ?? 0,
      diff: feats.avg_td_dif,
      scale: S.avg_td_dif,
      weight: tdOffenseWeight,
    }),
    auditRow({
      group: 'Grappling',
      label: 'Takedown Accuracy',
      aLabel: 'ATP',
      bLabel: 'ATP',
      aValue: fA.ATP ?? 0,
      bValue: fB.ATP ?? 0,
      diff: feats.avg_td_pct_dif,
      scale: S.avg_td_pct_dif,
      weight: tdDefenseWeight,
    }),
    auditRow({
      group: 'Grappling',
      label: 'Sub Attempts / 15 Min',
      aLabel: 'ASA',
      bLabel: 'ASA',
      aValue: fA.ASA ?? 0,
      bValue: fB.ASA ?? 0,
      diff: feats.avg_sub_att_dif,
      scale: S.avg_sub_att_dif,
      weight: subThreatWeight,
    }),
    auditRow({
      group: 'Grappling',
      label: 'TD Defense %',
      aLabel: 'ATD',
      bLabel: 'ATD',
      aValue: fA.ATD ?? 0.60,
      bValue: fB.ATD ?? 0.60,
      diff: feats.atd_dif,
      scale: S.atd_dif,
      weight: ATD_DEF_W,
    }),
    auditRow({
      group: 'Physical',
      label: 'Reach',
      aLabel: 'REACH_IN',
      bLabel: 'REACH_IN',
      aValue: fA.REACH_IN ?? 0,
      bValue: fB.REACH_IN ?? 0,
      diff: feats.reach_dif,
      scale: S.reach_dif,
      weight: W.reach_dif,
    }),
    auditRow({
      group: 'Physical',
      label: 'Height',
      aLabel: 'HEIGHT_IN',
      bLabel: 'HEIGHT_IN',
      aValue: fA.HEIGHT_IN ?? 0,
      bValue: fB.HEIGHT_IN ?? 0,
      diff: feats.height_dif,
      scale: S.height_dif,
      weight: W.height_dif,
    }),
    auditRow({
      group: 'Physical',
      label: 'Age',
      aLabel: 'AGE',
      bLabel: 'AGE',
      aValue: fA.AGE ?? 30,
      bValue: fB.AGE ?? 30,
      diff: feats.age_dif,
      scale: S.age_dif,
      weight: W.age_dif,
      higherBetter: false,
    }),
    auditRow({
      group: 'Form',
      label: 'Win Streak',
      aLabel: 'WIN_STREAK',
      bLabel: 'WIN_STREAK',
      aValue: winStreakA,
      bValue: winStreakB,
      diff: feats.win_streak_dif,
      scale: S.win_streak_dif,
      weight: W.win_streak_dif,
    }),
    auditRow({
      group: 'Form',
      label: 'Loss Streak',
      aLabel: 'LOSE_STREAK',
      bLabel: 'LOSE_STREAK',
      aValue: loseStreakA,
      bValue: loseStreakB,
      diff: feats.lose_streak_dif,
      scale: S.lose_streak_dif,
      weight: W.lose_streak_dif,
      higherBetter: false,
    }),
    auditRow({
      group: 'Form',
      label: 'UFC Wins',
      aLabel: 'WINS',
      bLabel: 'WINS',
      aValue: winsA,
      bValue: winsB,
      diff: feats.win_dif,
      scale: S.win_dif,
      weight: W.win_dif,
    }),
    auditRow({
      group: 'Form',
      label: 'UFC Losses',
      aLabel: 'LOSSES',
      bLabel: 'LOSSES',
      aValue: neutralLosses ? 'Neutralized' : lossesA,
      bValue: neutralLosses ? 'Neutralized' : lossesB,
      diff: feats.loss_dif,
      scale: S.loss_dif,
      weight: W.loss_dif,
      higherBetter: false,
    }),
    auditRow({
      group: 'Experience',
      label: 'UFC Fight Count',
      aLabel: 'UFC_FIGHT_COUNT',
      bLabel: 'UFC_FIGHT_COUNT',
      aValue: fA.UFC_FIGHT_COUNT ?? 0,
      bValue: fB.UFC_FIGHT_COUNT ?? 0,
      diff: feats.ufc_fight_count_dif,
      scale: S.ufc_fight_count_dif,
      weight: fightCountWeight,
    }),
    auditRow({
      group: 'Experience',
      label: 'Fights Reaching R3+',
      aLabel: 'DEEP_ROUNDS',
      bLabel: 'DEEP_ROUNDS',
      aValue: fA.DEEP_ROUNDS ?? 0,
      bValue: fB.DEEP_ROUNDS ?? 0,
      diff: feats.deep_round_dif,
      scale: S.total_round_dif,
      weight: deepRoundsWeight,
    }),
    auditRow({
      group: 'Finishing',
      label: 'KO Wins',
      aLabel: 'KO_WINS',
      bLabel: 'KO_WINS',
      aValue: parseFloat(effectiveKoWinsA.toFixed(2)),
      bValue: parseFloat(effectiveKoWinsB.toFixed(2)),
      diff: feats.ko_dif,
      scale: S.ko_dif,
      weight: W.ko_dif,
    }),
    auditRow({
      group: 'Finishing',
      label: 'Submission Wins',
      aLabel: 'SUB_WINS',
      bLabel: 'SUB_WINS',
      aValue: parseFloat(effectiveSubWinsA.toFixed(2)),
      bValue: parseFloat(effectiveSubWinsB.toFixed(2)),
      diff: feats.sub_dif,
      scale: S.sub_dif,
      weight: W.sub_dif,
    }),
    auditRow({
      group: 'Analytics',
      label: 'ELO',
      aLabel: 'ELO',
      bLabel: 'ELO',
      aValue: parseFloat(effectiveEloA.toFixed(1)),
      bValue: parseFloat(effectiveEloB.toFixed(1)),
      diff: feats.elo_dif,
      scale: S.elo_dif,
      weight: W.elo_dif,
    }),
    auditRow({
      group: 'Analytics',
      label: 'Days Since Last Fight',
      aLabel: 'DAYS_SINCE_LAST',
      bLabel: 'DAYS_SINCE_LAST',
      aValue: fA.DAYS_SINCE_LAST ?? 180,
      bValue: fB.DAYS_SINCE_LAST ?? 180,
      diff: feats.layoff_dif,
      scale: S.layoff_dif,
      weight: W.layoff_dif,
      higherBetter: false,
    }),
    auditRow({
      group: 'Analytics',
      label: 'Cardio Ratio',
      aLabel: 'CARDIO_RATIO',
      bLabel: 'CARDIO_RATIO',
      aValue: parseFloat(effectiveCardioA.toFixed(2)),
      bValue: parseFloat(effectiveCardioB.toFixed(2)),
      diff: feats.cardio_dif,
      scale: S.cardio_dif,
      weight: W.cardio_dif,
    }),
  ];



  // DrossPom Composite v1.0: six domain scores plus age-decay and schedule terms.
  // agePenAdj: 1.5× magnitude (backtest: +0.33 pp, monotonic sweep).
  // sosDiff/qualMomDiff: backtest-validated SOS@0.10 + Mom@0.03 = +0.89 pp
  //   over ELO baseline (name-only YYYYMMDD tiers, 3380 fights, 0 contamination).
  const agePenAdj = 1.5 * (agePenB - agePenA);
  // Named so they can be returned below (Global group contribution display)
  // without changing the composite arithmetic -- same expressions, just no
  // longer inlined.
  const sosContribution = clamp(sosDiff) * 0.10;
  const qualMomContribution = clamp(qualMomDiff) * 0.03;
  const composite =
    strikingScore +
    grapplingScore +
    physicalScore +
    formScore +
    expScore +
    analyticsScore +
    agePenAdj +
    sosContribution +
    qualMomContribution;

  // ── Sigmoid probability mapping ───────────────────────────────────────────
  // p(A wins) = sigmoid(a * composite + b)
  // Parameters require refit on cleaned composite/outcome pairs (Sprint 2).
  const P = MODEL.SIGMOID_MAP;
  // Orientation-symmetric: averaging both slot orientations makes pA + pB = 1 and
  // the pick slot-order invariant; validated at 61.1% on the clean 3,380-fight
  // point-in-time backtest.
  const pA =
    (1 / (1 + Math.exp(-(P.a * composite + P.b))) +
      1 / (1 + Math.exp(-(P.a * composite - P.b)))) /
    2;

  // ── MODEL_V2 run: computed alongside v1, returned separately as v2pA/v2pB (does
  // not overwrite v1's pA/pB). v2 is the live DEFAULT model — its output drives the
  // active-model toggle and the bet layer downstream.
  const modernFormA = computeModernForm(fA.FIGHT_HISTORY, fA.DAYS_SINCE_LAST);
  const modernFormB = computeModernForm(fB.FIGHT_HISTORY, fB.DAYS_SINCE_LAST);
  const featsV2 = {
    modern_form:      modernFormA - modernFormB,
    wins:             winsA - winsB,
    losses:           lossesB - lossesA,
    rounds:           roundsA - roundsB,
    title_bouts:      titleBoutsA - titleBoutsB,
    ko_wins:          koWinsA - koWinsB,
    sub_wins:         subWinsA - subWinsB,
    height:           (fA.HEIGHT_IN ?? 69) - (fB.HEIGHT_IN ?? 69),
    reach:            (fA.REACH_IN ?? 70) - (fB.REACH_IN ?? 70),
    younger:          (fB.AGE ?? 30) - (fA.AGE ?? 30),
    sig_str_landed:   aslA - aslB,
    sig_str_accuracy: aspA - aspB,
    sub_attempts:     asaA - asaB,
    td_landed:        atlA - atlB,
    td_accuracy:      atpA - atpB,
    // ELO diff is /100 to match the training feature's units (ELO in hundreds);
    // scales.elo (1.072) is the artifact std of THAT /100 feature. Do NOT also
    // scale by ~107 — that double-divides and crushes ELO ~100x (fixed 2026-07-09).
    elo:              (effectiveEloA - effectiveEloB) / 100,
  };
  const v2 = computeLogisticProb(featsV2);
  const featsV2flip = {
    modern_form:      modernFormB - modernFormA,
    wins:             winsB - winsA,
    losses:           lossesA - lossesB,
    rounds:           roundsB - roundsA,
    title_bouts:      titleBoutsB - titleBoutsA,
    ko_wins:          koWinsB - koWinsA,
    sub_wins:         subWinsB - subWinsA,
    height:           (fB.HEIGHT_IN ?? 69) - (fA.HEIGHT_IN ?? 69),
    reach:            (fB.REACH_IN ?? 70) - (fA.REACH_IN ?? 70),
    younger:          (fA.AGE ?? 30) - (fB.AGE ?? 30),
    sig_str_landed:   aslB - aslA,
    sig_str_accuracy: aspB - aspA,
    sub_attempts:     asaB - asaA,
    td_landed:        atlB - atlA,
    td_accuracy:      atpB - atpA,
    elo:              (effectiveEloB - effectiveEloA) / 100,
  };
  const v2flip = computeLogisticProb(featsV2flip);
  // Symmetry invariant, previously a console.assert with a 0.001 tolerance.
  // Stage 0 measured the real bound at 1 ULP (1.11e-16), ~13 orders of
  // magnitude tighter, and Stage 4 asserts it properly in Vitest.

  const clampE = (v) => Math.max(-1.5, Math.min(1.5, v));
  const mkEdge = (raw, label, icon, weight) => ({
    raw,
    label,
    icon,
    weight,
    clamped: clampE(raw),
    weighted: clampE(raw) * weight,
  });
  const edges = {
    striking: mkEdge(
      strikingScore,
      'Striking',
      '⚔️',
      W.sig_str_dif + accCombinedW
    ),
    grappling: mkEdge(
      grapplingScore,
      'Grappling',
      '🤼',
      grapplingWeightPool
    ),
    physical: mkEdge(
      physicalScore,
      'Physical',
      '📏',
      W.reach_dif + W.height_dif + W.age_dif
    ),
    form: mkEdge(
      formScore,
      'Form',
      '📈',
      W.win_streak_dif + W.lose_streak_dif + W.win_dif + W.loss_dif
    ),
    experience: mkEdge(
      expScore,
      'Experience',
      '🎖️',
      experienceWeightPool + W.ko_dif + W.sub_dif
    ),
    analytics: mkEdge(
      analyticsScore,
      'Analytics',
      '📊',
      W.elo_dif + W.layoff_dif + W.cardio_dif
    ),
    // Legacy key aliases — old UI references these by name
    rating: mkEdge(analyticsScore, 'Analytics', '🏆', W.elo_dif),
    momentum: mkEdge(formScore, 'Form', '📈', W.win_streak_dif),
    finishing: mkEdge(expScore, 'Experience', '💥', W.ko_dif),
    cardio: mkEdge(analyticsScore, 'Cardio', '💨', W.cardio_dif),
    age: mkEdge(physicalScore, 'Age/Decay', '📉', W.age_dif),
    elo: mkEdge(analyticsScore, 'ELO', '📊', W.elo_dif),
  };

  return {
    pA,
    pB: 1 - pA,
    composite,
    edges,
    auditRows,
    activeWeights: W,
    activeScales: S,
    feats,
    // Legacy fields kept for UI compatibility
    diff: (fA.ELO ?? 1500) - (fB.ELO ?? 1500),
    adjA: fA.ADJUSTED_RATING ?? 0,
    adjB: fB.ADJUSTED_RATING ?? 0,
    avgCred: ((fA.CREDIBILITY ?? 50) + (fB.CREDIBILITY ?? 50)) / 200,
    scaledComposite: composite,
    penA: 0,
    penB: 0,
    layA: 0,
    layB: 0,
    stanceMismatch: fA.STANCE !== fB.STANCE,
    southpawBonus: southpawMismatch ? 1 : 0,
    grapplerBonus: 0,
    cardioStrikerBonus: 0,
    reachEdge: (fA.REACH_IN ?? 0) - (fB.REACH_IN ?? 0),
    heightEdge: (fA.HEIGHT_IN ?? 0) - (fB.HEIGHT_IN ?? 0),
    // Context variables for UI flags
    southpawMismatch,
    debutMatchup,
    loseStreakA,
    loseStreakB,
    qualMomDiff,
    agePenaltyA,
    agePenaltyB,
    sosDiff,
    sosA,
    sosB,
    v2pA: v2.pA,
    v2pB: v2.pB,
    // Additive only: exposes the already-computed v2 feature vector for
    // provenance/manifest capture (buildRoiEntry's _provenance.featureVector).
    // Does not change v2pA/v2pB or any other computation above.
    featsV2,
    // Additive only: per-feature signed contributions to v2's logit, keyed
    // by MODEL_V2 feature name (see computeLogisticProb). Does not change
    // v2pA/v2pB -- v2.pA/v2.pB are still derived from the same summed logit.
    v2Contributions: v2.contributions,
    // Additive only: the three v1 composite contributors that belong to no
    // domain (App.js:3846-3860's agePenAdj/sosContribution/
    // qualMomContribution feed `composite` directly). Exposed for the
    // Simulator's Global contribution group -- does not change composite,
    // pA/pB, edges, or auditRows above.
    agePenAdj,
    sosContribution,
    qualMomContribution,
  };
};

// Latest 'dt' present in a fighter's FIGHT_HISTORY at computation time — used
// only for provenance capture (_provenance.fightHistoryCutoff), not for any
// prediction calculation.
const latestFightHistoryDate = (fightHistory) => {
  if (!fightHistory || fightHistory.length === 0) return null;
  let max = null;
  for (const f of fightHistory) {
    if (f.dt && (max === null || f.dt > max)) max = f.dt;
  }
  return max;
};

export {
  UFC_RANKINGS,
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
};
