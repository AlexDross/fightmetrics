// ─── DOMAIN / BETTING / GATE V3 ──────────────────────────────────────────────
// The C6 underdog gate (proposal "FightMetrics Bet Logic v3", 2026-10-03).
//
//   BET     C6 picks the market underdog (lower no-vig %), EV >= 2%, price
//           +200 or shorter. Tracked at 1u; real stake defaults to 0.
//   LEAN    C6 picks the market favourite, EV >= 2%, price -400 or longer.
//           Paper only.
//   NO BET  everything else, including invalid input, C6 exactly 50% and a
//           market exactly 50/50.
//
// FROZEN for the validation experiment: do not change a constant here. Any
// change is a new GATE_V3.version whose results are counted separately and
// never pooled with this one. Applies only to C6-driven decisions; the legacy
// ladder in marketCore.js stays for v1/v2 and for reading history.
//
// Research: research/bet_gate_backtest_2026-10-02/ (backtest.py, underdogs.py,
// robustness.py). parity fixture: src/domain/betting/__tests__/fixtures/.

import { buildMarketInput, parseAmericanOdds } from './marketCore.js';
import { computeC6ProbA } from '../shadow/c6.js';

export const GATE_V3 = Object.freeze({
  version: 'c6_dog_v3',
  // Deploy date of this version: the experiment counts only BETs saved from
  // here on (isV3ExperimentEntry). Earlier entries are never regraded.
  frozenOn: '2026-10-05',
  minEV: 0.02, // both tiers
  betMaxDecimal: 3.0, // +200: longest underdog price
  leanMinDecimal: 1.25, // -400: shortest favourite price
  strategyStakeUnits: 1, // standard stake for strategy and paper results
});

// The same rule priced off SPORTSBOOK lines (2026-10-27). Every c6_dog_v3
// entry (UFC Fight Night: Allen vs. Duncan through UFC 333) was priced from a
// prediction market: no vig, so its EV, its BET/LEAN call and its CLV against a
// sportsbook close all read high. Changing the price source changes which
// fights qualify, so it is a new version, counted on its own and never pooled
// with c6_dog_v3, which is closed at the BETs it has. Thresholds are
// identical; the one addition is that a price carrying less vig than any
// sportsbook (a prediction-market price) cannot qualify.
export const GATE_V3_BOOK = Object.freeze({
  version: 'c6_dog_v3_book',
  frozenOn: '2026-10-27',
  minEV: GATE_V3.minEV,
  betMaxDecimal: GATE_V3.betMaxDecimal,
  leanMinDecimal: GATE_V3.leanMinDecimal,
  strategyStakeUnits: GATE_V3.strategyStakeUnits,
  // Two-way overround floor. US books on bestfightodds run 4-6%; Polymarket
  // prices convert to 0% and Kalshi mids to ~1-2%.
  minOverround: 0.025,
});

// The version new C6 saves are stamped with, and every version of this rule.
export const ACTIVE_GATE_V3 = GATE_V3_BOOK;
export const GATE_V3_VERSIONS = Object.freeze([GATE_V3.version, GATE_V3_BOOK.version]);
export const isV3GateVersion = (v) => GATE_V3_VERSIONS.includes(v);
const gateForVersion = (v) => (v === GATE_V3.version ? GATE_V3 : GATE_V3_BOOK);

export const GATE_V3_REASONS = Object.freeze({
  INVALID_INPUT: 'INVALID_INPUT',
  C6_TIE: 'C6_TIE',
  MARKET_PICKEM: 'MARKET_PICKEM',
  EV_BELOW_FLOOR: 'EV_BELOW_FLOOR',
  PRICE_TOO_LONG: 'PRICE_TOO_LONG',
  PRICE_TOO_SHORT: 'PRICE_TOO_SHORT',
  NOT_SPORTSBOOK_PRICE: 'NOT_SPORTSBOOK_PRICE',
});

const isProb = (x) => Number.isFinite(x) && x > 0 && x < 1;
const isDecimal = (x) => Number.isFinite(x) && x > 1;

/**
 * Pure v3 gate. Never throws.
 *
 * @param {{c6pA:number, noVigA:number, decA:number, decB:number}} inputs
 *   C6 probability and proportional no-vig probability of fighter A, and both
 *   decimal prices, all from ONE market snapshot.
 * @param {object} [gate] GATE_V3 (default, the frozen parity rule) or
 *   GATE_V3_BOOK, which also refuses a price below its vig floor.
 * @returns {{tier:('BET'|'LEAN'|'NO BET'), side:('A'|'B'|null),
 *            reason:(string|null), ev:(number|null)}}
 *   ev is the pick side's expected return per unit (p * decimal - 1).
 */
export function gateV3({ c6pA, noVigA, decA, decB } = {}, gate = GATE_V3) {
  const R = GATE_V3_REASONS;
  const out = (tier, side, reason, ev) => ({ tier, side, reason, ev });
  if (!isProb(c6pA) || !isProb(noVigA) || !isDecimal(decA) || !isDecimal(decB)) {
    return out('NO BET', null, R.INVALID_INPUT, null);
  }
  if (gate.minOverround != null && 1 / decA + 1 / decB - 1 < gate.minOverround) {
    return out('NO BET', null, R.NOT_SPORTSBOOK_PRICE, null);
  }
  if (c6pA === 0.5) return out('NO BET', null, R.C6_TIE, null);
  const pickA = c6pA > 0.5;
  const p = pickA ? c6pA : 1 - c6pA;
  const dec = pickA ? decA : decB;
  const pickNoVig = pickA ? noVigA : 1 - noVigA;
  const ev = p * dec - 1;
  const side = pickA ? 'A' : 'B';
  if (pickNoVig === 0.5) return out('NO BET', null, R.MARKET_PICKEM, ev);
  if (ev < gate.minEV) return out('NO BET', null, R.EV_BELOW_FLOOR, ev);
  if (pickNoVig < 0.5) {
    return dec <= gate.betMaxDecimal
      ? out('BET', side, null, ev)
      : out('NO BET', null, R.PRICE_TOO_LONG, ev);
  }
  return dec >= gate.leanMinDecimal
    ? out('LEAN', side, null, ev)
    : out('NO BET', null, R.PRICE_TOO_SHORT, ev);
}

