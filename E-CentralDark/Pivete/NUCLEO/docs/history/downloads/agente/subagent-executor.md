# AGENTE - subagent-executor.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\foreground\subagent-executor.ts
**SHA:** eb8f4d831cb9cdb4
**Timestamp:** 2026-08-28T02:24:56.971439
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `Run: ${control.runId}`,
- const run = state.foregroundRuns?.get(event.runId);
- let run = state.foregroundRuns.get(input.runId);
- run = { runId: input.runId, mode: input.mode, cwd: input.cwd, ...(input.sessionId ? { sessionId: input.sessionId } : {}), updatedAt, children: [] };
- const run = matches[0]!;
- function nestedRunSessionFile(run: NestedRunSummary): string | undefined {
- function nestedRunAgent(run: NestedRunSummary): string | undefined {
- function validateNestedSessionFile(run: NestedRunSummary, trustedSessionRoots: string[]): string {
- const run = match.match.run;
- const run = target.match.run;

### Contratos
- const resumeContract = omitUndefinedProperties({
- agentContract: input.params.agentContract,
- ...(child.resumeContract ? { resumeContract: child.resumeContract } : {}),
- agentContract: input.params.agentContract,
- const foregroundContract = target.source === "foreground" ? target.resumeContract : undefined;
- const agentContract = input.params.agentContract ?? foregroundContract?.agentContract ?? recoveryDescriptor?.agentContract;
- agentContract: params.agentContract,
- agentContract: params.agentContract,
- const agentContract = Object.hasOwn(childParams, "agentContract") ? childParams.agentContract : workflowDefaults.agentContract;
- ...(agentContract !== undefined ? { agentContract: agentContract as AgentContract } : {}),

### Ouro Bruto (primeiros 5000 chars)
```
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { discoverAgents, findBlockingAgentDiagnostic, formatUnknownAgentError, resolveAgentName, unknownAgentDiagnosticContext, type AgentConfig, type AgentDiscoveryDiagnostic, type AgentScope, type UnknownAgentDiagnosticContext } from "../../agents/agents.ts";
import { getArtifactsDir, getChainRunsDir, getProjectArtifactPackagingWarning, getProjectSubagentsDir } from "../../shared/artifacts.ts";
import { writeAtomicJson } from "../../shared/atomic-json.ts";
import { createCapacityResilientJsonWriter } from "../../shared/capacity-resilient-json.ts";
import { isStorageCapacityError } from "../../shared/file-system-retry.ts";
import { resolveEffectiveThinking, toModelInfo, type ModelInfo } from "../../shared/model-info.ts";
import {
	beginForegroundChild,
	finishForegroundChild,
	foregroundSchedulingSettled,
	retainForegroundSchedulingOwner,
	settleForegroundSchedulingOwner,
	updateForegroundChild,
} from "./foreground-control.ts";
import { getLivePromptAudit, rewritePromptWithGuidance, updateLiveEffectivePrompt } from "./prompt-audit.ts";
import { persistForegroundRunHistory, MAX_REMEMBERED_FOREGROUND_RUNS } from "./foreground-history.ts";
import { resolveExecutionAgentScope } from "../../agents/agent-scope.ts";
import { handleManagementAction } from "../../agents/agent-management.ts";
import { handleRefinementAction } from "../../agents/agent-refinements.ts";
import { buildDoctorReport } from "../../extension/doctor.ts";
import { readSubagentGuide } from "../../extension/subagent-guide.ts";
import { normalizePublicSubagentExecution } from "../../extension/public-execution.ts";
import { runSync } from "./execution.ts";
import { handleWatchdogToolAction, WATCHDOG_TOOL_ACTIONS } from "../../watchdog/tool-actions.ts";
import type { MainWatchdogRuntime } from "../../watchdog/runtime.ts";
import { buildModelCandidates, inheritsParentModel, normalizeParentModel, resolveEffectiveSubagentModel, resolveModelCandidate, type ParentModel } from "../shared/model-fallback.ts";
import { formatRetainedChildren, listRetainedChildren } from "../background/retained-children.ts";
import { resolveModelScopesForAgent, type ModelScopeConfig } from "../shared/model-scope.ts";
import { aggregateParallelOutputs } from "../shared/parallel-utils.ts";
import { recordRun } from "../shared/run-history.ts";
import {
	buildChainInstructions,
	writeInitialProgressFile,
	getStepAgents,
	isParallelStep,
	isDynamicParallelStep,
	resolveChainPath,
	resolveExistingReadPaths,
	resolveStepBehavior,
	suppressProgressForReadOnlyTask,
	taskDisallowsFileUpdates,
	type ChainStep,
	type DynamicParallelStep,
	type ParallelStep,
	type ParallelTaskItem,
	type ResolvedStepBehavior,
	type SequentialStep,
	type StepOverrides,
} from "../../shared/settings.ts";
import { discoverAvailableSkills, normalizeSkillInput } from "../../agents/skills.ts";
import { buildAsyncRunnerSteps, DEFAULT_ASYNC_TIMEOUT_MS, executeAsyncChain, executeAsyncSingle, formatAsyncStartedMessage, isAsyncAvailable, workflowAwaitedAsyncResultPath } from "../background/async-execution.ts";
import { updateActiveRunIndex } from "../background/active-run-index.ts";
import { steeringReceipt } from "../background/steering.ts";
import { acquireActiveAsyncCapacity, ActiveAsyncCapacityError, getActiveAsyncCapacitySnapshot, resolveAbandonedSlotReleaseAfterMs, resolveMaxActiveAsyncRunsPerSession, transferActiveAsyncCapacity, type ActiveAsyncCapacityHandle } from "../background/active-async-capacity.ts";
import { isScheduledRunAction, type ScheduledRunAction } from "../background/scheduled-runs.ts";
import { enqueueChainAppendRequest, readPendingChainAppendRequests, runnerStepOutputNames } from "../background/chain-append.ts";
import { ChainOutputValidationError, validateChainOutputBindingsWithContext } from "../shared/chain-outputs.ts";
import { normalizeGateAcceptance, validateExecutionAcceptance } from "../shared/acceptance.ts";
import { canPreferFork, createForkContextResolver, forkedChildRequiresThinkingOff, resolveSubagentLaunchContext } from "../../shared/fork-context.ts";
import { createPrunedForkSessionWriter } from "../../shared/pruned-fork.ts";
import { resolveCurrentSessionId } from "../../shared/session-identity.ts";
import { currentCompletionOwnerId } from "../../shared/completion-owner.ts";
import { applyIntercomBridgeToAgent, INTERCOM_BRIDGE_MARKER, resolveIntercomBridge, resolveIntercomSessionTarget, resolveSubagentIntercomTarget, type IntercomBridgeState } from "../../intercom/intercom-bridge.ts";
import { formatControlIntercomMessage, formatControlNoticeMessage, resolveControlConfig, shouldNotifyControlEvent } from "../shared/subagent-control.ts";
import { resolveTurnBudgetConfig } from "../shared/turn-budget.ts";
import { f
```