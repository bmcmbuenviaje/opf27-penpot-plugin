// Bundles plugin.js + pages.js into <version>/ for GitHub Pages.
// Penpot's installer needs a URL ending in manifest.json and Pages caches ~10 min,
// so every change ships under a new folder: node build.mjs v7
import fs from 'node:fs';

const v = process.argv[2];
if (!/^v\d+$/.test(v || '')) { console.error('usage: node build.mjs v<N>'); process.exit(1); }
const base = 'https://bmcmbuenviaje.github.io/opf27-penpot-plugin/' + v;
fs.mkdirSync(v, { recursive: true });
const code = `const VERSION = '${v}';\n` + fs.readFileSync('plugin.js', 'utf8') + '\n' + fs.readFileSync('ds.js', 'utf8') + '\n' + fs.readFileSync('pages.js', 'utf8');
fs.writeFileSync(`${v}/plugin.js`, code);
fs.copyFileSync('ui.html', `${v}/ui.html`);
const manifest = {
  name: 'OPF27 Wireframe Builder',
  description: 'Builds OPF 2027 lo-fi wireframes (sitemap, home and all inner pages) as native Penpot layers.',
  code: `${base}/plugin.js`,
  permissions: ['content:read', 'content:write'],
};
fs.writeFileSync(`${v}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('built', v, '→ install', `${base}/manifest.json`);
