# COMANDO - execution.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\runs\foreground\execution.ts
**SHA:** 20b72f8f31f5f760
**Timestamp:** 2026-08-28T02:24:55.655239
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: string;
- systemPrompt: appendTurnBudgetSystemPrompt(shared.systemPrompt, options.turnBudget),
- const effectiveSystemPrompt = appendTurnBudgetSystemPrompt(shared.systemPrompt, options.turnBudget);
- systemPrompt: effectiveSystemPrompt,
- const acceptancePrompt = formatAcceptancePrompt(effectiveAcceptance, { reportOptional: isAgentContractV1(options.agentContract), structuredOutput: Boolean(options.structuredOutput?.acceptanceReportPat
- let systemPrompt = agent.systemPrompt?.trim() || "";
- systemPrompt = systemPrompt ? `${systemPrompt}\n\n${skillInjection}` : skillInjection;
- systemPrompt = systemPrompt ? `${systemPrompt}\n\n${memoryInjection}` : memoryInjection;
- systemPrompt = appendAgentRefinementOverlay(systemPrompt, { cwd: skillCwd, agentName });
- systemPrompt = injectOutputPathSystemPrompt(systemPrompt, options.outputPath, agent);

### Contratos
- agentContract: target.agentContract,
- ...(options.agentContract ? { agentContract: options.agentContract } : {}),
- agentContract: options.agentContract,
- // Preserve the legacy intercom handoff contract: once this logical run has
- const strictContract = isAgentContractV1(options.agentContract);
- publishedReceipt.agentContract = strictContract ? { version: 1 } : undefined;
- callerReceipt.agentContract = strictContract ? { version: 1 } : undefined;

### Gaps
- const { resolved: resolvedSkills, missing: missingSkills } = resolveSkillsWithFallback(

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Core execution logic for running subagents
 */

import { spawn } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import * as path from "node:path";
import type { Message } from "@earendil-works/pi-ai";
import { discoverAgents, formatUnknownAgentError, unknownAgentDiagnosticContext, type AgentConfig } from "../../agents/agents.ts";
import { appendAgentRefinementOverlay } from "../../agents/agent-refinements.ts";
import { alignForkedSessionCwd } from "../../shared/fork-context.ts";
import {
	ensureArtifactsDir,
	formatOutputArtifactContent,
	getArtifactPaths,
	writeArtifact,
	writeMetadata,
} from "../../shared/artifacts.ts";
import { createChildTranscriptWriter, type ChildTranscriptWriter } from "../../shared/child-transcript.ts";
import {
	type AgentProgress,
	type ArtifactPaths,
	type ControlEvent,
	type ModelAttempt,
	type RunSyncOptions,
	type SingleResult,
	type Usage,
	DEFAULT_MAX_OUTPUT,
	INTERCOM_DETACH_REQUEST_EVENT,
	INTERCOM_DETACH_RESPONSE_EVENT,
	type AcceptanceLedger,
	type ResolvedAcceptanceConfig,
	truncateOutput,
	getSubagentDepthEnv,
} from "../../shared/types.ts";
import {
	DEFAULT_CONTROL_CONFIG,
	buildControlEvent,
	claimControlNotification,
	deriveActivityState,
	shouldEmitOpenToolAttention,
	shouldNotifyControlEvent,
} from "../shared/subagent-control.ts";
import {
	getFinalOutput,
	findLatestSessionFile,
	detectSubagentError,
	hasEmptyTerminalAssistantResponse,
	extractToolArgsPreview,
	extractTextFromContent,
	boundStreamedRecentTools,
	boundStreamedRecentOutput,
	boundStreamedToolCalls,
} from "../../shared/utils.ts";
import { buildSkillInjection, resolveSkillsWithFallback } from "../../agents/skills.ts";
import { buildAgentMemoryInjection } from "../../agents/agent-memory.ts";
import { effectiveToolTimeoutMs, formatToolTimeoutMessage, resolveToolTimeoutMs, toolTimeoutCallKey, toolTimeoutFromEnv } from "../shared/tool-timeout.ts";
import { evaluateCompletionMutationGuard, validateImplementationToolContract } from "../shared/completion-guard.ts";
import { arbitrateCompletionGuardRescue } from "../shared/llm-intent-arbiter.ts";
import { getPiSpawnCommand } from "../shared/pi-spawn.ts";
import { createJsonlWriter } from "../../shared/jsonl-writer.ts";
import { createOrcaProgressTab, type OrcaProgressTab } from "../shared/orca-progress-tabs.ts";
import { attachPostExitStdioGuard, trySignalChild } from "../../shared/post-exit-stdio-guard.ts";
import { resolvePermissionRules } from "../shared/permissions.ts";
import { applyThinkingSuffix, buildPiArgs, cleanupTempDir, projectLaunchResolvedChildExtensions, resolvePiLaunchToolPlan, type SubagentTaskDelivery } from "../shared/pi-args.ts";
import { readRuntimeAcknowledgedExtensions } from "../shared/runtime-acknowledged-extensions.ts";
import { assertAgentAllowedByCapabilityCeiling, decodeSubagentCapabilityCeiling, intersectSubagentCapabilityCeilings, resolveCurrentSubagentCapabilityCeiling, SUBAGENT_CAPABILITY_CEILING_ENV } from "../shared/capability-ceiling.ts";
import { resolveEffectiveThinking } from "../../shared/model-info.ts";
import { assertThinkingWithinCeiling, decodeThinkingCeiling, intersectThinkingCeilings, SUBAGENT_THINKING_CEILING_ENV } from "../../shared/thinking-ceiling.ts";
import { MISSING_STRUCTURED_OUTPUT_CALL_ERROR, readStructuredOutput, readStructuredOutputAcceptanceReport } from "../shared/structured-output.ts";
import { formatMidToolExitError, formatProcessSignalError, isOrdinaryToolForMidToolExit, isUnexplainedProcessSignal } from "../shared/process-signal.ts";
import { readChildToolDiagnosticError } from "../shared/tool-availability.ts";
import { buildTimeoutRecoverySummary, collectTrackedMutationEvidence, snapshotTrackedMutations } from "../shared/mutation-evidence.ts";
import { captureSingleOutputSnapshot, extractChildWrittenOutput, finalizeSingleOutput, formatSavedOutputReference, injectOutputPathSystemPrompt, resolveSingleOutput, validateFileOnlyOutputMode, type SingleOutputSnapshot } from "../shared/single-output.ts";
import {
	buildModelCandidates,
	formatSubagentModelVerificationError,
	formatModelAttemptNote,
	isContextOverflow,
	isRetryableModelFailureAttempt,
	recordRetryableModelFailure,
} from "../shared/model-fallback.ts";
import {
	SUBAGENT_STARTUP_RETRY_DELAYS_MS,
	formatSubagentExtensionConflictError,
	formatSubagentStartupRetryExhaustedError,
	formatSubagentStartupRetryNote,
	isRetryableSubagentStartupFailure,
	waitForSubagentStartupRetry,
} from "../shared/subagent-startup-retry.ts";
import {
	createMutatingFailureState,
	didMutatingToolFail,
	isMutatingTool,
	nextLongRunningTrigger,
	recordMutatingFailure,
	resetMutatingFailureState,
	resolveCurrentPath,
	shouldEscalateMutatingFailures,
	summarizeRecentMutatingFailures,
} from "../shared/long-running-guard.ts";
import { acceptanceFailureMessage, buildSkippedAcceptanceLedger, evaluateAcceptance, formatAcceptancePrompt, resolveEffectiveAcceptance, stripAcceptanceReport, validateAcceptanceInput } from "../shared/acc
```