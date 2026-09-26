---
name: centraldark-ci-gate-forensics
description: "CentralDark CI gate red? Find base cause, prove local."
version: 1.0.1
author: Hermes-Casa
platforms: [windows, linux]
metadata:
  hermes:
    tags: [centraldark, ci, github-actions, drift-guard, porta-de-entrada, juiz, forensics, contraproof]
    related_skills: [centraldark-ci-reconciliation, centraldark-casa-operations]
---

# CentralDark CI Gate Forensics

Use when a CentralDark PR (or ALL open PRs) shows red checks from
`Lupa Drift Guard`, `porta-de-entrada`, or `Juiz determinístico — intenção + estado + segurança`.

> Overlap note: `centraldark-ci-reconciliation` (user-owned) covers runner diagnosis
> + PR rebase. This skill EXTENDS it with two gaps: (a) base-branch-violation root cause
> and (b) local contraproof of the workflow bash step without the saturated self-hosted runner.
> Recommend `hermes curator adopt` / consolidate the two.

## Trigger
- drift-guard / porta / juiz = FAILURE on a PR you own, or on every open PR
- "CI vermelho" with no obvious code cause in the PR diff
- self-hosted runner busy/queued and you cannot wait for it to judge

## Diagnostic ladder (MEASURE before blaming the PR)
1. **Runner alive?** `gh api repos/ServerVpss/CentralDark/actions/runners --jq '.runners[] | "\\(.name) \\(.status) busy=\\(.busy)"'`
   - offline / cancels in ~1s = runner dead, NOT a code bug.
2. **Read the failing run log, not the red X.** `gh run view <id> --log-failed`
   The first error line IS the root cause (e.g. `fatal: no submodule mapping found`).
3. **Red on ONE PR only** → likely PR divergence → rebase per `centraldark-ci-reconciliation`.
4. **Red on ALL open PRs (same gate)** → ROOT CAUSE IS THE BASE BRANCH, not the PRs.
   Validate: `git ls-tree origin/main <path-from-error>`. If the forbidden condition
   already exists on `origin/main`, every PR inherits it. Fix main/gate, not each PR.

## CI com múltiplos gates falhados de tipos diferentes

Quando o mesmo PR mostra vários checks falhados, **não trate como um único bug**. Classifique cada gate pelo tipo de falha antes de partir para remedição.

### Passo 1 — listar e classificar
```
gh pr checks <PR>
```
Leia o resultado completo, não só o X vermelho. Para cada gate falhado:
- copiar `job/<id>` do link
- anotar nome do gate e tipo presumido

Tipos comuns na Casa:
| Tipo | O que geralmente está quebrado | Onde o fix geralmente mora |
|---|---|---|
| FORK / porta de origem | HEAD_REPO != BASE_REPO ou identidade governança | workflow de porta ou configuração do PR |
| title / formato | emoji ausente, texto não uppercase, título vazio | título do PR — mudança de metadata, não de código |
| drift-guard | skill paralela ativa, skill removida reaparecendo, menção ativa em doc | `.agents/skills/` — remover duplicata ou mover para ALLOWLIST histórica |
| mapa / código quebrado | teste importa export que não existe no módulo, syntax error, lógica falhando | arquivo do agente/módulo testado, não o gate |
| juiz determinístico | estado vs intenção divergente, segurança | diff do PR + contexto do juiz |
| prova de mecanismo | gerador não comprovando no HEAD | fixture ou implementação do que se propõe provar |

### Passo 2 — ler o log de cada gate separado
Por gate:
```
gh run view <run-id> --log-failed | sed -n '1,<linhas>p'
gh run view <run-id> --log-failed | tail -n <linhas>
```
Regra: **log colado no chat é pista de run antigo, não estado atual**. Medir o run fresca pelo `headSha` antes de tirar conclusão.

### Passo 3 — separar falha de metadata de falha de código
- Se o gate é title/format/fork/porta e o código está verde, o PR pode estar funcional e só precisa de ajuste de metadata ou rematriculaçao.
- Se o gate é drift, mapa, juiz ou prova, a falha é de código/estado e o PR não está pronto.

