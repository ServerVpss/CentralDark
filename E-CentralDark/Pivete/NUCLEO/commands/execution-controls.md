# COMANDO - execution-controls.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\skills\pi-subagents\references\execution-controls.md
**SHA:** 8bac6102d8ae52ca
**Timestamp:** 2026-08-28T02:24:50.855510
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = subagent({

### Contratos
- For one host-run verification command, pass `gate: "npm test"` on a `runs.run`/`runs.all` item (or at the top level as a workflow default). It is shorthand for verified acceptance with that single com

### Ouro Bruto (primeiros 5000 chars)
```
# Pi Subagents: Execution Controls

This file is a detailed reference loaded from `skills/pi-subagents/SKILL.md`.

## Discovery and Scope Rules

Agent files can live in:
- `~/.pi/agent/agents/**/*.md` — user scope
- `.pi/agents/**/*.md` — canonical project scope
- legacy `.agents/**/*.md` — still read for compatibility, but `.pi/agents/` wins on conflicts

Saved chain files may still be discovered for management and existing durable run state, but they are not a public execution surface. Author new orchestration with `workflowScript`.

Precedence is by parsed runtime name:
1. project scope
2. user scope
3. builtin agents

Project settings resolve from the nearest parent directory containing `.pi` or `.agents` by default. In monorepos or git worktrees where an incidental nested `.pi` directory should not shadow the repository config, set `subagents.projectRootResolution: "git-root"` in the repository root `.pi/settings.json`; a nested project can opt back with `"nearest"` in its own settings.

## Running Subagents

### External CLI profiles

An agent may set `runner.type: external-cli` with a non-empty `command`, optional string `args`, and `promptDelivery: stdin` (the default). The command runs with `shell: false`, inherits the resolved cwd and environment, and receives the combined agent instructions and task through stdin. It must already be installed; pi-subagents adds no CLI dependency.

External CLI profiles are async-only and one-shot. They support lifecycle artifacts, stdout/stderr logs, timeout, and stop. Full stdout and stderr are retained in their log files, while the final stdout response and stderr error kept in memory are each limited to their last 64 KiB. They do not support foreground/clarify, steer/resume/interrupt-as-pause, Pi models/tools/extensions/skills, tool or turn budgets, structured output, nested subagents, fallbacks, or sessions.

### External job profiles

An agent may set `runner.type: external-job` with a non-empty `provider` and optional JSON `options`. When `surf-cli` is installed and loaded, Surf can optionally expose a `gpt-pro` package agent through provider `surf-oracle`. Surf maps `model: pro` to ChatGPT GPT-5.6 Sol Pro web mode. pi-subagents does not own that package agent or model mapping. Remove any old `agentOverrides.gpt-pro.disabled` workaround before using Surf's package agent. The provider must be registered in the host Pi process through `pi-subagents/external-job-provider`; the async runner talks to that parent-owned registry through a local operation bridge.

External job profiles are async-only. The provider owns the remote job and Pi owns the async run record. Status persists provider name, provider job id, prompt digest, provider options, handle/conversation URLs when supplied, result artifact path, last known state, and provider failure code/message. Recovery uses existing provider job metadata to call `reattach` and `result`; it refuses to redispatch a prompt when the persisted provider job does not match the prompt digest.

External job profiles do not support foreground/clarify, steer/resume, Pi models/tools/extensions/skills, tool or turn budgets, structured output, native child permissions, fallbacks, or Pi child sessions. Capacity conflicts fail closed and include the blocking provider job id when the provider supplies it.

### Single agent

```typescript
subagent({
  workflowScript: `return runs.run("oracle-check", { agent: "oracle", task: "Review my current direction and challenge assumptions." })`
})
```

### Forked context

```typescript
subagent({
  workflowScript: `return runs.run("oracle-check", { agent: "oracle", task: "Review my current direction and challenge assumptions.", context: "fork" })`
})
```

`context: "fork"` creates a branched child session from the current persisted
parent session. It does **not** create a fresh minimal review context or filter
history down to only the relevant parts. Use it when you want a separate review
or execution thread that can still reference the parent session history.

Foreground results, async status, fleet, and widget surfaces label each child with
its resolved launch context as `[fresh]` or `[fork]`. Aggregate headers show
`[mixed]` when a run uses both modes.

### Scripted workflows

`workflowScript` is the sole public execution surface. Use `runs.run(key, { agent, task, ... })` for one child, `runs.all([...])` for parallel children, and ordinary JavaScript for sequence, branching, filtering, retries, and aggregation. Scripts are ordinary JavaScript statement bodies, so use an explicit return such as `workflowScript: "return runs.run('main', { agent: 'worker', task: '...' })"` for a useful one-child result. Use top-level `await`, plain helper functions, or explicit Promise chains; nested `async function` helpers, async arrows, and async methods are rejected. Prefer a single scripted workflow whenever the parent is starting a coordinated wave, such as multiple reviews, review plus gate monitor, work
```