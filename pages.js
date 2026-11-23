// ===================== INNER PAGES =====================
// Shared components + one builder per page. Section names = layer names = pink tags.

const COPY = 'Placeholder copy — final text to come from the client. Keep it short, scannable and in plain English.';
const VEN = ['Crystal Pavilion', 'Grand Ballroom', 'Cove Manila'];
const SLOTS = [
  ['10:00', 0, 'Doors open · IP booths', 1], ['11:00', 1, 'Community stage: Opening', 1], ['11:00', 0, 'Screening: Title A', 2],
  ['12:00', 2, 'Artist alley meet & greet', 1], ['13:00', 1, 'Cosplay Cup prelims', 2], ['14:00', 0, 'IP stage talk: Title B', 1],
  ['15:00', 2, 'Ani-Karaoke', 2], ['16:00', 0, 'Lucky draw', 1], ['16:00', 1, 'Cosplay parade', 1], ['17:00', 2, 'COVE Music Live doors', 1],
];

function V_(S) { return S.m ? 48 : 88; }

function chipRow(S, x, y, items, active = 0, maxW) {
  let cx = x; const lim = x + (maxW || S.cw);
  for (let i = 0; i < items.length; i++) {
    const w = items[i].length * 7.5 + 32;
    if (cx + w > lim) { T(S, cx, y + 9, 40, '→', { size: 14, weight: 700, color: C.muted, name: 'More chips (scroll)' }); break; }
    const on = i === active;
    R(S, cx, y, w, 36, on ? C.ink : C.white, { name: 'Chip: ' + items[i], r: 18, stroke: on ? null : C.line });
    T(S, cx, y + 9, w, items[i], { size: 13, weight: 600, color: on ? C.white : C.ink, align: 'center' });
    cx += w + 8;
  }
  return 36;
}

function secPageHero(ctx, crumbs, title, intro, o = {}) {
  section(ctx, '01 Page hero', o.dark ? C.night : C.alt, S => {
    const dark = o.dark, hasImg = o.image !== false;
    const h = S.m ? 0 : (hasImg ? 400 : 300);
    if (hasImg) IMG(S, S.m ? 0 : S.W - 600, 0, S.m ? S.W : 600, S.m ? 160 : h, o.image || 'Page key visual', { color: dark ? C.night2 : C.ph, ink: dark ? C.phDark : C.muted });
    let y = S.m ? (hasImg ? 196 : 56) : 96;
    const tw = S.m ? S.cw : 600;
    y += T(S, S.pad, y, tw, crumbs, { size: 13, color: dark ? C.phDark : C.muted, name: 'Breadcrumb' }) + 12;
    y += T(S, S.pad, y, tw, title, { size: S.m ? 32 : 52, weight: 700, upper: true, color: dark ? C.white : C.ink }) + 12;
    if (intro) y += T(S, S.pad, y, tw, intro, { size: S.m ? 15 : 18, color: dark ? C.phDark : C.muted }) + 24;
    if (o.ctas) {
      o.ctas.forEach((c, i) => {
        if (S.m) { BTN(S, S.pad, y, S.cw, c[0], c[1]); y += 60; } else BTN(S, S.pad + i * 250, y, 230, c[0], c[1]);
      });
      if (!S.m) y += 48;
    }
    if (o.extra) y = o.extra(S, y);
    return Math.max(h, y + (S.m ? 32 : 56));
  });
}

function secChips(ctx, items) {
  section(ctx, '02 In-page nav (sticky)', C.white, S => {
    chipRow(S, S.pad, 44, items);
    R(S, 0, 95, S.W, 1, C.line, { name: 'Divider' });
    return 96;
  });
}

function secTicketBand(ctx, n) {
  section(ctx, n + ' Ticket CTA band', C.white, S => {
    const V = V_(S), h = S.m ? 230 : 160;
    R(S, S.pad, V, S.cw, h, C.accent, { name: 'Band', r: 20 });
    T(S, S.pad + 32, V + (S.m ? 28 : 36), S.m ? S.cw - 64 : 700, 'GET YOUR PASS — FROM ₱800', { size: S.m ? 22 : 32, weight: 700, color: C.white });
    T(S, S.pad + 32, V + (S.m ? 96 : 88), S.m ? S.cw - 64 : 700, '1-Day, 2-Day, Music Live and VIP passes. Prices exclude VAT.', { size: 15, color: C.white });
    BTN(S, S.m ? S.pad + 32 : S.pad + S.cw - 32 - 220, S.m ? V + h - 72 : V + 56, S.m ? S.cw - 64 : 220, 'BUY TICKETS', 'white');
    return V + h + V;
  });
}

function accordion(S, y, items, open = 0) {
  items.forEach((it, i) => {
    const on = i === open, size = S.m ? 15 : 17;
    const th = estH(it[0], size, S.cw - 90);
    const rowH = Math.max(64, th + 40);
    const bodyH = on ? estH(it[1], 15, S.cw - 48) + 20 : 0;
    R(S, S.pad, y, S.cw, rowH + bodyH, C.white, { name: 'Accordion: ' + it[0], stroke: C.line, r: 12 });
    T(S, S.pad + 24, y + 20, S.cw - 90, it[0], { size, weight: 700 });
    T(S, S.pad + S.cw - 52, y + 16, 28, on ? '–' : '+', { size: 22, weight: 700, align: 'center' });
    if (on) T(S, S.pad + 24, y + rowH - 4, S.cw - 48, it[1], { size: 15, color: C.muted });
    y += rowH + bodyH + 12;
  });
  return y;
}

function table(S, y, head, rows, o = {}) {
  if (S.m) { // tables become stacked cards on mobile
    rows.forEach(r => {
      const lines = head.slice(1).map((h, k) => h + ':  ' + r[k + 1]);
      const bh = 56 + lines.length * 24;
      R(S, S.pad, y, S.cw, bh, C.white, { name: 'Row card: ' + r[0], stroke: C.line, r: 12 });
      T(S, S.pad + 16, y + 16, S.cw - 32, r[0], { size: 16, weight: 700 });
      lines.forEach((l, k) => T(S, S.pad + 16, y + 46 + k * 24, S.cw - 32, l, { size: 14, color: C.muted }));
      y += bh + 12;
    });
    return y;
  }
  const n = head.length, w0 = o.firstW || S.cw * 0.3, w = (S.cw - w0) / (n - 1), rh = 52;
  const cx = k => S.pad + (k ? w0 + (k - 1) * w : 0);
  R(S, S.pad, y, S.cw, rh, C.ink, { name: 'Table header', r: 8 });
  head.forEach((h, k) => T(S, cx(k) + 16, y + 16, (k ? w : w0) - 24, h, { size: 14, weight: 700, color: C.white }));
  y += rh;
  rows.forEach((r, i) => {
    R(S, S.pad, y, S.cw, rh, i % 2 ? C.alt : C.white, { name: 'Table row: ' + r[0] });
    r.forEach((c, k) => T(S, cx(k) + 16, y + 16, (k ? w : w0) - 24, c, { size: 14, weight: k ? 400 : 700 }));
    y += rh;
  });
  return y;
}

function steps(S, y, items, n) {
  return grid(S, y, items.length, n || Math.min(items.length, 5), 1, (x, yy, w, i) => {
    R(S, x, yy, 48, 48, C.accent, { name: 'Step ' + (i + 1), ellipse: true });
    T(S, x, yy + 13, 48, String(i + 1), { size: 18, weight: 700, color: C.white, align: 'center' });
    let t = yy + 64;
    t += T(S, x, t, w, items[i][0], { size: 18, weight: 700 }) + 6;
    t += T(S, x, t, w, items[i][1], { size: 15, color: C.muted });
    return t - yy;
  });
}

function field(S, x, y, w, label, ph, o = {}) {
  T(S, x, y, w, label + (o.req ? ' *' : ''), { size: 13, weight: 700 });
  const h = o.h || 48;
  R(S, x, y + 22, w, h, C.white, { name: 'Input: ' + label, stroke: C.phDark, r: 8 });
  T(S, x + 14, y + 36, w - 50, ph, { size: 14, color: C.phDark });
  if (o.select) T(S, x + w - 34, y + 34, 20, '▾', { size: 14, color: C.ink });
  return 22 + h + 16;
}

function checkbox(S, x, y, w, label) {
  R(S, x, y, 20, 20, C.white, { name: 'Checkbox', stroke: C.ink, r: 4 });
  return Math.max(24, T(S, x + 32, y, w - 32, label, { size: 14 }));
}

function imgCards(S, y, n, c, cm, ratio, title, sub, label) {
  return grid(S, y, n, c, cm, (x, yy, w, i) => {
    const ih = Math.round(w * ratio);
    IMG(S, x, yy, w, ih, label || 'Image', { r: 10 });
    let t = yy + ih + 12;
    t += T(S, x, t, w, typeof title === 'function' ? title(i) : title, { size: S.m ? 15 : 18, weight: 700 }) + 4;
    if (sub) t += T(S, x, t, w, typeof sub === 'function' ? sub(i) : sub, { size: 13, color: C.muted });
    return t - yy;
  });
}

