// Erzeugt die 5 Karussell-Bilder für den ersten Instagram-Post (1080 × 1350, Hochformat 4:5).
// Aufruf im Ordner "social":  npm run post-01
// Ergebnis: slide-1.svg … slide-5.svg und slide-1.png … slide-5.png in diesem Ordner.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const OUT = dirname(fileURLToPath(import.meta.url));
const W = 1080;
const H = 1350;
const TOTAL = 5;

// Farbwelt "modern mit Fantasy-Akzenten": warmes Dunkel, Glut-Orange, Pergament-Weiß
const C = {
  bg: '#1b1412',
  card: '#261c18',
  cardLine: '#3d2f29',
  text: '#f4ebe0',
  muted: '#c2b09e',
  accent: '#ee8a3c',
  ember: '#ffc27a',
  log: '#6b4a3a',
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Arial, sans-serif";

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const text = (x, y, s, { size = 40, font = SANS, fill = C.text, weight = 400, anchor = 'start', italic = false, spacing = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ''}${spacing ? ` letter-spacing="${spacing}"` : ''}>${esc(s)}</text>`;

const label = (s, y = 200, anchor = 'start', x = 96) =>
  text(x, y, s.toUpperCase(), { size: 30, weight: 700, fill: C.accent, spacing: 6, anchor });

// Einfaches Lagerfeuer-Symbol (Platzhalter, bis ein Logo von einem Menschen gestaltet ist)
const campfire = (cx, cy, s) => `
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <rect x="-62" y="52" width="124" height="18" rx="9" fill="${C.log}" transform="rotate(-14)"/>
    <rect x="-62" y="52" width="124" height="18" rx="9" fill="${C.log}" transform="rotate(14)"/>
    <path d="M0,-70 C30,-35 45,-10 45,15 A45,45 0 0 1 -45,15 C-45,-10 -30,-30 -12,-48 C-10,-30 -2,-22 4,-20 C8,-35 4,-55 0,-70 Z" fill="${C.accent}"/>
    <path d="M0,-8 C14,6 20,16 20,26 A20,20 0 0 1 -20,26 C-20,14 -11,3 0,-8 Z" fill="${C.ember}"/>
  </g>`;

const emberDot = (x, y, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.accent}"/>`;

const frame = (n, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="540" cy="1350" r="760" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0.26"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <circle cx="902" cy="1150" r="4" fill="${C.ember}" opacity="0.55"/>
  <circle cx="948" cy="1080" r="3" fill="${C.ember}" opacity="0.4"/>
  <circle cx="130" cy="1195" r="3" fill="${C.ember}" opacity="0.45"/>
  ${body}
  ${text(96, 1270, '@erzaehlfeuer', { size: 28, fill: C.muted })}
  ${text(984, 1270, `${n} / ${TOTAL}`, { size: 28, fill: C.muted, anchor: 'end' })}
</svg>`;

// ---------- Bild 1: Titel ----------
const slide1 = frame(1, `
  ${campfire(540, 420, 2.3)}
  ${label('Pen & Paper online', 680, 'middle', 540)}
  ${text(540, 830, 'Erzählfeuer', { size: 132, font: SERIF, anchor: 'middle' })}
  ${text(540, 930, 'Wo die Geschichte im', { size: 46, fill: C.muted, anchor: 'middle' })}
  ${text(540, 992, 'Mittelpunkt steht.', { size: 46, fill: C.muted, anchor: 'middle' })}
  ${text(540, 1170, 'Ein Projekt im Aufbau – folgt der Entwicklung →', { size: 30, fill: C.text, anchor: 'middle' })}
`);

// ---------- Bild 2: Problem ----------
const slide2 = frame(2, `
  ${label('Das Problem')}
  ${emberDot(110, 378)}
  ${text(150, 400, 'Wochen zwischen', { size: 76, font: SERIF })}
  ${text(150, 490, 'den Spielabenden.', { size: 76, font: SERIF })}
  ${emberDot(110, 638)}
  ${text(150, 660, 'Vergessene Namen.', { size: 76, font: SERIF })}
  ${emberDot(110, 808)}
  ${text(150, 830, 'Stunden an', { size: 76, font: SERIF })}
  ${text(150, 920, 'Vorbereitung.', { size: 76, font: SERIF })}
  ${text(96, 1110, 'Kennt ihr das?', { size: 64, font: SERIF, italic: true, fill: C.accent })}
`);

// ---------- Bild 3: Idee ----------
const card = (y, num, title, l1, l2) => `
  <rect x="96" y="${y}" width="888" height="230" rx="24" fill="${C.card}" stroke="${C.cardLine}" stroke-width="2"/>
  ${text(136, y + 64, num, { size: 28, weight: 700, fill: C.accent, spacing: 4 })}
  ${text(136, y + 118, title, { size: 48, font: SERIF })}
  ${text(136, y + 168, l1, { size: 32, fill: C.muted })}
  ${text(136, y + 208, l2, { size: 32, fill: C.muted })}`;

const slide3 = frame(3, `
  ${label('Die Idee')}
  ${card(300, '01', 'Erzählung statt Raster', 'Szenen, Stimmung und Beschreibung –', 'Kämpfe gehen auch ohne Taktikkarte.')}
  ${card(560, '02', 'Spiel zwischen den Abenden', 'Kleine Szenen am Handy – mit Nachricht,', 'sobald du an der Reihe bist.')}
  ${card(820, '03', 'Gedächtnis für die Spielleitung', '„Wie hieß nochmal der Wirt?“ –', 'die Kampagne merkt es sich.')}
`);

// ---------- Bild 4: Skizze der Szene am Handy ----------
const P = { x: 310, y: 290, w: 460, h: 860 };
const ph = {
  paper: '#f7f1e8', line: '#cbbfb0', tint: '#ece4d8', ink: '#2b211d', quiet: '#7a6a5d', chip: '#fbe3cf',
};
const ptext = (dx, y, s, o = {}) => text(P.x + dx, P.y + y, s, { fill: ph.ink, size: 20, ...o });
const prect = (dx, y, w, h, fill, opts = '') =>
  `<rect x="${P.x + dx}" y="${P.y + y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${ph.line}" stroke-width="2" ${opts}/>`;

const slide4 = frame(4, `
  ${label('Ein erster Blick')}
  ${text(96, 252, 'Eine Szene am Handy', { size: 44, font: SERIF })}
  <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="48" fill="${ph.paper}" stroke="${C.cardLine}" stroke-width="3"/>
  ${ptext(32, 72, '← Hafenmarkt', { size: 28, weight: 700 })}
  ${ptext(32, 104, 'Async · Mira, Thorin, Spielleitung', { size: 18, fill: ph.quiet })}
  <line x1="${P.x}" y1="${P.y + 128}" x2="${P.x + P.w}" y2="${P.y + 128}" stroke="${ph.line}" stroke-width="2"/>
  ${prect(24, 150, 412, 120, ph.tint)}
  ${ptext(48, 184, 'Spielleitung', { size: 18, weight: 700 })}
  ${ptext(48, 216, 'Der Fischhändler Joren mustert euch')}
  ${ptext(48, 244, 'misstrauisch. Was tut ihr?')}
  ${prect(24, 290, 412, 166, '#ffffff')}
  ${ptext(48, 324, 'Mira', { size: 18, weight: 700 })}
  ${ptext(48, 356, 'Ich lenke ihn mit Fragen ab und')}
  ${ptext(48, 384, 'greife nach dem Schlüsselbund.')}
  <rect x="${P.x + 44}" y="${P.y + 402}" width="372" height="36" rx="10" fill="${ph.chip}" stroke="${C.accent}" stroke-width="2"/>
  ${ptext(60, 427, 'Fingerfertigkeit: 17 (W20: 9 + 8)', { size: 19 })}
  ${prect(24, 476, 412, 64, '#ffffff')}
  ${ptext(48, 516, 'Spielleitung hat verdeckt gewürfelt', { size: 19, fill: ph.quiet })}
  ${prect(24, 560, 412, 100, ph.paper, 'stroke-dasharray="8 6"')}
  ${ptext(48, 596, 'Geflüstert an Mira', { size: 18, weight: 700 })}
  ${ptext(48, 630, 'Der Schlüssel passt zum Leuchtturm.')}
  ${prect(24, 760, 412, 72, '#ffffff')}
  ${ptext(48, 803, 'Deine Aktion …', { fill: ph.quiet })}
  <rect x="${P.x + 262}" y="${P.y + 772}" width="64" height="48" rx="10" fill="#ffffff" stroke="${ph.line}" stroke-width="2"/>
  ${ptext(294, 803, 'W20', { size: 19, anchor: 'middle' })}
  <rect x="${P.x + 334}" y="${P.y + 772}" width="90" height="48" rx="10" fill="${C.accent}"/>
  ${ptext(379, 803, 'Senden', { size: 19, weight: 700, fill: '#ffffff', anchor: 'middle' })}
  ${text(540, 1206, 'Skizze – noch nicht das fertige Design', { size: 26, fill: C.muted, anchor: 'middle', italic: true })}
`);

// ---------- Bild 5: Mitmachen ----------
const slide5 = frame(5, `
  ${label('Mach mit')}
  ${text(96, 330, 'Folgt der', { size: 84, font: SERIF })}
  ${text(96, 428, 'Entwicklung', { size: 84, font: SERIF })}
  ${text(96, 526, 'und redet mit.', { size: 84, font: SERIF, fill: C.accent })}
  ${emberDot(110, 652)}
  ${text(146, 666, 'Wöchentliche Einblicke in den Bau', { size: 40 })}
  ${emberDot(110, 732)}
  ${text(146, 746, 'Abstimmungen zu Look und Funktionen', { size: 40 })}
  ${emberDot(110, 812)}
  ${text(146, 826, 'Später: Testrunden mit euch', { size: 40 })}
  <line x1="96" y1="930" x2="984" y2="930" stroke="${C.cardLine}" stroke-width="2"/>
  ${text(96, 1010, 'Ganz ehrlich: Ich baue Erzählfeuer mit KI', { size: 34, fill: C.muted })}
  ${text(96, 1058, 'als Werkzeug – für Menschen am Tisch.', { size: 34, fill: C.muted })}
`);

const slides = [slide1, slide2, slide3, slide4, slide5];

slides.forEach((svg, i) => {
  const base = join(OUT, `slide-${i + 1}`);
  writeFileSync(`${base}.svg`, svg, 'utf8');
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { loadSystemFonts: true, defaultFontFamily: 'Segoe UI' },
  }).render().asPng();
  writeFileSync(`${base}.png`, png);
  console.log(`slide-${i + 1}.png erstellt`);
});
