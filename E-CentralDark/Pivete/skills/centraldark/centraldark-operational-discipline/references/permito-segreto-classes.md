# PERMITO-SEGREDO Classes

**Session:** 05/09/2026 — CHEFE crystallized MICRO_DEPLOY and DEPLOY classes.

## Authority

PERMITO-SEGREDO is the authority label. No new label was created. The two classes are:

- MICRO_DEPLOY — menor escopo causal, alvo explícito, rollback pronto
- DEPLOY — deploy completo/promocional quando o escopo exige

## Gate Requirements (with class defined)

When CENTRALDARK_ACTION_CLASS is set, the gate requires:

PERMITO_SEGREDO_LABEL != CARTA_BRANCA
CENTRALDARK_ACTION_CLASS=MICRO_DEPLOY|DEPLOY
CENTRALDARK_INTENT_AUTHORIZED=true
CENTRALDARK_DEPLOY_TARGET=<alvo>
CENTRALDARK_ROLLBACK_READY=true

Without a class defined, the label gate maintains the old behavior (no extra requirements beyond the label itself).

## Invariants

PERMITO_SEGREDO_LABEL != CARTA_BRANCA
MICRO_DEPLOY != DEPLOY
DEPLOY != MERGE
DEPLOY != FORCE_PUSH
UNKNOWN != PASS
ROLLBACK_REQUIRED=true
MINIMUM_SCOPE_FIRST=true

## Implementation

- Gate: scripts/lupa/label-gate.mjs — adds deterministic action-class gate
- Runner: scripts/lupa/label-gate-run.mjs — consumes the 4 variables when a caller requests deploy authorization
- Learning crystal: docs/CONSCIENCIA/APRENDIZADOS/2026-09-05-PERMITO-SEGREDO-DEPLOY-CLASSES.md
- PR: #1430 (3 commits ahead of main)

## Residual

RUNTIME_WORKFLOW_CONSUMPTION=NOT_YET_PROVEN — the rule is in the motor candidate; CI green is still needed to prove runtime consumption. This is NOT a failure.

## Wiring

The 4 CENTRALDARK variables are wired into existing deploy workflows:
- .github/workflows/auto-pr-and-deploy.yml → CENTRALDARK_ACTION_CLASS=MICRO_DEPLOY
- .github/workflows/autonomia-promocao.yml → CENTRALDARK_ACTION_CLASS=DEPLOY

No new workflow was created — reuse of existing deploy workflows per REUSE_BEFORE_CREATE.

## Badge Fabric

PR#1431 (Badge Fabric) provides the visible state badge system for all workflows, branches, and PRs.

## Reference

See centraldark-operational-discipline Regra 84d for the wiring pattern and centraldark-master-funnel-autonomo for the AUTO-BOOT section.
