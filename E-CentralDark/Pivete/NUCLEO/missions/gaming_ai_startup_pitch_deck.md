# MISSAO - gaming_ai_startup_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\gaming_ai_startup_pitch_deck.js
**SHA:** f56fef0c17a470f5
**Timestamp:** 2026-08-28T02:52:34.751596
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node Gaming.js   →  emits Gaming_recreated.pptx

### Ouro Bruto (primeiros 5000 chars)
```
// Gaming.js  —  recreates Gaming.pptx (BASED // Series A investor briefing)
// Run:  node Gaming.js   →  emits Gaming_recreated.pptx
// Requires:  npm install -g pptxgenjs

const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

// ---------- LAYOUT (custom 20" x 11.25" widescreen, matches original) ----------
pres.defineLayout({ name: "BASED_WIDE", width: 20, height: 11.25 });
pres.layout = "BASED_WIDE";
pres.author  = "Macroplastics Inc.";
pres.company = "BASED";
pres.title   = "BASED — Series A Investor Briefing";

// ---------- PALETTE (extracted from original) ----------
const C = {
  bgBase:    "120806",  // deepest near-black (cover uses 0A0504, vision uses 0A0504)
  bgBaseAlt: "0A0504",  // slightly darker variant on slide 4 + 15
  bgWarm:    "2A120C",  // warm brown overlay
  panel:     "1A0D0A",  // card / panel fill
  panelDark: "1A0D0A",
  border:    "3A1E16",  // hairline borders, divider lines
  borderHi:  "5A2E20",  // brighter border (panels)
  rust:      "D9482A",  // primary accent — rust orange
  cream:     "F2E3D5",  // primary headline cream
  muted:     "7A5D4E",  // muted brown text (chrome / labels)
  warm:      "C9B5A3",  // warm gray body text
  amber:     "F2C572",  // warning amber
};

const FONT  = "Arial";
const FMONO = "Consolas"; // monospace stand-in (was "monospace" in original)

// canvas
const SW = 20.0, SH = 11.25;

// ---------- HELPERS ----------

// Header + footer chrome that appears on every slide
function chrome(s, sectionLabel, sectionLabelW = 1.85, useDarkBg = false) {
  // base background layers
  s.background = { color: useDarkBg ? C.bgBaseAlt : C.bgBase };
  // warm brown wash on top
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SW, h: SH,
    fill: { color: C.bgWarm, transparency: 70 },
    line: { type: "none" },
  });

  // top-left corner glyph
  s.addText("◢", {
    x: 0.42, y: 0.44, w: 0.23, h: 0.25,
    fontFace: FONT, fontSize: 12, color: C.rust, margin: 0,
  });
  // top-left brand
  s.addText("BASED//SYS", {
    x: 0.68, y: 0.42, w: 1.53, h: 0.29,
    fontFace: FONT, fontSize: 15, color: C.cream, charSpacing: 1.5, margin: 0,
  });
  // top-right section label (give generous width, right-align so it sits next to ◣)
  s.addText(sectionLabel, {
    x: 16.5, y: 0.42, w: 2.9, h: 0.29,
    fontFace: FONT, fontSize: 15, color: C.muted, charSpacing: 1.5, margin: 0,
    align: "right",
  });
  // top-right corner glyph
  s.addText("◣", {
    x: 19.44, y: 0.44, w: 0.23, h: 0.25,
    fontFace: FONT, fontSize: 12, color: C.rust, margin: 0,
  });

  // bottom-left tiny rust dot
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.42, y: 10.66, w: 0.10, h: 0.10,
    fill: { color: C.rust }, line: { type: "none" },
  });
  s.addText("LINK//STABLE", {
    x: 0.62, y: 10.59, w: 1.45, h: 0.29,
    fontFace: FONT, fontSize: 15, color: C.muted, margin: 0,
  });
  s.addText("SOL.0427 · 14:32:08 MTC", {
    x: 16.66, y: 10.59, w: 3.01, h: 0.29,
    fontFace: FONT, fontSize: 15, color: C.muted, charSpacing: 1.5, margin: 0,
  });
}

// Eyebrow: small uppercase rust label above the headline
function eyebrow(s, text, x, y, w = 18.45, align = "left") {
  s.addText(text, {
    x, y, w, h: 0.29,
    fontFace: FONT, fontSize: 15, color: C.rust, charSpacing: 3, margin: 0,
    align,
  });
}

// Big headline with a single-word red accent (rich text array)
function headline(s, runs, opts) {
  // runs: [{text, accent: bool}, ...]
  const arr = runs.map((r) => ({
    text: r.text,
    options: { bold: true, color: r.accent ? C.rust : C.cream, fontFace: FONT, fontSize: opts.size || 63, charSpacing: -0.75 },
  }));
  s.addText(arr, {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    align: opts.align || "left", margin: 0,
  });
}

// Card panel (filled rect with border)
function card(s, x, y, w, h, fill = C.panel, borderC = C.border, lineW = 0.68) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill },
    line: { color: borderC, width: lineW },
  });
}

// Thin horizontal divider
function divider(s, x, y, w, color = C.border, h = 0.01) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color }, line: { type: "none" },
  });
}

// Panel with header strip (top label row + divider line)
function panel(s, x, y, w, h, leftLabel, rightLabel) {
  card(s, x, y, w, h, C.panel, C.borderHi, 0.68);
  divider(s, x + 0.01, y + 0.48, w - 0.02, C.border, 0.01);
  s.addText(leftLabel, {
    x: x + 0.17, y: y + 0.01, w: w * 0.4, h: 0.31,
    fontFace: FONT, fontSize: 16.5, color: C.muted, charSpacing: 1.5, margin: 0,
  });
  if (rightLabel) {
    s.addText(rightLabel, {
      x: x + w - 2.7, y: y + 0.01, w: 2.5, h: 0.31,
      fontFace: FONT, fontSize: 16.5, color: C.muted, charSpacing: 1.5, margin: 0,
      align: "right",
    });
  }
}

// Mono ASCII art block
function ascii(s, x, y, w, h, lines, color = C.rust, sz = 12) {
  const arr = lines.map((ln, i) => ({
    text: ln,
    options: {
      fontFace: FMONO, fontSize: sz, color,
      b
```