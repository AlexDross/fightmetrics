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

Two different questions are recorded per module and must not be conflated:
sourceInputs is the artifact's data lineage -- the files whose contents can
actually appear in it -- while generatorRequiredInputs is what the generating
script refuses to run without. update_fighters.py requires all four Greco CSVs
to execute, but only fightersData.js aggregates read the round-stat file;
fightHistory.js never does.

maxObservedEventDate methodology mirrors research/source_integrity_audit.md's
manual approach:
  - fightHistory: results, event details and fight details. Round stats are
    not part of its lineage.
  - fightersData aggregates: all four Greco inputs; the round-stat file feeds
    every rate statistic.
  - elo: results and event details only.
    For all three, maxObservedEventDate is the maximum DATE value actually
    parseable in ufc_event_details.csv, verified against the CSVs, not any
    script's run date or in-file comment -- and only ever recomputed by a run
    that regenerated the artifact itself.
  - rankHistory: its raw source CSV (UFC_rankings_history.csv) is not present
    on disk. Falls back to the maximum YYYYMMDD date literally embedded in the
    shipped rankHistory.js artifact itself -- a defensible proxy for "latest
    date this artifact could possibly reflect," clearly labeled as such.
  - cardio: no generator script exists in the repo and no per-fighter date is
    embedded in the shipped artifact. Recorded as indeterminate with an
    explicit note; not a silent gap.
  - fighterBirthdates: birth dates are not event-scoped, so maxObservedEventDate
    is null BY NATURE rather than by omission. Its freshness question is
    coverage, so the join is recomputed here directly from fighters.json +
    name_aliases.json and the measured counts are recorded, along with a stale
    warning if the shipped artifact disagrees with what the sources now yield.

Generation is module-scoped, because provenance is only as trustworthy as the
regeneration that produced it:

  --scope full      Regenerates every module. Requires all Greco inputs on disk
                    and fails closed without them. Use this only where the
                    Greco-backed artifacts themselves were just rebuilt.
  --scope rankings  Regenerates the two rankings modules and copies every other
                    module object through verbatim. Reads no Greco input.

The scoping is not a convenience. A rankings run downloads no fight data and
rebuilds no fight artifact, so recomputing maxObservedEventDate there would
pair an unchanged fightHistory/fightersData/elo contentHash with whatever date
happened to be in a newer feed -- asserting coverage the shipped artifact does
not contain. Emitting null instead is equally wrong in the other direction.
Preserving the last verified value is the only honest option.

