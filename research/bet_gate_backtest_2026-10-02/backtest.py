"""Bet-gate backtest (2026-10-02).

Question: what betting rule, applied to the C6 probability, would have made
money -- judged honestly, without choosing the rule on the fights it is scored
on?

Data
  HISTORY  v2_historical_replay_2026-08-17.csv (betting-audit worktree):
           point-in-time v2 probabilities + one odds snapshot per fight,
           2019-06 .. 2026-03. Eligible = prospectSafe, both odds, decisive.
  LIVE     live_holdout.csv (export_live.mjs): graded app entries since
           2026-05-23. captureMode=live rows are the clean holdout.

Method
  1. C6 out-of-fold: for each year Y, fit the zero-intercept C6
     (logit p = wM*logit(noVig) + wV*logit(v2)) on rows dated before Y only.
  2. Policy grid: EV threshold x side rule x price caps x staking.
  3. Walk-forward selection: for each year Y >= 2022, pick the grid policy
     with the most flat-stake units on OOF years < Y, apply it to Y.
     The concatenation is the honest estimate of "tune the gate, then bet".
  4. Live holdout: production's frozen C6 coefficients, candidate policies,
     settled at the stored prices.
  5. Uncertainty: event-date cluster bootstrap (2,000 resamples).

Stdlib + numpy only. Deterministic (seeded).
"""
import csv
import json
import math
import sys
from collections import defaultdict
from itertools import product
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
HISTORY = Path('/Users/alexdrossman/Documents/Playground/fightmetrics-betting-audit-2026-08-17'
               '/research/v2_historical_replay_2026-08-17.csv')
LIVE = HERE / 'live_holdout.csv'
RNG = np.random.default_rng(20261002)

# Production C6 (src/domain/shadow/c6.js) -- used for the live holdout only.
PROD_WM, PROD_WV = 0.9233813979326579, 0.5482535304335658
EPS = 1e-6


def logit(p):
    p = np.clip(p, EPS, 1 - EPS)
    return np.log(p) - np.log1p(-p)


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


def implied(odds):
    o = float(odds)
    return -o / (-o + 100) if o < 0 else 100 / (o + 100)


def decimal(odds):
    o = float(odds)
    return 1 + 100 / -o if o < 0 else 1 + o / 100


def fit_zero_intercept(X, y, iters=50):
    """Logistic regression, no intercept, Newton-Raphson."""
    w = np.zeros(X.shape[1])
    for _ in range(iters):
        p = sigmoid(X @ w)
        g = X.T @ (y - p)
        H = (X * (p * (1 - p))[:, None]).T @ X
        step = np.linalg.solve(H, g)
        w += step
        if np.max(np.abs(step)) < 1e-10:
            break
    return w


# ── Load ────────────────────────────────────────────────────────────────────

def load_rows(path, live=False):
    rows = []
    with open(path) as fh:
        for r in csv.DictReader(fh):
            if live:
                y = 1 if r['actualWinner'] == r['fighterA'] else 0
                date, mode = r['eventDate'], r['captureMode']
            else:
                if r['prospectSafe'] != 'True' or r['hasBothOdds'] != 'True':
                    continue
                if r['outcome'] not in ('Red', 'Blue'):
                    continue
                y = 1 if r['outcome'] == 'Red' else 0
                date, mode = r['date'], 'history'
            iA, iB = implied(r['oddsA']), implied(r['oddsB'])
            rows.append({
                'date': date, 'year': int(date[:4]), 'mode': mode, 'y': y,
                'fA': r['fighterA'], 'fB': r['fighterB'],
                'v2': float(r['v2pA']),
                'nvA': iA / (iA + iB),
                'decA': decimal(r['oddsA']), 'decB': decimal(r['oddsB']),
                'rawA': iA, 'rawB': iB,
            })
    return rows


def as_arrays(rows):
    keys = ['year', 'y', 'v2', 'nvA', 'decA', 'decB', 'rawA', 'rawB']
    a = {k: np.array([r[k] for r in rows], dtype=float) for k in keys}
    a['date'] = np.array([r['date'] for r in rows])
    return a


# ── Policies ────────────────────────────────────────────────────────────────

