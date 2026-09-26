# COMANDO - personalized-task-template-v2.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\personalized-task-template-v2.md
**SHA:** be5da24709e4424d
**Timestamp:** 2026-08-28T02:02:20.908104
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Date.now();

### Padroes
- padrão: {defaultValue}          # Optional: default if not provided

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false                # Non-blocking
- blocker: false

### Gaps
- If user input missing:

### Ouro Bruto (primeiros 5000 chars)
```
# {Task Name}

**Task ID:** `{task-identifier}`
**Version:** {X.Y.Z}
**Status:** {Draft|Active|Deprecated}

---

## Purpose

{Brief description of what this task does and when to use it}

---

## Execution Modes

**Choose your execution mode** (if applicable for this task):

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Experienced developers, simple tasks, time-sensitive work

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions, collaborative work

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Questionnaire before execution
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work, team consensus needed

**Parameter:** `mode` (optional, default: `interactive`)

**Valid values:** `yolo`, `interactive`, `preflight`

**Note:** For simple, deterministic tasks (e.g., load config, validate schema), execution mode may not apply. Mode selection is most valuable for tasks involving creativity, decisions, or ambiguity.

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: {taskIdentifier()}
responsável: {AgentName}          # Agent executing this task (e.g., Dex, Quinn, Pax)
responsavel_type: Agente          # Open-source: always "Agente" (Worker/Humano/Clone for services only)
atomic_layer: {Layer}             # Atom|Molecule|Organism|Template|Page|Config|Strategy|Content|Media|Layout|Analysis (optional for open-source)

**Entrada:**
- campo: {fieldName}
  tipo: {type}                    # string | number | boolean | array<type> | object { key: type }
  origem: {source}                # Step X ({stepName}) | User Input | config | {agent-id} output
  obrigatório: {true|false}
  padrão: {defaultValue}          # Optional: default if not provided
  validação: {validationRule}     # Optional: validation logic

- campo: {fieldName2}
  tipo: {type}
  origem: {source}
  obrigatório: {true|false}

**Saída:**
- campo: {fieldName}
  tipo: {type}
  destino: {destination}          # Step Y ({stepName}) | state | output | multiple steps
  persistido: {true|false}        # Saved to file/DB or memory-only
  cache_key: {key}                # Optional: if cacheable

- campo: {fieldName2}
  tipo: {type}
  destino: {destination}
  persistido: {true|false}
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] {condition_description}
    tipo: pre-condition
    blocker: true
    validação: |
      {executable_validation_logic}
    error_message: "{message_if_fails}"

  - [ ] {condition_description_2}
    tipo: pre-condition
    blocker: true
    validação: "{simple_check}"
    error_message: "{message}"
```

**Examples:**

```yaml
pre-conditions:
  - [ ] Input file exists and is readable
    tipo: pre-condition
    blocker: true
    validação: |
      const fs = require('fs');
      if (!fs.existsSync(inputPath)) {
        throw new Error(`File not found: ${inputPath}`);
      }
    error_message: "Required input file not found"

  - [ ] Agent has required tools available
    tipo: pre-condition
    blocker: true
    validação: "expect(agent.tools).toContain('tool-name')"
    error_message: "Agent missing required tool: tool-name"
```

---

## Workflow

### Mode: YOLO (Autonomous)

**Execution:**
1. Read task definition
2. Validate pre-conditions automatically
3. Execute workflow with autonomous decisions
4. Log all decisions to `.ai/decision-log-{task-id}.md`
5. Validate post-conditions automatically
6. Return standardized output

**Decision Logging:**
```markdown
## Decision: {Title}
**Context:** {What problem}
**Options:** [{Option A}, {Option B}]
**Selected:** {Option}
**Rationale:** {Why}
**Timestamp:** {ISO 8601}
```

**User Prompts:** 0-1 (only if blocking issue)

---

### Mode: Interactive (Balanced) **[DEFAULT]**

**Execution:**
1. Read task definition
2. Present summary to user
3. Validate pre-conditions with user
4. Execute workflow with decision checkpoints
5. Prompt user at each decision point
6. Explain options and trade-offs
7. Validate post-conditions with user
8. Return standardized output

**Decision Checkpoints:**
- {Decision point 1 description}
- {Decision point 2 description}
- {Decision point 3 description}

**Educational Explanations:**
- Before decision: Explain options and trade-offs
- After decision: Explain why it's a good fit
- During execution: Explain what's happening and why

**User Prompts:** 5-10

---

### Mode: Pre-Flight Planning (Comprehensive)

**Execution:**
1. **Analysis Phase:**
   - Read task definition completely
   - Identify ALL ambiguities and decision points
   - Generate comprehensive questionnaire

2. **Questionnaire Phase:**
   - Present all questions to user at once
   - Collect all re
```