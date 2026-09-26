# COMANDO - finance_ai_fixed_income_briefing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_ai_fixed_income_briefing.js
**SHA:** a00ae2db521997bf
**Timestamp:** 2026-08-28T02:52:33.363433
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const rowStart = 2.25;

### Gaps
- const gap   = 0.2;
- const dotGap = 0.03;
- const chipGap = 0.12;
- const barW = 0.35, barH = 0.14, barGap = 0.06;
- const colGap = 0.4, rowGap = 0.6;

### Ouro Bruto (primeiros 5000 chars)
```
// AI-Driven Execution in Fixed Income — pptxgenjs replica
// Layout: 13.333" x 7.5" (LAYOUT_WIDE)
//
// Palette (from original):
//   Cream background    : F4F1EB
//   Near-black surface  : 14110F
//   Deepest black       : 0E0C0B
//   Primary ink         : 000000
//   White               : FFFFFF
//
// Typography: Helvetica (the source deck uses a Helvetica-family sans + italic
// Helvetica for display italics). Calibri is a safe fallback everywhere.

const pptxgen = require("pptxgenjs");

// ---------- palette & type ----------
const CREAM     = "F4F1EB";
const INK       = "14110F";
const INK_DEEP  = "0E0C0B";
const BLACK     = "000000";
const WHITE     = "FFFFFF";

// muted ink shades (for captions / rule lines on cream)
const MUTED     = "6E665A"; // body copy / secondary
const MUTED_2   = "8A8273"; // even lighter (eyebrows, footers)
const RULE      = "CFC6B5"; // thin rule lines on cream
const CARD_LINE = "D9D1BE"; // card border on cream

// on dark
const MUTED_D   = "8E887E";
const MUTED_D2  = "5A544C";
const RULE_D    = "3A332D";

const FONT_H = "Helvetica";
const FONT_B = "Helvetica";

const pres = new pptxgen();
pres.layout  = "LAYOUT_WIDE";        // 13.333 x 7.5
pres.author  = "Internal Briefing";
pres.title   = "AI-Driven Execution in Fixed Income";

const SW = 13.333, SH = 7.5;

// ---------- reusable helpers ----------

// Small diamond-in-diamond brand mark (like the ◈ glyph in the header)
function drawBrandmark(slide, x, y, size, color) {
    // Outer diamond outline
    slide.addShape(pres.shapes.DIAMOND, {
        x, y, w: size, h: size,
        fill: { type: "none" },
        line: { color, width: 0.75 },
    });
    // Inner filled diamond
    const inset = size * 0.34;
    slide.addShape(pres.shapes.DIAMOND, {
        x: x + inset / 2, y: y + inset / 2, w: size - inset, h: size - inset,
        fill: { color },
        line: { type: "none" },
    });
}

// Header bar used on slides 2–10.
// `theme` = "light" (cream) or "dark"
function addHeader(slide, { eyebrow, pageNum, theme = "light" }) {
    const ink    = theme === "dark" ? WHITE : INK;
    const muted  = theme === "dark" ? MUTED_D : MUTED_2;
    const rule   = theme === "dark" ? RULE_D : RULE;

    // Brand mark
    drawBrandmark(slide, 0.62, 0.54, 0.24, ink);

    // "AI × FIXED INCOME"
    slide.addText("AI × FIXED INCOME", {
        x: 0.98, y: 0.48, w: 3.2, h: 0.36,
        fontFace: FONT_H, fontSize: 11, bold: true,
        color: ink, charSpacing: 4, margin: 0,
        valign: "middle",
    });

    // short rule between brand and section eyebrow
    slide.addShape(pres.shapes.LINE, {
        x: 3.85, y: 0.66, w: 0.45, h: 0,
        line: { color: rule, width: 0.75 },
    });

    // Section eyebrow (e.g. "— CONTEXT")
    slide.addText(`— ${eyebrow}`, {
        x: 4.42, y: 0.48, w: 3.2, h: 0.36,
        fontFace: FONT_H, fontSize: 10.5,
        color: muted, charSpacing: 4, margin: 0,
        valign: "middle",
    });

    // Page counter at right
    slide.addText(`${pageNum} / 10`, {
        x: SW - 1.6, y: 0.48, w: 1.0, h: 0.36,
        fontFace: FONT_H, fontSize: 10.5,
        color: muted, align: "right", charSpacing: 3, margin: 0,
        valign: "middle",
    });
}

// Shared "eyebrow + big headline + deck copy" block used by most content slides.
function addSectionIntro(slide, { eyebrow, headline, body, theme = "light" }) {
    const ink   = theme === "dark" ? WHITE : INK;
    const muted = theme === "dark" ? MUTED_D : MUTED;

    slide.addText(eyebrow, {
        x: 0.62, y: 1.22, w: 8, h: 0.32,
        fontFace: FONT_H, fontSize: 11, bold: true,
        color: ink, charSpacing: 4, margin: 0,
    });

    slide.addText(headline, {
        x: 0.62, y: 1.55, w: 11.5, h: 1.5,
        fontFace: FONT_H, fontSize: 34, bold: false,
        color: ink, margin: 0, valign: "top",
    });

    if (body) {
        slide.addText(body, {
            x: 0.62, y: 3.05, w: 10, h: 0.9,
            fontFace: FONT_B, fontSize: 13,
            color: muted, margin: 0, valign: "top",
        });
    }
}

// chip / pill label (thin rounded rect with text inside)
function addChip(slide, x, y, w, h, text, { color = INK, border = CARD_LINE, tiny = false } = {}) {
    slide.addShape(pres.shapes.RECTANGLE, {
        x, y, w, h,
        fill: { color: CREAM },
        line: { color: border, width: 0.5 },
    });
    slide.addText(text, {
        x, y, w, h,
        fontFace: FONT_B, fontSize: tiny ? 8.5 : 10.5,
        color, align: "center", valign: "middle",
        charSpacing: tiny ? 2 : 0.5, margin: 0,
    });
}

// ================================================================
// SLIDE 1 — Cover (split layout: cream left, black right panel)
// ================================================================
{
    const s = pres.addSlide();
    s.background = { color: CREAM };

    // Right dark panel (covers right ~38% of slide)
    const panelX = 8.30;
    s.addShape(pres.shapes.RECTANGLE, {
        x: panelX, y: 0, w: SW - panelX, h
```