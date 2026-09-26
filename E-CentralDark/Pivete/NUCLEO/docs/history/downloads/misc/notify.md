# OUTRO - notify.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\notify.ts
**SHA:** 32b76e0ab937da7f
**Timestamp:** 2026-08-28T02:24:53.390489
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- details.workflowRunId ? `Workflow run: ${details.workflowRunId}` : undefined,
- const workflowRunIndex = body.findIndex((line) => line.startsWith("Workflow run: "));
- const workflowRunId = workflowRunIndex >= 0 ? body[workflowRunIndex]!.slice("Workflow run: ".length).trim() : undefined;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Completion notification delivery.
 *
 * Async result files call this notifier directly and are deleted only after
 * `sendMessage()` accepts the notification. The event bus remains an
 * observation channel, not a delivery acknowledgement.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { buildCompletionKey, markSeenWithTtl } from "./completion-dedupe.ts";
import {
	type CompletionBatchConfig,
	type CompletionBatcher,
	createCompletionBatcher,
	resolveCompletionBatchConfig,
} from "./completion-batcher.ts";
import { SUBAGENT_ASYNC_COMPLETE_EVENT, SUBAGENT_FOREGROUND_COMPLETE_EVENT, type ParallelHandoffReference, type ScheduleOrigin, type SubagentState } from "../../shared/types.ts";
import { isUnexplainedProcessSignal } from "../shared/process-signal.ts";

export interface SubagentNotifyDetails {
	agent: string;
	status: "completed" | "failed" | "paused" | "stopped";
	source?: "async" | "foreground";
	taskInfo?: string;
	resultPreview: string;
	durationMs?: number;
	workflowRunId?: string;
	childRuns?: Array<{ runId: string; workflowKey?: string; agent?: string; status?: string }>;
	reconciledFromDetachedChild?: string;
	sessionLabel?: string;
	sessionValue?: string;
	handoffPath?: string;
	/** Present when a durable schedule launched the run. */
	scheduleOrigin?: ScheduleOrigin;
}

export interface CompletionNotification {
	[key: string]: unknown;
	id?: string | null;
	source?: "async" | "foreground";
	agent?: string | null;
	success?: boolean;
	summary?: string;
	exitCode?: number;
	state?: string;
	mode?: string;
	runId?: string | null;
	reconciledFromDetachedChild?: string;
	processSignal?: string | null;
	interrupted?: boolean;
	timedOut?: boolean;
	stopped?: boolean;
	turnBudgetExceeded?: boolean;
	results?: Array<{
		runId?: string;
		workflowKey?: string;
		agent?: string;
		status?: string;
		success?: boolean;
		exitCode?: number | null;
		processSignal?: string | null;
		interrupted?: boolean;
		timedOut?: boolean;
		stopped?: boolean;
		turnBudgetExceeded?: boolean;
	}>;
	timestamp?: number;
	durationMs?: number;
	cwd?: string;
	sessionFile?: string;
	shareUrl?: string;
	gistUrl?: string;
	shareError?: string;
	taskIndex?: number;
	totalTasks?: number;
	sessionId?: string | null;
	completionOwnerId?: string | null;
	triggerTurn?: boolean;
	/** True when an acknowledged grouped intercom relay already delivered this run. */
	intercomDelivered?: boolean;
	parallelHandoff?: ParallelHandoffReference;
	scheduleOrigin?: ScheduleOrigin;
}

interface NotifyTimerApi {
	setTimeout(handler: () => void, delayMs: number): unknown;
	clearTimeout(handle: unknown): void;
}

export interface RegisterSubagentNotifyOptions {
	batchConfig?: CompletionBatchConfig;
	timers?: NotifyTimerApi;
	now?: () => number;
}

export interface CompletionNotifier {
	deliver(result: CompletionNotification): Promise<boolean>;
	dispose(): void;
}

function formatSessionLine(details: SubagentNotifyDetails): string | undefined {
	if (!details.sessionValue) return undefined;
	return details.sessionLabel ? `${details.sessionLabel}: ${details.sessionValue}` : details.sessionValue;
}

function formatChildRun(child: { runId: string; workflowKey?: string; agent?: string; status?: string }): string {
	const label = child.workflowKey ?? child.agent;
	const status = child.status ? ` (${child.status})` : "";
	return `${label ? `${label}=` : ""}${child.runId}${status}`;
}

function formatCorrelationLines(details: SubagentNotifyDetails): string[] {
	return [
		details.workflowRunId ? `Workflow run: ${details.workflowRunId}` : undefined,
		details.childRuns?.length ? `Child runs: ${details.childRuns.map(formatChildRun).join(", ")}` : undefined,
		details.reconciledFromDetachedChild ? `Reconciled detached child: ${details.reconciledFromDetachedChild}` : undefined,
	].filter((line): line is string => line !== undefined);
}

export function formatSingleCompletion(details: SubagentNotifyDetails): string {
	const sessionLine = formatSessionLine(details);
	const correlationLines = formatCorrelationLines(details);
	const taskKind = details.source === "foreground" ? "Detached foreground task" : "Background task";
	const scheduleLine = details.scheduleOrigin
		? `Scheduled run from **${details.scheduleOrigin.name ?? details.scheduleOrigin.id}** (schedule ${details.scheduleOrigin.id}).`
		: undefined;
	return [
		`${taskKind} ${details.status}: **${details.agent}**${details.taskInfo ?? ""}`,
		"",
		scheduleLine,
		scheduleLine ? "" : undefined,
		details.resultPreview.trim() ? details.resultPreview : "(no output)",
		details.handoffPath ? "" : undefined,
		details.handoffPath ? `Parallel handoff: ${details.handoffPath}` : undefined,
		correlationLines.length && !details.handoffPath ? "" : undefined,
		...correlationLines,
		sessionLine ? "" : undefined,
		sessionLine,
	]
		.filter((line) => line !== undefined)
		.join("\n");
}

export function parseSubagentNotifyContent(content: string): SubagentNotifyDetails | undefin
```