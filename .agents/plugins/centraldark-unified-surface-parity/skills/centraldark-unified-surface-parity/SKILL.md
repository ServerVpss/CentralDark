---
name: centraldark-unified-surface-parity
description: Use the existing CentralDark intent, owner and capability fabric across Text, Voice, Work and Desktop. Never create a parallel runtime or simulate unavailable tools.
---

# CentralDark Unified Surface Parity

Canonical source of truth remains `ServerVpss/CentralDark`.
This plugin is a distribution/binding adapter, not a second owner.

## Core route

```text
CentralDark + verb + payload
→ normalize intent
→ reuse existing semantic classifier / intent router
→ self-grill only enough to close real gaps
→ locate existing owner first
→ select exposed capability
→ execute only if authorized
→ verify effect
→ receipt
```

## Hard invariants

```text
INTENT_FIRST=true
PERTINENCE_FIRST=true
REUSE_BEFORE_CREATE=true
EVOLVE_EXISTING_BEFORE_CREATE=true
ONE_OWNER_PER_CAPABILITY=true
ONE_SYSTEM_ONLY=true
CURRENT > HISTORY
UNKNOWN != PASS
DOCUMENTED != EXECUTED
PERMISSION_EXISTS != TOOL_EXPOSED
PLATFORM_UNAVAILABLE_WHEN_TOOL_NOT_EXPOSED=true
NO_SECOND_PARSER=true
VOICE_REUSES_EXISTING_CLASSIFIER=true
REALITY_IS_FINAL_JUDGE=true
```

## Invocation grammar

- `CentralDark visualize ...` → observe/render; no mutation.
- `CentralDark faça ...` → execute only inside authorized scope.
- `CentralDark continue ...` → resume latest proven `NEXT_CURSOR`.
- `CentralDark cristalize ...` → write to existing owner + receipt/readback.
- `CentralDark contraprova ...` → run/design counterproof; do not mutate unless fix is explicitly requested.

The wake word is conditional, not ritual. Load only the smallest relevant subset of owners, crystals, routes and tools.

## Surface parity

Text, Voice, Work and Desktop use the same normalized intent and owner model. When the platform exposes the capability, use the real tool. When it does not, return `PLATFORM_UNAVAILABLE`; never claim a commit, file, Desktop Commander action, plugin publication, trace or token view without an observable tool result.

For the same intent/task, preserve canonical identity fields when exposed:
`SESSION_ID`, `TRACE_ID`, `INTENT_ID`, `TOOL_CALL_ID`, `SURFACE_ID`, `OWNER`, `USAGE`, `RECEIPT_ID`, `NEXT_CURSOR`.

## Tool Call visibility

`TOOL_CALL_EXECUTED != TOOL_CALL_VISIBLE_IN_SIDEBAR`.

When tracing is exposed, preserve:
`SESSION_ID -> TRACE_ID -> TOOL_CALL_ID -> USAGE/TOKENS -> RECEIPT`.

Renderer states are:
`PROVED_BY_PLATFORM_RECEIPT`, `USER_CONFIRMED_VISIBILITY`,
`PLATFORM_UNAVAILABLE`, or `UNKNOWN`.

Never infer that a tool did not execute only because the sidebar/JSON renderer is absent.
Never claim renderer visibility only because a tool returned a result.

## Crystal replay

A proven crystal is replay-first. Identify its SHA/hash/fingerprint/receipt, locate the existing owner, plug only the missing delta, and prove only the new integration.

## Optional typed decision gate

GEV/JEV or another typed decision engine may be used only as an optional decision gate. It does not replace Hermes, SOL, the CentralDark MCP, or the existing owner fabric.

## Runtime truth

This package bundles the canonical public CentralDark MCP endpoint. Successful plugin publication does not itself prove Voice runtime exposure. Live Voice binding remains a separate measurement.
