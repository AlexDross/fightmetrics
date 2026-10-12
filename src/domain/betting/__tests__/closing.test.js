import { describe, it, expect, vi, afterEach } from 'vitest';
import { pickClosingLine, buildClosingRecord, closingLineValue } from '../closing.js';
import { fetchClosingLines, parseBfoEvent } from '../../../../scripts/lib/closingOdds.mjs';

describe('pickClosingLine', () => {
  const offers = [
    { book: 'DraftKings', isPredictionMarket: false, oddsA: -245, oddsB: 200 },
    { book: 'Polymarket', isPredictionMarket: true, oddsA: -223, oddsB: 212 },
    { book: 'Circa', isPredictionMarket: false, oddsA: -240, oddsB: 205 },
    { book: 'Pinnacle', isPredictionMarket: false, oddsA: -234, oddsB: 204 },
  ];
  it('prefers Pinnacle, then Circa', () => {
    expect(pickClosingLine(offers)).toEqual({ oddsA: '-234', oddsB: '+204', source: 'Pinnacle' });
    expect(pickClosingLine(offers.filter((o) => o.book !== 'Pinnacle')).source).toBe('Circa');
  });
  it('otherwise takes the per-side median of sportsbooks, never a prediction market', () => {
    const r = pickClosingLine([
      { book: 'A', isPredictionMarket: false, oddsA: -200, oddsB: 170 },
      { book: 'B', isPredictionMarket: false, oddsA: -220, oddsB: 180 },
      { book: 'C', isPredictionMarket: false, oddsA: -240, oddsB: 190 },
      { book: 'Polymarket', isPredictionMarket: true, oddsA: 500, oddsB: -900 },
    ]);
    expect(r).toEqual({ oddsA: '-220', oddsB: '+180', source: 'median of 3 books' });
    expect(pickClosingLine([{ book: 'Kalshi', isPredictionMarket: true, oddsA: -150, oddsB: 130 }])).toBeNull();
  });
});

describe('closing record and CLV', () => {
  it('validates the record', () => {
    expect(() => buildClosingRecord({ oddsA: 'x', oddsB: '+100', source: 'Pinnacle' })).toThrow();
    expect(() => buildClosingRecord({ oddsA: '-110', oddsB: '-110' })).toThrow();
    expect(buildClosingRecord({ oddsA: '-110', oddsB: '-110', source: 'Pinnacle', capturedAt: 't' }))
      .toEqual({ oddsA: '-110', oddsB: '-110', source: 'Pinnacle', capturedAt: 't' });
  });
  it('CLV = no-vig closing probability x saved decimal price - 1', () => {
    const entry = { closing: { oddsA: '-110', oddsB: '-110' } }; // 50/50 close
    expect(closingLineValue(entry, 'A', '+110')).toBeCloseTo(0.5 * 2.1 - 1, 12); // beat the close
    expect(closingLineValue(entry, 'B', '-130')).toBeCloseTo(0.5 * (1 + 100 / 130) - 1, 12); // worse
    expect(closingLineValue({}, 'A', '+110')).toBeNull();
    expect(closingLineValue(entry, null, '+110')).toBeNull();
  });
});

describe('fetchClosingLines (aggregator mocked)', () => {
  afterEach(() => vi.unstubAllGlobals());
  const reply = (data) => ({ ok: true, json: async () => ({ data }) });

  it('binds prices by fighter NAME, not outcome slot, and tolerates accents and name order', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(reply({ allEvents: { edges: [{ node: { pk: 1, name: 'UFC 999: Test', date: '2026-12-01' } }] } }))
      .mockResolvedValueOnce(reply({ eventOfferTable: { fightOffers: { edges: [{ node: {
        // the aggregator lists the fight in the OPPOSITE order to the entry
        fighter1: { firstName: 'Roman', lastName: 'Kopylov' },
        fighter2: { firstName: 'Natália', lastName: 'Silva' },
        isCancelled: false,
        straightOffers: { edges: [{ node: {
          sportsbook: { shortName: 'Pinnacle', isPredictionMarket: false },
          outcome1: { odds: 204, fighter: { firstName: 'Roman', lastName: 'Kopylov' } },
          outcome2: { odds: -234, fighter: { firstName: 'Natália', lastName: 'Silva' } },
        } }] },
      } }, { node: {
        fighter1: { firstName: 'Cong', lastName: 'Wang' }, fighter2: { firstName: 'X', lastName: 'Y' },
        isCancelled: true, straightOffers: { edges: [] },
      } }] } } }));
    vi.stubGlobal('fetch', fetchMock);
    const entries = [
      { id: 'e1', fighterA: 'Natalia Silva', fighterB: 'Roman Kopylov' },
      { id: 'e2', fighterA: 'Wang Cong', fighterB: 'X Y' },
    ];
    const r = await fetchClosingLines('UFC 999: Test', '2026-12-01', entries);
    expect(r.lines.get('e1')).toEqual({ oddsA: '-234', oddsB: '+204', source: 'Pinnacle' });
    expect(r.unmatched).toEqual(['e2']); // cancelled fight: no line
  });

  it('no matching event on either source -> nothing recorded', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => (String(url).includes('bestfightodds')
      ? { ok: true, text: async () => '<html>no fighters</html>' }
      : reply({ allEvents: { edges: [] } }))));
    const r = await fetchClosingLines('UFC 999: Test', '2026-12-01', [{ id: 'e1', fighterA: 'A B', fighterB: 'C D' }]);
    expect(r.event).toBeNull();
    expect(r.unmatched).toEqual(['e1']);
  });
});

