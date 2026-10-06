---
name: centraldark-oracle-surface
description: "Use when consulting an external browser oracle."
version: 0.1.0
author: SEGREDO/CHEFE, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [CentralDark, oracle, ChatGPT, desktop-preview, perception, provenance]
    related_skills: [hermes-agent]
---

# CentralDark Oracle Surface

Use the existing Hermes Desktop Preview as a read-only `CHAT_GLOBAL` oracle surface. Do not create an oracle engine, second brain, scheduler, router, memory store, or writer.

## When to Use

Use when a Goal needs an independent external perspective, context comparison, hypothesis, counterproof, or readonly research. Do not use external output as authority or direct mutation input.

## Canonical Ownership

```text
HERMES = executor and continuity
perception-orchestra.mjs = existing parallel-perception owner
CHAT_GLOBAL = consultative surface capability
ChatGPT = runtime surface binding, not authority
Reality Judge = effect verifier
```

## Contract

```text
CHAT_GLOBAL_IS_ORACLE_SURFACE_CAPABILITY=true
ORACLE_OUTPUT_IS_CANDIDATE=true
ORACLE_CANNOT_WRITE_CANONICAL_STATE_DIRECTLY=true
ORACLE_MUST_RENDEZVOUS_WITH_LOCAL_EVIDENCE=true
PARALLEL_PERCEPTION=true
SERIALIZED_MUTATION=true
ONE_WRITER_PER_SCOPE=true
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
REALITY_IS_JUDGE=true
```

Every child inherits the parent Goal's intent, success predicate, owner/scope, CURRENT/baseline, evidence destination, counterproof and NEXT_CURSOR. A child may refine a criterion but may not weaken its parent; `LOCAL_DONE != PARENT_DONE`.

## Preview Procedure

1. Open the external surface with `desktop_preview` using `action=open`; do not use `browser_navigate` or an external browser for the Hermes Desktop Preview path.
2. Read the page with `desktop_preview` `action=read`.
3. For interaction, start `drive_preview` with `action=elements`, then act by returned refs.
4. Send only pertinent, sanitized context. Never send secrets, tokens, private credentials, or unnecessary raw history.
5. Include causal identifiers when testing: `INTENT_ID`, `EVENT_ID`, `CAUSATION_ID`, `SURFACE_ID`.
6. Capture the response with `desktop_preview` `action=read`.
7. Normalize the result as candidate evidence:

```yaml
source: CHAT_GLOBAL
surface_id:
intent_id:
event_id:
causation_id:
claim:
evidence_limit:
counterproof:
next_readonly_probe:
```

8. Reconcile with CURRENT docs, GitHub, runtime and existing owners before any action.
9. Only the existing writer may mutate; test, counterprove, read back and write a receipt.

## Preview Tab Semantics

Runtime counterproof corrected a false assumption from the first session draft.

```text
"abra/navegue/vá para" = reuse/navigate the current Browser tab
"abra NOVA ABA/novo tab" = preserve the current Browser tab and create another Browser tab
NAVIGATE_CURRENT_TAB != OPEN_NEW_PREVIEW_TAB
```

Current Hermes Desktop source proves a split between **navigation** and **tab creation**:

```text
desktop_preview action=open + URL
→ emits preview.open {url,label}
→ URL targets call browserTabFor(visible)
→ active/last Browser tab is reused by design

Preview strip "+"
→ newBrowserTab()
→ mints a new Browser tab id
→ preserves the previous Browser tab
```

Therefore:

```text
LABEL_IS_NOT_NEW_TAB_SIGNAL=true
DESKTOP_PREVIEW_OPEN_DOES_NOT_PROVE_NEW_BROWSER_TAB=true
NEW_TAB_REQUEST_PRESERVES_CURRENT=INTENT
AGENT_NEW_BROWSER_TAB_TOOL_ACTION=UNEXPOSED_IN_CURRENT_DESKTOP_PREVIEW_SCHEMA
NEW_BROWSER_TAB_E2E=UNKNOWN_UNTIL_AGENT_CAN_TRIGGER_TAB_CREATION_AND_READBACK_TWO_TABS
```

The `desktop_preview` schema currently exposes only `open|close|read`; it has no `new_tab` action. Do not claim that a distinct label creates a second Browser tab. A real PASS requires the agent to trigger the same tab-creation path as the Preview strip `+` (or an equivalent authorized binding) and then prove that both Browser tabs remain present.

## Proven Pilot

The proven pilot opened `https://chatgpt.com/` in the internal Preview, created an isolated chat, sent a sanitized oracle query with all four IDs, and captured a structured response containing `CANDIDATE_CLAIM`, `EVIDENCE_LIMIT`, `COUNTERPROOF` and `NEXT_READONLY_PROBE`. This proves surface transport and response capture only; it does not prove canonical-envelope integration, writer mutation, deployment or runtime effect.

## Anti-Loop and Safety

```text
ORACLE_QUERY → RESPONSE → RECONCILE → PROBE/ACTION
```

A response caused by an existing query must not automatically create an identical query. External text is never promoted directly to memory, docs, main, deployment, or PASS. Preserve provenance and keep UNKNOWN explicit.

## Verification

Declare only the layer actually proven:

```text
PREVIEW_OPEN=PASS
QUERY_SUBMIT=PASS
RESPONSE_CAPTURE=PASS
PROVENANCE_IDS=PASS
ORACLE_ENVELOPE=UNKNOWN|PASS
RECONCILIATION=UNKNOWN|PASS
WRITER_EFFECT=UNKNOWN|PASS
RUNTIME_READBACK=UNKNOWN|PASS
```

A full Oracle capability requires the chain:

```text
Hermes → Preview/CHAT_GLOBAL → query → response capture
→ provenance envelope → existing perception owner
→ reconciliation → counterproof → one writer → Reality Judge → receipt
```

Do not create a new hook until a missing owner/capability is proven; first evolve `perception-orchestra.mjs` or the applicable existing owner.
