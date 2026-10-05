// ─── DOMAIN / STATISTICS / MODEL SCOREBOARD ─────────────────────────────────
// One table comparing the models on the SAME fights, so "is the model any
// better than the market?" has a direct answer:
//
//   Tracked pick   the frozen decision the app showed (resolveFrozenPerformanceView)
//   C6             stored c6ProbA when the fight was C6-driven; otherwise the
//                  same frozen formula applied to the fight's own frozen v2 and
//                  saved odds (no lookahead: both were fixed before the fight)
//   v2             frozen v2pA
//   Market         proportional no-vig favourite at the saved odds
//
// Population: graded, decisive, LIVE-captured fights with frozen v2 and both
// saved odds -- the only fights a fair comparison can use. Each row reports
// accuracy, Brier score (lower is better; 0.25 = coin flip) and flat 1u ROI
// at the saved price of the side it picked. Pure; reads stored fields only.

import { resolveFrozenPerformanceView } from '../betting';
import { americanToDecimal, buildMarketInput } from '../betting/marketCore.js';
import { computeC6ProbA } from '../shadow/c6.js';

function eligible(e) {
  if (e?._provenance?.captureMode !== 'live') return false;
  if (e.actualWinner !== e.fighterA && e.actualWinner !== e.fighterB) return false;
  if (e.v2pA == null) return false;
  return buildMarketInput({ oddsA: e.oddsA, oddsB: e.oddsB }).valid;
}

function row(label, picks) {
  // picks: [{ pA, won(bool for A winning), sideOdds(pick side decimal) }]
  let n = 0, correct = 0, brier = 0, units = 0;
  for (const p of picks) {
    if (!Number.isFinite(p.pA)) continue;
    n += 1;
    const pickA = p.pA >= 0.5;
    const win = pickA === p.aWon;
    correct += win;
    brier += (p.pA - (p.aWon ? 1 : 0)) ** 2;
    const dec = pickA ? p.decA : p.decB;
    units += win ? dec - 1 : -1;
  }
  return {
    model: label,
    fights: n,
    accuracy: n ? (correct / n) * 100 : null,
    brier: n ? brier / n : null,
    roi: n ? (units / n) * 100 : null,
    units,
  };
}

/**
 * @param {object[]} entries graded ROI entries (any SINCE filter already applied)
 * @param {{last?:number}} [opts] keep only the most recent `last` eligible fights
 * @returns {{fights:number, c6Derived:number, rows:object[], from:(string|null), to:(string|null)}}
 */
export function computeModelScoreboard(entries, { last } = {}) {
  let pool = (entries ?? []).filter(eligible)
    .sort((a, b) => (b.eventDate || '').localeCompare(a.eventDate || ''));
  if (last) pool = pool.slice(0, last);

  let c6Derived = 0;
  const base = pool.map((e) => {
    const mkt = buildMarketInput({ oddsA: e.oddsA, oddsB: e.oddsB });
    let c6pA = e.c6ProbA;
    if (c6pA == null) {
      const c6 = computeC6ProbA({ noVigA: mkt.noVigA, v2pA: e.v2pA });
      c6pA = c6.available ? c6.c6pA : NaN;
      c6Derived += 1;
    }
    const view = resolveFrozenPerformanceView(e);
    const trackedA = view && !view.malformed && view.pickedFighter
      ? (view.pickedFighter === e.fighterA ? view.probability : 1 - view.probability)
      : NaN;
    return {
      aWon: e.actualWinner === e.fighterA,
      decA: americanToDecimal(e.oddsA),
      decB: americanToDecimal(e.oddsB),
      tracked: trackedA,
      c6: c6pA,
      v2: e.v2pA,
      market: mkt.noVigA,
    };
  });
  const pick = (k) => base.map((b) => ({ pA: b[k], aWon: b.aWon, decA: b.decA, decB: b.decB }));

  return {
    fights: pool.length,
    c6Derived,
    from: pool.length ? pool.at(-1).eventDate : null,
    to: pool.length ? pool[0].eventDate : null,
    rows: [
      row('Tracked pick', pick('tracked')),
      row('C6', pick('c6')),
      row('v2', pick('v2')),
      row('Market favorite', pick('market')),
    ],
  };
}
