# OUTRO - slide-gotchas.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-use-slides\references\slide-gotchas.md
**SHA:** 8d28df88e7aee9ab
**Timestamp:** 2026-08-26T18:31:40.685607
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Post-creation validation pattern:**

### Ouro Bruto (primeiros 5000 chars)
```
# Slide Gotchas & Common Mistakes

> Part of the [figma-use-slides skill](../SKILL.md). Pitfalls specific to working in Slides files.

## Contents

- Position after appendChild (critical)
- Canonical text-edit recipe (font load → await → mutate → return IDs)
- Sequential awaits — batch independent async calls with `Promise.all`
- Prefer indexed lookups over `findAll`/`findOne` full-tree scans
- Scope traversal to the smallest known ancestor (a slide, not the page)
- SLIDE_GRID and SLIDE_ROW are opaque nodes
- Validation without get_metadata
- Building multi-element slides
- Code preamble for deck-building scripts


## Canonical text-edit recipe (font load → await → mutate → return IDs)

The same canonical recipe used in Design files applies inside slides — see [figma-use → gotchas.md → Canonical text-edit recipe](../../figma-use/references/gotchas.md#canonical-text-edit-recipe-font-load--await--mutate--return-ids) for the full WRONG/CORRECT pair. Two slide-specific reminders:

1. **Inter preload doesn't cover deck-theme fonts.** Decks frequently switch the theme font to families like `Roboto Mono`, `Merriweather`, or a brand font — those still need an explicit `loadFontAsync` for every (family, style) you mutate.
2. **When restyling existing slide text, load the node's *current* font, not a hardcoded default.** Slide theme tokens push fonts onto nodes that may differ from what you'd guess. Use `getStyledTextSegments(['fontName'])` and `loadFontAsync` each segment's font before any mutation.

```js
// Restyle existing slide text without assuming the font
await Promise.all(
  textNode.getStyledTextSegments(['fontName'])
    .map(s => figma.loadFontAsync(s.fontName))
)
textNode.characters = "Updated"
return { mutatedNodeIds: [textNode.id] }
```


## Prefer indexed lookups over `findAll` / `findOne` full-tree scans

Same rule as in design files (see [figma-use → gotchas.md → Prefer indexed lookups](../../figma-use/references/gotchas.md#prefer-indexed-lookups-over-findall--findone-full-tree-scans)). On slide trees, the most common offenders are `slide.findAll(n => n.type === 'TEXT')` (use `slide.findAllWithCriteria({ types: ['TEXT'] })`) and `slide.findAll(n => n.type === 'INTERACTIVE_SLIDE_ELEMENT')` (same fix). If you have a slide or element ID, use `figma.getNodeByIdAsync(id)` — never re-scan the tree.


## Scope traversal to the smallest known ancestor

Slides specifically: **search inside the specific slide**, not the whole page. `slide.findAllWithCriteria(...)` walks one slide; `figma.currentPage.findAllWithCriteria(...)` walks every slide in the deck. When you have the target slide's ID (passed by the caller or returned from a prior call), always start the traversal there.

```js
// AVOID — scans every slide in the deck
const texts = figma.currentPage.findAllWithCriteria({ types: ['TEXT'] })

// PREFER — one slide only
const slide = await figma.getNodeByIdAsync(SLIDE_ID)
const texts = slide.findAllWithCriteria({ types: ['TEXT'] })
```

See [figma-use → gotchas.md → Scope traversal to the smallest known ancestor](../../figma-use/references/gotchas.md#scope-traversal-to-the-smallest-known-ancestor).


## Sequential awaits — batch independent async calls with `Promise.all`

Same rule as in design files (see [figma-use → gotchas.md → Sequential awaits](../../figma-use/references/gotchas.md#sequential-awaits--batch-independent-async-calls-with-promiseall)). When building decks, the typical offenders are `loadFontAsync` for theme/brand fonts, `getNodeByIdAsync` for cached slide IDs, and `import*ByKeyAsync` for library variables and styles — all independent per call and all batchable.

```js
// WRONG — sequential round-trips per slide
for (const id of slideIds) {
  const slide = await figma.getNodeByIdAsync(id)
  // ... mutate
}

// CORRECT — fetch all slides in one batch, then mutate sequentially
const slides = await Promise.all(slideIds.map(id => figma.getNodeByIdAsync(id)))
for (const slide of slides) {
  // ... mutate
}
```

`setCurrentPageAsync` is the exception — page-context switches must stay sequential.


## Position after appendChild (critical)

Setting `x`/`y` on a node **before** appending it to its real parent causes a `(−240, −240)` coordinate shift. This applies at **every level of nesting**, not just the slide root — a card you build at "page level" before attaching to a slide hits the bug, and a text you create then position before appending to that card hits it too.

**Why this happens:** Newly created nodes (`figma.createFrame()`, `figma.createRectangle()`, `figma.createText()`) in a Slides file are silently auto-parented to a slide context whose origin sits at absolute `(240, 240)` — the slide grid's `GRID_PADDING`. When you write `node.x = 200` on that "orphan", the underlying engine interprets `200` as the desired absolute x, then stores `relative.x = 200 − 240 = −40`. When you later `appendChild` to the real slide (or real card), the relative coordinate is preserved, so the node lands at `
```