const REASON_TEXT = {
  INVALID_INPUT: 'Odds or C6 probability unavailable',
  C6_TIE: 'C6 has this fight at exactly 50%',
  MARKET_PICKEM: 'Market has this fight at exactly 50/50',
  EV_BELOW_FLOOR: 'Expected return on the C6 pick is under 2%',
  PRICE_TOO_LONG: 'Underdog priced longer than +200',
  PRICE_TOO_SHORT: 'Favourite priced shorter than -400',
  NOT_SPORTSBOOK_PRICE: 'Price has no sportsbook vig (prediction market?) -- enter a sportsbook line',
};

export const describeGateV3Reason = (reason) => REASON_TEXT[reason] ?? null;

/**
 * Overlay the v3 decision onto a legacy gate output (evaluateGateOnSnapshot),
 * keeping its descriptive fields (edges, EV, Kelly, fair lines) and replacing
 * the decision fields. The legacy tier is kept as `legacyBetAction` for audit.
 * Invariant preserved: bestBet !== null => betAction !== 'NO BET'.
 */
export function applyGateV3(market, mkt, c6pA) {
  if (!market) return market;
  const g = gateV3({ c6pA, noVigA: mkt?.noVigA, decA: mkt?.decimalA, decB: mkt?.decimalB }, ACTIVE_GATE_V3);
  return {
    ...market,
    legacyBetAction: market.betAction,
    betAction: g.tier,
    bestBet: g.tier === 'NO BET' ? null : g.side,
    noBetReason: g.tier === 'NO BET' ? describeGateV3Reason(g.reason) : null,
    gateVersion: ACTIVE_GATE_V3.version,
    gateReason: g.reason,
    gateEV: g.ev,
  };
}

/**
 * Fight-day re-check: rerun the WHOLE gate at current odds, recomputing C6
 * from the entry's frozen v2 probability and the new market. Never mutates or
 * recomputes the frozen recommendation itself. Runs the version the entry was
 * saved under.
 *
 * @returns {{checkedAt:string, oddsA:string, oddsB:string, tier:string,
 *            side:(string|null), fighter:(string|null), reason:(string|null),
 *            ev:(number|null), c6pA:(number|null)}}
 */
export function recheckGateV3(entry, { oddsA, oddsB, checkedAt = new Date().toISOString() } = {}) {
  const mkt = buildMarketInput({ oddsA, oddsB });
  const c6 = mkt.valid ? computeC6ProbA({ noVigA: mkt.noVigA, v2pA: entry?.v2pA }) : null;
  const g = gateV3({
    c6pA: c6?.available ? c6.c6pA : NaN,
    noVigA: mkt.noVigA,
    decA: mkt.decimalA,
    decB: mkt.decimalB,
  }, gateForVersion(entry?.gateVersion));
  const fighter = g.side === 'A' ? entry?.fighterA : g.side === 'B' ? entry?.fighterB : null;
  return {
    checkedAt,
    oddsA: oddsA ?? '',
    oddsB: oddsB ?? '',
    tier: g.tier,
    side: g.side,
    fighter,
    reason: g.reason,
    ev: g.ev,
    c6pA: c6?.available ? c6.c6pA : null,
  };
}

export const SKIP_REASONS = Object.freeze(['LINE_MOVED', 'NOT_PLACED', 'OTHER']);

/**
 * Build the execution record stored on an entry: the re-check plus either a
 * placed bet (accepted price + real stake) or a skip with its reason. Throws
 * on a malformed record so a bad value is never persisted.
 */
export function buildExecution(recheck, { placed, acceptedOdds, stakeUnits, skipReason } = {}) {
  if (!recheck || !recheck.checkedAt) throw new TypeError('buildExecution: recheck required');
  if (placed) {
    const stake = Number(stakeUnits);
    if (!Number.isFinite(stake) || stake <= 0) throw new TypeError('buildExecution: stake must be > 0');
    if (parseAmericanOdds(String(acceptedOdds ?? '')) == null) {
      throw new TypeError('buildExecution: accepted odds must be valid American odds');
    }
    return { ...recheck, status: 'placed', acceptedOdds: String(acceptedOdds), stakeUnits: stake };
  }
  if (!SKIP_REASONS.includes(skipReason)) {
    throw new TypeError(`buildExecution: skipReason must be one of ${SKIP_REASONS.join(', ')}`);
  }
  return { ...recheck, status: 'skipped', skipReason };
}

/**
 * Is this entry counted in a v3 experiment? Live captures stamped with
 * `version` only (default: the original c6_dog_v3). Versions are never pooled.
 */
export const isV3ExperimentEntry = (entry, version = GATE_V3.version) =>
  entry?.gateVersion === version && entry?._provenance?.captureMode === 'live';
