export const UPCOMING_ENTRIES = [
  {
    "id": "1787071540373-479c7v",
    "createdAt": "2026-08-18T16:45:40.373Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Anthony Hernandez",
    "fighterB": "Gregory Rodrigues",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 5,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5151920008002782,
    "fighterBProb": 0.48480799919972184,
    "predictedWinner": "Anthony Hernandez",
    "predictedProb": 0.5151920008002782,
    "modelUsed": "v2",
    "trackedSide": "Anthony Hernandez",
    "trackedProb": 0.6612935269605572,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-165",
    "edge": 0.06726824928916697,
    "edgeA": 0.06726824928916697,
    "edgeB": -0.06726824928916691,
    "ev": 6.207748269422815,
    "evA": 6.207748269422815,
    "evB": -20.40397883573094,
    "kelly": 0.10242784644547653,
    "kellyA": 0.10242784644547653,
    "kellyB": 0,
    "fairLine": "-195",
    "fairLineA": "-195",
    "fairLineB": "+195",
    "oddsA": "-165",
    "oddsB": "+135",
    "v2pA": 0.6612935269605572,
    "v2pB": 0.3387064730394428,
    "projectedKO": 45,
    "projectedSUB": 24,
    "projectedDEC": 31,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:45:40.373Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 5,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.08331645569620257,
          "avg_sig_str_pct_dif": 0.8291999999999999,
          "avg_td_dif": 2.8428571428571434,
          "avg_td_pct_dif": 0.5217391304347826,
          "atd_dif": -0.46666666666666634,
          "avg_sub_att_dif": 1.7857142857142858,
          "kd_dif": -1.516,
          "control_time_dif": 1.7333333333333334,
          "reach_dif": 0,
          "height_dif": -0.32967032967032966,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": -2.142857142857143,
          "lose_streak_dif": -1,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0,
          "total_round_dif": 0.29411764705882354,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": -2.5,
          "sub_dif": 3.5714285714285716,
          "elo_dif": -0.08064516129032258,
          "layoff_dif": -0.07,
          "cardio_dif": 0.16250000000000014,
          "peak_elo_dif": 0.4,
          "ufc_fight_count_dif": -0.125,
          "rank_tier_dif": 0.5032087674032732
        },
        "v2": {
          "modern_form": -0.10350165646945908,
          "wins": -1,
          "losses": 0,
          "rounds": 5,
          "title_bouts": 0,
          "ko_wins": -5,
          "sub_wins": 5,
          "height": -3,
          "reach": 0,
          "younger": 2,
          "sig_str_landed": -1.3164000000000007,
          "sig_str_accuracy": 0.08292,
          "sub_attempts": 1.25,
          "td_landed": 3.9800000000000004,
          "td_accuracy": 0.12,
          "elo": -0.04
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-21",
        "fighterB": "2026-03-07"
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
    "id": "1787071501290-ts6ugu",
    "createdAt": "2026-08-18T16:45:01.290Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Serghei Spivac",
    "fighterB": "Vitor Petrino",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5192980237920792,
    "fighterBProb": 0.48070197620792077,
    "predictedWinner": "Serghei Spivac",
    "predictedProb": 0.5192980237920792,
    "modelUsed": "v2",
    "trackedSide": "Vitor Petrino",
    "trackedProb": 0.504508542534451,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-150",
    "edge": -0.06995954257193204,
    "edgeA": 0.06995954257193193,
    "edgeB": -0.06995954257193204,
    "ev": -15.915242910924839,
    "evA": 11.485577929748523,
    "evB": -15.915242910924839,
    "kelly": 0,
    "kellyA": 0.0918846234379882,
    "kellyB": 0,
    "fairLine": "-102",
    "fairLineA": "+102",
    "fairLineB": "-102",
    "oddsA": "+125",
    "oddsB": "-150",
    "v2pA": 0.495491457465549,
    "v2pB": 0.504508542534451,
    "projectedKO": 32,
    "projectedSUB": 22,
    "projectedDEC": 46,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:45:01.291Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.030379746835443037,
          "avg_sig_str_pct_dif": -0.10000000000000009,
          "avg_td_dif": 0.7000000000000001,
          "avg_td_pct_dif": 0.5652173913043476,
          "atd_dif": -1.0666666666666669,
          "avg_sub_att_dif": -0.44285714285714295,
          "kd_dif": 0.09999999999999995,
          "control_time_dif": 0.5555555555555556,
          "reach_dif": 0.09259259259259259,
          "height_dif": 0.10989010989010989,
          "age_dif": -0.6976744186046512,
          "win_streak_dif": -1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": 0.45454545454545453,
          "loss_dif": -1.4814814814814814,
          "total_round_dif": 0.4117647058823529,
          "deep_round_dif": -0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.48387096774193544,
          "layoff_dif": -0.105,
          "cardio_dif": 1.3762500000000002,
          "peak_elo_dif": 0.9272727272727272,
          "ufc_fight_count_dif": 0.75,
          "rank_tier_dif": 2.611707935929908
        },
        "v2": {
          "modern_form": -0.17841268083509443,
          "wins": 2,
          "losses": -4,
          "rounds": 7,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 1,
          "height": 1,
          "reach": 1,
          "younger": -3,
          "sig_str_landed": 0.48,
          "sig_str_accuracy": -0.010000000000000009,
          "sub_attempts": -0.31000000000000005,
          "td_landed": 0.98,
          "td_accuracy": 0.12999999999999995,
          "elo": 0.24
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-21",
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
    "id": "1787071464246-q9bce9",
    "createdAt": "2026-08-18T16:44:24.246Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Reinier de Ridder",
    "fighterB": "Roman Dolidze",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5386148283994958,
    "fighterBProb": 0.4613851716005042,
    "predictedWinner": "Reinier de Ridder",
    "predictedProb": 0.5386148283994958,
    "modelUsed": "v2",
    "trackedSide": "Reinier de Ridder",
    "trackedProb": 0.5518474743678485,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-400",
    "edge": -0.21450766581906733,
    "edgeA": -0.21450766581906733,
    "edgeB": 0.21450766581906736,
    "ev": -31.019065704018935,
    "evA": -31.019065704018935,
    "evB": 83.74253550918209,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.2701372113199423,
    "fairLine": "-123",
    "fairLineA": "-123",
    "fairLineB": "+123",
    "oddsA": "-400",
    "oddsB": "+310",
    "v2pA": 0.5518474743678485,
    "v2pB": 0.44815252563215147,
    "projectedKO": 38,
    "projectedSUB": 20,
    "projectedDEC": 42,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:44:24.246Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.0391898734177215,
          "avg_sig_str_pct_dif": 0.6608000000000003,
          "avg_td_dif": 1.0000000000000002,
          "avg_td_pct_dif": -0.6521739130434784,
          "atd_dif": 0.5333333333333334,
          "avg_sub_att_dif": -0.27142857142857135,
          "kd_dif": -0.608,
          "control_time_dif": 0.21111111111111114,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0.21978021978021978,
          "age_dif": 0.6976744186046512,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": -1.1363636363636362,
          "loss_dif": 1.111111111111111,
          "total_round_dif": -1.1764705882352942,
          "deep_round_dif": -0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": -2,
          "sub_dif": 1.4285714285714286,
          "elo_dif": -0.564516129032258,
          "layoff_dif": -0.07,
          "cardio_dif": -1.6087499999999997,
          "peak_elo_dif": -0.36363636363636365,
          "ufc_fight_count_dif": -1,
          "rank_tier_dif": 0.30164993575161736
        },
        "v2": {
          "modern_form": 0.06913565582901482,
          "wins": -5,
          "losses": 3,
          "rounds": -20,
          "title_bouts": 0,
          "ko_wins": -4,
          "sub_wins": 2,
          "height": 2,
          "reach": 2,
          "younger": 3,
          "sig_str_landed": -0.6191999999999998,
          "sig_str_accuracy": 0.06608000000000003,
          "sub_attempts": -0.18999999999999995,
          "td_landed": 1.4000000000000001,
          "td_accuracy": -0.15000000000000002,
          "elo": -0.28
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-07",
        "fighterB": "2026-03-21"
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
    "id": "1787071358510-36wewm",
    "createdAt": "2026-08-18T16:42:38.510Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "MarQuel Mederos",
    "fighterB": "Mason Jones",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.37084492977839845,
    "fighterBProb": 0.6291550702216016,
    "predictedWinner": "Mason Jones",
    "predictedProb": 0.6291550702216016,
    "modelUsed": "v2",
    "trackedSide": "Mason Jones",
    "trackedProb": 0.5560525721443537,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-275",
    "edge": -0.14514264697915225,
    "edgeA": 0.1451426469791524,
    "edgeB": -0.14514264697915225,
    "ev": -24.174649253042674,
    "evA": 42.06317691380684,
    "evB": -24.174649253042674,
    "kelly": 0,
    "kellyA": 0.191196258699122,
    "kellyB": 0,
    "fairLine": "-125",
    "fairLineA": "+125",
    "fairLineB": "-125",
    "oddsA": "+220",
    "oddsB": "-275",
    "v2pA": 0.4439474278556464,
    "v2pB": 0.5560525721443537,
    "projectedKO": 10,
    "projectedSUB": 2,
    "projectedDEC": 88,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:42:38.510Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.058739032425871356,
          "avg_sig_str_pct_dif": 1.1986958904109573,
          "avg_td_dif": -2.119921722113503,
          "avg_td_pct_dif": -1.819225729600953,
          "atd_dif": 0.306666666666667,
          "avg_sub_att_dif": -0.0936594911937379,
          "kd_dif": -0.42,
          "control_time_dif": -1.3499999999999999,
          "reach_dif": -0.4629629629629629,
          "height_dif": 0,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": -2.142857142857143,
          "lose_streak_dif": 0,
          "win_dif": -0.22727272727272727,
          "loss_dif": 0.7407407407407407,
          "total_round_dif": -0.4117647058823529,
          "deep_round_dif": -0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": -0.5,
          "sub_dif": 0,
          "elo_dif": -0.06048387096774193,
          "layoff_dif": 0.105,
          "cardio_dif": 0.40249999999999964,
          "peak_elo_dif": -0.05454545454545454,
          "ufc_fight_count_dif": -0.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.17090478797619257,
          "wins": -1,
          "losses": 2,
          "rounds": -7,
          "title_bouts": 0,
          "ko_wins": -1,
          "sub_wins": 0,
          "height": 0,
          "reach": -5,
          "younger": 2,
          "sig_str_landed": -0.9280767123287674,
          "sig_str_accuracy": 0.11986958904109574,
          "sub_attempts": -0.06556164383561652,
          "td_landed": -2.967890410958904,
          "td_accuracy": -0.41842191780821925,
          "elo": -0.03
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2026-03-21"
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
    "id": "1787071320860-j391vl",
    "createdAt": "2026-08-18T16:42:00.860Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Carli Judice",
    "fighterB": "Jeisla Chaves",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Flyweight",
    "boutContext": {
      "division": "Women's Flyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6930986753717315,
    "fighterBProb": 0.30690132462826847,
    "predictedWinner": "Carli Judice",
    "predictedProb": 0.6930986753717315,
    "modelUsed": "v2",
    "trackedSide": "Carli Judice",
    "trackedProb": 0.5620306595506788,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-550",
    "edge": -0.24679286986108584,
    "edgeA": -0.24679286986108584,
    "edgeB": 0.24679286986108595,
    "ev": -33.578194780374325,
    "evA": -33.578194780374325,
    "evB": 118.98467022466062,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.29746167556165154,
    "fairLine": "-128",
    "fairLineA": "-128",
    "fairLineB": "+128",
    "oddsA": "-550",
    "oddsB": "+400",
    "v2pA": 0.5620306595506788,
    "v2pB": 0.43796934044932123,
    "projectedKO": 28,
    "projectedSUB": 6,
    "projectedDEC": 66,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:42:00.860Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Flyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.20141424671134278,
          "avg_sig_str_pct_dif": -0.11270588235294143,
          "avg_td_dif": -0.5405490196078433,
          "avg_td_pct_dif": 0.2179369138959929,
          "atd_dif": 0.8888888888888895,
          "avg_sub_att_dif": -0.5948907563025211,
          "kd_dif": 1.5999999999999999,
          "control_time_dif": -1,
          "reach_dif": 6.296296296296296,
          "height_dif": 7.362637362637363,
          "age_dif": 0,
          "win_streak_dif": 1.4285714285714286,
          "lose_streak_dif": 0,
          "win_dif": 0.45454545454545453,
          "loss_dif": -0.37037037037037035,
          "total_round_dif": 0.4117647058823529,
          "deep_round_dif": 0.11764705882352941,
          "total_title_bout_dif": 0,
          "ko_dif": 1,
          "sub_dif": 0,
          "elo_dif": 1.0483870967741935,
          "layoff_dif": -0.525,
          "cardio_dif": 0.9524999999999997,
          "peak_elo_dif": 0.9454545454545454,
          "ufc_fight_count_dif": 0.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.13875338753387534,
          "wins": 2,
          "losses": -1,
          "rounds": 7,
          "title_bouts": 0,
          "ko_wins": 2,
          "sub_wins": 0,
          "height": -2,
          "reach": -2,
          "younger": 0,
          "sig_str_landed": 3.182345098039216,
          "sig_str_accuracy": -0.011270588235294143,
          "sub_attempts": -0.41642352941176475,
          "td_landed": -0.7567686274509806,
          "td_accuracy": 0.05012549019607837,
          "elo": 0.52
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-02-21",
        "fighterB": "2026-06-06"
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
    "id": "1787071285699-l01kb4",
    "createdAt": "2026-08-18T16:41:25.699Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Kennedy Nzechukwu",
    "fighterB": "Shamil Gaziev",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Heavyweight",
    "boutContext": {
      "division": "Heavyweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.7598522103553088,
    "fighterBProb": 0.2401477896446912,
    "predictedWinner": "Kennedy Nzechukwu",
    "predictedProb": 0.7598522103553088,
    "modelUsed": "v2",
    "trackedSide": "Kennedy Nzechukwu",
    "trackedProb": 0.6671172236909114,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "betRecommendedFighter": "Kennedy Nzechukwu",
    "betRecommendedOdds": "+115",
    "marketOdds": "+115",
    "edge": 0.2197112265466944,
    "edgeA": 0.2197112265466944,
    "edgeB": -0.2197112265466944,
    "ev": 43.43020309354595,
    "evA": 43.43020309354595,
    "evB": -42.05373893878829,
    "kelly": 0.37765393994387786,
    "kellyA": 0.37765393994387786,
    "kellyB": 0,
    "fairLine": "-200",
    "fairLineA": "-200",
    "fairLineB": "+200",
    "oddsA": "+115",
    "oddsB": "-135",
    "v2pA": 0.6671172236909114,
    "v2pB": 0.3328827763090886,
    "projectedKO": 60,
    "projectedSUB": 12,
    "projectedDEC": 28,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:41:25.699Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "boutContext": {
        "division": "Heavyweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.12555090048368836,
          "avg_sig_str_pct_dif": 0.7161893983739842,
          "avg_td_dif": -0.41101045296167255,
          "avg_td_pct_dif": 0.5363980205019441,
          "atd_dif": 0.004444444444445436,
          "avg_sub_att_dif": 0.22824622531939606,
          "kd_dif": 0.2679999999999999,
          "control_time_dif": -0.07222222222222222,
          "reach_dif": 0.4629629629629629,
          "height_dif": 0.10989010989010989,
          "age_dif": 0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 2,
          "win_dif": 1.1363636363636362,
          "loss_dif": -1.111111111111111,
          "total_round_dif": 1.1176470588235294,
          "deep_round_dif": 0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 2,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.625,
          "layoff_dif": -0.7,
          "cardio_dif": 1.4508333333333336,
          "peak_elo_dif": 0.01818181818181818,
          "ufc_fight_count_dif": 1,
          "rank_tier_dif": -1.9062513654776305
        },
        "v2": {
          "modern_form": 0.1400950040053343,
          "wins": 5,
          "losses": -3,
          "rounds": 19,
          "title_bouts": 0,
          "ko_wins": 4,
          "sub_wins": 1,
          "height": 1,
          "reach": 5,
          "younger": 2,
          "sig_str_landed": 1.983704227642276,
          "sig_str_accuracy": 0.07161893983739842,
          "sub_attempts": 0.15977235772357723,
          "td_landed": -0.5754146341463415,
          "td_accuracy": 0.12337154471544715,
          "elo": 0.31
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-12-13",
        "fighterB": "2026-05-02"
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
    "id": "1787071229558-ycro8x",
    "createdAt": "2026-08-18T16:40:29.558Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Wes Schultz",
    "fighterB": "Jackson McVey",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Middleweight",
    "boutContext": {
      "division": "Middleweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5316283488074618,
    "fighterBProb": 0.4683716511925382,
    "predictedWinner": "Wes Schultz",
    "predictedProb": 0.5316283488074618,
    "modelUsed": "v2",
    "trackedSide": "Jackson McVey",
    "trackedProb": 0.5254644704024269,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-185",
    "edge": -0.09792502414663162,
    "edgeA": 0.09792502414663151,
    "edgeB": -0.09792502414663162,
    "ev": -19.050068073139627,
    "evA": 21.006560047381114,
    "evB": -19.050068073139627,
    "kelly": 0,
    "kellyA": 0.13552619385407175,
    "kellyB": 0,
    "fairLine": "-111",
    "fairLineA": "+111",
    "fairLineB": "-111",
    "oddsA": "+155",
    "oddsB": "-185",
    "v2pA": 0.47453552959757306,
    "v2pB": 0.5254644704024269,
    "projectedKO": 18,
    "projectedSUB": 60,
    "projectedDEC": 22,
    "projectedFinish": "SUB",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:40:29.560Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Middleweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.09215189873417724,
          "avg_sig_str_pct_dif": -0.5066666666666664,
          "avg_td_dif": 0,
          "avg_td_pct_dif": 0,
          "atd_dif": 1.2088888888888887,
          "avg_sub_att_dif": 1.5352380952380953,
          "kd_dif": 0,
          "control_time_dif": 0.6722222222222222,
          "reach_dif": 0,
          "height_dif": -0.32967032967032966,
          "age_dif": -0.46511627906976744,
          "win_streak_dif": 0,
          "lose_streak_dif": 0,
          "win_dif": 0,
          "loss_dif": 0.37037037037037035,
          "total_round_dif": 0,
          "deep_round_dif": 0.058823529411764705,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0,
          "elo_dif": 0.4637096774193548,
          "layoff_dif": 0.035,
          "cardio_dif": 0,
          "peak_elo_dif": 0,
          "ufc_fight_count_dif": -0.125,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.1165755919854281,
          "wins": 0,
          "losses": 1,
          "rounds": 0,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 0,
          "height": -3,
          "reach": 0,
          "younger": -2,
          "sig_str_landed": -1.4560000000000004,
          "sig_str_accuracy": -0.05066666666666664,
          "sub_attempts": 1.0746666666666667,
          "td_landed": 0,
          "td_accuracy": 0,
          "elo": 0.23
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-05-02",
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
    "id": "1787071201851-8dck4r",
    "createdAt": "2026-08-18T16:40:01.851Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Chris Padilla",
    "fighterB": "Nasrat Haqparast",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Lightweight",
    "boutContext": {
      "division": "Lightweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.5810108526063269,
    "fighterBProb": 0.4189891473936731,
    "predictedWinner": "Chris Padilla",
    "predictedProb": 0.5810108526063269,
    "modelUsed": "v2",
    "trackedSide": "Chris Padilla",
    "trackedProb": 0.6027624703975086,
    "unitsWagered": 1,
    "betAction": "LEAN",
    "bestBet": "A",
    "betRecommendedFighter": "Chris Padilla",
    "betRecommendedOdds": "-105",
    "marketOdds": "-105",
    "edge": 0.11359670658385751,
    "edgeA": 0.11359670658385751,
    "edgeB": -0.11359670658385745,
    "ev": 17.682196601418354,
    "evA": 17.682196601418354,
    "evB": -25.73385316127336,
    "kelly": 0.18566306431489274,
    "kellyA": 0.18566306431489274,
    "kellyB": 0,
    "fairLine": "-152",
    "fairLineA": "-152",
    "fairLineB": "+152",
    "oddsA": "-105",
    "oddsB": "-115",
    "v2pA": 0.6027624703975086,
    "v2pB": 0.39723752960249137,
    "projectedKO": 32,
    "projectedSUB": 11,
    "projectedDEC": 56,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:40:01.857Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "LEAN",
      "boutContext": {
        "division": "Lightweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": -0.027314490491879066,
          "avg_sig_str_pct_dif": 0.633727853881278,
          "avg_td_dif": 0.6462948467058056,
          "avg_td_pct_dif": 0.446829461981338,
          "atd_dif": -0.7555555555555553,
          "avg_sub_att_dif": 0.4922635355512068,
          "kd_dif": 1.0359999999999998,
          "control_time_dif": 0.25555555555555554,
          "reach_dif": 0.18518518518518517,
          "height_dif": -0.10989010989010989,
          "age_dif": 0.23255813953488372,
          "win_streak_dif": 0,
          "lose_streak_dif": 1,
          "win_dif": -1.3636363636363635,
          "loss_dif": 1.8518518518518516,
          "total_round_dif": -1.588235294117647,
          "deep_round_dif": -0.5294117647058824,
          "total_title_bout_dif": 0,
          "ko_dif": 0,
          "sub_dif": 0.7142857142857143,
          "elo_dif": 0.8266129032258064,
          "layoff_dif": 0.84,
          "cardio_dif": -2.2920833333333337,
          "peak_elo_dif": 0.09090909090909091,
          "ufc_fight_count_dif": -1.375,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.3329723552627127,
          "wins": -6,
          "losses": 5,
          "rounds": -27,
          "title_bouts": 0,
          "ko_wins": 0,
          "sub_wins": 1,
          "height": -1,
          "reach": 2,
          "younger": 1,
          "sig_str_landed": -0.43156894977168925,
          "sig_str_accuracy": 0.0633727853881278,
          "sub_attempts": 0.3445844748858447,
          "td_landed": 0.9048127853881278,
          "td_accuracy": 0.10277077625570774,
          "elo": 0.41
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-04-11",
        "fighterB": "2025-10-25"
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
    "id": "1787071047847-e7akcf",
    "createdAt": "2026-08-18T16:37:27.847Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Jamall Emmers",
    "fighterB": "Lerryan Douglas",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Featherweight",
    "boutContext": {
      "division": "Featherweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.49508344750541033,
    "fighterBProb": 0.5049165524945897,
    "predictedWinner": "Lerryan Douglas",
    "predictedProb": 0.5049165524945897,
    "modelUsed": "v2",
    "trackedSide": "Lerryan Douglas",
    "trackedProb": 0.5492198608166021,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-400",
    "edge": -0.21713527937031374,
    "edgeA": 0.2171352793703137,
    "edgeB": -0.21713527937031374,
    "ev": -31.347517397924733,
    "evA": 84.8198570651931,
    "evB": -31.347517397924733,
    "kelly": 0,
    "kellyA": 0.27361244214578423,
    "kellyB": 0,
    "fairLine": "-122",
    "fairLineA": "+122",
    "fairLineB": "-122",
    "oddsA": "+310",
    "oddsB": "-400",
    "v2pA": 0.4507801391833978,
    "v2pB": 0.5492198608166021,
    "projectedKO": 60,
    "projectedSUB": 9,
    "projectedDEC": 31,
    "projectedFinish": "KO/TKO",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:37:27.848Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Featherweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.02925734492544705,
          "avg_sig_str_pct_dif": 0.16403795966785206,
          "avg_td_dif": 0.9946649042535164,
          "avg_td_pct_dif": 1.007703336943628,
          "atd_dif": 1.4000000000000006,
          "avg_sub_att_dif": -0.2482638196915778,
          "kd_dif": -7.156,
          "control_time_dif": 1.1055555555555554,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0.10989010989010989,
          "age_dif": -1.627906976744186,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 0,
          "win_dif": 0.9090909090909091,
          "loss_dif": -1.4814814814814814,
          "total_round_dif": 1.0588235294117647,
          "deep_round_dif": 0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": -0.5040322580645161,
          "layoff_dif": -0.7,
          "cardio_dif": -1.8066666666666666,
          "peak_elo_dif": -0.45454545454545453,
          "ufc_fight_count_dif": 1,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": -0.25218940044111005,
          "wins": 4,
          "losses": -4,
          "rounds": 18,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": 1,
          "reach": 2,
          "younger": -7,
          "sig_str_landed": 0.46226604982206343,
          "sig_str_accuracy": 0.016403795966785206,
          "sub_attempts": -0.17378467378410445,
          "td_landed": 1.392530865954923,
          "td_accuracy": 0.23177176749703443,
          "elo": -0.25
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2025-11-08",
        "fighterB": "2026-03-28"
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
    "id": "1787071022523-0qtuhw",
    "createdAt": "2026-08-18T16:37:02.523Z",
    "eventName": "UFC Sacramento",
    "eventDate": "2026-08-22",
    "fighterA": "Shanelle Dyer",
    "fighterB": "Elise Reed",
    "fighterAIsProspect": false,
    "fighterBIsProspect": false,
    "includesProspect": false,
    "division": "Women's Strawweight",
    "boutContext": {
      "division": "Women's Strawweight",
      "isTitleBout": false,
      "scheduledRounds": 3,
      "provenance": {
        "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
        "retrievedAt": "2026-08-19",
        "authority": "official"
      }
    },
    "fighterAProb": 0.6793389827703539,
    "fighterBProb": 0.32066101722964613,
    "predictedWinner": "Shanelle Dyer",
    "predictedProb": 0.6793389827703539,
    "modelUsed": "v2",
    "trackedSide": "Shanelle Dyer",
    "trackedProb": 0.8127137451059779,
    "unitsWagered": 1,
    "betAction": "NO BET",
    "bestBet": null,
    "betRecommendedFighter": "",
    "betRecommendedOdds": "",
    "marketOdds": "-700",
    "edge": -0.027286254894022033,
    "edgeA": -0.027286254894022033,
    "edgeB": 0.02728625489402209,
    "ev": -7.1184291307453815,
    "evA": -7.1184291307453815,
    "evB": 12.37175293641323,
    "kelly": 0,
    "kellyA": 0,
    "kellyB": 0.024743505872826477,
    "fairLine": "-434",
    "fairLineA": "-434",
    "fairLineB": "+434",
    "oddsA": "-700",
    "oddsB": "+500",
    "v2pA": 0.8127137451059779,
    "v2pB": 0.18728625489402206,
    "projectedKO": 47,
    "projectedSUB": 6,
    "projectedDEC": 48,
    "projectedFinish": "DEC",
    "actualWinner": "",
    "actualFinish": "",
    "notes": "",
    "_provenance": {
      "predictionTimestamp": "2026-08-18T16:37:02.527Z",
      "targetEventDate": "2026-08-22",
      "captureMode": "live",
      "modelVersion": "logistic_v2.0_20260709",
      "modelCoefHash": "256f866e",
      "frozenTier": "NO BET",
      "boutContext": {
        "division": "Women's Strawweight",
        "isTitleBout": false,
        "scheduledRounds": 3,
        "provenance": {
          "sourceUrl": "https://www.ufc.com/event/ufc-fight-night-august-22-2026",
          "retrievedAt": "2026-08-19",
          "authority": "official"
        }
      },
      "featureVector": {
        "v1": {
          "sig_str_dif": 0.23669455244122953,
          "avg_sig_str_pct_dif": -0.3953499999999993,
          "avg_td_dif": 0.7660641581632653,
          "avg_td_pct_dif": -0.6448757763975156,
          "atd_dif": 0.822222222222222,
          "avg_sub_att_dif": 0.5368027210884353,
          "kd_dif": 4,
          "control_time_dif": 1.3333333333333333,
          "reach_dif": 0.18518518518518517,
          "height_dif": 0.32967032967032966,
          "age_dif": 2.0930232558139537,
          "win_streak_dif": 0.7142857142857143,
          "lose_streak_dif": 1,
          "win_dif": -0.6818181818181818,
          "loss_dif": 1.8518518518518516,
          "total_round_dif": -1.1764705882352942,
          "deep_round_dif": -0.29411764705882354,
          "total_title_bout_dif": 0,
          "ko_dif": 0.5,
          "sub_dif": 0,
          "elo_dif": 2.096774193548387,
          "layoff_dif": 1.54,
          "cardio_dif": -3.608333333333334,
          "peak_elo_dif": 0.6363636363636364,
          "ufc_fight_count_dif": -1,
          "rank_tier_dif": 0
        },
        "v2": {
          "modern_form": 0.5594444444444444,
          "wins": -3,
          "losses": 5,
          "rounds": -20,
          "title_bouts": 0,
          "ko_wins": 1,
          "sub_wins": 0,
          "height": 3,
          "reach": 2,
          "younger": 9,
          "sig_str_landed": 3.739773928571427,
          "sig_str_accuracy": -0.03953499999999993,
          "sub_attempts": 0.3757619047619047,
          "td_landed": 1.0724898214285714,
          "td_accuracy": -0.1483214285714286,
          "elo": 1.04
        }
      },
      "fightHistoryCutoff": {
        "fighterA": "2026-03-21",
        "fighterB": "2025-05-17"
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
