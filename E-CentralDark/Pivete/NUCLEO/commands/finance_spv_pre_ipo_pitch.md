# COMANDO - finance_spv_pre_ipo_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_spv_pre_ipo_pitch.js
**SHA:** 009986a6e4e47ff6
**Timestamp:** 2026-08-28T02:52:34.121408
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- { sev: "HIGH", sevColor: C.RED,   risk: "Multiple compression at IPO",
- { sev: "HIGH", sevColor: C.RED,   risk: "Frontier-model commoditization",
- { sev: "MED",  sevColor: C.PEACH, risk: "Compute & power concentration",
- { sev: "MED",  sevColor: C.PEACH, risk: "Regulatory tightening",
- { sev: "MED",  sevColor: C.PEACH, risk: "Lock-up & secondary volatility",

### Gaps
- const colW = 2.95, colX0 = 0.55, gap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
// ============================================================
// Project Anthos — Investor Deck (Anthropic SPV)
// Recreates the 14-slide PPTX with pptxgenjs
//
// Usage:  npm i -g pptxgenjs && node build.js
//         -> produces Project-Anthos.pptx
// ============================================================

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

// ---------- Palette ----------
const C = {
  BG:           "1A1A1C",   // slide background
  CARD:         "222225",   // card fill
  CARD2:        "2A2A2D",   // alternate card fill
  LINE_DIM:     "3A3A3D",   // subtle dividers, OpenAI line
  LINE_DIMMER:  "4A4A4D",   // even more subtle
  MUTED:        "5A5A57",   // source notes, captions
  LABEL:        "8A8A87",   // labels, footer
  IVORY:        "EDEDE8",   // primary text
  PEACH:        "E8A87C",   // accent
  PEACH_DK:     "B8845C",   // darker peach (smaller stats)
  RED:          "C97064",   // BEAR
  RED_DK:       "A86056",
  GREEN:        "A9D18E",   // MOON
};

// ---------- Fonts ----------
const F_SERIF = "Georgia";
const F_SANS  = "Aptos";
const F_DISP  = "Aptos Display";

// ---------- Logo (embedded PNG, base64) ----------
const LOGO_B64 = "image/png;base64," +
  fs.readFileSync(path.join(__dirname, "logo.b64"), "utf8").trim();

// ---------- Presentation setup ----------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";             // 13.333" x 7.5"
pres.title = "Project Anthos";
pres.author = "Project Anthos";
const SW = 13.333, SH = 7.5;

// ============================================================
// Helpers
// ============================================================
function addBg(slide) {
  slide.background = { color: C.BG };
}

function addEyebrow(slide, text, y = 0.52) {
  // "/   SECTION NAME"
  slide.addText(
    [
      { text: "/", options: { color: C.PEACH, bold: false, fontFace: F_SANS } },
      { text: "   " + text, options: { color: C.PEACH, bold: true, fontFace: F_SANS, charSpacing: 6 } },
    ],
    { x: 0.55, y, w: 10, h: 0.35, fontSize: 11, margin: 0 }
  );
}

function addTitle(slide, text, y = 0.9) {
  slide.addText(text, {
    x: 0.55, y, w: 12.4, h: 0.85,
    fontSize: 30, fontFace: F_SERIF, color: C.IVORY,
    bold: false, valign: "top", margin: 0,
  });
}

function addSubtitle(slide, text, y = 1.62) {
  slide.addText(text, {
    x: 0.55, y, w: 12.2, h: 0.55,
    fontSize: 19, fontFace: F_SANS, color: C.LABEL,
    italic: true, valign: "top", margin: 0,
  });
}

function addSourcesLine(slide, text) {
  // Italic small source line above footer
  slide.addText(text, {
    x: 0.55, y: 6.63, w: 12.25, h: 0.38,
    fontSize: 9, fontFace: F_SANS, italic: true,
    color: C.MUTED, valign: "top", margin: 0,
  });
}

function addFooter(slide, pageNum, totalPages = 13) {
  // Thin divider
  slide.addShape(pres.shapes.LINE, {
    x: 0.55, y: 7.05, w: 12.25, h: 0,
    line: { color: C.LINE_DIM, width: 0.5 },
  });
  // Logo (tiny, 0.22")
  slide.addImage({
    data: LOGO_B64,
    x: 0.52, y: 7.14, w: 0.22, h: 0.22,
  });
  // Project Anthos / Confidential
  slide.addText(
    [
      { text: "PROJECT ANTHOS  /  CONFIDENTIAL", options: { color: C.LABEL, charSpacing: 4 } },
    ],
    { x: 0.82, y: 7.14, w: 6, h: 0.22,
      fontSize: 9, fontFace: F_SANS, bold: true, valign: "middle", margin: 0 }
  );
  // Page number
  slide.addText(`${String(pageNum).padStart(2, "0")} / ${totalPages}`, {
    x: 11.8, y: 7.14, w: 1.0, h: 0.22,
    fontSize: 9, fontFace: F_SANS, bold: true, color: C.LABEL,
    align: "right", valign: "middle", charSpacing: 4, margin: 0,
  });
}

function stdFrame(slide, eyebrow, title, subtitle, pageNum) {
  addBg(slide);
  addEyebrow(slide, eyebrow);
  addTitle(slide, title);
  if (subtitle) addSubtitle(slide, subtitle);
  addFooter(slide, pageNum);
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
function slide1() {
  const s = pres.addSlide();
  addBg(s);

  // Logo
  s.addImage({ data: LOGO_B64, x: 0.55, y: 2.85, w: 0.7, h: 0.7 });

  // Eyebrow: /   PROJECT ANTHOS
  s.addText(
    [
      { text: "/", options: { color: C.PEACH, fontFace: F_SANS } },
      { text: "   PROJECT ANTHOS", options: { color: C.PEACH, bold: true, fontFace: F_SANS, charSpacing: 6 } },
    ],
    { x: 0.55, y: 3.75, w: 8, h: 0.35, fontSize: 12, margin: 0 }
  );

  // Big title: Anthropic.
  s.addText("Anthropic.", {
    x: 0.55, y: 4.05, w: 12, h: 1.5,
    fontSize: 96, fontFace: F_SERIF, color: C.IVORY,
    valign: "top", margin: 0,
  });

  // Tagline
  s.addText("A $25M vehicle into the most consequential pre-IPO listing in technology.", {
    x: 0.55, y: 5.55, w: 12, h: 0.5,
    fontSize: 20, fontFace: F_SANS, italic: true, color: C.LABEL,
    valign: "top", margin: 0,
  });

  // Footer line
  s.addShape(pres.shapes.LINE, {
    x: 0.55, y: 6.85, w: 12.25, h: 0,
    line: { color: C.LINE_DIM, width: 0.5 },

```