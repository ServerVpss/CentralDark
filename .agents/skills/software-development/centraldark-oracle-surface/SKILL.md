---
name: centraldark-oracle-surface
description: "Use when consulting an external browser oracle."
version: 0.5.3
author: SEGREDO/CHEFE, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [CentralDark, oracle, ChatGPT, desktop-preview, perception, provenance]
    related_skills: [hermes-agent]
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
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

## SOL_EXECUTORA — Direct Authorized Execution and Original Hermes Handoff (CHEFE)

**Boundary:** this skill remains the *read-only Oracle surface*, not an executor, writer, scheduler, permission grant or substitute Hermes. The CHEFE supplies intent/authority; SOL coordinates without unnecessary narration; the authenticated original Hermes executes when Hermes was named; models are replaceable engines; real effect and counterproof judge PASS. Current SOUL/RULES/AGENTS and established administrative/secret boundaries prevail.

~~~text
SOL_EXECUTORA_CROSS_SURFACE_HANDOFF=true
CHEFE_INTENT_IS_AUTHORITY=true
SOL_IS_SILENT_COORDINATOR=true
HERMES_ORIGINAL_PRIORITY=true
EXECUTOR_DIRECT_WHEN_AUTHORIZED=true
PAPAGAIO_MODE=OFF
RITUAL_MODE=OFF
PERTINENCE_FIRST=true
MENU_MODE=OFF
ASK_MODE=OFF_FOR_CLEAR_AUTHORIZED_SCOPE
NARRATION_DURING_EXECUTION=OFF
REUSE_BEFORE_CREATE=true
EVOLVE_EXISTING_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
ONE_WRITER_PER_SCOPE=true
CURRENT_OVER_HISTORY=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
DOCUMENTED_IS_NOT_EXECUTED=true
MERGED_IS_NOT_DEPLOYED=true
~~~

**Fast path:** treat a new CHEFE request as a delta of the active Goal first. When target, authorization class, owner and sufficient acceptance predicate are clear, use the smallest actually available authorized tool/route directly for safe, reversible work. Do not offer menus, demand micro-confirmations, ask the CHEFE to copy commands the session can run, or narrate every step. Triggers are pertinent tools, never mandatory ritual. Do not fabricate tool availability, access, permission, work or success. CAPABILITY != AUTHORIZATION.

**Original Hermes:** if the CHEFE requests HERMES, first discover and measure the original live Hermes route. Forward the task using the existing authorized Hermes capability and preserve the verbatim operational output and provenance, sanitized of secrets. Never impersonate Hermes as SOL/Jarvis. If no authenticated Hermes binding exists, report HERMES_RESULT=UNKNOWN and the exact missing binding; do not invent a result or create another Hermes.

~~~text
INTENT_DELTA
→ TARGET + SCOPE + AUTHORIZATION + EXISTING_OWNER
→ CURRENT_ON_SAME_TARGET + LAST_GOOD_GREEN_STATE
→ REPLAY_PROVEN_RECIPE_IF_FINGERPRINT_MATCHES
→ SMALLEST_LIVE_AUTHORIZED_ROUTE
→ EXISTING_WRITER_EXECUTES_MINIMUM_DELTA
→ EFFECT_READBACK + BACKCHECK + INDEPENDENT_COUNTERPROOF
→ COSTURA_SOURCE_RUNTIME_RECEIPT
→ RETEST_AFFECTED_CONE_ONLY
→ SUFFICIENT_OBJECTIVE_OR_NEXT_CURSOR
~~~

**Route-local failover:** one failing SSH, Tailscale, Desktop, GitHub, MCP, HTTP or UI route is not global system failure. Preserve the unaffected good state and compare only evidence from the same target, claim, scope and time.

~~~text
ROUTE_FAIL
→ CLASSIFY_EXACT_ROUTE_AND_ERROR
→ INVENTORY_EXISTING_AUTHORIZED_ALTERNATES
→ PROBE_NEXT_DISCRIMINATING_ROUTE
→ REUSE_LIVE_CAPABILITY | UNKNOWN | REAL_BLOCKER
~~~

When Casa/VMware/VPS is relevant and a live authorized binding exists, inspect the *actual* hostname, whoami, cwd, repository HEAD/dirty state, target files, processes, ports, SSH identity and AI runtimes. Reconfirm target identity after changing transport. A route error does not authorize disabling host key checks, modifying keys, firewall, accounts, administrative policy or secrets; retain their separate explicit authorization requirements. Continue independent authorized readonly sectors rather than waiting idly.

**VOLTA UMA CASA + COSTURA:** local failure must not reset the whole mission. Classify the smallest causal wound, preserve LAST_GOOD_STATE and GREEN_STATE, rewind only the disproven delta where authorized, reconcile surviving evidence, retest only its affected cone, and continue the same Goal/LOOP_ID/NEXT_CURSOR. Never hard-reset, overwrite independent drift, or repeat an identical failure fingerprint indefinitely. Reuse the existing Ralph-style bounded recipe gate on no-progress.

~~~text
ERROR_LOCAL
→ VOLTA_UMA_CASA
→ PRESERVE_GREEN_STATE
→ REWIND_DISPROVEN_DELTA_ONLY_IF_AUTHORIZED
→ COSTURA_SURVIVING_PROOF_AND_NEXT_CURSOR
→ RETEST_AFFECTED_CONE
→ CONTINUE_SAME_GOAL
~~~

**GitHub/main:** immediately before writing, measure the current main SHA, existing owner, one writer and dirty state. Keep the delta in existing files, validate applicable syntax/lint/build/tests/diff, commit within authorization, read back the same SHA/files, and separately measure runtime effect. If main advances, STOP_WRITE → REMEASURE → RECALIBRATE → COSTURA → CONTINUE. COMMIT != DEPLOY; MERGED != DEPLOYED; file exists != runtime effect. Never push secrets or erase a dirty runtime to claim parity.

**Sufficient fixed point:** PASS needs the *authorized objective sufficiently satisfied*, effect on the intended target, backcheck, independent counterproof, receipt/readback and no material blocker/false green. This does not require perfection or closing unrelated optional UNKNOWNs. Open material NEXT_READONLY_PROBE, pending work or recoverable failure forbids Goal done; explicit cancellation and genuine HUMAN_FRONTIER remain valid stops.

**Response after work, not instead of work:**

~~~text
Feito: actual measured result
Evidência: source, same-target readback and counterproof
Pendente: real material blocker or UNKNOWN only
Estado: PASS | UNKNOWN | BLOCKED
Próximo cursor: next executable action or proven FIXED_POINT
~~~

Oracle output stays candidate evidence; only the authenticated original executor and Reality Judge produce effects/proof. This projection is not a second proof writer.

## Continuous Loop and Correlation

Use the existing HERMES continuity and perception owners; do not create a second loop, scheduler, brain, router, memory store, or writer.

Every Hermes-originated message carries this envelope:

```text
ACTOR=HERMES
LOOP_ID=<stable loop id>
TURN_ID=<unique turn id>
ATTEMPT_ID=<attempt id>
RECEIPT_ID=<receipt or pending receipt id>
PARENT_ID=<parent event/intent id>
INTENT_ID=<goal intent id>
EVENT_ID=<event id>
CAUSATION_ID=<causal predecessor>
SURFACE_ID=<surface binding id>
NEXT_CURSOR=<next proven step>
```

The oracle response must echo or otherwise correlate `LOOP_ID`, `TURN_ID`, `RECEIPT_ID`, and `PARENT_ID`. A message without `ACTOR=HERMES` and the envelope is human input, never a Hermes-generated event. Classify it as `DELTA`, `OVERRIDE`, or `PARALLEL_CONVERSATION`, reconcile it with CURRENT and the active loop, and preserve the loop unless it is an explicit valid override.

```text
OBSERVE
→ CONSULT_ORACLE
→ CORRELATE_RESPONSE
→ EXECUTE_EXISTING_OWNER
→ MEASURE
→ COUNTERPROVE
→ UPDATE_CURRENT
→ EMIT_EVIDENCE
→ REPEAT
```

