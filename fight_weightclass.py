"""Correction 6A — the one strict parser for raw WEIGHTCLASS values.

`ufc_fight_results.csv` carries a bout-local WEIGHTCLASS on every row. That is
the ONLY authoritative source for a historical bout's division and title status.
Before this correction the updater read WEIGHTCLASS from `ufc_fight_details.csv`
— whose columns are exactly EVENT,BOUT,URL — so `detail_lookup` supplied '' for
all 8,847 bouts, the history rebuild fell back to the fighter's CURRENT roster
division, and title status collapsed to an event-NAME substring heuristic.

WHAT THIS PARSER IS NOT ALLOWED TO DO
  * consult a fighter's current roster `w`, or any wc_lookup
  * decide title status from the event name
  * treat a bare `'title' in label` test as the complete classifier: the five
    legacy `UFC Superfight Championship Bout` rows contain no "Title" token at
    all, and `\bTitle\b` does not match the concatenated `TitleBout` spelling
    while `'title' in s.lower()` does — the two obvious implementations
    disagree on exactly three rows, so R2 normalises the spelling first
  * be replaced by `clean_wc`, which strips the bare words UFC/Title/Bout/
    Interim anywhere in the string and therefore destroys interim status
    (`UFC Interim Heavyweight Title Bout` -> 'Heavyweight') and mangles
    tournament labels (`UFC 17 Middleweight Tournament Title Bout` ->
    '17 Middleweight Tournament')

CLOSED WORLD. Every label must resolve through the reviewed vocabulary or the
reviewed no-token map. Anything else raises WeightclassParseError rather than
guessing; `scripts/gate_closed_labels.py` runs the same rules across the whole
feed before the updater writes anything.
"""

import re

__all__ = [
    'WeightclassParseError',
    'CANONICAL_DIVISIONS',
    'SUPPORTED_DIVISIONS',
    'REVIEWED_NO_TOKEN_LABELS',
    'parse_weightclass',
]


class WeightclassParseError(ValueError):
    """Raised for any label the reviewed taxonomy does not cover."""


# The twelve ratified canonical divisions.
CANONICAL_DIVISIONS = (
    'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
    'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight',
    "Women's Strawweight", "Women's Flyweight",
    "Women's Bantamweight", "Women's Featherweight",
)

# Everything `wc` may legally hold. Catch/Open/Super Heavyweight are genuine
# bout weight arrangements, not divisions, and are stored as themselves.
SUPPORTED_DIVISIONS = CANONICAL_DIVISIONS + (
    'Catch Weight', 'Open Weight', 'Super Heavyweight',
)

# Division-token vocabulary. `Strawweight` is currently unexercised (every
# strawweight row in the pinned feed is "Women's Strawweight"); it is retained
# so a future unprefixed label is a reviewable event rather than a silent miss.
_VOCABULARY = CANONICAL_DIVISIONS + ('Super Heavyweight', 'Strawweight')

# Labels that carry no division token at all. All predate UFC 12, the first
# card with weight-class title fights; UFC history records Ultimate Ultimate '96
# as the last event contested without weight classes.
#   https://www.ufc.com/news/fast-facts-our-20th-anniversary  (accessed 2026-08-14)
# Fifteen raw rows / fifteen canonical bouts / thirty history corners.
REVIEWED_NO_TOKEN_LABELS = {
    'UFC 2 Tournament Title Bout': 'Open Weight',
    'UFC 3 Tournament Title Bout': 'Open Weight',
    'UFC 4 Tournament Title Bout': 'Open Weight',
    'UFC 5 Tournament Title Bout': 'Open Weight',
    'UFC 6 Tournament Title Bout': 'Open Weight',
    'UFC 7 Tournament Title Bout': 'Open Weight',
    'UFC 8 Tournament Title Bout': 'Open Weight',
    'UFC 10 Tournament Title Bout': 'Open Weight',
    "Ultimate Ultimate '95 Tournament Title Bout": 'Open Weight',
    "Ultimate Ultimate '96 Tournament Title Bout": 'Open Weight',
    'UFC Superfight Championship Bout': 'Open Weight',
}

