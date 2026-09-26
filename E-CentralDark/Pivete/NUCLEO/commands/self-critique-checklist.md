# COMANDO - self-critique-checklist.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\checklists\self-critique-checklist.md
**SHA:** 1a0433655aa463d0
**Timestamp:** 2026-08-28T02:02:17.268881
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - **Tests Re-run:** Yes (after fix)

### Ouro Bruto (primeiros 5000 chars)
```
# Self-Critique Checklist

> **Used By:** `plan-execute-subtask.md` (Coder Agent Steps 5.5 & 6.5)
> **Purpose:** Mandatory self-review checkpoints to catch issues before they propagate

---

## Overview

This checklist is executed TWICE during subtask execution:

1. **Step 5.5 (Post-Code):** After writing code, before running tests
2. **Step 6.5 (Post-Test):** After tests pass, before committing

Both phases are MANDATORY. Skipping them violates the Coder Agent workflow.

---

## Step 5.5: Post-Code Self-Critique

> **Trigger:** After Step 5 (Write Code) completes
> **Goal:** Catch bugs, edge cases, and security issues BEFORE running tests

### Checklist Items

```yaml
post_code_critique:
  - id: SC-5.5.1
    category: bugs
    question: 'Are there any predicted bugs in this code?'
    how_to_check:
      - Review logic flow for off-by-one errors
      - Check loop termination conditions
      - Verify correct operator usage (= vs ==, && vs ||)
      - Look for null/undefined dereferences
    action_if_found: 'Fix immediately before proceeding'
    severity: HIGH

  - id: SC-5.5.2
    category: edge_cases
    question: 'Have all edge cases been handled?'
    how_to_check:
      - Null/undefined inputs
      - Empty arrays/objects
      - Boundary values (0, -1, MAX_INT)
      - Empty strings vs null
      - Unicode and special characters
    action_if_found: 'Add guards or validation'
    severity: HIGH

  - id: SC-5.5.3
    category: error_handling
    question: 'Is error handling comprehensive?'
    how_to_check:
      - All async operations have try/catch
      - Error messages are user-friendly
      - Errors include context (what operation failed)
      - Errors don't expose sensitive info
      - Recovery paths are defined where possible
    action_if_found: 'Add appropriate error handling'
    severity: HIGH

  - id: SC-5.5.4
    category: security
    question: 'Are there any security vulnerabilities?'
    how_to_check:
      - Input validation present
      - SQL/NoSQL injection prevention
      - XSS prevention (output encoding)
      - Sensitive data not logged
      - Auth/authz checks in place
      - No hardcoded secrets
    action_if_found: 'Fix security issue immediately'
    severity: CRITICAL

  - id: SC-5.5.5
    category: resilience
    question: 'Does the code handle failure gracefully?'
    how_to_check:
      - Network failures handled
      - Timeouts configured
      - Retries where appropriate
      - User gets feedback on failure
      - Partial failures don't corrupt state
    action_if_found: 'Add failure handling'
    severity: MEDIUM
```

### Execution Process

```
1. PAUSE after writing code (Step 5 complete)
2. Re-read ALL code written in this subtask
3. For EACH checklist item:
   a. Ask yourself the question
   b. Use "how_to_check" to verify
   c. If issue found:
      - Document it
      - Fix immediately
      - Mark as fixed
4. If ANY issues were fixed:
   - Re-run this checklist from start
5. Only proceed when ALL items pass
```

### Pass Criteria

- [ ] SC-5.5.1: No predicted bugs (or all fixed)
- [ ] SC-5.5.2: Edge cases handled
- [ ] SC-5.5.3: Error handling comprehensive
- [ ] SC-5.5.4: No security vulnerabilities
- [ ] SC-5.5.5: Failure handling in place

---

## Step 6.5: Post-Test Self-Critique

> **Trigger:** After Step 6 (Run Tests) passes
> **Goal:** Ensure code quality, maintainability, and adherence to standards

### Checklist Items

```yaml
post_test_critique:
  - id: SC-6.5.1
    category: patterns
    question: 'Does the code follow existing patterns in the codebase?'
    how_to_check:
      - Compare with similar files in the project
      - Check naming conventions match
      - Directory structure follows conventions
      - Import style consistent
      - Error handling style matches existing
    action_if_found: 'Refactor to match patterns'
    severity: MEDIUM

  - id: SC-6.5.2
    category: configuration
    question: 'Are there any hardcoded values that should be configurable?'
    how_to_check:
      - Magic numbers (should be named constants)
      - URLs, endpoints (should be config/env)
      - Timeouts, limits (should be configurable)
      - Feature flags (should be toggleable)
      - API keys (MUST be env vars)
    action_if_found: 'Extract to constants/config/env'
    severity: HIGH

  - id: SC-6.5.3
    category: testing
    question: 'Are tests comprehensive enough?'
    how_to_check:
      - Happy path covered
      - Error/exception paths covered
      - Edge cases from 5.5.2 have tests
      - Boundary values tested
      - Integration points tested
    action_if_found: 'Add missing tests'
    severity: HIGH

  - id: SC-6.5.4
    category: documentation
    question: 'Is documentation updated where needed?'
    how_to_check:
      - JSDoc/TSDoc for public functions
      - Inline comments for complex logic
      - README updated if behavior changed
      - API docs if endpoints added/changed
      - Type definitions accurate
    ac
```