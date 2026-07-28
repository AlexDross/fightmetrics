// Foundation Stage 0 -- golden fixture capture, headless. DEV ONLY.
//
// Stages 1a/1b/3 re-run THIS SCRIPT and diff the output. Reproducible by
// construction; no manual console steps, no download prompts.
//
//   NODE_PATH=/tmp/pptr/node_modules node src/__dev__/captureGoldens.cjs [baseUrl]
//
// Runs the in-page harness (window.__fmGoldens) and writes the fixtures with
// Node's fs, which avoids the devtools-eval size and console-throughput limits
// that make browser-side transfer unreliable.
// Removed together with the harness in Stage 4.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = path.join(__dirname, '..', '..');
const REFERENCE_DIR = path.join(ROOT, 'baseline', 'fixtures');

const args = process.argv.slice(2).filter((a) => a !== '--init');
const INIT = process.argv.includes('--init');
const BASE = args[0] || 'http://localhost:3001';

// Default destination is a timestamped CANDIDATE directory. The committed
// reference is never the default target -- an approved baseline must not be
// silently overwritten by a routine re-run (which is exactly how the Stage 0
// metrics timestamp ended up describing a superseded capture).
const OUT = args[1]
  ? path.resolve(args[1])
  : path.join(ROOT, 'baseline', 'candidates', new Date().toISOString().replace(/[:.]/g, '-'));

function guardReference(dir) {
  if (path.resolve(dir) !== path.resolve(REFERENCE_DIR)) return;
  if (!INIT) {
    console.error(
      '\nREFUSED: ' + REFERENCE_DIR + ' is the committed Stage 0 reference.\n' +
      'Capture to a candidate directory and compare with verifyFixtures.cjs:\n' +
      '  node src/__dev__/captureGoldens.cjs <baseUrl>            # auto candidate dir\n' +
      '  node src/__dev__/captureGoldens.cjs <baseUrl> <outDir>   # explicit dir\n' +
      'Only pass --init to establish a NEW baseline in an EMPTY reference dir.\n'
    );
    process.exit(2);
  }
  const existing = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => !f.startsWith('.')) : [];
  if (existing.length) {
    console.error(
      '\nREFUSED: --init given but ' + REFERENCE_DIR + ' is not empty (' +
      existing.length + ' file(s)).\nRemove them deliberately, in their own commit, before re-initialising.\n'
    );
    process.exit(2);
  }
}

(async () => {
  guardReference(OUT);
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120000 });

  await page.waitForFunction(
    () => !!window.__fmGoldens && !!window.__FM_GOLDEN_INTERNALS__,
    { timeout: 120000 }
  );

  // Silence the per-call console.log/assert inside computeMatchupEdges
  // (App.js:4357/4377) for the duration of the capture only.
  const payload = await page.evaluate(() => {
    const saved = { log: console.log, assert: console.assert, warn: console.warn };
    console.log = () => {}; console.assert = () => {}; console.warn = () => {};
    try {
      const g = window.__fmGoldens.capture();
      const enc = window.__fmGoldens.encodeSpecials;
      const head = {
        schemaVersion: g.schemaVersion, captureMs: g.captureMs,
        captureIso: g.captureIso, captureBase: g.captureBase,
      };
      return {
        head,
        files: {
          'characterisation.json': enc({ ...head, rematch: g.rematchCharacterisation, dateDerivedFields: g.dateDerivedFields }),
          'statistics.golden.json': enc({ ...head, statistics: g.statistics }),
          'roster.manifest.json': enc({ ...head, ...g.roster }),
          'fighters.golden.json': enc({ ...head, selection: g.selection, pairs: g.pairs, fighterFixtures: g.fighterFixtures }),
          'entries.golden.json': enc({ ...head, volatileEntryPaths: g.volatileEntryPaths, entryGoldens: g.entryGoldens }),
          'model.golden.json': enc({ ...head, modelGoldens: g.modelGoldens, symmetry: g.symmetry }),
        },
        counts: {
          roster: g.roster.length, pairs: g.pairs.length,
          modelGoldens: g.modelGoldens.length, entryGoldens: g.entryGoldens.length,
          duplicateNames: g.roster.duplicateNameCount,
        },
      };
    } finally { Object.assign(console, saved); }
  });

  for (const [name, obj] of Object.entries(payload.files)) {
    const body = JSON.stringify(obj, null, 2);
    fs.writeFileSync(path.join(OUT, name), body);
    console.log('wrote', name.padEnd(24), (body.length / 1024).toFixed(0) + 'KB');
  }
  await browser.close();

  console.log('\noutDir     :', OUT);
  console.log('captureIso :', payload.head.captureIso);
  console.log('captureBase:', payload.head.captureBase);
  console.log('counts     :', JSON.stringify(payload.counts));
  if (path.resolve(OUT) !== path.resolve(REFERENCE_DIR)) {
    console.log('\nCandidate written. Compare against the approved reference:');
    console.log('  node src/__dev__/verifyFixtures.cjs --candidate "' + OUT + '"');
  }
})();
