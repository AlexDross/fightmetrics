// ─── DOMAIN / STATISTICS / V3 RECORDS ───────────────────────────────────────
// The three records of the v3 gate experiment (proposal "FightMetrics Bet Logic
// v3"), kept strictly apart so a skipped bet, a changed stake or a paper LEAN
// can never blur the strategy's result:
//
//   strategy  every BET, frozen at save, 1u, at the saved price  (hypothetical)
//   paper     every LEAN, frozen at save, 1u, at the saved price (hypothetical)
//   actual    bets you recorded at fight day: accepted price, real stake
//
// plus a baseline (every C6 pick in the experiment at 1u), the BET
// calibration diagnostic (mean C6 probability vs actual win rate), and mean
// closing-line value (closing.js) for strategy and paper -- the success test
// needs it positive, not just ROI.
//
// Only live captures stamped with the frozen gate version count
// (isV3ExperimentEntry). Pure; reads stored fields only, never a model.

import { americanToDecimal, isV3ExperimentEntry } from '../betting';
import { closingLineValue } from '../betting/closing.js';

const isPush = (w) => w === 'NC' || w === 'DRAW';
const isDecisive = (e) => e.actualWinner === e.fighterA || e.actualWinner === e.fighterB;

function settle(rows) {
  // rows: [{ won:boolean|null(push), stake, decimal, prob? }]
  let wins = 0, losses = 0, pushes = 0, staked = 0, units = 0, probSum = 0, probN = 0, clvSum = 0, clvN = 0;
  for (const r of rows) {
    // CLV is a property of the price, not the result, so pushes count too.
    if (r.clv != null) { clvSum += r.clv; clvN += 1; }
    if (r.won === null) { pushes += 1; continue; }
    staked += r.stake;
    if (r.won) { wins += 1; units += r.stake * (r.decimal - 1); } else { losses += 1; units -= r.stake; }
    if (r.prob != null) { probSum += r.prob; probN += 1; }
  }
  const n = wins + losses;
  return {
    bets: n,
    wins,
    losses,
    pushes,
    staked,
    units,
    roi: staked > 0 ? (units / staked) * 100 : null,
    winRate: n > 0 ? (wins / n) * 100 : null,
    meanProb: probN > 0 ? (probSum / probN) * 100 : null,
    clvBets: clvN,
    meanCLV: clvN > 0 ? (clvSum / clvN) * 100 : null,
  };
}

const graded = (e) => isDecisive(e) || isPush(e.actualWinner);

// The frozen recommendation, settled at its own saved price and 1u.
function frozenRow(e) {
  const side = e.betRecommendedFighter || e.trackedSide;
  const odds = e.betRecommendedOdds || e.marketOdds;
  const decimal = americanToDecimal(odds);
  if (!side || !decimal) return null;
  const ab = side === e.fighterA ? 'A' : side === e.fighterB ? 'B' : null;
  const prob = ab === 'A' ? e.c6ProbA : ab === 'B' ? e.c6ProbB : null;
  const clv = closingLineValue(e, ab, odds);
  return { won: isPush(e.actualWinner) ? null : e.actualWinner === side, stake: 1, decimal, prob, clv };
}

/**
 * @param {object[]} entries graded + pending ROI/Upcoming entries
 * @returns {{strategy, paper, actual, baseline, pending:{bet:number, lean:number},
 *            skipped:number, experimentEntries:number}}
 */
export function computeV3Records(entries) {
  const exp = (entries ?? []).filter(isV3ExperimentEntry);
  const done = exp.filter(graded);

  const rowsFor = (tier) => done.filter((e) => e.betAction === tier).map(frozenRow).filter(Boolean);

  const actualRows = done
    .filter((e) => e.execution?.status === 'placed')
    .map((e) => {
      const x = e.execution;
      const side = x.fighter || e.betRecommendedFighter || e.trackedSide;
      const decimal = americanToDecimal(x.acceptedOdds);
      if (!side || !decimal) return null;
      return { won: isPush(e.actualWinner) ? null : e.actualWinner === side, stake: Number(x.stakeUnits) || 0, decimal };
    })
    .filter(Boolean);

  const baselineRows = done
    .map((e) => {
      const decimal = americanToDecimal(e.marketOdds);
      if (!e.trackedSide || !decimal) return null;
      return { won: isPush(e.actualWinner) ? null : e.actualWinner === e.trackedSide, stake: 1, decimal };
    })
    .filter(Boolean);

  return {
    strategy: settle(rowsFor('BET')),
    paper: settle(rowsFor('LEAN')),
    actual: settle(actualRows),
    baseline: settle(baselineRows),
    pending: {
      bet: exp.filter((e) => !graded(e) && e.betAction === 'BET').length,
      lean: exp.filter((e) => !graded(e) && e.betAction === 'LEAN').length,
    },
    skipped: exp.filter((e) => e.execution?.status === 'skipped').length,
    experimentEntries: exp.length,
  };
}
