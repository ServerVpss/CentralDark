# AGENTE - ADE-AGENT-CHANGES.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\architecture\ADE-AGENT-CHANGES.md
**SHA:** 1d6b6f239ecc6cc3
**Timestamp:** 2026-08-28T02:02:34.151642
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- canExecute: boolean # Ejecutar subtasks
- canExecute: false
- canExecute: true

### Ouro Bruto (primeiros 5000 chars)
```
# Cambios en los Agentes ADE - Alteraciones en los Agentes AIOS

> **Documento:** Registro de las alteraciones realizadas en los agentes para soportar ADE
> **Fecha:** 2026-01-29
> **Estado:** Completo
> **Relacionado:** ADE Epics 1-7

---

## Descripción General

Este documento registra todas las alteraciones realizadas en los archivos de definición de los agentes AIOS para soportar el AIOS Autonomous Development Engine (ADE).

**Archivos modificados:**

- `.aios-core/development/agents/*.md` (fuente)
- `.claude/commands/AIOS/agents/*.md` (sincronizado)

---

## Formato autoClaude V3

Todos los agentes fueron migrados para incluir la sección `autoClaude` en el formato V3:

```yaml
autoClaude:
  version: '3.0'
  migratedAt: '2026-01-29T02:24:XX.XXXZ'

  # Capacidades del Spec Pipeline (Epic 3)
  specPipeline:
    canGather: boolean # Recolectar requisitos
    canAssess: boolean # Evaluar complejidad
    canResearch: boolean # Investigar dependencias
    canWrite: boolean # Escribir spec
    canCritique: boolean # Criticar spec

  # Capacidades del Execution Engine (Epic 4)
  execution:
    canCreatePlan: boolean # Crear plan de implementación
    canCreateContext: boolean # Crear contexto del proyecto
    canExecute: boolean # Ejecutar subtasks
    canVerify: boolean # Verificar subtasks

  # Capacidades del Recovery System (Epic 5)
  recovery:
    canTrackAttempts: boolean # Rastrear intentos
    canRollback: boolean # Hacer rollback

  # Capacidades de QA Evolution (Epic 6)
  qa:
    canReview: boolean # Hacer review estructurado
    canRequestFix: boolean # Solicitar correcciones

  # Capacidades de Worktree (Epic 1)
  worktree:
    canCreate: boolean # Crear worktrees
    canMerge: boolean # Hacer merge
    canCleanup: boolean # Limpiar worktrees

  # Capacidades de Memory Layer (Epic 7)
  memory:
    canCaptureInsights: boolean # Capturar insights
    canExtractPatterns: boolean # Extraer patrones
    canDocumentGotchas: boolean # Documentar gotchas
```

---

## Alteraciones por Agente

### @devops (Gage)

**Archivo:** `.aios-core/development/agents/devops.md`

**Comandos Añadidos:**

```yaml
# Worktree Management (Epic 1 - ADE Infrastructure)
- create-worktree {story}: Crear worktree aislado para desarrollo de story
- list-worktrees: Listar todos los worktrees activos con estado
- merge-worktree {story}: Hacer merge del worktree completado de vuelta a main
- cleanup-worktrees: Eliminar worktrees obsoletos/mergeados

# Migration Management (Epic 2 - V2→V3 Migration)
- inventory-assets: Generar inventario de migración desde assets V2
- analyze-paths: Analizar dependencias de rutas e impacto de migración
- migrate-agent: Migrar un solo agente del formato V2 al V3
- migrate-batch: Migrar en lote todos los agentes con validación
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  worktree:
    canCreate: true
    canMerge: true
    canCleanup: true
```

**Dependencias Añadidas:**

```yaml
dependencies:
  scripts:
    # Worktree Management (Epic 1)
    - worktree-manager.js
    - story-worktree-hooks.js
    - project-status-loader.js
    # Migration Management (Epic 2)
    - asset-inventory.js
    - path-analyzer.js
    - migrate-agent.js
  tasks:
    - worktree-create.md
    - worktree-list.md
    - worktree-merge.md
  workflows:
    - auto-worktree.yaml
```

---

### @pm (Morgan)

**Archivo:** `.aios-core/development/agents/pm.md`

**Comandos Añadidos:**

```yaml
# Spec Pipeline (Epic 3 - ADE)
- gather-requirements: Recopilar y documentar requisitos de los stakeholders
- write-spec: Generar documento de especificación formal a partir de requisitos
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: true
    canAssess: false
    canResearch: false
    canWrite: true
    canCritique: false
```

**Dependencias Añadidas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-gather-requirements.md
    - spec-write-spec.md
```

---

### @architect (Aria)

**Archivo:** `.aios-core/development/agents/architect.md`

**Comandos Añadidos:**

```yaml
# Spec Pipeline (Epic 3 - ADE)
- assess-complexity: Evaluar complejidad de la story y estimar esfuerzo

# Execution Engine (Epic 4 - ADE)
- create-plan: Crear plan de implementación con fases y subtasks
- create-context: Generar contexto del proyecto y archivos para la story

# Memory Layer (Epic 7 - ADE)
- map-codebase: Generar mapa del codebase (estructura, servicios, patrones, convenciones)
```

**Capacidades autoClaude:**

```yaml
autoClaude:
  version: '3.0'
  specPipeline:
    canGather: false
    canAssess: true
    canResearch: false
    canWrite: false
    canCritique: false
  execution:
    canCreatePlan: true
    canCreateContext: true
    canExecute: false
    canVerify: false
```

**Dependencias Añadidas:**

```yaml
dependencies:
  tasks:
    # Spec Pipeline (Epic 3)
    - spec-assess-complexity.md
    # Execution Engine (Epic 4)
    - plan-create-implementation.md
   
```