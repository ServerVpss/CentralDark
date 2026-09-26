# OUTRO - result-intercom.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\intercom\result-intercom.ts
**SHA:** 3401a625abf465b1
**Timestamp:** 2026-08-28T02:24:52.456948
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- function compactNestedRun(run: NestedRunSummary | PublicNestedRunSummary, depth = 0): PublicNestedRunSummary {
- `Run: ${input.runId}`,
- `Run: ${input.runId}`,

### Ouro Bruto (primeiros 5000 chars)
```
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import { isUnexplainedProcessSignal } from "../runs/shared/process-signal.ts";
import {
	type Details,
	type IntercomEventBus,
	type NestedRunSummary,
	type PublicNestedRunSummary,
	type ParallelHandoffReference,
	type SingleResult,
	type SubagentResultIntercomChild,
	type SubagentResultIntercomPayload,
	type SubagentResultStatus,
	type SubagentOutputState,
	type SubagentRunMode,
	SUBAGENT_RESULT_INTERCOM_DELIVERY_EVENT,
	SUBAGENT_RESULT_INTERCOM_EVENT,
} from "../shared/types.ts";

export function resolveSubagentResultStatus(input: {
	exitCode?: number;
	success?: boolean;
	state?: string;
	interrupted?: boolean;
	detached?: boolean;
	processSignal?: string | null;
	timedOut?: boolean;
	stopped?: boolean;
	turnBudgetExceeded?: boolean;
}): SubagentResultStatus {
	if (input.detached) return "detached";
	if (input.stopped || input.state === "stopped") return "stopped";
	if (input.interrupted || input.state === "paused") return "paused";
	if (input.success === true) return "completed";
	if (isUnexplainedProcessSignal(input) && input.exitCode !== 0) return "stopped";
	if (input.success === false) return "failed";
	if (input.state === "complete") return "completed";
	if (input.state === "failed") return "failed";
	if (typeof input.exitCode === "number") return input.exitCode === 0 ? "completed" : "failed";
	return "failed";
}

function countStatuses(children: SubagentResultIntercomChild[]): Record<SubagentResultStatus, number> {
	const counts: Record<SubagentResultStatus, number> = {
		completed: 0,
		failed: 0,
		paused: 0,
		stopped: 0,
		detached: 0,
	};
	for (const child of children) {
		counts[child.status] += 1;
	}
	return counts;
}

function formatStatusCounts(counts: Record<SubagentResultStatus, number>): string {
	const parts = [
		counts.completed ? `${counts.completed} completed` : undefined,
		counts.failed ? `${counts.failed} failed` : undefined,
		counts.stopped ? `${counts.stopped} stopped` : undefined,
		counts.paused ? `${counts.paused} paused` : undefined,
		counts.detached ? `${counts.detached} detached` : undefined,
	].filter((part): part is string => Boolean(part));
	return parts.length ? parts.join(", ") : "0 results";
}

function countOutputStates(children: SubagentResultIntercomChild[]): Record<SubagentOutputState, number> {
	const counts: Record<SubagentOutputState, number> = { present: 0, absent: 0, unknown: 0 };
	for (const child of children) counts[child.outputState ?? "unknown"] += 1;
	return counts;
}

function formatOutputCounts(counts: Record<SubagentOutputState, number>): string {
	const parts = [
		counts.present ? `${counts.present} present` : undefined,
		counts.absent ? `${counts.absent} absent` : undefined,
		counts.unknown ? `${counts.unknown} unknown` : undefined,
	].filter((part): part is string => Boolean(part));
	return parts.length ? parts.join(", ") : "0 outputs";
}

function resolveGroupedStatus(children: SubagentResultIntercomChild[]): SubagentResultStatus {
	const counts = countStatuses(children);
	if (counts.failed > 0) return "failed";
	if (counts.stopped > 0) return "stopped";
	if (counts.paused > 0) return "paused";
	if (counts.completed > 0) return "completed";
	if (counts.detached > 0) return "detached";
	return "failed";
}

function compactNestedRun(run: NestedRunSummary | PublicNestedRunSummary, depth = 0): PublicNestedRunSummary {
	return {
		id: run.id,
		parentRunId: run.parentRunId,
		...(run.parentStepIndex !== undefined ? { parentStepIndex: run.parentStepIndex } : {}),
		...(run.parentAgent ? { parentAgent: run.parentAgent } : {}),
		depth: run.depth,
		path: run.path.slice(0, 4).map((part) => ({
			runId: part.runId,
			...(part.stepIndex !== undefined ? { stepIndex: part.stepIndex } : {}),
			...(part.agent ? { agent: part.agent } : {}),
		})),
		...(run.asyncDir ? { asyncDir: run.asyncDir } : {}),
		...(run.sessionId ? { sessionId: run.sessionId } : {}),
		...(run.sessionFile ? { sessionFile: run.sessionFile } : {}),
		...(run.intercomTarget ? { intercomTarget: run.intercomTarget } : {}),
		...(run.ownerIntercomTarget ? { ownerIntercomTarget: run.ownerIntercomTarget } : {}),
		...(run.leafIntercomTarget ? { leafIntercomTarget: run.leafIntercomTarget } : {}),
		...(run.ownerState ? { ownerState: run.ownerState } : {}),
		...(run.mode ? { mode: run.mode } : {}),
		state: run.state,
		...(run.agent ? { agent: run.agent } : {}),
		...(run.agents?.length ? { agents: run.agents.slice(0, 12) } : {}),
		...(run.model ? { model: run.model } : {}),
		...(run.thinking ? { thinking: run.thinking } : {}),
		...(run.currentStep !== undefined ? { currentStep: run.currentStep } : {}),
		...(run.chainStepCount !== undefined ? { chainStepCount: run.chainStepCount } : {}),
		...(run.parallelGroups?.length ? { parallelGroups: run.parallelGroups.slice(0, 8) } : {}),
		...(run.activityState ? { activityState: run.activityState } : {}),
		...(run.lastActivityAt !== undefined ? { lastActivityAt: run
```