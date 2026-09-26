# COMANDO - qa-loop-workflow.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\aios-workflows\qa-loop-workflow.md
**SHA:** 0c3a0c9dcc168fde
**Timestamp:** 2026-08-28T02:02:32.663249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- **Lógica de Decisão:**

### Padroes
- Este workflow executa ate um maximo de iterações configuravel (padrao: 5), rastreando os resultados de cada iteracao. Quando o limite maximo e atingido ou uma parada manual e solicitada, o workflow es

### Contratos
- **Critérios de Gate:**

### Ouro Bruto (primeiros 5000 chars)
```
# QA Loop Workflow - Documentação Completa

**Versão:** 1.0
**Última Atualização:** 2026-02-04
**Epic:** 6 - QA Evolution: Autonomous Development Engine (ADE)
**Story:** 6.5
**Autor:** @architect (Aria)

---

## Índice

1. [Visao Geral](#visao-geral)
2. [Diagrama do Workflow](#diagrama-do-workflow)
3. [Steps Detalhados](#steps-detalhados)
4. [Agentes Participantes](#agentes-participantes)
5. [Tasks Executadas](#tasks-executadas)
6. [Pré-requisitos](#pre-requisitos)
7. [Entradas e Saidas](#entradas-e-saidas)
8. [Pontos de Decisão](#pontos-de-decisão)
9. [Configuração](#configuracao)
10. [Controle de Execução](#controle-de-execucao)
11. [Escalação](#escalacao)
12. [Integração com Dashboard](#integracao-com-dashboard)
13. [Tratamento de Erros](#tratamento-de-erros)
14. [Troubleshooting](#troubleshooting)
15. [Referências](#referencias)

---

## Visão Geral

O **QA Loop Orchestrator** e um workflow automatizado que orquestra o ciclo completo de:

```
Review -> Fix -> Re-review
```

Este workflow executa ate um maximo de iterações configuravel (padrao: 5), rastreando os resultados de cada iteracao. Quando o limite maximo e atingido ou uma parada manual e solicitada, o workflow escala para intervenção humana.

### Propósito

- Automatizar o ciclo de revisao de qualidade
- Reduzir tempo entre feedback e correção
- Garantir rastreabilidade completa do processo de QA
- Escalar automaticamente quando necessario

### Tipos de Projeto Suportados

- `aios-development`
- `autonomous-development`
- `qa-automation`

---

## Diagrama do Workflow

### Fluxo Principal

```mermaid
flowchart TD
    subgraph TRIGGER["Triggers de Inicio"]
        T1["*qa-loop {storyId}"]
        T2["*qa-loop-review"]
        T3["*qa-loop-fix"]
    end

    subgraph INIT["Inicialização"]
        I1["Carregar/Criar loop-status.json"]
        I2["Definir iteration = 0"]
        I3["maxIterations = 5 (config)"]
    end

    subgraph REVIEW["Fase 1: QA Review"]
        R1["@qa executa qa-review-story.md"]
        R2["Gera gate-file.yaml"]
        R3["Retorna verdict + issuesFound"]
    end

    subgraph CHECK["Fase 2: Verificar Verdict"]
        C1{"verdict?"}
        C2["APPROVE"]
        C3["BLOCKED"]
        C4["REJECT"]
    end

    subgraph FIX_REQ["Fase 3: Criar Fix Request"]
        F1["@qa executa qa-create-fix-request.md"]
        F2["Gera fix-request.md"]
        F3["Prioriza issues"]
    end

    subgraph FIX["Fase 4: Aplicar Fixes"]
        X1["@dev executa dev-apply-qa-fixes.md"]
        X2["Aplica correções"]
        X3["Valida com testes"]
        X4["Gera fixes-applied.json"]
    end

    subgraph ITER["Fase 5: Verificar Iteração"]
        IT1{"iteration >= max?"}
        IT2["iteration++"]
    end

    subgraph END["Finalização"]
        E1["COMPLETE - Story Aprovada"]
        E2["ESCALATE - Requer Humano"]
        E3["Gerar Sumario Final"]
    end

    T1 --> I1
    T2 --> R1
    T3 --> X1

    I1 --> I2
    I2 --> I3
    I3 --> R1

    R1 --> R2
    R2 --> R3
    R3 --> C1

    C1 --> |"APPROVE"| C2
    C1 --> |"BLOCKED"| C3
    C1 --> |"REJECT"| C4

    C2 --> E1
    C3 --> E2

    C4 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> X1

    X1 --> X2
    X2 --> X3
    X3 --> X4
    X4 --> IT1

    IT1 --> |"Sim"| E2
    IT1 --> |"Não"| IT2
    IT2 --> R1

    E1 --> E3
    E2 --> E3

    style TRIGGER fill:#e1f5fe
    style REVIEW fill:#fff3e0
    style CHECK fill:#fce4ec
    style FIX_REQ fill:#f3e5f5
    style FIX fill:#e8f5e9
    style ITER fill:#fff8e1
    style END fill:#e0f2f1
