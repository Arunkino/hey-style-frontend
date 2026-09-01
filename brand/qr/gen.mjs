/**
 * Generates the HeyStyle app QR codes as print-ready SVG.
 *
 *   node gen.mjs                    -> the plain https://heystyle.in/app codes
 *   node gen.mjs poster-a counter   -> adds ?s=poster-a and ?s=counter variants
 *
 * The ?s= tag rides through to the page, lands in the enquiry sheet, and after
 * launch is forwarded into the Play Store install referrer — so each placement
 * can get its own QR while every one of them points at the same page.
 *
 * Requires: npm install qrcode
 */
import QRCode from 'qrcode';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = HERE;

// The S swoosh, lifted from the "Style" of public/HeyStyle_White.svg (path #39)
// so the QR mark and the site wordmark can never drift apart.
const S_PATH = readFileSync(`${HERE}/s-path.txt`, 'utf8').trim();
const S_BOX = { x: 487.7, y: 431.5, w: 100.4, h: 200.4 };

// Two audiences, two pages, two sets of codes. Pass a slug to switch:
//   node gen.mjs                      -> customer app codes  (/app)
//   node gen.mjs --partner            -> salon partner codes (/partner)
const PAGE = process.argv.includes('--partner')
  ? { slug: 'partner', label: 'partner' }
  : { slug: 'app', label: 'customer' };
const BASE_URL = `https://heystyle.in/${PAGE.slug}`;

// Four modules on every side. Below that, scanners stop being able to tell the
// symbol apart from whatever it is printed on.
const QUIET = 4;

const BRAND = '#8E6EE8';
const INK = '#120B22';
const DEEP = '#4C2A9E';

function roundedSquare(x, y, size, r) {
  return `M${x + r},${y}h${size - 2 * r}a${r},${r} 0 0 1 ${r},${r}` +
    `v${size - 2 * r}a${r},${r} 0 0 1 -${r},${r}` +
    `h-${size - 2 * r}a${r},${r} 0 0 1 -${r},-${r}` +
    `v-${size - 2 * r}a${r},${r} 0 0 1 ${r},-${r}z`;
}

function build(text, { moduleColor, eyeColor, background, logo }) {
  // Level H recovers ~30% of the symbol. That headroom is what pays for the
  // logo knocked out of the middle, so it is not optional here.
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const at = (r, c) => data[r * n + c];

  const M = 10;                    // user units per module; SVG scales freely
  const dim = (n + QUIET * 2) * M;
  const off = QUIET * M;

  // The three finder patterns are drawn by hand below, so skip their 7x7 blocks.
  const inFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);

  // The badge is drawn strictly INSIDE this cleared block. Letting it spill over
  // would clip neighbouring modules mid-dot and quietly eat error-correction
  // budget that the coverage figure below never accounts for.
  const clearModules = logo ? Math.round(n * 0.31) : 0;
  const logoStart = Math.floor((n - clearModules) / 2);
  const inLogo = (r, c) => logo &&
    r >= logoStart && r < logoStart + clearModules &&
    c >= logoStart && c < logoStart + clearModules;

  let dots = '';
  let cleared = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (inFinder(r, c)) continue;
      if (inLogo(r, c)) { if (at(r, c)) cleared++; continue; }
      if (!at(r, c)) continue;
      dots += `<path d="${roundedSquare(off + c * M, off + r * M, M, M * 0.32)}"/>`;
    }
  }

  let eyes = '';
  for (const [r, c] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    const x = off + c * M, y = off + r * M;
    // Outer ring as a single evenodd path, so the gap stays true background.
    eyes += `<path d="${roundedSquare(x, y, 7 * M, 7 * M * 0.28)} ` +
      `${roundedSquare(x + M, y + M, 5 * M, 5 * M * 0.24)}" fill-rule="evenodd"/>`;
    eyes += `<path d="${roundedSquare(x + 2 * M, y + 2 * M, 3 * M, 3 * M * 0.3)}"/>`;
  }

  let centre = '';
  if (logo) {
    const inset = M * 0.5;   // keeps a clear module of background ringing the badge
    const bx = off + logoStart * M + inset;
    const bw = clearModules * M - inset * 2;
    const scale = (bw * 0.72) / S_BOX.h;
    const tx = bx + bw / 2 - (S_BOX.x + S_BOX.w / 2) * scale;
    const ty = bx + bw / 2 - (S_BOX.y + S_BOX.h / 2) * scale;
    centre =
      `<path d="${roundedSquare(bx, bx, bw, bw * 0.26)}" fill="${background}"/>` +
      `<g transform="translate(${tx} ${ty}) scale(${scale})"><path d="${S_PATH}" fill="${logo}"/></g>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" shape-rendering="geometricPrecision">
<title>${text}</title>
<rect width="${dim}" height="${dim}" fill="${background}"/>
<g fill="${moduleColor}">${dots}</g>
<g fill="${eyeColor}">${eyes}</g>
${centre}
</svg>
`;

  const totalDark = data.reduce((a, b) => a + b, 0);
  return { svg, version: qr.version, n, coverage: (cleared / totalDark) * 100 };
}

// Rounded modules only. A pure-dot variant was built and tested too, but it
// decoded inconsistently across render sizes, so it is deliberately not shipped.
const STYLES = {
  'primary': { moduleColor: INK, eyeColor: BRAND, background: '#FFFFFF', logo: BRAND },
  'mono': { moduleColor: INK, eyeColor: INK, background: '#FFFFFF', logo: INK },
  'purple': { moduleColor: DEEP, eyeColor: DEEP, background: '#FFFFFF', logo: DEEP },
};

mkdirSync(OUT, { recursive: true });
const sources = process.argv.slice(2).filter(a => !a.startsWith('--'));
const targets = [['', BASE_URL], ...sources.map(s => [`-${s}`, `${BASE_URL}?s=${encodeURIComponent(s)}`])];

for (const [suffix, url] of targets) {
  for (const [style, cfg] of Object.entries(STYLES)) {
    const { svg, version, n, coverage } = build(url, cfg);
    const name = `heystyle-${PAGE.label}-qr-${style}${suffix}.svg`;
    writeFileSync(`${OUT}/${name}`, svg);
    console.log(`${name.padEnd(34)} v${version} ${n}x${n}  logo covers ${coverage.toFixed(1)}% of dark modules (level H allows ~30%)`);
  }
}
