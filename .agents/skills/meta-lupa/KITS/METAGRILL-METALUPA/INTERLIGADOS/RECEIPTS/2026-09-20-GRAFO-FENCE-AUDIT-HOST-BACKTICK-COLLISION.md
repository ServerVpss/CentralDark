# 👑🪬 Grafo fence audit — host backtick collision

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TARGET_HEAD=da8fa16fdc286beae1ad7deb6936a63130b02af0

## Attempt

A read-only fence-audit probe was prepared inside a JavaScript template string.
The embedded Markdown fence syntax used backticks.
The host JavaScript parser consumed that syntax before the Remote Desktop call.

Result:
- TARGET_EXECUTED=false
- REPO_MUTATED=false
- WORKTREE_CREATED=false

## Classification

HOST_TEMPLATE_SYNTAX_COLLISION=true.
TOOL_WRAPPER_FAILURE != TARGET_FAILURE.

## Deterministic learning

Cross-language command transport must account for more than ${...}:
- JavaScript template host + shell/Markdown backticks can collide;
- transport multi-language probes as joined literal lines, argv, file payload, or another non-template representation;
- preflight should reject raw host-template syntax collisions before fan-out.

## NEXT_CURSOR

Repeat the same read-only fence audit using a transport-safe command representation; classify MD022/MD024/MD030 findings as inside vs outside fences.