# COMANDO - IMPLEMENTER.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\shared\IMPLEMENTER.md
**SHA:** a7e705abbcc5c262
**Timestamp:** 2026-08-26T18:42:43.036420
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- If a required input is missing from your prompt (e.g. the orchestrator forgot to inline `seeded.stores` when dispatching you as `pages-products`), fail fast — return `status: "failed"` with `errors: [

### Ouro Bruto (primeiros 5000 chars)
```
# Shared Implementer — Common Behavior for Every Vertical Subagent

This file is **extended by every per-vertical `INSTRUCTIONS.md`** (stores, ecom, cms, blog, forms, gift-cards). Per-vertical instruction files are thin — they declare scopes and reference paths. Everything else lives here.

## Self-loading

Read **only** the files your scope needs. The reading set varies by scope:

| Your scope | Mandatory | Conditional |
|---|---|---|
| `seed` | this file, `RETURN_CONTRACT.md`, `DOCS_SEARCH.md` | — |
| `components`, `components-css`, `pages`, `pages-*` | this file, `RETURN_CONTRACT.md`, `STYLING.md` | — |
| Image scopes | (read `references/images/INSTRUCTIONS.md` § Self-Loading) | — |

Then read the specific reference(s) for your declared scope (see your vertical's `INSTRUCTIONS.md` scope table). Do NOT read references for scopes other than the one named in your prompt — wastes context and blurs ownership.

## Phase routing

Your prompt includes a line `Scope: <name>`. Map to exactly one reference set per your vertical's `INSTRUCTIONS.md` scope table. If the `Scope:` line is missing, stop and ask the parent — do not guess.

Standard scope names (see architecture-proposal §3):
- `seed` — Seed phase (REST data setup, no frontend code)
- `components` — Components phase (reusable React/Astro islands, SDK wiring)
- `pages` — Pages phase (route files with visual design + data queries, single scope per vertical)
- `pages-<name>` — Pages phase sub-scope (only when a vertical has multiple pages groups, e.g. stores has `pages-products`, `pages-home-and-nav`)

## REST auth

Scopes that call Wix APIs (`seed`, image phases) receive `siteId` in the prompt. Mint once: `TOKEN=$(npx @wix/cli@latest token --site "$SITE_ID")`. Every `curl` uses the headers in `references/shared/AUTHENTICATION.md`. Doc lookups use the public REST endpoints listed in `references/shared/DOCS_SEARCH.md`.

If your scope is `components` or `pages`, you should NOT make REST calls — those scopes are frontend-only. If you find yourself needing a site API call, it's a scope violation — return `status: "partial"` with an error note, do not proceed.

## Do NOT read `.wix/site.json`

Every input you need is inlined in your prompt. The orchestrator is the sole reader/writer of `.wix/site.json`; the file is a slim metadata snapshot for run.json composition + resume detection, not a coordination channel.

**Phase-specific inputs (all inlined in your prompt):**

| Scope | What the prompt inlines |
|---|---|
| `seed` | `brand`, `intent.<pack>`, `siteId`, recipe path(s). Do NOT re-derive these. |
| `components` | `brand`, the full `designTokens` JSON (same shape Designer returned). CSS variables are also on disk at `.wix/design-tokens.css` for the build. |
| `pages` / `pages-*` | `brand`, the `designTokens` JSON, and the relevant `seeded.<vertical>` slice (products, posts, collections IDs). Page data wiring uses live SDK queries; the `seeded` data in your prompt is for path resolution + demo content authoring. |

If a required input is missing from your prompt (e.g. the orchestrator forgot to inline `seeded.stores` when dispatching you as `pages-products`), fail fast — return `status: "failed"` with `errors: [{ code: "PROMPT_INCOMPLETE", missing: "seeded.stores.products" }]`. Do NOT re-fetch from `.wix/site.json` or via curl — the data gap means an upstream phase didn't complete, and re-querying would mask the real bug.

## Seeders return data; orchestrator aggregates

Agents with `Scope: seed` return their seeded entities in the `data` block of the standard return (see `RETURN_CONTRACT.md`). The orchestrator collects every seeder return into its session scratch and inlines the relevant slice into the prompts of Phase 3 Components / Phase 4 Pages / Image Phase 2 subagents. You do NOT write `site.json` yourself and you do NOT write `.wix/seed-returns/<pack>.json` — your JSON return is the contract.

## Writing page files

Pages-phase agents write route files (`.astro`) with:

1. **Visual design via design tokens and Tailwind.** Reference tokens as `var(--color-primary)` in `<style>` blocks or `bg-[--color-primary]` as Tailwind arbitrary values. Use canonical component templates (`agents/<vertical>/templates/*.astro`) as starting points — adapt, don't invent.
2. **Data queries against seeded data.** The seeded entity IDs / slugs are inlined in your prompt (`seeded.<vertical>`). Pages query the Wix SDK at request time (`await productsV3.queryProducts(...)`) — that's the production-correct pattern. Use the inlined `seeded` data for path generation (e.g. `getStaticPaths` slugs) and for authoring demo content where needed; do NOT `import` `.wix/site.json` from page files.
3. **Imports from shared components.** Pages import components your Components-phase agent wrote (`src/components/*.tsx`, `.astro`).
4. **Imports from skill shared utilities.** `from "../utils/wix-image"` and `from "../utils/analytics"` — these are skill-shipped (copied into the project by `seed-ut
```