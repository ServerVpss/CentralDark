---
title: "Diagramas do Sistema CentralDark"
date: 2026-06-29
tags: ["diagrama", "arquitetura", "fluxo", "mermaid", "sistema"]
updated: 2026-06-29
---

# 🗺️ Diagramas do Sistema CentralDark

> Abre no Obsidian e os diagramas renderizam automaticamente.
> Requer plugin: **Mermaid** (já vem nativo no Obsidian).

---

## 1. Fluxo Geral — Como os dados andam

```mermaid
flowchart TD
    PIVETE(["👤 Pivete\n(você)"])

    subgraph ENTRADA["📲 Entrada"]
        TG["📱 Telegram\n@srver1bot"]
        CC["💻 Claude Code\n(terminal VPS)"]
    end

    subgraph BOT["🤖 Bot Hub (PM2 id 27)"]
        HUB["HubBot\nunified-bot.cjs"]
        CON["🧠 Consciousness\n(roteador de intenção)"]
        SKL["⚡ Skills\n(executor)"]
    end

    subgraph CEREBRO["🧠 Cérebro Vivo"]
        BRAIN["📓 BRAIN\n(Obsidian / docs/BRAIN)"]
        CONS["📋 CONSCIENCIA\n(docs/CONSCIENCIA)"]
    end

    subgraph VPS["🖥️ VPS (infraestrutura)"]
        PM2["⚙️ PM2\n(gerenciador de processos)"]
        SCRIPTS["📜 Scripts\n(/root/CentralDark/scripts/)"]
        MCP["🔌 MCP Hub\n(CentralDark-MCP)"]
    end

    GH["🐙 GitHub\nServerVpss/CentralDark\n(Fonte da Verdade)"]

    PIVETE -->|"digita"| TG
    PIVETE -->|"comanda"| CC
    TG --> HUB
    CC -->|"edita arquivos / faz commit"| GH
    HUB --> CON
    CON -->|"roteia"| SKL
    SKL -->|"grava nota"| BRAIN
    SKL -->|"registra decisão"| CONS
    HUB <-->|"lê / escreve"| MCP
    MCP <-->|"acessa"| VPS
    SCRIPTS -->|"cron automático"| BRAIN
    SCRIPTS -->|"cron automático"| CONS
    BRAIN <-->|"sync pull/push"| GH
    CONS <-->|"sync pull/push"| GH
    PM2 -->|"roda"| HUB
    PM2 -->|"roda"| SCRIPTS

    style PIVETE fill:#6366f1,color:#fff,stroke:#4f46e5
    style GH fill:#24292e,color:#fff,stroke:#000
    style HUB fill:#0ea5e9,color:#fff
    style CON fill:#8b5cf6,color:#fff
    style BRAIN fill:#10b981,color:#fff
    style CONS fill:#10b981,color:#fff
```

---

## 2. Pipeline de Memória — Os 3 Agentes Autônomos

```mermaid
sequenceDiagram
    participant CRON as ⏰ Cron
    participant S1 as 🔍 Stage 1<br/>Scout
    participant S2 as 🧠 Stage 2<br/>Analyst
    participant S3 as 🔧 Stage 3<br/>Executor
    participant VAULT as 📓 Vault<br/>(BRAIN + CONSCIENCIA)
    participant GH as 🐙 GitHub
    participant TG as 📱 Telegram

    CRON->>S1: toda hora (timer aleatório)
    S1->>VAULT: varre notas
    S1->>S1: detecta gaps<br/>(sem frontmatter, sem links,<br/>órfãs, isoladas)
    
    alt gaps encontrados
        S1->>S2: escreve last-report.json
        S1->>TG: notifica Pivete
        CRON->>S2: 15 min depois
        S2->>S2: classifica<br/>CRÍTICO / ALTO / AUTO-FIX
        S2->>S3: escreve analyst-decision.json
        CRON->>S3: 14 min depois
        S3->>VAULT: corrige AUTO-FIX<br/>(adiciona frontmatter,<br/>seção Conexões Rápidas)
        S3->>GH: commit + push automático
        S3->>TG: "✅ X gaps corrigidos"
    else sem gaps
        S1->>S1: silêncio (não notifica)
    end
```

