#!/usr/bin/env python3
"""Verify that the generated data artifacts form one consistent generation.

    python scripts/verify_artifact_set.py           # working tree (CI, tests, local)
    python scripts/verify_artifact_set.py --index   # the staged git index (bot commit)

Checks
------
0. The mandatory contract (REQUIRED_OUTPUTS, REQUIRED_MODULES, MODULE_INPUTS,
   SNAPSHOT_INPUTS) comes first and is defined here, not by the documents
   being checked: every metadata document must be a JSON object, and every
   required file, output digest, module, content hash, input list and
   provenance field must exist with the right type. null, a scalar, a list, an
   empty digest or a jointly shortened input list is a failure, not a smaller
   set. Every required file is read whatever its metadata says.
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
from datetime import datetime
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
SNAPSHOT_INPUTS = ('ufc_fight_results.csv', 'ufc_event_details.csv', 'ufc_fight_details.csv',
                   'ufc_fight_stats.csv', 'ufc_fighter_tott.csv')
# The reviewed lineage of each Greco-backed module, independent of the manifest
# being checked: its sourceInputs and its inputSha256 must both be exactly this
# set, so shortening the two together is still a failure. Mirrors
# generate_source_manifest.py; changing either is a reviewed code change.
MODULE_INPUTS = {
    'fightHistory': ('ufc_fight_results.csv', 'ufc_event_details.csv', 'ufc_fight_details.csv'),
    'fightersDataAggregates': ('ufc_fight_results.csv', 'ufc_event_details.csv',
                               'ufc_fight_details.csv', 'ufc_fight_stats.csv'),
    'elo': ('ufc_fight_results.csv', 'ufc_event_details.csv'),
}
UPSTREAM_REPOSITORY = 'Greco1899/scrape_ufc_stats'
_SHA256 = re.compile(r'[0-9a-f]{64}')
_REVISION = re.compile(r'[0-9a-f]{40}')


def is_sha256(value):
    return isinstance(value, str) and bool(_SHA256.fullmatch(value))


def is_revision(value):
    return isinstance(value, str) and bool(_REVISION.fullmatch(value))


def is_timestamp(value):
    """An ISO-8601 commit time with a UTC offset, as record_source_snapshot.py writes it."""
    if not isinstance(value, str):
        return False
    try:
        return datetime.fromisoformat(value).tzinfo is not None
    except ValueError:
        return False


def type_name(value):
    return 'null' if value is None else type(value).__name__


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

    def document(rel, parse=json.loads):
        """The parsed document if it is a JSON object, else None with the reason recorded.

        None here always comes with a problem: a file that parses to null, a
        number, a string or a list is reported, never mistaken for "absent".
        """
        raw = read(rel)
        if raw is None:
            return None
        try:
            value = parse(raw)
        except ValueError as exc:
            problems.append(f'{rel}: unparseable ({exc})')
            return None
        if not isinstance(value, dict):
            problems.append(f'{rel}: is {type_name(value)}, expected a JSON object')
            return None
        return value

    def mapping(owner, value, key):
        """value[key] when it is an object; otherwise record why and return {}."""
        field = value.get(key)
        if not isinstance(field, dict):
            problems.append(f'{owner}: {key} is {type_name(field)}, expected an object')
            return {}
        return field

    def expect_hash(rel, digest, owner):
        raw = read(rel, f'listed by {owner}')
        if raw is None:
            return
        actual = hashlib.sha256(raw).hexdigest()
        if actual != digest:
            problems.append(f'{rel}: sha256 {actual[:12]} is not the {digest[:12]} recorded '
                            f'by {owner} -- mixed generation or unregenerated provenance')

    generation = document(GENERATION)
    snapshot = document(SNAPSHOT)
    ledger = document(LEDGER)
    manifest = document(MANIFEST, parse_manifest)

    # 1. Contract: every mandatory document, entry and field exists with the
    #    right type, judged against the constants above rather than against
    #    what the documents themselves declare.
    snap_files = {}
    if snapshot is not None:
        if snapshot.get('repository') != UPSTREAM_REPOSITORY:
            problems.append(f'{SNAPSHOT}: repository is {snapshot.get("repository")!r}, '
                            f'expected {UPSTREAM_REPOSITORY!r}')
        if not is_revision(snapshot.get('revision')):
            problems.append(f'{SNAPSHOT}: revision is not a full commit SHA')
        if not is_timestamp(snapshot.get('revisionCommittedAt')):
            problems.append(f'{SNAPSHOT}: revisionCommittedAt missing or not an ISO-8601 time')
        snap_files = mapping(SNAPSHOT, snapshot, 'files')
        for name in SNAPSHOT_INPUTS:
            entry = snap_files.get(name)
            if not (isinstance(entry, dict) and is_sha256(entry.get('sha256'))):
                problems.append(f'{SNAPSHOT}: no sha256 pinned for {name}')

    outputs = {}
    if generation is not None:
        outputs = mapping(GENERATION, generation, 'outputs')
        if sorted(outputs) != sorted(REQUIRED_OUTPUTS):
            problems.append(f'{GENERATION}: outputs {sorted(outputs)} are not the required '
                            f'{sorted(REQUIRED_OUTPUTS)}')
        for key in ('generator', 'sourceRepository'):
            if not (isinstance(generation.get(key), str) and generation[key]):
                problems.append(f'{GENERATION}: {key} missing')
        if not is_revision(generation.get('sourceRevision')):
            problems.append(f'{GENERATION}: sourceRevision is not a full commit SHA')
        if generation.get('sourceRepository') != UPSTREAM_REPOSITORY:
            problems.append(f'{GENERATION}: sourceRepository is not {UPSTREAM_REPOSITORY!r}')

    if ledger is not None:
        if not is_revision(ledger.get('revision')):
            problems.append(f'{LEDGER}: revision is not a full commit SHA')
        if not isinstance(ledger.get('fights'), dict) or not ledger['fights']:
            problems.append(f'{LEDGER}: no fights table')

    modules = {}
    if manifest is not None:
        modules = mapping(MANIFEST, manifest, 'modules')
    for name, rel in REQUIRED_MODULES.items():
        if manifest is None:
            break                                   # already reported
        module = modules.get(name)
        if not isinstance(module, dict):
            problems.append(f'{MANIFEST}: required module {name} missing'
                            + ('' if module is None else f' (is {type_name(module)})'))
            modules[name] = {}
            continue
        if module.get('file') != rel:
            problems.append(f'{MANIFEST} ({name}): file is {module.get("file")!r}, expected {rel!r}')
        if not is_sha256(module.get('contentHash')):
            problems.append(f'{MANIFEST} ({name}): contentHash missing or malformed')
    for name, contract in MODULE_INPUTS.items():
        if manifest is None:
            break
        module = modules.get(name) or {}
        expected = sorted(contract)
        inputs = module.get('sourceInputs')
        if not (isinstance(inputs, list) and sorted(map(str, inputs)) == expected
                and len(inputs) == len(contract)):
            problems.append(f'{MANIFEST} ({name}): sourceInputs {inputs!r} are not the reviewed '
                            f'inputs {expected}')
        pinned = module.get('sourceSnapshot')
        if not isinstance(pinned, dict):
            problems.append(f'{MANIFEST} ({name}): no sourceSnapshot -- provenance not regenerated')
            continue
        owner = f'{MANIFEST} ({name}) sourceSnapshot'
        if pinned.get('repository') != UPSTREAM_REPOSITORY:
            problems.append(f'{owner}: repository is {pinned.get("repository")!r}')
        if not is_revision(pinned.get('revision')):
            problems.append(f'{owner}: revision is not a full commit SHA')
        if not is_timestamp(pinned.get('revisionCommittedAt')):
            problems.append(f'{owner}: revisionCommittedAt missing or not an ISO-8601 time')
        if snapshot is not None:
            for key in ('repository', 'revision', 'revisionCommittedAt'):
                if pinned.get(key) != snapshot.get(key):
                    problems.append(f'{owner}.{key} {str(pinned.get(key))[:40]!r} is not the '
                                    f'snapshot\'s')
        recorded = mapping(owner, pinned, 'inputSha256')
        if sorted(recorded) != expected:
            problems.append(f'{owner}: inputSha256 covers {sorted(recorded)}, expected the '
                            f'reviewed inputs {expected}')
        for file in sorted(set(recorded) | set(contract)):
            digest = recorded.get(file)
            pinned_digest = (snap_files.get(file) or {}).get('sha256') \
                if isinstance(snap_files.get(file), dict) else None
            if not is_sha256(digest) or digest != pinned_digest:
                problems.append(f'{owner}: inputSha256[{file}] is not the {SNAPSHOT} hash')

    # 2. Hashes. Every required file is read whatever the metadata says; a
    #    missing, empty or malformed digest is a failure, never a presence check.
    for rel in REQUIRED_OUTPUTS:
        digest = outputs.get(rel)
        if is_sha256(digest):
            expect_hash(rel, digest, GENERATION)
        else:
            if generation is not None and rel in outputs:
                problems.append(f'{GENERATION}: outputs[{rel}] is {digest!r}, expected a SHA-256')
            read(rel)
    for name, rel in REQUIRED_MODULES.items():
        digest = (modules.get(name) or {}).get('contentHash')
        if is_sha256(digest):
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
    for name in MODULE_INPUTS:
        pinned = (modules.get(name) or {}).get('sourceSnapshot')
        if isinstance(pinned, dict):
            revisions[f'{MANIFEST} ({name})'] = pinned.get('revision')
    if len(set(map(str, revisions.values()))) > 1:
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
