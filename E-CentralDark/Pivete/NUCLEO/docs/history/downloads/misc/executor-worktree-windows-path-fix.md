---
title: "Executor Worktree Tool — Windows Path Fix"
date: 2026-08-23
status: DOCUMENTED
---

# Problema
A ferramenta `worktree` no Executor Agent (`apps/modulos/HERMES-CORE/agents/Executor/agent.mjs`) tem `WORKTREE_ROOT = '/root/CentralDark'` hardcoded — funciona na VPS Linux, falha no Windows local com `bash: cd: /root/CentralDark: No such file or directory`.

---

## Fix (Delta Mínimo)

```javascript
// Detectar runtime e definir root apropriado
const isWindows = process.platform === 'win32';
const WORKTREE_ROOT = isWindows 
  ? 'C:/CentralDark/worktrees'  // ou E:/CentralDark/Pivete/worktrees
  : '/root/CentralDark/worktrees';

async function ensureWorktreeRoot() {
  await mkdir(WORKTREE_ROOT, { recursive: true });
}
```

---

## Worktree Dirs Já Prontos

| Path | Papel |
|------|-------|
| `C:\CentralDark\.worktrees\` | Repo canônico (Git) |
| `E:\CentralDark\Pivete\worktrees\` | Casa / Operational Home |

---

## Validação

| Check | Resultado |
|-------|-----------|
| `node --check` agent.mjs | ✅ PASS |
| 10/10 worktree tool syntax checks | ✅ PASS |
| `git worktree list --porcelain` (Windows) | ✅ PASS |
| Tool `worktree create/list/remove/prune` | ✅ 10/10 code checks PASS |
| Runtime Windows | ❌ FAIL (path hardcoded VPS) |

---

## Próximo Passo
Aplicar o fix acima no `agent.mjs` e testar `executar('worktree', {acao: 'create', branch: 'test-wiring'})` no Windows.