Continue until `FIXED_POINT` is proved or a genuine `HUMAN_FRONTIER` is reached. `AUTH != PASS`, `ORACLE_SAID != CONFIRMED`, and `LOCAL_DONE != PARENT_DONE` remain binding.

## Continuous Oracle Loop Gate

```text
NO_TIME_WINDOW_PAUSE=true
ACTIVE_LOOP_RUNS_CONTINUOUSLY=true
TIMEZONE=America/Bahia
WATCHDOG_INTERVAL != EXECUTION_CADENCE
NEVER_WAIT_FOR_SCHEDULE_WHILE_ACTIVE=true
```

The watchdog/heartbeat exists for recovery and liveness only. It must not pause or gate an already-active Hermes↔CHAT_GLOBAL execution round.

On surface failure:

```text
CHAT_FAILURE
→ PRESERVE_LAST_GOOD_STATE + NEXT_CURSOR + LOOP_ID + RECEIPT_ID
→ RECOVER
→ IF_RECOVERY_FAILS: NEW_CHAT
→ RESTORE_MINIMUM_HANDOFF
→ CONTINUE_FROM_NEXT_CURSOR
```

When a human fixes or clarifies a wound during the active mission:

```text
HUMAN_FIX_DETECTED
→ RECONCILE_DELTA
→ RESUME_IMMEDIATELY
```

An oracle response containing `NEXT_READONLY_PROBE` is never completion:

```text
ORACLE_RESPONSE + NEXT_READONLY_PROBE != GOAL_DONE
ORACLE_RESPONSE + NEXT_READONLY_PROBE = CONTINUE_SAME_LOOP
```

The active loop must continue without waiting for a new human Goal:

```text
HERMES_ENVELOPE
→ WAIT_FOR_COMPLETE_CHAT_GLOBAL_RESPONSE
→ CAPTURE_RESPONSE_STATE + EVIDENCE + NEXT_READONLY_PROBE
→ RECONCILE_CURRENT
→ EXECUTE/PROVE_NEXT_READONLY_PROBE
→ NEW_TURN_ID + ATTEMPT_ID + RECEIPT_ID
→ RETURN_TO_CHAT_GLOBAL
→ REPEAT
```

## Micro-Step Trigger Gate / Raph Looping

Treat the CHEFE's loop words and the oracle's cursor words as executable continuation, not as a new task or final answer. This is the Raph/Ralf looping posture: keep the same loop alive, return each material micro-step to `CHAT_GLOBAL` when a usable surface exists, and only stop at a proven fixed point, explicit cancellation, or a true human frontier.

```text
MICROSTEP_ORACLE_GATE=true
RAPH_LOOPING=true
SAME_HERMES_ONLY=true
ASK_CHAT_GLOBAL_EACH_MATERIAL_STEP=true
THREE_TURNS_IS_MINIMUM_PROOF_NOT_LIMIT=true
HUMAN_MICRO_CONFIRMATION_REQUIRED=false
NO_NEW_GOAL_FOR_NEXT_CURSOR=true
```

Trigger on semantically equivalent phrases, including typos, speech-to-text variants, or mixed Portuguese/English:

```text
TRIGGERS=
proximo_cursor|próximo_cursor|proximo curso|próximo curso casual|next cursor|NEXT_CURSOR|
prove|provar|proof|counterproof|contraprova|
reconciliar|reconcilie|reconcile|reconciliation|
restaure|restaurar|restore|replay|retomar|
readonly|read-only|read only|NEXT_READONLY_PROBE|
mesmo loop|same loop|continue same loop|
3 turnos|três turnos|prove tres turno|prove três turno|
nao retornado pro chat|não retornado pro chat|return to oracle|auto return
```

Surface discovery is by capability/name first, not by demanding an already-active input box. A candidate `CHAT_GLOBAL` surface can be classified even when the composer is not active. If a usable input is present, send the micro-step there; if not, mark `SURFACE_NOT_ACTIVE`, preserve the cursor, and continue via the next existing authorized route.

```text
CHAT_GLOBAL_SURFACE_CLASSIFICATION_BY_NAME_AND_CAPABILITY=true
ACTIVE_INPUT_BOX_REQUIRED_FOR_CLASSIFICATION=false
ACTIVE_INPUT_BOX_REQUIRED_ONLY_FOR_SEND=true
SURFACE_NOT_ACTIVE != LOOP_BLOCKED
PREFER_EXISTING_AUTHORIZED_ROUTE=true
```

When triggered:

```text
TRIGGER_MATCH
→ PRESERVE_LOOP_ID + INTENT_ID + PARENT_ID + RECEIPT_ID + NEXT_CURSOR
→ MEASURE_ONLY_THE_TARGET_MATERIAL_TO_THE_CLAIM
→ BUILD_ONE_MATERIAL_MICROSTEP_FOR_CHAT_GLOBAL
→ IF_CHAT_GLOBAL_INPUT_ACTIVE: SEND_AND_WAIT_COMPLETE_RESPONSE
→ IF_NOT_ACTIVE: RECORD_SURFACE_NOT_ACTIVE_AND_CONTINUE_EXISTING_ROUTE
→ EXECUTE_OR_PROVE_ONLY_THE_NEXT_MATERIAL_MICROSTEP
→ CAPTURE_FILE_LINE_ERROR_TYPE_WHEN_AVAILABLE
→ COUNTERPROVE_OR_CLASSIFY_UNKNOWN
→ RETURN_READBACK_TO_CHAT_GLOBAL_WHEN_AVAILABLE_WITH_NEW_TURN_ID
→ REPEAT_SAME_LOOP
```

A material micro-step is a causal boundary, not every shell line. Examples: a new measured error, file/line/type classification, proposed minimal patch, test result, counterproof result, recovery/failover event, `NEXT_CURSOR`, or state transition. Do not spam the oracle with duplicate logs, unchanged output, or the same error fingerprint without information gain.

```text
SAME_ERROR_FINGERPRINT + NO_NEW_EVIDENCE = BACKOFF_OR_PAUSE
MATERIAL_DELTA_REQUIRED_FOR_NEXT_ORACLE_TURN=true
ERROR_REPORT_SHAPE=FILE|LINE|FUNCTION|TYPE|CAUSE|TEST|COUNTERPROOF|NEXT_CURSOR
```

Do not let a stale route-specific transport gap hijack the loop. A disconnected or stale route affects only the claim that depends on that route. It does not block repository work, oracle loop crystallization, local Casa routes, or any other existing authorized capability.

```text
ROUTE_SPECIFIC_GAP_AFFECTS_ONLY_THAT_ROUTE=true
STALE_DEVICE_STATUS_IS_NOT_GLOBAL_RUNTIME_STATE=true
DO_NOT_REPEAT_STALE_TRANSPORT_GAP_TO_HUMAN=true
```

Minimum proof of this gate is three consecutive correlated Hermes↔CHAT_GLOBAL turns without human intervention. This proves the loop; it does not cap the loop.

```text
TURN_1: oracle candidate + NEXT_READONLY_PROBE
TURN_2: Hermes readback + next probe/counterproof
TURN_3: Hermes readback + next cursor/fixed point decision
THEN_CONTINUE_BY_NEXT_CURSOR_WHILE_MATERIAL_WORK_EXISTS=true
```

`Goal done` emitted before the readback returns to the chat, or while a material cursor remains, is `FAIL_PREMATURE_GOAL_DONE`.

## Oracle-First Human Response Routing

Operational responses must be routed through the oracle before reaching the human:

```text
HERMES_ENVELOPE
→ CHAT_GLOBAL/ORACLE
→ ORACLE_RESPONSE
→ HERMES_CAPTURE
→ RECONCILE_CURRENT + EVIDENCE
→ HUMAN_RESPONSE=RECONCILED_ORACLE_RESULT
```

