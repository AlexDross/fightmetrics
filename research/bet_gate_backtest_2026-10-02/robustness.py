"""Robustness of the v3 BET rule (C6 picks the market underdog): sensitivity
to its settings, year-by-year results, and leave-one-event-out stability.
History = out-of-fold C6 (refit per year on prior years only)."""
import json
import numpy as np
from backtest import HISTORY, as_arrays, fit_zero_intercept, load_rows, logit, settle, sigmoid

hist = load_rows(HISTORY)
H = as_arrays(hist)
X = np.column_stack([logit(H['nvA']), logit(H['v2'])])
c6 = np.full(len(hist), np.nan)
for Y in range(2020, 2027):
    tr, te = H['year'] < Y, H['year'] == Y
    if tr.sum() >= 200 and te.sum():
        c6[te] = sigmoid(X[te] @ fit_zero_intercept(X[tr], H['y'][tr]))
m = ~np.isnan(c6)
O = {k: v[m] for k, v in H.items()}
p = c6[m]
sideA = p >= 0.5
dog = sideA == (O['nvA'] < 0.5)
dec = np.where(sideA, O['decA'], O['decB'])
ev = np.where(sideA, p, 1 - p) * dec - 1

def run(mask):
    st, pr = settle(mask, sideA, O)
    n = int((st > 0).sum())
    return {'n': n, 'units': round(float(pr.sum()), 2), 'roi': round(float(pr.sum() / max(st.sum(), 1)), 3)}

out = {'all_dog_picks': run(dog)}
out['share_failing_ev2'] = round(float(np.mean(ev[dog] < 0.02)), 3)
out['share_longer_than_plus200'] = round(float(np.mean(dec[dog] > 3.0)), 3)
out['price_quartiles_american'] = [f"+{round((q - 1) * 100)}" for q in np.percentile(dec[dog], [25, 50, 75])]
sens = []
for evmin in [0.0, 0.02, 0.04]:
    for cap in [2.5, 3.0, 99.0]:
        sens.append({'minEV': evmin, 'maxPrice': {2.5: '+150', 3.0: '+200', 99.0: 'none'}[cap],
                     **run(dog & (ev >= evmin) & (dec <= cap))})
out['sensitivity'] = sens
rule = dog & (ev >= 0.02) & (dec <= 3.0)
out['by_year'] = {int(Y): run(rule & (O['year'] == Y)) for Y in sorted(set(O['year'].astype(int)))}
# leave-one-event-date-out
st, pr = settle(rule, sideA, O)
rois = []
for d in np.unique(O['date'][rule]):
    keep = O['date'] != d
    rois.append(pr[keep].sum() / st[keep].sum())
out['leave_one_event_out_roi_range'] = [round(float(min(rois)), 3), round(float(max(rois)), 3)]
# drop the single best and the three best bets
wins = np.sort(pr[rule])[::-1]
out['roi_without_best_1'] = round(float((pr[rule].sum() - wins[:1].sum()) / (rule.sum() - 1)), 3)
out['roi_without_best_3'] = round(float((pr[rule].sum() - wins[:3].sum()) / (rule.sum() - 3)), 3)
print(json.dumps(out, indent=1))

from backtest import summarize
print(json.dumps({'rule_EV2_full': summarize(*settle(rule, sideA, O), O)}))
