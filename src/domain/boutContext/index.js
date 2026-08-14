// ─── DOMAIN / BOUT CONTEXT ───────────────────────────────────────────────────
// Corrections 3 and 4.
//
// A bout has properties that belong to the BOUT, not to either fighter and not
// to the roster: the division it is contested at, whether a championship is on
// the line, and how many rounds it is scheduled for. Before this module none of
// the three was representable anywhere in the app, so every consumer silently
// substituted a roster default:
//
//   * division   -- each fighter was normalised against their own stored roster
//                   weight class, so the two corners of one bout could be
//                   normalised against two different divisions.
//   * title      -- not representable at all. The only title-shaped field in the
//                   system is a fighter's CAREER title-bout count.
//   * rounds     -- not representable at all.
//
// The three values are deliberately NULLABLE and null means UNKNOWN. Unknown is
// never silently rewritten to `false` or to 3 rounds: an unverified card and a
// verified non-title three-round bout are different states and the UI has to be
// able to tell them apart. Only `division` has a documented model fallback (the
// roster behaviour that predates this module), because falling back there
// reproduces the previous arithmetic exactly rather than inventing a number.
//
// ── What this module deliberately does NOT do ───────────────────────────────
// isTitleBout is SCHEDULED context for an upcoming bout. It is not, and must
// never be folded into, a fighter's historical TITLE_BOUTS / MODEL_TITLE_BOUTS
// career total, nor into feats.total_title_bout_dif or featsV2.title_bouts.
// Those are career counts of title fights already contested. Adding the
// upcoming bout to one corner's career total would both corrupt a historical
// statistic and fabricate an asymmetric edge. Repairing the historical title /
// division provenance in fightHistory.js is Correction 6 and is out of scope
// here.

// Canonical divisions a bout can be contested at.
//
// Deliberately excludes 'Catch Weight'. Catchweight is not a division: it is the
// absence of one. fightersData.js does carry `w:'Catch Weight'` for a handful of
// athletes, which means DIVISION_UFC_AVERAGES has a 'Catch Weight' bucket -- but
// that bucket is an average over an arbitrary mixture of body types and is not a
// meaningful normalisation context. Treating catchweight as unsupported routes it
// to the documented roster fallback instead of silently selecting that bucket.
const SUPPORTED_DIVISIONS = Object.freeze([
  'Heavyweight',
  'Light Heavyweight',
  'Middleweight',
  'Welterweight',
  'Lightweight',
  'Featherweight',
  'Bantamweight',
  'Flyweight',
  "Women's Featherweight",
  "Women's Bantamweight",
  "Women's Flyweight",
  "Women's Strawweight",
]);

const SUPPORTED_DIVISION_SET = new Set(SUPPORTED_DIVISIONS);

const isSupportedDivision = (division) =>
  typeof division === 'string' && SUPPORTED_DIVISION_SET.has(division);

// Authority tiers for provenance, strongest first. 'official' means a UFC or
// athletic-commission publication; 'secondary' means reputable press. Anything
// unrecognised is normalised to null rather than trusted.
const PROVENANCE_AUTHORITIES = Object.freeze(['official', 'secondary']);

const isPositiveInteger = (value) =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

// A scheduled round count that the UFC actually uses. Anything else is retained
// as a validation error rather than silently coerced -- a 4 here means the data
// is wrong, not that the bout is four rounds.
const CONVENTIONAL_ROUND_COUNTS = Object.freeze([3, 5]);

const normalizeProvenance = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const sourceUrl = typeof raw.sourceUrl === 'string' && raw.sourceUrl ? raw.sourceUrl : null;
  const retrievedAt =
    typeof raw.retrievedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.retrievedAt)
      ? raw.retrievedAt
      : null;
  const authority = PROVENANCE_AUTHORITIES.includes(raw.authority) ? raw.authority : null;
  if (sourceUrl === null && retrievedAt === null && authority === null) return null;
  return { sourceUrl, retrievedAt, authority };
};

