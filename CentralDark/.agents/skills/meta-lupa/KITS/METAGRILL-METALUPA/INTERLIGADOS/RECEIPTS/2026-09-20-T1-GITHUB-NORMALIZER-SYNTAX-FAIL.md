# 🪬 T1 — normalizador GitHub bloqueado por sintaxe antes do deploy

PR_MOTHER=#1562  
OBSERVED_HEAD=1f59bf09cee5160f3f17a58c90e0aa5176564a94  
CHILD_PR=#1597  
CHILD_HEAD=6d3337c9201c84f53d00001d2f004c8c54b63536

## Resultado

O primeiro T1 do patch de normalização owner/repo falhou imediatamente ao importar:

apps/modulos/mcp/src/tools/github/github.js

Erro:

SyntaxError em regex de limpeza de barras.

A linha foi materializada com escape duplicado e ficou sintaticamente inválida no JavaScript.

## Classificação

PATCH_REGRESSION=true.  
RUNTIME_DEPLOYED=false.  
VPS_MUTATED=false.  
CASA_RUNTIME_MUTATED=false.  
TEST_GATE_CAUGHT_BEFORE_DEPLOY=true.

Isso não é falha do GitHub API nem do MCP runtime existente. É erro introduzido no patch novo e detectado pelo teste antes da promoção.

## Aprendizado

TEST_BEFORE_DEPLOY_WORKS=true.  
SOURCE_IMPORT_FAILURE_BLOCKS_PROMOTION=true.  
WRAPPER_ESCAPE_MUST_NOT_LEAK_INTO_SOURCE=true.  
FAILED_PATCH_MUST_BE_FIXED_IN_SAME_CHILD_SCOPE=true.

## NEXT_CURSOR

Corrigir somente a regex no #1597 → repetir os mesmos testes GitHub → typecheck → build → diff/dist → receipt no PR-MÃE.
