// PROP_PICKS — Alex's manual, discretionary method-of-victory / round props.
//
// ISOLATION: this file and array are PHYSICALLY SEPARATE from every model-
// related data structure (roiData.js, upcomingData.js) and from every
// model computation (v2DataMap, buildRoiEntry, computeMatchupEdges, the
// three Statistics charts, computeROISummary, betAction/edge/Kelly logic).
// Nothing in this app merges PROP_PICKS into ROI_ENTRIES or vice versa, and
// nothing here is model-generated — every entry is a pick Alex made himself.
// Every entry also carries pickSource: 'human' as defense-in-depth, but the
// primary isolation mechanism is this separate file/array, not the tag.
export const PROP_PICKS = [];
