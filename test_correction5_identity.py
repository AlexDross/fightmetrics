#!/usr/bin/env python3
"""
test_correction5_identity.py — correction 5 held against the shipped artifacts.

NON-DESTRUCTIVE. Reads src/fightersData.js, src/fightHistory.js,
src/prospectsData.js and the source text of update_fighters.py. Writes nothing.
Does NOT import update_fighters (which loads the Greco CSVs at module scope), so
this suite runs before the feed is downloaded and without pandas.

These are the invariants that must survive every future refresh, not one-off
counts from the correction-5 run:

  * the nine apostrophe identities decode exactly, with no stray backslash;
  * no fight-history weight class is the truncated literal "Women\\";
  * Sean O'Malley keeps tb:4 — the direct pin on the 4 -> 0 regression that a
    naive parser repair would have caused;
  * the updater does not recompute tb, and does not read roster fields with a
    second field-specific regex.

Scale figures from the approved dry run (9 fighters changed, 265 histories,
1,908 entries) are pinned separately in test_correction5_full_run.py, which
needs the recorded feed and a pristine baseline and skips without them.

stdlib unittest — no extra dependency.
"""

import ast
import json
import re
import unittest
from pathlib import Path

import js_roster_parser as P

ROOT = Path(__file__).resolve().parent
FIGHTERS_JS = ROOT / 'src' / 'fightersData.js'
HISTORY_JS = ROOT / 'src' / 'fightHistory.js'
PROSPECTS_JS = ROOT / 'src' / 'prospectsData.js'
UPDATER_PY = ROOT / 'update_fighters.py'

# The nine roster identities whose escaped apostrophe made them invisible to the
# old parser. Their records and aggregates had been frozen since the entries
# were first written.
APOSTROPHE_IDENTITIES = [
    "Brendan O'Reilly",
    "Casey O'Neill",
    "Chuck O'Neil",
    "Da'Mon Blackshear",
    "Don'Tale Mayes",
    "Lone'er Kavanagh",
    "Sean O'Malley",
    "TJ O'Brien",
    "Tre'ston Vines",
]

# "Women" followed by a single backslash — what w:'Women\'s Flyweight' used to
# decode to. Built from chr() so the constant cannot be softened by an editor.
TRUNCATED_DIVISION = 'Women' + chr(92)

# src/prospectsData.js carries a `//` header reading "(Women's BW, Prelims)".
# A scanner blind to comments read that apostrophe as an opening quote, lost
# brace parity, and saw only the FOUR entries above it. An exact count, not a
# "> 0" — the whole failure mode is a number that is quietly too small.
SHIPPED_PROSPECT_COUNT = 12

_ROSTER = P.parse_roster(FIGHTERS_JS.read_text(), '_D2')
_HISTORY = json.loads(
    re.search(r'=\s*(\{.*\});\s*$', HISTORY_JS.read_text(), re.S).group(1))


class NineIdentitiesResolve(unittest.TestCase):
    """10. Every apostrophe identity decodes exactly, in the shipped roster."""

    def test_each_identity_is_present_and_exact(self):
        for name in APOSTROPHE_IDENTITIES:
            with self.subTest(name=name):
                self.assertIn(name, _ROSTER.by_name)
                self.assertEqual(_ROSTER.by_name[name].name, name)

    def test_no_roster_identity_carries_a_stray_backslash(self):
        stray = [n for n in _ROSTER.names if chr(92) in n]
        self.assertEqual(stray, [], f'truncated identities in the roster: {stray}')

    def test_the_known_cohort_is_covered(self):
        """A later signing may add a tenth apostrophe name; none may be lost."""
        found = {n for n in _ROSTER.names if "'" in n}
        self.assertTrue(set(APOSTROPHE_IDENTITIES) <= found,
                        f'missing: {sorted(set(APOSTROPHE_IDENTITIES) - found)}')

    def test_identities_are_unique(self):
        self.assertEqual(len(set(_ROSTER.names)), _ROSTER.object_count)

    def test_every_roster_division_decodes_cleanly(self):
        bad = []
        for entry in _ROSTER.entries:
            field = entry.fields.get('w')
            if field is not None and field.is_string and chr(92) in field.value:
                bad.append((entry.name, field.value))
        self.assertEqual(bad, [], f'truncated divisions in the roster: {bad}')

    def test_prospects_parse_with_the_same_grammar(self):
        """The prospect file is read by the same tokenizer, comments and all."""
        prospects = P.parse_roster(PROSPECTS_JS.read_text(), '_P')
        self.assertEqual(prospects.object_count, SHIPPED_PROSPECT_COUNT)
        self.assertEqual([n for n in prospects.names if chr(92) in n], [])


