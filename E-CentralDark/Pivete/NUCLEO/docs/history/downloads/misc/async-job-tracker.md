# OUTRO - async-job-tracker.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\async-job-tracker.ts
**SHA:** 129df192178760f6
**Timestamp:** 2026-08-28T02:24:53.201349
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const summaryToJob = (run: AsyncRunSummary): AsyncJobState => {
- let lineStart = 0;
- lineStart = index + 1;
- startedRun: {
- const firstGroup = validParallelGroups.find((group) => group.start === 0);

### Ouro Bruto (primeiros 5000 chars)
```
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import { renderWidget, widgetRenderKey } from "../../tui/render.ts";
import { formatControlNoticeMessage } from "../shared/subagent-control.ts";
import {
	type AsyncJobState,
	type AsyncStartedEvent,
	type ControlEvent,
	type SteeringNotice,
	type SubagentChildStatusEvent,
	type SubagentState,
	DIRS,
	SUBAGENT_CHILD_STATUS_EVENT,
	SUBAGENT_CONTROL_EVENT,
	SUBAGENT_CONTROL_INTERCOM_EVENT,
	SUBAGENT_STEERING_NOTICE_EVENT,
	WIDGET_ANIMATION_INTERVAL_MS,
} from "../../shared/types.ts";
import { readStatus, resolveWatchPath } from "../../shared/utils.ts";
import { normalizeParallelGroups } from "./parallel-groups.ts";
import { reconcileAsyncRun, reconcileNestedAsyncDescendants } from "./stale-run-reconciler.ts";
import { findNestedRouteForRootId, hasLiveNestedDescendants, updateAsyncJobNestedProjection } from "../shared/nested-events.ts";
import { listAsyncRuns, type AsyncRunSummary } from "./async-status.ts";
import { EXTERNAL_JOB_BRIDGE_REQUEST_DIR, serviceExternalJobBridgeRequests } from "../shared/external-job-bridge.ts";
import { shouldUseNativeFsWatch } from "../../shared/watch-strategy.ts";
import { parseWorkflowChildSummary } from "../../workflows/workflow-child-summary.ts";

interface AsyncJobTrackerOptions {
	completionRetentionMs?: number;
	/** Slow safety sweep for liveness repair when filesystem events are missed. */
	pollIntervalMs?: number;
	resultsDir?: string;
	widgetEnabled?: boolean;
	platform?: NodeJS.Platform;
	onJobTerminal?: () => void;
	watch?: typeof fs.watch;
	kill?: (pid: number, signal?: NodeJS.Signals | 0) => boolean;
	now?: () => number;
}

const CONTROL_EVENT_READ_CHUNK_BYTES = 64 * 1024;
const MAX_CONTROL_EVENT_LINE_BYTES = 1024 * 1024;
const CONTROL_EVENT_SCAN_WINDOW_BYTES = 2 * 1024 * 1024;
const MAX_RECENT_FLEET_JOBS = 20;
const DEFAULT_LIVENESS_INTERVAL_MS = 5000;
const EVENT_REFRESH_DEBOUNCE_MS = 25;
const WATCH_ATTACHMENT_RETRY_MS = 100;

function rememberFleetJob(state: SubagentState, job: AsyncJobState): void {
	state.fleetJobs ??= new Map();
	state.fleetJobs.set(job.asyncId, job);
	const terminal = [...state.fleetJobs.values()]
		.filter((candidate) => candidate.status === "complete" || candidate.status === "failed" || candidate.status === "paused" || candidate.status === "stopped")
		.sort((left, right) => (right.updatedAt ?? right.startedAt ?? 0) - (left.updatedAt ?? left.startedAt ?? 0));
	for (const stale of terminal.slice(MAX_RECENT_FLEET_JOBS)) state.fleetJobs.delete(stale.asyncId);
}

export function createAsyncJobTracker(pi: Pick<ExtensionAPI, "events">, state: SubagentState, asyncDirRoot: string, options: AsyncJobTrackerOptions = {}): {
	ensurePoller: () => void;
	refreshWidget: (ctx: ExtensionContext) => void;
	handleStarted: (data: unknown) => void;
	handleComplete: (data: unknown) => void;
	resetJobs: (ctx?: ExtensionContext) => void;
	restoreActiveJobs: (ctx?: ExtensionContext) => void;
	dispose: () => void;
} {
	const completionRetentionMs = options.completionRetentionMs ?? 10000;
	const livenessIntervalMs = options.pollIntervalMs ?? DEFAULT_LIVENESS_INTERVAL_MS;
	const resultsDir = options.resultsDir ?? DIRS.results;
	const steeringNoticeSeen = new Map<string, number>();
	const jobWatchers = new Map<string, { watchers: Map<string, fs.FSWatcher>; retryTimer?: ReturnType<typeof setTimeout> }>();
	const refreshTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const runningJobIds = new Set<string>();
	let rootWatcher: fs.FSWatcher | undefined;
	let nextLivenessAt = Date.now() + livenessIntervalMs;
	let nextWidgetAnimationAt = Date.now() + WIDGET_ANIMATION_INTERVAL_MS;
	const watch = options.watch ?? fs.watch;
	const useNativeWatcher = () => shouldUseNativeFsWatch("async-job-tracker", options.platform);
	const terminalStatus = (status: string) => status === "complete" || status === "failed" || status === "paused" || status === "stopped";
	const rerenderWidget = (ctx: ExtensionContext, jobs = Array.from(state.asyncJobs.values())) => {
		if (state.widgetsSuspended) return;
		renderWidget(ctx, options.widgetEnabled === false ? [] : jobs);
		(ctx.ui as { requestRender?: () => void }).requestRender?.();
	};
	const rerenderLastWidget = (jobs = Array.from(state.asyncJobs.values())) => {
		const ctx = state.lastUiContext;
		if (!ctx) return;
		try {
			if (ctx.hasUI) rerenderWidget(ctx, jobs);
		} catch (error) {
			if (error instanceof Error && error.message.includes("extension ctx is stale")) {
				state.lastUiContext = null;
				return;
			}
			throw error;
		}
	};
	const requestLastWidgetRender = () => {
		if (options.widgetEnabled === false) return;
		rerenderLastWidget();
	};
	const refreshWidget = (ctx: ExtensionContext) => rerenderWidget(ctx);
	const restoredControlEventCursor = (asyncDir: string) => {
		try {
			return fs.statSync(path.join(asyncDir, "events.jsonl")).size;
		} catch (error) {
			if ((
```