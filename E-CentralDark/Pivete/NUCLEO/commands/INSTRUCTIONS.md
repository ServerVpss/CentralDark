# COMANDO - INSTRUCTIONS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\stores\INSTRUCTIONS.md
**SHA:** 9e2a9738543579dc
**Timestamp:** 2026-08-26T18:42:43.445292
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- - `.product-grid` — the layout that lists product cards. Both `/products` (pages-products scope) and `/category/[slug]` (pages-categories scope) consume it from one place. Include `display: grid; grid

### Ouro Bruto (primeiros 5000 chars)
```
---
name: stores-implementer
description: "Implements Wix Stores vertical — product catalog, categories, add-to-cart, product pages. Scopes: seed, components, components-css, pages-products, pages-categories, pages-home-and-nav. Extends references/shared/IMPLEMENTER.md."
---

# Stores Implementer

Extends `references/shared/IMPLEMENTER.md`. Read that file first for phase routing, REST auth + doc lookups, prompt-inlined inputs (no site.json reads), return contract, style conventions, and common failure modes.

## Scope routing

| Scope | Phase | Reference |
|-------|-------|-----------|
| `seed` | Seed (REST catalog setup — products only; categories are merchant-driven, not seeded) | `./PRODUCT_CATALOG_DATA.md` |
| `components` | Components (React islands + SeoTags + back-in-stock util — TSX/Astro only, **no CSS**) | `../astro/stores/SHARED_WIRING.md` |
| ~~`components-css`~~ | **Do not dispatch.** `src/styles/components-stores.css` is copied from `<SKILL_ROOT>/references/astro/templates/stores/components-stores.css` by the orchestrator's pre-Step-4.5 batch (see BUILD.md § Step 4.5). The template uses direct `var(--token)` CSS, so it works against any designer-published vocabulary without per-run rewrites. `COMPONENTS_CSS.md` documents that CSS for reference — there is no `components-css` subagent to dispatch. | — |
| `pages-categories` | Pages (`/category/[slug]` listing + shared CategoryRail + `utils/categories.ts`) | `../astro/stores/CATEGORY_PAGES.md` |
| `pages-products` | Pages (products listing + detail + ProductCard; mounts the rail written by `pages-categories`) | `../astro/stores/PRODUCT_PAGES.md` |
| `pages-home-and-nav` | Pages (home-page contribution + Shop submenu in Navigation) | `../astro/stores/HOME_AND_NAV.md` |

> **Why `components` is split.** A single agent writing five .tsx/.astro files plus the scoped CSS dominated Phase 3 wall time (228 s on a 3-product run, 320 s on an 8-product run). The CSS file has no runtime coupling to the TSX components — it's referenced only by class name at build time — so it splits cleanly into a sibling agent that runs in the same dispatch batch. Each scope gets a smaller reading set and a smaller write list. See `../astro/stores/COMPONENTS_CSS.md` § "What this scope owns".

## Files this vertical creates / contributes

See `<SKILL_ROOT>/references/verticals/stores.md` frontmatter (`creates:` and `contributes:` blocks).

## Pre-return file-existence assertion (all page scopes)

Before returning `status: "complete"` from any `pages-*` scope, verify every file listed in your scope's `files:` block (see verticals/stores.md) exists on disk. Silently dropping a file (e.g. `[slug].astro` from `pages-products`) reports `complete` to the orchestrator, but every product link 404s at runtime.

If a declared file is missing, return `status: "partial"` with `errors: [{ code: "PHASE4_FILE_MISSING", path: "<expected path>" }]` rather than claiming success. The orchestrator's Step 8.0.5 manifest check will also catch this, but an agent-side assertion gives a faster and more precise failure.

## Templates

Canonical templates live at `<SKILL_ROOT>/references/astro/templates/stores/`. Your `components` and `pages-*` scopes read these and adapt them — don't invent markup or logic.

Components (`components` scope — TSX/Astro only):
- `<SKILL_ROOT>/references/astro/templates/stores/AddToCartButton.tsx`
- `<SKILL_ROOT>/references/astro/templates/stores/ProductPurchase.tsx`
- `<SKILL_ROOT>/references/astro/templates/stores/BackInStockForm.tsx`
- `<SKILL_ROOT>/references/astro/templates/stores/SeoTags.astro`

Components CSS (`components-css` scope — scoped CSS only):
- `<SKILL_ROOT>/references/astro/templates/stores/components-stores.css`

Pages (`pages-products` scope):
- `<SKILL_ROOT>/references/astro/templates/stores/ProductCard.astro`
- `<SKILL_ROOT>/references/astro/templates/stores/products/index.astro`
- `<SKILL_ROOT>/references/astro/templates/stores/products/[slug].astro`

Pages (`pages-categories` scope):
- `<SKILL_ROOT>/references/astro/templates/stores/CategoryRail.astro`
- `<SKILL_ROOT>/references/astro/templates/stores/category/[slug].astro`

### Pre-copied by the orchestrator (do NOT write these yourself)

The following utility files are deterministically copied by the orchestrator BEFORE your phase dispatches (`components` for the first, `pages` for the second). They are mechanical SDK wrappers with no brand-specific content; reading or rewriting them as part of your scope wastes tokens and risks drift. Just import the helpers at the listed paths:

- `src/utils/back-in-stock.ts` — pre-copied from `<SKILL_ROOT>/references/astro/templates/stores/back-in-stock.ts` before `components` dispatches.
- `src/utils/categories.ts` — pre-copied from `<SKILL_ROOT>/references/astro/templates/stores/categories.ts` before `pages` dispatches.

