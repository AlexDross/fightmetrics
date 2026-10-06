export const UPCOMING_ENTRIES = [
  {
    "id": "1791227105518-eq4ps2",
    "createdAt": "2026-10-05T19:05:05.518Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Brendan Allen",
    "fighterB": "Christian Leroy Duncan",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5899158021335943,
    "fighterBProb": 0.4100841978664057,
    "predictedWinner": "Brendan Allen",
    "predictedProb": 0.5899158021335943,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5890140325213722,
    "c6ProbB": 0.4109859674786278,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Brendan Allen",
    "trackedProb": 0.5890140325213722,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.07181241983397246,
    "betRecommendedFighter": "Brendan Allen",
    "betRecommendedOdds": "-122",
    "marketOdds": "-122",
    "edge": 0.04510968934020765,
    "edgeA": 0.04510968934020765,
    "edgeB": -0.04510968934020776,
    "ev": 7.181241983397236,
    "evA": 7.181241983397236,
    "evB": -10.81604505713777,
    "kelly": 0.08761115219744627,
    "kellyA": 0.08761115219744627,
    "kellyB": 0,
    "fairLine": "-143",
    "fairLineA": "-143",
    "fairLineB": "+143",
    "oddsA": "-122",
    "oddsB": "+117",
    "v2pA": 0.5890135602115973,
    "v2pB": 0.41098643978840266,
    "projectedKO": 37,
    "projectedSUB": 19,
    "projectedDEC": 44,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.519Z",
      "targetEventDate": "2026-10-10",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5890140325213722,
        "pB": 0.4109859674786278
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.04493670886075949,
          "avg_sig_str_pct_dif": -0.5999999999999994,
          "avg_td_dif": 0.7500000000000001,
          "avg_td_pct_dif": 0.9565217391304346,
          "atd_dif": -0.46666666666666634,
          "avg_sub_att_dif": 1.442857142857143,
          "kd_dif": -1.4079999999999997,
          "control_time_dif": 0.5555555555555556,
          "reach_dif": -0.37037037037037035,
          "height_dif": 0,
          "age_dif": 0.23255813953488372,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": 1.5909090909090908,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 1.4705882352941178,
          "deep_round_dif": 0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": -1.5,
          "sub_dif": 5,
          "elo_dif": 1.3306451612903225,
          "layoff_dif": -0.21,
          "cardio_dif": 0.5575000000000001,
          "peak_elo_dif": 1.2,
          "ufc_fight_count_dif": 1.125,
          "rank_tier_dif": 2.611707935929908
        },
        "v2": {
          "modern_form": -0.11418411573446041,
          "wins": 7,
          "losses": -2,
          "rounds": 25,
          "title_bouts": 0,
          "ko_wins": -3,
          "sub_wins": 7,
          "height": 0,
          "reach": -4,
          "younger": 1,
          "sig_str_landed": -0.71,
          "sig_str_accuracy": -0.05999999999999994,
          "sub_attempts": 1.01,
          "td_landed": 1.05,
          "td_accuracy": 0.21999999999999997,
          "elo": 0.66
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-06",
        "fighterB": "2026-07-18"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105518-5flvob",
    "createdAt": "2026-10-05T19:05:05.518Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Matheus Camilo",
    "fighterB": "Jai Herbert",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6321292576786023,
    "fighterBProb": 0.3678707423213977,
    "predictedWinner": "Matheus Camilo",
    "predictedProb": 0.6321292576786023,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7389333700766059,
    "c6ProbB": 0.26106662992339413,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Matheus Camilo",
    "trackedProb": 0.7389333700766059,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.15406447686121583,
    "betRecommendedFighter": "Matheus Camilo",
    "betRecommendedOdds": "-178",
    "marketOdds": "-178",
    "edge": 0.10539791001860421,
    "edgeA": 0.10539791001860421,
    "edgeB": -0.10539791001860432,
    "ev": 15.406447686121592,
    "evA": 15.406447686121592,
    "evB": -29.51200992068358,
    "kelly": 0.2742347688129643,
    "kellyA": 0.2742347688129643,
    "kellyB": 0,
    "fairLine": "-283",
    "fairLineA": "-283",
    "fairLineB": "+283",
    "oddsA": "-178",
    "oddsB": "+170",
    "v2pA": 0.7262646946394226,
    "v2pB": 0.27373530536057744,
    "projectedKO": 42,
    "projectedSUB": 7,
    "projectedDEC": 51,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.518Z",
      "targetEventDate": "2026-10-10",
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
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7389333700766059,
        "pB": 0.26106662992339413
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.010510468044010695,
          "avg_sig_str_pct_dif": 0.10003269754768229,
          "avg_td_dif": 1.5485831062670303,
          "avg_td_pct_dif": 0.9035185404572919,
          "atd_dif": -2.0000000000000004,
          "avg_sub_att_dif": 0.7839081354612687,
          "kd_dif": 0.6640000000000001,
          "control_time_dif": 1.6111111111111112,
          "reach_dif": -0.7407407407407407,
          "height_dif": -0.32967032967032966,
          "age_dif": 3.0232558139534884,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": -0.45454545454545453,
          "loss_dif": 1.4814814814814814,
          "total_round_dif": -1.0588235294117647,
          "deep_round_dif": -0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": 0.4637096774193548,
          "layoff_dif": 0.35,
          "cardio_dif": -1.95875,
          "peak_elo_dif": 0.41818181818181815,
          "ufc_fight_count_dif": -0.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.12584354027974154,
          "wins": -2,
          "losses": 4,
          "rounds": -18,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": -3,
          "reach": -8,
          "younger": 13,
          "sig_str_landed": -0.166065395095369,
          "sig_str_accuracy": 0.01000326975476823,
          "sub_attempts": 0.5487356948228881,
          "td_landed": 2.1680163487738424,
          "td_accuracy": 0.20780926430517713,
          "elo": 0.23
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-27",
        "fighterB": "2026-04-18"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105518-2n2y71",
    "createdAt": "2026-10-05T19:05:05.518Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Loopy Godinez",
    "fighterB": "Ketlen Souza",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Strawweight",
    "boutContext": {
      "division": "Women's Strawweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5712817434907632,
    "fighterBProb": 0.4287182565092368,
    "predictedWinner": "Loopy Godinez",
    "predictedProb": 0.5712817434907632,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6924026518975004,
    "c6ProbB": 0.3075973481024996,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Loopy Godinez",
    "trackedProb": 0.6924026518975004,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.03348770209331353,
    "betRecommendedFighter": "Loopy Godinez",
    "betRecommendedOdds": "-203",
    "marketOdds": "-203",
    "edge": 0.02913666536686088,
    "edgeA": 0.02913666536686088,
    "edgeB": -0.029136665366860937,
    "ev": 3.3487702093313416,
    "evA": 3.3487702093313416,
    "evB": -9.566379657865113,
    "kelly": 0.06798003524942624,
    "kellyA": 0.06798003524942624,
    "kellyB": 0,
    "fairLine": "-225",
    "fairLineA": "-225",
    "fairLineB": "+225",
    "oddsA": "-203",
    "oddsB": "+194",
    "v2pA": 0.5837586963512476,
    "v2pB": 0.41624130364875245,
    "projectedKO": 15,
    "projectedSUB": 16,
    "projectedDEC": 69,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.518Z",
      "targetEventDate": "2026-10-10",
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
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6924026518975004,
        "pB": 0.3075973481024996
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.0006265822784809577,
          "avg_sig_str_pct_dif": -0.9371999999999997,
          "avg_td_dif": 1.8142857142857145,
          "avg_td_pct_dif": 1.3043478260869563,
          "atd_dif": 1.5333333333333332,
          "avg_sub_att_dif": 0.8428571428571429,
          "kd_dif": -0.5319999999999999,
          "control_time_dif": 0.9888888888888889,
          "reach_dif": -0.18518518518518517,
          "height_dif": -0.10989010989010989,
          "age_dif": -0.23255813953488372,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -1,
          "win_dif": 1.1363636363636362,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 1.5294117647058822,
          "deep_round_dif": 0.47058823529411764,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.7258064516129032,
          "layoff_dif": -0.28,
          "cardio_dif": 0.46541666666666726,
          "peak_elo_dif": 1.0727272727272728,
          "ufc_fight_count_dif": 1,
          "rank_tier_dif": 2.611707935929908
        },
        "v2": {
          "modern_form": -0.13313159618000747,
          "wins": 5,
          "losses": -3,
          "rounds": 26,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 1,
          "height": -1,
          "reach": -2,
          "younger": -1,
          "sig_str_landed": 0.009899999999999132,
          "sig_str_accuracy": -0.09371999999999997,
          "sub_attempts": 0.59,
          "td_landed": 2.54,
          "td_accuracy": 0.3,
          "elo": 0.36
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2026-06-06"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105518-jo42x4",
    "createdAt": "2026-10-05T19:05:05.518Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Andre Fili",
    "fighterB": "Kai Kamaka III",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.4869512311699331,
    "fighterBProb": 0.5130487688300669,
    "predictedWinner": "Kai Kamaka III",
    "predictedProb": 0.5130487688300669,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5461908697282728,
    "c6ProbB": 0.4538091302717272,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Andre Fili",
    "trackedProb": 0.5461908697282728,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.08968188378621211,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-150",
    "edge": -0.047964974427571416,
    "edgeA": -0.047964974427571416,
    "edgeB": 0.047964974427571305,
    "ev": -8.9681883786212,
    "evA": -8.9681883786212,
    "evB": 10.729427786301436,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.07450991518264888,
    "fairLine": "-120",
    "fairLineA": "-120",
    "fairLineB": "+120",
    "oddsA": "-150",
    "oddsB": "+144",
    "v2pA": 0.42457698187113285,
    "v2pB": 0.5754230181288671,
    "projectedKO": 13,
    "projectedSUB": 3,
    "projectedDEC": 85,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.518Z",
      "targetEventDate": "2026-10-10",
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
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5461908697282728,
        "pB": 0.4538091302717272
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.11141139240506326,
          "avg_sig_str_pct_dif": -2.1475999999999997,
          "avg_td_dif": 0.5642857142857145,
          "avg_td_pct_dif": -0.3478260869565218,
          "atd_dif": 1.0666666666666662,
          "avg_sub_att_dif": 0,
          "kd_dif": 0.5079999999999999,
          "control_time_dif": 0.2055555555555556,
          "reach_dif": 0.4629629629629629,
          "height_dif": 0.43956043956043955,
          "age_dif": -1.1627906976744187,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": 2.5,
          "loss_dif": -3.7037037037037033,
          "total_round_dif": 2.823529411764706,
          "deep_round_dif": 0.7058823529411765,
          "total_title_bout_dif": 0,
          "ko_dif": 2,
          "sub_dif": 0,
          "elo_dif": 1.129032258064516,
          "layoff_dif": -0.105,
          "cardio_dif": -0.1408333333333331,
          "peak_elo_dif": 0.9454545454545454,
          "ufc_fight_count_dif": 2.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.04366535871514987,
          "wins": 11,
          "losses": -10,
          "rounds": 48,
          "title_bouts": 0,
          "ko_wins": 4,
          "sub_wins": 0,
          "height": 4,
          "reach": 5,
          "younger": -5,
          "sig_str_landed": -1.7602999999999995,
          "sig_str_accuracy": -0.21476,
          "sub_attempts": 0,
          "td_landed": 0.7900000000000003,
          "td_accuracy": -0.08000000000000002,
          "elo": 0.56
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-20",
        "fighterB": "2026-07-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105517-lcrreb",
    "createdAt": "2026-10-05T19:05:05.517Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Julius Walker",
    "fighterB": "Gerald Meerschaert",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Light Heavyweight",
    "boutContext": {
      "division": "Light Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6501875944107073,
    "fighterBProb": 0.3498124055892927,
    "predictedWinner": "Julius Walker",
    "predictedProb": 0.6501875944107073,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7599561341443836,
    "c6ProbB": 0.24004386585561643,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Julius Walker",
    "trackedProb": 0.7599561341443836,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.04142136901267368,
    "betRecommendedFighter": "Julius Walker",
    "betRecommendedOdds": "-270",
    "marketOdds": "-270",
    "edge": 0.03733824674652764,
    "edgeA": 0.03733824674652764,
    "edgeB": -0.03733824674652764,
    "ev": 4.142136901267367,
    "evA": 4.142136901267367,
    "evB": -14.304339889544934,
    "kelly": 0.11183769633421897,
    "kellyA": 0.11183769633421897,
    "kellyB": 0,
    "fairLine": "-317",
    "fairLineA": "-317",
    "fairLineB": "+317",
    "oddsA": "-270",
    "oddsB": "+257",
    "v2pA": 0.619965220622268,
    "v2pB": 0.380034779377732,
    "projectedKO": 12,
    "projectedSUB": 27,
    "projectedDEC": 61,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.517Z",
      "targetEventDate": "2026-10-10",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Light Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7599561341443836,
        "pB": 0.24004386585561643
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.051023797468354386,
          "avg_sig_str_pct_dif": 0.724700896969695,
          "avg_td_dif": 0.9281818181818183,
          "avg_td_pct_dif": 0.23857707509881407,
          "atd_dif": 2.8,
          "avg_sub_att_dif": -1.7619220779220781,
          "kd_dif": -0.148,
          "control_time_dif": 0.538888888888889,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0.32967032967032966,
          "age_dif": 2.558139534883721,
          "win_streak_dif": 0,
          "lose_streak_dif": 3,
          "win_dif": -2.5,
          "loss_dif": 4.0740740740740735,
          "total_round_dif": -2.6470588235294117,
          "deep_round_dif": -0.5294117647058824,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": -7.857142857142858,
          "elo_dif": -0.8266129032258064,
          "layoff_dif": 0.28,
          "cardio_dif": 0.8937499999999997,
          "peak_elo_dif": -2.2,
          "ufc_fight_count_dif": -2.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.010045095343121438,
          "wins": -11,
          "losses": 11,
          "rounds": -45,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": -11,
          "height": 3,
          "reach": 1,
          "younger": 11,
          "sig_str_landed": 0.8061759999999993,
          "sig_str_accuracy": 0.0724700896969695,
          "sub_attempts": -1.2333454545454545,
          "td_landed": 1.2994545454545456,
          "td_accuracy": 0.05487272727272724,
          "elo": -0.41
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
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105517-d1o78v",
    "createdAt": "2026-10-05T19:05:05.517Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Malcolm Wellmaker",
    "fighterB": "Otari Tanzilovi",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5388414770374896,
    "fighterBProb": 0.46115852296251036,
    "predictedWinner": "Malcolm Wellmaker",
    "predictedProb": 0.5388414770374896,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6437723386175606,
    "c6ProbB": 0.35622766138243944,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Malcolm Wellmaker",
    "trackedProb": 0.6437723386175606,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.02438624972390313,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-194",
    "edge": -0.009872635700332033,
    "edgeA": -0.009872635700332033,
    "edgeB": 0.009872635700332089,
    "ev": -2.438624972390315,
    "evA": -2.438624972390315,
    "evB": 1.8811111553776954,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.010113500835363925,
    "fairLine": "-181",
    "fairLineA": "-181",
    "fairLineB": "+181",
    "oddsA": "-194",
    "oddsB": "+186",
    "v2pA": 0.5024329730194422,
    "v2pB": 0.49756702698055777,
    "projectedKO": 42,
    "projectedSUB": 6,
    "projectedDEC": 52,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.517Z",
      "targetEventDate": "2026-10-10",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6437723386175606,
        "pB": 0.35622766138243944
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.0027036380684481377,
          "avg_sig_str_pct_dif": -0.09247948641975312,
          "avg_td_dif": -1.0035908289241626,
          "avg_td_pct_dif": -0.8700032206119167,
          "atd_dif": -0.09333333333333342,
          "avg_sub_att_dif": -0.20990476190476187,
          "kd_dif": 2.284,
          "control_time_dif": -1.9722222222222223,
          "reach_dif": 6.5740740740740735,
          "height_dif": 7.6923076923076925,
          "age_dif": 0,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": 0.45454545454545453,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 0.23529411764705882,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0,
          "elo_dif": 0.5443548387096774,
          "layoff_dif": -0.175,
          "cardio_dif": 0,
          "peak_elo_dif": 1.4545454545454546,
          "ufc_fight_count_dif": 0.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.2621951219512196,
          "wins": 2,
          "losses": -1,
          "rounds": 4,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 0,
          "height": 1,
          "reach": 1,
          "younger": 0,
          "sig_str_landed": 0.04271748148148058,
          "sig_str_accuracy": -0.009247948641975312,
          "sub_attempts": -0.1469333333333333,
          "td_landed": -1.4050271604938276,
          "td_accuracy": -0.20010074074074086,
          "elo": 0.27
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-16",
        "fighterB": "2026-06-20"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105517-lvylx6",
    "createdAt": "2026-10-05T19:05:05.517Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Francisco Prado",
    "fighterB": "Ismael Bonfim",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.3974938058485899,
    "fighterBProb": 0.60250619415141,
    "predictedWinner": "Ismael Bonfim",
    "predictedProb": 0.60250619415141,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5222838661972018,
    "c6ProbB": 0.4777161338027982,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Francisco Prado",
    "trackedProb": 0.5222838661972018,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.04456773239440359,
    "betRecommendedFighter": "Francisco Prado",
    "betRecommendedOdds": "+100",
    "marketOdds": "+100",
    "edge": 0.02713823512924063,
    "edgeA": 0.02713823512924063,
    "edgeB": -0.02713823512924063,
    "ev": 4.456773239440366,
    "evA": 4.456773239440366,
    "evB": -6.294142984835737,
    "kelly": 0.04456773239440359,
    "kellyA": 0.04456773239440359,
    "kellyB": 0,
    "fairLine": "-109",
    "fairLineA": "-109",
    "fairLineB": "+109",
    "oddsA": "+100",
    "oddsB": "-104",
    "v2pA": 0.5486934053577505,
    "v2pB": 0.45130659464224954,
    "projectedKO": 58,
    "projectedSUB": 11,
    "projectedDEC": 31,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.517Z",
      "targetEventDate": "2026-10-10",
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
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5222838661972018,
        "pB": 0.4777161338027982
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.039829384104209005,
          "avg_sig_str_pct_dif": -0.6440167120799262,
          "avg_td_dif": -0.44286363046581056,
          "avg_td_pct_dif": -0.6178967736840028,
          "atd_dif": -2.044444444444444,
          "avg_sub_att_dif": 0.8375113533151682,
          "kd_dif": -0.3,
          "control_time_dif": -0.07222222222222222,
          "reach_dif": -0.18518518518518517,
          "height_dif": 0.21978021978021978,
          "age_dif": 1.3953488372093024,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": -0.22727272727272727,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 0.35294117647058826,
          "deep_round_dif": 0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": 0.42338709677419356,
          "layoff_dif": -0.525,
          "cardio_dif": -0.5087499999999999,
          "peak_elo_dif": -0.3090909090909091,
          "ufc_fight_count_dif": 0,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.04326047358834248,
          "wins": -1,
          "losses": -1,
          "rounds": 6,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 2,
          "reach": -2,
          "younger": 6,
          "sig_str_landed": -0.6293042688465023,
          "sig_str_accuracy": -0.06440167120799262,
          "sub_attempts": 0.5862579473206178,
          "td_landed": -0.6200090826521347,
          "td_accuracy": -0.14211625794732063,
          "elo": 0.21
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2026-07-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105516-cd0g35",
    "createdAt": "2026-10-05T19:05:05.516Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Niko Price",
    "fighterB": "Leon Shahbazyan",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6414415416126202,
    "fighterBProb": 0.35855845838737976,
    "predictedWinner": "Niko Price",
    "predictedProb": 0.6414415416126202,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.469283788163269,
    "c6ProbB": 0.530716211836731,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Leon Shahbazyan",
    "trackedProb": 0.530716211836731,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.11547298027211506,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-150",
    "edge": -0.0634396323191132,
    "edgeA": 0.06343963231911309,
    "edgeB": -0.0634396323191132,
    "ev": -11.547298027211504,
    "evA": 14.505244311837629,
    "evB": -11.547298027211504,
    "kelly": 0,
    "kellyA": 0.1007308632766502,
    "kellyB": 0,
    "fairLine": "-113",
    "fairLineA": "+113",
    "fairLineB": "-113",
    "oddsA": "+144",
    "oddsB": "-150",
    "v2pA": 0.6029075350681412,
    "v2pB": 0.3970924649318588,
    "projectedKO": 22,
    "projectedSUB": 11,
    "projectedDEC": 67,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.516Z",
      "targetEventDate": "2026-10-10",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.469283788163269,
        "pB": 0.530716211836731
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.043355616263070954,
          "avg_sig_str_pct_dif": -0.021899434782605698,
          "avg_td_dif": -0.2486948240165635,
          "avg_td_pct_dif": -0.07015752993068572,
          "atd_dif": -0.6666666666666665,
          "avg_sub_att_dif": 0.2458903726708073,
          "kd_dif": 0.7799999999999999,
          "control_time_dif": 0.36666666666666664,
          "reach_dif": 7.037037037037036,
          "height_dif": 7.912087912087912,
          "age_dif": 0,
          "win_streak_dif": 0,
          "lose_streak_dif": -3,
          "win_dif": 1.8181818181818181,
          "loss_dif": -3.7037037037037033,
          "total_round_dif": 2.3529411764705883,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": 2,
          "sub_dif": 1.4285714285714286,
          "elo_dif": 0.34274193548387094,
          "layoff_dif": -0.42,
          "cardio_dif": 4.166666666666667,
          "peak_elo_dif": 2.381818181818182,
          "ufc_fight_count_dif": 2.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.11906647102793391,
          "wins": 8,
          "losses": -10,
          "rounds": 40,
          "title_bouts": 0,
          "ko_wins": 4,
          "sub_wins": 2,
          "height": 3,
          "reach": 6,
          "younger": 0,
          "sig_str_landed": 0.685018736956521,
          "sig_str_accuracy": -0.00218994347826057,
          "sub_attempts": 0.1721232608695651,
          "td_landed": -0.3481727536231889,
          "td_accuracy": -0.016136231884057717,
          "elo": 0.17
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-28",
        "fighterB": "2026-06-20"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105516-duvnvn",
    "createdAt": "2026-10-05T19:05:05.516Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Felipe Franco",
    "fighterB": "Brendson Ribeiro",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Light Heavyweight",
    "boutContext": {
      "division": "Light Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.7576941823632583,
    "fighterBProb": 0.24230581763674175,
    "predictedWinner": "Felipe Franco",
    "predictedProb": 0.7576941823632583,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.830727211073479,
    "c6ProbB": 0.16927278892652098,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Felipe Franco",
    "trackedProb": 0.830727211073479,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.09278626819445046,
    "betRecommendedFighter": "Felipe Franco",
    "betRecommendedOdds": "-317",
    "marketOdds": "-317",
    "edge": 0.07820495588060072,
    "edgeA": 0.07820495588060072,
    "edgeB": -0.07820495588060064,
    "ev": 9.278626819445037,
    "evA": 9.278626819445037,
    "evB": -32.29088442939161,
    "kelly": 0.2941324701764076,
    "kellyA": 0.2941324701764076,
    "kellyB": 0,
    "fairLine": "-491",
    "fairLineA": "-491",
    "fairLineB": "+491",
    "oddsA": "-317",
    "oddsB": "+300",
    "v2pA": 0.7366283704036503,
    "v2pB": 0.26337162959634974,
    "projectedKO": 45,
    "projectedSUB": 20,
    "projectedDEC": 35,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.516Z",
      "targetEventDate": "2026-10-10",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Light Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.830727211073479,
        "pB": 0.16927278892652098
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.07869198312236282,
          "avg_sig_str_pct_dif": 1.3341414141414114,
          "avg_td_dif": 0.6588744588744588,
          "avg_td_pct_dif": -0.1820816864295126,
          "atd_dif": 3.2,
          "avg_sub_att_dif": -0.0603463203463202,
          "kd_dif": 1.5999999999999999,
          "control_time_dif": 0.3888888888888889,
          "reach_dif": -0.4629629629629629,
          "height_dif": -0.21978021978021978,
          "age_dif": 1.1627906976744187,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 4,
          "win_dif": -0.22727272727272727,
          "loss_dif": 1.8518518518518516,
          "total_round_dif": -0.5882352941176471,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": 2.5,
          "layoff_dif": -0.035,
          "cardio_dif": -0.11666666666666678,
          "peak_elo_dif": 0.38181818181818183,
          "ufc_fight_count_dif": -0.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.30269864560166604,
          "wins": -1,
          "losses": 5,
          "rounds": -10,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": -1,
          "height": -2,
          "reach": -5,
          "younger": 5,
          "sig_str_landed": 1.2433333333333327,
          "sig_str_accuracy": 0.13341414141414115,
          "sub_attempts": -0.04224242424242414,
          "td_landed": 0.9224242424242424,
          "td_accuracy": -0.041878787878787904,
          "elo": 1.24
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-18",
        "fighterB": "2026-07-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105516-shbt7y",
    "createdAt": "2026-10-05T19:05:05.516Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Allen Frye Jr.",
    "fighterB": "RJ Harris",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.392073532853138,
    "fighterBProb": 0.607926467146862,
    "predictedWinner": "RJ Harris",
    "predictedProb": 0.607926467146862,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.23727715022911436,
    "c6ProbB": 0.7627228497708857,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "RJ Harris",
    "trackedProb": 0.7627228497708857,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.059502168747884054,
    "betRecommendedFighter": "RJ Harris",
    "betRecommendedOdds": "-257",
    "marketOdds": "-257",
    "edge": 0.04978110571106176,
    "edgeA": -0.04978110571106173,
    "edgeB": 0.04978110571106176,
    "ev": 5.950216874788396,
    "evA": -18.13938317095554,
    "evB": 5.950216874788396,
    "kelly": 0.15292057368206174,
    "kellyA": 0,
    "kellyB": 0.15292057368206174,
    "fairLine": "-321",
    "fairLineA": "+321",
    "fairLineB": "-321",
    "oddsA": "+245",
    "oddsB": "-257",
    "v2pA": 0.3548862564421344,
    "v2pB": 0.6451137435578655,
    "projectedKO": 56,
    "projectedSUB": 6,
    "projectedDEC": 38,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.516Z",
      "targetEventDate": "2026-10-10",
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
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.23727715022911436,
        "pB": 0.7627228497708857
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.05888014844186875,
          "avg_sig_str_pct_dif": -0.3909260080321286,
          "avg_td_dif": -0.1256626506024096,
          "avg_td_pct_dif": -0.180034922297887,
          "atd_dif": 0,
          "avg_sub_att_dif": -0.09236947791164661,
          "kd_dif": -8,
          "control_time_dif": 0,
          "reach_dif": 7.4074074074074066,
          "height_dif": 8.461538461538462,
          "age_dif": 0,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": -1,
          "win_dif": -0.22727272727272727,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 0.11764705882352941,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": -1.3709677419354838,
          "layoff_dif": -1.085,
          "cardio_dif": 0,
          "peak_elo_dif": -0.8,
          "ufc_fight_count_dif": 0,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.8,
          "wins": -1,
          "losses": -1,
          "rounds": 2,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": 8,
          "reach": 10,
          "younger": 0,
          "sig_str_landed": -0.9303063453815263,
          "sig_str_accuracy": -0.03909260080321286,
          "sub_attempts": -0.06465863453815263,
          "td_landed": -0.17592771084337344,
          "td_accuracy": -0.041408032128514016,
          "elo": -0.68
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-13",
        "fighterB": "2026-07-18"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105515-x5l0hf",
    "createdAt": "2026-10-05T19:05:05.515Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Alice Pereira",
    "fighterB": "Daria Zhelezniakova",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Bantamweight",
    "boutContext": {
      "division": "Women's Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.588567360320811,
    "fighterBProb": 0.41143263967918897,
    "predictedWinner": "Alice Pereira",
    "predictedProb": 0.588567360320811,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6350407802679608,
    "c6ProbB": 0.36495921973203915,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Alice Pereira",
    "trackedProb": 0.6350407802679608,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.11251505114612681,
    "betRecommendedFighter": "Alice Pereira",
    "betRecommendedOdds": "-133",
    "marketOdds": "-133",
    "edge": 0.07062807532694282,
    "edgeA": 0.07062807532694282,
    "edgeB": -0.07062807532694265,
    "ev": 11.25150511461269,
    "evA": 11.25150511461269,
    "evB": -17.15425712082711,
    "kelly": 0.14964501802434874,
    "kellyA": 0.14964501802434874,
    "kellyB": 0,
    "fairLine": "-174",
    "fairLineA": "-174",
    "fairLineB": "+174",
    "oddsA": "-133",
    "oddsB": "+127",
    "v2pA": 0.6396716485704496,
    "v2pB": 0.36032835142955044,
    "projectedKO": 41,
    "projectedSUB": 6,
    "projectedDEC": 54,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.515Z",
      "targetEventDate": "2026-10-10",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Women's Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6350407802679608,
        "pB": 0.36495921973203915
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.020421475149323236,
          "avg_sig_str_pct_dif": 0.15796709956710064,
          "avg_td_dif": 0.1745516388373532,
          "avg_td_pct_dif": -2.3975155279503104,
          "atd_dif": 0.777777777777778,
          "avg_sub_att_dif": 0.1937538651824367,
          "kd_dif": 1.5999999999999999,
          "control_time_dif": -0.2,
          "reach_dif": 0.27777777777777773,
          "height_dif": -0.10989010989010989,
          "age_dif": 2.3255813953488373,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 1,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": -0.29411764705882354,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 0.5846774193548387,
          "layoff_dif": -0.07,
          "cardio_dif": 0.37083333333333324,
          "peak_elo_dif": -0.23636363636363636,
          "ufc_fight_count_dif": -0.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.08888888888888885,
          "wins": -1,
          "losses": 1,
          "rounds": -5,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": -1,
          "reach": 3,
          "younger": 10,
          "sig_str_landed": -0.32265930735930715,
          "sig_str_accuracy": 0.015796709956710064,
          "sub_attempts": 0.13562770562770568,
          "td_landed": 0.24437229437229446,
          "td_accuracy": -0.5514285714285714,
          "elo": 0.29
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-04",
        "fighterB": "2026-04-18"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1791227105515-gznpb6",
    "createdAt": "2026-10-05T19:05:05.515Z",
    "eventName": "UFC Fight Night: Allen vs. Duncan",
    "eventDate": "2026-10-10",
    "fighterA": "Ernesta Kareckaite",
    "fighterB": "Melissa Gatto",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Flyweight",
    "boutContext": {
      "division": "Women's Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
        "retrievedAt": "2026-10-05",
        "authority": "official"
      }
    },
    "fighterAProb": 0.48163894346470704,
    "fighterBProb": 0.518361056535293,
    "predictedWinner": "Melissa Gatto",
    "predictedProb": 0.518361056535293,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4727270929562824,
    "c6ProbB": 0.5272729070437177,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Melissa Gatto",
    "trackedProb": 0.5272729070437177,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": 0.015488561713826732,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-108",
    "edge": 0.012891136404942882,
    "edgeA": -0.012891136404942827,
    "edgeB": 0.012891136404942882,
    "ev": 1.548856171382667,
    "evA": -3.563673036918395,
    "evB": 1.548856171382667,
    "kelly": 0.01672764665093281,
    "kellyA": 0,
    "kellyB": 0.01672764665093281,
    "fairLine": "-112",
    "fairLineA": "+112",
    "fairLineB": "-112",
    "oddsA": "+104",
    "oddsB": "-108",
    "v2pA": 0.4744565667499567,
    "v2pB": 0.5255434332500433,
    "projectedKO": 40,
    "projectedSUB": 7,
    "projectedDEC": 53,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-05T19:05:05.515Z",
      "targetEventDate": "2026-10-10",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Women's Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-10-2026",
          "retrievedAt": "2026-10-05",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4727270929562824,
        "pB": 0.5272729070437177
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.08183030528667158,
          "avg_sig_str_pct_dif": -0.8535303529411764,
          "avg_td_dif": -0.6019495798319326,
          "avg_td_pct_dif": 1.256061381074169,
          "atd_dif": 0.9733333333333335,
          "avg_sub_att_dif": -0.29078991596638665,
          "kd_dif": -1.412,
          "control_time_dif": -0.1722222222222222,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0.43956043956043955,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -0.45454545454545453,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": -0.47058823529411764,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": -1.5,
          "sub_dif": 0,
          "elo_dif": -1.1088709677419355,
          "layoff_dif": -0.175,
          "cardio_dif": 3.797083333333333,
          "peak_elo_dif": -1.290909090909091,
          "ufc_fight_count_dif": -0.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.07105559892445135,
          "wins": -2,
          "losses": 1,
          "rounds": -8,
          "title_bouts": 0,
          "ko_wins": -3,
          "sub_wins": 0,
          "height": 4,
          "reach": 2,
          "younger": 2,
          "sig_str_landed": 1.2929188235294111,
          "sig_str_accuracy": -0.08535303529411764,
          "sub_attempts": -0.20355294117647066,
          "td_landed": -0.8427294117647057,
          "td_accuracy": 0.28889411764705886,
          "elo": -0.55
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-28",
        "fighterB": "2026-04-04"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "558a35c80b9e8f3fb8daa5a018fa87b55a18a9fe442e6621b9b259ec8ee66304",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "0109f635e581abdc609b3251b80eed7c021f99cccf7749af92bc691fc7dd4ed6",
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
          "generatorVersion": "update_fighters.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-09-26",
          "contentHash": "3787a2e517d50097ebab9984630634c53a5451ae7d4ce8dbc82ecffd489a3172",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (790 rows); maximum event date found = 2026-09-26. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-30",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 762cb4225e65a7d39457b3c4f11fde626b4ae40d",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; produced 2207 canonical names, and the shipped artifact contains 2207 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "0bddf0f805b7a0ae0b381b520fa018e736cdd7926ae1e34cb31515867e05df9b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-02T21:19:20Z",
          "maxObservedEventDate": "2026-09-29",
          "contentHash": "3dac3fe51cf06f8db66b516bfa28ddbc7a56a9ede96bd58c93eefd7588b2ce86",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 0a5351c429a9105dff8c6da5977fd7882dc9f647",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
