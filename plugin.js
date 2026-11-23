// OPF27 Wireframe Builder — Penpot plugin.
// Builds lo-fi wireframes as native, editable Penpot layers (boards, rectangles, text).

// Runs once on load: builds Sitemap, Home desktop and Home mobile side by side on the current page.

const C = {
  white: '#FFFFFF', alt: '#F4F4F5', ph: '#D4D4D8', phDark: '#A1A1AA', line: '#D4D4D8',
  ink: '#27272A', muted: '#71717A', night: '#18181B', night2: '#27272A',
  accent: '#0031DB', pink: '#FC3D92', note: '#FEF08A', noteInk: '#713F12',
};

// ---------- primitives (x/y are relative to S.b) ----------
function fill(c) { return c ? [{ fillColor: c, fillOpacity: 1 }] : []; }

function R(S, x, y, w, h, color, o = {}) {
  S.q.push(() => mkRect(S, x, y, w, h, color, o));
}
function mkRect(S, x, y, w, h, color, o) {
  const r = penpot.createRectangle();
  S.b.appendChild(r);
  r.name = o.name || 'Box';
  r.resize(Math.max(1, w), Math.max(1, h));
  r.x = S.b.x + x; r.y = S.b.y + y;
  r.fills = fill(color);
  if (o.stroke) r.strokes = [{ strokeColor: o.stroke, strokeWidth: o.sw || 1, strokeAlignment: 'inner', strokeStyle: o.dash ? 'dashed' : 'solid', strokeOpacity: 1 }];
  if (o.r) r.borderRadius = o.r;
  if (o.ellipse) r.borderRadius = Math.min(w, h) / 2;
  return r;
}

function estH(str, size, w) {
  const perLine = Math.max(1, Math.floor(w / (size * 0.56)));
  const lines = str.split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(l.length / perLine)), 0);
  return Math.ceil(lines * size * 1.3);
}

function T(S, x, y, w, str, o = {}) {
  S.q.push(() => mkText(S, x, y, w, str, o));
  return estH(str, o.size || 16, w);
}
function mkText(S, x, y, w, str, o) {
  const t = penpot.createText(str);
  if (!t) return 0;
  S.b.appendChild(t);
  t.name = o.name || str.replace(/\n/g, ' ').slice(0, 40);
  t.fontSize = String(o.size || 16);
  t.fontWeight = String(o.weight || 400);
  t.fills = fill(o.color || C.ink);
  if (o.upper) t.textTransform = 'uppercase';
  if (o.align) t.align = o.align;
  const h = estH(str, o.size || 16, w);
  t.resize(w, h);
  t.growType = 'auto-height';
  t.x = S.b.x + x; t.y = S.b.y + y;
  return h;
}

function IMG(S, x, y, w, h, label, o = {}) {
  R(S, x, y, w, h, o.color || C.ph, { name: 'Image: ' + label, r: o.r });
  const lw = Math.min(w - 16, 420);
  T(S, x + (w - lw) / 2, y + h / 2 - 10, lw, label, { size: 13, color: o.ink || C.muted, align: 'center', weight: 600 });
}

function BTN(S, x, y, w, label, kind = 'primary', h = 48) {
  const styles = {
    primary: [C.accent, C.white, null],
    pink: [C.pink, C.white, null],
    white: [C.white, C.accent, null],
    ghost: [null, C.ink, C.ink],
    ghostLight: [null, C.white, C.white],
  }[kind];
  R(S, x, y, w, h, styles[0], { name: 'Button: ' + label, r: h / 2, stroke: styles[2], sw: 2 });
  T(S, x, y + h / 2 - 9, w, label, { size: 14, weight: 700, color: styles[1], align: 'center' });
  return h;
}

function NOTE(S, x, y, w, str) {
  const h = estH(str, 13, w - 24) + 20;
  R(S, x, y, w, h, C.note, { name: 'Note', r: 4 });
  T(S, x + 12, y + 10, w - 24, str, { size: 13, color: C.noteInk });
  return h;
}

