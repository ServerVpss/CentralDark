# COMANDO - tool-description.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\extension\tool-description.ts
**SHA:** 35dc1c9ece6120b2
**Timestamp:** 2026-08-28T02:24:52.200893
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- • WORKFLOW SCRIPT: { workflowScript: "return runs.run('main', {agent:'worker', task:'...'})" }. Use stable-key runs.run for one child and await runs.all([{key,agent,task}, ...]) for ordinary parallel 
- EXECUTE:
- • SCRIPT {workflowScript:"return runs.run('main', {agent:'worker', task:'...'})"}. Use stable-key runs.run for one child and await runs.all([{key,agent,task}, ...]) for ordinary parallel work. runs.al

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionConfig, ToolDescriptionMode } from "../shared/types.ts";
import { getAgentDir, getProjectConfigDir } from "../shared/utils.ts";

const CUSTOM_TOOL_DESCRIPTION_FILE = "subagent-tool-description.md";
const CUSTOM_TOOL_DESCRIPTION_MAX_BYTES = 50 * 1024;

export const DEFAULT_SUBAGENT_TOOL_DESCRIPTION = `Delegate to configured subagents. For execution, omit action and use {agent, task?} for one child, workflowScript for inline orchestration, or workflowScriptPath to load a script from the request cwd. The script inputs are mutually exclusive. Use action:'validate' with either script input to check it without launching children. For multi-step or parallel work, make exactly one top-level subagent call with async:true; launch children only inside that workflow and do not make another top-level call for them. Use runs.run('key',{agent,task}) for one child, await runs.all([{key:'a',agent:'reviewer',task:'...'},{key:'b',agent:'reviewer',task:'...'}]) for ordinary parallel children, and read its ordered array result with indexes, destructuring, or .map(...), not by key property. Use action only for management/control. Use guide or the pi-subagents skill for advanced workflow details.`;

export const SUBAGENT_TOOL_PROMPT_SNIPPET = "Delegate to subagents; orchestrate in one workflowScript call.";

export const SUBAGENT_TOOL_PROMPT_GUIDELINES = [
	"Use subagent only when delegation is needed. Before executing, call { action: \"list\" } and run only executable, non-disabled agents.",
	"Omit action for execution. Use { agent, task? } only for one child; use workflowScript for multi-step or parallel work.",
	"workflowScript means exactly one top-level subagent tool call with async:true. Inside it, use runs.run/runs.all to launch children; do not make another top-level subagent call for those children.",
	"For ordinary parallel work, use await runs.all([{key,agent,task}, ...]); it resolves to an ordered array, not a key map, so use results[0], destructuring, or results.map(...), not results.<key>. Do not read .output from unawaited runs.run launches. Stored runs.run promises are only for advanced rolling fanout and each must later be observed with direct await, Promise.race, or Promise.all.",
	"Keep one writer per cwd/worktree unless writers run in isolated worktrees.",
	"To pass an explicit model to a child, first call { action: \"models\" } and copy an exact provider/id (e.g. openai-codex/gpt-5.6-sol); bare ids resolve only when unique in the registry, and agent names (gpt-pro, advisor) are not model ids.",
	"Use guide or the pi-subagents skill for advanced scheduling, missions, steering, and retention.",
];

export const SUBAGENT_SAFETY_GUIDANCE = `SAFETY-CRITICAL SUBAGENT GUIDANCE:
• Use { action: "list" } before execution and only run executable/non-disabled agents.
• Keep execution and management separate: omit action for structured single-child or workflowScript execution; use action only for management/control.
• Async/background runs are the normal default unless config sets asyncByDefault:false; set async:true explicitly when async behavior matters. Use async:false only when the parent must block until completion. Async mode still shows progress. Final reviews and gate checks stay async; needing a result is not a blocking reason. After an async launch, continue independent work only until its next dependency barrier; consume the result before work that depends on it. Do not sleep or poll status just to wait; use subagent_wait only when the current request must finish in this turn.
• Ordinary child subagents are not orchestrators. Only explicitly configured fanout children may use the child-safe subagent tool, still bounded by depth/session limits.
• Oracle/advisor consultations should use supervisor dialogue for material unknowns when available; request one-shot only when desired.
• Keep one writer for the same cwd/worktree. Use fresh-context read-only reviewers for independent review, then have the parent synthesize and apply fixes.
• Async runs expose asyncId/asyncDir with status.json, events.jsonl, output logs, status via { action: "status", id }, and lifecycle diagnostics via { action: "debug.run", id }. Include output paths and residual risks when reporting results.`;

export const FULL_SUBAGENT_TOOL_DESCRIPTION = `Run one child with { agent, task? }; use { workflowScript } for inline orchestration or { workflowScriptPath } to load it from the request cwd. The script inputs are mutually exclusive. Omit action for execution. Use action only for management/control actions.

EXECUTION:
• Before executing, use { action: "list" } and run only executable/non-disabled configured agents.
• When passing an explicit model to a child (on the call or a runs.run/runs.all item), first call { action: "models" } and copy an exact provider/id; bare ids resolve only when unique in the registry, and agent names (e.g. gpt-pro, advisor) are n
```