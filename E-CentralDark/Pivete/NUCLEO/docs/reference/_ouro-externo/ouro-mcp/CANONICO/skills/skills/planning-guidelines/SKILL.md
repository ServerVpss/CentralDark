---
name: planning-guidelines
description: Structured planning methodology for features, refactors, and architectural decisions. Use before starting complex work to ensure clear scope, testable criteria, and reversible steps.
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

## Integration
- Use before any multi-step work
- `grill-me` skill sharpens the plan
- `meta-lupa` validates assumptions
- `delta-simplify` reviews plan for waste

## Output
Plan document → `knowledge-compiler` if reusable pattern.
EOF
echo "planning-guidelines SKILL.md criado"