function dayToggle(S, y, x) {
  const w = S.m ? S.cw : 420; x = x == null ? S.pad : x;
  R(S, x, y, w, 48, C.alt, { name: 'Day toggle', r: 24, stroke: C.line });
  R(S, x + 4, y + 4, w / 2 - 4, 40, C.ink, { name: 'Day 1 (active)', r: 20 });
  T(S, x + 4, y + 15, w / 2 - 4, 'DAY 1 · SAT JUN 5', { size: 13, weight: 700, color: C.white, align: 'center' });
  T(S, x + w / 2, y + 15, w / 2 - 4, 'DAY 2 · SUN JUN 6', { size: 13, weight: 700, align: 'center' });
  return 48;
}

function timetable(S, y, venues, slots) {
  const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const tint = ['#DCE4FF', '#FFE0EE', '#E4E4E7'];
  if (S.m) { // list grouped by hour
    times.forEach(t => {
      const ev = slots.filter(s => s[0] === t);
      if (!ev.length) return;
      T(S, S.pad, y, 80, t, { size: 14, weight: 700, color: C.accent });
      y += 28;
      ev.forEach(e => {
        R(S, S.pad, y, S.cw, 64, C.white, { name: 'Event: ' + e[2], stroke: C.line, r: 10 });
        R(S, S.pad, y, 6, 64, [C.accent, C.pink, C.ink][e[1] % 3], { name: 'Venue colour' });
        T(S, S.pad + 20, y + 12, S.cw - 36, e[2], { size: 15, weight: 700 });
        T(S, S.pad + 20, y + 36, S.cw - 36, venues[e[1]] + ' · ' + (e[3] || 1) + 'h', { size: 13, color: C.muted });
        y += 76;
      });
      y += 8;
    });
    return y;
  }
  const tw = 90, cw = (S.cw - tw) / venues.length, rh = 72;
  venues.forEach((v, k) => {
    R(S, S.pad + tw + k * cw, y, cw - 8, 44, C.ink, { name: 'Venue: ' + v, r: 8 });
    T(S, S.pad + tw + k * cw, y + 13, cw - 8, v, { size: 14, weight: 700, color: C.white, align: 'center' });
  });
  y += 56;
  times.forEach((t, i) => {
    T(S, S.pad, y + i * rh + 8, tw - 10, t, { size: 13, weight: 700, color: C.muted });
    R(S, S.pad + tw, y + i * rh, S.cw - tw, 1, C.line, { name: 'Hour line' });
  });
  slots.forEach(e => {
    const i = times.indexOf(e[0]);
    if (i < 0 || e[1] >= venues.length) return;
    const x = S.pad + tw + e[1] * cw + 4, yy = y + i * rh + 6, hh = (e[3] || 1) * rh - 12;
    R(S, x, yy, cw - 16, hh, tint[e[1] % 3], { name: 'Event: ' + e[2], r: 8 });
    T(S, x + 12, yy + 10, cw - 40, e[2], { size: 14, weight: 700 });
    T(S, x + 12, yy + 32, cw - 40, e[0] + ' · ' + (e[3] || 1) + 'h', { size: 12, color: C.muted });
  });
  return y + times.length * rh;
}

function numbered(S, y, items, n) {
  return grid(S, y, items.length, n || 2, 1, (x, yy, w, i) => {
    T(S, x, yy, 36, String(i + 1).padStart(2, '0'), { size: 16, weight: 700, color: C.accent });
    return Math.max(28, T(S, x + 44, yy, w - 44, items[i], { size: 15 })) + 4;
  });
}

function tiles(S, y, items, n, nm) { // [big, small]
  return grid(S, y, items.length, n, nm || 2, (x, yy, w, i) => {
    R(S, x, yy, w, 110, C.alt, { name: 'Tile: ' + items[i][0], r: 12 });
    T(S, x + 20, yy + 22, w - 40, items[i][0], { size: S.m ? 16 : 20, weight: 700 });
    T(S, x + 20, yy + 58, w - 40, items[i][1], { size: 14, color: C.muted });
    return 110;
  });
}

function twoCol(S) { // desktop split: left 60%, right 40%
  const gap = 48, lw = Math.round((S.cw - gap) * 0.6);
  return { lx: S.pad, lw, rx: S.pad + lw + gap, rw: S.cw - lw - gap };
}

