# COMANDO - desktop-commander.yaml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\tools\mcp\desktop-commander.yaml
**SHA:** ec1a5db7def48d17
**Timestamp:** 2026-08-28T02:02:16.631015
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - wait_for_prompt: "Wait for response (default: true)"

### Padroes
- - pattern: "Search pattern"
- - filePattern: "Optional file filter (e.g., '*.js')"
- example: "start_search({ path: '/project/src', pattern: 'function.*export', searchType: 'content' })"

### Ouro Bruto (primeiros 5000 chars)
```
tool:
  schema_version: 1.0
  id: desktop-commander
  type: mcp
  name: Desktop Commander
  version: 1.0.0
  description: Powerful file system operations, process management, and system command execution
  knowledge_strategy: declarative

  capabilities:
    - Read and write files with intelligent chunking
    - Search files and content using Grep-like patterns
    - Execute shell commands and manage processes
    - Directory listing and file metadata
    - Move, copy, and delete files
    - Process management and monitoring

  use_cases:
    - file_operations: "Read, write, edit files in the project"
    - code_search: "Search for code patterns across files"
    - command_execution: "Run npm scripts, git commands, build tools"
    - process_monitoring: "Monitor running processes and resources"
    - bulk_operations: "Batch file operations"

  mcp_specific:
    server_command: "npx -y @wonderwhy-er/desktop-commander"
    transport: stdio
    environment_variables: []
    health_check:
      method: tool_call
      command: read_file
      expected_response: "File content returned"
      timeout_ms: 5000

  tools:
    - id: read_file
      description: "Read file contents with optional offset and length"
      parameters:
        - path: "Absolute path to file"
        - offset: "Start line (default: 0)"
        - length: "Max lines to read (default: 1000)"
        - isUrl: "Whether path is a URL (default: false)"

    - id: write_file
      description: "Write or append to file"
      parameters:
        - path: "Absolute path to file"
        - content: "Content to write"
        - mode: "Write mode: 'rewrite' or 'append' (default: 'rewrite')"

    - id: read_multiple_files
      description: "Read multiple files simultaneously"
      parameters:
        - paths: "Array of absolute file paths"

    - id: list_directory
      description: "List directory contents recursively"
      parameters:
        - path: "Directory path"
        - depth: "Recursion depth (default: 2)"

    - id: create_directory
      description: "Create new directory"
      parameters:
        - path: "Directory path to create"

    - id: move_file
      description: "Move or rename files"
      parameters:
        - source: "Source file path"
        - destination: "Destination path"

    - id: get_file_info
      description: "Get file metadata"
      parameters:
        - path: "File or directory path"

    - id: edit_block
      description: "Replace text in file surgically"
      parameters:
        - file_path: "File to edit"
        - old_string: "Text to replace"
        - new_string: "Replacement text"
        - expected_replacements: "Number of expected matches (default: 1)"

    - id: start_search
      description: "Start streaming file/content search"
      parameters:
        - path: "Search root directory"
        - pattern: "Search pattern"
        - searchType: "Type: 'files' or 'content' (default: 'files')"
        - filePattern: "Optional file filter (e.g., '*.js')"
        - literalSearch: "Exact string matching (default: false)"

    - id: get_more_search_results
      description: "Get more results from active search"
      parameters:
        - sessionId: "Search session ID"
        - offset: "Result offset (default: 0)"
        - length: "Max results (default: 100)"

    - id: stop_search
      description: "Stop active search"
      parameters:
        - sessionId: "Search session ID"

    - id: list_searches
      description: "List all active searches"
      parameters: []

    - id: start_process
      description: "Start terminal process with intelligent state detection"
      parameters:
        - command: "Command to execute"
        - timeout_ms: "Max execution time"
        - shell: "Optional shell (cmd, powershell, bash)"

    - id: read_process_output
      description: "Read output from running process"
      parameters:
        - pid: "Process ID"
        - timeout_ms: "Optional timeout"

    - id: interact_with_process
      description: "Send input to running process"
      parameters:
        - pid: "Process ID"
        - input: "Input to send"
        - timeout_ms: "Optional timeout (default: 8000)"
        - wait_for_prompt: "Wait for response (default: true)"

    - id: force_terminate
      description: "Force terminate process"
      parameters:
        - pid: "Process ID"

    - id: list_sessions
      description: "List all active terminal sessions"
      parameters: []

    - id: list_processes
      description: "List all running processes"
      parameters: []

    - id: kill_process
      description: "Terminate process by PID"
      parameters:
        - pid: "Process ID"

  workflow:
    typical_usage:
      - step: 1
        action: "Read project files to understand structure"
        example: "read_file({ path: '/project/package.json' })"
      - step: 2
        action: "Search for specific code patterns"
        example: "start_search({ path: '/project/src', pattern: 'function.*
```

