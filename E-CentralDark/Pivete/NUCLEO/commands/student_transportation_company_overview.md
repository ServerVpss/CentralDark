# COMANDO - student_transportation_company_overview.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\student_transportation_company_overview.js
**SHA:** 397e030ad89d60da
**Timestamp:** 2026-08-28T02:52:37.087695
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node build_deck.js

### Gaps
- const rowGap = 0.4;
- const smGap = 0.2;
- const gap = 0.35;
- const colGap = 0.8;

### Ouro Bruto (primeiros 5000 chars)
```
// build_deck.js
// Recreates "District Student Transit — Company Overview" deck using pptxgenjs.
// Run:  node build_deck.js
// Output: District_Transportation_1.pptx

const pptxgen = require("pptxgenjs");

// ---------- Palette ----------
const COLOR_CREAM      = "F4EFE6"; // page background
const COLOR_NAVY       = "162B44"; // dark panels / dark slides
const COLOR_RUST       = "B4502E"; // accent (rust / terracotta)
const COLOR_RUST_SOFT  = "D98E6E"; // lighter rust (on dark bg)
const COLOR_INK        = "1E1D1B"; // near-black for body on cream
const COLOR_INK_SOFT   = "5C554F"; // muted body text on cream
const COLOR_HAIRLINE   = "C9BEA8"; // hairline dividers on cream
const COLOR_HAIRLINE_D = "2E4057"; // hairline dividers on navy
const COLOR_MUTED_DARK = "8A97A8"; // muted text on navy
const COLOR_CREAM_DIM  = "E5DECF"; // placeholder image tiles
const COLOR_CREAM_2    = "EBE2D0"; // slightly warmer cream (photo tile fill)

// ---------- Fonts ----------
const FONT_SERIF = "Georgia";            // headlines, big numbers, body display
const FONT_MONO  = "Consolas";           // eyebrow labels, footers, small caps feel
const FONT_SANS  = "Calibri";            // secondary body text

// ---------- Layout (matches original 20 x 11.25) ----------
const SW = 20;       // slide width in inches
const SH = 11.25;    // slide height in inches

// ---------- Instance ----------
const pres = new pptxgen();
pres.defineLayout({ name: "CUSTOM_20x11_25", width: SW, height: SH });
pres.layout = "CUSTOM_20x11_25";
pres.title = "District Student Transit — Company Overview";
pres.author = "District Student Transit";

// ---------- Shared helpers ----------

// Header/wordmark (top-left), variant for cream or navy backgrounds
function addWordmark(slide, onDark = false) {
    const titleColor = onDark ? "FFFFFF" : COLOR_INK;
    // Small rust square
    slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.95, y: 0.55, w: 0.22, h: 0.22,
        fill: { color: COLOR_RUST }, line: { color: COLOR_RUST, width: 0 }
    });
    // Wordmark
    slide.addText("DISTRICT STUDENT TRANSIT", {
        x: 1.3, y: 0.45, w: 6, h: 0.4,
        fontFace: FONT_MONO, fontSize: 14, bold: true,
        color: titleColor, charSpacing: 3, valign: "middle", margin: 0
    });
}

// Top-right eyebrow breadcrumb, e.g. "02 · AT A GLANCE"
function addBreadcrumb(slide, text, onDark = false) {
    slide.addText(text, {
        x: SW - 8.0 - 0.95, y: 0.45, w: 8.0, h: 0.4,
        fontFace: FONT_MONO, fontSize: 13,
        color: onDark ? COLOR_MUTED_DARK : COLOR_INK_SOFT,
        charSpacing: 3, align: "right", valign: "middle", margin: 0
    });
}

// Bottom-left tagline + bottom-right "NN / 11" pager
function addFooter(slide, leftText, pageNum, onDark = false) {
    const footerY = SH - 0.75;
    slide.addText(leftText, {
        x: 0.95, y: footerY, w: 10, h: 0.4,
        fontFace: FONT_MONO, fontSize: 13,
        color: onDark ? COLOR_MUTED_DARK : COLOR_INK_SOFT,
        charSpacing: 1, valign: "middle", margin: 0
    });
    slide.addText(`${String(pageNum).padStart(2, "0")} / 11`, {
        x: SW - 3.0 - 0.95, y: footerY, w: 3.0, h: 0.4,
        fontFace: FONT_MONO, fontSize: 13,
        color: onDark ? COLOR_MUTED_DARK : COLOR_INK_SOFT,
        charSpacing: 1, align: "right", valign: "middle", margin: 0
    });
}

// A full-width thin hairline
function addHairline(slide, x, y, w, color = COLOR_HAIRLINE) {
    slide.addShape(pres.shapes.LINE, {
        x: x, y: y, w: w, h: 0,
        line: { color: color, width: 0.75 }
    });
}

// Eyebrow label (rust, tracked, uppercase-style)
function addEyebrow(slide, text, x, y, w) {
    slide.addText(text, {
        x: x, y: y, w: w, h: 0.4,
        fontFace: FONT_MONO, fontSize: 13, bold: false,
        color: COLOR_RUST, charSpacing: 3, valign: "middle", margin: 0
    });
}

// Large stat "100" + small unit "%" (like 10yr, 100%, 50+)
// `onDark` switches colors for navy slides.
function addStat(slide, big, unit, x, y, big_size = 96, unit_size = 36, onDark = false) {
    const numColor = onDark ? "FFFFFF" : COLOR_INK;
    const unitColor = onDark ? COLOR_RUST_SOFT : COLOR_RUST;
    // Big number
    slide.addText(big, {
        x: x, y: y, w: 3.2, h: big_size / 72 + 0.3,
        fontFace: FONT_SERIF, fontSize: big_size, bold: false,
        color: numColor, valign: "top", margin: 0
    });
    // Approx width of the big number so the unit sits right next to it
    // Georgia digits roughly 0.55x font-size wide at given pt; tuned by eye.
    const digitWidth = (big_size / 72) * 0.55;
    const numWidth = digitWidth * big.length;
    slide.addText(unit, {
        x: x + numWidth + 0.05,
        y: y + (big_size - unit_size) / 72 + 0.15, // sit on same baseline-ish
        w: 1.6, h: unit_size / 72 + 0.3,
        fontFace: FONT_SERIF, fontSize: unit_size, italic: false,
        color: unitColor, valign: "top", margin: 0
    });
}

// =====================================================================
// SLIDE 
```