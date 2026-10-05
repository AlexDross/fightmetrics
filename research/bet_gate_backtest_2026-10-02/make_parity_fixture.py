"""Writes the gate-v3 parity fixture: every eligible historical fight with the
production C6 probability and the tier from THIS independent Python version of
the v3 rule. src/domain/betting/__tests__/gateV3.parity.test.js requires the
app's gateV3 to agree on every row."""
import csv
import math
from pathlib import Path
import numpy as np
from backtest import HISTORY, LIVE, PROD_WM, PROD_WV, as_arrays, load_rows, logit, sigmoid

OUT = Path(__file__).resolve().parents[2] / 'src/domain/betting/__tests__/fixtures/gateV3_parity.csv'

def tier(c6, nv, dA, dB):
    if c6 == 0.5:
        return 'NO BET'
    a = c6 > 0.5
    p, d, pnv = (c6, dA, nv) if a else (1 - c6, dB, 1 - nv)
    ev = p * d - 1
    if pnv == 0.5 or ev < 0.02:
        return 'NO BET'
    if pnv < 0.5:
        return 'BET' if d <= 3.0 else 'NO BET'
    return 'LEAN' if d >= 1.25 else 'NO BET'

rows = load_rows(HISTORY) + load_rows(LIVE, live=True)
A = as_arrays(rows)
c6 = sigmoid(PROD_WM * logit(A['nvA']) + PROD_WV * logit(A['v2']))
OUT.parent.mkdir(parents=True, exist_ok=True)
counts = {}
with open(OUT, 'w', newline='') as fh:
    w = csv.writer(fh, lineterminator='\n')
    w.writerow(['date', 'c6pA', 'noVigA', 'decA', 'decB', 'tier'])
    for r, p, nv, dA, dB in zip(rows, c6, A['nvA'], A['decA'], A['decB']):
        t = tier(float(p), float(nv), float(dA), float(dB))
        counts[t] = counts.get(t, 0) + 1
        w.writerow([r['date'], repr(float(p)), repr(float(nv)), repr(float(dA)), repr(float(dB)), t])
print(OUT, len(rows), counts)
