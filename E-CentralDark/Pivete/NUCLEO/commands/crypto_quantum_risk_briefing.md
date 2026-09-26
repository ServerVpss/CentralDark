# COMANDO - crypto_quantum_risk_briefing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\crypto_quantum_risk_briefing.js
**SHA:** 590ca07e2ed01687
**Timestamp:** 2026-08-28T02:52:33.209411
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let segStart = barX;
- const seg3Start = barX + segWidths[0] + segWidths[1] + segWidths[2];

### Gaps
- const gap = 0.55;

### Ouro Bruto (primeiros 5000 chars)
```
// Quantum x Bitcoin — Investor Briefing
// Rebuilds Quantum_Computing.pptx using pptxgenjs
// Layout: 13.33" x 7.5" (LAYOUT_WIDE)

const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

pres.layout = "LAYOUT_WIDE";
pres.title = "Quantum x Bitcoin — An Investor Briefing";
pres.author = "Point Break Partners";

// ============================================================
// PALETTE
// ============================================================
const C = {
  cream:     "F4EFE6",   // light bg
  creamAlt:  "EBE5D8",   // darker cream
  ink:       "14110D",   // primary dark text
  inkSoft:   "3A342B",   // secondary dark
  muted:     "6B6357",   // tertiary / labels
  dark:      "0A0907",   // deep dark bg
  darkAlt:   "0E0C09",
  orange:    "C46E00",   // brand accent 1
  btcOrange: "F7931A",   // brand accent 2 (bitcoin)
  red:       "B31C1C",
  redDark:   "8A0E0E",
  green:     "2E6B3C",
  greenDark: "1E4A2A",
};

const W = 13.33;  // slide width
const H = 7.5;    // slide height

// ============================================================
// HEADER & FOOTER (applied per-slide because colors vary)
// ============================================================
function addFrame(slide, opts) {
  const bg       = opts.bg       || C.cream;
  const ink      = opts.ink      || C.ink;
  const muted    = opts.muted    || C.muted;
  const section  = opts.section  || "§ 00 · SECTION";
  const pageNum  = opts.pageNum  || "01";
  const tag      = opts.tag      || "TAG";
  const totalPages = "15";

  slide.background = { color: bg };

  // top rule
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 0.56, w: W - 1.0, h: 0,
    line: { color: muted, width: 0.5 },
  });

  // top-left: section
  slide.addText(section, {
    x: 0.5, y: 0.3, w: 6, h: 0.3,
    fontFace: "Arial", fontSize: 10, color: muted,
    bold: false, charSpacing: 4, margin: 0, valign: "middle",
  });

  // top-right: QUANTUM × BITCOIN
  slide.addText("QUANTUM × BITCOIN", {
    x: W - 6.5, y: 0.3, w: 6, h: 0.3,
    fontFace: "Arial", fontSize: 10, color: muted,
    bold: false, charSpacing: 4, margin: 0, valign: "middle", align: "right",
  });

  // bottom rule
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: H - 0.55, w: W - 1.0, h: 0,
    line: { color: muted, width: 0.5 },
  });

  // bottom-left: № XX / 15
  slide.addText(`№ ${pageNum} / ${totalPages}`, {
    x: 0.5, y: H - 0.45, w: 4, h: 0.3,
    fontFace: "Arial", fontSize: 10, color: muted,
    charSpacing: 4, margin: 0, valign: "middle",
  });

  // bottom-right: tag
  slide.addText(tag, {
    x: W - 6.5, y: H - 0.45, w: 6, h: 0.3,
    fontFace: "Arial", fontSize: 10, color: muted,
    charSpacing: 4, margin: 0, valign: "middle", align: "right",
  });
}

// ============================================================
// SLIDE 1 — COVER
// ============================================================
{
  const s = pres.addSlide();
  addFrame(s, {
    bg: C.cream, ink: C.ink, muted: C.muted,
    section: "BRIEFING  № 01",
    pageNum: "01", tag: "COVER",
  });

  // eyebrow
  s.addText("AN INVESTOR BRIEFING  ·  APRIL 2026", {
    x: 0.5, y: 1.1, w: 10, h: 0.4,
    fontFace: "Arial", fontSize: 12, color: C.muted,
    bold: false, charSpacing: 4, margin: 0,
  });

  // Big headline: "Q-Day. Quantum computing's collision course with Bitcoin."
  s.addText([
    { text: "Q-Day. ", options: { color: C.ink, bold: false } },
    { text: "Quantum computing's", options: { color: C.ink, italic: true } },
    { text: " collision course with ", options: { color: C.ink } },
    { text: "Bitcoin.", options: { color: C.orange, bold: false } },
  ], {
    x: 0.5, y: 1.8, w: 10.8, h: 2.8,
    fontFace: "Arial", fontSize: 58, color: C.ink,
    bold: false, margin: 0, valign: "top",
  });

  // small rule above "for crypto & finance investors"
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 6.25, w: 1.2, h: 0,
    line: { color: C.muted, width: 0.5 },
  });

  s.addText("FOR CRYPTO & FINANCE INVESTORS", {
    x: 0.5, y: 6.35, w: 6, h: 0.35,
    fontFace: "Arial", fontSize: 11, color: C.muted,
    charSpacing: 4, margin: 0,
  });

  // Bitcoin ₿ symbol bottom-right
  s.addText("₿", {
    x: W - 2.0, y: 4.6, w: 1.5, h: 1.9,
    fontFace: "Arial", fontSize: 160, color: C.orange,
    bold: true, align: "center", valign: "middle", margin: 0,
  });
}

// ============================================================
// SLIDE 2 — THESIS
// ============================================================
{
  const s = pres.addSlide();
  addFrame(s, {
    bg: C.cream, section: "§ 00  ·  THESIS",
    pageNum: "02", tag: "THESIS",
  });

  s.addText("THE ARGUMENT, IN ONE PARAGRAPH", {
    x: 0.5, y: 0.9, w: 10, h: 0.35,
    fontFace: "Arial", fontSize: 11, color: C.muted,
    charSpacing: 4, margin: 0,
  });

  // Big paragraph
  s.addText([
    { text: "Bitcoin's security rests on two cryptographic assumptions. A sufficiently large quantum computer breaks ", options: { color: C.ink } },
    { text: "one", opti
```