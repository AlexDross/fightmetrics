export const UPCOMING_ENTRIES = [
  {
    "id": "1792849254075-dxuh2e",
    "createdAt": "2026-10-24T13:40:54.075Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Alexander Volkanovski",
    "fighterB": "Movsar Evloev",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": true,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.41535412993713455,
    "fighterBProb": 0.5846458700628654,
    "predictedWinner": "Movsar Evloev",
    "predictedProb": 0.5846458700628654,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.47226299987299863,
    "c6ProbB": 0.5277370001270014,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Movsar Evloev",
    "trackedProb": 0.5277370001270014,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.06602874025654293,
    "betRecommendedFighter": "Movsar Evloev",
    "betRecommendedOdds": "+102",
    "marketOdds": "+102",
    "edge": 0.032687495176506376,
    "edgeA": -0.03268749517650632,
    "edgeB": 0.032687495176506376,
    "ev": 6.6028740256542875,
    "evA": -6.473405907504187,
    "evB": 6.6028740256542875,
    "kelly": 0.06473405907504208,
    "kellyA": 0,
    "kellyB": 0.06473405907504208,
    "fairLine": "-112",
    "fairLineA": "+112",
    "fairLineB": "-112",
    "oddsA": "-102",
    "oddsB": "+102",
    "v2pA": 0.44129050595652547,
    "v2pB": 0.5587094940434745,
    "projectedKO": 14,
    "projectedSUB": 3,
    "projectedDEC": 84,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.075Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": true,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.47226299987299863,
        "pB": 0.5277370001270014
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.13164556962025317,
          "avg_sig_str_pct_dif": 0.8999999999999997,
          "avg_td_dif": -2.2500000000000004,
          "avg_td_pct_dif": -0.8260869565217391,
          "atd_dif": 0.4666666666666671,
          "avg_sub_att_dif": 0.0142857142857143,
          "kd_dif": 0.636,
          "control_time_dif": -1.3611111111111112,
          "reach_dif": -0.09259259259259259,
          "height_dif": -0.10989010989010989,
          "age_dif": -1.3953488372093024,
          "win_streak_dif": -5.714285714285714,
          "lose_streak_dif": 0,
          "win_dif": 1.1363636363636362,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 1.8235294117647058,
          "deep_round_dif": 0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 2.5,
          "sub_dif": 0,
          "elo_dif": 0.9879032258064516,
          "layoff_dif": -0.245,
          "cardio_dif": 0.15125,
          "peak_elo_dif": 1.5636363636363637,
          "ufc_fight_count_dif": 1,
          "rank_tier_dif": 0.2799999999999998
        },
        "v2": {
          "modern_form": -0.28447594351085403,
          "wins": 5,
          "losses": -3,
          "rounds": 31,
          "title_bouts": 0,
          "ko_wins": 5,
          "sub_wins": 0,
          "height": -1,
          "reach": -1,
          "younger": -6,
          "sig_str_landed": 2.08,
          "sig_str_accuracy": 0.08999999999999997,
          "sub_attempts": 0.010000000000000009,
          "td_landed": -3.1500000000000004,
          "td_accuracy": -0.19,
          "elo": 0.49
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-01-31",
        "fighterB": "2026-03-21"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254075-yll5yp",
    "createdAt": "2026-10-24T13:40:54.075Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Merab Dvalishvili",
    "fighterB": "Petr Yan",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": true,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.33546272927584625,
    "fighterBProb": 0.6645372707241537,
    "predictedWinner": "Petr Yan",
    "predictedProb": 0.6645372707241537,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.42483270738777107,
    "c6ProbB": 0.5751672926122289,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Petr Yan",
    "trackedProb": 0.5751672926122289,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.0335624403046223,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-147",
    "edge": -0.01997440779262938,
    "edgeA": 0.01997440779262938,
    "edgeB": -0.01997440779262938,
    "ev": -3.3562440304622356,
    "evA": 4.933678724779448,
    "evB": -3.3562440304622356,
    "kelly": 0,
    "kellyA": 0.033562440304622077,
    "kellyB": 0,
    "fairLine": "-135",
    "fairLineA": "+135",
    "fairLineB": "-135",
    "oddsA": "+147",
    "oddsB": "-147",
    "v2pA": 0.5240481496883886,
    "v2pB": 0.47595185031161136,
    "projectedKO": 17,
    "projectedSUB": 5,
    "projectedDEC": 78,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.075Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": true,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.42483270738777107,
        "pB": 0.5751672926122289
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.06641772151898737,
          "avg_sig_str_pct_dif": -1.4176000000000004,
          "avg_td_dif": 3.05,
          "avg_td_pct_dif": -0.6086956521739131,
          "atd_dif": -0.6666666666666665,
          "avg_sub_att_dif": 0.34285714285714286,
          "kd_dif": -0.41999999999999993,
          "control_time_dif": 1.0944444444444443,
          "reach_dif": 0.09259259259259259,
          "height_dif": -0.10989010989010989,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": -2.857142857142857,
          "lose_streak_dif": -1,
          "win_dif": 0.45454545454545453,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": 0.11764705882352941,
          "deep_round_dif": 0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": -1.5,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.24193548387096772,
          "layoff_dif": 0,
          "cardio_dif": -0.4558333333333331,
          "peak_elo_dif": 0.5636363636363636,
          "ufc_fight_count_dif": 0.125,
          "rank_tier_dif": -0.2799999999999998
        },
        "v2": {
          "modern_form": -0.00011073890534574193,
          "wins": 2,
          "losses": 1,
          "rounds": 2,
          "title_bouts": 0,
          "ko_wins": -3,
          "sub_wins": 1,
          "height": -1,
          "reach": 1,
          "younger": -2,
          "sig_str_landed": -1.0494000000000003,
          "sig_str_accuracy": -0.14176000000000005,
          "sub_attempts": 0.24,
          "td_landed": 4.27,
          "td_accuracy": -0.14,
          "elo": 0.12
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-06",
        "fighterB": "2025-12-06"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254075-2ek7hr",
    "createdAt": "2026-10-24T13:40:54.075Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Ramazan Temirov",
    "fighterB": "Lone'er Kavanagh",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6895204516284289,
    "fighterBProb": 0.3104795483715711,
    "predictedWinner": "Ramazan Temirov",
    "predictedProb": 0.6895204516284289,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5213292748698394,
    "c6ProbB": 0.4786707251301606,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Ramazan Temirov",
    "trackedProb": 0.5213292748698394,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.05308513523707559,
    "betRecommendedFighter": "Ramazan Temirov",
    "betRecommendedOdds": "+102",
    "marketOdds": "+102",
    "edge": 0.02627976991934433,
    "edgeA": 0.02627976991934433,
    "edgeB": -0.02627976991934433,
    "ev": 5.3085135237075605,
    "evA": 5.3085135237075605,
    "evB": -5.204425023242699,
    "kelly": 0.05204425023242704,
    "kellyA": 0.05204425023242704,
    "kellyB": 0,
    "fairLine": "-109",
    "fairLineA": "-109",
    "fairLineB": "+109",
    "oddsA": "+102",
    "oddsB": "-102",
    "v2pA": 0.5471253817980901,
    "v2pB": 0.4528746182019099,
    "projectedKO": 32,
    "projectedSUB": 5,
    "projectedDEC": 63,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.075Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5213292748698394,
        "pB": 0.4786707251301606
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.017802352465175454,
          "avg_sig_str_pct_dif": -0.6869406392694066,
          "avg_td_dif": 0.07472831050228303,
          "avg_td_pct_dif": -0.34669446098868395,
          "atd_dif": 0.8888888888888895,
          "avg_sub_att_dif": -0.00466405740378349,
          "kd_dif": 3.1999999999999997,
          "control_time_dif": -0.21111111111111105,
          "reach_dif": -0.37037037037037035,
          "height_dif": -0.21978021978021978,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": 2.142857142857143,
          "lose_streak_dif": 1,
          "win_dif": 0,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.6470588235294118,
          "deep_round_dif": -0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0,
          "elo_dif": 2.1370967741935485,
          "layoff_dif": 0.07,
          "cardio_dif": 1.9108333333333334,
          "peak_elo_dif": 1.290909090909091,
          "ufc_fight_count_dif": -0.25,
          "rank_tier_dif": -2.611707935929908
        },
        "v2": {
          "modern_form": 0.440290337934317,
          "wins": 0,
          "losses": 2,
          "rounds": -11,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 0,
          "height": -2,
          "reach": -4,
          "younger": -2,
          "sig_str_landed": 0.28127716894977217,
          "sig_str_accuracy": -0.06869406392694066,
          "sub_attempts": -0.003264840182648443,
          "td_landed": 0.10461963470319624,
          "td_accuracy": -0.07973972602739732,
          "elo": 1.06
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-25",
        "fighterB": "2026-07-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254074-n4hz73",
    "createdAt": "2026-10-24T13:40:54.074Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Alexander Volkov",
    "fighterB": "Rizvan Kuniev",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.690791845182845,
    "fighterBProb": 0.309208154817155,
    "predictedWinner": "Alexander Volkov",
    "predictedProb": 0.690791845182845,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.650729141353418,
    "c6ProbB": 0.349270858646582,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Alexander Volkov",
    "trackedProb": 0.650729141353418,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.2165805686172595,
    "betRecommendedFighter": "Alexander Volkov",
    "betRecommendedOdds": "-115",
    "marketOdds": "-115",
    "edge": 0.11584542042318546,
    "edgeA": 0.11584542042318546,
    "edgeB": -0.11584542042318541,
    "ev": 21.65805686172596,
    "evA": 21.65805686172596,
    "evB": -24.906765390984866,
    "kelly": 0.24906765390984859,
    "kellyA": 0.24906765390984859,
    "kellyB": 0,
    "fairLine": "-186",
    "fairLineA": "-186",
    "fairLineB": "+186",
    "oddsA": "-115",
    "oddsB": "+115",
    "v2pA": 0.7108610408350744,
    "v2pB": 0.2891389591649256,
    "projectedKO": 39,
    "projectedSUB": 8,
    "projectedDEC": 53,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.074Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.650729141353418,
        "pB": 0.349270858646582
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.07916515973477992,
          "avg_sig_str_pct_dif": 1.0127142857142857,
          "avg_td_dif": 0.060187074829932054,
          "avg_td_pct_dif": 2.196966873706004,
          "atd_dif": -0.7466666666666666,
          "avg_sub_att_dif": -0.10146258503401365,
          "kd_dif": 0.015999999999999903,
          "control_time_dif": 0.2833333333333333,
          "reach_dif": 0.37037037037037035,
          "height_dif": 0.32967032967032966,
          "age_dif": -0.9302325581395349,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 2.727272727272727,
          "loss_dif": -1.4814814814814814,
          "total_round_dif": 2.588235294117647,
          "deep_round_dif": 0.5882352941176471,
          "total_title_bout_dif": 0,
          "ko_dif": 2.5,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 3.9516129032258065,
          "layoff_dif": -0.385,
          "cardio_dif": -0.3920833333333332,
          "peak_elo_dif": 3.5636363636363635,
          "ufc_fight_count_dif": 2,
          "rank_tier_dif": 0.6054700681735468
        },
        "v2": {
          "modern_form": 0.04647403240746839,
          "wins": 12,
          "losses": -4,
          "rounds": 44,
          "title_bouts": 0,
          "ko_wins": 5,
          "sub_wins": 1,
          "height": 3,
          "reach": 4,
          "younger": -4,
          "sig_str_landed": 1.2508095238095227,
          "sig_str_accuracy": 0.10127142857142857,
          "sub_attempts": -0.07102380952380954,
          "td_landed": 0.08426190476190487,
          "td_accuracy": 0.505302380952381,
          "elo": 1.96
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-09",
        "fighterB": "2026-07-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254074-el8vow",
    "createdAt": "2026-10-24T13:40:54.074Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Aaron Pico",
    "fighterB": "Losene Keita",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5261769643501796,
    "fighterBProb": 0.4738230356498204,
    "predictedWinner": "Aaron Pico",
    "predictedProb": 0.5261769643501796,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.584191487373273,
    "c6ProbB": 0.415808512626727,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Aaron Pico",
    "trackedProb": 0.584191487373273,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": 0.01692592246458635,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-135",
    "edge": 0.009723402266889947,
    "edgeA": 0.009723402266889947,
    "edgeB": -0.009723402266890002,
    "ev": 1.6925922464586307,
    "evA": 1.6925922464586307,
    "evB": -2.284999532719148,
    "kelly": 0.0228499953271915,
    "kellyA": 0.0228499953271915,
    "kellyB": 0,
    "fairLine": "-140",
    "fairLineA": "-140",
    "fairLineB": "+140",
    "oddsA": "-135",
    "oddsB": "+135",
    "v2pA": 0.5286473725436813,
    "v2pB": 0.4713526274563187,
    "projectedKO": 42,
    "projectedSUB": 6,
    "projectedDEC": 53,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.074Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.584191487373273,
        "pB": 0.415808512626727
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.037974683544303826,
          "avg_sig_str_pct_dif": 0.1866666666666672,
          "avg_td_dif": 1.2457142857142856,
          "avg_td_pct_dif": 0.5797101449275363,
          "atd_dif": -1.777777777777778,
          "avg_sub_att_dif": 0,
          "kd_dif": -2,
          "control_time_dif": 2.361111111111111,
          "reach_dif": -0.18518518518518517,
          "height_dif": 0.10989010989010989,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 0,
          "total_round_dif": 0,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": -0.7862903225806451,
          "layoff_dif": -0.735,
          "cardio_dif": 0,
          "peak_elo_dif": -0.7090909090909091,
          "ufc_fight_count_dif": 0,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0,
          "wins": 0,
          "losses": 0,
          "rounds": 0,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": 1,
          "reach": -2,
          "younger": -2,
          "sig_str_landed": 0.6000000000000005,
          "sig_str_accuracy": 0.01866666666666672,
          "sub_attempts": 0,
          "td_landed": 1.7439999999999998,
          "td_accuracy": 0.13333333333333333,
          "elo": -0.39
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2026-09-05"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254074-a62754",
    "createdAt": "2026-10-24T13:40:54.074Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Azamat Murzakanov",
    "fighterB": "Dominick Reyes",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Light Heavyweight",
    "boutContext": {
      "division": "Light Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.3438935031227136,
    "fighterBProb": 0.6561064968772864,
    "predictedWinner": "Dominick Reyes",
    "predictedProb": 0.6561064968772864,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6038456276443266,
    "c6ProbB": 0.3961543723556734,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Azamat Murzakanov",
    "trackedProb": 0.6038456276443266,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.0643710604631863,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-182",
    "edge": -0.04154444327765927,
    "edgeA": -0.04154444327765927,
    "edgeB": 0.041544443277659215,
    "ev": -6.437106046318625,
    "evA": -6.437106046318625,
    "evB": 11.715533004299914,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.06437106046318634,
    "fairLine": "-152",
    "fairLineA": "-152",
    "fairLineB": "+152",
    "oddsA": "-182",
    "oddsB": "+182",
    "v2pA": 0.44034972040444675,
    "v2pB": 0.5596502795955532,
    "projectedKO": 60,
    "projectedSUB": 12,
    "projectedDEC": 28,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.074Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Light Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6038456276443266,
        "pB": 0.3961543723556734
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.052715189873417743,
          "avg_sig_str_pct_dif": 0.043199999999999905,
          "avg_td_dif": 0.32857142857142857,
          "avg_td_pct_dif": -0.3478260869565217,
          "atd_dif": 0.40000000000000036,
          "avg_sub_att_dif": -0.0142857142857143,
          "kd_dif": 0.7839999999999999,
          "control_time_dif": 0.08333333333333331,
          "reach_dif": -0.5555555555555555,
          "height_dif": -0.6593406593406593,
          "age_dif": -0.23255813953488372,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": -1,
          "win_dif": -0.9090909090909091,
          "loss_dif": 1.4814814814814814,
          "total_round_dif": -0.7058823529411765,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -0.04032258064516129,
          "layoff_dif": 0,
          "cardio_dif": -0.8070833333333333,
          "peak_elo_dif": -0.2727272727272727,
          "ufc_fight_count_dif": -1,
          "rank_tier_dif": 0.42532281367070723
        },
        "v2": {
          "modern_form": 0.055060821339010246,
          "wins": -4,
          "losses": 4,
          "rounds": -12,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": -1,
          "height": -6,
          "reach": -6,
          "younger": -1,
          "sig_str_landed": -0.8329000000000004,
          "sig_str_accuracy": 0.0043199999999999905,
          "sub_attempts": -0.010000000000000009,
          "td_landed": 0.45999999999999996,
          "td_accuracy": -0.07999999999999999,
          "elo": -0.02
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2026-04-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254073-ozonm6",
    "createdAt": "2026-10-24T13:40:54.073Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Nikita Krylov",
    "fighterB": "Abdul Rakhman Yakhyaev",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Light Heavyweight",
    "boutContext": {
      "division": "Light Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.40021334692360533,
    "fighterBProb": 0.5997866530763947,
    "predictedWinner": "Abdul Rakhman Yakhyaev",
    "predictedProb": 0.5997866530763947,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.12940449442640714,
    "c6ProbB": 0.8705955055735929,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Abdul Rakhman Yakhyaev",
    "trackedProb": 0.8705955055735929,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "PRICE_TOO_SHORT",
    "gateEV": 0.05543531567414339,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-471",
    "edge": 0.045726854084976454,
    "edgeA": -0.0457268540849764,
    "edgeB": 0.045726854084976454,
    "ev": 5.543531567414336,
    "evA": -26.110033682521525,
    "evB": 5.543531567414336,
    "kelly": 0.26110033682521533,
    "kellyA": 0,
    "kellyB": 0.26110033682521533,
    "fairLine": "-673",
    "fairLineA": "+673",
    "fairLineB": "-673",
    "oddsA": "+471",
    "oddsB": "-471",
    "v2pA": 0.29589961228647904,
    "v2pB": 0.704100387713521,
    "projectedKO": 40,
    "projectedSUB": 45,
    "projectedDEC": 16,
    "projectedFinish": "SUB",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.073Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Light Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.12940449442640714,
        "pB": 0.8705955055735929
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.006892023791368033,
          "avg_sig_str_pct_dif": 0.25877590361446046,
          "avg_td_dif": -1.0493459552495696,
          "avg_td_pct_dif": -0.03656364588789929,
          "atd_dif": -0.9999999999999994,
          "avg_sub_att_dif": -1.5189328743545614,
          "kd_dif": -1.6679999999999997,
          "control_time_dif": -4.722222222222222,
          "reach_dif": -0.09259259259259259,
          "height_dif": 0.10989010989010989,
          "age_dif": -2.0930232558139537,
          "win_streak_dif": -2.142857142857143,
          "lose_streak_dif": -1,
          "win_dif": 2.0454545454545454,
          "loss_dif": -3.7037037037037033,
          "total_round_dif": 2.176470588235294,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": 2,
          "sub_dif": 2.142857142857143,
          "elo_dif": -0.3024193548387097,
          "layoff_dif": 0.07,
          "cardio_dif": -0.5854166666666665,
          "peak_elo_dif": 0.8909090909090909,
          "ufc_fight_count_dif": 2.375,
          "rank_tier_dif": 1.90625136547763
        },
        "v2": {
          "modern_form": -0.504051659699344,
          "wins": 9,
          "losses": -10,
          "rounds": 37,
          "title_bouts": 0,
          "ko_wins": 4,
          "sub_wins": 3,
          "height": 1,
          "reach": -1,
          "younger": -9,
          "sig_str_landed": 0.10889397590361494,
          "sig_str_accuracy": 0.025877590361446046,
          "sub_attempts": -1.063253012048193,
          "td_landed": -1.4690843373493974,
          "td_accuracy": -0.008409638554216836,
          "elo": -0.15
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-11",
        "fighterB": "2026-06-27"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254073-pdov61",
    "createdAt": "2026-10-24T13:40:54.073Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Abus Magomedov",
    "fighterB": "Cam Rowston",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.4797067358789037,
    "fighterBProb": 0.5202932641210962,
    "predictedWinner": "Cam Rowston",
    "predictedProb": 0.5202932641210962,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4796627343960391,
    "c6ProbB": 0.5203372656039609,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Cam Rowston",
    "trackedProb": 0.5203372656039609,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.09791163042435769,
    "betRecommendedFighter": "Cam Rowston",
    "betRecommendedOdds": "+111",
    "marketOdds": "+111",
    "edge": 0.04640361631486134,
    "edgeA": -0.04640361631486134,
    "edgeB": 0.04640361631486134,
    "ev": 9.791163042435763,
    "evA": -8.820867605797964,
    "evB": 9.791163042435763,
    "kelly": 0.08820867605797977,
    "kellyA": 0,
    "kellyB": 0.08820867605797977,
    "fairLine": "-108",
    "fairLineA": "+108",
    "fairLineB": "-108",
    "oddsA": "-111",
    "oddsB": "+111",
    "v2pA": 0.4196461786258704,
    "v2pB": 0.5803538213741296,
    "projectedKO": 43,
    "projectedSUB": 17,
    "projectedDEC": 40,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.073Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4796627343960391,
        "pB": 0.5203372656039609
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.08622570483314158,
          "avg_sig_str_pct_dif": 0.17552272727272555,
          "avg_td_dif": 0.6392641233766237,
          "avg_td_pct_dif": 0.8355830039525688,
          "atd_dif": 1.6,
          "avg_sub_att_dif": 0.3656097402597402,
          "kd_dif": -2.2239999999999998,
          "control_time_dif": 0.5833333333333334,
          "reach_dif": 0,
          "height_dif": -0.10989010989010989,
          "age_dif": -1.1627906976744187,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": 0.45454545454545453,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 0.7058823529411765,
          "deep_round_dif": 0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 1.4285714285714286,
          "elo_dif": -0.12096774193548386,
          "layoff_dif": 0.28,
          "cardio_dif": 0.21666666666666687,
          "peak_elo_dif": -0.10909090909090909,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.2672006742768904,
          "wins": 2,
          "losses": -3,
          "rounds": 12,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 2,
          "height": -1,
          "reach": 0,
          "younger": -5,
          "sig_str_landed": -1.362366136363637,
          "sig_str_accuracy": 0.017552272727272555,
          "sub_attempts": 0.2559268181818181,
          "td_landed": 0.8949697727272732,
          "td_accuracy": 0.19218409090909083,
          "elo": -0.06
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-27",
        "fighterB": "2026-05-02"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254073-mc37bz",
    "createdAt": "2026-10-24T13:40:54.073Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Grant Dawson",
    "fighterB": "Nurullo Aliev",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5448468767092504,
    "fighterBProb": 0.45515312329074964,
    "predictedWinner": "Grant Dawson",
    "predictedProb": 0.5448468767092504,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5355874015516072,
    "c6ProbB": 0.4644125984483928,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Grant Dawson",
    "trackedProb": 0.5355874015516072,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.060673089347300646,
    "betRecommendedFighter": "Grant Dawson",
    "betRecommendedOdds": "-102",
    "marketOdds": "-102",
    "edge": 0.030636906502102268,
    "edgeA": 0.030636906502102268,
    "edgeB": -0.030636906502102268,
    "ev": 6.067308934730065,
    "evA": 6.067308934730065,
    "evB": -6.188655113424652,
    "kelly": 0.06188655113424665,
    "kellyA": 0.06188655113424665,
    "kellyB": 0,
    "fairLine": "-115",
    "fairLineA": "-115",
    "fairLineB": "+115",
    "oddsA": "-102",
    "oddsB": "+102",
    "v2pA": 0.5564408368517817,
    "v2pB": 0.4435591631482183,
    "projectedKO": 11,
    "projectedSUB": 15,
    "projectedDEC": 74,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.073Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5355874015516072,
        "pB": 0.4644125984483928
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.05131810676940013,
          "avg_sig_str_pct_dif": 0.8794456521739136,
          "avg_td_dif": 0.3659821428571429,
          "avg_td_pct_dif": -0.615713610586011,
          "atd_dif": -1.266666666666668,
          "avg_sub_att_dif": 1.0501708074534162,
          "kd_dif": 0.42,
          "control_time_dif": -0.20555555555555552,
          "reach_dif": 0,
          "height_dif": 0,
          "age_dif": -1.627906976744186,
          "win_streak_dif": -2.142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 1.8181818181818181,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 1.5294117647058822,
          "deep_round_dif": 0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 3.5714285714285716,
          "elo_dif": 1.875,
          "layoff_dif": -0.385,
          "cardio_dif": -0.7670833333333331,
          "peak_elo_dif": 2.2181818181818183,
          "ufc_fight_count_dif": 1.25,
          "rank_tier_dif": 1.90625136547763
        },
        "v2": {
          "modern_form": -0.21680216802168029,
          "wins": 8,
          "losses": -2,
          "rounds": 26,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 5,
          "height": 0,
          "reach": 0,
          "younger": -7,
          "sig_str_landed": 0.810826086956522,
          "sig_str_accuracy": 0.08794456521739136,
          "sub_attempts": 0.7351195652173913,
          "td_landed": 0.512375,
          "td_accuracy": -0.14161413043478255,
          "elo": 0.93
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-09",
        "fighterB": "2026-07-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254072-u005ip",
    "createdAt": "2026-10-24T13:40:54.072Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Abubakar Vagaev",
    "fighterB": "Jacob Malkoun",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.324124551722815,
    "fighterBProb": 0.6758754482771849,
    "predictedWinner": "Jacob Malkoun",
    "predictedProb": 0.6758754482771849,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4527925860517538,
    "c6ProbB": 0.5472074139482461,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Jacob Malkoun",
    "trackedProb": 0.5472074139482461,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.31876986761527326,
    "betRecommendedFighter": "Jacob Malkoun",
    "betRecommendedOdds": "+141",
    "marketOdds": "+141",
    "edge": 0.13226965461214651,
    "edgeA": -0.13226965461214663,
    "edgeB": 0.13226965461214651,
    "ev": 31.876986761527334,
    "evA": -22.607792029452,
    "evB": 31.876986761527334,
    "kelly": 0.22607792029452,
    "kellyA": 0,
    "kellyB": 0.22607792029452,
    "fairLine": "-121",
    "fairLineA": "+121",
    "fairLineB": "-121",
    "oddsA": "-141",
    "oddsB": "+141",
    "v2pA": 0.28411691537206696,
    "v2pB": 0.715883084627933,
    "projectedKO": 7,
    "projectedSUB": 3,
    "projectedDEC": 90,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.072Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4527925860517538,
        "pB": 0.5472074139482461
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.05807036823935557,
          "avg_sig_str_pct_dif": -1.2340303030302995,
          "avg_td_dif": -2.389971212121212,
          "avg_td_pct_dif": -0.2126613965744397,
          "atd_dif": 1.9466666666666665,
          "avg_sub_att_dif": -0.45414632034632024,
          "kd_dif": -0.364,
          "control_time_dif": -0.6388888888888888,
          "reach_dif": 0,
          "height_dif": 0.32967032967032966,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": -1.1363636363636362,
          "loss_dif": 1.111111111111111,
          "total_round_dif": -1.1176470588235294,
          "deep_round_dif": -0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": -1.0483870967741935,
          "layoff_dif": 0.42,
          "cardio_dif": 0.9916666666666667,
          "peak_elo_dif": -0.9454545454545454,
          "ufc_fight_count_dif": -1,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.16143271534871984,
          "wins": -5,
          "losses": 3,
          "rounds": -19,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": 3,
          "reach": 0,
          "younger": -2,
          "sig_str_landed": -0.917511818181818,
          "sig_str_accuracy": -0.12340303030302996,
          "sub_attempts": -0.31790242424242415,
          "td_landed": -3.345959696969697,
          "td_accuracy": -0.04891212121212113,
          "elo": -0.52
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-25",
        "fighterB": "2026-05-02"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254072-l7qbp0",
    "createdAt": "2026-10-24T13:40:54.072Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Daniel Santos",
    "fighterB": "Bolaji Oki",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5690276625779784,
    "fighterBProb": 0.43097233742202157,
    "predictedWinner": "Daniel Santos",
    "predictedProb": 0.5690276625779784,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.549651685755158,
    "c6ProbB": 0.450348314244842,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Daniel Santos",
    "trackedProb": 0.549651685755158,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.11029640522541917,
    "betRecommendedFighter": "Daniel Santos",
    "betRecommendedOdds": "+102",
    "marketOdds": "+102",
    "edge": 0.05460218080466295,
    "edgeA": 0.05460218080466295,
    "edgeB": -0.05460218080466295,
    "ev": 11.029640522541918,
    "evA": 11.029640522541918,
    "evB": -10.813373061315602,
    "kelly": 0.10813373061315605,
    "kellyA": 0.10813373061315605,
    "kellyB": 0,
    "fairLine": "-122",
    "fairLineA": "-122",
    "fairLineB": "+122",
    "oddsA": "+102",
    "oddsB": "-102",
    "v2pA": 0.5979193906939003,
    "v2pB": 0.4020806093060997,
    "projectedKO": 21,
    "projectedSUB": 3,
    "projectedDEC": 76,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.072Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.549651685755158,
        "pB": 0.450348314244842
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.010388363935154271,
          "avg_sig_str_pct_dif": -0.34371682807017523,
          "avg_td_dif": 1.017756090225564,
          "avg_td_pct_dif": -0.8327932875667424,
          "atd_dif": 0.06666666666666599,
          "avg_sub_att_dif": -0.16164070175438588,
          "kd_dif": 1.068,
          "control_time_dif": 0.26666666666666666,
          "reach_dif": -0.5555555555555555,
          "height_dif": -0.32967032967032966,
          "age_dif": -0.23255813953488372,
          "win_streak_dif": 0,
          "lose_streak_dif": 1,
          "win_dif": 0.45454545454545453,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": 0.17647058823529413,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0,
          "elo_dif": 2.943548387096774,
          "layoff_dif": 0.315,
          "cardio_dif": -2.3366666666666664,
          "peak_elo_dif": 1.5636363636363637,
          "ufc_fight_count_dif": 0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.2623141056580246,
          "wins": 2,
          "losses": 1,
          "rounds": 3,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 0,
          "height": -3,
          "reach": -6,
          "younger": -1,
          "sig_str_landed": -0.16413615017543748,
          "sig_str_accuracy": -0.03437168280701752,
          "sub_attempts": -0.11314849122807011,
          "td_landed": 1.4248585263157896,
          "td_accuracy": -0.19154245614035076,
          "elo": 1.46
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-16",
        "fighterB": "2026-03-14"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254072-gvokqi",
    "createdAt": "2026-10-24T13:40:54.072Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Noah Gugnon",
    "fighterB": "Kody Steele",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5936415170873436,
    "fighterBProb": 0.4063584829126564,
    "predictedWinner": "Noah Gugnon",
    "predictedProb": 0.5936415170873436,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5177090556679442,
    "c6ProbB": 0.48229094433205577,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Noah Gugnon",
    "trackedProb": 0.5177090556679442,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.216616280819669,
    "betRecommendedFighter": "Noah Gugnon",
    "betRecommendedOdds": "+135",
    "marketOdds": "+135",
    "edge": 0.0921771407743272,
    "edgeA": 0.0921771407743272,
    "edgeB": -0.09217714077432726,
    "ev": 21.661628081966896,
    "evA": 21.661628081966896,
    "evB": -16.045650431086592,
    "kelly": 0.16045650431086592,
    "kellyA": 0.16045650431086592,
    "kellyB": 0,
    "fairLine": "-107",
    "fairLineA": "-107",
    "fairLineB": "+107",
    "oddsA": "+135",
    "oddsB": "-135",
    "v2pA": 0.6535545511517895,
    "v2pB": 0.3464454488482105,
    "projectedKO": 18,
    "projectedSUB": 60,
    "projectedDEC": 22,
    "projectedFinish": "SUB",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.072Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5177090556679442,
        "pB": 0.48229094433205577
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.007880205466886793,
          "avg_sig_str_pct_dif": 0.3872210144927535,
          "avg_td_dif": -0.08122023809523823,
          "avg_td_pct_dif": -0.1697936357908004,
          "atd_dif": -0.7111111111111112,
          "avg_sub_att_dif": 0.9069720496894409,
          "kd_dif": 0,
          "control_time_dif": 1.2333333333333332,
          "reach_dif": 0,
          "height_dif": 0.10989010989010989,
          "age_dif": 1.1627906976744187,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": -0.17647058823529413,
          "deep_round_dif": -0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": 0.42338709677419356,
          "layoff_dif": 0.455,
          "cardio_dif": 0,
          "peak_elo_dif": 0.38181818181818183,
          "ufc_fight_count_dif": -0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.35555555555555557,
          "wins": 0,
          "losses": 1,
          "rounds": -3,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 1,
          "reach": 0,
          "younger": 5,
          "sig_str_landed": 0.12450724637681132,
          "sig_str_accuracy": 0.03872210144927535,
          "sub_attempts": 0.6348804347826086,
          "td_landed": -0.11370833333333352,
          "td_accuracy": -0.039052536231884094,
          "elo": 0.21
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-08-01",
        "fighterB": "2026-05-02"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792849254071-ay6mwc",
    "createdAt": "2026-10-24T13:40:54.071Z",
    "eventName": "UFC 333",
    "eventDate": "2026-10-24",
    "fighterA": "Nicolle Caliari",
    "fighterB": "Iasmin Lucindo",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Strawweight",
    "boutContext": {
      "division": "Women's Strawweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-333",
        "retrievedAt": "2026-10-20",
        "authority": "official"
      }
    },
    "fighterAProb": 0.2643127136783687,
    "fighterBProb": 0.7356872863216313,
    "predictedWinner": "Iasmin Lucindo",
    "predictedProb": 0.7356872863216313,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.17979443566276457,
    "c6ProbB": 0.8202055643372355,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Iasmin Lucindo",
    "trackedProb": 0.8202055643372355,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.04491941758031359,
    "betRecommendedFighter": "Iasmin Lucindo",
    "betRecommendedOdds": "-365",
    "marketOdds": "-365",
    "edge": 0.035259327778095706,
    "edgeA": -0.03525932777809565,
    "edgeB": 0.035259327778095706,
    "ev": 4.491941758031363,
    "evA": -16.395587416814465,
    "evB": 4.491941758031363,
    "kelly": 0.16395587416814483,
    "kellyA": 0,
    "kellyB": 0.16395587416814483,
    "fairLine": "-456",
    "fairLineA": "+456",
    "fairLineB": "-456",
    "oddsA": "+365",
    "oddsB": "-365",
    "v2pA": 0.3571605600881262,
    "v2pB": 0.6428394399118738,
    "projectedKO": 11,
    "projectedSUB": 32,
    "projectedDEC": 57,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-24T13:40:54.071Z",
      "targetEventDate": "2026-10-24",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Women's Strawweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-333",
          "retrievedAt": "2026-10-20",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.17979443566276457,
        "pB": 0.8202055643372355
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.08335953731994755,
          "avg_sig_str_pct_dif": -0.35344827586206884,
          "avg_td_dif": 0.05441699507389185,
          "avg_td_pct_dif": -1.1371814092953525,
          "atd_dif": -2.933333333333334,
          "avg_sub_att_dif": 0.3570443349753694,
          "kd_dif": 0,
          "control_time_dif": -0.16666666666666677,
          "reach_dif": -0.37037037037037035,
          "height_dif": 0,
          "age_dif": -1.1627906976744187,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -0.9090909090909091,
          "loss_dif": 0,
          "total_round_dif": -0.6470588235294118,
          "deep_round_dif": -0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": -2.1774193548387095,
          "layoff_dif": 1.4,
          "cardio_dif": -0.8933333333333335,
          "peak_elo_dif": -1.709090909090909,
          "ufc_fight_count_dif": -0.5,
          "rank_tier_dif": -2.391181645722577
        },
        "v2": {
          "modern_form": -0.19209089875978463,
          "wins": -4,
          "losses": 0,
          "rounds": -11,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 0,
          "reach": -4,
          "younger": -5,
          "sig_str_landed": 1.3170806896551714,
          "sig_str_accuracy": -0.035344827586206884,
          "sub_attempts": 0.24993103448275858,
          "td_landed": 0.07618379310344858,
          "td_accuracy": -0.2615517241379311,
          "elo": -1.08
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-16",
        "fighterB": "2025-08-09"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "aba416ae172a2661266be3a734d60f535571231bebc95c4e4c7f3c31188334ed",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "7b010be5f489a14225f4bacf83df2923020d1fef6e87288c313fe68be4752860",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv",
            "ufc_fight_details.csv",
            "ufc_fight_stats.csv"
          ],
          "generatorVersion": "update_fighters.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-10-17",
          "contentHash": "dd3c1a7a14ecfb5cfe8a8a895a3725823584d54cd4600fde670b04871a5a033b",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (793 rows); maximum event date found = 2026-10-17. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-21",
          "maxObservedEventDate": null,
          "contentHash": "6793990c565cf1f10e55e387aca0733928e54e8b1d5ab40aabbbec6e2f5e0857",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 255 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2462 canonical names, and the shipped artifact contains 2462 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "60188ce5eee1534536003bf48c472b3805717bf434d54cc6466b89640b700daf",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-20T21:22:31Z",
          "maxObservedEventDate": "2026-10-20",
          "contentHash": "329c4e7edc9f12070cc4fb923d06c8a911e63ca4b0354bb2614197b52f52c610",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 8df9fd812e8d122f378fb205d41cf98dc13a47c0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
