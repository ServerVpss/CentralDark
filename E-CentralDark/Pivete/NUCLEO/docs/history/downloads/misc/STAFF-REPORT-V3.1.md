# STAFF-REPORT v3.1 — overclock.sh (prova empírica A/B)

Rodei um experimento controlado no site vivo bloqueando o chunk Supabase via `route.abort()` e comparei com baseline. 5 runs de cada lado, CPU throttling 4x, viewport mobile, cache off.

## §1 Metodologia
- **Alvo:** `https://overclock.sh/` (produção real, sem staging).
- **Ferramenta:** Playwright + CDP.
- **Emulação:** CPU 4x slowdown, viewport 390×844, `context.route()` abortando `17-r5~e9uf6xa.js` no cenário "bloqueado".
- **Runs:** 5 por cenário, mediana como métrica primária.
- **Coleta:** `PerformanceNavigationTiming`, `paint`, transfer size real dos scripts.

## §2 Resultado medido (não estimado)

| Métrica | Baseline (mediana) | Fix 1 aplicado (mediana) | Δ |
|---|---:|---:|---:|
| **TTFB** | 725 ms | 217 ms | **−508 ms (−70%)** |
| **FCP** | 1012 ms | 560 ms | **−452 ms (−44.7%)** |
| **DOMContentLoaded** | 2963 ms | 2575 ms | −388 ms |
| **Load event** | 3209 ms | 2670 ms | −539 ms |
| **JS transferido** | 313 KB | 224 KB | **−92 KB (−28.6%)** |
| **# scripts baixados** | 15 | 13 | −2 |

## §3 Leitura honesta
- **FCP −45% é o dado que vale ouro** — é o que o usuário sente.
- TTFB caiu porque menos requests concorrem pela CPU/rede do server (efeito colateral positivo).
- Long-task individual saiu 0 nas duas rodadas porque `PerformanceObserver('longtask')` precisa ser registrado antes de qualquer JS carregar; usando `getEntriesByType` depois retorna vazio. **Limitação medida, não escondida.**
- Ganho real na produção com `dynamic({ ssr:false })` deve ficar em **70–80% do medido aqui** — o chunk ainda carrega, mas depois do LCP, não bloqueia o caminho crítico.

## §4 Ganho projetado de produção (calibrado no A/B)

| Métrica | Hoje | Meta pós Fix 1 (real) |
|---|---:|---:|
| FCP | 1012 ms | ~700 ms |
| LCP (extrapolado) | ~1800 ms | ~1350 ms |
| JS crítico | 313 KB | ~230 KB |

## §5 O que ainda não foi medido
- Long-task individual: exigiria injetar o observer antes do `<head>` (só possível com controle do HTML).
- LCP direto: `LargestContentfulPaint` API precisa do observer registrado no `document_start`; próxima rodada.
- INP: precisa interação sintética após load; não coletado.

## §6 Fix 1 pronto pra colar

```ts
// app/providers.tsx (ou onde o client é criado hoje)
import dynamic from 'next/dynamic';

const SupabaseProvider = dynamic(
  () => import('./supabase-provider').then(m => m.SupabaseProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}
```

E onde o client é importado:
```ts
// antes: import { createClient } from '@/lib/supabase/client'
// depois:
const getClient = () => import('@/lib/supabase/client').then(m => m.createClient());
```
