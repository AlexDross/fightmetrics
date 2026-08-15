#!/usr/bin/env python3
"""Correction 6A pre-write gate: the raw WEIGHTCLASS vocabulary is a closed set.

Runs against the downloaded feed BEFORE update_fighters.py writes any generated
file. A label is accepted because a human reviewed it into
tests/fixtures/weightclass/labels_120.tsv — never because it happens to contain
a recognised division token. `BMF Welterweight Title Bout` parses cleanly and is
still rejected here, which is the point: token recognition grants nothing.

Failure modes, all fatal:
  * a raw label absent from the reviewed fixture
  * a reviewed label the feed no longer produces (drift in the other direction)
  * blank / malformed / unparseable labels
  * a label resolving to an unsupported division
  * a parse result contradicting its reviewed fixture row

Row-count growth on an ALREADY reviewed label is fine and needs no review; that
is ordinary event-by-event feed growth.
"""

import argparse
import collections
import csv
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd

from fight_weightclass import (
    SUPPORTED_DIVISIONS,
    BoutMetadataConflict,
    WeightclassParseError,
    parse_weightclass,
    validate_result_frame,
)

DEFAULT_RESULTS = 'ufc_fight_results.csv'
DEFAULT_FIXTURE = os.path.join('tests', 'fixtures', 'weightclass', 'labels_120.tsv')


def load_fixture(path):
    with open(path, newline='', encoding='utf-8') as handle:
        rows = list(csv.DictReader(handle, delimiter='\t'))
    reviewed = {}
    for row in rows:
        reviewed[row['raw']] = {
            'division': row['division'],
            'championship': row['championship'] == 'true',
            'interim': row['interim'] == 'true',
            'tournament_final': row['tournament_final'] == 'true',
            'category': row['category'],
        }
    if len(reviewed) != len(rows):
        raise SystemExit(f'{path}: duplicate raw label in reviewed fixture')
    return reviewed


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--results', default=DEFAULT_RESULTS)
    ap.add_argument('--fixture', default=DEFAULT_FIXTURE)
    args = ap.parse_args()

    reviewed = load_fixture(args.fixture)
    frame = pd.read_csv(args.results)
    if 'WEIGHTCLASS' not in frame.columns:
        raise SystemExit(f'{args.results}: no WEIGHTCLASS column')

    observed = collections.Counter(
        frame['WEIGHTCLASS'].fillna('').astype(str).str.strip())
    failures = []

    blank = observed.pop('', 0)
    if blank:
        failures.append(f'{blank} row(s) carry a blank WEIGHTCLASS')

    novel = sorted(set(observed) - set(reviewed))
    for label in novel:
        failures.append(
            f'UNREVIEWED label ({observed[label]} row(s)): {label!r} — add a '
            f'reviewed row to {args.fixture} before this feed may be used')

    retired = sorted(set(reviewed) - set(observed))
    for label in retired:
        failures.append(
            f'reviewed label no longer present in the feed: {label!r} — '
            f'confirm the removal and update {args.fixture}')

    for label in sorted(set(observed) & set(reviewed)):
        try:
            parsed = parse_weightclass(label)
        except WeightclassParseError as exc:
            failures.append(f'{label!r}: parse failed: {exc}')
            continue
        if parsed['division'] not in SUPPORTED_DIVISIONS:
            failures.append(
                f'{label!r}: unsupported division {parsed["division"]!r}')
        want = reviewed[label]
        for key in ('division', 'championship', 'interim', 'tournament_final', 'category'):
            if parsed[key] != want[key]:
                failures.append(
                    f'{label!r}: parser/fixture disagree on {key}: '
                    f'parser={parsed[key]!r} fixture={want[key]!r}')
        if parsed['championship'] and parsed['tournament_final']:
            failures.append(
                f'{label!r}: contradictory — championship and tournament final')

    # R10 — one bout URL, one metadata tuple. Shared implementation, so this
    # gate and update_fighters.py cannot drift apart on what "consistent" means.
    summary = None
    try:
        summary = validate_result_frame(frame)
    except (WeightclassParseError, BoutMetadataConflict) as exc:
        failures.append(f'bout-metadata gate: {exc}')

    if failures:
        print('Closed-label gate FAILED:', file=sys.stderr)
        for line in failures:
            print(f'  ✗ {line}', file=sys.stderr)
        return 1

    print(f'✅  closed-label gate: {len(observed)} distinct labels, '
          f'{sum(observed.values())} rows, all reviewed and consistent')
    print(f'✅  bout-metadata gate: {summary["url_count"]} bouts from '
          f'{summary["row_count"]} rows; {summary["duplicate_groups"]} '
          f'duplicate-URL groups ({summary["duplicate_rows"]} repeat rows), '
          f'{summary["conflicts"]} conflicts')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
