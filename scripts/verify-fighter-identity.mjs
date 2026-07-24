import assert from 'node:assert/strict';
import fs from 'node:fs';

import { CARDIO_RATIOS } from '../src/cardioModule.js';
import { ELO_RATINGS } from '../src/eloModule.js';
import { FIGHT_HISTORY } from '../src/fightHistory.js';
import { _D2 } from '../src/fightersData.js';

const LEGACY_NAME = 'Ian Garry';
const CANONICAL_NAME = 'Ian Machado Garry';

const aliases = JSON.parse(
  fs.readFileSync(new URL('../name_aliases.json', import.meta.url), 'utf8')
);
const appSource = fs.readFileSync(
  new URL('../src/App.js', import.meta.url),
  'utf8'
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

assert.match(
  appSource,
  /'Ian Machado Garry':\s*\{\s*division:\s*'Welterweight',\s*rank:/,
  'UFC rankings must use the canonical name.'
);

console.log(
  `OK ${CANONICAL_NAME}: ${historyWins}-${historyLosses}, ` +
    `${history.length} fights, Elo ${ELO_RATINGS[CANONICAL_NAME].elo}, ` +
    `cardio ${CARDIO_RATIOS[CANONICAL_NAME]}`
);
