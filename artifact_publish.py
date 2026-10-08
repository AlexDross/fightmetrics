"""Publish a set of generated artifacts with rollback.

What this guarantees, and what it does not
------------------------------------------
* Nothing is written until every output has been computed and validated by the
  caller; this module is only ever handed a finished set.
* Every output is first written in full to ``<path>.staged`` beside its target.
  A failure while staging touches no published file.
* The existing version of each target is copied to ``<path>.rollback`` before
  any target is replaced. Targets are then replaced one at a time with
  os.replace, which is atomic per file. If any replacement fails, every target
  already replaced is restored from its rollback copy -- or deleted, if it did
  not exist before -- and the original error is re-raised.
* It is NOT a filesystem transaction. A process kill or power loss between two
  replacements, or during the rollback itself, can leave a mixed set on disk.
  That state is detected rather than prevented: artifact_generation.json is
  published last and records the SHA-256 of every other output, so
  scripts/verify_artifact_set.py (run in CI, before every bot commit, and by
  the test suite) fails on any file that does not belong to the recorded
  generation. Leftover ``.staged``/``.rollback`` files are also reported there.

The Git commit made by the scheduled workflow is a separate guarantee: see
scripts/verify_artifact_set.py --index.
"""

import os
import shutil
from pathlib import Path

STAGED_SUFFIX = '.staged'
ROLLBACK_SUFFIX = '.rollback'

# Indirection so tests can inject a failure at any replacement position.
_replace = os.replace


class PublishError(RuntimeError):
    """A replacement failed; the previous artifact set was restored."""


def publish_artifacts(outputs):
    """Write ``outputs`` ({path: text}) as a set, restoring the old set on failure.

    Order matters: the caller lists the generation record last, so a crash
    mid-publish leaves a record that does not describe the files beside it.
    """
    items = [(Path(path), text) for path, text in outputs.items()]
    staged, backups = [], {}
    try:
        for path, text in items:
            tmp = path.with_name(path.name + STAGED_SUFFIX)
            tmp.write_text(text, encoding='utf-8')
            staged.append((tmp, path))
        for path, _ in items:
            if path.exists():
                backup = path.with_name(path.name + ROLLBACK_SUFFIX)
                shutil.copy2(path, backup)
                backups[path] = backup
            else:
                backups[path] = None
    except BaseException:
        _discard(tmp for tmp, _ in staged)
        _discard(b for b in backups.values() if b is not None)
        raise

    replaced = []
    try:
        for tmp, path in staged:
            _replace(tmp, path)
            replaced.append(path)
    except BaseException as exc:
        restore_errors = []
        for path in reversed(replaced):
            try:
                if backups[path] is not None:
                    os.replace(backups[path], path)
                    backups[path] = None
                else:
                    path.unlink(missing_ok=True)
            except OSError as restore_exc:  # leave the .rollback copy in place
                restore_errors.append(f'{path}: {restore_exc}')
        _discard(tmp for tmp, path in staged if path not in replaced)
        _discard(b for b in backups.values() if b is not None and not restore_errors)
        detail = (f'; ROLLBACK INCOMPLETE, restore by hand from *{ROLLBACK_SUFFIX}: '
                  + '; '.join(restore_errors)) if restore_errors else '; previous artifacts restored'
        raise PublishError(f'publishing {len(staged)} artifacts failed at '
                           f'{len(replaced) + 1} of {len(staged)} ({exc}){detail}') from exc
    _discard(b for b in backups.values() if b is not None)


def _discard(paths):
    for path in paths:
        try:
            Path(path).unlink(missing_ok=True)
        except OSError:
            pass
