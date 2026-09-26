# COMANDO - create-text.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-use-figjam\references\create-text.md
**SHA:** 2cfdd1329d913b22
**Timestamp:** 2026-08-26T18:31:15.450830
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = offset
- const start = offset
- conn.connectorStart = { endpointNodeId: t.id, magnet: 'AUTO' }
- conn1.connectorStart = { endpointNodeId: leftNode.id, magnet: 'AUTO' }
- conn2.connectorStart = { endpointNodeId: newText.id, magnet: 'AUTO' }

### Ouro Bruto (primeiros 5000 chars)
```
# Create Text Nodes

> Part of the [figma-use-figjam skill](../SKILL.md). Creating and styling standalone text nodes and mind map operations.

Use this skill when creating, modifying, or styling standalone text in FigJam (text created with the **Text** tool, not text inside stickies, shapes, or connectors). Also use this skill for mind map operations — adding, inserting, or extending connected text nodes.

**Scope:** Text nodes are created with `figma.createText()` and have type `'TEXT'`. For editing existing text content or mixed styles, see [edit-text](edit-text.md).

## When to use a Text Node

Use text nodes for titles, headers, labels, prompts, instructions, and any content that provides structure or context. They can also be used for longer descriptions or explanations.

## Creating a Text Node

```javascript
const text = figma.createText()

// Load the font before setting content (required for characters, fontSize, etc.)
await figma.loadFontAsync(text.fontName)
text.characters = 'Brainstorming instructions'

console.log('Created text:', text.id, text.characters)
figma.closePlugin()
```

## Text Wrapping and Width Constraints

By default, text nodes auto-resize in both width and height (`textAutoResize = 'WIDTH_AND_HEIGHT'`), meaning they never wrap — text extends in one line until it ends.

To make text wrap within a specific width (e.g., instructional text inside sections):

1. Set `textAutoResize = 'HEIGHT'` — text will grow vertically but respect the width constraint
2. Use `resize(width, height)` to set the desired width

   ```javascript
   const text = figma.createText()
   await figma.loadFontAsync(text.fontName)
   text.characters = 'Long instructional text that should wrap...'

   // Constrain to 336px wide, allow height to grow
   text.textAutoResize = 'HEIGHT'
   text.resize(336, text.height)
   ```

**When creating text inside sections**: Calculate the max width as `section.width - (padding * 2)`. For example, with 32px padding on each side:

```javascript
const maxWidth = section.width - 64 // 32px left + 32px right
text.textAutoResize = 'HEIGHT'
text.resize(maxWidth, text.height)
```

**Important**: Call `resize()` AFTER setting `characters` and `textAutoResize`, so the height adjusts correctly based on the wrapped content.

**When to wrap vs not**: Use text wrapping for body text and instructions inside sections. Leave headers and short labels at the default `WIDTH_AND_HEIGHT` so they size naturally — wrapping a short H1 title into a narrow column looks worse than letting it extend.

## Loading Fonts

**Critical:** Changing text content or any property that affects layout (e.g. `characters`, `fontSize`, `fontName`, `textCase`, `lineHeight`) requires the font to be loaded first. Call `figma.loadFontAsync(fontName)` before such operations.

- **Single font:** Use the node’s `fontName` (or the new font when changing font).
- **Mixed styles:** Text can have different fonts per range. Load every font used in the node:

```javascript
// Load all fonts in a text node (handles mixed fonts)
const segments = textNode.getStyledTextSegments(['fontName'])
await Promise.all(segments.map((s) => figma.loadFontAsync(s.fontName)))
```

Alternatively, for a given range:

```javascript
const fontNames = textNode.getRangeAllFontNames(0, textNode.characters.length)
await Promise.all(fontNames.map(figma.loadFontAsync))
```

You do **not** need to load a font to change only **fills** (text color), **strokes**, or similar paint-related properties.

## FigJam Preset Fonts

In FigJam, the font family control exposes four presets plus any custom fonts already in the selection. Prefer these preset fonts so created text matches what users see in the UI:

| Preset (UI label) | Font family    | Default style | Use for                |
| ----------------- | -------------- | ------------- | ---------------------- |
| Simple            | `Inter`        | `Medium`      | Default, readable body |
| Bookish           | `Merriweather` | `Regular`     | Serif, formal          |
| Technical         | `Roboto Mono`  | `Medium`      | Monospace, code        |
| Scribbled         | `Figma Hand`   | `Regular`     | Script, handwritten    |

Set `fontName` to match the FigJam UI: `{ family: 'Inter', style: 'Medium' }`, `{ family: 'Merriweather', style: 'Regular' }`, `{ family: 'Roboto Mono', style: 'Medium' }`, or `{ family: 'Figma Hand', style: 'Regular' }` (or the appropriate style for the font). Load the font before setting `characters` or `fontSize`.

## Missing Fonts

Check `textNode.hasMissingFont` before loading. If `true`, the font is not available in the document (e.g. not installed for the user). Avoid setting content or layout properties that require that font, or handle the case explicitly.

```javascript
const text = await figma.getNodeByIdAsync('123:456')
if (text && text.type === 'TEXT') {
  if (text.hasMissingFont) {
    console.warn('Text uses a missing font; cannot safely edit content.')
  } else {
    const segm
```