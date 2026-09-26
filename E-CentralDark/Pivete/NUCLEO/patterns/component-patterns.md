# PADRAO - component-patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\figma\skills\figma-use\references\component-patterns.md
**SHA:** 8b517a881984c636
**Timestamp:** 2026-08-26T18:31:12.794680
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = namespace.length ? { variants: [] } : {};

### Ouro Bruto (primeiros 5000 chars)
```
# Component & Variant API Patterns

> Part of the [use_figma skill](../SKILL.md). How to correctly use the Plugin API for components, variants, and component properties.
>
> For design system context (when to use variants vs properties, code-to-Figma translation, property model), see [wwds-components](working-with-design-systems/wwds-components.md).

## Contents

- Creating a Component
- Combining Components into a Component Set (Variants)
- Laying Out Variants After combineAsVariants (Required)
- Component Properties: addComponentProperty API
- Linking Properties to Child Nodes (Required)
- INSTANCE_SWAP: Avoiding Variant Explosion
- Slots: createSlot and SLOT Properties
- Discovering Existing Conventions in the File
- Importing Components by Key
- Working with Instances (finding variants, setProperties, text overrides, detachInstance)


## Creating a Component

`figma.createComponent()` returns a `ComponentNode`, which behaves like a `FrameNode` but can be published, instanced, and combined into variant sets.

```javascript
const comp = figma.createComponent();
comp.name = "MyComponent";
comp.layoutMode = "HORIZONTAL";
comp.primaryAxisAlignItems = "CENTER";
comp.counterAxisAlignItems = "CENTER";
comp.paddingLeft = 12;
comp.paddingRight = 12;
comp.layoutSizingHorizontal = "HUG";
comp.layoutSizingVertical = "HUG";
comp.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.36, b: 0.96 } }];
```

## Combining Components into a Component Set (Variants)

`figma.combineAsVariants(components, parent)` takes an array of `ComponentNode`s (not frames — frames will throw) and groups them into a `ComponentSetNode`.

Variant names use a `Property=Value` format. Every unique combination must exist as a child component — missing ones show as blank gaps in the variant picker.

```javascript
// Each component's name encodes its variant properties
const comp1 = figma.createComponent();
comp1.name = "size=md, style=primary";
const comp2 = figma.createComponent();
comp2.name = "size=md, style=secondary";

const componentSet = figma.combineAsVariants([comp1, comp2], figma.currentPage);
componentSet.name = "Button";
```

**Before creating variants, inspect the file** for existing naming patterns. Different files use different conventions (`State=Default` vs `state=default` vs `State/Default`). Always match what's already there.

## Laying Out Variants After combineAsVariants (Required)

After `combineAsVariants`, all children stack at `(0, 0)`. You **must** position them or the component set will appear as a single collapsed element with all variants overlapping.

```javascript
const cs = figma.combineAsVariants(components, figma.currentPage);

// Simple row layout
cs.children.forEach((child, i) => {
  child.x = i * 150;
  child.y = 0;
});

// CRITICAL: resize the component set from actual child bounds
let maxX = 0, maxY = 0;
for (const child of cs.children) {
  maxX = Math.max(maxX, child.x + child.width);
  maxY = Math.max(maxY, child.y + child.height);
}
cs.resizeWithoutConstraints(maxX + 40, maxY + 40);
```

For multi-axis variants (e.g., size × style × state), parse the child's name to determine grid position:

```javascript
for (const child of cs.children) {
  const props = Object.fromEntries(
    child.name.split(', ').map(p => p.split('='))
  );
  const col = stateValues.indexOf(props.state);
  const row = styleValues.indexOf(props.style);
  child.x = col * colWidth;
  child.y = row * rowHeight;
}
```

## Component Properties: addComponentProperty API

`addComponentProperty` adds a TEXT, BOOLEAN, or INSTANCE_SWAP property to a component. It returns a **string key** (e.g., `"label#4:0"`) — never hardcode or guess this key.

```javascript
// Returns the key as a string — capture it!
const labelKey = comp.addComponentProperty('Label', 'TEXT', 'Default text');
const showIconKey = comp.addComponentProperty('Show Icon', 'BOOLEAN', true);
const iconSlotKey = comp.addComponentProperty('Icon', 'INSTANCE_SWAP', iconComponentId);
```

**Timing**: Add component properties to each variant component **before** calling `combineAsVariants`. After combining, the component set inherits all properties from its children. Do not add properties to the `ComponentSetNode` directly.

## Linking Properties to Child Nodes (Required)

A property that is added but not linked to a child node does **nothing**. You must set `componentPropertyReferences` on the child:

Follows the [canonical text-edit recipe](gotchas.md#canonical-text-edit-recipe-font-load--await--mutate--return-ids) — load the font for every (family, style) you'll mutate (here `Inter Regular`; same rule for every other font) before any `characters`/`fontName`/`fontSize` write.

```javascript
// Load required font BEFORE any text mutation
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// TEXT property → link to a text node's characters
const labelKey = comp.addComponentProperty('Label', 'TEXT', 'Button');
const textNode = figma.createText();
textNode.characters = "Button"
```