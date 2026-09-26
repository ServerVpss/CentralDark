# COMANDO - testing-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\guides\testing-guide.md
**SHA:** 0b7ca2b547327b1e
**Timestamp:** 2026-08-28T02:02:35.097264
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm ci
- - run: npm test
- run: npm run test:platform
- run: npm ci
- run: npm test
- run: npm ci
- run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
- - run: npm ci
- run: npm run lint
- run: npm run typecheck

### Padroes
- npm test -- --testPathPattern=integration
- run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
- npm test -- --testPathPattern=unit
- npm test -- --testNamePattern="should validate"
- npm test -- --watch --testPathPattern=unit

### Contratos
- quality-gate:

### Ouro Bruto (primeiros 5000 chars)
```
# Guia de Testing de Synkra AIOS

> [EN](../../guides/testing-guide.md) | [PT](../../pt/guides/testing-guide.md) | **ES**

---

> Guia completa de la estrategia de testing, herramientas y mejores practicas para Synkra AIOS.

**Version:** 2.1.0
**Ultima Actualizacion:** 2026-01-29

---

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Estrategia de Testing](#estrategia-de-testing)
3. [Tests Unitarios](#tests-unitarios)
4. [Tests de Integracion](#tests-de-integracion)
5. [Tests End-to-End](#tests-end-to-end)
6. [Tests de Agentes](#tests-de-agentes)
7. [Testing Cross-Platform](#testing-cross-platform)
8. [Cobertura y Metricas](#cobertura-y-metricas)
9. [Integracion CI/CD](#integracion-cicd)
10. [Escribiendo Buenos Tests](#escribiendo-buenos-tests)
11. [Mocking y Fixtures](#mocking-y-fixtures)
12. [Referencia de Comandos NPM](#referencia-de-comandos-npm)
13. [Solucion de Problemas](#solucion-de-problemas)

---

## Vision General

AIOS sigue una estrategia de testing integral que asegura la calidad del codigo en todas las capas del framework. Nuestra filosofia de testing esta construida sobre:

- **Desarrollo Guiado por Tests (TDD)** para funcionalidad core
- **Testing por Capas** con tests unitarios, de integracion y E2E
- **Verificacion Cross-Platform** para Windows, macOS y Linux
- **Testing Especifico de Agentes** para comportamientos de agentes IA
- **Quality Gates Automatizados** integrados con CI/CD

### Piramide de Testing

```
                    ┌─────────────┐
                    │     E2E     │  ← Pocos, Lentos, Costosos
                    │   Tests     │
                    ├─────────────┤
                    │ Integracion │  ← Algunos, Velocidad Media
                    │   Tests     │
                    ├─────────────┤
                    │  Unitarios  │  ← Muchos, Rapidos, Economicos
                    │   Tests     │
                    └─────────────┘
```

| Capa        | Cantidad | Velocidad | Objetivo de Cobertura |
| ----------- | -------- | --------- | --------------------- |
| Unitarios   | 100+     | < 30s     | 80%+ lineas           |
| Integracion | 30-50    | 1-5m      | Rutas criticas        |
| E2E         | 10-20    | 5-15m     | Flujos de usuario     |

---

## Estrategia de Testing

### Estructura de Directorios

```
tests/
├── unit/                    # Tests unitarios
│   ├── quality-gates/       # Componentes de quality gate
│   ├── squad/               # Tests del sistema de squads
│   ├── mcp/                 # Tests de configuracion MCP
│   ├── manifest/            # Tests de manejo de manifests
│   └── documentation-integrity/  # Tests del generador de docs
├── integration/             # Tests de integracion
│   ├── squad/               # Integracion del squad designer
│   ├── windows/             # Tests especificos de Windows
│   └── *.test.js            # Tests de integracion generales
├── e2e/                     # Tests end-to-end
│   └── story-creation-clickup.test.js
├── performance/             # Benchmarks de rendimiento
│   ├── decision-logging-benchmark.test.js
│   └── tools-system-benchmark.test.js
├── security/                # Tests de seguridad
│   └── core-security.test.js
├── health-check/            # Tests del sistema de health check
│   ├── engine.test.js
│   └── healers.test.js
├── regression/              # Tests de regresion
│   └── tools-migration.test.js
├── setup.js                 # Setup global de tests
└── fixtures/                # Fixtures y mocks de tests
```

### Convencion de Nombres de Tests

| Tipo        | Patron                        | Ejemplo                              |
| ----------- | ----------------------------- | ------------------------------------ |
| Unitario    | `*.test.js` o `*.spec.js`     | `greeting-builder.test.js`           |
| Integracion | `*.test.js` en `integration/` | `contextual-greeting.test.js`        |
| E2E         | `*.test.js` en `e2e/`         | `story-creation-clickup.test.js`     |
| Benchmark   | `*-benchmark.test.js`         | `decision-logging-benchmark.test.js` |

---

## Tests Unitarios

Los tests unitarios verifican funciones y clases individuales de forma aislada.

### Configuracion (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/.aios-core/**/__tests__/**/*.test.js',
  ],

  testTimeout: 30000,
  verbose: true,

  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aios-core/core/': {
      lines: 45,
    },
  },
};
```

