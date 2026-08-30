import { describe, it, expect } from 'vitest';
import * as stats from '../index.js';
import * as betting from '../../betting/index.js';

// ─── C6 vs raw-v2 scoring basis — official performance regression ────────────
//
// Before the fix, computeV2Summary / computeV2FrozenRows graded the raw-v2
// argmax(v2pA, v2pB) for every entry, even when C6 actually drove the saved
// decision. That silently marked C6-driven entries as raw-v2 misses in the
// headline while their ROI cards (which read the frozen C6 decision) showed
// them Correct. These tests pin the CORRECTED behavior: official accuracy/ROI
// grade the frozen C6 tracked decision when C6 drove the entry, and preserve
// raw-v2 grading for ordinary v2 / pre-C6 entries.
//
// The seven fixtures reproduce UFC Fight Night Shanghai (2026-08-29): all seven
// were C6-driven; six user-facing C6 decisions were correct, one missed. Exactly
// one fight (Aoriqileng vs Kai Asakura) has C6 and raw v2 disagreeing — C6 picks
// Kai (the winner), raw v2 picks Aoriqileng (the loser).

const c6Fight = (over = {}) => ({
  eventName: 'UFC Fight Night Shanghai',
  eventDate: '2026-08-29',
  decisionProbabilitySource: 'c6',
  c6Version: 'c6_sym_zerointercept_full_20260818',
  betAction: 'LEAN',
  unitsWagered: 1,
  _provenance: { captureMode: 'live' },
  confirmedByUser: true,
  ...over,
});

// trackedSide = the frozen C6 decision; v2pA/v2pB = internal raw-v2 benchmark.
const SHANGHAI = [
  // 1. C6 MISS: C6 (and v2) picked Umar; Song won.
  c6Fight({
    id: 'sh-1', fighterA: 'Umar Nurmagomedov', fighterB: 'Song Yadong',
    trackedSide: 'Umar Nurmagomedov', trackedProb: 0.8159816672249216,
    v2pA: 0.5985323711213446, v2pB: 0.4014676288786554,
    oddsA: '-500', oddsB: '+375', marketOdds: '-500',
    actualWinner: 'Song Yadong',
  }),
  // 2. correct (C6 == v2 == winner)
  c6Fight({
    id: 'sh-2', fighterA: 'Yan Xiaonan', fighterB: 'Denise Gomes',
    trackedSide: 'Denise Gomes', trackedProb: 0.5447466102405099,
    v2pA: 0.2907640365464278, v2pB: 0.7092359634535722,
    oddsA: '-155', oddsB: '+130', marketOdds: '+130',
    actualWinner: 'Denise Gomes',
  }),
  // 3. THE DIVERGENCE: C6 picks B (Kai), raw v2 picks A (Aoriqileng), B wins.
  c6Fight({
    id: 'sh-3', fighterA: 'Aoriqileng', fighterB: 'Kai Asakura',
    trackedSide: 'Kai Asakura', trackedProb: 0.7432072258238467,
    v2pA: 0.5638694679787072, v2pB: 0.4361305320212928,
    oddsA: '+350', oddsB: '-450', marketOdds: '-450',
    actualWinner: 'Kai Asakura',
  }),
  // 4. correct
  c6Fight({
    id: 'sh-4', fighterA: 'Alex Perez', fighterB: 'Sumudaerji',
    trackedSide: 'Sumudaerji', trackedProb: 0.6668584138620296,
    v2pA: 0.4697201430517902, v2pB: 0.5302798569482098,
    oddsA: '+185', oddsB: '-225', marketOdds: '-225',
    actualWinner: 'Sumudaerji',
  }),
  // 5. correct
  c6Fight({
    id: 'sh-5', fighterA: 'Rei Tsuruya', fighterB: 'Kevin Borjas',
    trackedSide: 'Rei Tsuruya', trackedProb: 0.8718953491221186,
    v2pA: 0.7081682453900219, v2pB: 0.2918317546099781,
    oddsA: '-600', oddsB: '+450', marketOdds: '-600',
    actualWinner: 'Rei Tsuruya',
  }),
  // 6. correct
  c6Fight({
    id: 'sh-6', fighterA: 'Jack Jenkins', fighterB: 'Sean Woodson',
    trackedSide: 'Sean Woodson', trackedProb: 0.5704954806631263,
    v2pA: 0.4816944588087376, v2pB: 0.5183055411912624,
    oddsA: '+120', oddsB: '-145', marketOdds: '-145',
    actualWinner: 'Sean Woodson',
  }),
  // 7. correct
  c6Fight({
    id: 'sh-7', fighterA: 'Xiong Jingnan', fighterB: 'Julia Polastri',
    trackedSide: 'Julia Polastri', trackedProb: 0.7049863454313774,
    v2pA: 0.4125116944881412, v2pB: 0.5874883055118588,
    oddsA: '+195', oddsB: '-240', marketOdds: '-240',
    actualWinner: 'Julia Polastri',
  }),
];

