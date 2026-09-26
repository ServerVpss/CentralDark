# COMANDO - SM-SYSTEM.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\agent-flows\SM-SYSTEM.md
**SHA:** 58a285634e6faa86
**Timestamp:** 2026-08-28T02:02:31.996552
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: Story Development Cycle] --> B["@sm: Criar proxima story<br/>*draft"]

### Ouro Bruto (primeiros 5000 chars)
```
# Sistema do Agente @sm

> **Versao:** 1.0.0
> **Criado:** 2026-02-04
> **Owner:** @sm (River - Facilitator)
> **Status:** Documentacao Oficial

---

## Visao Geral

O agente **@sm (River)** e o Scrum Master tecnico do AIOS, especializado em preparacao de stories e facilitacao de processos ageis. Seu papel principal e criar stories detalhadas e acionaveis que agentes desenvolvedores possam implementar com minima necessidade de pesquisa adicional.

**Responsabilidades Principais:**
- Criacao e refinamento de user stories
- Gerenciamento de epics e breakdown de requisitos
- Facilitacao de sprint planning
- Orientacao sobre processos ageis
- Preparacao de handoffs para desenvolvedores
- Gerenciamento de branches locais durante desenvolvimento

**Arquetipo:** Facilitator (Pisces)
**Tom de Comunicacao:** Empatico, colaborativo, fluido
**Vocabulario-Chave:** adaptar, pivotar, ajustar, simplificar, conectar, fluir, remover

---

## Lista Completa de Arquivos

### Arquivos Core de Tasks do @sm

| Arquivo | Comando | Proposito |
|---------|---------|-----------|
| `.aios-core/development/tasks/sm-create-next-story.md` | `*draft` | Task principal para criar proxima story do backlog |
| `.aios-core/development/tasks/create-next-story.md` | `*draft` | Versao completa da task de criacao de story |
| `.aios-core/development/tasks/execute-checklist.md` | `*story-checklist` | Executa checklist de validacao de story draft |
| `.aios-core/development/tasks/correct-course.md` | `*correct-course` | Analisa e corrige desvios de processo |
| `.aios-core/development/tasks/collaborative-edit.md` | - | Edicao colaborativa de documentos |
| `.aios-core/development/tasks/init-project-status.md` | - | Inicializacao de status do projeto |

### Arquivos de Definicao do Agente

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/development/agents/sm.md` | Definicao core do agente SM |
| `.claude/commands/AIOS/agents/sm.md` | Comando Claude Code para ativar @sm |
| `.cursor/rules/sm.md` | Regras para Cursor IDE |
| `.cursor/rules/sm.mdc` | Regras compiladas para Cursor |

### Arquivos de Checklists Utilizados

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/product/checklists/story-draft-checklist.md` | Valida qualidade e completude de story drafts |
| `.aios-core/product/checklists/story-dod-checklist.md` | Definition of Done para stories |
| `.aios-core/product/checklists/change-checklist.md` | Navegacao de mudancas e correcao de curso |
| `.aios-core/product/checklists/po-master-checklist.md` | Checklist mestre usado em validacao |

### Arquivos Relacionados de Outros Agentes

| Arquivo | Agente | Proposito |
|---------|--------|-----------|
| `.aios-core/development/agents/po.md` | @po | Coordena com @sm em backlog e sprint planning |
| `.aios-core/development/agents/dev.md` | @dev | Recebe stories do @sm para implementacao |
| `.aios-core/development/agents/pm.md` | @pm | Cria epics que @sm quebra em stories |
| `.aios-core/development/agents/devops.md` | @github-devops | Recebe stories completas para push/PR |
| `.aios-core/development/agents/qa.md` | @qa | Coordena em risk profiling |

### Arquivos de Workflows que Utilizam @sm

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/development/workflows/story-development-cycle.yaml` | Ciclo completo de desenvolvimento de stories |
| `.aios-core/development/workflows/greenfield-fullstack.yaml` | Workflow greenfield full-stack |
| `.aios-core/development/workflows/greenfield-service.yaml` | Workflow greenfield service |
| `.aios-core/development/workflows/greenfield-ui.yaml` | Workflow greenfield UI |
| `.aios-core/development/workflows/brownfield-fullstack.yaml` | Workflow brownfield full-stack |
| `.aios-core/development/workflows/brownfield-service.yaml` | Workflow brownfield service |
| `.aios-core/development/workflows/brownfield-ui.yaml` | Workflow brownfield UI |

