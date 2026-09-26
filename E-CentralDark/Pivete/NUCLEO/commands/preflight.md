# COMANDO - preflight.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\api\preflight.ts
**SHA:** 598607968dedab5f
**Timestamp:** 2026-08-28T02:24:51.651863
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let effectiveSystemPrompt = agent.systemPrompt?.trim() ?? "";
- effectiveSystemPrompt = effectiveSystemPrompt ? `${effectiveSystemPrompt}\n\n${skillInjection}` : skillInjection;
- if (memoryInjection) effectiveSystemPrompt = effectiveSystemPrompt ? `${effectiveSystemPrompt}\n\n${memoryInjection}` : memoryInjection;
- effectiveSystemPrompt = injectOutputPathSystemPrompt(effectiveSystemPrompt, outputPath, agent);
- effectiveSystemPrompt = appendTurnBudgetSystemPrompt(effectiveSystemPrompt, turnBudget);
- systemPrompt: effectiveSystemPrompt,

### Contratos
- | { ok: true; contract: SubagentLaunchContract }
- function digestContract(contract: Omit<SubagentLaunchContract, "digest">): string {
- return { ok: true, contract: { ...contractBase, digest: digestContract(contractBase) } };

### Gaps
- missing: string[];
- missing: resolvedSkills.missing,

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverAgents, discoverAgentsAll, findBlockingAgentDiagnostic, formatUnknownAgentError, resolveAgentName, unknownAgentDiagnosticContext, type AgentConfig, type AgentScope, type AgentSource } from "../agents/agents.ts";
import { resolveExecutionAgentScope } from "../agents/agent-scope.ts";
import { buildSkillInjection, normalizeSkillInput, resolveSkillsWithFallback } from "../agents/skills.ts";
import { buildAgentMemoryInjection } from "../agents/agent-memory.ts";
import { buildModelCandidates, inheritsParentModel, resolveEffectiveSubagentModel, type AvailableModelInfo, type ParentModel } from "../runs/shared/model-fallback.ts";
import { resolveModelScopesForAgent } from "../runs/shared/model-scope.ts";
import { applyThinkingSuffix, resolvePiLaunchToolPlan, type PiLaunchToolPlan } from "../runs/shared/pi-args.ts";
import { injectOutputPathSystemPrompt, normalizeSingleOutputOverride, resolveSingleOutputPath } from "../runs/shared/single-output.ts";
import { getArtifactPaths, getArtifactsDir } from "../shared/artifacts.ts";
import { resolveEffectiveThinking } from "../shared/model-info.ts";
import { assertThinkingWithinCeiling, decodeThinkingCeiling, intersectThinkingCeilings, SUBAGENT_THINKING_CEILING_ENV, type ThinkingLevel } from "../shared/thinking-ceiling.ts";
import { SUBAGENT_LIFECYCLE_ARTIFACT_VERSION, type ArtifactDirPreference, type ArtifactPaths, type JsonSchemaObject, type OutputMode } from "../shared/types.ts";
import { capabilityCeilingAgentRestrictionMessage, intersectSubagentCapabilityCeilings, type ResolvedSubagentCapabilityCeiling, type SubagentCapabilityAudit } from "../runs/shared/capability-ceiling.ts";
import { appendTurnBudgetSystemPrompt } from "../runs/shared/turn-budget.ts";
import { resolvePermissionRules } from "../runs/shared/permissions.ts";
import type { ResolvedTurnBudget } from "../shared/types.ts";
import type { ResolvedMcpDirectToolSelection } from "../runs/shared/mcp-direct-tool-allowlist.ts";
import { resolveStepBehavior } from "../shared/settings.ts";
import { canPreferForkFromSnapshot, resolveSubagentLaunchContext } from "../shared/fork-context.ts";
import { loadConfig } from "../extension/config.ts";
import { agentDefinitionDigest, AGENT_DEFINITION_PROJECTION_VERSION, launchBindingDigest, stableJsonDigest } from "../shared/launch-contract.ts";
import { DIRS, TEMP_ROOT_DIR } from "../shared/types.ts";
import { processTerminalCandidatePath, processTerminalPath } from "../runs/background/process-terminal.ts";
import { resultFilePath } from "../runs/background/result-files.ts";
import { nestedResultsPath } from "../runs/shared/nested-events.ts";
import { normalizeExtensionBindings, type ExtensionBindings } from "../runs/shared/extension-bindings.ts";

export const SUBAGENT_LAUNCH_CONTRACT_VERSION = 2 as const;

export type SubagentLaunchContractReasonCode =
	| "missing_agent"
	| "ambiguous_agent"
	| "missing_skill"
	| "denied_required_tool"
	| "invalid_artifact_dir"
	| "invalid_cwd"
	| "unsupported_mode"
	| "restricted_agent"
	| "thinking_ceiling"
	| "invalid_extension_bindings";

export interface SubagentLaunchContractDiagnostic {
	code: SubagentLaunchContractReasonCode | "host_required" | "snapshot_warning";
	severity: "error" | "warning" | "host-required";
	message: string;
}

export interface SubagentLaunchContractInput {
	agent: string;
	cwd: string;
	task?: string;
	agentScope?: AgentScope;
	context?: "fresh" | "fork";
	model?: string;
	fast?: boolean;
	thinking?: string | false;
	thinkingCeiling?: ThinkingLevel;
	inheritedThinkingCeiling?: ThinkingLevel;
	parentModel?: ParentModel;
	availableModels?: ReadonlyArray<AvailableModelInfo | { provider: string; id: string; fullId?: string; reasoning?: boolean }>;
	preferredProvider?: string;
	skill?: string | string[] | boolean;
	output?: string | boolean;
	outputMode?: OutputMode;
	outputSchema?: JsonSchemaObject;
	extensionBindings?: ExtensionBindings;
	turnBudget?: ResolvedTurnBudget;
	artifacts?: boolean;
	artifactDir?: ArtifactDirPreference;
	parentSessionFile?: string | null;
	/** Current parent leaf required before an implicit `defaultContext: fork` stays `fork`. */
	parentLeafId?: string | null;
	sessionRoot?: string;
	sessionDir?: string;
	runId?: string;
	/** Root run id supplied by a host when projecting nested async lifecycle paths. */
	nestedRootRunId?: string;
	capabilityCeiling?: ResolvedSubagentCapabilityCeiling;
	inheritedCapabilityCeiling?: ResolvedSubagentCapabilityCeiling;
}

export interface SubagentLaunchContractAgentCandidate {
	name: string;
	localName?: string;
	packageName?: string;
	source: AgentSource;
	filePath: string;
	disabled?: boolean;
	selected: boolean;
}

export interface SubagentLaunchContractAgent {
	name: string;
	localName?: string;
	packageName?: string;
	source: AgentSource;
	filePath: string;
	definitionProjectionVersion: typeof AGENT_DEFINITION_PROJECTION_VERSION;

```