# COMANDO - task-anatomy-checklist.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\checklists\task-anatomy-checklist.md
**SHA:** 95435488c5920d9f
**Timestamp:** 2026-08-28T13:25:22.102122
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Pattern:** HO-TP-001 (Task Anatomy Standard)

### Contratos
- **Quality Gate:** BLOCKING - tasks that fail critical checks cannot be deployed.
- quality_gate: null

### Ouro Bruto (primeiros 5000 chars)
```
# Task Anatomy Validation Checklist

**Purpose:** Validate task definitions against the HO-TP-001 Task Anatomy Standard before deployment.
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Quality Gate:** BLOCKING - tasks that fail critical checks cannot be deployed.

---

## Quick Validation (Automated)

### Minimum Thresholds

| Metric | Minimum | Target | Measurement |
|--------|---------|--------|-------------|
| Required fields present | 8/8 | 8/8 | Count of 8 mandatory fields |
| task_name format valid | true | true | Verb + Object pattern |
| execution_type valid | true | true | Enum: Human/Agent/Hybrid/Worker |
| estimated_time format | valid | valid | Xh or X-Yh pattern |
| inputs array | 1+ items | 2+ items | Count of input items |
| outputs array | 1+ items | 2+ items | Count of output items |
| action_items | 1+ items | 3+ items | Count of action steps |
| acceptance_criteria | 1+ items | 2+ items | Count of criteria |

```yaml
automated_checks:
  - check: "all_required_fields_present"
    weight: 30%
    severity: blocking
    fail_action: "BLOCK - missing required fields"

  - check: "task_name_format_valid"
    weight: 15%
    severity: blocking
    fail_action: "BLOCK - task_name must be Verb + Object"

  - check: "execution_type_valid"
    weight: 15%
    severity: blocking
    fail_action: "BLOCK - invalid execution_type"

  - check: "estimated_time_format_valid"
    weight: 10%
    severity: warning
    fail_action: "WARN - estimated_time format should be Xh or X-Yh"

  - check: "inputs_outputs_are_arrays"
    weight: 15%
    severity: blocking
    fail_action: "BLOCK - input/output must be arrays"

  - check: "action_items_present"
    weight: 10%
    severity: warning
    fail_action: "WARN - action_items should have concrete steps"

  - check: "acceptance_criteria_present"
    weight: 5%
    severity: warning
    fail_action: "WARN - acceptance_criteria recommended"
```

---

## 1. REQUIRED FIELDS (8 Mandatory)

### 1.1 Field Presence Check

Every task MUST have ALL 8 fields. No exceptions.

- [ ] **task_name** - Name of the task (Verb + Object format)
- [ ] **status** - Current status (Enum: pending|in_progress|completed)
- [ ] **responsible_executor** - Who/what executes the task
- [ ] **execution_type** - Type of executor (Enum: Human|Agent|Hybrid|Worker)
- [ ] **input** - Array of inputs required
- [ ] **output** - Array of outputs produced
- [ ] **action_items** - Array of execution steps
- [ ] **acceptance_criteria** - Array of completion criteria

### 1.2 Field Presence Scoring

| Fields Present | Score | Status |
|----------------|-------|--------|
| 8/8 | 100% | PASS |
| 7/8 | 87.5% | CONDITIONAL |
| 6/8 | 75% | FAIL |
| <6/8 | <75% | HARD FAIL |

### 1.3 Optional Fields

These fields enhance task definition but are not required:

- [ ] **estimated_time** - Time estimate (format: Xh or X-Yh)
- [ ] **dependencies** - Array of prerequisite task IDs
- [ ] **templates** - Array of template references
- [ ] **quality_gate** - Quality gate reference
- [ ] **handoff** - Handoff configuration (to, trigger)
- [ ] **patterns** - Pattern compliance references

---

## 2. TASK_NAME VALIDATION (Verb + Object Format)

### 2.1 Format Rules

The task_name MUST follow "Verb + Object" format:

```yaml
# Valid formats:
task_name: "Analyze Briefing"         # Verb + Noun
task_name: "Create Project Setup"     # Verb + Compound Noun
task_name: "Validate Quality Gate"    # Verb + Compound Noun
task_name: "Send Client Update"       # Verb + Object Phrase

# Invalid formats:
task_name: "Briefing Analysis"        # Noun + Noun (passive)
task_name: "Project Setup"            # Missing verb
task_name: "analyze_briefing"         # Wrong case (snake_case)
task_name: "ANALYZE BRIEFING"         # Wrong case (UPPER)
```

### 2.2 Valid Starting Verbs

- [ ] Action verbs: `Analyze`, `Create`, `Build`, `Design`, `Implement`
- [ ] Process verbs: `Execute`, `Process`, `Run`, `Perform`, `Conduct`
- [ ] Communication verbs: `Send`, `Notify`, `Report`, `Communicate`, `Present`
- [ ] Validation verbs: `Validate`, `Verify`, `Check`, `Review`, `Approve`
- [ ] Data verbs: `Extract`, `Transform`, `Load`, `Import`, `Export`
- [ ] Management verbs: `Schedule`, `Assign`, `Delegate`, `Track`, `Monitor`

### 2.3 Task Name Quality Check

- [ ] Starts with action verb (infinitive form)
- [ ] Object clearly identifies what is being acted upon
- [ ] Uses Title Case (each word capitalized)
- [ ] Concise but descriptive (2-5 words ideal)
- [ ] No abbreviations unless universally understood
- [ ] No special characters or underscores

### 2.4 Examples by Domain

```yaml
# Project Management
task_name: "Schedule Kick-off Meeting"
task_name: "Create Project Timeline"
task_name: "Assign Team Roles"

# Content Creation
task_name: "Write Script Draft"
task_name: "Review Video Concept"
task_name: "Approve Final Cut"

# Data Processing
task_name: "Extract Client Data"
task_name: "Transform Report Format"
task_name: "Load Analytics Dashboard"

```