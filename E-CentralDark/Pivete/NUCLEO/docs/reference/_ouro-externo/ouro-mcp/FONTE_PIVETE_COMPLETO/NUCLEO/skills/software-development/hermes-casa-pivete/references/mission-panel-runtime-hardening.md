# Mission panel runtime hardening

## Trigger

Use this reference when implementing or auditing a Hermes observability plugin that projects one mission result to Desktop, Telegram Card, TTS/audio, and a durable audit trail. It is specifically for avoiding false green between unit tests, the loaded gateway process, persistent dedupe, and direct Bot API edit paths.

This complements `canonical-result-delivery-audit.md`; it does not authorize a second result store, bot, gateway, renderer, TTS pipeline, or queue.

## 1. Scope the delta before reviewing it

A globally dirty checkout can contain unrelated generated files, line-ending churn, other agents' work, and untracked files. A global `git diff` is then noisy enough to hide the real defect.

1. Inventory `git status --short` and classify paths as current scope, earlier approved scope, unrelated/pre-existing, or unknown.
2. Review only the declared current-scope files. Do not clean, normalize, stage, or revert unrelated paths.
3. Remember that untracked files do not appear in ordinary `git diff`; reviewers must read those files in full or compare them with an explicit captured baseline.
4. Give independent reviewers the absolute repository path and exact allowlist of files. Tell them to remain read-only and ignore everything else.
5. Run secret/static scans on the actual production files, not only added diff lines, when those files are untracked.

A massive global diff is not stronger evidence; it is usually worse evidence.

## 2. Prove the hook is on the real execution path

Directly calling a plugin callback proves callback behavior, not integration.

Trace all four links:

```text
runtime emitter → PluginManager/invoke_hook → registered callback → canonical side effect
```

For tool events, verify the emitter supplies the values the plugin consumes: `session_id`, `turn_id`, `tool_call_id`, tool name/args, result, status, duration, and error metadata. Verify the single-fire contract across normal execution, blocked approval, cancellation, and alternate executors.

For final-response audio, prove the post-LLM hook fires once after the tool loop and output transforms, not for every internal provider call.

Recommended evidence stack:

- callback unit test;
- registration/discovery test;
- emitter payload test;
- one loaded-runtime event in the active gateway.

No one layer substitutes for the others.

## 3. Separate code-on-disk from code-loaded

Before runtime smoke, compare the gateway PID/process start time with the mtimes or hashes of changed modules. If production modules are newer than the process, the gateway is stale even if `gateway status` is green.

Then:

1. confirm the plugin is enabled in the active profile;
2. resolve profile through official `HERMES_HOME` / active-profile helpers;
3. back up and hash config before a relevant mutation;
4. perform one controlled gateway reload, not a second gateway;
5. verify startup logs show the intended profile/platform/plugin;
6. execute a real inbound/outbound event and retain typed transport evidence.

“Process running” proves liveness, not that the current implementation is loaded.

## 4. Protect the canonical record under concurrency

For a profile-local append-only JSONL written by one Hermes process:

- use a lock keyed by normalized active-profile home;
- serialize each complete JSON object plus newline with one `write` call;
- keep result identity/profile inside every line;
- make readers ignore an incomplete final line rather than failing the whole lookup;
- test many concurrent writers and parse every resulting line.

A process-local lock does not prove cross-process safety. If multiple writers are legitimate, reuse an existing authoritative SQLite/state mechanism or an OS-level locking primitive; do not pretend the Python lock is enough.

Persist semantic truth before external network effects. If delivery status must be attached later, store it in the existing authoritative effect state or update the authoritative record atomically. Delivering first and appending later permits a crash to create a Telegram result with no canonical audit record.

### Crash-window RED/GREEN probe

Use a transport fake that opens the canonical store *inside the send callback*, before it returns. The first assertion must fail on the old external-first order. The minimal repair is:

1. freeze safe semantic text and deterministic effect identity;
2. append/persist the semantic event;
3. snapshot that serialized form;
4. execute Card/audio projection;
5. if projection adds hashes or degradation, atomically reconcile the exact same event, keyed by the full stable identity (for example mission, session, correlation, phase, and original timestamp);
6. assert the store still contains exactly one event, now with the transport-derived fields.

