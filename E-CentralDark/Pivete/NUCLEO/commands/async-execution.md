# COMANDO - async-execution.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\async-execution.ts
**SHA:** 6aeb355c70075014
**Timestamp:** 2026-08-28T02:24:53.009818
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- "This is a non-interactive run: Pi auto-drains current-session background work at agent_end so detached children are not abandoned; call subagent_wait() when this turn must receive the run's results b
- let systemPrompt = a.systemPrompt?.trim() ?? "";
- systemPrompt = systemPrompt ? `${systemPrompt}\n\n${injection}` : injection;
- systemPrompt = systemPrompt ? `${systemPrompt}\n\n${memoryInjection}` : memoryInjection;
- systemPrompt = appendAgentRefinementOverlay(systemPrompt, { cwd: stepCwd, agentName: a.name });
- if (!namespaceOutputPath) systemPrompt = injectOutputPathSystemPrompt(systemPrompt, outputPath, a);
- if (isParallelStep(step)) initialParallelGroups.push({ start: initialFlatIndex, count: step.parallel.length, stepIndex });
- else if (isDynamicParallelStep(step)) initialParallelGroups.push({ start: initialFlatIndex, count: 1, stepIndex });
- const parallelGroups: Array<{ start: number; count: number; stepIndex: number }> = [];
- let flatStepStart = 0;

