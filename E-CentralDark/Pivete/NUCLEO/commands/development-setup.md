# COMANDO - development-setup.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\guides\development-setup.md
**SHA:** 23a911cc83fb7f75
**Timestamp:** 2026-08-28T02:02:34.932220
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- npm test -- --testPathPattern="agent"

### Riscos
- blocker: true
- blocker: true

### Gaps
- - Si Z falta: Solicitar input

### Ouro Bruto (primeiros 5000 chars)
```
# Guia de Configuracion para Desarrollo

> [EN](../../guides/development-setup.md) | [PT](../../pt/guides/development-setup.md) | **ES**

---

Guia completa para desarrolladores que quieren contribuir al proyecto Synkra AIOS.

**Version:** 1.0.0
**Ultima Actualizacion:** 2026-01-29

---

## Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Fork y Clonacion](#fork-y-clonacion)
3. [Configuracion del Entorno](#configuracion-del-entorno)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Ejecutar Tests](#ejecutar-tests)
6. [Agregar Nuevos Agentes](#agregar-nuevos-agentes)
7. [Crear Nuevas Tasks](#crear-nuevas-tasks)
8. [Crear Nuevos Workflows](#crear-nuevos-workflows)
9. [Estandares de Codigo](#estandares-de-codigo)
10. [Proceso de PR y Code Review](#proceso-de-pr-y-code-review)
11. [Debug y Solucion de Problemas](#debug-y-solucion-de-problemas)

---

## Prerrequisitos

Antes de comenzar, asegurate de tener instalado lo siguiente:

| Herramienta    | Version Minima  | Comando de Verificacion | Proposito          |
| -------------- | --------------- | ----------------------- | ------------------ |
| **Node.js**    | 18.0.0          | `node --version`        | Runtime JavaScript |
| **npm**        | 9.0.0           | `npm --version`         | Gestor de paquetes |
| **Git**        | 2.30+           | `git --version`         | Control de versiones |
| **GitHub CLI** | 2.0+            | `gh --version`          | Operaciones GitHub |

### Herramientas Recomendadas

| Herramienta          | Proposito                                   |
| -------------------- | ------------------------------------------- |
| **Claude Code**      | Desarrollo potenciado por IA con agentes AIOS |
| **VS Code / Cursor** | IDE con integracion AIOS                    |
| **Docker Desktop**   | Servidores MCP y herramientas containerizadas |

### Instalacion de Prerrequisitos

**macOS (Homebrew):**

```bash
# Instalar Node.js
brew install node@18

# Instalar GitHub CLI
gh auth login
```

**Windows (Chocolatey):**

```bash
# Instalar Node.js
choco install nodejs-lts

# Instalar GitHub CLI
choco install gh

# Autenticar GitHub CLI
gh auth login
```

**Linux (Ubuntu/Debian):**

```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar GitHub CLI
sudo apt install gh

# Autenticar GitHub CLI
gh auth login
```

---

## Fork y Clonacion

### Paso 1: Fork del Repositorio

1. Navega a [github.com/SynkraAI/aios-core](https://github.com/SynkraAI/aios-core)
2. Haz clic en el boton **Fork** en la esquina superior derecha
3. Selecciona tu cuenta de GitHub como destino

### Paso 2: Clonar tu Fork

```bash
# Clonar tu fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core

# Agregar remote upstream
git remote add upstream https://github.com/SynkraAI/aios-core.git

# Verificar remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/aios-core.git (fetch)
# origin    https://github.com/YOUR_USERNAME/aios-core.git (push)
# upstream  https://github.com/SynkraAI/aios-core.git (fetch)
# upstream  https://github.com/SynkraAI/aios-core.git (push)
```

### Paso 3: Mantenerse Actualizado

```bash
# Obtener ultimos cambios del upstream
git fetch upstream

# Mergear upstream main en tu main local
git checkout main
git merge upstream/main