describe('C6 official accuracy — seven decisive fights, six correct C6 decisions', () => {
  it('grades the frozen C6 decision: 6/7 = 85.714%, correct 6, graded 7', () => {
    const s = stats.computeV2Summary(SHANGHAI);
    expect(s.graded).toBe(7);
    expect(s.correct).toBe(6);
    expect(s.accuracy).toBeCloseTo(85.714, 2);
  });

  it('is NOT the old raw-v2 result (5/7 = 71.4%)', () => {
    const s = stats.computeV2Summary(SHANGHAI);
    expect(s.correct).not.toBe(5);
    expect(Math.round(s.accuracy * 10) / 10).not.toBe(71.4);
  });
});

describe('C6 official ROI — Shanghai event', () => {
  it('profit ≈ +2.24u and ROI ≈ +32.0% on 7u staked', () => {
    const s = stats.computeV2Summary(SHANGHAI);
    expect(s.bets).toBe(7);
    expect(s.profit).toBeCloseTo(2.24, 2);
    expect(s.roi).toBeCloseTo(32.0, 1);
  });

  it('is NOT the old raw-v2 result (+1.02u / +14.5%)', () => {
    const s = stats.computeV2Summary(SHANGHAI);
    expect(s.profit).not.toBeCloseTo(1.02, 1);
    expect(s.roi).not.toBeCloseTo(14.5, 1);
  });
});

describe('card / summary reconciliation', () => {
  it('per-fight frozen-row won-count equals the summary numerator', () => {
    const rows = stats.computeV2FrozenRows(SHANGHAI);
    const s = stats.computeV2Summary(SHANGHAI);
    expect(rows.filter((r) => r.won).length).toBe(s.correct);
  });

  it('sum of per-entry frozen-row profits equals the headline/event profit', () => {
    const rows = stats.computeV2FrozenRows(SHANGHAI);
    const s = stats.computeV2Summary(SHANGHAI);
    const summed = rows.reduce((acc, r) => acc + r.profit, 0);
    expect(summed).toBeCloseTo(s.profit, 10);
  });

  it('every frozen row for a C6 entry is scored on the C6 side', () => {
    const rows = stats.computeV2FrozenRows(SHANGHAI);
    const divergent = rows.find((r) => r.entry.id === 'sh-3');
    expect(divergent.v2pick).toBe('Kai Asakura'); // C6's side, not raw v2's Aoriqileng
    expect(divergent.source).toBe('c6');
  });
});

// gradeFrozenDecision is what the Home "Recent Results" card reads (getOutcome +
// frozenDecisionCard). The ROI fight card consumes resolveFrozenPerformanceView
// directly -- the SAME underlying resolver gradeFrozenDecision wraps -- so both
// surfaces select the same decision. This asserts that shared basis plus the
// headline reconciliation; it is a genuine consistency check, not a
// re-implementation.
describe('Home / ROI card consistency on the C6 vs raw-v2 disagreement', () => {
  const aoriqileng = SHANGHAI.find((e) => e.id === 'sh-3');

  it('the shared grade shows Kai Asakura + Correct (Home reads this; ROI reads the same resolver)', () => {
    const g = stats.gradeFrozenDecision(aoriqileng);
    // The ROI card reads resolveFrozenPerformanceView(entry) directly; assert it
    // selects the identical decision the Home helper does.
    const view = betting.resolveFrozenPerformanceView(aoriqileng);
    expect(view.pickedFighter).toBe(g.pickedFighter);
    expect(view.odds).toBe(g.odds);
    expect(g.source).toBe('c6');
    expect(g.gradeable).toBe(true);
    expect(g.pickedFighter).toBe('Kai Asakura'); // Home shows this; ROI shows the same
    expect(g.pickedFighter).not.toBe('Aoriqileng'); // never the raw-v2 pick
    expect(g.outcome).toBe('correct'); // Home + ROI badge
    expect(g.correct).toBe(true);
  });

  it('the shared grade prices the C6 profit at the captured marketOdds (-450 -> +0.222u)', () => {
    const g = stats.gradeFrozenDecision(aoriqileng);
    expect(g.odds).toBe('-450');
    expect(g.profit).toBeCloseTo(100 / 450, 6);
  });

  it('headline stays 6/7 = 85.7% and equals the sum of per-card grades', () => {
    const s = stats.computeV2Summary(SHANGHAI);
    expect(s.correct).toBe(6);
    expect(s.graded).toBe(7);
    expect(s.accuracy).toBeCloseTo(85.714, 2);
    // Card profit sum (per-entry gradeFrozenDecision) == headline profit.
    const cardSum = SHANGHAI.reduce(
      (acc, e) => acc + (stats.gradeFrozenDecision(e).profit ?? 0),
      0
    );
    expect(cardSum).toBeCloseTo(s.profit, 10);
    // Correct-badge count implied by the per-card grade == headline numerator.
    const cardCorrect = SHANGHAI.filter(
      (e) => stats.gradeFrozenDecision(e).outcome === 'correct'
    ).length;
    expect(cardCorrect).toBe(s.correct);
  });

  it('an ordinary non-C6 copy of the same fight grades Aoriqileng (raw v2), Incorrect', () => {
    const asV2 = { ...aoriqileng, decisionProbabilitySource: 'v2' };
    const g = stats.gradeFrozenDecision(asV2);
    expect(g.source).toBe('v2');
    expect(g.pickedFighter).toBe('Aoriqileng'); // raw-v2 argmax
    expect(g.outcome).toBe('incorrect');
  });
});

