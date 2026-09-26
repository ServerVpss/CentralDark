# MISSAO - pharma_product_launch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\pharma_product_launch_deck.js
**SHA:** 9d3159cb7d2bfa69
**Timestamp:** 2026-08-28T02:52:36.181777
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 22;
- const pillGap = 14;
- const gap = 48;
- const gap = 80;
- const phaseGap = 8;
- const pGap = 64;
- const mColGap = 24;
- const gap = 80;
- const cGap = 24;
- const gap = 96;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Forliver Deck — PPTX replica of Forliver_Deck.html
 * Uses pptxgenjs. Matches the HTML deck's 1920×1080 design canvas.
 *
 * Fonts are kept exactly as in the HTML (Newsreader, Geist, Geist Mono).
 * The user has the fonts installed locally, so no substitution is done.
 *
 * Unit conversion:
 *   Slide is 13.333 × 7.5 inches (LAYOUT_WIDE). That matches 1920×1080 @ 144 DPI.
 *   → 1 CSS px = 13.333/1920 in = 0.006944 in
 *   → 1 CSS px = 0.5 PPTX points (since 1 in = 72 pt)
 *   So:  font-size-pt = css-px × 0.5.
 */

const PptxGenJS = require('pptxgenjs');
const path = require('path');

// ---------- geometry helpers ----------
const PX_TO_IN = 13.333 / 1920;            // inches per css pixel
const PX_TO_PT = 0.5;                      // pt per css pixel
const px  = (v) => +(v * PX_TO_IN).toFixed(4);
const fpt = (cssPx) => +(cssPx * PX_TO_PT).toFixed(2);

// ---------- palette (matches :root CSS vars) ----------
const C = {
  bg:        'F4F1EB',
  bg2:       'EBE6DC',
  ink:       '0B1B2E',
  ink2:      '1F2D42',
  muted:     '6B7280',
  rule:      'D9D2C2',
  accent:    '123E6E',
  accent2:   '2F6BB0',
  paper:     'FBF9F5',
  sand:      'E3DCCC',
  inkInv:    'F4F1EB',
  // dark-slide helpers
  lightBlue: '9DC0EC',
  paleBlue:  'C9DAF0',
  deepBlue:  '0A3258',
  midBorder: '1F4B7D',
  darkRule:  '6A8CB8',
  darkMuted: '8CA6C7',
  darkSub:   'D7E4F4',
  phaseMuted:'B8CEE8',
};

// ---------- fonts (match HTML exactly) ----------
const F = {
  serif: 'Newsreader',
  sans:  'Geist',
  mono:  'Geist Mono',
};

// ---------- pptx init ----------
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inches — matches 1920×1080 16:9
pptx.title = 'Forliver — Introducing a breakthrough';
pptx.company = 'Aevena Therapeutics';

// ---------- low-level helpers ----------
function bg(slide, color) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.333, h: 7.5,
    fill: { color },
    line: { type: 'none' },
  });
}

function rule(slide, x, y, w, color = C.rule, thickness = 0.75) {
  // Horizontal line: use a 1-px tall strip so PowerPoint always gets positive cy.
  slide.addShape(pptx.ShapeType.line, {
    x: px(x), y: px(y), w: px(w), h: px(1),
    line: { color, width: thickness },
    flipV: false,
  });
}

/** Line from point (x1,y1) to (x2,y2) in CSS px. Handles any direction with
 *  positive cx/cy + flip flags so PowerPoint (strict schema) doesn't reject it. */
function segment(slide, x1, y1, x2, y2, lineOpts) {
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const w = Math.max(Math.abs(x2 - x1), 1);   // never zero
  const h = Math.max(Math.abs(y2 - y1), 1);
  // The default line goes from (x, y) top-left to (x+w, y+h) bottom-right.
  // We need flipV if the real direction is bottom-left → top-right.
  const goesRight = x2 >= x1;
  const goesDown  = y2 >= y1;
  const flipV = goesRight !== goesDown;  // XOR
  slide.addShape(pptx.ShapeType.line, {
    x: px(minX), y: px(minY), w: px(w), h: px(h),
    line: lineOpts,
    flipV,
  });
}

/** Text block positioned in CSS px. */
function text(slide, content, x, y, w, h, opts = {}) {
  slide.addText(content, {
    x: px(x), y: px(y), w: px(w), h: px(h),
    margin: 0,
    isTextBox: true,
    valign: 'top',
    wrap: true,
    ...opts,
  });
}

function rect(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.rect, {
    x: px(x), y: px(y), w: px(w), h: px(h),
    fill: opts.fill || { color: C.paper },
    line: opts.line || { color: C.rule, width: 0.75 },
  });
}

function pill(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: px(x), y: px(y), w: px(w), h: px(h),
    fill: opts.fill || { type: 'none' },
    line: opts.line || { color: C.ink, width: 0.75 },
    rectRadius: opts.rectRadius ?? Math.min(px(w), px(h)) / 2,
  });
}

function dot(slide, cx, cy, d, color, trans) {
  const fill = trans !== undefined ? { color, transparency: trans } : { color };
  slide.addShape(pptx.ShapeType.ellipse, {
    x: px(cx - d / 2), y: px(cy - d / 2),
    w: px(d), h: px(d),
    fill,
    line: { type: 'none' },
  });
}

/** Placeholder with a diagonal hatch and a corner label chip. */
function placeholder(slide, x, y, w, h, label, opts = {}) {
  const fillColor = opts.fill || C.sand;
  const lineColor = opts.line || C.rule;
  const labelBg = opts.labelBg || C.bg;
  const labelInk = opts.labelInk || C.ink;

  rect(slide, x, y, w, h, {
    fill: { color: fillColor },
    line: { color: lineColor, width: 0.75 },
  });

  const spacing = 24;
  const hatchHex = opts.hatchColor || C.ink;
  const hatchTrans = opts.hatchTrans ?? 92;
  for (let i = -h; i < w; i += spacing) {
    const x1 = i, y1 = 0;
    const x2 = i + h, y2 = h;
    const cx1 = Math.max(0, x1);
    const cy1 = Math.max(0, y1 + (cx1 - x1));
    const cx2 = Math.min(w, x2);
    const cy2 = Math.min(h, y2 - (x2 - cx2));
    if (cx2 > cx1 && cy2 > cy1) {
      slide.addShape(pptx.ShapeType.line, {
        x: px(x + cx1),
```