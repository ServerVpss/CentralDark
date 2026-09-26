# COMANDO - chain-append.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\chain-append.ts
**SHA:** 70b5a48dba49f9e5
**Timestamp:** 2026-08-28T02:24:53.233178
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- input.status.parallelGroups.push({ start: flatIndex, count: step.parallel.length, stepIndex });
- input.status.parallelGroups.push({ start: flatIndex, count: 1, stepIndex });

### Ouro Bruto (primeiros 5000 chars)
```
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { writeAtomicJson } from "../../shared/atomic-json.ts";
import { appendJsonl } from "../../shared/artifacts.ts";
import type { AsyncParallelGroupStatus, AsyncStatus, WorkflowGraphNode, WorkflowGraphSnapshot } from "../../shared/types.ts";
import { PROMPT_REDACTED, readStatus } from "../../shared/utils.ts";
import type { DynamicRunnerGroup, ParallelStepGroup, RunnerStep, RunnerSubagentStep } from "../shared/parallel-utils.ts";
import { isDynamicRunnerGroup, isParallelGroup } from "../shared/parallel-utils.ts";

const APPEND_REQUESTS_DIR = "append-requests";

export interface ChainAppendRequest {
	id: string;
	createdAt: number;
	steps: RunnerStep[];
}

export interface ChainAppendResult {
	request: ChainAppendRequest;
	pendingCount: number;
	bookkeepingError?: string;
}

type StatusStep = NonNullable<AsyncStatus["steps"]>[number];

function appendDir(asyncDir: string): string {
	return path.join(asyncDir, APPEND_REQUESTS_DIR);
}

function appendRequestPath(asyncDir: string, request: ChainAppendRequest): string {
	return path.join(appendDir(asyncDir), `${request.createdAt}-${request.id}.json`);
}

function listAppendRequestFiles(asyncDir: string): string[] {
	const dir = appendDir(asyncDir);
	try {
		return fs.readdirSync(dir)
			.filter((entry) => entry.endsWith(".json"))
			.map((entry) => path.join(dir, entry))
			.sort();
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
		throw error;
	}
}

export function countPendingChainAppendRequests(asyncDir: string): number {
	return listAppendRequestFiles(asyncDir).length;
}

export function runnerStepOutputNames(steps: RunnerStep[]): string[] {
	const names: string[] = [];
	for (const step of steps) {
		if (isParallelGroup(step)) {
			names.push(...step.parallel.map((task) => task.outputName).filter((name): name is string => Boolean(name)));
		} else if (isDynamicRunnerGroup(step)) {
			if (step.collect.as) names.push(step.collect.as);
		} else if (step.outputName) {
			names.push(step.outputName);
		}
	}
	return names;
}

export function enqueueChainAppendRequest(input: {
	asyncDir: string;
	runId: string;
	steps: RunnerStep[];
	now?: number;
	admit?: (persist: () => void) => void;
}): ChainAppendResult {
	const status = readStatus(input.asyncDir);
	if (!status) throw new Error(`No async run status found for '${input.runId}'.`);
	if (status.runId !== input.runId) throw new Error(`Async run id mismatch: expected '${input.runId}', found '${status.runId}'.`);
	if (status.mode !== "chain") throw new Error(`Run '${input.runId}' is ${status.mode}; only active chain runs accept appended steps.`);
	if (status.state !== "running") throw new Error(`Run '${input.runId}' is ${status.state}; only running chain runs accept appended steps.`);
	const stillInProgress = (status.steps ?? []).some((step) => step.status === "running" || step.status === "pending") || (status.pendingAppends ?? 0) > 0;
	if (!stillInProgress) throw new Error(`Run '${input.runId}' has no running or pending chain steps left; append-step must target an in-progress chain.`);
	if (input.steps.length === 0) throw new Error("append-step requires one chain step.");

	const request: ChainAppendRequest = {
		id: randomUUID(),
		createdAt: input.now ?? Date.now(),
		steps: input.steps,
	};
	fs.mkdirSync(appendDir(input.asyncDir), { recursive: true });
	const persist = () => writeAtomicJson(appendRequestPath(input.asyncDir, request), request);
	if (input.admit) input.admit(persist);
	else persist();
	let pendingCount = 1;
	const bookkeepingErrors: string[] = [];
	try {
		pendingCount = countPendingChainAppendRequests(input.asyncDir);
	} catch (error) {
		bookkeepingErrors.push(`pending append count failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	const statusPath = path.join(input.asyncDir, "status.json");
	const updatedStatus = { ...status, pendingAppends: pendingCount, lastUpdate: request.createdAt };
	try {
		writeAtomicJson(statusPath, updatedStatus);
	} catch (error) {
		bookkeepingErrors.push(`status update failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	try {
		appendJsonl(path.join(input.asyncDir, "events.jsonl"), JSON.stringify({
			type: "subagent.chain.append.requested",
			ts: request.createdAt,
			runId: input.runId,
			requestId: request.id,
			stepCount: input.steps.length,
			pendingAppends: pendingCount,
		}));
	} catch (error) {
		bookkeepingErrors.push(`event append failed: ${error instanceof Error ? error.message : String(error)}`);
	}
	return { request, pendingCount, ...(bookkeepingErrors.length > 0 ? { bookkeepingError: bookkeepingErrors.join("; ") } : {}) };
}

function readAppendRequest(filePath: string): ChainAppendRequest | undefined {
	const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Partial<ChainAppendRequest>;
	if (!raw.id || typeof raw.id !== "string") return undefined;
	con
```