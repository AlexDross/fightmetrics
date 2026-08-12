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
// Run from repo root:  node scripts/generate-fighter-birthdates.mjs
// Verify without writing:  node scripts/generate-fighter-birthdates.mjs --check

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fightersPath = path.join(ROOT, 'fighters.json');
const aliasesPath = path.join(ROOT, 'name_aliases.json');
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

// Code-point ordering. Array.prototype.sort's default comparator already
// compares UTF-16 code units, which is exactly the stable ordering we want.
const sortedNames = [...birthdates.keys()].sort();
const sorted = Object.fromEntries(sortedNames.map((n) => [n, birthdates.get(n)]));

const source =
  `// Generated from fighters.json by scripts/generate-fighter-birthdates.mjs.\n` +
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
      (skippedMalformed ? ` (skipped ${skippedMalformed} malformed dob values)` : ''),
  );
}
