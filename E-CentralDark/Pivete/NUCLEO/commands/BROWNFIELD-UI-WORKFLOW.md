# COMANDO - brownfield-ui-workflow.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\aios-workflows\brownfield-ui-workflow.md
**SHA:** 59bdefdf8da09987
**Timestamp:** 2026-08-28T02:02:32.596592
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 2. Executar comando: `*draft`
- 2. Executar comando: `*develop {story-id}`
- 2. Executar comando: `*review {story-id}`

### Ouro Bruto (primeiros 5000 chars)
```
# Workflow Brownfield UI/Frontend Enhancement

> **ID:** `brownfield-ui`
> **Tipo:** Brownfield (projeto existente)
> **Versão:** 1.0
> **Última Atualização:** 2026-02-04

## Sumário

- [Visão Geral](#visao-geral)
- [Diagrama do Workflow](#diagrama-do-workflow)
- [Steps Detalhados](#steps-detalhados)
- [Agentes Participantes](#agentes-participantes)
- [Tasks Executadas](#tasks-executadas)
- [Pré-requisitos](#pre-requisitos)
- [Entradas e Saidas](#entradas-e-saidas)
- [Pontos de Decisão](#pontos-de-decisao)
- [Troubleshooting](#troubleshooting)
- [Referências](#referencias)

---

## Visão Geral

O **Brownfield UI/Frontend Enhancement Workflow** é um fluxo de trabalho estruturado para aprimorar aplicações frontend existentes. Ele abrange desde a análise inicial do sistema legado até a implementação completa de novas funcionalidades, modernização de componentes ou atualização do design.

### Casos de Uso

| Tipo de Projeto | Descrição |
|-----------------|-----------|
| **UI Modernization** | Atualização de interfaces legadas para padrões modernos |
| **Framework Migration** | Migração entre frameworks (ex: jQuery para React) |
| **Design Refresh** | Atualização visual seguindo novos padrões de design |
| **Frontend Enhancement** | Adição de novas funcionalidades ao frontend existente |

### Benefícios

- Análise estruturada do sistema existente antes de modificações
- Integração segura com código legado
- Validação de qualidade em cada etapa
- Documentação completa de decisões arquiteturais

---

## Diagrama do Workflow

### Diagrama Principal de Fluxo

```mermaid
graph TD
    subgraph "Fase 1: Análise e Planejamento"
        A[Inicio: UI Enhancement] --> B[architect: Análise UI Existente]
        B --> C[pm: Criar PRD Brownfield]
        C --> D[ux-expert: Especificação Frontend]
        D --> E[architect: Arquitetura Brownfield]
    end

    subgraph "Fase 2: Validação"
        E --> F[po: Validar com po-master-checklist]
        F --> G{PO encontrou problemas?}
        G -->|Sim| H[Retornar ao agente para correções]
        H --> F
        G -->|Não| I[po: Fragmentar documentos]
    end

    subgraph "Fase 3: Ciclo de Desenvolvimento"
        I --> J[sm: Criar story]
        J --> K{Revisar story draft?}
        K -->|Sim| L[analyst/pm: Revisar e aprovar story]
        K -->|Não| M[dev: Implementar story]
        L --> M
        M --> N{Revisao QA?}
        N -->|Sim| O[qa: Revisar implementacao]
        N -->|Não| P{Mais stories?}
        O --> Q{QA encontrou issues?}
        Q -->|Sim| R[dev: Corrigir feedback QA]
        Q -->|Não| P
        R --> O
        P -->|Sim| J
        P -->|Não| S{Retrospectiva do Epic?}
    end

    subgraph "Fase 4: Finalização"
        S -->|Sim| T[po: Retrospectiva do Epic]
        S -->|Não| U[Projeto Completo]
        T --> U
    end

    style U fill:#90EE90,stroke:#228B22
    style I fill:#ADD8E6,stroke:#4682B4
    style J fill:#ADD8E6,stroke:#4682B4
    style M fill:#ADD8E6,stroke:#4682B4
    style C fill:#FFE4B5,stroke:#FF8C00
    style D fill:#FFE4B5,stroke:#FF8C00
    style E fill:#FFE4B5,stroke:#FF8C00
    style L fill:#F0E68C,stroke:#BDB76B
    style O fill:#F0E68C,stroke:#BDB76B
    style T fill:#F0E68C,stroke:#BDB76B
