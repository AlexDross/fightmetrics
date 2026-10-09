#!/usr/bin/env python3
"""scripts/recover_artifact_set.py: recovery after an interrupted publish.

Each interrupted state is produced by the production publisher
(artifact_publish.publish_artifacts) in a temporary git repository, with
failures injected the way the publisher's own tests inject them. Recovery must
end with the known-good commit's artifact set in the working tree and the
index, must never delete a target, and must keep the previous state.

NON-DESTRUCTIVE: temporary directories only. Needs git.
"""

import json
import os
import subprocess
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'scripts'))
import artifact_publish as ap  # noqa: E402
import recover_artifact_set as ras  # noqa: E402
import verify_artifact_set as vas  # noqa: E402
from test_verify_artifact_set import ArtifactRepo, git  # noqa: E402

# The publisher's targets, in the order update_fighters.py publishes them.
TARGETS = ('src/fightersData.js', 'fighter_profiles.json', 'src/fightHistory.js',
           'source_ledger.json', 'artifact_generation.json')


class FailAt:
    def __init__(self, n, exc=OSError('disk full (injected)')):
        self.n, self.calls, self.exc = n, 0, exc

    def __call__(self, src, dst):
        self.calls += 1
        if self.calls == self.n:
            raise self.exc
        os.replace(src, dst)


