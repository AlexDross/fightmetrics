"""C6 underdog picks: every fight where C6's pick is the market underdog.
Compared with v2's underdog picks. Flat 1u at the stored price."""
import json
import numpy as np
from backtest import (HISTORY, LIVE, PROD_WM, PROD_WV, as_arrays, fit_zero_intercept,
                      load_rows, logit, settle, sigmoid, summarize)

hist = load_rows(HISTORY)
H = as_arrays(hist)
X = np.column_stack([logit(H['nvA']), logit(H['v2'])])
oofc6 = np.full(len(hist), np.nan)
for Y in range(2020, 2027):
    tr, te = H['year'] < Y, H['year'] == Y
    if tr.sum() >= 200 and te.sum():
        oofc6[te] = sigmoid(X[te] @ fit_zero_intercept(X[tr], H['y'][tr]))
m = ~np.isnan(oofc6)
O = {k: v[m] for k, v in H.items()}

live_rows = load_rows(LIVE, live=True)
Lall = as_arrays([r for r in live_rows if r['mode'] == 'live'])
Lc6 = as_arrays([r for r in live_rows if r['mode'] == 'live' and r['date'] >= '2026-08-22'])

def prod(A):
    return sigmoid(PROD_WM * logit(A['nvA']) + PROD_WV * logit(A['v2']))

sets = {
    'history (out-of-fold C6, 2020-26.03)': (O, oofc6[m]),
    'live, all captured (05-23 to 09-26)': (Lall, prod(Lall)),
    'live, since C6 adopted (08-22 on)': (Lc6, prod(Lc6)),
}
out = {}
for label, (A, p) in sets.items():
    dogA = A['nvA'] < 0.5
    res = {'fights': len(p)}
    for mname, pm in [('C6', p), ('v2', A['v2'])]:
        sideA = pm >= 0.5
        on_dog = sideA == dogA
        st, pr = settle(on_dog, sideA, A)
        r = summarize(st, pr, A)
        if r['n']:
            dec = np.where(sideA, A['decA'], A['decB'])[on_dog]
            r['avgPrice'] = f"+{round(float(np.mean(dec) - 1) * 100)}"
            r['breakEvenWin%'] = round(float(np.mean(1 / dec)), 3)
            r['winRate'] = round(r['wins'] / r['n'], 3)
        res[mname + ' underdog picks'] = r
        # v2 dog picks that C6 did NOT follow
        if mname == 'v2':
            only = on_dog & ~((p >= 0.5) == dogA)
            st, pr = settle(only, sideA, A)
            res['v2 dog picks C6 overrode'] = summarize(st, pr, A)
    out[label] = res
print(json.dumps(out, indent=1))
