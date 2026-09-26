# DECISAO - college_admissions_consulting_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\college_admissions_consulting_pitch.js
**SHA:** 2167021bd4a127f5
**Timestamp:** 2026-08-28T02:52:32.795966
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node plan3.js   ->  Plan_3.pptx

### Ouro Bruto (primeiros 5000 chars)
```
// plan3.js — Recreates "Plan_3.pptx" using pptxgenjs.
// Run:  node plan3.js   ->  Plan_3.pptx
//
// Custom slide size: 20" × 11.25"  (captured from source presentation.xml).

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.defineLayout({ name: "PLAN3", width: 20, height: 11.25 });
pres.layout = "PLAN3";
pres.title = "Transitions — Admissions & Transition Support";

// ---------- Palette ----------
const C = {
  cream:       "F5EFE6", // slide background (slides 2–9)
  creamDeep:   "F0E5D1", // slide 1 background
  creamLite:   "FAF6EE", // card background
  dark:        "2C3A2E", // primary dark forest green
  body:        "4A5A4C", // secondary text
  muted:       "6E7D70", // caption / label muted
  accent:      "A86647", // terracotta (labels/accents)
  accentLite:  "C17B5C", // lighter terracotta (italic words)
  peach:       "E8B89E", // peach accent (dark slide highlights)
  tan:         "E8DCC6", // tan (on dark card)
  warmGray:    "B8AF9B", // warm gray (on dark card)
};

// ---------- Fonts ----------
const FONT = "Arial";

// ---------- Helpers ----------

// Reusable "Transitions" wordmark + right-side kicker label that appears on
// most content slides. onDark=true switches text to cream for slide 10.
function addHeader(slide, kicker, onDark = false) {
  const brandColor  = onDark ? C.cream : C.dark;
  const kickerColor = onDark ? C.cream : C.muted;
  slide.addText("Transitions", {
    x: 1.25, y: 0.5, w: 3.0, h: 0.5,
    fontFace: FONT, fontSize: 22.5, italic: true,
    color: brandColor, charSpacing: -0.22, margin: 0, valign: "top", align: "left",
  });
  if (kicker) {
    slide.addText(kicker, {
      x: 12.5, y: 0.554, w: 6.35, h: 0.4,
      fontFace: FONT, fontSize: 18, color: kickerColor,
      charSpacing: 3.24, align: "right", valign: "top", margin: 0,
    });
  }
}

// Thin horizontal rule. `transparency` is 0-100 (higher = more transparent).
function rule(slide, x, y, w, color = C.dark, thickness = 0.01, transparency = 0) {
  const fill = transparency > 0 ? { color, transparency } : { color };
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: thickness, fill, line: { type: "none" },
  });
}

// ==================================================================
// SLIDE 1 — Title
// ==================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.creamDeep };

  // Right-side decorative block (placeholder for hero image/photo).
  // Source uses C17B5C at 14% alpha — a very pale peach wash.
  s.addShape(pres.shapes.RECTANGLE, {
    x: 11.174, y: 3.629, w: 5.017, h: 6.683,
    fill: { color: C.accentLite, transparency: 86 }, line: { type: "none" },
  });

  // Wordmark + kicker
  s.addText("Transitions", {
    x: 1.25, y: 0.938, w: 3.0, h: 0.5,
    fontFace: FONT, fontSize: 25.5, italic: true,
    color: C.dark, charSpacing: -0.25, margin: 0,
  });
  s.addText("FOR FAMILIES, FOR NOW & AFTER ADMISSIONS & TRANSITION SUPPORT", {
    x: 12.0, y: 0.938, w: 6.75, h: 0.95,
    fontFace: FONT, fontSize: 18, color: C.body,
    charSpacing: 3.96, align: "right", valign: "top", margin: 0,
  });

  // Hero title
  s.addText(
    [
      { text: "A steady hand, ", options: { color: C.dark } },
      { text: "twice",           options: { color: C.accent, italic: true } },
      { text: ".",               options: { color: C.dark } },
    ],
    {
      x: 1.25, y: 4.6, w: 10.0, h: 3.6,
      fontFace: FONT, fontSize: 126, bold: false,
      charSpacing: -4.41, paraSpaceAfter: 0, lineSpacingMultiple: 0.95,
      valign: "top", align: "left", margin: 0,
    }
  );

  // Divider under title (source: 2C3A2E at 35% alpha)
  rule(s, 1.25, 8.643, 5.833, C.dark, 0.01, 65);

  // Subtitle
  s.addText(
    "Getting in is one journey. Settling in is another. We walk both with your family.",
    {
      x: 1.25, y: 8.9, w: 9.5, h: 1.4,
      fontFace: FONT, fontSize: 25.5, color: C.body,
      lineSpacingMultiple: 1.25, valign: "top", align: "left", margin: 0,
    }
  );
}

// ==================================================================
// SLIDE 2 — Why we exist
// ==================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, "WHY WE EXIST");

  s.addText(
    [
      { text: "Getting into college is only ", options: { color: C.dark } },
      { text: "half ",                          options: { color: C.accent, italic: true } },
      { text: "the journey.",                   options: { color: C.dark } },
    ],
    {
      x: 2.0, y: 3.7, w: 16.0, h: 3.0,
      fontFace: FONT, fontSize: 90, charSpacing: -2.7,
      align: "center", valign: "top", margin: 0,
      lineSpacingMultiple: 1.05,
    }
  );

  // Small accent rule
  rule(s, 9.375, 6.85, 1.25, C.accentLite, 0.03);

  s.addText(
    "THE OTHER HALF IS WHAT MOST FAMILIES FACE ALONE",
    {
      x: 4.0, y: 7.35, w: 12.0, h: 0.45,
      fontFace: FONT, fontSize: 19.5, c
```