# COMANDO - component-creation.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-generate-library\references\component-creation.md
**SHA:** c16fc09041470ae7
**Timestamp:** 2026-08-26T18:31:13.031861
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 16;

### Ouro Bruto (primeiros 5000 chars)
```
> Part of the [figma-generate-library skill](../SKILL.md).

# Component Creation Reference

Complete guide for Phase 3: building components with variant matrices, variable bindings, component properties, and documentation.

> **Design files only.** Every snippet here (including `figma.createPage()`) targets Figma Design files (`figma.com/design/...`). `figma.createPage()` throws in both FigJam (`figma.com/board/...`) and Slides (`figma.com/slides/...`).
>
> **Every text mutation in this file follows the [canonical text-edit recipe](../../figma-use/references/gotchas.md#canonical-text-edit-recipe-font-load--await--mutate--return-ids):** load font → `await` → mutate → return affected IDs. Examples use `Inter` because it's available everywhere; `loadFontAsync` is required for every (family, style) pair you mutate, including non-Inter brand fonts.

---

## 1. Component Architecture

### Dependency Ordering: Atoms Before Molecules

Always build in dependency order. A molecule that contains an atom instance cannot exist until the atom is published. Suggested ordering:

```
Tier 0 (atoms): Icon, Avatar, Badge, Spinner
Tier 1 (molecules): Button, Checkbox, Toggle, Input, Select
Tier 2 (organisms): Card, Dialog, Menu, Navigation, Form
```

If a component embeds an instance of another component, the embedded component must be created first. Build your dependency graph during Phase 0 and encode the creation order in the plan.

### Building Blocks Sub-Components (M3 Pattern)

For complex components with independent sub-element state machines, extract the sub-element into its own component set prefixed with `Building Blocks/` (public) or `.Building Blocks/` (hidden from assets panel). The dot-prefix is a Figma convention for suppressing a component from the public assets panel.

**When to use Building Blocks:**
- The sub-element has its own variant axes (state, selection) that would cause combinatorial explosion in the parent
- The sub-element repeats (nav items, table cells, calendar cells, segmented button segments)
- The sub-element has different variant axes than the parent

**Example (M3 Segmented Button):**
```
Building Blocks/Segmented button/Button segment (start)   [27 variants: Config × State × Selected]
Building Blocks/Segmented button/Button segment (middle)  [27 variants]
Building Blocks/Segmented button/Button segment (end)     [27 variants]

Segmented button  [16 variants: Segments=2-5 × Density=0/-1/-2/-3]
  Each variant contains instances of the appropriate Building Block segment components.
```

The parent manages composition and configuration; the Building Block manages its own interaction states.

### Private Components (`__` Prefix)

Use the `__` prefix for internal helper components that should not appear in the team library (Shop Minis pattern). Use `_` for documentation-only components (UI3 pattern).

```
__asset          // private icon/asset holder
_Label/Direction // documentation annotation helper
```

---

## 2. Creating the Component Page

Each component lives on its own dedicated page (one page per component is the default). The page contains: a documentation frame at top-left and the component set positioned to its right or below.

```javascript
// Create or find the component page
let page = figma.root.children.find(p => p.name === 'Button');
if (!page) {
  page = figma.createPage();
  page.name = 'Button';
}
await figma.setCurrentPageAsync(page);

// Documentation frame — positioned at (40, 40)
const docFrame = figma.createFrame();
docFrame.name = 'Button / Documentation';
docFrame.x = 40;
docFrame.y = 40;
docFrame.resize(600, 400);
docFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
docFrame.layoutMode = 'VERTICAL';
docFrame.primaryAxisSizingMode = 'AUTO';
docFrame.counterAxisSizingMode = 'FIXED';
docFrame.paddingTop = 40;
docFrame.paddingBottom = 40;
docFrame.paddingLeft = 40;
docFrame.paddingRight = 40;
docFrame.itemSpacing = 16;

// Title text node
await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
const title = figma.createText();
title.fontName = { family: 'Inter', style: 'Bold' };
title.fontSize = 32;
title.characters = 'Button';
docFrame.appendChild(title);

// Description text node
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
const desc = figma.createText();
desc.fontName = { family: 'Inter', style: 'Regular' };
desc.fontSize = 14;
desc.characters = 'Buttons allow users to take actions and make choices with a single tap.';
docFrame.appendChild(desc);

// Tag docFrame with sharedPluginData for idempotency
docFrame.setSharedPluginData('dsb', 'run_id', RUN_ID);
docFrame.setSharedPluginData('dsb', 'key', 'doc/button');

return { docFrameId: docFrame.id, pageId: page.id };
```

---

## 3. Base Component: Auto-Layout, Child Nodes, Variable Bindings

The base component is the template from which all variants are cloned. It must have:
1. Auto-layout (not manual positioning)
2. All child nodes present
3. ALL visual properties bound to vari
```