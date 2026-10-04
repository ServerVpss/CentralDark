# 2026-10-04 — Hermes/CentralDark equalização — inventário lote 02

## Owner do ciclo de reconciliação

### ACTIVE_OWNER — PRs/Dependabot

```text
.github/workflows/dependabot-auto-merge.yml
scripts/dependabot/reconcile-open-prs.mjs
scripts/dependabot/reconcile-open-prs.sh
scripts/dependabot/resolve-conflicts.sh
```

O workflow já possui:

- `schedule` em `17,47 * * * *`;
- `repository_dispatch` `centraldark_dependabot_reconcile`;
- `workflow_dispatch`;
- eventos `pull_request_target` e `workflow_run`;
- proteção explícita do PR-mãe `#1562`;
- update-branch sem merge direto;
- resolver único de conflitos;
- prova no HEAD atual antes de promover.

Classificação: `CENTRALDARK_EXTENSION` sobre mecânica GitHub Actions existente. Não criar um segundo job Hermes para Dependabot.

### ACTIVE_OWNER — pulso main/VPS

```text
scripts/vps/main-pulse-reconciler.sh
scripts/vps/main-pinned-microdeploy.sh
```

O script mede `origin/main`, preserva worktree dirty, classifica deltas por owner (`hermes`, `mcp`, `hub_bot`, `oauth_broker`) e cria missão para arquivos sem owner conhecido. Porém, na VPS medida não há crontab de usuário configurado para esse script e não foi provado um timer Hermes que o invoque.

Classificação: `CENTRALDARK_EXTENSION`; consumer físico do pulso permanece `UNKNOWN` até uma rota de agendamento ser ligada e provada.

### ACTIVE_OWNER — Hermes upstream

```text
/root/.hermes/hermes-agent/hermes
/root/.hermes/cron/
/root/.hermes/config.yaml
```

Gateway ativo e webhook health HTTP 200 na VPS. Não há jobs Hermes registrados e não há subscriptions dinâmicas Hermes registradas.

Classificação: `REUSE_NATIVE` para futuros jobs/ingressos, sem criar um segundo scheduler.

### RETIRED / NÃO USAR

```text
scripts/webhook/github-webhook-deploy.mjs
CentralDark-WebhookDeploy
porta 9300
infra/caddy/deploy-centraldark.Caddyfile
```

## Matriz do lote 02

| Escopo | Owner atual | Consumer | Hermes nativo cobre? | Classificação | Estado |
|---|---|---|---|---|---|
| PR/Dependabot | `dependabot-auto-merge.yml` + scripts/dependabot | GitHub Actions | Não precisa de wrapper Hermes | `CENTRALDARK_EXTENSION` | runtime configurado por workflow |
| main → VPS | `main-pulse-reconciler.sh` + `main-pinned-microdeploy.sh` | timer/cron não provado | Pode ser acionado por Hermes cron | `REUSE_NATIVE` para trigger; manter owner do microdeploy | `UNKNOWN` no agendamento físico |
| GitHub state ingest | Fixed Point `github_state.py`/`webhook.py` | endpoint de estado | Hermes webhook pode transportar evento, mas não substitui dedupe/HMAC/state store | `CENTRALDARK_EXTENSION` | código/testes existentes |
| deploy | `vps-exec-selfhosted.yml` | self-hosted runners | Hermes não substitui Actions deploy authority | `GOLD_KEEP` | gate atual em remediação |
| missão sem owner | `main-pulse-reconciler.sh` cria missão HERMES-CORE | HERMES-CORE queue | Hermes cron pode acordar consumer | `CENTRALDARK_EXTENSION` | prova de consumer físico pendente |

## Decisão

- Não criar scheduler paralelo.
- Não criar segundo webhook.
- Não mover Dependabot para Hermes: o owner Actions já está ativo e possui schedule/event dispatch.
- Próximo delta candidato: ligar **um único Hermes cron nativo** ao `main-pulse-reconciler.sh` somente depois de confirmar a forma de execução, lock, receipt e `no-agent`/agent mode.
- O cron não deve executar deploy diretamente; deve medir, classificar e acordar owner existente.

## Próximo lote

`lote 03 → validar contrato de um cron Hermes nativo para main-pulse → dry-run sem mutação → provar receipt/lock → só então habilitar cadência residente`

## Veredito

`PARTIAL — owner definido; agendamento do main-pulse ainda UNKNOWN`
