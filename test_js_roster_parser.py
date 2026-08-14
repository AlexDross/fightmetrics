#!/usr/bin/env python3
"""
test_js_roster_parser.py — the escaped-apostrophe identity defect, pinned.

NON-DESTRUCTIVE. Writes nothing. Imports only js_roster_parser, which reads no
file and loads no feed, so this suite runs without pandas and without the Greco
CSVs on disk.

What it guards
--------------
src/fightersData.js was read by two independently written regexes — one for the
identity, one for the division — and `[^']` cannot cross the backslash of an
escaped apostrophe, so both stopped one character early:

    n:'Sean O\\'Malley'      ->  "Sean O\\"      (nine fighters stopped updating)
    w:'Women\\'s Flyweight'  ->  "Women\\"       (1,849 shipped history entries)

Every test below is a way that failure could come back: a second field-specific
pattern, a writer whose escaping no longer matches the reader, an object that
parses to nothing and disappears quietly, or two spellings that collapse onto
one identity.

stdlib unittest — no extra dependency.
"""

import unittest

import js_roster_parser as P

# The exact spelling the generated module carries for an apostrophe name: the
# apostrophe is backslash-escaped inside a single-quoted literal.
OMALLEY_RAW = r"{n:'Sean O\'Malley',w:'Bantamweight',tb:4,wi:11,lfd:'2026-01-24'}"
PLAIN_RAW = "{n:'Merab Dvalishvili',w:'Bantamweight',tb:2,wi:20,lfd:'2026-06-14'}"


def module(*entries):
    """Wrap raw entries in the generated roster module's shape."""
    return "export const _D2 = [\n" + ",\n".join(f"  {e}" for e in entries) + "\n];\n"


class DecodesEscapedApostrophes(unittest.TestCase):
    def test_name_decodes_and_joins_a_csv_derived_key(self):
        """1. The identity decodes, and it matches the key the CSVs produce."""
        roster = P.parse_roster(module(OMALLEY_RAW))
        (entry,) = roster.entries
        self.assertEqual(entry.name, "Sean O'Malley")
        self.assertNotIn('\\', entry.name)

        # How the updater builds its update keys: split_bout on the BOUT column
        # of ufc_fight_results.csv. The join is the whole point — the old parser
        # produced "Sean O\", which matched nothing and froze the fighter.
        bout = "Sean O'Malley vs. Merab Dvalishvili"
        record_updates = {bout.split(' vs. ')[0]: {'wi': 12}}
        self.assertIn(entry.name, record_updates)
        self.assertEqual(record_updates[entry.name]['wi'], 12)

    def test_division_decodes_never_women_backslash(self):
        """2. w:'Women\\'s Flyweight' is a division, not the string "Women\\"."""
        raw = r"{n:'Casey O\'Neill',w:'Women\'s Flyweight',tb:0}"
        (entry,) = P.parse_roster(module(raw)).entries
        self.assertEqual(entry.fields['w'].value, "Women's Flyweight")
        self.assertNotEqual(entry.fields['w'].value, 'Women' + chr(92))
        self.assertNotIn('\\', entry.fields['w'].value)

    def test_escaped_backslash_round_trips(self):
        """3. A backslash in a value survives writer -> reader unchanged."""
        for value in ['Back\\slash Guy', 'C:\\path\\to', '\\', '\\\\']:
            with self.subTest(value=value):
                self.assertEqual(P.decode_js_string(P.js_escape(value)), value)
        raw = "{n:'" + P.js_escape('Back\\slash Guy') + "',w:'Heavyweight'}"
        (entry,) = P.parse_roster(module(raw)).entries
        self.assertEqual(entry.name, 'Back\\slash Guy')

    def test_two_apostrophes_round_trip(self):
        """4. Multiple apostrophes in one name."""
        for value in ["O'Neill-D'Arce", "Da'Mon O'Malley", "'''"]:
            with self.subTest(value=value):
                self.assertEqual(P.decode_js_string(P.js_escape(value)), value)
        raw = "{n:'" + P.js_escape("O'Neill-D'Arce") + "',w:'Flyweight'}"
        (entry,) = P.parse_roster(module(raw)).entries
        self.assertEqual(entry.name, "O'Neill-D'Arce")

    def test_apostrophe_free_entry_is_byte_identical(self):
        """5. An ordinary entry comes out of the parser exactly as it went in."""
        (entry,) = P.parse_roster(module(PLAIN_RAW)).entries
        self.assertEqual(entry.raw, PLAIN_RAW)
        self.assertEqual(P.patch_object_fields(entry.raw, {}), PLAIN_RAW)
        # A no-op patch must also be byte-preserving.
        self.assertEqual(
            P.patch_object_fields(entry.raw, {'wi': '20'}), PLAIN_RAW)

    def test_punctuation_inside_a_quoted_field_cannot_truncate_the_object(self):
        """6. A literal } or , inside a string is data, not structure."""
        raw = (r"{n:'Brace } Guy',w:'Wei,ght} Class',st:'{Orthodox}',"
               r"nt:'he said \'hi\' }',tb:0}")
        (entry,) = P.parse_roster(module(raw)).entries
        self.assertEqual(entry.name, 'Brace } Guy')
        self.assertEqual(entry.fields['w'].value, 'Wei,ght} Class')
        self.assertEqual(entry.fields['st'].value, '{Orthodox}')
        self.assertEqual(entry.fields['nt'].value, "he said 'hi' }")
        self.assertEqual(entry.fields['tb'].value, 0)
        self.assertEqual(entry.raw, raw)

    def test_object_with_two_entries_keeps_both(self):
        roster = P.parse_roster(module(OMALLEY_RAW, PLAIN_RAW))
        self.assertEqual(roster.names, ["Sean O'Malley", 'Merab Dvalishvili'])
        self.assertEqual(roster.object_count, 2)


