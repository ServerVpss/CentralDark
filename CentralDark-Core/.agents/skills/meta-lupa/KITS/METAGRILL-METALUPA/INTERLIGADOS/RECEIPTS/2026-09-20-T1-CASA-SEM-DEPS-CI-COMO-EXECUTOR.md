# 🪬 T1 — Casa sem dependências; CI vira executor da prova

PR_MOTHER=#1562  
OBSERVED_HEAD=1f59bf09cee5160f3f17a58c90e0aa5176564a94  
CHILD_PR=#1597  
TARGET_HEAD=9397a27ffe600f4f46c80c329535a283a42f8b87

## Medição

C:\CentralDark\node_modules = ausente.  
C:\CentralDark\apps\modulos\mcp\node_modules = ausente.  
winston local = ausente.  
tsc local = ausente.

## Classificação

CASA_TEST_DEPENDENCIES=false.  
PRODUCT_FAILURE=false.  
LOCAL_INSTALL_REQUIRED=false.

## Decisão

Não instalar dependências só para validar um patch quando o pipeline SAME-HEAD já possui ambiente de CI responsável por instalar/buildar.

TEST_EXECUTOR=GITHUB_ACTIONS_CI.  
TARGET_HEAD_UNCHANGED=true.

## Aprendizado

LOCAL_DEV_ENV_MISSING != PRODUCT_FAIL.  
CI_CAN_BE_AUTHORITATIVE_TEST_EXECUTOR_WHEN_SAME_HEAD=true.  
DO_NOT_ADD_LOCAL_COMPLEXITY_WITHOUT_CAPABILITY_GAIN=true.

## NEXT_CURSOR

Reconciliar dist mínimo → push same-head → ler CI → corrigir apenas delta provado → receipt PR-MÃE.
