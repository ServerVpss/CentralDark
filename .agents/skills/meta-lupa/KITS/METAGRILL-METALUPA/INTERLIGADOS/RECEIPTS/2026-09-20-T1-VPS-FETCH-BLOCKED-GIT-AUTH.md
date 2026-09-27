# 🪬 T1 — VPS executor bloqueado por auth do Git remote

PR_MOTHER=#1562  
OBSERVED_HEAD=1f59bf09cee5160f3f17a58c90e0aa5176564a94  
CHILD_PR=#1597  
TARGET_HEAD=9397a27ffe600f4f46c80c329535a283a42f8b87

## Resultado

Tentativa de criar worktree T1 na VPS parou no fetch:

fatal: could not read Username for https://github.com

## Classificação

TARGET_TESTED=false.  
VPS_RUNTIME_MUTATED=false.  
PRODUCT_FAILURE=false.  
GIT_REMOTE_AUTH_BLOCKED_FOR_THIS_PROCESS=true.

O bloqueio pertence ao executor escolhido, não ao patch GitHub.

## Decisão

Não alterar auth global da VPS só para executar o teste.

Próxima contraprova: verificar se o checkout da Casa possui node_modules na raiz do monorepo. Se existir, montar esse diretório no worktree efêmero e repetir o mesmo T1 no mesmo HEAD.

## Aprendizado

EXECUTOR_AUTH_FAILURE != TARGET_FAILURE.  
DO_NOT_EXPAND_SCOPE_TO_FIX_EXECUTOR_IF_ALTERNATE_EXECUTOR_EXISTS=true.  
CRYSTALLIZE_BEFORE_NEXT_ROUTE=true.

## NEXT_CURSOR

Casa root node_modules inventory → reuse if present → same HEAD tests/build → PR-MÃE.
