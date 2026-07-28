// Foundation Stage 0 -- visual baseline integrity. DEV ONLY.
//
//   node src/__dev__/verifyScreens.cjs                      # reference self-check
//   node src/__dev__/verifyScreens.cjs --candidate <dir>    # compare a later capture
//   node src/__dev__/verifyScreens.cjs --write              # (re)write the manifest
//
// The Stage 0 screenshots are COMMITTED at baseline/screenshots-stage0/ and
// checksummed here. An ignored directory that later captures overwrite is not a
// durable baseline, so candidates are written elsewhere and compared to this.
//
// Identical checksums mean pixel-identical. DIFFERING checksums are expected in
// Stage 1b (Tailwind v4 changes rendering) and must be triaged visually.
//
// --pixel adds a measured tolerance, which some screens require:
// MEASURED (Stage 1a) -- the Statistics tab is NOT deterministically
// renderable. Six consecutive captures of the SAME build at 1440w differed from
// the first by 26, 24, 24, 0 and 47 pixels (page height constant at 2791). The
// charts do not settle to a fixed frame. Checksum equality is therefore the
// wrong instrument for it, while a real styling regression moves thousands of
// pixels or changes page height.
//
// Rule: dimensions must match EXACTLY (any change is a layout regression), and
// differing pixels must stay under PIXEL_TOLERANCE_PCT of the image.
// Requires NODE_PATH=/tmp/pptr/node_modules for puppeteer-core.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PIXEL_TOLERANCE_PCT = 0.01; // 1 pixel in 10,000

// The tolerance applies to THESE SCREENS ONLY. Every other screen must be
// checksum-identical -- a blanket tolerance would quietly absorb a real
// regression on a screen that is perfectly deterministic today (all 12 others
// were pixel-exact across the CRA -> Vite migration, including 1440w__roi.png
// at 1440x3894).
const PIXEL_TOLERANCE_SCREENS = new Set([
  '1440w__statistics.png',
  '375w__statistics.png',
]);

const ROOT = path.join(__dirname, '..', '..');
const REF_DIR = path.join(ROOT, 'baseline', 'screenshots-stage0');
const MANIFEST = path.join(ROOT, 'baseline', 'screenshots-stage0.sha256.json');

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

function shotsIn(dir) {
  if (!fs.existsSync(dir)) return {};
  const out = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort()) {
    const p = path.join(dir, f);
    out[f] = { sha256: sha(p), bytes: fs.statSync(p).size };
  }
  return out;
}

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };

if (argv.includes('--write')) {
  const shots = shotsIn(REF_DIR);
  const payload = {
    note: 'SHA-256 of each committed Stage 0 screenshot. Stage 1a expects visual ' +
          'parity (checksums should match). Stage 1b expects differences, which must ' +
          'be triaged individually against Tailwind v4 breaking changes.',
    generatedAt: new Date().toISOString(),
    directory: 'baseline/screenshots-stage0',
    count: Object.keys(shots).length,
    totalBytes: Object.values(shots).reduce((a, s) => a + s.bytes, 0),
    shots,
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(payload, null, 2));
  console.log('wrote ' + MANIFEST + '  (' + payload.count + ' shots, ' +
              (payload.totalBytes / 1048576).toFixed(1) + 'MB)');
  process.exit(0);
}

if (!fs.existsSync(MANIFEST)) {
  console.error('no manifest at ' + MANIFEST + ' -- run with --write');
  process.exit(2);
}
const m = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const candDir = arg('--candidate');
const actual = shotsIn(candDir || REF_DIR);

console.log((candDir ? 'candidate: ' + candDir : 'reference self-check: ' + REF_DIR) + '\n');

const usePixel = argv.includes('--pixel');

