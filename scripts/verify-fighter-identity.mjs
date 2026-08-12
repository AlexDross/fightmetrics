import assert from 'node:assert/strict';
import fs from 'node:fs';

import { CARDIO_RATIOS } from '../src/cardioModule.js';
import { ELO_RATINGS } from '../src/eloModule.js';
import { FIGHT_HISTORY } from '../src/fightHistory.js';
import { _D2 } from '../src/fightersData.js';
import { HISTORICAL_RANKINGS } from '../src/rankHistory.js';
import {
  getCurrentRanking,
  resolveCurrentRanking,
} from '../src/domain/rankings/current.js';

const LEGACY_NAME = 'Ian Garry';
const CANONICAL_NAME = 'Ian Machado Garry';

const aliases = JSON.parse(
  fs.readFileSync(new URL('../name_aliases.json', import.meta.url), 'utf8')
);

assert.equal(
  aliases[LEGACY_NAME],
  CANONICAL_NAME,
  'The ingest alias must resolve Ian Garry to Ian Machado Garry.'
);

const canonicalRows = _D2.filter(({ n }) => n === CANONICAL_NAME);
assert.equal(
  canonicalRows.length,
  1,
  'The primary roster must contain exactly one Ian Machado Garry row.'
);
assert.equal(
  _D2.some(({ n }) => n === LEGACY_NAME),
  false,
  'The legacy Ian Garry roster row must not be present.'
);

for (const [label, source] of [
  ['fight history', FIGHT_HISTORY],
  ['Elo ratings', ELO_RATINGS],
  ['cardio ratios', CARDIO_RATIOS],
]) {
  assert.ok(source[CANONICAL_NAME], `${label} must use the canonical name.`);
  assert.equal(
    source[LEGACY_NAME],
    undefined,
    `${label} must not retain the legacy name.`
  );
}

const profile = canonicalRows[0];
const history = FIGHT_HISTORY[CANONICAL_NAME];
const decisiveHistory = history.filter(({ re }) => re === 'W' || re === 'L');
const historyWins = decisiveHistory.filter(({ re }) => re === 'W').length;
const historyLosses = decisiveHistory.filter(({ re }) => re === 'L').length;

assert.ok(history.length > 0, 'The canonical profile must join to fight history.');
assert.equal(profile.wi, historyWins, 'Roster wins must match fight history.');
assert.equal(profile.lo, historyLosses, 'Roster losses must match fight history.');
assert.equal(
  profile.lfd,
  history[0].dt,
  'The roster last-fight date must match the latest history entry.'
);
assert.equal(
  ELO_RATINGS[CANONICAL_NAME].n,
  decisiveHistory.length,
  'Elo fight count must match decisive fight history.'
);
assert.equal(
  history.some(({ op }) => op === LEGACY_NAME),
  false,
  'Opponent references must use the canonical name.'
);

// UFC rankings must use the canonical name.
//
// This assertion used to match a `'Ian Machado Garry': { division: 'Welterweight',
// rank: … }` literal in src/App.js. The Vite/domain-extraction refactor (e28c8a2)
// moved rankings out of App.js, so the pattern could never match again and this
// script failed unconditionally — the Update Fighters workflow only ever got here
// after the updater itself was fixed, which is how it stayed hidden.
//
// Rankings now live in two places, and both are checked against the same intent:
//   * the roster's divisional-rank field (`dr`) on the canonical row
//   * HISTORICAL_RANKINGS in src/rankHistory.js, keyed by fighter name
assert.equal(
  typeof canonicalRows[0].dr,
  'number',
  'The canonical roster row must carry a divisional rank.'
);

// Asserted against the imported STRUCTURE, never the source text: a substring
// search can be satisfied by a comment, a prose note or an unrelated value, so
// it would pass without the rankings actually being keyed correctly.
assert.ok(
  Object.hasOwn(HISTORICAL_RANKINGS, CANONICAL_NAME),
  'Historical rankings must be keyed by the canonical name.'
);
assert.equal(
  Object.hasOwn(HISTORICAL_RANKINGS, LEGACY_NAME),
  false,
  'Historical rankings must not be keyed by the legacy name.'
);

// Current official rankings must join to the canonical name, and the ingest
// alias must resolve the legacy name to the same record -- otherwise a renamed
// fighter silently shows as unranked in the UI.
const canonicalCurrent = getCurrentRanking(CANONICAL_NAME, 'Welterweight');
assert.ok(
  canonicalCurrent,
  'Current rankings must join to the canonical fighter.'
);
assert.equal(
  getCurrentRanking(LEGACY_NAME, 'Welterweight')?.rank,
  canonicalCurrent.rank,
  'The ranking alias must resolve the legacy name to the canonical rank.'
);
assert.equal(
  resolveCurrentRanking(CANONICAL_NAME, 'Welterweight')?.crossDivision,
  false,
  'The canonical fighter is ranked in his own roster division.'
);

console.log(
  `OK ${CANONICAL_NAME}: ${historyWins}-${historyLosses}, ` +
    `${history.length} fights, Elo ${ELO_RATINGS[CANONICAL_NAME].elo}, ` +
    `cardio ${CARDIO_RATIOS[CANONICAL_NAME]}`,
  `| current rank #${canonicalCurrent.rank} ${canonicalCurrent.division}`
);
