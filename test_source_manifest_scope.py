#!/usr/bin/env python3
"""
test_source_manifest_scope.py — provenance may only be re-derived by a run that
actually regenerated the artifact.

The rankings workflow rebuilds rankingsData.js and rankingsHistoryData.js and
nothing else. If it regenerated the whole manifest it would pair an unchanged
fightHistory/fightersData/elo contentHash with a maxObservedEventDate taken from
whatever feed was on disk, claiming coverage the shipped artifact does not
contain. Emitting null instead is equally false. These tests pin the only
correct behaviour: preserve the last verified value.

NON-DESTRUCTIVE. Writes nothing outside a temporary directory, and never writes
src/sourceManifest.js. The preservation tests run against a synthetic manifest
rather than the shipped one, so they assert the behaviour rather than whatever
state the repository happens to be in.

stdlib unittest — no extra dependency.
"""

import copy
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

import generate_source_manifest as gsm

AGGREGATE_INPUTS = [
    'ufc_fight_results.csv',
    'ufc_event_details.csv',
    'ufc_fight_details.csv',
    'ufc_fight_stats.csv',
]
VERIFIED_DATE = '2026-08-08'


def synthetic_manifest():
    """A manifest as a healthy full run would leave it."""
    greco = {
        name: {
            'file': f'src/{name}.js',
            'maxObservedEventDate': VERIFIED_DATE,
            'contentHash': f'hash-of-{name}',
            'sourceInputs': AGGREGATE_INPUTS,
            'verificationMethod': f'verified for {name}',
        }
        for name in gsm.GRECO_BACKED_MODULES
    }
    greco['cardio'] = {'file': 'src/cardioModule.js', 'maxObservedEventDate': None}
    greco['rankHistory'] = {'file': 'src/rankHistory.js', 'maxObservedEventDate': '2026-03-12'}
    greco['fighterBirthdates'] = {'file': 'src/fighterBirthdates.js', 'maxObservedEventDate': None}
    for name in gsm.RANKINGS_MODULES:
        greco[name] = {'file': f'src/{name}.js', 'maxObservedEventDate': '1970-01-01', 'stale': True}
    return {
        'manifestGeneratedAt': '2026-01-01T00:00:00Z',
        'generatorScript': 'generate_source_manifest.py',
        'lastGenerationScope': 'full',
        'methodologyRef': 'research/source_integrity_audit.md',
        'modules': greco,
    }


def write_feed(directory, max_event_date):
    """Minimal but structurally valid Greco inputs with a controllable max date."""
    directory = Path(directory)
    # The DATE value contains a comma ("August 8, 2026"), so it must be quoted
    # or the column splits and every date silently fails to parse -- which would
    # make the preservation assertions below pass for the wrong reason.
    (directory / 'ufc_event_details.csv').write_text(
        'EVENT,URL,DATE,LOCATION,ATTENDANCE\n'
        f'UFC 999: Test vs. Fixture,http://example.invalid,'
        f'"{max_event_date.strftime("%B %d, %Y")}",Testville,1\n',
        encoding='utf-8',
    )
    for name in ('ufc_fight_results.csv', 'ufc_fight_details.csv', 'ufc_fight_stats.csv'):
        (directory / name).write_text(
            'EVENT,BOUT\nUFC 999: Test vs. Fixture,A vs. B\n', encoding='utf-8'
        )
    return directory


class RankingsScopeNeedsNoFightInputs(unittest.TestCase):
    def test_succeeds_with_no_greco_csvs_on_disk(self):
        with tempfile.TemporaryDirectory() as empty:
            self.assertEqual(list(Path(empty).iterdir()), [])
            manifest = gsm.build_manifest(
                scope='rankings', input_root=empty, existing=synthetic_manifest()
            )

        self.assertEqual(manifest['lastGenerationScope'], 'rankings')
        for name in gsm.RANKINGS_MODULES:
            self.assertIn(name, manifest['modules'])
            # Regenerated from the real artifacts, not copied from the stub.
            self.assertNotIn('stale', manifest['modules'][name])

    def test_full_scope_still_fails_closed_on_a_missing_csv(self):
        for omitted in AGGREGATE_INPUTS:
            with self.subTest(omitted=omitted), tempfile.TemporaryDirectory() as tmp:
                write_feed(tmp, date(2026, 8, 8))
                (Path(tmp) / omitted).unlink()
                with self.assertRaises(SystemExit) as caught:
                    gsm.build_manifest(scope='full', input_root=tmp)
                self.assertIn(omitted, str(caught.exception))


