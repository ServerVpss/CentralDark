# COMANDO - ade-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\es\guides\ade-guide.md
**SHA:** 4e744bfecff66279
**Timestamp:** 2026-08-28T02:02:34.729137
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- canExecute: boolean # @dev

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Traduccion: ES
  Original: /docs/guides/ade-guide.md
  Ultima sincronizacion: 2026-01-29
-->

# AIOS Autonomous Development Engine (ADE) - Guia Completa

> **Version:** 1.0.0
> **Fecha:** 2026-01-29
> **Estado:** Production Ready

---

## Que es el ADE?

El **AIOS Autonomous Development Engine (ADE)** es un sistema de desarrollo autonomo que transforma requisitos vagos en codigo funcional a traves de pipelines estructurados y agentes especializados.

### Caracteristicas Principales

- **Spec Pipeline** - Transforma ideas en especificaciones ejecutables
- **Execution Engine** - Ejecuta subtasks con self-critique obligatorio
- **Recovery System** - Recupera de fallos automaticamente
- **QA Evolution** - Review estructurado en 10 fases
- **Memory Layer** - Aprende y documenta patrones

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADE Architecture                                   │
│                                                                              │
│  User Request ──► Spec Pipeline ──► Execution Engine ──► Working Code       │
│                                            │                                 │
│                                            ▼                                 │
│                                    Recovery System                           │
│                                            │                                 │
│                                            ▼                                 │
│                                    QA Evolution                              │
│                                            │                                 │
│                                            ▼                                 │
│                                    Memory Layer                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Los 7 Epics

### Epic 1: Worktree Manager

**Proposito:** Aislamiento de branches via Git worktrees

**Comandos (@devops):**

- `*create-worktree {story}` - Crear worktree aislado
- `*list-worktrees` - Listar worktrees activos
- `*merge-worktree {story}` - Hacer merge del worktree
- `*cleanup-worktrees` - Eliminar worktrees antiguos

**Documentacion:** [ADE-EPIC1-HANDOFF.md](../../architecture/ADE-EPIC1-HANDOFF.md)

---

### Epic 2: Migration V2→V3

**Proposito:** Migracion al formato autoClaude V3

**Comandos (@devops):**

- `*inventory-assets` - Inventario de assets V2
- `*analyze-paths` - Analizar dependencias
- `*migrate-agent` - Migrar agente individual
- `*migrate-batch` - Migrar todos en batch

**Documentacion:** [ADE-EPIC2-HANDOFF.md](../../architecture/ADE-EPIC2-HANDOFF.md)

---

### Epic 3: Spec Pipeline

**Proposito:** Transformar requisitos en specs ejecutables

**Flujo:**

```
User Request → Gather → Assess → Research → Write → Critique → Spec Ready
```

**Comandos por Agente:**

| Agente     | Comando                | Fase                    |
| ---------- | ---------------------- | ----------------------- |
| @pm        | `*gather-requirements` | Recopilar requisitos    |
| @architect | `*assess-complexity`   | Evaluar complejidad     |
| @analyst   | `*research-deps`       | Investigar dependencias |
| @pm        | `*write-spec`          | Escribir spec           |
| @qa        | `*critique-spec`       | Criticar y aprobar      |

**Documentacion:** [ADE-EPIC3-HANDOFF.md](../../architecture/ADE-EPIC3-HANDOFF.md)

---

### Epic 4: Execution Engine

**Proposito:** Ejecutar specs en codigo funcional

**13 Pasos del Coder:**

1. Load Context
2. Read Implementation Plan
3. Understand Current Subtask
4. Plan Approach
5. Write Code
   - 5.5 SELF-CRITIQUE (obligatorio)
6. Run Tests
   - 6.5 SELF-CRITIQUE (obligatorio)
7. Fix Issues
8. Run Linter
9. Fix Lint Issues
10. Verify Manually
11. Update Plan Status
12. Commit Changes
13. Signal Completion

**Comandos (@architect):**

- `*create-plan` - Crear plan de implementacion
- `*create-context` - Generar contexto del proyecto

**Comandos (@dev):**

- `*execute-subtask` - Ejecutar subtask

**Documentacion:** [ADE-EPIC4-HANDOFF.md](../../architecture/ADE-EPIC4-HANDOFF.md)

---

### Epic 5: Recovery System

**Proposito:** Recuperar de fallos en subtasks

**Flujo:**

```
Subtask Fails → Track Attempt → Retry (<3) → Stuck Detection → Rollback → Escalate
```

**Comandos (@dev):**

- `*track-attempt` - Registrar intento
- `*rollback` - Volver al estado anterior

**Documentacion:** [ADE-EPIC5-HANDOFF.md](../../architecture/ADE-EPIC5-HANDOFF.md)

---

### Epic 6: QA Evolution

**Proposito:** Review estructurado en 10 fases

**10 Fases:**

1. Setup & Context Loading
2. Code Quality Analysis
3. Test Coverage Review
4. Security Scan
5. Performance Check
6. Documentation Audit
7. Accessibility Review
8. Integration Points Check
9. Edge Cases & Error Handling
10. Final Summary & Decision

