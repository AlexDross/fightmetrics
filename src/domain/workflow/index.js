// ─── DOMAIN / WORKFLOW ───────────────────────────────────────────────────────
// Foundation Stage 4. Behaviour-preserving extraction of the Upcoming -> ROI
// transitions that App.js already performs.
//
// Every function here is pure: inputs in, new values out, no state, no clock
// except what the caller passes. That is the point -- the logic was previously
// trapped inside a useState initialiser and two setState updaters, so it could
// only be "tested" by duplicating it, which tests nothing.
//
// BEHAVIOUR IS PRESERVED EXACTLY, INCLUDING THE PARTS THAT ARE WRONG.
// The pending-matchup key is the sorted fighter pair with NO event component,
// so a rematch at a different event is still rejected while another bout
// between the same two fighters is pending. That is a real defect (recorded in
// characterisation.json and research/code_health_audit.md) and it is
// characterised here, not fixed. Event-aware identity belongs to Stage 6.

// Visibility window for a pending entry.
//
// Parses eventDate's y/m/d manually into new Date(y, m-1, d) -- the local-time
// constructor overload -- rather than new Date(eventDate), which for a
// date-only ISO string parses as UTC midnight and can land on the wrong local
// day. Fails open (keeps the entry visible) on anything that doesn't cleanly
// parse as YYYY-MM-DD.
//
// The entry stays visible until the Tuesday at least 7 days after the event,
// inclusive of that Tuesday itself.
export const isUpcomingVisible = (eventDate, todayStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate ?? '')) return true;
  const [y, m, d] = eventDate.split('-').map(Number);
  const eventLocal = new Date(y, m - 1, d);
  if (isNaN(eventLocal.getTime())) return true;
  const plus7 = new Date(eventLocal);
  plus7.setDate(plus7.getDate() + 7);
  const daysUntilTuesday = (2 - plus7.getDay() + 7) % 7; // getDay(): 0=Sun..2=Tue..6=Sat
  const cutoff = new Date(plus7);
  cutoff.setDate(cutoff.getDate() + daysUntilTuesday);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
  // Inclusive: still visible ON the cutoff Tuesday itself, hidden the day after.
  return todayStr <= cutoffStr;
};

// The pending set App shows on load.
//
// Drops anything already graded in ROI so a stale upcomingData.js export cannot
// resurrect a graded fight as a ghost pending entry on reload. Matches by id,
// which buildRoiEntry stamps once and which is carried unchanged from Upcoming
// into ROI. Composes with isUpcomingVisible -- both conditions must hold.
export const filterVisibleUpcoming = (upcomingEntries, roiEntries, todayStr) => {
  const gradedIds = new Set((roiEntries ?? []).map((e) => e.id));
  return (upcomingEntries ?? []).filter(
    (e) => isUpcomingVisible(e.eventDate, todayStr) && !gradedIds.has(e.id)
  );
};

// Deduplication key for a pending matchup.
//
// CHARACTERISATION, NOT AN ENDORSEMENT: sorted fighter pair only. No event, no
// date. Two different events between the same two fighters collide.
export const pendingMatchupKey = (entry) =>
  [entry.fighterA, entry.fighterB].sort().join('|');

// Add a pending entry unless one with the same matchup key is already pending.
// Newest first. Returns the ORIGINAL array unchanged on a duplicate, preserving
// App's referential-equality behaviour inside setState.
export const addPendingEntry = (pendingEntries, entry) => {
  const key = pendingMatchupKey(entry);
  const alreadyExists = pendingEntries.some((e) => pendingMatchupKey(e) === key);
  if (alreadyExists) return pendingEntries;
  return [entry, ...pendingEntries];
};

// Grade a pending entry into an ROI entry.
//
// Preserves the id and every frozen field verbatim, adding only actualWinner.
// This is the freeze-at-save read path: nothing is recomputed here.
export const createGradedEntry = (entry, actualWinner) => ({ ...entry, actualWinner });

export const removePendingEntry = (pendingEntries, id) =>
  pendingEntries.filter((e) => e.id !== id);
