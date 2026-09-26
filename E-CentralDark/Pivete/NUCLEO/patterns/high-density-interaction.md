# PADRAO - high-density-interaction.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\build-web-data-visualization\skills\canvas2d-data-visualization\references\high-density-interaction.md
**SHA:** 446c5455d4eef2c9
**Timestamp:** 2026-08-26T18:31:15.435701
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- | { id: string; start: Point; origin: Point; pointerId: number }
- start: point,

### Ouro Bruto (primeiros 5000 chars)
```
# High-Density Interaction

## What Problem This Solves

This reference covers interaction strategies for dense Canvas charts where naive hit testing is too expensive.

## When to Use It

Use this when a chart has many marks and still needs hover, click, selection, brushing, lassoing, dragging, direct manipulation, or editable graphical handles.

## Key Takeaways

- Spatial indexes, nearest-point search, and color-picking buffers are practical interaction strategies.
- The chart should degrade gracefully under density rather than pretending every point is equally readable.
- HTML or SVG overlays are often the best place for labels and tooltips.
- `Path2D` plus `CanvasRenderingContext2D.isPointInPath()` and `isPointInStroke()` is useful for moderate candidate sets and irregular geometry.
- Pointer events and pointer capture are the default input model for dragging in Canvas spaces.
- Canvas interactions need a retained scene model because the browser cannot tell you which drawn mark was clicked.
- Color-picking buffers are powerful, but `getImageData()` readback and antialiasing details must be designed deliberately.

## Coordinate Normalization

Convert pointer events to the coordinate space used by the renderer before hit testing:

```ts
type Point = { x: number; y: number };

function eventToCanvasCssPoint(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
```

If drawing code uses CSS-pixel coordinates after `ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)`, the point above is ready for screen-space hit testing. If drawing code uses raw backing-store pixels, multiply by `canvas.width / rect.width` and `canvas.height / rect.height`.

For panned or zoomed charts, maintain an explicit `DOMMatrix` or equivalent transform. Hit testing usually needs both:

- screen-space coordinates for `Path2D`, label, and handle tests
- data/world coordinates from the inverse transform for selections, brush extents, and dragging data objects

If the stage itself is transformed with CSS beyond simple translation, invert that CSS transform too. `getBoundingClientRect()` gives the bounding box, not a full inverse transform for rotated or skewed coordinate systems.

## Hit-Testing Strategies

Pick the least expensive strategy that preserves the user's intent:

- Analytic tests: circles, rectangles, bands, line segments, bars, and handles. This is fastest and easiest to test.
- Nearest-point search: use a spatial index and a pixel-radius threshold for dense scatterplots and traces.
- Spatial index plus geometry replay: query candidates first, then replay each candidate's `Path2D` with `isPointInPath()` or `isPointInStroke()`.
- Color picking: render stable mark ids into an offscreen picking buffer, then read the pixel under the pointer. This is useful for many irregular or overlapping shapes, but it needs careful redraw synchronization and color/id mapping.
- Interaction proxy geometry: use larger invisible hit areas than the visible marks, especially for thin lines, small points, mobile touch, and draggable handles.

Do not replay every shape on every pointer move for high-density views. First reduce candidates by screen bounds, tile, quadtree, interval index, row index, or color picking.

## Path2D Hit Testing

Use `Path2D` when a mark has complex or reusable geometry:

```ts
type HitCandidate = {
  id: string;
  path: Path2D;
  lineWidth?: number;
  fillRule?: CanvasFillRule;
};

function hitTestPath(
  ctx: CanvasRenderingContext2D,
  point: Point,
  candidates: HitCandidate[],
): string | undefined {
  ctx.save();
  try {
    for (let index = candidates.length - 1; index >= 0; index -= 1) {
      const candidate = candidates[index];
      ctx.lineWidth = Math.max(candidate.lineWidth ?? 1, 8);

      if (
        ctx.isPointInPath(candidate.path, point.x, point.y, candidate.fillRule) ||
        ctx.isPointInStroke(candidate.path, point.x, point.y)
      ) {
        return candidate.id;
      }
    }
  } finally {
    ctx.restore();
  }

  return undefined;
}
```

Set stroke style state that affects the tested stroke, especially `lineWidth`, line caps, joins, and dashes. Use `save()` and `restore()` or a dedicated hit-test context so inflated hit widths do not leak into visible drawing. Iterate in visual z-order from topmost to backmost when marks overlap.

For transformed paths, keep drawing and hit testing in the same coordinate convention. If draw commands are written in CSS pixels with the DPR transform active, use CSS-pixel pointer coordinates and keep that transform active during the test. If paths are stored in world or data coordinates, either apply the same world-to-screen transform before calling `isPointInPath()`/`isPointInStroke()` or invert the pointer point into the path's local coordinate system first.

## Color-Picking Buffers

Color picking is useful when geometr
```