---
name: main-pinned-runtime-fast-path
description: Mecanismo determinístico de microdeploy runtime da CentralDark. Use no Live Editing Fabric quando o CHEFE quiser ver delta vivo no runtime com SHA rastreável, owner exato, scratch único, teste mínimo, prova e receipt. Também serve como fallback quando o deploy canônico FAIL/BLOCKED.
metadata:
  type: operational
  version: "1.1"
  owner: SEGREDO/CHEFE
---

# MAIN-PINNED RUNTIME FAST-PATH

## Quando usar

Use quando:
- a intenção for Live Editing Fabric: editar/refinar/publicar/ver vivo/repetir;
- ou deploy canônico estiver FAIL/BLOCKED;
- SOURCE_SHA ou delta rastreável for explícito;
- owner/fileset causal forem identificáveis;
- promoção isolada e rollback local forem possíveis.

Não é só emergência. É o caminho normal de microdeploy causal da CentralDark quando há escopo runtime pequeno e testável. O deploy canônico profundo continua como guarda, auditoria, esteira maior ou prensa quando o CHEFE mandar.

## Receita

```text
INTENT_DELTA
→ confirmar SOURCE_SHA/delta rastreável
→ LOCK
→ ASSERT_SCRATCH_REALPATH
→ FETCH MAIN
→ RESET/CLEAN SCRATCH
→ owner exato
→ fileset causal
→ teste aplicável
→ copiar/promover somente fileset causal
→ restart/reload somente owner se necessário
→ readiness
→ health + efeito runtime
→ receipt #1562 ou filho equivalente
→ reset/clean scratch
→ unlock
```

## Cadeados

```text
UNKNOWN != PASS
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
FALLBACK_PASS != PRIMARY_PIPELINE_FIXED
NO_FORCE_PUSH
NO_BLIND_PULL
NO_BLIND_RESET
NO_SECRET_LEAK
NO_FULL_RUNTIME_COPY_BY_DEFAULT
NO_UNRELATED_RESTART
RUNTIME_IS_NOT_SCRATCH
CASA_IS_NOT_SCRATCH
```

## Replay

Leia primeiro:
- `docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json`
- `docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.yml`
- `docs/CONSCIENCIA/MICRO-DEPLOY/CENTRALDARK-LIVE-EDITING-FABRIC.json`
- `.agents/skills/centraldark-live-editing-fabric/SKILL.md`

SAME_FINGERPRINT → REPLAY_BEFORE_REDISCOVERY.
CHANGED_FINGERPRINT → REVALIDATE_AFFECTED_CONE_ONLY.

## Finalização

Registrar SOURCE_SHA/delta, OWNER, FILESET_CAUSAL, testes, restart/reload se houve, health, efeito, rollback target, RESULT e NEXT_CURSOR no #1562 ou filho equivalente. Nunca registrar valor secreto.

## Scratch único obrigatório

Use sempre:

```text
/root/CentralDark/_worktrees/main-pinned-runtime-fastpath
```

Lei:

```text
SINGLE_REUSABLE_WORKTREE=true
LOCK_REQUIRED=true
RESET_BEFORE_EACH_RUN=true
RECEIPT_BEFORE_CLEANUP=true
RESET_AFTER_EACH_RUN=true
DIRTY_WORKTREE_FORBIDDEN_AT_HANDOFF=true
```

Antes de qualquer reset/clean destrutivo, compare o realpath com o path canônico. Se divergir, STOP_AND_RECONCILE.

Nunca execute `git reset --hard` ou `git clean -fdx` em `/root/CentralDark`, runtime vivo, Casa `E:\CentralDark` ou checkout principal.

Sequência final:

```text
AGENTE → LOCK → ASSERT_PATH → FETCH → RESET/CLEAN SCRATCH → DELTA → TESTE → DEPLOY OWNER → PROVA → RECEIPT → RESET/CLEAN SCRATCH → UNLOCK
```
