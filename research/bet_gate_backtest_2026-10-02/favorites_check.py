"""How different is C6 from the market? Pick agreement, the rule's bets by
favourite/underdog, and whether v2 carries information the market lacks."""
import json
import numpy as np
from backtest import (HISTORY, LIVE, PROD_WM, PROD_WV, as_arrays, ev_policy, fit_zero_intercept,
                      load_rows, logit, settle, sigmoid, summarize)

H = as_arrays(load_rows(HISTORY))
L = as_arrays([r for r in load_rows(LIVE, live=True) if r['mode'] == 'live'])
out = {}
for label, A in [('history', H), ('live', L)]:
    p = sigmoid(PROD_WM * logit(A['nvA']) + PROD_WV * logit(A['v2']))
    mfav = A['nvA'] >= 0.5
    out[label] = {
        'n': len(p),
        'c6_pick_is_market_fav': round(float(np.mean((p >= .5) == mfav)), 3),
        'v2_pick_is_market_fav': round(float(np.mean((A['v2'] >= .5) == mfav)), 3),
        'mean_abs_gap_c6_vs_market_pp': round(float(np.mean(np.abs(p - A['nvA']))) * 100, 2),
        'mean_abs_gap_v2_vs_market_pp': round(float(np.mean(np.abs(A['v2'] - A['nvA']))) * 100, 2),
    }
    # The recommended rule's bets, split by market favourite vs underdog
    b, s = ev_policy(p, A, 0.02, 'pick', 3.0, 1.25)
    st, pr = settle(b, s, A)
    on_fav = s == mfav
    out[label]['rule_bets_on_market_fav'] = summarize(st, pr, A, mask=on_fav, boot=False)
    out[label]['rule_bets_on_market_dog'] = summarize(st, pr, A, mask=~on_fav, boot=False)
    # Does v2 add information beyond the market? Fit y ~ logit(mkt) + logit(v2)
    X = np.column_stack([logit(A['nvA']), logit(A['v2'])])
    w = fit_zero_intercept(X, A['y'])
    q = sigmoid(X @ w)
    cov = np.linalg.inv((X * (q * (1 - q))[:, None]).T @ X)
    out[label]['fit_wMarket'] = round(float(w[0]), 3)
    out[label]['fit_wV2'] = round(float(w[1]), 3)
    out[label]['fit_wV2_se'] = round(float(np.sqrt(cov[1, 1])), 3)
print(json.dumps(out, indent=1))
