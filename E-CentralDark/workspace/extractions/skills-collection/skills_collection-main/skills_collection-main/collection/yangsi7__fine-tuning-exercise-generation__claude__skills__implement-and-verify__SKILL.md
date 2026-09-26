---
name: implement-and-verify
description: Implement tasks from plans with test-first approach, user-story-centric execution, and AC verification. Use proactively when executing implementation plans. Enforces quality gates, MVP-first delivery, and Article VII story-by-story implementation.
degree-of-freedom: low
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

@.claude/shared-imports/constitution.md
@.claude/templates/verification-report.md
@.claude/templates/quality-checklist.md

# Implementation & Verification Skill

## Overview

This skill executes implementation plans following Specification-Driven Development (SDD) principles: quality gates, test-driven development (TDD), user-story-centric execution, and progressive delivery.

**Constitutional Authority**: Article III (Test-First), Article V (Template-Driven Quality), Article VII (User-Story-Centric Organization)

**Core Principles**:
1. **Quality Gates First**: Validate readiness before implementation (Article V)
2. **Story-by-Story**: Implement user stories in priority order (Article VII)
3. **Test-First**: Tests BEFORE implementation, ALL ACs verified (Article III)
4. **Progressive Delivery**: Each story is shippable when complete (Article VII)

**Announce at start:** "I'm using the implement-and-verify skill to execute this plan with SDD quality gates."

## Quick Reference

| Phase | Key Activities | Output | Article |
|-------|---------------|--------|---------|
| **0. Quality Gates** | Validate spec readiness, check constitution | Gate pass/fail | Article V |
| **1. Story Selection** | Load tasks by story (P1, P2, P3) | Story tasks | Article VII |
| **2. Progressive Delivery** | Define MVP, plan incremental shipping | Delivery plan | Article VII |
| **3. Load Tasks** | Read plan, verify dependencies per story | Task selected | Article IV |
| **4. Write Tests** | Create tests from ACs (should FAIL) | Test files | Article III |
| **5. Implement** | Write code to make tests pass | Implementation | Article III |
| **6. Verify** | Run all tests, lint, build | verification-report.md | Article V |
| **7. Update** | Mark complete, handover if needed | Updated plan | Article V |

## Templates You Will Use

- **@.claude/shared-imports/constitution.md** - Architectural principles (all phases)
- **@.claude/templates/quality-checklist.md** - Pre-implementation gates (Phase 0)
- **@.claude/templates/plan.md** - Input plan with tasks and ACs (Phase 3)
- **@.claude/templates/verification-report.md** - Verification results (Phase 6)
- **@.claude/templates/handover.md** - For blocked tasks or agent transitions (Phase 7)

## The Process

Copy this checklist to track progress:

```
SDD Implementation Progress:
- [ ] Phase 0: Quality Gates Validated (constitution check)
- [ ] Phase 1: Story Tasks Loaded (by priority)
- [ ] Phase 2: Progressive Delivery Planned (MVP defined)
- [ ] Phase 3: Tasks Loaded (dependencies verified)
- [ ] Phase 4: Tests Written (from ACs, should FAIL)
- [ ] Phase 5: Implementation Complete
- [ ] Phase 6: Verification Complete (ALL ACs pass)
- [ ] Phase 7: Plan Updated (story marked complete)
```

---

## Phase 0: Quality Gate Validation

**MANDATORY**: Check quality checklists before implementation.

**Constitutional Authority**: Article V (Template-Driven Quality)

### Step 0.1: Load Quality Checklist

Read `.claude/templates/quality-checklist.md`

### Step 0.2: Validate Feature Readiness

Check:
- [ ] All [NEEDS CLARIFICATION] markers resolved (max 0)
- [ ] All user stories have ≥2 acceptance criteria
- [ ] All ACs are testable and measurable
- [ ] Technical plan exists with constitution check
- [ ] Tasks organized by user story

**Example Validation**:
```markdown
Feature: 003-user-authentication

✓ Content Quality: PASS (no tech details in spec.md)
✓ Requirement Completeness: PASS (all ACs in Given/When/Then format)
✗ Feature Readiness: FAIL
  - User Story P2 has only 1 AC (need ≥2)
  - 2 [NEEDS CLARIFICATION] markers in spec.md
```

### Step 0.3: User Override Option

If validation fails:
```
⚠ Quality checklist incomplete:
- 2 [NEEDS CLARIFICATION] markers in spec.md
- User Story P2 has only 1 AC (need ≥2)

Proceed anyway? (yes/no)
```

**If no**: Block implementation, suggest fixes
**If yes**: Log override, continue with warning

