# 👑🪬 Runtime Preflight — canonical insertion points

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_HEAD=ce0c9e87b12a0186f06ab51d9fa8934ce042a651

## Owners inspected

1. docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml
   - mandatory_inheritance applies across engines;
   - hard guarantee already requires REAL_CONSUMER + POSITIVE_NEGATIVE_TEST + BLOCKING_GATE + RECEIPT.

2. docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
   - global_contract_enforcer.before_every_mutation already includes PREFLIGHT_PASS;
   - mutation_without_global_entry_gate=FAIL_CLOSED.

3. .agents/skills/centraldark-operational-method/SKILL.md
   - method is mandatory for CentralDark tasks;
   - all executors inherit the same operational method;
   - writer/mutation/reconciliation rules already live here.

## Decision

Bind the SAME existing RUNTIME-PREFLIGHT-LINT into these owners.

No new dispatcher.
No second preflight engine.
No v2/v3.
No duplicated logic.

## Desired invariant

BEFORE_MUTATION_DEPLOY_KILL_SYNC_RUNTIME_GREEN:
- load RUNTIME-PREFLIGHT-LINT;
- execute preflight-lint when command/probe/path context applies;
- FAIL_CLOSED on wrapper/probe/path defect;
- invalid probe never becomes fact;
- wrapper failure never becomes target failure.

## Boundary

This closes canonical inheritance/instruction binding.
It does not by itself prove every external connector/tool host calls the gate automatically.

RUNTIME_EXECUTOR_HARD_ENFORCEMENT remains UNKNOWN until real executor consumer is identified and tested.
