# COMANDO - automerge-decomp.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_meteor-decomp-develop\meteor-decomp-develop\.github\workflows\automerge-decomp.yml
**SHA:** 9cd5d68335b9b062
**Timestamp:** 2026-08-28T11:50:47.859027
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |
- run: |
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Auto-merge agent decomp PRs

# Auto-merges well-formed, agent-produced decomp PRs into develop so a
# contributor never has to click "merge" by hand — the second half of the
# issue #11 hands-off loop (the first half is the agent's claim -> match -> PR).
#
# WHAT IT WILL MERGE — every one of these must hold, or the PR is NOT merged:
#   * base branch is `develop`
#   * head branch matches `agents/*` (the agent's per-function branches)
#   * the PR author IS the repository owner (your own agent identity only;
#     external-fork contributions always fall through to human review)
#   * the PR is not a draft
#   * the diff ADDS exactly one file matching
#     src/<bin>/_rosetta/FUN_<hex>.cpp — a single clean match, no edits, no
#     deletions, no extra files
#
# A PR that reaches the job (the owner's own non-draft agents/* PR into develop)
# but fails the structural lint is left for a human and labelled `needs-review`.
# A PR that does not even match the job gate (a fork, a draft, a non-agents/*
# branch, or another author) is simply ignored by this workflow and never
# merged — it gets no label because no review is needed from THIS automation.
#
# OWNER ASSUMPTION — the author==owner gate assumes a single-operator, USER-owned
# repo (PRs authored by the same login that owns the repo). If the repo is ever
# transferred to an org, or the agent opens PRs under a dedicated bot account,
# replace the equality with an allow-list of trusted logins (see the job `if:`).
#
# WHAT IT CANNOT DO — it does NOT re-grade GREEN. orig/<bin>.exe and
# config/<bin>.symbols.json are Square-Enix-copyright and .gitignored, so they
# are absent in CI and `make diff` cannot run here. Auto-merge therefore TRUSTS
# the agent's local GREEN gate (the worker commits a _rosetta file ONLY when
# `make diff` is byte-identical) and adds the structural lint above as the
# CI-side guard. The lint is a safety net against malformed PRs, not a proof of
# correctness.
#
# SECURITY — `pull_request_target` runs in the BASE-repo context and so has
# secrets (CLAIMS_BOT_TOKEN); it is the dangerous trigger. This workflow
# therefore NEVER checks out or executes the PR HEAD code. It reads only event
# metadata and the diff file LIST (an API call), then merges by PR number. No
# fork-controlled code ever runs with the secret in scope.
#
# TOKEN — the merge uses CLAIMS_BOT_TOKEN (a PAT), not GITHUB_TOKEN, on purpose:
# a GITHUB_TOKEN merge would NOT re-trigger reconcile.yml (GitHub suppresses
# workflow runs caused by GITHUB_TOKEN pushes), so the progress docs would never
# refresh. A PAT merge fires reconcile.yml exactly as a manual merge does.

on:
  pull_request_target:
    types: [opened, reopened, synchronize, ready_for_review]
    branches: [develop]

# One run per PR; never cancel (an opened+synchronize pair should both settle).
concurrency:
  group: automerge-${{ github.event.pull_request.number }}
  cancel-in-progress: false

# Governs only the default GITHUB_TOKEN, which we use solely to READ the diff
# file list. Every mutation (merge / label / comment) uses CLAIMS_BOT_TOKEN.
permissions:
  contents: read
  pull-requests: read

jobs:
  automerge:
    # Cheap event-metadata gate — all base-repo-trusted fields, never PR file
    # content. Only the owner's own agent/* PRs into develop get this far.
    if: >-
      github.event.pull_request.base.ref == 'develop' &&
      github.event.pull_request.draft == false &&
      startsWith(github.event.pull_request.head.ref, 'agents/') &&
      github.event.pull_request.user.login == github.repository_owner
    runs-on: ubuntu-latest
    steps:
      - name: Check for the merge bot token
        id: token
        env:
          CLAIMS_BOT_TOKEN: ${{ secrets.CLAIMS_BOT_TOKEN }}
        run: |
          set -euo pipefail
          if [ -z "${CLAIMS_BOT_TOKEN:-}" ]; then
            echo "::warning::CLAIMS_BOT_TOKEN is not set — cannot auto-merge."
            echo "present=false" >> "$GITHUB_OUTPUT"
          else
            echo "present=true" >> "$GITHUB_OUTPUT"
          fi

      - name: Ensure the needs-review label exists
        if: steps.token.outputs.present == 'true'
        env:
          GH_TOKEN: ${{ secrets.CLAIMS_BOT_TOKEN }}
          REPO: ${{ github.repository }}
        run: |
          # Idempotent: --add-label later silently no-ops if the label is absent.
          gh label create needs-review --repo "$REPO" \
            --color FBCA04 --description "Auto-merge declined; left for a human" 2>/dev/null || true

      - name: Structural lint (API-only — never checks out the PR head)
        id: lint
        if: steps.token.outputs.present == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
          REPO: ${{ github.repository }}
          PR: ${{ github.event.pull_request.number }}
        run: |
          # No -e: errors are handled explicitly so a transient API failure
          # routes to needs-review (an empty `ok` would match no downstream if:).
          set -uo 
```