// ─── DOMAIN / BETTING / CLOSING LINE ─────────────────────────────────────────
// Closing odds and closing-line value (CLV) for the v3 experiment's success
// test: a BET "beats the close" when its saved price is better than the
// no-vig closing line, i.e. closingNoVig(side) * decimal(savedPrice) - 1 > 0.
// That signal shows up in tens of bets, where ROI needs hundreds.
//
// The closing line is ONE book's final price, chosen in a fixed order so it is
// reproducible: Pinnacle (the market's sharp reference), then Circa, then the
// per-side median across the sportsbooks offered. Prediction markets are not
// used as the close (thin and often stale near fight time). Pure; no I/O.

import { americanToDecimal, buildMarketInput, parseAmericanOdds } from './marketCore.js';

export const CLOSING_BOOK_ORDER = Object.freeze(['Pinnacle', 'Circa']);

const fmt = (n) => (n > 0 ? `+${n}` : `${n}`);
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Choose the closing line for one fight.
 *
 * @param {Array<{book:string, isPredictionMarket:boolean, oddsA:number, oddsB:number}>} offers
 *   every book's final American odds, ALREADY bound to the entry's fighter A/B
 * @returns {{oddsA:string, oddsB:string, source:string}|null}
 */
export function pickClosingLine(offers) {
  const books = (offers ?? []).filter(
    (o) => !o.isPredictionMarket && Number.isFinite(o.oddsA) && Number.isFinite(o.oddsB) && o.oddsA !== 0 && o.oddsB !== 0
  );
  for (const name of CLOSING_BOOK_ORDER) {
    const o = books.find((b) => b.book === name);
    if (o) return { oddsA: fmt(o.oddsA), oddsB: fmt(o.oddsB), source: name };
  }
  if (!books.length) return null;
  // Median in implied-probability space, converted back, so +100/-100 never
  // averages to a meaningless 0.
  const toProb = (o) => parseAmericanOdds(fmt(o));
  const toOdds = (p) => (p >= 0.5 ? -Math.round((p / (1 - p)) * 100) : Math.round(((1 - p) / p) * 100));
  const pA = median(books.map((b) => toProb(b.oddsA)));
  const pB = median(books.map((b) => toProb(b.oddsB)));
  return { oddsA: fmt(toOdds(pA)), oddsB: fmt(toOdds(pB)), source: `median of ${books.length} books` };
}

/** The `closing` record stored on a graded entry. Throws on invalid odds. */
export function buildClosingRecord({ oddsA, oddsB, source, capturedAt = new Date().toISOString() }) {
  if (!buildMarketInput({ oddsA, oddsB }).valid) throw new TypeError('closing odds must be valid American odds');
  if (!source) throw new TypeError('closing source required');
  return { oddsA: String(oddsA), oddsB: String(oddsB), source: String(source), capturedAt };
}

/**
 * Closing-line value of a bet on `side` ('A' | 'B') at `betOdds`: the expected
 * return of that price under the no-vig closing probability. Null when the
 * entry has no closing record or the prices are invalid.
 */
export function closingLineValue(entry, side, betOdds) {
  const c = entry?.closing;
  if (!c || (side !== 'A' && side !== 'B')) return null;
  const mkt = buildMarketInput({ oddsA: c.oddsA, oddsB: c.oddsB });
  const dec = americanToDecimal(String(betOdds ?? ''));
  if (!mkt.valid || !dec) return null;
  return (side === 'A' ? mkt.noVigA : mkt.noVigB) * dec - 1;
}
