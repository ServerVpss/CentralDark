# 2026-10-04 — Hermes upstream × CentralDark — inventário lote 01

## Baselines

- CentralDark CURRENT/main medido: `cc614d2353bd7b7f062368fad3871dec35e8aa19`
- Hermes local: `v0.21.5+6778.g81e1ce7`, upstream commit `81e1ce78`
- Hermes local informa 8 commits atrás do upstream disponível.
- Hermes gateway: ativo; ticker heartbeat recente.
- Hermes cron local: nenhum job registrado.
- Hermes webhook dinâmico local: nenhuma subscription registrada.
- VPS Hermes binary: disponível em `/root/.hermes/hermes-agent/hermes`; cron sem jobs e webhook sem subscriptions.
- VPS gateway webhook health: HTTP 200 em `127.0.0.1:8644/health`; resposta identifica a plataforma webhook.

## Matriz — lote 01

| Capability | Hermes upstream | CentralDark atual | Overlap | Classificação | Prova atual |
|---|---|---|---|---|---|
| Cron residente | `hermes cron` cria/pausa/retoma/executa jobs, inclusive multi-skill e no-agent | `HERMES-CORE` tem loop 5s, heartbeat 5min, GraphRAG 30min e GC 6h; nenhum cron Hermes configurado | Alto para scheduler/heartbeat | `REUSE_NATIVE` para novos jobs; `CENTRALDARK_EXTENSION` para semântica/prova | CLI local/VPS: nenhum job; código do orchestrator medido |
| Webhook de evento | Hermes webhook aceita HMAC, filtros, idempotência e pode disparar cron existente via `cron_job` | Fixed Point Fabric possui ingestão autenticada e dedupe de eventos GitHub; deploy webhook legado aposentado | Médio; estado e deploy são escopos diferentes | `CENTRALDARK_EXTENSION` para state/audit; `REUSE_NATIVE` para novos ingressos Hermes | `github_state.py`, `webhook.py`, Hermes CLI/docs |
| Hooks | Gateway/plugin/shell/outbound hooks | CentralDark possui owners de Trigger Fabric, receipts e guards | Médio | `REUSE_NATIVE` para lifecycle; CentralDark mantém gates/Reality Judge | Hermes upstream hooks; owners CURRENT |
| Sessão/memória | Hermes usa state DB, sessões persistentes, memória e `session_search` | CentralDark possui memória canônica, Aprendizados, Lembranças, receipts e promoção | Alto no armazenamento; sem equivalência semântica | `CENTRALDARK_EXTENSION`; não substituir memória canônica sem prova | config local + docs CURRENT |
| Delegação | Hermes possui `delegate_task`/subagentes/background | CentralDark possui papéis/lentes e semântica de committee sem voto | Médio | `REUSE_NATIVE` para execução; `CENTRALDARK_EXTENSION` para método e julgamento | toolset local + contratos CentralDark |
| Gateway/delivery | Hermes gateway entrega para plataformas e webhook | CentralDark HUD/receipts/PR-mãe são semântica de apresentação/auditoria | Médio | `REUSE_NATIVE` para transporte; `CENTRALDARK_EXTENSION` para HUD/receipts | gateway ativo e owners CURRENT |
| Retry/resume | Hermes cron/gateway/session recovery suportam retomada operacional | CentralDark HERMES-CORE tem retomada de órfãs e regras GREEN_STATE | Médio | `REUSE_NATIVE` para execução; `CENTRALDARK_EXTENSION` para prova/rollback | `orchestrator.mjs`, skills upstream |

## Avaliação do HERMES-CORE

- `apps/modulos/HERMES-CORE/core/orchestrator.mjs` acrescenta semântica CentralDark: owner/writer, Critic, Knowledge-Collector, GraphRAG, receipts, retomada de órfãs e contratos de prova.
- O loop de missões `missions/pendente → em-andamento → concluidas` é uma fila/domínio local existente, não foi provado como mera duplicação do cron upstream.
- O scheduler/cron periódico e webhook de transporte não devem ser duplicados. A migração só pode ocorrer depois de um consumer nativo equivalente, com prova de efeito e contraprova.
- Classificação atual: `GOLD_KEEP + CENTRALDARK_EXTENSION`, com possível `ABSORB_INTO_NATIVE` somente para entradas futuras e rotinas que ainda não tenham dependência da fila/dominio próprio.

## Decisão do lote

1. Não criar cron Hermes ainda: não há job canônico definido nem prompt/skills/owner final do job.
2. Não criar segundo webhook engine.
3. Não remover HERMES-CORE.
4. Reutilizar Hermes nativo como mecânica para o próximo job/evento, preservando CentralDark como método e Reality Judge.
5. Próximo lote deve mapear o contrato do job de reconciliação GitHub/VPS e provar um canário `no-agent` ou `cron_job` em sandbox, sem tocar deploy.

## Progresso persistente

- Lote 01 concluído: inventário e classificação da sobreposição engine/scheduler/webhook/hooks.
- Deltas úteis: Hermes nativo pode fornecer cron/webhook/event routing; CentralDark continua owner da semântica, prova, memória canônica e receipts.
- Sem mutação de runtime neste lote.

## Next cursor

`lote 02 → mapear job de reconciliação existente → escolher owner → desenhar canário nativo sem agente/cron_job → prova/contraprova → decidir REUSE_NATIVE ou CENTRALDARK_EXTENSION`