class HistoryWeightClasses(unittest.TestCase):
    """19. The shipped `Women\\` truncation must not come back."""

    def test_no_truncated_division_remains(self):
        offenders = [
            (name, bout.get('ev'))
            for name, bouts in _HISTORY.items()
            for bout in bouts
            if bout.get('wc') == TRUNCATED_DIVISION
        ]
        self.assertEqual(offenders[:5], [],
                         f'{len(offenders)} entries still carry {TRUNCATED_DIVISION!r}')

    def test_no_weight_class_contains_a_backslash(self):
        offenders = {
            bout.get('wc')
            for bouts in _HISTORY.values()
            for bout in bouts
            if chr(92) in (bout.get('wc') or '')
        }
        self.assertEqual(offenders, set())

    def test_the_womens_divisions_resolved(self):
        divisions = {
            bout['wc'] for bouts in _HISTORY.values() for bout in bouts
            if bout.get('wc', '').startswith('Women')
        }
        self.assertTrue(divisions, 'no Women’s divisions in fight history at all')
        for division in divisions:
            self.assertRegex(division, r"^Women's \w+")

    def test_every_history_key_is_a_decodable_identity(self):
        """18 (shape). No history key may be a truncated spelling."""
        self.assertEqual([n for n in _HISTORY if chr(92) in n], [])


class ShippedProspectFile(unittest.TestCase):
    """The prospect loader, against the file that actually ships."""

    def test_all_twelve_entries_resolve(self):
        fallbacks = P.parse_prospect_fallbacks(PROSPECTS_JS.read_text())
        self.assertEqual(len(fallbacks), SHIPPED_PROSPECT_COUNT)

    def test_loader_identities_equal_parse_roster_names(self):
        content = PROSPECTS_JS.read_text()
        self.assertEqual(list(P.parse_prospect_fallbacks(content)),
                         P.parse_roster(content, '_P').names)

    def test_the_entries_after_the_apostrophe_comment_are_present(self):
        """The four the old scanner saw, and the eight it lost."""
        names = list(P.parse_prospect_fallbacks(PROSPECTS_JS.read_text()))
        self.assertEqual(names[:4], ['Mandel Nallo', 'Marcio Barbosa',
                                     'Julien Leblanc', 'Gokhan Saricam'])
        self.assertIn('Darya Zheleznyakova', names)   # the commented one
        self.assertIn('Mark Vologdin', names)         # the first one it lost

    def test_every_fallback_carries_the_attribute_keys(self):
        expected = set(P.PROSPECT_STRING_FIELDS) | set(P.PROSPECT_NUMBER_FIELDS)
        for name, fallback in P.parse_prospect_fallbacks(
                PROSPECTS_JS.read_text()).items():
            with self.subTest(name=name):
                self.assertEqual(set(fallback), expected)


