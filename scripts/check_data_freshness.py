#!/usr/bin/env python3
"""
check_data_freshness.py  --  fail-closed freshness gate for the data pipeline.

Runs in .github/workflows/update-fighters.yml AFTER the Greco CSVs are downloaded
and BEFORE update_fighters.py / regen_elo.py execute. Its job is to make the
workflow FAIL LOUDLY when the incoming data is structurally broken, has gone
backwards, or is implausibly stale -- instead of silently ingesting nothing and
producing a misleading "successful" commit (the failure mode documented in
research/scraper_staleness_and_freshness_gate.md, Part B).

It NEVER touches model logic, dsl, or any prediction path. It only reads:
  - the freshly downloaded ufc_event_details.csv  (DATE column -> max event date)
  - the freshly downloaded ufc_fight_results.csv   (row count)
  - the persisted baseline in src/sourceManifest.js (freshnessBaseline block)

Exit codes:
  1  -> FAIL. Something is wrong; the workflow stops before ingesting.
  0  -> PASS. Either "new data" or "no new data" (both are non-error outcomes,
        distinguished by the logged verdict and the GITHUB_OUTPUT `new_data`).

Baseline counts/date are read from the manifest, never hardcoded, so this stays
correct as the data grows. On PASS-new-data the workflow regenerates the manifest
(generate_source_manifest.py) so the baseline advances for the next run.

Environment overrides (all optional; production uses the defaults):
  FRESHNESS_MAX_STALE_DAYS  int, default 14   -- staleness threshold (see below)
  FRESHNESS_REF_DATE        ISO date, default today() -- "now", for testability
  SOURCE_MANIFEST_PATH      path, default src/sourceManifest.js
  EVENT_DETAILS_CSV         path, default ufc_event_details.csv
  FIGHT_RESULTS_CSV         path, default ufc_fight_results.csv

Threshold rationale (14 days): the UFC runs an event almost every week, so under
normal operation the newest event is <=7 days old on any Mon/Thu run. Genuine
quiet stretches of up to ~2 weeks do occur (year-end break, gaps between PPV
blocks -- e.g. Greco's own history has a 2026-02-08 -> 2026-02-22 gap). 14 days
tolerates that longest-normal lull without a false FAIL, while still catching a
truly stuck pipeline (the current stuck-at-2026-05-16 case is ~59 days and fails
immediately). 10 would risk tripping on a legitimate 2-week gap; 14 is the
conservative choice inside the allowed 10-14 band. A false FAIL is a loud, visible
workflow failure a human re-runs -- never silent bad data -- so erring toward
fail-closed is acceptable.
"""

import csv
import json
import os
import re
import sys
from datetime import date, datetime

EVENT_DATE_FMT = '%B %d, %Y'


def _env_int(name, default):
    try:
        return int(os.environ.get(name, str(default)))
    except ValueError:
        return default


def parse_ref_date():
    raw = os.environ.get('FRESHNESS_REF_DATE', '').strip()
    if raw:
        return datetime.strptime(raw, '%Y-%m-%d').date()
    return date.today()


def load_manifest_baseline(path):
    """Returns (baseline_dict_or_None, error_or_None). baseline_dict has keys
    maxObservedEventDate (ISO str), eventCount (int), resultRowCount (int)."""
    if not os.path.exists(path):
        return None, f"manifest not found at {path}"
    text = open(path, encoding='utf-8').read()
    m = re.search(r'export const SOURCE_MANIFEST\s*=\s*(\{.*\});\s*$', text, re.DOTALL)
    if not m:
        return None, f"could not extract SOURCE_MANIFEST object from {path}"
    try:
        manifest = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        return None, f"manifest JSON parse error: {e}"
    baseline = manifest.get('freshnessBaseline')
    if not baseline:
        return None, "manifest has no freshnessBaseline block"
    return baseline, None


