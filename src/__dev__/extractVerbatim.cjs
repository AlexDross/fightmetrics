// Foundation Stage 3 -- verbatim extractor. DEV ONLY, removed with the harness.
//
//   node src/__dev__/extractVerbatim.cjs <outDir> <label> <name:a-b> ...
//
// Moves whole line ranges out of src/App.js byte-identically. Exports are
// declared in a single trailing block so no moved line has to change. Prints a
// verbatim proof and the list of import bindings the new module still needs.
const fs = require('fs');
const path = require('path');

const APP = 'src/App.js';
const [, , outDir, label, ...specs] = process.argv;
const MEMBERS = specs.map((s) => {
  const [name, r] = s.split(':');
  const [a, b] = r.split('-').map(Number);
  return [name, a, b];
});

const lines = fs.readFileSync(APP, 'utf8').split('\n');

// A range may OPEN WITH LEADING COMMENTS so a declaration's explanatory block
// travels with it. Stage 3 commits 1-4 moved [declLine .. nextDecl-1], which put
// each comment at the tail of the PRECEDING declaration and stranded five of
// them (repaired in 29533f5 and 53eda57). Starting a range at the comment fixes
// that at the source.
//
// Still verified: the declaration must appear somewhere in the range, and
// everything before it must be a comment or blank.
for (const [name, a, b] of MEMBERS) {
  const re = new RegExp('^(?:export\\s+)?(?:const|let|var|function)\\s+' + name + '\\b');
  let declAt = -1;
  for (let i = a; i <= b; i++) if (re.test(lines[i - 1])) { declAt = i; break; }
  if (declAt < 0) {
    console.error('RANGE MISMATCH ' + name + ' @' + a + '-' + b + ': declaration not found in range');
    process.exit(2);
  }
  for (let i = a; i < declAt; i++) {
    const l = lines[i - 1].trim();
    if (l !== '' && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*')) {
      console.error('RANGE LEAD-IN for ' + name + ' @' + i + ' is not a comment: ' + lines[i - 1]);
      process.exit(2);
    }
  }
}

// Which import bindings does the moved text still reference?
const importMap = {};
const re = /import\s*(?:\{([^}]*)\}|([A-Za-z_$][\w$]*))?\s*(?:,\s*\{([^}]*)\})?\s*from\s*'([^']+)'/g;
const whole = lines.join('\n');
let m;
while ((m = re.exec(whole))) {
  const list = [m[1], m[3]].filter(Boolean).join(',').split(',')
    .map((x) => x.trim().split(/\s+as\s+/).pop()).filter(Boolean);
  if (m[2]) list.push(m[2]);
  list.forEach((n) => { importMap[n] = m[4]; });
}

let movedRaw = MEMBERS.map(([, a, b]) => lines.slice(a - 1, b).join('\n')).join('\n\n');

// KNOWN LIMITATION, PARTIALLY MITIGATED.
// The scanner is token-based, not an AST walk. Two failure modes:
//
//   1. Member properties read as free bindings. `fA.FIGHT_HISTORY` is a
//      property access, not the imported FIGHT_HISTORY module binding, but a
//      bare identifier scan cannot tell them apart. This produced two unused
//      imports in the Stage 3 model and betting modules. Mitigated below by
//      stripping `.prop` and `?.prop` before scanning, and by requiring at
//      least one occurrence NOT preceded by a dot.
//   2. Object literal keys (`{ FIGHT_HISTORY: ... }`) look the same as
//      references. Not mitigated -- still review the generated list.
//
// The inverse error is the dangerous one: a MISSING import is a runtime
// ReferenceError (this is how SOURCE_MANIFEST was caught by the goldens),
// whereas a spurious one is only clutter. So the scan stays deliberately
// generous, and the printed list must be reviewed against real usage before
// the commit lands. Do not trust it blind.
const scrub = movedRaw
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/\/\/[^\n]*/g, ' ')
  .replace(/\?\.\s*[A-Za-z_$][\w$]*/g, ' ')   // optional-chained property access
  .replace(/\.\s*[A-Za-z_$][\w$]*/g, ' ');    // plain property access