async function pixelDiff(aPath, bPath) {
  const puppeteer = require('puppeteer-core');
  const CHROME = process.env.CHROME_PATH ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const url = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  const r = await page.evaluate(async (aU, bU) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = s; });
    const [a, b] = await Promise.all([load(aU), load(bU)]);
    if (a.width !== b.width || a.height !== b.height) {
      return { sizeMismatch: true, a: [a.width, a.height], b: [b.width, b.height] };
    }
    const g = (im) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      c.getContext('2d').drawImage(im, 0, 0); return c.getContext('2d').getImageData(0, 0, im.width, im.height).data; };
    const d1 = g(a), d2 = g(b);
    let n = 0;
    for (let i = 0; i < d1.length; i += 4) {
      if (d1[i] !== d2[i] || d1[i + 1] !== d2[i + 1] || d1[i + 2] !== d2[i + 2]) n++;
    }
    const total = a.width * a.height;
    // Return the UNROUNDED ratio. Rounding before the comparison could let a
    // value just over tolerance format down to look compliant.
    return { sizeMismatch: false, width: a.width, height: a.height, differingPixels: n,
             totalPixels: total, ratioPct: (100 * n) / total };
  }, url(aPath), url(bPath));
  await browser.close();
  return r;
}

(async () => {
  let same = 0, within = 0, fail = 0, absent = 0;
  for (const name of Object.keys(m.shots)) {
    const a = actual[name];
    if (!a) { absent++; console.log('ABSENT    ' + name); continue; }
    if (a.sha256 === m.shots[name].sha256) { same++; console.log('IDENTICAL ' + name); continue; }

    const tolerated = PIXEL_TOLERANCE_SCREENS.has(name);

    // Any screen outside the tolerance set must be checksum-identical. Measure
    // it anyway when --pixel is on, purely as diagnostics, but it still fails.
    if (!tolerated) {
      fail++;
      let detail = '(' + m.shots[name].bytes + ' -> ' + a.bytes + ' bytes)';
      if (usePixel) {
        const d = await pixelDiff(path.join(REF_DIR, name), path.join(candDir || REF_DIR, name));
        detail = d.sizeMismatch
          ? 'DIMENSIONS CHANGED ' + JSON.stringify(d.a) + ' -> ' + JSON.stringify(d.b)
          : d.differingPixels + ' px (' + d.ratioPct.toFixed(4) + '%) of ' + d.width + 'x' + d.height;
      }
      console.log('FAIL      ' + name + '  ' + detail + '  [no tolerance for this screen]');
      continue;
    }

    if (!usePixel) {
      fail++;
      console.log('DIFFERS   ' + name + '  (' + m.shots[name].bytes + ' -> ' + a.bytes +
                  ' bytes)  [rerun with --pixel to measure against tolerance]');
      continue;
    }

    const d = await pixelDiff(path.join(REF_DIR, name), path.join(candDir || REF_DIR, name));
    if (d.sizeMismatch) {
      fail++;
      console.log('FAIL      ' + name + '  DIMENSIONS CHANGED ' + JSON.stringify(d.a) +
                  ' -> ' + JSON.stringify(d.b) + '  (layout regression)');
    } else if (d.ratioPct <= PIXEL_TOLERANCE_PCT) {
      // Unrounded comparison above; formatted only for display.
      within++;
      console.log('WITHIN    ' + name + '  ' + d.differingPixels + ' px (' +
                  d.ratioPct.toFixed(4) + '%) of ' + d.width + 'x' + d.height +
                  '  <= ' + PIXEL_TOLERANCE_PCT + '% tolerance');
    } else {
      fail++;
      console.log('FAIL      ' + name + '  ' + d.differingPixels + ' px (' +
                  d.ratioPct.toFixed(4) + '%) EXCEEDS ' + PIXEL_TOLERANCE_PCT + '% tolerance');
    }
  }

  // An unexpected screenshot means the capture set drifted from the reference
  // set -- a renamed tab, a new screen, a stale file. That is a failure, not a note.
  const extra = Object.keys(actual).filter((n) => !(n in m.shots));
  extra.forEach((n) => { fail++; console.log('FAIL      ' + n + '  UNEXPECTED (not in the reference manifest)'); });

  console.log('\nidentical=' + same + '  within-tolerance=' + within +
              '  fail=' + fail + '  absent=' + absent + '  unexpected=' + extra.length);
  console.log('tolerance applies only to: ' + [...PIXEL_TOLERANCE_SCREENS].join(', '));
  process.exit(fail + absent === 0 ? 0 : 1);
})();
