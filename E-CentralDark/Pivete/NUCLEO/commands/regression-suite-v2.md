# COMANDO - regression-suite-v2.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\tests\regression-suite-v2.md
**SHA:** 3bb5c3e551ba109f
**Timestamp:** 2026-08-28T02:02:16.341389
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 2. Execute: `*develop-yolo docs/stories/test/test-001-sample-story.md`
- 2. Execute: `*qa-gate {story-id}`
- 2. Execute: `*create-story` with requirements
- 2. Execute: `*validate-story-draft {story-path}`
- 1. Execute: `*execute-checklist {checklist-name}`
- 2. Execute: `*pull-story {task-id}`
- 2. Execute: `*db-apply-migration {migration-file}`
- 1. Execute: `*create-agent` with agent spec
- 1. Execute: `*create-task` with task spec
- 2. Execute: `*run-tests`

### Ouro Bruto (primeiros 5000 chars)
```
# Regression Test Suite V2.0

**Created:** 2025-01-17  
**Purpose:** Reusable test suite for validating V2.0 task format backward compatibility  
**Story:** STORY-6.1.7.2 - Task Execution Validation

---

## Overview

This regression test suite provides standardized test scenarios for validating that migrated V2.0 tasks maintain backward compatibility with V1.0 behavior while supporting new V2.0 features.

---

## Test Environment Setup

### Prerequisites

1. **Node.js:** v18+ installed and verified
   ```bash
   node --version
   ```

2. **Git CLI:** Available and configured
   ```bash
   git --version
   ```

3. **PM Tool Access:** Configured (ClickUp/GitHub/Jira)
   - Check `.aios-core/core-config.yaml` for PM tool setting
   - Ensure API credentials configured if required

4. **Test Database:** Supabase local or test instance
   - Database connection configured
   - Migration directory accessible

### Test Data Setup

#### 1. Sample Story
- **Location:** `docs/stories/test/test-001-sample-story.md`
- **Story ID:** `STORY-TEST-001`
- **Status:** Draft
- **Purpose:** Used for story development and validation workflows

#### 2. Sample Requirements
- **Location:** `docs/requirements/test-sample-requirements.md`
- **Format:** Standard PRD template
- **Purpose:** Used for story creation workflow testing

#### 3. Sample Migration
- **Location:** `supabase/migrations/20250117000000_test_migration.sql`
- **Type:** Creates `test_validation_table`
- **Purpose:** Used for database migration workflow testing

#### 4. PM Tool Test Story
- **ClickUp:** Task ID format `12345678` (8-digit numeric)
- **GitHub:** Issue number format `#123`
- **Jira:** Task key format `TEST-123`
- **Purpose:** Used for PM tool integration workflow testing

---

## Task Execution Tests

### Priority 1 - Core Development Tasks

#### Test 1.1: dev-develop-story.md

**Test Data:**
- Story file: `docs/stories/test/test-001-sample-story.md`
- Mode: yolo (autonomous)

**Execution Steps:**
1. Activate dev agent
2. Execute: `*develop-yolo docs/stories/test/test-001-sample-story.md`
3. Verify story implementation completes
4. Check Dev Agent Record updated
5. Validate File List updated

**Expected Results:**
- ✅ Task executes without errors
- ✅ Story status updated to "Ready for Review"
- ✅ Dev Agent Record sections populated
- ✅ Output format: Duration line 7, Tokens line 8, Metrics last

**Validation Criteria:**
- Exit code: 0
- Required outputs generated
- Post-conditions met
- No error messages

---

#### Test 1.2: qa-gate.md

**Test Data:**
- Story file: Completed story from Test 1.1

**Execution Steps:**
1. Activate qa agent
2. Execute: `*qa-gate {story-id}`
3. Verify QA review completes
4. Check QA Results section updated

**Expected Results:**
- ✅ QA gate document created
- ✅ Test results documented
- ✅ Issues identified (if any)
- ✅ Final verdict provided

**Validation Criteria:**
- QA gate report generated
- All test results documented
- Clear pass/fail verdict

---

#### Test 1.3: create-next-story.md

**Test Data:**
- Requirements: `docs/requirements/test-sample-requirements.md`

**Execution Steps:**
1. Activate sm agent (or po agent)
2. Execute: `*create-story` with requirements
3. Verify story file created
4. Validate story structure

**Expected Results:**
- ✅ Story file created in correct location
- ✅ All required sections present
- ✅ Story follows template format
- ✅ Story ID assigned correctly

**Validation Criteria:**
- Story file exists
- Template compliance verified
- All sections populated

---

#### Test 1.4: validate-next-story.md

**Test Data:**
- Story file: Draft story (e.g., Test 1.3 output)

**Execution Steps:**
1. Activate po agent
2. Execute: `*validate-story-draft {story-path}`
3. Verify validation report generated
4. Check for issues identified

**Expected Results:**
- ✅ Validation report created
- ✅ Issues categorized (Critical/Should-Fix/Nice-to-Have)
- ✅ Implementation readiness score provided
- ✅ Clear GO/NO-GO decision

**Validation Criteria:**
- Validation report generated
- All validation checks executed
- Actionable feedback provided

---

#### Test 1.5: execute-checklist.md

**Test Data:**
- Checklist: `po-master-checklist.md` or `story-dod-checklist.md`

**Execution Steps:**
1. Execute: `*execute-checklist {checklist-name}`
2. Verify checklist items checked
3. Validate completion report

**Expected Results:**
- ✅ Checklist executed successfully
- ✅ All items validated
- ✅ Completion report generated
- ✅ Issues documented (if any)

**Validation Criteria:**
- Checklist completes without errors
- All items checked appropriately
- Report generated

---

### Priority 2 - Agent-Specific Tasks

#### Test 2.1: po-pull-story.md

**Test Data:**
- PM Tool: Configured PM tool (ClickUp/GitHub/Jira)
- Task ID: Pre-created task in PM tool

**Execution Steps:**
1. Activate po agent
2. Execute: `*pull-story {task-id}`
3. Verify story file synced locally
4. Validate story content matches PM tool

**Expected Results:**
- ✅ Sto
```