A local probe result is evidence for the next oracle turn, not the final human response and not `GOAL_DONE`. After recovery or probe execution, the controller must automatically return the correlated readback to `CHAT_GLOBAL` with a new turn/attempt/receipt. Confirm `AUTO_RETURN_TO_ORACLE` and `ORACLE_FIRST_HUMAN_ROUTING` on the same `LOOP_ID`.

`UNKNOWN`, `FAIL`, `COUNTERPROOF_REQUIRED`, `NEXT_READONLY_PROBE`, `NO_PROGRESS_RECOVERABLE`, and `SESSION_RECOVERABLE` keep the loop alive. The 10-minute heartbeat is a watchdog/recovery/resume mechanism, not a substitute for an active round. Do not emit `GOAL_DONE` while a probe, counterproof, recovery, or next cursor remains.

```text
GOAL_DONE_ALLOWED_ONLY_IF:
NEXT_CURSOR=FIXED_POINT
AND all applicable gates are proven
AND no recoverable state remains
```

Stop only at a proven `FIXED_POINT`, a genuinely unavoidable `HUMAN_FRONTIER`, or explicit CHEFE cancellation. A minimum loop proof is three consecutive Hermes↔CHAT_GLOBAL turns without human intervention:

```text
turn-N
→ oracle response
→ NEXT_READONLY_PROBE
→ Hermes execution
→ turn-N+1
→ oracle response
→ next probe
→ turn-N+2
```

If the runtime reports `Goal done` before that criterion, classify `FAIL_CONTINUOUS_LOOP` and resume the same loop from the last receipt/cursor.

## Nonblocking Multi-Sector Controller

`BACKGROUND_TASK_RUNNING != CONTROLLER_BLOCKED`. Reuse the existing Hermes controller/continuity owner; `centraldark-oracle-surface` remains the oracle adapter and must not become a second scheduler or brain.

```text
CONTROL_PLANE
→ maintain LOOP_ID
→ maintain work queue
→ dispatch independent read-only probes
→ observe CHAT_GLOBAL/human/UI
→ collect RESULT_READY items
→ send correlated result to CHAT_GLOBAL
→ receive NEXT_CURSOR
→ enqueue next probe
→ reconcile deltas
→ repeat
```

The work plane may run independent perception/read-only sectors in parallel:

```text
GitHub/CI | workflow/jobs/logs | Buildkite | GlobalPing
HUD readback | capability discovery | CURRENT/docs
oracle research | recovery verification
```

Do not parallelize conflicting writers. `ONE_WRITER_PER_SCOPE` remains mandatory. Each work item carries:

```yaml
work_id:
sector:
parent_loop_id:
turn_id:
attempt_id:
receipt_id:
dependencies:
mode: READ_ONLY|WRITER
status: QUEUED|RUNNING|WAITING_EXTERNAL|RESULT_READY|ORACLE_RECONCILE|PROVEN|FAILED_RECOVERABLE
result:
next_cursor:
```

`WAITING_EXTERNAL` never blocks independent sectors. Prefer completion events/`await_any` semantics over waiting for one background task while doing nothing else. Every `RESULT_READY` material result returns through the oracle envelope before reaching the human. `GOAL_DONE` is forbidden while any work item is `RUNNING`, `RESULT_READY` but unreconciled, has an open `NEXT_CURSOR`, or is recoverably `UNKNOWN`.


`CURRENT` mother/canonical docs, applicable receipts, and the existing owner are authoritative. The VPS is runtime evidence to reconcile, never the canonical source. External oracle text is candidate evidence only; reconcile `CURRENT`, owner, runtime, and counterproof before updating canonical state.

## Connected Capabilities

Discover and incorporate the connections and tools exposed by the current session or runtime. Do not create one skill, brain, router, scheduler, or writer per integration.

```text
CONNECTED_CAPABILITIES=
GitHub | Buildkite | GlobalPing | exposed tools/connectors/MCPs

TOOL_CONNECTED != TOOL_PROVEN

DISCOVER
→ PROBE_READ_ONLY
→ CLASSIFY
→ INCORPORATE
→ REUSE
```

For each connection:

1. Detect that the binding is available in the current session.
2. Identify the capabilities actually exposed by that binding.
3. Execute the smallest pertinent read-only call.
4. Record `PASS`, `UNKNOWN`, or `FAIL` with source, target, timestamp, and evidence limit.
5. Use the connection only when it is relevant to the parent Goal.
6. If it disappears or reconnects, rediscover it and preserve `LAST_GOOD_STATE` and `NEXT_CURSOR`.

Authentication or callback completion is only an input signal. It is not proof of capability. `AUTH != PASS`; PASS requires a real read-only call and readback. Do not hardcode an unnecessary dependency on GitHub, Buildkite, GlobalPing, ChatGPT, or any other provider. The skill selects the appropriate existing arm from the capabilities actually exposed.

Capability-specific use is conditional:

- **GlobalPing:** use for heartbeat, liveness, reachability, and latency when the binding is available and the target is in scope. Record the observed target and measurement boundary; provider timing is not inferred from UI timing.
- **Buildkite:** use to observe pipelines, builds, checks, and logs only when those read-only capabilities are actually exposed and authorized.
- **GitHub:** use only for the repository, pull request, Actions, checks, and readback capabilities actually proven in the current session.
- **Other connectors/MCPs:** inventory and probe them by the same contract; never promote a listing or connection badge to execution proof.

A missing, revoked, or unavailable connection is `UNKNOWN`, not a reason to create a parallel integration. Reuse the same `centraldark-oracle-surface` loop and existing writer after the connection returns.

## Inbound Canonical Trigger Gate

The canonical prefix is executable control flow, not decorative text and not only a correlation envelope:

```text
INBOUND_CANONICAL_TRIGGER_GATE=true
CANONICAL_PREFIX_IS_NOT_DECORATIVE=true
CANONICAL_PREFIX_IS_NOT_ONLY_CORRELATION_ENVELOPE=true
INBOUND_ORACLE_REQUEST_MUST_ENTER_TRIGGER_FABRIC=true
```

On receiving the canonical trigger plus a Hermes envelope:

```text
!CENTRALDARK #ACORDAR !CALIBRAR !MULTIBUSSOLA
+ ACTOR=HERMES
→ ACTIVATE_MASTER_SESSION
→ MEASURE_MAIN_CURRENT
→ LOAD_MASTER_CYCLE + CONTRACT + PERTINENT_OWNER
→ RECONCILE_PARENT_RECEIPT + NEXT_CURSOR
→ REUSE_UNCHANGED_PROOF
→ VERIFY_NEW_EVIDENCE
→ COUNTERPROVE
→ RETURN_MINIMUM_DELTA + NEXT_READONLY_PROBE/NEXT_CURSOR
```

`!ACORDAR`, `!CALIBRAR`, and `!MULTIBUSSOLA` are phases of the existing master funnel. Do not answer merely because the prefix was parsed; execute the applicable trigger contract first. `NEW_MATERIAL_RESTARTS_MISSION=false` remains in force.


When the CHEFE sends a message in the established CentralDark format, interpret it as continuation of the active Goal, not as a new finite task:

```text
!CENTRALDARK — CONTINUE_EXISTING_GOAL

CURRENT_STATE=MEASURE_NOW
DO_NOT_REPROVE_ESTABLISHED_IDENTITY=true
QUERY_CURRENT_SITUATION=true
PRESERVE_LAST_GOOD_STATE=true
CONTINUE_SAME_LOOP=true
RESOLVE_ALL_PROVEN_ERRORS=true
EVOLVE_CENTRALDARK_EXISTING_ONLY=true
COMMIT_CANONICAL_DELTA=true
```

Continuation behavior:

```text
read current state
→ consult CHAT_GLOBAL/oracle in the same format
→ reconcile CURRENT/runtime/receipts
→ skip already-proven identity and connectivity checks
→ select the next unresolved error or capability
→ execute the smallest safe correction
→ test and counterprove
→ commit/push the canonical CentralDark delta when authorized
→ return the readback to the oracle
→ continue the same Goal
```

