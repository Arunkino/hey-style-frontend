/**
 * Generates the HeyStyle favicon / app-icon set.
 *
 *   node gen.mjs
 *
 * The set that this replaced was exported straight out of a design tool, so
 * every file had the layout grid and the S path's bezier anchor points baked
 * into the pixels, and the purple artboard did not fill the square canvas.
 * Google renders favicons as a circle in search results, which cropped that
 * mess into the result row. Nothing here is hand-edited any more: the mark is
 * drawn from the same vector the QR badge uses, so the two can never drift.
 *
 * Requires: npm install sharp png-to-ico
 */
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(HERE, '../../public');
const OUT = `${PUBLIC}/favicon`;

// Same S swoosh as brand/qr/gen.mjs, read from the same file for the same
// reason: one copy of the artwork, so the icon and the QR badge stay identical.
const S_PATH = readFileSync(resolve(HERE, '../qr/s-path.txt'), 'utf8').trim();
const S_BOX = { x: 487.7, y: 431.5, w: 100.4, h: 200.4 };

const BRAND = '#8E6EE8';   // tailwind.config.js -> colors.primary
const INK = '#000000';     // 5.5:1 on BRAND; white would only manage 3.8:1

// How tall the S stands relative to the canvas.
//
// FULL is sized for a circular crop: Google insets search-result favicons into
// a circle the full width of the icon, so the mark's tips sit 0.31 of the
// canvas from centre against a 0.5 radius. The old files ran the mark to 0.89
// of the canvas, which is why the swoosh looked clipped and cramped.
//
// MASKABLE is for Android's adaptive icon, where the launcher may keep only the
// centre 80% and can mask it to a circle. A mark this tall needs to come in
// further than the usual 0.66 guidance to survive that.
const FULL = 0.62;
const MASKABLE = 0.50;

function icon(size, { ratio = FULL, background = BRAND, mark = INK } = {}) {
  const scale = (size * ratio) / S_BOX.h;
  const tx = size / 2 - (S_BOX.x + S_BOX.w / 2) * scale;
  const ty = size / 2 - (S_BOX.y + S_BOX.h / 2) * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" fill="${background}"/>
<g transform="translate(${tx} ${ty}) scale(${scale})"><path d="${S_PATH}" fill="${mark}"/></g>
</svg>
`;
}

// Rasterise from a 4x master rather than asking the SVG renderer for 16px
// directly — downsampling a large render keeps the thin tips of the swoosh
// from disappearing at favicon sizes.
async function png(size, opts) {
  return sharp(Buffer.from(icon(size * 4, opts)))
    .resize(size, size, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

mkdirSync(OUT, { recursive: true });

// The vector favicon. 512 viewBox purely so the numbers in it read like the
// PNGs'; it scales to anything.
writeFileSync(`${OUT}/favicon.svg`, icon(512));

const files = [
  // Google wants a square favicon whose side is a multiple of 48.
  [`${OUT}/favicon-96x96.png`, 96, {}],
  [`${OUT}/apple-touch-icon.png`, 180, {}],
  [`${OUT}/web-app-manifest-192x192.png`, 192, {}],
  [`${OUT}/web-app-manifest-512x512.png`, 512, {}],
  [`${OUT}/web-app-manifest-maskable-512x512.png`, 512, { ratio: MASKABLE }],
];

for (const [path, size, opts] of files) {
  writeFileSync(path, await png(size, opts));
  console.log(`${path.replace(PUBLIC, 'public').padEnd(52)} ${size}x${size}`);
}

// 48 is in here because that is the size Google actually looks for; 16 and 32
// are what browser tabs and bookmark bars pull.
const ico = await pngToIco(await Promise.all([16, 32, 48].map(s => png(s))));
for (const path of [`${OUT}/favicon.ico`, `${PUBLIC}/favicon.ico`]) {
  writeFileSync(path, ico);
  console.log(`${path.replace(PUBLIC, 'public').padEnd(52)} 16/32/48`);
}
