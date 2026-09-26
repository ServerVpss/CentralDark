# 🧾 Mesa de Relatórios — Operação Overclock (overclock.sh)

Cronologia da investigação, do sensor bruto ao A/B empírico.

| Ordem | Artefato | O que traz | Nota |
|---|---|---|---|
| 1 | `REPORT.md` | Diagnóstico inicial (headers, TTFB, imagem 2.38 MB, long tasks) | 7.5 |
| 2 | `STAFF-REPORT.md` | v1 — CPU profile com atribuição parcial (chunk `0w~b7kexmgdhn`) | 8.0 |
| 3 | `STAFF-REPORT-V2.md` | v2 — 4 lacunas fechadas em plano, hipótese framer-motion + Stripe | 8.9 |
| 4 | `STAFF-REPORT-V3.md` | v3 — bytes reais, hipótese v2 **refutada**, vilão = Supabase Realtime (209 KB) | 9.3 |
| 5 | `STAFF-REPORT-V3.1.md` | v3.1 — A/B empírico: **FCP −45%**, TTFB −70%, JS −29% | 9.6 |

## Dados brutos disponíveis
- `diagnostic.json` — sensor CDP inicial
- `trace.json` — trace Chrome completo (13 MB)
- `profile_v2_full.json` — CPU profile v2
- `chunks_analysis_v2.json` + `summary_v2.json` — mapa chunk→lib
- (dados A/B em `/tmp/v8prof4/ab_result.json` no sandbox)

## TL;DR final
🔴 **Vilão real:** chunk `17-r5~e9uf6xa.js` (209 KB, 99% Supabase Realtime) carregado no HTML público sem necessidade.
🟢 **Ganho medido ao remover:** FCP 1012→560 ms, JS 313→224 KB, Load 3209→2670 ms.
🛠️ **Fix cirúrgico:** `dynamic(() => import('@/lib/supabase/client'), { ssr:false })` — 2 linhas.
