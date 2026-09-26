# OUTRO - retained-children.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\retained-children.ts
**SHA:** 6bb88dc807602e6d
**Timestamp:** 2026-08-28T02:24:55.222751
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- function childResumability(run: AsyncRunSummary, step: AsyncRunSummary["steps"][number]): RetainedChildResumability {

### Gaps
- return { state: "not-resumable", reason: `persisted session file is missing: ${sessionFile}` };
- if (!requiredCwd || !fs.statSync(requiredCwd).isDirectory()) return { state: "not-resumable", reason: `required cwd is missing: ${requiredCwd ?? "unknown"}` };

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import { listAsyncRuns, type AsyncRunSummary } from "./async-status.ts";
import { readAsyncRecoveryDescriptor } from "./async-resume.ts";
import type { TokenUsage } from "../../shared/types.ts";
import { parallelHandoffPath, resolveRetainedWorktreeCwd } from "../shared/parallel-handoff.ts";

const MAX_RETAINED_CHILDREN = 10;
const MAX_RETAINED_CHILD_CANDIDATES = 100;
const MAX_TASK_SUMMARY_LENGTH = 120;

type RetainedChildState = "complete" | "failed" | "paused" | "stopped";
type RetainedChildResumability =
	| { state: "resumable"; sessionPath: string }
	| { state: "not-resumable"; reason: string };

export interface RetainedChild {
	runId: string;
	parentRunId?: string;
	workflowKey?: string;
	state: RetainedChildState;
	agent: string;
	taskSummary: string;
	completedAt: number;
	resumability: RetainedChildResumability;
	sessionPath?: string;
	tokenTotals?: TokenUsage;
}

function isRetainedChildState(state: AsyncRunSummary["state"]): state is RetainedChildState {
	return state === "complete" || state === "failed" || state === "paused" || state === "stopped";
}

function isTerminalStepStatus(status: AsyncRunSummary["steps"][number]["status"]): boolean {
	return status === "complete" || status === "completed" || status === "failed" || status === "paused" || status === "stopped";
}

function retainedSessionFile(sessionFile: string | undefined): RetainedChildResumability {
	if (!sessionFile) return { state: "not-resumable", reason: "no persisted session file" };
	if (!sessionFile.endsWith(".jsonl")) return { state: "not-resumable", reason: "persisted session file is not a .jsonl file" };
	try {
		const stat = fs.lstatSync(sessionFile);
		if (!stat.isFile() || stat.isSymbolicLink()) return { state: "not-resumable", reason: "persisted session file is not a regular file" };
		return { state: "resumable", sessionPath: sessionFile };
	} catch (error) {
		if (typeof error === "object" && error !== null && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
			return { state: "not-resumable", reason: `persisted session file is missing: ${sessionFile}` };
		}
		return { state: "not-resumable", reason: `persisted session file could not be inspected: ${error instanceof Error ? error.message : String(error)}` };
	}
}

function childResumability(run: AsyncRunSummary, step: AsyncRunSummary["steps"][number]): RetainedChildResumability {
	if (run.state === "stopped" || step.status === "stopped") return { state: "not-resumable", reason: "stopped run" };
	if (step.runner?.type === "external-cli" || step.runner?.type === "external-job") return { state: "not-resumable", reason: "external runner" };
	const session = retainedSessionFile(step.sessionFile ?? run.sessionFile);
	if (session.state === "not-resumable") return session;
	let recoveryDescriptor: ReturnType<typeof readAsyncRecoveryDescriptor>;
	try {
		recoveryDescriptor = readAsyncRecoveryDescriptor(run.asyncDir);
		if (!recoveryDescriptor) return { state: "not-resumable", reason: "missing recovery descriptor" };
		if (recoveryDescriptor.sourceRunId !== run.id) return { state: "not-resumable", reason: `recovery descriptor belongs to run ${recoveryDescriptor.sourceRunId}` };
		if (recoveryDescriptor.agent !== step.agent) return { state: "not-resumable", reason: `recovery descriptor belongs to agent ${recoveryDescriptor.agent}` };
	} catch (error) {
		return { state: "not-resumable", reason: `invalid recovery descriptor: ${error instanceof Error ? error.message : String(error)}` };
	}
	let requiredCwd: string | undefined;
	try {
		requiredCwd = resolveRetainedWorktreeCwd(parallelHandoffPath(run.asyncDir), run.id, step.index) ?? recoveryDescriptor.cwd ?? run.cwd;
		if (!requiredCwd || !fs.statSync(requiredCwd).isDirectory()) return { state: "not-resumable", reason: `required cwd is missing: ${requiredCwd ?? "unknown"}` };
	} catch (error) {
		return { state: "not-resumable", reason: `resume dependency unavailable: ${error instanceof Error ? error.message : String(error)}` };
	}
	return session;
}

function boundedTaskSummary(value: string | undefined): string {
	const normalized = value?.replace(/\s+/g, " ").trim() ?? "";
	return normalized.length > MAX_TASK_SUMMARY_LENGTH
		? `${normalized.slice(0, MAX_TASK_SUMMARY_LENGTH - 1)}…`
		: normalized;
}

export function listRetainedChildren(asyncDirRoot: string, sessionId: string): RetainedChild[] {
	const children = listAsyncRuns(asyncDirRoot, { sessionId, states: ["complete", "failed", "paused", "stopped"], entryLimit: MAX_RETAINED_CHILD_CANDIDATES, reconcile: false })
		.flatMap((run) => {
			if (!run.parentWorkflowRunId || run.steps.length !== 1) return [];
			if (!isRetainedChildState(run.state)) return [];
			const step = run.steps[0]!;
			if (!isTerminalStepStatus(step.status)) return [];
			const completedAt = run.endedAt ?? run.lastUpdate;
			if (completedAt === undefined) return [];
			const resumability = childResumability(run, step);
			return [{
				runId: run.id,
	
```