A failed reconciliation must leave the first semantic record readable. Never “repair” this by appending a second conclusion. If the store is truly append-only or has legitimate multi-process writers, keep delivery receipts in the existing authoritative effect state instead of rewriting JSONL.

## 5. Force redaction on every outbound projection

Reuse Hermes' authoritative `agent.redact.redact_sensitive_text`; never invent a mission-panel regex redactor.

Apply forced redaction before content can leave the profile through:

- Card text and evidence;
- next step, approval descriptions, delegated summaries, and fallback text;
- canonical `speech_text` before the TTS job is identified or synthesized;
- direct `editMessageText` payloads;
- logs and error strings.

Why defense-in-depth matters: a first Card send may pass through an adapter or `send_message_tool` redactor, while a direct edit helper can bypass it. Likewise a `MEDIA:` send only exposes the file path to the text redactor; it does not prevent the audio bytes from speaking an embedded secret.

Fail closed if forced redaction itself errors: omit the field and record a safe degradation; never fall back to raw content.

Redaction is also part of TTS identity. At both planning and source-creation boundaries, compare the planned `speech_text_sha256` with the redacted speech hash. If they differ, rebuild the deterministic job ID/path from the redacted hash while retaining the previously frozen non-secret voice configuration. Never synthesize new speech under a stale job ID. A focused test should plan an innocent script, mutate it to include a synthetic credential, then require: raw secret absent from TTS input; TTS input equals the result's redacted speech; source speech hash equals the result hash; and job ID differs from the stale plan.

Security test contract:

1. inject a recognizable fake credential into an assistant result;
2. assert the raw credential is absent from persisted `card_text`, `speech_text`, evidence, and captured edit payload;
3. assert the TTS input equals the persisted redacted `speech_text`;
4. assert Desktop and Telegram speech hashes still match;
5. do not assert one particular mask spelling (`[REDACTED]` versus partial masking); assert absence of the secret and equality of canonical projections.

Secret redaction is necessary but does not prove **data minimization**. Opaque approval descriptions, delegated goals, summaries, file paths, personal data, or arbitrary raw payloads may survive every credential regex. For external Card/TTS projections, define an allowlist of semantic fields, summarize and length-bound them, and keep detailed raw evidence only in the protected local source of truth. Add two independent tests: one recognizable synthetic credential that must be redacted and one opaque sentinel that must be omitted or summarized rather than copied verbatim.

`force=True` forces the selected redaction policy to run; it does not make that policy stricter. The shared Hermes redactor may deliberately preserve magic-link/OAuth/presigned URL query parameters or `user:password@host` for interactive workflows. An automatic observability boundary has different semantics: Card, external TTS, HTTP error payloads, and telemetry must add a boundary-specific URL/credential pass or omit the field. Test opaque values in `access_token`, `code`, `signature`, and userinfo, not only vendor-prefixed keys.

Always **redact before truncating**. If a credential crosses a 180/200-character preview boundary, truncation can shorten it below a regex minimum and leak its prefix/body fragment. Parameterize tests around every preview/compact limit and assert that no secret-body substring survives. Also test API error responses independently from logs: a logging filter can sanitize the traceback while `HTTPException.detail` or another response body still returns the raw exception.

## 6. Treat thread timeout as ambiguous, not cancelled

A timeout on `thread.join()` does not cancel the coroutine or network request. The worker may still reach Telegram after the caller returns.

Therefore:

- return/record `pending` or `ambiguous`, not definitive failure;
- do not launch a blind duplicate retry while the first worker can still complete;
- keep the per-profile transport lock/reservation alive until the worker settles;
- let the next reconciliation inspect persisted transport state;
- bound actual HTTP/TTS operations independently;
- test “caller timed out, worker later succeeded” and “caller timed out, worker later failed”.

Never show a Card claiming audio failure merely because the join timed out while the send remains in flight.

### Fire-and-forget is a two-phase protocol

A scheduler receipt (`scheduled=true`, task accepted, worker started) is not the projection result. If a sync hook launches Card/audio in the background:

