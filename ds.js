// ===================== DESIGN SYSTEM =====================
// Creates Penpot library assets (colours, typographies, components) + documentation boards.
// Run it in its own file ("OPF27 Design System"), then publish that file as a shared library.

const DISPLAY = 'Archivo Black'; // stand-in for Akira Expanded (licensed font — upload to team fonts)
const BODY = 'Montserrat';

const DS = {
  brand: [
    ['Isekai Blue', '#0031DB', 'Primary. Buttons, links, key headings, hero.'],
    ['Pop Yellow', '#FCFD40', 'Highlights on blue or night only. Never text on white.'],
    ['Sakura Pink', '#FC3D92', 'Accent fills, badges, large text. Not for small white text.'],
    ['Portal Cyan', '#22B7FD', 'Accent fills, venue colour. Use dark text on it.'],
  ],
  access: [
    ['Sakura Deep', '#D6246F', 'Pink for buttons and small text with white (4.8:1).'],
    ['Cyan Deep', '#0077B6', 'Cyan for text and links on white (4.9:1).'],
  ],
  neutral: [
    ['Ink', '#242224', 'Body text'], ['Night', '#07103F', 'Dark sections, footer'], ['Muted', '#5B5A63', 'Secondary text'],
    ['Line', '#D6D8E0', 'Borders, dividers'], ['Mist 2', '#E6EAF8', 'Hover, alt rows'], ['Mist', '#F2F4FB', 'Section backgrounds'], ['White', '#FFFFFF', 'Page background'],
  ],
  feedback: [['Error', '#C81E3A', 'Form errors'], ['Success', '#1A7F4B', 'Confirmations'], ['Warning', '#B45309', 'Notices']],
};
const K = {}; [...DS.brand, ...DS.access, ...DS.neutral, ...DS.feedback].forEach(c => { K[c[0]] = c[1]; });

const TYPE = [ // name, family, weight, size, lineHeight, letterSpacing, upper, mobile size, use
  ['Display 1', DISPLAY, 400, 80, 1.05, 0, true, 44, 'Hero title'],
  ['Display 2', DISPLAY, 400, 56, 1.1, 0, true, 34, 'Page hero title'],
  ['Heading 1', DISPLAY, 400, 44, 1.15, 0, true, 28, 'Section title'],
  ['Heading 2', DISPLAY, 400, 32, 1.2, 0, true, 24, 'Sub-section'],
  ['Heading 3', BODY, 800, 24, 1.3, 0, false, 20, 'Card title (large)'],
  ['Heading 4', BODY, 700, 18, 1.35, 0, false, 16, 'Card title'],
  ['Body L', BODY, 400, 18, 1.55, 0, false, 16, 'Intros, article body'],
  ['Body', BODY, 400, 16, 1.5, 0, false, 15, 'Default text'],
  ['Small', BODY, 500, 14, 1.45, 0, false, 14, 'Meta, table text'],
  ['Caption', BODY, 500, 12, 1.4, 0, false, 12, 'Dates, footnotes'],
  ['Label', BODY, 800, 14, 1.2, 0.5, true, 14, 'Buttons, chips, tags'],
];

