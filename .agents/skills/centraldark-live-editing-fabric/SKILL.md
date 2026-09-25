---
name: centraldark-live-editing-fabric
description: Modo padrão da CentralDark para edição viva determinística. Use quando o CHEFE quiser editar/refinar e ver no runtime rápido, sem transformar CI profundo em freio de MVP.
metadata:
  type: operational
  version: "1.1"
  owner: SEGREDO/CHEFE
---

# CENTRALDARK LIVE EDITING FABRIC

## Quando usar

Use por padrão quando a intenção for construir, ajustar, refinar, publicar no site/runtime, ver vivo e repetir.

Não trate como emergência. `main-pinned-runtime-fast-path` é o mecanismo de execução runtime do modo vivo quando houver delta rastreável para promover; deploy canônico profundo fica como guarda/esteira maior ou prensa quando o CHEFE mandar.

## Fluxo

```text
CHEFE_EDITA
→ INTENT_DELTA
→ LOCK
→ ASSERT_SCRATCH
→ FETCH MAIN
→ RESET/CLEAN SCRATCH
→ DELTA
→ TESTE_MINIMO
→ MICRODEPLOY_OWNER
→ PROVA_RUNTIME
→ RECEIPT
→ CLEAN_SCRATCH
→ NEXT_TIK_TAK
```

## Prensa profunda

```text
MVP_FAST_LOOP = default
CI_DEEP_LOOP = somente quando CHEFE mandar torcer a uva / ponto fixo profundo
DEPLOY_CANONICO = guarda, não freio padrão do MVP
```

## Seleção de gatilhos

```text
NEW_CHEFE_MATERIAL=DELTA_TO_ACTIVE_INTENT_FIRST
PERTINENCE_FIRST=true
MINIMUM_SUFFICIENT_LOOP=true
TRIGGERS_ARE_CONDITIONAL_NOT_RITUAL=true

runtime/site/painel/feature → LIVE_EDITING_FABRIC + MAIN_PINNED_FAST_PATH
hub/provider/secret/oauth → HUB_CREDENTIAL_CONTROL_PLANE
doc/canon → EDIT_OWNER_EXISTING + RECEIPT
pass material → MICRO_DEPLOY_DO_ESCOPO_AFETADO + HEALTH/PROVA + RECEIPT
```

## Segredos temporários

Trate segredo temporário como trânsito:

```text
USE
→ APPLY_TO_OWNER
→ DO_NOT_ECHO
→ DO_NOT_COMMIT
→ DO_NOT_WRITE_VALUE_TO_RECEIPT
→ SCRUB_CONTROLLED_LOGS
→ DISCARD_OR_ROTATE
```

Se precisar registrar, registre apenas nome lógico, owner, destino e resultado. Nunca o valor.

## Cadeados

```text
UNKNOWN != PASS
ACTION != PROOF
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
NO_SECRET_ECHO
NO_SECRET_COMMIT
NO_SECRET_RECEIPT_VALUE
RUNTIME_EFFECT_REQUIRED
REPLAY_BEFORE_REDISCOVERY
RUNTIME_IS_NOT_SCRATCH
CASA_IS_NOT_SCRATCH
```

## Dono

- humano: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md`
- máquina: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.json`
- binding: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.yml`
- fast path: `.agents/skills/main-pinned-runtime-fast-path/SKILL.md`
- hub/credenciais: `.agents/skills/centraldark-hub-credential-control-plane/SKILL.md`
- bot: `apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml`
- trigger fabric: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml`
