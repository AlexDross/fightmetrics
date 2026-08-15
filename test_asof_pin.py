"""Correction 6A — FIGHTMETRICS_ASOF must be required, exact and real.

`dsl` is (as-of - last fight date). Generating against an unpinned clock
rewrites ~2,198 roster records on every run, which buries a correction's real
diff in churn and makes "did this PR change only what it claimed?" unanswerable.
Requiring the date is what lets a review assert an exact changed-field set.
"""

import os
import subprocess
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))


def _run_resolver(value):
    """Invoke resolve_asof() in a child process with a controlled environment.

    update_fighters.py does heavy module-scope work, so the resolver is
    exercised directly rather than by importing the updater.
    """
    env = dict(os.environ)
    env.pop('FIGHTMETRICS_ASOF', None)
    if value is not None:
        env['FIGHTMETRICS_ASOF'] = value
    code = (
        'import ast,sys\n'
        'src=open("update_fighters.py").read()\n'
        'tree=ast.parse(src)\n'
        'fn=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=="resolve_asof"][0]\n'
        'ns={}\n'
        'exec("import os,re\\nfrom datetime import date\\n"'
        '     "ASOF_ENV=\'FIGHTMETRICS_ASOF\'\\n"'
        '     "_ASOF_RE=re.compile(r\'^\\\\d{4}-\\\\d{2}-\\\\d{2}$\')\\n"'
        '     +ast.unparse(fn), ns)\n'
        'print(ns["resolve_asof"]().isoformat())\n'
    )
    return subprocess.run([sys.executable, '-c', code], cwd=HERE, env=env,
                          capture_output=True, text=True)


class AsofPin(unittest.TestCase):

    def test_valid_pin_is_accepted(self):
        result = _run_resolver('2026-08-13')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), '2026-08-13')

    def test_missing_asof_is_rejected(self):
        result = _run_resolver(None)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('FIGHTMETRICS_ASOF is required', result.stderr)

    def test_empty_asof_is_rejected(self):
        result = _run_resolver('')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('required', result.stderr)

    def test_impossible_date_is_rejected(self):
        # Shape-valid, calendar-invalid.
        result = _run_resolver('2026-02-30')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('not a real calendar date', result.stderr)

    def test_basic_iso_form_is_rejected(self):
        # date.fromisoformat accepts '20260813'; the shape check must not.
        result = _run_resolver('20260813')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('must be exactly YYYY-MM-DD', result.stderr)

    def test_malformed_values_are_rejected(self):
        for value in ('2026-8-13', '13-08-2026', '2026/08/13', 'today',
                      '2026-08-13T00:00:00', ' 2026-08-13'):
            with self.subTest(value=value):
                result = _run_resolver(value)
                self.assertNotEqual(result.returncode, 0, f'{value!r} was accepted')


if __name__ == '__main__':
    unittest.main(verbosity=2)