const ids = new Set(scrub.match(/[A-Za-z_$][\w$]*/g) || []);
const own = new Set(MEMBERS.map(([n]) => n));
const needed = Object.keys(importMap)
  .filter((n) => ids.has(n) && !own.has(n) && !/^(React|useState|useMemo|useEffect)$/.test(n));

const byModule = {};
for (const n of needed) (byModule[importMap[n]] ||= []).push(n);

const relFromOut = (spec) => {
  if (!spec.startsWith('./')) return spec;
  const target = path.join('src', spec.slice(2));
  let r = path.relative(outDir, target);
  return r.startsWith('.') ? r : './' + r;
};

const importLines = Object.entries(byModule)
  .map(([mod, ns]) => `import { ${ns.join(', ')} } from '${relFromOut(mod)}';`).join('\n');

// buildProvenance-style: a moved line may already say `export const X`
const alreadyExported = new Set(
  MEMBERS.filter(([n, a]) => /^export\s/.test(lines[a - 1])).map(([n]) => n)
);

const header = `// ─── DOMAIN / ${label.toUpperCase()} ${'─'.repeat(Math.max(0, 58 - label.length))}
// Foundation Stage 3. Extracted VERBATIM from src/App.js.
//
// Every line below is byte-identical to its original. Exports are declared in a
// single block at the end so no moved line had to change.
//
// Original locations in App.js (pre-extraction line numbers):
${MEMBERS.map(([n, a, b]) => `//   ${String(a).padStart(5)}-${String(b).padEnd(5)} ${n}`).join('\n')}

${importLines}
`;

const exportBlock = '\nexport {\n' +
  MEMBERS.filter(([n]) => !alreadyExported.has(n)).map(([n]) => '  ' + n + ',').join('\n') +
  '\n};\n';

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.js'), header + '\n' + movedRaw + '\n' + exportBlock);

const drop = new Set();
for (const [, a, b] of MEMBERS) for (let i = a; i <= b; i++) drop.add(i);
const kept = [];
for (let i = 1; i <= lines.length; i++) if (!drop.has(i)) kept.push(lines[i - 1]);

let lastImport = 0;
kept.forEach((l, i) => { if (/^} from '\.\//.test(l) || /^import .*;$/.test(l)) lastImport = i; });
const rel = './' + path.relative('src', outDir);
kept.splice(lastImport + 1, 0,
  `\n// Foundation Stage 3: extracted verbatim -- see ${outDir}/index.js\nimport {\n` +
  MEMBERS.map(([n]) => '  ' + n + ',').join('\n') + `\n} from '${rel}';`);
fs.writeFileSync(APP, kept.join('\n'));

const mod = fs.readFileSync(path.join(outDir, 'index.js'), 'utf8');
let ok = true;
for (const [name, a, b] of MEMBERS) {
  if (!mod.includes(lines.slice(a - 1, b).join('\n'))) { ok = false; console.error('NOT VERBATIM: ' + name); }
}
console.log(label + ': ' + MEMBERS.length + ' decls, ' +
  MEMBERS.reduce((n, [, a, b]) => n + (b - a + 1), 0) + ' lines');
console.log('imports added: ' + (importLines || '(none)'));
console.log('  ^ REVIEW THESE. The scanner is token-based; object-literal keys can');
console.log('    still masquerade as references. A missing import is a runtime');
console.log('    ReferenceError; a spurious one is dead weight. Check each by hand.');
console.log('App.js: ' + lines.length + ' -> ' + kept.length);
console.log(ok ? 'ALL RANGES BYTE-IDENTICAL' : 'VERBATIM CHECK FAILED');
process.exit(ok ? 0 : 1);
