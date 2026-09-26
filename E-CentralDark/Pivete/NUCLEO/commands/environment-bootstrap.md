# COMANDO - environment-bootstrap.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\environment-bootstrap.md
**SHA:** 01207ac7a67b5c24
**Timestamp:** 2026-08-28T02:02:05.895459
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true
- blocker: false
- blocker: true
- blocker: true
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# environment-bootstrap

**Task ID:** environment-bootstrap
**Version:** 1.1.0
**Created:** 2025-12-02
**Updated:** 2025-12-02
**Agent:** @devops (Gage)

---

## Purpose

Complete environment bootstrap for new AIOS projects. Verifies and installs all required CLIs, authenticates services, initializes Git/GitHub repository, and validates the development environment before starting the greenfield workflow.

**This task should be the FIRST step in any new project**, executed BEFORE the PRD creation.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous decision making with logging
- Skips optional tools, installs only essential
- **Best for:** Experienced developers, quick setup

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explicit decision checkpoints
- Educational explanations for each tool
- **Best for:** Learning, first-time setup, team onboarding

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Full analysis phase before any installation
- Zero ambiguity execution
- **Best for:** Enterprise environments, strict policies

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: environmentBootstrap()
responsável: Gage (Operator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: project_name
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid project name (lowercase, hyphens allowed)

- campo: project_path
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Valid directory path (defaults to current directory)

- campo: github_org
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Valid GitHub organization or username

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Bootstrap options (skip_optional, force_reinstall, etc.)

**Saída:**
- campo: environment_report
  tipo: object
  destino: File system (.aios/environment-report.yaml)
  persistido: true

- campo: git_initialized
  tipo: boolean
  destino: Return value
  persistido: false

- campo: github_repo_url
  tipo: string
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Operating system is Windows, macOS, or Linux
    tipo: pre-condition
    blocker: true
    validação: |
      Detect OS via process.platform or uname
    error_message: "Unsupported operating system"

  - [ ] User has admin/sudo privileges for installations
    tipo: pre-condition
    blocker: false
    validação: |
      Check if user can run elevated commands
    error_message: "Some installations may require elevated privileges"

  - [ ] Internet connection available
    tipo: pre-condition
    blocker: true
    validação: |
      Ping github.com or check connectivity
    error_message: "Internet connection required for tool installation and authentication"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All essential CLIs installed and accessible in PATH
    tipo: post-condition
    blocker: true
    validação: |
      Verify git, gh, node commands are executable
    error_message: "Essential CLI installation failed"

  - [ ] Git repository initialized with .gitignore
    tipo: post-condition
    blocker: true
    validação: |
      Check .git directory exists and .gitignore is configured
    error_message: "Git initialization failed"

  - [ ] Environment report generated
    tipo: post-condition
    blocker: false
    validação: |
      Check .aios/environment-report.yaml exists
    error_message: "Environment report not generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Essential CLIs (git, gh, node) are installed and working
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert all essential CLI commands return valid version output
    error_message: "Essential CLI verification failed"

  - [ ] GitHub CLI is authenticated
    tipo: acceptance-criterion
    blocker: true
    validação: |
      gh auth status returns authenticated
    error_message: "GitHub CLI not authenticated"

  - [ ] Git repository created locally and on GitHub
    tipo: acceptance-criterion
    blocker: true
    validação: |
      .git exists and gh repo view succeeds
    error_message: "Repository not properly initialized"

  - [ ] Project structure follows AIOS conventions
    tipo: acceptance-criterion
    blocker: false
    validação: |
      Check docs/, .aios/, and package.json exist
    error_message: "Project structure incomplete"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** os-detector
  - **Purpose:** Dete
```