# OUTRO - STAFF-REPORT-V2.md
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\01-ARQUIVOS-DA-CONVERSA\.extracted_DOSSIER-TRUSTED-ACCESS-CENTRALDARK-20260806\.extracted_PACOTAO-CENTRALDARK-RIGOR-MAXIMO\qa.teste-de-software.MARKDOWN\03-KIT-RELATORIOS-OVERCLOCK\STAFF-REPORT-V2.md
**SHA:** 5c7fb14eaf14faa2
**Timestamp:** 2026-08-26T20:05:49.542319
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- > Método: 3 execuções Playwright + CDP com **CPU throttling 4×** (perfil mid-range), `Profiler.setSamplingInterval=50µs`, cache desabilitado, locale `pt-BR`. Mediana das runs. Análise de chunks por **

### Ouro Bruto (primeiros 5000 chars)
```
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
t=2724
```