1. persist semantic truth and a stable effect identity first;
2. record only that dispatch was accepted, not `success`, `failure`, or transport degradation;
3. capture the coroutine's typed return value or exception;
4. reconcile the same canonical event after the task settles;
5. persist the positive/ambiguous receipt before releasing retry eligibility;
6. give slot saturation (`dispatch_busy`) and process restart a real bounded recovery consumer.

A guard that merely `await`s and discards the coroutine result creates permanent false status: the hook may record `pending/degraded` for a successful send while the later task mutates only an abandoned in-memory object. Test with an `Event`-controlled transport: inspect the row before release, release success/failure, await worker completion, and require one final reconciled row with the actual receipt. Saturate every dispatch slot and prove the rejected event is eventually consumed; `pending=true` alone is not recovery.

Do not call a function async-safe merely because the outer wrapper uses `create_task`. TTS, ffmpeg, synchronous filesystem reads, `send_message_tool`, and blocking `threading.Lock.acquire()` inside that coroutine still freeze the event loop. Run a 10 ms heartbeat beside each real projection path and require ticks during slow mocked work.

### Canonical audio must be published, not merely found

A non-empty final-path file is not proof of a complete successful synthesis. A provider can write partial bytes and then fail; a retry that trusts only `is_file()` plus `st_size > 0` will reuse corruption as canonical audio.

Use a unique temporary output, validate provider success, format/size and—when available—expected metadata/hash, flush as required, then atomically rename to the deterministic final path. Clean failed temporary/final artifacts. The regression probe must make attempt 1 write partial bytes and fail; attempt 2 must call the synthesizer again and must not report `reused=true`. Repeat with two processes targeting the same deterministic job, because an in-memory job lock cannot prevent duplicate TTS or collision on a shared `.tmp` path.

## 7. Prove dedupe survives process restart

Calling the same function twice in one process proves only lifecycle-local dedupe unless in-memory state is deliberately removed.

For restart simulation:

1. send once and persist the positive receipt;
2. clear/reload module-level lock and cache maps while preserving the state file/database;
3. retry the same event;
4. assert no TTS, send, or edit call occurs;
5. retry identical text with a different `correlation_id` and assert it is allowed;
6. mark an event pending, replace it with a newer event, recover, and assert only the newest consolidated state is sent.

Reconstruct retry objects instead of reusing the exact same in-memory `MissionResult`. Reuse preserves timestamp/nonces and can make a content-hash dedupe test pass even though a real hook retry creates fresh volatile fields and triggers another send/edit. Define explicitly which fields are semantic identity and exclude volatile presentation fields such as render time from the dedupe hash unless an update is intentionally required.

Keep Card and audio effect keys distinct. Audio identity normally needs mission, phase/event, correlation, speech hash, and destination.

### Concurrency probes that ordinary thread tests miss

An `async` transport function must not hold `threading.Lock` across an `await`. Two tests running `asyncio.run()` in separate threads can pass while two coroutines on the same event loop deadlock: the first suspends inside the lock and the second blocks the only loop thread acquiring it. Run an `asyncio.gather()` probe in a subprocess with an external timeout so the reviewer cannot hang indefinitely.

Exercise effect-state locks through both normalized-path aliases (`home` and `home/../home`) and separate processes. A raw string key can create two locks for one profile, while even a normalized in-memory lock remains process-local. JSON state files that hold Telegram message IDs or audio receipts need atomic temp-write/replace and an interprocess strategy when multiple writers are legitimate. Prefer Hermes' existing `utils.atomic_json_write` over local `Path.write_text()` implementations. Prove crash preservation by writing an old valid receipt, forcing the helper's atomic replace to raise, and asserting the old JSON remains readable and unchanged. If malformed JSON is treated as `{}`, explicitly test that a partial write cannot erase every dedupe receipt and trigger duplicate sends.

### Telegram idempotency, ambiguous fallback, and pending scope

Treat Telegram `message is not modified` as idempotent success. Marking it pending causes needless retry/edit traffic and a false degradation in the canonical record.

A timeout or transport exception can be ambiguous after bytes reached Telegram. Do not automatically issue `sendAudio` merely because `sendVoice` returned a generic failure: first distinguish an explicit format rejection from timeout/unknown delivery, or record the possibility of two delivered messages.

