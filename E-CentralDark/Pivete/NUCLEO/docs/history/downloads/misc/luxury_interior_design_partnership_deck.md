# OUTRO - luxury_interior_design_partnership_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\luxury_interior_design_partnership_deck.js
**SHA:** 4dccdc6be69e35da
**Timestamp:** 2026-08-28T02:52:35.633540
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Rebuild using pptxgenjs. Run: node build.js

### Gaps
- const gap  = 0.2;
- const gap  = 0.2;
- const gap  = 0.2;
- const gap  = 0.25;

### Ouro Bruto (primeiros 5000 chars)
```
// Chic Interior · Partnership Deck 2026
// Rebuild using pptxgenjs. Run: node build.js
// Output: Interior_Design.pptx

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";   // 13.333 x 7.5 (matches the 16:9 source rendering)
pres.title  = "Chic Interior · Partnership Deck 2026";
pres.author = "Chic Interior";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const SW = 13.333;   // slide width
const SH = 7.5;      // slide height

const C = {
  bodyLight:   "F4F2EB",   // off-white body background (slides 1-5,7,8)
  bodyWarm:    "E8E5D6",   // warm greige background (slide 4)
  bodyDark:    "141414",   // dark background (slides 6, 9)
  imageBlock:  "DDD8C7",   // placeholder image block tone
  imageBlockDk:"2A2A28",   // image block tone on dark bg (slide 9 not needed)
  captionBg:   "EFEBDE",   // caption overlay on image blocks
  ink:         "141414",   // primary text on light bg
  inkSoft:     "3C3A34",   // secondary dark text
  mute:        "8A8678",   // muted / small caps on light
  muteLight:   "A8A496",   // muted on dark
  rule:        "C9C3B2",   // hairline on light
  ruleDark:    "3A3830",   // hairline on dark
  onDark:      "F4F2EB",   // text on dark
  onDarkMute:  "9A9689",   // muted text on dark
};

const F = {
  head: "Helvetica Neue",  // display / headlines
  body: "Helvetica Neue",  // body
  mono: "Helvetica Neue",  // small caps eyebrows & footers
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Small-caps "eyebrow" label (e.g. "01 · THE STUDIO")
function eyebrow(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.7,
    y: opts.y ?? 0.55,
    w: opts.w ?? 8,
    h: 0.35,
    fontFace: F.mono,
    fontSize: opts.fontSize ?? 10,
    color: opts.color ?? C.mute,
    charSpacing: 6,
    bold: false,
    margin: 0,
  });
}

// Running footer: brand + page number
function footer(slide, pageNum, onDark = false) {
  const col = onDark ? C.onDarkMute : C.mute;
  slide.addText("CHIC INTERIOR", {
    x: 0.7, y: SH - 0.5, w: 4, h: 0.3,
    fontFace: F.mono, fontSize: 9, color: col, charSpacing: 5, margin: 0,
  });
  slide.addText(`${String(pageNum).padStart(2, "0")} / 09`, {
    x: SW - 2.0, y: SH - 0.5, w: 1.3, h: 0.3,
    fontFace: F.mono, fontSize: 9, color: col, charSpacing: 5,
    align: "right", margin: 0,
  });
}

// Thin horizontal rule
function rule(slide, x, y, w, color = C.rule) {
  slide.addShape("line", {
    x, y, w, h: 0,
    line: { color, width: 0.5 },
  });
}

// Image placeholder block with a caption strip near the bottom-left
function imageBlock(slide, x, y, w, h, caption, opts = {}) {
  const bg = opts.bg ?? C.imageBlock;
  slide.addShape("rect", {
    x, y, w, h,
    fill: { color: bg },
    line: { color: bg, width: 0 },
  });
  if (caption) {
    const capH = opts.capH ?? 0.5;
    // Caption sits inset from the left edge of the tile.
    // Default width uses most of the tile, bounded to keep the proportion nice.
    const capW = opts.capW ?? Math.min(w - 0.4, 4.2);
    const capX = x + 0.2;
    const capY = y + h - capH - 0.2;
    slide.addShape("rect", {
      x: capX, y: capY, w: capW, h: capH,
      fill: { color: C.captionBg },
      line: { color: C.rule, width: 0.5 },
    });
    slide.addText(caption, {
      x: capX, y: capY, w: capW, h: capH,
      fontFace: F.mono, fontSize: 9, color: C.inkSoft,
      charSpacing: 4, align: "center", valign: "middle",
      margin: 0.05,
    });
  }
}

// ---------------------------------------------------------------------------
// Slide 1 — Title / Cover
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: C.bodyLight };

  // Right half: full-bleed hero "image"
  const heroX = 6.55;
  const heroW = SW - heroX;
  imageBlock(
    s,
    heroX, 0, heroW, SH,
    "IMG · FULL-BLEED HERO · LIVING ROOM, BEL AIR RESIDENCE",
    { capW: heroW - 0.3, capH: 0.45 }
  );

  // Brand lockup (top-left)
  s.addText("Chic Interior", {
    x: 0.7, y: 0.55, w: 5, h: 0.5,
    fontFace: F.head, fontSize: 18, italic: true, color: C.ink, margin: 0,
  });
  s.addText("LOS ANGELES", {
    x: 0.7, y: 1.0, w: 5, h: 0.3,
    fontFace: F.mono, fontSize: 10, color: C.mute, charSpacing: 6, margin: 0,
  });

  // Eyebrow above headline
  s.addText("PARTNERSHIP DECK  ·  2026", {
    x: 0.7, y: 2.35, w: 6, h: 0.3,
    fontFace: F.mono, fontSize: 11, color: C.mute, charSpacing: 7, margin: 0,
  });

  // Headline
  s.addText(
    [
      { text: "Chic ",      options: { fontFace: F.head, fontSize: 66, color: C.ink } },
      { text: "Interior",   options: { fontFace: F.head, fontSize: 66, color: C.ink, italic: true } },
      { text: ".",          options: { font
```