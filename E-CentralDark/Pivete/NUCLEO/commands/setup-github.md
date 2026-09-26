# COMANDO - setup-github.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\setup-github.md
**SHA:** 27a86ce932b45a91
**Timestamp:** 2026-08-28T02:02:08.981139
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Write-Host "   Run: @devops *environment-bootstrap"
- Write-Host "   Run: gh auth login"

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: false
- blocker: true
- blocker: false
- blocker: false
- blocker: true
- blocker: false

### Ouro Bruto (primeiros 5000 chars)
```
# setup-github

**Task ID:** setup-github
**Version:** 1.0.0
**Created:** 2025-12-08
**Updated:** 2025-12-08
**Agent:** @devops (Gage)
**Story:** 5.10 - GitHub DevOps Setup for User Projects

---

## Purpose

Configure complete GitHub DevOps infrastructure for user projects created with AIOS. This task copies GitHub Actions workflows, configures CodeRabbit, sets up branch protection, and manages secrets.

**This task should be executed AFTER `*environment-bootstrap`**, when the Git repository is already initialized and pushed to GitHub.

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous setup with sensible defaults
- Skip optional components, install essential DevOps
- **Best for:** Experienced developers, quick setup

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations for each component
- **Best for:** Learning, first-time setup, team onboarding

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Full analysis phase before any configuration
- Zero ambiguity execution
- **Best for:** Enterprise environments, strict policies

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: setupGitHub()
responsável: Gage (Operator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: project_path
  tipo: string
  origem: Auto-detect (cwd)
  obrigatório: false
  validação: Valid directory with .git and GitHub remote

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: |
    {
      skip_workflows: boolean,      // Skip GitHub Actions setup
      skip_coderabbit: boolean,     // Skip CodeRabbit configuration
      skip_branch_protection: boolean, // Skip branch protection rules
      skip_secrets: boolean,        // Skip secrets wizard
      project_type: string          // node | python | go | rust | mixed
    }

**Saída:**
- campo: devops_setup_report
  tipo: object
  destino: File system (.aios/devops-setup-report.yaml)
  persistido: true

- campo: workflows_installed
  tipo: array
  destino: Return value
  persistido: false

- campo: protection_enabled
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Git repository exists (.git directory present)
    tipo: pre-condition
    blocker: true
    validação: |
      Test-Path ".git" (PowerShell) or [ -d .git ] (bash)
    error_message: "Git repository not found. Run *environment-bootstrap first."

  - [ ] GitHub remote configured
    tipo: pre-condition
    blocker: true
    validação: |
      git remote get-url origin
    error_message: "GitHub remote not configured. Run *environment-bootstrap first."

  - [ ] GitHub CLI authenticated
    tipo: pre-condition
    blocker: true
    validação: |
      gh auth status
    error_message: "GitHub CLI not authenticated. Run 'gh auth login'."

  - [ ] Repository exists on GitHub
    tipo: pre-condition
    blocker: true
    validação: |
      gh repo view
    error_message: "Repository not found on GitHub. Push changes first."

  - [ ] Not already configured (idempotency check)
    tipo: pre-condition
    blocker: false
    validação: |
      Check .aios/devops-setup-report.yaml existence
    warning_message: "DevOps setup already completed. Use --force to reconfigure."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] GitHub Actions workflows present in .github/workflows/
    tipo: post-condition
    blocker: true
    validação: |
      Test-Path ".github/workflows/ci.yml"
    error_message: "Workflow installation failed"

  - [ ] CodeRabbit config present (if not skipped)
    tipo: post-condition
    blocker: false
    validação: |
      Test-Path ".coderabbit.yaml"
    warning_message: "CodeRabbit not configured"

  - [ ] DevOps setup report generated
    tipo: post-condition
    blocker: false
    validação: |
      Test-Path ".aios/devops-setup-report.yaml"
    error_message: "Setup report not generated"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] At least ci.yml workflow is installed and valid
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Verify .github/workflows/ci.yml exists and is valid YAML
    error_message: "CI workflow not installed"

  - [ ] Workflows are customized for project type
    tipo: acceptance-criterion
    blocker: false
    validação: |
      Check node_version, python_version, etc. match project
    error_message: "Workflow customization failed"

  - [ ] Setup report documents all configurations
    tipo: acceptance-criterion
    blocker: true
    
```