# COMANDO - fleet-status.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\tui\fleet-status.ts
**SHA:** 30e5d5dc7c7b69fe
**Timestamp:** 2026-08-28T02:24:59.618078
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- function nestedRunLabel(run: NestedRunSummary): string {
- function nestedStepDisplayCount(steps: NestedStepSummary[] | undefined, start = 0): number {
- function nestedDisplayCount(children: NestedRunSummary[] | undefined, start = 0): number {
- const start = selectedTreeIndex < visibleCount ? 0 : selectedTreeIndex - visibleCount + 1;

### Gaps
- const gap = Math.max(1, width - visibleWidth(leftClamped) - rightWidth);

### Ouro Bruto (primeiros 5000 chars)
```
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { type EditorComponent, isKeyRelease, Key, matchesKey, truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { snapshotExternalRuns } from "../api/external-runs.ts";
import { formatModelThinking } from "../shared/formatters.ts";
import type { AsyncJobState, AsyncJobStep, FleetViewPlacement, HerdrProjectPaneSnapshot, NestedRunSummary, NestedStepSummary, SubagentState } from "../shared/types.ts";
import { formatWorkflowJsonPreview } from "../workflows/scripted-workflow.ts";

export const FLEET_STATUS_WIDGET_KEY = "subagent-fleet-status";

// Six rows fit the accepted collapsed hierarchy: one owner, four visible descendants, and overflow.
const MAX_AGENT_ROWS = 6;
const REFRESH_MS = 500;

type Theme = ExtensionContext["ui"]["theme"];
type FleetStatusTui = {
	requestRender(): void;
};
type FleetStatusEntry = {
	key: string;
	surface?: "project-pane";
	parentKey?: string;
	workflowWrapper?: boolean;
	agent: string;
	modelThinking?: string;
	description?: string;
	startedAt: number;
	tokens: number;
	window?: number;
	state: string;
	external?: true;
	projectPane?: HerdrProjectPaneSnapshot;
	nestedChildren?: NestedRunSummary[];
	workflowRows?: FleetWorkflowRow[];
};

type FleetWorkflowRow = {
	name: string;
	state: AsyncJobStep["status"];
	modelThinking?: string;
	activity?: string;
	startedAt?: number;
	tokens?: number;
	window?: number;
	overflow?: number;
};

type FleetNestedRow = {
	name: string;
	state: NestedRunSummary["state"] | NestedStepSummary["status"];
	modelThinking?: string;
	activity?: string;
	startedAt?: number;
	depth: number;
	overflow?: number;
};

type FleetTreeRow =
	| { kind: "owner"; entry: FleetStatusEntry }
	| { kind: "child"; entry: FleetStatusEntry; last: boolean }
	| { kind: "workflow"; ownerKey: string; row: FleetWorkflowRow; last: boolean }
	| { kind: "nested"; ownerKey: string; row: FleetNestedRow; last: boolean };

export interface FleetStatusOptions {
	refreshMs?: number;
	maxAgentRows?: number;
	placement?: FleetViewPlacement;
}

export function resolveFleetViewPlacement(value: unknown): FleetViewPlacement {
	return value === "aboveEditor" ? "aboveEditor" : "belowEditor";
}

export function formatFleetElapsed(ms: number): string {
	return `${Math.max(0, Math.round(ms / 1000))}s`;
}

export function formatFleetTokens(count: number, window?: number): string {
	const compact = (value: number): string => value >= 1_000_000
		? `${(value / 1_000_000).toFixed(1)}M`
		: value >= 1_000
			? `${(value / 1_000).toFixed(1)}k`
			: `${Math.max(0, Math.round(value))}`;
	return window !== undefined
		? `↓ ${compact(window)} window · ${compact(count)} spent`
		: `↓ ${compact(count)} tokens`;
}

function rightAlign(left: string, right: string, width: number): string {
	const rightWidth = visibleWidth(right);
	const maxLeftWidth = Math.max(0, width - rightWidth - 1);
	const leftClamped = truncateToWidth(left, maxLeftWidth);
	const gap = Math.max(1, width - visibleWidth(leftClamped) - rightWidth);
	return truncateToWidth(`${leftClamped}${" ".repeat(gap)}${right}`, width);
}

function isActiveState(value: string): boolean {
	return value === "running" || value === "queued" || value === "pending";
}

function nestedRunLabel(run: NestedRunSummary): string {
	if (run.agent) return run.agent;
	if (run.agents?.length) return run.agents.length === 1 ? run.agents[0]! : `${run.agents.slice(0, 2).join(", ")}${run.agents.length > 2 ? ` +${run.agents.length - 2}` : ""}`;
	return run.id;
}

function nestedActivity(node: NestedRunSummary | NestedStepSummary): string | undefined {
	if (node.currentTool) return `tool ${node.currentTool}`;
	if (node.currentPath) return node.currentPath.split(/[\\/]/).at(-1);
	if (node.activityState === "needs_attention") return "needs attention";
	if (node.activityState === "active_long_running") return "long-running";
	return undefined;
}

function workflowStepActivity(step: AsyncJobStep): string | undefined {
	if (step.currentTool) return `tool ${step.currentTool}`;
	if (step.currentPath) return step.currentPath.split(/[\\/]/).at(-1);
	if (step.activityState === "needs_attention") return "needs attention";
	if (step.activityState === "active_long_running") return "long-running";
	if (step.turnCount !== undefined) return `${step.turnCount} turns`;
	if (step.toolCount !== undefined) return `${step.toolCount} tools`;
	return undefined;
}

function workflowStepName(step: AsyncJobStep, index: number): string {
	const key = step.workflowKey ?? `step ${index + 1}`;
	const label = step.label && step.label !== key ? ` · ${step.label}` : "";
	const phase = step.phase ? `${step.phase}: ` : "";
	return `${phase}${key}${label} (${step.agent})`;
}

function workflowFleetRows(steps: AsyncJobStep[] | undefined): FleetWorkflowRow[] {
	return (steps ?? []).map((step, index) => {
		const modelThinking = formatModelThinking(step.model, step.thinking) || undefined;
		const activity = workflowStepActivity
```