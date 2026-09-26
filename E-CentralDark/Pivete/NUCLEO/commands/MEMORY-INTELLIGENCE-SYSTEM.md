# COMANDO - MEMORY-INTELLIGENCE-SYSTEM.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\MEMORY-INTELLIGENCE-SYSTEM.md
**SHA:** 153ca52472f2a9cf
**Timestamp:** 2026-08-28T02:02:36.340825
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if (hookHandler && typeof hookHandler.run === 'function') {

### Padroes
- ### Principio: Files as Memory
- **Correcao → Regra:**

### Contratos
- subgraph APPROVAL["Gate: User Approval"]

### Principios
- ### Principio: Files as Memory

### Ouro Bruto (primeiros 5000 chars)
```
# Memory Intelligence System - Architecture Vision

**Versao:** 2.1 (Target State — Core/Pro Split)
**Ultima Atualizacao:** 2026-02-09
**Autor:** @architect (Aria)
**Epic:** [MIS — Memory Intelligence System](../stories/epics/epic-memory-intelligence-system/EPIC-MIS-INDEX.md)
**Baseado Em:** [MIS-1 Investigation](../stories/epics/epic-memory-intelligence-system/story-mis-1-investigation.md)
**Documento Atual:** [MEMORY-SYSTEM.md](MEMORY-SYSTEM.md) (estado atual v1.0)
**Tags:** memory, intelligence, session-digest, progressive-retrieval, self-learning, attention-routing, core-pro-split

> **NOTA:** Este documento descreve o **estado futuro** do sistema de memoria apos todas as 7 stories do Epic MIS serem implementadas. Para o estado atual, consulte [MEMORY-SYSTEM.md](MEMORY-SYSTEM.md).

> **ARQUITETURA:** O MIS segue o modelo **Open Core** do AIOS. Toda a inteligencia de memoria reside no repositorio privado `aios-pro` (submodule `pro/`). O `aios-core` (open source) fornece apenas extension points e funciona 100% sem memoria inteligente — exatamente como hoje.

---

## Indice

1. [Visao Geral](#visao-geral)
2. [Core/Pro Separation Strategy](#corepro-separation-strategy)
3. [Design Principles](#design-principles)
4. [Arquitetura em 4 Camadas](#arquitetura-em-4-camadas)
5. [Camada 1: Capture Layer](#camada-1-capture-layer)
6. [Camada 2: Storage Layer](#camada-2-storage-layer)
7. [Camada 3: Retrieval Layer](#camada-3-retrieval-layer)
8. [Camada 4: Evolution Layer](#camada-4-evolution-layer)
9. [Session Digest Flow (PreCompact)](#session-digest-flow-precompact)
10. [Agent Memory API](#agent-memory-api)
11. [Pipeline Integration](#pipeline-integration)
12. [Memory File Format](#memory-file-format)
13. [Attention Scoring & Tiers](#attention-scoring--tiers)
14. [Cognitive Sectors](#cognitive-sectors)
15. [Self-Learning & Auto-Evolution](#self-learning--auto-evolution)
16. [Mapa de Storage Persistente](#mapa-de-storage-persistente)
17. [Mapa de Arquivos do Sistema](#mapa-de-arquivos-do-sistema)
18. [Diferencas: Estado Atual vs MIS](#diferencas-estado-atual-vs-mis)
19. [Story Roadmap](#story-roadmap)
20. [Referencias de Pesquisa](#referencias-de-pesquisa)

---

## Visao Geral

### O Problema (Estado Atual)

O sistema de memoria atual opera em **duas camadas desconectadas** (Claude Code nativo + AIOS Framework) com gaps criticos:

- **Sem session-digest** — conhecimento contextual evapora ao fechar sessao
- **Sem retrieval inteligente** — agentes carregam tudo-ou-nada (200 linhas de MEMORY.md)
- **Sem self-learning** — heuristicas, correcoes e axiomas perdidos entre sessoes
- **2,397 linhas de codigo orfao** — modulos que se referenciam mutuamente sem consumidores
- **~14K linhas de dados orfaos** — arquivos que ninguem le
- **8 broken paths** — referencias a diretorios/arquivos que nao existem

### A Solucao: Memory Intelligence System (MIS)

O MIS unifica as duas camadas em um sistema inteligente de 4 camadas, seguindo o modelo **Open Core**:

| Camada | Funcao | Repositorio | Story |
|--------|--------|-------------|-------|
| **Cleanup** | Remover dead code, preparar base | **aios-core** | MIS-2 |
| **Capture** | Captura conhecimento de sessao via hooks | **aios-pro** | MIS-3 |
| **Storage** | Armazena em Markdown com frontmatter YAML | **aios-pro** | MIS-3, MIS-4 |
| **Retrieval** | Recupera por relevancia com progressive disclosure | **aios-pro** + extension points em **aios-core** | MIS-4, MIS-6 |
| **Evolution** | Aprende e evolui regras automaticamente | **aios-pro** | MIS-5, MIS-7 |

### Principios Chave (vs Estado Atual)

| Aspecto | Estado Atual | Com MIS (aios-pro ativo) | Sem MIS (aios-core only) |
|---------|-------------|--------------------------|--------------------------|
| Session end | Nada acontece | PreCompact digest captura aprendizados | Nada acontece (como hoje) |
| Memory load | MEMORY.md (200 linhas, tudo-ou-nada) | Progressive disclosure (HOT/WARM/COLD) | MEMORY.md (como hoje) |
| Agent scope | Memorias globais sem filtragem | Memorias privadas + compartilhadas por agente | Globais (como hoje) |
| Learning | Manual (Claude decide salvar) | Automatico (correcoes, patterns, gotchas) | Manual (como hoje) |
| Token usage | ~10K tokens fixos por sessao | 60-95% reducao via attention routing | ~10K tokens (como hoje) |

---

## Core/Pro Separation Strategy

### Principio Fundamental

> **aios-core funciona 100% sem o MIS** — exatamente como funciona hoje. Quando `aios-pro` esta presente (submodule `pro/`), o MIS se conecta automaticamente via extension points. Zero configuracao manual.

### Modelo Open Core

```mermaid
flowchart LR
    subgraph CORE["aios-core (Open Source, MIT)"]
        direction TB
        C1["UnifiedActivationPipeline"]
        C2["gotchas-memory.js (mantido)"]
        C3["context-loader.js"]
        C4[".claude/settings.json (hook stubs)"]
        C5["Extension Points<br/>(isProAvailable checks)"]
    end

    subgraph PRO["aios-pro (Privado, Submodule pro/)"]
        direc
```