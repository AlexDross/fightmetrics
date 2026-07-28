// Foundation Stage 0 -- reproducible visual baseline capture. DEV ONLY.
//
// Stage 1a and 1b must re-run THIS EXACT SCRIPT against their own build and
// diff the output. A hand-taken screenshot set is not a baseline; a script is.
//
//   npm i --no-save puppeteer-core        (not added to package.json)
//   node src/__dev__/captureScreens.cjs [baseUrl] [outDir]
//
// Uses the system Chrome rather than downloading a browser.
// Removed together with the harness in Stage 4.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const ROOT = path.join(__dirname, '..', '..');

// BOTH committed visual references are protected from overwrite. Stage 0 is the
// historical v3 record and must never be replaced, renamed or deleted; Stage 1b
// is the active reference for Stage 2 onward.
const PROTECTED_REFERENCES = [
  { dir: path.join(ROOT, 'baseline', 'screenshots-stage0'), label: 'Stage 0 (CRA + Tailwind v3 CDN, historical)' },
  { dir: path.join(ROOT, 'baseline', 'screenshots-stage1b'), label: 'Stage 1b (Vite + Tailwind v4, active reference)' },
];

const argv = process.argv.slice(2).filter((a) => a !== '--init');
const INIT = process.argv.includes('--init');
const BASE = argv[0] || 'http://localhost:3001';

// Candidates never default to a protected reference directory.
const OUT = argv[1]
  ? path.resolve(argv[1])
  : path.join(ROOT, 'baseline', 'candidates', new Date().toISOString().replace(/[:.]/g, '-') + '-screens');

for (const ref of PROTECTED_REFERENCES) {
  if (path.resolve(OUT) !== path.resolve(ref.dir)) continue;
  const existing = fs.existsSync(ref.dir)
    ? fs.readdirSync(ref.dir).filter((f) => !f.startsWith('.')) : [];
  if (!INIT || existing.length) {
    console.error(
      '\nREFUSED: ' + ref.dir + '\n' +
      'is the committed ' + ref.label + ' visual reference.\n' +
      (existing.length ? '  (--init given but the directory is not empty: ' + existing.length + ' file(s))\n' : '') +
      'Capture to a candidate directory instead:\n' +
      '  node src/__dev__/captureScreens.cjs <baseUrl>          # auto candidate dir\n' +
      '  node src/__dev__/captureScreens.cjs <baseUrl> <outDir> # explicit dir\n' +
      'Then compare with verifyScreens.cjs (defaults to Stage 1b; --stage0 for v3).\n'
    );
    process.exit(2);
  }
}

const TABS = ['Home', 'Simulator', 'Upcoming', 'ROI', 'Statistics', 'Explore', 'Info'];
const VIEWPORTS = [
  { label: '375w', width: 375, height: 812, dsf: 2, mobile: true },
  { label: '1440w', width: 1440, height: 900, dsf: 1, mobile: false },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
  });

  const manifest = [];
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dsf,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 120000 });
    await new Promise((r) => setTimeout(r, 2500));

    for (const tab of TABS) {
      const clicked = await page.evaluate((label) => {
        const btn = [...document.querySelectorAll('button')].find(
          (b) => (b.textContent || '').trim() === label
        );
        if (!btn) return false;
        btn.click();
        return true;
      }, tab);
      await new Promise((r) => setTimeout(r, 1200));

      const file = `${vp.label}__${tab.toLowerCase()}.png`;
      await page.screenshot({
        path: path.join(OUT, file),
        fullPage: true,
        optimizeForSpeed: false,
      });
      const bytes = fs.statSync(path.join(OUT, file)).size;
      manifest.push({ viewport: vp.label, tab, file, clicked, bytes });
      console.log(`${clicked ? 'ok  ' : 'MISS'} ${file} ${(bytes / 1024).toFixed(0)}KB`);
    }
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(
    path.join(OUT, 'manifest.json'),
    JSON.stringify(
      { capturedAt: new Date().toISOString(), baseUrl: BASE, tabs: TABS, viewports: VIEWPORTS, shots: manifest },
      null,
      2
    )
  );
  const total = manifest.reduce((a, m) => a + m.bytes, 0);
  console.log(`\n${manifest.length} screenshots, ${(total / 1048576).toFixed(1)}MB total -> ${OUT}`);
  console.log('Compare against the Stage 0 reference:');
  console.log('  node src/__dev__/verifyScreens.cjs --candidate "' + OUT + '"');
})();