Do not stop after confirming that Hermes Desktop, Gateway, SSH, or the model exists. Those are established identity facts unless a new contradiction appears. The active objective is persistence, continuous loop, canonical commit/receipt, error resolution, and incremental CentralDark evolution.

A continuation message must inherit `LOOP_ID`, `PARENT_ID`, `LAST_GOOD_STATE`, `NEXT_CURSOR`, and the current unresolved-error set. It must not restart discovery from zero or ask the CHEFE to issue a new Goal for routine next probes.

## Canonical Integration and Loop Health

`perception-orchestra.mjs` is the existing perception owner. This skill is a subordinated surface capability, not a brain or dispatcher. Reuse `scripts/trigger-fabric/oracle_evidence_hook.py` for oracle query construction and evidence envelopes; do not create a second hook. The canonical path is:

```text
centraldark-oracle-surface
→ oracle_evidence_hook.py
→ perception-orchestra.mjs
→ rendezvous + dedupe + counterproof
→ existing writer
→ Reality Judge
→ receipt
→ NEXT_CURSOR
```

Use the capability bus by measured toolset, not by brand. ChatGPT, Gemini, Claude, Grok, and similar products are `CHAT_GLOBAL` implementations when their exposed tools and surface behavior support that class; the brand alone proves nothing.

An oracle must never claim repository, CURRENT, runtime, GitHub, Buildkite, or VPS access merely because Hermes included facts in a prompt. For every claimed external read, require a tool binding, the exact read-only call, target/path, and readback. If the oracle surface cannot invoke the repository/tool binding itself, mark the claim `EVIDENCE_LIMIT=ORACLE_NO_DIRECT_TOOL_ACCESS`; Hermes remains the executor that performs the read and returns sanitized evidence for reconciliation.

```text
ORACLE_TOOL_ACCESS_DECLARED != ORACLE_TOOL_ACCESS_PROVEN
REPO_READ_CLAIM
→ TOOL_BINDING_OBSERVED
→ READ_ONLY_CALL_EXECUTED
→ TARGET_READBACK
→ PROVENANCE_CORRELATED
```

The oracle may request a tool probe, but only Hermes or the existing authorized tool owner executes it. Never promote an oracle's statement that it "looked at the repo" without a correlated tool receipt.

## Canonical-First Query, Recovery, Learning and Replay

For a material self-improvement or tooling question, consult the same `CHAT_GLOBAL` surface instead of creating a new research path. Start every request with the canonical boot prefix and a complete correlation envelope, then ask for a candidate procedure and, when useful, public web research:

```text
!CENTRALDARK #ACORDAR !CALIBRAR !MULTIBUSSOLA
ACTOR=HERMES
LOOP_ID=<stable loop>
TURN_ID=<turn>
ATTEMPT_ID=<attempt>
RECEIPT_ID=<receipt>
PARENT_ID=<parent>
INTENT_ID=<intent>
EVENT_ID=<event>
CAUSATION_ID=<cause>
SURFACE_ID=<surface>
NEXT_CURSOR=<cursor>

QUESTION=<specific operational question>
RESEARCH_REQUEST=public_sources_when_available
RESPONSE_SCHEMA=CANDIDATE_CLAIM,SOURCES,PROCEDURE,EVIDENCE_LIMIT,COUNTERPROOF,NEXT_READONLY_PROBE
```

When the question concerns Hermes Desktop or surface automation, explicitly request guidance for: scrolling up/down only when needed; detecting new messages; refreshing and re-snapshotting without rereading proven context; stale-element recovery; incomplete/frozen response detection; retry and same-tab new-chat failover; minimal handoff with `LAST_GOOD_STATE`/`NEXT_CURSOR`; connector/tool discovery; and separating connection, research, and execution proof.

Read the entire relevant response cone. If the page indicates research, loading, or an incomplete response, do not capture it as final: reread after the response-complete state is observed. Use `drive_preview action=scroll` upward/downward when context boundaries or new messages require it, and use `desktop_preview action=read` for the actual text. Public URLs are candidate sources; reconcile them with CURRENT/owners and run the smallest counterproof before absorbing a method into this skill.

Normal reading posture is the newest stable boundary at the bottom. Scroll upward only when a causal dependency, human delta, provenance, or missing context is not in the persisted state; return to the last known boundary afterward. Detect new messages with a stable message/fingerprint boundary and consume only the append, not the whole conversation. A response is `IN_PROGRESS` while generation is active, text is still changing, a stop control is present, or the expected terminal boundary is absent. Mark `COMPLETE` only after a terminal state and stable content are observed; temporary silence is not completion.

Only persist the minimum surviving method after:

```text
CONSULT
→ CAPTURE COMPLETE RESPONSE
→ EXTRACT SOURCES + PROCEDURE
→ RECONCILE CURRENT/OWNER
→ COUNTERPROVE
→ REPLAY ONCE
→ PATCH THIS SAME SKILL
```

A research answer, an authenticated callback, or a visible browser control is not execution proof. If the oracle cannot complete the research response, preserve the last good cursor and classify the attempt `RESPONSE_INCOMPLETE` rather than inventing the missing method.

Before a material decision, perform canonical-first reconciliation against the live `main`/CURRENT, applicable owners, docs, learnings, and receipts. Compare `CURRENT main` with the VPS runtime whenever the conclusion depends on runtime state. Oracle output remains `CANDIDATE` until local evidence, owner, counterproof, and Reality Judge rendezvous succeed.

Classify failures independently:

```text
TRANSPORT | UI | SESSION | TOOL | CI | RUNTIME | PRODUCT
```

One class must not be promoted to another without evidence. Dedupe red checks by causal fingerprint: many checks with one root cause are one wound and one mission, not many repair loops. Perception may run in parallel; mutation is serialized through one writer per scope.

Use the integration stage machine and declare only the measured stage:

```text
DECLARED → DISCOVERED → CONFIGURED → HEALTHY → EXECUTED → RECEIPT
```

`CONNECTED != HEALTHY != EXECUTED`. A listing, callback, badge, or successful authentication cannot advance the stage without a real read-only call and readback.

Track loop observability per attempt:

```yaml
round_number:
duration_ms:
retry_count:
recovery_used:
selected_tool:
discarded_cause:
surviving_cause:
progress_fingerprint:
conversation_fingerprint:
```

Require progress in at least one of evidence, hypothesis, state, or cursor. Otherwise classify `NO_PROGRESS` and stop blind retries. Detect conversation changes by fingerprint and reconstruct continuity from the envelope, not from UI assumptions. Reread only the relevant cone when the fingerprint is unchanged; use `REPLAY_BEFORE_REDISCOVERY=true`.

Apply these invariants:

- **Human-in-the-loop:** an un-enveloped human message is a new delta or override, not an oracle response; refresh/read back before material mutation.
- **Adaptive binding:** choose a sufficient fast binding for simple work and a stronger reasoning/effort binding for counterproof-heavy work without changing the parent mission.
- **Hot-plug/hot-unplug:** rediscover capabilities when tools appear or disappear; do not restart the Goal.
- **Idempotency:** replay after crash must not duplicate comments, commits, deploys, or mutations; persist the last `FIXED_POINT`/`PARTIAL_POINT` and `NEXT_CURSOR`.
- **Artifact isolation:** artifact, upload, and quota failures remain separate from functional CI failures.
- **CI feedback:** `commit → checks → first causal failure → owner correction → checks`; do not wait for unrelated red jobs when a safe micro-deploy is permitted.
- **Runtime proof:** `PATCHED != ROOT_CAUSE_FIXED`; after deployment, read back effect, deployed SHA, runtime SHA, and health from the real owner.

A new path becomes reusable only after:

```text
PROVEN_NEW_PATH
→ MINIMUM_LEARNING
→ REPLAY
→ COMPARE
→ REUSABLE_RECIPE or SINGLE_RUN_PROOF
```

Pending learning never becomes memory or canonical state merely because Hermes or the oracle said it. Require provenance, CURRENT match, owner match, dedupe, counterproof, reality evidence, writer, and readback.

