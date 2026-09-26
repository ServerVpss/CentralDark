# AGENTE - subagent-wait.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\subagent-wait.ts
**SHA:** 65432064edc878ef
**Timestamp:** 2026-08-28T02:24:55.256878
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- function matchesId(run: AsyncRunSummary, id: string): boolean {
- function summarizeForegroundChildren(run: ForegroundResumeRun, indices: Set<number>): string {
- function foregroundChildrenNeedingAttention(run: ForegroundResumeRun, indices: Set<number>) {
- function formatForegroundAttention(run: ForegroundResumeRun, children: ReturnType<typeof foregroundChildrenNeedingAttention>, elapsedMs: number): AgentToolResult<Details> {
- function needsAttention(run: AsyncRunSummary): boolean {
- function hasSupervisorTool(run: AsyncRunSummary): boolean {
- const start = Math.max(0, stat.size - TRANSCRIPT_TAIL_BYTES);
- function detachedForegroundWaitUpdate(run: ForegroundResumeRun, pendingIndices: Set<number>, nowMs: number, elapsedMs: number): AgentToolResult<Details> {
- run: ForegroundResumeRun,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * `subagent_wait` tool: block the current turn until outstanding async runs
 * or a named remembered detached foreground run finishes.
 *
 * Background subagent runs are detached. In an interactive session the parent
 * can end its turn and Pi will wake it with a completion notification. That
 * does not work when the parent is a skill that must run to completion, and it
 * cannot work at all non-interactively (`pi -p ...`), where the run is a single
 * turn: once the turn ends there is nothing left to receive the notification.
 *
 * `subagent_wait` closes that gap. It keeps the turn alive until a tracked async
 * run for this session reaches a terminal state (complete / failed / paused),
 * the caller-supplied timeout elapses, or the turn is aborted. Because it awaits
 * inside the turn, the completion the model was told to wait for is actually
 * observed before the tool returns.
 *
 * By default `subagent_wait` returns as soon as ONE run finishes, so a fleet
 * manager can use it in a rolling-replacement loop: launch N workers, wait for
 * the next one to finish, spawn its replacement, then call `subagent_wait`
 * again — keeping N in flight instead of draining to zero between batches.
 * Pass `all: true` to block until every tracked async run is terminal, or `id`
 * to block on one specific async or remembered detached foreground run.
 *
 * `subagent_wait` also returns when a run needs attention — not just on
 * completion. A child that goes idle or blocks for a decision surfaces
 * `needs_attention` (the same signal Pi shows as a control notice and,
 * interactively, wakes the parent with). Since `subagent_wait` is used exactly
 * where there is no next turn to receive that notice, it must break on it too,
 * or a stuck child would stall the loop until the timeout. Attention runs are
 * reported so the caller can inspect / nudge / resume / interrupt them.
 *
 * Wake mechanism: when given Pi's event bus (`deps.events`), `subagent_wait`
 * subscribes to the subagent completion/control channels and wakes the instant
 * any fires, rather than waiting out a fixed poll interval. A poll still runs
 * on the interval as a reconciliation fallback (crashed runners, missed
 * events), and the poll is the source of truth for what actually changed — the
 * event only ends the sleep early. With no bus, `subagent_wait` degrades to pure
 * polling.
 */

import * as fs from "node:fs";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import {
	listBackgroundWorkWakeChannels,
	snapshotBackgroundWork,
	type BackgroundWorkSnapshot,
	type RegisteredBackgroundWorkItem,
} from "../../api/background-work.ts";
import { formatAsyncRunList, listAsyncRuns, type AsyncRunSummary } from "./async-status.ts";
import {
	DIRS,
	INTERCOM_DETACH_REQUEST_EVENT,
	SUBAGENT_ASYNC_COMPLETE_EVENT,
	SUBAGENT_FOREGROUND_COMPLETE_EVENT,
	SUBAGENT_CONTROL_EVENT,
	SUBAGENT_CONTROL_INTERCOM_EVENT,
	SUBAGENT_RESULT_INTERCOM_EVENT,
	type Details,
	type ForegroundResumeRun,
	type SubagentState,
	type WaitCompletion,
} from "../../shared/types.ts";
import { formatDuration, shortenPath } from "../../shared/formatters.ts";
import { collectWaitCompletions } from "./wait-completions.ts";
import { formatResumeFirstFailedRunsNote } from "./resume-guidance.ts";
export { WAIT_TOOL_ENABLED_ENV, resolveWaitToolConfig, type ResolvedWaitToolConfig } from "./wait-config.ts";

/** States that mean a run is still in flight (not yet resolved). */
const ACTIVE_STATES: ReadonlyArray<AsyncRunSummary["state"]> = ["queued", "running"];

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MIN_POLL_INTERVAL_MS = 250;
const DEFAULT_POLL_INTERVAL_MS = 1000;

export interface SubagentWaitParams {
	/** Optional run id/prefix to wait for. When omitted, waits across every active run in this session. */
	id?: string;
	/** Arm a durable exact-run wake subscription and return immediately. Requires id. */
	nonBlocking?: boolean;
	/**
	 * When true, block until EVERY active run in this session (or matching `id`)
	 * is terminal. Default false: return as soon as the first run finishes, so a
	 * fleet manager can spawn a replacement and wait again. Ignored when `id`
	 * targets a single run.
	 */
	all?: boolean;
	/** Give up after this many milliseconds. Defaults to 30 minutes. */
	timeoutMs?: number;
	/** False keeps a blocking wait open through idle attention; supervisor/contact requests still stop the wait. */
	stopOnAttention?: boolean;
}

/** Minimal event-bus surface wait subscribes to (matches pi.events). */
export interface WaitEventBus {
	on(channel: string, handler: (data: unknown) => void): () => void;
}

export interface SubagentWaitDeps {
	state: SubagentState;
	/** Stream live wait status into Pi's pending tool row. */
	onUpdate?: (result: AgentToolResult<Details>) => void;
	asyncDirRoot?: string;
	resultsDir?: string;
	kill?: (pid: number, signal?: NodeJS.Signals | 0) => boolean;
	now?: () => number;
	pollIntervalMs?: number;
	/** False ma
```