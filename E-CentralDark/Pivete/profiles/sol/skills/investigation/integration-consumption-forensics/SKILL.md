---
name: integration-consumption-forensics
description: Prove an agent consumes an external system.
version: 1.0.0
author: Hermes-Casa
---

## When to use
- Verify an integration works end-to-end, not just that config exists.
- Onboard a data source (Screenpipe, browser bridge, MCP, local daemon) and prove the agent can read it.
- Debug a gateway/router (e.g. Omni Router → engine) that errors.
- Someone claims "Hermes now sees my screen / uses tool X" — prove it or mark UNKNOWN.

## Core laws (never skip)
```
CONFIGURED      != ACTIVE
ACTIVE          != INVOCATION_PROVEN
HEALTH          != PROVIDER_INVOCATION_PROOF
CORRELATION     != CAUSE
UNKNOWN         != PASS
ACTION          != PROOF
```
A green health check or a config file mentioning the system proves NOTHING about live consumption.

## Protocol (READ_ONLY / ZERO_MUTATION by default)
Do not kill processes, restart, edit env, install, or reveal tokens. Measure first.

### 1. Map live ports & processes
Windows (sanitized — print only exe name + PID, never command-line secrets):
```powershell
$ports=3030,8099,8645,3100;  # screenpipe, omni, hermes-candidate, mcp
foreach($p in $ports){
  Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue |
  ForEach-Object { $pr=Get-CimInstance Win32_Process -Filter "ProcessId=$($_.OwningProcess)";
    [pscustomobject]@{ Port=$p; PID=$_.OwningProcess; Process=$pr.Name } }
}
```
Linux/macOS: `lsof -iTCP -sTCP:LISTEN -Pn` or `ss -ltnp`.

### 2. Prove runtime reachable (not failure)
```
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3030/health   # expect 200
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8099/health
```
401/403 = auth required = reachable (NOT a runtime failure). Record status + timestamp + PID.

### 3. Prove the TOOL is LOADED in THIS session
List the tools/MCP servers actually registered in the current agent session.
Classify each external system as:
- `CONFIGURED` — only referenced in a config file
- `LOADED` — registered as a tool/MCP in the session
- `INVOCATION_PROVEN` — the tool was actually called and returned

If the tool is NOT in the session's tool list, `TOOL_LOADED = UNKNOWN` and you CANNOT prove invocation. State this honestly — do not infer PASS from the external process being up.

### 4. Causal test (the discriminator)
Do NOT use conversation history as proof. Pick a benign, recent observation:
- (A) Query the source DIRECTLY, store a fingerprint/hash of the result (sanitized).
- (B) Through the AGENT, using the discovered tool/MCP, request the SAME observation.
Record: `TOOL_CALLED=`, `MCP_SERVER=`, `REQUEST_ID=`, `TIMESTAMP=`, `QUERY=`, `RESULT_FINGERPRINT=`.
Compare A vs B. Match → `INVOCATION_PROVEN=PASS`.

### 5. Strongest: trace ID E2E
Propagate one `TRACE_ID=CD_<UUID>` through source query → agent tool call → router → engine → response. Grep logs/receipts for the same ID with coherent timestamps. Same ID across all hops = strong causal chain.

### 6. Emit receipt (local only)
Write `MAPA-E2E.md` + `receipt.json` with the CLAIM|STATUS|EVIDENCE table. Allowed statuses: `PASS | FAIL | UNKNOWN | CONFIGURED_NOT_PROVEN`. End with:
```
PROVADO= / NAO_PROVADO= / UNKNOWN= / FIO_CAUSAL= / PROXIMO_TESTE_DISCRIMINANTE=
```
Never "fix" anything. First deliver only reality.

## Pitfalls
- **Health endpoint green ≠ provider invoked.** Omni Router `/health`=200 but POST `/v1/chat/completions` returning `hermes_stdio_turn_failed` means the router is alive but the engine behind it is not reachable — that is `OMNI_TO_ENGINE_INVOCATION=FAIL`, not PASS.
- **Process listening ≠ agent can see it.** Screenpipe on :3030 + bridge connected does NOT mean the Hermes session has the Screenpipe tool. The broken link is almost always agent-side tool registration.
- **Grep for config ≠ configured.** `search_files` case-insensitive matches in framework caches (e.g. `hermes-agent/apps/desktop/dist/*.js`) are noise. Require an explicit config entry (yaml/json) in the project or agent config dir.
- **Token exposure.** Never print API tokens / cookies. Test auth by hitting a health endpoint; a 401/403 proves auth is enforced without revealing the secret.
- **Terminal output explosions.** Grepping large trees or piping framework bundles (e.g. `dist/*.js`) into terminal can exceed the 90s/100K-char capture and time out. Use `search_files` with tight `file_glob` + `output_mode=content` and small `limit`, or write results to a file and `read_file` it. Prefer measuring ports/processes with a scoped powershell call over a repo-wide grep.

## Related
- `screenpipe-hermes-integration` (Casa skill: Screenpipe ↔ Omni Router ↔ Hermes wiring)
- `centraldark-casa-operations` (Casa operational constraints: ONE_WRITER, zero-regression)
- `pivete-session-guide` (session norms: measure before act)
