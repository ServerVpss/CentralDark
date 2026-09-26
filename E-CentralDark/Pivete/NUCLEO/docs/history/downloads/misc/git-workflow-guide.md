# OUTRO - git-workflow-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\git-workflow-guide.md
**SHA:** 9c49f374a98862ce
**Timestamp:** 2026-08-28T02:02:33.481567
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: npm run lint
- run: npm run typecheck
- run: npm run test:coverage
- run: node .aios-core/utils/aios-validator.js stories
- run: node .aios-core/utils/custom-validator.js

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Traducción: ES
  Original: /docs/en/git-workflow-guide.md
  Última sincronización: 2026-01-26
-->

# Guía de Flujo de Trabajo Git de AIOS

> 🌐 [EN](../git-workflow-guide.md) | [PT](../pt/git-workflow-guide.md) | **ES**

---

_Story: 2.2-git-workflow-implementation.yaml_

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura de Defensa en Profundidad](#arquitectura-de-defensa-en-profundidad)
- [Capa 1: Validación Pre-commit](#capa-1-validación-pre-commit)
- [Capa 2: Validación Pre-push](#capa-2-validación-pre-push)
- [Capa 3: Pipeline CI/CD](#capa-3-pipeline-cicd)
- [Protección de Ramas](#protección-de-ramas)
- [Flujo de Trabajo Diario](#flujo-de-trabajo-diario)
- [Resolución de Problemas](#resolución-de-problemas)
- [Consejos de Rendimiento](#consejos-de-rendimiento)

## Descripción General

Synkra AIOS implementa una estrategia de validación de **Defensa en Profundidad** con tres capas progresivas que detectan problemas tempranamente y aseguran la calidad del código antes del merge.

### ¿Por Qué Tres Capas?

1. **Retroalimentación rápida** - Detectar problemas inmediatamente durante el desarrollo
2. **Validación local** - Sin dependencia de la nube para verificaciones básicas
3. **Validación autoritativa** - Puerta final antes del merge
4. **Consistencia de stories** - Asegurar que el desarrollo se alinee con las stories

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Pre-commit Hook (Local - <5s)                     │
│ ✓ ESLint (code quality)                                     │
│ ✓ TypeScript (type checking)                                │
│ ✓ Cache enabled                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Pre-push Hook (Local - <2s)                       │
│ ✓ Story checkbox validation                                 │
│ ✓ Status consistency                                         │
│ ✓ Required sections                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: GitHub Actions CI (Cloud - 2-5min)                │
│ ✓ All lint/type checks                                      │
│ ✓ Full test suite                                           │
│ ✓ Code coverage (≥80%)                                      │
│ ✓ Story validation                                          │
│ ✓ Branch protection                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ Merge Ready  │
                      └──────────────┘
```

## Arquitectura de Defensa en Profundidad

### Capa 1: Pre-commit (Local - Rápido)

**Objetivo de Rendimiento:** <5 segundos
**Disparador:** `git commit`
**Ubicación:** `.husky/pre-commit`

**Qué valida:**

- Calidad de código ESLint
- Verificación de tipos TypeScript
- Errores de sintaxis
- Problemas de importación

**Cómo funciona:**

```bash
# Se dispara automáticamente al hacer commit
git add .
git commit -m "feat: add feature"

# Ejecuta:
# 1. ESLint con caché (.eslintcache)
# 2. Compilación incremental de TypeScript (.tsbuildinfo)
```

**Beneficios:**

- ⚡ Retroalimentación rápida (<5s)
- 💾 Con caché para velocidad
- 🔒 Previene commits de código roto
- 🚫 Sin sintaxis inválida en el historial

### Capa 2: Pre-push (Local - Validación de Stories)

**Objetivo de Rendimiento:** <2 segundos
**Disparador:** `git push`
**Ubicación:** `.husky/pre-push`

**Qué valida:**

- Completitud de checkboxes de story vs estado
- Secciones requeridas de story presentes
- Consistencia de estado
- Registros del agente Dev

**Cómo funciona:**

```bash
# Se dispara automáticamente al hacer push
git push origin feature/my-feature

# Valida todos los archivos de story en docs/stories/
```

**Reglas de Validación:**

1. **Consistencia de Estado:**

```yaml
# ❌ Inválido: completado pero tareas incompletas
status: "completed"
tasks:
  - "[x] Task 1"
  - "[ ] Task 2"  # ¡Error!

# ✅ Válido: todas las tareas completadas
status: "completed"
tasks:
  - "[x] Task 1"
  - "[x] Task 2"
```

2. **Secciones Requeridas:**

- `id`
- `title`
- `description`
- `acceptance_criteria`
- `status`

3. **Flujo de Estados:**

```
ready → in progress → Ready for Review → completed
```

### Capa 3: CI/CD (Nube - Autoritativo)

**Rendimiento:** 2-
```