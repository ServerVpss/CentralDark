---
title: "🧠 Mapa Obsidian — BRAIN CentralDark"
status: "DERIVED_VIEW"
date: 2026-09-18
updated: 2026-09-18T09:55:00-03:00
tags: ["brain", "obsidian", "mapa", "grafo", "moc", "biblioteca"]
category: "BRAIN_NAVIGATION"
sensitivity: "INTERNAL"
source: "ServerVpss/CentralDark@main + canonical owners"
source_class: "INTERNAL"
source_rule: "GRAFO_IS_NAVIGATION_NOT_AUTHORITY"
owner: "docs/BRAIN/00-MAPA-SISTEMA/02-GRAFOS/MAPA-OBSIDIAN-BRAIN.md"
truth_scope: "DERIVED_NAVIGATION_PROJECTION"
canonical: true
related: ["docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SPIRAL-TRAVERSAL.yml"]
links: ["docs/BRAIN/00-MAPA-SISTEMA/01-HUB/BRAIN.md"]
---

# 🧠 Mapa Obsidian — BRAIN CentralDark

> Mapa humano do conhecimento repo-native. Não representa runtime e não substitui Git/PR/HEAD medidos.

## 🌌 Grafo principal

```mermaid
flowchart TD
    BRAIN["🧠 BRAIN"]
    MAPA["🗺️ 00 · Mapa do Sistema"]
    PEND["📌 01 · Pendências"]
    ARQ["🏗️ 02 · Arquitetura"]
    MCP["🔌 03 · MCP & Hub"]
    VIS["🎨 04 · Design & Visual"]
    DOC["📚 05 · Documentação"]
    DEC["⚖️ 06 · Decisões"]
    NOTAS["📝 07 · Reuniões & Notas"]
    REC["🔗 08 · Recursos / Memórias"]
    MORTO["🗄️ 09 · Arquivo Morto"]
    LIB["📚 Biblioteca Cognitiva"]

    BRAIN --> MAPA
    BRAIN --> PEND
    BRAIN --> ARQ
    BRAIN --> MCP
    BRAIN --> VIS
    BRAIN --> DOC
    BRAIN --> DEC
    BRAIN --> NOTAS
    BRAIN --> REC
    BRAIN --> MORTO
    DOC --> LIB

    MAPA --> GV["🕸️ Grafo Vivo"]
    MAPA --> BOTS["🤖 Mapa dos Bots"]
    MAPA --> DIRECAO["🧭 Direção Atual Hermes"]
    MAPA --> INIT["🚀 Protocolo Inicialização"]

    DOC --> CASA["🏠 Obsidian Casa Sincronização"]
    DOC --> TUTORIAL["📖 Tutorial Obsidian"]
    DOC --> PLUGINS["🧩 Plugins Obsidian"]
    DOC --> DIAG["📐 Diagramas CentralDark"]

    LIB --> SEM["🔗 Semantic Linker"]
    LIB --> FORJA["⛏️ Knowledge Compiler / FORJA"]
    LIB --> REC

    REC --> MEM["💎 Aprendizados & Memórias"]

    BRAIN --> GH["🐙 MOC GitHub"]
    BRAIN --> SK["🛠️ MOC Skills"]
    BRAIN --> MMCP["🔌 MOC MCP"]
    BRAIN --> PM2["⚙️ MOC PM2"]
    BRAIN --> HUB["🤖 MOC CentralDark HubBot"]

    GV -. "runtime observado" .-> PM2
    CASA -. "sync físico separado" .-> BRAIN
    GH -. "estado vivo" .-> BRAIN
```

## 🌀 Caracol semântico → núcleo runtime

Este mapa **não move as notas** e não achata territórios. Cada nota permanece no seu owner/pasta; o Caracol apenas dá uma rota visual e navegável até o núcleo operacional. O contrato de travessia é reutilizado de `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SPIRAL-TRAVERSAL.yml`.

