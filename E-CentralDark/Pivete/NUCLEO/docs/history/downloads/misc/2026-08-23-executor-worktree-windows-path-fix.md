# EXECUTOR WORKTREE TOOL — WINDOWS PATH FIX

## Problema
Ferramenta `worktree` no Executor Agent (`apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`) tem `WORKTREE_ROOT = '/root/CentralDark'` hardcoded — funciona na VPS, falha no Windows local:
```
worktree list falhou: bash: line 1: cd: /root/CentralDark: No such file or directory
```

## Solução (Delta Mínimo)
```javascript
const isWindows = process.platform === 'win32';
const WORKTREE_ROOT = isWindows
  ? 'C:/CentralDark/worktrees'  // ou E:/CentralDark/Pivete/worktrees
  : '/root/CentralDark/worktrees';
```

## Validação
- Tool completo: create/list/remove/prune ✅
- 10/10 syntax checks ✅
- `node --check` PASS ✅
- Syntax valid ✅
- Falha apenas no runtime Windows (path hardcoded)

## Dirs Já Prontos
| Path | Origem |
|------|--------|
| `C:\CentralDark\.worktrees\` | Repo canônico (git) |
| `E:\CentralDark\Pivete\worktrees\` | Casa/canônico |

## Validação Local
```bash
# Windows Git Bash
cd /c/CentralDark && git worktree list --porcelain
# Funciona ✅
```

## Integração Kanban
`kanban_bridge.py` já suporta `workspace_path` e `workspace_kind` na criação de tasks:
```python
workspace_kind=body.get("workspace_kind") or "scratch",
workspace_path=body.get("workspace_path") or None,
```

## Fluxo de Wiring
```
Kanban Task (workspace_path) 
  → Orchestrator delega para Executor
  → Executor.worktree.create({ branch, path, base })
  → Worktree criado em /root/CentralDark/worktrees/<branch>
  → Task atualizada com workspace_path
  → Executor.shell roda dentro do worktree (cd <path>)
```

## Arquivo Modificado
`apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`
- Adicionado: `WORKTREE_ROOT` dinâmico + `ensureWorktreeRoot()`
- Nova tool `worktree` com actions: list, create, remove, prune
- 10/10 syntax checks ✅
- `node --check` PASS ✅

---

## Referência
Arquivo modificado: `apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`
Delta aplicado: ~50 linhas (WORKTREE_ROOT dinâmico + case 'worktree')