```

### Legenda de Cores

| Cor | Significado |
|-----|-------------|
| Verde Claro | Conclusão do workflow |
| Azul Claro | Steps de execução principal |
| Laranja Claro | Criação de artefatos de documentação |
| Amarelo Claro | Steps opcionais de revisão |

### Diagrama de Ciclo de Desenvolvimento

```mermaid
sequenceDiagram
    participant SM as @sm (River)
    participant DEV as @dev (Dex)
    participant QA as @qa (Quinn)
    participant PO as @po (Pax)

    loop Para cada Story do Epic
        SM->>SM: Criar story a partir dos docs fragmentados
        SM->>DEV: Entregar story para implementação
        DEV->>DEV: Implementar tasks da story
        DEV->>DEV: Escrever testes
        DEV->>DEV: Marcar story como "Ready for Review"

        alt QA Review Habilitada
            DEV->>QA: Solicitar revisao
            QA->>QA: Executar review-story

            alt Issues Encontradas
                QA->>DEV: Retornar para correções
                DEV->>DEV: Aplicar fixes
                DEV->>QA: Reenviar para revisão
            end

            QA->>PO: Story aprovada
        else Sem QA Review
            DEV->>PO: Story pronta
        end
    end

    PO->>PO: Epic completo - Retrospectiva opcional
```

### Diagrama de Estados da Story

```mermaid
stateDiagram-v2
    [*] --> Draft: SM cria story
    Draft --> Approved: PM/Analyst revisa (opcional)
    Draft --> InProgress: Dev inicia implementação
    Approved --> InProgress: Dev inicia implementação
    InProgress --> ReadyForReview: Dev completa tasks
    ReadyForReview --> Review: QA inicia revisao
    Review --> InProgress: QA encontra issues
    Review --> Done: QA aprova
    ReadyForReview --> Done: Sem QA review
    Done --> [*]: Story finalizada
```

---

## Steps Detalhados

### S
```

---

# COMANDO - BROWNFIELD-UI-WORKFLOW.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\workflows\BROWNFIELD-UI-WORKFLOW.md
**SHA:** b526cb19f316d54a
**Timestamp:** 2026-08-28T02:02:37.423453
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 2. Executar comando: `*draft`
- 2. Executar comando: `*develop {story-id}`
- 2. Executar comando: `*review {story-id}`

### Ouro Bruto (primeiros 5000 chars)
```
# Workflow Brownfield UI/Frontend Enhancement

> **ID:** `brownfield-ui`
> **Tipo:** Brownfield (projeto existente)
> **Versao:** 1.0
> **Ultima Atualizacao:** 2026-02-04

## Sumario

- [Visao Geral](#visao-geral)
- [Diagrama do Workflow](#diagrama-do-workflow)
- [Steps Detalhados](#steps-detalhados)
- [Agentes Participantes](#agentes-participantes)
- [Tasks Executadas](#tasks-executadas)
- [Pre-requisitos](#pre-requisitos)
- [Entradas e Saidas](#entradas-e-saidas)
- [Pontos de Decisao](#pontos-de-decisao)
- [Troubleshooting](#troubleshooting)
- [Referencias](#referencias)

---

## Visao Geral

O **Brownfield UI/Frontend Enhancement Workflow** e um fluxo de trabalho estruturado para aprimorar aplicacoes frontend existentes. Ele abrange desde a analise inicial do sistema legado ate a implementacao completa de novas funcionalidades, modernizacao de componentes ou atualizacao do design.

### Casos de Uso

| Tipo de Projeto | Descricao |
|-----------------|-----------|
| **UI Modernization** | Atualizacao de interfaces legadas para padroes modernos |
| **Framework Migration** | Migracao entre frameworks (ex: jQuery para React) |
| **Design Refresh** | Atualizacao visual seguindo novos padroes de design |
| **Frontend Enhancement** | Adicao de novas funcionalidades ao frontend existente |

### Beneficios

- Analise estruturada do sistema existente antes de modificacoes
- Integracao segura com codigo legado
- Validacao de qualidade em cada etapa
- Documentacao completa de decisoes arquiteturais

---

## Diagrama do Workflow

### Diagrama Principal de Fluxo

```mermaid
graph TD
    subgraph "Fase 1: Analise e Planejamento"
        A[Inicio: UI Enhancement] --> B[architect: Analise UI Existente]
        B --> C[pm: Criar PRD Brownfield]
        C --> D[ux-expert: Especificacao Frontend]
        D --> E[architect: Arquitetura Brownfield]
    end

    subgraph "Fase 2: Validacao"
        E --> F[po: Validar com po-master-checklist]
        F --> G{PO encontrou problemas?}
        G -->|Sim| H[Retornar ao agente para correcoes]
        H --> F
        G -->|Nao| I[po: Fragmentar documentos]
    end

    subgraph "Fase 3: Ciclo de Desenvolvimento"
        I --> J[sm: Criar story]
        J --> K{Revisar story draft?}
        K -->|Sim| L[analyst/pm: Revisar e aprovar story]
        K -->|Nao| M[dev: Implementar story]
        L --> M
        M --> N{Revisao QA?}
        N -->|Sim| O[qa: Revisar implementacao]
        N -->|Nao| P{Mais stories?}
        O --> Q{QA encontrou issues?}
        Q -->|Sim| R[dev: Corrigir feedback QA]
        Q -->|Nao| P
        R --> O
        P -->|Sim| J
        P -->|Nao| S{Retrospectiva do Epic?}
    end

    subgraph "Fase 4: Finalizacao"
        S -->|Sim| T[po: Retrospectiva do Epic]
        S -->|Nao| U[Projeto Completo]
        T --> U
    end

    style U fill:#90EE90,stroke:#228B22
    style I fill:#ADD8E6,stroke:#4682B4
    style J fill:#ADD8E6,stroke:#4682B4
    style M fill:#ADD8E6,stroke:#4682B4
    style C fill:#FFE4B5,stroke:#FF8C00
    style D fill:#FFE4B5,stroke:#FF8C00
    style E fill:#FFE4B5,stroke:#FF8C00
    style L fill:#F0E68C,stroke:#BDB76B
    style O fill:#F0E68C,stroke:#BDB76B
    style T fill:#F0E68C,stroke:#BDB76B
