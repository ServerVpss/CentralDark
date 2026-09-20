# 👑🪬 da8fa16 exact-head T1 — bridge-complete CLI unexpected exit 8

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=da8fa16fdc286beae1ad7deb6936a63130b02af0

## Passed evidence

PY_COMPILE=PASS.

Self-test:
PASS_TOTAL=17.

This includes:
- incomplete bridge ownership evidence => FAIL_CLOSED;
- complete bridge ownership evidence => PASS at function level;
- malformed JSON => FAIL_CLOSED;
- non-object JSON => FAIL_CLOSED;
- inheritance by Engine/Master/Operational Method.

Boot:
BOOT_EXIT=0.

CLI incomplete bridge:
BRIDGE_INCOMPLETE_EXIT=8 as expected.

## Unexpected evidence

CLI complete bridge invocation from PowerShell returned:
BRIDGE_COMPLETE_EXIT=8

The wrapper aborted before:
- semantic JSON assertion;
- invalid-JSON CLI stage;
- diff-check;
- worktree cleanup.

## Classification

FUNCTION_LEVEL_COMPLETE_BRIDGE_TEST=PASS.
CLI_COMPLETE_BRIDGE_RESULT=FAIL_UNEXPECTED.
ROOT_CAUSE=UNKNOWN.

Do not classify consumer regression yet because command-line JSON transport through PowerShell is a separate boundary and has already produced quoting defects elsewhere in this mission.

## NEXT_CURSOR

Read the generated .tmp-complete.json from the still-present exact-head worktree without modifying it. Classify whether exit 8 came from:
- INVALID_BRIDGE_EVIDENCE_JSON;
- BRIDGE_EVIDENCE_MUST_BE_OBJECT;
- ownership evidence incompleteness;
- another consumer defect.

Only then patch/retry.
