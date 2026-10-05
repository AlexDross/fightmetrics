// Every model scored on the graded fights since C6 went live (first card 2026-08-22).
import { ROI_ENTRIES } from '../../src/roiData.js';
import { evaluateGateOnSnapshot, buildMarketInput } from '../../src/domain/betting/marketCore.js';

const imp = (o) => { o = Number(o); return o < 0 ? -o / (-o + 100) : 100 / (o + 100); };
const dec = (o) => { o = Number(o); return o < 0 ? 1 + 100 / -o : 1 + o / 100; };
const rows = ROI_ENTRIES.filter((e) => e.eventDate >= '2026-08-22'
  && (e.actualWinner === e.fighterA || e.actualWinner === e.fighterB)
  && e.oddsA && e.oddsB && e.v2pA != null && e.c6ProbA != null);

const models = {
  'v1': (e) => e.fighterAProb,
  'v2': (e) => e.v2pA,
  'C6': (e) => e.c6ProbA,
  'Market (no-vig)': (e) => imp(e.oddsA) / (imp(e.oddsA) + imp(e.oddsB)),
};
const out = [];
for (const [name, pA] of Object.entries(models)) {
  let n = 0, correct = 0, brier = 0, ll = 0, units = 0, favPicks = 0;
  for (const e of rows) {
    const p = pA(e); const y = e.actualWinner === e.fighterA ? 1 : 0;
    const pickA = p >= 0.5; const won = pickA === (y === 1);
    const mFavA = imp(e.oddsA) >= imp(e.oddsB);
    n++; correct += won; favPicks += pickA === mFavA;
    brier += (p - y) ** 2;
    const q = Math.min(Math.max(y ? p : 1 - p, 1e-6), 1);
    ll -= Math.log(q);
    units += won ? dec(pickA ? e.oddsA : e.oddsB) - 1 : -1;
  }
  out.push({ model: name, fights: n, accuracy: +(correct / n).toFixed(3),
    pickedFav: +(favPicks / n).toFixed(3), brier: +(brier / n).toFixed(4),
    logLoss: +(ll / n).toFixed(4), flatUnits: +units.toFixed(2), flatROI: +(units / n).toFixed(3) });
}
console.table(out);

// Bets: what each gate actually recommended
const bets = { stored: { n: 0, w: 0, u: 0 }, rule: { n: 0, w: 0, u: 0, fav: [0, 0], dog: [0, 0] } };
for (const e of rows) {
  const y = e.actualWinner === e.fighterA ? 1 : 0;
  if (e.betAction && e.betAction !== 'NO BET' && e.betRecommendedFighter) {
    const sideA = e.betRecommendedFighter === e.fighterA; const won = sideA === (y === 1);
    bets.stored.n++; bets.stored.w += won;
    bets.stored.u += (won ? dec(sideA ? e.oddsA : e.oddsB) - 1 : -1) * (e.unitsWagered ?? 1);
  }
  const p = e.c6ProbA; const sideA = p >= 0.5; const pp = sideA ? p : 1 - p;
  const d = dec(sideA ? e.oddsA : e.oddsB);
  if (pp * d - 1 >= 0.02 && d <= 3.0 && d >= 1.25) {
    const won = sideA === (y === 1); const u = won ? d - 1 : -1;
    bets.rule.n++; bets.rule.w += won; bets.rule.u += u;
    const isFav = (imp(e.oddsA) >= imp(e.oddsB)) === sideA;
    bets.rule[isFav ? 'fav' : 'dog'][0]++; bets.rule[isFav ? 'fav' : 'dog'][1] += u;
  }
}
console.log(JSON.stringify(bets, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v));
