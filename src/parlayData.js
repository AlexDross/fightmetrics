// Manual parlay bets -- physically separate from ROI_ENTRIES / UPCOMING_ENTRIES
// and from PROP_PICKS. A parlay spans multiple fights, so it must never be fed
// into any model/Statistics population (computeV2Summary, computeV2FrozenRows,
// filterRoiEntriesForStats, computeROISummary, or any other per-fight
// computation) -- doing so would corrupt per-fight accuracy/ROI by counting a
// multi-fight bet as if it were a single fight. Grading reads roiEntries
// read-only (to resolve each leg's actual winner) but never writes into it,
// and roiEntries/upcomingEntries never read from this file.
export const PARLAY_ENTRIES = [];
