# COMANDO - fleet.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\tui\fleet.ts
**SHA:** c2eca26338cb67d3
**Timestamp:** 2026-08-28T02:24:59.672604
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- | { key: string; kind: "foreground-recent"; runId: string; index: number; agent: string; state: ForegroundResumeChild["status"]; updatedAt: number; run: ForegroundResumeRun; child: ForegroundResumeChi
- | { key: string; kind: "async"; runId: string; index?: number; agent: string; state: string; updatedAt: number; run: AsyncRunSummary; step?: AsyncStep }
- | { key: string; kind: "external"; runId: string; agent: string; state: ExternalRun["state"]; updatedAt: number; run: ExternalRun }
- function asyncItems(run: AsyncRunSummary, description?: string): FleetItem[] {
- const updatedAt = (run: AsyncRunSummary) => run.lastUpdate ?? run.endedAt ?? run.startedAt;
- const prompt = getLivePromptAudit(item.control, item.index ?? 0);
- function promptAuditText(prompt: LivePromptAudit, view: PromptAuditView): string {
- `Run: ${item.runId}`,
- `Run: ${item.runId}`,
- function externalElapsedEnd(run: ExternalRun): number {

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import { getMarkdownTheme, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { matchesKey, truncateToWidth, visibleWidth, wrapTextWithAnsi, type Component, type MarkdownTheme } from "@earendil-works/pi-tui";
import { snapshotExternalRuns, type ExternalRun } from "../api/external-runs.ts";
import { getArtifactPaths, getArtifactsDir } from "../shared/artifacts.ts";
import { formatDuration, formatModelThinking, formatTokens, formatTokenUsage, shortenPath } from "../shared/formatters.ts";
import { DIRS, type AsyncJobState, type AsyncJobStep, type Details, type FleetKeybindingAction, type FleetKeybindingsConfig, type ForegroundChildControl, type ForegroundResumeChild, type ForegroundResumeRun, type ForegroundRunControl, type SubagentState } from "../shared/types.ts";
import { decodeUtf8Tail } from "../shared/utf8.ts";
import { readStatus } from "../shared/utils.ts";
import { formatAsyncRunTranscript } from "../runs/background/fleet-view.ts";
import { listAsyncRuns, type AsyncRunSummary } from "../runs/background/async-status.ts";
import { steerAsyncRun } from "../runs/foreground/async-steering-action.ts";
import type { SteerDeliveryMode } from "../runs/background/control-channel.ts";
import { stopAsyncRun } from "../runs/foreground/async-stop-action.ts";
import { resolveWorkflowForegroundSteeringTarget, steerWorkflowForegroundTarget } from "../runs/foreground/workflow-foreground-steering.ts";
import { contextModeBadge, contextModeLabel } from "../runs/shared/context-mode.ts";
import { FLEET_STATUS_WIDGET_KEY } from "./fleet-status.ts";
import { readFleetTranscript, renderFleetTranscript, type FleetTranscript } from "./fleet-transcript.ts";
import { handleHerdrInspectorAction } from "../inspectors/herdr/actions.ts";
import type { HerdrClient } from "../inspectors/herdr/client.ts";
import { getLivePromptAudit, type LivePromptAudit, type PromptAuditView } from "../runs/foreground/prompt-audit.ts";

const REFRESH_MS = 750;
const MIN_REFRESH_MS = 250;
const MAX_RECENT_ASYNC_RUNS = 20;
const MAX_FLEET_HISTORY_CANDIDATES = 100;
const TRANSCRIPT_LINES = 200;
const OUTPUT_TAIL_BYTES = 64 * 1024;
const PROMPT_AUDIT_SUMMARY_WIDTH = 160;

export const DEFAULT_FLEET_KEYBINDINGS: Record<FleetKeybindingAction, string[]> = {
	close: ["escape", "ctrl+c", "q"],
	scrollUp: ["K"],
	scrollDown: ["J"],
	selectUp: ["up", "k"],
	selectDown: ["down", "j"],
	selectFirst: ["home"],
	selectLast: ["end"],
	pageUp: ["pageUp"],
	pageDown: ["pageDown"],
	refresh: ["r", "R"],
	steer: ["s"],
	inspect: ["H"],
	stop: ["D"],
	toggleTools: ["x", "X", "ctrl+o"],
};

type ResolvedFleetKeybindings = Record<FleetKeybindingAction, string[]>;

export function resolveFleetKeybindings(config: FleetKeybindingsConfig | undefined): ResolvedFleetKeybindings {
	return Object.fromEntries(
		Object.entries(DEFAULT_FLEET_KEYBINDINGS).map(([action, defaults]) => [action, config?.[action as FleetKeybindingAction] ?? defaults]),
	) as ResolvedFleetKeybindings;
}

function matchesFleetBinding(data: string, binding: string): boolean {
	const key = /^[A-Z]$/.test(binding) ? `shift+${binding.toLowerCase()}` : binding;
	return matchesKey(data, key as Parameters<typeof matchesKey>[1]);
}

function matchesFleetAction(data: string, bindings: ResolvedFleetKeybindings, action: FleetKeybindingAction): boolean {
	return bindings[action].some((binding) => matchesFleetBinding(data, binding));
}

function bindingLabel(bindings: ResolvedFleetKeybindings, action: FleetKeybindingAction): string {
	return bindings[action]
		.map((binding) => binding === "up" ? "↑" : binding === "down" ? "↓" : binding === "escape" ? "Esc" : binding === "return" ? "Enter" : binding)
		.join("/");
}

type Theme = ExtensionContext["ui"]["theme"];
type FleetTui = {
	terminal?: { rows: number };
	requestRender(): void;
};
type AsyncStep = AsyncRunSummary["steps"][number];

export type FleetItem = (
	| { key: string; kind: "foreground-active"; runId: string; index?: number; agent: string; state: "running"; updatedAt: number; control: ForegroundRunControl; activeChild?: ForegroundChildControl }
	| { key: string; kind: "foreground-recent"; runId: string; index: number; agent: string; state: ForegroundResumeChild["status"]; updatedAt: number; run: ForegroundResumeRun; child: ForegroundResumeChild }
	| { key: string; kind: "async"; runId: string; index?: number; agent: string; state: string; updatedAt: number; run: AsyncRunSummary; step?: AsyncStep }
	| { key: string; kind: "external"; runId: string; agent: string; state: ExternalRun["state"]; updatedAt: number; run: ExternalRun }
) & { description?: string };

export interface FleetSnapshot {
	items: FleetItem[];
	error?: string;
}

export interface FleetActionResult {
	text: string;
	isError?: boolean;
}

export interface FleetActionHandlers {
	steer(input: { runId: string; asyncDir: string; index?: number; 
```