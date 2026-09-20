# 👑🪬 Memory Inbox Sentinel — current-main compatibility PASS

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

## Historical source

PR #1510 merged the Memory-Linker inbox capability.
Historical merge commit:
13364d482f79aa4fa24ae081c96c2374fdff7f96

Recovered files:
- scripts/memory-linker/inbox-sentinel-cron.sh
- scripts/memory-linker/inbox-sentinel.mjs
- scripts/memory-linker/inbox-sentinel.test.mjs

## Compatibility counterproof

Base:
GitHub origin/main = 9b9c0c9b64615a7b1733d7dcc3b988159c6b112f

Method:
- clean detached ephemeral worktree from origin/main;
- restore only the three historical files into the worktree;
- no commit/push;
- no runtime mutation.

Results:
- node --check inbox-sentinel.mjs = PASS
- node --test inbox-sentinel.test.mjs = 2/2 PASS
- dry-run with empty temporary inbox = exit 0, count=0
- worktree removed = true

## Verdict

HISTORICAL_CAPABILITY_COMPATIBLE_WITH_CURRENT_MAIN=true
RESTORATION_REQUIRES_NO_NEW_DEPENDENCY=true
RESTORATION_IS_REUSE_NOT_NEW_ARCHITECTURE=true
RUNTIME_KANBAN_MODE_NOT_YET_RETESTED=true
CANONICAL_RESTORE_NOT_YET_APPLIED=true

## Writer constraint

PR #1545 mentions the same inbox owner but is currently open, mergeable=false, 75 commits and 4759 changed files.
Do not use that large surface for a surgical restoration without reconciliation.

## NEXT_CURSOR

Close Hermes and Casa-bridge responsibility facts, then select/create the narrowest safe owner writer for Memory Sentinel restoration.
