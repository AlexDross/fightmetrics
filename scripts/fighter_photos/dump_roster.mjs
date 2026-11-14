// Writes the roster the photo sourcer matches against: every fighter in
// fightersData.js plus active prospects, with division, last fight date and
// date of birth (the DOB is what disambiguates same-name Wikidata entities).
//
//   node scripts/fighter_photos/dump_roster.mjs > /tmp/roster.json
import { _D2 } from '../../src/fightersData.js';
import { getActiveProspects } from '../../src/prospectsData.js';
import { FIGHTER_BIRTHDATES } from '../../src/fighterBirthdates.js';

const seen = new Set();
const roster = [];
for (const f of [..._D2, ...getActiveProspects()]) {
  if (!f?.n || seen.has(f.n)) continue;
  seen.add(f.n);
  roster.push({ name: f.n, division: f.w ?? null, lastFight: f.lfd ?? null, dob: FIGHTER_BIRTHDATES[f.n] ?? null });
}
process.stdout.write(JSON.stringify(roster));