def current_gate(pA, a):
    """Exact production ladder (marketCore.js evaluateGateOnSnapshot) for the
    wager decision. The low-credibility cap only demotes BET->LEAN, and LEAN is
    still actionable, so it cannot change whether a bet is placed."""
    pickA = pA >= 0.5
    pick = np.where(pickA, pA, 1 - pA)
    edgeA, edgeB = pA - a['nvA'], (1 - pA) - (1 - a['nvA'])
    pickEdge = np.where(pickA, edgeA, edgeB)
    oppEdge = np.where(pickA, edgeB, edgeA)
    has = pickEdge >= 0.03
    conflicting = ~has & (oppEdge >= 0.03)
    action = np.full(len(pA), 0)  # 0 none, 1 lean, 2 bet, 3 strong
    band1 = (pick >= 0.6) & (pick < 0.65)
    band2 = (pick >= 0.65) & (pick < 0.7)
    band3 = pick >= 0.7
    action = np.where(band1 & (pickEdge >= 0.1), 1, action)
    action = np.where(band2 & (pickEdge >= 0.1), 1, action)
    action = np.where(band2 & (pickEdge >= 0.3), 2, action)
    action = np.where(band3, 1, action)
    action = np.where(band3 & (pickEdge >= 0.15), 2, action)
    action = np.where(band3 & (pickEdge >= 0.25), 3, action)
    action = np.where(~has | conflicting, 0, action)
    pickRaw = np.where(pickA, a['rawA'], a['rawB'])
    action = np.where((pickRaw > 2 / 3) & (pickEdge < 0.25) & (action > 0), 0, action)
    bet = action > 0
    sideA = pickA
    return bet, sideA


def ev_policy(pA, a, tau, side, max_dog, min_fav):
    """Bet the side whose EV per unit (p*dec-1) clears tau.
    side='pick': only the side C6 favours.  side='any': either side.
    max_dog: skip prices longer than this decimal (e.g. 3.0 = +200).
    min_fav: skip prices shorter than this decimal (e.g. 1.333 = -300)."""
    evA = pA * a['decA'] - 1
    evB = (1 - pA) * a['decB'] - 1
    if side == 'pick':
        sideA = pA >= 0.5
    else:
        sideA = evA >= evB
    ev = np.where(sideA, evA, evB)
    dec = np.where(sideA, a['decA'], a['decB'])
    bet = (ev >= tau) & (ev > 0) & (dec <= max_dog) & (dec >= min_fav)
    return bet, sideA


def settle(bet, sideA, a, pA=None, kelly=0.0):
    """Returns per-row (stake, profit). Flat 1u, or fractional Kelly as a
    stake in units of a 100u bankroll (non-compounding), capped at 3u."""
    win = np.where(sideA, a['y'] == 1, a['y'] == 0)
    dec = np.where(sideA, a['decA'], a['decB'])
    if kelly and pA is not None:
        p = np.where(sideA, pA, 1 - pA)
        b = dec - 1
        f = np.clip((b * p - (1 - p)) / b, 0, None)
        stake = np.minimum(kelly * f * 100, 3.0)
    else:
        stake = np.ones(len(dec))
    stake = np.where(bet, stake, 0.0)
    profit = np.where(win, stake * (dec - 1), -stake)
    return stake, np.where(bet, profit, 0.0)


def summarize(stake, profit, a, mask=None, boot=True):
    m = stake > 0 if mask is None else (stake > 0) & mask
    n = int(m.sum())
    if n == 0:
        return {'n': 0}
    s, p = stake[m].sum(), profit[m].sum()
    wins = int((profit[m] > 0).sum())
    out = {'n': n, 'wins': wins, 'staked': round(float(s), 2), 'units': round(float(p), 2),
           'roi': round(float(p / s), 4)}
    # max drawdown on the chronological running total
    order = np.argsort(a['date'][m], kind='stable')
    run = np.cumsum(profit[m][order])
    out['maxDD'] = round(float(np.max(np.maximum.accumulate(np.concatenate([[0], run])) -
                                      np.concatenate([[0], run]))), 2)
    if boot and n >= 5:
        dates = a['date'][m]
        uniq = np.unique(dates)
        idx = {d: np.where(dates == d)[0] for d in uniq}
        st, pr = stake[m], profit[m]
        rois = []
        for _ in range(2000):
            pick = RNG.choice(uniq, len(uniq))
            ii = np.concatenate([idx[d] for d in pick])
            rois.append(pr[ii].sum() / st[ii].sum())
        lo, hi = np.percentile(rois, [5, 95])
        out['roi90'] = [round(float(lo), 3), round(float(hi), 3)]
        out['pPositive'] = round(float(np.mean(np.array(rois) > 0)), 3)
    return out


GRID = list(product(
    [0.0, 0.02, 0.04, 0.06, 0.08, 0.10, 0.15],    # EV threshold
    ['pick', 'any'],                               # side rule
    [2.0, 3.0, 5.0, 99.0],                         # longest price: +100 / +200 / +400 / none
    [1.0, 1.25, 1.4],                              # shortest price: none / -400 / -250
))


