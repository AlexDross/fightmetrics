#!/usr/bin/env python3
"""
generate_source_manifest.py

Computes provenance tuples for every active v2 feature-source module (plus
cardio/rankings, tracked for future model versions per the source-integrity
audit) and writes them to src/sourceManifest.js.

For each module records: generatedAt (last git commit touching the artifact
file), maxObservedEventDate (the latest event date ACTUALLY PRESENT in the
module's underlying source data -- never a file mtime, git date, or in-file
header comment), a content hash of the shipped artifact, and generatorVersion
(the commit that produced it, when recoverable).

maxObservedEventDate methodology mirrors research/source_integrity_audit.md's
manual approach:
  - fightHistory / fightersData aggregates / elo: all three are generated from
    the same two Greco CSVs (ufc_fight_results.csv joined to
    ufc_event_details.csv via EVENT name -- see update_fighters.py:240-242 and
    regen_elo.py:6-7). maxObservedEventDate is the maximum DATE value actually
    parseable in ufc_event_details.csv, verified against the CSVs, not any
    script's run date or in-file comment.
  - rankHistory: its raw source CSV (UFC_rankings_history.csv) is not present
    on disk. Falls back to the maximum YYYYMMDD date literally embedded in the
    shipped rankHistory.js artifact itself -- a defensible proxy for "latest
    date this artifact could possibly reflect," clearly labeled as such.
  - cardio: no generator script exists in the repo and no per-fighter date is
    embedded in the shipped artifact. Recorded as indeterminate with an
    explicit note; not a silent gap.

Read-only against every source file it inspects. Writes only to
src/sourceManifest.js. Does not touch fightersData.js, fightHistory.js,
eloModule.js, cardioModule.js, rankHistory.js, or any prediction/model logic.
"""

import csv
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent


