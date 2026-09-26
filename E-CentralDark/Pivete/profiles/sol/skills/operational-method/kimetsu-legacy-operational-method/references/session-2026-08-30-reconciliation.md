# Session Learnings — 2026-08-30

## Executive Summary

Mission: `CASA_GITHUB_CARACOL_RECONCILIATION` — Full reconciliation of Casa ↔ Local Repo ↔ GitHub ↔ Main ↔ PR ↔ Agent Handoff.

## State Measurements (Before Any Mutation)

| Metric | Value |
|--------|-------|
| Local HEAD | `fcc7264b1` (fix T14 executor applied) |
| origin/main | `d75adecb5` (ahead) |
| Branch | `reconciliacao/casa-20260829-consolidacao` |
| PR #1369 | **ACTIVE MISSION** — 7 commits, mergeable, checks failing |
| PR #1370 | **ALREADY MERGED** — ancestral/proof/contract, DO NOT REOPEN |
| PR #1373 | docs/entrega-sagrada — 1 commit, checks failing |
| Worktrees | 14 active (several locked/prunable) |

## Test Results Summary

### ✅ PASSING (Local)
- CARACOL self-test / repo / graph — `denominator=4401`, `fragment_drop=0`, `duplicates=0`
- Runtime plug conformance — 11/11 checks PASS
- validar-mapa.test.mjs — 15/15 PASS
- provider-health.test.mjs — 47/47 PASS (T14 fixed!)
- label-gate.test.mjs — PASS
- validar-continuidade-global.mjs — PASS

### ❌ FAILING (Need Fixes)
1. **validar-identidade-operacional.test.mjs** — 1/40 fail: Windows path separator (`src\\adapter.ts` vs `src/adapter.ts`)
2. **label-gate-run.mjs** — requires `GITHUB_EVENT_PATH` (Actions-only)
3. **validar-porta-de-entrada.mjs** — 25 errors: ADAPTADOR_SEM_TOKEN, RECONCILIACAO_SEM_TOKEN, CANONICO_ORFAO
4. **agent-core-adapters.test.mjs** — 8/8 fail: Python not in MSYS PATH + double `E:\E:\` paths

## Fixes Applied This Session

### T14 Executor Fixes (Already Pushed)
- `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`:
  - `try/catch` real on `registrarNoLedger()` (was swallowing with `catch {}`)
  - Removed `;` after `set -o pipefail` to match test regex

### Pending Fixes
1. **validar-identidade-operacional.test.mjs:610** — Normalize path separators in assertion
2. **validar-porta-de-entrada.mjs** — Resolve 25 token/orphan errors (adapter mapping + canonical registry)
3. **agent-core-adapters.test.mjs** — Python in PATH + path resolution for MSYS

## Key Technical Insights

### CARACOL Traversal
- `denominator=4401` files (repo), `68` nodes (graph)
- `forward_visited=4401`, `reverse_visited=4401`, `fragment_drop=0`, `duplicates=0`
- `semantic_edges_created=0` ✅
- `traversal_sha256=8d8d27df0c5cd419808c8aba1b003a730a5cf100bfc247620f59ced6f6db7640` (repo)
- `traversal_sha256=ad7b7c2518cae016500bf0627a1b9155bd7def10597ee64245931632edab0508` (graph)
- Nucleus tail includes `LEIA-ME-IA.md`, `MAPA-DO-CEREBRO.md`, `CONSCIENCIA` — correct

### Runtime Plug Architecture
- Manifest validation, resource-fit, lease, swap A↔B all PASS
- Lease allows final unload, blocks early unload, idempotent ✅

### Authority Approval Gates
- Canonical label: `👑 PERMITO-SEGREDO` (github-label:permito-segredo)
- Intent receipt via PR body markers: `Intent-Authorized: SEGREDO/CHEFE`, `Merge-Policy: AUTO_SQUASH_IF_CLEAN`
- Material derivation BLOCKED: `DERIVED_AUTHORITY_DISABLED_MATERIAL_IS_NOT_AUTHORITY`

### FABLE JUDGE (Error Recurrence)
- 5 detectors mechanized: `padrao_proibido`, `delete_sem_recibo`, `commit_anuncia_prova_sem_conteudo`
- Counterproof forced 2 self-corrections on the judge itself
- Connected to `porta-de-entrada.yml` gate

## PR #1369 — Current Mission PR

**Commits on branch:**
1. `41f1f7e85` — docs(reconciliation): inventory of E:\CentralDark — SOBRA_BRAIN classified MIRROR_OR_DUPLICATE
2. `8900854ee` — Merge origin/main into branch
3. `2dd6a7273` — fix(hermes-core): restore finalization gate clobbered by stale VPS copy
4. `4253d9ace` — aprendizado: 13 erros do agente — opiniao usada como medicao
5. `328dfb027` — fix(reconciliation): remover canvas vazios entrados por git add -A cego
6. `a9e09a084` — aprendizado: E14 causa-da-causa — contrato de turno nunca cumprido
7. `e1e7e18d2` — feat(lupa): FABLE JUDGE de reincidencia
8. `fcc7264b1` — fix(executor): T14 aprender nao engole ledger + commit_push set -o pipefail

**Failing Checks:**
- `codex-validate` → Validate canonical map / Trigger Fabric Full Package
- `lupa-conformance` → Cartazes canônicos PASS, but guard FAIL
- `porta-de-entrada` → FAILURE (ADAPTADOR_SEM_TOKEN, CANONICO_ORFAO)
- `drift-guard` → FAILURE

## Next Actions (Priority Order)

1. **Fix validar-identidade-operacional path separator test** — trivial, unblocks identity gate
2. **Fix validar-porta-de-entrada 25 errors** — core gate, requires adapter token mapping + canonical registry
3. **Fix agent-core-adapters MSYS Python + paths** — requires python in PATH or test skip on Windows
4. **Push fixes to PR #1369** → re-run CI → verify all green
5. **Fixed Point validation** → same HEAD re-test → GitHub sync → FIXED_POINT_REPO=TRUE

## Commands for Next Session

```bash
# Continue from this exact state
cd /e/CentralDark/Pivete/CentralDark
git fetch origin --prune
git status
# Fix the 3 failing test suites
# Push to PR #1369
# Monitor CI
```