import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public', 'placeholders');

const cream = '#F7F2EA';
const sage = '#E5E7DA';
const forest = '#2D5A43';
const ink = '#171717';
const blush = '#E8A0B0';
const gold = '#E3B341';
const blue = '#3D6FA8';
const brown = '#A56A43';
const beige = '#E6D3B8';
const white = '#FFFCF7';

function write(rel, contents) {
  const path = join(publicDir, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none">${body}</svg>\n`;
}

function blob(cx, cy, rx, ry, fill, opacity = 1) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}"/>`;
}

write(
  'brand/logo.svg',
  svg(
    220,
    56,
    `<text x="8" y="38" font-family="Georgia, serif" font-size="32" font-weight="700" fill="${forest}">Lulu3D</text>`,
  ),
);

write(
  'brand/mark.svg',
  svg(
    64,
    64,
    `<rect width="64" height="64" rx="16" fill="${forest}"/><text x="32" y="41" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="700" fill="${cream}">L</text>`,
  ),
);

function editorialScene(title, shapes) {
  return svg(
    1200,
    1400,
    `<rect width="1200" height="1400" fill="${sage}"/>
     ${blob(860, 420, 420, 380, cream, 0.9)}
     ${blob(380, 980, 360, 300, '#d8dcc8', 0.8)}
     ${shapes}
     <text x="80" y="1320" font-family="Georgia, serif" font-size="28" fill="${forest}" opacity="0.55">${title}</text>`,
  );
}

write(
  'editorial/hero-home.svg',
  editorialScene(
    'Hero · afventer foto',
    `${blob(760, 620, 260, 210, white)}
     <rect x="620" y="520" width="280" height="140" rx="40" fill="${gold}"/>
     <rect x="640" y="640" width="50" height="50" rx="16" fill="${ink}" opacity="0.2"/>
     <rect x="830" y="640" width="50" height="50" rx="16" fill="${ink}" opacity="0.2"/>
     <circle cx="420" cy="540" r="90" fill="${blush}"/>
     <rect x="300" y="780" width="160" height="220" rx="70" fill="${forest}"/>
     <rect x="880" y="860" width="140" height="180" rx="40" fill="${blue}"/>`,
  ),
);

write(
  'editorial/socks-campaign.svg',
  svg(
    1200,
    1200,
    `<rect width="1200" height="1200" fill="${cream}"/>
     ${blob(700, 560, 420, 380, sage)}
     <path d="M430 280c80-40 220-20 250 90 20 70-10 150 30 210 50 80 40 180-40 230-90 55-230 30-280-70-40-80-10-170-30-250-20-90 20-170 70-210z" fill="${blush}"/>
     <path d="M620 340c90-20 210 30 220 130 8 80-40 140-10 210 40 90-20 190-120 210-110 20-210-70-220-170-8-80 50-140 20-210-30-80 30-150 110-170z" fill="${forest}"/>
     <path d="M780 420c70-10 160 40 170 120 10 70-30 130 0 190 28 70-30 150-110 160-95 12-170-60-180-145-8-70 40-120 16-185-24-70 30-130 104-140z" fill="${gold}"/>`,
  ),
);

write(
  'editorial/brand-benefits.svg',
  svg(
    1200,
    1400,
    `<rect width="1200" height="1400" fill="${cream}"/>
     ${blob(640, 720, 480, 520, sage, 0.7)}
     <rect x="280" y="260" width="280" height="720" rx="140" fill="${forest}"/>
     <rect x="620" y="340" width="280" height="720" rx="140" fill="${blush}"/>
     <circle cx="420" cy="420" r="36" fill="${gold}"/>
     <circle cx="760" cy="500" r="28" fill="${white}"/>`,
  ),
);

