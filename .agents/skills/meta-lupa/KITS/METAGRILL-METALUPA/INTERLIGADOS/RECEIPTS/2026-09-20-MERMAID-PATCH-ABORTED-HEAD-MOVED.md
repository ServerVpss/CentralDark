# 👑🪬 Mermaid patch aborted because CURRENT moved

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current

Attempted base:
3dc6025985d9022713b202552b165c961f5b555b

Observed remote before mutation:
7e10c6acc84d25ecf16d07ed7802907fabebff67

The worktree command checked FETCH_HEAD before applying any file edit.

Result:
HEAD_MOVED=true
PATCH_APPLIED=false
COMMIT_CREATED=false
PUSH_PERFORMED=false
ZERO_MUTATION=true

## Deterministic rule

STALE_HEAD_PATCH
→ ABORT
→ CRYSTALLIZE
→ REANCHOR CURRENT
→ RECHECK WHETHER WOUND STILL EXISTS

Do not replay a patch against the old head.
