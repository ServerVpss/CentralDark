# PADRAO - plugin-api-patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-use\references\plugin-api-patterns.md
**SHA:** be40b1b3b39b66aa
**Timestamp:** 2026-08-26T18:31:09.650135
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "COLUMNS",

### Ouro Bruto (primeiros 5000 chars)
```
# Plugin API Patterns

> Part of the [use_figma skill](../SKILL.md). Quick reference for common Figma Plugin API operations.

## Contents

- Execution Basics
- Creating Nodes (Frames, Text, Rectangles, Ellipses, Lines, Vectors, SVG Import)
- Fills and Strokes (Solid, Linear Gradient, Radial Gradient, Multiple Fills)
- Auto Layout
- Effects
- Opacity and Blend Modes
- Corner Radius and Clipping
- Grouping and Organization
- Components and Variants
- Styles
- Cloning, Finding Nodes, and Grids
- Constraints and Viewport


## Execution Basics

### Page Context

Page context resets between `use_figma` calls — `figma.currentPage` always starts on the first page. Use `await figma.setCurrentPageAsync(page)` at the start of each invocation to switch to the correct page. The sync setter `figma.currentPage = page` does **NOT work** and will throw — always use the async method.

```javascript
const targetPage = figma.root.children.find(p => p.name === "My Page");
await figma.setCurrentPageAsync(targetPage);
// targetPage.children is now populated
```

### Returning Results

Scripts are automatically wrapped in an async IIFE with error handling. Just write plain JS and use `return` to send data back to the agent:

```javascript
// Return an object — auto-serialized to JSON
return { nodeId: frame.id, count: 5 }

// Return a string
return "Created 3 components"
```

Errors are automatically captured — no try/catch needed. `figma.notify()` does **not** exist. Return all information via the `return` value.

### Working Incrementally

Don't build an entire screen in one call. Break work into small steps:
1. Create tokens/variables
2. Create text styles
3. Build individual components
4. Compose sections
5. Assemble screens

Verify structure with `get_metadata` between steps. Use `get_screenshot` after each major creation milestone to catch visual problems early.

## Creating Nodes

### Frames

```javascript
const frame = figma.createFrame();
frame.name = "Container";
frame.resize(1440, 900);
frame.x = 0;
frame.y = 0;
frame.fills = [{ type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.99 } }];
```

### Text

Canonical recipe: load font → `await` → mutate → return affected IDs. This pattern is the same for every font — `Inter` happens to be preloaded so the missing-`loadFontAsync` bug usually only surfaces with other families. See [gotchas.md → Canonical text-edit recipe](gotchas.md#canonical-text-edit-recipe-font-load--await--mutate--return-ids).

```javascript
// Load font BEFORE any text mutation — required for every font, not just Inter
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

const text = figma.createText();
text.fontName = { family: "Inter", style: "Regular" };
text.fontSize = 16;
text.lineHeight = { value: 24, unit: "PIXELS" };
text.letterSpacing = { value: 0, unit: "PERCENT" };
text.characters = "Hello World";
text.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.12 } }];
```

### Rectangles

```javascript
const rect = figma.createRectangle();
rect.name = "Background";
rect.resize(400, 300);
rect.cornerRadius = 12;
rect.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.96 } }];
```

### Ellipses

```javascript
const circle = figma.createEllipse();
circle.name = "Avatar Circle";
circle.resize(48, 48);
circle.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.87, b: 0.90 } }];
```

### Lines

```javascript
const line = figma.createLine();
line.name = "Divider";
line.resize(400, 0);
line.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.08 }];
line.strokeWeight = 1;
```

### Vectors (Custom Paths)

Use `figma.createVector()` for any shape that can't be built from primitives — organic curves, flowing contours, custom silhouettes. The `vectorPaths` property accepts SVG path data.

```javascript
const vector = figma.createVector();
vector.vectorPaths = [{
  windingRule: "NONZERO",
  data: "M 0 60 C 30 10 70 10 100 50 C 130 90 170 20 200 40 L 200 100 L 0 100 Z"
}];
vector.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.3, b: 0.55 } }];
vector.strokes = [{ type: 'SOLID', color: { r: 0.1, g: 0.2, b: 0.4 } }];
vector.strokeWeight = 2;
```

SVG path commands: `M` (move to), `L` (line to), `C x1 y1 x2 y2 x y` (cubic bezier), `Q x1 y1 x y` (quadratic bezier), `A rx ry rot large sweep x y` (arc), `Z` (close). Uppercase = absolute, lowercase = relative.

Vectors support all the same properties as other shapes — fills, strokes, effects, brushes, dynamic strokes, variable-width strokes, and texture effects.

### SVG Import

```javascript
const svgString = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 12h14M12 5l7 7-7 7" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const node = figma.createNodeFromSvg(svgString);
node.name = "Icon/Arrow Right";
node.resize(24, 24);
```

## Fills & Strokes

### Solid Fill

```javascript
node.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b
```