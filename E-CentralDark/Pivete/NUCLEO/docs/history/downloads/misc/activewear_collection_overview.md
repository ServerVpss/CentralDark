# OUTRO - activewear_collection_overview.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\activewear_collection_overview.js
**SHA:** c1fec9a17c242a24
**Timestamp:** 2026-08-28T02:52:31.767007
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.18;
- const gap = 0.22;
- const gap = 0.2;

### Ouro Bruto (primeiros 5000 chars)
```
// crave_active.js
// Recreates the "Crave Active SS26 / Collection Overview" deck with pptxgenjs.
// Usage: node crave_active.js   →   writes Crave_Active.pptx

const pptxgen = require("pptxgenjs");

// ---------- Design system ----------
const BG        = "0A0A0A";  // slide background (near-black)
const CARD      = "141414";  // card fill
const BORDER    = "2A2A2A";  // hairline border
const RULE      = "2A2A2A";  // thin separator rules
const ACCENT    = "FF4A2E";  // coral / orange-red
const MUTED     = "6B6B6B";  // label / footer gray
const MUTED_2   = "9A9A9A";  // lighter muted
const BODY      = "E8E8E8";  // body text
const WHITE     = "FFFFFF";

const FONT_H    = "Helvetica";
const FONT_B    = "Helvetica";

// Slide size = LAYOUT_WIDE: 13.333" × 7.5"
const SW = 13.333;
const SH = 7.5;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Crave Active — SS26 Collection Overview";
pres.author = "Crave Active";

// ---------- Shared helpers ----------
function addBackground(slide) {
    slide.background = { color: BG };
}

// Top header bar: brand (left) · section (center) · page N / 10 (right)
function addHeader(slide, section, pageNum) {
    // Circled X mark (approximated with a ring + an X made of two thin lines)
    const cx = 0.65, cy = 0.78, r = 0.12;
    slide.addShape(pres.shapes.OVAL, {
        x: cx - r, y: cy - r, w: r * 2, h: r * 2,
        fill: { type: "none" },
        line: { color: MUTED, width: 0.75 }
    });
    // X inside the circle (two diagonal lines)
    const d = r * 0.55;
    slide.addShape(pres.shapes.LINE, {
        x: cx - d, y: cy - d, w: d * 2, h: d * 2,
        line: { color: MUTED, width: 0.75 }
    });
    slide.addShape(pres.shapes.LINE, {
        x: cx - d, y: cy + d, w: d * 2, h: -d * 2,
        line: { color: MUTED, width: 0.75 }
    });

    // Brand wordmark
    slide.addText("CRAVE ACTIVE", {
        x: 0.95, y: 0.55, w: 3.5, h: 0.45,
        fontFace: FONT_H, fontSize: 11, bold: true,
        color: MUTED_2, charSpacing: 3, margin: 0, valign: "middle"
    });

    // Section label (centered)
    slide.addText(section, {
        x: SW / 2 - 3, y: 0.55, w: 6, h: 0.45,
        fontFace: FONT_H, fontSize: 11, bold: true,
        color: MUTED_2, charSpacing: 3, align: "center", margin: 0, valign: "middle"
    });

    // Page indicator
    slide.addText(`${String(pageNum).padStart(2, "0")} / 10`, {
        x: SW - 2.1, y: 0.55, w: 1.8, h: 0.45,
        fontFace: FONT_H, fontSize: 11, bold: true,
        color: MUTED_2, charSpacing: 3, align: "right", margin: 0, valign: "middle"
    });
}

// Small filled orange square used as a bullet/marker
function addSquareMarker(slide, x, y, size = 0.09) {
    slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w: size, h: size,
        fill: { color: ACCENT }, line: { type: "none" }
    });
}

// ===================================================================
// SLIDE 1 — Cover
// ===================================================================
{
    const s = pres.addSlide();
    addBackground(s);
    addHeader(s, "SS26 / COLLECTION OVERVIEW", 1);

    // Big wordmark: "CRAVE ACTIVE." with ACTIVE. in coral
    s.addText(
        [
            { text: "CRAVE ",   options: { color: WHITE,  bold: true } },
            { text: "ACTIVE.",  options: { color: ACCENT, bold: true } },
        ],
        {
            x: 0.85, y: 2.1, w: 12, h: 1.8,
            fontFace: FONT_H, fontSize: 110, margin: 0, valign: "top"
        }
    );

    // Tagline
    s.addText("Activewear engineered for\nappetite.", {
        x: 0.85, y: 4.55, w: 6, h: 1.1,
        fontFace: FONT_B, fontSize: 22, color: BODY, margin: 0, valign: "top"
    });

    // Footer row
    s.addText("MEN'S + WOMEN'S / APRIL 2026", {
        x: 0.85, y: 6.75, w: 6, h: 0.4,
        fontFace: FONT_H, fontSize: 11, bold: true,
        color: MUTED_2, charSpacing: 3, margin: 0, valign: "middle"
    });
    s.addText("01 / 10", {
        x: SW - 2.1, y: 6.75, w: 1.8, h: 0.4,
        fontFace: FONT_H, fontSize: 11, bold: true,
        color: MUTED_2, charSpacing: 3, align: "right", margin: 0, valign: "middle"
    });
}

// ===================================================================
// SLIDE 2 — The Brand / Manifesto
// ===================================================================
{
    const s = pres.addSlide();
    addBackground(s);
    addHeader(s, "THE BRAND", 2);

    // Section tag
    s.addText(
        [
            { text: "01 — ", options: { color: ACCENT } },
            { text: "MANIFESTO", options: { color: ACCENT } },
        ],
        {
            x: 0.85, y: 1.8, w: 6, h: 0.4,
            fontFace: FONT_H, fontSize: 12, bold: true, charSpacing: 3,
            margin: 0, valign: "middle"
        }
    );

    // Headline: Movement, with appetite.
    s.addText(
        [
            { text: "Movement, ", options: { color: WHITE,   bold: true } },
            { text: "with\n",      options: { color: MUTED_2, bold: true } }
```