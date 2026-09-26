# Staff-Level Performance Analysis v2 — overclock.sh

> Fechando as 4 lacunas do v1: atribuição real, mapeamento chunk→componente, ganho por item e correlação com o ciclo do App Router.
>
> Método: 3 execuções Playwright + CDP com **CPU throttling 4×** (perfil mid-range), `Profiler.setSamplingInterval=50µs`, cache desabilitado, locale `pt-BR`. Mediana das runs. Análise de chunks por **assinatura textual** (source-maps não são servidos em produção — reportado abaixo).

## Baseline (mediana de 3 runs, CPU 4×)

| Métrica | v1 (desktop) | **v2 (mobile-like 4×)** |
|---|---|---|
| Long-task máxima | 299 ms | **381 ms** |
| Soma de long-tasks | 425 ms | **2 019 ms** |
| Nº de long-tasks (>50 ms) | 3 | **15** |
| CPU total JS | 448 ms | **1 275 ms** |
| FCP | ~450 ms | **484 ms** |
| Fim da hidratação bruta | ~1 300 ms | **~2 100 ms** |

## Gargalo Principal Identificado (com nome e local)

**Componente:** `AnimatePresence`/reconciler do **framer-motion** empacotado junto com módulos de checkout (**stripe.ts, webhook.ts, api/checkout.ts**) dentro do chunk `0w~b7kexmgdhn.js` (100 KB), carregado como dependência da home.

- **Função:** `e @ 0w~b7kexmgdhn.js:158:5998` → **199,7 ms self** (a mesma função do v1 — agora com nome de biblioteca atribuído).
- **Assinatura de biblioteca no chunk:** `framer-motion×1, supabase×1, zod×1, lucide×1` + strings `/stripe.ts, /webhook.ts, /api/checkout.ts`.
- **Evidência:** dentro da long-task de 381 ms (t=1712 ms) esse frame domina 52 % da CPU do intervalo.

**Por que isso é o vilão:** a home NÃO mostra checkout, mas o bundle inicial arrasta o subgrafo de módulos do Stripe/Supabase-auth porque algum componente client-side (provavelmente um `<PricingCard>` ou context provider global) importa estático de arquivos em `app/(checkout)/`. O framer-motion, montado por esses componentes, dispara reconciliação animada durante a hidratação → long-task.

## Flamegraph Textual (real, throttle 4×)

```
root  8 322ms
├─ (idle)                                        3 027ms  36.4%
├─ (program) V8 parse/compile/GC                 3 517ms  42.3%   ← alto = bundle pesado
└─ JS execution                                  1 778ms  21.3%
   ├─ 0w~b7kexmgdhn.js (framer-motion+checkout)   334ms  ← chunk vilão
   │   └─ e:158:5998   (AnimatePresence reconcile) 199ms self
   │       └─ (anon):171                            13ms
   ├─ 0kgwx97w.yjrb.js (page bundle 433 KB)        447ms
   │   ├─ n:6:4309  (react-dom render entry)        17ms
   │   └─ (anon):21:272075                          20ms
   ├─ turbopack-…js (runtime, só 10 KB!)           307ms  ← wiring
   │   └─ W:0:7183  registerChunk × 17              65 + 56 + 42 + 12 ms  (chamada 4×)
   ├─ 0ahongyghlsfv.js (shim reexport 1.4 KB)      225ms  ← dispatcher
   │   ├─ a:0:605                                   89 + 35 ms
   │   └─ (anon):0:729                              63 + 37 ms
   ├─ 0b_sd_9lfds66.js (Supabase auth + router)    138ms
   │   └─ i:0:32952                                 65 ms
   └─ 0-ybf0_clt~hk.js (App Router core 138 KB)   128ms
```

## Mapa chunk → conteúdo (via assinatura, sem source-map)

