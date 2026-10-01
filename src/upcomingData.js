export const UPCOMING_ENTRIES = [
  {
    "id": "1790813208711-s4f90g",
    "createdAt": "2026-10-01T00:06:48.711Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Natalia Silva",
    "fighterB": "Wang Cong",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Flyweight",
    "boutContext": {
      "division": "Women's Flyweight",
      "isTitleBout": true,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5503581567938417,
    "fighterBProb": 0.4496418432061583,
    "predictedWinner": "Natalia Silva",
    "predictedProb": 0.5503581567938417,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6472954631515667,
    "c6ProbB": 0.3527045368484333,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Natalia Silva",
    "trackedProb": 0.6472954631515667,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-194",
    "edge": -0.006349511166325872,
    "edgeA": -0.006349511166325872,
    "edgeB": 0.006349511166325927,
    "ev": -1.9047081615666954,
    "evA": -1.9047081615666954,
    "evB": 0.8734975386519324,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.004696223326085672,
    "fairLine": "-184",
    "fairLineA": "-184",
    "fairLineB": "+184",
    "oddsA": "-194",
    "oddsB": "+186",
    "v2pA": 0.5094528095541304,
    "v2pB": 0.4905471904458696,
    "projectedKO": 20,
    "projectedSUB": 3,
    "projectedDEC": 77,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.711Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Flyweight",
        "isTitleBout": true,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6472954631515667,
        "pB": 0.3527045368484333
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.12848101265822787,
          "avg_sig_str_pct_dif": -1.2999999999999994,
          "avg_td_dif": 0,
          "avg_td_pct_dif": -1.6086956521739133,
          "atd_dif": 0.40000000000000036,
          "avg_sub_att_dif": -0.3,
          "kd_dif": 0.19600000000000006,
          "control_time_dif": -0.1277777777777778,
          "reach_dif": -0.13888888888888887,
          "height_dif": -0.21978021978021978,
          "age_dif": 1.1627906976744187,
          "win_streak_dif": 2.857142857142857,
          "lose_streak_dif": 0,
          "win_dif": 0.6818181818181818,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": 0.4117647058823529,
          "deep_round_dif": 0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 2.1774193548387095,
          "layoff_dif": -0.84,
          "cardio_dif": -0.15416666666666634,
          "peak_elo_dif": 1.9636363636363636,
          "ufc_fight_count_dif": 0.25,
          "rank_tier_dif": 1.1504682900290408
        },
        "v2": {
          "modern_form": 0.08881949865556427,
          "wins": 3,
          "losses": 1,
          "rounds": 7,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": -2,
          "reach": -1.5,
          "younger": 5,
          "sig_str_landed": -2.0300000000000002,
          "sig_str_accuracy": -0.12999999999999995,
          "sub_attempts": -0.21,
          "td_landed": 0,
          "td_accuracy": -0.37000000000000005,
          "elo": 1.08
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-01-24",
        "fighterB": "2026-07-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208710-i40a9p",
    "createdAt": "2026-10-01T00:06:48.710Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Deiveson Figueiredo",
    "fighterB": "Payton Talbott",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.39139578236544714,
    "fighterBProb": 0.6086042176345529,
    "predictedWinner": "Payton Talbott",
    "predictedProb": 0.6086042176345529,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.12699324905965692,
    "c6ProbB": 0.8730067509403431,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Payton Talbott",
    "trackedProb": 0.8730067509403431,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-525",
    "edge": 0.04137959576792938,
    "edgeA": -0.04137959576792927,
    "edgeB": 0.04137959576792938,
    "ev": 3.9293751119456033,
    "evA": -25.32796955292173,
    "evB": 3.9293751119456033,
    "kelly": 0.20629219337714425,
    "kellyA": 0,
    "kellyB": 0.20629219337714425,
    "fairLine": "-687",
    "fairLineA": "+687",
    "fairLineB": "-687",
    "oddsA": "+488",
    "oddsB": "-525",
    "v2pA": 0.3044435938320951,
    "v2pB": 0.6955564061679049,
    "projectedKO": 33,
    "projectedSUB": 20,
    "projectedDEC": 47,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.710Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.12699324905965692,
        "pB": 0.8730067509403431
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.23163291139240505,
          "avg_sig_str_pct_dif": -0.8023999999999998,
          "avg_td_dif": 0.45714285714285724,
          "avg_td_pct_dif": -0.6521739130434784,
          "atd_dif": -1.333333333333334,
          "avg_sub_att_dif": 1.342857142857143,
          "kd_dif": -0.524,
          "control_time_dif": 0.25555555555555554,
          "reach_dif": -0.18518518518518517,
          "height_dif": -0.5494505494505495,
          "age_dif": -2.3255813953488373,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -2,
          "win_dif": 2.0454545454545454,
          "loss_dif": -2.222222222222222,
          "total_round_dif": 2.588235294117647,
          "deep_round_dif": 0.47058823529411764,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 2.142857142857143,
          "elo_dif": 1.129032258064516,
          "layoff_dif": 0.875,
          "cardio_dif": 0.8608333333333339,
          "peak_elo_dif": 2.5090909090909093,
          "ufc_fight_count_dif": 1.875,
          "rank_tier_dif": 0.40987344535397296
        },
        "v2": {
          "modern_form": -0.434460861110156,
          "wins": 9,
          "losses": -6,
          "rounds": 44,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 3,
          "height": -5,
          "reach": -2,
          "younger": -10,
          "sig_str_landed": -3.6598,
          "sig_str_accuracy": -0.08023999999999998,
          "sub_attempts": 0.94,
          "td_landed": 0.6400000000000001,
          "td_accuracy": -0.15000000000000002,
          "elo": 0.56
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-30",
        "fighterB": "2025-12-06"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208710-ugmcvc",
    "createdAt": "2026-10-01T00:06:48.710Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "King Green",
    "fighterB": "Esteban Ribovics",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6123066918592842,
    "fighterBProb": 0.3876933081407158,
    "predictedWinner": "King Green",
    "predictedProb": 0.6123066918592842,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3369245242697184,
    "c6ProbB": 0.6630754757302816,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Esteban Ribovics",
    "trackedProb": 0.6630754757302816,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-223",
    "edge": -0.019872421713669874,
    "edgeA": 0.01987242171366982,
    "edgeB": -0.019872421713669874,
    "ev": -3.9581261610399316,
    "evA": 5.120451572152149,
    "evB": -3.9581261610399316,
    "kelly": 0,
    "kellyA": 0.024153073453547884,
    "kellyB": 0,
    "fairLine": "-197",
    "fairLineA": "+197",
    "fairLineB": "-197",
    "oddsA": "+212",
    "oddsB": "-223",
    "v2pA": 0.5143730993095665,
    "v2pB": 0.48562690069043346,
    "projectedKO": 30,
    "projectedSUB": 10,
    "projectedDEC": 60,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.710Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.3369245242697184,
        "pB": 0.6630754757302816
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.0518987341772152,
          "avg_sig_str_pct_dif": 1.0000000000000002,
          "avg_td_dif": 0.6642857142857143,
          "avg_td_pct_dif": -0.9130434782608696,
          "atd_dif": 0.39999999999999963,
          "avg_sub_att_dif": 0.17142857142857149,
          "kd_dif": -0.21999999999999997,
          "control_time_dif": 0.29444444444444445,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0,
          "age_dif": -2.3255813953488373,
          "win_streak_dif": 2.142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 2.727272727272727,
          "loss_dif": -3.333333333333333,
          "total_round_dif": 2.8823529411764706,
          "deep_round_dif": 0.7647058823529411,
          "total_title_bout_dif": 0,
          "ko_dif": 1.5,
          "sub_dif": 2.142857142857143,
          "elo_dif": 1.189516129032258,
          "layoff_dif": -0.175,
          "cardio_dif": -2.2995833333333335,
          "peak_elo_dif": 1.0727272727272728,
          "ufc_fight_count_dif": 2.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.11049281888959639,
          "wins": 12,
          "losses": -9,
          "rounds": 49,
          "title_bouts": 0,
          "ko_wins": 3,
          "sub_wins": 3,
          "height": 0,
          "reach": 2,
          "younger": -10,
          "sig_str_landed": -0.8200000000000003,
          "sig_str_accuracy": 0.10000000000000003,
          "sub_attempts": 0.12000000000000002,
          "td_landed": 0.9299999999999999,
          "td_accuracy": -0.21000000000000002,
          "elo": 0.59
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-11",
        "fighterB": "2026-08-15"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208710-c43iy0",
    "createdAt": "2026-10-01T00:06:48.710Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Ateba Gautier",
    "fighterB": "Roman Kopylov",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.656650066571055,
    "fighterBProb": 0.34334993342894504,
    "predictedWinner": "Ateba Gautier",
    "predictedProb": 0.656650066571055,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7414528148700154,
    "c6ProbB": 0.25854718512998465,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Ateba Gautier",
    "trackedProb": 0.7414528148700154,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-212",
    "edge": 0.06837347374088165,
    "edgeA": 0.06837347374088165,
    "edgeB": -0.06837347374088171,
    "ev": 9.119470867662645,
    "evA": 9.119470867662645,
    "evB": -21.66020290561466,
    "kelly": 0.19333278239444798,
    "kellyA": 0.19333278239444798,
    "kellyB": 0,
    "fairLine": "-287",
    "fairLineA": "-287",
    "fairLineB": "+287",
    "oddsA": "-212",
    "oddsB": "+203",
    "v2pA": 0.6693756011640927,
    "v2pB": 0.33062439883590733,
    "projectedKO": 60,
    "projectedSUB": 9,
    "projectedDEC": 31,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.710Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7414528148700154,
        "pB": 0.25854718512998465
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.0435124143684523,
          "avg_sig_str_pct_dif": -0.8231711026615951,
          "avg_td_dif": -0.10063134166214056,
          "avg_td_pct_dif": 0.90389926709649,
          "atd_dif": -0.7288888888888894,
          "avg_sub_att_dif": 0.33498656527249693,
          "kd_dif": 2.748,
          "control_time_dif": -0.06111111111111109,
          "reach_dif": 0.5555555555555555,
          "height_dif": 0.43956043956043955,
          "age_dif": 2.558139534883721,
          "win_streak_dif": 2.857142857142857,
          "lose_streak_dif": 0,
          "win_dif": -0.45454545454545453,
          "loss_dif": 1.8518518518518516,
          "total_round_dif": -1.411764705882353,
          "deep_round_dif": -0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": 1.1491935483870968,
          "layoff_dif": 0,
          "cardio_dif": -0.2850000000000001,
          "peak_elo_dif": 0.6909090909090909,
          "ufc_fight_count_dif": -0.875,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.33984539618381426,
          "wins": -2,
          "losses": 5,
          "rounds": -24,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": 4,
          "reach": 6,
          "younger": 11,
          "sig_str_landed": -0.6874961470215464,
          "sig_str_accuracy": -0.08231711026615951,
          "sub_attempts": 0.23449059569074782,
          "td_landed": -0.14088387832699678,
          "td_accuracy": 0.20789683143219273,
          "elo": 0.57
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-09",
        "fighterB": "2026-05-09"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208709-0sgdiv",
    "createdAt": "2026-10-01T00:06:48.709Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Imanol Rodriguez",
    "fighterB": "Alden Coria",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.3313657375541514,
    "fighterBProb": 0.6686342624458486,
    "predictedWinner": "Alden Coria",
    "predictedProb": 0.6686342624458486,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5414143575312846,
    "c6ProbB": 0.45858564246871536,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Imanol Rodriguez",
    "trackedProb": 0.5414143575312846,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-138",
    "edge": -0.033236248323524786,
    "edgeA": -0.033236248323524786,
    "edgeB": 0.03323624832352462,
    "ev": -6.625639788082786,
    "evA": -6.625639788082786,
    "evB": 6.850454695210686,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.05150717815947882,
    "fairLine": "-118",
    "fairLineA": "-118",
    "fairLineB": "+118",
    "oddsA": "-138",
    "oddsB": "+133",
    "v2pA": 0.44921272481989866,
    "v2pB": 0.5507872751801013,
    "projectedKO": 60,
    "projectedSUB": 11,
    "projectedDEC": 29,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.709Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5414143575312846,
        "pB": 0.45858564246871536
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.0007670972776140358,
          "avg_sig_str_pct_dif": 0.17940639269406367,
          "avg_td_dif": -0.28222377690802364,
          "avg_td_pct_dif": -0.5957732777446895,
          "atd_dif": -0.9733333333333327,
          "avg_sub_att_dif": -0.8827625570776255,
          "kd_dif": 3.112,
          "control_time_dif": -0.6777777777777777,
          "reach_dif": -0.27777777777777773,
          "height_dif": -0.43956043956043955,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": -0.45454545454545453,
          "loss_dif": 0,
          "total_round_dif": -0.4117647058823529,
          "deep_round_dif": -0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": -0.7056451612903225,
          "layoff_dif": -0.7,
          "cardio_dif": -0.4275000000000001,
          "peak_elo_dif": -0.6363636363636364,
          "ufc_fight_count_dif": -0.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0,
          "wins": -2,
          "losses": 0,
          "rounds": -7,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": -4,
          "reach": -3,
          "younger": 2,
          "sig_str_landed": -0.012120136986301766,
          "sig_str_accuracy": 0.017940639269406367,
          "sub_attempts": -0.6179337899543378,
          "td_landed": -0.3951132876712331,
          "td_accuracy": -0.13702785388127858,
          "elo": -0.35
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-28",
        "fighterB": "2026-07-18"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208709-51inxt",
    "createdAt": "2026-10-01T00:06:48.709Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Damian Pinas",
    "fighterB": "Andrey Pulyaev",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.7976885518445697,
    "fighterBProb": 0.20231144815543034,
    "predictedWinner": "Damian Pinas",
    "predictedProb": 0.7976885518445697,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.8854312032723541,
    "c6ProbB": 0.11456879672764586,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Damian Pinas",
    "trackedProb": 0.8854312032723541,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-456",
    "edge": 0.07361489221419326,
    "edgeA": 0.07361489221419326,
    "edgeB": -0.07361489221419318,
    "ev": 7.96047127619055,
    "evA": 7.96047127619055,
    "evB": -39.73681292125828,
    "kelly": 0.36299749019428906,
    "kellyA": 0.36299749019428906,
    "kellyB": 0,
    "fairLine": "-773",
    "fairLineA": "-773",
    "fairLineB": "+773",
    "oddsA": "-456",
    "oddsB": "+426",
    "v2pA": 0.7803575440534284,
    "v2pB": 0.2196424559465716,
    "projectedKO": 60,
    "projectedSUB": 12,
    "projectedDEC": 28,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.709Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.8854312032723541,
        "pB": 0.11456879672764586
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.08661124358665834,
          "avg_sig_str_pct_dif": 0.5379566844106481,
          "avg_td_dif": 0.49365437262357387,
          "avg_td_pct_dif": 0.7589717308646058,
          "atd_dif": -0.16000000000000014,
          "avg_sub_att_dif": 0.33498656527249693,
          "kd_dif": 7.112,
          "control_time_dif": 0,
          "reach_dif": 0.09259259259259259,
          "height_dif": -0.32967032967032966,
          "age_dif": 1.3953488372093024,
          "win_streak_dif": 1.4285714285714286,
          "lose_streak_dif": 2,
          "win_dif": 0.22727272727272727,
          "loss_dif": 1.111111111111111,
          "total_round_dif": -0.4117647058823529,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 2.5,
          "layoff_dif": 0.07,
          "cardio_dif": 1.4229166666666668,
          "peak_elo_dif": 1.3636363636363635,
          "ufc_fight_count_dif": -0.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.6765582655826559,
          "wins": 1,
          "losses": 3,
          "rounds": -7,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": -3,
          "reach": 1,
          "younger": 6,
          "sig_str_landed": 1.3684576486692017,
          "sig_str_accuracy": 0.053795668441064814,
          "sub_attempts": 0.23449059569074784,
          "td_landed": 0.6911161216730034,
          "td_accuracy": 0.17456349809885935,
          "elo": 1.24
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
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208709-i8d7ee",
    "createdAt": "2026-10-01T00:06:48.709Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Johnny Walker",
    "fighterB": "Mick Parkin",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6043243606591021,
    "fighterBProb": 0.3956756393408979,
    "predictedWinner": "Johnny Walker",
    "predictedProb": 0.6043243606591021,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5244012445318775,
    "c6ProbB": 0.47559875546812247,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Johnny Walker",
    "trackedProb": 0.5244012445318775,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-122",
    "edge": -0.01950309864928701,
    "edgeA": -0.01950309864928701,
    "edgeB": 0.0195030986492869,
    "ev": -4.576166978625565,
    "evA": -4.576166978625565,
    "evB": 3.204929936582573,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.02739256356053477,
    "fairLine": "-110",
    "fairLineA": "-110",
    "fairLineB": "+110",
    "oddsA": "-122",
    "oddsB": "+117",
    "v2pA": 0.47044146737257375,
    "v2pB": 0.5295585326274262,
    "projectedKO": 44,
    "projectedSUB": 10,
    "projectedDEC": 46,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.709Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5244012445318775,
        "pB": 0.47559875546812247
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.054158517614762876,
          "avg_sig_str_pct_dif": 0.3212986987951816,
          "avg_td_dif": -0.5137578886976477,
          "avg_td_pct_dif": 0.20257377335428697,
          "atd_dif": 0.37777777777777766,
          "avg_sub_att_dif": 0.5076305220883534,
          "kd_dif": 1.0999999999999999,
          "control_time_dif": -0.1111111111111111,
          "reach_dif": 0.27777777777777773,
          "height_dif": 0.21978021978021978,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0.9090909090909091,
          "loss_dif": -2.222222222222222,
          "total_round_dif": 0.8823529411764706,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 2.5,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.6653225806451613,
          "layoff_dif": 1.925,
          "cardio_dif": -2.8887500000000004,
          "peak_elo_dif": 0.9272727272727272,
          "ufc_fight_count_dif": 1.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.15592306088238278,
          "wins": 4,
          "losses": -6,
          "rounds": 15,
          "title_bouts": 0,
          "ko_wins": 5,
          "sub_wins": 1,
          "height": 2,
          "reach": 3,
          "younger": -3,
          "sig_str_landed": -0.8557045783132535,
          "sig_str_accuracy": 0.03212986987951816,
          "sub_attempts": 0.35534136546184736,
          "td_landed": -0.7192610441767068,
          "td_accuracy": 0.046591967871486006,
          "elo": 0.33
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2025-03-22"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208708-nsod3z",
    "createdAt": "2026-10-01T00:06:48.708Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Rafael Dos Anjos",
    "fighterB": "Alexander Hernandez",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.43148032967042205,
    "fighterBProb": 0.568519670329578,
    "predictedWinner": "Alexander Hernandez",
    "predictedProb": 0.568519670329578,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.2959215606821972,
    "c6ProbB": 0.7040784393178028,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Alexander Hernandez",
    "trackedProb": 0.7040784393178028,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-257",
    "edge": -0.008863304742021128,
    "edgeA": 0.008863304742021128,
    "edgeB": -0.008863304742021128,
    "ev": -2.196107845737128,
    "evA": 2.0929384353580502,
    "evB": -2.196107845737128,
    "kelly": 0,
    "kellyA": 0.008542605858604283,
    "kellyB": 0,
    "fairLine": "-238",
    "fairLineA": "+238",
    "fairLineB": "-238",
    "oddsA": "+245",
    "oddsB": "-257",
    "v2pA": 0.4877900716929603,
    "v2pB": 0.5122099283070397,
    "projectedKO": 30,
    "projectedSUB": 12,
    "projectedDEC": 58,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.708Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.2959215606821972,
        "pB": 0.7040784393178028
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.0727784810126582,
          "avg_sig_str_pct_dif": 0.4359999999999997,
          "avg_td_dif": 0.6428571428571428,
          "avg_td_pct_dif": 0.04347826086956525,
          "atd_dif": -0.9333333333333335,
          "avg_sub_att_dif": 0.7,
          "kd_dif": -0.6920000000000001,
          "control_time_dif": 0.3444444444444444,
          "reach_dif": -0.18518518518518517,
          "height_dif": -0.10989010989010989,
          "age_dif": -1.627906976744186,
          "win_streak_dif": 0,
          "lose_streak_dif": -2,
          "win_dif": 2.5,
          "loss_dif": -2.5925925925925926,
          "total_round_dif": 4.176470588235294,
          "deep_round_dif": 1,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 3.5714285714285716,
          "elo_dif": 0.9677419354838709,
          "layoff_dif": -2.73,
          "cardio_dif": 0.17666666666666664,
          "peak_elo_dif": 2.5272727272727273,
          "ufc_fight_count_dif": 2.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.39751709531851276,
          "wins": 11,
          "losses": -7,
          "rounds": 71,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 5,
          "height": -1,
          "reach": -2,
          "younger": -7,
          "sig_str_landed": -1.1498999999999997,
          "sig_str_accuracy": 0.04359999999999997,
          "sub_attempts": 0.48999999999999994,
          "td_landed": 0.8999999999999999,
          "td_accuracy": 0.010000000000000009,
          "elo": 0.48
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2024-10-26",
        "fighterB": "2026-04-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208708-xybhlo",
    "createdAt": "2026-10-01T00:06:48.708Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Marvin Vettori",
    "fighterB": "Ismail Naurdiev",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.44164283471190735,
    "fighterBProb": 0.5583571652880926,
    "predictedWinner": "Ismail Naurdiev",
    "predictedProb": 0.5583571652880926,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.43059160136343827,
    "c6ProbB": 0.5694083986365617,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Ismail Naurdiev",
    "trackedProb": 0.5694083986365617,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-127",
    "edge": 0.015433470354249357,
    "edgeA": -0.015433470354249468,
    "edgeB": 0.015433470354249357,
    "ev": 1.7761468429129863,
    "evA": -4.408664497316707,
    "evB": 1.7761468429129863,
    "kelly": 0.022557064904994976,
    "kellyA": 0,
    "kellyB": 0.022557064904994976,
    "fairLine": "-132",
    "fairLineA": "+132",
    "fairLineB": "-132",
    "oddsA": "+122",
    "oddsB": "-127",
    "v2pA": 0.4639025323209136,
    "v2pB": 0.5360974676790864,
    "projectedKO": 12,
    "projectedSUB": 8,
    "projectedDEC": 79,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.708Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.43059160136343827,
        "pB": 0.5694083986365617
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.008354430379746843,
          "avg_sig_str_pct_dif": -1.068,
          "avg_td_dif": -0.050000000000000044,
          "avg_td_pct_dif": 0.13043478260869576,
          "atd_dif": -0.3333333333333329,
          "avg_sub_att_dif": 0.3285714285714286,
          "kd_dif": -0.42,
          "control_time_dif": 0.03888888888888885,
          "reach_dif": 0,
          "height_dif": 0.21978021978021978,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": -4,
          "win_dif": 1.1363636363636362,
          "loss_dif": -1.8518518518518516,
          "total_round_dif": 2.5294117647058822,
          "deep_round_dif": 0.5882352941176471,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 1.4285714285714286,
          "elo_dif": 0.7459677419354839,
          "layoff_dif": 0.07,
          "cardio_dif": 1.060416666666667,
          "peak_elo_dif": 1.7272727272727273,
          "ufc_fight_count_dif": 1.25,
          "rank_tier_dif": 1.8195734938548842
        },
        "v2": {
          "modern_form": -0.33888641546660647,
          "wins": 5,
          "losses": -5,
          "rounds": 43,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 2,
          "height": 2,
          "reach": 0,
          "younger": -3,
          "sig_str_landed": 0.13200000000000012,
          "sig_str_accuracy": -0.1068,
          "sub_attempts": 0.23,
          "td_landed": -0.07000000000000006,
          "td_accuracy": 0.030000000000000027,
          "elo": 0.37
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-06",
        "fighterB": "2025-11-22"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790813208707-6vyyv2",
    "createdAt": "2026-10-01T00:06:48.707Z",
    "eventName": "UFC 332: Silva vs. Wang",
    "eventDate": "2026-10-03",
    "fighterA": "Court McGee",
    "fighterB": "Eric Nolan",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-332",
        "retrievedAt": "2026-09-30",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5043337007472332,
    "fighterBProb": 0.49566629925276684,
    "predictedWinner": "Court McGee",
    "predictedProb": 0.5043337007472332,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.33666870294435386,
    "c6ProbB": 0.6633312970556462,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Eric Nolan",
    "trackedProb": 0.6633312970556462,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-212",
    "edge": -0.009748044073487505,
    "edgeA": 0.009748044073487505,
    "edgeB": -0.009748044073487505,
    "ev": -2.377658169169049,
    "evA": 2.010616992139205,
    "evB": -2.377658169169049,
    "kelly": 0,
    "kellyA": 0.009904517202656171,
    "kellyB": 0,
    "fairLine": "-197",
    "fairLineA": "+197",
    "fairLineB": "-197",
    "oddsA": "+203",
    "oddsB": "-212",
    "v2pA": 0.4948204293544117,
    "v2pB": 0.5051795706455884,
    "projectedKO": 2,
    "projectedSUB": 8,
    "projectedDEC": 90,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-01T00:06:48.707Z",
      "targetEventDate": "2026-10-03",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-332",
          "retrievedAt": "2026-09-30",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.33666870294435386,
        "pB": 0.6633312970556462
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.09213006833608506,
          "avg_sig_str_pct_dif": -0.2644402898550713,
          "avg_td_dif": 0.5529730848861281,
          "avg_td_pct_dif": 0.10516698172652883,
          "atd_dif": 0.4222222222222216,
          "avg_sub_att_dif": 0.1858400621118011,
          "kd_dif": 0,
          "control_time_dif": 0.4722222222222222,
          "reach_dif": 0.09259259259259259,
          "height_dif": -0.32967032967032966,
          "age_dif": -3.255813953488372,
          "win_streak_dif": 0,
          "lose_streak_dif": 1,
          "win_dif": 2.5,
          "loss_dif": -4.0740740740740735,
          "total_round_dif": 3.411764705882353,
          "deep_round_dif": 1.0588235294117647,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 2.142857142857143,
          "elo_dif": 1.1088709677419355,
          "layoff_dif": -1.89,
          "cardio_dif": 0.2908333333333337,
          "peak_elo_dif": 1.6181818181818182,
          "ufc_fight_count_dif": 2.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.20220067427689037,
          "wins": 11,
          "losses": -11,
          "rounds": 58,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 3,
          "height": -3,
          "reach": 1,
          "younger": -14,
          "sig_str_landed": 1.455655079710144,
          "sig_str_accuracy": -0.02644402898550713,
          "sub_attempts": 0.13008804347826075,
          "td_landed": 0.7741623188405793,
          "td_accuracy": 0.02418840579710163,
          "elo": 0.55
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-06-14",
        "fighterB": "2026-06-27"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "b53f0632bcd139cf3326a5f44848922df15698e01d07376bab66b3f4aede3c49",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "7f302a649b71ed49c3ff94e0753a6646f6237c354767bacb846d8ec64b168ef3",
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
          "generatorVersion": "update_fighters.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "8064ad27f67db51b0273ae241e62fa88bb3d7226f70a3979ae0aebd2313dff5f",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-24",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "48524131c5d78b0adc80d83fe27a2ef7c365c124f66eddab11e17487f7df41d0",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-08-07T18:49:33Z",
          "maxObservedEventDate": "2026-08-04",
          "contentHash": "387363b7f1fda0f51757fd778ff969ce9fffe1d34d3c870437977db5e36003a3",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 50606889bc06a9c151be360bfe14e893a2a719ec",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
