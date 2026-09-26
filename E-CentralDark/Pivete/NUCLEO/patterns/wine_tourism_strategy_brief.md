# PADRAO - wine_tourism_strategy_brief.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\wine_tourism_strategy_brief.js
**SHA:** b8e5e7b37707b109
**Timestamp:** 2026-08-28T02:52:37.705031
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const rowStart = 4.3;

### Gaps
- const gap = 0.35;
- const gap = 0.35;
- const gap = 0.4;

### Ouro Bruto (primeiros 5000 chars)
```
// montenegro_wine_market.js
// Recreates Montenegro_Wine_Market.pptx using pptxgenjs

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// Custom layout — source deck is 20" x 11.25" (16:9)
pres.defineLayout({ name: "CUSTOM", width: 20, height: 11.25 });
pres.layout = "CUSTOM";
pres.author = "Wine Montenegro";
pres.title = "Wine Montenegro — Tourism Strategy Brief";

// ===== Palette =====
const C = {
  burgundy: "3A1420",
  cream:    "F3EDE2",
  cream2:   "FAF6EE",
  gold:     "B08A3E",
  ink:      "1A1412",
  wine:     "7A2A3A",
  tan:      "E8DCC4",
  track:    "ECE4D4",
  mute:     "8A7B6B", // muted label / source text on cream
  muteDk:   "8A7566", // muted on burgundy
};

// ===== Fonts =====
const FHEAD = "Georgia";
const FBODY = "Calibri";

// ===== Page dimensions =====
const W = 20;
const H = 11.25;
const MARGIN = 1.2;   // left/right content margin
const TOP_BAR_Y = 0.7;
const FOOT_Y = 10.55;

// Small helpers ---------------------------------------------------------------

// Top chrome: brand left, section label right, separator rule
function addTopBar(slide, sectionLabel, opts = {}) {
  const dark = !!opts.dark;
  const brandColor = dark ? C.cream : C.ink;
  const labelColor = dark ? C.muteDk : C.mute;
  const ruleColor = dark ? "5A3040" : "C9BEA9";

  slide.addText("WINE MONTENEGRO", {
    x: MARGIN, y: TOP_BAR_Y - 0.15, w: 4, h: 0.4,
    fontFace: FBODY, fontSize: 12, bold: true,
    color: brandColor, charSpacing: 4, margin: 0,
    valign: "middle",
  });

  slide.addText(sectionLabel, {
    x: W - MARGIN - 6, y: TOP_BAR_Y - 0.15, w: 6, h: 0.4,
    fontFace: FBODY, fontSize: 12,
    color: labelColor, charSpacing: 4, margin: 0,
    align: "right", valign: "middle",
  });

  // Separator rule between brand and label
  slide.addShape(pres.shapes.LINE, {
    x: MARGIN + 3.6, y: TOP_BAR_Y + 0.05, w: W - 2 * MARGIN - 7.2, h: 0,
    line: { color: ruleColor, width: 0.75 },
  });
}

// Footer: source left, page right
function addFooter(slide, sourceText, pageNum, opts = {}) {
  const dark = !!opts.dark;
  const muted = dark ? C.muteDk : C.mute;

  if (sourceText) {
    slide.addText(sourceText, {
      x: MARGIN, y: FOOT_Y, w: W - 2 * MARGIN - 3, h: 0.4,
      fontFace: FBODY, fontSize: 11,
      color: muted, charSpacing: 3, margin: 0,
      valign: "middle",
    });
  }

  if (pageNum !== null) {
    slide.addText(`${String(pageNum).padStart(2, "0")} / 10`, {
      x: W - MARGIN - 3, y: FOOT_Y, w: 3, h: 0.4,
      fontFace: FBODY, fontSize: 11,
      color: muted, charSpacing: 3, margin: 0,
      align: "right", valign: "middle",
    });
  }
}

// Eyebrow (small gold uppercase label above a section title)
function addEyebrow(slide, text, x, y, w, opts = {}) {
  slide.addText(text, {
    x, y, w, h: 0.5,
    fontFace: FBODY, fontSize: 14, bold: true,
    color: opts.color || C.gold, charSpacing: 6, margin: 0,
    valign: "middle",
  });
}

// =============================================================================
// SLIDE 1 — COVER
// =============================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.burgundy };
  addTopBar(s, "TOURISM STRATEGY BRIEF · 2026", { dark: true });

  addEyebrow(s, "A WINE COUNTRY, REINTRODUCED", MARGIN, 1.6, 10);

  // Big title — mixed cream & italic gold
  s.addText(
    [
      { text: "Montenegro — ", options: { color: C.cream, italic: false } },
      { text: "the undiscovered Adriatic vineyard.", options: { color: C.gold, italic: true } },
    ],
    {
      x: MARGIN, y: 2.3, w: 14.5, h: 4.8,
      fontFace: FHEAD, fontSize: 96,
      margin: 0, valign: "top",
    }
  );

  // Body paragraph
  s.addText(
    "2,000 years of winemaking. Two grapes grown almost nowhere else on earth. A 300 km Adriatic coastline two flights from every European capital.",
    {
      x: MARGIN, y: 8.3, w: 11, h: 1.2,
      fontFace: FBODY, fontSize: 18,
      color: C.cream, margin: 0, valign: "top",
    }
  );

  // Prepared-for line
  s.addText("PREPARED FOR THE NATIONAL TOURISM BOARD · PODGORICA", {
    x: MARGIN, y: FOOT_Y, w: 14, h: 0.4,
    fontFace: FBODY, fontSize: 12,
    color: C.muteDk, charSpacing: 4, margin: 0, valign: "middle",
  });

  // "Est. III BC" circle, bottom-right
  s.addShape(pres.shapes.OVAL, {
    x: W - MARGIN - 1.6, y: 9.2, w: 1.4, h: 1.4,
    fill: { color: C.burgundy },
    line: { color: C.cream, width: 0.75 },
  });
  s.addText("Est. III BC", {
    x: W - MARGIN - 1.6, y: 9.2, w: 1.4, h: 1.4,
    fontFace: FHEAD, fontSize: 13, italic: true,
    color: C.cream, align: "center", valign: "middle", margin: 0,
  });
}

// =============================================================================
// SLIDE 2 — HERITAGE IN NUMBERS
// =============================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addTopBar(s, "02 · HERITAGE IN NUMBERS");

  addEyebrow(s, "THE INDUSTRY AT A GLAN
```