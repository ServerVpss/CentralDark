# COMANDO - STYLING.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\shared\STYLING.md
**SHA:** 1816414a0379634b
**Timestamp:** 2026-08-26T18:42:43.157650
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- If a designer's `global.css` contains rules like `.featured-section { padding-block: var(--spacing-4xl); }` or `.product-card-body { display: flex; flex-direction: column; gap: var(--spacing-xs); }`, 
- | `--spacing-2xs` … `--spacing-4xl` | **required (full scale)** | — | every template uses `gap: var(--spacing-md)` and similar |

### Ouro Bruto (primeiros 5000 chars)
```
# Styling — Three Categories, One Default

Every visual decision in a generated site falls into one of three categories. Each has a single owner and a single home. This file is the canonical reference; `DESIGN_SYSTEM.md` (Designer), `COMPOSE.md` (Composer), `astro/designer/INSTRUCTIONS.md` (Phase 4 page designers), and `IMPLEMENTER.md` link here.

> **Design-system ownership (the design-vs-application split).** The **Designer** (`DESIGN_SYSTEM.md`) owns the token *values* and their *completeness* — a coherent, complete brand visual returned as a framework-agnostic JSON spec (`data.designTokens`). The **Composer** (`COMPOSE.md`) owns the *application* — it writes the `@theme` block in `global.css` from those values (mapping each semantic role to a `--var` name) and guarantees the required-token contract below resolves. Component and page authors still compose those tokens as Tailwind utilities at their call sites. So: Designer picks "paper = `#FAF6EF`"; Composer writes `--color-paper: #FAF6EF` into `@theme`; a page writes `class="bg-paper"`.

## The three categories

| Category | Lives in | Owned by | Use for |
|---|---|---|---|
| **Tokens (composed as utilities)** | `@theme` block in `src/styles/global.css`, mirrored to `.wix/design-tokens.css` + `.wix/site.d.ts` (emitted by `scripts/emit-design-tokens.mjs` from Designer's `data.designTokens`) | Designer picks values (Phase 2); Composer writes `@theme` | All color, spacing, typography scale, radii, aspect ratios, shadows, transitions. Pages compose tokens at call sites as Tailwind utilities — `class="py-4xl bg-sand aspect-[16/5]"`. |
| **Global semantic classes** | `src/styles/global.css` (outside `@theme`) and `src/styles/components-<pack>.css` | Designer + Phase 3 component agents | Compound multi-element patterns, interactive states (`:hover`, `:focus`, `:disabled`), and JS/React DOM query targets. |
| **Co-located styles** | `<style>` block at the bottom of the same `.astro` file (or component CSS module for islands) | Page or component author | One-off page decoration: hero stamps, custom dividers, ornamental overlays that won't be reused elsewhere. |

## Default direction

**Tokens-as-utilities is the default.** When you're about to write a class for layout, spacing, typography, alignment, simple background/text color, or aspect ratio, write Tailwind utilities derived from `@theme` instead. The site's design tokens give you `py-4xl`, `gap-sm`, `bg-paper-warm`, `text-ink`, `font-display`, `aspect-[16/5]` etc. Compose them in markup; do not invent semantic classes for these concerns.

The token namespace is the contract. The orchestrator inlines the full `designTokens` JSON in your prompt (same shape Designer returned) — at start of any pages or components scope, read from your prompt to know which tokens this run published. `.wix/design-tokens.css` and `.wix/site.d.ts` are on disk for the build to consume, but you do NOT need to read them. If a token you need isn't in the inlined contract, that's a designer-side gap — flag it in your return JSON, don't paper over it with a custom class.

## Decision tree

When you find yourself reaching for a `class="..."` value, ask:

1. **Can this be expressed as 2–4 Tailwind utilities derived from `@theme`?** → Use utilities. Don't create a class.
2. **Is it a compound multi-element pattern** (e.g., a bordered card with header + body + foot rules), an **interactive state** (`:hover`/`:focus`/`:disabled`/`:hover .child`), or a **JS query target** the DOM is inspected for? → Global semantic class in `global.css` (designer-owned) or `components-<pack>.css` (Phase 3 components agent-owned).
3. **Is it a one-off page decoration** that won't be reused on any other route? → Co-located `<style>` block at the bottom of the same `.astro` file. Reference tokens via `var(--color-foo)` from `:root` (auto-loaded by `design-tokens.css`).

If none fit, you're probably trying to do something the tokens don't support yet — talk to the designer (for new runs, return a `MISSING_TOKEN` error; for existing projects, add the token to `@theme`).

## What does NOT belong as a global semantic class

These are layout/spacing/typography concerns that should always be utilities, never standalone classes:

- Section padding / margins (`py-4xl`, `mt-3xl`, `mb-2xl`)
- Flex / grid layouts (`flex flex-col gap-md`, `grid grid-cols-3 gap-lg`)
- Aspect ratios (`aspect-[4/5]`, `aspect-square`)
- Plain typography choices (`text-display-lg font-display`, `text-mute uppercase tracking-wide`)
- Background / foreground color application without state (`bg-paper`, `text-ink-soft`)
- Container widths derived from tokens (`max-w-prose`, `w-full`) **only when** the designer declared matching `--container-*` keys in `@theme`

### Prose / reading width (CMS, FAQ, About)

Tailwind v4 resolves `max-w-3xl` to `var(--container-3xl)`, **not** `var(--spacing-3xl)`. If the designer published `--spacing-3xl: 5rem` but no `--container-3xl`, FAQ/About columns collapse to ~8
```