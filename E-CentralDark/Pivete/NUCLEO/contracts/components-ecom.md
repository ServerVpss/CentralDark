# CONTRATO - components-ecom.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\templates\ecom\components-ecom.css
**SHA:** 0d6016aa48c44160
**Timestamp:** 2026-08-26T18:42:43.053468
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: var(--spacing-sm);
- gap: var(--spacing-md);
- gap: var(--spacing-sm);
- gap: 0.25rem;
- gap: var(--spacing-sm);
- gap: var(--spacing-sm);
- gap: var(--spacing-sm);

### Ouro Bruto (primeiros 5000 chars)
```
/* src/styles/components-ecom.css
 *
 * Ecom-pack component CSS. Owned by the ecom Phase 3 components agent.
 *
 * This file is the SINGLE source of truth for ecom-component classes.
 * The designer's global.css does NOT publish .cart-summary, .cart-total,
 * .cart-empty, or .checkout-btn — those all live here. See
 * references/shared/STYLING.md § "Component-specific CSS is owned by the
 * component, not the designer".
 *
 * Class groups in this file:
 * - .cart-summary / .cart-total / .cart-empty / .checkout-btn → /cart page summary panel and empty state
 * - .cart-item / .cart-item-* / .qty-* → CartView.tsx line items
 * - .cart-discount / .cart-applied-discounts → CartView.tsx discount rows
 * - .cart-badge / .cart-badge-* → CartBadge.tsx (mounted in Navigation)
 *
 * Rules use direct CSS (`var(--token)`) only — no `@apply`. Tailwind v4
 * `@apply` in a non-entrypoint file only resolves utilities whose theme keys
 * the designer's `@theme` block declares. Earlier revisions of this template
 * used `@apply text-bark/70 bg-tobacco …` (stale token vocabulary) and
 * `@apply size-6` (built-in utility that needs `@reference` to be visible
 * here), and both classes built-failed against current designer output.
 * Direct `var(--color-ink)` / `var(--spacing-sm)` calls work against any
 * designer-published token set as long as the core scales exist (they always
 * do). Use fallback chains (`var(--color-paper-warm, var(--color-paper, var(--color-cream)))`)
 * for sometimes-published tokens.
 */

/* =========================================================================
   Cart summary panel + total + checkout button + empty state.
   Owned here, NOT in global.css.
   ========================================================================= */
.cart-summary {
  background: var(--color-paper-warm, var(--color-paper, var(--color-cream)));
  border: 1px solid var(--color-rule);
  padding: var(--spacing-xl);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
@media (min-width: 768px) {
  .cart-summary {
    position: sticky;
    top: var(--spacing-xl);
  }
}

.cart-empty {
  text-align: center;
  padding-block: var(--spacing-3xl);
  color: var(--color-mute);
}
.cart-empty .checkout-btn {
  display: inline-flex;
  width: auto;
  max-width: 18rem;
}

/* .checkout-btn — primary CTA, full-width inside .cart-summary. Self-contained;
   does NOT @apply the designer's `btn` utility (Tailwind v4 only @applies
   utilities declared with `@utility`, and the designer may or may not have
   declared it under that exact name). Composing the same visual shape inline
   keeps this file portable across designer vocabularies. */
.checkout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-lg);
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 500;
  background: var(--color-ink);
  color: var(--color-paper);
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-sm);
  cursor: pointer;
  width: 100%;
  margin-top: var(--spacing-md);
  transition: background-color 150ms ease, box-shadow 150ms ease;
}
.checkout-btn:hover:not(:disabled) {
  background: var(--color-ink-soft, var(--color-ink));
}
.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- Cart badge icon (CartBadge.tsx) --- */
/* CartBadge.tsx renders an inline SVG bag icon + optional count span. */
.cart-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cart-badge-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}
.cart-badge-count {
  position: absolute;
  top: -0.25rem;
  right: -0.5rem;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* --- Cart line items (CartView.tsx) --- */
.cart-item {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-md);
}
.cart-item-image {
  flex-shrink: 0;
}
.cart-item-image-link {
  display: block;
  flex-shrink: 0;
  cursor: pointer;
}
.cart-item-image-link:hover .cart-item-image,
.cart-item-image-link:focus-visible .cart-item-image {
  border-color: var(--color-ink);
}
.cart-item-name-link {
  color: inherit;
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px solid var(--color-mute);
  padding-bottom: 1px;
  transition: color 150ms ease, border-color 150ms ease;
}
.cart-item-name-link:hover,
.cart-item-name-link:focus-visible {
  color: var(--color-accent);
  outline: none;
  border-bottom-color: var(--color-accent);
}
.cart-item-info {
  flex: 1;
  min-width: 0;
}

/* --- Description lines & modifiers --- */
.cart-item-option {
  font-family: var(--font-body);
  font-size: 0.875rem;
  
```