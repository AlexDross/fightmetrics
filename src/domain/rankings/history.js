// RESEARCH entrypoint -- point-in-time historical UFC rankings.
//
// NOT PART OF THE PRODUCTION BUNDLE. Importing this module pulls in
// src/rankingsHistoryData.js (~190 kB of transitions and tombstones), so it may
// only be reached from:
//
//   * offline generation (scripts/update_rankings.py writes the artifact)
//   * verification scripts (scripts/verify-rankings.mjs)
//   * research utilities
//   * focused tests
//
// It must NOT be imported by src/App.js, src/domain/fighters, or anything else
// in the runtime dependency graph. Runtime code uses ./current.js instead;
// there is deliberately no barrel module that re-exports both.
//
// It also has no MODEL consumer: not the deprecated v1 engine, not the frozen
// 16-feature MODEL_V2. A historical rank must never be gated on a bout's
// recorded weight class -- `wc` in fightHistory.js is the history owner's
// roster division, not the bout's.
import {
  DIVISION_RANK_HISTORY,
  RANKINGS_HISTORY_METADATA,
} from '../../rankingsHistoryData.js';
import { RANKING_ALIASES } from '../../rankingsData.js';
import { buildKeysByName, lookupHistoricalRank } from './lookup.js';

const HISTORY_KEYS_BY_NAME = buildKeysByName(DIVISION_RANK_HISTORY);

/**
 * Point-in-time historical rank. RESEARCH/DATA ONLY -- do not wire into
 * scoring. Callers must pass a real division; the truncated "Women\" and
 * "Unknown" weight classes resolve only when unambiguous.
 */
export const getHistoricalRank = (fighterName, eventDate, division) =>
  lookupHistoricalRank({
    history: DIVISION_RANK_HISTORY,
    keysByName: HISTORY_KEYS_BY_NAME,
    aliases: RANKING_ALIASES,
    fighterName,
    division,
    eventDate,
  });

export { DIVISION_RANK_HISTORY, RANKINGS_HISTORY_METADATA };