// ---------- page builders ----------
const PAGES = {
  exhibition: { title: 'Exhibition', build: ctx => {
    secPageHero(ctx, 'Home / Event / Exhibition', 'Exhibition', '20+ anime and game IP booths across three worlds — screenings, giveaways, a stamp rally and a community stage.', { image: 'IP collage key visual' });
    secChips(ctx, ['Zones', 'IP booths', 'Screenings', 'Benefits', 'Stamp rally', 'Stage', 'Merch']);
    section(ctx, '03 Zones overview', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Three worlds', 'Each hall has its own theme. Tap a zone to see it on the map.');
      const z = [['DISCOVER', VEN[0], 'Anime IP booths · screenings'], ['CONNECT', VEN[1], 'Community stage · artist alley · cosplay'], ['CELEBRATE', VEN[2], 'Music Live · night events']];
      y = grid(S, y, 3, 3, 1, (x, yy, w, i) => {
        R(S, x, yy, w, 160, C.alt, { name: 'Zone card', r: 12 });
        T(S, x + 20, yy + 20, w - 40, z[i][0], { size: 20, weight: 700 });
        T(S, x + 20, yy + 52, w - 40, z[i][1], { size: 14, weight: 700, color: C.accent });
        T(S, x + 20, yy + 78, w - 40, z[i][2], { size: 14, color: C.muted });
        T(S, x + 20, yy + 120, w - 40, 'View on map →', { size: 13, weight: 700, color: C.accent });
        return 160;
      });
      return y + V;
    });
    section(ctx, '04 IP booths', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'IP booths', 'Filter by type. Each card links to the booth on the map.');
      chipRow(S, S.pad, y, ['All', 'Anime', 'Game', 'Screening']); y += 60;
      y = grid(S, y, 8, 4, 2, (x, yy, w, i) => {
        const ih = Math.round(w * 0.75);
        IMG(S, x, yy, w, ih, 'Key art', { r: 10 });
        let t = yy + ih + 12;
        t += T(S, x, t, w, 'IP TITLE ' + (i + 1), { size: S.m ? 14 : 17, weight: 700 }) + 4;
        t += T(S, x, t, w, 'Booth A0' + (i + 1) + ' · ' + VEN[0], { size: 12, color: C.muted }) + 8;
        R(S, x, t, w, 28, C.white, { name: 'Benefit pill', r: 14, stroke: C.line });
        T(S, x + 12, t + 7, w - 24, 'Visitor benefit: sticker', { size: 11, weight: 600 });
        return t + 28 - yy;
      }) + 28;
      BTN(S, S.pad, y, S.m ? S.cw : 220, 'LOAD MORE IPS', 'ghost');
      return y + 48 + V;
    });
    section(ctx, '05 Anime screenings', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Anime screenings', 'Free with any event pass. Seats are first come, first served.');
      y = imgCards(S, y, 3, 3, 1, 0.5625, i => 'SCREENING TITLE ' + (i + 1), i => 'Day ' + (i % 2 + 1) + ' · ' + (13 + i) + ':00 · ' + VEN[0] + ' screen', 'Episode still');
      return y + V;
    });
    section(ctx, '06 Booth visitor benefits', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Booth visitor benefits', 'What you get at each booth and how to get it.');
      y = table(S, y, ['IP', 'Giveaway', 'How to get it'], [['IP Title 1', 'Sticker set', 'Follow the IP on social'], ['IP Title 2', 'Clear file', 'Play the booth game'], ['IP Title 3', 'Postcard', 'Buy any merch item'], ['IP Title 4', 'Photo card', 'Complete the quiz']]);
      return y + V;
    });
    section(ctx, '07 Stamp rally → lucky draw', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Stamp rally', 'Collect stamps, win prizes.');
      y = steps(S, y, [['Get a stamp card', 'At the entrance with your pass'], ['Visit 5 booths', 'Get a stamp at each booth'], ['Join the lucky draw', 'Drop your card at the info desk']], 3) + 32;
      R(S, S.pad, y, S.cw, 72, C.alt, { name: 'Prize strip', r: 12 });
      T(S, S.pad + 24, y + 24, S.cw - 48, 'Prizes: gaming laptop · figures · merch bundles (TBC)', { size: 16, weight: 700 });
      return y + 72 + V;
    });
    section(ctx, '08 Community stage', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Community stage', 'Talks, contests and fan events at the ' + VEN[1] + '.');
      y += dayToggle(S, y) + 32;
      y = timetable(S, y, ['Community Stage'], SLOTS.filter(s => s[1] === 1).map(s => [s[0], 0, s[2], s[3]]));
      return y + V;
    });
    section(ctx, '09 Venue-exclusive merch', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Venue-exclusive merch', 'Only sold at OPF 2027.');
      y = imgCards(S, y, 4, 4, 2, 1, i => 'Item name ' + (i + 1), '₱000', 'Product photo');
      return y + V;
    });
    secTicketBand(ctx, '10');
  } },

  cosplay: { title: 'Cosplay Cup', build: ctx => {
    secPageHero(ctx, 'Home / Event / Cosplay Cup', 'OPF Cosplay Cup 2027', 'Win a trip to Japan plus a cash prize. Open to all cosplayers.', { dark: true, image: 'Cosplay key visual', ctas: [['JOIN THE CUP', 'pink'], ['SEE THE RULES', 'ghostLight']] });
    secChips(ctx, ['How to enter', 'Categories', 'Schedule', 'Judges', 'Prizes', 'Gallery', 'Terms']);
    section(ctx, '03 How to enter', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'How to enter', 'Three steps. Entries close May 15, 2027.');
      y = steps(S, y, [['Follow @otakupopfes', 'On Facebook and Instagram'], ['Post your cosplay photo', 'Public post, one entry per person'], ['Add the hashtags', '#OtakuPopFes #OPF2027 #OPFCosplayCup']], 3) + 32;
      const w = S.m ? S.cw : 640;
      R(S, S.pad, y, w, 64, C.alt, { name: 'Hashtag box', r: 12, stroke: C.line });
      T(S, S.pad + 20, y + 22, w - 140, '#OtakuPopFes #OPF2027 #OPFCosplayCup', { size: S.m ? 12 : 15, weight: 700 });
      BTN(S, S.pad + w - 100, y + 12, 84, 'COPY', 'primary', 40);
      return y + 64 + V;
    });
    section(ctx, '04 Categories & rules', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Categories & rules', null);
      y = accordion(S, y, [['Open category', 'Solo cosplay of any anime, game or manga character. ' + COPY], ['Group category', '2–5 members, same series.'], ['Kids category', 'Ages 12 and under, with a guardian.'], ['Costume & prop rules', 'No real weapons. Props under 2 m. No liquids, glitter or open flames.']]);
      return y + V - 12;
    });
    section(ctx, '05 Schedule', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Schedule', null);
      y = table(S, y, ['Round', 'Day', 'Time', 'Stage'], [['Online entries', 'Until May 15', '—', 'Online'], ['Prelims', 'Day 1 · Sat Jun 5', '13:00', VEN[1]], ['Finals', 'Day 2 · Sun Jun 6', '15:00', VEN[1]], ['Awarding', 'Day 2 · Sun Jun 6', '17:00', VEN[1]]]);
      return y + V;
    });
    section(ctx, '06 Judges', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Judges', null);
      y = grid(S, y, 5, 5, 2, (x, yy, w, i) => {
        const d = Math.min(w, 140);
        R(S, x + (w - d) / 2, yy, d, d, C.ph, { name: 'Judge photo', ellipse: true });
        T(S, x, yy + d + 14, w, 'JUDGE NAME', { size: 15, weight: 700, align: 'center' });
        T(S, x, yy + d + 38, w, '@handle', { size: 13, color: C.muted, align: 'center' });
        return d + 60;
      });
      return y + V;
    });
    section(ctx, '07 Prizes', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Prizes', null);
      const p = [['GRAND PRIZE', 'Trip to Japan + ₱50,000'], ['2ND PLACE', '₱20,000 + merch'], ['3RD PLACE', '₱10,000 + merch']];
      y = grid(S, y, 3, 3, 1, (x, yy, w, i) => {
        R(S, x, yy, w, 150, i ? C.alt : C.accent, { name: 'Prize: ' + p[i][0], r: 16 });
        T(S, x + 24, yy + 28, w - 48, p[i][0], { size: 14, weight: 700, color: i ? C.muted : C.white });
        T(S, x + 24, yy + 60, w - 48, p[i][1], { size: S.m ? 22 : 26, weight: 700, color: i ? C.ink : C.white });
        return 150;
      }) + 16;
      T(S, S.pad, y, S.cw, 'Special prize sponsored by ANA (TBC)', { size: 14, color: C.muted });
      return y + 24 + V;
    });
    section(ctx, '08 Runway · photo contest · parade', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'More ways to join', null);
      y = tiles(S, y, [['Cosplay runway', 'Day 1 · 14:00 · walk-in, no entry needed'], ['Photo contest', 'Post with #OPFCosplayCup to join'], ['Cosplay parade', 'Day 2 · 16:00 · all cosplayers welcome']], 3, 1);
      return y + V;
    });
    section(ctx, '09 Gallery', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Gallery', 'Highlights from OPF 2026.');
      y = grid(S, y, 8, 4, 2, (x, yy, w) => { IMG(S, x, yy, w, w, 'Photo', { r: 8 }); return w; }) + 24;
      BTN(S, S.pad, y, S.m ? S.cw : 240, 'VIEW ALL PHOTOS', 'ghost');
      y += 64;
      y += NOTE(S, S.pad, y, S.m ? S.cw : 560, 'Opens a lightbox. Replaces the 78-photo grid on the OPF 2026 page.');
      return y + V;
    });
    section(ctx, '10 Terms', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Terms', null);
      y = accordion(S, y, [['Eligibility', COPY], ['Judging criteria', COPY], ['Use of photos', COPY]], -1);
      return y + V - 12;
    });
    secTicketBand(ctx, '11');
  } },

  music: { title: 'Music Live', build: ctx => {
    secPageHero(ctx, 'Home / Event / Music Live', 'COVE Music Live', 'Two nights of anisong at Cove Manila — June 5 & 6, 2027.', { dark: true, image: 'Stage / artist key visual', ctas: [['MUSIC LIVE PASSES', 'pink']] });
    secChips(ctx, ['Lineup', 'Seating', 'Passes', 'Discounts', 'Schedule', 'Extras']);
    section(ctx, '03 Lineup', C.night, S => {
      const V = V_(S); let y = H2(S, V, 'Lineup', 'More artists to be announced.', true);
      ['DAY 1 · SAT JUNE 5', 'DAY 2 · SUN JUNE 6'].forEach((d, di) => {
        y += T(S, S.pad, y, S.cw, d, { size: 15, weight: 700, color: C.pink }) + 16;
        y = grid(S, y, 3, 3, 1, (x, yy, w, i) => {
          if (i === 2) {
            const h = S.m ? 100 : 360;
            R(S, x, yy, w, h, null, { name: 'TBA slot', stroke: C.phDark, dash: true, r: 12 });
            T(S, x, yy + h / 2 - 10, w, 'TO BE ANNOUNCED', { size: 14, weight: 700, color: C.phDark, align: 'center' });
            return h;
          }
          IMG(S, x, yy, w, S.m ? 220 : 280, 'Artist photo', { r: 12, color: C.night2, ink: C.phDark });
          const t = yy + (S.m ? 236 : 296);
          T(S, x, t, w, 'ARTIST NAME', { size: 22, weight: 700, color: C.white });
          T(S, x, t + 32, w, 'Short bio line · links', { size: 14, color: C.phDark });
          return t + 56 - yy;
        }) + 40;
      });
      return y + V - 40;
    });
    section(ctx, '04 Stage & seating', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Stage & seating', null);
      const tiers = [['S Class', 'Front blocks', C.accent], ['Music Live', 'General seating', C.pink], ['VIP Cabana', 'Private boxes', C.ink]];
      if (S.m) { IMG(S, S.pad, y, S.cw, 240, 'Seating map', { r: 12 }); y += 264; } else IMG(S, S.pad, y, 720, 420, 'Seating map (zones coloured by tier)', { r: 12 });
      let ly = S.m ? y : y + 20; const lx = S.m ? S.pad : S.pad + 760;
      tiers.forEach(t => { R(S, lx, ly, 24, 24, t[2], { name: 'Legend swatch', r: 4 }); T(S, lx + 40, ly, 360, t[0], { size: 16, weight: 700 }); T(S, lx + 40, ly + 24, 360, t[1], { size: 14, color: C.muted }); ly += 64; });
      return Math.max(ly, S.m ? 0 : y + 420) + V;
    });
    section(ctx, '05 Passes', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Music Live passes', 'All passes include event entry for that day.');
      y = table(S, y, ['Benefit', 'Music Live', 'S Class', 'VIP Cabana'], [['Event entry', '✓', '✓', '✓'], ['Seat', 'General', 'Front blocks', 'Private cabana'], ['Priority entry', '—', '✓', '✓'], ['Artist merch', '—', 'Tote bag', 'Full set'], ['VIP mini-live', '—', '—', '✓'], ['Price', '₱3,800~', '₱5,800~', 'TBA']]) + 24;
      BTN(S, S.pad, y, S.m ? S.cw : 260, 'BUY MUSIC LIVE PASS', 'pink');
      return y + 48 + V;
    });
    section(ctx, '06 Discounts', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Discounts', 'Bring a valid ID at entry.');
      y = tiles(S, y, [['Kids 0–6', 'Free (event only)'], ['Students', '20% off'], ['Seniors 60+', '20% off'], ['PWD', '20% off']], 4, 2);
      return y + V;
    });
    section(ctx, '07 Show schedule', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Show schedule', null);
      y = table(S, y, ['Night', 'Doors', 'Show', 'Venue'], [['Day 1 · Sat Jun 5', '17:00', '18:30', VEN[2]], ['Day 2 · Sun Jun 6', '17:00', '18:30', VEN[2]]]);
      return y + V;
    });
    section(ctx, '08 Extras', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Extras', null);
      y = tiles(S, y, [['Artist merch', 'Cove foyer booth, opens 16:00'], ['Raffle', 'Every Music Live ticket = 1 entry'], ['VIP mini-live', 'Exclusive set for VIP Cabana']], 3, 1);
      return y + V;
    });
    secTicketBand(ctx, '09');
  } },

  schedule: { title: 'Schedule & Map', build: ctx => {
    secPageHero(ctx, 'Home / Event / Schedule & Map', 'Schedule & Map', 'Everything happening across the three halls, hour by hour.', { image: 'Venue illustration' });
    section(ctx, '02 Day & filters (sticky)', C.white, S => {
      let y = 48;
      y += dayToggle(S, y) + 16;
      if (S.m) { chipRow(S, S.pad, y, ['All halls', ...VEN]); y += 48; chipRow(S, S.pad, y, ['All types', 'Stage', 'Screening', 'Cosplay', 'Music']); y += 36; }
      else { chipRow(S, S.pad + 440, 54, ['All halls', ...VEN], 0, 760); chipRow(S, S.pad, y, ['All types', 'Stage', 'Screening', 'Cosplay', 'Music']); y += 36; }
      R(S, 0, y + 23, S.W, 1, C.line, { name: 'Divider' });
      return y + 24;
    });
    section(ctx, '03 Timetable', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Timetable', 'Day 1 · Saturday, June 5');
      y = timetable(S, y, VEN, SLOTS) + 24;
      y += NOTE(S, S.pad, y, S.m ? S.cw : 600, 'Event week: a red "NOW" line marks the current time and the page scrolls to it.');
      return y + V;
    });
    section(ctx, '04 Floor maps', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Floor maps', 'Tap a number to see the booth.');
      chipRow(S, S.pad, y, VEN); y += 60;
      const legend = ['A01 IP booth', 'A02 IP booth', 'B01 Community stage', 'B02 Artist alley', 'B03 Cosplay area', 'C01 Music Live hall', 'Info desk', 'First aid'];
      if (S.m) { IMG(S, S.pad, y, S.cw, 260, 'Floor map (pinch to zoom)', { r: 12 }); y += 284; }
      else IMG(S, S.pad, y, 780, 480, 'Floor map — numbered booths', { r: 12 });
      let ly = S.m ? y : y + 8; const lx = S.m ? S.pad : S.pad + 820;
      legend.forEach((l, i) => {
        R(S, lx, ly, 28, 28, C.accent, { name: 'Pin ' + (i + 1), ellipse: true });
        T(S, lx, ly + 6, 28, String(i + 1), { size: 12, weight: 700, color: C.white, align: 'center' });
        T(S, lx + 40, ly + 4, 300, l, { size: 15 });
        ly += 40;
      });
      return Math.max(ly, S.m ? 0 : y + 480) + V;
    });
    section(ctx, '05 Downloads', C.white, S => {
      const V = V_(S);
      if (S.m) { BTN(S, S.pad, V, S.cw, 'DOWNLOAD MAP (PDF)', 'ghost'); BTN(S, S.pad, V + 60, S.cw, 'DOWNLOAD SCHEDULE (PDF)', 'ghost'); return V + 108 + V; }
      BTN(S, S.pad, V, 280, 'DOWNLOAD MAP (PDF)', 'ghost'); BTN(S, S.pad + 300, V, 320, 'DOWNLOAD SCHEDULE (PDF)', 'ghost');
      return V + 48 + V;
    });
  } },

  tickets: { title: 'Tickets', build: ctx => {
    secPageHero(ctx, 'Home / Tickets', 'Get your pass', 'From ₱800. Early-bird prices until Feb 28, 2027.', { image: 'Pass artwork', ctas: [['BUY ON TICKETING SITE', 'pink']] });
    section(ctx, '02 Pass cards', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Passes', 'Prices exclude VAT. "~" means "starting from".');
      const P = [['1-DAY EVENT', '₱800', ['Entry for one day', 'All 3 halls', 'Stamp rally']], ['2-DAY EVENT', '₱1,300', ['Entry both days', 'All 3 halls', 'Stamp rally']], ['EVENT + MUSIC LIVE', '₱3,800~', ['Event entry', 'Music Live seat', 'One night']], ['S CLASS', '₱5,800~', ['Front-block seat', 'Priority entry', 'Tote bag']], ['VIP 2-DAYS', '₱12,000~', ['Both days + both nights', 'VIP lane', 'Merch set']], ['VIP CABANA', 'TBA', ['Private cabana', 'VIP mini-live', 'Host service']]];
      y = grid(S, y, 6, 3, 1, (x, yy, w, i) => {
        const h = 320, pop = i === 1;
        R(S, x, yy, w, h, C.white, { name: 'Pass card: ' + P[i][0], stroke: pop ? C.accent : C.line, sw: pop ? 3 : 1, r: 16 });
        if (pop) { R(S, x + w - 132, yy - 12, 112, 24, C.pink, { name: 'Badge', r: 12 }); T(S, x + w - 132, yy - 8, 112, 'MOST POPULAR', { size: 11, weight: 700, color: C.white, align: 'center' }); }
        T(S, x + 24, yy + 28, w - 48, P[i][0], { size: 16, weight: 700 });
        T(S, x + 24, yy + 58, w - 48, P[i][1], { size: 36, weight: 700, color: C.accent });
        P[i][2].forEach((p, k) => T(S, x + 24, yy + 124 + k * 30, w - 48, '✓  ' + p, { size: 15 }));
        BTN(S, x + 24, yy + h - 72, w - 48, 'BUY', pop ? 'primary' : 'ghost');
        return h;
      }) + 24;
      y += NOTE(S, S.pad, y, S.m ? S.cw : 520, 'Tiers and prices are placeholders from the concept demo — final list from the client.');
      return y + V;
    });
    section(ctx, '03 Compare passes', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Compare passes', null);
      y = table(S, y, ['Benefit', '1-Day', '2-Day', '+Music', 'S Class', 'VIP'], [['Event days', '1', '2', '1', '1', '2'], ['Music Live', '—', '—', '✓', '✓ front', '✓ both'], ['Priority entry', '—', '—', '—', '✓', '✓'], ['Merch', '—', '—', '—', 'Tote', 'Set'], ['Price', '₱800', '₱1,300', '₱3,800~', '₱5,800~', '₱12,000~']], { firstW: S.cw * 0.25 });
      return y + V;
    });
    section(ctx, '04 Discounts', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Discounts', 'Show a valid ID at entry. Discounts apply to event passes.');
      y = tiles(S, y, [['Kids 0–6', 'Free entry'], ['Students', '20% off'], ['Seniors 60+', '20% off'], ['PWD', '20% off']], 4, 2);
      return y + V;
    });
    section(ctx, '05 How to buy', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'How to buy', null);
      y = steps(S, y, [['Choose your pass', 'Compare passes above'], ['Pay online', 'Card, GCash or Maya'], ['Get your QR ticket', 'Sent to your email'], ['Scan at entry', 'Event Arc 1 entrance']], 4);
      return y + V;
    });
    section(ctx, '06 Ticket FAQ', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Ticket FAQ', null);
      y = accordion(S, y, [['Do prices include VAT?', 'No. Prices shown exclude 12% VAT; the total appears at checkout.'], ['Can I get a refund?', COPY], ['Can I transfer my ticket?', COPY], ['Is re-entry allowed?', COPY]]);
      return y + V - 12;
    });
  } },

  news: { title: 'News', build: ctx => {
    secPageHero(ctx, 'Home / News', 'News', 'Lineup reveals, ticket drops and announcements.', { image: false });
    section(ctx, '02 Categories & search', C.white, S => {
      chipRow(S, S.pad, 44, ['All', 'Announcements', 'Lineup', 'Tickets', 'Cosplay', 'Exhibitors'], 0, S.m ? S.cw : 820);
      if (S.m) { field(S, S.pad, 96, S.cw, 'Search', 'Search news…'); return 192; }
      R(S, S.pad + S.cw - 320, 38, 320, 48, C.white, { name: 'Search', stroke: C.phDark, r: 24 }); T(S, S.pad + S.cw - 300, 52, 260, 'Search news…', { size: 14, color: C.phDark });
      return 120;
    });
    section(ctx, '03 Featured article', C.white, S => {
      let y = 16;
      if (S.m) { IMG(S, S.pad, y, S.cw, 200, 'Featured image', { r: 12 }); y += 216; }
      else IMG(S, S.pad, y, 700, 400, 'Featured image', { r: 12 });
      const tx = S.m ? S.pad : S.pad + 740, tw = S.m ? S.cw : 460; let t = S.m ? y : y + 40;
      R(S, tx, t, 110, 24, C.pink, { name: 'Category', r: 12 }); T(S, tx, t + 4, 110, 'ANNOUNCEMENT', { size: 10, weight: 700, color: C.white, align: 'center' });
      T(S, tx + 124, t + 3, 200, 'Oct 22, 2026', { size: 13, color: C.muted }); t += 40;
      t += T(S, tx, t, tw, 'Big headline for the featured story goes here', { size: S.m ? 24 : 34, weight: 700 }) + 12;
      t += T(S, tx, t, tw, COPY, { size: 16, color: C.muted }) + 16;
      LINK(S, tx, t, 'Read more →');
      return Math.max(t + 32, S.m ? 0 : y + 400) + 48;
    });
    section(ctx, '04 Article grid', C.alt, S => {
      const V = V_(S);
      const tags = ['LINEUP', 'TICKETS', 'EXHIBITORS', 'COSPLAY', 'LINEUP', 'NEWS'];
      let y = grid(S, V, 6, 3, 1, (x, yy, w, i) => {
        IMG(S, x, yy, w, 200, 'News image', { r: 12 });
        R(S, x, yy + 216, 90, 22, C.ink, { name: 'Category', r: 11 });
        T(S, x, yy + 219, 90, tags[i], { size: 10, weight: 700, color: C.white, align: 'center' });
        T(S, x + 104, yy + 218, 140, 'Oct ' + (20 - i * 2) + ', 2026', { size: 13, color: C.muted });
        T(S, x, yy + 252, w, 'News headline goes here and can run over two lines', { size: 18, weight: 700 });
        return 310;
      }) + 40;
      const labels = ['‹', '1', '2', '3', '›'], px = S.m ? S.pad + (S.cw - 5 * 52) / 2 : S.W / 2 - 130;
      labels.forEach((l, i) => { R(S, px + i * 52, y, 44, 44, i === 1 ? C.ink : C.white, { name: 'Page ' + l, r: 8, stroke: C.line }); T(S, px + i * 52, y + 12, 44, l, { size: 15, weight: 700, align: 'center', color: i === 1 ? C.white : C.ink }); });
      return y + 44 + V;
    });
  } },

  article: { title: 'News Article', build: ctx => {
    section(ctx, '01 Article header', C.white, S => {
      const rw = S.m ? S.cw : 760, rx = S.m ? S.pad : (S.W - 760) / 2; let y = S.m ? 48 : 80;
      y += T(S, rx, y, rw, 'Home / News / Lineup', { size: 13, color: C.muted, name: 'Breadcrumb' }) + 20;
      R(S, rx, y, 80, 24, C.pink, { name: 'Category', r: 12 }); T(S, rx, y + 4, 80, 'LINEUP', { size: 10, weight: 700, color: C.white, align: 'center' });
      T(S, rx + 94, y + 3, 260, 'Oct 22, 2026 · 3 min read', { size: 13, color: C.muted }); y += 44;
      y += T(S, rx, y, rw, 'First Music Live headliner announced for OPF 2027', { size: S.m ? 28 : 44, weight: 700 }) + 16;
      y += T(S, rx, y, rw, 'One-line summary of the story for social shares and search results.', { size: 18, color: C.muted }) + 24;
      return y;
    });
    section(ctx, '02 Article hero image', C.white, S => { IMG(S, S.m ? 0 : S.pad, 0, S.m ? S.W : S.cw, S.m ? 220 : 560, 'Article hero image', { r: S.m ? 0 : 16 }); return (S.m ? 220 : 560) + 48; });
    section(ctx, '03 Article body', C.white, S => {
      const rw = S.m ? S.cw : 760, rx = S.m ? S.pad : (S.W - 760) / 2; let y = 40;
      y += T(S, rx, y, rw, COPY + ' ' + COPY, { size: 18 }) + 24;
      y += T(S, rx, y, rw, 'Subheading inside the article', { size: 24, weight: 700 }) + 16;
      y += T(S, rx, y, rw, COPY + ' ' + COPY, { size: 18 }) + 24;
      IMG(S, rx, y, rw, S.m ? 200 : 420, 'Inline image + caption', { r: 12 }); y += (S.m ? 200 : 420) + 24;
      R(S, rx, y, 4, 80, C.accent, { name: 'Quote bar' });
      y += T(S, rx + 24, y, rw - 24, '"Pull quote from the artist or organiser goes here."', { size: 22, weight: 700 }) + 40;
      y += T(S, rx, y, rw, COPY, { size: 18 }) + 32;
      T(S, rx, y + 10, 80, 'Share', { size: 14, weight: 700 });
      ['FB', 'X', 'IG', 'Link'].forEach((s, i) => { R(S, rx + 80 + i * 52, y, 40, 40, C.ph, { name: 'Share ' + s, ellipse: true }); T(S, rx + 80 + i * 52, y + 12, 40, s, { size: 10, weight: 700, color: C.muted, align: 'center' }); });
      return y + 40 + 64;
    });
    section(ctx, '04 Related news', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Related news', null);
      y = imgCards(S, y, 3, 3, 1, 0.56, 'Related headline across two lines', 'Oct 18, 2026', 'News image');
      return y + V;
    });
    secTicketBand(ctx, '05');
  } },

  access: { title: 'Access & Venue', build: ctx => {
    secPageHero(ctx, 'Home / Visit / Access & Venue', 'Access & Venue', 'Okada Manila, Entertainment City, Parañaque.', { image: 'Venue photo' });
    section(ctx, '02 Map & address', C.white, S => {
      const V = V_(S); let y = V;
      if (S.m) { IMG(S, S.pad, y, S.cw, 240, 'MAP EMBED', { r: 12 }); y += 264; } else IMG(S, S.pad, y, 720, 400, 'MAP EMBED (Google Maps)', { r: 12 });
      const tx = S.m ? S.pad : S.pad + 760, tw = S.m ? S.cw : 440; let t = S.m ? y : y + 24;
      t += T(S, tx, t, tw, 'OKADA MANILA', { size: 28, weight: 700 }) + 8;
      t += T(S, tx, t, tw, 'New Seaside Drive, Entertainment City, Parañaque, Metro Manila', { size: 16 }) + 16;
      t += T(S, tx, t, tw, 'Event hours: 10:00–22:00, June 5–6, 2027', { size: 15, color: C.muted }) + 24;
      BTN(S, tx, t, S.m ? S.cw : 260, 'OPEN IN GOOGLE MAPS', 'ghost'); t += 48;
      return Math.max(t, S.m ? 0 : y + 400) + V;
    });
    section(ctx, '03 Entrances', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Entrances', null);
      const e = [['Main entrance', 'Event Arc 1 — ticket scan and bag check'], ['Drop-off point', 'Fountain Foyer — cars and Grab'], ['Music Live entrance', 'Cove Manila — opens 17:00']];
      y = imgCards(S, y, 3, 3, 1, 0.6, i => e[i][0], i => e[i][1], 'Entrance photo');
      return y + V;
    });
    section(ctx, '04 Getting there', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Getting there', null);
      chipRow(S, S.pad, y, ['By car', 'Grab / taxi', 'Shuttle bus', 'Public transport']); y += 60;
      ['From Makati: via Roxas Blvd → Macapagal Ave (approx. 30 min)', 'From NAIA: via NAIA Expressway (approx. 15 min)', 'Use the Okada Manila main entrance and follow OPF signs to Event Arc 1'].forEach(l => { y += T(S, S.pad, y, S.m ? S.cw : 760, '•  ' + l, { size: 16 }) + 10; });
      y += 16; y += NOTE(S, S.pad, y, S.m ? S.cw : 560, 'Shuttle routes and times to be confirmed with the venue.');
      return y + V;
    });
    section(ctx, '05 Parking', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Parking', null);
      y = table(S, y, ['Area', 'Rate', 'Walk to Event Arc 1'], [['Basement parking', '₱000 / entry', '3 min'], ['Open parking A', '₱000 / entry', '8 min'], ['Valet', '₱000', 'Drop-off at Fountain Foyer']]);
      return y + V;
    });
    section(ctx, '06 Nearby hotels & food', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Stay & eat nearby', 'Partner deals for OPF pass holders (TBC).');
      y = imgCards(S, y, 3, 3, 1, 0.6, i => 'Partner name ' + (i + 1), 'Deal description', 'Photo');
      return y + V;
    });
  } },

  faq: { title: 'FAQ & House Rules', build: ctx => {
    secPageHero(ctx, 'Home / Visit / FAQ', 'FAQ & House Rules', 'Answers to common questions.', { image: false, extra: (S, y) => {
      const w = S.m ? S.cw : 600;
      R(S, S.pad, y, w, 56, C.white, { name: 'Search', stroke: C.phDark, r: 28 });
      T(S, S.pad + 24, y + 18, w - 48, 'Search questions…', { size: 15, color: C.phDark });
      return y + 56;
    } });
    section(ctx, '02 Categories', C.white, S => { chipRow(S, S.pad, 44, ['Tickets', 'Entry', 'Cosplay', 'Bags & items', 'Accessibility', 'Lost & found']); return 100; });
    section(ctx, '03 Questions', C.white, S => {
      const V = V_(S);
      const y = accordion(S, 24, [['What time do doors open?', 'Doors open at 10:00 both days. Music Live doors open at 17:00.'], ['Can I bring food and drinks?', COPY], ['Is there a cloakroom?', COPY], ['Are cosplay props allowed?', COPY], ['Is the venue accessible?', COPY], ['Where is lost & found?', COPY]]);
      return y + V - 12;
    });
    section(ctx, '04 House rules', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'House rules', null);
      y = numbered(S, y, ['Bring your ticket QR and a valid ID', 'Bags are checked at entry', 'No outside food or drinks', 'No real or realistic weapons', 'Ask before taking photos of cosplayers', 'No commercial filming without a media pass', 'Follow staff instructions at all times', 'Re-entry rules depend on your pass'], 2);
      return y + V;
    });
    section(ctx, '05 Still need help', C.white, S => {
      const V = V_(S);
      R(S, S.pad, V, S.cw, S.m ? 180 : 120, C.alt, { name: 'Help box', r: 16 });
      T(S, S.pad + 32, V + 32, S.m ? S.cw - 64 : 600, 'Still need help? Our team replies within 2 business days.', { size: 18, weight: 700 });
      BTN(S, S.m ? S.pad + 32 : S.pad + S.cw - 252, S.m ? V + 112 : V + 36, S.m ? S.cw - 64 : 220, 'CONTACT US');
      return V + (S.m ? 180 : 120) + V;
    });
  } },

  joinus: { title: 'Join Us', build: ctx => {
    secPageHero(ctx, 'Home / Join Us', 'Join Us', 'Exhibit at OPF 2027 — merchants, artists, doujin circles, food stalls and brands.', { image: 'Exhibitor photo', ctas: [['APPLY FOR A BOOTH', 'pink'], ['SEE BOOTH RATES', 'ghost']] });
    section(ctx, '02 Why exhibit', C.white, S => {
      const f = [['30,000+', 'Target visitors'], ['3 worlds', 'Halls to choose from'], ['20+ IPs', 'Official anime & game booths'], ['2 days', 'June 5–6, 2027']];
      const end = grid(S, 56, 4, 4, 2, (x, y, w, i) => { T(S, x, y, w, f[i][0], { size: S.m ? 24 : 34, weight: 700, color: C.accent }); T(S, x, y + (S.m ? 34 : 46), w, f[i][1], { size: 14, color: C.muted }); return 72; });
      return end + 48;
    });
    section(ctx, '03 Booth types', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Booth types', null);
      const B = [['Merchant booth', 'from ₱38,000', 'Sell licensed and original merch'], ['Artist alley', 'from ₱14,000', 'Illustrators and creators'], ['Doujin table', '₱3,200–5,500', 'Fan-made works and circles'], ['Food street stall', 'from ₱48,000', 'Food and drinks'], ['Brand experience', 'By proposal', 'Custom activations for brands']];
      y = grid(S, y, 5, 3, 1, (x, yy, w, i) => {
        R(S, x, yy, w, 190, C.white, { name: 'Booth type: ' + B[i][0], r: 16, stroke: C.line });
        R(S, x + 24, yy + 24, 48, 48, C.ph, { name: 'Icon', r: 12 });
        T(S, x + 24, yy + 88, w - 48, B[i][0], { size: 18, weight: 700 });
        T(S, x + 24, yy + 116, w - 48, B[i][1], { size: 15, weight: 700, color: C.accent });
        T(S, x + 24, yy + 144, w - 48, B[i][2], { size: 14, color: C.muted });
        return 190;
      });
      return y + V;
    });
    section(ctx, '04 Inclusions', C.white, S => {
      const V = V_(S); let y = H2(S, V, "What's included", null);
      y = table(S, y, ['Inclusion', 'Merchant', 'Artist alley', 'Doujin', 'Food street'], [['Size', '3 × 3 m', '2 × 1 m', '1 table', '3 × 3 m'], ['Exhibitor passes', '4', '2', '2', '3'], ['Table & chairs', '1 + 2', '1 + 2', '1 + 2', '—'], ['Power outlet', '1', '—', '—', '2'], ['Signage', '✓', '✓', '—', '✓']], { firstW: S.cw * 0.24 });
      return y + V;
    });
    section(ctx, '05 Rates & add-ons', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Rates', 'Early bird until Dec 15, 2026.');
      y = table(S, y, ['Booth', 'Early bird', 'Regular'], [['Merchant booth', '₱38,000', '₱45,000'], ['Artist alley', '₱14,000', '₱17,000'], ['Doujin table', '₱3,200', '₱5,500'], ['Food street stall', '₱48,000', '₱55,000']]) + 32;
      y += T(S, S.pad, y, S.cw, 'ADD-ONS', { size: 13, weight: 700, color: C.muted }) + 12;
      chipRow(S, S.pad, y, ['Extra pass ₱1,200', 'Power outlet ₱2,500', 'Table ₱800', 'Chair ₱300', 'Corner ₱5,000']); y += 60;
      y += NOTE(S, S.pad, y, S.m ? S.cw : 600, 'Payment: 50% to reserve, balance due Apr 30, 2027. Rates are placeholders from the demo.');
      return y + V;
    });
    section(ctx, '06 How to join', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'How to join', null);
      y = steps(S, y, [['Apply online', 'Fill in the form below'], ['Screening', '3–5 business days'], ['Reserve', 'Pay 50% to lock your spot'], ['Allocation', 'We assign your booth'], ['Load-in', 'June 4, 2027']], 5);
      return y + V;
    });
    section(ctx, '07 Key dates', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Key dates', null);
      const D = [['Oct 22, 2026', 'Applications open'], ['Dec 15, 2026', 'Early-bird deadline'], ['Jan 31, 2027', 'Final deadline'], ['Feb 2027', 'Booth allocation'], ['Apr 30, 2027', 'Balance due'], ['Jun 4, 2027', 'Load-in'], ['Jun 5–6, 2027', 'Event days']];
      if (S.m) {
        R(S, S.pad + 9, y, 2, D.length * 64 - 40, C.phDark, { name: 'Timeline line' });
        D.forEach((d, i) => { R(S, S.pad, y + i * 64, 20, 20, i === 1 ? C.pink : C.accent, { name: 'Dot', ellipse: true }); T(S, S.pad + 36, y + i * 64 - 2, S.cw - 36, d[0], { size: 14, weight: 700 }); T(S, S.pad + 36, y + i * 64 + 20, S.cw - 36, d[1], { size: 14, color: C.muted }); });
        return y + D.length * 64 + V;
      }
      const step = S.cw / D.length;
      R(S, S.pad, y + 9, S.cw, 2, C.phDark, { name: 'Timeline line' });
      D.forEach((d, i) => { const x = S.pad + i * step; R(S, x, y, 20, 20, i === 1 ? C.pink : C.accent, { name: 'Dot', ellipse: true }); T(S, x, y + 36, step - 16, d[0], { size: 14, weight: 700 }); T(S, x, y + 60, step - 16, d[1], { size: 14, color: C.muted }); });
      return y + 110 + V;
    });
    section(ctx, '08 Application form', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Apply for a booth', 'About 10 minutes. You can save and come back.');
      const fw = S.m ? S.cw : 720;
      // stepper
      const st = ['1 Booth', '2 Details', '3 Business', '4 Review'], sw = (fw - 24) / 4;
      st.forEach((s, i) => { R(S, S.pad + i * (sw + 8), y, sw, 40, i === 0 ? C.accent : C.alt, { name: 'Form step ' + s, r: 20 }); T(S, S.pad + i * (sw + 8), y + 12, sw, s, { size: S.m ? 11 : 13, weight: 700, color: i === 0 ? C.white : C.muted, align: 'center' }); });
      y += 64;
      T(S, S.pad, y, fw, 'Booth type *', { size: 13, weight: 700 }); y += 26;
      const opts = ['Merchant booth', 'Artist alley', 'Doujin table', 'Food street stall'], ow = (fw - 12) / 2;
      opts.forEach((o, i) => { const ox = S.pad + (i % 2) * (ow + 12), oy = y + Math.floor(i / 2) * 76; R(S, ox, oy, ow, 64, C.white, { name: 'Option: ' + o, stroke: i === 0 ? C.accent : C.line, sw: i === 0 ? 2 : 1, r: 12 }); R(S, ox + 16, oy + 22, 20, 20, i === 0 ? C.accent : C.white, { name: 'Radio', ellipse: true, stroke: C.ink }); T(S, ox + 48, oy + 22, ow - 60, o, { size: S.m ? 13 : 15, weight: 600 }); });
      y += 160;
      y += field(S, S.pad, y, fw, 'Number of booths', '1', { req: true, select: true });
      y += field(S, S.pad, y, fw, 'Preferred hall', VEN[0], { select: true });
      T(S, S.pad, y, fw, 'Add-ons', { size: 13, weight: 700 }); y += 26;
      ['Extra exhibitor pass', 'Power outlet'].forEach(a => { R(S, S.pad, y, fw, 56, C.white, { name: 'Add-on: ' + a, stroke: C.line, r: 10 }); T(S, S.pad + 16, y + 18, fw - 160, a, { size: 15 }); ['−', '0', '+'].forEach((c, k) => { R(S, S.pad + fw - 132 + k * 40, y + 10, 36, 36, k === 1 ? C.white : C.alt, { name: 'Stepper ' + c, r: 8, stroke: C.line }); T(S, S.pad + fw - 132 + k * 40, y + 18, 36, c, { size: 15, weight: 700, align: 'center' }); }); y += 68; });
      y += 12;
      if (S.m) {
        R(S, S.pad, y, S.cw, 72, C.night, { name: 'Estimate bar (sticky bottom)', r: 12 });
        T(S, S.pad + 16, y + 14, 200, 'Estimate', { size: 12, color: C.phDark }); T(S, S.pad + 16, y + 34, 200, '₱38,000', { size: 20, weight: 700, color: C.white });
        BTN(S, S.pad + S.cw - 136, y + 16, 120, 'NEXT', 'pink', 40);
        y += 96;
      } else {
        BTN(S, S.pad, y, 200, 'NEXT STEP');
        const px = S.pad + 760, pw = S.cw - 760; let py = V + 200;
        R(S, px, py, pw, 360, C.alt, { name: 'Estimate panel (sticky)', r: 16 });
        T(S, px + 28, py + 28, pw - 56, 'YOUR BOOTH ESTIMATE', { size: 14, weight: 700, color: C.muted });
        [['Merchant booth × 1', '₱38,000'], ['Add-ons', '₱0'], ['VAT (12%)', '₱4,560']].forEach((r, i) => { T(S, px + 28, py + 72 + i * 36, pw - 160, r[0], { size: 15 }); T(S, px + pw - 148, py + 72 + i * 36, 120, r[1], { size: 15, align: 'right' }); });
        R(S, px + 28, py + 190, pw - 56, 1, C.phDark, { name: 'Divider' });
        T(S, px + 28, py + 210, 200, 'Total', { size: 18, weight: 700 }); T(S, px + pw - 188, py + 206, 160, '₱42,560', { size: 26, weight: 700, color: C.accent, align: 'right' });
        T(S, px + 28, py + 270, pw - 56, '50% reservation: ₱21,280', { size: 14, color: C.muted });
        y += 48;
      }
      y += 24;
      y += NOTE(S, S.pad, y, S.m ? S.cw : 720, 'Later steps: contact details · business info (DTI/SEC no., category, product photos up to 5) · terms + RA 10173 consent · review & submit → email confirmation.');
      return y + V;
    });
    section(ctx, '09 Exhibitor rules', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Exhibitor rules', null);
      y = numbered(S, y, ['Only sell items listed in your application', 'No counterfeit or bootleg goods', 'Stay within your booth space', 'Load-in June 4, 14:00–22:00', 'Booth must be staffed during event hours', 'No sound above venue limits', 'Follow venue fire and safety rules', 'Load-out after 22:00 on June 6'], 2);
      return y + V;
    });
    section(ctx, '10 Partnership CTA', C.white, S => {
      const V = V_(S), h = S.m ? 200 : 140;
      R(S, S.pad, V, S.cw, h, C.night, { name: 'Partner box', r: 16 });
      T(S, S.pad + 32, V + 32, S.m ? S.cw - 64 : 640, 'Planning a bigger brand activation?', { size: 22, weight: 700, color: C.white });
      T(S, S.pad + 32, V + (S.m ? 98 : 72), S.m ? S.cw - 64 : 640, 'Talk to our partnerships team.', { size: 15, color: C.phDark });
      BTN(S, S.m ? S.pad + 32 : S.pad + S.cw - 292, S.m ? V + h - 64 : V + 46, S.m ? S.cw - 64 : 260, 'TALK TO PARTNERSHIPS', 'pink');
      return V + h + V;
    });
  } },

  sponsors: { title: 'Sponsors & Partners', build: ctx => {
    secPageHero(ctx, 'Home / Sponsors & Partners', 'Our partners', 'The brands that make OPF happen.', { image: 'Partner collage', ctas: [['BECOME A PARTNER', 'primary']] });
    section(ctx, '02 Presented by', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'Presented by', null);
      const p = [['VENUE PARTNER', 'Okada Manila'], ['BROUGHT FROM JAPAN BY', 'CyberE'], ['ORGANIZED BY', 'Mineski Global']];
      y = grid(S, y, 3, 3, 1, (x, yy, w, i) => { T(S, x, yy, w, p[i][0], { size: 12, weight: 700, color: C.muted }); IMG(S, x, yy + 28, w, 140, p[i][1] + ' logo', { r: 12 }); return 168; });
      return y + V;
    });
    section(ctx, '03 Tiered logo walls', C.alt, S => {
      const V = V_(S); let y = V;
      [['DIAMOND', 2, 2, 140], ['GOLD', 3, 3, 110], ['SILVER', 8, 4, 80], ['MEDIA PARTNERS', 12, 6, 60]].forEach(t => {
        y += T(S, S.pad, y, S.cw, t[0], { size: 14, weight: 700, color: C.accent }) + 16;
        y = grid(S, y, S.m ? Math.min(t[1], 6) : t[1], t[2], t[2] > 2 ? 3 : t[2], (x, yy, w) => { IMG(S, x, yy, w, S.m ? Math.round(t[3] * 0.6) : t[3], 'LOGO', { r: 8, color: C.white }); return S.m ? Math.round(t[3] * 0.6) : t[3]; }) + 40;
      });
      if (S.m) { BTN(S, S.pad, y - 16, S.cw, 'SHOW ALL MEDIA PARTNERS', 'ghost'); y += 48; }
      return y + V - 40;
    });
    section(ctx, '04 Partner activations', C.white, S => {
      const V = V_(S); let y = H2(S, V, 'On the floor', 'How partners show up at OPF.');
      const a = [['On-site booths', 'Brand booths in all three halls'], ['Free sampling', 'Snacks and drinks for visitors'], ['Collab merch', 'Limited items made with partners']];
      y = imgCards(S, y, 3, 3, 1, 0.6, i => a[i][0], i => a[i][1], 'Activation photo');
      return y + V;
    });
    section(ctx, '05 Become a partner', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'Become a partner', 'Reach 30,000+ anime, gaming and pop culture fans.');
      const L = S.m ? { lx: S.pad, lw: S.cw, rx: S.pad, rw: S.cw } : twoCol(S);
      let ly = y;
      [['30,000+', 'visitors over 2 days'], ['18–34', 'core audience age'], ['1M+', 'social reach (TBC)']].forEach(s => { T(S, L.lx, ly, L.lw, s[0], { size: 30, weight: 700, color: C.accent }); T(S, L.lx, ly + 40, L.lw, s[1], { size: 15, color: C.muted }); ly += 84; });
      BTN(S, L.lx, ly, S.m ? S.cw : 300, 'DOWNLOAD SPONSOR DECK', 'ghost'); ly += 72;
      let ry = S.m ? ly : y;
      ry += field(S, L.rx, ry, L.rw, 'Company', 'Company name', { req: true });
      ry += field(S, L.rx, ry, L.rw, 'Your name', 'Full name', { req: true });
      ry += field(S, L.rx, ry, L.rw, 'Work email', 'name@company.com', { req: true });
      ry += field(S, L.rx, ry, L.rw, 'Budget range', 'Select…', { select: true });
      ry += field(S, L.rx, ry, L.rw, 'Message', 'Tell us about your goals', { h: 120 });
      BTN(S, L.rx, ry, S.m ? S.cw : 200, 'SEND INQUIRY');
      return Math.max(ly, ry + 48) + V;
    });
  } },

  contact: { title: 'Contact', build: ctx => {
    secPageHero(ctx, 'Home / Contact', 'Contact us', 'We reply within 2 business days.', { image: false });
    section(ctx, '02 Contact form & desks', C.white, S => {
      const V = V_(S); const L = S.m ? { lx: S.pad, lw: S.cw, rx: S.pad, rw: S.cw } : twoCol(S);
      let y = V;
      T(S, L.lx, y, L.lw, 'What is this about? *', { size: 13, weight: 700 }); y += 28;
      chipRow(S, L.lx, y, ['General', 'Tickets', 'Exhibitor', 'Sponsor', 'Media'], 0, L.lw); y += 60;
      y += field(S, L.lx, y, L.lw, 'Name', 'Full name', { req: true });
      y += field(S, L.lx, y, L.lw, 'Email', 'you@email.com', { req: true });
      y += field(S, L.lx, y, L.lw, 'Subject', 'Short summary');
      y += field(S, L.lx, y, L.lw, 'Message', 'How can we help?', { h: 140, req: true });
      y += checkbox(S, L.lx, y, L.lw, 'I agree to the Privacy Policy (RA 10173)') + 24;
      BTN(S, L.lx, y, S.m ? S.cw : 200, 'SEND MESSAGE'); y += 48;
      let ry = S.m ? y + 48 : V;
      R(S, L.rx, ry, L.rw, 380, C.alt, { name: 'Desk list', r: 16 });
      T(S, L.rx + 24, ry + 24, L.rw - 48, 'DIRECT DESKS', { size: 13, weight: 700, color: C.muted });
      [['General', 'info@ (TBC)'], ['Tickets', 'tickets@ (TBC)'], ['Exhibitors', 'exhibit@ (TBC)'], ['Sponsors', 'partners@ (TBC)'], ['Media', 'media@ (TBC)']].forEach((d, i) => { T(S, L.rx + 24, ry + 64 + i * 52, L.rw - 48, d[0], { size: 15, weight: 700 }); T(S, L.rx + 24, ry + 86 + i * 52, L.rw - 48, d[1], { size: 14, color: C.accent }); });
      ['FB', 'IG', 'X', 'TT'].forEach((s, i) => R(S, L.rx + 24 + i * 48, ry + 330, 36, 36, C.ph, { name: 'Social ' + s, ellipse: true }));
      ry += 380;
      return Math.max(y, ry) + V;
    });
  } },

  archive: { title: 'Past Events', build: ctx => {
    secPageHero(ctx, 'Home / Past Events', 'Past events', 'Look back at every Otaku Pop Fes.', { image: false });
    section(ctx, '02 Year cards', C.white, S => {
      const V = V_(S);
      const y = grid(S, V, 2, 3, 1, (x, yy, w, i) => { IMG(S, x, yy, w, 200, i ? 'Coming soon' : 'OPF 2026 key visual', { r: 12 }); T(S, x, yy + 216, w, i ? 'OPF 2027' : 'OPF 2026', { size: 22, weight: 700 }); T(S, x, yy + 248, w, i ? 'June 5–6, 2027 · you are here' : 'Apr 25–26, 2026 · Okada Manila', { size: 14, color: C.muted }); return 270; });
      return y + V;
    });
    section(ctx, '03 OPF 2026 recap', C.alt, S => {
      const V = V_(S); let y = H2(S, V, 'OPF 2026 recap', 'Archive page: /archive/2026 (read-only).');
      IMG(S, S.pad, y, S.cw, S.m ? 194 : 560, '▶ Highlights video', { r: 12 }); y += (S.m ? 194 : 560) + 32;
      y = grid(S, y, 4, 4, 2, (x, yy, w, i) => { const f = [['2 days', 'Apr 25–26'], ['20+', 'IP booths'], ['3', 'Music Live artists'], ['78', 'Cosplay runway entries']][i]; T(S, x, yy, w, f[0], { size: 28, weight: 700 }); T(S, x, yy + 38, w, f[1], { size: 14, color: C.muted }); return 64; }) + 32;
      y = grid(S, y, 8, 4, 2, (x, yy, w) => { IMG(S, x, yy, w, w * 0.75, 'Photo', { r: 8 }); return w * 0.75; }) + 24;
      BTN(S, S.pad, y, S.m ? S.cw : 240, 'FULL GALLERY', 'ghost');
      return y + 48 + V;
    });
  } },

  legal: { title: 'Legal (template)', build: ctx => {
    secPageHero(ctx, 'Home / Legal', 'Privacy Policy', 'Last updated: [date]', { image: false });
    section(ctx, '02 Policy body', C.white, S => {
      const V = V_(S); let y = V;
      const heads = ['1. Who we are', '2. What we collect', '3. How we use it', '4. Sharing', '5. Your rights (RA 10173)', '6. Contact'];
      let bx = S.pad, bw = S.cw;
      if (S.m) { R(S, S.pad, y, S.cw, 56, C.alt, { name: 'On this page (collapsed)', r: 12 }); T(S, S.pad + 20, y + 18, S.cw - 40, 'On this page  ▾', { size: 15, weight: 700 }); y += 80; }
      else {
        R(S, S.pad, y, 280, 330, C.alt, { name: 'Table of contents (sticky)', r: 12 });
        T(S, S.pad + 20, y + 20, 240, 'ON THIS PAGE', { size: 12, weight: 700, color: C.muted });
        heads.forEach((h, i) => T(S, S.pad + 20, y + 56 + i * 42, 240, h, { size: 14, weight: i ? 400 : 700, color: i ? C.ink : C.accent }));
        bx = S.pad + 340; bw = 760;
      }
      heads.forEach(h => { y += T(S, bx, y, bw, h, { size: 22, weight: 700 }) + 12; y += T(S, bx, y, bw, COPY + ' ' + COPY, { size: 16, color: C.muted }) + 32; });
      y += NOTE(S, bx, y, S.m ? S.cw : 600, 'One template for Privacy Policy, Terms of Use and Ticket Terms.');
      return y + V;
    });
  } },
};

