// PROP_PICKS — Alex's manual, discretionary method-of-victory props.
//
// ISOLATION: this file and array are PHYSICALLY SEPARATE from every model-
// related data structure (roiData.js, upcomingData.js) and from every
// model computation (v2DataMap, buildRoiEntry, computeMatchupEdges, the
// three Statistics charts, computeROISummary, betAction/edge/Kelly logic).
// Nothing in this app merges PROP_PICKS into ROI_ENTRIES or vice versa, and
// nothing here is model-generated — every entry is a pick Alex made himself.
// Every entry also carries pickSource: 'human' as defense-in-depth, but the
// primary isolation mechanism is this separate file/array, not the tag.
//
// 2026-07-19 — RECONSTRUCTION NOTE (read before trusting these two entries):
// Props have no persistence path — grading a prop only ever updates the
// in-memory propPicks React state (App.js setPropPicks); there is no export
// button and nothing writes back to this file (unlike roiData.js/
// upcomingData.js, which have "Copy Updated ...js" buttons). The two entries
// below (Chase Hooper wins by Submission, Dricus Du Plessis wins by
// Decision — both graded WON on UFC Fight Night OKC) were graded in-browser,
// then lost when that in-memory state went away before ever being exported.
// They were manually recovered on 2026-07-19 by reading the live browser
// state and reconstructing the PROP_PICKS object shape by hand.
// id, createdAt, and upcomingId on both entries are RECONSTRUCTED
// PLACEHOLDERS, not captured values — the real ones existed only in the lost
// browser state and are unrecoverable. Every other field (eventName,
// eventDate, fighterA/B, side, method, odds, stake, result, label,
// propType) reflects what was actually confirmed on screen. Same honesty
// principle as the aaa4569 note in BASELINE_NOTES.md: the reconstruction is
// documented rather than silently presented as an original capture.
export const PROP_PICKS = [
  {
    id: '1784577600000-a1b2c3',
    createdAt: '2026-07-18T00:00:00.000Z',
    pickSource: 'human',
    upcomingId: null,
    eventName: 'UFC Fight Night OKC',
    eventDate: '2026-07-18',
    fighterA: 'Chase Hooper',
    fighterB: 'Mitch Ramirez',
    side: 'A',
    method: 'Submission',
    odds: '+150',
    stake: 1,
    result: 'WON',
    label: 'Chase Hooper wins by Submission',
    propType: 'Method of Victory',
  },
  {
    id: '1784577600001-d4e5f6',
    createdAt: '2026-07-18T00:00:00.000Z',
    pickSource: 'human',
    upcomingId: null,
    eventName: 'UFC Fight Night OKC',
    eventDate: '2026-07-18',
    fighterA: 'Dricus Du Plessis',
    fighterB: 'Kamaru Usman',
    side: 'A',
    method: 'Decision',
    odds: '+165',
    stake: 1,
    result: 'WON',
    label: 'Dricus Du Plessis wins by Decision',
    propType: 'Method of Victory',
  },
];