class FailsClosed(unittest.TestCase):
    def test_malformed_object_hard_fails(self):
        """7. An unparseable object aborts; it never disappears quietly."""
        cases = {
            'no colon': "{n:'A',w}",
            'no value': "{n:'A',w:}",
            'unterminated string': "{n:'A,w:'Heavyweight'}",
            'missing comma': "{n:'A' w:'Heavyweight'}",
            'garbage value': "{n:'A',w:@@@}",
            'dangling backslash': "{n:'A\\'}",
            'not an object': "n:'A'",
        }
        for label, raw in cases.items():
            with self.subTest(label=label):
                with self.assertRaises(P.JsParseError):
                    P.parse_roster(module(raw))

    def test_object_without_a_decodable_identity_hard_fails(self):
        for raw in ["{w:'Heavyweight',tb:0}", "{n:null,w:'Heavyweight'}", "{n:'',w:'X'}"]:
            with self.subTest(raw=raw):
                with self.assertRaises(P.JsParseError):
                    P.parse_roster(module(raw))

    def test_duplicate_identity_hard_fails(self):
        """8. The same fighter twice is a corrupt roster, not a merge."""
        with self.assertRaises(P.JsParseError) as ctx:
            P.parse_roster(module(OMALLEY_RAW, OMALLEY_RAW))
        self.assertIn('duplicate roster identity', str(ctx.exception))

    def test_unescaping_collision_hard_fails(self):
        """9. Two different spellings that decode to one identity must abort.

        `\\u0053ean O\\'Malley` and `Sean O\\'Malley` are distinct bytes that
        decode to the same person. Silently keeping one would drop the other.
        """
        collide = r"{n:'\u0053ean O\'Malley',w:'Bantamweight',tb:0}"
        with self.assertRaises(P.JsParseError) as ctx:
            P.parse_roster(module(OMALLEY_RAW, collide))
        self.assertIn('unescaping collision', str(ctx.exception))

    def test_text_between_objects_hard_fails(self):
        """Residue the tokenizer did not claim means an entry may have been lost."""
        body = module(OMALLEY_RAW, PLAIN_RAW).replace(',\n', ',\n  <<stray>>\n', 1)
        with self.assertRaises(P.JsParseError) as ctx:
            P.parse_roster(body)
        self.assertIn('unparsed text', str(ctx.exception))
        with self.assertRaises(P.JsParseError):
            P.parse_roster(module(OMALLEY_RAW).replace('\n];', '\n  <<trailing>>\n];'))

    def test_dropped_object_is_not_silently_tolerated(self):
        with self.assertRaises(P.JsParseError):
            P.parse_roster("export const _D2 = [\n  {n:'A',w:'X'\n];\n")

    def test_missing_export_hard_fails(self):
        with self.assertRaises(P.JsParseError):
            P.parse_roster("export const _OTHER = [];\n")

    def test_patching_an_absent_field_hard_fails(self):
        """Skipping a missing field is how a fighter stops being updated."""
        with self.assertRaises(P.JsParseError):
            P.patch_object_fields(PLAIN_RAW, {'sapm': '3.34'})

    def test_duplicate_field_in_one_object_hard_fails(self):
        with self.assertRaises(P.JsParseError):
            P.parse_object_fields("{n:'A',tb:1,tb:2}")