```mermaid
flowchart TB
    subgraph T1["📚 Territórios de conhecimento — permanecem separados"]
      HIST["🗄️ HISTORICAL_REDIRECT<br/>proveniência / compatibilidade"]
      BRAINN["🧠 docs/BRAIN<br/>memória e contexto"]
      DOCS["📚 documentação / decisões / aprendizados"]
      OBS["💎 CASA-VAULT / Obsidian<br/>espelho + edição local"]
    end

    subgraph T2["🧭 Navegação e projeções — não são autoridade"]
      MOC["🗺️ MOCs / wikilinks / backlinks"]
      GRAPH["🕸️ Grafo / GraphRAG / vetor"]
      CARACOL["🐚 CARACOL<br/>overlay de travessia"]
    end

    subgraph T3["🏛️ Fonte estrutural da verdade"]
      MAIN["🐙 ServerVpss/CentralDark@main"]
      OWNERS["📜 owners / contratos canônicos"]
    end

    subgraph T4["⚙️ Núcleo runtime — verdade operacional medida"]
      MASTER["🎼 MASTER-CYCLE / Trigger Fabric"]
      HERMES["🪬 HERMES"]
      MCP["🔌 MCP CentralDark"]
      SENSORS["👁️ Screenpipe / Desktop / Remote / Tray"]
      RUNTIME(("⚙️ NÚCLEO RUNTIME"))
    end

    subgraph T5["⚖️ Trilha de prova — separada da navegação"]
      TLC["🟡 TLC23 / HORN"]
      PDF["🔴 PDF_GATE"]
      CP["⚖️ CONTRAPROVA"]
      JUDGE["🟢 REALIDADE / FIXED_POINT"]
    end

    HIST -. "redirect / provenance" .-> MOC
    BRAINN -. "wikilinks" .-> MOC
    DOCS -. "relações explicáveis" .-> MOC
    OBS -. "sync físico controlado" .-> BRAINN

    MOC -. "navegação" .-> GRAPH
    GRAPH -. "overlay semântico" .-> CARACOL
    CARACOL -. "outer → inner" .-> MAIN

    MAIN --> OWNERS
    OWNERS --> MASTER
    MASTER --> HERMES
    HERMES --> MCP
    MCP --> SENSORS
    SENSORS --> RUNTIME

    RUNTIME -. "evidência medida" .-> TLC
    TLC --> PDF
    PDF --> CP
    CP --> JUDGE

    JUDGE -. "receipt / delta útil" .-> MAIN
```

A leitura correta é:

```text
HISTORICAL_REDIRECT != CURRENT
GRAFO != AUTORIDADE
PROXIMIDADE_VISUAL != CAUSALIDADE
CARACOL = NAVEGAÇÃO/OVERLAY
GITHUB_MAIN + OWNERS = VERDADE ESTRUTURAL
RUNTIME_MEDIDO = VERDADE OPERACIONAL DO AGORA
TLC23/HORN → PDF_GATE → CONTRAPROVA → PASS
MAPA/OBSIDIAN NÃO ALTERA ESTADO DO GATE
```

Assim as “linhas da viola” ligam os territórios sem misturá-los: a informação pode ser encontrada de fora para dentro e devolvida do núcleo para o owner correto, mas **nenhuma bola vira dona só porque ficou perto do centro**.

## 🧭 Rotas rápidas

| Quero entender... | Comece em | Expanda para |
|---|---|---|
| visão geral da Casa | [[BRAIN]] | [[00-MAPA]], [[02-ARQUITETURA]] |
| topologia viva | [[GRAFO-VIVO]] | [[MOC-PM2]], [[MOC-MCP]] |
| bots e agentes | [[MAPA-DOS-BOTS]] | [[MOC-CentralDark-HubBot]], [[MOC-Skills]] |
| Conselho das Inteligências | [[CONSELHO-INTELIGENCIAS-CENTRALDARK]] | Grupo da Evolução, MTProto, Bot API, MCP, Biblioteca, HERMES |
| GitHub e promoção | [[MOC-GitHub]] | decisões e documentação relacionadas |
| ferramentas/MCP | [[MOC-MCP]] | [[02-ARQUITETURA]], [[MOC-Skills]] |
| memória e aprendizado | [[BRAIN]] | `07-APRENDIZADOS-MEMORIAS` |
| fontes, livros e referências | [[BIBLIOTECA]] | [[SEMANTIC-LINKER]], Knowledge Compiler, aprendizados/memórias |
| Obsidian físico da Casa | [[OBSIDIAN-CASA-SINCRONIZACAO]] | [[TUTORIAL-OBSIDIAN]] |
| documentação visual | [[DIAGRAMAS-CENTRALDARK]] | [[GRAFO-VIVO]] |

