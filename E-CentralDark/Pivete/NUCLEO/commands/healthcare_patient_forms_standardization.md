# COMANDO - healthcare_patient_forms_standardization.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\healthcare_patient_forms_standardization.js
**SHA:** 251eb7dc04e98f92
**Timestamp:** 2026-08-28T02:52:34.978003
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const segStart = Math.min(prePos, postPos) * scaleW;
- const segStart = Math.min(prePos, postPos) * scaleW;

### Padroes
- // SLIDE 10 — SWIMLANE GRID (NEW pattern: roles × stages)

### Gaps
- const stopGap = trackW / (items.length - 1);

### Ouro Bruto (primeiros 5000 chars)
```
// Rebuild v3: structural diversity, real charts, fewer boxes
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Orthopedics & PT Group";
pres.title = "Standardizing Patient Forms & Assessments";

const NAVY = "0F3B5C";
const NAVY_DARK = "082A44";
const TEAL = "2C8A9E";
const TEAL_LIGHT = "5FB3C4";
const TEAL_PALE = "C5E2E8";
const BG_LIGHT = "F5FAFB";
const BG_INSIGHT = "FFF8E1";
const WHITE = "FFFFFF";
const SLATE = "1E293B";
const SLATE_2 = "334155";
const MUTED = "64748B";
const HAIRLINE = "D9E2E8";
const RED = "C0392B";
const RED_PALE = "F4D7D2";
const GREEN = "1F9D55";
const GREEN_PALE = "C7E9D5";
const GOLD = "C9A227";
const GOLD_DARK = "8B6914";
const AMBER = "E08E0B";

const SW = 13.333, SH = 7.5;
const TOTAL = 17;

async function icon(IconCmp, color = NAVY, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconCmp, { color: "#" + color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

function addFooter(slide, n, dark = false) {
  slide.addText(
    `CONFIDENTIAL  |  Orthopedics & PT Group — All-Staff Meeting  |  ${n} / ${TOTAL}`,
    { x: 0.5, y: SH - 0.32, w: SW - 1, h: 0.25, fontSize: 9, fontFace: "Calibri",
      color: dark ? "9CB3C9" : MUTED, align: "center", margin: 0 }
  );
}

// Lighter title — thin teal accent bar instead of full navy slab
function addLightTitle(slide, eyebrow, title) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.55, w: 0.5, h: 0.08, fill: { color: TEAL }, line: { color: TEAL }
  });
  slide.addText(eyebrow.toUpperCase(), {
    x: 1.2, y: 0.4, w: 11, h: 0.4, fontSize: 11, fontFace: "Calibri", bold: true,
    color: TEAL, charSpacing: 2.5, valign: "middle", margin: 0
  });
  slide.addText(title, {
    x: 0.6, y: 0.85, w: SW - 1.2, h: 1.0,
    fontSize: 24, fontFace: "Calibri", bold: true, color: NAVY,
    valign: "top", margin: 0, lineSpacingMultiple: 1.1
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 1.95, w: SW - 1.2, h: 0.02,
    fill: { color: HAIRLINE }, line: { color: HAIRLINE }
  });
}

function addInsight(slide, x, y, w, label, body) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.7, fill: { color: BG_INSIGHT }, line: { color: BG_INSIGHT }
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.1, h: 0.7, fill: { color: GOLD }, line: { color: GOLD }
  });
  slide.addText([
    { text: label.toUpperCase() + "  ", options: { bold: true, color: GOLD_DARK, fontSize: 11, charSpacing: 1.5 } },
    { text: body, options: { color: SLATE, fontSize: 13 } },
  ], { x: x + 0.25, y, w: w - 0.4, h: 0.7, fontFace: "Calibri", valign: "middle", margin: 0 });
}

(async () => {

// =================================================================
// SLIDE 1 — TITLE (kept)
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, {
    x: SW - 4, y: -2, w: 6, h: 6, fill: { color: TEAL, transparency: 70 }, line: { color: NAVY }
  });
  s.addShape(pres.shapes.OVAL, {
    x: SW - 2.2, y: 4.2, w: 3.5, h: 3.5, fill: { color: TEAL_LIGHT, transparency: 80 }, line: { color: NAVY }
  });
  s.addText("CLINICAL OPERATIONS  |  Q2 2026", {
    x: 0.8, y: 1.6, w: 9, h: 0.4, fontSize: 14, fontFace: "Calibri", bold: true,
    color: TEAL_LIGHT, charSpacing: 3, margin: 0
  });
  s.addText("Standardizing Patient\nForms & Assessments", {
    x: 0.8, y: 2.2, w: 11, h: 2.4, fontSize: 56, fontFace: "Georgia", bold: true,
    color: WHITE, valign: "top", margin: 0, lineSpacingMultiple: 1.05
  });
  s.addText("One framework, one workflow, one source of truth — live across the practice in 12 weeks", {
    x: 0.8, y: 4.85, w: 11, h: 0.9, fontSize: 19, fontFace: "Calibri", italic: true,
    color: "CADCFC", margin: 0
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: SH - 0.9, w: SW, h: 0.9, fill: { color: NAVY_DARK }, line: { color: NAVY_DARK }
  });
  s.addText([
    { text: "All-Staff Meeting", options: { bold: true, color: WHITE } },
    { text: "    |    ", options: { color: TEAL_LIGHT } },
    { text: "Orthopedics & Physical Therapy Group", options: { color: "CADCFC" } },
  ], { x: 0.8, y: SH - 0.85, w: 11, h: 0.8, fontSize: 14, fontFace: "Calibri", valign: "middle", margin: 0 });
}

// =================================================================
// SLIDE 2 — AGENDA: horizontal track at top (NEW pattern)
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addLightTitle(s, "Today's agenda  |  ~30 minutes",
    "Five sections will move us from today's fragmented intake\nto a fully standardized framework — live i
```