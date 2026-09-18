export const UPCOMING_ENTRIES = [
  {
    "id": "1789748289303-qp8qbc",
    "createdAt": "2026-09-18T16:18:09.303Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Casey O'Neill",
    "fighterB": "Eduarda Moura",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Flyweight",
    "boutContext": {
      "division": "Women's Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.7507545636885414,
    "fighterBProb": 0.24924543631145857,
    "predictedWinner": "Casey O'Neill",
    "predictedProb": 0.7507545636885414,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Casey O'Neill",
    "trackedProb": 0.7612609076564743,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-208",
    "edge": 0.08593623233179892,
    "edgeA": 0.08593623233179892,
    "edgeB": -0.08593623233179892,
    "ev": 12.72517286451638,
    "evA": 12.72517286451638,
    "evB": -26.46835955819406,
    "kelly": 0.2646835955819407,
    "kellyA": 0.2646835955819407,
    "kellyB": 0,
    "fairLine": "-319",
    "fairLineA": "-319",
    "fairLineB": "+319",
    "oddsA": "-208",
    "oddsB": "+208",
    "v2pA": 0.7612609076564743,
    "v2pB": 0.23873909234352575,
    "projectedKO": 36,
    "projectedSUB": 11,
    "projectedDEC": 52,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.303Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.34026807148175725,
          "avg_sig_str_pct_dif": 1.4736950588235298,
          "avg_td_dif": -1.4427563025210084,
          "avg_td_pct_dif": 0.06881500426257443,
          "atd_dif": -1.2444444444444451,
          "avg_sub_att_dif": 0.6626106442577031,
          "kd_dif": 0.6920000000000001,
          "control_time_dif": -0.4833333333333334,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0,
          "age_dif": 0.9302325581395349,
          "win_streak_dif": 1.4285714285714286,
          "lose_streak_dif": 1,
          "win_dif": 0.6818181818181818,
          "loss_dif": 0,
          "total_round_dif": 0.29411764705882354,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 1.4516129032258065,
          "layoff_dif": 0.245,
          "cardio_dif": 1.0304166666666665,
          "peak_elo_dif": 1.0909090909090908,
          "ufc_fight_count_dif": 0.375,
          "rank_tier_dif": 0.08994502244402902
        },
        "v2": {
          "modern_form": 0.13835084233052897,
          "wins": 3,
          "losses": 0,
          "rounds": 5,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 1,
          "height": 0,
          "reach": 2,
          "younger": 4,
          "sig_str_landed": 5.3762355294117645,
          "sig_str_accuracy": 0.14736950588235298,
          "sub_attempts": 0.46382745098039213,
          "td_landed": -2.0198588235294115,
          "td_accuracy": 0.01582745098039212,
          "elo": 0.72
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-28",
        "fighterB": "2026-02-07"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289303-3bcjfl",
    "createdAt": "2026-09-18T16:18:09.303Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Marlon Vera",
    "fighterB": "Charles Jourdain",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.4909394102380057,
    "fighterBProb": 0.5090605897619943,
    "predictedWinner": "Charles Jourdain",
    "predictedProb": 0.5090605897619943,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Charles Jourdain",
    "trackedProb": 0.5897111874651253,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-199",
    "edge": -0.07584065199975765,
    "edgeA": 0.0758406519997577,
    "edgeB": -0.07584065199975765,
    "ev": -11.395153240164596,
    "evA": 22.67635494792755,
    "evB": -11.395153240164596,
    "kelly": 0,
    "kellyA": 0.113951532401646,
    "kellyB": 0,
    "fairLine": "-144",
    "fairLineA": "+144",
    "fairLineB": "-144",
    "oddsA": "+199",
    "oddsB": "-199",
    "v2pA": 0.41028881253487476,
    "v2pB": 0.5897111874651253,
    "projectedKO": 34,
    "projectedSUB": 25,
    "projectedDEC": 40,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.303Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.1275949367088608,
          "avg_sig_str_pct_dif": -0.484,
          "avg_td_dif": 0.06428571428571427,
          "avg_td_pct_dif": 0.7391304347826088,
          "atd_dif": 1.6666666666666663,
          "avg_sub_att_dif": 0.21428571428571433,
          "kd_dif": 0.36800000000000005,
          "control_time_dif": 0.08888888888888886,
          "reach_dif": 0.09259259259259259,
          "height_dif": -0.10989010989010989,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": -2.142857142857143,
          "lose_streak_dif": -4,
          "win_dif": 1.3636363636363635,
          "loss_dif": -1.4814814814814814,
          "total_round_dif": 1.9411764705882353,
          "deep_round_dif": 0.47058823529411764,
          "total_title_bout_dif": 0,
          "ko_dif": 2.5,
          "sub_dif": 0,
          "elo_dif": 0.8669354838709677,
          "layoff_dif": -0.245,
          "cardio_dif": 0.07666666666666655,
          "peak_elo_dif": 2.090909090909091,
          "ufc_fight_count_dif": 1.25,
          "rank_tier_dif": 2.1863851222592006
        },
        "v2": {
          "modern_form": -0.41303396915921475,
          "wins": 6,
          "losses": -4,
          "rounds": 33,
          "title_bouts": 0,
          "ko_wins": 5,
          "sub_wins": 0,
          "height": -1,
          "reach": 1,
          "younger": -3,
          "sig_str_landed": -2.0160000000000005,
          "sig_str_accuracy": -0.0484,
          "sub_attempts": 0.15000000000000002,
          "td_landed": 0.08999999999999997,
          "td_accuracy": 0.17,
          "elo": 0.43
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-28",
        "fighterB": "2026-04-18"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289302-lk7wu3",
    "createdAt": "2026-09-18T16:18:09.302Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Giga Chikadze",
    "fighterB": "Joanderson Brito",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.14981058452806545,
    "fighterBProb": 0.8501894154719345,
    "predictedWinner": "Joanderson Brito",
    "predictedProb": 0.8501894154719345,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Joanderson Brito",
    "trackedProb": 0.7676478405753304,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-365",
    "edge": -0.017298395983809334,
    "edgeA": 0.017298395983809334,
    "edgeB": -0.017298395983809334,
    "ev": -2.203768255471605,
    "evA": 8.04375413247135,
    "evB": -2.203768255471605,
    "kelly": 0,
    "kellyA": 0.02203768255471602,
    "kellyB": 0,
    "fairLine": "-330",
    "fairLineA": "+330",
    "fairLineB": "-330",
    "oddsA": "+365",
    "oddsB": "-365",
    "v2pA": 0.23235215942466955,
    "v2pB": 0.7676478405753304,
    "projectedKO": 38,
    "projectedSUB": 19,
    "projectedDEC": 43,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.302Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.058860759493670894,
          "avg_sig_str_pct_dif": -1.0359999999999996,
          "avg_td_dif": -2.064285714285714,
          "avg_td_pct_dif": -1.173913043478261,
          "atd_dif": 1.2000000000000004,
          "avg_sub_att_dif": -1.6714285714285717,
          "kd_dif": -0.4719999999999999,
          "control_time_dif": -1.5388888888888888,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0.43956043956043955,
          "age_dif": -1.627906976744186,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -3,
          "win_dif": 0.22727272727272727,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 0.7647058823529411,
          "deep_round_dif": 0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": -2.142857142857143,
          "elo_dif": -1.3709677419354838,
          "layoff_dif": -0.875,
          "cardio_dif": -0.4970833333333332,
          "peak_elo_dif": 0.03636363636363636,
          "ufc_fight_count_dif": 0.25,
          "rank_tier_dif": 1.736044097509195
        },
        "v2": {
          "modern_form": -0.3763721627000606,
          "wins": 1,
          "losses": -1,
          "rounds": 13,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": -3,
          "height": 4,
          "reach": 2,
          "younger": -7,
          "sig_str_landed": 0.9300000000000002,
          "sig_str_accuracy": -0.10359999999999997,
          "sub_attempts": -1.1700000000000002,
          "td_landed": -2.8899999999999997,
          "td_accuracy": -0.27,
          "elo": -0.68
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-13",
        "fighterB": "2026-06-06"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289302-ezju1g",
    "createdAt": "2026-09-18T16:18:09.302Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Ozzy Diaz",
    "fighterB": "Ryan Gandra",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.265945309975059,
    "fighterBProb": 0.734054690024941,
    "predictedWinner": "Ryan Gandra",
    "predictedProb": 0.734054690024941,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Ryan Gandra",
    "trackedProb": 0.7032956525886072,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-441",
    "edge": -0.11186146386240947,
    "edgeA": 0.11186146386240942,
    "edgeB": -0.11186146386240947,
    "ev": -13.722687516907834,
    "evA": 60.51705194956351,
    "evB": -13.722687516907834,
    "kelly": 0,
    "kellyA": 0.13722687516907828,
    "kellyB": 0,
    "fairLine": "-237",
    "fairLineA": "+237",
    "fairLineB": "-237",
    "oddsA": "+441",
    "oddsB": "-441",
    "v2pA": 0.2967043474113928,
    "v2pB": 0.7032956525886072,
    "projectedKO": 56,
    "projectedSUB": 6,
    "projectedDEC": 38,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.302Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.027415310086473826,
          "avg_sig_str_pct_dif": 0.023153348542457874,
          "avg_td_dif": -0.28247930472569255,
          "avg_td_pct_dif": -0.4337422163442996,
          "atd_dif": 0,
          "avg_sub_att_dif": -0.19191338040919795,
          "kd_dif": -8,
          "control_time_dif": 0,
          "reach_dif": 0.4629629629629629,
          "height_dif": 0.32967032967032966,
          "age_dif": -1.1627906976744187,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -1,
          "win_dif": -0.22727272727272727,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.23529411764705882,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 0,
          "elo_dif": -2.318548387096774,
          "layoff_dif": -0.315,
          "cardio_dif": 0,
          "peak_elo_dif": -1.3818181818181818,
          "ufc_fight_count_dif": 0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.5877049180327869,
          "wins": -1,
          "losses": -2,
          "rounds": 4,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 0,
          "height": 3,
          "reach": 5,
          "younger": -5,
          "sig_str_landed": -0.43316189936628646,
          "sig_str_accuracy": 0.0023153348542457874,
          "sub_attempts": -0.13433936628643856,
          "td_landed": -0.39547102661596956,
          "td_accuracy": -0.09976070975918891,
          "elo": -1.15
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-09",
        "fighterB": "2026-07-11"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289302-vuvlqn",
    "createdAt": "2026-09-18T16:18:09.302Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Edmen Shahbazyan",
    "fighterB": "Brunno Ferreira",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6206201221196082,
    "fighterBProb": 0.37937987788039185,
    "predictedWinner": "Edmen Shahbazyan",
    "predictedProb": 0.6206201221196082,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Edmen Shahbazyan",
    "trackedProb": 0.6663570029977953,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-167",
    "edge": 0.04088883820378786,
    "edgeA": 0.04088883820378786,
    "edgeB": -0.04088883820378786,
    "ev": 6.537317245755283,
    "evA": 6.537317245755283,
    "evB": -10.917319800411349,
    "kelly": 0.1091731980041133,
    "kellyA": 0.1091731980041133,
    "kellyB": 0,
    "fairLine": "-200",
    "fairLineA": "-200",
    "fairLineB": "+200",
    "oddsA": "-167",
    "oddsB": "+167",
    "v2pA": 0.6663570029977953,
    "v2pB": 0.3336429970022047,
    "projectedKO": 54,
    "projectedSUB": 20,
    "projectedDEC": 25,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.302Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.061499999999999985,
          "avg_sig_str_pct_dif": 0.23160000000000014,
          "avg_td_dif": 0.2928571428571428,
          "avg_td_pct_dif": 0.5652173913043477,
          "atd_dif": 0.33333333333333365,
          "avg_sub_att_dif": -0.35714285714285715,
          "kd_dif": 0.1880000000000001,
          "control_time_dif": 0.15000000000000002,
          "reach_dif": 0.27777777777777773,
          "height_dif": 0.43956043956043955,
          "age_dif": 1.1627906976744187,
          "win_streak_dif": 0,
          "lose_streak_dif": 1,
          "win_dif": 0.6818181818181818,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.7647058823529411,
          "deep_round_dif": 0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 1.5,
          "sub_dif": -0.7142857142857143,
          "elo_dif": 0.7862903225806451,
          "layoff_dif": -0.105,
          "cardio_dif": -1.9220833333333336,
          "peak_elo_dif": 0.4909090909090909,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": -1.736044097509195
        },
        "v2": {
          "modern_form": 0.08765599574270427,
          "wins": 3,
          "losses": -2,
          "rounds": 13,
          "title_bouts": 0,
          "ko_wins": 3,
          "sub_wins": -1,
          "height": 4,
          "reach": 3,
          "younger": 5,
          "sig_str_landed": 0.9716999999999998,
          "sig_str_accuracy": 0.023160000000000014,
          "sub_attempts": -0.25,
          "td_landed": 0.4099999999999999,
          "td_accuracy": 0.12999999999999998,
          "elo": 0.39
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-06",
        "fighterB": "2026-06-27"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289301-clgkuv",
    "createdAt": "2026-09-18T16:18:09.301Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Michael Aswell Jr.",
    "fighterB": "JooSang Yoo",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.4772294340730925,
    "fighterBProb": 0.5227705659269075,
    "predictedWinner": "JooSang Yoo",
    "predictedProb": 0.5227705659269075,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Michael Aswell Jr.",
    "trackedProb": 0.5329841969126622,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "+199",
    "edge": 0.19853603637754513,
    "edgeA": 0.19853603637754513,
    "edgeB": -0.19853603637754513,
    "ev": 59.362274876886005,
    "evA": 59.362274876886005,
    "evB": -29.830288882857285,
    "kelly": 0.2983028888285728,
    "kellyA": 0.2983028888285728,
    "kellyB": 0,
    "fairLine": "-114",
    "fairLineA": "-114",
    "fairLineB": "+114",
    "oddsA": "+199",
    "oddsB": "-199",
    "v2pA": 0.5329841969126622,
    "v2pB": 0.4670158030873378,
    "projectedKO": 60,
    "projectedSUB": 12,
    "projectedDEC": 28,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.301Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.04940205880335767,
          "avg_sig_str_pct_dif": -0.7416043533568911,
          "avg_td_dif": -0.3473794716473162,
          "avg_td_pct_dif": 0.08096891483586827,
          "atd_dif": 0.6666666666666665,
          "avg_sub_att_dif": -0.3762228504122496,
          "kd_dif": -1.8679999999999997,
          "control_time_dif": 0.07222222222222223,
          "reach_dif": -0.18518518518518517,
          "height_dif": 0.10989010989010989,
          "age_dif": 1.627906976744186,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": 0,
          "loss_dif": -0.7407407407407407,
          "total_round_dif": 0.4117647058823529,
          "deep_round_dif": 0.17647058823529413,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": -0.6653225806451613,
          "layoff_dif": 1.295,
          "cardio_dif": 0.32833333333333325,
          "peak_elo_dif": -0.38181818181818183,
          "ufc_fight_count_dif": 0.25,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.13211382113821143,
          "wins": 0,
          "losses": -2,
          "rounds": 7,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 1,
          "reach": -2,
          "younger": 7,
          "sig_str_landed": 0.7805525290930513,
          "sig_str_accuracy": -0.07416043533568911,
          "sub_attempts": -0.26335599528857473,
          "td_landed": -0.48633126030624263,
          "td_accuracy": 0.018622850412249703,
          "elo": -0.33
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-06-20",
        "fighterB": "2025-10-04"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289301-6j56xp",
    "createdAt": "2026-09-18T16:18:09.301Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Tai Tuivasa",
    "fighterB": "Robelis Despaigne",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6286634976052111,
    "fighterBProb": 0.3713365023947889,
    "predictedWinner": "Tai Tuivasa",
    "predictedProb": 0.6286634976052111,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Tai Tuivasa",
    "trackedProb": 0.5220053592259718,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "+471",
    "edge": 0.34687401071458823,
    "edgeA": 0.34687401071458823,
    "edgeB": -0.34687401071458823,
    "ev": 198.06506011802986,
    "evA": 198.06506011802986,
    "evB": -42.05202974905094,
    "kelly": 0.4205202974905093,
    "kellyA": 0.4205202974905093,
    "kellyB": 0,
    "fairLine": "-109",
    "fairLineA": "-109",
    "fairLineB": "+109",
    "oddsA": "+471",
    "oddsB": "-471",
    "v2pA": 0.5220053592259718,
    "v2pB": 0.4779946407740282,
    "projectedKO": 60,
    "projectedSUB": 11,
    "projectedDEC": 29,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.301Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.0034109806313862823,
          "avg_sig_str_pct_dif": -0.5404968353413647,
          "avg_td_dif": -0.5012277682157201,
          "avg_td_pct_dif": -0.7047738781211802,
          "atd_dif": 0,
          "avg_sub_att_dif": -0.3695238095238095,
          "kd_dif": 0.456,
          "control_time_dif": 0,
          "reach_dif": -0.8333333333333333,
          "height_dif": -0.5494505494505495,
          "age_dif": 1.1627906976744187,
          "win_streak_dif": 0,
          "lose_streak_dif": -5,
          "win_dif": 1.5909090909090908,
          "loss_dif": -2.962962962962963,
          "total_round_dif": 1.6470588235294117,
          "deep_round_dif": 0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": 3,
          "sub_dif": 0,
          "elo_dif": 0.8266129032258064,
          "layoff_dif": 2.8,
          "cardio_dif": 0.12458333333333257,
          "peak_elo_dif": 2.672727272727273,
          "ufc_fight_count_dif": 1.875,
          "rank_tier_dif": 1.736044097509195
        },
        "v2": {
          "modern_form": -0.10451726056960242,
          "wins": 7,
          "losses": -8,
          "rounds": 28,
          "title_bouts": 0,
          "ko_wins": 6,
          "sub_wins": 0,
          "height": -5,
          "reach": -9,
          "younger": 5,
          "sig_str_landed": 0.05389349397590326,
          "sig_str_accuracy": -0.05404968353413647,
          "sub_attempts": -0.2586666666666666,
          "td_landed": -0.7017188755020081,
          "td_accuracy": -0.16209799196787145,
          "elo": 0.41
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-02",
        "fighterB": "2024-10-19"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289301-f9v35g",
    "createdAt": "2026-09-18T16:18:09.301Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Gable Steveson",
    "fighterB": "Sean Sharaf",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6706996051466008,
    "fighterBProb": 0.32930039485339924,
    "predictedWinner": "Gable Steveson",
    "predictedProb": 0.6706996051466008,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Gable Steveson",
    "trackedProb": 0.6807790877219458,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-1233",
    "edge": -0.24420215758938202,
    "edgeA": -0.24420215758938202,
    "edgeB": 0.244202157589382,
    "ev": -26.40076853744089,
    "evA": -26.40076853744089,
    "evB": 325.5214760666462,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.2640076853744089,
    "fairLine": "-213",
    "fairLineA": "-213",
    "fairLineB": "+213",
    "oddsA": "-1233",
    "oddsB": "+1233",
    "v2pA": 0.6807790877219458,
    "v2pB": 0.31922091227805416,
    "projectedKO": 56,
    "projectedSUB": 6,
    "projectedDEC": 38,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.301Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.03615979360479894,
          "avg_sig_str_pct_dif": 0.5240620722891565,
          "avg_td_dif": 0.010817555938037777,
          "avg_td_pct_dif": 0.13675397241138434,
          "atd_dif": 1.0666666666666667,
          "avg_sub_att_dif": 0.13857142857142854,
          "kd_dif": 8,
          "control_time_dif": -0.13333333333333333,
          "reach_dif": -7.129629629629629,
          "height_dif": -8.241758241758243,
          "age_dif": 0,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 2,
          "win_dif": 0.22727272727272727,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.17647058823529413,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 2.5201612903225805,
          "layoff_dif": 1.05,
          "cardio_dif": 0,
          "peak_elo_dif": 0.7454545454545455,
          "ufc_fight_count_dif": -0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.8500000000000001,
          "wins": 1,
          "losses": 2,
          "rounds": -3,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": -6,
          "reach": -7,
          "younger": 0,
          "sig_str_landed": 0.5713247389558234,
          "sig_str_accuracy": 0.05240620722891565,
          "sub_attempts": 0.09699999999999998,
          "td_landed": 0.015144578313252888,
          "td_accuracy": 0.0314534136546184,
          "elo": 1.25
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-11",
        "fighterB": "2025-12-13"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289300-cnst5s",
    "createdAt": "2026-09-18T16:18:09.300Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Patricio Pitbull",
    "fighterB": "Dooho Choi",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.15424638484818776,
    "fighterBProb": 0.8457536151518122,
    "predictedWinner": "Dooho Choi",
    "predictedProb": 0.8457536151518122,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Dooho Choi",
    "trackedProb": 0.7973875196461249,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-239",
    "edge": 0.09237277038358804,
    "edgeA": -0.09237277038358796,
    "edgeB": 0.09237277038358804,
    "ev": 13.10224651047545,
    "evA": -31.31436916003632,
    "evB": 13.10224651047545,
    "kelly": 0.3131436916003633,
    "kellyA": 0,
    "kellyB": 0.3131436916003633,
    "fairLine": "-394",
    "fairLineA": "+394",
    "fairLineB": "-394",
    "oddsA": "+239",
    "oddsB": "-239",
    "v2pA": 0.20261248035387516,
    "v2pB": 0.7973875196461249,
    "projectedKO": 43,
    "projectedSUB": 7,
    "projectedDEC": 50,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.300Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.08343324560540326,
          "avg_sig_str_pct_dif": -1.0695320424028258,
          "avg_td_dif": -0.04326784452296824,
          "avg_td_pct_dif": -1.244393916116147,
          "atd_dif": 0.8666666666666667,
          "avg_sub_att_dif": -0.12647511357900068,
          "kd_dif": -2.4,
          "control_time_dif": -0.5722222222222223,
          "reach_dif": -0.27777777777777773,
          "height_dif": -0.43956043956043955,
          "age_dif": -0.9302325581395349,
          "win_streak_dif": -2.142857142857143,
          "lose_streak_dif": -1,
          "win_dif": -1.3636363636363635,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -1,
          "deep_round_dif": -0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": -3,
          "sub_dif": 0,
          "elo_dif": -3.064516129032258,
          "layoff_dif": -0.175,
          "cardio_dif": 0.2874999999999998,
          "peak_elo_dif": -2.4545454545454546,
          "ufc_fight_count_dif": -1,
          "rank_tier_dif": 1.90625136547763
        },
        "v2": {
          "modern_form": -0.5808964919726822,
          "wins": -6,
          "losses": 2,
          "rounds": -17,
          "title_bouts": 0,
          "ko_wins": -6,
          "sub_wins": 0,
          "height": -4,
          "reach": -3,
          "younger": -4,
          "sig_str_landed": -1.3182452805653715,
          "sig_str_accuracy": -0.1069532042402826,
          "sub_attempts": -0.08853257950530047,
          "td_landed": -0.060574982332155525,
          "td_accuracy": -0.28621060070671384,
          "elo": -1.52
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2026-05-16"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289300-7net38",
    "createdAt": "2026-09-18T16:18:09.300Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Alonzo Menifield",
    "fighterB": "Iwo Baraniewski",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Light Heavyweight",
    "boutContext": {
      "division": "Light Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.48539819690907055,
    "fighterBProb": 0.5146018030909294,
    "predictedWinner": "Iwo Baraniewski",
    "predictedProb": 0.5146018030909294,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Iwo Baraniewski",
    "trackedProb": 0.6612766250521959,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-228",
    "edge": -0.03384532616731628,
    "edgeA": 0.033845326167316336,
    "edgeB": -0.03384532616731628,
    "ev": -4.868976746877081,
    "evA": 11.10126698287975,
    "evB": -4.868976746877081,
    "kelly": 0,
    "kellyA": 0.04868976746877086,
    "kellyB": 0,
    "fairLine": "-195",
    "fairLineA": "+195",
    "fairLineB": "-195",
    "oddsA": "+228",
    "oddsB": "-228",
    "v2pA": 0.33872337494780413,
    "v2pB": 0.6612766250521959,
    "projectedKO": 60,
    "projectedSUB": 14,
    "projectedDEC": 26,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.300Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Light Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.08603272615004624,
          "avg_sig_str_pct_dif": 0.33253658536585795,
          "avg_td_dif": -0.387142857142857,
          "avg_td_pct_dif": 0.567338282078473,
          "atd_dif": 0.6666666666666673,
          "avg_sub_att_dif": -0.23212543554006976,
          "kd_dif": -6.856,
          "control_time_dif": 0.17222222222222222,
          "reach_dif": 0.27777777777777773,
          "height_dif": 0,
          "age_dif": -2.558139534883721,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": 1.8181818181818181,
          "loss_dif": -2.222222222222222,
          "total_round_dif": 1.8823529411764706,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 1.4285714285714286,
          "elo_dif": 0.48387096774193544,
          "layoff_dif": -0.035,
          "cardio_dif": 0.9699999999999996,
          "peak_elo_dif": 1.1636363636363636,
          "ufc_fight_count_dif": 1.75,
          "rank_tier_dif": 1.8195734938548842
        },
        "v2": {
          "modern_form": -0.2955498340454461,
          "wins": 8,
          "losses": -6,
          "rounds": 32,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 2,
          "height": 0,
          "reach": 3,
          "younger": -11,
          "sig_str_landed": -1.3593170731707307,
          "sig_str_accuracy": 0.033253658536585795,
          "sub_attempts": -0.1624878048780488,
          "td_landed": -0.5419999999999998,
          "td_accuracy": 0.1304878048780488,
          "elo": 0.24
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-30",
        "fighterB": "2026-06-06"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289300-wwrewe",
    "createdAt": "2026-09-18T16:18:09.300Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Alexandre Pantoja",
    "fighterB": "Joshua Van",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": true,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.2915739003870166,
    "fighterBProb": 0.7084260996129834,
    "predictedWinner": "Joshua Van",
    "predictedProb": 0.7084260996129834,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Joshua Van",
    "trackedProb": 0.7223843403296205,
    "unitsWagered": 1,
    "betAction": "BET",
    "bestBet": "B",
    "betRecommendedFighter": "Joshua Van",
    "betRecommendedOdds": "-130",
    "marketOdds": "-130",
    "edge": 0.15716694902527273,
    "edgeA": -0.15716694902527267,
    "edgeB": 0.15716694902527273,
    "ev": 27.806460212163618,
    "evA": -36.14839827581272,
    "evB": 27.806460212163618,
    "kelly": 0.3614839827581271,
    "kellyA": 0,
    "kellyB": 0.3614839827581271,
    "fairLine": "-260",
    "fairLineA": "+260",
    "fairLineB": "-260",
    "oddsA": "+130",
    "oddsB": "-130",
    "v2pA": 0.2776156596703795,
    "v2pB": 0.7223843403296205,
    "projectedKO": 27,
    "projectedSUB": 17,
    "projectedDEC": 56,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.300Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "BET",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": true,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.2757341772151899,
          "avg_sig_str_pct_dif": -0.8399999999999996,
          "avg_td_dif": 1.4071428571428575,
          "avg_td_pct_dif": -0.6086956521739131,
          "atd_dif": -0.8000000000000007,
          "avg_sub_att_dif": 1.1,
          "kd_dif": -0.6679999999999999,
          "control_time_dif": 0.7555555555555555,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0,
          "age_dif": -2.7906976744186047,
          "win_streak_dif": -5,
          "lose_streak_dif": -1,
          "win_dif": 0.9090909090909091,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 0.9411764705882353,
          "deep_round_dif": 0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 4.285714285714286,
          "elo_dif": -0.10080645161290322,
          "layoff_dif": -0.77,
          "cardio_dif": -0.6983333333333333,
          "peak_elo_dif": 0.6545454545454545,
          "ufc_fight_count_dif": 0.875,
          "rank_tier_dif": -0.2799999999999998
        },
        "v2": {
          "modern_form": -0.20193623899916635,
          "wins": 4,
          "losses": -3,
          "rounds": 16,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 6,
          "height": 0,
          "reach": 2,
          "younger": -12,
          "sig_str_landed": -4.3566,
          "sig_str_accuracy": -0.08399999999999996,
          "sub_attempts": 0.77,
          "td_landed": 1.9700000000000002,
          "td_accuracy": -0.14,
          "elo": -0.05
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-06",
        "fighterB": "2026-05-09"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  },
  {
    "id": "1789748289298-av6323",
    "createdAt": "2026-09-18T16:18:09.299Z",
    "eventName": "UFC 331",
    "eventDate": "2026-09-19",
    "fighterA": "Arman Tsarukyan",
    "fighterB": "Mauricio Ruffy",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
        "retrievedAt": "2026-09-18",
        "authority": "official"
      }
    },
    "fighterAProb": 0.7454990531219555,
    "fighterBProb": 0.2545009468780445,
    "predictedWinner": "Arman Tsarukyan",
    "predictedProb": 0.7454990531219555,
    "modelUsed": "v2",
    "decisionProbabilitySource": "v2",
    "trackedSide": "Arman Tsarukyan",
    "trackedProb": 0.6621948697965594,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-292",
    "edge": -0.08270308938711413,
    "edgeA": -0.08270308938711413,
    "edgeB": 0.08270308938711407,
    "ev": -11.102606520461887,
    "evA": -11.102606520461887,
    "evB": 32.419611039748716,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.1110260652046189,
    "fairLine": "-196",
    "fairLineA": "-196",
    "fairLineB": "+196",
    "oddsA": "-292",
    "oddsB": "+292",
    "v2pA": 0.6621948697965594,
    "v2pB": 0.3378051302034406,
    "projectedKO": 55,
    "projectedSUB": 10,
    "projectedDEC": 35,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-18T16:18:09.299Z",
      "targetEventDate": "2026-09-19",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/news/official-weigh-results-cryptocom-ufc-331-van-vs-pantoja-2",
          "retrievedAt": "2026-09-18",
          "authority": "official"
        }
      },
      "decisionProbabilitySource": "v2",
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.0001988985847158363,
          "avg_sig_str_pct_dif": -0.2338964577656666,
          "avg_td_dif": 1.9578045932269363,
          "avg_td_pct_dif": 1.1643170240492833,
          "atd_dif": -0.11111111111111072,
          "avg_sub_att_dif": -0.10454132606721155,
          "kd_dif": -2.1999999999999997,
          "control_time_dif": 0.9777777777777779,
          "reach_dif": -0.27777777777777773,
          "height_dif": -0.43956043956043955,
          "age_dif": 0.23255813953488372,
          "win_streak_dif": 2.142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 1.1363636363636362,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 1.2941176470588236,
          "deep_round_dif": 0.4117647058823529,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 2.096774193548387,
          "layoff_dif": -1.02,
          "cardio_dif": 0.9454166666666671,
          "peak_elo_dif": 1.8909090909090909,
          "ufc_fight_count_dif": 0.75,
          "rank_tier_dif": 0.8179859912634107
        },
        "v2": {
          "modern_form": 0.07578233383030641,
          "wins": 5,
          "losses": -1,
          "rounds": 22,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 1,
          "height": -4,
          "reach": -3,
          "younger": 1,
          "sig_str_landed": -0.003142597638510214,
          "sig_str_accuracy": -0.02338964577656666,
          "sub_attempts": -0.07317892824704808,
          "td_landed": 2.740926430517711,
          "td_accuracy": 0.26779291553133516,
          "elo": 1.04
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-11-22",
        "fighterB": "2026-06-14"
      },
      "sourceManifest": {
        "fightHistory": {
          "file": "src/fightHistory.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "b2a611d937a140f8bf9cdf58f20787d7a7d3c02561bc3fcff5308c656c531874",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "fightersDataAggregates": {
          "file": "src/fightersData.js",
          "feedsV2": true,
          "note": "Feeds ASL/ASP/ATL/ATP/ASA (sig_str_landed, sig_str_accuracy, sub_attempts, td_landed, td_accuracy) and TR (rounds) -- the highest-weight non-ELO v2 features.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "d74f935f2efe851a7021aad4a2df2ce055b92ef3d04fd2dbe23e757d84c16f58",
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
          "generatorVersion": "update_fighters.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates."
        },
        "elo": {
          "file": "src/eloModule.js",
          "feedsV2": true,
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-09-05",
          "contentHash": "319c48b19de5447afa6a79aa996a2f376a3642e110a3c5f312e94a02b971ad07",
          "sourceInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorRequiredInputs": [
            "ufc_fight_results.csv",
            "ufc_event_details.csv"
          ],
          "generatorVersion": "regen_elo.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Parsed DATE column of ufc_event_details.csv directly (787 rows); maximum event date found = 2026-09-05. Cross-checked ufc_fight_results.csv, ufc_fight_details.csv, ufc_fight_stats.csv for window-period event names: FOUND (see manual audit). This value is NOT derived from any file mtime, git commit date, or in-file header comment -- see research/source_integrity_audit.md for the original manual methodology this script automates. NOTE: eloModule.js's own header comment claims coverage \"through Jul 2026\" -- this is misleading relative to the verified underlying data and should not be trusted; regen_elo.py reads only ufc_fight_results.csv + ufc_event_details.csv. Unlike ELO, the fighter aggregate updater also requires ufc_fight_details.csv and ufc_fight_stats.csv."
        },
        "cardio": {
          "file": "src/cardioModule.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "7025f1f440bbf01c15731cc40e65521e50635902ee482536cd07a412738b788c",
          "generatorVersion": "unavailable -- no cardio-generation script found in repo",
          "verificationMethod": "INDETERMINATE: no generator script present in the repository, and no per-fighter date field is embedded in the shipped artifact itself, so maxObservedEventDate cannot be independently verified the way the Greco-CSV-backed modules above were. The file's own header comment self-reports \"fetched 2026-04-14\" -- this is NOT independently verified and should not be treated as authoritative."
        },
        "rankHistory": {
          "file": "src/rankHistory.js",
          "feedsV2": false,
          "note": "Does not feed MODEL_V2 (no path into computeLogisticProb's 16 features, confirmed in research/source_integrity_audit.md). Tracked here for future model versions that might use it.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": "2026-03-12",
          "contentHash": "9a706f356ef41fa68b605dd9c52740dd370eda014dfb747b0cb8bdc6313ba244",
          "generatorVersion": "regen_rankhistory.py (untracked in git -- present on disk, no commit history, no recoverable version)",
          "verificationMethod": "Raw source UFC_rankings_history.csv is not present on disk, so maxObservedEventDate is instead the maximum YYYYMMDD date literally embedded in the shipped rankHistory.js artifact's own HISTORICAL_RANKINGS data -- a defensible proxy (the artifact cannot reflect dates its regeneration process never saw), but distinct from the direct-CSV verification used for the three modules above."
        },
        "fighterBirthdates": {
          "file": "src/fighterBirthdates.js",
          "feedsV2": true,
          "note": "Canonical fighter name -> date of birth. Feeds the v2 'younger' feature and the v1 age differential/age-decay penalty via src/domain/age, which derives every age from DOB -- at app load for the roster, and at the bout date for a prediction. The integer AGE values in fightersData.js are now used only where no birth date exists here.",
          "generatedAt": "2026-09-09",
          "maxObservedEventDate": null,
          "contentHash": "560e7d5207c1766a57380ce852767ea03b004a89e2281c3be3dd11fc9e63cd5d",
          "generatorVersion": "scripts/generate-fighter-birthdates.mjs @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
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
          "generatorVersion": "scripts/update_rankings.py @ d3431632853b370455e09a88810fb6f078be03d0",
          "verificationMethod": "Read directly from the generated artifacts and the committed history cache, all produced by scripts/update_rankings.py and regenerating byte-identically from the same inputs. upstreamContentSha256 is the SHA-256 of the Kaggle CSV the cache was built from. No git commit date, file mtime, or header comment is consulted, and a missing artifact, cache or snapshot set is a hard failure rather than a silent fallback."
        }
      }
    }
  }
];