---

# COMANDO - desktop-commander.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\guides\mcp\desktop-commander.md
**SHA:** 891d5f60a3416e5e
**Timestamp:** 2026-08-28T02:02:35.229323
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- repl_execute: const data = require('./config.json')
- repl_execute: Object.keys(data).length
- repl_execute: data.settings.enabled

### Ouro Bruto (primeiros 5000 chars)
```
# Desktop Commander MCP

> **ES**

---

Guía para usar el servidor MCP Desktop Commander con Claude Code para capacidades avanzadas de gestión de terminal y procesos.

**Versión:** 1.0.0
**Última Actualización:** 2026-01-28

---

## Descripción General

Desktop Commander es un servidor MCP que extiende Claude Code con capacidades avanzadas para la gestión del entorno local. Proporciona funcionalidades que las herramientas nativas de Claude Code no pueden hacer, haciéndolo esencial para ciertos flujos de trabajo.

### Cuándo Usar Desktop Commander

| Caso de Uso                              | Claude Code Nativo | Desktop Commander |
| ---------------------------------------- | ------------------ | ----------------- |
| Sesiones persistentes (SSH, REPL)        | No soportado       | **Recomendado**   |
| Procesos interactivos                    | Limitado           | **Recomendado**   |
| Edición difusa de archivos               | No soportado       | **Recomendado**   |
| Lectura de cola de archivo (offset negativo) | No soportado  | **Recomendado**   |
| Ejecución de código en memoria           | No soportado       | **Recomendado**   |
| Operaciones simples de archivos          | **Preferido**      | Más lento         |
| Operaciones Git                          | **Preferido**      | Innecesario       |
| Búsqueda de archivos (Glob, Grep)        | **Preferido**      | Innecesario       |

---

## Comparación de Capacidades

### Lo Que Desktop Commander Hace Que Claude Code No Puede

| Capacidad                         | Claude Code Nativo                                                  | Desktop Commander                                      |
| --------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| **Sesiones Persistentes**         | El estado del shell no persiste entre llamadas (solo working dir)   | Mantiene sesiones activas (SSH, bases de datos, REPL)  |
| **Ejecución de Código en Memoria**| Requiere Write → Bash                                               | Ejecución directa en REPL (Python, Node.js, R)         |
| **Edición Difusa**                | Edit requiere coincidencia EXACTA de old_string                     | Respaldo inteligente con búsqueda difusa               |
| **Offset Negativo (tail)**        | Read solo tiene offset positivo                                     | Lectura desde el final del archivo (como Unix tail)    |
| **Procesos Interactivos**         | Limitado (background sin stdin)                                     | Stdin/stdout bidireccional                             |
| **Configuración Dinámica**        | Requiere reinicio                                                   | Cambiar shell, directorios, comandos bloqueados al vuelo |
| **Registro de Auditoría**         | Básico en .claude.json                                              | Historial completo de herramientas y estadísticas de uso |

### Donde Claude Code Nativo es Suficiente

| Capacidad                         | Claude Code Nativo                 | Notas                                      |
| --------------------------------- | ---------------------------------- | ------------------------------------------ |
| **Búsqueda Paginada**             | Grep tiene `head_limit` y `offset` | Ya tiene capacidad de streaming            |
| **Gestión Multi-Sesión**          | Task tool + TaskOutput + /tasks    | Enfoque diferente pero funcional           |
| **Análisis CSV/JSON**             | Read + Bash con jq/python          | Funciona bien para la mayoría de los casos |

---

## Instalación

### Prerequisitos

- Node.js 18+
- Claude Code CLI instalado
- Soporte MCP habilitado

### Configuración

```bash
# Instalar desktop-commander globalmente
npm install -g @anthropic/desktop-commander

# O agregar a la configuración MCP de Claude Code
claude mcp add desktop-commander
```

### Configuración

Agregar a `~/.claude.json`:

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@anthropic/desktop-commander"]
    }
  }
}
```

---

## Herramientas Disponibles

### Gestión de Terminal

| Herramienta       | Descripción                                  |
| ----------------- | -------------------------------------------- |
| `execute_command` | Ejecutar comando shell con sesión persistente |
| `read_output`     | Leer salida del proceso en ejecución         |
| `send_input`      | Enviar entrada al proceso interactivo        |
| `force_terminate` | Terminar un proceso en ejecución             |
| `list_sessions`   | Listar todas las sesiones activas            |
| `list_processes`  | Listar procesos en ejecución                 |

