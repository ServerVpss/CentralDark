# Canonical result and cross-surface delivery audit

## Trigger

Use this reference when auditing whether one Hermes execution produces one durable conclusion that is projected consistently to Desktop/app, Telegram, cards, attachments, and TTS — especially when the user asks about duplicate replies, a “live card”, exactly-once delivery, or a single mission/result without adding a parallel database or queue.

This is an **evidence procedure**, not an architecture claim. The existence of `final_response`, a stream consumer, a `message_id`, or a lock does not by itself prove canonical persistence or exactly-once delivery.

## Core model: keep six layers separate

Classify every artifact into exactly one layer before reasoning about it:

1. **Semantic result** — the completed answer after model fallbacks, verification, completion explainers, and output-transform hooks.
2. **Durable transcript** — the assistant row that a later process/session reloads.
3. **Preview** — token deltas, drafts, cursor-bearing edits, commentary, and progress cards.
4. **Presentation projection** — Telegram HTML/Markdown/card wrapping, Desktop rendering, media-tag stripping, and speech cleanup.
5. **Transport acknowledgement** — a successful `SendResult`, platform message ID, or equivalent typed receipt.
6. **Derived effect** — TTS generation/playback, report attachment, notification, or any other side effect based on the result.

A preview is not a final result. A final result is not a transport acknowledgement. A transport acknowledgement is not proof that every derived effect completed. Never collapse these states into one `already_sent` boolean.

## 1. Locate the semantic finalization boundary

Trace from the agent loop to the returned result:

- Find where `final_response` is selected after empty-response fallbacks, interruption, max-iteration recovery, verification gates, and output hooks.
- Record the exact order of:
  1. closing the assistant turn in `messages`;
  2. persisting the transcript;
  3. appending verifier/explainer text;
  4. invoking `transform_llm_output` or equivalent;
  5. gateway-side sanitization/reasoning/footer transforms.
- Do not call the transcript canonical until the text persisted is byte-for-byte (or structurally) the same semantic result returned to delivery.

### Minimal divergence probe

Use a no-network fake agent with an assistant message `Raw answer.` and a post-finalization transform returning `Transformed answer.`. Capture both:

```text
returned final_response
persisted last assistant content
response_transformed flag
```

If returned and persisted content differ, the live outbound answer may disappear or regress after reload. Classify this as a canonical-persistence blocker even if live UI tests pass.

## 2. Trace every outbound projection from the same input

Build a matrix for each surface:

| Surface/effect | Input text | Transform | Identity | Success evidence | Durable state |
|---|---|---|---|---|---|
| Desktop complete | semantic final | media/render cleanup | turn/message ID | terminal event reconciled | yes/no |
| Telegram text/card | semantic final | adapter format/card/chunk | destination + platform ID | `SendResult.success` | yes/no |
| Telegram media | canonical attachment list | adapter route | destination + media effect | typed media receipt | yes/no |
| Desktop Read Aloud | canonical spoken script | speech sanitizer | mission + TTS effect | playback completion | yes/no |
| Telegram TTS/audio | same spoken script | codec/container route | mission + destination + TTS effect | typed voice/audio receipt | yes/no |

A separately authored summary or speech paragraph is not a projection; it is a second conclusion and can contradict the app/card.

## 3. Audit identity end to end

Inventory every identifier and its scope. Common Hermes identifiers have different meanings:

- `session_id` — durable conversation identity;
- `session_key` — route/peer lane;
- `task_id` / `effective_task_id` — agent task or resource isolation, sometimes reused by a gateway session;
- `turn_id` — runtime turn identity;
- `run_generation` — stale-run suppression inside one lifecycle;
- inbound `message_id` / platform update ID — source event identity;
- outbound platform `message_id` — transport handle;
- cron `job_id` — schedule identity, not necessarily one fire × destination;
- delegation/process ID — producer identity for background completion.

For a single-result contract, require one stable `mission_id` (or promoted `turn_id`) to reach:

```text
canonical result → durable transcript → Desktop terminal event → Telegram metadata
→ attachment effects → TTS effects → delivery records
```

If the ID is generated but not returned, persisted, or propagated to transports, it cannot deduplicate a restart or reconcile two surfaces.

## 4. Classify deduplication honestly

Use these labels:

- **visual reconciliation** — replaces a pending UI bubble; no transport guarantee;
- **lifecycle-scoped suppression** — lock/set/LRU/cache in one process;
- **durable at-most-once** — claim before action; crash can lose work;
- **durable at-least-once** — replay after crash; duplicates remain possible;
- **destination-cooperative idempotency** — destination accepts an idempotency key;
- **exactly-once** — claim only when the full end-to-end proof exists; normally unavailable for chat APIs with ambiguous timeouts.

