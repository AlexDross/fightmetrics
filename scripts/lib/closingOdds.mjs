// Closing odds from the fightodds.io GraphQL aggregator (the route that works
// from this machine; Polymarket/Kalshi/most sportsbook APIs are TLS-blocked).
// After an event, each book's offer is its final pre-fight price -- the close.
//
// Prices are bound to the entry's fighter A/B BY NAME, never by the
// aggregator's outcome1/outcome2 slot order, which does not follow the card.

import { pickClosingLine } from '../../src/domain/betting/closing.js';

const GQL = 'https://api.fightodds.io/gql';

async function gql(query) {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`fightodds.io HTTP ${res.status}`);
  const body = await res.json();
  if (body.errors?.length) throw new Error(`fightodds.io: ${body.errors[0].message}`);
  return body.data;
}

const norm = (s) => String(s ?? '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

// Does an aggregator fighter {firstName, lastName} name this entry fighter?
// Full name in either order first; then a unique last-name match.
const fullNames = (f) => [norm(`${f.firstName} ${f.lastName}`), norm(`${f.lastName} ${f.firstName}`)];
const lastOf = (name) => norm(name).split(' ').pop();

function sameFighter(aggFighter, entryName) {
  const n = norm(entryName);
  if (fullNames(aggFighter).includes(n)) return 2;
  const last = norm(aggFighter.lastName);
  if (last && (n.endsWith(` ${last}`) || n.startsWith(`${last} `) || n === last)) return 1;
  return 0;
}

async function findEvent(eventName, eventDate) {
  // Drop the "UFC Fight Night:"-style prefix variations by searching on the
  // most specific part the aggregator is likely to share.
  const term = eventName.includes(':') ? eventName.split(':')[0].trim() : eventName;
  const data = await gql(`{allEvents(name_Icontains:${JSON.stringify(term)}, first:20){edges{node{pk name date}}}}`);
  const events = data.allEvents.edges.map((e) => e.node);
  const exact = events.find((e) => norm(e.name) === norm(eventName));
  if (exact) return exact;
  const byDate = events.filter((e) => e.date === eventDate);
  if (byDate.length === 1) return byDate[0];
  return null;
}

const OFFER_TABLE = (pk) => `{eventOfferTable(pk:${pk}, allFights:true){fightOffers{edges{node{
  fighter1{firstName lastName} fighter2{firstName lastName} isCancelled
  straightOffers{edges{node{sportsbook{shortName isPredictionMarket}
  outcome1{odds fighter{firstName lastName}} outcome2{odds fighter{firstName lastName}}}}}}}}}}`;

/**
 * Closing lines for the given entries of ONE event.
 * @returns {Promise<{event:(object|null), lines:Map<string,{oddsA,oddsB,source}>, unmatched:string[]}>}
 */
export async function fetchClosingLines(eventName, eventDate, entries) {
  const event = await findEvent(eventName, eventDate);
  if (!event) return { event: null, lines: new Map(), unmatched: entries.map((e) => e.id) };
  const data = await gql(OFFER_TABLE(event.pk));
  const fights = data.eventOfferTable.fightOffers.edges.map((e) => e.node).filter((f) => !f.isCancelled);

  const lines = new Map();
  const unmatched = [];
  for (const entry of entries) {
    // The aggregator fight naming both of this entry's fighters.
    const scored = fights.map((f) => {
      const a1 = sameFighter(f.fighter1, entry.fighterA), b2 = sameFighter(f.fighter2, entry.fighterB);
      const a2 = sameFighter(f.fighter2, entry.fighterA), b1 = sameFighter(f.fighter1, entry.fighterB);
      return { f, score: Math.max(a1 && b2 ? a1 + b2 : 0, a2 && b1 ? a2 + b1 : 0) };
    }).filter((x) => x.score > 0).sort((x, y) => y.score - x.score);
    if (!scored.length || (scored[1] && scored[1].score === scored[0].score)) { unmatched.push(entry.id); continue; }

    const offers = [];
    for (const o of scored[0].f.straightOffers.edges.map((e) => e.node)) {
      const outs = [o.outcome1, o.outcome2].filter((x) => x?.fighter && Number.isFinite(x.odds));
      const forA = outs.find((x) => sameFighter(x.fighter, entry.fighterA) > 0);
      const forB = outs.find((x) => sameFighter(x.fighter, entry.fighterB) > 0);
      if (!forA || !forB || forA === forB) continue;
      offers.push({ book: o.sportsbook.shortName, isPredictionMarket: !!o.sportsbook.isPredictionMarket, oddsA: forA.odds, oddsB: forB.odds });
    }
    const line = pickClosingLine(offers);
    if (line) lines.set(entry.id, line);
    else unmatched.push(entry.id);
  }
  return { event, lines, unmatched };
}
