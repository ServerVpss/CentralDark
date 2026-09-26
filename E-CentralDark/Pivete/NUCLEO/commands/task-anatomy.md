# COMANDO - task-anatomy.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\config\task-anatomy.yaml
**SHA:** 5ffe04d508cefb76
**Timestamp:** 2026-08-28T13:25:25.311775
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- # Source pattern: HO-TP-001
- source_pattern: "HO-TP-001"
- pattern: "^(Extract|Validate|Generate|Create|Audit|Design|Build|Test|Review|Analyze|Map|Define|Implement|Configure)\\s.+"
- pattern: "^(@[a-z-]+:[a-z-]+|[A-Z][a-z]+\\s?[A-Z]?[a-z]*|Human|System)$"
- pattern: "^\\d+(-\\d+)?\\s?(m|min|h|hour|hours|d|day|days)$"

### Contratos
- quality_gate: "QG-SC-3.1"

### Ouro Bruto (primeiros 5000 chars)
```
# TASK ANATOMY SCHEMA - Squad-Creator
# Source pattern: HO-TP-001
# Version: 1.0
# Last Updated: 2026-02-10

task_anatomy:
  version: "1.0"
  source_pattern: "HO-TP-001"
  philosophy: |
    "O que não tem responsável será feito por ninguém."
    "O que não tem data pode ser feito qualquer hora."
    Tasks sem os 8 campos são receita para falha.

  # ============================================
  # 8 REQUIRED FIELDS
  # ============================================
  required_fields:
    - field: "task_name"
      type: "string"
      validation: "starts_with_verb"
      pattern: "^(Extract|Validate|Generate|Create|Audit|Design|Build|Test|Review|Analyze|Map|Define|Implement|Configure)\\s.+"
      error: "Task name must start with action verb (e.g., Extract, Validate, Generate)"
      examples:
        valid:
          - "Extract Mind DNA"
          - "Validate Agent Coherence"
          - "Generate Workflow YAML"
        invalid:
          - "Mind DNA extraction"  # noun phrase
          - "The extraction task"  # article
          - "DNA"  # too vague

    - field: "status"
      type: "enum"
      values:
        - "pending"
        - "in_progress"
        - "review"
        - "completed"
        - "blocked"
      error: "Invalid status value"
      flow: "pending → in_progress → review → completed (unidirectional)"

    - field: "responsible_executor"
      type: "string"
      validation: "role_or_agent_ref"
      pattern: "^(@[a-z-]+:[a-z-]+|[A-Z][a-z]+\\s?[A-Z]?[a-z]*|Human|System)$"
      error: "Must be role name or @agent reference"
      examples:
        valid:
          - "@squad-creator:analyzer"
          - "@oalanicolas"
          - "Squad Lead"
          - "Human"
          - "System"
        invalid:
          - "someone"  # vague
          - "TBD"  # undefined
          - ""  # empty

    - field: "execution_type"
      type: "enum"
      values:
        - value: "Human"
          description: "Requires judgment, creativity, relationships"
          cost: "$$$"
          speed: "hours to days"
        - value: "Agent"
          description: "AI reasoning, generation, pattern recognition"
          cost: "$$$$"
          speed: "seconds to minutes"
        - value: "Hybrid"
          description: "AI prepares, human validates"
          cost: "$$"
          speed: "minutes to hours"
        - value: "Worker"
          description: "Deterministic, no judgment required"
          cost: "$"
          speed: "sub-second to seconds"
      error: "Must be one of: Human, Agent, Hybrid, Worker"
      decision_tree: |
        IF task is 100% deterministic → Worker
        ELSE IF requires AI reasoning → Agent
        ELSE IF AI + human validation → Hybrid
        ELSE → Human

    - field: "estimated_time"
      type: "string"
      validation: "has_unit"
      pattern: "^\\d+(-\\d+)?\\s?(m|min|h|hour|hours|d|day|days)$"
      error: "Must include time unit (m, h, d) or range"
      examples:
        valid:
          - "30m"
          - "2h"
          - "1-2h"
          - "3 days"
        invalid:
          - "30"  # no unit
          - "quick"  # vague
          - "ASAP"  # not a time

    - field: "input"
      type: "array"
      validation: "non_empty"
      min_items: 1
      error: "Input array must have at least 1 item"
      description: "What this task receives to process"
      examples:
        - "Agent markdown file"
        - "DNA extraction template"
        - "Source transcripts"

    - field: "output"
      type: "array"
      validation: "non_empty"
      min_items: 1
      error: "Output array must have at least 1 item"
      description: "What this task produces"
      examples:
        - "DNA YAML file"
        - "Validation report"
        - "Agent configuration"

    - field: "action_items"
      type: "array"
      validation: "non_empty"
      min_items: 1
      error: "Action items must have at least 1 step"
      description: "Step-by-step execution instructions"
      format: "Each item should be imperative: 'Do X', 'Verify Y', 'Generate Z'"

  # ============================================
  # OPTIONAL FIELDS (RECOMMENDED)
  # ============================================
  optional_fields:
    - field: "acceptance_criteria"
      type: "array"
      recommended: true
      description: "Definition of Done for this task"
      examples:
        - "All axiomas extracted"
        - "DNA passes coherence check"
        - "YAML is well-formed"

    - field: "tools"
      type: "array"
      description: "Tools/systems used to execute"
      examples:
        - "Claude API"
        - "ClickUp"
        - "Notion"

    - field: "templates"
      type: "array"
      description: "Templates to use during execution"
      examples:
        - "dna-extraction-template.yaml"
        - "agent-tmpl.md"

    - field: "quality_gate"
      type: "string"
      description: "Quality gate ID that validates output"
      examples:
        - "QG-SC-3.1"
        - "QG-SC-4.1"

    - field: "handof
```