### Operaciones de Archivos

| Herramienta      | Descripción                                          |
| ---------------- | ---------------------------------------------------- |
| `read_file`      | Leer archivo con soporte de offset
```

---

# COMANDO - desktop-commander.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\mcp\desktop-commander.md
**SHA:** cd28aec6121d0acb
**Timestamp:** 2026-08-28T02:02:37.054351
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- repl_execute: const data = require('./config.json')
- repl_execute: Object.keys(data).length
- repl_execute: data.settings.enabled

### Ouro Bruto (primeiros 5000 chars)
```
# Desktop Commander MCP

> **EN**

---

Guide for using Desktop Commander MCP server with Claude Code for advanced terminal and process management capabilities.

**Version:** 1.0.0
**Last Updated:** 2026-01-28

---

## Overview

Desktop Commander is an MCP server that extends Claude Code with advanced capabilities for local environment management. It provides features that Claude Code's native tools cannot do, making it essential for certain workflows.

### When to Use Desktop Commander

| Use Case                            | Native Claude Code | Desktop Commander |
| ----------------------------------- | ------------------ | ----------------- |
| Persistent sessions (SSH, REPL)     | Not supported      | **Recommended**   |
| Interactive processes               | Limited            | **Recommended**   |
| Fuzzy file editing                  | Not supported      | **Recommended**   |
| Reading file tail (negative offset) | Not supported      | **Recommended**   |
| In-memory code execution            | Not supported      | **Recommended**   |
| Simple file operations              | **Preferred**      | Slower            |
| Git operations                      | **Preferred**      | Unnecessary       |
| File search (Glob, Grep)            | **Preferred**      | Unnecessary       |

---

## Capabilities Comparison

### What Desktop Commander Does That Claude Code Cannot

| Capability                   | Claude Code Native                                           | Desktop Commander                                      |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| **Persistent Sessions**      | Shell state doesn't persist between calls (only working dir) | Maintains active sessions (SSH, databases, REPL)       |
| **In-Memory Code Execution** | Requires Write → Bash                                        | Direct REPL execution (Python, Node.js, R)             |
| **Fuzzy Editing**            | Edit requires EXACT match of old_string                      | Intelligent fallback with fuzzy search                 |
| **Negative Offset (tail)**   | Read only has positive offset                                | Read from end of file (like Unix tail)                 |
| **Interactive Processes**    | Limited (background without stdin)                           | Bidirectional stdin/stdout                             |
| **Dynamic Configuration**    | Requires restart                                             | Change shell, directories, blocked commands on the fly |
| **Audit Trail**              | Basic in .claude.json                                        | Complete tool history and usage statistics             |

### Where Claude Code Native is Sufficient

| Capability                   | Claude Code Native                 | Notes                             |
| ---------------------------- | ---------------------------------- | --------------------------------- |
| **Paginated Search**         | Grep has `head_limit` and `offset` | Already streaming-capable         |
| **Multi-Session Management** | Task tool + TaskOutput + /tasks    | Different approach but functional |
| **CSV/JSON Analysis**        | Read + Bash with jq/python         | Works well for most cases         |

---

## Installation

### Prerequisites

- Node.js 18+
- Claude Code CLI installed
- MCP support enabled

### Setup

```bash
# Install desktop-commander globally
npm install -g @anthropic/desktop-commander

# Or add to Claude Code MCP config
claude mcp add desktop-commander
```

### Configuration

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@anthropic/desktop-commander"]
    }
  }
}
```

---

## Available Tools

### Terminal Management

| Tool              | Description                               |
| ----------------- | ----------------------------------------- |
| `execute_command` | Run shell command with persistent session |
| `read_output`     | Read output from running process          |
| `send_input`      | Send input to interactive process         |
| `force_terminate` | Kill a running process                    |
| `list_sessions`   | List all active sessions                  |
| `list_processes`  | List running processes                    |

### File Operations

| Tool             | Description                                   |
| ---------------- | --------------------------------------------- |
| `read_file`      | Read file with negative offset support (tail) |
| `write_file`     | Write file content                            |
| `edit_block`     | Edit with fuzzy matching fallback             |
| `search_files`   | Search with streaming/pagination              |
| `get_file_info`  | Get file metadata                             |
| `list_directory` | List directory contents                       |

### Code Execution

| Tool
```

---

