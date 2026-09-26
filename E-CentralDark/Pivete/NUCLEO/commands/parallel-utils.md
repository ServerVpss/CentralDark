# COMANDO - parallel-utils.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\shared\parallel-utils.ts
**SHA:** 80c55cefbd24263b
**Timestamp:** 2026-08-28T02:24:57.917443
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- ? `EMPTY OUTPUT (expected output file missing: ${r.outputTargetPath})`

### Ouro Bruto (primeiros 5000 chars)
```
export type ResolvedRunnerConfig = import("../../shared/types.ts").AgentRunnerConfig;

export interface RunnerSubagentStep {
	/** Session id of the direct parent session for permission-system ask forwarding. */
	parentSessionId?: string;
	/** Resolved opt-in rules for native Pi child tool calls. */
	permissionRules?: import("./permissions.ts").PermissionRules;
	agent: string;
	task: string;
	runner?: ResolvedRunnerConfig;
	externalJobFollowUp?: {
		sourceRunId: string;
		sourceStepIndex: number;
		parentProviderJobId: string;
		requestId: string;
		requestDigest: string;
	};
	/** Resolved launch context for this child. */
	context?: "fresh" | "fork";
	importAsyncRoot?: {
		runId: string;
		asyncDir: string;
		resultPath: string;
		index: number;
	};
	phase?: string;
	label?: string;
	outputName?: string;
	structured?: boolean;
	cwd?: string;
	model?: string;
	fast?: boolean;
	thinking?: string;
	thinkingCeiling?: import("../../shared/model-info.ts").ThinkingLevel;
	modelCandidates?: string[];
	/** The primary model is inherited from the parent session and should not be verified against the child-reported active registry model. */
	skipPrimaryModelVerification?: boolean;
	modelVerificationRegistry?: Array<{ provider: string; id: string; fullId: string }>;
	tools?: string[];
	extensions?: string[];
	subagentOnlyExtensions?: string[];
	mcpDirectTools?: string[];
	completionGuard?: boolean;
	systemPrompt?: string | null;
	systemPromptMode?: "append" | "replace";
	inheritProjectContext: boolean;
	inheritSkills: boolean;
	skills?: string[];
	outputPath?: string;
	/** Defer the authoritative output instruction until a dynamic fanout item is materialized. */
	namespaceOutputPath?: boolean;
	outputMode?: "inline" | "file-only";
	sessionFile?: string;
	maxSubagentDepth?: number;
	timeoutMs?: number;
	/** Resolved configured hard per-tool-call timeout (ms); fast tools still have a default when undefined. */
	toolTimeoutMs?: number;
	waitToolEnabled?: boolean;
	structuredOutput?: {
		schema: import("../../shared/types.ts").JsonSchemaObject;
		schemaPath: string;
		outputPath: string;
		acceptanceReportPath?: string;
	};
	structuredOutputSchema?: import("../../shared/types.ts").JsonSchemaObject;
	agentContract?: import("../../shared/types.ts").AgentContract;
	definitionDigest?: string;
	launchBindingTask?: string;
	launchContractDigest?: string;
	extensionBindings?: import("./extension-bindings.ts").ExtensionBindings;
	launchResolvedExtensions?: import("../../shared/types.ts").LaunchResolvedChildExtensionsV1;
	runtimeAcknowledgedExtensions?: import("../../shared/types.ts").RuntimeAcknowledgedChildExtensionsV1;
	effectiveAcceptance?: import("../../shared/types.ts").ResolvedAcceptanceConfig;
	acceptanceInput?: import("../../shared/types.ts").AcceptanceInput;
	acceptanceRole?: import("../../shared/types.ts").AcceptanceRole;
	gateOn?: import("../../shared/types.ts").ChainGateLayer;
	toolBudget?: import("../../shared/types.ts").ResolvedToolBudget;
	capabilityCeiling?: import("./capability-ceiling.ts").ResolvedSubagentCapabilityCeiling;
	capabilityAudit?: import("./capability-ceiling.ts").SubagentCapabilityAudit;
	/** Private stable logical-child path for inherited run fan-out accounting. */
	runFanoutPath?: string;
	/** Run this single child in one managed worktree. */
	worktree?: boolean;
}

export interface ParallelStepGroup {
	parallel: RunnerSubagentStep[];
	concurrency?: number;
	failFast?: boolean;
	worktree?: boolean;
}

export interface DynamicRunnerGroup {
	expand: import("../../shared/settings.ts").DynamicExpandSpec;
	parallel: RunnerSubagentStep;
	collect: import("../../shared/settings.ts").DynamicCollectSpec;
	concurrency?: number;
	failFast?: boolean;
	phase?: string;
	label?: string;
	sessionFiles?: (string | undefined)[];
	thinkingOverrides?: (string | undefined)[];
	effectiveAcceptance?: import("../../shared/types.ts").ResolvedAcceptanceConfig;
	acceptanceInput?: import("../../shared/types.ts").AcceptanceInput;
	acceptanceRole?: import("../../shared/types.ts").AcceptanceRole;
	agentContract?: import("../../shared/types.ts").AgentContract;
	gateOn?: import("../../shared/types.ts").ChainGateLayer;
	capabilityCeiling?: import("./capability-ceiling.ts").ResolvedSubagentCapabilityCeiling;
	capabilityAudit?: import("./capability-ceiling.ts").SubagentCapabilityAudit;
	thinkingCeiling?: import("../../shared/model-info.ts").ThinkingLevel;
}

export type RunnerStep = RunnerSubagentStep | ParallelStepGroup | DynamicRunnerGroup;

export function isParallelGroup(step: RunnerStep): step is ParallelStepGroup {
	return "parallel" in step && Array.isArray(step.parallel);
}

export function isDynamicRunnerGroup(step: RunnerStep): step is DynamicRunnerGroup {
	return "expand" in step && "collect" in step && "parallel" in step && !Array.isArray((step as { parallel?: unknown }).parallel);
}

export function flattenSteps(steps: RunnerStep[]): RunnerSubagentStep[] {
	const flat: RunnerSubagentStep[] = [];
	for (const step of steps)
```