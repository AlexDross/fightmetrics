#!/usr/bin/env python3
"""Verify that the generated data artifacts form one consistent generation.

    python scripts/verify_artifact_set.py           # working tree (CI, tests, local)
    python scripts/verify_artifact_set.py --index   # the staged git index (bot commit)

Checks
------
0. The mandatory contract (REQUIRED_OUTPUTS, REQUIRED_MODULES, GRECO_MODULES)
   comes first: every required file, output entry, module, hash and
   provenance field must exist. Deleting a file together with its metadata
   entry is a failure, not a smaller set.
1. artifact_generation.json lists the SHA-256 of every update_fighters.py
   output; each listed file must match. A crash between two file replacements
   (artifact_publish.py) leaves a file from another generation, which fails here.
2. src/sourceManifest.js lists a contentHash for every tracked data module
   (fight history, roster, Elo, birth dates, cardio, rankings); each must match.
3. source_snapshot.json, source_ledger.json, artifact_generation.json and every
   Greco-backed manifest module must name the same upstream revision, and each
   module's recorded input hashes must be the snapshot's.
4. No *.staged / *.rollback leftovers from an interrupted publish.

--index reads every file from the staged index instead of the working tree and
also fails when a working-tree artifact differs from its staged copy. That is
what catches an artifact the commit step forgot to `git add`: the regenerated
manifest is staged, so the stale staged artifact no longer matches its hash.
Stamps in the working tree alone cannot see that.

stdlib only. Exit 0 = consistent, 1 = not (every problem is listed).
"""

import argparse
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GENERATION = 'artifact_generation.json'
SNAPSHOT = 'source_snapshot.json'
LEDGER = 'source_ledger.json'
MANIFEST = 'src/sourceManifest.js'
LEFTOVER_SUFFIXES = ('.staged', '.rollback')

# ─── The mandatory contract ───────────────────────────────────────────────────
# Checked BEFORE any hash, so removing a file together with its metadata entry
# cannot make it optional. Changing these sets is a reviewed code change.

# Every output update_fighters.py publishes besides the generation record.
REQUIRED_OUTPUTS = ('fighter_profiles.json', 'source_ledger.json',
                    'src/fightHistory.js', 'src/fightersData.js')
# Every module the source manifest must describe, with its file.
REQUIRED_MODULES = {
    'fightHistory': 'src/fightHistory.js',
    'fightersDataAggregates': 'src/fightersData.js',
    'elo': 'src/eloModule.js',
    'cardio': 'src/cardioModule.js',
    'rankHistory': 'src/rankHistory.js',
    'fighterBirthdates': 'src/fighterBirthdates.js',
    'rankings': 'src/rankingsData.js',
    'rankingsHistory': 'src/rankingsHistoryData.js',
}
# Modules built from the Greco feed: each must carry the pinned snapshot, and
# its recorded input hashes must be the snapshot's.
GRECO_MODULES = ('fightHistory', 'fightersDataAggregates', 'elo')
SNAPSHOT_INPUTS = ('ufc_fight_results.csv', 'ufc_event_details.csv', 'ufc_fight_details.csv',
                   'ufc_fight_stats.csv', 'ufc_fighter_tott.csv')
_SHA256 = re.compile(r'[0-9a-f]{64}')
_REVISION = re.compile(r'[0-9a-f]{40}')


class Reader:
    def __init__(self, root, index):
        self.root, self.index = Path(root), index

    def bytes(self, rel):
        if self.index:
            result = subprocess.run(['git', 'show', f':{rel}'], cwd=self.root,
                                    capture_output=True)
            return result.stdout if result.returncode == 0 else None
        path = self.root / rel
        return path.read_bytes() if path.is_file() else None

    def worktree_bytes(self, rel):
        path = self.root / rel
        return path.read_bytes() if path.is_file() else None


def parse_manifest(raw):
    text = raw.decode('utf-8')
    start = text.index('export const SOURCE_MANIFEST = ') + len('export const SOURCE_MANIFEST = ')
    return json.loads(text[start:text.rindex(';')])