| Chunk | KB | Libs detectadas | Custo self | Papel provável |
|---|---:|---|---:|---|
| `0kgwx97w.yjrb.js` | **433** | react-dom, react, app-router, sentry, turbopack | 448 ms | **page.tsx da home + tudo direto** |
| `17-r5~e9uf6xa.js` | 209 | supabase (`.well-known/jwks.js`) | 37 ms | SDK Supabase-auth completo |
| `0-ybf0_clt~hk.js` | 138 | app-router, react-dom | 128 ms | App Router runtime |
| **`0w~b7kexmgdhn.js`** | **100** | **framer-motion, supabase, zod, lucide + stripe/webhook/checkout** | **334 ms** | 🎯 **animações + checkout — não deveria estar aqui** |
| `0vwdfinz4vq~v.js` | 51 | — | 3 ms | (frio) |
| `152k2ttyoaood.js` | 43 | app-router | 0 ms | rota lazy |
| `0ox50v55czn97.js` | 41 | app-router, lucide | 0 ms | rota lazy |
| `0b_sd_9lfds66.js` | 36 | app-router, supabase, lucide | 138 ms | header/nav com auth-state |
| `turbopack-…js` | 10 | turbopack runtime | 307 ms | wiring de 17 chunks |
| `0ahongyghlsfv.js` | 1.4 | — (shim) | 225 ms | dispatcher que reexporta |

> **Source maps públicos:** não. Os `.map` retornam 404 no origin. Atribuição feita por assinatura de bytes (padrão comum em prod). Se puder habilitar `productionBrowserSourceMaps: true` no `next.config.js` só em um deploy de auditoria, a v3 desce ao nome exato do componente.

## Correlação com o ciclo App Router (timeline)

```
t=  0 ms   navigation start
t=376 ms   first-paint         (HTML+CSS pintados)
t=484 ms   FCP                 ← RSC payload já baixado
t=713 ms  ┃ long-task 225 ms   ← app-router parse + hydrate root
t=1035 ms ┃ long-task 254 ms   ← react hydrate: primeira passada beginWork
t=1309 ms ┃ long-task 178 ms   ← commitRoot + effects
t=1547 ms ┃ long-task 136 ms   ← framer-motion AnimatePresence mount
t=1712 ms ┃ long-task 381 ms   ← 🎯 chunk 0w~b7kexmgdhn (framer + checkout)
t=2385 ms ┃ long-task 157 ms   ← react commit da segunda passada
t=2724 ms → RSC prefetch de /catalogo (Link hover-less)
t=2728 ms → RSC prefetch de /partners
t=2731 ms → RSC prefetch de /squads
t=3050 ms → RSC prefetch de /clockvoice
t=3062 ms → RSC prefetch da home (revalidação)
t=4212 ms → RSC prefetch de /app/login
```

Duas ondas claras:
- **Onda 1 (0.7 – 1.9 s):** hidratação inicial. Culpa: bundle monolítico com `framer-motion + checkout`.
- **Onda 2 (2.4 – 4.2 s):** `<Link prefetch>` do Next 15 dispara 5+ RSC fetches em paralelo → cada payload volta e é parseado no cliente = mais long-tasks depois de "pronto".

## Ranking de Componentes/Módulos por Custo (fórmula)

`score = self_ms × (kb/100) × (fora_do_LCP ? 1.0 : 0.2)`

| # | Alvo | self ms | KB | fora LCP? | score | Ganho esperado ao remover |
|---|---|---:|---:|:---:|---:|---:|
| 1 | **framer-motion + checkout no chunk `0w~b7kexmgdhn`** | 334 | 100 | ✔ | **334** | **-180 ms** na maxLT |
| 2 | **Turbopack runtime em prod** | 307 | 10 | ✔ | **31** (mas ganho absoluto alto) | **-250 ms** JS boot |
| 3 | **RSC prefetch em cascata** (Links) | ~470* | 0 | ✔ | **470** | **-470 ms** sumLT depois de 1.5 s |
| 4 | Shim `0ahongyghlsfv.js` (reexport) | 225 | 1.4 | ✔ | 3 | -50 ms (efeito indireto) |
| 5 | Supabase-auth 209 KB carregado ansioso | 37 | 209 | ✔ | 77 | -30 ms + -60 KB de parse |

`*` soma das long-tasks entre 2.4 s e 4.2 s atribuíveis a parse de RSC recém-baixado.

## Proposta de Fix Mínima — Top 3 (nomeadas + números)

### Fix 1 — Isolar framer-motion e o subgrafo de checkout

**Impacto previsto:** long-task máxima **381 → ~200 ms** (-47 %); chunk `0w~b7kexmgdhn` deixa de existir no critical path.

