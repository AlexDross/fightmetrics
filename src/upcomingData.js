export const UPCOMING_ENTRIES = [
  {
    "id": "1792083634303-qocopj",
    "createdAt": "2026-10-15T17:00:34.303Z",
    "eventName": "UFC Fight Night: Buckley vs. Malott",
    "eventDate": "2026-10-17",
    "fighterA": "Joaquin Buckley",
    "fighterB": "Mike Malott",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
        "retrievedAt": "2026-10-15",
        "authority": "official"
      }
    },
    "fighterAProb": 0.3327622631420192,
    "fighterBProb": 0.6672377368579808,
    "predictedWinner": "Mike Malott",
    "predictedProb": 0.6672377368579808,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4080517373780926,
    "c6ProbB": 0.5919482626219075,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Mike Malott",
    "trackedProb": 0.5919482626219075,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.10668588229313136,
    "betRecommendedFighter": "Mike Malott",
    "betRecommendedOdds": "-115",
    "marketOdds": "-115",
    "edge": 0.057064541691674964,
    "edgeA": -0.05706454169167485,
    "edgeB": 0.057064541691674964,
    "ev": 10.668588229313123,
    "evA": -12.2688764637101,
    "evB": 10.668588229313123,
    "kelly": 0.12268876463710096,
    "kellyA": 0,
    "kellyB": 0.12268876463710096,
    "fairLine": "-145",
    "fairLineA": "+145",
    "fairLineB": "-145",
    "oddsA": "+115",
    "oddsB": "-115",
    "v2pA": 0.39098493971368115,
    "v2pB": 0.6090150602863189,
    "projectedKO": 52,
    "projectedSUB": 16,
    "projectedDEC": 33,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-15T17:00:34.303Z",
      "targetEventDate": "2026-10-17",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
          "retrievedAt": "2026-10-15",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4080517373780926,
        "pB": 0.5919482626219075
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.05232911392405063,
          "avg_sig_str_pct_dif": -1.8016000000000003,
          "avg_td_dif": -0.10000000000000009,
          "avg_td_pct_dif": -0.5217391304347824,
          "atd_dif": 1.0000000000000002,
          "avg_sub_att_dif": -0.7285714285714286,
          "kd_dif": 0.09199999999999986,
          "control_time_dif": -0.23888888888888882,
          "reach_dif": 0.27777777777777773,
          "height_dif": -0.32967032967032966,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": -2.857142857142857,
          "lose_streak_dif": -2,
          "win_dif": 0.9090909090909091,
          "loss_dif": -1.8518518518518516,
          "total_round_dif": 1.588235294117647,
          "deep_round_dif": 0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": 2.5,
          "sub_dif": -1.4285714285714286,
          "elo_dif": -0.4637096774193548,
          "layoff_dif": 0.105,
          "cardio_dif": 3.1004166666666673,
          "peak_elo_dif": 0.10909090909090909,
          "ufc_fight_count_dif": 1.125,
          "rank_tier_dif": 2.2868892322350685
        },
        "v2": {
          "modern_form": -0.2673114131822362,
          "wins": 4,
          "losses": -5,
          "rounds": 27,
          "title_bouts": 0,
          "ko_wins": 5,
          "sub_wins": -2,
          "height": -3,
          "reach": 3,
          "younger": 2,
          "sig_str_landed": -0.8268,
          "sig_str_accuracy": -0.18016000000000004,
          "sub_attempts": -0.51,
          "td_landed": -0.14000000000000012,
          "td_accuracy": -0.11999999999999994,
          "elo": -0.23
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-09",
        "fighterB": "2026-04-18"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6e9bcfba000ca3e7c47006630178df7b0a388c831843b1258310992bc1ca298f",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "79bea6b8113eab866f059d9ec75874e995ae0ce624702fe79832202eccfb1ace",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6281990bfa8850a1a789c46b9ed4679d08dededebf1e7e8b49fee4d874f9be49",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "da33ea19f09aaf32368f5e15dbc6918f028dd2be2d936c88b4abd8d07775363b",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 249 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2456 canonical names, and the shipped artifact contains 2456 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "c5be1affa8f51f7c3e414578fda2e7a6e3ac5d419c7096da5eaf90b9c75efd5b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "0bf786499872e799c3aaaa6acd24527aadf1c7f564ecbc16b1baebd764694d35",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792083634302-lubz6l",
    "createdAt": "2026-10-15T17:00:34.302Z",
    "eventName": "UFC Fight Night: Buckley vs. Malott",
    "eventDate": "2026-10-17",
    "fighterA": "Erin Blanchfield",
    "fighterB": "Jasmine Jasudavicius",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Flyweight",
    "boutContext": {
      "division": "Women's Flyweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
        "retrievedAt": "2026-10-15",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6131685350531664,
    "fighterBProb": 0.3868314649468336,
    "predictedWinner": "Erin Blanchfield",
    "predictedProb": 0.6131685350531664,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.8102444746303533,
    "c6ProbB": 0.18975552536964668,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Erin Blanchfield",
    "trackedProb": 0.8102444746303533,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.08772545909280316,
    "betRecommendedFighter": "Erin Blanchfield",
    "betRecommendedOdds": "-292",
    "marketOdds": "-292",
    "edge": 0.0653465154466798,
    "edgeA": 0.0653465154466798,
    "edgeB": -0.06534651544667985,
    "ev": 8.77254590928031,
    "evA": 8.77254590928031,
    "evB": -25.615834055098496,
    "kelly": 0.256158340550985,
    "kellyA": 0.256158340550985,
    "kellyB": 0,
    "fairLine": "-427",
    "fairLineA": "-427",
    "fairLineB": "+427",
    "oddsA": "-292",
    "oddsB": "+292",
    "v2pA": 0.6990741832036159,
    "v2pB": 0.3009258167963841,
    "projectedKO": 7,
    "projectedSUB": 25,
    "projectedDEC": 68,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-15T17:00:34.302Z",
      "targetEventDate": "2026-10-17",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Women's Flyweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
          "retrievedAt": "2026-10-15",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.8102444746303533,
        "pB": 0.18975552536964668
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.11962025316455696,
          "avg_sig_str_pct_dif": 0,
          "avg_td_dif": -0.3785714285714288,
          "avg_td_pct_dif": -0.4782608695652173,
          "atd_dif": 0.20000000000000018,
          "avg_sub_att_dif": 0.37142857142857144,
          "kd_dif": 0,
          "control_time_dif": -0.25,
          "reach_dif": -0.18518518518518517,
          "height_dif": -0.32967032967032966,
          "age_dif": 2.3255813953488373,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.35294117647058826,
          "deep_round_dif": -0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 1.592741935483871,
          "layoff_dif": -0.77,
          "cardio_dif": -0.5679166666666662,
          "peak_elo_dif": 1.1636363636363636,
          "ufc_fight_count_dif": -0.375,
          "rank_tier_dif": 0.4752535457646565
        },
        "v2": {
          "modern_form": 0.07107961204470159,
          "wins": -1,
          "losses": 2,
          "rounds": -6,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 1,
          "height": -3,
          "reach": -2,
          "younger": 10,
          "sig_str_landed": 1.8900000000000001,
          "sig_str_accuracy": 0,
          "sub_attempts": 0.26,
          "td_landed": -0.5300000000000002,
          "td_accuracy": -0.10999999999999999,
          "elo": 0.79
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-11-15",
        "fighterB": "2026-04-18"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6e9bcfba000ca3e7c47006630178df7b0a388c831843b1258310992bc1ca298f",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "79bea6b8113eab866f059d9ec75874e995ae0ce624702fe79832202eccfb1ace",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6281990bfa8850a1a789c46b9ed4679d08dededebf1e7e8b49fee4d874f9be49",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "da33ea19f09aaf32368f5e15dbc6918f028dd2be2d936c88b4abd8d07775363b",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 249 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2456 canonical names, and the shipped artifact contains 2456 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "c5be1affa8f51f7c3e414578fda2e7a6e3ac5d419c7096da5eaf90b9c75efd5b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "0bf786499872e799c3aaaa6acd24527aadf1c7f564ecbc16b1baebd764694d35",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792083634302-jgkr77",
    "createdAt": "2026-10-15T17:00:34.302Z",
    "eventName": "UFC Fight Night: Buckley vs. Malott",
    "eventDate": "2026-10-17",
    "fighterA": "Marc-Andre Barriault",
    "fighterB": "Kyle Daukaus",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
        "retrievedAt": "2026-10-15",
        "authority": "official"
      }
    },
    "fighterAProb": 0.2867483382579572,
    "fighterBProb": 0.7132516617420428,
    "predictedWinner": "Kyle Daukaus",
    "predictedProb": 0.7132516617420428,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3218419524781659,
    "c6ProbB": 0.6781580475218341,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Kyle Daukaus",
    "trackedProb": 0.6781580475218341,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.06790405184472714,
    "betRecommendedFighter": "Kyle Daukaus",
    "betRecommendedOdds": "-174",
    "marketOdds": "-174",
    "edge": 0.0431215511714691,
    "edgeA": -0.04312155117146915,
    "edgeB": 0.0431215511714691,
    "ev": 6.790405184472718,
    "evA": -11.815305020982542,
    "evB": 6.790405184472718,
    "kelly": 0.11815305020982533,
    "kellyA": 0,
    "kellyB": 0.11815305020982533,
    "fairLine": "-211",
    "fairLineA": "+211",
    "fairLineB": "-211",
    "oddsA": "+174",
    "oddsB": "-174",
    "v2pA": 0.39494391262135625,
    "v2pB": 0.6050560873786437,
    "projectedKO": 36,
    "projectedSUB": 25,
    "projectedDEC": 39,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-15T17:00:34.302Z",
      "targetEventDate": "2026-10-17",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
          "retrievedAt": "2026-10-15",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.3218419524781659,
        "pB": 0.6781580475218341
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.13918987341772152,
          "avg_sig_str_pct_dif": -0.3260000000000002,
          "avg_td_dif": -1.157142857142857,
          "avg_td_pct_dif": 0.21739130434782603,
          "atd_dif": -0.9333333333333327,
          "avg_sub_att_dif": -2.0571428571428574,
          "kd_dif": 0.14400000000000002,
          "control_time_dif": -0.5777777777777777,
          "reach_dif": -0.18518518518518517,
          "height_dif": -0.10989010989010989,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": 0.45454545454545453,
          "loss_dif": -1.8518518518518516,
          "total_round_dif": 1.2941176470588236,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -0.907258064516129,
          "layoff_dif": -0.635,
          "cardio_dif": -0.025000000000000022,
          "peak_elo_dif": -0.32727272727272727,
          "ufc_fight_count_dif": 0.875,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.09893393119491736,
          "wins": 2,
          "losses": -5,
          "rounds": 22,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": -1,
          "height": -1,
          "reach": -2,
          "younger": -3,
          "sig_str_landed": 2.1992000000000003,
          "sig_str_accuracy": -0.03260000000000002,
          "sub_attempts": -1.44,
          "td_landed": -1.6199999999999999,
          "td_accuracy": 0.04999999999999999,
          "elo": -0.45
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-07",
        "fighterB": "2026-06-14"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6e9bcfba000ca3e7c47006630178df7b0a388c831843b1258310992bc1ca298f",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "79bea6b8113eab866f059d9ec75874e995ae0ce624702fe79832202eccfb1ace",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6281990bfa8850a1a789c46b9ed4679d08dededebf1e7e8b49fee4d874f9be49",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "da33ea19f09aaf32368f5e15dbc6918f028dd2be2d936c88b4abd8d07775363b",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 249 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2456 canonical names, and the shipped artifact contains 2456 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "c5be1affa8f51f7c3e414578fda2e7a6e3ac5d419c7096da5eaf90b9c75efd5b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "0bf786499872e799c3aaaa6acd24527aadf1c7f564ecbc16b1baebd764694d35",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792083634301-yjvi74",
    "createdAt": "2026-10-15T17:00:34.301Z",
    "eventName": "UFC Fight Night: Buckley vs. Malott",
    "eventDate": "2026-10-17",
    "fighterA": "Mandel Nallo",
    "fighterB": "Nate Landwehr",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
        "retrievedAt": "2026-10-15",
        "authority": "official"
      }
    },
    "fighterAProb": 0.48763602315833093,
    "fighterBProb": 0.512363976841669,
    "predictedWinner": "Nate Landwehr",
    "predictedProb": 0.512363976841669,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6679939033944668,
    "c6ProbB": 0.33200609660553315,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Mandel Nallo",
    "trackedProb": 0.6679939033944668,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.06587306736470966,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-251",
    "edge": -0.0471058117052483,
    "edgeA": -0.0471058117052483,
    "edgeB": 0.047105811705248246,
    "ev": -6.587306736470964,
    "evA": -6.587306736470964,
    "evB": 16.53413990854213,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.0658730673647097,
    "fairLine": "-201",
    "fairLineA": "-201",
    "fairLineB": "+201",
    "oddsA": "-251",
    "oddsB": "+251",
    "v2pA": 0.4317352634962584,
    "v2pB": 0.5682647365037417,
    "projectedKO": 12,
    "projectedSUB": 13,
    "projectedDEC": 75,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-15T17:00:34.301Z",
      "targetEventDate": "2026-10-17",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
          "retrievedAt": "2026-10-15",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6679939033944668,
        "pB": 0.33200609660553315
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.05529827199668891,
          "avg_sig_str_pct_dif": 0.006216632152584722,
          "avg_td_dif": 0.5050927728039445,
          "avg_td_pct_dif": -0.4613039529281681,
          "atd_dif": -0.7333333333333333,
          "avg_sub_att_dif": -0.3478889321396137,
          "kd_dif": -0.33199999999999996,
          "control_time_dif": -0.35555555555555557,
          "reach_dif": 0.27777777777777773,
          "height_dif": 0.32967032967032966,
          "age_dif": 0.23255813953488372,
          "win_streak_dif": 0,
          "lose_streak_dif": 2,
          "win_dif": -1.1363636363636362,
          "loss_dif": 1.8518518518518516,
          "total_round_dif": -1.3529411764705883,
          "deep_round_dif": -0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": -1.4285714285714286,
          "elo_dif": -0.6653225806451613,
          "layoff_dif": 0.035,
          "cardio_dif": 0.5183333333333332,
          "peak_elo_dif": -1.2,
          "ufc_fight_count_dif": -1.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.2521500266080981,
          "wins": -5,
          "losses": 5,
          "rounds": -23,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": -2,
          "height": 3,
          "reach": 3,
          "younger": 1,
          "sig_str_landed": -0.8737126975476848,
          "sig_str_accuracy": 0.0006216632152584722,
          "sub_attempts": -0.24352225249772957,
          "td_landed": 0.7071298819255223,
          "td_accuracy": -0.10609990917347867,
          "elo": -0.33
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-18",
        "fighterB": "2026-04-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6e9bcfba000ca3e7c47006630178df7b0a388c831843b1258310992bc1ca298f",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "79bea6b8113eab866f059d9ec75874e995ae0ce624702fe79832202eccfb1ace",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6281990bfa8850a1a789c46b9ed4679d08dededebf1e7e8b49fee4d874f9be49",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "da33ea19f09aaf32368f5e15dbc6918f028dd2be2d936c88b4abd8d07775363b",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 249 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2456 canonical names, and the shipped artifact contains 2456 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "c5be1affa8f51f7c3e414578fda2e7a6e3ac5d419c7096da5eaf90b9c75efd5b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "0bf786499872e799c3aaaa6acd24527aadf1c7f564ecbc16b1baebd764694d35",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792083634301-rghuh7",
    "createdAt": "2026-10-15T17:00:34.301Z",
    "eventName": "UFC Fight Night: Buckley vs. Malott",
    "eventDate": "2026-10-17",
    "fighterA": "Tanner Boser",
    "fighterB": "Jhonata Diniz",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
        "retrievedAt": "2026-10-15",
        "authority": "official"
      }
    },
    "fighterAProb": 0.44467056957063095,
    "fighterBProb": 0.555329430429369,
    "predictedWinner": "Jhonata Diniz",
    "predictedProb": 0.555329430429369,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3297387568388908,
    "c6ProbB": 0.6702612431611092,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Jhonata Diniz",
    "trackedProb": 0.6702612431611092,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.007497774549895864,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-208",
    "edge": -0.005063432163566084,
    "edgeA": 0.0050634321635661395,
    "edgeB": -0.005063432163566084,
    "ev": -0.7497774549895837,
    "evA": 1.5595371063783574,
    "evB": -0.7497774549895837,
    "kelly": 0,
    "kellyA": 0.007497774549895968,
    "kellyB": 0,
    "fairLine": "-203",
    "fairLineA": "+203",
    "fairLineB": "-203",
    "oddsA": "+208",
    "oddsB": "-208",
    "v2pA": 0.4849057489117481,
    "v2pB": 0.5150942510882519,
    "projectedKO": 38,
    "projectedSUB": 6,
    "projectedDEC": 56,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-15T17:00:34.301Z",
      "targetEventDate": "2026-10-17",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
          "retrievedAt": "2026-10-15",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.3297387568388908,
        "pB": 0.6702612431611092
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.06476314625590969,
          "avg_sig_str_pct_dif": -0.2635642409638539,
          "avg_td_dif": -0.18642857142857136,
          "avg_td_pct_dif": -0.2673808276584598,
          "atd_dif": 0.1200000000000001,
          "avg_sub_att_dif": -0.13808950086058516,
          "kd_dif": 0.25599999999999995,
          "control_time_dif": 0,
          "reach_dif": -0.37037037037037035,
          "height_dif": -0.21978021978021978,
          "age_dif": 0,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0.45454545454545453,
          "loss_dif": -1.4814814814814814,
          "total_round_dif": 0.8235294117647058,
          "deep_round_dif": 0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0,
          "elo_dif": -0.2217741935483871,
          "layoff_dif": 0.945,
          "cardio_dif": -2.205833333333334,
          "peak_elo_dif": 0.3090909090909091,
          "ufc_fight_count_dif": 0.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.13683915583508166,
          "wins": 2,
          "losses": -4,
          "rounds": 14,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 0,
          "height": -2,
          "reach": -4,
          "younger": 0,
          "sig_str_landed": 1.0232577108433731,
          "sig_str_accuracy": -0.02635642409638539,
          "sub_attempts": -0.09666265060240961,
          "td_landed": -0.2609999999999999,
          "td_accuracy": -0.06149759036144575,
          "elo": -0.11
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-18",
        "fighterB": "2025-10-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6e9bcfba000ca3e7c47006630178df7b0a388c831843b1258310992bc1ca298f",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "79bea6b8113eab866f059d9ec75874e995ae0ce624702fe79832202eccfb1ace",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6281990bfa8850a1a789c46b9ed4679d08dededebf1e7e8b49fee4d874f9be49",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "da33ea19f09aaf32368f5e15dbc6918f028dd2be2d936c88b4abd8d07775363b",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 249 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2456 canonical names, and the shipped artifact contains 2456 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "c5be1affa8f51f7c3e414578fda2e7a6e3ac5d419c7096da5eaf90b9c75efd5b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "0bf786499872e799c3aaaa6acd24527aadf1c7f564ecbc16b1baebd764694d35",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792083634301-rs2isj",
    "createdAt": "2026-10-15T17:00:34.301Z",
    "eventName": "UFC Fight Night: Buckley vs. Malott",
    "eventDate": "2026-10-17",
    "fighterA": "Chad Anheliger",
    "fighterB": "Steven Koslow",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
        "retrievedAt": "2026-10-15",
        "authority": "official"
      }
    },
    "fighterAProb": 0.45911711451670595,
    "fighterBProb": 0.5408828854832941,
    "predictedWinner": "Steven Koslow",
    "predictedProb": 0.5408828854832941,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3510753711272259,
    "c6ProbB": 0.6489246288727741,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Steven Koslow",
    "trackedProb": 0.6489246288727741,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.09036995463656594,
    "betRecommendedFighter": "Steven Koslow",
    "betRecommendedOdds": "-147",
    "marketOdds": "-147",
    "edge": 0.05378292846791588,
    "edgeA": -0.05378292846791577,
    "edgeB": 0.05378292846791588,
    "ev": 9.036995463656595,
    "evA": -13.284383331575214,
    "evB": 9.036995463656595,
    "kelly": 0.13284383331575203,
    "kellyA": 0,
    "kellyB": 0.13284383331575203,
    "fairLine": "-185",
    "fairLineA": "+185",
    "fairLineB": "-185",
    "oddsA": "+147",
    "oddsB": "-147",
    "v2pA": 0.3842310798513099,
    "v2pB": 0.6157689201486901,
    "projectedKO": 20,
    "projectedSUB": 6,
    "projectedDEC": 74,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-15T17:00:34.301Z",
      "targetEventDate": "2026-10-17",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
          "retrievedAt": "2026-10-15",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.3510753711272259,
        "pB": 0.6489246288727741
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.01614826474847017,
          "avg_sig_str_pct_dif": 0.23411211808118115,
          "avg_td_dif": -1.0331576172904586,
          "avg_td_pct_dif": -0.06651050858334771,
          "atd_dif": -0.6666666666666665,
          "avg_sub_att_dif": -0.3444069583552977,
          "kd_dif": 0.5319999999999999,
          "control_time_dif": -1.9611111111111112,
          "reach_dif": -0.4629629629629629,
          "height_dif": -0.10989010989010989,
          "age_dif": -2.3255813953488373,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0.45454545454545453,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.7058823529411765,
          "deep_round_dif": 0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 0.10080645161290322,
          "layoff_dif": 3.465,
          "cardio_dif": 3.0737500000000004,
          "peak_elo_dif": 0.5818181818181818,
          "ufc_fight_count_dif": 0.5,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.33786292241789617,
          "wins": 2,
          "losses": -2,
          "rounds": 12,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": -1,
          "reach": -5,
          "younger": -10,
          "sig_str_landed": 0.2551425830258287,
          "sig_str_accuracy": 0.023411211808118115,
          "sub_attempts": -0.2410848708487084,
          "td_landed": -1.446420664206642,
          "td_accuracy": -0.015297416974169975,
          "elo": 0.05
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2024-11-02",
        "fighterB": "2022-12-10"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6e9bcfba000ca3e7c47006630178df7b0a388c831843b1258310992bc1ca298f",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "79bea6b8113eab866f059d9ec75874e995ae0ce624702fe79832202eccfb1ace",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6281990bfa8850a1a789c46b9ed4679d08dededebf1e7e8b49fee4d874f9be49",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "da33ea19f09aaf32368f5e15dbc6918f028dd2be2d936c88b4abd8d07775363b",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 249 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2456 canonical names, and the shipped artifact contains 2456 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "c5be1affa8f51f7c3e414578fda2e7a6e3ac5d419c7096da5eaf90b9c75efd5b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "0bf786499872e799c3aaaa6acd24527aadf1c7f564ecbc16b1baebd764694d35",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1792083634300-tz0ylh",
    "createdAt": "2026-10-15T17:00:34.300Z",
    "eventName": "UFC Fight Night: Buckley vs. Malott",
    "eventDate": "2026-10-17",
    "fighterA": "Melissa Croden",
    "fighterB": "Chelsea Chandler",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Bantamweight",
    "boutContext": {
      "division": "Women's Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
        "retrievedAt": "2026-10-15",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5812175546911325,
    "fighterBProb": 0.41878244530886755,
    "predictedWinner": "Melissa Croden",
    "predictedProb": 0.5812175546911325,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7595136621502911,
    "c6ProbB": 0.24048633784970885,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Melissa Croden",
    "trackedProb": 0.7595136621502911,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": 0.01962108069491153,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-292",
    "edge": 0.014615702966617627,
    "edgeA": 0.014615702966617627,
    "edgeB": -0.014615702966617683,
    "ev": 1.9621080694911406,
    "evA": 1.9621080694911406,
    "evB": -5.729355562914122,
    "kelly": 0.05729355562914134,
    "kellyA": 0.05729355562914134,
    "kellyB": 0,
    "fairLine": "-316",
    "fairLineA": "-316",
    "fairLineB": "+316",
    "oddsA": "-292",
    "oddsB": "+292",
    "v2pA": 0.5726841669785044,
    "v2pB": 0.42731583302149556,
    "projectedKO": 37,
    "projectedSUB": 15,
    "projectedDEC": 48,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-15T17:00:34.300Z",
      "targetEventDate": "2026-10-17",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Women's Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-17-2026",
          "retrievedAt": "2026-10-15",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7595136621502911,
        "pB": 0.24048633784970885
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.02987012987012984,
          "avg_sig_str_pct_dif": 0.10519480519480484,
          "avg_td_dif": 0.5961595547309834,
          "avg_td_pct_dif": -0.48198757763975164,
          "atd_dif": 1.946666666666667,
          "avg_sub_att_dif": 0.0991094619666049,
          "kd_dif": 0.22000000000000006,
          "control_time_dif": 0.4055555555555555,
          "reach_dif": 0,
          "height_dif": 0.10989010989010989,
          "age_dif": 0,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.17647058823529413,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": -0.7142857142857143,
          "elo_dif": 0.6048387096774194,
          "layoff_dif": -0.245,
          "cardio_dif": 0.26666666666666694,
          "peak_elo_dif": -0.10909090909090909,
          "ufc_fight_count_dif": -0.375,
          "rank_tier_dif": -1.8195734938548842
        },
        "v2": {
          "modern_form": 0.1387804666493191,
          "wins": -1,
          "losses": 2,
          "rounds": -3,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": -1,
          "height": 1,
          "reach": 0,
          "younger": 0,
          "sig_str_landed": 0.47194805194805145,
          "sig_str_accuracy": 0.010519480519480484,
          "sub_attempts": 0.06937662337662343,
          "td_landed": 0.8346233766233766,
          "td_accuracy": -0.11085714285714288,
          "elo": 0.3
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-18",
        "fighterB": "2026-06-06"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6e9bcfba000ca3e7c47006630178df7b0a388c831843b1258310992bc1ca298f",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "79bea6b8113eab866f059d9ec75874e995ae0ce624702fe79832202eccfb1ace",
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
          "generatorVersion": "update_fighters.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-10-03",
          "contentHash": "6281990bfa8850a1a789c46b9ed4679d08dededebf1e7e8b49fee4d874f9be49",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (791 rows); maximum event date found = 2026-10-03. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-10-08",
          "maxObservedEventDate": null,
          "contentHash": "da33ea19f09aaf32368f5e15dbc6918f028dd2be2d936c88b4abd8d07775363b",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 249 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2456 canonical names, and the shipped artifact contains 2456 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "c5be1affa8f51f7c3e414578fda2e7a6e3ac5d419c7096da5eaf90b9c75efd5b",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-10-06T22:28:29Z",
          "maxObservedEventDate": "2026-10-06",
          "contentHash": "0bf786499872e799c3aaaa6acd24527aadf1c7f564ecbc16b1baebd764694d35",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 9a7e8f5bcc4993e909d49764f93aba5733acb7f7",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
