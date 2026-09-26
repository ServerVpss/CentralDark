# OUTRO - destination_marketing_event_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\destination_marketing_event_pitch.js
**SHA:** 86a98f3b570cb890
**Timestamp:** 2026-08-28T02:52:33.146126
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:
- { x: 1.25,   big: "296K", unitRun: null, label: "CITY POPULATION",       body: "680K across the county-and-metro footprint", labelW: 4.238, labelH: 0.333 },
- { x: 5.875,  big: "34",   unitRun: "yrs", label: "MEDIAN AGE",           body: "Five years younger than the US median",       labelW: 3.981, labelH: 0.333 },
- { x: 10.25,  big: "52%",  unitRun: null, label: "BACHELOR'S OR HIGHER", body: "Among the highest-attainment cities of its size", labelW: 3.981, labelH: 0.625 },
- { x: 14.625, big: "58%",  unitRun: null, label: "PEOPLE OF COLOR",      body: "A genuinely majority-minority city",          labelW: 3.991, labelH: 0.333 },

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Go Durham — Destination Services
 * PptxGenJS replica of "Go Durham - Tourist Destination.pptx"
 *
 * Run:
 *   npm install pptxgenjs
 *   node generate.js
 * Outputs: Go_Durham_-_Tourist_Destination.pptx
 */

const pptxgen = require("pptxgenjs");

// ---------- Palette ----------
const CREAM = "F4EFE6";       // primary background / text on green slides
const GREEN = "1A3D2E";       // dark green (section accents + text)
const ORANGE = "D85A3A";      // accent / italics
const BLACK = "1C1C1A";       // near-black body text
const GRAY = "4A4A45";        // muted gray
const DIVIDER = "C9BFA8";     // tan hairline divider
const ARIAL = "Arial";

// Helper to convert OOXML spc (1/100 pt) to pptxgenjs charSpacing (pt)
const SP = (ooxmlSpc) => ooxmlSpc / 100;

const pres = new pptxgen();
pres.author = "Go Durham";
pres.title = "Go Durham — Destination Services";
pres.company = "Go Durham";

// Custom 20" x 11.25" layout (matches original EMU 18288000 x 10287000)
pres.defineLayout({ name: "GO_DURHAM", width: 20, height: 11.25 });
pres.layout = "GO_DURHAM";

// ==================================================================
// Reusable helpers
// ==================================================================

/** Divider hairline */
function hr(slide, x, y, w, color = DIVIDER) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.01, fill: { color }, line: { type: "none" },
  });
}

/** Vertical divider */
function vr(slide, x, y, h, color = DIVIDER) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.01, h, fill: { color }, line: { type: "none" },
  });
}

/** Orange dot used as masthead mark on slides 1 & 10 */
function brandDot(slide, x = 1.25, y = 0.906) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: 0.146, h: 0.146,
    fill: { color: ORANGE }, line: { type: "none" },
  });
}

/** Page-number chip top-right ("02 / 10" etc.) */
function pageNumber(slide, n, total = 10, color = BLACK) {
  slide.addText(`${String(n).padStart(2, "0")} / ${total}`, {
    x: 17.723, y: 0.95, w: 1.111, h: 0.333,
    fontFace: ARIAL, fontSize: 18, color, charSpacing: SP(270),
    align: "left", margin: 0,
  });
}

/** Top-of-slide small orange eyebrow (e.g. "02 — WHY DURHAM") */
function eyebrow(slide, text, w = 8) {
  slide.addText(text, {
    x: 1.25, y: 0.938, w, h: 0.365,
    fontFace: ARIAL, fontSize: 18, bold: false, color: ORANGE,
    charSpacing: SP(396), align: "left", margin: 0,
  });
}

/** Large headline: two-tone. leadText in dark, italicText in orange italic */
function headline(slide, leadText, italicText, opts = {}) {
  const {
    x = 1.25, y = 1.531, w = 14, h = 1.767,
    size = 63, leadColor = BLACK, spc = -126,
  } = opts;
  slide.addText(
    [
      { text: leadText, options: { color: leadColor, charSpacing: SP(spc) } },
      { text: italicText, options: { color: ORANGE, italic: true, charSpacing: SP(spc) } },
    ],
    { x, y, w, h, fontFace: ARIAL, fontSize: size, align: "left", margin: 0 },
  );
}

/** Footer with left brand line & right section label */
function footer(slide, rightLabel, color = GRAY, rightW = 3.5) {
  slide.addText("GO DURHAM · DESTINATION BRIEFING", {
    x: 1.25, y: 10.438, w: 6.858, h: 0.333,
    fontFace: ARIAL, fontSize: 18, color,
    charSpacing: SP(396), align: "left", margin: 0,
  });
  slide.addText(rightLabel, {
    x: 20 - 1.25 - rightW, y: 10.438, w: rightW, h: 0.333,
    fontFace: ARIAL, fontSize: 18, color,
    charSpacing: SP(396), align: "right", margin: 0,
  });
}

// ==================================================================
// Slide 1 — Cover
// ==================================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: CREAM };

  brandDot(s);
  s.addText("GO DURHAM · DESTINATION SERVICES", {
    x: 1.542, y: 0.833, w: 6.981, h: 0.333,
    fontFace: ARIAL, fontSize: 18, color: BLACK,
    charSpacing: SP(396), align: "left", margin: 0,
  });
  s.addText("CONFERENCE & EVENTS BRIEFING 2026 PLANNER FORUM", {
    x: 12.873, y: 0.833, w: 5.877, h: 0.941,
    fontFace: ARIAL, fontSize: 18, color: GRAY,
    charSpacing: SP(360), align: "right", margin: 0,
    paraSpaceAfter: 0,
  });

  s.addText("DURHAM, NORTH CAROLINA", {
    x: 1.25, y: 2.713, w: 18.025, h: 0.365,
    fontFace: ARIAL, fontSize: 19.5, color: ORANGE,
    charSpacing: SP(585), align: "left", margin: 0,
  });

  // Hero headline — two text boxes, one per line, so we control vertical rhythm exactly
  s.addText("A city that", {
    x: 1.25, y: 3.15, w: 18.025, h: 2.2,
    fontFace: ARIAL, fontSize: 165, bold: true, color: GREEN,
    charSpacing: SP(-577), align: "left", margin: 0,
  });
  s.addText(
    [
      { text: "convenes ", options: { color: ORANGE, bold: true, italic: true, charSpacing: SP(-577) } },
      { text: "well.", options: { color: GREEN, bold: true, charSpacing: SP(-577) } },
    ],
    {
      x: 1.25, y: 5.4, w: 18.025, h: 2.2,
      fontFace: ARIAL, fontSize: 165, align: "left", marg
```