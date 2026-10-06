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

## Oracle Response Telemetry and Adaptive Surface Loop

The oracle flow does not stop at collecting text. Measure the surface, the attempt, and the response before reconciliation.

```text
SNAPSHOT_SURFACE
→ SELECT_CURRENT_BINDINGS
→ SUBMIT_QUERY
→ MEASURE_RESPONSE
→ CAPTURE_RESULT
→ SNAPSHOT_POST_STATE
→ CLASSIFY
→ ADAPT_ONLY_IF_NEEDED
→ RECONCILE
```

For each oracle attempt preserve:

```yaml
attempt_id:
intent_id:
event_id:
causation_id:
surface_id:
surface:
model_binding:
effort_binding:
input_mode:
available_controls:
missing_controls:
submit_observed_at:
first_visible_response_observed_at:
response_complete_observed_at:
elapsed_to_first_visible_ms:
elapsed_to_complete_ms:
response_state:
error_state:
error_text:
candidate_claim:
evidence_limit:
counterproof:
next_readonly_probe:
```

Timing is observational unless the provider exposes an authoritative trace:

```text
PREVIEW_POLL_TIME != PROVIDER_BACKEND_LATENCY
FIRST_VISIBLE_RESPONSE = first response content observed by the Preview reader
COMPLETE_TIME = first observed stable/completed response state
```

Surface controls are runtime bindings, not architecture:

```text
MODEL_NAME_IS_BINDING=true
EFFORT_LEVEL_IS_BINDING=true
INPUT_MODE_IS_BINDING=true
VISIBLE_CONTROL != INVOKABLE_CAPABILITY
CONTROL_PRESENT != ACTION_EXECUTED
VOICE_BUTTON_VISIBLE != VOICE_SESSION_ACTIVE
MIC_BUTTON_VISIBLE != MICROPHONE_CAPTURE_ACTIVE
```

Map controls dynamically with `drive_preview action=elements`; do not hard-code screen coordinates or assume a model/effort list remains stable. Preserve labels/options observed at that attempt.

Adaptation is goal-driven:

```text
simple/mechanical goal → prefer sufficient lower-cost/faster binding when available
complex/ambiguous/counterproof-heavy goal → prefer stronger reasoning binding when available
surface/error/capability mismatch → change only the failed binding or route
same failure + same inputs + no new information → do not blind-retry
```

Model, effort, and text/voice mode may change between attempts without changing the parent Goal. The child may refine its execution binding but may not weaken the parent's success criterion.
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
