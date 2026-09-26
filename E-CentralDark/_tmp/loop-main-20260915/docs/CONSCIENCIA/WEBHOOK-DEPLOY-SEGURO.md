---
title: "WEBHOOK DEPLOY SEGURO"
date: 2026-06-29
updated: 2026-09-11
status: "LEGACY_DEPLOY_RETIRED_STATE_INGEST_ACTIVE"
canonical: true
tags: ["consciencia", "webhook", "deploy", "fixed-point"]
---

# Webhook Deploy Seguro

Este owner separa dois usos que antes estavam misturados sob a palavra `webhook`.

## Estado canônico atual

```text
GITHUB_STATE_INGEST=ACTIVE
LEGACY_WEBHOOK_DEPLOY=RETIRED
CANONICAL_DEPLOY=GITHUB_ACTIONS_SELF_HOSTED
LEGACY_PORT_9300_MUST_NOT_REMAIN_LISTENING=true
UNKNOWN != PASS
```

### 1. Webhook de estado — ativo

O Fixed Point Fabric continua aceitando eventos GitHub para estado/auditoria por meio de:

- `apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/github_state.py`
- `apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/webhook.py`
- `apps/modulos/fixed-point-fabric/tests/test_state_library.py`

Contrato material já existente:

```text
X-GitHub-Delivery=REQUIRED
X-GitHub-Event=REQUIRED
X-Hub-Signature-256=REQUIRED
HMAC_SHA256=REQUIRED
INVALID_SIGNATURE=REJECT
INVALID_JSON=REJECT
DELIVERY_DEDUPE=REQUIRED
EVENT_HISTORY=QUERYABLE
```

O segredo não fica no repo e não deve ser exposto em chat, issue, commit, PR ou log.

### 2. Webhook de deploy — legado aposentado

O caminho antigo de deploy via `deploy.centralldark.com/github -> 127.0.0.1:9300 -> CentralDark-WebhookDeploy` não é mais a autoridade de deploy.

O arquivo `scripts/webhook/github-webhook-deploy.mjs` existe somente como serviço legado inerte:

- `POST /webhook` responde `410` e declara `status: retired`;
- `GET /health` pode responder `200` apenas para identificar o legado como `RETIRED`;
- o serviço declara `canonicalDeploy: github-actions` e `mutatesRepository: false`.

Portanto:

```text
HTTP_200_ON_LEGACY_HEALTH != DEPLOY_ACTIVE
LEGACY_WEBHOOK_ALIVE != CANONICAL_DEPLOY
DO_NOT_REGISTER_NEW_DEPLOY_WEBHOOK_TO_PORT_9300=true
DO_NOT_RESURRECT_RETIRED_DEPLOY_PATH=true
```

## Deploy canônico atual

Owner operacional:

- `.github/workflows/vps-exec-selfhosted.yml`

Fluxo:

```text
main
-> GitHub Actions
-> runner self-hosted Linux
-> checkout/validação do SHA alvo
-> build/teste isolado
-> promoção atômica do dist
-> restart controlado do CentralDark-MCP
-> health/audit/stability gates
-> receipt/status
```

Antes de qualquer mutação de deploy, o workflow canônico trata explicitamente o serviço legado `CentralDark-WebhookDeploy`: valida ownership conhecido, para o processo legado quando presente e exige que a porta `9300` deixe de escutar. Isso impede dois mecanismos de deploy concorrentes.

```text
ONE_DEPLOY_AUTHORITY=true
LEGACY_WEBHOOK_STOP_BEFORE_CANONICAL_DEPLOY=true
PORT_9300_CLOSED_BEFORE_MUTATION=true
PAYLOAD_NEVER_BECOMES_COMMAND=true
```

## Arquivos relacionados

Ativos/canônicos:

- `.github/workflows/vps-exec-selfhosted.yml`
- `apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/github_state.py`
- `apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/webhook.py`
- `apps/modulos/fixed-point-fabric/tests/test_state_library.py`

Legado preservado para identificação/retirada segura:

- `scripts/webhook/github-webhook-deploy.mjs`
- `scripts/webhook/deploy-job.sh`
- `scripts/run-once/instalar-webhook-deploy-seguro.sh`
- `scripts/run-once/testar-webhook-deploy-local.sh`

Referências antigas que descrevem o webhook de deploy como ativo são história/proveniência e não substituem o estado material atual.

## Regra de prova

```text
DOCUMENTED != EXECUTED
SERVICE_EXISTS != ACTIVE_AUTHORITY
MERGED != DEPLOYED
WORKFLOW_EXISTS != WORKFLOW_SUCCEEDED
DEPLOY_PROVEN_REQUIRES_EXACT_SHA_RUNTIME_EVIDENCE=true
```

Para afirmar deploy real, medir o workflow do SHA exato e a evidência de runtime produzida pelos gates. Sem essa evidência, o estado permanece `UNKNOWN` ou `BLOCKED` conforme o caso.

## Conexões rápidas

- `AGENTS.md` — roteamento operacional
- `.github/workflows/vps-exec-selfhosted.yml` — autoridade atual de deploy VPS/MCP
- `apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/github_state.py` — ingestão autenticada de eventos GitHub
- `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md` — padrão de prova e comunicação
