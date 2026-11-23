// Tiny static server with CORS so Penpot (design.penpot.app) can load the plugin from localhost.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const types = { '.json': 'application/json', '.js': 'text/javascript', '.html': 'text/html' };
const port = Number(process.env.PORT || 4400);

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  // Chrome Private/Local Network Access: allow https://design.penpot.app to reach localhost.
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const name = path.basename(decodeURIComponent(new URL(req.url, 'http://x').pathname)) || 'ui.html';
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Penpot plugin server on http://localhost:${port}/manifest.json`));
