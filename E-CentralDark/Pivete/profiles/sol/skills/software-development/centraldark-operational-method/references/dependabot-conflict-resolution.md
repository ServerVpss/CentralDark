# Dependabot Conflict Resolution — Padrão Determinístico

## Quando usar
PR Dependabot com `mergeable=false` ou conflito em `package.json` / `package-lock.json` / core scripts.

## Padrão canônico (MAIN + BUMP)
```
CONFLITO em package.json/lock
→ ACEITAR MAIN (theirs no merge = base)
→ APLICAR BUMP do PR (versão alvo do Dependabot)
→ COMMIT + PUSH

CONFLITO em centraldark_master_cycle.py / lupa / docs / .github
→ MANTER MAIN (ours do merge = main atual)

SE NÃO DETERMINÍSTICO
→ FAIL_CLOSED (não inventa)
```

## Script canônico
Repo: `scripts/dependabot/resolve-conflicts.sh`
- Aceita BASE (main) para packages, aplica BUMP inferido do branch name.
- Core: mantém main.
- Fail-closed se não conseguir resolver.

## Workflow automático
`.github/workflows/dependabot-auto-merge.yml`:
- Em `mergeable=false`: dispara `scripts/dependabot/resolve-conflicts.sh $PR` no runner self-hosted.
- Não apenas comenta `@dependabot rebase`.

## Casos reais (2026-08-26)
- #1193: typescript 5.8.3→5.9.3 → MAIN+BUMP ^5.9.3 ✅
- #1197: types/node 22.20.1 → MAIN+BUMP ✅
- #1198: @tanstack/react-query 5.83.0→5.102.2 → MAIN+BUMP ✅
- #1203: fix/dependabot-canonical-labels, core conflict → MANTER MAIN ✅
- #1189: core conflict repetido em centraldark_master_cycle.py → resolver com --ours (main) a cada rebase

## Armadilhas (Git bash / Windows)
- `python3` é alias da Microsoft Store → falha. Usar `node -e` ou `python` (uv) para patch JSON.
- `git branch --show-current` em branch de fetch (`pr1198`) retorna nome local, não o do Dependabot. Usar `gh pr view $PR --json headRefName` para nome real do pacote/versão.
- PR aponta para branch diferente da editada localmente (ex: #1203 era `fix/dependabot-canonical-labels`, não `fix/ouro-proof-architecture-boot`). Sempre checar `gh pr view $PR --json headRefName` antes de pushar.
- `gh pr checks` retorna PENDING (rc=8) por muito tempo com fila grande no runner self-hosted. Não declarar FAIL; usar `gh run view <run_id>` por run.
- Push force-with-lease em branch de PR própria é aceitável quando o rebase é autorizado; usar `git push --force-with-lease origin <branch>`.
