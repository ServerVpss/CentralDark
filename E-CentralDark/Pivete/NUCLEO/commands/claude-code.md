# COMANDO - claude-code.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\platforms\claude-code.md
**SHA:** 379fe059fffb98dd
**Timestamp:** 2026-08-28T02:02:35.424215
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: async (context) => {

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Traducción: ES | Original: /docs/platforms/en/claude-code.md | Sincronización: 2026-01-26 -->

# Guía AIOS para Claude Code

> 🌐 [EN](../../platforms/claude-code.md) | [PT](../../pt/platforms/claude-code.md) | **ES**

---

> **CLI Oficial de Anthropic** - Plataforma Recomendada para AIOS

---

## Descripción General

### ¿Qué es Claude Code?

Claude Code es la interfaz de línea de comandos oficial de Anthropic para Claude, diseñada para desarrolladores que desean acceso directo y poderoso a las capacidades de Claude en su terminal y flujo de trabajo de desarrollo.

### ¿Por qué usar AIOS con Claude Code?

Claude Code ofrece la **mejor integración** con AIOS debido a:

- **Soporte MCP Nativo**: Protocolo de Contexto de Modelo integrado para extensiones de herramientas
- **Herramienta de Tareas**: Genera subagentos para operaciones complejas de múltiples pasos
- **Sistema de Hooks**: Hooks de pre y post-ejecución para automatización
- **Habilidades/Comandos**: Soporte nativo de comandos slash para activación de agentes
- **Persistencia de Memoria**: Preservación del contexto de sesión
- **Acceso Directo a Archivos**: Lee, escribe y edita archivos de forma nativa

### Comparación con Otras Plataformas

| Característica | Claude Code | Cursor | Windsurf |
|---|:-:|:-:|:-:|
| Soporte MCP | Nativo | Configuración | Configuración |
| Tareas de Subagentos | Sí | No | No |
| Sistema de Hooks | Sí | No | No |
| Habilidades | Nativas | No | No |
| Basado en CLI | Sí | No | No |

---

## Requisitos

### Requisitos del Sistema

| Requisito | Mínimo | Recomendado |
|---|---|---|
| **Node.js** | 18.0+ | 20.0+ |
| **npm** | 9.0+ | 10.0+ |
| **Git** | 2.30+ | Última versión |
| **SO** | macOS, Linux, Windows (WSL) | macOS, Linux |

### Requisitos de API

- **Clave API de Anthropic** o **suscripción Claude Pro/Team**
- Acceso de API habilitado para Claude Code

### Herramientas Recomendadas

- GitHub CLI (`gh`) para operaciones de repositorio
- Un emulador de terminal moderno (iTerm2, Warp, Alacritty)

---

## Instalación

### Paso 1: Instalar Claude Code

**Instalación Nativa (Recomendado):**

```bash
# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

**Métodos Alternativos:**

```bash
# Homebrew (macOS)
brew install --cask claude-code

# WinGet (Windows)
winget install Anthropic.ClaudeCode
```

> **Nota:** La instalación por NPM (`npm install -g @anthropic-ai/claude-code`) está deprecada. Usa la instalación nativa para actualizaciones automáticas.

### Paso 2: Autenticar

```bash
# Inicia sesión con tu cuenta de Anthropic
claude login

# O establece la clave API directamente
export ANTHROPIC_API_KEY="tu-clave-api"
```

### Paso 3: Instalar AIOS

```bash
# Navega a tu proyecto
cd tu-proyecto

# Inicializa AIOS
npx @anthropic/aios init

# Selecciona "Claude Code" cuando se te solicite el IDE
```

### Paso 4: Verificar Instalación

```bash
# Verifica el tipo de instalación y versión
claude doctor

# Verifica que los archivos AIOS fueron creados
ls -la .claude/
```

Estructura esperada:
```
.claude/
├── commands/
│   └── AIOS/
│       └── agents/        # Agentes sincronizados
├── settings.json          # Configuración local
└── settings.local.json    # Anulaciones locales

~/.claude/                 # Directorio de configuración global
~/.claude.json             # Configuración MCP global
```

---

## Configuración

### Archivo de Configuración Principal

**Ubicación:** `.claude/CLAUDE.md`

Este archivo contiene:
- Contexto del proyecto y reglas
- Instrucciones de activación de agentes
- Metodología de desarrollo
- Comprensión del marco AIOS

### Variables de Entorno

```bash
# Requeridas
export ANTHROPIC_API_KEY="sk-ant-..."

# Opcionales
export CLAUDE_MODEL="claude-sonnet-4-20250514"  # Modelo por defecto
export CLAUDE_MAX_TOKENS="8192"                 # Tokens máximos de respuesta
export AIOS_DEBUG="true"                        # Habilitar registro de depuración
```

### Archivo de Configuración

**Ubicación:** `.claude/settings.json`

```json
{
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 8192,
  "permissions": {
    "allowedTools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    "blockedCommands": ["rm -rf /", "sudo rm"]
  }
}
```

### Configuración MCP

**Ubicación:** `~/.claude.json` (global) o `.claude/mcp.json` (proyecto)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/ruta/permitida"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_..."
      }
    }
  }
}
```

---

## Uso Básico

### Iniciando Claude Code

```bash
# Inicia en el directorio actual
claude

# Inicia con contexto específico
claude --context "Trabajando en la característica X"

# Inicia con un archivo específico
claude --file src/main.ts
```

### Activando Age
```

---

# COMANDO - claude-code.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\platforms\claude-code.md
**SHA:** fad0adf7e0d18f40
**Timestamp:** 2026-08-28T02:02:39.910851
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: async (context) => {

### Ouro Bruto (primeiros 5000 chars)
```
# Guia AIOS para Claude Code

> 🌐 [EN](../../platforms/claude-code.md) | **PT** | [ES](../../es/platforms/claude-code.md)

---

> **CLI Oficial da Anthropic** - Plataforma Recomendada para AIOS

---

## Visão Geral

### O que é o Claude Code?

Claude Code é a interface de linha de comando oficial da Anthropic para o Claude, projetada para desenvolvedores que desejam acesso direto e poderoso às capacidades do Claude em seu terminal e fluxo de trabalho de desenvolvimento.

### Por que usar AIOS com Claude Code?

O Claude Code oferece a **melhor integração** com o AIOS devido a:

- **Suporte MCP Nativo**: Model Context Protocol integrado para extensões de ferramentas
- **Task Tool**: Criar subagentes para operações complexas de múltiplas etapas
- **Sistema de Hooks**: Hooks de pré e pós-execução para automação
- **Skills/Comandos**: Suporte nativo a comandos slash para ativação de agentes
- **Persistência de Memória**: Preservação de contexto da sessão
- **Acesso Direto a Arquivos**: Ler, escrever e editar arquivos nativamente

### Comparação com Outras Plataformas

| Recurso | Claude Code | Cursor | Windsurf |
|---------|:-----------:|:------:|:--------:|
| Suporte MCP | Nativo | Config | Config |
| Tarefas Subagente | Sim | Não | Não |
| Sistema de Hooks | Sim | Não | Não |
| Skills | Nativo | Não | Não |
| Baseado em CLI | Sim | Não | Não |

---

## Requisitos

### Requisitos de Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| **Node.js** | 18.0+ | 20.0+ |
| **npm** | 9.0+ | 10.0+ |
| **Git** | 2.30+ | Última versão |
| **SO** | macOS, Linux, Windows (WSL) | macOS, Linux |

### Requisitos de API

- **Chave de API Anthropic** ou **assinatura Claude Pro/Team**
- Acesso à API habilitado para Claude Code

### Ferramentas Recomendadas

- GitHub CLI (`gh`) para operações de repositório
- Um emulador de terminal moderno (iTerm2, Warp, Alacritty)

---

## Instalação

### Passo 1: Instalar o Claude Code

**Instalação Nativa (Recomendada):**

```bash
# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

**Métodos Alternativos:**

```bash
# Homebrew (macOS)
brew install --cask claude-code

# WinGet (Windows)
winget install Anthropic.ClaudeCode
```

> **Nota:** Instalação via NPM (`npm install -g @anthropic-ai/claude-code`) está deprecada. Use instalação nativa para atualizações automáticas.

### Passo 2: Autenticar

```bash
# Login com sua conta Anthropic
claude login

# Ou definir a chave API diretamente
export ANTHROPIC_API_KEY="sua-chave-api"
```

### Passo 3: Instalar o AIOS

```bash
# Navegue até seu projeto
cd seu-projeto

# Inicialize o AIOS
npx @anthropic/aios init

# Selecione "Claude Code" quando solicitado para IDE
```

### Passo 4: Verificar a Instalação

```bash
# Verificar tipo de instalação e versão
claude doctor

# Verificar se os arquivos AIOS foram criados
ls -la .claude/
```

Estrutura esperada:
```
.claude/
├── commands/
│   └── AIOS/
│       └── agents/        # Agentes sincronizados
├── settings.json          # Configurações locais
└── settings.local.json    # Sobrescritas locais

~/.claude/                 # Diretório de config global
~/.claude.json             # Configuração MCP global
```

---

## Configuração

### Arquivo de Configuração Principal

**Localização:** `.claude/CLAUDE.md`

Este arquivo contém:
- Contexto e regras do projeto
- Instruções de ativação de agentes
- Metodologia de desenvolvimento
- Entendimento do framework AIOS

### Variáveis de Ambiente

```bash
# Obrigatório
export ANTHROPIC_API_KEY="sk-ant-..."

# Opcional
export CLAUDE_MODEL="claude-sonnet-4-20250514"  # Modelo padrão
export CLAUDE_MAX_TOKENS="8192"                 # Máximo de tokens de resposta
export AIOS_DEBUG="true"                        # Habilitar log de debug
```

### Arquivo de Configurações

**Localização:** `.claude/settings.json`

```json
{
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 8192,
  "permissions": {
    "allowedTools": ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
    "blockedCommands": ["rm -rf /", "sudo rm"]
  }
}
```

### Configuração MCP

**Localização:** `~/.claude.json` (global) ou `.claude/mcp.json` (projeto)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/caminho/permitido"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_..."
      }
    }
  }
}
```

---

## Uso Básico

### Iniciando o Claude Code

```bash
# Iniciar no diretório atual
claude

# Iniciar com contexto específico
claude --context "Trabalhando na feature X"

# Iniciar com um arquivo específico
claude --file src/main.ts
```

### Ativando Agentes AIOS

Os agentes são ativados usando comandos slash:

```
/dev         # Agente Desenvolvedor
/qa          # Agente Engenheiro de QA
/architect   # Agente Arqui
```