### Escribiendo Tests Unitarios

```javascript
/**
 * Tests Unitarios del Quality Gate Manager
 *
 * @story 2.10 - Quality Gate Manager
 */

const {
  QualityGateManager,
} = require('../../../.aios-core/core/quality-gates/quality-gate-manager');

describe('QualityGateManager', () => {
  l
```

---

# COMANDO - testing-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\testing-guide.md
**SHA:** ebcc02825d1165aa
**Timestamp:** 2026-08-28T02:02:36.510080
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm ci
- - run: npm test
- run: npm run test:platform
- run: npm ci
- run: npm test
- run: npm ci
- run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
- - run: npm ci
- run: npm run lint
- run: npm run typecheck

### Padroes
- npm test -- --testPathPattern=integration
- run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
- npm test -- --testPathPattern=unit
- npm test -- --testNamePattern="should validate"
- npm test -- --watch --testPathPattern=unit

### Contratos
- quality-gate:

### Ouro Bruto (primeiros 5000 chars)
```
# Synkra AIOS Testing Guide

> **EN** | [PT](../pt/guides/testing-guide.md) | [ES](../es/guides/testing-guide.md)

---

> Comprehensive guide to the testing strategy, tools, and best practices for Synkra AIOS.

**Version:** 2.1.0
**Last Updated:** 2026-01-29

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [End-to-End Tests](#end-to-end-tests)
6. [Agent Tests](#agent-tests)
7. [Cross-Platform Testing](#cross-platform-testing)
8. [Coverage and Metrics](#coverage-and-metrics)
9. [CI/CD Integration](#cicd-integration)
10. [Writing Good Tests](#writing-good-tests)
11. [Mocking and Fixtures](#mocking-and-fixtures)
12. [NPM Commands Reference](#npm-commands-reference)
13. [Troubleshooting](#troubleshooting)

---

## Overview

AIOS follows a comprehensive testing strategy that ensures code quality across all layers of the framework. Our testing philosophy is built on:

- **Test-Driven Development (TDD)** for core functionality
- **Layered Testing** with unit, integration, and E2E tests
- **Cross-Platform Verification** for Windows, macOS, and Linux
- **Agent-Specific Testing** for AI agent behaviors
- **Automated Quality Gates** integrated with CI/CD

### Testing Pyramid

```
                    ┌─────────────┐
                    │     E2E     │  ← Few, Slow, Expensive
                    │   Tests     │
                    ├─────────────┤
                    │ Integration │  ← Some, Medium Speed
                    │   Tests     │
                    ├─────────────┤
                    │    Unit     │  ← Many, Fast, Cheap
                    │   Tests     │
                    └─────────────┘
