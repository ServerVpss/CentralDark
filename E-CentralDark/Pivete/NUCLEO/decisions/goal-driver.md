# DECISAO - goal-driver.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\missions\goal-driver.ts
**SHA:** a6d8dfc3e3909993
**Timestamp:** 2026-08-28T02:24:52.521331
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- function readLinkedRun(run: MissionRunLink): MissionRunLink {
- const latestRun = record.runs.at(-1);
- const latestRun = record.runs.at(-1);

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { RetainedChild } from "../runs/background/retained-children.ts";
import type { ControlEvent } from "../shared/types.ts";
import { listMissions, readMission, updateMission } from "./store.ts";
import type { MissionRecord, MissionRunLink, MissionStoreLocation } from "./types.ts";
import { missionStatePath } from "./workflow-state.ts";

const TERMINAL_MISSION_STATUSES = new Set(["completed", "failed", "cancelled"]);
const ACTIVE_RUN_STATUSES = new Set(["queued", "running", "active"]);
const MAX_ACTION_LENGTH = 180;

export interface GoalContinuationNotice {
	missionId: string;
	message: string;
	event: ControlEvent;
}

function bounded(value: string): string {
	const normalized = value.replace(/\s+/g, " ").trim();
	return normalized.length > MAX_ACTION_LENGTH ? `${normalized.slice(0, MAX_ACTION_LENGTH - 1)}…` : normalized;
}

function tokenUsage(value: unknown): number | undefined {
	if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
	const total = (value as { total?: unknown }).total;
	return Number.isSafeInteger(total) && (total as number) >= 0 ? total as number : undefined;
}

function readLinkedRun(run: MissionRunLink): MissionRunLink {
	if (!run.asyncDir) return run;
	const statusPath = path.join(run.asyncDir, "status.json");
	if (!fs.existsSync(statusPath)) return run;
	const status = JSON.parse(fs.readFileSync(statusPath, "utf-8")) as Record<string, unknown>;
	if (typeof status.state !== "string" || !status.state.trim()) throw new Error(`Linked run status '${statusPath}' is missing state`);
	const tokens = tokenUsage(status.totalTokens)
		?? (Array.isArray(status.steps)
			? status.steps.reduce((total, step) => {
				if (!step || typeof step !== "object") return total;
				return total + (tokenUsage((step as { tokens?: unknown }).tokens) ?? 0);
			}, 0)
			: undefined);
	return {
		...run,
		status: status.state,
		...(!ACTIVE_RUN_STATUSES.has(status.state) && !run.completedAt ? { completedAt: new Date().toISOString() } : {}),
		...(tokens !== undefined ? { usage: { tokens } } : {}),
	};
}

function refreshGoalMission(location: MissionStoreLocation, record: MissionRecord): MissionRecord {
	const runs = record.runs.map(readLinkedRun);
	const changed = runs.some((run, index) => JSON.stringify(run) !== JSON.stringify(record.runs[index]));
	if (!changed) return record;
	const active = runs.some((run) => run.status && ACTIVE_RUN_STATUSES.has(run.status));
	return updateMission(location, record.id, {
		status: active ? "active" : record.goal ? "active" : record.status,
		addRuns: runs,
	});
}

function readyActionFromValue(value: unknown, pathLabel = "state", depth = 0): string | undefined {
	if (depth > 8 || !value || typeof value !== "object") return undefined;
	if (Array.isArray(value)) {
		for (let index = 0; index < value.length; index += 1) {
			const found = readyActionFromValue(value[index], `${pathLabel}[${index}]`, depth + 1);
			if (found) return found;
		}
		return undefined;
	}
	const input = value as Record<string, unknown>;
	for (const key of ["nextReadyAction", "nextAction"] as const) {
		if (typeof input[key] === "string" && input[key].trim()) return bounded(input[key]);
	}
	if (input.status === "ready") {
		for (const key of ["action", "task", "title", "summary"] as const) {
			if (typeof input[key] === "string" && input[key].trim()) return bounded(input[key]);
		}
		return `Continue ready mission state at ${pathLabel}`;
	}
	for (const [key, child] of Object.entries(input)) {
		const found = readyActionFromValue(child, `${pathLabel}.${key}`, depth + 1);
		if (found) return found;
	}
	return undefined;
}

function missionStateAction(location: MissionStoreLocation, record: MissionRecord): string | undefined {
	const statePath = missionStatePath(location, record.id);
	if (fs.existsSync(statePath)) {
		const action = readyActionFromValue(JSON.parse(fs.readFileSync(statePath, "utf-8")));
		if (action) return action;
	}
	const decision = record.decisions.find((item) => item.status === "open");
	if (decision) return bounded(decision.recommendation ?? `Resolve decision: ${decision.title}`);
	return undefined;
}

function retainedResumeTarget(record: MissionRecord, retainedChildren: RetainedChild[]): RetainedChild | undefined {
	const latestRun = record.runs.at(-1);
	if (!latestRun) return undefined;
	return retainedChildren.find((child) =>
		child.resumability.state === "resumable" && (child.runId === latestRun.runId || child.parentRunId === latestRun.runId)
	);
}

function nextReadyAction(location: MissionStoreLocation, record: MissionRecord, retainedChildren: RetainedChild[]): string {
	const stateAction = missionStateAction(location, record);
	const latestRun = record.runs.at(-1);
	const action = stateAction
		?? (latestRun?.status === "failed" || latestRun?.status === "paused"
			? `Inspect linked run ${latestRun.runId} and continue the mission`
			: `Continue objective: ${record.object
```