function lum(h) { const c = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function verdict(r) { return r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large only' : 'Fail'; }

// ---------- library assets (idempotent: reuse by name) ----------
function libColor(path, name, hex) {
  const lib = penpot.library.local;
  let c = (lib.colors || []).find(x => x.name === name && x.path === path);
  if (!c) { c = lib.createColor(); c.name = name; c.path = path; }
  c.color = hex; c.opacity = 1;
  return c;
}

function pickVariant(f, weight) {
  const vs = f.variants.filter(v => v.fontStyle === 'normal');
  return vs.find(v => String(v.fontWeight) === String(weight)) || vs[0] || f.variants[0];
}

function libTypo(t) {
  const lib = penpot.library.local;
  let ty = (lib.typographies || []).find(x => x.name === t[0] && x.path === 'OPF');
  if (!ty) { ty = lib.createTypography(); ty.name = t[0]; ty.path = 'OPF'; }
  try { const f = penpot.fonts.findByName(t[1]); if (f) ty.setFont(f, pickVariant(f, t[2])); } catch (e) {}
  ty.fontSize = String(t[3]); ty.lineHeight = String(t[4]); ty.letterSpacing = String(t[5]);
  ty.textTransform = t[6] ? 'uppercase' : 'none';
  return ty;
}

// component = a small board turned into a main component
function COMP(S, x, y, w, h, path, name, draw, bg) {
  const b = penpot.createBoard();
  S.b.appendChild(b);
  b.name = name; b.resize(w, h); b.x = S.b.x + x; b.y = S.b.y + y;
  b.fills = bg ? fill(bg) : [];
  const CS = { b, W: w, pad: 0, cw: w, m: false, q: [] };
  draw(CS, w, h);
  flush(CS);
  try { const lc = penpot.library.local.createComponent([b]); lc.name = name; lc.path = path; } catch (e) { console.error('component failed', path, name, e); }
  return h;
}

// ---------- doc-board helpers ----------
function dsBoard(name, x, bg) {
  const b = penpot.createBoard();
  b.name = name; b.resize(1440, 1000); b.x = x; b.y = 0; b.fills = fill(bg || '#FFFFFF');
  return { b, W: 1440, pad: 120, cw: 1200, m: false, q: [] };
}
function dsEnd(S, h) { S.b.resize(1440, h); flush(S); return S.b; }
function dsTitle(S, kicker, title, intro) {
  T(S, S.pad, 96, 800, kicker, { font: BODY, weight: 800, size: 14, ls: 1, upper: true, color: K['Isekai Blue'] });
  T(S, S.pad, 126, 1200, title, { font: DISPLAY, size: 56, upper: true, color: K.Night });
  T(S, S.pad, 206, 820, intro, { font: BODY, size: 18, lh: 1.5, color: K.Muted });
  return 300;
}
function dsH(S, y, label, sub) {
  T(S, S.pad, y, 1200, label, { font: DISPLAY, size: 28, upper: true, color: K.Night });
  if (sub) T(S, S.pad, y + 44, 1000, sub, { font: BODY, size: 15, color: K.Muted });
  R(S, S.pad, y + (sub ? 80 : 50), 1200, 1, K.Line, { name: 'Rule' });
  return y + (sub ? 112 : 82);
}
function bodyT(S, x, y, w, s, o = {}) { return T(S, x, y, w, s, Object.assign({ font: BODY, size: 15, color: K.Ink, lh: 1.5 }, o)); }

// ---------- boards ----------
function dsCover(x) {
  const S = dsBoard('DS — 00 Cover', x, K.Night);
  // halftone dots (demo motif)
  for (let r = 0; r < 10; r++) for (let c = 0; c < 16; c++) {
    const d = Math.max(2, 14 - Math.hypot(r - 0, c - 15) * 1.1);
    if (d > 2) R(S, 840 + c * 36, 40 + r * 36, d, d, K['Isekai Blue'], { name: 'Halftone dot', ellipse: true });
  }
  T(S, 120, 260, 1000, 'OTAKU POP FES 2027', { font: BODY, weight: 800, size: 18, ls: 2, color: K['Pop Yellow'] });
  T(S, 120, 300, 1200, 'DESIGN SYSTEM', { font: DISPLAY, size: 96, color: K.White, lh: 1 });
  T(S, 120, 440, 900, 'v0.1 · Foundations and core components for the OPF 2027 website. Built from the concept demo (mineski-stephen.github.io/opf-webdemo).', { font: BODY, size: 20, lh: 1.5, color: '#C9CCE0' });
  const sw = [K['Isekai Blue'], K['Pop Yellow'], K['Sakura Pink'], K['Portal Cyan'], K.White];
  sw.forEach((c, i) => R(S, 120 + i * 132, 560, 120, 120, c, { name: 'Brand swatch', r: 16 }));
  const toc = ['01 Colour', '02 Typography', '03 Spacing, radius, grid & elevation', '04 Components', '05 Patterns'];
  toc.forEach((t, i) => T(S, 120 + (i % 3) * 400, 740 + Math.floor(i / 3) * 40, 380, t, { font: BODY, weight: 700, size: 18, color: K.White }));
  R(S, 120, 860, 1200, 96, '#14205A', { name: 'Font note', r: 12 });
  T(S, 148, 880, 1150, 'Display font: Akira Expanded (from the demo) is a licensed font. Upload it to Penpot team fonts and swap the Display/Heading 1–2 text styles; this file uses Archivo Black as a free stand-in. Body font: Montserrat (Google Fonts).', { font: BODY, size: 15, lh: 1.45, color: '#C9CCE0' });
  return dsEnd(S, 1040);
}

function dsColour(x) {
  const S = dsBoard('DS — 01 Colour', x);
  let y = dsTitle(S, 'Foundations', 'Colour', 'Brand colours from the concept demo, plus two deeper shades added so that text on pink and cyan passes WCAG AA. All colours are in the shared library under OPF/…');
  const group = (label, sub, list, path) => {
    y = dsH(S, y, label, sub);
    y = grid(S, y, list.length, 4, 1, (gx, gy, w, i) => {
      const [name, hex, role] = list[i];
      libColor(path, name, hex);
      R(S, gx, gy, w, 150, hex, { name: 'Swatch ' + name, r: 16, stroke: hex === '#FFFFFF' ? K.Line : null });
      const onW = contrast('#FFFFFF', hex), onI = contrast(K.Night, hex);
      const best = onW >= onI ? ['#FFFFFF', 'white', onW] : [K.Night, 'night', onI];
      T(S, gx + 20, gy + 108, w - 40, 'Aa ' + best[1] + ' ' + best[2].toFixed(1) + ':1', { font: BODY, weight: 700, size: 13, color: best[0] });
      T(S, gx, gy + 166, w, name, { font: BODY, weight: 800, size: 17, color: K.Ink });
      T(S, gx, gy + 192, w, hex + '  ·  OPF/' + path + '/' + name, { font: BODY, size: 13, color: K.Muted });
      bodyT(S, gx, gy + 214, w, role, { size: 13, color: K.Muted });
      return 270;
    }) + 64;
  };
  group('Brand', 'The four colours of the OPF 2027 identity.', DS.brand, 'Brand');
  group('Accessible companions', 'Use these instead of Sakura Pink / Portal Cyan whenever small text sits on or in the colour.', DS.access, 'Brand');
  group('Neutrals', null, DS.neutral, 'Neutral');
  group('Feedback', null, DS.feedback, 'Feedback');

  y = dsH(S, y, 'Contrast pairs', 'WCAG 2.2: AA needs 4.5:1 for body text and 3:1 for large text (24px+, or 19px+ bold).');
  const pairs = [['White', 'Isekai Blue'], ['Pop Yellow', 'Isekai Blue'], ['White', 'Sakura Pink'], ['White', 'Sakura Deep'], ['Night', 'Sakura Pink'], ['White', 'Portal Cyan'], ['Night', 'Portal Cyan'], ['Cyan Deep', 'White'], ['Ink', 'Pop Yellow'], ['Pop Yellow', 'White'], ['Muted', 'Mist'], ['Pop Yellow', 'Night']];
  y = grid(S, y, pairs.length, 4, 1, (gx, gy, w, i) => {
    const [f, b] = pairs[i], r = contrast(K[f], K[b]), v = verdict(r);
    R(S, gx, gy, w, 110, K[b], { name: 'Pair ' + f + ' on ' + b, r: 12, stroke: K[b] === '#FFFFFF' ? K.Line : null });
    T(S, gx + 20, gy + 22, w - 40, 'Buy tickets', { font: BODY, weight: 800, size: 20, color: K[f] });
    T(S, gx + 20, gy + 60, w - 40, f + ' on ' + b, { font: BODY, size: 12, color: K[f] });
    const ok = v === 'Fail' ? K.Error : v === 'AA large only' ? K.Warning : K.Success;
    R(S, gx, gy + 120, w, 32, ok, { name: 'Verdict', r: 16 });
    T(S, gx, gy + 127, w, r.toFixed(2) + ':1  ·  ' + v, { font: BODY, weight: 700, size: 13, color: '#FFFFFF', align: 'center' });
    return 152;
  }) + 64;
  y = dsH(S, y, 'Rules', null);
  ['Buttons with white text use Isekai Blue or Sakura Deep — never Sakura Pink or Portal Cyan.', 'Pop Yellow is a highlight on Isekai Blue or Night. It is never text on white (1.1:1).', 'Portal Cyan and Sakura Pink carry dark (Night) text, or no text at all.', 'Links on white use Isekai Blue or Cyan Deep, always underlined in body text.'].forEach(r => { y += bodyT(S, S.pad, y, 1000, '•  ' + r, { size: 16 }) + 10; });
  return dsEnd(S, y + 120);
}

function dsTypography(x) {
  const S = dsBoard('DS — 02 Typography', x);
  let y = dsTitle(S, 'Foundations', 'Typography', 'Two families: an expanded display face for the loud, uppercase anime-poster feel, and Montserrat for everything people read. Each style below is a shared text style under OPF/…');
  y = dsH(S, y, 'Families', null);
  R(S, 120, y, 588, 220, K.Night, { name: 'Display family', r: 16 });
  T(S, 148, y + 28, 540, 'Aa', { font: DISPLAY, size: 96, color: K['Pop Yellow'] });
  T(S, 148, y + 150, 540, 'Display — Akira Expanded (stand-in: Archivo Black)', { font: BODY, weight: 700, size: 14, color: K.White });
  R(S, 732, y, 588, 220, K.Mist, { name: 'Body family', r: 16 });
  T(S, 760, y + 28, 540, 'Aa', { font: BODY, weight: 800, size: 96, color: K['Isekai Blue'] });
  T(S, 760, y + 150, 540, 'Body — Montserrat 400 / 500 / 700 / 800', { font: BODY, weight: 700, size: 14, color: K.Ink });
  y += 284;
  y = dsH(S, y, 'Type scale', 'Desktop size shown; the mobile size is in the right column.');
  TYPE.forEach(t => {
    const ty = libTypo(t);
    const sample = t[6] ? (t[3] >= 56 ? 'OPF 2027' : t[3] >= 44 ? 'Get Isekaied' : 'Three worlds') : (t[3] >= 18 ? 'Anime, games, cosplay and live music' : 'Doors open at 10:00 · June 5–6, 2027');
    T(S, 120, y + 6, 200, t[0], { font: BODY, weight: 800, size: 14, color: K['Isekai Blue'] });
    T(S, 120, y + 28, 200, t[8], { font: BODY, size: 12, color: K.Muted });
    const h = Math.max(60, Math.ceil(t[3] * t[4]) + 16);
    T(S, 340, y, 760, sample, { typo: ty, color: K.Ink });
    T(S, 1120, y + 6, 200, t[3] + ' / ' + Math.round(t[3] * t[4]) + (t[5] ? ' · +' + t[5] : ''), { font: BODY, size: 13, color: K.Muted });
    T(S, 1120, y + 26, 200, 'Mobile ' + t[7], { font: BODY, size: 13, color: K.Muted });
    y += h + 20;
    R(S, 120, y - 10, 1200, 1, K.Line, { name: 'Rule' });
  });
  y += 40;
  y = dsH(S, y, 'Rules', null);
  ['Display styles are always uppercase; keep them to 1–2 lines.', 'Body text is never smaller than 14px on mobile.', 'Line length for reading: 60–80 characters (about 760px at Body L).', 'Japanese titles (IP names) fall back to Noto Sans JP.'].forEach(r => { y += bodyT(S, S.pad, y, 1000, '•  ' + r, { size: 16 }) + 10; });
  return dsEnd(S, y + 120);
}

function dsSpacing(x) {
  const S = dsBoard('DS — 03 Spacing, radius, grid & elevation', x);
  let y = dsTitle(S, 'Foundations', 'Space & shape', 'A 4-point spacing scale, a small set of corner radii, a 12-column desktop grid and two shadow levels.');
  y = dsH(S, y, 'Spacing scale', 'Token name → px. Section padding: 96 desktop / 48 mobile.');
  [4, 8, 12, 16, 24, 32, 48, 64, 96].forEach((v, i) => {
    T(S, 120, y + 4, 120, 'space-' + (i + 1), { font: BODY, weight: 700, size: 14 });
    T(S, 250, y + 4, 60, v + 'px', { font: BODY, size: 14, color: K.Muted });
    R(S, 330, y, v * 4, 24, K['Isekai Blue'], { name: 'Space ' + v, r: 4 });
    y += 36;
  });
  y += 40;
  y = dsH(S, y, 'Corner radius', null);
  [['radius-xs', 4, 'Tags'], ['radius-sm', 8, 'Inputs, logos'], ['radius-md', 12, 'Cards'], ['radius-lg', 16, 'Large cards, panels'], ['radius-xl', 20, 'Banners'], ['radius-pill', 999, 'Buttons, chips']].forEach((r, i) => {
    const gx = 120 + i * 200;
    R(S, gx, y, 160, 120, K.Mist, { name: r[0], r: Math.min(r[1], 60), stroke: K['Isekai Blue'], sw: 2 });
    T(S, gx, y + 136, 160, r[0] + ' · ' + (r[1] === 999 ? 'pill' : r[1] + 'px'), { font: BODY, weight: 700, size: 13 });
    T(S, gx, y + 158, 160, r[2], { font: BODY, size: 12, color: K.Muted });
  });
  y += 220;
  y = dsH(S, y, 'Layout grid', 'Desktop 1440: 12 columns in a 1200 container, 24 gutter. Mobile 375: 4 columns, 16 margins, 16 gutter.');
  R(S, 120, y, 1200, 200, K.Mist, { name: 'Desktop grid frame', r: 8 });
  for (let c = 0; c < 12; c++) R(S, 120 + c * (78 + 24), y, 78, 200, '#FCE1EE', { name: 'Column', r: 2 });
  T(S, 120, y + 210, 600, 'Desktop: 12 × 78 columns, 24 gutter, 120 margins', { font: BODY, size: 13, color: K.Muted });
  y += 260;
  R(S, 120, y, 375, 200, K.Mist, { name: 'Mobile grid frame', r: 8 });
  for (let c = 0; c < 4; c++) R(S, 136 + c * (73.75 + 16), y, 73.75, 200, '#FCE1EE', { name: 'Column', r: 2 });
  T(S, 120, y + 210, 600, 'Mobile: 4 × 74 columns, 16 gutter, 16 margins', { font: BODY, size: 13, color: K.Muted });
  y += 280;
  y = dsH(S, y, 'Elevation', null);
  [['shadow-0', null, 'Flat — default cards with a Line border'], ['shadow-1', [4, 16, 0.08], 'Raised — hover cards, sticky header'], ['shadow-2', [12, 40, 0.16], 'Floating — menus, modals, estimate panel']].forEach((e, i) => {
    const gx = 120 + i * 400;
    R(S, gx, y, 340, 160, K.White, { name: e[0], r: 16, stroke: e[1] ? null : K.Line, shadow: e[1] });
    T(S, gx + 24, y + 24, 300, e[0], { font: BODY, weight: 800, size: 16 });
    bodyT(S, gx + 24, y + 54, 290, e[2], { size: 14, color: K.Muted });
  });
  return dsEnd(S, y + 300);
}

function dsComponents(x) {
  const S = dsBoard('DS — 04 Components', x);
  let y = dsTitle(S, 'Library', 'Components', 'Main components live on this board. Drag them from Assets → Components → OPF/… into the hi-fi pages; edit here to update every copy.');
  const label = (gx, gy, s) => T(S, gx, gy, 300, s, { font: BODY, weight: 700, size: 12, color: K.Muted });

  // Buttons
  y = dsH(S, y, 'Buttons', 'Large 48px for main CTAs, Small 40px in cards and headers. Labels: Label style, uppercase.');
  const btns = [['Primary', K['Isekai Blue'], '#FFFFFF', null], ['Accent', K['Sakura Deep'], '#FFFFFF', null], ['Secondary', null, K.Ink, K.Ink], ['Disabled', K.Line, K.Muted, null]];
  btns.forEach((b, i) => {
    const gx = 120 + i * 300;
    label(gx, y, b[0] + ' / Large');
    COMP(S, gx, y + 22, 220, 48, 'OPF/Button/' + b[0], 'Large', (C2, w, h) => { R(C2, 0, 0, w, h, b[1], { name: 'Bg', r: h / 2, stroke: b[3], sw: 2 }); T(C2, 0, 15, w, 'BUY TICKETS', { font: BODY, weight: 800, size: 14, ls: 0.5, color: b[2], align: 'center', name: 'Label' }); });
    label(gx, y + 92, b[0] + ' / Small');
    COMP(S, gx, y + 114, 160, 40, 'OPF/Button/' + b[0], 'Small', (C2, w, h) => { R(C2, 0, 0, w, h, b[1], { name: 'Bg', r: h / 2, stroke: b[3], sw: 2 }); T(C2, 0, 12, w, 'BUY', { font: BODY, weight: 800, size: 13, ls: 0.5, color: b[2], align: 'center', name: 'Label' }); });
  });
  y += 190;
  R(S, 120, y, 1200, 120, K.Night, { name: 'Dark panel', r: 16 });
  [['On dark', '#FFFFFF', K['Isekai Blue'], null], ['Ghost on dark', null, '#FFFFFF', '#FFFFFF']].forEach((b, i) => {
    const gx = 160 + i * 300;
    T(S, gx, y + 16, 260, b[0] + ' / Large', { font: BODY, weight: 700, size: 12, color: '#C9CCE0' });
    COMP(S, gx, y + 40, 220, 48, 'OPF/Button/' + b[0], 'Large', (C2, w, h) => { R(C2, 0, 0, w, h, b[1], { name: 'Bg', r: h / 2, stroke: b[3], sw: 2 }); T(C2, 0, 15, w, "SEE WHAT'S ON", { font: BODY, weight: 800, size: 14, ls: 0.5, color: b[2], align: 'center', name: 'Label' }); });
  });
  y += 184;

  // Chips & badges
  y = dsH(S, y, 'Chips & badges', null);
  [['Chip', 'Default', K.White, K.Ink, K.Line, 'Anime', 120], ['Chip', 'Active', K.Ink, K.White, null, 'All', 120]].forEach((c, i) => {
    const gx = 120 + i * 180; label(gx, y, c[0] + ' / ' + c[1]);
    COMP(S, gx, y + 22, c[6], 36, 'OPF/' + c[0], c[1], (C2, w, h) => { R(C2, 0, 0, w, h, c[2], { name: 'Bg', r: 18, stroke: c[4] }); T(C2, 0, 9, w, c[5], { font: BODY, weight: 700, size: 13, color: c[3], align: 'center', name: 'Label' }); });
  });
  [['New', K['Sakura Deep'], 'NEW', 52], ['Popular', K['Sakura Deep'], 'MOST POPULAR', 124], ['Category', K.Ink, 'LINEUP', 84], ['Sold out', K.Muted, 'SOLD OUT', 96], ['Highlight', K['Pop Yellow'], 'EARLY BIRD', 104]].forEach((b, i) => {
    const gx = 520 + i * 160; label(gx, y, 'Badge / ' + b[0]);
    COMP(S, gx, y + 26, b[3], 24, 'OPF/Badge', b[0], (C2, w, h) => { R(C2, 0, 0, w, h, b[1], { name: 'Bg', r: 12 }); T(C2, 0, 5, w, b[2], { font: BODY, weight: 800, size: 11, ls: 0.5, color: b[0] === 'Highlight' ? K.Night : '#FFFFFF', align: 'center', name: 'Label' }); });
  });
  y += 120;

  // Form controls
  y = dsH(S, y, 'Form controls', 'Labels always visible above the field. Errors in text, not colour alone.');
  [['Default', K.Muted, 1, 'Full name', null], ['Focus', K['Isekai Blue'], 2, 'Brian', null], ['Error', K.Error, 2, 'name@', 'Enter a valid email address']].forEach((f, i) => {
    const gx = 120 + i * 400; label(gx, y, 'Input / ' + f[0]);
    COMP(S, gx, y + 22, 360, f[4] ? 108 : 84, 'OPF/Input', f[0], (C2, w) => {
      T(C2, 0, 0, w, 'Email address *', { font: BODY, weight: 700, size: 13, name: 'Field label' });
      R(C2, 0, 24, w, 48, K.White, { name: 'Field', r: 8, stroke: f[1], sw: f[2] });
      T(C2, 16, 38, w - 32, f[3], { font: BODY, size: 15, color: f[0] === 'Default' ? K.Muted : K.Ink, name: 'Value' });
      if (f[4]) T(C2, 0, 82, w, '⚠ ' + f[4], { font: BODY, weight: 600, size: 13, color: K.Error, name: 'Error text' });
    });
  });
  y += 160;
  label(120, y, 'Select');
  COMP(S, 120, y + 22, 360, 84, 'OPF/Input', 'Select', (C2, w) => { T(C2, 0, 0, w, 'Booth type *', { font: BODY, weight: 700, size: 13, name: 'Field label' }); R(C2, 0, 24, w, 48, K.White, { name: 'Field', r: 8, stroke: K.Muted }); T(C2, 16, 38, w - 60, 'Merchant booth', { font: BODY, size: 15, name: 'Value' }); T(C2, w - 36, 36, 20, '▾', { font: BODY, size: 16, name: 'Chevron' }); });
  [['Checkbox', 'Off', false], ['Checkbox', 'On', true], ['Radio', 'Off', false], ['Radio', 'On', true]].forEach((c, i) => {
    const gx = 520 + i * 200; label(gx, y, c[0] + ' / ' + c[1]);
    COMP(S, gx, y + 30, 180, 24, 'OPF/' + c[0], c[1], (C2) => {
      const round = c[0] === 'Radio';
      R(C2, 0, 0, 24, 24, c[2] && !round ? K['Isekai Blue'] : K.White, { name: 'Box', r: round ? 12 : 6, stroke: c[2] ? K['Isekai Blue'] : K.Muted, sw: 2 });
      if (c[2] && round) R(C2, 6, 6, 12, 12, K['Isekai Blue'], { name: 'Dot', ellipse: true });
      if (c[2] && !round) T(C2, 0, 3, 24, '✓', { font: BODY, weight: 800, size: 14, color: K.White, align: 'center', name: 'Tick' });
      T(C2, 36, 2, 140, 'I agree', { font: BODY, size: 15, name: 'Label' });
    });
  });
  y += 150;

  // Cards
  y = dsH(S, y, 'Cards', null);
  label(120, y, 'Card / IP booth');
  COMP(S, 120, y + 22, 276, 360, 'OPF/Card', 'IP booth', (C2, w) => {
    R(C2, 0, 0, w, 360, K.White, { name: 'Bg', r: 12, stroke: K.Line });
    R(C2, 0, 0, w, 207, K.Mist, { name: 'Key art', r: 12 }); T(C2, 0, 94, w, 'KEY ART', { font: BODY, weight: 700, size: 12, color: K.Muted, align: 'center' });
    T(C2, 16, 223, w - 32, 'IP TITLE', { font: BODY, weight: 800, size: 18, name: 'Title' });
    T(C2, 16, 251, w - 32, 'Booth A01 · Crystal Pavilion', { font: BODY, size: 13, color: K.Muted, name: 'Meta' });
    R(C2, 16, 290, w - 32, 32, K.Mist, { name: 'Benefit', r: 16 }); T(C2, 28, 298, w - 56, 'Visitor benefit: sticker', { font: BODY, weight: 600, size: 12, name: 'Benefit text' });
  });
  label(436, y, 'Card / News');
  COMP(S, 436, y + 22, 380, 360, 'OPF/Card', 'News', (C2, w) => {
    R(C2, 0, 0, w, 214, K.Mist, { name: 'Image', r: 12 }); T(C2, 0, 98, w, 'NEWS IMAGE', { font: BODY, weight: 700, size: 12, color: K.Muted, align: 'center' });
    R(C2, 0, 232, 80, 24, K.Ink, { name: 'Category', r: 12 }); T(C2, 0, 237, 80, 'LINEUP', { font: BODY, weight: 800, size: 11, color: K.White, align: 'center' });
    T(C2, 92, 236, 200, 'Oct 22, 2026', { font: BODY, size: 13, color: K.Muted, name: 'Date' });
    T(C2, 0, 272, w, 'First Music Live headliner announced for OPF 2027', { font: BODY, weight: 800, size: 20, lh: 1.3, name: 'Headline' });
  });
  label(856, y, 'Card / Pass');
  COMP(S, 856, y + 22, 380, 360, 'OPF/Card', 'Pass', (C2, w, h) => {
    R(C2, 0, 0, w, h, K.White, { name: 'Bg', r: 16, stroke: K.Line, shadow: [4, 16, 0.08] });
    T(C2, 28, 28, w - 56, '2-DAY EVENT', { font: BODY, weight: 800, size: 16, name: 'Name' });
    T(C2, 28, 58, w - 56, '₱1,300', { font: DISPLAY, size: 40, color: K['Isekai Blue'], name: 'Price' });
    ['Entry both days', 'All 3 halls', 'Stamp rally'].forEach((p, k) => T(C2, 28, 138 + k * 30, w - 56, '✓  ' + p, { font: BODY, size: 15, name: 'Benefit' }));
    R(C2, 28, h - 76, w - 56, 48, K['Isekai Blue'], { name: 'Button', r: 24 }); T(C2, 28, h - 61, w - 56, 'BUY', { font: BODY, weight: 800, size: 14, color: K.White, align: 'center' });
  });
  y += 420;
  label(120, y, 'Card / Artist');
  COMP(S, 120, y + 22, 380, 400, 'OPF/Card', 'Artist', (C2, w, h) => {
    R(C2, 0, 0, w, h, K.Night, { name: 'Bg', r: 16 });
    R(C2, 0, 0, w, 290, '#14205A', { name: 'Photo', r: 16 }); T(C2, 0, 136, w, 'ARTIST PHOTO', { font: BODY, weight: 700, size: 12, color: '#8B90B5', align: 'center' });
    T(C2, 24, 308, w - 48, 'ARTIST NAME', { font: DISPLAY, size: 24, color: K.White, name: 'Name' });
    T(C2, 24, 348, w - 48, 'Day 1 · Sat, June 5', { font: BODY, weight: 600, size: 14, color: K['Sakura Pink'], name: 'Day' });
  });
  label(540, y, 'Timetable / Event block');
  [['Crystal Pavilion', '#DCE4FF', K['Isekai Blue']], ['Grand Ballroom', '#FFE0EE', K['Sakura Deep']], ['Cove Manila', '#D7F1FF', K['Cyan Deep']]].forEach((v, i) => {
    COMP(S, 540 + i * 260, y + 22, 240, 120, 'OPF/Timetable', v[0], (C2, w, h) => {
      R(C2, 0, 0, w, h, v[1], { name: 'Bg', r: 10 }); R(C2, 0, 0, 6, h, v[2], { name: 'Venue bar', r: 3 });
      T(C2, 20, 16, w - 36, 'Cosplay Cup prelims', { font: BODY, weight: 800, size: 15, name: 'Title' });
      T(C2, 20, 42, w - 36, '13:00–15:00', { font: BODY, size: 13, color: K.Muted, name: 'Time' });
      T(C2, 20, 84, w - 36, v[0], { font: BODY, weight: 700, size: 12, color: v[2], name: 'Venue' });
    });
  });
  label(540, y + 170, 'Accordion / Closed · Open');
  COMP(S, 540, y + 192, 760, 64, 'OPF/Accordion', 'Closed', (C2, w, h) => { R(C2, 0, 0, w, h, K.White, { name: 'Bg', r: 12, stroke: K.Line }); T(C2, 24, 20, w - 90, 'What time do doors open?', { font: BODY, weight: 700, size: 17, name: 'Question' }); T(C2, w - 52, 16, 28, '+', { font: BODY, weight: 700, size: 22, align: 'center', name: 'Icon' }); });
  COMP(S, 540, y + 272, 760, 120, 'OPF/Accordion', 'Open', (C2, w, h) => { R(C2, 0, 0, w, h, K.White, { name: 'Bg', r: 12, stroke: K['Isekai Blue'], sw: 2 }); T(C2, 24, 20, w - 90, 'What time do doors open?', { font: BODY, weight: 700, size: 17, name: 'Question' }); T(C2, w - 52, 16, 28, '–', { font: BODY, weight: 700, size: 22, align: 'center', name: 'Icon' }); T(C2, 24, 60, w - 48, 'Doors open at 10:00 both days. Music Live doors open at 17:00.', { font: BODY, size: 15, color: K.Muted, name: 'Answer' }); });
  y += 480;

  // Navigation & bands
  y = dsH(S, y, 'Navigation & bands', null);
  label(120, y, 'Header / Mobile');
  COMP(S, 120, y + 22, 375, 64, 'OPF/Header', 'Mobile', (C2, w, h) => {
    R(C2, 0, 0, w, h, K.White, { name: 'Bg' }); R(C2, 0, h - 1, w, 1, K.Line, { name: 'Divider' });
    R(C2, 16, 12, 96, 40, K['Isekai Blue'], { name: 'Logo', r: 6 }); T(C2, 16, 23, 96, 'OPF', { font: DISPLAY, size: 16, color: K.White, align: 'center' });
    R(C2, w - 188, 12, 120, 40, K['Sakura Deep'], { name: 'CTA', r: 20 }); T(C2, w - 188, 24, 120, 'TICKETS', { font: BODY, weight: 800, size: 13, color: K.White, align: 'center' });
    R(C2, w - 56, 12, 40, 40, K.White, { name: 'Menu', r: 8, stroke: K.Ink }); T(C2, w - 56, 21, 40, '☰', { font: BODY, size: 16, align: 'center' });
  });
  label(540, y, 'Annotation / Note (wireframes only)');
  COMP(S, 540, y + 22, 360, 64, 'OPF/Annotation', 'Note', (C2, w, h) => { R(C2, 0, 0, w, h, '#FEF08A', { name: 'Bg', r: 4 }); T(C2, 12, 10, w - 24, 'Note for the client goes here.', { font: BODY, size: 13, color: '#713F12', name: 'Text' }); });
  y += 130;
  label(120, y, 'Header / Desktop');
  COMP(S, 120, y + 22, 1200, 80, 'OPF/Header', 'Desktop', (C2, w, h) => {
    R(C2, 0, 0, w, h, K.White, { name: 'Bg' }); R(C2, 0, h - 1, w, 1, K.Line, { name: 'Divider' });
    R(C2, 0, 20, 140, 40, K['Isekai Blue'], { name: 'Logo', r: 6 }); T(C2, 0, 31, 140, 'OPF 2027', { font: DISPLAY, size: 16, color: K.White, align: 'center' });
    ['Event ▾', 'Tickets', 'News', 'Visit ▾', 'Join Us', 'Sponsors'].forEach((n, i) => T(C2, 190 + i * 100, 30, 95, n, { font: BODY, weight: 700, size: 15, name: 'Nav ' + n }));
    R(C2, 190 + 4 * 100 + 62, 22, 36, 18, K['Sakura Deep'], { name: 'NEW', r: 9 }); T(C2, 190 + 4 * 100 + 62, 24, 36, 'NEW', { font: BODY, weight: 800, size: 9, color: K.White, align: 'center' });
    T(C2, w - 290, 30, 70, 'EN | JP', { font: BODY, weight: 700, size: 14, color: K.Muted });
    R(C2, w - 180, 16, 180, 48, K['Isekai Blue'], { name: 'CTA', r: 24 }); T(C2, w - 180, 31, 180, 'BUY TICKETS', { font: BODY, weight: 800, size: 14, color: K.White, align: 'center' });
  });
  y += 140;
  label(120, y, 'Band / Ticket CTA');
  COMP(S, 120, y + 22, 1200, 160, 'OPF/Band', 'Ticket CTA', (C2, w, h) => {
    R(C2, 0, 0, w, h, K['Isekai Blue'], { name: 'Bg', r: 20 });
    T(C2, 32, 36, 760, 'GET YOUR PASS — FROM ₱800', { font: DISPLAY, size: 32, color: K.White, name: 'Title' });
    T(C2, 32, 92, 760, '1-Day, 2-Day, Music Live and VIP passes. Prices exclude VAT.', { font: BODY, size: 15, color: '#DCE4FF', name: 'Sub' });
    R(C2, w - 252, 56, 220, 48, K['Pop Yellow'], { name: 'Button', r: 24 }); T(C2, w - 252, 71, 220, 'BUY TICKETS', { font: BODY, weight: 800, size: 14, color: K.Night, align: 'center' });
  });
  y += 240;
  return dsEnd(S, y + 80);
}

function dsPatterns(x) {
  const S = dsBoard('DS — 05 Patterns', x);
  let y = dsTitle(S, 'Brand', 'Patterns', 'Graphic devices carried over from the concept demo. Use one per section at most.');
  y = dsH(S, y, 'Ghost section title', 'Large outlined word behind the real heading — used once per page section.');
  T(S, 120, y, 1200, 'TICKETS', { font: DISPLAY, size: 140, outline: K.Line, name: 'Ghost word' });
  T(S, 120, y + 60, 800, 'GET YOUR PASS', { font: DISPLAY, size: 44, color: K.Night });
  y += 240;
  y = dsH(S, y, 'Halftone frame', 'Dot gradient in a corner of hero and CTA panels.');
  R(S, 120, y, 1200, 280, K['Isekai Blue'], { name: 'Halftone panel', r: 20 });
  for (let r = 0; r < 7; r++) for (let c = 0; c < 18; c++) {
    const d = Math.max(0, 16 - Math.hypot(r, 17 - c) * 1.3);
    if (d > 2) R(S, 640 + c * 36 + (16 - d) / 2, y + 16 + r * 36 + (16 - d) / 2, d, d, '#2E5BFF', { name: 'Dot', ellipse: true });
  }
  T(S, 160, y + 100, 600, 'BOOTH APPLICATIONS ARE OPEN', { font: DISPLAY, size: 32, color: K.White });
  y += 340;
  y = dsH(S, y, 'Venue colour coding', 'Each hall keeps one colour across maps, timetables and badges.');
  [['DISCOVER', 'Crystal Pavilion', K['Isekai Blue'], '#FFFFFF'], ['CONNECT', 'Grand Ballroom', K['Sakura Deep'], '#FFFFFF'], ['CELEBRATE', 'Cove Manila', K['Portal Cyan'], K.Night]].forEach((v, i) => {
    const gx = 120 + i * 408;
    R(S, gx, y, 384, 160, v[2], { name: 'Venue ' + v[1], r: 16 });
    T(S, gx + 28, y + 36, 330, v[0], { font: DISPLAY, size: 32, color: v[3] });
    T(S, gx + 28, y + 92, 330, v[1], { font: BODY, weight: 700, size: 16, color: v[3] });
  });
  y += 220;
  y = dsH(S, y, 'Mascots — the O-Trio', 'Otori, Popi and Fumi guide visitors (artwork from the client).');
  ['Otori', 'Popi', 'Fumi'].forEach((m, i) => {
    R(S, 120 + i * 220, y, 180, 180, K.Mist, { name: 'Mascot ' + m, ellipse: true });
    T(S, 120 + i * 220, y + 196, 180, m.toUpperCase(), { font: DISPLAY, size: 18, color: K.Night, align: 'center' });
  });
  return dsEnd(S, y + 340);
}

function buildDesignSystem() {
  (penpot.currentPage.root.children || []).slice().forEach(s => { if (s.name.startsWith('DS — ')) s.remove(); });
  const out = [];
  let x = 0;
  [dsCover, dsColour, dsTypography, dsSpacing, dsComponents, dsPatterns].forEach(fn => { const b = fn(x); out.push(b); x += 1600; });
  return out;
}