```

| Layer       | Count | Speed | Coverage Target |
| ----------- | ----- | ----- | --------------- |
| Unit        | 100+  | < 30s | 80%+ lines      |
| Integration | 30-50 | 1-5m  | Critical paths  |
| E2E         | 10-20 | 5-15m | User flows      |

---

## Testing Strategy

### Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── quality-gates/       # Quality gate components
│   ├── squad/               # Squad system tests
│   ├── mcp/                 # MCP configuration tests
│   ├── manifest/            # Manifest handling tests
│   └── documentation-integrity/  # Doc generator tests
├── integration/             # Integration tests
│   ├── squad/               # Squad designer integration
│   ├── windows/             # Windows-specific tests
│   └── *.test.js            # General integration tests
├── e2e/                     # End-to-end tests
│   └── story-creation-clickup.test.js
├── performance/             # Performance benchmarks
│   ├── decision-logging-benchmark.test.js
│   └── tools-system-benchmark.test.js
├── security/                # Security tests
│   └── core-security.test.js
├── health-check/            # Health check system tests
│   ├── engine.test.js
│   └── healers.test.js
├── regression/              # Regression tests
│   └── tools-migration.test.js
├── setup.js                 # Global test setup
└── fixtures/                # Test fixtures and mocks
```

### Test Naming Convention

| Type        | Pattern                       | Example                              |
| ----------- | ----------------------------- | ------------------------------------ |
| Unit        | `*.test.js` or `*.spec.js`    | `greeting-builder.test.js`           |
| Integration | `*.test.js` in `integration/` | `contextual-greeting.test.js`        |
| E2E         | `*.test.js` in `e2e/`         | `story-creation-clickup.test.js`     |
| Benchmark   | `*-benchmark.test.js`         | `decision-logging-benchmark.test.js` |

---

## Unit Tests

Unit tests verify individual functions and classes in isolation.

### Configuration (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/.aios-core/**/__tests__/**/*.test.js',
  ],

  testTimeout: 30000,
  verbose: true,

  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aios-core/core/': {
      lines: 45,
    },
  },
};
```

### Writing Unit Tests

```javascript
/**
 * Quality Gate Manager Unit Tests
 *
 * @story 2.10 - Quality Gate Manager
 */

const {
  QualityGateManager,
} = require('../../../.aios-core/core/quality-gates/quality-gate-manager');

