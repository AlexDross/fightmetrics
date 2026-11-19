// Closing odds from the fightodds.io GraphQL aggregator (the route that works
// from this machine; Polymarket/Kalshi/most sportsbook APIs are TLS-blocked),
// falling back to bestfightodds.com's event page when fightodds.io refuses
// (since 2026-10 it answers 403 "Unknown query" to ad-hoc GraphQL queries).
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
 * fightodds.io closing lines for the given entries of ONE event.
 * @returns {Promise<{event:(object|null), lines:Map<string,{oddsA,oddsB,source}>, unmatched:string[]}>}
 */
async function fetchFromFightOdds(eventName, eventDate, entries) {
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

// ─── bestfightodds.com fallback ──────────────────────────────────────────────
// The event page lists every book's last moneyline per matchup in cells like
//   <td data-li="[<book>,<1|2>,<matchup>]"><span ...>-122</span>
// and the book names in the header as <th data-b="<book>">Name. BFO names its
// events differently ("UFC 332" for a Fight Night), so the event is found from
// a tracked fighter's page and confirmed by how many entries it covers.

const BFO = 'https://www.bestfightodds.com';
const BFO_PREDICTION_MARKETS = new Set(['Polymarket', 'Kalshi']);

async function bfoGet(path) {
  const res = await fetch(`${BFO}${path}`, { headers: { 'user-agent': 'Mozilla/5.0 (fightmetrics grading)' } });
  if (!res.ok) throw new Error(`bestfightodds.com HTTP ${res.status}`);
  return res.text();
}

const stripTags = (s) => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
const asFighter = (full) => {
  const parts = String(full).trim().split(/\s+/);
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
};

/** Parse a BFO event page into [{ fighter1, fighter2, offers:[{book,isPredictionMarket,odds1,odds2}] }]. */
export function parseBfoEvent(html) {
  const books = new Map();
  for (const m of html.matchAll(/data-b="(\d+)">(.*?)<\/th>/g)) books.set(m[1], stripTags(m[2].split('<br>')[0]));

  const byMu = new Map();
  const cell = /data-li="\[(\d+),([12]),(\d+)\]"><span[^>]*>([+-]?\d+)<\/span>/g;
  for (const m of html.matchAll(cell)) {
    const [, book, side, mu, odds] = m;
    if (!byMu.has(mu)) byMu.set(mu, { names: {}, offers: new Map() });
    const rec = byMu.get(mu);
    if (!rec.names[side]) {
      // The fighter's name is the last t-b-fcc span before this row's first cell.
      const before = html.slice(Math.max(0, m.index - 3000), m.index);
      const names = [...before.matchAll(/<span class="t-b-fcc">([^<]*)<\/span>/g)];
      if (names.length) rec.names[side] = names[names.length - 1][1].trim();
    }
    if (!rec.offers.has(book)) rec.offers.set(book, {});
    rec.offers.get(book)[side] = Number(odds);
  }

  return [...byMu.values()]
    .filter((r) => r.names[1] && r.names[2])
    .map((r) => ({
      fighter1: asFighter(r.names[1]),
      fighter2: asFighter(r.names[2]),
      offers: [...r.offers.entries()]
        .filter(([, o]) => Number.isFinite(o[1]) && Number.isFinite(o[2]))
        .map(([b, o]) => {
          const book = books.get(b) ?? `book ${b}`;
          return { book, isPredictionMarket: BFO_PREDICTION_MARKETS.has(book), odds1: o[1], odds2: o[2] };
        }),
    }));
}

// The fight for an entry: both names match, or -- when one side is spelled
// differently (Daria/Darya, "Kai Kamaka III") -- the only fight on the card
// featuring the other side. Returns { fight, aIs1 } or null.
function matchFight(fights, entry) {
  // Score both orientations: when the two fighters share a surname (Yana vs
  // Luana Santos) both match on last name, and only the full-name score says
  // which side is which. A tie there is ambiguous, so it binds nothing.
  const both = fights.flatMap((f) => {
    const a1 = sameFighter(f.fighter1, entry.fighterA), b2 = sameFighter(f.fighter2, entry.fighterB);
    const a2 = sameFighter(f.fighter2, entry.fighterA), b1 = sameFighter(f.fighter1, entry.fighterB);
    const s12 = a1 && b2 ? a1 + b2 : 0, s21 = a2 && b1 ? a2 + b1 : 0;
    if (s12 > s21) return [{ fight: f, aIs1: true }];
    if (s21 > s12) return [{ fight: f, aIs1: false }];
    return s12 ? [{ fight: f, aIs1: null }] : [];
  });
  if (both.some((x) => x.aIs1 === null)) return null;
  if (both.length === 1) return both[0];
  if (both.length > 1) return null;
  const one = fights.flatMap((f) => {
    const a1 = sameFighter(f.fighter1, entry.fighterA), a2 = sameFighter(f.fighter2, entry.fighterA);
    const b1 = sameFighter(f.fighter1, entry.fighterB), b2 = sameFighter(f.fighter2, entry.fighterB);
    if ((a1 === 2 || b2 === 2) && !a2 && !b1) return [{ fight: f, aIs1: true }];
    if ((a2 === 2 || b1 === 2) && !a1 && !b2) return [{ fight: f, aIs1: false }];
    return [];
  });
  return one.length === 1 ? one[0] : null;
}

// A fighter's most recent BFO events (newest first), or [] if not found.
async function bfoFighterEvents(name, limit = 2) {
  const search = await bfoGet(`/search?query=${encodeURIComponent(name)}`);
  const fighterPath = [...search.matchAll(/href="(\/fighters\/[^"]+)"[^>]*>([^<]*)/g)]
    .find((m) => norm(m[2]) === norm(name))?.[1]
    ?? search.match(/href="(\/fighters\/[^"]+)"/)?.[1];
  if (!fighterPath) return [];
  const page = await bfoGet(fighterPath);
  return [...new Set([...page.matchAll(/href="(\/events\/[^"]+)"/g)].map((m) => m[1]))].slice(0, limit);
}

/**
 * The card a fighter is on now (their newest BFO event), for entering an
 * upcoming card from sportsbook lines.
 * @returns {Promise<{path:string, title:string, fights:Array}|null>}
 */
export async function fetchBfoCardByFighter(name) {
  const [path] = await bfoFighterEvents(name, 1);
  if (!path) return null;
  const html = await bfoGet(path);
  const title = (html.match(/<title>([^<|]*)/)?.[1] ?? path).trim();
  return { path, title, fights: parseBfoEvent(html) };
}

// Fighter-page lookups allowed per card. Each costs a search plus a fighter
// page, so a card BFO does not list at all gives up instead of searching
// every fighter on it.
const BFO_MAX_FIGHTER_LOOKUPS = 8;

// The BFO event pages a card's entries are on. BFO sometimes splits one card
// across pages (UFC 334: main card on one page, prelims on another), so this
// keeps looking, from the first entry no fetched page lists yet, until every
// entry is on some page or the lookup budget is spent.
async function bfoPagesFor(entries) {
  const pages = [];
  const seen = new Set();
  const listed = (entry) => pages.some((p) => matchFight(p.fights, entry));
  let lookups = 0;
  for (const entry of entries) {
    for (const name of [entry.fighterA, entry.fighterB]) {
      if (listed(entry) || lookups >= BFO_MAX_FIGHTER_LOOKUPS) break;
      lookups += 1;
      for (const path of await bfoFighterEvents(name)) {
        if (seen.has(path)) continue;
        seen.add(path);
        pages.push({ path, fights: parseBfoEvent(await bfoGet(path)) });
      }
    }
  }
  return pages;
}

/**
 * Bind entries to fights across one or more parsed BFO event pages.
 *
 * A page counts only when it lists at least two of the entries (one, for a
 * one-entry card): a fighter's older event that happens to hold an earlier
 * meeting of the same pair lists that one fight and nothing else on the card,
 * so it is never mistaken for the close. Each entry takes its fight from the
 * counted page listing the most entries. The card as a whole needs at least
 * half its entries matched, as before.
 *
 * @param {Array<{path:string, fights:Array}>} pages parsed with parseBfoEvent
 * @returns {{event:(object|null), lines:Map<string,{oddsA,oddsB,source}>, unmatched:string[]}}
 */
export function bindBfoPages(pages, entries) {
  const minListed = Math.min(2, entries.length);
  const counted = pages
    .map((p) => ({ ...p, listed: entries.filter((e) => matchFight(p.fights, e)).length }))
    .filter((p) => p.listed >= minListed)
    .sort((a, b) => b.listed - a.listed);

  const hits = new Map();
  for (const entry of entries) {
    for (const page of counted) {
      const hit = matchFight(page.fights, entry);
      if (hit) { hits.set(entry.id, { ...hit, path: page.path }); break; }
    }
  }
  if (hits.size * 2 < entries.length) return { event: null, lines: new Map(), unmatched: entries.map((e) => e.id) };

  const lines = new Map();
  const unmatched = [];
  for (const entry of entries) {
    const hit = hits.get(entry.id);
    const offers = hit
      ? hit.fight.offers.map((o) => ({
          book: o.book, isPredictionMarket: o.isPredictionMarket,
          oddsA: hit.aIs1 ? o.odds1 : o.odds2, oddsB: hit.aIs1 ? o.odds2 : o.odds1,
        }))
      : [];
    const line = pickClosingLine(offers);
    if (line) lines.set(entry.id, { ...line, source: `${line.source} (bestfightodds)` });
    else unmatched.push(entry.id);
  }
  const used = [...new Set([...hits.values()].map((h) => h.path))];
  return { event: { name: used.join(' + '), provider: 'bestfightodds.com' }, lines, unmatched };
}

async function fetchFromBestFightOdds(eventName, eventDate, entries) {
  return bindBfoPages(await bfoPagesFor(entries), entries);
}

/**
 * Closing lines for the given entries of ONE event: fightodds.io first, then
 * bestfightodds.com when fightodds.io errors or has no matching event.
 * @returns {Promise<{event:(object|null), lines:Map<string,{oddsA,oddsB,source}>, unmatched:string[]}>}
 */
export async function fetchClosingLines(eventName, eventDate, entries) {
  try {
    const r = await fetchFromFightOdds(eventName, eventDate, entries);
    if (r.event) return r;
  } catch (err) {
    console.warn(`closing odds: fightodds.io failed (${err.message}); trying bestfightodds.com`);
  }
  return fetchFromBestFightOdds(eventName, eventDate, entries);
}
