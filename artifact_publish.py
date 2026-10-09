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
* A publish that finds any ``.staged`` or ``.rollback`` file beside one of its
  targets refuses before writing anything (UnresolvedPublishError). Those files
  are the only copy of the previous generation after an interrupted publish;
  retrying over them would overwrite a ``.rollback`` with an already-replaced
  target. Recovery is a deliberate manual step: docs/FEED_INTEGRITY.md
  section 4, "Recovering from an interrupted publish".

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


class UnresolvedPublishError(PublishError):
    """Leftovers of an earlier interrupted publish exist; nothing was touched."""


def unresolved_leftovers(paths):
    """Every ``.staged``/``.rollback`` file beside one of ``paths``, sorted."""
    found = []
    for path in paths:
        path = Path(path)
        for suffix in (STAGED_SUFFIX, ROLLBACK_SUFFIX):
            candidate = path.with_name(path.name + suffix)
            if os.path.lexists(candidate):
                found.append(str(candidate))
    return sorted(found)


def publish_artifacts(outputs):
    """Write ``outputs`` ({path: text}) as a set, restoring the old set on failure.

    Order matters: the caller lists the generation record last, so a crash
    mid-publish leaves a record that does not describe the files beside it.
    """
    items = [(Path(path), text) for path, text in outputs.items()]
    # Refuse BEFORE writing anything: a leftover .rollback may be the only copy
    # of a target an interrupted publish already replaced.
    leftovers = unresolved_leftovers(path for path, _ in items)
    if leftovers:
        raise UnresolvedPublishError(
            'an earlier publish was interrupted and left recovery files; nothing was '
            'written. Restore or discard them by hand (docs/FEED_INTEGRITY.md, '
            '"Recovering from an interrupted publish"), then re-run: ' + ', '.join(leftovers))
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

    # A target joins `attempted` BEFORE its replacement is tried, so an
    # exception raised after os.replace() has already moved the new file into
    # place (an interrupt landing just after the call, say) still rolls that
    # target back. Restoring a target whose replacement never happened is
    # harmless: its .rollback copy is the file already there, and a new target
    # that was never created has nothing to delete.
    attempted = []
    try:
        for tmp, path in staged:
            attempted.append(path)
            _replace(tmp, path)
    except BaseException as exc:
        restore_errors = []
        for path in reversed(attempted):
            try:
                if backups[path] is not None:
                    os.replace(backups[path], path)
                    backups[path] = None
                else:
                    path.unlink(missing_ok=True)
            except BaseException as restore_exc:  # keep the .rollback copy for a manual restore
                restore_errors.append(f'{path}: {restore_exc!r}')
        _discard(tmp for tmp, _ in staged)
        if not restore_errors:
            _discard(b for b in backups.values() if b is not None)
        detail = (f'; ROLLBACK INCOMPLETE, restore by hand from *{ROLLBACK_SUFFIX}: '
                  + '; '.join(restore_errors)) if restore_errors else '; previous artifacts restored'
        raise PublishError(f'publishing {len(staged)} artifacts failed at '
                           f'{len(attempted)} of {len(staged)} ({exc!r}){detail}') from exc
    _discard(b for b in backups.values() if b is not None)


def _discard(paths):
    for path in paths:
        try:
            Path(path).unlink(missing_ok=True)
        except OSError:
            pass
