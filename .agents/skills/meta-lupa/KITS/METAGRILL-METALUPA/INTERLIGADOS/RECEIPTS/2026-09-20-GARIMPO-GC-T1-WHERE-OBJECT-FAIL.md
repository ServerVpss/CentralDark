# 👑🪬 GARIMPO GC — T1 falhou fechado

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1590
TARGET_HEAD=76f1bcaaee7c55a599994d2ccc024e31d70ee97b

## T1

Executor: Casa SEGREDO.
Same-head checkout confirmado.

PARSE_ERRORS=0.

Self-test falhou antes de qualquer dry-run/apply:

Where-Object / Test-Path recebeu `-and` como se fosse parâmetro.

Local:
scripts/casa/garimpo-proof-gc.ps1:59

Causa:
expressão booleana sem encapsular a chamada de Test-Path.

## Classificação

SCRIPT_PARSE=PASS.
SELF_TEST=FAIL.
ACTUAL_GARIMPO_DRY_RUN=NOT_EXECUTED.
GC_APPLY=NOT_EXECUTED.
DATA_DELETED_BY_NEW_GC=false.
PRODUCT_RUNTIME_MUTATED=false.

## Correção mínima

Trocar:

`Test-Path ... -PathType Leaf -and condition`

por:

`(Test-Path ... -PathType Leaf) -and condition`

no mesmo owner e mesmo PR.

## NEXT_CURSOR

Patch mínimo #1590 → novo same-head self-test → dry-run real → somente depois APPLY.
