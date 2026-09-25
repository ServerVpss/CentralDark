# Microdeploy Oficial de Fallback — MAIN-PINNED RUNTIME FAST-PATH

Status: CANONICAL_FALLBACK_RECIPE  
Owner: docs/CONSCIENCIA/MICRO-DEPLOY/  
Authority: SEGREDO/CHEFE  
Truth rule: REALIDADE_IS_JUDGE

## Objetivo

Quando o deploy canônico falhar ou ficar BLOCKED antes de promover um delta válido, usar o mesmo SHA já existente na main para promover somente o owner causal, sem carregar sujeira da VPS e sem criar source paralelo.

## Fórmula canônica

DEPLOY_CANÔNICO
→ PASS: encerra
→ FAIL/BLOCKED:
  → SOURCE_JÁ_NA_MAIN
  → SAME_SHA
  → OWNER_EXATO
  → WORKTREE_LIMPA
  → TESTE_APLICÁVEL
  → COPIA_FILESET_CAUSAL
  → RESTART_ISOLADO
  → HEALTH/PROVA_RUNTIME
  → RECEIPT_#1562
  → continuar corrigindo pipeline primário

## Pré-condições

- delta já está em main;
- SOURCE_SHA é explícito;
- owner e fileset causal são conhecidos;
- deploy isolado é tecnicamente seguro;
- teste/health aplicável existe;
- restart/reload isolado existe;
- rollback do mesmo owner é possível;
- UNKNOWN material não vira PASS.

## Receita executável

1. Medir MAIN_HEAD e PRIMARY_DEPLOY_STATE.
2. Só ativar fallback com PRIMARY_DEPLOY_STATE=FAIL|BLOCKED.
3. Confirmar SOURCE_SHA como ancestral/HEAD válido da main.
4. Identificar OWNER e FILESET_CAUSAL.
5. Medir árvore runtime; nunca pull/reset cego em checkout dirty.
6. Criar worktree limpa de origin/main e fixar SOURCE_SHA.
7. Rodar sintaxe/typecheck/build/testes aplicáveis.
8. Copiar somente FILESET_CAUSAL ao runtime.
9. Restart/reload somente do owner.
10. Aguardar readiness.
11. Medir processo, porta, health e efeito esperado.
12. Comparar esperado × observado.
13. PASS → receipt #1562 + NEXT_CURSOR.
14. FAIL → rollback do mesmo owner + causa localizada.

## Bindings

REPO=ServerVpss/CentralDark
BRANCH=main
SOURCE_SHA=<sha_exato_da_main>
OWNER=<owner_causal>
WORKTREE=<worktree_limpa>
RUNTIME_ROOT=/root/CentralDark
FILESET_CAUSAL=<lista_exata>
TEST_COMMAND=<teste_aplicavel>
BUILD_COMMAND=<build_ou_NA>
RESTART_COMMAND=<restart_owner>
HEALTH_COMMAND=<health_owner>
ROLLBACK_SOURCE=<runtime_anterior>
PR_MOTHER=1562

## Exemplo já provado — MCP Admin

SOURCE_SHA=cccf53ef74e45cd6759e650b4889c239378f5a77

FILESET_CAUSAL:
- apps/modulos/mcp/src/admin.js
- apps/modulos/mcp/src/admin-patterns-ui.js
- apps/modulos/mcp/dist/admin.js
- apps/modulos/mcp/dist/admin-patterns-ui.js

Sequência:
- node --check
- typecheck
- testes direcionados
- copiar 4 arquivos para /root/CentralDark/apps/modulos/mcp/
- restart CentralDark-MCP
- provar 127.0.0.1:9100/health = 200
- confirmar dist vivo com o delta esperado

No ciclo que originou esta receita, o deploy canônico falhou antes da promoção por HOME ausente em deploy-guards-dispatcher.sh. O fallback promoveu o mesmo delta já commitado na main.

## Cadeados