function banner(title, w = 1600, h = 640) {
  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="${sage}"/>
     ${blob(w * 0.72, h * 0.5, w * 0.28, h * 0.42, cream, 0.85)}
     <rect x="${w * 0.58}" y="${h * 0.28}" width="${w * 0.16}" height="${h * 0.34}" rx="40" fill="${forest}"/>
     <circle cx="${w * 0.78}" cy="${h * 0.42}" r="${h * 0.16}" fill="${gold}"/>
     <rect x="${w * 0.7}" y="${h * 0.55}" width="${w * 0.14}" height="${h * 0.22}" rx="28" fill="${blush}"/>
     <text x="72" y="${h - 48}" font-family="Georgia, serif" font-size="26" fill="${forest}" opacity="0.55">${title}</text>`,
  );
}

write('editorial/catalog-banner.svg', banner('Katalog · afventer foto'));
write('editorial/sustainability-banner.svg', banner('Materialer · afventer foto', 1600, 560));
write('editorial/about-banner.svg', banner('Om os · afventer foto', 1600, 560));

write(
  'editorial/about-hero.svg',
  editorialScene(
    'Om os · afventer foto',
    `<rect x="520" y="360" width="240" height="320" rx="90" fill="${forest}"/>
     <circle cx="820" cy="520" r="120" fill="${gold}"/>
     <rect x="340" y="700" width="200" height="160" rx="50" fill="${blush}"/>`,
  ),
);

write(
  'editorial/about-uniqueness.svg',
  svg(
    1200,
    1200,
    `<rect width="1200" height="1200" fill="${cream}"/>
     ${blob(620, 600, 380, 340, sage)}
     <path d="M420 380c90-70 260-70 340 20 70 80 80 220 10 310-80 100-250 130-350 50-110-90-90-290 0-380z" fill="${forest}"/>
     <circle cx="700" cy="520" r="18" fill="${cream}" opacity="0.4"/>
     <circle cx="640" cy="620" r="12" fill="${cream}" opacity="0.35"/>`,
  ),
);

write(
  'editorial/contact-hero.svg',
  editorialScene(
    'Kontakt · afventer foto',
    `${blob(760, 640, 300, 340, cream)}
     <rect x="560" y="430" width="360" height="480" rx="180" fill="${brown}"/>
     <circle cx="740" cy="560" r="70" fill="${beige}"/>
     <rect x="360" y="760" width="180" height="220" rx="70" fill="${forest}"/>`,
  ),
);

const process = [
  ['process-design.svg', forest, 'Vi designer'],
  ['process-print.svg', blue, 'Vi printer'],
  ['process-pack.svg', blush, 'Vi pakker'],
  ['process-ship.svg', gold, 'Vi sender'],
];

for (const [file, color, label] of process) {
  write(
    `editorial/${file}`,
    svg(
      800,
      800,
      `<rect width="800" height="800" fill="${sage}"/>
       ${blob(420, 390, 250, 230, cream)}
       <rect x="250" y="250" width="300" height="280" rx="80" fill="${color}"/>
       <text x="80" y="740" font-family="Georgia, serif" font-size="28" fill="${forest}">${label}</text>`,
    ),
  );
}

function productCard(file, color, shape) {
  write(
    `products/${file}`,
    svg(
      1000,
      1000,
      `<rect width="1000" height="1000" fill="${cream}"/>
       ${blob(500, 520, 340, 300, sage, 0.55)}
       ${shape(color)}`,
    ),
  );
}

productCard(
  'bil-klassisk-1.svg',
  gold,
  (c) =>
    `<rect x="250" y="430" width="500" height="170" rx="70" fill="${c}"/><rect x="300" y="390" width="280" height="90" rx="40" fill="${c}"/><circle cx="370" cy="620" r="48" fill="${ink}" opacity="0.25"/><circle cx="640" cy="620" r="48" fill="${ink}" opacity="0.25"/>`,
);
productCard(
  'bil-klassisk-2.svg',
  forest,
  (c) =>
    `<rect x="280" y="450" width="460" height="150" rx="60" fill="${c}"/><rect x="340" y="400" width="240" height="80" rx="36" fill="${c}"/><circle cx="390" cy="620" r="42" fill="${ink}" opacity="0.2"/><circle cx="630" cy="620" r="42" fill="${ink}" opacity="0.2"/>`,
);
productCard(
  'bil-klassisk-3.svg',
  blush,
  (c) =>
    `<circle cx="500" cy="500" r="210" fill="${sage}"/><rect x="320" y="460" width="360" height="120" rx="50" fill="${c}"/>`,
);
productCard(
  'bil-klassisk-4.svg',
  blue,
  (c) =>
    `<rect x="220" y="420" width="560" height="180" rx="80" fill="${c}"/><rect x="260" y="380" width="220" height="90" rx="40" fill="${c}"/>`,
);
productCard(
  'bus-klassisk.svg',
  forest,
  (c) =>
    `<rect x="230" y="360" width="540" height="260" rx="50" fill="${c}"/><rect x="270" y="400" width="120" height="80" rx="16" fill="${cream}" opacity="0.35"/><rect x="420" y="400" width="120" height="80" rx="16" fill="${cream}" opacity="0.35"/><rect x="570" y="400" width="120" height="80" rx="16" fill="${cream}" opacity="0.35"/><circle cx="340" cy="650" r="46" fill="${ink}" opacity="0.25"/><circle cx="660" cy="650" r="46" fill="${ink}" opacity="0.25"/>`,
);
productCard(
  'vase-twist.svg',
  beige,
  (c) =>
    `<path d="M420 220c80 40 90 140 40 210 70 40 110 130 70 210-10 90-90 150-160 140-80-8-150-80-150-160 0-80 50-150 110-190-40-70-20-170 90-210z" fill="${c}"/>`,
);
productCard(
  'pen-holder.svg',
  ink,
  (c) =>
    `<rect x="330" y="360" width="340" height="320" rx="40" fill="${c}"/><rect x="380" y="280" width="36" height="160" rx="10" fill="${gold}"/><rect x="460" y="240" width="36" height="200" rx="10" fill="${blue}"/><rect x="540" y="300" width="36" height="140" rx="10" fill="${blush}"/>`,
);
productCard(
  'noeglering-navn.svg',
  gold,
  (c) =>
    `<circle cx="500" cy="430" r="90" fill="none" stroke="${c}" stroke-width="28"/><rect x="430" y="520" width="140" height="180" rx="24" fill="${c}"/><text x="500" y="625" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="${cream}">Aa</text>`,
);
productCard(
  'dino-mini.svg',
  forest,
  (c) =>
    `<ellipse cx="500" cy="560" rx="200" ry="140" fill="${c}"/><circle cx="620" cy="430" r="90" fill="${c}"/><circle cx="650" cy="410" r="10" fill="${cream}"/><path d="M300 520l-50-70 70 20z" fill="${c}"/>`,
);
productCard(
  'blaeksprutte-flex.svg',
  blush,
  (c) =>
    `<circle cx="500" cy="380" r="130" fill="${c}"/><path d="M390 480q20 180 0 280" stroke="${c}" stroke-width="36" stroke-linecap="round"/><path d="M450 500q10 190 20 270" stroke="${c}" stroke-width="36" stroke-linecap="round"/><path d="M520 500q-10 190 0 270" stroke="${c}" stroke-width="36" stroke-linecap="round"/><path d="M590 480q-20 180 10 280" stroke="${c}" stroke-width="36" stroke-linecap="round"/>`,
);
productCard(
  'hjerteaeske.svg',
  blush,
  () =>
    `<path d="M500 740c-180-140-260-260-260-360 0-90 70-150 150-150 50 0 80 20 110 60 30-40 60-60 110-60 80 0 150 60 150 150 0 100-80 220-260 360z" fill="${blush}"/>`,
);
productCard(
  'smiley-figur.svg',
  gold,
  (c) =>
    `<circle cx="500" cy="500" r="220" fill="${c}"/><circle cx="430" cy="450" r="22" fill="${ink}"/><circle cx="570" cy="450" r="22" fill="${ink}"/><path d="M400 560q100 80 200 0" stroke="${ink}" stroke-width="18" fill="none" stroke-linecap="round"/>`,
);
productCard(
  'plantepotte-riflet.svg',
  brown,
  (c) =>
    `<path d="M340 420h320l-40 300H380z" fill="${c}"/><rect x="320" y="380" width="360" height="50" rx="12" fill="${beige}"/><circle cx="500" cy="300" r="70" fill="${forest}"/>`,
);
productCard(
  'fidget-cube.svg',
  forest,
  (c) =>
    `<rect x="300" y="300" width="400" height="400" rx="48" fill="${c}"/><circle cx="500" cy="500" r="70" fill="${cream}" opacity="0.25"/><rect x="360" y="360" width="80" height="80" rx="16" fill="${cream}" opacity="0.2"/>`,
);
productCard(
  'hundefigur.svg',
  brown,
  (c) =>
    `<ellipse cx="500" cy="600" rx="210" ry="130" fill="${c}"/><circle cx="360" cy="480" r="80" fill="${c}"/><circle cx="330" cy="440" r="28" fill="${c}"/><circle cx="340" cy="470" r="8" fill="${ink}"/>`,
);
productCard(
  'opbevaringsboks.svg',
  white,
  (c) =>
    `<rect x="260" y="380" width="480" height="280" rx="28" fill="${forest}"/><rect x="280" y="360" width="440" height="50" rx="14" fill="${c}" stroke="${sage}" stroke-width="4"/>`,
);
productCard(
  'lysestage-bue.svg',
  beige,
  (c) =>
    `<path d="M300 720c0-220 400-220 400 0H300z" fill="${c}"/><rect x="470" y="280" width="60" height="220" rx="20" fill="${gold}"/>`,
);
productCard(
  'uro-cirkler.svg',
  white,
  () =>
    `<circle cx="500" cy="280" r="16" fill="${forest}"/><line x1="500" y1="296" x2="500" y2="420" stroke="${forest}" stroke-width="6"/><circle cx="430" cy="500" r="70" fill="none" stroke="${forest}" stroke-width="16"/><circle cx="580" cy="620" r="90" fill="none" stroke="${gold}" stroke-width="16"/><circle cx="470" cy="740" r="50" fill="none" stroke="${blush}" stroke-width="14"/>`,
);
productCard(
  'clips-holder.svg',
  blue,
  (c) =>
    `<ellipse cx="500" cy="560" rx="240" ry="80" fill="${c}"/><ellipse cx="500" cy="520" rx="200" ry="50" fill="${cream}"/>`,
);
productCard(
  'gavehaeng-stjerne.svg',
  gold,
  (c) =>
    `<polygon points="500,260 560,430 740,430 590,530 650,710 500,610 350,710 410,530 260,430 440,430" fill="${c}"/>`,
);
productCard(
  'ringholder.svg',
  blush,
  (c) =>
    `<polygon points="500,280 640,740 360,740" fill="${c}"/><ellipse cx="500" cy="740" rx="150" ry="24" fill="${beige}"/>`,
);
productCard(
  'bil-sport.svg',
  blue,
  (c) =>
    `<rect x="220" y="480" width="560" height="120" rx="50" fill="${c}"/><rect x="360" y="420" width="280" height="80" rx="30" fill="${c}"/><circle cx="360" cy="620" r="40" fill="${ink}" opacity="0.25"/><circle cx="680" cy="620" r="40" fill="${ink}" opacity="0.25"/>`,
);
productCard(
  'bogstoette.svg',
  forest,
  (c) =>
    `<path d="M300 280h160v440H300z" fill="${c}"/><path d="M460 720l260-200v200z" fill="${c}"/>`,
);

function sock(file, a, b, motif) {
  write(
    `products/${file}`,
    svg(
      1000,
      1000,
      `<rect width="1000" height="1000" fill="${cream}"/>
       ${blob(520, 540, 320, 300, sage, 0.45)}
       <path d="M430 180h160c30 0 50 20 50 50v320c80 30 150 120 130 210-20 110-150 170-250 130-90-40-140-150-110-240 10-30 20-50 20-70V230c0-30 20-50 50-50z" fill="${a}"/>
       ${motif(a, b)}`,
    ),
  );
}

sock(
  'sokker-citrus.svg',
  gold,
  forest,
  (_a, b) =>
    `<path d="M430 300h210M430 360h210M430 420h210" stroke="${b}" stroke-width="18"/>`,
);
sock(
  'sokker-boelge.svg',
  blue,
  cream,
  () =>
    `<path d="M430 340q50 30 105 0t105 0" stroke="${cream}" stroke-width="16" fill="none"/><path d="M430 420q50 30 105 0t105 0" stroke="${cream}" stroke-width="16" fill="none"/>`,
);
sock(
  'sokker-have.svg',
  forest,
  blush,
  (_a, b) =>
    `<circle cx="500" cy="340" r="14" fill="${b}"/><circle cx="560" cy="400" r="12" fill="${gold}"/><circle cx="470" cy="430" r="10" fill="${b}"/>`,
);
sock(
  'sokker-terrazzo.svg',
  beige,
  brown,
  () =>
    `<circle cx="490" cy="330" r="10" fill="${brown}"/><circle cx="550" cy="380" r="8" fill="${blush}"/><circle cx="470" cy="420" r="9" fill="${forest}"/><circle cx="540" cy="460" r="7" fill="${gold}"/>`,
);
sock(
  'sokker-nat.svg',
  ink,
  white,
  () =>
    `<circle cx="500" cy="350" r="6" fill="${white}"/><circle cx="540" cy="410" r="5" fill="${white}"/><circle cx="470" cy="450" r="4" fill="${white}"/>`,
);
sock(
  'sokker-koral.svg',
  blush,
  cream,
  () => `<path d="M450 360h160M450 420h160" stroke="${cream}" stroke-width="20"/>`,
);
sock(
  'sokker-skov.svg',
  forest,
  sage,
  () =>
    `<path d="M500 300c40 30 40 70 0 100-40-30-40-70 0-100z" fill="${sage}"/>`,
);
sock(
  'sokker-sol.svg',
  gold,
  cream,
  () => `<circle cx="510" cy="390" r="36" fill="${cream}"/>`,
);

write(
  'products/fallback.svg',
  svg(
    1000,
    1000,
    `<rect width="1000" height="1000" fill="${sage}"/><text x="500" y="520" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="${forest}">Billede mangler</text>`,
  ),
);

console.log('Placeholder assets written to public/placeholders');
