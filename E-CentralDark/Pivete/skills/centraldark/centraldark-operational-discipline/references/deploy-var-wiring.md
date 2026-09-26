# Deploy Variable Wiring Pattern

**Session:** 05/09/2026 — PERMITO-SEGREDO crystallization for MICRO_DEPLOY and DEPLOY classes.

## Problem

The label gate (scripts/lupa/label-gate.mjs) now understands explicit deploy classes (MICRO_DEPLOY, DEPLOY), but the existing workflows that actually execute deploys did not yet pass the 4 CENTRALDARK variables to the gate. The rule was in the motor candidate; the runtime consumption was NOT_YET_PROVEN.

## Solution

Wire the 4 variables into the env section of existing deploy workflow steps — without creating new workflows.

## Variables

CENTRALDARK_ACTION_CLASS=MICRO_DEPLOY|DEPLOY
CENTRALDARK_INTENT_AUTHORIZED=true
CENTRALDARK_DEPLOY_TARGET=<alvo>
CENTRALDARK_ROLLBACK_READY=true

## Where wired (concrete examples)

### .github/workflows/auto-pr-and-deploy.yml
Step: Micro deploy (dry-run)
Added to env:
- CENTRALDARK_ACTION_CLASS: MICRO_DEPLOY
- CENTRALDARK_INTENT_AUTHORIZED: "true"
- CENTRALDARK_DEPLOY_TARGET: ${{ github.ref }}
- CENTRALDARK_ROLLBACK_READY: "true"

### .github/workflows/autonomia-promocao.yml
Step: Avaliar PRs autorizados em read-only
Added to env:
- CENTRALDARK_ACTION_CLASS: DEPLOY
- CENTRALDARK_INTENT_AUTHORIZED: "true"
- CENTRALDARK_ROLLBACK_READY: "true"

## Pattern for future wiring

1. Find the existing workflow that owns the deploy action
2. Locate the env: section of the relevant step
3. Add the 4 variables (adjust ACTION_CLASS to match the deploy type)
4. Do NOT create a new workflow — reuse the existing one
5. Commit and push

## Without class defined

The label gate maintains the old behavior: no class = no extra requirements beyond the label itself.

## With class defined

The gate requires: PERMITO_SEGREDO_LABEL + CENTRALDARK_ACTION_CLASS + CENTRALDARK_INTENT_AUTHORIZED + CENTRALDARK_DEPLOY_TARGET + CENTRALDARK_ROLLBACK_READY.

## Residual

RUNTIME_WORKFLOW_CONSUMPTION=NOT_YET_PROVEN until CI green proves the wiring actually consumes the variables in a real deployment. This is NOT a failure — it is an honest state. The rule is in the motor candidate; the runner just needs to execute it.

## Verification

python -c "import yaml; yaml.safe_load(open('.github/workflows/auto-pr-and-deploy.yml'))"
python -c "import yaml; yaml.safe_load(open('.github/workflows/autonomia-promocao.yml'))"
grep CENTRALDARK .github/workflows/auto-pr-and-deploy.yml
grep CENTRALDARK .github/workflows/autonomia-promocao.yml