NO_UNCOMMITTED_SOURCE_AS_DEPLOY_INPUT=true
NO_FORCE_PUSH=true
NO_BLIND_PULL=true
NO_BLIND_RESET=true
NO_FULL_RUNTIME_COPY_BY_DEFAULT=true
NO_UNRELATED_RESTART=true
NO_SECRET_IN_GIT_OR_LOG=true
PRIMARY_PIPELINE_FAILS_DO_NOT_BECOME_FIXED_BY_FALLBACK=true
MERGED_IS_NOT_DEPLOYED=true
UNKNOWN_IS_NOT_PASS=true

## SAME_SHA

SOURCE_SHA = origem do fileset.
FILES_PROMOTED = derivados do mesmo SOURCE_SHA.
Se o conteúdo mudar depois de extraído, SAME_SHA=false e isso vira DELTA_NOVO.

## Rollback

FALLBACK_RUNTIME_FAIL
→ restaurar FILESET_CAUSAL anterior
→ restart somente owner
→ health
→ registrar FAIL/ROLLED_BACK
→ não usar git reset --hard no checkout sujo da VPS.

## Receipt mínimo

MICRO_DEPLOY_MODE=MAIN_PINNED_FALLBACK
PRIMARY_DEPLOY_STATE=FAIL|BLOCKED
PRIMARY_FAILURE_CAUSE=
SOURCE_SHA=
MAIN_HEAD=
OWNER=
FILESET_CAUSAL=
TESTS=
BUILD=
PREVIOUS_RUNTIME=
DEPLOY_ACTION=
RESTART_ACTION=
RUNTIME_HEALTH=
RUNTIME_EFFECT=
SAME_SHA=
ROLLBACK_TARGET=
SECRET_EXPOSED=false
RESULT=PASS|FAIL|ROLLED_BACK
PR_MOTHER=#1562
NEXT_CURSOR=

## Fingerprint

recipe_version + owner + fileset + test + build + restart + health + runtime_target

SAME_FINGERPRINT
→ REPLAY_BEFORE_REDISCOVERY
→ adaptar somente bindings
→ mesma sequência
→ mesma prova

CHANGED_FINGERPRINT
→ REVALIDATE_AFFECTED_CONE_ONLY
→ DELTA_NOVO

## Nome canônico

MAIN-PINNED RUNTIME FAST-PATH

Alias: MICRODEPLOY OFICIAL DE FALLBACK

## Single Reusable WorkTree — scratch canônico

O fast-path usa **um único WorkTree descartável/reutilizável** para todos os agentes. Não criar worktrees de agente de longa duração.

    SINGLE_REUSABLE_WORKTREE=true
    AGENT_USES_CLEAN_WORKTREE=true
    RESET_AFTER_EACH_AGENT_RUN=true
    NO_LONG_LIVED_AGENT_WORKTREES=true
    DIRTY_WORKTREE_FORBIDDEN_AT_HANDOFF=true

Binding canônico:

    CANONICAL_SCRATCH_WORKTREE=/root/CentralDark/_worktrees/main-pinned-runtime-fastpath
    WORKTREE_IS_DISPOSABLE=true
    WORKTREE_RESET_BEFORE_USE=true
    WORKTREE_RESET_AFTER_USE=true
    RUNTIME_IS_NOT_SCRATCH=true
    RECEIPT_BEFORE_CLEANUP=true
    LOCK_REQUIRED=true

Fluxo:

    AGENTE_ENTRA
    → adquirir LOCK
    → validar caminho exato do scratch
    → fetch origin main
    → reset do scratch para origin/main
    → clean total somente do scratch
    → aplicar delta exato
    → testar
    → copiar somente owner aprovado para runtime
    → restart isolado
    → provar
    → receipt
    → reset/clean do scratch
    → verificar scratch limpo
    → soltar LOCK

Cadeado crítico:

    git reset --hard
    git clean -fdx

só podem rodar quando:

    REALPATH == /root/CentralDark/_worktrees/main-pinned-runtime-fastpath
    AND RUNTIME_ROOT != REALPATH
    AND PRIMARY_REPO_ROOT != REALPATH

É proibido executar reset/clean destrutivo em:
- /root/CentralDark
- runtime vivo
- checkout principal
- worktree não reconhecido pelo binding canônico

Receipt ocorre **antes** do cleanup final. Handoff só ocorre com scratch limpo.

