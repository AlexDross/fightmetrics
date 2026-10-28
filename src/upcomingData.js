export const UPCOMING_ENTRIES = [
  {
    "id": "1793147586472-o6feuw",
    "createdAt": "2026-10-28T00:33:06.472Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Renato Moicano",
    "fighterB": "Tom Nolan",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.524174994032204,
    "fighterBProb": 0.475825005967796,
    "predictedWinner": "Renato Moicano",
    "predictedProb": 0.524174994032204,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.47106607269715156,
    "c6ProbB": 0.5289339273028484,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Tom Nolan",
    "trackedProb": 0.5289339273028484,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.137207943701124,
    "betRecommendedFighter": "Tom Nolan",
    "betRecommendedOdds": "+115",
    "marketOdds": "+115",
    "edge": 0.06381764823308095,
    "edgeA": -0.06381764823308095,
    "edgeB": 0.06381764823308095,
    "ev": 13.7207943701124,
    "evA": -11.931125539228184,
    "evB": 13.7207943701124,
    "kelly": 0.11931125539228174,
    "kellyA": 0,
    "kellyB": 0.11931125539228174,
    "fairLine": "-112",
    "fairLineA": "+112",
    "fairLineB": "-112",
    "oddsA": "-115",
    "oddsB": "+115",
    "v2pA": 0.3901396316558027,
    "v2pB": 0.6098603683441973,
    "projectedKO": 22,
    "projectedSUB": 25,
    "projectedDEC": 53,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.473Z",
      "targetEventDate": "2026-10-31",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.47106607269715156,
        "pB": 0.5289339273028484
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.02455765184699752,
          "avg_sig_str_pct_dif": 0.43993460490463265,
          "avg_td_dif": 0.34574542623588944,
          "avg_td_pct_dif": 0.5075464992299492,
          "atd_dif": -0.31999999999999956,
          "avg_sub_att_dif": -0.937493188010899,
          "kd_dif": -0.296,
          "control_time_dif": 0.11666666666666664,
          "reach_dif": -0.09259259259259259,
          "height_dif": -0.43956043956043955,
          "age_dif": -2.558139534883721,
          "win_streak_dif": -2.857142857142857,
          "lose_streak_dif": 0,
          "win_dif": 1.8181818181818181,
          "loss_dif": -2.222222222222222,
          "total_round_dif": 1.8235294117647058,
          "deep_round_dif": 0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 4.285714285714286,
          "elo_dif": 1.411290322580645,
          "layoff_dif": -0.315,
          "cardio_dif": 2.110833333333334,
          "peak_elo_dif": 1.3636363636363635,
          "ufc_fight_count_dif": 1.75,
          "rank_tier_dif": 2.0895317099709594
        },
        "v2": {
          "modern_form": -0.24611046944451848,
          "wins": 8,
          "losses": -6,
          "rounds": 31,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 6,
          "height": -4,
          "reach": -1,
          "younger": -11,
          "sig_str_landed": -0.3880108991825608,
          "sig_str_accuracy": 0.043993460490463265,
          "sub_attempts": -0.6562452316076293,
          "td_landed": 0.4840435967302452,
          "td_accuracy": 0.11673569482288831,
          "elo": 0.7
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-04",
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
  },
  {
    "id": "1793147586475-xrbxuh",
    "createdAt": "2026-10-28T00:33:06.475Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Randy Brown",
    "fighterB": "Jacobe Smith",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.3137748989615165,
    "fighterBProb": 0.6862251010384834,
    "predictedWinner": "Jacobe Smith",
    "predictedProb": 0.6862251010384834,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.22322757064456386,
    "c6ProbB": 0.7767724293554361,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Jacobe Smith",
    "trackedProb": 0.7767724293554361,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.09382240052092028,
    "betRecommendedFighter": "Jacobe Smith",
    "betRecommendedOdds": "-245",
    "marketOdds": "-245",
    "edge": 0.06662750181920418,
    "edgeA": -0.06662750181920427,
    "edgeB": 0.06662750181920418,
    "ev": 9.382240052092023,
    "evA": -22.986488127625464,
    "evB": 9.382240052092023,
    "kelly": 0.22986488127625454,
    "kellyA": 0,
    "kellyB": 0.22986488127625454,
    "fairLine": "-348",
    "fairLineA": "+348",
    "fairLineB": "-348",
    "oddsA": "+245",
    "oddsB": "-245",
    "v2pA": 0.31751793629032266,
    "v2pB": 0.6824820637096773,
    "projectedKO": 56,
    "projectedSUB": 21,
    "projectedDEC": 23,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.475Z",
      "targetEventDate": "2026-10-31",
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
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.22322757064456386,
        "pB": 0.7767724293554361
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.0717096134108793,
          "avg_sig_str_pct_dif": -0.5864612612612607,
          "avg_td_dif": -1.4166054054054056,
          "avg_td_pct_dif": -0.7075440658049338,
          "atd_dif": 0.044444444444443995,
          "avg_sub_att_dif": -0.1922558558558561,
          "kd_dif": -4.196,
          "control_time_dif": -2.6444444444444444,
          "reach_dif": 0.5555555555555555,
          "height_dif": 0.5494505494505495,
          "age_dif": -1.3953488372093024,
          "win_streak_dif": -2.857142857142857,
          "lose_streak_dif": -2,
          "win_dif": 2.2727272727272725,
          "loss_dif": -2.962962962962963,
          "total_round_dif": 2.823529411764706,
          "deep_round_dif": 0.7058823529411765,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 1.4285714285714286,
          "elo_dif": -0.282258064516129,
          "layoff_dif": -0.875,
          "cardio_dif": 0.8566666666666667,
          "peak_elo_dif": 0.6181818181818182,
          "ufc_fight_count_dif": 2.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.48481246673987743,
          "wins": 10,
          "losses": -8,
          "rounds": 48,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 2,
          "height": 5,
          "reach": 6,
          "younger": -6,
          "sig_str_landed": -1.133011891891893,
          "sig_str_accuracy": -0.058646126126126075,
          "sub_attempts": -0.13457909909909926,
          "td_landed": -1.9832475675675676,
          "td_accuracy": -0.16273513513513477,
          "elo": -0.14
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2026-10-03"
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
    "id": "1793147586473-40oge9",
    "createdAt": "2026-10-28T00:33:06.473Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Ode Osbourne",
    "fighterB": "Cody Durden",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.38788794726824516,
    "fighterBProb": 0.6121120527317548,
    "predictedWinner": "Cody Durden",
    "predictedProb": 0.6121120527317548,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4153895459031239,
    "c6ProbB": 0.5846104540968762,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Cody Durden",
    "trackedProb": 0.5846104540968762,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.14673589072848792,
    "betRecommendedFighter": "Cody Durden",
    "betRecommendedOdds": "-104",
    "marketOdds": "-104",
    "edge": 0.07480653252824876,
    "edgeA": -0.07480653252824865,
    "edgeB": 0.07480653252824876,
    "ev": 14.673589072848785,
    "evA": -15.26053263576273,
    "evB": 14.673589072848785,
    "kelly": 0.1526053263576274,
    "kellyA": 0,
    "kellyB": 0.1526053263576274,
    "fairLine": "-141",
    "fairLineA": "+141",
    "fairLineB": "-141",
    "oddsA": "+104",
    "oddsB": "-104",
    "v2pA": 0.36418440333766783,
    "v2pB": 0.6358155966623322,
    "projectedKO": 31,
    "projectedSUB": 10,
    "projectedDEC": 59,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.473Z",
      "targetEventDate": "2026-10-31",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4153895459031239,
        "pB": 0.5846104540968762
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.03571518987341771,
          "avg_sig_str_pct_dif": -0.5008000000000001,
          "avg_td_dif": -2.1285714285714286,
          "avg_td_pct_dif": -0.9565217391304346,
          "atd_dif": 0.6666666666666665,
          "avg_sub_att_dif": -0.4857142857142857,
          "kd_dif": 0.756,
          "control_time_dif": -1.2,
          "reach_dif": 0.5555555555555555,
          "height_dif": 0,
          "age_dif": 0.23255813953488372,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": -0.45454545454545453,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": -0.8235294117647058,
          "deep_round_dif": -0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -0.3629032258064516,
          "layoff_dif": -0.7,
          "cardio_dif": 0.4025000000000001,
          "peak_elo_dif": -0.5636363636363636,
          "ufc_fight_count_dif": -0.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.019239192959466495,
          "wins": -2,
          "losses": 1,
          "rounds": -14,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": -1,
          "height": 0,
          "reach": 6,
          "younger": 1,
          "sig_str_landed": -0.5642999999999998,
          "sig_str_accuracy": -0.05008000000000001,
          "sub_attempts": -0.33999999999999997,
          "td_landed": -2.98,
          "td_accuracy": -0.21999999999999997,
          "elo": -0.18
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-21",
        "fighterB": "2026-07-11"
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
    "id": "1793147586474-rnuj8d",
    "createdAt": "2026-10-28T00:33:06.474Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Yana Santos",
    "fighterB": "Luana Santos",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Bantamweight",
    "boutContext": {
      "division": "Women's Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.29523301725515355,
    "fighterBProb": 0.7047669827448464,
    "predictedWinner": "Luana Santos",
    "predictedProb": 0.7047669827448464,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.22717821548880635,
    "c6ProbB": 0.7728217845111937,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Luana Santos",
    "trackedProb": 0.7728217845111937,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.09617817970416165,
    "betRecommendedFighter": "Luana Santos",
    "betRecommendedOdds": "-239",
    "marketOdds": "-239",
    "edge": 0.06780703524865683,
    "edgeA": -0.06780703524865678,
    "edgeB": 0.06780703524865683,
    "ev": 9.61781797041617,
    "evA": -22.986584949294638,
    "evB": 9.61781797041617,
    "kelly": 0.22986584949294647,
    "kellyA": 0,
    "kellyB": 0.22986584949294647,
    "fairLine": "-340",
    "fairLineA": "+340",
    "fairLineB": "-340",
    "oddsA": "+239",
    "oddsB": "-239",
    "v2pA": 0.3174179759024965,
    "v2pB": 0.6825820240975036,
    "projectedKO": 10,
    "projectedSUB": 12,
    "projectedDEC": 78,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.474Z",
      "targetEventDate": "2026-10-31",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Women's Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.22717821548880635,
        "pB": 0.7728217845111937
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.11898734177215191,
          "avg_sig_str_pct_dif": 0.39999999999999925,
          "avg_td_dif": -0.9714285714285715,
          "avg_td_pct_dif": 0.3913043478260868,
          "atd_dif": -2.2666666666666666,
          "avg_sub_att_dif": -1.2428571428571429,
          "kd_dif": -0.5,
          "control_time_dif": -0.5111111111111112,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0,
          "age_dif": -2.3255813953488373,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0.22727272727272727,
          "loss_dif": -1.4814814814814814,
          "total_round_dif": 0.9411764705882353,
          "deep_round_dif": 0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": -1.4285714285714286,
          "elo_dif": -2.278225806451613,
          "layoff_dif": -1.295,
          "cardio_dif": 0.45916666666666656,
          "peak_elo_dif": -1.9636363636363636,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0.9921996500752139
        },
        "v2": {
          "modern_form": -0.13652154850615694,
          "wins": 1,
          "losses": -4,
          "rounds": 16,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": -2,
          "height": 0,
          "reach": 1,
          "younger": -10,
          "sig_str_landed": 1.8800000000000003,
          "sig_str_accuracy": 0.039999999999999925,
          "sub_attempts": -0.87,
          "td_landed": -1.36,
          "td_accuracy": 0.08999999999999997,
          "elo": -1.13
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-10-04",
        "fighterB": "2026-06-20"
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
    "id": "1793147586475-5xftdx",
    "createdAt": "2026-10-28T00:33:06.475Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Jean-Paul Lebosnoyani",
    "fighterB": "Farman Hasanov",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.591057235850677,
    "fighterBProb": 0.40894276414932296,
    "predictedWinner": "Jean-Paul Lebosnoyani",
    "predictedProb": 0.591057235850677,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7318638792311591,
    "c6ProbB": 0.26813612076884086,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Jean-Paul Lebosnoyani",
    "trackedProb": 0.7318638792311591,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": 0.009085045606598285,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-264",
    "edge": 0.006589153956433891,
    "edgeA": 0.006589153956433891,
    "edgeB": -0.006589153956433891,
    "ev": 0.9085045606598285,
    "evA": 0.9085045606598285,
    "evB": -2.398452040141933,
    "kelly": 0.023984520401419466,
    "kellyA": 0.023984520401419466,
    "kellyB": 0,
    "fairLine": "-273",
    "fairLineA": "-273",
    "fairLineB": "+273",
    "oddsA": "-264",
    "oddsB": "+264",
    "v2pA": 0.5489534313759927,
    "v2pB": 0.45104656862400727,
    "projectedKO": 0,
    "projectedSUB": 4,
    "projectedDEC": 96,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.475Z",
      "targetEventDate": "2026-10-31",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7318638792311591,
        "pB": 0.26813612076884086
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.03211876154635649,
          "avg_sig_str_pct_dif": -0.0969783783783773,
          "avg_td_dif": -1.7871244787644793,
          "avg_td_pct_dif": -0.04269800235017604,
          "atd_dif": -1.6,
          "avg_sub_att_dif": 1.0066089575289574,
          "kd_dif": 0,
          "control_time_dif": -4.205555555555556,
          "reach_dif": 6.666666666666666,
          "height_dif": 7.802197802197803,
          "age_dif": 0.9302325581395349,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 0.22727272727272727,
          "loss_dif": 0,
          "total_round_dif": 0.17647058823529413,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": 0.6653225806451613,
          "layoff_dif": 0.105,
          "cardio_dif": 0,
          "peak_elo_dif": 0.6,
          "ufc_fight_count_dif": 0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0,
          "wins": 1,
          "losses": 0,
          "rounds": 3,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 2,
          "reach": 2,
          "younger": 4,
          "sig_str_landed": 0.5074764324324326,
          "sig_str_accuracy": -0.00969783783783773,
          "sub_attempts": 0.7046262702702701,
          "td_landed": -2.5019742702702708,
          "td_accuracy": -0.00982054054054049,
          "elo": 0.33
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-18",
        "fighterB": "2026-06-27"
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
    "id": "1793147586473-57ilif",
    "createdAt": "2026-10-28T00:33:06.473Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Dakota Hope",
    "fighterB": "Francis Marshall",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.2855645880589355,
    "fighterBProb": 0.7144354119410645,
    "predictedWinner": "Francis Marshall",
    "predictedProb": 0.7144354119410645,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3093724709456897,
    "c6ProbB": 0.6906275290543102,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Francis Marshall",
    "trackedProb": 0.6906275290543102,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.030838134499783232,
    "betRecommendedFighter": "Francis Marshall",
    "betRecommendedOdds": "-203",
    "marketOdds": "-203",
    "edge": 0.02066053235464027,
    "edgeA": -0.020660532354640326,
    "edgeB": 0.02066053235464027,
    "ev": 3.0838134499783294,
    "evA": -6.260141303456024,
    "evB": 3.0838134499783294,
    "kelly": 0.06260141303456007,
    "kellyA": 0,
    "kellyB": 0.06260141303456007,
    "fairLine": "-223",
    "fairLineA": "+223",
    "fairLineB": "-223",
    "oddsA": "+203",
    "oddsB": "-203",
    "v2pA": 0.43235230722800916,
    "v2pB": 0.5676476927719909,
    "projectedKO": 13,
    "projectedSUB": 9,
    "projectedDEC": 78,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.473Z",
      "targetEventDate": "2026-10-31",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.3093724709456897,
        "pB": 0.6906275290543102
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.12908663237841433,
          "avg_sig_str_pct_dif": 1.3305396210526326,
          "avg_td_dif": -0.4013501754385965,
          "avg_td_pct_dif": -0.39901754385964916,
          "atd_dif": -1.333333333333334,
          "avg_sub_att_dif": -0.22458506265664163,
          "kd_dif": -0.5,
          "control_time_dif": -0.4833333333333333,
          "reach_dif": -0.37037037037037035,
          "height_dif": -0.32967032967032966,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -1,
          "win_dif": -0.9090909090909091,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.7647058823529411,
          "deep_round_dif": -0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -0.9879032258064516,
          "layoff_dif": -0.105,
          "cardio_dif": -2.9287500000000004,
          "peak_elo_dif": -0.6181818181818182,
          "ufc_fight_count_dif": -0.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.5211577395895758,
          "wins": -4,
          "losses": 2,
          "rounds": -13,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": -1,
          "height": -3,
          "reach": -4,
          "younger": -2,
          "sig_str_landed": 2.0395687915789464,
          "sig_str_accuracy": 0.13305396210526327,
          "sub_attempts": -0.15720954385964914,
          "td_landed": -0.5618902456140351,
          "td_accuracy": -0.09177403508771931,
          "elo": -0.49
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-04",
        "fighterB": "2026-04-25"
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
    "id": "1793147586475-2yob3g",
    "createdAt": "2026-10-28T00:33:06.475Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Theodor Berggren",
    "fighterB": "Rodrigo Sezinando",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5462218703489468,
    "fighterBProb": 0.45377812965105324,
    "predictedWinner": "Theodor Berggren",
    "predictedProb": 0.5462218703489468,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.42757814503959696,
    "c6ProbB": 0.572421854960403,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Rodrigo Sezinando",
    "trackedProb": 0.572421854960403,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.04596357506599513,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-150",
    "edge": -0.02757814503959699,
    "edgeA": 0.027578145039596935,
    "edgeB": -0.02757814503959699,
    "ev": -4.59635750659951,
    "evA": 6.8945362598992475,
    "evB": -4.59635750659951,
    "kelly": 0,
    "kellyA": 0.045963575065994945,
    "kellyB": 0,
    "fairLine": "-134",
    "fairLineA": "+134",
    "fairLineB": "-134",
    "oddsA": "+150",
    "oddsB": "-150",
    "v2pA": 0.5376210762485238,
    "v2pB": 0.46237892375147616,
    "projectedKO": 0,
    "projectedSUB": 0,
    "projectedDEC": 100,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.475Z",
      "targetEventDate": "2026-10-31",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.42757814503959696,
        "pB": 0.572421854960403
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.003168208484433799,
          "avg_sig_str_pct_dif": 0.0009790054054059638,
          "avg_td_dif": -0.2323748262548261,
          "avg_td_pct_dif": -0.17075440658049343,
          "atd_dif": -0.026666666666666693,
          "avg_sub_att_dif": -0.045416061776061833,
          "kd_dif": 0,
          "control_time_dif": -0.75,
          "reach_dif": 0.37037037037037035,
          "height_dif": 0.21978021978021978,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 0,
          "total_round_dif": 0.058823529411764705,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": 0.282258064516129,
          "layoff_dif": 1.435,
          "cardio_dif": 0,
          "peak_elo_dif": 0,
          "ufc_fight_count_dif": 0,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0,
          "wins": 0,
          "losses": 0,
          "rounds": 1,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 2,
          "reach": 4,
          "younger": 2,
          "sig_str_landed": 0.050057694054054025,
          "sig_str_accuracy": 0.00009790054054059638,
          "sub_attempts": -0.03179124324324328,
          "td_landed": -0.32532475675675654,
          "td_accuracy": -0.03927351351351349,
          "elo": 0.14
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-27",
        "fighterB": "2025-09-13"
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
    "id": "1793147586476-n65ae8",
    "createdAt": "2026-10-28T00:33:06.476Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Julian Erosa",
    "fighterB": "JeongYeong Lee",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6364674339065848,
    "fighterBProb": 0.3635325660934152,
    "predictedWinner": "Julian Erosa",
    "predictedProb": 0.6364674339065848,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4197497665754976,
    "c6ProbB": 0.5802502334245023,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "JeongYeong Lee",
    "trackedProb": 0.5802502334245023,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.08627262092923194,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-174",
    "edge": -0.05478626292586264,
    "edgeA": 0.05478626292586258,
    "edgeB": -0.05478626292586264,
    "ev": -8.627262092923196,
    "evA": 15.011436041686359,
    "evB": -8.627262092923196,
    "kelly": 0,
    "kellyA": 0.08627262092923198,
    "kellyB": 0,
    "fairLine": "-138",
    "fairLineA": "+138",
    "fairLineB": "-138",
    "oddsA": "+174",
    "oddsB": "-174",
    "v2pA": 0.5847399525682174,
    "v2pB": 0.4152600474317826,
    "projectedKO": 13,
    "projectedSUB": 14,
    "projectedDEC": 72,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.476Z",
      "targetEventDate": "2026-10-31",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4197497665754976,
        "pB": 0.5802502334245023
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.1400853420682508,
          "avg_sig_str_pct_dif": 0.058053239766081566,
          "avg_td_dif": 0.6029435254803676,
          "avg_td_pct_dif": -0.4605542842613779,
          "atd_dif": -0.46666666666666634,
          "avg_sub_att_dif": 0.7876247284878863,
          "kd_dif": 0.456,
          "control_time_dif": 0.43333333333333335,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0.32967032967032966,
          "age_dif": -1.627906976744186,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 1.5909090909090908,
          "loss_dif": -2.5925925925925926,
          "total_round_dif": 1.4705882352941178,
          "deep_round_dif": 0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 2.857142857142857,
          "elo_dif": 0.9879032258064516,
          "layoff_dif": 1.61,
          "cardio_dif": 1.3158333333333332,
          "peak_elo_dif": 0.6,
          "ufc_fight_count_dif": 1.75,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.04334915976855569,
          "wins": 7,
          "losses": -7,
          "rounds": 25,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 4,
          "height": 3,
          "reach": 1,
          "younger": -7,
          "sig_str_landed": 2.2133484046783627,
          "sig_str_accuracy": 0.005805323976608157,
          "sub_attempts": 0.5513373099415204,
          "td_landed": 0.8441209356725146,
          "td_accuracy": -0.10592748538011693,
          "elo": 0.49
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-28",
        "fighterB": "2025-05-10"
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
    "id": "1793147586476-ud8ubw",
    "createdAt": "2026-10-28T00:33:06.476Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Mickey Gall",
    "fighterB": "Zachary Reese",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.349787326349193,
    "fighterBProb": 0.6502126736508069,
    "predictedWinner": "Zachary Reese",
    "predictedProb": 0.6502126736508069,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.21663398880044182,
    "c6ProbB": 0.7833660111995582,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Zachary Reese",
    "trackedProb": 0.7833660111995582,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.05164204243228365,
    "betRecommendedFighter": "Zachary Reese",
    "betRecommendedOdds": "-292",
    "marketOdds": "-292",
    "edge": 0.03846805201588466,
    "edgeA": -0.03846805201588471,
    "edgeB": 0.03846805201588466,
    "ev": 5.164204243228358,
    "evA": -15.079476390226809,
    "evB": 5.164204243228358,
    "kelly": 0.1507947639022681,
    "kellyA": 0,
    "kellyB": 0.1507947639022681,
    "fairLine": "-362",
    "fairLineA": "+362",
    "fairLineB": "-362",
    "oddsA": "+292",
    "oddsB": "-292",
    "v2pA": 0.36824974138632266,
    "v2pB": 0.6317502586136774,
    "projectedKO": 20,
    "projectedSUB": 35,
    "projectedDEC": 45,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.476Z",
      "targetEventDate": "2026-10-31",
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
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.21663398880044182,
        "pB": 0.7833660111995582
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.06391139240506324,
          "avg_sig_str_pct_dif": -0.4975999999999997,
          "avg_td_dif": -1.1785714285714286,
          "avg_td_pct_dif": -1.2608695652173911,
          "atd_dif": -1.5333333333333332,
          "avg_sub_att_dif": 0.8000000000000002,
          "kd_dif": -0.5,
          "control_time_dif": -0.788888888888889,
          "reach_dif": -0.27777777777777773,
          "height_dif": -0.21978021978021978,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": -2,
          "win_dif": 0.45454545454545453,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 0.5294117647058824,
          "deep_round_dif": 0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 2.857142857142857,
          "elo_dif": 0.38306451612903225,
          "layoff_dif": -3.01,
          "cardio_dif": 2.538333333333333,
          "peak_elo_dif": 1.7636363636363637,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.26940300008474216,
          "wins": 2,
          "losses": -3,
          "rounds": 9,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 4,
          "height": -2,
          "reach": -3,
          "younger": -2,
          "sig_str_landed": -1.0097999999999994,
          "sig_str_accuracy": -0.04975999999999997,
          "sub_attempts": 0.56,
          "td_landed": -1.65,
          "td_accuracy": -0.29,
          "elo": 0.19
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2024-11-16",
        "fighterB": "2026-07-11"
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
    "id": "1793147586474-0sd43v",
    "createdAt": "2026-10-28T00:33:06.474Z",
    "eventName": "UFC Fight Night: Moicano vs. Nolan",
    "eventDate": "2026-10-31",
    "fighterA": "Piera Rodriguez",
    "fighterB": "Talita Alencar",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Strawweight",
    "boutContext": {
      "division": "Women's Strawweight",
      "isTitleBout": false,
      "scheduledRounds": null,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
        "retrievedAt": "2026-10-27",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6453514894851632,
    "fighterBProb": 0.3546485105148368,
    "predictedWinner": "Piera Rodriguez",
    "predictedProb": 0.6453514894851632,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7589720530060833,
    "c6ProbB": 0.24102794699391672,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Piera Rodriguez",
    "trackedProb": 0.7589720530060833,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "gateVersion": "c6_dog_v3",
    "gateReason": null,
    "gateEV": 0.06135135699257077,
    "betRecommendedFighter": "Piera Rodriguez",
    "betRecommendedOdds": "-251",
    "marketOdds": "-251",
    "edge": 0.04387233790636813,
    "edgeA": 0.04387233790636813,
    "edgeB": -0.043872337906368186,
    "ev": 6.13513569925707,
    "evA": 6.13513569925707,
    "evB": -15.399190605135246,
    "kelly": 0.15399190605135246,
    "kellyA": 0.15399190605135246,
    "kellyB": 0,
    "fairLine": "-315",
    "fairLineA": "-315",
    "fairLineB": "+315",
    "oddsA": "-251",
    "oddsB": "+251",
    "v2pA": 0.6323312657038388,
    "v2pB": 0.3676687342961612,
    "projectedKO": 2,
    "projectedSUB": 8,
    "projectedDEC": 90,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-10-28T00:33:06.474Z",
      "targetEventDate": "2026-10-31",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3",
      "boutContext": {
        "division": "Women's Strawweight",
        "isTitleBout": false,
        "scheduledRounds": null,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-october-31-2026",
          "retrievedAt": "2026-10-27",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7589720530060833,
        "pB": 0.24102794699391672
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.06265822784810128,
          "avg_sig_str_pct_dif": 1.3,
          "avg_td_dif": 0.992857142857143,
          "avg_td_pct_dif": 0.9130434782608694,
          "atd_dif": 1.0000000000000002,
          "avg_sub_att_dif": -0.8571428571428572,
          "kd_dif": 0,
          "control_time_dif": 0.8055555555555556,
          "reach_dif": 0.4629629629629629,
          "height_dif": 0.21978021978021978,
          "age_dif": 0.6976744186046512,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0.22727272727272727,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 0.23529411764705882,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -0.6048387096774194,
          "layoff_dif": -0.21,
          "cardio_dif": -0.9504166666666675,
          "peak_elo_dif": -0.5454545454545454,
          "ufc_fight_count_dif": 0.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.0647391595116048,
          "wins": 1,
          "losses": -1,
          "rounds": 4,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": -1,
          "height": 2,
          "reach": 5,
          "younger": 3,
          "sig_str_landed": 0.9900000000000002,
          "sig_str_accuracy": 0.13,
          "sub_attempts": -0.6,
          "td_landed": 1.3900000000000001,
          "td_accuracy": 0.20999999999999996,
          "elo": -0.3
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-14",
        "fighterB": "2026-04-25"
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
