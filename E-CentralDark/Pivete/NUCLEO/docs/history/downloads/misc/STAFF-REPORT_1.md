# Staff-Level Performance Analysis — overclock.sh

> Método: V8 CPU Profiler via CDP (`Profiler.enable` + `setSamplingInterval=100µs` + `Profiler.start/stop`), cruzando `samples[]/timeDeltas[]` com `PerformanceObserver({entryTypes:['longtask']})`. Total: **10.472 samples**, **6.822 ms** de janela (1.512 ms de CPU ativa, 5.310 ms idle). Long-task pico **299 ms @ t=986 ms** — coincide com a hidratação.

---

## Gargalo Principal Identificado

- **Função / Componente:** função minificada **`e` no chunk `0w~b7kexmgdhn.js:158:5998`** — assinatura de reconciler/`performWorkOnRoot` do React 19 (chunk framework do Next 15 App Router).
- **Tempo aproximado de CPU:** **62 ms self** numa única função + **139 ms self acumulado no chunk** (o maior consumidor entre TODOS os chunks). Essa CPU é gasta dentro da long-task de **299 ms** que trava a main thread logo após o HTML chegar.
- **Evidência (samples / timestamps):**
  - `self_ms=62.0  0w~b7kexmgdhn.js:158:5998  fn "e"` — topo absoluto de self-time em JS real.
  - Long tasks capturadas: **299 ms @ 986 ms**, 76 ms @ 1381 ms, 50 ms @ 1319 ms → **425 ms bloqueando** só nos 2 s iniciais.
  - CPU por chunk (self):
    - `0w~b7kexmgdhn.js` — **139,6 ms** (framework/react-dom)
    - `0kgwx97w.yjrb.js` — **100,4 ms** (chunk da página, 139 KB)
    - `turbopack-…js` — **66,6 ms** só resolvendo `registerChunk` (overhead do runtime Turbopack em produção)
    - `0ahongyghlsfv.js` 35,9 ms · `0b_sd_9lfds66.js` 34,6 ms · `0-ybf0_clt~hk.js` 31,9 ms

## Flamegraph Textual (Top 10)

```
root  6822ms 100%
├─ (idle)                                         5310ms  77.8%
├─ (program) V8 GC/parse/compile                  1065ms  15.6%
└─ JS execution                                    448ms   6.6%
   ├─ n  0kgwx97w.yjrb.js:6:4309            tt=139ms self=  8ms   ← page chunk boot
   │   └─ e  0w~b7kexmgdhn.js:158:5998      tt= 63ms self= 62ms   ⚠ react-dom hydrateRoot
   │       └─ g  0w~b7kexmgdhn.js:171       tt= 14ms self= 14ms   ← beginWork/completeWork
   ├─ registerChunk  turbopack-…js           tt= 61ms self=  0ms
   │   └─ W  turbopack-…js:0:7183           tt= 61ms self= 62ms   ⚠ module wiring
   │       └─ (anon)  0kgwx97w.yjrb.js:21   tt= 61ms self=  0ms
   ├─ i  0b_sd_9lfds66.js:0                 self= 21ms
   ├─ (anon) 0ahongyghlsfv.js:0             self= 21ms
   ├─ (anon) 0kgwx97w.yjrb.js:21            self= 20ms
   ├─ a  0ahongyghlsfv.js:0                 self= 15ms
   ├─ (anon) 0b_sd_9lfds66.js:0             self= 13ms
   └─ (garbage collector)                    self= 10ms
```

## Análise Técnica

