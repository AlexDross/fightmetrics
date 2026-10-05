import { readFileSync } from 'node:fs';
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  GATE_V3,
  gateV3,
  applyGateV3,
  recheckGateV3,
  buildExecution,
  isV3ExperimentEntry,
} from '../gateV3.js';
import { buildMarketInput, evaluateGateOnSnapshot } from '../marketCore.js';
import { computeC6ProbA } from '../../shadow/c6.js';
import { loadFixture, frozenRoiEntry } from '../../../__tests__/goldenSupport.js';

const nv = (a, b) => (1 / a) / (1 / a + 1 / b);
const swap = ({ c6pA, noVigA, decA, decB }) => ({ c6pA: 1 - c6pA, noVigA: 1 - noVigA, decA: decB, decB: decA });

const CASES = {
  invalidC6: { c6pA: NaN, noVigA: 0.6, decA: 1.6, decB: 2.4 },
  c6Tie: { c6pA: 0.5, noVigA: nv(2.06, 1.9), decA: 2.06, decB: 1.9 },
  marketPickem: { c6pA: 0.6, noVigA: 0.5, decA: 1.95, decB: 1.95 },
  minusOddsDog: { c6pA: 0.53, noVigA: nv(1.99, 1.87), decA: 1.99, decB: 1.87 },
  dogAtPlus200: { c6pA: 0.4, noVigA: nv(1.5, 3.0), decA: 1.5, decB: 3.0 },
  dogAtPlus201: { c6pA: 0.4, noVigA: nv(1.5, 3.01), decA: 1.5, decB: 3.01 },
  favAtMinus400: { c6pA: 0.85, noVigA: nv(1.25, 4.5), decA: 1.25, decB: 4.5 },
  favAtMinus401: { c6pA: 0.85, noVigA: nv(1.2494, 4.5), decA: 1.2494, decB: 4.5 },
  lowEV: { c6pA: 0.52, noVigA: nv(1.95, 1.9), decA: 1.95, decB: 1.9 },
};

describe('gateV3', () => {
  it('rejects invalid input instead of betting it', () => {
    expect(gateV3(CASES.invalidC6)).toMatchObject({ tier: 'NO BET', reason: 'INVALID_INPUT', side: null });
    expect(gateV3({ c6pA: 0.6, noVigA: 0.4, decA: 1, decB: 2 }).reason).toBe('INVALID_INPUT');
    expect(gateV3({ c6pA: 1, noVigA: 0.4, decA: 2.5, decB: 1.6 }).reason).toBe('INVALID_INPUT');
    expect(gateV3().reason).toBe('INVALID_INPUT');
  });

  it('a C6 tie or an exact market pick-em is NO BET in either fighter order', () => {
    for (const c of [CASES.c6Tie, CASES.marketPickem]) {
      expect(gateV3(c).tier).toBe('NO BET');
      expect(gateV3(swap(c)).tier).toBe('NO BET');
    }
    expect(gateV3(CASES.c6Tie).reason).toBe('C6_TIE');
    expect(gateV3(CASES.marketPickem).reason).toBe('MARKET_PICKEM');
  });

  it('underdog means the lower no-vig %, so a minus-odds underdog can be a BET', () => {
    expect(gateV3(CASES.minusOddsDog)).toMatchObject({ tier: 'BET', side: 'A' });
  });

  it('price window edges', () => {
    expect(gateV3(CASES.dogAtPlus200).tier).toBe('BET');
    expect(gateV3(CASES.dogAtPlus201)).toMatchObject({ tier: 'NO BET', reason: 'PRICE_TOO_LONG' });
    expect(gateV3(CASES.favAtMinus400).tier).toBe('LEAN');
    expect(gateV3(CASES.favAtMinus401)).toMatchObject({ tier: 'NO BET', reason: 'PRICE_TOO_SHORT' });
  });

  it('EV floor is inclusive at 2%', () => {
    expect(gateV3({ c6pA: 0.49, noVigA: 0.52, decA: 1.85, decB: 2.0 })).toMatchObject({ tier: 'BET', side: 'B' });
    expect(gateV3(CASES.lowEV)).toMatchObject({ tier: 'NO BET', reason: 'EV_BELOW_FLOOR' });
  });

  it('swapping fighter A and B never changes the tier, and flips the side', () => {
    for (const [name, c] of Object.entries(CASES)) {
      const a = gateV3(c);
      const b = gateV3(swap(c));
      expect(b.tier, name).toBe(a.tier);
      if (a.side) expect(b.side, name).toBe(a.side === 'A' ? 'B' : 'A');
    }
  });

  it('constants are frozen', () => {
    expect(Object.isFrozen(GATE_V3)).toBe(true);
    expect(GATE_V3).toMatchObject({ version: 'c6_dog_v3', minEV: 0.02, betMaxDecimal: 3, leanMinDecimal: 1.25 });
  });
});

describe('gateV3 parity with the research rule', () => {
  // Written by research/bet_gate_backtest_2026-10-02/make_parity_fixture.py from an
  // independent Python version of the rule, over every eligible historical and
  // live fight. The app and the research must agree on every row.
  const rows = readFileSync(new URL('./fixtures/gateV3_parity.csv', import.meta.url), 'utf8')
    .trim().split('\n').slice(1).map((l) => l.split(','));

  it('matches tier for tier', () => {
    expect(rows.length).toBeGreaterThan(2500);
    const mismatches = rows.filter(([, c6pA, noVigA, decA, decB, tier]) =>
      gateV3({ c6pA: +c6pA, noVigA: +noVigA, decA: +decA, decB: +decB }).tier !== tier);
    expect(mismatches).toEqual([]);
  });
});

