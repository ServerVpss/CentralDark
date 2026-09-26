---
title: "Execution Broker — Worktree Wiring no Executor Agent"
date: 2026-08-23
tags: ["execution-broker", "worktree", "executor", "hermes-core", "kanban"]
status: CRYSTALLIZED
---

# Delta: Worktree Tool no Executor Agent

## O que foi adicionado

Em `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`:

### Nova ferramenta: `worktree`

```javascript
case 'worktree': {
  const acao = args.acao || 'list';
  try {
    await ensureWorktreeRoot();
    if (acao === 'list') { ... }
    if (acao === 'create') { ... }
    if (acao === 'remove') { ... }
    if (acao === 'prune') { ... }
  }
}
```

### Ações suportadas

| Ação | Parâmetros | Descrição |
|------|------------|-----------|
| `list` | — | `git worktree list --porcelain` |
| `create` | `branch?`, `path?`, `base?` (default: main) | `git worktree add <path> <base> -b <branch>` |
| `remove` | `path` (obrigatório) | `git worktree remove <path>` |
| `prune` | — | `git worktree prune` |

### Configuração

```javascript
const WORKTREE_ROOT = '/root/CentralDark/worktrees';

async function ensureWorktreeRoot() {
  await mkdir(WORKTREE_ROOT, { recursive: true });
}
```

---

## Integração com Kanban

O `kanban_bridge.py` já suporta `workspace_path` e `workspace_kind` na criação de tasks:

```python
# Em _create_task_payload (kanban_bridge.py)
task_id = kb.create_task(
    conn,
    ...
    workspace_kind=body.get("workspace_kind") or "scratch",
    workspace_path=body.get("workspace_path") or None,
    ...
)
```

### Fluxo de Wiring

```
1. Kanban Task criada com workspace_path
   ↓
2. Orchestrator delega para Executor
   ↓
3. Executor.worktree.create({ branch, path, base })
   ↓
4. Worktree criado em /root/CentralDark/worktrees/<branch>
   ↓
5. Task atualizada com workspace_path = path do worktree
   ↓
6. Executor.shell roda comandos dentro do worktree (cd <path>)
```

---

## Execution Broker — Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    HERMES KANBAN                            │
│  Task com workspace_kind=worktree, workspace_path=path      │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              CENTRALDARK-ORCHESTRATOR                       │
│  Decide etapa → delega para Executor                        │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXECUTOR AGENT                           │
│  worktree.create({ branch, path, base })                    │
│  shell(cmd, cwd=workspace_path)                             │
│  git.commit_push({ paths: [...] })                          │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    GIT WORKTREES                            │
│  /root/CentralDark/worktrees/<branch>/                      │
│  Isolamento total por missão                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Delta Mínimo Aplicado

1. **Executor Agent** → adicionada ferramenta `worktree` (create, list, remove, prune)
2. **WORKTREE_ROOT** = `/root/CentralDark/worktrees` (VPS)
3. **Kanban** já suporta `workspace_path` / `workspace_kind`
4. **Orchestrator** já delega para Executor via `executar(ferramenta, args)`

---

## Próximo Delta (Quando VPS Disponível)

| Ação | Comando | Objetivo |
|------|---------|----------|
| Testar create | `executar('worktree', {acao:'create', branch:'test-wiring'})` | Validar criação |
| Testar shell no worktree | `executar('shell', {comando:'pwd', cwd:'/root/CentralDark/worktrees/test-wiring'})` | Isolamento |
| Conectar Kanban → Executor | Orchestrator passa `workspace_path` da task | Wiring completo |
| Git commit_push no worktree | `executar('git', {acao:'commit_push', paths:[...]})` | Push da missão |

---

## Verificação de Sintaxe

```bash
# Verificado com node --check
node --check "C:\CentralDark\apps\modulos\HERMES-CORE\agents\Executor\agent.mjs"  # ✅ PASS
node --check "C:\CentralDark\apps\modulos\HERMES-CORE\core\orchestrator.mjs"  # ✅ PASS

# 10 checks de código confirmados
- WORKTREE_ROOT constant
- ensureWorktreeRoot function
- worktree case
- worktree create/list/remove/prune actions
- git worktree add/remove/prune commands
```

---

## Referências

- Arquivo: `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs` (linhas ~22, ~152)
- Kanban Bridge: `hermes-webui/api/kanban_bridge.py` (linha 357)
- Orchestrator: `apps/modulos/HERMES-CORE/core/orchestrator.mjs` (delegação via `executar`)
- Checkpoint: `E:\CentralDark\Pivete\NUCLEO\checkpoints\2026-08-23-runtime-wiring-checkpoint.md`