// A trimmed bestfightodds.com event page: header row of books, then one
// matchup per fight with each book's last moneyline in data-li cells.
const cellRow = (name, side, mu, prices) => `<tr><th scope="row"><a href="/fighters/x"><span class="t-b-fcc">${name}</span></a></th><td></td>${
  prices.map(([b, o]) => `<td class="but-sg" data-li="[${b},${side},${mu}]"><span id="o${b}${side}">${o}</span></td>`).join('')}<td class="button-cell but-si" data-li="[${side},${mu}]"></td></tr>`;
const BFO_EVENT = `<title>UFC 999 for December 1 | Best Fight Odds</title><table><thead><tr>
<th scope="col" data-b="29"><a href="#">Kalshi</a></th><th scope="col" data-b="21"><a href="#">FanDuel</a></th>
<th scope="col" data-b="24"><a href="#">Caesars</a></th><th scope="col" data-b="26"><span style="color: #606060;">Unibet</span><br>&nbsp;</th>
</tr></thead><tbody>
${cellRow('Brendan Allen', 1, 100, [[29, '-191'], [21, '-116'], [24, '-115'], [26, '-122']])}
${cellRow('Christian Leroy Duncan', 2, 100, [[29, '+152'], [21, '-102'], [24, '-105'], [26, '+100']])}
${cellRow('Alice Pereira', 1, 101, [[21, '-140'], [24, '-135']])}
${cellRow('Darya Zheleznyakova', 2, 101, [[21, '+110'], [24, '+105']])}
</tbody></table>`;

describe('parseBfoEvent', () => {
  it('reads each book\'s moneyline per matchup and flags prediction markets', () => {
    const fights = parseBfoEvent(BFO_EVENT);
    expect(fights).toHaveLength(2);
    expect(fights[0].fighter1).toEqual({ firstName: 'Brendan', lastName: 'Allen' });
    expect(fights[0].fighter2).toEqual({ firstName: 'Christian Leroy', lastName: 'Duncan' });
    expect(fights[0].offers).toContainEqual({ book: 'Kalshi', isPredictionMarket: true, odds1: -191, odds2: 152 });
    expect(fights[0].offers).toContainEqual({ book: 'Unibet', isPredictionMarket: false, odds1: -122, odds2: 100 });
  });
});

describe('fetchClosingLines (fightodds.io refuses -> bestfightodds.com)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('falls back to BFO, uses the sportsbook median, binds by name and by elimination', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const u = String(url);
      if (u.includes('fightodds.io')) return { ok: false, status: 403 };
      const text = u.includes('/search') ? '<a href="/fighters/brendan-allen-1">Brendan Allen</a>'
        : u.includes('/fighters/') ? '<a href="/events/ufc-999-1">UFC 999</a>'
          : BFO_EVENT;
      return { ok: true, text: async () => text };
    }));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const entries = [
      // listed in the opposite order to BFO
      { id: 'e1', fighterA: 'Christian Leroy Duncan', fighterB: 'Brendan Allen' },
      // spelled differently on BFO (Daria/Darya): matched through Pereira
      { id: 'e2', fighterA: 'Alice Pereira', fighterB: 'Daria Zhelezniakova' },
    ];
    const r = await fetchClosingLines('UFC Fight Night: Allen vs. Duncan', '2026-12-01', entries);
    expect(r.event.provider).toBe('bestfightodds.com');
    // Kalshi's in-fight -191/+152 is ignored: median of -116/-115/-122 and -102/-105/+100
    expect(r.lines.get('e1')).toEqual({ oddsA: '-102', oddsB: '-116', source: 'median of 3 books (bestfightodds)' });
    expect(r.lines.get('e2').oddsA).toBe('-137'); // median in probability space
    expect(r.unmatched).toEqual([]);
  });
});
