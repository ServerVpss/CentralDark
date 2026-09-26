# AGENTE - runtime-agent-registry.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\agents\runtime-agent-registry.ts
**SHA:** 51debd76ce0acf18
**Timestamp:** 2026-08-28T02:24:51.493162
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: string;
- systemPrompt: validateString(definition.systemPrompt, "Runtime agent definition systemPrompt", MAX_SYSTEM_PROMPT_LENGTH),
- systemPrompt: definition.systemPrompt,

### Ouro Bruto (primeiros 5000 chars)
```
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { AcceptanceInput, AcceptanceRole, AgentRunnerConfig, OutputMode, ToolBudgetConfig, TurnBudgetConfig } from "../shared/types.ts";
import { CODE_OWNED_EXTERNAL_CLI_ADAPTER_LABEL, isCodeOwnedExternalCliAdapterId, parseExternalCliCapabilityNarrowing, validateCodeOwnedProfileRunner } from "../runs/shared/external-cli-contract.ts";
import { validateAcceptanceInput } from "../runs/shared/acceptance.ts";
import { validatePermissionRules, type PermissionRules } from "../runs/shared/permissions.ts";
import { validateToolBudgetConfig } from "../runs/shared/tool-budget.ts";
import { resolveTurnBudgetConfig } from "../runs/shared/turn-budget.ts";
import { BUILTIN_AGENT_NAMES } from "./builtin-names.ts";
import type { AgentConfig, AgentDefaultContext, AgentDiscoveryDiagnostic } from "./agents.ts";

export const RUNTIME_AGENT_REGISTRY_KEY = "pi-subagents.runtime-agents.v1";

const MAX_RUNTIME_AGENTS_PER_PI = 200;
const MAX_AGENT_NAME_LENGTH = 128;
const MAX_DESCRIPTION_LENGTH = 4_096;
const MAX_SYSTEM_PROMPT_LENGTH = 1024 * 1024;
const MAX_FIELD_STRING_LENGTH = 8_192;

export interface RuntimeAgentDefinition {
	description: string;
	systemPrompt: string;
	aliases?: readonly string[];
	tools?: readonly string[];
	mcpDirectTools?: readonly string[];
	model?: string;
	fallbackModels?: readonly string[];
	thinking?: string | false;
	systemPromptMode?: "append" | "replace";
	inheritProjectContext?: boolean;
	inheritSkills?: boolean;
	defaultContext?: AgentDefaultContext;
	defaultAsync?: boolean;
	defaultTimeoutMs?: number;
	defaultToolTimeoutMs?: number;
	defaultTurnBudget?: TurnBudgetConfig;
	defaultAcceptance?: AcceptanceInput;
	acceptanceRole?: AcceptanceRole;
	runner?: AgentRunnerConfig;
	skills?: readonly string[];
	skillPath?: readonly string[];
	extensions?: readonly string[];
	subagentOnlyExtensions?: readonly string[];
	output?: string;
	outputMode?: OutputMode;
	defaultReads?: readonly string[];
	defaultProgress?: boolean;
	interactive?: boolean;
	maxSubagentDepth?: number;
	completionGuard?: boolean;
	toolBudget?: ToolBudgetConfig;
	permissions?: PermissionRules;
}

export interface RegisterRuntimeAgentInput {
	pi: ExtensionAPI;
	name: string;
	definition: RuntimeAgentDefinition;
}

export interface RuntimeAgentRegistration {
	dispose(): void;
}

interface RuntimeAgentRecord {
	pi: ExtensionAPI;
	agent: AgentConfig;
}

interface RuntimeAgentRegistry {
	version: 1;
	byPi: WeakMap<ExtensionAPI, RuntimeAgentRecord[]>;
}

export type RuntimeAgentOwner = ExtensionAPI;

function defaultSystemPromptMode(name: string): "append" | "replace" {
	return name === "delegate" ? "append" : "replace";
}

function defaultInheritProjectContext(name: string): boolean {
	return name === "delegate";
}

function defaultInheritSkills(): boolean {
	return false;
}

function registry(): RuntimeAgentRegistry {
	const key = Symbol.for(RUNTIME_AGENT_REGISTRY_KEY);
	const globalObject = globalThis as Record<PropertyKey, unknown>;
	const existing = globalObject[key];
	if (existing === undefined) {
		const created: RuntimeAgentRegistry = { version: 1, byPi: new WeakMap() };
		globalObject[key] = created;
		return created;
	}
	if (!existing || typeof existing !== "object" || Array.isArray(existing)) {
		throw new Error(`Malformed runtime agent registry at Symbol.for("${RUNTIME_AGENT_REGISTRY_KEY}").`);
	}
	const candidate = existing as Partial<RuntimeAgentRegistry>;
	if (candidate.version !== 1 || !(candidate.byPi instanceof WeakMap)) {
		throw new Error(`Unsupported runtime agent registry at Symbol.for("${RUNTIME_AGENT_REGISTRY_KEY}").`);
	}
	return candidate as RuntimeAgentRegistry;
}

function validatePi(value: unknown): ExtensionAPI {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Runtime agent pi must be an ExtensionAPI object.");
	const pi = value as Partial<ExtensionAPI>;
	if (typeof pi.on !== "function" || typeof pi.registerTool !== "function") throw new Error("Runtime agent pi must be an ExtensionAPI object.");
	return value as ExtensionAPI;
}

function validateString(value: unknown, field: string, maxLength: number): string {
	if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
		throw new Error(`${field} must be a non-empty string without leading or trailing whitespace.`);
	}
	if (value.length > maxLength) throw new Error(`${field} must be at most ${maxLength} characters.`);
	if (value.includes("\0")) throw new Error(`${field} must not contain NUL characters.`);
	return value;
}

function validateOptionalString(value: unknown, field: string, maxLength = MAX_FIELD_STRING_LENGTH): string | undefined {
	if (value === undefined) return undefined;
	return validateString(value, field, maxLength);
}

function validateStringList(value: unknown, field: string): string[] | undefined {
	if (value === undefined) return undefined;
	if (!Array.isArray(value)) throw new Error(`${field} must be an array of st
```