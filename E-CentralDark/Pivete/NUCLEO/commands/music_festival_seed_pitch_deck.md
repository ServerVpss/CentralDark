# COMANDO - music_festival_seed_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\music_festival_seed_pitch_deck.js
**SHA:** 92f4ef83c25841fd
**Timestamp:** 2026-08-28T02:52:36.003422
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const tStart = 0.6;

### Gaps
- const gap = 0.25;
- const tY = 3.4, tH = 3.4, tW = 4.0, tGap = 0.08;

### Ouro Bruto (primeiros 5000 chars)
```
// PLUSH Festival Pitch Deck — recreated with pptxgenjs
// Font: Arial throughout. Orphan words prevented via non-breaking spaces.

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "PLUSH Festival — Seed Round 2027";

// ---------- Palette ----------
const C = {
  bg: "0A0A0B",          // near-black
  cream: "F4EFE6",       // soft cream
  pink: "FF1F6B",        // hot pink
  yellow: "E8FF38",      // electric yellow-green
  orange: "FF5A1F",      // orange
  white: "FFFFFF",
  ink: "0A0A0B",
  muted: "8A8A8A",
  mutedInk: "5A5A5A",
  hair: "2A2A2C",
};

const F = "Arial";
const NBSP = "\u00A0";

// Helper: prevent orphan (widow) — join last two words with non-breaking space
function noOrphan(s) {
  if (!s) return s;
  const t = s.replace(/\s+/g, " ").trim();
  const idx = t.lastIndexOf(" ");
  if (idx === -1) return t;
  return t.slice(0, idx) + NBSP + t.slice(idx + 1);
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Top pink header bar
  s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 0.38, fill: { color: C.pink }, line: { color: C.pink } });
  s.addText(
    [
      { text: "PLUSH FESTIVAL", options: { bold: true, color: C.white } },
      { text: "     ·     ", options: { color: C.white } },
      { text: "PHOENIX, ARIZONA", options: { color: C.white } },
      { text: "     ·     ", options: { color: C.white } },
      { text: "SEED ROUND 2027", options: { color: C.white } },
    ],
    { x: 0, y: 0, w: 13.333, h: 0.38, align: "center", valign: "middle",
      fontFace: F, fontSize: 9, charSpacing: 6, margin: 0 }
  );

  // Bottom yellow bar with genre strip
  s.addShape("rect", { x: 0, y: 7.12, w: 13.333, h: 0.38, fill: { color: C.yellow }, line: { color: C.yellow } });
  s.addText(
    "HOUSE     ·     TECH HOUSE     ·     TRANCE     ·     OPEN FORMAT     ·     SUNSET TO LATE",
    { x: 0, y: 7.12, w: 13.333, h: 0.38, align: "center", valign: "middle",
      fontFace: F, fontSize: 9, bold: true, color: C.ink, charSpacing: 6, margin: 0 }
  );

  // Giant "PLUSH" wordmark — P and H pink, L and S yellow, U orange
  const wm = [
    { ch: "P", color: C.pink },
    { ch: "L", color: C.yellow },
    { ch: "U", color: C.orange },
    { ch: "S", color: C.yellow },
    { ch: "H", color: C.pink },
  ];
  // Layout the wordmark across the slide (tight, single row)
  // Per-letter adjustments:
  //   U has a rounded bottom that's optically drawn taller than flat letters,
  //   so its top overshoots the cap line of P/L/S/H. Nudge it DOWN a hair.
  //   Also widen U's slot slightly so it doesn't kiss the S next to it.
  const wmY = 1.5;
  const wmH = 3.5;
  const letterW = 2.25;
  const uExtraW = 0.15;
  const totalW = letterW * wm.length + uExtraW;
  const wmStartX = (13.333 - totalW) / 2;
  let cursorX = wmStartX;
  wm.forEach((L) => {
    const isU = L.ch === "U";
    const thisW = letterW + (isU ? uExtraW : 0);
    const yOffset = isU ? 0.06 : 0;
    s.addText(L.ch, {
      x: cursorX, y: wmY + yOffset, w: thisW, h: wmH,
      align: "center", valign: "middle",
      fontFace: F, fontSize: 260, bold: true, color: L.color, charSpacing: -10, margin: 0,
    });
    cursorX += thisW;
  });

  // Below wordmark: subtitle and details (left) + date (right)
  s.addText("SEED ROUND · MARCH 2027", {
    x: 0.6, y: 5.35, w: 8, h: 0.35,
    fontFace: F, fontSize: 11, bold: true, color: C.white, charSpacing: 8, margin: 0,
  });

  // Thin divider line
  s.addShape("line", {
    x: 0.6, y: 5.78, w: 12.15, h: 0,
    line: { color: C.hair, width: 0.75 },
  });

  s.addText("A two-day desert dance festival", {
    x: 0.6, y: 5.9, w: 8, h: 0.4,
    fontFace: F, fontSize: 16, color: C.white, bold: true, margin: 0,
  });
  s.addText("Steele Indian School Park  ·  Phoenix, AZ", {
    x: 0.6, y: 6.3, w: 8, h: 0.35,
    fontFace: F, fontSize: 13, color: C.cream, margin: 0,
  });

  // Date block right
  s.addText("MAR 13–14 · 2027", {
    x: 8.5, y: 5.9, w: 4.25, h: 0.7,
    align: "right", valign: "middle",
    fontFace: F, fontSize: 28, bold: true, color: C.yellow, charSpacing: 2, margin: 0,
  });
}

// ============================================================
// Shared helper: content-slide header + footer
// ============================================================
function addHeader(s, eyebrow, onDark = false, colorOverride = null) {
  s.addText(eyebrow, {
    x: 0.6, y: 0.45, w: 10, h: 0.3,
    fontFace: F, fontSize: 10, bold: true,
    color: colorOverride || C.pink,
    charSpacing: 8, margin: 0,
  });
}
function addFooter(s, pageNo, onDark = false, colorOverride = null) {
  const c = colorOverride || (onDark ? C.cream : C.mutedInk);
  s.addText("PLUSH · 2027", {
    x: 0.6, y: 7.05, w: 4, h: 0.3,
    fontFace: F, fontSize: 9, bold: true, color: c, charSpacing: 6, margin:
```