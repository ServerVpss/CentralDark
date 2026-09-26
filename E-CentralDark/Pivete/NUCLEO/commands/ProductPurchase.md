# COMANDO - ProductPurchase.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\templates\stores\ProductPurchase.tsx
**SHA:** 1962103ac24e0496
**Timestamp:** 2026-08-26T18:42:42.750083
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Binary OOS gate:

### Ouro Bruto (primeiros 5000 chars)
```
import { useState, useMemo, useEffect } from "react";
import { currentCart } from "@wix/ecom";
import AddToCartButton from "./AddToCartButton";
import BackInStockForm from "./BackInStockForm";

interface Choice { choiceId?: string | null; name?: string | null; key?: string | null; }
interface Option { _id?: string | null; name?: string | null; choicesSettings?: { choices?: Choice[]; }; }
// Modifiers: customization choices without separate variants/inventory/price.
interface FreeTextSettings { title?: string | null; key?: string | null; maxLength?: number | null; }
interface Modifier {
  // SDK convention: outer entity IDs are `_id` (same as Variant/Option/Product).
  // REST returns `id`; @wix/stores remaps to `_id` in the SDK response.
  _id?: string | null;
  name?: string | null;
  key?: string | null;
  mandatory?: boolean;
  modifierRenderType?: string | null;   // "TEXT_CHOICES" | "SWATCH_CHOICES" | "FREE_TEXT"
  choicesSettings?: { choices?: Choice[] };
  freeTextSettings?: FreeTextSettings;
}
interface VariantChoice { optionChoiceIds?: { optionId?: string; choiceId?: string; }; }
interface Variant {
  _id?: string | null;
  choices?: VariantChoice[];
  price?: { actual?: { amount?: string; formattedAmount?: string; }; };
  // productsV3 also exposes a per-variant inventoryStatus, but it's a STALE
  // cached flag — a variant with live quantity 0 can still report
  // `inStock: true`. Only used as a last-resort fallback when the
  // inventoryByVariant prop is empty. The authoritative signal is
  // inventoryItemsV3 — see the page-level query in PRODUCT_PAGES.md.
  inventoryStatus?: { inStock?: boolean; preorderEnabled?: boolean };
  // Future-proofing: if a future wiring passes real quantities in props
  // (e.g. via @wix/inventory join by variantId), maxQuantity honors them.
  stock?: { quantity?: number | null; inStock?: boolean; };
  inventoryItem?: { quantity?: number | null; inStock?: boolean; trackQuantity?: boolean };
}
interface Stock { trackInventory?: boolean; inventoryStatus?: string; quantity?: number | null; }
interface VariantStock { quantity: number; trackQuantity: boolean; preorderEnabled: boolean }

// Single `product` prop (the full productsV3 object) mirrors ProductCard's
// contract so both components take the same shape. Keeps `[slug].astro`
// mount sites greppable: <ProductPurchase client:load product={product}
// inventoryByVariant={inventoryByVariant} />.
interface ProductLike {
  _id?: string | null;
  name?: string | null;
  actualPriceRange?: { minValue?: { currency?: string | null } | null } | null;
  options?: Option[] | null;
  modifiers?: Modifier[] | null;
  variantsInfo?: { variants?: Variant[] } | null;
  stock?: Stock | null;
}
interface ProductPurchaseProps {
  product: ProductLike;
  // Live per-variant stock from inventoryItemsV3, keyed by variantId.
  // AUTHORITATIVE source for OOS gating. productsV3's cached inStock flag is
  // not reliable — see PRODUCT_PAGES.md anti-patterns table.
  inventoryByVariant?: Record<string, VariantStock>;
  // SSR probe result from getBackInStockEnabled() — gates the OOS subscribe
  // form. When false, OOS branches render only the existing "Out of Stock"
  // / "Sold Out" stock-status copy. See references/BACK_IN_STOCK.md.
  backInStockEnabled?: boolean;
  // Numeric product price for the back-in-stock subscribe call. The Wix
  // endpoint validates `itemDetails.price >= 0` and rejects formatted
  // strings; pass a number, not "$695".
  priceAmount?: number;
}

export default function ProductPurchase({
  product,
  inventoryByVariant = {},
  backInStockEnabled = false,
  priceAmount,
}: ProductPurchaseProps) {
  const productId = product._id ?? "";
  const productName = product.name ?? "";
  const currency = product.actualPriceRange?.minValue?.currency ?? undefined;
  const options = product.options ?? [];
  const modifiers = product.modifiers ?? [];
  const variantsInfo = product.variantsInfo ?? { variants: [] };
  const stock = product.stock ?? undefined;

  const variants = variantsInfo.variants ?? [];
  const hasMeaningfulOptions = options.length > 0 && options.some(
    (opt) => (opt.choicesSettings?.choices?.length ?? 0) > 1,
  );
  const [selections, setSelections] = useState<Record<string, string>>({});
  const handleSelect = (optionId: string, choiceId: string) =>
    setSelections((prev) => ({ ...prev, [optionId]: choiceId }));
  const allSelected = hasMeaningfulOptions && options.every((opt) => opt._id && selections[opt._id]);

  // Modifier state. Two parallel maps keyed by modifier._id, flattened below
  // into the shapes cart expects.
  const [modifierChoice, setModifierChoice] = useState<Record<string, string>>({});
  const [modifierText, setModifierText] = useState<Record<string, string>>({});
  const handleModifierChoice = (id: string, key: string) => setModifierChoice((p) => ({ ...p, [id]: key }));
  const handleModifierText = (id: string, v: string) => setModifierText((p) => ({ ...p, [id]: v }));

  cons
```