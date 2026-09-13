export const UPCOMING_ENTRIES = [
  {
    "id": "1789266615965-s7a9ls",
    "createdAt": "2026-09-13T02:30:15.965Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Jean Silva",
    "fighterB": "Jose Delgado",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 5,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.6184564100036817,
    "fighterBProb": 0.3815435899963183,
    "predictedWinner": "Jean Silva",
    "predictedProb": 0.6184564100036817,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7704870225905359,
    "c6ProbB": 0.22951297740946408,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Jean Silva",
    "trackedProb": 0.7704870225905359,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-450",
    "edge": -0.0041031413438903375,
    "edgeA": -0.0041031413438903375,
    "edgeB": 0.00410314134389031,
    "ev": -5.829363905601156,
    "evA": -5.829363905601156,
    "evB": -3.6045494880250857,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-336",
    "fairLineA": "-336",
    "fairLineB": "+336",
    "oddsA": "-450",
    "oddsB": "+320",
    "v2pA": 0.5324341049585339,
    "v2pB": 0.46756589504146606,
    "projectedKO": 53,
    "projectedSUB": 13,
    "projectedDEC": 34,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:30:15.965Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 5,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7704870225905359,
        "pB": 0.22951297740946408
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.06313622429962279,
          "avg_sig_str_pct_dif": 0.02808951707891638,
          "avg_td_dif": 0.2943883897021707,
          "avg_td_pct_dif": 1.9038521022174422,
          "atd_dif": 1.6088888888888901,
          "avg_sub_att_dif": 0.8387616355376073,
          "kd_dif": 0.8279999999999998,
          "control_time_dif": 0.5944444444444444,
          "reach_dif": -0.4629629629629629,
          "height_dif": -0.43956043956043955,
          "age_dif": -0.23255813953488372,
          "win_streak_dif": -0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 0.45454545454545453,
          "loss_dif": 0,
          "total_round_dif": 0.17647058823529413,
          "deep_round_dif": -0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 1.3911290322580645,
          "layoff_dif": -0.875,
          "cardio_dif": -2.110833333333334,
          "peak_elo_dif": 1.490909090909091,
          "ufc_fight_count_dif": 0.25,
          "rank_tier_dif": 2.611707935929908
        },
        "v2": {
          "modern_form": -0.00965850179390515,
          "wins": 2,
          "losses": 0,
          "rounds": 3,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 1,
          "height": -4,
          "reach": -5,
          "younger": -1,
          "sig_str_landed": -0.9975523439340401,
          "sig_str_accuracy": 0.002808951707891638,
          "sub_attempts": 0.5871331448763251,
          "td_landed": 0.4121437455830389,
          "td_accuracy": 0.43788598351001173,
          "elo": 0.69
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-01-24",
        "fighterB": "2026-07-18"
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
    "id": "1789266584403-dsubhf",
    "createdAt": "2026-09-13T02:29:44.403Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Brandon Moreno",
    "fighterB": "Joseph Morales",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.5640095273705932,
    "fighterBProb": 0.4359904726294068,
    "predictedWinner": "Brandon Moreno",
    "predictedProb": 0.5640095273705932,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5137459725408179,
    "c6ProbB": 0.4862540274591821,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Brandon Moreno",
    "trackedProb": 0.5137459725408179,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-105",
    "edge": 0.029469242981069455,
    "edgeA": 0.029469242981069455,
    "edgeB": -0.029469242981069455,
    "ev": 0.30278511511205863,
    "evA": 0.30278511511205863,
    "evB": -10.85342829914994,
    "kelly": 0.0031792437086766157,
    "kellyA": 0.0031792437086766157,
    "kellyB": 0,
    "fairLine": "-106",
    "fairLineA": "-106",
    "fairLineB": "+106",
    "oddsA": "-105",
    "oddsB": "-120",
    "v2pA": 0.5513867669850777,
    "v2pB": 0.4486132330149223,
    "projectedKO": 22,
    "projectedSUB": 42,
    "projectedDEC": 36,
    "projectedFinish": "SUB",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:29:44.403Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5137459725408179,
        "pB": 0.4862540274591821
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.037407542916594455,
          "avg_sig_str_pct_dif": 0.007298630136987616,
          "avg_td_dif": 0.04252113502935449,
          "avg_td_pct_dif": 0.0599523525908281,
          "atd_dif": 1.6933333333333334,
          "avg_sub_att_dif": -2.3620939334637967,
          "kd_dif": 0.344,
          "control_time_dif": -0.3888888888888889,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0.10989010989010989,
          "age_dif": 0,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": -2,
          "win_dif": 1.8181818181818181,
          "loss_dif": -1.8518518518518516,
          "total_round_dif": 3.588235294117647,
          "deep_round_dif": 0.8823529411764706,
          "total_title_bout_dif": 0,
          "ko_dif": 1.5,
          "sub_dif": 0,
          "elo_dif": 1.6733870967741935,
          "layoff_dif": 0.56,
          "cardio_dif": 0.6912499999999998,
          "peak_elo_dif": 2.709090909090909,
          "ufc_fight_count_dif": 1.625,
          "rank_tier_dif": 2.2868892322350685
        },
        "v2": {
          "modern_form": -0.21364971384126025,
          "wins": 8,
          "losses": -5,
          "rounds": 61,
          "title_bouts": 0,
          "ko_wins": 3,
          "sub_wins": 0,
          "height": 1,
          "reach": 1,
          "younger": 0,
          "sig_str_landed": 0.5910391780821924,
          "sig_str_accuracy": 0.0007298630136987616,
          "sub_attempts": -1.6534657534246575,
          "td_landed": 0.05952958904109629,
          "td_accuracy": 0.013789041095890464,
          "elo": 0.83
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-28",
        "fighterB": "2025-11-08"
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
    "id": "1789266531493-ka3y1j",
    "createdAt": "2026-09-13T02:28:51.493Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Tommy McMillen",
    "fighterB": "Marwan Rahiki",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.49425399456017616,
    "fighterBProb": 0.5057460054398238,
    "predictedWinner": "Marwan Rahiki",
    "predictedProb": 0.5057460054398238,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.60278506687086,
    "c6ProbB": 0.39721493312914,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Tommy McMillen",
    "trackedProb": 0.60278506687086,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-170",
    "edge": 0.006071101224855546,
    "edgeA": 0.006071101224855546,
    "edgeB": -0.006071101224855491,
    "ev": -4.263548202863404,
    "evA": -4.263548202863404,
    "evB": -6.654490714652098,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-152",
    "fairLineA": "-152",
    "fairLineB": "+152",
    "oddsA": "-170",
    "oddsB": "+135",
    "v2pA": 0.5251995815147202,
    "v2pB": 0.47480041848527976,
    "projectedKO": 60,
    "projectedSUB": 12,
    "projectedDEC": 28,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:28:51.493Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.60278506687086,
        "pB": 0.39721493312914
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.18729495758226358,
          "avg_sig_str_pct_dif": -0.061747938751473,
          "avg_td_dif": -0.07139434628975261,
          "avg_td_pct_dif": -0.09195268090336446,
          "atd_dif": 0,
          "avg_sub_att_dif": -0.05374612148746421,
          "kd_dif": -1.3319999999999999,
          "control_time_dif": 0,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0.43956043956043955,
          "age_dif": -1.1627906976744187,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 0,
          "total_round_dif": 0.058823529411764705,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": -0.04032258064516129,
          "layoff_dif": 0.385,
          "cardio_dif": 0,
          "peak_elo_dif": -0.03636363636363636,
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
          "height": 4,
          "reach": 2,
          "younger": -5,
          "sig_str_landed": 2.959260329799765,
          "sig_str_accuracy": -0.0061747938751473,
          "sub_attempts": -0.037622285041224945,
          "td_landed": -0.09995208480565365,
          "td_accuracy": -0.021149116607773827,
          "elo": -0.02
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-07-18",
        "fighterB": "2026-05-02"
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
    "id": "1789266478128-kzt28b",
    "createdAt": "2026-09-13T02:27:58.128Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Manon Fiorot",
    "fighterB": "Alexa Grasso",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Flyweight",
    "boutContext": {
      "division": "Women's Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.5347855433516008,
    "fighterBProb": 0.4652144566483992,
    "predictedWinner": "Manon Fiorot",
    "predictedProb": 0.5347855433516008,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.7138645481551417,
    "c6ProbB": 0.28613545184485834,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Manon Fiorot",
    "trackedProb": 0.7138645481551417,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-300",
    "edge": 0.00477363906423256,
    "edgeA": 0.00477363906423256,
    "edgeB": -0.00477363906423256,
    "ev": -4.818060245981119,
    "evA": -4.818060245981119,
    "evB": -7.005978150421043,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-249",
    "fairLineA": "-249",
    "fairLineB": "+249",
    "oddsA": "-300",
    "oddsB": "+225",
    "v2pA": 0.5416359257510779,
    "v2pB": 0.4583640742489221,
    "projectedKO": 22,
    "projectedSUB": 10,
    "projectedDEC": 68,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:27:58.128Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.7138645481551417,
        "pB": 0.28613545184485834
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.09810126582278479,
          "avg_sig_str_pct_dif": 0.10000000000000009,
          "avg_td_dif": 0.46428571428571436,
          "avg_td_pct_dif": -0.2608695652173913,
          "atd_dif": 2.1999999999999997,
          "avg_sub_att_dif": -0.9571428571428573,
          "kd_dif": 0.716,
          "control_time_dif": 0.03333333333333331,
          "reach_dif": -0.09259259259259259,
          "height_dif": 0.21978021978021978,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -0.22727272727272727,
          "loss_dif": 1.4814814814814814,
          "total_round_dif": -1.1176470588235294,
          "deep_round_dif": -0.35294117647058826,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": -1.4285714285714286,
          "elo_dif": 1.411290322580645,
          "layoff_dif": -0.805,
          "cardio_dif": 0.343333333333333,
          "peak_elo_dif": 1.2727272727272727,
          "ufc_fight_count_dif": -0.625,
          "rank_tier_dif": 0.25570307748248355
        },
        "v2": {
          "modern_form": 0.16188685430902872,
          "wins": -1,
          "losses": 4,
          "rounds": -19,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": -2,
          "height": 2,
          "reach": -1,
          "younger": -3,
          "sig_str_landed": 1.5499999999999998,
          "sig_str_accuracy": 0.010000000000000009,
          "sub_attempts": -0.67,
          "td_landed": 0.65,
          "td_accuracy": -0.06,
          "elo": 0.7
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-10-18",
        "fighterB": "2026-03-28"
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
    "id": "1789266440405-xo4kkw",
    "createdAt": "2026-09-13T02:27:20.405Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Waldo Cortes Acosta",
    "fighterB": "Curtis Blaydes",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.4983095750160129,
    "fighterBProb": 0.5016904249839871,
    "predictedWinner": "Curtis Blaydes",
    "predictedProb": 0.5016904249839871,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.5624664268287424,
    "c6ProbB": 0.43753357317125763,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Waldo Cortes Acosta",
    "trackedProb": 0.5624664268287424,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-200",
    "edge": -0.06716320280088717,
    "edgeA": -0.06716320280088717,
    "edgeB": 0.06716320280088728,
    "ev": -15.630035975688642,
    "evA": -15.630035975688642,
    "evB": 11.571061158670688,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.0746520074752948,
    "fairLine": "-129",
    "fairLineA": "-129",
    "fairLineB": "+129",
    "oddsA": "-200",
    "oddsB": "+155",
    "v2pA": 0.39280076912997325,
    "v2pB": 0.6071992308700267,
    "projectedKO": 46,
    "projectedSUB": 7,
    "projectedDEC": 48,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:27:20.405Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.5624664268287424,
        "pB": 0.43753357317125763
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.05886075949367087,
          "avg_sig_str_pct_dif": -0.2916000000000002,
          "avg_td_dif": -3.3642857142857143,
          "avg_td_pct_dif": 0.0869565217391305,
          "atd_dif": 2.466666666666667,
          "avg_sub_att_dif": 0.14285714285714288,
          "kd_dif": -0.040000000000000036,
          "control_time_dif": -1.6277777777777775,
          "reach_dif": -0.18518518518518517,
          "height_dif": 0,
          "age_dif": 0.23255813953488372,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -0.9090909090909091,
          "loss_dif": 1.111111111111111,
          "total_round_dif": -1,
          "deep_round_dif": 0,
          "total_title_bout_dif": 0,
          "ko_dif": -1.5,
          "sub_dif": 0,
          "elo_dif": -0.020161290322580645,
          "layoff_dif": 0.14,
          "cardio_dif": 0.04458333333333305,
          "peak_elo_dif": -0.7454545454545455,
          "ufc_fight_count_dif": -0.875,
          "rank_tier_dif": -0.12092839843158654
        },
        "v2": {
          "modern_form": 0.12304322816213403,
          "wins": -4,
          "losses": 3,
          "rounds": -17,
          "title_bouts": 0,
          "ko_wins": -3,
          "sub_wins": 0,
          "height": 0,
          "reach": -2,
          "younger": 1,
          "sig_str_landed": 0.9299999999999997,
          "sig_str_accuracy": -0.02916000000000002,
          "sub_attempts": 0.1,
          "td_landed": -4.71,
          "td_accuracy": 0.020000000000000018,
          "elo": -0.01
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-09",
        "fighterB": "2026-04-11"
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
    "id": "1789266406460-xqb4i4",
    "createdAt": "2026-09-13T02:26:46.460Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "David Martinez",
    "fighterB": "Dan Ige",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Bantamweight",
    "boutContext": {
      "division": "Bantamweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.6909444684729529,
    "fighterBProb": 0.3090555315270471,
    "predictedWinner": "David Martinez",
    "predictedProb": 0.6909444684729529,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.45750357301054806,
    "c6ProbB": 0.5424964269894519,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Dan Ige",
    "trackedProb": 0.5424964269894519,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-210",
    "edge": -0.09535404030026773,
    "edgeA": 0.09535404030026767,
    "edgeB": -0.09535404030026773,
    "ev": -19.91719411108091,
    "evA": 18.950928982742518,
    "evB": -19.91719411108091,
    "kelly": 0,
    "kellyA": 0.11844330614214069,
    "kellyB": 0,
    "fairLine": "-119",
    "fairLineA": "+119",
    "fairLineB": "-119",
    "oddsA": "+160",
    "oddsB": "-210",
    "v2pA": 0.6553296072227311,
    "v2pB": 0.34467039277726885,
    "projectedKO": 34,
    "projectedSUB": 7,
    "projectedDEC": 59,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:26:46.460Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Bantamweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.45750357301054806,
        "pB": 0.5424964269894519
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.0546814031110272,
          "avg_sig_str_pct_dif": 0.16107462686567098,
          "avg_td_dif": 0.3304193319118692,
          "avg_td_pct_dif": 0.4016179969716638,
          "atd_dif": 1.5111111111111106,
          "avg_sub_att_dif": 0.33665955934612646,
          "kd_dif": 0.42800000000000005,
          "control_time_dif": 0.04444444444444443,
          "reach_dif": -0.37037037037037035,
          "height_dif": -0.21978021978021978,
          "age_dif": 1.627906976744186,
          "win_streak_dif": 2.142857142857143,
          "lose_streak_dif": 2,
          "win_dif": -1.8181818181818181,
          "loss_dif": 3.7037037037037033,
          "total_round_dif": -2.8823529411764706,
          "deep_round_dif": -0.7647058823529411,
          "total_title_bout_dif": 0,
          "ko_dif": -2,
          "sub_dif": -0.7142857142857143,
          "elo_dif": 0.08064516129032258,
          "layoff_dif": 0.035,
          "cardio_dif": 1.8729166666666668,
          "peak_elo_dif": -1.1272727272727272,
          "ufc_fight_count_dif": -2.25,
          "rank_tier_dif": 0.46731573838018425
        },
        "v2": {
          "modern_form": 0.6236398340146851,
          "wins": -8,
          "losses": 10,
          "rounds": -49,
          "title_bouts": 0,
          "ko_wins": -4,
          "sub_wins": -1,
          "height": -2,
          "reach": -4,
          "younger": 7,
          "sig_str_landed": 0.8639661691542297,
          "sig_str_accuracy": 0.016107462686567098,
          "sub_attempts": 0.2356616915422885,
          "td_landed": 0.4625870646766168,
          "td_accuracy": 0.09237213930348268,
          "elo": 0.04
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-28",
        "fighterB": "2026-02-21"
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
    "id": "1789266290791-a4lpmq",
    "createdAt": "2026-09-13T02:24:50.791Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Tim Elliott",
    "fighterB": "Edgar Chairez",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Flyweight",
    "boutContext": {
      "division": "Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.354647130735495,
    "fighterBProb": 0.645352869264505,
    "predictedWinner": "Edgar Chairez",
    "predictedProb": 0.645352869264505,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.32899529528193866,
    "c6ProbB": 0.6710047047180614,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Edgar Chairez",
    "trackedProb": 0.6710047047180614,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-210",
    "edge": 0.03315423742834178,
    "edgeA": -0.033154237428341726,
    "edgeB": 0.03315423742834178,
    "ev": -0.9469245416195022,
    "evA": -14.461223226695942,
    "evB": -0.9469245416195022,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-204",
    "fairLineA": "+204",
    "fairLineB": "-204",
    "oddsA": "+160",
    "oddsB": "-210",
    "v2pA": 0.4141934121425988,
    "v2pB": 0.5858065878574013,
    "projectedKO": 9,
    "projectedSUB": 33,
    "projectedDEC": 57,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:24:50.791Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.32899529528193866,
        "pB": 0.6710047047180614
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.037013941390671073,
          "avg_sig_str_pct_dif": -0.542500456621004,
          "avg_td_dif": 2.431792759295499,
          "avg_td_pct_dif": 1.7707087552114353,
          "atd_dif": 1.2044444444444444,
          "avg_sub_att_dif": -0.8483170254403134,
          "kd_dif": 0,
          "control_time_dif": 1.0722222222222222,
          "reach_dif": -0.4629629629629629,
          "height_dif": 0,
          "age_dif": -2.0930232558139537,
          "win_streak_dif": -2.142857142857143,
          "lose_streak_dif": -1,
          "win_dif": 1.3636363636363635,
          "loss_dif": -3.7037037037037033,
          "total_round_dif": 2.588235294117647,
          "deep_round_dif": 0.7058823529411765,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": -1.4314516129032258,
          "layoff_dif": -0.175,
          "cardio_dif": -1.775833333333333,
          "peak_elo_dif": -1,
          "ufc_fight_count_dif": 2,
          "rank_tier_dif": 2.0895317099709594
        },
        "v2": {
          "modern_form": -0.17018334481205927,
          "wins": 6,
          "losses": -10,
          "rounds": 44,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": 0,
          "reach": -5,
          "younger": -9,
          "sig_str_landed": -0.5848202739726029,
          "sig_str_accuracy": -0.0542500456621004,
          "sub_attempts": -0.5938219178082194,
          "td_landed": 3.4045098630136987,
          "td_accuracy": 0.40726301369863016,
          "elo": -0.71
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-02",
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
    "id": "1789266250418-xqwjm2",
    "createdAt": "2026-09-13T02:24:10.418Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Ignacio Bahamondes",
    "fighterB": "Muslim Salikhov",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Welterweight",
    "boutContext": {
      "division": "Welterweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.5411445979281757,
    "fighterBProb": 0.4588554020718243,
    "predictedWinner": "Ignacio Bahamondes",
    "predictedProb": 0.5411445979281757,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.8624868327473055,
    "c6ProbB": 0.13751316725269447,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Ignacio Bahamondes",
    "trackedProb": 0.8624868327473055,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-575",
    "edge": 0.04522794949857456,
    "edgeA": 0.04522794949857456,
    "edgeB": -0.04522794949857456,
    "ev": 1.2484542790315079,
    "evA": 1.2484542790315079,
    "evB": -27.805587192335402,
    "kelly": 0.07178612104431174,
    "kellyA": 0.07178612104431174,
    "kellyB": 0,
    "fairLine": "-627",
    "fairLineA": "-627",
    "fairLineB": "+627",
    "oddsA": "-575",
    "oddsB": "+425",
    "v2pA": 0.6955560945190067,
    "v2pB": 0.3044439054809933,
    "projectedKO": 48,
    "projectedSUB": 16,
    "projectedDEC": 36,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:24:10.418Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Welterweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.8624868327473055,
        "pB": 0.13751316725269447
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.11733544303797465,
          "avg_sig_str_pct_dif": -0.5175999999999997,
          "avg_td_dif": -0.7642857142857143,
          "avg_td_pct_dif": -1.391304347826087,
          "atd_dif": -0.13333333333333347,
          "avg_sub_att_dif": 0.9571428571428573,
          "kd_dif": -0.38000000000000006,
          "control_time_dif": -0.16666666666666666,
          "reach_dif": 0.4629629629629629,
          "height_dif": 0.43956043956043955,
          "age_dif": 3.0232558139534884,
          "win_streak_dif": 0,
          "lose_streak_dif": -1,
          "win_dif": -0.6818181818181818,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": -0.29411764705882354,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": -1,
          "sub_dif": 1.4285714285714286,
          "elo_dif": 0.20161290322580644,
          "layoff_dif": 0.7,
          "cardio_dif": -1.215833333333333,
          "peak_elo_dif": 0.43636363636363634,
          "ufc_fight_count_dif": -0.5,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.015262435825266374,
          "wins": -3,
          "losses": 1,
          "rounds": -5,
          "title_bouts": 0,
          "ko_wins": -2,
          "sub_wins": 2,
          "height": 4,
          "reach": 5,
          "younger": 13,
          "sig_str_landed": 1.8538999999999994,
          "sig_str_accuracy": -0.05175999999999997,
          "sub_attempts": 0.67,
          "td_landed": -1.07,
          "td_accuracy": -0.32,
          "elo": 0.1
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-28",
        "fighterB": "2025-11-08"
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
    "id": "1789266166860-gnccdw",
    "createdAt": "2026-09-13T02:22:46.860Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Yousri Belgaroui",
    "fighterB": "Djorden Santos",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.7423878297439491,
    "fighterBProb": 0.2576121702560509,
    "predictedWinner": "Yousri Belgaroui",
    "predictedProb": 0.7423878297439491,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.8828722882565515,
    "c6ProbB": 0.11712771174344849,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Yousri Belgaroui",
    "trackedProb": 0.8828722882565515,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-900",
    "edge": 0.028857689716405566,
    "edgeA": 0.028857689716405566,
    "edgeB": -0.028857689716405538,
    "ev": -1.9030790826053838,
    "evA": -1.9030790826053838,
    "evB": -23.86698736675848,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-754",
    "fairLineA": "-754",
    "fairLineB": "+754",
    "oddsA": "-900",
    "oddsB": "+550",
    "v2pA": 0.6702223045327508,
    "v2pB": 0.3297776954672492,
    "projectedKO": 43,
    "projectedSUB": 6,
    "projectedDEC": 51,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:22:46.860Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.8828722882565515,
        "pB": 0.11712771174344849
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.009371822399769088,
          "avg_sig_str_pct_dif": 1.3205429049429662,
          "avg_td_dif": 0.24043090711569787,
          "avg_td_pct_dif": 1.5426979666060503,
          "atd_dif": -0.8800000000000001,
          "avg_sub_att_dif": 0.14393503530689844,
          "kd_dif": 2.6679999999999997,
          "control_time_dif": 0.3222222222222222,
          "reach_dif": 0.37037037037037035,
          "height_dif": 0.6593406593406593,
          "age_dif": -1.1627906976744187,
          "win_streak_dif": 1.4285714285714286,
          "lose_streak_dif": 1,
          "win_dif": 0.22727272727272727,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.17647058823529413,
          "deep_round_dif": -0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0,
          "elo_dif": 2.3588709677419355,
          "layoff_dif": -0.21,
          "cardio_dif": -1.8195833333333338,
          "peak_elo_dif": 1.6,
          "ufc_fight_count_dif": -0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.5877049180327869,
          "wins": 1,
          "losses": 2,
          "rounds": -3,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 0,
          "height": 6,
          "reach": 4,
          "younger": -5,
          "sig_str_landed": 0.1480747939163516,
          "sig_str_accuracy": 0.13205429049429662,
          "sub_attempts": 0.1007545247148289,
          "td_landed": 0.336603269961977,
          "td_accuracy": 0.3548205323193916,
          "elo": 1.17
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-28",
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
    "id": "1789266109061-hoq5er",
    "createdAt": "2026-09-13T02:21:49.061Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Drakkar Klose",
    "fighterB": "Tommy Gantt",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.5388151231268755,
    "fighterBProb": 0.4611848768731245,
    "predictedWinner": "Drakkar Klose",
    "predictedProb": 0.5388151231268755,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.24290667864274035,
    "c6ProbB": 0.7570933213572597,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Tommy Gantt",
    "trackedProb": 0.7570933213572597,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-425",
    "edge": -0.00695162246296499,
    "edgeA": 0.006951622462965074,
    "edgeB": -0.00695162246296499,
    "ev": -6.476707361750265,
    "evA": -2.8373285429038617,
    "evB": -6.476707361750265,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-312",
    "fairLineA": "+312",
    "fairLineB": "-312",
    "oddsA": "+300",
    "oddsB": "-425",
    "v2pA": 0.4763745053689624,
    "v2pB": 0.5236254946310376,
    "projectedKO": 55,
    "projectedSUB": 7,
    "projectedDEC": 38,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:21:49.061Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.24290667864274035,
        "pB": 0.7570933213572597
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.043617884776785236,
          "avg_sig_str_pct_dif": 0.7852025431426002,
          "avg_td_dif": -0.9911366290385368,
          "avg_td_pct_dif": -0.29741341863128373,
          "atd_dif": 0.5999999999999999,
          "avg_sub_att_dif": -0.6432360192033214,
          "kd_dif": -3.516,
          "control_time_dif": -2.8333333333333335,
          "reach_dif": -0.5555555555555555,
          "height_dif": -0.21978021978021978,
          "age_dif": -1.1627906976744187,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 2.0454545454545454,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 1.8235294117647058,
          "deep_round_dif": 0.5294117647058824,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 2.0766129032258065,
          "layoff_dif": -1.365,
          "cardio_dif": 1.1962499999999996,
          "peak_elo_dif": 2.1454545454545455,
          "ufc_fight_count_dif": 1.5,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.20420254145787775,
          "wins": 9,
          "losses": -3,
          "rounds": 31,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": -2,
          "reach": -6,
          "younger": -5,
          "sig_str_landed": 0.6891625794732068,
          "sig_str_accuracy": 0.07852025431426002,
          "sub_attempts": -0.45026521344232495,
          "td_landed": -1.3875912806539514,
          "td_accuracy": -0.06840508628519526,
          "elo": 1.03
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-08-16",
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
    "id": "1789266038096-mdln5h",
    "createdAt": "2026-09-13T02:20:38.096Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "Rafa Garcia",
    "fighterB": "Rongzhu",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.6236200862312262,
    "fighterBProb": 0.3763799137687738,
    "predictedWinner": "Rafa Garcia",
    "predictedProb": 0.6236200862312262,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.4180379275943726,
    "c6ProbB": 0.5819620724056274,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Rongzhu",
    "trackedProb": 0.5819620724056274,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-165",
    "edge": -0.0068664768573671875,
    "edgeA": 0.0068664768573671875,
    "edgeB": -0.0068664768573671875,
    "ev": -6.533364128793188,
    "evA": -3.8512766532943132,
    "evB": -6.533364128793188,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0,
    "fairLine": "-139",
    "fairLineA": "+139",
    "fairLineB": "-139",
    "oddsA": "+130",
    "oddsB": "-165",
    "v2pA": 0.5003538596318989,
    "v2pB": 0.49964614036810107,
    "projectedKO": 21,
    "projectedSUB": 7,
    "projectedDEC": 72,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:20:38.096Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.4180379275943726,
        "pB": 0.5819620724056274
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.08354430379746831,
          "avg_sig_str_pct_dif": -0.6,
          "avg_td_dif": 0.9714285714285715,
          "avg_td_pct_dif": -0.7391304347826086,
          "atd_dif": 1.1333333333333337,
          "avg_sub_att_dif": 0.5714285714285715,
          "kd_dif": -0.212,
          "control_time_dif": 0.35000000000000003,
          "reach_dif": -0.09259259259259259,
          "height_dif": -0.21978021978021978,
          "age_dif": -1.3953488372093024,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 0.9090909090909091,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 0.8235294117647058,
          "deep_round_dif": 0.23529411764705882,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 2.1370967741935485,
          "layoff_dif": 1.225,
          "cardio_dif": -1.1104166666666675,
          "peak_elo_dif": 1.5454545454545454,
          "ufc_fight_count_dif": 0.625,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.17202735010830855,
          "wins": 4,
          "losses": -1,
          "rounds": 14,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 1,
          "height": -2,
          "reach": -1,
          "younger": -6,
          "sig_str_landed": -1.3199999999999994,
          "sig_str_accuracy": -0.06,
          "sub_attempts": 0.4,
          "td_landed": 1.36,
          "td_accuracy": -0.16999999999999998,
          "elo": 1.06
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-25",
        "fighterB": "2025-08-23"
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
    "id": "1789265986741-j9pbs0",
    "createdAt": "2026-09-13T02:19:46.741Z",
    "eventName": "Noche UFC",
    "eventDate": "2026-09-12",
    "fighterA": "JJ Aldrich",
    "fighterB": "Regina Tarin",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Flyweight",
    "boutContext": {
      "division": "Women's Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "authority": "official",
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
        "retrievedAt": "2026-09-12"
      }
    },
    "fighterAProb": 0.5643486612424093,
    "fighterBProb": 0.43565133875759066,
    "predictedWinner": "JJ Aldrich",
    "predictedProb": 0.5643486612424093,
    "modelUsed": "v2",
    "decisionProbabilitySource": "c6",
    "c6ProbA": 0.2369908204899878,
    "c6ProbB": 0.7630091795100122,
    "c6Version": "c6_sym_zerointercept_full_20260818",
    "trackedSide": "Regina Tarin",
    "trackedProb": 0.7630091795100122,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-300",
    "edge": 0.05391827041910313,
    "edgeA": -0.053918270419103104,
    "edgeB": 0.05391827041910313,
    "ev": 1.7345572680016232,
    "evA": -22.977983340753973,
    "evB": 1.7345572680016232,
    "kelly": 0.05203671804004874,
    "kellyA": 0,
    "kellyB": 0.05203671804004874,
    "fairLine": "-322",
    "fairLineA": "+322",
    "fairLineB": "-322",
    "oddsA": "+225",
    "oddsB": "-300",
    "v2pA": 0.3470387487042797,
    "v2pB": 0.6529612512957204,
    "projectedKO": 4,
    "projectedSUB": 1,
    "projectedDEC": 96,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-09-13T02:19:46.741Z",
      "targetEventDate": "2026-09-12",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "authority": "official",
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-september-12-2026",
          "retrievedAt": "2026-09-12"
        }
      },
      "decisionProbabilitySource": "c6",
      "c6": {
        "version": "c6_sym_zerointercept_full_20260818",
        "pA": 0.2369908204899878,
        "pB": 0.7630091795100122
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.03668801191362617,
          "avg_sig_str_pct_dif": 0.1962352941176465,
          "avg_td_dif": -0.3959327731092439,
          "avg_td_pct_dif": -0.5220460358056267,
          "atd_dif": 0.6000000000000005,
          "avg_sub_att_dif": -0.5286722689075629,
          "kd_dif": 0.16799999999999998,
          "control_time_dif": -0.10555555555555556,
          "reach_dif": 0.09259259259259259,
          "height_dif": -0.21978021978021978,
          "age_dif": -2.7906976744186047,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 2.2727272727272725,
          "loss_dif": -2.222222222222222,
          "total_round_dif": 2.6470588235294117,
          "deep_round_dif": 0.7647058823529411,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 0.8266129032258064,
          "layoff_dif": 0.245,
          "cardio_dif": -0.25791666666666696,
          "peak_elo_dif": 0.7636363636363637,
          "ufc_fight_count_dif": 2,
          "rank_tier_dif": 1.736044097509195
        },
        "v2": {
          "modern_form": -0.2364398672363568,
          "wins": 10,
          "losses": -6,
          "rounds": 45,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": -2,
          "reach": 1,
          "younger": -12,
          "sig_str_landed": -0.5796705882352935,
          "sig_str_accuracy": 0.01962352941176465,
          "sub_attempts": -0.370070588235294,
          "td_landed": -0.5543058823529414,
          "td_accuracy": -0.12007058823529415,
          "elo": 0.41
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-18",
        "fighterB": "2026-02-28"
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