Mandatory checks:

1. Is the dedupe key persisted?
2. Does it include mission/turn, destination, and effect?
3. Is it checked **before** re-executing agent/tool side effects?
4. Is success recorded only after a positive transport receipt?
5. What happens if the process dies:
   - before send;
   - after destination acceptance but before local ACK;
   - after local ACK but before user-visible completion?
6. What happens on a timeout that may have reached the destination?

A bounded `OrderedDict`, process lock, `_already_sent`, local React ref, or `__no_edit__` sentinel reduces duplicates but does not survive restart.

## 5. Treat delivery acknowledgement as typed evidence

- Require `SendResult.success is True`; a returned object, lack of exception, or `handle_message()` acceptance is not sufficient.
- Retain the outbound `message_id` and continuation IDs only after confirmed success.
- If an adapter schedules background processing and returns immediately, record **accepted/scheduled**, not delivered.
- Inspect all branches that ignore a failed `SendResult` and then set `already_sent=True` or acknowledge durable producer state.
- Keep `confirmed` and `ambiguous` separate. A timeout may have delivered; suppressing blind retries can be reasonable, but it is best-effort at-most-once and may cause a silent loss.
- Never report exactly-once when ambiguity is intentionally resolved by “assume delivered to avoid duplication.”

## 6. Streaming, drafts, overflow, and cards

### Preview state

Track at least:

```text
preview message IDs
continuation IDs
last confirmed visible prefix
accumulated semantic text
final response sent
final content delivered
ambiguous delivery
```

- Native drafts may have no editable `message_id`; they must not suppress the regular final send.
- A cursor-bearing complete preview can justify suppressing a duplicate full send when only cosmetic cursor removal failed, but it is not the same as a clean finalized presentation.
- Overflow must preserve the last confirmed prefix and send only the missing tail after partial failure.
- Fresh-final (`send new + delete preview`) is best effort: failure to delete can leave both preview and final visible.

### Card consistency probe

Capture adapter payloads without network for three stages:

1. first preview send;
2. progressive `edit_message(..., finalize=False)`;
3. final `edit_message(..., finalize=True)`.

Compare `parse_mode` and payload shape. If the first/final payload is an HTML `<pre>` card but the progressive edit is raw/plain text, the system has a live-format flip, not one stable live card. Either:

- render the same card projection for every editable frame; or
- deliberately keep previews plain/draft and create exactly one final card, documenting that it is not an in-place live card.

Do not mistake `REQUIRES_EDIT_FINALIZE` for delivery persistence; it is an adapter presentation capability.

## 7. Desktop reconciliation audit

Verify the terminal event carries a stable turn/mission identity. If `message.complete` contains only text and the renderer generates an ID from `Date.now()`, then:

- the first terminal event can reconcile a pending bubble;
- a replayed terminal event with no pending bubble can create a duplicate;
- reload/hydration may restore different text if the durable assistant row predates a final transform.

A local “last spoken message ID” ref is presentation dedupe only. It resets with component/session lifecycle and cannot guarantee one TTS effect after restart.

## 8. TTS must derive from one canonical spoken script

Do not assume “both start from the answer” means they speak the same script. Compare:

- gateway/base `prepare_tts_text`;
- gateway runner Markdown cleanup;
- Desktop `sanitizeTextForSpeech`;
- provider-side truncation and codec conversion.

Use one fixture containing headings, Markdown links, a bare URL, emoji, inline code, and a fenced code block. Capture each sanitizer output. Differences must be intentional and tested.

Recommended contract:

```text
canonical_result.final_text
canonical_result.spoken_script  # generated once from final_text
```

Both Desktop Read Aloud and Telegram audio consume `spoken_script`; adapters may only apply provider limits/codec conversion. Track TTS as a separate effect keyed by `(mission_id, destination, effect='tts')`. Mark it confirmed after the intended playback/delivery receipt, not merely before synthesis starts.

### Proven minimal bridge pattern: one source job, two surfaces

Use this pattern when Desktop and Telegram currently synthesize independently:

1. At semantic finalization, capture the **full** transformed response, `turn_id`, runtime `session_id`, active profile, and declared `mission_id`.
2. Keep identities separate: `correlation_id = turn_id`; resolve `mission_id` from `HERMES_MISSION_ID` or active-profile plugin config; preserve `session_id` for Desktop/gateway correlation. Fall back to session identity only when no mission source exists.
3. Persist `source_text_sha256` for the raw response and `speech_text_sha256` for one backend sanitizer pass. Never truncate `speech_text` to the Card preview.
4. Freeze a non-secret voice snapshot — provider, voice, model/language, speed, and config hash — before delivery.
5. Assign a deterministic source path under the active `HERMES_HOME`, keyed by correlation/text/voice identity, and guard creation with a per-job lock. Concurrent Desktop and Telegram claims must converge on one synthesis call.
6. Telegram calls `ensure_canonical_audio_source(result)`, never TTS directly. It may derive OGG/Opus for transport; delete only the derived file, never the source.
7. Desktop sends raw final text plus `session_id`. The backend resolves the persisted result by session-or-mission identity plus source hash, returns the same source bytes, and leaves the file intact. If a canonical job exists but fails, report degradation rather than silently authoring a second TTS job.
8. Remove renderer-side sanitization from this path. Legacy/manual messages without a canonical record may use a clearly marked one-off backend fallback, sanitized once.
9. Speak only the completed result that Desktop actually plays. Mission-start, delegation, waiting, and fallback telemetry remain Card/text unless Desktop also plays identical speech.
10. Never infer mission completion from `on_session_end` without verifying hook semantics; Hermes may emit it after every turn.

Persist enough safe metadata to prove identity:

```text
mission_id, session_id, correlation_id,
source_text_sha256, speech_text_sha256,
audio_job_id, voice_config, voice_config_sha256,
source_path, source_sha256, source_bytes
```

### TDD and runtime proof ladder

1. RED: Desktop and Telegram claim one result while a fake synthesizer records calls; require one call and identical source path/hash/identity.
2. GREEN: add deterministic planning, locking, reverse lookup, and source reuse.
3. RED/GREEN: fail any direct Telegram TTS call; permit only source-to-transport conversion.
4. RED/GREEN: require Desktop to send raw text plus mission/session identity, not independently sanitized text.
5. Audio mocks must materialize real non-empty files. When production checks path, bytes, size, hash, or cleanup, a nonexistent mock filename is invalid; fix the fixture, never weaken production validation.
6. Run suites touched by the delta first. Re-open previously green audio/STT/Card/dedupe gates only when the delta creates a credible regression surface.
7. Bundle code/config changes before one controlled runtime reload.
8. Exercise one **real mission result**, not a diagnostic clip sold as success. Capture one source TTS job, Desktop API metadata plus actual playback completion, Telegram typed receipt/message ID, equal speech/correlation/mission/profile/voice hashes, compatible source/transport durations, and Card/verdict/next-step agreement.
9. Simulate send/render/offline/playback failures and prove explicit degradation plus recovery without duplicate final delivery.
10. Rebuild/reload, focused regression, rollback/reapply, and canonical-report update are separate gates. Compilation or isolated unit tests cannot close runtime validation.

### Event-projection implementation discipline

When turning lifecycle hooks into a live mission panel, keep the projection selective and the identities explicit:

1. Preserve `mission_id`, runtime `session_id`, and per-event `correlation_id` as different scopes. Audio/card dedupe keys must include `correlation_id`; `mission + phase + speech_hash` alone wrongly suppresses two legitimate turns that happen to say the same thing.
2. Record every hook locally, but update the live Card only for meaningful transitions. A practical default is: pre-tool only when the call declares a long/background operation; post-tool when duration crosses a documented threshold or status is non-success. Approval decisions, delegations, blocks, fallback activation, and explicit completion are significant. Never ship raw command arguments or tool output to Telegram; project only whitelisted metadata such as status, duration, exit code, and typed handles.
3. Model unknown progress explicitly (`progress_known=false` or nullable progress). Never render missing progress as `0%`. Likewise, show `XP ainda sem fonte comprovada` until a real profile-scoped XP rule exists.
4. Distinguish `TURNO_ENCERRADO` from `MISSAO_CONCLUIDA`. A generic session-end hook can fire after every turn; only an explicit semantic completion contract may close the mission and set 100%.
5. Card state should retain confirmed `chat_id`, `message_id`, latest correlation, content hash, and `pending`. Skip a retry only when the confirmed content hash is unchanged and `pending=false`; a pending event must remain retryable. On recovery, publish only the newest consolidated state rather than replaying stale cards.
6. Transport fallback must not author a second conclusion. HTML parse failure may fall back to plain text containing the same fields plus `correlation_id`. `sendVoice` failure may fall back to the existing `sendAudio` path only from the same canonical source bytes/job; if both fail, mark Telegram audio degraded and keep text/Card available.
7. Do not move the sole canonical persistence boundary behind network sends merely to capture delivery outcomes. Persist the immutable semantic result before external effects; track effect receipts/degradation in existing delivery state or atomically update the authoritative record. Otherwise a process death after Telegram delivery but before persistence creates an untraceable result.
8. Content-hash dedupe reduces duplicate API edits but is not exactly-once delivery. Keep timeout/ambiguous states distinct and test restart, redelivery, changed correlation with identical speech, and changed Card content separately.

