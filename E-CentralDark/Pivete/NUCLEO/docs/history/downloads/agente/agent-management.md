# AGENTE - agent-management.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\agents\agent-management.ts
**SHA:** edced42625a641cd
**Timestamp:** 2026-08-28T02:24:51.025897
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: _systemPrompt,
- systemPrompt: base.systemPrompt,
- if (cfg.systemPrompt === false || cfg.systemPrompt === "") target.systemPrompt = "";
- else if (typeof cfg.systemPrompt === "string") target.systemPrompt = cfg.systemPrompt;
- if (agent.systemPrompt.trim()) lines.push("", "System Prompt:", agent.systemPrompt);
- systemPrompt: "",

### Gaps
- const missing = fallbackModels.filter((model) => !available.has(model));

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentToolResult } from "@earendil-works/pi-agent-core";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	type AgentConfig,
	type AgentDiscoveryDiagnostic,
	type AgentScope,
	type AgentSource,
	BUILTIN_AGENT_NAMES,
	defaultInheritProjectContext,
	defaultInheritSkills,
	defaultSystemPromptMode,
	discoverAgentsAll,
	buildRuntimeName,
	findBlockingAgentDiagnostic,
	frontmatterNameForConfig,
	parsePackageName,
	mergeBuiltinAgentOverride,
	removeBuiltinAgentOverride,
	removeBuiltinAgentOverrideFields,
	resolveAgentName,
} from "./agents.ts";
import { serializeAgent } from "./agent-serializer.ts";
import { mergeAgentsForScope } from "./agent-selection.ts";
import { discoverAvailableSkills, resolveSkills } from "./skills.ts";
import {
	buildProactiveSkillSubagentRecommendationLines,
} from "./proactive-skills.ts";
import { parseFrontmatter, parseFrontmatterList } from "./frontmatter.ts";
import { toModelInfo } from "../shared/model-info.ts";
import { resolveSubagentModelOverride, type ParentModel } from "../runs/shared/model-fallback.ts";
import { validateToolBudgetConfig } from "../runs/shared/tool-budget.ts";
import { resolveTurnBudgetConfig } from "../runs/shared/turn-budget.ts";
import { validateAcceptanceInput } from "../runs/shared/acceptance.ts";
import { CODE_OWNED_EXTERNAL_CLI_ADAPTER_LABEL, isCodeOwnedExternalCliAdapterId, validateCodeOwnedProfileRunner } from "../runs/shared/external-cli-contract.ts";
import type { AcceptanceInput, Details, ExtensionConfig, ToolBudgetConfig } from "../shared/types.ts";
import { getProjectConfigDir } from "../shared/utils.ts";
import { capabilityCeilingAgentRestrictionSources, isAgentAllowedByCapabilityCeiling, resolveCurrentSubagentCapabilityCeiling } from "../runs/shared/capability-ceiling.ts";
import { listRuntimeAgentConfigs, mergeRuntimeAgents, type RuntimeAgentOwner } from "./runtime-agent-registry.ts";
import { listExternalJobProviders } from "../api/external-job-provider.ts";

type ManagementAction = "list" | "get" | "models" | "create" | "update" | "delete" | "eject" | "disable" | "enable" | "reset";
type ManagementScope = "user" | "project";
type ManagementContext = Pick<ExtensionContext, "cwd" | "modelRegistry"> & { model?: ExtensionContext["model"]; config?: ExtensionConfig; currentSessionId?: string; runtimeAgentOwner?: RuntimeAgentOwner };

interface ManagementParams {
	action?: string;
	agent?: string;
	agentScope?: unknown;
	config?: unknown;
}

function result(text: string, isError = false): AgentToolResult<Details> {
	return { content: [{ type: "text", text }], isError, details: { mode: "management", results: [] } };
}

function parseCsv(value: string): string[] {
	return [...new Set(value.split(",").map((v) => v.trim()).filter(Boolean))];
}

type ConfigObjectResult =
	| { status: "ok"; value: Record<string, unknown> }
	| { status: "missing" }
	| { status: "error"; message: string };

function configObject(config: unknown): ConfigObjectResult {
	let val = config;
	if (typeof val === "string") {
		try {
			val = JSON.parse(val);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return { status: "error", message: `config must be valid JSON: ${message}` };
		}
	}
	if (!val || typeof val !== "object" || Array.isArray(val)) return { status: "missing" };
	return { status: "ok", value: val as Record<string, unknown> };
}

function hasKey(obj: Record<string, unknown>, key: string): boolean {
	return Object.prototype.hasOwnProperty.call(obj, key);
}

function isJsonSerializable(value: unknown): boolean {
	if (value === null || typeof value === "string" || typeof value === "boolean") return true;
	if (typeof value === "number") return Number.isFinite(value);
	if (Array.isArray(value)) return value.every(isJsonSerializable);
	if (value && typeof value === "object") return Object.values(value).every(isJsonSerializable);
	return false;
}

function asDisambiguationScope(scope: unknown): ManagementScope | undefined {
	if (scope === "user" || scope === "project") return scope;
	return undefined;
}

function actionScope(scope: unknown, action: ManagementAction): { scope?: ManagementScope; error?: AgentToolResult<Details> } {
	if (scope === undefined) return { scope: "user" };
	const parsed = asDisambiguationScope(scope);
	return parsed ? { scope: parsed } : { error: result(`agentScope must be 'user' or 'project' for ${action}.`, true) };
}

function normalizeListScope(scope: unknown): AgentScope | undefined {
	if (scope === undefined) return "both";
	if (scope === "user" || scope === "project" || scope === "both") return scope;
	return undefined;
}

function sanitizeName(name: string): string {
	return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function parsePackageConfig(value: unknown): { packageName?: string; error?: string } {
	re
```