# CONTRATO - security-audit.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\security-audit.md
**SHA:** 8830289e7db7d333
**Timestamp:** 2026-08-28T02:02:08.861348
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Task: Security Audit

**Purpose**: Comprehensive database security and quality audit (RLS coverage, schema design, full system)

**Elicit**: true

**Consolidated From (Story 6.1.2.3):**
- `db-rls-audit.md` - RLS policy coverage checking
- `schema-audit.md` - Schema design quality validation

---

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
task: securityAudit()
responsável: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Strategy

**Entrada:**
- campo: target
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid path or resource

- campo: scan_depth
  tipo: number
  origem: config
  obrigatório: false
  validação: Default: 2 (1-5)

- campo: rules
  tipo: array
  origem: config
  obrigatório: true
  validação: Security rule set

**Saída:**
- campo: scan_report
  tipo: object
  destino: File (.ai/security/*)
  persistido: true

- campo: vulnerabilities
  tipo: array
  destino: Memory
  persistido: false

- campo: risk_score
  tipo: number
  destino: Memory
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Scanner available; target accessible; rules configured
    tipo: pre-condition
    blocker: true
    validação: |
      Check scanner available; target accessible; rules configured
    error_message: "Pre-condition failed: Scanner available; target accessible; rules configured"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Scan completed; vulnerabilities reported; no scan errors
    tipo: post-condition
    blocker: true
    validação: |
      Verify scan completed; vulnerabilities reported; no scan errors
    error_message: "Post-condition failed: Scan completed; vulnerabilities reported; no scan errors"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] No critical vulnerabilities; all checks passed
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert no critical vulnerabilities; all checks passed
    error_message: "Acceptance criterion not met: No critical vulnerabilities; all checks passed"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** security-scanner
  - **Purpose:** Static security analysis and vulnerability detection
  - **Source:** npm: eslint-plugin-security or similar

- **Tool:** dependency-checker
  - **Purpose:** Check for vulnerable dependencies
  - **Source:** npm audit or snyk

---

## Scripts

**Agent-specific code for this task:**

- **Script:** security-scan.js
  - **Purpose:** Run security scans and generate reports
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/security-scan.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Scanner Unavailable
   - **Cause:** Security scanner not installed or failed
   - **Resolution:** Install scanner or check configuration
   - **Recovery:** Skip scan with high-risk warning

2. **Error:** Critical Vulnerability Detected
   - **Cause:** High-severity security issue found
   - **Resolution:** Review vulnerability report, apply patches
   - **Recovery:** Block deployment, alert team

3. **Error:** Scan Timeout
   - **Cause:** Large codebase exceeds scan time limit
   - **Resolution:** Reduce scope or increase timeout
   - **Recovery:** Partial scan results with warning

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-20 min (estimated)
cost_estimated: $0.003-0.015
token_usage: ~2,000-8,000 tokens
```

**Optimization Notes:**
- Iterative analysis with depth limits; cache intermediate results; batch similar operations

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - security
  - audit
updated_at: 2025-11-17
```

---


## Elicitation

**Prompt user to select audit scope:**

```
Select security audit scope:

1. **rls** - RLS policy coverage only (quick)
2. **schema** - Schema design quality only (quick)
3. **full** - Complete security audit (comprehensive)

Which scope? [rls/schema/full]:
```

**Capture:** `{scope}`

---

## Process

### Scope: RLS Audit

**When:** User selects `rls` or `full`

**Purpo
```