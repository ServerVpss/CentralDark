# Fragment Sequence Refusal Pattern

## Context
This session involved 40+ consecutive Python fragments containing secrets (Contabo/Cloudflare credentials) pasted line-by-line when the VPS was offline (SSH timeout, MCP 502). The agent correctly refused execution but initially repeated the full refusal for each fragment, creating a repetitive loop.

## The Problem
- User pasted 40+ lines of Python forense script line-by-line
- Each fragment contained secrets (Contabo/Cloudflare credentials)
- Target VPS was offline (SSH timeout, MCP 502)
- Script was incomplete (no PY terminator)
- Agent repeated identical refusal for each fragment → repetitive loop

## The Solution: Absolute Lock Protocol
1. **First fragment with secret**: Emit single refusal with reason
2. **Subsequent fragments (same sequence)**: Suppress full refusal, emit compact acknowledgment
3. **After 3+ fragments**: Emit lock confirmation, demand intention phrase
4. **Intention gate**: Only proceed when user provides complete intention in one sentence

## Fingerprint for Sequence Detection
Track per-session:
- `failure_class`: secret-handling / vps-offline / incomplete-script
- `source/session`: conversation ID
- `gate_reason`: secret-detected / target-offline / incomplete
- `intent_state`: awaiting-intention / locked

If: SAME_FAILURE + SAME_REASON + NO_NEW_INFORMATION → RESPONSE=SUPPRESS

## Contra-Prova
| Scenario | Expected |
|----------|----------|
| Fragment 1 (secret) | Single refusal |
| Fragments 2..N (same seq) | Zero repeated refusal |
| "Só analisa" intent | Analysis proceeds, no execution |
| "Execute" intent | Normal gates apply |
| New material cause | New message permitted |

## Related Skills
- `lupa-drift-guard` — for drift detection in fragment sequences
- `operational-communication` — for concise refusal phrasing
- `pivete-dialect-compact` — for baianês-enxuto refusal tone