Não declarar PR pronto porque alguns gates passaram. **PR com gate falhado != PR com gate verde no mesmo job.**

### Passo 4 — remediar por gate real, não por PR inteiro
- drift → remover skill paralela ou reconciliar doc
- código quebrado → arrumar o módulo testado (ex: export ausente no agente)
- title → renomear título com emoji + uppercase pt-BR
- porta/fork → corrigir no workflow ou no PR

Não abrir PR paralelo só para "consertar os gates" se a causa é de metadata ou drift — ajustar no mesmo PR quando for seguro e revertido ao mesmo escopo.

### Passo 5 — contraprova pelo menos em um gate crítico
Antes de recomendar que o PR passe:
- reproduzir o passo de gate mais sensível localmente se houver script de replica (ex: `scripts/check-lupa-guard-local.sh`)
- ou ler o log completo do gate falhado até a linha final de saída

Ver também: `centraldark-ci-reconciliation` quando o problema é runner/rebase, e `centraldark-ci-gate-forensics` (este skill) quando a causa é de gate/base/drift/código.

## Local contraproof (do NOT wait for the runner)
Reproduce the exact `run: |` bash block from the workflow locally and assert
pass/fail. The self-hosted runner is often saturated (busy / queued /
`cancel-in-progress` re-schedules), so a local deterministic run is faster AND proves logic.

Pattern:
```bash
cd <worktree-at-PR-head>
bash -c '
  set -e
  # paste the exact workflow loop here
'
echo "local_exit=$?"
```
See `scripts/check-lupa-guard-local.sh` for a ready replica of the drift-guard step.
ALWAYS run BOTH directions:
- state-with-fix → must PASS (exit 0)
- planted-violation → must still FAIL (exit 1)  ← proves you did NOT weaken the gate