// Validate WITHOUT coercing. Returns the problems found so a caller can surface
// them; it never throws and never mutates its input, because every call site is
// on a render path and a malformed saved entry must not blank the card.
const validateBoutContext = (raw) => {
  const errors = [];
  const warnings = [];

  if (raw == null) {
    return { valid: true, errors, warnings, isUnknown: true };
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      valid: false,
      errors: ['boutContext must be an object or null'],
      warnings,
      isUnknown: true,
    };
  }

  const { division, isTitleBout, scheduledRounds } = raw;

  if (division != null && typeof division !== 'string') {
    errors.push('division must be a string or null');
  } else if (typeof division === 'string' && !isSupportedDivision(division)) {
    // Not an error: catchweight bouts are real and must be storable. It is a
    // warning because it means the model cannot use a bout-division average and
    // will fall back to roster normalisation.
    warnings.push(
      `division "${division}" is not a canonical division; normalisation falls back to roster divisions`
    );
  }

  if (isTitleBout != null && typeof isTitleBout !== 'boolean') {
    errors.push('isTitleBout must be a boolean or null');
  }

  if (scheduledRounds != null && !isPositiveInteger(scheduledRounds)) {
    errors.push('scheduledRounds must be a positive integer or null');
  } else if (
    isPositiveInteger(scheduledRounds) &&
    !CONVENTIONAL_ROUND_COUNTS.includes(scheduledRounds)
  ) {
    warnings.push(`scheduledRounds ${scheduledRounds} is not a conventional UFC round count`);
  }

  // A title bout is scheduled for five rounds. A five-round NON-title bout is
  // perfectly valid (non-title main events) and must never be flagged.
  if (isTitleBout === true && isPositiveInteger(scheduledRounds) && scheduledRounds !== 5) {
    errors.push(
      `contradictory context: isTitleBout is true but scheduledRounds is ${scheduledRounds}`
    );
  }

  const isUnknown =
    division == null && isTitleBout == null && scheduledRounds == null;

  return { valid: errors.length === 0, errors, warnings, isUnknown };
};

// Coerce an arbitrary stored value into the canonical shape. Anything malformed
// becomes null (UNKNOWN) rather than a guess. Returns null when there is nothing
// worth carrying, so `entry.boutContext == null` is the single "legacy or
// unknown" check every consumer can rely on.
const normalizeBoutContext = (raw) => {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const division = typeof raw.division === 'string' && raw.division ? raw.division : null;
  const isTitleBout = typeof raw.isTitleBout === 'boolean' ? raw.isTitleBout : null;
  const scheduledRounds = isPositiveInteger(raw.scheduledRounds) ? raw.scheduledRounds : null;
  const provenance = normalizeProvenance(raw.provenance);

  if (division === null && isTitleBout === null && scheduledRounds === null && provenance === null) {
    return null;
  }
  return { division, isTitleBout, scheduledRounds, provenance };
};

// The one place that decides which division each corner is normalised against.
//
// A verified canonical bout division applies to BOTH fighters -- that is the
// whole point of Correction 3, and it is what keeps the two corners of a single
// bout on one normalisation basis. Absent or non-canonical context preserves the
// pre-existing per-fighter roster lookup byte for byte, so untouched call sites
// produce bit-identical arithmetic.
const resolveNormalizationDivisions = (boutContext, fA, fB) => {
  const division = boutContext?.division ?? null;
  if (isSupportedDivision(division)) {
    return { divisionA: division, divisionB: division, source: 'bout' };
  }
  return {
    divisionA: fA?.WEIGHT_CLASS ?? null,
    divisionB: fB?.WEIGHT_CLASS ?? null,
    source: division == null ? 'roster-unknown' : 'roster-unsupported',
  };
};

