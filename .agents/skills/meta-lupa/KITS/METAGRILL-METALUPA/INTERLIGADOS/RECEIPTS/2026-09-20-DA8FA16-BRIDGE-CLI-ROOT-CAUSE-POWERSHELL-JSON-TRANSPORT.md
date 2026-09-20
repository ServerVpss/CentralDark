# 👑🪬 da8fa16 bridge CLI — root cause = PowerShell JSON transport

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=da8fa16fdc286beae1ad7deb6936a63130b02af0

## Direct artifact read

Exact-head worktree still present:
HEAD=da8fa16fdc286beae1ad7deb6936a63130b02af0

.tmp-complete.json contains:

status=FAIL_CLOSED
reason=INVALID_BRIDGE_EVIDENCE_JSON
wrapper_parse_fail_is_not_target_fail=true
invalid_probe_must_not_become_fact=true

## Verdict

The complete bridge evidence failed before ownership validation because the JSON string was corrupted/altered at the PowerShell CLI transport boundary.

FUNCTION_LEVEL_COMPLETE_BRIDGE_TEST=PASS.
CLI_POWERSHELL_JSON_TRANSPORT=FAIL.
TARGET_CONSUMER_REGRESSION=false.

## Deterministic rule

STRUCTURED_PAYLOAD_TO_CLI
→ prefer argv-array/subprocess transport
→ avoid shell string interpolation/quoting when possible
→ invalid transport must not become target evidence.

## NEXT_CURSOR

Invoke the same exact-head CLI through Python subprocess with argv list, passing json.dumps output as one argument; prove complete evidence returns exit 0 and target runtime remains UNKNOWN.
