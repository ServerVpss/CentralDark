# 👑🪬 Secret scan wrapper failure — PowerShell binary redirection

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=56687a231d9df01cacd8d5ee22faa041134da30b

## Attempt

The exact-head worktree was created and merge-base resolved.

Failure occurred before scanner execution while trying to serialize:

git diff --name-only -z ...

through PowerShell:

Set-Content -Encoding Byte

PowerShell rejected string objects for byte encoding.

## Verdict

POWERSHELL_BINARY_REDIRECTION_BUG=true.
SECRET_SCANNER_EXECUTED=false.
SECRET_RESULT=UNKNOWN.
TARGET_FAILURE=false.
RETRY_WITH_NATIVE_BINARY_REDIRECTION=true.

## Learned rule

NUL-delimited Git output must be redirected with a transport that preserves raw bytes, e.g. native shell redirection or subprocess bytes, not PowerShell Set-Content -Encoding Byte on string pipeline objects.
