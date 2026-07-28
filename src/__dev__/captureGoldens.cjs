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
const BASE = process.argv[2] || 'http://localhost:3001';
const OUT = path.join(__dirname, '..', '..', 'baseline', 'fixtures');

(async () => {
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

  console.log('\ncaptureIso :', payload.head.captureIso);
  console.log('captureBase:', payload.head.captureBase);
  console.log('counts     :', JSON.stringify(payload.counts));
})();
