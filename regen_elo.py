#!/usr/bin/env python3
"""
regen_elo.py
Regenerates src/eloModule.js from Greco1899 CSVs in the current directory.

Reads:  ufc_fight_results.csv  (fight outcomes)
        ufc_event_details.csv  (event dates)
Writes: src/eloModule.js

ELO parameters — identical to validated backtest_elo.py:
  base   = 1500
  K      = 32 base, ×1.5 finish, ×1.3 r1, ×1.15 r2, ×1.5 <5f, ×1.25 <10f
  scale  = 400 (standard Elo denominator)
"""

import csv
import json
import math
import pathlib
import sys
from collections import defaultdict
from datetime import datetime

RESULTS_CSV = pathlib.Path('ufc_fight_results.csv')
EVENTS_CSV  = pathlib.Path('ufc_event_details.csv')
OUT_JS      = pathlib.Path('src/eloModule.js')
NAME_ALIASES_JSON = pathlib.Path('name_aliases.json')

ELO_BASE = 1500.0


def load_name_aliases() -> dict:
    if not NAME_ALIASES_JSON.exists():
        return {}
    return json.loads(NAME_ALIASES_JSON.read_text(encoding='utf-8'))


NAME_ALIASES = load_name_aliases()


def normalize_name(name: str) -> str:
    name = name.strip()
    return NAME_ALIASES.get(name, name)

# Sanity gate thresholds
GATE_MIN_FIGHTERS  = 700
GATE_JONES_LO      = 1800
GATE_JONES_HI      = 2200
GATE_KHABIB_LO     = 1700
GATE_KHABIB_HI     = 2200
GATE_ELO_FLOOR     = 1000
GATE_ELO_CEILING   = 2500
GATE_FIGHTS_LO_PCT = 0.80   # ≥80% of baseline
GATE_FIGHTS_HI_PCT = 1.20   # ≤120% of baseline
GATE_FIGHTS_BASE   = 8547   # prototype walk count


def is_finish(method: str) -> bool:
    """KO/TKO and Submission are finishes; everything else is a decision-type."""
    m = method.upper()
    return 'KO' in m or 'TKO' in m or 'SUBMISSION' in m


def k_factor(method: str, finish_round: int, n_fights: int) -> float:
    """
    Mirrors backtest_elo.py k_factor exactly, adapted to Greco method strings.
    """
    k = 32.0
    if is_finish(method):
        k *= 1.5
        if finish_round == 1:
            k *= 1.3
        elif finish_round == 2:
            k *= 1.15
    if n_fights < 5:
        k *= 1.5
    elif n_fights < 10:
        k *= 1.25
    return k


def elo_expected(ra: float, rb: float) -> float:
    return 1.0 / (1.0 + 10.0 ** ((rb - ra) / 400.0))


def parse_date(s: str) -> datetime | None:
    s = s.strip()
    for fmt in ('%B %d, %Y', '%b %d, %Y', '%Y-%m-%d'):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def split_bout(bout: str):
    if ' vs. ' in bout:
        parts = bout.split(' vs. ', 1)
        return normalize_name(parts[0]), normalize_name(parts[1])
    return None, None