function TAG(S, label) {
  const w = Math.min(S.W - 16, label.length * 7.5 + 24);
  R(S, 8, 8, w, 24, C.pink, { name: 'Section tag', r: 4 });
  T(S, 8, 12, w, label, { size: 11, weight: 700, color: C.white, align: 'center' });
}

function H2(S, y, title, sub, dark) {
  const size = S.m ? 28 : 44;
  y += T(S, S.pad, y, S.cw, title, { size, weight: 800, upper: true, color: dark ? C.white : C.ink }) + 8;
  if (sub) y += T(S, S.pad, y, S.cw, sub, { size: S.m ? 15 : 18, color: dark ? C.phDark : C.muted }) + 8;
  return y + (S.m ? 16 : 24);
}

function LINK(S, x, y, str, dark) {
  return T(S, x, y, 400, str, { size: 15, weight: 700, color: dark ? C.white : C.accent });
}

// columns inside the content area
function cols(S, n, nMobile) {
  const k = S.m ? (nMobile || 1) : n;
  const gap = S.m ? 16 : 24;
  const w = (S.cw - gap * (k - 1)) / k;
  return { k, gap, w };
}

// lays out "count" items in a grid; fn(x, y, w, i) returns item height
function grid(S, y, count, n, nMobile, fn) {
  const { k, gap, w } = cols(S, n, nMobile);
  let rowY = y, rowH = 0;
  for (let i = 0; i < count; i++) {
    const c = i % k;
    if (c === 0 && i > 0) { rowY += rowH + gap; rowH = 0; }
    rowH = Math.max(rowH, fn(S.pad + c * (w + gap), rowY, w, i));
  }
  return rowY + rowH;
}

// Penpot inserts each new child BELOW existing ones, so create in reverse order:
// the last thing drawn (labels, tags) ends up on top.
function flush(S) { const q = S.q; S.q = []; for (let i = q.length - 1; i >= 0; i--) q[i](); }

// ---------- page / section scaffolding ----------
function pageBoard(name, x, y, W) {
  const b = penpot.createBoard();
  b.name = name;
  b.resize(W, 1000);
  b.x = x; b.y = y;
  b.fills = fill(C.white);
  return b;
}

function section(ctx, name, bg, build) {
  const b = penpot.createBoard();
  ctx.root.appendChild(b);
  b.name = name;
  b.resize(ctx.W, 3000);
  b.x = ctx.root.x; b.y = ctx.root.y + ctx.y;
  b.fills = fill(bg);
  const S = { b, W: ctx.W, pad: ctx.pad, cw: ctx.cw, m: ctx.m, q: [] };
  const h = Math.ceil(build(S));
  b.resize(ctx.W, h);
  if (ctx.tags !== false) TAG(S, name);
  flush(S);
  ctx.y += h;
}

function newCtx(name, x, mobile) {
  const W = mobile ? 375 : 1440;
  const root = pageBoard(name, x, 0, W);
  return { root, W, m: mobile, pad: mobile ? 16 : 120, cw: mobile ? 343 : 1200, y: 0 };
}

function finish(ctx) { ctx.root.resize(ctx.W, ctx.y); }

