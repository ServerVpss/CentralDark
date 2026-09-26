# CONTRATO - async-status.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\async-status.ts
**SHA:** accbb67fe96921ff
**Timestamp:** 2026-08-28T02:24:53.220662
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export function formatAsyncRunOutputPath(run: Pick<AsyncRunSummary, "asyncDir" | "outputFile">): string | undefined {
- export function formatAsyncRunProgressLabel(run: Pick<AsyncRunSummary, "mode" | "state" | "currentStep" | "chainStepCount" | "parallelGroups" | "steps">): string {
- function formatRunHeader(run: AsyncRunSummary): string {

### Contratos
- ...(step.agentContract ? { agentContract: step.agentContract } : {}),

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { formatDuration, formatModelThinking, formatTokens, shortenPath } from "../../shared/formatters.ts";
import { formatActivityLabel, formatParallelOutcome } from "../../shared/status-format.ts";
import { type ActivityState, type AsyncJobStep, type AsyncParallelGroupStatus, type AsyncStatus, type CostSummary, type Details, type LaunchResolvedChildExtensionsV1, type RuntimeAcknowledgedChildExtensionsV1, type NestedRunSummary, type SteeringStatus, type SubagentRunMode, type TokenUsage, type TurnBudgetState, type UsageBudgetState } from "../../shared/types.ts";
import type { ResolvedSubagentCapabilityCeiling, SubagentCapabilityAudit } from "../shared/capability-ceiling.ts";
import { readStatus } from "../../shared/utils.ts";
import { attachRootChildrenToSteps, buildNestedRouteIndex, findNestedRouteForRootId, type NestedRoute, projectNestedEvents } from "../shared/nested-events.ts";
import { formatNestedRunStatusLines } from "../shared/nested-render.ts";
import { formatRunFanoutBudget, getRunFanoutBudgetSnapshot, readRunFanoutBudgetDescriptor } from "../shared/run-fanout-budget.ts";
import { flatToLogicalStepIndex, normalizeParallelGroups } from "./parallel-groups.ts";
import { contextModeLabel, summarizeContextModes, type ContextMode, type ContextSummary } from "../shared/context-mode.ts";
import { reconcileAsyncRun, reconcileNestedAsyncDescendants } from "./stale-run-reconciler.ts";
import { readProcessTerminal, sanitizeProcessTerminal } from "./process-terminal.ts";
import { ACTIVE_RUN_INDEX_DIR, DEFAULT_STALE_TERMINAL_ACTIVE_MARKER_MS, activeRunMarkerAgeMs, isActiveAsyncState, readActiveRunIndex, releaseActiveRunIndex, updateActiveRunIndex } from "./active-run-index.ts";
import { readRecentTerminalRunIndex, TERMINAL_RUN_INDEX_DIR } from "./terminal-run-index.ts";
import { canScanAsyncRunPrefix } from "./run-id-query.ts";
import { asyncStatusChildIdentity } from "../shared/child-identity.ts";
import { parseWorkflowChildSummary } from "../../workflows/workflow-child-summary.ts";

interface AsyncRunStepSummary {
	index: number;
	childId?: string;
	agent: string;
	context?: ContextMode;
	label?: string;
	description?: string;
	phase?: string;
	workflowKey?: string;
	runId?: string;
	outputName?: string;
	structured?: boolean;
	status: AsyncJobStep["status"];
	runner?: AsyncJobStep["runner"];
	activityState?: ActivityState;
	lastActivityAt?: number;
	currentTool?: string;
	currentToolArgs?: string;
	currentToolStartedAt?: number;
	currentPath?: string;
	recentTools?: Array<{ tool: string; args: string; endMs: number }>;
	recentOutput?: string[];
	turnCount?: number;
	toolCount?: number;
	steering?: SteeringStatus;
	durationMs?: number;
	tokens?: TokenUsage;
	totalCost?: CostSummary;
	skills?: string[];
	model?: string;
	thinking?: string;
	attemptedModels?: string[];
	sessionFile?: string;
	transcriptPath?: string;
	error?: string;
	timedOut?: boolean;
	stopped?: boolean;
	turnBudget?: TurnBudgetState;
	turnBudgetExceeded?: boolean;
	wrapUpRequested?: boolean;
	acceptance?: AsyncJobStep["acceptance"];
	agentContract?: AsyncJobStep["agentContract"];
	execution?: AsyncJobStep["execution"];
	review?: AsyncJobStep["review"];
	effects?: AsyncJobStep["effects"];
	processTerminal?: AsyncJobStep["processTerminal"];
	launchResolvedExtensions?: LaunchResolvedChildExtensionsV1;
	runtimeAcknowledgedExtensions?: RuntimeAcknowledgedChildExtensionsV1;
	capabilityCeiling?: ResolvedSubagentCapabilityCeiling;
	capabilityAudit?: SubagentCapabilityAudit;
	children?: NestedRunSummary[];
}

export interface AsyncRunSummary {
	id: string;
	asyncDir: string;
	toolCallId?: string;
	sessionId?: string;
	state: "queued" | "running" | "complete" | "failed" | "paused" | "stopped" | "rejected";
	error?: string;
	activityState?: ActivityState;
	lastActivityAt?: number;
	currentTool?: string;
	currentToolStartedAt?: number;
	currentPath?: string;
	turnCount?: number;
	toolCount?: number;
	steering?: SteeringStatus;
	mode: SubagentRunMode;
	context?: ContextSummary;
	cwd?: string;
	sessionRoot?: string;
	startedAt: number;
	lastUpdate?: number;
	endedAt?: number;
	timeoutMs?: number;
	deadlineAt?: number;
	timedOut?: boolean;
	stopped?: boolean;
	turnBudget?: TurnBudgetState;
	turnBudgetExceeded?: boolean;
	wrapUpRequested?: boolean;
	currentStep?: number;
	chainStepCount?: number;
	pendingAppends?: number;
	parallelGroups?: AsyncParallelGroupStatus[];
	steps: AsyncRunStepSummary[];
	sessionDir?: string;
	outputFile?: string;
	totalTokens?: TokenUsage;
	totalCost?: CostSummary;
	usageBudget?: UsageBudgetState;
	sessionFile?: string;
	nestedChildren?: NestedRunSummary[];
	nestedWarnings?: string[];
	processTerminal?: AsyncStatus["processTerminal"];
	runFanoutBudget?: AsyncStatus["runFanoutBudget"];
	launchResolvedExtensions?: LaunchResolvedChildExtensionsV1;
	runtimeAcknowledgedExtensions?: RuntimeAcknowledgedChildExtensionsV1;
	capabilityCeiling?: ResolvedSubagentCapabilityC
```