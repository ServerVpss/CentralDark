# COMANDO - wait-subscriptions.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\wait-subscriptions.ts
**SHA:** ee21a0e5bf06ee3b
**Timestamp:** 2026-08-28T02:24:55.280124
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- function needsAttention(run: AsyncRunSummary): boolean {
- const run = state.foregroundRuns?.get(record.runId);
- const run = runs.find((candidate) => candidate.id === record.runId);

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { listAsyncRuns, type AsyncRunSummary } from "./async-status.ts";
import { formatResumeFirstFailedRunDetail } from "./resume-guidance.ts";
import { readCompletionReplay } from "./completion-replay.ts";
import { writeAtomicJson } from "../../shared/atomic-json.ts";
import {
	DIRS,
	INTERCOM_DETACH_REQUEST_EVENT,
	SUBAGENT_ASYNC_COMPLETE_EVENT,
	SUBAGENT_CONTROL_EVENT,
	SUBAGENT_CONTROL_INTERCOM_EVENT,
	SUBAGENT_FOREGROUND_COMPLETE_EVENT,
	SUBAGENT_RESULT_INTERCOM_EVENT,
	type SubagentState,
	type WaitCompletion,
	type WaitSubscriptionRecord,
} from "../../shared/types.ts";

const SUBSCRIPTION_VERSION = 1;
const RECONCILE_INTERVAL_MS = 1_000;
/**
 * How often the subscriptions directory is re-scanned for expired records left
 * by other sessions. Rare compared to RECONCILE_INTERVAL_MS because it costs a
 * directory read, and nothing depends on the sweep being prompt.
 */
const FOREIGN_SWEEP_INTERVAL_MS = 60_000;
/**
 * How far past expiry a record armed by another session is kept before it is
 * swept. The owning session settles its own expired records with a "timed out"
 * notice on the next restore(), so removing one the moment it expires would take
 * that notice away from a session that simply had not resumed yet. A day is long
 * enough for an ordinary return and short enough to bound the directory.
 */
const FOREIGN_SWEEP_GRACE_MS = 24 * 60 * 60 * 1000;

export interface ArmWaitSubscriptionInput {
	targetKind: "async" | "foreground";
	runId: string;
	requestedId: string;
	timeoutMs: number;
}

export interface WaitSubscriptionManager {
	arm(input: ArmWaitSubscriptionInput): WaitSubscriptionRecord;
	restore(): void;
	reconcile(): void;
	dispose(): void;
}

interface WaitSubscriptionManagerOptions {
	asyncDirRoot?: string;
	resultsDir?: string;
	subscriptionsDir?: string;
	now?: () => number;
	pollIntervalMs?: number;
	kill?: (pid: number, signal?: NodeJS.Signals | 0) => boolean;
}

function isNotFound(error: unknown): boolean {
	return typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT";
}

function parseRecord(value: unknown): WaitSubscriptionRecord | undefined {
	if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
	const record = value as Partial<WaitSubscriptionRecord>;
	if (record.version !== SUBSCRIPTION_VERSION
		|| typeof record.token !== "string"
		|| !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.token)
		|| typeof record.sessionId !== "string"
		|| (record.targetKind !== "async" && record.targetKind !== "foreground")
		|| typeof record.runId !== "string"
		|| typeof record.requestedId !== "string"
		|| typeof record.createdAt !== "number"
		|| typeof record.expiresAt !== "number") return undefined;
	return record as WaitSubscriptionRecord;
}

function needsAttention(run: AsyncRunSummary): boolean {
	return run.activityState === "needs_attention" || run.steps.some((step) => step.activityState === "needs_attention");
}

function subscriptionFile(dir: string, token: string): string {
	return path.join(dir, `${token}.json`);
}

export function formatWaitSubscriptions(state: Pick<SubagentState, "waitSubscriptions">, now = Date.now()): string | undefined {
	const subscriptions = [...(state.waitSubscriptions?.values() ?? [])].sort((left, right) => left.createdAt - right.createdAt);
	if (subscriptions.length === 0) return undefined;
	const lines = [`Armed wait subscriptions (${subscriptions.length}):`];
	for (const record of subscriptions) {
		lines.push(`- ${record.token}: ${record.targetKind} run ${record.runId}, timeout in ${Math.max(0, record.expiresAt - now)}ms`);
	}
	return lines.join("\n");
}

export function createWaitSubscriptionManager(
	pi: Pick<ExtensionAPI, "events" | "sendMessage">,
	state: SubagentState,
	options: WaitSubscriptionManagerOptions = {},
): WaitSubscriptionManager {
	const asyncDirRoot = options.asyncDirRoot ?? DIRS.async;
	const resultsDir = options.resultsDir ?? DIRS.results;
	const subscriptionsDir = options.subscriptionsDir ?? path.join(path.dirname(asyncDirRoot), "wait-subscriptions");
	const now = options.now ?? Date.now;
	const subscriptions = state.waitSubscriptions ?? new Map<string, WaitSubscriptionRecord>();
	state.waitSubscriptions = subscriptions;
	const unresolvedRestoredForegroundTokens = new Set<string>();
	let disposed = false;
	let lastForeignSweepAt = 0;

	/**
	 * Remove expired records armed by another session.
	 *
	 * Only the owning session can be woken, so restore() never loads a foreign
	 * record into `subscriptions` and reconcileRecord() returns before its
	 * timeout branch. Nothing reconciles such a record and nothing expires it, so
	 * a session that arms a wait and never comes back (forked, renamed, deleted)
	 * leaves one file
```