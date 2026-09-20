# 👑🪬 Review — 1652189 / one explicit test gap remains

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
REVIEWED_HEAD=165218930fa2912b9f31f46569f56cc024faa14a

## Newly covered

The current test file explicitly covers:
- incomplete desktop bridge ownership evidence => FAIL_CLOSED;
- complete desktop bridge ownership evidence => wrapper PASS;
- wrapper PASS still leaves target_runtime_result=UNKNOWN_UNTIL_TARGET_PROBE;
- required receipt fields are present;
- preflight inheritance by Engine/Master/Operational Method.

## Remaining explicit gap

cmd_preflight_lint contains fail-closed branches for:
- invalid JSON;
- JSON value that is not an object.

The self-test list does not currently exercise those CLI parse branches.

INVALID_BRIDGE_JSON_CODE_PATH_EXISTS=true.
INVALID_BRIDGE_JSON_COUNTERPROOF_TEST=false.

## NEXT_CURSOR

Remeasure #1597 CURRENT HEAD. If still 1652189, add one deterministic test covering invalid JSON fail-closed; then exact-head py_compile + full self-test + CLI counterproof.
