# 👑🪬 REVIEW — preflight binding overclaim + literal newline defect

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
CHILD_HEAD=75bfc9bb72039a54b4daa9e4a207dc35b2970761

## Concrete defect

Direct read of scripts/trigger-fabric/centraldark_full_trigger_boot.py on the child HEAD shows literal backslash-n text inserted inside Python source:

LOCK_CONTRACT = ... "\nRUNTIME_PREFLIGHT_LINT = ...

and inside rules:

False,\n "runtime_preflight_lint_required": ...

This was introduced by the previous update path.

## Consequence

FILE_BOUND=true.
SOURCE_HASH_OWNER_BOUND=true.
EXECUTABLE_CONSUMER=false.
POSITIVE_NEGATIVE_TEST=false.
PYTHON_PARSE_CURRENT=NOT_PROVEN.
PREVIOUS_BINDING_PASS_CLAIM=RETRACTED_AS_OVERCLAIM.

## Test gap

scripts/trigger-fabric/test_centraldark_full_trigger_boot.py currently does not assert:
- RUNTIME_PREFLIGHT_LINT is required;
- runtime_preflight_lint_required is emitted;
- malformed JS-host shell interpolation fails closed;
- PowerShell $pid mutation/collision fails closed;
- safe Bash/PowerShell command passes.

## Contract status

RUNTIME-PREFLIGHT-LINT.yml says:
status=CANDIDATE_UNTIL_EXECUTABLE_CONSUMER
promotion.executable_consumer_required=true

Therefore current state must remain CANDIDATE.

## Required correction

1. replace literal \n sequences with real newlines;
2. implement an executable preflight-lint consumer in the existing boot owner;
3. add positive and negative tests;
4. run py_compile + tests on exact same HEAD after patch;
5. only then promote contract status from CANDIDATE.

CURRENT_OVER_PREVIOUS_CLAIM=true.
UNKNOWN_IS_NOT_PASS=true.
