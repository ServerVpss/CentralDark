# OUTRO - create-connector.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-use-figjam\references\create-connector.md
**SHA:** 5b64b05a50bcdf08
**Timestamp:** 2026-08-26T18:31:36.778388
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- connector.connectorStart = { endpointNodeId: '123:456', magnet: 'AUTO' }
- connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'AUTO' }
- connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'RIGHT' }
- connector.connectorStart = { position: { x: 100, y: 200 } }
- connector.connectorStart = { endpointNodeId: nodeA.id, position: { x: 1, y: 0.5 } }
- connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'AUTO' }
- connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'AUTO' }
- connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'AUTO' }
- connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'AUTO' }
- console.log('  start:', JSON.stringify(conn.connectorStart))

### Padroes
- connector.dashPattern = [10, 5]
- connector.dashPattern = [2, 4]
- connector.dashPattern = []

### Ouro Bruto (primeiros 5000 chars)
```
# Create Connectors

> Part of the [figma-use-figjam skill](../SKILL.md). Creating connectors between nodes — endpoints, arrows, line types, labels, and colors.

**Scope:** Connectors are FigJam-specific nodes created with `figma.createConnector()`. They connect shapes, stickies, sections, and other nodes to show relationships. For creating shapes to connect, see [create-shape-with-text](create-shape-with-text.md). For stickies, see [create-sticky](create-sticky.md). For sections, see [create-section](create-section.md).

## Creating a Connector Between Two Nodes

```javascript
const connector = figma.createConnector()
connector.connectorStart = { endpointNodeId: '123:456', magnet: 'AUTO' }
connector.connectorEnd = { endpointNodeId: '123:789', magnet: 'AUTO' }

console.log('Created connector:', connector.id)
figma.closePlugin()
```

## Connector Endpoints

Endpoints define where the connector starts and ends. There are three forms:

### Attached to a node with auto-magnet (most common)

```javascript
connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'AUTO' }
connector.connectorEnd = { endpointNodeId: nodeB.id, magnet: 'AUTO' }
```

### Attached to a node at a specific side

Magnet values: `'AUTO'`, `'TOP'`, `'BOTTOM'`, `'LEFT'`, `'RIGHT'`, `'CENTER'`, `'NONE'`

```javascript
connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'RIGHT' }
connector.connectorEnd = { endpointNodeId: nodeB.id, magnet: 'LEFT' }
```

### Floating (not attached to any node)

```javascript
connector.connectorStart = { position: { x: 100, y: 200 } }
connector.connectorEnd = { position: { x: 400, y: 200 } }
```

### Attached to a node at a specific position (relative, 0–1)

```javascript
connector.connectorStart = { endpointNodeId: nodeA.id, position: { x: 1, y: 0.5 } }
connector.connectorEnd = { endpointNodeId: nodeB.id, position: { x: 0, y: 0.5 } }
```

## Line Types

```javascript
connector.connectorLineType = 'ELBOWED' // Right-angle bends (default)
connector.connectorLineType = 'STRAIGHT' // Direct line
connector.connectorLineType = 'CURVED' // Smooth curve
```

## Stroke Caps (Arrows)

Control the arrowheads at each end of the connector.

Available cap styles: `'NONE'`, `'ARROW_LINES'`, `'ARROW_EQUILATERAL'`, `'TRIANGLE_FILLED'`, `'DIAMOND_FILLED'`, `'CIRCLE_FILLED'`

```javascript
const connector = figma.createConnector()
connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'AUTO' }
connector.connectorEnd = { endpointNodeId: nodeB.id, magnet: 'AUTO' }

// Arrow at the end only (most common for directed flows)
connector.connectorStartStrokeCap = 'NONE'
connector.connectorEndStrokeCap = 'ARROW_LINES'

figma.closePlugin()
```

### Common arrow configurations

```javascript
// One-way arrow (A → B)
connector.connectorStartStrokeCap = 'NONE'
connector.connectorEndStrokeCap = 'ARROW_LINES'

// Two-way arrow (A ↔ B)
connector.connectorStartStrokeCap = 'ARROW_LINES'
connector.connectorEndStrokeCap = 'ARROW_LINES'

// No arrows (plain line)
connector.connectorStartStrokeCap = 'NONE'
connector.connectorEndStrokeCap = 'NONE'

// Filled triangle arrow
connector.connectorEndStrokeCap = 'ARROW_EQUILATERAL'

// Diamond endpoint
connector.connectorStartStrokeCap = 'DIAMOND_FILLED'

// Circle endpoint
connector.connectorStartStrokeCap = 'CIRCLE_FILLED'
```

## Adding a Text Label

Connectors have a `text` sublayer for visible labels. You must load fonts before setting text.

**CRITICAL**: To display text on a connector, set `connector.text.characters` — NOT `connector.name`. Setting `connector.name` only changes the layer name in the layers panel and is NOT visible on the canvas.

**CRITICAL**: A newly created connector's `text.fontName` is **invalid by default** — calling `figma.loadFontAsync(connector.text.fontName)` will fail. You must explicitly set `connector.text.fontName` to a known font (after loading it), then set `connector.text.characters`.

```javascript
const font = { family: 'Inter', style: 'Medium' }
await figma.loadFontAsync(font)

const connector = figma.createConnector()
connector.connectorStart = { endpointNodeId: nodeA.id, magnet: 'AUTO' }
connector.connectorEnd = { endpointNodeId: nodeB.id, magnet: 'AUTO' }

// Explicitly set the font, then set text
connector.text.fontName = font
connector.text.characters = 'depends on' // This is the visible label

figma.closePlugin()
```

### Modifying label on an existing connector

For existing connectors that already have text, `text.fontName` is valid and can be loaded directly:

```javascript
const connector = await figma.getNodeByIdAsync('123:456')
if (connector && connector.type === 'CONNECTOR') {
  await figma.loadFontAsync(connector.text.fontName)
  connector.text.characters = 'new label'
}
figma.closePlugin()
```

## Color Presets

Connectors use a 13-color stroke palette — the same hue family used by `createShapeWithText`. The line color is set via `strokes`. The connector's text label has its own background and its color does **not** change whe
```