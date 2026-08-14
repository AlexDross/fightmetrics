# Correction 5 dry run (revised) — escaped-apostrophe identity and bout metadata

**The analysis was read-only**: every run below happened in a throwaway
directory, and no branch, commit or generated artifact came out of it. This
report was the only file it produced. **The report itself is now committed** —
on `fix/apostrophe-identity-parser`, as the review evidence the implementation
was built against. It is reproduced verbatim from
`review/correction5-dry-run` @ `7849c0f`, apart from this paragraph.

The implementation and its verification are recorded separately in
[correction5_implementation_verification.md](correction5_implementation_verification.md).

**Revision note.** The first version of this report presented Sean O'Malley's
`tb: 4 → 0` as a correction. It was a regression, and the review was right to
reject it. That analysis also had a methodology error: each variant was built
from the *previous variant's output* rather than from a pristine roster, so a
"preserve `tb`" scope preserved an already-zeroed value. Every number below
comes from four variants each started from the identical committed roster.

## Pre-authorization confirmations

| # | Confirmation | Status |
|---|---|---|
| 1 | Scope A always starts from pristine `origin/main` | **Confirmed** — see *Setup*; every variant is a fresh copy of `base_tree` with the committed roster restored, never another variant's output |
| 2 | Existing `tb` is not among the fields recomputed for existing fighters | **Confirmed** — `tb` removed from `STAT_FIELDS`; `tb` changed for **no fighter** |
| 3 | O'Malley remains at exactly four title bouts | **Confirmed** — `4 → 4` |
| 4 | New apostrophe-named fighters parse and seed safely | **Confirmed** — `js_escape` → `ENTRY_RE` → `parse_entry` round-trips for `Sean O'Malley`, `Da'Mon Blackshear`, `Tre'ston Vines`, `O'Neill-D'Arce`, a backslash-bearing name, and a plain name |
| 5 | One tested JS-object parser, not separate regexes | **Confirmed** — single `_JS_STR` grammar feeds both name and division; output byte-identical to the two-regex draft |
| 6 | The 265-fighter history change contains only the stated `wc` repair | **Confirmed** — `wc` is the only changed field across 1,908 entries; zero bout-count mismatches |
| 7 | Scope A does not claim fallback divisions are bout-level truth | **Confirmed** — see *What scope A does not claim* |
| 8 | Full artifact hashes and per-fighter tables included | **Confirmed** — see the final two sections |

## Setup

