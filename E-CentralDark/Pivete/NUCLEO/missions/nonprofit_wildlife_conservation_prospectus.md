# MISSAO - nonprofit_wildlife_conservation_prospectus.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\nonprofit_wildlife_conservation_prospectus.js
**SHA:** 2f23f40190646459
**Timestamp:** 2026-08-28T02:52:35.979758
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node cheetah.js  (requires `npm install pptxgenjs`)

### Padroes
- stat: "1.4M ha", topBg: "E0AE74", topPattern: "lines", numColor: C.ink,
- stat: "6,000 herders", topBg: "8A6A3F", topPattern: "dogs", numColor: C.creamSoft,
- stat: "200 rangers / yr", topBg: "1F1812", topPattern: "stars", numColor: C.amber,
- if (p.topPattern === "lines") {
- } else if (p.topPattern === "dogs") {
- } else if (p.topPattern === "stars") {

### Gaps
- const barH = 0.35, gap = 0.20;
- const cardY = 3.3, cardH = 5.5, cardW = (W - 2.6) / 3, gap = 0.2, gx = 1.2;

### Ouro Bruto (primeiros 5000 chars)
```
// cheetah.js — Replica of "Cheetah Conservation Fund — Founding Prospectus 2026"
// Run: node cheetah.js  (requires `npm install pptxgenjs`)

const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

// ----- Deck setup -----------------------------------------------------------
pres.defineLayout({ name: "CHEETAH", width: 20, height: 11.25 });
pres.layout = "CHEETAH";

// ----- Palette --------------------------------------------------------------
const C = {
  cream:    "F4EFE6", // light bg
  creamSoft:"EBE3D4",
  parchment:"F0D49A", // amber/sand right panel slide 1/8
  parchmentLite:"F4DBA0",
  sand:     "F7E2B6",
  butter:   "FFF0C8", // moon
  ink:      "2A241E", // body dark
  inkDeep:  "14110E", // near-black bg
  inkBrown: "28160A",
  espresso: "3A2E25", // dark slide bg slide 4
  brown:    "5A3A22", // mid brown (mountain)
  brownMid: "8A6A3F",
  amber:    "A8631F", // accent (cheetah orange)
  amberLite:"C8843A",
  amberPale:"E0AE74",
  muted:    "8A8278", // muted gray-brown for small caps
};

const FONT_HEAD = "Georgia";
const FONT_MONO = "Consolas";
const FONT_BODY = "Arial";

// ----- Helpers --------------------------------------------------------------
const W = 20, H = 11.25;

// Tiny corner marks (registration ticks)
function cornerTicks(slide, color = C.muted) {
  const len = 0.18, m = 0.4, t = 0.012;
  // top-left
  slide.addShape("line", { x: m, y: m, w: len, h: 0, line: { color, width: 0.75 } });
  slide.addShape("line", { x: m, y: m, w: 0, h: len, line: { color, width: 0.75 } });
  // top-right
  slide.addShape("line", { x: W - m - len, y: m, w: len, h: 0, line: { color, width: 0.75 } });
  slide.addShape("line", { x: W - m, y: m, w: 0, h: len, line: { color, width: 0.75 } });
  // bottom-left
  slide.addShape("line", { x: m, y: H - m, w: len, h: 0, line: { color, width: 0.75 } });
  slide.addShape("line", { x: m, y: H - m - len, w: 0, h: len, line: { color, width: 0.75 } });
  // bottom-right
  slide.addShape("line", { x: W - m - len, y: H - m, w: len, h: 0, line: { color, width: 0.75 } });
  slide.addShape("line", { x: W - m, y: H - m - len, w: 0, h: len, line: { color, width: 0.75 } });
}

// Mono small-caps text helper
function mono(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: FONT_MONO,
    fontSize: opts.size || 9,
    color: opts.color || C.muted,
    bold: opts.bold || false,
    italic: opts.italic || false,
    align: opts.align || "left",
    valign: opts.valign || "top",
    charSpacing: opts.charSpacing != null ? opts.charSpacing : 2,
    margin: 0,
  });
}

// Rotated mono label.
// Pass the LOGICAL (un-rotated) box. For 90° clockwise (read top-to-bottom along
// the LEFT edge, with anchor top-left), we want the rendered box to occupy a
// narrow column. We achieve this by giving a wide horizontal box and rotating
// 90° around its center, then translating. For our purposes here, we pass the
// CENTER X/Y as x/y plus a wide w and short h, then rotate=90.
function monoRot(slide, text, cx, cy, len, rot, opts = {}) {
  // Render a long horizontal box centered at (cx, cy), then rotate.
  const w = len, h = 0.3;
  const x = cx - w / 2;
  const y = cy - h / 2;
  slide.addText(text, {
    x, y, w, h,
    fontFace: FONT_MONO,
    fontSize: opts.size || 9,
    color: opts.color || C.muted,
    align: opts.align || "center",
    valign: "middle",
    charSpacing: opts.charSpacing != null ? opts.charSpacing : 2,
    rotate: rot,
    margin: 0,
  });
}

// Page footer: brand + page number
function footer(slide, pageStr, dark = false) {
  const col = dark ? C.creamSoft : C.muted;
  mono(slide, "CHEETAH CONSERVATION FUND", 0.6, H - 0.55, 6, 0.3,
       { size: 9, color: col, charSpacing: 3 });
  mono(slide, pageStr, W - 1.7, H - 0.55, 1.2, 0.3,
       { size: 9, color: col, align: "right", charSpacing: 3 });
}

// ============================================================================
// SLIDE 1 — COVER
// ============================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.cream };

  // Right amber panel
  s.addShape("rect", { x: W * 0.58, y: 0, w: W * 0.42, h: H, fill: { color: C.parchment }, line: { color: C.parchment } });

  // Corner ticks
  cornerTicks(s);

  // Brand mark — small circle with dots + wordmark
  s.addShape("ellipse", { x: 0.6, y: 0.55, w: 0.36, h: 0.36, fill: { color: C.cream }, line: { color: C.ink, width: 0.75 } });
  // little spots inside the brand circle
  [[0.70,0.66],[0.78,0.70],[0.72,0.78],[0.84,0.74]].forEach(([cx,cy]) =>
    s.addShape("ellipse", { x: cx, y: cy, w: 0.05, h: 0.05, fill: { color: C.ink }, line: { color: C.ink } })
  );
  mono(s, "CHEETAH CONSERVATION FUND", 1.15, 0.62, 4, 0.3, { size: 11, color: C.ink, charSpacing: 4 });

  // Eyebrow
  mono(s, "A FOUNDING PROSPECTUS  ·  2026", 0.95, 2.8, 6, 0.3, { size: 12, color: C.amber, charSpacing: 4 });

  // Headline (mixed roman + amber italic-ish second clause)
  s.ad
```