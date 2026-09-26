# COMANDO - lifecycle.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\missions\lifecycle.ts
**SHA:** da9499a69313f7e0
**Timestamp:** 2026-08-28T02:24:52.714080
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run: MissionRunLink = {

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import { writePrivateAtomicJson } from "../shared/atomic-json.ts";
import { PROMPT_REDACTED } from "../shared/utils.ts";
import type { Details, SubagentRunMode } from "../shared/types.ts";
import { validateMissionLaunch } from "./actions.ts";
import type { MissionArtifact, MissionRecord, MissionRunLink, MissionRunMode, MissionStatus, MissionStoreConfig, MissionStoreLocation } from "./types.ts";
import { createMission, MissionNotFoundError, missionRecordPath, readMission, resolveMissionStoreLocation, updateMission, validateMissionId } from "./store.ts";

export const MISSION_BINDING_FILE = "mission.json";

export interface MissionLaunchParams {
	missionId?: string;
	mission?: unknown;
	task?: string;
	tasks?: Array<{ task?: string }>;
	chain?: Array<{ task?: string; parallel?: Array<{ task?: string }> | { task?: string } }>;
}

export interface MissionLaunchBinding {
	missionId: string;
	location: MissionStoreLocation;
	autoCreated: boolean;
	announceInContent?: boolean;
}

interface PersistedMissionBinding {
	schemaVersion: 1;
	missionId: string;
	projectRoot: string;
	missionDir: string;
	globalIndexDir: string;
	writeGlobalIndex: boolean;
	retainTerminal?: number;
}

function workflowObjective(params: MissionLaunchParams): string | undefined {
	const objective = params.task?.trim()
		|| params.tasks?.find((task) => task.task?.trim())?.task?.trim()
		|| params.chain?.find((step) => step.task?.trim())?.task?.trim();
	if (objective) return objective;
	for (const step of params.chain ?? []) {
		const parallel = Array.isArray(step.parallel) ? step.parallel : step.parallel ? [step.parallel] : [];
		const task = parallel.find((child) => child.task?.trim())?.task?.trim();
		if (task) return task;
	}
	return undefined;
}

export function prepareMissionLaunch(input: {
	params: MissionLaunchParams;
	projectRoot: string;
	config?: MissionStoreConfig;
	ownerSessionId?: string;
}): MissionLaunchBinding | undefined {
	const hasMissionId = input.params.missionId !== undefined;
	if (hasMissionId && input.params.mission !== undefined) throw new Error("Use missionId or mission, not both");
	if (input.params.mission === false) return undefined;
	const objective = workflowObjective(input.params);
	const missionsEnabled = input.config?.enabled !== false;
	const shouldCreate = input.params.mission !== undefined || (missionsEnabled && objective !== undefined);
	if (!hasMissionId && !shouldCreate) return undefined;
	const location = resolveMissionStoreLocation({ projectRoot: input.projectRoot, ...(input.config ? { config: input.config } : {}) });
	if (hasMissionId) {
		const missionId = validateMissionId(input.params.missionId);
		readMission(location, missionId);
		updateMission(location, missionId, { status: "active" });
		return { missionId, location, autoCreated: false, announceInContent: true };
	}
	const mission = input.params.mission !== undefined ? validateMissionLaunch(input.params.mission) : undefined;
	const promptDerivedObjective = mission?.objective ?? (mission ? mission.title : objective ? PROMPT_REDACTED : undefined);
	const title = mission?.title || PROMPT_REDACTED;
	const record = createMission(location, {
		title,
		objective: promptDerivedObjective || title,
		...(mission?.goal === true ? { goal: true as const } : {}),
		...(mission?.budget ? { budget: mission.budget } : {}),
		status: "active",
		...(mission?.labels ? { labels: mission.labels } : {}),
		...(input.ownerSessionId ? { ownerSessionId: input.ownerSessionId } : {}),
	}, new Date(), input.config?.retainTerminal);
	return { missionId: record.id, location, autoCreated: true, announceInContent: true };
}

function toolResultIsError(result: AgentToolResult<Details>): boolean {
	return "isError" in result && result.isError === true;
}

function missionRunModeForResult(mode: Details["mode"]): MissionRunMode {
	return mode === "management" ? "external" : mode;
}

function runStatusForResult(result: AgentToolResult<Details>): string {
	if (result.details.asyncDir) return "active";
	if (result.details.results.some((child) => child.interrupted || child.detached)) return "paused";
	if (toolResultIsError(result) || result.details.results.some((child) => child.exitCode !== 0)) return "failed";
	return "completed";
}

function missionStatusForRun(record: MissionRecord, runId: string, runStatus: string): MissionStatus {
	if (record.status === "completed" || record.status === "failed" || record.status === "cancelled") return record.status;
	if (runStatus === "active" || runStatus === "queued" || runStatus === "running") return "active";
	if (record.goal) return "active";
	if (runStatus === "paused") return "waiting";
	const otherActive = record.runs.some((run) => run.runId !== runId && (run.status === "active" || run.status === "queued" || run.status === "running"));
	if (otherActive) return
```