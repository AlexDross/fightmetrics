export const UPCOMING_ENTRIES = [
  {
    "id": "1786823202677-ahytyi",
    "createdAt": "2026-08-15T19:46:42.677Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Islam Makhachev",
    "fighterB": "Ian Machado Garry",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": true,
      "scheduledRounds": 5,
      "provenance": null
    },
    "fighterAProb": 0.7480815023580831,
    "fighterBProb": 0.25191849764191687,
    "predictedWinner": "Islam Makhachev",
    "predictedProb": 0.7480815023580831,
    "modelUsed": "v2",
    "trackedSide": "Islam Makhachev",
    "trackedProb": 0.5657063622637519,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-350",
    "edge": -0.17897448880007782,
    "edgeA": -0.17897448880007782,
    "edgeB": 0.17897448880007788,
    "ev": -27.26632485180333,
    "evA": -27.26632485180333,
    "evB": 62.86011415109302,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.2285822332767019,
    "fairLine": "-130",
    "fairLineA": "-130",
    "fairLineB": "+130",
    "oddsA": "-350",
    "oddsB": "+275",
    "v2pA": 0.5657063622637519,
    "v2pB": 0.4342936377362481,
    "projectedKO": 25,
    "projectedSUB": 18,
    "projectedDEC": 57,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:46:42.677Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": true,
        "scheduledRounds": 5,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.14746835443037976,
          "avg_sig_str_pct_dif": 0.39999999999999925,
          "avg_td_dif": 1.5571428571428574,
          "avg_td_pct_dif": 1.0869565217391306,
          "atd_dif": 0.7333333333333333,
          "avg_sub_att_dif": 0.8714285714285714,
          "kd_dif": -0.19600000000000006,
          "control_time_dif": 1.0944444444444443,
          "reach_dif": -0.37037037037037035,
          "height_dif": -0.5494505494505495,
          "age_dif": -1.3953488372093024,
          "win_streak_dif": 10,
          "lose_streak_dif": 0,
          "win_dif": 1.5909090909090908,
          "loss_dif": 0,
          "total_round_dif": 0.7058823529411765,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 5.714285714285714,
          "elo_dif": 3.225806451612903,
          "layoff_dif": -0.035,
          "cardio_dif": -1.304166666666667,
          "peak_elo_dif": 2.909090909090909,
          "ufc_fight_count_dif": 0.875,
          "rank_tier_dif": 0.2799999999999998
        },
        "v2": {
          "modern_form": 0.12304322816213409,
          "wins": 7,
          "losses": 0,
          "rounds": 12,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 8,
          "height": -5,
          "reach": -4,
          "younger": -6,
          "sig_str_landed": -2.33,
          "sig_str_accuracy": 0.039999999999999925,
          "sub_attempts": 0.61,
          "td_landed": 2.18,
          "td_accuracy": 0.25000000000000006,
          "elo": 1.6
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-11-15",
        "fighterB": "2025-11-22"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786823171429-hq4you",
    "createdAt": "2026-08-15T19:46:11.429Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Mackenzie Dern",
    "fighterB": "Gillian Robertson",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Strawweight",
    "boutContext": {
      "division": "Women's Strawweight",
      "isTitleBout": true,
      "scheduledRounds": 5,
      "provenance": null
    },
    "fighterAProb": 0.262066824702611,
    "fighterBProb": 0.737933175297389,
    "predictedWinner": "Gillian Robertson",
    "predictedProb": 0.737933175297389,
    "modelUsed": "v2",
    "trackedSide": "Gillian Robertson",
    "trackedProb": 0.6121423354725419,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "betRecommendedFighter": "Gillian Robertson",
    "betRecommendedOdds": "+160",
    "marketOdds": "+160",
    "edge": 0.2422443762888684,
    "edgeA": -0.24224437628886847,
    "edgeB": 0.2422443762888684,
    "ev": 59.1570072228609,
    "evA": -40.80067225633535,
    "evB": 59.1570072228609,
    "kelly": 0.3697312951428806,
    "kellyA": 0,
    "kellyB": 0.3697312951428806,
    "fairLine": "-158",
    "fairLineA": "+158",
    "fairLineB": "-158",
    "oddsA": "-190",
    "oddsB": "+160",
    "v2pA": 0.3878576645274581,
    "v2pB": 0.6121423354725419,
    "projectedKO": 18,
    "projectedSUB": 30,
    "projectedDEC": 52,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:46:11.429Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "boutContext": {
        "division": "Women's Strawweight",
        "isTitleBout": true,
        "scheduledRounds": 5,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.048101265822784824,
          "avg_sig_str_pct_dif": -0.6,
          "avg_td_dif": -1.307142857142857,
          "avg_td_pct_dif": -0.9999999999999999,
          "atd_dif": -0.06666666666666674,
          "avg_sub_att_dif": 0.2714285714285715,
          "kd_dif": -0.5319999999999999,
          "control_time_dif": -0.6611111111111112,
          "reach_dif": 0,
          "height_dif": -0.10989010989010989,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": -0.6818181818181818,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": 0.11764705882352941,
          "deep_round_dif": 0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": -1.5,
          "sub_dif": -1.4285714285714286,
          "elo_dif": -0.42338709677419356,
          "layoff_dif": -0.7,
          "cardio_dif": -0.05916666666666663,
          "peak_elo_dif": -0.21818181818181817,
          "ufc_fight_count_dif": -0.5,
          "rank_tier_dif": 1.1288183542774233
        },
        "v2": {
          "modern_form": -0.16458262198967044,
          "wins": -3,
          "losses": 1,
          "rounds": 2,
          "title_bouts": 0,
          "ko_wins": -3,
          "sub_wins": -2,
          "height": -1,
          "reach": 0,
          "younger": -2,
          "sig_str_landed": 0.7600000000000002,
          "sig_str_accuracy": -0.06,
          "sub_attempts": 0.19000000000000006,
          "td_landed": -1.8299999999999996,
          "td_accuracy": -0.22999999999999998,
          "elo": -0.21
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-10-25",
        "fighterB": "2026-03-14"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786823131332-dg1zxg",
    "createdAt": "2026-08-15T19:45:31.332Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Jalin Turner",
    "fighterB": "Kaue Fernandes",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.5777012846198838,
    "fighterBProb": 0.4222987153801162,
    "predictedWinner": "Jalin Turner",
    "predictedProb": 0.5777012846198838,
    "modelUsed": "v2",
    "trackedSide": "Jalin Turner",
    "trackedProb": 0.5719644771373775,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-110",
    "edge": 0.07196447713737752,
    "edgeA": 0.07196447713737752,
    "edgeB": -0.07196447713737752,
    "ev": 9.193218362590265,
    "evA": 9.193218362590265,
    "evB": -18.284127453499345,
    "kelly": 0.10112540198849286,
    "kellyA": 0.10112540198849286,
    "kellyB": 0,
    "fairLine": "-134",
    "fairLineA": "-134",
    "fairLineB": "+134",
    "oddsA": "-110",
    "oddsB": "-110",
    "v2pA": 0.5719644771373775,
    "v2pB": 0.4280355228626225,
    "projectedKO": 60,
    "projectedSUB": 20,
    "projectedDEC": 21,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:45:31.332Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.09338685625108378,
          "avg_sig_str_pct_dif": -0.13695707762556908,
          "avg_td_dif": -0.5197064579256362,
          "avg_td_pct_dif": -0.8305022831050226,
          "atd_dif": 0.431111111111111,
          "avg_sub_att_dif": 1.2375864318330076,
          "kd_dif": -0.3320000000000001,
          "control_time_dif": -0.3444444444444444,
          "reach_dif": 0.37037037037037035,
          "height_dif": 0.6593406593406593,
          "age_dif": 0,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": 1.1363636363636362,
          "loss_dif": -1.8518518518518516,
          "total_round_dif": 0.9411764705882353,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 1.5,
          "sub_dif": 2.142857142857143,
          "elo_dif": 0.9274193548387096,
          "layoff_dif": 0.455,
          "cardio_dif": 0.7700000000000004,
          "peak_elo_dif": 1.5272727272727273,
          "ufc_fight_count_dif": 1.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.27983967467370485,
          "wins": 5,
          "losses": -5,
          "rounds": 16,
          "title_bouts": 0,
          "ko_wins": 3,
          "sub_wins": 3,
          "height": 6,
          "reach": 4,
          "younger": 0,
          "sig_str_landed": 1.475512328767124,
          "sig_str_accuracy": -0.013695707762556908,
          "sub_attempts": 0.8663105022831052,
          "td_landed": -0.7275890410958906,
          "td_accuracy": -0.1910155251141552,
          "elo": 0.46
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-06",
        "fighterB": "2025-09-06"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786823094478-i6q6sa",
    "createdAt": "2026-08-15T19:44:54.478Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Mansur Abdul-Malik",
    "fighterB": "Dustin Stoltzfus",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.6974330563381701,
    "fighterBProb": 0.3025669436618299,
    "predictedWinner": "Mansur Abdul-Malik",
    "predictedProb": 0.6974330563381701,
    "modelUsed": "v2",
    "trackedSide": "Mansur Abdul-Malik",
    "trackedProb": 0.6437880074207147,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-650",
    "edge": -0.18908107335922963,
    "edgeA": -0.18908107335922963,
    "edgeB": 0.18908107335922955,
    "ev": -25.71676837453292,
    "evA": -25.71676837453292,
    "evB": 104.82189573308902,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.22067767522755583,
    "fairLine": "-181",
    "fairLineA": "-181",
    "fairLineB": "+181",
    "oddsA": "-650",
    "oddsB": "+475",
    "v2pA": 0.6437880074207147,
    "v2pB": 0.35621199257928526,
    "projectedKO": 47,
    "projectedSUB": 26,
    "projectedDEC": 26,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:44:54.478Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.0023327232099719882,
          "avg_sig_str_pct_dif": 0.062072824427482076,
          "avg_td_dif": -0.11872655398037106,
          "avg_td_pct_dif": 0.19885496183206133,
          "atd_dif": 1.9555555555555546,
          "avg_sub_att_dif": -0.809374409305707,
          "kd_dif": 1.252,
          "control_time_dif": -0.027777777777777776,
          "reach_dif": 0.4629629629629629,
          "height_dif": 0.21978021978021978,
          "age_dif": 1.3953488372093024,
          "win_streak_dif": 0,
          "lose_streak_dif": 1,
          "win_dif": 0,
          "loss_dif": 2.222222222222222,
          "total_round_dif": -0.7647058823529411,
          "deep_round_dif": -0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 2.258064516129032,
          "layoff_dif": 0.98,
          "cardio_dif": -0.22291666666666665,
          "peak_elo_dif": 1.9090909090909092,
          "ufc_fight_count_dif": -0.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.20386586116970729,
          "wins": 0,
          "losses": 6,
          "rounds": -13,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": 2,
          "reach": 5,
          "younger": 6,
          "sig_str_landed": 0.03685702671755742,
          "sig_str_accuracy": 0.006207282442748208,
          "sub_attempts": -0.5665620865139949,
          "td_landed": -0.16621717557251947,
          "td_accuracy": 0.04573664122137411,
          "elo": 1.12
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-28",
        "fighterB": "2025-09-13"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786823062490-fbmbbj",
    "createdAt": "2026-08-15T19:44:22.490Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Edson Barboza",
    "fighterB": "Esteban Ribovics",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.3781608731859632,
    "fighterBProb": 0.6218391268140369,
    "predictedWinner": "Esteban Ribovics",
    "predictedProb": 0.6218391268140369,
    "modelUsed": "v2",
    "trackedSide": "Esteban Ribovics",
    "trackedProb": 0.6476034299370197,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-700",
    "edge": -0.19239657006298028,
    "edgeA": 0.19239657006298028,
    "edgeB": -0.19239657006298028,
    "ev": -25.988179435769183,
    "evA": 111.43794203778818,
    "evB": -25.988179435769183,
    "kelly": 0,
    "kellyA": 0.22287588407557632,
    "kellyB": 0,
    "fairLine": "-184",
    "fairLineA": "+184",
    "fairLineB": "-184",
    "oddsA": "+500",
    "oddsB": "-700",
    "v2pA": 0.35239657006298025,
    "v2pB": 0.6476034299370197,
    "projectedKO": 31,
    "projectedSUB": 5,
    "projectedDEC": 64,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:44:22.490Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.21653164556962026,
          "avg_sig_str_pct_dif": -0.039599999999999635,
          "avg_td_dif": 0.057142857142857155,
          "avg_td_pct_dif": -0.7391304347826089,
          "atd_dif": 0.46666666666666634,
          "avg_sub_att_dif": -0.14285714285714285,
          "kd_dif": 0.40399999999999997,
          "control_time_dif": -0.022222222222222216,
          "reach_dif": 0.5555555555555555,
          "height_dif": 0.10989010989010989,
          "age_dif": -2.3255813953488373,
          "win_streak_dif": 0,
          "lose_streak_dif": -2,
          "win_dif": 3.1818181818181817,
          "loss_dif": -4.0740740740740735,
          "total_round_dif": 3.9411764705882355,
          "deep_round_dif": 1,
          "total_title_bout_dif": 0,
          "ko_dif": 4,
          "sub_dif": 0,
          "elo_dif": 0.6854838709677419,
          "layoff_dif": -0.63,
          "cardio_dif": -4.597916666666666,
          "peak_elo_dif": 1.8,
          "ufc_fight_count_dif": 3.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.19739342498983953,
          "wins": 14,
          "losses": -11,
          "rounds": 67,
          "title_bouts": 0,
          "ko_wins": 8,
          "sub_wins": 0,
          "height": 1,
          "reach": 6,
          "younger": -10,
          "sig_str_landed": -3.4212000000000002,
          "sig_str_accuracy": -0.0039599999999999635,
          "sub_attempts": -0.09999999999999999,
          "td_landed": 0.08000000000000002,
          "td_accuracy": -0.17000000000000004,
          "elo": 0.34
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-06",
        "fighterB": "2026-04-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786823040114-fo1k6b",
    "createdAt": "2026-08-15T19:44:00.114Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Chidi Njokuani",
    "fighterB": "Joel Alvarez",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.30622909063548853,
    "fighterBProb": 0.6937709093645115,
    "predictedWinner": "Joel Alvarez",
    "predictedProb": 0.6937709093645115,
    "modelUsed": "v2",
    "trackedSide": "Joel Alvarez",
    "trackedProb": 0.6810217994372325,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-325",
    "edge": -0.05252052031198384,
    "edgeA": 0.052520520311983676,
    "edgeB": -0.05252052031198384,
    "ev": -10.94330315051575,
    "evA": 14.832152202596276,
    "evB": -10.94330315051575,
    "kelly": 0,
    "kellyA": 0.05704673924075493,
    "kellyB": 0,
    "fairLine": "-214",
    "fairLineA": "+214",
    "fairLineB": "-214",
    "oddsA": "+260",
    "oddsB": "-325",
    "v2pA": 0.31897820056276743,
    "v2pB": 0.6810217994372325,
    "projectedKO": 50,
    "projectedSUB": 19,
    "projectedDEC": 31,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:44:00.114Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.04198101265822782,
          "avg_sig_str_pct_dif": 0.3179999999999983,
          "avg_td_dif": -0.1285714285714286,
          "avg_td_pct_dif": -1.434782608695652,
          "atd_dif": 1.866666666666667,
          "avg_sub_att_dif": -1.2571428571428573,
          "kd_dif": -0.3240000000000001,
          "control_time_dif": -0.19444444444444445,
          "reach_dif": 0.27777777777777773,
          "height_dif": 0,
          "age_dif": -0.9302325581395349,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": -0.6818181818181818,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": -0.058823529411764705,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": -2.142857142857143,
          "elo_dif": -3.4274193548387095,
          "layoff_dif": -0.385,
          "cardio_dif": 2.7120833333333336,
          "peak_elo_dif": -2.4363636363636365,
          "ufc_fight_count_dif": -0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.19452134646204589,
          "wins": -3,
          "losses": -2,
          "rounds": -1,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": -3,
          "height": 0,
          "reach": 3,
          "younger": -4,
          "sig_str_landed": 0.6632999999999996,
          "sig_str_accuracy": 0.03179999999999983,
          "sub_attempts": -0.8800000000000001,
          "td_landed": -0.18,
          "td_accuracy": -0.33,
          "elo": -1.7
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-21",
        "fighterB": "2026-05-09"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786823004768-lj5jjp",
    "createdAt": "2026-08-15T19:43:24.768Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Donte Johnson",
    "fighterB": "Eric McConico",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.6463155570686728,
    "fighterBProb": 0.35368444293132717,
    "predictedWinner": "Donte Johnson",
    "predictedProb": 0.6463155570686728,
    "modelUsed": "v2",
    "trackedSide": "Donte Johnson",
    "trackedProb": 0.6947343156308464,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-305",
    "edge": -0.02734494324717729,
    "edgeA": -0.02734494324717729,
    "edgeB": 0.027344943247177234,
    "ev": -7.748394153936793,
    "evA": -7.748394153936793,
    "evB": 5.316661107357987,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.021700657581053016,
    "fairLine": "-228",
    "fairLineA": "-228",
    "fairLineB": "+228",
    "oddsA": "-305",
    "oddsB": "+245",
    "v2pA": 0.6947343156308464,
    "v2pB": 0.3052656843691536,
    "projectedKO": 5,
    "projectedSUB": 14,
    "projectedDEC": 81,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:43:24.768Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.012318526749766473,
          "avg_sig_str_pct_dif": -0.13546564885495993,
          "avg_td_dif": 0.5908614685568883,
          "avg_td_pct_dif": -1.0831131762363089,
          "atd_dif": 0.33333333333333365,
          "avg_sub_att_dif": 0.6249411850236278,
          "kd_dif": 0,
          "control_time_dif": 1.0499999999999998,
          "reach_dif": -0.27777777777777773,
          "height_dif": -0.43956043956043955,
          "age_dif": 2.0930232558139537,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.35294117647058826,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 1.2298387096774193,
          "layoff_dif": -0.245,
          "cardio_dif": -0.54625,
          "peak_elo_dif": 1.018181818181818,
          "ufc_fight_count_dif": -0.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.3555555555555556,
          "wins": 0,
          "losses": 2,
          "rounds": -6,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 1,
          "height": -4,
          "reach": -3,
          "younger": 9,
          "sig_str_landed": 0.19463272264631026,
          "sig_str_accuracy": -0.013546564885495993,
          "sub_attempts": 0.43745882951653947,
          "td_landed": 0.8272060559796435,
          "td_accuracy": -0.24911603053435105,
          "elo": 0.61
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
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786822978190-jtaix9",
    "createdAt": "2026-08-15T19:42:58.190Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Vicente Luque",
    "fighterB": "Tresean Gore",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.5923807975369481,
    "fighterBProb": 0.40761920246305194,
    "predictedWinner": "Vicente Luque",
    "predictedProb": 0.5923807975369481,
    "modelUsed": "v2",
    "trackedSide": "Vicente Luque",
    "trackedProb": 0.6250562658454131,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "betRecommendedFighter": "Vicente Luque",
    "betRecommendedOdds": "-110",
    "marketOdds": "-110",
    "edge": 0.12505626584541307,
    "edgeA": 0.12505626584541307,
    "edgeB": -0.12505626584541307,
    "ev": 19.32892347957886,
    "evA": 19.32892347957886,
    "evB": -28.41983257048794,
    "kelly": 0.21261815827536748,
    "kellyA": 0.21261815827536748,
    "kellyB": 0,
    "fairLine": "-167",
    "fairLineA": "-167",
    "fairLineB": "+167",
    "oddsA": "-110",
    "oddsB": "-110",
    "v2pA": 0.6250562658454131,
    "v2pB": 0.3749437341545869,
    "projectedKO": 33,
    "projectedSUB": 43,
    "projectedDEC": 24,
    "projectedFinish": "SUB",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:42:58.190Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.08797468354430377,
          "avg_sig_str_pct_dif": 0.10000000000000009,
          "avg_td_dif": -0.7285714285714286,
          "avg_td_pct_dif": -1.0869565217391304,
          "atd_dif": -1.6,
          "avg_sub_att_dif": -0.37142857142857144,
          "kd_dif": 1.184,
          "control_time_dif": -0.6666666666666666,
          "reach_dif": 0,
          "height_dif": -0.10989010989010989,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 3.1818181818181817,
          "loss_dif": -1.4814814814814814,
          "total_round_dif": 2.2941176470588234,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": 4,
          "sub_dif": 2.857142857142857,
          "elo_dif": 4.274193548387097,
          "layoff_dif": 0.035,
          "cardio_dif": -1.2041666666666668,
          "peak_elo_dif": 5.163636363636364,
          "ufc_fight_count_dif": 2.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.03535679774938555,
          "wins": 14,
          "losses": -4,
          "rounds": 39,
          "title_bouts": 0,
          "ko_wins": 8,
          "sub_wins": 4,
          "height": -1,
          "reach": 0,
          "younger": -2,
          "sig_str_landed": 1.3899999999999997,
          "sig_str_accuracy": 0.010000000000000009,
          "sub_attempts": -0.26,
          "td_landed": -1.02,
          "td_accuracy": -0.25,
          "elo": 2.12
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2026-04-04"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786822935624-ddtt76",
    "createdAt": "2026-08-15T19:42:15.624Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Neil Magny",
    "fighterB": "Ramiz Brahimaj",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.5701736772819317,
    "fighterBProb": 0.4298263227180683,
    "predictedWinner": "Neil Magny",
    "predictedProb": 0.5701736772819317,
    "modelUsed": "v2",
    "trackedSide": "Neil Magny",
    "trackedProb": 0.5161799226318265,
    "unitsWagered": 0.5,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "+120",
    "edge": 0.08178275951125918,
    "edgeA": 0.08178275951125918,
    "edgeB": -0.08178275951125913,
    "ev": 13.559582979001853,
    "evA": 13.559582979001853,
    "evB": -18.251090375722413,
    "kelly": 0.11299652482501539,
    "kellyA": 0.11299652482501539,
    "kellyB": 0,
    "fairLine": "-107",
    "fairLineA": "-107",
    "fairLineB": "+107",
    "oddsA": "+120",
    "oddsB": "-145",
    "v2pA": 0.5161799226318265,
    "v2pB": 0.48382007736817345,
    "projectedKO": 29,
    "projectedSUB": 31,
    "projectedDEC": 40,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:42:15.624Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.0653354430379747,
          "avg_sig_str_pct_dif": -0.19440000000000013,
          "avg_td_dif": 0.12857142857142853,
          "avg_td_pct_dif": 0.2608695652173913,
          "atd_dif": 0.7333333333333336,
          "avg_sub_att_dif": -1.9000000000000001,
          "kd_dif": 0.14399999999999996,
          "control_time_dif": -0.10555555555555557,
          "reach_dif": 0.7407407407407407,
          "height_dif": 0.5494505494505495,
          "age_dif": -1.3953488372093024,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 4.3181818181818175,
          "loss_dif": -3.333333333333333,
          "total_round_dif": 4.529411764705882,
          "deep_round_dif": 1.1764705882352942,
          "total_title_bout_dif": 0,
          "ko_dif": 3,
          "sub_dif": -0.7142857142857143,
          "elo_dif": 0.625,
          "layoff_dif": -0.35,
          "cardio_dif": 3.232916666666667,
          "peak_elo_dif": 1.509090909090909,
          "ufc_fight_count_dif": 3.5,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.14843458252970726,
          "wins": 19,
          "losses": -9,
          "rounds": 77,
          "title_bouts": 0,
          "ko_wins": 6,
          "sub_wins": -1,
          "height": 5,
          "reach": 8,
          "younger": -6,
          "sig_str_landed": 1.0323000000000002,
          "sig_str_accuracy": -0.019440000000000013,
          "sub_attempts": -1.33,
          "td_landed": 0.17999999999999994,
          "td_accuracy": 0.06,
          "elo": 0.31
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-13",
        "fighterB": "2026-02-21"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1786822892840-k2dfrm",
    "createdAt": "2026-08-15T19:41:32.840Z",
    "eventName": "UFC 330",
    "eventDate": "2026-08-15",
    "fighterA": "Jeremiah Wells",
    "fighterB": "Myktybek Orolbai",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.21636275826783666,
    "fighterBProb": 0.7836372417321633,
    "predictedWinner": "Myktybek Orolbai",
    "predictedProb": 0.7836372417321633,
    "modelUsed": "v2",
    "trackedSide": "Myktybek Orolbai",
    "trackedProb": 0.791685136914412,
    "unitsWagered": 2,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-1100",
    "edge": -0.08831486308558811,
    "edgeA": 0.08831486308558795,
    "edgeB": -0.08831486308558811,
    "ev": -13.634348700245972,
    "evA": 66.65189046847038,
    "evB": -13.634348700245972,
    "kelly": 0,
    "kellyA": 0.09521698638352911,
    "kellyB": 0,
    "fairLine": "-380",
    "fairLineA": "+380",
    "fairLineB": "-380",
    "oddsA": "+700",
    "oddsB": "-1100",
    "v2pA": 0.20831486308558797,
    "v2pB": 0.791685136914412,
    "projectedKO": 31,
    "projectedSUB": 23,
    "projectedDEC": 46,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-15T19:41:32.840Z",
      "targetEventDate": "2026-08-15",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.03693520504949468,
          "avg_sig_str_pct_dif": -0.31767847411444117,
          "avg_td_dif": -3.3854826521344226,
          "avg_td_pct_dif": -0.37556055759586116,
          "atd_dif": 0.4888888888888891,
          "avg_sub_att_dif": 1.1729744907227195,
          "kd_dif": 0.384,
          "control_time_dif": -2.416666666666667,
          "reach_dif": 0,
          "height_dif": -0.10989010989010989,
          "age_dif": -2.558139534883721,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 0.17647058823529413,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -1.1491935483870968,
          "layoff_dif": -0.665,
          "cardio_dif": -0.45874999999999994,
          "peak_elo_dif": -0.14545454545454545,
          "ufc_fight_count_dif": 0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.18051609411709424,
          "wins": 0,
          "losses": -1,
          "rounds": 3,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": -1,
          "height": -1,
          "reach": 0,
          "younger": -11,
          "sig_str_landed": -0.5835762397820159,
          "sig_str_accuracy": -0.03176784741144412,
          "sub_attempts": 0.8210821435059037,
          "td_landed": -4.739675712988191,
          "td_accuracy": -0.08637892824704807,
          "elo": -0.57
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-11-01",
        "fighterB": "2026-03-14"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "46bff36e8569423c1401fb137638b82265fab6a675584273ac1f0181ff9df0a5",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "51dc68372e9742be8602c43b0a9119ecc3e2c9eb5fa0b3c4a97980ab1e244aad",
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
          "generatorVersion": "update_fighters.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-08-08",
          "contentHash": "0cb60aee84bb6b2b40b2cb476c44e734f9706a96942246d022d285ebe80aa35d",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (783 rows); maximum event date found = 2026-08-08. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-08-13",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
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
          "generatorVersion": "scripts/update_rankings.py @ 97d2379ea418148c1ce0a21deae0461310914844",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
