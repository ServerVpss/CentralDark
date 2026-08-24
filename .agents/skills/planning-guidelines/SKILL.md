---
name: planning-guidelines
description: Structured planning methodology for features, refactors, architectural decisions, and material infrastructure/production/security/deployment changes. Mandatory before material infra/runtime mutation planning; establishes explicit T0/T1 baseline, rollback, blast radius, and zero-regression scope before execution.
---

# Planning Guidelines

Structured methodology for planning work before execution.

## Planning Template

### 1. Problem Statement
- What is the user pain point or system gap?
- What is the current behavior vs desired behavior?
- What constraints exist (time, compat, resources)?

### 2. Scope Definition
- **In scope**: Explicit list of what will be done
- **Out of scope**: Explicit list of what will NOT be done
- **Interfaces affected**: APIs, DB schema, UI, config

### 3. Success Criteria (Testable)
- [ ] Criterion 1: measurable, binary pass/fail
- [ ] Criterion 2: ...
- [ ] Performance budget: latency, memory, cost
- [ ] Regression tests: specific paths that must not break

### 4. Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Risk 1 | High/Med/Low | High/Med/Low | Specific mitigation |
| ... | ... | ... | ... |

### 5. Reversibility Plan
- Rollback steps if criteria not met
- Feature flag / gradual rollout
- Data migration reversibility

### 5. Execution Plan
1. Step 1 → testable outcome
2. Step 2 → testable outcome
3. ...

### 6. Reversibility Checkpoint
After each step: verify criteria still met, else rollback.

## Zero-regression gate for infrastructure and material changes

For infrastructure, production, security, deployment, architecture, shared contracts, or any material cross-layer change, planning is fail-closed until the existing behavior has an explicit baseline and the proposed change is proven as the smallest compatible extension.

```text
ZERO_REGRESSION_SCOPE_MUST_BE_DECLARED=true
BASELINE_T0_REQUIRED=true
SAME_BASELINE_CHECKS_T0_T1_REQUIRED=true
MATERIAL_DEPENDENTS_MUST_BE_TESTED=true
UNKNOWN_MATERIAL_BLOCKS_PASS=true
REUSE_BEFORE_CREATE=true
EXTEND_EXISTING_BEFORE_NEW=true
NO_V1_V2_V3_V4=true
ROLLBACK_PATH_REQUIRED=true
ROLLBACK_UNTESTED_IS_NOT_PROOF=true
REALITY_IS_JUDGE=true
```

Mandatory order:

```text
RECOVER_LIVE_STATE
→ DECLARE_TARGET_AND_ZERO_REGRESSION_SCOPE
→ INVENTORY_EXISTING_OWNER_AND_CONSUMERS
→ CAPTURE_T0_BASELINE_WITH_TESTS
→ MAP_DEPENDENCIES_AND_BLAST_RADIUS
→ PROPOSE_SMALLEST_COMPATIBLE_EXTENSION
→ PROVE_ROLLBACK_PATH
→ EXECUTE_ONLY_IF_AUTHORIZED
→ RUN_THE_SAME_BASELINE_CHECKS_AT_T1
→ RUN_CHANGE_SPECIFIC_AND_MATERIAL_DEPENDENT_TESTS
→ COMPARE_T0_T1
→ COUNTERPROVE
→ PASS | CORRECT | REVERT | BLOCKED
```

`ZERO_REGRESSION=PASS` is forbidden without a declared applicable scope. It means only that every baseline check declared for that scope passed at T0 and still passes at T1, the intended new behavior passed its own checks, material dependents were covered, no material `UNKNOWN` remains, and the rollback path is still valid. It never means absolute absence of every possible regression in the universe.

```text
ZERO_REGRESSION_WITHOUT_SCOPE=INVALID_CLAIM
NEW_BEHAVIOR_PASS_WITH_BASELINE_FAIL=REGRESSION
T0_CHECKS_DIFFERENT_FROM_T1_WITHOUT_JUSTIFICATION=INVALID_COMPARISON
GREEN_STATUS_ONLY=INSUFFICIENT_PROOF
PLAN_WITHOUT_ROLLBACK_FOR_MATERIAL_MUTATION=BLOCKED
PARALLEL_REPLACEMENT_WHEN_EXTENSION_FITS=BLOCKED
```

For a material planning decision, if any of these prerequisites is missing, stop before mutation and report the exact missing prerequisite. Do not hide the gap behind confidence, a clean diff, a green panel, a model recommendation, or human confidence.

## Integration
- Use before any multi-step work
- **Mandatory before material infrastructure / production / security / deployment planning**
- `grill-me` skill sharpens the plan
- `meta-lupa` validates assumptions
- `delta-simplify` reviews plan for waste
- Reuse `!EXECUÇÃO_REVERSÍVEL` before mutation and `!REMEDIÇÃO` after mutation; do not create a parallel zero-regression protocol

## Output
Plan document → `knowledge-compiler` if reusable pattern.