**Enforcement**:
- [ ] Quality checklist loaded
- [ ] All gates checked
- [ ] User override logged if bypassed

---

## Phase 1: Story-by-Story Execution

**Article VII Mandate**: Implement user stories in priority order, verify each independently.

### Step 1.1: Load Tasks by Story

From tasks.md:
- Phase 3: User Story P1 tasks
- Phase 4: User Story P2 tasks
- Phase 5: User Story P3 tasks

**Example**:
```markdown
## Phase 3: User Story P1 - Email/Password Registration

**Story Goal**: Users can create accounts with email and password

**Independent Test**: Can register new user, receive session token, login with credentials

**Dependencies**: Phase 2 (foundational) complete

### Tests
- [ ] T008 [P] [US1] Write test for AC-P1-001
- [ ] T009 [P] [US1] Write test for AC-P1-002

### Implementation
- [ ] T010 [US1] Enhance User model with password_hash
- [ ] T011 [US1] Create AuthService.register()
- [ ] T012 [US1] Implement POST /api/auth/register

### Verification
- [ ] T015 [US1] Run AC tests (must pass 100%)
- [ ] T016 [US1] Test registration flow end-to-end
- [ ] T017 [US1] Verify story works independently
```

### Step 1.2: Implement P1 Story

Execute all tasks for User Story P1:
1. Tests (Article III: tests first)
2. Implementation (minimal code to pass tests)
3. Verification (all P1 ACs pass)

### Step 1.3: Validate P1 Independently

**Independent Test**: Can P1 be demoed without P2/P3?

Verify:
- All P1 tests pass
- P1 can be used standalone
- No dependencies on incomplete stories

### Step 1.4: Report P1 Completion and Verify Story

**After completing P1 implementation**, report status and automatically verify the story:

```
✓ User Story P1 Complete

Tasks: 10 of 10 (100%)
Tests: 2 of 2 passing (100%)
ACs: 2 of 2 verified (100%)

Independent Test: PASS
- Can register new user
- Can login with credentials
- Feature works standalone
```

**Automatic Story Verification**:

Instruct Claude to run: `/verify $PLAN_FILE --story P1`

This validates (Article VII - Progressive Delivery):
- All P1 tests pass independently (100%)
- P1 can be demoed standalone (no dependencies on P2/P3)
- No blocking dependencies on incomplete stories
- Independent test criteria met

**Expected Verification Output**:
```
✓ Story P1 Verification PASSED

Tests: 8/8 passing (100%)
ACs: 4/4 verified (100%)
Independent Test: PASS (story works standalone)
Can Ship: YES

Next: Implement P2 story or ship P1 as MVP
```

**If Verification Fails**:
```
✗ Story P1 Verification FAILED

Tests: 6/8 passing (75%)
ACs: 3/4 verified (75%)
Failures:
- AC-P1-003: Weak password validation failing

Action:
1. Fix failing tests using debug-issues skill
2. Re-run /verify plan.md --story P1
3. Only proceed to P2 after P1 passes
```

**Only proceed to next story after P1 verification passes** (Article VII mandate)

### Step 1.5: Repeat for P2, P3, etc.

**Same process for each story**:
1. Implement all story tasks
2. Verify story independently (run `/verify $PLAN_FILE --story P2`, `/verify $PLAN_FILE --story P3`, etc.)
3. Report completion
4. Only proceed to next story after current story verification passes

**Example for P2**:
```
✓ User Story P2 Complete

Automatic verification: /verify plan.md --story P2

✓ Story P2 Verification PASSED
Tests: 12/12 passing (100%)
ACs: 5/5 verified (100%)
Independent Test: PASS

Next: Implement P3 story
```

**Progressive Delivery Pattern** (Article VII):
- P1 verified → ship MVP or continue to P2
- P2 verified → ship enhancement or continue to P3
- P3 verified → ship final feature or iterate

Each story must pass verification before proceeding to the next

**Enforcement**:
- [ ] Stories implemented in priority order
- [ ] Each story verified independently
- [ ] No story marked complete without 100% ACs passing

---

## Phase 2: Progressive Delivery

**Article VII Principle**: Each story is shippable when complete.

### Step 2.1: MVP Definition

**MVP = User Story P1 complete and verified**

At P1 completion:
- Feature has minimum viable value
- Can be shipped to users
- Independent of P2/P3 stories

### Step 2.2: Incremental Value

Each story adds incremental value:
- P1: Core functionality (MVP)
- P2: Enhancement to P1 (better, not necessary)
- P3: Nice-to-have (future iteration)

### Step 2.3: Ship-When-Ready

After each story verification:
- Option to ship (if P1)
- Option to demo (any story)
- Option to continue (next story)

