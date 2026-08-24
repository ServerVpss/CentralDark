---
name: visual-design-method
description: Method for producing any visual deliverable (poster, dashboard, page, card, diagram) for CentralDark — how to calibrate treatment, ground the palette in real canonical sources instead of inventing one, and structure themes so the same artifact can carry multiple official skins without a redesign. Engine-agnostic: any model/tool that can emit HTML/CSS/SVG can follow it.
---

# Visual Design Method

This documents the **method**, not a tool. It does not depend on any specific
model, editor, or publishing mechanism. Any engine capable of writing
HTML/CSS/SVG (or an equivalent styling system) can follow it.

## 0. Reuse before create — check for a real palette first

Before choosing a single color, search the repository for an existing design
system. CentralDark already has one documented at
`docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md` ("Esmeralda" — emerald
green, Geist/Geist Mono, light-default). Treat it as ground truth for
product surfaces.

```text
REQUEST_FOR_VISUAL
→ search docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md and sibling docs
→ search src/index.css (or equivalent) for real token values
→ search existing operational artifacts (cards, dashboards) already in use
→ FOUND real palette → extract and reuse it
→ NOT FOUND → only then propose a new one, and say explicitly it is new
```

`FOUND_PALETTE != INVENTED_PALETTE`. Never present an invented palette as
"the CentralDark colors" — say whose choice it is (yours, or a specific
source file) and let the human confirm.

## 1. Calibrate treatment to the request

Not every visual needs the same investment:

- **Utilitarian** (a plan, a memo, a status panel): real hierarchy,
  considered spacing, a proper palette — but no oversized hero, no
  unnecessary flourish.
- **Editorial** (a poster, a landing page, a piece meant to be shown or
  kept): an opinionated point of view, one real aesthetic risk, typography
  that carries personality.

Decide this before writing any CSS. State which one you picked and why.

## 2. Separate structure from skin — token-based theming

If more than one official palette exists (this repo currently has three
real, distinct visual identities — see §3), do not build three separate
files or three component trees. Keep **one** DOM/layout/component structure
and make only the color **tokens** swappable:

```text
Component (Button, Card, Panel, ...)
        │
        ▼  reads semantic tokens, never literal colors
--color-bg / --color-panel / --color-border
--color-accent-primary / --color-accent-secondary
--color-text / --color-text-muted / --color-danger
        │
        ▼  redefined per theme, structure untouched
[data-theme="a"]  [data-theme="b"]  [data-theme="c"]
```

`THEME_SWITCH != REDESIGN`. Structure, positions, and content stay fixed;
only the token values under `[data-theme="..."]` change. This is the same
pattern as light/dark mode, generalized to N palettes. Persist the chosen
theme (`localStorage` or the project's existing preference store) so it
survives reload; do not build a new backend just for this.

Audit for leaks before shipping: any inline SVG `stroke`/`fill`, any
`style="color:#..."`, any hardcoded `rgb()`/`rgba()` outside the token block
will silently break on other themes. Search for hex codes and `rgba?\\(`
outside the token definitions and route every hit through a token.

## 3. The three real CentralDark palettes found so far

Extracted from actual repository/session artifacts, not invented:

| Theme | Source | Signature |
|---|---|---|
| `emerald` | `docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md` + `src/index.css` (`--primary: 152 76% 50%` dark) | Emerald green, near-black ground, Geist |
| `operational` | Cartão operacional (5-etapas card) | Navy + cyan + red-as-alert — HUD/control-room register |
| `forge` | `.agents/skills/visual-design-method/assets/forja-de-cartas.html` (committed here for verifiable provenance — `sha256:e8f4016dcf8b2b6f9806d8ef29a5105506ef5eba5225f3aeff9b78bcb301f348`; real CSS values: `#C0902B`, `#FFE9A8`, `#0C0A06`, `#100D07`, `#2B1C08`...) | Gold/bronze shell + cream/foil card face — premium/legendary register |

**These are three global official themes, not three alternate skins to pick
between per artifact.** `THEME_SWITCH != REDESIGN`: every CentralDark surface
— site, painel, Hermes Desktop, Hub, WebUI, and any one-off artifact like a
poster — carries the same structure and offers all three; the human picks
which is active. `emerald` is the current default. Never present this as "which
register fits this artifact" — the three coexist everywhere, always.

## 4. Type pairing

Pick a display face and a body face deliberately for the subject — never
default to Inter/Space Grotesk because they feel safe. Inspect the target's
actual CSP before adding any external font host. If the CSP does not already
permit the chosen host, use a self-hosted repository font or the declared
system fallback; never weaken CSP just to make typography load. Keep a mono
face reserved for tabular/data content (`font-variant-numeric: tabular-nums`
wherever digits line up in a column).

## 5. Avoid AI-generated-design defaults

Unless the human explicitly asks for one of these, don't reach for: warm
cream + serif + terracotta, near-black with a lone neon accent, purple-to-
blue gradient hero, rounded-lg on everything, emoji as section markers,
everything centered. If a choice reads like the generic default for any
similar page, revise it.

## 6. Reality Judge — verify before declaring done

`CSS_COMPILED != VISUALLY_CORRECT`. Before telling the human it's ready:

- Check tag/brace balance and script syntax mechanically. Parse classic
  scripts as classic scripts and modules as modules (`node --check` on an
  extracted `.mjs`, the target parser, or a real browser compile). Never use
  `new Function()` as a universal parser: it rejects valid module syntax and
  can accept code under the wrong execution contract.
- If a real browser/preview surface is available, actually render it and
  look, don't just assert.
- If the rendering surface itself is unavailable or sandboxed (auth walls,
  no display), say so explicitly instead of claiming a visual check that
  didn't happen. `ACTION != PROOF` applies to design output exactly as it
  does to code.

## 7. Zero regression on iteration

When asked to improve an existing visual artifact, edit the same file/same
published target — don't start a new one. Preserve: chosen composition,
fixed elements the human has already approved (e.g. a specific figure's
position), and any theme/token system already in place. Only extend.

## Integration

- Palette discoveries → this skill's §3 table (keep it current, don't
  duplicate it elsewhere)
- Structural/aesthetic lessons that survive contact with real use →
  `knowledge-compiler` for crystallization
- This skill governs the **decision process**, not delivery mechanics —
  those still belong to whatever engine/tool renders or publishes the page

## Canonical visual witnesses

The four CentralDark posters are indexed at
`docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/README.md`; their stable
IDs, source hashes, repository hashes and typed semantic relations live in
that directory's `manifest.json`. Treat the posters as visual witnesses, not
as executable authority. The design-system owner and governance text win on
conflict. Obsidian, vector memory, Grafo Vivo and GraphRAG are rebuildable
mirrors/indexes of the same brain — never a second writer.

For a canonical poster delivery, preserve this chain:

```text
source image -> provenance/hash manifest -> Markdown/Mermaid meaning
-> generated package/receipt
```

Do not commit a ZIP as the source of truth; generate it from the editable
components and keep its receipt external to the final bytes.
