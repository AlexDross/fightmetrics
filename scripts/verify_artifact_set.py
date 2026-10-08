#!/usr/bin/env python3
"""Verify that the generated data artifacts form one consistent generation.

    python scripts/verify_artifact_set.py           # working tree (CI, tests, local)
    python scripts/verify_artifact_set.py --index   # the staged git index (bot commit)

Checks
------
1. artifact_generation.json lists the SHA-256 of every update_fighters.py
   output; each listed file must match. A crash between two file replacements
   (artifact_publish.py) leaves a file from another generation, which fails here.
2. src/sourceManifest.js lists a contentHash for every tracked data module
   (fight history, roster, Elo, birth dates, cardio, rankings); each must match.
3. source_snapshot.json, source_ledger.json, artifact_generation.json and every
   Greco-backed manifest module must name the same upstream revision.
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
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GENERATION = 'artifact_generation.json'
SNAPSHOT = 'source_snapshot.json'
LEDGER = 'source_ledger.json'
MANIFEST = 'src/sourceManifest.js'
GRECO_MODULES = ('fightHistory', 'fightersDataAggregates', 'elo')
LEFTOVER_SUFFIXES = ('.staged', '.rollback')


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

    def load_json(rel):
        raw = reader.bytes(rel)
        if raw is None:
            problems.append(f'{rel}: missing')
            return None
        checked[rel] = raw
        return json.loads(raw)

    def expect_hash(rel, digest, owner):
        raw = reader.bytes(rel)
        if raw is None:
            problems.append(f'{rel}: missing (listed by {owner})')
            return
        checked[rel] = raw
        actual = hashlib.sha256(raw).hexdigest()
        if actual != digest:
            problems.append(f'{rel}: sha256 {actual[:12]} is not the {digest[:12]} recorded '
                            f'by {owner} -- mixed generation or unregenerated provenance')

    generation = load_json(GENERATION)
    snapshot = load_json(SNAPSHOT)
    manifest_raw = reader.bytes(MANIFEST)
    if manifest_raw is None:
        problems.append(f'{MANIFEST}: missing')
        manifest = None
    else:
        checked[MANIFEST] = manifest_raw
        manifest = parse_manifest(manifest_raw)

    if generation:
        for rel, digest in sorted(generation.get('outputs', {}).items()):
            expect_hash(rel, digest, GENERATION)
    if manifest:
        for name, module in sorted(manifest.get('modules', {}).items()):
            if module.get('file') and module.get('contentHash'):
                expect_hash(module['file'], module['contentHash'], f'{MANIFEST} ({name})')

    revisions = {}
    if snapshot:
        revisions[SNAPSHOT] = snapshot.get('revision')
    if generation:
        revisions[GENERATION] = generation.get('sourceRevision')
    ledger_raw = checked.get(LEDGER)
    if ledger_raw is not None:
        revisions[LEDGER] = json.loads(ledger_raw).get('revision')
    if manifest:
        for name in GRECO_MODULES:
            pinned = manifest.get('modules', {}).get(name, {}).get('sourceSnapshot')
            if not pinned:
                problems.append(f'{MANIFEST} ({name}): no sourceSnapshot -- provenance not regenerated')
            else:
                revisions[f'{MANIFEST} ({name})'] = pinned.get('revision')
    if len(set(revisions.values())) > 1:
        problems.append('upstream revision disagrees: ' + ', '.join(
            f'{k}={str(v)[:12]}' for k, v in sorted(revisions.items())))

    if index:
        for rel in sorted(checked):
            if reader.worktree_bytes(rel) != checked[rel]:
                problems.append(f'{rel}: working tree differs from the staged copy (not git-added?)')
    for rel in sorted(checked):
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
