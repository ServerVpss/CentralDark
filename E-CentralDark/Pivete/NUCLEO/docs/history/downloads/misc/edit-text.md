# OUTRO - edit-text.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-use-figjam\references\edit-text.md
**SHA:** 598198a416d7413c
**Timestamp:** 2026-08-26T18:31:30.110182
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const fontAtStart = textNode.getRangeFontName(0, 1)

### Ouro Bruto (primeiros 5000 chars)
```
# Text Operations

> Part of the [figma-use-figjam skill](../SKILL.md). Editing existing text content, styles, and font segments.

## Critical: Load Fonts First

Follow the [canonical text-edit recipe](../../figma-use/references/gotchas.md#canonical-text-edit-recipe-font-load--await--mutate--return-ids) — load font → `await` → mutate → return affected IDs. Skipping the load throws `Cannot write to node with unloaded font "<family> <style>"`. Inter is preloaded in most environments; every other family (and every Inter style you haven't already loaded) still needs an explicit `loadFontAsync`.

```javascript
// Load a single font
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })

// Load a font used by a single-font text node
await figma.loadFontAsync(textNode.fontName)

// Load all fonts in a text node (handles mixed fonts via styled segments)
const segments = textNode.getStyledTextSegments(['fontName'])
await Promise.all(segments.map((s) => figma.loadFontAsync(s.fontName)))
```

## Complete Working Example

```javascript
const nodeId = '123:456'
const node = await figma.getNodeByIdAsync(nodeId)

if (node && node.type === 'TEXT') {
  // Load all fonts used in this text node (handles mixed fonts via styled segments)
  const segments = node.getStyledTextSegments(['fontName'])
  await Promise.all(segments.map((s) => figma.loadFontAsync(s.fontName)))

  console.log('Before:', node.characters)
  node.characters = 'New text content'
  console.log('After:', node.characters)

  // Verify with image
  const img = await node.exportAsync({
    format: 'PNG',
    constraint: { type: node.width > node.height ? 'WIDTH' : 'HEIGHT', value: 128 },
  })
  figma.io.write(`${node.name.replace(/[^a-z0-9]/gi, '_')}_result.png`, img)
}
figma.closePlugin()
```

## Basic Properties

Follows the [canonical text-edit recipe](../../figma-use/references/gotchas.md#canonical-text-edit-recipe-font-load--await--mutate--return-ids) — load every (family, style) you're about to assign (including the NEW font when changing `fontName`) before any text mutation.

```javascript
// Required for any font, not just Inter
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' })

// Text content
textNode.characters = 'Hello, World!'

// Font
textNode.fontName = { family: 'Inter', style: 'Bold' }

// Size
textNode.fontSize = 16

// Color (via fills) — use Charcoal (#1E1E1E) as default
textNode.fills = [{ type: 'SOLID', color: { r: 0x1e / 255, g: 0x1e / 255, b: 0x1e / 255 } }]
```

### Text Color in FigJam

**CRITICAL**: When editing text in FigJam board content (templates, brainstorms, retros, or any generated content), always use **Charcoal (#1E1E1E)** as the text color unless the user has specifically requested different colors. Use `hex/255` notation for exact palette matching. For non-text node colors and the canonical palette across all FigJam node types, see [figjam-colors](figjam-colors.md).

```javascript
// Charcoal — default for all FigJam text
textNode.fills = [{ type: 'SOLID', color: { r: 0x1e / 255, g: 0x1e / 255, b: 0x1e / 255 } }]
```

Do not use grey (#757575, #B3B3B3) or light grey (#D9D9D9) for body text, headers, or descriptions — these make content look unfinished and hard to read.

## Text Alignment

```javascript
// Horizontal alignment
textNode.textAlignHorizontal = 'LEFT' // LEFT, CENTER, RIGHT, JUSTIFIED

// Vertical alignment
textNode.textAlignVertical = 'TOP' // TOP, CENTER, BOTTOM
```

## Line Height and Spacing

```javascript
// Line height
textNode.lineHeight = { value: 150, unit: 'PERCENT' }
textNode.lineHeight = { value: 24, unit: 'PIXELS' }
textNode.lineHeight = { unit: 'AUTO' }

// Letter spacing
textNode.letterSpacing = { value: 0, unit: 'PERCENT' }
textNode.letterSpacing = { value: 1, unit: 'PIXELS' }

// Paragraph spacing
textNode.paragraphSpacing = 16

// Paragraph indentation
textNode.paragraphIndent = 24
```

## Text Decoration

Underlines and strikethroughs support styling (wavy, dotted), offset, and color.

```javascript
textNode.textDecoration = 'UNDERLINE' // NONE, UNDERLINE, STRIKETHROUGH
textNode.textDecorationStyle = 'WAVY' // SOLID, DOTTED, WAVY
textNode.textDecorationOffset = { unit: 'PIXELS', value: 2 }
textNode.textDecorationColor = { value: { type: 'SOLID', color: { r: 1, g: 0, b: 0 } } } // Custom color
textNode.textDecorationColor = { value: 'AUTO' } // Inherit from text color
```

## Text Case

```javascript
// Case transformation
textNode.textCase = 'ORIGINAL' // ORIGINAL, UPPER, LOWER, TITLE, SMALL_CAPS, SMALL_CAPS_FORCED
```

## Text Sizing Behavior

```javascript
// Auto-resize mode
textNode.textAutoResize = 'WIDTH_AND_HEIGHT' // Auto-size both
textNode.textAutoResize = 'HEIGHT' // Fixed width, auto height
textNode.textAutoResize = 'NONE' // Fixed size
// Truncation pattern (preferred over deprecated textAutoResize = 'TRUNCATE')
textNode.textAutoResize = 'NONE' // Keep fixed bounds
textNode.textTruncation = 'ENDING' // Truncate overflow with ellipsis
textNode.maxLines = 2 // 
```