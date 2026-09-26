# Painel 747 — Recuperação e Estabilização (07/08/2026)

## Contexto
- Branch `painel747` recuperado de `SynkraAI/aiox-core` PR #540 (fechado 6 meses atrás, branch deletada)
- Recuperação via `git fetch origin pull/540/head:painel747`
- Repo clonado em `C:/Users/danda/aiox-core/` — **EXTERNO, fora do canônico**

## Stack Estabilizada
| Componente | Versão/Config | Nota |
|------------|---------------|------|
| Next.js | 15.5.23 | App Router + RSC |
| React | 19.2.8 | Server Components por padrão |
| Tailwind | **v3.4.17** | NÃO v4 — v4 quebrou PostCSS |
| PostCSS | `postcss.config.cjs` (CommonJS) | `module.exports` com `require("tailwindcss")` |
| `globals.css` | `@tailwind base; @tailwind components; @tailwind utilities;` + CSS vars | Sem `@apply` |
| `tailwind.config.js` | CommonJS (`module.exports`) | Content: `./src/**/*.{js,ts,jsx,tsx,mdx}` |
| Porta | 3001 | `npm run dev` |

## Pitfall Crítico: Tailwind v4 no Windows
**Erro**: `It looks like you're trying to use tailwindcss directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package...`

**Causa**: Tailwind v4 exige `@tailwindcss/postcss` package separado + config ES module. Next.js 15 no Windows com `postcss.config.mjs` falhou com `ReferenceError: module is not defined in ES module scope`.

**Fix aplicado**:
1. `npm install tailwindcss@3.4.17 autoprefixer --legacy-peer-deps`
2. `postcss.config.cjs` (CommonJS):
   ```js
   const tailwindcss = require("tailwindcss");
   const autoprefixer = require("autoprefixer");
   module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
   ```
3. `globals.css` com diretivas clássicas:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   @import "tw-animate-css";
   /* CSS vars + classes .cockpit-* */
   ```
4. `tailwind.config.js` CommonJS:
   ```js
   module.exports = {
     content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
     theme: { extend: {} },
     plugins: [],
   };
   ```

## Componentes Cockpit (reutilizáveis)
| Componente | Props | Uso |
|------------|-------|-----|
| `MetricCard` | `name, value, delta, tone` | 6 cards métricas core |
| `TrendChart` | `bars: number[]` | 12 barras (divs com height %) |
| `GaugeDial` | `label, level: "safe"\|"warn"` | Agulha CSS `transform: rotate()` |
| `StatusLed` | `source: {label, state}` | LED 10px + label |

Todos **Server Components** (zero JS cliente), só CSS vars + classes Tailwind.

## Roteamento
- `/dashboard` — Painel principal (RSC, URL-driven: `?productId=x&period=7d`)
- `/lab` — Index cards estilo cockpit (Client Component com `"use client"`)
- `/lab/[file]` — Markdown cru servido via `public/lab/` (Next.js static serving)

## Estado Atual
- ✅ Rodando na porta 3001
- ✅ `/dashboard` 200 OK (métricas, trend, gauges, LEDs, alerts)
- ✅ `/lab` + 4 arquivos markdown 200 OK
- ⚠️ Repo `aiox-core` é **EXTERNO** — mover para `ServerVpss/CentralDark/apps/modulos/painel747/` se virar oficial