// Foundation Stage 0 -- local fixture receiver. DEV ONLY, run by hand.
// Chrome blocks multi-file Blob downloads, so the harness POSTs fixtures here
// and this writes them straight into baseline/fixtures/.
//   node src/__dev__/fixtureReceiver.cjs
// Removed together with the harness in Stage 4.
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', '..', 'baseline', 'fixtures');
fs.mkdirSync(OUT, { recursive: true });

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST') { res.writeHead(405); return res.end('POST only'); }

  const name = path.basename(decodeURIComponent(req.url.slice(1)));
  if (!/^[\w.\-]+\.json$/.test(name)) { res.writeHead(400); return res.end('bad name'); }

  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const buf = Buffer.concat(chunks);
    fs.writeFileSync(path.join(OUT, name), buf);
    console.log('wrote', name, buf.length, 'bytes');
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, name, bytes: buf.length }));
  });
}).listen(4599, () => console.log('fixture receiver on http://localhost:4599 ->', OUT));
