# COMANDO - ai_blockchain_market_briefing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\ai_blockchain_market_briefing.js
**SHA:** ec9a13dfb932f468
**Timestamp:** 2026-08-28T02:52:32.159766
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- { risk: "Prompt & Tool\nInjection",   sev: "HIGH",   sevColor: C.orange,
- { risk: "Key Management",              sev: "HIGH",   sevColor: C.orange,
- { risk: "Runaway Spend",               sev: "MEDIUM", sevColor: C.ink,
- { risk: "Regulatory Ambiguity",        sev: "MEDIUM", sevColor: C.ink,

### Gaps
- const gap = 12; // degrees to subtract on each side for the node
- const chipW = 2.0, chipH = 0.45, chipGap = 0.18;
- const cardY0 = 3.9, cardH = 1.95, cardGap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
// AI_Agents_Blockchain.pptx replica using pptxgenjs
// Custom layout: 20" x 11.25"

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.defineLayout({ name: "CUSTOM_20x11_25", width: 20, height: 11.25 });
pres.layout = "CUSTOM_20x11_25";
pres.author = "Market Briefing";
pres.title = "AI Agents on Blockchain — Market Briefing";

// =========================================================
// PALETTE
// =========================================================
const C = {
  bg: "F3EFE7",           // cream background
  ink: "0E0E0E",          // near-black
  ink2: "1A1A1A",
  mute: "8A857A",         // muted gray-brown (eyebrow / footer text)
  muteDk: "6E6A60",       // slightly darker muted
  rule: "C9C2B2",         // hairline rule
  ruleLt: "DCD6C7",       // lighter hairline (separators in lists)
  orange: "FF4A1C",       // primary accent
  orangeSoft: "FFE4DA",   // soft accent bg
  white: "FFFFFF",
  black: "000000",
};

const FONT_H = "Helvetica Neue";       // falls back to Arial on most systems
const FONT_B = "Helvetica Neue";
const FONT_MONO = "Courier New";

// =========================================================
// HELPERS — shared chrome (eyebrow, page num, footer)
// =========================================================
function addChrome(slide, opts) {
  const {
    topLeft = "",
    topRight = "",           // e.g. "02 / 12"
    bottomLeft = "",
    bottomRight = "Market Briefing",
    chromeColor = C.mute,
    showRule = true,
    ruleColor = C.rule,
  } = opts || {};

  // Top-left eyebrow
  if (topLeft) {
    slide.addText(topLeft, {
      x: 0.6, y: 0.38, w: 10, h: 0.35,
      fontFace: FONT_H, fontSize: 11, color: chromeColor,
      charSpacing: 2, bold: false, margin: 0,
    });
  }
  // Top-right page indicator
  if (topRight) {
    slide.addText(topRight, {
      x: 17.5, y: 0.38, w: 1.9, h: 0.35,
      fontFace: FONT_H, fontSize: 11, color: chromeColor,
      align: "right", charSpacing: 2, margin: 0,
    });
  }
  // Bottom rule
  if (showRule) {
    slide.addShape(pres.shapes.LINE, {
      x: 0.6, y: 10.45, w: 18.8, h: 0,
      line: { color: ruleColor, width: 0.5 },
    });
  }
  // Bottom-left
  if (bottomLeft) {
    slide.addText(bottomLeft, {
      x: 0.6, y: 10.6, w: 10, h: 0.3,
      fontFace: FONT_B, fontSize: 11, color: chromeColor, margin: 0,
    });
  }
  // Bottom-right
  if (bottomRight) {
    slide.addText(bottomRight, {
      x: 9.4, y: 10.6, w: 10, h: 0.3,
      fontFace: FONT_B, fontSize: 11, color: chromeColor,
      align: "right", margin: 0,
    });
  }
}

// Section tag like "§ 02 — THE THESIS"
function addSectionTag(slide, text, x, y, color = C.muteDk) {
  slide.addText(text, {
    x, y, w: 8, h: 0.35,
    fontFace: FONT_H, fontSize: 12, color, charSpacing: 2, margin: 0,
  });
}

// Build the nested hexagon target SVG (used on slide 1)
function buildHexTargetSVG() {
  const cx = 300, cy = 300;  // SVG center
  const radii = [280, 220, 160, 105, 55];
  const point = (r, deg) => {
    const a = (Math.PI / 180) * deg;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const hexPath = (r) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const [x, y] = point(r, -90 + 60 * i);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">`;
  // Nested hexagon outlines
  radii.forEach((r) => {
    svg += `<polygon points="${hexPath(r)}" fill="none" stroke="#6E6A60" stroke-width="0.8"/>`;
  });
  // Vertex dots on outermost hex — alternate orange/black
  for (let i = 0; i < 6; i++) {
    const [px, py] = point(radii[0], -90 + 60 * i);
    const color = i % 2 === 0 ? "#FF4A1C" : "#0E0E0E";
    svg += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="9" fill="${color}"/>`;
  }
  // Concentric rings at center + solid orange core
  svg += `<circle cx="${cx}" cy="${cy}" r="40" fill="none" stroke="#FF4A1C" stroke-width="1"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="22" fill="none" stroke="#FF4A1C" stroke-width="1.2"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="12" fill="#FF4A1C"/>`;
  svg += `</svg>`;
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

// Build the agent loop diagram SVG (used on slide 6)
function buildAgentLoopSVG() {
  const W = 780, H = 650;
  const cx = W / 2, cy = H / 2 + 10;
  const r = 200;
  // 4 nodes at compass positions
  const nodes = [
    { deg: -90, lines: ["01", "OBSERVE"] },
    { deg:   0, lines: ["02", "DECIDE"]  },
    { deg:  90, lines: ["03", "SIGN TX"] },
    { deg: 180, lines: ["04", "SETTLE"]  },
  ];
  const pt = (deg, rad = r) => {
    const a = (Math.PI / 180) * deg;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  const nodeR = 50;
  // Build arcs between consecutive nodes with a small gap for node radius + arrowhead
  const gap = 12; // degrees to subtract on each side for the node
  let svg = `<svg xmlns="http:
```