# CONTRATO - async-retention.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\async-retention.ts
**SHA:** 496e416e3b9c00fe
**Timestamp:** 2026-08-28T02:24:53.057168
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- deletedIds.push(`run:${status!.runId}`);

### Ouro Bruto (primeiros 5000 chars)
```
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { Worker } from "node:worker_threads";
import { writeAtomicJson } from "../../shared/atomic-json.ts";
import type { AsyncStatus } from "../../shared/types.ts";
import { MISSION_BINDING_FILE } from "../../missions/lifecycle.ts";
import { ACTIVE_RUN_INDEX_DIR } from "./active-run-index.ts";
import { encodeIndexSegment } from "./index-segment.ts";
import { reconcileAsyncRun } from "./stale-run-reconciler.ts";

export const ASYNC_RETENTION_DAYS = 30;
export const ASYNC_RETENTION_BATCH_SIZE = 100;
export const ASYNC_RETENTION_DELAY_MS = 60_000;
export const ASYNC_RETENTION_TOMBSTONE_GRACE_MS = 24 * 60 * 60 * 1000;

const RETENTION_MS = ASYNC_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const LOCK_NAME = ".async-retention.lock";
const CURSOR_NAME = ".async-retention-cursor.json";
const LOG_NAME = "async-retention-maintenance.jsonl";
const RUN_TOMBSTONE_PREFIX = ".deleting-run-";
const RESULT_TOMBSTONE_PREFIX = ".deleting-result-";
const RUN_TOMBSTONE_MARKERS_DIR = "async-retention-run-tombstones";
const LOCK_STALE_MS = 24 * 60 * 60 * 1000;
const RUN_MODES = new Set<AsyncStatus["mode"]>(["single", "parallel", "chain", "workflow"]);
const TERMINAL_STATES = new Set<AsyncStatus["state"]>(["complete", "failed", "stopped", "rejected"]);
const RESULT_TIMESTAMP_FIELDS = ["endedAt", "completedAt", "createdAt", "writtenAt", "expiresAt", "timestamp"] as const;

interface RetentionCursor {
	version: 1;
	runAfter?: string;
	resultAfter?: string;
	resultPublicAfter?: string;
	resultPendingAfterBySession?: Record<string, string>;
	resultReplayAfter?: string;
	resultArchiveAfter?: string;
	pendingSessionAfter?: string;
}

type ResultCursorKey = keyof Pick<RetentionCursor, "resultPublicAfter" | "resultReplayAfter" | "resultArchiveAfter">;
type ResultCursorTarget = { type: "result"; key: ResultCursorKey } | { type: "pending"; session: string };

interface ResultCandidate {
	path: string;
	relative: string;
	kind: "public" | "pending" | "replay" | "archive" | "tombstone";
	cursor: ResultCursorTarget;
}

interface DiscoveredRunCandidate {
	name: string;
	relative: string;
}

type CursorOperation =
	| { type: "set"; key: Exclude<keyof RetentionCursor, "version" | "resultPendingAfterBySession">; value: string }
	| { type: "delete"; key: Exclude<keyof RetentionCursor, "version" | "resultPendingAfterBySession"> }
	| { type: "set-pending"; session: string; value: string }
	| { type: "delete-pending"; session: string };

interface RetentionDiscovery {
	discoveryDurationMs: number;
	rawReads: number;
	sourceExhausted: Record<string, boolean>;
	runCandidates: DiscoveredRunCandidate[];
	resultCandidates: Array<Omit<ResultCandidate, "path">>;
	cursorOps: CursorOperation[];
}

interface RetentionLockOwner {
	version: 1;
	token: string;
	pid: number;
	hostname: string;
	startedAt: number;
	processStartIdentity?: string;
}

export interface AsyncRetentionOptions {
	asyncDirRoot: string;
	resultsDir: string;
	waitSubscriptionsDir?: string;
	protectedRunIds?: Iterable<string>;
	now?: () => number;
	retentionMs?: number;
	tombstoneGraceMs?: number;
	batchSize?: number;
	randomId?: () => string;
	maintenanceRoot?: string;
	pid?: number;
	hostname?: string;
	processStartIdentity?: string;
	isProcessAlive?: (pid: number) => boolean | undefined;
	getProcessStartIdentity?: (pid: number) => string | undefined;
	lstatSync?: typeof fs.lstatSync;
	signal?: AbortSignal;
	discoveryWorkerUrl?: URL;
	reconcileKill?: (pid: number, signal?: NodeJS.Signals | 0) => boolean;
}

export interface AsyncRetentionResult {
	acquired: boolean;
	scanned: number;
	repairedRuns: number;
	deletedRuns: number;
	deletedResults: number;
	reapedTombstones: number;
	skipped: Record<string, number>;
	errors: string[];
	rawReads: number;
	sourceExhausted: Record<string, boolean>;
	discoveryDurationMs: number;
	commitDurationMs: number;
	cancelled: boolean;
	workerFailed: boolean;
	durationMs: number;
}

function isNotFound(error: unknown): boolean {
	return typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT";
}

function compactError(error: unknown): string {
	const message = error instanceof Error ? error.message : String(error);
	return message.replace(/\s+/g, " ").slice(0, 240);
}

function listDir(dir: string): fs.Dirent[] {
	try {
		return fs.readdirSync(dir, { withFileTypes: true });
	} catch (error) {
		if (isNotFound(error)) return [];
		throw error;
	}
}

function readJson(filePath: string): Record<string, unknown> | undefined {
	try {
		const parsed = JSON.parse(fs.readFileSync(filePath).toString("utf8")) as unknown;
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : undefined;
	} catch {
		return undefined;
	}
}

function readStatus(runDir: string): AsyncStatus | unde
```