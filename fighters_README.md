# Fighter Roster Sync Guide

## Critical rule

`fighters.json` and `src/fightersData.js` are TWO SEPARATE ROSTER FILES that must
stay name-synchronized.

- **`src/fightersData.js`** (the `_D2` array) is the **authoritative roster** —
  this is what the live React app actually uses for all fighter lookups,
  predictions, and display.
- **`fighters.json`** is used only by the Python data pipeline
  (`generate_upcoming_card.py`, `update_fighters.py`) for fuzzy-matching fighter
  names against upcoming card data and Greco1899 CSV updates.

## Why this matters

If a fighter's name is spelled differently between these two files (e.g.
nicknames, middle names, transliteration differences), the pipeline's fighter
lookup will silently fail for that fighter — they'll be treated as unmatched
or a debut fighter even though they're on the roster, and any auto-populate
or Sync feature depending on both files agreeing will skip them.

This has caused real bugs before:
- "Zach Reese" (fighters.json) vs "Zachary Reese" (fightersData.js)
- "Kai Kamaka" (fighters.json) vs "Kai Kamaka III" (fightersData.js)

## Rule going forward

**If you rename, add, or remove a fighter in one file, mirror the exact same
name in the other file.** `fightersData.js` is the source of truth — when in
doubt, match `fighters.json` to whatever `fightersData.js` has, not the
other way around.

## How to check for drift

Run this to compare names between the two files and flag anything that looks
like the same person spelled differently:

```python
import json, difflib

fighters_json = {f['name'] for f in json.load(open('fighters.json')) if f.get('name')}
# fightersData.js requires parsing the _D2 array (JS, not JSON) —
# use a node script or regex extraction of the "n:" field values

# Compare sets, then use difflib.SequenceMatcher for near-matches
# (ratio > 0.75) between names in one set but not the other
```
