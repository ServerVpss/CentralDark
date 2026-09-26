# CONTRATO - github-devops-pre-push-quality-gate.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\github-devops-pre-push-quality-gate.md
**SHA:** 5466ed17c850945f
**Timestamp:** 2026-08-28T02:02:06.020923
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Run: npm run lint && npm run typecheck && npm test && npm run build
- console.error('   Run: wsl bash -c "~/.local/bin/coderabbit auth status"');
- 2. Run: npm audit fix --force

### Contratos
- ## Constitutional Gate: Quality First
- constitutional_gate:
- gate: vulns.critical > 0 ? 'FAIL' : (vulns.high > 0 ? 'CONCERNS' : 'PASS')
- gate: vulns.critical > 0 ? 'FAIL' : (vulns.high > 0 ? 'CONCERNS' : 'PASS')
- return { gate: 'PASS', skipped: true };
- return { gate: 'PASS', skipped: true };
- return { gate: 'PASS', issues: 0 };
- gate: errorCount > 0 ? 'FAIL' : (warningCount > 0 ? 'CONCERNS' : 'PASS'),
- return { gate: 'PASS', secretsFound: 0 };
- return { gate: 'FAIL', secretsFound: 1 };

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# pre-push-quality-gate.md

**Task**: Pre-Push Quality Gate Validation (Repository-Agnostic)

**Purpose**: Execute comprehensive quality checks before pushing code to remote repository, ensuring code quality, tests, and security standards are met.

**When to use**: Before pushing code to GitHub, always via `@github-devops *pre-push` command.

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: githubDevopsPrePushQualityGate()
responsável: Gage (Automator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Constitutional Gate: Quality First

> **Reference:** Constitution Article V - Quality First (MUST)
> **Severity:** BLOCK
> **Enforcement:** Mandatory checks before any push

```yaml
constitutional_gate:
  article: V
  name: Quality First
  severity: BLOCK

  validation:
    required_checks:
      - name: lint
        command: npm run lint
        must_pass: true

      - name: typecheck
        command: npm run typecheck
        must_pass: true

      - name: test
        command: npm test
        must_pass: true

      - name: build
        command: npm run build
        must_pass: true

      - name: coderabbit
        check: No CRITICAL issues
        must_pass: true

      - name: story_status
        check: Story status is "Done" or "Ready for Review"
        must_pass: true

  on_violation:
    action: BLOCK
    message: |
      CONSTITUTIONAL VIOLATION: Article V - Quality First
      Push blocked due to failed quality checks.

      Failed checks:
      {list_failed_checks}

      Resolution: Fix all failing checks before pushing.
      Run: npm run lint && npm run typecheck && npm test && npm run build

  bypass:
    allowed: false
    reason: "Quality First is NON-NEGOTIABLE per Constitution"
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Constitutional gate passed (Article V: Quality First)
    tipo: constitutional-gate
    blocker: true
    validação: |
      All quality checks must pass: lint, typecheck, test, build
    error_message: "Constitutional violation - Quality First checks failed"

  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** git
  - **Purpose:** Version control operations
  - **Source:** System CLI

- **Tool:** npm
  - **Purpose:** Run quality scripts (lint, test, typecheck, build)
  - **Source:** System CLI

- **Tool:** gh (GitHub CLI)
  - **Purpose:** GitHub PR operations
  - **Source:** System CLI

---

## Error Handling

**Strategy:** retry

**Common 
```