```

### Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> pending: *qa-loop {storyId}

    pending --> in_progress: Iniciar Loop

    in_progress --> in_progress: REJECT (iteration < max)
    in_progress --> completed: APPROVE
    in_progress --> escalated: BLOCKED
    in_progress --> escalated: Max Iterations
    in_progress --> stopped: *stop-qa-loop

    stopped --> in_progress: *resume-qa-loop
    escalated --> in_progress: *resume-qa-loop

    completed --> [*]
    escalated --> [*]: Intervencao Humana
```

### Sequencia de Comunicação entre Agentes

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as System
    participant QA as @qa (Quinn)
    participant DEV as @dev (Dex)

    U->>S: *qa-loop STORY-42
    S->>S: Inicializar loop-status.json

    loop Ate max iterações ou APPROVE
        S->>QA: Executar qa-review-story.md
        QA->>QA: CodeRabbit Self-Healing
        QA->>QA: Análise Completa
        QA-->>S: verdict, issuesFound, gate-file

        alt verdict == APPROVE
            S-->>U: Story APROVADA
        else verdict == BLOCKED
            S-->>U: ESCALATE - Requer Humano
        else verdict == REJECT
            S->>QA: Executar qa-create-fix-request.md
            QA-->>S: fix-request.md, prioritizedIssues

            S->>DEV: Executar dev-apply-qa-fixes.md
            DEV->>DEV: Aplicar Fixes
            DEV->>DEV: Rodar Testes
            DEV-->>S: fixes-applied.json, issuesFixed

            S
```

---

# COMANDO - QA-LOOP-WORKFLOW.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\workflows\QA-LOOP-WORKFLOW.md
**SHA:** 1111ebe445427f7a
**Timestamp:** 2026-08-28T02:02:37.533105
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- **Logica de Decisao:**

### Padroes
- Este workflow executa ate um maximo de iteracoes configuravel (padrao: 5), rastreando os resultados de cada iteracao. Quando o limite maximo e atingido ou uma parada manual e solicitada, o workflow es

### Contratos
- **Criterios de Gate:**

### Ouro Bruto (primeiros 5000 chars)
```
# QA Loop Workflow - Documentacao Completa

