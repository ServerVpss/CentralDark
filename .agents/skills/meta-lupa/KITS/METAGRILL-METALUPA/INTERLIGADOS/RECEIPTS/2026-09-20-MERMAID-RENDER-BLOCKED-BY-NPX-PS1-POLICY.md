# 👑🪬 Mermaid render blocked by PowerShell execution policy

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=7e10c6acc84d25ecf16d07ed7802907fabebff67

## Local patch state

Ephemeral worktree received exactly:
- 1 node identifier replacement;
- 1 edge identifier replacement.

No commit was created.
No push was performed.

## Render attempt

Command used npx from PowerShell.

Windows resolved:
C:\Program Files\nodejs\npx.ps1

PowerShell execution policy blocked script execution.

Result:
MERMAID_RENDER_NOT_EXECUTED=true.
PRODUCT_FAILURE=false.
EXECUTOR_WRAPPER_FAILURE=true.

## Rule

NPX_PS1_POLICY_BLOCK
→ DO_NOT_CLASSIFY_TARGET
→ RETRY_WITH_NPX_CMD_OR_CMD_EXE
→ SAME_LOCAL_PATCH
→ RENDER
→ ONLY THEN COMMIT/PUSH.

## NEXT_CURSOR

Reuse the same ephemeral worktree if present, render through npx.cmd, then guard remote HEAD before commit/push.
