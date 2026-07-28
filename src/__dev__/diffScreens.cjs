// Foundation -- pixel diff between two screenshots. DEV ONLY.
//   NODE_PATH=/tmp/pptr/node_modules node src/__dev__/diffScreens.cjs <a.png> <b.png>
//
// Checksum inequality only says "not identical". This says HOW different, which
// is what distinguishes a real visual regression from render nondeterminism.
// Decodes both PNGs in headless Chrome (no image dependencies needed).
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [aPath, bPath] = process.argv.slice(2);
if (!aPath || !bPath) { console.error('usage: diffScreens.cjs <a.png> <b.png>'); process.exit(2); }

const toDataUrl = (p) =>
  'data:image/png;base64,' + fs.readFileSync(path.resolve(p)).toString('base64');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const result = await page.evaluate(async (aUrl, bUrl) => {
    const load = (src) => new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
    });
    const [a, b] = await Promise.all([load(aUrl), load(bUrl)]);
    if (a.width !== b.width || a.height !== b.height) {
      return { sizeMismatch: true, a: [a.width, a.height], b: [b.width, b.height] };
    }
    const c1 = document.createElement('canvas'); c1.width = a.width; c1.height = a.height;
    const c2 = document.createElement('canvas'); c2.width = b.width; c2.height = b.height;
    c1.getContext('2d').drawImage(a, 0, 0);
    c2.getContext('2d').drawImage(b, 0, 0);
    const d1 = c1.getContext('2d').getImageData(0, 0, a.width, a.height).data;
    const d2 = c2.getContext('2d').getImageData(0, 0, b.width, b.height).data;

    let differing = 0, maxDelta = 0, sumDelta = 0;
    const rows = new Map();
    for (let i = 0; i < d1.length; i += 4) {
      const dr = Math.abs(d1[i] - d2[i]);
      const dg = Math.abs(d1[i + 1] - d2[i + 1]);
      const db = Math.abs(d1[i + 2] - d2[i + 2]);
      const d = Math.max(dr, dg, db);
      if (d > 0) {
        differing++; sumDelta += d;
        if (d > maxDelta) maxDelta = d;
        const y = Math.floor((i / 4) / a.width);
        rows.set(y, (rows.get(y) || 0) + 1);
      }
    }
    const total = a.width * a.height;
    const bands = [...rows.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6)
      .map(([y, n]) => ({ y, pixels: n }));
    return {
      width: a.width, height: a.height, totalPixels: total,
      differingPixels: differing,
      percentDiffering: +(100 * differing / total).toFixed(4),
      maxChannelDelta: maxDelta,
      meanDeltaOverDiffering: differing ? +(sumDelta / differing).toFixed(2) : 0,
      rowsAffected: rows.size,
      worstRows: bands,
    };
  }, toDataUrl(aPath), toDataUrl(bPath));

  console.log(path.basename(aPath) + '  vs  ' + path.basename(bPath));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