**Versao:** 1.0
**Ultima Atualizacao:** 2026-02-04
**Epic:** 6 - QA Evolution: Autonomous Development Engine (ADE)
**Story:** 6.5
**Autor:** @architect (Aria)

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Diagrama do Workflow](#diagrama-do-workflow)
3. [Steps Detalhados](#steps-detalhados)
4. [Agentes Participantes](#agentes-participantes)
5. [Tasks Executadas](#tasks-executadas)
6. [Pre-requisitos](#pre-requisitos)
7. [Entradas e Saidas](#entradas-e-saidas)
8. [Pontos de Decisao](#pontos-de-decisao)
9. [Configuracao](#configuracao)
10. [Controle de Execucao](#controle-de-execucao)
11. [Escalacao](#escalacao)
12. [Integracao com Dashboard](#integracao-com-dashboard)
13. [Tratamento de Erros](#tratamento-de-erros)
14. [Troubleshooting](#troubleshooting)
15. [Referencias](#referencias)

---

## Visao Geral

O **QA Loop Orchestrator** e um workflow automatizado que orquestra o ciclo completo de:

```
Review -> Fix -> Re-review
```

Este workflow executa ate um maximo de iteracoes configuravel (padrao: 5), rastreando os resultados de cada iteracao. Quando o limite maximo e atingido ou uma parada manual e solicitada, o workflow escala para intervencao humana.

### Proposito

- Automatizar o ciclo de revisao de qualidade
- Reduzir tempo entre feedback e correcao
- Garantir rastreabilidade completa do processo de QA
- Escalar automaticamente quando necessario

### Tipos de Projeto Suportados

- `aios-development`
- `autonomous-development`
- `qa-automation`

---

## Diagrama do Workflow

### Fluxo Principal

```mermaid
flowchart TD
    subgraph TRIGGER["Triggers de Inicio"]
        T1["*qa-loop {storyId}"]
        T2["*qa-loop-review"]
        T3["*qa-loop-fix"]
    end

    subgraph INIT["Inicializacao"]
        I1["Carregar/Criar loop-status.json"]
        I2["Definir iteration = 0"]
        I3["maxIterations = 5 (config)"]
    end

    subgraph REVIEW["Fase 1: QA Review"]
        R1["@qa executa qa-review-story.md"]
        R2["Gera gate-file.yaml"]
        R3["Retorna verdict + issuesFound"]
    end

    subgraph CHECK["Fase 2: Verificar Verdict"]
        C1{"verdict?"}
        C2["APPROVE"]
        C3["BLOCKED"]
        C4["REJECT"]
    end

    subgraph FIX_REQ["Fase 3: Criar Fix Request"]
        F1["@qa executa qa-create-fix-request.md"]
        F2["Gera fix-request.md"]
        F3["Prioriza issues"]
    end

    subgraph FIX["Fase 4: Aplicar Fixes"]
        X1["@dev executa dev-apply-qa-fixes.md"]
        X2["Aplica correcoes"]
        X3["Valida com testes"]
        X4["Gera fixes-applied.json"]
    end

    subgraph ITER["Fase 5: Verificar Iteracao"]
        IT1{"iteration >= max?"}
        IT2["iteration++"]
    end

    subgraph END["Finalizacao"]
        E1["COMPLETE - Story Aprovada"]
        E2["ESCALATE - Requer Humano"]
        E3["Gerar Sumario Final"]
    end

    T1 --> I1
    T2 --> R1
    T3 --> X1

    I1 --> I2
    I2 --> I3
    I3 --> R1

    R1 --> R2
    R2 --> R3
    R3 --> C1

    C1 --> |"APPROVE"| C2
    C1 --> |"BLOCKED"| C3
    C1 --> |"REJECT"| C4

    C2 --> E1
    C3 --> E2

    C4 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> X1

    X1 --> X2
    X2 --> X3
    X3 --> X4
    X4 --> IT1

    IT1 --> |"Sim"| E2
    IT1 --> |"Nao"| IT2
    IT2 --> R1

    E1 --> E3
    E2 --> E3

    style TRIGGER fill:#e1f5fe
    style REVIEW fill:#fff3e0
    style CHECK fill:#fce4ec
    style FIX_REQ fill:#f3e5f5
    style FIX fill:#e8f5e9
    style ITER fill:#fff8e1
    style END fill:#e0f2f1
```

### Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> pending: *qa-loop {storyId}

    pending --> in_progress: Iniciar Loop

    in_progress --> in_progress: REJECT (iteration < max)
    in_progress --> completed: APPROVE
    in_progress --> escalated: BLOCKED
    in_progress --> escalated: Max Iterations
    in_progress --> stopped: *stop-qa-loop

    stopped --> in_progress: *resume-qa-loop
    escalated --> in_progress: *resume-qa-loop

    completed --> [*]
    escalated --> [*]: Intervencao Humana
```

### Sequencia de Comunicacao entre Agentes

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as System
    participant QA as @qa (Quinn)
    participant DEV as @dev (Dex)

    U->>S: *qa-loop STORY-42
    S->>S: Inicializar loop-status.json

    loop Ate max iteracoes ou APPROVE
        S->>QA: Executar qa-review-story.md
        QA->>QA: CodeRabbit Self-Healing
        QA->>QA: Analise Completa
        QA-->>S: verdict, issuesFound, gate-file

        alt verdict == APPROVE
            S-->>U: Story APROVADA
        else verdict == BLOCKED
            S-->>U: ESCALATE - Requer Humano
        else verdict == REJECT
            S->>QA: Executar qa-create-fix-request.md
            QA-->>S: fix-request.md, prioritizedIssues

            S->>DEV: Executar dev-apply-qa-fixes.md
            DEV->>DEV: Aplicar Fixes
            DEV->>DEV: Rodar Testes
            DEV-->>S: fixes-applied.json, issuesFixed

            S
```