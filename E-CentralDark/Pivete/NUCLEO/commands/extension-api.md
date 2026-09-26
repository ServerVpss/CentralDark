# COMANDO - extension-api.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\docs\extension-api.md
**SHA:** da9b26f9c843ce29
**Timestamp:** 2026-08-28T02:24:50.396899
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: ({ prompt, promptDigest, cwd, runId, stepIndex, agent, options }) => startSurfJob({ prompt, promptDigest, cwd, runId, stepIndex, agent, options }),
- Herdr 0.7.5+ can open an on-demand inspector for an existing async run:

### Contratos
- Other Pi extensions can make their current-session jobs visible to `subagent_wait` through the process-local provider contract:

### Ouro Bruto (primeiros 5000 chars)
```
# Extension and integration APIs

Public seams for other Pi extensions and host integrations: the in-process RPC, the structured delegation API, launch preflight, capability ceilings, the background-work provider contract, and the Herdr integration.

## In-process event-bus RPC

Other Pi extensions can use the in-process event-bus RPC instead of scraping slash output or calling internal modules. Listen for `subagents:rpc:v1:ready`, send requests on `subagents:rpc:v1:request`, and read replies from `subagents:rpc:v1:reply:<requestId>`.

```typescript
const requestId = crypto.randomUUID();
pi.events.on(`subagents:rpc:v1:reply:${requestId}`, (reply) => {
  // { version: 1, requestId, success: true, data } or
  // { version: 1, requestId, success: false, error: { code, message } }
});
pi.events.emit("subagents:rpc:v1:request", {
  version: 1,
  requestId,
  method: "spawn",
  params: {
    workflowScript: `return runs.run("main", { agent: "reviewer", task: "Review the current diff" })`,
    context: "fresh"
  }
});
```

The RPC methods are `ping`, `status`, `manage`, `spawn`, `steer`, `interrupt`, `stop`, and `resume`. `status`, `manage`, `steer`, `interrupt`, and `resume` reuse normal package-owned actions.

Method notes:

- `manage` exposes a narrow schedule-only allowlist: `schedule.list`, `schedule.show`, `schedule.history`, `schedule.pause`, `schedule.resume`, `schedule.run`, and `schedule.delete`. All actions except `schedule.list` require `id`. Mission, agent, config, worktree, and arbitrary management actions are rejected before executor dispatch. `ping.capabilities.managementActions` advertises the exact allowlist.
- `spawn` accepts structured single-child execution (`agent`, `task?`), inline `workflowScript`, or `workflowScriptPath` and is async-only: omit `async` or set `async: true`, omit `clarify`, and do not pass management `action` values. Relative script paths resolve against the request `cwd`. It goes through the same executor as the `subagent` tool, so agent discovery, validation, session attribution, configured spawn caps, child-safety depth, artifacts, and async status all behave the same.
- `steer` requires an async run `id` (plus optional child `index`) and a non-empty `message`; its reply preserves the normal acknowledged-delivery result. Optional `mode` values are `steer` (default), `follow_up`, and `auto`, and receipts include `deliveryStatus: "delivered" | "queued"`. RPC steering disables the direct tool's pause-and-revive recovery in every mode so an extension keeps authority over the exact child it spawned; `ping.capabilities.nonRecoveringSteer` advertises this guarantee.
- `resume` requires a run target and non-empty `message`. It delegates to the existing revival path, which validates current-session ownership, persisted session/recovery metadata, stopped/live state, capability ceilings, and the exclusive session lease before returning the new async run details. Callers may request a `file-only` output path for the revived result without overriding its model, tools, or budgets. `ping.capabilities.resume` advertises this seam.
- `stop` targets current-session top-level async runs through the stop control channel and records a `stopped` lifecycle instead of reporting a timeout.

Capability advertisements on `ping`:

- `events.asyncComplete` — exact process-local completion correlation after RPC `spawn`.
- `managementActions` — exact schedule management actions accepted by RPC `manage`.
- `launchResolvedExtensions` — the optional launch-resolved extension projection in status details.
- `runtimeAcknowledgedExtensions` — the optional child-runtime acknowledgement projection and event name.
- `processTerminalProof` — the process-terminal proof status (see [observability.md](observability.md#process-terminal-proof)).
- `nonRecoveringSteer` — RPC steering never pauses-and-revives.
- `resume` — the revival seam described above.
- `fleetStatus: { version: 1 }` — successful `status` replies additionally include `data.fleet`.

Structured delegation progress updates carry `runId` as soon as foreground execution allocates it, so a caller can retain the package-owned revival target even if its own tool turn is interrupted before the terminal response. Foreground `details.results[]` rows also include a numeric `index` that is unique within the run and stable across partial progress snapshots and the final result; use `(runId, index)` instead of row position to correlate single, counted parallel, and chain children.

### Fleet status DTO

When `ping.capabilities.fleetStatus` is `{ version: 1 }`, successful `status` replies include `data.fleet`: `{ version: 1, entries, totalActive, omitted }`.

Entries are bounded, current-session public display records with an opaque reconciliation `key`, resolved `agent`, optional `role`, `model`, `effort`, caller-facing `goal`, safe `startedAt`, and `{ input, output, total }` tokens. `totalActive` and `omitted` preserve overflow information beyond the bounded en
```