# COMANDO - desktop-commander.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\guides\mcp\desktop-commander.md
**SHA:** 76b6fad266bd4b56
**Timestamp:** 2026-08-28T02:02:39.694212
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- repl_execute: const data = require('./config.json')
- repl_execute: Object.keys(data).length
- repl_execute: data.settings.enabled

### Ouro Bruto (primeiros 5000 chars)
```
# Desktop Commander MCP

> **PT**

---

Guia para usar o servidor MCP Desktop Commander com Claude Code para capacidades avançadas de gerenciamento de terminal e processos.

**Versão:** 1.0.0
**Última Atualização:** 2026-01-28

---

## Visão Geral

Desktop Commander é um servidor MCP que estende o Claude Code com capacidades avançadas para gerenciamento de ambiente local. Ele fornece recursos que as ferramentas nativas do Claude Code não podem fazer, tornando-o essencial para certos fluxos de trabalho.

### Quando Usar Desktop Commander

| Caso de Uso                         | Claude Code Nativo | Desktop Commander |
| ----------------------------------- | ------------------ | ----------------- |
| Sessões persistentes (SSH, REPL)    | Não suportado      | **Recomendado**   |
| Processos interativos               | Limitado           | **Recomendado**   |
| Edição difusa de arquivos           | Não suportado      | **Recomendado**   |
| Leitura de final de arquivo (offset negativo) | Não suportado | **Recomendado** |
| Execução de código em memória       | Não suportado      | **Recomendado**   |
| Operações simples de arquivo        | **Preferível**     | Mais lento        |
| Operações Git                       | **Preferível**     | Desnecessário     |
| Busca de arquivos (Glob, Grep)      | **Preferível**     | Desnecessário     |

---

## Comparação de Capacidades

### O Que Desktop Commander Faz Que Claude Code Não Pode

| Capacidade                   | Claude Code Nativo                                           | Desktop Commander                                      |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| **Sessões Persistentes**     | Estado do shell não persiste entre chamadas (apenas diretório de trabalho) | Mantém sessões ativas (SSH, databases, REPL)          |
| **Execução de Código em Memória** | Requer Write → Bash                                    | Execução direta em REPL (Python, Node.js, R)           |
| **Edição Difusa**            | Edit requer correspondência EXATA de old_string              | Fallback inteligente com busca difusa                  |
| **Offset Negativo (tail)**   | Read tem apenas offset positivo                              | Leitura do final do arquivo (como Unix tail)           |
| **Processos Interativos**    | Limitado (background sem stdin)                              | stdin/stdout bidirecional                              |
| **Configuração Dinâmica**    | Requer reinicialização                                       | Muda shell, diretórios, comandos bloqueados dinamicamente |
| **Trilha de Auditoria**      | Básica em .claude.json                                       | Histórico completo de ferramentas e estatísticas de uso |

### Onde Claude Code Nativo é Suficiente

| Capacidade                   | Claude Code Nativo                 | Notas                             |
| ---------------------------- | ---------------------------------- | --------------------------------- |
| **Busca Paginada**           | Grep tem `head_limit` e `offset`   | Já possui capacidade de streaming |
| **Gerenciamento Multi-Sessão** | Task tool + TaskOutput + /tasks | Abordagem diferente mas funcional |
| **Análise CSV/JSON**         | Read + Bash com jq/python          | Funciona bem para a maioria dos casos |

---

## Instalação

### Pré-requisitos

- Node.js 18+
- Claude Code CLI instalado
- Suporte MCP habilitado

### Configuração

```bash
# Instalar desktop-commander globalmente
npm install -g @anthropic/desktop-commander

# Ou adicionar à configuração MCP do Claude Code
claude mcp add desktop-commander
```

### Configuração

Adicionar a `~/.claude.json`:

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@anthropic/desktop-commander"]
    }
  }
}
```

---

## Ferramentas Disponíveis

### Gerenciamento de Terminal

| Ferramenta        | Descrição                                     |
| ----------------- | --------------------------------------------- |
| `execute_command` | Executar comando shell com sessão persistente |
| `read_output`     | Ler saída de processo em execução             |
| `send_input`      | Enviar entrada para processo interativo       |
| `force_terminate` | Finalizar um processo em execução             |
| `list_sessions`   | Listar todas as sessões ativas                |
| `list_processes`  | Listar processos em execução                  |

### Operações de Arquivo

| Ferramenta       | Descrição                                              |
| ---------------- | ------------------------------------------------------ |
| `read_file`      | Ler arquivo com suporte a offset negativo (tail)       |
| `write_file`     | Escrever conteúdo de arquivo                           |
| `edit_block`     | Editar com fallback de correspondência difusa          |
| `search_files`   | Buscar com s
```