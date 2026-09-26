# CONTRATO - run-status.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\run-status.ts
**SHA:** 2ba580e6a366b19d
**Timestamp:** 2026-08-28T02:24:55.216751
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- owner.sourceRunId ? `Capacity source run: ${owner.sourceRunId}` : undefined,
- `Run: ${status.runId}`,
- function nestedRunDisplayName(run: NestedRunSummary): string {
- function formatRememberedForegroundStatus(run: ForegroundResumeRun): string {
- `Run: ${run.runId}`,
- function formatRememberedForegroundTranscript(run: ForegroundResumeRun, options: { index?: number; lines?: number }): string {
- `Run: ${run.runId}`,
- function formatNestedExactStatus(rootRunId: string, run: NestedRunSummary): string {
- `Nested run: ${run.id}`,
- const run = deps.state?.foregroundRuns?.get(resolved.id);

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import { safeTerminalText } from "../../shared/display-text.ts";
import { formatAsyncRunList, formatAsyncRunOutputPath, formatAsyncRunProgressLabel, listAsyncRuns } from "./async-status.ts";
import { formatAsyncResultTranscript, formatAsyncRunTranscript, formatNestedRunTranscript, inspectSubagentFleet } from "./fleet-view.ts";
import { formatNestedRunStatusLines } from "../shared/nested-render.ts";
import { formatModelThinking } from "../../shared/formatters.ts";
import { formatActivityLabel } from "../../shared/status-format.ts";
import { DIRS, type AsyncStatus, type Details, type ForegroundResumeRun, type NestedRunSummary, type SteeringStatus, type SubagentState } from "../../shared/types.ts";
import { inspectActiveAsyncCapacityOwner, type ActiveAsyncCapacityInspection } from "./active-async-capacity.ts";
import { readStatus } from "../../shared/utils.ts";
import { resolveSubagentIntercomTarget } from "../../intercom/intercom-bridge.ts";
import { normalizeExternalCliRunnerStatus } from "../shared/external-cli-contract.ts";
import { resolveSubagentResultStatus } from "../../intercom/result-intercom.ts";
import { readProcessTerminal, sanitizeProcessTerminal } from "./process-terminal.ts";
import { formatWaitSubscriptions } from "./wait-subscriptions.ts";
import { resolveAsyncRunLocation } from "./async-resume.ts";
import { resolveSubagentRunId } from "./run-id-resolver.ts";
import { flatToLogicalStepIndex, normalizeParallelGroups } from "./parallel-groups.ts";
import { reconcileAsyncRun, reconcileNestedAsyncDescendants } from "./stale-run-reconciler.ts";
import { attachRootChildrenToSteps, findNestedRouteForRootId, projectNestedRegistryForRoot, type NestedRunResolutionScope } from "../shared/nested-events.ts";
import { readMissionBinding } from "../../missions/lifecycle.ts";
import { formatWorkflowJsonPreview } from "../../workflows/scripted-workflow.ts";
import { parseWorkflowChildSummary } from "../../workflows/workflow-child-summary.ts";
import { formatRunFanoutBudget, getRunFanoutBudgetSnapshot, readRunFanoutBudgetDescriptor } from "../shared/run-fanout-budget.ts";
import { getExternalJobProvider } from "../../api/external-job-provider.ts";

interface RunStatusParams {
	action?: string;
	id?: string;
	runId?: string;
	dir?: string;
	index?: number;
	view?: "fleet" | "transcript";
	lines?: number;
}

function formatProcessTerminal(value: AsyncStatus["processTerminal"] | undefined): string {
	if (!value) return "missing";
	return `${value.state}${value.reason ? ` (${value.reason})` : ""}${value.runnerProcessInstanceId ? ` · runner ${value.runnerProcessInstanceId}` : ""}`;
}

function debugProcessTerminal(asyncDir: string, status: AsyncStatus): { sidecar?: AsyncStatus["processTerminal"]; overlay?: AsyncStatus["processTerminal"] } {
	const expected = { runId: status.runId, runnerProcessInstanceId: status.processTerminal?.runnerProcessInstanceId };
	return {
		sidecar: readProcessTerminal(asyncDir, expected),
		overlay: sanitizeProcessTerminal(status.processTerminal, expected, path.join(asyncDir, "status.json")),
	};
}

function formatCapacityOwner(inspect: ActiveAsyncCapacityInspection): string[] {
	if (!inspect.owner) return [`Active capacity: ${inspect.release.state} — ${inspect.release.reason}`];
	const owner = inspect.owner;
	return [
		`Active capacity: ${inspect.release.state} — ${inspect.release.reason}`,
		`Capacity owner: ${inspect.relation} slot ${owner.slot}, ${owner.kind}, generation ${owner.generation}`,
		`Capacity session: ${owner.ownerSessionId}`,
		owner.sourceRunId ? `Capacity source run: ${owner.sourceRunId}` : undefined,
		`Capacity async dir: ${owner.asyncDir}`,
		owner.runnerProcessInstanceId ? `Capacity runner: ${owner.runnerProcessInstanceId}` : undefined,
		owner.runnerStartedAt !== undefined ? `Capacity runner started: ${new Date(owner.runnerStartedAt).toISOString()}` : undefined,
	].filter((line): line is string => line !== undefined);
}

function formatWorkflowDebug(status: AsyncStatus): string[] {
	if (status.mode !== "workflow" && !status.parentWorkflowRunId && !status.workflowKey) return [];
	const lines = [
		status.parentWorkflowRunId ? `Workflow parent: ${status.parentWorkflowRunId}${status.workflowKey ? ` (${status.workflowKey})` : ""}` : undefined,
		status.mode === "workflow" ? `Workflow children: ${(status.steps ?? []).length}` : undefined,
	].filter((line): line is string => line !== undefined);
	for (const [index, step] of (status.steps ?? []).entries()) {
		lines.push(`  ${index + 1}. key ${step.workflowKey ?? "n/a"} · ${step.agent} · ${step.status} · async ${step.async === undefined ? "unknown" : step.async ? "yes" : "no"}${step.runId ? ` · run ${step.runId}` : ""}`);
	}
	return lines;
}

function formatRunLifecycleDebug(input: { status: AsyncStatus; asyncDir: string; sidecarProcessTerminal: AsyncStatus["processTerminal"] | undefine
```