class ProspectLoaderDoesNotSwallowFailures(unittest.TestCase):
    """4/5. A prospect file that EXISTS but does not parse must abort the run.

    Converting a malformed file into `{}` is the same silent data loss as the
    parser defect itself: the updater would carry on and seed debuting fighters
    with no fallback attributes, and nothing would say so.
    """

    # Read from the AST, not the source text: the docstring describes the
    # swallowing this function must never do again, so a substring search would
    # match the prose rather than the code.
    @staticmethod
    def loader_ast():
        tree = ast.parse(UPDATER_PY.read_text())
        for node in ast.walk(tree):
            if (isinstance(node, ast.FunctionDef)
                    and node.name == 'load_prospect_fallbacks'):
                return node
        raise AssertionError('load_prospect_fallbacks not found')

    def test_the_wrapper_has_no_except_around_the_parse(self):
        fn = self.loader_ast()
        handlers = [n for n in ast.walk(fn)
                    if isinstance(n, (ast.Try, ast.ExceptHandler))]
        self.assertEqual(handlers, [],
                         'load_prospect_fallbacks swallows a parse failure again; '
                         'a prospectsData.js that exists but does not parse must '
                         'abort the run, not become an empty dict')
        calls = {ast.unparse(n.func) for n in ast.walk(fn) if isinstance(n, ast.Call)}
        self.assertIn('parse_prospect_fallbacks', calls)

    def test_only_true_file_absence_returns_empty(self):
        """6. The one permitted `{}` is guarded by file absence and nothing else."""
        fn = self.loader_ast()
        returns = [n for n in ast.walk(fn) if isinstance(n, ast.Return)]
        self.assertEqual(len(returns), 2)
        empty = [n for n in returns if ast.unparse(n.value) == '{}']
        self.assertEqual(len(empty), 1)

        guards = [n for n in ast.walk(fn)
                  if isinstance(n, ast.If)
                  and any(r in ast.walk(n) for r in empty)]
        self.assertEqual(len(guards), 1, 'the empty return is not guarded by an if')
        self.assertEqual(ast.unparse(guards[0].test),
                         'not os.path.exists(PROSPECT_PATH)')
        self.assertEqual(guards[0].orelse, [])

    def test_the_loader_does_not_split_or_extract_on_its_own(self):
        """2. It goes through parse_roster via the helper, and nothing else."""
        fn = self.loader_ast()
        calls = {ast.unparse(n.func) for n in ast.walk(fn) if isinstance(n, ast.Call)}
        for bypass in ('extract_array_body', 'scan_top_level_objects',
                       'parse_object_fields', 'parse_roster',
                       're.search', 're.findall', 're.finditer'):
            self.assertNotIn(bypass, calls)

    def test_a_malformed_prospect_file_raises_through_the_helper(self):
        """Behavioural counterpart to the source guards above."""
        for body in ["export const _P = [{w:'X'}];\n",       # no identity
                     "export const _P = [{n:'A',w:}];\n",    # malformed
                     "export const _Q = [];\n"]:             # missing export
            with self.subTest(body=body):
                with self.assertRaises(P.JsParseError):
                    P.parse_prospect_fallbacks(body)


class TitleBoutsArePreserved(unittest.TestCase):
    """13/14. tb is stored data, not something this updater recomputes."""

    def test_omalley_retains_four_title_bouts(self):
        entry = _ROSTER.by_name["Sean O'Malley"]
        self.assertEqual(entry.fields['tb'].value, 4)

    def test_tb_is_not_in_the_recomputed_stat_fields(self):
        source = UPDATER_PY.read_text()
        m = re.search(r'^STAT_FIELDS\s*=\s*\[(.*?)\]', source, re.M | re.S)
        self.assertIsNotNone(m, 'STAT_FIELDS not found in update_fighters.py')
        fields = re.findall(r"'([^']+)'", m.group(1))
        self.assertNotIn('tb', fields,
                         "tb is back in STAT_FIELDS: with wc:'' on every fight record "
                         'a recomputed tb collapses to an event-name heuristic and '
                         "would overwrite Sean O'Malley's stored 4 with 0")

    def test_compute_stat_updates_no_longer_returns_tb(self):
        source = UPDATER_PY.read_text()
        body = source.split('def compute_stat_updates(')[1].split('\n# ')[0]
        self.assertNotIn("'tb':", body,
                         'compute_stat_updates still produces a tb value; if nothing '
                         'consumes it, remove it rather than leaving a misleading one')

    def test_tb_is_declared_preserved(self):
        source = UPDATER_PY.read_text()
        m = re.search(r'^PRESERVED_FIELDS\s*=\s*\((.*?)\)', source, re.M | re.S)
        self.assertIsNotNone(m, 'PRESERVED_FIELDS not found in update_fighters.py')
        self.assertIn('tb', re.findall(r"'([^']+)'", m.group(1)))

    def test_a_stored_tb_survives_the_updater_field_lists(self):
        """14. Behavioural: patch with the updater's own field lists.

        Every fight record carries wc:'' because ufc_fight_details.csv is
        EVENT,BOUT,URL — exactly the condition under which a recomputed tb goes
        to zero. Patching with the shipped field lists must leave tb alone.
        """
        source = UPDATER_PY.read_text()
        record_fields = re.findall(
            r"'([^']+)'",
            re.search(r'^RECORD_FIELDS\s*=\s*\[(.*?)\]', source, re.M | re.S).group(1))
        stat_fields = re.findall(
            r"'([^']+)'",
            re.search(r'^STAT_FIELDS\s*=\s*\[(.*?)\]', source, re.M | re.S).group(1))

        entry = ('{' + r"n:'Sean O\'Malley',w:'Bantamweight',tb:4," +
                 ','.join(f'{f}:0' for f in record_fields + stat_fields) +
                 ",lfd:'2026-01-24'}")
        updates = {f: '99' for f in record_fields + stat_fields}
        patched = P.patch_object_fields(entry, updates)
        fields = P.parse_object_fields(patched)
        self.assertEqual(fields['tb'].value, 4)
        self.assertEqual(fields['tb'].raw, '4')
        self.assertEqual(fields['n'].value, "Sean O'Malley")
        self.assertEqual(fields['w'].value, 'Bantamweight')
        for f in record_fields + stat_fields:
            self.assertEqual(fields[f].raw, '99')