def name(cfg):
    tau, side, mx, mn = cfg
    dog = {2.0: '<=+100', 3.0: '<=+200', 5.0: '<=+400', 99.0: 'any'}[mx]
    fav = {1.0: 'any', 1.25: '>=-400', 1.4: '>=-250'}[mn]
    return f'EV>={tau:.0%} side={side} dog{dog} fav{fav}'


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    hist = load_rows(HISTORY)
    live_all = load_rows(LIVE, live=True)
    H = as_arrays(hist)
    report = {'counts': {'history': len(hist), 'live_all': len(live_all),
                         'live_captured': sum(r['mode'] == 'live' for r in live_all)}}

    # 1. Out-of-fold C6
    X = np.column_stack([logit(H['nvA']), logit(H['v2'])])
    c6 = np.full(len(hist), np.nan)
    folds = []
    for Y in range(2020, 2027):
        tr, te = H['year'] < Y, H['year'] == Y
        if tr.sum() < 200 or te.sum() == 0:
            continue
        w = fit_zero_intercept(X[tr], H['y'][tr])
        c6[te] = sigmoid(X[te] @ w)
        folds.append({'year': Y, 'fitN': int(tr.sum()), 'scoreN': int(te.sum()),
                      'wMarket': round(float(w[0]), 4), 'wV2': round(float(w[1]), 4)})
    report['folds'] = folds
    oof = ~np.isnan(c6)
    O = {k: v[oof] for k, v in H.items()}
    pO = c6[oof]
    report['oofN'] = int(oof.sum())

    def brier(p):
        return round(float(np.mean((p - O['y']) ** 2)), 5)
    report['brier'] = {'v2': brier(O['v2']), 'market': brier(O['nvA']), 'c6': brier(pO)}
    report['accuracy'] = {
        'v2': round(float(np.mean((O['v2'] >= .5) == (O['y'] == 1))), 4),
        'market': round(float(np.mean((O['nvA'] >= .5) == (O['y'] == 1))), 4),
        'c6': round(float(np.mean((pO >= .5) == (O['y'] == 1))), 4),
    }

    # 2. Reference policies on OOF history
    refs = {}
    b, s = current_gate(pO, O)
    refs['CURRENT gate on C6'] = summarize(*settle(b, s, O), O)
    b, s = current_gate(O['v2'], O)
    refs['CURRENT gate on raw v2'] = summarize(*settle(b, s, O), O)
    refs['Every C6 pick, flat'] = summarize(*settle(np.ones(len(pO), bool), pO >= .5, O), O)
    refs['Every market favourite, flat'] = summarize(*settle(np.ones(len(pO), bool), O['nvA'] >= .5, O), O)
    report['reference_history'] = refs

    # 3. Full grid on OOF history (descriptive -- chosen in-sample)
    grid = []
    for cfg in GRID:
        b, s = ev_policy(pO, O, *cfg)
        r = summarize(*settle(b, s, O), O, boot=False)
        if r['n'] >= 30:
            grid.append({'policy': name(cfg), 'cfg': cfg, **r})
    grid.sort(key=lambda r: -r['units'])
    report['grid_top15_in_sample'] = [{k: v for k, v in g.items() if k != 'cfg'} for g in grid[:15]]
    report['grid_size'] = len(GRID)

    # Marginal views: how each knob alone moves ROI (other knobs at loosest)
    margins = {'tau': [], 'side': [], 'dog': [], 'fav': []}
    for tau in [0.0, 0.02, 0.04, 0.06, 0.08, 0.10, 0.15]:
        for side in ['pick', 'any']:
            b, s = ev_policy(pO, O, tau, side, 99.0, 1.0)
            margins['tau'].append({'tau': tau, 'side': side, **summarize(*settle(b, s, O), O)})
    for mx in [2.0, 3.0, 5.0, 99.0]:
        b, s = ev_policy(pO, O, 0.04, 'any', mx, 1.0)
        margins['dog'].append({'maxDecimal': mx, **summarize(*settle(b, s, O), O)})
    for mn in [1.0, 1.25, 1.4]:
        b, s = ev_policy(pO, O, 0.04, 'any', 99.0, mn)
        margins['fav'].append({'minDecimal': mn, **summarize(*settle(b, s, O), O)})
    report['marginals'] = margins

    # 4. Walk-forward selection (honest)
    wf_stake = np.zeros(len(pO))
    wf_profit = np.zeros(len(pO))
    wf_choices = []
    cache = {cfg: settle(*ev_policy(pO, O, *cfg), O) for cfg in GRID}
    for Y in sorted(set(O['year'].astype(int))):
        prior = O['year'] < Y
        if Y < 2022:
            continue  # need >= 2 OOF years to select on
        best, best_u = None, -1e9
        for cfg, (st, pr) in cache.items():
            if (st[prior] > 0).sum() < 30:
                continue
            u = pr[prior].sum()
            if u > best_u:
                best, best_u = cfg, u
        cur = O['year'] == Y
        st, pr = cache[best]
        wf_stake[cur], wf_profit[cur] = st[cur], pr[cur]
        wf_choices.append({'year': Y, 'chosen': name(best),
                           **summarize(st, pr, O, mask=cur, boot=False)})
    report['walk_forward'] = {'choices': wf_choices,
                              'pooled_2022_2026': summarize(wf_stake, wf_profit, O)}

    # Same-window comparison for the references (2022+)
    win22 = O['year'] >= 2022
    refs22 = {}
    b, s = current_gate(pO, O)
    refs22['CURRENT gate on C6'] = summarize(*settle(b, s, O), O, mask=win22)
    refs22['Every C6 pick, flat'] = summarize(*settle(np.ones(len(pO), bool), pO >= .5, O), O, mask=win22)
    report['reference_2022_2026'] = refs22

    # 5. Candidate policies -- named, then scored on OOF history and on live
    CANDIDATES = {
        'A  EV>=4% either side, price -400..+200, flat': (0.04, 'any', 3.0, 1.25),
        'B  EV>=2% either side, price -400..+200, flat': (0.02, 'any', 3.0, 1.25),
        'C  EV>=4% pick side only, -400..+200, flat': (0.04, 'pick', 3.0, 1.25),
        'D  EV>=6% either side, -400..+200, flat': (0.06, 'any', 3.0, 1.25),
        'E  EV>=4% either side, no price caps, flat': (0.04, 'any', 99.0, 1.0),
    }
    report['candidates_history'] = {}
    for label, cfg in CANDIDATES.items():
        b, s = ev_policy(pO, O, *cfg)
        report['candidates_history'][label] = {
            'flat': summarize(*settle(b, s, O), O),
            'quarterKelly': summarize(*settle(b, s, O, pO, kelly=0.25), O),
            'flat_by_year': {int(Y): summarize(*settle(b, s, O), O, mask=O['year'] == Y, boot=False)
                             for Y in sorted(set(O['year'].astype(int)))},
        }

    # Live holdout with production C6
    for subset in ['live', 'all']:
        rows = [r for r in live_all if subset == 'all' or r['mode'] == 'live']
        L = as_arrays(rows)
        pL = sigmoid(PROD_WM * logit(L['nvA']) + PROD_WV * logit(L['v2']))
        out = {'n': len(rows)}
        b, s = current_gate(pL, L)
        out['CURRENT gate on C6'] = summarize(*settle(b, s, L), L)
        out['Every C6 pick, flat'] = summarize(*settle(np.ones(len(pL), bool), pL >= .5, L), L)
        out['Every market favourite, flat'] = summarize(*settle(np.ones(len(pL), bool), L['nvA'] >= .5, L), L)
        for label, cfg in CANDIDATES.items():
            b, s = ev_policy(pL, L, *cfg)
            out[label] = summarize(*settle(b, s, L), L)
            out[label + ' (quarter Kelly)'] = summarize(*settle(b, s, L, pL, kelly=0.25), L)
        out['brier'] = {
            'v2': round(float(np.mean((L['v2'] - L['y']) ** 2)), 5),
            'market': round(float(np.mean((L['nvA'] - L['y']) ** 2)), 5),
            'c6': round(float(np.mean((pL - L['y']) ** 2)), 5),
        }
        # list the bets candidate A would have made on live-captured rows
        if subset == 'live':
            b, s = ev_policy(pL, L, *CANDIDATES['A  EV>=4% either side, price -400..+200, flat'])
            bets = []
            for i in np.where(b)[0]:
                side = rows[i]['fA'] if s[i] else rows[i]['fB']
                dec = L['decA'][i] if s[i] else L['decB'][i]
                p = pL[i] if s[i] else 1 - pL[i]
                won = (L['y'][i] == 1) == bool(s[i])
                bets.append({'date': rows[i]['date'], 'bet': side,
                             'vs': rows[i]['fB'] if s[i] else rows[i]['fA'],
                             'decimal': round(float(dec), 3), 'c6': round(float(p), 3),
                             'ev': round(float(p * dec - 1), 3), 'won': bool(won)})
            out['candidateA_bets'] = bets
        report['live_' + subset] = out

    json.dump(report, sys.stdout, indent=1, default=str)


if __name__ == '__main__':
    main()
