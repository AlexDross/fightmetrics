#!/usr/bin/env python3
"""Refresh FightMetrics rankings from the reviewed history cache and UFC.com.

Two sources, kept strictly apart:

  * The reviewed Kaggle-derived history cache
    (data/rankings/kaggle-history-through-2026-06-18.json) is the historical
    baseline. It stops at the last unambiguous media-only Kaggle snapshot,
    2026-06-18. After that date the four-column Kaggle CSV merges traditional
    media and Meta rankings with no source column, so the two systems cannot be
    separated losslessly and those rows are excluded.

  * UFC.com supplies source-labelled `media` and `meta` snapshots for the
    current tables. Only `media` extends the historical series.

Normal runs are offline for the history half: the cache is committed, so
regeneration never depends on Kaggle staying online and is byte-for-byte
reproducible. `--refresh-kaggle` rebuilds the cache from the upstream dataset.

Historical rankings are a data/research artifact. No runtime model code
consumes them -- see data/rankings/README.md.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import re
import unicodedata
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_DIR = ROOT / 'data' / 'rankings' / 'snapshots'
HISTORY_CACHE_PATH = (
    ROOT / 'data' / 'rankings' / 'kaggle-history-through-2026-06-18.json'
)
# Two generated artifacts, deliberately separate files.
#   CURRENT_OUTPUT_PATH ships to browsers: current tables only.
#   HISTORY_OUTPUT_PATH is offline research data and must never enter the
#   production dependency graph -- see data/rankings/README.md.
CURRENT_OUTPUT_PATH = ROOT / 'src' / 'rankingsData.js'
HISTORY_OUTPUT_PATH = ROOT / 'src' / 'rankingsHistoryData.js'
KAGGLE_DATASET = 'jerzyszocik/ufc-rankings-history'
KAGGLE_DOWNLOAD_URL = (
    'https://www.kaggle.com/api/v1/datasets/download/' + KAGGLE_DATASET
)
KAGGLE_METADATA_URL = (
    'https://www.kaggle.com/api/v1/datasets/view/' + KAGGLE_DATASET
)
UFC_RANKINGS_URL = 'https://www.ufc.com/rankings'
HISTORY_CUTOFF = '2026-06-18'
PRIMARY_SOURCE = 'media'
USER_AGENT = 'FightMetrics rankings importer/1.0'
SEP = '\x1f'

DIVISIONS = {
    'Bantamweight',
    'Featherweight',
    'Flyweight',
    'Heavyweight',
    'Light Heavyweight',
    'Lightweight',
    'Middleweight',
    'Welterweight',
    "Women's Bantamweight",
    "Women's Featherweight",
    "Women's Flyweight",
    "Women's Strawweight",
}
# Divisions UFC still publishes. Anything in DIVISIONS but not here is retired:
# its final ranked state must be closed out with tombstones rather than left
# ranked forever just because the division stopped being published.
ACTIVE_DIVISIONS = DIVISIONS - {"Women's Featherweight"}

CHAMPION_RANK = 0
MAX_CONTENDER_RANK = 15

# Completeness thresholds for `--refresh-kaggle`. Calibrated against the full
# 2013-2026 reviewed history, where the largest legitimate single-snapshot
# shrink of any division is 2 fighters. These catch truncated downloads and
# mass-partial upstream scrapes without rejecting genuine historical eras --
# early-2013 divisions held 10-12 athletes and Women's Featherweight ran with a
# champion and no contenders, so absolute minimum sizes are NOT asserted.
MAX_DIVISION_SHRINK = 4
HALVING_GUARD_MIN_SIZE = 6

SPECIAL_TRANSLATION = str.maketrans({
    '’': "'", '‘': "'", 'ʻ': "'", 'ʼ': "'",
    'ł': 'l', 'Ł': 'L', 'ø': 'o', 'Ø': 'O',
    'ð': 'd', 'Ð': 'D', 'þ': 'th', 'Þ': 'Th',
    'đ': 'd', 'Đ': 'D', 'ß': 'ss',
    'æ': 'ae', 'Æ': 'AE', 'œ': 'oe', 'Œ': 'OE',
})


class RankingsSourceError(RuntimeError):
    """Raised whenever a source is malformed, stale, partial or ambiguous.

    Every raise path leaves the committed artifacts untouched: the generator
    validates first and only then writes.
    """


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0)


def iso_z(value):
    return value.isoformat().replace('+00:00', 'Z')


def iso_date(ymd):
    """'20130204' -> '2013-02-04' for human-facing metadata."""
    text = str(ymd)
    return f'{text[0:4]}-{text[4:6]}-{text[6:8]}'


def base_name_key(value):
    if not isinstance(value, str):
        return ''
    value = value.translate(SPECIAL_TRANSLATION)
    value = ''.join(
        char for char in unicodedata.normalize('NFKD', value)
        if not unicodedata.combining(char)
    )
    value = value.lower().replace("'", '')
    return re.sub(r'[^a-z0-9]+', ' ', value).strip()


def load_aliases():
    aliases = {}
    for path in [ROOT / 'name_aliases.json', ROOT / 'rankings_aliases.json']:
        raw = json.loads(path.read_text(encoding='utf-8'))
        for source, target in raw.items():
            aliases[base_name_key(source)] = base_name_key(target)
    return aliases


def normalized_name(value, aliases):
    key = base_name_key(value)
    return aliases.get(key, key)


def history_key(division, fighter_key):
    return f'{division}{SEP}{fighter_key}'


def validated_rank(rank, where):
    """Champions are 0; contenders are 1..15. Anything else is rejected.

    The published tables have exactly one champion slot and fifteen numbered
    contender slots. Ties (two athletes sharing a contender number) do occur
    upstream and are legitimate, so only the VALUE domain is constrained here.
    """
    if isinstance(rank, bool) or not isinstance(rank, int):
        raise RankingsSourceError(f'Non-integer rank {rank!r} in {where}')
    if rank < CHAMPION_RANK or rank > MAX_CONTENDER_RANK:
        raise RankingsSourceError(
            f'Rank {rank} is outside the supported {CHAMPION_RANK}/'
            f'1..{MAX_CONTENDER_RANK} domain in {where}'
        )
    return rank


# ── reviewed history cache ───────────────────────────────────────────────────

def load_history_cache():
    if not HISTORY_CACHE_PATH.exists():
        raise RankingsSourceError(
            f'Missing reviewed history cache {HISTORY_CACHE_PATH}. '
            'Rebuild it with --refresh-kaggle.'
        )
    cache = json.loads(HISTORY_CACHE_PATH.read_text(encoding='utf-8'))
    if cache.get('schemaVersion') != 1:
        raise RankingsSourceError(
            f'Unsupported history cache schema in {HISTORY_CACHE_PATH}'
        )
    if cache.get('historyUsedThrough') != HISTORY_CUTOFF:
        raise RankingsSourceError(
            f'History cache cutoff {cache.get("historyUsedThrough")!r} does not '
            f'match the reviewed cutoff {HISTORY_CUTOFF!r}'
        )
    history = cache.get('history')
    if not isinstance(history, dict) or not history:
        raise RankingsSourceError('History cache contains no series')

    cutoff_ymd = int(HISTORY_CUTOFF.replace('-', ''))
    for key, entries in history.items():
        if SEP not in key:
            raise RankingsSourceError(f'Malformed history cache key {key!r}')
        division = key.split(SEP, 1)[0]
        if division not in DIVISIONS:
            raise RankingsSourceError(
                f'Unknown division {division!r} in history cache'
            )
        if not entries:
            raise RankingsSourceError(f'Empty history cache series {key!r}')
        if entries[0][1] is None:
            raise RankingsSourceError(
                f'History cache series {key!r} opens with a tombstone'
            )
        previous_date = None
        for date_value, rank in entries:
            if not isinstance(date_value, int) or date_value > cutoff_ymd:
                raise RankingsSourceError(
                    f'History cache series {key!r} has out-of-range date {date_value}'
                )
            if previous_date is not None and date_value <= previous_date:
                raise RankingsSourceError(
                    f'History cache series {key!r} is not strictly increasing '
                    f'at {date_value}'
                )
            previous_date = date_value
            if rank is not None:
                validated_rank(rank, f'history cache {key!r} @{date_value}')
    return cache


def cache_snapshots(cache):
    """Replay cached transitions into per-date, per-division full states."""
    history = cache['history']
    per_date = defaultdict(dict)
    for key, entries in history.items():
        division, fighter_key = key.split(SEP, 1)
        for date_value, rank in entries:
            per_date[date_value].setdefault(division, {})[fighter_key] = rank

    snapshots = []
    state = {}
    for date_value in sorted(per_date):
        for division, changes in per_date[date_value].items():
            current = dict(state.get(division, {}))
            for fighter_key, rank in changes.items():
                if rank is None:
                    current.pop(fighter_key, None)
                else:
                    current[fighter_key] = rank
            state[division] = current
        snapshots.append(
            (date_value, {d: dict(m) for d, m in sorted(state.items())})
        )
    return snapshots


def retired_division_closeouts(cache):
    """Tombstone dates for divisions UFC stopped publishing.

    A retired division's final snapshot leaves its athletes ranked. Left alone
    they would stay ranked forever purely because the division stopped being
    published, so each is closed out on the first snapshot date after its last
    recorded change -- the first date on which it demonstrably was not
    published. Derived from transition dates, not from carried-forward state.
    """
    last_change = {}
    for key, entries in cache['history'].items():
        division = key.split(SEP, 1)[0]
        last_change[division] = max(
            last_change.get(division, 0), max(d for d, _ in entries)
        )
    all_dates = sorted(int(d) for d in cache['snapshotDates'])

    closeouts = {}
    for division, last_date in last_change.items():
        if division in ACTIVE_DIVISIONS:
            continue
        following = [d for d in all_dates if d > last_date]
        if not following:
            raise RankingsSourceError(
                f'Retired division {division!r} has no later snapshot date to '
                'close it out on; review the history cache.'
            )
        closeouts[division] = following[0]
    return closeouts


# ── Kaggle refresh (optional) ────────────────────────────────────────────────

def request(session, url):
    response = session.get(url, timeout=45)
    response.raise_for_status()
    return response


def load_kaggle_csv(session, local_csv=None):
    if local_csv:
        content = Path(local_csv).read_bytes()
        metadata = {
            'currentVersionNumber': None,
            'lastUpdated': None,
            'licenseName': 'CC0: Public Domain',
        }
    else:
        metadata = request(session, KAGGLE_METADATA_URL).json()
        archive = request(session, KAGGLE_DOWNLOAD_URL).content
        with zipfile.ZipFile(io.BytesIO(archive)) as bundle:
            names = [n for n in bundle.namelist() if n.endswith('.csv')]
            if names != ['UFC_rankings_history.csv']:
                raise RankingsSourceError(
                    f'Unexpected Kaggle archive contents: {names}'
                )
            content = bundle.read(names[0])

    text = content.decode('utf-8-sig')
    reader = csv.DictReader(io.StringIO(text))
    expected = ['date', 'weightclass', 'fighter', 'rank']
    if reader.fieldnames != expected:
        raise RankingsSourceError(
            f'Unexpected Kaggle schema: {reader.fieldnames}; expected {expected}'
        )
    rows = list(reader)
    # The cutoff is what this pipeline actually consumes, so completeness is
    # asserted against the cutoff -- NOT against wall-clock freshness. Rows
    # after the cutoff are discarded, so their age is irrelevant and must never
    # fail a build.
    dates = {row['date'] for row in rows if row.get('date')}
    if not dates:
        raise RankingsSourceError('Kaggle history contains no dated rows')
    if max(dates) < HISTORY_CUTOFF:
        raise RankingsSourceError(
            f'Kaggle history stops at {max(dates)}, before the reviewed cutoff '
            f'{HISTORY_CUTOFF}; it cannot rebuild the cache.'
        )
    if HISTORY_CUTOFF not in dates:
        raise RankingsSourceError(
            f'Kaggle history is missing the required cutoff snapshot '
            f'{HISTORY_CUTOFF}'
        )
    return rows, metadata, hashlib.sha256(content).hexdigest()


def kaggle_snapshots(rows, aliases, quarantine):
    """Parse pre-cutoff Kaggle rows into per-date, per-division states."""
    quarantined = {
        (q['date'], q['division'], q['fighter'], q['rank']) for q in quarantine
    }
    seen_quarantine = set()
    snapshots = defaultdict(lambda: defaultdict(dict))
    conflicts = []
    for row in rows:
        division = row['weightclass']
        if row['date'] > HISTORY_CUTOFF or division not in DIVISIONS:
            continue
        if not row['fighter']:
            continue
        fighter_key = normalized_name(row['fighter'], aliases)
        ymd = row['date'].replace('-', '')
        try:
            rank = int(row['rank'])
        except (TypeError, ValueError):
            raise RankingsSourceError(
                f'Non-numeric rank {row["rank"]!r} on {row["date"]} '
                f'({division}, {row["fighter"]})'
            )
        marker = (ymd, division, fighter_key, rank)
        if marker in quarantined:
            seen_quarantine.add(marker)
            continue
        validated_rank(
            rank, f'Kaggle {row["date"]} {division} {row["fighter"]!r}'
        )
        previous = snapshots[row['date']][division].get(fighter_key)
        if previous is not None and previous != rank:
            conflicts.append(
                (row['date'], division, row['fighter'], previous, rank)
            )
        snapshots[row['date']][division][fighter_key] = rank
    if conflicts:
        raise RankingsSourceError(
            'Conflicting pre-cutoff Kaggle ranks: ' + repr(conflicts[:10])
        )
    if HISTORY_CUTOFF not in snapshots:
        raise RankingsSourceError(
            f'Kaggle history does not contain required cutoff {HISTORY_CUTOFF}'
        )
    stale = quarantined - seen_quarantine
    if stale:
        raise RankingsSourceError(
            f'Quarantine entries no longer match any upstream row: {sorted(stale)}. '
            'Re-review them instead of carrying dead exceptions.'
        )
    return snapshots


def assert_snapshot_completeness(snapshots):
    """Reject truncated downloads and mass-partial upstream scrapes.

    Works on relative change per division rather than absolute sizes, so
    legitimate historical eras with smaller or single-athlete divisions pass.
    """
    previous = {}
    for date_value in sorted(snapshots):
        divisions = snapshots[date_value]
        shrinking = []
        for division, members in divisions.items():
            before = previous.get(division)
            if before is None:
                previous[division] = len(members)
                continue
            after = len(members)
            if before - after >= MAX_DIVISION_SHRINK:
                raise RankingsSourceError(
                    f'{division} lost {before - after} ranked athletes on '
                    f'{date_value} ({before} -> {after}); refusing a partial '
                    'snapshot.'
                )
            if before >= HALVING_GUARD_MIN_SIZE and after * 2 < before:
                raise RankingsSourceError(
                    f'{division} more than halved on {date_value} '
                    f'({before} -> {after}); refusing a partial snapshot.'
                )
            if after < before:
                shrinking.append(division)
            previous[division] = after
        if len(divisions) >= 4 and len(shrinking) == len(divisions):
            raise RankingsSourceError(
                f'Every division shrank on {date_value}; refusing what looks '
                'like a truncated snapshot.'
            )


def build_history_cache(rows, metadata, content_hash, aliases, quarantine):
    snapshots = kaggle_snapshots(rows, aliases, quarantine)
    keyed = {int(d.replace('-', '')): v for d, v in snapshots.items()}
    assert_snapshot_completeness(keyed)

    histories = defaultdict(list)
    previous_by_division = {}
    for date_value in sorted(keyed):
        for division, current in sorted(keyed[date_value].items()):
            previous = previous_by_division.get(division)
            if previous is None:
                for fighter_key, rank in sorted(current.items()):
                    histories[history_key(division, fighter_key)].append(
                        [date_value, rank]
                    )
            else:
                for fighter_key in sorted(set(previous) | set(current)):
                    if previous.get(fighter_key) != current.get(fighter_key):
                        histories[history_key(division, fighter_key)].append(
                            [date_value, current.get(fighter_key)]
                        )
            previous_by_division[division] = current

    return {
        'schemaVersion': 1,
        'note': (
            'Reviewed Kaggle-derived divisional rankings through the last '
            'unambiguous media-only snapshot. Regenerate with: python '
            'scripts/update_rankings.py --refresh-kaggle'
        ),
        'historyUsedThrough': HISTORY_CUTOFF,
        'postCutoverPolicy': (
            'Rows after 2026-06-18 are excluded because the four-column '
            'dataset merges media and Meta rankings without a source field.'
        ),
        'source': {
            'dataset': KAGGLE_DATASET,
            'downloadUrl': KAGGLE_DOWNLOAD_URL,
            'license': metadata.get('licenseName') or 'CC0: Public Domain',
            'version': metadata.get('currentVersionNumber'),
            'lastUpdated': metadata.get('lastUpdated'),
            'contentSha256': content_hash,
        },
        'firstSnapshot': min(snapshots),
        'snapshotDates': [str(d) for d in sorted(keyed)],
        'quarantinedRows': quarantine,
        'history': dict(sorted(histories.items())),
    }


def write_history_cache(cache):
    envelope = {k: v for k, v in cache.items() if k != 'history'}
    body = json.dumps(envelope, indent=2, ensure_ascii=False, sort_keys=True)
    parts = [body[:-2], ',\n  "history": {\n']
    keys = sorted(cache['history'])
    for index, key in enumerate(keys):
        entries = json.dumps(cache['history'][key], separators=(',', ':'))
        comma = ',' if index < len(keys) - 1 else ''
        parts.append(
            f'    {json.dumps(key, ensure_ascii=False)}: {entries}{comma}\n'
        )
    parts.append('  }\n}\n')
    HISTORY_CACHE_PATH.write_text(''.join(parts), encoding='utf-8')


# ── official UFC snapshots ───────────────────────────────────────────────────

def parse_update_date(text, fetched_at):
    match = re.search(
        r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2})',
        text,
    )
    if not match:
        raise RankingsSourceError(f'Cannot parse UFC update date from {text!r}')
    month = datetime.strptime(match.group(1), '%b').month
    year = fetched_at.year - (1 if month > fetched_at.month + 1 else 0)
    try:
        parsed = datetime(year, month, int(match.group(2)), tzinfo=timezone.utc).date()
    except ValueError as error:
        raise RankingsSourceError(f'Invalid UFC update date in {text!r}: {error}')
    if parsed > fetched_at.date():
        raise RankingsSourceError(
            f'UFC update date {parsed} is in the future relative to {fetched_at.date()}'
        )
    return parsed.isoformat()


def athlete_from_anchor(anchor):
    if anchor is None:
        return None
    href = anchor.get('href') or ''
    return {
        'displayName': anchor.get_text(' ', strip=True),
        'athleteSlug': href.rstrip('/').split('/')[-1] or None,
    }


def parse_movement(text):
    if not text:
        return None, None
    if text == 'NR':
        return 'new', None
    match = re.search(r'Rank (increased|decreased) by\s*(\d+)', text)
    if not match:
        return None, None
    amount = int(match.group(2))
    return ('up', amount) if match.group(1) == 'increased' else ('down', -amount)


def parse_ufc_snapshot(html, source, fetched_at):
    from bs4 import BeautifulSoup

    selectors = {
        'media': (
            '.block-views-blockathlete-rankings-block-1',
            '.views-field-weight-class-rank',
            '.views-field-weight-class-rank-change',
        ),
        'meta': (
            '.block-views-blockathlete-rankings-meta-rankings',
            '.views-field-meta-weight-class-rank',
            '.views-field-meta-weight-class-rank-change',
        ),
    }
    root_selector, rank_selector, movement_selector = selectors[source]
    soup = BeautifulSoup(html, 'html.parser')
    root = soup.select_one(root_selector)
    if root is None:
        raise RankingsSourceError(
            f'UFC {source} rankings root not found: {root_selector}'
        )
    footer = soup.select_one(
        f'p.list-denotions__updated[data-rankings-footer="{source}"]'
    )
    if footer is None:
        raise RankingsSourceError(
            f'UFC {source} rankings update footer not found'
        )
    updated_at = parse_update_date(footer.get_text(' ', strip=True), fetched_at)

    divisions = {}
    pound_for_pound = {}
    for group in root.select('.view-grouping'):
        header = group.select_one('.view-grouping-header')
        if header is None:
            continue
        category = header.get_text(' ', strip=True)
        rows = []
        for table_row in group.select('tbody tr'):
            rank_cell = table_row.select_one(rank_selector)
            anchor = table_row.select_one('.views-field-title a')
            if rank_cell is None or anchor is None:
                continue
            rank_text = rank_cell.get_text(' ', strip=True)
            if not rank_text.isdigit():
                raise RankingsSourceError(
                    f'Invalid {source} rank {rank_text!r} in {category}'
                )
            rank = validated_rank(int(rank_text), f'{source} {category}')
            movement_cell = table_row.select_one(movement_selector)
            movement_text = (
                movement_cell.get_text(' ', strip=True) if movement_cell else ''
            )
            movement_status, movement = parse_movement(movement_text)
            rows.append({
                **athlete_from_anchor(anchor),
                'rank': rank,
                'status': 'contender',
                'movementStatus': movement_status,
                'movement': movement,
                'movementText': movement_text or None,
            })

        if 'Pound-for-Pound' in category:
            sex = 'women' if category.startswith("Women's") else 'men'
            if len(rows) != MAX_CONTENDER_RANK:
                raise RankingsSourceError(
                    f'Expected {MAX_CONTENDER_RANK} {source} {category} rows, '
                    f'found {len(rows)}'
                )
            pound_for_pound[sex] = rows
            continue

        if category not in ACTIVE_DIVISIONS:
            raise RankingsSourceError(f'Unexpected current UFC division: {category}')
        if len(rows) != MAX_CONTENDER_RANK:
            raise RankingsSourceError(
                f'Expected {MAX_CONTENDER_RANK} {source} {category} contenders, '
                f'found {len(rows)}'
            )
        champion = athlete_from_anchor(group.select_one('caption h5 a'))
        champions = []
        if champion:
            champions.append({
                **champion,
                'rank': CHAMPION_RANK,
                'status': 'champion',
                'movementStatus': None,
                'movement': None,
                'movementText': None,
            })
        divisions[category] = {'champions': champions, 'contenders': rows}

    if set(divisions) != ACTIVE_DIVISIONS:
        missing = sorted(ACTIVE_DIVISIONS - set(divisions))
        extra = sorted(set(divisions) - ACTIVE_DIVISIONS)
        raise RankingsSourceError(
            f'UFC {source} division mismatch: missing={missing}, extra={extra}'
        )
    if source == PRIMARY_SOURCE and set(pound_for_pound) != {'men', 'women'}:
        raise RankingsSourceError(
            'Media rankings must include men and women P4P tables'
        )

    return {
        'schemaVersion': 1,
        'sourceSystem': source,
        'sourceUrl': UFC_RANKINGS_URL,
        'sourceUpdatedAt': updated_at,
        'fetchedAt': iso_z(fetched_at),
        'divisions': dict(sorted(divisions.items())),
        'poundForPound': pound_for_pound,
    }


def semantic_snapshot(snapshot):
    return {k: v for k, v in snapshot.items() if k != 'fetchedAt'}


def save_snapshot(snapshot):
    """Persist a snapshot, refusing to rewrite or reorder committed history.

    Two guards, both fail-closed:
      * a fetched snapshot older than the newest committed one for the same
        source means a stale or cached page, and would silently rewrite every
        later diff if inserted; and
      * the same publication date carrying different content means UFC edited a
        published table, which needs a human to look at it.
    """
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    source = snapshot['sourceSystem']
    updated_at = snapshot['sourceUpdatedAt']

    committed = [
        json.loads(p.read_text(encoding='utf-8'))
        for p in sorted(SNAPSHOT_DIR.glob(f'*-{source}.json'))
    ]
    newest = max((s['sourceUpdatedAt'] for s in committed), default=None)
    if newest is not None and updated_at < newest:
        raise RankingsSourceError(
            f'Fetched {source} snapshot is dated {updated_at}, older than the '
            f'newest committed snapshot {newest}. Refusing to backdate history.'
        )

    path = SNAPSHOT_DIR / f'{updated_at}-{source}.json'
    if path.exists():
        existing = json.loads(path.read_text(encoding='utf-8'))
        if semantic_snapshot(existing) == semantic_snapshot(snapshot):
            return existing, path, False
        raise RankingsSourceError(
            f'UFC published different {source} content under the existing date '
            f'{updated_at} ({path.name}). Refusing to overwrite a committed '
            'snapshot -- review the change by hand.'
        )

    path.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2, sort_keys=True) + '\n',
        encoding='utf-8',
    )
    return snapshot, path, True


def load_snapshots():
    snapshots = []
    for path in sorted(SNAPSHOT_DIR.glob('*.json')):
        snapshot = json.loads(path.read_text(encoding='utf-8'))
        if snapshot.get('schemaVersion') != 1:
            raise RankingsSourceError(
                f'Unsupported rankings snapshot schema in {path}'
            )
        snapshots.append(snapshot)
    if not snapshots:
        raise RankingsSourceError(f'No rankings snapshots found in {SNAPSHOT_DIR}')
    return snapshots


def official_division_map(snapshot, aliases):
    result = {}
    for division, table in snapshot['divisions'].items():
        ranks = {}
        for record in table['champions'] + table['contenders']:
            fighter_key = normalized_name(record['displayName'], aliases)
            if fighter_key in ranks:
                raise RankingsSourceError(
                    f'Duplicate official fighter in {division}: '
                    f'{record["displayName"]}'
                )
            ranks[fighter_key] = validated_rank(
                record['rank'], f'{snapshot["sourceSystem"]} {division}'
            )
        result[division] = ranks
    return result


# ── generated artifact ───────────────────────────────────────────────────────

def build_history(cache, official_snapshots, aliases):
    """Cached pre-cutoff history, extended only by source-labelled media."""
    snapshots = cache_snapshots(cache)
    closeouts = retired_division_closeouts(cache)

    combined = [(str(d), divisions) for d, divisions in snapshots]
    for snapshot in official_snapshots:
        if snapshot['sourceSystem'] != PRIMARY_SOURCE:
            continue
        if snapshot['sourceUpdatedAt'] <= HISTORY_CUTOFF:
            continue
        combined.append((
            snapshot['sourceUpdatedAt'].replace('-', ''),
            official_division_map(snapshot, aliases),
        ))
    combined.sort(key=lambda item: item[0])

    histories = defaultdict(list)
    previous_by_division = {}
    retired_closed = set()
    for snapshot_date, divisions in combined:
        ymd = int(snapshot_date)

        # Close out retired divisions on the first date they were not published.
        for division, closeout_ymd in closeouts.items():
            if division in retired_closed or ymd < closeout_ymd:
                continue
            for fighter_key in sorted(previous_by_division.get(division, {})):
                histories[history_key(division, fighter_key)].append(
                    [closeout_ymd, None]
                )
            previous_by_division[division] = {}
            retired_closed.add(division)

        for division, current in sorted(divisions.items()):
            if division in retired_closed:
                continue
            previous = previous_by_division.get(division)
            if previous is None:
                for fighter_key, rank in sorted(current.items()):
                    histories[history_key(division, fighter_key)].append(
                        [ymd, rank]
                    )
            else:
                for fighter_key in sorted(set(previous) | set(current)):
                    if previous.get(fighter_key) != current.get(fighter_key):
                        histories[history_key(division, fighter_key)].append(
                            [ymd, current.get(fighter_key)]
                        )
            previous_by_division[division] = current

    unresolved = sorted(set(closeouts) - retired_closed)
    if unresolved:
        raise RankingsSourceError(
            f'Retired divisions were never closed out: {unresolved}'
        )
    return dict(sorted(histories.items())), combined


def current_records(snapshot, aliases):
    rankings = {}
    for division, table in snapshot['divisions'].items():
        for record in table['champions'] + table['contenders']:
            fighter_key = normalized_name(record['displayName'], aliases)
            rankings[history_key(division, fighter_key)] = {
                **record,
                'division': division,
                'source': snapshot['sourceSystem'],
                'sourceUpdatedAt': snapshot['sourceUpdatedAt'],
            }
    p4p = {}
    for sex, table in snapshot.get('poundForPound', {}).items():
        for record in table:
            fighter_key = normalized_name(record['displayName'], aliases)
            p4p[fighter_key] = {
                **record,
                'category': f'{sex}-p4p',
                'source': snapshot['sourceSystem'],
                'sourceUpdatedAt': snapshot['sourceUpdatedAt'],
            }
    return dict(sorted(rankings.items())), dict(sorted(p4p.items()))


def js_json(value, pretty=False):
    if pretty:
        return json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True)
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(',', ':')
    )


def write_generated(cache, snapshots, aliases):
    media_snapshots = sorted(
        (s for s in snapshots if s['sourceSystem'] == 'media'),
        key=lambda s: s['sourceUpdatedAt'],
    )
    meta_snapshots = sorted(
        (s for s in snapshots if s['sourceSystem'] == 'meta'),
        key=lambda s: s['sourceUpdatedAt'],
    )
    if not media_snapshots or not meta_snapshots:
        raise RankingsSourceError(
            'At least one media and one Meta snapshot are required'
        )

    history, combined = build_history(cache, media_snapshots, aliases)
    media_current, media_p4p = current_records(media_snapshots[-1], aliases)
    meta_current, _meta_p4p = current_records(meta_snapshots[-1], aliases)
    # UFC publishes no Meta pound-for-pound table; the media P4P board is the
    # only one that exists. No empty Meta P4P export is emitted.

    source_timestamps = [
        cache['source'].get('lastUpdated'),
        *(s.get('fetchedAt') for s in snapshots),
    ]
    generated_at = max(v for v in source_timestamps if v)

    # ── current artifact: everything the browser needs, and nothing else ──────
    current_metadata = {
        'generatedAt': generated_at,
        'schemaVersion': 4,
        'primarySource': PRIMARY_SOURCE,
        'scope': (
            'Current official UFC rankings only. Historical series live in '
            f'{HISTORY_OUTPUT_PATH.relative_to(ROOT)} and are deliberately NOT '
            'imported by any runtime module, so they never reach the browser '
            'bundle.'
        ),
        'officialUfc': {
            'url': UFC_RANKINGS_URL,
            'mediaSnapshot': media_snapshots[-1]['sourceUpdatedAt'],
            'metaSnapshot': meta_snapshots[-1]['sourceUpdatedAt'],
            'snapshotCount': len(snapshots),
        },
        'current': {
            'mediaDivisionalSlots': len(media_current),
            'metaDivisionalSlots': len(meta_current),
            'mediaP4PSlots': len(media_p4p),
            'activeDivisions': len(ACTIVE_DIVISIONS),
        },
        'historyArtifact': {
            'module': str(HISTORY_OUTPUT_PATH.relative_to(ROOT)),
            'runtimeUse': 'none -- offline generation, verification and research only',
        },
    }

    # ── history artifact: offline research data ───────────────────────────────
    history_metadata = {
        'generatedAt': generated_at,
        'schemaVersion': 4,
        'runtimeUse': (
            'NONE. This artifact is for offline generation, verification '
            'scripts, research utilities and focused tests. It must not be '
            'imported by src/App.js, src/domain/fighters, or anything else in '
            'the production dependency graph.'
        ),
        'kaggle': {
            'dataset': cache['source']['dataset'],
            'downloadUrl': cache['source']['downloadUrl'],
            'license': cache['source']['license'],
            'version': cache['source']['version'],
            'lastUpdated': cache['source']['lastUpdated'],
            'contentSha256': cache['source']['contentSha256'],
            'historyUsedThrough': HISTORY_CUTOFF,
            'historyCache': str(HISTORY_CACHE_PATH.relative_to(ROOT)),
            'quarantinedRows': cache.get('quarantinedRows', []),
            'postCutoverPolicy': cache['postCutoverPolicy'],
        },
        'officialUfc': {
            'url': UFC_RANKINGS_URL,
            'mediaSnapshot': media_snapshots[-1]['sourceUpdatedAt'],
        },
        'history': {
            'firstSnapshot': iso_date(combined[0][0]),
            'latestSnapshot': iso_date(combined[-1][0]),
            'fighterDivisionSeries': len(history),
            'transitions': sum(len(v) for v in history.values()),
            'explicitUnrankedTombstones': sum(
                1 for entries in history.values()
                for _, rank in entries if rank is None
            ),
            'retiredDivisions': sorted(DIVISIONS - ACTIVE_DIVISIONS),
        },
    }

    current_content = '\n'.join([
        '// AUTO-GENERATED by scripts/update_rankings.py -- do not hand-edit.',
        '// Current official UFC rankings, scraped from UFC.com.',
        '//',
        '// RUNTIME ARTIFACT: this file ships to the browser. Keep it to the',
        '// current tables. Historical series live in rankingsHistoryData.js and',
        '// must never be imported from here or from any runtime module.',
        '',
        f'export const RANKINGS_METADATA = {js_json(current_metadata, pretty=True)};',
        '',
        f'export const RANKING_ALIASES = {js_json(aliases, pretty=True)};',
        '',
        f'export const CURRENT_MEDIA_RANKINGS = {js_json(media_current)};',
        '',
        f'export const CURRENT_MEDIA_P4P = {js_json(media_p4p)};',
        '',
        f'export const CURRENT_META_RANKINGS = {js_json(meta_current)};',
        '',
    ])

    history_content = '\n'.join([
        '// AUTO-GENERATED by scripts/update_rankings.py -- do not hand-edit.',
        '// Kaggle history is CC0; post-cutoff rows come from official UFC media',
        '// snapshots.',
        '//',
        '// RESEARCH ARTIFACT -- NOT PART OF THE PRODUCTION BUNDLE.',
        '// Importing this from src/App.js, src/domain/fighters, or any other',
        '// runtime module would ship ~190 kB of history to every browser. It has',
        '// no runtime consumer and no model consumer: not the deprecated v1',
        '// engine, not the frozen 16-feature MODEL_V2. Enforced by',
        '// src/domain/rankings/__tests__/boundary.test.js and',
        '// scripts/verify-bundle.mjs.',
        '',
        f'export const RANKINGS_HISTORY_METADATA = {js_json(history_metadata, pretty=True)};',
        '',
        f'export const DIVISION_RANK_HISTORY = {js_json(history)};',
        '',
    ])

    changed = []
    for path, content in [
        (CURRENT_OUTPUT_PATH, current_content),
        (HISTORY_OUTPUT_PATH, history_content),
    ]:
        previous = path.read_text(encoding='utf-8') if path.exists() else None
        if previous != content:
            path.write_text(content, encoding='utf-8')
            changed.append(str(path.relative_to(ROOT)))
    return changed, current_metadata, history_metadata


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--refresh-kaggle', action='store_true',
        help='Rebuild the reviewed history cache from the Kaggle dataset',
    )
    parser.add_argument('--csv', help='Use a local Kaggle CSV instead of downloading')
    parser.add_argument('--ufc-html', help='Use saved UFC rankings HTML')
    parser.add_argument(
        '--no-ufc-fetch', action='store_true',
        help='Regenerate using already committed official snapshots',
    )
    args = parser.parse_args()

    aliases = load_aliases()

    if args.refresh_kaggle or args.csv:
        import requests

        session = requests.Session()
        session.headers.update({'User-Agent': USER_AGENT})
        rows, kaggle_metadata, kaggle_hash = load_kaggle_csv(session, args.csv)
        existing = (
            json.loads(HISTORY_CACHE_PATH.read_text(encoding='utf-8'))
            if HISTORY_CACHE_PATH.exists() else {}
        )
        cache = build_history_cache(
            rows, kaggle_metadata, kaggle_hash, aliases,
            existing.get('quarantinedRows', []),
        )
        write_history_cache(cache)
        print(
            f'History cache rebuilt: {len(cache["history"])} series across '
            f'{len(cache["snapshotDates"])} snapshots'
        )

    cache = load_history_cache()

    changed_snapshots = []
    if not args.no_ufc_fetch:
        import requests

        session = requests.Session()
        session.headers.update({'User-Agent': USER_AGENT})
        fetched_at = utc_now()
        html = (
            Path(args.ufc_html).read_text(encoding='utf-8')
            if args.ufc_html else request(session, UFC_RANKINGS_URL).text
        )
        for source in [PRIMARY_SOURCE, 'meta']:
            snapshot = parse_ufc_snapshot(html, source, fetched_at)
            saved, path, changed = save_snapshot(snapshot)
            if changed:
                changed_snapshots.append(path.name)
            print(
                f"{source}: {saved['sourceUpdatedAt']} "
                f"({len(saved['divisions'])} divisions)"
            )

    snapshots = load_snapshots()
    changed_outputs, current_metadata, history_metadata = write_generated(
        cache, snapshots, aliases
    )
    print(
        f"Kaggle v{history_metadata['kaggle']['version']} through "
        f"{history_metadata['kaggle']['historyUsedThrough']} (cached); official "
        f"media through {current_metadata['officialUfc']['mediaSnapshot']}"
    )
    print(
        f"Current: {current_metadata['current']['mediaDivisionalSlots']} media "
        f"slots, {current_metadata['current']['mediaP4PSlots']} P4P slots "
        f"(runtime artifact)"
    )
    print(
        f"History: {history_metadata['history']['fighterDivisionSeries']} series, "
        f"{history_metadata['history']['transitions']} transitions, "
        f"{history_metadata['history']['explicitUnrankedTombstones']} removals "
        f"(research artifact, not bundled)"
    )
    changes = changed_snapshots + changed_outputs
    print('Changed: ' + ', '.join(changes) if changes else 'No ranking changes')


if __name__ == '__main__':
    main()
