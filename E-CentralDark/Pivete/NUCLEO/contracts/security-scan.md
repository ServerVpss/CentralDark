# CONTRATO - security-scan.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\security-scan.md
**SHA:** 4b8ffb170b289232
**Timestamp:** 2026-08-28T02:02:08.803120
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- padrão: 2

### Contratos
- - Any CRITICAL vulnerability → Gate = FAIL
- - Any secret detected → Gate = FAIL
- - Any HIGH vulnerability → Gate = CONCERNS
- - Only MEDIUM/LOW → Gate = PASS (with notes)
- if (secretsGate === 'FAIL') return 'FAIL';
- if (auditGate === 'FAIL' || eslintGate === 'FAIL') return 'FAIL';
- if (auditGate === 'CONCERNS' || eslintGate === 'CONCERNS') return 'CONCERNS';

### Riscos
- blocker: true
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# security-scan

**Task ID:** `security-scan`  
**Version:** 2.0.0  
**Status:** Active

---

## Purpose

Executa análise estática de segurança (SAST) no código do projeto/story. Automação total, zero intervenção manual, CLI-first.

**Estratégia:** Automação total, zero intervenção manual, CLI-first.

---

## Execution Modes

**Choose your execution mode:**

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

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: securityScan()
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
  padrão: 2
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

## Step-by-Step Execution

### Step 1: Setup Security Tools

**Purpose:** Ensure all required security scanning tools are installed and configured

**Actions:**
1. Check for npm audit availability
2. Install ESLint security plugins if missing
3. Configure ESLint security rules
4. Verify secretlint availability (optional)

**Validation:**
- npm audit command available
- ESLint security plugins installed
- Configuration files created

---

### Step 2: Dependency Vulnerability Scan

**Purpose:** Scan npm dependencies for known vulnerabilities

**Actions:**
1. Execute `npm audit --audit-level=moderate --json`
2. Parse audit results
3. Categorize vulnerabilities by severity
4. Determine gate impact

**Validation:**
- Audit report generated
- Vulnerabilities categorized correctly
- Gate impact calculated

---

### Step 3: Code Security Pattern Scan

**Purpose:** Analyze code for insecure patterns using ESLint security plugins

**Actions:**
1. Run ESLint with security plugins
2. Parse ESLint results
3. Identify security issues by severity
4. Determine gate impact

**Validation:**
- ESLint scan completed
- Security issues identified
- Gate impact calculated

---

### Step 4: Secret Detection

**Purpose:** Detect exposed secrets, API keys, and passwords in codebase

**Actions:**
1. Run secretlint scan
2. Parse secret detection results
3. Categorize findings
4. Determine gate impact

**Validation:**
- Secret scan completed
- Secrets identified (if any)
- Gate impact calculated

---

### Step 5: Generate Security Report

**Purpose:** Create comprehensive security scan report

**Actions:**
1. Aggregate all scan results
2. Calculate overall risk score
3. Generate markdown report
4. Save report to `.ai/security/` directory

**Validation:**
- Report file created
- All sections included
- Gate decision documented

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
    rollback: false
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
    blocker: false
    story: N/A
    manual_check: false
    validação: |
      Assert no critical vulnerabilities; all checks passed
    error_message: "Acceptance criterion not met: No critical vulne
```