```

### Legenda de Cores

| Cor | Significado |
|-----|-------------|
| Verde Claro | Conclusao do workflow |
| Azul Claro | Steps de execucao principal |
| Laranja Claro | Criacao de artefatos de documentacao |
| Amarelo Claro | Steps opcionais de revisao |

### Diagrama de Ciclo de Desenvolvimento

```mermaid
sequenceDiagram
    participant SM as @sm (River)
    participant DEV as @dev (Dex)
    participant QA as @qa (Quinn)
    participant PO as @po (Pax)

    loop Para cada Story do Epic
        SM->>SM: Criar story a partir dos docs fragmentados
        SM->>DEV: Entregar story para implementacao
        DEV->>DEV: Implementar tasks da story
        DEV->>DEV: Escrever testes
        DEV->>DEV: Marcar story como "Ready for Review"

        alt QA Review Habilitada
            DEV->>QA: Solicitar revisao
            QA->>QA: Executar review-story

            alt Issues Encontradas
                QA->>DEV: Retornar para correcoes
                DEV->>DEV: Aplicar fixes
                DEV->>QA: Reenviar para revisao
            end

            QA->>PO: Story aprovada
        else Sem QA Review
            DEV->>PO: Story pronta
        end
    end

    PO->>PO: Epic completo - Retrospectiva opcional
```

### Diagrama de Estados da Story

```mermaid
stateDiagram-v2
    [*] --> Draft: SM cria story
    Draft --> Approved: PM/Analyst revisa (opcional)
    Draft --> InProgress: Dev inicia implementacao
    Approved --> InProgress: Dev inicia implementacao
    InProgress --> ReadyForReview: Dev completa tasks
    ReadyForReview --> Review: QA inicia revisao
    Review --> InProgress: QA encontra issues
    Review --> Done: QA aprova
    ReadyForReview --> Done: Sem QA review
    Done --> [*]: Story finalizada
```

---

## Steps Detalhados

### S
```

---

# COMANDO - BROWNFIELD-UI-WORKFLOW.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\workflows\.extracted_AIOS-WORKFLOWS\BROWNFIELD-UI-WORKFLOW.md
**SHA:** 9e2b63a381d069cf
**Timestamp:** 2026-08-28T02:02:37.740983
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 2. Executar comando: `*draft`
- 2. Executar comando: `*develop {story-id}`
- 2. Executar comando: `*review {story-id}`