// ---------- HOME ----------
function buildHome(x, mobile) {
  const ctx = newCtx(mobile ? 'Home — Mobile 375' : 'Home — Desktop 1440', x, mobile);
  const V = mobile ? 48 : 96; // vertical section padding

  section(ctx, '00 Header (sticky)', C.white, S => {
    const h = S.m ? 64 : 80;
    R(S, S.pad, (h - 40) / 2, S.m ? 96 : 140, 40, C.ph, { name: 'Logo', r: 4 });
    T(S, S.pad, h / 2 - 8, S.m ? 96 : 140, 'OPF LOGO', { size: 12, weight: 700, color: C.muted, align: 'center' });
    if (S.m) {
      BTN(S, S.W - 16 - 40 - 12 - 120, 12, 120, 'BUY TICKETS', 'primary', 40);
      R(S, S.W - 16 - 40, 12, 40, 40, null, { name: 'Menu (hamburger)', stroke: C.ink, r: 8 });
      T(S, S.W - 16 - 40, 22, 40, '☰', { size: 16, align: 'center' });
    } else {
      const nav = ['Event ▾', 'Tickets', 'News', 'Visit ▾', 'Join Us', 'Sponsors'];
      let nx = 320;
      nav.forEach(n => { T(S, nx, 30, 110, n, { size: 15, weight: 600 }); nx += n.length * 9 + 40; });
      R(S, 320 + 'Event ▾TicketsNewsVisit ▾'.length * 9 + 160 + 62, 22, 36, 18, C.pink, { name: 'NEW badge', r: 9 });
      T(S, 320 + 'Event ▾TicketsNewsVisit ▾'.length * 9 + 160 + 62, 24, 36, 'NEW', { size: 10, weight: 700, color: C.white, align: 'center' });
      T(S, S.W - S.pad - 170 - 200, 30, 70, 'EN | JP', { size: 14, weight: 600, color: C.muted });
      [0, 1, 2].forEach(i => R(S, S.W - S.pad - 170 - 120 + i * 36, 28, 24, 24, C.ph, { name: 'Social icon', ellipse: true }));
      BTN(S, S.W - S.pad - 170, 16, 170, 'BUY TICKETS');
    }
    R(S, 0, h - 1, S.W, 1, C.line, { name: 'Divider' });
    return h;
  });

  section(ctx, '01 Hero', C.white, S => {
    const h = S.m ? 600 : 680;
    IMG(S, 0, 0, S.W, h, '', { color: C.phDark });
    T(S, S.m ? 16 : S.W - 520, S.m ? 60 : 80, S.m ? 343 : 400, 'KEY VISUAL — "Get Isekaied" artwork\n(optional subtle animation)', { size: 13, weight: 600, color: C.white, align: S.m ? 'left' : 'right' });
    let y = S.m ? 150 : 190;
    y += T(S, S.pad, y, S.cw, 'JUNE 5–6, 2027 · OKADA MANILA', { size: S.m ? 15 : 20, weight: 700, color: C.white }) + 12;
    y += T(S, S.pad, y, S.m ? S.cw : 760, 'OTAKU POP FES 2027', { size: S.m ? 44 : 80, weight: 900, color: C.white }) + 16;
    y += T(S, S.pad, y, S.m ? S.cw : 600, 'Get Isekaied — three worlds of anime, games, cosplay and live music.', { size: S.m ? 16 : 20, color: C.white }) + 28;
    if (S.m) {
      BTN(S, S.pad, y, S.cw, 'BUY TICKETS', 'pink');
      BTN(S, S.pad, y + 60, S.cw, "SEE WHAT'S ON", 'ghostLight');
    } else {
      BTN(S, S.pad, y, 220, 'BUY TICKETS', 'pink');
      BTN(S, S.pad + 240, y, 220, "SEE WHAT'S ON", 'ghostLight');
      // countdown
      const cx = S.W - S.pad - 4 * 100 + 12;
      ['DAYS', 'HRS', 'MIN', 'SEC'].forEach((l, i) => {
        R(S, cx + i * 100, y - 40, 88, 88, C.white, { name: 'Countdown ' + l, r: 12 });
        T(S, cx + i * 100, y - 26, 88, '00', { size: 32, weight: 800, align: 'center' });
        T(S, cx + i * 100, y + 22, 88, l, { size: 11, weight: 700, color: C.muted, align: 'center' });
      });
    }
    NOTE(S, S.pad, h - (S.m ? 110 : 76), S.m ? S.cw : 760, 'Hero CTA changes by site phase: Announce → "Get updates" + "Apply for a booth" · On sale → "Buy tickets" + countdown · Event week → "Today\'s schedule" + "Map" · Post-event → "See the highlights"');
    return h;
  });

  section(ctx, '02 Quick facts', C.alt, S => {
    const facts = [['JUNE 5–6', 'Sat & Sun, 2027'], ['10:00–22:00', 'Event hours'], ['OKADA MANILA', '3 halls · Parañaque'], ['30,000+', 'Fans expected']];
    const end = grid(S, S.m ? 32 : 48, 4, 4, 2, (x, y, w, i) => {
      T(S, x, y, w, facts[i][0], { size: S.m ? 20 : 30, weight: 800 });
      T(S, x, y + (S.m ? 30 : 42), w, facts[i][1], { size: 14, color: C.muted });
      return 64;
    });
    return end + (S.m ? 32 : 48);
  });

  section(ctx, '03 Concept — 3 Worlds', C.white, S => {
    let y = H2(S, V, '3 Worlds', 'One pass, three halls — each one a different isekai.');
    const zones = [['DISCOVER', 'Crystal Pavilion', 'IP booths, exhibits, screenings'], ['CONNECT', 'Grand Ballroom', 'Community stage, cosplay, artist alley'], ['CELEBRATE', 'Cove Manila', 'Music Live and night events']];
    y = grid(S, y, 3, 3, 1, (x, yy, w, i) => {
      IMG(S, x, yy, w, S.m ? 180 : 240, 'Zone art', { r: 12 });
      let t = yy + (S.m ? 196 : 260);
      t += T(S, x, t, w, zones[i][0], { size: 24, weight: 800 }) + 4;
      t += T(S, x, t, w, zones[i][1], { size: 15, weight: 700, color: C.accent }) + 4;
      t += T(S, x, t, w, zones[i][2], { size: 15, color: C.muted });
      return t - yy;
    }) + 40;
    R(S, S.pad, y, S.cw, S.m ? 150 : 120, C.alt, { name: 'Mascot strip', r: 12 });
    [0, 1, 2].forEach(i => R(S, S.pad + 24 + i * (S.m ? 56 : 84), y + 24, S.m ? 48 : 72, S.m ? 48 : 72, C.ph, { name: 'Mascot', ellipse: true }));
    T(S, S.m ? S.pad + 24 : S.pad + 300, S.m ? y + 88 : y + 36, S.m ? S.cw - 48 : 800, 'Meet the O-Trio — Otori, Popi and Fumi guide visitors through the three worlds.', { size: 16, weight: 600 });
    return y + (S.m ? 150 : 120) + V;
  });

  section(ctx, '04 Highlights', C.alt, S => {
    let y = H2(S, V, "What's on", null);
    const items = [['EXHIBITION', '20+ anime & game IP booths'], ['COSPLAY CUP', 'Win a trip to Japan'], ['MUSIC LIVE', 'Japanese artists, two nights']];
    y = grid(S, y, 3, 3, 1, (x, yy, w, i) => {
      const h = S.m ? 200 : 340;
      R(S, x, yy, w, h, C.phDark, { name: 'Tile: ' + items[i][0], r: 16 });
      T(S, x + 24, yy + h - 84, w - 48, items[i][0], { size: 26, weight: 900, color: C.white });
      T(S, x + 24, yy + h - 48, w - 48, items[i][1] + '  →', { size: 15, color: C.white });
      return h;
    });
    return y + V;
  });

  section(ctx, '05 IP lineup', C.white, S => {
    let y = H2(S, V, 'IP lineup', 'Confirmed titles — more revealed in the News.');
    y = grid(S, y, 6, 6, 3, (x, yy, w) => { IMG(S, x, yy, w, w * 0.75, 'IP LOGO', { r: 8 }); return w * 0.75; }) + 24;
    LINK(S, S.pad, y, 'See all IPs in Exhibition →');
    return y + 24 + V;
  });

  section(ctx, '06 Music Live headliners', C.night, S => {
    let y = H2(S, V, 'COVE Music Live', 'Two nights of anisong at Cove Manila.', true);
    y = grid(S, y, 3, 3, 1, (x, yy, w, i) => {
      if (i === 2) {
        R(S, x, yy, w, S.m ? 120 : 360, null, { name: 'TBA slot', stroke: C.phDark, dash: true, r: 12 });
        T(S, x, yy + (S.m ? 50 : 170), w, 'MORE ARTISTS TO BE ANNOUNCED', { size: 14, weight: 700, color: C.phDark, align: 'center' });
        return S.m ? 120 : 360;
      }
      IMG(S, x, yy, w, S.m ? 240 : 280, 'Artist photo', { r: 12, color: C.night2, ink: C.phDark });
      const t = yy + (S.m ? 256 : 296);
      T(S, x, t, w, 'ARTIST NAME', { size: 22, weight: 800, color: C.white });
      T(S, x, t + 32, w, i === 0 ? 'Day 1 · Sat, June 5' : 'Day 2 · Sun, June 6', { size: 14, color: C.phDark });
      return (S.m ? 256 : 296) + 56;
    }) + 32;
    BTN(S, S.pad, y, S.m ? S.cw : 260, 'MUSIC LIVE PASSES', 'pink');
    return y + 48 + V;
  });

  section(ctx, '07 Tickets preview', C.white, S => {
    let y = H2(S, V, 'Get your pass', 'From ₱800 · prices exclude VAT · kids 0–6 free');
    const passes = [['1-DAY EVENT', '₱800', ['Entry for one day', 'All 3 halls', 'Stamp rally']], ['2-DAY EVENT', '₱1,300', ['Entry both days', 'All 3 halls', 'Stamp rally']], ['EVENT + MUSIC LIVE', '₱3,800', ['Event entry', 'Music Live seat', 'Priority entry']]];
    y = grid(S, y, 3, 3, 1, (x, yy, w, i) => {
      const h = 330;
      R(S, x, yy, w, h, C.white, { name: 'Pass card', stroke: i === 1 ? C.accent : C.line, sw: i === 1 ? 3 : 1, r: 16 });
      if (i === 1) { R(S, x + w - 132, yy - 12, 112, 24, C.pink, { name: 'Badge', r: 12 }); T(S, x + w - 132, yy - 8, 112, 'MOST POPULAR', { size: 11, weight: 700, color: C.white, align: 'center' }); }
      T(S, x + 24, yy + 28, w - 48, passes[i][0], { size: 16, weight: 800 });
      T(S, x + 24, yy + 60, w - 48, passes[i][1], { size: 40, weight: 900, color: C.accent });
      passes[i][2].forEach((p, k) => T(S, x + 24, yy + 130 + k * 30, w - 48, '✓  ' + p, { size: 15 }));
      BTN(S, x + 24, yy + h - 72, w - 48, 'BUY', i === 1 ? 'primary' : 'ghost');
      return h;
    }) + 24;
    NOTE(S, S.pad, y, S.m ? S.cw : 480, 'Prices are placeholders from the demo — final tiers from client.');
    LINK(S, S.m ? S.pad : S.pad + 520, S.m ? y + 64 : y + 10, 'Compare all 6 passes →');
    return y + (S.m ? 96 : 48) + V;
  });

  section(ctx, '08 Latest news', C.alt, S => {
    let y = H2(S, V, 'Latest news', null);
    const tags = ['LINEUP', 'TICKETS', 'EXHIBITORS'];
    y = grid(S, y, 3, 3, 1, (x, yy, w, i) => {
      IMG(S, x, yy, w, 200, 'News image', { r: 12 });
      R(S, x, yy + 216, 90, 22, C.ink, { name: 'Category', r: 11 });
      T(S, x, yy + 219, 90, tags[i], { size: 10, weight: 700, color: C.white, align: 'center' });
      T(S, x + 104, yy + 218, 140, 'Oct 22, 2026', { size: 13, color: C.muted });
      T(S, x, yy + 252, w, 'News headline goes here and can run over two lines', { size: 18, weight: 700 });
      return 310;
    }) + 24;
    LINK(S, S.pad, y, 'All news →');
    return y + 24 + V;
  });

  section(ctx, '09 Join Us banner', C.white, S => {
    const h = S.m ? 300 : 220;
    R(S, S.pad, V, S.cw, h, C.accent, { name: 'Banner', r: 20 });
    T(S, S.pad + 32, V + 36, S.m ? S.cw - 64 : 760, 'BOOTH APPLICATIONS ARE OPEN', { size: S.m ? 24 : 36, weight: 900, color: C.white });
    T(S, S.pad + 32, V + (S.m ? 112 : 90), S.m ? S.cw - 64 : 700, 'Merchants, artists, doujin circles and food stalls. Early bird until Dec 15, 2026.', { size: 16, color: C.white });
    BTN(S, S.m ? S.pad + 32 : S.pad + S.cw - 32 - 240, S.m ? V + h - 80 : V + 86, S.m ? S.cw - 64 : 240, 'APPLY FOR A BOOTH', 'white');
    return V + h + V;
  });

  section(ctx, '10 Partners strip', C.white, S => {
    let y = H2(S, 0, 'Partners', null);
    T(S, S.pad, y, S.cw, 'PRESENTED BY', { size: 12, weight: 700, color: C.muted });
    y = grid(S, y + 28, 3, 3, 3, (x, yy, w) => { IMG(S, x, yy, w, S.m ? 56 : 96, 'LOGO', { r: 8 }); return S.m ? 56 : 96; }) + 24;
    y = grid(S, y, 6, 6, 3, (x, yy, w) => { IMG(S, x, yy, w, 64, 'LOGO', { r: 8 }); return 64; }) + 24;
    LINK(S, S.pad, y, 'All sponsors & partners →');
    return y + 24 + V;
  });

  section(ctx, '11 Access teaser', C.alt, S => {
    let y = V;
    if (S.m) {
      IMG(S, S.pad, y, S.cw, 220, 'MAP EMBED', { r: 12 });
      y += 244;
    } else IMG(S, S.pad, y, 690, 360, 'MAP EMBED (Google Maps)', { r: 12 });
    const tx = S.m ? S.pad : S.pad + 730, tw = S.m ? S.cw : 470;
    let t = S.m ? y : y + 16;
    t += T(S, tx, t, tw, 'GETTING THERE', { size: S.m ? 28 : 36, weight: 800 }) + 12;
    t += T(S, tx, t, tw, 'Okada Manila, New Seaside Drive, Entertainment City, Parañaque', { size: 16, weight: 600 }) + 16;
    ['Main entrance: Event Arc 1', 'Drop-off: Fountain Foyer', 'Shuttle bus: schedule coming soon'].forEach(l => { t += T(S, tx, t, tw, '•  ' + l, { size: 15 }) + 8; });
    t += 12;
    LINK(S, tx, t, 'Access & venue guide →');
    return Math.max(t + 24, S.m ? 0 : y + 360) + V;
  });

  section(ctx, '12 Updates signup', C.white, S => {
    let y = V;
    y += T(S, S.pad, y, S.cw, 'GET OPF UPDATES FIRST', { size: S.m ? 24 : 32, weight: 800, align: S.m ? 'left' : 'center' }) + 8;
    y += T(S, S.pad, y, S.cw, 'Lineup reveals, ticket drops and early-bird deals.', { size: 16, color: C.muted, align: S.m ? 'left' : 'center' }) + 24;
    const fw = S.m ? S.cw : 420, fx = S.m ? S.pad : (S.W - fw - 180) / 2;
    R(S, fx, y, fw, 48, C.white, { name: 'Email input', stroke: C.phDark, r: 24 });
    T(S, fx + 20, y + 14, 200, 'Email address', { size: 15, color: C.phDark });
    if (S.m) { BTN(S, S.pad, y + 60, S.cw, 'SUBSCRIBE'); y += 60; } else BTN(S, fx + fw + 16, y, 164, 'SUBSCRIBE');
    y += 72;
    const sx = S.m ? S.pad : S.W / 2 - 2 * 52 + 6;
    ['FB', 'IG', 'X', 'TT'].forEach((s, i) => { R(S, sx + i * 52, y, 40, 40, C.ph, { name: 'Social ' + s, ellipse: true }); T(S, sx + i * 52, y + 12, 40, s, { size: 11, weight: 700, color: C.muted, align: 'center' }); });
    return y + 40 + V;
  });

  section(ctx, '13 Footer', C.night, S => {
    const colsTxt = [
      ['OTAKU POP FES 2027', 'June 5–6, 2027\nOkada Manila\nBrought from Japan by CyberE\nOrganized by Mineski Global'],
      ['EVENT', 'Exhibition\nCosplay Cup\nMusic Live\nSchedule & Map\nTickets'],
      ['VISIT', 'Access & Venue\nFAQ & House Rules\nNews\nPast Events'],
      ['WORK WITH US', 'Join Us (Exhibitors)\nSponsors & Partners\nContact'],
    ];
    let y = grid(S, S.m ? 40 : 64, 4, 4, 2, (x, yy, w, i) => {
      T(S, x, yy, w, colsTxt[i][0], { size: 13, weight: 800, color: C.white });
      return 28 + T(S, x, yy + 28, w, colsTxt[i][1], { size: 14, color: C.phDark });
    }) + 40;
    R(S, S.pad, y, S.cw, 1, C.night2, { name: 'Divider' });
    y += 20;
    y += T(S, S.pad, y, S.cw, '© 2027 Otaku Pop Fes Executive Committee  ·  Privacy  ·  Terms  ·  Ticket Terms', { size: 13, color: C.phDark });
    return y + 32;
  });

  finish(ctx);
  return ctx.root;
}

