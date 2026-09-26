# OUTRO - create-label.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-use-figjam\references\create-label.md
**SHA:** aa682240fb471361
**Timestamp:** 2026-08-26T18:31:57.135418
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const legendGap = 250

### Ouro Bruto (primeiros 5000 chars)
```
# Create Label Nodes

> Part of the [figma-use-figjam skill](../SKILL.md). Creating small circle callout markers with a number or letter.

**Scope:** Label nodes are small fixed-size circle shapes containing a single number or letter, used as callout markers, step indicators, or annotation anchors on a FigJam board. They are created with `figma.createShapeWithText()` using `shapeType = 'ELLIPSE'` and a fixed size. For shapes that need to fit longer text content, see [create-shape-with-text](create-shape-with-text.md).

**When to use labels:** Annotating steps in a process, numbering items on a diagram, marking locations on a map or wireframe, or providing lettered callouts that reference an accompanying legend.

**When NOT to use labels:** If the content is more than 2 characters (e.g. a word or phrase), use a regular [shape-with-text](create-shape-with-text.md) instead.

## Creating a Label

```javascript
// Position the label — determine a location relative to existing content
const labelLocation = { x: 100, y: 100 }

const label = figma.createShapeWithText()
label.shapeType = 'ELLIPSE'

await figma.loadFontAsync(label.text.fontName)
label.text.characters = '1'

// Labels use a fixed size — do NOT use fitShapeToText
label.resize(48, 48)
label.text.fontSize = 20

label.x = labelLocation.x
label.y = labelLocation.y

figma.currentPage.appendChild(label)
return { id: label.id, x: label.x, y: label.y }
```

## Size

Labels use **fixed dimensions** — do not use `fitShapeToText` (that utility is for shapes with variable-length text).

| Content                | Width × Height | Font size |
| ---------------------- | -------------- | --------- |
| Single char (`1`, `A`) | 48 × 48        | 20        |
| Two chars (`10`, `AB`) | 64 × 64        | 20        |

Both width and height must always be equal (square bounding box) so the ellipse renders as a perfect circle.

## Color Presets

Labels use the same coordinated fill/stroke/text color system as other FigJam shapes. Always set all three together. Use `hex/255` notation for exact palette matching — rounded decimals cause FigJam to treat the color as "custom". For the canonical palette across all FigJam node types, see [figjam-colors](figjam-colors.md).

```javascript
const h = (r, g, b) => ({ r: r / 255, g: g / 255, b: b / 255 })
const WHITE = h(0xff, 0xff, 0xff)
const DARK = h(0x1e, 0x1e, 0x1e)

const LABEL_COLOR_PRESETS = {
  black: { fill: h(0x1e, 0x1e, 0x1e), stroke: h(0xb3, 0xb3, 0xb3), text: WHITE },
  darkGray: { fill: h(0x75, 0x75, 0x75), stroke: h(0x5e, 0x5e, 0x5e), text: WHITE },
  green: { fill: h(0x66, 0xd5, 0x75), stroke: h(0x3e, 0x9b, 0x4b), text: WHITE },
  teal: { fill: h(0x5a, 0xd8, 0xcc), stroke: h(0x36, 0x9e, 0x94), text: WHITE },
  blue: { fill: h(0x3d, 0xad, 0xff), stroke: h(0x00, 0x7a, 0xd2), text: WHITE },
  violet: { fill: h(0x87, 0x4f, 0xff), stroke: h(0x54, 0x27, 0xb4), text: WHITE },
  pink: { fill: h(0xf8, 0x49, 0xc1), stroke: h(0xb4, 0x24, 0x87), text: WHITE },
  red: { fill: h(0xff, 0x75, 0x56), stroke: h(0xdc, 0x30, 0x09), text: WHITE },
  orange: { fill: h(0xff, 0x9e, 0x42), stroke: h(0xeb, 0x75, 0x00), text: WHITE },
  gray: { fill: h(0xb3, 0xb3, 0xb3), stroke: h(0x8f, 0x8f, 0x8f), text: DARK },
  lightGray: { fill: h(0xd9, 0xd9, 0xd9), stroke: h(0xb3, 0xb3, 0xb3), text: DARK },
  yellow: { fill: h(0xff, 0xc9, 0x43), stroke: h(0xe8, 0xa3, 0x02), text: DARK },
  white: { fill: h(0xff, 0xff, 0xff), stroke: h(0xb3, 0xb3, 0xb3), text: DARK },
}

function applyLabelColor(label, preset) {
  label.fills = [{ type: 'SOLID', color: preset.fill }]
  label.strokes = [{ type: 'SOLID', color: preset.stroke }]
  label.text.fills = [{ type: 'SOLID', color: preset.text }]
}
```

### Applying a color

```javascript
const label = figma.createShapeWithText()
label.shapeType = 'ELLIPSE'
await figma.loadFontAsync(label.text.fontName)
label.text.characters = '1'
label.resize(48, 48)
label.text.fontSize = 20
applyLabelColor(label, LABEL_COLOR_PRESETS.blue)

figma.closePlugin()
```

## Batch Creation: Numbered Sequence

The most common use case is a horizontal row of numbered labels. Use a two-pass layout: create all labels first, then position them using their actual dimensions.

```javascript
const h = (r, g, b) => ({ r: r / 255, g: g / 255, b: b / 255 })
const WHITE = h(0xff, 0xff, 0xff)
const PRESET_BLUE = { fill: h(0x3d, 0xad, 0xff), stroke: h(0x00, 0x7a, 0xd2), text: WHITE }

const count = 5
const size = 48
const spacing = 16
const labelLocation = { x: 100, y: 100 }

// Pass 1: create all labels.
// All labels share the same default font — load once before the loop instead
// of awaiting per-iteration.
const probe = figma.createShapeWithText()
await figma.loadFontAsync(probe.text.fontName)
probe.remove()
const labels = []
for (let i = 1; i <= count; i++) {
  const label = figma.createShapeWithText()
  label.shapeType = 'ELLIPSE'
  label.text.characters = String(i)
  label.resize(size, size)
  label.text.fontSize = 20
  label.fills = [{ type: 'SOLID'
```