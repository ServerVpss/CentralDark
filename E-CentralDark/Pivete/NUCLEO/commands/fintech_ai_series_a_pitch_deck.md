# COMANDO - fintech_ai_series_a_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\fintech_ai_series_a_pitch_deck.js
**SHA:** b979153bc93292bd
**Timestamp:** 2026-08-28T02:52:34.242152
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node recreate.js   (produces iBank_Investor_Presentation.pptx)

### Ouro Bruto (primeiros 5000 chars)
```
// recreate.js - Recreates the iBank Investor Presentation exactly.
// Run:  node recreate.js   (produces iBank_Investor_Presentation.pptx)

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";          // 10" x 5.625"
pres.title  = "iBank Investor Presentation";

// ---------- palette / fonts ----------
const GREEN      = "00C244";
const GREEN_BG   = "E7FAED";
const BLACK      = "000000";
const WHITE      = "FFFFFF";
const GRAY_DK    = "666666";
const GRAY_MD    = "9A9A9A";
const GRAY_LT    = "CCCCCC";
const GRAY_LINE  = "E0E0E0";
const PAGE_BG    = "F5F5F5";
const FONT       = "Aptos";
const FONT_DISP  = "Aptos Display";

// ---------- helpers ----------
function addHeader(slide, pageNum) {
  slide.addText("iBank Investor Presentation", {
    x: 0.4, y: 0.25, w: 4.0, h: 0.3,
    fontSize: 9, fontFace: FONT, color: GRAY_DK, align: "left", margin: 0,
  });
  slide.addText(`${pageNum} / 16`, {
    x: 8.6, y: 0.25, w: 1.0, h: 0.1656,
    fontSize: 9, fontFace: FONT, color: GRAY_DK, align: "right", margin: 0,
  });
}

function addTitle(slide, title, opts = {}) {
  slide.addText(title, {
    x: 0.4, y: 0.55, w: 9.2, h: opts.h || 0.831,
    fontSize: opts.sz || 22, bold: true, fontFace: FONT_DISP,
    color: BLACK, align: "left", margin: 0,
  });
}

function addSource(slide, text) {
  slide.addText(text, {
    x: 0.4, y: 5.28, w: 9.0, h: 0.22,
    fontSize: 7.5, fontFace: FONT, color: GRAY_DK, align: "left", margin: 0,
  });
}

function addLogo(slide, color = BLACK) {
  // 2x2 square logo
  [[4.68,0.75],[4.98,0.75],[4.68,1.05],[4.98,1.05]].forEach(([x,y]) => {
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.2, h: 0.2, fill: { color }, line: { type: "none" },
    });
  });
}

function bullet(slide, x, y, color = BLACK, size = 0.08) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: size, h: size, fill: { color }, line: { type: "none" },
  });
}

// =====================================================================
// SLIDE 1 — Title
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: PAGE_BG };
  addLogo(s, BLACK);

  s.addText("Series A Capital Raise      |      $25,000,000", {
    x: 0.6, y: 2.2861, w: 8.8, h: 0.2576,
    fontSize: 14, bold: true, fontFace: FONT, color: GRAY_DK, align: "center", margin: 0,
  });
  s.addText("iBank", {
    x: 0.6, y: 2.6861, w: 8.8, h: 0.8,
    fontSize: 56, bold: true, fontFace: FONT_DISP, color: BLACK, align: "center", margin: 0,
  });
  s.addText("The AI-Native Investment Bank", {
    x: 0.6, y: 3.3861, w: 8.8, h: 0.7,
    fontSize: 22, fontFace: FONT, color: BLACK, align: "center", margin: 0,
  });

  // three stats
  s.addText("70-80%", { x: 1.55, y: 4.45, w: 2.0, h: 0.3312,
    fontSize: 18, bold: true, fontFace: FONT_DISP, color: BLACK, align: "center", margin: 0 });
  s.addText("Workflow Automated", { x: 1.55, y: 4.85, w: 2.0, h: 0.25,
    fontSize: 9, fontFace: FONT, color: GRAY_DK, align: "center", margin: 0 });

  s.addText("10x", { x: 4.1, y: 4.45, w: 2.0, h: 0.3312,
    fontSize: 18, bold: true, fontFace: FONT_DISP, color: GREEN, align: "center", margin: 0 });
  s.addText("Banker Productivity", { x: 4.1, y: 4.85, w: 2.0, h: 0.25,
    fontSize: 9, fontFace: FONT, color: GRAY_DK, align: "center", margin: 0 });

  s.addText("$80B+", { x: 6.65, y: 4.45, w: 2.0, h: 0.35,
    fontSize: 18, bold: true, fontFace: FONT_DISP, color: BLACK, align: "center", margin: 0 });
  s.addText("Fee Pool Addressable", { x: 6.65, y: 4.85, w: 2.0, h: 0.25,
    fontSize: 9, fontFace: FONT, color: GRAY_DK, align: "center", margin: 0 });

  s.addText("Confidential  |  April 2026", { x: 0.6, y: 5.33, w: 8.8, h: 0.22,
    fontSize: 9, fontFace: FONT, color: GRAY_DK, align: "center", margin: 0 });
}

// =====================================================================
// SLIDE 2 — Executive summary (three columns)
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeader(s, 2);
  addTitle(s, "iBank automates 70-80% of the M&A deal lifecycle, enabling 3-5 senior bankers to run what traditionally requires 30-50+ professionals");

  // divider line under title
  s.addShape(pres.shapes.LINE, {
    x: 0.4, y: 1.843, w: 9.2, h: 0,
    line: { color: GRAY_LINE, width: 1 },
  });

  const cols = [
    { x: 0.4, head: "The Opportunity", items: [
      "Last major financial services vertical untouched by automation",
      "60-70% comp ratios compress margins; talent caps deal capacity",
      "$80B+ global IB fee pool; $30B M&A advisory; $3-5B SOM in mid-market",
      "$50B+ proven in adjacent verticals: Harvey, Ramp, AlphaSense, Ironclad",
    ]},
    { x: 3.6, head: "The Product", items: [
      "Agentic platform automates end-to-end deal process starting with sell-side M&A",
      "Specialized agents: modeling, docs, data, process, coordination",
      "Human-in-the-loop
```