class WriterReaderRoundTrip(unittest.TestCase):
    """11. A newly seeded apostrophe-named fighter must survive the round trip.

    build_new_fighter_entry writes identities through js_escape. If that
    escaping and this parser ever drift apart, a debuting fighter would be
    written in a form the next run cannot read — the original defect, reissued.
    """

    SEED_NAMES = [
        "Sean O'Malley",
        "Da'Mon Blackshear",
        "Tre'ston Vines",
        "O'Neill-D'Arce",
        'Back\\slash Guy',
        "Back\\slash O'Guy",
        'No Apostrophe',
    ]

    def test_seeded_entry_round_trips_through_writer_and_parser(self):
        entries = []
        for name in self.SEED_NAMES:
            entries.append(
                '{' + f"n:'{P.js_escape(name)}',"
                      f"w:{P.format_js_literal(chr(87) + chr(111) + 'men' + chr(39) + 's Flyweight')},"
                      f"tb:0,wi:1,lfd:{P.format_js_literal('2026-08-08')}" + '}')
        roster = P.parse_roster(module(*entries))
        self.assertEqual(roster.names, self.SEED_NAMES)
        for entry in roster.entries:
            self.assertEqual(entry.fields['w'].value, "Women's Flyweight")

    def test_format_js_literal_is_the_inverse_of_the_parser(self):
        for value in self.SEED_NAMES + [None, 0, 4, 3.34, -1, "Women's Flyweight"]:
            with self.subTest(value=value):
                literal = P.format_js_literal(value)
                (field,) = P.parse_object_fields('{v:' + literal + '}').values()
                self.assertEqual(field.value, value)


class OneParserForEveryField(unittest.TestCase):
    """12. Identity and division must come from the SAME parse.

    They were two regexes, and they carried the same bug independently. This
    fails if a second field-specific pattern is reintroduced anywhere in the
    read path: each object is parsed exactly once, and both fields are read off
    that one result.
    """

    def test_one_parse_per_object_serves_both_name_and_division(self):
        calls = []
        original = P.parse_object_fields

        def counting(obj_str):
            calls.append(obj_str)
            return original(obj_str)

        P.parse_object_fields = counting
        try:
            roster = P.parse_roster(module(
                OMALLEY_RAW,
                r"{n:'Casey O\'Neill',w:'Women\'s Flyweight',tb:0}",
                PLAIN_RAW,
            ))
        finally:
            P.parse_object_fields = original

        self.assertEqual(len(calls), 3, 'each object must be parsed exactly once')
        for entry in roster.entries:
            self.assertIn('n', entry.fields)
            self.assertIn('w', entry.fields)
            self.assertTrue(entry.fields['n'].is_string)
            self.assertTrue(entry.fields['w'].is_string)
            self.assertNotIn('\\', entry.fields['n'].value)
            self.assertNotIn('\\', entry.fields['w'].value)

    def test_field_accessors_read_an_already_parsed_object(self):
        raw = r"{n:'Casey O\'Neill',w:'Women\'s Flyweight',ag:27,rh:66.5,ht:null}"
        fields = P.parse_object_fields(raw)
        self.assertEqual(P.field_string(fields, 'n'), "Casey O'Neill")
        self.assertEqual(P.field_string(fields, 'w'), "Women's Flyweight")
        self.assertEqual(P.field_number(fields, 'ag'), 27)
        self.assertEqual(P.field_number(fields, 'rh'), 66.5)
        self.assertIsNone(P.field_number(fields, 'ht'))
        self.assertIsNone(P.field_string(fields, 'ag'))
        self.assertIsNone(P.field_string(fields, 'absent'))
        self.assertIsNone(P.field_number(fields, 'absent'))

    def test_there_is_no_by_key_read_path_that_rescans_an_object(self):
        """The loose helpers are gone, so no caller can bypass parse_roster.

        `parse_js_string_field(text, key)` and friends took raw text and
        re-scanned it per field. They are what made a second, laxer read path
        easy to reach for; the accessors above take an already-parsed field map
        instead, so there is only one way in.
        """
        for gone in ('parse_js_string_field', 'parse_js_number_field',
                     'parse_js_nullable_field', 'split_top_level_objects'):
            self.assertFalse(hasattr(P, gone),
                             f'{gone} is back; it re-scans an object by key and '
                             'sidesteps the fail-closed roster path')


