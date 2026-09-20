# 👑🪬 Secret suspect — exact diff proves function-call false positives

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=56687a231d9df01cacd8d5ee22faa041134da30b

## Exact scanner execution

PR_SECRET_SCAN_SELF_TEST_OK cases=7

Result:
secret_suspect=true
touched_sensitive=true
touched_bot=false
changed_count=32

## No-value diagnostic

File:
apps/modulos/mcp/dist/modes/admin/tools/admin-provider-control.js

Matches:

line 451:
BARE_ASSIGNMENT
LEN=33
SAFE_REF=true
FUNCTION_CALL_SHAPE=false

line 453:
BARE_ASSIGNMENT
LEN=32
SAFE_REF=true
FUNCTION_CALL_SHAPE=false

line 507:
BARE_ASSIGNMENT
LEN=19
SAFE_REF=false
FUNCTION_CALL_SHAPE=true

line 513:
BARE_ASSIGNMENT
LEN=16
SAFE_REF=false
FUNCTION_CALL_SHAPE=true

line 519:
BARE_ASSIGNMENT
LEN=18
SAFE_REF=false
FUNCTION_CALL_SHAPE=true

No values were printed.

## Verdict

The two SAFE_REFERENCE matches are already exempted by scanner logic.

The remaining three suspect matches have immediate function-call shape after the captured identifier.

CURRENT_SECRET_SUSPECT_CAUSE=BARE_ASSIGNMENT_FUNCTION_CALL_FALSE_POSITIVE.

LITERAL_SECRET_NOT_PROVEN=true.
SCANNER_DISCRIMINATION_DEFECT_PROVEN=true.

## Required fix

BARE_ASSIGNMENT must reject executable identifier/function-call references while still failing:
- quoted literal secret;
- bare literal token;
- known specific credential patterns;
- sensitive path changes.

Add positive/negative self-tests before changing verdict.
