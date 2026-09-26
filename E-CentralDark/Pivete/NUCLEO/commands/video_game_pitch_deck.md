# COMANDO - video_game_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\video_game_pitch_deck.js
**SHA:** 954317e99bf3eaa4
**Timestamp:** 2026-08-28T02:52:37.579901
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cardY = 3.6, cardH = 3.3, gap = 0.2;
- const gap = 0.18;
- const swTop = 5.7, swH = 1.25, swGap = 0.08;
- const cardTop = 4.1, cardH = 2.35, gap = 0.25;
- const cardTop = 3.1, cardH = 3.6, gap = 0.18;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * SoccerX Pitch Deck - pptxgenjs recreation
 * A 12-slide pitch deck for a fictional next-gen football video game.
 *
 * Usage: node build_soccerx.js
 * Output: SoccerX_Pitch_Deck.pptx
 */

const pptxgen = require("pptxgenjs");

// ---- Palette ----------------------------------------------------------------
const INK       = "0A0D14"; // dark navy/ink background
const INK_SOFT  = "11151E"; // subtle card background
const INK_CARD  = "0F131C"; // card fill
const CHALK     = "F4F1E8"; // near-white text
const MUTE      = "8A93A6"; // muted secondary text
const MUTE_2    = "5A6478"; // even more muted
const LINE      = "2A3040"; // divider lines
const KICKOFF   = "FF3D2E"; // red accent (primary)
const FLOODLIGHT= "FFB020"; // amber accent
const PITCH     = "1E5A2E"; // green accent
const GOLD      = "FFC857"; // gold/yellow star

// ---- Layout -----------------------------------------------------------------
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const MARGIN_X = 0.55;

// ---- Helpers ----------------------------------------------------------------
// Helpers
// Draw a line from (x1,y1) to (x2,y2), handling negative dw/dh by flipping
function drawLine(slide, x1, y1, x2, y2, opts) {
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);
  const goingDown = (x2 - x1) * (y2 - y1) >= 0; // both deltas same sign (or one zero)
  slide.addShape("line", {
    x, y, w, h,
    flipV: !goingDown,
    line: opts,
  });
}

function addBackground(slide) {
  slide.background = { color: INK };
}

// Subtle grid background for title slide
function addGrid(slide) {
  const gridColor = "1A1F2B";
  const cols = 12, rows = 7;
  const cellW = SLIDE_W / cols;
  const cellH = SLIDE_H / rows;
  for (let i = 1; i < cols; i++) {
    slide.addShape("line", {
      x: i * cellW, y: 0, w: 0, h: SLIDE_H,
      line: { color: gridColor, width: 0.5 }
    });
  }
  for (let i = 1; i < rows; i++) {
    slide.addShape("line", {
      x: 0, y: i * cellH, w: SLIDE_W, h: 0,
      line: { color: gridColor, width: 0.5 }
    });
  }
}

// Top-left logo "• SOCCERX"
function addLogo(slide) {
  // red dot
  slide.addShape("ellipse", {
    x: 0.55, y: 0.38, w: 0.11, h: 0.11,
    fill: { color: KICKOFF }, line: { color: KICKOFF }
  });
  // wordmark
  slide.addText("SOCCERX", {
    x: 0.55, y: 0.5, w: 1.6, h: 0.28,
    fontSize: 10, fontFace: "Arial", bold: true,
    color: CHALK, charSpacing: 2, margin: 0
  });
}

// Top-right page indicator like "02 / 12 · VISION"
function addPageNum(slide, n, section) {
  const label = section
    ? `${String(n).padStart(2, "0")} / 12 · ${section}`
    : `${String(n).padStart(2, "0")} / 12`;
  slide.addText(label, {
    x: SLIDE_W - 3.3, y: 0.42, w: 2.7, h: 0.3,
    fontSize: 9, fontFace: "Consolas", color: CHALK,
    charSpacing: 3, align: "right", margin: 0
  });
}

// Bottom-left caption text
function addFootL(slide, text) {
  slide.addText(text, {
    x: 0.55, y: SLIDE_H - 0.42, w: 6, h: 0.25,
    fontSize: 9, fontFace: "Consolas", color: MUTE,
    charSpacing: 3, margin: 0
  });
}

// Bottom-right page marker like "§03"
function addFootR(slide, text) {
  slide.addText(text, {
    x: SLIDE_W - 2.5, y: SLIDE_H - 0.42, w: 1.95, h: 0.25,
    fontSize: 9, fontFace: "Consolas", color: MUTE,
    charSpacing: 3, align: "right", margin: 0
  });
}

// Standard frame: background + logo + page num + footers
function addFrame(slide, n, section, footL, footR) {
  addBackground(slide);
  addLogo(slide);
  addPageNum(slide, n, section);
  if (footL) addFootL(slide, footL);
  if (footR) addFootR(slide, footR);
}

// Small red accent tick (e.g. before "THE ONE-LINER")
function addEyebrow(slide, x, y, label) {
  slide.addShape("line", {
    x: x, y: y + 0.12, w: 0.25, h: 0,
    line: { color: KICKOFF, width: 1.5 }
  });
  slide.addText(label, {
    x: x + 0.35, y: y, w: 4, h: 0.28,
    fontSize: 10, fontFace: "Consolas", color: CHALK,
    charSpacing: 3, margin: 0
  });
}

// ============================================================================
// Build presentation
// ============================================================================
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "SoccerX Pitch Deck";
pres.author = "SoccerX";

// ============================================================================
// SLIDE 1 — Title
// ============================================================================
{
  const s = pres.addSlide();
  addBackground(s);
  addGrid(s);
  addLogo(s);
  addPageNum(s, 1);

  // "—— PITCH DOCUMENT · VOL. 01"
  s.addShape("line", {
    x: 0.9, y: 1.62, w: 0.35, h: 0,
    line: { color: KICKOFF, width: 1.5 }
  });
  s.addText("PITCH DOCUMENT · VOL. 01", {
    x: 1.35, y: 1.5, w: 4, h: 0.3,
    fontSize: 11, fontFace: "Consolas", color: CHALK,
    charSpacing: 4, margin: 0
  });

  // Top-right tagline
  s.addText([
    { text: "A new challenger enters", options: { breakLin
```