// gradeFrozenDecision is Home's grade; the ROI card reads the same underlying
// resolveFrozenPerformanceView. These pin the per-entry policies both rely on.
describe('gradeFrozenDecision edge policies', () => {
  const base = SHANGHAI.find((e) => e.id === 'sh-3');

  it('malformed C6 is not gradeable and never grades or exposes the raw-v2 fallback', () => {
    // base carries v2pA/v2pB (raw-v2 argmax = Aoriqileng); assert none of it leaks.
    const g = stats.gradeFrozenDecision({ ...base, trackedSide: null, trackedProb: null });
    expect(g.malformed).toBe(true);
    expect(g.gradeable).toBe(false);
    expect(g.pickedFighter).toBeNull(); // NOT Aoriqileng
    expect(g.probability).toBeNull(); // no raw-v2 probability
    expect(g.odds).toBeNull(); // no raw-v2 odds
    expect(g.outcome).toBe('pending'); // ungraded, not a false Miss
    expect(g.profit).toBeNull(); // excluded from ROI
  });

  it('an ordinary non-C6 entry keeps its raw-v2 fallback (unchanged)', () => {
    const asV2 = { ...base, decisionProbabilitySource: 'v2' };
    const g = stats.gradeFrozenDecision(asV2);
    expect(g.gradeable).toBe(true);
    expect(g.source).toBe('v2');
    expect(g.pickedFighter).toBe('Aoriqileng'); // raw-v2 argmax preserved
    expect(g.outcome).toBe('incorrect');
  });

  it('push is push with zero profit', () => {
    const g = stats.gradeFrozenDecision({ ...base, actualWinner: 'NC' });
    expect(g.outcome).toBe('push');
    expect(g.profit).toBe(0);
    expect(g.correct).toBe(false);
  });

  it('pending (ungraded) entry stays pending with null profit', () => {
    const g = stats.gradeFrozenDecision({ ...base, actualWinner: '' });
    expect(g.outcome).toBe('pending');
    expect(g.profit).toBeNull();
  });

  it('C6 profit follows the captured marketOdds under odds drift (card == headline)', () => {
    // marketOdds deliberately differs from the tracked side's oddsB, so the
    // card and headline both price on marketOdds and cannot drift apart.
    const drift = { ...base, oddsB: '-450', marketOdds: '-410' };
    const g = stats.gradeFrozenDecision(drift);
    expect(g.odds).toBe('-410');
    expect(g.profit).toBeCloseTo(100 / 410, 6);
    // computeV2FrozenRows (headline basis) prices the same entry identically.
    const row = stats.computeV2FrozenRows([drift])[0];
    expect(row.profit).toBeCloseTo(g.profit, 10);
  });
});

describe('ordinary v2 and legacy entries preserve raw-v2 grading', () => {
  // Flip the SAME seven fights to a non-C6 basis: now raw-v2 argmax is graded,
  // reproducing the old 5/7 = 71.4% and +1.02u / +14.5% result exactly.
  const asV2 = SHANGHAI.map((e) => ({ ...e, decisionProbabilitySource: 'v2' }));

  it('non-C6 entries grade raw-v2 argmax: 5/7 = 71.4%, +1.02u, +14.5%', () => {
    const s = stats.computeV2Summary(asV2);
    expect(s.graded).toBe(7);
    expect(s.correct).toBe(5);
    expect(s.accuracy).toBeCloseTo(71.43, 1);
    expect(s.profit).toBeCloseTo(1.02, 1);
    expect(s.roi).toBeCloseTo(14.5, 1);
  });

  it('a legacy entry with no decisionProbabilitySource grades raw v2', () => {
    const legacy = SHANGHAI.map((e) => {
      const { decisionProbabilitySource, ...rest } = e;
      return rest;
    });
    const s = stats.computeV2Summary(legacy);
    expect(s.correct).toBe(5); // raw-v2 argmax
  });
});