class OneParserInTheReadPath(unittest.TestCase):
    """12. A second field-specific pattern must not reappear in the updater."""

    def test_the_updater_has_no_quoted_field_regex(self):
        """Every `re.*` pattern in the updater, read from the AST.

        Comments and docstrings are excluded on purpose — they describe the old
        grammar. What must not come back is a live pattern that reaches into a
        quoted JS field, because `[^']` cannot cross an escaped apostrophe.
        """
        tree = ast.parse(UPDATER_PY.read_text())
        offenders = []
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call):
                continue
            func = node.func
            if not (isinstance(func, ast.Attribute)
                    and isinstance(func.value, ast.Name)
                    and func.value.id == 're'):
                continue
            if not node.args:
                continue
            pattern = ast.unparse(node.args[0])
            if "[^'" in pattern or ":'" in pattern or ":\\\\s*'" in pattern:
                offenders.append(f'{func.attr}({pattern})')
        self.assertEqual(offenders, [],
                         "a field-specific quoted-string pattern is back in "
                         "update_fighters.py; roster fields must be read through "
                         "js_roster_parser, which is the only grammar that crosses "
                         "an escaped apostrophe")

    def test_identity_comes_from_one_parse_and_no_field_regex_returns(self):
        """Correction 5's grammar rule, restated after Correction 6A.

        This used to also assert `entry.fields.get('w')`, because the updater
        read each roster division to answer "what division was this historical
        bout at?". Correction 6A deleted that question: history now reads the
        bout-local WEIGHTCLASS from its own result row, so the updater no longer
        reads roster division ANYWHERE, and requiring the read would mean
        keeping the discarded fallback's machinery alive as dead code.

        The invariant Correction 5 actually protects — no field-specific quoted
        pattern may reappear — is unchanged and is enforced structurally by
        test_the_updater_has_no_quoted_field_regex above, which walks the AST
        rather than matching source text. Both literal guards below are kept.
        """
        source = UPDATER_PY.read_text()
        self.assertIn('parse_roster(js_content', source)
        self.assertNotIn("re.search(r\"w:'", source)
        self.assertNotIn("re.finditer(r\"\\{n:'", source)
        # And the roster-division read really is gone, not merely relocated.
        # Read from the AST, following the same rule as the regex guard above:
        # comments and docstrings are excluded on purpose, because they exist to
        # describe what was removed.
        live_names = {n.id for n in ast.walk(ast.parse(source))
                      if isinstance(n, ast.Name)}
        self.assertNotIn('wc_lookup', live_names,
                         'the roster-division lookup is live again; historical '
                         'divisions must come from the bout row, not the roster')

    def test_the_updater_does_not_evaluate_the_roster(self):
        source = UPDATER_PY.read_text()
        for forbidden in ('eval(', 'exec(', 'subprocess', 'json.loads(js_content'):
            self.assertNotIn(forbidden, source)


if __name__ == '__main__':
    unittest.main(verbosity=2)
