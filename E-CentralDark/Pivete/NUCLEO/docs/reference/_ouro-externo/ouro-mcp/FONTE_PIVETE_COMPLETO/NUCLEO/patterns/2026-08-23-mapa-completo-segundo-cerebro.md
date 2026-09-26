---
title: "MAPA COMPLETO — SISTEMA DE BIBLIOTECA / SEGUNDO CÉREBRO CENTRALDARK"
date: 2026-08-23
status: MAPEADO
---

# MAPEAMENTO PARALELO — 26 Componentes Identificados

---

## 📚 CAMADA 1: PERSISTÊNCIA CANÔNICA (E:\CentralDark\Pivete)

| # | Componente | Path | Status | Função |
|---|------------|------|--------|--------|
| 1 | **NUCLEO** | `E:\CentralDark\Pivete\NUCLEO\` | ✅ ATIVO | Cérebro operacional (decisions, learnings, patterns, failures, contracts, skills, missions, checkpoints) |
| 2 | **OBSIDIAN VAULT** | `E:\CentralDark\vault\` | ✅ CRIADO (vazio) | Visão navegável humana do segundo cérebro |
| 3 | **SKILLS CANÔNICAS** | `E:\CentralDark\Pivete\NUCLEO\skills\` | ✅ 60 skills | Fonte de verdade das skills (runtime em C: são symlinks) |
| 4 | **SOUL.MD CANÔNICO** | `E:\CentralDark\Pivete\SOUL.md` | ✅ HERMES-CASA | Identidade operacional canônica |
| 5 | **CONFIG.YAML CANÔNICO** | `E:\CentralDark\Pivete\config.yaml` | ✅ glm-5.2/nous | Configuração canônica para bootstrap |
| 6 | **KANBAN DB CANÔNICO** | `E:\CentralDark\Pivete\kanban.db` | ✅ EXISTE | Backup/auditoria do Kanban |
| 7 | **BACKUPS** | `E:\CentralDark\Pivete\BACKUPS\` | ✅ 7 backups | Snapshots históricos |
| 8 | **QUARANTINE** | `E:\CentralDark\_QUARANTINE\` | ✅ 1 reconciliação | Isolamento reversível |
| 9 | **MAPA CASA** | `E:\CentralDark\_MAPA_CASA\` | ✅ 10 pastas | Índice mestre da arquitetura |
| 10 | **HERMES-MENTE** | `E:\CentralDark\Pivete\NUCLEO\hermes-mente\` | ✅ 11 arquivos | Kit cognitivo (5 Leis, 10 Regras, memória 3 temps) |

---

## ⚡ CAMADA 2: RUNTIME QUENTE (C:\Users\danda\AppData\Local\hermes)

| # | Componente | Path | Status | Função |
|---|------------|------|--------|--------|
| 11 | **HERMES RUNTIME SKILLS** | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\` | ✅ 59 symlinks | Materialização runtime das skills canônicas |
| 12 | **SOUL.MD RUNTIME** | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\SOUL.md` | ✅ COPY SYNC | Cópia sincronizada da canônica |
| 13 | **CONFIG.YAML RUNTIME** | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml` | ✅ gpt-5.5/openai-codex | Config ativa do TUI (divergência documentada) |
| 14 | **KANBAN DB RUNTIME** | `C:\Users\danda\AppData\Local\hermes\kanban.db` | ✅ 127KB | Estado quente do dispatcher |
| 15 | **STATE.DB** | `C:\Users\danda\AppData\Local\hermes\state.db` | ✅ 24MB | Sessões, transcript, cache quente |
| 16 | **HERMES HISTORY** | `C:\Users\danda\AppData\Local\hermes\.hermes_history` | ✅ 184KB | Histórico de conversas |

---

## 🌐 CAMADA 3: REPOSITÓRIO CANÔNICO + GITHUB (C:\CentralDark)

| # | Componente | Path | Status | Função |
|---|------------|------|--------|--------|
| 17 | **REPO CANÔNICO LOCAL** | `C:\CentralDark\` | ✅ CLEAN (1 untracked) | Fonte de verdade versionada |
| 18 | **GITHUB REMOTO** | `ServerVpss/CentralDark` | ✅ SYNC | Registro oficial + CI/CD |
| 19 | **WORKTREES** | `C:\CentralDark\.worktrees\` | ⚠️ 2 worktrees | Isolamento de missões |
| 20 | **CENTRALDARK MODULES** | `C:\CentralDark\apps\modulos\` | ✅ 18 módulos | Microsserviços e agentes |

---

## 🤖 CAMADA 4: AGENTES E MICROSSERVIÇOS (C:\CentralDark\apps\modulos)

| # | Módulo | Status | Função Principal |
|---|--------|--------|------------------|
| 21 | **HERMES-CORE** | ✅ 8 agents | Orquestrador central (Executor, Critic, GraphRAG, etc.) |
| 22 | **ARSENAL-OPENAI-ADAPTER** | ✅ Porta 8090 | Council OpenAI-compatible (Router, Parallel, Debate, Hermes) |
| 23 | **MEMORIA-API** | ✅ index.mjs | API de memória (consumida por Hermes + Arsenal) |
| 24 | **OAUTH-BROKER** | ✅ server.mjs | Broker OAuth (providers, seed) |
| 25 | **STATUS PANEL** | ✅ painel-data.json | Mega painel vivo (status.centralldark.com) |
| 26 | **GRAPH PANEL** | ✅ server.js | Indexação por grafo (3D force graph) |
| 27 | **MCP** | ✅ dist/index.js | 110 tools (GitHub, VPS, Supabase, Kanban, etc.) |
| 27 | **BOT TELEGRAM** | ✅ unified-bot.cjs | @srver1bot (Hub ADM + Skills) |
| 28 | **OBSIDIAN PLUGIN** | ✅ main.js | Grafo vivo no Obsidian |
| 29 | **ELITE GATEWAY** | ❌ LEGACY_FROZEN | Zendriver + ChatGPT (congelado) |
| 30 | **ELITE ANTHROPIC PROXY** | ✅ | Proxy Anthropic AP7 |
| 31 | **ARTIFACTS BUILDER** | ✅ | Builder + Crafter |
| 32 | **PIVETE SYNC** | ✅ | Sincronizador do Pivete |
| 33 | **HUB** | ✅ unified-bot.cjs | Hub Supabase local |
| 34 | **MANAGEMENT APIs** | ✅ mcp-admin-ui | Admin UI do MCP |
| 35 | **PROXY / LOVABLE PROXY** | ✅ | Roteamento IA |

---

## 🔌 CAMADA 5: INFRAESTRUTURA CONECTADA

| Componente | Endpoint | Status | Função |
|------------|----------|--------|--------|
| **MCP LOCAL** | `localhost:9100` | ✅ RUNNING | 110 tools (GitHub, VPS, Supabase, Kanban, etc.) |
| **HERMES-WEBUI (BFF)** | `localhost:8787` | ✅ RUNNING | RuntimeAdapter + KanbanBridge + Sessions |
| **ARSENAL ADAPTER** | `localhost:8090` | ⚠️ NÃO TESTADO | Council OpenAI-compatible |
| **MCP REMOTO (VPS)** | `https://mcp.centralldark.com` | ❓ NÃO TESTADO | Produção |
| **ARSENAL PROXY** | `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/arsenal-proxy/v1` | ⚠️ CONFIG | Council remoto |
| **DARKAI PROXY** | `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy/v1` | ⚠️ CONFIG | Modelos via edge function |

