# AGENTE - subagent-runner.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\background\subagent-runner.ts
**SHA:** 8a4d9643862bb7fd
**Timestamp:** 2026-08-28T02:24:55.723979
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const acceptancePrompt = formatAcceptancePrompt(step.effectiveAcceptance, { reportOptional: isAgentContractV1(step.agentContract), structuredOutput: Boolean(step.structuredOutput?.acceptanceReportPath
- prompt: buildExternalCliPrompt(step.systemPrompt ?? "", task),
- prompt: buildExternalCliPrompt(step.systemPrompt ?? "", task),
- systemPrompt: appendTurnBudgetSystemPrompt(step.systemPrompt ?? "", ctx.turnBudget),
- systemPrompt: appendTurnBudgetSystemPrompt(step.systemPrompt ?? "", ctx.turnBudget),
- const run = await runPiStreaming(
- const acceptanceCanFailRun = acceptanceFailure && effectiveAcceptance?.explicit && (finalResult?.exitCode ?? 1) === 0 && !finalResult?.interrupted && !timedOutAfterAcceptance && !stoppedAfterAcceptanc
- ): { taskForRun: SubagentStep; taskCwd: string } {
- if (!worktreeSetup) return { taskForRun: task, taskCwd: cwd };
- const parallelGroups: Array<{ start: number; count: number; stepIndex: number }> = [];

### Contratos
- finalResult = { ...run, exitCode: effectiveExitCode, model: candidate ?? run.model, error, structuredOutput, runtimeAcknowledgedExtensions, ...(step.agentContract ? { agentContract: step.agentContract
- ...(step.agentContract ? { agentContract: step.agentContract } : {}),
- ...(task.agentContract ? { agentContract: task.agentContract } : {}),
- ...(step.agentContract ? { agentContract: step.agentContract } : {}),
- ...(step.agentContract ? { agentContract: step.agentContract } : {}),
- agentContract: step.agentContract,
- agentContract: step.parallel.agentContract ?? step.agentContract,
- ...(task.agentContract ? { agentContract: task.agentContract } : {}),
- agentContract: pr.agentContract,
- agentContract: pr.agentContract,

### Riscos
- ? { cleanupBlocker: "retained child resume requires managed worktree cwd" }

### Ouro Bruto (primeiros 5000 chars)
```
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import type { Message } from "@earendil-works/pi-ai";
import { writeAtomicJson } from "../../shared/atomic-json.ts";
import { writeAsyncResultFile, writePendingAsyncResultFile } from "./result-files.ts";
import { createFileCoalescer } from "../../shared/file-coalescer.ts";
import { createCapacityResilientJsonWriter } from "../../shared/capacity-resilient-json.ts";
import { isStorageCapacityError } from "../../shared/file-system-retry.ts";
import { updateActiveRunIndex } from "./active-run-index.ts";
import { createChildTranscriptWriter, type ChildTranscriptWriter } from "../../shared/child-transcript.ts";
import { closeSteerInbox, consumeInterruptRequest, consumeSteerRequests, deliverInterruptRequest, deliverStopRequest, deliverTimeoutRequest, enqueueStepSteer, steerAcksDir, steerCapabilityPath, stepSteerInboxDir, watchAsyncControlInbox, type SteerAck, type SteerCapability, type SteerRequest, type StopRequest } from "./control-channel.ts";
import { appendJsonl as appendRawJsonl, formatOutputArtifactContent, getArtifactPaths, writeArtifact, writeMetadata } from "../../shared/artifacts.ts";
import { PI_CODING_AGENT_PACKAGE, getPiSpawnCommand, resolveInstalledPiPackageRoot } from "../shared/pi-spawn.ts";
import { captureSingleOutputSnapshot, extractChildWrittenOutput, finalizeSingleOutput, formatSavedOutputReference, injectOutputPathSystemPrompt, injectSingleOutputInstruction, resolveSingleOutput, type SingleOutputSnapshot } from "../shared/single-output.ts";
import {
	type ActivityState,
	type ArtifactConfig,
	type ExternalCliRunnerStatus,
	type ExternalJobRunnerStatus,
	type ExternalJobStatus,
	type ExternalProcessStatus,
	type ArtifactPaths,
	type AsyncParallelGroupStatus,
	type AsyncStatus,
	type ChainOutputMap,
	type CostSummary,
	type LaunchResolvedChildExtensionsV1,
	type RuntimeAcknowledgedChildExtensionsV1,
	type ModelAttempt,
	type PiWriterProcessInstanceExitV1,
	type ProcessTreeTerminalV1,
	type NestedRouteInfo,
	type NestedRunSummary,
	type ResolvedControlConfig,
	type ResolvedTurnBudget,
	type ResolvedToolBudget,
	type RunFanoutBudgetDescriptor,
	type SubagentRunMode,
	type SubagentOutputState,
	type UsageBudgetConfig,
	type ToolBudgetState,
	type TurnBudgetState,
	type Usage,
	type WorkflowGraphSnapshot,
	type SteeringStatus,
	type SteeringTargetState,
	type SteeringTargetStatus,
	type SubagentChildStatusEvent,
	DEFAULT_MAX_OUTPUT,
	type MaxOutputConfig,
	SUBAGENT_LIFECYCLE_ARTIFACT_VERSION,
	POLL_INTERVAL_MS,
	truncateOutput,
	getSubagentDepthEnv,
} from "../../shared/types.ts";
import {
	DEFAULT_CONTROL_CONFIG,
	buildControlEvent,
	deriveActivityState,
	claimControlNotification,
	formatControlIntercomMessage,
	formatControlNoticeMessage,
	shouldEmitOpenToolAttention,
} from "../shared/subagent-control.ts";
import {
	type RunnerSubagentStep as SubagentStep,
	type RunnerStep,
	isDynamicRunnerGroup,
	isParallelGroup,
	flattenSteps,
	mapConcurrent,
	aggregateParallelOutputs,
	MAX_PARALLEL_CONCURRENCY,
	DEFAULT_GLOBAL_CONCURRENCY_LIMIT,
	Semaphore,
} from "../shared/parallel-utils.ts";
import { applyThinkingSuffix, buildPiArgs, cleanupTempDir, projectLaunchResolvedChildExtensions, resolvePiLaunchToolPlan, type SubagentTaskDelivery } from "../shared/pi-args.ts";
import { readRuntimeAcknowledgedExtensions } from "../shared/runtime-acknowledged-extensions.ts";
import { outputEntryFromAsyncResult, resolveOutputReferences } from "../shared/chain-outputs.ts";
import { createStructuredOutputRuntime, MISSING_STRUCTURED_OUTPUT_CALL_ERROR, readStructuredOutput, readStructuredOutputAcceptanceReport } from "../shared/structured-output.ts";
import { formatMidToolExitError, formatProcessSignalError, isOrdinaryToolForMidToolExit, isUnexplainedProcessSignal } from "../shared/process-signal.ts";
import { readChildToolDiagnosticError } from "../shared/tool-availability.ts";
import { buildTimeoutRecoverySummary, collectTrackedMutationEvidence, snapshotTrackedMutations } from "../shared/mutation-evidence.ts";
import { collectDynamicResults, DynamicFanoutError, materializeDynamicParallelStep, validateDynamicCollection } from "../shared/dynamic-fanout.ts";
import { claimRunFanoutBatch, getRunFanoutBudgetSnapshot } from "../shared/run-fanout-budget.ts";
import { nestedSummaryFromAsyncStatus, projectNestedEvents, resolveNestedAsyncDir, writeNestedEvent } from "../shared/nested-events.ts";
import { formatModelAttemptNote, formatSubagentModelVerificationError, isContextOverflow, isRetryableModelFailureAttempt, recordRetryableModelFailure } from "../shared/model-fallback.ts";
import {
	SUBAGENT_STARTUP_RETRY_DELAYS_MS,
	formatSubagentExtensionConflictError,
	formatSubagentStartupRetryExhaustedError,
	formatSubagentStartupRetryNote,
	isRetryableSubagentStartupFailure,
	waitForSubagentStartupRetry,
} from "../shared/subagent-s
```