# PADRAO - healthcare_std_prophylaxis_grand_rounds.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\healthcare_std_prophylaxis_grand_rounds.js
**SHA:** 14251f0ce75359fe
**Timestamp:** 2026-08-28T02:52:35.122632
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const ROW_START = 2.05, ROW_H = 1.22;

### Ouro Bruto (primeiros 5000 chars)
```
const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches

// ── DESIGN TOKENS ──────────────────────────────────────────────
const C = {
  bg:      'FFFFFF',
  panel:   'F4F7FA',
  navy:    '1B2B4B',   // titles, headers
  teal:    '00A878',   // primary accent
  blue:    '3B82F6',
  gold:    'F0A500',
  red:     'EF4444',
  purple:  '7C3AED',
  body:    '334155',
  muted:   '94A3B8',
  border:  'CBD5E1',
  divider: 'E2E8F0',
};
const F = 'Calibri';

// ── SLIDE TEMPLATE ────────────────────────────────────────────
function addSlide(eyebrow, title, subtitle) {
  const s = pptx.addSlide();
  s.background = { color: C.bg };

  // Top accent bar
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:13.33, h:0.055, fill:{ color:C.teal }, line:{type:'none'} });

  // Footer
  s.addShape(pptx.ShapeType.rect, { x:0, y:7.22, w:13.33, h:0.28, fill:{ color:C.navy }, line:{type:'none'} });
  s.addText('DOXYCYCLINE FOR BACTERIAL STD PROPHYLAXIS  ·  GRAND ROUNDS, DERMATOLOGY  ·  NOVEMBER 2020', {
    x:0.4, y:7.24, w:12, h:0.22,
    fontSize:7, color:'FFFFFF', fontFace:F, bold:false, charSpacing:1.5
  });

  if (eyebrow) {
    s.addText(eyebrow.toUpperCase(), {
      x:0.4, y:0.2, w:12.5, h:0.22,
      fontSize:10, bold:true, color:C.teal, fontFace:F, charSpacing:2.5
    });
  }
  if (title) {
    s.addText(title, {
      x:0.4, y:0.38, w:12.5, h:0.62,
      fontSize:26, bold:true, color:C.navy, fontFace:F
    });
    s.addShape(pptx.ShapeType.rect, {
      x:0.4, y:1.0, w:12.5, h:0.025,
      fill:{ color:C.divider }, line:{type:'none'}
    });
  }
  if (subtitle) {
    // ONE LINE — keep concise
    s.addText(subtitle, {
      x:0.4, y:1.03, w:12.5, h:0.32,
      fontSize:13.5, color:C.body, fontFace:F
    });
  }
  return s;
}

// ── UTILS ──────────────────────────────────────────────────────
function hLine(s, x, y, w, col) {
  s.addShape(pptx.ShapeType.rect, { x, y, w, h:0.02, fill:{ color:col||C.divider }, line:{type:'none'} });
}
function vLine(s, x, y, h, col) {
  s.addShape(pptx.ShapeType.rect, { x, y, w:0.02, h, fill:{ color:col||C.divider }, line:{type:'none'} });
}
function bigStat(s, x, y, val, label, sub, col) {
  s.addText(val, { x, y, w:3.0, h:0.6, fontSize:40, bold:true, color:col||C.teal, fontFace:F, align:'left' });
  s.addText(label, { x, y:y+0.58, w:3.0, h:0.22, fontSize:10, bold:true, color:C.navy, fontFace:F, charSpacing:1.5, align:'left' });
  if (sub) s.addText(sub, { x, y:y+0.78, w:3.0, h:0.2, fontSize:9, color:C.muted, fontFace:F, align:'left' });
}
function legendItem(s, x, y, color, label) {
  s.addShape(pptx.ShapeType.rect, { x, y:y+0.04, w:0.22, h:0.12, fill:{ color }, line:{type:'none'} });
  s.addText(label, { x:x+0.28, y, w:2.5, h:0.22, fontSize:10, color:C.body, fontFace:F });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.background = { color: C.bg };

  // Left strong teal bar
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:0.12, h:7.5, fill:{ color:C.teal }, line:{type:'none'} });

  // Right panel — navy REMOVED per feedback
  // Title expands full width
  s.addText('Doxycycline for\nBacterial STD\nProphylaxis', {
    x:0.45, y:1.6, w:12.5, h:4.0,
    fontSize:64, bold:true, color:C.navy, fontFace:F,
    lineSpacingMultiple:1.02
  });

  s.addText('GRAND ROUNDS  ·  DERMATOLOGY', {
    x:0.45, y:1.2, w:12, h:0.28,
    fontSize:11, bold:true, color:C.teal, fontFace:F, charSpacing:3
  });

  s.addText('Andy Nguyen, MD\nRonald O. Perelman Department of Dermatology\nNovember 13, 2020', {
    x:0.45, y:5.8, w:12, h:0.95,
    fontSize:12, color:C.muted, fontFace:F
  });

  // Footer
  s.addShape(pptx.ShapeType.rect, { x:0, y:7.22, w:13.33, h:0.28, fill:{ color:C.navy }, line:{type:'none'} });
  s.addText('DOXYCYCLINE FOR BACTERIAL STD PROPHYLAXIS  ·  GRAND ROUNDS, DERMATOLOGY  ·  NOVEMBER 2020', {
    x:0.4, y:7.24, w:12, h:0.22, fontSize:7, color:'FFFFFF', fontFace:F, charSpacing:1.5
  });
}

// ═══════════════════════════════════════════════════════════════
// SLIDE 2 — HISTORY TIMELINE
// ═══════════════════════════════════════════════════════════════
{
  const s = addSlide(
    'Historical Context',
    'A history of preventing the unintended consequences of sex',
    'Six decades of sexual health pharmacology set the blueprint for bacterial STD prophylaxis.'
  );

  // Spine
  const TY = 4.6;
  // Gradient spine: thin line fading to accent at end
  s.addShape(pptx.ShapeType.rect, { x:0.35, y:TY, w:12.5, h:0.06, fill:{ color:C.divider }, line:{type:'none'} });
  // Highlight ???  segment in teal
  s.addShape(pptx.ShapeType.rect, { x:10.8, y:TY, w:2.05, h:0.06, fill:{ color:C.teal }, line:{type:'none'} });

  const events = [
    { yr:'1957', x:0.92, above:true,  label:'Enovid approved\nfor menstrual\nirregularities' },
    { yr:'1960', x:2.3,  above:false, label:'Enovid approved\nfor or
```