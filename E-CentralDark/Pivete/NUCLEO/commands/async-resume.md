# COMANDO - async-resume.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\async-resume.ts
**SHA:** cf12e57c49357968
**Timestamp:** 2026-08-28T02:24:53.164486
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: descriptor.systemPrompt ?? agentConfig.systemPrompt,
- `Original run: ${target.runId}`,

### Contratos
- const contract = parsed.agentContract as Record<string, unknown>;

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { DIRS, type AcceptanceInput, type AsyncStatus, type ResolvedTurnBudget, type SteeringRecoveryDescriptor, type SubagentRunMode } from "../../shared/types.ts";
import type { AgentConfig } from "../../agents/agents.ts";
import { normalizeExtensionBindings } from "../shared/extension-bindings.ts";
import { validateAcceptanceInput } from "../shared/acceptance.ts";
import { validateToolBudgetConfig } from "../shared/tool-budget.ts";
import { intersectSubagentCapabilityCeilings, parseSubagentCapabilityCeiling, type ResolvedSubagentCapabilityCeiling } from "../shared/capability-ceiling.ts";
import { validateRunFanoutBudgetDescriptor } from "../shared/run-fanout-budget.ts";
import { resolveTurnBudgetConfig } from "../shared/turn-budget.ts";
import { reconcileAsyncRun } from "./stale-run-reconciler.ts";
import { resultFilePath, resultPayloadPathForIndexedRun } from "./result-files.ts";
import { canScanAsyncRunPrefix, MIN_SAFE_ASYNC_RUN_PREFIX_LENGTH } from "./run-id-query.ts";
import { parallelHandoffPath, resolveRetainedWorktreeCwd } from "../shared/parallel-handoff.ts";
import { intersectThinkingCeilings, parseThinkingLevel, type ThinkingLevel } from "../../shared/thinking-ceiling.ts";

export interface AsyncResumeParams {
	id?: string;
	runId?: string;
	dir?: string;
	index?: number;
}

export interface AsyncResumeDeps {
	asyncDirRoot?: string;
	resultsDir?: string;
	kill?: (pid: number, signal?: NodeJS.Signals | 0) => boolean;
	now?: () => number;
}

export interface AsyncResumeOptions {
	requireSessionFile?: boolean;
	sessionId?: string;
}

export type AsyncResumeTarget = {
	kind: "live" | "revive";
	runId: string;
	asyncDir?: string;
	state: AsyncStatus["state"];
	mode?: SubagentRunMode;
	agent: string;
	index: number;
	cwd?: string;
	sessionFile?: string;
	model?: string;
	thinking?: string;
	thinkingCeiling?: ThinkingLevel;
	recoveryDescriptor?: SteeringRecoveryDescriptor;
	capabilityCeiling?: ResolvedSubagentCapabilityCeiling;
	launchContractDigest?: string;
	runner?: NonNullable<AsyncStatus["steps"]>[number]["runner"];
	externalJob?: NonNullable<AsyncStatus["steps"]>[number]["externalJob"];
};

interface AsyncResultFile {
	id?: string;
	runId?: string;
	agent?: string;
	mode?: string;
	state?: string;
	success?: boolean;
	cwd?: string;
	sessionId?: string;
	sessionFile?: string;
	model?: string;
	thinking?: string;
	launchContractDigest?: string;
	capabilityCeiling?: ResolvedSubagentCapabilityCeiling;
	results?: Array<{ agent?: string; success?: boolean; sessionFile?: string; intercomTarget?: string; model?: string; thinking?: string; launchContractDigest?: string; capabilityCeiling?: ResolvedSubagentCapabilityCeiling }>;
}

export interface AsyncRunLocation {
	asyncDir: string | null;
	resultPath: string | null;
	resolvedId?: string;
}

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function ensureObject(value: unknown, source: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`Async result file '${source}' must contain a JSON object.`);
	}
	return value as Record<string, unknown>;
}

function validateOptionalString(value: Record<string, unknown>, field: string, source: string, displayField = field): string | undefined {
	const fieldValue = value[field];
	if (fieldValue === undefined) return undefined;
	if (typeof fieldValue !== "string") throw new Error(`Invalid async result file '${source}': ${displayField} must be a string.`);
	return fieldValue;
}

function validateResultFile(value: unknown, resultPath: string): AsyncResultFile {
	const data = ensureObject(value, resultPath);
	const resultsValue = data.results;
	let results: AsyncResultFile["results"];
	if (resultsValue !== undefined) {
		if (!Array.isArray(resultsValue)) throw new Error(`Invalid async result file '${resultPath}': results must be an array.`);
		results = resultsValue.map((entry, index) => {
			const child = ensureObject(entry, `${resultPath} results[${index}]`);
			const agent = validateOptionalString(child, "agent", resultPath, `results[${index}].agent`);
			const sessionFile = validateOptionalString(child, "sessionFile", resultPath, `results[${index}].sessionFile`);
			const intercomTarget = validateOptionalString(child, "intercomTarget", resultPath, `results[${index}].intercomTarget`);
			const model = validateOptionalString(child, "model", resultPath, `results[${index}].model`);
			const thinking = validateOptionalString(child, "thinking", resultPath, `results[${index}].thinking`);
			const launchContractDigest = validateOptionalString(child, "launchContractDigest", resultPath, `results[${index}].launchContractDigest`);
			const capabilityCeiling = child.capabilityCeiling === undefined ? undefined : parseSubagentCapabilityCeiling(child.capabilityCeiling, `async result file '${resultPath}' results[${index}].capabilityCei
```