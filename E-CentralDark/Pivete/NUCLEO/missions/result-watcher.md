# MISSAO - result-watcher.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\result-watcher.ts
**SHA:** 5d4ac28f4a759cfb
**Timestamp:** 2026-08-28T02:24:53.439978
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const scheduleRestart = () => {

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { buildCompletionKey, markSeenWithTtl } from "./completion-dedupe.ts";
import { createFileCoalescer } from "../../shared/file-coalescer.ts";
import { shouldUseNativeFsWatch } from "../../shared/watch-strategy.ts";
import {
	SUBAGENT_ASYNC_COMPLETE_EVENT,
	type IntercomEventBus,
	type NestedRunSummary,
	type ParallelHandoffReference,
	type SubagentResultIntercomChild,
	type SubagentOutputState,
	type SubagentState,
} from "../../shared/types.ts";
import {
	attachNestedChildrenToResultChildren,
	buildSubagentResultIntercomPayload,
	compactNestedResultChildren,
	deliverSubagentResultIntercomEvent,
	resolveSubagentResultStatus,
} from "../../intercom/result-intercom.ts";
import { projectNestedRegistryForRoot, sanitizeSummary } from "../shared/nested-events.ts";
import { resolveWatchPath } from "../../shared/utils.ts";
import { recordWaitCompletion } from "./wait-completions.ts";
import { MISSION_BINDING_FILE, syncMissionFromAsyncCompletion } from "../../missions/lifecycle.ts";
import { missionObserverResultCandidateFiles, promotePendingResultFile, removeMissionObserverIndex, removeResultIndex, resultCandidateFilesForSession, resultPayloadPathForIndexedRun, resultPayloadPathForMissionObserverRun, resultPayloadPathForSessionRun, writeAsyncResultFile, writeResultIndexForData } from "./result-files.ts";
import type { CompletionNotifier, CompletionNotification } from "./notify.ts";

const WATCHER_RESTART_DELAY_MS = 3000;
const POLL_INTERVAL_MS = 3000;
const HEALTHY_SCAN_INTERVAL_MS = 60_000;
const RETRY_DELAY_MS = 100;
const SLOW_RESULT_SCAN_MS = 500;

type ResultWatcherFs = Pick<typeof fs, "existsSync" | "readFileSync" | "unlinkSync" | "readdirSync" | "mkdirSync" | "realpathSync" | "statSync" | "watch">;

type ResultWatcherTimers = {
	setTimeout: typeof setTimeout;
	clearTimeout: typeof clearTimeout;
	setInterval: typeof setInterval;
	clearInterval: typeof clearInterval;
};

type ResultWatcherDeps = {
	fs?: ResultWatcherFs;
	timers?: ResultWatcherTimers;
	notifier?: Pick<CompletionNotifier, "deliver">;
	/** Receives persisted completions before active-session delivery filtering. */
	observeCompletion?: (result: CompletionNotification & { runId: string }) => void;
	/** Returns cross-session run ids that the completion observer currently owns. */
	observedCompletionRunIds?: () => Iterable<string>;
	/** Parses a relevant result payload after its lightweight identity check. */
	parseResult?: (raw: string) => ResultFileData;
	/** External grouped-result transport. Disable when native completion notifications own delivery. */
	deliverIntercomResults?: boolean;
	/** Coalesces result-file events. Tests can lower this without changing retry timing. */
	coalesceDelayMs?: number;
	/** Returns true while a durable completion source needs periodic delivery checks. */
	hasDeliveryDemand?: () => boolean;
	/** Control how slow result-index scans are logged. Defaults to \"activity\". */
	resultScanLogging?: "all" | "activity" | "off";
	platform?: NodeJS.Platform;
};

type ResultFileChild = {
	agent?: string;
	output?: string;
	structuredOutput?: unknown;
	outputState?: SubagentOutputState;
	error?: string;
	success?: boolean;
	state?: string;
	interrupted?: boolean;
	timedOut?: boolean;
	stopped?: boolean;
	turnBudgetExceeded?: boolean;
	processSignal?: string | null;
	sessionFile?: string;
	artifactPaths?: { outputPath?: string };
	intercomTarget?: string;
	children?: unknown;
};

type ResultFileData = CompletionNotification & {
	runId?: string;
	mode?: string;
	results?: ResultFileChild[];
	nestedChildren?: unknown;
	asyncDir?: string;
	intercomTarget?: string;
	parallelHandoff?: ParallelHandoffReference;
	notificationDeliveredAt?: unknown;
};

type ResultFileIdentity = {
	sessionId?: string;
	completionOwnerId?: string;
	runId?: string;
	asyncDir?: string;
};

interface ResultScanStats {
	files: number;
	scheduled: number;
	startedAt: number;
}

function jsonStringProperty(raw: string, property: string): string | undefined {
	const matches = raw.matchAll(new RegExp(`"${property}"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")`, "g"));
	let encoded: string | undefined;
	for (const match of matches) encoded = match[1];
	if (!encoded) return undefined;
	try {
		const value = JSON.parse(encoded) as unknown;
		return typeof value === "string" && value ? value : undefined;
	} catch {
		return undefined;
	}
}

function resultFileIdentity(raw: string, file: string): ResultFileIdentity {
	return {
		sessionId: jsonStringProperty(raw, "sessionId"),
		completionOwnerId: jsonStringProperty(raw, "completionOwnerId"),
		runId: file.replace(/\.json$/i, ""),
		asyncDir: jsonStringProperty(raw, "asyncDir"),
	};
}

function sanitizeNestedResultChildren(value: unknown, resultPath: string, label: string): NestedRunSummary[] | undefined {
	if (value === undefined) return undefined;
	if (!Array.isArray(value)) {
		console.error(`Ignoring invalid nested children in subagent result file '${resul
```