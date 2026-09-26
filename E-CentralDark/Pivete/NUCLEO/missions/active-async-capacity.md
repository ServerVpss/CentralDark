# MISSAO - active-async-capacity.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\active-async-capacity.ts
**SHA:** 9d1d983e0cdfac7f
**Timestamp:** 2026-08-28T02:24:52.928725
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const sameRun = owner.runId === input.runId || (input.asyncDir !== undefined && path.resolve(owner.asyncDir) === path.resolve(input.asyncDir));
- const sourceRun = owner.sourceRunId === input.runId;

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash, randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { writePrivateAtomicJson } from "../../shared/atomic-json.ts";
import { TEMP_ROOT_DIR, type ActiveAsyncCapacitySnapshot, type AsyncStatus } from "../../shared/types.ts";
import { readStatus } from "../../shared/utils.ts";
import { checkPidLiveness, type PidLiveness } from "./stale-run-reconciler.ts";
import { readProcessTerminal } from "./process-terminal.ts";

export const ACTIVE_ASYNC_CAPACITY_DIR = path.join(TEMP_ROOT_DIR, "session-active-async-capacity");
export const DEFAULT_ABANDONED_SLOT_RELEASE_AFTER_MS = 20 * 60 * 1000;
export const MIN_ABANDONED_SLOT_RELEASE_AFTER_MS = 5 * 60 * 1000;
export const MAX_ABANDONED_SLOT_RELEASE_AFTER_MS = 24 * 60 * 60 * 1000;

export interface ActiveAsyncCapacityOwnerV1 {
	version: 1;
	reservationToken: string;
	ownerSessionId: string;
	ownerSessionKey: string;
	slot: number;
	runId: string;
	sourceRunId?: string;
	generation: number;
	kind: "runner" | "workflow";
	asyncDir: string;
	reservedAt: number;
	runnerProcessInstanceId?: string;
	runnerStartedAt?: number;
}

export interface ActiveAsyncCapacityHandle {
	readonly owner: ActiveAsyncCapacityOwnerV1;
	markStarted(runnerProcessInstanceId: string): void;
	markWorkflowStarted(): void;
	rollback(): boolean;
	reconcile(liveWorkflowRunIds?: ReadonlySet<string>): ActiveAsyncCapacitySnapshot;
}

interface CapacityOptions {
	rootDir?: string;
	now?: () => number;
	token?: () => string;
	abandonedSlotReleaseAfterMs?: number | false;
	pidLiveness?: (pid: number) => PidLiveness;
	afterSlotRename?: (releasedDir: string) => void;
}

export interface ActiveAsyncCapacityReleaseEvidence {
	releasedBy: "abandoned-timeout";
	processProof: "unknown";
	runnerPid: "gone";
	lastActivityAgeMs: number;
	abandonedSlotReleaseAfterMs: number;
}

export type ActiveAsyncCapacityReleaseVerdict =
	| { state: "releasable"; reason: string; evidence?: ActiveAsyncCapacityReleaseEvidence }
	| { state: "retained"; reason: string }
	| { state: "not-owned"; reason: string };

export interface ActiveAsyncCapacityInspection {
	owner?: ActiveAsyncCapacityOwnerV1;
	relation: "current" | "source" | "none";
	slotDir?: string;
	release: ActiveAsyncCapacityReleaseVerdict;
}

export class ActiveAsyncCapacityError extends Error {
	readonly snapshot: ActiveAsyncCapacitySnapshot;

	constructor(snapshot: ActiveAsyncCapacitySnapshot) {
		super(`Active async run capacity exhausted: ${snapshot.used}/${snapshot.limit} used.`);
		this.name = "ActiveAsyncCapacityError";
		this.snapshot = snapshot;
	}
}

export function resolveMaxActiveAsyncRunsPerSession(value: unknown): number | undefined {
	if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return undefined;
	return value === 0 ? undefined : value;
}

export function resolveAbandonedSlotReleaseAfterMs(value: unknown): number | false {
	if (value === false) return false;
	if (typeof value !== "number" || !Number.isInteger(value) || value < 1) return DEFAULT_ABANDONED_SLOT_RELEASE_AFTER_MS;
	return value;
}

export function activeAsyncCapacitySessionKey(sessionId: string): string {
	return createHash("sha256").update(sessionId).digest("hex");
}

function sessionDir(sessionId: string, rootDir: string): string {
	return path.join(rootDir, activeAsyncCapacitySessionKey(sessionId));
}

function slotDir(poolDir: string, slot: number): string {
	return path.join(poolDir, `slot-${slot}`);
}

function parseOwner(value: unknown): ActiveAsyncCapacityOwnerV1 | undefined {
	if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
	const owner = value as Partial<ActiveAsyncCapacityOwnerV1>;
	if (owner.version !== 1
		|| typeof owner.reservationToken !== "string" || !owner.reservationToken
		|| typeof owner.ownerSessionId !== "string" || !owner.ownerSessionId
		|| typeof owner.ownerSessionKey !== "string" || !owner.ownerSessionKey
		|| typeof owner.slot !== "number" || !Number.isInteger(owner.slot) || owner.slot < 0
		|| typeof owner.runId !== "string" || !owner.runId
		|| typeof owner.generation !== "number" || !Number.isInteger(owner.generation) || owner.generation < 0
		|| (owner.kind !== "runner" && owner.kind !== "workflow")
		|| typeof owner.asyncDir !== "string" || !owner.asyncDir
		|| typeof owner.reservedAt !== "number" || !Number.isFinite(owner.reservedAt)) return undefined;
	if (owner.sourceRunId !== undefined && typeof owner.sourceRunId !== "string") return undefined;
	if (owner.runnerProcessInstanceId !== undefined && (typeof owner.runnerProcessInstanceId !== "string" || !owner.runnerProcessInstanceId)) return undefined;
	if (owner.runnerStartedAt !== undefined && (typeof owner.runnerStartedAt !== "number" || !Number.isFinite(owner.runnerStartedAt))) return undefined;
	return owner as ActiveAsyncCapacityOwnerV1;
}

function readOwner(dir: string): ActiveAsyncCapacityOwnerV1 | undefined {
	try {
		return parseOwner(JSON.parse(fs.readFileSync(path.join(d
```