# COMANDO - goal-reduce-cart-abandonment.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-manage\references\ecommerce\goal-reduce-cart-abandonment.md
**SHA:** 045f4ee0a464cf0c
**Timestamp:** 2026-08-26T18:42:42.868900
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Before recommending actions, assess the root cause of abandonment. Ask or investigate:

### Ouro Bruto (primeiros 5000 chars)
```
---
name: "Goal: Reduce Cart Abandonment"
description: Maps cart abandonment reduction to recovery automation KPIs. Covers abandoned cart email automation activation, missing sales detection, and eligibility thresholds. Also references shipping flows that affect checkout drop-off.
layer: goal
references:
  - name: "Flow: Fix Coverage Gaps"
    path: ecommerce/flow-fix-coverage-gaps.md
    load: false
  - name: "Recipe: Apply Shipping Recommendations"
    path: ecommerce/recipe-apply-shipping-recommendations.md
    load: false
  - name: "Setup Store Pickup Location"
    path: ecommerce/setup-store-pickup-location.md
    load: false
---
# Goal: Reduce Cart Abandonment

> **Related skills**:
> - [Flow: Fix Coverage Gaps](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/skills/flow-fix-coverage-gaps) — shipping coverage gaps block checkout entirely
> - [Recipe: Apply Shipping Recommendations](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/skills/recipe-apply-shipping-recommendations)
> - [Setup Store Pickup Location](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/skills/setup-store-pickup-location)

Reduce checkout abandonment caused by shipping friction — coverage gaps, unexpected costs, and missing free shipping options — by optimizing the delivery step of the checkout funnel.

---

## Business Goal

The merchant wants to reduce the percentage of customers who abandon checkout, specifically at the delivery/shipping step. Shipping-related friction is the leading cause of checkout abandonment, and the delivery step conversion rate (delivery_step_cvr) is the primary metric.

**Benchmark:** A healthy delivery_step_cvr is approximately 65%. Stores below this benchmark have significant shipping-related friction.

---

## KPIs

| KPI | Definition | How to measure | Benchmark |
|---|---|---|---|
| Delivery step CVR | Customers completing delivery step / customers reaching delivery step | Site metrics: delivery_step_cvr | 65% |
| Cart abandonment rate | Carts created but not converted to orders / total carts | 1 - (orders / carts) | Industry avg ~70% |
| Free shipping qualification rate | Orders qualifying for free shipping / total orders | Track orders meeting free shipping threshold | Higher is better |
| Revenue from recovered checkouts | Incremental revenue from improved conversion | (new_cvr - old_cvr) * checkout_sessions * AOV | - |

---

## Triggers

Activate this goal when the merchant expresses any of the following intents:

- "cart abandonment"
- "checkout drop-off"
- "shipping friction"
- "delivery step"
- "people are leaving at checkout"
- "customers not completing orders"
- "why are customers abandoning"
- "checkout conversion"
- Any request about reducing drop-off during the purchase flow

---

## Diagnostic Questions

Before recommending actions, assess the root cause of abandonment. Ask or investigate:

1. **Where are buyers dropping off?** — Is it specifically the delivery step, or payment, or earlier in the funnel?
2. **Are shipping costs visible before checkout?** — Surprise shipping costs are the #1 abandonment driver.
3. **Is there a free shipping option?** — Free shipping (even with a threshold) dramatically reduces abandonment.
4. **Are there shipping coverage gaps?** — Customers in unserved regions cannot complete checkout at all.
5. **Are shipping rates reasonable?** — Rates above 10-15% of order value cause sticker shock.
6. **Are payment methods adequate?** — Missing payment options can look like shipping-step abandonment in metrics.
7. **Are recovery emails enabled?** — Abandoned cart emails can recapture 5-15% of abandoned carts.

---

## Recommended Actions (Prioritized)

Actions are ordered by impact. Address blocking issues first, then conversion drivers, then optimization.

### Priority 1: Flow: Fix Shipping Coverage Gaps (Blocking)

Coverage gaps are the most critical issue — if a customer's region is not covered by any shipping option, they literally cannot complete checkout.

**When to use:** When delivery profiles show regions without active shipping options, inactive regions, or missing domestic coverage.

**Impact:** Removes a hard blocker. Customers in uncovered regions have 0% conversion.

### Priority 2: Flow: Add Free Shipping (Conversion Driver)

Free shipping is the single most effective lever for reducing cart abandonment. Even with a minimum order threshold, offering a free shipping option significantly improves delivery step conversion.

**When to use:** When the store has no free shipping option, or when the existing free shipping threshold is set too high relative to AOV.

**Impact:** Typically improves delivery_step_cvr by 10-20 percentage points. The threshold should be calibrated to AOV (typically 1.2x-1.5x AOV).

### Priority 3: Flow: Optimize Shipping Rates (Sticker Shock Reduction)

High shipping rates cause sticker shock even when coverage exists. Rate optimization ensures pricing is competitive and
```