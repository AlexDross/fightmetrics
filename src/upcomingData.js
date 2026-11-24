export const UPCOMING_ENTRIES = [
  {
    "id": "1795536580282-bi965r",
    "createdAt": "2026-11-24T16:09:40.282Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Israel Adesanya",
    "fighterB": "Shara Magomedov",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.3657175449578514,
    "fighterBProb": 0.6342824550421486,
    "predictedWinner": "Shara Magomedov",
    "predictedProb": 0.6342824550421486,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.49806493094078497,
    "c6ProbB": 0.501935069059215,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Shara Magomedov",
    "trackedProb": 0.501935069059215,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3_book",
    "gateReason": null,
    "gateEV": 0.15445065883619447,
    "betRecommendedFighter": "Shara Magomedov",
    "betRecommendedOdds": "+130",
    "marketOdds": "+130",
    "edge": 0.09185981180226521,
    "edgeA": -0.09185981180226532,
    "edgeB": 0.09185981180226521,
    "ev": 15.445065883619442,
    "evA": -20.36925954419786,
    "evB": 15.445065883619442,
    "kelly": 0.11880819910476499,
    "kellyA": 0,
    "kellyB": 0.11880819910476499,
    "fairLine": "-101",
    "fairLineA": "+101",
    "fairLineB": "-101",
    "oddsA": "-167",
    "oddsB": "+130",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 5 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.34828343029279474,
    "v2pB": 0.6517165697072053,
    "projectedKO": 30,
    "projectedSUB": 5,
    "projectedDEC": 66,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.282Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.49806493094078497,
        "pB": 0.501935069059215
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 5 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.1472151898734177,
          "avg_sig_str_pct_dif": -1.8840000000000001,
          "avg_td_dif": 0.03571428571428572,
          "avg_td_pct_dif": 0.3913043478260869,
          "atd_dif": 0.33333333333333365,
          "avg_sub_att_dif": 0.20000000000000004,
          "kd_dif": -0.21200000000000002,
          "control_time_dif": 0.027777777777777776,
          "reach_dif": 0.6481481481481481,
          "height_dif": 0.21978021978021978,
          "age_dif": -1.1627906976744187,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -4,
          "win_dif": 1.5909090909090908,
          "loss_dif": -1.8518518518518516,
          "total_round_dif": 2.823529411764706,
          "deep_round_dif": 0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": 1.5,
          "sub_dif": 0,
          "elo_dif": 1.129032258064516,
          "layoff_dif": -0.455,
          "cardio_dif": 0.28416666666666685,
          "peak_elo_dif": 3.2181818181818183,
          "ufc_fight_count_dif": 1.5,
          "rank_tier_dif": 2.8491721460159956
        },
        "v2": {
          "modern_form": -0.5509614816339452,
          "wins": 7,
          "losses": -5,
          "rounds": 48,
          "title_bouts": 0,
          "ko_wins": 3,
          "sub_wins": 0,
          "height": 2,
          "reach": 7,
          "younger": -5,
          "sig_str_landed": -2.3259999999999996,
          "sig_str_accuracy": -0.1884,
          "sub_attempts": 0.14,
          "td_landed": 0.05,
          "td_accuracy": 0.09,
          "elo": 0.56
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-28",
        "fighterB": "2026-06-27"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580282-s6pzmp",
    "createdAt": "2026-11-24T16:09:40.282Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Ian Machado Garry",
    "fighterB": "Yaroslav Amosov",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Adesanya_vs._Magomedov",
        "retrievedAt": "2026-11-24",
        "authority": "secondary"
      }
    },
    "fighterAProb": 0.5889869603665945,
    "fighterBProb": 0.4110130396334055,
    "predictedWinner": "Ian Machado Garry",
    "predictedProb": 0.5889869603665945,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6382720319544292,
    "c6ProbB": 0.36172796804557084,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Ian Machado Garry",
    "trackedProb": 0.6382720319544292,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.029294618069305556,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-192",
    "edge": 0.016510373923341093,
    "edgeA": 0.016510373923341093,
    "edgeB": -0.01651037392334115,
    "ev": -2.9294618069305542,
    "evA": -2.9294618069305542,
    "evB": -9.568007988607299,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-176",
    "fairLineA": "-176",
    "fairLineB": "+176",
    "oddsA": "-192",
    "oddsB": "+150",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 5 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.5495048708843583,
    "v2pB": 0.4504951291156417,
    "projectedKO": 22,
    "projectedSUB": 35,
    "projectedDEC": 44,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.282Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://en.wikipedia.org/wiki/UFC_Fight_Night:_Adesanya_vs._Magomedov",
          "retrievedAt": "2026-11-24",
          "authority": "secondary"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6382720319544292,
        "pB": 0.36172796804557084
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 5 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.02029321245295925,
          "avg_sig_str_pct_dif": 0.6756972972972985,
          "avg_td_dif": -1.8688145173745179,
          "avg_td_pct_dif": -0.30179083431257225,
          "atd_dif": 1.0400000000000003,
          "avg_sub_att_dif": -0.9884985328185331,
          "kd_dif": 0.632,
          "control_time_dif": -4.533333333333334,
          "reach_dif": -0.09259259259259259,
          "height_dif": 0.32967032967032966,
          "age_dif": 0.9302325581395349,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -1,
          "win_dif": 1.8181818181818181,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 2.0588235294117645,
          "deep_round_dif": 0.5882352941176471,
          "total_title_bout_dif": 0,
          "ko_dif": 1.5,
          "sub_dif": -1.4285714285714286,
          "elo_dif": 2.036290322580645,
          "layoff_dif": 0.49,
          "cardio_dif": 1.1400000000000003,
          "peak_elo_dif": 2,
          "ufc_fight_count_dif": 1.25,
          "rank_tier_dif": 3.24
        },
        "v2": {
          "modern_form": -0.29068962653304176,
          "wins": 8,
          "losses": -2,
          "rounds": 35,
          "title_bouts": 0,
          "ko_wins": 3,
          "sub_wins": -2,
          "height": 3,
          "reach": -1,
          "younger": 4,
          "sig_str_landed": 0.3206327567567562,
          "sig_str_accuracy": 0.06756972972972985,
          "sub_attempts": -0.6919489729729731,
          "td_landed": -2.616340324324325,
          "td_accuracy": -0.06941189189189162,
          "elo": 1.01
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-08-15",
        "fighterB": "2026-05-09"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580281-ouk0wt",
    "createdAt": "2026-11-24T16:09:40.281Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Islam Dulatov",
    "fighterB": "Levan Chokheli",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.49166524581320303,
    "fighterBProb": 0.508334754186797,
    "predictedWinner": "Levan Chokheli",
    "predictedProb": 0.508334754186797,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6574787550203981,
    "c6ProbB": 0.3425212449796019,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Islam Dulatov",
    "trackedProb": 0.6574787550203981,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.06274305135390057,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-235",
    "edge": -0.005159714264596826,
    "edgeA": -0.005159714264596826,
    "edgeB": 0.005159714264596882,
    "ev": -6.274305135390062,
    "evA": -6.274305135390062,
    "evB": -4.094051405711468,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-192",
    "fairLineA": "-192",
    "fairLineB": "+192",
    "oddsA": "-235",
    "oddsB": "+180",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 3 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.5130966110927699,
    "v2pB": 0.48690338890723006,
    "projectedKO": 60,
    "projectedSUB": 12,
    "projectedDEC": 28,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.281Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6574787550203981,
        "pB": 0.3425212449796019
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 3 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.04443037974683544,
          "avg_sig_str_pct_dif": -0.026666666666666505,
          "avg_td_dif": 0,
          "avg_td_pct_dif": 0,
          "atd_dif": 0.17777777777777745,
          "avg_sub_att_dif": 0,
          "kd_dif": 0,
          "control_time_dif": 0,
          "reach_dif": 0.27777777777777773,
          "height_dif": 0.43956043956043955,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 0,
          "total_round_dif": 0,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": 0.020161290322580645,
          "layoff_dif": -1.68,
          "cardio_dif": 0,
          "peak_elo_dif": 0.01818181818181818,
          "ufc_fight_count_dif": 0,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.06499999999999995,
          "wins": 0,
          "losses": 0,
          "rounds": 0,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 4,
          "reach": 3,
          "younger": 2,
          "sig_str_landed": -0.702,
          "sig_str_accuracy": -0.0026666666666666505,
          "sub_attempts": 0,
          "td_landed": 0,
          "td_accuracy": 0,
          "elo": 0.01
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-07-19",
        "fighterB": "2026-06-20"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580281-klrexz",
    "createdAt": "2026-11-24T16:09:40.281Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Mario Pinto",
    "fighterB": "Serghei Spivac",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6413539109666396,
    "fighterBProb": 0.35864608903336037,
    "predictedWinner": "Mario Pinto",
    "predictedProb": 0.6413539109666396,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7839931130763165,
    "c6ProbB": 0.21600688692368353,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Mario Pinto",
    "trackedProb": 0.7839931130763165,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": 0.007991145383835274,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-350",
    "edge": 0.05264982949422692,
    "edgeA": 0.05264982949422692,
    "edgeB": -0.05264982949422692,
    "ev": 0.7991145383835381,
    "evA": 0.7991145383835381,
    "evB": -24.397589576710764,
    "kelly": 0.027969008843423765,
    "kellyA": 0.027969008843423765,
    "kellyB": 0,
    "fairLine": "-363",
    "fairLineA": "-363",
    "fairLineB": "+363",
    "oddsA": "-350",
    "oddsB": "+250",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 3 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.6602936500596471,
    "v2pB": 0.33970634994035287,
    "projectedKO": 51,
    "projectedSUB": 18,
    "projectedDEC": 31,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.281Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7839931130763165,
        "pB": 0.21600688692368353
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 3 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.03462306194292565,
          "avg_sig_str_pct_dif": 1.4815644970414203,
          "avg_td_dif": -0.08972104818258689,
          "avg_td_pct_dif": -0.846637509647543,
          "atd_dif": 1.4,
          "avg_sub_att_dif": 0.37658495350803056,
          "kd_dif": 1.9199999999999997,
          "control_time_dif": 0.16666666666666666,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0.21978021978021978,
          "age_dif": 0.6976744186046512,
          "win_streak_dif": 2.857142857142857,
          "lose_streak_dif": 1,
          "win_dif": -1.1363636363636362,
          "loss_dif": 2.5925925925925926,
          "total_round_dif": -1.3529411764705883,
          "deep_round_dif": -0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": -2.142857142857143,
          "elo_dif": 0.5443548387096774,
          "layoff_dif": 0.07,
          "cardio_dif": -1.5804166666666666,
          "peak_elo_dif": -0.38181818181818183,
          "ufc_fight_count_dif": -1.5,
          "rank_tier_dif": -2.611707935929908
        },
        "v2": {
          "modern_form": 0.4767309875141885,
          "wins": -5,
          "losses": 7,
          "rounds": -23,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": -3,
          "height": 2,
          "reach": 1,
          "younger": 3,
          "sig_str_landed": 0.5470443786982253,
          "sig_str_accuracy": 0.14815644970414205,
          "sub_attempts": 0.26360946745562136,
          "td_landed": -0.12560946745562163,
          "td_accuracy": -0.1947266272189349,
          "elo": 0.27
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-09-05",
        "fighterB": "2026-08-22"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580281-p568e5",
    "createdAt": "2026-11-24T16:09:40.281Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Ion Cutelaba",
    "fighterB": "Magomed Tuchalov",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Light Heavyweight",
    "boutContext": {
      "division": "Light Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5894966799926113,
    "fighterBProb": 0.41050332000738865,
    "predictedWinner": "Ion Cutelaba",
    "predictedProb": 0.5894966799926113,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.36996464406155044,
    "c6ProbB": 0.6300353559384495,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Magomed Tuchalov",
    "trackedProb": 0.6300353559384495,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.03483945473258798,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-188",
    "edge": 0.011876679655038358,
    "edgeA": -0.011876679655038413,
    "edgeB": 0.011876679655038358,
    "ev": -3.4839454732587996,
    "evA": -8.248768272735482,
    "evB": -3.4839454732587996,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-170",
    "fairLineA": "+170",
    "fairLineB": "-170",
    "oddsA": "+148",
    "oddsB": "-188",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 2 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.4601675173904633,
    "v2pB": 0.5398324826095366,
    "projectedKO": 20,
    "projectedSUB": 11,
    "projectedDEC": 69,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.281Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Light Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.36996464406155044,
        "pB": 0.6300353559384495
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 2 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.031310584108586226,
          "avg_sig_str_pct_dif": -0.43466987951807035,
          "avg_td_dif": 0.9367986230636832,
          "avg_td_pct_dif": 0.6837087480356209,
          "atd_dif": 0.4666666666666671,
          "avg_sub_att_dif": -0.6230292598967299,
          "kd_dif": 0.7999999999999999,
          "control_time_dif": -1.8499999999999999,
          "reach_dif": 6.944444444444444,
          "height_dif": 8.021978021978022,
          "age_dif": -1.3953488372093024,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": -1,
          "win_dif": 1.8181818181818181,
          "loss_dif": -4.0740740740740735,
          "total_round_dif": 2.176470588235294,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": 2,
          "sub_dif": 1.4285714285714286,
          "elo_dif": 0.4032258064516129,
          "layoff_dif": -0.175,
          "cardio_dif": -1.3854166666666667,
          "peak_elo_dif": 1.4727272727272727,
          "ufc_fight_count_dif": 2.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.46861520998864925,
          "wins": 8,
          "losses": -11,
          "rounds": 37,
          "title_bouts": 0,
          "ko_wins": 4,
          "sub_wins": 2,
          "height": 4,
          "reach": 5,
          "younger": -6,
          "sig_str_landed": 0.49470722891566243,
          "sig_str_accuracy": -0.043466987951807035,
          "sub_attempts": -0.4361204819277109,
          "td_landed": 1.3115180722891564,
          "td_accuracy": 0.1572530120481928,
          "elo": 0.2
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-20",
        "fighterB": "2026-07-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580280-bp78bm",
    "createdAt": "2026-11-24T16:09:40.280Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Gabriel Santos",
    "fighterB": "Luke Riley",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.4537417137895197,
    "fighterBProb": 0.5462582862104803,
    "predictedWinner": "Luke Riley",
    "predictedProb": 0.5462582862104803,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4275582383633734,
    "c6ProbB": 0.5724417616366266,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Luke Riley",
    "trackedProb": 0.5724417616366266,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.04593039727228898,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-150",
    "edge": 0.009122984344050233,
    "edgeA": -0.009122984344050122,
    "edgeB": 0.009122984344050233,
    "ev": -4.5930397272288985,
    "evA": -8.074978751874724,
    "evB": -4.5930397272288985,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-134",
    "fairLineA": "+134",
    "fairLineB": "-134",
    "oddsA": "+115",
    "oddsB": "-150",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 2 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.47417337424351524,
    "v2pB": 0.5258266257564848,
    "projectedKO": 36,
    "projectedSUB": 19,
    "projectedDEC": 45,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.280Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4275582383633734,
        "pB": 0.5724417616366266
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 2 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.053715875896255635,
          "avg_sig_str_pct_dif": 0.6468764568764568,
          "avg_td_dif": 1.6168443223443223,
          "avg_td_pct_dif": 1.2477956825782912,
          "atd_dif": 1.9066666666666663,
          "avg_sub_att_dif": 0.9744878454878456,
          "kd_dif": -2.6679999999999997,
          "control_time_dif": 1.65,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": -0.22727272727272727,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.29411764705882354,
          "deep_round_dif": 0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 0.7142857142857143,
          "elo_dif": -1.6733870967741935,
          "layoff_dif": -2.59,
          "cardio_dif": -1.9562500000000003,
          "peak_elo_dif": -1.509090909090909,
          "ufc_fight_count_dif": 0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.37719512195121957,
          "wins": -1,
          "losses": -2,
          "rounds": 5,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 1,
          "height": 0,
          "reach": 1,
          "younger": -3,
          "sig_str_landed": -0.8487108391608391,
          "sig_str_accuracy": 0.06468764568764568,
          "sub_attempts": 0.6821414918414919,
          "td_landed": 2.263582051282051,
          "td_accuracy": 0.286993006993007,
          "elo": -0.83
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-02-08",
        "fighterB": "2026-07-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580280-i3ir48",
    "createdAt": "2026-11-24T16:09:40.280Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Bruno Silva",
    "fighterB": "Jafel Filho",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.42902475337763857,
    "fighterBProb": 0.5709752466223614,
    "predictedWinner": "Jafel Filho",
    "predictedProb": 0.5709752466223614,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.37075007656671277,
    "c6ProbB": 0.6292499234332872,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Jafel Filho",
    "trackedProb": 0.6292499234332872,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": 0.017675802095810322,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-162",
    "edge": 0.05292392084596509,
    "edgeA": -0.05292392084596509,
    "edgeB": 0.05292392084596509,
    "ev": 1.767580209581027,
    "evA": -18.43498315532318,
    "evB": 1.767580209581027,
    "kelly": 0.02863479939521263,
    "kellyA": 0,
    "kellyB": 0.02863479939521263,
    "fairLine": "-170",
    "fairLineA": "+170",
    "fairLineB": "-170",
    "oddsA": "+120",
    "oddsB": "-162",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 3 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.39016191831129626,
    "v2pB": 0.6098380816887037,
    "projectedKO": 42,
    "projectedSUB": 40,
    "projectedDEC": 18,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.280Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.37075007656671277,
        "pB": 0.6292499234332872
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 3 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.09187660113665723,
          "avg_sig_str_pct_dif": 0.7916653061224488,
          "avg_td_dif": -0.5517606413994169,
          "avg_td_pct_dif": -1.1787459331558712,
          "atd_dif": 1.4666666666666666,
          "avg_sub_att_dif": -2.0632944606414,
          "kd_dif": 1.0759999999999998,
          "control_time_dif": -0.9055555555555556,
          "reach_dif": -0.27777777777777773,
          "height_dif": -0.32967032967032966,
          "age_dif": -0.9302325581395349,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": 1.3636363636363635,
          "loss_dif": -3.7037037037037033,
          "total_round_dif": 2.3529411764705883,
          "deep_round_dif": 0.5882352941176471,
          "total_title_bout_dif": 0,
          "ko_dif": 3.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -1.5120967741935483,
          "layoff_dif": 0.21,
          "cardio_dif": 0.3662500000000004,
          "peak_elo_dif": 0.9272727272727272,
          "ufc_fight_count_dif": 2,
          "rank_tier_dif": 1.736044097509195
        },
        "v2": {
          "modern_form": -0.2599574221203663,
          "wins": 6,
          "losses": -10,
          "rounds": 40,
          "title_bouts": 0,
          "ko_wins": 7,
          "sub_wins": -1,
          "height": -3,
          "reach": -3,
          "younger": -4,
          "sig_str_landed": 1.4516502979591843,
          "sig_str_accuracy": 0.07916653061224488,
          "sub_attempts": -1.44430612244898,
          "td_landed": -0.7724648979591837,
          "td_accuracy": -0.2711115646258504,
          "elo": -0.75
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-06",
        "fighterB": "2026-04-25"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580279-wdt5l1",
    "createdAt": "2026-11-24T16:09:40.279Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "JunYong Park",
    "fighterB": "Marco Tulio",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.616302214976848,
    "fighterBProb": 0.383697785023152,
    "predictedWinner": "JunYong Park",
    "predictedProb": 0.616302214976848,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4476276066051653,
    "c6ProbB": 0.5523723933948347,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Marco Tulio",
    "trackedProb": 0.5523723933948347,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.14075405471914604,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-180",
    "edge": -0.05436917963887322,
    "edgeA": 0.054369179638873166,
    "edgeB": -0.05436917963887322,
    "ev": -14.075405471914607,
    "evA": 7.4306255852396745,
    "evB": -14.075405471914607,
    "kelly": 0,
    "kellyA": 0.05307589703742621,
    "kellyB": 0,
    "fairLine": "-123",
    "fairLineA": "+123",
    "fairLineB": "-123",
    "oddsA": "+140",
    "oddsB": "-180",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 3 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.5858485795920646,
    "v2pB": 0.4141514204079354,
    "projectedKO": 44,
    "projectedSUB": 16,
    "projectedDEC": 39,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.279Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4476276066051653,
        "pB": 0.5523723933948347
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 3 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.02556464010827173,
          "avg_sig_str_pct_dif": 0.2542751798742121,
          "avg_td_dif": 0.3584396945193174,
          "avg_td_pct_dif": 0.17178780421110162,
          "atd_dif": -0.39999999999999963,
          "avg_sub_att_dif": 0.8252020125786164,
          "kd_dif": -2,
          "control_time_dif": 0.41666666666666674,
          "reach_dif": -0.09259259259259259,
          "height_dif": -0.21978021978021978,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": 0,
          "lose_streak_dif": 1,
          "win_dif": 1.5909090909090908,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 1.4705882352941178,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 2.142857142857143,
          "elo_dif": 1.532258064516129,
          "layoff_dif": -0.98,
          "cardio_dif": -0.5299999999999999,
          "peak_elo_dif": 0.6181818181818182,
          "ufc_fight_count_dif": 1.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.19711525151573872,
          "wins": 7,
          "losses": -2,
          "rounds": 25,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 3,
          "height": -2,
          "reach": -1,
          "younger": -3,
          "sig_str_landed": -0.4039213137106934,
          "sig_str_accuracy": 0.02542751798742121,
          "sub_attempts": 0.5776414088050315,
          "td_landed": 0.5018155723270443,
          "td_accuracy": 0.039511194968553376,
          "elo": 0.76
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-10-25",
        "fighterB": "2026-05-09"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580279-qfs70m",
    "createdAt": "2026-11-24T16:09:40.279Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Mahammadali Osmanli",
    "fighterB": "Pavel Andrusca",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.354277678665967,
    "fighterBProb": 0.6457223213340331,
    "predictedWinner": "Pavel Andrusca",
    "predictedProb": 0.6457223213340331,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.3609880607179773,
    "c6ProbB": 0.6390119392820227,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Pavel Andrusca",
    "trackedProb": 0.6390119392820227,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "B",
    "gateVersion": "c6_dog_v3_book",
    "gateReason": null,
    "gateEV": 0.09544903876918198,
    "betRecommendedFighter": "Pavel Andrusca",
    "betRecommendedOdds": "-140",
    "marketOdds": "-140",
    "edge": 0.08845014152921371,
    "edgeA": -0.08845014152921371,
    "edgeB": 0.08845014152921371,
    "ev": 9.544903876918184,
    "evA": -24.19250724922476,
    "evB": 9.544903876918184,
    "kelly": 0.1336286542768546,
    "kellyA": 0,
    "kellyB": 0.1336286542768546,
    "fairLine": "-177",
    "fairLineA": "+177",
    "fairLineB": "-177",
    "oddsA": "+110",
    "oddsB": "-140",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 3 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.3318490363919934,
    "v2pB": 0.6681509636080065,
    "projectedKO": 0,
    "projectedSUB": 2,
    "projectedDEC": 98,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.279Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.3609880607179773,
        "pB": 0.6390119392820227
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 3 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.017568215836644183,
          "avg_sig_str_pct_dif": -0.20715725547445218,
          "avg_td_dif": -0.4279040667361835,
          "avg_td_pct_dif": 0.007895906061568076,
          "atd_dif": -0.04444444444444473,
          "avg_sub_att_dif": -0.18134167535627388,
          "kd_dif": 0,
          "control_time_dif": -0.9666666666666666,
          "reach_dif": 0,
          "height_dif": 0,
          "age_dif": 0,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": -1,
          "win_dif": -0.22727272727272727,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": -0.11764705882352941,
          "deep_round_dif": -0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": -1.1693548387096775,
          "layoff_dif": 0.105,
          "cardio_dif": 0,
          "peak_elo_dif": -0.6181818181818182,
          "ufc_fight_count_dif": 0,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.8,
          "wins": -1,
          "losses": -1,
          "rounds": -2,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 0,
          "reach": 0,
          "younger": 0,
          "sig_str_landed": -0.2775778102189781,
          "sig_str_accuracy": -0.02071572554744522,
          "sub_attempts": -0.1269391727493917,
          "td_landed": -0.5990656934306569,
          "td_accuracy": 0.0018160583941606578,
          "elo": -0.58
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-09-26",
        "fighterB": "2026-09-05"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580278-7h15x1",
    "createdAt": "2026-11-24T16:09:40.278Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Abdul Hussein",
    "fighterB": "Hecher Sosa",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5085064448579983,
    "fighterBProb": 0.49149355514200166,
    "predictedWinner": "Abdul Hussein",
    "predictedProb": 0.5085064448579983,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.6207048074350272,
    "c6ProbB": 0.3792951925649728,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Abdul Hussein",
    "trackedProb": 0.6207048074350272,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.014174717603192,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-170",
    "edge": 0.029176819537901633,
    "edgeA": 0.029176819537901633,
    "edgeB": -0.029176819537901577,
    "ev": -1.4174717603192022,
    "evA": -1.4174717603192022,
    "evB": -12.762105710056268,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-164",
    "fairLineA": "-164",
    "fairLineB": "+164",
    "oddsA": "-170",
    "oddsB": "+130",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 3 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.5682556739791463,
    "v2pB": 0.43174432602085366,
    "projectedKO": 9,
    "projectedSUB": 33,
    "projectedDEC": 58,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.278Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.6207048074350272,
        "pB": 0.3792951925649728
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 3 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.024936708860759528,
          "avg_sig_str_pct_dif": 0.38000000000000034,
          "avg_td_dif": 0.16285714285714287,
          "avg_td_pct_dif": 0.4347826086956523,
          "atd_dif": 0.040000000000000036,
          "avg_sub_att_dif": 0.9800000000000003,
          "kd_dif": 0,
          "control_time_dif": 0.9833333333333333,
          "reach_dif": -6.481481481481481,
          "height_dif": -7.582417582417583,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 0,
          "total_round_dif": 0,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.12096774193548386,
          "layoff_dif": 0.665,
          "cardio_dif": 0,
          "peak_elo_dif": 0.10909090909090909,
          "ufc_fight_count_dif": 0,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0,
          "wins": 0,
          "losses": 0,
          "rounds": 0,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 1,
          "height": 0,
          "reach": 0,
          "younger": 2,
          "sig_str_landed": -0.39400000000000057,
          "sig_str_accuracy": 0.038000000000000034,
          "sub_attempts": 0.6860000000000002,
          "td_landed": 0.22799999999999998,
          "td_accuracy": 0.10000000000000003,
          "elo": 0.06
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-25",
        "fighterB": "2026-03-14"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1795536580277-dbzpoh",
    "createdAt": "2026-11-24T16:09:40.278Z",
    "eventName": "UFC Fight Night: Adesanya vs. Magomedov",
    "eventDate": "2026-12-05",
    "fighterA": "Elves Brener",
    "fighterB": "Mateusz Rebecki",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
        "retrievedAt": "2026-11-24",
        "authority": "official"
      }
    },
    "fighterAProb": 0.49011626060871827,
    "fighterBProb": 0.5098837393912817,
    "predictedWinner": "Mateusz Rebecki",
    "predictedProb": 0.5098837393912817,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.40909411861604833,
    "c6ProbB": 0.5909058813839516,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Mateusz Rebecki",
    "trackedProb": 0.5909058813839516,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "gateVersion": "c6_dog_v3_book",
    "gateReason": "EV_BELOW_FLOOR",
    "gateEV": -0.0465751729817222,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-163",
    "edge": 0.0031962090215124084,
    "edgeA": -0.0031962090215124084,
    "edgeB": 0.0031962090215124084,
    "ev": -4.657517298172223,
    "evA": -5.908352718308883,
    "evB": -4.657517298172223,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-144",
    "fairLineA": "+144",
    "fairLineB": "-144",
    "oddsA": "+130",
    "oddsB": "-163",
    "marketSource": {
      "kind": "sportsbook",
      "name": "bestfightodds",
      "line": "median of 1 books",
      "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
      "retrievedAt": "2026-11-24T14:31:13.243Z"
    },
    "v2pA": 0.48160080984485676,
    "v2pB": 0.5183991901551432,
    "projectedKO": 49,
    "projectedSUB": 13,
    "projectedDEC": 38,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-11-24T16:09:40.278Z",
      "targetEventDate": "2026-12-05",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "gateVersion": "c6_dog_v3_book",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-december-05-2026",
          "retrievedAt": "2026-11-24",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.40909411861604833,
        "pB": 0.5909058813839516
      },
      "marketSource": {
        "kind": "sportsbook",
        "name": "bestfightodds",
        "line": "median of 1 books",
        "url": "https://www.bestfightodds.com/events/ufc-saudi-arabia-4453",
        "retrievedAt": "2026-11-24T14:31:13.243Z"
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.038607594936708824,
          "avg_sig_str_pct_dif": -0.10000000000000009,
          "avg_td_dif": -1.3714285714285714,
          "avg_td_pct_dif": -1.4347826086956519,
          "atd_dif": 1.7333333333333334,
          "avg_sub_att_dif": -0.41428571428571426,
          "kd_dif": 0.6839999999999998,
          "control_time_dif": -0.9166666666666666,
          "reach_dif": 0.5555555555555555,
          "height_dif": 0.32967032967032966,
          "age_dif": 1.1627906976744187,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": -0.29411764705882354,
          "deep_round_dif": -0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": -0.12096774193548386,
          "layoff_dif": 0.28,
          "cardio_dif": 0.7233333333333337,
          "peak_elo_dif": -0.09090909090909091,
          "ufc_fight_count_dif": -0.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.04308067841064339,
          "wins": -1,
          "losses": 1,
          "rounds": -5,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": -1,
          "height": 3,
          "reach": 6,
          "younger": 5,
          "sig_str_landed": -0.6099999999999994,
          "sig_str_accuracy": -0.010000000000000009,
          "sub_attempts": -0.29,
          "td_landed": -1.92,
          "td_accuracy": -0.32999999999999996,
          "elo": -0.06
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-09-26",
        "fighterB": "2026-08-01"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "82f962e0ee7a93d3691256042f737a4199fd72474ed396ab6acc2e6e3a2eb0c4",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "815b537333c146c9bfc20d241ecbb21329df115a942be12c5f0cda9e001a0009",
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
          "generatorVersion": "update_fighters.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-11-14",
          "contentHash": "d73385b89aa29a9dacc80c518279e0fff183efc9ccd1d1e7aaf32158a89348cb",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (797 rows); maximum event date found = 2026-11-14. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-11-13",
          "maxObservedEventDate": null,
          "contentHash": "68cea66a2199377d96fa732e70ce6663f6d2f37aa36b49f60f785838ed9609e1",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ 04132594e68afce5aa83dc0f33647d86bfe2521c",
          "verificationMethod": "Recomputed the join from source while writing this manifest: read 2267 rows from fighters.json, of which 2207 carry a dob matching ^\\d{4}-\\d{2}-\\d{2}$; applied 1 name_aliases.json rewrites; filled 261 further names from fighter_profiles.json (ufcstats tale of the tape, never overriding fighters.json); produced 2468 canonical names, and the shipped artifact contains 2468 entries. The generator raises on any canonical name that would receive two DIFFERENT birth dates, so a silent bad join cannot ship. Keys are sorted by UTF-16 code point (not localeCompare), making regeneration byte-identical across machines and ICU builds; the scheduled workflow enforces this with a --check re-run. maxObservedEventDate is null by nature, not by omission: this artifact holds birth dates, which are not event-scoped, so there is no event date it could be current or stale relative to. Its freshness question is coverage, which is the measured count above."
        },
        "rankings": {
          "file": "src/rankingsData.js",
          "feedsV2": false,
          "inProductionBundle": true,
          "note": "Current official rankings feed fighter-profile/UI rank badges only. Runtime artifact: this is the only rankings file in the production dependency graph. Historical series live in the separate rankingsHistory module below.",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "64ee63ab3538d434a033dabb8961245bb6b654ebecce35cad1e0b1f2044b5867",
          "officialSnapshots": [
            "2026-08-01-meta.json",
            "2026-08-04-media.json",
            "2026-09-26-meta.json",
            "2026-09-29-media.json",
            "2026-10-03-meta.json",
            "2026-10-06-media.json",
            "2026-10-17-meta.json",
            "2026-10-20-media.json",
            "2026-10-31-meta.json",
            "2026-11-03-media.json",
            "2026-11-07-meta.json",
            "2026-11-10-media.json",
            "2026-11-14-meta.json",
            "2026-11-17-media.json"
          ],
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        },
        "rankingsHistory": {
          "file": "src/rankingsHistoryData.js",
          "feedsV2": false,
          "inProductionBundle": false,
          "note": "Historical divisional rankings. RESEARCH ARTIFACT: no runtime consumer and no model consumer -- neither the deprecated v1 engine nor the frozen 16-feature MODEL_V2. Kept out of the browser bundle; enforced by src/domain/rankings/__tests__/boundary.test.js (import graph) and scripts/verify-bundle.mjs (emitted assets).",
          "generatedAt": "2026-11-18T00:42:30Z",
          "maxObservedEventDate": "2026-11-17",
          "contentHash": "b8293c368d62f964a17b8dafb764335c65dc6232344608de348751f6ddfcb7ba",
          "historyCacheSha256": "4f245240e2b53ee088d82f861aa0a718aef9f62bf15d62eb434d4628b3b6b3ad",
          "upstreamContentSha256": "2d27b34e64372520e9170cc30f1d1c59e795d046b6726de89db95b9535db9858",
          "upstreamVersion": 49,
          "historyUsedThrough": "2026-06-18",
          "generatorVersion": "scripts/update_rankings.py @ 7676f3207c026c018c5eb2b3729468ede94d15b6",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
