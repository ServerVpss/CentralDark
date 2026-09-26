# COMANDO - dashboard-realtime.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\dashboard-realtime.md
**SHA:** a1cb6e023fb16b4b
**Timestamp:** 2026-08-28T02:02:38.731005
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- **Decisão:** Claude Code Hooks
- **Decisão:** High-level apenas
- **Decisão:** Configurável pelo usuário

### Ouro Bruto (primeiros 5000 chars)
```
# 🔴 AIOS Dashboard - Arquitetura de Observabilidade em Tempo Real

> **PT** | [EN](../architecture/dashboard-realtime.md) | [ES](../es/architecture/dashboard-realtime.md)

> **Versão:** 1.0.0
> **Data:** 2026-01-29
> **Status:** Proposta
> **Autor:** @architect (Aria)
> **Relacionado:** [dashboard-architecture.md](./dashboard-architecture.md)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Problema Atual](#problema-atual)
3. [Arquitetura Proposta](#arquitetura-proposta)
4. [Event Emitter (CLI)](#event-emitter-cli)
5. [Events Schema](#events-schema)
6. [Enhanced SSE Endpoint](#enhanced-sse-endpoint)
7. [Events Store](#events-store)
8. [Novos Componentes UI](#novos-componentes-ui)
9. [Fluxo de Dados Completo](#fluxo-de-dados-completo)
10. [Implementação Faseada](#implementação-faseada)

---

## Visão Geral

Este documento descreve a arquitetura para **observabilidade em tempo real** do AIOS Dashboard, permitindo que usuários acompanhem comandos executados no CLI com máximo detalhe visual.

### Caso de Uso Principal

```
Usuário executa comandos no CLI → Dashboard mostra TUDO em tempo real
```

### Princípios

1. **Zero Configuration** - Funciona automaticamente quando CLI e Dashboard estão ativos
2. **File-Based** - Comunicação via filesystem (não requer servidor adicional)
3. **Append-Only Events** - Log de eventos imutável para debugging
4. **Graceful Degradation** - Dashboard funciona mesmo sem eventos (fallback para polling)

---

## Problema Atual

### O que o Dashboard MOSTRA hoje

| Evento no CLI     | Dashboard Atual           | Nota            |
| ----------------- | ------------------------- | --------------- |
| `@agent` ativa    | ✅ StatusBar mostra       | Funciona        |
| `*exit` agent     | ✅ Agent vai para standby | Funciona        |
| Story status muda | ⚠️ Kanban atualiza        | Sem notificação |

### O que o Dashboard NÃO MOSTRA

| Evento no CLI                | Dashboard Atual |
| ---------------------------- | --------------- |
| Comando `*xxx` executando    | ❌ Nada         |
| Claude "pensando"            | ❌ Nada         |
| Tool calls (Read/Write/Bash) | ❌ Nada         |
| Progresso da tarefa          | ❌ Nada         |
| Output do Claude             | ❌ Nada         |
| git commit/push              | ❌ Nada         |
| Erros                        | ❌ Nada         |
| Tarefa completa              | ❌ Nada         |

### Gap Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUXO: CLI → Dashboard Real-Time                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  VOCÊ NO CLI                              DASHBOARD                      │
│  ────────────                             ─────────                      │
│                                                                          │
│  @architect ─────────────────────────────▶ ✅ Agent ativo aparece       │
│  (ativa agente)                             (StatusBar + AgentMonitor)  │
│                                                                          │
│  *create-architecture ───────────────────▶ ❌ NÃO MOSTRA comando        │
│  (executa tarefa)                           executando                   │
│                                                                          │
│  [Claude pensando...] ───────────────────▶ ❌ NÃO MOSTRA progresso      │
│                                             em tempo real                │
│                                                                          │
│  [Criando arquivo X] ────────────────────▶ ❌ NÃO MOSTRA arquivos       │
│  [Editando arquivo Y]                       sendo criados/editados      │
│                                                                          │
│  [Story atualizada] ─────────────────────▶ ⚠️ PARCIAL - status muda     │
│                                             mas sem detalhes             │
│                                                                          │
│  [git commit] ───────────────────────────▶ ❌ NÃO MOSTRA commits        │
│                                             em tempo real                │
│                                                                          │
│  *exit ──────────────────────────────────▶ ✅ Agent vai para standby    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Arquitetura Proposta

### Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLI / AIOS AGENTS                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Claude Code Session                         │    │
│  │  @architect → *create-architecture → [thinking...] → [file ops] │    │
│  └────
```