## Surface Mapping and Recovery

```text
STALE_DOM_REF_REDISCOVERY=true
FULL_CHAT_TRAVERSAL_BEFORE_REASONING=true
PROVEN_ORACLE_IMPROVEMENT → EVOLVE_EXISTING_CENTRALDARK_ORACLE_SURFACE
```

A stale/unknown ref is a recoverable binding failure, never terminal: preserve `LOOP_ID`, `RECEIPT_ID`, `LAST_GOOD_STATE`, and `NEXT_CURSOR`; call `drive_preview action=elements`; remap by semantic label/role; then retry only the interrupted idempotent interaction. Never guess a selector or reuse the stale ref.

For a material decision that depends on conversation history not already preserved as evidence, traverse the current chat before reasoning: acquire elements, capture the current view, scroll to top, read visible blocks, scroll downward in bounded steps, read each new block, dedupe already-read text, and return to the bottom. Record `FIRST_VISIBLE_MESSAGE`, `LAST_VISIBLE_MESSAGE`, `SCROLL_TOP_REACHED`, `SCROLL_BOTTOM_REACHED`, `UNREAD_GAPS`, `DUPLICATES_DROPPED`, and `CONVERSATION_COVERAGE=COMPLETE|PARTIAL`. Virtualized or unavailable content makes coverage `PARTIAL`; never claim full-history reading without both boundaries and zero gaps.

Map the whole relevant page when the answer, conversation boundary, or control state is material. Use `drive_preview action=scroll` in both directions, `desktop_preview action=read`, and a fresh `drive_preview action=elements` after navigation, refresh, or a stale reference. Re-read only the affected cone after a proven snapshot; `REPLAY_BEFORE_REDISCOVERY=true`.

Promote a new Oracle/UI practice into this same skill only after real-use proof, counterproof, a replay, and a generalizability check. Keep a one-off observation in its receipt; do not create a sibling Oracle skill.

Recover these states without restarting the mission:

```text
CONNECTION_INTERRUPTED | RESPONSE_PENDING | RESPONSE_FROZEN
STALE_ELEMENT_REMOVED | TIMEOUT | CONVERSATION_LIMIT
PREVIEW_STUCK
```

On any such state:

1. Preserve `LAST_GOOD_STATE`, `LOOP_ID`, `RECEIPT_ID`, and `NEXT_CURSOR`.
2. Read the current surface and inventory elements again.
3. Retry the same conversation once through the cheapest surviving route.
4. If still broken, refresh/reopen the same surface and re-submit a minimum handoff, never the full private history.
5. If the same tab remains unusable, open a new conversation in that tab with `PARENT_ID`, `previous_surface_id`, `last_proven_context_fingerprint`, and the reason for failover.
6. Reconcile the result with CURRENT before any action; do not silently switch tabs or targets.

`element removed from page since last snapshot` is a recoverable binding error: re-snapshot, find the equivalent ref by label/role, and continue. Do not blind-retry unchanged inputs after the same failure with no new information.

Use this recovery ladder, preserving the same loop:

```text
REREAD
→ REACQUIRE_ELEMENTS
→ ONE_IDEMPOTENT_RETRY
→ REFRESH
→ REREAD_CONVERSATION
→ SAME_CHAT
→ NEW_CHAT_SAME_TAB_WITH_MINIMAL_HANDOFF
→ ONLY_THEN_NEW_TAB/SESSION
```

Before refresh, persist the conversation fingerprint, last message boundary, known receipt, `LAST_GOOD_STATE`, and `NEXT_CURSOR`. After refresh or failover, verify the fingerprint and boundary before sending. If they diverge, classify `CONVERSATION_CHANGED` and reconcile; never silently continue on a new conversation.

Record per round:

```yaml
attempt_id:
loop_id:
turn_id:
receipt_id:
parent_id:
surface_id:
model_binding:
input_mode:
submit_observed_at:
first_visible_response_observed_at:
response_complete_observed_at:
elapsed_to_first_visible_ms:
elapsed_to_complete_ms:
response_state:
error_state:
last_good_state:
next_cursor:
```

Use an existing ping/heartbeat API only when its binding is available. A successful authorization or visible control is not a liveness proof; execute the ping and read back its result. If no ping binding exists, record `HEARTBEAT=UNKNOWN` rather than inventing one.

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

Runtime counterproof + Hermes Desktop source establish the real split:

```text
"abra/navegue/vá para" = reuse/navigate the current Browser tab
"abra NOVA ABA/novo tab" = preserve the current Browser tab and create another Browser tab
NAVIGATE_CURRENT_TAB != OPEN_NEW_PREVIEW_TAB
```

Current implementation:

```text
desktop_preview action=open + URL
→ preview.open {url,label}
→ openPreview(target.kind=url)
→ browserTabFor(visible)
→ reuses active/last Browser tab

Preview strip "+"
→ newBrowserTab()
→ mints another url:browser-* tab id
→ preserves previous Browser tab
```

Current `desktop_preview` schema exposes only `open|close|read`; there is no `new_tab` action for the agent.

```text
LABEL_IS_NOT_NEW_TAB_SIGNAL=true
DESKTOP_PREVIEW_OPEN_DOES_NOT_PROVE_NEW_BROWSER_TAB=true
NEW_TAB_REQUEST_PRESERVES_CURRENT=INTENT
AGENT_NEW_BROWSER_TAB_TOOL_ACTION=UNEXPOSED
NEW_BROWSER_TAB_E2E=UNKNOWN
```

Do not claim a second Browser tab from `open + label`. PASS requires triggering the same creation path as the Preview strip `+` (or an equivalent authorized binding) and readback proving at least two Browser tabs remain present. Do not depend on a site's `target="_blank"` or `window.open()`.

## Proven Pilot

The proven pilot opened `https://chatgpt.com/` in the internal Preview, created an isolated chat, sent a sanitized oracle query with all four IDs, and captured a structured response containing `CANDIDATE_CLAIM`, `EVIDENCE_LIMIT`, `COUNTERPROOF` and `NEXT_READONLY_PROBE`. A second current-tab runtime probe sent `ORACLE_RUNTIME_PROOF` with `INTENT_ID`, `EVENT_ID`, `CAUSATION_ID` and `SURFACE_ID`; the response returned `RESPONSE_STATE=COMPLETE` and the requested candidate/limit/counterproof fields. This proves surface transport and response capture only; it does not prove canonical-envelope integration, writer mutation, deployment or runtime effect.

A replay was then executed in the same current ChatGPT Preview tab using the same capability and a new event/causation pair. The replay returned `RESPONSE_STATE=COMPLETE`, the same `CAPABILITY=CHATGPT_PREVIEW_CURRENT_TAB_RESPONSE_CAPTURE`, `REPLAY_MARKER=oracle-runtime-002`, the same interface-only evidence limit and the same counterproof boundary. Therefore the reusable recipe is proven only for current-tab transport and response capture; it is not proof of provider latency, canonical-envelope integration, writer mutation, deployment or runtime effect.

```text
PROVEN_NEW_PATH
→ CRYSTALLIZE_MINIMUM_LEARNING
→ STORE_PROVENANCE
→ REPLAY_ONCE
→ COMPARE
→ IF_EQUIVALENT: PROMOTE_TO_REUSABLE_RECIPE
ELSE: KEEP_AS_SINGLE_RUN_PROOF
```

`ONE_SUCCESS != REPLAYABLE_RECIPE`.

## Memory-Pending Gate

Never surface a raw `/memory pending` state directly as an operational message to the CHEFE. Route it through the existing oracle/reconciliation path:

```text
MEMORY_PENDING
→ consult current CHAT_GLOBAL oracle
→ await response
→ reconcile with live intent + CURRENT/docs + owner + reality
→ auto-promote only when alignment is proven
→ otherwise keep PENDING/UNKNOWN and do not mutate
```

