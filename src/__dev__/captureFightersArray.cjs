// Foundation Stage 3 commit 5 -- full assembled-FIGHTERS comparison. DEV ONLY.
//
//   NODE_PATH=/tmp/pptr/node_modules \
//   node src/__dev__/captureFightersArray.cjs <baseUrl> <outFile.json>
//
// fighters.golden.json covers only the ~38 fighters chosen for matchup goldens.
// The FIGHTERS extraction changes module evaluation order for the whole 2,273-
// entry collection, so it needs a comparison over ALL of it.
//
// Captures under the SAME frozen reference clock as captureGoldens.cjs, encodes
// with the harness's encodeSpecials so -0 and friends survive JSON, and emits a
// per-fighter hash plus per-field hashes. Any byte change anywhere moves a hash
// and the comparator reports the exact fighter and field.
//
// Output is a TEMPORARY artifact. It is never added to baseline/.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const puppeteer = require('puppeteer-core');

const CHROME = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = path.join(__dirname, '..', '..');
const BASE = process.argv[2] || 'http://localhost:3001';
const OUT = process.argv[3] || '/tmp/fighters-array.json';

const refIso = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'baseline', 'REFERENCE_HASHES.json'), 'utf8')
).reference.captureIso;

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: 'new', args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  await page.evaluateOnNewDocument((fixedMs) => {
    const RealDate = Date;
    function FrozenDate(...a) {
      if (!(this instanceof FrozenDate)) return new RealDate(fixedMs).toString();
      return a.length === 0 ? new RealDate(fixedMs) : new RealDate(...a);
    }
    FrozenDate.prototype = RealDate.prototype;
    Object.setPrototypeOf(FrozenDate, RealDate);
    FrozenDate.now = () => fixedMs;
    FrozenDate.parse = RealDate.parse;
    FrozenDate.UTC = RealDate.UTC;
    window.Date = FrozenDate;
  }, new Date(refIso).getTime());

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(
    () => !!window.__fmGoldens && !!window.__FM_GOLDEN_INTERNALS__, { timeout: 120000 }
  );

  // THE DECISIVE ARTIFACT is `canonical`: stableStringify(encodeSpecials(FIGHTERS))
  // over the COMPLETE ordered array. SHA-256 is taken over that string in Node.
  //
  // The per-fighter/per-field djb2 hashes below are for MISMATCH DIAGNOSIS ONLY.
  // Hashing a summary of hashes would not prove value equality -- djb2 is a
  // non-cryptographic 32-bit hash and an inner collision would hide a real
  // difference. So the gate is SHA-256 over the actual encoded values.
  const payload = await page.evaluate(() => {
    const saved = { log: console.log, assert: console.assert, warn: console.warn };
    console.log = () => {}; console.assert = () => {}; console.warn = () => {};
    try {
      const { FIGHTERS } = window.__FM_GOLDEN_INTERNALS__;
      const { stableStringify, hash, encodeSpecials } = window.__fmGoldens;
      const canonical = stableStringify(encodeSpecials(FIGHTERS));
      const perFighter = FIGHTERS.map((f) => {
        const enc = encodeSpecials(f);
        const fields = {};
        for (const k of Object.keys(enc).sort()) fields[k] = hash(stableStringify(enc[k]));
        return { name: f.FIGHTER, h: hash(stableStringify(enc)), fields };
      });
      return {
        length: FIGHTERS.length,
        canonical,
        identityHash: hash(stableStringify(FIGHTERS.map((f) => f.FIGHTER))),
        perFighter,
      };
    } finally { Object.assign(console, saved); }
  });

  await browser.close();

  const canonPath = OUT.replace(/\.json$/, '') + '.canonical.txt';
  fs.writeFileSync(canonPath, payload.canonical);
  const sha = crypto.createHash('sha256').update(payload.canonical, 'utf8').digest('hex');

  const diag = { length: payload.length, identityHash: payload.identityHash, perFighter: payload.perFighter };
  fs.writeFileSync(OUT, JSON.stringify(diag));

  console.log('clock        : FROZEN to ' + refIso);
  console.log('fighters     : ' + payload.length);
  console.log('identityHash : ' + payload.identityHash + '   (diagnostic)');
  console.log('');
  console.log('CANONICAL SERIALISATION -- stableStringify(encodeSpecials(FIGHTERS))');
  console.log('  bytes      : ' + Buffer.byteLength(payload.canonical, 'utf8'));
  console.log('  sha256     : ' + sha);
  console.log('  file       : ' + canonPath);
  console.log('diagnostics  : ' + OUT);
})();
