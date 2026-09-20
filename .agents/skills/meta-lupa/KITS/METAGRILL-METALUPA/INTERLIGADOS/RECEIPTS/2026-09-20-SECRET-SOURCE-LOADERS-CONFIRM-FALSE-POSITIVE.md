# 👑🪬 Secret scanner — source confirms loader false positives

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=56687a231d9df01cacd8d5ee22faa041134da30b

## Source confirmation

File:
apps/modulos/mcp/src/modes/admin/tools/admin-provider-control.js

Observed executable secret-loading functions:
- loadSecretFromFiles(...)
- loadTailscaleKey()
- loadBuildkiteToken()

Provider header assignments use:
- token = loadSecretFromFiles(...)
- token = loadTailscaleKey()
- token = loadBuildkiteToken()
- token = await contaboAccessToken()

No literal credential value was observed in those assignments.

## Verdict

THREE_CURRENT_BARE_ASSIGNMENT_SUSPECTS_ARE_EXECUTABLE_REFERENCES=true.
LITERAL_SECRET_IN_THOSE_MATCHES=false.
SCANNER_FALSE_POSITIVE_PROVEN=true.

## Guardrail for fix

Scanner must:
- keep specific credential regexes fail-closed;
- keep quoted literal detection;
- keep bare literal token detection;
- keep sensitive-path detection;
- exempt only executable identifier/function-call/reference shapes that are not literal credentials.

Positive and negative self-tests required.
