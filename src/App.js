import React, { useEffect, useState, useMemo } from 'react';
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
  Cell,
} from 'recharts';
import {
  BarChart2,
  Swords,
  User,
  ChevronUp,
  ChevronDown,
  Search,
  Shield,
  Zap,
  Target,
  Wind,
  Filter,
  Info,
  TrendingDown,
  Ruler,
  Trophy,
  Clock,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { _D2 } from './fightersData';
import { ELO_RATINGS } from './eloModule';
import { CARDIO_RATIOS } from './cardioModule';
import { FIGHT_HISTORY } from './fightHistory';
import { ROI_ENTRIES } from './roiData';

// _D2 imported from fightersData.js

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
  'Ian Machado Garry': { division: 'Welterweight', rank: 2 },
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
  // Historical tier lookup removed in v5 (rankHistory.js deprecated)
  // Fall back to current rankings (for upcoming fights with no history)
  const r = UFC_RANKINGS[opponentName];
  if (!r) return 0.12;
  if (r.rank === 'C') return 1.0;
  return Math.max(0.42, 0.93 * Math.exp(-0.037 * (r.rank - 1)));
};

const ufcRankLabel = (name) => {
  const r = UFC_RANKINGS[name];
  if (!r) return null;
  return r.rank === 'C' ? 'C' : `#${r.rank}`;
};

