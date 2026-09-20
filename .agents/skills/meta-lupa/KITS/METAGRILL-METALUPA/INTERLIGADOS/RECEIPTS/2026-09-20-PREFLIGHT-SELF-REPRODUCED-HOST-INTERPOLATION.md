# 👑🪬 Runtime preflight — self-reproduced host interpolation

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
CHILD_HEAD_AFTER_SOURCE_PATCH=ce2d339dc9259e5c8db7bbfa57c730cb4f2451fb

## Reproduction

While adding the negative test for Bash shell expansion, the writer itself embedded:
${PIPESTATUS[0]}

inside a host-JavaScript template string.

The JavaScript host attempted to interpolate it before the GitHub update call.

Result:
- ReferenceError before target mutation;
- test file unchanged;
- GitHub branch unchanged by that failed attempt.

## Verdict

HOST_TEMPLATE_INTERPOLATION_RISK=REPRODUCED.
WRAPPER_PARSE_FAIL_IS_NOT_TARGET_FAIL=true.
ZERO_TARGET_MUTATION_ON_FAILED_ATTEMPT=true.

## Learned deterministic rule

When transporting shell text through JavaScript/TypeScript template hosts:
- do not embed unescaped dollar-brace expansion in template literals;
- construct the sequence from literal concatenation or another non-template transport;
- run runtime preflight before fan-out;
- invalid probe must not become target evidence.

## NEXT_CURSOR

Add the same negative test using a transport-safe representation, then run py_compile + full tests on exact same HEAD.