def load_event_dates() -> dict:
    dates = {}
    with open(EVENTS_CSV, newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            ev = row.get('EVENT', '').strip()
            d  = parse_date(row.get('DATE', ''))
            if ev and d:
                dates[ev] = d
    return dates


def build_elo(event_dates: dict):
    rows = []
    skipped_no_date = 0
    skipped_non_decisive = 0

    with open(RESULTS_CSV, newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            outcome = row.get('OUTCOME', '').strip()
            if outcome not in ('W/L', 'L/W'):
                skipped_non_decisive += 1
                continue
            ev = row.get('EVENT', '').strip()
            d  = event_dates.get(ev)
            if d is None:
                skipped_no_date += 1
                continue
            rows.append((d, row))

    rows.sort(key=lambda x: x[0])

    ratings      = defaultdict(lambda: ELO_BASE)
    peak_ratings = defaultdict(lambda: ELO_BASE)
    fight_counts = defaultdict(int)

    for d, row in rows:
        fa, fb = split_bout(row.get('BOUT', '').strip())
        if fa is None:
            continue

        outcome = row.get('OUTCOME', '').strip()
        method  = row.get('METHOD', '').strip()
        try:
            rnd = int(float(row.get('ROUND', '0').strip()))
        except (ValueError, TypeError):
            rnd = 3

        ra, rb = ratings[fa], ratings[fb]
        na, nb = fight_counts[fa], fight_counts[fb]

        ea = elo_expected(ra, rb)
        sa = 1.0 if outcome == 'W/L' else 0.0

        ka = k_factor(method, rnd, na)
        kb = k_factor(method, rnd, nb)

        ratings[fa] = ra + ka * (sa - ea)
        ratings[fb] = rb + kb * ((1.0 - sa) - (1.0 - ea))

        peak_ratings[fa] = max(peak_ratings[fa], ratings[fa])
        peak_ratings[fb] = max(peak_ratings[fb], ratings[fb])

        fight_counts[fa] += 1
        fight_counts[fb] += 1

    return dict(ratings), dict(peak_ratings), dict(fight_counts), len(rows), skipped_no_date


def run_sanity_gates(ratings: dict, fight_counts: dict, total_fights: int) -> bool:
    ok = True

    def fail(msg):
        nonlocal ok
        print(f'  ✗ GATE FAIL: {msg}', file=sys.stderr)
        ok = False

    n_fighters = len(ratings)
    if n_fighters < GATE_MIN_FIGHTERS:
        fail(f'Only {n_fighters} fighters rated (need ≥{GATE_MIN_FIGHTERS})')

    jones = ratings.get('Jon Jones', None)
    if jones is None:
        fail("Jon Jones not in ratings — data problem")
    elif not (GATE_JONES_LO <= jones <= GATE_JONES_HI):
        fail(f"Jon Jones ELO {jones:.0f} outside [{GATE_JONES_LO}, {GATE_JONES_HI}]")

    khabib = ratings.get('Khabib Nurmagomedov', None)
    if khabib is None:
        fail("Khabib Nurmagomedov not in ratings — data problem")
    elif not (GATE_KHABIB_LO <= khabib <= GATE_KHABIB_HI):
        fail(f"Khabib ELO {khabib:.0f} outside [{GATE_KHABIB_LO}, {GATE_KHABIB_HI}]")

    lo = min(ratings.values()); hi = max(ratings.values())
    if lo < GATE_ELO_FLOOR:
        low_name = [k for k, v in ratings.items() if v == lo][0]
        fail(f"Minimum ELO {lo:.0f} ({low_name}) below floor {GATE_ELO_FLOOR}")
    if hi > GATE_ELO_CEILING:
        hi_name = [k for k, v in ratings.items() if v == hi][0]
        fail(f"Maximum ELO {hi:.0f} ({hi_name}) above ceiling {GATE_ELO_CEILING}")

    lo_fights = int(GATE_FIGHTS_BASE * GATE_FIGHTS_LO_PCT)
    hi_fights = int(GATE_FIGHTS_BASE * GATE_FIGHTS_HI_PCT)
    if not (lo_fights <= total_fights <= hi_fights):
        fail(f"Fights processed {total_fights} outside expected range [{lo_fights}, {hi_fights}]")

    return ok


def write_elomodule(ratings: dict, peak_ratings: dict, fight_counts: dict,
                    total_fights: int, today: str):
    data = {}
    for name, elo in sorted(ratings.items(), key=lambda x: -x[1]):
        data[name] = {
            'elo':  round(elo),
            'peak': round(peak_ratings.get(name, elo)),
            'n':    fight_counts.get(name, 0),
        }

    header = (
        '// ─── ELO RATINGS ──────────────────────────────────────────────────────────────\n'
        f'// Computed from {total_fights:,} UFC fights (full history through {today})\n'
        '// K-factor weighted by finish method and round; early-fighter K inflated\n'
        '// Format: { fighterName: { elo, peak, n } }\n'
        '// elo = current rating · peak = highest ever · n = UFC fights processed\n'
    )

    OUT_JS.write_text(
        header + '\nexport const ELO_RATINGS = ' + json.dumps(data, ensure_ascii=False) + ';\n',
        encoding='utf-8',
    )
    print(f'\n✅ Wrote {OUT_JS} ({len(data)} fighters)')


def print_candidate_report(ratings: dict, peak_ratings: dict, fight_counts: dict,
                            total_fights: int, skipped_no_date: int):
    """Print the pre-write report. Does NOT write the file."""
    print(f'\n{"="*60}')
    print(f'CANDIDATE ELO OUTPUT — DRY RUN (file not written)')
    print(f'{"="*60}')
    print(f'  Fights processed   : {total_fights:,}')
    print(f'  Skipped (no date)  : {skipped_no_date}')
    print(f'  Fighters rated     : {len(ratings):,}')
    print(f'  Min ELO            : {min(ratings.values()):.0f}')
    print(f'  Max ELO            : {max(ratings.values()):.0f}')

    print(f'\n  Key fighters:')
    checks = [
        'Jon Jones', 'Khabib Nurmagomedov', 'Islam Makhachev',
        'Alex Pereira', 'Ilia Topuria',
    ]
    for name in checks:
        e = ratings.get(name)
        p = peak_ratings.get(name)
        n = fight_counts.get(name, 0)
        if e:
            print(f'    {name:<28} elo={e:.0f}  peak={p:.0f}  n={n}')
        else:
            print(f'    {name:<28} NOT FOUND')

    # Load current module for comparison
    elo_js = pathlib.Path('src/eloModule.js').read_text(encoding='utf-8')
    import re
    m = re.search(r'ELO_RATINGS = (\{.*\});?\s*$', elo_js, re.DOTALL)
    if m:
        current = json.loads(m.group(1))
        current_flat = {k: v['elo'] for k, v in current.items()}

        new_fighters = [n for n in ratings if n not in current_flat]
        print(f'\n  New fighters (not in current module): {len(new_fighters)}')
        print(f'  Current module had                  : {len(current_flat)}')
        print(f'  New total                           : {len(ratings)}')

        # Largest movers (fighters in both)
        movers = []
        for name, new_elo in ratings.items():
            if name in current_flat:
                delta = round(new_elo) - current_flat[name]
                movers.append((abs(delta), delta, name, current_flat[name], round(new_elo)))
        movers.sort(reverse=True)

        print(f'\n  Largest ELO changes vs current module (top 20):')
        print(f'    {"Name":<28} {"Old":>6} {"New":>6} {"Delta":>7}')
        print(f'    {"─"*55}')
        for _, delta, name, old, new in movers[:20]:
            print(f'    {name:<28} {old:6d} {new:6d} {delta:+7d}')

        # Distribution of deltas
        deltas = [round(ratings[n]) - current_flat[n] for n in ratings if n in current_flat]
        import statistics
        print(f'\n  Delta distribution (fighters in both modules):')
        print(f'    count={len(deltas)}  mean={statistics.mean(deltas):+.1f}  '
              f'median={statistics.median(deltas):+.1f}  '
              f'stdev={statistics.stdev(deltas):.1f}')
        print(f'    min={min(deltas):+d}  max={max(deltas):+d}')

        # Bucket: how many moved >100, >50, <10
        big = sum(1 for d in deltas if abs(d) > 100)
        med = sum(1 for d in deltas if 50 < abs(d) <= 100)
        sml = sum(1 for d in deltas if abs(d) <= 10)
        print(f'    |Δ|>100: {big}   |Δ|>50: {med}   |Δ|≤10: {sml}')
    print(f'\n{"="*60}')


def main():
    dry_run = '--dry-run' in sys.argv

    print('Loading event dates...')
    event_dates = load_event_dates()
    print(f'  {len(event_dates)} events with dates')

    print('Building ELO from fight history...')
    ratings, peak_ratings, fight_counts, total_fights, skipped_no_date = build_elo(event_dates)
    print(f'  {total_fights:,} decisive fights processed')
    print(f'  {len(ratings):,} unique fighters')

    print('\nRunning sanity gates...')
    gates_ok = run_sanity_gates(ratings, fight_counts, total_fights)
    if not gates_ok:
        print('\n❌ Sanity gates failed — eloModule.js NOT written', file=sys.stderr)
        sys.exit(1)
    print('  ✓ All gates passed')

    if dry_run:
        print_candidate_report(ratings, peak_ratings, fight_counts, total_fights, skipped_no_date)
        print('\n(dry-run: eloModule.js not written)')
        return

    today = datetime.utcnow().strftime('%b %Y')
    write_elomodule(ratings, peak_ratings, fight_counts, total_fights, today)


if __name__ == '__main__':
    main()
