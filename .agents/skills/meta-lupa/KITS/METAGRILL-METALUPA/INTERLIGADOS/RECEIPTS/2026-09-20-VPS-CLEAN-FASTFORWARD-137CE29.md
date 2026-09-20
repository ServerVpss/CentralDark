# MICRO-HANDOFF — VPS limpa sem reset destrutivo

Data: 2026-09-20

Depois de absorver o ouro local:

```text
BEFORE_HEAD=d539bb47c44e8aaa23634dfa13ac59ba93b6ada7
LOCAL_STATUS_BEFORE=5
BACKUP=git stash centraldark-pre-reconcile-20260920-173324
METHOD=git merge --ff-only origin/main
AFTER_HEAD=137ce29b6436680b90ceb309731701bedfe118ea
TRACKED_DIRTY=0
ALL_STATUS=0
```

O stash fica como contraprova/rollback temporário até o fixed point final. Nenhum `reset --hard` foi usado.

`USEFUL_DELTA_ABSORBED_BEFORE_CLEAN=true`
`VPS_WORKTREE_CLEAN=PASS`
`VPS_AT_LATEST_REMOTE_MAIN=UNKNOWN` porque a main continuou avançando e o fetch autenticado manual permanece indisponível.

Próximo cursor: validar/recarregar runtime no HEAD limpo e observar o deploy self-hosted pendente alcançar a main viva.
