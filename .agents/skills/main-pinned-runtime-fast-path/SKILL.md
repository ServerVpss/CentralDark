---
name: main-pinned-runtime-fast-path
description: Fallback oficial de microdeploy da CentralDark. Use quando o deploy canônico FAIL/BLOCKED antes da promoção e o delta já está na main. Reutiliza o mesmo SHA, owner e fileset causal; testa, promove só o owner, reinicia isoladamente, mede runtime e registra receipt #1562.
metadata:
  type: operational
  version: "1.0"
  owner: SEGREDO/CHEFE
---

# MAIN-PINNED RUNTIME FAST-PATH

## Quando usar

Use somente quando:
- deploy canônico = FAIL ou BLOCKED;
- source já está em main;
- SOURCE_SHA é explícito;
- owner/fileset causal são identificáveis;
- promoção isolada e rollback local são possíveis.

## Receita

PRIMARY FAIL/BLOCKED
→ confirmar SOURCE_SHA na main
→ worktree limpa
→ owner exato
→ fileset causal
→ teste aplicável
→ copiar somente fileset causal
→ restart/reload somente owner
→ readiness
→ health + efeito runtime
→ receipt #1562

## Cadeados

UNKNOWN != PASS
MERGED != DEPLOYED
FALLBACK_PASS != PRIMARY_PIPELINE_FIXED
NO_FORCE_PUSH
NO_BLIND_PULL
NO_BLIND_RESET
NO_SECRET_LEAK
NO_FULL_RUNTIME_COPY_BY_DEFAULT
NO_UNRELATED_RESTART

## Replay

Leia primeiro:
- docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json
- docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.yml

SAME_FINGERPRINT → REPLAY_BEFORE_REDISCOVERY.
CHANGED_FINGERPRINT → REVALIDATE_AFFECTED_CONE_ONLY.

## Finalização

Registrar PRIMARY_FAILURE_CAUSE, SOURCE_SHA, OWNER, FILESET_CAUSAL, testes, restart, health, efeito, rollback target, RESULT e NEXT_CURSOR no #1562 ou filho equivalente.

## Scratch único obrigatório

Use sempre:

    /root/CentralDark/_worktrees/main-pinned-runtime-fastpath

Lei:

    SINGLE_REUSABLE_WORKTREE=true
    LOCK_REQUIRED=true
    RESET_BEFORE_EACH_RUN=true
    RECEIPT_BEFORE_CLEANUP=true
    RESET_AFTER_EACH_RUN=true
    DIRTY_WORKTREE_FORBIDDEN_AT_HANDOFF=true

Antes de qualquer reset/clean destrutivo, compare o realpath com o path canônico. Se divergir, STOP_AND_RECONCILE.

Nunca execute `git reset --hard` ou `git clean -fdx` em `/root/CentralDark`, runtime vivo ou checkout principal.

Sequência:
AGENTE → LOCK → ASSERT_PATH → FETCH → RESET/CLEAN SCRATCH → DELTA → TESTE → DEPLOY OWNER → PROVA → RECEIPT → RESET/CLEAN SCRATCH → UNLOCK.

