# Response Latency Patterns — Análise Real

**Origem:** Sessão 06/08/2026 — Pivete perguntou "por que demora tanto".

**Padrão real medido:**

| Tipo de resposta | Latência típica | Causa dominante |
|------------------|-----------------|-----------------|
| Texto puro (sem tools) | < 2s | Model inference only |
| 1 terminal simples (ls, cat, grep) | 5-15s | Tool overhead + output |
| npm run dev + health check | 60-180s | Compilação + polling |
| Múltiplas tentativas (4x OmniRoute) | 10-20min total | Compilação falha + retry loop |
| Model switch (hy3 → MiniMax → nemotron) | +latência extra | Recontextualização |

**Vilões confirmados:**
1. **Terminal execution** (maior) — cada `npm run dev` = 30-120s
2. **Background process polling** — sleep → curl → poll log → repeat (3-5 ciclos = 30-60s/ciclo)
3. **Model switching** — tencent/hy3 → MiniMax → nemotron-3-ultra = recontextualização
4. **Large outputs** — logs 1000+ linhas, arquivos 50KB+
5. **Sequential tool calls** — terminal → wait → curl → process → log → terminal (não paralelizo)

**O que melhorar (próxima tarefa pesada):**
1. Paralelizar `curl` + `process poll` em vez de sequencial
2. Não esperar compilação completa — health check com timeout único
3. Menos polling, mais `notify_on_complete=true` 
4. Evitar model switch no meio da tarefa
5. Batchar `terminal` calls independentes

**Regra prática:**
- Se só precisa health check → `curl -m 10` único, não compilação completa
- Se múltiplos `terminal` independentes → batch no mesmo turno
- Se compilação longa → iniciar background + `notify_on_complete` + fazer outra coisa