class RankingsScopePreservesUnrelatedModules(unittest.TestCase):
    def test_every_non_rankings_module_object_is_identical(self):
        existing = synthetic_manifest()
        before = copy.deepcopy(existing['modules'])
        with tempfile.TemporaryDirectory() as empty:
            after = gsm.build_manifest(
                scope='rankings', input_root=empty, existing=existing
            )['modules']

        self.assertEqual(set(before), set(after), 'module set changed')
        for name in before:
            if name in gsm.RANKINGS_MODULES:
                continue
            with self.subTest(module=name):
                self.assertEqual(before[name], after[name])

    def test_a_newer_feed_cannot_advance_unchanged_artifact_provenance(self):
        existing = synthetic_manifest()
        before = copy.deepcopy(existing['modules'])

        # A feed far newer than anything the shipped artifacts were built from.
        # Nothing in a rankings run regenerates fightHistory.js, fightersData.js
        # or eloModule.js, so this date must not reach the manifest.
        future = date.today() + timedelta(days=365)
        with tempfile.TemporaryDirectory() as tmp:
            write_feed(tmp, future)
            after = gsm.build_manifest(
                scope='rankings', input_root=tmp, existing=existing
            )['modules']

        for name in gsm.GRECO_BACKED_MODULES:
            with self.subTest(module=name):
                self.assertEqual(after[name]['maxObservedEventDate'], VERIFIED_DATE)
                self.assertNotEqual(
                    after[name]['maxObservedEventDate'], future.isoformat()
                )
                self.assertIsNotNone(
                    after[name]['maxObservedEventDate'],
                    'a scoped run must preserve the verified date, not null it',
                )
                self.assertEqual(
                    after[name]['contentHash'], before[name]['contentHash']
                )

    def test_scoped_run_refuses_when_there_is_nothing_verified_to_preserve(self):
        gutted = synthetic_manifest()
        del gutted['modules']['fightHistory']
        with tempfile.TemporaryDirectory() as empty:
            with self.assertRaises(SystemExit) as caught:
                gsm.build_manifest(scope='rankings', input_root=empty, existing=gutted)
        self.assertIn('fightHistory', str(caught.exception))


class SourceInputsDescribeLineage(unittest.TestCase):
    """sourceInputs is what can appear in the artifact; generatorRequiredInputs
    is what the generating script refuses to start without. fightHistory.js
    never reads round stats, so listing all four for it overstated its lineage.
    """

    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        write_feed(cls._tmp.name, date(2026, 8, 8))
        cls.modules = gsm.build_manifest(scope='full', input_root=cls._tmp.name)['modules']

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def test_fight_history_lineage_excludes_round_stats(self):
        self.assertEqual(
            self.modules['fightHistory']['sourceInputs'],
            ['ufc_fight_results.csv', 'ufc_event_details.csv', 'ufc_fight_details.csv'],
        )

    def test_aggregates_lineage_is_all_four(self):
        self.assertEqual(
            self.modules['fightersDataAggregates']['sourceInputs'], AGGREGATE_INPUTS
        )

    def test_elo_lineage_is_results_and_events(self):
        self.assertEqual(
            self.modules['elo']['sourceInputs'],
            ['ufc_fight_results.csv', 'ufc_event_details.csv'],
        )

    def test_execution_prerequisites_are_recorded_separately(self):
        for name in ('fightHistory', 'fightersDataAggregates'):
            with self.subTest(module=name):
                self.assertEqual(
                    self.modules[name]['generatorRequiredInputs'], AGGREGATE_INPUTS
                )


if __name__ == '__main__':
    unittest.main(verbosity=2)
