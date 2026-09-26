# COMANDO - recommend-ecommerce-strategy.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-manage\references\ecommerce\recommend-ecommerce-strategy.md
**SHA:** ff862d8b093bb83b
**Timestamp:** 2026-08-26T18:42:43.178517
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Title pattern:** "Recover $[missing_sales_usd] in abandoned carts"

### Ouro Bruto (primeiros 5000 chars)
```
---
name: "Recommend: eCommerce Strategy"
description: Unified eCommerce recommendation skill — analyzes site data across ALL domains (discounts, shipping, and future domains) and generates up to 5 actionable recommendations. Single entry point for any "help my business" request. Tracking is built-in.
layer: R
references:
  - name: "API: Recommendation Tracking"
    path: ecommerce/api-recommendation-tracking.md
    load: false
  - name: "Goal: Increase AOV"
    path: ecommerce/goal-increase-aov.md
    load: false
  - name: "Goal: Clear Inventory"
    path: ecommerce/goal-clear-inventory.md
    load: false
  - name: "Goal: Seasonal Revenue"
    path: ecommerce/goal-seasonal-revenue.md
    load: false
  - name: "Goal: Drive Cross-Sells"
    path: ecommerce/goal-drive-cross-sells.md
    load: false
  - name: "Goal: Reduce Cart Abandonment"
    path: ecommerce/goal-reduce-cart-abandonment.md
    load: false
  - name: "Setup: Coupons"
    path: ecommerce/setup-coupons.md
    load: false
---
# Recommend: eCommerce Strategy

>
> **After classifying domains in Step 4b**, load the matching goal skill with `ReadFullDocsArticle`:
> - **SEASONAL** → [Goal: Seasonal Revenue](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/skills/goal-seasonal-revenue)
> - **UPSELL_BOOST** / **SHIPPING** → [Goal: Increase AOV](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/skills/goal-increase-aov) (includes both discount and shipping flows)
> - **STOCK_MOVER** → [Goal: Clear Inventory](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/skills/goal-clear-inventory)
> - **BUNDLE_AND_SAVE** → [Goal: Drive Cross-Sells](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/skills/goal-drive-cross-sells)
> - **ABANDONED_CART** → [Goal: Reduce Cart Abandonment](https://dev.wix.com/docs/api-reference/business-solutions/e-commerce/skills/goal-reduce-cart-abandonment)
>
> **If COUPON mechanism in Step 4c**, load:
> - [Setup: Coupons](https://dev.wix.com/docs/api-reference/business-solutions/coupons)

## EXECUTION RULES — READ BEFORE ANYTHING ELSE

**You are an operator, not a consultant.** When this recipe is activated:

1. **Do NOT ask clarifying questions — start executing immediately from Step 1.** The merchant's request contains enough information. The analysis steps will determine which domains and strategies apply.
2. **Do NOT produce recommendations before calling the mandatory APIs.** If you skip the API calls and generate advice from assumptions, your output is wrong — even if it sounds reasonable.
3. **Execute every step in order.** Do not skip steps. Do not merge steps. Do not answer "in the meantime."
4. **Use ONLY data returned by API calls.** Never substitute reasoning, general knowledge, or doc summaries for live data. Every number you cite in `reasoning` MUST come directly from an API response — do NOT assume, infer, or fabricate data.
5. **If a call fails or is blocked, report the exact blocker.** Do not work around it with assumptions.
6. **All API calls use `CallWixSiteAPI`.** The internal tool names (getSiteData, getCatalogAnalytics, etc.) are NOT directly callable.
7. **Generate recommendations across ALL relevant domains** — not just discounts. Consider shipping, discounts, and any other domain that the data supports.

---

## Step 1: Resolve the target site

**MANDATORY — do this first.**

If you don't already have a `siteId`, call `ListWixSites` to find it.

If the merchant mentioned a site name, match it. If only one site exists, auto-select it. Store the `siteId` — every subsequent API call requires it.

**Do not proceed without a siteId.**

---

## Step 2: Load recommendation history (Tracking)

**MANDATORY — do NOT skip unless the user said `SKIP_TRACKING` or "don't track".**

Query the tracking database for existing recommendations on this site:

```
CallWixSiteAPI(
  url: "https://manage.wix.com/_api/agentic-recommendations/v1/agentic-recommendations/query",
  method: "POST",

  body: { "query": { "filter": {}, "cursorPaging": { "limit": 50 } } }
)
```

**Use the returned history to inform your analysis:**

| State | How to use it |
|---|---|
| `PROPOSED` | Don't re-propose — ask about the pending one |
| `DONE` | Don't re-propose — consider complementary recommendations |
| `REJECTED` | Do NOT re-propose. If `rejectionPermanent` is true, never suggest this action type again |
| `FAILED` | Offer to retry or suggest alternative |
| `EXPIRED` | Can re-propose if still relevant with fresh data |

If the query returns empty results or fails, continue — this is a fresh session.

---

## Step 3: Gather site data

**MANDATORY API CALL — do not skip.**

```
CallWixSiteAPI(
  url: "https://www.wix.com/wix-profile-client/v4/profile/metasite",
  method: "POST",

  body: {
    "fields": [
      "language",
      "merchant_business_country",
      "suggested_main_industry",
      "suggested_sub_industry",
      "last_30_days_distinct_visitors",
      "la
```