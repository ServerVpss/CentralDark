# MISSAO - scheduled-runs.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\scheduled-runs.ts
**SHA:** 731ad500d01b17bd
**Timestamp:** 2026-08-28T02:24:55.185201
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- writeRun(schedule: ScheduleRecord, run: ScheduleRunRecord, event: string): void {
- const run = store.history(id).find((item) => item.asyncId === asyncId && item.state === "running");
- return textResult([`Schedule: ${schedule.id}`, `Name: ${schedule.name}`, `State: ${schedule.paused ? "paused" : schedule.activeRunId ? "running" : "scheduled"}`, `Target: ${targetLabel(schedule.target
- const run = await this.launch(store, schedule, this.now(), "manual", false);
- const run = store.history(schedule.id).find((item) => item.id === schedule.activeRunId);
- const run: ScheduleRunRecord = { schemaVersion: 1, id: this.randomId(), scheduleId: schedule.id, plannedAt: timestamp(planned), dueReason, state: "running", startedAt: timestamp(now) };
- private finishRun(store: ScheduleStore, schedule: ScheduleRecord, run: ScheduleRunRecord, success: boolean, error?: string): void {
- const run: ScheduleRunRecord = {

### Ouro Bruto (primeiros 5000 chars)
```
import { createHash, randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getProjectSubagentsDir } from "../../shared/artifacts.ts";
import { writePrivateAtomicJson } from "../../shared/atomic-json.ts";
import { shortenPath } from "../../shared/formatters.ts";
import type { AsyncStatus, Details, ExtensionConfig } from "../../shared/types.ts";
import type { SubagentParamsLike } from "../foreground/subagent-executor.ts";
import { validateExecutionAcceptance } from "../shared/acceptance.ts";
import type { ResolvedSubagentCapabilityCeiling } from "../shared/capability-ceiling.ts";
import { previewSimpleWorkflowRun } from "../../workflows/scripted-workflow.ts";

export const SCHEDULED_RUN_ACTIONS = [
	"schedule.create",
	"schedule.list",
	"schedule.show",
	"schedule.history",
	"schedule.pause",
	"schedule.resume",
	"schedule.run",
	"schedule.run-due",
	"schedule.delete",
] as const;

const MAX_TIMER_DELAY_MS = 2_147_483_647;
const DEFAULT_MAX_PENDING = 20;
const MAX_HISTORY = 100;
const STALE_LAUNCH_CLAIM_MS = 5 * 60_000;
const SCHEDULE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

type ScheduledRunTimers = Pick<typeof globalThis, "setTimeout" | "clearTimeout">;
export type ScheduledRunAction = typeof SCHEDULED_RUN_ACTIONS[number];
export type ScheduleRunState = "running" | "skipped" | "missed" | "completed" | "failed_launch" | "failed_run";
export type ScheduleTrigger =
	| { kind: "once"; at: string; nextRunAt?: string }
	| { kind: "interval"; every: string; everyMs: number; anchorAt: string; nextRunAt: string };
export type ScheduleTarget = { workflowScript: string };

export interface ScheduleRecord {
	schemaVersion: 1;
	id: string;
	name: string;
	cwd: string;
	trigger: ScheduleTrigger;
	target: ScheduleTarget;
	overlap: "skip";
	catchUp: "none" | "latest";
	timeoutMs?: number;
	paused: boolean;
	createdAt: string;
	updatedAt: string;
	activeRunId?: string;
	lastRunId?: string;
}

export interface ScheduleRunRecord {
	schemaVersion: 1;
	id: string;
	scheduleId: string;
	plannedAt: string;
	dueReason: "timer" | "run-due" | "manual";
	state: ScheduleRunState;
	startedAt?: string;
	completedAt?: string;
	asyncId?: string;
	asyncDir?: string;
	error?: string;
}

type ScheduledRunManagerDeps = {
	config: ExtensionConfig;
	launch(params: SubagentParamsLike, ctx: ExtensionContext, signal: AbortSignal): Promise<AgentToolResult<Details>>;
	storeRoot?: string;
	now?: () => number;
	randomId?: () => string;
	resolveCapabilityCeiling?: (sessionId: string) => ResolvedSubagentCapabilityCeiling | undefined;
	timers?: ScheduledRunTimers;
};

export function isScheduledRunAction(action: unknown): action is ScheduledRunAction {
	return typeof action === "string" && (SCHEDULED_RUN_ACTIONS as readonly string[]).includes(action);
}

export function scheduledRunsEnabled(config: ExtensionConfig): boolean {
	return config.scheduledRuns?.enabled !== false;
}

export function scheduledRunStorePath(cwd: string, _sessionId?: string, root?: string): string {
	if (!root) return path.join(getProjectSubagentsDir(path.resolve(cwd)), "schedules");
	const projectKey = createHash("sha256").update(path.resolve(cwd)).digest("hex").slice(0, 20);
	return path.join(root, projectKey);
}

export function parseScheduledRunTime(at: string, now = Date.now()): number {
	const trimmed = at.trim();
	const relative = trimmed.match(/^\+(\d+)(s|m|h|d)$/);
	if (relative) {
		const amount = Number(relative[1]);
		if (!Number.isSafeInteger(amount) || amount < 1) throw new Error(`Invalid at value "${at}". Relative delays must be positive, such as "+10m".`);
		const unitMs = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[relative[2] as "s" | "m" | "h" | "d"];
		const result = now + amount * unitMs;
		if (!Number.isSafeInteger(result)) throw new Error(`Invalid at value "${at}". Relative delay is too large.`);
		return result;
	}
	const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/);
	if (!iso) throw new Error(`Invalid at value "${at}". Use a one-shot delay such as "+10m" or an ISO timestamp with timezone.`);
	const year = Number(iso[1]);
	const month = Number(iso[2]);
	const day = Number(iso[3]);
	const hour = Number(iso[4]);
	const minute = Number(iso[5]);
	const second = iso[6] === undefined ? 0 : Number(iso[6]);
	const zone = iso[7]!;
	const offsetHour = zone === "Z" ? 0 : Number(zone.slice(1, 3));
	const offsetMinute = zone === "Z" ? 0 : Number(zone.slice(4, 6));
	const daysInMonth = month >= 1 && month <= 12 ? new Date(Date.UTC(year, month, 0)).getUTCDate() : 0;
	const parsed = Date.parse(trimmed);
	if (month < 1 || month > 12 || day < 1 || day > daysInMonth || hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59 || !Number.isFinite(parsed)) throw new Error(`Invalid at valu
```