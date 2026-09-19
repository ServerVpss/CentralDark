# Receipt — um coração + watchdog global + watchers focados

Data: 2026-09-19  
Owner humano: SEGREDO/CHEFE  
Repo: `ServerVpss/CentralDark`  
START_HEAD: `02136f7df8d0a6f6088a3d316aabdc966e9db6eb`

## Intenção

Cristalizar o padrão operacional aprovado pelo CHEFE após observar o Grok CLI na VPS: manter cobertura contínua com baixo custo, aumentar autonomia determinística e evitar loops/watchdogs concorrentes.

## Evidência medida

- O Grok CLI mantinha um watcher focado de deploy e um scheduler de baixa frequência (~10 min).
- O watcher de deploy observado podia seguir outro run ativo depois que o alvo original terminava; isso cria risco de espera indefinida.
- O código canônico já declara em `apps/modulos/mcp/src/index.js`: `heart: "one"` no `GET /heartbeat`.
- O diagrama canônico já define `CORACAO = GET /heartbeat`, watchdog detectando e orchestrator executando.
- Existem watchdogs/timers locais de serviço; portanto “um watchdog” deve significar **uma autoridade global de detecção**, não remoção cega de probes locais.
- Logs/receipts já possuem owners concretos: GitHub Actions, `/root/CentralDark/logs/mcp-audit-*.jsonl`, `mcp-admin-audit-*.jsonl`, `mcp-crash.log` e receipts do runtime.

## Delta cristalizado

```text
1 CORAÇÃO GLOBAL
+ 1 WATCHDOG GLOBAL DE DETECÇÃO
+ N PROBES LOCAIS SUBORDINADOS
+ WATCHERS FOCADOS EFÊMEROS
+ 1 ORCHESTRATOR AUTORIZADO POR ESCOPO
```

Watcher focado:

```text
KEY = scope|target|sha|run_id
EXACT_TARGET = true
DEDUP = one active watcher per key
DEADLINE = required
TERMINAL => stop
SUPERSEDED => stop/reconcile
NO_NEW_INFORMATION => sleep/no notify/no mutation
```

O heartbeat permanece leve: estado resumido + chave/correlation para rastrear o detalhe no log owner. Não transformar `/heartbeat` em event log total.

## Arquivos alterados

- `.agents/skills/centraldark-esteira-motor/SKILL.md`
- `docs/BRAIN/03-DOCUMENTACAO/03-GUIAS/DIAGRAMAS-CENTRALDARK.md`
- este receipt

## Classificação

```text
DOCUMENTED = TRUE
RUNTIME_MUTATION = FALSE
DEPLOY = DEPLOY_NOT_APPLICABLE
EVENT_LOG_TOTAL = NOT_PROVEN
ONE_GLOBAL_HEART = PROVEN_IN_CODE
ONE_GLOBAL_WATCHDOG_PROCESS = NOT_CLAIMED
ONE_GLOBAL_WATCHDOG_AUTHORITY = CRYSTALLIZED_POLICY
```

Rollback: reverter este commit documental/skill. Nenhum processo, serviço, token ou secret foi alterado.
