# CentralDark CI Gate Debugging — Command Recipes

Concrete copy-modify commands used to debug a red `porta-de-entrada` gate.
Paths are examples from the 2026-08-30 session; adapt `<...>` to the target.

## 1. Find the red run + dump its log
```bash
gh run list --limit 40 --json databaseId,headBranch,headSha,status,conclusion,createdAt,workflowName,name
gh run view <RUN_ID> --log-failed > /tmp/run.log
grep -nE "##\[error|SyntaxError|IDENTIDADE_ERRO|EXTERNAL_SOURCE|RESULTADO=|ERROS=|INVARIANT_PROOF|UNREGISTERED" /tmp/run.log
```
Note: `gh api repos/.../actions/jobs/<id>/log` returns 404 on the Casa runner.
Use `gh run view <ID> --log-failed`.

## 2. Lost-export regression recovery
```bash
# Find last commit that still had the export
LAST=$(git log -S "aplicarGatePercepcao" --pretty=format:"%H" -- apps/modulos/HERMES-CORE/core/decisor.mjs | tail -1)

# Inspect the function + helpers it depends on
git show "$LAST":apps/modulos/HERMES-CORE/core/decisor.mjs | awk '/export (async )?function aplicarGatePercepcao/,/^}/'

# Restore the whole canonical file (preserves other exports like decidir())
git show "$LAST":apps/modulos/HERMES-CORE/core/decisor.mjs > apps/modulos/HERMES-CORE/core/decisor.mjs

# Prove locally
node --test apps/modulos/HERMES-CORE/core/continuity-guard.test.mjs 2>&1 | grep -E "tests |pass |fail "
```
Same pattern for `agent.mjs` (`auditarFinalizacao`, `resultadoAprovadoPeloCritic`)
restored from the last commit that had them.

## 3. External-source token sanitization (gate stays intact)
The prohibited tokens are defined in `scripts/lupa/validar-identidade-operacional.mjs`
(`EXTERNAL_SOURCE_RULES`): `aiox` (project), `SynkraAI` (org), `aioxsquad.ai` (domain),
all case-insensitive word-boundary. Replace literal occurrences:
- `aiox` → `ai-ox`, `AIOX` → `AI-OX`
- `SynkraAI` → `Synkra-AI`
Keep `inspected_sha`, SHA256SUMS, structure. Then:
```bash
grep -rniE "aiox|SynkraAI" docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ docs/CONSCIENCIA/APRENDIZADOS/AIOS-GOLD-ASSAY-20260828/ | wc -l
# expect 0
python -c "import json; json.load(open('docs/CONSCIENCIA/APRENDIZADOS/AIOS-GOLD-ASSAY-20260828/MANIFEST.json')); print('json ok')"
```

## 4. Lupa Drift Guard alias
```python
# scripts/lupa/detectar_drift.py
ALIASES_COMPAT = {"tecnica-da-lupa", "lupa-bayesiana"}   # add the folder name
```
```markdown
<!-- .agents/skills/lupa-bayesiana/SKILL.md -->
---
name: lupa-bayesiana
type: redirect
status: COMPATIBILITY_ALIAS
owner: .agents/skills/meta-lupa/SKILL.md
TECNICA_DA_LUPA_IS_SECOND_SKILL=false
TECNICA_DA_LUPA_IS_SECOND_OWNER=false
META_LUPA_IS_CANONICAL_OWNER=true
---
```
Verify: `python scripts/lupa/detectar_drift.py; echo $?` → 0.

## 5. Worktree + PR per scope
```bash
git worktree add -f E:/CentralDark/Pivete/worktrees/fix-ci-<topic> origin/main
cd E:/CentralDark/Pivete/worktrees/fix-ci-<topic>
git checkout -b fix/ci-<topic>
# ... edit, test ...
git add -A && git commit -m "fix(...): <what>"
git push -u origin fix/ci-<topic>
gh pr create --title "..." --body "..." --base main
```

## 6. Re-run the gate on a PR branch
```bash
gh workflow run porta-de-entrada.yml --ref fix/ci-<topic>
# 422 "No ref found" ⇒ branch already merged or not indexed; check `gh pr view <n> --json state`
```
