# 🪬 T1 — Casa sem dependências locais; trocar executor, não alvo

PR_MOTHER=#1562  
OBSERVED_HEAD=1f59bf09cee5160f3f17a58c90e0aa5176564a94  
CHILD_PR=#1597  
CHILD_HEAD=9397a27ffe600f4f46c80c329535a283a42f8b87

## Medição

C:\CentralDark\apps\modulos\mcp\node_modules = ausente.

Logo não existe dependência local para junction/reuse no worktree da Casa.

## Classificação

CASA_TEST_DEPS_AVAILABLE=false.  
PRODUCT_FAILURE=false.  
TARGET_CHANGED=false.  
EXECUTOR_CHANGE_ALLOWED=true.

## Decisão

Não executar npm install só para viabilizar o teste se já existe executor com dependências na VPS.

A VPS possui o monorepo e node_modules observados anteriormente; o mesmo HEAD será testado em worktree efêmero na VPS, reutilizando dependências existentes.

TEST_TARGET_SAME=true.  
TEST_EXECUTOR=VPS.  
REUSE_BEFORE_CREATE=true.

## Aprendizado

EXECUTOR_CAN_CHANGE_WITHOUT_CHANGING_CLAIM=true.  
MISSING_LOCAL_DEPS_SHOULD_NOT_FORCE_NEW_INSTALL=true.  
TEST_EVIDENCE_MUST_RECORD_EXECUTOR_AND_HEAD=true.

## NEXT_CURSOR

VPS worktree no HEAD 9397a27... → reuse /root/CentralDark/node_modules → GitHub tests → typecheck → build → dist diff → receipt PR-MÃE.
