# DECISAO - economic_consulting_prospectus.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\economic_consulting_prospectus.js
**SHA:** a1245d0c58d0bbd0
**Timestamp:** 2026-08-28T02:52:33.195331
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: `node build_plan.js`  →  produces `Plan_1_recreated.pptx`

### Ouro Bruto (primeiros 5000 chars)
```
// ============================================================================
// Econométricos Prospectus — pptxgenjs replica of Plan_1.pptx
// ============================================================================
// Run: `node build_plan.js`  →  produces `Plan_1_recreated.pptx`
//
// Layout: custom 20" × 11.25" (matches source)
// Font:   Arial throughout
// Palette:
//   BG_DARK      #121212   dark slides + most text on light slides
//   BG_LIGHT     #F4F1EA   light slides + light text on dark slides
//   TEXT_BODY    #2A2A2A   body copy on light slides
//   LABEL_MUTED  #6B6658   section labels on light slides
//   LABEL_LIGHT  #A8A196   section labels on dark slides
//   ACCENT_GRAY  #C8C2B2   muted accent on dark slides
// ============================================================================

const PptxGenJS = require('pptxgenjs');

// ---------------------------------------------------------------------------
// Chart images (embedded as base64 so this file is self-contained)
// ---------------------------------------------------------------------------
const IMG_CURVE       = 'data:image/png;base64,PLACEHOLDER';
const IMG_CALIBRATION = 'data:image/png;base64,PLACEHOLDER';

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
const C = {
  BG_DARK:     '121212',
  BG_LIGHT:    'F4F1EA',
  TEXT_DARK:   '121212',
  TEXT_BODY:   '2A2A2A',
  TEXT_BLACK:  '000000',
  LABEL_MUTED: '6B6658',
  LABEL_LIGHT: 'A8A196',
  ACCENT_GRAY: 'C8C2B2',
};

// ---------------------------------------------------------------------------
// Presentation setup
// ---------------------------------------------------------------------------
const pres = new PptxGenJS();
pres.defineLayout({ name: 'CUSTOM_20x11_25', width: 20, height: 11.25 });
pres.layout = 'CUSTOM_20x11_25';
pres.title  = 'Econométricos — Prospectus Vol. 01 · 2026';

const FONT = 'Arial';

// Helper: thin dark rule (renders as faint line because the height is ~0.75pt)
const RULE_COLOR_DARK  = 'C8C2B2'; // faint warm gray — matches original's hairline look on light slides
const RULE_COLOR_LIGHT = 'C8C2B2'; // same on dark slides
const rule = (slide, x, y, w, color = RULE_COLOR_DARK) =>
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h: 0.01, fill: { color }, line: { type: 'none' },
  });

// Helper: vertical rule
const vrule = (slide, x, y, h, color = RULE_COLOR_DARK) =>
  slide.addShape(pres.ShapeType.rect, {
    x, y, w: 0.01, h, fill: { color }, line: { type: 'none' },
  });

// Helper: common header row (brand name top-left, section ID top-right)
const addHeader = (slide, sectionId, onDark = false) => {
  const col = onDark ? C.LABEL_LIGHT : C.LABEL_MUTED;
  slide.addText('ECONOMETRICOS', {
    x: 1.31, y: 0.50, w: 3.5, h: 0.38,
    fontFace: FONT, fontSize: 18, color: col, charSpacing: 2.52,
    valign: 'top', margin: 0,
  });
  // section ID is right-aligned within its own box, so the box can be made wide
  slide.addText(sectionId, {
    x: 12.0, y: 0.53, w: 7.05, h: 0.33,
    fontFace: FONT, fontSize: 18, color: col, charSpacing: 2.52,
    align: 'right', valign: 'top', margin: 0,
  });
};

// Helper: common footer (page number left, note right)
const addFooter = (slide, pageStr, noteStr, noteAlign = 'right', onDark = false) => {
  const col = onDark ? C.LABEL_LIGHT : C.LABEL_MUTED;
  slide.addText(pageStr, {
    x: 1.04, y: 10.47, w: 3.0, h: 0.33,
    fontFace: FONT, fontSize: 18, color: col, charSpacing: 2.52,
    align: 'left', valign: 'top', margin: 0,
  });
  if (noteStr) {
    slide.addText(noteStr, {
      x: 8.0, y: 10.47, w: 11.0, h: 0.33,
      fontFace: FONT, fontSize: 18, color: col, charSpacing: 2.52,
      align: noteAlign, valign: 'top', margin: 0,
    });
  }
};

// ============================================================================
// SLIDE 1 — Cover
// ============================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.BG_DARK };

  addHeader(s, 'ESTABLISHED MMXXVI · LAUNCH MATERIALS', true);

  // Tagline above the wordmark
  s.addText('A NEW ECONOMIC CONSULTING FIRM', {
    x: 1.04, y: 2.92, w: 18.45, h: 0.38,
    fontFace: FONT, fontSize: 18, color: C.LABEL_LIGHT, charSpacing: 2.52,
    valign: 'top', margin: 0,
  });

  // Massive wordmark — 180pt
  s.addText('Econométricos.', {
    x: 1.04, y: 3.67, w: 18.45, h: 2.49,
    fontFace: FONT, fontSize: 180, color: C.BG_LIGHT, charSpacing: -1.8,
    valign: 'top', margin: 0,
  });

  // Italic tagline below
  s.addText('Forecasting for decisions that move markets.', {
    x: 1.04, y: 6.70, w: 7.5, h: 1.3,
    fontFace: FONT, fontSize: 42, italic: true, color: C.BG_LIGHT, charSpacing: -0.42,
    valign: 'top', margin: 0,
  });

  // Right-hand masthead box
  s.addText('Prospectus', {
    x: 17.07, y: 7.01, w: 1.89, h: 0.45,
    fontFace: FONT, fontSize: 21, color: C.LABEL_LIGHT,
 
```