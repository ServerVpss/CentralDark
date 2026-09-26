# DECISAO - tech_hardware_expansion_strategy.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\tech_hardware_expansion_strategy.js
**SHA:** 39886160b727919c
**Timestamp:** 2026-08-28T02:52:37.146958
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = (colBot - colTop - boxH * steps.length) / (steps.length - 1);
- const gap  = 0.03;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * The Case for Expansion — pptxgenjs replica
 *
 * Replicates the 10-slide editorial memo deck (20" x 11.25", WSJ-editorial palette).
 * Run with:  node build.js
 *
 * The four figures (slide 1 drone schematic, slide 3 demand-vs-capacity chart,
 * slide 5 floor plan, slide 6 headcount grid) are reconstructed from native
 * pptxgenjs shapes — so the whole deck is fully editable in PowerPoint.
 */

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.defineLayout({ name: "EDITORIAL", width: 20, height: 11.25 });
pres.layout = "EDITORIAL";
pres.title = "The Case for Expansion";

/* ---------- Design tokens ---------- */
const C = {
  bg:      "F5F1EA",   // warm paper
  card:    "EFEADF",   // card tint (slightly darker paper)
  ink:     "14110F",   // near-black text
  muted:   "6B6057",   // warm gray caption
  rule:    "3A332C",   // rule lines (softer than ink)
  rust:    "B8573A",   // editorial rust accent
  rustLt:  "E8CFC0",   // rust tint
};
const F = {
  serif: "Georgia",     // display serif
  mono:  "Consolas",    // caption / eyebrow
  sans:  "Calibri",     // body fallback
};

/* ---------- Master ---------- */
pres.defineSlideMaster({
  title: "MAIN",
  width: 20,
  height: 11.25,
  background: { color: C.bg },
});

/* ---------- helpers ---------- */
const W = 20, H = 11.25;
const LM = 1.33, RM = 18.75; // left/right content edges
const FOOT_Y = 10.60;

function header(slide, eyebrowLeft, eyebrowRight) {
  slide.addText(eyebrowLeft, {
    x: LM, y: 0.50, w: 6, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: C.muted, charSpacing: 2,
  });
  slide.addText(eyebrowRight, {
    x: W - LM - 5, y: 0.50, w: 5, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: C.muted, charSpacing: 2,
    align: "right",
  });
}
function footer(slide, page) {
  slide.addText("THE CASE FOR EXPANSION", {
    x: LM, y: FOOT_Y, w: 4, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: C.muted, charSpacing: 2,
  });
  slide.addText(page, {
    x: W - LM - 3, y: FOOT_Y, w: 3, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: C.muted, charSpacing: 2,
    align: "right",
  });
}
function hLine(slide, x, y, w, opts = {}) {
  slide.addShape("line", {
    x, y, w, h: 0,
    line: { color: opts.color || C.rule, width: opts.width || 0.75, dashType: opts.dash || "solid" },
  });
}
function vLine(slide, x, y, h, opts = {}) {
  slide.addShape("line", {
    x, y, w: 0, h,
    line: { color: opts.color || C.rule, width: opts.width || 0.75, dashType: opts.dash || "solid" },
  });
}

/* =====================================================================
 * SLIDE 1 — Cover
 * ===================================================================== */
{
  const s = pres.addSlide({ masterName: "MAIN" });
  header(s, "DRONES CO. INTERNAL MEMO", "APRIL 2026");

  // "A memo to the team" marker
  s.addShape("line", { x: LM, y: 1.51, w: 0.83, h: 0, line: { color: C.ink, width: 1 } });
  s.addText("A MEMO TO THE TEAM", {
    x: 2.35, y: 1.42, w: 3, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: C.ink, charSpacing: 2,
  });

  // --- Drone schematic (right side, shifted up to avoid footer) ---
  drawDrone(s, 11.30, 1.40, 7.10);

  // Figure caption (above the drone, top-right editorial style)
  s.addText("Fig. 00 — The product.", {
    x: 15.8, y: 0.95, w: 3.2, h: 0.28,
    fontFace: F.serif, fontSize: 13, italic: true, color: C.ink, align: "right",
  });
  s.addText([
    { text: "01 ", options: { bold: true } },
    { text: "QUAD FRAME · 450 MM SPAN" },
  ], {
    x: 14.8, y: 1.18, w: 4.2, h: 0.22,
    fontFace: F.mono, fontSize: 8, color: C.ink, charSpacing: 2, align: "right",
  });
  s.addText([
    { text: "02 ", options: { bold: true } },
    { text: "TWIN-REDUNDANT AVIONICS" },
  ], {
    x: 14.8, y: 1.36, w: 4.2, h: 0.22,
    fontFace: F.mono, fontSize: 8, color: C.ink, charSpacing: 2, align: "right",
  });

  // Volume tag
  s.addText("VOL. 01 · STRATEGY", {
    x: LM, y: 3.57, w: 10, h: 0.22,
    fontFace: F.mono, fontSize: 9, color: C.ink, charSpacing: 2, bold: true,
  });

  // Hero title
  s.addText([
    { text: "The case for " },
    { text: "expansion", options: { italic: true } },
    { text: "." },
  ], {
    x: LM, y: 3.90, w: 11, h: 2.6,
    fontFace: F.serif, fontSize: 96, color: C.ink, valign: "top",
    margin: 0,
  });

  // Subhead
  s.addText(
    "Why the next year is the year we stop being constrained by our own factory — and start being constrained only by our ambition.",
    {
      x: LM, y: 7.20, w: 5.2, h: 2.4,
      fontFace: F.serif, fontSize: 20, color: C.ink, valign: "top",
    }
  );

  // Divider above metadata
  hLine(s, LM, 9.44, 17.33, { color: C.ink, width: 0.75 });

  // Metadata row
  const meta = [
    ["AUDIENCE",  "Full team",            LM],
    ["DURATION",  "~10 minutes",          5.79],
    ["DECISION",  "Direction, not budget",10.25],
    ["AUTHOR",    "The founding team",    14.71],
  ];
  meta.forEach(([label, val, x]) => {
    s.addText(label, {
      x, y: 9.74, 
```