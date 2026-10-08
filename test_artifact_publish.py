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
        (self.dir / ('c.json' + ap.STAGED_SUFFIX)).mkdir()   # staging c.json cannot write
        with self.assertRaises(OSError):
            ap.publish_artifacts(self.outputs('new'))
        (self.dir / ('c.json' + ap.STAGED_SUFFIX)).rmdir()
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


if __name__ == '__main__':
    unittest.main(verbosity=2)
