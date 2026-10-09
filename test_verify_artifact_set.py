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
REPO = 'Greco1899/scrape_ufc_stats'
OUTPUTS = vas.REQUIRED_OUTPUTS
INPUTS = {   # module -> its sourceInputs, as generate_source_manifest.py records them
    'fightHistory': ['ufc_fight_results.csv', 'ufc_event_details.csv', 'ufc_fight_details.csv'],
    'fightersDataAggregates': ['ufc_fight_results.csv', 'ufc_event_details.csv',
                               'ufc_fight_details.csv', 'ufc_fight_stats.csv'],
    'elo': ['ufc_fight_results.csv', 'ufc_event_details.csv'],
}


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
            {'generator': 'update_fighters.py', 'sourceRepository': REPO,
             'sourceRevision': revision, 'outputs': outputs}, sort_keys=True).encode())
        files = {name: {'sha256': sha(f'{revision} {name}'.encode())} for name in vas.SNAPSHOT_INPUTS}
        self.write('source_snapshot.json', json.dumps(
            {'repository': REPO, 'revision': snapshot_revision or revision,
             'revisionCommittedAt': '2026-10-04T18:06:20+00:00', 'files': files}).encode())
        modules = {}
        for name, rel in vas.REQUIRED_MODULES.items():
            if rel not in OUTPUTS:
                self.write(rel, f'// {tag} {name}\n'.encode())
            modules[name] = {'file': rel, 'contentHash': sha((self.root / rel).read_bytes())}
        for name, inputs in INPUTS.items():
            modules[name]['sourceInputs'] = inputs
            if manifest_snapshot or name == 'elo':
                modules[name]['sourceSnapshot'] = {
                    'repository': REPO, 'revision': revision,
                    'revisionCommittedAt': '2026-10-04T18:06:20+00:00',
                    'inputSha256': {i: files[i]['sha256'] for i in inputs}}
        self.manifest(modules)

    def manifest(self, modules):
        self.write('src/sourceManifest.js', (
            'export const SOURCE_MANIFEST = ' + json.dumps({'modules': modules}) + ';\n').encode())

    def load(self, rel):
        if rel == 'src/sourceManifest.js':
            return vas.parse_manifest((self.root / rel).read_bytes())
        return json.loads((self.root / rel).read_text())

    def both_modes_fail(self, needle, stage=True):
        if stage:
            git(self.root, 'add', '-A')
        for index in (False, True):
            problems = self.problems(index=index)
            self.assertTrue(any(needle in p for p in problems),
                            f'index={index}: {needle!r} not in {problems}')

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
        self.assertTrue(any(p.startswith('artifact_generation.json: missing')
                            for p in self.problems()))

    def test_cli_exit_codes(self):
        self.assertEqual(vas.main(['--root', str(self.root)]), 0)
        self.write('src/fightHistory.js', b'// from another run\n')
        self.assertEqual(vas.main(['--root', str(self.root)]), 1)


    # ── Codex finding 5: the contract cannot shrink with its metadata ──
    def test_deleting_an_output_and_its_generation_entry_fails(self):
        for rel in ('fighter_profiles.json', 'source_ledger.json'):
            with self.subTest(rel=rel):
                git(self.root, 'reset', '-q', '--hard')
                generation = self.load('artifact_generation.json')
                del generation['outputs'][rel]
                self.write('artifact_generation.json', json.dumps(generation).encode())
                (self.root / rel).unlink()
                self.both_modes_fail('are not the required')
                self.both_modes_fail(f'{rel}: missing')

    def test_deleting_a_module_file_and_its_hash_fails(self):
        manifest = self.load('src/sourceManifest.js')
        del manifest['modules']['elo']['contentHash']
        self.manifest(manifest['modules'])
        (self.root / 'src/eloModule.js').unlink()
        self.both_modes_fail('(elo): contentHash missing or malformed')
        manifest['modules'].pop('elo')
        self.manifest(manifest['modules'])
        self.both_modes_fail('required module elo missing')

    def test_input_hash_not_matching_the_snapshot_fails(self):
        manifest = self.load('src/sourceManifest.js')
        manifest['modules']['fightHistory']['sourceSnapshot']['inputSha256'][
            'ufc_fight_results.csv'] = 'f' * 64
        self.manifest(manifest['modules'])
        self.both_modes_fail('(fightHistory): inputSha256[ufc_fight_results.csv] is not the')

    def test_input_hashes_must_cover_the_module_inputs(self):
        manifest = self.load('src/sourceManifest.js')
        del manifest['modules']['fightersDataAggregates']['sourceSnapshot']['inputSha256'][
            'ufc_fight_stats.csv']
        self.manifest(manifest['modules'])
        self.both_modes_fail('(fightersDataAggregates): inputSha256 covers')

    def test_snapshot_must_pin_every_input(self):
        snapshot = self.load('source_snapshot.json')
        del snapshot['files']['ufc_fighter_tott.csv']
        self.write('source_snapshot.json', json.dumps(snapshot).encode())
        self.both_modes_fail('no sha256 pinned for ufc_fighter_tott.csv')

    def test_required_output_missing_from_the_index_only(self):
        git(self.root, 'rm', '-q', '--cached', 'fighter_profiles.json')
        self.assertEqual(self.problems(), [])
        self.assertTrue(any('fighter_profiles.json: missing' in p and 'not git-added' in p
                            for p in self.problems(index=True)))

    def test_new_generation_with_an_unstaged_required_output(self):
        self.generate('v2', revision='e' * 40)
        git(self.root, 'add', '-A')
        git(self.root, 'reset', '-q', '--', 'fighter_profiles.json')
        self.assertEqual(self.problems(), [])
        problems = self.problems(index=True)
        self.assertTrue(any(p.startswith('fighter_profiles.json: sha256') for p in problems), problems)

if __name__ == '__main__':
    unittest.main(verbosity=2)
