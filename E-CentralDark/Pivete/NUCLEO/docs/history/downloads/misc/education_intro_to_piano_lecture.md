# OUTRO - education_intro_to_piano_lecture.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\education_intro_to_piano_lecture.js
**SHA:** e888ae456179e728
**Timestamp:** 2026-08-28T02:52:34.092754
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const nStart = stX + 0.6, nEnd = stX + stW - 0.3;

### Gaps
- const fingerGap = 0.15;
- const lineGap = 0.28;
- const gap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
// Introduction to Piano - pptxgenjs replica
const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
pres.title = "Introduction to Piano";

// Palette
const CREAM = "F0EBE0";
const DARK = "1A1A1A";
const RED = "8B1F2B";
const MUTED = "9BA193";       // sage-gray for meta text
const BODY = "2B2B2B";
const LINE = "C9C3B5";
const DARK_BG = "0F0E0C";
const GOLD = "C9A86A";
const CREAM_LIGHT = "EDE6D9";

const FH = "Calibri";   // header
const FB = "Calibri";   // body

// Common helpers ----------------------------------------------
function addTopMeta(slide, chapterText, pageText) {
    if (chapterText) {
        slide.addText(chapterText, {
            x: 0.6, y: 0.42, w: 5, h: 0.3,
            fontFace: FB, fontSize: 11, bold: false,
            color: RED, charSpacing: 4
        });
    }
    if (pageText) {
        slide.addText(pageText, {
            x: 8.3, y: 0.42, w: 4.4, h: 0.3,
            fontFace: FB, fontSize: 11,
            color: MUTED, charSpacing: 4, align: "right"
        });
    }
}
function addFooter(slide, color) {
    slide.addText("INTRODUCTION TO PIANO", {
        x: 0.6, y: 7.05, w: 6, h: 0.3,
        fontFace: FB, fontSize: 10,
        color: color || MUTED, charSpacing: 4
    });
}

// =============== SLIDE 1 — Title ===============
{
    const s = pres.addSlide();
    s.background = { color: CREAM };

    s.addText("MUS 101 · LECTURE ONE", {
        x: 0.6, y: 0.42, w: 5, h: 0.3,
        fontFace: FB, fontSize: 11, color: DARK, charSpacing: 4
    });
    s.addText("SPRING 2026", {
        x: 8.3, y: 0.42, w: 4.4, h: 0.3,
        fontFace: FB, fontSize: 11, color: MUTED, charSpacing: 4, align: "right"
    });

    s.addText("A BEGINNER'S COURSE", {
        x: 0.6, y: 1.35, w: 6, h: 0.35,
        fontFace: FB, fontSize: 12, color: RED, charSpacing: 4, bold: false
    });

    s.addText([
        { text: "Introduction to ", options: { color: DARK } },
        { text: "\n", options: {} },
        { text: "Piano", options: { color: DARK } },
        { text: ".", options: { color: RED } }
    ], {
        x: 0.55, y: 1.7, w: 12, h: 2.9,
        fontFace: FH, fontSize: 96, bold: false,
        valign: "top", margin: 0
    });

    s.addText("Eighty-eight keys. One very good place to start.", {
        x: 0.6, y: 4.9, w: 9, h: 0.5,
        fontFace: FB, fontSize: 18, italic: true, color: BODY
    });

    // Mini keyboard (4 octave-like segments)
    const kbX = 0.6, kbY = 5.7, kbH = 1.35;
    const whiteW = 0.32;
    const segments = 4;
    const whitesPerSeg = 7;
    const gapBetweenSeg = 0.08;
    for (let seg = 0; seg < segments; seg++) {
        const segX = kbX + seg * (whitesPerSeg * whiteW + gapBetweenSeg);
        // white keys
        for (let i = 0; i < whitesPerSeg; i++) {
            s.addShape("rect", {
                x: segX + i * whiteW, y: kbY, w: whiteW, h: kbH,
                fill: { color: "FFFFFF" },
                line: { color: DARK, width: 1 }
            });
        }
        // black keys positions (after white 0,1,3,4,5) — standard 2+3 pattern
        const blackPositions = [0, 1, 3, 4, 5]; // relative white indices; black sits between i and i+1
        const blackW = whiteW * 0.6;
        const blackH = kbH * 0.62;
        for (const bi of blackPositions) {
            s.addShape("rect", {
                x: segX + (bi + 1) * whiteW - blackW / 2,
                y: kbY, w: blackW, h: blackH,
                fill: { color: DARK },
                line: { color: DARK, width: 0.5 }
            });
        }
    }

    s.addText("PROF. E. HART", {
        x: 9.5, y: 6.55, w: 3.3, h: 0.3,
        fontFace: FB, fontSize: 11, color: MUTED, charSpacing: 4, align: "right"
    });
    s.addText("DEPT. OF MUSIC", {
        x: 9.5, y: 6.85, w: 3.3, h: 0.3,
        fontFace: FB, fontSize: 11, color: RED, charSpacing: 4, align: "right"
    });
}

// =============== SLIDE 2 — Why the piano? ===============
{
    const s = pres.addSlide();
    s.background = { color: CREAM };
    addTopMeta(s, "CHAPTER ONE", "01 / 08");

    s.addText([
        { text: "Why the piano", options: { color: DARK } },
        { text: "?", options: { color: RED } }
    ], {
        x: 0.55, y: 0.9, w: 12, h: 1.3,
        fontFace: FH, fontSize: 54, color: DARK, margin: 0
    });

    // horizontal divider
    s.addShape("line", {
        x: 0.6, y: 2.75, w: 12.1, h: 0,
        line: { color: DARK, width: 0.75 }
    });

    // 3 columns with vertical dividers
    const colY = 3.1;
    const colW = 3.8;
    const colXs = [0.6, 4.65, 8.7];
    const items = [
        ["i.", "Everything is visible.", "Every note lives in one place on a single, logical row — a map you can see before you hear."],
        ["ii.", "Melody and harmony.", "One instrument, two hands, two jobs at once. The piano is a band you can carry alone."],
        ["iii.", "A language that transfers.", "What you learn here — reading, rhythm, voicing — follows you to every othe
```