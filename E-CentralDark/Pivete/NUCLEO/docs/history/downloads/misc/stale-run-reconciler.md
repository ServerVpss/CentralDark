# OUTRO - stale-run-reconciler.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\stale-run-reconciler.ts
**SHA:** 2f23d48dd2933366
**Timestamp:** 2026-08-28T02:24:55.196206
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = Math.max(0, stat.size - bytesToRead);
- function buildStartedStatus(asyncDir: string, startedRun: StartedRunMetadata, now: number): AsyncStatus {

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { writeAtomicJson } from "../../shared/atomic-json.ts";
import { resultFilePath, resultPayloadPathForSessionRun, writeAsyncResultFile } from "./result-files.ts";
import { updateActiveRunIndex } from "./active-run-index.ts";
import { readStatus } from "../../shared/utils.ts";
import { DIRS, type AsyncParallelGroupStatus, type AsyncStatus, type NestedRunSummary, type SubagentRunMode } from "../../shared/types.ts";
import { resolveEffectiveThinking } from "../../shared/model-info.ts";
import { normalizeParallelGroups } from "./parallel-groups.ts";
import { nestedSummaryFromAsyncStatus, projectNestedEvents, resolveNestedAsyncDir, writeNestedEvent, type NestedRoute } from "../shared/nested-events.ts";

export type PidLiveness = "alive" | "dead" | "unknown";

type KillFn = (pid: number, signal?: NodeJS.Signals | 0) => boolean;

interface StartedRunMetadata {
	runId: string;
	pid?: number;
	sessionId?: string;
	completionOwnerId?: string;
	mode?: SubagentRunMode;
	agents?: string[];
	chainStepCount?: number;
	parallelGroups?: AsyncParallelGroupStatus[];
	startedAt?: number;
	sessionFile?: string;
}

interface ReconcileAsyncRunOptions {
	resultsDir?: string;
	kill?: KillFn;
	now?: () => number;
	startedRun?: StartedRunMetadata;
	missingStatusGraceMs?: number;
	staleAlivePidMs?: number;
}

interface ReconcileAsyncRunResult {
	status: AsyncStatus | null;
	repaired: boolean;
	resultPath?: string;
	message?: string;
}

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function readRunnerStartupDiagnostics(asyncDir: string): string | undefined {
	const stderrPath = path.join(asyncDir, "runner.stderr.log");
	const maxBytes = 64 * 1024;
	let content: string;
	try {
		const stat = fs.statSync(stderrPath);
		if (stat.size <= 0) return undefined;
		const fd = fs.openSync(stderrPath, "r");
		try {
			const bytesToRead = Math.min(stat.size, maxBytes);
			const start = Math.max(0, stat.size - bytesToRead);
			const buffer = Buffer.alloc(bytesToRead);
			fs.readSync(fd, buffer, 0, bytesToRead, start);
			content = buffer.toString("utf-8").trim();
		} finally {
			fs.closeSync(fd);
		}
	} catch {
		return undefined;
	}
	if (!content) return undefined;
	const lines = content.split(/\r?\n/).slice(-30).join("\n");
	return lines.length > 4000 ? `${lines.slice(-4000)}\n[stderr tail truncated]` : lines;
}

function isNotFoundError(error: unknown): boolean {
	return typeof error === "object"
		&& error !== null
		&& "code" in error
		&& (error as NodeJS.ErrnoException).code === "ENOENT";
}

function appendJsonlBestEffort(filePath: string, payload: object): void {
	try {
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`, "utf-8");
	} catch {
		// Repair status/result writes are the important path. A broken or full
		// diagnostic event log must not make stale-run reconciliation fail.
	}
}

interface ResultChildOutcome {
	agent?: string;
	success?: boolean;
	error?: string;
	sessionFile?: string;
	model?: string;
	thinking?: string;
	attemptedModels?: string[];
	modelAttempts?: NonNullable<AsyncStatus["steps"]>[number]["modelAttempts"];
	contextOverflow?: boolean;
}

interface ResultRepairData {
	state: "complete" | "failed" | "paused" | "stopped" | "rejected";
	results?: ResultChildOutcome[];
}

function regularFileExists(filePath: string): boolean {
	try {
		return fs.statSync(filePath).isFile();
	} catch (error) {
		if (isNotFoundError(error)) return false;
		throw error;
	}
}

function readResultRepairData(resultPath: string): ResultRepairData | undefined {
	try {
		const data = JSON.parse(fs.readFileSync(resultPath, "utf-8")) as { success?: boolean; state?: string; exitCode?: number; results?: unknown };
		const state = data.success ? "complete" : data.state === "stopped" ? "stopped" : data.state === "rejected" ? "rejected" : data.state === "paused" || data.exitCode === 0 ? "paused" : "failed";
		const results = Array.isArray(data.results)
			? data.results.map((entry, index) => {
				if (!entry || typeof entry !== "object" || Array.isArray(entry)) return {};
				const child = entry as ResultChildOutcome;
				if (child.model !== undefined && typeof child.model !== "string") throw new Error(`Invalid async result file '${resultPath}': results[${index}].model must be a string.`);
				if (child.thinking !== undefined && typeof child.thinking !== "string") throw new Error(`Invalid async result file '${resultPath}': results[${index}].thinking must be a string.`);
				return child;
			})
			: undefined;
		return { state, ...(results ? { results } : {}) };
	} catch (error) {
		if (isNotFoundError(error)) return undefined;
		throw new Error(`Failed to read async result file '${resultPath}': ${getErrorMessage(error)}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}

function childState(overallState: ResultRepairDat
```