# 👑🪬 Secret scan wrapper failure — cmd redirection quoting

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=56687a231d9df01cacd8d5ee22faa041134da30b

## Attempt

Remote HEAD and exact worktree HEAD matched.

Failure occurred while invoking native cmd redirection to an absolute temp path.

Observed:
"O sistema não pode encontrar o caminho especificado."
CHANGED_LIST_FAIL

## Verdict

SECRET_SCANNER_EXECUTED=false.
SECRET_RESULT=UNKNOWN.
TARGET_FAILURE=false.
CMD_REDIRECTION_QUOTING_BUG=true.

## Learned rule

For cross-shell binary transport:
- prefer temp files relative to the already selected worktree;
- avoid host-shell quoting layers when not required;
- validate temp artifact existence before invoking scanner.

## NEXT_CURSOR

Reuse exact worktree; export .tmp-changed.bin and .tmp-patch.diff relative to worktree with native cmd redirection; then run scanner + no-value diagnostic.
