import { describe, it, expect, vi, afterEach } from 'vitest';
import { pickClosingLine, buildClosingRecord, closingLineValue } from '../closing.js';
import { fetchClosingLines } from '../../../../scripts/lib/closingOdds.mjs';

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

  it('no matching event -> nothing recorded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply({ allEvents: { edges: [] } })));
    const r = await fetchClosingLines('UFC 999: Test', '2026-12-01', [{ id: 'e1', fighterA: 'A B', fighterB: 'C D' }]);
    expect(r.event).toBeNull();
    expect(r.unmatched).toEqual(['e1']);
  });
});
