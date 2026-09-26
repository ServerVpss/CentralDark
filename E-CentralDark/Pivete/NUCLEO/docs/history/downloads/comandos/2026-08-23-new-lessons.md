# Novas Lições Cristalizadas — 2026-08-23

## 27. AUTO-DESTILADOR DEATH LESSON — Terminal Background Process Dies Silently

**Descoberta 2026-08-23:** O Auto-Destilador rodava em `background=true` sem `notify_on_complete=true`. Quando o usuário fechou o terminal/sessão, o processo morreu silenciosamente — sem crash log, sem Application Error no Windows Event Viewer, apenas parou de processar arquivos.

**Evidência:** Último CARVE às 02:15:31, nenhum novo CARVE após isso, processos MCP/BFF continuaram rodando (infra sobreviveu, coordenação morreu).

**Causa Raiz:** Background terminal session morreu → processo órfão morreu junto.

**Correção Definitiva:** Mover para Daemon Robusto (Liçao 26) com signal handlers + health check + auto-restart + PID file + logging persistente + auto-save state.

**Regra:** `background=true` SEMPRE com `notify_on_complete=true` OU usar Daemon Robusto completo. Processo de longa duração NUNCA deve depender de sessão terminal.

---

## 28. AUTO-DESTILADOR HOOK KANBAN — Card Automático por Cristal

**Implementado 2026-08-23:** Cada cristal gerado pelo Auto-Destilador agora cria automaticamente um card no Kanban via `criar_card_kanban()` chamado dentro de `emitir_carve()`.

**Fluxo:** Arquivo → Detecta → Classifica → Destila → Cristaliza → Escreve → Arquiva → **Emite CARVE** → **Cria Card Kanban** (hook ativo).

**Validação:** Card `t_5d0fd5e3 - [COMANDO] TESTE_FINAL.txt` criado automaticamente no board `default` status `todo`.

**Código-chave:** `emitir_carve()` chama `criar_card_kanban()` que faz POST para `http://127.0.0.1:8787/api/kanban/tasks` com título `[TIPO] arquivo`, corpo com SHA/destino/origem/timestamp/ouro, priority 1, status todo.

---

## 29. HEALTH CHECK COM PROVA — Padrão Obrigatório

**Regra:** Todo endpoint `/health` DEVE retornar estrutura de prova:

```json
{
  "operation": "health_check",
  "timestamp": "2026-08-23T16:01:37.789249",
  "sha256": "e383503e409611aabd0844d6e3208f19e6cbfdbb2fd8f216898507c851d6345b",
  "details": { "service": "auto-destilador", "watcher_active": true, "pid": 37908 },
  "proved": true
}
```

**Campos obrigatórios:** `operation`, `timestamp` (ISO8601), `sha256` (do details), `details`, `proved: true`.

**Aplicado em:** Auto-Destilador (porta 8788), deve ser aplicado em MCP (9100), BFF (8787), Arsenal (8090), etc.

---

## 30. RUNTIME STATE AUTO-SAVE — A cada 60s com Prova

**Regra:** Estado do runtime salvo automaticamente a cada 60s no arquivo JSON com estrutura de prova:

```json
{
  "running": true,
  "uptime_seconds": 133.03776049613953,
  "processed_count": 1,
  "error_count": 0,
  "pending_files": [],
  "watcher_active": true,
  "pid": 25300,
  "last_save": "2026-08-23T16:03:42.400015",
  "timestamp": "2026-08-23T16:03:42.400015",
  "sha256": "bc596850d1ee86678d19290c03635a84f20b3bc402ad4a3f02ccdf50dc2b8b45"
}
```

**Campos obrigatórios:** `timestamp` (ISO8601), `sha256` (do estado completo), `proved` implícito via estrutura.

**Implementado em:** Auto-Destilador (`auto-destilador-state.json`), deve ser padrão para todos daemons.

---

## 31. CONCEITO ≠ PROCESSO — Descoberta Crítica 2026-08-23

**Regra Nova:** "SOL" no papel ≠ "SOL" no runtime. Nome não prova existência.

**Nova Lente Operacional:** FÍSICO → TEMPORAL → CAUSAL → PROVA

1. **FÍSICO**: Onde existe fisicamente? (processo, arquivo, porta)
2. **TEMPORAL**: Quando mudou? (timestamp, delta, antes/depois)
3. **CAUSAL**: Qual dependência caiu? (humano dormiu = transporte parou)
4. **PROVA**: Evidência imutável (rastro.jsonl, timestamps, logs)

**Cadeado:** COINCIDÊNCIA TEMPORAL → HIPÓTESE → MECANISMO → EVIDÊNCIA → CAUSA

> Correlação temporal sugere, não prova. Mecanismo prova.

**Descoberta:** TU ERA A SOL — Transporte humano de contexto mascarado como autonomia. Quando CHEFE dormiu, transporte parou → Auto-Destilador parou. Infra viveu, coordenação morreu.

**Regra Cristalizada:** CONCEITO ≠ PROCESSO (entrada no SOUL ao lado de UNKNOWN ≠ PASS e ACTION ≠ PROOF).

**Nova Lente Operacional:** FÍSICO → TEMPORAL → CAUSAL → PROVA (lente padrão para investigação/observabilidade da Casa).

---

## 32. SOUL.md REGRAS OBRIGATÓRIAS 2026-08-23 — Adicionadas ao Cartão de Boot

**Novas regras no SOUL.md Cartão de Boot:**

```text
TUDO_COM_DATA_HORA_HASH_PROVA=SIM
DATA_HORA_PADRAO_ISO8601=OBRIGATORIO
SHA256_HASH_PADRAO=OBRIGATORIO
PROVA_OBRIGATORIA_PARA_TUDO=SIM
RUNTIME_GRAVA_AUTOMATICO=SIM
```

**Significado:** TUDO que o sistema faz DEVE ter timestamp ISO8601, SHA256 hash, registro de prova, e ser gravado no runtime automaticamente. Sem exceções.

**Aplicado em:** Auto-Destilador (health check, CARVE, runtime state, logs), deve ser padrão universal.