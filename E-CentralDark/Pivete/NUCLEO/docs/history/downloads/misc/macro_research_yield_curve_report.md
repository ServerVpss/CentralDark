# OUTRO - macro_research_yield_curve_report.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\macro_research_yield_curve_report.js
**SHA:** 87cdf03f2fb6abb2
**Timestamp:** 2026-08-28T02:52:36.156700
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node build_deck.js

### Gaps
- const startX = 1.0, startY = 3.2, colW = 5.9, colGap = 0.3;
- const fx0 = 1.0, fy = 7.7, fw = 5.9, fgap = 0.4;
- const ix0 = 1.0, iy = 3.4, iw = 5.9, igap = 0.4;

### Ouro Bruto (primeiros 5000 chars)
```
// build_deck.js
// Recreates "Inverted_Yield_Curve.pptx" using pptxgenjs.
// Run:  node build_deck.js
// Output: Inverted_Yield_Curve.pptx in the working directory.

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// --- Custom slide size: 20" x 11.25" (matches source) ---
pres.defineLayout({ name: "CUSTOM", width: 20, height: 11.25 });
pres.layout = "CUSTOM";
pres.title = "The Inverted Yield Curve";
pres.author = "Macro Research";

// --- Palette ---
const C = {
    cream:      "F5F1EA",   // light background
    navy:       "0A1628",   // dark text on cream / dark bg variant
    navyDark:   "06101F",   // darker bg used on slides 4 & 9
    navyMid:    "1F2D40",   // body text on cream
    slate:      "5A6577",   // muted text on cream
    slateLite:  "8C97A8",   // muted text on dark
    iceBlue:    "C8D2E0",   // body text on dark
    iceBlue2:   "A8B3C4",
    iceBlue3:   "6B7689",
    orange:     "C8531A",   // accent
    peach:      "E89B6A",   // peach accent (dark slides)
    sand:       "C9BFAE",   // recession/shading on cream
    white:      "FFFFFF",
};

const FONT_H = "Arial";
const FONT_B = "Arial";

// ---------- Helpers ----------
function header(slide, num, section, rightText, opts = {}) {
    const onDark = !!opts.dark;
    const sectionColor = onDark ? C.iceBlue : C.navy;
    const numColor     = onDark ? C.slateLite : C.slate;
    const orangeColor  = C.orange;
    const ruleColor    = onDark ? C.iceBlue3 : C.slate;
    const rightColor   = onDark ? C.iceBlue : C.slate;

    // Top eyebrow: "NN  SECTION"
    slide.addText(
        [
            { text: num + "  ", options: { color: numColor, charSpacing: 4 } },
            { text: section,    options: { color: orangeColor, charSpacing: 4, bold: true } },
        ],
        { x: 1.0, y: 0.55, w: 12, h: 0.45,
          fontFace: FONT_H, fontSize: 13, margin: 0 }
    );

    // Right header text
    slide.addText(rightText, {
        x: 13, y: 0.55, w: 6, h: 0.45,
        fontFace: FONT_H, fontSize: 14, color: rightColor,
        align: "right", margin: 0,
    });

    // Thin divider line
    slide.addShape(pres.shapes.LINE, {
        x: 1.0, y: 1.15, w: 18.0, h: 0,
        line: { color: ruleColor, width: 0.5 },
    });
}

function footer(slide, leftText, rightText, opts = {}) {
    const onDark = !!opts.dark;
    const color = onDark ? C.slateLite : C.slate;
    slide.addText(leftText, {
        x: 1.0, y: 10.55, w: 8, h: 0.4,
        fontFace: FONT_B, fontSize: 12, color, align: "left", margin: 0,
    });
    slide.addText(rightText, {
        x: 11, y: 10.55, w: 8, h: 0.4,
        fontFace: FONT_B, fontSize: 12, color, align: "right", margin: 0,
    });
}

function bg(slide, dark = false) {
    slide.background = { color: dark ? C.navyDark : C.cream };
}

// =========================================================
// SLIDE 1 — Title
// =========================================================
{
    const s = pres.addSlide();
    bg(s, false);

    // Top row
    s.addText("MACRO RESEARCH  ·  VOL. XII", {
        x: 1.0, y: 0.7, w: 12, h: 0.5,
        fontFace: FONT_H, fontSize: 16, color: C.navy,
        bold: true, charSpacing: 6, margin: 0,
    });
    s.addText("April 2026", {
        x: 14, y: 0.7, w: 5, h: 0.5,
        fontFace: FONT_H, fontSize: 16, color: C.slate,
        align: "right", margin: 0,
    });

    // "A SPECIAL REPORT" eyebrow
    s.addText("A SPECIAL REPORT", {
        x: 1.0, y: 2.6, w: 8, h: 0.45,
        fontFace: FONT_H, fontSize: 16, color: C.orange,
        bold: true, charSpacing: 6, margin: 0,
    });

    // Big title — two lines, mixed roman/italic, mixed colors
    s.addText(
        [
            { text: "The Inverted ", options: { color: C.navy,   bold: false } },
            { text: "Yield",          options: { color: C.orange, italic: true } },
            { text: " ",              options: { color: C.navy } },
            { text: "Curve.",         options: { color: C.orange, italic: true, breakLine: false } },
        ],
        { x: 1.0, y: 3.15, w: 17, h: 3.4,
          fontFace: FONT_H, fontSize: 110, bold: true,
          margin: 0, valign: "top" }
    );

    // Subtitle (italic)
    s.addText("A history of the most reliable recession signal in modern finance — and what it is telling us today.", {
        x: 1.0, y: 6.95, w: 13, h: 1.2,
        fontFace: FONT_B, fontSize: 22, color: C.navyMid, italic: true,
        margin: 0, valign: "top",
    });

    // Bottom row
    s.addText("10Y 4.31  ·  2Y 3.81  ·  30Y 4.91  ·  10Y–2Y +0.50", {
        x: 1.0, y: 10.0, w: 12, h: 0.45,
        fontFace: FONT_H, fontSize: 14, color: C.slate, margin: 0,
    });
    s.addText("10 / Slides", {
        x: 14, y: 10.0, w: 5, h: 0.45,
        fontFace: FONT_H, fontSize: 14, color: C.slate, align: "right", margin: 0,
    });
}

// =========================================================
// SLIDE 2 — Definition / Primer
// =========================================================
{
    cons
```