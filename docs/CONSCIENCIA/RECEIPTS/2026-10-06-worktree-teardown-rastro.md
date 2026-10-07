# Receipt — Worktree teardown com rastro permanente

DATE=2026-10-06
OWNER=.agents/skills/centraldark-operational-method/SKILL.md
INTENT=Evitar acúmulo de worktrees temporários sem perder ouro, prova ou proveniência.
OWNER_COMMIT=300ae449a48702a8c00a41eda3b22630a2fe856d

## Regra promovida

```text
MISSION_DONE
→ CLASSIFY_WORKTREE
→ UNIQUE_DELTA? PRESERVE/PROMOTE_FIRST
→ RECEIPT
→ REMOVE_WORKTREE
→ PRUNE_IF_APPLICABLE
```

## Cristais

`WORKTREE_IS_DISPOSABLE=true`
`UNIQUE_DELTA_MUST_SURVIVE_BEFORE_TEARDOWN=true`
`CLEAN_OR_PROMOTED_BEFORE_REMOVE=true`
`TEARDOWN_REQUIRES_RECEIPT=true`
`GIT_WORKTREE_PRUNE_AFTER_SAFE_REMOVE=true`
`TEMPORARY_BENCH_IS_NOT_MEMORY=true`
`GIT_RECEIPT_CRYSTAL_IS_MEMORY=true`

## Semântica

- worktree = bancada temporária;
- repo/main/cristal/receipt = memória durável;
- worktree não é removido enquanto houver delta único, commit local não promovido, prova pendente ou UNKNOWN;
- após promoção/preservação + receipt, a bancada pode ser removida e o catálogo de worktrees pode ser podado;
- `ONE_SYSTEM_ONLY != ONE_WORKTREE_ONLY`;
- mutação paralela exige isolamento por escopo e continua obedecendo `ONE_WRITER_PER_SCOPE=true`.

## Rastro mínimo por teardown

MISSION_ID
WORKTREE_PATH
BASE_HEAD
FINAL_HEAD_OR_PROMOTED_SHA
UNIQUE_DELTA_STATUS
PROMOTION_TARGET
RECEIPT_PATH
REMOVED_AT
PRUNE_RESULT
VERDICT

VERDICT=CRYSTALLIZED
NEXT_CURSOR=Aplicar esta regra no próximo executor que criar worktree temporário; remover apenas após provar preservação do delta útil.
