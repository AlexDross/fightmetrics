#!/usr/bin/env python3
"""scripts/verify_artifact_set.py: mixed generations and omitted `git add`.

Builds a small synthetic artifact set in a temporary git repository and checks
that the verifier passes a consistent set and names every inconsistency,
including the one only --index can see: a regenerated artifact that the commit
step forgot to stage.

NON-DESTRUCTIVE: temporary directories only. Needs git.
"""

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / 'scripts'))
import verify_artifact_set as vas  # noqa: E402

REV = 'c' * 40
OUTPUTS = ('src/fightersData.js', 'src/fightHistory.js', 'fighter_profiles.json',
           'source_ledger.json')
EXTRA_MODULES = {'elo': 'src/eloModule.js', 'birthdates': 'src/fighterBirthdates.js'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(root, *args):
    subprocess.run(['git', *args], cwd=root, check=True, capture_output=True)


class VerifyArtifactSet(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        git(self.root, 'init', '-q')
        git(self.root, 'config', 'user.email', 'test@example.com')
        git(self.root, 'config', 'user.name', 'test')
        self.generate('v1')
        git(self.root, 'add', '-A')
        git(self.root, 'commit', '-q', '-m', 'v1')

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, rel, data):
        path = self.root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return data

    def generate(self, tag, revision=REV, snapshot_revision=None, manifest_snapshot=True):
        """Write one complete generation the way the workflow does."""
        outputs = {}
        for rel in OUTPUTS:
            body = (json.dumps({'revision': revision, 'fights': {}}) if rel == 'source_ledger.json'
                    else f'// {tag} {rel}\n')
            outputs[rel] = sha(self.write(rel, body.encode()))
        self.write('artifact_generation.json', json.dumps(
            {'sourceRevision': revision, 'outputs': outputs}, sort_keys=True).encode())
        self.write('source_snapshot.json', json.dumps(
            {'revision': snapshot_revision or revision}).encode())
        modules = {}
        for name, rel in {'fightHistory': 'src/fightHistory.js',
                          'fightersDataAggregates': 'src/fightersData.js',
                          **EXTRA_MODULES}.items():
            if rel in EXTRA_MODULES.values():
                self.write(rel, f'// {tag} {name}\n'.encode())
            modules[name] = {'file': rel, 'contentHash': sha((self.root / rel).read_bytes())}
        modules['elo']['sourceSnapshot'] = {'revision': revision}
        if manifest_snapshot:
            for name in ('fightHistory', 'fightersDataAggregates'):
                modules[name]['sourceSnapshot'] = {'revision': revision}
        self.write('src/sourceManifest.js', (
            'export const SOURCE_MANIFEST = ' + json.dumps({'modules': modules}) + ';\n').encode())

    def problems(self, index=False):
        return vas.verify(self.root, index)[0]

    def test_consistent_set_passes_in_both_modes(self):
        self.assertEqual(self.problems(), [])
        self.assertEqual(self.problems(index=True), [])

    def test_omitted_git_add_is_caught_only_in_the_index(self):
        self.generate('v2')
        git(self.root, 'add', '-A')
        git(self.root, 'reset', '-q', '--', 'src/eloModule.js')   # the forgotten `git add`
        self.assertEqual(self.problems(), [], 'the working tree alone looks fine')
        problems = self.problems(index=True)
        self.assertTrue(any(p.startswith('src/eloModule.js: sha256') for p in problems), problems)
        self.assertTrue(any('src/eloModule.js: working tree differs from the staged copy' in p
                            for p in problems), problems)

    def test_omitted_feed_artifact_is_caught_in_the_index(self):
        self.generate('v2', revision='e' * 40)                      # a new upstream revision
        git(self.root, 'add', '-A')
        git(self.root, 'reset', '-q', '--', 'source_ledger.json')
        self.assertEqual(self.problems(), [])
        problems = self.problems(index=True)
        self.assertTrue(any(p.startswith('source_ledger.json: sha256') for p in problems), problems)
        self.assertTrue(any(p.startswith('upstream revision disagrees') for p in problems), problems)

    def test_mixed_generation_is_caught(self):
        self.write('src/fightHistory.js', b'// from another run\n')
        problems = self.problems()
        self.assertTrue(any('src/fightHistory.js: sha256' in p and 'artifact_generation.json' in p
                            for p in problems), problems)

    def test_revision_disagreement_is_caught(self):
        self.generate('v2', snapshot_revision='d' * 40)
        self.assertTrue(any(p.startswith('upstream revision disagrees') for p in self.problems()))

    def test_unstamped_manifest_is_caught(self):
        self.generate('v2', manifest_snapshot=False)
        self.assertTrue(any('no sourceSnapshot' in p for p in self.problems()))

    def test_leftover_from_an_interrupted_publish_is_caught(self):
        self.write('src/fightHistory.js.rollback', b'old')
        self.assertTrue(any('leftover from an interrupted publish' in p for p in self.problems()))

    def test_missing_generation_record_is_caught(self):
        (self.root / 'artifact_generation.json').unlink()
        self.assertIn('artifact_generation.json: missing', self.problems())

    def test_cli_exit_codes(self):
        self.assertEqual(vas.main(['--root', str(self.root)]), 0)
        self.write('src/fightHistory.js', b'// from another run\n')
        self.assertEqual(vas.main(['--root', str(self.root)]), 1)


if __name__ == '__main__':
    unittest.main(verbosity=2)
