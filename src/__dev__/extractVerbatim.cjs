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
for (const [name, a] of MEMBERS) {
  const re = new RegExp('^(?:export\\s+)?(?:const|let|var|function)\\s+' + name + '\\b');
  if (!re.test(lines[a - 1])) {
    console.error('RANGE MISMATCH ' + name + ' @' + a + ': ' + lines[a - 1]);
    process.exit(2);
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
const scrub = movedRaw.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
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
console.log('App.js: ' + lines.length + ' -> ' + kept.length);
console.log(ok ? 'ALL RANGES BYTE-IDENTICAL' : 'VERBATIM CHECK FAILED');
process.exit(ok ? 0 : 1);
