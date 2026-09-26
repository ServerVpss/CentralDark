## Performance Diagnostic Report - overclock.sh

### Executive Summary

Coleta via CDP (Tracing + PerformanceTimeline + Network). TTFB ≈ 716.0ms, FCP ≈ 944ms, load 2178.8ms. 59 long-tasks somando 5450.9ms travaram a main thread; v8 compile ≈ 5.9ms, layout ≈ 479.9ms em 106 passes, recalc style ≈ 135.1ms. Gargalo dominante: Long task de **331.2ms** iniciando em 1697469.6ms após navegação, com 0 request(s) em voo — CPU-bound work (parse/compile/render).


### Long Tasks Analysis

| # | Start (ms) | Duration (ms) | Attribution | Correlated Request | Hypothesis |
|---|-----------:|--------------:|-------------|--------------------|------------|
| 1 | 1697469.6 | 331.2 | RunTask (main thread) | `—` | CPU-bound work (parse/compile/render) |
| 2 | 1697849.1 | 114.0 | RunTask (main thread) | `—` | CPU-bound work (parse/compile/render) |
| 3 | 1700860.9 | 112.1 | RunTask (main thread) | `—` | CPU-bound work (parse/compile/render) |
| 4 | 1699788.1 | 111.3 | RunTask (main thread) | `—` | CPU-bound work (parse/compile/render) |
| 5 | 1698691.3 | 109.0 | RunTask (main thread) | `—` | CPU-bound work (parse/compile/render) |

### Main Thread Hotspots

- **Long tasks**: 59 totalizando 5450.9ms
- **Layout passes**: 106 (479.9ms)
- **Recalc Style**: 141 (135.1ms)
- **V8 compile**: 5.9ms  |  V8 heavy run (>20ms): 202.1ms
- **Heaviest request (dur)**: `https://overclock.sh/` (1137.7ms)
- **Heaviest request (bytes)**: `https://overclock.sh/hero/bunker-back-gpt-C.png` (2386676 B)

### Network ↔ Long Task Correlation


**LT#1** — 331.2ms @ 1697469.6ms
- Sem requests em voo → work puramente CPU (hidratação/compile).

**LT#2** — 114.0ms @ 1697849.1ms
- Sem requests em voo → work puramente CPU (hidratação/compile).

**LT#3** — 112.1ms @ 1700860.9ms
- Sem requests em voo → work puramente CPU (hidratação/compile).

**LT#4** — 111.3ms @ 1699788.1ms
- Sem requests em voo → work puramente CPU (hidratação/compile).

**LT#5** — 109.0ms @ 1698691.3ms
- Sem requests em voo → work puramente CPU (hidratação/compile).

### Gargalo Principal

Long task de **331.2ms** iniciando em 1697469.6ms após navegação, com 0 request(s) em voo — CPU-bound work (parse/compile/render).

### Recommendations (Prioritized)

1. **Quebrar o long task de hidratação** — mover trabalho síncrono do bundle inicial para `requestIdleCallback` ou `startTransition`. Em Next/RSC, marcar componentes pesados como `'use client'` só onde precisa e usar `dynamic(() => import(...), { ssr:false })` para os visualmente não-críticos:
   ```tsx
   const Heavy = dynamic(() => import('./Heavy'), { ssr:false, loading:()=>null });
   ```
2. **Cachear o HTML/RSC no edge** — se `cache-control: no-store` está no origin, trocar por `s-maxage=60, stale-while-revalidate=300`; no Next 14+: `export const revalidate = 60` no `page.tsx` derruba TTFB de ~1s para ~30ms via Cloudflare.

3. **Comprimir assets grandes** — imagens PNG >500KB devem virar AVIF/WebP com `next/image` + `priority` só para o LCP. Ex.: `avifenc --min 20 --max 40 input.png output.avif` (~85% menor).


### Limitações da Captura (honestidade técnica)

- **Stack traces completos de long tasks**: o CDP `PerformanceTimeline` entrega `long-task` sem attribution profunda. Para obter stack de JS por sample, seria preciso `Profiler.start` + `Profiler.stop` (V8 CPU Profiler) e cruzar samples por timestamp — não fizemos aqui para manter o output determinístico e leve.
- **Alinhamento de relógios**: `Network.*` timestamps são monotonic e o trace tem baseline própria. Alinhamos por FCP (offset=0.0ms). Erros de ±10ms podem deslocar correlação, mas não invalidam ranking.
- **Third-party dentro de iframes**: eventos de long-task em iframes cross-origin não emergem no PerformanceTimeline do frame principal (política de origem). Não podemos atribuir bloqueio a scripts embutidos de outra origem sem `--disable-web-security`.
- **Determinismo parcial**: o site é dinâmico (RSC + rede real). Repetimos com `wait_for_load_state('networkidle')` + 2.5s de folga para estabilizar, mas variações de rede podem alterar durações em ±15%.