## 🧠 Regra de navegação para IA

```text
INTENCAO
→ BRAIN/MOC MAIS PROXIMO
→ MATCH TEXTUAL
→ WIKILINKS
→ BACKLINKS
→ 1-2 HOPS RELEVANTES
→ OWNER CANONICO
→ ESTADO VIVO QUANDO O CLAIM EXIGIR
→ CONTEXTO COMPRIMIDO
```

Para material de biblioteca:

```text
FONTE
→ [[BIBLIOTECA]]
→ FACETAS/TAGS
→ WIKILINKS/BACKLINKS
→ MOC RELEVANTE
→ COGNICAO | SKILL_CANDIDATE | CONVERSA
→ KNOWLEDGE COMPILER QUANDO HOUVER DELTA REUTILIZAVEL
```

Não expandir o grafo inteiro por padrão. A beleza aqui é navegação útil, não contexto infinito.

## 🔀 Dois grafos, duas responsabilidades

```text
GRAFO DE CONHECIMENTO
= docs/BRAIN + [[wikilinks]] + backlinks + MOCs
= navegação, memória, contexto e proveniência

GRAFO VIVO
= graph-data/runtime + serviços + dependências observadas
= topologia operacional e saúde
```

Eles podem se cruzar por notas/owners, mas não devem ser confundidos nem fundidos artificialmente.

## 💎 Hubs principais

- [[BRAIN]] — entrada humana e regras de verdade.
- [[00-MAPA]] — mapa geral reconciliado.
- [[GRAFO-VIVO]] — topologia operacional observada.
- [[BIBLIOTECA]] — fontes indexadas e rota cognitiva/semântica.
- [[MOC-GitHub]] — GitHub, PRs e promoção.
- [[MOC-MCP]] — ferramentas e integrações.
- [[MOC-Skills]] — capacidades reutilizáveis.
- [[MOC-PM2]] — processos/runtime.
- [[MOC-CentralDark-HubBot]] — HubBot e consumidores.
- [[CONSELHO-INTELIGENCIAS-CENTRALDARK]] — deliberação multi-IA + Telegram + MCP + Hermes, sem novo owner paralelo.
- [[OBSIDIAN-CASA-SINCRONIZACAO]] — topologia física/sync, separada do corpus repo-native.
- [[2026-09-03-numeracao-01-10-vault]] — regra 10×10 (número+nome; teto 10; sem gaveta vazia).
- [[2026-09-03-mandato-preservar-ouro-chefe]] — vault é do CHEFE e do agente.
- [[2026-09-03-garimpo-chefe-inventario]] — GARIMPO medido.
- [[2026-09-03-ouro-chatgpt-warp-orquestrador]] — ouro ChatGPT extraído.
- [[ARVORE-SEMANTICA-DA-CASA]] — estava órfã (0 in / 0 out).
- [[IPNAMES-EXTERNAL-NETWORK-REFERENCE]] — órfã na Biblioteca.

## Endereço 10×10 (amarrado 2026-09-03)

Número+nome. Teto 10 irmãos/nível. Camada nova só se o item não encaixar na categoria existente. Sem pasta vazia pra completar 10.

Mermaid acima = HISTÓRICO (01 Pendências…). Disco atual = 00-MAPA … 08-ARTEFATOS. **Mapa ≠ disco.** Não fundir.

---
🔗 [[BRAIN]] · [[00-MAPA]] · [[GRAFO-VIVO]] · [[BIBLIOTECA]] · [[INDEX]]