def verify(root=ROOT, index=False):
    reader = Reader(root, index)
    problems = []
    checked = {}

    def read(rel, what='required'):
        raw = reader.bytes(rel)
        if raw is None:
            problems.append(f'{rel}: missing ({what})'
                            + (' from the staged index -- not git-added?' if index else ''))
            return None
        checked[rel] = raw
        return raw

    def load_json(rel):
        raw = read(rel)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except ValueError as exc:
            problems.append(f'{rel}: not valid JSON ({exc})')
            return None

    def expect_hash(rel, digest, owner):
        raw = read(rel, f'listed by {owner}')
        if raw is None:
            return
        actual = hashlib.sha256(raw).hexdigest()
        if actual != digest:
            problems.append(f'{rel}: sha256 {actual[:12]} is not the {str(digest)[:12]} recorded '
                            f'by {owner} -- mixed generation or unregenerated provenance')

    generation = load_json(GENERATION)
    snapshot = load_json(SNAPSHOT)
    ledger = load_json(LEDGER)
    manifest_raw = read(MANIFEST)
    manifest = None
    if manifest_raw is not None:
        try:
            manifest = parse_manifest(manifest_raw)
        except ValueError as exc:
            problems.append(f'{MANIFEST}: unparseable ({exc})')

    # 1. Contract: required entries exist and are well-formed.
    snap_files = {}
    if snapshot is not None:
        if not _REVISION.fullmatch(str(snapshot.get('revision', ''))):
            problems.append(f'{SNAPSHOT}: revision is not a full commit SHA')
        snap_files = snapshot.get('files') or {}
        for name in SNAPSHOT_INPUTS:
            if not _SHA256.fullmatch(str((snap_files.get(name) or {}).get('sha256', ''))):
                problems.append(f'{SNAPSHOT}: no sha256 pinned for {name}')
    if generation is not None:
        outputs = generation.get('outputs') or {}
        if sorted(outputs) != sorted(REQUIRED_OUTPUTS):
            problems.append(f'{GENERATION}: outputs {sorted(outputs)} are not the required '
                            f'{sorted(REQUIRED_OUTPUTS)}')
        for key in ('generator', 'sourceRepository', 'sourceRevision'):
            if not generation.get(key):
                problems.append(f'{GENERATION}: {key} missing')
        if snapshot is not None and generation.get('sourceRepository') != snapshot.get('repository'):
            problems.append(f'{GENERATION}: sourceRepository is not the snapshot repository')
    modules = (manifest or {}).get('modules') or {}
    if manifest is not None:
        for name, rel in REQUIRED_MODULES.items():
            module = modules.get(name)
            if module is None:
                problems.append(f'{MANIFEST}: required module {name} missing')
                continue
            if module.get('file') != rel:
                problems.append(f'{MANIFEST} ({name}): file is {module.get("file")!r}, expected {rel!r}')
            if not _SHA256.fullmatch(str(module.get('contentHash', ''))):
                problems.append(f'{MANIFEST} ({name}): contentHash missing or malformed')
        for name in GRECO_MODULES:
            pinned = (modules.get(name) or {}).get('sourceSnapshot')
            if not pinned:
                problems.append(f'{MANIFEST} ({name}): no sourceSnapshot -- provenance not regenerated')
                continue
            if snapshot is not None:
                for key in ('repository', 'revision', 'revisionCommittedAt'):
                    if pinned.get(key) != snapshot.get(key):
                        problems.append(f'{MANIFEST} ({name}): sourceSnapshot.{key} '
                                        f'{str(pinned.get(key))[:40]!r} is not the snapshot\'s')
                recorded = pinned.get('inputSha256') or {}
                inputs = modules[name].get('sourceInputs') or []
                if not recorded or sorted(recorded) != sorted(inputs):
                    problems.append(f'{MANIFEST} ({name}): inputSha256 covers {sorted(recorded)}, '
                                    f'expected its sourceInputs {sorted(inputs)}')
                for file, digest in sorted(recorded.items()):
                    if digest != (snap_files.get(file) or {}).get('sha256'):
                        problems.append(f'{MANIFEST} ({name}): inputSha256[{file}] is not the '
                                        f'{SNAPSHOT} hash')
    if ledger is not None and not isinstance(ledger.get('fights'), dict):
        problems.append(f'{LEDGER}: no fights table')

    # 2. Hashes: every required output and module matches its recorded hash.
    if generation is not None:
        for rel in REQUIRED_OUTPUTS:
            digest = (generation.get('outputs') or {}).get(rel)
            if digest:
                expect_hash(rel, digest, GENERATION)
            else:
                read(rel)                     # still required, recorded or not
    for name, rel in REQUIRED_MODULES.items():
        digest = (modules.get(name) or {}).get('contentHash')
        if digest:
            expect_hash(rel, digest, f'{MANIFEST} ({name})')
        elif rel not in checked:
            read(rel)

    # 3. One upstream revision everywhere.
    revisions = {}
    if snapshot is not None:
        revisions[SNAPSHOT] = snapshot.get('revision')
    if generation is not None:
        revisions[GENERATION] = generation.get('sourceRevision')
    if ledger is not None:
        revisions[LEDGER] = ledger.get('revision')
    for name in GRECO_MODULES:
        pinned = (modules.get(name) or {}).get('sourceSnapshot')
        if pinned:
            revisions[f'{MANIFEST} ({name})'] = pinned.get('revision')
    if len(set(revisions.values())) > 1:
        problems.append('upstream revision disagrees: ' + ', '.join(
            f'{k}={str(v)[:12]}' for k, v in sorted(revisions.items())))

    # 4. The index must be what is on disk, and no publish may be half-done.
    if index:
        for rel in sorted(checked):
            if reader.worktree_bytes(rel) != checked[rel]:
                problems.append(f'{rel}: working tree differs from the staged copy (not git-added?)')
    for rel in sorted(set(checked) | set(REQUIRED_OUTPUTS) | {GENERATION}):
        for suffix in LEFTOVER_SUFFIXES:
            if (Path(root) / (rel + suffix)).exists():
                problems.append(f'{rel}{suffix}: leftover from an interrupted publish')
    return problems, sorted(checked)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--index', action='store_true',
                        help='verify the staged git index instead of the working tree')
    parser.add_argument('--root', default=str(ROOT))
    args = parser.parse_args(argv)
    problems, files = verify(args.root, args.index)
    where = 'staged index' if args.index else 'working tree'
    if problems:
        print(f'Artifact set INCONSISTENT ({where}):', file=sys.stderr)
        for problem in problems:
            print(f'  {problem}', file=sys.stderr)
        return 1
    print(f'Artifact set consistent ({where}): {len(files)} files, one upstream revision')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