---

## 📊 RESUMO DE CONECTIVIDADE

### ✅ CONECTADO E FUNCIONANDO
- NUCLEO (E:) ↔ Runtime Skills (C:) — **symlinks**
- SOUL.md E: → C: — **copy sync**
- Kanban DB E: ↔ C: — **dual**
- MCP Local → 110 tools — **health OK**
- hermes-webui (BFF) → RuntimeAdapter + KanbanBridge — **health OK**
- Executor Agent → worktree tool — **código adicionado**
- Git worktrees — **2 ativos**

### ⚠️ PARCIALMENTE CONECTADO
- config.yaml E: (glm-5.2/nous) ↔ C: (gpt-5.5/openai-codex) — **divergência documentada**
- Arsenal Adapter (porta 8090) — **existe, não testado**
- SOL Desktop POC — **build OK, tauri dev bloqueado (Windows App Control)**
- Bot Telegram — **existe, token ausente**

### ❌ NÃO CONECTADO / FALTANDO
- **Bot Telegram Token** — `SRVER1_BOT_TOKEN` ausente
- **SOL Desktop tauri dev** — Windows App Control (os error 4551)
- **Executor.worktree.create → Kanban workspace_path** — wiring lógico pronto, não testado
- **Git worktree integration no Orchestrator** — código pronto, não testado
- **VPS SSH / MCP Remoto** — não testado (chave SSH existe: `segredo_vps_ed25519`)

