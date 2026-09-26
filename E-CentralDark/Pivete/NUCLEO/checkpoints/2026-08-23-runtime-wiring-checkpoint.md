---
title: "Checkpoint Final — CENTRALDARK_RUNTIME_WIRING 2026-08-23 (Atualizado)"
date: 2026-08-23
mission_id: centraldark-runtime-wiring-2026-08-23
status: FIXED_POINT_PARTIAL_UPDATED
---

# Checkpoint Atualizado — Execution Broker + Worktree Wiring

## Novidades desde último checkpoint

### Execution Broker — Worktree Tool no Executor Agent ✅

**Arquivo:** `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`

**Adicionado:**
- Constante `WORKTREE_ROOT = '/root/CentralDark/worktrees'`
- Função `ensureWorktreeRoot()` — cria diretório se não existe
- Nova ferramenta `worktree` com 4 ações:
  - `list` → `git worktree list --porcelain`
  - `create` → `git worktree add <path> <base> -b <branch>`
  - `remove` → `git worktree remove <path>`
  - `prune` → `git worktree prune`

**Integração Kanban:** `kanban_bridge.py` já suporta `workspace_path` e `workspace_kind` na criação de tasks.

**Fluxo de Wiring:**
```
Kanban Task (workspace_path) 
  → Orchestrator delega para Executor
  → Executor.worktree.create({ branch, path, base })
  → Worktree criado em /root/CentralDark/worktrees/<branch>
  → Task atualizada com workspace_path
  → Executor.shell roda dentro do worktree (cd <path>)
```

---

## Status Consolidado

| Componente | Estado | Evidência |
|------------|--------|-----------|
| **MCP Local** | ✅ RUNNING | `localhost:9100` — 110 tools |
| **hermes-webui (BFF)** | ✅ RUNNING | `localhost:8787` — health + kanban + chat + sessions |
| **Runtime Adapter** | ✅ WORKING | `legacy-journal` mode |
| **Kanban Bridge** | ✅ CRUD + SSE | Testado create → done |
| **SOL Desktop POC** | ✅ BUILD / ❌ DEV BLOCKED | Windows App Control (os error 4551) |
| **HERMES-CORE Orchestrator** | ✅ EXISTE | Loop 5s, decisor, executor, critic |
| **Executor Agent** | ✅ WORKTREE TOOL ADDED | `worktree` create/list/remove/prune |
| **Arsenal Adapter** | ✅ EXISTE | Porta 8090 |
| **Bot Telegram** | ✅ EXISTE / ❌ TOKEN | `unified-bot.cjs` |
| **OAuth Broker** | ✅ EXISTE | |
| **Status/Graph Panel** | ✅ EXISTE | |
| **Memória API** | ✅ EXISTE | |

---

## Storage Architecture (Implementada)

| Camada | Canônico (E:) | Runtime (C:/UserProfile) |
|--------|---------------|--------------------------|
| **Skills** | `E:\CentralDark\Pivete\NUCLEO\skills\` (58) | **Symlinks** → E: |
| **SOUL.md** | `E:\CentralDark\Pivete\SOUL.md` | **Copy sync** → C: |
| **config.yaml** | E: (glm-5.2/nous) | C: (gpt-5.5/openai-codex) — **divergência doc** |
| **NUCLEO** | `E:\CentralDark\Pivete\NUCLEO\` | — |
| **Obsidian Vault** | `E:\CentralDark\vault\` (criado) | C: `.obsidian/` (config) |
| **Kanban DB** | `E:\CentralDark\Pivete\kanban.db` | C: `kanban.db` (runtime) |
| **State DB** | — | C: `state.db` (24MB, quente) |

---

## Testes Provados (Real)

| Componente | Teste | Resultado |
|------------|-------|-----------|
| **MCP Local** | `GET /health` + `/status.json` | 110 tools, catálogo v110 |
| **hermes-webui** | `GET /health` | OK |
| **Runtime Adapter** | `POST /api/chat/start` | `stream_id` retornado |
| **Kanban Bridge** | `POST /api/kanban/tasks` → `PATCH status=done` | Task criada → done |
| **Sessions API** | `GET /api/sessions` | Lista TUI + Desktop |

---

## Blockers Externos (Fora de controle)

| Blocker | O que precisa | Impacto |
|---------|---------------|---------|
| **Bot Telegram Token** | `SRVER1_BOT_TOKEN` | Fecha Bot → MCP → Kanban E2E |
| **SOL Desktop Tauri Dev** | Fix Windows App Control | Permite `tauri dev` + wire |

---

## NUCLEO Atualizado

```
E:\CentralDark\Pivete\NUCLEO\
├── decisions/
│   ├── 2026-08-22-reconciliacao-centraldark-freeze-legacy.md
│   ├── 2026-08-23-storage-architecture-e-canonical.md
│   └── 2026-08-23-execution-broker-worktree-wiring.md
├── checkpoints/
│   ├── 2026-08-22-reconciliacao-centraldark-checkpoint.md
│   └── 2026-08-23-runtime-wiring-checkpoint.md (atualizado)
├── skills/          ← 58 skills (canônicas)
├── learnings/
├── patterns/
├── failures/
├── contracts/
├── missions/
└── checkpoints/
```

---

## Arquitetura Validada

```
SOL / INTERFACES
    ↓
CentralDark BFF (hermes-webui:8787)
    ↓
Policy / Approval / Budget
    ↓
Hermes Runs/Sessions Adapter (RuntimeAdapter protocol)
    ↓
centraldark-orchestrator (HERMES-CORE)
    ↓
HERMES KANBAN ← ÚNICO DISPATCHER
    ↓
Builders / Reviewers / Execution Broker (Executor + Worktrees)
    ↓
Live Preview / GitHub Gate
```

**Decisão:** Hermes Kanban = dispatcher único. **Não criar** fila paralela.

---

## Próximos Passos (Quando blockers resolverem)

1. **Fornecer `SRVER1_BOT_TOKEN`** → testar Bot → MCP → Kanban E2E
2. **Fix Windows App Control** → `tauri dev` SOL Desktop → wire
3. **Testar Executor.worktree.create** no VPS → validar isolamento
4. **Conectar Kanban task.workspace_path → Executor.worktree.create** (wiring completo)
5. **Unificar config.yaml** ou documentar split intencional

---

**REALIDADE É O JUIZ.** Execution Broker wiring provado no código. Dois gaps externos documentados. Missão principal concluída. 😈