**Example**:
```
✓ User Story P1 verified independently

Options:
1. Ship MVP now (P1 is complete and working)
2. Continue to P2 (add enhancements)
3. Demo P1 to stakeholders first

Recommendation: Ship P1 as MVP, iterate with P2/P3 based on feedback
```

**Enforcement**:
- [ ] MVP defined (P1 complete = shippable)
- [ ] Each story independently demostrable
- [ ] Shipping options presented after each story

---

## Phase 3: Load Tasks

Read **@.claude/templates/plan.md** file and:

1. **Verify dependencies met:**
   ```markdown
   Task T2 depends on T1
   - [ ] Check T1 status = "completed"
   - [ ] If not complete: BLOCK T2, notify user
   ```

2. **Select next task:**
   - Pick lowest-numbered pending task with dependencies met
   - Or user-specified task

3. **Extract ACs:**
   ```markdown
   ### Task 1: Add OAuth Database Schema
   **Acceptance Criteria:**
   - [ ] AC1: users table has google_id VARCHAR(255) column
   - [ ] AC2: Migration runs without errors
   - [ ] AC3: google_id is nullable
   ```

**Enforcement:**
- [ ] All task dependencies verified
- [ ] Task has minimum 2 ACs
- [ ] ACs are testable

### Phase 4: Write Tests FIRST

**CRITICAL:** Write tests from ACs BEFORE implementing. Tests should FAIL initially.

#### Test-First Workflow

```
For each AC → Write test → Test FAILS → Implement → Test PASSES
```

**Example:**

**AC1:** "users table has google_id VARCHAR(255) column"

**Test (should FAIL initially):**
```typescript
// migrations/002_add_google_id.test.ts
describe('Add google_id column migration', () => {
  it('AC1: adds google_id VARCHAR(255) column to users table', async () => {
    await runMigration('002_add_google_id')

    const schema = await db.getTableSchema('users')
    const googleIdCol = schema.columns.find(c => c.name === 'google_id')

    expect(googleIdCol).toBeDefined()
    expect(googleIdCol.type).toBe('VARCHAR(255)')
  })
})
```

**Run test (should FAIL):**
```bash
npm test migrations/002_add_google_id.test.ts
# FAIL: Column 'google_id' not found
```

✓ **Test failure proves test is valid** - if it passed without implementation, test would be useless!

#### Test Coverage Requirement

**1:1 mapping between ACs and tests:**
```markdown
AC1 → Test 1 (testAddGoogleIdColumn)
AC2 → Test 2 (testMigrationRunsWithoutErrors)
AC3 → Test 3 (testGoogleIdNullable)

Coverage: 3/3 ACs = 100% ✓
```

**Enforcement:**
- [ ] Every AC has corresponding test
- [ ] All tests initially FAIL
- [ ] Tests are specific (not generic)

### Phase 5: Implement

Now implement code to make tests pass.

#### Implementation Guidelines

