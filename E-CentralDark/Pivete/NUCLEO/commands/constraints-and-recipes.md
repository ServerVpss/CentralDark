# COMANDO - constraints-and-recipes.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\skills\pi-subagents\references\constraints-and-recipes.md
**SHA:** 544f36c433151c64
**Timestamp:** 2026-08-28T02:24:50.830860
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Before fanout, assign each child a lightweight task profile in the parent prompt:

### Contratos
- 1. **Understand** — use `scout` fanout for breadth, but the parent personally reads the load-bearing files and lets direct source reading decide disagreements. Gate: the parent can quote the exact cod
- 2. **Decide** — separate user-owned decisions from implementation judgments. Use `interview` for product, naming, cost, taste, risk, release, merge, or authority decisions; decide routine engineering 
- 3. **Design** — use read-only design/review children for parallel perspectives. Before parallel workstreams, write seam contracts: ownership boundaries, composition points, assumptions, and validation
- 4. **Implement** — capture a baseline first, then launch one async `worker` as the sole writer for the active worktree unless isolated worktrees were intentionally requested. For cross-codebase work, 
- 5. **Verify** — climb the spend ladder: static checks, free end-to-end/dry-run, cheapest live probe, targeted changed-path live test, then full realistic run when warranted. Observe the artifact itsel
- 6. **Iterate** — when a gate or reviewer finds a defect, the parent names the failure class, searches for siblings, synthesizes fixes, and sends exactly one fix worker for accepted changes. For LLM ju
- 7. **Ship** — run adversarial fresh-context review/validation outside the implementation path, disposition every finding, rerun affected gates, then have the parent inspect the final diff. Commit, pus
- For one host-run verification command, `gate: "npm test"` on the child is shorthand for verified acceptance with that command; it cannot be combined with `acceptance` and is rejected on retained resum
- task: "Implement the approved feature.\n\nClarified requirements:\n- ...\n\nPlan: see ~/Documents/docs/...-plan.md\n\nValidation contract:\n- ...\n\nReturn a handoff with changed files, what was imple

### Ouro Bruto (primeiros 5000 chars)
```
# Pi Subagents: Constraints And Recipes

This file is a detailed reference loaded from `skills/pi-subagents/SKILL.md`.

## Important Constraints

- **Explicit forking requires a persisted parent session.** If the current session
  does not have a persisted session file or current leaf, explicit `context: "fork"`
  fails. An agent-level `defaultContext: fork` is a preference: packaged `worker`,
  `oracle`, and `advisor` fall back to `fresh` when those fork preconditions are not
  met yet. Use `context: "fresh"` when you do not want a fork even after the parent
  session exists.
- **Forked runs inherit parent history.** They are branched threads, not fresh
  filtered contexts. Use fresh context for adversarial reviewers unless the user explicitly asks for forked context.
- **Default subagent nesting depth is 2.** Deeper recursive delegation is blocked
  unless configured otherwise.
- **Attention signals are not lifecycle state.** `needs_attention` means no activity has been observed past the configured threshold. `paused` means the child turn was intentionally interrupted or is awaiting direction; it is not the same as `failed`.
- **Intercom asks are blocking.** A session can only maintain one pending outbound
  ask wait state at a time.
- **Keep conversational authority clear.** Advisory subagents should not silently
  become second decision-makers.
- **Respect the fixed authority policy.** `authorityPolicy` is a small `auto` / `confirm` / `forbid` map for supported operational actions. Worktree discard, destructive cleanup, and spawn-budget grants default to confirmation; stop, steer, and schedule creation remain automatic. Use `worktree.discard` with the durable `handoffPath`; confirm-required actions refuse safely without an interactive UI and retained paths include manual Git recovery commands.

Runtime config can change orchestration behavior. `intercomBridge.resultDelivery: false` disables only external acknowledged grouped-result delivery when native parent notifications own completion; supervisor asks/progress stay active, and enabled transport failures are still reported. `asyncByDefault` and `forceTopLevelAsync` affect whether launches detach; `waitTool` can make direct `subagent_wait()` calls return immediately while headless auto-drain remains active, and its effective value is propagated to child runtimes; `globalConcurrencyLimit` bounds concurrent fanout, while a positive `maxSubagentSpawnsPerSession` optionally caps cumulative launches (`0` or unset is unlimited). Status and doctor report the budget; static work preflights declared capacity; only the settled root interactive parent can use `grant-spawn-budget` after native confirmation, with total grants bounded by the original cap. Compaction does not reset usage or grants; `singleRunOutputBaseDir` and `worktreeBaseDir` route outputs and worktrees; `completionBatch` groups async notifications. `artifactDir` is `session` (default), `project`, or `temp` and chooses where subagent artifacts are stored. Set `asyncWidget: false` to hide the above-editor background-run widget when a companion footer or dashboard owns that space (fleet inspector remains available). Per-run `artifacts: false` disables artifact capture for that launch. Async status and result artifacts include `lifecycleArtifactVersion` and fields such as `workflowGraph`, `steps`, `results`, `totalTokens`, `totalCost`, `turnCount`, `toolCount`, and nested `children`. Child protocol failures expose a structured `protocolError`; `protocol_output_limit` means a child emitted a JSONL line above the 16 MiB live-parser cap. Prefer these artifacts and `status` views over scraping terminal output.

### Keep report artifacts out of the repository root

Treat lane reports, review notes, council pass reports, and gate logs as scratch unless the user explicitly asks to keep them. Prefer `output: false` and the aggregate workflow result for short reports. When a later step needs a file, use the runtime-managed output artifact by setting a stable child key plus a relative `output` path such as `plans/deploy.md`; relative child outputs are saved under the run artifact directory, not the project root. Do not put `reports/...`, `*-report.json`, or similar repo-root paths in child task text.

For durable evidence, copy only the final summary to session memory, a PR body/comment, a mission artifact, or a user-approved docs path outside the repo. After the PR, issue, or gate reaches a terminal state, delete or move scratch reports from the active worktree before reporting completion. Keep a project `.gitignore` entry for ad-hoc report patterns only as a safety net; it is not the cleanup mechanism.

## Best Practices

### Prefer async orchestration

Launch every subagent asynchronously by default. Use `async: true` for scouts, researchers, workers, reviewers, validators, oracle checks, one-off delegates, and scripted workflows unless you intentionally need a foreground/blocking run. Launch all execution t
```