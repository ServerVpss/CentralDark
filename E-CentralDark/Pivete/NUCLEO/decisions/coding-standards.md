# DECISAO - coding-standards.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\framework\coding-standards.md
**SHA:** 023523c33b96a61f
**Timestamp:** 2026-08-28T02:02:34.687527
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
  Traducción: ES
  Original: /docs/en/framework/coding-standards.md
  Última sincronización: 2026-01-26
-->

# Estándares de Codificación AIOS

> 🌐 [EN](../../framework/coding-standards.md) | [PT](../../pt/framework/coding-standards.md) | **ES**

---

**Versión:** 1.1
**Última Actualización:** 2025-12-14
**Estado:** Estándar Oficial del Framework
**Aviso de Migración:** Este documento migrará al repositorio `SynkraAI/aios-core` en Q2 2026 (ver Decision 005)

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Estándares JavaScript/TypeScript](#estándares-javascripttypescript)
- [Organización de Archivos](#organización-de-archivos)
- [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
- [Calidad de Código](#calidad-de-código)
- [Estándares de Documentación](#estándares-de-documentación)
- [Estándares de Testing](#estándares-de-testing)
- [Convenciones Git](#convenciones-git)
- [Estándares de Seguridad](#estándares-de-seguridad)

---

## Descripción General

Este documento define los estándares oficiales de codificación para el desarrollo del framework AIOS. Todas las contribuciones de código deben adherirse a estos estándares para asegurar consistencia, mantenibilidad y calidad.

**Aplicación:**

- ESLint (automatizado)
- Prettier (automatizado)
- Revisión CodeRabbit (automatizada)
- Revisión humana (manual)

---

## Estándares JavaScript/TypeScript

### Versión del Lenguaje

```javascript
// Target: ES2022 (Node.js 18+)
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

### Configuración TypeScript

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

#### Indentación y Formateo

```javascript
// ✅ CORRECTO: Indentación de 2 espacios
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

**Configuración Prettier:**

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

#### Longitud de Línea

```javascript
// ✅ CORRECTO: Máximo 100 caracteres
const result = await executeTask(taskName, taskArgs, { timeout: 5000, retry: 3 });

// ❌ INCORRECTO: Más de 100 caracteres
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
    console.error(`Failed to load agent ${agentId}:`, error);
    throw error;
  }
}

// ❌ INCORRECTO: Cadenas de Promesas
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Failed to load agent ${agentId}:`, error);
      throw error;
    });
}
```

#### Desestructuración

```javascript
// ✅ CORRECTO: Desestructuración
const { name, id, enabled } = agent;
const [first, second, ...rest] = items;

// ❌ INCORRECTO: Extracción manual
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
// ✅ CORRECTO: Template literals para interpolación de strings
const message = `Agent ${agentName} loaded successfully`;
const path = `${baseDir}/${agentId}/config.yaml`;

// ❌ INCORRECTO: Concatenación de strings
const message = 'Agent ' + agentName + ' loaded successfully';
const path = baseDir + '/' + agentId + '/config.yaml';
```

### Manejo de Errores

```javascript
// ✅ CORRECTO: Manejo de errores
```

---

# DECISAO - coding-standards.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\coding-standards.md
**SHA:** 1b6f6224948a3632
**Timestamp:** 2026-08-28T02:02:38.645066
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
<!-- Tradução: PT-BR | Original: /docs/en/architecture/coding-standards.md | Sincronização: 2026-01-26 -->

# Padrões de Codificação AIOS

> 🌐 [EN](../../architecture/coding-standards.md) | **PT** | [ES](../../es/architecture/coding-standards.md)

---

> ⚠️ **DESCONTINUADO**: Este arquivo é mantido apenas para compatibilidade retroativa.
>
> **Versão oficial:** [docs/framework/coding-standards.md](../framework/coding-standards.md)
>
> Este arquivo será removido no Q2 2026 após consolidação completa em `docs/framework/`.

---

# Padrões de Codificação AIOS

**Versão:** 1.1
**Última Atualização:** 2025-12-14
**Status:** DESCONTINUADO - Veja docs/framework/coding-standards.md
**Aviso de Migração:** Este documento será migrado para o repositório `SynkraAI/aios-core` no Q2 2026 (veja Decisão 005)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Padrões JavaScript/TypeScript](#padrões-javascripttypescript)
- [Organização de Arquivos](#organização-de-arquivos)
- [Convenções de Nomenclatura](#convenções-de-nomenclatura)
- [Qualidade de Código](#qualidade-de-código)
- [Padrões de Documentação](#padrões-de-documentação)
- [Padrões de Teste](#padrões-de-teste)
- [Convenções Git](#convenções-git)
- [Padrões de Segurança](#padrões-de-segurança)

---

## Visão Geral

Este documento define os padrões oficiais de codificação para desenvolvimento do framework AIOS. Todas as contribuições de código devem aderir a estes padrões para garantir consistência, manutenibilidade e qualidade.

**Aplicação:**

- ESLint (automatizado)
- Prettier (automatizado)
- Revisão CodeRabbit (automatizada)
- Revisão humana (manual)

---

## Padrões JavaScript/TypeScript

### Versão da Linguagem

```javascript
// Alvo: ES2022 (Node.js 18+)
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
// ✅ BOM: Máximo 100 caracteres
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

### Padrões Modernos de JavaScript

#### Async/Await (Preferencial)

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

// ❌ RUIM: Cadeias de Promise
function loadAgent(agentId) {
  return fetchAgent(agentId)
    .then((agent) => loadConfig(agent.configPath).then((config) => ({ agent, config })))
    .catch((error) => {
      console.error(`Failed to load agent ${agentId}:`, error);
      throw error;
    });
}
```

#### Desestruturação

```javascript
// ✅ BOM: Desestruturação
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
const message = 'Agent ' + agentName + ' loaded suc
```