def read_event_details(path):
    """Returns (max_event_date_or_None, event_count, error_or_None)."""
    if not os.path.exists(path):
        return None, 0, f"{path} not found"
    try:
        with open(path, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames is None or 'DATE' not in reader.fieldnames:
                return None, 0, f"{path} missing required 'DATE' column"
            max_dt = None
            n = 0
            for row in reader:
                n += 1
                raw = (row.get('DATE') or '').strip()
                if not raw:
                    continue
                try:
                    dt = datetime.strptime(raw, EVENT_DATE_FMT).date()
                except ValueError:
                    continue
                if max_dt is None or dt > max_dt:
                    max_dt = dt
    except Exception as e:  # noqa: BLE001 - any read error is a structural failure
        return None, 0, f"{path} unreadable: {e}"
    if n == 0:
        return None, 0, f"{path} has no data rows"
    if max_dt is None:
        return None, n, f"{path} has no parseable dates in DATE column"
    return max_dt, n, None


def read_result_rows(path):
    """Returns (row_count, error_or_None)."""
    if not os.path.exists(path):
        return 0, f"{path} not found"
    try:
        with open(path, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames is None or 'EVENT' not in reader.fieldnames:
                return 0, f"{path} missing required 'EVENT' column"
            n = sum(1 for _ in reader)
    except Exception as e:  # noqa: BLE001
        return 0, f"{path} unreadable: {e}"
    if n == 0:
        return 0, f"{path} has no data rows"
    return n, None


def emit_output(new_data, verdict):
    """Expose the verdict to later workflow steps via GITHUB_OUTPUT."""
    gh = os.environ.get('GITHUB_OUTPUT')
    if gh:
        with open(gh, 'a', encoding='utf-8') as f:
            f.write(f"new_data={'true' if new_data else 'false'}\n")
            f.write(f"verdict={verdict}\n")


def main():
    threshold = _env_int('FRESHNESS_MAX_STALE_DAYS', 14)
    ref_date = parse_ref_date()
    manifest_path = os.environ.get('SOURCE_MANIFEST_PATH', 'src/sourceManifest.js')
    event_csv = os.environ.get('EVENT_DETAILS_CSV', 'ufc_event_details.csv')
    results_csv = os.environ.get('FIGHT_RESULTS_CSV', 'ufc_fight_results.csv')

    print("=== data freshness gate ===")
    print(f"ref_date={ref_date}  threshold={threshold}d  manifest={manifest_path}")

    failures = []

    # --- structural checks (unparseable / missing columns => hard FAIL) ---------
    incoming_max, incoming_events, ev_err = read_event_details(event_csv)
    if ev_err:
        failures.append(f"STRUCTURAL: {ev_err}")
    incoming_results, rs_err = read_result_rows(results_csv)
    if rs_err:
        failures.append(f"STRUCTURAL: {rs_err}")

    # If we couldn't even establish an incoming max date, stop here.
    if incoming_max is None:
        for msg in failures:
            print("  FAIL " + msg)
        print("VERDICT: FAIL (structural -- could not read incoming data)")
        emit_output(False, 'fail_structural')
        return 1

    print(f"incoming: max_event_date={incoming_max}  events={incoming_events}  "
          f"result_rows={incoming_results}")

    baseline, base_err = load_manifest_baseline(manifest_path)
    if base_err:
        # No usable baseline: cannot run regression checks, but still enforce
        # structural + staleness. Loud warning, not a silent skip.
        print(f"  WARN no baseline ({base_err}); running structural + staleness only")
    else:
        b_max = datetime.strptime(baseline['maxObservedEventDate'], '%Y-%m-%d').date()
        b_events = int(baseline['eventCount'])
        b_results = int(baseline['resultRowCount'])
        print(f"baseline: max_event_date={b_max}  events={b_events}  result_rows={b_results}")

        # --- regression checks (data went backwards => FAIL) --------------------
        if incoming_max < b_max:
            failures.append(
                f"REGRESSION: incoming max event date {incoming_max} < baseline {b_max}")
        if incoming_events < b_events:
            failures.append(
                f"REGRESSION: event count decreased {b_events} -> {incoming_events}")
        if incoming_results < b_results:
            failures.append(
                f"REGRESSION: result row count decreased {b_results} -> {incoming_results}")

    # --- staleness check (too old regardless of internal consistency) -----------
    age_days = (ref_date - incoming_max).days
    if age_days > threshold:
        failures.append(
            f"STALE: newest event {incoming_max} is {age_days}d old (> {threshold}d threshold)")

    if failures:
        for msg in failures:
            print("  FAIL " + msg)
        print("VERDICT: FAIL")
        emit_output(False, 'fail')
        return 1

    # --- passed all gates: classify new-data vs no-new-data ---------------------
    if baseline is None:
        new_data = True  # can't prove otherwise; treat as new so manifest regenerates
        print("VERDICT: PASS (NEW DATA -- no baseline to compare, assuming new)")
    else:
        advanced = (
            incoming_max > b_max
            or incoming_events > b_events
            or incoming_results > b_results
        )
        new_data = advanced
        if advanced:
            print(f"VERDICT: PASS (NEW DATA) -- +{incoming_events - b_events} events, "
                  f"+{incoming_results - b_results} result rows, "
                  f"max {b_max} -> {incoming_max}")
        else:
            print(f"VERDICT: PASS (NO NEW DATA) -- max event date {incoming_max} unchanged, "
                  f"counts unchanged, within {threshold}d freshness window")

    emit_output(new_data, 'new_data' if new_data else 'no_new_data')
    return 0


if __name__ == '__main__':
    sys.exit(main())