const currentRankTier = (rankObj) => {
  if (!rankObj) return 0.12;
  const rank = rankObj.rank;
  if (rank === 'C' || rank === 0) return 1.0;
  return Math.max(0.42, 0.93 * Math.exp(-0.037 * (rank - 1)));
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

// ─── LAYOFF PENALTY ──────────────────────────────────────────────────────────
// Requires 'dt' field (YYYY-MM) on each fight history entry — add this to your data!
// Example: { ev: 'UFC 309', op: 'Stipe Miocic', re: 'W', dt: '2024-11', ... }
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

const getFightRoundCount = (fight) => Math.max(1, Number(fight?.rn) || 3);

const sumFightRounds = (history) =>
  (history || []).reduce((sum, fight) => sum + getFightRoundCount(fight), 0);

// "Deep rounds" capture proven ability to operate once a fight extends past
// the early finishing window, without rewarding raw accumulated rounds alone.
const sumDeepRounds = (history) =>
  (history || []).reduce(
    (sum, fight) => sum + Math.max(0, getFightRoundCount(fight) - 2),
    0
  );

// ─── FIGHTERS MAPPING (v5) ────────────────────────────────────────────────────
// Replace the entire `const FIGHTERS = _D.map((d) => { ... });` block with this.
// Uses compact field names from fightersData.js (_D2 array).

// Per-division ELO normalization (min/max per division → 0–100 rating)
const DIV_ELO_STATS = (() => {
  const stats = {};
  for (const d of _D2) {
    if (!d.w || !d.elo) continue;
    if (!stats[d.w]) stats[d.w] = { min: Infinity, max: -Infinity };
    if (d.elo < stats[d.w].min) stats[d.w].min = d.elo;
    if (d.elo > stats[d.w].max) stats[d.w].max = d.elo;
  }
  return stats;
})();

const eloToRating = (elo, weightClass) => {
  const s = DIV_ELO_STATS[weightClass];
  if (!s || s.max === s.min) return 50;
  return Math.round(((elo - s.min) / (s.max - s.min)) * 100);
};

const FIGHTERS = _D2.map((d) => {
  const eloRec = ELO_RATINGS[d.n] ?? null;
  const fightHistory = FIGHT_HISTORY[d.n] ?? [];
  const officialRank = UFC_RANKINGS[d.n] ?? null;
  const fallbackRank =
    d.dr != null ? { division: d.w, rank: Math.round(d.dr) } : null;
  const mergedRank = officialRank ?? fallbackRank;

  const liveElo = eloRec?.elo ?? d.elo ?? 1500;
  const peakElo = eloRec?.peak ?? liveElo;
  const cardioRatio = CARDIO_RATIOS[d.n] ?? d.crd ?? 1.0;
  const rankTier = currentRankTier(mergedRank);
  const historyWins = fightHistory.filter((fight) => fight.re === 'W');
  const historyLosses = fightHistory.filter((fight) => fight.re === 'L');
  const wins = fightHistory.length > 0 ? historyWins.length : d.wi ?? 0;
  const losses = fightHistory.length > 0 ? historyLosses.length : d.lo ?? 0;
  const totalFights = wins + losses;
  const totalRounds =
    fightHistory.length > 0 ? sumFightRounds(fightHistory) : d.tr ?? 0;
  const deepRounds = fightHistory.length > 0 ? sumDeepRounds(fightHistory) : 0;
  const koWins =
    fightHistory.length > 0
      ? historyWins.filter((fight) => isKoMethod(fight.me || '')).length
      : d.kow ?? 0;
  const subWins =
    fightHistory.length > 0
      ? historyWins.filter((fight) => isSubMethod(fight.me || '')).length
      : d.sbw ?? 0;
  const decWins =
    fightHistory.length > 0
      ? historyWins.filter((fight) => isDecisionMethod(fight.me || '')).length
      : d.dcw ?? 0;
  const titleBouts =
    fightHistory.length > 0
      ? fightHistory.filter((fight) => fight.tb).length
      : d.tb ?? 0;
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
  const ufcFightCount =
    fightHistory.length > 0 ? totalFights : eloRec?.n ?? totalFights;

  const rating = eloToRating(liveElo, d.w);
  // Credibility: based on total rounds fought (more rounds = more data = more credible)
  const cred = Math.min(100, Math.round((totalRounds / 60) * 100));
  const winPct = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0;
  // Finish rate
  const finishRate =
    wins > 0 ? Math.round((((koWins ?? 0) + (subWins ?? 0)) / wins) * 100) : 0;
  const totalMin = Math.round(totalRounds * 5);
  const kdPerMin =
    totalMin > 0 ? parseFloat(((koWins ?? 0) / totalMin).toFixed(4)) : 0;
  const controlPct = Math.min(
    100,
    parseFloat(
      ((d.atl ?? 0) * ((d.atp ?? 0.35) + 0.15) * 10 + (d.asa ?? 0) * 3).toFixed(
        1
      )
    )
  );
  const eloStrength = Math.max(0, Math.min(1, (liveElo - 1400) / 450));
  const oqiProxy = parseFloat(
    (0.65 * rankTier + 0.35 * eloStrength).toFixed(3)
  );
  const momentumScore = Math.max(
    -2,
    Math.min(2, ((d.ws ?? 0) - (d.ls ?? 0)) / 4)
  );

  return {
    FIGHTER: d.n,
    WEIGHT_CLASS: d.w,
    AGE: d.ag,
    HEIGHT_IN: d.ht,
    REACH_IN: d.rh,
    STANCE: d.st,
    WINS: wins,
    LOSSES: losses,
    WIN_STREAK: winStreak,
    LOSE_STREAK: loseStreak,
    TOTAL_ROUNDS: totalRounds,
    DEEP_ROUNDS: deepRounds,
    TITLE_BOUTS: titleBouts,
    KO_WINS: koWins,
    SUB_WINS: subWins,
    DEC_WINS: decWins,
    ASL: d.asl, // avg sig str landed per min
    ASP: d.asp, // avg sig str pct (0–1)
    ASA: d.asa, // avg sub attempts
    ATL: d.atl, // avg td landed per 15min
    ATP: d.atp, // avg td pct (0–1)
    ELO: liveElo,
    ELO_PEAK: peakElo,
    UFC_FIGHT_COUNT: ufcFightCount,
    RANK_TIER: rankTier,
    CARDIO_RATIO: cardioRatio,
    LAST_FIGHT_DATE: lastFightDate,
    DAYS_SINCE_LAST: daysSinceLast,
    DIV_RANK: d.dr,
    P4P_RANK: d.p4p,
    WEIGHT_LBS: d.wlb,
    // Derived display fields
    ADJUSTED_RATING: rating, // 0–100, ELO-based, normalized per division
    CREDIBILITY: cred,
    WIN_PCT: winPct,
    FINISH_RATE: finishRate,
    RECORD: `${wins}-${losses}`,
    // Legacy aliases (keep for UI components that reference old names)
    // Effective strike output: strikes landed per min × accuracy.
    // True net margin (landed minus absorbed) requires absorbed data not available
    // at the per-fighter aggregate level, so this is the best available proxy.
    NET_STRIKE_MARGIN:
      d.asl != null ? parseFloat((d.asl * (d.asp ?? 0.45)).toFixed(2)) : null,
    SIG_STR_ACC: d.asp != null ? d.asp * 100 : null,
    TDE: d.atl,
    TD_ACC: d.atp != null ? d.atp * 100 : null,
    KD_PER_MIN: kdPerMin,
    OQI: oqiProxy,
    MOMENTUM: momentumScore,
    FINISH_QUALITY: finishRate / 100,
    FIGHT_HISTORY: fightHistory,

    // ── Legacy fields for UI compatibility (v5 equivalents) ──
    CARDIO_DECAY: cardioRatio,
    TOTAL_EFFICIENCY:
      d.asl != null
        ? Math.max(0, parseFloat((d.asl * (d.asp ?? 0.45)).toFixed(2)))
        : 0,
    QUALITY_ADJUSTMENT: 0,
    LAYOFF_PENALTY: 0,
    EXPERIENCE_FACTOR: 1.0,
    OQI_SCALE: rankTier,
    TOTAL_MIN: totalMin,
    UFC_RANK: mergedRank,
    SUB_THREAT_RATE: d.asa ?? 0,
    KO_WIN_PCT:
      wins > 0 ? parseFloat((((koWins ?? 0) / wins) * 100).toFixed(1)) : 0,
    SUB_WIN_PCT:
      wins > 0 ? parseFloat((((subWins ?? 0) / wins) * 100).toFixed(1)) : 0,
    CONTROL_TIME_PCT: controlPct,
    RECENT_STR_OUTPUT: d.asl ?? null,
    RECENT_STR_ACC: d.asp != null ? d.asp * 100 : null,
    RECENT_TD_RATE: d.atl ?? null,
    RECENT_CTRL_PCT: controlPct,
    IS_LIGHT: false,
    ASD: d.asl != null ? d.asl * (1 - (d.asp ?? 0.45)) : 0,
    FACTOR_DAMAGE:
      d.asl != null
        ? parseFloat((d.asl * (d.asp ?? 0.45) * 0.4).toFixed(1))
        : 0,
    FACTOR_POSITION: d.atp != null ? parseFloat((d.atp * 30).toFixed(1)) : 0,
    FACTOR_FINISH: parseFloat((finishRate * 0.2).toFixed(1)),
    FACTOR_CARDIO: parseFloat((cardioRatio * 10).toFixed(1)),
  };
});

// ─── IN-APP BACKTEST ─────────────────────────────────────────────────────────
// Tests the matchup engine against known fight history outcomes.
// Note: still uses current career stats, so this is an upper-bound estimate.
// Fixes 1-3 above progressively improve this number toward true accuracy.
const computeBacktestAccuracy = () => {
  let correct = 0,
    total = 0,
    details = [];
  FIGHTERS.forEach((fighter) => {
    (fighter.FIGHT_HISTORY || []).forEach((fight) => {
      if (fight.re !== 'W' && fight.re !== 'L') return; // skip NC/Draw
      const opponent = FIGHTERS.find((f) => f.FIGHTER === fight.op);
      if (!opponent) return; // opponent not in our dataset
      // fighter is always fA; if re=W we expect pA > 0.5
      const result = computeMatchupEdges(fighter, opponent);
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
    tip: 'Takedown defense %',
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
const americanOdds = (p) => {
  p = Math.max(0.001, Math.min(0.999, p));
  return p >= 0.5
    ? `-${Math.round((p / (1 - p)) * 100)}`
    : `+${Math.round(((1 - p) / p) * 100)}`;
};

// ─── VIG-STRIPPING & VALUE ENGINE ────────────────────────────────────────────
const parseAmericanOdds = (str) => {
  if (!str || str === '' || str === '+' || str === '-') return null;
  const n = parseInt(str, 10);
  if (isNaN(n) || n === 0) return null;
  // Convert American odds → raw implied probability
  if (n > 0) return 100 / (n + 100);
  return Math.abs(n) / (Math.abs(n) + 100);
};

const stripVig = (implA, implB) => {
  // Multiplicative / proportional method — most common industry standard
  const total = implA + implB;
  if (total <= 0) return { noVigA: 0.5, noVigB: 0.5, vig: 0, overround: 0 };
  return {
    noVigA: implA / total,
    noVigB: implB / total,
    vig: ((total - 1) / total) * 100, // vig as % of bet
    overround: (total - 1) * 100, // raw overround %
  };
};

const calcExpectedValue = (modelProb, decimalOdds) => {
  // EV = (prob × net_win) - ((1 - prob) × stake)
  // For $100 bet: EV = (prob × (decimalOdds - 1) × 100) - ((1 - prob) × 100)
  return modelProb * (decimalOdds - 1) * 100 - (1 - modelProb) * 100;
};

const americanToDecimal = (str) => {
  const n = parseInt(str, 10);
  if (isNaN(n) || n === 0) return null;
  if (n > 0) return n / 100 + 1;
  return 100 / Math.abs(n) + 1;
};

const createPredictionId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isResolvedWinner = (value, entry) =>
  value === entry?.fighterA || value === entry?.fighterB || value === 'NC';

const calcTrackedProfit = (entry) => {
  if (
    !entry ||
    !entry.marketOdds ||
    !isResolvedWinner(entry.actualWinner, entry)
  )
    return null;
  if (entry.actualWinner === 'NC') return 0;
  const dec = americanToDecimal(entry.marketOdds);
  if (!dec) return null;
  return entry.actualWinner === entry.trackedSide ? (dec - 1) * 100 : -100;
};

const sortHistoryDesc = (history) =>
  [...(history || [])].sort((a, b) => {
    const aTime = a?.dt ? new Date(a.dt).getTime() : 0;
    const bTime = b?.dt ? new Date(b.dt).getTime() : 0;
    return bTime - aTime;
  });

function getResultStreak(history, target) {
  let streak = 0;
  for (const fight of history || []) {
    if (fight.re !== target) break;
    streak += 1;
  }
  return streak;
}

function isDecisionMethod(method = '') {
  return String(method).startsWith('Dec');
}

function isKoMethod(method = '') {
  const m = String(method).toLowerCase().trim();

  if (!m) return false;

  return (
    m === 'ko' ||
    m === 'tko' ||
    m === 'tko-dr' ||
    m.includes('ko/tko') ||
    m.includes('punch') ||
    m.includes('punches') ||
    m.includes('elbow') ||
    m.includes('elbows') ||
    m.includes('knee') ||
    m.includes('knees') ||
    m.includes('kick') ||
    m.includes('head kick') ||
    m.includes('leg kick') ||
    m.includes('doctor stoppage') ||
    m.includes('corner stoppage')
  );
}

function isSubMethod(method = '') {
  const m = String(method).toLowerCase().trim();

  if (!m) return false;

  return (
    m === 'sub' ||
    m.includes('choke') ||
    m.includes('armbar') ||
    m.includes('triangle') ||
    m.includes('arm triangle') ||
    m.includes('rear naked choke') ||
    m.includes('guillotine') ||
    m.includes('anaconda') ||
    m.includes('kneebar') ||
    m.includes('kimura') ||
    m.includes('heel hook') ||
    m.includes('lock')
  );
}

const kellyFraction = (modelProb, decimalOdds) => {
  // Kelly = (bp - q) / b where b = decimal - 1, p = prob, q = 1-p
  const b = decimalOdds - 1;
  if (b <= 0) return 0;
  const f = (b * modelProb - (1 - modelProb)) / b;
  return Math.max(0, f);
};

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
const methodColor = (m) => {
  if (!m) return 'text-slate-400';
  if (m === 'KO' || m === 'TKO-Dr') return 'text-red-400';
  if (m === 'Sub') return 'text-purple-400';
  if (m.startsWith('Dec')) return 'text-blue-400';
  return 'text-slate-400';
};
const recentForm = (fh) => {
  if (!fh || !fh.length) return [];
  return fh.slice(0, 5).map((f) => f.re);
};

// ─── MODEL WEIGHTS (generated by build_drosspom_model.ipynb) ─────────────────
// No-odds CV accuracy:   62.9%  |  Brier: 0.2252
// With-odds CV accuracy: 67.8%  |  Brier: 0.2039
//
// Weights derived from XGBoost feature importances on 7,177 UFC fights (2010–2026)
// using time-series cross-validation. Platt calibration applied.

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
  W_OD: {
    odds_edge: 0.225237,
    avg_td_dif: 0.048877,
    cardio_dif: 0.043262,
    sig_str_dif: 0.041812,
    lose_streak_dif: 0.040835,
    win_streak_dif: 0.040763,
    height_dif: 0.040048,
    R_avg_SIG_STR_pct: 0.040012,
    avg_sub_att_dif: 0.039505,
    elo_dif: 0.037475,
    total_round_dif: 0.037059,
    B_avg_SIG_STR_pct: 0.036546,
    R_avg_TD_pct: 0.035271,
    layoff_dif: 0.034885,
    ko_dif: 0.033502,
    age_dif: 0.033457,
    B_avg_TD_pct: 0.032699,
    win_dif: 0.032539,
    loss_dif: 0.032233,
    reach_dif: 0.031407,
    total_title_bout_dif: 0.03131,
    sub_dif: 0.031265,
  },
  // Platt calibration: p = logistic(platt_a * composite + platt_b)
  PLATT_NO: { a: 1.7225631998412525, b: -0.18753374136521064 },
  PLATT_OD: { a: 1.4008053209780686, b: -0.09263130924926194 },
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
    odds_edge: 0.3,
  },
};

// ─── PREDICTION ENGINE ────────────────────────────────────────────────────────
// Computes win probability for fA vs fB using XGBoost-derived weights.
// Two modes: no odds (default), and with odds (when user enters a betting line).
//
// Feature naming follows ufc-master.csv conventions so weights map directly:
//   sig_str_dif          = fA.ASL - fB.ASL  (avg sig strikes landed per min)
//   R_avg_SIG_STR_pct    = fA accuracy (positive for A)
//   B_avg_SIG_STR_pct    = fB accuracy (negative for A)
//   avg_td_dif           = fA.ATL - fB.ATL
//   etc.

const computeMatchupEdges = (fA, fB, oddsA = null, oddsB = null) => {
  const S = MODEL.SCALES;

  // ── Compute each raw differential ──────────────────────────────────────────
  const feats = {
    sig_str_dif: ((fA.ASL ?? 0) - (fB.ASL ?? 0)) / S.sig_str_dif,
    avg_sig_str_pct_dif:
      ((fA.ASP ?? 0) - (fB.ASP ?? 0)) / S.avg_sig_str_pct_dif,
    avg_td_dif: ((fA.ATL ?? 0) - (fB.ATL ?? 0)) / S.avg_td_dif,
    avg_td_pct_dif: ((fA.ATP ?? 0) - (fB.ATP ?? 0)) / S.avg_td_pct_dif,
    avg_sub_att_dif: ((fA.ASA ?? 0) - (fB.ASA ?? 0)) / S.avg_sub_att_dif,
    control_time_dif:
      ((fA.CONTROL_TIME_PCT ?? 0) - (fB.CONTROL_TIME_PCT ?? 0)) /
      S.control_time_dif,
    reach_dif: ((fA.REACH_IN ?? 0) - (fB.REACH_IN ?? 0)) / S.reach_dif,
    height_dif: ((fA.HEIGHT_IN ?? 0) - (fB.HEIGHT_IN ?? 0)) / S.height_dif,
    age_dif: ((fB.AGE ?? 30) - (fA.AGE ?? 30)) / S.age_dif, // reversed: younger is better
    win_streak_dif:
      ((fA.WIN_STREAK ?? 0) - (fB.WIN_STREAK ?? 0)) / S.win_streak_dif,
    lose_streak_dif:
      ((fB.LOSE_STREAK ?? 0) - (fA.LOSE_STREAK ?? 0)) / S.lose_streak_dif, // reversed
    win_dif: ((fA.WINS ?? 0) - (fB.WINS ?? 0)) / S.win_dif,
    loss_dif: ((fB.LOSSES ?? 0) - (fA.LOSSES ?? 0)) / S.loss_dif, // reversed
    total_round_dif:
      ((fA.TOTAL_ROUNDS ?? 0) - (fB.TOTAL_ROUNDS ?? 0)) / S.total_round_dif,
    deep_round_dif:
      ((fA.DEEP_ROUNDS ?? 0) - (fB.DEEP_ROUNDS ?? 0)) / S.total_round_dif,
    total_title_bout_dif:
      ((fA.TITLE_BOUTS ?? 0) - (fB.TITLE_BOUTS ?? 0)) / S.total_title_bout_dif,
    ko_dif: ((fA.KO_WINS ?? 0) - (fB.KO_WINS ?? 0)) / S.ko_dif,
    sub_dif: ((fA.SUB_WINS ?? 0) - (fB.SUB_WINS ?? 0)) / S.sub_dif,
    elo_dif: ((fA.ELO ?? 1500) - (fB.ELO ?? 1500)) / S.elo_dif,
    layoff_dif:
      ((fB.DAYS_SINCE_LAST ?? 180) - (fA.DAYS_SINCE_LAST ?? 180)) /
      S.layoff_dif, // reversed
    cardio_dif:
      ((fA.CARDIO_RATIO ?? 1) - (fB.CARDIO_RATIO ?? 1)) / S.cardio_dif,
    peak_elo_dif:
      ((fA.ELO_PEAK ?? fA.ELO ?? 1500) - (fB.ELO_PEAK ?? fB.ELO ?? 1500)) /
      S.peak_elo_dif,
    ufc_fight_count_dif:
      ((fA.UFC_FIGHT_COUNT ?? 0) - (fB.UFC_FIGHT_COUNT ?? 0)) /
      S.ufc_fight_count_dif,
    rank_tier_dif:
      ((fA.RANK_TIER ?? 0.12) - (fB.RANK_TIER ?? 0.12)) / S.rank_tier_dif,
  };

  const useOdds = oddsA !== null && oddsB !== null;
  let oddsEdge = 0;
  let oddsImplA = null,
    oddsImplB = null;

  if (useOdds) {
    const toImpl = (o) => {
      const n = parseFloat(o);
      if (isNaN(n)) return null;
      return n < 0 ? -n / (-n + 100) : 100 / (n + 100);
    };
    const rawA = toImpl(oddsA),
      rawB = toImpl(oddsB);
    if (rawA && rawB) {
      const total = rawA + rawB;
      oddsImplA = rawA / total;
      oddsImplB = rawB / total;
      oddsEdge = (oddsImplA - oddsImplB) / S.odds_edge;
    }
  }

  // ── Map features to the weight keys used in training ──────────────────────
  // NOTE: The model trained on R_avg_SIG_STR_pct (absolute) and B_avg_SIG_STR_pct
  // (absolute) as separate features. Here we combine them into a single differential
  // and distribute their combined weight.
  const W = useOdds ? MODEL.W_OD : MODEL.W_NO;
  // Sum (not average): the model trained R and B accuracy as *separate* features,
  // each contributing their own weight. Collapsing into one differential means
  // the combined weight must be the total — halving it cuts the signal by 50%.
  const accCombinedW = W.R_avg_SIG_STR_pct + W.B_avg_SIG_STR_pct;
  const tdCombinedW = W.R_avg_TD_pct + W.B_avg_TD_pct;
  const grapplingWeightPool = W.avg_td_dif + tdCombinedW + W.avg_sub_att_dif;
  const controlWeight = grapplingWeightPool * 0.22;
  const tdOffenseWeight = W.avg_td_dif * 0.82;
  const tdDefenseWeight = tdCombinedW * 0.82;
  const subThreatWeight = Math.max(
    0,
    grapplingWeightPool - tdOffenseWeight - tdDefenseWeight - controlWeight
  );
  const experienceWeightPool = W.total_round_dif + W.total_title_bout_dif;
  const fightCountWeight = experienceWeightPool * 0.58;
  const deepRoundsWeight = experienceWeightPool * 0.42;

  const clamp = (v) => Math.max(-2, Math.min(2, v));

  // ── Group into display edges ───────────────────────────────────────────────
  const strikingScore =
    clamp(feats.sig_str_dif) * W.sig_str_dif +
    clamp(feats.avg_sig_str_pct_dif) * accCombinedW;

  const grapplingScore =
    clamp(feats.avg_td_dif) * tdOffenseWeight +
    clamp(feats.avg_td_pct_dif) * tdDefenseWeight +
    clamp(feats.avg_sub_att_dif) * subThreatWeight +
    clamp(feats.control_time_dif) * controlWeight;

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
  // the composite — they were not in the XGBoost training set. We do fold
  // ufc_fight_count_dif into the legacy experience bucket as a safer proxy than
  // raw total rounds for dominant early finishers.

  const oddsScore = useOdds ? clamp(oddsEdge) * (W.odds_edge ?? 0) : 0;

  const composite =
    strikingScore +
    grapplingScore +
    physicalScore +
    formScore +
    expScore +
    analyticsScore +
    oddsScore;

  // ── Platt calibration ─────────────────────────────────────────────────────
  const P = useOdds ? MODEL.PLATT_OD : MODEL.PLATT_NO;
  const pA = 1 / (1 + Math.exp(-(P.a * composite + P.b)));

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
    ...(useOdds && {
      market: mkEdge(oddsScore, 'Market', '💰', W.odds_edge ?? 0),
    }),
  };

  return {
    pA,
    pB: 1 - pA,
    composite,
    edges,
    oddsImplA,
    oddsImplB,
    feats,
    useOdds,
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
    southpawBonus: 0,
    grapplerBonus: 0,
    cardioStrikerBonus: 0,
    reachEdge: (fA.REACH_IN ?? 0) - (fB.REACH_IN ?? 0),
    heightEdge: (fA.HEIGHT_IN ?? 0) - (fB.HEIGHT_IN ?? 0),
  };
};
// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ view, setView }) {
  const tabs = [
    { id: 'table', label: 'Database', Icon: BarChart2 },
    { id: 'simulator', label: 'Simulator', Icon: Swords },
    { id: 'scout', label: 'Scout', Icon: User },
    { id: 'roi', label: 'ROI', Icon: Calendar },
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
            DrossPom
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            KenPom-Style Analytics · {FIGHTERS.length} active fighters · v7
          </p>
        </div>
      </div>
      <nav className="flex gap-1">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === id
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>
    </div>
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
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer min-w-40"
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
            className={`shrink-0 text-xs px-3 py-1 rounded-lg border font-semibold transition-all ${
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
      <div className="flex items-center justify-between mb-3">
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
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
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
                className="px-2.5 py-1 bg-slate-800 rounded disabled:opacity-30 hover:bg-slate-700 text-slate-300 transition-colors"
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
                              f.UFC_RANK.rank === 'C'
                                ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {ufcRankLabel(f.FIGHTER)}
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
        className={`bg-slate-800 border ${bdr} text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-full focus:outline-none transition-colors`}
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
              <span className="text-slate-200 font-medium">{f.FIGHTER}</span>
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

const SIMULATOR_COMPARISON_GROUPS = [
  {
    title: 'Striking Inputs',
    icon: '⚔️',
    items: [
      {
        key: 'ASL',
        label: 'Sig Strikes Landed / Min',
        higherBetter: true,
        decimals: 2,
      },
      {
        key: 'ASP',
        label: 'Strike Accuracy %',
        higherBetter: true,
        decimals: 1,
        pct: true,
      },
    ],
  },
  {
    title: 'Grappling Inputs',
    icon: '🤼',
    items: [
      {
        key: 'ATL',
        label: 'Takedowns / 15 Min',
        higherBetter: true,
        decimals: 2,
      },
      {
        key: 'ATP',
        label: 'Takedown Accuracy %',
        higherBetter: true,
        decimals: 1,
        pct: true,
      },
      {
        key: 'ASA',
        label: 'Sub Attempts / 15 Min',
        higherBetter: true,
        decimals: 2,
      },
      {
        key: 'CONTROL_TIME_PCT',
        label: 'Control Time %',
        higherBetter: true,
        decimals: 1,
        pct: true,
      },
    ],
  },
  {
    title: 'Physical Inputs',
    icon: '📏',
    items: [
      {
        key: 'REACH_IN',
        label: 'Reach',
        higherBetter: true,
        format: (v) => fmtReach(v),
      },
      {
        key: 'HEIGHT_IN',
        label: 'Height',
        higherBetter: true,
        format: (v) => fmtHeight(v),
      },
      {
        key: 'AGE',
        label: 'Age',
        higherBetter: false,
        decimals: 0,
      },
    ],
  },
  {
    title: 'Form Inputs',
    icon: '📈',
    items: [
      {
        key: 'WIN_STREAK',
        label: 'Win Streak',
        higherBetter: true,
        decimals: 0,
      },
      {
        key: 'LOSE_STREAK',
        label: 'Loss Streak',
        higherBetter: false,
        decimals: 0,
      },
      {
        key: 'WINS',
        label: 'UFC Wins',
        higherBetter: true,
        decimals: 0,
      },
      {
        key: 'LOSSES',
        label: 'UFC Losses',
        higherBetter: false,
        decimals: 0,
      },
    ],
  },
  {
    title: 'Experience Inputs',
    icon: '🎖️',
    items: [
      {
        key: 'UFC_FIGHT_COUNT',
        label: 'UFC Fight Count',
        higherBetter: true,
        decimals: 0,
      },
      {
        key: 'DEEP_ROUNDS',
        label: 'Deep Rounds (R3+)',
        higherBetter: true,
        decimals: 0,
      },
      {
        key: 'KO_WINS',
        label: 'KO Wins',
        higherBetter: true,
        decimals: 0,
      },
      {
        key: 'SUB_WINS',
        label: 'Submission Wins',
        higherBetter: true,
        decimals: 0,
      },
    ],
  },
  {
    title: 'Analytics Inputs',
    icon: '📊',
    items: [
      {
        key: 'ELO',
        label: 'ELO',
        higherBetter: true,
        decimals: 0,
      },
      {
        key: 'DAYS_SINCE_LAST',
        label: 'Days Since Last Fight',
        higherBetter: false,
        decimals: 0,
      },
      {
        key: 'CARDIO_RATIO',
        label: 'Cardio Ratio',
        higherBetter: true,
        decimals: 2,
      },
    ],
  },
];

// ─── MATCHUP SIMULATOR ────────────────────────────────────────────────────────
function MatchupSimulator({ allFighters, onSavePrediction, onOpenROI }) {
  const [fA, setFA] = useState(null);
  const [fB, setFB] = useState(null);
  const [oddsA, setOddsA] = useState('');
  const [oddsB, setOddsB] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [saveFeedback, setSaveFeedback] = useState('');

  const result = useMemo(() => {
    if (!fA || !fB) return null;
    // Always use W_NO (pure stats model). Backtesting on 13,870 fights showed
    // that W_OD is worse than W_NO when the market disagrees with the model
    // (52% vs 48% accuracy on flipped picks) — exactly the scenario where you
    // are looking for value. Feeding market odds into the probability also makes
    // value analysis circular (comparing model vs market when model IS the market).
    return computeMatchupEdges(fA, fB);
  }, [fA, fB]);

  const market = useMemo(() => {
    const rawA = parseAmericanOdds(oddsA);
    const rawB = parseAmericanOdds(oddsB);
    if (!rawA || !rawB || !result) return null;

    const { noVigA, noVigB, vig, overround } = stripVig(rawA, rawB);
    const decA = americanToDecimal(oddsA);
    const decB = americanToDecimal(oddsB);

    const edgeA = result.pA - noVigA;
    const edgeB = result.pB - noVigB;
    const evA = decA ? calcExpectedValue(result.pA, decA) : 0;
    const evB = decB ? calcExpectedValue(result.pB, decB) : 0;
    const kellyA = decA ? kellyFraction(result.pA, decA) : 0;
    const kellyB = decB ? kellyFraction(result.pB, decB) : 0;

    // Break-even % at market odds
    const breakEvenA = rawA;
    const breakEvenB = rawB;

    // Fair value line based on model probability
    const fairLineA = americanOdds(result.pA);
    const fairLineB = americanOdds(result.pB);

    // Domain alignment: how many of the 6 real model domains favor the same fighter
    const modelFavorsA = result.pA >= 0.5;
    const domainKeys = [
      'striking',
      'grappling',
      'physical',
      'form',
      'experience',
      'analytics',
    ];
    const alignedDomains = domainKeys.filter((k) => {
      const e = result.edges[k];
      return modelFavorsA ? e.clamped > 0 : e.clamped < 0;
    }).length;

    // ── Step 1: Who does the model pick? (always the >50% fighter)
    const pickSide = result.pA >= 0.5 ? 'A' : 'B';
    const pickEdge = pickSide === 'A' ? edgeA : edgeB;
    const oppEdge  = pickSide === 'A' ? edgeB : edgeA;

    // ── Step 2: Classify signals
    // CONFLICTING: model picks A but market underprices B.
    // Betting the 'value' here means betting against your own model pick.
    const hasPickEdge = pickEdge >= 0.03;
    const conflictingSignals = !hasPickEdge && oppEdge >= 0.03;

    // ── Step 3: Confidence — only meaningful when signals align
    const avgCred = (fA.CREDIBILITY + fB.CREDIBILITY) / 200;
    const edgeScore = hasPickEdge ? Math.min(40, pickEdge * 280) : 0;
    const credScore = avgCred * 30;
    const alignScore = alignedDomains * 5;
    const betConfidence = Math.round(Math.max(0, edgeScore + credScore + alignScore));

    // ── Step 4: Conviction gate + bet action ─────────────────────────────────
    // Backtested on 13,870 fights: picks at 50–55% win only 52.8% of the time.
    // Applying a conviction floor raises win rate from 70.3% → 75.3% (+5pp).
    // Gate rules:
    //   < 55% pick prob → max LEAN (coin-flip zone, large edge is misleading)
    //   55–60% pick prob → BET requires larger edge (15pp), STRONG BET same
    //   ≥ 60% pick prob → standard tiers apply
    const pickProb = pickSide === 'A' ? result.pA : result.pB;
    const lowConviction  = pickProb < 0.55;  // coin-flip zone
    const midConviction  = pickProb < 0.60;  // moderate conviction

    const betAction = (() => {
      if (conflictingSignals) return 'NO BET';
      if (!hasPickEdge)       return 'NO BET';
      // Coin-flip zone: never escalate beyond LEAN regardless of edge size
      if (lowConviction)      return 'LEAN';
      // Moderate conviction: require larger edge for BET
      if (midConviction) {
        if (pickEdge >= 0.15 && betConfidence >= 60) return 'STRONG BET';
        if (pickEdge >= 0.10 && betConfidence >= 45) return 'BET';
        return 'LEAN';
      }
      // Full conviction (≥60%): standard tiers
      if (pickEdge >= 0.12 && betConfidence >= 60) return 'STRONG BET';
      if (pickEdge >= 0.07 && betConfidence >= 45) return 'BET';
      return 'LEAN';
    })();

    // ── Step 5: No-bet / lean reason for UI display ───────────────────────────
    const noBetReason = (() => {
      if (conflictingSignals) {
        const oppFighter  = pickSide === 'A' ? fB.FIGHTER : fA.FIGHTER;
        const pickFighter = pickSide === 'A' ? fA.FIGHTER : fB.FIGHTER;
        return `Market underprices ${oppFighter} (+${(oppEdge * 100).toFixed(1)}pp edge) but model picks ${pickFighter} — conflicting signals`;
      }
      if (!hasPickEdge) return `No positive edge on model pick at current lines`;
      if (lowConviction) return `Model pick is ${(pickProb * 100).toFixed(1)}% — too close to 50/50 for a bet (capped at LEAN). Edge may be real but conviction is too low.`;
      return `Edge below minimum threshold`;
    })();

    // betSide alias so downstream UI keeps working
    const betSide = pickSide;

    const gradeEdge = (edge) => {
      const abs = Math.abs(edge);
      if (abs >= 0.12)
        return {
          label: 'STRONG VALUE',
          color: 'text-emerald-400',
          bg: 'bg-emerald-900/30 border-emerald-700',
        };
      if (abs >= 0.06)
        return {
          label: 'VALUE',
          color: 'text-emerald-400',
          bg: 'bg-emerald-900/20 border-emerald-800',
        };
      if (abs >= 0.03)
        return {
          label: 'LEAN',
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20 border-yellow-800',
        };
      return {
        label: 'NO EDGE',
        color: 'text-slate-500',
        bg: 'bg-slate-800/40 border-slate-700',
      };
    };

    return {
      rawA,
      rawB,
      noVigA,
      noVigB,
      vig,
      overround,
      edgeA,
      edgeB,
      evA,
      evB,
      kellyA,
      kellyB,
      breakEvenA,
      breakEvenB,
      fairLineA,
      fairLineB,
      betConfidence,
      betAction,
      betSide,
      alignedDomains,
      gradeA:
        edgeA > 0.02
          ? gradeEdge(edgeA)
          : {
              label: edgeA < -0.05 ? 'FADE' : 'NO EDGE',
              color: edgeA < -0.05 ? 'text-red-400' : 'text-slate-500',
              bg:
                edgeA < -0.05
                  ? 'bg-red-900/20 border-red-800'
                  : 'bg-slate-800/40 border-slate-700',
            },
      gradeB:
        edgeB > 0.02
          ? gradeEdge(edgeB)
          : {
              label: edgeB < -0.05 ? 'FADE' : 'NO EDGE',
              color: edgeB < -0.05 ? 'text-red-400' : 'text-slate-500',
              bg:
                edgeB < -0.05
                  ? 'bg-red-900/20 border-red-800'
                  : 'bg-slate-800/40 border-slate-700',
            },
      // bestBet fires only when model pick and market value align
      bestBet: betAction !== 'NO BET' ? pickSide : null,
      pickSide,
      pickProb,
      lowConviction,
      midConviction,
      pickEdge,
      oppEdge,
      hasPickEdge,
      conflictingSignals,
      noBetReason,
    };
  }, [oddsA, oddsB, result, fA, fB]);

  const savePrediction = (openROI = false) => {
    if (!fA || !fB || !result) return;

    const predictedWinner = result.pA >= result.pB ? fA.FIGHTER : fB.FIGHTER;
    // Always track the model pick — not the value side.
    // 'Tracked side' answers: was the model correct? Bet recommendations
    // are separate (only fire when pick and value agree).
    const trackedSide = predictedWinner;
    const trackedProb = trackedSide === fA.FIGHTER ? result.pA : result.pB;
    const trackedOdds =
      trackedSide === fA.FIGHTER
        ? oddsA || ''
        : trackedSide === fB.FIGHTER
        ? oddsB || ''
        : '';
    const trackedEdge =
      trackedSide === fA.FIGHTER
        ? market?.edgeA ?? null
        : trackedSide === fB.FIGHTER
        ? market?.edgeB ?? null
        : null;
    const trackedEV =
      trackedSide === fA.FIGHTER
        ? market?.evA ?? null
        : trackedSide === fB.FIGHTER
        ? market?.evB ?? null
        : null;
    const trackedKelly =
      trackedSide === fA.FIGHTER
        ? market?.kellyA ?? null
        : trackedSide === fB.FIGHTER
        ? market?.kellyB ?? null
        : null;
    const trackedFairLine =
      trackedSide === fA.FIGHTER
        ? market?.fairLineA ?? null
        : trackedSide === fB.FIGHTER
        ? market?.fairLineB ?? null
        : null;

    onSavePrediction?.({
      id: createPredictionId(),
      createdAt: new Date().toISOString(),
      eventName: eventName.trim(),
      eventDate,
      fighterA: fA.FIGHTER,
      fighterB: fB.FIGHTER,
      division:
        fA.WEIGHT_CLASS === fB.WEIGHT_CLASS
          ? fA.WEIGHT_CLASS
          : `${fA.WEIGHT_CLASS} / ${fB.WEIGHT_CLASS}`,
      fighterAProb: result.pA,
      fighterBProb: result.pB,
      predictedWinner,
      predictedProb: predictedWinner === fA.FIGHTER ? result.pA : result.pB,
      trackedSide,
      trackedProb,
      marketOdds: trackedOdds,
      edge: trackedEdge,
      edgeA: market?.edgeA ?? null,
      edgeB: market?.edgeB ?? null,
      ev: trackedEV,
      evA: market?.evA ?? null,
      evB: market?.evB ?? null,
      kelly: trackedKelly,
      kellyA: market?.kellyA ?? null,
      kellyB: market?.kellyB ?? null,
      fairLine: trackedFairLine,
      fairLineA: market?.fairLineA ?? null,
      fairLineB: market?.fairLineB ?? null,
      oddsA,
      oddsB,
      actualWinner: '',
      notes: '',
    });

    setSaveFeedback(
      openROI ? 'Saved and opened ROI tracker.' : 'Saved to ROI tracker.'
    );
    if (openROI) onOpenROI?.();
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
      key: 'CONTROL_TIME_PCT',
      label: 'Control Time %',
      hb: true,
      dec: 1,
      pct: true,
    },
    { key: 'FINISH_RATE', label: 'Finish Rate %', hb: true, dec: 1, pct: true },
    { key: 'KD_PER_MIN', label: 'Knockdowns / min', hb: true, dec: 4 },
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

  const formatComparisonValue = (fighter, item) => {
    const v = fighter?.[item.key];
    if (v == null) return '—';
    if (item.format) return item.format(v);
    return `${Number(v).toFixed(item.decimals ?? 1)}${item.pct ? '%' : ''}`;
  };

  const formatDelta = (a, b, item) => {
    if (a == null || b == null) return '—';
    const diff = a - b;
    if (Math.abs(diff) < 0.001) return 'Even';
    const abs = Math.abs(diff);
    const value = item.formatDelta
      ? item.formatDelta(abs)
      : `${abs.toFixed(item.decimals ?? 1)}${item.pct ? '%' : ''}`;
    return `${diff > 0 ? '+' : '-'}${value}`;
  };

  const getComparisonOutcome = (a, b, item) => {
    if (a == null || b == null) return 'even';
    if (Math.abs(a - b) < 0.001) return 'even';
    if (item.higherBetter) return a > b ? 'A' : 'B';
    return a < b ? 'A' : 'B';
  };

  const FighterPanel = ({ f, setF, color, ph }) => {
    const tc = color === 'blue' ? 'text-blue-400' : 'text-red-400';
    const bc =
      color === 'blue'
        ? 'border-blue-800 bg-blue-950/20'
        : 'border-red-800 bg-red-950/20';
    const pen = f ? ageDecayPenalty(f) : 0;
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
            <p className={`text-xs font-bold mb-3 ${tc}`}>
              {color === 'blue' ? 'Fighter A' : 'Fighter B'}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                ['Div', f.WEIGHT_CLASS],
                ['UFC Rank', ufcRankLabel(f.FIGHTER) ?? 'NR'],
                ['RTG', f.ADJUSTED_RATING.toFixed(1)],
                ['Base EFF', (f.TOTAL_EFFICIENCY ?? 0).toFixed(1)],
                [
                  'Qual Adj',
                  `${(f.QUALITY_ADJUSTMENT ?? 0) >= 0 ? '+' : ''}${(
                    f.QUALITY_ADJUSTMENT ?? 0
                  ).toFixed(1)}`,
                ],
                [
                  'Age Adj RTG',
                  pen > 0
                    ? `${(adjTE ?? 0).toFixed(1)} (-${(pen * 100).toFixed(0)}%)`
                    : (adjTE ?? 0).toFixed(1),
                ],
                ['Record', f.RECORD],
                [
                  'Age',
                  f.AGE ? (f.AGE >= 35 ? `${f.AGE} ⚠️` : String(f.AGE)) : '—',
                ],
                ['Height', fmtHeight(f.HEIGHT_IN)],
                ['Reach', fmtReach(f.REACH_IN)],
                ['Stance', f.STANCE || '—'],
                ['Cred', `${(f.CREDIBILITY ?? 0).toFixed(0)}%`],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-800/60 rounded-lg px-2 py-1.5">
                  <p className="text-slate-500 text-xs">{k}</p>
                  <p
                    className={`font-bold text-xs mt-0.5 truncate ${
                      k === 'Div' ? 'text-slate-300' : tc
                    }`}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
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
            <div className="space-y-1.5">
              {TAPE.slice(0, 6).map((stat) => {
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
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="mb-6">
        <h2 className="text-white font-black text-xl mb-1">
          Matchup Simulator
        </h2>
        <p className="text-slate-400 text-sm">
          Multi-factor model · moneyline value detection · Kelly sizing
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <FighterPanel f={fA} setF={setFA} color="blue" ph="Search Fighter A…" />
        <FighterPanel f={fB} setF={setFB} color="red" ph="Search Fighter B…" />
      </div>

      {result && fA && fB ? (
        <div className="space-y-4">
          {/* ── WIN PROBABILITY ── */}
          {(() => {
            const pctA = (result.pA * 100).toFixed(1);
            const pctB = (result.pB * 100).toFixed(1);
            const favA = result.pA > result.pB;
            return (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
                  Win Probability
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-blue-400 font-bold text-sm w-28 truncate">
                    {fA.FIGHTER}
                  </span>
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-blue-500 rounded-l-full transition-all"
                      style={{ width: `${result.pA * 100}%` }}
                    />
                    <div className="h-full bg-red-500 flex-1 rounded-r-full" />
                  </div>
                  <span className="text-red-400 font-bold text-sm w-28 truncate text-right">
                    {fB.FIGHTER}
                  </span>
                </div>
                <div className="flex justify-between px-1 mb-4">
                  <span className="text-white font-black text-2xl">
                    {pctA}%
                  </span>
                  <span className="text-white font-black text-2xl">
                    {pctB}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                    <p className="text-slate-500 text-xs">Model Favorite</p>
                    <p
                      className={`font-bold text-sm mt-1 ${
                        favA ? 'text-blue-400' : 'text-red-400'
                      }`}
                    >
                      {favA
                        ? fA.FIGHTER.split(' ').pop()
                        : fB.FIGHTER.split(' ').pop()}
                    </p>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                    <p className="text-slate-500 text-xs">RTG Diff</p>
                    <p
                      className={`font-black text-lg mt-1 ${
                        Math.abs(result.diff) > 5
                          ? 'text-emerald-400'
                          : Math.abs(result.diff) > 2
                          ? 'text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {result.diff > 0 ? '+' : ''}
                      {result.diff.toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3 text-center">
                    <p className="text-slate-500 text-xs">Confidence</p>
                    <p className="text-slate-300 font-bold text-sm mt-1">
                      {Math.abs(result.diff) > 5
                        ? 'Clear edge'
                        : Math.abs(result.diff) > 2
                        ? 'Moderate'
                        : 'Coin flip'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── MODEL IMPLIED LINES ── */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Model Implied Moneylines
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { f: fA, p: result.pA, color: 'blue' },
                { f: fB, p: result.pB, color: 'red' },
              ].map(({ f, p, color }) => (
                <div
                  key={f.FIGHTER}
                  className={`border ${
                    color === 'blue'
                      ? 'border-blue-800/50'
                      : 'border-red-800/50'
                  } rounded-xl p-4`}
                >
                  <p
                    className={`font-bold text-sm mb-2 ${
                      color === 'blue' ? 'text-blue-400' : 'text-red-400'
                    }`}
                  >
                    {f.FIGHTER}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-black text-2xl">
                      {americanOdds(p)}
                    </span>
                    <span className="text-slate-500 text-xs">
                      ({(p * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    {p > 0.7
                      ? 'Heavy Favorite'
                      : p > 0.58
                      ? 'Moderate Favorite'
                      : p > 0.5
                      ? 'Slight Favorite'
                      : 'Underdog'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-white text-xs font-black uppercase tracking-widest">
                  Send To ROI Tracker
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="UFC 325"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
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
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div clclassName="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-800/40 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Model pick</p>
                <p className="text-white font-bold text-sm mt-1">
                  {result.pA >= result.pB ? fA.FIGHTER : fB.FIGHTER}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {(Math.max(result.pA, result.pB) * 100).toFixed(1)}% win prob
                </p>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Bet recommendation</p>
                <p className={`font-bold text-sm mt-1 ${!market || market.betAction === 'NO BET' ? 'text-slate-500' : 'text-emerald-400'}`}>
                  {market?.betAction ?? 'Enter odds'}
                </p>
                {market && market.betAction !== 'NO BET' && market.bestBet && (
                  <p className="text-slate-400 text-xs mt-0.5">
                    {market.bestBet === 'A' ? fA.FIGHTER : fB.FIGHTER}
                  </p>
                )}
              </div>
              <div className="bg-slate-800/40 rounded-lg p-3">
                <p className="text-slate-500 text-xs">Saved with market</p>
                <p className="text-white font-bold text-sm mt-1">
                  {market ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => savePrediction(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-colors"
              >
                Save Prediction
              </button>
              <button
                onClick={() => savePrediction(true)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors"
              >
                Save And Open ROI
              </button>
            </div>
          </div>

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
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white font-black text-xl text-center placeholder-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
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

                const isBet = market.betAction === 'STRONG BET' || market.betAction === 'BET';
                const isLean = market.betAction === 'LEAN';
                const isNoBet = market.betAction === 'NO BET';

                const actionStyles = {
                  'STRONG BET': { bg: 'bg-emerald-950/40 border-emerald-600', badge: 'bg-emerald-500 text-emerald-950', text: 'text-emerald-400' },
                  'BET':        { bg: 'bg-emerald-950/20 border-emerald-800', badge: 'bg-emerald-700 text-emerald-100', text: 'text-emerald-400' },
                  'LEAN':       { bg: 'bg-yellow-950/20 border-yellow-800',   badge: 'bg-yellow-700 text-yellow-100',   text: 'text-yellow-400' },
                  'NO BET':     { bg: 'bg-slate-800/40 border-slate-700',     badge: 'bg-slate-600 text-slate-200',     text: 'text-slate-400'  },
                };
                const s = actionStyles[market.betAction] ?? actionStyles['NO BET'];

                return (
                  <div className="space-y-3">

                    {/* ── ROW 1: Three-column signal summary ── */}
                    <div className="grid grid-cols-3 gap-3">

                      {/* Model Pick — always shown */}
                      <div className={`border rounded-xl p-4 ${market.lowConviction ? 'bg-orange-950/10 border-orange-900' : 'bg-slate-900 border-slate-700'}`}>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Model Pick</p>
                        <p className="text-white font-black text-base leading-tight">{pickFighter.FIGHTER}</p>
                        <p className={`text-xs mt-1 ${market.lowConviction ? 'text-orange-400' : 'text-slate-400'}`}>
                          {market.pickSide === 'A' ? (result.pA * 100).toFixed(1) : (result.pB * 100).toFixed(1)}% win prob
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

                      {/* Bet Recommendation */}
                      <div className={`border rounded-xl p-4 ${s.bg}`}>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Bet Rec</p>
                        <span className={`inline-block text-xs font-black px-2 py-0.5 rounded-full mb-2 ${s.badge}`}>
                          {market.betAction}
                        </span>
                        {isNoBet ? (
                          <p className="text-slate-500 text-xs leading-snug">{market.noBetReason}</p>
                        ) : (
                          <>
                            <p className={`font-black text-sm ${s.text}`}>{pickFighter.FIGHTER}</p>
                            <p className="text-white font-bold text-sm">{pickOdds}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ── ROW 2: Full bet details (only when actionable) ── */}
                    {!isNoBet && (
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

                    {/* ── ROW 3: NO BET explanation panel ── */}
                    {isNoBet && (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Why No Bet</p>
                        {market.conflictingSignals ? (
                          <div className="space-y-2">
                            <p className="text-orange-400 font-bold text-sm">⚠ Conflicting signals — pick and value on opposite sides</p>
                            <p className="text-slate-400 text-sm">
                              The model picks <span className="text-white font-bold">{pickFighter.FIGHTER}</span> to win ({market.pickSide === 'A' ? (result.pA * 100).toFixed(1) : (result.pB * 100).toFixed(1)}%),
                              but the market underprices{' '}
                              <span className="text-white font-bold">{market.pickSide === 'A' ? fB.FIGHTER : fA.FIGHTER}</span>{' '}
                              by +{(market.oppEdge * 100).toFixed(1)}pp.
                            </p>
                            <p className="text-slate-500 text-xs">
                              Betting the value side means betting against your own model's winner. Pass this fight — wait for a line move or skip.
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">{market.noBetReason}</p>
                        )}
                      </div>
                    )}
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
                        {(result.pA * 100).toFixed(1)}% /{' '}
                        {(result.pB * 100).toFixed(1)}%
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
                      modelP: result.pA,
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
                      modelP: result.pB,
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
                            isBest ? 'ring-1 ring-emerald-500/40' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p
                              className={`font-bold text-sm ${
                                color === 'blue'
                                  ? 'text-blue-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {' '}
                              {f.FIGHTER}
                            </p>
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded-full ${grade.color} bg-slate-900/60`}
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
                                'Break-even %',
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
                                  className={`font-black text-base ${
                                    (edge ?? 0) > 0.03
                                      ? 'text-emerald-400'
                                      : (edge ?? 0) < -0.03
                                      ? 'text-red-400'
                                      : 'text-slate-400'
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

          {/* ── DOMAIN BREAKDOWN ── */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Domain Breakdown
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { edgeKey: 'striking', desc: 'NSM + accuracy interaction' },
                { edgeKey: 'grappling', desc: 'TD offense vs TDD + control' },
                { edgeKey: 'finishing', desc: 'KD rate + finish %' },
                { edgeKey: 'physical', desc: 'Reach (75%) + height (25%)' },
                { edgeKey: 'cardio', desc: 'Late-round output ratio' },
                { edgeKey: 'rating', desc: 'Master RTG differential' },
              ].map(({ edgeKey, desc }) => {
                const e = result.edges[edgeKey];
                const favorsA = e.clamped > 0;
                const neutral = Math.abs(e.clamped) < 0.05;
                const winner = neutral ? null : favorsA ? fA : fB;
                const winColor = favorsA ? 'text-blue-400' : 'text-red-400';
                const pctA = 50 + e.clamped * 33;
                return (
                  <div key={edgeKey} className="bg-slate-800/40 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-semibold">
                        {e.icon} {e.label}
                      </span>
                      {winner ? (
                        <span className={`text-xs font-black ${winColor}`}>
                          {winner.FIGHTER.split(' ').pop()} ▲
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Even</span>
                      )}
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.max(5, Math.min(95, pctA))}%` }}
                      />
                      <div className="h-full bg-red-500 flex-1" />
                    </div>
                    <p className="text-slate-600 text-xs mt-1.5">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  Model Input Comparison
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Every stat currently feeding the matchup score, grouped by the
                  same buckets the simulator uses.
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Blue = {fA.FIGHTER.split(' ').pop()} edge</p>
                <p>Red = {fB.FIGHTER.split(' ').pop()} edge</p>
              </div>
            </div>
            <div className="space-y-4">
              {SIMULATOR_COMPARISON_GROUPS.map((group) => (
                <div
                  key={group.title}
                  className="border border-slate-800 rounded-xl overflow-hidden"
                >
                  <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <p className="text-white text-sm font-bold">
                      {group.icon} {group.title}
                    </p>
                    <span className="text-slate-500 text-xs">
                      {group.items.length} inputs
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {group.items.map((item) => {
                      const a = fA[item.key];
                      const b = fB[item.key];
                      const outcome = getComparisonOutcome(a, b, item);
                      const delta = formatDelta(a, b, item);
                      return (
                        <div
                          key={item.key}
                          className="grid grid-cols-[1.2fr_0.9fr_0.7fr_0.9fr] gap-3 px-4 py-3 items-center"
                        >
                          <div>
                            <p className="text-slate-200 text-sm font-semibold">
                              {item.label}
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              {outcome === 'even'
                                ? 'No edge'
                                : outcome === 'A'
                                ? `${fA.FIGHTER.split(' ').pop()} edge`
                                : `${fB.FIGHTER.split(' ').pop()} edge`}
                            </p>
                          </div>
                          <div className="text-left">
                            <p
                              className={`font-mono text-sm font-bold ${
                                outcome === 'A'
                                  ? 'text-blue-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {formatComparisonValue(fA, item)}
                            </p>
                          </div>
                          <div className="text-center">
                            <span
                              className={`inline-flex items-center justify-center min-w-16 px-2 py-1 rounded-full text-xs font-black ${
                                outcome === 'A'
                                  ? 'bg-blue-950/50 text-blue-300 border border-blue-800/60'
                                  : outcome === 'B'
                                  ? 'bg-red-950/50 text-red-300 border border-red-800/60'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {delta}
                            </span>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-mono text-sm font-bold ${
                                outcome === 'B'
                                  ? 'text-red-400'
                                  : 'text-slate-300'
                              }`}
                            >
                              {formatComparisonValue(fB, item)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FINISH PROBABILITY ── */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Projected Finish Method
            </p>
            {(() => {
              const avgFinish =
                ((fA.FINISH_RATE ?? 0) + (fB.FINISH_RATE ?? 0)) / 2;
              const avgKdRate =
                ((fA.KD_PER_MIN ?? 0) + (fB.KD_PER_MIN ?? 0)) / 2;
              const avgKoWinPct =
                ((fA.KO_WIN_PCT ?? 0) + (fB.KO_WIN_PCT ?? 0)) / 2;
              const avgSubWinPct =
                ((fA.SUB_WIN_PCT ?? 0) + (fB.SUB_WIN_PCT ?? 0)) / 2;
              const avgSubThreat =
                ((fA.SUB_THREAT_RATE ?? 0) + (fB.SUB_THREAT_RATE ?? 0)) / 2;

              const rawKO = Math.min(
                avgKoWinPct * 0.55 + avgKdRate * 700 + avgFinish * 0.18,
                60
              );
              const rawSub = Math.min(
                avgSubWinPct * 0.75 + avgSubThreat * 8 + avgFinish * 0.12,
                60
              );
              const rawDec = Math.max(100 - rawKO - rawSub, 18);

              const total = rawKO + rawSub + rawDec;
              const ko = ((rawKO / total) * 100).toFixed(0);
              const sub = ((rawSub / total) * 100).toFixed(0);
              const dec = ((rawDec / total) * 100).toFixed(0);

              return (
                <div className="grid grid-cols-3 gap-3 text-center">
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
                    <div key={label} className="bg-slate-800/40 rounded-xl p-4">
                      <p className="text-lg mb-1">{icon}</p>
                      <p className={`font-black text-2xl ${tc}`}>{pct}%</p>
                      <p className="text-slate-400 text-xs mt-1">{label}</p>
                      <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
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

          {/* ── PATH TO VICTORY ── */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Path to Victory
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { f: fA, opp: fB, color: 'blue' },
                { f: fB, opp: fA, color: 'red' },
              ].map(({ f, opp, color }) => {
                const paths = [];
                if ((f.NET_STRIKE_MARGIN ?? 0) > (opp.NET_STRIKE_MARGIN ?? 0))
                  paths.push(
                    'Out-strikes opponent — lands more, absorbs less per minute'
                  );
                if ((f.SIG_STR_ACC ?? 0) > (opp.SIG_STR_ACC ?? 0))
                  paths.push(
                    `Higher strike accuracy (${f.SIG_STR_ACC?.toFixed(
                      1
                    )}% vs ${opp.SIG_STR_ACC?.toFixed(1)}%)`
                  );
                if ((f.TD_ACC ?? 0) > (opp.TD_ACC ?? 0))
                  paths.push('Superior takedown defense — stays on the feet');
                if ((f.TDE ?? 0) > (opp.TDE ?? 0))
                  paths.push('Offensive wrestling — can drag fight to the mat');
                if ((f.CARDIO_DECAY ?? 0) > (opp.CARDIO_DECAY ?? 0))
                  paths.push(
                    'Gets stronger late — output increases in rounds 3–5'
                  );
                if ((f.FINISH_RATE ?? 0) > 55)
                  paths.push(
                    `High finish rate (${f.FINISH_RATE?.toFixed(
                      0
                    )}%) — dangerous in any position`
                  );
                if (
                  (f.KD_PER_MIN ?? 0) > (opp.KD_PER_MIN ?? 0) &&
                  (f.KD_PER_MIN ?? 0) > 0.01
                )
                  paths.push('Knockdown power — can end fight standing');
                if ((f.CONTROL_TIME_PCT ?? 0) > (opp.CONTROL_TIME_PCT ?? 0))
                  paths.push(
                    "Ground control — limits opponent's offense from bottom"
                  );
                if ((f.OQI ?? 0) > (opp.OQI ?? 0))
                  paths.push(
                    `Stronger opposition quality (OQI ${f.OQI?.toFixed(
                      1
                    )} vs ${opp.OQI?.toFixed(1)})`
                  );
                if (paths.length === 0)
                  paths.push(
                    'No statistically clear edge — competitive matchup across all domains'
                  );
                return (
                  <div
                    key={f.FIGHTER}
                    className={`border ${
                      color === 'blue'
                        ? 'border-blue-800/50'
                        : 'border-red-800/50'
                    } rounded-xl p-4`}
                  >
                    <p
                      className={`font-bold text-sm mb-3 ${
                        color === 'blue' ? 'text-blue-400' : 'text-red-400'
                      }`}
                    >
                      {f.FIGHTER}
                    </p>
                    <ul className="space-y-1.5">
                      {paths.slice(0, 4).map((p, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-xs text-slate-400"
                        >
                          <span
                            className={`${
                              color === 'blue'
                                ? 'text-blue-500'
                                : 'text-red-500'
                            } mt-0.5 shrink-0`}
                          >
                            •
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
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
        { key: 'KD_PER_MIN', label: 'Knockdowns/min', dec: 4 },
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
                  {fighter.UFC_RANK && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        fighter.UFC_RANK.rank === 'C'
                          ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {ufcRankLabel(fighter.FIGHTER)} UFC Official
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
                      <span className="w-4 h-0.5 bg-red-500 inline-block rounded" />
                      {fighter.FIGHTER}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-slate-500 inline-block rounded" />
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
                    ].map(({ label, sub, val, max, dec, color, suf = '' }) => (
                      <div key={label}>
                        <div className="flex justify-between items-end mb-1.5">
                          <div>
                            <p className="text-slate-200 font-semibold text-sm">
                              {label}
                            </p>
                            <p className="text-slate-500 text-xs">{sub}</p>
                          </div>
                          <p className="text-xl font-black text-white">
                            {val.toFixed(dec)}
                            {suf}
                          </p>
                        </div>
                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${color} rounded-full`}
                            style={{
                              width: `${Math.min((val / max) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
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
                  {/* Performance trend chart */}
                  {perfTrendData.length >= 2 && (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                        Recent Results Trend (Oldest → Most Recent)
                      </p>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart
                          data={perfTrendData}
                          margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
                        >
                          <XAxis
                            dataKey="fight"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 1]}
                            tick={false}
                            axisLine={false}
                            tickLine={false}
                            width={20}
                          />
                          <Tooltip
                            contentStyle={{
                              background: '#1e293b',
                              border: '1px solid #475569',
                              borderRadius: 8,
                              fontSize: 11,
                            }}
                            itemStyle={{ color: '#cbd5e1' }}
                            formatter={(_, __, item) =>
                              item?.payload?.opponent || ''
                            }
                            labelFormatter={(label) => label}
                          />
                          <Bar
                            dataKey="score"
                            name="Result"
                            radius={[4, 4, 0, 0]}
                          >
                            {perfTrendData.map((entry, i) => (
                              <Cell
                                key={i}
                                fill={
                                  entry.result === 'W'
                                    ? '#22c55e'
                                    : entry.result === 'L'
                                    ? '#ef4444'
                                    : '#64748b'
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-slate-600 text-xs text-center mt-1">
                        Green = Win · Red = Loss · Gray = NC/Other
                      </p>
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
  const [view, setView] = useState('table');
  const [wc, setWC] = useState('All Divisions');
  const [minMin, setMinMin] = useState(0);
  const [roiEntries, setRoiEntries] = useState(ROI_ENTRIES);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header view={view} setView={setView} />
      {view === 'table' && (
        <Filters
          wc={wc}
          setWC={setWC}
          minMin={minMin}
          setMinMin={setMinMin}
          count={filtered.length}
        />
      )}
      {view === 'table' && <DataTable fighters={filtered} />}
      {view === 'simulator' && (
        <MatchupSimulator
          allFighters={FIGHTERS}
          onSavePrediction={handleSavePrediction}
          onOpenROI={() => setView('roi')}
        />
      )}
      {view === 'scout' && <ScoutProfile allFighters={FIGHTERS} />}
      {view === 'roi' && (
        <ROITab
          entries={roiEntries}
          onUpdateEntry={handleUpdateROIEntry}
          onDeleteEntry={handleDeleteROIEntry}
          onClearEntries={handleClearROI}
        />
      )}
      {view === 'info' && <InfoTab />}
    </div>
  );
}

function ROITab({ entries, onUpdateEntry, onDeleteEntry, onClearEntries }) {
  const exportedCode = `export const ROI_ENTRIES = ${JSON.stringify(
    entries,
    null,
    2
  )};\n`;
  const evaluatedEntries = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
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
      })),
    [entries]
  );

  const summary = useMemo(() => {
    const graded = evaluatedEntries.filter((entry) =>
      isResolvedWinner(entry.actualWinner, entry)
    );
    const decisive = graded.filter((entry) => entry.actualWinner !== 'NC');
    const correct = decisive.filter(
      (entry) => entry.displayWinner === entry.actualWinner
    ).length;
    const betEntries = decisive.filter((entry) =>
      Boolean(americanToDecimal(entry.marketOdds))
    );
    const profit = betEntries.reduce(
      (sum, entry) => sum + (calcTrackedProfit(entry) ?? 0),
      0
    );
    const stake = betEntries.length * 100;
    return {
      total: entries.length,
      graded: graded.length,
      correct,
      accuracy: decisive.length ? (correct / decisive.length) * 100 : 0,
      bets: betEntries.length,
      profit,
      roi: stake > 0 ? (profit / stake) * 100 : 0,
    };
  }, [evaluatedEntries]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white font-black text-xl mb-1">ROI</h2>
          <p className="text-slate-400 text-sm">
            Save simulator picks, grade them after the event, and track flat
            stake profit plus pick accuracy.
          </p>
        </div>
        {entries.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(exportedCode)}
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
            >
              Copy Updated roiData.js
            </button>
            <button
              onClick={onClearEntries}
              className="px-3 py-2 rounded-lg border border-slate-700 text-slate-400 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tracked Fights', value: summary.total, tone: 'text-white' },
          {
            label: 'Graded Picks',
            value: summary.graded,
            tone: 'text-blue-400',
          },
          {
            label: 'Pick Accuracy',
            value: `${summary.accuracy.toFixed(1)}%`,
            tone:
              summary.accuracy >= 60 ? 'text-emerald-400' : 'text-yellow-400',
          },
          {
            label: 'ROI',
            value: `${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%`,
            tone: summary.roi >= 0 ? 'text-emerald-400' : 'text-red-400',
            sub: `${summary.profit >= 0 ? '+' : ''}$${summary.profit.toFixed(
              2
            )} on ${summary.bets} bets`,
          },
        ].map(({ label, value, tone, sub }) => (
          <div
            key={label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
              {label}
            </p>
            <p className={`font-black text-2xl mt-2 ${tone}`}>{value}</p>
            {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
          </div>
        ))}
      </div>
      {entries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-600">
          <Calendar size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No saved predictions yet.</p>
          <p className="text-xs mt-1">
            Build a matchup in the Simulator and use Save Prediction to send it
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluatedEntries.map((entry) => {
            const graded = isResolvedWinner(entry.actualWinner, entry);
            const decisive =
              entry.actualWinner === entry.fighterA ||
              entry.actualWinner === entry.fighterB;
            const correct =
              decisive && entry.displayWinner === entry.actualWinner;
            const profit = calcTrackedProfit(entry);
            const trackedProb = entry.displayTrackedProb;
            const trackedEdge = entry.displayEdge;

            return (
              <div
                key={entry.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-black text-lg">
                        {entry.fighterA} vs. {entry.fighterB}
                      </h3>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          !graded
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : correct
                            ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                            : entry.actualWinner === 'NC'
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-red-900/40 text-red-400 border-red-800'
                        }`}
                      >
                        {!graded
                          ? 'Pending'
                          : entry.actualWinner === 'NC'
                          ? 'No Contest'
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
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-500 text-xs font-semibold hover:text-white hover:border-slate-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Displayed pick</p>
                    <p className="text-white font-bold text-sm mt-1">
                      {entry.displayWinner}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {((entry.displayProb ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Tracked side</p>
                    <p className="text-white font-bold text-sm mt-1">
                      {entry.trackedSide}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {((trackedProb ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Market odds</p>
                    <p className="text-white font-bold text-sm mt-1">
                      {entry.marketOdds || '—'}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {trackedEdge != null
                        ? `${trackedEdge > 0 ? '+' : ''}${(
                            trackedEdge * 100
                          ).toFixed(1)}% edge`
                        : 'No saved market edge'}
                    </p>
                  </div>
                  <div className="bg-slate-800/40 rounded-lg p-3">
                    <p className="text-slate-500 text-xs">Flat Profit</p>
                    <p
                      className={`font-bold text-sm mt-1 ${
                        profit == null
                          ? 'text-slate-300'
                          : profit >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {profit == null
                        ? 'Pending'
                        : `${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {entry.actualWinner || 'Awaiting result'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3">
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
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
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
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
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
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
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
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
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
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                    >
                      <option value="">Pending</option>
                      <option value={entry.fighterA}>{entry.fighterA}</option>
                      <option value={entry.fighterB}>{entry.fighterB}</option>
                      <option value="NC">No Contest</option>
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
}
function InfoTab() {
  const sections = [
    {
      title: 'Striking Output',
      icon: '⚔️',
      finding:
        'The strongest predictor of winning across all divisions. Outstriking an opponent — measured by significant strikes landed per minute — was the most reliable edge in every model tested, regardless of weight class.',
    },
    {
      title: 'Takedown Defense > Offense',
      icon: '🛡️',
      finding:
        'Takedown defense outperformed takedown offense as a win predictor. Fighters who neutralize wrestling and maintain positional control consistently outperform those who rely on taking opponents down.',
    },
    {
      title: 'Physical Traits by Division',
      icon: '📏',
      finding:
        "Heavier men's divisions showed stronger correlations with reach and size differentials. Lighter divisions and women's classes relied more on technique, tempo, and fight IQ than physical attributes.",
    },
    {
      title: 'Age Has Negative Impact',
      icon: '📉',
      finding:
        'Older fighters saw consistently lower win probabilities across nearly every model. This effect was strongest in physical-attribute-only models, suggesting younger fighters better leverage their physical prime.',
    },
    {
      title: 'Combined Stats Win',
      icon: '🎯',
      finding:
        'The full combined model reached ~71% accuracy vs ~68% for physical-only models. Blending striking, grappling, and physical data produces the sharpest predictive picture.',
    },
  ];
  const stats = [
    {
      term: 'OQI',
      full: 'Overall Quality Index',
      formula:
        "Composite of efficiency, credibility, and output metrics — the primary ranking stat, analogous to KenPom's overall rating.",
      color: 'text-red-400',
    },
    {
      term: 'EFF',
      full: 'Efficiency Rating',
      formula:
        'EFF = (Strike Accuracy × NSM) + (TD% × TDE) + (Control Time per 15min × 0.5). Each component is normalized to the division mean, then weighted and summed. A fighter with high accuracy who also lands more than they absorb, defends takedowns, and controls position will score highest. The result is scaled 0–100 per division.',
      color: 'text-orange-400',
    },
    {
      term: 'CRED%',
      full: 'Credibility Percentage',
      formula:
        'Bayesian confidence weight. Shrinks EFF toward the division mean based on sample size. More fights = higher credibility = EFF closer to raw value.',
      color: 'text-yellow-400',
    },
    {
      term: 'NSM',
      full: 'Net Strike Margin',
      formula:
        'Significant strikes landed minus significant strikes absorbed per minute. Positive = net striker, negative = net absorber.',
      color: 'text-green-400',
    },
    {
      term: 'TDE',
      full: 'Takedown Efficiency',
      formula:
        'Takedowns landed per 15 minutes, weighted by takedown accuracy. Measures offensive wrestling output.',
      color: 'text-cyan-400',
    },
    {
      term: 'TD%',
      full: 'Takedown Defense %',
      formula:
        'Percentage of opponent takedown attempts successfully defended. Higher is better — this proved more predictive than TDE.',
      color: 'text-blue-400',
    },
    {
      term: 'CRDY',
      full: 'Cardio / Late-Round Ratio',
      formula:
        "Compares a fighter's output in rounds 3–5 vs rounds 1–2. Values above 1.0 indicate fighters who finish stronger.",
      color: 'text-purple-400',
    },
    {
      term: 'FIN%',
      full: 'Finish Rate',
      formula:
        'Percentage of wins by KO/TKO or submission. High values indicate fight-ending power rather than decision-reliance.',
      color: 'text-pink-400',
    },
    {
      term: 'DMG',
      full: 'Damage Output Index',
      formula:
        'Combines significant strikes landed, knockdowns, and finish rate into a single damage-dealing composite score.',
      color: 'text-red-300',
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
      {/* Key Findings */}
      <div>
        <h2 className="text-white font-black text-xl mb-1">Model Insights</h2>
        <p className="text-slate-400 text-sm mb-5">
          Key findings from combining full fight stats, physical attributes, and
          per-division breakdowns across all predictive models. Backtest
          accuracy ({backtest.correct}/{backtest.total} fights in dataset):{' '}
          <span className="text-red-400 font-bold">
            {backtest.accuracy.toFixed(1)}%
          </span>
          .
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map(({ title, icon, finding }) => (
            <div
              key={title}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <h3 className="text-white font-bold text-sm">{title}</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {finding}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Stat Glossary */}
      <div>
        <h2 className="text-white font-black text-xl mb-1">Stat Glossary</h2>
        <p className="text-slate-400 text-sm mb-5">
          Every column in the Database tab explained — what it measures, how it
          was derived, and why it matters.
        </p>
        <div className="space-y-2">
          {stats.map(({ term, full, formula, color }) => (
            <div
              key={term}
              className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex gap-4 items-start hover:border-slate-700 transition-colors"
            >
              <span
                className={`font-black text-sm font-mono w-16 shrink-0 ${color}`}
              >
                {term}
              </span>
              <div>
                <p className="text-white text-sm font-semibold">{full}</p>
                <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                  {formula}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
