// Erzeugt die 5 Karussell-Bilder für den zweiten Instagram-Post: Update #1 – Charakter-Assistent (1080 × 1350).
// Aufruf im Ordner "social":  npm run post-02
// Ergebnis: slide-1.svg … slide-5.svg und slide-1.png … slide-5.png in diesem Ordner.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const OUT = dirname(fileURLToPath(import.meta.url));
const W = 1080;
const H = 1350;
const TOTAL = 5;

// Dieselbe Farbwelt wie Post 1 und die App
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

// Lagerfeuer-Symbol (Platzhalter, bis ein Logo von einem Menschen gestaltet ist)
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

const card = (y, num, title, l1, l2, h = 230) => `
  <rect x="96" y="${y}" width="888" height="${h}" rx="24" fill="${C.card}" stroke="${C.cardLine}" stroke-width="2"/>
  ${text(136, y + 64, num, { size: 28, weight: 700, fill: C.accent, spacing: 4 })}
  ${text(136, y + 118, title, { size: 48, font: SERIF })}
  ${text(136, y + 168, l1, { size: 32, fill: C.muted })}
  ${text(136, y + 208, l2, { size: 32, fill: C.muted })}`;

// ---------- Bild 1: Titel ----------
const slide1 = frame(1, `
  ${campfire(540, 400, 2.1)}
  ${label('Update #1', 650, 'middle', 540)}
  ${text(540, 780, 'Dein Held', { size: 116, font: SERIF, anchor: 'middle' })}
  ${text(540, 900, 'in 6 Schritten', { size: 116, font: SERIF, anchor: 'middle', fill: C.accent })}
  ${text(540, 1010, 'Der Charakter-Assistent ist da.', { size: 46, fill: C.muted, anchor: 'middle' })}
  ${text(540, 1170, 'Wischt weiter, so sieht er aus →', { size: 30, anchor: 'middle' })}
`);

// ---------- Bild 2: Die 6 Schritte ----------
const STEPS = ['Spezies', 'Klasse', 'Hintergrund', 'Werte', 'Ausrüstung', 'Abschluss'];
const stepRows = STEPS.map((s, i) => {
  const y = 362 + i * 90;
  return `
  <circle cx="132" cy="${y - 14}" r="30" fill="${i < 5 ? C.accent : C.card}" stroke="${C.accent}" stroke-width="3"/>
  ${text(132, y - 2, String(i + 1), { size: 32, weight: 700, fill: i < 5 ? C.bg : C.accent, anchor: 'middle' })}
  ${text(196, y, s, { size: 52, font: SERIF })}`;
}).join('');
const progress = STEPS.map((_, i) => `<rect x="${96 + i * 150}" y="248" width="138" height="12" rx="6" fill="${i < 5 ? C.accent : C.cardLine}"/>`).join('');

const slide2 = frame(2, `
  ${label('Der Assistent')}
  ${progress}
  ${stepRows}
  ${text(96, 930, 'Die Regeln rechnet Erzählfeuer –', { size: 44, font: SERIF })}
  ${text(96, 990, 'du entscheidest nur.', { size: 44, font: SERIF, fill: C.accent })}
  <line x1="96" y1="1050" x2="984" y2="1050" stroke="${C.cardLine}" stroke-width="2"/>
  ${text(96, 1120, '9 Spezies · 4 Klassen · 58 Zauber · auf Deutsch', { size: 34, fill: C.muted })}
`);

