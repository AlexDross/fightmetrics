#!/usr/bin/env python3
"""
record_source_snapshot.py -- pin the exact upstream feed a refresh was built from.

The scheduled workflow used to download a moving branch zip of
Greco1899/scrape_ufc_stats and commit neither the revision nor any hash of the
CSVs, so a shipped refresh could only be reproduced by guessing the upstream
state at that time. This script records, in source_snapshot.json:

  - the upstream repository and the immutable commit the CSVs came from
  - per-file SHA-256, byte size and CSV record count for every input the
    fighter artifacts are generated from

Record counts are informational only. Whether the feed lost or changed fights
is decided fight by fight against source_ledger.json by update_fighters.py
(feed_validation.check_ledger_transition): a count can stay level, or grow,
while an old fight disappears.

The file carries no wall-clock timestamp, so an unchanged upstream revision
rewrites it byte-for-byte and the bot commits nothing.

stdlib only.
"""

import argparse
import csv
import hashlib
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SNAPSHOT_PATH = REPO_ROOT / 'source_snapshot.json'
UPSTREAM_REPOSITORY = 'Greco1899/scrape_ufc_stats'

# Every Greco input update_fighters.py / regen_elo.py read.
SNAPSHOT_FILES = (
    'ufc_fight_results.csv',
    'ufc_event_details.csv',
    'ufc_fight_details.csv',
    'ufc_fight_stats.csv',
    'ufc_fighter_tott.csv',
)


class SnapshotError(RuntimeError):
    """The feed on disk cannot be recorded as a valid snapshot."""


def sha256_of(path):
    digest = hashlib.sha256()
    with open(path, 'rb') as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b''):
            digest.update(chunk)
    return digest.hexdigest()


def csv_records(path):
    """Data records, not lines: quoted fields can span lines."""
    with open(path, newline='', encoding='utf-8') as handle:
        return max(sum(1 for _ in csv.reader(handle)) - 1, 0)


def describe_files(source_dir):
    source_dir = Path(source_dir)
    missing = [name for name in SNAPSHOT_FILES if not (source_dir / name).is_file()]
    if missing:
        raise SnapshotError(f"feed inputs missing from {source_dir}: {', '.join(missing)}")
    return {
        name: {
            'sha256': sha256_of(source_dir / name),
            'bytes': (source_dir / name).stat().st_size,
            'records': csv_records(source_dir / name),
        }
        for name in SNAPSHOT_FILES
    }


def build_snapshot(source_dir, revision, committed_at, repository=UPSTREAM_REPOSITORY):
    if not revision or len(revision) != 40:
        raise SnapshotError(f'upstream revision must be a full commit SHA, got {revision!r}')
    return {
        'repository': repository,
        'revision': revision,
        'revisionCommittedAt': committed_at,
        'files': describe_files(source_dir),
    }


def verify_inputs_match(snapshot, source_dir, names):
    """Raise unless each named input on disk is the one the snapshot pinned."""
    source_dir = Path(source_dir)
    for name in names:
        pinned = snapshot.get('files', {}).get(name)
        if pinned is None:
            raise SnapshotError(f'source snapshot does not pin {name}')
        actual = sha256_of(source_dir / name)
        if actual != pinned['sha256']:
            raise SnapshotError(
                f'{name} on disk (sha256 {actual[:12]}) is not the input pinned in '
                f"source_snapshot.json ({pinned['sha256'][:12]} @ {snapshot.get('revision', '?')[:12]})")


def load_snapshot(path=SNAPSHOT_PATH):
    path = Path(path)
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding='utf-8'))


def write_snapshot(snapshot, path=SNAPSHOT_PATH):
    Path(path).write_text(json.dumps(snapshot, indent=2) + '\n', encoding='utf-8')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--source-dir', default=str(REPO_ROOT),
                        help='Directory holding the downloaded CSVs.')
    parser.add_argument('--revision', required=True,
                        help='Full upstream commit SHA the CSVs were taken from.')
    parser.add_argument('--committed-at', required=True,
                        help='Upstream commit timestamp (ISO 8601).')
    parser.add_argument('--out', default=str(SNAPSHOT_PATH))
    args = parser.parse_args(argv)

    try:
        snapshot = build_snapshot(args.source_dir, args.revision, args.committed_at)
    except SnapshotError as exc:
        print(f'FATAL: {exc}', file=sys.stderr)
        return 1

    write_snapshot(snapshot, args.out)
    print(f"Pinned {snapshot['repository']} @ {snapshot['revision']} "
          f"({snapshot['revisionCommittedAt']})")
    for name, info in snapshot['files'].items():
        print(f"  {name:24s} {info['records']:>7} records  {info['sha256'][:12]}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