---

## 3. Sincronia 4-Point — A Lei do Sistema

```mermaid
flowchart LR
    subgraph P1["Ponto 1"]
        VPS["🖥️ VPS\n/root/CentralDark/"]
    end
    subgraph P2["Ponto 2"]
        GH["🐙 GitHub\nServerVpss/CentralDark"]
    end
    subgraph P3["Ponto 3"]
        OBS["📓 Obsidian\ndocs/BRAIN + CONSCIENCIA"]
    end
    subgraph P4["Ponto 4"]
        MEM["🧠 Memória das IAs\n.claude/ + CLAUDE.md"]
    end

    VPS <-->|"git push/pull"| GH
    GH <-->|"Obsidian Git\nauto-pull 10min"| OBS
    VPS <-->|"arquivos = vault"| OBS
    MEM <-->|"leitura obrigatória"| GH
    MEM <-->|"contexto"| VPS

    REGRA["⚠️ Nenhuma mudança\né concluída até os\n4 pontos estarem\nsincronizados"]

    style REGRA fill:#ef4444,color:#fff,stroke:#dc2626
    style VPS fill:#0ea5e9,color:#fff
    style GH fill:#24292e,color:#fff
    style OBS fill:#10b981,color:#fff
    style MEM fill:#8b5cf6,color:#fff
```

---

## 4. Arsenal de Skills — Mapa de Chamada

```mermaid
flowchart TD
    PIVETE(["👤 Pivete fala..."])

    PIVETE -->|"Grava aí / Anota"| MR["🧠 MEMORY-REGISTRAR"]
    PIVETE -->|"Detetive / Investiga o grafo"| GI["🔍 GRAPH-INVESTIGATOR"]
    PIVETE -->|"Liga tudo / Conecta"| SL["🔗 SEMANTIC-LINKER"]
    PIVETE -->|"Audita tudo / Varredura"| SW["🕵️ SWARM-INVESTIGADOR"]
    PIVETE -->|"Acha o bug / Investiga código"| CI["🐛 CODE-INVESTIGATOR"]
    PIVETE -->|"Registra a decisão"| DR["📌 DECISION-RECORDER"]
    PIVETE -->|"Forja / Melhora o prompt"| PE["✨ PROMPT-ENGINEER"]
    PIVETE -->|"Revisão do dia"| DV["📋 DAILY-REVIEWER"]
    PIVETE -->|"Analisa as issues"| IA["🐙 ISSUE-ANALYZER"]
    PIVETE -->|"Revisa a arquitetura"| AR["🏗️ ARCHITECTURE-REVIEWER"]

    MR --> BRAIN["📓 BRAIN vault"]
    DR --> CONS["📋 08-HISTORICO-DECISOES"]
    GI --> BRAIN
    SL --> BRAIN
    SW --> BRAIN
    CI --> VPS["🖥️ VPS / código"]
    PE --> CHAT["💬 resposta no chat"]
    DV --> BRAIN
    IA --> GH["🐙 GitHub issues"]
    AR --> CONS

    style PIVETE fill:#6366f1,color:#fff
    style BRAIN fill:#10b981,color:#fff
    style CONS fill:#10b981,color:#fff
    style GH fill:#24292e,color:#fff
    style VPS fill:#0ea5e9,color:#fff
```

---

## Conexões Rápidas

- [[MAPA-DO-CEREBRO]] — visão geral textual do sistema
- [[00-AGENTS-INDEX]] — arsenal de skills
- [[00-LEIA-PRIMEIRO]] — regras para IAs
- [[BRAIN]] — raiz do vault