Use TDD for each boundary: first prove the old behavior fails, then run the new cases, then rerun only suites whose contracts changed. A stale assertion should be changed only when the requirement intentionally changed; otherwise it is a regression.

### XP/level rule

Search existing Hermes achievements/activity sources first. Reuse a valid profile-scoped achievements snapshot or endpoint and document the deterministic mapping. If no authoritative data is available, render `XP ainda sem fonte comprovada`; never create a second XP database or reward repeated tests/tool chatter.

## 9. Effective configuration is not one boolean

When auditing streaming or display behavior, evaluate the same resolver production uses:

```text
global streaming.enabled
per-platform display.platforms.<platform>.streaming override
display.interim_assistant_messages
transport = edit | draft | auto | off
adapter capability probes
loaded runtime/profile
```

`display.streaming` can describe a UI preference while gateway token streaming remains disabled. Print only safe booleans/enum values; never dump the full profile config or `.env`.

## 10. Minimal durable design without a parallel DB or queue

Reuse the existing `state.db` and current session/gateway seams:

1. Finalize all **semantic** transforms.
2. Persist the canonical result atomically, including stable mission/turn identity and content hash.
3. Publish projections from that persisted result.
4. Store one delivery/effect row in the same database for each destination/effect, with a uniqueness constraint:

```text
UNIQUE(mission_id, destination, effect)
state = pending | sending | confirmed | ambiguous | failed
content_hash, platform_message_id, attempts, last_error, updated_at
```

5. Reconcile Desktop from the canonical ID, not text/time.
6. Feed Telegram card, attachments, and TTS from the same record.
7. On restart:
   - retry `pending/failed` under bounded policy;
   - do not blind-resend `ambiguous` without destination reconciliation;
   - never re-run the agent merely to reconstruct an already-persisted conclusion.

This is additional state in the existing authoritative DB, not a competing database or independently authored notification queue.

## 11. Focused verification matrix

Minimum regression coverage:

- raw assistant text transformed after finalization → persisted/live equality;
- duplicate `message.complete` for one mission → one Desktop bubble;
- Desktop reload after transformed answer → same text as live completion;
- initial preview, progressive edit, final card → intentional stable presentation;
- draft preview without ID → regular final send still occurs;
- partial overflow → only missing suffix sent;
- final edit failure with complete visible preview → no duplicate body;
- confirmed send failure → retry remains possible;
- ambiguous timeout → state is `ambiguous`, not claimed exactly-once;
- process crash before/after transport acceptance → documented replay/loss behavior;
- same mission to app + Telegram → one agent execution and two destination effects;
- Desktop and Telegram TTS sanitizer fixture → same canonical spoken content;
- TTS synthesis/playback failure → text conclusion remains intact and effect state is retryable/explicit.

For read-only Windows audits whose installed runtime lacks test packages, keep the repository untouched: install the pinned test runner into an OS temp target, prepend that target explicitly to the existing interpreter's `sys.path`, run with bytecode/cache disabled, and remove the temp target afterward. Record pass/fail/skip counts separately from static code findings.

## Session landmarks observed on 2026-07-18

These are evidence anchors, not permanent guarantees; recheck current code before citing them:

- `agent/turn_finalizer.py` returned `final_response`, but persistence occurred before `transform_llm_output`; a no-network probe produced `returned=Transformed answer` and `persisted=Raw answer`.
- Gateway-side empty-response sanitization, optional reasoning, and runtime footer could further diverge from the earlier assistant row.
- Desktop reconciled deltas with `message.complete`, but the terminal payload had no durable turn/mission ID.
- Telegram's stream consumer carefully separated drafts, previews, final-send confirmation, continuation IDs, and ambiguous timeout suppression; the state was lifecycle-local.
- A payload-capture probe with house `card_style` showed HTML card on first send, raw text on progressive edit, and HTML card again on final edit — a format flip rather than one stable live card.
- The `pivete` effective resolver produced token streaming disabled while interim assistant commentary remained enabled; `display.streaming` alone was not the operative switch.
- Normal `messages` rows had no turn/mission/delivery columns. `platform_message_id` was primarily inbound and did not form an outbound ledger.
- `async_delegations` had durable claim/attempt/delivery fields, but gateway acknowledgement followed adapter scheduling/acceptance rather than the final platform `SendResult`.
- Desktop, gateway-base, and gateway-runner speech sanitizers produced different outputs for the same Markdown fixture; no single durable `spoken_script` was shared.

Re-open every landmark against the live checkout and effective profile before applying it to a later version.
