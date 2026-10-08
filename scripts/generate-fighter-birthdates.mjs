#!/usr/bin/env node
//
// Regenerates src/fighterBirthdates.js -- the canonical name -> date-of-birth
// map that src/domain/age derives every fighter age from.
//
// Source of truth is fighters.json (the same artifact update_fighters.py
// writes), keyed by the CANONICAL roster name so lookups can be done with the
// FIGHTER field the app already carries. name_aliases.json is applied so a
// source row filed under a legacy spelling ("Ian Garry") lands on the roster
// name the app uses ("Ian Machado Garry").
//
// Determinism matters: this file is committed, and the scheduled fighter-update
// workflow regenerates and stages it. Two runs over the same fighters.json must
// produce byte-identical output on any machine, so keys are sorted by UTF-16
// CODE POINT, never by localeCompare -- collation is ICU- and locale-dependent,
// and 661 of the ~2,200 keys land in a different position under a locale-aware
// sort than under a code-point sort. A CI runner whose ICU build differs from a
// developer's would otherwise reshuffle the whole artifact.
//
// Second source: fighter_profiles.json, the tale-of-the-tape join that
// update_fighters.py writes for roster names (ufcstats, one row per fighter,
// ambiguous names already dropped). fighters.json is frozen, so without this a
// fighter who debuted after it was last built never gets a birth date. It only
// FILLS: a name fighters.json already dates keeps that date, and a
// disagreement between the two is counted, not thrown, because the second
// source never overrides the first. Absent file = no second source.
//
// Run from repo root:  node scripts/generate-fighter-birthdates.mjs
// Verify without writing:  node scripts/generate-fighter-birthdates.mjs --check

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fightersPath = path.join(ROOT, 'fighters.json');
const aliasesPath = path.join(ROOT, 'name_aliases.json');
const profilesPath = path.join(ROOT, 'fighter_profiles.json');
const outputPath = path.join(ROOT, 'src', 'fighterBirthdates.js');

const checkOnly = process.argv.includes('--check');

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

const fighters = JSON.parse(fs.readFileSync(fightersPath, 'utf8'));
const aliases = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));

const birthdates = new Map();
let skippedMalformed = 0;

for (const fighter of fighters) {
  const dob = fighter?.dob ?? '';
  if (!DATE_ONLY_RE.test(dob)) {
    if (dob) skippedMalformed += 1;
    continue;
  }
  const canonicalName = aliases[fighter.name] ?? fighter.name;
  if (!canonicalName) continue;

  // A duplicate row carrying the SAME date is fine (aliases legitimately
  // collapse two source rows onto one canonical fighter). Two different dates
  // for one canonical name means the join is wrong, and silently keeping
  // either one would put a bad age into the model -- fail loudly instead.
  const existing = birthdates.get(canonicalName);
  if (existing !== undefined && existing !== dob) {
    throw new Error(
      `Conflicting birth dates for ${canonicalName}: ${existing} and ${dob}`,
    );
  }
  birthdates.set(canonicalName, dob);
}

let filledFromProfiles = 0;
let profileDisagreements = 0;
if (fs.existsSync(profilesPath)) {
  const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
  for (const [name, profile] of Object.entries(profiles)) {
    const dob = profile?.dob ?? '';
    if (!DATE_ONLY_RE.test(dob)) continue;
    const canonicalName = aliases[name] ?? name;
    const existing = birthdates.get(canonicalName);
    if (existing === undefined) {
      birthdates.set(canonicalName, dob);
      filledFromProfiles += 1;
    } else if (existing !== dob) {
      profileDisagreements += 1;
    }
  }
}

// Code-point ordering. Array.prototype.sort's default comparator already
// compares UTF-16 code units, which is exactly the stable ordering we want.
const sortedNames = [...birthdates.keys()].sort();
const sorted = Object.fromEntries(sortedNames.map((n) => [n, birthdates.get(n)]));

const source =
  `// Generated from fighters.json (+ fighter_profiles.json for names it lacks)\n` +
  `// by scripts/generate-fighter-birthdates.mjs.\n` +
  `// Do not hand-edit. Date of birth is the durable source; the stored integer\n` +
  `// ages in fightersData.js are fallbacks used only where no DOB is known.\n` +
  `// Keys are canonical roster names (name_aliases.json applied), sorted by\n` +
  `// code point so regeneration is byte-identical across machines.\n` +
  `export const FIGHTER_BIRTHDATES = Object.freeze(${JSON.stringify(sorted, null, 2)});\n`;

if (checkOnly) {
  const current = fs.existsSync(outputPath)
    ? fs.readFileSync(outputPath, 'utf8')
    : null;
  if (current !== source) {
    console.error(
      `${path.relative(ROOT, outputPath)} is stale. Run: node scripts/generate-fighter-birthdates.mjs`,
    );
    process.exit(1);
  }
  console.log(
    `${path.relative(ROOT, outputPath)} is up to date (${birthdates.size} birth dates).`,
  );
} else {
  fs.writeFileSync(outputPath, source);
  console.log(
    `Wrote ${birthdates.size} fighter birth dates to ${path.relative(ROOT, outputPath)}` +
      (skippedMalformed ? ` (skipped ${skippedMalformed} malformed dob values)` : '') +
      `; ${filledFromProfiles} filled from fighter_profiles.json` +
      (profileDisagreements ? `, ${profileDisagreements} disagree with fighters.json (fighters.json kept)` : ''),
  );
}
