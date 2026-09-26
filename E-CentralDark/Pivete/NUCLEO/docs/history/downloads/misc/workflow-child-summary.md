# OUTRO - workflow-child-summary.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\workflows\workflow-child-summary.ts
**SHA:** d0a43d79b326cb21
**Timestamp:** 2026-08-28T02:25:00.296703
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

### Ouro Bruto (primeiros 5000 chars)
```
import type { AsyncStatus, WorkflowChildSummaryV1 } from "../shared/types.ts";
import type { WorkflowScriptChildResult, WorkflowScriptTraceEntry } from "./scripted-workflow.ts";

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const TERMINAL_STATES = new Set(["completed", "failed", "paused", "stopped", "rejected", "detached"]);

function bounded(value: unknown, maxBytes: number): string | undefined {
	if (typeof value !== "string" || !value.trim() || Buffer.byteLength(value, "utf8") > maxBytes) return undefined;
	return value;
}

function requiredId(value: string, label: string): string {
	const id = bounded(value, 256);
	if (!id) throw new Error(`${label} must be a non-empty identifier of at most 256 UTF-8 bytes.`);
	return id;
}

export function workflowChildSummary(input: {
	parentToolCallId: string;
	workflowRunId: string;
	workflowState: WorkflowChildSummaryV1["workflowState"];
	inventoryComplete: boolean;
	trace?: WorkflowScriptTraceEntry[];
	children?: WorkflowScriptChildResult[];
	steps?: NonNullable<AsyncStatus["steps"]>;
}): WorkflowChildSummaryV1 {
	const rows = new Map<string, WorkflowChildSummaryV1["children"][number]>();
	for (const entry of input.trace ?? []) {
		if (entry.operation !== "run" || !KEY_PATTERN.test(entry.key)) continue;
		const previous = rows.get(entry.key);
		const state = entry.state === "completed" ? "completed"
			: entry.state === "failed" ? "failed"
				: entry.state === "stopped" ? "stopped"
					: entry.state === "detached" ? "detached"
						: previous?.state ?? "running";
		rows.set(entry.key, {
			childId: entry.key,
			state,
			...(bounded(entry.runId, 256) ? { runId: bounded(entry.runId, 256) } : {}),
			...(previous?.agent ? { agent: previous.agent } : {}),
			...(previous?.model ? { model: previous.model } : {}),
			...(previous?.thinking ? { thinking: previous.thinking } : {}),
		});
	}
	for (const step of input.steps ?? []) {
		const key = step.workflowKey;
		if (!key || !KEY_PATTERN.test(key)) continue;
		const state = step.status === "complete" || step.status === "completed" ? "completed"
			: step.status === "failed" ? "failed"
				: step.status === "paused" ? "paused"
					: step.status === "stopped" ? "stopped"
						: step.status === "rejected" ? "rejected"
							: step.status === "pending" ? "pending" : "running";
		const launchResolved = step.async !== undefined || step.sessionFile !== undefined || step.runId !== undefined || step.model !== undefined;
		rows.set(key, {
			childId: key,
			state,
			...(bounded(step.runId, 256) ? { runId: bounded(step.runId, 256) } : {}),
			...(launchResolved && bounded(step.agent, 256) ? { agent: bounded(step.agent, 256) } : {}),
			...(bounded(step.model, 256) ? { model: bounded(step.model, 256) } : {}),
			...(bounded(step.thinking, 32) ? { thinking: bounded(step.thinking, 32) } : {}),
		});
	}
	for (const child of input.children ?? []) {
		if (!KEY_PATTERN.test(child.key)) continue;
		const result = Array.isArray(child.results) ? child.results.find((value) => value && typeof value === "object") as Record<string, unknown> | undefined : undefined;
		const state = child.detached ? "detached" : child.stopped ? "stopped" : child.interrupted ? "paused" : child.ok ? "completed" : result?.acceptance && typeof result.acceptance === "object" && (result.acceptance as { status?: unknown }).status === "rejected" ? "rejected" : "failed";
		rows.set(child.key, {
			childId: child.key,
			state,
			...(bounded(child.runId, 256) ? { runId: bounded(child.runId, 256) } : {}),
			...(bounded(child.agent, 256) ? { agent: bounded(child.agent, 256) } : {}),
			...(bounded(result?.model, 256) ? { model: bounded(result?.model, 256) } : {}),
			...(bounded(result?.thinking, 32) ? { thinking: bounded(result?.thinking, 32) } : {}),
		});
	}
	if (input.inventoryComplete) {
		for (const [key, row] of rows) {
			if (!TERMINAL_STATES.has(row.state)) rows.set(key, { ...row, state: input.workflowState === "stopped" ? "stopped" : "failed" });
		}
	}
	return {
		version: 1,
		parentToolCallId: requiredId(input.parentToolCallId, "parentToolCallId"),
		workflowRunId: requiredId(input.workflowRunId, "workflowRunId"),
		inventoryComplete: input.inventoryComplete,
		workflowState: input.workflowState,
		children: [...rows.values()],
	};
}

export function parseWorkflowChildSummary(value: unknown): WorkflowChildSummaryV1 | undefined {
	if (value === undefined) return undefined;
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("workflowChildren must be an object.");
	const input = value as Record<string, unknown>;
	const allowed = new Set(["version", "parentToolCallId", "workflowRunId", "inventoryComplete", "workflowState", "children"]);
	if (Object.keys(input).some((key) => !allowed.has(key))) throw new Error("workflowChildren has unsupported fields.");
	if (input.version !== 1 || typeof input.inventoryComplete !== "boolean" || !Array.isArray(input.children)) throw new Error("workflowChildren is invalid.");
	con
```