**Comandos (@qa):**

- `*review-build {story}
```

---

# COMANDO - ade-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\ade-guide.md
**SHA:** 720fa8f3c50c816d
**Timestamp:** 2026-08-28T02:02:36.138379
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- canExecute: boolean # @dev

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Autonomous Development Engine (ADE) - Guia Completo

> **Versão:** 1.0.0
> **Data:** 2026-01-29
> **Status:** Production Ready ✅

---

## O que é o ADE?

O **AIOS Autonomous Development Engine (ADE)** é um sistema de desenvolvimento autônomo que transforma requisitos vagos em código funcional através de pipelines estruturados e agentes especializados.

### Características Principais

- **Spec Pipeline** - Transforma ideias em especificações executáveis
- **Execution Engine** - Executa subtasks com self-critique obrigatório
- **Recovery System** - Recupera de falhas automaticamente
- **QA Evolution** - Review estruturado em 10 fases
- **Memory Layer** - Aprende e documenta padrões

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADE Architecture                                   │
│                                                                              │
│  User Request ──► Spec Pipeline ──► Execution Engine ──► Working Code       │
│                                            │                                 │
│                                            ▼                                 │
│                                    Recovery System                           │
│                                            │                                 │
│                                            ▼                                 │
│                                    QA Evolution                              │
│                                            │                                 │
│                                            ▼                                 │
│                                    Memory Layer                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Os 7 Epics

### Epic 1: Worktree Manager

**Propósito:** Isolamento de branches via Git worktrees

**Comandos (@devops):**

- `*create-worktree {story}` - Criar worktree isolado
- `*list-worktrees` - Listar worktrees ativos
- `*merge-worktree {story}` - Fazer merge do worktree
- `*cleanup-worktrees` - Remover worktrees antigos

**Documentação:** [ADE-EPIC1-HANDOFF.md](../architecture/ADE-EPIC1-HANDOFF.md)

---

### Epic 2: Migration V2→V3

**Propósito:** Migração para formato autoClaude V3

**Comandos (@devops):**

- `*inventory-assets` - Inventário de assets V2
- `*analyze-paths` - Analisar dependências
- `*migrate-agent` - Migrar agente individual
- `*migrate-batch` - Migrar todos em batch

**Documentação:** [ADE-EPIC2-HANDOFF.md](../architecture/ADE-EPIC2-HANDOFF.md)

---

### Epic 3: Spec Pipeline

**Propósito:** Transformar requisitos em specs executáveis

**Fluxo:**

```
User Request → Gather → Assess → Research → Write → Critique → Spec Ready
```

**Comandos por Agente:**

| Agent      | Command                | Fase                   |
| ---------- | ---------------------- | ---------------------- |
| @pm        | `*gather-requirements` | Coletar requisitos     |
| @architect | `*assess-complexity`   | Avaliar complexidade   |
| @analyst   | `*research-deps`       | Pesquisar dependências |
| @pm        | `*write-spec`          | Escrever spec          |
| @qa        | `*critique-spec`       | Criticar e aprovar     |

**Documentação:** [ADE-EPIC3-HANDOFF.md](../architecture/ADE-EPIC3-HANDOFF.md)

---

### Epic 4: Execution Engine

**Propósito:** Executar specs em código funcional

**13 Steps do Coder:**

1. Load Context
2. Read Implementation Plan
3. Understand Current Subtask
4. Plan Approach
5. Write Code
   - 5.5 SELF-CRITIQUE (obrigatório)
6. Run Tests
   - 6.5 SELF-CRITIQUE (obrigatório)
7. Fix Issues
8. Run Linter
9. Fix Lint Issues
10. Verify Manually
11. Update Plan Status
12. Commit Changes
13. Signal Completion

**Comandos (@architect):**

- `*create-plan` - Criar plano de implementação
- `*create-context` - Gerar contexto do projeto

**Comandos (@dev):**

- `*execute-subtask` - Executar subtask

**Documentação:** [ADE-EPIC4-HANDOFF.md](../architecture/ADE-EPIC4-HANDOFF.md)

---

### Epic 5: Recovery System

**Propósito:** Recuperar de falhas em subtasks

**Fluxo:**

```
Subtask Fails → Track Attempt → Retry (<3) → Stuck Detection → Rollback → Escalate
```

**Comandos (@dev):**

- `*track-attempt` - Registrar tentativa
- `*rollback` - Voltar para estado anterior

**Documentação:** [ADE-EPIC5-HANDOFF.md](../architecture/ADE-EPIC5-HANDOFF.md)

---

### Epic 6: QA Evolution

**Propósito:** Review estruturado em 10 fases

**10 Fases:**

1. Setup & Context Loading
2. Code Quality Analysis
3. Test Coverage Review
4. Security Scan
5. Performance Check
6. Documentation Audit
7. Accessibility Review
8. Integration Points Check
9. Edge Cases & Error Handling
10. Final Summary & Decision

**Comandos (@qa):**

- `*review-build {story}` - Review completo
- `*request-fix {issue}` - Solicitar correção
- `*verify-fix {issue}` - Verificar correção

**Comandos (@dev):**

- `*a
```

---

