// Rankings domain -- CURRENT official UFC rankings for profile/UI metadata,
// plus read access to the historical artifact.
//
// BOUNDARY: nothing here may be imported by src/domain/model or
// src/domain/betting. v1 scoring keeps its own frozen ranking path until v1 is
// retired, and the frozen 16-feature MODEL_V2 reads no ranking at all.
// src/domain/rankings/__tests__/boundary.test.js enforces this.
//
// DIVISION_RANK_HISTORY is a data/research artifact. getHistoricalRank exposes
// it for analysis; no runtime scoring code consumes it.
import {
  CURRENT_MEDIA_P4P,
  CURRENT_MEDIA_RANKINGS,
  CURRENT_META_RANKINGS,
  DIVISION_RANK_HISTORY,
  RANKING_ALIASES,
  RANKINGS_METADATA,
} from '../../rankingsData.js';
import {
  buildKeysByName,
  divisionAbbreviation,
  isChampionRecord,
  lookupHistoricalRank,
  normalizeRankingDivision,
  normalizeRankingName,
  rankingHistoryKey,
  resolveCurrentRankingFrom,
} from './lookup.js';

const HISTORY_KEYS_BY_NAME = buildKeysByName(DIVISION_RANK_HISTORY);

const CURRENT_BY_SOURCE = {
  media: CURRENT_MEDIA_RANKINGS,
  meta: CURRENT_META_RANKINGS,
};

// UFC publishes no Meta pound-for-pound board, so media is the only P4P source.
const P4P_BY_SOURCE = { media: CURRENT_MEDIA_P4P };

const currentKeysByName = Object.fromEntries(
  Object.entries(CURRENT_BY_SOURCE).map(([source, records]) => [
    source,
    buildKeysByName(records),
  ])
);

const recordsFor = (source) => CURRENT_BY_SOURCE[source] ?? CURRENT_MEDIA_RANKINGS;

/** Every current ranking held by one athlete, across divisions. */
export const findCurrentRankingsByName = (
  fighterName,
  source = RANKINGS_METADATA.primarySource
) => {
  const fighterKey = normalizeRankingName(fighterName, RANKING_ALIASES);
  if (!fighterKey) return [];
  const records = recordsFor(source);
  return (currentKeysByName[source]?.[fighterKey] ?? [])
    .map((key) => records[key])
    .filter(Boolean);
};

/** Strict lookup: a stated division is authoritative and is never borrowed. */
export const getCurrentRanking = (
  fighterName,
  division,
  source = RANKINGS_METADATA.primarySource
) => {
  const records = recordsFor(source);
  const fighterKey = normalizeRankingName(fighterName, RANKING_ALIASES);
  const normalizedDivision = normalizeRankingDivision(division);
  if (normalizedDivision) {
    return records[rankingHistoryKey(normalizedDivision, fighterKey)] ?? null;
  }
  // An unusable roster division (e.g. the truncated "Women\") resolves only
  // when the athlete holds exactly one current ranking.
  const candidates = findCurrentRankingsByName(fighterName, source);
  return candidates.length === 1 ? candidates[0] : null;
};

/**
 * UI resolution for a roster entry. See resolveCurrentRankingFrom for the
 * rules; this binds them to the generated current-media records.
 */
export const resolveCurrentRanking = (
  fighterName,
  rosterDivision,
  source = RANKINGS_METADATA.primarySource
) =>
  resolveCurrentRankingFrom({
    records: recordsFor(source),
    keysByName: currentKeysByName[source] ?? {},
    aliases: RANKING_ALIASES,
    fighterName,
    rosterDivision,
  });

/** Athletes holding more than one current ranking -- reported, never guessed. */
export const listCurrentRankingAmbiguities = (
  source = RANKINGS_METADATA.primarySource
) =>
  Object.entries(currentKeysByName[source] ?? {})
    .filter(([, keys]) => keys.length > 1)
    .map(([fighterKey, keys]) => ({
      fighterKey,
      divisions: keys.map((key) => recordsFor(source)[key].division).sort(),
    }));

export const getCurrentP4PRanking = (
  fighterName,
  source = RANKINGS_METADATA.primarySource
) => {
  const records = P4P_BY_SOURCE[source];
  if (!records) return null;
  const fighterKey = normalizeRankingName(fighterName, RANKING_ALIASES);
  return records[fighterKey] ?? null;
};

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

export { RANKINGS_METADATA, divisionAbbreviation, isChampionRecord };
