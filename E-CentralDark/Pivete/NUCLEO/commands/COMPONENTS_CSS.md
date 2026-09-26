# COMANDO - COMPONENTS_CSS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\stores\COMPONENTS_CSS.md
**SHA:** db134f3e442d7a01
**Timestamp:** 2026-08-26T18:42:42.778496
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- - **`.product-grid`** — the layout that lists product cards. Both `/products` (pages-products scope) and `/category/[slug]` (pages-categories scope) consume it from one place. Include `display: grid; 

### Ouro Bruto (primeiros 5000 chars)
```
# Phase 3 Components-CSS — Stores

Sibling of the `components` scope. Launched in **Step 4.5** in the same concurrent batch — runs in parallel with the TSX/Astro work, ecom and gift-cards components, and Image Phase 2.

## What this scope owns

Exactly one file:

- `src/styles/components-stores.css` — scoped CSS for stores-specific contract keys (option pills, quantity stepper, stock status, modifier free-text input, product card, product grid, offer callout panel). Imported by `Layout.astro` (the designer foundation sets up the import).

## What this scope does NOT own

- Any `.tsx` or `.astro` file. Those are the `components` sibling scope (`./SHARED_WIRING.md`).
- `src/styles/global.css` — owned by the designer foundation. **You read it (to audit for stores-class leaks) but never write it.**
- `src/styles/components-ecom.css`, `src/styles/components-gift-cards.css` — owned by other packs' `components` (or `components-css`) scopes.
- `src/utils/back-in-stock.ts` — pre-copied by the orchestrator before this dispatch; not your concern.

## Reading set

You only need:

1. **`<SKILL_ROOT>/references/astro/templates/stores/components-stores.css`** — the canonical template. Read it once.
2. **`<SKILL_ROOT>/references/shared/STYLING.md`** — the styling-contract conventions (how to use `@apply`, the `@theme` token utilities, the no-default-Tailwind-colors rule, and the global-vs-scoped CSS ownership boundary).
3. **`<SKILL_ROOT>/references/shared/RETURN_CONTRACT.md`** — the return JSON shape.
4. **`src/styles/global.css`** in the project — read to audit for stores-class leaks (see § "Global-CSS leak audit" below).
5. **Design tokens (inline in your prompt)** — the parent skill pastes the full `designTokens` JSON into your dispatch prompt. Use it directly; do NOT read `.wix/design-tokens.css` or `.wix/site.d.ts` from disk.

You do NOT need to read `INSTRUCTIONS.md`, `SHARED_WIRING.md`, `BACK_IN_STOCK.md`, the TSX templates, the back-in-stock util, or any other reference. Skipping those reads is the point of the split — they would consume tokens for context this scope doesn't use.

## Implementation

### 1. Read the template

```
<SKILL_ROOT>/references/astro/templates/stores/components-stores.css
```

This is the canonical scoped CSS for the stores pack. Adapt sizing/spacing to the brand's aesthetic — use the design tokens from your prompt (`--color-bark`, `--color-cream`, `--spacing-md`, `--font-display`, etc.). **Do not rename the class names or state modifiers** — they must match the contract keys the TSX components reference.

### 2. Use `@apply` with brand `@theme` utilities

The `@theme` block in `global.css` (written by the designer foundation) exposes the brand tokens as Tailwind utilities (e.g., `bg-bark`, `text-cream`, `font-body`). They are globally available because `global.css` is imported first in `Layout.astro`.

Use `@apply` for color, font, and spacing properties. Drop to `var(--color-bark)` directly when `@apply` doesn't cover a property (e.g., border-color via custom property).

Do **NOT** use default Tailwind colors (`bg-green-50`, `text-red-600`). The brand palette is the only allowed source.

### 3. Class ownership

Classes you own (define rules in `components-stores.css`):

- **`.product-card`, `.product-card-media`, `.product-card-ribbon`, `.product-card-index`** — the product card itself, including the `overflow: hidden` + `border-radius` clipping context. Whoever writes the `border-radius` here also writes any inner padding required to keep child content inside the rounded edges. Without inner padding, a price `<p>` sits flush against the rounded bottom corner and descenders get clipped. Add `padding-bottom: var(--spacing-md)` on the card plus horizontal padding on each text block when you set the radius.
- **`.product-grid`** — the layout that lists product cards. Both `/products` (pages-products scope) and `/category/[slug]` (pages-categories scope) consume it from one place. Include `display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--spacing-xl);` plus the View-Transitions opacity fade for in-flight navigations.
- **`.offer-callout` family (`.offer-callout`, `-item`, `-badge`, `-name`, `-detail`, `-foot`)** — discount panel rendered above `<ProductPurchase>` on `/products/[slug]`.
- **Option-selector contract classes** — `option-group`, `option-label`, `option-choices`, `option-pill` (with `.selected` state modifier).
- **Quantity-stepper contract classes** — `quantity-selector`, `quantity-btn`, `quantity-value`.
- **Stock status** — `stock-status`.
- **Back-in-stock form** (`.back-in-stock-form` and child classes) — append the rules from `./BACK_IN_STOCK.md` § 3 to the end of `components-stores.css`. The TSX form island is written by the `components` sibling; this file owns its styling.

Classes you do NOT own:

- `.btn`, `.btn-primary`, `.btn-secondary` — designer's `global.css`.
- `addToCartButton` → `.add-to-cart-btn` — designer's `global.css` (
```