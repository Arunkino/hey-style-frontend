# HeyStyle app QR codes

Two audiences, two pages, two sets of codes. **Don't mix them up** — they look almost
identical side by side, so label anything you send to a printer.

| Codes | Points at | Audience | App |
|---|---|---|---|
| `heystyle-partner-qr-*` | https://heystyle.in/partner | Salon owners and staff | HeyStyle for Business (`com.heystyle.app`) |
| `heystyle-customer-qr-*` | https://heystyle.in/app | People booking appointments | Customer app (not yet built) |

Those URLs never change. When an app ships, fill in `STORE_LINKS` at the top of the
matching page — [`partner/index.html`](../../partner/index.html) or
[`app/index.html`](../../app/index.html) — and every already-printed code for that
audience starts forwarding to the store. Nothing needs reprinting.

## Files

Each audience has the same set:

| Suffix | Use |
|---|---|
| `-primary.svg` | Default. Near-black modules, brand purple eyes and mark. |
| `-mono.svg` | Single colour. For one-colour printing, engraving, embroidery. |
| `-purple.svg` | All deep purple, for layouts where black reads too harsh. |
| `-primary-2048.png` | 2048px raster, for print shops and chat apps that won't take SVG. |

Prefer the SVGs — they are vector, so they stay sharp at any size from a business
card to a shopfront banner.

## Placement tracking

Give each placement its own tag and you can tell which one is actually working:

```
npm install --no-save qrcode
node brand/qr/gen.mjs --partner salon-visit flyer
node brand/qr/gen.mjs poster counter
```

The first writes `heystyle-partner-qr-primary-salon-visit.svg` and so on, each encoding
`https://heystyle.in/partner?s=<tag>`; the second does the same for the customer page.
The tag lands in the enquiry Google Sheet next to every waitlist signup, and after
launch it is forwarded into the Play Store install referrer as `utm_source`.

Without `--partner` the generator always builds customer codes, so double-check the
filenames before sending anything to print.

Re-run the command any time you need a new placement. `qrcode` is only needed to
generate; `--no-save` keeps it out of `package.json`.

## Printing rules

These are what actually decide whether a code scans, so don't let a designer
"clean them up":

- **Keep the white border.** The four-module quiet zone is part of the code. Cropping
  to the edge of the pattern is the single most common way to break a QR.
- **Minimum 2cm × 2cm** for a code scanned at arm's length. For a poster read from
  across a room, budget roughly **1cm of code per metre of scanning distance**.
- **Dark on light only.** Don't invert them onto a dark background, and don't drop
  them onto a photo or a busy pattern.
- **Don't restyle the middle.** The mark is knocked into cleared modules with room to
  spare; enlarging it or moving it eats the error-correction budget that makes the
  logo possible at all.

## Verification

Generated at error correction level **H** (~30% recoverable), with the mark covering
**under 10%** of dark modules. Every variant was rasterised at 120, 200, 400 and 800px
and decoded — 26/26 returned the exact URL. Re-run `gen.mjs` and re-test if you change
colours or sizing.

The `S` in the mark is extracted from `public/HeyStyle_White.svg` (`s-path.txt`) so it
can't drift from the site wordmark.
