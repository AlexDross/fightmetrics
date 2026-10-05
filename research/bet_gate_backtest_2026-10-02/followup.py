"""Follow-ups to backtest.py: EV-band ROI for the pick-side rule, and the
underdog (non-pick) bets that the 'either side' rule adds."""
import json
import numpy as np
from backtest import (HISTORY, LIVE, PROD_WM, PROD_WV, as_arrays, ev_policy, fit_zero_intercept,
                      load_rows, logit, settle, sigmoid, summarize)

hist = load_rows(HISTORY)
H = as_arrays(hist)
X = np.column_stack([logit(H['nvA']), logit(H['v2'])])
c6 = np.full(len(hist), np.nan)
for Y in range(2020, 2027):
    tr, te = H['year'] < Y, H['year'] == Y
    if tr.sum() >= 200 and te.sum():
        c6[te] = sigmoid(X[te] @ fit_zero_intercept(X[tr], H['y'][tr]))
oof = ~np.isnan(c6)
O = {k: v[oof] for k, v in H.items()}
pO = c6[oof]
L = as_arrays([r for r in load_rows(LIVE, live=True) if r['mode'] == 'live'])
pL = sigmoid(PROD_WM * logit(L['nvA']) + PROD_WV * logit(L['v2']))

out = {}
for label, A, p in [('history', O, pO), ('live', L, pL)]:
    bands = {}
    for lo, hi in [(0.0, 0.04), (0.04, 0.08), (0.08, 0.12), (0.12, 9)]:
        b1, s = ev_policy(p, A, lo, 'pick', 3.0, 1.25)
        b2, _ = ev_policy(p, A, hi, 'pick', 3.0, 1.25)
        st, pr = settle(b1 & ~b2, s, A)
        bands[f'EV {lo:.0%}-{hi:.0%}'] = summarize(st, pr, A, boot=False)
    out[label + '_pick_side_by_EV'] = bands
    # bets the either-side rule adds beyond the pick-side rule (= underdog-of-C6 bets)
    bAny, sAny = ev_policy(p, A, 0.04, 'any', 3.0, 1.25)
    bPick, _ = ev_policy(p, A, 0.04, 'pick', 3.0, 1.25)
    st, pr = settle(bAny & ~bPick, sAny, A)
    out[label + '_added_by_either_side'] = summarize(st, pr, A, boot=False)
    # pick-side bets split by whether C6's pick is also the market favourite
    agree = (p >= 0.5) == (A['nvA'] >= 0.5)
    st, pr = settle(bPick, p >= 0.5, A)
    out[label + '_pick_side_agree_with_market'] = summarize(st, pr, A, mask=agree, boot=False)
    out[label + '_pick_side_disagree_with_market'] = summarize(st, pr, A, mask=~agree, boot=False)
print(json.dumps(out, indent=1))

# Recommended rule (post-hoc interpolation between pre-named candidates C and
# the walk-forward's EV>=0 pick-side choice): EV>=2%, pick side, -400..+200.
rec = {}
for label, A, p in [('history', O, pO), ('live', L, pL)]:
    b, s = ev_policy(p, A, 0.02, 'pick', 3.0, 1.25)
    st, pr = settle(b, s, A)
    r = summarize(st, pr, A)
    r['events'] = int(len(np.unique(A['date'])))
    r['betsPerEvent'] = round(r['n'] / r['events'], 2)
    if label == 'history':
        r['by_year'] = {int(Y): summarize(st, pr, A, mask=A['year'] == Y, boot=False)
                        for Y in sorted(set(A['year'].astype(int)))}
    rec[label] = r
print(json.dumps({'recommended_EV2_pick_side': rec}, indent=1))