describe('applyGateV3', () => {
  const result = (pA) => ({
    pA,
    pB: 1 - pA,
    edges: Object.fromEntries(['striking', 'grappling', 'physical', 'form', 'experience', 'analytics']
      .map((k) => [k, { clamped: 0 }])),
  });
  const f = (name) => ({ FIGHTER: name, CREDIBILITY: 80 });

  it('replaces the decision fields, keeps the descriptive ones, and keeps the bestBet invariant', () => {
    const mkt = buildMarketInput({ oddsA: '+110', oddsB: '-130' });
    const c6 = computeC6ProbA({ noVigA: mkt.noVigA, v2pA: 0.62 });
    const legacy = evaluateGateOnSnapshot(result(c6.c6pA), mkt, f('A'), f('B'));
    const v3 = applyGateV3(legacy, mkt, c6.c6pA);
    expect(v3.gateVersion).toBe('c6_dog_v3');
    expect(v3.legacyBetAction).toBe(legacy.betAction);
    expect(v3.edgeA).toBe(legacy.edgeA);
    expect(v3.betAction).toBe(gateV3({ c6pA: c6.c6pA, noVigA: mkt.noVigA, decA: mkt.decimalA, decB: mkt.decimalB }).tier);
    expect(v3.bestBet === null).toBe(v3.betAction === 'NO BET');
  });
});

describe('fight-day re-check and execution record', () => {
  const entry = { fighterA: 'Alpha', fighterB: 'Bravo', v2pA: 0.62 };

  it('reruns the whole gate at new odds, recomputing C6 from the frozen v2', () => {
    const r = recheckGateV3(entry, { oddsA: '+110', oddsB: '-130', checkedAt: '2026-10-10T20:00:00.000Z' });
    const mkt = buildMarketInput({ oddsA: '+110', oddsB: '-130' });
    const c6 = computeC6ProbA({ noVigA: mkt.noVigA, v2pA: 0.62 }).c6pA;
    expect(r.c6pA).toBe(c6);
    expect(r.tier).toBe(gateV3({ c6pA: c6, noVigA: mkt.noVigA, decA: mkt.decimalA, decB: mkt.decimalB }).tier);
    expect(r.checkedAt).toBe('2026-10-10T20:00:00.000Z');
    if (r.side) expect(r.fighter).toBe(r.side === 'A' ? 'Alpha' : 'Bravo');
  });

  it('invalid fight-day odds give NO BET, never a bet', () => {
    expect(recheckGateV3(entry, { oddsA: '', oddsB: '-130' })).toMatchObject({ tier: 'NO BET', reason: 'INVALID_INPUT' });
  });

  it('builds placed and skipped records, and refuses malformed ones', () => {
    const r = recheckGateV3(entry, { oddsA: '+110', oddsB: '-130' });
    expect(buildExecution(r, { placed: true, acceptedOdds: '+105', stakeUnits: 2 }))
      .toMatchObject({ status: 'placed', acceptedOdds: '+105', stakeUnits: 2 });
    expect(buildExecution(r, { placed: false, skipReason: 'LINE_MOVED' }))
      .toMatchObject({ status: 'skipped', skipReason: 'LINE_MOVED' });
    expect(() => buildExecution(r, { placed: true, acceptedOdds: '+105', stakeUnits: 0 })).toThrow();
    expect(() => buildExecution(r, { placed: true, acceptedOdds: 'abc', stakeUnits: 1 })).toThrow();
    expect(() => buildExecution(r, { placed: false, skipReason: 'BORED' })).toThrow();
  });
});

describe('buildRoiEntry with C6 user-facing (v3 save path)', () => {
  afterEach(() => vi.unstubAllEnvs());
  const { fighterFixtures } = loadFixture('fighters.golden.json');
  const names = Object.keys(fighterFixtures);
  const ARGS = {
    fA: fighterFixtures[names[0]],
    fB: fighterFixtures[names[1]],
    oddsA: '-150',
    oddsB: '+130',
    eventName: 'V3 TEST EVENT',
    eventDate: '2099-01-01',
    modelToggle: 'v2',
    unitsWagered: 3,
  };

  it('stamps the v3 gate, tracks at 1u, and agrees with gateV3 on the frozen numbers', () => {
    vi.stubEnv('VITE_C6_USER_FACING_ENABLED', 'true');
    const e = frozenRoiEntry(ARGS);
    expect(e.decisionProbabilitySource).toBe('c6');
    expect(e.gateVersion).toBe('c6_dog_v3');
    expect(e._provenance.gateVersion).toBe('c6_dog_v3');
    expect(e._provenance.frozenTier).toBe(e.betAction);
    expect(e.unitsWagered).toBe(1);
    const mkt = buildMarketInput({ oddsA: e.oddsA, oddsB: e.oddsB });
    const g = gateV3({ c6pA: e.c6ProbA, noVigA: mkt.noVigA, decA: mkt.decimalA, decB: mkt.decimalB });
    expect(e.betAction).toBe(g.tier);
    expect(e.gateReason).toBe(g.reason);
    expect(e.gateEV).toBe(g.ev);
    expect(isV3ExperimentEntry(e)).toBe(true);
  });

  it('flag off: legacy ladder, no gate stamp, caller stake kept', () => {
    const e = frozenRoiEntry(ARGS);
    expect(e.decisionProbabilitySource).toBe('v2');
    expect(e).not.toHaveProperty('gateVersion');
    expect(e._provenance).not.toHaveProperty('gateVersion');
    expect(e.unitsWagered).toBe(3);
    expect(isV3ExperimentEntry(e)).toBe(false);
  });
});
