# COMANDO - _schema.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\verticals\_schema.md
**SHA:** 810dc9fbc2e5bc8e
**Timestamp:** 2026-08-26T18:42:42.873441
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Sanity-check at session start:

### Ouro Bruto (primeiros 5000 chars)
```
# Vertical Schema (Phase 1 — discovery only)

Each file in `references/verticals/` declares one vertical's contribution to discovery. The skill reads the user's prompt, loads the matching pack set (per SKILL.md routing table), and assembles the plan from the loaded packs' frontmatter.

> **Phase 1 scope.** This schema covers only what discovery needs. Later phases (setup, seed, design system, pages, build) are owned by an upstream skill plus this skill's own templates and `INSTRUCTIONS.md` files:
> - `@skills/wix-manage` — REST API recipes for site setup and content seeding.
>
> Per-pack fields (`packages`, `cmsCollections`, `seed`, `components`, `componentsCss`, `pages`, `creates`, `contributes`, `include`) are not part of this schema — those concerns belong to upstream recipes and per-vertical templates, not this skill's vertical packs.

## File format

Markdown with YAML frontmatter. The frontmatter is the machine-readable config; the body is a short human-readable note about what the pack does and where its Phase 2+ implementation lives.

## Frontmatter fields

```yaml
---
# --- Identity ---
name: stores                          # unique vertical name, matches the filename stem
description: "Short one-liner — what the pack provides at a glance."
triggers:                             # prompt patterns that route the user to this vertical
  - "sell"                            # case-insensitive substrings
  - "ecommerce"                       # SKILL.md routing table is the source of truth for actual loading;
                                      # this list is human reference + a fallback signal.

# --- Dependencies ---
requires: []                          # optional — verticals that must be co-loaded.
                                      # Example: stores requires ["ecom", "gift-cards"]; gift-cards requires ["ecom"].
                                      # If a pack with `requires:` is loaded, every name in the list MUST be in the same read batch.

# --- Plan contribution ---
features:                             # human-readable feature blurbs. Used in DISCOVERY.md Step 3 Section B.
  - name: "Product catalog"
    description: "Browse products with images, prices, and variants."

# --- Plan Pages table ---
apps:                                 # zero or one entry per pack. apps[0].name fills the Source column
  - name: "Wix Stores"                # of DISCOVERY.md Step 3 Section C.
    appDefId: "215238eb-22a5-4c36-9e7b-e7c08025e04e"

routes:                               # routes the pack ships. Each entry → one row in the Pages table.
  - route: "/products"                # `route:` value renders verbatim in the Route cell.
  - route: "/products/[slug]"
    name: "Product Detail"            # OPTIONAL: user-facing name override for the Page cell. When omitted,
                                      # the orchestrator derives the name from the path (/ → "Home";
                                      # /thank-you → "Thank You"). Override only when path-derivation
                                      # produces a poor name (e.g. "/products/[slug]" → "Products [slug]")
                                      # OR when the route has no path (use the literal string "Hosted by Wix").

# --- Activation ---
disabled: false                       # if true, the pack ships its code but its surfaces (pages, nav, home blocks) are inactive
                                      # by default — they light up only when the user takes a separate action (today: enabling
                                      # the matching Wix app from the dashboard, detected by a runtime probe). DISCOVERY.md plan
                                      # composition (Sections B + C) skips features and routes from disabled packs so the plan
                                      # never promises a surface the user did not opt into. Today only `gift-cards` sets
                                      # `disabled: true`. Default false.
---
```

## Field reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Matches filename stem (`stores.md` → `name: stores`) |
| `description` | string | yes | One-line label — what the pack provides |
| `triggers` | string[] | yes (empty allowed for transitive-only packs) | Case-insensitive substrings. SKILL.md routing table is the actual source of truth for what gets loaded; this is human reference. |
| `requires` | string[] | no | Verticals that must be co-loaded in the same read batch |
| `features` | object[] | yes | `{name, description}` — used in DISCOVERY.md Step 3 Section B |
| `apps` | object[] | no | Zero or one entry. `apps[0].name` fills the Source column of the Pages table; absence implies built-in (cms uses `"CMS (builtin)"` literal). |
| `routes` | object[] | no | `{route, name?}` — one row per entry in the Pages table |
| `disabled` | bool | no | If true, the pack's surfaces are inactive by default. DISCOVERY plan skips disabled packs from Sect
```