## Known root causes + minimal fixes
Concrete recipes (with exact commands) live in `references/gate-red-on-all-prs-recipe.md`.
Two classes seen in the wild:
- **Submodule flattened to dir** (pretty-mermaid, PR #1221 / issue #1230): main mapped
  `skills/pretty-mermaid` as submodule (gitlink `160000`); PR flattened it to a dir
  (`040000` tree) but `.gitmodules` still declared it → `git submodule status` →
  `no submodule mapping found`. Fix: empty `.gitmodules` + ensure index has no `160000`
  gitlink for that path. Validate: `git submodule status` exit 0.
- **Compatibility alias hard-coded in forbidden list** (tecnica-da-lupa, PR #1231 / issue #1188):
  a skill is a legitimate `COMPATIBILITY_ALIAS` (`owner: meta-lupa`, `IS_SECOND_*=false`)
  but the guard lists it by name → red on all PRs. Fix: drop the name from the list +
  add a semantic guard (skip `redirect`/`COMPATIBILITY_ALIAS`, bar `IS_SECOND_*=true`).
  This is a MAIN-branch workflow fix → needs PERMITO-SEGREDO + explicit go (HUMAN_FRONTIER);
  open a PR, never push main directly.
- **pull_request_target runs on BASE branch (main), not PR branch** — Critical structural insight:
  Workflows with `on: pull_request_target` execute in the context of the BASE branch (usually `main`),
  NOT the PR branch. This means fixes in the PR branch do NOT affect these workflow runs.
  The PR branch fix only applies to workflows triggered by `pull_request`, `push`, or `workflow_run`.
  
  **Diagnosis**: If `pull_request_target` gates fail but the PR branch has the fix,
  check if the failing workflow uses `pull_request_target`. If yes, the fix must be
  applied to the BASE branch (main), typically via a separate hotfix PR or by ensuring
  the fix is merged to main first.
  
  **Pattern observed**: PR #1381 had all fixes on branch `5ce6e667e`, but
  `pr-learning-artifact` and `porta-de-entrada` (both `pull_request_target`) ran on
  `main@0542cee` without the fix. The `workflow_run` chain (judge→promote) ran on
  the PR branch and passed.
  
  **Remediation**: Either (a) push fix to main via separate PR, or (b) adjust promoter
  to not require `pull_request_target` gates for PR-branch-only validation, or
  (c) use `workflow_run` chain for PR-branch validation and treat `pull_request_target`
  as main-branch health check only.

## Pitfalls
- Do NOT rebase/repeat a fix across every red PR when the cause is base-branch.
  One gate/main fix clears all of them (REUSE_BEFORE_CREATE, ONE_WRITER_PER_SCOPE).
- A red X in `gh pr view` may show the PREVIOUS run (old head). Filter checks by
  `detailsUrl` run id, or wait for the new run to flip. `mergeable: UNKNOWN` right after
  push is transient — re-query.
- Don't read runner-busy as "CI broken" — it is saturation, not failure.
- Host Python may be an MSYS/Store alias with no interpreter; for shell-logic gates use
  `bash -c` to replicate the workflow step instead of invoking its python steps.
- CI red may be a RUNNER ENVIRONMENT issue, not a code/branch bug: self-hosted runners
  may lack `python` (only have `python3`), or have an MSYS/Store alias that resolves to
  nothing. Diagnose by reading the failed run log: `python: command not found` (exit 127)
  means the runner environment is the cause, not the PR diff. Fix the workflow to use
  `python3` (or the correct interpreter available on the runner), NOT the PR.

## Contraproof gate (acceptance)
A gate fix is accepted ONLY when local sim shows:
- fixed-state PASS (exit 0)
- planted-violation FAIL (exit 1)
Then push + let the runner confirm mechanically.

## Pitfall — structural fix or green proxy is not runtime proof

A structural change that makes a local test pass, or a CI run that appears green from a proxy (component alive, job queued, prior head), is not the same as proven runtime behavior for the real target.

Do not treat any of these as fixed point on their own:

- local test green with no runner/execution evidence
- a service or component reporting healthy from one probe
- a CI status line without reading the actual failed/passing step log
- truncated command output that was never fully observed

Before declaring a gate resolved, separate three things:

1. **What changed structurally** — file, configuration, or gate logic.
2. **What was actually executed** — full command output, full step log, full run.
3. **What still depends on an external verdict** — runner, provider, service, or human authorization.

If the observable evidence stops before the real execution, say so explicitly instead of rounding the partial result into "green" or "done".

Regra prática:

```text
RESUMO_PARTIAL != VERDADE_EXECUTADA
ESTRUTURA_VERDE_LOCAL
!= GATE_VERDE_RODANDO

CI_PODE_MOSTRAR_VERDE_QUE_O_TESTE_REAL_NAO_TEM
SE_O_OUTPUT_FOI_CORTADO
→ NÃO DECLARA PASS
→ RELEVANTE COMPLETA OU DECLARE DESCONHECIDO
```

## Support files (this skill)
- `references/gate-red-on-all-prs-recipe.md` — condensed recipe bank of Case A (submodule->dir) and Case B (alias in forbidden list), with exact commands + contraproof.
- `references/finalization-enforcement-test-fixes.md` — recipe bank for `finalization-enforcement.test.mjs` T14 failures (ledger swallow + `set -o pipefail` semicolon), with minimal fixes + contraproof.
- `references/pr-content-vs-mission-check.md` — new reference for cross-session PR gate diagnosis and command patterns.
- `references/pull-request-target-base-branch.md` — critical insight: `pull_request_target` runs on BASE branch, not PR branch.
- `references/truncated-output-is-not-proof.md` — green status line without full log ≠ proof.
- `references/offline-runner-gate-pattern.md` — when ALL gates show pending/skipping, check runner first; local contraproof pattern.
- `scripts/check-lupa-guard-local.sh` — deterministic local replica of the drift-guard "MetaLupa canônica" step; run from a PR-head worktree to prove PASS (alias allowed) and FAIL (planted IS_SECOND_*=true) without the runner.
