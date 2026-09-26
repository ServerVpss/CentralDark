# COMANDO - PRODUCT_PAGES.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\stores\PRODUCT_PAGES.md
**SHA:** f24e00a53003edfb
**Timestamp:** 2026-08-26T18:42:43.102100
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- > **Why the double-script pattern:** Listing page is server-rendered but `AddProductImpression` must fire in the browser. The server-computed payload is serialized into an inert JSON `<script>` (`is:i

### Contratos
- Class from contract: `productCard` → `"product-card"`. If the designer already added the class, don't duplicate.

### Ouro Bruto (primeiros 5000 chars)
```
# Phase 4 Product Pages — Stores

Scope: `product-pages`. Launched in **Step 7** after designer page scopes have written placeholder `.astro` files. This scope rewrites the product listing, product detail, and ProductCard component with live `productsV3` queries.

## Scope

Files this agent OWNS (rewrites from designer output):

- `src/pages/products/index.astro` — product listing
- `src/pages/products/[slug].astro` — product detail with `wixMetadata` + SEO tags
- `src/components/ProductCard.astro` — reusable card used by listing + home

Files this agent MUST NOT touch:
- `src/components/ProductPurchase.tsx`, `src/components/AddToCartButton.tsx` — owned by `components`
- `src/pages/cart.astro`, `src/pages/thank-you.astro` — owned by `pages-cart-checkout`
- `src/pages/index.astro`, `src/components/Navigation.astro` — owned by `pages-home-and-nav`
- `src/components/CategoryRail.astro` — owned by `pages-categories`. **Import** from `../../components/CategoryRail.astro`; never `Write` it. If it's not on disk yet when you go to mount it, that means the orchestrator dispatched scopes out of order — return `status: "partial"` with `errors: [{ code: "MISSING_PAGES_CATEGORIES_OUTPUT", path: "src/components/CategoryRail.astro" }]` (never defensively `Write` it yourself — `pages-categories` is the only writer, and racing it trips the harness staleness guard).
- `src/utils/categories.ts` — pre-copied by the orchestrator before Phase 4 (BUILD.md Step 7 pre-batch). **Import** `listStoreCategories`/etc. from `../../utils/categories`; never `Write` it.
- `global.css`, any other `.astro` page, any other component — owned by designers

## Inputs (from parent prompt)

- **Phase 1 return data** — `products: [{id, name, slug, variantId, price, inventory, sku}]` — use slugs when needed (rarely; `queryProducts` returns them already).
- **Design tokens** — the full `designTokens` JSON is inlined in your prompt for the published color/spacing/typography vocabulary; compose Tailwind utilities derived from those tokens (`class="py-4xl flex flex-col gap-md font-display"`) at the call site rather than inventing semantic classes for layout/spacing/typography. Retained global semantic classes are limited to compound patterns (`offer-callout`, `cart-summary`), interactive primitives (`btn-primary`, `product-card`), and JS targets — see `references/shared/STYLING.md`.
- **Designer output summary** — paths of existing `products/index.astro`, `products/[slug].astro`, `ProductCard.astro` with placeholder data.

## Critical rules (all must be honored)

1. **Use `productsV3`, not `products`** — V1 silently returns 0 on V3 catalogs.
2. **Product detail MUST use `getProductBySlug()`**, not `queryProducts()`. `queryProducts` omits variant data (`options`, `variantsInfo`), making add-to-cart silently fail.
3. **Product detail MUST export `wixMetadata`** — required for Wix sitemap, SEO editor, and dashboard deep links. Without it, the sitemap has zero product entries.
4. **Mount `SeoTags` on the detail page** — pipe `product.seoData.tags` through `Layout`'s `head` slot so merchant SEO edits in the Wix dashboard reach the live site. `seoData` is returned by default — no `fields` flag needed.
5. **Mount `ProductPurchase` with `client:load` and a single `product` prop, plus the back-in-stock probe + price props.** `<ProductPurchase client:load product={product} inventoryByVariant={inventoryByVariant} backInStockEnabled={backInStockEnabled} priceAmount={priceAmount} />`. The component destructures internally; passing flat props (`productId={product._id}`, `options={product.options}`, …) silently renders nothing because the new contract expects `product`. The `backInStockEnabled` boolean comes from `await getBackInStockEnabled()` (template imports it from `../../utils/back-in-stock`); `priceAmount` is the numeric price already computed in the frontmatter. See `BACK_IN_STOCK.md` for why both are needed.
6. **SSR only — do NOT add `export const prerender = true` or `getStaticPaths()`.** The productsV3 SDK depends on request-context auth (tenant resolution, site headers). At prerender time there is no request, and `.queryProducts().limit()` short-circuits to `"is not a function"`. Keep `[slug].astro` server-rendered with `Astro.params.slug`.
7. **No HTML comments in `.astro` frontmatter.** Build fails with "Legacy HTML single-line comments are not allowed".
8. **Default to tokens-as-utilities for layout/spacing/typography.** When you need a section padding, a flex column, a typographic treatment — write Tailwind utilities derived from `@theme` tokens (`<section class="py-4xl flex flex-col gap-md">`, `<h1 class="font-display text-4xl">`). Do NOT invent semantic classes like `.featured-section`, `.page-header`, `.products-header-image` — Tailwind v4 silently drops undeclared classes. Use a global semantic class only when one is published in designer `INSTRUCTIONS.md`'s always-required list (`product-card`, `product-card-ribbon`, `offer-callout` family). For o
```