class CommentsAndTrivia(unittest.TestCase):
    """src/prospectsData.js is hand-maintained and carries `//` headers.

    One of them reads "(Women's BW, Prelims)". A scanner that does not know
    about comments reads that apostrophe as an opening quote and loses brace
    parity: the previous implementation saw 4 of the 12 prospect entries.
    """

    def test_line_comment_with_an_apostrophe_does_not_swallow_entries(self):
        body = (
            "export const _P = [\n"
            "  // ─── Darya Zheleznyakova (Women's BW, Prelims) ───\n"
            f"  {PLAIN_RAW},\n"
            "  /* block { comment } */\n"
            f"  {OMALLEY_RAW},\n"
            "];\n"
        )
        roster = P.parse_roster(body, '_P')
        self.assertEqual(roster.names, ['Merab Dvalishvili', "Sean O'Malley"])

    def test_comment_inside_an_object_is_skipped(self):
        raw = "{n:'A', // note with an apostrophe: don't\n w:'Heavyweight'}"
        fields = P.parse_object_fields(raw)
        self.assertEqual(fields['n'].value, 'A')
        self.assertEqual(fields['w'].value, 'Heavyweight')


class ProspectFallbacksFailClosed(unittest.TestCase):
    """The prospect path must lose an entry no more quietly than the roster.

    It is the half of the read path that just widened from 4 visible entries to
    12, so every way it could silently shrink is pinned here: a swallowed parse
    error, an object with no decodable identity, a duplicate name overwriting
    another in the result dict, or text the tokenizer never claimed.
    """

    def prospects(self, *entries, const='_P'):
        return (f'export const {const} = [\n'
                + ',\n'.join(f'  {e}' for e in entries) + '\n];\n')

    def test_entries_resolve_with_their_attributes(self):
        raw = ("{n:'Darya Zheleznyakova',w:" + P.format_js_literal("Women's Bantamweight")
               + ",ag:30,ht:69,rh:68,st:'Orthodox',wlb:135,_p_archived:false}")
        fallbacks = P.parse_prospect_fallbacks(self.prospects(raw))
        self.assertEqual(fallbacks, {'Darya Zheleznyakova': {
            'w': "Women's Bantamweight", 'st': 'Orthodox',
            'ag': 30, 'ht': 69, 'rh': 68, 'wlb': 135}})

    def test_identities_equal_parse_roster_names(self):
        body = self.prospects(
            r"{n:'Da\'Mon Blackshear',w:'Bantamweight',ag:30}",
            "{n:'Plain Prospect',w:'Flyweight',ag:25}",
        )
        self.assertEqual(list(P.parse_prospect_fallbacks(body)),
                         P.parse_roster(body, '_P').names)

    def test_comment_with_an_apostrophe_is_still_supported(self):
        body = (
            "export const _P = [\n"
            "  // ─── Darya Zheleznyakova vs Melissa Croden (Women's BW, Prelims) ───\n"
            "  {n:'Darya Zheleznyakova',w:'X',ag:30},\n"
            "  // ─── Mark Vologdin vs John Castaneda (Bantamweight, Prelims) ───\n"
            "  {n:'Mark Vologdin',w:'Y',ag:31},\n"
            '];\n'
        )
        self.assertEqual(list(P.parse_prospect_fallbacks(body)),
                         ['Darya Zheleznyakova', 'Mark Vologdin'])

    def test_missing_identity_hard_fails(self):
        for raw in ["{w:'Flyweight',ag:25}", "{n:null,w:'Flyweight'}", "{n:'',w:'X'}"]:
            with self.subTest(raw=raw):
                with self.assertRaises(P.JsParseError):
                    P.parse_prospect_fallbacks(
                        self.prospects("{n:'Keeper',w:'Flyweight'}", raw))

    def test_duplicate_identity_hard_fails(self):
        entry = "{n:'Twice Listed',w:'Flyweight',ag:25}"
        with self.assertRaises(P.JsParseError) as ctx:
            P.parse_prospect_fallbacks(self.prospects(entry, entry))
        self.assertIn('duplicate roster identity', str(ctx.exception))

    def test_unescaping_collision_hard_fails(self):
        """Different bytes, one decoded identity — keeping either would drop one."""
        with self.assertRaises(P.JsParseError) as ctx:
            P.parse_prospect_fallbacks(self.prospects(
                r"{n:'Da\'Mon Blackshear',w:'Bantamweight'}",
                r"{n:'\u0044a\'Mon Blackshear',w:'Bantamweight'}",
            ))
        self.assertIn('unescaping collision', str(ctx.exception))

    def test_malformed_object_hard_fails(self):
        for raw in ["{n:'A',w}", "{n:'A',w:}", "{n:'A' w:'X'}", "{n:'A,w:'X'}"]:
            with self.subTest(raw=raw):
                with self.assertRaises(P.JsParseError):
                    P.parse_prospect_fallbacks(self.prospects(raw))

    def test_missing_export_hard_fails(self):
        with self.assertRaises(P.JsParseError):
            P.parse_prospect_fallbacks("export const _NOT_P = [{n:'A',w:'X'}];\n")

    def test_stray_unclaimed_text_hard_fails(self):
        body = self.prospects("{n:'A',w:'X'}", "{n:'B',w:'Y'}").replace(
            ',\n', ',\n  <<stray>>\n', 1)
        with self.assertRaises(P.JsParseError) as ctx:
            P.parse_prospect_fallbacks(body)
        self.assertIn('unparsed text', str(ctx.exception))

    def test_no_input_can_silently_shrink_the_result(self):
        """Nothing short of a raise may return fewer entries than objects."""
        good = self.prospects("{n:'A',w:'X'}", "{n:'B',w:'Y'}", "{n:'C',w:'Z'}")
        self.assertEqual(len(P.parse_prospect_fallbacks(good)), 3)
        for label, body in {
            'missing identity': good.replace("{n:'B',w:'Y'}", "{w:'Y'}"),
            'duplicate': good.replace("{n:'B',w:'Y'}", "{n:'A',w:'Y'}"),
            'malformed': good.replace("{n:'B',w:'Y'}", "{n:'B',w:}"),
            'stray text': good.replace("{n:'B',w:'Y'}", "junk {n:'B',w:'Y'}"),
        }.items():
            with self.subTest(label=label):
                with self.assertRaises(P.JsParseError):
                    P.parse_prospect_fallbacks(body)


class TargetedPatching(unittest.TestCase):
    """The raw entry is spliced, never deserialised and re-serialised."""

    def test_only_the_named_fields_move(self):
        raw = OMALLEY_RAW
        out = P.patch_object_fields(raw, {'wi': '12', 'lfd': "'2026-06-14'"})
        self.assertEqual(
            out, r"{n:'Sean O\'Malley',w:'Bantamweight',tb:4,wi:12,lfd:'2026-06-14'}")
        # Identity and division bytes are untouched, escaping included.
        self.assertEqual(P.parse_object_fields(out)['n'].raw,
                         P.parse_object_fields(raw)['n'].raw)
        self.assertEqual(P.parse_object_fields(out)['w'].raw,
                         P.parse_object_fields(raw)['w'].raw)

    def test_appending_a_field_preserves_the_rest(self):
        out = P.append_object_field(PLAIN_RAW, 'sapm', 'null')
        self.assertTrue(out.startswith(PLAIN_RAW[:-1]))
        self.assertEqual(P.parse_object_fields(out)['sapm'].value, None)
        with self.assertRaises(P.JsParseError):
            P.append_object_field(out, 'sapm', 'null')


if __name__ == '__main__':
    unittest.main(verbosity=2)