_TOURNAMENT_FINAL = re.compile(r'\btournament title bout\b')
_INTERIM = re.compile(r'\binterim\b')
_UFC_TITLE = re.compile(r'^ufc\b.*\btitle bout$')
_SUPERFIGHT = re.compile(r'\bsuperfight championship\b')
_CATCHWEIGHT = re.compile(r'\bcatch ?weight\b')
_OPENWEIGHT = re.compile(r'\bopen ?weight\b')


def _normalise(raw):
    """R0/R1/R2 — trim, collapse whitespace, repair the TitleBout spelling."""
    if raw is None or not isinstance(raw, str):
        raise WeightclassParseError(f'WEIGHTCLASS is not a string: {raw!r}')
    s = re.sub(r'\s+', ' ', raw).strip()
    if not s:
        raise WeightclassParseError('WEIGHTCLASS is blank')
    # Three Road-to-UFC-3 rows spell it 'TitleBout'. Normalising here means one
    # word-boundary rule governs every spelling downstream.
    return re.sub(r'TitleBout', 'Title Bout', s)


def _division_token(low, raw):
    """R7 — exactly one division token, with containment collapse.

    'Heavyweight' is a substring of both 'Light Heavyweight' and 'Super
    Heavyweight'; collapsing by containment (rather than relying on match
    order) is what keeps them from counting as two independent tokens.
    """
    hits = [d for d in _VOCABULARY if re.search(r'\b' + re.escape(d.lower()) + r'\b', low)]
    primary = []
    for token in sorted(hits, key=len, reverse=True):
        if not any(token.lower() in kept.lower() for kept in primary):
            primary.append(token)
    if len(primary) > 1:
        raise WeightclassParseError(
            f'contradictory label carries {len(primary)} independent division '
            f'tokens {sorted(primary)!r}: {raw!r}')
    return primary[0] if primary else None


def parse_weightclass(raw):
    """Parse one raw WEIGHTCLASS value into bout-local metadata.

    Returns a dict with independently meaningful fields:
      division          canonical division string, always in SUPPORTED_DIVISIONS
      championship      UFC undisputed / interim / Superfight championship
      interim           interim championship
      tournament_final  TUF, Road to UFC or early-UFC bracket final
      category          reviewed taxonomy bucket, for audit
      raw               the original label, verbatim
    Raises WeightclassParseError on anything the reviewed taxonomy misses.
    """
    normalised = _normalise(raw)
    low = normalised.lower()

    tournament_final = bool(_TOURNAMENT_FINAL.search(low))
    interim = bool(_INTERIM.search(low))
    superfight = bool(_SUPERFIGHT.search(low))
    # A tournament final is never a championship, however it is worded.
    championship = (bool(_UFC_TITLE.match(low)) and not tournament_final) or superfight

    if superfight:
        category = 'SUPERFIGHT_CHAMPIONSHIP'
    elif tournament_final:
        category = 'TOURNAMENT_FINAL'
    elif interim and championship:
        category = 'INTERIM_TITLE'
    elif championship:
        category = 'UFC_TITLE'
    elif _CATCHWEIGHT.search(low):
        category = 'CATCHWEIGHT'
    elif _OPENWEIGHT.search(low):
        category = 'OPENWEIGHT'
    elif normalised == 'Super Heavyweight Bout':
        category = 'SUPER_HEAVYWEIGHT'
    else:
        category = 'ORDINARY'

    # R6 — catchweight and open weight are decided before the token scan; they
    # are weight arrangements, not divisions, and must not be division-matched.
    if category == 'CATCHWEIGHT':
        division = 'Catch Weight'
    elif category == 'OPENWEIGHT':
        division = 'Open Weight'
    else:
        division = _division_token(low, raw)
        if division is None:
            # R8 — explicit reviewed map only. There is no general fallback.
            division = REVIEWED_NO_TOKEN_LABELS.get(normalised)
            if division is None:
                raise WeightclassParseError(
                    f'unreviewed label with no division token: {raw!r}')

    if division not in SUPPORTED_DIVISIONS:
        raise WeightclassParseError(
            f'label resolved to unsupported division {division!r}: {raw!r}')

    return {
        'division': division,
        'championship': championship,
        'interim': interim,
        'tournament_final': tournament_final,
        'category': category,
        'raw': raw,
    }
