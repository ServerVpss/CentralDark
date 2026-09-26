# #662 ← main pós-#679 — merge preservador (2026-08-06)

## Objetivo
Integrar `origin/main` (já com #679) na **linha do PR #662** sem reescrever histórico.

## Proibido
- rebase destrutivo / force-push / `reset --hard`
- tocar worktree **real** do branch do PR se estiver sujo ou divergente
- copiar cegamente “estado final” de um WF
- declarar PASS só porque YAML parseou ou conflito sumiu
- push / merge do PR / deploy sem ordem nova

## Worktree
```text
REAL (READ_ONLY se dirty/divergente):
  E:/CentralDark/Pivete/worktrees/pr-662-writer-wire
  branch fix/segredo-sol-pivete-authority-20260805
  pode estar ahead/behind e com arquivos locais — NÃO limpar

TEMP (único lugar de escrita):
  E:/tmp/pr662-integracao-679
  partir de origin/pr-662-head (SHA byte-a-byte)
  se branch do PR já estiver checked-out noutro WT:
    usar detached + ref LOCAL TEMP (ex: integracao/662-com-main-679)
    NÃO é linha V2 de produto; é âncora anti-perda de commit
```

## Fluxo
```text
1) skills first (centraldark-pr + deterministic-casa-ops + meta-lupa)
2) fetch main + pull/662/head → origin/pr-662-head
3) fixar MAIN_SHA / PR662_SHA / BASE_SHA
4) worktree temp em PR662_SHA; status limpo
5) git merge --no-commit --no-ff origin/main
6) conflitos esperados SOMENTE:
     .github/workflows/porta-de-entrada.yml
     .github/workflows/codex-validate.yml
   fora disso → BLOCKED_UNEXPECTED_CONFLICT
7) resolver semanticamente (abaixo)
8) provas → commit local → PARE (READY_FOR_PUSH_AUTHORIZATION)
```

## Contrato semântico dos 2 WFs
**Preservar #679/main:**
- `runs-on: [self-hosted, Linux]`
- fork_guard + outputs blocked/cause
- checkout pin SHA + `persist-credentials: false` + ref imutável
- prove checkout HEAD
- timeout
- receipt `if: always()` → PASS|FAIL|BLOCKED; UNKNOWN/SKIPPED/vazio ≠ PASS
- if/fi shell **1:1** (fi órfão = job FAIL com gates verdes)

**Incorporar #662:**
- authority-approval test + resolve (`steps.authority.outputs.approved`)
- NÃO aprovação só por body/label `PERMITO PIVETE`
- validar-identidade-operacional (+ json no relatório)
- continuity-guard tests
- orchestrator `--check`
- nome de job com identidade (porta)

**Nunca:**
- reintroduzir `ubuntu-latest`
- remover receipt / fork_guard
- duplicar steps/jobs/validadores
- dois caminhos de autorização concorrentes

## Provas mínimas (no temp WT, HEAD do merge)
```text
git diff --check
git grep markers em .github/workflows
yaml.safe_load nos 2 WFs + assert ubuntu=0 + receipt presente
node --test authority-approval + identidade + continuity-guard
node --check orchestrator.mjs
node scripts/lupa/validar-porta-de-entrada.mjs --json
node scripts/lupa/validar-identidade-operacional.mjs --json
```
Saída vazia / skipped / não executado ≠ PASS.

## Estado local comprovado (sessão)
```text
MAIN_SHA=1e25bc999…
PR662_SHA=e80830f30…
BASE_SHA=26d92270…
MERGE_COMMIT local=c43934238 (integracao/662-com-main-679)
TESTES=17/17 + porta ok + identidade ok
PUSH=NÃO
REAL_WT ainda 34861364f dirty — intocado
```

## Após autorização de push
Atualizar o branch **remoto** do #662 a partir da ref temp (fast-forward ou merge no remoto conforme política), **sem** force e **sem** sobrescrever o worktree real sujo — o dono daquele WT decide como rebasar o trabalho local dele.
