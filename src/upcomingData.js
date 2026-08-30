export const UPCOMING_ENTRIES = [
  {
    "id": "1788113894317-eyd93n",
    "createdAt": "2026-08-30T18:18:14.317Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Fares Ziam",
    "fighterB": "Axel Sola",
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
    "fighterAProb": 0.5613510662998984,
    "fighterBProb": 0.4386489337001016,
    "predictedWinner": "Fares Ziam",
    "predictedProb": 0.5613510662998984,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6080154220174634,
    "c6ProbB": 0.3919845779825366,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Fares Ziam",
    "trackedProb": 0.6080154220174634,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-160",
    "edge": 0.01682045346400418,
    "edgeA": 0.01682045346400418,
    "edgeB": -0.016820453464004292,
    "ev": -1.1974939221622023,
    "evA": -1.1974939221622023,
    "evB": -7.883624174103893,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-155",
    "fairLineA": "-155",
    "fairLineB": "+155",
    "oddsA": "-160",
    "oddsB": "+135",
    "v2pA": 0.5447204762916944,
    "v2pB": 0.4552795237083056,
    "projectedKO": 36,
    "projectedSUB": 19,
    "projectedDEC": 44,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:18:14.318Z",
      "targetEventDate": "2026-09-05",
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
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6080154220174634,
        "pB": 0.3919845779825366
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.09525586221207717,
          "avg_sig_str_pct_dif": 0.4309100182149378,
          "avg_td_dif": 0.10334894613583137,
          "avg_td_pct_dif": 0.3564267046804466,
          "atd_dif": 2.5999999999999996,
          "avg_sub_att_dif": 0.03252146760343506,
          "kd_dif": -0.612,
          "control_time_dif": 0.07222222222222226,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0.10989010989010989,
          "age_dif": -0.23255813953488372,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": -1,
          "win_dif": 1.3636363636363635,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 1.3529411764705883,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": 1.471774193548387,
          "layoff_dif": -0.245,
          "cardio_dif": -3.2875,
          "peak_elo_dif": 1.6727272727272726,
          "ufc_fight_count_dif": 1,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.02972123295971063,
          "wins": 6,
          "losses": -2,
          "rounds": 23,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": -1,
          "height": 1,
          "reach": 1,
          "younger": -1,
          "sig_str_landed": -1.5050426229508194,
          "sig_str_accuracy": 0.04309100182149378,
          "sub_attempts": 0.02276502732240454,
          "td_landed": 0.1446885245901639,
          "td_accuracy": 0.08197814207650272,
          "elo": 0.73
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-06",
        "fighterB": "2026-07-25"
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
    "id": "1788113867291-ddu65l",
    "createdAt": "2026-08-30T18:17:47.291Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Michael Page",
    "fighterB": "Nursulton Ruziboev",
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
    "fighterAProb": 0.3108317762917277,
    "fighterBProb": 0.6891682237082724,
    "predictedWinner": "Nursulton Ruziboev",
    "predictedProb": 0.6891682237082724,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5038733015683674,
    "c6ProbB": 0.4961266984316326,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Michael Page",
    "trackedProb": 0.5038733015683674,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-170",
    "edge": -0.09789660993605742,
    "edgeA": -0.09789660993605742,
    "edgeB": 0.09789660993605737,
    "ev": -19.973063868553403,
    "evA": -19.973063868553403,
    "evB": 19.07040762359182,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.13621719731137016,
    "fairLine": "-102",
    "fairLineA": "-102",
    "fairLineB": "+102",
    "oddsA": "-170",
    "oddsB": "+140",
    "v2pA": 0.3391546195894549,
    "v2pB": 0.6608453804105451,
    "projectedKO": 29,
    "projectedSUB": 9,
    "projectedDEC": 61,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:17:47.291Z",
      "targetEventDate": "2026-09-05",
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
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5038733015683674,
        "pB": 0.4961266984316326
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.037013308854317646,
          "avg_sig_str_pct_dif": 0.9965699745547069,
          "avg_td_dif": -0.9958221010541621,
          "avg_td_pct_dif": -2.9863436220820887,
          "atd_dif": 1.9866666666666664,
          "avg_sub_att_dif": -0.5489672119229372,
          "kd_dif": -2.1799999999999997,
          "control_time_dif": -0.7722222222222223,
          "reach_dif": 0.27777777777777773,
          "height_dif": -0.21978021978021978,
          "age_dif": -1.627906976744186,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0,
          "total_round_dif": 0.23529411764705882,
          "deep_round_dif": 0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": -1.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -0.7056451612903225,
          "layoff_dif": -0.49,
          "cardio_dif": -1.63875,
          "peak_elo_dif": -0.6363636363636364,
          "ufc_fight_count_dif": -0.125,
          "rank_tier_dif": 1.9062513654776305
        },
        "v2": {
          "modern_form": -0.010822366328331556,
          "wins": -1,
          "losses": 0,
          "rounds": 4,
          "title_bouts": 0,
          "ko_wins": -3,
          "sub_wins": -1,
          "height": -2,
          "reach": 3,
          "younger": -7,
          "sig_str_landed": -0.5848102798982189,
          "sig_str_accuracy": 0.09965699745547069,
          "sub_attempts": -0.384277048346056,
          "td_landed": -1.3941509414758269,
          "td_accuracy": -0.6868590330788804,
          "elo": -0.35
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-21",
        "fighterB": "2026-06-27"
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
    "id": "1788113824839-en4kku",
    "createdAt": "2026-08-30T18:17:04.839Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Daniil Donchenko",
    "fighterB": "Punahele Soriano",
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
    "fighterAProb": 0.4700060328601696,
    "fighterBProb": 0.5299939671398304,
    "predictedWinner": "Punahele Soriano",
    "predictedProb": 0.5299939671398304,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.697825725355486,
    "c6ProbB": 0.30217427464451396,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Daniil Donchenko",
    "trackedProb": 0.697825725355486,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-220",
    "edge": 0.039706067235827924,
    "edgeA": 0.039706067235827924,
    "edgeB": -0.039706067235827924,
    "ev": 1.5019236880707005,
    "evA": 1.5019236880707005,
    "evB": -15.391203099536106,
    "kelly": 0.0330423211375554,
    "kellyA": 0.0330423211375554,
    "kellyB": 0,
    "fairLine": "-231",
    "fairLineA": "-231",
    "fairLineB": "+231",
    "oddsA": "-220",
    "oddsB": "+180",
    "v2pA": 0.6043351409034492,
    "v2pB": 0.3956648590965508,
    "projectedKO": 55,
    "projectedSUB": 8,
    "projectedDEC": 37,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:17:04.840Z",
      "targetEventDate": "2026-09-05",
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
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.697825725355486,
        "pB": 0.30217427464451396
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.06243389093919226,
          "avg_sig_str_pct_dif": -0.4904468664850159,
          "avg_td_dif": -0.5028660179058,
          "avg_td_pct_dif": -0.6317166212534067,
          "atd_dif": 1.2000000000000004,
          "avg_sub_att_dif": 0.211782172051382,
          "kd_dif": 1.3359999999999996,
          "control_time_dif": -0.5055555555555556,
          "reach_dif": -0.09259259259259259,
          "height_dif": 0,
          "age_dif": 1.8604651162790697,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": -0.9090909090909091,
          "loss_dif": 1.4814814814814814,
          "total_round_dif": -1.0588235294117647,
          "deep_round_dif": -0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 0,
          "elo_dif": 0.4032258064516129,
          "layoff_dif": 0.63,
          "cardio_dif": -0.15166666666666662,
          "peak_elo_dif": 0.2727272727272727,
          "ufc_fight_count_dif": -1,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.18206460384694656,
          "wins": -4,
          "losses": 4,
          "rounds": -18,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 0,
          "height": 0,
          "reach": -1,
          "younger": 8,
          "sig_str_landed": 0.9864554768392377,
          "sig_str_accuracy": -0.04904468664850159,
          "sub_attempts": 0.1482475204359674,
          "td_landed": -0.7040124250681199,
          "td_accuracy": -0.14529482288828355,
          "elo": 0.2
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-27",
        "fighterB": "2026-02-21"
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
    "id": "1788113750264-ecu5sq",
    "createdAt": "2026-08-30T18:15:50.264Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Morgan Charriere",
    "fighterB": "Felipe Lima",
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
    "fighterAProb": 0.5724495153971637,
    "fighterBProb": 0.4275504846028363,
    "predictedWinner": "Morgan Charriere",
    "predictedProb": 0.5724495153971637,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3847593294554944,
    "c6ProbB": 0.6152406705445056,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Felipe Lima",
    "trackedProb": 0.6152406705445056,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-185",
    "edge": -0.008148824004552968,
    "edgeA": 0.008148824004552857,
    "edgeB": -0.008148824004552968,
    "ev": -5.2196804836842645,
    "evA": -1.886370988848931,
    "evB": -5.2196804836842645,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-160",
    "fairLineA": "+160",
    "fairLineB": "-160",
    "oddsA": "+155",
    "oddsB": "-185",
    "v2pA": 0.4981540503813595,
    "v2pB": 0.5018459496186405,
    "projectedKO": 46,
    "projectedSUB": 21,
    "projectedDEC": 33,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:15:50.264Z",
      "targetEventDate": "2026-09-05",
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
        "pA": 0.3847593294554944,
        "pB": 0.6152406705445056
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.03914811580931855,
          "avg_sig_str_pct_dif": 0.44149480851063794,
          "avg_td_dif": 0.0609073961499494,
          "avg_td_pct_dif": 0.6975105355123856,
          "atd_dif": 0.32888888888888823,
          "avg_sub_att_dif": -0.4796711921648092,
          "kd_dif": 1.8479999999999999,
          "control_time_dif": 0.1277777777777777,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0.21978021978021978,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0.22727272727272727,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.23529411764705882,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 1.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -0.16129032258064516,
          "layoff_dif": 0.84,
          "cardio_dif": 0.4858333333333335,
          "peak_elo_dif": 0.10909090909090909,
          "ufc_fight_count_dif": 0.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.10157559198542804,
          "wins": 1,
          "losses": -2,
          "rounds": 4,
          "title_bouts": 0,
          "ko_wins": 3,
          "sub_wins": -1,
          "height": 2,
          "reach": 1,
          "younger": -2,
          "sig_str_landed": 0.6185402297872331,
          "sig_str_accuracy": 0.044149480851063794,
          "sub_attempts": -0.3357698345153664,
          "td_landed": 0.08527035460992916,
          "td_accuracy": 0.1604274231678487,
          "elo": -0.08
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-13",
        "fighterB": "2025-06-28"
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
    "id": "1788113726505-npbiqu",
    "createdAt": "2026-08-30T18:15:26.505Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Losene Keita",
    "fighterB": "Muhammad Naimov",
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
    "fighterAProb": 0.4365086334878839,
    "fighterBProb": 0.5634913665121162,
    "predictedWinner": "Muhammad Naimov",
    "predictedProb": 0.5634913665121162,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7182823800238034,
    "c6ProbB": 0.2817176199761966,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Losene Keita",
    "trackedProb": 0.7182823800238034,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-350",
    "edge": -0.02639847104002635,
    "edgeA": -0.02639847104002635,
    "edgeB": 0.026398471040026406,
    "ev": -7.649408282653859,
    "evA": -7.649408282653859,
    "evB": 5.644107491073726,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.020524027240268087,
    "fairLine": "-255",
    "fairLineA": "-255",
    "fairLineB": "+255",
    "oddsA": "-350",
    "oddsB": "+275",
    "v2pA": 0.47609312144180344,
    "v2pB": 0.5239068785581966,
    "projectedKO": 17,
    "projectedSUB": 3,
    "projectedDEC": 80,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:15:26.505Z",
      "targetEventDate": "2026-09-05",
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
        "pA": 0.7182823800238034,
        "pB": 0.2817176199761966
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.09904552598976568,
          "avg_sig_str_pct_dif": 0.30847557446808616,
          "avg_td_dif": -0.43843647416413367,
          "avg_td_pct_dif": -0.4142707369719394,
          "atd_dif": -0.5333333333333339,
          "avg_sub_att_dif": 0.3532992907801418,
          "kd_dif": -0.888,
          "control_time_dif": -0.5277777777777778,
          "reach_dif": 0.18518518518518517,
          "height_dif": -0.21978021978021978,
          "age_dif": 0.9302325581395349,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -1.1363636363636362,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": -0.8823529411764706,
          "deep_round_dif": -0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 0,
          "elo_dif": -1.6129032258064515,
          "layoff_dif": 0.525,
          "cardio_dif": 1.4583333333333333,
          "peak_elo_dif": -2,
          "ufc_fight_count_dif": -0.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.4438825091916231,
          "wins": -5,
          "losses": 1,
          "rounds": -15,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 0,
          "height": -2,
          "reach": 2,
          "younger": 4,
          "sig_str_landed": 1.564919310638298,
          "sig_str_accuracy": 0.030847557446808616,
          "sub_attempts": 0.2473095035460992,
          "td_landed": -0.6138110638297871,
          "td_accuracy": -0.09528226950354607,
          "elo": -0.8
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-21",
        "fighterB": "2025-12-06"
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
    "id": "1788113692721-sn1x0a",
    "createdAt": "2026-08-30T18:14:52.721Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Mario Pinto",
    "fighterB": "Ryan Spann",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.5674794397010339,
    "fighterBProb": 0.43252056029896613,
    "predictedWinner": "Mario Pinto",
    "predictedProb": 0.5674794397010339,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7502680890111442,
    "c6ProbB": 0.24973191098885583,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Mario Pinto",
    "trackedProb": 0.7502680890111442,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-260",
    "edge": 0.05901594492881146,
    "edgeA": 0.05901594492881146,
    "edgeB": -0.059015944928811404,
    "ev": 3.8832738630814987,
    "evA": 3.8832738630814987,
    "evB": -22.58310759345469,
    "kelly": 0.10096512044011897,
    "kellyA": 0.10096512044011897,
    "kellyB": 0,
    "fairLine": "-300",
    "fairLineA": "-300",
    "fairLineB": "+300",
    "oddsA": "-260",
    "oddsB": "+210",
    "v2pA": 0.65678483071244,
    "v2pB": 0.34321516928756,
    "projectedKO": 51,
    "projectedSUB": 22,
    "projectedDEC": 27,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:14:52.721Z",
      "targetEventDate": "2026-09-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7502680890111442,
        "pB": 0.24973191098885583
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.012326267093691242,
          "avg_sig_str_pct_dif": 1.7740080321285145,
          "avg_td_dif": 0.46514056224899586,
          "avg_td_pct_dif": -0.2913846691112276,
          "atd_dif": 1.3111111111111111,
          "avg_sub_att_dif": -1.128066551921974,
          "kd_dif": 1.0519999999999998,
          "control_time_dif": 0.15000000000000005,
          "reach_dif": 0,
          "height_dif": 0,
          "age_dif": 1.627906976744186,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": -1.5909090909090908,
          "loss_dif": 2.222222222222222,
          "total_round_dif": -1.1176470588235294,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": -2.857142857142857,
          "elo_dif": -0.2217741935483871,
          "layoff_dif": -0.175,
          "cardio_dif": -3.96375,
          "peak_elo_dif": -1.1818181818181819,
          "ufc_fight_count_dif": -1.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.3151875332601226,
          "wins": -7,
          "losses": 6,
          "rounds": -19,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": -4,
          "height": 0,
          "reach": 0,
          "younger": 7,
          "sig_str_landed": 0.19475502008032164,
          "sig_str_accuracy": 0.17740080321285145,
          "sub_attempts": -0.7896465863453817,
          "td_landed": 0.6511967871485942,
          "td_accuracy": -0.06701847389558235,
          "elo": -0.11
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-21",
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
  },
  {
    "id": "1788113652337-w1rpf3",
    "createdAt": "2026-08-30T18:14:12.337Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Kurtis Campbell",
    "fighterB": "Trevor Peek",
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
    "fighterAProb": 0.5839769690079609,
    "fighterBProb": 0.4160230309920391,
    "predictedWinner": "Kurtis Campbell",
    "predictedProb": 0.5839769690079609,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7513849035673192,
    "c6ProbB": 0.24861509643268076,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Kurtis Campbell",
    "trackedProb": 0.7513849035673192,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-340",
    "edge": 0.010513289904186207,
    "edgeA": 0.010513289904186207,
    "edgeB": -0.010513289904186152,
    "ev": -2.761953655993974,
    "evA": -2.761953655993974,
    "evB": -8.012414319908103,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-302",
    "fairLineA": "-302",
    "fairLineB": "+302",
    "oddsA": "-340",
    "oddsB": "+270",
    "v2pA": 0.5616974989332185,
    "v2pB": 0.4383025010667815,
    "projectedKO": 20,
    "projectedSUB": 3,
    "projectedDEC": 77,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:14:12.337Z",
      "targetEventDate": "2026-09-05",
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
        "pA": 0.7513849035673192,
        "pB": 0.24861509643268076
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.012673162806356055,
          "avg_sig_str_pct_dif": -0.5546363687943257,
          "avg_td_dif": 0.43393323201621087,
          "avg_td_pct_dif": -0.6369945523692055,
          "atd_dif": 0.37333333333333296,
          "avg_sub_att_dif": 0.585762445119892,
          "kd_dif": -0.616,
          "control_time_dif": 1.161111111111111,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0,
          "age_dif": 1.8604651162790697,
          "win_streak_dif": 0,
          "lose_streak_dif": 1,
          "win_dif": -0.45454545454545453,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.6470588235294118,
          "deep_round_dif": -0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": -0.5443548387096774,
          "layoff_dif": 2.8,
          "cardio_dif": 1.5975,
          "peak_elo_dif": -0.6909090909090909,
          "ufc_fight_count_dif": -0.5,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.2347858162779629,
          "wins": -2,
          "losses": 2,
          "rounds": -11,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": 0,
          "reach": 2,
          "younger": 8,
          "sig_str_landed": 0.20023597234042567,
          "sig_str_accuracy": -0.055463636879432565,
          "sub_attempts": 0.4100337115839243,
          "td_landed": 0.6075065248226952,
          "td_accuracy": -0.1465087470449173,
          "elo": -0.27
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-21",
        "fighterB": "2024-09-07"
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
    "id": "1788113604226-q10tyu",
    "createdAt": "2026-08-30T18:13:24.226Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Oumar Sy",
    "fighterB": "Modestas Bukauskas",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Light Heavyweight",
    "boutContext": {
      "division": "Light Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.36855530178963836,
    "fighterBProb": 0.6314446982103616,
    "predictedWinner": "Modestas Bukauskas",
    "predictedProb": 0.6314446982103616,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6356327770800885,
    "c6ProbB": 0.3643672229199115,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Oumar Sy",
    "trackedProb": 0.6356327770800885,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-190",
    "edge": 0.005530736263761882,
    "edgeA": 0.005530736263761882,
    "edgeB": -0.005530736263761993,
    "ev": -2.982365603565448,
    "evA": -2.982365603565448,
    "evB": -5.264522040823003,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-174",
    "fairLineA": "-174",
    "fairLineB": "+174",
    "oddsA": "-190",
    "oddsB": "+160",
    "v2pA": 0.5294301593434659,
    "v2pB": 0.47056984065653407,
    "projectedKO": 34,
    "projectedSUB": 17,
    "projectedDEC": 49,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:13:24.227Z",
      "targetEventDate": "2026-09-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Light Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6356327770800885,
        "pB": 0.3643672229199115
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.006285431389298708,
          "avg_sig_str_pct_dif": 0.35064431901840276,
          "avg_td_dif": 1.2593865030674847,
          "avg_td_pct_dif": -1.498106161643105,
          "atd_dif": -1.0266666666666668,
          "avg_sub_att_dif": 0.4025591586327783,
          "kd_dif": 0.06000000000000005,
          "control_time_dif": 0.6166666666666667,
          "reach_dif": 0.6481481481481481,
          "height_dif": 0.10989010989010989,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": -1,
          "win_dif": -1.1363636363636362,
          "loss_dif": 1.111111111111111,
          "total_round_dif": -1.1764705882352942,
          "deep_round_dif": -0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 0,
          "elo_dif": -0.8266129032258064,
          "layoff_dif": -0.315,
          "cardio_dif": 0.17124999999999965,
          "peak_elo_dif": 0.05454545454545454,
          "ufc_fight_count_dif": -1,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.23608779647643924,
          "wins": -5,
          "losses": 3,
          "rounds": -20,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 0,
          "height": 1,
          "reach": 7,
          "younger": 2,
          "sig_str_landed": 0.09930981595091959,
          "sig_str_accuracy": 0.035064431901840276,
          "sub_attempts": 0.2817914110429448,
          "td_landed": 1.7631411042944785,
          "td_accuracy": -0.3445644171779142,
          "elo": -0.41
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-14",
        "fighterB": "2026-05-16"
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
    "id": "1788113567606-rzyj6e",
    "createdAt": "2026-08-30T18:12:47.607Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Nathaniel Wood",
    "fighterB": "Mairon Santos",
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
    "fighterAProb": 0.6558845596327465,
    "fighterBProb": 0.3441154403672535,
    "predictedWinner": "Nathaniel Wood",
    "predictedProb": 0.6558845596327465,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4991914889099404,
    "c6ProbB": 0.5008085110900595,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Mairon Santos",
    "trackedProb": 0.5008085110900595,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-130",
    "edge": -0.041935027677336145,
    "edgeA": 0.041935027677336034,
    "edgeB": -0.041935027677336145,
    "ev": -11.395417268681776,
    "evA": 4.830212671087494,
    "evB": -11.395417268681776,
    "kelly": 0,
    "kellyA": 0.043911024282613606,
    "kellyB": 0,
    "fairLine": "-100",
    "fairLineA": "+100",
    "fairLineB": "-100",
    "oddsA": "+110",
    "oddsB": "-130",
    "v2pA": 0.5702238253187163,
    "v2pB": 0.4297761746812837,
    "projectedKO": 24,
    "projectedSUB": 11,
    "projectedDEC": 65,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:12:47.607Z",
      "targetEventDate": "2026-09-05",
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
        "pA": 0.4991914889099404,
        "pB": 0.5008085110900595
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.13260107729598705,
          "avg_sig_str_pct_dif": 0.4008794326241133,
          "avg_td_dif": 0.6842407294832827,
          "avg_td_pct_dif": 1.7612786514544145,
          "atd_dif": 0.4266666666666671,
          "avg_sub_att_dif": 0.4584240459304289,
          "kd_dif": -1.456,
          "control_time_dif": 0.5611111111111111,
          "reach_dif": -0.27777777777777773,
          "height_dif": -0.10989010989010989,
          "age_dif": -1.627906976744186,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 1.5909090909090908,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 1.7058823529411764,
          "deep_round_dif": 0.5294117647058824,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 2.142857142857143,
          "elo_dif": 0.625,
          "layoff_dif": 0.525,
          "cardio_dif": 0.5675000000000004,
          "peak_elo_dif": 0.5636363636363636,
          "ufc_fight_count_dif": 1.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.07874766602376582,
          "wins": 7,
          "losses": -3,
          "rounds": 29,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 3,
          "height": -1,
          "reach": -3,
          "younger": -7,
          "sig_str_landed": 2.0950970212765956,
          "sig_str_accuracy": 0.04008794326241133,
          "sub_attempts": 0.3208968321513002,
          "td_landed": 0.9579370212765957,
          "td_accuracy": 0.40509408983451534,
          "elo": 0.31
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-21",
        "fighterB": "2025-12-06"
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
    "id": "1788113526622-bh9bbh",
    "createdAt": "2026-08-30T18:12:06.622Z",
    "eventName": "UFC Fight Night Paris",
    "eventDate": "2026-09-05",
    "fighterA": "Nora Cornolle",
    "fighterB": "Klaudia Sygula",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Bantamweight",
    "boutContext": {
      "division": "Women's Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": null
    },
    "fighterAProb": 0.34040118833804744,
    "fighterBProb": 0.6595988116619526,
    "predictedWinner": "Klaudia Sygula",
    "predictedProb": 0.6595988116619526,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4059556056720995,
    "c6ProbB": 0.5940443943279006,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Klaudia Sygula",
    "trackedProb": 0.5940443943279006,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "+110",
    "edge": 0.1367879330952962,
    "edgeA": -0.1367879330952962,
    "edgeB": 0.1367879330952962,
    "ev": 24.74932280885912,
    "evA": -28.177085150320867,
    "evB": 24.74932280885912,
    "kelly": 0.22499384371690107,
    "kellyA": 0,
    "kellyB": 0.22499384371690107,
    "fairLine": "-146",
    "fairLineA": "+146",
    "fairLineB": "-146",
    "oddsA": "-130",
    "oddsB": "+110",
    "v2pA": 0.27228331298095815,
    "v2pB": 0.7277166870190419,
    "projectedKO": 17,
    "projectedSUB": 11,
    "projectedDEC": 72,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-30T18:12:06.626Z",
      "targetEventDate": "2026-09-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": null
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4059556056720995,
        "pB": 0.5940443943279006
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.20473456079785188,
          "avg_sig_str_pct_dif": 0.5641212121212114,
          "avg_td_dif": -0.4501731601731603,
          "avg_td_pct_dif": -0.5206851119894599,
          "atd_dif": -0.15555555555555545,
          "avg_sub_att_dif": 0.043982683982683894,
          "kd_dif": 0.5319999999999999,
          "control_time_dif": 0.005555555555555548,
          "reach_dif": -0.18518518518518517,
          "height_dif": -0.10989010989010989,
          "age_dif": -2.0930232558139537,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -2,
          "win_dif": 0.22727272727272727,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.4117647058823529,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.20161290322580644,
          "layoff_dif": 0.07,
          "cardio_dif": 0.7779166666666661,
          "peak_elo_dif": 1.2,
          "ufc_fight_count_dif": 0.375,
          "rank_tier_dif": 1.9062513654776305
        },
        "v2": {
          "modern_form": -0.34150837019689473,
          "wins": 1,
          "losses": -2,
          "rounds": 7,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 1,
          "height": -1,
          "reach": -2,
          "younger": -9,
          "sig_str_landed": -3.23480606060606,
          "sig_str_accuracy": 0.056412121212121136,
          "sub_attempts": 0.030787878787878725,
          "td_landed": -0.6302424242424244,
          "td_accuracy": -0.11975757575757577,
          "elo": 0.1
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-21",
        "fighterB": "2026-02-07"
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
