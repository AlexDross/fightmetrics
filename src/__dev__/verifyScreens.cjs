// Foundation -- visual baseline integrity. DEV ONLY.
//
//   node src/__dev__/verifyScreens.cjs                            reference self-check (Stage 1b)
//   node src/__dev__/verifyScreens.cjs --candidate <dir> --pixel   compare a capture
//   node src/__dev__/verifyScreens.cjs --stage0 ...                use the historical v3 reference
//   node src/__dev__/verifyScreens.cjs --write [--stage0]          (re)write a manifest
//
// TWO REFERENCES, BOTH COMMITTED, NEITHER OVERWRITABLE:
//
//   stage1b (DEFAULT)  baseline/screenshots-stage1b/  Vite + Tailwind v4.
//                      The reference for Stage 2 onward.
//   stage0  (--stage0) baseline/screenshots-stage0/   CRA + Tailwind v3 Play CDN.
//                      Kept permanently as the historical v3 record. Stage 1b
//                      differs from it by a uniform OKLCH palette shift
//                      (~99% of pixels, mean delta ~1.3/255), so it is NOT a
//                      useful gate for v4 builds -- only for archaeology.
//
// Identical checksums mean pixel-identical.
//
// --pixel adds a measured tolerance, which one screen requires:
// MEASURED (Stage 1a) -- the Statistics tab is NOT deterministically
// renderable. Six consecutive captures of the SAME build at 1440w differed from
// the first by 26, 24, 24, 0 and 47 pixels, page height constant at 2791. The
// charts do not settle to a fixed frame.
//
// Rule: dimensions must match EXACTLY (any change is a layout regression), and
// the UNROUNDED differing-pixel ratio must stay under PIXEL_TOLERANCE_PCT.
// Requires NODE_PATH=/tmp/pptr/node_modules for puppeteer-core.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PIXEL_TOLERANCE_PCT = 0.01; // 1 pixel in 10,000

// The tolerance applies to THESE SCREENS ONLY. Every other screen must be
// checksum-identical -- a blanket tolerance would quietly absorb a real
// regression on a screen that is perfectly deterministic today, and a tolerance
// wide enough to cover the v3->v4 OKLCH shift would hide almost anything.
const PIXEL_TOLERANCE_SCREENS = new Set([
  '1440w__statistics.png',
  '375w__statistics.png',
]);

const ROOT = path.join(__dirname, '..', '..');

const REFERENCES = {
  stage1b: {
    key: 'stage1b',
    dir: path.join(ROOT, 'baseline', 'screenshots-stage1b'),
    manifest: path.join(ROOT, 'baseline', 'screenshots-stage1b.sha256.json'),
    label: 'Stage 1b — Vite + Tailwind v4 (DEFAULT)',
  },
  stage0: {
    key: 'stage0',
    dir: path.join(ROOT, 'baseline', 'screenshots-stage0'),
    manifest: path.join(ROOT, 'baseline', 'screenshots-stage0.sha256.json'),
    label: 'Stage 0 — CRA + Tailwind v3 Play CDN (historical)',
  },
};

const argv = process.argv.slice(2);
const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const REF = argv.includes('--stage0') ? REFERENCES.stage0 : REFERENCES.stage1b;
const usePixel = argv.includes('--pixel');
const candDir = arg('--candidate');

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

if (argv.includes('--write')) {
  const shots = shotsIn(REF.dir);
  if (!Object.keys(shots).length) {
    console.error('refusing to write an empty manifest -- ' + REF.dir + ' has no PNGs');
    process.exit(2);
  }
  const payload = {
    note: 'SHA-256 of each committed screenshot for ' + REF.label + '. Stage 1b is ' +
          'the default reference for later stages; Stage 0 is retained for historical ' +
          'v3 comparison only and differs from v4 by a uniform OKLCH palette shift.',
    reference: REF.key,
    generatedAt: new Date().toISOString(),
    directory: path.relative(ROOT, REF.dir),
    pixelTolerancePct: PIXEL_TOLERANCE_PCT,
    pixelToleranceScreens: [...PIXEL_TOLERANCE_SCREENS],
    count: Object.keys(shots).length,
    totalBytes: Object.values(shots).reduce((a, s) => a + s.bytes, 0),
    shots,
  };
  fs.writeFileSync(REF.manifest, JSON.stringify(payload, null, 2));
  console.log('wrote ' + REF.manifest + '  (' + payload.count + ' shots, ' +
              (payload.totalBytes / 1048576).toFixed(1) + 'MB)');
  process.exit(0);
}

if (!fs.existsSync(REF.manifest)) {
  console.error('no manifest at ' + REF.manifest + ' -- run with --write' +
                (REF.key === 'stage0' ? ' --stage0' : ''));
  process.exit(2);
}
const m = JSON.parse(fs.readFileSync(REF.manifest, 'utf8'));
const actual = shotsIn(candDir || REF.dir);

console.log('reference : ' + REF.label);
console.log('            ' + path.relative(ROOT, REF.dir));
console.log(candDir ? 'candidate : ' + candDir : 'mode      : reference self-check');
console.log('');

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
    // UNROUNDED ratio. Rounding before comparison could let a value just over
    // tolerance format down to look compliant.
    return { sizeMismatch: false, width: a.width, height: a.height,
             differingPixels: n, ratioPct: (100 * n) / (a.width * a.height) };
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

    if (!tolerated) {
      fail++;
      let detail = '(' + m.shots[name].bytes + ' -> ' + a.bytes + ' bytes)';
      if (usePixel) {
        const d = await pixelDiff(path.join(REF.dir, name), path.join(candDir || REF.dir, name));
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

    const d = await pixelDiff(path.join(REF.dir, name), path.join(candDir || REF.dir, name));
    if (d.sizeMismatch) {
      fail++;
      console.log('FAIL      ' + name + '  DIMENSIONS CHANGED ' + JSON.stringify(d.a) +
                  ' -> ' + JSON.stringify(d.b) + '  (layout regression)');
    } else if (d.ratioPct <= PIXEL_TOLERANCE_PCT) {
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

  const extra = Object.keys(actual).filter((n) => !(n in m.shots));
  extra.forEach((n) => { fail++; console.log('FAIL      ' + n + '  UNEXPECTED (not in the reference manifest)'); });

  console.log('\nidentical=' + same + '  within-tolerance=' + within +
              '  fail=' + fail + '  absent=' + absent + '  unexpected=' + extra.length);
  console.log('tolerance applies only to: ' + [...PIXEL_TOLERANCE_SCREENS].join(', '));
  process.exit(fail + absent === 0 ? 0 : 1);
})();
