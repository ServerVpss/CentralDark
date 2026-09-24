# Receipt — EXPANSAO DE DOMINIO trigger

## Data

2026-09-24

## Objetivo

Cristalizar o padrao operacional pedido pelo CHEFE: quando a frase `EXPANSAO DE DOMINIO` aparecer, o sistema deve continuar expandindo o Megazord CentralDark por setores, com determinismo, micro-commits, CI/receipt e prova antes de PASS.

## PASS comprovado

- `MODULES/HUB` ja existe como central humana/editavel.
- `apps/modulos/hub` ja existe como runtime visual; nao foi criado runtime paralelo.
- Gatilho `MODULES/HUB/triggers/domain-expansion.trigger.json` criado.
- Playbook `MODULES/HUB/playbooks/EXPANSAO-DE-DOMINIO.md` criado.
- `controls/notifications-and-sensors.json` passou a declarar `triggers.domain_expansion`.
- `status-centraldark.routes.json` passou a declarar rota `status.hub.domain_expansion`.
- `hub-connections.registry.json` passou a declarar `hub-domain-expansion-trigger`.
- `MegazordHubCard.tsx` passou a exibir o gatilho visualmente no dashboard.

## UNKNOWN / nao promovido

- CI/checks do HEAD final ainda precisam ser medidos; `CI_PENDING_IS_NOT_PASS`.
- Deploy vivo em `status.centraldark` nao foi executado nesta rodada.
- Leitura dinamica dos JSON pelo frontend ainda nao esta implementada.
- Write-back de toggles ainda esta `planned`, nao ativo.

## Invariantes preservadas

```text
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
REALITY_IS_JUDGE=true
UNKNOWN != PASS
NOTIFICATION != PASS
COMMIT != DEPLOY
CI_PENDING_IS_NOT_PASS
SECRETS_IN_GIT=false
```

## NEXT_CURSOR

```text
MICRO_DEPLOY_03:
1. medir CI/checks do HEAD final;
2. criar loader seguro para MODULES/HUB/*.json;
3. alimentar MegazordHubCard dinamicamente;
4. validar build do hub;
5. deploy/restart controlado quando runtime estiver limpo;
6. provar status.centraldark com payload/visual;
7. registrar receipt.
```
