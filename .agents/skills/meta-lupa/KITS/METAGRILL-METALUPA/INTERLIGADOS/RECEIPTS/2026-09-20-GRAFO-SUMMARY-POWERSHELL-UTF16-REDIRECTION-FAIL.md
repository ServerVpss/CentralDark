# 👑🪬 Grafo summary wrapper — PowerShell UTF-16 redirection

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=da8fa16fdc286beae1ad7deb6936a63130b02af0

## Exact execution

GLOBAL_MARKDOWN_CONFORMANCE_SELF_TEST=PASS
GRAFO_CURRENT_EXIT=1

The gate therefore executed and produced a failing report.

## Wrapper defect

PowerShell redirected Node stdout using:

> .tmp-grafo.json

The generated file contains a UTF-16 BOM.

The summarizer attempted:
read_text(encoding="utf-8")

and failed with UnicodeDecodeError before reading any findings.

## Verdict

GRAFO_GATE_EXECUTED=true.
GRAFO_GATE_RESULT=FAIL.
GRAFO_FINDINGS_SUMMARY=NOT_YET_READ.
SUMMARY_WRAPPER_ENCODING_BUG=true.
TARGET_FAILURE != SUMMARY_WRAPPER_FAILURE.

## Deterministic rule

When capturing structured stdout from native programs on Windows:
- do not assume PowerShell redirection is UTF-8;
- either use explicit UTF-8 transport or BOM-aware decoding;
- preserve already-produced artifact and parse it instead of rerunning the target.

## NEXT_CURSOR

Parse the existing .tmp-grafo.json from the exact-head worktree with BOM-aware decoding; summarize failing files, rule counts and non-hygiene errors; then clean up the worktree.
