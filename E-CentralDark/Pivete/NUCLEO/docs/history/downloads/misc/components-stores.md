# OUTRO - components-stores.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\templates\stores\components-stores.css
**SHA:** fc7e5311c435d1b9
**Timestamp:** 2026-08-26T18:45:23.238573
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: var(--spacing-xl);
- gap: var(--spacing-md);
- gap: var(--spacing-xs);
- gap: var(--spacing-md);
- gap: var(--spacing-xs);
- gap: var(--spacing-sm);
- gap: var(--spacing-sm);
- gap: var(--spacing-md);
- gap: var(--spacing-sm);
- gap: var(--spacing-sm);

### Ouro Bruto (primeiros 5000 chars)
```
/* src/styles/components-stores.css
 *
 * Stores-pack component CSS. Owned by the stores Phase 3 components agent.
 *
 * This file is the SINGLE source of truth for stores-component classes.
 * The designer's global.css does NOT publish .product-card, .product-grid,
 * .product-card-media, .product-card-ribbon, .product-card-index, or the
 * .offer-callout family — those all live here. See references/shared/STYLING.md
 * § "Component-specific CSS is owned by the component, not the designer".
 *
 * Class groups in this file:
 * - .product-card / .product-grid / .product-card-* → product cards (ProductCard.astro), product listings (products/index.astro, category/[slug].astro), home grid (index.astro)
 * - .offer-callout family → discount callout above ProductPurchase on /products/[slug]
 * - .option-* / .stock-status / .modifier-text → ProductPurchase.tsx (variant pills, stock label, free-text modifier)
 * - .quantity-* → ProductPurchase.tsx + CartView.tsx (quantity stepper)
 * - .back-in-stock-* → BackInStockForm.tsx (out-of-stock subscribe)
 *
 * Uses the palette + typography custom properties declared in global.css.
 */

/* =========================================================================
   Product card + grid — owned here, NOT in global.css.
   The .product-card uses overflow: hidden + border-radius, so inner padding
   is the responsibility of THIS file (whoever sets the radius owns the
   inset). Don't ship a stub rule and rely on the template to add padding
   utilities — that's the leak this file was created to prevent.
   ========================================================================= */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-xl);
  transition: opacity 200ms ease;
}
body[data-navigating="true"] .product-grid {
  opacity: 0.55;
  pointer-events: none;
}

.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  background: var(--color-paper, var(--color-cream));
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 280ms ease, box-shadow 280ms ease;
  box-shadow: var(--shadow-card, 0 4px 16px -8px rgba(0, 0, 0, 0.15));
}
.product-card:hover {
  transform: translateY(-4px);
}
.product-card:hover .product-card-media > img {
  transform: scale(1.04);
}

.product-card-media {
  position: relative;
  margin: var(--spacing-md);
  aspect-ratio: 4 / 5;
  background: var(--color-paper-warm, var(--color-cream));
  border-radius: var(--radius-md);
  overflow: hidden;
}
.product-card-media > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 600ms ease;
}

.product-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding-inline: var(--spacing-md);
}
.product-card-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.125rem;
  line-height: 1.25;
  color: var(--color-ink);
}
.product-card-price {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  letter-spacing: 0.02em;
  color: var(--color-mute);
}

.product-card-ribbon {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
  padding: 0.375rem 0.625rem;
  background: var(--color-accent);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: var(--radius-sm);
  z-index: 2;
}
.product-card-index {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  padding: 0.375rem 0.5rem;
  background: rgba(255, 255, 255, 0.85);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  border-radius: var(--radius-pill, 9999px);
  z-index: 2;
}

/* =========================================================================
   Offer callout — bordered panel above ProductPurchase on /products/[slug].
   Compound multi-element pattern. The dashboard-authored offer string can
   contain `\n` line breaks; -detail must preserve them via white-space.
   ========================================================================= */
.offer-callout {
  background: var(--color-paper-warm, var(--color-cream));
  border: 1px solid var(--color-rule);
  border-left: 2px solid var(--color-accent);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.offer-callout-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.offer-callout-item + .offer-callout-item {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-rule);
}
.offer-callout-badge {
  align-self: flex-start;
  padding: 0.25rem 0.5rem;
  background: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-body);
  
```