---

## 🎯 PRÓXIMOS WIRINGS (Prioridade)

| Prioridade | Wiring | Bloqueador |
|------------|--------|------------|
| 1 | Bot Token → Bot → MCP → Kanban E2E | `SRVER1_BOT_TOKEN` |
| 2 | Windows App Control fix → `tauri dev` → SOL Desktop → BFF | Ambiente |
| 3 | Executor.worktree.create → Kanban task.workspace_path | Testar no VPS |
| 4 | Orchestrator delega worktree.create para missões | Validar no VPS |
| 5 | Unificar config.yaml ou documentar split | Decisão CHEFE |

---

## 🏗️ ARQUITETURA DO SEGUNDO CÉREBRO (RESUMO)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEGUNDO CÉREBRO CENTRALDARK                  │
├─────────────────────────────────────────────────────────────────┤
│  E: (CANÔNICO/OURO)                                             │
│  ├── NUCLEO/ (decisions, learnings, patterns, skills, etc.)    │
│  ├── vault/ (Obsidian visão humana)                            │
│  ├── skills/ (60 canônicas) → symlinks para C:                 │
│  ├── SOUL.md, config.yaml (canônicos)                          │
│  ├── kanban.db, BACKUPS, QUARANTINE, MAPA_CASA                 │
│  └── hermes-mente/ (kit cognitivo)                             │
├─────────────────────────────────────────────────────────────────┤
│  C: (RUNTIME/MATERIALIZAÇÃO)                                    │
│  ├── skills/ (59 symlinks → E:)                                │
│  ├── SOUL.md (copy), config.yaml (runtime), kanban.db (quente) │
│  ├── state.db (24MB, sessões), .hermes_history                 │
│  └── hermes-webui (BFF), MCP (9100), Arsenal (8090)            │
├─────────────────────────────────────────────────────────────────┤
│  GITHUB (VERDADE VERSIONADA)                                    │
│  ├── ServerVpss/CentralDark (origin)                           │
│  ├── worktrees (isolamento missões)                            │
│  └── apps/modulos/ (18 microsserviços/agentes)                 │
├─────────────────────────────────────────────────────────────────┤
│  VPS (PRODUÇÃO)                                                 │
│  ├── /root/CentralDark/ (repo + worktrees)                     │
│  ├── PM2 (CentralDark-MCP, HubBot, etc.)                       │
│  └── MCP Remoto (mcp.centralldark.com)                         │
└─────────────────────────────────────────────────────────────────┘
```

**REGRA DE OURO:** E: = VERDADE/OURO | C: = REFLEXO/RUNTIME | GIT = HISTÓRICO/AUDITORIA | VPS = EXECUÇÃO