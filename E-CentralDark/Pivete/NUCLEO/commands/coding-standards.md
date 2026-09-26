# COMANDO - coding-standards.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\coding-standards.md
**SHA:** e6c27549d9d63048
**Timestamp:** 2026-08-28T02:02:34.358337
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm ci
- - run: npm run lint
- - run: npm run typecheck
- - run: npm test -- --coverage
- - run: npm audit

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Traduccion: ES | Original: /docs/en/architecture/coding-standards.md | Sincronizacion: 2026-01-26 -->

> ⚠️ **OBSOLETO**: Este archivo se mantiene solo por compatibilidad hacia atras.
>
> **Version oficial:** [docs/framework/coding-standards.md](../framework/coding-standards.md)
>
> Este archivo sera eliminado en Q2 2026 despues de la consolidacion completa a `docs/framework/`.

---

# Estandares de Codigo AIOS

> 🌐 [EN](../../architecture/coding-standards.md) | [PT](../../pt/architecture/coding-standards.md) | **ES**

---

**Version:** 1.1
**Ultima Actualizacion:** 2025-12-14
**Estado:** OBSOLETO - Ver docs/framework/coding-standards.md
**Aviso de Migracion:** Este documento migrara al repositorio `SynkraAI/aios-core` en Q2 2026 (ver Decision 005)

---

