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
INPUTS = {name: list(inputs) for name, inputs in vas.MODULE_INPUTS.items()}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(root, *args):
    subprocess.run(['git', *args], cwd=root, check=True, capture_output=True)


class ArtifactRepo(unittest.TestCase):
    """A temporary git repository holding one committed, consistent generation."""

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
            body = (json.dumps({'revision': revision, 'fights': {'0123456789abcdef': {}}}) if rel == 'source_ledger.json'
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



class VerifyArtifactSet(ArtifactRepo):
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
        self.both_modes_fail('(fightHistory) sourceSnapshot: inputSha256[ufc_fight_results.csv] is not the')

    def test_input_hashes_must_cover_the_module_inputs(self):
        manifest = self.load('src/sourceManifest.js')
        del manifest['modules']['fightersDataAggregates']['sourceSnapshot']['inputSha256'][
            'ufc_fight_stats.csv']
        self.manifest(manifest['modules'])
        self.both_modes_fail('(fightersDataAggregates) sourceSnapshot: inputSha256 covers')

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

    # ── Codex r2 finding 1: null / wrong-typed metadata is never "absent" ──
    def commit(self):
        git(self.root, 'add', '-A')
        git(self.root, 'commit', '-q', '-m', 'state under test')

    def test_null_generation_record_with_a_deleted_output_fails(self):
        self.write('artifact_generation.json', b'null')
        (self.root / 'fighter_profiles.json').unlink()
        self.both_modes_fail('artifact_generation.json: is null, expected a JSON object')
        self.both_modes_fail('fighter_profiles.json: missing')

    def test_null_manifest_with_corrupted_elo_fails(self):
        self.write('src/sourceManifest.js', b'export const SOURCE_MANIFEST = null;\n')
        self.write('src/eloModule.js', b'// corrupted\n')
        self.both_modes_fail('src/sourceManifest.js: is null, expected a JSON object')

    def test_null_snapshot_fails(self):
        self.write('source_snapshot.json', b'null')
        self.both_modes_fail('source_snapshot.json: is null, expected a JSON object')

    def test_every_metadata_document_rejects_null_scalars_and_lists(self):
        documents = {'artifact_generation.json': '{}', 'source_snapshot.json': '{}',
                     'source_ledger.json': '{}',
                     'src/sourceManifest.js': 'export const SOURCE_MANIFEST = {};\n'}
        for rel, template in documents.items():
            for value, kind in (('null', 'null'), ('7', 'int'), ('"x"', 'str'), ('[]', 'list')):
                with self.subTest(rel=rel, value=value):
                    git(self.root, 'reset', '-q', '--hard')
                    self.write(rel, template.replace('{}', value).encode())
                    self.both_modes_fail(f'{rel}: is {kind}, expected a JSON object')

    def test_malformed_nested_values_fail(self):
        cases = [
            ('artifact_generation.json', ['outputs'], None, 'outputs is null, expected an object'),
            ('artifact_generation.json', ['outputs'], [], 'outputs is list, expected an object'),
            ('source_snapshot.json', ['files'], None, 'files is null, expected an object'),
            ('source_snapshot.json', ['files', 'ufc_fight_stats.csv'], 'abc',
             'no sha256 pinned for ufc_fight_stats.csv'),
            ('src/sourceManifest.js', ['modules'], None, 'modules is null, expected an object'),
            ('src/sourceManifest.js', ['modules', 'elo'], None, 'required module elo missing'),
            ('src/sourceManifest.js', ['modules', 'cardio'], 'x', 'required module cardio missing'),
            ('src/sourceManifest.js', ['modules', 'elo', 'sourceSnapshot', 'inputSha256'], None,
             'inputSha256 is null, expected an object'),
            ('source_ledger.json', ['fights'], None, 'no fights table'),
        ]
        for rel, path, value, needle in cases:
            with self.subTest(rel=rel, path=path, value=value):
                git(self.root, 'reset', '-q', '--hard')
                doc = self.load(rel)
                target = doc
                for key in path[:-1]:
                    target = target[key]
                target[path[-1]] = value
                if rel == 'src/sourceManifest.js':
                    self.manifest(doc['modules'] if isinstance(doc.get('modules'), dict)
                                  else doc['modules'])
                else:
                    self.write(rel, json.dumps(doc).encode())
                self.both_modes_fail(needle)

    def test_real_committed_artifacts_with_null_metadata_fail(self):
        # The reproduction against copies of the actual committed artifacts.
        real = Path(__file__).resolve().parent
        files = set(vas.REQUIRED_OUTPUTS) | set(vas.REQUIRED_MODULES.values()) | {
            'artifact_generation.json', 'source_snapshot.json', 'src/sourceManifest.js'}
        for rel in files:
            self.write(rel, (real / rel).read_bytes())
        self.commit()
        self.assertEqual(self.problems(), [])
        for rel, mutate in (
                ('artifact_generation.json', lambda: (self.root / 'fighter_profiles.json').unlink()),
                ('src/sourceManifest.js', lambda: self.write('src/eloModule.js', b'// corrupted\n')),
                ('source_snapshot.json', lambda: None)):
            with self.subTest(rel=rel):
                git(self.root, 'reset', '-q', '--hard')
                self.write(rel, b'export const SOURCE_MANIFEST = null;\n'
                           if rel.endswith('.js') else b'null')
                mutate()
                self.both_modes_fail(f'{rel}: is null, expected a JSON object')

    # ── Codex r2 finding 2: every output needs a real digest ──
    def test_invalid_output_digest_with_altered_contents_fails(self):
        for digest in ('', None, 0, 123, [], {}, 'f' * 63, 'F' * 64, 'not-a-hash'):
            for drop in (False, True):
                with self.subTest(digest=digest, drop=drop):
                    git(self.root, 'reset', '-q', '--hard')
                    generation = self.load('artifact_generation.json')
                    if drop:
                        del generation['outputs']['fighter_profiles.json']
                    else:
                        generation['outputs']['fighter_profiles.json'] = digest
                    self.write('artifact_generation.json', json.dumps(generation).encode())
                    self.write('fighter_profiles.json', b'{}')
                    self.both_modes_fail('fighter_profiles.json' if drop
                                         else 'outputs[fighter_profiles.json] is')

    def test_invalid_module_content_hash_with_altered_contents_fails(self):
        for digest in ('', None, 0, 'f' * 63):
            with self.subTest(digest=digest):
                git(self.root, 'reset', '-q', '--hard')
                manifest = self.load('src/sourceManifest.js')
                manifest['modules']['elo']['contentHash'] = digest
                self.manifest(manifest['modules'])
                self.write('src/eloModule.js', b'// corrupted\n')
                self.both_modes_fail('(elo): contentHash missing or malformed')

    # ── Codex r2 finding 3: the contract does not come from the manifest ──
    def test_jointly_shortened_input_lists_fail(self):
        for name, dropped in (('fightersDataAggregates', 'ufc_fight_stats.csv'),
                              ('fightHistory', 'ufc_fight_details.csv'),
                              ('elo', 'ufc_event_details.csv')):
            with self.subTest(name=name):
                git(self.root, 'reset', '-q', '--hard')
                manifest = self.load('src/sourceManifest.js')
                module = manifest['modules'][name]
                module['sourceInputs'].remove(dropped)
                del module['sourceSnapshot']['inputSha256'][dropped]
                self.manifest(manifest['modules'])
                self.both_modes_fail(f'({name}): sourceInputs')
                self.both_modes_fail(f'({name}) sourceSnapshot: inputSha256 covers')

    def test_jointly_extended_input_lists_fail(self):
        manifest = self.load('src/sourceManifest.js')
        module = manifest['modules']['elo']
        module['sourceInputs'].append('ufc_fight_stats.csv')
        snapshot = self.load('source_snapshot.json')
        module['sourceSnapshot']['inputSha256']['ufc_fight_stats.csv'] = \
            snapshot['files']['ufc_fight_stats.csv']['sha256']
        self.manifest(manifest['modules'])
        self.both_modes_fail('(elo): sourceInputs')

    def test_jointly_missing_provenance_fields_fail(self):
        for key in ('revisionCommittedAt', 'repository', 'revision'):
            with self.subTest(key=key):
                git(self.root, 'reset', '-q', '--hard')
                snapshot = self.load('source_snapshot.json')
                del snapshot[key]
                self.write('source_snapshot.json', json.dumps(snapshot).encode())
                manifest = self.load('src/sourceManifest.js')
                for name in vas.MODULE_INPUTS:
                    del manifest['modules'][name]['sourceSnapshot'][key]
                self.manifest(manifest['modules'])
                self.both_modes_fail(f'source_snapshot.json: {key}')
                self.both_modes_fail(f'(elo) sourceSnapshot: {key}')

    def test_malformed_commit_time_fails(self):
        for value in ('', 'yesterday', '2026-10-04T18:06:20', 1728064000):
            with self.subTest(value=value):
                git(self.root, 'reset', '-q', '--hard')
                snapshot = self.load('source_snapshot.json')
                snapshot['revisionCommittedAt'] = value
                self.write('source_snapshot.json', json.dumps(snapshot).encode())
                self.both_modes_fail('source_snapshot.json: revisionCommittedAt')

    def test_real_committed_artifacts_with_shortened_inputs_fail(self):
        real = Path(__file__).resolve().parent
        files = set(vas.REQUIRED_OUTPUTS) | set(vas.REQUIRED_MODULES.values()) | {
            'artifact_generation.json', 'source_snapshot.json', 'src/sourceManifest.js'}
        for rel in files:
            self.write(rel, (real / rel).read_bytes())
        self.commit()
        manifest = self.load('src/sourceManifest.js')
        module = manifest['modules']['fightersDataAggregates']
        module['sourceInputs'].remove('ufc_fight_stats.csv')
        del module['sourceSnapshot']['inputSha256']['ufc_fight_stats.csv']
        self.manifest(manifest['modules'])
        self.both_modes_fail('(fightersDataAggregates): sourceInputs')

    def test_contract_matches_the_committed_manifest(self):
        committed = vas.parse_manifest(
            (Path(__file__).resolve().parent / 'src/sourceManifest.js').read_bytes())
        for name, inputs in vas.MODULE_INPUTS.items():
            self.assertEqual(committed['modules'][name]['sourceInputs'], list(inputs), name)


class GeneratorLineage(unittest.TestCase):
    """Codex r3 finding 2: run the real manifest generator on a fixture feed and
    compare the lineage it EMITS with the verifier's contract, so a change to
    any module's generated inputs fails here even if the file names still
    appear elsewhere in the generator source."""

    def build(self, gsm=None):
        if gsm is None:
            import generate_source_manifest as gsm
        import record_source_snapshot as rss
        import feed_validation as fv
        with tempfile.TemporaryDirectory() as tmp:
            feed = Path(tmp)
            for name in rss.SNAPSHOT_FILES:
                rows = [','.join(fv.INPUT_SCHEMA[name])]
                if name == 'ufc_event_details.csv':
                    rows.append('UFC 1,http://ufcstats.com/event-details/x,"November 12, 1993",Denver')
                (feed / name).write_text('\n'.join(rows) + '\n')
            (feed / 'source_snapshot.json').write_text(json.dumps(
                rss.build_snapshot(feed, REV, '2026-10-04T18:06:20+00:00')))
            return gsm.build_manifest('full', input_root=str(feed))['modules']

    def test_generated_lineage_is_the_contract(self):
        modules = self.build()
        for name, inputs in vas.MODULE_INPUTS.items():
            with self.subTest(module=name):
                self.assertEqual(sorted(modules[name]['sourceInputs']), sorted(inputs))
                self.assertEqual(len(modules[name]['sourceInputs']), len(inputs))
                self.assertEqual(sorted(modules[name]['sourceSnapshot']['inputSha256']),
                                 sorted(inputs))

    def lineage_problems(self, modules):
        return [name for name, inputs in vas.MODULE_INPUTS.items()
                if sorted(modules[name]['sourceInputs']) != sorted(inputs)
                or sorted(modules[name]['sourceSnapshot']['inputSha256']) != sorted(inputs)]

    def test_a_drifted_generator_is_detected(self):
        # Codex's reproduction: drop ufc_fight_details.csv from history_inputs
        # only. The file name still appears elsewhere in the generator.
        import types
        path = Path(__file__).resolve().parent / 'generate_source_manifest.py'
        source = path.read_text()
        original = ("        'ufc_fight_details.csv',\n    ]\n    elo_inputs")
        self.assertEqual(source.count(original), 1, 'history_inputs layout changed; update this test')
        drifted = types.ModuleType('generate_source_manifest_drifted')
        drifted.__file__ = str(path)
        exec(compile(source.replace(original, '    ]\n    elo_inputs'), str(path), 'exec'),
             drifted.__dict__)
        self.assertIn("'ufc_fight_details.csv'", source.replace(original, ''))
        self.assertEqual(self.lineage_problems(self.build(drifted)), ['fightHistory'])
        self.assertEqual(self.lineage_problems(self.build()), [])


if __name__ == '__main__':
    unittest.main(verbosity=2)
