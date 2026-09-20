# 👑🪬 Mermaid fix — pushed with counterproof

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
NEW_CHILD_HEAD=56687a231d9df01cacd8d5ee22faa041134da30b

## Patch

File:
docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.mmd

Change:
- invalid reserve node identifier -> AIOS_EXT
- matching edge identifier -> AIOS_EXT

Human-readable label and edge semantics preserved.

Diff:
1 file
2 insertions
2 deletions
AIOS_EXT_OCCURRENCES=2

## Counterproof

The pre-patch blob was exactly:
b56755dfb67bcd5927c579c5b72f697e9263f1d9

A temporary exact-blob patch rendered successfully on the VPS actions-runner using:
Mermaid CLI 11.9.0
chrome-headless-shell 131.0.6778.204

MMDC_EXIT=0
PNG_BYTES=110863

## Push

REMOTE_BEFORE_COMMIT=7e10c6acc84d25ecf16d07ed7802907fabebff67
PUSHED_HEAD=56687a231d9df01cacd8d5ee22faa041134da30b
WORKTREE_REMOVED=true

## Verdict

MERMAID_PRODUCT_WOUND_FIXED=true.
MERMAID_LOCAL_EXACT_BLOB_COUNTERPROOF=PASS.
SAME_HEAD_CI_FOR_56687A2=UNKNOWN_UNTIL_MEASURED.
