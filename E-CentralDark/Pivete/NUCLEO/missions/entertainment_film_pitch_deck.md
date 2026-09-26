# MISSAO - entertainment_film_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\entertainment_film_pitch_deck.js
**SHA:** c3b8750141308a2e
**Timestamp:** 2026-08-28T02:52:33.748517
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: npm install pptxgenjs && node nightingale.js

### Ouro Bruto (primeiros 5000 chars)
```
// Nightingale - generated pptxgenjs replica
// Run: npm install pptxgenjs && node nightingale.js
const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'CUSTOM', width: 20.0, height: 11.25 });
pptx.layout = 'CUSTOM';

// ---- Embedded image data (base64) ----
const IMG_image_1_1_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_2_1_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_3_1_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_3_2_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_4_1_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_5_1_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_5_2_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_5_3_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_5_4_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_7_1_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_7_2_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_7_3_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_7_4_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_7_5_png = 'data:image/png;base64,PLACEHOLDER';
const IMG_image_8_1_png = 'data:image/png;base64,PLACEHOLDER';

// ============ Slide 1 ============
{
  const slide = pptx.addSlide();
  slide.background = { color: '0B0A08' };
  slide.addImage({
    x: 2.1875, y: -2.1875, w: 15.625, h: 15.625,
    data: IMG_image_1_1_png,
    transparency: 30.0,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.0,
    y: 0.0,
    w: 20.0,
    h: 11.25,
    fill: {
        color: 'F1E9D8',
        transparency: 98.0
      },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.6719,
    y: 3.3385,
    w: 0.8333,
    h: 0.0104,
    fill: {
        color: 'B6AD9B'
      },
  });
  slide.addText([
    { text: '✦', options: {
        fontSize: 19.5,
        fontFace: 'Georgia',
        color: 'B21F24',
        charSpacing: 6.75,
        align: 'left'
      } }
  ], {
    x: 6.7552,
    y: 3.1901,
    w: 0.3918,
    h: 0.349,
    valign: 'top',
    marginLeft: 2.0,
    marginTop: 2.0,
    marginRight: 2.0,
    marginBottom: 2.0,
    wrap: true,
    fit: 'shrink',
    shape: pptx.ShapeType.rect,
  });
  slide.addText([
    { text: 'AN ORIGINAL MOTION PICTURE', options: {
        fontSize: 13.5,
        fontFace: 'Consolas',
        color: 'B6AD9B',
        charSpacing: 6.75,
        align: 'left'
      } }
  ], {
    x: 7.3137,
    y: 3.237,
    w: 5.5337,
    h: 0.2552,
    valign: 'top',
    marginLeft: 2.0,
    marginTop: 2.0,
    marginRight: 2.0,
    marginBottom: 2.0,
    wrap: true,
    fit: 'shrink',
    shape: pptx.ShapeType.rect,
  });
  slide.addText([
    { text: '✦', options: {
        fontSize: 19.5,
        fontFace: 'Georgia',
        color: 'B21F24',
        charSpacing: 6.75,
        align: 'left'
      } }
  ], {
    x: 12.9363,
    y: 3.1901,
    w: 0.3918,
    h: 0.349,
    valign: 'top',
    marginLeft: 2.0,
    marginTop: 2.0,
    marginRight: 2.0,
    marginBottom: 2.0,
    wrap: true,
    fit: 'shrink',
    shape: pptx.ShapeType.rect,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 13.4948,
    y: 3.3385,
    w: 0.8333,
    h: 0.0104,
    fill: {
        color: 'B6AD9B'
      },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 2.5385,
    y: 4.1224,
    w: 14.9229,
    h: 2.625,
    fill: {
        color: 'F6EFDE'
      },
  });
  slide.addText([
    { text: 'Nightingale', options: {
        fontSize: 210.0,
        fontFace: 'Georgia',
        color: '000000',
        italic: true,
        charSpacing: -4.2,
        align: 'left',
        lineSpacingMultiple: 0.9
      } }
  ], {
    x: 2.5385,
    y: 4.1224,
    w: 15.3706,
    h: 2.6667,
    shadow: {
        type: 'outer',
        color: 'B21F24',
        blur: 60.0,
        offset: 4.0,
        angle: 270,
        opacity: 0.15
      },
    valign: 'top',
    marginLeft: 2.0,
    marginTop: 2.0,
    marginRight: 2.0,
    marginBottom: 2.0,
    wrap: true,
    fit: 'shrink',
    shape: pptx.ShapeType.rect,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 8.1146,
    y: 7.2422,
    w: 1.25,
    h: 0.0104,
    fill: {
        color: 'B6AD9B'
      },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.5729,
    y: 7.1641,
    w: 0.1667,
    h: 0.1667,
    line: {
        color: 'B6AD9B',
        width: 0.75
      },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 9.9479,
    y: 7.1953,
    w: 0.1042,
    h: 0.1042,
    rotate: 45.0,
    fill: {
        color: 'B21F24'
      },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 10.2604,
    y: 7.1641,
    w: 0.1667,
    h: 0.1667,
    line: {
        color: 'B6AD9B',
        width: 0.75
      },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 10.6354,
    y: 7.2422,
    w: 1.25,
    h: 0.0104,
    fill: {
        color: 'B6AD9B'
      },
  });
  slide.addText([
    { text: 'Some songs are heard only once.', options: {
        fontSize: 22.5,
        f
```