| | |
|---|---|
| Baseline | `origin/main` @ `2dcdf8f2298349d0b3a8584726465dc31bc82441` (PR #13 merged, aggregates refreshed) |
| Feed | Greco snapshot, 783 events, max event date 2026-08-08, archive SHA `d25ac59cbb091055418c7b985df488405fd9da0887f3140d53d245b50d730fae` |
| Roster input | `src/fightersData.js` from the baseline commit, copied fresh into every variant |

The baseline artifacts are byte-identical to what is now deployed:

```
src/fightersData.js  51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad
src/fightHistory.js  46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5
```

**Pristine-start guarantee.** Each variant is created by copying `base_tree`
(an untouched `git archive` of the baseline commit) and then restoring
`src/fightersData.js` from a saved pristine copy. No variant is ever derived
from another variant's output. This matters: the first revision of this report
built each variant on the previous one, so a "preserve `tb`" scope preserved an
already-zeroed value and reported a false result.

All four runs executed the same day, because `dsl` derives from the current
date and a cross-day comparison shows a spurious delta for the whole roster.

| Variant | Description |
|---|---|
| **V0** | baseline — merged `main`, unmodified |
| **V1** | naive fix — name + weight-class regex only |
| **V2** | **scope A** — V1, plus `tb` preserved |
| **V3** | **scope B** — V1, plus bout metadata from raw `WEIGHTCLASS` |

## Why `tb: 4 → 0` happened

`ufc_fight_details.csv` has exactly three columns:

```
EVENT,BOUT,URL
```

`detail_lookup` reads `WEIGHTCLASS` from it, so every entry's `wc` is `''`, and
nothing later overwrites it — `rn` and `ti` are refreshed from the results row,
`wc` is not. Every fight record therefore carries `wc: ''`, and:

```python
'tb': sum(1 for f in fights
          if 'title' in (f.get('wc') or '').lower()
          or 'title' in (f.get('event') or '').lower()),
```

collapses to an event-*name* heuristic. Across the entire 8,847-bout feed that
matches exactly one event — `UFC 18: The Road to the Heavyweight Title` — for
14 bout-sides.

`ufc_fight_results.csv` does carry the information, in a column the updater
never reads into the fight record:

```
UFC 316: Dvalishvili vs. O'Malley 2   UFC Bantamweight Title Bout
UFC 306: Riyadh Season Noche UFC      UFC Bantamweight Title Bout
UFC 299: O'Malley vs. Vera 2          UFC Bantamweight Title Bout
UFC 292: Sterling vs. O'Malley        UFC Bantamweight Title Bout
UFC 324: Gaethje vs. Pimblett         Bantamweight Bout
```

`clean_wc` strips `UFC`, `Title`, `Bout` and `Interim`, so title status must be
captured **before** the division string is cleaned. It cannot be recovered
afterwards.

O'Malley's true count from raw `WEIGHTCLASS` is **4**, exactly the stored value.
The stored `tb:4` survived only because the broken parser excluded him from the
update path; the moment the parser is fixed without addressing `tb`, the
event-name heuristic overwrites it with 0.

### Roster-wide `tb` state

| | fighters with `tb>0` | Σ `tb` |
|---|---:|---:|
| Committed / V0 | 13 | 20 |
| Truth from raw `WEIGHTCLASS` | **386** | **956** (bout-sides) |
| V1 naive fix | 12 | 16 |
| V2 scope A | 13 | 20 |
| V3 scope B | 328 | 840 |

The 13 survivors on `main` are residue from the original build. `tb` has been
effectively non-functional for the whole roster; the nine apostrophe fighters
are simply the ones whose original values were never overwritten.

Scope B's 840 is lower than the 956 raw bout-sides because the roster holds
2,291 of the 2,737 fighters with fight history; bout-sides belonging to
non-roster fighters have nowhere to land.

## Confirmation: no parser option produces 4 → 0

| Variant | O'Malley `tb` | `wi` |
|---|---:|---:|
| V0 baseline | 4 | 11 |
| V1 naive fix | **0** ← the regression | 12 |
| V2 scope A | **4** | 12 |
| V3 scope B | **4** | 12 |

Scope A reaches 4 by not recomputing the field; scope B reaches 4 by deriving
it correctly from `UFC Bantamweight Title Bout` on four rows. Neither safe
scope can produce 0, and V1 is not a candidate for implementation.

## Scope comparison

### `fightersData.js`

| | V2 scope A | V3 scope B |
|---|---:|---:|
| Fighters changed | **9** | **325** |
| `tb` changed | 0 | 316 |
| Non-`tb` fields changed | the nine only | the nine only |

Scope B's extra 316 fighters differ in `tb` and nothing else. Largest gains:
Jon Jones 0→17, Randy Couture 0→16, Georges St-Pierre 0→15, Valentina
Shevchenko 0→14, Demetrious Johnson 0→14, Anderson Silva 0→13.

### `fightHistory.js`

Both scopes leave the key set identical (2,737 fighters). No result, opponent,
method, round, time, date or event value changes in either.

| | V2 scope A | V3 scope B |
|---|---:|---:|
| Fighters changed | 265 | 1,620 |
| `wc` entries changed | 1,908 | 6,564 |
| `tb` entries changed | 0 | 962 |

Categories:

| Category | Scope A | Scope B |
|---|---:|---:|
| truncated `Women\` → real division | 1,849 | 1,849 |
| `Unknown` → roster-division fallback | 59 | — |
| `Unknown` → actual bout division | — | 1,542 |
| roster division → actual bout division | — | 3,173 |
| per-bout `tb` `false → true` | — | 950 |
| per-bout `tb` `true → false` | — | 12 |

Scope A's history diff was re-verified field by field: across all 265 fighters
and 1,908 changed entries, **`wc` is the only field that differs**, and no
fighter's bout count changes. No `re`, `op`, `me`, `rn`, `ti`, `dt`, `ev` or
`tb` value moves.

The third category is scope B's real substance: `wc` currently falls back to the
fighter's *current* roster division for every bout, so a fighter who changed
weight has their whole history relabelled. Scope B takes the division from the
bout row — 314 `Welterweight → Lightweight`, 237 `Lightweight → Featherweight`,
235 `Welterweight → Middleweight`, 179 `Featherweight → Lightweight`, and so on.
The 12 `true → false` flips are the event-name heuristic's false positives on
`UFC 18: The Road to the Heavyweight Title`.

### The pre-existing `Women\` truncation

`wc_lookup` reads the division with the same defective grammar as the name:

```python
wc_m = re.search(r"w:'([^']*)'", entry_str)
```

`w:'Women\'s Flyweight'` truncates to `Women\`. This is already shipped —
`src/fightHistory.js` on `main` carries **1,849 entries whose weight class is
the literal string `Women\`**. Fixing only the name regex makes it worse (1,857).
Both must be fixed together; with both, the count is **0** and the divisions
resolve to 705 Strawweight, 621 Flyweight, 505 Bantamweight, 26 Featherweight.

### One parser, not two regexes

The two defects are the same defect twice, because the roster was read by two
independently-written patterns that both truncated at the escaping backslash.
Scope A replaces them with a single grammar used for every quoted field:

```python
_JS_STR   = r"'((?:[^'\\]|\\.)*)'"
ENTRY_RE  = re.compile(r"\{n:" + _JS_STR + r"[^}]*\}")
_FIELD_RE = re.compile(r"(\w+):(" + _JS_STR + r"|null|-?[\d.]+)")

def js_unescape(s):
    return s.replace("\\'", "'").replace('\\\\', '\\')

def parse_entry(entry_str):
    """Decode one roster entry into (canonical name, {field: decoded value})."""
    fields = {}
    for m in _FIELD_RE.finditer(entry_str):
        fields[m.group(1)] = (
            js_unescape(m.group(3)) if m.group(3) is not None else m.group(2)
        )
    return fields.get('n'), fields
```

`existing` and `wc_lookup` are both built from `parse_entry`, so name and
division cannot drift apart again. This was verified to be a pure refactor: the
single-parser build produces artifacts byte-identical to the two-regex draft
(`27b046d0…` / `f5dda9d4…`).

**Seeding round-trip.** `build_new_fighter_entry` writes names through
`js_escape`, so a newly debuting apostrophe-named fighter must survive
`js_escape` → `ENTRY_RE` → `parse_entry`. Verified against the candidate source:

| Seeded name | Matched | Parsed back | Division |
|---|---|---|---|
| `Sean O'Malley` | yes | `Sean O'Malley` | `Women's Flyweight` |
| `Da'Mon Blackshear` | yes | `Da'Mon Blackshear` | `Women's Flyweight` |
| `Tre'ston Vines` | yes | `Tre'ston Vines` | `Women's Flyweight` |
| `O'Neill-D'Arce` (two apostrophes) | yes | `O'Neill-D'Arce` | `Women's Flyweight` |
| `Back\slash Guy` | yes | `Back\slash Guy` | `Women's Flyweight` |
| `No Apostrophe` | yes | `No Apostrophe` | `Women's Flyweight` |

Parsing the full candidate roster yields 2,291 entries, all nine apostrophe
identities intact, and **zero** names containing a stray backslash.

## What scope A does not claim

Scope A repairs how the roster file is *read*. It does not change where
`fightHistory.wc` comes from.

After scope A, a bout's weight class is still the fighter's **current roster
division**, used as a fallback because `fight['wc']` is always `''`. The 59
`Unknown → division` entries in the table below are that fallback finally
resolving for the nine fighters — not a claim that those bouts were contested at
that weight. A fighter who has changed divisions will still show their present
division across their whole history.

Making `wc` the division the bout was actually contested at, and making `tb`
bout-derived, is **correction 6**, which reads raw `WEIGHTCLASS` from
`ufc_fight_results.csv`. Scope A deliberately leaves both alone: it neither
recomputes `tb` nor asserts historical division truth.

## Model impact — all ten UFC 330 matchups

Percentage points for fighter A, recomputed under unmodified `main` model code.

| Matchup | A v1 | A v2 | B v1 | B v2 |
|---|---:|---:|---:|---:|
| Makhachev–Garry | 0 | 0 | 0 | 0 |
| Dern–Robertson | 0 | 0 | 0 | 0 |
| Abdul-Malik–Stoltzfus | 0 | 0 | 0 | 0 |
| Barboza–Ribovics | 0 | 0 | 0 | 0 |
| Njokuani–Alvarez | 0 | 0 | 0 | 0 |
| **Turner–Fernandes** | +0.00997 | **+0.16824** | +0.00997 | **+0.16824** |
| Johnson–McConico | 0 | 0 | 0 | 0 |
| Luque–Gore | 0 | 0 | 0 | 0 |
| Magny–Brahimaj | 0 | 0 | 0 | 0 |
| Wells–Orolbai | −0.00516 | −0.00557 | −0.00516 | −0.00557 |

Scope B is **identical to scope A** on every matchup, including two where a
card fighter's title count changes materially — Makhachev 0→6, Dern 0→1.

That is not a harness artifact; it was probed directly. Under scope B the
adapter reports `TITLE_BOUTS: 6` for Makhachev, and the v1 composite is
bit-identical at `0.5442031596335754`. The reason is structural:

- **v2**: `title_bouts` has coefficient `0` (zeroed 2026-07-07 with the other
  four RED features).
- **v1**: `feats.total_title_bout_dif` is computed at `model/index.js:811` and
  **never appears in any score sum**. Its weight `0.036427` is folded into
  `experienceWeightPool` and split 58/42 between `ufc_fight_count_dif` and
  `deep_round_dif`.

So `tb` currently feeds no live prediction path in either model version. It is
still surfaced on the fighter profile, and any future re-enabling of the feature
would silently inherit whatever is stored — which is the argument for fixing it
rather than freezing it.

The Turner–Fernandes movement is unrelated to `tb`. Both are Lightweights, as
are both impossible `asl` values corrected by the parser repair (TJ O'Brien
32.00 → 3.77, Brendan O'Reilly 21.67 → 1.90). The Lightweight `asl` mean drops
from 3.68120 to 3.54934 across 364 fighters, and `DIVISION_UFC_AVERAGES` is
derived from the roster at module load.

## Unchanged in both scopes

| Artifact | Result |
|---|---|
| `src/eloModule.js` | byte-identical |
| `src/cardioModule.js` | byte-identical |
| `src/rankingsData.js` | byte-identical |
| `src/upcomingData.js` | byte-identical — saved UFC 330 entries frozen |
| Roster membership | identical, 2,291 |
| `fightHistory` keys | identical, 2,737 |

`regen_elo.py` reads only the Greco CSVs, so ELO is structurally unaffected.
Rankings join on canonical names, which do not change. Both verifiers pass
against corrected data: `node scripts/verify-fighter-identity.mjs` exit 0,
`npm run rankings:verify` exit 0.

## Per-fighter field table

Baseline → scope A. Scope B is identical for all nine (its only additional
changes are `tb` on other fighters).

| Fighter | Field changes |
|---|---|
| **Sean O'Malley** | `wi` 11→12, `ws` 1→2, `dcw` 4→5, `tr` 37→41, `lfd` 2026-01-24→2026-06-14, `dsl` 84→60, `asl` 6.05→5.97, `asa` 0.2→0.24, `atp` 0.42→0.43, `kd` null→7, `sapm` null→3.34, `sdef` null→0.6, `ctrl` null→7.69, `hdpct` null→0.67, `lgpct` null→0.09. **`tb` stays 4.** |
| **Don'Tale Mayes** | `wi` 6→4, `ls` 2→3, `kow` 4→2, `tr` 35→32, `dsl` 333→467, `asl` 3.22→2.81, `asp` 0.43→0.41, `atl` 0.59→0.7, `atp` 0.38→0.47, `kd` null→2, `sapm` null→3.57, `sdef` null→0.48, `ctrl` null→98.08, `hdpct` null→0.55, `lgpct` null→0.16 |
| **Casey O'Neill** | `wi` 5→6, `ws` 1→2, `kow` 2→3, `dcw` 1→2, `tr` 18→19, `dsl` 4→138, `atp` 0.34→0.35, `kd` null→1, `sapm` null→5.53, `sdef` null→0.58, `ctrl` null→161.25, `hdpct` null→0.77, `lgpct` null→0.09 |
| **Lone'er Kavanagh** | `lo` 1→2, `kow` 1→0, `dcw` 2→3, `tr` 9→16, `lfd` 2026-02-28→2026-07-11, `dsl` 32→33, `asl` 4.13→4.1, `asp` 0.48→0.5, `asa` 0.2→0.38, `atl` 1.12→1.15, `atp` 0.45→0.46, `kd` null→1, `sapm` null→3.94, `sdef` null→0.54, `ctrl` null→116.2, `hdpct` null→0.57, `lgpct` null→0.18 |
| **Da'Mon Blackshear** | `lo` 3→4, `ws` 3→0, `ls` 0→1, `tr` 19→22, `dsl` 249→383, `asp` 0.45→0.46, `asa` 1.5→1.48, `kd` null→0, `sapm` null→4.19, `sdef` null→0.52, `ctrl` null→140.3, `hdpct` null→0.55, `lgpct` null→0.21 |
| **Brendan O'Reilly** | `lo` 2→3, `ls` 1→2, `tr` 7→10, `dsl` 3406→3540, **`asl` 21.6667→1.9**, `asp` 0.42→0.47, `asa` 0.3333→0.63, `atl` 2.3333→2.22, `atp` 0.533→0.44, `kd` null→0, `sapm` null→2.77, `sdef` null→0.4, `ctrl` null→231.25, `hdpct` null→0.54, `lgpct` null→0.13 |
| **TJ O'Brien** | `lo` 1→2, `ls` 1→2, `tr` 2→4, `dsl` 5344→5478, **`asl` 32.0→3.77**, `atl` 1.0→0.94, `kd` null→0, `sapm` null→4.78, `sdef` null→0.58, `ctrl` null→17.0, `hdpct` null→0.47, `lgpct` null→0.38 |
| **Chuck O'Neil** | `lo` 0→1, `ls` 0→1, `tr` 0→3, `dsl` 5415→5549, `asl` null→3.13, `asp` null→0.38, `asa` null→0.0, `atl` null→0.0, `atp` null→0.0, `kd` null→0, `sapm` null→4.4, `sdef` null→0.72, `ctrl` null→105.0, `hdpct` null→0.38, `lgpct` null→0.43 |
| **Tre'ston Vines** | `lo` 0→1, `ls` 0→1, `tr` 0→1, `dsl` 179→313, `kd` null→0, `sapm` null→3.56, `sdef` null→0.5, `ctrl` null→6.0 |

## Artifact hashes

| Variant | Artifact | SHA-256 |
|---|---|---|
| V0 baseline | `fightersData.js` | `51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad` |
| V0 baseline | `fightHistory.js` | `46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5` |
| V1 naive | `fightersData.js` | `ddbbf928ecba55df72c32f35ac835ad18ec11ab8f16db54797db8a132d847bc0` |
| V1 naive | `fightHistory.js` | `f5dda9d4e6da411c0553cfc5e13184bee624faa16da1077717c58016c466be59` |
| V2 scope A | `fightersData.js` | `27b046d070869d7aba20117b971862623f67997956f18a77ad3ef0a283fdb134` |
| V2 scope A | `fightHistory.js` | `f5dda9d4e6da411c0553cfc5e13184bee624faa16da1077717c58016c466be59` |
| V3 scope B | `fightersData.js` | `4a5b7edbb57684875328954d01556a127dffbd9f4947c5da3248696d4b31b3c5` |
| V3 scope B | `fightHistory.js` | `920c5aa9d671f959bfc2de1b7803d87e244e0ac72495c2e563939ca7a5f33492` |
| **V2b scope A, single parser** | `fightersData.js` | `27b046d070869d7aba20117b971862623f67997956f18a77ad3ef0a283fdb134` |
| **V2b scope A, single parser** | `fightHistory.js` | `f5dda9d4e6da411c0553cfc5e13184bee624faa16da1077717c58016c466be59` |

V1 and V2 share a `fightHistory.js` hash — `tb` is not written to history by the
existing heuristic for any of the nine, so the two differ only in
`fightersData.js`. V2b is byte-identical to V2 in both artifacts, confirming the
single-parser consolidation is a pure refactor. **V2b is the implementation
candidate.**

## Fixtures the implementation must carry

1. `n:'Sean O\'Malley'` parses to canonical `Sean O'Malley`, and that identity
   matches a `record_updates` key built from CSV data.
2. An entry with an escaped backslash round-trips through
   `js_escape`/`js_unescape` unchanged.
3. `w:'Women\'s Flyweight'` parses to `Women's Flyweight`, never `Women\`.
4. The nine named identities each resolve exactly, as a regression list.
5. A newly seeded apostrophe-named fighter round-trips `js_escape` → `ENTRY_RE`
   → `parse_entry`, including a two-apostrophe name, so a future `js_escape`
   change cannot silently reintroduce the split.
6. An apostrophe-free entry is byte-identical before and after.
7. Name and division are decoded by the **same** parser — a test that fails if
   a second field-specific regex is reintroduced.
8. A fighter with a stored `tb` retains it across a run whose fight records all
   carry `wc: ''` — a direct guard on the 4→0 regression, pinned to
   O'Malley = 4.
9. A run over the full roster changes `wc` and nothing else in `fightHistory`,
   and leaves every fighter's bout count intact.

Correction 6 will add its own: `UFC Bantamweight Title Bout` yields
`division='Bantamweight'` and `is_title=True`; `Bantamweight Bout` yields
`is_title=False`; O'Malley's four title rows produce `tb=4`; and a fighter who
changed divisions keeps each bout's own division.

## Recommendation

**Scope A is the correction-5 change.** It repairs the identity defect that
freezes nine fighters and the shipped `Women\` truncation, changes 9 fighters
and 265 histories, and cannot regress `tb`. Preserving `tb` is honest: the
updater has no bout-level source wired in, so declining to recompute is the
correct behaviour for that field, recorded in a comment rather than left
implicit.

**Scope B should be its own numbered correction, not folded in.** It is a
different defect — bout metadata provenance — with a 1,620-fighter history
diff, and it deserves its own review even though its measured prediction impact
today is exactly zero. Bundling it would put a 6,564-entry change behind a
9-fighter headline.

## Separately numbered follow-ups

- **Correction 6 — bout weight-class and title provenance.** Scope B above.
- **Correction 7 — implausible aggregate rates.** 39 fighters carry an
  impossible `asl` after correction 5, none in the apostrophe cohort: Chanmi
  Jeon 92.00 (3 rounds), Nina Ansaroff 75.17, Seohee Ham 73.67, William
  Patolino 64.00, Leonardo Augusto Leleco 64.00, Heather Jo Clark 63.00, Rick
  Glenn 62.80, Jimmy Wallhead 47.00. Different cause; still polluting division
  means. Wants a plausibility gate on the aggregate writer. **No data changed.**
