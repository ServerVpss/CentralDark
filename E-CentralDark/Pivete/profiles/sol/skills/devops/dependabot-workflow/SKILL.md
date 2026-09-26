---
name: dependabot-workflow
description: "Dependabot rebase loop: recreate and manual fallback."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [GitHub, Dependabot, Pull-Requests, CI/CD]
    related_skills: [github-pr-workflow, centraldark-ci-reconciliation]
---

# Dependabot Workflow

Operational guide for dependency update PRs created by GitHub Dependabot: lifecycle, the rebase-loop anti-pattern, the `recreate` escape hatch, and the manual fallback when `@dependabot` commands stop responding.

## When to use

- A dependabot PR is stuck: repeated `@dependabot rebase` produces merge commits and dependabot replies "edited by someone other than Dependabot".
- A dependabot PR has drifted commits (merge commits from rebase attempts) and you need a clean history.
- You need to decide between `@dependabot recreate`, manual branch reset, or letting it ride.

## Anatomy of a dependabot PR

A healthy dependabot PR has:
- One commit: the version bump (package.json + lockfile, or equivalent).
- Base = main (or the dependabot config target).
- Diff limited to dependency files.

A broken dependabot PR accumulates:
- Merge commits from repeated `@dependabot rebase` attempts.
- Possibly manual edits from a human or another agent.

## The rebase loop (anti-pattern)

**Trigger:** `@dependabot rebase` is invoked on a PR that has already been rebased (or edited) outside Dependabot.

**Mechanism:**
1. `@dependabot rebase` creates a merge commit bringing main into the PR branch.
2. Dependabot sees commits it did not create and flags: "Looks like this PR has been edited by someone other than Dependabot. That means Dependabot can't rebase it."
3. Another `@dependabot rebase` repeats step 1 → more merge commits → same refusal.
4. Loop: human/agent retries rebase → Dependabot refuses → retry → repeat.

**Diagnosis:**
```bash
gh pr view N --json commits --jq '.commits[] | .messageHeadline'
# Look for "Merge branch 'main' into ..." commits that Dependabot did not author.
# If present and repeated, you are in the loop.
```

**Escape hatch — `@dependabot recreate`:**
- Destroys the existing branch and recreates it from scratch.
- Overwrites any edits made outside Dependabot.
- Produces a clean single-commit PR.
- **Not automatic:** only fire when you accept losing external edits on that PR.

```bash
gh pr comment N --body "@dependabot recreate"
```

After firing, wait for Dependabot to act (can be minutes). Verify:
```bash
gh pr view N --json commits --jq '.commits | length'
# Should drop to 1 after recreate completes.
```

## Manual fallback (when `@dependabot recreate` does not resolve)

If `@dependabot recreate` is fired and the PR still has the old dirty history after a reasonable wait, or if Dependabot does not process the command at all:

1. Fetch the clean target (main) and the desired new version.
2. Reset the branch to main: `git fetch origin main && git reset --hard origin/main`.
3. Apply only the dependency bump (edit package.json / lockfile as Dependabot would).
4. Regenerate the lockfile cleanly if the ecosystem requires it (e.g. `npm install`, `pip compile`).
5. Commit the bump as a single clean commit.
6. Force-push to the Dependabot branch: `git push --force-with-lease origin BRANCH`.
7. Rebase-merge will then see a clean history.

**Safety:**
- This is safe for pure dependency bumps where the diff is limited to package manifests and lockfiles.
- Do NOT force-push a Dependabot branch that has meaningful human-authored commits you intend to keep — use `@dependabot recreate` instead, or open a fresh PR.
- Prefer `@dependabot recreate` first; manual reset is the fallback when the command channel is unresponsive.

## Classify the state before acting

| State | Action |
|---|---|
| Single clean bump commit, CI green | Ready to merge (subject to repo policy). |
| Merge commits from `@dependabot rebase` only | `@dependabot recreate` → verify → merge. |
| External edits present that must be preserved | Do NOT recreate; merge as-is or open new PR. |
| `@dependabot recreate` fired, no resolution after wait | Manual branch reset + force-push. |
| CI red for unrelated reason | Treat as normal CI failure (see `github-pr-workflow`, `centraldark-ci-reconciliation`). |

## Interaction with other PR tooling

- Labels, reviewers, and CI are orthogonal to the Dependabot rebase loop. Fix the history first, then re-evaluate CI/labels.
- If the repo enforces branch protections or required reviews, the same history fix applies; Dependabot commands do not bypass those gates.
- For repos with auto-merge on Dependabot PRs, a dirty history can block auto-merge — clean it to unblock.

## Falha causada pela própria automação (caso novo)

Nem todo CI vermelho no dependabot exige correção do PR. Às vezes o workflow está tentando fazer algo que o GitHub bloqueia e derruba o CI por conta própria.

### Caso: HTTP 422 no passo de aprovação (repo privado)

**Sintoma exato:**
```
Unprocessable Entity: "GitHub Actions is not permitted to approve pull requests"
  at fetchWrapper (.../actions/github-script/.../index.js:61511)
```

Onde aparece:
- Passo que executa `await github.rest.pulls.createReview({ event: 'APPROVE', ... })`
- via `actions/github-script` ou `github-script` em qualquer step

Causa:
- Em repositório privado, o GitHub Actions não tem permissão para criar reviews via API (mesmo com `pull-requests: write`)
- O passo de aprovação é redundante quando o auto-merge já é feito via GraphQL (`enablePullRequestAutoMerge`)

O que NÃO fazer:
- Não adicionar retry, sleep, ou workaround — a operação não é permitida, não é transient
- Não assumir que o PR está problemático — o diff pode estar limpo, o CI vermelho é da automação

Correção:
- Remover o passo de aprovação (createReview APPROVE)
- O auto-merge via GraphQL (`enablePullRequestAutoMerge` com `mergeMethod: SQUASH`) não exige review prévio
- Validar que o workflow ainda habilita auto-merge para patches após remover o passo

Validação:
- CI deve passar em PR de dependabot real (quando surgir) com diff correto e sem o passo de aprovação
- YAML sintaticamente válido (validar com `yaml.safe_load` ou equivalente)

### Contrasinal importante

Nem todo CI vermelho exige correção do PR. Às vezes o problema é o mecanismo de aprovação/automação que tenta cuidar do PR.

Diagnóstico rápido:
1. Verificar se o CI falhou em step de aprovação/comment/review (não em gates de lint/build/test)
2. Se sim: proseguir com remoção do passo, não com correção do PR

Pitfall:
- Assumir que CI vermelho = PR problemático e começar a corrigir o código do PR sem investigar se a falha é na infra do workflow
- Adicionar lógica de retry ou bypass no lugar de remover o passo proibido

## References

- `github-pr-workflow` — general PR lifecycle (create, CI, merge).
- `centraldark-ci-reconciliation` — PR/CI red diagnosis, runner state, rebase with ours for ancestral conflicts (orthogonal to the Dependabot rebase-loop case).
- `references/workflow-python3-fix-pattern.md` — pattern for fixing `python: command not found` errors in workflows after dependency updates.

## Fixed point

A Dependabot PR is at fixed point when:
- History is a single clean bump commit (or the external edits you intended to keep).
- CI is green or the red is diagnosed and unrelated to history.
- No `@dependabot rebase` retry is required.

## Referências adicionais

- `references/acao-da-automacao-derrubando-ci.md` — catálogo de falhas de automação que derrubam CI sem relação com o PR (HTTP 422, rate limit, loop recursivo, permissão insuficiente)