### Arquivos de Configuracao

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/core-config.yaml` | Configuracao central (devStoryLocation, etc.) |
| `.aios-core/development/scripts/greeting-builder.js` | Script de saudacao inteligente |
| `.aios-core/development/scripts/agent-assignment-resolver.js` | Resolucao de assignment de agentes |

---

## Flowchart: Sistema Completo do @sm

```mermaid
flowchart TB
    subgraph INPUTS["📥 INPUTS"]
        PRD["📄 PRD/Epic<br/>(from @pm)"]
        BACKLOG["📋 Backlog Priorizado<br/>(from @po)"]
        ARCH["🏗️ Arquitetura<br/>(docs/architecture/)"]
    end

    subgraph SM_AGENT["🌊 @sm (River) - Scrum Master"]
        direction TB

        subgraph COMMANDS["Comandos Disponiveis"]
            DRAFT["*draft<br/>Criar proxima story"]
            CHECKLIST["*story-checklist<br/>Validar story draft"]
            CORRECT["*correct-course<br/>Corrigir desvios"]
            GUIDE["*guide<br/>Guia de uso"]
            HELP["*help<br/>Listar comandos"]
        end

        subgraph PROCESS["Processo de Criacao"]
            LOAD_CONFIG["1. Car
```

---

# COMANDO - sm-system.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\aios-agent-flows\sm-system.md
**SHA:** 5ac637203eb6c09e
**Timestamp:** 2026-08-28T02:02:32.358922
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- A[Start: Story Development Cycle] --> B["@sm: Criar proxima story<br/>*draft"]

### Ouro Bruto (primeiros 5000 chars)
```
# Sistema do Agente @sm

> **Versão:** 1.0.0
> **Criado:** 2026-02-04
> **Owner:** @sm (River - Facilitator)
> **Status:** Documentação Oficial

---

## Visão Geral

O agente **@sm (River)** e o Scrum Master tecnico do AIOS, especializado em preparacao de stories e facilitacao de processos ageis. Seu papel principal e criar stories detalhadas e acionaveis que agentes desenvolvedores possam implementar com minima necessidade de pesquisa adicional.

**Responsabilidades Principais:**
- Criacao e refinamento de user stories
- Gerenciamento de epics e breakdown de requisitos
- Facilitacao de sprint planning
- Orientacao sobre processos ageis
- Preparacao de handoffs para desenvolvedores
- Gerenciamento de branches locais durante desenvolvimento

**Arquetipo:** Facilitator (Pisces)
**Tom de Comunicacao:** Empatico, colaborativo, fluido
**Vocabulario-Chave:** adaptar, pivotar, ajustar, simplificar, conectar, fluir, remover

---

## Lista Completa de Arquivos

### Arquivos Core de Tasks do @sm

| Arquivo | Comando | Propósito |
|---------|---------|-----------|
| `.aios-core/development/tasks/sm-create-next-story.md` | `*draft` | Task principal para criar proxima story do backlog |
| `.aios-core/development/tasks/create-next-story.md` | `*draft` | Versao completa da task de criação de story |
| `.aios-core/development/tasks/execute-checklist.md` | `*story-checklist` | Executa checklist de validação de story draft |
| `.aios-core/development/tasks/correct-course.md` | `*correct-course` | Analisa e corrige desvios de processo |
| `.aios-core/development/tasks/collaborative-edit.md` | - | Edicao colaborativa de documentos |
| `.aios-core/development/tasks/init-project-status.md` | - | Inicializacao de status do projeto |

### Arquivos de Definição do Agente

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/development/agents/sm.md` | Definição core do agente SM |
| `.claude/commands/AIOS/agents/sm.md` | Comando Claude Code para ativar @sm |
| `.cursor/rules/sm.md` | Regras para Cursor IDE |
| `.cursor/rules/sm.mdc` | Regras compiladas para Cursor |

### Arquivos de Checklists Utilizados

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/product/checklists/story-draft-checklist.md` | Valida qualidade e completude de story drafts |
| `.aios-core/product/checklists/story-dod-checklist.md` | Definition of Done para stories |
| `.aios-core/product/checklists/change-checklist.md` | Navegacao de mudancas e correcao de curso |
| `.aios-core/product/checklists/po-master-checklist.md` | Checklist mestre usado em validação |

### Arquivos Relacionados de Outros Agentes

| Arquivo | Agente | Propósito |
|---------|--------|-----------|
| `.aios-core/development/agents/po.md` | @po | Coordena com @sm em backlog e sprint planning |
| `.aios-core/development/agents/dev.md` | @dev | Recebe stories do @sm para implementacao |
| `.aios-core/development/agents/pm.md` | @pm | Cria epics que @sm quebra em stories |
| `.aios-core/development/agents/devops.md` | @github-devops | Recebe stories completas para push/PR |
| `.aios-core/development/agents/qa.md` | @qa | Coordena em risk profiling |

### Arquivos de Workflows que Utilizam @sm

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/development/workflows/story-development-cycle.yaml` | Ciclo completo de desenvolvimento de stories |
| `.aios-core/development/workflows/greenfield-fullstack.yaml` | Workflow greenfield full-stack |
| `.aios-core/development/workflows/greenfield-service.yaml` | Workflow greenfield service |
| `.aios-core/development/workflows/greenfield-ui.yaml` | Workflow greenfield UI |
| `.aios-core/development/workflows/brownfield-fullstack.yaml` | Workflow brownfield full-stack |
| `.aios-core/development/workflows/brownfield-service.yaml` | Workflow brownfield service |
| `.aios-core/development/workflows/brownfield-ui.yaml` | Workflow brownfield UI |

### Arquivos de Configuracao

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/core-config.yaml` | Configuracao central (devStoryLocation, etc.) |
| `.aios-core/development/scripts/greeting-builder.js` | Script de saudacao inteligente |
| `.aios-core/development/scripts/agent-assignment-resolver.js` | Resolucao de assignment de agentes |

---

## Flowchart: Sistema Completo do @sm

```mermaid
flowchart TB
    subgraph INPUTS["📥 INPUTS"]
        PRD["📄 PRD/Epic<br/>(from @pm)"]
        BACKLOG["📋 Backlog Priorizado<br/>(from @po)"]
        ARCH["🏗️ Arquitetura<br/>(docs/architecture/)"]
    end

    subgraph SM_AGENT["🌊 @sm (River) - Scrum Master"]
        direction TB

        subgraph COMMANDS["Comandos Disponiveis"]
            DRAFT["*draft<br/>Criar proxima story"]
            CHECKLIST["*story-checklist<br/>Validar story draft"]
            CORRECT["*correct-course<br/>Corrigir desvios"]
            GUIDE["*guide<br/>Guia de uso"]
            HELP["*help<br/>Listar comandos"]
        end

        subgraph PROCESS["Processo de Criacao"]
            LOAD_CONFIG["1. Car
```