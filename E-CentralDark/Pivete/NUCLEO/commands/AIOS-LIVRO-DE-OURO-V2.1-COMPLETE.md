# COMANDO - AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\docs\standards\AIOS-LIVRO-DE-OURO-V2.1-COMPLETE.md
**SHA:** 0b534271861fc7ca
**Timestamp:** 2026-08-28T02:02:10.651583
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - run: npm ci
- - run: npm run lint
- - run: npm run typecheck
- - run: npm test -- --coverage
- - run: npm audit --audit-level=high

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Framework - Livro de Ouro v2.1 (Complete)

## O Sistema Operacional Definitivo para Orquestração de Agentes IA

**Versão:** 2.1.0
**Status:** Living Document
**Última Atualização:** 2025-12-09
**Mantido Por:** AIOS Framework Team + Community
**Repositório Principal:** `SynkraAI/aios-core`

---

> **"Structure is Sacred. Tone is Flexible."**
> _— Fundamento filosófico do AIOS_

---

## 📣 IMPORTANTE: Sobre Este Documento

Este documento é a **versão consolidada v2.1** que incorpora todas as mudanças dos Sprints 2-5:

- ✅ **Modular Architecture** (4 módulos: core, development, product, infrastructure)
- ✅ **Squad System** (nova terminologia, substituindo "Expansion Pack")
- ✅ **Multi-Repo Strategy** (3 repositórios públicos + 2 privados)
- ✅ **Quality Gates 3 Layers** (Pre-commit, PR Automation, Human Review)
- ✅ **Story Template v2.0** (Cross-Story Decisions, CodeRabbit Integration)
- ✅ **npm Package Scoping** (@aios/core, @aios/squad-\*, @aios/mcp-presets)

**Referências Legadas:**

- `AIOS-LIVRO-DE-OURO.md` - Base v2.0.0 (Jan 2025)
- `AIOS-LIVRO-DE-OURO-V2.1.md` - Delta parcial
- `AIOS-LIVRO-DE-OURO-V2.1-SUMMARY.md` - Resumo de mudanças

---

## 📜 Open Source vs. Serviço - Business Model v2.1

### O Que Mudou de v2.0 para v2.1

**IMPORTANTE: v2.1 alterou fundamentalmente o business model!**

| Componente               | v2.0        | v2.1            | Rationale                  |
| ------------------------ | ----------- | --------------- | -------------------------- |
| **11 Agents**            | ✅ Open     | ✅ Open         | Core functionality         |
| **Workers (97+)**        | ❌ Closed   | ✅ **OPEN**     | Commodity, network effects |
| **Service Discovery**    | ❌ None     | ✅ **BUILT-IN** | Community needs it         |
| **Task-First Arch**      | ⚠️ Implicit | ✅ **EXPLICIT** | Architecture clarity       |
| **Clones (DNA Mental™)** | 🔒 Closed   | 🔒 **CLOSED**   | True moat (IP)             |
| **Expansion Packs**      | 🔒 Closed   | 🔒 **CLOSED**   | Domain expertise           |

### Repositório Multi-Repo Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SYNKRA ORGANIZATION                                 │
│                                                                         │
│   PUBLIC REPOSITORIES (3)                                               │
│   ═══════════════════════                                               │
│                                                                         │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  SynkraAI/aios-core (Commons Clause)                         │   │
│   │  ─────────────────────────────────────                         │   │
│   │  • Core Framework & Orchestration Engine                       │   │
│   │  • 11 Base Agents (Dex, Luna, Aria, Quinn, etc.)              │   │
│   │  • Task Runner & Workflow Engine                               │   │
│   │  • Quality Gates System                                        │   │
│   │  • Service Discovery                                           │   │
│   │  • DISCUSSIONS HUB (Central community)                         │   │
│   │  npm: @aios/core                                               │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                              ▲                                         │
│                              │ peerDependency                          │
│   ┌──────────────────────────┼──────────────────────────┐              │
│   │                          │                          │              │
│   ▼                          │                          ▼              │
│   ┌─────────────────────┐    │    ┌─────────────────────────────┐     │
│   │ SynkraAI/         │    │    │ SynkraAI/mcp-ecosystem    │     │
│   │ aios-squads (MIT)   │    │    │ (Apache 2.0)                │     │
│   │ ─────────────────   │    │    │ ──────────────────────────  │     │
│   │ • ETL Squad         │    │    │ • Docker MCP Toolkit        │     │
│   │ • Creator Squad     │    │    │ • IDE Configurations        │     │
│   │ • MMOS Squad        │    │    │ • MCP Presets               │     │
│   │ npm: @aios/squad-*  │    │    │ npm: @aios/mcp-presets      │     │
│   └─────────────────────┘    │    └─────────────────────────────┘     │
│                              │                                         │
│   PRIVATE REPOSITORIES (2)   │                                         │
│   ════════════════════════   │                                         │
│                              │                                         │
│   ┌─────────────────────┐    │    ┌─────────────────────────────┐     │
│   │ SynkraAI/mmos     │    │    │ SynkraAI/certified-       │     │
│   │ (Proprietary + NDA) │    │    │ partners (Proprietary)      │     │
│   │ ─────────────────   │    │    │ ──────────────────────────  │     │
│   │ • MMOS Minds   
```