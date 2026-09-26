# porta-de-entrada vermelho: agent-core-adapters.test.mjs (2026-08-27)

## Contexto
PR #1231 (fix/lupa-drift-guard-allow-compat-alias) corrigiu o drift-guard vs alias
`tecnica-da-lupa` (YAML + detectar_drift.py). Após push do head `613d20e4b`, o
`porta-de-entrada` continuou FAILURE. Investigação mostrou que a causa NÃO era o
PR, e sim um teste de governança dessincronizado da realidade canônica.

## Log do run (head 613d20e4b, run 33098131361)
Receipt do `porta-de-entrada.yml` (linhas fixas, não causa):
```
UNREGISTERED_INVARIANT=UNPROVEN_NOT_OWNED
RESULTADO=FAIL
```
Causa real (grep no `--log` por AssertionError):
```
AssertionError [ERR_ASSERTION]: ENGINE_MARKER_MISSING:CLAUDE.md:CLAUDE
  at scripts/lupa/agent-core-adapters.test.mjs:73:12
AssertionError [ERR_ASSERTION]: CORE_ROUTE_MISMATCH:CLAUDE.md
  at scripts/lupa/agent-core-adapters.test.mjs:98:12
```

## O que o teste exige (linhas 60-110 do teste na main)
- Itera `ADAPTERS` = lista de `[path, engine]`.
- Para cada adapter: `content.includes('ENGINE=' + engine)` e `CANONICAL_AGENT_CORE=<CORE>`.
- `CLAUDE.md` está na lista como adapter que deveria ter `ENGINE=CLAUDE` + core singleton.

## O que a main tem (CLAUDE.md real)
```
consumer: Claude Code / engines Claude
ENGINE=REPLACEABLE
ENGINE_IS_OWNER=false
SEGREDO/CHEFE > SOL > PIVETE/HERMES
```
→ `ENGINE=REPLACEABLE` ≠ `ENGINE=CLAUDE`; hierarquia diferente do core esperado.
Teste dessincronizado. Falha na main e em TODOS os PRs.

## Comando de isolamento (R0, sem runner)
```bash
gh run view <RUN_ID> --repo ServerVpss/CentralDark --log 2>&1 | grep -iE 'AssertionError|ENGINE_MARKER_MISSING|CORE_ROUTE_MISMATCH|failing tests|test at scripts' | head -30
```

## Diagnóstico diferencial
| Sinal | Causa | Escopo |
|---|---|---|
| submodule mapping | .gitmodules vs dir | PR-level |
| drift-guard SKILL_REMOVIDA_REAPARECEU | alias hard-coded | PR-level (corrigível) |
| GLOBAL_RUNNER_POLICY=FAIL | ubuntu-latest in main | repo-level (externo) |
| ENGINE_MARKER_MISSING/CORE_ROUTE_MISMATCH | teste vs CLAUDE.md | repo-level (framework) |

## Fronteira
Mexer no `CLAUDE.md` canônico (por ENGINE=CLAUDE) ou no teste (aceitar REPLACEABLE)
afeta identidade operacional da Casa → HUMAN_FRONTIER. Diagnosticar, cristalizar,
devolver ao CHEFE com opções A/B/C. Não editar sozinho.