# Pushear a tu fork
git push origin main
```

---

## Configuracion del Entorno

### Paso 1: Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# Esto tambien:
# - Configura Husky git hooks (via script prepare)
# - Instala dependencias del workspace
```

### Paso 2: Variables de Entorno

Crea un archivo `.env` en la raiz del proyecto (este archivo esta en gitignore):

```bash
# Configuracion del Proveedor AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# Opcional: Fallback OpenAI
OPENAI_API_KEY=your-openai-api-key

# Configuraciones del Framework
NODE_ENV=development
AIOS_DEBUG=false

# Opcional: Configuracion MCP
SYNKRA_API_TOKEN=your-synkra-token
```

### Paso 3: Verificar Instalacion

```bash
# Ejecutar suite de tests
npm test

# Verificar linting
npm run lint

# Verificar TypeScript
npm run typecheck

# Validar estructura del proyecto
npm run validate:structure
```

### Paso 4: Integracion con IDE (Opcional)

Sincroniza los agentes AIOS con tu IDE:

```bash
# Sincronizar con todos los IDEs soportados
npm run sync:ide

# Sincronizar con IDE especifico
npm run sync:ide:cursor
npm run sync:ide:windsurf

# Validar sincronizacion
npm run sync:ide:validate
```

---

## Estructura del Proyecto

Entendiendo la estructura de directorios de `aios-core`:

```
aios-core/
├── .aios-core/                    # Fuente del framework (committed)
│   ├── core/                      # Utilidades core y configuracion
│   │   ├── config/                # Archivos de configuracion del framework
│   │   ├── docs/                  # Documentacion interna
│   │   └── registry/              # R
```

---

# COMANDO - development-setup.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\development-setup.md
**SHA:** fe5513918849d1af
**Timestamp:** 2026-08-28T02:02:36.227750
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- npm test -- --testPathPattern="agent"

### Riscos
- blocker: true
- blocker: true

### Gaps
- - If Z is missing: Prompt for input

### Ouro Bruto (primeiros 5000 chars)
```
# Development Setup Guide

> **EN** | [PT](../pt/guides/development-setup.md) | [ES](../es/guides/development-setup.md)

---

Complete guide for developers who want to contribute to the Synkra AIOS project.

**Version:** 1.0.0
**Last Updated:** 2026-01-29

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Fork and Clone](#fork-and-clone)
3. [Environment Setup](#environment-setup)
4. [Project Structure](#project-structure)
5. [Running Tests](#running-tests)
6. [Adding New Agents](#adding-new-agents)
7. [Creating New Tasks](#creating-new-tasks)
8. [Creating New Workflows](#creating-new-workflows)
9. [Code Standards](#code-standards)
10. [PR and Code Review Process](#pr-and-code-review-process)
11. [Debug and Troubleshooting](#debug-and-troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed:

| Tool           | Minimum Version | Check Command    | Purpose            |
| -------------- | --------------- | ---------------- | ------------------ |
| **Node.js**    | 18.0.0          | `node --version` | JavaScript runtime |
| **npm**        | 9.0.0           | `npm --version`  | Package manager    |
| **Git**        | 2.30+           | `git --version`  | Version control    |
| **GitHub CLI** | 2.0+            | `gh --version`   | GitHub operations  |

### Recommended Tools

| Tool                 | Purpose                                 |
| -------------------- | --------------------------------------- |
| **Claude Code**      | AI-powered development with AIOS agents |
| **VS Code / Cursor** | IDE with AIOS integration               |
| **Docker Desktop**   | MCP servers and containerized tools     |

### Installing Prerequisites

**macOS (Homebrew):**

```bash
# Install Node.js
brew install node@18

# Install GitHub CLI
brew install gh

# Authenticate GitHub CLI
gh auth login
```

**Windows (Chocolatey):**

```bash
# Install Node.js
choco install nodejs-lts

# Install GitHub CLI
choco install gh

