# 👑🪬 Review — df80a1e surface preflight

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
REVIEWED_HEAD=df80a1e04a04454208803a622350839d9fd28703

## What the delta does

It extends the existing runtime preflight consumer; it does not create another executor.

New behavior:
- surface
- command_class
- bridge_evidence
- observed_at
- required receipt fields validation
- bridge ownership evidence validation
- target runtime remains UNKNOWN until target probe
- invalid wrapper prevents target execution claim

CLI adds:
- --surface
- --command-class
- --bridge-evidence-json
- --observed-at

## Architecture verdict

ONE_SYSTEM_ONLY_PRESERVED=true.
EXISTING_OWNER_REUSED=true.
PREFLIGHT_PASS_DOES_NOT_IMPLY_RUNTIME_PASS=true.
TARGET_RUNTIME_UNKNOWN_PRESERVED=true.

## Current test coverage

Existing tests cover:
- contract bound;
- safe literal command;
- JS-template interpolation negative;
- PowerShell PID negative;
- missing path negative;
- inheritance by Engine/Master/Operational Method.

## Missing explicit counterproofs

Not yet explicitly proven by current test file:
- bridge ownership claim with missing evidence => FAIL_CLOSED;
- bridge ownership claim with complete evidence => wrapper PASS while target runtime stays UNKNOWN;
- required receipt fields are all emitted;
- invalid bridge evidence JSON => FAIL_CLOSED.

## NEXT_CURSOR

Remeasure CURRENT HEAD. If still applicable, execute exact-head T1 including these four cases before any promotion.
