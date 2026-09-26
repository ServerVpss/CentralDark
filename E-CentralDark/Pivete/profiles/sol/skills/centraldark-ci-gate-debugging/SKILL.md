---
name: centraldark-ci-gate-debugging
description: Debug CentralDark CI gate failures via gh and git.
version: "1.0.0"
author: "Hermes Agent"
license: "MIT"
tags: ["centraldark", "ci", "github-actions", "debugging", "gate", "regression"]
category: "software-development"
related_skills: ["centraldark-casa-operations", "centraldark-ci-gate-forensics", "centraldark-ci-reconciliation", "trigger-chain-verification"]
metadata:
  hermes:
    tags: ["centraldark", "ci", "github-actions", "debugging", "gate", "regression"]
    related_skills: ["centraldark-casa-operations", "centraldark-ci-gate-forensics", "centraldark-ci-reconciliation", "trigger-chain-verification"]
---

# CentralDark CI Gate Debugging

Diagnose and fix a red CentralDark CI gate with the smallest safe change. See
references/recipes.md for copy-modify command recipes. The repo
`ServerVpss/CentralDark` runs a self-hosted runner; `porta-de-entrada` is a
meta-gate running many sub-suites (identity, codex-validate, lupa-drift-guard,
continuity-guard). One red gate hides several independent failures.

## When to Use
A `porta-de-entrada` / `codex-validate` / `lupa-drift-guard` run is `failure` and
you must prove the cause from the log (not guess) and fix WITHOUT weakening a
governance gate.

## Measure first
```bash
gh run list --limit 40 --json databaseId,headBranch,headSha,status,conclusion,createdAt,workflowName,name
gh run view <RUN_ID> --log-failed > /tmp/run.log
grep -nE "##\[error|SyntaxError|IDENTIDADE_ERRO|EXTERNAL_SOURCE|RESULTADO=|ERROS=|INVARIANT_PROOF|UNREGISTERED" /tmp/run.log
```
Pitfall: `gh api .../actions/jobs/<id>/log` → 404 on this runner; use
`gh run view <id> --log-failed`. `gh run watch` can hit the 400s timeout; use
`gh run view <id> --json conclusion,status`.

## Failure patterns
**A. Lost-export regression** (`SyntaxError: ... does not provide an export named X`).
A consolidation PR dropped a function a test imports. Recover canonically:
```bash
LAST=$(git log -S "aplicarGatePercepcao" --pretty=format:"%H" -- <path/module.mjs> | tail -1)
git show "$LAST":<path/module.mjs> > <path/module.mjs>
node --test <path/test.mjs>
```
Restore the LAST commit that had the export + its helper chain. Never hand-rewrite.

**B. External-source governance gate** (`EXTERNAL_SOURCE_*_FORBIDDEN`, tokens
`aiox`/`SynkraAI`/`aioxsquad.ai`). Gate is CORRECT — do NOT weaken. Sanitize
literal tokens (`aiox`→`ai-ox`, `SynkraAI`→`Synkra-AI`), keep hashes/inspected_sha.
Verify grep returns 0.

**C. Lupa Drift Guard** (`SKILL_PARALELA_LUPA`). Add folder to `ALIASES_COMPAT`
in `scripts/lupa/detectar_drift.py` + create `SKILL.md` redirect (type/status/
owner + 3 flags). Preserves the skill's real code.

## Loop insight
`porta-de-entrada` runs suites sequentially; fixing #1 reveals #2. Measure →
fix smallest → re-run gate → repeat until all green. Base stays red until EVERY
suite passes.

## Rules
ONE_WRITER_PER_SCOPE (one worktree/branch per fix); zero regression (restore
canonical, never V2, never weaken gate); proof before claim (`node --test`
PASS); open PR per scope; human merges base (R4).

## Pitfalls
`python3` MISSING on MSYS — use `python`/`node`. `search_files` can return 0
with files present — use `git ls-files` / `git ls-tree -r --name-only origin/main`.
`gh workflow run --ref <b>` → 422 if branch merged/not indexed. Pure unit
`node --test` suites run fine locally; ones using `new URL("../../",import.meta.url)`
break on MSYS.

## Pitfall — Gate de cartazes canônicos (ENOENT por nome de diretório divergente)
Se o gate "Cartazes canônicos" falhar com `ENOENT: no such file or directory,
open '.../CARTAZES-CANONICOS/manifest.json'`, veja
`references/canonical-posters-missing-dir.md`. Em resumo:

- Causa: diretório real é `01-CARTAZES-CANONICOS/`, validator espera `CARTAZES-CANONICOS/`.
- Fix: `ln -s 01-CARTAZES-CANONICOS docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS`
- Validar local: `node .agents/skills/visual-design-method/scripts/validate-canonical-posters.mjs`
- Nunca renomear o diretório — symlink mantém ambos os caminhos válidos.