class Recover(ArtifactRepo):
    def setUp(self):
        super().setUp()
        self.committed = self.state()
        self.head = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=self.root, check=True,
                                   capture_output=True, text=True).stdout.strip()
        self.saved = (ap._replace, ap.os.replace, ap.shutil.copy2, ap._discard)

    def tearDown(self):
        ap._replace, ap.os.replace, ap.shutil.copy2, ap._discard = self.saved
        super().tearDown()

    # ── helpers ──
    def state(self):
        """Every file in the repository except .git, as bytes."""
        return {str(p.relative_to(self.root)): p.read_bytes()
                for p in sorted(self.root.rglob('*'))
                if p.is_file() and '.git' not in p.relative_to(self.root).parts}

    def index_blob(self, rel):
        return subprocess.run(['git', 'show', f':{rel}'], cwd=self.root,
                              capture_output=True).stdout

    def outputs(self, tag='new'):
        return {self.root / rel: f'// {tag} {rel}\n' for rel in TARGETS}

    def publish_killed(self, phase, at):
        """Run the production publisher in a child process and kill it outright
        (os._exit: no exception handler, no cleanup) at the `at`-th backup copy
        (phase='backup') or right after the `at`-th replacement (phase='replace')."""
        code = f"""
import os, sys
sys.path.insert(0, {str(Path(__file__).resolve().parent)!r})
import artifact_publish as ap
calls = [0]
def tick():
    calls[0] += 1
    if calls[0] == {at}:
        os._exit(9)
if {phase!r} == 'backup':
    real = ap.shutil.copy2
    def copy(src, dst):
        tick()
        return real(src, dst)
    ap.shutil.copy2 = copy
else:
    def replace(src, dst):
        os.replace(src, dst)
        tick()
    ap._replace = replace
ap.publish_artifacts({{os.path.join({str(self.root)!r}, rel): f'// new {{rel}}\\n' for rel in {TARGETS!r}}})
"""
        result = subprocess.run([sys.executable, '-c', code], capture_output=True)
        self.assertEqual(result.returncode, 9, result.stderr.decode())

    def restores_fail(self):
        """os.replace that fails for every rollback restore and works otherwise."""
        real = self.saved[1]

        def replace(src, dst):
            if str(src).endswith(ap.ROLLBACK_SUFFIX):
                raise OSError('restore failed (injected)')
            return real(src, dst)
        return replace

    def recover(self, commit=None):
        return ras.recover(self.root, commit or self.head)

    def assert_recovered(self, quarantine, problems):
        self.assertEqual(problems, [])
        for rel in vas.ARTIFACT_SET:
            self.assertEqual((self.root / rel).read_bytes(), self.committed[rel], rel)
            self.assertEqual(self.index_blob(rel), self.committed[rel], f'index {rel}')
            for suffix in vas.LEFTOVER_SUFFIXES:
                self.assertFalse(os.path.lexists(self.root / (rel + suffix)), rel + suffix)
        self.assertTrue((quarantine / 'RECOVERY.json').is_file())
        # Publishing is unblocked afterwards.
        ap._replace, ap.os.replace, ap.shutil.copy2, ap._discard = self.saved
        ap.publish_artifacts(self.outputs('after-recovery'))

    def preserved(self, quarantine, kind, rel):
        return (quarantine / kind / rel).read_bytes()

    # ── Codex r3 finding 1 regressions ──
    def test_partial_rollback_that_consumed_backups(self):
        # Codex's reproduction: the third replacement fails; the restores of the
        # second and first targets succeed (consuming their backups) except the
        # first, which fails.
        first, second = TARGETS[0], TARGETS[1]
        ap._replace = FailAt(3)
        real_replace = os.replace

        def restore_fails_for_first(src, dst):
            if str(src).endswith(ap.ROLLBACK_SUFFIX) and str(dst).endswith(first):
                raise OSError('restore failed (injected)')
            return real_replace(src, dst)

        ap.os.replace = restore_fails_for_first
        with self.assertRaises(ap.PublishError) as caught:
            ap.publish_artifacts(self.outputs())
        ap.os.replace = real_replace
        self.assertIn('ROLLBACK INCOMPLETE', str(caught.exception))
        # The state the old instructions misread: restored targets have no backup.
        for rel in (second, TARGETS[2]):
            self.assertFalse((self.root / (rel + ap.ROLLBACK_SUFFIX)).exists(), rel)
            self.assertEqual((self.root / rel).read_bytes(), self.committed[rel], rel)
        self.assertEqual((self.root / first).read_text(), f'// new {first}\n')

        quarantine, problems = self.recover()
        self.assert_recovered(quarantine, problems)
        self.assertEqual(self.preserved(quarantine, 'leftovers', first + ap.ROLLBACK_SUFFIX),
                         self.committed[first])
        self.assertEqual(self.preserved(quarantine, 'worktree', first),
                         f'// new {first}\n'.encode())

    def test_interruption_before_all_backups_exist(self):
        # A hard kill while backups are being made: no cleanup runs.
        self.publish_killed('backup', 3)
        backed_up = [rel for rel in TARGETS if (self.root / (rel + ap.ROLLBACK_SUFFIX)).exists()]
        self.assertEqual(backed_up, list(TARGETS[:2]))
        for rel in TARGETS:                     # targets untouched, three without a backup
            self.assertEqual((self.root / rel).read_bytes(), self.committed[rel], rel)

        quarantine, problems = self.recover()
        self.assert_recovered(quarantine, problems)
        for rel in TARGETS:
            self.assertEqual(self.preserved(quarantine, 'leftovers', rel + ap.STAGED_SUFFIX),
                             f'// new {rel}\n'.encode())

    def test_previously_absent_target(self):
        # The ledger is absent before the publish, which creates it and is then
        # killed mid-rollback (the restore of an earlier target fails).
        absent = 'source_ledger.json'
        (self.root / absent).unlink()
        ap._replace = FailAt(5)
        real_replace = os.replace

        def restore_fails(src, dst):
            if str(src).endswith(ap.ROLLBACK_SUFFIX) and str(dst).endswith(TARGETS[0]):
                raise OSError('restore failed (injected)')
            return real_replace(src, dst)

        ap.os.replace = restore_fails
        with self.assertRaises(ap.PublishError):
            ap.publish_artifacts(self.outputs())
        ap.os.replace = real_replace
        # The publisher removed the target it created; nothing marks it as new.
        self.assertFalse((self.root / absent).exists())

        quarantine, problems = self.recover()
        self.assert_recovered(quarantine, problems)
        self.assertNotIn(absent, json.loads(
            (quarantine / 'RECOVERY.json').read_text())['workingTreeCopies'])

    def test_created_target_left_behind_is_preserved_not_deleted(self):
        # Same absent target, but a hard kill lands right after it is created:
        # the new file stays, with no .rollback. Recovery keeps a copy of it.
        absent = 'source_ledger.json'
        (self.root / absent).unlink()
        self.publish_killed('replace', 4)
        self.assertEqual((self.root / absent).read_text(), f'// new {absent}\n')
        self.assertFalse((self.root / (absent + ap.ROLLBACK_SUFFIX)).exists())

        quarantine, problems = self.recover()
        self.assert_recovered(quarantine, problems)
        self.assertEqual(self.preserved(quarantine, 'worktree', absent),
                         f'// new {absent}\n'.encode())

    def test_staged_index_that_differs_from_the_recovery_commit(self):
        self.write('fighter_profiles.json', b'{"staged": "not committed"}\n')
        git(self.root, 'add', 'fighter_profiles.json')
        ap._replace = FailAt(2)
        ap.os.replace = self.restores_fail()
        with self.assertRaises(ap.PublishError):
            ap.publish_artifacts(self.outputs())
        ap.os.replace = self.saved[1]
        self.assertNotEqual(self.index_blob('fighter_profiles.json'),
                            self.committed['fighter_profiles.json'])

        quarantine, problems = self.recover()
        self.assert_recovered(quarantine, problems)
        self.assertEqual(self.preserved(quarantine, 'index', 'fighter_profiles.json'),
                         b'{"staged": "not committed"}\n')

    def test_recovery_from_an_older_known_good_commit(self):
        older = self.head
        self.generate('v2', revision='e' * 40)
        git(self.root, 'add', '-A')
        git(self.root, 'commit', '-q', '-m', 'v2')
        ap._replace = FailAt(3)
        ap.os.replace = self.restores_fail()
        with self.assertRaises(ap.PublishError):
            ap.publish_artifacts(self.outputs())
        ap.os.replace = self.saved[1]
        quarantine, problems = self.recover(older)
        self.assert_recovered(quarantine, problems)

    # ── refusals change nothing ──
    def refused_without_change(self, commit):
        self.write('src/fightHistory.js' + ap.ROLLBACK_SUFFIX, b'old\n')
        self.write('fighter_profiles.json', b'{"staged": true}\n')
        git(self.root, 'add', 'fighter_profiles.json')
        before = self.state()
        index_before = subprocess.run(['git', 'ls-files', '-s'], cwd=self.root,
                                      capture_output=True).stdout
        with self.assertRaises(ras.Refused):
            ras.recover(self.root, commit)
        self.assertEqual(self.state(), before)
        self.assertEqual(subprocess.run(['git', 'ls-files', '-s'], cwd=self.root,
                                        capture_output=True).stdout, index_before)
        self.assertFalse((self.root / ras.RECOVERY_DIR).exists())

    def test_refuses_a_commit_that_is_not_a_consistent_set(self):
        self.write('src/fightHistory.js', b'// from another run\n')
        git(self.root, 'commit', '-q', '-am', 'mixed generation')
        self.refused_without_change('HEAD')

    def test_refuses_a_commit_missing_part_of_the_set(self):
        git(self.root, 'rm', '-q', 'source_ledger.json')
        git(self.root, 'commit', '-q', '-m', 'ledger dropped')
        self.refused_without_change('HEAD')

    def test_refuses_an_unknown_commit(self):
        self.refused_without_change('0' * 40)

    def test_cli_exit_codes(self):
        self.assertEqual(ras.main(['--root', str(self.root), '--commit', '0' * 40]), 2)
        self.write('src/fightHistory.js' + ap.ROLLBACK_SUFFIX, b'old\n')
        self.assertEqual(ras.main(['--root', str(self.root), '--commit', 'HEAD']), 0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
