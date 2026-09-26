# CONTRATO - AddToCartButton.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\templates\stores\AddToCartButton.tsx
**SHA:** 936917defd51b934
**Timestamp:** 2026-08-26T18:42:43.018333
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Build catalogReference.options per Wix Stores Catalog V3 contract:

### Ouro Bruto (primeiros 5000 chars)
```
import { useState } from "react";
import { currentCart } from "@wix/ecom";
import { trackEvent } from "../utils/analytics";

const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price?: number;
  currency?: string;
  variantId?: string;
  variantName?: string;
  quantity?: number;
  disabled?: boolean;
  // Modifier selections, already flattened by ProductPurchase. Shapes:
  //   modifierChoices:  { [modifier.key]: choice.key }
  //   customTextFields: { [modifier.freeTextSettings.key]: "<user input>" }
  modifierChoices?: Record<string, string>;
  customTextFields?: Record<string, string>;
}

export default function AddToCartButton({
  productId, productName, price, currency,
  variantId, variantName, quantity = 1, disabled,
  modifierChoices, customTextFields,
}: AddToCartButtonProps) {
  const [status, setStatus] = useState<"idle" | "added">("idle");

  const handleAddToCart = async () => {
    // Optimistic: show success immediately, fire API in background
    setStatus("added");
    setTimeout(() => setStatus("idle"), 2000);
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: { delta: quantity } }));

    try {
      // Build catalogReference.options per Wix Stores Catalog V3 contract:
      //   { variantId, options: { [modifier.key]: choice.key }, customTextFields: { … } }
      const catalogOptions: Record<string, unknown> = {};
      if (variantId) catalogOptions.variantId = variantId;
      if (modifierChoices && Object.keys(modifierChoices).length > 0) {
        catalogOptions.options = modifierChoices;
      }
      if (customTextFields && Object.keys(customTextFields).length > 0) {
        catalogOptions.customTextFields = customTextFields;
      }
      const { cart } = await currentCart.addToCurrentCart({
        lineItems: [{
          catalogReference: {
            appId: WIX_STORES_APP_ID,
            catalogItemId: productId,
            options: Object.keys(catalogOptions).length > 0 ? catalogOptions : undefined,
          },
          quantity,
        }],
      });
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { cart } }));
      trackEvent("AddToCart", {
        id: productId, name: productName, price, currency,
        quantity, variant: variantName, origin: "Product Page",
      });
    } catch {
      setStatus("idle");
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: {} }));
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || status === "added"}
      className="add-to-cart-btn"
    >
      {disabled ? "Select Options" : status === "added" ? "Added \u2713" : "Add to Cart"}
    </button>
  );
}

```