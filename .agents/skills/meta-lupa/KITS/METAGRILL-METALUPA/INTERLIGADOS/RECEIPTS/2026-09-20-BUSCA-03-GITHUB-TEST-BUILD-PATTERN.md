# 🪬 BUSCA 03 — padrão de teste/build para correção GitHub

PR_MOTHER=#1562  
OBSERVED_HEAD=1f59bf09cee5160f3f17a58c90e0aa5176564a94

## Resultado

apps/modulos/mcp/package.json:
- type=module;
- build=tsc -p tsconfig.json --noResolve;
- typecheck=tsc -p tsconfig.json --noEmit.

Teste GitHub existente:
apps/modulos/mcp/src/tools/github/github-labels.test.mjs

Ele usa:
- node:test;
- node:assert/strict;
- import direto de ./github.js.

## Decisão

A correção de owner/repo não precisa de framework novo.

Patch mínimo:
1. exportar normalizador compartilhado em github.js;
2. usar normalizador nas funções que constroem /repos/{owner}/{repo};
3. criar github-repo-normalize.test.mjs no mesmo diretório;
4. executar node --test nos testes GitHub;
5. executar build/typecheck do MCP;
6. reconciliar dist se o contrato do repo exigir;
7. SAME-HEAD CI;
8. receipt no PR-MÃE.

REUSE_EXISTING_TEST_PATTERN=true.  
NEW_TEST_FRAMEWORK=false.  
NEW_MODULE_LAYER=false.

## NEXT_CURSOR

Mutação no PR-filho #1597 somente se HEAD permanecer CURRENT; caso o HEAD tenha mudado, remeasure e tratar receipt anterior como HISTORY.
