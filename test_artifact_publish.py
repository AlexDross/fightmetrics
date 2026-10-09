#!/usr/bin/env python3
"""artifact_publish.publish_artifacts: staged writes and rollback at every position.

NON-DESTRUCTIVE: every test works in a temporary directory. stdlib unittest.
"""

import os
import tempfile
import unittest
from pathlib import Path

import artifact_publish as ap

NAMES = ('a.js', 'b.js', 'c.json', 'generation.json')


class FailAt:
    """Replacement hook that fails on the n-th call (1-based)."""

    def __init__(self, n, exc=OSError('disk full (injected)')):
        self.n, self.calls, self.exc = n, 0, exc

    def __call__(self, src, dst):
        self.calls += 1
        if self.calls == self.n:
            raise self.exc
        os.replace(src, dst)


def snapshot(directory):
    return {p.name: p.read_bytes() for p in sorted(Path(directory).iterdir())}


class Publish(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.original_replace = ap._replace

    def tearDown(self):
        ap._replace = self.original_replace
        self.tmp.cleanup()

    def outputs(self, tag, names=NAMES):
        return {self.dir / n: f'{tag}:{n}\n' for n in names}

    def seed(self, names=NAMES):
        for n in names:
            (self.dir / n).write_text(f'old:{n}\n', encoding='utf-8')

    def test_success_replaces_every_file_and_leaves_no_leftovers(self):
        self.seed()
        ap.publish_artifacts(self.outputs('new'))
        self.assertEqual(snapshot(self.dir), {n: f'new:{n}\n'.encode() for n in NAMES})

    def test_failure_at_every_replacement_position_restores_the_old_set(self):
        for position in range(1, len(NAMES) + 1):
            with self.subTest(position=position):
                for p in self.dir.iterdir():
                    p.unlink()
                self.seed()
                before = snapshot(self.dir)
                ap._replace = FailAt(position)
                with self.assertRaises(ap.PublishError) as caught:
                    ap.publish_artifacts(self.outputs('new'))
                self.assertIn(f'failed at {position} of {len(NAMES)}', str(caught.exception))
                self.assertIn('previous artifacts restored', str(caught.exception))
                self.assertEqual(snapshot(self.dir), before)

    def test_previously_absent_targets_are_removed_on_rollback(self):
        present = NAMES[:2]                          # c.json and generation.json are new
        for position in range(1, len(NAMES) + 1):
            with self.subTest(position=position):
                for p in self.dir.iterdir():
                    p.unlink()
                self.seed(present)
                before = snapshot(self.dir)
                ap._replace = FailAt(position)
                with self.assertRaises(ap.PublishError):
                    ap.publish_artifacts(self.outputs('new'))
                self.assertEqual(snapshot(self.dir), before)
                self.assertFalse((self.dir / 'c.json').exists())

    def test_failure_while_staging_touches_no_published_file(self):
        self.seed()
        before = snapshot(self.dir)
        outputs = self.outputs('new')
        outputs[self.dir / 'absent-dir' / 'c.json'] = outputs.pop(self.dir / 'c.json')
        with self.assertRaises(OSError):                     # staging c.json cannot write
            ap.publish_artifacts(outputs)
        self.assertEqual(snapshot(self.dir), before)

    def test_incomplete_rollback_is_reported_and_keeps_the_rollback_copy(self):
        self.seed()
        ap._replace = FailAt(3)
        real_replace = os.replace

        def broken_restore(src, dst):
            if str(src).endswith(ap.ROLLBACK_SUFFIX) and Path(dst).name == 'a.js':
                raise OSError('restore failed (injected)')
            return real_replace(src, dst)

        ap.os.replace = broken_restore
        try:
            with self.assertRaises(ap.PublishError) as caught:
                ap.publish_artifacts(self.outputs('new'))
        finally:
            ap.os.replace = real_replace
        self.assertIn('ROLLBACK INCOMPLETE', str(caught.exception))
        self.assertEqual((self.dir / ('a.js' + ap.ROLLBACK_SUFFIX)).read_text(), 'old:a.js\n')
        self.assertEqual((self.dir / 'b.js').read_text(), 'old:b.js\n')

    def test_interrupt_is_rolled_back_too(self):
        self.seed()
        before = snapshot(self.dir)
        ap._replace = FailAt(2, KeyboardInterrupt())
        with self.assertRaises(ap.PublishError):
            ap.publish_artifacts(self.outputs('new'))
        self.assertEqual(snapshot(self.dir), before)


    def test_interrupt_after_a_completed_replacement_rolls_it_back(self):
        # Codex finding 6: the real os.replace runs, then the interrupt lands.
        for present in (NAMES, NAMES[:2]):           # all existing / two new targets
            for position in range(1, len(NAMES) + 1):
                with self.subTest(present=len(present), position=position):
                    for p in self.dir.iterdir():
                        p.unlink()
                    self.seed(present)
                    before = snapshot(self.dir)
                    calls = [0]

                    def replace_then_interrupt(src, dst):
                        calls[0] += 1
                        os.replace(src, dst)
                        if calls[0] == position:
                            raise KeyboardInterrupt()

                    ap._replace = replace_then_interrupt
                    with self.assertRaises(ap.PublishError) as caught:
                        ap.publish_artifacts(self.outputs('new'))
                    self.assertIn('previous artifacts restored', str(caught.exception))
                    self.assertEqual(snapshot(self.dir), before)

    def test_failed_restore_after_a_completed_replacement_keeps_every_rollback_copy(self):
        self.seed()
        calls = [0]

        def replace_then_fail(src, dst):
            calls[0] += 1
            os.replace(src, dst)
            if calls[0] == 2:
                raise OSError('failed after replacing (injected)')

        real_replace = os.replace

        def broken_restore(src, dst):
            if str(src).endswith(ap.ROLLBACK_SUFFIX) and Path(dst).name == 'b.js':
                raise OSError('restore failed (injected)')
            return real_replace(src, dst)

        ap._replace = replace_then_fail
        ap.os.replace = broken_restore
        try:
            with self.assertRaises(ap.PublishError) as caught:
                ap.publish_artifacts(self.outputs('new'))
        finally:
            ap.os.replace = real_replace
        self.assertIn('ROLLBACK INCOMPLETE', str(caught.exception))
        self.assertIn('b.js', str(caught.exception))
        # b.js holds the new content, and its old content survives as recovery material.
        self.assertEqual((self.dir / 'b.js').read_text(), 'new:b.js\n')
        self.assertEqual((self.dir / ('b.js' + ap.ROLLBACK_SUFFIX)).read_text(), 'old:b.js\n')
        self.assertEqual((self.dir / 'a.js').read_text(), 'old:a.js\n')
        for name in ('c.json', 'generation.json'):     # never replaced: untouched
            self.assertEqual((self.dir / name).read_text(), f'old:{name}\n')

    # ── Codex r2 finding 4: a retry never destroys recovery material ──
    def interrupted_state(self):
        """a.js replaced, b.js not yet, both originals still in .rollback copies."""
        self.seed()
        for n in NAMES:
            (self.dir / (n + ap.ROLLBACK_SUFFIX)).write_text(f'old:{n}\n', encoding='utf-8')
            (self.dir / (n + ap.STAGED_SUFFIX)).write_text(f'new:{n}\n', encoding='utf-8')
        os.replace(self.dir / ('a.js' + ap.STAGED_SUFFIX), self.dir / 'a.js')
        return snapshot(self.dir)

    def test_crash_then_retry_refuses_and_keeps_recovery_material(self):
        before = self.interrupted_state()
        self.assertEqual((self.dir / 'a.js').read_text(), 'new:a.js\n')
        ap._replace = FailAt(1)                     # the retry's first replacement would fail
        with self.assertRaises(ap.UnresolvedPublishError) as caught:
            ap.publish_artifacts(self.outputs('newer'))
        self.assertIn('a.js' + ap.ROLLBACK_SUFFIX, str(caught.exception))
        self.assertEqual(snapshot(self.dir), before)  # byte-identical, leftovers included
        self.assertEqual((self.dir / ('a.js' + ap.ROLLBACK_SUFFIX)).read_text(), 'old:a.js\n')
        self.assertEqual(ap._replace.calls, 0)

    def test_crash_then_retry_without_injected_failure_also_refuses(self):
        before = self.interrupted_state()
        with self.assertRaises(ap.UnresolvedPublishError):
            ap.publish_artifacts(self.outputs('newer'))
        self.assertEqual(snapshot(self.dir), before)

    def test_any_single_leftover_blocks_a_publish(self):
        for name in NAMES:
            for suffix in (ap.STAGED_SUFFIX, ap.ROLLBACK_SUFFIX):
                with self.subTest(name=name, suffix=suffix):
                    for p in self.dir.iterdir():
                        p.unlink()
                    self.seed()
                    (self.dir / (name + suffix)).write_text('left over\n', encoding='utf-8')
                    before = snapshot(self.dir)
                    with self.assertRaises(ap.UnresolvedPublishError):
                        ap.publish_artifacts(self.outputs('new'))
                    self.assertEqual(snapshot(self.dir), before)

    def test_documented_recovery_then_retry_publishes(self):
        self.interrupted_state()
        # The documented manual recovery: put every .rollback back, drop .staged.
        for n in NAMES:
            os.replace(self.dir / (n + ap.ROLLBACK_SUFFIX), self.dir / n)
            (self.dir / (n + ap.STAGED_SUFFIX)).unlink(missing_ok=True)
        self.assertEqual(snapshot(self.dir), {n: f'old:{n}\n'.encode() for n in NAMES})
        ap.publish_artifacts(self.outputs('newer'))
        self.assertEqual(snapshot(self.dir), {n: f'newer:{n}\n'.encode() for n in NAMES})

    def test_incomplete_rollback_then_retry_refuses(self):
        # The state a failed restore leaves (see the test above) is not overwritten.
        self.seed()
        ap._replace = FailAt(3)
        real_replace = os.replace

        def broken_restore(src, dst):
            if str(src).endswith(ap.ROLLBACK_SUFFIX) and Path(dst).name == 'a.js':
                raise OSError('restore failed (injected)')
            return real_replace(src, dst)

        ap.os.replace = broken_restore
        try:
            with self.assertRaises(ap.PublishError):
                ap.publish_artifacts(self.outputs('new'))
        finally:
            ap.os.replace = real_replace
        ap._replace = self.original_replace
        before = snapshot(self.dir)
        with self.assertRaises(ap.UnresolvedPublishError):
            ap.publish_artifacts(self.outputs('newer'))
        self.assertEqual(snapshot(self.dir), before)
        self.assertEqual((self.dir / ('a.js' + ap.ROLLBACK_SUFFIX)).read_text(), 'old:a.js\n')

if __name__ == '__main__':
    unittest.main(verbosity=2)
