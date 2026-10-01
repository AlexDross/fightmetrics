#!/usr/bin/env node
// Pull an upcoming card's moneyline prices off a prediction market and emit a
// draft card.json for scripts/enter_upcoming.mjs.
//
//   node scripts/fetch_card_odds.mjs "UFC 331" [--date 2026-09-19] [--kalshi] [--out card.json]
//
// Default source is POLYMARKET (gamma-api), which lists each fight as its own
// event titled "UFC 331: A vs. B (Division, Segment)" and carries a moneyline
// market whose two outcomes are the fighter names. outcomePrices are normalised
// to sum to 1, so they are already no-vig probabilities.
//
// --kalshi reads series KXUFCFIGHT instead. Its event tickers group the two
// sides of a fight (KXUFCFIGHT-26SEP19TSARUF-{TSA,RUF}) and its titles are
// clean, but a card with no trading yet returns null prices -- in that case
// this prints the pairings with no prices and you should fall back to
// Polymarket or a sportsbook.
//
// THE OUTPUT IS A DRAFT, NOT A CARD. It cannot know scheduled rounds or title
// status, and market name spellings are not roster spellings. Fill those in and
// run `enter_upcoming.mjs resolve` before adding anything.

import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flags = new Map();
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith('--')) { flags.set(key, next); i++; }
    else flags.set(key, true);
  } else positional.push(args[i]);
}
const query = positional[0];
if (!query) {
  console.error('usage: fetch_card_odds.mjs "UFC 331" [--date YYYY-MM-DD] [--kalshi] [--out card.json]');
  process.exit(1);
}

const getJson = async (url) => {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
};

// Canonical divisions the app accepts; anything else is left null so the entry
// falls back to roster normalisation rather than carrying a made-up division.
const DIVISIONS = new Set([
  'Heavyweight', 'Light Heavyweight', 'Middleweight', 'Welterweight', 'Lightweight',
  'Featherweight', 'Bantamweight', 'Flyweight',
  "Women's Featherweight", "Women's Bantamweight", "Women's Flyweight", "Women's Strawweight",
]);

async function fromPolymarket() {
  const search = await getJson(
    `https://gamma-api.polymarket.com/public-search?q=${encodeURIComponent(query)}&limit_per_type=40`
  );
  const events = (search.events ?? []).filter((e) =>
    (e.title ?? '').toLowerCase().startsWith(`${query.toLowerCase()}:`)
  );
  if (!events.length) throw new Error(`no Polymarket events titled "${query}: ..." -- check the event name`);

  const fights = [];
  for (const stub of events) {
    const [event] = await getJson(
      `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(stub.slug)}`
    );
    if (!event) continue;
    // The moneyline is the one market whose outcomes are the two fighters
    // rather than Yes/No or Over/Under. Prop markets on the same event (method,
    // rounds, per-round) are deliberately ignored.
    const moneyline = (event.markets ?? []).find((m) => {
      let outcomes;
      try { outcomes = JSON.parse(m.outcomes ?? '[]'); } catch { return false; }
      return outcomes.length === 2 &&
        !['yes', 'over'].includes(String(outcomes[0]).toLowerCase());
    });
    if (!moneyline) { console.error(`skip (no moneyline market): ${event.title}`); continue; }
    const outcomes = JSON.parse(moneyline.outcomes);
    const prices = JSON.parse(moneyline.outcomePrices ?? '[]').map(Number);
    // A closed / non-order-accepting market is NOT a live line. Polymarket
    // closes a fight's market when the bout is pulled, and leaves the last
    // prices (often 0.50/0.50) sitting there -- which would otherwise read as a
    // genuine pick'em. Null the prices so it surfaces as unpriced.
    const tradable = moneyline.closed !== true && moneyline.acceptingOrders !== false;
    const meta = /\(([^)]*)\)\s*$/.exec(event.title ?? '');
    const parts = meta ? meta[1].split(',').map((s) => s.trim()) : [];
    const division = parts.find((p) => DIVISIONS.has(p)) ?? null;
    fights.push({
      fighterA: outcomes[0],
      fighterB: outcomes[1],
      probA: tradable ? prices[0] ?? null : null,
      probB: tradable ? prices[1] ?? null : null,
      division,
      isTitleBout: null,
      scheduledRounds: null,
      _segment: parts[parts.length - 1] ?? null,
      ...(tradable ? {} : { _marketClosed: true, _closedPrices: prices }),
      _liquidity: Math.round(moneyline.liquidityNum ?? 0),
      _volume: Math.round(moneyline.volumeNum ?? 0),
      _source: `https://polymarket.com/event/${stub.slug}`,
    });
  }
  return { fights, source: 'polymarket' };
}

async function fromKalshi() {
  const { markets } = await getJson(
    'https://api.elections.kalshi.com/trade-api/v2/markets?series_ticker=KXUFCFIGHT&status=open&limit=200'
  );
  const byEvent = new Map();
  for (const m of markets ?? []) {
    if (!byEvent.has(m.event_ticker)) byEvent.set(m.event_ticker, []);
    byEvent.get(m.event_ticker).push(m);
  }
  const fights = [];
  for (const [ticker, sides] of byEvent) {
    if (sides.length !== 2) continue;
    // Kalshi prices are cents on YES. Use the bid/ask midpoint when both exist,
    // else last_price; null means the market has not traded.
    const price = (m) => {
      if (m.yes_bid != null && m.yes_ask != null) return (m.yes_bid + m.yes_ask) / 200;
      if (m.last_price != null) return m.last_price / 100;
      return null;
    };
    fights.push({
      fighterA: sides[0].yes_sub_title,
      fighterB: sides[1].yes_sub_title,
      probA: price(sides[0]),
      probB: price(sides[1]),
      division: null,
      isTitleBout: null,
      scheduledRounds: null,
      _source: `https://kalshi.com/markets/${ticker}`,
    });
  }
  return { fights, source: 'kalshi' };
}

const { fights, source } = flags.has('kalshi') ? await fromKalshi() : await fromPolymarket();

const priced = fights.filter((f) => f.probA != null && f.probB != null);
const unpriced = fights.filter((f) => f.probA == null || f.probB == null);

const card = {
  eventName: query,
  eventDate: typeof flags.get('date') === 'string' ? flags.get('date') : null,
  _source: source,
  _retrievedAt: new Date().toISOString(),
  fights,
};

const out = flags.get('out');
if (typeof out === 'string') {
  writeFileSync(out, `${JSON.stringify(card, null, 2)}\n`);
  console.error(`wrote ${out}`);
} else {
  process.stdout.write(`${JSON.stringify(card, null, 2)}\n`);
}

console.error(`\n${source}: ${fights.length} fight(s), ${priced.length} priced, ${unpriced.length} unpriced`);
for (const f of unpriced) {
  console.error(
    `  unpriced: ${f.fighterA} vs ${f.fighterB}` +
      (f._marketClosed
        ? `  [MARKET CLOSED -- last ${f._closedPrices?.join('/')}; the bout was probably pulled, verify before entering]`
        : '')
  );
}
if (!card.eventDate) console.error('\neventDate is null -- set it before running enter_upcoming.mjs');
