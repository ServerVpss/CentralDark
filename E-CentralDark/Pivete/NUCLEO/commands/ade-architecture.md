# COMANDO - ade-architecture.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\ade-architecture.md
**SHA:** 623b4ae0b2a13977
**Timestamp:** 2026-08-28T02:02:38.592528
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- PADRÃO: Coletar → Avaliar → Pesquisar → Escrever → Criticar → Planejar

### Contratos
- strictGate: true

### Ouro Bruto (primeiros 5000 chars)
```
# Arquitetura ADE - Motor de Desenvolvimento Autônomo

> **Versão:** 1.0
> **Última Atualização:** 2026-01-29
> **Status:** Padrão Oficial do Framework
>
> **PT** | [EN](../architecture/ade-architecture.md) | [ES](../es/architecture/ade-architecture.md)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Princípios de Design](#princípios-de-design)
- [Arquitetura de Épicas](#arquitetura-de-épicas)
- [Componentes do Sistema](#componentes-do-sistema)
- [Pontos de Integração](#pontos-de-integração)
- [Gerenciamento de Estado em Runtime](#gerenciamento-de-estado-em-runtime)
- [Configuração](#configuração)
- [Sistema de Inteligência de Workflow (WIS)](#sistema-de-inteligência-de-workflow-wis)
- [Tratamento de Erros e Recuperação](#tratamento-de-erros-e-recuperação)

---

## Visão Geral

O **Motor de Desenvolvimento Autônomo (ADE)** é a infraestrutura do AIOS para workflows de desenvolvimento autônomo. Ele permite que agentes de IA trabalhem de forma independente através de pipelines inteligentes, loops auto-recuperáveis e aprendizado persistente.

### Capacidades Principais

| Capacidade                   | Descrição                                | Épica |
| ---------------------------- | ---------------------------------------- | ----- |
| **Isolamento de Story**      | Isolamento de branch baseado em worktree | Épica 1 |
| **Status do Projeto**        | Rastreamento de status baseado em YAML  | Épica 2 |
| **Pipeline de Especificação** | Automação de Requirements → Especificação | Épica 3 |
| **Planejamento de Implementação** | Geração de plano e rastreamento de progresso | Épica 4 |
| **Auto-Recuperação**        | Detecção de travamento e recuperação    | Épica 5 |
| **Evolução de QA**          | Loops automáticos de review → correção  | Épica 6 |
| **Camada de Memória**       | Aprendizado de padrões e documentação de gotchas | Épica 7 |

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Framework AIOS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    ADE - Motor de Desenvolvimento Autônomo             │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Épica 1   │  │   Épica 2   │  │   Épica 3   │  │   Épica 4   │   │ │
│  │  │  Worktree   │→│   Status    │→│    Spec     │→│    Plano    │   │ │
│  │  │  Manager    │  │   Loader    │  │  Pipeline   │  │   Tracker   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                     Estado Runtime .aios/                       │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Épica 5   │  │   Épica 6   │  │   Épica 7   │  │     WIS     │   │ │
│  │  │ Auto-Cure  │←│   Loop QA   │←│   Memória   │←│  Mecanismo  │   │ │
│  │  │   Loop      │  │ Orchestrate │  │   Layer     │  │   Learning   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Princípios de Design

### 1. Determinismo Primeiro

```yaml
Prioridade:
  1. Scripts determinísticos      # Sempre preferir
  2. Queries SQL/JSON             # Previsível, auditável
  3. Regex/pattern matching       # Reproduzível
  4. LLM como último recurso      # Apenas quando criatividade é necessária
```

### 2. Persistência de Estado

Todo o estado do ADE é persistido em `.aios/` para:

- Recuperação de sessão
- Rastreamento de progresso
- Continuidade de aprendizado

### 3. Pipelines Compostos

Workflows são construídos a partir de tarefas compostas:

- Cada tarefa tem inputs/outputs definidos
- Tarefas podem ser executadas independentemente ou em sequência
- Pipelines se adaptam com base na complexidade

### 4. Loops Auto-Recuperáveis

Todo pipeline tem recuperação 
```