**Minimal implementation:**
- Write simplest code to pass tests
- Don't over-engineer
- Follow YAGNI (You Aren't Gonna Need It)

**Example:**

```sql
-- migrations/002_add_google_id.sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL;
```

```bash
# Run tests again (should PASS now)
npm test migrations/002_add_google_id.test.ts
# PASS: All 3 tests pass ✓
```

**If tests still fail:**
1. Debug using analyze-code skill
2. Fix implementation
3. Re-run tests
4. Repeat until all pass

**Enforcement:**
- [ ] Implementation is minimal (YAGNI)
- [ ] Follows project conventions
- [ ] All tests pass

### Phase 6: Verify Against ACs

Run complete verification using **@.claude/templates/verification-report.md**

#### Verification Checklist

```markdown
## AC Verification

### Task 1: Add OAuth Database Schema

#### AC1: users table has google_id VARCHAR(255) column
- **Test:** testAddGoogleIdColumn
- **Status:** ✓ PASS
- **Evidence:** Test output shows column exists with correct type

#### AC2: Migration runs without errors
- **Test:** testMigrationRunsWithoutErrors
- **Status:** ✓ PASS
- **Evidence:** Migration completes with exit code 0

#### AC3: google_id is nullable
- **Test:** testGoogleIdNullable
- **Status:** ✓ PASS
- **Evidence:** Schema shows NULL constraint

**Coverage:** 3/3 ACs = 100% ✓
```

#### Additional Checks

Beyond AC tests, also run:

```bash
# Lint checks
npm run lint

# Type checks (if TypeScript)
npm run type-check

# Build
npm run build

# Integration tests
npm run test:integration
```

#### Handling Failures

**If ANY AC fails:**

```markdown
Status: BLOCKED ❌

Failing: AC2 (Migration runs without errors)
Error: "Column google_id already exists"

Action:
1. Use analyze-code skill to debug
2. Fix issue
3. Re-run verification
4. DO NOT mark task complete until 100% pass
```

**If unfixable after debugging:**
1. Create **@.claude/templates/handover.md**
2. Document blocker
3. Mark task as "blocked"
4. Handover to appropriate agent

**Enforcement:**
- [ ] ALL ACs verified (100% coverage)
- [ ] All ACs pass
- [ ] Lint passes
- [ ] Build succeeds
- [ ] No task marked complete with failures

### Phase 7: Update Plan & Handover

#### Update plan.md

```markdown
### Task 1: Add OAuth Database Schema
- **ID:** T1
- **Status:** ✓ completed  # ← Update this
- **Completed:** 2025-10-19T15:30:00Z
- **Verified by:** executor-agent

**Acceptance Criteria:**
- [x] AC1: users table has google_id column ✓
- [x] AC2: Migration runs without errors ✓
- [x] AC3: google_id is nullable ✓
```

#### Generate Verification Report

Use **@.claude/templates/verification-report.md**:

```markdown
---
plan_id: "plan-oauth-implementation"
status: "pass"
verified_by: "executor-agent"
timestamp: "2025-10-19T15:30:00Z"
---

# Verification Report: Task T1 Complete

## Test Summary
- Total ACs: 3
- Passed: 3 ✓
- Failed: 0
- Coverage: 100%

## AC Coverage
[Detailed results for each AC]

## Recommendations
None - all ACs passed, ready for next task
```

**File naming:** `YYYYMMDD-HHMM-verification-<task-id>.md`

#### Generate Handover (if needed)

**When to create handover:**
- Task blocked on external dependency
- Need different agent (e.g., analyzer for debugging)
- Phase complete, moving to next phase

Use **@.claude/templates/handover.md**:

```markdown
---
from_agent: "executor-agent"
to_agent: "code-analyzer"
chain_id: "oauth-implementation"
timestamp: "2025-10-19T15:30:00Z"
---

# Handover: Task T1 Complete → T2 Ready

## Essential Context
- Completed: T1 (OAuth database schema)
- Next: T2 (OAuth flow implementation)
- Blocker: Need to analyze existing session.ts before implementing

## Pending
- T2: Implement OAuth flow
- T3-T7: Remaining tasks

## Blockers
None for T1. T2 needs analysis of existing auth system.

## Intel Links
- src/auth/session.ts (existing session management)
- migrations/002_add_google_id.sql (just created)
```

**Enforcement:**
- [ ] Plan updated with task status
- [ ] Verification report generated
- [ ] Handover created if transitioning
- [ ] Handover ≤ 600 tokens

## Few-Shot Examples

### Example 1: Successful Implementation

**Input:** Task T1 from plan.md
```markdown
### Task 1: Add email validation to login form
**Acceptance Criteria:**
- AC1: Email field rejects invalid formats
- AC2: Email field shows error message
- AC3: Form submission blocked until valid
```

**Execution (CoD^Σ):**
```
Step 1: → WriteTests (from ACs, should FAIL)
  ↳ File: src/components/LoginForm.test.tsx
  ↳ Tests:
    - testRejectsInvalidEmail (AC1)
    - testShowsErrorMessage (AC2)
    - testBlocksSubmission (AC3)

Step 2: → RunTests (expect FAIL)
  ↳ Command: npm test LoginForm.test.tsx
  ↳ Result: 3 failed ✗ (expected - not implemented yet)

Step 3: → Implement
  ↳ File: src/components/LoginForm.tsx:45
  ↳ Code: validateEmail regex + error display + disabled submit

Step 4: → RunTests (expect PASS)
  ↳ Command: npm test LoginForm.test.tsx
  ↳ Result: 3 passed ✓

Step 5: ∘ VerifyACs
  ↳ AC1: ✓ Test passes
  ↳ AC2: ✓ Test passes
  ↳ AC3: ✓ Test passes
  ↳ Coverage: 100%
  ↳ Status: TASK COMPLETE ✓
```

### Example 2: Failing AC → Debug → Fix

**Input:** Task T2 with AC failure
```markdown
### Task 2: Database migration for OAuth
**Acceptance Criteria:**
- AC1: Migration creates google_id column
- AC2: Migration runs without errors
```

**Execution:**
```
Step 1: → Implement
  ↳ File: migrations/002_add_google_id.sql
  ↳ Code: ALTER TABLE users ADD COLUMN google_id VARCHAR(255);

Step 2: → RunMigration
  ↳ Command: npm run migrate
  ↳ Result: ERROR - column google_id already exists ❌

Step 3: → VerifyACs
  ↳ AC1: ✗ FAIL (column exists but migration errored)
  ↳ AC2: ✗ FAIL (migration errored)
  ↳ Status: BLOCKED

Step 4: → Debug (use analyze-code skill)
  ↳ Query: project-intel.mjs --search "google_id"
  ↳ Data: Found in migrations/001_initial.sql (already added!)

Step 5: ∘ Fix
  ↳ Resolution: Migration 002 is duplicate
  ↳ Action: Mark task as "not needed (already done in 001)"
  ↳ Update plan status

Step 6: → ReVerifyACs
  ↳ AC1: ✓ Column exists (from migration 001)
  ↳ AC2: ✓ No errors (skip duplicate migration)
  ↳ Status: COMPLETE ✓
```

### Example 3: Rollback on Breaking Change

**Input:** Task T5 causing test failures
```markdown
### Task 5: Refactor API response format
**Acceptance Criteria:**
- AC1: New format includes { data, meta }
- AC2: All existing API tests pass
- AC3: No breaking changes to clients
```

**Execution:**
```
Step 1: → Implement
  ↳ File: src/api/format.ts
  ↳ Change: Return { data: result, meta: {...} }

Step 2: → RunTests
  ↳ Command: npm test
  ↳ Result: 15 tests FAILED ✗

Step 3: → VerifyACs
  ↳ AC1: ✓ New format works
  ↳ AC2: ✗ FAIL - 15 tests expect old format
  ↳ AC3: ✗ FAIL - breaking change detected
  ↳ Status: BLOCKED (ACs failed)

Step 4: → Rollback
  ↳ Command: git checkout src/api/format.ts
  ↳ Reason: Breaking change violates AC3

Step 5: → UpdatePlan
  ↳ Add task T5.1: Update all tests FIRST
  ↳ Add task T5.2: Then change API format
  ↳ Dependencies: T5.1 → T5.2

Step 6: ∘ Handover
  ↳ Create handover.md to planner
  ↳ Reason: Plan needs revision (missed dependency)
```

## Enforcement Rules

### Rule 1: No Completion Without Passing ACs

**❌ Violation:**
```markdown
Task: Add login feature
Status: ✓ Complete
Test Results: 2 passed, 1 failed
```

**✓ Correct:**
```markdown
Task: Add login feature
Status: BLOCKED
Test Results: 2 passed, 1 failed
Action:
1. Debug failing test
2. Fix implementation
3. Re-run tests
4. Mark complete ONLY when all pass
```

### Rule 2: Test-First Mandatory

**❌ Violation:**
```
1. Implement feature
2. Write tests after
3. Tests pass (but might not be testing the right thing)
```

**✓ Correct:**
```
1. Write tests from ACs (tests FAIL)
2. Implement feature
3. Tests PASS (proves implementation works)
```

### Rule 3: 100% AC Coverage

**❌ Violation:**
```markdown
Total ACs: 3
Tested ACs: 2
Coverage: 67%  # Not acceptable!
```

**✓ Correct:**
```markdown
Total ACs: 3
Tested ACs: 3
Coverage: 100% ✓
```

## Common Pitfalls

| Pitfall | Impact | Solution |
|---------|--------|----------|
| Implementing before tests | Can't verify correctness | Write tests FIRST always |
| Skipping lint/build | Broken code deployed | Run full verification suite |
| Marking complete with failures | Incomplete implementation | Block until 100% pass |
| No verification report | Can't track progress | Generate report every time |

## When to Use This Skill

**Use implement-and-verify when:**
- User has a plan ready to execute
- User wants to implement tasks with TDD
- User needs AC verification
- User says "implement the plan"

**Don't use when:**
- No plan exists yet (use create-plan skill)
- User just wants to analyze code (use analyze-code skill)
- User wants to debug (use debugging skill)

## Related Skills & Commands

- **Create-plan skill** - Creates the plan this skill executes
- **Debugging skill** - For debugging failed ACs
- **Analyze-code skill** - For understanding existing code before implementation
- **/implement command** - User-invoked implementation (can invoke this skill)
- **/verify command** - User-invoked verification (part of this skill)

## Success Metrics

**Verification Quality:**
- 100% AC coverage required
- All ACs must pass
- No task complete without verification

**Implementation Quality:**
- Tests written first
- Minimal implementation (YAGNI)
- Lint and build pass

## Version

**Version:** 1.0
**Last Updated:** 2025-10-19
**Owner:** Claude Code Intelligence Toolkit