# Authenticate GitHub CLI
gh auth login
```

**Linux (Ubuntu/Debian):**

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install GitHub CLI
sudo apt install gh

# Authenticate GitHub CLI
gh auth login
```

---

## Fork and Clone

### Step 1: Fork the Repository

1. Navigate to [github.com/SynkraAI/aios-core](https://github.com/SynkraAI/aios-core)
2. Click the **Fork** button in the top-right corner
3. Select your GitHub account as the destination

### Step 2: Clone Your Fork

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core

# Add upstream remote
git remote add upstream https://github.com/SynkraAI/aios-core.git

# Verify remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/aios-core.git (fetch)
# origin    https://github.com/YOUR_USERNAME/aios-core.git (push)
# upstream  https://github.com/SynkraAI/aios-core.git (fetch)
# upstream  https://github.com/SynkraAI/aios-core.git (push)
```

### Step 3: Stay Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge upstream main into your local main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## Environment Setup

### Step 1: Install Dependencies

```bash
# Install all dependencies
npm install

# This will also:
# - Set up Husky git hooks (via prepare script)
# - Install workspace dependencies
```

### Step 2: Environment Variables

Create a `.env` file in the project root (this file is gitignored):

```bash
# AI Provider Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: OpenAI fallback
OPENAI_API_KEY=your-openai-api-key

# Framework Settings
NODE_ENV=development
AIOS_DEBUG=false

# Optional: MCP Configuration
SYNKRA_API_TOKEN=your-synkra-token
```

### Step 3: Verify Installation

```bash
# Run the test suite
npm test

# Check linting
npm run lint

# Check TypeScript
npm run typecheck

# Validate project structure
npm run validate:structure
```

### Step 4: IDE Integration (Optional)

Sync AIOS agents to your IDE:

```bash
# Sync to all supported IDEs
npm run sync:ide

# Sync to specific IDE
npm run sync:ide:cursor
npm run sync:ide:windsurf

# Validate sync
npm run sync:ide:validate
```

---

## Project Structure

Understanding the `aios-core` directory structure:

```
aios-core/
├── .aios-core/                    # Framework source (committed)
│   ├── core/                      # Core utilities and config
│   │   ├── config/                # Framework configuration files
│   │   ├── docs/                  # Internal documentation
│   │   └── registry/              # Component registry
│   │
│   ├── development/               # Development assets
│   │   ├── agents/                # Agent definitions (*.md)
│   │   ├── checklists/            # Validation checklists
│   │   ├── scripts/               # Utility scripts (JS)
│   │   ├── tasks/                 # Task workflows (*.
```

---

# COMANDO - development-setup.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\guides\development-setup.md
**SHA:** b91c2f98c7ec7be4
**Timestamp:** 2026-08-28T02:02:39.424294
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- npm test -- --testPathPattern="agent"

### Riscos
- blocker: true
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Guia de Configuração de Desenvolvimento

> [EN](../../guides/development-setup.md) | **PT** | [ES](../../es/guides/development-setup.md)

---

Guia completo para desenvolvedores que desejam contribuir com o projeto Synkra AIOS.

**Versão:** 1.0.0
**Última Atualização:** 2026-01-29

---

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Fork e Clone](#fork-e-clone)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Executando Testes](#executando-testes)
6. [Adicionando Novos Agentes](#adicionando-novos-agentes)
7. [Criando Novas Tasks](#criando-novas-tasks)
8. [Criando Novos Workflows](#criando-novos-workflows)
9. [Padrões de Código](#padrões-de-código)
10. [Processo de PR e Code Review](#processo-de-pr-e-code-review)
11. [Debug e Solução de Problemas](#debug-e-solução-de-problemas)

---

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes itens instalados:

| Ferramenta     | Versão Mínima   | Comando de Verificação | Finalidade           |
| -------------- | --------------- | ---------------------- | -------------------- |
| **Node.js**    | 18.0.0          | `node --version`       | Runtime JavaScript   |
| **npm**        | 9.0.0           | `npm --version`        | Gerenciador de pacotes |
| **Git**        | 2.30+           | `git --version`        | Controle de versão   |
| **GitHub CLI** | 2.0+            | `gh --version`         | Operações no GitHub  |

### Ferramentas Recomendadas

| Ferramenta           | Finalidade                                    |
| -------------------- | --------------------------------------------- |
| **Claude Code**      | Desenvolvimento com IA usando agentes AIOS    |
| **VS Code / Cursor** | IDE com integração AIOS                       |
| **Docker Desktop**   | Servidores MCP e ferramentas containerizadas  |

### Instalando os Pré-requisitos

**macOS (Homebrew):**

```bash
# Instalar Node.js
brew install node@18

# Instalar GitHub CLI
brew install gh

# Autenticar GitHub CLI
gh auth login
```

**Windows (Chocolatey):**

```bash
# Instalar Node.js
choco install nodejs-lts

# Instalar GitHub CLI
choco install gh

# Autenticar GitHub CLI
gh auth login
```

**Linux (Ubuntu/Debian):**

```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar GitHub CLI
sudo apt install gh

# Autenticar GitHub CLI
gh auth login
```

---

## Fork e Clone

### Passo 1: Fazer Fork do Repositório

1. Navegue até [github.com/SynkraAI/aios-core](https://github.com/SynkraAI/aios-core)
2. Clique no botão **Fork** no canto superior direito
3. Selecione sua conta do GitHub como destino

### Passo 2: Clonar Seu Fork

```bash
# Clonar seu fork
git clone https://github.com/YOUR_USERNAME/aios-core.git
cd aios-core

# Adicionar remote upstream
git remote add upstream https://github.com/SynkraAI/aios-core.git

# Verificar remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/aios-core.git (fetch)
# origin    https://github.com/YOUR_USERNAME/aios-core.git (push)
# upstream  https://github.com/SynkraAI/aios-core.git (fetch)
# upstream  https://github.com/SynkraAI/aios-core.git (push)
```

### Passo 3: Manter-se Atualizado

```bash
# Buscar últimas alterações do upstream
git fetch upstream

# Fazer merge do main upstream no seu main local
git checkout main
git merge upstream/main

# Enviar para seu fork
git push origin main
```

---

## Configuração do Ambiente

### Passo 1: Instalar Dependências

```bash
# Instalar todas as dependências
npm install

# Isso também irá:
# - Configurar hooks do Husky (via script prepare)
# - Instalar dependências do workspace
```

### Passo 2: Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (este arquivo é ignorado pelo git):

```bash
# Configuração do Provedor de IA
ANTHROPIC_API_KEY=your-anthropic-api-key

# Opcional: Fallback OpenAI
OPENAI_API_KEY=your-openai-api-key

# Configurações do Framework
NODE_ENV=development
AIOS_DEBUG=false

# Opcional: Configuração MCP
SYNKRA_API_TOKEN=your-synkra-token
```

### Passo 3: Verificar Instalação

```bash
# Executar a suite de testes
npm test

# Verificar linting
npm run lint

# Verificar TypeScript
npm run typecheck

# Validar estrutura do projeto
npm run validate:structure
```

### Passo 4: Integração com IDE (Opcional)

Sincronizar agentes AIOS com sua IDE:

```bash
# Sincronizar para todas as IDEs suportadas
npm run sync:ide

# Sincronizar para IDE específica
npm run sync:ide:cursor
npm run sync:ide:windsurf

# Validar sincronização
npm run sync:ide:validate
```

---

## Estrutura do Projeto

Entendendo a estrutura de diretórios do `aios-core`:

```
aios-core/
├── .aios-core/                    # Fonte do framework (commitado)
│   ├── core/                      # Utilitários e configurações principais
│   │   ├── config/                # Arquivos de configuração do framework
│   │   ├── docs/                  # Documentação inter
```