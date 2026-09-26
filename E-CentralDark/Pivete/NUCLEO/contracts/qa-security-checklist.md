# CONTRATO - qa-security-checklist.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\qa-security-checklist.md
**SHA:** 9f29e82e9060b80a
**Timestamp:** 2026-08-28T02:02:08.605371
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- risk: Remote Code Execution (RCE)
- risk: Cross-Site Scripting (XSS)
- risk: Cross-Site Scripting (XSS) in React
- risk: Command Injection
- risk: Credential Exposure
- risk: SQL Injection

### Ouro Bruto (primeiros 5000 chars)
```
# Security Checklist Task

Automated security vulnerability scanning for common security anti-patterns.

**Absorbed from:** Auto-Claude PR Review Phase 6.1

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous scanning with logging
- Minimal user interaction
- **Best for:** CI/CD integration, pre-commit hooks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explains each vulnerability found
- Educational context about risks
- **Best for:** Learning, security training

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Full codebase security audit
- Zero ambiguity execution
- **Best for:** Security reviews, audits

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: qaSecurityChecklist()
responsavel: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must be valid story ID format (e.g., "6.3")

- campo: file_paths
  tipo: array
  origem: git diff or explicit list
  obrigatorio: false
  validacao: If empty, extracts from uncommitted changes

- campo: severity_threshold
  tipo: string
  origem: config
  obrigatorio: false
  validacao: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" (default: "HIGH")

**Saida:**
- campo: security_report
  tipo: object
  destino: Return value
  persistido: false

- campo: vulnerabilities_found
  tipo: number
  destino: Memory
  persistido: false

- campo: report_file
  tipo: file
  destino: docs/stories/{story-id}/qa/security_issues.json
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Files to scan exist
    tipo: pre-condition
    blocker: true
    validacao: |
      git diff --name-only returns files OR --files provided
    error_message: "Pre-condition failed: No files to scan."

  - [ ] Grep tool available
    tipo: pre-condition
    blocker: true
    validacao: |
      Native Grep tool accessible
    error_message: "Pre-condition failed: Grep tool not available."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Security report generated
    tipo: post-condition
    blocker: true
    validacao: |
      security_issues.json exists with results
    error_message: "Post-condition failed: Security report not generated."

  - [ ] All patterns checked
    tipo: post-condition
    blocker: true
    validacao: |
      All 8 security patterns scanned
    error_message: "Post-condition failed: Not all patterns checked."
```

---

## Security Patterns (8 Checks)

### Check 1: eval() and Dynamic Code Execution

**Severity:** CRITICAL
**Languages:** JavaScript, TypeScript, Python

```yaml
patterns:
  javascript:
    - "eval\\("
    - "new Function\\("
    - "setTimeout\\(['\"`][^'\"]+['\"`]"
    - "setInterval\\(['\"`][^'\"]+['\"`]"
  python:
    - "eval\\("
    - "exec\\("
    - "compile\\("

risk: Remote Code Execution (RCE)
fix: Use JSON.parse() for data, avoid dynamic code entirely
```

### Check 2: innerHTML and DOM XSS

**Severity:** CRITICAL
**Languages:** JavaScript, TypeScript

```yaml
patterns:
  - "\\.innerHTML\\s*="
  - "\\.outerHTML\\s*="
  - "document\\.write\\("
  - "document\\.writeln\\("

risk: Cross-Site Scripting (XSS)
fix: Use textContent, createElement, or sanitization libraries
```

### Check 3: dangerouslySetInnerHTML (React)

**Severity:** CRITICAL
**Languages:** JavaScript, TypeScript (React/JSX)

```yaml
patterns:
  - 'dangerouslySetInnerHTML'

risk: Cross-Site Scripting (XSS) in React
fix: Use DOMPurify or avoid entirely
exception: Only if sanitized with DOMPurify.sanitize()
```

### Check 4: shell=True (Python)

**Severity:** CRITICAL
**Languages:** Python

```yaml
patterns:
  - "subprocess\\..*shell\\s*=\\s*True"
  - "os\\.system\\("
  - "os\\.popen\\("

risk: Command Injection
fix: Use subprocess with shell=False and list arguments
```

### Check 5: Hardcoded Secrets

**Severity:** CRITICAL
**Languages:** All

```yaml
patterns:
  # API Keys
  - "api[_-]?key\\s*[=:]\\s*['\"][^'\"]{10,}['\"]"
  - "apikey\\s*[=:]\\s*['\"][^'\"]{10,}['\"]"

  # Passwords
  - "password\\s*[=:]\\s*['\"][^'\"]+['\"]"
  - "passwd\\s*[=:]\\s*['\"][^'\"]+['\"]"
  - "pwd\\s*[=:]\\s*['\"][^'\"]+['\"]"

  # Tokens
  - "token\\s*[=:]\\s*['\"][^'\"]{10,}['\"]"
  - "secret\\s*[=:]\\s*['\"][^'\"]{10,}['\"]"
  - "bearer\\s+[a-zA-Z0-9_-]{20,}"

  # AWS
  - 'AKIA[0-9A-Z]{16}'
  - 'aws[_-]?secret[_-]?access[_-]?key'

  # Private Keys
  - '-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----'

risk: Credential Exposure
fix: Use environment variables, secrets manager, or .env files
```

### Check 6: SQL Injection Patterns

**Severity:** CRITICAL
**Languages:** JavaScript, TypeScript, Python

```yaml
patterns:
```