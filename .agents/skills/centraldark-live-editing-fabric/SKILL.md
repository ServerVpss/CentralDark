---
name: centraldark-live-editing-fabric
description: Modo padrão da CentralDark para edição viva determinística. Use quando o CHEFE quiser editar/refinar e ver no runtime rápido, sem transformar CI profundo em freio de MVP.
metadata:
  type: operational
  version: "1.0"
  owner: SEGREDO/CHEFE
---

# CENTRALDARK LIVE EDITING FABRIC

## Quando usar

Use por padrão quando a intenção for construir, ajustar, refinar, publicar no site/runtime, ver vivo e repetir.

Não trate como emergência. Emergência/fallback é `main-pinned-runtime-fast-path`; Live Editing Fabric é o modo de trabalho normal.

## Fluxo

```text
CHEFE_EDITA
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
```

## Dono

- humano: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.md`
- máquina: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.json`
- binding: `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.yml`
- bot: `apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml`
- trigger fabric: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml`
