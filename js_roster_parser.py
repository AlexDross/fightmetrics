"""
js_roster_parser.py — one tokenizer for the generated JavaScript data modules.

IMPORT-SAFE. Importing this module reads no file, downloads no feed and runs no
part of the updater, so the grammar can be unit-tested without pandas or the
Greco CSVs on disk.

Why it exists
-------------
update_fighters.py used to read src/fightersData.js with two independently
written regexes — one for the identity, one for the division:

    re.finditer(r"\\{n:'([^']+)'[^}]+\\}", js_content)
    re.search(r"w:'([^']*)'", entry_str)

`[^']` cannot cross the backslash of an escaped apostrophe, so both stopped one
character early:

    n:'Sean O\\'Malley'      ->  "Sean O\\"
    w:'Women\\'s Flyweight'  ->  "Women\\"

The first froze record and aggregate updates for every apostrophe-named fighter:
their decoded identity never matched a CSV-derived update key, so they silently
fell out of the update path. The second shipped 1,849 fightHistory entries whose
weight class is the literal string "Women\\".

They are the same defect twice, which is why identity and division are decoded
by the SAME scanner here. A second field-specific pattern cannot be added
without also bypassing this module, which the unit tests assert against.

Fail-closed by construction
---------------------------
An object that does not parse, text the tokenizer did not claim, an identity
that appears twice, or two different escapes that decode to the same identity
all raise JsParseError. Nothing is skipped quietly — a fighter disappearing
from the roster is exactly the failure this module exists to prevent.

No eval, no exec, no Node, no permissive JavaScript evaluator: the roster is
data, and it is read as data.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


class JsParseError(ValueError):
    """Generated JavaScript could not be decoded unambiguously."""


# ─── string literals ──────────────────────────────────────────────────────────

_SIMPLE_ESCAPES = {
    'n': '\n', 't': '\t', 'r': '\r', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0',
}
_HEX = '0123456789abcdefABCDEF'


def js_escape(value) -> str:
    """Encode a Python value as the BODY of a single-quoted JS string literal.

    The inverse of decode_js_string. Backslash first, or escaping the
    apostrophe would then escape its own backslash.
    """
    return str(value).replace('\\', '\\\\').replace("'", "\\'")


def _decode_escape(text: str, i: int) -> Tuple[str, int]:
    """`text[i]` is a backslash. Return (decoded text, index past the escape)."""
    if i + 1 >= len(text):
        raise JsParseError('string literal ends with a dangling backslash')
    ch = text[i + 1]
    if ch == 'u':
        if i + 2 < len(text) and text[i + 2] == '{':
            close = text.find('}', i + 3)
            if close == -1:
                raise JsParseError('unterminated \\u{...} escape')
            digits = text[i + 3:close]
            if not digits or any(c not in _HEX for c in digits):
                raise JsParseError(f'malformed \\u{{...}} escape: {text[i:close + 1]!r}')
            return chr(int(digits, 16)), close + 1
        digits = text[i + 2:i + 6]
        if len(digits) < 4 or any(c not in _HEX for c in digits):
            raise JsParseError(f'malformed \\u escape: {text[i:i + 6]!r}')
        return chr(int(digits, 16)), i + 6
    if ch == 'x':
        digits = text[i + 2:i + 4]
        if len(digits) < 2 or any(c not in _HEX for c in digits):
            raise JsParseError(f'malformed \\x escape: {text[i:i + 4]!r}')
        return chr(int(digits, 16)), i + 4
    if ch == '\n':
        return '', i + 2  # line continuation
    # Covers \\ -> \, \' -> ', \" -> " and \/ -> / by falling through.
    return _SIMPLE_ESCAPES.get(ch, ch), i + 2


def _scan_string(text: str, i: int) -> Tuple[str, int]:
    """`text[i]` is an opening quote. Return (decoded value, index past close).

    This is the ONLY place a quoted literal is consumed. Object splitting,
    field parsing and value decoding all route through it, so a `}` or a comma
    inside a quoted field can never terminate the object that contains it.
    """
    quote = text[i]
    i += 1
    out: List[str] = []
    while i < len(text):
        ch = text[i]
        if ch == '\\':
            piece, i = _decode_escape(text, i)
            out.append(piece)
            continue
        if ch == quote:
            return ''.join(out), i + 1
        out.append(ch)
        i += 1
    raise JsParseError('unterminated string literal')


def decode_js_string(body: str) -> str:
    """Decode the body of a quoted literal — the text BETWEEN the quotes."""
    value, end = _scan_string("'" + body + "'", 0)
    if end != len(body) + 2:
        raise JsParseError(f'quoted body closes early: {body!r}')
    return value


def format_js_literal(value) -> str:
    """Render a Python value as the JS literal the generated modules use."""
    if value is None:
        return 'null'
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, str):
        return f"'{js_escape(value)}'"
    return str(value)


# ─── objects and arrays ───────────────────────────────────────────────────────

_IDENT_RE = re.compile(r'[A-Za-z_$][A-Za-z0-9_$]*')
_NUMBER_RE = re.compile(r'-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?')
_KEYWORD_RE = re.compile(r'(?:null|true|false)(?![A-Za-z0-9_$])')
_KEYWORDS = {'null': None, 'true': True, 'false': False}
_WS = ' \t\r\n'


def _skip_comment(text: str, i: int) -> int:
    """If a comment starts at `text[i]`, return the index past it, else `i`.

    src/prospectsData.js is hand-maintained and carries `//` section headers
    between entries, one of which reads "(Women's BW, Prelims)". A scanner that
    does not know about comments treats that apostrophe as an opening quote and
    silently loses brace parity for the rest of the file.
    """
    if text.startswith('//', i):
        nl = text.find('\n', i)
        return len(text) if nl == -1 else nl + 1
    if text.startswith('/*', i):
        close = text.find('*/', i + 2)
        if close == -1:
            raise JsParseError('unterminated block comment')
        return close + 2
    return i


def _first_significant(text: str) -> Optional[str]:
    """Return the first run of text that is not whitespace, a comma or a comment."""
    i = 0
    n = len(text)
    while i < n:
        if text[i] in _WS or text[i] == ',':
            i += 1
            continue
        j = _skip_comment(text, i)
        if j == i:
            return text[i:i + 80]
        i = j
    return None


def _skip_trivia(text: str, i: int, end: int) -> int:
    """Skip whitespace and comments."""
    while i < end:
        if text[i] in _WS:
            i += 1
            continue
        j = _skip_comment(text, i)
        if j == i:
            return i
        i = min(j, end)
    return i


def _scan_bracketed(text: str, i: int) -> int:
    """`text[i]` is `{` or `[`. Return the index just past its match."""
    openers = {'{': '}', '[': ']'}
    if text[i] not in openers:
        raise JsParseError(f'expected an object or array at offset {i}')
    stack = [openers[text[i]]]
    i += 1
    while i < len(text):
        ch = text[i]
        if ch in ("'", '"'):
            _, i = _scan_string(text, i)
            continue
        if ch == '/':
            j = _skip_comment(text, i)
            if j != i:
                i = j
                continue
        if ch in openers:
            stack.append(openers[ch])
            i += 1
            continue
        if ch in ('}', ']'):
            if ch != stack[-1]:
                raise JsParseError(f'mismatched {ch!r} at offset {i}')
            stack.pop()
            i += 1
            if not stack:
                return i
            continue
        i += 1
    raise JsParseError('unterminated object or array literal')


def scan_top_level_objects(array_body: str) -> List[Tuple[int, int]]:
    """Return (start, end) offsets of each top-level `{...}` in an array body."""
    spans: List[Tuple[int, int]] = []
    depth = 0
    start: Optional[int] = None
    i = 0
    n = len(array_body)
    while i < n:
        ch = array_body[i]
        if ch in ("'", '"'):
            _, i = _scan_string(array_body, i)
            continue
        if ch == '/':
            j = _skip_comment(array_body, i)
            if j != i:
                i = j
                continue
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            if depth == 0:
                raise JsParseError('unbalanced "}" at the top level of the array body')
            depth -= 1
            if depth == 0 and start is not None:
                spans.append((start, i + 1))
                start = None
        i += 1
    if depth != 0:
        raise JsParseError('unterminated object literal in the array body')
    return spans


@dataclass(frozen=True)
class JsField:
    """One `key: value` pair, with the value's exact source text preserved.

    `raw` and the offsets are what make targeted patching possible: a field can
    be spliced in place without deserialising and re-serialising the object, so
    every byte the updater did not mean to touch survives untouched.
    """

    key: str
    raw: str
    value: object
    is_string: bool
    start: int
    end: int


def _scan_value(text: str, i: int) -> Tuple[object, bool, int]:
    ch = text[i]
    if ch in ("'", '"'):
        value, j = _scan_string(text, i)
        return value, True, j
    if ch in '{[':
        j = _scan_bracketed(text, i)
        return text[i:j], False, j
    m = _KEYWORD_RE.match(text, i)
    if m:
        return _KEYWORDS[m.group(0)], False, m.end()
    m = _NUMBER_RE.match(text, i)
    if m:
        num = float(m.group(0))
        return (int(num) if num.is_integer() else num), False, m.end()
    raise JsParseError(f'unrecognised value at offset {i}: {text[i:i + 30]!r}')


def parse_object_fields(obj_str: str) -> Dict[str, JsField]:
    """Decode one `{...}` literal into its fields, in source order."""
    if not (obj_str.startswith('{') and obj_str.endswith('}')):
        raise JsParseError(f'not an object literal: {obj_str[:80]!r}')
    fields: Dict[str, JsField] = {}
    end = len(obj_str) - 1
    i = _skip_trivia(obj_str, 1, end)
    while i < end:
        if obj_str[i] in ("'", '"'):
            key, i = _scan_string(obj_str, i)
        else:
            m = _IDENT_RE.match(obj_str, i)
            if not m:
                raise JsParseError(
                    f'expected a field name at offset {i} in {obj_str[:80]!r}')
            key, i = m.group(0), m.end()
        i = _skip_trivia(obj_str, i, end)
        if i >= end or obj_str[i] != ':':
            raise JsParseError(f'expected ":" after {key!r} in {obj_str[:80]!r}')
        i = _skip_trivia(obj_str, i + 1, end)
        if i >= end:
            raise JsParseError(f'field {key!r} has no value in {obj_str[:80]!r}')
        value_start = i
        value, is_string, i = _scan_value(obj_str, i)
        if i > end:
            raise JsParseError(f'field {key!r} runs past the object in {obj_str[:80]!r}')
        if key in fields:
            raise JsParseError(f'duplicate field {key!r} in {obj_str[:80]!r}')
        fields[key] = JsField(key, obj_str[value_start:i], value, is_string, value_start, i)
        i = _skip_trivia(obj_str, i, end)
        if i >= end:
            break
        if obj_str[i] != ',':
            raise JsParseError(
                f'expected "," after {key!r} in {obj_str[:80]!r}, found {obj_str[i]!r}')
        i = _skip_trivia(obj_str, i + 1, end)
    return fields


def field_string(fields: Dict[str, JsField], key: str) -> Optional[str]:
    """Decoded value of a quoted field, or None if absent or not a string.

    Takes an already-parsed field map rather than raw text on purpose. There is
    no by-key read path that re-scans an object: every caller goes through
    parse_roster / parse_object_fields once, so no field can be decoded by a
    grammar the rest of the file did not use.
    """
    field = fields.get(key)
    if field is None or not field.is_string:
        return None
    return field.value


def field_number(fields: Dict[str, JsField], key: str):
    """Numeric value of a field, or None if absent, null or not a number."""
    field = fields.get(key)
    if (field is None or field.is_string or isinstance(field.value, bool)
            or not isinstance(field.value, (int, float))):
        return None
    return field.value


def patch_object_fields(obj_str: str, updates: Dict[str, str]) -> str:
    """Splice new literals into an object, leaving every other byte alone.

    `updates` maps field name -> already-formatted JS literal. Patching an
    absent field is a hard error: silently skipping it is how a fighter stops
    being updated without anyone noticing.
    """
    if not updates:
        return obj_str
    fields = parse_object_fields(obj_str)
    missing = sorted(k for k in updates if k not in fields)
    if missing:
        raise JsParseError(f'cannot patch missing field(s) {missing} in {obj_str[:80]!r}')
    out = obj_str
    for field in sorted(fields.values(), key=lambda f: f.start, reverse=True):
        if field.key in updates:
            out = out[:field.start] + updates[field.key] + out[field.end:]
    return out


def append_object_field(obj_str: str, key: str, literal: str) -> str:
    """Add a field to an object. Raises if it is already present."""
    if key in parse_object_fields(obj_str):
        raise JsParseError(f'field {key!r} is already present in {obj_str[:80]!r}')
    return obj_str[:-1] + f',{key}:{literal}' + '}'


def extract_array_body(content: str, const_name: str) -> str:
    """Return the text between the brackets of `export const <name> = [ ... ]`."""
    m = re.search(rf'export\s+const\s+{re.escape(const_name)}\s*=\s*\[', content)
    if not m:
        raise JsParseError(f'no `export const {const_name} = [` in the module')
    open_idx = m.end() - 1
    close_idx = _scan_bracketed(content, open_idx) - 1
    return content[open_idx + 1:close_idx]


# ─── roster ───────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class RosterEntry:
    name: str
    raw: str
    fields: Dict[str, JsField]


@dataclass(frozen=True)
class RosterParse:
    entries: List[RosterEntry]
    by_name: Dict[str, RosterEntry]

    @property
    def object_count(self) -> int:
        return len(self.entries)

    @property
    def names(self) -> List[str]:
        return [entry.name for entry in self.entries]


def parse_roster(content: str, const_name: str = '_D2', name_key: str = 'n') -> RosterParse:
    """Decode a generated roster module into entries keyed by decoded identity.

    Every guarantee here is a guard against the class of bug this module was
    written for — an entry that quietly stops being seen.
    """
    body = extract_array_body(content, const_name)
    spans = scan_top_level_objects(body)

    # Nothing may live between the objects but whitespace and separators. If the
    # tokenizer had skipped an entry, its text would surface here as residue
    # instead of vanishing.
    cursor = 0
    for start, stop in spans:
        stray = _first_significant(body[cursor:start])
        if stray is not None:
            raise JsParseError(f'unparsed text between roster objects: {stray!r}')
        cursor = stop
    stray = _first_significant(body[cursor:])
    if stray is not None:
        raise JsParseError(f'unparsed text after the last roster object: {stray!r}')

    entries: List[RosterEntry] = []
    by_name: Dict[str, RosterEntry] = {}
    raw_name_by_name: Dict[str, str] = {}
    for start, stop in spans:
        raw = body[start:stop]
        fields = parse_object_fields(raw)
        name_field = fields.get(name_key)
        if name_field is None or not name_field.is_string:
            raise JsParseError(
                f'roster object has no decodable {name_key!r} identity: {raw[:80]!r}')
        name = name_field.value
        if not name:
            raise JsParseError(f'roster object has an empty {name_key!r}: {raw[:80]!r}')
        if name in by_name:
            previous = raw_name_by_name[name]
            if previous == name_field.raw:
                raise JsParseError(f'duplicate roster identity {name!r}')
            raise JsParseError(
                f'unescaping collision: {previous} and {name_field.raw} '
                f'both decode to {name!r}')
        entry = RosterEntry(name, raw, fields)
        entries.append(entry)
        by_name[name] = entry
        raw_name_by_name[name] = name_field.raw

    if len(entries) != len(spans):
        raise JsParseError(
            f'parsed {len(entries)} objects but the roster contains {len(spans)}')
    if len(by_name) != len(entries):
        raise JsParseError('decoded roster identities are not unique')
    return RosterParse(entries, by_name)


# Physical attributes the updater falls back to when seeding a debuting fighter.
# Nothing else is read out of the prospect file.
PROSPECT_STRING_FIELDS = ('w', 'st')
PROSPECT_NUMBER_FIELDS = ('ag', 'ht', 'rh', 'wlb')


def parse_prospect_fallbacks(content: str, const_name: str = '_P') -> Dict[str, Dict]:
    """Decode src/prospectsData.js into {identity: {attribute: value}}.

    Import-safe: takes the file's text, reads nothing itself.

    This goes through parse_roster and nothing else. It does not extract, split
    or re-parse objects on its own, and it builds each fallback from the fields
    parse_roster already decoded. That matters because the prospect file is the
    newly widened half of this read path, and every way it could quietly lose an
    entry is the defect correction 5 exists to remove:

      * an object with no decodable `n`      -> parse_roster raises
      * a malformed object or missing export -> parse_roster raises
      * text the tokenizer did not claim     -> parse_roster raises
      * a duplicate decoded identity         -> parse_roster raises
      * two escapes decoding to one identity -> parse_roster raises

    So no caller can turn a broken prospect file into a smaller dict.
    """
    roster = parse_roster(content, const_name)
    fallbacks = {
        entry.name: {
            **{key: field_string(entry.fields, key) for key in PROSPECT_STRING_FIELDS},
            **{key: field_number(entry.fields, key) for key in PROSPECT_NUMBER_FIELDS},
        }
        for entry in roster.entries
    }
    # parse_roster already guarantees unique identities; assert it rather than
    # trust it, because a dict build is exactly where a duplicate would vanish.
    if len(fallbacks) != roster.object_count:
        raise JsParseError(
            f'{roster.object_count} prospect objects collapsed into '
            f'{len(fallbacks)} identities')
    return fallbacks
