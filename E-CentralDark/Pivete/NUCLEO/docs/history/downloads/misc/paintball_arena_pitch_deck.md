# OUTRO - paintball_arena_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\paintball_arena_pitch_deck.js
**SHA:** 2988eb6658d4868b
**Timestamp:** 2026-08-28T02:52:36.375712
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node battery_paintball.js

### Ouro Bruto (primeiros 5000 chars)
```
// battery_paintball.js
// Recreates Battery_Paintball.pptx using pptxgenjs.
// Run: node battery_paintball.js
// Requires: npm install -g pptxgenjs (or add locally)

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// ---------- Layout ----------
// Original deck is 20" x 11.25" (16:9 widescreen, oversized).
pres.defineLayout({ name: "BATTERY_WIDE", width: 20, height: 11.25 });
pres.layout = "BATTERY_WIDE";
pres.title = "Battery Paintball";
pres.author = "Battery";

const SW = 20;      // slide width
const SH = 11.25;   // slide height

// ---------- Palette ----------
const BG      = "0F0F0F"; // near-black background
const YELLOW  = "F5C518"; // Battery yellow
const CREAM   = "EDE7D8"; // off-white body text
const DIM     = "9A9A9A"; // muted gray
const MUTED   = "6B6B6B"; // darker muted (faded "MANHATTAN")
const LINE    = "3A3A3A"; // thin divider line
const ORANGE  = "E2661E"; // ARENA 02 tag

// Fonts
const HEAD = "Arial Black";
const BODY = "Arial";

// ---------- Small helpers ----------
function addHeaderBar(slide, fileNum, rightLabel, topLabel) {
  // Top-left: "▸  FILE xx / 10" and (optional) secondary line below
  slide.addText("▸", {
    x: 0.6, y: 0.45, w: 0.3, h: 0.35,
    fontFace: BODY, fontSize: 12, color: YELLOW, bold: true, valign: "middle",
  });
  slide.addText(`FILE ${fileNum} / 10`, {
    x: 0.95, y: 0.4, w: 3.5, h: 0.4,
    fontFace: BODY, fontSize: 13, color: DIM, charSpacing: 4, valign: "middle", margin: 0,
  });
  if (topLabel) {
    slide.addText(topLabel, {
      x: 0.95, y: 0.75, w: 4, h: 0.4,
      fontFace: BODY, fontSize: 13, color: YELLOW, charSpacing: 4, valign: "middle", margin: 0,
    });
  }
  // Top-right label
  slide.addText(rightLabel, {
    x: SW - 5.5, y: 0.4, w: 5, h: 0.4,
    fontFace: BODY, fontSize: 13, color: DIM, charSpacing: 4,
    align: "right", valign: "middle", margin: 0,
  });
}

function addFooter(slide, left, right) {
  if (left) {
    slide.addText(left, {
      x: 0.6, y: SH - 0.7, w: 5, h: 0.4,
      fontFace: BODY, fontSize: 12, color: DIM, charSpacing: 4,
      align: "left", valign: "middle", margin: 0,
    });
  }
  if (right) {
    slide.addText(right, {
      x: SW - 6.1, y: SH - 0.7, w: 5.5, h: 0.4,
      fontFace: BODY, fontSize: 12, color: DIM, charSpacing: 4,
      align: "right", valign: "middle", margin: 0,
    });
  }
}

// =============================================================
// SLIDE 1 — Title
// =============================================================
{
  const s = pres.addSlide();
  s.background = { color: BG };

  // Top yellow band
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SW, h: 0.45, fill: { color: YELLOW }, line: { color: YELLOW },
  });
  // Bottom yellow band
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: SH - 0.45, w: SW, h: 0.45, fill: { color: YELLOW }, line: { color: YELLOW },
  });

  // Top-left circle + FILE 01 / 10
  s.addShape(pres.shapes.OVAL, {
    x: 0.85, y: 1.0, w: 0.4, h: 0.4,
    fill: { type: "solid", color: BG }, line: { color: YELLOW, width: 1.25 },
  });
  s.addText("FILE 01 / 10", {
    x: 1.45, y: 1.0, w: 3, h: 0.4,
    fontFace: BODY, fontSize: 14, color: YELLOW, charSpacing: 5, valign: "middle", margin: 0,
  });

  // Top-right tag
  s.addText("BATTERY // CHELSEA // 2026", {
    x: SW - 6.6, y: 1.0, w: 6, h: 0.4,
    fontFace: BODY, fontSize: 14, color: YELLOW, charSpacing: 5,
    align: "right", valign: "middle", margin: 0,
  });

  // Massive BATTERY wordmark — split into 3 runs so the T is yellow.
  s.addText(
    [
      { text: "BAT",    options: { color: CREAM  } },
      { text: "T",      options: { color: YELLOW } },
      { text: "ERY.",   options: { color: CREAM  } },
    ],
    {
      x: 0.8, y: 3.0, w: SW - 1.6, h: 3.8,
      fontFace: HEAD, fontSize: 240, bold: true,
      align: "left", valign: "middle", margin: 0, charSpacing: -6,
      wrap: false,
    }
  );

  // Tagline bottom-left
  s.addText(
    [
      { text: "Manhattan's first and only ", options: { color: CREAM } },
      { text: "paintball arena.",            options: { color: YELLOW } },
    ],
    {
      x: 0.85, y: SH - 1.6, w: 10, h: 0.6,
      fontFace: BODY, fontSize: 22, align: "left", valign: "middle", margin: 0,
    }
  );

  // Bottom-right credit block (three stacked lines)
  s.addText(
    [
      { text: "CHAMBER OF COMMERCE", options: { breakLine: true } },
      { text: "INVESTOR PREVIEW APR", options: { breakLine: true } },
      { text: "2026" },
    ],
    {
      x: SW - 5.5, y: SH - 2.6, w: 4.7, h: 1.5,
      fontFace: BODY, fontSize: 13, color: DIM, charSpacing: 4,
      align: "right", valign: "middle", margin: 0, paraSpaceAfter: 2,
    }
  );
}

// =============================================================
// SLIDE 2 — THE PROBLEM
// =============================================================
{
  const s = pres.addSlide();
  s.background = { color: BG };

  addHeaderBar(s, "02", "THE GAP", "THE PROBLEM");

  // Headline — 3 lines, middle line
```