If you find one of these missing at runtime, that's an orchestrator-side bug — return `status: "partial"` with `errors: [{code: "UTILITY_TE
```

---

# COMANDO - INSTRUCTIONS.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\images\INSTRUCTIONS.md
**SHA:** 58c4800c9bcaa9f0
**Timestamp:** 2026-08-26T18:42:43.813448
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Failure mode — do NOT ship with this pattern:**

### Ouro Bruto (primeiros 5000 chars)
```
---
name: images-agent
description: "Generates images for the site. Two scopes: image-phase-1-decorative (hero/about/background art) and image-phase-2-entity (product/blog/CMS item images, needs Phase 1 Seed entity IDs)."
---

# Images Agent — Scope-Based Image Generation

Generates site images in two scopes. Uses Wix AI (Runware) for generation and Wix Media for hosting — all via `curl` against `wixapis.com` using the CLI-minted REST token (see `../shared/AUTHENTICATION.md`).

**Nothing else blocks on image generation.** Phases 1–4 and the core pipeline all proceed independently. Products, posts, and pages work without images. Each image phase enriches them when it finishes.

## Scope Routing

Your prompt includes `Scope: <name>`. Map it to an image phase:

| Scope | Depends on | Output |
|---|---|---|
| `image-phase-1-decorative` | Brand context only | Decorative images for hero / about / backgrounds; slot→URL map returned in `data.slots` |
| `image-phase-2-entity` | Phase 1 Seed return data (entity IDs in prompt) | Entity images attached to products / blog posts / CMS items via REST PATCH |

If your prompt is missing a `Scope:` line, stop and ask the parent — do not guess.

## Self-Loading

1. Read `../shared/IMAGE_GENERATION.md` — Wix AI image generation + Wix Media import recipe (including the **required** batched-call pattern)
2. Read `../shared/DOCS_SEARCH.md` — REST auth for Wix API calls
3. **Prefer the inlined recipe below and `IMAGE_GENERATION.md` over external docs.** When a PATCH or API call fails:
   1. **FIRST re-read your own recipe** in this file (INSTRUCTIONS.md § for that entity type) — it likely covers the error.
   2. If the recipe covers it, follow the recipe. Do NOT look up external docs for errors your recipe already handles.
   3. **ONLY** if you've re-read the recipe AND the error is genuinely not covered, fall back to `docs-search REST (see DOCS_SEARCH.md)` / `raw-docs REST (see DOCS_SEARCH.md)`.
   
   Known errors already covered by this recipe (do not look up externally):
   - **428** from product PATCH → missing `options`/`variantsInfo` → see § "Products" step 1
   - **400** `"Expected an object"` from product PATCH → missing `revision` → see § "Products" step 4
   - **400** `unsupportedParameter` → strip `steps`/`CFGScale` → see § "Error Handling"
   - **400** `unsupportedDimensions` → see § "Error Handling"
   - **400** `invalidTaskUUID` → `taskUUID` must be valid UUIDv4 → see § "Quick Reference"

## Quick Reference: Generation Call Shape

Before the first REST call, ensure the `curl` tool schema is loaded (the orchestrator's session auth covers this for the whole session per `<SKILL_ROOT>/references/commands/AUTHENTICATION.md` — only re-load if you hit a tool-not-found error). Use your runtime's AUTHENTICATION.md recovery ladder to look up the suffix.

**All generation tool calls for an image phase MUST be in one concurrent batch.** The exact shape depends on the model — see `../shared/IMAGE_GENERATION.md` § "Required: minimize round-trips" for the rule. In short:

- **`google:4@2` (the default):** N concurrent 1-task `curl` calls as siblings in one batch. (Batched N≥3 times out at 504 on this model.)
- **`bfl:5@1`, `runware:400@1`:** one batched `curl` call with N tasks in the body array.

Example task body (same for both patterns — only the distribution across tool calls changes):

```
REST: POST https://www.wixapis.com/runwareschemaless/v1/request
body: [
  {
    "taskType": "imageInference",
    "taskUUID": "550e8400-e29b-41d4-a716-446655440000",
    "outputType": "URL",
    "outputFormat": "PNG",
    "positivePrompt": "<prompt-for-image>",
    "height": 1024,
    "width": 1024,
    "model": "google:4@2",
    "numberResults": 1
  }
]
```

Extract `data[i].imageURL` from each response. Import each to Wix Media immediately. **Do NOT send `steps` or `CFGScale`** with `google:4@2` — both cause a 400 error. `taskUUID` must be a valid UUIDv4 (`uuidgen` or `crypto.randomUUID()`) — Runware rejects human-readable slugs with `400 invalidTaskUUID`.

### Mandatory pre-call procedure — construct ALL tasks FIRST, then dispatch in ONE message

Image Phase 2 serializes into 6+ sequential calls across multiple turns when you compose and send tasks one-at-a-time. The fix is to build the full task set first and dispatch them as a single concurrent batch.

**Required procedure (do this, exactly, every time):**

1. **Plan all image prompts in your text response FIRST.** Write out every entity you need to generate for, with its prompt text, dimensions, and UUIDv4. Use a numbered list or table. Do not start any tool calls yet.

2. **Compose the full task set** as a fenced JSON block in your text. Verify the count matches the entity count.

3. **Dispatch in one concurrent batch.** For `google:4@2`: N concurrent sibling calls, each with one task. For other models: one tool call with all N tasks in `body`.

4. **After generation returns:** make all N import calls as **sibling calls in one concur
```