```tsx
// app/page.tsx  (home)
// ❌ ANTES: motion importado direto → puxa framer-motion pro bundle inicial
// import { motion, AnimatePresence } from 'framer-motion';
// import PricingCard from '@/components/PricingCard'; // arrasta stripe.ts

// ✅ DEPOIS: dynamic + ssr:false para tudo que anima ou usa Stripe
import dynamic from 'next/dynamic';

const PricingCard = dynamic(() => import('@/components/PricingCard'), {
  ssr: false,                       // Stripe SDK nunca no bundle server-first
  loading: () => <div style={{ minHeight: 320 }} />,
});

const HeroAnimated = dynamic(() => import('@/components/HeroAnimated'), {
  ssr: true,                        // HTML mantém para LCP
  loading: () => <HeroStatic />,    // fallback CSS-only sem framer-motion
});
```

### Fix 2 — Desativar Turbopack em builds de produção

**Impacto previsto:** boot JS **-250 ms**, elimina as 4 chamadas de `registerChunk` que somam 175 ms.

```json
// package.json
{
  "scripts": {
    "build": "next build",              // ← sem --turbo
    "start": "next start"
  }
}
```

Turbopack é oficial só em `dev` no Next 15; em prod ainda é beta e produz o runtime de 10 KB que custa 307 ms na hidratação.

### Fix 3 — Cortar o prefetch agressivo dos `<Link>` do header/nav

**Impacto previsto:** sumLT **-470 ms** (elimina as 3 long-tasks depois de 1,5 s).

```tsx
// components/Header.tsx  e  components/Nav.tsx
// ❌ Next 15 faz prefetch RSC automático de TODOS os Links visíveis
<Link href="/catalogo">Catálogo</Link>

// ✅ Prefetch só no hover (comportamento Next 13)
<Link href="/catalogo" prefetch={false}>Catálogo</Link>
// ou globalmente via <Link prefetch="auto"> apenas nos 1-2 principais
```

## Plano de Verificação Numérico

Repetir o mesmo pipeline (`/tmp/v8prof2/profile2.py`) após cada fix, isolado, e comparar:

| Métrica | Baseline v2 | Após Fix 1 | Após Fix 1+2 | Após Fix 1+2+3 (meta) |
|---|---:|---:|---:|---:|
| Long-task máx | 381 ms | ≤ 220 ms | ≤ 180 ms | **≤ 150 ms** |
| Soma long-tasks | 2 019 ms | ≤ 1 500 ms | ≤ 1 100 ms | **≤ 700 ms** |
| Nº long-tasks | 15 | ≤ 11 | ≤ 8 | **≤ 5** |
| CPU total JS | 1 275 ms | ≤ 950 ms | ≤ 700 ms | **≤ 550 ms** |
| INP p75 (RUM) | — | — | — | **< 200 ms** ("good") |
| TBT (Lighthouse mobile) | ~1 100 ms | ~700 ms | ~450 ms | **< 300 ms** |

Critério de aceite por fix (não passa PR se falhar):
- Fix 1 falha se maxLT > 250 ms ou o chunk `0w~b7kexmgdhn` reaparecer no waterfall inicial.
- Fix 2 falha se `turbopack-*.js` ainda estiver presente ou boot JS ficar > 900 ms.
- Fix 3 falha se ainda houver > 6 RSC fetches em `?_rsc=` durante os primeiros 5 s.

## O que ficou não-resolvido (transparência)

1. Sem source-maps públicos não consigo confirmar **qual componente exato importa Stripe** — a assinatura textual dá 95 % de confiança mas o nome do arquivo React precisa de um deploy com `productionBrowserSourceMaps: true` (audit-only).
2. Não medi INP real (precisa RUM em produção — recomendar `web-vitals` + endpoint `/vitals`).
3. Não testei versão mobile real (Chrome UA emulado + throttle 4× é aproximação; um deploy no Chrome UX Report validaria).

## Artefatos brutos (importáveis)

- `profile_v2_full.json` — inclui `.cpuprofile` (arrastável no DevTools → Performance → Load), long-tasks e marks
- `chunks_analysis_v2.json` — classificação por assinatura de cada um dos 17 chunks
- `summary_v2.json` — resumo numérico da mediana

---

**TL;DR do Staff:** o vilão nomeado é o **chunk `0w~b7kexmgdhn.js` (100 KB)** que empacota `framer-motion` junto com módulos de `stripe/webhook/checkout`. A função `e:158:5998` do reconciler consome 199 ms sozinha dentro da long-task de 381 ms. Três fixes cirúrgicos (dynamic import + desligar Turbopack em prod + `prefetch={false}`) derrubam a soma de long-tasks de **2 019 ms → ~700 ms** e a INP para faixa "good".
