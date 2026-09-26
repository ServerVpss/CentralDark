# PADRAO - public_health_snus_field_guide.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\public_health_snus_field_guide.js
**SHA:** 351024773d46a521
**Timestamp:** 2026-08-28T02:52:36.335130
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node snus-field-guide.js

### Gaps
- const rowGap = 0.42;
- const rowGap = 1.0;

### Ouro Bruto (primeiros 5000 chars)
```
// snus-field-guide.js
// Recreates "Snus — A Field Guide" using pptxgenjs.
// Run: node snus-field-guide.js
//
// Output: ./snus-field-guide.pptx

const pptxgen = require("pptxgenjs");

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bgLight:   "EFEAE0", // cream/sand main background
  bgPanel:   "E7E0D2", // slightly darker panel for left-side illustrations
  bgDark:    "1E2820", // dark green/charcoal (slides 4 & 10)
  ink:       "1E2820", // primary text (also used for dark BGs ↔ inverted)
  inkSoft:   "5C5C50", // body/secondary
  muted:     "9A9A82", // small caps / monospace metadata
  rule:      "C9C2B2", // hairline rules
  accent:    "B26B3A", // burnt orange / copper
  accentSoft:"D4A77A", // softer copper for shapes
  paperOnDark: "EFEAE0", // light text on dark
  mutedOnDark: "6B7268",
};

// ─── Fonts ──────────────────────────────────────────────────────────────────
const F = {
  serif:  "Georgia",            // big titles + italic accents
  sans:   "Calibri",            // body
  mono:   "Consolas",           // metadata / labels
};

// ─── Layout ─────────────────────────────────────────────────────────────────
const W = 13.333;
const H = 7.5;
const M = 0.6; // margin

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "Snus — A Field Guide";
pres.author = "Field Guide";

// ─── Helpers ────────────────────────────────────────────────────────────────
function addHeader(slide, num, sectionLabel, dark = false) {
  const col = dark ? C.mutedOnDark : C.muted;
  // Top-left: page indicator
  slide.addText(
    [
      { text: String(num).padStart(2, "0"), options: { color: col } },
      { text: " / ", options: { color: col } },
      { text: "10", options: { color: col } },
    ],
    {
      x: M, y: 0.35, w: 3, h: 0.3,
      fontFace: F.mono, fontSize: 9, charSpacing: 2, margin: 0,
    }
  );
  // Top-right: section label
  slide.addText(sectionLabel, {
    x: W - M - 5, y: 0.35, w: 5, h: 0.3,
    fontFace: F.mono, fontSize: 9, color: col,
    align: "right", charSpacing: 4, margin: 0,
  });
}

function addFooter(slide, num, dark = false) {
  const col = dark ? C.mutedOnDark : C.muted;
  slide.addText("SNUS  ·  A FIELD GUIDE", {
    x: M, y: H - 0.55, w: 4, h: 0.3,
    fontFace: F.mono, fontSize: 9, color: col,
    charSpacing: 4, margin: 0,
  });
  slide.addText(String(num).padStart(2, "0"), {
    x: W - M - 1, y: H - 0.55, w: 1, h: 0.3,
    fontFace: F.mono, fontSize: 9, color: col,
    align: "right", charSpacing: 2, margin: 0,
  });
}

// Hairline rule
function rule(slide, x, y, w, color = C.rule) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width: 0.5 },
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — COVER
// ════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bgLight };

  // Right-side panel with concentric rings (a tin of snus, abstracted)
  const panelX = W * 0.52;
  s.addShape(pres.shapes.RECTANGLE, {
    x: panelX, y: 0, w: W - panelX, h: H,
    fill: { color: C.bgPanel }, line: { color: C.bgPanel, width: 0 },
  });

  // Concentric rings centered in the panel
  const cx = panelX + (W - panelX) / 2;
  const cy = H / 2;
  const ringColor = "B8B5A0";
  for (let i = 7; i >= 1; i--) {
    const r = 0.5 + i * 0.55;
    s.addShape(pres.shapes.OVAL, {
      x: cx - r, y: cy - r, w: r * 2, h: r * 2,
      fill: { type: "none" },
      line: { color: ringColor, width: 0.4 },
    });
  }
  // Horizontal dotted axis
  s.addShape(pres.shapes.LINE, {
    x: panelX + 0.5, y: cy, w: W - panelX - 1, h: 0,
    line: { color: ringColor, width: 0.5, dashType: "dash" },
  });
  // Inner ellipse pair (the pouch silhouette)
  s.addShape(pres.shapes.OVAL, {
    x: cx - 1.7, y: cy - 0.85, w: 3.4, h: 1.7,
    fill: { type: "none" },
    line: { color: C.ink, width: 1.25 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: cx - 1.15, y: cy - 0.55, w: 2.3, h: 1.1,
    fill: { type: "none" },
    line: { color: ringColor, width: 0.6 },
  });

  // Top-left mono label
  s.addText("A FIELD GUIDE  ·  2026", {
    x: M, y: 0.7, w: 5, h: 0.3,
    fontFace: F.mono, fontSize: 10, color: C.muted,
    charSpacing: 6, margin: 0,
  });

  // Big title "Snus." with italic middle
  s.addText(
    [
      { text: "Sn", options: { fontFace: F.serif, italic: false } },
      { text: "u", options: { fontFace: F.serif, italic: true } },
      { text: "s.", options: { fontFace: F.serif, italic: false } },
    ],
    {
      x: M, y: 2.5, w: 7, h: 1.7,
      fontSize: 130, color: C.ink, bold: false, margin: 0,
    }
  );

  // Subtitle
  s.addText(
    "A four-hundred-year-old Swedish habit, quietly reshaping the global nicotine market — one tucked pouch at a time.",
    {
      x: M, y: 4.4, w: 5.6, h: 1.1,
      fontFace: F.sans, fontSize: 16, color: C.inkSoft,
      lineSpacingMul
```