# COMANDO - tech-stack.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\tech-stack.md
**SHA:** f8ecd4591aeabe09
**Timestamp:** 2026-08-28T02:02:34.526730
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Cold Start: ~200ms (carga inicial)
- Warm Start: ~50ms (modulos en cache)

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Traduccion: ES | Original: /docs/en/architecture/tech-stack.md | Sincronizacion: 2026-01-26 -->

> ⚠️ **OBSOLETO**: Este archivo se mantiene solo por compatibilidad hacia atras.
>
> **Version oficial:** [docs/framework/tech-stack.md](../framework/tech-stack.md)
>
> Este archivo sera eliminado en Q2 2026 despues de la consolidacion completa a `docs/framework/`.

---

# Stack Tecnologico AIOS

> 🌐 [EN](../../architecture/tech-stack.md) | [PT](../../pt/architecture/tech-stack.md) | **ES**

---

**Version:** 1.1
**Ultima Actualizacion:** 2025-12-14
**Estado:** OBSOLETO - Ver docs/framework/tech-stack.md
**Aviso de Migracion:** Este documento migrara al repositorio `SynkraAI/aios-core` en Q2 2026 (ver Decision 005)

---

## 📋 Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Runtime Core](#runtime-core)
- [Lenguajes y Transpiladores](#lenguajes-y-transpiladores)
- [Dependencias Core](#dependencias-core)
- [Herramientas de Desarrollo](#herramientas-de-desarrollo)
- [Framework de Testing](#framework-de-testing)
- [Build y Deployment](#build-y-deployment)
- [Integraciones Externas](#integraciones-externas)
- [Stack Futuro (Post-Migracion)](#stack-futuro-post-migracion)

---

## Descripcion General

AIOS esta construido sobre JavaScript/TypeScript moderno con runtime Node.js, optimizado para desarrollo CLI multiplataforma con UX interactivo y capacidades de orquestacion de agentes.

**Filosofia:**

- Preferir **tecnologia aburrida** donde sea posible (dependencias probadas y estables)
- Elegir **tecnologia emocionante** solo donde sea necesario (rendimiento, mejoras de DX)
- Minimizar dependencias (reducir riesgo de cadena de suministro)
- Multiplataforma primero (Windows, macOS, Linux)

---

## Runtime Core

### Node.js

```yaml
Version: 18.0.0+
LTS: Si (LTS Activo hasta Abril 2025)
Razon: Async/await estable, fetch API, soporte ES2022
```

**Por que Node.js 18+:**

- ✅ API `fetch()` nativa (sin necesidad de axios/node-fetch)
- ✅ Soporte de modulos ES2022 (top-level await)
- ✅ V8 10.2+ (mejoras de rendimiento)
- ✅ Soporte LTS activo (parches de seguridad)
- ✅ Multiplataforma (Windows/macOS/Linux)

**Gestor de Paquetes:**

```yaml
Principal: npm 9.0.0+
Alternativo: yarn/pnpm (eleccion del usuario)
Lock File: package-lock.json
```

---

## Lenguajes y Transpiladores

### JavaScript (Principal)

```yaml
Estandar: ES2022
Sistema de Modulos: CommonJS (require/module.exports)
Futuro: Migracion a ESM planificada (Story 6.2.x)
```

**Por que ES2022:**

- ✅ Class fields y metodos privados
- ✅ Top-level await
- ✅ Error cause
- ✅ Metodo Array.at()
- ✅ Object.hasOwn()

### TypeScript (Definiciones de Tipos)

```yaml
Version: 5.9.3
Uso: Solo definiciones de tipos (archivos .d.ts)
Compilacion: No usado (runtime JS puro)
Futuro: Migracion completa a TypeScript considerada para Q2 2026
```

**Uso Actual de TypeScript:**

```typescript
// index.d.ts - Definiciones de tipos para API publica
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**Configuracion de TypeScript:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## Dependencias Core

### CLI y UX Interactivo

#### @clack/prompts (^0.11.0)

**Proposito:** Prompts CLI modernos con UX hermoso
**Uso:** Wizard interactivo, recoleccion de input del usuario
**Por que:** UX de primera clase, animaciones de spinner, barras de progreso

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Seleccionar agente:',
  options: [
    { value: 'dev', label: '💻 Desarrollador' },
    { value: 'qa', label: '🧪 Ingeniero QA' },
  ],
});
```

#### chalk (^4.1.2)

**Proposito:** Estilizado de strings en terminal
**Uso:** Salida coloreada, formateo
**Por que:** Multiplataforma, cero dependencias, API estable

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agente activado exitosamente'));
console.log(chalk.red('❌ Tarea fallida'));
```

#### picocolors (^1.1.1)

**Proposito:** Biblioteca de colores ligera (alternativa mas rapida a chalk)
**Uso:** Salida de color critica para rendimiento
**Por que:** 14x mas pequeno que chalk, 2x mas rapido

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Salida rapida'));
```

#### ora (^5.4.1)

**Proposito:** Spinners de terminal
**Uso:** Indicadores de carga, operaciones asincronas
**Por que:** Spinners hermosos, personalizables, ampliamente usados

```javascript
const ora = require('ora');
const spinner = ora('Cargando agente...').start();
await loadAgent();
spinner.succeed('Agente cargado');
```

### Sistema de Archivos y Operaciones de Ruta

#### fs-extra (^11.3.2)

**Proposito:** Oper
```

---

# COMANDO - tech-stack.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\framework\tech-stack.md
**SHA:** ecb3f5a4d845caef
**Timestamp:** 2026-08-28T02:02:34.719569
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Cold Start: ~200ms (initial load)
- Warm Start: ~50ms (cached modules)

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Traducción: ES
  Original: /docs/en/framework/tech-stack.md
  Última sincronización: 2026-01-26
-->

# Stack Tecnológico de AIOS

> 🌐 [EN](../../framework/tech-stack.md) | [PT](../../pt/framework/tech-stack.md) | **ES**

---

**Versión:** 1.1
**Última Actualización:** 2025-12-14
**Estado:** Estándar Oficial del Framework
**Aviso de Migración:** Este documento migrará al repositorio `SynkraAI/aios-core` en Q2 2026 (ver Decision 005)

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Runtime Principal](#runtime-principal)
- [Lenguajes y Transpiladores](#lenguajes-y-transpiladores)
- [Dependencias Principales](#dependencias-principales)
- [Herramientas de Desarrollo](#herramientas-de-desarrollo)
- [Framework de Testing](#framework-de-testing)
- [Build y Deployment](#build-y-deployment)
- [Integraciones Externas](#integraciones-externas)
- [Stack Futuro (Post-Migración)](#stack-futuro-post-migración)

---

## Descripción General

AIOS está construido sobre JavaScript/TypeScript moderno con runtime Node.js, optimizado para desarrollo CLI multiplataforma con UX interactiva y capacidades de orquestación de agentes.

**Filosofía:**

- Preferir **tecnología aburrida** cuando sea posible (dependencias probadas y estables)
- Elegir **tecnología emocionante** solo cuando sea necesario (mejoras de rendimiento, mejoras de DX)
- Minimizar dependencias (reducir riesgo de cadena de suministro)
- Multiplataforma primero (Windows, macOS, Linux)

---

## Runtime Principal

### Node.js

```yaml
Version: 18.0.0+
LTS: Yes (Active LTS until April 2025)
Reason: Stable async/await, fetch API, ES2022 support
```

**¿Por qué Node.js 18+?**

- API nativa `fetch()` (no necesita axios/node-fetch)
- Soporte de módulos ES2022 (top-level await)
- V8 10.2+ (mejoras de rendimiento)
- Soporte LTS activo (parches de seguridad)
- Multiplataforma (Windows/macOS/Linux)

**Gestor de Paquetes:**

```yaml
Primary: npm 9.0.0+
Alternative: yarn/pnpm (user choice)
Lock File: package-lock.json
```

---

## Lenguajes y Transpiladores

### JavaScript (Principal)

```yaml
Standard: ES2022
Module System: CommonJS (require/module.exports)
Future: ESM migration planned (Story 6.2.x)
```

**¿Por qué ES2022?**

- Campos de clase y métodos privados
- Top-level await
- Error cause
- Método Array.at()
- Object.hasOwn()

### TypeScript (Definiciones de Tipos)

```yaml
Version: 5.9.3
Usage: Type definitions only (.d.ts files)
Compilation: Not used (pure JS runtime)
Future: Full TypeScript migration considered for Q2 2026
```

**Uso Actual de TypeScript:**

```typescript
// index.d.ts - Type definitions for public API
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**Configuración de TypeScript:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## Dependencias Principales

### CLI y UX Interactiva

#### @clack/prompts (^0.11.0)

**Propósito:** Prompts CLI modernos con UX hermosa
**Uso:** Wizard interactivo, recolección de entrada del usuario
**Por qué:** UX de primera clase, animaciones de spinner, barras de progreso

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Select agent:',
  options: [
    { value: 'dev', label: '💻 Developer' },
    { value: 'qa', label: '🧪 QA Engineer' },
  ],
});
```

#### chalk (^4.1.2)

**Propósito:** Estilizado de strings en terminal
**Uso:** Salida con colores, formateo
**Por qué:** Multiplataforma, sin dependencias, API estable

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agent activated successfully'));
console.log(chalk.red('❌ Task failed'));
```

#### picocolors (^1.1.1)

**Propósito:** Biblioteca de colores ligera (alternativa más rápida a chalk)
**Uso:** Salida de colores crítica para rendimiento
**Por qué:** 14x más pequeño que chalk, 2x más rápido

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Fast output'));
```

#### ora (^5.4.1)

**Propósito:** Spinners de terminal
**Uso:** Indicadores de carga, operaciones asíncronas
**Por qué:** Spinners hermosos, personalizables, ampliamente utilizado

```javascript
const ora = require('ora');
const spinner = ora('Loading agent...').start();
await loadAgent();
spinner.succeed('Agent loaded');
```

### Operaciones de Sistema de Archivos y Rutas

#### fs-extra (^11.3.2)

**Propósito:** Operaciones mejoradas del sistema de archivos
**Uso:** Copia de archivos, creación de directorios, lectura/escritura JSON
**Por qué:** Basado en promesas, utilidades adicionales sobre `fs` nativo

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');

```

---

# COMANDO - tech-stack.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\framework\tech-stack.md
**SHA:** 5f5f4265c6ea655c
**Timestamp:** 2026-08-28T02:02:36.115705
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Cold Start: ~200ms (initial load)
- Warm Start: ~50ms (cached modules)

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Technology Stack

> 🌐 **EN** | [PT](../pt/framework/tech-stack.md) | [ES](../es/framework/tech-stack.md)

**Version:** 1.1
**Last Updated:** 2025-12-14
**Status:** Official Framework Standard
**Migration Notice:** This document will migrate to `SynkraAI/aios-core` repository in Q2 2026 (see Decision 005)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Runtime](#core-runtime)
- [Languages & Transpilers](#languages--transpilers)
- [Core Dependencies](#core-dependencies)
- [Development Tools](#development-tools)
- [Testing Framework](#testing-framework)
- [Build & Deployment](#build--deployment)
- [External Integrations](#external-integrations)
- [Future Stack (Post-Migration)](#future-stack-post-migration)

---

## Overview

AIOS is built on modern JavaScript/TypeScript with Node.js runtime, optimized for cross-platform CLI development with interactive UX and agent orchestration capabilities.

**Philosophy:**

- Prefer **boring technology** where possible (proven, stable dependencies)
- Choose **exciting technology** only where necessary (performance, DX improvements)
- Minimize dependencies (reduce supply chain risk)
- Cross-platform first (Windows, macOS, Linux)

---

## Core Runtime

### Node.js

```yaml
Version: 18.0.0+
LTS: Yes (Active LTS until April 2025)
Reason: Stable async/await, fetch API, ES2022 support
```

**Why Node.js 18+:**

- ✅ Native `fetch()` API (no need for axios/node-fetch)
- ✅ ES2022 module support (top-level await)
- ✅ V8 10.2+ (performance improvements)
- ✅ Active LTS support (security patches)
- ✅ Cross-platform (Windows/macOS/Linux)

**Package Manager:**

```yaml
Primary: npm 9.0.0+
Alternative: yarn/pnpm (user choice)
Lock File: package-lock.json
```

---

## Languages & Transpilers

### JavaScript (Primary)

```yaml
Standard: ES2022
Module System: CommonJS (require/module.exports)
Future: ESM migration planned (Story 6.2.x)
```

**Why ES2022:**

- ✅ Class fields and private methods
- ✅ Top-level await
- ✅ Error cause
- ✅ Array.at() method
- ✅ Object.hasOwn()

### TypeScript (Type Definitions)

```yaml
Version: 5.9.3
Usage: Type definitions only (.d.ts files)
Compilation: Not used (pure JS runtime)
Future: Full TypeScript migration considered for Q2 2026
```

**Current TypeScript Usage:**

```typescript
// index.d.ts - Type definitions for public API
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**TypeScript Configuration:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## Core Dependencies

### CLI & Interactive UX

#### @clack/prompts (^0.11.0)

**Purpose:** Modern CLI prompts with beautiful UX
**Usage:** Interactive wizard, user input collection
**Why:** Best-in-class UX, spinner animations, progress bars

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Select agent:',
  options: [
    { value: 'dev', label: '💻 Developer' },
    { value: 'qa', label: '🧪 QA Engineer' },
  ],
});
```

#### chalk (^4.1.2)

**Purpose:** Terminal string styling
**Usage:** Colored output, formatting
**Why:** Cross-platform, zero dependencies, stable API

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agent activated successfully'));
console.log(chalk.red('❌ Task failed'));
```

#### picocolors (^1.1.1)

**Purpose:** Lightweight color library (faster alternative to chalk)
**Usage:** Performance-critical color output
**Why:** 14x smaller than chalk, 2x faster

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Fast output'));
```

#### ora (^5.4.1)

**Purpose:** Terminal spinners
**Usage:** Loading indicators, async operations
**Why:** Beautiful spinners, customizable, widely used

```javascript
const ora = require('ora');
const spinner = ora('Loading agent...').start();
await loadAgent();
spinner.succeed('Agent loaded');
```

### File System & Path Operations

#### fs-extra (^11.3.2)

**Purpose:** Enhanced file system operations
**Usage:** File copying, directory creation, JSON read/write
**Why:** Promise-based, additional utilities over built-in `fs`

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**Purpose:** File pattern matching
**Usage:** Finding files by patterns (e.g., `*.md`, `**/*.yaml`)
**Why:** Fast, supports gitignore patterns

```javascript
const { glob } = require('glob');
const stories = await glob('docs/stories/**/*.md');
```

### YAML Processing

#### yaml (^2.8.1)

**Purpose:** YAML parsing and serialization
**Usage:** Agent configs, workflows, templates
**Why:** Fast
```

---

# COMANDO - tech-stack.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\tech-stack.md
**SHA:** 9159b63dd248e405
**Timestamp:** 2026-08-28T02:02:38.906464
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Cold Start: ~200ms (carregamento inicial)
- Warm Start: ~50ms (módulos em cache)

### Padroes
- Padrão: ES2022

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/architecture/tech-stack.md | Sincronização: 2026-01-26 -->

# Stack de Tecnologia AIOS

> 🌐 [EN](../../architecture/tech-stack.md) | **PT** | [ES](../../es/architecture/tech-stack.md)

---

> ⚠️ **DESCONTINUADO**: Este arquivo é mantido apenas para compatibilidade retroativa.
>
> **Versão oficial:** [docs/framework/tech-stack.md](../framework/tech-stack.md)
>
> Este arquivo será removido no Q2 2026 após consolidação completa em `docs/framework/`.

---

# Stack de Tecnologia AIOS

**Versão:** 1.1
**Última Atualização:** 2025-12-14
**Status:** DESCONTINUADO - Veja docs/framework/tech-stack.md
**Aviso de Migração:** Este documento será migrado para o repositório `SynkraAI/aios-core` no Q2 2026 (veja Decisão 005)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Runtime Core](#runtime-core)
- [Linguagens e Transpiladores](#linguagens-e-transpiladores)
- [Dependências Core](#dependências-core)
- [Ferramentas de Desenvolvimento](#ferramentas-de-desenvolvimento)
- [Framework de Testes](#framework-de-testes)
- [Build e Deploy](#build-e-deploy)
- [Integrações Externas](#integrações-externas)
- [Stack Futuro (Pós-Migração)](#stack-futuro-pós-migração)

---

## Visão Geral

AIOS é construído em JavaScript/TypeScript moderno com runtime Node.js, otimizado para desenvolvimento de CLI cross-platform com UX interativa e capacidades de orquestração de agentes.

**Filosofia:**

- Preferir **tecnologia consolidada** onde possível (dependências provadas e estáveis)
- Escolher **tecnologia inovadora** apenas onde necessário (performance, melhorias de DX)
- Minimizar dependências (reduzir risco de supply chain)
- Cross-platform primeiro (Windows, macOS, Linux)

---

## Runtime Core

### Node.js

```yaml
Versão: 18.0.0+
LTS: Sim (LTS Ativo até Abril 2025)
Razão: Suporte estável a async/await, fetch API, ES2022
```

**Por que Node.js 18+:**

- ✅ API `fetch()` nativa (sem necessidade de axios/node-fetch)
- ✅ Suporte a módulos ES2022 (top-level await)
- ✅ V8 10.2+ (melhorias de performance)
- ✅ Suporte LTS ativo (patches de segurança)
- ✅ Cross-platform (Windows/macOS/Linux)

**Gerenciador de Pacotes:**

```yaml
Principal: npm 9.0.0+
Alternativo: yarn/pnpm (escolha do usuário)
Lock File: package-lock.json
```

---

## Linguagens e Transpiladores

### JavaScript (Principal)

```yaml
Padrão: ES2022
Sistema de Módulos: CommonJS (require/module.exports)
Futuro: Migração para ESM planejada (Story 6.2.x)
```

**Por que ES2022:**

- ✅ Class fields e métodos privados
- ✅ Top-level await
- ✅ Error cause
- ✅ Método Array.at()
- ✅ Object.hasOwn()

### TypeScript (Definições de Tipos)

```yaml
Versão: 5.9.3
Uso: Apenas definições de tipos (arquivos .d.ts)
Compilação: Não utilizada (runtime JS puro)
Futuro: Migração completa para TypeScript considerada para Q2 2026
```

**Uso Atual de TypeScript:**

```typescript
// index.d.ts - Definições de tipos para API pública
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**Configuração TypeScript:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## Dependências Core

### CLI e UX Interativa

#### @clack/prompts (^0.11.0)

**Propósito:** Prompts de CLI modernos com UX elegante
**Uso:** Wizard interativo, coleta de input do usuário
**Por que:** UX de classe mundial, animações de spinner, barras de progresso

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Selecione o agente:',
  options: [
    { value: 'dev', label: '💻 Developer' },
    { value: 'qa', label: '🧪 QA Engineer' },
  ],
});
```

#### chalk (^4.1.2)

**Propósito:** Estilização de strings no terminal
**Uso:** Saída colorida, formatação
**Por que:** Cross-platform, zero dependências, API estável

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agente ativado com sucesso'));
console.log(chalk.red('❌ Tarefa falhou'));
```

#### picocolors (^1.1.1)

**Propósito:** Biblioteca de cores leve (alternativa mais rápida ao chalk)
**Uso:** Saída de cores crítica em performance
**Por que:** 14x menor que chalk, 2x mais rápido

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Saída rápida'));
```

#### ora (^5.4.1)

**Propósito:** Spinners de terminal
**Uso:** Indicadores de carregamento, operações assíncronas
**Por que:** Spinners bonitos, customizáveis, amplamente usado

```javascript
const ora = require('ora');
const spinner = ora('Carregando agente...').start();
await loadAgent();
spinner.succeed('Agente carregado');
```

### Sistema de Arquivos e Operações de Path

#### fs-extra (^11.3.2)

**Propósito:** Operações aprimoradas de sistema de arquivos
*
```

---

# COMANDO - tech-stack.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\framework\tech-stack.md
**SHA:** afab0c82f0477a1b
**Timestamp:** 2026-08-28T02:02:39.288683
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Cold Start: ~200ms (initial load)
- Warm Start: ~50ms (cached modules)

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Tradução: PT-BR
  Original: /docs/en/framework/tech-stack.md
  Última sincronização: 2026-01-26
-->

# Stack de Tecnologia AIOS

> 🌐 [EN](../../framework/tech-stack.md) | **PT** | [ES](../../es/framework/tech-stack.md)

---

**Versão:** 1.1
**Última Atualização:** 2025-12-14
**Status:** Padrão Oficial do Framework
**Aviso de Migração:** Este documento migrará para o repositório `SynkraAI/aios-core` em Q2 2026 (veja Decision 005)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Runtime Principal](#runtime-principal)
- [Linguagens e Transpiladores](#linguagens-e-transpiladores)
- [Dependências Principais](#dependências-principais)
- [Ferramentas de Desenvolvimento](#ferramentas-de-desenvolvimento)
- [Framework de Testes](#framework-de-testes)
- [Build e Deploy](#build-e-deploy)
- [Integrações Externas](#integrações-externas)
- [Stack Futuro (Pós-Migração)](#stack-futuro-pós-migração)

---

## Visão Geral

O AIOS é construído com JavaScript/TypeScript moderno com runtime Node.js, otimizado para desenvolvimento de CLI multiplataforma com UX interativa e capacidades de orquestração de agentes.

**Filosofia:**

- Preferir **tecnologia estável** quando possível (dependências comprovadas e estáveis)
- Escolher **tecnologia inovadora** apenas quando necessário (performance, melhorias de DX)
- Minimizar dependências (reduzir risco de supply chain)
- Multiplataforma primeiro (Windows, macOS, Linux)

---

## Runtime Principal

### Node.js

```yaml
Version: 18.0.0+
LTS: Yes (Active LTS until April 2025)
Reason: Stable async/await, fetch API, ES2022 support
```

**Por que Node.js 18+:**

- API `fetch()` nativa (sem necessidade de axios/node-fetch)
- Suporte a módulos ES2022 (top-level await)
- V8 10.2+ (melhorias de performance)
- Suporte Active LTS (patches de segurança)
- Multiplataforma (Windows/macOS/Linux)

**Gerenciador de Pacotes:**

```yaml
Primary: npm 9.0.0+
Alternative: yarn/pnpm (escolha do usuário)
Lock File: package-lock.json
```

---

## Linguagens e Transpiladores

### JavaScript (Principal)

```yaml
Standard: ES2022
Module System: CommonJS (require/module.exports)
Future: ESM migration planned (Story 6.2.x)
```

**Por que ES2022:**

- Class fields e métodos privados
- Top-level await
- Error cause
- Método Array.at()
- Object.hasOwn()

### TypeScript (Definições de Tipo)

```yaml
Version: 5.9.3
Usage: Type definitions only (.d.ts files)
Compilation: Not used (pure JS runtime)
Future: Full TypeScript migration considered for Q2 2026
```

**Uso Atual de TypeScript:**

```typescript
// index.d.ts - Type definitions for public API
export interface AgentConfig {
  id: string;
  name: string;
  enabled: boolean;
  dependencies?: string[];
}

export function executeAgent(agentId: string, args: Record<string, any>): Promise<any>;
```

**Configuração TypeScript:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

---

## Dependências Principais

### CLI e UX Interativa

#### @clack/prompts (^0.11.0)

**Propósito:** Prompts de CLI modernos com UX elegante
**Uso:** Wizards interativos, coleta de input do usuário
**Por quê:** UX de primeira classe, animações de spinner, barras de progresso

```javascript
import { select, confirm, spinner } from '@clack/prompts';

const agent = await select({
  message: 'Select agent:',
  options: [
    { value: 'dev', label: '💻 Developer' },
    { value: 'qa', label: '🧪 QA Engineer' },
  ],
});
```

#### chalk (^4.1.2)

**Propósito:** Estilização de strings no terminal
**Uso:** Output colorido, formatação
**Por quê:** Multiplataforma, zero dependências, API estável

```javascript
const chalk = require('chalk');
console.log(chalk.green('✅ Agent activated successfully'));
console.log(chalk.red('❌ Task failed'));
```

#### picocolors (^1.1.1)

**Propósito:** Biblioteca de cores leve (alternativa mais rápida ao chalk)
**Uso:** Output de cores em situações críticas de performance
**Por quê:** 14x menor que chalk, 2x mais rápido

```javascript
const pc = require('picocolors');
console.log(pc.green('✅ Fast output'));
```

#### ora (^5.4.1)

**Propósito:** Spinners de terminal
**Uso:** Indicadores de carregamento, operações assíncronas
**Por quê:** Spinners elegantes, customizáveis, amplamente usado

```javascript
const ora = require('ora');
const spinner = ora('Loading agent...').start();
await loadAgent();
spinner.succeed('Agent loaded');
```

### Operações de File System e Path

#### fs-extra (^11.3.2)

**Propósito:** Operações de file system aprimoradas
**Uso:** Cópia de arquivos, criação de diretórios, leitura/escrita JSON
**Por quê:** Baseado em Promise, utilidades adicionais sobre o `fs` nativo

```javascript
const fs = require('fs-extra');
await fs.copy('source', 'dest');
await fs.ensureDir('path/to/dir');
await fs.outputJson('config.json', data);
```

#### glob (^11.0.3)

**Propósito:*
```