const PAGE_ORDER = ['exhibition', 'cosplay', 'music', 'schedule', 'tickets', 'news', 'article', 'access', 'faq', 'joinus', 'sponsors', 'contact', 'archive', 'legal'];

function buildInner(key, x, mobile) {
  const p = PAGES[key];
  const ctx = newCtx(p.title + (mobile ? ' — Mobile 375' : ' — Desktop 1440'), x, mobile);
  secHeader(ctx);
  p.build(ctx);
  secFooter(ctx);
  finish(ctx);
  return ctx.root;
}

// ---------- entry point ----------
function removeBoards(prefixes) {
  let n = 0;
  (penpot.currentPage.root.children || []).slice().forEach(s => {
    if (s.name === 'svg' || prefixes.some(p => s.name.startsWith(p))) { s.remove(); n++; }
  });
  return n;
}

const SLOT0 = 5400, SLOTW = 2400; // inner pages sit to the right of Sitemap + Home, one column each

function buildByKey(key) {
  if (key === 'ds') return buildDesignSystem();
  if (key === 'home') {
    removeBoards(['Sitemap — ', 'Home — ']);
    const sm = buildSitemap();
    const d = buildHome(sm.x + sm.width + 400, false);
    const m = buildHome(d.x + d.width + 200, true);
    return [sm, d, m];
  }
  const i = PAGE_ORDER.indexOf(key), t = PAGES[key].title;
  removeBoards([t + ' — ']);
  const x = SLOT0 + i * SLOTW;
  return [buildInner(key, x, false), buildInner(key, x + 1640, true)];
}

penpot.ui.open('OPF27 Wireframes', 'https://bmcmbuenviaje.github.io/opf27-penpot-plugin/' + VERSION + '/ui.html', { width: 300, height: 640 });
penpot.ui.onMessage(msg => {
  if (!msg || msg.cmd !== 'build') return;
  try {
    console.log('OPF27 ' + VERSION + ' building', msg.key);
    const shapes = buildByKey(msg.key);
    if (penpot.viewport.zoomToShapes) penpot.viewport.zoomToShapes(shapes);
    console.log('OPF27 built', msg.key);
    penpot.ui.sendMessage({ status: 'Built ✓ ' + msg.key, key: msg.key });
  } catch (e) {
    console.error('OPF27 build error', msg.key, e);
    penpot.ui.sendMessage({ status: 'Error in ' + msg.key + ': ' + (e && e.message ? e.message : e) });
  }
});