Pending recovery must be scoped by mission/event, not a single profile-global `_pending` slot. Prove that mission B cannot erase mission A's unresolved receipt. Latest-only recovery should avoid replaying obsolete content without silently deleting the earlier failure evidence. Historical audio resolution must require mission/session identity or a defensible freshness bound; a text hash alone can select an old identical response.

`pending=true` is not recovery by itself. Reuse the gateway's existing successful-reconnect branch and invoke one bounded panel flush only for Telegram. The flush must recheck `plugins.enabled`/disabled state, resolve the active profile home officially, reconstruct from the newest persisted canonical result, and clear debt only after a positive typed receipt. Keep two separate tests: (1) the reconnect watcher awaits the flush exactly once after successful Telegram reconnect and not on cold start/failure; (2) the real flush sends only the latest consolidated result, updates/clears pending state, and remains deduplicated on a repeated reconnect. A mocked watcher callback without a real flush implementation is still RED and must never be reported as offline recovery.

Test the full source-format matrix, not only the common MP3 path. If the canonical source may be OGG/Opus/WAV/FLAC, a failed `sendVoice` cannot become `sendAudio` unless a valid MP3/M4A derivative is materialized. Distinguish explicit format rejection from offline/auth/timeout failures: retrying a second Bot API method for every generic failure creates extra traffic and can produce duplicate ambiguous delivery.

### Preserve event identity and evidence lifetime

Treat `mission_id`, runtime `session_id`, turn/request/tool `correlation_id`, and profile as separate invariants. For approval hooks, prefer the narrowest real event identity (`request_id`, then `tool_call_id`, then `turn_id`) and use session identity only as an explicitly degraded last resort. Add a contract test using the emitter's actual payload keys; direct handler tests with only `session_key` can falsely bless lost correlation.

Do not cache “last evidence” by session indefinitely. Scope evidence by `(session_id, turn_id)` or consume/clear it when the corresponding final result is built. A two-turn probe in which only turn 1 runs a tool must leave turn 2 with no inherited proof. Stale evidence is a false-green audit defect, not harmless UI residue.

### Revalidate persisted identifiers at the filesystem boundary

Sanitizing a job ID when it is created is insufficient if a later resolver reconstructs it from JSONL. Before any read, write, synthesis, hash, or upload:

1. validate the loaded identifier against a strict allowlist;
2. rebuild the path from the active profile root rather than trusting a persisted absolute path;
3. resolve both root and candidate and require containment;
4. include `..`, absolute paths, alternate separators, device names, and symlinks in adversarial tests.

A comment saying persisted paths are untrusted is not evidence unless the containment check is executed on the loaded value.

### Propagate durability failures into the canonical result

A helper returning `success=true` together with `state_persist_failed=true` is not a clean success. The aggregator must record “delivered, receipt not persisted” because the next retry may duplicate. Apply the same rule to Card and audio, and record kill-switch suppression explicitly so Card/audio absence cannot masquerade as successful parity.

Force `append_mission_result` to fail after mocked external sends. If Card/audio were delivered but no canonical line exists, the external-first order is a blocking loss-of-evidence defect even though the hook intentionally swallows exceptions to protect the conversation.

## 8. Audit effective identity, literal contracts, and competing effect owners

### Effective identity must be consistent after overrides

Trace identity after every default and configuration override, not only at hook entry. `mission_id`, runtime `session_id`, profile, turn/request correlation, message identity, and audio event identity are different scopes. Build a producer/consumer table for UI → API → backend profile home → canonical record → Card/audio projection.

A common false green is normalizing the projection to a configured mission while leaving cooldown, pending, or dedupe keyed by the original session. Probe it explicitly: map two sessions to the same effective mission, fire both within the debounce window, and assert the shared external projection receives only the policy-allowed effect.

For Desktop multi-profile calls, mission identity in the request body is not profile routing. Verify the client includes the same profile-scoping option used by other REST calls so Electron selects the correct pooled backend/HERMES_HOME. Then assert the response profile matches the selected UI profile. A test that checks only `{text, mission_id}` can miss a wrong-backend fallback.

### Feed the literal normative output through the parser