Read-only against every source file it inspects. Writes only to
src/sourceManifest.js. Does not touch fightersData.js, fightHistory.js,
eloModule.js, cardioModule.js, rankHistory.js, fighterBirthdates.js, or any
prediction/model logic.
"""

import argparse
import csv
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent

# Modules whose maxObservedEventDate is read out of the Greco event feed. Only
# a run that actually regenerated these artifacts may recompute their dates.
GRECO_BACKED_MODULES = ('fightHistory', 'fightersDataAggregates', 'elo')

# Modules produced by scripts/update_rankings.py, the only ones a rankings run
# is entitled to rewrite.
RANKINGS_MODULES = ('rankings', 'rankingsHistory')


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


def load_existing_manifest(path='src/sourceManifest.js'):
    """Read the currently shipped manifest so a scoped run can preserve it."""
    p = REPO_ROOT / path
    if not p.exists():
        raise SystemExit(
            f'FATAL: {path} does not exist, so a scoped regeneration has no '
            'verified provenance to preserve. Run --scope full first.'
        )
    match = re.search(
        r'export const SOURCE_MANIFEST = (\{.*\});\n', p.read_text(encoding='utf-8'), re.S
    )
    if not match:
        raise SystemExit(f'FATAL: could not parse SOURCE_MANIFEST out of {path}.')
    manifest = json.loads(match.group(1))
    if not isinstance(manifest.get('modules'), dict):
        raise SystemExit(f'FATAL: {path} has no modules object to preserve.')
    return manifest


def max_event_date_in_csv(csv_path, input_root=None):
    """Parses ufc_event_details.csv's DATE column ('Month D, YYYY' format) and
    returns the maximum date as an ISO string.

    A missing input is fatal, never null.  This field is the manifest's only
    claim about how current the generated aggregates are; emitting
    maxObservedEventDate: null when the CSV is simply absent produced a
    manifest that looked authoritative while asserting nothing, which is how
    stale aggregates went unnoticed in the first place.

    Only --scope full calls this. A run that did not rebuild the Greco-backed
    artifacts must preserve their last verified date instead.
    """
    p = (Path(input_root) if input_root else REPO_ROOT) / csv_path
    if not p.exists():
        raise SystemExit(
            f"FATAL: required aggregate input is missing: {csv_path}. "
            "Refusing to emit maxObservedEventDate: null for a provenance claim "
            "that cannot be verified."
        )
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


def birthdate_source_coverage():
    """Recomputes the fighterBirthdates.js join straight from its own inputs, so
    the manifest records MEASURED coverage instead of a prose claim.

    Returns (source_rows, rows_with_valid_dob, aliases_applied, canonical_names,
    artifact_keys). canonical_names and artifact_keys must agree -- a mismatch
    means the shipped artifact is stale relative to fighters.json.
    """
    fighters_path = REPO_ROOT / 'fighters.json'
    aliases_path = REPO_ROOT / 'name_aliases.json'
    artifact_path = REPO_ROOT / 'src' / 'fighterBirthdates.js'
    if not (fighters_path.exists() and aliases_path.exists()):
        return None

    date_only = re.compile(r'^\d{4}-\d{2}-\d{2}$')
    fighters = json.loads(fighters_path.read_text(encoding='utf-8'))
    aliases = json.loads(aliases_path.read_text(encoding='utf-8'))

    canonical = {}
    source_rows = len(fighters)
    valid_dob = 0
    aliases_applied = 0
    for row in fighters:
        dob = (row or {}).get('dob') or ''
        if not date_only.match(dob):
            continue
        valid_dob += 1
        name = row.get('name')
        if name in aliases:
            aliases_applied += 1
        canonical_name = aliases.get(name, name)
        if canonical_name:
            canonical[canonical_name] = dob

    artifact_keys = None
    if artifact_path.exists():
        content = artifact_path.read_text(encoding='utf-8')
        artifact_keys = len(
            re.findall(
                r'^\s{2}"(?:[^"\\]|\\.)*":\s"\d{4}-\d{2}-\d{2}",?$',
                content,
                flags=re.MULTILINE,
            )
        )

    return source_rows, valid_dob, aliases_applied, len(canonical), artifact_keys


def event_name_present_in_csv(csv_path, needle_lower, input_root=None):
    p = (Path(input_root) if input_root else REPO_ROOT) / csv_path
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


def build_rankings_scoped_manifest(now_iso, existing=None):
    """Regenerate only the rankings modules; copy everything else verbatim.

    The rankings workflow rebuilds rankingsData.js and rankingsHistoryData.js
    and nothing else. fightHistory.js, fightersData.js and eloModule.js are
    untouched on disk, so their recorded provenance is still exactly true and
    is preserved byte-for-byte. Recomputing their maxObservedEventDate from
    whatever feed happens to be present would attach a newer coverage claim to
    an unchanged artifact.
    """
    existing = load_existing_manifest() if existing is None else existing
    modules = dict(existing['modules'])

    missing = [name for name in GRECO_BACKED_MODULES if name not in modules]
    if missing:
        raise SystemExit(
            'FATAL: the shipped manifest is missing Greco-backed modules '
            f"({', '.join(missing)}), so a rankings-scoped run has nothing "
            'verified to preserve. Run --scope full first.'
        )

    preserved = {name: modules[name] for name in modules if name not in RANKINGS_MODULES}
    modules.update(rankings_module_entry())
    for name, value in preserved.items():
        modules[name] = value

    return {
        'manifestGeneratedAt': now_iso,
        'generatorScript': 'generate_source_manifest.py',
        'lastGenerationScope': 'rankings',
        'methodologyRef': existing.get(
            'methodologyRef', 'research/source_integrity_audit.md'
        ),
        'modules': modules,
    }


def build_manifest(scope='full', input_root=None, existing=None):
    now_iso = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    if scope == 'rankings':
        return build_rankings_scoped_manifest(now_iso, existing=existing)
    if scope != 'full':
        raise SystemExit(f"FATAL: unknown manifest scope {scope!r}.")

    max_event_date, n_event_rows = max_event_date_in_csv(
        'ufc_event_details.csv', input_root=input_root
    )

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
    aggregate_inputs = [
        'ufc_fight_results.csv',
        'ufc_event_details.csv',
        'ufc_fight_details.csv',
        'ufc_fight_stats.csv',
    ]
    # Every aggregate input must be present before any provenance is claimed.
    # A silently absent CSV downgrades the cross-check to "zero matches" and the
    # date to null, both of which read as a clean bill of health.
    input_base = Path(input_root) if input_root else REPO_ROOT
    absent_inputs = [name for name in aggregate_inputs if not (input_base / name).exists()]
    if absent_inputs:
        raise SystemExit(
            'FATAL: required aggregate inputs are missing: '
            f"{', '.join(absent_inputs)}. Provenance cannot be asserted for "
            'artifacts whose sources are not on disk.'
        )

    fight_csvs = [name for name in aggregate_inputs if name != 'ufc_event_details.csv']
    any_window_hit = False
    for csvf in fight_csvs:
        for name in window_event_names:
            if event_name_present_in_csv(csvf, name, input_root=input_root):
                any_window_hit = True

    # Data lineage per artifact -- the files whose contents can actually appear
    # in it. Distinct from generatorRequiredInputs below, which is what the
    # script refuses to start without.
    history_inputs = [
        'ufc_fight_results.csv',
        'ufc_event_details.csv',
        'ufc_fight_details.csv',
    ]
    elo_inputs = ['ufc_fight_results.csv', 'ufc_event_details.csv']

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
        # Lineage, not prerequisites: fightHistory.js never reads round stats.
        'sourceInputs': history_inputs,
        'generatorRequiredInputs': aggregate_inputs,
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
        # All four: the round-stat file feeds every rate statistic here.
        'sourceInputs': aggregate_inputs,
        'generatorRequiredInputs': aggregate_inputs,
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
        'sourceInputs': elo_inputs,
        'generatorRequiredInputs': elo_inputs,
        'generatorVersion': (
            f"regen_elo.py @ {git_last_commit_hash('regen_elo.py')}"
            if git_is_tracked('regen_elo.py') else 'unavailable'
        ),
        'verificationMethod': (
            greco_verification_note +
            " NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- "
            "this is misleading relative to the verified underlying data and should not be trusted; "
            "regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, "
            "the fighter aggregate updater also requires ufc_fight_details.csv and "
            "ufc_fight_stats.csv."
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

    coverage = birthdate_source_coverage()
    if coverage:
        src_rows, valid_dob, aliased, canonical_n, artifact_n = coverage
        stale_warning = (
            ''
            if artifact_n == canonical_n
            else (
                f" WARNING: the shipped artifact holds {artifact_n} entries but fighters.json "
                f"currently yields {canonical_n} -- the artifact is STALE. Re-run "
                "scripts/generate-fighter-birthdates.mjs."
            )
        )
        birthdate_verification = (
            f"Recomputed the join from source while writing this manifest: read {src_rows} rows "
            f"from fighters.json, of which {valid_dob} carry a dob matching ^\\d{{4}}-\\d{{2}}-\\d{{2}}$; "
            f"applied {aliased} name_aliases.json rewrites; produced {canonical_n} canonical "
            f"names, and the shipped artifact contains {artifact_n} entries. "
            "The generator raises on any canonical name that would receive two DIFFERENT birth "
            "dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not "
            "localeCompare), making regeneration byte-identical across machines and ICU builds; "
            "the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is "
            "null by nature, not by omission: this artifact holds birth dates, which are not "
            "event-scoped, so there is no event date it could be current or stale relative to. "
            "Its freshness question is coverage, which is the measured count above."
            + stale_warning
        )
    else:
        birthdate_verification = (
            "INDETERMINATE: fighters.json and/or name_aliases.json were not present on disk when "
            "this manifest was generated, so the join could not be recomputed and coverage could "
            "not be measured. The contentHash below still identifies the shipped artifact exactly."
        )

    modules['fighterBirthdates'] = {
        'file': 'src/fighterBirthdates.js',
        'feedsV2': True,
        'note': "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the "
                 "v1 age differential/age-decay penalty via src/domain/age, which derives every "
                 "age from DOB -- at app load for the roster, and at the bout date for a "
                 "prediction. The integer AGE values in fightersData.js are now used only where "
                 "no birth date exists here.",
        'generatedAt': git_last_commit_date('src/fighterBirthdates.js'),
        'maxObservedEventDate': None,
        'contentHash': sha256_of_file('src/fighterBirthdates.js'),
        'generatorVersion': (
            f"scripts/generate-fighter-birthdates.mjs @ "
            f"{git_last_commit_hash('scripts/generate-fighter-birthdates.mjs')}"
            if git_is_tracked('scripts/generate-fighter-birthdates.mjs')
            else 'scripts/generate-fighter-birthdates.mjs (working tree version -- not yet committed)'
        ),
        'verificationMethod': birthdate_verification,
    }

    modules.update(rankings_module_entry())

    return {
        'manifestGeneratedAt': now_iso,
        'generatorScript': 'generate_source_manifest.py',
        'lastGenerationScope': 'full',
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
        "// cardioModule.js / rankingsData.js / rankingsHistoryData.js /\n"
        "// fighterBirthdates.js are regenerated, so the manifest stays current.\n"
        "// Use --scope rankings when only the rankings artifacts were rebuilt: it\n"
        "// preserves every other module's verified provenance instead of re-deriving\n"
        "// dates for artifacts this run did not regenerate.\n"
        "// fighterBirthdates.js must be regenerated BEFORE this script runs, or its\n"
        "// recorded contentHash describes the previous artifact. maxObservedEventDate\n"
        "// is null for fighterBirthdates because birth dates are not event-scoped --\n"
        "// measured coverage is the freshness signal there instead.\n\n"
    )
    body = f"export const SOURCE_MANIFEST = {json.dumps(manifest, indent=2)};\n"
    (REPO_ROOT / out_path).write_text(header + body, encoding='utf-8')
    print(f"Wrote {out_path}")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        '--scope', choices=('full', 'rankings'), default='full',
        help=(
            'full: regenerate every module, requires all Greco inputs. '
            'rankings: regenerate only the rankings modules and preserve every '
            'other module object verbatim (reads no Greco input).'
        ),
    )
    parser.add_argument(
        '--out', default='src/sourceManifest.js',
        help='Output path, relative to the repo root.',
    )
    args = parser.parse_args(argv)
    manifest = build_manifest(scope=args.scope)
    write_js(manifest, out_path=args.out)
    print(json.dumps(manifest, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