def git_last_commit_date(path):
    try:
        out = subprocess.run(
            ['git', 'log', '-1', '--format=%ad', '--date=short', '--', path],
            cwd=REPO_ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
        return out or None
    except Exception:
        return None


def git_last_commit_hash(path):
    try:
        out = subprocess.run(
            ['git', 'log', '-1', '--format=%H', '--', path],
            cwd=REPO_ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
        return out or None
    except Exception:
        return None


def git_is_tracked(path):
    try:
        out = subprocess.run(
            ['git', 'ls-files', path],
            cwd=REPO_ROOT, capture_output=True, text=True, check=True,
        ).stdout.strip()
        return bool(out)
    except Exception:
        return False


def sha256_of_file(path):
    p = REPO_ROOT / path
    if not p.exists():
        return None
    h = hashlib.sha256()
    h.update(p.read_bytes())
    return h.hexdigest()


def max_event_date_in_csv(csv_path):
    """Parses ufc_event_details.csv's DATE column ('Month D, YYYY' format) and
    returns the maximum date as an ISO string, or None if unreadable."""
    p = REPO_ROOT / csv_path
    if not p.exists():
        return None, 0
    max_dt = None
    n_rows = 0
    with p.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            n_rows += 1
            raw = (row.get('DATE') or '').strip()
            if not raw:
                continue
            try:
                dt = datetime.strptime(raw, '%B %d, %Y')
            except ValueError:
                continue
            if max_dt is None or dt > max_dt:
                max_dt = dt
    return (max_dt.date().isoformat() if max_dt else None), n_rows


def max_embedded_yyyymmdd(js_path):
    """Extracts the maximum 8-digit YYYYMMDD literal embedded in the artifact's
    own content (fallback when the raw source CSV isn't available on disk)."""
    p = REPO_ROOT / js_path
    if not p.exists():
        return None
    content = p.read_text(encoding='utf-8', errors='ignore')
    matches = re.findall(r'\[(\d{8}),', content)
    if not matches:
        return None
    max_n = max(int(m) for m in matches)
    s = str(max_n)
    return f"{s[0:4]}-{s[4:6]}-{s[6:8]}"


def event_name_present_in_csv(csv_path, needle_lower):
    p = REPO_ROOT / csv_path
    if not p.exists():
        return None
    content = p.read_text(encoding='utf-8', errors='ignore').lower()
    return needle_lower in content


def rankings_module_entry():
    """Provenance for the two generated rankings artifacts.

    Every field is read from the artifacts and the reviewed history cache, which
    record the upstream dataset version, its content hash, the clean-history
    cutoff and the official snapshot dates. There is deliberately NO fallback to
    a git commit date or a previous manifest: if the source evidence is missing
    this raises, because a manifest that quietly reuses commit-derived dates
    while claiming independent source provenance is worse than no manifest.

    The artifacts are tracked separately because only ONE of them ships:
    rankingsData.js is in the production bundle, rankingsHistoryData.js is
    offline research data.
    """
    current_path = REPO_ROOT / 'src' / 'rankingsData.js'
    history_path = REPO_ROOT / 'src' / 'rankingsHistoryData.js'
    cache_path = (
        REPO_ROOT / 'data' / 'rankings' / 'kaggle-history-through-2026-06-18.json'
    )
    for path in (current_path, history_path):
        if not path.exists():
            raise SystemExit(
                f'FATAL: {path.relative_to(REPO_ROOT)} is missing. Run '
                '`npm run rankings:regen` before regenerating the manifest.'
            )
    if not cache_path.exists():
        raise SystemExit(
            f'FATAL: reviewed history cache {cache_path} is missing; rankings '
            'provenance cannot be established from source.'
        )

    def read_metadata(path, symbol):
        content = path.read_text(encoding='utf-8')
        match = re.search(
            r'export const ' + symbol + r' = (\{.*?\});\n', content, re.S
        )
        if not match:
            raise SystemExit(
                f'FATAL: could not read {symbol} out of '
                f'{path.relative_to(REPO_ROOT)}; refusing to emit unverified '
                'rankings provenance.'
            )
        return json.loads(match.group(1))

    current_metadata = read_metadata(current_path, 'RANKINGS_METADATA')
    history_metadata = read_metadata(history_path, 'RANKINGS_HISTORY_METADATA')
    cache = json.loads(cache_path.read_text(encoding='utf-8'))

    snapshot_dir = REPO_ROOT / 'data' / 'rankings' / 'snapshots'
    snapshots = sorted(p.name for p in snapshot_dir.glob('*.json'))
    if not snapshots:
        raise SystemExit(
            'FATAL: no official ranking snapshots on disk; rankings provenance '
            'cannot be established from source.'
        )

    generator = (
        f"scripts/update_rankings.py @ "
        f"{git_last_commit_hash('scripts/update_rankings.py')}"
        if git_is_tracked('scripts/update_rankings.py')
        else 'scripts/update_rankings.py (untracked working-tree version)'
    )
    verification = (
        'Read directly from the generated artifacts and the committed history '
        'cache, all produced by scripts/update_rankings.py and regenerating '
        'byte-identically from the same inputs. upstreamContentSha256 is the '
        'SHA-256 of the Kaggle CSV the cache was built from. No git commit '
        'date, file mtime, or header comment is consulted, and a missing '
        'artifact, cache or snapshot set is a hard failure rather than a '
        'silent fallback.'
    )

    return {
        'rankings': {
            'file': 'src/rankingsData.js',
            'feedsV2': False,
            'inProductionBundle': True,
            'note': (
                'Current official rankings feed fighter-profile/UI rank badges '
                'only. Runtime artifact: this is the only rankings file in the '
                'production dependency graph. Historical series live in the '
                'separate rankingsHistory module below.'
            ),
            'generatedAt': current_metadata['generatedAt'],
            'maxObservedEventDate': (
                current_metadata['officialUfc']['mediaSnapshot']
            ),
            'contentHash': sha256_of_file('src/rankingsData.js'),
            'officialSnapshots': snapshots,
            'generatorVersion': generator,
            'verificationMethod': verification,
        },
        'rankingsHistory': {
            'file': 'src/rankingsHistoryData.js',
            'feedsV2': False,
            'inProductionBundle': False,
            'note': (
                'Historical divisional rankings. RESEARCH ARTIFACT: no runtime '
                'consumer and no model consumer -- neither the deprecated v1 '
                'engine nor the frozen 16-feature MODEL_V2. Kept out of the '
                'browser bundle; enforced by '
                'src/domain/rankings/__tests__/boundary.test.js (import graph) '
                'and scripts/verify-bundle.mjs (emitted assets).'
            ),
            'generatedAt': history_metadata['generatedAt'],
            'maxObservedEventDate': history_metadata['history']['latestSnapshot'],
            'contentHash': sha256_of_file('src/rankingsHistoryData.js'),
            'historyCacheSha256': sha256_of_file(
                'data/rankings/kaggle-history-through-2026-06-18.json'
            ),
            'upstreamContentSha256': cache['source']['contentSha256'],
            'upstreamVersion': cache['source']['version'],
            'historyUsedThrough': history_metadata['kaggle']['historyUsedThrough'],
            'generatorVersion': generator,
            'verificationMethod': verification,
        },
    }


def build_manifest():
    now_iso = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    max_event_date, n_event_rows = max_event_date_in_csv('ufc_event_details.csv')

    # Cross-check: confirm zero window-period event names leak into the raw
    # fight-level CSVs even though they lack their own date column (mirrors
    # source_integrity_audit.md's methodology).
    # Actual event names for the current v2 window, read from roiData.js
    # (not guessed) to avoid false-positive substring matches against
    # unrelated historical fights sharing a fighter's name.
    window_event_names = [
        'ufc macau', 'ufc vegas 118', 'freedom 250', 'ufc vegas 119',
        'ufc fight night baku', 'ufc 329',
    ]
    fight_csvs = ['ufc_fight_results.csv', 'ufc_fight_details.csv', 'ufc_fight_stats.csv']
    any_window_hit = False
    for csvf in fight_csvs:
        for name in window_event_names:
            if event_name_present_in_csv(csvf, name):
                any_window_hit = True

    greco_verification_note = (
        f"Parsed DATE column of ufc_event_details.csv directly ({n_event_rows} rows); "
        f"maximum event date found = {max_event_date}. Cross-checked {', '.join(fight_csvs)} "
        f"for window-period event names: {'FOUND (see manual audit)' if any_window_hit else 'zero matches'}. "
        "This value is NOT derived from any file mtime, git commit date, or in-file header "
        "comment -- see research/source_integrity_audit.md for the original manual methodology "
        "this script automates."
    )

    modules = {}

    modules['fightHistory'] = {
        'file': 'src/fightHistory.js',
        'feedsV2': True,
        'generatedAt': git_last_commit_date('src/fightHistory.js'),
        'maxObservedEventDate': max_event_date,
        'contentHash': sha256_of_file('src/fightHistory.js'),
        'generatorVersion': (
            f"update_fighters.py @ {git_last_commit_hash('update_fighters.py')}"
            if git_is_tracked('update_fighters.py') else 'unavailable'
        ),
        'verificationMethod': greco_verification_note,
    }

    modules['fightersDataAggregates'] = {
        'file': 'src/fightersData.js',
        'feedsV2': True,
        'note': 'Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, '
                 'td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.',
        'generatedAt': git_last_commit_date('src/fightersData.js'),
        'maxObservedEventDate': max_event_date,
        'contentHash': sha256_of_file('src/fightersData.js'),
        'generatorVersion': (
            f"update_fighters.py @ {git_last_commit_hash('update_fighters.py')}"
            if git_is_tracked('update_fighters.py') else 'unavailable'
        ),
        'verificationMethod': greco_verification_note,
    }

    modules['elo'] = {
        'file': 'src/eloModule.js',
        'feedsV2': True,
        'generatedAt': git_last_commit_date('src/eloModule.js'),
        'maxObservedEventDate': max_event_date,
        'contentHash': sha256_of_file('src/eloModule.js'),
        'generatorVersion': (
            f"regen_elo.py @ {git_last_commit_hash('regen_elo.py')}"
            if git_is_tracked('regen_elo.py') else 'unavailable'
        ),
        'verificationMethod': (
            greco_verification_note +
            " NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- "
            "this is misleading relative to the verified underlying data and should not be trusted; "
            "regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv, identical to the "
            "fight-history/fighter-aggregate sources above."
        ),
    }

    modules['cardio'] = {
        'file': 'src/cardioModule.js',
        'feedsV2': False,
        'note': 'Does not feed MODEL_V2 (no path into computeLogisticProb\'s 16 features, '
                 'confirmed in research/source_integrity_audit.md). Tracked here for future '
                 'model versions that might use it.',
        'generatedAt': git_last_commit_date('src/cardioModule.js'),
        'maxObservedEventDate': None,
        'contentHash': sha256_of_file('src/cardioModule.js'),
        'generatorVersion': 'unavailable -- no cardio-generation script found in repo',
        'verificationMethod': (
            "INDETERMINATE: no generator script present in the repository, and no per-fighter "
            "date field is embedded in the shipped artifact itself, so maxObservedEventDate "
            "cannot be independently verified the way the Greco-CSV-backed modules above were. "
            "The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT "
            "independently verified and should not be treated as authoritative."
        ),
    }

    max_rank_date = max_embedded_yyyymmdd('src/rankHistory.js')
    modules['rankHistory'] = {
        'file': 'src/rankHistory.js',
        'feedsV2': False,
        'note': 'Does not feed MODEL_V2 (no path into computeLogisticProb\'s 16 features, '
                 'confirmed in research/source_integrity_audit.md). Tracked here for future '
                 'model versions that might use it.',
        'generatedAt': git_last_commit_date('src/rankHistory.js'),
        'maxObservedEventDate': max_rank_date,
        'contentHash': sha256_of_file('src/rankHistory.js'),
        'generatorVersion': (
            f"regen_rankhistory.py (untracked in git -- present on disk, no commit history, "
            f"no recoverable version)" if not git_is_tracked('regen_rankhistory.py')
            else f"regen_rankhistory.py @ {git_last_commit_hash('regen_rankhistory.py')}"
        ),
        'verificationMethod': (
            "Raw source UFC_rankings_history.csv is not present on disk, so "
            "maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in "
            "the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible "
            "proxy (the artifact cannot reflect dates its regeneration process never saw), but "
            "distinct from the direct-CSV verification used for the three modules above."
        ),
    }

    modules.update(rankings_module_entry())

    return {
        'manifestGeneratedAt': now_iso,
        'generatorScript': 'generate_source_manifest.py',
        'methodologyRef': 'research/source_integrity_audit.md',
        'modules': modules,
    }


def write_js(manifest, out_path='src/sourceManifest.js'):
    header = (
        "// AUTO-GENERATED by generate_source_manifest.py -- do not hand-edit.\n"
        "// Per-module provenance tuples for every active v2 feature-source module\n"
        "// (plus cardio/rankHistory/rankings, tracked even though they do not feed\n"
        "// MODEL_V2). maxObservedEventDate is computed by reading\n"
        "// the actual underlying source data -- never a file mtime, git commit date, or\n"
        "// in-file header comment. See research/source_integrity_audit.md for the manual\n"
        "// methodology this script automates.\n"
        "// Re-run this script whenever fightersData.js / fightHistory.js / eloModule.js /\n"
        "// cardioModule.js / rankingsData.js / rankingsHistoryData.js are regenerated,\n"        "// so the\n"
        "// manifest stays current.\n\n"
    )
    body = f"export const SOURCE_MANIFEST = {json.dumps(manifest, indent=2)};\n"
    (REPO_ROOT / out_path).write_text(header + body, encoding='utf-8')
    print(f"Wrote {out_path}")


if __name__ == '__main__':
    manifest = build_manifest()
    write_js(manifest)
    print(json.dumps(manifest, indent=2))
