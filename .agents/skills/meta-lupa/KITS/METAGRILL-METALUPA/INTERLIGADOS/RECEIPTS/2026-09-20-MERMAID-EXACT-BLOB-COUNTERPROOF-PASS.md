# 👑🪬 Mermaid exact-blob counterproof PASS

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597

## Exact source proof

GitHub/current ARCHITECTURE.mmd blob:
b56755dfb67bcd5927c579c5b72f697e9263f1d9

The VPS actions-runner workspace copy was verified with git hash-object and matched the exact same blob SHA.

## Temporary patch

Only two identifier substitutions were applied to a temporary copy:
- invalid node identifier -> AIOS_EXT
- matching edge identifier -> AIOS_EXT

Human-readable node label and edge semantics were preserved.

PATCH_COUNT=1 node + 1 edge.

## Render counterproof

Executor:
VPS actions-runner host

Mermaid CLI:
cached @mermaid-js/mermaid-cli 11.9.0

Browser:
cached chrome-headless-shell 131.0.6778.204

Result:
MMDC_EXIT=0
PNG_BYTES=110863
TEMP_CLEANUP=PASS

## Verdict

MERMAID_MINIMAL_PATCH_PROVEN=true.
MERMAID_ENGINE_FAILURE=false.
PATCH_TARGET_EXACT_BLOB=true.
TARGETED_PUSH_ALLOWED_IF_HEAD_UNCHANGED=true.

## NEXT_CURSOR

Recheck #1597 CURRENT HEAD. If ARCHITECTURE.mmd blob is still b56755..., apply exactly the two identifier substitutions and push. If head/blob moved, abort and remeasure.
