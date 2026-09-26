# COMANDO - herdr-status.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\integrations\herdr-status.ts
**SHA:** 7e7d37a4584a78b0
**Timestamp:** 2026-08-28T02:24:52.353834
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = startedRun(data);

### Ouro Bruto (primeiros 5000 chars)
```
import {
	SUBAGENT_ASYNC_COMPLETE_EVENT,
	SUBAGENT_ASYNC_STARTED_EVENT,
	SUBAGENT_CONTROL_EVENT,
} from "../shared/types.ts";
import { previewDisplayText, sanitizeDisplayText } from "../shared/display-text.ts";

const DEFAULT_SOURCE = "pi-subagents:herdr";
const DEFAULT_TTL_MS = 120_000;
const DEFAULT_REFRESH_MS = 45_000;
const MAX_TASK_LABEL_CHARS = 80;
const MAX_TITLE_TASK_CHARS = 42;
const MAX_WORKFLOW_LABEL_NODES = 128;
const MAX_WORKFLOW_LABEL_DEPTH = 8;

let metadataReportSeq = Date.now() * 1000;

function nextMetadataReportSeq(): number {
	metadataReportSeq = Math.max(metadataReportSeq + 1, Date.now() * 1000);
	return metadataReportSeq;
}

export interface HerdrStatusBridgeEvents {
	on(event: string, handler: (data: unknown) => void): (() => void) | void;
	emit(event: string, data: unknown): void;
}

export interface HerdrStatusRun {
	id: string;
	agent?: string;
	agents?: string[];
	/** Explicit launch/workflow label only; raw prompts never enter pane metadata. */
	taskLabel?: string;
	needsAttention?: boolean;
	attentionLabel?: string;
}

export interface HerdrStatusBridgeOptions {
	events: HerdrStatusBridgeEvents;
	env?: Record<string, string | undefined>;
	/** Current authoritative active-run projection, used before TTL refresh. */
	getRuns?: () => Iterable<HerdrStatusRun>;
	/** Current project panes opened by this Pi session. Views are excluded. */
	getProjectPaneCount?: () => number;
	runHerdr: (args: readonly string[]) => void | Promise<void>;
	ttlMs?: number;
	refreshMs?: number;
	timers?: {
		setInterval: typeof setInterval;
		clearInterval: typeof clearInterval;
	};
}

export interface HerdrStatusBridge {
	/**
	 * Binds the pane owner. Only the root interactive session may publish pane
	 * metadata: headless parents (print/json), non-UI harnesses, and child
	 * runtimes must never fight the pane's lifecycle authority over display
	 * state. Also re-syncs runs that survived a reload/resume.
	 */
	sessionStarted(input: { hasUI: boolean; runs: Iterable<HerdrStatusRun> }): void;
	agentStarted(): void;
	flush(): Promise<void>;
	dispose(): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedTaskLabel(value: unknown, maxChars = MAX_TASK_LABEL_CHARS): string | undefined {
	if (typeof value !== "string") return undefined;
	const normalized = sanitizeDisplayText(value).trim();
	if (!normalized) return undefined;
	return previewDisplayText(normalized, maxChars);
}

function workflowTaskLabel(data: Record<string, unknown>): string | undefined {
	const explicit = boundedTaskLabel(data.taskLabel);
	if (explicit) return explicit;
	if (!isRecord(data.workflowGraph) || !Array.isArray(data.workflowGraph.nodes)) return undefined;
	const currentNodeId = typeof data.workflowGraph.currentNodeId === "string" ? data.workflowGraph.currentNodeId : undefined;
	const nodes: Record<string, unknown>[] = [];
	const collect = (values: unknown[], depth: number): void => {
		if (depth > MAX_WORKFLOW_LABEL_DEPTH || nodes.length >= MAX_WORKFLOW_LABEL_NODES) return;
		for (const value of values) {
			if (nodes.length >= MAX_WORKFLOW_LABEL_NODES) return;
			if (!isRecord(value)) continue;
			nodes.push(value);
			if (Array.isArray(value.children)) collect(value.children, depth + 1);
		}
	};
	collect(data.workflowGraph.nodes, 0);
	const current = currentNodeId ? nodes.find((node) => node.id === currentNodeId) : undefined;
	const active = current ?? nodes.find((node) => node.status === "running") ?? nodes.find((node) => node.status === "pending");
	return boundedTaskLabel(active?.label);
}

function startedRun(data: unknown): HerdrStatusRun | undefined {
	if (!isRecord(data) || typeof data.id !== "string" || !data.id) return undefined;
	const taskLabel = workflowTaskLabel(data);
	return {
		id: data.id,
		...(typeof data.agent === "string" ? { agent: data.agent } : {}),
		...(Array.isArray(data.agents) && data.agents.every((agent) => typeof agent === "string") ? { agents: data.agents as string[] } : {}),
		...(taskLabel ? { taskLabel } : {}),
	};
}

function completedRunId(data: unknown): string | undefined {
	if (!isRecord(data)) return undefined;
	const id = typeof data.runId === "string" ? data.runId : data.id;
	return typeof id === "string" && id.length > 0 ? id : undefined;
}

function attentionNotice(data: unknown): { runId: string; label: string } | undefined {
	if (!isRecord(data) || data.source !== "async" || !isRecord(data.event)) return undefined;
	if (data.event.type !== "needs_attention" || typeof data.event.runId !== "string" || !data.event.runId) return undefined;
	const label = typeof data.noticeText === "string" && data.noticeText
		? data.noticeText
		: typeof data.event.message === "string" && data.event.message
			? data.event.message
			: "subagent needs attention";
	return { runId: data.event.runId, label };
}

export function registerHerdrStatusBridge(options: HerdrStatusBridgeOptions)
```