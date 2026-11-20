# 2026-10-04 — Hermes/CentralDark equalização — inventário lote 03

## Prova da capacidade nativa

Hermes local `v0.21.5+6778.g81e1ce7` expõe:

- `hermes cron create` com `--skill` repetível;
- `--no-agent` para script sem LLM;
- `--monitor-script` e `--monitor-url` com supressão por hash;
- `--continuity` para continuidade do próprio job;
- `--paused` + `--paused-reason` para criação segura sem ativar;
- `hermes webhook subscribe` com HMAC, eventos, script de filtro e `--cron-job`;
- `--mirror-to-session`, `--deliver-only` e delivery configurável.

Gateway local: ativo, ticker recente.

Jobs e subscriptions atuais:

```text
CRON_JOBS=0
WEBHOOK_SUBSCRIPTIONS=0
```

Na VPS, o binário Hermes também foi medido:

```text
CRON_JOBS=0
WEBHOOK_SUBSCRIPTIONS=0
WEBHOOK_GATEWAY_HEALTH=HTTP_200
```

## Contrato candidato — não ativado neste lote

```text
JOB_NAME=centraldark-main-pulse-reconcile
SCHEDULE=10m
MODE=--no-agent inicialmente, se o script produzir receipt suficiente
SCRIPT=/root/.hermes/scripts/centraldark-main-pulse-reconcile.sh
WORKDIR=/root/CentralDark
LOCK=/tmp/centraldark-main-pulse.lock
OWNER=scripts/vps/main-pulse-reconciler.sh
```

O script atual `/root/CentralDark/scripts/vps/main-pulse-reconciler.sh` já possui lock, watermark, fetch de `origin/main`, classificação por owner e criação de missão para delta sem owner. Antes de envolver LLM, ele deve ser usado como sensor/consumer determinístico; Hermes nativo pode fornecer a cadência sem duplicar o scheduler.

## Classificação

- Cron nativo Hermes: `REUSE_NATIVE`.
- `main-pulse-reconciler.sh`: `GOLD_KEEP + CENTRALDARK_EXTENSION`.
- HERMES-CORE queue/orphan recovery: `GOLD_KEEP` até prova de consumer equivalente.
- Job ativo: `NOT_CREATED`.
- Webhook ativo para o job: `NOT_CREATED`.
- Deploy: fora do escopo do canário; nenhum deploy será iniciado pelo job.

## Gate antes de ativar

1. Criar wrapper somente se necessário para colocar o script no diretório permitido `~/.hermes/scripts/`, sem duplicar lógica.
2. Rodar o script em `--dry-run`/sensor mode e provar stdout estável, lock e receipt.
3. Criar o job com `--paused --paused-reason=...` em uma escrita.
4. Executar explicitamente uma vez em ambiente controlado.
5. Medir efeito, contraprova e ausência de mutação indevida.
6. Só então decidir `resume` e cadência residente.

## Veredito

`CAPABILITY_PROVEN_NOT_ACTIVATED`

A capacidade nativa Hermes cobre a cadência e o disparo de cron. O owner CentralDark cobre a semântica e a reconciliação. Ainda não há prova suficiente para ativar o job porque o consumidor permitido e o formato de receipt do script precisam ser validados no diretório de scripts Hermes.

## Next cursor

`lote 04 → validar wrapper/sensor sem mutação → provar stdout/lock/receipt → criar job pausado → executar canário → decidir ativação`