# COMANDO - ade-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\guides\ade-guide.md
**SHA:** 512a6ff31d2ce5f8
**Timestamp:** 2026-08-28T02:02:39.302501
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- canExecute: boolean # @dev

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Tradução: PT-BR
  Original: /docs/guides/ade-guide.md
  Última sincronização: 2026-01-29
-->

# AIOS Autonomous Development Engine (ADE) - Guia Completo

> **Versão:** 1.0.0
> **Data:** 2026-01-29
> **Status:** Pronto para Produção

---

## O que é o ADE?

O **AIOS Autonomous Development Engine (ADE)** é um sistema de desenvolvimento autônomo que transforma requisitos vagos em código funcional através de pipelines estruturados e agentes especializados.

### Características Principais

- **Spec Pipeline** - Transforma ideias em especificações executáveis
- **Execution Engine** - Executa subtasks com self-critique obrigatório
- **Recovery System** - Recupera de falhas automaticamente
- **QA Evolution** - Review estruturado em 10 fases
- **Memory Layer** - Aprende e documenta padrões

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Arquitetura ADE                                   │
│                                                                              │
│  Requisição ──► Spec Pipeline ──► Execution Engine ──► Código Funcional     │
│                                            │                                 │
│                                            ▼                                 │
│                                    Recovery System                           │
│                                            │                                 │
│                                            ▼                                 │
│                                    QA Evolution                              │
│                                            │                                 │
│                                            ▼                                 │
│                                    Memory Layer                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Os 7 Epics

### Epic 1: Worktree Manager

**Propósito:** Isolamento de branches via Git worktrees

**Comandos (@devops):**

- `*create-worktree {story}` - Criar worktree isolado
- `*list-worktrees` - Listar worktrees ativos
- `*merge-worktree {story}` - Fazer merge do worktree
- `*cleanup-worktrees` - Remover worktrees antigos

**Documentação:** [ADE-EPIC1-HANDOFF.md](../../architecture/ADE-EPIC1-HANDOFF.md)

---

### Epic 2: Migração V2→V3

**Propósito:** Migração para formato autoClaude V3

**Comandos (@devops):**

- `*inventory-assets` - Inventário de assets V2
- `*analyze-paths` - Analisar dependências
- `*migrate-agent` - Migrar agente individual
- `*migrate-batch` - Migrar todos em batch

**Documentação:** [ADE-EPIC2-HANDOFF.md](../../architecture/ADE-EPIC2-HANDOFF.md)

---

### Epic 3: Spec Pipeline

**Propósito:** Transformar requisitos em specs executáveis

**Fluxo:**

```
Requisição → Coletar → Avaliar → Pesquisar → Escrever → Criticar → Spec Pronta
```

**Comandos por Agente:**

| Agente     | Comando                | Fase                   |
| ---------- | ---------------------- | ---------------------- |
| @pm        | `*gather-requirements` | Coletar requisitos     |
| @architect | `*assess-complexity`   | Avaliar complexidade   |
| @analyst   | `*research-deps`       | Pesquisar dependências |
| @pm        | `*write-spec`          | Escrever spec          |
| @qa        | `*critique-spec`       | Criticar e aprovar     |

**Documentação:** [ADE-EPIC3-HANDOFF.md](../../architecture/ADE-EPIC3-HANDOFF.md)

---

### Epic 4: Execution Engine

**Propósito:** Executar specs em código funcional

**13 Passos do Coder:**

1. Carregar Contexto
2. Ler Plano de Implementação
3. Entender Subtask Atual
4. Planejar Abordagem
5. Escrever Código
   - 5.5 SELF-CRITIQUE (obrigatório)
6. Executar Testes
   - 6.5 SELF-CRITIQUE (obrigatório)
7. Corrigir Problemas
8. Executar Linter
9. Corrigir Problemas de Lint
10. Verificar Manualmente
11. Atualizar Status do Plano
12. Commitar Alterações
13. Sinalizar Conclusão

**Comandos (@architect):**

- `*create-plan` - Criar plano de implementação
- `*create-context` - Gerar contexto do projeto

**Comandos (@dev):**

- `*execute-subtask` - Executar subtask

**Documentação:** [ADE-EPIC4-HANDOFF.md](../../architecture/ADE-EPIC4-HANDOFF.md)

---

### Epic 5: Recovery System

**Propósito:** Recuperar de falhas em subtasks

**Fluxo:**

```
Subtask Falha → Registrar Tentativa → Retry (<3) → Detectar Travamento → Rollback → Escalar
```

**Comandos (@dev):**

- `*track-attempt` - Registrar tentativa
- `*rollback` - Voltar para estado anterior

**Documentação:** [ADE-EPIC5-HANDOFF.md](../../architecture/ADE-EPIC5-HANDOFF.md)

---

### Epic 6: QA Evolution

**Propósito:** Review estruturado em 10 fases

**10 Fases:**

1. Configuração e Carregamento de Contexto
2. Análise de Qualidade de Código
3. Review de Cobertura de Testes
4. Varredura de Segurança
5. Verificação de Performance
6. Auditoria de Documentação
7. Review de Acessibilidade
8. Verificação de
```