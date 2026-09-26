# COMANDO - setup-mcp-docker.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\setup-mcp-docker.md
**SHA:** 2d81956e164d5e62
**Timestamp:** 2026-08-28T02:02:09.132548
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- → Run: docker --version
- → Run: docker mcp --version
- → Run: docker info

### Riscos
- blocker: true
- blocker: true
- blocker: true
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Setup Docker MCP Toolkit

**Task ID:** setup-mcp-docker
**Version:** 2.2.0
**Created:** 2025-12-08
**Updated:** 2025-12-23
**Agent:** @devops (Gage)

---

## Purpose

Configure Docker MCP Toolkit as the primary MCP infrastructure for AIOS, using **HTTP transport** instead of stdio to avoid timeout issues during gateway initialization.

**Key Changes in v2.0:**
- Uses HTTP/SSE transport (fixes 30s timeout issue)
- Gateway runs as persistent Docker Compose service
- Presets: `minimal` (no API keys) and `full` (with API keys)

---

## AIOS Default MCPs

| Preset | MCPs | API Key Required | Tokens |
|--------|------|------------------|--------|
| **minimal** | context7, desktop-commander, playwright | No | ~10-15k |
| **full** | minimal + exa | Yes (EXA_API_KEY) | ~20-25k |

**Minimal Preset MCPs:**
- **context7** - Library documentation lookups
- **desktop-commander** - File management + terminal commands
- **playwright** - Browser automation for testing

**Full Preset Adds:**
- **exa** - AI-powered web search (requires `EXA_API_KEY`)

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Installs `minimal` preset automatically
- **Best for:** Experienced users with Docker already configured

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Choose between minimal/full presets
- **Best for:** First-time setup, understanding the architecture

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Production environments, team-wide deployment

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: setupMcpDocker()
responsável: DevOps Agent
responsavel_type: Agente
atomic_layer: Infrastructure

**Entrada:**
- campo: docker_version
  tipo: string
  origem: System Check
  obrigatório: true
  validação: Must be Docker Desktop 4.50+ with MCP Toolkit enabled

- campo: mcps_to_enable
  tipo: array
  origem: User Input
  obrigatório: false
  validação: Array of MCP server names from Docker catalog

- campo: presets
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Preset configurations (dev, research, full)

**Saída:**
- campo: gordon_config
  tipo: file
  destino: .docker/mcp/gordon-mcp.yml
  persistido: true

- campo: claude_integration
  tipo: boolean
  destino: Claude Code configuration
  persistido: true

- campo: validation_report
  tipo: object
  destino: Console output
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Docker Desktop 4.50+ installed
    tipo: pre-condition
    blocker: true
    validação: docker --version must return 4.50.0 or higher
    error_message: "Docker Desktop 4.50+ required. Download from https://docker.com/desktop"

  - [ ] Docker MCP Toolkit available
    tipo: pre-condition
    blocker: true
    validação: docker mcp --version must succeed
    error_message: "Enable Docker MCP Toolkit in Docker Desktop settings"

  - [ ] Docker daemon running
    tipo: pre-condition
    blocker: true
    validação: docker info must succeed
    error_message: "Start Docker Desktop before running this task"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] MCP Gateway accessible
    tipo: post-condition
    blocker: true
    validação: docker mcp gateway status returns healthy
    error_message: "MCP Gateway failed to start"

  - [ ] Claude Code connected
    tipo: post-condition
    blocker: true
    validação: Claude Code shows docker-gateway in MCP list
    error_message: "Claude Code not connected to MCP Gateway"
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] gordon-mcp.yml exists in .docker/mcp/
  - [ ] At least 3 core MCPs functional (filesystem, github, fetch)
  - [ ] Claude Code can call MCP tools
  - [ ] Token consumption reduced vs direct MCPs
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** Docker CLI
  - **Purpose:** Docker and MCP operations
  - **Source:** docker, docker mcp commands

- **Tool:** Claude Code CLI
  - **Purpose:** Integration verification
  - **Source:** claude command

---

# Setup Docker MCP Toolkit

## Purpose

Configure Docker MCP Toolkit as the primary MCP infrastructure for AIOS, replacing 1MCP with the containerized gateway approach. This enables:
- **98.7% token reduction** via Code Mode
- **Dynamic MCP loading** (mcp-find, mcp-add, mcp-remove)
- **Sandbox execution** for workflows
- **270+ MCP catalog** access

## Architecture Overview

```
┌─────────────────────────────────────┐
│         Claude Code / Desktop        │
└──────────────────┬──────────────────┘
         
```