## 📋 Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Estandares JavaScript/TypeScript](#estandares-javascripttypescript)
- [Organizacion de Archivos](#organizacion-de-archivos)
- [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
- [Calidad de Codigo](#calidad-de-codigo)
- [Estandares de Documentacion](#estandares-de-documentacion)
- [Estandares de Testing](#estandares-de-testing)
- [Convenciones de Git](#convenciones-de-git)
- [Estandares de Seguridad](#estandares-de-seguridad)

---

## Descripcion General

Este documento define los estandares oficiales de codigo para el desarrollo del framework AIOS. Todas las contribuciones de codigo deben adherirse a estos estandares para asegurar consistencia, mantenibilidad y calidad.

**Aplicacion:**

- ESLint (automatizado)
- Prettier (automatizado)
- Revision de CodeRabbit (automatizado)
- Revision humana (manual)

---

## Estandares JavaScript/TypeScript

### Version del Lenguaje

```javascript
// Objetivo: ES2022 (Node.js 18+)
// TypeScript: 5.x

// ✅ CORRECTO: Sintaxis moderna
const data = await fetchData();
const { id, name } = data;

// ❌ INCORRECTO: Sintaxis obsoleta
fetchData().then(function (data) {
  var id = data.id;
  var name = data.name;
});
```

### Configuracion de TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Estilo de Codigo

#### Indentacion y Formato

```javascript
// ✅ CORRECTO: 2 espacios de indentacion
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}

// ❌ INCORRECTO: 4 espacios o tabs
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}
```

**Configuracion de Prettier:**

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

#### Longitud de Linea

```javascript
// ✅ CORRECTO: Maximo 100 caracteres
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ INCORRECTO: Mas de 100 caracteres
const result = await executeTask(taskName, taskArgs, {
  timeout: 5000,
  retry: 3,
  failureCallback: onFailure,
});
```

#### Comillas

```javascript
// ✅ CORRECTO: Comillas simples para strings
const agentName = 'developer';
const message = `Agent ${agentName} activated`;

// ❌ INCORRECTO: Comillas dobles (excepto JSON)
const agentName = 'developer';
```

### Patrones Modernos de JavaScript

#### Async/Await (Preferido)

```javascript
// ✅ CORRECTO: async/await
async function loadAgent(agentId) {
  try {
    const agent = await fetchAgent(agentId);
    const config = await loadConfig(agent.configPath);
    return { agent, config };
  } catch (error) {
    console.error(`Error al cargar agente ${agentId}:`, error);
    throw error;
  }
}

// ❌ INCORRECTO: Cadenas de Promise
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Error al cargar agente ${agentId}:`, error);
      throw error;
    });
}
```

#### Desestructuracion

```javascript
// ✅ CORRECTO: Desestructuracion
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ INCORRECTO: Extraccion manual
const name = agent.name;
const id = agent.id;
const enabled = agent.enabled;
```

#### Funciones Flecha

```javascript
// ✅ CORRECTO: Funciones flecha para callbacks
const activeAgents = agents.filter((agent) => agent.enabled);
const agentNames = agents.map((agent) => agent.name);

// ❌ INCORRECTO: Funciones tradicionales para callbacks simples
const activeAgents = agents.filter(function (agent) {
  return agent.enabled;
});
```

#### Template Literals

```javascript
// ✅ CORRECTO: Template literals para interpolacion de strings
const message = `Agente ${agent
```

---

# COMANDO - coding-standards.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\framework\coding-standards.md
**SHA:** 46c8988c1e31a224
**Timestamp:** 2026-08-28T02:02:36.073273
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm ci
- - run: npm run lint
- - run: npm run typecheck
- - run: npm test -- --coverage
- - run: npm audit

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Coding Standards

> 🌐 **EN** | [PT](../pt/framework/coding-standards.md) | [ES](../es/framework/coding-standards.md)

**Version:** 1.1
**Last Updated:** 2025-12-14
**Status:** Official Framework Standard
**Migration Notice:** This document will migrate to `SynkraAI/aios-core` repository in Q2 2026 (see Decision 005)

---

## 📋 Table of Contents

- [Overview](#overview)
- [JavaScript/TypeScript Standards](#javascripttypescript-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Quality](#code-quality)
- [Documentation Standards](#documentation-standards)
- [Testing Standards](#testing-standards)
- [Git Conventions](#git-conventions)
- [Security Standards](#security-standards)

---

## Overview

This document defines the official coding standards for AIOS framework development. All code contributions must adhere to these standards to ensure consistency, maintainability, and quality.

**Enforcement:**

- ESLint (automated)
- Prettier (automated)
- CodeRabbit review (automated)
- Human review (manual)

---

## JavaScript/TypeScript Standards

### Language Version

```javascript
// Target: ES2022 (Node.js 18+)
// TypeScript: 5.x

// ✅ GOOD: Modern syntax
const data = await fetchData();
const { id, name } = data;

// ❌ BAD: Outdated syntax
fetchData().then(function (data) {
  var id = data.id;
  var name = data.name;
});
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Code Style

#### Indentation & Formatting

```javascript
// ✅ GOOD: 2 spaces indentation
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}

// ❌ BAD: 4 spaces or tabs
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}
```

**Prettier Configuration:**

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

#### Line Length

```javascript
// ✅ GOOD: Max 100 characters
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ BAD: Over 100 characters
const result = await executeTask(taskName, taskArgs, {
  timeout: 5000,
  retry: 3,
  failureCallback: onFailure,
});
```

#### Quotes

```javascript
// ✅ GOOD: Single quotes for strings
const agentName = 'developer';
const message = `Agent ${agentName} activated`;

// ❌ BAD: Double quotes (except JSON)
const agentName = 'developer';
```

### Modern JavaScript Patterns

#### Async/Await (Preferred)

```javascript
// ✅ GOOD: async/await
async function loadAgent(agentId) {
  try {
    const agent = await fetchAgent(agentId);
    const config = await loadConfig(agent.configPath);
    return { agent, config };
  } catch (error) {
    console.error(`Failed to load agent ${agentId}:`, error);
    throw error;
  }
}

// ❌ BAD: Promise chains
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Failed to load agent ${agentId}:`, error);
      throw error;
    });
}
```

#### Destructuring

```javascript
// ✅ GOOD: Destructuring
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ BAD: Manual extraction
const name = agent.name;
const id = agent.id;
const enabled = agent.enabled;
```

#### Arrow Functions

```javascript
// ✅ GOOD: Arrow functions for callbacks
const activeAgents = agents.filter((agent) => agent.enabled);
const agentNames = agents.map((agent) => agent.name);

// ❌ BAD: Traditional functions for simple callbacks
const activeAgents = agents.filter(function (agent) {
  return agent.enabled;
});
```

#### Template Literals

```javascript
// ✅ GOOD: Template literals for string interpolation
const message = `Agent ${agentName} loaded successfully`;
const path = `${baseDir}/${agentId}/config.yaml`;

// ❌ BAD: String concatenation
const message = 'Agent ' + agentName + ' loaded successfully';
const path = baseDir + '/' + agentId + '/config.yaml';
```

### Error Handling

```javascript
// ✅ GOOD: Specific error handling with context
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.error(`Task execution failed [${taskName}]:`, error);
    throw new Error(`Failed to execute task "${taskName}": ${error.message}`);
  }
}

// ❌ BAD: Silent failures or generic errors
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await 
```

---

# COMANDO - coding-standards.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\framework\coding-standards.md
**SHA:** 898b747ab63a8e05
**Timestamp:** 2026-08-28T02:02:39.205490
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm ci
- - run: npm run lint
- - run: npm run typecheck
- - run: npm test -- --coverage
- - run: npm audit

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Tradução: PT-BR
  Original: /docs/en/framework/coding-standards.md
  Última sincronização: 2026-01-26
-->

# Padrões de Código AIOS

> 🌐 [EN](../../framework/coding-standards.md) | **PT** | [ES](../../es/framework/coding-standards.md)

---

**Versão:** 1.1
**Última Atualização:** 2025-12-14
**Status:** Padrão Oficial do Framework
**Aviso de Migração:** Este documento migrará para o repositório `SynkraAI/aios-core` em Q2 2026 (veja Decision 005)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Padrões JavaScript/TypeScript](#padrões-javascripttypescript)
- [Organização de Arquivos](#organização-de-arquivos)
- [Convenções de Nomenclatura](#convenções-de-nomenclatura)
- [Qualidade de Código](#qualidade-de-código)
- [Padrões de Documentação](#padrões-de-documentação)
- [Padrões de Testes](#padrões-de-testes)
- [Convenções Git](#convenções-git)
- [Padrões de Segurança](#padrões-de-segurança)

---

## Visão Geral

Este documento define os padrões de código oficiais para desenvolvimento do framework AIOS. Todas as contribuições de código devem aderir a estes padrões para garantir consistência, manutenibilidade e qualidade.

**Aplicação:**

- ESLint (automatizado)
- Prettier (automatizado)
- Revisão CodeRabbit (automatizado)
- Revisão humana (manual)

---

## Padrões JavaScript/TypeScript

### Versão da Linguagem

```javascript
// Target: ES2022 (Node.js 18+)
// TypeScript: 5.x

// ✅ BOM: Sintaxe moderna
const data = await fetchData();
const { id, name } = data;

// ❌ RUIM: Sintaxe desatualizada
fetchData().then(function (data) {
  var id = data.id;
  var name = data.name;
});
```

### Configuração TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Estilo de Código

#### Indentação e Formatação

```javascript
// ✅ BOM: Indentação de 2 espaços
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}

// ❌ RUIM: 4 espaços ou tabs
function processAgent(agent) {
  if (agent.enabled) {
    return loadAgent(agent);
  }
  return null;
}
```

**Configuração Prettier:**

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

#### Comprimento de Linha

```javascript
// ✅ BOM: Máximo de 100 caracteres
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ RUIM: Mais de 100 caracteres
const result = await executeTask(taskName, taskArgs, {
  timeout: 5000,
  retry: 3,
  failureCallback: onFailure,
});
```

#### Aspas

```javascript
// ✅ BOM: Aspas simples para strings
const agentName = 'developer';
const message = `Agent ${agentName} activated`;

// ❌ RUIM: Aspas duplas (exceto JSON)
const agentName = 'developer';
```

### Patterns JavaScript Modernos

#### Async/Await (Preferido)

```javascript
// ✅ BOM: async/await
async function loadAgent(agentId) {
  try {
    const agent = await fetchAgent(agentId);
    const config = await loadConfig(agent.configPath);
    return { agent, config };
  } catch (error) {
    console.error(`Failed to load agent ${agentId}:`, error);
    throw error;
  }
}

// ❌ RUIM: Promise chains
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Failed to load agent ${agentId}:`, error);
      throw error;
    });
}
```

#### Destructuring

```javascript
// ✅ BOM: Destructuring
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ RUIM: Extração manual
const name = agent.name;
const id = agent.id;
const enabled = agent.enabled;
```

#### Arrow Functions

```javascript
// ✅ BOM: Arrow functions para callbacks
const activeAgents = agents.filter((agent) => agent.enabled);
const agentNames = agents.map((agent) => agent.name);

// ❌ RUIM: Funções tradicionais para callbacks simples
const activeAgents = agents.filter(function (agent) {
  return agent.enabled;
});
```

#### Template Literals

```javascript
// ✅ BOM: Template literals para interpolação de strings
const message = `Agent ${agentName} loaded successfully`;
const path = `${baseDir}/${agentId}/config.yaml`;

// ❌ RUIM: Concatenação de strings
const message = 'Agent ' + agentName + ' loaded successfully';
const path = baseDir + '/' + agentId + '/config.yaml';
```

### Tratamento de Erros

```javascript
// ✅ BOM: Tratamento específico de erros com contexto
async function executeTask(taskName) {
  try {
    const task = await loadTask(taskName);
    return await task.execute();
  } catch (error) {
    console.error(`Task execution failed [${taskNam
```