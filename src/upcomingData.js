export const UPCOMING_ENTRIES = [
  {
    "id": "1787667170132-98mcer",
    "createdAt": "2026-08-25T14:12:50.132Z",
    "eventName": "UFC Fight Night Shanghai",
    "eventDate": "2026-08-29",
    "fighterA": "Umar Nurmagomedov",
    "fighterB": "Song Yadong",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 5,
      "provenance": null
    },
    "fighterAProb": 0.5731924495838231,
    "fighterBProb": 0.4268075504161769,
    "predictedWinner": "Umar Nurmagomedov",
    "predictedProb": 0.5731924495838231,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.8159816672249216,
    "c6ProbB": 0.1840183327750784,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Umar Nurmagomedov",
    "trackedProb": 0.8159816672249216,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-500",
    "edge": 0.017662339493829116,
    "edgeA": 0.017662339493829116,
    "edgeB": -0.01766233949382917,
    "ev": -2.082199933009413,
    "evA": -2.082199933009413,
    "evB": -12.591291931837773,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-443",
    "fairLineA": "-443",
    "fairLineB": "+443",
    "oddsA": "-500",
    "oddsB": "+375",
    "v2pA": 0.5985323711213446,
    "v2pB": 0.4014676288786554,
    "projectedKO": 26,
    "projectedSUB": 15,
    "projectedDEC": 59,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-25T14:12:50.132Z",
      "targetEventDate": "2026-08-29",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 5,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.8159816672249216,
        "pB": 0.1840183327750784
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.030379746835443037,
          "avg_sig_str_pct_dif": 1.2000000000000004,
          "avg_td_dif": 2.3000000000000003,
          "avg_td_pct_dif": 0.2608695652173913,
          "atd_dif": 0.40000000000000036,
          "avg_sub_att_dif": 0.05714285714285712,
          "kd_dif": -0.5439999999999999,
          "control_time_dif": 1.1444444444444446,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": -0.9090909090909091,
          "loss_dif": 1.111111111111111,
          "total_round_dif": -1.2352941176470589,
          "deep_round_dif": -0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": -2,
          "sub_dif": 0,
          "elo_dif": -0.1411290322580645,
          "layoff_dif": -0.63,
          "cardio_dif": -0.41833333333333356,
          "peak_elo_dif": -0.12727272727272726,
          "ufc_fight_count_dif": -0.875,
          "rank_tier_dif": 0.37663147591406965
        },
        "v2": {
          "modern_form": 0.17959389582545082,
          "wins": -4,
          "losses": 3,
          "rounds": -21,
          "title_bouts": 0,
          "ko_wins": -4,
          "sub_wins": 0,
          "height": 0,
          "reach": 2,
          "younger": -2,
          "sig_str_landed": -0.48,
          "sig_str_accuracy": 0.12000000000000005,
          "sub_attempts": 0.03999999999999998,
          "td_landed": 3.22,
          "td_accuracy": 0.06,
          "elo": -0.07
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-01-24",
        "fighterB": "2026-05-30"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "c1eb456588f2faced59cef29aa36237aa923af24ef6163e4d6e0a7cc943946f4",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "cdb059f2e6ed1363ff12c840db420847e33497818f20b91a72fe71f2e588d0a2",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "efa1ba14a0b79ea684fd095672bf6528518b9a026467d83e973fd602eb83a382",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1787667134251-th9rxt",
    "createdAt": "2026-08-25T14:12:14.251Z",
    "eventName": "UFC Fight Night Shanghai",
    "eventDate": "2026-08-29",
    "fighterA": "Yan Xiaonan",
    "fighterB": "Denise Gomes",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Strawweight",
    "boutContext": {
      "division": "Women's Strawweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.3258276154817579,
    "fighterBProb": 0.6741723845182421,
    "predictedWinner": "Denise Gomes",
    "predictedProb": 0.6741723845182421,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.45525338975949015,
    "c6ProbB": 0.5447466102405099,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Denise Gomes",
    "trackedProb": 0.5447466102405099,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "+130",
    "edge": 0.12773925128711655,
    "edgeA": -0.1277392512871165,
    "edgeB": 0.12773925128711655,
    "ev": 25.291720355317267,
    "evA": -25.103474587954857,
    "evB": 25.291720355317267,
    "kelly": 0.19455169504090203,
    "kellyA": 0,
    "kellyB": 0.19455169504090203,
    "fairLine": "-120",
    "fairLineA": "+120",
    "fairLineB": "-120",
    "oddsA": "-155",
    "oddsB": "+130",
    "v2pA": 0.2907640365464278,
    "v2pB": 0.7092359634535722,
    "projectedKO": 26,
    "projectedSUB": 5,
    "projectedDEC": 69,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-25T14:12:14.251Z",
      "targetEventDate": "2026-08-29",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Strawweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.45525338975949015,
        "pB": 0.5447466102405099
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.021626582278481032,
          "avg_sig_str_pct_dif": -0.726,
          "avg_td_dif": -0.6071428571428572,
          "avg_td_pct_dif": 1.6956521739130432,
          "atd_dif": -0.13333333333333347,
          "avg_sub_att_dif": -1.2142857142857144,
          "kd_dif": -0.9999999999999999,
          "control_time_dif": -0.1888888888888889,
          "reach_dif": 0,
          "height_dif": 0.32967032967032966,
          "age_dif": -2.558139534883721,
          "win_streak_dif": -2.857142857142857,
          "lose_streak_dif": -1,
          "win_dif": 0.6818181818181818,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 1.1764705882352942,
          "deep_round_dif": 0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 0,
          "elo_dif": -0.12096774193548386,
          "layoff_dif": -1.05,
          "cardio_dif": 1.644583333333333,
          "peak_elo_dif": 0.14545454545454545,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0.8529757580943365
        },
        "v2": {
          "modern_form": -0.37462844021175745,
          "wins": 3,
          "losses": -2,
          "rounds": 20,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 0,
          "height": 3,
          "reach": 0,
          "younger": -11,
          "sig_str_landed": 0.34170000000000034,
          "sig_str_accuracy": -0.0726,
          "sub_attempts": -0.85,
          "td_landed": -0.85,
          "td_accuracy": 0.38999999999999996,
          "elo": -0.06
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-04-12",
        "fighterB": "2025-11-08"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "c1eb456588f2faced59cef29aa36237aa923af24ef6163e4d6e0a7cc943946f4",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "cdb059f2e6ed1363ff12c840db420847e33497818f20b91a72fe71f2e588d0a2",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "efa1ba14a0b79ea684fd095672bf6528518b9a026467d83e973fd602eb83a382",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1787667091537-zp1qoi",
    "createdAt": "2026-08-25T14:11:31.537Z",
    "eventName": "UFC Fight Night Shanghai",
    "eventDate": "2026-08-29",
    "fighterA": "Aoriqileng",
    "fighterB": "Kai Asakura",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.5302174912300772,
    "fighterBProb": 0.4697825087699228,
    "predictedWinner": "Aoriqileng",
    "predictedProb": 0.5302174912300772,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.25679277417615326,
    "c6ProbB": 0.7432072258238467,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Kai Asakura",
    "trackedProb": 0.7432072258238467,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-450",
    "edge": -0.04320054116644456,
    "edgeA": 0.043200541166444534,
    "edgeB": -0.04320054116644456,
    "ev": -9.163561288196508,
    "evA": 15.556748379268981,
    "evB": -9.163561288196508,
    "kelly": 0,
    "kellyA": 0.04444785251219706,
    "kellyB": 0,
    "fairLine": "-289",
    "fairLineA": "+289",
    "fairLineB": "-289",
    "oddsA": "+350",
    "oddsB": "-450",
    "v2pA": 0.5638694679787072,
    "v2pB": 0.4361305320212928,
    "projectedKO": 60,
    "projectedSUB": 9,
    "projectedDEC": 31,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-25T14:11:31.537Z",
      "targetEventDate": "2026-08-29",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.25679277417615326,
        "pB": 0.7432072258238467
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.06597950572634106,
          "avg_sig_str_pct_dif": 0.9002005012531322,
          "avg_td_dif": 0.06331901181525236,
          "avg_td_pct_dif": 1.074294431731502,
          "atd_dif": 0,
          "avg_sub_att_dif": -0.3039742212674542,
          "kd_dif": -0.872,
          "control_time_dif": 0.41111111111111115,
          "reach_dif": 0,
          "height_dif": -0.10989010989010989,
          "age_dif": -0.23255813953488372,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": -1,
          "win_dif": 0.6818181818181818,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 1,
          "deep_round_dif": 0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": -0.2217741935483871,
          "layoff_dif": 0,
          "cardio_dif": 1.4229166666666664,
          "peak_elo_dif": 0.38181818181818183,
          "ufc_fight_count_dif": 0.75,
          "rank_tier_dif": -1.736044097509195
        },
        "v2": {
          "modern_form": -0.009242914593998786,
          "wins": 3,
          "losses": -3,
          "rounds": 17,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": -1,
          "reach": 0,
          "younger": -1,
          "sig_str_landed": 1.0424761904761888,
          "sig_str_accuracy": 0.09002005012531322,
          "sub_attempts": -0.21278195488721793,
          "td_landed": 0.0886466165413533,
          "td_accuracy": 0.24708771929824544,
          "elo": -0.11
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-30",
        "fighterB": "2026-05-30"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "c1eb456588f2faced59cef29aa36237aa923af24ef6163e4d6e0a7cc943946f4",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "cdb059f2e6ed1363ff12c840db420847e33497818f20b91a72fe71f2e588d0a2",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "efa1ba14a0b79ea684fd095672bf6528518b9a026467d83e973fd602eb83a382",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1787667001038-dqfphx",
    "createdAt": "2026-08-25T14:10:01.038Z",
    "eventName": "UFC Fight Night Shanghai",
    "eventDate": "2026-08-29",
    "fighterA": "Alex Perez",
    "fighterB": "Sumudaerji",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.5754197888076221,
    "fighterBProb": 0.4245802111923779,
    "predictedWinner": "Alex Perez",
    "predictedProb": 0.5754197888076221,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3331415861379704,
    "c6ProbB": 0.6668584138620296,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Sumudaerji",
    "trackedProb": 0.6668584138620296,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-225",
    "edge": 0.003210289670567801,
    "edgeA": -0.0032102896705677453,
    "edgeB": 0.003210289670567801,
    "ev": -3.6760068865957294,
    "evA": -5.054647950678444,
    "evB": -3.6760068865957294,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-200",
    "fairLineA": "+200",
    "fairLineB": "-200",
    "oddsA": "+185",
    "oddsB": "-225",
    "v2pA": 0.4697201430517902,
    "v2pB": 0.5302798569482098,
    "projectedKO": 30,
    "projectedSUB": 13,
    "projectedDEC": 57,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-25T14:10:01.039Z",
      "targetEventDate": "2026-08-29",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.3331415861379704,
        "pB": 0.6668584138620296
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.012025316455696227,
          "avg_sig_str_pct_dif": -0.3999999999999998,
          "avg_td_dif": 0.9785714285714285,
          "avg_td_pct_dif": 0.30434782608695654,
          "atd_dif": 1.0000000000000002,
          "avg_sub_att_dif": 0.28571428571428564,
          "kd_dif": 0.8760000000000001,
          "control_time_dif": 0.5166666666666667,
          "reach_dif": -0.6481481481481481,
          "height_dif": -0.21978021978021978,
          "age_dif": -0.9302325581395349,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0.45454545454545453,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.058823529411764705,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": 1.5,
          "sub_dif": 1.4285714285714286,
          "elo_dif": 1.471774193548387,
          "layoff_dif": 0,
          "cardio_dif": -3.702916666666667,
          "peak_elo_dif": 1.8727272727272728,
          "ufc_fight_count_dif": 0.5,
          "rank_tier_dif": 2.1863851222592006
        },
        "v2": {
          "modern_form": -0.24095495699778108,
          "wins": 2,
          "losses": -2,
          "rounds": 1,
          "title_bouts": 0,
          "ko_wins": 3,
          "sub_wins": 2,
          "height": -2,
          "reach": -7,
          "younger": -4,
          "sig_str_landed": -0.1900000000000004,
          "sig_str_accuracy": -0.03999999999999998,
          "sub_attempts": 0.19999999999999996,
          "td_landed": 1.3699999999999999,
          "td_accuracy": 0.07,
          "elo": 0.73
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-30",
        "fighterB": "2026-05-30"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "c1eb456588f2faced59cef29aa36237aa923af24ef6163e4d6e0a7cc943946f4",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "cdb059f2e6ed1363ff12c840db420847e33497818f20b91a72fe71f2e588d0a2",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "efa1ba14a0b79ea684fd095672bf6528518b9a026467d83e973fd602eb83a382",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1787666883764-9cj36y",
    "createdAt": "2026-08-25T14:08:03.764Z",
    "eventName": "UFC Fight Night Shanghai",
    "eventDate": "2026-08-29",
    "fighterA": "Rei Tsuruya",
    "fighterB": "Kevin Borjas",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.6596716355718085,
    "fighterBProb": 0.3403283644281915,
    "predictedWinner": "Rei Tsuruya",
    "predictedProb": 0.6596716355718085,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.8718953491221186,
    "c6ProbB": 0.12810465087788137,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Rei Tsuruya",
    "trackedProb": 0.8718953491221186,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-600",
    "edge": 0.04689534912211857,
    "edgeA": 0.04689534912211857,
    "edgeB": -0.04689534912211865,
    "ev": 1.7211240642471815,
    "evA": 1.7211240642471815,
    "evB": -29.542442017165257,
    "kelly": 0.10326744385483085,
    "kellyA": 0.10326744385483085,
    "kellyB": 0,
    "fairLine": "-681",
    "fairLineA": "-681",
    "fairLineB": "+681",
    "oddsA": "-600",
    "oddsB": "+450",
    "v2pA": 0.7081682453900219,
    "v2pB": 0.2918317546099781,
    "projectedKO": 5,
    "projectedSUB": 14,
    "projectedDEC": 82,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-25T14:08:03.765Z",
      "targetEventDate": "2026-08-29",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.8718953491221186,
        "pB": 0.12810465087788137
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.03476303677768806,
          "avg_sig_str_pct_dif": 0.1893144208037817,
          "avg_td_dif": 1.7934527524484971,
          "avg_td_pct_dif": 1.2543241854250178,
          "atd_dif": -0.9777777777777774,
          "avg_sub_att_dif": 0.7298817966903074,
          "kd_dif": 0,
          "control_time_dif": 0.8777777777777778,
          "reach_dif": 0,
          "height_dif": 0.10989010989010989,
          "age_dif": 0.9302325581395349,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 1.111111111111111,
          "total_round_dif": -0.5294117647058824,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 2.0161290322580645,
          "layoff_dif": -0.105,
          "cardio_dif": -2.6149999999999998,
          "peak_elo_dif": 0.7272727272727273,
          "ufc_fight_count_dif": -0.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.2098360655737705,
          "wins": 0,
          "losses": 3,
          "rounds": -9,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 1,
          "height": 1,
          "reach": 0,
          "younger": 4,
          "sig_str_landed": -0.5492559810874713,
          "sig_str_accuracy": 0.01893144208037817,
          "sub_attempts": 0.5109172576832152,
          "td_landed": 2.510833853427896,
          "td_accuracy": 0.2884945626477541,
          "elo": 1
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-30",
        "fighterB": "2026-06-20"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "c1eb456588f2faced59cef29aa36237aa923af24ef6163e4d6e0a7cc943946f4",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "cdb059f2e6ed1363ff12c840db420847e33497818f20b91a72fe71f2e588d0a2",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "efa1ba14a0b79ea684fd095672bf6528518b9a026467d83e973fd602eb83a382",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1787666847181-pd2xm6",
    "createdAt": "2026-08-25T14:07:27.181Z",
    "eventName": "UFC Fight Night Shanghai",
    "eventDate": "2026-08-29",
    "fighterA": "Jack Jenkins",
    "fighterB": "Sean Woodson",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.471476897222759,
    "fighterBProb": 0.528523102777241,
    "predictedWinner": "Sean Woodson",
    "predictedProb": 0.528523102777241,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4295045193368737,
    "c6ProbB": 0.5704954806631263,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Sean Woodson",
    "trackedProb": 0.5704954806631263,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-145",
    "edge": 0.004892643783693695,
    "edgeA": -0.00489264378369364,
    "edgeB": 0.004892643783693695,
    "ev": -3.605936025885562,
    "evA": -5.5090057458877695,
    "evB": -3.605936025885562,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-133",
    "fairLineA": "+133",
    "fairLineB": "-133",
    "oddsA": "+120",
    "oddsB": "-145",
    "v2pA": 0.4816944588087376,
    "v2pB": 0.5183055411912624,
    "projectedKO": 22,
    "projectedSUB": 4,
    "projectedDEC": 73,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-25T14:07:27.182Z",
      "targetEventDate": "2026-08-29",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4295045193368737,
        "pB": 0.5704954806631263
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.0500759493670886,
          "avg_sig_str_pct_dif": 1.4316,
          "avg_td_dif": 0.6857142857142858,
          "avg_td_pct_dif": 0.04347826086956477,
          "atd_dif": -0.8666666666666667,
          "avg_sub_att_dif": -0.22857142857142856,
          "kd_dif": -0.14400000000000002,
          "control_time_dif": 0.3611111111111111,
          "reach_dif": -0.9259259259259258,
          "height_dif": -0.7692307692307693,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 1,
          "win_dif": -0.6818181818181818,
          "loss_dif": 0,
          "total_round_dif": -0.5294117647058824,
          "deep_round_dif": -0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": -1.9354838709677418,
          "layoff_dif": 0.84,
          "cardio_dif": -1.44125,
          "peak_elo_dif": -1.7272727272727273,
          "ufc_fight_count_dif": -0.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.03918884329143052,
          "wins": -3,
          "losses": 0,
          "rounds": -9,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": -7,
          "reach": -10,
          "younger": 2,
          "sig_str_landed": -0.7911999999999999,
          "sig_str_accuracy": 0.14316,
          "sub_attempts": -0.15999999999999998,
          "td_landed": 0.9600000000000001,
          "td_accuracy": 0.009999999999999898,
          "elo": -0.96
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-09-27",
        "fighterB": "2025-04-12"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "c1eb456588f2faced59cef29aa36237aa923af24ef6163e4d6e0a7cc943946f4",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "cdb059f2e6ed1363ff12c840db420847e33497818f20b91a72fe71f2e588d0a2",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "efa1ba14a0b79ea684fd095672bf6528518b9a026467d83e973fd602eb83a382",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1787666819170-tlx6d2",
    "createdAt": "2026-08-25T14:06:59.170Z",
    "eventName": "UFC Fight Night Shanghai",
    "eventDate": "2026-08-29",
    "fighterA": "Xiong Jingnan",
    "fighterB": "Julia Polastri",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Strawweight",
    "boutContext": {
      "division": "Women's Strawweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.2604889086510812,
    "fighterBProb": 0.7395110913489188,
    "predictedWinner": "Julia Polastri",
    "predictedProb": 0.7395110913489188,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.29501365456862266,
    "c6ProbB": 0.7049863454313774,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Julia Polastri",
    "trackedProb": 0.7049863454313774,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-240",
    "edge": 0.029413826347407968,
    "edgeA": -0.0294138263474078,
    "edgeB": 0.029413826347407968,
    "ev": -0.12693439722152888,
    "evA": -12.97097190225631,
    "evB": -0.12693439722152888,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-239",
    "fairLineA": "+239",
    "fairLineB": "-239",
    "oddsA": "+195",
    "oddsB": "-240",
    "v2pA": 0.4125116944881412,
    "v2pB": 0.5874883055118588,
    "projectedKO": 20,
    "projectedSUB": 3,
    "projectedDEC": 77,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-25T14:06:59.172Z",
      "targetEventDate": "2026-08-29",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Strawweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.29501365456862266,
        "pB": 0.7049863454313774
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.00722028119349003,
          "avg_sig_str_pct_dif": -1.4649428571428558,
          "avg_td_dif": 0.35307806122448987,
          "avg_td_pct_dif": -1.9819875776397518,
          "atd_dif": 0.20000000000000018,
          "avg_sub_att_dif": 0.19408163265306116,
          "kd_dif": -0.5319999999999999,
          "control_time_dif": -0.34444444444444444,
          "reach_dif": -5.925925925925926,
          "height_dif": -6.813186813186814,
          "age_dif": 0,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -0.45454545454545453,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.7058823529411765,
          "deep_round_dif": -0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": -0.4637096774193548,
          "layoff_dif": 0.175,
          "cardio_dif": -0.9479166666666669,
          "peak_elo_dif": -0.38181818181818183,
          "ufc_fight_count_dif": -0.5,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.3122322703474536,
          "wins": -2,
          "losses": 2,
          "rounds": -12,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": 7,
          "reach": 6,
          "younger": 0,
          "sig_str_landed": 0.11408044285714247,
          "sig_str_accuracy": -0.14649428571428558,
          "sub_attempts": 0.13585714285714282,
          "td_landed": 0.4943092857142858,
          "td_accuracy": -0.4558571428571429,
          "elo": -0.23
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-30",
        "fighterB": "2026-04-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "c1eb456588f2faced59cef29aa36237aa923af24ef6163e4d6e0a7cc943946f4",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "cdb059f2e6ed1363ff12c840db420847e33497818f20b91a72fe71f2e588d0a2",
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
          "generatorVersion": "update_fighters.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-08-22",
          "contentHash": "efa1ba14a0b79ea684fd095672bf6528518b9a026467d83e973fd602eb83a382",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (785 rows); maximum event date found = 2026-08-22. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-22",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
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
          "generatorVersion": "scripts/update_rankings.py @ 49d49a418f61a71c5fa72bcbe004631f3e807d61",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