// ---------- Bild 3: Skizze Charakterbogen am Handy ----------
const P = { x: 300, y: 270, w: 480, h: 880 };
const ph = { paper: '#f7f1e8', line: '#cbbfb0', tint: '#ece4d8', ink: '#2b211d', quiet: '#7a6a5d', chip: '#fbe3cf' };
const ptext = (dx, y, s, o = {}) => text(P.x + dx, P.y + y, s, { fill: ph.ink, size: 20, ...o });
const prect = (dx, y, w, h, fill, stroke = ph.line) =>
  `<rect x="${P.x + dx}" y="${P.y + y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;

const statTile = (dx, y, labelText, value) => `
  ${prect(dx, y, 136, 84, '#ffffff')}
  ${ptext(dx + 68, y + 30, labelText, { size: 15, weight: 700, fill: ph.quiet, anchor: 'middle', spacing: 1 })}
  ${ptext(dx + 68, y + 68, value, { size: 30, weight: 700, anchor: 'middle' })}`;

const abil = [['ST', '+0'], ['GE', '+2'], ['KO', '+3'], ['IN', '+5'], ['WE', '+1'], ['CH', '+0']];
const abilTiles = abil.map(([k, v], i) => {
  const dx = 28 + i * 72;
  return `${prect(dx, 330, 64, 78, i === 3 ? ph.chip : '#ffffff', i === 3 ? C.accent : ph.line)}
  ${ptext(dx + 32, 356, k, { size: 15, weight: 700, fill: ph.quiet, anchor: 'middle' })}
  ${ptext(dx + 32, 392, v, { size: 24, weight: 700, anchor: 'middle' })}`;
}).join('');

const skills = [['Akrobatik', '+2'], ['Arkane Kunde', '+7'], ['Geschichte', '+7'], ['Motiv erkennen', '+3']];
const skillRows = skills.map(([n, v], i) => {
  const y = 470 + i * 52;
  const hot = i === 1;
  return `${hot ? `<rect x="${P.x + 24}" y="${P.y + y - 34}" width="432" height="48" rx="10" fill="${ph.chip}" stroke="${C.accent}" stroke-width="2"/>` : ''}
  <circle cx="${P.x + 48}" cy="${P.y + y - 9}" r="7" fill="${i > 0 ? C.accent : 'none'}" stroke="${i > 0 ? C.accent : ph.quiet}" stroke-width="2"/>
  ${ptext(68, y, n, { size: 21 })}
  ${ptext(436, y, v, { size: 21, weight: 700, anchor: 'end' })}`;
}).join('');

// Finger-Hinweis: ein Kreis mit Wellen an der hervorgehobenen Zeile
const tap = (x, y) => `
  <circle cx="${x}" cy="${y}" r="16" fill="${C.accent}"/>
  <circle cx="${x}" cy="${y}" r="30" fill="none" stroke="${C.accent}" stroke-width="3" opacity="0.6"/>
  <circle cx="${x}" cy="${y}" r="46" fill="none" stroke="${C.accent}" stroke-width="2" opacity="0.3"/>`;

const slide3 = frame(3, `
  ${label('Der Charakterbogen', 160)}
  ${text(96, 228, 'Antippen = Würfeln', { size: 44, font: SERIF })}
  <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="48" fill="${ph.paper}" stroke="${C.cardLine}" stroke-width="3"/>
  ${ptext(32, 70, 'Elaria Sternwind', { size: 30, font: SERIF, weight: 700 })}
  ${ptext(32, 102, 'Hochelf · Magier · Stufe 1', { size: 19, fill: ph.quiet })}
  ${ptext(32, 150, 'Trefferpunkte', { size: 18, weight: 700 })}
  ${ptext(448, 150, '9 / 9', { size: 20, weight: 700, anchor: 'end' })}
  <rect x="${P.x + 32}" y="${P.y + 164}" width="416" height="14" rx="7" fill="${C.accent}"/>
  ${statTile(28, 206, 'RÜSTUNG', '12')}
  ${statTile(172, 206, 'INITIATIVE', '+2')}
  ${statTile(316, 206, 'BEWEGUNG', '9 m')}
  ${abilTiles}
  ${skillRows}
  ${tap(P.x + 360, P.y + 513)}
  <rect x="${P.x + 24}" y="${P.y + 690}" width="432" height="150" rx="16" fill="${C.bg}"/>
  ${ptext(48, 732, 'Elaria Sternwind würfelt', { size: 19, fill: C.muted })}
  ${ptext(48, 770, 'Arkane Kunde (Vorteil)', { size: 24, weight: 700, fill: C.text })}
  ${ptext(48, 810, '2W20: 17, 20 → 20 + 7', { size: 19, fill: C.muted })}
  ${ptext(432, 800, '27', { size: 64, weight: 700, fill: C.accent, anchor: 'end' })}
  ${text(540, 1210, 'Skizze – der Wurf landet direkt in der Szene', { size: 26, fill: C.muted, anchor: 'middle', italic: true })}
`);

// ---------- Bild 4: Fair und geheim ----------
const slide4 = frame(4, `
  ${label('Fair und geheim')}
  ${card(260, '01', 'Würfeln auf dem Server', 'Auch die Startwerte (4W6) – so kann', 'niemand heimlich neu würfeln.')}
  ${card(520, '02', 'Vorteil und Nachteil', 'Zwei W20, ein Tipp. Der bessere oder', 'schlechtere Wurf zählt automatisch.')}
  ${card(780, '03', 'Dein Bogen bleibt deiner', 'Alle Werte sehen nur du und die', 'Spielleitung. Die Runde sieht das Nötigste.')}
`);

// ---------- Bild 5: Abstimmung ----------
const option = (y, letter, title, sub) => `
  <rect x="96" y="${y}" width="888" height="140" rx="24" fill="${C.card}" stroke="${C.cardLine}" stroke-width="2"/>
  <circle cx="166" cy="${y + 70}" r="38" fill="${C.accent}"/>
  ${text(166, y + 84, letter, { size: 40, weight: 700, fill: C.bg, anchor: 'middle' })}
  ${text(232, y + 62, title, { size: 44, font: SERIF })}
  ${text(232, y + 106, sub, { size: 28, fill: C.muted })}`;

const slide5 = frame(5, `
  ${label('Ihr entscheidet')}
  ${text(96, 320, 'Was bauen wir', { size: 80, font: SERIF })}
  ${text(96, 414, 'als Nächstes?', { size: 80, font: SERIF, fill: C.accent })}
  ${option(480, 'A', 'Stufenaufstieg', 'Charaktere wachsen bis Stufe 5')}
  ${option(640, 'B', 'Kampf ohne Karte', 'Initiative, Trefferpunkte, Zustände')}
  ${option(800, 'C', 'Kampagnen-Gedächtnis', 'Wer war nochmal der Wirt?')}
  ${text(96, 1022, 'Stimmt in den Kommentaren ab: A, B oder C!', { size: 36 })}
  ${text(96, 1092, 'Gebaut mit KI als Werkzeug – für Menschen am Tisch.', { size: 28, fill: C.muted })}
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