Never let tests invent a more convenient verdict vocabulary or heading than the canonical method requires. Collect literal examples from the source of truth and pass them through the real classifier, including the complete mandatory gate output. If `APROVAR` is canonical but tests only exercise `APROVADO`, or if the mission requires a named gate that the parser ignores, the gate remains blocked regardless of pass count.

Keep parsing and business-state decisions separate when possible: a structured completion signal is safer than inferring mission completion from free-form prose. Until then, table-test every allowed verdict/state spelling and every required heading.

### One canonical media job also needs one effect owner

Inventory every path capable of generating or sending the same effect: mission plugin, gateway auto-TTS, platform adapter auto-TTS, agent tool call, Desktop read-aloud, manual replay, and fallback. Dedupe inside each path does not prevent duplication between paths. Require one owner, explicit suppression, or a shared idempotency/outbox key.

For canonical Desktop↔Telegram audio, prove all five together:

1. selected profile/backend;
2. effective mission and turn/message correlation;
3. sanitized speech hash and frozen voice-config hash;
4. same canonical source bytes/hash (Telegram may derive only transport bytes);
5. one send per destination/event.

When identity is supplied but no canonical record is found, do not silently synthesize an unrelated source and present it as parity. Either fail, return an explicit degradation the UI enforces, or allow fallback only for a declared legacy/manual request. The client must consume `canonical`, profile, mission, correlation, and hash metadata; declaring those fields in a response type while ignoring them is not contract enforcement. Manual replay of an old message requires message/turn identity—text-only reverse lookup is ambiguous when two responses are identical.

### Runtime kill-switch and live-hook probes

Reading `os.environ` afresh proves only an in-process toggle. A supported runtime kill-switch needs an operator path that changes the state while the target process remains alive: IPC, endpoint, watched config/file, or equivalent. Test from outside the process: disable → next effect suppressed → re-enable → effect resumes, all without restart. Otherwise classify it as startup or in-process control.

Measure hook wall time with a controlled coroutine. If a “best effort” bridge waits for TTS/network completion, it is synchronous from the turn's perspective. Do not hold profile state locks over TTS, ffmpeg, or network calls, and do not put slow audio before the only live Card update when visibility is the primary requirement. Prefer persist-fast plus a bounded existing worker/outbox and typed reconciliation.

## 9. Count tests only on one exact tree

Test arithmetic is valid only while the tested production tree remains unchanged.

- In an active multi-agent or untracked tree, capture scoped SHA-256 values before review and again immediately before the verdict. If any hash changed, reread that file, refresh `file:line` citations, and rerun the affected gate; do not issue a verdict against the earlier snapshot.
- If test counts change during the audit, investigate source/test drift instead of presenting the newest count beside findings reproduced on an older tree.
- If a suite produced 70 passes and three failures, and only those three test fixtures change, rerunning the three failures can close that exact suite state.
- If production code changes afterward, earlier passes remain historical evidence, not a current regression total for affected contracts.
- Run the smallest affected cases after each patch, then one affected-suite gate on the final production tree.
- Never report `N/N` by adding results from different code states.
- A corrected assertion is not GREEN until the corrected test actually executes.
- Do not rerun unrelated previously approved gates without a credible regression surface.

This preserves continuity without manufacturing a false total.

## 10. Keep manifests and comments truthful

After behavior changes, reconcile the plugin manifest, module docstring, live-phase comments, and tests. Common lies to remove:

- claiming all live Card events also produce voice;
- calling a generic turn/session end mission completion;
- documenting a dedupe key that omits correlation identity;
- claiming runtime activation when only disk code was tested.

Documentation mismatch is not cosmetic in an operational plugin; future reviewers use it to select tests and interpret production behavior.

## 11. Closure gate

Do not close the panel task until all are true:

- canonical and projection tests pass on the final production tree;
- concurrency, restart, redaction, fallback, and ambiguous-timeout behavior are covered;
- an independent read-only review has returned and every real finding is resolved or explicitly blocking;
- the one active gateway has loaded the current code;
- a real Card and audio event prove profile, mission, correlation, speech/voice identity, and typed Telegram result;
- Desktop remains usable when Telegram is unavailable;
- only then is the canonical report updated.
