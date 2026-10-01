---
title: "VPS Main Pulse — prova viva"
status: "LIVE_PROBE"
date: 2026-09-28
---

# VPS Main Pulse — prova viva

Este arquivo é um probe benigno do trilho:

MAIN_PUSH
→ GitHub webhook de push
→ CentralDark-WebhookDeploy
→ /usr/local/sbin/centraldark-main-pulse
→ owner hermes
→ main-pinned-microdeploy.sh
→ restart/validação do CentralDark-Hermes
→ receipt local

Regras:
- UNKNOWN != PASS
- MERGED != DEPLOYED
- webhook é fast path
- systemd timer de 60s é catch-up
- arquivos fora dos owners conhecidos são enviados ao Hermes somente para classificação read-only.

## Reconciliacao 2026-10-01 — menor delta

HEAD medido antes do registro: `91097d58b1ab3418345fd923474a7a7c32b1ae36`.

O pedido atual de "push na main -> VPS pulsa -> microdeploya -> Hermes puxa/classifica -> fallback por agenda/webhook" **nao exige arquitetura nova** no repositorio.

Owner existente medido:

- `scripts/vps/main-pulse-reconciler.sh`:
  - faz `git fetch origin main`;
  - mede `origin/main` sem mover o checkout vivo;
  - classifica por owner conhecido;
  - chama `scripts/vps/main-pinned-microdeploy.sh` para `hermes`, `mcp`, `hub_bot` e `oauth_broker`;
  - para delta sem owner conhecido, cria missao de classificacao read-only em `apps/modulos/HERMES-CORE/missions/em-andamento/`.

- `apps/modulos/HERMES-CORE/core/orchestrator.mjs`:
  - loop principal de 5s;
  - suporta retomada de missao orfa;
  - aceita arquivo `.json` solto em `missions/em-andamento/` e o transforma em execucao continuavel somente depois de validar o contrato de continuidade.

- `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`:
  - declara `ORPHAN_MISSION` com owner `apps/modulos/HERMES-CORE/core/orchestrator.mjs`;
  - intervalo observado declarado: 45s.

### Decisao de menor delta

```text
NAO_CRIAR_NOVO_CRON=true
NAO_CRIAR_SEGUNDO_WEBHOOK=true
NAO_CRIAR_SEGUNDO_PULLER=true
REUSE_MAIN_PULSE=true
REUSE_MAIN_PINNED_MICRODEPLOY=true
REUSE_HERMES_ORPHAN_CONSUMER=true
```

O gap atual **nao e desenho**. O gap e provar no runtime que:

1. o pulso recebe a main nova;
2. owner conhecido vira microdeploy com receipt;
3. delta sem owner entra na fila Hermes;
4. Hermes realmente consome/finaliza ou deixa BLOCKED explicito;
5. backlog/idade da fila nao produz falso verde.

Portanto:

```text
MAIN_PUSH -> PULSE/FETCH -> OWNER_CLASSIFY
  -> KNOWN_OWNER -> MAIN_PINNED_MICRODEPLOY -> RECEIPT
  -> UNKNOWN_OWNER -> HERMES_ORPHAN_MISSION -> CRITIC/FINALIZATION
WEBHOOK = FAST_PATH
TIMER/SCHEDULE = CATCH_UP, NAO SEGUNDO DONO
```

Regras preservadas:

- `ENFILEIRAR != DEPLOYAR`
- `MISSAO_CRIADA != MISSAO_CONSUMIDA`
- `ACTION != PROOF`
- `UNKNOWN != PASS`
- `MERGED != DEPLOYED`
- `REUSE_BEFORE_CREATE`
- `ONE_SYSTEM_ONLY`

Estado deste registro:

```text
REPO_ARCHITECTURE_RECONCILED=PROVED
RUNTIME_PULSE_CURRENT=UNKNOWN_THIS_TURN
RUNTIME_HERMES_QUEUE_DRAIN=UNKNOWN_THIS_TURN
NEW_ARCHITECTURE_REQUIRED=false
NEXT_CURSOR=remeasure live pulse + Hermes queue consumer + receipt
```

