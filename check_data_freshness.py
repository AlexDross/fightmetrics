"""
check_data_freshness.py — fail the fighter refresh when its source is stale.

update-fighters.yml used to succeed quietly when Greco1899 had not refreshed:
the updater rebuilt identical artifacts, "No changes — skipping commit", green
check. Nothing distinguished "no card this week" from "the source stopped
updating", so a missing card could sit out of the model until someone noticed.

Three checks, each against data the run already has:

  1. Snapshot age — GitHub stamps every file in the branch archive with the
     commit time, so the zip itself says when Greco last refreshed. Greco
     refreshes at least weekly (Sundays ~18:00 UTC).
  2. Newest completed card — the latest dated event that has result rows.
     UFC runs most weekends; a holiday break can be overridden with
     FRESHNESS_MAX_EVENT_AGE_DAYS on a manual run.
  3. No regression — the download must not end before the fight history we
     already ship (a rolled-back or partial upstream snapshot).

Usage:
  python check_data_freshness.py --archive main.zip \
      --events ufc_event_details.csv --results ufc_fight_results.csv \
      --history src/fightHistory.js
"""

import argparse
import csv
import json
import os
import re
import sys
import zipfile
from datetime import date, datetime

MAX_SNAPSHOT_AGE_DAYS = 9
MAX_EVENT_AGE_DAYS = 15


def parse_event_date(value):
    try:
        return datetime.strptime(str(value).strip(), '%B %d, %Y').date()
    except ValueError:
        return None


def latest_completed_event(event_rows, result_rows):
    """(date, name) of the newest dated event that has at least one result."""
    with_results = {str(r.get('EVENT', '')).strip() for r in result_rows}
    best = None
    for row in event_rows:
        name = str(row.get('EVENT', '')).strip()
        dt = parse_event_date(row.get('DATE'))
        if dt and name in with_results and (best is None or dt > best[0]):
            best = (dt, name)
    return best


def archive_snapshot_date(path):
    """Newest entry timestamp in a GitHub branch archive = the commit date."""
    with zipfile.ZipFile(path) as z:
        stamps = [i.date_time for i in z.infolist() if not i.is_dir()]
    return date(*max(stamps)[:3]) if stamps else None


def latest_history_date(path):
    text = open(path, encoding='utf-8').read()
    dates = re.findall(r'"dt":\s*"(\d{4}-\d{2}-\d{2})"', text)
    return date.fromisoformat(max(dates)) if dates else None


def evaluate(today, snapshot, latest_event, shipped_history,
             max_snapshot_age=MAX_SNAPSHOT_AGE_DAYS,
             max_event_age=MAX_EVENT_AGE_DAYS):
    """Problems found, as human-readable strings; empty means fresh."""
    problems = []
    if snapshot is not None and (today - snapshot).days > max_snapshot_age:
        problems.append(
            f'Greco1899 snapshot is from {snapshot} ({(today - snapshot).days} days old, '
            f'limit {max_snapshot_age}). The upstream scraper has stopped refreshing.')
    if latest_event is None:
        problems.append('No dated event with results found in the download.')
    else:
        ev_date, ev_name = latest_event
        age = (today - ev_date).days
        if age > max_event_age:
            problems.append(
                f'Newest completed card is {ev_name!r} on {ev_date} ({age} days ago, '
                f'limit {max_event_age}). If this is a scheduled UFC break, re-run with '
                f'FRESHNESS_MAX_EVENT_AGE_DAYS set higher.')
        if shipped_history is not None and ev_date < shipped_history:
            problems.append(
                f'Download ends at {ev_date}, before the fight history already shipped '
                f'({shipped_history}). Upstream snapshot looks rolled back or partial.')
    return problems


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--archive')
    ap.add_argument('--events', required=True)
    ap.add_argument('--results', required=True)
    ap.add_argument('--history')
    args = ap.parse_args(argv)

    with open(args.events, newline='', encoding='utf-8') as f:
        events = list(csv.DictReader(f))
    with open(args.results, newline='', encoding='utf-8') as f:
        results = list(csv.DictReader(f))

    today = date.today()
    snapshot = archive_snapshot_date(args.archive) if args.archive else None
    latest = latest_completed_event(events, results)
    shipped = latest_history_date(args.history) if args.history and os.path.exists(args.history) else None
    max_event_age = int(os.environ.get('FRESHNESS_MAX_EVENT_AGE_DAYS') or MAX_EVENT_AGE_DAYS)

    print(f'Greco snapshot: {snapshot}')
    print(f'Newest completed card: {latest[1] if latest else None} ({latest[0] if latest else None})')
    print(f'Shipped fight history ends: {shipped}')

    problems = evaluate(today, snapshot, latest, shipped, max_event_age=max_event_age)
    for p in problems:
        print(f'::error::{p}')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
