# COMANDO - SHARED_WIRING.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\stores\SHARED_WIRING.md
**SHA:** c3e19b87ce37d273
**Timestamp:** 2026-08-26T18:42:43.428195
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Class from contract: `addToCartButton` → `"add-to-cart-btn"`.

### Ouro Bruto (primeiros 5000 chars)
```
# Phase 3 Components — Stores (TSX/Astro)

Launched in **Step 4.5** (after Phase 2 Design System completes, parallel to any running designer page scopes). Writes code that depends on the **design tokens** but NOT on Phase 4 page markup. Finishes before the Phase 4 Pages scopes run in Step 7.

> **CSS lives in a sibling scope.** `src/styles/components-stores.css` is owned by the `components-css` scope (see `./COMPONENTS_CSS.md`), which runs concurrently with this one in the same Step 4.5 batch. This scope does NOT write the CSS file. Reference contract class names from the design tokens here; the CSS sibling defines the rules.

## Scope

Files this agent OWNS (creates fresh, no designer output to read):

- `src/components/SeoTags.astro` — Renders `product.seoData.tags` into `<head>`
- `src/components/AddToCartButton.tsx` — React island; optimistic add-to-cart
- `src/components/ProductPurchase.tsx` — React island; option selectors + variant resolution + wraps AddToCartButton
- `src/components/BackInStockForm.tsx` — React island; back-in-stock subscription form

Files this agent MUST NOT touch:
- `src/styles/components-stores.css` — owned by the **`components-css`** sibling scope (see `./COMPONENTS_CSS.md`). Reference its class names; do not write the file.
- `src/utils/wix-image.ts` — **shared utility shipped by the build skill.** Import `resolveWixImageUrl` from `../utils/wix-image`; do NOT write your own copy (would shadow the shared util and drop other verticals' callers). The canonical source lives at `<SKILL_ROOT>/shared-utilities/wix-image.ts`; it's copied into projects by `seed-utilities.sh` during Setup.
- `src/components/CartView.tsx`, `src/components/CartBadge.tsx`, `src/utils/analytics.ts`, `src/styles/components-ecom.css` — owned by ecom
- Any `.astro` page — those are designed and later rewritten by other scopes
- `src/styles/global.css` — owned by designer foundation
- `src/layouts/Layout.astro` — owned by designer foundation (including the `components-stores.css` import line)
- Any designed component (`ProductCard.astro`, `Navigation.astro`, etc.) — owned by designers

## Coordination: design tokens

Your parent prompt includes the design tokens inline. Use it directly — do **not** read `.wix/design-tokens.css` + `.wix/site.d.ts` from disk and do not poll for it. The parent skill serializes your launch behind designer foundation specifically so the contract is already available in your prompt when you start.

Reference the ACTUAL class names from the contract in React components (e.g. `className="add-to-cart-btn"`, not `className="addToCartButton"` or an invented name). See `references/shared/IMPLEMENTER.md` § "Contract class-name adaptation" for the full rule.

## Critical rules

1. **Import `productsV3`, never `products`** — V1 silently returns 0 results on V3 catalogs (used in `ProductPurchase.tsx` type definitions).
2. **Always include `variantId` in `catalogReference.options`** — even single-variant products have one. Without it, `addToCurrentCart` returns 200 OK but silently adds nothing.
3. **No HTML comments in `.astro` frontmatter** — frontmatter is TypeScript; use `//` or `/* */`. Build-fails with "Legacy HTML single-line comments are not allowed".
4. **Use brand-token Tailwind utilities on React islands** (e.g., `bg-bark`, `text-cream`), never default Tailwind colors (`bg-green-50`, `text-red-600`). See IMPLEMENTER.md § "Contract class-name adaptation" for the class-name rule itself.
5. **Analytics is fire-and-forget** — see `references/shared/IMPLEMENTER.md` § "Fire-and-forget analytics".

## Template files

This scope uses **template files** instead of inline code. For each file below:

1. Read the template from `<Agent location>/templates/<filename>`
2. Write it to the project at the target path
3. Adapt CSS class names if the design tokens maps them differently than the defaults

Do NOT modify logic, imports, or component structure.

## Implementation

### 1. `src/styles/components-stores.css` — not owned by this scope

> Owned by the **`components-css`** sibling scope. See `./COMPONENTS_CSS.md`. Reference the contract class names from the design tokens in your TSX/Astro files; the CSS sibling defines the rules.

### 2. `src/utils/analytics.ts` — not owned by this scope

> Import from it (`import { trackEvent } from "../utils/analytics"`) but do not write it. Shipped by the build skill as a seeded shared utility.

### 3. `src/utils/wix-image.ts` — not owned by this scope

> Import `resolveWixImageUrl` from `../utils/wix-image` but do not write it. Shipped by the build skill as a seeded shared utility that already exposes `resolveWixImageUrl(image, width?, height?)`. Writing your own copy shadows and breaks callers in other verticals (blog, cms).

### 4. `src/components/SeoTags.astro`

Use template `templates/SeoTags.astro`.

Renders merchant-edited SEO from the Wix dashboard into `<head>`. Mounted on the product detail page (by `product-pages` scope) via `Layout`'s `head` slot.


```