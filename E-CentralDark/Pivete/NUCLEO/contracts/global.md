# CONTRATO - global.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-headless\references\astro\templates\global.css
**SHA:** eedba66c0da31d9a
**Timestamp:** 2026-08-26T18:42:43.111160
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: var(--spacing-2xs);
- gap: var(--spacing-sm);
- gap: var(--spacing-md);

### Ouro Bruto (primeiros 5000 chars)
```
/* ── Composer skeleton: src/styles/global.css ──────────────────────────────
   The fixed bulk below is LITERAL — do not re-author it. Composer's only edit
   is to replace the {{theme}} block with the @theme palette derived from the
   inlined designTokens (see COMPOSE.md § "1. global.css"). Everything outside
   {{theme}} references the stable token vocabulary via var(--token) / built-in
   utilities and is brand-agnostic; ship it byte-for-byte.
   ─────────────────────────────────────────────────────────────────────────── */

@import "tailwindcss";

@theme {
  /* {{theme}} — Composer substitutes the full palette here from designTokens:
     every --color-*, --font-*, --spacing-* (2xs..4xl), --container-*, and
     --radius-* line. The required-token set (COMPOSE.md § "Token contract")
     MUST all be present, or components render unstyled. Container scale is
     separate from spacing — never alias --container-3xl to --spacing-3xl. */
}

/* Reading-width helper so prose pages center without guessing Tailwind sizes. */
@utility container-reading {
  max-width: var(--container-prose);
  margin-inline: auto;
}

/* Shared button primitive — declared with @utility so the variants below can
   @apply it (a plain contract class is NOT @apply-able in Tailwind v4). */
@utility btn {
  @apply inline-flex items-center justify-center px-lg py-md rounded-md font-medium;
  transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
}

@layer base {
  * {
    box-sizing: border-box;
  }
  html {
    -webkit-text-size-adjust: 100%;
  }
  body {
    margin: 0;
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-body);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    line-height: 1.15;
    margin: 0;
  }
  p {
    margin: 0;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  button {
    font: inherit;
    cursor: pointer;
  }
  input, textarea, select {
    font: inherit;
  }
  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
}

/* ── Button family — used on every page in every vertical ─────────────────── */
.btn-primary {
  @apply btn;
  background: var(--color-ink);
  color: var(--color-paper);
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-accent);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-secondary {
  @apply btn;
  background: transparent;
  color: var(--color-ink);
  border: 1px solid var(--color-rule);
}
.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-ghost {
  @apply btn;
  background: transparent;
  color: var(--color-ink);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--color-paper-warm);
}
.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Cross-cutting decorative patterns ────────────────────────────────────── */
[data-decorative-slot] {
  position: relative;
  overflow: hidden;
}
[data-decorative-slot] > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.editorial-rule {
  border: 0;
  height: 1px;
  background: var(--color-accent);
  opacity: 0.6;
  margin-block: var(--spacing-lg);
}

/* ── Universal site chrome ────────────────────────────────────────────────── */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--color-paper) 88%, transparent);
  backdrop-filter: saturate(1.1) blur(8px);
  border-bottom: 1px solid var(--color-rule);
}
.site-footer {
  border-top: 1px solid var(--color-rule);
  background: var(--color-paper-warm);
  color: var(--color-mute);
}

/* ── View Transitions wiring (paired with Layout.astro <script>) ──────────────
   Disable the default ClientRouter root cross-fade; the progress bar + grid-dim
   carry navigation feedback instead. Do not split into a separate file. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

.nav-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent, currentColor);
  transform: scaleX(0);
  transform-origin: left;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
}
.nav-progress[data-state="loading"] {
  opacity: 1;
  transform: scaleX(0.85);
  transition: transform 1.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 120ms ease;
}
.nav-progress[data-state="done"] {
  opacity: 0;
  transform: scaleX(1);
  transition: transform 200ms ease, opacity 240ms ease 60ms;
}

/* Dim the product grid while ClientRouter fetches/swaps for immediate feedback. */
body[data-navigating="true"] .product-grid {
  opacity: 0.55;
  transition: opacity 140ms ease;
  pointer-events: none;
}
.product-grid {
  transition: opacity 200ms ease;
}

/* ── Navigation sub
```