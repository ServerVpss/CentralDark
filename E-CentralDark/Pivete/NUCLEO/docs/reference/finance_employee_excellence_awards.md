# REFERENCIA - finance_employee_excellence_awards.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_employee_excellence_awards.js
**SHA:** f977f67aeb7b40b2
**Timestamp:** 2026-08-28T02:52:33.466313
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.12;

### Ouro Bruto (primeiros 5000 chars)
```
// Recreates "Deliverable_13.pptx" — Afrinvest Excellence Awards 2026 deck
// using pptxgenjs. Run with: node generate.js
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// ---------- Image-aspect-aware sizing ----------
// To avoid any visual stretching or harsh cropping, read each photo's real
// pixel dimensions and fit the rendered frame to the source aspect ratio
// inside a target box (centered). This way the inserted image is its true
// w:h, never stretched, and never cropped.
function readJpegSize(filePath) {
  const buf = fs.readFileSync(filePath);
  // Walk JPEG markers looking for SOF0/SOF2 to read intrinsic dimensions.
  let i = 2; // skip SOI 0xFFD8
  while (i < buf.length) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    // SOF markers (excluding DHT/DAC/etc): 0xC0..0xCF except C4, C8, CC
    if (
      marker >= 0xC0 && marker <= 0xCF &&
      marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC
    ) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return { w, h };
    }
    i += 2 + len;
  }
  throw new Error(`Could not parse JPEG size: ${filePath}`);
}

// Fit image inside a target box, preserving aspect, anchored by `anchor`.
// anchor: "center" | "top" | "left" | "right" | "bottom"
function fitInBox(imgW, imgH, boxX, boxY, boxW, boxH, anchor = "center") {
  const imgAR = imgW / imgH;
  const boxAR = boxW / boxH;
  let w, h;
  if (imgAR > boxAR) {
    // image is wider than box -> width-constrained
    w = boxW; h = boxW / imgAR;
  } else {
    h = boxH; w = boxH * imgAR;
  }
  let x, y;
  switch (anchor) {
    case "left":   x = boxX;                          y = boxY + (boxH - h) / 2; break;
    case "right":  x = boxX + (boxW - w);             y = boxY + (boxH - h) / 2; break;
    case "top":    x = boxX + (boxW - w) / 2;         y = boxY; break;
    case "bottom": x = boxX + (boxW - w) / 2;         y = boxY + (boxH - h); break;
    default:       x = boxX + (boxW - w) / 2;         y = boxY + (boxH - h) / 2;
  }
  return { x, y, w, h };
}

// ---------- Palette ----------
const C = {
  plum:    "3D1F2F",   // deep wine / plum (slide 1, slide 9 background, dark accents)
  cream:   "FBF1E3",   // light cream background (slides 2, 6, 9 alt)
  sand:    "EFE4D2",   // sand/beige (slides 3, 5, 7)
  peach:   "F2DEC4",   // warmer peach (slide 8)
  terra:   "C75B3C",   // terracotta orange (accent shape, headlines)
  terraDk: "B14E33",   // deeper terracotta (slide 10 bg)
  gold:    "E1B748",   // mustard / gold yellow
  goldSft: "EBC976",   // softer gold (italic headline accent)
  ink:     "2E1622",   // very dark text on cream
  body:    "3F2A35",   // body text on cream
  muted:   "4A3A45",   // muted body
  quote:   "5B4350",   // italic quote text
};

const FONT_HEAD = "Georgia";   // serif w/ personality for "No. 0X" italics & headlines
const FONT_BODY = "Calibri";   // clean body sans
const FONT_DISP = "Calibri";   // display sans for headlines (matches original look)

// 16:9 — 10" x 5.625"
const SW = 10;
const SH = 5.625;

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Afrinvest Securities";
pres.title  = "The Excellence Awards 2026";

// ---------- Helpers ----------
const IMG_DIR = path.join(__dirname, "images");
function imgPath(name) { return path.join(IMG_DIR, name); }

// add a footer ("THE EXCELLENCE AWARDS 2026"  +  "NN / 10")
function addFooter(slide, pageNum, color = C.ink) {
  slide.addText("THE EXCELLENCE AWARDS 2026", {
    x: 0.45, y: 5.25, w: 5, h: 0.3,
    fontFace: FONT_BODY, fontSize: 9, color, charSpacing: 4, bold: false,
  });
  slide.addText(`${String(pageNum).padStart(2,"0")} / 10`, {
    x: 8.5, y: 5.25, w: 1.1, h: 0.3,
    fontFace: FONT_BODY, fontSize: 9, color, charSpacing: 4, align: "right",
  });
}

// Build an "honoree" slide (slides 3-8). Each gets unique accent shapes.
// opts: { num, category, name, role, quote, stat1Val, stat1Lbl, stat2Val, stat2Lbl,
//         photo, bgColor, decorate(slide) }
function addHonoreeSlide(opts) {
  const slide = pres.addSlide();
  slide.background = { color: opts.bgColor };

  // Decorative accent shapes behind/around the photo (per-slide)
  if (typeof opts.decorate === "function") opts.decorate(slide);

  // Photo — read source image's real aspect ratio and fit inside a target box,
  // preserving aspect (no stretch, no crop). Box is roughly square (matches the
  // square-ish frames in the original deck).
  const photoBox = { x: 0.85, y: 0.7, w: 3.4, h: 3.85 };
  const srcPath = imgPath(opts.photo);
  const srcSize = readJpegSize(srcPath);
  const fit = fitInBox(srcSize.w, srcSize.h, photoBox.x, photoBox.y, photoBox.w, photoBox.h, "center");
  slide.addImage({
    path: srcPath,
    x: fit.x, y: fit.y, w: fit.w, h: fit.h,
  });

  // Right column — text
  const RX = 5.0;        // right column x
  const RW = 4.5;        // right colum
```