describe('QualityGateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new QualityGateManager({
      layer1: { enabled: true },
      layer2: { enabled: true },
      layer3: { enabled: true },
    });
  });

  describe('constructor', () => {
    it('should create manager with default config', () => {
      const defaultManager = new QualityGateManager();
      expect(defaultManager).toBeDefined();
```

---

# COMANDO - testing-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\guides\testing-guide.md
**SHA:** 45d2cb660611121a
**Timestamp:** 2026-08-28T02:02:39.625171
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm ci
- - run: npm test
- run: npm run test:platform
- run: npm ci
- run: npm test
- run: npm ci
- run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
- - run: npm ci
- run: npm run lint
- run: npm run typecheck

### Padroes
- npm test -- --testPathPattern=integration
- run: SKIP_INTEGRATION_TESTS=false npm test -- --testPathPattern=integration
- npm test -- --testPathPattern=unit
- npm test -- --testNamePattern="should validate"
- npm test -- --watch --testPathPattern=unit

### Contratos
- quality-gate:

### Ouro Bruto (primeiros 5000 chars)
```
# Guia de Testes do Synkra AIOS

> [EN](../../guides/testing-guide.md) | **PT** | [ES](../../es/guides/testing-guide.md)

---

> Guia completo sobre a estratégia de testes, ferramentas e melhores práticas do Synkra AIOS.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-29

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Estratégia de Testes](#estratégia-de-testes)
3. [Testes Unitários](#testes-unitários)
4. [Testes de Integração](#testes-de-integração)
5. [Testes End-to-End](#testes-end-to-end)
6. [Testes de Agentes](#testes-de-agentes)
7. [Testes Cross-Platform](#testes-cross-platform)
8. [Cobertura e Métricas](#cobertura-e-métricas)
9. [Integração CI/CD](#integração-cicd)
10. [Escrevendo Bons Testes](#escrevendo-bons-testes)
11. [Mocking e Fixtures](#mocking-e-fixtures)
12. [Referência de Comandos NPM](#referência-de-comandos-npm)
13. [Resolução de Problemas](#resolução-de-problemas)

---

## Visão Geral

O AIOS segue uma estratégia abrangente de testes que garante qualidade de código em todas as camadas do framework. Nossa filosofia de testes é baseada em:

- **Test-Driven Development (TDD)** para funcionalidades core
- **Testes em Camadas** com testes unitários, de integração e E2E
- **Verificação Cross-Platform** para Windows, macOS e Linux
- **Testes Específicos de Agentes** para comportamentos de agentes de IA
- **Quality Gates Automatizados** integrados com CI/CD

### Pirâmide de Testes

```
                    ┌─────────────┐
                    │     E2E     │  ← Poucos, Lentos, Caros
                    │   Tests     │
                    ├─────────────┤
                    │ Integration │  ← Alguns, Velocidade Média
                    │   Tests     │
                    ├─────────────┤
                    │    Unit     │  ← Muitos, Rápidos, Baratos
                    │   Tests     │
                    └─────────────┘
```

| Camada      | Quantidade | Velocidade | Meta de Cobertura    |
| ----------- | ---------- | ---------- | -------------------- |
| Unitários   | 100+       | < 30s      | 80%+ de linhas       |
| Integração  | 30-50      | 1-5m       | Caminhos críticos    |
| E2E         | 10-20      | 5-15m      | Fluxos de usuário    |

---

## Estratégia de Testes

### Estrutura de Diretórios

```
tests/
├── unit/                    # Testes unitários
│   ├── quality-gates/       # Componentes de quality gate
│   ├── squad/               # Testes do sistema de squads
│   ├── mcp/                 # Testes de configuração MCP
│   ├── manifest/            # Testes de manipulação de manifest
│   └── documentation-integrity/  # Testes do gerador de docs
├── integration/             # Testes de integração
│   ├── squad/               # Integração do squad designer
│   ├── windows/             # Testes específicos do Windows
│   └── *.test.js            # Testes gerais de integração
├── e2e/                     # Testes end-to-end
│   └── story-creation-clickup.test.js
├── performance/             # Benchmarks de performance
│   ├── decision-logging-benchmark.test.js
│   └── tools-system-benchmark.test.js
├── security/                # Testes de segurança
│   └── core-security.test.js
├── health-check/            # Testes do sistema de health check
│   ├── engine.test.js
│   └── healers.test.js
├── regression/              # Testes de regressão
│   └── tools-migration.test.js
├── setup.js                 # Setup global de testes
└── fixtures/                # Fixtures e mocks de teste
```

### Convenção de Nomenclatura de Testes

| Tipo        | Padrão                        | Exemplo                              |
| ----------- | ----------------------------- | ------------------------------------ |
| Unitário    | `*.test.js` ou `*.spec.js`    | `greeting-builder.test.js`           |
| Integração  | `*.test.js` em `integration/` | `contextual-greeting.test.js`        |
| E2E         | `*.test.js` em `e2e/`         | `story-creation-clickup.test.js`     |
| Benchmark   | `*-benchmark.test.js`         | `decision-logging-benchmark.test.js` |

---

## Testes Unitários

Testes unitários verificam funções e classes individuais de forma isolada.

### Configuração (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',

  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/.aios-core/**/__tests__/**/*.test.js',
  ],

  testTimeout: 30000,
  verbose: true,

  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  coverageThreshold: {
    global: {
      branches: 25,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    '.aios-core/core/': {
      lines: 45,
    },
  },
};
```

### Escrevendo Testes Unitários

```javascript
/**
 * Testes Unitários do Quality Gate Manager
 *
 * @story 2.10 - Quality Gate Manager
 */

const {
  QualityGateManager,
} = require('../../../.aios-core/core/quality-gates/quality-gate-manager');

describe('QualityGateManager', () => {
  let manager;

  beforeEach(() => {
   
```