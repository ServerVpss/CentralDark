# COMANDO - urban_landscaping_service_proposal.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\urban_landscaping_service_proposal.js
**SHA:** f6819bd206b747b8
**Timestamp:** 2026-08-28T02:52:37.368254
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.33;
- const gap = 0.33;
- const gap = 0.23;
- const gap = 0.33;
- const pillGap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
// Rowhouse & Oak — Residential Services 2026
// Rebuilds the original deck using pptxgenjs.
//
// Usage:
//   npm install pptxgenjs
//   node build-deck.js
//
// Expects ./images/image1.jpeg, image2.jpeg, image3.jpeg alongside this file.

const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.defineLayout({ name: "RHO_16_9", width: 20, height: 11.25 });
pres.layout = "RHO_16_9";
pres.title = "Rowhouse & Oak — Residential Services 2026";

// ---------- Palette ----------
const C = {
    cream:       "F4EFE2",
    creamLight:  "FBF7EC",
    creamPaper:  "E6DCC3",
    forest:      "0F1A14",
    forestDeep:  "0D2018",
    forestMid:   "1F3B2D",   // main brand dark green (cover, card, contact panel)
    forestGrey:  "2A3A30",
    muted:       "3E5B43",
    greyText:    "4A5A50",
    greyLight:   "6B7A70",
    gold:        "CDB577",
    goldDeep:    "B08A3E",
    goldSoft:    "D9D0B6",
    rule:        "C9C0A8",
    white:       "FFFFFF",
};

const F = {
    header: "Georgia",
    body:   "Helvetica",
};

const IMG = {
    slide1:  path.join(__dirname, "images", "image1.jpeg"),
    slide6:  path.join(__dirname, "images", "image2.jpeg"),
    slide12: path.join(__dirname, "images", "image3.jpeg"),
};

// ---------- Common helpers ----------
const eyebrowOpts = {
    fontFace: F.body, fontSize: 10, color: C.greyText, charSpacing: 4,
};

function addHeader(slide, rightLabel) {
    slide.addShape("ellipse", {
        x: 1.04, y: 0.82, w: 0.14, h: 0.14,
        fill: { color: C.forest }, line: { color: C.forest },
    });
    slide.addText("ROWHOUSE & OAK", {
        x: 1.3, y: 0.68, w: 4.0, h: 0.33,
        ...eyebrowOpts,
    });
    if (rightLabel) {
        slide.addText(rightLabel, {
            x: 14.5, y: 0.68, w: 4.5, h: 0.33,
            ...eyebrowOpts, align: "right",
        });
    }
}

function bgCream(slide) {
    slide.background = { color: C.cream };
}

function bigTitle(s, text, y = 2.2, h = 2.4, w = 17.0, size = 64) {
    s.addText(text, {
        x: 1.04, y, w, h,
        fontFace: F.header, fontSize: size, color: C.forest,
        valign: "top", margin: 0,
    });
}

function subTitle(s, text, y, h = 1.4, w = 14.0, size = 22) {
    s.addText(text, {
        x: 1.04, y, w, h,
        fontFace: F.header, fontSize: size, color: C.greyText, italic: true,
        valign: "top",
    });
}

// ============================================================
// SLIDE 1 — Cover (full forest green + cream-framed photo on right)
// ============================================================
{
    const s = pres.addSlide();
    s.background = { color: C.forestMid };

    // Cream frame behind the image
    s.addShape("rect", {
        x: 10.6, y: 0.85, w: 8.58, h: 9.55,
        fill: { color: C.cream }, line: { color: C.cream },
    });
    s.addImage({ path: IMG.slide1, x: 10.82, y: 1.04, w: 8.13, h: 9.17 });

    // Top eyebrow
    s.addShape("ellipse", {
        x: 1.04, y: 1.18, w: 0.14, h: 0.14,
        fill: { color: C.gold }, line: { color: C.gold },
    });
    s.addText("ROWHOUSE & OAK · EST. 2016 · WASHINGTON, D.C.", {
        x: 1.3, y: 1.04, w: 9.0, h: 0.4,
        fontFace: F.body, fontSize: 11, color: C.goldSoft, charSpacing: 4,
    });

    // Big title — all cream, only the ampersand is gold
    s.addText([
        { text: "Rowhouse\n", options: { color: C.cream } },
        { text: "& ",         options: { color: C.gold } },
        { text: "Oak",        options: { color: C.cream } },
    ], {
        x: 1.04, y: 2.1, w: 9.22, h: 4.6,
        fontFace: F.header, fontSize: 115, valign: "top", margin: 0,
    });

    // Description
    s.addText(
        "A boutique landscaping company caring for the small yards, alleys, and gardens of urban Washington.",
        {
            x: 1.04, y: 7.1, w: 8.4, h: 2.0,
            fontFace: F.header, fontSize: 22, color: C.creamLight, italic: true,
            valign: "top",
        }
    );

    // Bottom labels
    s.addShape("line", {
        x: 1.04, y: 9.85, w: 9.22, h: 0,
        line: { color: C.muted, width: 0.5 },
    });
    s.addText("RESIDENTIAL SERVICES 2026", {
        x: 1.04, y: 10.0, w: 4.14, h: 0.5,
        fontFace: F.body, fontSize: 10, color: C.gold, charSpacing: 4,
    });
    s.addText("PREPARED FOR OUR NEIGHBORS", {
        x: 5.47, y: 10.0, w: 4.65, h: 0.5,
        fontFace: F.body, fontSize: 10, color: C.creamLight, charSpacing: 4,
    });

    // Page number in top-right of the photo (matches original)
    s.addText("NO. 01 / 12", {
        x: 16.3, y: 1.3, w: 2.4, h: 0.35,
        fontFace: F.body, fontSize: 10, color: C.forest, charSpacing: 4, align: "right",
    });
}

// ============================================================
// SLIDE 2 — The Problem (2x2 grid of points)
// ============================================================
{
    const s = pres.addSlide();
    bgCream(s);
    addHeader(s, "I. THE PROBLEM");

    bigTitle(s, "The urban yard is its own animal.", 1.8, 
```