// ---------- SITEMAP ----------
function buildSitemap() {
  const W = 2440;
  const root = pageBoard('Sitemap — OPF 2027', 0, 0, W);
  const S = { b: root, W, pad: 120, cw: W - 240, m: false, q: [] };
  T(S, 120, 80, 1600, 'OTAKU POP FES 2027 — SITEMAP', { size: 48, weight: 900 });
  T(S, 120, 148, 1600, 'otakupopfes.com · Draft v0.1 · Pink tag = new page vs OPF 2026 · Dashed = external', { size: 18, color: C.muted });

  const nodeW = 220, nodeH = 64, gap = 30;
  const node = (x, y, name, path, o = {}) => {
    R(S, x, y, nodeW, nodeH, o.fill || C.white, { name: 'Node: ' + name, stroke: o.stroke || C.ink, sw: o.sw || 2, dash: o.dash, r: 10 });
    T(S, x + 14, y + 12, nodeW - 28, name, { size: 16, weight: 800, color: o.ink || C.ink });
    if (path) T(S, x + 14, y + 36, nodeW - 28, path, { size: 12, color: o.ink ? C.phDark : C.muted });
    if (o.isNew) { R(S, x + nodeW - 50, y - 10, 44, 20, C.pink, { name: 'NEW tag', r: 10 }); T(S, x + nodeW - 50, y - 7, 44, 'NEW', { size: 10, weight: 800, color: C.white, align: 'center' }); }
  };
  const line = (x, y, w, h) => R(S, x, y, Math.max(2, w), Math.max(2, h), C.ink, { name: 'Connector' });

  const groups = [
    ['Event', null, false, [['Exhibition', '/exhibition'], ['Cosplay Cup', '/cosplay-cup'], ['Music Live', '/music-live'], ['Schedule & Map', '/schedule', true]]],
    ['Tickets', '/tickets', true, []],
    ['News', '/news', true, [['Article', '/news/{slug}', true]]],
    ['Visit', null, false, [['Access & Venue', '/access', true], ['FAQ & House Rules', '/faq', true]]],
    ['Join Us', '/join-us', true, [['Booth application', '/join-us/apply', true]]],
    ['Sponsors & Partners', '/sponsors', false, [['Partnership inquiry', '/sponsors#inquire', true]]],
    ['Contact', '/contact', true, []],
    ['Past Events', '/archive', true, [['OPF 2026', '/archive/2026', true]]],
    ['Legal', null, true, [['Privacy Policy', '/privacy'], ['Terms of Use', '/terms'], ['Ticket Terms', '/ticket-terms']]],
  ];
  const n = groups.length;
  const totalW = n * nodeW + (n - 1) * gap;
  const x0 = (W - totalW) / 2;
  const homeX = (W - nodeW) / 2, homeY = 260;
  node(homeX, homeY, 'Home', '/', { fill: C.accent, stroke: C.accent, ink: C.white });
  const busY = homeY + nodeH + 40;
  line(W / 2 - 1, homeY + nodeH, 2, 40);
  line(x0 + nodeW / 2, busY, totalW - nodeW, 2);
  const gy = busY + 40;
  groups.forEach((g, i) => {
    const gx = x0 + i * (nodeW + gap);
    line(gx + nodeW / 2 - 1, busY, 2, 40);
    node(gx, gy, g[0], g[1] || '(menu group)', { isNew: g[2], fill: g[1] ? C.white : C.alt });
    g[3].forEach((c, k) => {
      const cy = gy + nodeH + 30 + k * (nodeH + 20);
      line(gx + 20, gy + nodeH, 2, cy - gy - nodeH + nodeH / 2);
      line(gx + 20, cy + nodeH / 2 - 1, 20, 2);
      R(S, gx + 40, cy, nodeW - 40, nodeH, C.white, { name: 'Node: ' + c[0], stroke: C.phDark, sw: 1, r: 8 });
      T(S, gx + 52, cy + 12, nodeW - 64, c[0], { size: 14, weight: 700 });
      T(S, gx + 52, cy + 36, nodeW - 64, c[1], { size: 12, color: C.muted });
      if (c[2]) { R(S, gx + nodeW - 50, cy - 10, 44, 20, C.pink, { name: 'NEW tag', r: 10 }); T(S, gx + nodeW - 50, cy - 7, 44, 'NEW', { size: 10, weight: 800, color: C.white, align: 'center' }); }
    });
  });

  // external
  let ey = gy + nodeH + 30 + 4 * (nodeH + 20) + 60;
  T(S, 120, ey, 600, 'EXTERNAL', { size: 14, weight: 800, color: C.muted });
  ey += 32;
  ['Ticketing platform', 'Facebook', 'Instagram', 'X', 'TikTok'].forEach((e, i) => {
    R(S, 120 + i * (nodeW + gap), ey, nodeW, 48, null, { name: 'External: ' + e, stroke: C.phDark, dash: true, sw: 2, r: 10 });
    T(S, 134 + i * (nodeW + gap), ey + 14, nodeW - 28, e, { size: 15, weight: 700, color: C.muted });
  });

  // phases
  let py = ey + 120;
  T(S, 120, py, 1600, 'SITE PHASES — one CMS switch changes the homepage and CTAs', { size: 24, weight: 900 });
  py += 50;
  const phases = [
    ['1 · ANNOUNCE', 'Dec 2026 – Jan 2027', 'CTA: Get updates + Apply for a booth\nTicket prices "coming soon"'],
    ['2 · ON SALE', 'Feb – May 2027', 'CTA: Buy tickets + countdown\nLineup reveals via News'],
    ['3 · EVENT WEEK', 'Jun 1 – 6, 2027', "CTA: Today's schedule + Map\nLive announcement bar"],
    ['4 · POST-EVENT', 'Jun 7, 2027 →', 'CTA: See the highlights\nTicket CTAs hidden · OPF 2028 signup'],
  ];
  const pw = (W - 240 - 3 * 30) / 4;
  phases.forEach((p, i) => {
    const px = 120 + i * (pw + 30);
    R(S, px, py, pw, 170, i === 1 ? C.accent : C.alt, { name: 'Phase ' + (i + 1), r: 14 });
    const ink = i === 1 ? C.white : C.ink;
    T(S, px + 24, py + 22, pw - 48, p[0], { size: 20, weight: 900, color: ink });
    T(S, px + 24, py + 54, pw - 48, p[1], { size: 14, weight: 700, color: i === 1 ? C.white : C.accent });
    T(S, px + 24, py + 88, pw - 48, p[2], { size: 15, color: ink });
  });
  root.resize(W, py + 170 + 120);
  flush(S);
  return root;
}

function clean() {
  const page = penpot.currentPage;
  let n = 0;
  (page.root.children || []).slice().forEach(s => { if (s.name === 'svg' || s.name.startsWith('Sitemap — ') || s.name.startsWith('Home — ')) { s.remove(); n++; } });
  return n;
}

try {
  console.log('OPF27 plugin v3 start, removed', clean());
  const sm = buildSitemap();
  const d = buildHome(sm.x + sm.width + 400, false);
  const m = buildHome(d.x + d.width + 200, true);
  if (penpot.viewport.zoomToShapes) penpot.viewport.zoomToShapes([sm, d, m]);
  console.log('OPF27 wireframes built');
} catch (e) {
  console.error('OPF27 build error', e);
}
penpot.closePlugin();
