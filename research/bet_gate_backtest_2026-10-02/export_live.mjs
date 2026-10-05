// Exports graded live entries (2026-05-23 onward) for the gate backtest holdout.
import { ROI_ENTRIES } from '../../src/roiData.js';
const cols = ['eventDate', 'eventName', 'fighterA', 'fighterB', 'actualWinner', 'oddsA', 'oddsB',
  'v2pA', 'v2pB', 'betAction', 'decisionProbabilitySource', 'captureMode'];
const out = [cols.join(',')];
for (const e of ROI_ENTRIES) {
  if (!e.eventDate || e.eventDate < '2026-05-23') continue;
  if (e.actualWinner !== e.fighterA && e.actualWinner !== e.fighterB) continue;
  if (e.v2pA == null || !e.oddsA || !e.oddsB) continue;
  const row = { ...e, captureMode: e._provenance?.captureMode ?? '' };
  out.push(cols.map((c) => JSON.stringify(row[c] ?? '')).join(','));
}
process.stdout.write(out.join('\n') + '\n');