The oracle response remains a candidate. Safe automatic promotion requires matching intent/owner/scope, no contradiction with CURRENT/docs, provenance and evidence fields, a counterproof, and an existing writer. A mismatch, missing proof, stale CURRENT, or unknown owner blocks promotion. Do not create a second memory engine or send raw pending state to the user.

Minimum receipt fields: `intent_id`, `event_id`, `causation_id`, `surface_id`, `candidate_hash`, `current_ref`, `owner`, `alignment_verdict`, `counterproof`, `writer`, `promotion_state`, `next_cursor`.


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

## Domain / Turn Skill Evolution

CENTRALDARK_GOJO_DOMAIN_SKILL_EVOLUTION_FABRIC=true

SIX_EYES = inventory USED_SKILLS + USED_TOOLS + OWNERS + evidence + failures + NEXT_CURSOR.
INFINITY = oracle/runtime output cannot mutate canonical state directly; classify PASS, DEGRADED, UNKNOWN, FAIL or BLOCKED.
BLUE = pull only evidence with causal gravity to the parent intent: CURRENT docs, owner, PR/commit, receipt, runtime, logs and used skills.
RED = reject duplicate owners, stale history, false-green, unsupported inference, parallel architecture and irrelevant evidence.
PURPLE = reconcile surviving evidence into the smallest owner-local candidate delta.
RCT = convert a proven failure into test + receipt + reusable skill improvement.
DOMAIN = keep participating skills on the same LOOP_ID, TURN_ID, PARENT_ID, OWNER_SCOPE, EVIDENCE_LIMIT and NEXT_CURSOR until parent FIXED_POINT.

Every materially used skill leaves one state:
UNCHANGED_PROVEN | PATCH_CANDIDATE | PATCH_APPLIED | TEST_ADDED | RECEIPT_ADDED | DEGRADED | BLOCKED.

A used skill does not need a rewrite merely because it was loaded. Evolve only after measurement, generalizability, Oracle candidate review, owner-local patch, test, counterproof, receipt and replay.
ONE_TURN_OBSERVATION != REUSABLE_SKILL_DELTA.

## Anti-Dumb-Loop Recipe Promotion (Ralph-style bounded iteration)

This skill must not keep Hermes in an endless identical retry loop. Ralph-style goal iteration is useful only while each turn produces material information gain, a new state, a new hypothesis, a changed cursor, or a proven effect. The existing Goal, owner, writer and continuity chain remain unchanged.

```text
RALPH_STYLE_BOUNDED_RECIPE_LOOP=true
BLIND_RETRY_FORBIDDEN=true
NO_PROGRESS_REQUIRES_RECIPE_OR_EXACT_BLOCKER=true
ONE_IDENTICAL_REPLAY_MAX=1
SAME_FAILURE_FINGERPRINT_REUSES_PROVEN_RECIPE=true
SKILL_EVOLVES_ONLY_ON_GENERALIZABLE_PROVEN_DELTA=true
MAIN_FIRST_SKILL_PROMOTION=true
RUNTIME_SYNC_OWNER=skill-synchronization+scripts/skill-sync-check.sh
```

At every material turn, build a progress fingerprint from the current intent, owner scope, failure signature, source/runtime refs, evidence digest and `NEXT_CURSOR`. If evidence, hypothesis, state or cursor changed, continue the normal loop. If the same fingerprint returns the same outcome again without new information, stop the identical probe instead of consuming more turns.

```text
TURN_RESULT
→ PROGRESS_FINGERPRINT
→ INFORMATION_GAIN?
   YES → CONTINUE_NORMAL_GOAL
   NO  → STOP_IDENTICAL_RETRY
       → LOAD_EXISTING_PROVEN_RECIPE_IF_MATCH
       → ELSE DERIVE_MINIMUM_RECIPE_FROM_SURVIVING_PATH
       → REPLAY_ONCE
       → COUNTERPROVE
       → RESUME_NEXT_CURSOR
```

A generated Hermes recipe is machine-consumable evidence, not a second scheduler or owner. Minimum shape:

```yaml
recipe_id:
intent_id:
loop_id:
owner:
writer:
trigger_fingerprint:
preconditions:
source_ref:
runtime_ref:
exact_sequence:
expected_evidence:
counterproof:
rewind_or_rollback:
success_predicate:
next_cursor:
proof_refs:
```

Recipe promotion rules:

1. If a matching proven recipe already exists, reuse it and adapt environment bindings only. Do not reinterpret the path from zero.
2. If there is no recipe, derive the minimum deterministic recipe from the path that survived measurement and counterproof.
3. Replay the new recipe once on the affected cone. One identical replay is the maximum unless new material evidence changes the fingerprint.
4. If replay proves a **generalizable** missing rule in a CentralDark-owned skill, patch that **same skill** on `main`; do not create a sister skill, V2/V3, router, scheduler or brain.
5. The skill patch must include the smallest discriminating test or contract assertion, a receipt, and counterproof. Incident-only data stays in the receipt/runtime state and must not bloat the skill.
6. After the canonical commit, use the existing `skill-synchronization` owner: `--check → --apply → --seal`. Independent runtime drift is preserved and reconciled; it is never overwritten blindly.
7. A skill commit or sync is not Goal completion. Hermes returns to the **same Goal/LOOP_ID** at the next unresolved cursor.
8. If the same failure remains after the bounded replay, choose a different authorized route or emit the exact non-recoverable blocker. Never spin indefinitely.

```text
NO_PROGRESS
→ RECIPE_NOT_RETRY
→ PROVE_RECIPE
→ GENERALIZABLE_DELTA?
   YES → PATCH_SAME_SKILL_ON_MAIN + TEST + RECEIPT
   NO  → KEEP_SKILL_UNCHANGED
→ SYNC_WITH_EXISTING_OWNER
→ RETURN_TO_SAME_GOAL
→ NEXT_CURSOR
```

This is the CentralDark adaptation of the useful Ralph-loop idea: **persistent goal, bounded identical retries, explicit progress, crystallized replay recipe**. It does not add a Ralph engine or replace Hermes' native Goal/Kanban/continuity owners.

## CHEFE Intent Calibration and Autonomous Memory Promotion

CHEFE_INTENT_CALIBRATION_GATE=true
CHEFE_ALIGNMENT_SCORE_MAX=99.9

Evidence weights:
CURRENT_EXPLICIT_CHEFE_INTENT=0..30
CURRENT_DOCS_MATCH=0..30
REPEATED_INTENT_HISTORY=0..15
OWNER_SCOPE_MATCH=0..10
RECEIPT_RUNTIME_EVIDENCE=0..10
DEDUPE_CANONICALITY=0..5

Decision:
score >= 99.0 plus CURRENT_MATCH, OWNER_SCOPE_MATCH, DEDUPE=PASS, no contradiction, proven writer, no secret risk and no sensitive-personal-data risk
→ AUTO_PROMOTE_MINIMUM_MEMORY_DELTA → READBACK → RECEIPT → CLEAR_ONLY_ABSORBED_PENDING_ITEMS.

95.0 <= score < 99.0
→ CONSULT_ORACLE → REMEASURE MAIN + VPS/RUNTIME when material + CURRENT DOCS → RECALIBRATE.

90.0 <= score < 95.0 → KEEP_PENDING.
score < 90.0 → HOLD_OR_REJECT.

99.9 is not certainty by assertion. It requires convergent current evidence: explicit recent CHEFE intent + CURRENT docs + repeated compatible behavior + correct owner + no contradiction. Secrets, credentials, sensitive personal data, destructive authority changes or exceptional permissions keep their dedicated gates. Semantic duplicates are clustered before promotion so one canonical memory replaces many paraphrases.

## Main ↔ Runtime Autonomous Skill Auto-Sync Lock

Canonical skill source is ServerVpss/CentralDark@main under .agents/skills/**/SKILL.md.
Hermes runtime mirrors live under ~/.hermes/skills/<same-relative-path>/SKILL.md.

Opt-in metadata:
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true

The existing owner is skill-synchronization + scripts/skill-sync-check.sh. Do not create another scheduler or sync engine.

