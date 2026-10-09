#!/usr/bin/env python3
"""Recover the artifact set after an interrupted publish, from a verified commit.

    python scripts/recover_artifact_set.py --commit <known-good commit>

After an interrupted publish the files on disk cannot say which generation
they belong to: a target with no `.rollback` may have been created by the
publish, may have been restored already (a successful restore consumes its
backup), or may never have been backed up (an interruption while backups were
being made). So this tool never infers the original state and never deletes
anything. It:

1. resolves --commit and refuses unless the whole artifact and provenance set
   (verify_artifact_set.ARTIFACT_SET) in that commit passes the verifier;
2. preserves the current state in .publish-recovery/<time>-<commit>/:
   a copy of every set file in the working tree, the staged copy of every set
   file whose index entry differs from the commit, and every `.staged` /
   `.rollback` leftover (moved there, so publishing is unblocked);
3. restores the whole set, working tree AND index, from the commit
   (`git restore --source=<commit> --staged --worktree`), so staged changes
   cannot survive into the next bot commit;
4. re-runs the verifier on the working tree and on the index.

Exit 0 = recovered and consistent; 1 = restored but not consistent; 2 = refused
(nothing changed). stdlib only; needs git.
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import verify_artifact_set as vas  # noqa: E402

RECOVERY_DIR = '.publish-recovery'


class Refused(Exception):
    """Recovery refused; nothing on disk or in the index was changed."""


def _git(root, *args, check=True):
    result = subprocess.run(['git', *args], cwd=root, capture_output=True)
    if check and result.returncode != 0:
        raise Refused(f"git {' '.join(args)} failed: {result.stderr.decode().strip()}")
    return result


def _blob(root, spec):
    result = _git(root, 'show', spec, check=False)
    return result.stdout if result.returncode == 0 else None


def recover(root, commit, now=None):
    """Restore the set from `commit`. Returns (quarantine dir, problems after)."""
    root = Path(root)
    resolved = _git(root, 'rev-parse', '--verify', '--quiet', f'{commit}^{{commit}}', check=False)
    if resolved.returncode != 0:
        raise Refused(f'{commit!r} is not a commit in this repository')
    sha = resolved.stdout.decode().strip()
    problems, _ = vas.verify(root, commit=sha)
    if problems:
        raise Refused(f'commit {sha} is not a consistent artifact set:\n  ' + '\n  '.join(problems))

    stamp = (now or datetime.now(timezone.utc)).strftime('%Y%m%dT%H%M%SZ')
    quarantine = root / RECOVERY_DIR / f'{stamp}-{sha[:12]}'
    if quarantine.exists():
        raise Refused(f'{quarantine} already exists')

    saved_worktree, saved_index, leftovers = [], [], []
    for rel in vas.ARTIFACT_SET:
        if (root / rel).is_file():
            saved_worktree.append(rel)
        staged = _blob(root, f':{rel}')
        if staged is not None and staged != _blob(root, f'{sha}:{rel}'):
            saved_index.append((rel, staged))
        for suffix in vas.LEFTOVER_SUFFIXES:
            if os.path.lexists(root / (rel + suffix)):
                leftovers.append(rel + suffix)

    # Preserve first, all of it, before anything is moved or restored.
    quarantine.mkdir(parents=True)
    (quarantine / 'RECOVERY.json').write_text(json.dumps({
        'recoveredFrom': sha,
        'at': stamp,
        'workingTreeCopies': saved_worktree,
        'stagedCopies': [rel for rel, _ in saved_index],
        'leftoversMoved': leftovers,
    }, indent=2) + '\n')
    for rel in saved_worktree:
        dest = quarantine / 'worktree' / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(root / rel, dest)
    for rel, staged in saved_index:
        dest = quarantine / 'index' / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(staged)
    for rel in leftovers:
        dest = quarantine / 'leftovers' / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        os.replace(root / rel, dest)

    _git(root, 'restore', f'--source={sha}', '--staged', '--worktree', '--', *vas.ARTIFACT_SET)
    after = [f'working tree: {p}' for p in vas.verify(root)[0]]
    after += [f'index: {p}' for p in vas.verify(root, index=True)[0]]
    return quarantine, after


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    parser.add_argument('--commit', required=True,
                        help='known-good commit to restore the artifact set from (e.g. HEAD)')
    parser.add_argument('--root', default=str(vas.ROOT))
    args = parser.parse_args(argv)
    try:
        quarantine, problems = recover(args.root, args.commit)
    except Refused as exc:
        print(f'Recovery REFUSED, nothing changed: {exc}', file=sys.stderr)
        return 2
    print(f'Previous state preserved in {quarantine}')
    if problems:
        print('Restored, but the set is still INCONSISTENT:', file=sys.stderr)
        for problem in problems:
            print(f'  {problem}', file=sys.stderr)
        return 1
    print(f'Artifact set restored from {args.commit}; working tree and index are consistent')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