describe('push / no-contest handling', () => {
  const withNc = [
    ...SHANGHAI,
    c6Fight({
      id: 'sh-nc', fighterA: 'Alex Perez', fighterB: 'Sumudaerji',
      eventName: 'UFC Vegas X', eventDate: '2026-05-23',
      trackedSide: 'Sumudaerji', trackedProb: 0.60,
      v2pA: 0.48, v2pB: 0.52, oddsA: '+185', oddsB: '-225', marketOdds: '-225',
      actualWinner: 'NC',
    }),
  ];

  it('a no contest is excluded from the decisive accuracy numerator and denominator', () => {
    const base = stats.computeV2Summary(SHANGHAI);
    const s = stats.computeV2Summary(withNc);
    expect(s.graded).toBe(base.graded); // NC does not add to decisive graded
    expect(s.correct).toBe(base.correct);
  });

  it('a no contest contributes zero profit (no row) and never a win/loss', () => {
    const base = stats.computeV2Summary(SHANGHAI);
    const s = stats.computeV2Summary(withNc);
    expect(s.profit).toBeCloseTo(base.profit, 10);
    expect(s.bets).toBe(base.bets);
  });
});

describe('malformed C6 record is dropped, never regraded on raw v2', () => {
  it('a c6-labelled entry with a broken tracked decision is excluded from accuracy', () => {
    const malformed = c6Fight({
      id: 'sh-bad', fighterA: 'Aoriqileng', fighterB: 'Kai Asakura',
      trackedSide: null, trackedProb: null, // broken frozen decision
      v2pA: 0.56, v2pB: 0.44, oddsA: '+350', oddsB: '-450', marketOdds: '-450',
      actualWinner: 'Kai Asakura',
    });
    const base = stats.computeV2Summary(SHANGHAI);
    const s = stats.computeV2Summary([...SHANGHAI, malformed]);
    // Excluded entirely — NOT silently graded on raw v2 (which would pick
    // Aoriqileng and mark a miss, inflating the denominator).
    expect(s.graded).toBe(base.graded);
    expect(s.correct).toBe(base.correct);
  });
});

describe('112-vs-111: "Graded Picks" (resolved records) vs accuracy "decisive fights"', () => {
  // The observed 112 Graded Picks / 111 accuracy-denominator gap is a real
  // no contest (Alex Perez vs Sumudaerji, 2026-05-23): a resolved record that
  // must NOT enter decisive accuracy. computeROISummary counts resolved records
  // (the "Graded Picks" card); computeV2Summary counts decisive gradeable
  // fights (the accuracy denominator). They legitimately differ by the push.
  const nc = c6Fight({
    id: 'nc-perez', fighterA: 'Alex Perez', fighterB: 'Sumudaerji',
    eventName: 'UFC Vegas X', eventDate: '2026-05-23',
    trackedSide: 'Sumudaerji', trackedProb: 0.60,
    v2pA: 0.48, v2pB: 0.52, oddsA: '+185', oddsB: '-225', marketOdds: '-225',
    predictedWinner: 'Sumudaerji',
    actualWinner: 'NC',
  });
  const withNc = [...SHANGHAI, nc];

  it('the no contest is a Graded Pick but not a decisive accuracy fight', () => {
    const roi = stats.computeROISummary(withNc, new Set());
    const acc = stats.computeV2Summary(withNc);
    // Graded Picks (resolved records) is exactly one higher than the decisive
    // accuracy denominator — the difference is the no contest, not an error.
    expect(roi.graded).toBe(acc.graded + 1);
    expect(roi.graded).toBe(8); // 7 decisive + 1 NC
    expect(acc.graded).toBe(7); // decisive fights only
  });

  it('the no contest never inflates accuracy as a win or a loss', () => {
    const accWith = stats.computeV2Summary(withNc);
    const accWithout = stats.computeV2Summary(SHANGHAI);
    expect(accWith.correct).toBe(accWithout.correct);
    expect(accWith.accuracy).toBeCloseTo(accWithout.accuracy, 10);
  });
});

describe('accuracy is an unweighted count ratio (not stake-weighted)', () => {
  it('changing unitsWagered does not change Pick Accuracy, but does change ROI/profit', () => {
    const flat = stats.computeV2Summary(SHANGHAI);
    // Triple the stake on the single largest-priced correct pick.
    const restaked = SHANGHAI.map((e) =>
      e.id === 'sh-2' ? { ...e, unitsWagered: 5 } : e
    );
    const s = stats.computeV2Summary(restaked);
    expect(s.accuracy).toBeCloseTo(flat.accuracy, 10); // unchanged
    expect(s.correct).toBe(flat.correct);
    expect(s.graded).toBe(flat.graded);
    expect(s.profit).not.toBeCloseTo(flat.profit, 2); // profit changed
    expect(s.roi).not.toBeCloseTo(flat.roi, 2); // ROI changed
  });
});