SKILL_CHANGE
→ ORACLE_REVIEW_ON_CHANGE
→ RECONCILE CHEFE INTENT + CURRENT MAIN + DOCS + OWNER + LIVE RUNTIME
→ TEST + COUNTERPROOF
→ COMMIT CANONICAL MAIN
→ AUTO_SYNC MAIN TO HERMES RUNTIME
→ HASH READBACK
→ SEAL MAIN_SHA + CANONICAL_HASH + RUNTIME_HASH.

No-op syncs need no new Oracle turn. A material skill mutation does.

If runtime still equals the last sealed canonical hash, main may fast-forward it. Independent runtime drift is never overwritten: emit ORACLE_REQUIRED_RUNTIME_DRIFT, preserve the live file, reconcile it against CURRENT main/docs, promote only the surviving minimum delta canonically, then mirror again.

After successful sync:
MAIN_SKILL_SOURCE_HEAD == SEALED_RUNTIME_SOURCE_HEAD
CANONICAL_SKILL_HASH == RUNTIME_SKILL_HASH

The seal is provenance, not execution proof. SYNCED != EXECUTED.


## Goal-Clause META-GRILL / Deep Context Continuity (2026-10-08)

The CHEFE's current intent, not the model, owns the Goal. Before a material answer or action, use the **existing** `meta-lupa/KITS/METAGRILL-METALUPA/META-GRILL/GANCHO.md` as a criterion self-interview grounded in pertinent CURRENT `docs/CONSCIENCIA`, `docs/BRAIN`, SOUL/RULES/AGENTS and receipts. Do not pretend the model is literally the human or fabricate human instructions. Summarize testable conclusions, not private hidden reasoning.

```text
CHEFE_INTENT → CURRENT → META_GRILL → GOAL_CLAUSES → GREEN_STATE
→ REPLAY_PROVEN_RECIPE → OWNER_MAP → HERMES_PERCEPTION
→ OPTIONAL_ORACLE_DEEP_RESEARCH → EXISTING_WRITER
→ EFFECT → REALITY_JUDGE + COUNTERPROOF_SENSOR
→ CLAUSE_EVALUATOR → FIXED_POINT_OR_NEXT_CURSOR
→ RECEIPT + CONTEXT_CAPSULE + EXISTING_HUD_PROJECTION
```

`GOAL_CLAUSE_EVALUATOR_OWNER=scripts/lupa/horn-reuse-fixed-point.mjs`. Required clauses are never PASS without valid positive proof, counterproof, owner, measurement time and source provenance. `FIXED_POINT` additionally requires a receipt and terminal cursor. The same `intent_id + goal_fingerprint + clause_ids` must be used by execution, PR acceptance and Obsidian HUD; a PR or green badge does not certify runtime.

### Operational deep context capsule (not model KV cache)

Reuse Hermes' **existing** continuity/memory owner. Before `/compact`, `/compress`, `/clean`, capture a sanitized capsule only if the native hook actually supports it; after recovery rehydrate the minimum context and revalidate CURRENT. Capsule: `schema_version,loop_id,parent_id,intent_id,goal_fingerprint,chefe_intent_summary,current_main_sha,runtime_ref,owner_map,used_skills,used_tools,clause_states,evidence_refs,decision_summary,unknowns,failures,oracle_candidates,counterproof_refs,receipts,next_cursor,observed_at_utc,expires_at_utc,rehydration_summary`. No raw secrets, personal/private notes, browser cookies or hidden chain of thought. `CACHE_HIT != PASS`; provider prompt caching and internal KV tensors are distinct from this evidence capsule. Never claim cache efficiency without measured usage.

### Oracle / deep research selection

`CHAT_GLOBAL`, optional Deep Research, Context7 and Globalping are **capabilities**, not authorities or guaranteed API endpoints. Use Deep Research only for material uncertainty with expected information gain; avoid repeating a cached proven result. `MCP_ON != MCP_USED != EFFECT_PROVEN`. Oracle candidates must be correlated to `LOOP_ID`, `TURN_ID`, `INTENT_ID`, `PARENT_ID` and read back through Hermes. Preserve owner-local mutation, single writer, counterproof and independent runtime verification. ChatGPT subscription quota is not an API budget. The `@` UI is not an automation contract until a supported bridge is proven.

### Domain skill states and sync

`SIX_EYES/INFINITY/BLUE/RED/PURPLE/RCT/DOMAIN` are roles **inside this skill**, not new agents. Every used skill is classified `UNCHANGED_PROVEN|PATCH_CANDIDATE|PATCH_APPLIED|TEST_ADDED|RECEIPT_ADDED|DEGRADED|BLOCKED`. Never rewrite a skill merely because it was loaded. `skill-synchronization` + `scripts/skill-sync-check.sh` remain the sole main→Hermes skill sync owner; independent runtime drift must be preserved for Oracle reconciliation before `--apply`/`--seal`. Sync hash is not proof of execution.

### Receipt / HUD / PR equality

The canonical architecture and G01..G12 acceptance clauses live in `docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md` section 21. The existing HUD (`docs/HUD/HUD.html`) and Obsidian Grafo Vivo plugin may **project** these receipts; they do not write them. Show `UNKNOWN` for unmeasured Windows/Hermes/CHAT_GLOBAL E2E. Clock: UTC ISO provenance and `America/Bahia` presentation via the existing `central-horario` owner. A direct-main architecture commit and a separate E2E-proof PR may coexist; never open a duplicate implementation PR or call a draft receipt `FIXED_POINT`.


## Browser Oracle Completeness Gate — Nous Native Tools (2026-10-08)

**Owner:** this existing `centraldark-oracle-surface` skill, using Hermes' own supported tools and GoalManager. No second agent, browser bridge, router, scheduler, memory or writer. **Oracle output remains candidate evidence.** The previous Preview recipes, browser policy, Ralph bounded iteration, capsule and all other contracts above remain valid.

### Native-capability-first selection

For a Hermes session where the official Nous `browser` toolset is actually available, prefer:

```text
browser_navigate (only if a navigation is required and authorized)
→ browser_snapshot full=true (structured accessible blocks/controls)
→ browser_scroll direction=up|down (bounded, only if needed)
→ browser_snapshot full=true (readback)
→ browser_vision (when semantics/visible evidence remain ambiguous)
→ browser_console (diagnostic aid only, not a transcript)
```

The official `browser_snapshot` may report only the accessible/loaded DOM; **`full=true` does not guarantee every virtualized/historical message is loaded**. Browser tool availability is runtime- and session-specific; do not pretend `desktop_preview` automatically has all `browser_*` actions. If Hermes Desktop Preview exposes only `drive_preview`/`desktop_preview`, keep the previously documented current-tab bounded capture path and record `NATIVE_BROWSER_TOOL=UNAVAILABLE`; do not invent `new_tab` or transcript export methods. Never bypass CSP/CORS or use another account to evade provider controls.

### Read before click: hypotheses are not UI facts

```text
HYPOTHESIS(control)
→ FRESH_SNAPSHOT / ELEMENT_ROLE / ACCESSIBLE_NAME / STATE
→ CHOOSE_SUPPORTED_ACTION
→ ACTION
→ FRESH_READBACK
→ DISCRIMINATING_EVIDENCE
```

An ellipsis, arrow, pulse or loading icon has no universal semantic meaning. A `...` icon is **not automatically scroll-to-bottom**, and an arrow is **not automatically send/scroll**. If role/ref/state cannot be established, do not click; capture/inspect with the available supported tool or mark `CONTROL_SEMANTICS=UNKNOWN`.

### Response state machine, causal capture and stopping condition

Separate **response streaming** from **message viewport coverage**:

```text
RESPONSE_STATE = NOT_STARTED | STREAMING | QUIESCENT_UNVERIFIED | COMPLETE | INCOMPLETE | ERROR
COVERAGE       = UNMEASURED | PARTIAL | COMPLETE
CAPTURE        = {loop_id,turn_id,surface_id,attempt_id,parent_id,
                  conversation_ref,first_seen_id,last_seen_id,
                  bottom_reached,top_reached,gaps,duplicates_dropped,
                  response_state,coverage,observed_at,evidence_ref}
```

