# AGENTE - subagents-admin.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\slash\subagents-admin.ts
**SHA:** 0f0d647a4408b3d4
**Timestamp:** 2026-08-28T02:24:59.598484
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- systemPrompt: agent.systemPrompt,
- if (agent.systemPrompt.trim()) lines.push("", "System Prompt:", agent.systemPrompt);
- async function saveAgentSystemPrompt(ctx: ExtensionContext, agent: AgentConfig, systemPrompt: string): Promise<string | null> {
- const nextPrompt = systemPrompt.replace(/\s+$/, "");
- const updated: AgentConfig = { ...editableAgentConfig(agent), systemPrompt: nextPrompt };
- preserveFrontmatterFields: preservedAgentFrontmatterFields(agent, { systemPrompt: nextPrompt }),

### Ouro Bruto (primeiros 5000 chars)
```
import * as fs from "node:fs";
import * as path from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	agentHasFrontmatterField,
	discoverAgentsAll,
	EXTRA_AGENT_DIRS_ENV,
	frontmatterNameForConfig,
	mergeBuiltinAgentOverride,
	removeBuiltinAgentOverrideFields,
	type AgentConfig,
	type BuiltinAgentOverrideBase,
} from "../agents/agents.ts";
import { serializeAgent } from "../agents/agent-serializer.ts";
import { editableAgentConfig, preservedAgentFrontmatterFields } from "../agents/agent-management.ts";
import { findModelInfo, getSupportedThinkingLevels, toModelInfo } from "../shared/model-info.ts";
import { SelectorComponent, type SelectorItem, type SelectorResult } from "./selector.ts";

const ADMIN_MESSAGE_TYPE = "subagents-admin";
const INHERIT_MODEL_CHOICE = "Default / inherit session model";
const INHERIT_THINKING_CHOICE = "Default / inherit session thinking";

type ModelInfo = { provider: string; id: string };

function sourceRank(source: AgentConfig["source"]): number {
	if (source === "project") return 0;
	if (source === "user") return 1;
	if (source === "package") return 2;
	return 3;
}

function allVisibleAgents(cwd: string): AgentConfig[] {
	const d = discoverAgentsAll(cwd);
	return [...d.project, ...d.user, ...d.package, ...d.builtin]
		.filter((agent) => !agent.disabled)
		.sort((a, b) => a.name.localeCompare(b.name) || sourceRank(a.source) - sourceRank(b.source));
}

function agentLabel(agent: AgentConfig): string {
	const model = agent.model ? ` · ${agent.model}` : "";
	return `${agent.name} [${agent.source}]${model} — ${agent.description}`;
}

function agentChoices(agents: AgentConfig[]): Map<string, AgentConfig> {
	const labels = agents.map(agentLabel);
	const counts = new Map<string, number>();
	for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
	return new Map(agents.map((agent, index) => {
		const label = labels[index]!;
		return [counts.get(label) === 1 ? label : `${label} · ${agent.filePath}`, agent] as const;
	}));
}

function agentSelectItems(byLabel: Map<string, AgentConfig>): SelectorItem[] {
	return [...byLabel.keys()].map((label) => ({ value: label, label }));
}

function agentMatches(agent: AgentConfig, rawName: string): boolean {
	const name = rawName.trim();
	return agent.name === name || frontmatterNameForConfig(agent) === name;
}

function sendAdminMessage(pi: ExtensionAPI, content: string): void {
	pi.sendMessage({
		customType: ADMIN_MESSAGE_TYPE,
		content,
		display: true,
	});
}

function modelFullId(model: ModelInfo): string {
	return `${model.provider}/${model.id}`;
}

function liveAvailableModels(ctx: ExtensionContext) {
	try {
		ctx.modelRegistry.refresh?.();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		ctx.ui.notify(`Could not refresh the model registry; using the last loaded choices. ${message}`, "warning");
	}
	return ctx.modelRegistry.getAvailable();
}

function buildBuiltinBase(agent: AgentConfig): BuiltinAgentOverrideBase {
	return {
		...(agent.model !== undefined ? { model: agent.model } : {}),
		...(agent.fallbackModels !== undefined ? { fallbackModels: [...agent.fallbackModels] } : {}),
		...(agent.thinking !== undefined ? { thinking: agent.thinking } : {}),
		systemPromptMode: agent.systemPromptMode,
		inheritProjectContext: agent.inheritProjectContext,
		inheritSkills: agent.inheritSkills,
		...(agent.defaultContext !== undefined ? { defaultContext: agent.defaultContext } : {}),
		...(agent.acceptanceRole !== undefined ? { acceptanceRole: agent.acceptanceRole } : {}),
		...(agent.disabled !== undefined ? { disabled: agent.disabled } : {}),
		systemPrompt: agent.systemPrompt,
		...(agent.skills !== undefined ? { skills: [...agent.skills] } : {}),
		...(agent.tools !== undefined ? { tools: [...agent.tools] } : {}),
		...(agent.mcpDirectTools !== undefined ? { mcpDirectTools: [...agent.mcpDirectTools] } : {}),
		...(agent.subagentOnlyExtensions !== undefined ? { subagentOnlyExtensions: [...agent.subagentOnlyExtensions] } : {}),
		...(agent.completionGuard !== undefined ? { completionGuard: agent.completionGuard } : {}),
		...(agent.toolBudget !== undefined ? { toolBudget: agent.toolBudget } : {}),
	};
}

type EditableOverrideField = "model" | "thinking" | "systemPrompt";

type AgentSelection =
	| { kind: "selected"; agent: AgentConfig }
	| { kind: "cancelled" }
	| { kind: "not-found"; agents: AgentConfig[]; requestedName?: string }
	| { kind: "ambiguous"; requestedName: string; matches: AgentConfig[] };

function savesThroughSettings(agent: AgentConfig, field: EditableOverrideField): boolean {
	if (agent.source === "builtin") return true;
	if (agent.source === "package") {
		if (field === "systemPrompt") return false;
		return !agentHasFrontmatterField(agent, field);
	}
	if (!agent.override) return false;
	// A lower-scope override can flow into a higher-scope custom agent with the
	// same name. Persist that agent's edits
```