### Ouro Bruto (primeiros 5000 chars)
```
# Workflow Brownfield UI/Frontend Enhancement

> **ID:** `brownfield-ui`
> **Tipo:** Brownfield (projeto existente)
> **Versao:** 1.0
> **Ultima Atualizacao:** 2026-02-04

## Sumario

- [Visao Geral](#visao-geral)
- [Diagrama do Workflow](#diagrama-do-workflow)
- [Steps Detalhados](#steps-detalhados)
- [Agentes Participantes](#agentes-participantes)
- [Tasks Executadas](#tasks-executadas)
- [Pre-requisitos](#pre-requisitos)
- [Entradas e Saidas](#entradas-e-saidas)
- [Pontos de Decisao](#pontos-de-decisao)
- [Troubleshooting](#troubleshooting)
- [Referencias](#referencias)

---

## Visao Geral

O **Brownfield UI/Frontend Enhancement Workflow** e um fluxo de trabalho estruturado para aprimorar aplicacoes frontend existentes. Ele abrange desde a analise inicial do sistema legado ate a implementacao completa de novas funcionalidades, modernizacao de componentes ou atualizacao do design.

### Casos de Uso

| Tipo de Projeto | Descricao |
|-----------------|-----------|
| **UI Modernization** | Atualizacao de interfaces legadas para padroes modernos |
| **Framework Migration** | Migracao entre frameworks (ex: jQuery para React) |
| **Design Refresh** | Atualizacao visual seguindo novos padroes de design |
| **Frontend Enhancement** | Adicao de novas funcionalidades ao frontend existente |

### Beneficios

- Analise estruturada do sistema existente antes de modificacoes
- Integracao segura com codigo legado
- Validacao de qualidade em cada etapa
- Documentacao completa de decisoes arquiteturais

---

## Diagrama do Workflow

### Diagrama Principal de Fluxo

```mermaid
graph TD
    subgraph "Fase 1: Analise e Planejamento"
        A[Inicio: UI Enhancement] --> B[architect: Analise UI Existente]
        B --> C[pm: Criar PRD Brownfield]
        C --> D[ux-expert: Especificacao Frontend]
        D --> E[architect: Arquitetura Brownfield]
    end

    subgraph "Fase 2: Validacao"
        E --> F[po: Validar com po-master-checklist]
        F --> G{PO encontrou problemas?}
        G -->|Sim| H[Retornar ao agente para correcoes]
        H --> F
        G -->|Nao| I[po: Fragmentar documentos]
    end

    subgraph "Fase 3: Ciclo de Desenvolvimento"
        I --> J[sm: Criar story]
        J --> K{Revisar story draft?}
        K -->|Sim| L[analyst/pm: Revisar e aprovar story]
        K -->|Nao| M[dev: Implementar story]
        L --> M
        M --> N{Revisao QA?}
        N -->|Sim| O[qa: Revisar implementacao]
        N -->|Nao| P{Mais stories?}
        O --> Q{QA encontrou issues?}
        Q -->|Sim| R[dev: Corrigir feedback QA]
        Q -->|Nao| P
        R --> O
        P -->|Sim| J
        P -->|Nao| S{Retrospectiva do Epic?}
    end

    subgraph "Fase 4: Finalizacao"
        S -->|Sim| T[po: Retrospectiva do Epic]
        S -->|Nao| U[Projeto Completo]
        T --> U
    end

    style U fill:#90EE90,stroke:#228B22
    style I fill:#ADD8E6,stroke:#4682B4
    style J fill:#ADD8E6,stroke:#4682B4
    style M fill:#ADD8E6,stroke:#4682B4
    style C fill:#FFE4B5,stroke:#FF8C00
    style D fill:#FFE4B5,stroke:#FF8C00
    style E fill:#FFE4B5,stroke:#FF8C00
    style L fill:#F0E68C,stroke:#BDB76B
    style O fill:#F0E68C,stroke:#BDB76B
    style T fill:#F0E68C,stroke:#BDB76B
```

### Legenda de Cores

| Cor | Significado |
|-----|-------------|
| Verde Claro | Conclusao do workflow |
| Azul Claro | Steps de execucao principal |
| Laranja Claro | Criacao de artefatos de documentacao |
| Amarelo Claro | Steps opcionais de revisao |

### Diagrama de Ciclo de Desenvolvimento

```mermaid
sequenceDiagram
    participant SM as @sm (River)
    participant DEV as @dev (Dex)
    participant QA as @qa (Quinn)
    participant PO as @po (Pax)

    loop Para cada Story do Epic
        SM->>SM: Criar story a partir dos docs fragmentados
        SM->>DEV: Entregar story para implementacao
        DEV->>DEV: Implementar tasks da story
        DEV->>DEV: Escrever testes
        DEV->>DEV: Marcar story como "Ready for Review"

        alt QA Review Habilitada
            DEV->>QA: Solicitar revisao
            QA->>QA: Executar review-story

            alt Issues Encontradas
                QA->>DEV: Retornar para correcoes
                DEV->>DEV: Aplicar fixes
                DEV->>QA: Reenviar para revisao
            end

            QA->>PO: Story aprovada
        else Sem QA Review
            DEV->>PO: Story pronta
        end
    end

    PO->>PO: Epic completo - Retrospectiva opcional
```

### Diagrama de Estados da Story

```mermaid
stateDiagram-v2
    [*] --> Draft: SM cria story
    Draft --> Approved: PM/Analyst revisa (opcional)
    Draft --> InProgress: Dev inicia implementacao
    Approved --> InProgress: Dev inicia implementacao
    InProgress --> ReadyForReview: Dev completa tasks
    ReadyForReview --> Review: QA inicia revisao
    Review --> InProgress: QA encontra issues
    Review --> Done: QA aprova
    ReadyForReview --> Done: Sem QA review
    Done --> [*]: Story finalizada
```

---

## Steps Detalhados

### S
```