- `STREAMING`: token/content still changing or an actual generation-in-progress signal exists. Never treat visible text as final.
- `QUIESCENT_UNVERIFIED`: text paused but no distinct terminal/completed generation signal. **Silence or unchanged screenshots alone are insufficient**.
- `COMPLETE`: generation terminal state independently observed **and** final assistant response is associated with the requested `TURN_ID`/`SURFACE_ID`; content boundary/readback stable. If terminal state is inaccessible, retain `QUIESCENT_UNVERIFIED`/`UNKNOWN`, not false COMPLETE.
- `COVERAGE=COMPLETE`: causally relevant message range was visited/read/ordered/deduplicated, both boundaries confirmed and zero unread virtualized gaps. `RESPONSE_STATE=COMPLETE` may coexist with `COVERAGE=PARTIAL`: these are independent dimensions.
- Capture one or more bounded `scroll → snapshot` iterations; each step records new identifiers/blocks and checks actual information gain, not only a scroll coordinate. If the page virtualizes earlier text or no stable unique IDs exist, preserve `COVERAGE=PARTIAL` and emit missing spans.
- Console errors help locate resource/CSP failures but are not automatically oracle transport failures; a successful text capture requires causal text and provenance, not merely a console log.

### Bounded loop, errors and evidence

Use `error_fingerprint = class + source + location(if measured) + causal evidence id`. Prefer compiler/test/stack evidence for `file:line`; the browser snapshot alone cannot certify code line numbers. No-progress retries are budgeted and paused/backed off, preserving capsule and `NEXT_CURSOR`; never spin on screenshot/scroll or retry the same click indefinitely.

For each material turn record `BEGIN/FINAL`, full correlation envelope, `RESPONSE_STATE`, `COVERAGE`, `CONTROL_SEMANTICS`, `EVIDENCE_REF`, the source/age and `NEXT_CURSOR`. A `COMPLETE` UI response is **not** proof of the answer's factual correctness: execution effects still go through the existing owner, Reality Judge and independent counterproof. No production PASS from this documentation alone.

### Regression and external success evidence

Required probes before declaring full runtime integration: streaming partial text; delayed chunks; quiescent-not-terminal; terminal-with-viewport-gaps; virtualized top; scroll UP/DOWN; ambiguous ellipsis; wrong send-arrow; multiple concurrent surfaces/turn IDs; duplicate or out-of-order blocks; reconnection; bounded no-progress; provider browser vs Desktop Preview capability difference; and three independently correlated Hermes→Oracle→Hermes cycles.

Official upstream references (source links, not runtime proof):
- `https://hermes-agent.nousresearch.com/docs/user-stories` — public community stories, qualitative use cases and reported deployments; **not** a verified 99–100% completion-rate benchmark.
- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/reference/tools-reference.md` — native browser tool contracts.
- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/desktop.md` — Desktop/CLI/gateway same Hermes core.
- `https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/computer-use.md` — supported computer-use and visual limits.

`DOCUMENTED != EXECUTED`; `SOURCE_PROVEN != SESSION_CAPTURE_PROVEN`; `CURRENT > HISTORY`. Report `UNKNOWN` if the session lacks terminal events or full coverage.

## Canonical master phases, complete learning lineage and approved crystals (CHEFE · 2026-10-08)

This is an **inheritance and retrieval binding within this existing Oracle skill**, never an Oracle-owned trigger dispatcher, autonomous writer, second brain or competing canonical knowledge store. The CHEFE's latest explicit intention and the parent Goal remain the target. Consult Oracle as a candidate when it can change the decision; an active Hermes↔Oracle Goal loop continues material turns by `NEXT_CURSOR`, not redundant identical questions.

```text
ORACLE_INHERITS_FULL_MASTER_CYCLE=true
MASTER_PHASE_SOURCE=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml
TRIGGER_INVENTORY_SOURCE=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml
MASTER_RESOLVER=scripts/trigger-fabric/centraldark_master_cycle.py
ALL_CANONICAL_PHASES_CONSIDERED=true
EXECUTE_ONLY_PERTINENT_PHASES=true
TRIGGERS_ARE_CONDITIONAL_NOT_RITUAL=true
NO_ALL_LEARNINGS_BOOT_GATE=true
FULL_LEARNING_LINEAGE_DISCOVERABLE=true
ORACLE_OUTPUT_IS_CANDIDATE=true
```

1. **Recover the same intention:** read current SOUL/RULES/AGENTS, the applicable `docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md`, `docs/CONSCIENCIA/MAPA-DO-CEREBRO.md`, current Goal/clauses, latest valid receipt, `GREEN_STATE` and `NEXT_CURSOR`. Classify the new CHEFE utterance as continuation/delta unless there is an explicit override. Preserve approved original text and diagrams.
2. **Account for the complete master:** consult the *current* `MASTER-CYCLE.yml`, `TRIGGERS.yml` and relevant `ENGINE_BINDING.yml` rather than hardcoding a second chain here. Consider each canonical phase and matching event; record which was executed, satisfied by reusable proof, inapplicable to this cone, or remains `UNKNOWN/BLOCKED`. Execute only necessary phases using their **existing owners and resolver**, with Reality Judge after actual effects. Merely printing a trigger name does not execute it; Oracle must not self-assert completion of Hermes or other runtime work.
3. **Read the whole learning *index* before selecting evidence:** discover the global lineage `L000` through the last currently measured UID in `docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json`, and its source `docs/CONSCIENCIA/APRENDIZADOS.md`. Preserve legacy duplicate numbers/gaps and the cognitive chain from #115 onward. On a normal Goal turn, read the **complete bodies of all causally pertinent learnings**, adjacent lineage as required, and the relevant `docs/CONSCIENCIA/LEMBRANCAS/`, `docs/BRAIN/` and receipts. An explicit CHEFE request for an **integral historical audit** requires traversal of the entire available numbered source plus genesis, with measured coverage (UID range, section count, gaps, SHA and unread spans), not an excerpt falsely labeled complete.
4. **Recover approved decisions before proposing novelty:** consult CURRENT canonical owners, `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/KNOWLEDGE-HUB.yml`, `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json`, matching approvals/receipts and the fingerprints they actually seal. An entry in APRENDIZADOS or a lineage edge proves recorded provenance, **not** current approval, unchanged runtime or PASS. Prefer matching proven recipes; mark historical, candidate, superseded, stale or unverified material accurately.
5. **Check the index against reality:** compare the lineage manifest's `source_blob_sha` and coverage against the same-ref source before claiming the entire library is current. If stale or inaccessible, report `LEARNING_INDEX_STALE`/`LEARNING_COVERAGE_PARTIAL` and use the direct canonical source or existing lineage compiler/owner; do not invent a missing lesson or silently reindex as the Oracle.
6. **Close the same causal cycle:** send the relevant evidence digest and source refs in the existing `oracle_evidence_hook.py` envelope; Hermes/perception performs applicable reads and owner-local actions, independent counterproof tests the real effect, clauses update and an existing writer seals receipt/`NEXT_CURSOR`. If the fingerprint has no material information gain, reuse the proven result instead of consulting Oracle again. `DOCUMENTED != EXECUTED`, `MERGED != DEPLOYED`, `UNKNOWN != PASS`, `GOAL_DONE != LOCAL_DONE`.

**Scope resolution:** earlier references to "ask CHAT_GLOBAL each micro-step" and "Oracle-first human response" govern an **active, applicable** Hermes↔Oracle mission, not every unrelated CentralDark response or every master trigger. All phases are *accounted for*, not blindly executed; no mandatory full-body preload on each boot. This follows the newer SOUL/Trigger Fabric `PERTINENCE_FIRST` and `MINIMUM_SUFFICIENT_LOOP` requirements without erasing the previous Oracle continuity contract.
