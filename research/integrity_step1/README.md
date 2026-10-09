# Step 1 replay evidence: pinned feed, baseline vs candidate

Re-run on 2026-10-09 after the second Codex review repairs (earlier runs, on
`d8367ca` and `c28063f`, are superseded; the `c28063f` run gave the same
result in every compared field).

Produced by `scripts/integrity/replay_pinned_feed.py` (full output:
[`replay_evidence.json`](replay_evidence.json)). Re-run with:

```sh
git clone https://github.com/Greco1899/scrape_ufc_stats.git /tmp/greco
git -C /tmp/greco checkout 1ccacc5cd4f642bd2deb8b278405a0205791bfa3
python scripts/integrity/replay_pinned_feed.py --feed-dir /tmp/greco \
  --baseline a2e83a8 --candidate <commit> --today 2026-10-08 --out <file>
```

| | |
|---|---|
| Feed | Greco1899/scrape_ufc_stats @ `1ccacc5cd4f642bd2deb8b278405a0205791bfa3` |
| Baseline | `a2e83a816015abcbe0cfdb13dd9e3908de46f676` (main when Step 1 started) |
| Candidate | `7417e31e5141c31e7749ad5104c5cc2366dd1687` (Step 1 after the second Codex review repairs: verifier contract and publish leftover refusal; the only later commits add this evidence and review notes) |
| Clock | 2026-10-08. Candidate via `FM_TODAY`; the baseline's `date.today()` and both sides' regen_elo / manifest clock reads rewritten in the temporary worktrees (listed under `clockPins`) |
| Pipeline | `update_fighters.py` → `regen_elo.py` → `generate-fighter-birthdates.mjs` → `generate_source_manifest.py`, as in the scheduled workflow |
| Verdict | **PASS** |

## Prediction-relevant artifacts: byte-identical

| File | Baseline = candidate | = committed on main |
|---|---|---|
| `src/fightersData.js` | yes | yes |
| `src/fightHistory.js` | yes | yes |
| `fighter_profiles.json` | yes | yes |
| `src/eloModule.js` | yes | yes |
| `src/fighterBirthdates.js` | yes | yes |

## Source manifest: only intentional provenance changes

Every module field matches except these:

| Module | Field | Why |
|---|---|---|
| fightHistory, fightersDataAggregates, elo | `sourceSnapshot` | new: pinned upstream revision and input hashes |
| fightHistory, fightersDataAggregates | `generatorVersion` | names the commit of `update_fighters.py`, which changed |

No `contentHash` changed. Unexpected changes: none.

## New provenance files

`source_ledger.json` and `artifact_generation.json` exist only on the candidate.
Replayed copies match the committed ones byte for byte.

## Repeat-run stability

Running the candidate pipeline a second time in the same tree left all nine
outputs unchanged, provenance included.

## Predictions

`scripts/integrity/replay_predictions.mjs` rebuilt each entry through
`buildRoiEntry` with C6 on, Date and Math.random pinned, on both sides:

* 12 pending Upcoming entries, every field (v2 and C6 probabilities, tier,
  bet action, gate, edge, EV, Kelly, fair lines, finish projections);
* a 332-pair same-division panel;
* all 2,323 model-facing fighter records.

The only differing field is `_provenance.sourceManifest`, which embeds the
manifest modules above. Unexpected differences: none.

Saved predictions (`roiData.js`, `upcomingData.js`) and `cardioModule.js` are
not modified by this change.
