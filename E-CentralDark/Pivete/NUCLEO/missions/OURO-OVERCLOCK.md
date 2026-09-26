# MISSAO - OURO-OVERCLOCK.md
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\01-ARQUIVOS-DA-CONVERSA\.extracted_DOSSIER-TRUSTED-ACCESS-CENTRALDARK-20260806\.extracted_PACOTAO-CENTRALDARK-RIGOR-MAXIMO\qa.teste-de-software.MARKDOWN\03-KIT-RELATORIOS-OVERCLOCK\OURO-OVERCLOCK.md
**SHA:** 496065735ed3c931
**Timestamp:** 2026-08-26T20:05:49.555876
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- **Método:** CDP + V8 Profiler + assinatura de bytes + A/B empírico com interceptação de rota

### Ouro Bruto (primeiros 5000 chars)
```
# 🏆 OURO — Missão Overclock.sh

**Data:** 10/07/2026
**Missão:** Auditoria de performance overclock.sh (v1 → v3.1)
**Método:** CDP + V8 Profiler + assinatura de bytes + A/B empírico com interceptação de rota

---

## O ouro

Remover o chunk do **Supabase Realtime** (`17-r5~e9uf6xa.js`, ~90KB gzip) da home pública corta:

| Métrica | Ganho medido |
|---|---|
| **FCP mobile** | **−452ms (−45%)** |
| **TTFB** | **−509ms (−70%)** |
| **Load event** | **−539ms (−17%)** |
| **JS transferido** | **−90KB (−29%)** |

Prova: 10 runs (5 baseline + 5 blocked), CPU throttle 4x, viewport mobile.
Arquivos: `perfdiag/raw/ab_result.json`, `ab_runs.csv`, `ab_test.py`.

---

## Fix mínimo (1 commit)

```ts
// Inicialização Supabase na home pública
const supabase = createClient(url, key, {
  realtime: { params: { eventsPerSecond: 0 } }, // não abre WebSocket
})
```

E lazy-load do módulo Realtime só nas rotas autenticadas:

```ts
const { RealtimeClient } = await import('@supabase/realtime-js')
```

---

## Achados secundários (bônus)

- 🟡 Lucide-react duplicado em 2 chunks (~77KB desperdiçados) → resolver com `optimizePackageImports: ['lucide-react']` no Next.
- 🟡 Sentry SDK no vendor crítico (~90KB) → mover pra `lazyLoadIntegrations`.
- 🟡 Hero image 2.38MB sem `priority` nem AVIF → converter e preload.
- 🟢 Headers de segurança nota A+ (Cloudflare bem configurado).

---

## Método reprodutível (pra reusar em qualquer site)

1. CDP `Profiler.start()` com sampling 100µs → captura CPU real.
2. `page.route('**/chunk.js', abort)` → A/B empírico sem tocar no código.
3. Assinatura de bytes (`rg` em bundles minificados) → descobre qual lib vive em qual chunk sem source-map.

Scripts em `perfdiag/raw/ab_test.py` e `/tmp/v8prof*/`.

---

**Fio da missão:** ouro cunhado. Próxima: aplicar o fix num PR em overclock.sh ou partir pra próxima presa.

```