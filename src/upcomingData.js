export const UPCOMING_ENTRIES = [
  {
    "id": "1790125089971-21tdl4",
    "createdAt": "2026-09-23T00:58:09.971Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Vanessa Demopoulos",
    "fighterB": "Yazmin Jauregui",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Strawweight",
    "boutContext": {
      "division": "Women's Strawweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.3145902373376534,
    "fighterBProb": 0.6854097626623465,
    "predictedWinner": "Yazmin Jauregui",
    "predictedProb": 0.6854097626623465,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.08987174159189333,
    "c6ProbB": 0.9101282584081066,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Yazmin Jauregui",
    "trackedProb": 0.9101282584081066,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-733",
    "edge": 0.03888090340166894,
    "edgeA": -0.03888090340166907,
    "edgeB": 0.03888090340166894,
    "ev": 3.42930958444105,
    "evA": -30.88863071583402,
    "evB": 3.42930958444105,
    "kelly": 0.25136839253952875,
    "kellyA": 0,
    "kellyB": 0.25136839253952875,
    "fairLine": "-1013",
    "fairLineA": "+1013",
    "fairLineB": "-1013",
    "oddsA": "669",
    "oddsB": "-733",
    "v2pA": 0.268435042414688,
    "v2pB": 0.731564957585312,
    "projectedKO": 16,
    "projectedSUB": 8,
    "projectedDEC": 76,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.971Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Strawweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.08987174159189333,
        "pB": 0.9101282584081066
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.21430144015101033,
          "avg_sig_str_pct_dif": -0.31230526315789486,
          "avg_td_dif": -0.06840705931495407,
          "avg_td_pct_dif": -0.0887363335875921,
          "atd_dif": -4.044444444444445,
          "avg_sub_att_dif": 0.1341687552213868,
          "kd_dif": -0.7999999999999999,
          "control_time_dif": 0.08888888888888889,
          "reach_dif": -0.4629629629629629,
          "height_dif": -0.10989010989010989,
          "age_dif": -2.558139534883721,
          "win_streak_dif": 0,
          "lose_streak_dif": -2,
          "win_dif": 0.45454545454545453,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 0.9411764705882353,
          "deep_round_dif": 0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.24193548387096772,
          "layoff_dif": 1.365,
          "cardio_dif": -0.5304166666666665,
          "peak_elo_dif": 0.23636363636363636,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.09181010225283182,
          "wins": 2,
          "losses": -3,
          "rounds": 16,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 1,
          "height": -1,
          "reach": -5,
          "younger": -11,
          "sig_str_landed": -3.385962754385963,
          "sig_str_accuracy": -0.031230526315789486,
          "sub_attempts": 0.09391812865497076,
          "td_landed": -0.0957698830409357,
          "td_accuracy": -0.020409356725146183,
          "elo": 0.12
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-06-14",
        "fighterB": "2024-09-14"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089970-gqvhx9",
    "createdAt": "2026-09-23T00:58:09.970Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Mickey Gall",
    "fighterB": "Sedriques Dumas",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5754594199991856,
    "fighterBProb": 0.4245405800008144,
    "predictedWinner": "Mickey Gall",
    "predictedProb": 0.5754594199991856,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6312486133264049,
    "c6ProbB": 0.3687513866735951,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Mickey Gall",
    "trackedProb": 0.6312486133264049,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-138",
    "edge": 0.05659800747159549,
    "edgeA": 0.05659800747159549,
    "edgeB": -0.05659800747159566,
    "ev": 8.867514472235058,
    "evA": 8.867514472235058,
    "evB": -14.080926905052344,
    "kelly": 0.12237169971684374,
    "kellyA": 0.12237169971684374,
    "kellyB": 0,
    "fairLine": "-171",
    "fairLineA": "-171",
    "fairLineB": "+171",
    "oddsA": "-138",
    "oddsB": "133",
    "v2pA": 0.6162888598444753,
    "v2pB": 0.38371114015552465,
    "projectedKO": 7,
    "projectedSUB": 25,
    "projectedDEC": 68,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.970Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6312486133264049,
        "pB": 0.3687513866735951
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.06998734177215192,
          "avg_sig_str_pct_dif": 0.44640000000000013,
          "avg_td_dif": 0.04285714285714274,
          "avg_td_pct_dif": 0.17391304347826078,
          "atd_dif": 0.26666666666666655,
          "avg_sub_att_dif": 2.2571428571428576,
          "kd_dif": 0,
          "control_time_dif": 0.3,
          "reach_dif": -0.4629629629629629,
          "height_dif": 0,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": 0,
          "lose_streak_dif": -2,
          "win_dif": 0.6818181818181818,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.47058823529411764,
          "deep_round_dif": 0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 3.5714285714285716,
          "elo_dif": 2.2983870967741935,
          "layoff_dif": -2.625,
          "cardio_dif": 0.4408333333333329,
          "peak_elo_dif": 2.2545454545454544,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.13612065045839272,
          "wins": 3,
          "losses": -2,
          "rounds": 8,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 5,
          "height": 0,
          "reach": -5,
          "younger": -3,
          "sig_str_landed": 1.1058000000000003,
          "sig_str_accuracy": 0.04464000000000001,
          "sub_attempts": 1.58,
          "td_landed": 0.05999999999999983,
          "td_accuracy": 0.03999999999999998,
          "elo": 1.14
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2024-11-16",
        "fighterB": "2026-04-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089970-1dvf9z",
    "createdAt": "2026-09-23T00:58:09.970Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "John Castaneda",
    "fighterB": "Alatengheili",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6597953001714914,
    "fighterBProb": 0.34020469982850865,
    "predictedWinner": "John Castaneda",
    "predictedProb": 0.6597953001714914,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7744604870120947,
    "c6ProbB": 0.2255395129879053,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "John Castaneda",
    "trackedProb": 0.7744604870120947,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-285",
    "edge": 0.04191446408746813,
    "edgeA": 0.04191446408746813,
    "edgeB": -0.04191446408746807,
    "ev": 4.620100877072442,
    "evA": 4.620100877072442,
    "evB": -16.550380194475025,
    "kelly": 0.1316728749965646,
    "kellyA": 0.1316728749965646,
    "kellyB": 0,
    "fairLine": "-343",
    "fairLineA": "-343",
    "fairLineB": "+343",
    "oddsA": "-285",
    "oddsB": "270",
    "v2pA": 0.6348768607471792,
    "v2pB": 0.3651231392528208,
    "projectedKO": 20,
    "projectedSUB": 9,
    "projectedDEC": 70,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.970Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7744604870120947,
        "pB": 0.2255395129879053
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.16181645569620254,
          "avg_sig_str_pct_dif": 1.9924000000000002,
          "avg_td_dif": -0.22857142857142862,
          "avg_td_pct_dif": -0.21739130434782603,
          "atd_dif": 1.0000000000000002,
          "avg_sub_att_dif": 0.18571428571428572,
          "kd_dif": 0.011999999999999997,
          "control_time_dif": -0.12222222222222229,
          "reach_dif": 0.4629629629629629,
          "height_dif": 0.10989010989010989,
          "age_dif": 0,
          "win_streak_dif": 0,
          "lose_streak_dif": 1,
          "win_dif": -0.22727272727272727,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": -0.058823529411764705,
          "deep_round_dif": -0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0.7142857142857143,
          "elo_dif": -0.5846774193548387,
          "layoff_dif": 1.785,
          "cardio_dif": -0.46916666666666684,
          "peak_elo_dif": -0.21818181818181817,
          "ufc_fight_count_dif": 0,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.014603498051100117,
          "wins": -1,
          "losses": -1,
          "rounds": -1,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 1,
          "height": 1,
          "reach": 5,
          "younger": 0,
          "sig_str_landed": 2.5567,
          "sig_str_accuracy": 0.19924000000000003,
          "sub_attempts": 0.13,
          "td_landed": -0.32000000000000006,
          "td_accuracy": -0.04999999999999999,
          "elo": -0.29
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-18",
        "fighterB": "2025-04-26"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089970-2kpu92",
    "createdAt": "2026-09-23T00:58:09.970Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Norma Dumont",
    "fighterB": "Ailin Perez",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Bantamweight",
    "boutContext": {
      "division": "Women's Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.315563558759481,
    "fighterBProb": 0.6844364412405191,
    "predictedWinner": "Ailin Perez",
    "predictedProb": 0.6844364412405191,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3577868720157649,
    "c6ProbB": 0.6422131279842351,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Ailin Perez",
    "trackedProb": 0.6422131279842351,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-138",
    "edge": 0.07395132774478363,
    "edgeA": -0.07395132774478363,
    "edgeB": 0.07395132774478363,
    "ev": 10.758495985686935,
    "evA": -18.782380052421367,
    "evB": 10.758495985686935,
    "kelly": 0.14846724460247965,
    "kellyA": 0,
    "kellyB": 0.14846724460247965,
    "fairLine": "-179",
    "fairLineA": "+179",
    "fairLineB": "-179",
    "oddsA": "127",
    "oddsB": "-138",
    "v2pA": 0.35337627730525145,
    "v2pB": 0.6466237226947485,
    "projectedKO": 2,
    "projectedSUB": 5,
    "projectedDEC": 94,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.970Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.3577868720157649,
        "pB": 0.6422131279842351
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.044335443037974674,
          "avg_sig_str_pct_dif": -0.6428000000000006,
          "avg_td_dif": -2.478571428571429,
          "avg_td_pct_dif": 0.2608695652173915,
          "atd_dif": -0.06666666666666674,
          "avg_sub_att_dif": -0.24285714285714288,
          "kd_dif": 0,
          "control_time_dif": -1.2166666666666666,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0.21978021978021978,
          "age_dif": -0.9302325581395349,
          "win_streak_dif": -4.285714285714286,
          "lose_streak_dif": -1,
          "win_dif": 0.6818181818181818,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 1.0588235294117647,
          "deep_round_dif": 0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": -0.7142857142857143,
          "elo_dif": 0.12096774193548386,
          "layoff_dif": 0.28,
          "cardio_dif": -0.3574999999999995,
          "peak_elo_dif": 0.41818181818181815,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0.4752535457646565
        },
        "v2": {
          "modern_form": -0.1795005265799422,
          "wins": 3,
          "losses": -2,
          "rounds": 18,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": -1,
          "height": 2,
          "reach": 1,
          "younger": -4,
          "sig_str_landed": 0.7004999999999999,
          "sig_str_accuracy": -0.06428000000000006,
          "sub_attempts": -0.17,
          "td_landed": -3.4700000000000006,
          "td_accuracy": 0.06000000000000005,
          "elo": 0.06
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-25",
        "fighterB": "2026-02-28"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089969-z3mnbq",
    "createdAt": "2026-09-23T00:58:09.969Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Montel Jackson",
    "fighterB": "Ricky Simon",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5424763779266594,
    "fighterBProb": 0.45752362207334063,
    "predictedWinner": "Montel Jackson",
    "predictedProb": 0.5424763779266594,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6516807104096183,
    "c6ProbB": 0.3483192895903817,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Montel Jackson",
    "trackedProb": 0.6516807104096183,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-186",
    "edge": 0.007809614130293796,
    "edgeA": 0.007809614130293796,
    "edgeB": -0.0078096141302936295,
    "ev": 0.20466837481227174,
    "evA": 0.20466837481227174,
    "evB": -3.167237493873884,
    "kelly": 0.003806831771508267,
    "kellyA": 0.003806831771508267,
    "kellyB": 0,
    "fairLine": "-187",
    "fairLineA": "-187",
    "fairLineB": "+187",
    "oddsA": "-186",
    "oddsB": "178",
    "v2pA": 0.5362349757103378,
    "v2pB": 0.46376502428966215,
    "projectedKO": 26,
    "projectedSUB": 15,
    "projectedDEC": 59,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.969Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6516807104096183,
        "pB": 0.3483192895903817
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.03329113924050634,
          "avg_sig_str_pct_dif": 0.8976000000000001,
          "avg_td_dif": -0.8571428571428573,
          "avg_td_pct_dif": 1.0434782608695652,
          "atd_dif": -0.5999999999999999,
          "avg_sub_att_dif": 0.05714285714285712,
          "kd_dif": 0.42800000000000005,
          "control_time_dif": 0.005555555555555437,
          "reach_dif": 0.5555555555555555,
          "height_dif": 0.43956043956043955,
          "age_dif": 0,
          "win_streak_dif": 0,
          "lose_streak_dif": -2,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.8823529411764706,
          "deep_round_dif": -0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": -1.4285714285714286,
          "elo_dif": 0.7661290322580645,
          "layoff_dif": 0.14,
          "cardio_dif": 0.07624999999999993,
          "peak_elo_dif": 0.5454545454545454,
          "ufc_fight_count_dif": -0.375,
          "rank_tier_dif": 1.8195734938548842
        },
        "v2": {
          "modern_form": 0.10932713092988827,
          "wins": -1,
          "losses": 2,
          "rounds": -15,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": -2,
          "height": 4,
          "reach": 6,
          "younger": 0,
          "sig_str_landed": -0.5260000000000002,
          "sig_str_accuracy": 0.08976,
          "sub_attempts": 0.03999999999999998,
          "td_landed": -1.2000000000000002,
          "td_accuracy": 0.24,
          "elo": 0.38
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-25",
        "fighterB": "2026-03-28"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089969-gk5m2r",
    "createdAt": "2026-09-23T00:58:09.969Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Elves Brener",
    "fighterB": "Josiah Harrell",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5217266469786092,
    "fighterBProb": 0.47827335302139085,
    "predictedWinner": "Elves Brener",
    "predictedProb": 0.5217266469786092,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5003326086072504,
    "c6ProbB": 0.4996673913927496,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Elves Brener",
    "trackedProb": 0.5003326086072504,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "117",
    "edge": 0.048672209474756645,
    "edgeA": 0.048672209474756645,
    "edgeB": -0.04867220947475681,
    "ev": 8.572176067773327,
    "evA": 8.572176067773327,
    "evB": -10.68937177468176,
    "kelly": 0.07326646211772077,
    "kellyA": 0.07326646211772077,
    "kellyB": 0,
    "fairLine": "-100",
    "fairLineA": "-100",
    "fairLineB": "+100",
    "oddsA": "117",
    "oddsB": "-127",
    "v2pA": 0.581541781995513,
    "v2pB": 0.418458218004487,
    "projectedKO": 27,
    "projectedSUB": 4,
    "projectedDEC": 69,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.969Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5003326086072504,
        "pB": 0.4996673913927496
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.03634914634566969,
          "avg_sig_str_pct_dif": 0.19099056130790493,
          "avg_td_dif": -0.3196328013494229,
          "avg_td_pct_dif": -0.6257631402282507,
          "atd_dif": 1.333333333333334,
          "avg_sub_att_dif": -0.6949682107175292,
          "kd_dif": 1,
          "control_time_dif": 0.17777777777777778,
          "reach_dif": 0.37037037037037035,
          "height_dif": 0.32967032967032966,
          "age_dif": -0.23255813953488372,
          "win_streak_dif": 0,
          "lose_streak_dif": -2,
          "win_dif": 0.6818181818181818,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.8823529411764706,
          "deep_round_dif": 0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0,
          "elo_dif": 1.2298387096774193,
          "layoff_dif": -1.015,
          "cardio_dif": 0.06416666666666701,
          "peak_elo_dif": 1.8545454545454545,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.3208994708994709,
          "wins": 3,
          "losses": -2,
          "rounds": 15,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 0,
          "height": 3,
          "reach": 4,
          "younger": -1,
          "sig_str_landed": 0.5743165122615812,
          "sig_str_accuracy": 0.019099056130790493,
          "sub_attempts": -0.4864777475022704,
          "td_landed": -0.447485921889192,
          "td_accuracy": -0.1439255222524977,
          "elo": 0.61
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-08-02",
        "fighterB": "2026-02-21"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089969-qenvoj",
    "createdAt": "2026-09-23T00:58:09.969Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Rodolfo Bellato",
    "fighterB": "Christian Edwards",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Light Heavyweight",
    "boutContext": {
      "division": "Light Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.7376211218314105,
    "fighterBProb": 0.2623788781685895,
    "predictedWinner": "Rodolfo Bellato",
    "predictedProb": 0.7376211218314105,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6919817643754401,
    "c6ProbB": 0.3080182356245599,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Rodolfo Bellato",
    "trackedProb": 0.6919817643754401,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-170",
    "edge": 0.0684982892673659,
    "edgeA": 0.0684982892673659,
    "edgeB": -0.0684982892673659,
    "ev": 9.902986106687557,
    "evA": 9.902986106687557,
    "evB": -18.991204030740754,
    "kelly": 0.1683507638136884,
    "kellyA": 0.1683507638136884,
    "kellyB": 0,
    "fairLine": "-225",
    "fairLineA": "-225",
    "fairLineB": "+225",
    "oddsA": "-170",
    "oddsB": "163",
    "v2pA": 0.6517793990549928,
    "v2pB": 0.3482206009450072,
    "projectedKO": 41,
    "projectedSUB": 6,
    "projectedDEC": 54,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.969Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Light Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6919817643754401,
        "pB": 0.3080182356245599
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.10397182257898535,
          "avg_sig_str_pct_dif": 0.8171880000000015,
          "avg_td_dif": 0.32596980255516844,
          "avg_td_pct_dif": 0.5173736302580416,
          "atd_dif": 1.5111111111111113,
          "avg_sub_att_dif": -0.3019918699186992,
          "kd_dif": 1.5999999999999999,
          "control_time_dif": 0.4722222222222222,
          "reach_dif": -0.27777777777777773,
          "height_dif": -0.21978021978021978,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 1,
          "win_dif": 0.45454545454545453,
          "loss_dif": 0,
          "total_round_dif": 0.4117647058823529,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0,
          "elo_dif": 1.6330645161290323,
          "layoff_dif": -0.35,
          "cardio_dif": 1.272083333333333,
          "peak_elo_dif": 1.1090909090909091,
          "ufc_fight_count_dif": 0.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.5103548153511949,
          "wins": 2,
          "losses": 0,
          "rounds": 7,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 0,
          "height": -2,
          "reach": -3,
          "younger": -3,
          "sig_str_landed": 1.6427547967479685,
          "sig_str_accuracy": 0.08171880000000015,
          "sub_attempts": -0.21139430894308944,
          "td_landed": 0.4563577235772358,
          "td_accuracy": 0.11899593495934957,
          "elo": 0.81
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-07",
        "fighterB": "2026-05-16"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089968-iqmquz",
    "createdAt": "2026-09-23T00:58:09.968Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Brady Hiestand",
    "fighterB": "Rinya Nakamura",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.4942646862788532,
    "fighterBProb": 0.5057353137211468,
    "predictedWinner": "Rinya Nakamura",
    "predictedProb": 0.5057353137211468,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.2922439139261134,
    "c6ProbB": 0.7077560860738866,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Rinya Nakamura",
    "trackedProb": 0.7077560860738866,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-335",
    "edge": -0.05479201840494741,
    "edgeA": 0.05479201840494738,
    "edgeB": -0.05479201840494741,
    "ev": -8.097344047122188,
    "evA": 21.865712107189267,
    "evB": -8.097344047122188,
    "kelly": 0,
    "kellyA": 0.0689770098018589,
    "kellyB": 0,
    "fairLine": "-242",
    "fairLineA": "+242",
    "fairLineB": "-242",
    "oddsA": "317",
    "oddsB": "-335",
    "v2pA": 0.5870200613219965,
    "v2pB": 0.41297993867800353,
    "projectedKO": 39,
    "projectedSUB": 18,
    "projectedDEC": 43,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.968Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.2922439139261134,
        "pB": 0.7077560860738866
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.005060772088922494,
          "avg_sig_str_pct_dif": -0.016084577114427456,
          "avg_td_dif": 1.4922476901208246,
          "avg_td_pct_dif": -1.3021652606532554,
          "atd_dif": -2.9155555555555557,
          "avg_sub_att_dif": -0.1813503909026296,
          "kd_dif": -0.788,
          "control_time_dif": 0.3055555555555556,
          "reach_dif": 0.27777777777777773,
          "height_dif": 0.10989010989010989,
          "age_dif": 0.9302325581395349,
          "win_streak_dif": 1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0,
          "total_round_dif": 0.058823529411764705,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0.7142857142857143,
          "elo_dif": -0.42338709677419356,
          "layoff_dif": -2.065,
          "cardio_dif": 0.30875000000000025,
          "peak_elo_dif": -0.38181818181818183,
          "ufc_fight_count_dif": -0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.013367856834208491,
          "wins": -1,
          "losses": 0,
          "rounds": 1,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 1,
          "height": 1,
          "reach": 3,
          "younger": 4,
          "sig_str_landed": -0.07996019900497542,
          "sig_str_accuracy": -0.0016084577114427456,
          "sub_attempts": -0.12694527363184072,
          "td_landed": 2.0891467661691543,
          "td_accuracy": -0.2994980099502488,
          "elo": -0.21
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2024-06-15",
        "fighterB": "2025-08-02"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089968-ej94f3",
    "createdAt": "2026-09-23T00:58:09.968Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Rodolfo Vieira",
    "fighterB": "Robert Bryczek",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.598204896633309,
    "fighterBProb": 0.401795103366691,
    "predictedWinner": "Rodolfo Vieira",
    "predictedProb": 0.598204896633309,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6470530517663348,
    "c6ProbB": 0.35294694823366524,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Rodolfo Vieira",
    "trackedProb": 0.6470530517663348,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-144",
    "edge": 0.06292433619502313,
    "edgeA": 0.06292433619502313,
    "edgeB": -0.06292433619502302,
    "ev": 9.63954488262894,
    "evA": 9.63954488262894,
    "evB": -15.998626320387672,
    "kelly": 0.13880944630985678,
    "kellyA": 0.13880944630985678,
    "kellyB": 0,
    "fairLine": "-183",
    "fairLineA": "-183",
    "fairLineB": "+183",
    "oddsA": "-144",
    "oddsB": "138",
    "v2pA": 0.6302576367252645,
    "v2pB": 0.36974236327473553,
    "projectedKO": 46,
    "projectedSUB": 30,
    "projectedDEC": 24,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.968Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6470530517663348,
        "pB": 0.35294694823366524
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.000776673918275022,
          "avg_sig_str_pct_dif": 1.0903433612167295,
          "avg_td_dif": 1.472353829440522,
          "avg_td_pct_dif": -2.3027872375599276,
          "atd_dif": -1.0000000000000002,
          "avg_sub_att_dif": 0.7038626833242804,
          "kd_dif": -0.888,
          "control_time_dif": 0.45000000000000007,
          "reach_dif": -0.18518518518518517,
          "height_dif": 0,
          "age_dif": -0.23255813953488372,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": 1.1363636363636362,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 1,
          "deep_round_dif": 0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 3.5714285714285716,
          "elo_dif": 0.9879032258064516,
          "layoff_dif": -0.035,
          "cardio_dif": 1.7216666666666667,
          "peak_elo_dif": 1.6,
          "ufc_fight_count_dif": 1,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.042812750041867464,
          "wins": 5,
          "losses": -3,
          "rounds": 17,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 5,
          "height": 0,
          "reach": -2,
          "younger": -1,
          "sig_str_landed": 0.012271447908745348,
          "sig_str_accuracy": 0.10903433612167296,
          "sub_attempts": 0.49270387832699625,
          "td_landed": 2.0612953612167306,
          "td_accuracy": -0.5296410646387834,
          "elo": 0.49
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-25",
        "fighterB": "2026-05-02"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1790125089967-am6vba",
    "createdAt": "2026-09-23T00:58:09.967Z",
    "eventName": "UFC Fight Night: Rosas Jr. vs. Barcelos",
    "eventDate": "2026-09-26",
    "fighterA": "Raul Rosas Jr.",
    "fighterB": "Raoni Barcelos",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
        "retrievedAt": "2026-09-22",
        "authority": "official"
      }
    },
    "fighterAProb": 0.4929881457067656,
    "fighterBProb": 0.5070118542932345,
    "predictedWinner": "Raoni Barcelos",
    "predictedProb": 0.5070118542932345,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7199243306968953,
    "c6ProbB": 0.2800756693031047,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Raul Rosas Jr.",
    "trackedProb": 0.7199243306968953,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "betRecommendedFighter": "Raul Rosas Jr.",
    "betRecommendedOdds": "-170",
    "marketOdds": "-170",
    "edge": 0.0964408555888211,
    "edgeA": 0.0964408555888211,
    "edgeB": -0.0964408555888211,
    "ev": 14.340923110683384,
    "evA": 14.340923110683384,
    "evB": -26.340098973283467,
    "kelly": 0.24379569288161748,
    "kellyA": 0.24379569288161748,
    "kellyB": 0,
    "fairLine": "-257",
    "fairLineA": "-257",
    "fairLineB": "+257",
    "oddsA": "-170",
    "oddsB": "163",
    "v2pA": 0.7052725107842525,
    "v2pB": 0.29472748921574754,
    "projectedKO": 20,
    "projectedSUB": 19,
    "projectedDEC": 62,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-23T00:58:09.967Z",
      "targetEventDate": "2026-09-26",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-26-2026",
          "retrievedAt": "2026-09-22",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7199243306968953,
        "pB": 0.2800756693031047
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.20949367088607598,
          "avg_sig_str_pct_dif": -1.1000000000000003,
          "avg_td_dif": 3.035714285714286,
          "avg_td_pct_dif": 0.9565217391304348,
          "atd_dif": -4.133333333333334,
          "avg_sub_att_dif": 0.24285714285714277,
          "kd_dif": 0.10800000000000004,
          "control_time_dif": 1.966666666666667,
          "reach_dif": 0,
          "height_dif": 0.21978021978021978,
          "age_dif": 4.186046511627907,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -1.1363636363636362,
          "loss_dif": 1.111111111111111,
          "total_round_dif": -1.4705882352941178,
          "deep_round_dif": -0.47058823529411764,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": 0.04032258064516129,
          "layoff_dif": -0.245,
          "cardio_dif": -1.6695833333333332,
          "peak_elo_dif": -0.01818181818181818,
          "ufc_fight_count_dif": -1,
          "rank_tier_dif": 1.90625136547763
        },
        "v2": {
          "modern_form": 0.04705498603977254,
          "wins": -5,
          "losses": 3,
          "rounds": -25,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": 2,
          "reach": 0,
          "younger": 18,
          "sig_str_landed": -3.3100000000000005,
          "sig_str_accuracy": -0.11000000000000004,
          "sub_attempts": 0.16999999999999993,
          "td_landed": 4.25,
          "td_accuracy": 0.22000000000000003,
          "elo": 0.02
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-07",
        "fighterB": "2026-04-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "f45611e40b82a6a14c3c9c4f00dba09bf9ef2461e83a89d4df29322014e7efe6",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "57896701a8ed2c420666a0faab61a7f3c11372859bb040cd6797bdd759ca7ad1",
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
          "generatorVersion": "update_fighters.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-09-19",
          "contentHash": "30cdd54e9936c4c50750a06a799d8914306ead1a3ca446e5a2cecef3d582a444",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (789 rows); maximum event date found = 2026-09-19. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-18",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
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
          "generatorVersion": "scripts/update_rankings.py @ 816811d0015cf4adfa641f10cf58ee8609f715d3",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