### Contratos
- const agentContract = s.agentContract ?? params.agentContract;
- return buildSeqStep({ ...t, agentContract: t.agentContract ?? s.agentContract, gateOn: t.gateOn ?? s.gateOn }, staticStep.sessionFile, behaviorCwd, progressPrecreated, parallelBehaviors[taskIndex], st
- const parallel = buildSeqStep({ ...(s.parallel as SequentialStep), agentContract: s.parallel.agentContract ?? s.agentContract, gateOn: s.parallel.gateOn ?? s.gateOn }, undefined, undefined, progressPr
- agentContract: s.agentContract ?? params.agentContract,
- ...(s.agentContract ?? params.agentContract ? { agentContract: s.agentContract ?? params.agentContract } : {}),
- agentContract: params.agentContract,
- agentContract: params.agentContract,
- ...(params.agentContract ? { agentContract: params.agentContract } : {}),
- ...(params.agentContract ? { agentContract: params.agentContract } : {}),

### Gaps
- const { resolved: resolvedSkills, missing: missingSkills } = resolveSkillsWithFallback(
- const { resolved: resolvedSkills, missing: missingSkills } = resolveSkillsWithFallback(

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Async execution logic for subagent tool
 */

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { discoverAgents, formatUnknownAgentError, unknownAgentDiagnosticContext, type AgentConfig, type UnknownAgentDiagnosticContext } from "../../agents/agents.ts";
import { appendAgentRefinementOverlay } from "../../agents/agent-refinements.ts";
import { writePrivateAtomicJson } from "../../shared/atomic-json.ts";
import { currentCompletionOwnerId } from "../../shared/completion-owner.ts";
import { applyThinkingSuffix, projectLaunchResolvedChildExtensions, resolvePiLaunchToolPlan } from "../shared/pi-args.ts";
import { injectOutputPathSystemPrompt, injectSingleOutputInstruction, normalizeSingleOutputOverride, resolveSingleOutputPath, validateFileOnlyOutputMode } from "../shared/single-output.ts";
import { buildChainInstructions, isDynamicParallelStep, isParallelStep, resolveChainPath, resolveExistingReadPaths, resolveStepBehavior, suppressProgressForReadOnlyTask, writeInitialProgressFile, type ChainStep, type ResolvedStepBehavior, type SequentialStep, type StepOverrides } from "../../shared/settings.ts";
import type { RunnerStep } from "../shared/parallel-utils.ts";
import type { ContextMode } from "../shared/context-mode.ts";
import { resolvePiPackageRoot } from "../shared/pi-spawn.ts";
import { resolveNodeExecutable } from "../../shared/node-executable.ts";
import { buildSkillInjection, normalizeSkillInput, resolveSkillsWithFallback } from "../../agents/skills.ts";
import { buildAgentMemoryInjection } from "../../agents/agent-memory.ts";
import { PI_CODING_AGENT_PACKAGE_ROOT_ENV, PROMPT_REDACTED, resolveChildCwd } from "../../shared/utils.ts";
import { buildModelCandidates, inheritsParentModel, resolveEffectiveSubagentModel, resolveModelCandidate, resolveSubagentModelOverride, type AvailableModelInfo, type ParentModel } from "../shared/model-fallback.ts";
import { resolveToolTimeoutMs, toolTimeoutFromEnv } from "../shared/tool-timeout.ts";
import { resolveModelScopesForAgent, type ModelScopeConfig } from "../shared/model-scope.ts";
import { resolveEffectiveThinking } from "../../shared/model-info.ts";
import { assertThinkingWithinCeiling, decodeThinkingCeiling, intersectThinkingCeilings, SUBAGENT_THINKING_CEILING_ENV, type ThinkingLevel } from "../../shared/thinking-ceiling.ts";
import { resolveExpectedWorktreeAgentCwd } from "../shared/worktree.ts";
import { buildWorkflowGraphSnapshot } from "../shared/workflow-graph.ts";
import { ChainOutputValidationError, validateChainOutputBindings } from "../shared/chain-outputs.ts";
import { createStructuredOutputRuntime } from "../shared/structured-output.ts";
import { resolveEffectiveAcceptance, validateAcceptanceInput, validateExecutionAcceptance } from "../shared/acceptance.ts";
import { createRunFanoutBudget, writeRunFanoutBudgetDescriptor } from "../shared/run-fanout-budget.ts";
import { validateImplementationToolContract } from "../shared/completion-guard.ts";
import {
	type AcceptanceInput,
	type AgentContract,
	type AsyncParallelGroupStatus,
	type AsyncStatus,
	type ArtifactConfig,
	type Details,
	type IntercomBridgeConfig,
	type JsonSchemaObject,
	type MaxOutputConfig,
	type NestedRouteInfo,
	type ResolvedControlConfig,
	type ResolvedTurnBudget,
	type ResolvedToolBudget,
	type RunFanoutBudgetDescriptor,
	type ToolBudgetConfig,
	type SubagentRunMode,
	type SteeringRecoveryDescriptor,
	type UsageBudgetConfig,
	DIRS,
	SUBAGENT_ASYNC_STARTED_EVENT,
	SUBAGENT_LIFECYCLE_ARTIFACT_VERSION,
	TEMP_ROOT_DIR,
	getAsyncConfigPath,
	resolveChildMaxSubagentDepth,
} from "../../shared/types.ts";
import { nestedResultsPath, nestedSummaryFromAsyncStatus, resolveInheritedNestedRouteFromEnv, resolveNestedParentAddressFromEnv, writeNestedEvent } from "../shared/nested-events.ts";
import { resultFilePath } from "./result-files.ts";
import { appendTurnBudgetSystemPrompt, initialTurnBudgetState } from "../shared/turn-budget.ts";
import { validateToolBudgetConfig } from "../shared/tool-budget.ts";
import { usageBudgetState } from "../shared/usage-budget.ts";
import type { ImportedAsyncRoot } from "./chain-root-attachment.ts";
import type { SessionLeaseRequest } from "../shared/session-lease.ts";
import { finalizeProcessTerminal, readProcessTerminal } from "./process-terminal.ts";
import type { ActiveAsyncCapacityHandle } from "./active-async-capacity.ts";
import { statusStepDescription } from "./chain-append.ts";
import { SUBAGENT_PROCESS_TERMINAL_EVENT } from "../../shared/types.ts";
import { assertAgentAllowedByCapabilityCeiling, decodeSubagentCapabilityCeiling, intersectSubagentCapabilityCeilings, resolveCurrentSubagentCapabilityCeiling, SUBAGENT_CAPABILITY_CEILING_ENV, type ResolvedSubagen
```