# 👑🪬 Grafo fence patch — candidate awaiting exact-head T1

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
PATCH_COMMIT=bbfef9f6683122ef7fbed156b81719c75d3bcc93

## Patch

Owner:
scripts/lupa/grafo-vivo-markdown-conformance.mjs

Change:
- heading semantics MD022/MD024 suspended while a fenced code block is open;
- list semantics MD029/MD030 suspended while a fenced code block is open;
- MD031/MD040 fence boundary checks remain active.

## Counterproof added

Self-test now includes fenced bash-like content containing:
- duplicate # shell comments;
- list-like marker without space;
- non-sequential ordered-list-looking code.

Expected:
No MD022/MD024/MD029/MD030 from inside the fence.

## Status

PATCH_PRESENT=true.
EXACT_HEAD_T1=UNKNOWN.
GATE_REAL_DIFF_RESULT=UNKNOWN.
DOCUMENT_NORMALIZATION_NOT_STARTED=true.

## NEXT_CURSOR

Run exact-head self-test and full --changed-from gate. Compare rule/file counts to pre-patch baseline before touching documents.