// True when a verified canonical bout division disagrees with what the roster
// stores for that fighter.
//
// This is NOT "cross-division". The pre-existing App.js flag compared the two
// fighters' roster weight classes to each other, which fires whenever the roster
// is stale for either corner -- exactly the Luque/Gore false positive. The
// meaningful question is whether a fighter is competing away from their stored
// division, which is a per-fighter statement about one fighter and the bout.
const isCompetingOutsideRosterDivision = (boutContext, fighter) => {
  const division = boutContext?.division ?? null;
  if (!isSupportedDivision(division)) return false;
  const roster = fighter?.WEIGHT_CLASS ?? null;
  if (typeof roster !== 'string' || roster === '') return false;
  return roster !== division;
};

// Fighters (in slot order) whose roster division disagrees with the verified
// bout division. Empty when context is unknown or agrees.
const fightersOutsideRosterDivision = (boutContext, fA, fB) =>
  [fA, fB].filter((f) => f && isCompetingOutsideRosterDivision(boutContext, f));

// Display helpers. These centralise the "unknown is not false" rule so no UI
// component has to re-derive it.
//
// Each returns a THREE-state label, self-describing enough to stand alone in a
// compact suffix. A verified non-title bout must read as "Non-title", not as an
// absence -- otherwise the UI cannot distinguish "we checked, it is not a title
// fight" from "we never checked", which is the exact ambiguity Correction 4
// exists to remove.
const describeTitleStatus = (boutContext) => {
  const value = boutContext?.isTitleBout ?? null;
  if (value === null) return 'Title status unknown';
  return value ? 'Title bout' : 'Non-title';
};

const describeScheduledRounds = (boutContext) => {
  const value = boutContext?.scheduledRounds ?? null;
  if (value === null) return 'Rounds unknown';
  return `${value} rounds`;
};

// The compact "· Non-title · 3 rounds" suffix shown next to a saved entry.
//
// An entry that HAS context always renders both states, including the negative
// and unknown ones. An entry with NO context at all renders nothing: a legacy
// row predates the schema and there is genuinely nothing to say about it, which
// is different from a row we looked at and could not verify.
const describeBoutContextSuffix = (boutContext) => {
  if (boutContext == null) return '';
  return ` · ${describeTitleStatus(boutContext)} · ${describeScheduledRounds(boutContext)}`;
};

// Which of the three scheduled-context fields are still unknown. Drives the
// "Incomplete bout context" notice: a division alone does NOT make a context
// complete, so partial verification stays visible instead of reading as done.
const BOUT_CONTEXT_FIELD_LABELS = Object.freeze({
  division: 'division',
  isTitleBout: 'title status',
  scheduledRounds: 'scheduled rounds',
});

const missingBoutContextFields = (boutContext) => {
  const ctx = normalizeBoutContext(boutContext);
  if (ctx === null) return Object.values(BOUT_CONTEXT_FIELD_LABELS);
  return Object.entries(BOUT_CONTEXT_FIELD_LABELS)
    .filter(([field]) => ctx[field] === null)
    .map(([, label]) => label);
};

// True when the entry carries no usable scheduled context at all -- i.e. a legacy
// entry saved before this module existed, or one deliberately left unverified.
const hasUnknownBoutContext = (boutContext) => {
  const ctx = normalizeBoutContext(boutContext);
  if (ctx === null) return true;
  return ctx.division === null && ctx.isTitleBout === null && ctx.scheduledRounds === null;
};

export {
  SUPPORTED_DIVISIONS,
  PROVENANCE_AUTHORITIES,
  CONVENTIONAL_ROUND_COUNTS,
  isSupportedDivision,
  validateBoutContext,
  normalizeBoutContext,
  resolveNormalizationDivisions,
  isCompetingOutsideRosterDivision,
  fightersOutsideRosterDivision,
  describeTitleStatus,
  describeScheduledRounds,
  describeBoutContextSuffix,
  missingBoutContextFields,
  BOUT_CONTEXT_FIELD_LABELS,
  hasUnknownBoutContext,
};
