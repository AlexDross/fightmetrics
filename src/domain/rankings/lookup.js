// Pure lookup helpers for the generated rankings artifact.
//
// SCOPE: name/division normalisation and point-in-time record lookup. This
// module deliberately contains NO model math -- no opponent tiers, no scoring.
// v1's tier curve lives with v1 (src/domain/model, src/domain/fighters) and is
// frozen until v1 is retired.

const DIVISIONS = new Set([
  'Bantamweight',
  'Featherweight',
  'Flyweight',
  'Heavyweight',
  'Light Heavyweight',
  'Lightweight',
  'Middleweight',
  'Welterweight',
  "Women's Bantamweight",
  "Women's Featherweight",
  "Women's Flyweight",
  "Women's Strawweight",
]);

// Compact labels for the cross-division rank badge (e.g. "#11 HW").
const DIVISION_ABBREVIATIONS = {
  Bantamweight: 'BW',
  Featherweight: 'FW',
  Flyweight: 'FLY',
  Heavyweight: 'HW',
  'Light Heavyweight': 'LHW',
  Lightweight: 'LW',
  Middleweight: 'MW',
  Welterweight: 'WW',
  "Women's Bantamweight": 'W-BW',
  "Women's Featherweight": 'W-FW',
  "Women's Flyweight": 'W-FLY',
  "Women's Strawweight": 'W-SW',
};

const SPECIAL_LETTERS = {
  ł: 'l',
  Ł: 'L',
  ø: 'o',
  Ø: 'O',
  ð: 'd',
  Ð: 'D',
  þ: 'th',
  Þ: 'Th',
  đ: 'd',
  Đ: 'D',
  ß: 'ss',
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
};

const replaceSpecialLetters = (value) =>
  [...value].map((char) => SPECIAL_LETTERS[char] ?? char).join('');

export const baseRankingNameKey = (name) => {
  if (typeof name !== 'string') return '';
  return replaceSpecialLetters(name)
    .replace(/[’‘ʻʼ]/g, "'")
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

export const normalizeRankingName = (name, aliases = {}) => {
  const key = baseRankingNameKey(name);
  return aliases[key] ?? key;
};

export const normalizeRankingDivision = (division) => {
  if (typeof division !== 'string') return null;
  let value = division.trim().replace(/\s+Title(?:\s+Bout)?$/i, '');
  // "Women\" is a known truncation in the fighter dataset; it identifies sex
  // but not division, so it must never resolve to a specific women's division.
  if (value === 'Women\\' || value === "Women's") return null;
  if (value === 'Catch Weight' || value.startsWith('Unknown')) return null;
  if (DIVISIONS.has(value)) return value;
  return null;
};

export const divisionAbbreviation = (division) =>
  DIVISION_ABBREVIATIONS[division] ?? division;

export const rankingHistoryKey = (division, fighterKey) =>
  `${division}\u001f${fighterKey}`;

export const parseRankingDate = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length >= 8) return Number(digits.slice(0, 8));
  if (digits.length === 6) return Number(`${digits}01`);
  return null;
};

// Newest entry at or before the requested date. Never reads a later snapshot,
// so a lookup cannot see a ranking published after the event it describes.
export const findRankState = (entries, eventDate) => {
  const eventYmd = parseRankingDate(eventDate);
  if (!entries?.length || eventYmd == null) return null;

  let lo = 0;
  let hi = entries.length - 1;
  let best = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (entries[mid][0] <= eventYmd) {
      best = entries[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  // A null rank is an explicit tombstone: the athlete left the rankings.
  if (!best || best[1] == null) return null;
  return { asOf: best[0], rank: best[1] };
};

export const buildKeysByName = (records) => {
  const result = {};
  for (const key of Object.keys(records)) {
    const separator = key.indexOf('\u001f');
    const fighterKey = key.slice(separator + 1);
    (result[fighterKey] ??= []).push(key);
  }
  return result;
};

export const isChampionRecord = (record) =>
  record != null && (record.rank === 0 || record.status === 'champion');

/**
 * Resolve the current ranking to show for a roster entry.
 *
 * 1. Exact fighter+division match wins.
 * 2. Otherwise fall back to a name-only match, but ONLY when the athlete holds
 *    exactly one current ranking. Athletes move divisions faster than the
 *    roster's weight class is refreshed, so a strict match alone silently drops
 *    genuinely ranked fighters.
 * 3. Two or more current rankings is ambiguous: return null rather than guess.
 *
 * The returned record keeps its OWN division -- a rank is never relabelled into
 * the roster's division -- and `crossDivision` tells the UI to show the source
 * division alongside the number (e.g. "#11 HW").
 */
export const resolveCurrentRankingFrom = ({
  records,
  keysByName,
  aliases,
  fighterName,
  rosterDivision,
}) => {
  const fighterKey = normalizeRankingName(fighterName, aliases);
  if (!fighterKey) return null;
  const normalizedDivision = normalizeRankingDivision(rosterDivision);

  const decorate = (record) => ({
    ...record,
    crossDivision:
      normalizedDivision != null && record.division !== normalizedDivision,
    divisionLabel: divisionAbbreviation(record.division),
  });

  if (normalizedDivision) {
    const exact = records[rankingHistoryKey(normalizedDivision, fighterKey)];
    if (exact) return decorate(exact);
  }

  const candidates = (keysByName[fighterKey] ?? [])
    .map((key) => records[key])
    .filter(Boolean);
  return candidates.length === 1 ? decorate(candidates[0]) : null;
};

export const lookupHistoricalRank = ({
  history,
  keysByName,
  aliases,
  fighterName,
  division,
  eventDate,
}) => {
  const fighterKey = normalizeRankingName(fighterName, aliases);
  if (!fighterKey) return null;

  const normalizedDivision = normalizeRankingDivision(division);
  if (normalizedDivision) {
    const exactKey = rankingHistoryKey(normalizedDivision, fighterKey);
    const exact = findRankState(history[exactKey], eventDate);
    if (exact) return { ...exact, division: normalizedDivision };
    // A valid requested division is authoritative. This covers both explicit
    // tombstones and athletes who were ranked only in a different division.
    return null;
  }

  const rawDivision = typeof division === 'string' ? division : '';
  const candidates = (keysByName[fighterKey] ?? [])
    .filter((key) => !rawDivision.startsWith('Women\\') || key.startsWith("Women's "))
    .map((key) => {
      const candidateDivision = key.slice(0, key.indexOf('\u001f'));
      const state = findRankState(history[key], eventDate);
      return state ? { ...state, division: candidateDivision } : null;
    })
    .filter(Boolean);

  // A damaged/unknown weight class is safe to recover only when the athlete is
  // ranked in exactly one division at that point in time.
  return candidates.length === 1 ? candidates[0] : null;
};