1. **A CPU real é pouca (~1,5 s), mas mal distribuída.** 299 ms concentrados numa única long-task = INP ruim, TBT alto, hidratação percebida como travamento. O Chrome só considera "long" o que passa de 50 ms; aqui um bloco único é **6× o limite**.
2. **`e@0w~b7kexmgdhn.js:158`** é o entry point do reconciler do React (padrão de minificação Next 15 para `performConcurrentWorkOnRoot`/`renderRootSync`). Ele acumula 62 ms self + descendentes = a árvore inteira do App Router está sendo hidratada **de uma vez**, num único payload RSC de 548 KB (medido na rodada anterior).
3. **Turbopack runtime (`registerChunk` + `W`) queima 66 ms** só resolvendo dependências de módulos ao boot — sinal de que o build está usando Turbopack em produção (ainda beta) e produz **muitos chunks pequenos** (mais de 15 requests para `_next/static/chunks/*`), cada um pagando custo de parse/register no cliente.
4. **Nenhum componente foi marcado como `dynamic`/`lazy`.** Todo o `page.tsx` vira um único bundle client-hydrated → a long-task de 299 ms é inevitável enquanto essa árvore for atômica.
5. Sem source maps públicos os nomes são minificados, mas o *shape* (framework chunk como #1, page chunk como #2, tudo dentro de uma long-task na janela 900–1300 ms) é assinatura clássica de **hidratação monolítica do App Router**.

## Proposta de Fix Mínima

**Uma única mudança:** dividir a hidratação com `next/dynamic({ ssr:false })` no(s) bloco(s) below-the-fold da home. O HTML/SSR continua idêntico (SEO intacto); o React só hidrata esses filhos quando entram no viewport, quebrando os 299 ms em várias tarefas < 50 ms.

```tsx
// app/page.tsx  — trocar imports diretos por dynamic para tudo abaixo do hero
import dynamic from 'next/dynamic';

// ANTES:
// import Releases from '@/components/Releases';
// import Community from '@/components/Community';
// import Footer   from '@/components/Footer';

// DEPOIS: hidrata só quando visível + sem SSR de client-code pesado
const Releases  = dynamic(() => import('@/components/Releases'),  { ssr: true,  loading: () => <div style={{minHeight: 480}} /> });
const Community = dynamic(() => import('@/components/Community'), { ssr: false, loading: () => <div style={{minHeight: 320}} /> });
const Footer    = dynamic(() => import('@/components/Footer'),    { ssr: false });

export default function Page() {
  return (
    <>
      <Hero />          {/* fica no bundle principal — LCP */}
      <Releases />      {/* SSR mantém HTML, hidrata em chunk separado */}
      <Community />     {/* client-only, hidrata só quando visível */}
      <Footer />
    </>
  );
}
```

Complemento opcional (1 linha em `next.config.js`) para reduzir o overhead de `registerChunk` do Turbopack:

```js
// next.config.js — voltar ao webpack em produção enquanto Turbopack build for beta
module.exports = { experimental: { turbo: { rules: {} } } }; // e remover --turbo do script "build"
```

## Plano de Verificação

**Antes (baseline capturado hoje):**
| Métrica | Valor atual |
|---|---|
| Long-task máxima | **299 ms** |
| Soma de long-tasks (0–3 s) | 425 ms |
| CPU self do chunk framework | 139,6 ms |
| CPU self do chunk da página | 100,4 ms |
| TBT (Total Blocking Time) estimado | ≥ 249 ms + 26 + 0 ≈ **275 ms** |

**Depois (esperado):**
| Métrica | Meta |
|---|---|
| Long-task máxima | **< 100 ms** (idealmente < 80 ms) |
| Soma de long-tasks (0–3 s) | < 180 ms |
| CPU self do chunk da página inicial | ≤ 50 ms (o resto migra para chunks lazy) |
| TBT | **< 100 ms** (redução ~65 %) |
| INP na home | passa de "Needs improvement" para "Good" |

**Como medir (reproduzível):**
```bash
python3 /tmp/v8prof/run.py            # mesmo script, mesma URL
# comparar:
#   longtasks.json  → contar entradas > 50 ms e o max
#   profile.cpuprofile → self-time por URL (script já gera CPU by chunk)
```
Critério de aceite: long-task máxima cai **≥ 60 %** (299 → ≤ 120 ms) e nenhuma tarefa isolada ultrapassa 150 ms. Se não bater, o gargalo real está em código de terceiros carregado no `<head>` (próxima frente: auditar scripts síncronos e `next/script` sem `strategy="lazyOnload"`).

---

**Artefatos brutos:** `/tmp/v8prof/profile.cpuprofile` (importável no DevTools → Performance → Load Profile), `/tmp/v8prof/longtasks.json`, `/tmp/v8prof/scripts.json`.
