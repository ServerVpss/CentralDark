# COMANDO - tool-reference.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\docs\tool-reference.md
**SHA:** d4d09039b6303497
**Timestamp:** 2026-08-28T02:24:50.433203
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: "You are a code scout...",

### Contratos
- { workflowScript: `return runs.run("impl", { agent: "worker", task: "Implement the fix", gate: "npm test" })` }
- - With `agentContract: { version: 1 }`, omitted, `"auto"`, and `false` mean no acceptance request for that run; explicit acceptance is reported separately from execution.

### Ouro Bruto (primeiros 5000 chars)
```
# Tool reference

Parameters and actions for the `subagent` tool. These are what the LLM passes when it calls the tool; most users ask naturally or use slash commands instead.

## Execution examples

Chaining is code-driven through `workflowScript`. Use `await runs.run(...)` for sequential steps and `await runs.all([{ key, agent, task }, ...])` for ordinary parallel fanout. `runs.all` resolves to an ordered array, not a key map, so use indexes, destructuring, or `.map(...)`, not `results.<key>`. Do not read `.output` from an unawaited `runs.run` launch. Stored `runs.run` promises are only for the advanced rolling fanout pattern under [Workflow steering](#workflow-steering), where every promise is later observed with direct `await`, `Promise.race`, or `Promise.all`. Legacy top-level `chain`, `tasks`, and `parallel` inputs are not supported. Helper functions must be plain functions or explicit Promise chains. Nested `async function` helpers, async arrows, and async methods are rejected so child-launch tracking stays portable across Node and Bun.

Use `{ action: "validate", workflowScript }` to check statically decidable syntax and structure without launching children. It returns `{ ok, errors }` and fails the tool call when `ok` is false. Dynamic keys and values remain valid because runtime-only cases are not guessed.

Use `workflowScriptPath` instead of `workflowScript` to load the same JavaScript statement body from a file. The two fields are mutually exclusive. Relative paths resolve against the request `cwd`, and absolute paths pass through. The host reads the file before validation, scheduling, or sandbox execution. The workflow sandbox still has no filesystem access. Missing, unreadable, and empty files fail as file input errors.

```js
{ workflowScriptPath: "workflows/review.js", cwd: "/path/to/project" }
{ action: "validate", workflowScriptPath: "workflows/review.js" }
{ action: "schedule.create", every: "6h", workflowScriptPath: "workflows/review.js" }
```

```js
// One child; return the child promise explicitly
{ workflowScript: `return runs.run("main", { agent: "scout", task: "Analyze the auth flow" })` }

// Sequential workflow
{ workflowScript: `
  const scan = await runs.run("scan", { agent: "scout", task: "Analyze auth" });
  return (await runs.run("implement", { agent: "worker", task: "Implement from: " + scan.output })).output;
` }

// Parallel workflow
{ workflowScript: `
  const results = await runs.all([
    { key: "backend", agent: "reviewer", task: "Review backend" },
    { key: "frontend", agent: "reviewer", task: "Review frontend" }
  ]);
  return results.map(result => result.output);
` }
```

## Parameter reference

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `agent` | string | - | Agent target for management actions. Workflow child agents are set inside `runs.run` or `runs.all`. |
| `action` | string | - | Offline workflow `validate`, agent management (including `guide`, `children.list`, and `refine`/`refine.show`/`refine.rollback`), mission (`mission.create/list/show/update/resolve-decision/attach-run/close`), Herdr inspector (`inspector.open/status/close`), Herdr project pane (`project.open/status/close`), status/control, schedule, watchdog, or doctor action. |
| `topic` | `overview \| workflows \| agents \| missions \| observability \| tool-reference \| configuration \| models \| watchdog \| extension-api` | `overview` | Packaged guide topic for `action: "guide"`. |
| `config` | object/string | - | Agent config for management create/update. |
| `context` | `fresh \| fork` | global or per-agent default, else `fresh` | Explicit `fresh` or `fork` overrides every workflow child. When omitted, [`defaultSubagentContext`](configuration.md#defaultsubagentcontext) wins over each agent's `defaultContext`; `"fork"` creates a real branched session when the parent session file and current leaf exist, otherwise it falls back to `fresh`. Packaged `worker`, `oracle`, and `advisor` default to `fork`. |
| `missionId` | string | - | Attach a workflow to an existing project mission instead of creating its default enclosing mission. |
| `mission` | object/false | auto-create | Override the default enclosing mission with `{ title \| summary, objective?, goal?, budget?, labels? }`. Set exactly one non-empty `title` or `summary`; `objective` and `labels` are optional. `goal` may only be `true`, requires `budget.tokens`, and enables continuation notices. Pass `false` for an intentionally ephemeral workflow with no mission for it or its children and no `state` global. Explicit mission persistence failures are strict. |
| `handoffPath` | string | - | Aggregate handoff manifest required by `action: "worktree.discard"`. |
| `focus` | boolean | false | Focus the newly split pane for `action: "inspector.open"` or `action: "project.open"`; not a standalone action. Panes open in the background unless you set `focus: true`. Existing saved project panes can be focused through
```